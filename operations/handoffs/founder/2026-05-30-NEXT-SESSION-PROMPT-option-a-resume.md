# Next-Session Prompt — Resume Option A (Gap #2/#3): R20a Agent-Path Live Proof

**Paste this whole file into a new session to continue.**

**Stream:** founder.
**Tier:** `code-elevated` opening (additive invocation tests against existing safety code), with **reclassification to `code-critical` mid-session if any R20a safety logic must change** (PR6 → full Critical Change Protocol on the change itself). Confirm at open.
**Governing frame:** `/adopted/standing-protocol-cache.md` + `/adopted/build-sessions-protocol-cache.md` ("no current users" still holds — founder + test logins only).
**Predecessor session close (just completed):** `/operations/handoffs/founder/2026-05-29-r17-erasure-portability-close.md`.
**Predecessor decision-log entry:** `D-R17-ERASURE-PORTABILITY-COMPLETENESS-2026-05-29`.

---

## What just happened (carry-forward state — do NOT re-derive)

- **Gap #1 (R17 erasure + portability) is CLOSED and DEPLOYED.** Diagnosis found intimate-store erasure was already complete via DB cascade. `/api/user/delete` was extended to belt-and-braces explicit deletion + an honest `compliance_deletion_log`; `/api/user/export` was extended to include the full intimate store with plaintext decryption for the data subject. Both **Verified-live on real data** (deletion counts 1→0; export shows all nine intimate tables) and **committed, pushed, Vercel green** as of 2026-05-30. Launch criterion #7 erasure/access leg is closed.
- **Production state now:** the two `/api/user/*` route changes are LIVE. **The four R20a flags remain UNSET** (`SUBSTRATE_R20A_GATE_ENABLED`, `SUBSTRATE_CALLING_R20A_ENABLED`, `SUBSTRATE_REFLECT_R20A_ENABLED`, `SUBSTRATE_R20A_AUDIENCE_RENDERING_ENABLED`) and `/api/reason` is byte-identical for all callers. This session does not touch the `/api/user/*` routes.
- **Two carry-forward observations** logged this session (optional quick governance side-task, not blockers): (a) the manifest still calls R17c "a placeholder 503" at three points — stale, the route is fully built; (b) `mentor_profiles` and `mentor_profile_snapshots` have schema-drift between migration files and the live DB. Fix in a later governance/registry pass if desired.

## Why this session (the next ranked gap)

Per the capability inventory ranked gap list (`/drafts/2026-05-29-capability-inventory-first-pass.md`), the next gaps are **#2 and #3 — the R20a agent-path safety perimeter is wired but never proven live**: the `/api/calling` and `/api/practice/reflect` distress catches are wired-dark (flags OFF, behind 503 kill-switches), and the `/api/reason` agent-audience redirect rendering is flag-OFF with its configuration-flow tests unrun. This is launch criterion #10. Closing it completes the Option A build arc.

## The operative deliverable already exists

A detailed, still-valid next-session prompt for this exact work is on file:

**→ `/operations/handoffs/founder/2026-05-28-OPTION-A-session-5-NEXT-SESSION-PROMPT.md`** (Option A, Session 5: configuration-level invocation tests across L1–L7 flows — the final session of the Option A arc).

**This session resumes that prompt.** It was placed in limbo on 2026-05-29 pending the gap-ranking decision; the ranking has since put R17 (now done) first and Option A second, so S5 is now the live next step. Read it in full and follow its Part A / Part B. Nothing in it is superseded by the R17 work — the two are independent surfaces.

## Part A — Open under the protocol

Read in order:
1. `/adopted/standing-protocol-cache.md` — tier, model selection (no LLM call in tests), risk class, signals, AI-failure-modes subsection (PR17 + redirect phrases), lean templates.
2. `/adopted/build-sessions-protocol-cache.md` — "no current users" holds; build-arc context.
3. **`/operations/handoffs/founder/2026-05-28-OPTION-A-session-5-NEXT-SESSION-PROMPT.md`** — the operative deliverable; read in full and follow it.
4. The S4 predecessor close it names (`/operations/handoffs/founder/2026-05-28-OPTION-A-session-4-audience-rendering-close.md`) and the design spec it names (`/drafts/2026-05-28-r20a-single-catch-contract.md` §4, §4.4, §4.5, §4.6, §5.5).
5. `/operations/decision-log.md` — last 3 entries (the R17 entry just landed; then the S4/S3 Option A entries).
6. The code surfaces the S5 prompt lists (its Part A item 7) — read before any test edit.

Confirm at open (narrate before any work): where we are in the arc (final session of Option A; gap #1 now closed + deployed); what's queued behind this (C2 live run + value-evidence rig); what's awaiting the founder (the S5 pre-conditions — notably naming the L1–L7 configuration flow set, which the AI must NOT assume — plus the lean-CCP approval items) vs the AI (test scaffolding + sandbox verification + decision-log + close). Model selection: N/A for the tests (tsx exercising existing code). PR6 not engaged unless safety logic must change.

## Pre-conditions (founder confirms at open)

1. Production green and untouched since the R17 deploy; four R20a flags still UNSET (this session keeps them UNSET unless the S5 prompt's C2 live-run step is reached and the founder elects to flip them under PR17 walkthrough + full CCP).
2. The S5 prompt's own pre-conditions (its Part "Pre-conditions") are confirmed — especially #2 (the founder names the L1–L7 configuration flow set; the AI asks via AskUserQuestion and does not assume) and #3 (AI code-reads the cross-seam carrier paths before scoping per-flow tests).
3. Branch `main`; the AI does no git operations.

## Procedure

Follow the S5 prompt's Part B exactly (lean CCP → per-flow invocation tests → sandbox verification → decision-log → close). If a propagation test surfaces a real bug in the safety paths, reclassify to Critical and engage the full Critical Change Protocol on the fix (not on the tests), per the S5 prompt's Step 1 item 2.

## Optional 20-minute side-task (founder elects)

If the founder prefers a lighter session, the two R17 carry-forward observations can be cleared instead/first as a `governance` Standard-risk pass: correct the manifest's three stale "R17c placeholder 503" notes, and open a registry/schema-drift note for the `mentor_profiles` dual-definition. This is documentation-only; no code, no production change.

## Rollback path

S5 test additions are additive (`git rm` to revert). No production change occurs unless the C2 live-run step flips an R20a flag — that step is Critical, gets the full CCP + PR17 live walkthrough, and is the founder's explicit call.

## Forecast

The session ends with R20a propagation proven across the configuration flows (closing the Option A arc), and — if the founder reaches the C2 live-run step — the agent-path catch fired and verified live for the first time, closing launch criterion #10's agent leg. Next gap after that: #4 (confirm every human tool routes through a distress-checked endpoint) and #5 (confirm intimate-data encryption end-to-end).

End of prompt. Opens on `main`. Resumes the Option A Session-5 prompt; gap #1 (R17) is done and deployed.
