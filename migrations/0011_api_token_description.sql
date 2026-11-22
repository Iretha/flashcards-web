ALTER TABLE api_tokens ADD COLUMN description TEXT CHECK (description IS NULL OR length(description) <= 500);
