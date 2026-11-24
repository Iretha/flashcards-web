import { z } from 'zod';
import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { changeCard } from './decks';
import { toolResult } from './mcp-reads';
import { thirdPartyAccessSql } from './third-party-access';
import { HttpError } from './http';

export const createCardSchema = z.object({
  deck_id: z.string().min(1).max(80),
  question: z.string().trim().min(1).max(2000),
  answer: z.string().max(20000).optional(),
  idempotency_key: z.string().min(1).max(200).optional(),
  language: z.string().min(1).max(64).optional(),
}).strict();
export async function createMcpCard(db: D1Database, user: string, raw: unknown) {
  const parsed = createCardSchema.safeParse(raw);
  if (!parsed.success) throw new Error('INVALID_ARGUMENTS');
  const { deck_id, question, answer, language, idempotency_key } = parsed.data;
  // Canonical validated request: omitted language remains distinct from an explicit language.
  const payload = JSON.stringify([deck_id, question, answer ?? '', language ?? null]);
  async function replay() {
    if (!idempotency_key) return null;
    const allowed = await db.prepare(`SELECT id FROM decks WHERE id = ?1 AND ${thirdPartyAccessSql(2, 'write')}`).bind(deck_id, user).first();
    if (!allowed) throw new Error('UNAVAILABLE');
    const row = await db.prepare("SELECT payload, card_id FROM mcp_card_idempotency WHERE principal=? AND operation='create_card' AND key=?")
      .bind(user, idempotency_key).first<{ payload: string; card_id: string }>();
    if (!row) return null;
    if (row.payload !== payload) throw new Error('CONFLICT');
    return { card_id: row.card_id, status: 'created' };
  }
  const previous = await replay();
  if (previous) return previous;
  try {
    const result = await changeCard(db, user, deck_id, { method: 'save', question, answer,
      ...(language ? { translations: { [language]: { question, answer: answer ?? '' } } } : {}) }, true, idempotency_key ? { key: idempotency_key, payload } : undefined);
    return { card_id: result.id!, status: 'created' };
  } catch (error) {
    const committed = await replay();
    if (committed) return committed;
    throw new Error(error instanceof HttpError && error.status === 400 ? 'INVALID_ARGUMENTS' : 'UNAVAILABLE');
  }
}
export const updateCardSchema = z.object({
  card_id: z.string().min(1).max(80),
  answer: z.string().max(20000).optional(),
  language: z.string().min(1).max(64).optional(),
}).strict();

export async function updateMcpCard(db: D1Database, user: string, raw: unknown) {
  const parsed = updateCardSchema.safeParse(raw);
  if (!parsed.success) throw new Error('INVALID_ARGUMENTS');
  const { card_id, answer, language } = parsed.data;
  try {
    const card = await db.prepare(`SELECT c.deck_id, c.primary_language FROM cards c JOIN decks ON decks.id = c.deck_id
      WHERE c.id = ?1 AND ${thirdPartyAccessSql(2, 'write')}`).bind(card_id, user)
      .first<{ deck_id: string; primary_language: string }>();
    if (!card) throw new Error('UNAVAILABLE');
    const selected = language ?? card.primary_language;
    const result = await changeCard(db, user, card.deck_id, { method: 'answer', id: card_id, answer, language: selected }, true);
    return { card_id, language: selected, answer: result.answer, status: 'updated' };
  } catch (error) {
    throw new Error(error instanceof HttpError && error.status === 400 ? 'INVALID_ARGUMENTS'
      : error instanceof HttpError && error.status === 409 ? 'CONFLICT' : 'UNAVAILABLE');
  }
}
export function registerMcpWrites(server: McpServer, db: D1Database, user: string) {
  server.registerTool('update_card', { description: 'Update the canonical answer. Omission preserves the answer; empty clears it.',
    inputSchema: updateCardSchema, annotations: { readOnlyHint: false, destructiveHint: false, idempotentHint: true } }, async args => {
    try { return toolResult(await updateMcpCard(db, user, args)); }
    catch (error) { return { isError: true, content: [{ type: 'text' as const, text: error instanceof Error && ['INVALID_ARGUMENTS', 'CONFLICT'].includes(error.message) ? error.message : 'UNAVAILABLE' }] }; }
  });
  server.registerTool('create_card', { description: 'Create a card in an authorized deck. Primary language question is required; missing/empty answer is accepted.',
    inputSchema: createCardSchema, annotations: { readOnlyHint: false, destructiveHint: false, idempotentHint: false } }, async args => {
    try { return toolResult(await createMcpCard(db, user, args)); }
    catch (error) { return { isError: true, content: [{ type: 'text' as const, text: error instanceof Error && ['INVALID_ARGUMENTS', 'CONFLICT'].includes(error.message) ? error.message : 'UNAVAILABLE' }] }; }
  });
}
