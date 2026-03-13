import os
from fastapi import APIRouter, HTTPException, Header, Request, Query, Response
from fastapi.responses import StreamingResponse, FileResponse
from app.services.BrowseMusicService.BrowseMusicService import browse_music_service, search_songs
from app.services.DownloadService import download
from app.services.AudioSegmentation import segment_audio
from typing import Optional

router = APIRouter(
    prefix = "/api/v1",
    tags = ["API"]
)

CMAF_CONTENT_DIR = "/meloflow/cmaf_files"

@router.get("/")
async def read_root():
    return { "status": 200, "message": "Welcome to the Music Streaming API."}


@router.get("/search={query}")
async def search(query: str):
    res = await browse_music_service(query)
    # await download(res["data"])
    return res


@router.get("/search-songs")
async def search_songs_endpoint(query: str, limit: int = Query(10, ge=1, le=20), response: Response = None):
    """
    Search for songs based on a query string and return multiple results with metadata.
    
    Args:
        query (str): The search query string
        limit (int): Maximum number of results to return (default: 10, min: 1, max: 20)
        
    Returns:
        dict: Search results with song metadata
    """
    try:
        if not query or len(query.strip()) < 2:
            return {"data": [], "status": 400, "message": "Search query must be at least 2 characters long"}
        
        result = await search_songs(query, limit)
        
        # Add CORS headers to ensure browser compatibility
        if response:
            response.headers["Access-Control-Allow-Origin"] = "*"
            response.headers["Access-Control-Allow-Methods"] = "GET, OPTIONS"
            response.headers["Access-Control-Allow-Headers"] = "Content-Type"
        
        return result
    except Exception as e:
        print(f"Error in search-songs endpoint: {str(e)}")
        if response:
            response.headers["Access-Control-Allow-Origin"] = "*"
        return {"data": [], "status": 500, "message": f"Server error: {str(e)}"}


@router.get("/song/{song_id}")
async def get_song_details(song_id: str, response: Response = None):
    """
    Get details for a specific song by ID.
    
    Args:
        song_id (str): The YouTube video ID of the song
        
    Returns:
        dict: Song details including metadata
    """
    from ytmusicapi import YTMusic
    
    if not song_id:
        raise HTTPException(status_code=400, detail="Song ID is required")
    
    try:
        ytmusic = YTMusic()
        
        # Try to get more detailed info about the video
        try:
            # Get detailed information about the song using the video ID
            video_info = ytmusic.get_song(song_id)
            
            # Extract relevant information
            song_info = {
                "id": song_id,
                "title": video_info.get("title", "Unknown Title"),
                "artist": video_info.get("artists", [{"name": "Unknown Artist"}])[0]["name"] if video_info.get("artists") else "Unknown Artist",
                "album": video_info.get("album", {}).get("name", "") if video_info.get("album") else "",
                "duration": video_info.get("duration", ""),
                "thumbnail": video_info.get("thumbnails", [])[-1]["url"] if video_info.get("thumbnails") else f"https://img.youtube.com/vi/{song_id}/maxresdefault.jpg",
                "year": video_info.get("year", ""),
                "views": video_info.get("views", ""),
            }
            
            # Additional fields if available
            if video_info.get("videoType"):
                song_info["videoType"] = video_info.get("videoType")
                
            if video_info.get("description"):
                song_info["description"] = video_info.get("description")
                
            # If there are multiple artists, include them all in an artists array
            if video_info.get("artists") and len(video_info.get("artists", [])) > 1:
                song_info["artists"] = [artist.get("name", "") for artist in video_info.get("artists", [])]
                
        except Exception as e:
            # Fallback: If detailed info fails, create basic info from the ID
            song_info = {
                "id": song_id,
                "title": "Unknown Title",
                "artist": "Unknown Artist",
                "thumbnail": f"https://img.youtube.com/vi/{song_id}/maxresdefault.jpg",
            }
        
        if response:
            response.headers["Access-Control-Allow-Origin"] = "*"
            response.headers["Access-Control-Allow-Methods"] = "GET, OPTIONS"
            response.headers["Access-Control-Allow-Headers"] = "Content-Type"
            
        return {"data": song_info, "status": 200, "message": "Success"}
    except Exception as e:
        if response:
            response.headers["Access-Control-Allow-Origin"] = "*"
        raise HTTPException(status_code=500, detail=f"Error fetching song details: {str(e)}")


@router.get("/stream/{song_id}/manifest.mpd")
async def server_manifest(song_id: str):
    await segment_audio(song_id)

    # if not segmented_res["status"]:
    #     raise HTTPException(status_code=500, detail="Error processing audio file.")
    
    manifest_file_path = os.path.join(CMAF_CONTENT_DIR, song_id, "manifest.mpd")

    if not os.path.exists(manifest_file_path):
        raise HTTPException(status_code=404, detail="Manifest file not found.")
    
    return FileResponse(manifest_file_path, media_type="application/dash+xml")


@router.get("/stream/{song_id}/{segment}")
async def stream_audio(
    song_id: str, 
    segment: str, 
    request: Request, 
    range: Optional[str] = Header(None)
):
    segment_file_path = os.path.join(CMAF_CONTENT_DIR, song_id, segment)

    if not os.path.exists(segment_file_path):
        raise HTTPException(status_code=404, detail="Music audio segment file not found.")
    
    # Determine the media type based on the file extension
    if segment.endswith(".mp4") or segment.endswith(".m4s"):
        media_type = "audio/mp4"
    elif segment.endswith(".mp3"):
        media_type = "audio/mpeg"
    elif segment.endswith(".aac"):
        media_type = "audio/aac"
    elif segment.endswith(".webm"):
        media_type = "audio/webm"
    else:
        media_type = "application/octet-stream"

    file_size = os.path.getsize(segment_file_path)
    start = 0
    end = file_size - 1

    if range:
        start, end = range.replace("bytes=", "").split("-")
        start = int(start)
        end = int(end) if end else file_size - 1

    chunk_size = end - start + 1

    headers = {
        "Content-Range": f"bytes {start}-{end}/{file_size}",
        "Accept-Ranges": "bytes",
        "Content-Length": str(chunk_size),
        "Content-Type": media_type,
    }

    def stream_file():
        with open(segment_file_path, "rb") as file:
            file.seek(start)
            data = file.read(chunk_size)
            yield data

    return StreamingResponse(stream_file(), headers=headers, status_code=206)

    

    


