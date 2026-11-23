import { check, string } from './http';
import { editAccess } from './permissions';

export type ThirdPartyAccess = 'NONE' | 'READ' | 'READ_WRITE';
export function thirdPartyPermissions(membership: 'owner' | 'collaborator' | null, access: ThirdPartyAccess, credential: { read: boolean; write: boolean }) {
  const read = (membership === 'owner' || membership === 'collaborator') && credential.read && (access === 'READ' || access === 'READ_WRITE');
  return { membership, read, write: read && credential.write && access === 'READ_WRITE' };
}

// For future mutations, embed this predicate in the atomic mutation SQL, using
// freshly verified identity/credential permissions; never rely on a prior read.
export function thirdPartyAccessSql(userParameter: number, operation: 'read' | 'write', alias = 'decks') {
  return `${editAccess(userParameter, alias)} AND ${alias}.third_party_access ${operation === 'write' ? "= 'READ_WRITE'" : "IN ('READ', 'READ_WRITE')"}`;
}
export async function resolveThirdPartyPermissions(db: D1Database, user: string, id: string, credential: { read: boolean; write: boolean }) {
  const row = await db.prepare(`SELECT owner_id, third_party_access,
    EXISTS (SELECT 1 FROM deck_collaborators WHERE deck_id = decks.id AND user_id = ?2) AS collaborator
    FROM decks WHERE id = ?1`).bind(id, user).first<{ owner_id: string; third_party_access: ThirdPartyAccess; collaborator: number }>();
  return thirdPartyPermissions(row?.owner_id === user ? 'owner' : row?.collaborator ? 'collaborator' : null, row?.third_party_access ?? 'NONE', credential);
}

// Called only after browser session authentication and origin/JSON checks.
export async function setThirdPartyAccess(db: D1Database, user: string, input: Record<string, unknown>) {
  check(Object.keys(input).every(key => ['id', 'revision', 'third_party_access'].includes(key)), 'Unsupported field.');
  const id = string(input.id, 'deck ID', 80);
  const value = input.third_party_access;
  check(value === 'NONE' || value === 'READ' || value === 'READ_WRITE', 'Invalid third-party access.');
  check(Number.isSafeInteger(input.revision) && Number(input.revision) >= 0, 'Invalid revision.');
  const deck = await db.prepare('SELECT owner_id FROM decks WHERE id = ?').bind(id).first<{ owner_id: string }>();
  check(deck?.owner_id === user, 'Only the owner may change third-party access.', 403);
  const result = await db.prepare(`UPDATE decks SET third_party_access = ?, revision = revision + 1, updated_at = ?
    WHERE id = ? AND owner_id = ? AND revision = ? RETURNING revision, third_party_access`)
    .bind(value, Date.now(), id, user, input.revision).first();
  check(result, 'Deck changed. Reload before saving.', 409);
  return result;
}
