from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.services.BrowseMusicService.BrowseMusicService import browse_music_service
from app.services.DownloadService import download

app = FastAPI(
    title="MeloFlow",
    description="A simple music streaming service.",
    version="1.0.0",
)


@app.get("/api/v1/")
async def root():
    return {"status": 200, "message": "API is up and running!"}


@app.get("/api/v1/search/{query}")
async def search(query: str):
    res = await browse_music_service(query)
    await download(res["data"])
    # print(res["data"])
    return {"res": res}
