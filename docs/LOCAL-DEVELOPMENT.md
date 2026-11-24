# Local development

Requires Node.js >=24 and npm. Docker and a Cloudflare login are unnecessary.

## First setup (PowerShell)

```powershell
npm ci
Copy-Item .dev.vars.example .dev.vars
# Set ACCESS_CODE in .dev.vars to a local test password.
npm run db:migrate:local
npm run dev
```

Open http://localhost:4335 and sign in with a test username and your local ACCESS_CODE.
`dev` builds Astro and runs Wrangler/Miniflare locally. After source edits, stop it
with Ctrl+C and run it again (this command does not provide hot reload).

## Database

```powershell
npm run db:migrate:local
npm run db:status:local
```

All migrations in migrations/, including 0008_deck_languages.sql, use the existing
DB binding and schema. Both server and migrations explicitly use --local and
--persist-to .wrangler/state. The existing remote:false binding disables remote D1.
No production data is downloaded; no remote migration or deployment is involved.
SQLite data under .wrangler/state/v3/d1 survives server restarts. .wrangler/ and
.dev.vars are already ignored by Git. Keep that directory when restarting.
`db:local` remains an alias for local migrations. `npm run test:e2e` uses a unique `.wrangler/v4-e2e-<UUID>` directory, removed after normal success/failure. `KEEP_E2E_STORAGE=1` or interruption retains it for inspection. The separate `db:e2e` command targets `.wrangler/v3-e2e`; it is not the runner storage.

## Reset

Stop the local server, run `npm run db:reset:local`, then type `RESET LOCAL`.
It deletes ONLY .wrangler/state/v3/d1, including local users and sessions.
Run `npm run db:migrate:local` again. Startup never resets data automatically.

## Manual verification

Create and edit decks and cards; set original and supported languages. Study
multiple decks together and check fallback and disabled language buttons on cards
without translations. Exercise Repeat, history navigation and subsequent study cycles.
Stop and restart with npm run dev; sign in with the same username and verify your
content and progress remain. No test content is seeded automatically.

## Troubleshooting

- Missing tables: run db:migrate:local from the project root.
- Invalid access code: check .dev.vars and restart the server.
- Port 4335 occupied: stop the previous local server before restarting.
- Old UI after editing: restart npm run dev to rebuild.
- Database appears empty: verify the working directory and persistence path;
  E2E and development intentionally use different storage directories.
- Run npm test for unit/API tests with real local Miniflare D1. npm run test:e2e
  requires Edge and free port 4322; it builds and launches its own local server.
- Never add --remote to local commands or use deploy for local development.
`dev` builds into dist-local and explicitly runs its generated Wrangler config. This keeps local server assets separate from dist, which other builds and E2E replace. Run only one dev instance at a time.


Search-affecting migrations must include required reconstruction in forward SQL and local regression tests; see [search migration and repair procedures](SEARCH-ARCHITECTURE.md).
