# MCP external acceptance checklist

Deployment status is recorded in [README](../README.md). This checklist covers separately authorized external integration acceptance, not an outstanding deployment. Preserve the existing target in `wrangler.jsonc`.

## Safeguard

Set runtime `PERSONAL_MCP_URLS_ENABLED=true` in production or development. False, missing or invalid values disable access. No environment classification is required. Use the standard production build.

## Owner commands (PowerShell, repository root)

Remote operations require explicit owner authorization. Preserve existing configuration, bindings, authentication and secrets; do not add deployment arguments or credentials. Review the configured target and pending migrations before authorizing deployment.

Use `npm run deploy` as the standard entry point. It builds first, applies pending remote migrations automatically, and publishes with `wrangler deploy --keep-vars`; either build or migration failure stops publication.

For incompatible schema transitions, follow the [search transition and recovery precautions](SEARCH-ARCHITECTURE.md): prepare restorable recovery, rehearse locally, pause writers and traffic, then publish compatible code before resuming. Failed publication does not roll back migrations. Rolling back code alone may be incompatible with the migrated schema.

## Dashboard checks before generating a bearer URL

Verify the exact account/service, D1 ID, HTTPS endpoint, and existing authentication settings. Disable invocation logs and confirm deployed observability has invocation_logs=false. Repository configuration alone does not establish all upstream logging behavior; verify it before credential-bearing tests. Avoid live tail, request tracing, proxy/access analytics exports or client debug logs that persist full request URLs. Query-string redaction does not redact bearer path segments. Application headers cannot prevent platform/client logging. Clear clipboard after use and revoke test credentials; URLs can also leak via screenshots or clipboard history.

## Owner acceptance after deployment

Use a dedicated synthetic account. Verify sign-in, deck listing/editing, sharing, owner-only third-party setting persistence, collaborator denial, personal URL generation and secret-once presentation. Use HTTPS with an MCP SDK client to initialize, verify the seven tools listed in [MCP tools](MCP-TOOLS.md), and invoke ping. Verify authorized read tools, denial for nonmembers and NONE decks, and search summaries versus get_card content. On disposable synthetic cards in a READ_WRITE deck, verify create_card and update_card, including omitted/empty answers; verify writes fail for READ decks and revoked collaborators. Verify invalid, expired and revoked credentials fail and cross-purpose credentials are rejected. Do not paste secrets into shell command arguments or reports. Record only redacted statuses. Revoke every test credential.

ChatGPT status is **UNVERIFIED**. After protocol acceptance, open ChatGPT custom connector management, create a connection, select No authentication if offered and privately paste the dedicated personal URL. Ask ChatGPT to discover and execute ping; expected tool response: Planerox MCP connected. If unavailable or failing, record timestamp, redacted error and request ID, never the URL. Revoke afterward. SDK tests are not a real ChatGPT test.

## Current policy
Only `PERSONAL_MCP_URLS_ENABLED=true` enables MCP. Keep invocation_logs=false and exclude credential-bearing paths from external telemetry.
