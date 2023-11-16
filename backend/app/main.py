from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from services.BrowseMusicService.BrowseMusicService import browse_music_service

app = FastAPI(
    title="MeloFlow",
    description="A simple music streaming service.",
    version="1.0.0",
)


@app.get("/api/v1/")
async def root():
    res = await browse_music_service("softly")
    return {"res": res}
