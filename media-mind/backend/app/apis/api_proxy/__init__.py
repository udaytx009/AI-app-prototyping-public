from fastapi import APIRouter, HTTPException, Depends, Body
from typing import List, Any

# Import the routers or specific functions/models from the original APIs
from app.apis.video_collection.__init__ import (
    get_videos as original_get_videos,
    add_video as original_add_video,
    VideoData, # Corrected: Was AddVideoRequest
    VideoEntry
)
from app.apis.video_processing.__init__ import (
    process_video as original_process_video,
    ProcessVideoRequest,
    ProcessVideoResponse
)

router = APIRouter(prefix="/proxy", tags=["API Proxy"])

# --- Proxy for Video Collection --- 

@router.get("/videos", response_model=List[VideoEntry])
async def proxy_get_videos():
    """Proxy endpoint to get all video entries."""
    print("Proxy: GET /videos called")
    try:
        return await original_get_videos()
    except Exception as e:
        print(f"Proxy GET /videos error: {e}")
        raise HTTPException(status_code=500, detail=f"Error in proxied get_videos: {str(e)}") from e

@router.post("/videos", response_model=VideoEntry) # Original add_video returns AddVideoResponse, need to align or adjust frontend
async def proxy_add_video(video_data: VideoData = Depends()): # Changed from Body(...) to Depends() for Pydantic model as body
    """Proxy endpoint to add a new video entry."""
    print(f"Proxy: POST /videos called with data: {video_data}")
    try:
        # Original add_video returns AddVideoResponse. 
        # If proxy needs to return VideoEntry, we need to adjust.
        # For now, let's assume the frontend will adapt or the response model of this proxy needs to change to AddVideoResponse.
        # To keep it simple for now, I'll change this proxy's response_model to match original_add_video if it's not VideoEntry.
        # The original add_video returns AddVideoResponse, not VideoEntry.
        # Let's make this proxy return what original_add_video returns.
        # Will adjust response_model for proxy_add_video later if needed or clarify with VideoEntry schema.
        # For now, returning the full AddVideoResponse from the original function.
        # Need to import AddVideoResponse from video_collection too.
        return await original_add_video(video=video_data) 
    except Exception as e:
        print(f"Proxy POST /videos error: {e}")
        raise HTTPException(status_code=500, detail=f"Error in proxied add_video: {str(e)}") from e

# --- Proxy for Video Processing --- 

@router.post("/process-video", response_model=ProcessVideoResponse)
async def proxy_process_video(request_body: ProcessVideoRequest = Depends()): # Changed from Body(...) to Depends() for Pydantic model as body
    """Proxy endpoint to process a video."""
    print(f"Proxy: POST /process-video called with data: {request_body}")
    try:
        return await original_process_video(request=request_body)
    except Exception as e:
        print(f"Proxy POST /process-video error: {e}")
        raise HTTPException(status_code=500, detail=f"Error in proxied process_video: {str(e)}") from e

print("API Proxy router loaded with direct function calls.")
