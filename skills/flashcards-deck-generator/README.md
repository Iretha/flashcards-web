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

Новият логически договор изисква id, topic, question, answer и provenance.type;
questionDetails и answerReferences са optional, а sourceName/sourceUrl са задължителни
за sourced/mixed. Provenance и условието се виждат от страната на въпроса.
Предложеният Markdown v3 синтаксис е документиран в
[template](../../docs/FLASHCARDS-IMPORT-TEMPLATE.md), но още не се поддържа от приложението.
Полетата и правилата трябва да се потвърдят при реализацията на parser-а.
Новият договор се издава като UTF-8 Markdown draft, без обещание за import съвместимост.
Legacy import се генерира само при изрична заявка според действителния template,
с отчет за неподдържаните нови изисквания. Следващата фаза изисква отделна задача.
