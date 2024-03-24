from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routes.api import router

app = FastAPI(
    title="MeloFlow",
    description="A simple music streaming service.",
    version="1.0.0",
)

app.include_router(router)