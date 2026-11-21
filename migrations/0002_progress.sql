CREATE TRIGGER count_study_event AFTER INSERT ON study_events
WHEN NEW.kind <> 'RESET'
BEGIN
  INSERT INTO card_progress (
    user_id, card_id, status, times_shown, times_failed, times_learned, last_shown_at, last_learned_at
  ) VALUES (
    NEW.user_id, NEW.card_id,
    CASE WHEN NEW.kind = 'LEARNED' THEN 'LEARNED' ELSE 'UNLEARNED' END,
    NEW.kind = 'SHOWN', NEW.kind IN ('REPEAT', 'TIMEOUT'), NEW.kind = 'LEARNED',
    CASE WHEN NEW.kind = 'SHOWN' THEN NEW.created_at END,
    CASE WHEN NEW.kind = 'LEARNED' THEN NEW.created_at END
  ) ON CONFLICT(user_id, card_id) DO UPDATE SET
    status = CASE WHEN NEW.kind = 'SHOWN' THEN status ELSE excluded.status END,
    times_shown = times_shown + excluded.times_shown,
    times_failed = times_failed + excluded.times_failed,
    times_learned = times_learned + excluded.times_learned,
    last_shown_at = coalesce(excluded.last_shown_at, last_shown_at),
    last_learned_at = coalesce(excluded.last_learned_at, last_learned_at);
END;
