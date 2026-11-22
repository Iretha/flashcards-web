import { canEditDeck, editAccess } from './permissions';
import { deckLanguages, validateCardLanguages, validateLanguageChange } from './deck-languages';
import { authenticateClient, digest } from './auth';
import { deckWithCards, getDeck, listCards, listDecks, writeCards, primaryLanguageStatements, decodeDeck } from './decks';
import type { Deck } from './decks';
import { check, HttpError, json } from './http';
import { uniqueQuestions } from './import-plan';
import type { ImportTarget } from './import-plan';
import { validateMetadata } from '../lib/metadata';
import { isLanguage, sections, validTranslation } from '../lib/translations';
import type { Translation, Translations } from '../lib/translations';

class InvalidField extends HttpError {
  constructor(readonly field: string, message: string) { super(400, message); }
}

function requireField(condition: unknown, field: string, message: string): asserts condition {
  if (!condition) throw new InvalidField(field, message);
}

function fields(value: unknown, path: string, allowed: readonly string[]) {
  requireField(value && typeof value === 'object' && !Array.isArray(value), path, 'Expected an object.');
  const record = value as Record<string, unknown>;
  for (const key of Object.keys(record)) requireField(allowed.includes(key), path + '.' + key, 'Unsupported field.');
  return record;
}

function text(value: unknown, field: string, max: number, required = true) {
  requireField(typeof value === 'string' && value.length <= max && (!required || value.trim()),
    field, `Expected ${required ? 'nonempty ' : ''}text of at most ${max} characters.`);
  return value;
}

function identifier(value: string, name: string, max: number) {
  requireField(/^[a-z0-9][a-z0-9_-]*$/i.test(value) && value.length <= max, name, 'Invalid identifier.');
  return value;
}

function deckData(deck: Deck, user: string) {
  deck = decodeDeck(deck);
  const { id, title, description, visibility, source_key, chatgpt_default, chatgpt_en, chatgpt_bg, revision } = deck;
  return { primaryLanguage: deck.primaryLanguage, supportedLanguages: deck.supportedLanguages, id, title, description, visibility, source_key, chatgpt_default, chatgpt_en, chatgpt_bg, revision, owned: deck.owner_id === user };
}

function cardData(card: ImportTarget & { deck_id: string; position: number }, revision: number) {
  const { id, deck_id, position, import_key, primary_language, translations, interview_priority, difficulty, metadata } = card;
  return { id, deck_id, position, import_key, primary_language, translations, interview_priority, difficulty, metadata, revision };
}

function deckValues(value: unknown, current?: Deck) {
  const input = fields(value, 'body', ['title', 'description', 'visibility', 'source_key', 'chatgpt_default', 'chatgpt_en', 'chatgpt_bg', 'primaryLanguage', 'supportedLanguages', 'confirmPrimaryLanguageChange']);
  const title = text('title' in input ? input.title : current?.title, 'title', 160).trim();
  const description = text('description' in input ? input.description : current?.description ?? '', 'description', 2000, false).trim();
  const visibility = 'visibility' in input ? input.visibility : current?.visibility ?? 'PRIVATE';
  requireField(visibility === 'PRIVATE' || visibility === 'SHARED', 'visibility', 'Expected PRIVATE or SHARED.');
  const preset = 'chatgpt_default' in input ? input.chatgpt_default : current?.chatgpt_default ?? 'universal';
  requireField(preset === 'legacy' || preset === 'universal', 'chatgpt_default', 'Expected legacy or universal.');
  const optionalText = (field: 'source_key' | 'chatgpt_en' | 'chatgpt_bg', max: number) => {
    const value = field in input ? input[field] : current?.[field] ?? null;
    return value === null ? null : text(value, field, max);
  };
  return [title, description, visibility, optionalText('source_key', 160)?.trim() ?? null,
    preset, optionalText('chatgpt_en', 10000), optionalText('chatgpt_bg', 10000)] as const;
}

function cardValues(value: unknown, id: string, current?: ImportTarget): ImportTarget {
  const input = fields(value, 'body', ['translations', 'primary_language', 'import_key', 'metadata', 'interview_priority', 'difficulty']);
  const translations: Translations = { ...current?.translations };
  if ('translations' in input) {
    const entries = fields(input.translations, 'translations', Object.keys(input.translations && typeof input.translations === 'object' ? input.translations : {}));
    requireField(Object.keys(entries).every(isLanguage), 'translations', 'Use canonical BCP 47 language codes.');
    for (const language of Object.keys(entries)) {
      if (!(language in entries)) continue;
      const path = 'translations.' + language;
      const keys = ['question', 'answer', 'questionDetails', ...sections] as const;
      const patch = fields(entries[language], path, keys);
      const next = { ...translations[language] } as Translation;
      for (const key of keys) {
        const required = key === 'question' || key === 'answer';
        if (!required && !(key in patch)) continue;
        next[key] = text(key in patch ? patch[key] : next[key], path + '.' + key, key === 'question' ? 2000 : 20000, required);
      }
      requireField(validTranslation(next), path, 'Invalid translation.');
      translations[language] = next;
    }
  }
  const primary = 'primary_language' in input ? input.primary_language : current?.primary_language ?? Object.keys(translations)[0];
  requireField(isLanguage(primary) && translations[primary], 'primary_language', 'Provide a complete translation for the primary language.');
  let metadata = current?.metadata ?? null;
  if ('metadata' in input) {
    try { metadata = input.metadata === null ? null : validateMetadata(input.metadata); }
    catch (error) {
      const [field, ...message] = (error as Error).message.split(': ');
      throw new InvalidField(field === 'metadata' || field.startsWith('metadata.') ? field : 'metadata.' + field, message.join(': '));
    }
  }
  if (metadata?.cardType === 'coding_task') {
    for (const language of Object.keys(translations)) {
      const translation = translations[language];
      requireField(!translation || translation.questionDetails?.trim(), 'translations.' + language + '.questionDetails', 'Coding tasks require a task statement.');
    }
  }
  const rating = (key: 'difficulty' | 'interview_priority') => {
    const value = key in input ? input[key] : current?.[key] ?? null;
    requireField(value === null || (typeof value === 'number' && Number.isInteger(value) && value >= 1 && value <= 5), key, 'Expected null or an integer from 1 to 5.');
    return value;
  };
  const key = 'import_key' in input ? input.import_key : current?.import_key ?? null;
  const importKey = key === null ? null : identifier(text(key, 'import_key', 100), 'import_key', 100);
  return { id, translations, primary_language: primary, metadata, import_key: importKey, difficulty: rating('difficulty'), interview_priority: rating('interview_priority') };
}

async function readBody(request: Request) {
  check(request.headers.get('Content-Type')?.split(';')[0].trim().toLowerCase() === 'application/json', 'Expected JSON.', 415);
  const reader = request.body?.getReader();
  const decoder = new TextDecoder('utf-8', { fatal: true, ignoreBOM: true });
  let size = 0;
  let raw = '';
  try {
    if (reader) {
      for (;;) {
        const { done, value } = await reader.read();
        if (done) break;
        size += value.byteLength;
        check(size <= 1_000_000, 'Request is too large.', 413);
        raw += decoder.decode(value, { stream: true });
      }
    }
    raw += decoder.decode();
    return { raw, value: JSON.parse(raw) as unknown };
  } catch (error) {
    if (reader) await reader.cancel().catch(() => {});
    if (error instanceof HttpError) throw error;
    throw new InvalidField('body', 'Invalid JSON or UTF-8.');
  }
}

const codes: Record<number, string> = {
  400: 'validation_error', 401: 'unauthorized', 403: 'forbidden', 404: 'not_found', 405: 'method_not_allowed',
  409: 'conflict', 412: 'revision_mismatch', 413: 'payload_too_large', 415: 'unsupported_media_type',
  428: 'precondition_required', 500: 'internal_error',
};

export async function manage(request: Request, db: D1Database, url: URL, route: string) {
  let headers: Record<string, string> = {};
  try {
    const client = await authenticateClient(db, request);
    if (!client) {
      headers = { 'WWW-Authenticate': 'Bearer realm="flashcards"' };
      throw new HttpError(401, 'A valid API bearer token is required.');
    }
    const user = client.user_id;
    const path = /^decks(?:\/([^/]+)(?:\/(cards)(?:\/([^/]+))?)?)?$/.exec(route);
    check(path, 'Unknown endpoint.', 404);
    const deckId = path[1] && identifier(path[1], 'deckId', 80);
    const cardsRoute = Boolean(path[2]);
    const cardId = path[3] && identifier(path[3], 'cardId', 80);
    const { method } = request;
    const collection = !deckId || (cardsRoute && !cardId);
    const writeMethod = collection ? 'POST' : 'PATCH';
    headers = { Allow: 'GET, ' + writeMethod };
    check(method === 'GET' || method === writeMethod, 'Method not allowed.', 405);
    check(method === 'GET' || client.can_write, 'This token has read permission only.', 403);

    const respond = (data: { revision: number }, status = 200, extra: Record<string, string> = {}) =>
      json({ data }, status, { ETag: `"${data.revision}"`, ...extra });
    if (method === 'GET') {
      if (!deckId) return json({ data: (await listDecks(db, user)).map(item => deckData(item, user)) });
      if (!cardsRoute) return respond(deckData(await getDeck(db, user, deckId), user));
      const q = url.searchParams.has('q') ? text(url.searchParams.get('q'), 'q', 200).trim().toLowerCase() : '';
      const { deck, cards } = await deckWithCards(db, user, deckId, cardId || undefined);
      if (cardId) {
        const card = cards.find(item => item.id === cardId);
        check(card, 'Card not available.', 404);
        return respond(cardData(card, deck.revision));
      }
      const matches = cards.filter(card => !q || [card.id, card.import_key, ...Object.values(card.translations).flatMap(Object.values)]
        .some(value => value?.toLowerCase().includes(q)));
      return json({ data: matches.map(card => cardData(card, deck.revision)), revision: deck.revision }, 200, { ETag: `"${deck.revision}"` });
    }

    const deck = deckId ? await getDeck(db, user, deckId) : undefined;
    if (deck) check(await canEditDeck(db, user, deck), 'Only editors may edit this deck.', 403);

    if (method === 'PATCH') {
      const revision = request.headers.get('If-Match');
      check(revision, 'If-Match is required.', 428);
      requireField(/^"(0|[1-9][0-9]*)"$/.test(revision), 'If-Match', 'Expected a quoted revision.');
      check(revision === `"${deck!.revision}"`, 'Deck changed. Reload and retry.', 412);
    }
    const requestKey = method === 'POST' ? request.headers.get('Idempotency-Key') : null;
    requireField(method !== 'POST' || (requestKey && /^[A-Za-z0-9_-]{1,128}$/.test(requestKey)),
      'Idempotency-Key', 'Provide a key of 1 to 128 letters, digits, underscores or hyphens.');
    const { raw, value } = await readBody(request);
    const fingerprint = requestKey ? await digest(raw) : null;
    const id = (cardsRoute ? cardId : deckId) ?? crypto.randomUUID();
    const location = (resource: string) => '/api/' + (cardsRoute ? route + '/' + resource : 'decks/' + resource);
    const replay = async () => {
      if (!requestKey) return null;
      const receipt = await db.prepare('SELECT fingerprint, resource_id FROM api_creates WHERE user_id = ? AND route = ? AND request_key = ?')
        .bind(user, route, requestKey).first<{ fingerprint: string; resource_id: string }>();
      if (!receipt) return null;
      check(receipt.fingerprint === fingerprint, 'Idempotency key already used with another body.', 409);
      const replayHeaders = { Location: location(receipt.resource_id), 'Idempotency-Replayed': 'true' };
      if (!cardsRoute) return respond(deckData(await getDeck(db, user, receipt.resource_id, true), user), 200, replayHeaders);
      const { deck: currentDeck, cards: [card] } = await deckWithCards(db, user, deck!.id, receipt.resource_id);
      await getDeck(db, user, currentDeck.id, true);
      check(card, 'Card not available.', 404);
      return respond(cardData(card, currentDeck.revision), 200, replayHeaders);
    };
    const previous = await replay();
    if (previous) return previous;

    const now = Date.now();
    const mutation = crypto.randomUUID();
    let batch: D1PreparedStatement[];
    if (!cardsRoute) {
      const values = deckValues(value, deck);
      if (deck) check(deck.owner_id === user || values[2] === deck.visibility, 'Only the owner may change visibility.', 403);
      const config = deckLanguages(value as Record<string, unknown>, deck);
      const { primaryLanguage: primary, supportedLanguages: supported } = config;
      const configCards = deck ? await listCards(db, user, deck.id) : [];
      if (deck) validateLanguageChange(value as Record<string, unknown>, deck, config, configCards);
      batch = [deck
        ? db.prepare(`UPDATE decks SET title = ?, description = ?, visibility = ?, source_key = ?, chatgpt_default = ?, chatgpt_en = ?, chatgpt_bg = ?, primaryLanguage = ?, supportedLanguages = ?,
            revision = revision + 1, updated_at = ?, mutation = ? WHERE id = ? AND ${editAccess(13)} AND revision = ?`)
          .bind(...values, primary, JSON.stringify(supported), now, mutation, id, user, deck.revision)
        : db.prepare(`INSERT INTO decks(title, description, visibility, source_key, chatgpt_default, chatgpt_en, chatgpt_bg,
            primaryLanguage, supportedLanguages, created_at, updated_at, mutation, id, owner_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`)
          .bind(...values, primary, JSON.stringify(supported), now, now, mutation, id, user)];
      if (deck) batch.push(...primaryLanguageStatements(db, id, mutation, primary!, deck.primaryLanguage !== primary, configCards));
    } else {
      check(deck, 'Deck not available.', 404);
      const cards = await listCards(db, user, deck.id);
      const current = cardId ? cards.find(card => card.id === cardId) : undefined;
      check(!cardId || current, 'Card not available.', 404);
      const next = cardValues({ ...(value as object), primary_language: (value as Record<string, unknown>).primary_language ?? deck.primaryLanguage ?? current?.primary_language ?? Object.keys(((value as Record<string, unknown>).translations ?? {}) as object)[0] }, id, current);
      validateCardLanguages(next, deck);
      const supported = deck.supportedLanguages as string[];
      requireField(Object.keys(next.translations).every(code => supported.includes(code)), 'translations', 'Language is not supported by this deck.');
      requireField(!deck.primaryLanguage || next.translations[deck.primaryLanguage as keyof Translations], 'translations', 'Primary language content is required.');
      requireField(!deck.primaryLanguage || next.primary_language === deck.primaryLanguage, 'primary_language', 'Use the deck primary language.');
      if (!uniqueQuestions([...cards.filter(card => card.id !== id), next])) {
        const retry = await replay();
        if (retry) return retry;
        throw new HttpError(409, 'A matching question already exists in this deck.');
      }
      batch = [
        db.prepare(`UPDATE decks SET revision = revision + 1, updated_at = ?, mutation = ? WHERE id = ? AND ${editAccess(4)} AND revision = ?`)
          .bind(now, mutation, deck.id, user, deck.revision),
        writeCards(db, deck.id, mutation, now, [next], !cardId),
      ];
    }
    const parentId = deck?.id ?? id;
    if (requestKey) batch.push(db.prepare(`INSERT INTO api_creates(user_id, route, request_key, fingerprint, resource_id)
      SELECT ?, ?, ?, ?, ? WHERE EXISTS (SELECT 1 FROM decks WHERE id = ? AND mutation = ?)`)
      .bind(user, route, requestKey, fingerprint, id, parentId, mutation));
    batch.push(cardsRoute
      ? db.prepare(`SELECT c.*, d.revision FROM cards c JOIN decks d ON d.id = c.deck_id WHERE c.id = ? AND d.id = ? AND d.mutation = ?`).bind(id, parentId, mutation)
      : db.prepare('SELECT * FROM decks WHERE id = ? AND mutation = ?').bind(id, mutation));

    let results: D1Result[];
    try { results = await db.batch(batch); }
    catch (error) {
      const retry = await replay();
      if (retry) return retry;
      throw error;
    }
    if (!results[0].meta.changes) {
      const retry = await replay();
      if (retry) return retry;
      throw new HttpError(method === 'PATCH' ? 412 : 409, 'Deck changed. Reload and retry.');
    }
    const row = results.at(-1)!.results[0];
    const status = method === 'POST' ? 201 : 200;
    const extra: Record<string, string> = method === 'POST' ? { Location: location(id) } : {};
    if (!cardsRoute) return respond(deckData(row as unknown as Deck, user), status, extra);
    const saved = row as unknown as Omit<ImportTarget, 'translations' | 'metadata'> & {
      deck_id: string; position: number; translations: string; metadata: string | null; revision: number;
    };
    return respond(cardData({ ...saved, translations: JSON.parse(saved.translations), metadata: saved.metadata ? JSON.parse(saved.metadata) : null },
      saved.revision), status, extra);
  } catch (error) {
    const unique = error instanceof Error && error.message.includes('UNIQUE constraint failed');
    const status = error instanceof HttpError ? error.status : unique ? 409 : 500;
    const message = error instanceof HttpError ? error.message : unique ? 'An identifier or question already exists.' : 'Something went wrong. Try again.';
    const details = error instanceof InvalidField ? [{ field: error.field, message }] : undefined;
    return json({ error: { code: codes[status], message, details } }, status, status === 401 || status === 405 ? headers : {});
  }
}
