# Allow Third-Party Access

Migration `0014_deck_third_party_access.sql` adds `decks.third_party_access` as TEXT NOT NULL DEFAULT 'NONE', constrained to NONE, READ and READ_WRITE. Existing and new/imported decks default to NONE. Apply with the repository's local migration command for development; deployment status is recorded in [README](../README.md).

The existing deck editor shows owners an independent Save third-party access control. New decks start at None; create the deck before configuring access. Existing English UI copy conventions are preserved; the application has no UI message translation catalog. Success and errors are announced with status/alert roles. Nonowners do not receive the setting in the browser deck list.

POST `/api/deck/third-party-access` accepts only id, revision and third_party_access. It uses existing browser session authentication, exact Origin validation and JSON/body limits. An atomic owner-and-revision-qualified UPDATE changes only the setting, revision and updated_at. A stale revision returns 409; reload before retrying. Card data and learning progress are untouched. Ordinary deck editing cannot set this field. Management API field validation rejects it; bearer MCP/management credentials cannot authenticate to this browser endpoint.

`third-party-access.ts` provides a pure permission intersection, a database membership resolver and an SQL predicate for guarded mutations. Only owners and collaborators qualify; SHARED visibility is never consulted. Read requires READ or READ_WRITE and credential read permission. Write additionally requires READ_WRITE and credential write permission. Credential verification remains the caller's responsibility. Absent membership, NONE and unknown setting values deny access.

## MCP credential validity

### Current implementation

Credentials are checked for purpose, expiry and revocation at request admission using primary D1 reads. Credential identity is not propagated to the atomic mutation guard. Mutations enforce current membership, third-party access and applicable revision checks during atomic mutation authorization, but do not recheck credential validity. Already admitted requests may complete mutations after credential revocation or expiration. No guaranteed finite admission-to-mutation exposure interval has been established: request-body upload occurs after authentication and has no application deadline.

### Approved security requirement

MCP credentials must be valid at request admission. The specific credential must also remain valid when the atomic mutation authorization statement executes. Credential revocation committed before atomic mutation authorization must prevent the mutation. Credential expiration must be evaluated at mutation authorization time. Previously committed mutations are not retroactively cancelled.

### Known implementation gap

Admission-time validation alone does not satisfy the approved requirement. Atomic credential revalidation is owner-approved but is not implemented; remediation is pending a separate implementation task. This documentation cleanup does not implement the stronger guarantee or weaken the requirement.

The helper's SQL identifiers must be trusted code constants. This policy does not authorize deck deletion, collaborator/credential management or setting changes. Tool allowlists must continue excluding them. Deck/card content and chat instructions are untrusted data, never authorization inputs.

See [MCP contracts](MCP-TOOLS.md) for tools and credentials. This setting is independent of browser sharing and Management API access.
