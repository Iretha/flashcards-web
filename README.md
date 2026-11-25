# Flashcards

Flashcards uses Astro, React, TypeScript, Tailwind CSS, Cloudflare Workers and D1.
The accepted production baseline is commit `4b130a52f73dad53b857aeae1f96f1fd3599a2f8`.
The owner confirmed successful deployment, including migrations 0018-0020,
canonical data preservation and search-index verification. This does not certify
external AI, authenticated MCP client, provider-delivery or physical-TV checks.

## Local development and verification

Use Node.js >=24 and npm. Copy `.dev.vars.example` to ignored `.dev.vars` and
set a local `ACCESS_CODE`, then run:

```sh
npm ci
npm run db:local
npm run dev
```

Open http://localhost:4335. Restart the command after source edits.
See [local development](docs/LOCAL-DEVELOPMENT.md) for persistence, reset and troubleshooting.

```sh
npm test
npm run test:migration:imp003
npm run typecheck
npm run build
npm run test:e2e
```

The IMP-003 rehearsal uses Wrangler, historical migrations and disposable isolated D1
storage. E2E requires Microsoft Edge and free port 4322 and uses separate disposable storage.

## Deployment

Production operations require explicit owner authorization. Preserve the existing
Worker, D1 binding, environment configuration, authentication and secrets.
`wrangler.jsonc` already identifies `flashcards-api` and `flashcards-db`; do not
replace the configured database ID as part of routine deployment.

```sh
npm run deploy
```

This builds, applies pending remote migrations, then publishes with
`wrangler deploy --keep-vars`; build or migration failure stops publication.
Successful migrations are not rolled back by a failed publication. Review pending
migrations and [incompatible-transition precautions](docs/SEARCH-ARCHITECTURE.md)
before an authorized deployment. Ordinary deployment does not rebuild or fully
verify the search index. Manual reconstruction uses the canonical SQL procedure
in that runbook.

## Documentation

- [Current application specification](docs/FLASHCARDS-V4-SPECIFICATION.md)
- [Markdown import template](docs/FLASHCARDS-IMPORT-TEMPLATE.md), [v4 example](docs/FLASHCARDS-V4-EXAMPLE.md), [v3 compatibility fixture](docs/FLASHCARDS-V3-REFERENCE.md)
- [Deck generation and review](skills/flashcards-deck-generator/README.md)
- [Guarded card replacement](docs/CARD-REPLACEMENT.md)
- [Management API](docs/MANAGEMENT-API.md)
- [MCP tools and credentials](docs/MCP-TOOLS.md), [external acceptance checks](docs/MCP-EXTERNAL-ACCEPTANCE.md)
- [Third-party deck grants](docs/ALLOW-THIRD-PARTY-ACCESS.md)
- [Authentication architecture](docs/AUTH-ARCHITECTURE.md), [configuration and operations](docs/AUTH-SETUP.md)
- [External AI links](EXTERNAL-AI-INTEGRATION.md)
- [Search architecture, migrations and recovery](docs/SEARCH-ARCHITECTURE.md)
- [Repository engineering rules](AGENTS.md)
