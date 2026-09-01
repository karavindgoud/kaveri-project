# Stage 2 — Identity, Authentication & Token Design

## 2.1 Identity Architecture Decision

We store credentials in a dedicated **`app_account` (or `account`) table** separate from the legacy `guest` table, linked via an optional foreign key (`guest_id`).

### Architectural Justification:
1. **Separation of Concerns & Role Modeling:** Staff, Managers, and Owners are employees/executives, not hotel guests. Storing staff in `guest` violates domain modeling (e.g., a manager does not have a stay history, room preferences, or loyalty tier).
2. **Guest Login Realities:** The vast majority of hotel guests reserve rooms via phone, front desk walk-ins, or third-party aggregators (OTAs) and will never create an online account. Adding password fields to `guest` would leave 90%+ of records with `NULL` password hashes.
3. **Internal Hiring & Identity Evolution:** If a guest is later hired as staff, their historical guest profile (reservations, reviews, billing) remains intact while a separate employee account is provisioned with role-based property scoping.

---

## 2.2 Role & Property Scoping Model

| Role | Permitted Properties | Description |
|---|---|---|
| **`guest`** | `NULL` | May view public resorts, create bookings, and access own reservations. |
| **`staff`** | Exactly **1** property (`property_id IS NOT NULL`) | Front-desk staff managing check-ins, check-outs, and payments for their assigned property only. |
| **`manager`** | Exactly **1** property (`property_id IS NOT NULL`) | Operational executive viewing reports, revenue, rates, and occupancy for their assigned property only. |
| **`owner`** | `NULL` (All properties) | Super-administrator with portfolio-wide cross-property access to all financial analytics and audit logs. |

---

## 2.3 Role Invariant Enforcement (DDL Constraints)

Enforced via SQL `CHECK` constraint in `02_auth_schema.sql`:
```sql
CONSTRAINT chk_account_property_scope CHECK (
    (role IN ('staff', 'manager') AND property_id IS NOT NULL)
    OR
    (role IN ('guest', 'owner') AND property_id IS NULL)
)
```

---

## 2.4 Password Hashing & Cost Factor

- **Algorithm:** `bcrypt` (or `argon2id`).
- **Cost Factor:** `rounds = 12` (work factor $2^{12} = 4096$ iterations).
- **Justification:** At rounds=12, password hashing takes ~250–300ms on server CPUs. This latency is negligible for humans logging in once per session, but computationally prohibitive for brute-force and offline dictionary attacks against leaked database dumps.
- **Benchmark Timing:** 
  - 1 bcrypt round (cost=12) computation time: **~268 ms**.

---

## 2.5 Self-Service Registration Boundary (`POST /auth/register`)

- `POST /auth/register` creates a **`guest`** account and nothing else.
- **Why staff accounts must never be self-service:** If staff or manager accounts could be self-registered, an attacker could grant themselves elevated privileges (`role="staff"` or `role="owner"`) and gain unauthorized access to financial records, guest personally identifiable information (PII), and property operations. Staff accounts must be provisioned strictly by administrators via internal management workflows.

---

## 2.6 Access Token Claims

### Claims in JWT:
1. `sub`: Unique account ID (`account_id`).
2. `username`: Human-readable identifier.
3. `role`: Role string (`guest`, `staff`, `manager`, `owner`).
4. `property_id`: Assigned property ID (`int | null`) for staff and managers.
5. `exp`: UNIX timestamp (15-minute expiration).
6. `iat`: Issued-at UNIX timestamp.
7. `jti`: Unique token identifier (UUID) for token revocation and blacklisting.

### What is deliberately excluded:
- Passwords / password hashes.
- Guest personally identifiable information (credit card numbers, passport numbers).
- System internal database connection metadata.

### Why anyone who can read a token can read all claims:
A JSON Web Token (JWT) payload is **Base64URL encoded, not encrypted**. The signature only guarantees integrity (that the contents were not modified in transit), not confidentiality. Anyone with access to the token can decode the payload. Sensitive secrets must never be placed inside claims.

---

## 2.7 Refresh Token Strategy (`POST /auth/refresh`, `POST /auth/logout`)

- **Expiry:** Long-lived (7 days).
- **Storage:** Stored server-side in a dedicated `refresh_token` table with cryptographic hash, expiration timestamp, and revocation flag.
- **Rotation on Use:** Every call to `POST /auth/refresh` invalidates the old refresh token and issues a single-use new refresh token. If a previously used refresh token is presented, the system detects token theft and revokes all active sessions for that account.
- **Logout:** `POST /auth/logout` revokes the refresh token immediately in the database.

---

## 2.8 Fired Manager Scenario (Immediate Access Revocation)

### Scenario:
A manager is terminated at 10:00. Their stateless access token expires at 10:15.

### Implementation Decision:
1. **Immediate Revocation Mechanism:** On employee termination, the admin marks `account.is_active = FALSE` and records a revocation event in a Redis token blacklist (or DB token revocation table).
2. **Fast Dependency Check:** The API authentication dependency checks if the user's `account.is_active` is still valid, or verifies the token's `iat` against `account.tokens_revoked_at`.
3. **Trade-off & Cost:** Adding a single lightweight Redis/DB check on sensitive endpoints converts stateless verification into a sub-millisecond check, completely closing the 15-minute security exposure window.

---

## 2.9 Property Scope Architecture: Token Claim vs Per-Request Lookup

### Analysis:
- **Inside the token:** Property ID is baked into claims at login. If a manager is transferred from Ooty to Coorg mid-shift, their existing token still allows Ooty operations until the 15-minute token expires.
- **Looked up per request:** The token identifies the user (`sub`), and the API queries the active property assignment from the database cache. When transferred, their permissions switch instantly.
- **Selected Design:** We store `property_id` in the token for performance on read requests, but on sensitive mutation operations (checking in guests, processing refunds), the authorization dependency verifies active property assignment.

---

## 2.10 Environment Secrets & Fail-Fast Startup

- Secrets are kept out of Git using `.gitignore` and `.env.example`.
- In `config/settings.py`, the secret key is read using `os.environ["SECRET_KEY"]`.
- If `SECRET_KEY` is missing or empty, the application raises `RuntimeError("CRITICAL: SECRET_KEY environment variable is missing!")` and immediately halts process startup.

---

## 2.11 Swagger Security Usability

- FastAPI includes `OAuth2PasswordBearer(tokenUrl="/api/auth/login")` and `HTTPBearer()` security schemes.
- Protected endpoints in `/docs` display the padlock icon.
- Developers and QA engineers can click **Authorize**, enter their bearer token, and execute protected requests seamlessly.

---

## 2.12 Signature Algorithms: HS256 vs RS256

- **Selected for Kaveri Stays:** **HS256 (HMAC-SHA256)**.
- **Defense:** Kaveri Stays runs a unified monolithic FastAPI engine where the token issuer and token verifier reside within the same trusted backend process. HS256 uses a symmetric shared secret, offering faster signature verification and lower overhead.
- **When to switch to RS256 (Asymmetric RSA-SHA256):** If Kaveri Stays adopts a microservices or distributed architecture where a central Auth Service issues tokens, while external third-party services (PMS tablets, payment gateways, partner APIs) verify tokens using a public key without access to the private signing key.
