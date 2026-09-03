# Kaveri Hotels API

## 1. Overview

Kaveri Hotels is a FastAPI + PostgreSQL hotel-management API.

The application implements authentication, properties, room types, rooms, availability, bookings, payments, reviews, authorization, pagination, and transactional booking/payment behavior.

## 2. Prerequisites

Install:

- Python 3.12+
- PostgreSQL
- Git

Create and activate a virtual environment.

Windows PowerShell:

```powershell
python -m venv venv
.\venv\Scripts\Activate.ps1
```

Install dependencies:

```powershell
pip install -r requirements.txt
```

## 3. Database setup

Create an empty PostgreSQL database.

Run the SQL files in the required order:

1. schema
2. migrations
3. seed data

Use the exact SQL filenames supplied with the assignment/repository.

Example:

```powershell
psql -U postgres -d kaveri_hotels -f 05_schema_final.sql
psql -U postgres -d kaveri_hotels -f 06_migration.sql
psql -U postgres -d kaveri_hotels -f 07_seed.sql
```

If the repository uses different filenames, use the repository's actual filenames.

## 4. Environment configuration

Create the local `.env` file from the project's example/environment configuration.

Set the PostgreSQL connection information and JWT/authentication settings required by the application.

Do not commit `.env` or real secrets.

## 5. Run the API

From the project root:

```powershell
uvicorn app.main:app --reload
```

The API runs locally on:

```text
http://127.0.0.1:8000
```

Swagger UI:

```text
http://127.0.0.1:8000/docs
```

OpenAPI JSON:

```text
http://127.0.0.1:8000/openapi.json
```

## 6. Run in order

Recommended first-day verification:

1. Start PostgreSQL.
2. Create the empty database.
3. Apply schema.
4. Apply migrations.
5. Seed the database.
6. Configure `.env`.
7. Start FastAPI.
8. Open `/docs`.
9. Register/login a test guest.
10. Verify `/auth/me`.
11. Check `/availability`.
12. Create a booking.
13. Verify the initial deposit.
14. Test booking list pagination.
15. Test role/property authorization.
16. Run the Postman collection with the appropriate environment.

## 7. Design decisions

### Authentication

The API uses authenticated user context for protected endpoints. Role checks are separated from authentication.

### Authorization

Guests are scoped to their own bookings. Managers are scoped to their assigned property. Owners receive cross-property access only where the operation permits it.

### Booking transaction

Booking creation and the initial deposit payment are committed together. A failure rolls the transaction back.

### Booking conflicts

The database exclusion constraint is the final concurrency-safe protection against overlapping room bookings. PostgreSQL `ExclusionViolation` is translated to HTTP 409.

### Availability

Availability uses half-open date ranges `[check_in, check_out)`, so checkout on the same date as another check-in does not overlap.

### Pagination

Booking listing uses deterministic ordering with `LIMIT` and `OFFSET`.

### Payment aggregation

Payment totals and payment methods are aggregated in SQL so multiple payment rows do not duplicate a booking in the booking list.

## 8. Deliberate differences from the reveal

This implementation does not silently claim to be identical to the reveal.

Important deliberate/current differences include:

- The application retains top-level property/room/room-type CRUD routes.
- Availability is currently exposed as `GET /availability` rather than the reveal's property-nested availability route.
- Booking lifecycle is implemented in the application's existing route design.
- The current booking capacity failure returns `400`; the reveal specifies `422`.
- The current booking list returns a raw list rather than the reveal's wrapper object with `items`.
- The current implementation uses `limit` + `offset` pagination.
- The current application exposes `/auth/me`.
- Some reveal-specific contract requirements, such as strict `additionalProperties: false` everywhere and payment idempotency, must be verified against the current implementation before claiming complete parity.

These differences are recorded so the submission remains honest about implementation versus reveal behavior.

## 9. Postman

Import:

```text
06_postman_collection.json
```

Then import one of:

```text
06_postman_environments/guest.postman_environment.json
06_postman_environments/staff.postman_environment.json
06_postman_environments/manager.postman_environment.json
06_postman_environments/owner.postman_environment.json
```

Replace placeholder credentials with valid test credentials.

Run Login first. The collection stores the returned token automatically in `access_token`.

## 10. Submission files

The Stage 6–9 submission set includes:

- `05_openapi_final.yaml`
- `06_spec_drift.md`
- `06_postman_collection.json`
- `06_postman_environments/`
- `07_authorization_matrix.md`
- `08_break_it.md`
- `09_performance.md`
- `README.md`

## 11. Security

Never submit:

- real passwords
- JWT access tokens
- refresh tokens
- database passwords
- production connection strings
- API keys

Use placeholders in exported environments.
