---
deckId: java-memory-model
title: Java Memory Model
description: Senior Java interview preparation — bilingual, structured flashcards
formatVersion: 4
primaryLanguage: en
supportedLanguages: [en, bg]
# For standard v5 import see FLASHCARDS-V5-IMPORT-TEMPLATE.md and FLASHCARDS-V5-SPECIFICATION.md.
# Historical v4 conversion reference only; direct legacy import is rejected.
# Markdown v4 — retained parser for reviewed conversion to v5.
# One stable card key connects BG and EN variants. One file represents one deck.
# Required per card: provenance and at least one language with a question. Answers may be omitted or empty.
# Required: cardType (question | coding_task), topic, provenance.type.
# Optional: interviewPriority, difficulty (integers 1–5), questionDetails, answerReferences.
# questionDetails and answer are Markdown; examples belong in answer, task code in questionDetails.
# provenance: sourced (question found in source), mixed (adapted from source), generated (AI-created).
# sourced/mixed require at least one verified provenance.sources entry with sourceName and sourceUrl.
# Each source may include company, location (job location), interviewLocation (only when verified), publishedAt (YYYY-MM-DD when known).
# The derived count describes documented interview occurrences, NOT study repetitions.
# answerReferences verify answer claims and are NOT evidence of the question's origin.
# id is serialized as the unique ASCII key in `## card: id` (1-100 letters/digits/_/-).
# Metadata precedes language sections. Each scalar heading appears at most once.
# provenance and answerReferences bodies are YAML, with no YAML aliases.
# YAML: quote dates as strings. sourceName/sourceUrl are required on every supplied source.
# A source without occurrenceId explains the origin/adaptation, NOT an interview occurrence.
# occurrenceId is optional stable text identifying one independently documented interview.
# Assign the SAME occurrenceId to reposts/accounts of that same interview; omit it on technical docs.
# occurrenceCount is automatically derived from DISTINCT nonempty occurrenceId values; do not author it.
# Only use occurrenceId after reviewing real interview evidence at that source URL.
# Syntax validation does not verify external claims; human/content review remains required.
# Lists of answerReferences use {title, url}; HTTP(S) links only, without credentials.
# Each language has question (max 2000 chars), answer (max 20000 chars), questionDetails (max 20000 chars).
# coding_task requires nonempty questionDetails in every supplied language; starter code goes there.
# Omitted languages are preserved on reimport. Supplied language fields merge; metadata replaces as a unit.
# Reserved headings: ## card:, ### <canonical BCP 47 code>, #### question/questionDetails/answer; put literal forms in fences.
# Code fences can use backticks or tildes. Other Markdown headings/tables/lists are content.
# Examples and solution explanations belong inside answer, with no separate explanation controls.
# Import validation errors identify card key, field and reason; v4 apply rejects any invalid card.
# No import migrates old cards; see CARD-REPLACEMENT.md for deliberate recreation.
#
#
# # v4 field reference and update rules
#
# The YAML frontmatter requires `formatVersion: 4`. `deckId` is an optional portable
# source key (maximum 160 characters), not a database ID. Title is at most 160 characters;
# description at most 2000. Visibility is PRIVATE or SHARED (default PRIVATE).
# primaryLanguage and supportedLanguages use canonical BCP 47 codes; supported codes
# must be unique and include the primary. Declare the primary for multilingual decks.
# Existing target language configuration is preserved; incompatible languages fail.
#
# Card key: 1-100 ASCII letters/digits/underscore/hyphen, starting with letter/digit.
# Required metadata: cardType enum question/coding_task, nonempty topic (max 2000),
# provenance object. Optional ratings: interviewPriority/difficulty integers 1-5.
# Provenance type: sourced/mixed/generated. Sources default to []; sourced/mixed
# require a source. Every source requires sourceName and credential-free HTTP(S)
# sourceUrl. Optional company/location/interviewLocation/occurrenceId are nonempty
# strings (max 2000); publishedAt is a real YYYY-MM-DD string. References are optional
# {title, url} entries with nonempty titles and credential-free HTTP(S) links.
#
# Per-language question is nonempty Markdown (max 2000), answer is optional on input
# (max 20000), questionDetails optional (max 20000; required nonempty for coding tasks).
# Missing answer preserves existing content, or initializes empty for a new translation.
# A present empty answer clears it. Empty answers display an em dash. Metadata replaces
# as a unit; omitted languages remain. Examples, code and explanation belong in answer.
# No simple/example/details sections are supported. Literal reserved headings belong
# inside fenced code. Other Markdown headings, lists and tables remain content.
#
# Common errors: missing/unsupported version (only 3/4 accepted), duplicate keys/fields,
# invalid BCP 47 code, unsupported deck language, authored occurrenceCount in v4,
# invalid URL/date/rating, generated provenance with occurrence IDs, missing task details,
# or retired explanation headings. v3 compatibility is described in
# [the historical reference](FLASHCARDS-V3-REFERENCE.md). New files should use v5.
---

# Markdown heading rules: `#### question`, `#### answer` and `#### questionDetails`
# start structural fields. Once a field starts, other headings are ordinary Markdown
# content, except reserved card/language/metadata headings and retired
# `#### simple`, `#### example`, `#### details` outside fences. To quote reserved
# headings literally, use a fenced code block. Content must begin under a supported
# field heading. See docs/FLASHCARDS-V4-SPECIFICATION.md.

## card: volatile-atomicity

### cardType: question
### topic: Java Memory Model
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

### cardType: question
### topic: Java Language
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

### cardType: question
### topic: Java Memory Model
### interviewPriority: 4

### difficulty: 5

### provenance
type: mixed
sources:
  - sourceName: Java Language Specification §17.4.5
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


---

## card: thread-safe-counter-task

### cardType: coding_task
### topic: Java Concurrency
### interviewPriority: 4
### difficulty: 3

### provenance
type: generated
sources: []

### en

#### question
Implement a thread-safe counter.

#### questionDetails
Implement `increment()` and `get()` so concurrent increments are not lost.

```java
interface Counter {
    void increment();
    int get();
}
```

#### answer
Use `AtomicInteger` to perform atomic increments.

```java
import java.util.concurrent.atomic.AtomicInteger;

class AtomicCounter implements Counter {
    private final AtomicInteger count = new AtomicInteger();

    public void increment() { count.incrementAndGet(); }
    public int get() { return count.get(); }
}
```
