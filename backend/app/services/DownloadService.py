from yt_dlp import YoutubeDL
from yt_dlp.utils import DownloadError
from fastapi import HTTPException

base_url = "https://music.youtube.com/watch?v="

download_path = "songs"


async def download(code):
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
    }
    url = f'{base_url}{code}'
    
    
    try:
        with YoutubeDL(ydl_opts) as ydl:
            ydl.download([url])
    except DownloadError as e:
        print(f"Error downloading {url}: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error downloading audio: {str(e)}")


# /bin/ffmpeg/bin/