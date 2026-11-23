# MCP create_card idempotency

Apply migration 0017 before deploying code that accepts idempotency_key. No remote migration or deployment is performed by this change. Older code can coexist with the new table.

Keys are scoped by authenticated user and operation. Validated, trimmed question and answer, deck ID and optional language form the canonical payload. Omitted language differs from an explicit language. Different payloads return CONFLICT. Calls without keys retain existing behavior.

Receipts and card/FTS writes commit in the same D1 batch. The unique primary key arbitrates competing requests; a losing batch rolls back and reads the winning receipt. Deck revision checks also protect concurrent changes. Retries always check current deck write permission before returning a receipt.

Retention: receipts are retained indefinitely, including after card deletion, to prevent delayed retries from recreating deleted cards. No automatic time-based cleanup is safe under this contract. Cleanup is permitted only when the principal is permanently retired and all its credentials are revoked; delete that principal's receipts in bounded batches after retirement. Do not delete receipts merely because a card or deck was deleted. Payloads contain card content and should receive the same database access protections as cards.
