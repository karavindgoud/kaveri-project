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
