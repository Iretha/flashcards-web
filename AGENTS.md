# Repository instructions

## Scope and workflow
- Read only relevant code and specification sections. Reuse approved decisions; do not repeat research, plans or reviews. Implement and verify directly unless a material decision or blocker requires owner input.
- Keep reports concise: changes, verification, deviations and blockers. Avoid speculative work and unrelated refactoring.
- Ordinary implementation decisions need no approval. New architecture, infrastructure, dependencies, services, credentials, background processes or material contract changes require explicit owner approval with brief rationale and meaningful alternatives.
- Prefer simple native capabilities. Consult official documentation or run focused experiments only when material uncertainty exists. Custom mechanisms or duplicate responsibilities require demonstrated need and owner approval. Remove superseded artifacts within scope.

## Search and migrations
- Preserve native SQLite FTS5 case-insensitive trigram search and standard Unicode behavior. Free-text minimum: three Unicode code points; exact ID/import-key lookup independent.
- Index question, questionDetails, answer and all translations. Canonical content remains the source of truth; retain minimal card/language-to-rowid mapping, SQL synchronization triggers and existing epoch. No custom search normalization or application-managed dual indexing. Preserve import duplicate normalization.
- Never edit historical migrations. Assess search impact only for relevant changes; update affected triggers, FTS structures and repair SQL as needed. Required reconstruction belongs in the forward SQL migration. Verify affected data preservation, consistency and cascades locally.
- No unconditional reconstruction, custom maintenance runners, application-managed backfills or separate maintenance infrastructure. Manual reconstruction uses the canonical SQL repair procedure.

## Safety and deployment
- Do not commit, push, merge, deploy, run remote migrations or perform production operations without explicit owner authorization. Preserve unrelated working changes, files and storage.
- Preserve `npm run deploy`: build, pending migrations, then `wrangler deploy --keep-vars`; stop on build/migration failure. Preserve secrets, bindings and auth; new deployment arguments or credentials require approval.
- Incompatible migrations require separately authorized coordinated release precautions. Successful migrations are not rolled back by failed publication. No unnecessary deployment reconstruction or full-index checks.

## Verification and documentation
- Complete approved work, fix intermediate errors, and run applicable local tests/typecheck/build. Do not weaken meaningful tests or bypass security, authorization, revision or atomicity requirements.
- Update only affected tests and documentation. Distinguish local from remote verification; report actual limitations.
- README.md: commands. docs/SEARCH-ARCHITECTURE.md: search/runbook. docs/FLASHCARDS-V4-SPECIFICATION.md: existing behavior. docs/card-classification/: approved classification changes and roadmap; use relevant sections only. scripts/repair-search.sql: canonical repair.
