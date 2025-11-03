from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from fastapi.responses import StreamingResponse, JSONResponse
from pydantic import BaseModel, HttpUrl, EmailStr, Field
from typing import List, Optional, Dict
import databutton as db
import asyncpg
from app.auth import AuthorizedUser
from uuid import UUID
from datetime import date
import io
import re
import time

router = APIRouter()

# Helper to create a safe filename for storage
def _sanitize_filename(filename: str) -> str:
    # Prepend timestamp to ensure uniqueness
    timestamp = int(time.time())
    # Keep only safe characters
    sanitized = re.sub(r"[^a-zA-Z0-9._-]", "", filename)
    return f"{timestamp}_{sanitized}"

# Pydantic Models
class Link(BaseModel):
    id: Optional[UUID] = None
    link_type: str
    url: str

class WorkExperience(BaseModel):
    id: Optional[UUID] = None
    company_name: str
    role: str
    start_date: date
    end_date: Optional[date] = None
    description: Optional[str] = None

class Education(BaseModel):
    id: Optional[UUID] = None
    institution_name: str
    degree: str
    field_of_study: str
    start_date: date
    end_date: Optional[date] = None
    description: Optional[str] = None

class Media(BaseModel):
    id: Optional[UUID] = None
    media_type: str
    url: str
    title: Optional[str] = None
    description: Optional[str] = None

class CodeSnippet(BaseModel):
    id: Optional[UUID] = None
    title: str
    code: str
    language: str

class ProfileData(BaseModel):
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    bio: Optional[str] = None
    elevator_pitch: Optional[str] = None
    business_email: Optional[str] = None
    phone_number: Optional[str] = None
    links: Optional[List[Link]] = []
    work_experiences: Optional[List[WorkExperience]] = []
    educations: Optional[List[Education]] = []
    media: Optional[List[Media]] = []
    code_snippets: Optional[List[CodeSnippet]] = []

class ProfileResponse(ProfileData):
    id: UUID
    user_id: UUID

class PublicProfile(BaseModel):
    user_id: UUID
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    bio: Optional[str] = None
    elevator_pitch: Optional[str] = None

class HealthCheckResponse(BaseModel):
    profile_exists: bool


async def get_db_connection():
    conn = await asyncpg.connect(db.secrets.get("DATABASE_URL_DEV"))
    try:
        yield conn
    finally:
        await conn.close()

@router.post("/profile/picture", response_model=ProfileResponse)
async def upload_profile_picture(
    file: UploadFile,
    user: AuthorizedUser,
    conn: asyncpg.Connection = Depends(get_db_connection),
):
    user_id = user.sub
    profile_row = await conn.fetchrow("SELECT id FROM profiles WHERE user_id = $1", user_id)
    if not profile_row:
        raise HTTPException(status_code=404, detail="Profile not found. Please create a profile first.")
    
    profile_id = profile_row['id']

    # Generate a unique, valid key for storage and save the file
    storage_key = f"profile-pictures_{user_id}"
    file_content = await file.read()
    
    db.storage.binary.put(storage_key, file_content)

    await conn.execute(
        "UPDATE profiles SET profile_picture_key = $1, profile_picture_content_type = $2 WHERE id = $3",
        storage_key,
        file.content_type,
        profile_id,
    )

    return await get_profile_by_user_id(user_id, conn)

@router.get("/profiles/{user_id}/picture", tags=["stream"])
async def get_profile_picture(
    user_id: UUID,
    conn: asyncpg.Connection = Depends(get_db_connection)
):
    """
    Public endpoint to retrieve a user's profile picture.
    """
    profile_row = await conn.fetchrow(
        "SELECT profile_picture_key, profile_picture_content_type FROM profiles WHERE user_id = $1",
        user_id
    )
    if not profile_row or not profile_row['profile_picture_key']:
        raise HTTPException(status_code=404, detail="Profile picture not found.")

    storage_key = profile_row['profile_picture_key']
    content_type = profile_row['profile_picture_content_type']

    try:
        file_content = db.storage.binary.get(storage_key)
        return StreamingResponse(io.BytesIO(file_content), media_type=content_type)
    except Exception as e:
        print(f"Error retrieving file from storage: {e}")
        raise HTTPException(status_code=500, detail="Could not retrieve profile picture.")


@router.post("/profile/media", response_model=ProfileResponse)
async def upload_gallery_media(
    file: UploadFile,
    user: AuthorizedUser,
    title: Optional[str] = None,
    description: Optional[str] = None,
    conn: asyncpg.Connection = Depends(get_db_connection),
):
    user_id = user.sub
    profile_row = await conn.fetchrow("SELECT id FROM profiles WHERE user_id = $1", user_id)
    if not profile_row:
        raise HTTPException(status_code=404, detail="Profile not found. Please create a profile first.")
    
    profile_id = profile_row['id']

    # Sanitize filename and upload to databutton storage
    safe_filename = _sanitize_filename(file.filename)
    file_content = await file.read()
    
    static_asset = await db.static_assets.upload_from_bytes(data=file_content, name=safe_filename)
    media_url = static_asset.url

    await conn.execute(
        "INSERT INTO media (profile_id, media_type, url, title, description) VALUES ($1, $2, $3, $4, $5)",
        profile_id,
        "image",
        media_url,
        title,
        description
    )

    return await get_profile_by_user_id(user_id, conn)


@router.post("/profile", status_code=200)
async def create_or_update_profile(
    profile_data: ProfileData,
    user: AuthorizedUser,
    conn: asyncpg.Connection = Depends(get_db_connection),
):
    user_id = user.sub
    status_code = 200

    async with conn.transaction():
        # Check if profile exists
        profile_row = await conn.fetchrow("SELECT id FROM profiles WHERE user_id = $1", user_id)

        if profile_row:
            # Update existing profile
            profile_id = profile_row['id']
            await conn.execute(
                """
                UPDATE profiles
                SET first_name = $1, last_name = $2, bio = $3, elevator_pitch = $4,
                    business_email = $5, phone_number = $6
                WHERE id = $7
                """,
                profile_data.first_name, profile_data.last_name, profile_data.bio,
                profile_data.elevator_pitch, profile_data.business_email,
                profile_data.phone_number, profile_id
            )
            # Clear existing sub-records
            await conn.execute("DELETE FROM links WHERE profile_id = $1", profile_id)
            await conn.execute("DELETE FROM work_experiences WHERE profile_id = $1", profile_id)
            await conn.execute("DELETE FROM educations WHERE profile_id = $1", profile_id)
            await conn.execute("DELETE FROM media WHERE profile_id = $1", profile_id)
            await conn.execute("DELETE FROM code_snippets WHERE profile_id = $1", profile_id)
        else:
            # Create new profile
            status_code = 201
            profile_id = await conn.fetchval(
                """
                INSERT INTO profiles (user_id, first_name, last_name, bio, elevator_pitch, business_email, phone_number)
                VALUES ($1, $2, $3, $4, $5, $6, $7)
                RETURNING id
                """,
                user_id, profile_data.first_name, profile_data.last_name, profile_data.bio,
                profile_data.elevator_pitch, profile_data.business_email,
                profile_data.phone_number
            )

        # Insert new sub-records
        for link in profile_data.links:
            await conn.execute("INSERT INTO links (profile_id, link_type, url) VALUES ($1, $2, $3)", profile_id, link.link_type, link.url)
        for exp in profile_data.work_experiences:
            await conn.execute("INSERT INTO work_experiences (profile_id, company_name, role, start_date, end_date, description) VALUES ($1, $2, $3, $4, $5, $6)", profile_id, exp.company_name, exp.role, exp.start_date, exp.end_date, exp.description)
        for edu in profile_data.educations:
            await conn.execute("INSERT INTO educations (profile_id, institution_name, degree, field_of_study, start_date, end_date, description) VALUES ($1, $2, $3, $4, $5, $6, $7)", profile_id, edu.institution_name, edu.degree, edu.field_of_study, edu.start_date, edu.end_date, edu.description)
        for med in profile_data.media:
            await conn.execute("INSERT INTO media (profile_id, media_type, url, title, description) VALUES ($1, $2, $3, $4, $5)", profile_id, med.media_type, med.url, med.title, med.description)
        for snip in profile_data.code_snippets:
            await conn.execute("INSERT INTO code_snippets (profile_id, title, code, language) VALUES ($1, $2, $3, $4)", profile_id, snip.title, snip.code, snip.language)

    # Fetch and return the complete profile
    profile = await get_profile_by_user_id(user_id, conn)
    return JSONResponse(content=profile.model_dump(mode='json'), status_code=status_code)

@router.get("/profile/me", response_model=ProfileResponse)
async def get_my_profile(
    user: AuthorizedUser,
    conn: asyncpg.Connection = Depends(get_db_connection),
):
    profile = await get_profile_by_user_id(user.sub, conn)
    if not profile:
        raise HTTPException(status_code=404, detail="Profile not found")
    return profile

@router.get("/profile/{user_id}", response_model=ProfileResponse)
async def get_profile_by_id(
    user_id: UUID,
    conn: asyncpg.Connection = Depends(get_db_connection),
):
    profile = await get_profile_by_user_id(user_id, conn)
    if not profile:
        raise HTTPException(status_code=404, detail="Profile not found")
    return profile

@router.get("/health", response_model=HealthCheckResponse)
async def check_health(
    user: AuthorizedUser,
    conn: asyncpg.Connection = Depends(get_db_connection),
):
    profile_exists = await conn.fetchval("SELECT EXISTS(SELECT 1 FROM profiles WHERE user_id = $1)", user.sub)
    return HealthCheckResponse(profile_exists=profile_exists)

@router.get("/profiles/public", response_model=list[PublicProfile])
async def list_public_profiles(
    search: str | None = None, conn: asyncpg.Connection = Depends(get_db_connection)
):
    """
    Lists all publicly available profiles.
    Can be filtered by a search term.
    """
    if search:
        query = """
            SELECT
                p.user_id,
                p.first_name,
                p.last_name,
                p.bio,
                p.elevator_pitch
            FROM profiles p
            WHERE
                p.first_name ILIKE $1 OR
                p.last_name ILIKE $1 OR
                p.bio ILIKE $1 OR
                p.elevator_pitch ILIKE $1
        """
        rows = await conn.fetch(query, f"%{search}%")
    else:
        query = """
            SELECT
                p.user_id,
                p.first_name,
                p.last_name,
                p.bio,
                p.elevator_pitch
            FROM profiles p
        """
        rows = await conn.fetch(query)

    return [PublicProfile(**row) for row in rows]

async def get_profile_by_user_id(
    user_id: str, conn: asyncpg.Connection
) -> ProfileResponse:
    profile_row = await conn.fetchrow("SELECT * FROM profiles WHERE user_id = $1", user_id)
    if not profile_row:
        return None

    profile_id = profile_row['id']
    
    links_rows = await conn.fetch("SELECT id, link_type, url FROM links WHERE profile_id = $1", profile_id)
    work_experiences_rows = await conn.fetch("SELECT id, company_name, role, start_date, end_date, description FROM work_experiences WHERE profile_id = $1", profile_id)
    educations_rows = await conn.fetch("SELECT id, institution_name, degree, field_of_study, start_date, end_date, description FROM educations WHERE profile_id = $1", profile_id)
    media_rows = await conn.fetch("SELECT id, media_type, url, title, description FROM media WHERE profile_id = $1", profile_id)
    code_snippets_rows = await conn.fetch("SELECT id, title, code, language FROM code_snippets WHERE profile_id = $1", profile_id)

    return ProfileResponse(
        id=profile_id,
        user_id=user_id,
        first_name=profile_row['first_name'],
        last_name=profile_row['last_name'],
        bio=profile_row['bio'],
        elevator_pitch=profile_row['elevator_pitch'],
        business_email=profile_row['business_email'],
        phone_number=profile_row['phone_number'],
        links=[Link(**l) for l in links_rows],
        work_experiences=[WorkExperience(**w) for w in work_experiences_rows],
        educations=[Education(**e) for e in educations_rows],
        media=[Media(**m) for m in media_rows],
        code_snippets=[CodeSnippet(**c) for c in code_snippets_rows],
    )
