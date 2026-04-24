# Next-Session Prompt — Paste into the next session to continue

**Usage:** Copy everything below the line into the next session's opening message. The prompt references files by path — do not paste the file contents themselves, just the prompt text. The AI will read the referenced files as part of session opening.

---

## You are resuming the SageReasoning project mid-workflow.

**Session opening reads (in order).** This session is governance-focused and will likely touch code, so read Tier: 1 + 2 + 3 + 4 + 5 + 6 + 8 + 9 per the canonical-sources list at `/outbox/2026-04-24_canonical-sources-for-protocol.md`. Concretely, that means:

1. `/manifest.md` (R0–R20 governance).
2. Project instructions (already in your system prompt).
3. `/operations/handoffs/founder/2026-04-24-governance-cleanup-and-protocol-close.md` — the close note from the previous session. Read this first after the manifest; it is authoritative for what's in flight.
4. `/operations/decision-log.md` — scan the last five entries (DD-2026-04-24-04 through DD-2026-04-24-08).
5. `/operations/discrepancy-sort-2026-04-23.md` — confirm the status line reads "Track A complete" and every D1–D16 row shows resolved.
6. `/operations/knowledge-gaps.md` — scan for any entry relevant to this session's scope.
7. `/summary-tech-guide.md` and `/summary-tech-guide-addendum-context-and-memory.md` — only if this session touches code.
8. `/operations/verification-framework.md` — only if this session will do a wiring or deployment step.

State which tier you read at session open.

**Operating rules that apply throughout this session** (these are the same rules that governed the previous session — they are already in project instructions, this is just a loading reminder):

- D6-A archive protocol: before any edit to a governing or strategic document, copy the pre-edit version to `/archive/[date]_[filename]_pre-[change-id].md`. No exceptions.
- 0d-ii risk classification: classify every code change as Standard / Elevated / Critical before executing. Safety-critical changes (PR6) are always Critical.
- 0c-ii Critical Change Protocol: for Critical changes, state what changes, what could break, what happens to existing sessions, rollback plan, verification step, and get explicit approval before deployment.
- PR1: single-endpoint proof before rollout. The hub route is the single endpoint for the protocol-extract change.
- PR2: verify wiring in the same session as the build.
- PR7: deferred decisions are logged in the decision log with what was considered, why deferred, and revisit condition.
- Communication signals: use "I'm confident", "I'm making an assumption", "I need your input", "I'd push back", "This is a limitation", "This change has a known risk", "I caused this" where appropriate. Respect "I've decided", "Done for now", "Treat as critical" from the founder.
- Founder preferences: zero coding experience, plain language, step-by-step, exact copy/paste text for UI actions, the founder decides direction, you present options with reasoning not prescriptions.

---

## What landed in the previous session (summary)

Track A complete: all 16 governance discrepancies D1–D16 resolved in `/operations/discrepancy-sort-2026-04-23.md`. D17 remains open as the Track B carry-over.

Track B drafted but not adopted:
- Full Session Opening Protocol: `/operations/outbox/session-opening-protocol-DRAFT.md` (21 elements, Parts A/B/C).
- Distilled hub extract: `/operations/outbox/session-opening-protocol-hub-extract.md` (~380 words between fences).

Three project-instructions amendments drafted for founder to apply at the Cowork UI: `/outbox/2026-04-24_project-instructions-amendments.md` (D8 handoff format, D9 PR5 wording, D14 dual status taxonomy).

Canonical-sources list drafted: `/outbox/2026-04-24_canonical-sources-for-protocol.md` (9 sources, tier-assigned by session type).

Hub-route change NOT applied. Awaiting founder approval of the extract text before the diff is prepared.

---

## Decision points awaiting founder input

Present these as a numbered list at session open, ask the founder which to tackle first. Do not start work on any of them until the founder picks.

**1. Project-instructions amendments (D8, D9, D14).**
File: `/outbox/2026-04-24_project-instructions-amendments.md`. These are copy-paste blocks for the Cowork project-instructions UI — the founder applies them, not you. Your role: if the founder asks, walk through each amendment in plain language before they apply it. After they apply, ask the founder to confirm by having you quote back the new wording in the following session's system prompt. On confirmation, move the file to `/archive/2026-04-24_project-instructions-amendments-applied.md`.

**2. Session Opening Protocol adoption (D17, Track B).**
File: `/operations/outbox/session-opening-protocol-DRAFT.md`. Founder options:
- Approve as-drafted → move to `/adopted/session-opening-protocol.md` via D6-A (pre-edit archive copy of any existing file at that path; there should be none — this is new).
- Amend first → edit in place at the outbox path, then move.
- Reject → file stays in outbox or moves to `/archive/2026-04-24_session-opening-protocol-draft-rejected.md` with reasoning in the decision log.

**3. Hub-route wiring (Elevated risk).**
Depends on decision 2. Only proceed after the protocol is adopted.
- Target file: `/website/src/app/api/founder/hub/route.ts`, `getRecommendedAction` function (system-prompt construction block, roughly lines 654–738 per addendum).
- Edit: prepend the fenced extract text from `/operations/outbox/session-opening-protocol-hub-extract.md` to the system prompt.
- Risk: Elevated. Affects every session's opening behaviour. Rollback: single-edit revert via git or from archive copy.
- Before applying: verify the exact prompt structure by reading the function, confirm the prepend lands in the right place, present the diff and rollback plan to the founder, wait for explicit approval.
- After applying: verify in the same session per PR2 (trigger `getRecommendedAction` with a test call or next-session simulation, confirm the extract appears in the output, grep the file to confirm only the intended lines changed).

**4. Canonical-sources list promotion (optional).**
Open question from the close note: should `/outbox/2026-04-24_canonical-sources-for-protocol.md` move to `/adopted/canonical-sources.md` so the protocol points at a stable governance location rather than an outbox file? Present this as a side decision; not required to proceed with 2 or 3, but the protocol's pointer will need updating either way.

---

## Paths for this session

**Path A — founder wants to apply amendments first.**
Walk them through each amendment in plain language. Answer questions. Archive the file when they confirm all three are applied and visible.

**Path B — founder wants to adopt the protocol.**
Read the protocol aloud-in-summary. Apply D6-A archive protocol (none needed for new-file adoption — no prior version to archive). Move the draft to `/adopted/session-opening-protocol.md`. Log the decision. If the canonical-sources list is also promoted (decision 4), do that as a paired change.

**Path C — founder wants to wire the hub route.**
Only after Path B is complete. This is the Elevated-risk step. Follow the Critical Change Protocol as if it were Critical (the founder may also reclassify upward). Do not deploy without explicit approval.

**Path D — founder wants to do something else entirely.**
Scope that work. Confirm the reads you'll need. Proceed under the rules above. Carry the Track B items forward in the next handoff.

---

## What not to do in this session

- Do not touch `/adopted/` without a pre-edit archive and founder approval.
- Do not touch the hub route without Path B completed and Path C explicitly approved.
- Do not extend scope beyond what the founder selects at session open.
- Do not propose additional fixes once the founder signals "Done for now".

---

## Session close

At close, produce a handoff at `/operations/handoffs/founder/[date]-[description].md` using the required-minimum format (0b) plus defined extensions if the session involved code, deployment, or safety changes (per the D8 amendment, which may or may not be applied by then — use the format regardless). The close note should name which of decisions 1–4 landed, which carried forward, and why.
