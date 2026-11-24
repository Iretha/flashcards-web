-- Index contract v2 includes task details even when source translations are unchanged.
DELETE FROM card_search_ready;
DELETE FROM card_search_rows;
DELETE FROM card_search;
UPDATE card_search_state SET version=2,mode='rebuilding',token=NULL,epoch=epoch+1 WHERE id=1;
