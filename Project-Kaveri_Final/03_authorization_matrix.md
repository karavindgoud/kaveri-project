# Stage 3 — Surface Design & Authorization Matrix

## 3.11 Full Authorization Matrix (Committed Spec)

| Endpoint | Method | Guest | Staff | Manager | Owner | Description / Policy |
|---|---|---|---|---|---|---|
| `/api/auth/register` | `POST` | **ALLOWED** | **ALLOWED** | **ALLOWED** | **ALLOWED** | Public registration (Creates Guest account only). |
| `/api/auth/login` | `POST` | **ALLOWED** | **ALLOWED** | **ALLOWED** | **ALLOWED** | Public authentication endpoint. |
| `/api/auth/me` | `GET` | **ALLOWED** | **ALLOWED** | **ALLOWED** | **ALLOWED** | Returns caller's own profile. |
| `/api/properties` | `GET` | **ALLOWED** | **ALLOWED** | **ALLOWED** | **ALLOWED** | Public / authenticated resort list. |
| `/api/properties` | `POST` | **DENIED** | **DENIED** | **DENIED** | **ALLOWED** | Owner only may add resort properties. |
| `/api/rooms/types` | `GET` | **ALLOWED** | **ALLOWED** | **ALLOWED** | **ALLOWED** | List public room types. |
| `/api/rooms/types` | `POST` | **DENIED** | **DENIED** | **ALLOWED** | **ALLOWED** | Managers and Owner configure room types. |
| `/api/rooms` | `GET` | **ALLOWED** | **ALLOWED** | **ALLOWED** | **ALLOWED** | List suite inventory. |
| `/api/rooms` | `POST` | **DENIED** | **DENIED** | **ALLOWED** | **ALLOWED** | Provision new room. |
| `/api/rooms/availability` | `GET` | **ALLOWED** | **ALLOWED** | **ALLOWED** | **ALLOWED** | Check inventory availability. |
| `/api/bookings` | `GET` | **ALLOWED** (Own) | **ALLOWED** (Property) | **ALLOWED** (Property) | **ALLOWED** (Global) | Filtered bookings list. |
| `/api/bookings` | `POST` | **ALLOWED** | **ALLOWED** | **ALLOWED** | **ALLOWED** | Book suite with deposit. |
| `/api/bookings/{id}` | `GET` | **ALLOWED** (Own) | **ALLOWED** (Property) | **ALLOWED** (Property) | **ALLOWED** (Global) | Single booking details. |
| `/api/bookings/{id}` | `PATCH` | **ALLOWED** (Cancel only) | **ALLOWED** (Check-in/out) | **ALLOWED** | **ALLOWED** | Lifecycle state transition. |
| `/api/payments` | `GET` | **ALLOWED** (Own) | **ALLOWED** (Property) | **ALLOWED** (Property) | **ALLOWED** (Global) | Payment ledger. |
| `/api/payments` | `POST` | **DENIED** | **ALLOWED** | **ALLOWED** | **ALLOWED** | Settle payment transaction. |
| `/api/reviews` | `GET` | **ALLOWED** | **ALLOWED** | **ALLOWED** | **ALLOWED** | Public customer reviews. |
| `/api/reviews` | `POST` | **ALLOWED** (Own checked-out) | **DENIED** | **DENIED** | **DENIED** | Post-stay review submission. |
| `/api/reports/dashboard` | `GET` | **DENIED** | **DENIED** | **ALLOWED** (Property) | **ALLOWED** (Global) | Executive analytics summary. |
| `/api/reports/revenue` | `GET` | **DENIED** | **DENIED** | **ALLOWED** (Property) | **ALLOWED** (Global) | Financial revenue breakdown. |
| `/api/reports/guests` | `GET` | **DENIED** | **DENIED** | **ALLOWED** (Property) | **ALLOWED** (Global) | Guest leaderboard metrics. |

---

## Written Answers for Stage 3

### 3.2 Availability Endpoint Design
- **Path:** `GET /api/rooms/availability`
- **Parameters:** `property_id` (int, required), `check_in` (date, required), `check_out` (date, required), `room_type_id` (int, optional).
- **Semantics:** Queries the database using exclusion boundaries (`daterange(check_in, check_out, '[)')`) to return all physical rooms belonging to that property not overlapping active bookings.

### 3.3 Booking Lifecycle Transition Design
- **Selected Design:** `PATCH /api/bookings/{id}` with `{ "status": "..." }`.
- **Justification:** State machine transitions are enforced centrally through a unified transition validator function. This avoids duplicating authorization checks, audit logging, and concurrency locks across multiple fragmented endpoints.

### 3.4 Payment Idempotency Design
- **Mechanism:** The client supplies an `Idempotency-Key: <UUID>` header.
- **Handling:** The server records the idempotency key upon first settlement. Retried requests with the identical key return the previously processed payment receipt with HTTP `200 OK` rather than inserting a duplicate charge.

### 3.5 Reporting Tree vs Property Tree
- **Selected Structure:** Unified `/api/reports/...` endpoints with automatic dependency-level property scoping.
- **Justification:** Avoids proliferating routes like `/properties/{id}/reports/...` and enforces property filtering inside the database `WHERE` clause based on the caller's JWT `property_id`.

### 3.6 Pagination Strategy
- **Choice:** Offset pagination (`limit`, `offset`) with a default of `limit=50`, `max_limit=100`.
- **Offset at Page 400 (`offset=20000`):** Postgres must scan and discard 20,000 index entries. For large tables, keyset pagination (`after_id=<id>`) is used to maintain constant $O(1)$ lookup time.

### 3.7 Empty Result Set Rule
- **Rule:** An empty result set always returns **`200 OK` with an empty JSON array `[]`**.
- **Rule Defense:** `404 Not Found` indicates the collection resource endpoint does not exist. An empty array represents a valid collection with zero items matching the filter criteria.

### 3.8 Distinguishing 401 Unauthorized vs 403 Forbidden
- **`401 Unauthorized`:** Identity is unverified or missing (no token, expired token, forged signature). The client can authenticate to fix the issue.
- **`403 Forbidden`:** Identity is confirmed, but the authenticated principal lacks permission to perform the action (e.g. a guest attempting to view financial reports, or an Ooty manager attempting to view Coorg revenue). Re-authenticating with the same credentials will not help.

### 3.9 Date Formatting & Timezones
- **Format:** ISO 8601 Calendar Date `YYYY-MM-DD` (e.g., `2026-09-10`).
- **Why Date instead of Timestamp for check-in:** Hotel reservations are booked in calendar dates (nights), not specific seconds. Check-in and check-out policies are governed by local property rules (e.g., 2:00 PM check-in).
- **Cross-Timezone Changes:** If properties span multiple time zones, calendar dates remain invariant while the check-in time cutoff is evaluated in the property's local timezone.

### 3.10 Unified Error Envelope Schema
```json
{
  "error": {
    "code": "CONSTRAINT_VIOLATION",
    "message": "Human readable explanation of the failure without leaking internal table schema.",
    "status": 409,
    "details": [
      {
        "field": "check_in",
        "message": "Selected dates conflict with an existing reservation."
      }
    ]
  }
}
```

### 3.12 Endpoints Decided NOT to Build
1. **`DELETE /bookings/{id}`:** Bookings are historical commercial legal records and must never be physically deleted from the database. Lifecycle termination is handled exclusively via status transition to `cancelled`.
2. **`POST /bookings` with Client-Supplied Price:** Clients must never be allowed to pass the nightly rate in the request body. Rates are resolved server-side from `rate_plan`.

---

# Project-Kaveri Final Reference & Compliance Guide

# Stage 3.11 — Authorization Matrix

**Legend:** A = allowed, D = denied. `*` means property-scoped. `**` means object/ownership-scoped.

## Rules

- **401** = the caller is not successfully authenticated (missing, invalid, expired token, or wrong token type).
- **403** = the caller is authenticated but lacks the required role/scope.
- A guest accessing another guest's booking/payment/review receives **404** so object existence is not disclosed.
- Staff and managers belong to exactly one property; their operational reads/writes are limited to that property.
- The owner is cross-property.
- List endpoints use offset pagination (`page`, `limit`) uniformly. Page 400 with no rows returns `200` and an empty list.
- Empty result sets always return `200`, never `404`.
- API dates are ISO-8601 `YYYY-MM-DD`.

| Endpoint | Guest | Staff | Manager | Owner |
|---|:---:|:---:|:---:|:---:|
| POST /auth/register | A | A | A | A |
| POST /auth/login | A | A | A | A |
| POST /auth/refresh | A | A | A | A |
| POST /auth/logout | A | A | A | A |
| GET /auth/me | A | A | A | A |
| GET /properties | A | A | A | A |
| POST /properties | D | D | A* | A |
| GET /properties/{property_id} | A | A | A* | A |
| PATCH /properties/{property_id} | D | D | A* | A |
| DELETE /properties/{property_id} | D | D | D | A |
| GET /room-types | A | A | A | A |
| POST /room-types | D | D | A* | A |
| GET /room-types/{room_type_id} | A | A | A* | A |
| PATCH /room-types/{room_type_id} | D | D | A* | A |
| DELETE /room-types/{room_type_id} | D | D | D | A |
| GET /rooms | A | A* | A* | A |
| POST /rooms | D | D | A* | A |
| GET /rooms/{room_id} | A | A* | A* | A |
| PATCH /rooms/{room_id} | D | D | A* | A |
| DELETE /rooms/{room_id} | D | D | D | A |
| GET /availability | A | A | A | A |
| GET /bookings | A** | A* | A* | A |
| POST /bookings | A | D | D | D |
| GET /bookings/{booking_id} | A** | A* | A* | A |
| PATCH /bookings/{booking_id} | A** | A* | A* | A |
| GET /bookings/{booking_id}/payments | A** | A* | A* | A |
| POST /bookings/{booking_id}/payments | A** | A* | A* | A |
| GET /payments | A** | A* | A* | A |
| GET /payments/{payment_id} | A** | A* | A* | A |
| GET /reviews | A | A | A | A |
| POST /reviews | A** | D | D | D |
| GET /reviews/property/{property_id} | A | A | A* | A |
| GET /reports/properties/{property_id}/occupancy | D | D | A* | A |
| GET /reports/properties/{property_id}/adr | D | D | A* | A |
| GET /reports/properties/{property_id}/revpar | D | D | A* | A |

## Stage 3 design decisions

### 3.3 Booking lifecycle
I chose one `PATCH /bookings/{booking_id}` with a new `status` rather than four separate action endpoints. The state machine remains enforced by the server: `confirmed -> checked_in -> checked_out`, `confirmed -> cancelled`, and `confirmed -> no_show`. Illegal transitions are rejected.

### 3.4 Payments
Payments are instalments. Every payment request requires an `Idempotency-Key`. Retrying the same key returns the existing payment instead of inserting a duplicate. Without an idempotency key, a lost response could cause a second payment when the front-desk tablet retries.

### 3.5 Reporting
Reports live under `/reports/properties/{id}/...`. This makes the property boundary explicit and makes manager authorization structural. The owner can use the same endpoints across all properties; managers cannot cross their assigned property.

### 3.6 Pagination
Offset pagination is used uniformly. `page` starts at 1 and `limit` is capped at 100. Page 400 is valid and returns an empty list if there are no rows there.

### 3.7 Empty results
Every list endpoint returns `200` with an empty list when nothing matches.

### 3.8 401 vs 403
`401` means authentication failed or is absent. `403` means authentication succeeded but authorization failed. A guest trying to read another guest's booking is `404`, because object-level ownership hides the object's existence.

### 3.9 Dates
All date values crossing the API boundary use `YYYY-MM-DD`. Check-in/check-out are dates because the hotel sells nights, not an instant in time. If Kaveri Stays opens in another timezone and starts exposing timestamps, the property timezone must be stored and timestamp conversion must become timezone-aware.

### 3.10 Error envelope
All failures use one envelope:

```json
{
  "error": "conflict",
  "message": "Room is already booked for the selected dates",
  "details": {}
}
```

The same shape is used for validation, authentication, authorization, not-found, and database-conflict errors.

### 3.12 Endpoint deliberately not built
I would not build `DELETE /bookings/{id}`. Cancellation is the business operation because booking history, payments, reviews, reporting, and audit history depend on retaining the booking record. Hard deletion would destroy that history.
