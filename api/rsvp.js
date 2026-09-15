import { setResponse, listResponses, redis } from '../lib/kv.js';

const NAME_MAX = 100;
const MESSAGE_MAX = 500;
const RATE_LIMIT_WINDOW_SECONDS = 600;
const RATE_LIMIT_MAX_NAMES_PER_IP = 8;

function badRequest(res, error) {
  res.status(400).json({ ok: false, error });
}

async function handlePost(req, res) {
  const body = req.body || {};
  const name = typeof body.name === 'string' ? body.name.trim() : '';
  const attending = body.attending;
  const message = typeof body.message === 'string' ? body.message.trim() : '';
  const honeypot = typeof body.hp === 'string' ? body.hp.trim() : '';

  // Honeypot: pretend success, store nothing — a bot can't tell it was rejected.
  if (honeypot) {
    res.status(201).json({ ok: true });
    return;
  }

  if (!name || name.length > NAME_MAX) {
    badRequest(res, 'invalid_name');
    return;
  }
  if (typeof attending !== 'boolean') {
    badRequest(res, 'invalid_attending');
    return;
  }
  if (message.length > MESSAGE_MAX) {
    badRequest(res, 'too_long');
    return;
  }

  const ip = (req.headers['x-forwarded-for'] || req.socket?.remoteAddress || 'unknown')
    .toString()
    .split(',')[0]
    .trim();
  const nameKey = name.toLowerCase();

  // Cap distinct names per IP per window, not requests per IP: re-submitting
  // the SAME name (an update, FR-005) must never be throttled — only an IP
  // fanning out across many different fake names (spam) should be.
  const ipNamesKey = `rsvp:ratelimit:${ip}`;
  await redis.sadd(ipNamesKey, nameKey);
  await redis.expire(ipNamesKey, RATE_LIMIT_WINDOW_SECONDS);
  const distinctNames = await redis.scard(ipNamesKey);
  if (distinctNames > RATE_LIMIT_MAX_NAMES_PER_IP) {
    res.status(429).json({ ok: false, error: 'rate_limited' });
    return;
  }
  await setResponse(nameKey, {
    name,
    attending,
    message,
    submittedAt: new Date().toISOString(),
  });

  res.status(201).json({ ok: true });
}

async function handleGet(req, res) {
  const responses = await listResponses();
  responses.sort((a, b) => (a.submittedAt < b.submittedAt ? 1 : -1));
  res.status(200).json({ responses });
}

export default async function handler(req, res) {
  if (req.method === 'POST') {
    await handlePost(req, res);
    return;
  }
  if (req.method === 'GET') {
    await handleGet(req, res);
    return;
  }
  res.setHeader('Allow', 'GET, POST');
  res.status(405).json({ ok: false, error: 'method_not_allowed' });
}
