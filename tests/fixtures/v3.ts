// Synthetic test data only. example.com URLs are not real interview evidence.
export const v3Fixture = `---
deckId: v3-test
title: V3 mixed deck
formatVersion: 3
---
## card: task
### cardType: coding_task
### topic: Java
### occurrenceCount: 1
### provenance
type: mixed
sources:
  - sourceName: Interview account
    sourceUrl: https://example.com/interview
    occurrenceId: interview-one
    company: Example
    location: Sofia
    interviewLocation: Remote
    publishedAt: '2026-11-21'
  - sourceName: Same interview repost
    sourceUrl: https://example.com/repost
    occurrenceId: interview-one
  - sourceName: Adaptation reference
    sourceUrl: https://example.com/reference
### answerReferences
- title: Technical reference
  url: https://example.com/technical
### bg
#### question
Имплементирай брояч.
#### questionDetails
\`\`\`java
int count = 0;
// ### en
\`\`\`
#### answer
Използвай AtomicInteger.
### en
#### question
Implement a counter.
#### questionDetails
\`\`\`java
int count = 0;
\`\`\`
#### answer
Use AtomicInteger.
---
## card: question
### cardType: question
### topic: Java
### occurrenceCount: 0
### provenance
type: generated
### en
#### question
What is atomicity?
#### answer
An indivisible operation.
`;

