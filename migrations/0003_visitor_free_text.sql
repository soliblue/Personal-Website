-- NULL preserves the display of existing preset notes; empty string is a new note without text.
ALTER TABLE visitor_board_entries ADD COLUMN message TEXT
  CHECK (message IS NULL OR length(message) <= 160);
