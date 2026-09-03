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
