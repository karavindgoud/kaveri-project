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

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from api.routers import auth, properties, rooms, guests, bookings, payments, reviews, rate_plans, reports

app = FastAPI(
    title="Kaveri Stays - Enterprise Hotel Management API",
    description="Production-ready REST API for Kaveri Stays Hotel Management System built with FastAPI, Django ORM, and PostgreSQL.",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc"
)

# Enable CORS for React frontend (Vite)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
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
    import threading
    from api.dependencies.db_migration import import_legacy_data_if_needed
    thread = threading.Thread(target=import_legacy_data_if_needed)
    thread.start()
    thread.join()

@app.get("/", tags=["Health Check"])
def root_health_check():
    return {
        "status": "online",
        "system": "Kaveri Stays Enterprise Engine",
        "database": "PostgreSQL (kaveri)",
        "docs": "/docs"
    }
