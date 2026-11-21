import { compareImport, parseMarkdown, questionKey } from '../lib/markdown';
import type { ImportCard } from '../lib/markdown';
import { check, HttpError, object, string } from './http';

export interface Deck {
  id: string; owner_id: string; source_key: string | null; title: string; description: string;
  visibility: 'PRIVATE' | 'SHARED'; revision: number;
}
export interface Card extends ImportCard {
  deck_id: string; position: number; status: 'LEARNED' | 'UNLEARNED';
  times_shown: number; times_failed: number; times_learned: number;
  last_shown_at: number | null; last_learned_at: number | null;
}

export async function getDeck(db: D1Database, user: string, id: string, write = false) {
  const deck = await db.prepare('SELECT * FROM decks WHERE id = ?').bind(id).first<Deck>();
  check(deck && (deck.owner_id === user || (!write && deck.visibility === 'SHARED')), 'Deck not available.', 404);
  return deck;
}

export async function listDecks(db: D1Database, user: string) {
  return (await db.prepare(`SELECT d.*, d.owner_id = ? AS owned, count(c.id) AS total,
    sum(CASE WHEN p.status = 'LEARNED' THEN 1 ELSE 0 END) AS learned,
    coalesce(sum(p.times_shown), 0) AS presentations, coalesce(sum(p.times_failed), 0) AS failures
    FROM decks d LEFT JOIN cards c ON c.deck_id = d.id
    LEFT JOIN card_progress p ON p.card_id = c.id AND p.user_id = ?
    WHERE d.owner_id = ? OR d.visibility = 'SHARED' GROUP BY d.id ORDER BY d.title, d.id`)
    .bind(user, user, user).all<Deck & { owned: number; total: number; learned: number; presentations: number; failures: number }>()).results;
}

export async function listCards(db: D1Database, user: string, deck: string) {
  return (await db.prepare(`SELECT c.*, coalesce(p.status, 'UNLEARNED') AS status,
    coalesce(p.times_shown, 0) AS times_shown, coalesce(p.times_failed, 0) AS times_failed,
    coalesce(p.times_learned, 0) AS times_learned, p.last_shown_at, p.last_learned_at
    FROM cards c JOIN decks d ON d.id = c.deck_id
    LEFT JOIN card_progress p ON p.card_id = c.id AND p.user_id = ?
    WHERE c.deck_id = ? AND (d.owner_id = ? OR d.visibility = 'SHARED') ORDER BY c.position, c.id`)
    .bind(user, deck, user).all<Card>()).results;
}

function visibility(value: unknown) {
  check(value === 'PRIVATE' || value === 'SHARED', 'Choose a visibility.');
  return value;
}

export async function saveDeck(db: D1Database, user: string, input: Record<string, unknown>) {
  const title = string(input.title, 'title', 160);
  const description = string(input.description ?? '', 'description', 2000, true);
  const scope = visibility(input.visibility);
  const now = Date.now();
  if (input.id) {
    const id = string(input.id, 'deck ID', 80);
    const result = await db.prepare(`UPDATE decks SET title = ?, description = ?, visibility = ?, updated_at = ?,
      revision = revision + 1 WHERE id = ? AND owner_id = ?`).bind(title, description, scope, now, id, user).run();
    check(result.meta.changes, 'Deck not available.', 404);
    return { id };
  }
  const id = crypto.randomUUID();
  await db.prepare(`INSERT INTO decks(id, owner_id, title, description, visibility, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, ?)`).bind(id, user, title, description, scope, now, now).run();
  return { id };
}

export async function changeCard(db: D1Database, user: string, deckId: string, input: Record<string, unknown>) {
  await getDeck(db, user, deckId, true);
  const now = Date.now();
  const id = input.id ? string(input.id, 'card ID', 80) : crypto.randomUUID();
  const method = input.method;
  let statement: D1PreparedStatement;
  if (method === 'delete') {
    statement = db.prepare('DELETE FROM cards WHERE id = ? AND deck_id = ?').bind(id, deckId);
  } else if (method === 'up' || method === 'down') {
    const cards = await listCards(db, user, deckId);
    const index = cards.findIndex(card => card.id === id);
    check(index >= 0, 'Card not available.', 404);
    const current = cards[index];
    const adjacent = cards[index + (method === 'up' ? -1 : 1)];
    if (!adjacent) return {};
    statement = db.prepare(`UPDATE cards SET position = CASE WHEN id = ? THEN ? ELSE ? END, updated_at = ?
      WHERE deck_id = ? AND id IN (?, ?)`).bind(id, adjacent.position, current.position, now, deckId, id, adjacent.id);
  } else {
    check(method === 'save', 'Invalid card operation.');
    const question = string(input.question, 'question', 2000);
    const answer = string(input.answer, 'answer', 20000);
    statement = input.id
      ? db.prepare('UPDATE cards SET question_key = ?, question = ?, answer = ?, updated_at = ? WHERE id = ? AND deck_id = ?')
        .bind(questionKey(question), question, answer, now, id, deckId)
      : db.prepare(`INSERT INTO cards SELECT ?, ?, ?, ?, ?, ?, coalesce(max(position), -1) + 1, ?, ?
        FROM cards WHERE deck_id = ?`).bind(id, deckId, id, questionKey(question), question, answer, now, now, deckId);
  }
  const [result] = await db.batch([statement, db.prepare('UPDATE decks SET revision = revision + 1, updated_at = ? WHERE id = ?').bind(now, deckId)]);
  check(result.meta.changes, 'Card not available.', 404);
  return {};
}

export async function inspectImport(db: D1Database, user: string, input: Record<string, unknown>) {
  const source = string(input.source, 'Markdown file', 500_000);
  let parsed: ReturnType<typeof parseMarkdown>;
  try { parsed = parseMarkdown(source); }
  catch { throw new HttpError(400, 'Invalid Markdown frontmatter.'); }
  check(parsed.cards.length > 0 && parsed.cards.length <= 1000, 'Include between 1 and 1000 Markdown questions.');
  const { metadata } = parsed;
  const key = metadata.deckId ? string(metadata.deckId, 'Markdown deckId', 160) : null;
  const deck = input.target === 'new' ? null : input.target
    ? await getDeck(db, user, string(input.target, 'target deck', 80), true)
    : key ? await db.prepare('SELECT * FROM decks WHERE owner_id = ? AND source_key = ?').bind(user, key).first<Deck>() : null;
  const existing = deck ? await listCards(db, user, deck.id) : [];
  const rows = compareImport(parsed.cards, existing);
  return { deck, key, metadata, rows, existing: existing.length };
}

export async function applyImport(db: D1Database, user: string, input: Record<string, unknown>) {
  const { deck, key, metadata, rows } = await inspectImport(db, user, input);
  check(input.previewId === (deck?.id ?? null) && input.revision === (deck?.revision ?? null), 'Deck changed. Preview the import again.', 409);
  const updates = object(input.choices ?? {});
  const scope = visibility(input.visibility);
  const title = string(metadata.title || input.filename, 'title', 160);
  const description = string(metadata.description ?? '', 'description', 2000, true);
  const values = new Map<string, { id: string; key: string; question: string; answer: string; position: number }>();
  for (const row of rows) {
    if (row.kind === 'conflict') check(['keep', 'update'].includes(String(updates[row.index])), 'Resolve every answer conflict.');
    if (row.kind !== 'new' && !(row.kind === 'conflict' && updates[row.index] === 'update')) continue;
    const prior = values.get(row.key);
    values.set(row.key, { id: prior?.id ?? crypto.randomUUID(), key: row.key, question: prior?.question ?? row.question, answer: row.answer, position: prior?.position ?? values.size });
  }
  check(deck || values.size, 'There are no valid cards to import.');
  const id = deck?.id ?? crypto.randomUUID();
  const mutation = crypto.randomUUID();
  const now = Date.now();
  const header = deck
    ? db.prepare(`UPDATE decks SET visibility = ?, revision = revision + 1, mutation = ?, updated_at = ?
      WHERE id = ? AND owner_id = ? AND revision = ?`).bind(scope, mutation, now, id, user, deck.revision)
    : db.prepare(`INSERT INTO decks(id, owner_id, source_key, title, description, visibility, mutation, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`).bind(id, user, key, title, description, scope, mutation, now, now);
  const [result] = await db.batch([header, db.prepare(`INSERT INTO cards
    SELECT value ->> 'id', ?, value ->> 'id', value ->> 'key', value ->> 'question', value ->> 'answer',
      (SELECT coalesce(max(position), -1) + 1 FROM cards WHERE deck_id = ?) + (value ->> 'position'), ?, ?
    FROM json_each(?) WHERE EXISTS(SELECT 1 FROM decks WHERE id = ? AND mutation = ?)
    ON CONFLICT(deck_id, question_key) DO UPDATE SET answer = excluded.answer, updated_at = excluded.updated_at`)
    .bind(id, id, now, now, JSON.stringify([...values.values()]), id, mutation)]);
  check(result.meta.changes, 'Deck changed. Preview the import again.', 409);
  return { id, imported: values.size };
}
