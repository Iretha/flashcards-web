import { readFileSync } from 'node:fs';
import { convertV4MiniflareOptions, Miniflare } from 'miniflare';
import { afterAll, beforeAll, describe, expect, it, vi } from 'vitest';
import { handle } from '../src/server/api';
import { defaults } from '../src/lib/study';
import type { Deck, Preview, Card, Session, Home } from '../src/ui/api';

const origin = 'https://cards.example';
const accessCode = 'test-fixture';
const rows = (start: number, end: number) => Array.from({ length: end - start + 1 }, (_, index) => {
  const n = start + index;
  return '## Question ' + n + '\n\nAnswer ' + n;
}).join('\n\n---\n\n');
const jmm = (count: number) => '---\ndeckId: jmm\ntitle: Java Memory Model\n---\n' + rows(1, count);
const concurrency = '---\ndeckId: concurrency\ntitle: Concurrency\n---\n## Locks\n\nA lock limits access.';

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
});
afterAll(async () => { await runtime?.dispose(); });

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

  async import(source: string, target = '', choices = {}) {
    const preview = await this.ok<Preview>('import/preview', { source, target });
    const { id } = await this.ok<{ id: string }>('import/apply', {
      source, filename: 'fixture', target, choices, visibility: preview.deck?.visibility ?? 'PRIVATE',
      previewId: preview.deck?.id ?? null, revision: preview.deck?.revision ?? null,
    });
    return { id, preview };
  }

  cards(deck: string) { return this.ok<Card[]>('cards?deck=' + deck); }
  home() { return this.ok<Home>('home'); }
  study() { return this.ok<Session>('study'); }
  action(session: Session, action: string) {
    return this.ok<Session>('study/action', { id: session.id, version: session.version, action });
  }
}

describe('Workers API with real local D1', () => {
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

    const initial = await owner.ok<Session>('study/start', { decks: [first, second], settings: defaults, version: 0 });
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
      let single = await owner.ok<Session>('study/start', { decks: [second], settings: { ...defaults, seconds: 1 }, version: current.version });
      expect(single.card?.question).toBe('Locks');
      mockClock.mockReturnValue(now + 1000);
      single = await owner.action(single, 'timeout');
      expect((await owner.cards(second))[0]).toMatchObject({ status: 'UNLEARNED', times_failed: 1, times_shown: 2 });
      expect((await owner.action(single, 'learn')).status).toBe('COMPLETE');
      await owner.ok('reset', { deck: second });
      expect((await owner.cards(second))[0]).toMatchObject({ status: 'UNLEARNED', times_failed: 1, times_shown: 2, times_learned: 1 });
    } finally { mockClock.mockRestore(); }

    await owner.ok('logout', {});
    expect((await owner.request('home')).response.status).toBe(401);
    expect((await otherDevice.home()).username).toBe('Owner');
  }, 15_000);

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
});
