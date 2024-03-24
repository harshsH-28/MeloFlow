from fastapi import APIRouter
from app.services.BrowseMusicService.BrowseMusicService import browse_music_service
from app.services.DownloadService import download

router = APIRouter(
    prefix = "/api/v1",
    tags = ["API"]
)

@router.get("")
async def home():
    return { "status": 200, "message": "The API is working prefectly."}


@router.get("/search={query}")
async def search(query: str):
    res = await browse_music_service(query)
    await download(res["data"])
    return {"res": res}
