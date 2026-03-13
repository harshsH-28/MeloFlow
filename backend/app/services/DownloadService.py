from yt_dlp import YoutubeDL
from yt_dlp.utils import DownloadError
from fastapi import HTTPException
import os
from app.config import COOKIES_FILE

base_url = "https://music.youtube.com/watch?v="

download_path = "songs"


async def download(code):
    # Path to cookies file - you'll need to create this file
    cookies_file = COOKIES_FILE

    if not os.path.exists(cookies_file):
        raise HTTPException(status_code=500, detail="Cookies file not found")
    
    print(f"Cookies file found: {cookies_file}")
    
    ydl_opts = {
        'format': 'bestaudio/best',
        # ℹ️ See help(yt_dlp.postprocessor) for a list of available Postprocessors and their arguments
        'postprocessors': [{  # Extract audio using ffmpeg
            'key': 'FFmpegExtractAudio',
            'preferredcodec': 'aac',
        },
        {
            'key': 'FFmpegMetadata',
        }],
        'ffmpeg_location': '/bin/ffmpeg/bin/',
        'outtmpl': f'{download_path}/%(id)s.%(ext)s',
        'postprocessor_args': [
            '-ar', '48000',
            '-ac', '2',
            '-b:a', '192k',
        ],
        'user_agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'cookiefile': cookies_file if os.path.exists(cookies_file) else None,
        'sleep_interval': 5,  # Wait 5 seconds between downloads/requests
        'max_sleep_interval': 20, # Max random wait time (e.g., 5-20 seconds)
        'verbose': True,
    }
    url = f'{base_url}{code}'
    
    
    try:
        with YoutubeDL(ydl_opts) as ydl:
            ydl.download([url])
    except DownloadError as e:
        print(f"Error downloading {url}: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error downloading audio: {str(e)}")


# /bin/ffmpeg/bin/