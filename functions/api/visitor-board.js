import { isAllowedOrigin, readJson } from '../_security.js';
// Cloudflare Pages Function - GET/POST /api/visitor-board
// Stores a deliberately constrained public guestbook in D1.

const MAX_BODY_BYTES = 2048;
const MAX_VISIBLE_ENTRIES = 80;
const MIN_NAME_LENGTH = 2;
const MAX_NAME_LENGTH = 24;
const HOURLY_LIMIT = 3;
const DAILY_LIMIT = 8;

const ALLOWED_STAMPS = new Set([
  'star', 'heart', 'floppy', 'flower', 'globe', 'coffee', 'rocket', 'smile',
]);
const ALLOWED_COLORS = new Set(['lemon', 'mint', 'peach', 'lavender', 'sky', 'rose']);
const ALLOWED_MESSAGES = new Set([
  'was-here',
  'made-me-smile',
  'tiny-internet',
  'squirrel',
  'clicked-everything',
  'keep-weird',
  'hello-future',
  'good-vibes',
]);
const RESERVED_NAMES = new Set([
  'admin', 'administrator', 'moderator', 'soli', 'system', 'visitor board',
]);
const getCorsHeaders = (request) => {
  const origin = request.headers.get('Origin');
  if (!origin || !isAllowedOrigin(request)) return {};

  return {
    'Access-Control-Allow-Origin': origin,
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    Vary: 'Origin',
  };
};

const json = (request, body, status = 200) => new Response(JSON.stringify(body), {
  status,
  headers: {
    'Content-Type': 'application/json; charset=utf-8',
    'Cache-Control': 'no-store',
    'X-Content-Type-Options': 'nosniff',
    ...getCorsHeaders(request),
  },
});

const normalizeName = value => String(value || '')
  .normalize('NFKC')
  .replace(/\s+/g, ' ')
  .trim();

const isUnsupportedCharacter = (character) => {
  const code = character.codePointAt(0);
  return code <= 0x1f
    || (code >= 0x7f && code <= 0x9f)
    || (code >= 0x200b && code <= 0x200f)
    || (code >= 0x202a && code <= 0x202e)
    || (code >= 0x2060 && code <= 0x206f)
    || code === 0xfeff;
};

const validateName = (name) => {
  const length = Array.from(name).length;
  if (length < MIN_NAME_LENGTH || length > MAX_NAME_LENGTH) {
    return `Use ${MIN_NAME_LENGTH}-${MAX_NAME_LENGTH} characters for your name.`;
  }
  if (RESERVED_NAMES.has(name.toLocaleLowerCase('en-US'))) return 'That name is reserved.';
  if (/[<>/@\\]|https?:|www\./i.test(name)) return 'Names cannot contain links or handles.';
  if (Array.from(name).some(isUnsupportedCharacter)) {
    return 'That name contains unsupported characters.';
  }
  if (!/^[\p{L}\p{M}\p{N}][\p{L}\p{M}\p{N} ._'’-]*$/u.test(name)) {
    return 'Use letters, numbers, spaces, dots, apostrophes, or hyphens.';
  }
  return '';
};

const hashIp = async (request, salt) => {
  const ip = request.headers.get('CF-Connecting-IP') || 'unknown';
  const source = new TextEncoder().encode(`${salt}:${ip}`);
  const digest = await crypto.subtle.digest('SHA-256', source);
  return Array.from(new Uint8Array(digest))
    .map(byte => byte.toString(16).padStart(2, '0'))
    .join('');
};

const serializeEntry = row => ({
  id: Number(row.id),
  name: row.name,
  stamp: row.stamp,
  color: row.color,
  messageKey: row.messageKey,
  createdAt: Number(row.createdAt),
});

const ensureDatabase = (request, env) => {
  if (env.VISITOR_BOARD_DB) return null;
  console.error('Visitor Board: VISITOR_BOARD_DB is not configured');
  return json(request, { error: 'The board is taking a tiny nap.' }, 503);
};

export const onRequestGet = async ({ request, env }) => {
  const unavailable = ensureDatabase(request, env);
  if (unavailable) return unavailable;

  try {
    const entriesResult = await env.VISITOR_BOARD_DB.prepare(`
      SELECT
        id,
        display_name AS name,
        stamp,
        color,
        message_key AS messageKey,
        created_at AS createdAt
      FROM visitor_board_entries
      ORDER BY id DESC
      LIMIT ?
    `).bind(MAX_VISIBLE_ENTRIES).all();
    const totalResult = await env.VISITOR_BOARD_DB.prepare(`
      SELECT COUNT(*) AS count FROM visitor_board_entries
    `).first();

    return json(request, {
      entries: (entriesResult.results || []).map(serializeEntry),
      total: Number((totalResult && totalResult.count) || 0),
    });
  } catch (error) {
    if (error.status) return json(request, { error: error.message }, error.status);
    console.error('Visitor Board read error:', error);
    return json(request, { error: 'The board could not be loaded.' }, 500);
  }
};

export const onRequestPost = async ({ request, env }) => {
  if (!isAllowedOrigin(request)) return json(request, { error: 'Forbidden' }, 403);

  const unavailable = ensureDatabase(request, env);
  if (unavailable) return unavailable;
  if (!env.BOARD_HASH_SALT) {
    console.error('Visitor Board: BOARD_HASH_SALT is not configured');
    return json(request, { error: 'The board is taking a tiny nap.' }, 503);
  }

  try {
    const payload = await readJson(request, MAX_BODY_BYTES);

    // Quietly accept generic form-bot submissions without writing anything.
    if (String(payload.website || '').trim()) return json(request, { ok: true });

    const name = normalizeName(payload.name);
    const stamp = String(payload.stamp || '');
    const color = String(payload.color || '');
    const messageKey = String(payload.messageKey || '');
    const nameError = validateName(name);

    if (nameError) return json(request, { error: nameError }, 400);
    if (!ALLOWED_STAMPS.has(stamp)) return json(request, { error: 'Pick a valid stamp.' }, 400);
    if (!ALLOWED_COLORS.has(color)) return json(request, { error: 'Pick a valid paper color.' }, 400);
    if (!ALLOWED_MESSAGES.has(messageKey)) {
      return json(request, { error: 'Pick one of the available notes.' }, 400);
    }

    const ipHash = await hashIp(request, env.BOARD_HASH_SALT);
    const insertResult = await env.VISITOR_BOARD_DB.prepare(`
      INSERT INTO visitor_board_entries (
        display_name,
        stamp,
        color,
        message_key,
        ip_hash,
        created_at
      )
      SELECT ?, ?, ?, ?, ?, unixepoch()
      WHERE (
        SELECT COUNT(*) FROM visitor_board_entries
        WHERE ip_hash = ? AND created_at >= unixepoch() - 3600
      ) < ?
      AND (
        SELECT COUNT(*) FROM visitor_board_entries
        WHERE ip_hash = ? AND created_at >= unixepoch() - 86400
      ) < ?
    `).bind(
      name,
      stamp,
      color,
      messageKey,
      ipHash,
      ipHash,
      HOURLY_LIMIT,
      ipHash,
      DAILY_LIMIT,
    ).run();

    if (!insertResult.meta || Number(insertResult.meta.changes) !== 1) {
      return json(request, { error: 'You have pinned enough notes for now. Come back later!' }, 429);
    }

    // Rate-limit identifiers are no longer useful after one day, so forget them.
    await env.VISITOR_BOARD_DB.prepare(`
      UPDATE visitor_board_entries
      SET ip_hash = NULL
      WHERE ip_hash IS NOT NULL AND created_at < unixepoch() - 86400
    `).run();

    const row = await env.VISITOR_BOARD_DB.prepare(`
      SELECT
        id,
        display_name AS name,
        stamp,
        color,
        message_key AS messageKey,
        created_at AS createdAt
      FROM visitor_board_entries
      WHERE id = ?
    `).bind(insertResult.meta.last_row_id).first();

    return json(request, { ok: true, entry: serializeEntry(row) }, 201);
  } catch (error) {
    if (error.status) return json(request, { error: error.message }, error.status);
    console.error('Visitor Board write error:', error);
    return json(request, { error: 'The note could not be pinned. Please try again.' }, 500);
  }
};

export const onRequestOptions = async ({ request }) => {
  if (!isAllowedOrigin(request)) return new Response(null, { status: 403 });
  return new Response(null, { headers: getCorsHeaders(request) });
};
