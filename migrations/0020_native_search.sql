DROP TRIGGER search_row_insert;
DROP TRIGGER search_row_delete;
DROP TRIGGER search_row_update;
DROP TRIGGER search_card_changed;
DROP TRIGGER search_card_insert;
DROP TRIGGER search_ready_insert;
DROP TRIGGER search_ready_update;
DROP TRIGGER search_ready_delete;
DROP TABLE card_search_ready;
DROP TABLE card_search_rows;
DROP TABLE card_search;
ALTER TABLE card_search_state DROP COLUMN token;
ALTER TABLE card_search_state DROP COLUMN mode;
ALTER TABLE card_search_state DROP COLUMN version;
CREATE TABLE card_search_keys (
 id INTEGER PRIMARY KEY,
 card_id TEXT NOT NULL REFERENCES cards(id) ON DELETE CASCADE,
 language TEXT NOT NULL,
 UNIQUE(card_id,language)
);
CREATE VIRTUAL TABLE card_search USING fts5(card_id UNINDEXED,language UNINDEXED,question,answer,tokenize='trigram case_sensitive 0');
CREATE TRIGGER search_key_insert AFTER INSERT ON card_search_keys BEGIN
 INSERT INTO card_search(rowid,card_id,language,question,answer)
 SELECT NEW.id,c.id,t.key,(t.value->>'question') || CASE WHEN coalesce(t.value->>'questionDetails','') <> '' THEN char(10) || (t.value->>'questionDetails') ELSE '' END,coalesce(t.value->>'answer','')
 FROM cards c,json_each(c.translations) t WHERE c.id=NEW.card_id AND t.key=NEW.language;
END;
CREATE TRIGGER search_key_delete AFTER DELETE ON card_search_keys BEGIN
 DELETE FROM card_search WHERE rowid=OLD.id;
END;
CREATE TRIGGER search_card_insert AFTER INSERT ON cards BEGIN
 INSERT INTO card_search_keys(card_id,language) SELECT NEW.id,key FROM json_each(NEW.translations);
 UPDATE card_search_state SET epoch=epoch+1 WHERE id=1;
END;
CREATE TRIGGER search_card_changed AFTER UPDATE ON cards BEGIN
 DELETE FROM card_search_keys WHERE card_id=OLD.id AND OLD.translations IS NOT NEW.translations;
 INSERT INTO card_search_keys(card_id,language) SELECT NEW.id,key FROM json_each(NEW.translations) WHERE OLD.translations IS NOT NEW.translations;
 UPDATE card_search_state SET epoch=epoch+1 WHERE id=1;
END;
INSERT INTO card_search_keys(card_id,language) SELECT c.id,t.key FROM cards c,json_each(c.translations) t;
INSERT INTO card_search(card_search) VALUES('integrity-check');
UPDATE card_search_state SET epoch=epoch+1 WHERE id=1;
