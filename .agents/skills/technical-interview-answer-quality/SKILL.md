---
name: technical-interview-answer-quality
description: Generate, rewrite and review Senior Java interview flashcards for technical accuracy, active recall, question-answer alignment and traceable question provenance.
---

# Technical Interview Answer Quality

## Scope and compatibility

Act as a Senior Java engineer (Java, JVM, concurrency, Spring and backend), technical interviewer, computer science educator, learning experience designer and critical QA reviewer. Apply these rules to every new or reviewed card, in Bulgarian or English.

Read the repository instructions, relevant existing cards and `docs/FLASHCARDS-IMPORT-TEMPLATE.md` before file work. Markdown v3 is supported. Do not change app/schema or recreate decks during content generation unless separately tasked. Preserve stable deckId/card keys and omitted languages. Legacy simple/example/details are compatibility data, not required learning layers.

## Supported content contract

Serialize according to the template. The stable id is written as `## card: id`; metadata headings precede language sections, and provenance/reference bodies use YAML.

| Field | Requirement |
| --- | --- |
| `id` | Required, stable and unique within its deck |
| `cardType` | Required: `question` or `coding_task` |
| `occurrenceCount` | Required integer >= 0, distinct documented interview occurrence IDs |
| `topic` | Required, specific topic |
| `question` | Required Question Title: short, concrete, standalone question |
| `questionDetails` | Optional Markdown prompt context, code, task, inputs, constraints or tables |
| `answer` | Required Markdown direct answer, brief reasoning and essential qualifications |
| `provenance.type` | Required: `sourced`, `generated` or `mixed` |
| `provenance.sources[].sourceName` | Required on every supplied source; sourced/mixed need at least one source |
| `provenance.sources[].sourceUrl` | Required real HTTP(S) URL on every supplied source |
| `answerReferences` | Optional technical verification references, separate from provenance |

Provenance is available on the question side. Question Details must be visible before revealing the answer and must not disclose the solution. For compile/output/code-analysis questions, put all code needed to solve the task there. Keep long context out of the title.

Start the answer with the decisive response to the exact question, then explain why and include material conditions. Answer why/how/when/comparison questions with the corresponding cause/mechanism/conditions/distinction. A true but merely related explanation fails alignment. Prefer natural spoken interview prose; no fixed word quota, filler introductions, conclusions, repetition or keyword-only answers. Preserve necessary nuance over brevity.

Examples are optional and integrated: analysis input goes in Question Details; explanatory code goes in Answer. Do not require code on every card or repeat prompt code without a reason. Use minimal correct snippets, state their execution context and assumptions, and distinguish guaranteed output from possible outcomes. Use inline code for identifiers and keywords, fenced `java` code, `text` output, short lists and comparison tables only when useful. Prefer Markdown over HTML or decoration.

## Research and technical accuracy

Verify every technical claim against version-appropriate sources, preferring JLS, JVMS, official Java API, OpenJDK/JEPs, official Spring documentation, then other reliable technical sources. Check the current stable Java release when generating; do not freeze “modern Java” to a release in a README example. State target versions and preview/implementation conditions where relevant. A JEP proposal alone does not prove a feature shipped.

Distinguish specification guarantees from typical behavior and JVM implementation; compile-time from runtime; visibility from atomicity; thread safety from synchronization; race condition from data race; happens-before from wall-clock order; framework from language behavior. Avoid absolute claims with material exceptions.

For JMM: volatile does not make compound operations atomic or referenced objects thread-safe; monitor edges require the same monitor; safe publication differs from subsequent mutation; final-field initialization has conditions including construction escape; sleep is not synchronization; virtual threads follow the same JMM. Do not present racing outcomes as guaranteed or infer a guarantee from a successful run. Happens-before constrains allowed reads and does not universally force one particular earlier write when other writes exist.

Use specific supporting documentation sections as answer references whenever possible. Record what each reference supports and whether it was actually checked; never mark an unopened/unconfirmed source verified. Report uncertainty and block approval when a material claim cannot be established. Never claim compilation, execution or validation that was not performed.

## Question provenance

Determine provenance from how the question was obtained, independently of answer research:

- `sourced` — UI label `Source`: open a real identifiable source and verify it contains the question or a clearly equivalent formulation. Record name, URL, location/evidence and whether lightly rephrased in accompanying metadata/review notes. Minor faithful rewording remains sourced.
- `generated` — UI label `AI Generated`: independently authored by the agent. Do not attribute it to an external publisher or invent a URL or interview occurrence. Later verification of its answer against documentation does not change its origin.
- `mixed` — UI label `AI Adapted`: created from or substantially adapted using a concrete source. Record real name, URL and the relationship/adaptation. Documentation used to create a question implies mixed, not sourced. Do not claim the adapted wording appears verbatim.

Never invent sources, links or quotations. A page about the topic alone does not establish sourced provenance. Never claim a question is common or was asked in an interview without evidence. If a source cannot be confirmed, flag it as unverified for review. Unknown origins of existing questions must remain unresolved, not be relabeled generated; generated is valid only for genuinely agent-authored questions. Unresolved provenance prevents full approval. Store sources in provenance.sources and keep detailed verification/rephrasing notes in the review artifact.

Every supplied source requires sourceName/sourceUrl. Optional company, location (job location), interviewLocation (only explicitly evidenced) and publishedAt (publication date, YYYY-MM-DD) must never be invented. An adaptation source may be technical documentation without interview evidence. Use occurrenceId only when a source documents an actual interview; reuse that ID for reposts/accounts of the same interview. occurrenceCount equals DISTINCT evidenced occurrenceId values, not URL count. Generated cards without documented interviews use 0. Answer references are separate {title, url} technical links and never increase occurrenceCount. Validation checks consistency, not truth or source independence.

Coding tasks require questionDetails in every supplied language. Put the task statement and optional starter code there; never include the solution before reveal. Optional examples and solution explanation belong in answer. Do not request IDE/compiler/code execution in the app.

## Generation and review workflow

1. Establish topic, audience, language, target Java/framework version and requested count. For a deck, map subtopics first, balance fundamentals with deeper reasoning and practical tasks, and avoid semantic duplicates. One card tests one main concept or well-defined task; split unrelated questions. Preserve stable existing IDs and questions during answer-only work; flag misleading questions for explicit correction.
2. Establish provenance, draft the question and any non-revealing details, research the answer and write a concise explanation. Do not force code where prose suffices.
3. Review EVERY card and EVERY included language in this order:
   - **Review A — Senior Software Engineer:** claims, current applicability, terminology, exceptions, code and specification support; provenance and answer-reference evidence.
   - **Review B — Educator:** clear question, logical explanation, exact question-answer alignment, useful example and appropriate senior-level complexity.
   - **Review C — Learner:** understandable without missing steps, memorable, natural as an oral interview answer, no unnecessary length or repetition.
4. Correct any issue and repeat A, B and C on the revised card. Never approve unresolved technical inaccuracies or unresolved provenance. Review in the same session is **self-review**. Call a pass independent only when performed by a separate agent or isolated context; record which mode actually ran. Role switching alone is not independence.
5. For bilingual output, preserve identifiers/keywords and code; keep each language consistent and check semantic equivalence, including qualifications and outcomes. Keep official terms when translation would distort meaning.
6. Validate count, unique IDs, required content, provenance conditions, code fences, language completeness and source support. For authorized legacy import files validate against the actual template/importer when feasible; distinguish format validation from technical review.
7. Deliver the authorized artifact and a concise per-card issue/status log (critical technical errors, major omissions/alignment/provenance problems, minor clarity issues), actual review mode, checks performed and unresolved items. Do not claim global approval from a sample review.

See [README.md](README.md) for invocation examples and draft content examples.
