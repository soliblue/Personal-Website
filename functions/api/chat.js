import { isAllowedOrigin, readJson, checkRateLimit } from '../_security.js';
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
const MAX_OUTPUT_TOKENS = 2048;

const getCorsHeaders = (request) => {
  const origin = request.headers.get('Origin');
  if (!origin || !isAllowedOrigin(request)) return {};

  return {
    'Access-Control-Allow-Origin': origin,
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    Vary: 'Origin',
  };
};


const json = (request, body, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store', 'X-Content-Type-Options': 'nosniff', ...getCorsHeaders(request) },
  });


export const onRequestPost = async ({ request, env }) => {
  try {
    if (!isAllowedOrigin(request)) return json(request, { error: 'Forbidden' }, 403);

    const payload = await readJson(request, MAX_BODY_BYTES);

    const { message, history } = payload;
    if (typeof message !== 'string' || (history !== undefined && !Array.isArray(history))) {
      return json(request, { error: 'Invalid request.' }, 400);
    }
    const normalizedMessage = message.trim();
    if (!normalizedMessage) return json(request, { error: 'Message is required' }, 400);
    if (normalizedMessage.length > MAX_MESSAGE_LENGTH) {
      return json(request, { error: 'Message is too long' }, 400);
    }

    if (!await checkRateLimit(request, env, 'chat-minute', 60, 12)
      || !await checkRateLimit(request, env, 'chat-day', 86400, 100)) {
      return json(request, { error: 'Too many requests' }, 429);
    }
    const apiKey = env.GOOGLE_AI_API_KEY;
    if (!apiKey) return json(request, { error: 'API key not configured' }, 500);

    // Rebuild the conversation from client history (Gemini roles: user | model).
    const contents = [];
    if (Array.isArray(history)) {
      for (const m of history.slice(-MAX_HISTORY)) {
        if (!m || typeof m.content !== 'string' || !['user', 'assistant'].includes(m.role)) continue;
        const text = String(m.content).slice(0, MAX_HISTORY_ITEM_LENGTH);
        contents.push({
          role: m.role === 'assistant' ? 'model' : 'user',
          parts: [{ text }],
        });
      }
    }
    contents.push({ role: 'user', parts: [{ text: normalizedMessage }] });

    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:streamGenerateContent?alt=sse`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-goog-api-key': apiKey },
        signal: AbortSignal.timeout(45000),
        body: JSON.stringify({
          systemInstruction: { parts: [{ text: systemPrompt }] },
          contents,
          generationConfig: {
            maxOutputTokens: MAX_OUTPUT_TOKENS,
          },
        }),
      },
    );

    if (!res.ok) {
      console.error('Gemini error:', res.status, await res.text());
      return json(request, { error: 'Something went wrong' }, 500);
    }

    return new Response(res.body, {
      headers: {
        'Content-Type': 'text/event-stream; charset=utf-8',
        'Cache-Control': 'no-store, no-transform',
        'X-Content-Type-Options': 'nosniff',
        ...getCorsHeaders(request),
      },
    });
  } catch (error) {
    if (error.status) return json(request, { error: error.message }, error.status);
    console.error('Error:', error);
    return json(request, { error: 'Something went wrong' }, 500);
  }
};

// CORS preflight (harmless for same-origin; mirrors the old `cors: true`).
export const onRequestOptions = async ({ request }) => {
  if (!isAllowedOrigin(request)) return new Response(null, { status: 403 });
  return new Response(null, { headers: getCorsHeaders(request) });
};
