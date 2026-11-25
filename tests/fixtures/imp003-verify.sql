CREATE TABLE imp003_rehearsal_guard(valid INTEGER NOT NULL CHECK(valid=1));
INSERT INTO imp003_rehearsal_guard SELECT CASE WHEN
  (SELECT count(*) FROM cards) = 4
  AND (SELECT count(*) FROM card_topics) = 3
  AND (SELECT topic_name FROM card_topics WHERE card_id='imp003-unicode') = 'Ϊ́'
  AND (SELECT count(*) FROM cards WHERE priority=3 AND likelihood=3 AND creation_mode='UNKNOWN') = 4
  AND (SELECT count(*) FROM cards WHERE json_extract(metadata,'$.topic') IS NOT NULL) = 0
  AND (SELECT count(*) FROM cards WHERE metadata ->> '$.cardType'='task') = 1
  AND (SELECT interview_priority FROM cards WHERE id='imp003-question') = 5
  AND (SELECT difficulty FROM cards WHERE id='imp003-question') = 2
  AND (SELECT count(*) FROM study_events WHERE id='imp003-event') = 1
  AND (SELECT status FROM study_sessions WHERE id='imp003-session') = 'ACTIVE'
  AND (SELECT version FROM study_sessions WHERE id='imp003-session') = 9
  AND NOT EXISTS (SELECT 1 FROM pragma_foreign_key_check)
THEN 1 ELSE 0 END;
DROP TABLE imp003_rehearsal_guard;
