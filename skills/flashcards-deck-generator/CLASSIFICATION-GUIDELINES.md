# Card Classification Guidelines

Owner-approved decisions G-01–G-07 for Markdown v5 generation. These editorial rules do not change importer validation or provenance semantics.

## G-01 — Mandatory Explicit Classification
For every new card explicitly provide topics, priority, likelihood, creationMode and cardType. Evaluate each individually; do not assign defaults indiscriminately.

## G-02 — Topics
Use the deck's primary language and relevant existing topics where appropriate. Avoid redundant synonyms and overly broad topics. Follow v5 normalization and validation. Do not impose a minimum; use an empty list if no suitable topic exists.

## G-03 — Priority
Evaluate importance relative to deck purpose and audience: 1 Critical, 2 High, 3 Medium, 4 Low, 5 Very Low. Evaluate independently of difficulty and likelihood. Do not impose artificial distributions or inflate ratings. Use 3 when insufficient justification exists.

## G-04 — Likelihood
Evaluate expected frequency in the target context: 1 Very High, 2 High, 3 Medium, 4 Low, 5 Very Low. Use verified evidence when available; expert judgment is not measured statistical probability. Do not derive automatically from priority, difficulty, occurrenceCount or source URL counts. Do not impose artificial distributions. Use 3 when insufficient justification exists.

## G-05 — Creation Mode
- MANUAL: the user supplied the specific question or prepared the question list.
- AI: AI independently added the question, including additions from coverage or gap analysis.
- UNKNOWN: the selection initiative cannot be established.

Answer generation, translation, classification and wording improvements do not make user-supplied questions AI-created. User approval of AI-proposed additions does not make them MANUAL. Creation mode is independent of provenance.

## G-06 — Card Type
question requires explanation, comparison, analysis or interpretation; task requires creating, implementing, designing or executing a solution. Code presence alone does not make a task. Tasks require non-empty questionDetails in every language variant; questions do not. Place requirements, constraints, inputs and starter code in questionDetails, solutions and explanations in answer. Do not reveal the solution in the task condition unless necessary. Card type is independent of other classifications and provenance.

## G-07 — Preservation
The AI must always preserve the existing classification of a card unless the user explicitly requests a classification change. Preserve all other classification fields when a specific field change is requested. Recommend changes without applying them absent explicit approval. Omit unchanged classification fields in partial update imports. Classify new cards according to G-01–G-06.
