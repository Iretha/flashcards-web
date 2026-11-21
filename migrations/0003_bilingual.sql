ALTER TABLE cards ADD COLUMN import_key TEXT;
ALTER TABLE cards ADD COLUMN primary_language TEXT NOT NULL DEFAULT 'en' CHECK(primary_language IN ('bg', 'en'));
ALTER TABLE cards ADD COLUMN translations TEXT NOT NULL DEFAULT '{}' CHECK(json_valid(translations));
CREATE UNIQUE INDEX card_import_key ON cards(deck_id, import_key) WHERE import_key IS NOT NULL;

UPDATE cards SET primary_language = 'bg' WHERE question GLOB '*[А-Яа-я]*';
UPDATE cards SET translations = json_object(primary_language, json_object('question', question, 'answer', answer));

ALTER TABLE card_progress ADD COLUMN simple_opens INTEGER NOT NULL DEFAULT 0;
ALTER TABLE card_progress ADD COLUMN example_opens INTEGER NOT NULL DEFAULT 0;
ALTER TABLE card_progress ADD COLUMN details_opens INTEGER NOT NULL DEFAULT 0;
