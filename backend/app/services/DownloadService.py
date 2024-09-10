from yt_dlp import YoutubeDL

base_url = "https://music.youtube.com/watch?v="

download_path = "songs"


async def download(code):
    ydl_opts = {
        'format': 'm4a/bestaudio/best',
        # ℹ️ See help(yt_dlp.postprocessor) for a list of available Postprocessors and their arguments
        'postprocessors': [{  # Extract audio using ffmpeg
            'key': 'FFmpegExtractAudio',
            'preferredcodec': 'm4a',
        }],
        'ffmpeg_location': '/bin/ffmpeg/bin/',
        'outtmpl': f'{download_path}/%(id)s.%(ext)s'
    }
    url = f'{base_url}{code}'

    with YoutubeDL(ydl_opts) as ydl:
        ydl.download([url])
