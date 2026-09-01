import pytest
from fastapi.testclient import TestClient
from api.main import app

client = TestClient(app)

def test_root_health():
    response = client.get("/")
    assert response.status_code == 200
    assert response.json()["status"] == "online"

def test_auth_login():
    response = client.post("/api/auth/login", json={"username": "admin", "password": "admin123"})
    assert response.status_code == 200
    data = response.json()
    assert "access_token" in data
    assert data["role"] == "Admin"
    return data["access_token"]

def test_get_properties():
    token = test_auth_login()
    headers = {"Authorization": f"Bearer {token}"}
    response = client.get("/api/properties", headers=headers)
    assert response.status_code == 200
    properties = response.json()
    assert isinstance(properties, list)
    assert len(properties) > 0

def test_get_bookings():
    token = test_auth_login()
    headers = {"Authorization": f"Bearer {token}"}
    response = client.get("/api/bookings", headers=headers)
    assert response.status_code == 200
    bookings = response.json()
    assert isinstance(bookings, list)

def test_get_reports_dashboard():
    token = test_auth_login()
    headers = {"Authorization": f"Bearer {token}"}
    response = client.get("/api/reports/dashboard", headers=headers)
    assert response.status_code == 200
    data = response.json()
    assert "total_revenue" in data
    assert "occupancy_rate" in data
