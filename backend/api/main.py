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

from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from api.routers import auth, properties, rooms, guests, bookings, payments, reviews, rate_plans, reports
from api.dependencies.db_migration import import_legacy_data_if_needed

app = FastAPI(
    title="Kaveri Stays - Enterprise Hotel Management API",
    description="Production-ready REST API for Kaveri Stays Hotel Management System built with FastAPI, Django ORM, and PostgreSQL.",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc"
)

# Robust CORS Configuration: dynamically accepts any http/https origin with credentials
app.add_middleware(
    CORSMiddleware,
    allow_origin_regex=r"https?://.*",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
    expose_headers=["*"],
)

# Global Exception Handler to ensure CORS headers are maintained even on unexpected internal errors
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

@app.on_event("startup")
def startup_populate():
    try:
        import_legacy_data_if_needed()
    except Exception as e:
        print(f"WARNING: Startup migration encountered error: {e}")

@app.get("/", tags=["Health Check"])
def root_health_check():
    return {
        "status": "online",
        "system": "Kaveri Stays Enterprise Engine",
        "database": "PostgreSQL (kaveri)",
        "docs": "/docs"
    }
