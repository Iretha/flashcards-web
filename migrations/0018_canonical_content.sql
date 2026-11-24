-- Forward-only content cleanup. Run with writes stopped and verified full recovery.
-- CHECK failures abort migration on irreconcilable canonical content.
CREATE TABLE v4_content_guard (valid INTEGER NOT NULL CHECK(valid = 1));
INSERT INTO v4_content_guard SELECT CASE WHEN NOT EXISTS (
 SELECT 1 FROM cards WHERE json_type(translations) <> 'object'
) THEN 1 ELSE 0 END;
-- Recover missing primary fields only. An existing empty answer is intentional.
UPDATE cards SET translations = json_set(translations,
 '$.' || '"' || primary_language || '"',
 json_patch(coalesce(json_extract(translations, '$.' || '"' || primary_language || '"'), '{}'),
 json(CASE WHEN json_type(translations, '$.' || '"' || primary_language || '".question') IS NULL
 THEN json_object('question', question) ELSE '{}' END)));
UPDATE cards SET translations = json_set(translations,
 '$.' || '"' || primary_language || '".answer', answer)
 WHERE json_type(translations, '$.' || '"' || primary_language || '".answer') IS NULL;
INSERT INTO v4_content_guard SELECT CASE WHEN NOT EXISTS (
 SELECT 1 FROM cards c, json_each(c.translations) t
 WHERE json_type(t.value) <> 'object'
 OR json_type(t.value, '$.question') IS NOT 'text'
 OR length(trim(t.value ->> 'question')) = 0 OR length(t.value ->> 'question') > 2000
 OR json_type(t.value, '$.answer') IS NOT 'text' OR length(t.value ->> 'answer') > 20000
 OR (json_type(t.value, '$.questionDetails') IS NOT NULL AND
 (json_type(t.value, '$.questionDetails') <> 'text' OR length(t.value ->> 'questionDetails') > 20000))
) THEN 1 ELSE 0 END;
UPDATE cards SET translations = (
 SELECT json_group_object(t.key, json(json_remove(t.value, '$.simple', '$.example', '$.details')))
 FROM json_each(cards.translations) t
);
-- Count is a response derivation, never independently persisted.
UPDATE cards SET metadata = json_remove(metadata, '$.occurrenceCount') WHERE metadata IS NOT NULL;
ALTER TABLE cards DROP COLUMN question;
ALTER TABLE cards DROP COLUMN answer;
ALTER TABLE card_progress DROP COLUMN simple_opens;
ALTER TABLE card_progress DROP COLUMN example_opens;
ALTER TABLE card_progress DROP COLUMN details_opens;
-- Old cycle state remains usable. Only approved obsolete extras are removed.
UPDATE study_sessions SET session_state = json_set(json_remove(session_state, '$.explanation'), '$.queue',
 json(coalesce((SELECT json_group_array(json_object('id', q.value ->> 'id'))
 FROM json_each(study_sessions.session_state, '$.queue') q), '[]')));
DROP TABLE v4_content_guard;
