# Flashcards Deck Generator

Use this skill to produce import-ready Markdown v2 decks. It generates Bulgarian and English versions of each card by default, with a main answer, a simple explanation, and a practical example in each language. Detailed explanations are optional.

Add the folder to your agent's skill directory or attach its `SKILL.md` instructions to the conversation.

Provide the subject, audience, and target number of cards. Attach the existing Markdown when adding concepts or translations so the generator can preserve the deck ID and card keys. Ask for BG-only or EN-only if needed.

Download the resulting `.md` file and use **Import Markdown** in Flashcards. Review matches and conflicts before applying it.

- [Import template](../../docs/FLASHCARDS-IMPORT-TEMPLATE.md)
- [Example prompts](../../docs/EXAMPLE-PROMPTS.md)

## Команда за копиране

```text
Използвай flashcards-deck-generator. Генерирай 40 BG и EN карти за Java Memory Model, Senior ниво, и създай .md файл за импорт.
```

За допълване на съществуващ дек:

```text
Използвай flashcards-deck-generator. Добави 15 нови карти към приложения дек java-memory-model. Запази deckId, използвай нови card keys само за новите концепции и създай отделен .md файл.
```
