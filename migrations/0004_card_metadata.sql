ALTER TABLE cards ADD COLUMN interview_priority INTEGER CHECK (interview_priority BETWEEN 1 AND 5);
ALTER TABLE cards ADD COLUMN difficulty INTEGER CHECK (difficulty BETWEEN 1 AND 5);
