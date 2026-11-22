import { v3Fixture } from './fixtures/v3';
import { readFileSync } from 'node:fs';
import { createHash, randomBytes } from 'node:crypto';
import { convertV4MiniflareOptions, Miniflare } from 'miniflare';
import { afterAll, beforeAll, describe, expect, it, vi } from 'vitest';
import { handle } from '../src/server/api';
import { defaults } from '../src/lib/study';
import { selectTranslation, selectExplanation } from '../src/lib/translations';
import type { Deck, Preview, Card, Session, Home } from '../src/ui/api';

const origin = 'https://cards.example';
const accessCode = 'test-fixture';
const rows = (start: number, end: number) => Array.from({ length: end - start + 1 }, (_, index) => {
  const n = start + index;
  return '## Question ' + n + '\n\nAnswer ' + n;
}).join('\n\n---\n\n');
const jmm = (count: number) => '---\ndeckId: jmm\ntitle: Java Memory Model\n---\n' + rows(1, count);
const concurrency = '---\ndeckId: concurrency\ntitle: Concurrency\n---\n## Locks\n\nA lock limits access.';
const v2 = (body: string) => '---\ndeckId: bilingual\ntitle: Bilingual\nformatVersion: 2\n---\n' + body;
const bg = '### bg\n#### question\nКакво е ключалка?\n#### answer\nОграничава достъпа.\n#### simple\nЕдин по един.\n#### details\nПравила за синхронизация.';
const en = '### en\n#### question\nWhat is a lock?\n#### answer\nIt restricts access.\n#### simple\nOne at a time.\n#### example\nOnly one thread enters.';

let runtime: Miniflare;
let db: D1Database;
beforeAll(async () => {
  runtime = new Miniflare(convertV4MiniflareOptions({
    modules: true, script: 'export default { fetch() { return new Response("OK"); } }',
    d1Databases: { DB: 'test' },
  }));
  db = await runtime.getD1Database('DB') as unknown as D1Database;
  const migrations = ['0001_initial.sql', '0002_progress.sql'].flatMap(file =>
    readFileSync(new URL('../migrations/' + file, import.meta.url), 'utf8').trim()
      .split(/;\s*(?=CREATE (?:TABLE|INDEX|TRIGGER))/),
  );
  await db.batch(migrations.map(statement => db.prepare(statement)));
  await db.batch([
    db.prepare("INSERT INTO users(id, username, username_key, created_at, last_login_at) VALUES ('migrated', 'Migrated', 'migrated', 0, 0)"),
    db.prepare("INSERT INTO decks(id, owner_id, title, description, visibility, created_at, updated_at) VALUES ('old-deck', 'migrated', 'Old', '', 'PRIVATE', 0, 0)"),
    db.prepare("INSERT INTO cards VALUES ('old-card', 'old-deck', 'old-stable-key', 'въпрос?', 'Въпрос?', 'Отговор.', 0, 0, 0)"),
    db.prepare("INSERT INTO study_events VALUES ('old-event', 'migrated', 'old-session', 'old-card', 'old-deck', 'SHOWN', 1)"),
    db.prepare("INSERT INTO study_sessions VALUES ('old-session', 'migrated', '[\"old-deck\"]', 'SEQUENTIAL', 0, 30, 'old-card', ?, 'ACTIVE', 7, NULL, 0, 0)")
      .bind(JSON.stringify({ queue: [{ id: 'old-card', failed: 0, visits: 1 }], history: ['old-card'], cursor: 0, current: 'old-card', revealed: true, deadline: null, remainingMs: null })),
  ]);
  for (const file of ['0003_bilingual.sql', '0004_card_metadata.sql', '0005_v3.sql', '0006_chatgpt.sql', '0007_management_api.sql']) {
    const sql = readFileSync(new URL('../migrations/' + file, import.meta.url), 'utf8');
    await db.batch(sql.split(';').filter(statement => statement.trim()).map(statement => db.prepare(statement)));
  }
});
afterAll(async () => { await runtime?.dispose(); });

describe('external management API', () => {
  it('authorizes scoped clients and manages decks and bilingual cards in D1', async () => {
    const owner = await apiToken('api-owner');
    const reader = await apiToken('api-owner', 0);
    const other = await apiToken('api-other');
    const expired = await apiToken('api-other', 1, 0);
    expect((await apiRequest('', 'decks')).status).toBe(401);
    expect((await apiRequest(expired, 'decks')).status).toBe(401);
    expect((await apiRequest(reader, 'decks', 'POST', {})).status).toBe(403);
    const createDeck = () => apiRequest(owner, 'decks', 'POST', { title: 'Geography', source_key: 'geography' }, { 'Idempotency-Key': 'geo' });
    const decks = await Promise.all([createDeck(), createDeck()]);
    expect(decks.map(r => r.status).sort()).toEqual([200, 201]);
    const deck = await apiData(decks[0]);
    expect(await apiData(decks[1])).toEqual(deck);
    const route = 'decks/' + deck.id;
    expect(await apiData(await apiRequest(reader, 'decks'))).toEqual([deck]);
    expect((await apiRequest(other, route)).status).toBe(404);
    const share = await apiRequest(owner, route, 'PATCH', { visibility: 'SHARED', description: 'Rivers', chatgpt_en: 'Explain geography.' }, { 'If-Match': '"0"' });
    expect(share.status).toBe(200);
    expect(await apiData(await apiRequest(other, route))).toMatchObject({ owned: false, description: 'Rivers', revision: 1 });
    const cards = route + '/cards';
    expect((await apiRequest(other, cards, 'POST', {})).status).toBe(403);
    const content = { import_key: 'river-danube', primary_language: 'bg', difficulty: 2, translations: {
      bg: { question: 'Къде се влива Дунав?', answer: 'В Черно море.' },
      en: { question: 'Where does the Danube end?', answer: 'The Black Sea.', example: 'The Danube Delta.' },
    } };
    const create = () => apiRequest(owner, cards, 'POST', content, { 'Idempotency-Key': 'danube' });
    const copies = await Promise.all([create(), create()]);
    expect(copies.map(r => r.status).sort()).toEqual([200, 201]);
    const card = await apiData(copies[0]);
    expect(await apiData(copies[1])).toEqual(card);
    expect(card).toMatchObject({ ...content, metadata: null, revision: 2 });
    const item = cards + '/' + card.id;
    expect(await apiData(await apiRequest(other, item))).toEqual(card);
    expect((await apiRequest(owner, cards + '/missing')).status).toBe(404);
    for (const q of ['ДУНАВ', 'danube delta', 'river-danube', card.id]) {
      expect(await apiData(await apiRequest(owner, cards + '?q=' + encodeURIComponent(q)))).toEqual([card]);
    }
    expect((await apiRequest(owner, cards, 'POST', { ...content, difficulty: 3 }, { 'Idempotency-Key': 'danube' })).status).toBe(409);
    expect((await apiRequest(owner, cards, 'POST', {
      import_key: content.import_key, translations: { en: { question: 'Another river?', answer: 'The Rhine.' } },
    }, { 'Idempotency-Key': 'duplicate-key' })).status).toBe(409);
    expect((await apiRequest(owner, cards, 'POST', { ...content, import_key: 'another' }, { 'Idempotency-Key': 'duplicate-question' })).status).toBe(409);
    await db.prepare('INSERT INTO card_progress(user_id, card_id, status, times_shown) VALUES (?, ?, ?, ?)')
      .bind('api-owner', card.id, 'LEARNED', 7).run();
    const edit = (answer: string) => apiRequest(owner, item, 'PATCH', { translations: { en: { answer } } }, { 'If-Match': '"2"' });
    const edits = await Promise.all([edit('It empties into the Black Sea.'), edit('It flows into the Black Sea.')]);
    expect(edits.map(r => r.status).sort()).toEqual([200, 412]);
    const updated = await apiData(edits.find(r => r.status === 200)!);
    expect(updated).toMatchObject({ revision: 3, translations: { bg: content.translations.bg, en: { example: content.translations.en.example } } });
    const browser = new Browser();
    await browser.login('api-owner');
    const browserCards = await browser.ok<Card[]>('cards?deck=' + deck.id);
    expect(browserCards).toEqual([expect.objectContaining({ id: card.id, translations: updated.translations, status: 'LEARNED' })]);
    await browser.ok('deck', { id: deck.id, title: 'European rivers', visibility: 'SHARED' });
    expect((await apiRequest(owner, item, 'PATCH', { difficulty: 5 }, { 'If-Match': '"3"' })).status).toBe(412);
    expect(await db.prepare('SELECT status, times_shown FROM card_progress WHERE card_id = ?').bind(card.id).first())
      .toEqual({ status: 'LEARNED', times_shown: 7 });
    expect((await apiRequest(owner, item, 'PATCH', {})).status).toBe(428);
    await db.prepare('DELETE FROM api_tokens WHERE user_id = ?').bind('api-owner').run();
    expect((await apiRequest(owner, 'decks')).status).toBe(401);
    await db.prepare('DELETE FROM users WHERE id = ?').bind('api-owner').run();
  });

  it('validates fields and updates imported v3 cards using the same model', async () => {
    const browser = new Browser();
    await browser.login('api-import');
    const imported = await browser.import(v3Fixture);
    const user = (await db.prepare("SELECT id FROM users WHERE username = 'api-import'").first<{ id: string }>())!;
    const token = await apiToken(user.id);
    const cards = 'decks/' + imported.id + '/cards';
    const original = (await apiData<ApiResource[]>(await apiRequest(token, cards)))[0];
    expect(original.metadata.topic).toBeTruthy();
    const patch = await apiRequest(token, cards + '/' + original.id, 'PATCH', { difficulty: 4 }, { 'If-Match': '"' + original.revision + '"' });
    expect(patch.status).toBe(200);
    expect(await apiData(patch)).toMatchObject({ id: original.id, metadata: original.metadata, translations: original.translations, difficulty: 4 });
    const valid = { translations: { en: { question: 'A question?', answer: 'An answer.' } } };
    for (const [body, field] of [
      [{ translations: { fr: {} } }, 'translations.fr'],
      [{ translations: { en: { question: 'x'.repeat(2001), answer: 'A' } } }, 'translations.en.question'],
      [{ ...valid, metadata: { cardType: 'question' } }, 'metadata.topic'],
      [{ ...valid, difficulty: 6 }, 'difficulty'],
      [{ ...valid, import_key: 'with spaces' }, 'import_key'],
    ] as const) {
      const response = await apiRequest(token, cards, 'POST', body, { 'Idempotency-Key': 'validation' });
      expect(response.status).toBe(400);
      expect((await response.json() as { error: unknown }).error).toMatchObject({ code: 'validation_error', details: [{ field }] });
    }
  });
});

type ApiResource = { id: string; revision: number; metadata: { topic: string }; translations: Card['translations'] };

async function apiData<T = ApiResource>(response: Response) {
  expect(response.ok).toBe(true);
  return (await response.json() as { data: T }).data;
}

async function apiToken(user: string, canWrite = 1, expires = Date.now() + 60_000) {
  const token = 'fc_' + randomBytes(32).toString('hex');
  const hash = createHash('sha256').update(token).digest('hex');
  await db.batch([
    db.prepare('INSERT INTO users(id, username, username_key, created_at, last_login_at) VALUES (?, ?, ?, 0, 0) ON CONFLICT(id) DO NOTHING')
      .bind(user, user, user),
    db.prepare('INSERT INTO api_tokens VALUES (?, ?, ?, ?)').bind(hash, user, canWrite, expires),
  ]);
  return token;
}

function apiRequest(token: string, route: string, method = 'GET', body?: object, headers: Record<string, string> = {}) {
  return handle(new Request(origin + '/api/' + route, {
    method, headers: { Authorization: 'Bearer ' + token, 'Content-Type': 'application/json', ...headers },
    body: body && JSON.stringify(body),
  }), db, accessCode);
}

class Browser {
  cookie = '';
  async request<T>(route: string, body?: object, requestOrigin = origin) {
    const response = await handle(new Request(origin + '/api/' + route, {
      method: body ? 'POST' : 'GET',
      headers: { Cookie: this.cookie, Origin: requestOrigin, 'Content-Type': 'application/json', 'CF-Connecting-IP': '192.0.2.1' },
      body: body && JSON.stringify(body),
    }), db, accessCode);
    return { response, data: await response.json() as T };
  }

  async ok<T>(route: string, body?: object) {
    const { response, data } = await this.request<T>(route, body);
    expect(response.status, JSON.stringify(data)).toBe(200);
    return data;
  }

  async login(username: string) {
    const { response, data } = await this.request<{ username: string }>('login', { username, code: accessCode });
    expect(response.status).toBe(200);
    const header = response.headers.get('set-cookie') ?? '';
    expect(header).toMatch(/HttpOnly; Secure; SameSite=Lax/);
    this.cookie = header.split(';')[0];
    return data.username;
  }

  async import(source: string, target = '', choices = {}, links = {}) {
    const preview = await this.ok<Preview>('import/preview', { source, target, links });
    const { id } = await this.ok<{ id: string }>('import/apply', {
      source, filename: 'fixture', target, choices, links, visibility: preview.deck?.visibility ?? 'PRIVATE',
      previewId: preview.deck?.id ?? null, revision: preview.deck?.revision ?? null,
    });
    return { id, preview };
  }

  cards(deck: string) { return this.ok<Card[]>('cards?deck=' + deck); }
  home() { return this.ok<Home>('home'); }
  study() { return this.ok<Session>('study'); }
  action(session: Session, action: string, extra = {}) {
    return this.ok<Session>('study/action', { id: session.id, version: session.version, action, ...extra });
  }
}

describe('Workers API with real local D1', () => {
  it('issues a scoped session cookie and requires a valid, unexpired session on home', async () => {
    const browser = new Browser();
    const { response } = await browser.request('login', { username: 'Cookie check', code: accessCode });
    expect(response.status).toBe(200);
    expect(response.headers.get('cache-control')).toBe('no-store');
    const [cookie, ...attributes] = (response.headers.get('set-cookie') ?? '').split('; ');
    expect(attributes.sort()).toEqual(['HttpOnly', 'Max-Age=2592000', 'Path=/', 'SameSite=Lax', 'Secure']);

    const missing = await browser.request('home');
    expect(missing.response.status).toBe(401);
    expect(missing.data).toEqual({ error: 'Sign in to continue.' });

    browser.cookie = cookie;
    expect((await browser.home()).username).toBe('Cookie check');
    await db.prepare('UPDATE auth_sessions SET expires_at = 0 WHERE user_id = (SELECT id FROM users WHERE username = ?)')
      .bind('Cookie check').run();
    expect((await browser.request('home')).response.status).toBe(401);
  });

  it('logs only the authentication diagnostic fields for login and home', async () => {
    const log = vi.spyOn(console, 'info').mockImplementation(() => {});
    const browser = new Browser();
    try {
      expect((await browser.request('login', { username: 'Diagnostic user', code: accessCode }, 'https://other.example')).response.status).toBe(403);
      expect((await browser.request('login', { username: 'Diagnostic user', code: 'wrong' })).response.status).toBe(401);
      await browser.login('Diagnostic user');
      await browser.home();
      await browser.request('study');
      const issuedCookie = browser.cookie;
      browser.cookie = 'other_cookie=flashcards_session';
      await browser.request('home');
      browser.cookie = 'flashcards_session=malformed';
      await browser.request('home');
      browser.cookie = issuedCookie;
      await db.prepare('UPDATE auth_sessions SET expires_at = 0 WHERE user_id = (SELECT id FROM users WHERE username = ?)')
        .bind('Diagnostic user').run();
      await browser.request('home');
      await db.prepare('DELETE FROM auth_sessions WHERE user_id = (SELECT id FROM users WHERE username = ?)')
        .bind('Diagnostic user').run();
      await browser.request('home');
      expect((await handle(new Request(origin + '/api/home', { method: 'DELETE' }), db)).status).toBe(405);

      const login = { event: 'flashcards.auth', method: 'POST', endpoint: '/api/login', cookieReceived: false, sessionFound: null, sessionExpired: null };
      const home = { event: 'flashcards.auth', method: 'GET', endpoint: '/api/home', status: 401, cookieIssued: false, cookieReceived: true, sessionFound: false, sessionExpired: null };
      expect(log.mock.calls).toEqual([
        [{ ...login, status: 403, cookieIssued: false }],
        [{ ...login, status: 401, cookieIssued: false }],
        [{ ...login, status: 200, cookieIssued: true }],
        [{ ...home, status: 200, sessionFound: true, sessionExpired: false }],
        [{ ...home, cookieReceived: false }],
        [home],
        [{ ...home, sessionExpired: true }],
        [home],
        [{ ...home, method: 'DELETE', status: 405, cookieReceived: false, sessionFound: null }],
      ]);
    } finally {
      log.mockRestore();
    }
  });

  it('rejects missing sessions, cross-origin posts and excessive invalid codes', async () => {
    const browser = new Browser();
    expect((await browser.request('home')).response.status).toBe(401);
    expect((await browser.request('login', { username: 'Owner', code: accessCode }, 'https://other.example')).response.status).toBe(403);
    for (let i = 0; i < 8; i++) {
      expect((await browser.request('login', { username: 'Owner', code: 'wrong' })).response.status).toBe(401);
    }
    expect((await browser.request('login', { username: 'Owner', code: accessCode })).response.status).toBe(429);
    await db.prepare('DELETE FROM login_limits').run();
  });

  it('imports, studies, resumes across devices, protects private content and preserves history on reset', async () => {
    const owner = new Browser();
    const guest = new Browser();
    const otherDevice = new Browser();
    expect(await owner.login('Owner')).toBe('Owner');
    expect(await otherDevice.login('oWnEr')).toBe('Owner');
    await guest.login('Guest');

    const { id: first } = await owner.import(jmm(40));
    expect(await owner.cards(first)).toHaveLength(40);
    const duplicate = await owner.import(jmm(40));
    expect(duplicate.id).toBe(first);
    expect(duplicate.preview.rows.every(row => row.kind === 'duplicate')).toBe(true);
    const { id: second } = await owner.import(concurrency);
    expect((await guest.home()).decks).toHaveLength(0);
    expect((await guest.request('cards?deck=' + first)).response.status).toBe(404);

    const initial = await owner.ok<Session>('study/start', { decks: [first, second], settings: { ...defaults, timer: true }, version: 0 });
    expect(initial.remaining).toBe(41);
    expect(initial.card?.question).toBe('Question 1');
    expect(await otherDevice.study()).toEqual(initial);
    const revealed = await otherDevice.action(initial, 'show');
    expect(revealed.deadline).toBeNull();
    expect(revealed.revealed).toBe(true);
    const request = { id: revealed.id, version: revealed.version, action: 'learn' };
    const race = await Promise.all([owner.request<Session>('study/action', request), otherDevice.request<Session>('study/action', request)]);
    expect(race.map(item => item.response.status).sort()).toEqual([200, 409]);
    let active = await owner.study();
    expect(active.card?.question).toBe('Question 2');
    expect(active.remaining).toBe(40);
    const previous = await owner.action(active, 'previous');
    expect(previous.card?.question).toBe('Question 1');
    expect((await owner.cards(first))[0]).toMatchObject({ status: 'LEARNED', times_shown: 1, times_learned: 1 });
    active = await owner.action(previous, 'next');
    expect(active.card?.question).toBe('Question 2');
    const paused = await owner.action(active, 'pause');
    expect(paused.paused).toBe(true);
    active = await otherDevice.action(paused, 'resume');
    expect(active.deadline).toBeGreaterThan(Date.now());
    active = await owner.action(active, 'repeat');
    expect(active.card?.question).toBe('Question 2');
    expect(active.repeat).toBe(true);
    active = await owner.action(active, 'next');
    expect(active.card?.question).toBe('Question 3');

    await owner.import(jmm(55));
    const original = (await owner.cards(first))[0];
    expect(original).toMatchObject({ status: 'LEARNED', times_shown: 1, times_learned: 1 });
    expect(await owner.cards(first)).toHaveLength(55);
    const unresolvedSource = '## question 1\n\nChanged answer';
    const unresolved = await owner.ok<Preview>('import/preview', { source: unresolvedSource, target: first });
    const unresolvedApply = await owner.request('import/apply', {
      source: unresolvedSource, target: first, filename: 'fixture', visibility: 'PRIVATE',
      previewId: first, revision: unresolved.deck?.revision,
    });
    expect(unresolvedApply.response.status).toBe(400);
    expect((await owner.cards(first))[0].answer).toBe(original.answer);
    const conflict = await owner.import('## question 1\n\nChanged answer', first, { 0: 'update' });
    expect(conflict.preview.rows[0].kind).toBe('conflict');
    expect((await owner.cards(first))[0]).toMatchObject({ id: original.id, answer: 'Changed answer', times_learned: 1 });
    const header = { id: first, title: 'Java Memory Model', description: '', visibility: 'SHARED' };
    await owner.ok('deck', header);
    expect((await guest.home()).decks.map(deck => deck.id)).toEqual([first]);
    expect((await guest.cards(first))[0].status).toBe('UNLEARNED');
    expect((await guest.request('card', { deck: first, method: 'delete', id: original.id })).response.status).toBe(404);
    expect((await guest.request('deck', header)).response.status).toBe(404);
    const guestSession = await guest.ok<Session>('study/start', { decks: [first], settings: defaults, version: 0 });
    await guest.action(guestSession, 'learn');
    await owner.ok('deck', { ...header, visibility: 'PRIVATE' });
    expect((await guest.study()).status).toBe('INVALIDATED');
    expect((await guest.request('cards?deck=' + first)).response.status).toBe(404);
    const backup = await guest.request<{ decks: Deck[]; cards: unknown[]; history: { kind: string }[] }>('export');
    expect(backup.response.headers.get('content-disposition')).toContain('flashcards-backup.json');
    expect(backup.data.decks).toEqual([]);
    expect(backup.data.cards).toEqual([]);
    expect(backup.data.history.map(item => item.kind)).toContain('LEARNED');

    await owner.ok('reset', { deck: first, card: original.id });
    expect((await owner.study()).status).toBe('INVALIDATED');
    expect((await owner.cards(first))[0]).toMatchObject({ status: 'UNLEARNED', times_shown: 1, times_learned: 1 });

    const now = Date.now();
    const mockClock = vi.spyOn(Date, 'now').mockReturnValue(now);
    try {
      const current = await owner.study();
      let single = await owner.ok<Session>('study/start', { decks: [second], settings: { ...defaults, timer: true, seconds: 1 }, version: current.version });
      expect(single.card?.question).toBe('Locks');
      mockClock.mockReturnValue(now + 1000);
      single = await owner.action(single, 'timeout');
      expect((await owner.cards(second))[0]).toMatchObject({ status: 'UNLEARNED', times_failed: 1, times_shown: 1 });
      expect((await owner.action(single, 'learn')).status).toBe('COMPLETE');
      await owner.ok('reset', { deck: second });
      expect((await owner.cards(second))[0]).toMatchObject({ status: 'UNLEARNED', times_failed: 1, times_shown: 1, times_learned: 1 });
    } finally { mockClock.mockRestore(); }

    await owner.ok('logout', {});
    expect((await owner.request('home')).response.status).toBe(401);
    expect((await otherDevice.home()).username).toBe('Owner');
  }, 15_000);

  it('uses Markdown deck defaults and allows metadata overrides on a duplicate import', async () => {
    const browser = new Browser();
    await browser.login('Import metadata');
    const source = '---\ntitle: File title\ndescription: File description\nvisibility: SHARED\n---\n## Question\nAnswer';
    const preview = await browser.ok<Preview>('import/preview', { source, target: 'new' });
    expect(preview.metadata.visibility).toBe('SHARED');
    const { id } = await browser.ok<{ id: string }>('import/apply', {
      source, target: 'new', filename: 'file', previewId: null, revision: null,
    });
    expect((await browser.home()).decks.find(deck => deck.id === id)).toMatchObject({
      title: 'File title', description: 'File description', visibility: 'SHARED',
    });
    const again = await browser.ok<Preview>('import/preview', { source, target: id });
    await browser.ok('import/apply', {
      source, target: id, filename: 'file', previewId: id, revision: again.deck?.revision,
      title: 'Custom title', description: '', visibility: 'PRIVATE',
    });
    expect((await browser.home()).decks.find(deck => deck.id === id)).toMatchObject({
      title: 'Custom title', description: '', visibility: 'PRIVATE', total: 1,
    });
  });

  it('supports manual deck and card management without changing card identity', async () => {
    const browser = new Browser();
    await browser.login('Editor');
    const { id: deck } = await browser.ok<{ id: string }>('deck', { title: 'Manual', description: 'Created by hand', visibility: 'PRIVATE' });
    await browser.ok('card', { deck, method: 'save', question: 'First', answer: 'One' });
    await browser.ok('card', { deck, method: 'save', question: 'Second', answer: 'Two' });
    const [first, second] = await browser.cards(deck);
    await browser.ok('card', { deck, method: 'down', id: first.id });
    expect((await browser.cards(deck)).map(card => card.id)).toEqual([second.id, first.id]);
    const session = await browser.ok<Session>('study/start', { decks: [deck], settings: defaults, version: 0 });
    await browser.action(session, 'learn');
    await browser.ok('card', { deck, method: 'save', id: second.id, question: 'Edited', answer: 'Two edited' });
    expect((await browser.cards(deck))[0]).toMatchObject({ id: second.id, question: 'Edited', status: 'LEARNED', times_learned: 1 });
    await browser.ok('card', { deck, method: 'delete', id: first.id });
    expect(await browser.cards(deck)).toHaveLength(1);
    expect((await browser.study()).status).toBe('INVALIDATED');
    await browser.ok('deck/delete', { deck });
    expect((await browser.home()).decks).toEqual([]);
  });

  it('adds storage without rewriting old cards or progress and requires restarting pre-v3 sessions', async () => {
    const browser = new Browser();
    await browser.login('Migrated');
    expect((await browser.cards('old-deck'))[0]).toMatchObject({
      id: 'old-card', translations: { bg: { question: 'Въпрос?', answer: 'Отговор.' } }, times_shown: 1,
      interview_priority: null, difficulty: null, metadata: null,
    });
    expect(await browser.study()).toMatchObject({
      id: 'old-session', version: 7, status: 'INVALIDATED', card: null,
    });
  });

  it('imports v1 and v2, explicitly links a partial translation, and preserves logical progress', async () => {
    const browser = new Browser();
    await browser.login('Bilingual imports');
    const { id: deck } = await browser.import('---\ndeckId: bilingual\ntitle: Legacy\n---\n## Какво е ключалка?\n\nОграничава достъпа.');
    const [legacy] = await browser.cards(deck);
    const active = await browser.ok<Session>('study/start', { decks: [deck], settings: defaults, version: 0 });
    await browser.action(active, 'learn');
    const partial = v2('## card: lock\n### interviewPriority: 5\n### difficulty: 2\n' + en);
    const needsLink = await browser.ok<Preview>('import/preview', { source: partial });
    expect(needsLink.rows[0]).toMatchObject({ kind: 'link', candidates: [{ id: legacy.id }] });
    const denied = await browser.request('import/apply', {
      source: partial, filename: 'fixture', visibility: 'PRIVATE', previewId: deck, revision: needsLink.deck?.revision,
    });
    expect(denied.response.status).toBe(400);
    const result = await browser.import(partial, '', {}, { 0: legacy.id });
    expect(result.preview.rows.map(row => row.kind)).toEqual(['metadata', 'translation']);
    const updated = await browser.cards(deck);
    expect(updated).toHaveLength(1);
    expect(updated[0]).toMatchObject({
      id: legacy.id, import_key: 'lock', times_shown: 1, times_learned: 1, status: 'LEARNED',
      interview_priority: 5, difficulty: 2,
      translations: { bg: { answer: 'Ограничава достъпа.' }, en: { answer: 'It restricts access.' } },
    });
    expect((await browser.import(partial)).preview.rows[0].kind).toBe('duplicate');
    const changedParts = v2('## card: lock\n' + bg + '\n' + en);
    const changed = await browser.import(changedParts, '', { '0:bg': 'update' });
    expect(changed.preview.rows.map(row => row.kind)).toEqual(['conflict', 'duplicate']);
    expect((await browser.cards(deck))[0].translations.bg?.simple).toBe('Един по един.');
    expect((await browser.cards(deck))[0]).toMatchObject({ interview_priority: 5, difficulty: 2 });
  });

  it('imports the canonical template, skips exact reimports and applies rating-only changes to the same card', async () => {
    const browser = new Browser();
    await browser.login('Canonical deck');
    const source = readFileSync(new URL('../docs/FLASHCARDS-IMPORT-TEMPLATE.md', import.meta.url), 'utf8');
    const { id } = await browser.import(source);
    const cards = await browser.cards(id);
    expect(cards).toHaveLength(4);
    const [first] = cards;
    expect(first).toMatchObject({ import_key: 'volatile-atomicity', interview_priority: 5, difficulty: 3 });
    const repeated = await browser.import(source);
    expect(repeated.preview.rows.map(row => row.kind)).toEqual(Array(7).fill('duplicate'));
    expect(await browser.cards(id)).toEqual(cards);
    const revised = await browser.import(source.replace('### difficulty: 3', '### difficulty: 4'));
    expect(revised.preview.rows.filter(row => row.kind === 'metadata')).toHaveLength(1);
    expect((await browser.cards(id))[0]).toMatchObject({ id: first.id, difficulty: 4 });
    const backup = await browser.ok<{ cards: Card[] }>('export');
    expect(backup.cards.find(card => card.id === first.id)).toMatchObject({ difficulty: 4, interview_priority: 5 });
  });

  it('preserves the timer, revealed content, open section and preference across language switches and devices', async () => {
    const browser = new Browser();
    const other = new Browser();
    const guest = new Browser();
    await browser.login('Bilingual study');
    await other.login('Bilingual study');
    await guest.login('Bilingual guest');
    const { id: deck } = await browser.import(v2('## card: lock\n' + bg + '\n' + en + '\n---\n## card: bg-only\n' +
      '### bg\n#### question\nСамо български?\n#### answer\nДа.'));
    const cards = await browser.cards(deck);
    expect(cards).toHaveLength(2);
    expect(Object.keys(cards[0].translations)).toEqual(['bg', 'en']);
    let session = await browser.ok<Session>('study/start', { decks: [deck], settings: { ...defaults, language: 'bg' }, version: 0 });
    const deadline = session.deadline;
    session = await browser.action(session, 'language', { language: 'en' });
    expect(session).toMatchObject({ card: { id: cards[0].id }, language: 'en', deadline, revealed: false });
    expect((await browser.request('study/action', { id: session.id, version: session.version, action: 'explanation', section: 'simple' })).response.status).toBe(409);
    session = await browser.action(session, 'show');
    expect(session).toMatchObject({ revealed: true, deadline: null });
    session = await browser.action(session, 'explanation', { section: 'simple' });
    session = await browser.action(session, 'language', { language: 'bg' });
    expect(session).toMatchObject({ explanation: 'simple', revealed: true, deadline: null, language: 'bg' });
    expect(selectExplanation(session.card!.translations, session.language, 'simple').content).toBe('Един по един.');
    expect((await other.home()).settings.language).toBe('bg');
    expect(await other.study()).toEqual(session);
    session = await other.action(session, 'explanation', { section: 'example' });
    expect(selectExplanation(session.card!.translations, session.language, 'example')).toEqual({ language: 'en', content: 'Only one thread enters.' });
    session = await other.action(session, 'explanation', { section: 'details' });
    session = await other.action(session, 'language', { language: 'en' });
    expect((await browser.cards(deck))[0]).toMatchObject({ times_shown: 1, times_failed: 0, simple_opens: 1, example_opens: 1, details_opens: 1 });
    session = await other.action(session, 'learn');
    expect(selectTranslation(session.card!.translations, session.language)).toMatchObject({ language: 'bg', fallback: true });
    await browser.ok('reset', { deck, card: cards[0].id });
    expect((await browser.cards(deck))[0]).toMatchObject({ status: 'UNLEARNED', times_learned: 1, simple_opens: 1, example_opens: 1, details_opens: 1 });
    await browser.ok('deck', { id: deck, title: 'Bilingual', visibility: 'SHARED' });
    const edit = { deck, id: cards[0].id, method: 'save', translations: { en: { question: 'Updated?', answer: 'Yes' } } };
    expect((await guest.request('card', edit)).response.status).toBe(404);
    await browser.ok('card', edit);
    expect((await browser.cards(deck))[0]).toMatchObject({ translations: { bg: { simple: 'Един по един.' }, en: { question: 'Updated?' } }, simple_opens: 1 });
  });
});

it('round-trips v3 through preview, D1, study, editing, export and guarded recreation', async () => {
  const owner = new Browser();
  const guest = new Browser();
  await owner.login('V3 owner'); await guest.login('V3 guest');
  const { id, preview } = await owner.import(v3Fixture);
  expect(preview.version).toBe(3);
  expect(preview.rows.some(row => row.kind === 'invalid')).toBe(false);
  const cards = await owner.cards(id);
  expect(cards).toHaveLength(2);
  expect(cards[0].metadata).toMatchObject({ cardType: 'coding_task', occurrenceCount: 1 });
  expect(cards[0].metadata?.provenance.sources).toHaveLength(3);
  expect(cards[0].translations.bg?.questionDetails).toContain('int count = 0;');
  expect((await owner.import(v3Fixture)).preview.rows.every(row => row.kind === 'duplicate')).toBe(true);
  let session = await owner.ok<Session>('study/start', { decks: [id], settings: { ...defaults, timer: false }, version: 0 });
  expect(session.card?.metadata).toEqual(cards[0].metadata);
  session = await owner.action(session, 'repeat');
  expect(session.card?.id).toBe(cards[0].id); expect(session.repeat).toBe(true);
  session = await owner.action(session, 'show'); expect(session.revealed).toBe(true);
  session = await owner.action(session, 'show'); expect(session.revealed).toBe(false);
  session = await owner.action(session, 'next'); expect(session.card?.id).toBe(cards[1].id);
  session = await owner.action(session, 'previous'); expect(session.repeat).toBe(true);
  session = await owner.action(session, 'next');
  session = await owner.action(session, 'next'); expect(session.card?.id).toBe(cards[0].id);
  session = await owner.action(session, 'previous'); expect(session.card?.id).toBe(cards[1].id);
  session = await owner.action(session, 'repeat'); expect(session.repeat).toBe(true);
  session = await owner.action(session, 'next');
  session = await owner.action(session, 'repeat'); expect(session.repeat).toBe(false);
  session = await owner.action(session, 'next'); expect(session.card?.id).toBe(cards[1].id);
  session = await owner.action(session, 'repeat');
  session = await owner.action(session, 'next'); expect(session.status).toBe('COMPLETE');
  await owner.ok('card', { deck: id, id: cards[0].id, method: 'save', translations: cards[0].translations });
  const backup = await owner.ok<{ cards: Card[] }>('export');
  expect(backup.cards.find(card => card.id === cards[0].id)?.metadata).toEqual(cards[0].metadata);
  const invalid = v3Fixture.replace('occurrenceCount: 1', 'occurrenceCount: -1');
  const badPreview = await owner.ok<Preview>('import/preview', { source: invalid, target: id });
  expect(badPreview.rows[0].message).toContain('occurrenceCount');
  expect((await owner.request('import/apply', { source: invalid, target: id, filename: 'invalid', visibility: 'PRIVATE', previewId: id, revision: badPreview.deck?.revision })).response.status).toBe(400);
  const replacement = await owner.ok<Preview>('import/preview', { source: v3Fixture, target: id, replace: true });
  expect(replacement.impact).toMatchObject({ cards: 2, progressRecords: 2 });
  const request = { source: v3Fixture, target: id, replace: true, filename: 'replacement', visibility: 'PRIVATE', previewId: id, revision: replacement.deck?.revision };
  expect((await owner.request('import/apply', request)).response.status).toBe(400);
  expect((await guest.request('import/apply', { ...request, confirmReplacement: id })).response.status).toBe(404);
  expect((await owner.cards(id)).map(card => card.id)).toEqual(cards.map(card => card.id));
  await owner.ok('import/apply', { ...request, confirmReplacement: id });
  const recreated = await owner.cards(id);
  expect(recreated).toHaveLength(2);
  expect(recreated[0].id).not.toBe(cards[0].id);
  expect(recreated[0].metadata).toEqual(cards[0].metadata);
  expect(recreated.every(card => card.times_shown === 0)).toBe(true);
  expect((await owner.request('import/apply', { ...request, confirmReplacement: id })).response.status).toBe(409);
  expect((await owner.home()).username).toBe('V3 owner');
});

it('recreates legacy cards atomically, reports shared progress loss and preserves unrelated data and authentication', async () => {
  const owner = new Browser(); const guest = new Browser();
  await owner.login('Recreation owner'); await guest.login('Recreation guest');
  const { id } = await owner.import(jmm(2));
  const { id: unrelated } = await owner.import(concurrency);
  const untouched = await owner.cards(unrelated);
  await owner.ok('deck', { id, title: 'Legacy target', visibility: 'SHARED' });
  const ownerSession = await owner.ok<Session>('study/start', { decks: [id], settings: defaults, version: 0 });
  const guestSession = await guest.ok<Session>('study/start', { decks: [id], settings: defaults, version: 0 });
  const before = await owner.cards(id);
  expect((await owner.request('import/preview', { source: v3Fixture, target: id })).response.status).toBe(400);
  const report = await owner.ok<{ decks: { id: string; cards: number; progressRecords: number; activeSessions: number }[] }>('replacement-report');
  expect(report.decks.find(deck => deck.id === id)).toMatchObject({ cards: 2, progressRecords: 2, activeSessions: 2 });
  expect((await guest.ok<{ decks: unknown[] }>('replacement-report')).decks).toEqual([]);
  const preview = await owner.ok<Preview>('import/preview', { source: v3Fixture, target: id, replace: true });
  const request = { source: v3Fixture, target: id, replace: true, confirmReplacement: id, filename: 'v3', visibility: 'SHARED', previewId: id, revision: preview.deck?.revision };
  // Force an insert failure after deletion to prove the whole D1 batch rolls back.
  await db.prepare(`CREATE TRIGGER fail_recreation BEFORE INSERT ON cards WHEN NEW.deck_id = '${id}' BEGIN SELECT RAISE(ABORT, 'deliberate test failure'); END`).run();
  const log = vi.spyOn(console, 'error').mockImplementation(() => {});
  try {
    expect((await owner.request('import/apply', request)).response.status).toBe(500);
    expect(await owner.cards(id)).toEqual(before);
    expect((await owner.study()).version).toBe(ownerSession.version);
    expect((await guest.study()).version).toBe(guestSession.version);
  } finally {
    log.mockRestore();
    await db.prepare('DROP TRIGGER fail_recreation').run();
  }
  await owner.ok('import/apply', request);
  expect((await owner.study()).status).toBe('INVALIDATED');
  expect((await guest.study()).status).toBe('INVALIDATED');
  expect((await owner.cards(id)).every(card => card.metadata && card.times_shown === 0)).toBe(true);
  expect(await owner.cards(unrelated)).toEqual(untouched);
  expect((await owner.home()).username).toBe('Recreation owner');
  expect((await guest.home()).username).toBe('Recreation guest');
  const impact = await owner.ok<Preview>('import/preview', { source: v3Fixture, target: id });
  expect(impact.impact).toMatchObject({ cards: 2, progressRecords: 0, activeSessions: 0, retainedHistoricalEvents: 2 });
});

it('imports a large v3 deck with optional fields omitted', async () => {
  const browser = new Browser();
  await browser.login('Large optional fields');
  const source = '---\nformatVersion: 3\ntitle: Large deck\n---\n' + Array.from({ length: 236 }, (_, i) => `
## card: large-${i}
### cardType: question
### topic: Java
### occurrenceCount: 0
### provenance
type: generated
### bg
#### question
Question ${i}
#### answer
${'Answer content. '.repeat(180)}
`).join('\n---\n');
  expect(source.length).toBeGreaterThan(500_000);
  const { id } = await browser.import(source);
  const cards = await browser.cards(id);
  expect(cards).toHaveLength(236);
  expect(cards.every(card => card.difficulty === null && card.interview_priority === null)).toBe(true);
});

it('applies changed answer defaults when resuming without a timer', async () => {
  const browser = new Browser();
  await browser.login('Resume answer defaults');
  const { id } = await browser.import(rows(1, 3));
  let session = await browser.ok<Session>('study/start', { decks: [id], settings: { ...defaults, answersOpen: true }, version: 0 });
  expect(session.revealed).toBe(true);
  session = await browser.action(session, 'pause');
  session = await browser.action(session, 'resume', { answersOpen: false });
  expect(session.revealed).toBe(false);
  session = await browser.action(session, 'next');
  expect(session.revealed).toBe(false);
  session = await browser.action(session, 'previous');
  expect(session.revealed).toBe(false);
  session = await browser.action(session, 'resume', { answersOpen: true });
  expect(session.revealed).toBe(true);
});

it('persists independent ChatGPT overrides and enforces ownership and validation', async () => {
  const owner = new Browser(); await owner.login('Instructions owner');
  const guest = new Browser(); await guest.login('Instructions guest');
  const data = { title: 'Instructions', description: '', visibility: 'SHARED' };
  const first = await owner.ok<{id: string}>('deck', data);
  const second = await owner.ok<{id: string}>('deck', data);
  await owner.ok('deck', { ...data, id: first.id, chatgpt_en: 'Explain with examples' });
  await owner.ok('deck', { ...data, id: first.id, chatgpt_bg: 'Bulgarian instructions' });
  const home = await owner.ok<Home>('home');
  expect(home.decks.find(d => d.id === first.id)).toMatchObject({ chatgpt_default: 'universal', chatgpt_en: 'Explain with examples', chatgpt_bg: 'Bulgarian instructions' });
  expect(home.decks.find(d => d.id === second.id)?.chatgpt_en).toBeNull();
  expect((await guest.request('deck', { ...data, id: first.id, chatgpt_en: 'Forbidden' })).response.status).toBe(404);
  for (const value of ['', 42, 'x'.repeat(10001)]) expect((await owner.request('deck', { ...data, id: first.id, chatgpt_en: value })).response.status).toBe(400);
  await owner.ok('deck', { ...data, id: first.id, chatgpt_en: null });
  const fresh = new Browser(); await fresh.login('Instructions owner');
  expect((await fresh.ok<Home>('home')).decks.find(d => d.id === first.id)).toMatchObject({ chatgpt_en: null, chatgpt_bg: 'Bulgarian instructions' });
  expect((await db.prepare("SELECT chatgpt_default FROM decks WHERE id = 'old-deck'").first<{chatgpt_default: string}>())?.chatgpt_default).toBe('legacy');
});
