ALTER TABLE api_tokens ADD COLUMN id TEXT;
ALTER TABLE api_tokens ADD COLUMN name TEXT;
ALTER TABLE api_tokens ADD COLUMN created_at INTEGER;
ALTER TABLE api_tokens ADD COLUMN revoked_at INTEGER;
CREATE UNIQUE INDEX api_token_id ON api_tokens(id);
CREATE INDEX api_token_active ON api_tokens(user_id, revoked_at, expires_at);
