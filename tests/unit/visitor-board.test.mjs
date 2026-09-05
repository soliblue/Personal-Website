import { test } from 'node:test';
import assert from 'node:assert/strict';
import { DatabaseSync } from 'node:sqlite';
import { readFileSync } from 'node:fs';
import { onRequestGet, onRequestPost } from '../../functions/api/visitor-board.js';

test('free notes round-trip literally, remain optional, and retain atomic limits and old notes', async () => {
  const db = new DatabaseSync(':memory:');
  db.exec(readFileSync('migrations/0001_create_visitor_board.sql', 'utf8'));
  db.exec(readFileSync('migrations/0003_visitor_free_text.sql', 'utf8'));
  const env = { BOARD_HASH_SALT: 'test', VISITOR_BOARD_DB: { prepare(sql) {
    const run = (args = []) => ({
      bind(...values) { return run(values); },
      async first() { return db.prepare(sql).get(...args); },
      async all() { return { results: db.prepare(sql).all(...args) }; },
      async run() { const r = db.prepare(sql).run(...args); return { meta: { changes: r.changes, last_row_id: Number(r.lastInsertRowid) } }; },
    }); return run();
  } } };
  const send = (message, extra = {}) => onRequestPost({ env, request: new Request('https://soli.blue/api/visitor-board', {
    method: 'POST', headers: { Origin: 'https://soli.blue', 'Content-Type': 'application/json', 'CF-Connecting-IP': '192.0.2.1' },
    body: JSON.stringify({ name: 'Friendly AI', stamp: 'globe', color: 'sky', message, ...extra }),
  }) });
  try {
    for (const message of [null, {}, [], 'x'.repeat(161), 'hello\u202eevil', 'hi\u0000', '\u0344'.repeat(160), 'hi\u061c']) {
      assert.equal((await send(message)).status, 400);
    }
    const attack = '<img src=x onerror=alert(1)> "); DROP TABLE visitor_board_entries; --';
    const result = await send(attack); assert.equal(result.status, 201);
    assert.equal((await result.json()).entry.message, attack);
    const empty = await send(undefined); assert.equal(empty.status, 201);
    assert.equal((await empty.json()).entry.message, '');
    assert.equal((await send('Hello 🌍')).status, 201);
    assert.equal((await send('One too many')).status, 429);
    const response = await onRequestGet({ env, request: new Request('https://soli.blue/api/visitor-board') });
    const data = await response.json();
    assert.equal(data.total, 4);
    assert.equal(data.entries.at(-1).message, null);
    assert.equal(data.entries.at(-1).messageKey, 'welcome');
    assert.equal(data.entries.some(entry => 'ip_hash' in entry), false);
  } finally { db.close(); }
});
