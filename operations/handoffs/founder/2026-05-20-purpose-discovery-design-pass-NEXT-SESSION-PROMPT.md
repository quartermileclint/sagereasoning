# Next-Session Prompt — Purpose-Discovery Product: Structured Design Pass

**Stream:** founder.
**Tier:** `governance` — **Standard** risk under 0d-ii. **Lean** template per the standing protocol cache. Critical Change Protocol NOT engaged (design pass only; no code lands). PR6 NOT engaged.
**Governing frame:** `/adopted/standing-protocol-cache.md` (general protocol — `governance` row → Lean template) + `/adopted/build-sessions-protocol-cache.md` ("no current users" governing note; moot this session since no code lands).
**Predecessor working draft:** `/drafts/purpose-discovery-product-design.md` (the working draft this session converts into a locked design).
**Source material:** `/archive/2026-05-17-private-mentor-purpose-discovery-product-consultation.md` (the three-round mentor consultation that produced the six-stage sequence, the five-specification handoff, the 24-variant question library, the clarification protocol).
**Risk classification:** **Standard** under 0d-ii. Documentation-only design pass; no code, schema, env, or production exposure. AC7 NOT engaged. PR6 NOT engaged. Lean template.

## Why this session matters

The purpose-discovery product's philosophical content is locked (the six-stage sequence, the five-specification Layer 1 handoff, the 24-variant question library, the variant-selection discipline, the null-result protocol, the developer-facing clarification protocol — all from the mentor consultation). The architectural decisions are open: fourteen named questions (Q-OPEN-1 through Q-OPEN-14) covering naming, API shape, state model, variant-selection implementation, Layer 1 handoff format, authentication, persistence/audit, billing, build-session staging, operational-integrity signal source, interruptibility, termination, optional input parameters, and the framework-layer kill switch. This session elects each, converting the working draft into a locked design ready to build.

Q-OPEN-14 carries a 🔴 in the control-map coverage table — the product currently has no specified framework-layer (Layer 5) kill switch, and the substrate handoff is the sensitive node that must be gateable before any production use. Electing Q-OPEN-14 is the one decision that closes a genuine gap rather than refining an open choice.

**Pre-condition note:** the discovery product depends on A10 build complete for its recommended authentication (Q-OPEN-6a — A10 credentials). This design pass can run *before* the A10 build (it's design-only), but the build of the discovery product cannot start until A10 is Verified. Sequence the design pass whenever convenient; sequence the build after A10.

Plan **~2.5–3.5 hr**. Fourteen elections is substantial; the session may split (see Part C). Natural split point is after the engine + handoff rounds (Q-OPEN-1 through Q-OPEN-8) — the kill-switch + control rounds (Q-OPEN-10 through Q-OPEN-14) + build staging (Q-OPEN-9) can run as a second sitting if needed.

## Pre-conditions

1. The 2026-05-20 light-touch annotations to `/drafts/purpose-discovery-product-design.md` are committed (Q-OPEN-13, Q-OPEN-14, the ecosystem-positioning subsection, the Agent Card alignment note, the control-map coverage section, and the R18d promotion).
2. Founder has read the mentor consultation archive end-to-end at least once (the six-stage sequence + the clarification protocol are the product's substance).
3. Founder commits to a bounded session with one AskUserQuestion round per question-group (six groups; see Part B).
4. Production state unchanged (this session touches no code).

## Part A — Open under the protocol

Read in order:

1. **`/adopted/standing-protocol-cache.md`** (~3 min) — confirms tier (`governance`), risk class (Standard), Lean template, signals, status vocabulary. Model selection N/A unless Q-OPEN-4 elects an LLM-based variant-selection engine (then KG2 + AC1 engage at the *build*, not this design pass).
2. **`/adopted/build-sessions-protocol-cache.md`** (~3 min) — "no current users" note (moot this session).
3. **`/drafts/purpose-discovery-product-design.md`** in full (~15–20 min) — the working draft. Particularly the six-stage mechanism, the five-specification handoff, the 24-variant library, the variant-selection discipline, the null-result protocol, the clarification protocol, the control-map coverage section, and all fourteen Q-OPEN questions with their candidate options.
4. **`/archive/2026-05-17-private-mentor-purpose-discovery-product-consultation.md`** (~10 min) — the source consultation. Re-read the discipline sections if any election turns on a philosophical point.
5. **`/adopted/atl-a10-design.md`** §Control-layer alignment + Decisions A/B/E (~5 min) — the auth surface the discovery product reuses (Q-OPEN-6); the kill-switch layers the discovery product complements (A10 covers Layers 1/2/3; discovery covers Layer 5).
6. **`/adopted/billing-model-design.md`** Decision A + Decision E (~5 min) — the loop definition + `loop_billing_events` the discovery product's loops bill through (Q-OPEN-8); the Layer 4 payment kill-switch deferral (control-map Row 5).
7. **`/operations/decision-log.md`** last 2–3 entries (~5 min) — confirm the most recent state.
8. **PR11 inbox scan** — list `/inbox/` for files dated since 2026-05-20. The six-protocols + control-layer files (`20260512-0df-promptkit-1.md`, `6 agent protocols.rtfd`, `20260512-v6e-promptkit-1.md`, `AI Agent Shipping readiness.rtfd`) are already-consumed source material reflected in the working draft's annotations.
9. **PR15 consult** — `.claude/skills/anthropic/` review. Candidates: `skill-creator` (if Q-OPEN-1 elects packaging the discovery sequence as a skill); `mcp-builder` (forward pointer for R18c). Record the consult.

**Confirm at open:** tier (`governance`); hold-point status (P0 0h active); model selection (N/A for the design pass); status vocabulary; signals + risk class; Critical Change Protocol NOT engaged.

## Part B — Procedure

### Step 0 — Scope confirmation (~5–10 min)

Via AskUserQuestion: confirm the fourteen-question scope is right; confirm the six-group batching (below) or amend; confirm whether the locked design stays in `/drafts/` or moves to `/adopted/` at session close (the move is an Elevated archive action per the standing cache; recommendation: keep in `/drafts/` until the build session, move to `/adopted/` at build).

### Steps 1–6 — Elect the fourteen questions (one AskUserQuestion round per group)

Surface options + reasoning per question (founder preference: present choices with reasoning, not prescriptions). Suggested grouping:

- **Round 1 — Identity + naming:** Q-OPEN-1 (product name), Q-OPEN-6 (authentication model).
- **Round 2 — API + state + persistence:** Q-OPEN-2 (API shape), Q-OPEN-3 (state model), Q-OPEN-7 (persistence + audit).
- **Round 3 — Engine + inputs:** Q-OPEN-4 (variant-selection logic implementation), Q-OPEN-13 (optional `available_tools` + `agent_card_url` inputs).
- **Round 4 — Handoff + billing:** Q-OPEN-5 (Layer 1 handoff format), Q-OPEN-8 (billing model).
- **Round 5 — Control + kill switch:** Q-OPEN-10 (operational-integrity signal source), Q-OPEN-11 (interruptibility), Q-OPEN-12 (termination after clarification), Q-OPEN-14 (framework-layer kill switch — the 🔴 gap; the handoff must be gateable).
- **Round 6 — Build staging:** Q-OPEN-9 (build-session size + risk class; single-session Critical vs staged Elevated+Critical).

Each election locks into the design. Where an election depends on a prior one (e.g., Q-OPEN-3 state model depends on Q-OPEN-2 API shape; Q-OPEN-7 persistence interacts with R17), surface the dependency in the question.

### Step 7 — Produce the locked design (~30–40 min)

Convert `/drafts/purpose-discovery-product-design.md` from a working draft into a locked design: replace each Q-OPEN's candidate options with the elected position + reasoning (Why; Elected position; Why this not the alternatives; R-rule engagement; deferred under PR7). Update the status banner from "Scoped → partially Designed" to "Designed" (per 0a). Update the control-map coverage table (Row 7 🔴 → 🟢 once Q-OPEN-14 is elected). Keep the locked philosophical content (six stages, five specifications, 24 variants, protocols) unchanged.

### Step 8 — Append decision-log entry (lean form per Standard) (~10–15 min)

Pattern: `/adopted/standing-protocol-cache.md` §"Lean decision-log entry". Entry: `D-PURPOSE-DISCOVERY-DESIGN-LOCKED-YYYY-MM-DD`. Captures the fourteen elections summarised; the control-map + kill-switch posture; the dependency on A10 build for auth; deferred items under PR7; cross-references to the working draft + mentor archive + A10 design + billing design.

### Step 9 — Session close (lean form per Standard) (~10–15 min)

Pattern: `/adopted/standing-protocol-cache.md` §"Lean session close". Next Session Should: names the discovery-product build session (risk class per Q-OPEN-9 election; pre-condition A10 Verified). Founder Verification: git add + commit + push (governance only; no code verification).

## Part C — Anticipated session shape

| Phase | Estimate |
|---|---|
| Part A — caches + working draft + mentor archive + A10 + billing + decision-log + PR11 + PR15 | 45–55 min |
| Step 0 — scope confirmation | 5–10 min |
| Rounds 1–6 — fourteen elections (six AskUserQuestion rounds) | 60–90 min |
| Step 7 — produce locked design | 30–40 min |
| Step 8 — decision-log entry | 10–15 min |
| Step 9 — session close | 10–15 min |
| **Total** | **~2.5–3.5 hr** |

If the session runs long, split after Round 4 (Q-OPEN-1/2/3/4/5/6/7/8 elected) — produce a partial-locked design + a lean close naming the second sitting (Rounds 5–6: kill-switch + control + build staging). The second sitting is short (~1–1.5 hr).

## Rollback path

Governance-only. Pre-push: `git reset --hard HEAD~N`. Post-push: `git revert HEAD~N..HEAD --no-edit` + push via GitHub Desktop; the working draft is restored. No Vercel rebuild (drafts don't trigger builds). Production state unchanged throughout.

## Forecast

A successful design pass produces a locked `/drafts/purpose-discovery-product-design.md` (status: Designed) with all fourteen architectural decisions elected, plus the `D-PURPOSE-DISCOVERY-DESIGN-LOCKED-YYYY-MM-DD` decision-log entry. The 🔴 Row 7 kill-switch gap is closed by the Q-OPEN-14 election. After this lands, the discovery-product build session can be scoped — pre-conditioned on A10 build Verified (for the recommended A10-credential authentication). The product remains upstream of the ATL substrate; its build is independent of the post-6b arc's remaining work.

*End of prompt. Paste into a fresh session; the session begins under Part A.*
