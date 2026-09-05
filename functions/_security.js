const productionHosts = new Set(['soli.blue', 'www.soli.blue', 'soli-blue.pages.dev']);
export function isAllowedOrigin(request) {
  const origin = request.headers.get('Origin');
  if (!origin) return false;
  try {
    const source = new URL(origin);
    const target = new URL(request.url);
    if (source.protocol === 'https:' && (productionHosts.has(source.hostname)
      || source.hostname.endsWith('.soli-blue.pages.dev'))) return true;
    return ['localhost', '127.0.0.1'].includes(target.hostname)
      && source.origin === target.origin;
  } catch { return false; }
}

export async function readJson(request, maxBytes) {
  if (!/^application\/json(?:;|$)/i.test(request.headers.get('Content-Type') || '')) {
    throw Object.assign(new Error('Content-Type must be application/json.'), { status: 415 });
  }
  const tooLarge = () => Object.assign(new Error('Request is too large.'), { status: 413 });
  if (Number(request.headers.get('Content-Length')) > maxBytes) throw tooLarge();
  const reader = request.body?.getReader();
  if (!reader) throw Object.assign(new Error('Invalid request.'), { status: 400 });
  let bytes = 0;
  let text = '';
  const decoder = new TextDecoder();
  try {
    while (true) {
      const { value, done } = await reader.read();
      if (done) break;
      bytes += value.byteLength;
      if (bytes > maxBytes) throw tooLarge();
      text += decoder.decode(value, { stream: true });
    }
    text += decoder.decode();
  } finally {
    await reader.cancel().catch(() => {});
    reader.releaseLock();
  }
  try {
    const payload = JSON.parse(text);
    if (!payload || typeof payload !== 'object' || Array.isArray(payload)) throw new Error();
    return payload;
  } catch { throw Object.assign(new Error('Invalid request.'), { status: 400 }); }
}

// D1 makes the limit atomic across isolates; hashes expire with each time window.
export async function checkRateLimit(request, env, scope, windowSeconds, max) {
  if (!env.VISITOR_BOARD_DB || !env.BOARD_HASH_SALT) {
    throw Object.assign(new Error('Service temporarily unavailable.'), { status: 503 });
  }
  const now = Math.floor(Date.now() / 1000);
  const window = Math.floor(now / windowSeconds);
  const ip = request.headers.get('CF-Connecting-IP') || 'local';
  const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(
    `${env.BOARD_HASH_SALT}:${scope}:${window}:${ip}`,
  ));
  const key = Array.from(new Uint8Array(digest)).map(v => v.toString(16).padStart(2, '0')).join('');
  const result = await env.VISITOR_BOARD_DB.prepare(`
    INSERT INTO api_rate_limits (key, count, expires_at) VALUES (?, 1, ?)
    ON CONFLICT(key) DO UPDATE SET count = count + 1 WHERE count < ?
    RETURNING count
  `).bind(key, (window + 1) * windowSeconds, max).first();
  await env.VISITOR_BOARD_DB.prepare('DELETE FROM api_rate_limits WHERE expires_at < ?').bind(now).run();
  return Boolean(result);
}
