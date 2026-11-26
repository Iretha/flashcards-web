-- Forward-only classification cutover. Unknown legacy topic values abort instead of
-- being approximated by SQLite's ASCII-only UPPER().
ALTER TABLE cards ADD COLUMN priority INTEGER NOT NULL DEFAULT 3
  CHECK(typeof(priority) = 'integer' AND priority BETWEEN 1 AND 5);
ALTER TABLE cards ADD COLUMN likelihood INTEGER NOT NULL DEFAULT 3
  CHECK(typeof(likelihood) = 'integer' AND likelihood BETWEEN 1 AND 5);
ALTER TABLE cards ADD COLUMN creation_mode TEXT NOT NULL DEFAULT 'UNKNOWN'
  CHECK(creation_mode IN ('MANUAL', 'AI', 'UNKNOWN'));

CREATE TABLE card_topics (
  card_id TEXT NOT NULL REFERENCES cards(id) ON DELETE CASCADE,
  topic_name TEXT NOT NULL,
  PRIMARY KEY(card_id, topic_name)
);
CREATE INDEX card_topics_by_topic ON card_topics(topic_name, card_id);

-- This reviewed mapping covers inspected legacy data and representative fixtures.
-- New values must be normalized with src/lib/classification.ts and added explicitly.
CREATE TABLE imp003_topic_map (
  raw_value TEXT PRIMARY KEY,
  canonical_value TEXT NOT NULL,
  CHECK(length(canonical_value) > 0)
);
INSERT INTO imp003_topic_map(raw_value, canonical_value) VALUES
  ('Java', 'JAVA'),
  ('Java Concurrency', 'JAVA CONCURRENCY'),
  ('Java Language', 'JAVA LANGUAGE'),
  ('Java Memory Model', 'JAVA MEMORY MODEL'),
  ('JVM', 'JVM'),
  ('Regional', 'REGIONAL'),
  ('Test', 'TEST'),
  ('Testing', 'TESTING'),
  ('Coding Tasks, Streams, Algorithms', 'CODING TASKS, STREAMS, ALGORITHMS'),
  ('Computing', 'COMPUTING'),
  ('Concurrency, Java Memory Model, Multithreading', 'CONCURRENCY, JAVA MEMORY MODEL, MULTITHREADING'),
  ('Core Java, Collections, JVM', 'CORE JAVA, COLLECTIONS, JVM'),
  ('Design Patterns, Architecture', 'DESIGN PATTERNS, ARCHITECTURE'),
  ('Geography', 'GEOGRAPHY'),
  ('Human body', 'HUMAN BODY'),
  ('Languages', 'LANGUAGES'),
  ('Mathematics', 'MATHEMATICS'),
  ('Microservices, Kafka, Distributed Systems', 'MICROSERVICES, KAFKA, DISTRIBUTED SYSTEMS'),
  ('Photosynthesis', 'PHOTOSYNTHESIS'),
  ('SQL, JPA, Hibernate, Transactions', 'SQL, JPA, HIBERNATE, TRANSACTIONS'),
  ('Solar system', 'SOLAR SYSTEM'),
  ('Spring, Spring Boot, Spring Security', 'SPRING, SPRING BOOT, SPRING SECURITY'),
  ('Testing, CI/CD, Docker, Cloud', 'TESTING, CI/CD, DOCKER, CLOUD'),
  ('Water', 'WATER'),
  ('ΐ', 'Ϊ́');

CREATE TABLE imp003_guard(valid INTEGER NOT NULL CHECK(valid = 1));

-- Non-null legacy metadata must have a supported type and one mapped scalar topic.
INSERT INTO imp003_guard SELECT CASE WHEN NOT EXISTS (
  SELECT 1 FROM cards
  WHERE metadata IS NOT NULL AND (
    json_type(metadata) <> 'object'
    OR coalesce(json_type(metadata, '$.topic'), '') <> 'text'
    OR metadata ->> '$.topic' NOT IN (SELECT raw_value FROM imp003_topic_map)
    OR (json_type(metadata, '$.cardType') IS NOT NULL
      AND metadata ->> '$.cardType' NOT IN ('question', 'coding_task'))
  )
) THEN 1 ELSE 0 END;

-- Existing coding tasks must already contain a nonblank specification in every language.
INSERT INTO imp003_guard SELECT CASE WHEN NOT EXISTS (
  SELECT 1 FROM cards c, json_each(c.translations) t
  WHERE c.metadata ->> '$.cardType' = 'coding_task'
    AND (coalesce(json_type(t.value, '$.questionDetails'), '') <> 'text'
      OR length(trim(t.value ->> '$.questionDetails',
        char(9,10,11,12,13,32,160,5760,8192,8193,8194,8195,8196,8197,8198,8199,
          8200,8201,8202,8232,8233,8239,8287,12288,65279))) = 0)
) THEN 1 ELSE 0 END;

INSERT INTO card_topics(card_id, topic_name)
SELECT c.id, m.canonical_value
FROM cards c JOIN imp003_topic_map m ON m.raw_value = c.metadata ->> '$.topic'
WHERE c.metadata IS NOT NULL;

-- Coverage must remain exact between inspection/mapping and migration cutover.
INSERT INTO imp003_guard SELECT CASE WHEN
  (SELECT count(*) FROM cards WHERE metadata IS NOT NULL) =
  (SELECT count(*) FROM card_topics)
  AND NOT EXISTS (
    SELECT 1 FROM cards c WHERE c.metadata IS NOT NULL
      AND NOT EXISTS (SELECT 1 FROM card_topics ct WHERE ct.card_id = c.id)
  )
THEN 1 ELSE 0 END;

UPDATE cards SET metadata = CASE
  WHEN metadata IS NULL THEN json_object('cardType', 'question')
  ELSE json_remove(
    json_set(metadata, '$.cardType',
      CASE metadata ->> '$.cardType'
        WHEN 'coding_task' THEN 'task'
        WHEN 'question' THEN 'question'
        ELSE 'question'
      END),
    '$.topic', '$.occurrenceCount'
  )
END;

DROP TABLE imp003_guard;
DROP TABLE imp003_topic_map;

-- Topic membership changes affect read consistency but not FTS document content.
CREATE TRIGGER search_topic_insert AFTER INSERT ON card_topics BEGIN
  UPDATE card_search_state SET epoch = epoch + 1 WHERE id = 1;
END;
CREATE TRIGGER search_topic_update AFTER UPDATE ON card_topics BEGIN
  UPDATE card_search_state SET epoch = epoch + 1 WHERE id = 1;
END;
CREATE TRIGGER search_topic_delete AFTER DELETE ON card_topics BEGIN
  UPDATE card_search_state SET epoch = epoch + 1 WHERE id = 1;
END;

-- Fully Live reconciliation owns access/deletion changes. Legacy whole-session
-- invalidation is removed; no new session mutation signal is introduced here.
DROP TRIGGER deck_unshared;
DROP TRIGGER deck_deleted;
DROP TRIGGER card_deleted;
