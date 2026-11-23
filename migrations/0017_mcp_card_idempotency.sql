CREATE TABLE mcp_card_idempotency (
  principal TEXT NOT NULL,
  operation TEXT NOT NULL CHECK(operation = 'create_card'),
  key TEXT NOT NULL,
  payload TEXT NOT NULL,
  card_id TEXT NOT NULL,
  created_at INTEGER NOT NULL,
  PRIMARY KEY(principal, operation, key)
);
