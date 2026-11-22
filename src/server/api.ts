import { tokens } from './tokens';
import { collaborators } from './collaborators';
import { authenticate, hasSessionCookie, login, logout } from './auth';
import type { SessionDiagnostics } from './auth';
import { applyImport, changeCard, getDeck, inspectImport, listCards, listDecks, replacementImpact, saveDeck } from './decks';
import { check, HttpError, json, object, string } from './http';
import { act, reset, startSession, studyView } from './sessions';
import { defaults } from '../lib/study';
import type { Translations } from '../lib/translations';
import { manage } from './management';

export async function handle(request: Request, db: D1Database, secret?: string) {
  const url = new URL(request.url);
  const route = url.pathname.replace(/^\/api\//, '');
  if (route === 'decks' || route.startsWith('decks/')) return manage(request, db, url, route);
  const endpoint = url.pathname;
  if (endpoint !== '/api/login' && endpoint !== '/api/home') return dispatch(request, db, secret, url, route);

  // Temporary diagnostics for the LG webOS session issue.
  const diagnostics: SessionDiagnostics = { sessionFound: null, sessionExpired: null };
  const response = await dispatch(request, db, secret, url, route, diagnostics);
  console.info({
    event: 'flashcards.auth',
    method: request.method,
    endpoint,
    status: response.status,
    cookieIssued: endpoint === '/api/login' && response.headers.has('Set-Cookie'),
    cookieReceived: hasSessionCookie(request),
    ...diagnostics,
  });
  return response;
}

async function dispatch(
  request: Request, db: D1Database, secret: string | undefined, url: URL, route: string,
  diagnostics?: SessionDiagnostics,
) {
  try {
    if (request.method === 'GET') {
      const user = await authenticate(db, request, diagnostics);
      check(user, 'Sign in to continue.', 401);
      if (route === 'tokens') return await tokens(db, user.id);
      if (route === 'home') return json({
        username: user.username, settings: { ...defaults, ...JSON.parse(user.settings) },
        decks: await listDecks(db, user.id), session: await studyView(db, user.id),
      });
      if (route === 'collaborators') return json(await collaborators(db, user.id, string(url.searchParams.get('deck'), 'deck ID', 80)));
      if (route === 'cards') {
        const id = string(url.searchParams.get('deck'), 'deck ID', 80);
        await getDeck(db, user.id, id);
        return json(await listCards(db, user.id, id));
      }
      if (route === 'replacement-report') {
        const owned = (await listDecks(db, user.id)).filter(deck => deck.owned);
        const decks = await Promise.all(owned.map(async deck => ({ id: deck.id, title: deck.title, revision: deck.revision, ...await replacementImpact(db, deck.id) })));
        return json({ generatedAt: new Date().toISOString(), destructive: false, decks }, 200,
          { 'Content-Disposition': 'attachment; filename="flashcards-replacement-report.json"' });
      }
      if (route === 'study') return json(await studyView(db, user.id));
      if (route === 'export') {
        const decks = await listDecks(db, user.id);
        const [cards, progress, history] = await db.batch<Record<string, unknown>>([
          db.prepare(`SELECT c.* FROM cards c JOIN decks d ON d.id = c.deck_id WHERE d.owner_id = ? OR d.visibility = 'SHARED' OR EXISTS (SELECT 1 FROM deck_collaborators dc WHERE dc.deck_id = d.id AND dc.user_id = ?1)`).bind(user.id),
          db.prepare('SELECT * FROM card_progress WHERE user_id = ?').bind(user.id),
          db.prepare('SELECT * FROM study_events WHERE user_id = ? ORDER BY created_at, rowid').bind(user.id),
        ]);
        return json({ version: 1, username: user.username, exportedAt: new Date().toISOString(), decks,
          cards: cards.results.map(card => ({ ...card, metadata: card.metadata ? JSON.parse(String(card.metadata)) : null, translations: JSON.parse(String(card.translations)) as Translations })),
          progress: progress.results, history: history.results,
        }, 200, { 'Content-Disposition': 'attachment; filename="flashcards-backup.json"' });
      }
      throw new HttpError(404, 'Unknown endpoint.');
    }
    check(request.method === 'POST', 'Method not allowed.', 405);
    check(request.headers.get('Origin') === url.origin, 'Cross-origin request rejected.', 403);
    check(request.headers.get('Content-Type')?.split(';')[0] === 'application/json', 'Expected JSON.', 415);
    check(Number(request.headers.get('Content-Length')) <= 3_000_000, 'Request is too large.', 413);
    const raw = await request.text();
    check(raw.length <= 3_000_000, 'Request is too large.', 413);
    let decoded: unknown;
    try { decoded = JSON.parse(raw); } catch { throw new HttpError(400, 'Invalid JSON.'); }
    const input = object(decoded);
    if (route === 'login') return await login(db, secret, request, input);
    const user = await authenticate(db, request, diagnostics);
    check(user, 'Sign in to continue.', 401);
    if (route === 'tokens') return await tokens(db, user.id, input);
    if (route === 'logout') return await logout(db, request);
    if (route === 'collaborators') return json(await collaborators(db, user.id, string(input.deck, 'deck ID', 80), input));
    if (route === 'deck') return json(await saveDeck(db, user.id, input));
    if (route === 'import/preview') return json(await inspectImport(db, user.id, input));
    if (route === 'import/apply') return json(await applyImport(db, user.id, input));
    if (route === 'study/start') return json(await startSession(db, user, input));
    if (route === 'study/action') return json(await act(db, user, input));
    if (route === 'card' || route === 'deck/delete' || route === 'reset') {
      const deck = string(input.deck, 'deck ID', 80);
      if (route === 'card') return json(await changeCard(db, user.id, deck, input));
      if (route === 'deck/delete') {
        const result = await db.prepare('DELETE FROM decks WHERE id = ? AND owner_id = ?').bind(deck, user.id).run();
        check(result.meta.changes, 'Deck not available.', 404);
        return json({});
      }
      await getDeck(db, user.id, deck);
      return json(await reset(db, user.id, deck, input.card ? string(input.card, 'card ID', 80) : null));
    }
    throw new HttpError(404, 'Unknown endpoint.');
  } catch (error) {
    return errorResponse(error, diagnostics !== undefined);
  }
}

function errorResponse(error: unknown, authDiagnostic: boolean) {
  if (error instanceof HttpError) return json({ error: error.message }, error.status);
  if (error instanceof Error && error.message.includes('UNIQUE constraint failed')) {
    return json({ error: 'A matching deck or question already exists. Refresh and try again.' }, 409);
  }
  if (!authDiagnostic) console.error('Flashcards API error', error);
  return json({ error: 'Something went wrong. Try again.' }, 500);
}
