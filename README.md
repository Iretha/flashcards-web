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

```sh
npm test
npm run typecheck
npm run build
```

## Cloudflare Workers

Sign in with `npx wrangler login`. Create a D1 database with `npx wrangler d1 create flashcards-web` and replace the placeholder `database_id` in `wrangler.jsonc` with the ID it prints. Keep the binding name `DB`.

```sh
npx wrangler d1 migrations apply DB --remote
npx wrangler secret put ACCESS_CODE
npm run deploy
```

Enter the shared access code interactively. Keep it out of Git. For the first deployment, Wrangler may prompt to create the Worker when setting the secret. Open the resulting HTTPS Workers URL on each device.

## Markdown

Each `## Question` starts a card. Use `---` between cards. The optional YAML frontmatter fields are `deckId`, `title`, and `description`. Keep `deckId` stable across revisions, or select an existing target deck in the import form.

## Study controls

Use Tab or direction keys to move between controls and Enter/OK to activate them. With focus on the study panel, Enter/Space reveals the answer and Left/Right browses cards. Use L for Learned, R for Repeat, and Escape/Back to pause and return to the library. On-screen controls are available throughout the session.
