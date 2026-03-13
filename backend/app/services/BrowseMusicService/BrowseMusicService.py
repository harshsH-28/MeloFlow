from ytmusicapi import YTMusic
from app.services.DownloadService import download

# Main function


async def browse_music_service(query):
    """
    Browse Music Service function
    Searches for the music in youtube music api
    Also searches for your music playlist from spotify
    """

    ytmusic = YTMusic()

    try:
        res = ytmusic.search(query, filter="songs")
        filtered_res = [item["videoId"]
                        for item in res if item["resultType"] == "song"]
        return {"data": filtered_res[0], "status": 200, "message": "Success"}
    except Exception as e:
        return {"data": None, "status": 500, "message": f"Internal Server Error: {str(e)}"}


async def search_songs(query, limit=10):
    """
    Enhanced search function that returns multiple songs with metadata
    
    Args:
        query (str): Search query string
        limit (int): Maximum number of results to return
        
    Returns:
        dict: Search results with metadata and status
    """
    ytmusic = YTMusic()

    try:
        results = ytmusic.search(query, filter="songs")
        
        # Filter only song results and extract relevant metadata
        songs_with_metadata = []
        
        for item in results:
            if item["resultType"] == "song" and len(songs_with_metadata) < limit:
                # Extract only the needed information
                song_info = {
                    "id": item["videoId"],
                    "title": item["title"],
                    "artist": item["artists"][0]["name"] if item.get("artists") else "Unknown Artist",
                    "album": item["album"]["name"] if item.get("album") else "",
                    "duration": item.get("duration", ""),
                    "thumbnail": item["thumbnails"][-1]["url"] if item.get("thumbnails") else "",
                }
                songs_with_metadata.append(song_info)
        
        return {
            "data": songs_with_metadata, 
            "status": 200, 
            "message": "Success"
        }
    except Exception as e:
        return {
            "data": [], 
            "status": 500, 
            "message": f"Internal Server Error: {str(e)}"
        }

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
