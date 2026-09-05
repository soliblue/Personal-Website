import { test } from 'node:test';
import assert from 'node:assert/strict';
import { streamChat } from '../../src/utils/chat.js';
test('chat consumes split UTF-8 events, CRLF, and final unterminated event', async () => {
  const originalFetch = globalThis.fetch;
  let sent;
  globalThis.fetch = async (_url, options) => {
    sent = JSON.parse(options.body);
    const event = text => `data: ${JSON.stringify({ candidates: [{ content: { parts: [{ text }] } }] })}`;
    const bytes = new TextEncoder().encode(`${event('héllo ')}\r\n\r\n${event('world')}`);
    return new Response(new ReadableStream({ start(controller) {
      for (const byte of bytes) controller.enqueue(new Uint8Array([byte]));
      controller.close();
    } }));
  };
  try {
    let text = '';
    await streamChat('hello', [], chunk => { text += chunk; });
    assert.equal(text, 'héllo world');
    assert.deepEqual(sent, { message: 'hello', history: [] });
  } finally { globalThis.fetch = originalFetch; }
});
