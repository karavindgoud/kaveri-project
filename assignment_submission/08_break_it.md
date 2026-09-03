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
