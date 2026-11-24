> Historical v3 implementation record. Current behavior is governed by [v4](FLASHCARDS-V4-SPECIFICATION.md). Legacy explanation actions/counters have been retired; v1/v2 file import is unsupported.

# Read-only production inventory — 2026-11-21

Target: configured `flashcards-db` D1 database. Obtained using a single `wrangler d1 execute DB --remote` SELECT. Cloudflare returned `changes: 0`, `changed_db: false`, and `rows_written: 0`. No production schema, cards, users, authentication settings or progress were changed.

These are candidate legacy decks for a future separately approved recreation, not an instruction to delete them. Counts are a snapshot and must be refreshed immediately before approval. Progress counts include every user's records for the deck, so a count can exceed the number of cards.

| Deck | ID | Revision | Cards replaced | Progress rows lost | Active sessions invalidated | Historical events retained |
| --- | --- | ---: | ---: | ---: | ---: | ---: |
| EPAM Senior Java Developer — 25 въпроса / 25 questions (BG + EN) | `052f4bb2-ff1b-44b0-9094-cceafaf4ae61` | 0 | 25 | 8 | 0 | 11 |
| Java Interview — Test Deck | `05630f3c-b959-4152-97c7-d938186dd771` | 0 | 6 | 3 | 0 | 5 |
| Java Memory Model — Top 50 Interview Questions | `0eefe0ae-ff4b-4deb-9487-5d927e18ecb2` | 0 | 50 | 15 | 0 | 21 |
| Java Memory Model — Top 50 Interview Questions - Revised | `2ed9c403-77b7-4071-815b-40b3626d55df` | 1 | 50 | 52 | 1 | 114 |
| **Total** | | | **131** | **78** | **1** | **151** |

No replacement content was generated from these old cards, because automatic migration and invented provenance are prohibited. Actual recreation requires reviewed Markdown v3 files, a full database backup/recovery check, refreshed impact/revision snapshots and separate explicit owner approval. See [the runbook](FLASHCARDS-V3-RELOAD.md).
