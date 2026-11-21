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

Sign in with `npx wrangler login` and run `npx wrangler d1 list` to find the UUID of the existing `flashcards-db` database. In `wrangler.jsonc`, replace the all-zero `database_id` under `d1_databases[0]` in your local checkout. The Worker uses the `DB` binding.

Run a read-only query to check the remote connection. A successful result contains `connected: 1`.

```sh
npx wrangler d1 execute DB --remote --command="SELECT 1 AS connected"
```

Review pending production migrations before applying them.

```sh
npx wrangler d1 migrations list DB --remote
npx wrangler d1 migrations apply DB --remote
```

Set the shared access code and deploy when ready.

```sh
npx wrangler secret put ACCESS_CODE
npm run deploy
```

Enter the shared access code interactively. Keep it out of Git. For the first deployment, Wrangler may prompt to create the Worker when setting the secret. Open the resulting HTTPS Workers URL on each device.

## Markdown

Each `## Question` starts a card. Use `---` between cards. The optional YAML frontmatter fields are `deckId`, `title`, and `description`. Keep `deckId` stable across revisions, or select an existing target deck in the import form.

## Study controls

Use Tab or direction keys to move between controls and Enter/OK to activate them. With focus on the study panel, Enter/Space reveals the answer and Left/Right browses cards. Use L for Learned, R for Repeat, and Escape/Back to pause and return to the library. On-screen controls are available throughout the session.
