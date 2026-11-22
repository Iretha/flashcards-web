import { check, json, string } from './http';
import { questionKey } from '../lib/markdown';

export interface User { id: string; username: string; settings: string }
const cookie = 'flashcards_session';
const lifetime = 30 * 24 * 60 * 60;
const token = (request: Request) => request.headers.get('Cookie')?.match(/(?:^|;\s*)flashcards_session=([0-9a-f-]{72})(?:;|$)/)?.[1];
const cookieHeader = (value: string, age: number) =>
  cookie + '=' + value + '; Path=/; Max-Age=' + age + '; HttpOnly; Secure; SameSite=Lax';

export interface SessionDiagnostics {
  sessionFound: boolean | null;
  sessionExpired: boolean | null;
}

export function hasSessionCookie(request: Request) {
  return /(?:^|;\s*)flashcards_session=/.test(request.headers.get('Cookie') ?? '');
}

export async function digest(value: string) {
  const bytes = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(value));
  return Array.from(new Uint8Array(bytes), byte => byte.toString(16).padStart(2, '0')).join('');
}

export async function authenticateClient(db: D1Database, request: Request) {
  const match = /^Bearer (fc_[a-f0-9]{64})$/i.exec(request.headers.get('Authorization') ?? '');
  if (!match) return null;
  return db.prepare('SELECT user_id, can_write FROM api_tokens WHERE token_hash = ? AND expires_at > ?')
    .bind(await digest(match[1]), Date.now()).first<{ user_id: string; can_write: number }>();
}

async function equalCode(a: string, b: string) {
  const [left, right] = await Promise.all([digest(a), digest(b)]);
  let difference = 0;
  for (let i = 0; i < left.length; i++) difference |= left.charCodeAt(i) ^ right.charCodeAt(i);
  return difference === 0;
}

export async function authenticate(db: D1Database, request: Request, diagnostics?: SessionDiagnostics) {
  const value = token(request);
  if (!value) {
    if (diagnostics) diagnostics.sessionFound = false;
    return null;
  }
  const hash = await digest(value);
  const now = Date.now();
  const user = await db.prepare(`SELECT users.id, username, settings FROM auth_sessions
    JOIN users ON users.id = user_id WHERE token_hash = ? AND expires_at > ?`)
    .bind(hash, now).first<User>();
  if (diagnostics) {
    diagnostics.sessionFound = user !== null;
    if (user) {
      diagnostics.sessionExpired = false;
    } else {
      // This lookup is diagnostic only. Its failure must preserve the original 401.
      try {
        const expiresAt = await db.prepare('SELECT expires_at FROM auth_sessions WHERE token_hash = ?')
          .bind(hash).first<number>('expires_at');
        if (expiresAt !== null) diagnostics.sessionExpired = expiresAt <= now;
      } catch {
        // Leave expiration unknown.
      }
    }
  }
  return user;
}

export async function login(db: D1Database, secret: string | undefined, request: Request, input: Record<string, unknown>) {
  check(secret, 'The server access code is not configured.', 503);
  const username = string(input.username, 'username', 64);
  const code = input.code;
  check(typeof code === 'string' && code.length > 0 && code.length <= 256, 'Invalid access code.');
  const now = Date.now();
  const client = await digest(request.headers.get('CF-Connecting-IP') ?? 'local');
  const limit = await db.prepare(`INSERT INTO login_limits(key, count, expires_at) VALUES (?, 1, ?)
    ON CONFLICT(key) DO UPDATE SET count = CASE WHEN expires_at <= ? THEN 1 ELSE min(count + 1, 9) END,
    expires_at = CASE WHEN expires_at <= ? THEN excluded.expires_at ELSE expires_at END RETURNING count`)
    .bind(client, now + 15 * 60_000, now, now).first<number>('count');
  check(limit !== null && limit <= 8, 'Too many attempts. Try again in 15 minutes.', 429);
  check(await equalCode(secret, code), 'Incorrect access code.', 401);
  const user = await db.prepare(`INSERT INTO users(id, username, username_key, created_at, last_login_at)
    VALUES (?, ?, ?, ?, ?) ON CONFLICT(username_key) DO UPDATE SET last_login_at = excluded.last_login_at
    RETURNING id, username, settings`)
    .bind(crypto.randomUUID(), username, questionKey(username), now, now).first<User>();
  check(user, 'Could not create the user.', 500);
  const session = crypto.randomUUID() + crypto.randomUUID();
  const old = token(request);
  await db.batch([
    db.prepare('DELETE FROM login_limits WHERE key = ? OR expires_at <= ?').bind(client, now),
    db.prepare('DELETE FROM auth_sessions WHERE token_hash = ? OR expires_at <= ?').bind(old ? await digest(old) : '', now),
    db.prepare('INSERT INTO auth_sessions VALUES (?, ?, ?)').bind(await digest(session), user.id, now + lifetime * 1000),
  ]);
  return json({ username: user.username }, 200, { 'Set-Cookie': cookieHeader(session, lifetime) });
}

export async function logout(db: D1Database, request: Request) {
  const value = token(request);
  if (value) await db.prepare('DELETE FROM auth_sessions WHERE token_hash = ?').bind(await digest(value)).run();
  return json({}, 200, { 'Set-Cookie': cookieHeader('', 0) });
}
