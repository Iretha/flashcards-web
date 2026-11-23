// Local-only: node scripts/backfill-card-search.mjs <persist-directory> <database-id>
// Stop wrangler dev before opening its local storage. Node >=24 required.
import { resolve } from 'node:path';
import { existsSync } from 'node:fs';
import { Miniflare, convertV4MiniflareOptions } from 'miniflare';
import { backfillSearch, beginSearchRebuild, verifySearch } from '../src/lib/search.ts';
const [persist,id,mode='backfill'] = process.argv.slice(2);
if ((process.argv.length !== 4 && process.argv.length !== 5) || !persist || !id || persist.startsWith('--') || !/^[a-zA-Z0-9_-]+$/.test(id))
  throw new Error('Provide local persistence directory and database ID; remote operation is not supported.');
const storage = resolve(persist,'v3/d1');
if(!['backfill','rebuild','verify'].includes(mode)) throw new Error('Expected backfill, rebuild, or verify');
if (!existsSync(storage)) throw new Error('Local D1 storage does not exist. Apply local migrations first.');
const runtime = new Miniflare(convertV4MiniflareOptions({ modules:true,
  script:'export default {fetch(){return new Response("local backfill")}}',
  d1Databases:{DB:id}, resourcePersistencePath:resolve(persist,'v3') }));
try { const db=await runtime.getD1Database('DB'); if(mode==='rebuild')await beginSearchRebuild(db); if(mode==='verify') {await verifySearch(db);console.log('Search verified');} else console.log(`Indexed ${await backfillSearch(db)} local cards.`); }
finally { await runtime.dispose(); }
