# Repository instructions

## Architecture and owner approval
- Architectural and infrastructure decisions require explicit owner approval before implementation. Present the problem, proposed solution, alternatives, trade-offs and justification before requesting approval.
- Do not independently introduce services, Workers, databases, administrative endpoints, external dependencies, credentials, background processes or architectural abstractions.
- Ordinary implementation decisions within approved architecture need no separate approval. Prefer simple, maintainable solutions using existing infrastructure and native platform capabilities. Do not add speculative functionality.
- Do not preserve unnecessary implementations merely because they exist. When replacing an implementation, remove superseded code, scripts, configuration, dependencies, tests and documentation. Multiple mechanisms for one responsibility require demonstrated need and owner approval.

## Search index architecture
- Canonical card content is the single source of truth. Use native SQLite FTS5 case-insensitive trigram tokenization and accept standard FTS5 Unicode behavior.
- Free-text search requires at least three Unicode code points; exact identifier and import-key lookup remain independent of this minimum.
- Cover question, questionDetails, answer and all supported translations. Maintain only a minimal card/language-to-rowid mapping without duplicating searchable text.
- Ordinary card mutations synchronize search automatically through SQL triggers. Preserve the simplified epoch mechanism for read consistency.
- Do not introduce custom search normalization or application-managed dual indexing. Preserve import duplicate-detection normalization independently.

## Database migrations and search index maintenance
For changes to canonical card schema, searchable fields, translation structure, JSON content structure, FTS configuration, search mapping, synchronization triggers, or relevant foreign keys/cascades:
1. Assess search index impact.
2. Update affected SQL triggers and FTS structures where necessary.
3. Include required index reconstruction directly in the corresponding forward SQL migration.
4. Update scripts/repair-search.sql if the reconstruction procedure changes.
5. Verify consistency, trigger behavior and canonical data preservation through local migration tests.
6. Update affected documentation and regression tests.

Never modify historical migrations. Do not rebuild the complete index for ordinary mutations or unrelated schema changes. Do not add unconditional deployment reconstruction, application-managed backfills, custom maintenance runners, remote transport adapters or separate maintenance infrastructure. Manual full reconstruction must use the documented canonical SQL repair procedure.

## Deployment
- Preserve npm run deploy: build first, automatically apply pending migrations, then publish; stop if build or migration fails. Preserve wrangler deploy --keep-vars.
- Preserve environment configuration, secrets, authentication settings and database bindings. Additional deployment arguments or credentials require explicit owner approval.
- Do not run unnecessary reconstruction or full-index verification during ordinary deployment.
- Document special precautions for migrations incompatible with the deployed application. Successful migrations are not rolled back by failed application deployment.

## Production and repository safety
- Production operations, remote migrations and remote maintenance require explicit owner authorization. Do not deploy, commit or push unless authorized.
- Preserve unrelated working tree changes. Do not delete unrelated files, databases or storage directories. Clearly distinguish local verification from remote and production verification.

## Implementation and verification
- Complete approved implementation through ordinary intermediate refactoring errors; resolve outdated tests, typecheck errors and incomplete documentation.
- Do not weaken meaningful regression tests to obtain passing results. Preserve functional and security requirements.
- Run applicable local verification before declaring completion. Report genuine blockers with concrete evidence and continue independent work where feasible.
- Keep implementation, documentation, specifications and tests synchronized; accurately report remaining limitations.

## Documentation responsibilities
README.md contains primary commands. [Search runbook](docs/MCP-FTS-ROLLOUT.md) contains architecture rationale and operational procedures. [Current specification](docs/FLASHCARDS-V4-SPECIFICATION.md) defines application behavior. scripts/repair-search.sql is the executable canonical reconstruction procedure; forward SQL migrations own versioned schema changes and required reconstruction. Keep extensive technical details in those documents rather than duplicating them here.
