-- Additive: no user/data/session reassignment or invalidation.
ALTER TABLE users ADD COLUMN supabase_sub TEXT;
CREATE UNIQUE INDEX user_supabase_subject ON users(supabase_sub) WHERE supabase_sub IS NOT NULL;
CREATE INDEX auth_session_user ON auth_sessions(user_id);
CREATE TABLE auth_device_requests (
 id TEXT PRIMARY KEY,
 poll_hash TEXT NOT NULL UNIQUE,
 approval_hash TEXT NOT NULL UNIQUE,
 manual_hash TEXT NOT NULL UNIQUE,
 state TEXT NOT NULL CHECK(state IN ('pending','approved','denied','consumed')),
 created_at INTEGER NOT NULL,
 expires_at INTEGER NOT NULL,
 user_id TEXT REFERENCES users(id),
 approver_hash TEXT,
 redemption_marker TEXT UNIQUE,
 label TEXT NOT NULL,
 phrase TEXT NOT NULL
);
CREATE INDEX auth_device_expiry ON auth_device_requests(expires_at);
CREATE INDEX auth_device_user ON auth_device_requests(user_id);
