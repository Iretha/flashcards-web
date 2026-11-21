---
name: technical-interview-answer-quality
description: Generate, rewrite, and critically review technical interview flashcards with expert accuracy, learner clarity, teaching quality, and strict question-answer alignment. Supports flashcards-web Markdown format v2.
---

# Technical Interview Answer Quality

## Purpose
Produce technically correct, complete, understandable interview answers that directly answer their questions. Apply to Java, JVM, Spring, SQL, concurrency, architecture and other technical subjects. Use the same quality gate for newly generated cards and revisions.

## Mandatory workflow

1. **Identify the exact question.** Determine what is being asked, the expected scope, and whether the question asks for a definition, comparison, mechanism, explanation of why, code outcome, diagnosis, trade-off or design decision. List the essential points that a correct answer must address. Do not silently answer a related question instead.
2. **Research and verify.** Prefer authoritative, version-appropriate primary sources (language specifications, official API documentation, framework documentation). Distinguish normative guarantees from implementation details, common behavior and assumptions. For version-sensitive claims, identify the applicable version. If reliable verification is unavailable, qualify the uncertainty rather than inventing guarantees or citations.
3. **Draft a natural senior-level answer.** Start with a direct answer in the first sentence. Explain the mechanism and its consequence in coherent prose, usually 3–6 sentences, extending only when needed. Use correct terminology but explain non-obvious terms. Include limitations, counterexamples and trade-offs when material to the question. Do not use telegraphic fragments, slash-heavy shorthand, arrow chains or keyword lists as a substitute for explanation.
4. **Create teaching layers.** `simple` should translate the core idea into accessible language without introducing false analogies. `example` must concretely demonstrate the claim, preferably with minimal valid code where useful; state expected versus merely possible outcomes. `details` should add genuine nuance, caveats, edge cases or version context rather than repeating `answer`.
5. **Run four independent review passes:**
   - **Software engineering expert:** Is every claim correct? Are guarantees, assumptions, concurrency properties, API semantics and edge cases distinguished? Would the answer withstand senior-level follow-up questions?
   - **Learner:** Can the reader understand the answer without guessing missing logical steps? Are unfamiliar terms explained and is the example illuminating rather than distracting?
   - **Teacher:** Does the explanation progress from direct answer to reasoning to practical implication? Does it build an accurate mental model without oversimplification or unnecessary detail?
   - **Question-answer alignment examiner:** Does the answer address the *exact* question and every essential sub-question? Is it a direct answer rather than a nearby lecture? Does the example support the answer, and do `simple` and `details` agree with it?
6. **Revise and recheck.** Any failed criterion requires a rewrite of the relevant section, followed by a new review of alignment and technical correctness. Do not mark a card accepted until all gates pass.

## Question-answer alignment test (mandatory per card)

Before accepting an answer, explicitly determine internally:
- What is the one-sentence direct response to this particular question?
- Which key concepts or distinctions must appear for the answer to be complete?
- Does the first sentence answer it, or merely introduce the subject?
- Are all parts of a multi-part question addressed?
- If the question asks **why**, is there a causal explanation? If it asks **how**, is there a mechanism? If it asks **when**, are the conditions stated? If it asks **compare**, are both sides and the deciding difference covered? If it asks about code, is the result justified and uncertainty handled?
- Would the answer still seem appropriate if attached to a different, nearby question? If yes, it may be too generic: make it specific.
- Does the example actually demonstrate the claim under the stated assumptions?
- Are `answer`, `simple`, `example`, and `details` mutually consistent?

Reject when the answer is factually true but does not resolve the question, omits an essential condition, overstates a guarantee, relies on an unspoken assumption, or replaces explanation with jargon.

## Output style

- Write natural, complete sentences suitable for spoken senior-level interviews.
- Default length of `answer`: approximately 70–130 words when needed, not a rigid quota; concise questions may need less. Accuracy and completeness take precedence over word count.
- Put the decisive answer first; then the reasoning and practical significance.
- Prefer clear paragraphs over compressed notes and excessive bullets.
- Avoid vague claims such as “always thread-safe”, “guarantees latest value” or “prevents all reordering” unless rigorously justified.
- Separate guarantees from examples and implementation-specific observations.
- Explain each important technical term on first use within the relevant learning layer.
- Avoid duplicating `answer` verbatim in `simple` or `details`.
- If bilingual, ensure both languages express equivalent claims, not merely similar topics. Review each language independently for accuracy and alignment.
- Preserve original questions and card IDs unless the user authorizes correcting a demonstrably incorrect or misleading question. Report any question changes.

## Flashcards-web Markdown v2

When working with flashcards-web imports, read the current repository template `docs/FLASHCARDS-IMPORT-TEMPLATE.md` before generating or modifying files. Preserve the actual schema rather than assuming it is unchanged. At the time of this skill's creation, the structure is:

```markdown
---
deckId: topic-id
title: Topic title
description: Description
formatVersion: 2
---

## card: stable-card-key

### interviewPriority: 1

### difficulty: 1

### bg

#### question
Question in Bulgarian

#### answer
Direct, complete senior-level answer.

#### simple
Accessible explanation.

#### example
Concrete example or code.

#### details
Nuances and limitations.

### en

#### question
Question in English

#### answer
Direct, complete senior-level answer.

#### simple
Accessible explanation.

#### example
Concrete example or code.

#### details
Nuances and limitations.
```

Use integer `interviewPriority` and `difficulty` ratings from 1–5. Treat priority as an editorial estimate unless supported by measured frequency data. Keep `deckId` and card keys stable for re-import. If editing only answers, do not silently alter questions, examples, ratings or other sections. Preserve omitted-language behavior and any other import requirements in the live template.

## Quality gate / acceptance checklist

For **each card and each included language**, all must pass:

- [ ] Question is understood precisely and answer responds directly.
- [ ] All essential parts of the question are answered.
- [ ] Technical statements are correct for the specified version and conditions.
- [ ] Claims do not exceed what the underlying specification/API guarantees.
- [ ] Answer uses natural complete prose, not compressed shorthand.
- [ ] Learner can follow the causal reasoning.
- [ ] Teacher-level progression is clear and pedagogically useful.
- [ ] `simple` is accurate and genuinely simpler.
- [ ] `example` demonstrates the claim and does not imply unsupported outcomes.
- [ ] `details` adds relevant nuance without contradiction.
- [ ] All language versions are semantically equivalent.
- [ ] Markdown syntax, card keys and required import attributes are valid.

If any item fails, fix and repeat the gate. Never claim an automated importer test or code execution was performed unless it actually was.

## Batch review procedure

1. Inventory all card keys, language sections, ratings and fields; flag missing or duplicate items.
2. Review cards individually, not just representative samples. Keep a concise internal issue log with card key, issue category, severity and correction.
3. Prioritize **critical** (wrong or misleading), **major** (does not answer the question or misses key condition), then **minor** (clarity, style, redundancy).
4. Make targeted edits while preserving unaffected fields and stable IDs.
5. Validate card count, unique keys, language completeness, schema shape and code fences. When feasible, run the actual repository importer/validator and report the result separately.
6. Deliver the revised Markdown and a short summary of substantive changes, unresolved uncertainties and validations actually performed.

## JMM-specific accuracy reminders

- Happens-before constrains visibility and allowed reads; it does not always mean a read must observe one particular earlier write when other writes are permitted.
- `volatile` provides visibility and ordering but not atomicity for compound operations.
- A volatile reference does not make all mutable state of the referenced object thread-safe.
- Monitor unlock/lock guarantees refer to the same monitor.
- Correctly constructed final fields have special initialization guarantees; `this` escape can undermine them.
- Safe publication and safe subsequent mutation are distinct problems.
- `sleep()` is not a synchronization mechanism.
- Virtual threads obey the same JMM rules as platform threads.
- Distinguish the JLS's guarantees from implementation-specific behavior, including VarHandle access modes and low-level fences.
