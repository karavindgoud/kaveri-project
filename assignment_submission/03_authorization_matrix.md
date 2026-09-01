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
