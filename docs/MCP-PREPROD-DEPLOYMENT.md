# MCP local preflight and owner deployment

The owner classifies the existing historically named Cloudflare `production` service as logical **preprod**. Do not create or rename resources. Branch: `feature/auth`. Service: `flashcards-api`. Account: `034dd26900a0d3924b33a8e24289bc8e`. D1 binding: `DB`; database: `flashcards-db`; ID: `5c34da3b-c2af-4f58-96ae-b3e34e46f075`. HTTPS base: `https://flashcards-api.milena-bd-034.workers.dev`.

Dashboard target: https://dash.cloudflare.com/034dd26900a0d3924b33a8e24289bc8e/workers/services/view/flashcards-api/production

## Safeguard

Set runtime `PERSONAL_MCP_URLS_ENABLED=true` in production or development. False, missing or invalid values disable access. No environment classification is required. Use the standard production build.

## Owner commands (PowerShell, repository root)

These are manual commands, not executed during preflight. `--env=` explicitly selects Wrangler's top-level/default configuration: the existing dashboard service named production. Do not use `--env production`: no named Wrangler environment exists. Do not use npm run deploy, which combines remote migration and default deployment without these checks.

```powershell
git branch --show-current
$env:CLOUDFLARE_ACCOUNT_ID = '034dd26900a0d3924b33a8e24289bc8e'
npx wrangler whoami
npx wrangler deployments list --config wrangler.jsonc --env= --name flashcards-api
npx wrangler d1 migrations list DB --remote --config wrangler.jsonc --env=
```

Stop if account, binding/ID, Worker, or pending migration list differ from this target. Record the current active version immediately before deploying. Previously observed version, not a fresh rollback guarantee: d9bede13-6e88-4ba7-b72d-15dfbf4b317c.

```powershell
npx wrangler d1 migrations apply DB --remote --config wrangler.jsonc --env=
npm run build
if ($LASTEXITCODE -ne 0) { throw 'Build failed' }
```

Inspect `dist/server/wrangler.json` before deploying: name flashcards-api, expected D1 ID, unchanged assets and auth bindings, invocation_logs=false. Do not publish .dev.vars. Keep existing authentication secrets and settings. Only then:

```powershell
npx wrangler deploy --config dist/server/wrangler.json --env= --name flashcards-api --keep-vars --var PERSONAL_MCP_URLS_ENABLED:true
```

`--keep-vars` preserves existing dashboard variables; secret bindings must remain untouched. Capture the new deployment version and verify actual deployed variables and binding. Rollback code with the freshly recorded previous version (replace placeholder), retaining the additive schema and all data:

```powershell
npx wrangler rollback PREVIOUS_VERSION_ID --config wrangler.jsonc --env= --name flashcards-api
```

## Dashboard checks before generating a bearer URL

Verify the exact account/service, D1 ID, HTTPS endpoint, and existing authentication settings. Disable invocation logs and confirm deployed observability has invocation_logs=false. The earlier read-only audit saw live invocation logs enabled despite repository configuration disabling them. Verify this again after deployment. Avoid live tail, request tracing, proxy/access analytics exports or client debug logs that persist full request URLs. Query-string redaction does not redact bearer path segments. Application headers cannot prevent platform/client logging. Clear clipboard after use and revoke test credentials; URLs can also leak via screenshots or clipboard history.

## Owner acceptance after deployment

Use a dedicated synthetic account. Verify sign-in, deck listing/editing, sharing, owner-only third-party setting persistence, collaborator denial, personal URL generation and secret-once presentation. Use HTTPS with an MCP SDK client to initialize, list only ping, and invoke ping. Verify invalid, expired and revoked credentials fail and cross-purpose credentials are rejected. Do not paste secrets into shell command arguments or reports. Record only redacted statuses. Revoke every test credential.

ChatGPT status is **UNVERIFIED**. After protocol acceptance, open ChatGPT custom connector management, create a connection, select No authentication if offered and privately paste the dedicated personal URL. Ask ChatGPT to discover and execute ping; expected tool response: Planerox MCP connected. If unavailable or failing, record timestamp, redacted error and request ID, never the URL. Revoke afterward. SDK tests are not a real ChatGPT test.

## Current policy
Only `PERSONAL_MCP_URLS_ENABLED=true` enables MCP. Keep invocation_logs=false and exclude credential-bearing paths from external telemetry.
