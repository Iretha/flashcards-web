# Flashcards Deck Generator skill

Reusable agent skill for producing Markdown files compatible with the Flashcards app.

## Use in ChatGPT / coding agents

Add the folder `skills/flashcards-deck-generator` to an agent's supported skill directory or attach the `SKILL.md` instructions to the agent. The file being present in GitHub **does not automatically install or activate it** in every ChatGPT conversation.

Example requests:

- `Използвай flashcards-deck-generator: 40 въпроса за Java Memory Model, Senior, на български.`
- `Използвай flashcards-deck-generator: добави 15 нови въпроса към deckId java-memory-model.`

The generated output should be an actual downloadable UTF-8 `.md` file, not just a chat response. The canonical import example lives at `docs/FLASHCARDS-IMPORT-TEMPLATE.md`.
