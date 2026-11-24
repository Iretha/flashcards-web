> Historical v3 implementation record. Current behavior is governed by [v4](FLASHCARDS-V4-SPECIFICATION.md). Legacy explanation actions/counters have been retired; v1/v2 file import is unsupported.

# Flashcards v3 implementation verification

Verified locally on Windows with Node 24, Miniflare D1 and headless Microsoft Edge on 2026-11-21. Review mode: engineering self-review plus executable unit, integration and browser regression checks; no independent human content/source review is claimed.

## Results

| Command | Result |
| --- | --- |
| `npm test` | PASS — 65 tests across 8 files |
| `npm run typecheck` | PASS — 0 errors, warnings or hints |
| `npm run build` | PASS — Cloudflare server build |
| `npm run test:e2e` | PASS — real browser import, filters, study, reload, keyboard, responsive layout and manual coding-task creation |

The browser runner builds the application and starts Wrangler locally against `.wrangler/v3-e2e` with an explicit test access code. API integration tests use isolated in-memory D1. No test writes production data. Earlier failures from obsolete v2-template/Repeat assertions and browser test selectors were corrected; the final runs above pass.

## Acceptance evidence

| Requirement | Evidence |
| --- | --- |
| 1. Import question | `tests/v3.test.ts`, canonical-template API import |
| 2. Import coding task | `tests/v3.test.ts`, D1/browser imports |
| 3. BG/EN variants | v3 fixture and API metadata/content round-trip |
| 4. Java question details | fenced code parser assertion and browser syntax-token assertion before answer reveal |
| 5. Multiple provenance sources | three sources, with two accounts sharing one interview ID |
| 6. Invalid URL/date/type/count | parameterized v3 validation tests with card/field errors |
| 7. Generated with zero occurrences | v3 fixture and validator test |
| 8. Repeat toggle | state transition, API and browser checkbox tests |
| 9. Repeat after Next/Previous | API and browser history tests |
| 10. Complete initial pass | ordered and shuffled cycle tests |
| 11. Later marked-only cycles | cycle/state/API tests |
| 12. Uncheck during repetition | state/API/browser tests, pending removals |
| 13. Empty queue completion | cycle/API/browser tests |
| 14. Show/Hide Answer | state/API/browser assertions |
| 15. Mixed deck | question + coding_task fixture imported into one deck |
| 16. Persistence/API round-trip | preview, real D1 reads, study response, manual edit and JSON export assertions |
| 17. Safe delete/reimport | owned-target confirmation, stale revision, invalid input and ownership rejection; injected SQL failure proves batch rollback; shared progress loss, session invalidation and unrelated data/auth preservation verified |
| 18. Responsive and keyboard | Edge at 1280px (one control row), 375px/320px (no page overflow); Space checkbox, Enter reveal, R toggle, arrows, removed L shortcut and reload/resume |

Existing authentication, deck ownership, cross-origin protection, version concurrency, legacy imports and Markdown rendering regression tests remain enabled.

## Boundaries and operational follow-up

- The [template](FLASHCARDS-IMPORT-TEMPLATE.md) is the final v3 serialization contract. `occurrenceId` groups independently documented interviews; URL count is not occurrence count. The parser checks internal consistency, not the truth of source claims or independence of external reports. A/B/C content review remains mandatory in both generator skills.
- The schema change only adds nullable JSON metadata storage. Old card content is not converted. Pre-v3 sessions require restart. Deprecated learn/explanation API actions and historical database counters remain for compatibility; the new UI exposes no corresponding buttons or L shortcut.
- Normal v3 import into a legacy deck is rejected. Create a new deck or use the separately confirmed replacement path; no legacy metadata is guessed.
- JSON backup export preserves all defined v3 metadata; it is not a full multiuser database backup or an automatic restore facility.
- [The production inventory](FLASHCARDS-V3-IMPACT.md) was read only: 131 cards, 78 progress rows, one active session, 151 retained history events across four candidate decks. No production schema changes, deletion, reimport or deployment were executed. Refresh counts and revisions before approval.
- Production rollout needs reviewed schema application and deployment as a separate operation. Actual recreation additionally needs reviewed replacement files, a full backup/recovery check and explicit owner approval; see [the runbook](FLASHCARDS-V3-RELOAD.md).

## Changed files

The implementation commit contains the parser/contract, persistence/API, study/UI, schema, test tooling, tests and documentation listed below.

- `.agents/skills/technical-interview-answer-quality/README.md`
- `.agents/skills/technical-interview-answer-quality/SKILL.md`
- `.gitignore`
- `README.md`
- `docs/FLASHCARDS-IMPORT-TEMPLATE.md`
- `docs/FLASHCARDS-V3-IMPACT.md`
- `docs/FLASHCARDS-V3-RELOAD.md`
- `docs/FLASHCARDS-V3-VERIFICATION.md`
- `e2e/study.pw.ts`
- `migrations/0005_v3.sql`
- `package-lock.json`
- `package.json`
- `playwright.config.ts`
- `skills/flashcards-deck-generator/README.md`
- `skills/flashcards-deck-generator/SKILL.md`
- `src/lib/markdown-v2.ts`
- `src/lib/markdown-v3.ts`
- `src/lib/markdown.ts`
- `src/lib/metadata.ts`
- `src/lib/study-cycles.ts`
- `src/lib/study.ts`
- `src/lib/translations.ts`
- `src/server/api.ts`
- `src/server/decks.ts`
- `src/server/import-plan.ts`
- `src/server/sessions.ts`
- `src/ui/App.tsx`
- `src/ui/CardSources.tsx`
- `src/ui/Decks.tsx`
- `src/ui/Import.tsx`
- `src/ui/StudySidebar.tsx`
- `src/ui/style.css`
- `tests/api.test.ts`
- `tests/fixtures/v3.ts`
- `tests/markdown.test.ts`
- `tests/study-cycles.test.ts`
- `tests/study-sidebar.test.ts`
- `tests/study.test.ts`
- `tests/v3.test.ts`
