# Kaveri Stays — Enterprise REST API & Hospitality Suite

## Architecture Overview
Kaveri Stays is an enterprise-grade RESTful API built on **FastAPI**, **PostgreSQL**, and **React**. It exposes a secure, high-throughput management surface for ultra-luxury resort properties (Coorg, Ooty, Alleppey).

The system enforces relational exclusion constraints at the database layer (preventing double bookings, room capacity overflow, and duplicate reviews) and wraps them with synchronous Python request handlers (`def` not `async def`), centralized JWT RBAC authorization, and sanitized domain error envelopes.

---

## How to Run from an Empty Database

### 1. Database Initialization
Ensure PostgreSQL is running locally on port 5432:
```bash
# Connect as postgres admin
psql -U postgres -h localhost

# Create the clean database
CREATE DATABASE kaveri_stays;
```

Execute your schema, migrations, seed data, and auth schema in order:
```bash
psql -U postgres -d kaveri_stays -f 05_schema_final.sql
psql -U postgres -d kaveri_stays -f 06_migration.sql
psql -U postgres -d kaveri_stays -f 07_seed.sql
psql -U postgres -d kaveri_stays -f assignment_submission/02_auth_schema.sql
```

### 2. Backend Setup & Startup
Navigate to the `backend/` directory:
```bash
cd backend

# Create virtual environment (Python 3.10+)
python -m venv venv
venv\Scripts\activate   # On Windows
# source venv/bin/activate # On Linux/macOS

# Install dependencies
pip install -r requirements.txt

# Configure Environment Variables
cp .env.example .env
# Edit .env to set SECRET_KEY, DB_NAME=kaveri_stays, DB_USER, DB_PASSWORD

# Launch FastAPI Server
python -m uvicorn api.main:app --port 8000 --reload
```

The interactive OpenAPI Swagger UI is available at:
`http://127.0.0.1:8000/docs`

### 3. Frontend Dashboard Startup
Navigate to the `frontend/` directory:
```bash
cd ../frontend

# Install node dependencies
npm install

# Start Vite Development Server
npm run dev
```
Open `http://localhost:3001` to access the live Executive Console and Guest Portal.

---

## Pre-Configured Test Credentials

| Role | Username | Password | Property Scope | Permitted Access |
|---|---|---|---|---|
| **Owner (Admin)** | `admin` | `admin123` | Global (All Properties) | Full portfolio management, global reports, property creation. |
| **Manager (Ooty)** | `manager` | `manager123` | Kaveri Hilltop (Ooty) | Property 2 reports, rates, check-ins/outs. |
| **Staff (Coorg)** | `receptionist` | `receptionist123` | Kaveri Riverside (Coorg) | Property 1 check-ins, check-outs, booking intake. |
| **Guest** | `guest` | `guest123` | None | Public availability, personal bookings, reviews. |

---

## Summary of Hand-In Deliverables in this Folder

| File | Description |
|---|---|
| [`01_constraints.md`](01_constraints.md) | Stage 1 constraint inventory, SQLSTATE mapping, and written answers (1.3–1.10). |
| [`02_auth_design.md`](02_auth_design.md) | Identity model defense, role constraints, token claims, and written answers (2.6, 2.8, 2.9, 2.12). |
| [`02_auth_schema.sql`](02_auth_schema.sql) | DDL for `app_account`, roles, property scoping constraints, and refresh tokens. |
| [`03_openapi_original.yaml`](03_openapi_original.yaml) | Complete hand-written pre-reveal OpenAPI 3.0 specification. |
| [`03_authorization_matrix.md`](03_authorization_matrix.md) | Full 4-role authorization matrix and Stage 3 written answers. |
| [`04_reconciliation.md`](04_reconciliation.md) | The Interlude: specification diff, matching paths, and design defenses. |
| [`05_openapi_final.yaml`](05_openapi_final.yaml) | Reconciled final OpenAPI specification for automated test runs. |
| [`06_spec_drift.md`](06_spec_drift.md) | Diff between hand-written spec and generated schema, plus drift prevention plan. |
| [`06_postman_collection.json`](06_postman_collection.json) | Exported Postman collection with tests, auth scripts, take-a-booking flow, and attack suite. |
| [`06_postman_environments/`](06_postman_environments/) | Four environment files (`guest`, `staff`, `manager`, `owner`) with no leaked secrets. |
| [`07_authorization_matrix.md`](07_authorization_matrix.md) | Implemented authorization matrix and 4-environment test result grid. |
| [`08_break_it.md`](08_break_it.md) | Complete Stage 8 security attack log (8.1–8.14), must-succeed flows, and concurrency test harness. |
| [`09_performance.md`](09_performance.md) | N+1 query elimination, EXPLAIN ANALYZE verification, connection pooling, and pipeline analysis. |
| [`README.md`](README.md) | Operational runbook, architecture decisions, and startup instructions. |
