ALTER TABLE decks ADD COLUMN third_party_access TEXT NOT NULL DEFAULT 'NONE'
  CHECK (third_party_access IN ('NONE', 'READ', 'READ_WRITE'));
