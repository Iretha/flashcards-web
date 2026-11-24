import { splitSql } from './sql';
import { readFileSync, readdirSync } from 'node:fs';
import { Miniflare, convertV4MiniflareOptions } from 'miniflare';
import { expect, it } from 'vitest';
import { derivedMetadata } from '../src/lib/metadata';

function statements(file: string) {
 const sql = readFileSync('migrations/'+file,'utf8');
 return file==='0020_native_search.sql'?splitSql(sql):file==='0002_progress.sql' ? [sql] : file==='0001_initial.sql' ? sql.trim().split(/;\s*(?=CREATE (?:TABLE|INDEX|TRIGGER))/) : ['0015_card_search_fts.sql','0016_fts_consistency_recovery.sql'].includes(file) ? sql.trim().split(/;\s*(?=CREATE)/) : sql.split(';').filter(s=>s.trim());
}
async function database() {
 const runtime = new Miniflare(convertV4MiniflareOptions({modules:true,script:'export default {fetch(){return new Response("ok")}}',d1Databases:{DB:'migration'}}));
 const db = await runtime.getD1Database('DB') as unknown as D1Database;
 for(const f of readdirSync('migrations').filter(f=>f.endsWith('.sql')&&f<'0018').sort()) await db.batch(statements(f).map(s=>db.prepare(s)));
 await db.prepare("INSERT INTO users(id,username,username_key,created_at,last_login_at) VALUES('owner','owner','owner',0,0)").run();
 await db.prepare("INSERT INTO decks(id,owner_id,source_key,title,description,visibility,created_at,updated_at,primaryLanguage,supportedLanguages,revision,third_party_access) VALUES('deck','owner','portable','Title','','SHARED',1,2,'en','[\"en\",\"de\"]',7,'READ_WRITE')").run();
 return {runtime,db};
}
it('upgrades populated content without rebuilding identities, progress, history, permissions or cycle state',async()=>{
 const {runtime,db}=await database();
 try {
 const translations={en:{question:'Canonical question',answer:'',questionDetails:'Code',simple:'discard',example:'discard',details:'discard'},de:{question:'Frage',answer:'Antwort'}};
 const metadata={cardType:'question',topic:'Test',occurrenceCount:99,provenance:{type:'mixed',sources:[{sourceName:'Source',sourceUrl:'https://example.com',occurrenceId:'same'},{sourceName:'Repost',sourceUrl:'https://example.com/repost',occurrenceId:'same'}]}};
 await db.prepare("INSERT INTO cards(id,deck_id,stable_key,question_key,question,answer,position,created_at,updated_at,import_key,translations,metadata) VALUES('card','deck','historical-key','canonical question','Stale root','Do not restore',3,1,2,'portable-card',?,?)").bind(JSON.stringify(translations),JSON.stringify(metadata)).run();
 await db.prepare("INSERT INTO study_events VALUES('event','owner','session','card','deck','LEARNED',3)").run();
 await db.prepare("UPDATE card_progress SET simple_opens=4,example_opens=5,details_opens=6 WHERE card_id='card'").run();
 await db.prepare("INSERT INTO users(id,username,username_key,created_at,last_login_at) VALUES('editor','editor','editor',0,0)").run();
 await db.prepare("INSERT INTO deck_collaborators VALUES('deck','editor',0,'owner')").run();
 for(const kind of ['SHOWN','REPEAT','TIMEOUT','RESET']) await db.prepare("INSERT INTO study_events VALUES(?,'owner','session','card','deck',?,4)").bind(kind,kind).run();
 const members=(await db.prepare('SELECT * FROM deck_collaborators').all()).results;
 const state={queue:[{id:'card',failed:9,visits:4}],history:['card'],cursor:0,current:'card',revealed:true,deadline:null,remainingMs:null,explanation:'simple',cycles:{cards:['card'],cycle:0,pending:[],repeat:[],history:['card'],cursor:0,complete:false}};
 await db.prepare("INSERT INTO study_sessions VALUES('session','owner','[\"deck\"]','SEQUENTIAL',0,30,'card',?,'ACTIVE',9,NULL,1,2)").bind(JSON.stringify(state)).run();
 const schemaBefore=(await db.prepare("SELECT name FROM sqlite_master WHERE type IN ('index','trigger') AND sql IS NOT NULL ORDER BY name").all()).results;
 const progress=await db.prepare('SELECT user_id,card_id,status,times_shown,times_failed,times_learned,last_shown_at,last_learned_at FROM card_progress').all();
 const events=await db.prepare('SELECT * FROM study_events').all();
 const deck=await db.prepare('SELECT * FROM decks').all();
 await db.batch(statements('0018_canonical_content.sql').map(s=>db.prepare(s)));
 const card=await db.prepare('SELECT * FROM cards').first<any>();
 expect(card).not.toHaveProperty('question');expect(card).not.toHaveProperty('answer');
 expect(card).toMatchObject({id:'card',stable_key:'historical-key',question_key:'canonical question',import_key:'portable-card',position:3});
 const {simple:_s,example:_e,details:_d,...canonical}=translations.en;
 expect(JSON.parse(card.translations)).toEqual({...translations,en:canonical});
 expect(JSON.parse(card.metadata)).not.toHaveProperty('occurrenceCount');
 expect(derivedMetadata(JSON.parse(card.metadata))?.occurrenceCount).toBe(1);
 expect((await db.prepare('SELECT user_id,card_id,status,times_shown,times_failed,times_learned,last_shown_at,last_learned_at FROM card_progress').all()).results).toEqual(progress.results);
 expect((await db.prepare('SELECT * FROM study_events').all()).results).toEqual(events.results);
 expect((await db.prepare('SELECT * FROM decks').all()).results).toEqual(deck.results);
 expect((await db.prepare('SELECT * FROM deck_collaborators').all()).results).toEqual(members);
 expect((await db.prepare("SELECT name FROM sqlite_master WHERE type IN ('index','trigger') AND sql IS NOT NULL ORDER BY name").all()).results).toEqual(schemaBefore);
 const session=await db.prepare('SELECT * FROM study_sessions').first<any>();
 expect(session.status).toBe('ACTIVE');expect(session.version).toBe(9);
 expect(JSON.parse(session.session_state)).toEqual({...state,explanation:undefined,queue:[{id:'card'}]});
 expect((await db.prepare('PRAGMA foreign_key_check').all()).results).toEqual([]);
 await db.batch(statements('0019_search_details.sql').map(s=>db.prepare(s)));
 const canonicalBefore=(await db.prepare('SELECT * FROM cards').all()).results;
 const migrationStart=performance.now();
 await db.batch(statements('0020_native_search.sql').map(s=>db.prepare(s)));
 console.log('Populated native migration ms',performance.now()-migrationStart);
 expect((await db.prepare('SELECT * FROM cards').all()).results).toEqual(canonicalBefore);
 expect((await db.prepare('SELECT * FROM study_events').all()).results).toEqual(events.results);
 expect((await db.prepare('SELECT * FROM deck_collaborators').all()).results).toEqual(members);
 expect((await db.prepare('SELECT count(*) AS n FROM card_search').first())?.n).toBe(2);
 expect((await db.prepare("SELECT name FROM sqlite_master WHERE name IN ('card_search_rows','card_search_ready')").all()).results).toEqual([]);
 expect((await db.prepare('PRAGMA foreign_key_check').all()).results).toEqual([]);
 }finally{await runtime.dispose()}
});
it.each([{}, {en:{question:'Valid',answer:''}}])('recovers only absent primary content and preserves empty answers',async translations=>{
 const {runtime,db}=await database();try{
 await db.prepare("INSERT INTO cards(id,deck_id,stable_key,question_key,question,answer,position,created_at,updated_at,translations) VALUES('card','deck','key','valid','Recovered','Root answer',0,0,0,?)").bind(JSON.stringify(translations)).run();
 await db.batch(statements('0018_canonical_content.sql').map(s=>db.prepare(s)));
 const row=await db.prepare('SELECT translations FROM cards').first<{translations:string}>();
 expect(JSON.parse(row!.translations).en).toEqual('en' in translations?translations.en:{question:'Recovered',answer:'Root answer'});
 }finally{await runtime.dispose()}
});
it('fails atomically on irreconcilable content',async()=>{
 const {runtime,db}=await database();try{
 await db.prepare("INSERT INTO cards(id,deck_id,stable_key,question_key,question,answer,position,created_at,updated_at,translations) VALUES('bad','deck','key','q','Root','Root',0,0,0,?)").bind(JSON.stringify({en:{question:42,answer:'Keep'}})).run();
 await expect(db.batch(statements('0018_canonical_content.sql').map(s=>db.prepare(s)))).rejects.toThrow();
 expect(await db.prepare('SELECT question,answer FROM cards').first()).toEqual({question:'Root',answer:'Root'});
 }finally{await runtime.dispose()}
});

it('rolls back a failed native schema migration batch locally',async()=>{
 const {runtime,db}=await database();try{
 for(const file of ['0018_canonical_content.sql','0019_search_details.sql']) await db.batch(statements(file).map(sql=>db.prepare(sql)));
 const before=(await db.prepare("SELECT name,sql FROM sqlite_master ORDER BY name").all()).results;
 await expect(db.batch([...statements('0020_native_search.sql').map(sql=>db.prepare(sql)),db.prepare('INSERT INTO nonexistent_table VALUES(1)')])).rejects.toThrow();
 expect((await db.prepare("SELECT name,sql FROM sqlite_master ORDER BY name").all()).results).toEqual(before);
 }finally{await runtime.dispose()}
});
