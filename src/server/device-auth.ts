import QRCode from 'qrcode';
import { authenticate, cookieHeader, digest, lifetime, token } from './auth';
import { budget, randomSecret, readCookie, temporaryCookie } from './auth-common';
import { check, json, string } from './http';
import type { AuthConfig } from './supabase-auth';
import { enabled } from './supabase-auth';
interface Device { id: string; state: string; label: string; phrase: string; expires_at: number; user_id: string | null }
export async function deviceAuth(db: D1Database, config: AuthConfig, request: Request, input: Record<string, unknown>, action: string) {
  check(enabled(config.AUTH_QR_ENABLED), 'QR sign-in is disabled.', 404);
  const now = Date.now(), ip = await digest(request.headers.get('CF-Connecting-IP') ?? 'local');
  if (action === 'start') {
    await budget(db, 'qr-start:' + ip, 5, 900_000);
    const poll = randomSecret(), approval = randomSecret(), id = crypto.randomUUID();
    const alphabet = '23456789ABCDEFGHJKLMNPQRSTUVWXYZ';
    // Rejection sampling avoids bias for a non-power-of-two alphabet.
    let manual = '';
    while (manual.length < 8) { const n = crypto.getRandomValues(new Uint8Array(1))[0]; if (n < Math.floor(256 / alphabet.length) * alphabet.length) manual += alphabet[n % alphabet.length]; }
    const phraseSecret = randomSecret().slice(0, 8).toUpperCase();
    const phrase = phraseSecret.slice(0, 4) + '-' + phraseSecret.slice(4);
    const label = string(input.label ?? 'Browser or TV', 'device name', 80);
    const old = readCookie(request, 'fc_device_poll');
    await db.batch([
      db.prepare("UPDATE auth_device_requests SET state='denied' WHERE poll_hash=? AND state IN ('pending','approved')").bind(await digest(old)),
      db.prepare(`INSERT INTO auth_device_requests(id,poll_hash,approval_hash,manual_hash,state,created_at,expires_at,label,phrase)
        VALUES (?,?,?,?,'pending',?,?,?,?)`).bind(id, await digest(poll), await digest(approval), await digest(manual), now, now + 300_000, label, phrase),
      db.prepare('DELETE FROM auth_device_requests WHERE id IN (SELECT id FROM auth_device_requests WHERE expires_at < ? LIMIT 50)').bind(now - 86400_000),
      db.prepare('DELETE FROM login_limits WHERE key IN (SELECT key FROM login_limits WHERE expires_at < ? LIMIT 50)').bind(now - 86400_000),
    ]);
    const url = new URL('/activate', request.url).href + '#' + approval;
    const svg = await QRCode.toString(url, { type: 'svg', margin: 4, errorCorrectionLevel: 'M', width: 280 });
    return json({ manualCode: manual.slice(0, 4) + '-' + manual.slice(4), phrase, expiresAt: now + 300_000, qrImage: 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg), activationUrl: new URL('/activate', request.url).href }, 201, { 'Set-Cookie': temporaryCookie('fc_device_poll', poll) });
  }
  if (action === 'poll') {
    const poll = readCookie(request, 'fc_device_poll');
    check(/^[a-f0-9]{64}$/.test(poll), 'Start a new QR request.', 410);
    const hash = await digest(poll);
    await budget(db, 'qr-poll:' + hash, 1, 4500);
    const row = await db.prepare('SELECT id,state,label,phrase,expires_at,user_id FROM auth_device_requests WHERE poll_hash=?').bind(hash).first<Device>();
    check(row && row.expires_at > now, 'QR request expired. Start again.', 410);
    if (row.state !== 'approved') return json({ status: row.state });
    return redeemDevice(db, row.id, hash, now, token(request) ? await digest(token(request)!) : '');
  }
  if (action === 'context') {
    await budget(db, 'qr-lookup:' + ip, 20, 900_000);
    const credential = string(input.credential, 'activation code', 100).replace(/-/g, '');
    const isSecret = /^[a-f0-9]{64}$/.test(credential);
    const normalized = isSecret ? credential : credential.toUpperCase();
    check(isSecret || /^[2-9A-HJ-NP-Z]{8}$/.test(normalized), 'Invalid or expired activation code.', 404);
    const hash = await digest(normalized);
    const row = await db.prepare(`SELECT id FROM auth_device_requests WHERE ${isSecret ? 'approval_hash' : 'manual_hash'}=? AND state='pending' AND expires_at>?`).bind(hash, now).first<{ id: string }>();
    check(row, 'Invalid or expired activation code.', 404);
    // Server cookie preserves context through phone login/OAuth. It is not approval.
    return json({ ready: true }, 200, { 'Set-Cookie': temporaryCookie('fc_device_approval', (isSecret ? 's:' : 'm:') + normalized) });
  }
  const user = await authenticate(db, request);
  check(user, 'Sign in on this device to approve.', 401);
  const context = readCookie(request, 'fc_device_approval');
  check(/^(s:[a-f0-9]{64}|m:[2-9A-HJ-NP-Z]{8})$/.test(context), 'Enter or scan an activation code.', 404);
  await budget(db, 'qr-decision:' + user.id, 30, 900_000);
  const column = context.startsWith('s:') ? 'approval_hash' : 'manual_hash';
  const hash = await digest(context.slice(2));
  const row = await db.prepare(`SELECT id,state,label,phrase,expires_at,user_id FROM auth_device_requests WHERE ${column}=? AND state='pending' AND expires_at>?`).bind(hash, now).first<Device>();
  check(row, 'Invalid or expired activation request.', 410);
  if (action === 'preview') return json({ account: user.username, device: row.label, phrase: row.phrase, expiresAt: row.expires_at });
  check(action === 'approve' || action === 'deny', 'Unknown device action.', 404);
  const approver = await digest(token(request) ?? '');
  const result = await db.prepare(`UPDATE auth_device_requests SET state=?,user_id=?,approver_hash=? WHERE id=? AND state='pending' AND expires_at>?
    AND EXISTS(SELECT 1 FROM auth_sessions WHERE token_hash=? AND user_id=? AND expires_at>?)`)
    .bind(action === 'approve' ? 'approved' : 'denied', user.id, approver, row.id, now, approver, user.id, now).run();
  check(result.meta.changes === 1, 'Request or session changed. Start again.', 409);
  return json({ status: action === 'approve' ? 'approved' : 'denied' }, 200, { 'Set-Cookie': temporaryCookie('fc_device_approval', '', 0) });
}

// Separate from polling admission so transactional races can be tested directly.
export async function redeemDevice(db: D1Database, id: string, hash: string, now = Date.now(), oldHash = '') {
    const value = crypto.randomUUID() + crypto.randomUUID(), marker = randomSecret();
    const [result] = await db.batch([
      db.prepare(`UPDATE auth_device_requests SET state='consumed',redemption_marker=? WHERE id=? AND poll_hash=? AND state='approved' AND expires_at>?
        AND EXISTS(SELECT 1 FROM auth_sessions s WHERE s.token_hash=approver_hash AND s.user_id=auth_device_requests.user_id AND s.expires_at>?)`)
        .bind(marker, id, hash, now, now),
      db.prepare(`INSERT INTO auth_sessions(token_hash,user_id,expires_at)
        SELECT ?,user_id,? FROM auth_device_requests WHERE id=? AND redemption_marker=? AND state='consumed'`)
        .bind(await digest(value), now + lifetime * 1000, id, marker),
      db.prepare('DELETE FROM auth_sessions WHERE token_hash=? AND EXISTS(SELECT 1 FROM auth_device_requests WHERE id=? AND redemption_marker=?)').bind(oldHash, id, marker),
    ]);
    check(result.meta.changes === 1, 'QR request is no longer available. Start again.', 410);
    return json({ status: 'complete' }, 200, { 'Set-Cookie': cookieHeader(value, lifetime) });
}
