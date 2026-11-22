CREATE TABLE deck_collaborators (
 deck_id TEXT NOT NULL REFERENCES decks(id) ON DELETE CASCADE,
 user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
 added_at INTEGER NOT NULL,
 added_by TEXT NOT NULL REFERENCES users(id),
 PRIMARY KEY(deck_id, user_id)
);
CREATE INDEX collaborator_user ON deck_collaborators(user_id, deck_id);
