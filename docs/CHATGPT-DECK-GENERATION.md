# Flashcards — ChatGPT generation template and import rules

This file describes how to ask ChatGPT to generate a ready-to-import Markdown deck for the Flashcards web application.

## Ready-to-copy prompt

> Подготви ми **[БРОЙ] флашкарти** по тема **[ТЕМА]** за **[НИВО/ЦЕЛ]**.
>
> Използвай точно Markdown формата от `docs/FLASHCARDS-IMPORT-TEMPLATE.md` в репозитория `Iretha/flashcards-web`.
>
> Създай **готов за изтегляне UTF-8 .md файл**, не само текст в чата. Името на файла да е кратко, с малки латински букви и тирета, например `java-concurrency.md`.
>
> Изисквания:
> - Един файл представлява един дек.
> - В началото постави YAML frontmatter с `deckId`, `title` и `description`.
> - Използвай стабилен `deckId` с малки латински букви, цифри и тирета. **При допълване на съществуващ дек запази същия deckId**.
> - Всяка карта започва с `## ` и един конкретен въпрос; отговорът е Markdown текст под него.
> - Отделяй картите с ред `---`, извън code blocks.
> - Не поставяй въпроси в YAML, таблици или кодови блокове.
> - Не добавяй въведение, заключение, съдържание или инструкции в самия импортен файл.
> - Въпросите трябва да са уникални **в рамките на дека**. Избягвай семантично повтарящи се въпроси.
> - Отговорите да са ясни, точни и достатъчно кратки за четене на телевизор. При нужда включвай кратък кодов пример в fenced code block.
> - Не измисляй факти. Използвай съвременни практики и версии, когато темата го изисква.
> - Ако поискам **още въпроси за съществуващ дек**, генерирай само новите карти и запази същия `deckId`; не повтаряй вече създадените въпроси, ако са предоставени.
> - Валидирай структурата преди да предоставиш файла.
>
> Език на въпросите и отговорите: **[ЕЗИК]**.

## File structure

```md
---
deckId: unique-deck-id
title: Human-readable deck title
description: Short description
---

## First question?

Answer in Markdown.

---

## Second question?

Answer in Markdown, optionally including lists or fenced code blocks.
```

**Important:** `deckId` is a stable logical deck identifier, not a generated UUID for each card. The application creates card identities. The `---` separating cards must appear on its own line outside fenced code blocks.

## Examples of requests

**New deck:**

> Използвай Flashcards import темплейта. Генерирай 40 въпроса за Java Memory Model на български, с кратки отговори и Java примери само когато помагат. Дай ми готов `java-memory-model.md`.

**Add to existing deck:**

> Използвай Flashcards import темплейта и запази `deckId: java-memory-model`. Добави 15 **нови**, неповтарящи се въпроса за happens-before, safe publication и final fields. Дай ми отделен `.md` файл, който ще импортирам в съществуващия дек.

## Import behavior to expect

- The app offers a preview before importing.
- Existing matching questions in the destination deck are skipped; conflicts in answers require user choice.
- The same question may exist in two different decks.
- Imported cards do not erase existing progress.
- Deck visibility (PRIVATE or SHARED) is chosen **in the app**, not encoded in this Markdown file.

## Compatibility

This template follows the format agreed for Flashcards MVP v1.0. The coding agent must ensure the importer accepts this structure; actual implementation compatibility should be verified after the importer is available.
