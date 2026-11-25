# Flashcards Deck Generator

Генерира нови тестета и допълнения с техническа проверка и проследим произход.
Прочети [SKILL.md](SKILL.md) и общото [ръководство с примери](../../.agents/skills/technical-interview-answer-quality/README.md).
То съдържа отделна карта, концептуален въпрос без код, Java code-analysis, generated,
sourced и mixed примери и процедурата за проверка.

```text
Прочети skills/flashcards-deck-generator/SKILL.md.
Създай draft тесте с 20 Senior Java въпроса за JMM на bg и en.
Покрий visibility, atomicity, ordering и safe publication без дублиране.
Провери произхода и отговорите отделно; изпълни A/B/C за всяка карта.
Не променяй приложението, template или съществуващи тестета.
```

За допълване посочи съществуващото deckId и файла с карти за проверка за дублиране.
За една карта или само review използвай примерните заявки в общото ръководство.
Skill-ът не е самостоятелна CLI програма; зареди инструкциите изрично, ако средата
не открива skills автоматично.

Markdown v4 се поддържа от приложението. Използвай
[template](../../docs/FLASHCARDS-IMPORT-TEMPLATE.md): стабилен `## card: id`,
`cardType`, `topic`, `provenance` и поне един пълен requested-language вариант.
Coding Task изисква `questionDetails`; решението и примерите са в `answer`.

`provenance.sources` съдържа реални източници за произход или адаптация.
Само доказано интервю получава `occurrenceId`; препубликациите споделят същия ID.
`occurrenceCount` брои уникалните доказани интервюта, не URL. Документацията и
`answerReferences` не доказват интервю. Не измисляй дати, компании или места.

Валидирай файла с parser-а и изпълни A/B/C review за всяка карта и език.
Разграничавай синтактична валидация, технически self-review и независим review.
Не импортирай и не пресъздавай тестета без възложена операция.

## Reimport and other languages

Request canonical BCP 47 languages such as de, fr, pt-BR or zh-Hant; bg/en are
examples. Preserve deckId and card keys. Omit an answer to preserve existing content;
include an empty answer heading only to clear intentionally. Complete educational
requests still require complete answers and every-card A/B/C review.
See the [current contract](../../docs/FLASHCARDS-V4-SPECIFICATION.md) for importer
semantics and the template for serialization. v3 is compatibility input; author v4.
Do not author occurrenceCount.


## Markdown v5 transition

For v5 drafts, use [v5 template](../../docs/FLASHCARDS-V5-IMPORT-TEMPLATE.md), [v5 specification](../../docs/FLASHCARDS-V5-SPECIFICATION.md) and mandatory [G-01–G-07 classification guidelines](CLASSIFICATION-GUIDELINES.md). These override v4-specific serialization instructions above for v5 only. Explicitly supply all five classification fields for new cards; preserve existing classification unless explicitly requested. Provenance and A/B/C quality rules remain unchanged. Do not claim import readiness until the actual v5 parser has validated the artifact. Until confirmed cutover, retain the v4 template for v4 imports.
