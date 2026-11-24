# Generating flashcard decks

Use [the v4 template](FLASHCARDS-IMPORT-TEMPLATE.md) and the
[generator skill](../skills/flashcards-deck-generator/SKILL.md). Read the shared
technical-interview answer-quality instructions before generating technical content.

Generate explicit formatVersion: 4, stable deckId/card keys, requested canonical
BCP 47 languages, cardType, topic and provenance. Include questionDetails for coding
tasks. Put all examples, code, explanations and qualifications in one answer per
language. Keep answerReferences separate from question provenance.

Supply occurrenceId only for evidenced independent interviews; reposts share the
same ID. Do not author occurrenceCount. Never invent sources, dates or locations.
Generated cards cannot claim interview occurrences. Validate the completed file
with the production parser and report the actual validation result.

The application accepts missing/empty answers, but requests for complete educational
decks require complete, accurate answers and the existing A/B/C quality review.
Missing answers preserve old answers on reimport; explicit empty clears them.
Existing deck language configuration is retained. v3 remains import-compatible;
v1/v2 and files without an explicit supported version are rejected. Previously
imported decks remain usable after migration. Do not recreate decks during generation.
