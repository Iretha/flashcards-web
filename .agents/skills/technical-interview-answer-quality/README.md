# Technical Interview Answer Quality — ръководство

Skill за генериране, редактиране и проверка на Senior Java interview флашкарти: Java, JVM, concurrency, Spring и backend. Правилата са в [SKILL.md](SKILL.md); генераторът на тестета ги използва като общ договор.

## Използване

Посочи името `$technical-interview-answer-quality` или поискай прочитане на `.agents/skills/technical-interview-answer-quality/SKILL.md`. Наличието в Git не гарантира автоматично зареждане във всеки AI инструмент.

Ново тесте:

```text
Прочети skills/flashcards-deck-generator/SKILL.md и общия quality skill.
Създай draft с 20 Senior Java concurrency карти на български и английски.
Определи подтемите, посочи целевата стабилна Java версия, провери източниците
и всяка карта с Review A, B, C. Не променяй template и не импортирай.
```

Отделна карта:

```text
Използвай technical-interview-answer-quality. Създай една английска карта
за причината volatile count++ да не е атомарно. Без код, ако не е необходим.
Дай provenance, отделни answerReferences и резултат от A/B/C self-review.
```

Проверка:

```text
Приложи skill-а към [файл]. Провери всяка карта и всеки език в ред A Engineer,
B Educator, C Learner. Не редактирай файла; върни проблеми по id, корекции,
проверени източници и нерешени въпроси. Не приемай неизвестен произход за generated.
Обозначи self-review; независим преглед има само с отделен агент/изолиран контекст.
```

При разрешена редакция поправи проблемите и повтори трите проверки. Проверката на Markdown не доказва техническа коректност.

## Поддържан Markdown v4 формат

Задължителни: стабилен `## card: id`, `cardType`, `topic`,
`provenance` и question (answer required for complete educational content; importer allows omission/empty) за всеки включен език. Coding Task изисква
questionDetails. `provenance.sources` описва произхода или адаптацията.
Източник за доказано независимо интервю има `occurrenceId`; препубликациите
споделят ID. `occurrenceCount` брои уникалните доказани ID, не URL.
Документация може да е източник за адаптация без интервю и тогава няма occurrenceId.
Answer references са отделни технически референции. Не измисляй източници,
дати, компании или места.
Question Details и Answer са Markdown. Кодът за анализ и provenance се виждат преди отговора.
Примерите са контекстуални, без отделен задължителен UI елемент.

Следващите примери са редакционни илюстрации, не import синтаксис.
За import използвай [template](../../../docs/FLASHCARDS-IMPORT-TEMPLATE.md),
Use cardType; do not author occurrenceCount. Responses derive the count.
Поддържаният v4 importer проверява структурата; това не заменя A/B/C review.

## Концептуална карта, AI Generated, без необходимост от код

- id: `volatile-compound-operation`
- topic: Java concurrency
- Question: Why does volatile not make an increment atomic?
- Provenance: `generated` — **AI Generated**; въпросът е независимо създаден за този пример.

Answer:

`volatile` does not make a compound read-modify-write operation atomic. Two threads can read the same value before either writes the incremented value, losing an update. Use an atomic increment operation or protect the complete operation with the same lock.

Answer reference: [JLS SE 25 §17.4.5](https://docs.oracle.com/javase/specs/jls/se25/html/jls-17.html#jls-17.4.5), проверена за happens-before/visibility; тя не е произход на въпроса. Конкретната версия е reference, а не твърдение за най-новата Java.

## Java code-analysis карта

- id: `widening-int-long`
- topic: Java conversions
- Question: Will this Java code compile?
- Provenance: `generated` — **AI Generated**.

Question Details (inside a method body):

```java
int x = 10;
long y = x;
System.out.println(y);
```

Answer:

Yes. Assignment permits widening primitive conversion from `int` to `long`. It prints:

```text
10
```

При реално генериране провери конкретните JLS секции за widening primitive и assignment conversion; този пример не твърди извършена compiler проверка. Кодът не се повтаря в отговора.

## Sourced и mixed

Проверен реален източник: [Oracle Java Tutorials — Questions and Exercises: Variables](https://docs.oracle.com/javase/tutorial/java/nutsandbolts/QandE/questions_variables.html), Questions №5. Страницата е за JDK 8; използваме я за установяване на произход, не като доказателство за актуалност на всички нейни практики.

**Sourced draft:**

- id: `primitive-types`
- topic: Java types
- Question: What are the eight primitive data types supported by the Java programming language?
- Provenance: `sourced` — **Source**; sourceName: Oracle Java Tutorials; sourceUrl: адресът по-горе.
- Evidence/rephrasing note: Questions №5 съдържа същия въпрос; не е преформулиран.
- Answer: `byte`, `short`, `int`, `long`, `float`, `double`, `boolean`, and `char`.

**Mixed draft:**

- id: `primitive-reference-distinction`
- topic: Java types
- Question: Is String a primitive type in Java?
- Provenance: `mixed` — **AI Adapted**; sourceName и sourceUrl: същият Oracle източник.
- Adaptation note: създаден от Questions №5–6 за разграничаване на primitive types от String; не е дословно публикуван въпрос.
- Answer: No. `String` is a class, so a variable of type `String` holds a reference rather than a primitive value.

За тези draft карти добави отделни version-appropriate JLS answer references при техническата проверка. Потвърденият произход не означава автоматично одобрен отговор. Примерите демонстрират формата и не са отчет за преминали независими A/B/C проверки.

## Определяне на provenance

`sourced` изисква действително намерен въпрос или ясно еквивалентна формулировка;
`mixed` е създаден/съществено адаптиран от конкретен източник; `generated` е независимо
създаден от агента. Документация, използвана само за проверка на готов отговор,
е answer reference. Неизвестен произход на съществуваща карта се отбелязва за преглед.
Никога не измисляй URL, цитат или твърдение за реално интервю. Проверявай URL и
подкрепящия пасаж, преди да отбележиш verified.
