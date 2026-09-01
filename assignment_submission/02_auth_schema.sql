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
