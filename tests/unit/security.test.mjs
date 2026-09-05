import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readJson, isAllowedOrigin, checkRateLimit } from '../../functions/_security.js';
import { onRequestPost as chat } from '../../functions/api/chat.js';
import { onRequestPost as contact } from '../../functions/api/contact.js';
import { onRequestPost as board } from '../../functions/api/visitor-board.js';
const request = (body, headers = {}) => new Request('https://soli.blue/api/chat', {
  method: 'POST', body, headers: { Origin: 'https://soli.blue', 'Content-Type': 'application/json', ...headers },
});
test('JSON parser rejects invalid shapes, encodings, and oversized streams', async () => {
  for (const value of ['null', '[]', '123', '"hi"', '{']) {
    await assert.rejects(readJson(request(value), 100), { status: 400 });
  }
  await assert.rejects(readJson(request('{}', { 'Content-Type': 'text/plain' }), 100), { status: 415 });
  await assert.rejects(readJson(request(JSON.stringify({ text: 'é'.repeat(100) })), 100), { status: 413 });
  assert.deepEqual(await readJson(request('{"message":"hi"}'), 100), { message: 'hi' });
});
test('origins exclude missing headers, foreign sites and localhost on production', () => {
  for (const origin of ['', 'https://evil.example', 'http://localhost:8788', 'https://soli-blue.pages.dev.evil.example']) {
    assert.equal(isAllowedOrigin(request('{}', { Origin: origin })), false);
  }
  for (const origin of ['https://soli.blue', 'https://www.soli.blue', 'https://abc.soli-blue.pages.dev']) {
    assert.equal(isAllowedOrigin(request('{}', { Origin: origin })), true);
  }
});
test('all write endpoints reject invalid bodies without contacting upstream', async () => {
  const env = { VISITOR_BOARD_DB: {}, BOARD_HASH_SALT: 'test' };
  for (const handler of [chat, contact, board]) {
    for (const body of ['null', '[]', '{']) {
      assert.equal((await handler({ request: request(body), env })).status, 400);
    }
    assert.equal((await handler({ request: request('{}', { Origin: 'https://evil.example' }), env })).status, 403);
  }
  assert.equal((await chat({ request: request('{"message":{}}'), env })).status, 400);
});
test('rate limiting fails closed without shared storage', async () => {
  await assert.rejects(checkRateLimit(request('{}'), {}, 'chat', 60, 12), { status: 503 });
});

test('shared SQL counters enforce the cap and separate IPs and scopes', async () => {
  const { DatabaseSync } = await import('node:sqlite');
  const db = new DatabaseSync(':memory:');
  db.exec('CREATE TABLE api_rate_limits (key TEXT PRIMARY KEY, count INTEGER NOT NULL, expires_at INTEGER NOT NULL)');
  const env = { BOARD_HASH_SALT: 'unit-test', VISITOR_BOARD_DB: { prepare(sql) {
    return { bind(...args) { return {
      async first() { return db.prepare(sql).get(...args); },
      async run() { return db.prepare(sql).run(...args); },
    }; } };
  } } };
  try {
    const results = await Promise.all(Array.from({ length: 20 }, () => checkRateLimit(request('{}'), env, 'chat', 600, 5)));
    assert.equal(results.filter(Boolean).length, 5);
    assert.equal(await checkRateLimit(request('{}', { 'CF-Connecting-IP': '192.0.2.2' }), env, 'chat', 600, 5), true);
    assert.equal(await checkRateLimit(request('{}'), env, 'contact', 600, 5), true);
    const keys = db.prepare('SELECT key FROM api_rate_limits').all();
    assert.equal(keys.every(row => /^[a-f0-9]{64}$/.test(row.key)), true);
  } finally { db.close(); }
});

test('chat forwards bounded history and streams upstream; contact passes reply-to without sending mail', async () => {
  const originalFetch = globalThis.fetch;
  const calls = [];
  globalThis.fetch = async (url, options) => {
    calls.push({ url, options, payload: JSON.parse(options.body) });
    return new Response(url.includes('resend') ? '{"id":"stub"}' : 'data: {}\n\n', { status: 200 });
  };
  const env = { BOARD_HASH_SALT: 'test', GOOGLE_AI_API_KEY: 'test-key', RESEND_API_KEY: 'test-key',
    VISITOR_BOARD_DB: { prepare() { return { bind() { return { async first() { return { count: 1 }; }, async run() { return {}; } }; } }; } },
  };
  try {
    const response = await chat({ request: request(JSON.stringify({ message: 'hello', history: [{ role: 'user', content: 'previous' }] })), env });
    assert.equal(response.status, 200);
    assert.match(response.headers.get('Content-Type'), /text\/event-stream/);
    assert.equal(calls[0].url.includes('test-key'), false);
    assert.equal(calls[0].options.headers['x-goog-api-key'], 'test-key');
    assert.deepEqual(calls[0].payload.contents.map(turn => turn.parts[0].text), ['previous', 'hello']);
    const sent = await contact({ request: request(JSON.stringify({ email: 'visitor@example.com', subject: 'Hello', message: 'A test' })), env });
    assert.equal(sent.status, 200);
    assert.equal(calls[1].payload.reply_to, 'visitor@example.com');
    assert.equal(calls[1].payload.text, 'Reply to: visitor@example.com\n\nA test');
  } finally { globalThis.fetch = originalFetch; }
});
