---
formatVersion: 5
deckId: java-concurrency
title: Java Concurrency
description: Senior Java Developer interview preparation
visibility: PRIVATE
primaryLanguage: en
supportedLanguages: [en, bg]
# Planned v5 template; verify importer support before use.
# New cards: explicitly supply all five classification fields.
# Existing cards: preserve classification unless explicitly requested.
# Metadata patches by presence; omitted fields/languages are preserved.
# Empty answer clears; omitted answer preserves.
# Task details required in every retained language.
# See FLASHCARDS-V5-SPECIFICATION.md and generator CLASSIFICATION-GUIDELINES.md.
---

## card: race-condition

### topics
- CONCURRENCY
- THREAD SAFETY

### priority: 1
### likelihood: 2
### creationMode: AI
### cardType: question

### en
#### question
What is a race condition?
#### answer
A race condition occurs when program correctness depends on the timing or ordering of concurrent operations. Two threads incrementing a shared counter without synchronization may lose updates.

### bg
#### question
Какво представлява race condition?
#### answer
Race condition възниква, когато коректността на програмата зависи от времето или реда на конкурентните операции. Две нишки, увеличаващи общ брояч без синхронизация, могат да загубят актуализации.

## card: thread-safe-counter

### topics
- CONCURRENCY
- THREAD SAFETY
- ATOMIC OPERATIONS

### priority: 2
### likelihood: 2
### creationMode: AI
### cardType: task

### en
#### question
Implement a thread-safe counter.
#### questionDetails
Implement a counter initialized to zero. Support concurrent increments, prevent lost updates and provide a method for reading the current value.
#### answer
```java
import java.util.concurrent.atomic.AtomicInteger;

public class Counter {
    private final AtomicInteger value = new AtomicInteger();

    public void increment() {
        value.incrementAndGet();
    }

    public int get() {
        return value.get();
    }
}
```
AtomicInteger provides atomic increment operations, preventing lost updates.

### bg
#### question
Реализирай thread-safe брояч.
#### questionDetails
Реализирай брояч с начална стойност нула, който поддържа конкурентно увеличаване, предотвратява загубени актуализации и предоставя метод за прочитане на текущата стойност.
#### answer
```java
import java.util.concurrent.atomic.AtomicInteger;

public class Counter {
    private final AtomicInteger value = new AtomicInteger();

    public void increment() {
        value.incrementAndGet();
    }

    public int get() {
        return value.get();
    }
}
```
AtomicInteger предоставя атомарни операции за увеличаване, които предотвратяват загубените актуализации.
