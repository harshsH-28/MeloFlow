import os
from dotenv import load_dotenv
import spotipy
from spotipy.oauth2 import SpotifyClientCredentials

sp = spotipy.Spotify(auth_manager=SpotifyClientCredentials(
    client_id="YOUR_APP_CLIENT_ID", client_secret="YOUR_APP_CLIENT_SECRET"))

# Main function


def browse_music_service():
    # Get the music files
    music_files = get_music_files()

    # Return the music files
    return music_files


# Spotify Music Database function
def spotify_music_database():
    # Get the music files
    results = sp.search(q='weezer', limit=20)
    for idx, track in enumerate(results['tracks']['items']):
        print(idx, track['name'])

    return results

# Youtube Music API function


def youtube_music_api():
    # Get the music files
    music_files = get_music_files()

    # Return the music files
    return music_files
