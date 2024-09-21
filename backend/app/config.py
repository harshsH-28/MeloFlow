"""
This module contains configuration settings for the application.
"""

import os

# Base directories
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
FFMPEG_PATH = "/meloflow/ffmpeg/bin/ffmpeg"
CMAF_CONTENT_DIR = "/meloflow/cmaf_files"
SONGS_DIR = "/meloflow/songs"

# FFmpeg configuration
FFMPEG_SEGMENT_DURATION = 4 # 4-second segments for a good balance of flexibility and efficiency
