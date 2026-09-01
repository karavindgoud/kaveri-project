# Stage 4 — Interlude & Specification Reconciliation

## R1. Commit Confirmation
- `03_openapi_original.yaml` and `03_authorization_matrix.md` have been committed as the baseline pre-reveal design artifacts.

---

## R2. Path Comparison Matrix (Original Spec vs Reveal)

| Revealed Endpoint | Hand-Written Equivalent | Status / Mapping | Notes |
|---|---|---|---|
| `POST /api/auth/register` | `POST /api/auth/register` | **Exact Match** | Creates guest account only. |
| `POST /api/auth/login` | `POST /api/auth/login` | **Exact Match** | Issues JWT access token with role & property scope. |
| `POST /api/auth/refresh` | `POST /api/auth/refresh` | **Exact Match** | Rotates refresh token in database. |
| `POST /api/auth/logout` | `POST /api/auth/logout` | **Exact Match** | Revokes session. |
| `GET /api/auth/me` | `GET /api/auth/me` | **Exact Match** | Caller's profile shaped by role. |
| `GET /api/properties` | `GET /api/properties` | **Exact Match** | List of resorts. |
| `GET /api/rooms/availability` | `GET /api/rooms/availability` | **Exact Match** | Query 4.1 over HTTP with boundary check. |
| `GET /api/bookings` | `GET /api/bookings` | **Exact Match** | Filtered by property/status/date. |
| `POST /api/bookings` | `POST /api/bookings` | **Exact Match** | Atomic booking creation + deposit. |
| `GET /api/bookings/{id}` | `GET /api/bookings/{id}` | **Exact Match** | Returns booking details with object-level check. |
| `PATCH /api/bookings/{id}` | `PATCH /api/bookings/{id}` | **Exact Match** | State machine transition validator. |
| `POST /api/bookings/{id}/payments` | `POST /api/payments` | **Path Variant** | Sub-resource path vs direct `/payments` path. Reconciled to `/api/bookings/{id}/payments` in `05_openapi_final.yaml`. |
| `POST /api/bookings/{id}/review` | `POST /api/reviews` | **Path Variant** | Sub-resource path vs `/reviews`. Reconciled in `05_openapi_final.yaml`. |
| `GET /api/reports/dashboard` | `GET /api/reports/dashboard` | **Exact Match** | Real-time operations summary. |
| `GET /api/reports/revenue` | `GET /api/reports/revenue` | **Exact Match** | Property, method, and room type revenue breakdown. |
| `GET /api/reports/guests` | `GET /api/reports/guests` | **Exact Match** | VIP leaderboard metrics. |

---

## R3. Paths in Original Spec not in Reveal
- `GET /api/payments`: Original spec provided a general payment ledger query. Reconciled to support both top-level list and sub-resource nested lookup under `/bookings/{id}/payments`.
- `GET /api/rooms/types`: Explicit route for room categories. Preserved as a complementary helper route for front-desk clients.

---

## R4. Status Code Discrepancies & Defenses

1. **Overlapping Booking Requests (400 vs 409):**
   - *Original Spec:* `409 Conflict`.
   - *Reveal:* `409 Conflict`.
   - *Defense:* `409 Conflict` is semantically correct per RFC 9110 because the payload is valid, but conflicts with existing exclusion constraint state.
2. **Reviewing Uncompleted Stays (400 vs 409 vs 422):**
   - *Original Spec:* `409 Conflict`.
   - *Defense:* Attempting to review a stay that is still checked-in or cancelled conflicts with stay lifecycle invariants.

---

## R5. Reveal Additions & Invariant Protections

- **Sub-Resource Binding (`/bookings/{id}/payments`):** Binding payment deposits and installments directly under the booking URL reinforces object-level authorization and prevents accidental cross-booking payment allocations.
- **Strict Response DTO Sanitization:** Explicit response schemas eliminate raw SQL row leaks, preventing internal password hashes and metadata from reaching public clients.

---

## R6. Final Spec Harmonization
`05_openapi_final.yaml` incorporates all revealed standard sub-resource routes and status codes to ensure 100% compliance with automated test suites.
