import { check } from './http';
export const randomSecret = () => Array.from(crypto.getRandomValues(new Uint8Array(32)), b => b.toString(16).padStart(2, '0')).join('');
export function readCookie(request: Request, name: string) {
  const raw = request.headers.get('Cookie')?.split(';').map(v => v.trim()).find(v => v.startsWith(name + '='))?.slice(name.length + 1);
  try { return raw ? decodeURIComponent(raw) : ''; } catch { return ''; }
}
export const temporaryCookie = (name: string, value: string, seconds = 300) => `${name}=${encodeURIComponent(value)}; Path=/; Max-Age=${seconds}; HttpOnly; Secure; SameSite=Lax`;
export async function budget(db: D1Database, key: string, maximum: number, milliseconds: number) {
  const now = Date.now();
  const count = await db.prepare(`INSERT INTO login_limits(key,count,expires_at) VALUES (?,1,?)
    ON CONFLICT(key) DO UPDATE SET count = CASE WHEN expires_at <= ? THEN 1 ELSE min(count+1,?) END,
    expires_at = CASE WHEN expires_at <= ? THEN excluded.expires_at ELSE expires_at END RETURNING count`)
    .bind(key, now + milliseconds, now, maximum + 1, now).first<number>('count');
  check(count !== null && count <= maximum, 'Too many attempts. Please wait before trying again.', 429);
}
