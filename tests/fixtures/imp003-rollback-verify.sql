CREATE TABLE imp003_rollback_guard(valid INTEGER NOT NULL CHECK(valid=1));
INSERT INTO imp003_rollback_guard SELECT CASE WHEN
  NOT EXISTS (SELECT 1 FROM pragma_table_info('cards') WHERE name IN ('priority','likelihood','creation_mode'))
  AND NOT EXISTS (SELECT 1 FROM sqlite_master WHERE type='table' AND name='card_topics')
  AND NOT EXISTS (SELECT 1 FROM sqlite_master WHERE type='trigger' AND name LIKE 'search_topic_%')
  AND (SELECT count(*) FROM cards) = 4
  AND (SELECT metadata ->> '$.topic' FROM cards WHERE id='imp003-question') = 'UNINSPECTED'
  AND (SELECT interview_priority FROM cards WHERE id='imp003-question') = 5
  AND (SELECT difficulty FROM cards WHERE id='imp003-question') = 2
  AND (SELECT count(*) FROM study_events WHERE id='imp003-event') = 1
  AND (SELECT status FROM study_sessions WHERE id='imp003-session') = 'ACTIVE'
  AND (SELECT version FROM study_sessions WHERE id='imp003-session') = 9
  AND (SELECT count(*) FROM sqlite_master WHERE type='trigger' AND name IN ('deck_unshared','deck_deleted','card_deleted')) = 3
  AND NOT EXISTS (SELECT 1 FROM pragma_foreign_key_check)
THEN 1 ELSE 0 END;
DROP TABLE imp003_rollback_guard;
