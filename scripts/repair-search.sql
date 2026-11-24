DELETE FROM card_search_keys;
DELETE FROM card_search;
INSERT INTO card_search_keys(card_id,language) SELECT c.id,t.key FROM cards c,json_each(c.translations) t;
INSERT INTO card_search(card_search) VALUES('integrity-check');
UPDATE card_search_state SET epoch=epoch+1 WHERE id=1;
