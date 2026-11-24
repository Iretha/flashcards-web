import { readFileSync,readdirSync } from 'node:fs';
import { Miniflare,convertV4MiniflareOptions } from 'miniflare';
import { beforeAll,afterAll,it,expect } from 'vitest';
import { backfillSearch,indexCards,normalizeSearch,beginSearchRebuild,verifySearch } from '../src/lib/search';
import { writeCards } from '../src/server/decks';
import { readMcp,cursorKey } from '../src/server/mcp-reads';
let runtime:Miniflare,db:D1Database;
const key=await cursorKey('fts-tests');
beforeAll(async()=>{
 runtime=new Miniflare(convertV4MiniflareOptions({modules:true,script:'export default {fetch(){return new Response("ok")}}',d1Databases:{DB:'fts-integration'}}));
 db=await runtime.getD1Database('DB') as unknown as D1Database;
 for(const file of readdirSync('migrations').filter(f=>f.endsWith('.sql')).sort()){
  const sql=readFileSync('migrations/'+file,'utf8');
  const statements=file==='0002_progress.sql'?[sql]:file==='0001_initial.sql'?sql.trim().split(/;\s*(?=CREATE (?:TABLE|INDEX|TRIGGER))/):(file==='0015_card_search_fts.sql'||file==='0016_fts_consistency_recovery.sql')?sql.trim().split(/;\s*(?=CREATE)/):sql.split(';').filter(s=>s.trim());
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
 for(const query of ['j','ja','jav','avas','cafe\u0301','a%b','a_b','a*b','"hello"','foo bar','%','_','*','\u0432','\u0432\u044a','\u0432\u044a\u043f','\u043e\u0442\u0433\u043e\u0432\u043e\u0440'])expect((await read({query})).items).toHaveLength(1);
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
it('invalidates raw translation edits and completes restartable backfill without changing source',async()=>{
 const source=JSON.stringify({en:{question:'legacy final',answer:'answer'}},null,2);
 await db.prepare("UPDATE cards SET translations=? WHERE id='card'").bind(source).run();
 await expect(read({query:'legacy'})).rejects.toThrow('SEARCH_NOT_READY');
 expect((await db.prepare("SELECT * FROM card_search WHERE card_id='card'").all()).results).toHaveLength(0);
 expect(await backfillSearch(db)).toBe(1);
 expect(await backfillSearch(db)).toBe(0);
 expect((await db.prepare("SELECT translations FROM cards WHERE id='card'").first<{translations:string}>())?.translations).toBe(source);
 expect((await read({query:'legacy'})).items).toHaveLength(1);
 await db.prepare("DELETE FROM cards WHERE id='card'").run();
 expect((await db.prepare('SELECT * FROM card_search').all()).results).toHaveLength(0);
 expect((await db.prepare('SELECT * FROM card_search_ready').all()).results).toHaveLength(0);
});

it('rejects deterministic interleavings during readiness, matching and content retrieval',async()=>{
 for(const phase of ['readiness','matching','content']){
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
  await backfillSearch(db);
 }
 await db.prepare("DELETE FROM cards WHERE id='card'").run();
});
it('rebuilds missing FTS rows despite surviving markers and resumes interrupted recovery',async()=>{
 await db.batch(writeCards(db,'deck','write',0,[card({en:{question:'recover needle',answer:'answer'}})]));
 await db.prepare("DELETE FROM card_search WHERE card_id='card'").run();
 await expect(verifySearch(db)).rejects.toThrow('verification failed');
 await expect(read({query:'needle'})).rejects.toThrow('SEARCH_NOT_READY');
 await beginSearchRebuild(db);
 const token=(await db.prepare('SELECT token FROM card_search_state').first<{token:string}>())!.token;
 await db.batch(indexCards(db,[card({en:{question:'recover needle',answer:'answer'}})],'1',[]));
 await expect(read({query:'needle'})).rejects.toThrow('SEARCH_NOT_READY');
 await beginSearchRebuild(db);
 expect((await db.prepare('SELECT token FROM card_search_state').first<{token:string}>())!.token).toBe(token);
 expect(await backfillSearch(db)).toBe(0);
 expect((await read({query:'needle'})).items).toHaveLength(1);
 await db.prepare("UPDATE card_search_ready SET version=0 WHERE card_id='card'").run();
 await expect(read({query:'needle'})).rejects.toThrow('SEARCH_NOT_READY');
 await backfillSearch(db);
 await db.prepare("UPDATE card_search SET answer='corrupt' WHERE card_id='card'").run();
 await expect(verifySearch(db)).rejects.toThrow('verification failed');
 await beginSearchRebuild(db);await backfillSearch(db);
 await db.prepare("INSERT INTO card_search(card_id,language,question,answer) VALUES('orphan','en','orphan','orphan')").run();
 await expect(verifySearch(db)).rejects.toThrow('orphan');
 await beginSearchRebuild(db);await backfillSearch(db);
 await db.prepare("DELETE FROM cards WHERE id='card'").run();
});

it('rejects verification races and retries a backfill source-CAS miss',async()=>{
 await db.batch(writeCards(db,'deck','write',0,[card({en:{question:'before verify',answer:'answer'}})]));
 let once=false;
 const verificationDb=new Proxy(db,{get(target,prop){
  if(prop!=='prepare'){const value=Reflect.get(target,prop);return typeof value==='function'?value.bind(target):value;}
  return (sql:string)=>{const stmt=target.prepare(sql);if(!sql.includes("UPDATE card_search_state SET mode='ready'"))return stmt;
   return {bind:(...args:unknown[])=>({all:async()=>{await db.prepare("UPDATE decks SET updated_at=updated_at+1 WHERE id='deck'").run();return stmt.bind(...args).all();}})} as D1PreparedStatement;
  };
 }});
 await expect(verifySearch(verificationDb)).rejects.toThrow('changed during verification');
 await expect(read({query:'before'})).rejects.toThrow('SEARCH_NOT_READY');
 await beginSearchRebuild(db);
 const racingDb=new Proxy(db,{get(target,prop){
  if(prop==='batch')return async(statements:D1PreparedStatement[])=>{
   if(!once){once=true;await db.prepare("UPDATE cards SET translations=? WHERE id='card'").bind(JSON.stringify({en:{question:'after CAS race',answer:'answer'}})).run();}
   return target.batch(statements);
  };
  const value=Reflect.get(target,prop);return typeof value==='function'?value.bind(target):value;
 }});
 await expect(backfillSearch(racingDb)).rejects.toThrow('incomplete');
 await expect(read({query:'after'})).rejects.toThrow('SEARCH_NOT_READY');
 expect(await backfillSearch(db)).toBe(1);
 expect((await read({query:'after'})).items).toHaveLength(1);
 await db.prepare("DELETE FROM cards WHERE id='card'").run();
});
it('searches beyond 5000 cards, handles no-match and deduplicates before keyset pagination',async()=>{
 await db.prepare(`WITH RECURSIVE n(i) AS (VALUES(0) UNION ALL SELECT i+1 FROM n WHERE i<5020)
 INSERT INTO cards(id,deck_id,stable_key,question_key,position,created_at,updated_at,translations)
 SELECT printf('large%05d',i),'deck',printf('k%d',i),printf('q%d',i),0,0,0,
 json_object('en',json_object('question',CASE WHEN i>=5000 THEN 'unique needle' ELSE 'common text' END,'answer','answer'),
 'bg',json_object('question',CASE WHEN i>=5000 THEN 'unique needle' ELSE 'common text' END,'answer','answer')) FROM n`).run();
 const rows=(await db.prepare("SELECT id,translations FROM cards").all<{id:string;translations:string}>()).results;
 for(let i=0;i<rows.length;i+=100) await db.batch(indexCards(db,rows.slice(i,i+100).map(r=>({id:r.id,translations:JSON.parse(r.translations)})),'1',[]));
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
  db.prepare("UPDATE cards SET translations=json_set(translations,'$.en.answer','bulk edit') WHERE id IN (SELECT value FROM json_each(?))").bind(JSON.stringify(subset.map(c=>c.id))),
  ...indexCards(db,subset,'1',[])
 ]);
 const deletePlan=(await db.prepare('EXPLAIN QUERY PLAN DELETE FROM card_search WHERE rowid IN (SELECT id FROM card_search_rows WHERE card_id=?)').bind(rows[0].id).all()).results;
 expect(JSON.stringify(deletePlan)).toContain('card_search_rows');
 expect(JSON.stringify(deletePlan)).toContain('INDEX 0:=');
 expect(JSON.stringify(deletePlan)).toContain('COVERING INDEX');
 const deleteStart=performance.now();
 await db.prepare("DELETE FROM decks WHERE id='deck'").run();
 console.log('FTS maintenance benchmark',{bulkCards:subset.length,bulkUpdateMs:deleteStart-updateStart,deckDeleteMs:performance.now()-deleteStart,deletePlan});
 expect((await db.prepare('SELECT * FROM card_search').all()).results).toHaveLength(0);
 expect((await db.prepare('SELECT * FROM card_search_ready').all()).results).toHaveLength(0);
 expect(normalizeSearch('\u0412')).toBe('\u0432');
},30000);
