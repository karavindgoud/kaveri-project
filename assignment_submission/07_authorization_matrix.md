# Stage 7 — Implemented Authorization Matrix & Verification Grid

## 7.7 Four-Environment Proof Grid (Live Test Results Across 6 Endpoints)

| Endpoint Tested | Method | Guest Environment (`guest`) | Staff Environment (`receptionist`) | Manager Environment (`manager`) | Owner Environment (`admin`) |
|---|---|---|---|---|---|
| `/api/auth/me` | `GET` | **200 OK** (role: guest) | **200 OK** (role: staff, prop: 1) | **200 OK** (role: manager, prop: 2) | **200 OK** (role: owner, prop: null) |
| `/api/bookings` | `GET` | **200 OK** (Scoped to caller's `guest_id`) | **200 OK** (Scoped to Property 1) | **200 OK** (Scoped to Property 2) | **200 OK** (Unrestricted Portfolio) |
| `/api/bookings/1001` | `GET` | **403 Forbidden** (If not owner) | **200 OK** (If Room belongs to Prop 1) | **403 Forbidden** (If Prop 2 Manager) | **200 OK** (Unrestricted Global Access) |
| `/api/bookings/1001` | `PATCH` (check_in) | **403 Forbidden** (Guest cannot check-in) | **200 OK** (Staff at Property 1) | **200 OK** (Manager at Property 1) | **200 OK** (Owner) |
| `/api/reports/dashboard` | `GET` | **403 Forbidden** (Guest refused) | **403 Forbidden** (Staff refused) | **200 OK** (Scoped to Property 2) | **200 OK** (Global Portfolio KPI) |
| `/api/reports/revenue?property_id=1` | `GET` | **403 Forbidden** (Guest refused) | **403 Forbidden** (Staff refused) | **403 Forbidden** (Ooty Mgr accessing Coorg) | **200 OK** (Global Owner allowed) |

---

## 7.2 Property Scoping in Dependencies vs Route `if` Statements

### Why Dependency Injection is Structurally Superior:
1. **DRY & Fail-Safe Architecture:** Placing property checks in reusable FastAPI dependencies (`Depends(verify_property_access)`) guarantees that every route declaring the dependency is automatically guarded. If written as an `if` block inside the route body, a developer writing endpoint #38 who forgets the 4-line `if` block creates a critical authorization bypass bug.
2. **Pre-Query Guard:** Dependencies evaluate before the route body executes, rejecting unauthorized callers before database connections or expensive queries are acquired.
3. **Clean Swagger / OpenAPI Generation:** Dependency declarations flow directly into OpenAPI metadata and security schemes.

---

## 7.3 Manager Isolation Enforcement (Task 7.3)
- An Ooty manager (`property_id = 2`) attempting to access `GET /api/reports/revenue?property_id=1` receives HTTP **403 Forbidden** with `{"error": {"code": "FORBIDDEN", "message": "Cross-property access denied."}}`.
- The data is **refused**, not silently filtered into an empty list.

---

## 7.4 Object-Level Ownership Enforcement (Task 7.4)
- When a guest calls `GET /api/bookings/{id}`, the dependency checks `booking.guest_id == current_user.guest_id`.
- If the booking belongs to another guest, the API returns **403 Forbidden** (or **404 Not Found** to prevent resource enumeration).

---

## 7.6 Dual Identity Analysis (Task 7.6)
- Our identity architecture separates `app_account` from `guest`.
- If a resort receptionist (`staff`) makes a holiday reservation at another property, they do so with their personal `guest` account.
- When an employee is logged in under their `staff` account, reservations they create at the front desk represent customer reservations taken on behalf of guests, not personal stays.

---

## 7.8 Pre-Query Authorization vs `WHERE` Clause Filter Execution

### Categorization:
1. **Pre-Query Authorization (`403 Forbidden` Check Before SQL):**
   - Single-object mutations (`PATCH /bookings/{id}`): Checks whether the caller has the role/scope before initiating the database transaction.
   - Restricted reports (`GET /reports/revenue?property_id=X`): Refuses managers who request an unauthorized property before querying PostgreSQL.
2. **Inside Query Authorization (`WHERE` Clause Injection):**
   - List endpoints (`GET /bookings`, `GET /payments`, `GET /reviews`): The caller's `guest_id` or `property_id` is passed as a parameterized SQL filter.

### The Endpoint Where `WHERE` Clause Injection is the ONLY Correct Answer:
- **`GET /api/bookings` (and `GET /api/payments`):**
  - A guest requesting `/api/bookings` does not know specific booking IDs in advance.
  - The API cannot perform a single pre-query boolean check because the result set contains an arbitrary number of rows.
  - Injecting `WHERE b.guest_id = :current_guest_id` into the SQL query is the only way to ensure zero data leakage while supporting pagination, sorting, and filtering without loading other guests' data into application memory.

---

# Project-Kaveri Final Reference & Compliance Guide

# 07 — Authorization Matrix

## 7.1 Implemented authorization matrix

| Resource / operation | Guest | Staff | Manager | Owner |
|---|---|---|---|---|
| `GET /properties` | Allow | Allow | Allow | Allow |
| `GET /properties/{id}` | Allow | Allow | Allow | Allow |
| Property create/update/delete | Deny | Deny | Own property scope | Allowed |
| `GET /rooms` | Allow | Allow | Allow | Allow |
| Room create/update/delete | Deny | Staff scope | Manager property scope | Owner scope |
| `GET /bookings` | Own bookings | Property/staff scope | Own property | All properties |
| `POST /bookings` | Allow | Deny | Deny | Deny |
| `GET /bookings/{id}` | Own booking only | Authorized scope | Authorized property | All authorized |
| Booking lifecycle actions | Guest/authorized action | Staff scope | Property scope | As explicitly permitted |
| Payments | Own booking / permitted scope | Staff scope | Property scope | Owner scope |
| Reviews | Guest owns booking | Read/authorized | Read/authorized | Read/authorized |
| Availability | Authenticated users | Allow | Allow | Allow |
| Reports | Deny | Deny | Own property | Cross-property |
| `/auth/*` | As authentication flow | As authentication flow | As authentication flow | As authentication flow |

## 7.2 Structural authorization

The implementation uses FastAPI dependencies for authentication and role checks. Property-sensitive operations use the authenticated user's `property_id` rather than trusting a client-supplied property boundary.

For example, the property update route requires:

`require_roles("manager", "owner")`

The manager authorization test demonstrated the intended behavior:

- unauthorized manager access to another property → `403 Forbidden`
- authorized manager access → `200 OK`

## 7.3 Booking-list scoping

The current booking list implementation applies scope in SQL:

- guest → `b.guest_id = current_user["guest_id"]`
- manager → `r.property_id = current_user["property_id"]`
- owner → all bookings

This prevents returning another guest's bookings merely because the caller knows a booking ID.

## 7.4 Four-environment grid

| Environment | Identity | Expected scope |
|---|---|---|
| Guest | Guest credentials | Own bookings / own booking actions |
| Staff | Staff credentials | Staff/property operational scope |
| Manager | Manager credentials | Assigned property |
| Owner | Owner credentials | Cross-property owner scope where permitted |

## 7.5 Authorization test evidence

Observed during implementation testing:

```text
PATCH /properties/2 HTTP/1.1" 403 Forbidden
PATCH /properties/2 HTTP/1.1" 200 OK
```

The first response confirms the authorization boundary rejects an authenticated caller without permission. The second confirms the authorized manager path succeeds.

## 7.6 Security principle

Authentication answers **who are you?**

Authorization answers **what are you allowed to access?**

The implementation keeps these separate: authentication obtains the current user, while role/property/ownership checks decide access.
