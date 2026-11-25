INSERT INTO users(id,username,username_key,created_at,last_login_at)
VALUES('imp003-owner','IMP003 Owner','imp003-owner',0,0);

INSERT INTO decks(id,owner_id,title,description,visibility,revision,created_at,updated_at,primaryLanguage,supportedLanguages)
VALUES('imp003-deck','imp003-owner','Legacy','','SHARED',4,0,0,'en','["en","bg"]');

INSERT INTO cards(id,deck_id,stable_key,question_key,position,created_at,updated_at,import_key,
  primary_language,translations,interview_priority,difficulty,metadata)
VALUES
('imp003-question','imp003-deck','question','question',0,0,0,'question','en',
 '{"en":{"question":"Question?","answer":""},"bg":{"question":"Въпрос?","answer":"Отговор"}}',5,2,
 '{"cardType":"question","topic":"Java Concurrency","provenance":{"type":"sourced","sources":[{"sourceName":"Source","sourceUrl":"https://example.com","occurrenceId":"one"}]},"answerReferences":[{"title":"Reference","url":"https://example.com/ref"}]}'),
('imp003-task','imp003-deck','task','task',1,0,0,'task','en',
 '{"en":{"question":"Task?","questionDetails":"Implement it.","answer":""},"bg":{"question":"Задача?","questionDetails":"Реализирайте я.","answer":""}}',NULL,NULL,
 '{"cardType":"coding_task","topic":"Java Memory Model","provenance":{"type":"generated","sources":[]}}'),
('imp003-plain','imp003-deck','plain','plain',2,0,0,NULL,'en',
 '{"en":{"question":"Plain?","answer":""}}',NULL,NULL,NULL),
('imp003-unicode','imp003-deck','unicode','unicode',3,0,0,'unicode','en',
 '{"en":{"question":"Unicode?","answer":""}}',NULL,NULL,
 '{"cardType":"question","topic":"ΐ","provenance":{"type":"generated","sources":[]}}');

INSERT INTO study_events(id,user_id,study_id,card_id,deck_id,kind,created_at)
VALUES('imp003-event','imp003-owner','imp003-session','imp003-question','imp003-deck','SHOWN',1);

INSERT INTO study_sessions(id,user_id,selected_deck_ids,ordering_mode,timer_enabled,timer_seconds,
 current_card_id,session_state,status,version,created_at,updated_at)
VALUES('imp003-session','imp003-owner','["imp003-deck"]','SEQUENTIAL',0,30,'imp003-question',
 '{"queue":[],"history":["imp003-question"],"cursor":0,"current":"imp003-question","revealed":false,"deadline":null,"remainingMs":null,"cycles":{"cards":["imp003-question"],"pending":[],"repeat":[],"history":["imp003-question"],"cursor":0,"complete":false,"cycle":0}}',
 'ACTIVE',9,0,0);
