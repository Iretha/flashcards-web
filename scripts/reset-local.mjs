import { resolve } from 'node:path';
import { rm } from 'node:fs/promises';
import { createInterface } from 'node:readline/promises';
const target = resolve('.wrangler/state/v3/d1');
console.log(`Deletes ONLY local D1 data at ${target}. Stop the local server first.`);
const rl = createInterface({ input: process.stdin, output: process.stdout });
const answer = await rl.question('Type RESET LOCAL to delete: ');
rl.close();
if (answer !== 'RESET LOCAL') { console.log('Cancelled.'); process.exit(1); }
await rm(target, { recursive: true, force: true });
console.log('Local D1 removed. Run npm run db:migrate:local to recreate it.');
