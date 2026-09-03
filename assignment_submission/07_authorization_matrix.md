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
