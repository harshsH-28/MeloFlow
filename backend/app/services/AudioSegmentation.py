import os
from fastapi import HTTPException
import subprocess
from app.services.DownloadService import download

CMAF_CONTENT_DIR = "/meloflow/cmaf_files"

SONGS_DIR = "/meloflow/songs"

async def segment_audio(song_id: str):
    input_audio_path = os.path.join(SONGS_DIR, f"{song_id}.m4a")

    if not os.path.exists(input_audio_path):
        await download(song_id)

    output_dir = os.path.join(CMAF_CONTENT_DIR, song_id)
    if not os.path.exists(output_dir):
        os.makedirs(output_dir, exist_ok=True)
        print(f"Created output directory: {output_dir}")
    else:
        print(f"Output directory already exists: {output_dir}")

    # Segment the audio file
    output_mpd_path = os.path.join(output_dir, "manifest.mpd")
    print(output_mpd_path)
    command = [
        "/meloflow/ffmpeg/bin/ffmpeg",  # Use the full path to ffmpeg
        "-i", input_audio_path,
        "-c:a", "copy",  # Copy the AAC audio without re-encoding
        "-f", "dash",
        "-use_template", "1",
        "-use_timeline", "1",
        "-init_seg_name", "init.mp4",
        "-media_seg_name", "chunk-$RepresentationID$-$Number%05d$.m4s",
        "-seg_duration", "4",  # 4-second segments for a good balance of flexibility and efficiency
        "-adaptation_sets", "id=0,streams=a",
        "-dash_segment_type", "mp4",
        output_mpd_path
    ]

    try:
        # Execute the ffmpeg command
        result = subprocess.run(command, check=True, stdout=subprocess.PIPE, stderr=subprocess.PIPE)
        print("FFmpeg Output:", result.stdout.decode())
        print("FFmpeg Error:", result.stderr.decode())
    except subprocess.CalledProcessError as e:
        raise HTTPException(status_code=500, detail=f"Error processing file: {str(e)}. FFmpeg Error: {e.stderr.decode()}")
    
    return {"message": "Audio processed successfully", "mpd_path": output_mpd_path, "status": True}
