// Smoke check for /api/rsvp — run against `vercel dev` (see quickstart.md).
// Usage: BASE_URL=http://localhost:3000 node scripts/smoke-rsvp.mjs

const base = process.env.BASE_URL || 'http://localhost:3000';

async function post(body) {
  const res = await fetch(`${base}/api/rsvp`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  return { status: res.status, body: await res.json() };
}

function assert(condition, message) {
  if (!condition) throw new Error(`FAIL: ${message}`);
  console.log(`ok: ${message}`);
}

async function main() {
  const name = `smoke-test-${Date.now()}`;

  const created = await post({ name, attending: true, message: 'primo test' });
  assert(created.status === 201, 'valid submit returns 201');
  assert(created.body.ok === true, 'valid submit body.ok is true');

  const updated = await post({ name, attending: false, message: 'ripensamento' });
  assert(updated.status === 201, 'update-by-name returns 201');

  const listRes = await fetch(`${base}/api/rsvp`);
  const list = await listRes.json();
  const entry = list.responses.find((r) => r.name === name);
  assert(!!entry, 'submitted name appears in GET /api/rsvp');
  assert(entry.attending === false, 'update replaced the previous response, not duplicated it');

  const invalid = await post({ name: '   ', attending: true });
  assert(invalid.status === 400, 'empty name is rejected with 400');
  assert(invalid.body.error === 'invalid_name', 'rejection reports invalid_name');

  console.log('\nAll smoke checks passed.');
}

main().catch((err) => {
  console.error(err.message);
  process.exit(1);
});
