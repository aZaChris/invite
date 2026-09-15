import { Redis } from '@upstash/redis';

const redis = new Redis({
  url: process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL,
  token: process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN,
});

const RESPONSES_KEY = 'rsvp:responses';

export function getResponse(nameKey) {
  return redis.hget(RESPONSES_KEY, nameKey);
}

export function setResponse(nameKey, record) {
  return redis.hset(RESPONSES_KEY, { [nameKey]: record });
}

export async function listResponses() {
  const all = await redis.hgetall(RESPONSES_KEY);
  return Object.values(all || {});
}

export { redis };
