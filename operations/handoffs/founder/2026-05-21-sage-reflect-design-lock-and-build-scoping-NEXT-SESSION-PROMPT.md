# Next-Session Prompt — Sage Reflect: Design Lock + Build Scoping (or track re-election)

**Stream:** founder.
**Tier:** opens **`governance`** (Standard) for the design-lock confirmation; re-tiers to **`archive`** (Elevated) for the `/drafts/`→`/adopted/` move; then to **`code-elevated`** (or stays `governance`) if the founder proceeds to scope the Sage Reflect build. The build sessions themselves will be `code-critical` (Critical Change Protocol) — but the build is NOT this session.
**Governing frame:** `/adopted/standing-protocol-cache.md` (general session protocol) + `/adopted/build-sessions-protocol-cache.md` (build-arc context; "no current users").
**Predecessor session close:** `/operations/handoffs/founder/2026-05-21-sage-reflect-design-close.md`.
**Predecessor decision-log entries:** `D-SAGE-REFLECT-DESIGN-DRAFTED-2026-05-21`; `D-SAGE-CALLING-STAGE2-LIVE-VERIFIED-2026-05-21`.
**Operative deliverable (read in full after a track is confirmed):** `/drafts/sage-reflect-product-design.md` (the Sage Reflect design — DRAFT, pending lock).

## Why this session matters
The Sage Reflect design (the fourth and final **Sage Practice** product — post-action reflection) is **drafted, committed, and Vercel-green**, sitting in `/drafts/` pending your lock. The design is grounded on the confirmed cycle (Sage Calling → SageReasoning → **Sage Assent [= the Agent Trust Layer]** → Sage Reflect) and on four locked elections: full locked doc; reuse-where-possible (reuse Sage Assent's grade-engine + evaluation-window rather than re-implement); agent-first (`/api/practice/reflect`); deterministic control flow + SageReasoning translation-sandwich for semantic scoring. This session turns the draft into a locked, adopted design and scopes the build — or, if you'd rather, re-elects a different track. Nothing here is Critical until the build sessions begin.

## Pre-conditions (confirm at open)
1. The predecessor close's commit is pushed and Vercel is green (founder-confirmed 2026-05-21). The committed files include `drafts/sage-reflect-product-design.md`, the two decision-log entries, and the three operational-doc edits.
2. **Sage Calling smoke-test cleanup** — confirm whether the founder ran it between sessions (`DELETE FROM discovery_sessions WHERE session_id LIKE 'smoke-%';` + revoke the `agent_smoketest_v1` `atl_write` credential). If not done, it remains a pending founder action — surface it, don't block on it.
3. Production otherwise unchanged: Sage Calling Live (gated by `SAGE_CALLING_ENABLED`); substrate A7 Verified; A10 Live + Verified; `SUBSTRATE_LAYER3_ENABLED` UNSET; `SUBSTRATE_R20A_GATE_ENABLED` UNSET; Layer 1 schema v3 (accepts v1|v2|v3; producer emits v1).

## Part A — Open under the protocol
Read in order:
1. `/adopted/standing-protocol-cache.md` (~3 min — tier, model selection, risk class, signals, status vocab).
2. `/adopted/build-sessions-protocol-cache.md` (~3 min — build-arc context; "no current users"; the K-category framing).
3. `/operations/handoffs/founder/2026-05-21-sage-reflect-design-close.md` (the predecessor close — what's drafted + the pending actions).
4. `/operations/decision-log.md` — the last 2 entries (`D-SAGE-REFLECT-DESIGN-DRAFTED-2026-05-21` + `D-SAGE-CALLING-STAGE2-LIVE-VERIFIED-2026-05-21`).
5. `/drafts/sage-reflect-product-design.md` — **in full** (the deliverable under review).

Confirm at open: tier (`governance` for the lock); hold-point status (P0 0h active); status vocabulary (`Scoped → Designed → Scaffolded → Wired → Verified → Live`; Sage Reflect is currently **Designed**); signals/risk class. PR4: N/A for the lock (no LLM). PR15: the design already records the reuse-over-bespoke decision; re-confirm only if build scoping introduces a new bespoke element.

## Part B — Procedure

### Step 1 — Founder confirms the design (or supplies edits)
The founder has read `/drafts/sage-reflect-product-design.md` between sessions. Either:
- **"Lock it"** → proceed to Step 2; or
- **Supply edits** → apply the edits to the draft first (Standard; preserve the prior version per git), then proceed to Step 2; or
- **Re-elect a different track** (K-category migration / Stage-1-close lawyer engagement / Sage Calling PR7 follow-ons) → skip Steps 2–3, re-tier to that track, and run it instead.

### Step 2 — Lock the design (archive step; Elevated)
On founder approval:
1. Move `/drafts/sage-reflect-product-design.md` → `/adopted/sage-reflect-product-design.md` (preserve the draft in git history; this is the `archive` category, Elevated).
2. Change the doc's status line from "DRAFT — pending founder lock" to "LOCKED" with the lock date.
3. Append `D-SAGE-REFLECT-DESIGN-LOCKED-YYYY-MM-DD` (lean form per the standing cache) cross-referencing `D-SAGE-REFLECT-DESIGN-DRAFTED-2026-05-21`.
4. Resolve the **lockable open items** the founder has a view on: route-name lock (`/api/practice/reflect`); whether to ask Sage Assent for **per-virtue-domain** katorthoma proximity (KP-03/04) or treat it as a Sage Assent enhancement; and the `evaluated_actions` shape compatibility for the Q4 kathekon feed (a quick read of `trust-layer/types/evaluation.ts` + the accreditation migration confirms it).

### Step 3 — Scope the Sage Reflect build (design/governance; no code this session unless the founder says "build")
Produce a build-staging note for Sage Reflect, following the Sage Calling two-stage pattern:
- **Stage A (Elevated):** the deterministic engine (Q1–Q6 step function + branching + FD-R1..R4 + RS routing) + the session store (the Sage Reflect-owned additive logs; KG7) + the Sage Assent feed (write Q4 kathekon records into `evaluated_actions` so the existing window-aggregator/grade-engine recompute). Proven in isolation (PR1), Verified in-session (PR2).
- **Stage B (Critical):** the authenticated, metered, kill-switched `POST /api/practice/reflect` (reuse A10 `sr_atl_`; `SAGE_REFLECT_ENABLED` off by default) + the translation-sandwich wiring for Q1–Q4 semantic scoring (Sonnet Layer 1) + the R20a/Zone-3 boundary check + the R18d adversarial suite. Full Critical Change Protocol.
Confirm model selection (PR4): Sonnet for Layer 1 extraction (AC1/KG2); no Haiku safety call in this product. Cost the six-question pass against R5 (≤4 Layer-1 calls/pass).

### Step 4 — Close (lean form)
Per `/adopted/standing-protocol-cache.md` §"Lean session close". Write the next-session prompt for the elected build stage (or the re-elected track).

## Part C — Anticipated session shape
| Phase | Estimate |
|---|---|
| Part A — caches + predecessor close + design read | 20–25 min |
| Step 1 — confirm/edit | 5–15 min |
| Step 2 — lock (archive move + lock entry + lockable items) | 20–30 min |
| Step 3 — build-staging note | 30–45 min |
| Step 4 — close | 15–20 min |
| **Total (lock + scope path)** | **~1.5–2 hr** |

## Rollback path
The lock is governance/archive: the `/drafts/`→`/adopted/` move + the lock decision-log entry are reversible via git. No production runtime change in the lock or the scoping. The build sessions that follow carry their own (Critical) rollback, declared at that point — and Sage Reflect ships behind `SAGE_REFLECT_ENABLED` (off by default), so it returns to 503 with no code change.

## Forecast
After this session, Sage Reflect is either a **locked, adopted design with a scoped build path** (Sage Practice product 4 ready to build behind a kill switch), or the founder has re-elected a different track. The Sage Practice plugin's fourth product is then the next build arc; the ATL→Sage Assent rename and the human-surface migration remain separately-tracked follow-ons.

---
*End of prompt. Paste into a fresh session; it opens under Part A as a `governance` lock-confirmation, then re-tiers per the founder's Step 1 choice.*
