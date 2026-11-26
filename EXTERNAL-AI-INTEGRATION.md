# External AI integration

The answer heading provides keyboard-accessible links to ChatGPT, Perplexity and
Claude, including while the stored answer is hidden. Links open a new tab and
encode the prompt in the provider URL query. The prompt includes the resolved
question, effective deck instructions and the selected output
language. It never includes the stored answer. Card content is delimited as
untrusted data. Opening a link discloses that prompt to the selected provider;
URLs may also be retained in browser history or provider telemetry.

No provider API key, automatic answer persistence or study action is involved.
Provider-controlled prefilling/submission and authenticated browser behavior are
not established by local URL-generation tests.

## Per-deck instructions

Edit deck > ChatGPT Instructions edits EN/BG overrides used for all three providers.
Save persists both drafts; Cancel discards them. Restore default changes only the
selected draft until Save. Only owners may save instructions. Overrides must be nonblank strings of at most
10,000 JavaScript string units (UTF-16 code units). Other output languages use the English instruction fallback
and an explicit BCP 47 language request.

Migration 0006 retains legacy defaults on existing decks; new decks use universal
defaults. Defaults live in `src/lib/chatgpt.ts`, not duplicated database text.
Question content and final language requirements are assembled separately from
editable instructions. See the [application contract](docs/FLASHCARDS-V4-SPECIFICATION.md).

External AI card content uses `<card-content>` containing only `<question>`. Delimiter collisions in the question are handled for both tags. Question details remain stored and displayed but are never included in generated prompts.
