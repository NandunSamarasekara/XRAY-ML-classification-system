from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.db import init_db
from app.api import routes_auth, routes_patient, routes_xray, routes_comparison, routes_report


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
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Routers
app.include_router(routes_auth.router)
app.include_router(routes_patient.router)
app.include_router(routes_xray.router)
app.include_router(routes_comparison.router)
app.include_router(routes_report.router)


@app.get("/")
def health_check():
    return {"status": "ok", "message": "XRAY ML System is running"}
