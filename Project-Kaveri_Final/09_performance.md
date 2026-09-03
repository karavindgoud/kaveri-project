# 09 — Performance

## 9.1 Query-count inventory

The API uses direct PostgreSQL access through `get_connection()` and a cursor per request.

Current important read patterns:

### GET /bookings

The current implementation performs one SQL statement for the booking list. Payment information is aggregated in a derived table:

```sql
SELECT
    booking_id,
    SUM(amount) AS amount_paid,
    ARRAY_AGG(DISTINCT method::varchar) AS payment_methods
FROM payment
GROUP BY booking_id
```

This avoids multiplying booking rows when a booking has multiple payment rows.

### GET /availability

Availability is calculated with one SQL statement using `NOT EXISTS` and PostgreSQL `daterange` overlap:

```sql
AND NOT EXISTS (
    SELECT 1
    FROM booking b
    WHERE b.room_id = r.room_id
      AND b.status IN ('confirmed', 'checked_out')
      AND daterange(b.check_in, b.check_out, '[)')
          &&
          daterange(%s, %s, '[)')
)
```

### POST /bookings

The create operation performs the required database operations inside one transaction:

1. Read room/capacity/price.
2. Insert booking.
3. Insert deposit payment.
4. Commit.

## 9.2 EXPLAIN evidence

A real `EXPLAIN (ANALYZE, BUFFERS)` output was not captured in the available test record for this submission. It would be misleading to invent planner costs, row counts, or execution times.

For the final run, capture EXPLAIN for at least:

```sql
EXPLAIN (ANALYZE, BUFFERS)
SELECT ...
FROM room r
JOIN room_type rt ON rt.room_type_id = r.room_type_id
WHERE rt.max_occupancy >= 2
  AND NOT EXISTS (...);
```

and the booking-list query.

Paste the exact PostgreSQL output below:

```text
[PASTE ACTUAL EXPLAIN OUTPUT HERE]
```

## 9.3 Argument 1 — correctness before micro-optimization

The booking conflict is enforced by the PostgreSQL exclusion constraint and translated from `ExclusionViolation` to HTTP 409. This is preferable to relying only on a separate application-level availability check because two concurrent transactions can otherwise both observe a room as available.

## 9.4 Argument 2 — avoid N+1 payment queries

The booking list aggregates payment rows in SQL rather than executing a separate payment query for every booking. This keeps the list operation at a fixed query count instead of growing linearly with the number of bookings returned.

## 9.5 Argument 3 — deterministic pagination

The booking list uses:

```sql
ORDER BY b.booking_id DESC
LIMIT %s
OFFSET %s
```

This makes page ordering deterministic and prevents an unordered result set from changing between requests.

The current design uses offset pagination because that is what was implemented for Stage 6. For very large tables, keyset pagination could reduce the cost of large offsets, but that would be a deliberate contract change rather than an invisible optimization.

## 9.4 Index considerations

The database should have indexes supporting:

- booking room/date conflict checks
- booking lookup by `booking_id`
- guest booking lookup
- room property lookup
- payment lookup by `booking_id`

The database's exclusion constraint is especially important for the room/date overlap invariant.
