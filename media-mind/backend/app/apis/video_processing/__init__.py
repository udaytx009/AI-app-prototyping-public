import databutton as db
import openai
import re
import os
import shutil # For cleaning up temp directories
import tempfile # For temporary file/directory handling
import logging # For better logging, will replace with print for now if not available
import yt_dlp # Added for video downloading

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, HttpUrl
from typing import Literal

# Initialize OpenAI client (ensure OPENAI_API_KEY is set in secrets)
try:
    openai_api_key = db.secrets.get("OPENAI_API_KEY")
    if not openai_api_key:
        raise ValueError("OPENAI_API_KEY secret not found or is empty.")
    client = openai.OpenAI(api_key=openai_api_key)
except Exception as e:
    # This will prevent the app from starting if the key is missing, which is intended.
    # In a real scenario, you might have a fallback or a clearer startup error message.
    print(f"CRITICAL: Failed to initialize OpenAI client: {e}")
    # raise # Re-raise to stop app initialization if critical
    client = None # Allow app to start but endpoints will fail if client is used.

router = APIRouter(prefix="/video-processing", tags=["Video Processing"])

# --- Pydantic Models ---
class ProcessVideoRequest(BaseModel):
    video_link: HttpUrl
    # video_id: str | None = None # Optional: if we want to use internal IDs later

class ProcessVideoResponse(BaseModel):
    structured_text: str
    source: Literal['cache', 'processed', 'error']
    error_message: str | None = None

# --- Helper Functions ---

def sanitize_storage_key(key: str) -> str:
    """Sanitize storage key to only allow alphanumeric and ._- symbols"""
    key = re.sub(r'^https?://', '', key)
    key = re.sub(r'[^a-zA-Z0-9._-]', '_', key)
    return key


def _download_audio(video_url: str, temp_dir_path: str) -> str:
    """Downloads audio from video_url to temp_dir_path, returns path to audio file."""
    ydl_opts = {
        'format': 'bestaudio/best',
        'postprocessors': [{
            'key': 'FFmpegExtractAudio',
            'preferredcodec': 'mp3',
            'preferredquality': '192',
        }],
        'outtmpl': os.path.join(temp_dir_path, '%(id)s.%(ext)s'),
        'quiet': True,
        'no_warnings': True,
        'nocheckcertificate': True, # Added for potential SSL issues with some sites
    }
    try:
        print(f"Starting audio download for: {video_url} into {temp_dir_path}")
        with yt_dlp.YoutubeDL(ydl_opts) as ydl:
            info_dict = ydl.extract_info(video_url, download=True)
            # Determine the downloaded file path
            # ydl.prepare_filename(info_dict) would give the template before processing.
            # After download, the file should be in temp_dir_path based on outtmpl.
            downloaded_files = os.listdir(temp_dir_path)
            if not downloaded_files:
                print(f"yt-dlp processing finished but no files found in {temp_dir_path}")
                raise HTTPException(status_code=500, detail="Audio download failed: No file produced.")
            
            # Assuming the first file (or the one matching expected pattern if more complex)
            # For simplicity, taking the first file. Consider more robust selection if needed.
            audio_file_path = os.path.join(temp_dir_path, downloaded_files[0])
            print(f"Audio downloaded successfully: {audio_file_path}")
            return audio_file_path
    except yt_dlp.utils.DownloadError as e:
        print(f"yt-dlp DownloadError for {video_url}: {e}")
        # Consider specific error codes or messages for frontend if needed
        raise HTTPException(status_code=502, detail=f"Failed to download audio content: {str(e)}")
    except Exception as e:
        print(f"General error during audio download for {video_url}: {e}")
        raise HTTPException(status_code=500, detail=f"Server error during audio download: {str(e)}")

def _transcribe_audio(audio_file_path: str, video_link_for_logging: str) -> str:
    """Transcribes the audio file at audio_file_path using OpenAI Whisper."""
    if not client:
        print("OpenAI client not available for transcription.") # Should have been caught earlier
        raise HTTPException(status_code=500, detail="OpenAI client not initialized.")
    try:
        print(f"Starting transcription for: {audio_file_path} (from {video_link_for_logging})")
        with open(audio_file_path, "rb") as audio_file_rb:
            transcription = client.audio.transcriptions.create(
                model="whisper-1",
                file=audio_file_rb
            )
        print(f"Transcription successful for: {video_link_for_logging}")
        return transcription.text
    except openai.APIError as e:
        print(f"OpenAI APIError during transcription for {video_link_for_logging}: {e}")
        raise HTTPException(status_code=502, detail=f"Transcription service error: {str(e)}")
    except Exception as e:
        print(f"General error during transcription for {video_link_for_logging}: {e}")
        raise HTTPException(status_code=500, detail=f"Server error during transcription: {str(e)}")

def _structure_text_with_openai(transcript: str, video_link_for_logging: str) -> str:
    """Structures the given transcript using OpenAI's gpt-4o-mini model."""
    if not client:
        print("OpenAI client not available for text structuring.")
        raise HTTPException(status_code=500, detail="OpenAI client not initialized.")
    
    system_prompt = ("""You are an expert at transforming raw video transcripts into well-structured, readable summaries. 
Your goal is to make the content easily digestible. Please:

1. Identify the main topics and key points discussed in the transcript.
2. Organize the content into logical sections with clear headings if appropriate (e.g., Introduction, Key Topic 1, Key Topic 2, Conclusion).
3. Summarize the information concisely under each section or as a general summary if sections are not natural.
4. Correct any obvious transcription errors or awkward phrasing to improve readability, but preserve the original meaning.
5. Use bullet points or numbered lists for actionable items or distinct ideas where it enhances clarity.
6. Maintain a neutral and objective tone.
7. Ensure the final output is well-formatted text.""")
    
    user_prompt = f"Please structure and summarize the following video transcript:\n\n--BEGIN TRANSCRIPT--\n{transcript}\n--END TRANSCRIPT--"
    
    try:
        print(f"Starting text structuring for transcript from: {video_link_for_logging}")
        completion = client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_prompt}
            ],
            temperature=0.5, # Adjust for more/less creative structuring
        )
        structured_text = completion.choices[0].message.content
        if not structured_text:
             print(f"Text structuring returned empty content for: {video_link_for_logging}")
             # Fallback to transcript if structuring fails to produce content
             return transcript 
        print(f"Text structuring successful for: {video_link_for_logging}")
        return structured_text
    except openai.APIError as e:
        print(f"OpenAI APIError during text structuring for {video_link_for_logging}: {e}")
        # Fallback to returning the raw transcript in case of structuring failure
        # It's better to return something than to fail the whole request if transcription was successful.
        # The ProcessVideoResponse source will still be 'processed', but text won't be structured.
        # Client-side could potentially inform user that structuring failed.
        return transcript # Fallback
    except Exception as e:
        print(f"General error during text structuring for {video_link_for_logging}: {e}")
        return transcript # Fallback


# --- API Endpoint ---
@router.post("/process", response_model=ProcessVideoResponse)
async def process_video(request: ProcessVideoRequest):
    if not client:
        raise HTTPException(status_code=500, detail="OpenAI client not initialized. Check API key.")

    # Sanitize the video link to create a valid and unique cache key
    # Using the full link for now, might need a more robust ID system later
    sanitized_link = sanitize_storage_key(str(request.video_link))
    cache_key = f"processed_text_{sanitized_link}"
    max_key_length = 250 # Adjust if necessary, keeping keys reasonably short
    cache_key = cache_key[:max_key_length] 

    print(f"Processing request for video link: {request.video_link}")
    print(f"Using cache key: {cache_key}")

    # 1. Check cache
    try:
        cached_text = db.storage.text.get(key=cache_key, default=None)
        if cached_text:
            print(f"Cache hit for key: {cache_key}")
            return ProcessVideoResponse(structured_text=cached_text, source='cache')
        print(f"Cache miss for key: {cache_key}")
    except FileNotFoundError:
        print(f"Cache miss (FileNotFound) for key: {cache_key}")
        pass # Expected if not in cache
    except Exception as e:
        print(f"Error accessing cache for key {cache_key}: {e}")
        # Decide if we should proceed or return an error. For now, proceed to process.

    # 2. If not cached, process the video
    print("Cache miss. Proceeding with video processing...")
    audio_file_path = None
    # Use a temporary directory that cleans itself up
    with tempfile.TemporaryDirectory() as temp_dir:
        print(f"Created temporary directory: {temp_dir}")
        try:
            # Step 2a: Download audio using yt-dlp
            audio_file_path = _download_audio(str(request.video_link), temp_dir)
            print(f"Audio file path: {audio_file_path}")

            # Step 2b: Transcribe audio using Whisper
            transcript = _transcribe_audio(audio_file_path, str(request.video_link))
            print(f"Transcript obtained for: {request.video_link}")
            # print(f"Transcript (first 100 chars): {transcript[:100]}") # Optional: log snippet

            # Step 2c: Structure text using OpenAI
            structured_text_from_processing = _structure_text_with_openai(transcript, str(request.video_link))
            print(f"Processed and structured text obtained for: {request.video_link}")

        except HTTPException: # Re-raise HTTPExceptions from helpers
            raise
        except Exception as e:
            print(f"Error during video processing pipeline for {request.video_link}: {e}")
            return ProcessVideoResponse(structured_text="", source='error', error_message=f"Processing error: {str(e)}")
        finally:
            # The TemporaryDirectory context manager handles cleanup automatically.
            # If audio_file_path was outside temp_dir or specific cleanup needed, do it here.
            print(f"Temporary directory {temp_dir} will be cleaned up.")

    # 3. Store in cache (after successful processing)
    try:
        db.storage.text.put(key=cache_key, value=structured_text_from_processing)
        print(f"Successfully cached processed text for key: {cache_key}")
    except Exception as e:
        print(f"Error saving to cache for key {cache_key}: {e}")

    return ProcessVideoResponse(structured_text=structured_text_from_processing, source='processed')

# Future: Add error handling, yt-dlp, whisper, and openai actual processing

# Example usage of yt-dlp (to be integrated carefully with error handling)
# def download_audio_from_video(video_url: str, temp_dir: str) -> str | None:
#     import yt_dlp
#     ydl_opts = {
#         'format': 'bestaudio/best',
#         'postprocessors': [{
#             'key': 'FFmpegExtractAudio',
#             'preferredcodec': 'mp3',
#             'preferredquality': '192',
#         }],
#         'outtmpl': os.path.join(temp_dir, '%(id)s.%(ext)s'),
#         'quiet': True,
#         'no_warnings': True,
#     }
#     try:
#         with yt_dlp.YoutubeDL(ydl_opts) as ydl:
#             info_dict = ydl.extract_info(video_url, download=True)
#             # The actual downloaded file path needs to be determined reliably
#             # It might not be simply info_dict.get('id') + .mp3
#             # ydl.prepare_filename(info_dict) might give the template before processing
#             # A common way is to list files in temp_dir after download if only one is expected
#             downloaded_files = os.listdir(temp_dir)
#             if downloaded_files:
#                 # Assuming the first file is the one we want, or apply more specific logic
#                 return os.path.join(temp_dir, downloaded_files[0])
#             else:
#                 print("yt-dlp downloaded, but no file found in temp_dir.")
#                 return None
#     except yt_dlp.utils.DownloadError as e:
#         print(f"yt-dlp DownloadError: {e}")
#         return None
#     except Exception as e:
#         print(f"General error during audio download: {e}")
#         return None

