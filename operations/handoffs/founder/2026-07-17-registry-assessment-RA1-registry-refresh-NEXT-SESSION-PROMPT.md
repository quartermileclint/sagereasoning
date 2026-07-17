# Next-Session Prompt — RA-1: Registry Refresh + Reconciliation Records + D3/D8/D11 Doc Notes

**Stream:** founder.
**Tier:** `registry` + `governance` (one one-line code-comment fix rides along — no behavior change).
**Governing frame:** `/adopted/standing-protocol-cache.md` (open under `STANDING-SESSION-OPENER-grounded-foundations.md`).
**Predecessor session close:** `operations/handoffs/founder/2026-07-17-registry-assessment-build-plan-CLOSE.md`.
**Predecessor decision-log entries:** `D-REGISTRY-MENTOR-ASSESSMENT-RECONCILED-BUILD-PLAN-2026-07-17`.
**Risk classification:** Standard under 0d-ii. Critical Change Protocol NOT engaged. Window-safe (no frozen-graph file is touched; run the **extended** byte-identity gate at push regardless — the logos-close form, not the narrower build-plan §5 grep).

## Why this session matters

The registry (`v1.6.0 / 2026-06-10`) is the founder's and the mentor's assessment instrument, and it is five weeks / ~25 sessions stale — stale enough that the mentor's 2026-07-16 assessment rated two already-closed items CRITICAL. RA-1 restores the instrument to current truth, commits the reconciliation record (PR7 honesty in both directions), applies the mentor's three doc-note amendments verbatim, and records the founder's election on whether to return the reconciliation to the mentor. Everything downstream (RA-2…RA-5) reads a current registry after this.

## Pre-conditions

1. The plan of record is committed/available: `operations/registry-assessment-2026-07/2026-07-17-mentor-assessment-reconciled-build-plan.md` — read §1 (reconciliation) and §2 RA-1 in full.
2. The `sage-registry-update` and `sage-registry-audit` skills are present under `.claude/skills/`.
3. The observation window may still be open (~closes 2026-07-19) — no frozen-graph edits; the **extended** byte-identity gate runs at push.

## Part A — Open under the protocol

Read in order:
1. `/adopted/standing-protocol-cache.md` (~3 min — tier, model selection N/A, risk class, signals)
2. `operations/handoffs/founder/2026-07-17-registry-assessment-build-plan-CLOSE.md` (~5 min)
3. `operations/registry-assessment-2026-07/2026-07-17-mentor-assessment-reconciled-build-plan.md` — §1 + §2 RA-1 in full
4. `/operations/decision-log.md` last 2 entries

Confirm at open: tier; hold-point status (P0 0h active); model selection (N/A — registry/doc work, cite the cache row); status vocabulary; signals/risk class.

## Part B — Procedure

### Step 1 — Registry refresh (`/sage-registry-update`)
Run the skill against current truth. The update set, at minimum:
- **New/changed components since 2026-06-10:** the Trust Layer (trust core S1–S7 libs + tables, discernment engine + route, L4 audit, the S8 harness H1–H5, the S9 dogfood credentials/state, the S10 public trust-record read surface, the false-hold instrument), the corroboration check (live both surfaces), ADR-010 §4 native weighting live + §3 bridge retired, the R20a eleventh route (score-conversation wiring + activation), the UPC/M-series items already live, and the seven Remaining Principles tools (`/premeditatio` exercise, `/hupexairesis`, `/view-from-above`, `/morning`, `/oikeiosis` extension, `/sage-compass`, `/logos`) with their routes/tables.
- **`tool-sage-guard` (added by the 2026-07-17 audit — do not skip):** the entry describes a **retired** engine (`status: "wired"`, *"calls runSageReason(quick) with 3 mechanisms via Haiku"*, *"Uses fast Haiku model for speed"*). Truth: `/api/guardrail` serves the **ADR-009 signed deterministic sandwich** since 2026-06-19 (Sonnet L1 → deterministic L2 → Ed25519, no L3 prose; `guardrail/route.ts:174`, `lib/guardrail-sandwich.ts`), §3 bridge **retired 2026-06-26** (native `dikaiosyneWeighting:true`). Fix desc/notes/deps; `wired` → `live`; note CI-8 + CI-10. **This is ADR-009, not the ADR-010 §4/§3 items above — the general scope line does not reach it.**
- **Corrections from the reconciliation (plan §1):** `tool-sage-converse` blocker cleared (wired + activated 2026-07-07); `tool-sage-reflect` blocker cleared (Fix A/B verified closed); `infra-invocation-guard-test` note corrected (runs green under tsx, 92/0); `infra-r20a-classifier-eval` **desc CORRECTED — the registry's group names are factually wrong** (claims "A clinical crisis / B philosophical / C ambiguous"; the file has **A=`REGEX_FALSE_NEGATIVES`** [the regex-miss gap only Haiku closes], **B=`CORRECT_PASS_THROUGHS`**, **C=`CONTENT_SAFETY_EDGE_CASES`**, **D=`CLINTON_PROFILE_ZONE2`**) + note updated ("Group D Haiku-verified at S8a 2026-06-10, 6/6; A/B/C never run at Haiku and have NO runner → RA-4"); `infra-r20a-classifier` humanReady annotated to the verified residue (the G2 **four**-page rendering gap → RA-3; score-policy, mentor-index, journal, journal-feed); `"Factory wrapper"` labels fixed on `tool-sage-classify` + `tool-sage-prioritise` (bespoke libs, not factory); premeditatio/oikeiosis notes updated (extended 2026-07-13/14, live + ungated).
- Bump `version` + `lastUpdated`; keep `statusSummary` consistent (the audit skill checks this).

### Step 2 — D3/D8/D11 doc notes (mentor's amendments, verbatim intent)
In `adopted/rag-mentor-alt3/`:
- `passion-taxonomy.md` (D3): one note — the D8 passion recalibration (beyond philodoxia) is a **pre-Phase-2 dependency**, scheduled before Phase-2 build begins.
- `operationalised-rules.md` (D8): one version note — the Validation Addendum content is **authoritative until v1.1.0**; the architectural-conventions catalogue is the standalone reference in the interim.
- `layer-3-translation.md` (D11): one note — the sage-filter R20d alignment (second-person passion attribution prohibition) is a named **pre-Phase-2 dependency** requiring its own session.

### Step 3 — The one-line comment fix
`website/src/lib/score-conversation-r20a.ts:70–73`: the header still reads "UNSET in Vercel" — update to reflect the 2026-07-07 activation (`SUBSTRATE_SCORE_CONVERSATION_R20A_ENABLED=true`, live smokes green). Comment-only; no behavior change.

### Step 4 — The carried eyeball
`website/src/app/api/mentor/private/reflect/route.ts` — confirm the `effectiveUserId = user_id || auth.user.id` pattern on the non-distress writes is intended design (the distress log itself correctly uses `auth.user.id`). Record the confirmation (or a finding) in the close; do not change code this session.

### Step 5 — Founder election (record it)
Whether to send the reconciliation + refreshed registry back to the mentor for re-assessment, or proceed on the reconciled plan. Record the election in the decision-log entry.

### Step 6 — Verify
- `/sage-registry-audit` (or the skill's built-in checks): counts consistent, no orphan ids, humanReady/agentReady × status consistency rules pass.
- `python3 -c "import json; d=json.load(open('website/public/component-registry.json')); print(d['version'], d['lastUpdated'], d['totalComponents'], len(d['components']))"` — version bumped, counts match.
- Byte-identity gate at push: the extended grep prints NONE.
- `cd website && npx tsx src/lib/__tests__/r20a-invocation-guard.test.ts | tail -1` → still `92 passed, 0 failed` (nothing behavioral changed).

### Step 7 — Append decision-log entry (lean form)
Pattern per the cache §"Lean decision-log entry". Suggested id: `D-REGISTRY-RA1-REFRESH-AND-DOC-NOTES-2026-07-XX`.

### Step 8 — Session close (lean form)
Name the next session per the plan's recommended order (RA-2, `code-critical`, proposed 2026-07-18 — confirm or move the date) and the trust-layer interleave (D2 narrowing → return-with-record on their own clock).

## Part C — Anticipated session shape
| Phase | Estimate |
|---|---|
| Cache + close + plan §1/§2 read | 15–20 min |
| Step 1 registry refresh | 60–90 min |
| Steps 2–3 doc notes + comment | 20 min |
| Steps 4–5 eyeball + election | 10 min |
| Step 6 verify | 10 min |
| Decision-log + close | 20–30 min |
| **Total** | **~2.5–3 h** |

## Rollback path
`git revert` the RA-1 commit — registry JSON + docs + one comment; nothing deploys behaviorally.

## Forecast
Success = the registry reads current truth and carries the reconciliation's corrections; the mentor's three doc notes are in place; the founder's re-consult election is recorded. Next: RA-2 (`/api/score-decision` full-field R20a coverage — the one live safety gap; `code-critical`, founder-walked, proposed 2026-07-18), then RA-3 (two-page distress rendering), RA-4 (ES1 Haiku run, proposed 2026-07-20), RA-5 (readiness diagnosis, parallelizable).

End of prompt.
