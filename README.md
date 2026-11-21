# Flashcards

Flashcards runs on Astro, React, Cloudflare Workers and D1. Users sign in with a username and a shared access code. Deck ownership and study progress are stored in D1.

## Local development

Use Node.js 24 and npm.

```sh
npm ci
```

Copy `.dev.vars.example` to `.dev.vars` and set `ACCESS_CODE` to a local development code. Then run:

```sh
npm run db:local
npm run dev
```

Open the printed localhost URL. Use HTTPS when accessing the application over a local network because the session cookie is Secure. To check the production build locally, run `npm run build` followed by `npm run preview`.

Local development uses an isolated D1 database. The UUID placeholder works locally. Use the following commands to check or apply migrations in `migrations/` and verify the local connection:

```sh
npx wrangler d1 migrations list DB --local
npx wrangler d1 migrations apply DB --local
npx wrangler d1 execute DB --local --command="SELECT 1 AS connected"
```

`npm run db:local` runs the same local migration apply command.

```sh
npm test
npm run typecheck
npm run build
```

## Cloudflare Workers

The target Worker is `flashcards-api`. In Cloudflare Dashboard, open D1 → `flashcards-db` and copy its Database ID. Paste it in `wrangler.jsonc` at `d1_databases[0].database_id`, replacing the all-zero placeholder before deployment. The `DB` binding uses local D1 during development (`remote: false`) and the configured UUID identifies the database in production.

Sign in with `npx wrangler login` to the account that owns both resources.

Run a read-only query to check the remote connection. A successful result contains `connected: 1`.

```sh
npx wrangler d1 execute DB --remote --command="SELECT 1 AS connected"
```

Review pending production migrations before applying them.

```sh
npx wrangler d1 migrations list DB --remote
npx wrangler d1 migrations apply DB --remote
```

Verify that the existing `flashcards-api` Worker has an `ACCESS_CODE` secret. Set it only if missing. To validate the build without publishing, run `npm run build` followed by `npx wrangler deploy --dry-run`. Deploy when the production schema and secret are ready.

```sh
npm run deploy
```

Open the resulting HTTPS Worker URL and verify sign-in.

## Markdown

Use the [Markdown v2 template](docs/FLASHCARDS-IMPORT-TEMPLATE.md) for new decks and the [Flashcards Deck Generator skill](skills/flashcards-deck-generator/README.md) to generate import files. In v2, a stable `## card: key` links BG and EN content to one card and its progress. Keep both `deckId` and existing card keys when sending revisions or additional translations. Reuse an existing v1 card through the import preview when its translation needs an explicit match.

Legacy v1 files still use `## Question` followed by a Markdown answer, with optional `deckId`, `title`, and `description` frontmatter. For a file without a deck ID, select the existing target deck when re-importing.

The deck's card list filters by optional interview priority and difficulty ratings from v2. The Hardest first and Easiest first sorts use the presentation count from your study history.

## Study controls

Use Tab or direction keys to move between controls and Enter/OK to activate them. With focus on the study panel, Enter/Space reveals the answer and Left/Right browses cards. Use L for Learned, R for Repeat, and Escape/Back to pause and return to the library. On-screen controls are available throughout the session.
