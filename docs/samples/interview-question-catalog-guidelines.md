# Interview Question Catalog — Preparation Guidelines

## 1. Purpose and scope

Prepare maintainable Markdown catalogs of technical interview questions for mainstream Java Developer and Senior Java Developer roles, including backend roles. A catalog is a research and selection artifact, not an answer bank or an import-ready flashcard deck. Questions, metadata and column names are written in English. Do not optimize for specialist DBA, infrastructure or academic interviews unless explicitly requested.

Current catalogs: `database-interview-questions.md` (DBMS), `sql-interview-questions.md`, `nosql-interview-questions.md`, and `jdbc-interview-questions.md`. Prefer one catalog per coherent subject; avoid excessive fragmentation. Future subjects may include Java, Spring, JPA and Hibernate. Confirm new subject boundaries with the user.

## 2. Workflow

1. Read the existing catalog, related catalogs and any supplied original question list. Preserve original questions and metadata. Identify the intended audience and scope.
2. Identify thematic areas and meaningful subtopics. Assign priorities based on relevance to the target roles, independently of existing coverage. Present the proposed areas for review.
3. Tag existing questions with every directly relevant topic; assess coverage and identify gaps. Check related catalogs before proposing additions.
4. Research one thematic area at a time, prioritizing high-priority areas. Seek documented real interview questions first, then credible preparation materials and technical documentation. Retain recoverable source URLs and distinguish evidence types.
5. Compare candidates against all existing questions and against one another. Remove semantic duplicates from the candidate list; flag overlaps with existing questions for review. Prefer clear, distinct knowledge targets, practical scenarios and relevant follow-ups.
6. Present candidate questions in English with all relevant topics, calculated priority, evidence, estimated likelihood and any meaningful overlap or wording adaptation. Distinguish main candidates from optional specialist additions. Use temporary candidate labels during review; assign local catalog IDs and add questions only after the user approves the selection.
7. Add only approved questions, allocate local IDs, record origin and evidence, calculate question priorities, and update topic counts and coverage. Continue to the next area after review.
8. Validate the entire catalog and cross-catalog consistency. Report changes, counts, limitations and outstanding issues. Do not claim research or checks that were not performed.

There is no fixed question-count target. If evidence or suitable questions are insufficient, report the gap instead of inventing questions to fill a quota. If a user supplies a target, treat it as a research goal rather than permission to fabricate material or stop collecting relevant approved questions once a quota is reached.

## 3. Question selection and wording

- Assess relevance to general Java interviews, not difficulty alone. Basic questions may be very likely; specialized internals may be unlikely.
- Cover definitions, comparisons, mechanisms, trade-offs, practical scenarios, troubleshooting and coding/query exercises where appropriate.
- Each question should have a clear knowledge target and enough context to be answered accurately. Avoid misleading premises and vendor-independent claims about vendor-specific behavior.
- Preserve original wording unless a revision is approved. Record substantive revisions and their rationale. Do not silently delete, merge or replace existing questions.
- Do not duplicate the same knowledge target across decks. Related questions are acceptable if they test distinct skills (for example, transaction isolation theory versus configuring isolation through JDBC).
- Assign a single owning catalog to each question; retain multiple relevant topic tags and use cross-references where helpful. When moving a question, assign an ID in the destination catalog and update affected references in both catalogs.
- Do not generate full answers at this stage. Optional answer-scope notes may identify concepts to cover later, keyed by catalog filename and local question ID.

## 4. Evidence and provenance

| Label | Meaning |
| --- | --- |
| `Interview` | A documented report of an actual interview occurrence. Record the source URL and available date, company, role and location. Do not infer missing details. |
| `Interview report (adapted)` | A reported interview topic whose wording was adapted. The report itself may not be independently verified. |
| `Prep` | Interview-preparation material; not proof that the question occurred in a real interview. |
| `Technical` | Technical documentation or reference supporting the concept; not interview evidence. |
| `—` | Source not recorded or verified. |

Use direct, recoverable source links where available. Keep source type separate from verification status: retain available URLs with an explicit unverified or not-reverified qualifier rather than replacing them with `?`. A technical reference does not establish that a question was asked in an interview. Never invent citations, dates, companies, locations, interview occurrences or frequency counts. A broken or unrecoverable reference is an evidence gap, not verified evidence. User-approved questions without external evidence may be included with `—`. If recording occurrences, count distinct documented interview events, not reposts or multiple links describing the same event. Distinguish exact reported wording from adaptations. Expert likelihood is not a substitute for evidence.

## 5. Topic priority and coverage

Priority measures the importance of a thematic area to the target role, independently of the number of questions or their likelihood.

Every question has a `Priority` column immediately after `Topics`. Calculate it from all directly relevant topic priorities: choose the highest priority, where P1 > P2 > P3 > P4 (the smallest numeric suffix). For example, P2 and P1 topics produce P1; a single P3 topic produces P3. For each topic tag, use its documented priority or, if the catalog defines priorities by subtopic instead, the priority of the explicitly assigned subtopic. Do not also include the parent priority for that same tag: otherwise it could override the more specific classification. Combine this value with priorities of the other relevant topic tags using the same highest-priority rule. Record subtopic membership explicitly in tags or a complete local-ID mapping; never infer it from question wording or historical ID ranges. Every applicable topic or subtopic must have a documented priority. Cross-catalog topic tags must point to the authoritative priority table. If a priority or mapping is missing, flag the gap for review instead of assigning a default. Do not infer priority from likelihood, difficulty or question count. Recalculate it whenever topic tags or topic priorities change.

| Priority | Meaning |
| --- | --- |
| P1 | Critical — core knowledge expected for the target role. |
| P2 | High — important for backend design and development. |
| P3 | Medium — useful, typically requiring less depth. |
| P4 | Low — specialized or less relevant to general Java roles. |
| P5 | Very Low — rarely relevant to the target role. |

Existing P1–P4 meanings and values are retained; no question reassessment is implied.

Coverage measures the breadth and adequacy of the selected questions, not their count alone.

| Coverage | Meaning |
| --- | --- |
| 🟢 Good | Core knowledge targets are adequately represented. |
| 🟡 Partial | Useful coverage exists but meaningful gaps remain. |
| 🟠 Weak | Only limited aspects are covered. |
| 🔴 Missing | No meaningful coverage. |

Reassess coverage after additions, moves and deletions. Do not mark a topic Good merely because it has many questions. If an assessment has not been revisited, explicitly mark it as retained or pending reassessment. Use subtopic tables for broad areas when useful.

## 6. Interview likelihood

Use the target scale: 1 is highest likelihood, 5 is lowest. Convert attested historical 5-highest values exactly once as 6 − old, using the reviewed per-file manifest and source hash; never infer a scale from numbers. Missing/null likelihood becomes 3 in final new-card state, without inversion. Preserve historical evidence and editorial origin; use app creationMode UNKNOWN absent reliable attestation.

Assign every question an integer from 1 to 5. Estimate likelihood across mainstream Java Developer and Senior Java Developer interviews, not DBA interviews, and not exclusively positions requiring a particular product.

| Score | Label | Criterion |
| ---: | --- | --- |
| 1 | 🟢 Very High | Typical/core interview question. |
| 2 | 🟢 High | Highly relevant and likely. |
| 3 | 🟡 Medium | Plausible but less common. |
| 4 | 🟠 Low | Uncommon or stack/project-specific. |
| 5 | 🔴 Very Low | Very unlikely outside academic, DBA or specialist interviews. |

This is an expert ordinal estimate, not a statistical probability, difficulty rating or documented occurrence count. Technical depth alone does not increase likelihood. Topic priority and question likelihood remain independent: a P1 topic may contain a score-5 specialist question. Cross-tabulate scores by topic when reviewing consistency; investigate high-priority topics dominated by low-likelihood questions rather than forcing scores to agree. Never delete low-likelihood questions automatically. Explain material reassessments and obtain approval for deletions.

## 7. Local numbering and origin

Question IDs are local to each catalog. Number questions consecutively in table order, starting at 1 in every file; the same ID may appear in different catalogs. New questions appended to a catalog receive the next local ID (the current question count plus 1). After approved insertions, deletions, moves or reordering, renumber affected catalogs to keep numbering consecutive and update all affected references, including evidence notes, subtopic ID ranges and answer-scope tables. Qualify cross-catalog references with the catalog filename and local ID. Preserve question content, origin and other metadata when renumbering. Local IDs are positional and may change; they are not permanent identifiers. Update references outside the catalog when present, including downstream artifacts, and report any references that cannot be updated. A replacement with a new knowledge target must be approved and must not inherit the replaced question's evidence or answer-scope notes without review.

| Origin | Meaning |
| --- | --- |
| `ORIGINAL` | Question from the initial list. |
| `ORIGINAL_REVISED` | Original question with an approved revision. |
| `ADDED` | Supplementary question, including replacements with a new knowledge target. Preserve its origin when moving it between catalogs. |

## 8. Markdown document structure

Use UTF-8 Markdown, one authoritative catalog per subject. Include the title, research and selection methodology, likelihood legend, origin and ID rules, evidence legend, question table, topic priorities and coverage, and optional subtopic tables and answer-scope notes. Include links to related catalogs. Keep the shared methodology consistent across documents.

Canonical question table (illustrative row only):

| ID | Question | Origin | Topics | Priority | Evidence | Likelihood |
| ---: | --- | --- | --- | --- | --- | ---: |
| 1 | What is a Database? | ORIGINAL | Database Fundamentals | P3 | — | 2 |

Use semicolons between topic tags. Store scores as plain integers, not emoji. Escape literal pipes in table cells (`\|`), including inside inline code. Do not insert blank lines within a table. Keep one question per row.

Topic coverage table (illustrative):

| Topic | Priority | Questions | Coverage |
| --- | --- | ---: | --- |
| Transactions | P1 | 1 | 🟡 Partial |
| **Unique questions** | | **1** | |

Count a question once per relevant topic and once in the unique total. Topic totals can overlap and must not be summed to obtain the unique total. Answer-scope tables are references, not additional question records.

## 9. Review and validation checklist

- [ ] All approved questions are included; no unapproved additions, deletions or substantive revisions.
- [ ] Question IDs in each catalog are consecutive in table order, starting at 1, with no gaps or duplicates; affected references are updated and question metadata is preserved.
- [ ] Every question has a valid origin, meaningful topics, Priority matching the highest applicable topic or subtopic priority (P1 > P2 > P3 > P4), evidence label and integer likelihood 1–5 (flag legacy exceptions).
- [ ] Every topic priority resolves to a documented authoritative table; subtopic mappings cover all applicable questions and use current local IDs.
- [ ] Evidence types and verification status are distinguished; interview claims are supported and unresolved evidence is disclosed.
- [ ] Semantic duplicates and cross-catalog ownership have been reviewed.
- [ ] Markdown tables have consistent columns, valid separators and escaped pipes; no broken table blocks.
- [ ] Topic counts, unique totals, likelihood distributions and next ID are recalculated from actual question rows.
- [ ] Topic coverage is reassessed or explicitly marked pending; answer-scope references remain valid.
- [ ] Related catalogs are checked for stale references and unintended modifications.
- [ ] Final report lists changed files, added/moved/revised/deleted counts, score distribution if relevant, checks performed and outstanding limitations.

## 10. Downstream flashcard preparation

Only after question selection is approved, prepare answers in a separate task. Use technically accurate, clear interview-ready answers, useful examples and explanations, and check that each answer addresses the exact question. Catalogs remain English-only. Downstream translations may be prepared separately when explicitly requested. Generate import-ready Markdown using the current Planerox Flashcards import specification, not this catalog table format. Verify the current template/version before conversion. Preserve traceability to the catalog filename and current local question ID and do not confuse research evidence with technical answer sources.
