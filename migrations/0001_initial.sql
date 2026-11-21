CREATE TABLE users (
  id TEXT PRIMARY KEY,
  username TEXT NOT NULL,
  username_key TEXT NOT NULL UNIQUE,
  created_at INTEGER NOT NULL,
  last_login_at INTEGER NOT NULL,
  settings TEXT NOT NULL DEFAULT '{}'
);

CREATE TABLE auth_sessions (
  token_hash TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  expires_at INTEGER NOT NULL
);
CREATE INDEX auth_expiry ON auth_sessions(expires_at);

CREATE TABLE login_limits (
  key TEXT PRIMARY KEY,
  count INTEGER NOT NULL,
  expires_at INTEGER NOT NULL
);
CREATE INDEX login_expiry ON login_limits(expires_at);

CREATE TABLE decks (
  id TEXT PRIMARY KEY,
  owner_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  source_key TEXT,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  visibility TEXT NOT NULL CHECK (visibility IN ('PRIVATE', 'SHARED')),
  revision INTEGER NOT NULL DEFAULT 0,
  mutation TEXT,
  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL,
  UNIQUE(owner_id, source_key)
);
CREATE INDEX deck_visibility ON decks(visibility);

CREATE TABLE cards (
  id TEXT PRIMARY KEY,
  deck_id TEXT NOT NULL REFERENCES decks(id) ON DELETE CASCADE,
  stable_key TEXT NOT NULL,
  question_key TEXT NOT NULL,
  question TEXT NOT NULL,
  answer TEXT NOT NULL,
  position INTEGER NOT NULL,
  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL,
  UNIQUE(deck_id, stable_key),
  UNIQUE(deck_id, question_key)
);
CREATE INDEX card_order ON cards(deck_id, position);

CREATE TABLE card_progress (
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  card_id TEXT NOT NULL REFERENCES cards(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'UNLEARNED' CHECK(status IN ('UNLEARNED', 'LEARNED')),
  times_shown INTEGER NOT NULL DEFAULT 0,
  times_failed INTEGER NOT NULL DEFAULT 0,
  times_learned INTEGER NOT NULL DEFAULT 0,
  last_shown_at INTEGER,
  last_learned_at INTEGER,
  PRIMARY KEY(user_id, card_id)
);
CREATE INDEX progress_card ON card_progress(card_id);

CREATE TABLE study_sessions (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
  selected_deck_ids TEXT NOT NULL,
  ordering_mode TEXT NOT NULL CHECK(ordering_mode IN ('SEQUENTIAL', 'RANDOM')),
  timer_enabled INTEGER NOT NULL,
  timer_seconds INTEGER NOT NULL,
  current_card_id TEXT REFERENCES cards(id) ON DELETE SET NULL,
  session_state TEXT NOT NULL,
  status TEXT NOT NULL CHECK(status IN ('ACTIVE', 'COMPLETE', 'INVALIDATED')),
  version INTEGER NOT NULL,
  mutation TEXT,
  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL
);
CREATE INDEX study_current ON study_sessions(current_card_id);

CREATE TABLE study_events (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  study_id TEXT,
  card_id TEXT,
  deck_id TEXT NOT NULL,
  kind TEXT NOT NULL CHECK(kind IN ('SHOWN','REPEAT','TIMEOUT','LEARNED','RESET')),
  created_at INTEGER NOT NULL
);
CREATE INDEX event_user ON study_events(user_id, created_at);

CREATE TRIGGER deck_unshared AFTER UPDATE OF visibility ON decks
WHEN OLD.visibility = 'SHARED' AND NEW.visibility = 'PRIVATE'
BEGIN
  UPDATE study_sessions SET status = 'INVALIDATED', version = version + 1, mutation = NULL
  WHERE user_id <> NEW.owner_id AND status = 'ACTIVE'
  AND NEW.id IN (SELECT value FROM json_each(selected_deck_ids));
END;

CREATE TRIGGER deck_deleted BEFORE DELETE ON decks
BEGIN
  UPDATE study_sessions SET status = 'INVALIDATED', version = version + 1, mutation = NULL
  WHERE status = 'ACTIVE' AND OLD.id IN (SELECT value FROM json_each(selected_deck_ids));
END;

CREATE TRIGGER card_deleted BEFORE DELETE ON cards
BEGIN
  UPDATE study_sessions SET status = 'INVALIDATED', version = version + 1, mutation = NULL
  WHERE status = 'ACTIVE' AND OLD.deck_id IN (SELECT value FROM json_each(selected_deck_ids));
END;
