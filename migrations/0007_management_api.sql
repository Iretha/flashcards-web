CREATE TABLE api_tokens (
  token_hash TEXT PRIMARY KEY NOT NULL,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  can_write INTEGER NOT NULL CHECK (can_write IN (0, 1)),
  expires_at INTEGER NOT NULL
);
CREATE INDEX api_token_user ON api_tokens(user_id);

CREATE TABLE api_creates (
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  route TEXT NOT NULL,
  request_key TEXT NOT NULL,
  fingerprint TEXT NOT NULL,
  resource_id TEXT NOT NULL,
  PRIMARY KEY (user_id, route, request_key)
);
