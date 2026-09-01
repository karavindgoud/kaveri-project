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
