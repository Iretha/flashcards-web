# Current deck generation prompts

Use the flashcards-deck-generator skill and shared technical-interview answer-quality
rules. Example request:

> Generate a Markdown v4 deck on Java concurrency with English primary content and
> Bulgarian translations. Use stable card keys, cardType, topic, provenance and
> appropriate optional ratings. Include independently verified sources and answer
> references where applicable. Derive occurrence counts from evidenced occurrence
> IDs; do not write occurrenceCount. Put examples, code and explanations inside each
> canonical answer. Put non-revealing task context in questionDetails. Validate the
> final file with the production parser and report the result.

For other languages, replace the requested configuration with canonical BCP 47 codes
such as de, fr, pt-BR or zh-Hant. English/Bulgarian is an example, not a restriction.

For updates, preserve card keys and portable deck identity. Omit an answer to preserve
existing content; include an empty answer heading only to clear it intentionally.
Complete answered-deck requests still require the full educational quality review.
