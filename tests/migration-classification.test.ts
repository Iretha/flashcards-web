import { readFileSync, readdirSync } from 'node:fs';
import { afterEach, expect, it } from 'vitest';
import { convertV4MiniflareOptions, Miniflare } from 'miniflare';
import { splitSql } from './sql';
import { writeCanonicalCards } from '../src/server/decks';
import { validateCanonicalMetadata } from '../src/lib/metadata';

let runtime: Miniflare | undefined;
afterEach(async () => { await runtime?.dispose(); runtime = undefined; });

function statements(file: string) {
  const sql = readFileSync('migrations/' + file, 'utf8');
  if (['0020_native_search.sql', '0021_card_classification.sql'].includes(file)) return splitSql(sql);
  if (file === '0002_progress.sql') return [sql];
  if (file === '0001_initial.sql') return sql.trim().split(/;\s*(?=CREATE (?:TABLE|INDEX|TRIGGER))/);
  if (['0015_card_search_fts.sql', '0016_fts_consistency_recovery.sql'].includes(file)) return sql.trim().split(/;\s*(?=CREATE)/);
  return sql.split(';').filter(value => value.trim());
}

async function database() {
  runtime = new Miniflare(convertV4MiniflareOptions({
    modules: true, script: 'export default {fetch(){return new Response("ok")}}',
    d1Databases: { DB: crypto.randomUUID() },
  }));
  const db = await runtime.getD1Database('DB') as unknown as D1Database;
  for (const file of readdirSync('migrations').filter(file => file.endsWith('.sql') && file < '0021').sort()) {
    await db.batch(statements(file).map(sql => db.prepare(sql)));
  }
  await db.prepare("INSERT INTO users(id,username,username_key,created_at,last_login_at) VALUES('owner','owner','owner',0,0)").run();
  await db.prepare("INSERT INTO decks(id,owner_id,title,description,visibility,revision,mutation,created_at,updated_at,primaryLanguage,supportedLanguages) VALUES('deck','owner','Deck','','SHARED',7,'write',1,2,'en','[\"en\",\"bg\"]')").run();
  return db;
}

const source = { sourceName: 'Source', sourceUrl: 'https://example.com', occurrenceId: 'one' };

it('migrates representative legacy data without changing canonical or historical identities', async () => {
  const db = await database();
  const questionMetadata = { cardType: 'question', topic: 'Java Concurrency', provenance: { type: 'sourced', sources: [source] }, answerReferences: [{ title: 'Reference', url: 'https://example.com/ref' }] };
  const taskMetadata = { cardType: 'coding_task', topic: 'Java Memory Model', provenance: { type: 'generated', sources: [] } };
  await db.batch([
    db.prepare(`INSERT INTO cards(id,deck_id,stable_key,question_key,position,created_at,updated_at,import_key,primary_language,translations,interview_priority,difficulty,metadata)
      VALUES('question','deck','stable-q','question',2,3,4,'key-q','en',?,5,2,?)`)
      .bind(JSON.stringify({ en: { question: 'Question?', answer: '' }, bg: { question: 'Въпрос?', answer: 'Отговор' } }), JSON.stringify(questionMetadata)),
    db.prepare(`INSERT INTO cards(id,deck_id,stable_key,question_key,position,created_at,updated_at,import_key,primary_language,translations,metadata)
      VALUES('task','deck','stable-t','task',3,5,6,'key-t','en',?,?)`)
      .bind(JSON.stringify({ en: { question: 'Task?', answer: '', questionDetails: 'Implement it.' }, bg: { question: 'Задача?', answer: '', questionDetails: 'Реализирайте я.' } }), JSON.stringify(taskMetadata)),
    db.prepare(`INSERT INTO cards(id,deck_id,stable_key,question_key,position,created_at,updated_at,primary_language,translations)
      VALUES('plain','deck','stable-p','plain',4,7,8,'en',?)`).bind(JSON.stringify({ en: { question: 'Plain?', answer: '' } })),
    db.prepare("INSERT INTO study_events VALUES('event','owner','session','question','deck','SHOWN',9)"),
    db.prepare("INSERT INTO study_sessions VALUES('session','owner','[\"deck\"]','SEQUENTIAL',0,30,'question',?,'ACTIVE',11,NULL,9,10)")
      .bind(JSON.stringify({ queue: [], history: ['question'], cursor: 0, current: 'question', revealed: false, deadline: null, remainingMs: null, cycles: { cards: ['question'], pending: [], repeat: [], history: ['question'], cursor: 0, complete: false, cycle: 0 } })),
  ]);
  const beforeCards = (await db.prepare('SELECT id,deck_id,stable_key,question_key,position,created_at,updated_at,import_key,primary_language,translations,interview_priority,difficulty FROM cards ORDER BY id').all()).results;
  const beforeEvents = (await db.prepare('SELECT * FROM study_events').all()).results;
  const beforeSession = await db.prepare('SELECT * FROM study_sessions').first();

  await db.batch(statements('0021_card_classification.sql').map(sql => db.prepare(sql)));

  expect((await db.prepare('SELECT id,deck_id,stable_key,question_key,position,created_at,updated_at,import_key,primary_language,translations,interview_priority,difficulty FROM cards ORDER BY id').all()).results).toEqual(beforeCards);
  expect((await db.prepare('SELECT card_id,topic_name FROM card_topics ORDER BY card_id').all()).results).toEqual([
    { card_id: 'question', topic_name: 'JAVA CONCURRENCY' },
    { card_id: 'task', topic_name: 'JAVA MEMORY MODEL' },
  ]);
  const rows = (await db.prepare('SELECT id,priority,likelihood,creation_mode,metadata FROM cards ORDER BY id').all<{ id: string; priority: number; likelihood: number; creation_mode: string; metadata: string }>()).results;
  expect(rows.map(({ id, priority, likelihood, creation_mode }) => ({ id, priority, likelihood, creation_mode }))).toEqual([
    { id: 'plain', priority: 3, likelihood: 3, creation_mode: 'UNKNOWN' },
    { id: 'question', priority: 3, likelihood: 3, creation_mode: 'UNKNOWN' },
    { id: 'task', priority: 3, likelihood: 3, creation_mode: 'UNKNOWN' },
  ]);
  expect(JSON.parse(rows[0].metadata)).toEqual({ cardType: 'question' });
  expect(JSON.parse(rows[1].metadata)).toEqual({ cardType: 'question', provenance: questionMetadata.provenance, answerReferences: questionMetadata.answerReferences });
  expect(JSON.parse(rows[2].metadata)).toEqual({ cardType: 'task', provenance: taskMetadata.provenance });
  expect((await db.prepare('SELECT * FROM study_events').all()).results).toEqual(beforeEvents);
  expect(await db.prepare('SELECT * FROM study_sessions').first()).toEqual(beforeSession);
  expect((await db.prepare('PRAGMA foreign_key_check').all()).results).toEqual([]);
});

it('fails the complete migration on unknown values or invalid task specifications', async () => {
  for (const fixture of [
    { metadata: { cardType: 'question', topic: 'Uninspected', provenance: { type: 'generated', sources: [] } }, translations: { en: { question: 'Unknown?', answer: '' } } },
    { metadata: { cardType: 'coding_task', topic: 'Test', provenance: { type: 'generated', sources: [] } }, translations: { en: { question: 'Broken task?', answer: '' } } },
  ]) {
    const db = await database();
    await db.prepare("INSERT INTO cards(id,deck_id,stable_key,question_key,position,created_at,updated_at,primary_language,translations,metadata) VALUES('bad','deck','bad','bad',0,0,0,'en',?,?)")
      .bind(JSON.stringify(fixture.translations), JSON.stringify(fixture.metadata)).run();
    await expect(db.batch(statements('0021_card_classification.sql').map(sql => db.prepare(sql)))).rejects.toThrow();
    expect((await db.prepare("PRAGMA table_info(cards)").all()).results.some(column => column.name === 'priority')).toBe(false);
    expect(await db.prepare("SELECT metadata FROM cards WHERE id='bad'").first()).toEqual({ metadata: JSON.stringify(fixture.metadata) });
    await runtime?.dispose(); runtime = undefined;
  }
});

it('writes canonical memberships atomically and leaves omitted topics untouched', async () => {
  const db = await database();
  await db.batch(statements('0021_card_classification.sql').map(sql => db.prepare(sql)));
  const base = {
    id: 'canonical', import_key: 'canonical', primary_language: 'en' as const,
    translations: { en: { question: 'Canonical?', answer: '' } }, interview_priority: 5, difficulty: 2,
    metadata: validateCanonicalMetadata({ cardType: 'question' }), priority: 1 as const,
    likelihood: 2 as const, creation_mode: 'MANUAL' as const,
  };
  await db.batch(writeCanonicalCards(db, 'deck', 'write', 10, [{ ...base, topics: ['JAVA', 'JVM'] }]));
  const epoch = (await db.prepare('SELECT epoch FROM card_search_state WHERE id=1').first<{ epoch: number }>())!.epoch;
  await db.batch(writeCanonicalCards(db, 'deck', 'write', 11, [{ ...base, translations: { en: { question: 'Canonical?', answer: 'Changed' } }, priority: 4 }]));
  expect((await db.prepare("SELECT topic_name FROM card_topics WHERE card_id='canonical' ORDER BY topic_name").all()).results).toEqual([{ topic_name: 'JAVA' }, { topic_name: 'JVM' }]);
  expect((await db.prepare('SELECT epoch FROM card_search_state WHERE id=1').first<{ epoch: number }>())!.epoch).toBe(epoch + 1); // card update only

  await expect(db.batch([
    ...writeCanonicalCards(db, 'deck', 'write', 12, [{ ...base, translations: { en: { question: 'Must roll back', answer: '' } }, topics: ['REPLACEMENT'] }]),
    db.prepare("INSERT INTO users(id) VALUES('owner')"),
  ])).rejects.toThrow();
  expect(await db.prepare("SELECT translations FROM cards WHERE id='canonical'").first()).toEqual({ translations: JSON.stringify({ en: { question: 'Canonical?', answer: 'Changed' } }) });

  await db.batch(writeCanonicalCards(db, 'deck', 'wrong-marker', 13, [{ ...base, topics: [] }]));
  expect((await db.prepare("SELECT topic_name FROM card_topics WHERE card_id='canonical'").all()).results).toHaveLength(2);
});

it('removes legacy invalidation behavior while retaining cascade and search consistency', async () => {
  const db = await database();
  await db.prepare("INSERT INTO cards(id,deck_id,stable_key,question_key,position,created_at,updated_at,primary_language,translations) VALUES('card','deck','card','card',0,0,0,'en',?)")
    .bind(JSON.stringify({ en: { question: 'Card?', answer: '' } })).run();
  await db.prepare("INSERT INTO study_sessions VALUES('session','owner','[\"deck\"]','SEQUENTIAL',0,30,'card',?,'ACTIVE',5,NULL,0,0)")
    .bind(JSON.stringify({ queue: [], history: ['card'], cursor: 0, current: 'card', cycles: { cards: ['card'], pending: [], repeat: [], history: ['card'], cursor: 0, complete: false, cycle: 0 } })).run();
  await db.batch(statements('0021_card_classification.sql').map(sql => db.prepare(sql)));
  await db.prepare("INSERT INTO card_topics VALUES('card','TEST')").run();
  const epoch = (await db.prepare('SELECT epoch FROM card_search_state WHERE id=1').first<{ epoch: number }>())!.epoch;
  await db.prepare("DELETE FROM cards WHERE id='card'").run();
  expect(await db.prepare('SELECT status,version FROM study_sessions').first()).toEqual({ status: 'ACTIVE', version: 5 });
  expect((await db.prepare('SELECT * FROM card_topics').all()).results).toEqual([]);
  expect((await db.prepare('SELECT epoch FROM card_search_state WHERE id=1').first<{ epoch: number }>())!.epoch).toBeGreaterThan(epoch);
});
