---
deckId: java-memory-model
title: Java Memory Model
description: Senior Java interview preparation — bilingual cards with progressive explanations
formatVersion: 2
# This file can be imported directly. Keep deckId and card keys stable.
# Each card may include bg, en, or both. Each language needs question and answer.
# simple, example, and details are optional. Omitted sections and languages stay stored on re-import.
# Optional card ratings go before the first language. Use integers 1–5 (1 = lowest/easiest, 5 = highest/hardest).
# Omitted ratings stay stored on re-import. A supplied rating replaces the previous one.
# For a partial translation, keep the deckId and card key and include just the new language.
# Legacy v1 files with unkeyed H2 questions remain supported.
---

## card: volatile-atomicity

### interviewPriority: 5

### difficulty: 3

### bg

#### question
Защо `volatile` не гарантира атомарност?

#### answer
`volatile` осигурява видимост и гаранции за подредба, но не прави съставни операции като `count++` атомарни.

#### simple
`count++` всъщност означава: прочети стойността, увеличи я и я запиши. Две нишки могат да прочетат една и съща стара стойност и да загубят едно увеличение.

#### example
Две нишки увеличават един и същ брояч:

```java
class Counter {
    volatile int count = 0;

    void increment() {
        count++; // Не е атомарно
    }
}
```

Ако и двете прочетат `5`, и двете могат да запишат `6` вместо очакваното `7`.

#### details
`volatile` предоставя гаранции за видимост и подредба според Java Memory Model. За атомарно увеличаване използвай `AtomicInteger.incrementAndGet()` или синхронизация.

### en

#### question
Why doesn't `volatile` guarantee atomicity?

#### answer
`volatile` provides visibility and ordering guarantees but does not make compound operations such as `count++` atomic.

#### simple
`count++` means read the value, increment it, and write it back. Two threads may read the same old value and lose an update.

#### example
Two threads increment a shared counter:

```java
class Counter {
    volatile int count = 0;

    void increment() {
        count++; // Not atomic
    }
}
```

If both read `5`, both may write `6` rather than the expected `7`.

#### details
`volatile` establishes visibility and ordering guarantees under the Java Memory Model. For atomic increments, use `AtomicInteger.incrementAndGet()` or synchronization.

---

## card: happens-before

### interviewPriority: 4

### difficulty: 5

### bg

#### question
Какво означава `happens-before` в Java Memory Model?

#### answer
`happens-before` е отношение, което гарантира видимостта и подредбата на ефектите от едно действие спрямо друго.

#### simple
Ако действие A е `happens-before` действие B, B трябва да вижда ефектите от A, които са релевантни за тази гаранция.

#### example
Една нишка записва данни и след това поставя `volatile` флаг на `true`. Друга нишка, която прочете `true` от този флаг, може да види и предходните записани данни.

#### details
Програмният ред в една нишка и синхронизационни действия като volatile write/read и monitor unlock/lock създават `happens-before` отношения. Отношението е транзитивно.

### en

#### question
What does `happens-before` mean in the Java Memory Model?

#### answer
`happens-before` is a relation that guarantees ordering and visibility of the effects of one action with respect to another.

#### simple
If action A happens-before action B, B must observe the effects of A covered by that guarantee.

#### example
One thread writes data and then sets a `volatile` flag to `true`. Another thread that reads `true` from the flag can also see the earlier data writes.

#### details
Program order within a thread and synchronization actions such as volatile write/read and monitor unlock/lock establish happens-before relationships. The relation is transitive.
