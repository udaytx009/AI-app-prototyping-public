from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, HttpUrl
import databutton as db
import logging # Replaced with print for Databutton compatibility

router = APIRouter(prefix="/video-collection", tags=["Video Collection"])

# In-memory storage for videos (for demonstration purposes)
# In a real application, you would use a database like Firestore or db.storage
# videos_db = [] 
STORAGE_KEY = "videos_collection_list" # Key for db.storage.json

class VideoData(BaseModel):
    name: str
    link: HttpUrl # Using HttpUrl for automatic URL validation by Pydantic

class AddVideoResponse(BaseModel):
    message: str
    video_id: int # Or a UUID if you prefer, for now an index
    total_videos: int

@router.post("/videos", response_model=AddVideoResponse)
async def add_video(video: VideoData):
    """
    Adds a new video to the collection.
    The collection is stored in db.storage.json under the key 'videos_collection_list'.
    """
    try:
        current_videos = db.storage.json.get(STORAGE_KEY, default=[])
        print(f"Current videos before adding: {len(current_videos)}")

        # Convert VideoData to dict to store in JSON if it's not automatically handled
        # Pydantic models are typically dict-like, but explicit conversion is safer for storage.
        new_video_dict = video.model_dump() 
        new_video_dict['link'] = str(video.link) # Explicitly convert HttpUrl to string for JSON serialization

        current_videos.append(new_video_dict)
        db.storage.json.put(STORAGE_KEY, current_videos)
        print(f"New video added. Total videos: {len(current_videos)}")

        return AddVideoResponse(
            message="Video added successfully", 
            video_id=len(current_videos) -1, # Simple index as ID
            total_videos=len(current_videos)
        )
    except Exception as e:
        print(f"Error adding video: {e}") # Log the error
        raise HTTPException(status_code=500, detail=f"Failed to add video: {str(e)}")

# Optional: Add a GET endpoint to retrieve all videos for testing or display
class VideoEntry(BaseModel):
    name: str
    link: HttpUrl

@router.get("/videos", response_model=list[VideoEntry])
async def get_videos():
    """
    Retrieves all videos from the collection.
    """
    try:
        videos = db.storage.json.get(STORAGE_KEY, default=[])
        # Ensure returned data matches the Pydantic model (HttpUrl might need care)
        return [VideoEntry(name=v['name'], link=HttpUrl(v['link'])) for v in videos]
    except Exception as e:
        print(f"Error retrieving videos: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to retrieve videos: {str(e)}")

print("Video Collection API router loaded.")
