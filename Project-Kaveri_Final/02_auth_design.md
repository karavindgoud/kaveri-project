# 02 — Authentication Design

## 2.1 Identity model

Credentials belong in a separate `account` table rather than in `guest`.

Reasoning:

- Most historical guests never need login credentials.
- Staff are not guests.
- A person can be represented as a guest independently of authentication.
- Authentication data such as password hashes and refresh-token state should be separated from guest profile data.
- If a guest is later hired, the same human record can be associated with an appropriate staff/manager account without putting staff credentials into the guest table.

The account therefore references a guest only when the account represents a guest.

## 2.2 Roles

The four roles are:

```text
guest
staff
manager
owner
```

Property assignment:

```text
guest   → no required property assignment
staff   → exactly one property
manager → exactly one property
owner   → no property assignment
```

The application also carries `guest_id` and `property_id` relationships so authorization can be based on the authenticated identity.

## 2.3 Password storage

Passwords are hashed with bcrypt using Passlib:

```python
CryptContext(
    schemes=["bcrypt"],
    deprecated="auto"
)
```

The plaintext password is never stored.

## 2.4 Registration

`POST /auth/register` creates a guest account and a guest record. The role is set server-side to `guest`; it is not accepted from the registration request.

Staff accounts must not be self-service because allowing arbitrary users to register as staff/manager/owner would be a privilege-escalation vulnerability.

## 2.5 Access token

The access token is a short-lived JWT.

## 2.6 Written answer — access-token claims

The current access token contains:

| Claim | Purpose |
|---|---|
| `sub` | Identifies the account making the request |
| `role` | Carries the authenticated role for authorization decisions |
| `type` | Distinguishes access tokens from refresh tokens |
| `exp` | Makes the access token expire |

The implementation creates these claims directly when issuing the JWT. fileciteturn22file0L40-L58

I deliberately keep sensitive information out of the token:

- password hashes
- refresh-token hashes
- database credentials
- personal/internal notes
- unnecessary financial data

Anyone who can read a JWT payload can read its claims, so the token must contain only information suitable for client-side visibility.

Property scope is looked up from the database for the current user rather than trusting a property identifier supplied by the client.

## 2.7 Refresh tokens

Refresh tokens have a longer expiry and are stored server-side as SHA-256 hashes. On refresh, the existing token is revoked and a new refresh token is issued. fileciteturn27file0L22-L39 fileciteturn27file0L93-L151

This means a rotated refresh token cannot simply be reused successfully.

## 2.8 Written answer — fired manager

If a manager is fired at 10:00 and their existing access token expires at 10:15, the current JWT remains cryptographically valid until its expiry unless the application performs an account-status/revocation lookup on every request.

The current design relies on the short access-token lifetime and checks current account information for protected user context. The trade-off is that immediate access revocation requires either very short access-token expiry or an additional server-side revocation/status check on each request.

For a high-security deployment, I would add an account-active/revocation version check so a fired user can be rejected immediately.

## 2.9 Written answer — property scope

I choose **database lookup per request** for property scope.

A token can contain a role because the role is part of the authenticated identity, but property assignment is mutable business data. Looking it up per request means that transferring a manager from Ooty to Coorg takes effect immediately for property-scoped authorization.

If property scope were stored only in the token, the old token could continue authorizing Ooty access until it expired or was revoked.

The cost of the database-lookup approach is an additional query, but the benefit is correct authorization after staff transfers.

The current `get_current_user` implementation reads `property_id` from the `account` table and returns it as part of the authenticated user context. fileciteturn22file0L17-L28

## 2.10 Secrets

The JWT secret is configuration, not source code. `.env` is ignored by Git and should never be submitted with a real secret.

The application should fail startup when required security configuration is missing.

## 2.11 Swagger

Protected endpoints use the Bearer JWT security scheme so Swagger can send:

```text
Authorization: Bearer <access-token>
```

## 2.12 Written answer — HS256 vs RS256

I choose **HS256** for this system.

Kaveri Hotels is a single application/service where the same backend that issues JWTs also verifies them. HS256 is simple, fast, and requires only one shared secret.

I would switch to **RS256** if Kaveri Hotels became a multi-service system where many independent services needed to verify tokens but only the authentication service should possess the signing key.

With RS256, verification services can receive a public key while the private signing key stays with the issuer. That reduces the number of systems that must hold a signing secret.
