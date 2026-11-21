---
name: flashcards-deck-generator
description: Generate flashcard decks and additions for flashcards-web with traceable provenance and technical review, distinguishing future content drafts from supported imports.
---

# Flashcards Deck Generator

Before generating or reviewing, read and apply the shared content and review rules in [Technical Interview Answer Quality](../../.agents/skills/technical-interview-answer-quality/SKILL.md). That file is the single authority for question structure, contextual examples, provenance, technical sources and sequential A/B/C review. If unavailable, report the missing dependency; do not silently omit its quality gates.

Read `docs/FLASHCARDS-IMPORT-TEMPLATE.md` for actual import compatibility. The future logical contract is not yet supported by that template. Default new-contract output to a clearly labeled UTF-8 Markdown draft with question-side details/provenance and separate answer references. Never claim it is import-ready, invent new importer fields or change the production template/app to accommodate it. Schema updates and deck recreation require separate explicit tasks.

For explicitly requested supported legacy import work, preserve the live v2 schema, exact existing deckId and card keys, language omission behavior and optional integer 1–5 ratings. Do not require separate simple/example/details layers. Report requirements that cannot be represented instead of silently dropping them. Editorial priority is not evidence of interview frequency.

Determine topic, count, level, language and new versus existing deck. Defaults when unspecified: 20 cards, Bulgarian, senior interview preparation. Map subtopics and avoid semantic duplication against available existing cards; disclose limits if those cards are unavailable. Reuse existing IDs; use stable unique ASCII keys for new cards. Never overwrite existing decks unless requested.

Generate the requested count where feasible and review every card using the shared workflow. Save an actual UTF-8 `.md` artifact, using `<deck-id>-draft.md` for future-contract drafts and a suitable import filename only for validated legacy output. Provide a link to the real file, or complete Markdown with an honest tool limitation when file generation is unavailable. Report count, draft/import status, checks actually performed and unresolved issues. Do not import or claim preserved study progress unless that operation was authorized and actually performed.
