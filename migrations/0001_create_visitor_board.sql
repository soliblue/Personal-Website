CREATE TABLE IF NOT EXISTS visitor_board_entries (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  display_name TEXT NOT NULL CHECK (length(display_name) BETWEEN 2 AND 24),
  stamp TEXT NOT NULL CHECK (stamp IN (
    'star', 'heart', 'floppy', 'flower', 'globe', 'coffee', 'rocket', 'smile'
  )),
  color TEXT NOT NULL CHECK (color IN (
    'lemon', 'mint', 'peach', 'lavender', 'sky', 'rose'
  )),
  message_key TEXT NOT NULL CHECK (message_key IN (
    'welcome', 'was-here', 'made-me-smile', 'tiny-internet', 'squirrel',
    'clicked-everything', 'keep-weird', 'hello-future', 'good-vibes'
  )),
  created_at INTEGER NOT NULL DEFAULT (unixepoch()),
  ip_hash TEXT
);

CREATE INDEX IF NOT EXISTS visitor_board_entries_created_at
  ON visitor_board_entries (created_at DESC);

CREATE INDEX IF NOT EXISTS visitor_board_entries_rate_limit
  ON visitor_board_entries (ip_hash, created_at DESC);

INSERT INTO visitor_board_entries (
  display_name,
  stamp,
  color,
  message_key,
  ip_hash
) VALUES (
  'soli',
  'floppy',
  'sky',
  'welcome',
  NULL
);
