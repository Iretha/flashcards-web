ALTER TABLE api_tokens ADD COLUMN purpose TEXT NOT NULL DEFAULT 'management' CHECK(purpose IN ('management','mcp'));
