CREATE VIRTUAL TABLE card_search USING fts5(card_id UNINDEXED, language UNINDEXED,
 question, answer, tokenize='trigram case_sensitive 1');
-- A marker is present only after every translation has been indexed atomically.
CREATE TABLE card_search_ready (
 card_id TEXT PRIMARY KEY REFERENCES cards(id) ON DELETE CASCADE
);
CREATE TRIGGER card_search_translation_changed AFTER UPDATE OF translations ON cards
WHEN OLD.translations IS NOT NEW.translations
BEGIN
 DELETE FROM card_search WHERE card_id = NEW.id;
 DELETE FROM card_search_ready WHERE card_id = NEW.id;
END;
CREATE TRIGGER card_search_deleted AFTER DELETE ON cards
BEGIN
 DELETE FROM card_search WHERE card_id = OLD.id;
END;
