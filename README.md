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

## External management API

See the [Management API reference](docs/MANAGEMENT-API.md) for deck and card endpoints, token provisioning and request examples.

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

## Markdown v4

Use the [import template](docs/FLASHCARDS-IMPORT-TEMPLATE.md) and [deck generator](skills/flashcards-deck-generator/README.md). One file represents a deck; `## card: id` provides a stable unique key shared by requested-language. Both `question` and `coding_task` cards support Markdown question details and answers, tables and highlighted fenced code. Task statements and source metadata are available before revealing the answer.

Required v4 card metadata: `cardType`, `topic`, `provenance`. Optional: integer 1?5 `interviewPriority` and `difficulty`, and `answerReferences`. Each supplied language needs a nonempty `question`; `answer` may be omitted or empty; coding tasks also need `questionDetails`. Metadata is stored as JSON and preserved through import, reimport, editing, study and JSON backup export. Apply all migrations only to disposable test storage during development; see the v4 specification for production recovery prerequisites.

Provenance sources establish origin/adaptation. Optional `occurrenceId` marks evidence of a documented interview; multiple sources for the same interview share one ID. `occurrenceCount` equals distinct interview IDs, never the number of URLs. Technical documentation does not establish interview occurrences. Answer references are separate technical verification links. The importer checks syntax and internal consistency; it cannot verify external evidence or detect reposts automatically.

The card library filters by card type, topic, company, provenance, difficulty and priority. Only v3/v4 files are accepted; previously imported decks remain usable; legacy decks retain canonical content after cleanup. New decks should use v4. The manual card editor supports independently authored generated cards with type, topic and question details; use Markdown import to author provenance sources and answer references. Existing metadata is preserved on manual edits. A v3 import into a legacy deck requires deliberate replacement or a new target deck.

## Study controls

Use Next/Previous to navigate independently of the Repeat checkbox. Every selected card appears in the first cycle. Later cycles contain only cards still marked Repeat, in the session's initial order. Unchecking a pending repeat removes it from the next presentation; first-cycle cards are always shown. Changing a historical card updates global session membership, including across cycle boundaries. A newly marked historical card joins the next cycle snapshot. History navigation replays already presented entries without recording another presentation. At a cycle boundary with no marked cards, Next completes the session. Completed sessions can be replaced by starting a new session.

Show answer / Hide answer toggles visibility. Timer expiry reveals the answer without navigating or changing Repeat. Navigating resets the answer and timer for that view. Tab moves through controls; Space activates a focused checkbox. With focus on the study panel, Enter/Space toggles the answer, Left/Right browses, R toggles Repeat, and Escape/Back pauses and returns to the library. The L shortcut and Learned/explanation buttons have been removed. Controls wrap on narrow screens. Existing sidebar navigation, language switching, fullscreen and answer sizing remain available.

## Safe card recreation

No existing card content is migrated. See the [reload runbook](docs/FLASHCARDS-V3-RELOAD.md). Import previews show a read-only impact report; `/api/replacement-report` downloads the affected owned decks, card counts, progress counts and active sessions. Normal import updates cards by stable key. Replacement is a separate, guarded operation tested only against isolated D1; production recreation requires separate explicit approval. No production deployment or deletion was performed for this implementation.

Pre-v3 active sessions must be restarted; card content and saved progress are not converted or deleted.

Browser regression checks: `npm run test:e2e` uses Microsoft Edge and isolated local D1 in a fresh `.wrangler/v4-e2e-<timestamp>` directory per run, with a test-only access code. It checks real import, Study UI, keyboard controls and 320/375px layouts.

See the [verification and acceptance matrix](docs/FLASHCARDS-V3-VERIFICATION.md) and [read-only production impact inventory](docs/FLASHCARDS-V3-IMPACT.md).


Current contract: author v4; v3 remains import-compatible, v1/v2 and missing versions are rejected. Do not author occurrenceCount; responses derive distinct evidenced occurrence IDs. Use requested canonical BCP 47 content languages. Put examples/explanations/code inside answer. The app accepts omitted/empty answers; requests for complete educational flashcards still require technically complete answers. See docs/FLASHCARDS-V4-SPECIFICATION.md and the current import template.
