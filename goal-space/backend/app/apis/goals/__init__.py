


import asyncpg
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field
from typing import List, Optional
from uuid import UUID, uuid4
from datetime import datetime

import databutton as db
from app.auth import AuthorizedUser

router = APIRouter(prefix="/goals", tags=["Goals"])

# Database connection pool
pool: asyncpg.Pool = None

@router.on_event("startup")
async def startup():
    global pool
    pool = await asyncpg.create_pool(db.secrets.get("DATABASE_URL_DEV"))

@router.on_event("shutdown")
async def shutdown():
    if pool:
        await pool.close()

# Pydantic Models
class GoalType(BaseModel):
    id: UUID
    user_id: UUID
    name: str
    color: Optional[str] = None
    created_at: datetime

class GoalTypeResponse(BaseModel):
    id: UUID
    name: str
    color: Optional[str] = None
    created_at: datetime
    is_deletable: bool = True

class CreateGoalTypeRequest(BaseModel):
    name: str
    color: Optional[str] = None

class Goal(BaseModel):
    id: UUID
    type_id: UUID
    user_id: UUID
    name: str
    summary: Optional[str] = None
    description_markdown: Optional[str] = None
    status: str
    priority: str
    due_date: Optional[datetime] = None
    notify: bool
    created_at: datetime
    updated_at: datetime

class GoalResponse(BaseModel):
    id: UUID
    type_id: UUID
    name: str
    summary: Optional[str] = None
    description_markdown: Optional[str] = None
    status: str
    priority: str
    due_date: Optional[datetime] = None
    notify: bool
    created_at: datetime
    updated_at: datetime

class CreateGoalRequest(BaseModel):
    type_id: UUID
    name: str
    summary: Optional[str] = None
    description_markdown: Optional[str] = None
    priority: str = 'None'
    due_date: Optional[datetime] = None
    notify: bool = False

class UpdateGoalRequest(BaseModel):
    name: Optional[str] = None
    summary: Optional[str] = None
    description_markdown: Optional[str] = None
    status: Optional[str] = None
    priority: Optional[str] = None
    due_date: Optional[datetime] = None
    notify: Optional[bool] = None

# --- Static Default Goal Types ---
DEFAULT_GOAL_TYPES = [
    GoalTypeResponse(id=uuid4(), name="Personal & Wellbeing", color="#4ade80", created_at=datetime.now(), is_deletable=False),
    GoalTypeResponse(id=uuid4(), name="Career", color="#38bdf8", created_at=datetime.now(), is_deletable=False),
    GoalTypeResponse(id=uuid4(), name="Financial", color="#facc15", created_at=datetime.now(), is_deletable=False),
    GoalTypeResponse(id=uuid4(), name="Work", color="#818cf8", created_at=datetime.now(), is_deletable=False),
    GoalTypeResponse(id=uuid4(), name="Moral", color="#f472b6", created_at=datetime.now(), is_deletable=False),
]

# --- API Endpoints for Goal Types ---
@router.get("/types", response_model=List[GoalTypeResponse])
async def get_goal_types(user: AuthorizedUser):
    async with pool.acquire() as connection:
        rows = await connection.fetch(
            "SELECT id, name, color, created_at FROM goal_types WHERE user_id = $1 ORDER BY created_at",
            user.sub
        )
        user_types = [GoalTypeResponse(**row, is_deletable=True) for row in rows]
        return DEFAULT_GOAL_TYPES + user_types

@router.post("/types", response_model=GoalTypeResponse, status_code=201)
async def create_goal_type(request: CreateGoalTypeRequest, user: AuthorizedUser):
    async with pool.acquire() as connection:
        row = await connection.fetchrow(
            """
            INSERT INTO goal_types (user_id, name, color)
            VALUES ($1, $2, $3)
            RETURNING id, name, color, created_at
            """,
            user.sub, request.name, request.color
        )
        return GoalTypeResponse(**row)

@router.put("/types/{type_id}", response_model=GoalTypeResponse)
async def update_goal_type(type_id: UUID, request: CreateGoalTypeRequest, user: AuthorizedUser):
    async with pool.acquire() as connection:
        row = await connection.fetchrow(
            """
            UPDATE goal_types
            SET name = $1, color = $2
            WHERE id = $3 AND user_id = $4
            RETURNING id, name, color, created_at
            """,
            request.name, request.color, type_id, user.sub
        )
        if not row:
            raise HTTPException(status_code=404, detail="Goal type not found")
        return GoalTypeResponse(**row)

@router.delete("/types/{type_id}", status_code=204)
async def delete_goal_type(type_id: UUID, user: AuthorizedUser):
    async with pool.acquire() as connection:
        result = await connection.execute(
            "DELETE FROM goal_types WHERE id = $1 AND user_id = $2",
            type_id, user.sub
        )
        if result == "DELETE 0":
            raise HTTPException(status_code=404, detail="Goal type not found")

# --- API Endpoints for Goals ---
@router.get("/", response_model=List[GoalResponse])
async def get_goals(user: AuthorizedUser):
    async with pool.acquire() as connection:
        rows = await connection.fetch(
            """
            SELECT id, type_id, name, summary, description_markdown, status, priority, due_date, notify, created_at, updated_at
            FROM goals
            WHERE user_id = $1
            ORDER BY created_at DESC
            """,
            user.sub
        )
        return [GoalResponse(**row) for row in rows]

@router.post("/", response_model=GoalResponse, status_code=201)
async def create_goal(request: CreateGoalRequest, user: AuthorizedUser):
    async with pool.acquire() as connection:
        row = await connection.fetchrow(
            """
            INSERT INTO goals (user_id, type_id, name, summary, description_markdown, priority, due_date, notify)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
            RETURNING id, type_id, name, summary, description_markdown, status, priority, due_date, notify, created_at, updated_at
            """,
            user.sub, request.type_id, request.name, request.summary, request.description_markdown, request.priority, request.due_date, request.notify
        )
        return GoalResponse(**row)

@router.put("/{goal_id}", response_model=GoalResponse)
async def update_goal(goal_id: UUID, request: UpdateGoalRequest, user: AuthorizedUser):
    async with pool.acquire() as connection:
        # Construct the update query dynamically
        updates = request.dict(exclude_unset=True)
        if not updates:
            raise HTTPException(status_code=400, detail="No update fields provided")
        
        updates["updated_at"] = datetime.now()

        set_clause = ", ".join([f"{key} = ${i+2}" for i, key in enumerate(updates.keys())])
        
        query = f"""
            UPDATE goals
            SET {set_clause}
            WHERE id = $1 AND user_id = ${len(updates) + 2}
            RETURNING id, type_id, name, summary, description_markdown, status, priority, due_date, notify, created_at, updated_at
        """

        values = [goal_id] + list(updates.values()) + [user.sub]

        row = await connection.fetchrow(query, *values)

        if not row:
            raise HTTPException(status_code=404, detail="Goal not found")
        return GoalResponse(**row)

@router.delete("/{goal_id}", status_code=204)
async def delete_goal(goal_id: UUID, user: AuthorizedUser):
    async with pool.acquire() as connection:
        result = await connection.execute(
            "DELETE FROM goals WHERE id = $1 AND user_id = $2",
            goal_id, user.sub
        )
        if result == "DELETE 0":
            raise HTTPException(status_code=404, detail="Goal not found")
