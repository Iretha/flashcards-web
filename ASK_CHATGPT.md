# Ask ChatGPT

The Answer heading includes a keyboard-accessible link, including when the answer is hidden. It sends only the displayed question in the selected language prompt to https://chatgpt.com/ via the q query parameter. Existing translation fallback applies. No API, credentials, stored state or study actions are involved.

External behavior verification (2026-11-22): a web fetch of https://chatgpt.com/?q=Explain+Java+interfaces returned the public logged-out interface and the question text, alongside “Chat stopped unexpectedly”. This is not a browser verification and does not establish composer prefilling or absence of automatic submission. Logged-in Chrome/Edge, anonymous Chrome/Edge, EN/BG prefilling and no automatic submission remain UNCONFIRMED. The external q mechanism may change or trigger behavior controlled by ChatGPT. Flashcards implements no submission action. Consequently full acceptance remains pending real browser verification; reliable prefill-only behavior is not guaranteed.

## Per-deck instructions
Edit deck → ChatGPT Instructions provides EN/BG editing. Save deck persists both drafts; Cancel discards them. Restore default affects only the selected draft until Save. Errors use the existing application error handler and keep the editor open.

Migration 0006_chatgpt.sql adds nullable chatgpt_en/chatgpt_bg overrides and a chatgpt_default marker. Existing rows become legacy (the previous Java interview defaults); future rows use universal defaults, including imported decks. Defaults are centralized in src/lib/chatgpt.ts and are not copied into D1. Only owners can save. Overrides must contain 1–10000 characters. Questions and final language requirements are assembled separately and are not editable. No production migration has been executed.
