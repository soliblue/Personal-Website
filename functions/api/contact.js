// Cloudflare Pages Function - POST /api/contact
// Sends the Windows 95 contact form to Soli through Resend.

const MAX_BODY_BYTES = 12000;
const MAX_EMAIL_LENGTH = 254;
const MAX_SUBJECT_LENGTH = 160;
const MAX_MESSAGE_LENGTH = 5000;
const RATE_LIMIT_WINDOW_MS = 10 * 60 * 1000;
const RATE_LIMIT_MAX = 5;
const rateLimits = new Map();

const ALLOWED_ORIGINS = new Set([
  'https://soli.blue',
  'https://www.soli.blue',
  'https://soli-blue.pages.dev',
  'http://localhost:8080',
  'http://localhost:8081',
  'http://localhost:8082',
  'http://localhost:8788',
]);

const isAllowedOrigin = (request) => {
  const origin = request.headers.get('Origin');
  if (!origin || ALLOWED_ORIGINS.has(origin)) return true;

  try {
    const { hostname, protocol } = new URL(origin);
    return protocol === 'https:' && hostname.endsWith('.soli-blue.pages.dev');
  } catch (error) {
    return false;
  }
};

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

const json = (request, body, status = 200) => new Response(JSON.stringify(body), {
  status,
  headers: { 'Content-Type': 'application/json', ...getCorsHeaders(request) },
});

const checkRateLimit = (request) => {
  const now = Date.now();
  const ip = request.headers.get('CF-Connecting-IP') || 'unknown';
  const current = rateLimits.get(ip);

  if (rateLimits.size > 1000) {
    rateLimits.forEach((value, key) => {
      if (now - value.startedAt > RATE_LIMIT_WINDOW_MS) rateLimits.delete(key);
    });
  }

  if (!current || now - current.startedAt > RATE_LIMIT_WINDOW_MS) {
    rateLimits.set(ip, { startedAt: now, count: 1 });
    return true;
  }

  current.count += 1;
  return current.count <= RATE_LIMIT_MAX;
};

const isValidEmail = email => (
  email.length <= MAX_EMAIL_LENGTH
  && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
  && !/[\r\n]/.test(email)
);

export const onRequestPost = async ({ request, env }) => {
  try {
    if (!isAllowedOrigin(request)) return json(request, { error: 'Forbidden' }, 403);
    if (!checkRateLimit(request)) {
      return json(request, { error: 'Too many messages. Please try again later.' }, 429);
    }

    const contentLength = Number(request.headers.get('Content-Length') || 0);
    if (contentLength > MAX_BODY_BYTES) {
      return json(request, { error: 'Message is too large.' }, 413);
    }

    const bodyText = await request.text();
    if (new TextEncoder().encode(bodyText).length > MAX_BODY_BYTES) {
      return json(request, { error: 'Message is too large.' }, 413);
    }

    let payload;
    try {
      payload = JSON.parse(bodyText);
    } catch (error) {
      return json(request, { error: 'Invalid request.' }, 400);
    }

    const email = String(payload.email || '').trim();
    const subject = String(payload.subject || 'Hello!').trim().slice(0, MAX_SUBJECT_LENGTH);
    const message = String(payload.message || '').trim();
    const company = String(payload.company || '').trim();

    // Quietly accept bot-filled honeypot submissions without sending email.
    if (company) return json(request, { ok: true });
    if (!isValidEmail(email)) return json(request, { error: 'Enter a valid email address.' }, 400);
    if (!message) return json(request, { error: 'Write a message before sending.' }, 400);
    if (message.length > MAX_MESSAGE_LENGTH) {
      return json(request, { error: 'Message is too long.' }, 400);
    }

    if (!env.RESEND_API_KEY) {
      console.error('Contact form: RESEND_API_KEY is not configured');
      return json(request, { error: 'Email service is not configured.' }, 500);
    }

    const to = env.CONTACT_TO || 'asoliman96@gmail.com';
    const from = env.CONTACT_FROM || 'Soli Website <onboarding@resend.dev>';
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${env.RESEND_API_KEY}`,
        'Content-Type': 'application/json',
        'Idempotency-Key': crypto.randomUUID(),
      },
      body: JSON.stringify({
        from,
        to: [to],
        reply_to: email,
        subject: `soli.blue: ${subject || 'Hello!'}`,
        text: `Reply to: ${email}\n\n${message}`,
      }),
    });

    if (!response.ok) {
      console.error('Resend error:', response.status, await response.text());
      return json(request, { error: 'Email could not be sent. Please try again.' }, 502);
    }

    return json(request, { ok: true });
  } catch (error) {
    console.error('Contact form error:', error);
    return json(request, { error: 'Email could not be sent. Please try again.' }, 500);
  }
};

export const onRequestOptions = async ({ request }) => {
  if (!isAllowedOrigin(request)) return new Response(null, { status: 403 });
  return new Response(null, { headers: getCorsHeaders(request) });
};
