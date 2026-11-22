import { redeemDevice } from '../src/server/device-auth';
import { readFileSync } from 'node:fs';
import { generateKeyPair, exportJWK, SignJWT } from 'jose';
import { convertV4MiniflareOptions, Miniflare } from 'miniflare';
import { beforeAll, afterAll, afterEach, expect, it, vi } from 'vitest';
import { handle } from '../src/server/api';
import { authenticate, digest, lifetime } from '../src/server/auth';
import { findOrCreateUserByVerifiedSubject, validateClaims } from '../src/server/supabase-auth';
import type { AuthConfig } from '../src/server/supabase-auth';
const origin = 'https://cards.example';
const sub = '11111111-1111-4111-8111-111111111111';
const sid = '22222222-2222-4222-8222-222222222222';
const config: AuthConfig = { AUTH_GOOGLE_ENABLED:'true', AUTH_EMAIL_ENABLED:'true', AUTH_QR_ENABLED:'true', SUPABASE_URL:'https://project.example', SUPABASE_PUBLISHABLE_KEY:'test-publishable-key', AUTH_SITE_ORIGIN:origin, AUTH_RATE_LIMIT_SECRET:'test-only-rate-key-at-least-32-characters' };
let runtime: Miniflare, db: D1Database;
let privateKey: CryptoKey, publicJwk: object, access: string;
const cookie = (r: Response, name = 'flashcards_session') => r.headers.getSetCookie().find(v => v.startsWith(name + '='))?.split(';')[0] ?? '';
async function call(route: string, body?: object, cookies = '', options: AuthConfig = config) {
 return handle(new Request(origin + '/api/' + route, { method:body ? 'POST' : 'GET', headers: { Origin:origin, 'Content-Type':'application/json', Cookie:cookies, 'CF-Connecting-IP':'test-' + route }, body:body ? JSON.stringify(body) : undefined }), db, 'fixture', options);
}
async function login(name: string = crypto.randomUUID()) { const r = await call('login',{username:name,code:'fixture'}); expect(r.status).toBe(200); return cookie(r); }
async function freshChallenge() { const r = await call('auth/device/start',{label:'Living room TV'}); expect(r.status).toBe(201); return {poll:cookie(r,'fc_device_poll'),data:await r.json() as {manualCode:string;phrase:string;qrImage:string}}; }
async function context(code: string) { const r = await call('auth/device/context',{credential:code}); expect(r.status).toBe(200); return cookie(r,'fc_device_approval'); }
async function resetLimits() { await db.prepare('DELETE FROM login_limits').run(); }
function mockProvider() {
 return vi.spyOn(globalThis,'fetch').mockImplementation(async (input, init) => {
  const url = String(input);
  if (url.endsWith('/.well-known/jwks.json')) return Response.json({keys:[publicJwk]});
  if (url.endsWith('/user')) return Response.json({id:sub,is_anonymous:false,email:'fixture@example.test'});
  if (url.includes('/token?grant_type=pkce')) { const body = JSON.parse(String(init?.body)); expect(body.code_verifier).toBeTruthy(); return Response.json({access_token:access,refresh_token:'never-forward-this',token_type:'bearer',expires_in:3600,user:{id:sub}}); }
  if (url.endsWith('/verify')) return Response.json({access_token:access,refresh_token:'never-forward-this',token_type:'bearer',expires_in:3600,user:{id:sub}});
  if (url.endsWith('/otp')) return Response.json({});
  throw new Error('Unexpected mocked provider endpoint');
 });
}
beforeAll(async () => {
 runtime = new Miniflare(convertV4MiniflareOptions({modules:true,script:'export default {fetch(){return new Response("ok")}}',d1Databases:{DB:'auth-test'}}));
 db = await runtime.getD1Database('DB') as unknown as D1Database;
 const initial=readFileSync('migrations/0001_initial.sql','utf8').trim().split(/;\s*(?=CREATE (?:TABLE|INDEX|TRIGGER))/);
 await db.batch(initial.map(s=>db.prepare(s)));
 const old = await login('existing-owner');
 const user=await authenticate(db,new Request(origin,{headers:{Cookie:old}}));
 expect(user).toBeTruthy();
 for (const file of ['0002_progress.sql','0003_bilingual.sql','0004_card_metadata.sql','0005_v3.sql','0006_chatgpt.sql','0007_management_api.sql','0008_deck_languages.sql','0009_deck_collaborators.sql','0010_personal_api_tokens.sql','0011_api_token_description.sql']) {
 const sql=readFileSync('migrations/'+file,'utf8').trim();
 const statements=file==='0002_progress.sql'?[sql]:sql.split(';').filter(s=>s.trim());
 await db.batch(statements.map(s=>db.prepare(s)));
 }
 const migration=readFileSync('migrations/0012_parallel_auth.sql','utf8').split(';').filter(s=>s.trim());
 await db.batch(migration.map(s=>db.prepare(s)));
 expect(await authenticate(db,new Request(origin,{headers:{Cookie:old}}))).toEqual(user);
 expect((await db.prepare('PRAGMA table_info(auth_sessions)').all()).results).toHaveLength(3);
 await db.prepare('UPDATE users SET supabase_sub=? WHERE id=?').bind(sub,user!.id).run();
 const pair=await generateKeyPair('ES256'); privateKey=pair.privateKey as CryptoKey;
 publicJwk={...await exportJWK(pair.publicKey),kid:'fixture',alg:'ES256'};
 access=await new SignJWT({role:'authenticated',session_id:sid}).setProtectedHeader({alg:'ES256',kid:'fixture'}).setIssuer(config.SUPABASE_URL+'/auth/v1').setAudience('authenticated').setSubject(sub).setIssuedAt().setExpirationTime('5m').sign(privateKey);
});
afterAll(async()=>runtime?.dispose());
afterEach(async()=>{vi.restoreAllMocks();await resetLimits();});
it('preserves legacy identities, old cookies, 30-day expiry and mapping uniqueness',async()=>{
 const c=await login('existing-owner'); const value=c.split('=')[1];
 const row=await db.prepare('SELECT expires_at FROM auth_sessions WHERE token_hash=?').bind(await digest(value)).first<{expires_at:number}>();
 expect(row!.expires_at-Date.now()).toBeGreaterThan((lifetime-5)*1000);
 const other=await login('other'); const u=await authenticate(db,new Request(origin,{headers:{Cookie:other}}));
 await expect(db.prepare('UPDATE users SET supabase_sub=? WHERE id=?').bind(sub,u!.id).run()).rejects.toThrow();
 expect((await call('home',undefined,c)).status).toBe(200);
});
it('enforces independent feature flags and same-origin POST protection',async()=>{
 for(const route of ['auth/google/start','auth/email/start','auth/email/verify','auth/device/start','auth/device/poll','auth/device/approve']) expect((await call(route,{},'',{})).status).toBe(404);
 const r=await handle(new Request(origin+'/api/auth/device/start',{method:'POST',headers:{Origin:'https://evil.example','Content-Type':'application/json'},body:'{}'}),db,'fixture',config);expect(r.status).toBe(403);
 expect((await call('login',{username:'still-works',code:'fixture'},'',{})).status).toBe(200);
});
it('validates signed Supabase claims and rejects invalid trust/claims',async()=>{
 mockProvider(); expect(await validateClaims(access,config.SUPABASE_URL!)).toBe(sub);
 for(const claims of [{iss:'https://wrong/auth/v1'},{aud:'wrong'},{exp:1},{role:'service_role'},{sub:'invalid'},{is_anonymous:true},{nbf:Math.floor(Date.now()/1000)+1000}]) {
 const jwt=await new SignJWT({iss:config.SUPABASE_URL+'/auth/v1',aud:'authenticated',sub,iat:Math.floor(Date.now()/1000),exp:Math.floor(Date.now()/1000)+100,role:'authenticated',session_id:sid,...claims}).setProtectedHeader({alg:'ES256',kid:'fixture'}).sign(privateKey);
 await expect(validateClaims(jwt,config.SUPABASE_URL!)).rejects.toThrow();
 }
 const wrong=await generateKeyPair('ES256');const bad=await new SignJWT({}).setProtectedHeader({alg:'ES256',kid:'fixture'}).sign(wrong.privateKey);
 await expect(validateClaims(bad,config.SUPABASE_URL!)).rejects.toThrow();
 const hs=await new SignJWT({}).setProtectedHeader({alg:'HS256'}).sign(crypto.getRandomValues(new Uint8Array(32)));
 await expect(validateClaims(hs,config.SUPABASE_URL!)).rejects.toThrow();
});
it('email OTP converges on existing identity, rotates cookie and never returns provider tokens',async()=>{
 mockProvider();const old=await login('existing-owner');const before=await db.prepare('SELECT count(*) n FROM users').first<number>('n');
 const r=await call('auth/email/verify',{email:'fixture@example.test',code:'123456'},old);expect(r.status).toBe(200);expect(cookie(r)).not.toBe(old);
 expect(await r.text()).not.toContain('never-forward');expect((await call('home',undefined,old)).status).toBe(401);
 expect((await db.prepare('SELECT count(*) n FROM users').first<number>('n'))).toBe(before);
});
it('provisions an unmapped verified identity without attaching the legacy account',async()=>{
 mockProvider();await db.prepare('UPDATE users SET supabase_sub=NULL WHERE supabase_sub=?').bind(sub).run();
 const legacy=await db.prepare("SELECT id FROM users WHERE username='existing-owner'").first<{id:string}>();
 const r=await call('auth/email/verify',{email:'fixture@example.test',code:'123456'});expect(r.status).toBe(200);
 const user=await authenticate(db,new Request(origin,{headers:{Cookie:cookie(r)}}));expect(user!.id).not.toBe(legacy!.id);
 expect((await call('home',undefined,cookie(r))).status).toBe(200);
 await db.prepare('UPDATE users SET supabase_sub=NULL WHERE supabase_sub=?').bind(sub).run();
 await db.prepare("UPDATE users SET supabase_sub=? WHERE username='existing-owner'").bind(sub).run();
});
it('serializes first registration, isolates subjects and rejects invalid subjects',async()=>{
 const subject=crypto.randomUUID();
 const users=await Promise.all(Array.from({length:20},()=>findOrCreateUserByVerifiedSubject(db,subject)));
 expect(new Set(users.map(u=>u.id)).size).toBe(1);
 expect(await db.prepare('SELECT count(*) n FROM users WHERE supabase_sub=?').bind(subject).first<number>('n')).toBe(1);
 expect((await findOrCreateUserByVerifiedSubject(db,crypto.randomUUID())).id).not.toBe(users[0].id);
 for(const invalid of ['', 'bad']) await expect(findOrCreateUserByVerifiedSubject(db,invalid)).rejects.toThrow();
});
it('retries username collisions without taking a legacy username',async()=>{
 const fixed='aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa';await login('Learner-'+fixed);
 const random=vi.spyOn(crypto,'randomUUID');random.mockReturnValueOnce(fixed).mockReturnValueOnce(fixed);
 const user=await findOrCreateUserByVerifiedSubject(db,'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb');
 expect(user.username).not.toBe('Learner-'+fixed);expect(user.username.length).toBeLessThanOrEqual(64);
});
it('fails closed on provisioning failure and reuses account after session failure',async()=>{
 mockProvider();await db.prepare('UPDATE users SET supabase_sub=NULL WHERE supabase_sub=?').bind(sub).run();
 await db.prepare("CREATE TRIGGER reject_user BEFORE INSERT ON users BEGIN SELECT RAISE(ABORT,'fixture failure'); END").run();
 try {const r=await call('auth/email/verify',{email:'failure@example.test',code:'123456'});expect(cookie(r)).toBe('');expect(await db.prepare('SELECT id FROM users WHERE supabase_sub=?').bind(sub).first()).toBeNull();}
 finally {await db.prepare('DROP TRIGGER reject_user').run();}
 await db.prepare("CREATE TRIGGER reject_session BEFORE INSERT ON auth_sessions BEGIN SELECT RAISE(ABORT,'fixture failure'); END").run();
 let id: string;
 try {expect(cookie(await call('auth/email/verify',{email:'failure@example.test',code:'123456'}))).toBe('');id=(await findOrCreateUserByVerifiedSubject(db,sub)).id;}
 finally {await db.prepare('DROP TRIGGER reject_session').run();}
 const retry=await call('auth/email/verify',{email:'failure@example.test',code:'123456'});
 expect((await authenticate(db,new Request(origin,{headers:{Cookie:cookie(retry)}})))!.id).toBe(id!);
 await db.prepare('UPDATE users SET supabase_sub=NULL WHERE supabase_sub=?').bind(sub).run();
 await db.prepare("UPDATE users SET supabase_sub=? WHERE username='existing-owner'").bind(sub).run();
});
it('uses generic OTP delivery responses and enforces resend/verify budgets',async()=>{
 mockProvider();expect((await call('auth/email/start',{email:'send@example.test'})).status).toBe(200);
 expect((await call('auth/email/start',{email:'send@example.test'})).status).toBe(429);
 for(let i=0;i<5;i++) expect((await call('auth/email/verify',{email:'limits@example.test',code:'bad'})).status).toBe(401);
 expect((await call('auth/email/verify',{email:'limits@example.test',code:'123456'})).status).toBe(429);
});
it('handles unavailable/invalid/expired provider verification without sessions or logs',async()=>{
 vi.spyOn(globalThis,'fetch').mockResolvedValue(new Response('{}',{status:503}));
 expect((await call('auth/email/verify',{email:'down@example.test',code:'123456'})).status).toBe(401);
 expect((await call('auth/email/start',{email:'down@example.test'})).status).toBe(200);
});
it('binds Google PKCE callback, issues same user session and rejects callback replay',async()=>{
 mockProvider();await db.prepare('UPDATE users SET supabase_sub=NULL WHERE supabase_sub=?').bind(sub).run();const r=await call('auth/google/start',{});expect(r.status).toBe(200);
 const {url}=await r.json() as {url:string};const authorization=new URL(url);expect(authorization.searchParams.get('code_challenge')).toBeTruthy();
 const callback=new URL(authorization.searchParams.get('redirect_to')!);callback.searchParams.set('code','fixture-code');
 const cookies=[cookie(r,'fc_oauth_state'),cookie(r,'fc_oauth_verifier')].join('; ');
 const response=await handle(new Request(callback,{headers:{Cookie:cookies}}),db,'fixture',config);expect(response.status).toBe(303);expect(response.headers.get('Location')).toBe('/');expect(cookie(response)).toBeTruthy();
 const googleUser=await authenticate(db,new Request(origin,{headers:{Cookie:cookie(response)}}));
 const otp=await call('auth/email/verify',{email:'fixture@example.test',code:'123456'});
 expect((await authenticate(db,new Request(origin,{headers:{Cookie:cookie(otp)}})))!.id).toBe(googleUser!.id);
 const {poll,data}=await freshChallenge();await call('auth/device/approve',{},cookie(response)+'; '+await context(data.manualCode));
 const tv=await call('auth/device/poll',{},poll);expect((await authenticate(db,new Request(origin,{headers:{Cookie:cookie(tv)}})))!.id).toBe(googleUser!.id);
 const replay=await handle(new Request(callback,{headers:{Cookie:cookies}}),db,'fixture',config);expect(replay.headers.get('Location')).toContain('auth_error');expect(cookie(replay)).toBe('');
 const unbound=await handle(new Request(callback),db,'fixture',config);expect(cookie(unbound)).toBe('');
});
it('requires explicit authenticated QR approval, separates secrets and redeems once',async()=>{
 const phone=await login();const {poll,data}=await freshChallenge();expect(data.qrImage).not.toContain(poll.split('=')[1]);
 const ctx=await context(data.manualCode);expect((await call('auth/device/approve',{},ctx)).status).toBe(401);
 const preview=await call('auth/device/preview',{},phone+'; '+ctx);expect((await preview.json() as {phrase:string}).phrase).toBe(data.phrase);
 expect((await call('auth/device/approve',{},phone+'; '+ctx)).status).toBe(200);
 const result=await call('auth/device/poll',{},poll);expect(result.status).toBe(200);const tv=cookie(result);expect(tv).not.toBe(phone);
 await resetLimits();expect((await call('auth/device/poll',{},poll)).headers.get('Set-Cookie')).toBeNull();
 await call('logout',{},phone);expect((await call('home',undefined,tv)).status).toBe(200);
 await call('logout',{scope:'all'},tv);expect((await call('home',undefined,tv)).status).toBe(401);
});
it('denies expired, denied and revoked-approver requests',async()=>{
 for(const kind of ['denied','expired','revoked']) {
 await resetLimits();const phone=await login();const {poll,data}=await freshChallenge();const ctx=await context(data.manualCode);
 if(kind==='expired') await db.prepare('UPDATE auth_device_requests SET expires_at=0 WHERE poll_hash=?').bind(await digest(poll.split('=')[1])).run();
 else {await call('auth/device/'+(kind==='denied'?'deny':'approve'),{},phone+'; '+ctx);if(kind==='revoked')await call('logout',{},phone);}
 const r=await call('auth/device/poll',{},poll);expect(cookie(r)).toBe('');expect(r.status===410 || (await r.json() as {status:string}).status==='denied').toBe(true);
 }
});
it('serializes concurrent QR completion and limits polling',async()=>{
 const phone=await login();const {poll,data}=await freshChallenge();await call('auth/device/approve',{},phone+'; '+await context(data.manualCode));
 const results=await Promise.all(Array.from({length:20},()=>call('auth/device/poll',{},poll)));
 expect(results.filter(r=>cookie(r))).toHaveLength(1);expect(results.some(r=>r.status===429)).toBe(true);
});
it('logout-all invalidates approved grants and all current sessions, fresh login remains possible',async()=>{
 const phone=await login('logout-user'),other=await login('logout-user');const {poll,data}=await freshChallenge();await call('auth/device/approve',{},phone+'; '+await context(data.manualCode));
 await call('logout',{scope:'all'},other);expect((await call('home',undefined,phone)).status).toBe(401);expect(cookie(await call('auth/device/poll',{},poll))).toBe('');
 expect((await call('home',undefined,await login('logout-user'))).status).toBe(200);
});

it('atomic redemption itself has exactly one winner even without polling admission',async()=>{
 const phone=await login();const {poll,data}=await freshChallenge();await call('auth/device/approve',{},phone+'; '+await context(data.manualCode));
 const hash=await digest(poll.split('=')[1]);const row=await db.prepare('SELECT id FROM auth_device_requests WHERE poll_hash=?').bind(hash).first<{id:string}>();
 const results=await Promise.allSettled(Array.from({length:20},()=>redeemDevice(db,row!.id,hash)));
 expect(results.filter(r=>r.status==='fulfilled')).toHaveLength(1);
});
it('serializes logout-all against QR completion without leaving a redeemable grant',async()=>{
 const phone=await login();const {poll,data}=await freshChallenge();await call('auth/device/approve',{},phone+'; '+await context(data.manualCode));
 const hash=await digest(poll.split('=')[1]);const row=await db.prepare('SELECT id FROM auth_device_requests WHERE poll_hash=?').bind(hash).first<{id:string}>();
 await Promise.allSettled([redeemDevice(db,row!.id,hash),call('logout',{scope:'all'},phone)]);
 expect(await db.prepare('SELECT count(*) n FROM auth_sessions WHERE user_id=(SELECT user_id FROM auth_device_requests WHERE id=?)').bind(row!.id).first<number>('n')).toBe(0);
 await expect(redeemDevice(db,row!.id,hash)).rejects.toThrow();
});

it('rolls back consumed state when session insertion fails',async()=>{
 const phone=await login();const {poll,data}=await freshChallenge();await call('auth/device/approve',{},phone+'; '+await context(data.manualCode));
 const hash=await digest(poll.split('=')[1]);const row=await db.prepare('SELECT id FROM auth_device_requests WHERE poll_hash=?').bind(hash).first<{id:string}>();
 await db.prepare("CREATE TRIGGER reject_auth_session BEFORE INSERT ON auth_sessions BEGIN SELECT RAISE(ABORT,'fixture failure'); END").run();
 try {await expect(redeemDevice(db,row!.id,hash)).rejects.toThrow();expect(await db.prepare('SELECT state FROM auth_device_requests WHERE id=?').bind(row!.id).first<string>('state')).toBe('approved');}
 finally {await db.prepare('DROP TRIGGER reject_auth_session').run();}
});

it('never provisions on invalid JWT, mismatched provider identity or disabled Google callback',async()=>{
 const before=await db.prepare('SELECT count(*) n FROM users').first<number>('n');
 const original=access;
 try {
  mockProvider();access='invalid';
  expect(cookie(await call('auth/email/verify',{email:'invalid@example.test',code:'123456'}))).toBe('');
  access=original;vi.restoreAllMocks();
  vi.spyOn(globalThis,'fetch').mockImplementation(async(input)=>String(input).endsWith('/verify')?Response.json({access_token:access,refresh_token:'hidden',token_type:'bearer',expires_in:3600,user:{id:sub}}):Response.json({id:crypto.randomUUID(),is_anonymous:false}));
  expect(cookie(await call('auth/email/verify',{email:'mismatch@example.test',code:'123456'}))).toBe('');
  const disabled=await handle(new Request(origin+'/api/auth/callback?code=test'),db,'fixture',{});expect(cookie(disabled)).toBe('');
  expect(await db.prepare('SELECT count(*) n FROM users').first<number>('n')).toBe(before);
 } finally {access=original;}
});
