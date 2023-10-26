from yt_dlp import YoutubeDL

# # Set the FFMPEG_PATH environment variable to the directory containing ffmpeg.exe
# # Path to the directory containing ffmpeg.exe
# ffmpeg_binaries_path = "../binaries"
# os.environ["FFMPEG_PATH"] = os.path.abspath(ffmpeg_binaries_path)

URL = "https://www.youtube.com/watch?v=h_k14yNonzA"


def download(URL):
    ydl_opts = {
        'format': 'm4a/bestaudio/best',
        # ℹ️ See help(yt_dlp.postprocessor) for a list of available Postprocessors and their arguments
        'postprocessors': [{  # Extract audio using ffmpeg
            'key': 'FFmpegExtractAudio',
            'preferredcodec': 'm4a',
            # 'audio-quality': 0,  # 0 is the highest quality
        }],
        'ffmpeg-location': './bin',
        'audio-quality': 0,  # 0 is the highest quality
    }

    with YoutubeDL(ydl_opts) as ydl:
        ydl.download(URL)


download(URL)
