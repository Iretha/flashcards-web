---
deckId: java-memory-model
title: Java Memory Model
description: Senior Java interview preparation — bilingual, structured flashcards
formatVersion: 3
# PROPOSED v3 CONTRACT — not importable until the application parser, validation and rendering support v3.
# One stable card key connects BG and EN variants. One file represents one deck.
# Required per card: provenance; at least one language with question and answer.
# Optional: interviewPriority, difficulty (integers 1–5), questionDetails, answerReferences.
# questionDetails and answer are Markdown; examples belong in answer, task code in questionDetails.
# provenance: sourced (question found in source), mixed (adapted from source), generated (AI-created).
# sourced/mixed require a verified sourceName and sourceUrl. Never invent a source.
# answerReferences verify answer claims and are NOT evidence of the question's origin.
# This document is a format proposal; field syntax must be aligned with the parser before activation.
---

## card: volatile-atomicity

### interviewPriority: 5

### difficulty: 3

### provenance
type: generated

### answerReferences
- title: Java Language Specification §17.4
  url: https://docs.oracle.com/javase/specs/jls/se25/html/jls-17.html#jls-17.4

### bg

#### question
Защо `volatile` не гарантира атомарност?

#### answer
`volatile` осигурява гаранции за видимост и подредба, но не прави съставни операции като `count++` атомарни.

`count++` прочита стойността, увеличава я и я записва. Две нишки могат да прочетат една и съща стойност и да загубят увеличение.

```java
class Counter {
    volatile int count;

    void increment() {
        count++; // Не е атомарно
    }
}
```

Ако две нишки прочетат `5`, и двете могат да запишат `6` вместо `7`. За атомарно увеличаване използвай `AtomicInteger.incrementAndGet()` или подходяща синхронизация.

### en

#### question
Why doesn't `volatile` guarantee atomicity?

#### answer
`volatile` provides visibility and ordering guarantees, but it does not make compound operations such as `count++` atomic.

`count++` reads, increments and writes the value. Two threads can read the same value and lose an update.

```java
class Counter {
    volatile int count;

    void increment() {
        count++; // Not atomic
    }
}
```

If both threads read `5`, both may write `6` rather than `7`. Use `AtomicInteger.incrementAndGet()` or suitable synchronization for atomic increments.

---

## card: compile-widening

### interviewPriority: 3

### difficulty: 2

### provenance
type: generated

### answerReferences
- title: Java Language Specification §5.1.2 — Widening Primitive Conversion
  url: https://docs.oracle.com/javase/specs/jls/se25/html/jls-5.html#jls-5.1.2

### bg

#### question
Ще се компилира ли следният Java код?

#### questionDetails
Определи дали присвояването е валидно и какво ще изведе програмата.

```java
int x = 10;
long y = x;
System.out.println(y);
```

#### answer
**Да.** Java позволява неявно разширяващо преобразуване от `int` към `long`.

Изход:

```text
10
```

### en

#### question
Will the following Java code compile?

#### questionDetails
Determine whether the assignment is valid and what the program prints.

```java
int x = 10;
long y = x;
System.out.println(y);
```

#### answer
**Yes.** Java permits an implicit widening primitive conversion from `int` to `long`.

Output:

```text
10
```

---

## card: happens-before

### interviewPriority: 4

### difficulty: 5

### provenance
type: mixed
sourceName: Java Language Specification §17.4.5
sourceUrl: https://docs.oracle.com/javase/specs/jls/se25/html/jls-17.html#jls-17.4.5

### answerReferences
- title: Java Language Specification §17.4.5 — Happens-before Order
  url: https://docs.oracle.com/javase/specs/jls/se25/html/jls-17.html#jls-17.4.5

### bg

#### question
Какво означава `happens-before` в Java Memory Model?

#### answer
`happens-before` е отношение между действия, което определя гаранции за видимост и подредба. Ако A happens-before B, ефектите от A са видими за B според правилата на Java Memory Model.

Отношението включва програмния ред в една нишка и синхронизационни правила, например запис в `volatile` поле преди последващо прочитане на същото поле в синхронизационния ред. То е транзитивно.

### en

#### question
What does `happens-before` mean in the Java Memory Model?

#### answer
`happens-before` is a relationship between actions establishing visibility and ordering guarantees. If A happens-before B, the effects of A are visible to B under the Java Memory Model rules.

The relation includes program order within a thread and synchronization rules, such as a write to a `volatile` field before a subsequent read of that field in the synchronization order. It is transitive.
