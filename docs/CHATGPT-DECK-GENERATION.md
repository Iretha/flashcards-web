# Generate a Flashcards deck in ChatGPT

Give ChatGPT the [import template](FLASHCARDS-IMPORT-TEMPLATE.md) or use the [Flashcards Deck Generator skill](../skills/flashcards-deck-generator/SKILL.md). Specify the topic, learner level, number of cards, and any source material. Request a downloadable UTF-8 Markdown v2 file.

The default card has Bulgarian and English question, answer, simple explanation, and practical example. Request a single language or more technical detail when needed.

To extend an existing deck, attach its Markdown file and ask ChatGPT to preserve the deck ID and card keys. To add missing translations, ask for only the requested languages under those same keys. Download the file and review its import preview in Flashcards.

See [example prompts](EXAMPLE-PROMPTS.md).

## Промпт за копиране

> Подготви ми **[БРОЙ] флашкарти** по тема **[ТЕМА]** за **[НИВО/ЦЕЛ]**. Използвай каноничния Markdown v2 пример `docs/FLASHCARDS-IMPORT-TEMPLATE.md` от `Iretha/flashcards-web`.
>
> Използвай стабилни `deckId` и `## card: <key>`. Напиши българска и английска версия за всяка карта, освен ако изрично поискам един език. За всеки език добави въпрос, кратък отговор, достъпно обяснение и практически пример. Добави подробно обяснение, когато то помага.
>
> Ако допълваш приложен дек, запази `deckId` и ключовете на съществуващите карти. При добавяне на преводи включи само поисканите езикови секции. Провери формата и ми предостави готов за изтегляне UTF-8 `.md` файл.

Избери видимостта в приложението. Прегледът показва конфликтите и предлага свързване, когато старата карта няма ключ и съвпадението е нееднозначно.
