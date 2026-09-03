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

---

# Project-Kaveri Final Reference & Compliance Guide

# Stage 3 Interlude — R1–R6 Reconciliation

## R1 — Original design committed before the reveal

The Stage 3 design was preserved before opening the reveal:

- `03_openapi_original.yaml`
- `03_authorization_matrix.md`

The original design remains unchanged. The reveal is treated as a separate specification to reconcile against.

---

## R2 — Path-by-path comparison

### Authentication

| Original | Reveal | Result |
|---|---|---|
| `POST /auth/register` | `POST /auth/register` | Same path/method |
| `POST /auth/login` | `POST /auth/login` | Same |
| `POST /auth/refresh` | `POST /auth/refresh` | Same |
| `POST /auth/logout` | `POST /auth/logout` | Same path/method, contract changed |
| `GET /auth/me` | `GET /me` | Path changed |

The reveal also changes the authentication conventions:
- `/me` is the revealed path instead of `/auth/me`.
- Logout returns `204` rather than the original `200` message response.
- Logout no longer documents a refresh-token request body.
- Refresh explicitly describes single-use refresh-token rotation and token-family invalidation on reuse.

### Properties

Original:
- `GET /properties`
- `POST /properties`
- `GET /properties/{property_id}`
- `PATCH /properties/{property_id}`
- `DELETE /properties/{property_id}`

Reveal:
- `GET /properties`
- `GET /properties/{property_id}`
- `GET /properties/{property_id}/rooms`
- `GET /properties/{property_id}/availability`
- `GET /properties/{property_id}/reviews`

Therefore the reveal removes the property create/update/delete operations and adds property-nested room, availability, and review reads.

### Room types

Original:
- `GET /room-types`
- `POST /room-types`
- `GET /room-types/{room_type_id}`
- `PATCH /room-types/{room_type_id}`
- `DELETE /room-types/{room_type_id}`

Reveal:
- No `/room-types` paths.

These original room-type endpoints are therefore missing from the reveal.

### Rooms

Original:
- `GET /rooms`
- `POST /rooms`
- `GET /rooms/{room_id}`
- `PATCH /rooms/{room_id}`
- `DELETE /rooms/{room_id}`

Reveal:
- No top-level `/rooms` paths.
- Instead: `GET /properties/{property_id}/rooms`.

The reveal therefore replaces the top-level room inventory read with a property-scoped room inventory read and removes the top-level room write operations.

### Availability

Original:
- `GET /availability`

Reveal:
- `GET /properties/{property_id}/availability`

The concept remains, but the reveal makes the property boundary part of the URL.

The original design used `property_id`, `check_in`, `check_out`, `room_type_id`, `page`, and `limit`.

The reveal uses `property_id` in the path, `from`, `to`, and optional `room_type`. It does not document pagination for this endpoint.

### Bookings

Original:
- `GET /bookings`
- `POST /bookings`
- `GET /bookings/{booking_id}`
- `PATCH /bookings/{booking_id}`

Reveal:
- `GET /bookings`
- `POST /bookings`
- `GET /bookings/{booking_id}`
- `POST /bookings/{booking_id}/check-in`
- `POST /bookings/{booking_id}/check-out`
- `POST /bookings/{booking_id}/cancel`
- `POST /bookings/{booking_id}/no-show`
- `GET /bookings/{booking_id}/payments`
- `POST /bookings/{booking_id}/payments`
- `POST /bookings/{booking_id}/review`

The main lifecycle difference is:
- Original: one `PATCH /bookings/{booking_id}` with a status.
- Reveal: separate action endpoints for check-in, check-out, cancel, and no-show.

The reveal also adds booking-scoped payment and review operations.

### Payments

Original:
- `GET /payments`
- `GET /payments/{payment_id}`
- `GET /bookings/{booking_id}/payments`
- `POST /bookings/{booking_id}/payments`

Reveal:
- `GET /bookings/{booking_id}/payments`
- `POST /bookings/{booking_id}/payments`

The reveal removes the top-level payment list/detail paths and makes payments booking-scoped.

The reveal requires an `Idempotency-Key` header on payment creation and explicitly documents `200` for a repeated idempotency key and `201` for a newly recorded payment.

### Reviews

Original:
- `GET /reviews`
- `POST /reviews`
- `GET /reviews/property/{property_id}`

Reveal:
- `POST /bookings/{booking_id}/review`
- `GET /properties/{property_id}/reviews`

The reveal makes review creation booking-scoped and makes property review listing property-nested.

### Reports

Original:
- `GET /reports/properties/{property_id}/occupancy`
- `GET /reports/properties/{property_id}/adr`
- `GET /reports/properties/{property_id}/revpar`

Reveal:
- `GET /reports/occupancy`
- `GET /reports/adr`
- `GET /reports/revpar`
- `GET /reports/revenue`

The reveal moves `property_id` from the path into a query parameter and adds revenue reporting.

### Guests

Original:
- No guest endpoints.

Reveal:
- `GET /guests`
- `GET /guests/{guest_id}`

These are new staff/manager/owner reads.

---

## R3 — Original paths missing from the reveal

The following original paths do not exist in the reveal:

```text
POST  /properties
PATCH /properties/{property_id}
DELETE /properties/{property_id}

GET   /room-types
POST  /room-types
GET   /room-types/{room_type_id}
PATCH /room-types/{room_type_id}
DELETE /room-types/{room_type_id}

GET   /rooms
POST  /rooms
GET   /rooms/{room_id}
PATCH /rooms/{room_id}
DELETE /rooms/{room_id}

GET   /availability

PATCH /bookings/{booking_id}

GET   /payments
GET   /payments/{payment_id}

GET   /reviews
POST  /reviews
GET   /reviews/property/{property_id}

GET /reports/properties/{property_id}/occupancy
GET /reports/properties/{property_id}/adr
GET /reports/properties/{property_id}/revpar
```

Some are not simply deleted; they are replaced by reveal paths with different resource nesting.

---

## R4 — Important contract/status differences

### Pagination

Original design used `page` + `limit` for list endpoints.

The reveal commits to offset pagination using `limit` + `offset`.

This is a direct design change and must be reflected in implementation.

### Empty lists

Original design documented empty lists as `200` with an empty list.

Reveal changes list responses to wrapper objects containing an `items` array, and explicitly commits to `200` with `items: []`.

### Money

Original schemas represented money as JSON numbers.

Reveal explicitly requires money amounts to be decimal strings, for example `"4500.00"` rather than `4500.0`.

This is a significant response/request schema change.

### Errors

Original design had reusable error responses, but the reveal makes the rule stronger:

> Every non-2xx response uses the `Error` envelope.

The reveal's `Error` schema has:
- `error`
- `message`
- optional `details`

### Request strictness

The reveal requires request schemas to use:

```yaml
additionalProperties: false
```

This is important for rejecting undeclared fields rather than silently ignoring them.

### 401 vs 403

Both designs distinguish authentication failure from authorization failure, but the reveal explicitly makes this a non-arguable convention:

- `401`: unauthenticated/invalid/expired/wrong token type
- `403`: authenticated but not permitted

### Booking conflict and capacity

The reveal specifies:
- overlapping booking → `409`
- guest count above room capacity → `422`

This distinction must be preserved in the implementation.

### Booking object access

The reveal chooses `404` when a guest requests another guest's booking, rather than `403`, to avoid confirming that the booking exists.

### Reviews

The reveal distinguishes:
- review before checkout → `403`
- second review for the same booking → `409`

### Logout

Original:
- `200`
- message body
- refresh-token request body

Reveal:
- `204`
- no response body
- no documented request body

### Booking lifecycle

Original:
```text
PATCH /bookings/{booking_id}
status = ...
```

Reveal:
```text
POST /bookings/{booking_id}/check-in
POST /bookings/{booking_id}/check-out
POST /bookings/{booking_id}/cancel
POST /bookings/{booking_id}/no-show
```

This is explicitly identified by the reveal as an arguable design choice.

---

## R5 — Business/security rules revealed that the implementation must satisfy

The reveal adds or makes explicit the following requirements.

### Authentication/security

1. Registration creates a guest account only.
2. Registration must reject undeclared fields such as an attempted `role`.
3. Login must not reveal whether an email exists.
4. Refresh tokens are single-use.
5. Reuse of a rotated refresh token invalidates the token family.
6. Protected endpoints distinguish `401` from `403`.

### Authorization

7. Each operation has explicit `x-roles`.
8. Guest booking/payment/review access is object/ownership scoped.
9. Staff and managers are property scoped.
10. Owner access is cross-property where explicitly allowed.
11. Owner is not automatically a permitted role for every operation.

### Booking

12. Booking price is resolved server-side.
13. Client must not supply `nightly_rate` or `total_amount`.
14. Booking creation and initial deposit are atomic.
15. Overlapping room booking returns `409`.
16. Capacity violation returns `422`.
17. Booking stays use `[check_in, check_out)`.
18. Cancelled and no-show bookings do not occupy a room.
19. Illegal lifecycle transitions are rejected.

### Payments

20. Every booking payment requires `Idempotency-Key`.
21. Repeating the same key returns the existing payment instead of inserting a duplicate.
22. Payment must be an instalment against the booking.
23. Payment responses distinguish a new payment (`201`) from an idempotent replay (`200`).

### Reviews

24. Review creation is tied to a booking.
25. Only a guest can create the review.
26. The booking must belong to the guest.
27. The booking must be checked out.
28. A booking can only receive one review.

### SQL/security

29. Sort values are whitelisted rather than interpolated directly into SQL.
30. Request schemas reject undeclared fields.
31. Error responses must not leak sensitive booking ownership information.

### Reporting

32. Occupancy, ADR, RevPAR and revenue reports are exposed.
33. Manager reports are property scoped.
34. Revenue is owner-only.
35. Report date parameters use ISO dates.

---

## R6 — Implementation reconciliation plan

The original OpenAPI file remains frozen and must not be edited.

The implementation should be adapted toward the reveal contract.

### Required endpoint changes

1. Rename `GET /auth/me` implementation to `GET /me`.
2. Change logout to the reveal's `204` contract.
3. Add property-nested room inventory:
   `GET /properties/{property_id}/rooms`.
4. Replace top-level availability with:
   `GET /properties/{property_id}/availability`.
5. Change booking listing to reveal parameters and wrapper response.
6. Replace booking status PATCH lifecycle with:
   - check-in
   - check-out
   - cancel
   - no-show action endpoints.
7. Keep booking-scoped payments and implement the required idempotency header.
8. Replace review creation with:
   `POST /bookings/{booking_id}/review`.
9. Replace property review listing with:
   `GET /properties/{property_id}/reviews`.
10. Replace report URLs with `/reports/occupancy`, `/reports/adr`, `/reports/revpar`, and `/reports/revenue`.
11. Add guest read endpoints.
12. Update response models so list endpoints return `{ "items": [...] }`.
13. Update monetary API fields to decimal strings rather than JSON numbers.
14. Add strict request schemas with `additionalProperties: false`.
15. Ensure every non-2xx response uses the reveal `Error` envelope.
16. Add/verify `x-roles` behavior in the implementation through the authorization dependencies.
17. Preserve server-side pricing and the atomic booking/deposit transaction.

### Existing implementation findings

Already demonstrated in testing:

- Availability overlap/boundary logic works.
- Booking filtering and offset pagination were added.
- Booking + deposit atomicity was verified with a forced rollback test.
- Manager property-scope authorization was fixed and tested.
- Payment/deposit amount is calculated server-side for booking creation.
- Refresh/logout behavior has already been tested for success and invalid/reused-token failure paths.

Still requiring reconciliation/testing against the reveal:

- `/me` path
- reveal booking lifecycle action endpoints
- payment idempotency
- property-nested rooms/availability/reviews
- guest endpoints
- report endpoints
- reveal list-wrapper response shapes
- decimal-string money representation
- strict request schemas
- centralized `Error` envelope
- complete reveal authorization matrix

## Conclusion

The reveal is not a minor update to the original design. It changes several resource boundaries and contracts, especially:

```text
/auth/me                         → /me

/availability                    → /properties/{property_id}/availability

/rooms                           → /properties/{property_id}/rooms

PATCH /bookings/{id}             → action endpoints

/reviews                         → booking-scoped create + property-scoped list

/reports/properties/{id}/...     → /reports/... + property_id query

top-level payments               → booking-scoped payments

new                              → /guests and /guests/{guest_id}
```

The original design file and authorization matrix should remain unchanged. The implementation is what should be reconciled to the reveal.
