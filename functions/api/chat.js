// Cloudflare Pages Function — POST /api/chat
// Proxies the "ask me about Soli" chat to Gemini (replaces the Firebase `chat` fn).
// Edge functions are stateless, so conversation context comes from client-sent
// `history` rather than an in-memory session map.
import { systemPrompt } from '../_data.js';

// `-latest` alias auto-tracks the current flash model, so chat won't break when
// Google retires a pinned version (as happened with gemini-2.0-flash).
const GEMINI_MODEL = 'gemini-flash-latest';
const MAX_HISTORY = 12; // cap turns forwarded upstream to bound token usage

const json = (body, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
  });

export const onRequestPost = async ({ request, env }) => {
  try {
    const { message, history } = await request.json();
    if (!message) return json({ error: 'Message is required' }, 400);

    const apiKey = env.GOOGLE_AI_API_KEY;
    if (!apiKey) return json({ error: 'API key not configured' }, 500);

    // Rebuild the conversation from client history (Gemini roles: user | model).
    const contents = [];
    if (Array.isArray(history)) {
      for (const m of history.slice(-MAX_HISTORY)) {
        if (!m || !m.content) continue;
        contents.push({
          role: m.role === 'assistant' ? 'model' : 'user',
          parts: [{ text: String(m.content) }],
        });
      }
    }
    contents.push({ role: 'user', parts: [{ text: message }] });

    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          systemInstruction: { parts: [{ text: systemPrompt }] },
          contents,
        }),
      },
    );

    if (!res.ok) {
      console.error('Gemini error:', res.status, await res.text());
      return json({ error: 'Something went wrong' }, 500);
    }

    const data = await res.json();
    const response = (data.candidates?.[0]?.content?.parts || [])
      .map(p => p.text || '')
      .join('');

    return json({ response });
  } catch (error) {
    console.error('Error:', error);
    return json({ error: 'Something went wrong' }, 500);
  }
};

// CORS preflight (harmless for same-origin; mirrors the old `cors: true`).
export const onRequestOptions = async () =>
  new Response(null, {
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
