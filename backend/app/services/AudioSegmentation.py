"""
This service segments the audio into cmaf compatible segments.
"""

import os
from fastapi import HTTPException
from app.config import FFMPEG_PATH, CMAF_CONTENT_DIR, SONGS_DIR, FFMPEG_SEGMENT_DURATION
from app.services.DownloadService import download
from app.utils.file_operations import ensure_directory_exists, check_file_exists
from app.utils.ffmpeg import run_ffmpeg_command


async def segment_audio(song_id: str):
    """Segments the audio file for the given song ID."""
    input_audio_path = os.path.join(SONGS_DIR, f"{song_id}.m4a")
    output_dir = os.path.join(CMAF_CONTENT_DIR, song_id)

    ensure_directory_exists(output_dir)

    output_mpd_path = os.path.join(output_dir, "manifest.mpd")

    try:
        await ensure_song_audio_exists(input_audio_path, song_id)

        ffmpeg_command = build_ffmpeg_command(input_audio_path, output_mpd_path)
        await run_ffmpeg_command(ffmpeg_command)

        print(f"Audio processed successfully for song_id: {song_id}")
        return {"message": "Audio processed successfully", "mpd_path": output_mpd_path, "status": True}


    except Exception as e:
        print(f"Error processing audio for song_id {song_id}: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error processing audio: {str(e)}") from e


async def ensure_song_audio_exists(file_path: str, song_id: str):
    """Ensure the audio file for the given song ID exists at the specified path, if not we download the song audio"""
    if not check_file_exists(file_path):
        print(f"Input file not found. Downloading song_id: {song_id}")
        await download(song_id)
    if not check_file_exists(file_path):
        print(f"Input file not found after download attempt: {file_path}")
        raise FileNotFoundError(f"Input file not found: {file_path}")
    

def build_ffmpeg_command(input_path: str, output_path: str):
    """Builds the ffmpeg command for audio segmentation.

    Args:
        input_path (str): The path to the input audio file.
        output_path (str): The path to save the output segmented audio file and manifest file.

    Returns:
        list: The ffmpeg command as a list of arguments.
    """
    return [
        FFMPEG_PATH,  # Use the full path to ffmpeg
        "-i", input_path,
        "-c:a", "copy",  # Copy the AAC audio without re-encoding
        "-f", "dash",
        "-use_template", "1",
        "-use_timeline", "1",
        "-init_seg_name", "init.mp4",
        "-media_seg_name", "chunk-$RepresentationID$-$Number%05d$.m4s",
        "-seg_duration", str(FFMPEG_SEGMENT_DURATION),
        "-adaptation_sets", "id=0,streams=a",
        "-dash_segment_type", "mp4",
        "-movflags", "cmaf+dash+delay_moov",
        "-brand", "cmfc",
        output_path
    ]
