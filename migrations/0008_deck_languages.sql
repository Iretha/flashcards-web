-- Preserve ambiguous originals for explicit review rather than guessing English.
ALTER TABLE decks ADD COLUMN primaryLanguage TEXT DEFAULT 'en';
ALTER TABLE decks ADD COLUMN supportedLanguages TEXT NOT NULL DEFAULT '["en"]';
UPDATE decks SET primaryLanguage = CASE
 WHEN (SELECT count(DISTINCT primary_language) FROM cards WHERE deck_id = decks.id) = 1
 THEN (SELECT primary_language FROM cards WHERE deck_id = decks.id LIMIT 1)
 WHEN NOT EXISTS (SELECT 1 FROM cards WHERE deck_id = decks.id) THEN 'en'
 ELSE NULL END;
UPDATE decks SET supportedLanguages = coalesce((SELECT json_group_array(code) FROM
 (SELECT DISTINCT j.key AS code FROM cards c, json_each(c.translations) j WHERE c.deck_id = decks.id)), '[]');

UPDATE decks SET supportedLanguages = '["en"]' WHERE supportedLanguages = '[]';

-- Replace the old BG/EN-only column without dropping cards or cascading progress.
ALTER TABLE cards RENAME COLUMN primary_language TO legacy_primary_language;
ALTER TABLE cards ADD COLUMN primary_language TEXT NOT NULL DEFAULT 'en';
UPDATE cards SET primary_language = legacy_primary_language;
ALTER TABLE cards DROP COLUMN legacy_primary_language;
