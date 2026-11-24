---
formatVersion: 4
title: Java Concurrency
description: Senior Java interview preparation
visibility: PRIVATE
primaryLanguage: en
supportedLanguages: [en, bg]
---

## card: race-condition

### cardType: question
### topic: Java Concurrency
### interviewPriority: 4
### difficulty: 3

### provenance
type: generated
sources: []

### en

#### question
What is a race condition?

#### answer
A race condition occurs when program correctness depends on the timing or ordering of concurrent operations.

**Example**

Two threads incrementing a shared counter without proper synchronization may lose updates.

### bg

#### question
Какво е race condition?

#### answer
Race condition възниква, когато коректността на програмата зависи от времето или реда на изпълнение на конкурентни операции.

**Пример**

Две нишки, които увеличават общ брояч без подходяща синхронизация, могат да загубят обновявания.
