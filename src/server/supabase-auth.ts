import { createClient } from '@supabase/supabase-js';
import { createRemoteJWKSet, jwtVerify } from 'jose';
import { digest, issueSession } from './auth';
import type { User } from './auth';
import { budget, randomSecret, readCookie, temporaryCookie } from './auth-common';
import { check, HttpError, json, string } from './http';
import { questionKey } from '../lib/markdown';

// Server-only: callers must first validate JWT claims AND provider getUser.
export async function findOrCreateUserByVerifiedSubject(db: D1Database, sub: string): Promise<User> {
  check(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(sub), 'Unable to sign in.', 401);
  const lookup = () => db.prepare('SELECT id,username,settings FROM users WHERE supabase_sub = ?').bind(sub).first<User>();
  const existing = await lookup();
  if (existing) return existing;
  // Profile attributes are deliberately unused, including for cosmetic names.
  // Target only expected unique conflicts; other database failures propagate.
  for (let attempt = 0; attempt < 5; attempt++) {
    const now = Date.now(), id = crypto.randomUUID();
    const username = 'Learner-' + crypto.randomUUID();
    const created = await db.prepare(`INSERT INTO users(id,username,username_key,created_at,last_login_at,supabase_sub)
      VALUES (?,?,?,?,?,?) ON CONFLICT(supabase_sub) WHERE supabase_sub IS NOT NULL DO NOTHING
      ON CONFLICT(username_key) DO NOTHING RETURNING id,username,settings`)
      .bind(id, username, questionKey(username), now, now, sub).first<User>();
    if (created) return created;
    const winner = await lookup();
    if (winner) return winner;
  }
  throw new HttpError(503, 'Unable to create account. Please try again.');
}

export interface AuthConfig {
  PERSONAL_MCP_URLS_ENABLED?: string;
  AUTH_GOOGLE_ENABLED?: string; AUTH_EMAIL_ENABLED?: string; AUTH_QR_ENABLED?: string;
  SUPABASE_URL?: string; SUPABASE_PUBLISHABLE_KEY?: string; AUTH_SITE_ORIGIN?: string; AUTH_RATE_LIMIT_SECRET?: string;
}
export const enabled = (value?: string) => value === 'true';
export function methods(config: AuthConfig) {
  return { google: enabled(config.AUTH_GOOGLE_ENABLED), email: enabled(config.AUTH_EMAIL_ENABLED), qr: enabled(config.AUTH_QR_ENABLED) };
}
function settings(config: AuthConfig, request: Request) {
  check(config.SUPABASE_URL && config.SUPABASE_PUBLISHABLE_KEY && config.AUTH_SITE_ORIGIN, 'Sign-in is not configured.', 503);
  const url = new URL(config.SUPABASE_URL);
  check(url.protocol === 'https:' && !url.username && !url.password && url.pathname === '/', 'Sign-in is not configured.', 503);
  check(new URL(request.url).origin === config.AUTH_SITE_ORIGIN, 'Unexpected application origin.', 403);
  return { url: url.origin, key: config.SUPABASE_PUBLISHABLE_KEY, origin: config.AUTH_SITE_ORIGIN };
}
// Public keys only; fixed configured issuer. No JWT-supplied URL is used.
const keysets = new Map<string, ReturnType<typeof createRemoteJWKSet>>();
export async function validateClaims(accessToken: string, base: string) {
  let keys = keysets.get(base);
  if (!keys) {
    keys = createRemoteJWKSet(new URL(base + '/auth/v1/.well-known/jwks.json'), { cacheMaxAge: 600_000, cooldownDuration: 30_000, timeoutDuration: 5000 });
    if (keysets.size >= 4) keysets.clear();
    keysets.set(base, keys);
  }
  const { payload } = await jwtVerify(accessToken, keys, { issuer: base + '/auth/v1', audience: 'authenticated', algorithms: ['ES256', 'RS256'], clockTolerance: 5, requiredClaims: ['sub', 'exp', 'iat', 'session_id', 'role'] });
  const uuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  check(typeof payload.sub === 'string' && uuid.test(payload.sub) && typeof payload.session_id === 'string' && uuid.test(payload.session_id) && payload.role === 'authenticated' && payload.is_anonymous !== true && typeof payload.iat === 'number' && payload.iat <= Date.now() / 1000 + 5, 'Unable to sign in.', 401);
  return payload.sub;
}
function provider(config: AuthConfig, request: Request, verifier = '') {
  const setup = settings(config, request);
  // Ephemeral per-request storage: persistSession enables the SDK PKCE adapter,
  // but nothing is persisted beyond this request except the verifier cookie.
  const memory = new Map<string, string>();
  if (verifier) memory.set('flashcards-code-verifier', verifier);
  const client = createClient(setup.url, setup.key, { auth: {
    flowType: 'pkce', autoRefreshToken: false, detectSessionInUrl: false, persistSession: true, storageKey: 'flashcards',
    storage: { getItem: key => memory.get(key) ?? null, setItem: (key, value) => { memory.set(key, value); }, removeItem: key => { memory.delete(key); } },
  }, global: { fetch: (url, init) => fetch(url, { ...init, signal: AbortSignal.timeout(10_000) }) } });
  return { client, setup, memory };
}
async function complete(db: D1Database, request: Request, access: string, client: ReturnType<typeof provider>['client'], base: string) {
  const sub = await validateClaims(access, base);
  const { data, error } = await client.auth.getUser(access);
  check(!error && data.user?.id === sub && !data.user.is_anonymous, 'Unable to sign in.', 401);
  const user = await findOrCreateUserByVerifiedSubject(db, sub);
  return issueSession(db, request, user);
}
export async function googleStart(db: D1Database, config: AuthConfig, request: Request) {
  check(enabled(config.AUTH_GOOGLE_ENABLED), 'This sign-in method is disabled.', 404);
  const { client, setup, memory } = provider(config, request);
  await budget(db, 'google:' + await digest(request.headers.get('CF-Connecting-IP') ?? 'local'), 20, 900_000);
  const state = randomSecret();
  const { data, error } = await client.auth.signInWithOAuth({ provider: 'google', options: { redirectTo: setup.origin + '/api/auth/callback', skipBrowserRedirect: true } });
  check(!error && data.url, 'Unable to start Google sign-in. Try again later.', 503);
  const verifier = memory.get('flashcards-code-verifier');
  check(verifier, 'Unable to start Google sign-in.', 503);
  await db.prepare('INSERT INTO login_limits(key,count,expires_at) VALUES (?,0,?)').bind('oauth:' + await digest(state), Date.now() + 300_000).run();
  const response = json({ url: data.url });
  response.headers.append('Set-Cookie', temporaryCookie('fc_oauth_state', state));
  response.headers.append('Set-Cookie', temporaryCookie('fc_oauth_verifier', verifier));
  return response;
}
export async function googleCallback(db: D1Database, config: AuthConfig, request: Request) {
  const clear = (response: Response) => {
    response.headers.append('Set-Cookie', temporaryCookie('fc_oauth_state', '', 0));
    response.headers.append('Set-Cookie', temporaryCookie('fc_oauth_verifier', '', 0));
    response.headers.set('Referrer-Policy', 'no-referrer');
    return response;
  };
  try {
    check(request.method === 'GET' && enabled(config.AUTH_GOOGLE_ENABLED), 'Disabled.', 404);
    const url = new URL(request.url), state = readCookie(request, 'fc_oauth_state');
    check(/^[a-f0-9]{64}$/.test(state) && !url.searchParams.has('error'), 'Invalid callback.', 401);
    const result = await db.prepare('DELETE FROM login_limits WHERE key = ? AND expires_at > ? RETURNING key').bind('oauth:' + await digest(state), Date.now()).first();
    check(result, 'Expired callback.', 401);
    const verifier = readCookie(request, 'fc_oauth_verifier');
    check(verifier.length > 20 && verifier.length < 256, 'Invalid callback.', 401);
    const { client, setup } = provider(config, request, verifier);
    const code = string(url.searchParams.get('code'), 'code', 2048);
    const { data, error } = await client.auth.exchangeCodeForSession(code);
    check(!error && data.session, 'Unable to sign in.', 401);
    const response = await complete(db, request, data.session.access_token, client, setup.url);
    response.headers.set('Location', '/');
    return clear(new Response(null, { status: 303, headers: response.headers }));
  } catch {
    // Never log provider errors or callback URLs/codes.
    return clear(new Response(null, { status: 303, headers: { Location: '/?auth_error=1', 'Cache-Control': 'no-store' } }));
  }
}
export async function emailAuth(db: D1Database, config: AuthConfig, request: Request, input: Record<string, unknown>, verify: boolean) {
  check(enabled(config.AUTH_EMAIL_ENABLED), 'This sign-in method is disabled.', 404);
  const { client, setup } = provider(config, request);
  const email = string(input.email, 'email', 254).toLowerCase();
  check(/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email), 'Enter a valid email address.');
  check(config.AUTH_RATE_LIMIT_SECRET && config.AUTH_RATE_LIMIT_SECRET.length >= 32, 'Email sign-in is not configured.', 503);
  const privacyKey = await crypto.subtle.importKey('raw', new TextEncoder().encode(config.AUTH_RATE_LIMIT_SECRET), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']);
  const keyed = async (value: string) => Array.from(new Uint8Array(await crypto.subtle.sign('HMAC', privacyKey, new TextEncoder().encode(value))), b => b.toString(16).padStart(2, '0')).join('');
  const key = await keyed('email:' + email), ip = await keyed('ip:' + (request.headers.get('CF-Connecting-IP') ?? 'local'));
  if (!verify) {
    await budget(db, 'email-cooldown:' + key, 1, 60_000);
    await budget(db, 'email-send:' + key, 3, 900_000);
    await budget(db, 'email-day:' + key, 10, 86400_000);
    await budget(db, 'email-ip:' + ip, 20, 3600_000);
    await client.auth.signInWithOtp({ email, options: { shouldCreateUser: true } });
    // Identical response for provider rejection, delivery failure and accepted send.
    return json({ message: 'If delivery is available, a code will arrive shortly. Wait 60 seconds before retrying.', retryAfter: 60 });
  }
  await budget(db, 'email-verify:' + key, 5, 300_000);
  await budget(db, 'email-verify-ip:' + ip, 30, 900_000);
  const code = string(input.code, 'code', 10);
  check(/^[0-9]{6,10}$/.test(code), 'Invalid or expired code.', 401);
  try {
    const { data, error } = await client.auth.verifyOtp({ email, token: code, type: 'email' });
    check(!error && data.session, 'Invalid or expired code.', 401);
    return await complete(db, request, data.session.access_token, client, setup.url);
  } catch (error) {
    if (error instanceof HttpError && error.status === 403) throw error;
    throw new HttpError(401, 'Unable to verify this code. It may be invalid, expired or temporarily unavailable.');
  }
}
