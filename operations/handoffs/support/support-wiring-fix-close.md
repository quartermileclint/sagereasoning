# Support Wiring Fix — Close Handoff

**Created:** 20 April 2026
**Author session:** Support wiring fix session (Channel 1 + Channel 2 build).
**Status of this document:** Closes the work scoped in `support-wiring-fix-handoff.md` and prompted by `support-wiring-fix-prompt.md`. Both channels reached 0a status **Wired** + verified at the unit level. Live integration (mounting on the support run-loop with the real Supabase client + real `detectDistressTwoStage` classifier) is the next session's work.

---

## Decisions Made

- **Proceeded as designed on both channels.** Founder approved the "proceed as designed" option at the handoff choice points (90-day baseline uses all `vulnerability_flag` rows, not Support-only; `processInboxItem` signature is breaking-changed to take a branded `SupportSafetyGate`). PR1 is satisfied — mentor is the single-endpoint proof; Support is the second endpoint taking the same pattern.
- **Approved the Critical Change Protocol.** Founder acknowledged the three named failure modes (fail-closed on Haiku outage, mis-wired `SafetyGate`, cross-context `vulnerability_flag` match). No approval carve-outs or deviations.
- **Adopted dependency injection to cross the sage-mentor ↔ website boundary.** `sage-mentor` cannot `import` from `@/lib/*` without creating a cross-package dependency (no path alias, no published package). Rather than touch `r20a-classifier.ts` (PR6 forbids) or vendor the classifier into `sage-mentor` (would duplicate safety-critical code in two places and invite drift), the preprocessor accepts `classify` as an injected function: `deps.classify: (text, sessionId?) => Promise<DistressDetectionResult>`. Production callers inject `detectDistressTwoStage`; the verification harness injects a deterministic stub. The two surfaces converge on the same proven function without either owning it.
- **Did not touch `r20a-classifier.ts` or `constraints.ts`.** PR6 respected. Mentor's live pattern is unchanged.
- **Case B `sudden_change` assertion corrected mid-session.** Initial harness expected `sudden_change === false` when there are no priors. The implementation correctly treats baseline='none' (rank 0) → current='acute' (rank 3) as a sudden drastic change — that is R20's indicator firing correctly. Fixed the assertion, not the code.

## Status Changes (0a vocabulary)

| Thing | Before | After |
|---|---|---|
| Channel 1 — Support distress pre-processing | Scaffolded (not invoked) | **Wired** (unit-verified; integration-verified next session) |
| Channel 2 — Support interaction history / synthesis | Scaffolded (not invoked) | **Wired** (unit-verified; integration-verified next session) |
| `processInboxItem` signature | sync, no deps, no gate | async; takes `ProcessInboxItemDeps` + `SupportSafetyGate`; **Wired** |
| `sage-mentor/index.ts` barrel exports | No Channel 1/2 symbols | Exports added for all public Channel 1 + Channel 2 symbols; **Wired** |
| Verification harness | Did not exist | `scripts/support-wiring-verification.mjs` exists; 30/30 assertions pass locally; **Wired** |

Still required for **Verified**: run the harness against the production Supabase and the production classifier from a Vercel deploy. This session proved the pipeline shape with stubs, not the live integration.

## What Was Built

### Files Created (3)

| File | Purpose |
|---|---|
| `sage-mentor/support-distress-preprocessor.ts` | Channel 1. Reads the 90-day `vulnerability_flag` baseline, runs the injected two-stage classifier synchronously, produces a `SupportDistressSignal` and a branded `SupportSafetyGate`. Exports the `SupportDistressDeps` DI shape and the narrow structural `SupabaseReadClient`. |
| `sage-mentor/support-history-synthesis.ts` | Channel 2. Reads up to 200 rows from `support_interactions` over a rolling 30-day window, computes `category_frequency_30d`, derives `open_issues`, classifies the `trend`, and emits `formatHistoryContextBlock` prose for injection into `buildDraftPrompt`. Fails-soft on DB error (empty history, not a 500). Scoped to primitive columns — does NOT read `ring_evaluation` JSONB, so KG10 does not apply. |
| `scripts/support-wiring-verification.mjs` | Founder-runnable harness. Three canonical cases (clean, acute distress, returning customer with billing history) plus a `formatHistoryContextBlock` shape check. Injects a deterministic stub classifier (no Anthropic call) and a stub `SupabaseReadClient` (no network). 30 assertions. |

### Files Modified (2)

| File | Change |
|---|---|
| `sage-mentor/support-agent.ts` | New imports for Channel 1 + Channel 2 types and functions. `buildDraftPrompt` accepts an optional `history: SupportInteractionHistory` parameter; when supplied, prepends `formatHistoryContextBlock(history)` to the drafter instructions. New `buildCrisisRedirectDraft(gate)` builds the short-circuit response when the preprocessor gates the drafter. New `ProcessInboxItemDeps extends SupportDistressDeps` and `ProcessInboxItemResult` types. `processInboxItem` signature **breaking-changed**: now `async`, takes `(item, profile, kb, deps, gate, config?)`, returns `ProcessInboxItemResult` including `distress`, `history`, `shouldEscalate`, `escalationReason`, and `crisisRedirectDraft`. New `processInboxItemWithGuard(item, profile, kb, deps, config?)` convenience wrapper — runs the preprocessor, awaits `enforceSupportDistressCheck`, and invokes `processInboxItem` with the resulting gate. Any caller that doesn't already hold a gate must use the `WithGuard` entry point. |
| `sage-mentor/index.ts` | Added exports for all public symbols from the two new modules. Added `ProcessInboxItemDeps`, `ProcessInboxItemResult`, `buildCrisisRedirectDraft`, `processInboxItemWithGuard` to the existing Support Agent export block. Internal helpers (`severityIntToString`, `inferSourceStage`) deliberately NOT exported. |

### Call-site Sweep (Task #7 / PR2)

`grep -rn 'processInboxItem\s*(' sagereasoning/` confirms **one** code call site: `sage-mentor/support-agent.ts:898`, inside `processInboxItemWithGuard`, which correctly constructs the gate via `await enforceSupportDistressCheck(preprocessSupportDistress(...))`. Every other hit is documentation (handoff `.md` files) or the barrel export. No external module calls `processInboxItem` directly. Any future integration will either use `processInboxItemWithGuard` (typical path) or must construct a gate first (the branded type makes bypass a compile error — KG3/KG7 invocation guard is enforced at the type level).

## Verification Completed This Session

**Unit-level (founder-runnable).** From the repo root:

```
node scripts/support-wiring-verification.mjs
```

Expected tail of output:

```
========================================================================
SUMMARY
========================================================================

Passed: 30
Failed: 0

All assertions passed. Support wiring is verified at the unit level.
```

Exit code `0` indicates pass, `1` indicates at least one assertion failed (details printed above the summary). Requires Node 22.6 or later — the harness uses Node's native TypeScript loader, no build step is required.

**What the harness proves.**

1. The `SupportSafetyGate` brand can only be constructed by awaiting the preprocessor (type-enforced; runtime-verified in Case A/C).
2. An acute-distress input produces `shouldRedirect === true` and a non-null `redirect_message` (Case B).
3. The 90-day `vulnerability_flag` baseline read is wired — a seeded mild prior flag produces `baseline_severity === 'mild'` (Case C).
4. The 30-day `support_interactions` synthesis is wired — four seeded billing interactions produce `trend === 'frequent'` and `category_frequency_30d.billing === 4`, open issues are derived, and the `formatHistoryContextBlock` prose emits the expected HISTORY CONTEXT markers (Case C/D).

**What the harness does NOT prove.**

- It does not call Anthropic. KG2 (Haiku reliability under load) is orthogonal.
- It does not talk to Supabase. Live integration needs a deployed endpoint.
- It does not exercise `buildDraftPrompt` end-to-end. `support-agent.ts` transitively imports the rest of `sage-mentor` via extensionless `.ts` imports, which Node's native loader cannot resolve without a tsconfig path resolver. The `formatHistoryContextBlock` shape check (Case D) covers the content the prompt builder prepends verbatim.

**Integration-level (next session).** The `Verified` threshold for both channels requires: (1) the Support run-loop invoked on a real Vercel deploy against Supabase; (2) a clean inbox item drafts normally; (3) an acute-distress test inbox item short-circuits to the crisis-redirect draft via `buildCrisisRedirectDraft(gate)` and writes a `vulnerability_flag` row; (4) a returning-customer test inbox item's draft prompt contains the HISTORY CONTEXT block.

## Next Session Should

1. **Mount the preprocessor on the Support run-loop.** The caller that pulls inbox items and feeds them to the Support agent must now use `processInboxItemWithGuard` and inject real dependencies (`supabase: supabaseAdmin`, `classify: detectDistressTwoStage`). Trivial change — the signatures line up by structural compatibility.
2. **Live test the three canonical cases on a deploy.** Put one clean test email, one acute-distress test email, and one returning-customer test email through the real pipeline. Confirm the crisis-redirect path fires on case 2 and the HISTORY CONTEXT block appears in the LLM prompt logs on case 3.
3. **Promote both channels from Wired → Verified** once integration passes.
4. **Revisit out-of-scope concerns from this session** (see below) only if the integration is stable and the founder elects to.

## Blocked On

- Nothing for the two channels shipped this session.
- Integration test requires a Vercel deploy and Supabase access; not in this session's scope.

## Open Questions / Deferred Decisions (PR7)

- **Classifier_down marker insert path in `r20a-classifier.ts` uses `flag_type` / `metadata` columns that don't exist on `vulnerability_flag`.** Observed while reading reference code. Out of scope under PR6 (no classifier touch). Flagged for a future session to either add the columns via migration or change the insert to use `triggered_rules` / `reviewer_notes`. Deferred condition: surfaces as a real error on the next live run; revisit then.
- **`vulnerability_flag.session_id NOT NULL` constraint.** Support-originated distress flags may not have a session_id in the same sense the mentor does. Phase 1 uses the prior-flag READ path only, so this does not bite. Revisit when the Support-side write path (inserting a new `vulnerability_flag` when Support detects distress) is scoped.
- **Scheduled `Sage_Cofounder_Blueprint.md` promotion.** Not related to Support wiring. Noted for completeness.

## Knowledge Gaps Touched (PR5 scan)

- **KG2 (Haiku reliability under load):** Relevant to Channel 1's live behaviour but not to this session's unit-level proof. The fail-open pattern in `r20a-classifier.ts` is re-used verbatim via DI.
- **KG3 / KG7 (Build-to-wire gap):** Directly addressed. The `SupportSafetyGate` brand type is the invocation guard. The grep sweep in Task #7 is the runtime backstop. No third observation this session — no promotion required.
- **KG10 (JSONB storage format):** Checked and does not apply. Channel 2's select list is scoped to primitive columns only (`ring_evaluation` JSONB is explicitly not read). Noted in the module header so a future change will surface the constraint.

No new knowledge-gap entries promoted this session. One new candidate observed (classifier insert path column mismatch) — filed as an Open Question above, not promoted to the knowledge-gaps register yet (first observation).

## Decision-Log Entries Appended

Three entries appended to `operations/decision-log.md`, dated 20 April 2026:

1. **Support Wiring Fix — Channel 1 Distress Pre-Processor Wired**
2. **Support Wiring Fix — Channel 2 History Synthesis Wired**
3. **Dependency Injection Adopted for sage-mentor ↔ website Classifier Access**

---

**End of close handoff.** Session closed in a known-good state per working agreements. No additional fixes proposed.
