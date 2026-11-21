-- Add storage only. Existing card content is deliberately not migrated.
ALTER TABLE cards ADD COLUMN metadata TEXT CHECK(metadata IS NULL OR json_valid(metadata));
