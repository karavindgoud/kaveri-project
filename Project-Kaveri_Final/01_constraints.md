# 01 — Constraints Inventory

## 1.1 Constraint inventory

The database is responsible for core integrity rules. The Stage 1 guide records the following confirmed SQLSTATEs from deliberate violations:

| Constraint | Type | Business rule | SQLSTATE |
|---|---|---|---|
| `property_stars_check` | CHECK | Property star rating must be within the permitted range | `23514` |
| `room_type_max_occupancy_check` | CHECK | Room type occupancy must satisfy the schema rule | `23514` |
| `booking_guest_count_check` | CHECK | Booking guest count must be greater than zero | `23514` |
| `room_type_type_name_key` | UNIQUE | Room type names must be unique | `23505` |
| `no_overlapping_bookings` | EXCLUDE | A room cannot have overlapping active booking date ranges | `23P01` |

The complete inventory should also include every PRIMARY KEY, FOREIGN KEY, UNIQUE, CHECK, NOT NULL and EXCLUDE constraint returned by:

```sql
SELECT
    conrelid::regclass AS table_name,
    conname AS constraint_name,
    contype AS constraint_type,
    pg_get_constraintdef(oid) AS definition
FROM pg_constraint
WHERE connamespace = 'public'::regnamespace
ORDER BY table_name, constraint_name;
```

The assignment requires SQLSTATEs to be obtained by deliberately triggering each constraint rather than guessing them.

## 1.2 SQLSTATE → HTTP status mapping

| SQLSTATE / failure | HTTP status | Reason |
|---|---:|---|
| `23505` unique violation | 409 | Request is valid but conflicts with existing data |
| `23503` foreign-key violation | 409 | Referenced database state does not permit the operation |
| `23514` check violation | 400 | Business/data validation failure |
| `23P01` exclusion violation | 409 | Requested booking conflicts with an existing booking |
| NOT NULL violation (`23502`) | 400 | Required database value is missing |
| Invalid/missing authentication | 401 | Caller is not authenticated |
| Authenticated but insufficient role/scope | 403 | Caller is forbidden |
| Missing resource | 404 | Requested object does not exist |
| Pydantic/request-schema validation | 422 | HTTP request shape/type is invalid |

This gives multiple meaningful HTTP statuses rather than mapping every failure to 400.

## 1.3 Written answer — three data-conflict constraints

The three important well-formed requests that can conflict with existing data are:

1. A duplicate value against a UNIQUE constraint.
2. A request referencing a database state that violates a FOREIGN KEY relationship.
3. A booking whose room/date range conflicts with an existing booking under the EXCLUDE constraint.

`400 Bad Request` is not the right universal response because these requests can be structurally valid. The failure is caused by the current database state, so `409 Conflict` is appropriate for conflict cases.

## 1.4 Written answer — exclusion error leakage

PostgreSQL's raw exclusion error contains implementation details such as the constraint and conflicting values. It must not be returned directly to the client.

For a booking conflict, the API should expose only a safe message such as:

```json
{
  "detail": "Room is already booked for the selected dates"
}
```

The response must not reveal another guest's identity, booking dates, table names, or internal constraint names.

## 1.5 Guest count and maximum occupancy

`booking_guest_count_check` enforces that `guest_count > 0`.

The maximum-occupancy rule compares a booking value with `room_type.max_occupancy`, which spans two tables. In the current implementation it is checked in FastAPI after the room/room-type lookup.

Therefore this particular rule is not equivalent to a single-row CHECK constraint and must be protected by the API/business layer unless a database trigger or other cross-row mechanism is added.

## 1.6 Written answer — rule that belongs in the API

The maximum-occupancy rule belongs in booking business logic because it compares:

```text
booking.guest_count
        vs
room_type.max_occupancy
```

The API looks up the room and room type and rejects a booking that exceeds capacity.

If a caller bypasses the API and inserts directly with psql, only the database constraints that actually exist can protect the rule. This is why the database should be strengthened with a trigger/function if direct SQL access must never bypass the rule.

## 1.7 Dangerous read queries

Queries that should not be exposed directly without protection include:

- unbounded booking lists
- unbounded guest lists
- all-property reports
- expensive aggregation/report queries
- queries without ownership/property scoping
- any query allowing arbitrary SQL sort/filter expressions

Endpoint protections include pagination, authorization, parameter validation, SQL parameter binding, and whitelisted sort fields.

## 1.8 Columns guests must never see

Authentication/security-sensitive columns include:

```text
account.password_hash
refresh_token.token_hash
refresh_token.revoked
refresh_token.expires_at
```

Internal database identifiers and staff-only fields should also be excluded whenever they are not part of the public response model.

The API uses response models rather than returning raw database rows.

## 1.9 Booking state machine

The five booking states are:

```text
confirmed
    ├──> checked_in ───> checked_out
    │
    ├──> cancelled
    │
    └──> no_show
```

Illegal examples:

```text
confirmed ──X──> checked_out
checked_out ──X──> confirmed
cancelled ──X──> checked_in
no_show ──X──> checked_in
```

Role enforcement belongs at the API authorization layer. Guests may manage their own permitted booking action; staff are required for operational check-in/check-out actions.

## 1.10 Written answer — schema improvement

Once an HTTP API sits in front of the database, a useful improvement is to move any cross-table business invariant that must survive direct SQL access into a database trigger/function or other database-enforced mechanism.

The strongest candidate is the maximum-occupancy rule because it spans booking and room-type data. This prevents a direct psql INSERT from bypassing a rule that the API enforces.
