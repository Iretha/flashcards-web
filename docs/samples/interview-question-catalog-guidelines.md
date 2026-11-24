# Interview Question Catalog — Preparation Guidelines

## 1. Purpose and scope

Prepare maintainable Markdown catalogs of technical interview questions for mainstream Java Developer and Senior Java Developer roles, including backend roles. A catalog is a research and selection artifact, not an answer bank or an import-ready flashcard deck. Questions and metadata are written in English (retain the existing column name `Вероятност` for compatibility). Do not optimize for specialist DBA, infrastructure or academic interviews unless explicitly requested.

Current catalogs: `database-interview-questions.md` (DBMS), `sql-interview-questions.md`, `nosql-interview-questions.md`, and `jdbc-interview-questions.md`. Prefer one catalog per coherent subject; avoid excessive fragmentation. Future subjects may include Java, Spring, JPA and Hibernate. Confirm new subject boundaries with the user.

## 2. Workflow

1. Read the existing catalog, related catalogs and any supplied original question list. Preserve original questions and metadata. Identify the intended audience and scope.
2. Identify thematic areas and meaningful subtopics. Assign priorities based on relevance to the target roles, independently of existing coverage. Present the proposed areas for review.
3. Tag existing questions with every directly relevant topic; assess coverage and identify gaps. Check related catalogs before proposing additions.
4. Research one thematic area at a time, prioritizing high-priority areas. Seek documented real interview questions first, then credible preparation materials and technical documentation. Retain recoverable source URLs and distinguish evidence types.
5. Compare candidates against all existing questions and against one another. Remove semantic duplicates from the candidate list; flag overlaps with existing questions for review. Prefer clear, distinct knowledge targets, practical scenarios and relevant follow-ups.
6. Present candidate questions in English with topic, evidence, estimated likelihood and any meaningful overlap or wording adaptation. Distinguish main candidates from optional specialist additions. Do not allocate permanent IDs or modify the catalog until the user approves the selection.
7. Add only approved questions, allocate stable IDs, record origin and evidence, and update topic counts and coverage. Continue to the next area after review.
8. Validate the entire catalog and cross-catalog consistency. Report changes, counts, limitations and outstanding issues. Do not claim research or checks that were not performed.

There is no fixed question-count target. If evidence or suitable questions are insufficient, report the gap instead of inventing questions to fill a quota. If a user supplies a target, treat it as a research goal rather than permission to fabricate material or stop collecting relevant approved questions once a quota is reached.

## 3. Question selection and wording

- Assess relevance to general Java interviews, not difficulty alone. Basic questions may be very likely; specialized internals may be unlikely.
- Cover definitions, comparisons, mechanisms, trade-offs, practical scenarios, troubleshooting and coding/query exercises where appropriate.
- Each question should have a clear knowledge target and enough context to be answered accurately. Avoid misleading premises and vendor-independent claims about vendor-specific behavior.
- Preserve original wording unless a revision is approved. Record substantive revisions and their rationale. Do not silently delete, merge or replace existing questions.
- Do not duplicate the same knowledge target across decks. Related questions are acceptable if they test distinct skills (for example, transaction isolation theory versus configuring isolation through JDBC).
- Assign a single owning catalog to each question; retain multiple relevant topic tags and use cross-references where helpful. Moving a question does not change its ID.
- Do not generate full answers at this stage. Optional answer-scope notes may identify concepts to cover later, keyed by stable question ID.

## 4. Evidence and provenance

| Label | Meaning |
| --- | --- |
| `Interview` | A documented report of an actual interview occurrence. Record the source URL and available date, company, role and location. Do not infer missing details. |
| `Interview report (adapted)` | A reported interview topic whose wording was adapted. The report itself may not be independently verified. |
| `Prep` | Interview-preparation material; not proof that the question occurred in a real interview. |
| `Technical` | Technical documentation or reference supporting the concept; not interview evidence. |
| `—` | Source not recorded or verified. |

Use direct, recoverable source links where available. Never invent citations, dates, companies, locations, interview occurrences or frequency counts. A broken or unrecoverable reference is an evidence gap, not verified evidence. User-approved questions without external evidence may be included with `—`. If recording occurrences, count distinct documented interview events, not reposts or multiple links describing the same event. Distinguish exact reported wording from adaptations. Expert likelihood is not a substitute for evidence.

## 5. Topic priority and coverage

Priority measures the importance of a thematic area to the target role, independently of the number of questions or their likelihood.

| Priority | Meaning |
| --- | --- |
| P1 | Critical — core knowledge expected for the target role. |
| P2 | High — important for backend design and development. |
| P3 | Medium — useful, typically requiring less depth. |
| P4 | Low — specialized or less relevant to general Java roles. |

Coverage measures the breadth and adequacy of the selected questions, not their count alone.

| Coverage | Meaning |
| --- | --- |
| 🟢 Good | Core knowledge targets are adequately represented. |
| 🟡 Partial | Useful coverage exists but meaningful gaps remain. |
| 🟠 Weak | Only limited aspects are covered. |
| 🔴 Missing | No meaningful coverage. |

Reassess coverage after additions, moves and deletions. Do not mark a topic Good merely because it has many questions. If an assessment has not been revisited, explicitly mark it as retained or pending reassessment. Use subtopic tables for broad areas when useful.

## 6. Interview likelihood (Вероятност)

Assign every question an integer from 1 to 5. Estimate likelihood across mainstream Java Developer and Senior Java Developer interviews, not DBA interviews, and not exclusively positions requiring a particular product.

| Score | Label | Criterion |
| ---: | --- | --- |
| 5 | 🟢 Very high | Typical/core interview question. |
| 4 | 🟢 High | Highly relevant and likely. |
| 3 | 🟡 Moderate | Plausible but less common. |
| 2 | 🟠 Low | Uncommon or stack/project-specific. |
| 1 | 🔴 Very low | Very unlikely outside academic, DBA or specialist interviews. |

This is an expert ordinal estimate, not a statistical probability, difficulty rating or documented occurrence count. Technical depth alone does not increase likelihood. Topic priority and question likelihood remain independent: a P1 topic may contain a score-1 specialist question. Cross-tabulate scores by topic when reviewing consistency; investigate high-priority topics dominated by low-likelihood questions rather than forcing scores to agree. Never delete low-scoring questions automatically. Explain material reassessments and obtain approval for deletions.

## 7. Stable IDs and origin

IDs are global across the related catalogs. Before allocating, inspect all current catalogs and the allocation history; use the next unused sequential ID above the allocated high-water mark. Never renumber or reuse retired IDs. Preserve IDs when moving or revising the same knowledge target. A replacement testing a new target receives a new ID. At the time of writing, the four database catalogs contain 663 questions and the next ID is 664; verify this before future allocations. Coordinate allocations across agents to avoid collisions.

| Origin | Meaning |
| --- | --- |
| `ORIGINAL` | Question from the initial list. |
| `ORIGINAL_REVISED` | Original question with an approved revision. |
| `ADDED` | Supplementary question, including replacements with a new knowledge target. |

## 8. Markdown document structure

Use UTF-8 Markdown, one authoritative catalog per subject. Include the title, research and selection methodology, likelihood legend, origin and ID rules, evidence legend, question table, topic priorities and coverage, and optional subtopic tables and answer-scope notes. Include links to related catalogs. Keep the shared methodology consistent across documents.

Canonical question table (illustrative row only):

| ID | Question | Origin | Topics | Evidence | Вероятност |
| ---: | --- | --- | --- | --- | ---: |
| 1 | What is a Database? | ORIGINAL | Database Fundamentals | — | 4 |

Use semicolons between topic tags. Store scores as plain integers, not emoji. Escape literal pipes in table cells (`\|`), including inside inline code. Do not insert blank lines within a table. Keep one question per row. The JDBC catalog currently uses a legacy table without Topics and Вероятност; migrate it during its own review, not silently.

Topic coverage table (illustrative):

| Topic | Priority | Questions | Coverage |
| --- | --- | ---: | --- |
| Transactions | P1 | 1 | 🟡 Partial |
| **Unique questions** | | **1** | |

Count a question once per relevant topic and once in the unique total. Topic totals can overlap and must not be summed to obtain the unique total. Answer-scope tables are references, not additional question records.

## 9. Review and validation checklist

- [ ] All approved questions are included; no unapproved additions, deletions or substantive revisions.
- [ ] Every question has a unique global ID; existing IDs and metadata are preserved unless explicitly changed.
- [ ] Every question has a valid origin, meaningful topics, evidence label and integer likelihood 1–5 (flag legacy exceptions).
- [ ] Evidence URLs and interview claims are supported; unresolved evidence is disclosed.
- [ ] Semantic duplicates and cross-catalog ownership have been reviewed.
- [ ] Markdown tables have consistent columns, valid separators and escaped pipes; no broken table blocks.
- [ ] Topic counts, unique totals, likelihood distributions and next ID are recalculated from actual question rows.
- [ ] Topic coverage is reassessed or explicitly marked pending; answer-scope references remain valid.
- [ ] Related catalogs are checked for stale references and unintended modifications.
- [ ] Final report lists changed files, added/moved/revised/deleted counts, score distribution if relevant, checks performed and outstanding limitations.

## 10. Downstream flashcard preparation

Only after question selection is approved, prepare answers in a separate task. Use technically accurate, clear interview-ready answers, useful examples and explanations, and check that each answer addresses the exact question. English is the primary content language; Bulgarian is a translation when requested. Generate import-ready Markdown using the current Planerox Flashcards import specification, not this catalog table format. Verify the current template/version before conversion. Preserve traceability to catalog IDs and do not confuse research evidence with technical answer sources.
