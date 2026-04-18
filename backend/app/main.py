from contextlib import asynccontextmanager

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
import time

from app.db import init_db
from app.api import routes_auth
from app.api import routes_review


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: create database tables
    init_db.create_tables()
    yield
    # Shutdown: nothing needed for now


app = FastAPI(
    title="XRAY ML System API",
    description="Backend for the WEDAKAM X-Ray disease classification system",
    version="1.0.0",
    lifespan=lifespan,
)

# Allow the Vite dev server to call the API
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173", 
        "http://127.0.0.1:5173",
        "http://localhost:5174",
        "http://127.0.0.1:5174",
        "http://localhost:8000",
        "http://127.0.0.1:8000"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.middleware("http")
async def add_cors_headers(request: Request, call_next):
    response = await call_next(request)
    response.headers["Access-Control-Allow-Origin"] = "*"
    response.headers["Access-Control-Allow-Methods"] = "*"
    response.headers["Access-Control-Allow-Headers"] = "*"
    return response

# Routers
app.include_router(routes_auth.router)
app.include_router(routes_review.router)


@app.get("/")
def health_check():
    return {"status": "ok", "message": "XRAY ML System is running"}
