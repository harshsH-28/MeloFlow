import os
from fastapi import HTTPException
import subprocess
from app.services.DownloadService import download

CMAF_CONTENT_DIR = "/backend/cmaf_files"

SONGS_DIR = "/backend"

async def segment_audio(song_id: str):
    input_audio_path = os.path.join(SONGS_DIR, f"{song_id}.m4a")

    if not os.path.exists(input_audio_path):
        await download(song_id)

    output_dir = os.path.join(CMAF_CONTENT_DIR, song_id)
    if not os.path.exists(output_dir):
        os.makedirs(output_dir, exist_ok=True)

    # Segment the audio file
    # FFmpeg command to process the audio file
    output_mpd_path = os.path.join(output_dir, "output.mpd")
    command = [
        "ffmpeg", "-i", input_audio_path,
        "-c:a", "aac", "-b:a", "128k", 
        "-f", "dash",
        "-use_template", "1", "-use_timeline", "1",
        "-init_seg_name", os.path.join(output_dir, "init.mp4"),
        "-media_seg_name", os.path.join(output_dir, "chunk_%05d.m4s"),
        "-min_seg_duration", "5000000",
        output_mpd_path
    ]

    try:
        # Execute the ffmpeg command
        subprocess.run(command, check=True)
    except subprocess.CalledProcessError as e:
        raise HTTPException(status_code=500, detail=f"Error processing file: {str(e)}")
    
    return {"message": "Audio processed successfully", "mpd_path": output_mpd_path, "status": True}
