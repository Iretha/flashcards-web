import { digest } from './auth';
import { check, json, string } from './http';

export async function tokens(db: D1Database, user: string, input?: Record<string, unknown>) {
  const now = Date.now();
  if (!input) return json((await db.prepare(`SELECT coalesce(id, 'legacy:' || rowid) AS id, name, coalesce(description, CASE WHEN id IS NULL THEN 'Used for curl requests and other testing purposes.' ELSE '' END) AS description, created_at, expires_at, can_write, revoked_at,
    CASE WHEN revoked_at IS NOT NULL THEN 'Revoked' WHEN expires_at <= ? THEN 'Expired' ELSE 'Active' END AS status
    FROM api_tokens WHERE user_id = ? ORDER BY created_at DESC`).bind(now, user).all()).results);
  const count = await db.prepare(`INSERT INTO login_limits(key, count, expires_at) VALUES (?, 1, ?)
    ON CONFLICT(key) DO UPDATE SET count = CASE WHEN expires_at <= ? THEN 1 ELSE min(count + 1, 61) END,
    expires_at = CASE WHEN expires_at <= ? THEN excluded.expires_at ELSE expires_at END RETURNING count`)
    .bind('tokens:' + user, now + 3600000, now, now).first<number>('count');
  check(count !== null && count <= 60, 'Too many token operations. Try again in one hour.', 429);
  if (input.action === 'describe') {
    check(Object.keys(input).every(key => ['action', 'id', 'description'].includes(key)), 'Unsupported field.');
    const id = string(input.id, 'token ID', 80);
    const description = string(input.description, 'token description', 500, true);
    const result = await db.prepare(`UPDATE api_tokens SET description = ?3 WHERE (id = ?1 OR (id IS NULL AND 'legacy:' || rowid = ?1)) AND user_id = ?2`).bind(id, user, description).run();
    check(result.meta.changes, 'Token unavailable.', 404);
    return json({});
  }
  if (input.action === 'revoke') {
    check(Object.keys(input).every(key => ['action', 'id'].includes(key)), 'Unsupported field.');
    const id = string(input.id, 'token ID', 80);
    const result = await db.prepare(`UPDATE api_tokens SET revoked_at = coalesce(revoked_at, ?3) WHERE (id = ?1 OR (id IS NULL AND 'legacy:' || rowid = ?1)) AND user_id = ?2`).bind(id, user, now).run();
    check(result.meta.changes, 'Token unavailable.', 404);
    return json({});
  }
  check(Object.keys(input).every(key => ['name', 'description', 'can_write', 'days'].includes(key)), 'Unsupported field.');
  const name = string(input.name, 'token name', 80);
  const description = string(input.description ?? '', 'token description', 500, true);
  const days = input.days ?? 90;
  check([30, 90, 180, 365].includes(days as number), 'Invalid expiration.');
  const write = input.can_write ?? false;
  check(typeof write === 'boolean', 'Invalid permission.');
  const token = 'fc_' + Array.from(crypto.getRandomValues(new Uint8Array(32)), b => b.toString(16).padStart(2, '0')).join('');
  const id = crypto.randomUUID();
  // SQLite serializes this single conditional INSERT, including the limit check.
  const result = await db.prepare(`INSERT INTO api_tokens(token_hash, user_id, can_write, expires_at, id, name, created_at, description)
    SELECT ?, ?, ?, ?, ?, ?, ?, ? WHERE (SELECT count(*) FROM api_tokens WHERE user_id = ? AND revoked_at IS NULL AND expires_at > ?) < 10`)
    .bind(await digest(token), user, Number(write), now + Number(days) * 86400000, id, name, now, description, user, now).run();
  check(result.meta.changes, 'Maximum of 10 active tokens reached.', 409);
  return json({ id, token }, 201);
}
