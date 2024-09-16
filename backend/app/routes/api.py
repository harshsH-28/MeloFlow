import os
from fastapi import APIRouter, HTTPException, Header, Request
from fastapi.responses import StreamingResponse, FileResponse
from app.services.BrowseMusicService.BrowseMusicService import browse_music_service
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
        media_type = "video/mp4"
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

    

    


