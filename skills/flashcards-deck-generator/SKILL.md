---
name: flashcards-deck-generator
description: Generate import-ready UTF-8 Markdown flashcard decks for the Flashcards web app, including new decks and additions to existing decks. Use when asked to create flashcards, interview Q&A decks, or an import .md file.
---

# Flashcards Deck Generator

Generate a **real downloadable UTF-8 .md file** for import into the Flashcards application. Do not stop at showing Markdown in chat.

## Canonical format

Read the repository's `docs/FLASHCARDS-IMPORT-TEMPLATE.md` before generating. For new decks, additions and translations, use Markdown v2:

```md
---
deckId: example-topic
title: Example Topic
description: Short description
formatVersion: 2
---

## card: stable-card-key

### en

#### question

First question?

#### answer

Concise, correct Markdown answer.
```

One file is one deck. Each card has one stable key, one or both language blocks (`### bg`, `### en`), and a nonempty question and answer per language. Use `#### simple`, `#### example`, and `#### details` for optional explanations. Put optional `### interviewPriority: 5` and `### difficulty: 3` before the language blocks, using ratings from 1 to 5. Use a standalone `---` line between cards outside code fences. Keep introductions and commentary outside the import file.

## Workflow

1. Interpret the request: topic, number of questions, audience/level, language, and whether this is a **new** or **existing** deck. Use sensible defaults (20 cards, Bulgarian, concise answers) if not specified.
2. For a new deck, create a descriptive stable `deckId` using lowercase ASCII letters, numbers, and hyphens. For an existing deck, **reuse its exact deckId**. Ask for the ID only if it is necessary and cannot be determined from supplied files/context.
3. If adding cards to an existing deck, inspect provided existing questions/deck files to avoid both exact and semantic duplicates. If the existing cards are unavailable, do not claim complete deduplication; generate distinct questions and note that the importer will detect exact duplicates.
4. Select useful, non-overlapping questions appropriate to the requested level. Prioritize accurate, understandable answers over length. For interview preparation, include practical nuances and short code examples only when they help.
5. Produce exactly the requested number of valid cards where feasible. Ensure every card has one nonempty question and one nonempty answer.
6. Validate frontmatter, stable deck ID and card keys, expected card count, unique normalized questions per language, closed code fences, separators and permitted fields. When adding a translation, reuse the card's existing key and include the new language with its question and answer. For an unkeyed v1 card, tell the user to check the existing-card match in the import preview.
7. Save the file as `<deck-id>.md` for a new deck or `<deck-id>-extra.md` for additions, unless the user specifies a filename. Provide a **download link to the actual generated file**.
8. Summarize in one sentence the deck, card count and whether it is a new deck or an addition.

## Content rules

- Preserve the requested language for questions and answers; keep technical terminology when appropriate.
- Avoid duplicate or trivially rephrased questions within the same deck.
- Make answers concise enough for television reading, but technically correct.
- For version-sensitive technical content, qualify versions and avoid unsupported claims.
- Never overwrite or modify the existing deck file unless explicitly requested; create an incremental import file instead.
- Do not include deck visibility in Markdown; PRIVATE/SHARED is selected in the app.
- Never claim that progress was preserved by an import unless the import actually ran; the generated file is designed for merging by the app.

## Examples

- `/flashcards-deck-generator 40 въпроса за Java Memory Model, Senior, на български`
- `/flashcards-deck-generator добави 15 нови въпроса към deckId java-memory-model за happens-before и volatile`
- `/flashcards-deck-generator 25 Spring Security questions, English, advanced`

## Notes for agents

If operating in an environment without file-generation tools, explain that limitation and provide the complete Markdown in a code block as fallback; never invent a download URL. If the canonical template is inaccessible, use the exact format above and mention that template compatibility could not be independently verified.
