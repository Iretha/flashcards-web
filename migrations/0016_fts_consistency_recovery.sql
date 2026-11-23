-- Preserve 0015 history. Existing derived rows are invalidated, not source content.
DROP TRIGGER card_search_translation_changed;
DROP TRIGGER card_search_deleted;
DELETE FROM card_search;
DELETE FROM card_search_ready;
ALTER TABLE card_search_ready ADD COLUMN version INTEGER NOT NULL DEFAULT 0;
CREATE TABLE card_search_state (
 id INTEGER PRIMARY KEY CHECK(id=1), epoch INTEGER NOT NULL DEFAULT 0,
 version INTEGER NOT NULL, mode TEXT NOT NULL CHECK(mode IN ('ready','rebuilding','blocked')),
 token TEXT
);
INSERT INTO card_search_state(id,version,mode) VALUES(1,1,'ready');
CREATE TABLE card_search_rows (
 id INTEGER PRIMARY KEY AUTOINCREMENT,
 card_id TEXT NOT NULL REFERENCES cards(id) ON DELETE CASCADE,
 language TEXT NOT NULL, question TEXT NOT NULL, answer TEXT NOT NULL,
 UNIQUE(card_id,language)
);
CREATE TRIGGER search_row_insert AFTER INSERT ON card_search_rows BEGIN
 INSERT INTO card_search(rowid,card_id,language,question,answer) VALUES(NEW.id,NEW.card_id,NEW.language,NEW.question,NEW.answer);
 UPDATE card_search_state SET epoch=epoch+1 WHERE id=1;
END;
CREATE TRIGGER search_row_delete AFTER DELETE ON card_search_rows BEGIN
 DELETE FROM card_search WHERE rowid=OLD.id;
 UPDATE card_search_state SET epoch=epoch+1 WHERE id=1;
END;
CREATE TRIGGER search_row_update AFTER UPDATE ON card_search_rows BEGIN
 DELETE FROM card_search WHERE rowid=OLD.id;
 INSERT INTO card_search(rowid,card_id,language,question,answer) VALUES(NEW.id,NEW.card_id,NEW.language,NEW.question,NEW.answer);
 UPDATE card_search_state SET epoch=epoch+1 WHERE id=1;
END;
CREATE TRIGGER search_card_changed AFTER UPDATE ON cards BEGIN
 DELETE FROM card_search_rows WHERE card_id=NEW.id AND OLD.translations IS NOT NEW.translations;
 DELETE FROM card_search_ready WHERE card_id=NEW.id AND OLD.translations IS NOT NEW.translations;
 UPDATE card_search_state SET epoch=epoch+1 WHERE id=1;
END;
CREATE TRIGGER search_card_insert AFTER INSERT ON cards BEGIN
 UPDATE card_search_state SET epoch=epoch+1 WHERE id=1;
END;
CREATE TRIGGER search_card_delete AFTER DELETE ON cards BEGIN
 UPDATE card_search_state SET epoch=epoch+1 WHERE id=1;
END;
CREATE TRIGGER search_deck_update AFTER UPDATE ON decks BEGIN
 UPDATE card_search_state SET epoch=epoch+1 WHERE id=1;
END;
CREATE TRIGGER search_deck_insert AFTER INSERT ON decks BEGIN
 UPDATE card_search_state SET epoch=epoch+1 WHERE id=1;
END;
CREATE TRIGGER search_deck_delete AFTER DELETE ON decks BEGIN
 UPDATE card_search_state SET epoch=epoch+1 WHERE id=1;
END;
CREATE TRIGGER search_member_insert AFTER INSERT ON deck_collaborators BEGIN
 UPDATE card_search_state SET epoch=epoch+1 WHERE id=1;
END;
CREATE TRIGGER search_member_update AFTER UPDATE ON deck_collaborators BEGIN
 UPDATE card_search_state SET epoch=epoch+1 WHERE id=1;
END;
CREATE TRIGGER search_member_delete AFTER DELETE ON deck_collaborators BEGIN
 UPDATE card_search_state SET epoch=epoch+1 WHERE id=1;
END;
CREATE TRIGGER search_ready_insert AFTER INSERT ON card_search_ready BEGIN
 UPDATE card_search_state SET epoch=epoch+1 WHERE id=1;
END;
CREATE TRIGGER search_ready_update AFTER UPDATE ON card_search_ready BEGIN
 UPDATE card_search_state SET epoch=epoch+1 WHERE id=1;
END;
CREATE TRIGGER search_ready_delete AFTER DELETE ON card_search_ready BEGIN
 UPDATE card_search_state SET epoch=epoch+1 WHERE id=1;
END;
