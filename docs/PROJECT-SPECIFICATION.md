# Flashcards — Project Specification

**Version:** 1.0  
**Status:** Approved product requirements; implementation in progress  
**Repository:** `Iretha/flashcards-web`  
**Card languages:** Bulgarian and English. Application controls are primarily in English.

## 1. Purpose and scope

Flashcards is a lightweight web application for learning question–answer cards imported from Markdown files. The primary goal is to mark every selected card **learned**, while repeatedly presenting cards that need more practice. It must work on an LG Smart TV through its browser and remote, as well as on laptops and phones.

The first version is a standalone application, separate from Cognitio Prima, using the same core frontend technologies. No native TV or mobile application is required.

### Core user journey

1. Enter username and shared access code.
2. Create a deck or import one or more Markdown files.
3. Select one or several accessible decks.
4. Choose sequential or randomized study, and optionally enable a configurable timer.
5. Study cards, reveal answers, mark learned, repeat, and navigate.
6. Stop and resume later, including on a different device.
7. Inspect progress and difficulty; reset learned status when desired.

## 2. Users and access

- A username and **one shared static access code** are required for entry.
- There is no registration form, email verification, or individual password.
- A new username creates a profile; an existing username resumes its saved data.
- The shared code is validated on the server and stored as a Cloudflare Secret, never embedded in client code or committed.
- Successful entry establishes a persistent, revocable server-validated session; logout/switch-user is supported.
- API operations must validate sessions, and unsuccessful access attempts must be rate-limited.
- **Accepted limitation:** someone who knows the shared code can enter another person's username. This is a convenience access gate, not strong user identity verification.
- User progress and study sessions are separate for each username.

## 3. Decks and visibility

A deck contains a title, optional description, ordered cards, an owner, and visibility.

- **PRIVATE:** visible and editable only by its owner.
- **SHARED:** visible for study by all users, but editable only by its owner.
- Visibility is selected when creating or importing a deck; for multi-file import it can be selected separately for each destination deck.
- The owner may switch PRIVATE ↔ SHARED later without duplicating the deck or changing its ID.
- Switching to SHARED exposes the deck to other users, each with independent progress.
- Switching back to PRIVATE removes other users' access but preserves their existing progress history for possible future sharing.
- Owners can rename, edit, add cards, reorder, and delete cards or decks with confirmation.
- Users can combine accessible shared and private decks in the same study session.

## 4. Markdown import and editing

- Import one or many `.md` files from the computer.
- Import can create a new deck or add/update content in an existing deck.
- A stable deck identifier in file metadata is recommended, but the user may explicitly choose an existing destination deck when it is absent.
- Each card has a question and a Markdown answer; multiline text, lists, code blocks, and formatting must be preserved.
- Legacy Markdown v1 remains valid. For example:

```md
---
deckId: java-memory-model
title: Java Memory Model
description: Interview questions
---

## What is the Java Memory Model?

The Java Memory Model defines visibility and ordering
rules for operations shared between threads.

---

## What is happens-before?

A relation establishing ordering and visibility guarantees.
```

- The parser must distinguish YAML frontmatter, card separators, and horizontal rules/code fences within answers.
- In v1 a heading `##` starts a question. In v2 a heading `## card: <key>` starts a logical card with BG and/or EN sections.
- Import preview reports new and existing cards, added translations, selected translation updates, duplicates, conflicts, and invalid cards.
- Duplicates are checked **within the destination deck only**; the same question is allowed in different decks.
- Question matching normalizes Unicode, case, and whitespace.
- Exact duplicates are skipped. Existing cards retain identity and progress.
- If a matching question has a different answer, ask whether to keep or update; do not silently overwrite.
- Adding questions to an existing deck must not erase earlier cards or progress.
- Users may also add, edit, and delete questions manually.
- The application must use stable card identities across imports and edits.

## 5. Study setup

- Select one or multiple accessible decks.
- Default selection is **unlearned cards**.
- Choose **SEQUENTIAL** (initial presentations follow source order) or **RANDOM**.
- Timer can be enabled or disabled on the setup screen; when enabled, default timeout is **30 seconds**, editable by the user.
- Choose Bulgarian or English. Initialize the choice from the most recently used language.
- Show selected, learned, and remaining counts.
- If a session is unfinished, offer to resume it or start a new one.

## 6. Study interactions

The study screen shows the question, remaining count, optional countdown, and large controls suitable for TV.

| Action | Required behavior |
|---|---|
| Show Answer | Reveal the answer beneath the question and **stop the timer**. Remain on the card until another action. |
| Learned | Mark the card learned for this user, record the learning event, remove it from the active study queue, advance. |
| Repeat | Keep unlearned, record unsuccessful attempt, schedule for later rather than immediately when alternatives exist. |
| Next | Advance without marking learned; the skipped card stays unlearned and eligible for future presentation. |
| Previous | Navigate to previously shown card without incrementing presentations or undoing recorded decisions. |
| Timer expires | If no answer has been revealed, record unsuccessful attempt, keep unlearned, and advance automatically. |
| Pause/Exit | Save and allow continuation. |

- A card is counted as **shown** only on a genuine new study presentation, not on rerender, back-navigation, refresh, or session restore.
- A session finishes when all cards in its selected study set have been marked learned.
- Learned cards no longer appear in ordinary learning sessions but remain visible in the full card list.
- The full list allows an individual card to be marked unlearned again.

## 7. Adaptive repetition

The application uses a lightweight **weighted-random** scheduler, not a full Anki-style spaced-repetition system.

- All eligible unlearned cards remain selectable.
- Cards requiring more unsuccessful attempts receive higher relative selection weights.
- Use bounded weights so difficult cards cannot starve other cards.
- Apply a short cooldown after a card is shown so it does not immediately recur while other eligible cards exist.
- Relax cooldown when few cards remain, ensuring eventual completion.
- In SEQUENTIAL mode, the first presentation of new cards follows deck order, while repeat cards are interleaved.
- In RANDOM mode, eligible cards are selected by weighted random.
- Scheduling is random in selection but deterministic in tests with an injected random source.
- Exact weight formula and cooldown tuning are implementation details; the behavioral requirements above are binding.

## 8. Progress, difficulty and reset

Progress belongs to the **(user, card)** pair, even for shared decks.

Persist at least:
- learned/unlearned status;
- actual presentation count;
- unsuccessful attempt count;
- times learned;
- last shown/learned timestamps;
- enough history to support learning statistics and resets.

Statistics per deck include total, learned, unlearned, completion %, presentations and failures.

The full card list supports sorting by source order, hardest first, easiest first, learned/unlearned and last shown. **Primary difficulty indicator:** number of actual presentations required to learn the card; higher means harder. Retain historical counts across multiple learning cycles.

**Reset decision (approved):**
- Reset a card or all cards in a deck to UNLEARNED.
- **Do not erase** presentation counts, failure counts, learning counts, explanation counters, or history.
- Ensure active study sessions are reconciled or invalidated when reset changes eligibility.

## 9. Session persistence and synchronization

- Save selected decks, ordering, queue/scheduler state, current card, back-navigation history, timer settings, answer visibility, preferred study language, open explanation, and progress.
- Resume after browser refresh, browser closure or switching between PC, phone and TV.
- Server-side D1 is the durable source of truth; local buffering/cache may improve responsiveness.
- Mutations must be idempotent or otherwise safe against retries, so a duplicated request does not inflate counts.
- Concurrent sessions on different devices must not silently overwrite newer state; use versioning/conflict handling.
- Offline support is desirable where feasible, but must not compromise progress correctness.

## 10. TV, desktop and mobile UX

- Responsive, readable, high-contrast layout with large focusable controls and visible focus indicators.
- LG Smart TV browser support through standard keyboard/remote events; verify behavior on the actual TV because webOS versions differ.
- Arrow-key navigation, Enter/OK, Back/Escape where supported, plus visible on-screen controls.
- Desktop mouse and keyboard, and phone touch controls.
- Suggested desktop shortcuts: Enter/Space to reveal answer, Left/Right to navigate, L to learn, R to repeat; do not intercept typing in input fields.
- Markdown answers, including code blocks, must be legible on TV and mobile.
- No essential action may depend on hover or drag-and-drop alone.

## 11. Technology and hosting

- Astro, TypeScript (strict), Tailwind CSS 4, and React islands for interactive interfaces.
- Cloudflare Workers for authenticated API and Cloudflare D1 (SQLite) for durable storage.
- Wrangler for development, migrations and deployment.
- Target **Cloudflare Free** limits; avoid paid external services.
- Store shared access code and session signing secrets in Cloudflare Secrets.
- Use secure cookies, server-side validation/authorization, safe Markdown rendering and appropriate rate limiting.
- No production deployment without owner approval.

## 12. Backup

- Provide export of accessible decks/cards, per-user progress and learning history as JSON.
- Do not include access codes or session secrets.
- Import of backup/restore is **not** required for v1.0.

## 13. Acceptance scenarios

1. Valid shared code + new username creates a user; invalid code denies access.
2. Import a Markdown deck; import it again without duplicate cards.
3. Import an expanded version; new cards are added and existing progress preserved.
4. Conflicting answers are reviewed rather than silently overwritten.
5. Import several decks, then study one or several together.
6. Sequential and random modes behave distinctly.
7. Repeat returns a card later and difficult cards gain higher scheduling weight.
8. Learned removes a card from the active queue.
9. Timer is optional, defaults to 30 seconds when enabled, advances on expiry, and stops on Show Answer.
10. Previous does not increase presentation count.
11. Refresh and cross-device resume preserve session/progress.
12. Two users have independent progress on a shared deck.
13. Private deck is hidden from other users; owner can share and unshare without deleting history.
14. Reset makes cards unlearned without clearing history/statistics.
15. All cards learned completes the session.
16. JSON backup exports valid data.
17. Unauthorized API access to private decks is rejected.
18. Keyboard, remote focus, mouse and touch paths are usable.

## 14. Deliberate exclusions

- Individual passwords, email registration and strong identity verification.
- Native LG TV/mobile applications.
- Advanced spaced-repetition calendar algorithms.
- AI generation inside the application or direct ChatGPT-to-app import (future enhancement).
- Paid infrastructure, complex administration, formal product-planning process.
- Backup restore in the first version.

## 15. Implementation notes

This document records product decisions made before implementation. The coding agent may choose internal schema, endpoints, component boundaries, scheduler constants and minor UI details as long as these requirements hold. If an implementation limitation forces a change to an approved behavior, surface it explicitly rather than silently changing the product contract.

## 16. Bilingual cards and progressive explanations

Each card has a single identity and position. It can contain Bulgarian, English, or both. Each available language has a question and an answer. The simple explanation, practical example, and detailed explanation are optional. Progress, scheduling, and presentation history belong to the card. The editor provides a tab per language.

The study setup starts with the user's last language preference, or English for a new user. The study screen supports BG and EN before and after the answer is shown. Language changes preserve the current card, revealed answer, open explanation, and timer state. The active session stores the language for resume across devices. When a translation is missing, the UI identifies the language it displays. It labels explanations sourced from the other language.

The explanation controls become available after Show Answer. One explanation can be open at a time. Opening a section increments its own counter. Closing it or changing language does not increment the counter. Reset preserves all three counters along with the original presentation statistics.

## Import identity and migration

Markdown v1 remains supported. Legacy questions containing Bulgarian Cyrillic letters default to BG. Other legacy questions default to EN. Existing cards retain their IDs and progress through the D1 migration.

Markdown v2 identifies cards by a key unique within the deck. On the first v2 import, a single existing unkeyed card with a matching normalized question can acquire the incoming key. If the target cannot be identified unambiguously, the import preview asks the user to link or create the card when applicable. After linking, imports can add a language by supplying only that language under the same key. Changed translations require an explicit decision. Missing languages and omitted explanation fields remain stored. An explicitly empty explanation heading clears that field when the update is accepted.

See the [Markdown import template](FLASHCARDS-IMPORT-TEMPLATE.md) for the canonical v2 deck.
