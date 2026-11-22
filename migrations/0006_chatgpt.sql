ALTER TABLE decks ADD COLUMN chatgpt_default TEXT NOT NULL DEFAULT 'universal';
ALTER TABLE decks ADD COLUMN chatgpt_en TEXT;
ALTER TABLE decks ADD COLUMN chatgpt_bg TEXT;
UPDATE decks SET chatgpt_default = 'legacy';
