import { isAllowedOrigin, readJson, checkRateLimit } from '../_security.js';
// Cloudflare Pages Function - POST /api/contact
// Sends the Windows 95 contact form to Soli through Resend.

const MAX_BODY_BYTES = 12000;
const MAX_EMAIL_LENGTH = 254;
const MAX_SUBJECT_LENGTH = 160;
const MAX_MESSAGE_LENGTH = 5000;

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
  headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store', 'X-Content-Type-Options': 'nosniff', ...getCorsHeaders(request) },
});


const isValidEmail = email => (
  email.length <= MAX_EMAIL_LENGTH
  && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
  && !/[\r\n]/.test(email)
);

export const onRequestPost = async ({ request, env }) => {
  try {
    if (!isAllowedOrigin(request)) return json(request, { error: 'Forbidden' }, 403);

    const payload = await readJson(request, MAX_BODY_BYTES);

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

    if (!await checkRateLimit(request, env, 'contact', 600, 5)) {
      return json(request, { error: 'Too many messages. Please try again later.' }, 429);
    }
    if (!env.RESEND_API_KEY) {
      console.error('Contact form: RESEND_API_KEY is not configured');
      return json(request, { error: 'Email service is not configured.' }, 500);
    }

    const to = env.CONTACT_TO || 'asoliman96@gmail.com';
    const from = env.CONTACT_FROM || 'Soli Website <onboarding@resend.dev>';
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      signal: AbortSignal.timeout(15000),
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
    if (error.status) return json(request, { error: error.message }, error.status);
    console.error('Contact form error:', error);
    return json(request, { error: 'Email could not be sent. Please try again.' }, 500);
  }
};

export const onRequestOptions = async ({ request }) => {
  if (!isAllowedOrigin(request)) return new Response(null, { status: 403 });
  return new Response(null, { headers: getCorsHeaders(request) });
};
