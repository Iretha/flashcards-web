---
name: flashcards-deck-generator
description: Generate flashcard decks and additions for flashcards-web with traceable provenance and technical review, using the supported Markdown v4 contract.
---

# Flashcards Deck Generator

Before generating or reviewing, read and apply the shared content and review rules in [Technical Interview Answer Quality](../../.agents/skills/technical-interview-answer-quality/SKILL.md). That file is the single authority for question structure, contextual examples, provenance, technical sources and sequential A/B/C review. If unavailable, report the missing dependency; do not silently omit its quality gates.

Read `docs/FLASHCARDS-IMPORT-TEMPLATE.md` for the supported Markdown v4 serialization. Use stable `## card: id` keys, cardType (`question` or `coding_task`), topic and provenance; at least one complete requested-language variant. Coding tasks require questionDetails in each supplied language. Put task/starter code in questionDetails, solutions and optional integrated examples in answer. Keep answerReferences separate.

Use provenance.sources entries with real sourceName/sourceUrl and only verified optional company/location/interviewLocation/publishedAt. A source establishes origin/adaptation; it does not automatically establish an interview. Add occurrenceId only for a documented independent interview, using the same ID for reposts of that interview. Responses derive occurrenceCount from distinct evidenced occurrenceId values; never author it. Documentation and answer references never increase it; generated cards without evidence have a derived count of 0. Preserve deckId/card keys, omitted languages and optional 1-5 ratings. Validate with the actual parser and report its results before calling an artifact import-ready. Never change app/schema or recreate existing decks as part of generation.

Determine topic, count, level, language and new versus existing deck. Defaults when unspecified: 20 cards, Bulgarian, senior interview preparation. Map subtopics and avoid semantic duplication against available existing cards; disclose limits if those cards are unavailable. Reuse existing IDs; use stable unique ASCII keys for new cards. Never overwrite existing decks unless requested.

Generate the requested count where feasible and review every card using the shared workflow. Save an actual UTF-8 `.md` artifact, using `<deck-id>.md` for validated v4 imports and `<deck-id>-draft.md` when review or validation remains unresolved. Provide a link to the real file, or complete Markdown with an honest tool limitation when file generation is unavailable. Report count, draft/import status, checks actually performed and unresolved issues. Do not import or claim preserved study progress unless that operation was authorized and actually performed.


Markdown heading rules: `#### question`, `#### answer` and `#### questionDetails`
start structural fields. Once a field starts, other headings are ordinary Markdown
content, except reserved card/language/metadata headings and retired
`#### simple`, `#### example`, `#### details` outside fences. To quote reserved
headings literally, use a fenced code block. Content must begin under a supported
field heading. See docs/FLASHCARDS-V4-SPECIFICATION.md.


## Markdown v5 transition

For v5 drafts, use [v5 template](../../docs/FLASHCARDS-V5-IMPORT-TEMPLATE.md), [v5 specification](../../docs/FLASHCARDS-V5-SPECIFICATION.md) and mandatory [G-01–G-07 classification guidelines](CLASSIFICATION-GUIDELINES.md). These override v4-specific serialization instructions above for v5 only. Explicitly supply all five classification fields for new cards; preserve existing classification unless explicitly requested. Provenance and A/B/C quality rules remain unchanged. Do not claim import readiness until the actual v5 parser has validated the artifact. Until confirmed cutover, retain the v4 template for v4 imports.
