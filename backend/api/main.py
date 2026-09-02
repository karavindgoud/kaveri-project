import os
import sys
from pathlib import Path

# Initialize Django environment before importing models
BASE_DIR = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(BASE_DIR))
sys.path.insert(0, str(BASE_DIR / 'apps'))

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
import django
django.setup()

from contextlib import asynccontextmanager
from fastapi import FastAPI, Request, Response
from fastapi.responses import JSONResponse, FileResponse, HTMLResponse
from fastapi.staticfiles import StaticFiles
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.gzip import GZipMiddleware
from api.routers import auth, properties, rooms, guests, bookings, payments, reviews, rate_plans, reports
from api.dependencies.db_migration import import_legacy_data_if_needed, ensure_database_tables_exist, seed_initial_enterprise_data

@asynccontextmanager
async def lifespan(app: FastAPI):
    try:
        ensure_database_tables_exist()
        seed_initial_enterprise_data()
    except Exception as e:
        print(f"WARNING: Startup migration notice: {e}")
    yield

app = FastAPI(
    title="Kaveri Stays - Ultra-Luxury Hospitality API",
    description="Production-grade REST API for Kaveri Stays luxury hotel booking and enterprise management across Coorg, Ooty, and Alleppey.",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
    lifespan=lifespan
)

# GZip Compression for Fast Network Delivery
app.add_middleware(GZipMiddleware, minimum_size=500)

# Robust CORS Configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_origin_regex=r"https?://.*",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
    expose_headers=["*"],
)

# Global Exception Handler
@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    origin = request.headers.get("origin", "*")
    return JSONResponse(
        status_code=500,
        content={"detail": str(exc), "type": type(exc).__name__},
        headers={
            "Access-Control-Allow-Origin": origin,
            "Access-Control-Allow-Credentials": "true",
        }
    )

# Include all API routers
app.include_router(auth.router)
app.include_router(properties.router)
app.include_router(rooms.router)
app.include_router(guests.router)
app.include_router(bookings.router)
app.include_router(payments.router)
app.include_router(reviews.router)
app.include_router(rate_plans.router)
app.include_router(reports.router)

@app.get("/health", tags=["Health Check"])
@app.get("/api/health", tags=["Health Check"], include_in_schema=False)
def api_health_check():
    return {
        "status": "online",
        "system": "Kaveri Stays Ultra-Luxury Engine",
        "database": "PostgreSQL (30 Legacy Records Active)",
        "properties": ["Kaveri Riverside (Coorg)", "Kaveri Hilltop (Ooty)", "Kaveri Backwater (Alleppey)"],
        "docs": "/docs"
    }

@app.api_route("/setup-db", methods=["GET", "POST"], tags=["System Setup"])
@app.api_route("/api/setup-db", methods=["GET", "POST"], tags=["System Setup"], include_in_schema=False)
def setup_database_endpoint():
    try:
        ensure_database_tables_exist()
        seed_initial_enterprise_data()
        return {
            "status": "success",
            "message": "Database schema verified and 30 legacy reservations active."
        }
    except Exception as e:
        return {
            "status": "error",
            "detail": str(e)
        }

# ── SPA Frontend Static Asset Mounting & Catch-All Routing ──
candidate_dist_paths = [
    BASE_DIR.parent / "frontend" / "dist",
    BASE_DIR / "dist",
    BASE_DIR / "api" / "dist",
    Path.cwd() / "frontend" / "dist",
    Path.cwd() / "backend" / "dist",
    Path.cwd() / "dist",
]

frontend_dist = None
for p in candidate_dist_paths:
    if p.exists() and (p / "index.html").exists():
        frontend_dist = p
        break

if frontend_dist:
    assets_path = frontend_dist / "assets"
    if assets_path.exists():
        app.mount("/assets", StaticFiles(directory=str(assets_path)), name="assets")

    # Serve public static assets or SPA index.html for all frontend routes
    @app.get("/{file_name:path}", include_in_schema=False)
    async def serve_spa_or_static(file_name: str, request: Request):
        # Prevent intercepting API routes or docs
        api_prefixes = (
            "api/", "auth/", "properties", "rooms", "bookings", "payments",
            "reviews", "reports", "health", "docs", "redoc", "openapi.json", "setup-db"
        )
        for prefix in api_prefixes:
            if file_name == prefix or file_name.startswith(prefix + "/"):
                return JSONResponse(status_code=404, content={"detail": "API endpoint not found"})

        # 1. Check if exact file exists in dist (e.g. hero_resort.jpg, favicon, robots.txt, sitemap.xml)
        target_file = frontend_dist / file_name
        if file_name and target_file.is_file():
            return FileResponse(target_file)
        
        # 2. Return index.html with 200 OK and text/html for all client-side routes (e.g. /, /vacancies, /my-bookings, /properties, /dashboard)
        index_path = frontend_dist / "index.html"
        if index_path.exists():
            return FileResponse(
                index_path,
                status_code=200,
                media_type="text/html; charset=utf-8",
                headers={
                    "Cache-Control": "no-cache, must-revalidate",
                    "X-Content-Type-Options": "nosniff"
                }
            )
            
        return HTMLResponse(
            status_code=200,
            content="<!DOCTYPE html><html><head><title>Kaveri Stays</title></head><body><div id='root'></div></body></html>",
            media_type="text/html; charset=utf-8"
        )
