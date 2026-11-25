import { cp, mkdir, mkdtemp, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { basename, resolve } from 'node:path';
import { spawnSync } from 'node:child_process';

const root = resolve(import.meta.dirname, '..');
const wrangler = resolve(root, 'node_modules/.bin/wrangler');
const temporary = await mkdtemp(resolve(tmpdir(), 'flashcards-imp003-'));
let succeeded = false;

function run(args, expected = 0) {
  const result = spawnSync(wrangler, args, {
    cwd: temporary,
    encoding: 'utf8',
    env: { ...process.env, WRANGLER_LOG_PATH: resolve(temporary, 'wrangler.log') },
  });
  if (result.status !== expected) {
    process.stderr.write(result.stdout ?? '');
    process.stderr.write(result.stderr ?? '');
    throw new Error(`wrangler ${args.join(' ')} exited ${result.status}; expected ${expected}`);
  }
  return result.stdout;
}

async function config(name) {
  const directory = resolve(temporary, name);
  await mkdir(resolve(directory, 'migrations'), { recursive: true });
  await writeFile(resolve(directory, 'wrangler.jsonc'), JSON.stringify({
    name: `imp003-${name}`,
    compatibility_date: '2026-04-01',
    d1_databases: [{ binding: 'DB', database_name: `imp003-${name}`, database_id: crypto.randomUUID(), migrations_dir: 'migrations' }],
  }));
  return directory;
}

async function copyMigrations(directory, include0021) {
  for (let number = 1; number <= (include0021 ? 21 : 20); number++) {
    const prefix = String(number).padStart(4, '0') + '_';
    const files = await import('node:fs/promises').then(module => module.readdir(resolve(root, 'migrations')));
    const file = files.find(value => value.startsWith(prefix));
    if (!file) throw new Error(`Missing historical migration ${prefix}`);
    await cp(resolve(root, 'migrations', file), resolve(directory, 'migrations', basename(file)));
  }
}

function apply(directory, expected = 0) {
  return run(['d1', 'migrations', 'apply', 'DB', '--local', '--persist-to', resolve(directory, 'state'), '--config', resolve(directory, 'wrangler.jsonc')], expected);
}

function execute(directory, file) {
  run(['d1', 'execute', 'DB', '--local', '--persist-to', resolve(directory, 'state'), '--config', resolve(directory, 'wrangler.jsonc'), '--file', resolve(root, file)]);
}

try {
  const valid = await config('valid');
  await copyMigrations(valid, false);
  apply(valid);
  execute(valid, 'tests/fixtures/imp003-legacy.sql');
  await copyMigrations(valid, true);
  apply(valid);
  execute(valid, 'tests/fixtures/imp003-verify.sql');

  const guarded = await config('guarded');
  await copyMigrations(guarded, false);
  apply(guarded);
  execute(guarded, 'tests/fixtures/imp003-legacy.sql');
  run(['d1', 'execute', 'DB', '--local', '--persist-to', resolve(guarded, 'state'), '--config', resolve(guarded, 'wrangler.jsonc'), '--command',
    "UPDATE cards SET metadata=json_set(metadata,'$.topic','UNINSPECTED') WHERE id='imp003-question'"], 0);
  await copyMigrations(guarded, true);
  apply(guarded, 1);
  const list = run(['d1', 'migrations', 'list', 'DB', '--local', '--persist-to', resolve(guarded, 'state'), '--config', resolve(guarded, 'wrangler.jsonc')]);
  if (!list.includes('0021_card_classification.sql')) throw new Error('Failed migration was not left pending');

  succeeded = true;
  console.log('IMP-003 Wrangler rehearsal passed: populated migration, preservation guards, and failed-migration rollback.');
} finally {
  if (succeeded || process.env.KEEP_IMP003_STORAGE !== '1') await rm(temporary, { recursive: true, force: true });
  else console.error(`Retained failed rehearsal at ${temporary}`);
}
