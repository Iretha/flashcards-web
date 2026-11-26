// Synthetic test data only. example.com URLs are not real interview evidence.
export const v5Fixture = `---
deckId: v3-test
title: V3 mixed deck
formatVersion: 5
primaryLanguage: en
supportedLanguages: [en, bg]
---
## card: task
### cardType: task
### topics
- Java
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
### topics
- Java
### provenance
type: generated
### en
#### question
What is atomicity?
#### answer
An indivisible operation.
`;


