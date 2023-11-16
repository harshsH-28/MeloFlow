from yt_dlp import YoutubeDL

# URL = "https://music.youtube.com/watch?v=U4qD41gPQMU"


def download(URL):
    ydl_opts = {
        'format': 'm4a/bestaudio/best',
        # ℹ️ See help(yt_dlp.postprocessor) for a list of available Postprocessors and their arguments
        'postprocessors': [{  # Extract audio using ffmpeg
            'key': 'FFmpegExtractAudio',
            'preferredcodec': 'm4a',
        }],
        'ffmpeg_location': "D:\\Documents\\Code\\Projects\\MeloFlow\\backend\\app\\services\\bin",
    }

    with YoutubeDL(ydl_opts) as ydl:
        ydl.download(URL)


# download(URL)
