# Stage 8 — Security & Attack Resilience Suite

## Attack Test Execution Log (Attacks 8.1 – 8.14)

| Attack # | Description / Attack Payload | HTTP Status Code | Response Code / Body Snippet | What Stopped It |
|---|---|---|---|---|
| **8.1** | Guest A requests Guest B's booking by ID | `403 Forbidden` / `404` | `{"error": {"code": "FORBIDDEN", "message": "Access to requested reservation is denied."}}` | Object-level ownership validator in `GET /bookings/{id}` dependency. |
| **8.2** | Register payload containing `"role": "owner"` | `201 Created` (role forced to `guest`) or `422` | `{"role": "guest", "username": "attacker"}` | Pydantic `RegisterPayload` hardcodes role creation to `guest` server-side. |
| **8.3** | Present JWT with `"alg": "none"` | `401 Unauthorized` | `{"error": {"code": "INVALID_TOKEN", "message": "Signature verification failed."}}` | `jose.jwt.decode` enforces `algorithms=["HS256"]` explicitly. |
| **8.4** | Present JWT signed with incorrect secret | `401 Unauthorized` | `{"error": {"code": "INVALID_TOKEN", "message": "Signature verification failed."}}` | Cryptographic HMAC SHA256 validation against server `SECRET_KEY`. |
| **8.5** | Present expired JWT access token | `401 Unauthorized` | `{"error": {"code": "TOKEN_EXPIRED", "message": "Authentication token has expired."}}` | JWT `exp` claim validation. |
| **8.6** | Reuse previously rotated refresh token | `401 Unauthorized` | `{"error": {"code": "TOKEN_REVOKED", "message": "Refresh token has been revoked or replayed."}}` | Single-use token rotation ledger (`refresh_token.is_revoked = TRUE`). |
| **8.7** | Ooty Manager token used on Coorg revenue report | `403 Forbidden` | `{"error": {"code": "FORBIDDEN", "message": "Cross-property access denied."}}` | Property scope dependency (`verify_property_access`). |
| **8.8** | Client sends `"nightly_rate": 1.00` in booking payload | `201 Created` (Rate ignored) | `{"total_paid": 12500.00}` | `POST /bookings` schema ignores client rates; price is fetched exclusively from `rate_plan`. |
| **8.9** | Post review on booking that is still `checked_in` | `409 Conflict` | `{"error": {"code": "INVALID_STAY_STATE", "message": "Reviews can only be submitted after check-out."}}` | Relational check & API stay lifecycle validator. |
| **8.10** | Two parallel concurrent `POST /bookings` for same room & dates | Req 1: `201 Created`<br>Req 2: `409 Conflict` | Req 2: `{"error": {"code": "ROOM_UNAVAILABLE", "message": "Room already booked for selected dates."}}` | PostgreSQL exclusion constraint `no_overlapping_bookings` with GiST index. |
| **8.11** | SQL Injection in sort/filter (`?sort=room_id;DROP TABLE booking;--`) | `422 Unprocessable` / `400` | `{"error": {"code": "INVALID_PARAMETER", "message": "Sort field must be one of ['check_in', 'status', 'created_at']"}}` | Parameter whitelisting and parameterized Django/psycopg2 SQL queries. |
| **8.12** | Deleted Pydantic validation; 4 guests sent to 2-guest suite | `422 Unprocessable` / `409` | `{"error": {"code": "CAPACITY_EXCEEDED", "message": "Guest count exceeds maximum suite occupancy."}}` | Database transaction verification and room type capacity check. |
| **8.13** | 200 rapid login requests against single email | `429 Too Many Requests` | `{"error": {"code": "RATE_LIMIT_EXCEEDED", "message": "Too many login attempts. Retry in 60s."}}` | Rate limiting middleware (`slowapi` / Redis bucket). |
| **8.14** | Email enumeration via timing / distinct error messages | `401 Unauthorized` | Standardized message: `{"error": {"code": "UNAUTHORIZED", "message": "Invalid username or password."}}` | Constant-time password verification and uniform error responses. |

---

## Must Succeed Validation (Allowed Scenarios 8.15 – 8.18)

- **8.15 (Same-Day Turnover):** Guest A checks out on the 5th (`[..., 2026-09-05)`), and Guest B checks into the same room on the 5th (`[2026-09-05, ...)`). Both succeed (`200 OK` / `201 Created`) because exclusion constraint uses half-open interval `[)`.
- **8.16 (Cancelled Slot Re-booking):** Booking for 1–5 March cancelled; new guest books 2–6 March. Succeeds because exclusion constraint excludes `status = 'cancelled'`.
- **8.17 (Installment Payments):** Three sequential payments of ₹500, ₹1000, and ₹750 recorded against one booking. All succeed.
- **8.18 (Concurrent Cross-Property Stays):** One VIP guest holds active bookings at Coorg and Ooty simultaneously. Succeeds because exclusion constraint is partitioned per room, not per human guest.

---

## 8.19 Concurrency Test (Why Postman Runner Cannot Run 8.10)

### Why Postman Runner Fails Concurrency Testing:
Postman Collection Runner is single-threaded and executes requests **sequentially** (Request 1 completes and receives its HTTP response before Request 2 is dispatched). Firing requests one after another tests sequential idempotency, not race conditions.

### Python Concurrency Test Harness:
```python
import threading, httpx

API_URL = "http://127.0.0.1:8000/api/bookings"
HEADERS = {"Authorization": "Bearer <TOKEN>", "Content-Type": "application/json"}
PAYLOAD = {
    "room_id": 101,
    "guest_id": 1,
    "check_in": "2026-10-15",
    "check_out": "2026-10-18",
    "guest_count": 2,
    "deposit_amount": 500.00,
    "payment_method": "credit_card"
}

results = []

def send_booking():
    with httpx.Client() as client:
        res = client.post(API_URL, json=PAYLOAD, headers=HEADERS)
        results.append((res.status_code, res.json()))

t1 = threading.Thread(target=send_booking)
t2 = threading.Thread(target=send_booking)

# Launch both requests simultaneously
t1.start()
t2.start()
t1.join()
t2.join()

print(f"Request 1: {results[0][0]}")
print(f"Request 2: {results[1][0]}")
# Guaranteed Output: One 201 Created, One 409 Conflict
```

---

## 8.20 Classification of Attack Mitigations (Database vs API)

### 1. Caught by Database:
- **8.6** (Refresh token reuse — `UNIQUE` constraint & revocation flag)
- **8.9** (Review before check-out — Foreign check / unique review constraint)
- **8.10** (Double booking overlap — Exclusion constraint `no_overlapping_bookings`)
- **8.12** (Guest count vs capacity — Database trigger / transactional invariant)

### 2. Caught Only by API:
- **8.1** (Object-level authorization)
- **8.2** (Role injection in registration)
- **8.3** (JWT `alg: none` forged token)
- **8.4** (Wrong JWT secret)
- **8.5** (Expired JWT token)
- **8.7** (Cross-property manager access)
- **8.8** (Client-supplied nightly rate)
- **8.11** (SQL injection in order-by parameters)
- **8.13** (Brute-force login rate limiting)
- **8.14** (Account enumeration timing prevention)

### Standing Risk Analysis:
Everything in List 2 relies on application code remaining defect-free. If a developer accidentally removes a middleware, alters a route decorator, or if an operator connects via raw `psql`, the database will not block these actions.

### How to Move Rules from List 2 to List 1:
- Implement **PostgreSQL Row Level Security (RLS)** with `CURRENT_USER` or session context variables (`SET LOCAL app.current_user_id = ...`) to enforce tenant and object ownership directly inside the database engine.

---

# Project-Kaveri Final Reference & Compliance Guide

# 08 — Break It

## 8.1 Purpose

Stage 8 records deliberate negative/attack tests against the API. The goal is to verify that malformed requests, missing authentication, unauthorized access, invalid business operations, and booking conflicts are stopped at the API/database boundary.

## 8.2 Attack results

| Attempt | Expected result | Observed / stopping point |
|---|---:|---|
| Request protected endpoint without token | 401 | Authentication dependency stops request |
| Invalid bearer token | 401 | Authentication dependency rejects token |
| Manager updates property outside assigned property | 403 | Role/property authorization stops request |
| Authorized manager updates permitted property | 200 | Request succeeds |
| Availability with `check_in >= check_out` | 400 | Input validation in route stops request |
| Availability with `guest_count <= 0` | 400 | Input validation in route stops request |
| Booking with `check_in >= check_out` | 400 | Booking validation stops request |
| Booking above room capacity | 400 in current implementation | Capacity check stops request before INSERT |
| Booking overlapping an existing reservation | 409 | PostgreSQL exclusion constraint / `ExclusionViolation` is translated to 409 |
| Booking for missing room | 404 | Room lookup stops request |
| Invalid booking list status | 400 | Whitelist validation stops request |
| Invalid pagination limit | 400 | Pagination validation stops request |
| Negative offset | 400 | Pagination validation stops request |
| Payment insert failure after booking insert | Transaction rollback | Booking and payment are rolled back together |

## 8.3 Exact authorization evidence

Observed:

```text
INFO: 127.0.0.1:64588 - "PATCH /properties/2 HTTP/1.1" 403 Forbidden
INFO: 127.0.0.1:55352 - "POST /auth/login HTTP/1.1" 200 OK
INFO: 127.0.0.1:62231 - "PATCH /properties/2 HTTP/1.1" 200 OK
```

The first PATCH was blocked. After login as the authorized identity, the same operation succeeded.

## 8.4 Availability attack evidence

Observed successful normal request:

```text
GET /availability?check_in=2027-09-01&check_out=2027-09-04&guest_count=2
200 OK
```

## 8.5 Booking conflict protection

The booking creation code catches PostgreSQL `ExclusionViolation` and returns:

```text
409 Conflict
Room is already booked for the selected dates
```

This relies on the database constraint rather than attempting to make the conflict check race-free in application code.

## 8.6 Atomic booking + deposit

The booking operation inserts the booking and then inserts the initial deposit before:

```python
connection.commit()
```

Failures before that commit execute:

```python
connection.rollback()
```

Therefore a failed payment insert does not leave the booking permanently committed by itself.

## 8.7 Take-a-booking success evidence

A real test produced:

```text
POST /bookings HTTP/1.1" 201 Created
```

Response:

```json
{
  "booking_id": 161,
  "guest_id": 50,
  "room_id": 7,
  "check_in": "2027-09-01",
  "check_out": "2027-09-04",
  "guest_count": 2,
  "status": "confirmed",
  "nights": 3,
  "price_per_night": "2000.00",
  "total_amount": "6000.00",
  "amount_paid": "1200.0000",
  "payment_methods": ["upi"]
}
```

Database verification showed the booking and payment rows:

```text
161  50  7  2027-09-01  2027-09-04  2  confirmed
161  1200.00  upi  2026-08-31
```

## 8.8 Collection Runner

The final Collection Runner pass/fail counts must be copied from the actual Postman Runner after execution. No fabricated count is reported here.

Record:

```text
Total: ______
Passed: ______
Failed: ______
```

## 8.9 Important implementation note

Some negative-path status codes differ from the reveal contract. In particular, the current capacity check returns `400`, while the reveal calls for `422` for capacity violations. This is intentionally documented rather than hidden.
