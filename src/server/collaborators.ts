import { getDeck } from './decks';
import { check, string } from './http';
import { questionKey } from '../lib/markdown';

export async function collaborators(db: D1Database, user: string, deck: string, input?: Record<string, unknown>) {
  const parent = await getDeck(db, user, deck);
  check(parent.owner_id === user, 'Only the owner may manage collaborators.', 403);
  if (input) {
    if (input.method === 'remove') {
      await db.prepare(`DELETE FROM deck_collaborators WHERE deck_id = ? AND user_id = ?
        AND EXISTS(SELECT 1 FROM decks WHERE id = ? AND owner_id = ?)`)
        .bind(deck, string(input.userId, 'user ID', 80), deck, user).run();
    } else {
      check(input.method === 'add', 'Invalid collaborator operation.');
      const username = string(input.username, 'username', 64);
      const target = await db.prepare('SELECT id FROM users WHERE username_key = ?').bind(questionKey(username)).first<{ id: string }>();
      check(target, 'User not found.', 404);
      check(target.id !== user, 'The owner cannot be a collaborator.');
      await db.prepare(`INSERT INTO deck_collaborators(deck_id, user_id, added_at, added_by)
        SELECT id, ?, ?, ? FROM decks WHERE id = ? AND owner_id = ?`)
        .bind(target.id, Date.now(), user, deck, user).run();
    }
  }
  return (await db.prepare(`SELECT u.id, u.username FROM deck_collaborators dc JOIN users u ON u.id = dc.user_id
    WHERE dc.deck_id = ? ORDER BY u.username_key`).bind(deck).all<{ id: string; username: string }>()).results;
}
