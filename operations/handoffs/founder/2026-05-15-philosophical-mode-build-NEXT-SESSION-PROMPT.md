# Next-Session Prompt — Philosophical-Mode Build (First of the Four Mode Builds)

**Stream:** founder.
**Tier:** `code-standard` — **Standard** risk expected under 0d-ii. The build session confirms at the Step 2 design gate and reclassifies upward if (a) the dispatcher decision touches the live `/api/reason` path, (b) the build exposes a new API surface — R17a/R17f would reclassify to **Critical**, or (c) any change modifies R20a classifier / redirection / wrapper logic — **PR6 → Critical**. Critical Change Protocol NOT engaged at open. AC7 not engaged (no auth surface planned). **PR6 watch-point:** philosophical mode *renders* the R20a distress passthrough — it consumes the existing `R20A_DISTRESS_PASSTHROUGH` constant + the distress-signal flag only; it must NOT modify R20a logic.
**Governing frame:** `/adopted/standing-protocol-cache.md` (general protocol) + `/adopted/build-sessions-protocol-cache.md` (build-arc context). Deliverable-of-the-day: `/adopted/substrate-modes/philosophical-mode-response-spec.md`, read in full.
**Predecessor session close:** `/operations/handoffs/founder/2026-05-14-spec-adoption-and-governing-doc-updates-close.md`.
**Predecessor decision-log entries:** `D-FOUR-MODE-SPECS-ADOPTED-2026-05-14`, `D-STAGING-PLAN-AMENDED-FOUR-MODE-2026-05-14` (both appended in the predecessor session — confirm at session open).
**Risk classification:** **Standard** under 0d-ii. Critical Change Protocol NOT engaged. AC7 not engaged. PR6 not engaged at open (watch-point above). PR1 engaged — this is the single-endpoint proof of the Layer 3 mode-dispatch pattern.

---

## Why this session matters

The four mode specs are Adopted and the Layer 1 schema additions are Verified — the four-mode build arc is fully unblocked. Philosophical mode is the simplest of the four: a deterministic transparency surface that renders a `Layer2Assessment` directly, with no LLM composition, no new Layer 1 fields, and no Layer 2 changes. Building it first **proves the Layer 3 mode-dispatch pattern** (PR1 single-endpoint proof) that standard, private, and the ATL Wrapper all build on — so the pattern is established on the lowest-risk mode before the more complex ones inherit it. It builds entirely behind the `SUBSTRATE_LAYER3_ENABLED` gate, so there is no production exposure this session.

## Pre-conditions

1. **Predecessor session committed.** `git log --oneline -3 origin/main` shows the spec-adoption commit; `git status` clean. If a stale `.git/index.lock` is present, clear it first — `rm -f .git/index.lock` — per the predecessor close.
2. **The two predecessor decision-log entries** (`D-FOUR-MODE-SPECS-ADOPTED-2026-05-14`, `D-STAGING-PLAN-AMENDED-FOUR-MODE-2026-05-14`) are in `/operations/decision-log.md`. Confirm at session open.
3. **`SUBSTRATE_LAYER3_ENABLED` still UNSET in Vercel**; `/api/substrate/layer3` returns 503 — philosophical mode builds behind the gate.
4. **Founder commits to a ~3.5–4 hr bounded build session.**

## What this session does — and does NOT do

**Does:** build philosophical mode's v1 renderings — the canonical **JSON** + the **Markdown text** — projected from `Layer2Assessment`: the field-by-field rendering in the spec's section order; the six mandatory wraps via the existing injection layer; the R17e excluded-fields filter; the empty-field omission rule; per-section Greek-term glossing (R8a controlled vocabulary); and the source-material section (direct `retrieve-passages.ts` call, `top_k: 3`). PR1 single-endpoint proof of the mode-dispatch pattern; PR2 build-to-wire-verification immediate.

**Does NOT:**
- Build the **HTML v2** rendering — separate effort, needs the concentric-circle visual asset set (spec open question 4); deferred.
- Build standard / private / ATL Wrapper modes — each is its own session.
- Expose a **new API surface** — the build stays within the existing gated Layer 3 service. (If a new surface is genuinely needed, R17a/R17f reclassify to Critical — stop and re-scope.)
- Touch **Layer 1** (no new fields), **Layer 2** (no mechanism changes), or the live **`/api/reason`** path.
- Modify any **R20a** classifier / redirection / wrapper logic — philosophical mode consumes the R20a passthrough constant + flag only.
- Resolve the spec's "open questions deferred to build" beyond the four this session must decide to proceed (Step 2 design gate).

## Part A — Open under the protocol

Read in order:
1. `/adopted/standing-protocol-cache.md` (~3 min) — tier, model selection, risk class, signals, lean templates, PR15 discipline.
2. `/adopted/build-sessions-protocol-cache.md` (~3 min) — build-arc context; open-questions parking lot.
3. `/operations/handoffs/founder/2026-05-14-spec-adoption-and-governing-doc-updates-close.md` (~3 min) — predecessor close.
4. `/adopted/substrate-modes/philosophical-mode-response-spec.md` — **in full** (~15 min). The deliverable-of-the-day.
5. `/operations/decision-log.md` — last 3 entries.
6. **PR15 consult — before electing the bespoke build:** `.claude/skills/anthropic/` for `SKILL.md` patterns matching deterministic structured-output rendering; the `anthropic-cookbook/patterns/agents/structured-output` pattern flagged in `/adopted/anthropic-features-survey-2026-05-14.md` line 250; `/operations/agentic-commerce-findings-downstream-order.md` for any F-finding targeting this session. State whether an Anthropic-canonical primitive could deliver the field-rendering outcome before electing bespoke; record the justification in the decision-log entry if bespoke is elected.

**Confirm at session open:** tier (`code-standard`, Standard risk expected); hold-point status (P0 0h active); **model selection — N/A** (philosophical mode is deterministic; no LLM call for the structured content; `retrieve-passages.ts` is BM25 + vector + RRF, also deterministic) — cite the standing-cache Element 6 N/A row; status vocabulary (`Scoped → Designed → Scaffolded → Wired → Verified → Live`); signals + risk classification; PR11 inbox scan (`/inbox/` for files dated since the predecessor session — summarise inline or state none).

## Part B — Procedure

### Step 0 — Confirm session scope (founder gate; ~5 min)
Recommend: the full v1 build (JSON canonical + Markdown text renderings) in one session. If the field-by-field projection runs past the time budget, the natural sub-scope is JSON canonical rendering + the six wraps + the R17e exclusion filter this session, Markdown text rendering next. Founder elects.

### Step 1 — Survey the implementation surface (~25–35 min)
Read in full: `/website/src/lib/substrate/layer3-service.ts` (the A5 service — `applyLayer3Injections`, the mandatory-wrap layer), `/website/src/lib/translation-sandwich/layer3-prose.ts` (the existing prose generator; reference its deterministic-composition patterns — `generateFallbackProse`, `MECHANISM_LABELS` — for the field-rendering approach; philosophical mode does NOT call its LLM path), `/website/src/lib/translation-sandwich/layer2-mechanisms.ts` (the `Layer2Assessment` shape — the structured data philosophical mode projects), `/website/src/lib/rag/retrieve-passages.ts` (the source-material retrieval system). Note `/website/src/app/dashboard/page.tsx` line 455 `widthMap` as the existing qualitative→visual translation reference.
Output (~10 lines in-chat): the `Layer2Assessment` field inventory mapped to the spec's section ordering; the wrap-injection mechanism; the `retrieve-passages.ts` call signature.

### Step 2 — Design-decision gate (consolidated; founder approval; ~15–20 min)
One gate, the spec's must-decide open questions:
- **Dispatcher location** — extend `layer3-service.ts` in place with a mode-aware branch on `prose_mode`, OR a dedicated `philosophical-mode-service.ts`. Recommend + let the founder confirm.
- **Iterative_refinement exclusion** — render-layer filter vs `prose_mode` conditional (the JSON still carries the fields from Layer 2; the rendering drops them).
- **Source-material composition framing** — keyed framing tables vs rule-based selection from the assessment's principal findings. NOT LLM-composed — that would break the determinism property.
- **Retrieve-passages sync vs stream** — streaming is permissible (not a safety-critical function per PR3); recommend synchronous for v1 simplicity.
Surface as one consolidated change set per Rule B(iv).

### Step 3 — Build (PR1 + PR2; ~60–90 min)
Build the JSON canonical rendering + the Markdown text rendering: field-by-field projection in the spec's section order (Verdict → Score vector → Scalar score → the 11 Layer 2 sub-sections → Source material); the six mandatory wraps (R3 / R19c / R19d / R20a / R18a / R18e) via the existing injection layer; the R17e excluded-fields filter; empty-field omission; per-section Greek glossing; the source-material section (direct `retrieve-passages.ts` call, `top_k: 3`, `passage_type_filter` per the spec). PR1: this is the single-endpoint proof of the mode-dispatch pattern. PR2: wire + verify in the same session — grep for invocation, not just definition.

### Step 4 — Verify
Test fixtures per the spec's open question 8: per-section glossing; empty-field omission; section ordering; score-component-vector rendering; source-material retrieval + rendering; the six mandatory wraps in position; **R17e exclusion** (test that `direction_of_travel` / `senecan_grade` / `progress_dimensions` / `motivation_classification` / `score_confidence` never appear in output). `tsc --noEmit` clean. Regenerate the spec's worked example from actual `retrieve-passages.ts` output and confirm it renders as the spec describes. PR10 PEV Verify step — classify any diagnostic finding's certainty.

### Step 5 — Append decision-log entry (lean form)
Per `/adopted/standing-protocol-cache.md` §"Lean decision-log entry". Suggested: `D-PHILOSOPHICAL-MODE-BUILD-WIRED-VERIFIED-YYYY-MM-DD`. Rules served expected: 0a, 0c, 0d-ii, 0f, R3, R4 (IP boundary — renders Layer 2 output, no engine internals), R8a, R17e, R18a, R18e, R19c, R19d, R20a (passthrough rendering — perimeter preserved), AC8, PR1, PR2, PR10, PR11, PR15, PR16.

### Step 6 — Session close (lean form)
`/operations/handoffs/founder/YYYY-MM-DD-philosophical-mode-build-close.md` per the lean session-close template (code-standard → lean). "Next Session Should" names the founder's election of the second mode build — **standard mode** is the natural follow-on (it IS philosophical mode's structure + Greek→English + the Summary Response rephraser; it reuses this session's dispatch pattern).

## Part C — Anticipated session shape

| Phase | Estimate |
|---|---|
| Cache + predecessor close + spec + PR15 consult (Part A) | 30–35 min |
| Step 0 — scope confirmation | 5 min |
| Step 1 — survey the implementation surface | 25–35 min |
| Step 2 — design-decision gate | 15–20 min |
| Step 3 — build | 60–90 min |
| Step 4 — verify | 25–35 min |
| Step 5 — decision-log entry | 15 min |
| Step 6 — session close | 15 min |
| **Total** | **~3.5–4 hr** |

## Rollback path

`git revert <commit>` and push via GitHub Desktop. Philosophical mode builds behind the `SUBSTRATE_LAYER3_ENABLED` gate (UNSET in Vercel) — reverting removes the new mode; `/api/reason` and `/api/substrate/layer3` are unaffected either way. No production behaviour change; no data loss; no user impact.

## Forecast

A successful session produces philosophical mode's v1 JSON + Markdown text renderings, Verified — the deterministic transparency surface rendering a `Layer2Assessment` with all six mandatory wraps, the R17e exclusion filter, empty-field omission, per-section glossing, and the three-passage source-material section. The Layer 3 mode-dispatch pattern is proven on one mode (PR1). Next after this: the founder elects the second mode build — standard mode is the natural follow-on, reusing this session's dispatch pattern.

End of prompt.
