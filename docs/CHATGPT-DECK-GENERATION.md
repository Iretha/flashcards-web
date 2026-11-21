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
> - В началото постави YAML frontmatter с `deckId`, `title`, `description` и `formatVersion: 2`.
> - Използвай стабилен `deckId` с малки латински букви, цифри и тирета. **При допълване на съществуващ дек запази същия deckId**.
> - Всяка карта започва с `## card: <key>`. Във всеки заявен езиков блок (`### bg` или `### en`) включи `#### question` и `#### answer`. За допълнителни обяснения използвай `#### simple`, `#### example` и `#### details`.
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

Use the [canonical v2 template](FLASHCARDS-IMPORT-TEMPLATE.md). Preserve card keys when adding translations or updating an existing card.

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

The app accepts existing Markdown v1 files. Generate new files in v2 using the [Flashcards Deck Generator skill](../skills/flashcards-deck-generator/SKILL.md).
