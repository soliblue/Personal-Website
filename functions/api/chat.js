// Cloudflare Pages Function — POST /api/chat
// Proxies the "ask me about Soli" chat to Gemini (replaces the Firebase `chat` fn).
// Edge functions are stateless, so conversation context comes from client-sent
// `history` rather than an in-memory session map.
import { systemPrompt } from '../_data.js';

// `-latest` alias auto-tracks the current flash model, so chat won't break when
// Google retires a pinned version (as happened with gemini-2.0-flash).
const GEMINI_MODEL = 'gemini-flash-latest';
const MAX_HISTORY = 12; // cap turns forwarded upstream to bound token usage
const MAX_MESSAGE_LENGTH = 1200;
const MAX_HISTORY_ITEM_LENGTH = 1600;
const MAX_BODY_BYTES = 24000;
const RATE_LIMIT_WINDOW_MS = 60 * 1000;
const RATE_LIMIT_MAX = 12;
const rateLimits = new Map();

const ALLOWED_ORIGINS = new Set([
  'https://soli.blue',
  'https://www.soli.blue',
  'http://localhost:8080',
  'http://localhost:8081',
  'http://localhost:8788',
]);

const getCorsHeaders = (request) => {
  const origin = request.headers.get('Origin');
  if (!origin || !ALLOWED_ORIGINS.has(origin)) return {};

  return {
    'Access-Control-Allow-Origin': origin,
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    Vary: 'Origin',
  };
};

const isAllowedOrigin = request => (
  !request.headers.get('Origin') || ALLOWED_ORIGINS.has(request.headers.get('Origin'))
);

const json = (request, body, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json', ...getCorsHeaders(request) },
  });

const checkRateLimit = (request) => {
  const now = Date.now();
  const ip = request.headers.get('CF-Connecting-IP') || 'unknown';
  const current = rateLimits.get(ip);

  if (rateLimits.size > 1000) {
    for (const [key, value] of rateLimits) {
      if (now - value.startedAt > RATE_LIMIT_WINDOW_MS) rateLimits.delete(key);
    }
  }

  if (!current || now - current.startedAt > RATE_LIMIT_WINDOW_MS) {
    rateLimits.set(ip, { startedAt: now, count: 1 });
    return true;
  }

  current.count += 1;
  return current.count <= RATE_LIMIT_MAX;
};

export const onRequestPost = async ({ request, env }) => {
  try {
    if (!isAllowedOrigin(request)) return json(request, { error: 'Forbidden' }, 403);
    if (!checkRateLimit(request)) return json(request, { error: 'Too many requests' }, 429);

    const contentLength = Number(request.headers.get('Content-Length') || 0);
    if (contentLength > MAX_BODY_BYTES) {
      return json(request, { error: 'Request is too large' }, 413);
    }

    const bodyText = await request.text();
    if (new TextEncoder().encode(bodyText).length > MAX_BODY_BYTES) {
      return json(request, { error: 'Request is too large' }, 413);
    }

    let payload;
    try {
      payload = JSON.parse(bodyText);
    } catch (error) {
      return json(request, { error: 'Invalid JSON' }, 400);
    }

    const { message, history } = payload;
    const normalizedMessage = String(message || '').trim();
    if (!normalizedMessage) return json(request, { error: 'Message is required' }, 400);
    if (normalizedMessage.length > MAX_MESSAGE_LENGTH) {
      return json(request, { error: 'Message is too long' }, 400);
    }

    const apiKey = env.GOOGLE_AI_API_KEY;
    if (!apiKey) return json(request, { error: 'API key not configured' }, 500);

    // Rebuild the conversation from client history (Gemini roles: user | model).
    const contents = [];
    if (Array.isArray(history)) {
      for (const m of history.slice(-MAX_HISTORY)) {
        if (!m || !m.content) continue;
        const text = String(m.content).slice(0, MAX_HISTORY_ITEM_LENGTH);
        contents.push({
          role: m.role === 'assistant' ? 'model' : 'user',
          parts: [{ text }],
        });
      }
    }
    contents.push({ role: 'user', parts: [{ text: normalizedMessage }] });

    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          systemInstruction: { parts: [{ text: systemPrompt }] },
          contents,
          generationConfig: {
            maxOutputTokens: 512,
          },
        }),
      },
    );

    if (!res.ok) {
      console.error('Gemini error:', res.status, await res.text());
      return json(request, { error: 'Something went wrong' }, 500);
    }

    const data = await res.json();
    const response = (data.candidates?.[0]?.content?.parts || [])
      .map(p => p.text || '')
      .join('');

    return json(request, { response });
  } catch (error) {
    console.error('Error:', error);
    return json(request, { error: 'Something went wrong' }, 500);
  }
};

// CORS preflight (harmless for same-origin; mirrors the old `cors: true`).
export const onRequestOptions = async ({ request }) => {
  if (!isAllowedOrigin(request)) return new Response(null, { status: 403 });
  return new Response(null, { headers: getCorsHeaders(request) });
};
