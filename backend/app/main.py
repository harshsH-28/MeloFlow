from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(
    title="MeloFlow",
    description="A simple music streaming service.",
    version="1.0.0",
)


@app.get("/api/v1/")
async def root():
    return {"message": "Hello World"}
