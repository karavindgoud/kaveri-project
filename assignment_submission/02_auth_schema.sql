-- ============================================================================
-- KAVERI ENTERPRISE PRODUCTION AUTH SCHEMA & INTEGRITY RULES
-- ============================================================================

-- ============================================================================
-- 02_auth_schema.sql
-- Identity, Accounts, Roles and Property Assignment DDL for Kaveri Stays
-- ============================================================================

CREATE TABLE IF NOT EXISTS app_account (
    account_id       SERIAL PRIMARY KEY,
    username         VARCHAR(64) UNIQUE NOT NULL,
    email            VARCHAR(255) UNIQUE NOT NULL,
    password_hash    VARCHAR(255) NOT NULL,
    role             VARCHAR(20) NOT NULL,
    property_id      INT REFERENCES property(property_id) ON DELETE RESTRICT,
    guest_id         INT REFERENCES guest(guest_id) ON DELETE SET NULL,
    is_active        BOOLEAN NOT NULL DEFAULT TRUE,
    tokens_revoked_at TIMESTAMPTZ,
    created_at       TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at       TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    -- Role Domain Invariant:
    -- 'staff' and 'manager' must belong to exactly one property.
    -- 'guest' and 'owner' belong to no specific property (owner oversees entire portfolio).
    CONSTRAINT chk_account_role_domain CHECK (
        role IN ('guest', 'staff', 'manager', 'owner')
    ),
    CONSTRAINT chk_account_property_scope CHECK (
        (role IN ('staff', 'manager') AND property_id IS NOT NULL)
        OR
        (role IN ('guest', 'owner') AND property_id IS NULL)
    ),
    CONSTRAINT chk_account_email_format CHECK (
        email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$'
    )
);

-- Indexing for high-throughput authentication queries
CREATE INDEX IF NOT EXISTS idx_account_username ON app_account(username);
CREATE INDEX IF NOT EXISTS idx_account_email ON app_account(email);
CREATE INDEX IF NOT EXISTS idx_account_property ON app_account(property_id);
CREATE INDEX IF NOT EXISTS idx_account_guest ON app_account(guest_id);

-- ============================================================================
-- Refresh Tokens Storage & Revocation Ledger
-- ============================================================================

CREATE TABLE IF NOT EXISTS refresh_token (
    token_id         BIGSERIAL PRIMARY KEY,
    account_id       INT NOT NULL REFERENCES app_account(account_id) ON DELETE CASCADE,
    token_hash       VARCHAR(128) UNIQUE NOT NULL,
    expires_at       TIMESTAMPTZ NOT NULL,
    is_revoked       BOOLEAN NOT NULL DEFAULT FALSE,
    created_at       TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    replaced_by      BIGINT REFERENCES refresh_token(token_id) ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS idx_refresh_token_lookup ON refresh_token(token_hash, is_revoked);
CREATE INDEX IF NOT EXISTS idx_refresh_account ON refresh_token(account_id);

-- Trigger to maintain updated_at timestamps
CREATE OR REPLACE FUNCTION update_auth_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_account_updated_at ON app_account;
CREATE TRIGGER trg_account_updated_at
    BEFORE UPDATE ON app_account
    FOR EACH ROW
    EXECUTE FUNCTION update_auth_timestamp();

-- ============================================================================
-- PROJECT-KAVERI FINAL REFERENCE DDL
-- ============================================================================

-- 02_auth_schema.sql
-- Authentication DDL for Kaveri Hotels.
-- Assumes the existing property and guest tables already exist.

CREATE TABLE IF NOT EXISTS role (
    role_name VARCHAR(20) PRIMARY KEY,
    CONSTRAINT role_name_check
        CHECK (role_name IN ('guest', 'staff', 'manager', 'owner'))
);

INSERT INTO role (role_name)
VALUES
    ('guest'),
    ('staff'),
    ('manager'),
    ('owner')
ON CONFLICT (role_name) DO NOTHING;

CREATE TABLE IF NOT EXISTS account (
    account_id BIGSERIAL PRIMARY KEY,
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash TEXT NOT NULL,
    role VARCHAR(20) NOT NULL,
    guest_id BIGINT NULL,
    property_id BIGINT NULL,

    CONSTRAINT account_role_fkey
        FOREIGN KEY (role) REFERENCES role(role_name),

    CONSTRAINT account_guest_id_fkey
        FOREIGN KEY (guest_id) REFERENCES guest(guest_id),

    CONSTRAINT account_property_id_fkey
        FOREIGN KEY (property_id) REFERENCES property(property_id),

    CONSTRAINT account_role_assignment_check
        CHECK (
            (role = 'guest' AND guest_id IS NOT NULL AND property_id IS NULL)
            OR
            (role IN ('staff', 'manager') AND guest_id IS NULL AND property_id IS NOT NULL)
            OR
            (role = 'owner' AND guest_id IS NULL AND property_id IS NULL)
        )
);

CREATE UNIQUE INDEX IF NOT EXISTS account_email_lower_key
    ON account (LOWER(email));

CREATE TABLE IF NOT EXISTS refresh_token (
    token_id BIGSERIAL PRIMARY KEY,
    account_id BIGINT NOT NULL,
    token_hash TEXT NOT NULL UNIQUE,
    expires_at TIMESTAMPTZ NOT NULL,
    revoked BOOLEAN NOT NULL DEFAULT FALSE,

    CONSTRAINT refresh_token_account_id_fkey
        FOREIGN KEY (account_id)
        REFERENCES account(account_id)
        ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS refresh_token_account_id_idx
    ON refresh_token(account_id);

CREATE INDEX IF NOT EXISTS refresh_token_active_idx
    ON refresh_token(account_id, revoked, expires_at);
