import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { DatabaseSync } from 'node:sqlite';

test('removing Visitor Board deletes entries and preserves shared API rate limits', () => {
  const db = new DatabaseSync(':memory:');
  try {
    for (const migration of ['0001_create_visitor_board', '0002_api_rate_limits', '0003_visitor_free_text']) {
      db.exec(readFileSync(`migrations/${migration}.sql`, 'utf8'));
    }
    db.exec("INSERT INTO api_rate_limits VALUES ('test', 2, 9999999999)");
    const removal = readFileSync('migrations/0004_remove_visitor_board.sql', 'utf8');
    db.exec(removal);
    db.exec(removal);
    assert.equal(db.prepare("SELECT COUNT(*) AS n FROM sqlite_master WHERE name = 'visitor_board_entries'").get().n, 0);
    assert.equal(db.prepare("SELECT count FROM api_rate_limits WHERE key = 'test'").get().count, 2);
  } finally {
    db.close();
  }
});
