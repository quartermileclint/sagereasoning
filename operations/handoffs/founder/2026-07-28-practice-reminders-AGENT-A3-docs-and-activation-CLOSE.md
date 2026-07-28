# Session Close — 2026-07-28 — Practice Reminders, Agent Phase A3: R18 Docs + the Founder-Walked Activation

**Stream:** founder (substrate / agent experience).
**Governing frame:** `/adopted/standing-protocol-cache.md` + `/adopted/build-sessions-protocol-cache.md`.
**Tier:** `code-critical` — Critical risk (0d-ii env-flag activation of new content on two live public response surfaces + R18 public-contract change). Full Critical Change Protocol observed. AC7/PR6/PR17 engaged and discharged; every live operation was founder-performed.
**Date:** 2026-07-28.

## Decisions Made

- `D-PRACTICE-REMINDERS-AGENT-A3-DOCS-AND-ACTIVATION-LIVE` appended. Both `SUBSTRATE_PRACTICE_SUGGESTION_ENABLED` and `SUBSTRATE_REFLECT_DEVELOPMENTAL_ENABLED` are now LIVE in Vercel Production. The R18 practice-suggestion contract is published on all three public surfaces. **This completes the practice-reminders agent plan — no phase remains open.**

## Status Changes

| Item | Old | New |
|---|---|---|
| `SUBSTRATE_PRACTICE_SUGGESTION_ENABLED` | unset everywhere | **LIVE in production** |
| `SUBSTRATE_REFLECT_DEVELOPMENTAL_ENABLED` | unset everywhere | **LIVE in production** |
| `agent-card.json` extensions | 18 | **19** (`practice-suggestion/v1`) |
| `llms.txt` | no practice-suggestion contract | Published (2 insertion points) |
| `api-docs/page.tsx` | no practice-suggestion contract | Published (2 insertion points) |
| Agent plan (all phases) | A1/A2 built dark | **A1 + A2 + A3 all COMPLETE — plan fully executed** |

## What went wrong, and what it taught

**A live smoke caught a defect in docs I had just published.** The D1 activation smoke (`obligation_violated` basis, live) returned no `endpoint_hint` — and my own published `llms.txt` example showed that exact basis paired with an `endpoint_hint` that the composer's `BASIS_ENDPOINT` table structurally cannot produce for it. I had drafted the example from memory of the composer's *shape*, not by tracing which specific basis carries which optional field, and it went live before a real consult exercised it. Fixed same session, once the live output made the gap concrete rather than theoretical. **Lesson for next time: an illustrative JSON example combining two optional/conditional fields needs the same field-by-field trace against source that a code review gets — "it's just docs" is not a lower bar, it's a public claim with no compiler to catch it.**

**Constructing the A2 live smoke surfaced that the accreditation-write documentation is itself a trimmed illustration, not the real shape.** Two 503s (a missing-`owner_email` 400 first, then a `window_config: {}` 503, then a still-missing-fields 503) came from tracing `AccreditationRecord`/`WindowConfig`'s actual TypeScript definitions and `accreditationRecordToRow`'s actual field reads — not from the docs, which show perhaps a third of the required shape. I did not fix that documentation gap this session (out of A3's stated scope, and unlike the `endpoint_hint` defect it is not itself a false claim, just an incomplete one) — but it cost real live-op cycles and is worth its own pass.

## Verification

`tsc` 0, `npm run build` 0 on both doc commits (`ca87f92`, `5c11533`) — the route-export build gate was re-run explicitly, not assumed satisfied by `tsc`. `agent-card.json` JSON-validated at 19 extensions both before and after the fix. Every live smoke response was inspected field-by-field against the composer's/engine's actual source before being accepted — not against the docs, which is what caught item 1 above. A1's 759/0 and A2's 20/0+41/0 batteries are untouched by this session (no code changed).

**Live activation evidence (the actual verification this session's tier demands):**
- D1 (calm injustice) → `practice.suggestion.basis.code: "obligation_violated"`, `line`/`framing_note` verbatim-matching the locked vocabulary, no `endpoint_hint` — confirms the B2-before-B1 precedence reversal live.
- D2 (benign control) → `practice` block present, `suggestion` genuinely absent.
- The `developmental_priorities` walk → a real 3-consecutive-`deliberate`/phronesis streak on a throwaway UPC produced `{"domain": "phronesis", "note": "consistent 'deliberate' across 3 recent session(s) in phronesis — a developmental priority for the next Sage Reflect (tracked, not intervened; spec-7 constraint 3)"}`, verbatim-matching `intervention-engine.ts`'s template. `grade_changed: false` doubled as the A2 honest-negative.
- Rollback drill on A1's flag → unset + redeploy + re-run D1 → `suggestion` genuinely absent, `practice` block otherwise untouched. Flag restored + redeployed green.
- Teardown → credential `262d174c-aec2-4e61-803d-6d40a6e30de1` revoked (`is_active: false`); a consult with the revoked key returned 401.

The A2 `suggestion`-positive path was deliberately left unattempted live (founder election) — it needs `grade_changed:true` and a qualifying persisting-passion pattern simultaneously, impractical to construct reliably given the Sage Assent grade engine's hysteresis. Recorded as battery-verified only.

## Next Session Should

Nothing is gated on this plan. Named follow-ups, none blocking: the accreditation-write `llms.txt` example's incompleteness (a documentation-only pass); the deferred `loop_fold` R18 docs (a natural neighbour); the `emitAccreditationTrustEvents` correlationId-ordering fix (spawned as its own task in the A2 session, still open); the logos byte-identity guard (still the founder's call to scope or retire).

## Production State at Session Close

Intentionally NOT byte-equivalent — a deliberate, standing change. `/api/reason` consults and accreditation writes may now carry `practice.suggestion`; Sage Reflect completions may now carry `developmental_priorities` and, at a grade-change moment, `suggestion`. Both flags confirmed live at close. No schema was applied this session. The delta/fold no-recommendation contracts, S10's public trust-record withholding, S11/ENFORCE, and the ADR-013 §8 honest-claims envelope are all unchanged.

## Blocked On

**Files to commit (already committed and pushed this session — for the record):**
- `website/public/llms.txt` (`ca87f92`, `5c11533`)
- `website/public/.well-known/agent-card.json` (`ca87f92`)
- `website/src/app/api-docs/page.tsx` (`ca87f92`)

**Files pending this close's own commit:**
- `operations/decision-log.md` (the A3 entry)
- `operations/reminders-2026-07/2026-07-26-practice-reminders-AGENT-build-plan.md` (§6/§8 status)
- `operations/handoffs/founder/2026-07-28-practice-reminders-AGENT-A3-docs-and-activation-CLOSE.md` (this file)
- `CLAUDE.md` (PR18 production-state refresh — pending)

Nothing else outstanding. **The practice-reminders agent plan is closed.**
