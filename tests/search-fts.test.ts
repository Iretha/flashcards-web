import { splitSql } from './sql';
import { readFileSync,readdirSync } from 'node:fs';
import { Miniflare,convertV4MiniflareOptions } from 'miniflare';
import { beforeAll,afterAll,it,expect } from 'vitest';
import { writeCards } from '../src/server/decks';
import { readMcp,cursorKey } from '../src/server/mcp-reads';
let runtime:Miniflare,db:D1Database;
const key=await cursorKey('fts-tests');
beforeAll(async()=>{
 runtime=new Miniflare(convertV4MiniflareOptions({modules:true,script:'export default {fetch(){return new Response("ok")}}',d1Databases:{DB:'fts-integration'}}));
 db=await runtime.getD1Database('DB') as unknown as D1Database;
 for(const file of readdirSync('migrations').filter(f=>f.endsWith('.sql')).sort()){
  const sql=readFileSync('migrations/'+file,'utf8');
  const statements=file==='0020_native_search.sql'?splitSql(sql):file==='0002_progress.sql'?[sql]:file==='0001_initial.sql'?sql.trim().split(/;\s*(?=CREATE (?:TABLE|INDEX|TRIGGER))/):(file==='0015_card_search_fts.sql'||file==='0016_fts_consistency_recovery.sql')?sql.trim().split(/;\s*(?=CREATE)/):sql.split(';').filter(s=>s.trim());
  await db.batch(statements.map(s=>db.prepare(s)));
 }

 await db.prepare("INSERT INTO users(id,username,username_key,created_at,last_login_at) VALUES('owner','owner','owner',0,0)").run();
 await db.prepare("INSERT INTO decks(id,owner_id,title,description,visibility,created_at,updated_at,third_party_access,mutation) VALUES('deck','owner','title','','PRIVATE',0,0,'READ','write')").run();
});
afterAll(async()=>runtime?.dispose());
const read=(args:unknown,user='owner')=>readMcp(db,user,'search_cards',args,key);
const card=(translations:Record<string,{question:string;answer:string}>)=>({id:'card',primary_language:'en',import_key:null,metadata:null,difficulty:null,interview_priority:null,translations});
it('synchronizes shared writes atomically, normalizes literals, and rolls back failed batches',async()=>{
 const original=card({en:{question:'xxJavaScript CAF\u00c9 a%b a_b a*b say "hello" foo bar',answer:'ab'},bg:{question:'\u0412\u042a\u041f\u0420\u041e\u0421',answer:'\u041e\u0422\u0413\u041e\u0412\u041e\u0420'}});
 await db.batch(writeCards(db,'deck','write',0,[original]));
 for(const query of ['jav','avas','caf\u00e9','a%b','a_b','a*b','"hello"','foo bar','\u0432\u044a\u043f','\u043e\u0442\u0433\u043e\u0432\u043e\u0440'])expect((await read({query})).items).toHaveLength(1);
 expect((await read({query:'ab\u0432'})).items).toHaveLength(0);
 expect((await read({query:'barab'})).items).toHaveLength(0);
 expect((await read({query:'jav'},'stranger')).items).toHaveLength(0);
 await expect(db.batch([...writeCards(db,'deck','write',1,[card({en:{question:'changed',answer:'changed'}})]),db.prepare("INSERT INTO users(id) VALUES('owner')")])).rejects.toThrow();
 expect((await read({query:'jav'})).items).toHaveLength(1);
 expect((await read({query:'changed'})).items).toHaveLength(0);
 await db.batch(writeCards(db,'deck','write',2,[card({en:{question:'new content',answer:'new answer'}})]));
 expect((await read({query:'jav'})).items).toHaveLength(0);
 expect((await read({query:'new'})).items).toHaveLength(1);
 await db.batch(writeCards(db,'deck','stale-mutation',3,[original]));
 expect((await read({query:'jav'})).items).toHaveLength(0);
});
it('rejects deterministic interleavings during readiness, matching and content retrieval',async()=>{
 for(const phase of ['matching','content']){
  await db.batch(writeCards(db,'deck','write',0,[card({en:{question:'race needle',answer:'before'}})]));
  let injected=false;
  const wrapped=new Proxy(db,{get(target,prop){
   if(prop!=='prepare'){const value=Reflect.get(target,prop);return typeof value==='function'?value.bind(target):value;}
   return (sql:string)=>{
    const wrap=(stmt:D1PreparedStatement):D1PreparedStatement=>new Proxy(stmt,{get(t,p){
     if(p==='bind')return (...args:unknown[])=>wrap(t.bind(...args));
     const value=Reflect.get(t,p);
     if(typeof value!=='function')return value;
     return async(...args:unknown[])=>{
      const result=await value.apply(t,args);
      const hit=phase==='readiness'?sql.includes('AS pending'):phase==='matching'?sql.includes('SELECT c.id, c.position'):sql.includes('c.translations,c.metadata');
      if(!injected&&hit){injected=true;await db.prepare("UPDATE cards SET translations=? WHERE id='card'").bind(JSON.stringify({en:{question:'race needle',answer:'after '+phase}})).run();}
      return result;
     };
    }});
    return wrap(target.prepare(sql));
   };
  }});
  await expect(readMcp(wrapped,'owner','search_cards',{query:'needle'},key)).rejects.toThrow('SEARCH_CHANGED');
  expect(injected).toBe(true);

 }
 await db.prepare("DELETE FROM cards WHERE id='card'").run();
});
it('searches beyond 5000 cards, handles no-match and deduplicates before keyset pagination',async()=>{
 const createStart=performance.now();
 await db.prepare(`WITH RECURSIVE n(i) AS (VALUES(0) UNION ALL SELECT i+1 FROM n WHERE i<5020)
 INSERT INTO cards(id,deck_id,stable_key,question_key,position,created_at,updated_at,translations)
 SELECT printf('large%05d',i),'deck',printf('k%d',i),printf('q%d',i),0,0,0,
 json_object('en',json_object('question',CASE WHEN i>=5000 THEN 'unique needle' ELSE 'common text' END,'answer','answer'),
 'bg',json_object('question',CASE WHEN i>=5000 THEN 'unique needle' ELSE 'common text' END,'answer','answer')) FROM n`).run();
 console.log('Trigger bulk creation ms',performance.now()-createStart);
 const repairStart=performance.now();
 await db.batch(splitSql(readFileSync('scripts/repair-search.sql','utf8')).map(sql=>db.prepare(sql)));
 console.log('Canonical repair 5021 cards ms',performance.now()-repairStart);
 const rows=(await db.prepare("SELECT id,translations FROM cards").all<{id:string;translations:string}>()).results;
 let after:string|null=null;const ids:unknown[]=[];const sizes:number[]=[];
 const start=performance.now();
 do{const page=await read({query:'needle',after});sizes.push(page.items!.length);ids.push(...page.items!.map(i=>i.card_id));after=page.next_after??null;}while(after);
 expect(sizes).toEqual([10,10,1]);expect(new Set(ids).size).toBe(21);
 const noMatchStart=performance.now();expect((await read({query:'nonexistent'})).items).toHaveLength(0);
 console.log('FTS local benchmark',{cards:rows.length,translations:rows.length*2,threePagesMs:noMatchStart-start,noMatchMs:performance.now()-noMatchStart});
 const plans=(await db.prepare('EXPLAIN QUERY PLAN SELECT card_id FROM card_search WHERE card_search MATCH ?').bind('"needle"').all()).results;
 expect(JSON.stringify(plans)).toContain('M');
 const subset=rows.slice(0,1000).map(r=>({id:r.id,translations:JSON.parse(r.translations)}));
 for(const c of subset)c.translations.en.answer='bulk edit';
 const updateStart=performance.now();
 await db.batch([
  db.prepare("UPDATE cards SET translations=json_set(translations,'$.en.answer','bulk edit') WHERE id IN (SELECT value FROM json_each(?))").bind(JSON.stringify(subset.map(c=>c.id)))
 ]);
 const deletePlan=(await db.prepare('EXPLAIN QUERY PLAN DELETE FROM card_search WHERE rowid IN (SELECT id FROM card_search_keys WHERE card_id=?)').bind(rows[0].id).all()).results;
 expect(JSON.stringify(deletePlan)).toContain('card_search_keys');
 expect(JSON.stringify(deletePlan)).toContain('INDEX 0:=');
 expect(JSON.stringify(deletePlan)).toContain('COVERING INDEX');
 const deleteStart=performance.now();
 await db.prepare("DELETE FROM decks WHERE id='deck'").run();
 console.log('FTS maintenance benchmark',{bulkCards:subset.length,bulkUpdateMs:deleteStart-updateStart,deckDeleteMs:performance.now()-deleteStart,deletePlan});
 expect((await db.prepare('SELECT * FROM card_search').all()).results).toHaveLength(0);
 expect((await db.prepare('SELECT * FROM card_search_keys').all()).results).toHaveLength(0);

},30000);

it('indexes multilingual coding task details across create/update/clear/delete',async()=>{
 await db.prepare("INSERT INTO decks(id,owner_id,title,description,visibility,created_at,updated_at,third_party_access,mutation) VALUES('deck','owner','title','','PRIVATE',0,0,'READ','write')").run();
 const id='detail-card';
 const value={...card({en:{question:'Prompt',answer:''}}),id,translations:{en:{question:'Prompt',answer:'',questionDetails:'distinctTaskIdentifier'},bg:{question:'Task',answer:'',questionDetails:'multilingualTaskIdentifier'}}};
 await db.batch(writeCards(db,'deck','write',1,[value]));
 expect((await read({query:'distinctTaskIdentifier'})).items?.some(x=>x.card_id===id)).toBe(true);
 expect((await read({query:'multilingualTaskIdentifier'})).items?.some(x=>x.card_id===id)).toBe(true);
 value.translations.en.questionDetails='replacementTaskIdentifier';await db.batch(writeCards(db,'deck','write',2,[value]));
 expect((await read({query:'distinctTaskIdentifier'})).items).toHaveLength(0);
 expect((await read({query:'replacementTaskIdentifier'})).items).toHaveLength(1);
 value.translations.en.questionDetails='';await db.batch(writeCards(db,'deck','write',3,[value]));
 expect((await read({query:'replacementTaskIdentifier'})).items).toHaveLength(0);
 await db.prepare('DELETE FROM cards WHERE id=?').bind(id).run();
 expect((await read({query:'multilingualTaskIdentifier'})).items).toHaveLength(0);

});

it('rejects short code-point queries and allows empty listing',async()=>{
 for(const query of ['a','ab','\u{1f600}','\u{1f600}\u{1f600}']) await expect(read({query})).rejects.toThrow();
 expect((await read({query:'abc'})).items).toEqual([]);
 expect((await read({query:'\u{1f600}\u{1f600}\u{1f600}'})).items).toEqual([]);
 expect(await read({query:'',deck_id:'deck'})).toHaveProperty('items');
 expect(await read({deck_id:'deck'})).toHaveProperty('items');
});
it('repairs missing, stale and orphan content repeatedly from canonical JSON',async()=>{
 await db.batch(writeCards(db,'deck','write',0,[card({en:{question:'Repair needle',answer:''},de:{question:'Stra?e caf?',answer:'Antwort'}})]));
 const before=(await db.prepare('SELECT * FROM cards').all()).results;
 const repair=()=>db.batch(splitSql(readFileSync('scripts/repair-search.sql','utf8')).map(sql=>db.prepare(sql)));
 for(let i=0;i<2;i++){
  await db.prepare('DELETE FROM card_search').run();
  await db.prepare("INSERT INTO card_search(card_id,language,question,answer) VALUES('orphan','en','stale','stale')").run();
  await repair();
  expect((await read({query:'needle'})).items).toHaveLength(1);
  expect((await db.prepare('SELECT * FROM cards').all()).results).toEqual(before);
  expect((await db.prepare('SELECT count(*) AS n FROM card_search').first())?.n).toBe(2);
  expect((await db.prepare('PRAGMA foreign_key_check').all()).results).toEqual([]);
 }
 await db.prepare("CREATE TRIGGER deliberate_failure BEFORE INSERT ON card_search_keys BEGIN SELECT RAISE(ABORT,'test failure'); END").run();
 await expect(db.prepare("UPDATE cards SET translations='{}' WHERE id='card'").run()).resolves.toBeDefined();
 await expect(db.prepare("UPDATE cards SET translations=? WHERE id='card'").bind(JSON.stringify({en:{question:'failed write',answer:''}})).run()).rejects.toThrow();
 expect((await db.prepare("SELECT translations FROM cards WHERE id='card'").first())?.translations).toBe('{}');
 await db.prepare('DROP TRIGGER deliberate_failure').run();
});

it('uses native multilingual case folding without composition or sharp-S expansion',async()=>{
 await db.prepare("UPDATE cards SET translations=? WHERE id='card'").bind(JSON.stringify({en:{question:'CAF\u00c9 Stra\u00dfe \u0395\u03bb\u03bb\u03b7\u03bd\u03b9\u03ba\u03ac FRAN\u00c7AIS \u0130stanbul \u6771\u4eac\u65e5\u672c\u8a9e \u0412\u042a\u041f\u0420\u041e\u0421 JavaScript',answer:'answer'}})).run();
 for(const query of ['caf\u00e9','stra\u00dfe','\u03b5\u03bb\u03bb\u03b7\u03bd','fran\u00e7ais','\u6771\u4eac\u65e5','\u0432\u044a\u043f\u0440\u043e\u0441','script']) expect((await read({query})).items).toHaveLength(1);
 for(const query of ['cafe\u0301','strasse']) expect((await read({query})).items).toHaveLength(0);
});
