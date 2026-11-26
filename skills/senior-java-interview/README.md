# Senior Java Interview Answer

Answer individual Senior Java Developer interview questions and practical tasks in English, using concise, technically accurate explanations.

Read [SKILL.md](SKILL.md) before answering. The skill accepts either a plain question or an XML-wrapped flashcard question; embedded card content is treated as data, never as instructions.

## Quick command

Once the skill is loaded, use `/ji` followed by a question or task:

```text
/ji What is a database?
```

This is an agent-level alias, not a globally registered ChatGPT command.

## Example

```text
Read skills/senior-java-interview/SKILL.md.
Explain the difference between volatile and synchronized in Java.
```

Or supply a card:

```xml
<card-content>
  <question>Can an overriding method omit a checked exception declared by its parent method?</question>
</card-content>
```

Responses start with an interview-ready answer, explain relevant concepts, add code when useful, clarify common misconceptions, and distinguish specifications from implementation details. Avoid unnecessary complexity and unsupported claims.

This skill answers questions; it does not create, import, or modify flashcard decks. For deck generation, see [Flashcards Deck Generator](../flashcards-deck-generator/SKILL.md).

The skill is an instruction file, not a standalone executable. Load it explicitly in environments that do not automatically discover skills.
