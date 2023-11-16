from ytmusicapi import YTMusic
from services.DownloadService import download

# Main function


async def browse_music_service(query):
    """
    Browse Music Service function
    Searches for the music in youtube music api
    Also searches for your music playlist from spotify
    """

    ytmusic = YTMusic()
    res = ytmusic.search(query, filter="songs")
    filtered_res = [item["videoId"]
                    for item in res if item["resultType"] == "song"]
    return filtered_res


# Spotify Music Database function
# def spotify_music_database():
#     """
#     Spotify Playlist fetching function
#     Fetches the playlist from spotify
#     """
#     results = sp.search(q='weezer', limit=20)
#     for idx, track in enumerate(results['tracks']['items']):
#         print(idx, track['name'])

#     return results


# def youtube_music_api():
#     """
#     Youtube Music API function
#     Fetches the music from youtube music api
#     """
#     music_files = get_music_files()
#     return music_files
