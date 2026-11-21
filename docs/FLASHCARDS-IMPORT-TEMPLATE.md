---
deckId: java-memory-model
title: Java Memory Model
description: Senior Java interview preparation — visibility, ordering and concurrency
---

## What is the Java Memory Model (JMM)?

The **Java Memory Model** defines the rules for how threads interact through shared memory, including visibility and ordering guarantees.

---

## What does happens-before mean?

A **happens-before** relationship guarantees that the effects of an earlier action are visible to a later action.

For example, a write to a `volatile` variable happens-before a subsequent read of that same variable that observes it under the JMM ordering rules.

---

## Why does volatile not make count++ atomic?

`count++` involves reading, incrementing, and writing the value. `volatile` provides visibility and ordering guarantees, but does not turn that sequence into a single atomic operation.

```java
volatile int count = 0;

// Not atomic:
count++;

// Atomic alternative:
AtomicInteger atomicCount = new AtomicInteger();
atomicCount.incrementAndGet();
```
