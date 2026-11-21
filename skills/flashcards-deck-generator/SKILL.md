---
name: flashcards-deck-generator
description: Generate import-ready Markdown v2 flashcard decks for Flashcards, including bilingual Bulgarian and English cards, single-language decks on request, and stable-key extensions to existing decks.
---

# Generate a Flashcards deck

Read the [import template](../../docs/FLASHCARDS-IMPORT-TEMPLATE.md) for the exact heading structure. Deliver a UTF-8 `.md` file with `formatVersion: 2`, a descriptive title, and a stable `deckId`.

Use 20 cards when no count is specified. Use `<deck-id>.md` for a new deck or `<deck-id>-extra.md` for additions unless the user provides a filename. Keep any attached source deck intact unless the user requests an edit.

Generate one logical card per concept. Include Bulgarian and English by default. If the user specifically requests one language, include only that language. For each included language write a focused question, a concise answer, a plain-language explanation, and a practical example. Add a detailed explanation when it clarifies a mechanism or addresses a material nuance. Use fenced code when a runnable or readable example benefits the learner. Keep both language versions aligned in meaning.

When extending an existing deck, read its source and preserve the deck ID and all supplied card keys. Reuse a card key for translations or revisions to that concept. Assign a new key only to a new concept. For a legacy deck, preserve original questions when converting so the import preview can match them. If the user requests only missing translations, output just those languages under the established card keys.

Before delivery, check that every key is unique within the file, each language has a question and answer, fences close, and the file contains the Markdown itself without an enclosing code fence.

Link to the actual generated file. If file creation is unavailable, state that limitation and provide the full Markdown for saving manually.
