// Shared locale-independent mapping, not the formal Unicode CaseFolding algorithm.
export const normalizeSearch = (value: string) => value.normalize('NFC').toUpperCase().toLowerCase().normalize('NFC');
export const quoteSearch = (value: string) => '"' + value.replaceAll('"', '""') + '"';
export const SEARCH_VERSION = 1;
type SearchCard = { id: string; source?: string; translations: Record<string, { question: string; answer: string }> };

// Caller must include these statements in the same D1 batch as the content write.
// The source comparison also guards backfill against concurrent edits/deletions.
export function indexCards(db: Pick<D1Database, 'prepare'>, cards: SearchCard[], guard: string, args: (string | number)[]) {
  const payload = JSON.stringify(cards.map(card => ({ id: card.id, source: card.source ?? JSON.stringify(card.translations),
    translations: Object.fromEntries(Object.entries(card.translations).map(([language,t]) =>
      [language,{question: normalizeSearch(t.question),answer: normalizeSearch(t.answer)}])) })));
  const eligible = `SELECT c.id FROM cards c JOIN json_each(?1) input ON c.id=input.value->>'id'
    WHERE c.translations=input.value->>'source' AND (${guard})`;
  return [
    db.prepare(`DELETE FROM card_search_rows WHERE card_id IN (${eligible})`).bind(payload,...args),
    db.prepare(`INSERT INTO card_search_rows(card_id,language,question,answer)
      SELECT c.id,t.key,t.value->>'question',t.value->>'answer'
      FROM cards c JOIN json_each(?1) input ON c.id=input.value->>'id', json_each(input.value,'$.translations') t
      WHERE c.translations=input.value->>'source' AND (${guard})`).bind(payload,...args),
    db.prepare(`INSERT INTO card_search_ready(card_id,version) SELECT id,1 FROM (${eligible}) WHERE 1 ON CONFLICT(card_id) DO UPDATE SET version=1 RETURNING card_id`).bind(payload,...args),
  ];
}

export async function backfillSearch(db: Pick<D1Database, 'prepare' | 'batch'>) {
  let after = '';
  let indexed = 0;
  for (;;) {
    const rows = (await db.prepare(`SELECT id,translations FROM cards c WHERE id>? AND
      NOT EXISTS(SELECT 1 FROM card_search_ready r WHERE r.card_id=c.id AND r.version=1) ORDER BY id LIMIT 20`)
      .bind(after).all<{id:string;translations:string}>()).results;
    if (!rows.length) break;
    for (const row of rows) {
      const card = {id:row.id,source:row.translations,translations:JSON.parse(row.translations)};
      const results = await db.batch(indexCards(db,[card],'1',[]));
      indexed += results[2].results.length;
      after = row.id;
    }
  }
  const pending = await db.prepare(`SELECT count(*) AS count FROM cards c WHERE NOT EXISTS
    (SELECT 1 FROM card_search_ready r WHERE r.card_id=c.id AND r.version=1)`).first<{count:number}>();
  if (pending?.count) throw new Error('Search backfill incomplete; rerun after concurrent writers finish.');
  await verifySearch(db);
  return indexed;
}

// Starting again resumes an interrupted rebuild rather than clearing its progress.
export async function beginSearchRebuild(db: Pick<D1Database,'prepare'|'batch'>) {
  const token=crypto.randomUUID();
  const guard="EXISTS(SELECT 1 FROM card_search_state WHERE id=1 AND token=?1)";
  await db.batch([
    db.prepare("UPDATE card_search_state SET mode='rebuilding',version=1,token=?,epoch=epoch+1 WHERE id=1 AND mode<>'rebuilding'").bind(token),
    db.prepare(`DELETE FROM card_search_ready WHERE ${guard}`).bind(token),
    db.prepare(`DELETE FROM card_search_rows WHERE ${guard}`).bind(token),
    // Clears unmapped orphan rows too; required for recovery of a corrupted index.
    db.prepare(`DELETE FROM card_search WHERE ${guard}`).bind(token),
  ]);
}

export async function verifySearch(db: Pick<D1Database,'prepare'|'batch'>) {
  try { await verifySearchSnapshot(db); } catch(error) {
    await db.prepare("UPDATE card_search_state SET mode='blocked',epoch=epoch+1 WHERE id=1").run();
    throw error;
  }
}

async function verifySearchSnapshot(db: Pick<D1Database,'prepare'|'batch'>) {
  const before=await db.prepare('SELECT epoch,version FROM card_search_state WHERE id=1').first<{epoch:number;version:number}>();
  if(before?.version!==SEARCH_VERSION) throw new Error('Unsupported search version');
  let after='';
  for(;;){
    const rows=(await db.prepare('SELECT id,translations FROM cards WHERE id>? ORDER BY id LIMIT 20').bind(after).all<{id:string;translations:string}>()).results;
    if(!rows.length)break;
    const ids=JSON.stringify(rows.map(r=>r.id));
    const indexed=(await db.prepare(`SELECT m.card_id,m.language,m.question,m.answer,f.rowid AS fts_id,
      f.question AS fts_question,f.answer AS fts_answer,f.card_id AS fts_card,f.language AS fts_language
      FROM card_search_rows m LEFT JOIN card_search f ON f.rowid=m.id
      WHERE m.card_id IN (SELECT value FROM json_each(?)) ORDER BY m.card_id,m.language`).bind(ids).all()).results;
    const ready=new Set((await db.prepare('SELECT card_id FROM card_search_ready WHERE version=1 AND card_id IN (SELECT value FROM json_each(?))').bind(ids).all<{card_id:string}>()).results.map(r=>r.card_id));
    for(const card of rows){
      const actual=indexed.filter(r=>r.card_id===card.id);
      const expected=Object.entries(JSON.parse(card.translations) as SearchCard['translations']).map(([language,t])=>({language,question:normalizeSearch(t.question),answer:normalizeSearch(t.answer)})).sort((a,b)=>a.language<b.language?-1:a.language>b.language?1:0);
      if(actual.length!==expected.length || actual.some((r,i)=>r.language!==expected[i].language || r.question!==expected[i].question || r.answer!==expected[i].answer || r.fts_id==null || r.fts_question!==r.question || r.fts_answer!==r.answer || r.fts_card!==card.id || r.fts_language!==r.language))throw new Error('Search verification failed: '+card.id);
      if(!ready.has(card.id))throw new Error('Search verification failed: pending card');
      after=card.id;
    }
  }

  const orphan=await db.prepare('SELECT 1 FROM card_search f LEFT JOIN card_search_rows m ON m.id=f.rowid WHERE m.id IS NULL LIMIT 1').first();
  if(orphan)throw new Error('Search verification failed: orphan FTS row');
  await db.prepare("INSERT INTO card_search(card_search) VALUES('integrity-check')").run();
  // CAS activation: verification is discarded if any relevant write occurred.
  const result=await db.prepare("UPDATE card_search_state SET mode='ready',token=NULL,epoch=epoch+1 WHERE id=1 AND epoch=? AND version=? RETURNING id").bind(before.epoch,SEARCH_VERSION).all();
  if(!result.results.length)throw new Error('Search changed during verification; retry');
}
