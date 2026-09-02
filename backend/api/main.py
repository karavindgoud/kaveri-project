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
from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse, FileResponse, HTMLResponse
from fastapi.staticfiles import StaticFiles
from fastapi.middleware.cors import CORSMiddleware
from api.routers import auth, properties, rooms, guests, bookings, payments, reviews, rate_plans, reports
from api.dependencies.db_migration import import_legacy_data_if_needed, ensure_database_tables_exist, seed_initial_enterprise_data

@asynccontextmanager
async def lifespan(app: FastAPI):
    try:
        ensure_database_tables_exist()
        seed_initial_enterprise_data()
    except Exception as e:
        print(f"WARNING: Startup migration encountered error: {e}")
    yield

app = FastAPI(
    title="Kaveri Stays - Enterprise Hotel Management API",
    description="Production-ready REST API for Kaveri Stays Hotel Management System built with FastAPI, Django ORM, and PostgreSQL.",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
    lifespan=lifespan
)

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

@app.api_route("/api/setup-db", methods=["GET", "POST"], tags=["System Setup"])
def setup_database_endpoint():
    try:
        ensure_database_tables_exist()
        seed_initial_enterprise_data()
        return {
            "status": "success",
            "message": "Database schema created and 30 legacy reservations loaded successfully."
        }
    except Exception as e:
        return {
            "status": "error",
            "detail": str(e)
        }

@app.get("/api/health", tags=["Health Check"])
def api_health_check():
    return {
        "status": "online",
        "system": "Kaveri Stays Enterprise Engine",
        "database": "30 Legacy Reservations & Normalized Entities Active",
        "docs": "/docs"
    }

# ── SPA Frontend Static Asset Mounting & Catch-All Routing ──
frontend_dist = BASE_DIR.parent / "frontend" / "dist"
if not frontend_dist.exists():
    frontend_dist = BASE_DIR / "dist"

if frontend_dist.exists():
    assets_path = frontend_dist / "assets"
    if assets_path.exists():
        app.mount("/assets", StaticFiles(directory=str(assets_path)), name="assets")

    # Serve public static assets (images, favicon, etc.)
    @app.get("/{file_name:path}", include_in_schema=False)
    async def serve_spa_or_static(file_name: str):
        # 1. Check if exact file exists in dist
        target_file = frontend_dist / file_name
        if file_name and target_file.is_file():
            return FileResponse(target_file)
        
        # 2. Return index.html for all SPA routes (e.g. /reviews, /dashboard, /bookings)
        index_path = frontend_dist / "index.html"
        if index_path.exists():
            return FileResponse(index_path, media_type="text/html")
            
        return JSONResponse(status_code=404, content={"detail": "Not found"})
else:
    @app.get("/", tags=["Health Check"])
    def root_health_check():
        return {
            "status": "online",
            "system": "Kaveri Stays Enterprise Engine",
            "database": "PostgreSQL (kaveri)",
            "docs": "/docs"
        }
