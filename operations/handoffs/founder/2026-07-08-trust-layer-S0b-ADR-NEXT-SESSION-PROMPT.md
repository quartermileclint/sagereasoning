# Next-Session Prompt — Trust Layer S0b: the Trust Layer ADR + record-capture verification (+ two governance riders)

> **STATUS: SPENT — executed 2026-07-08** (`D-TRUST-LAYER-S0B-ADR-ADOPTED-2026-07-08`). ADR-013 adopted (`adopted/adr/2026-07-08-sage-trust-layer.md`); capture set verified complete; manifest R5 100→30 applied (founder-approved; cache clean); the `direction_of_travel` normalization LANDED at BOTH live boundaries per E1 (`declining`) / E2 (land now) — the M7 overlay AND the reflect completion profile (whose public docs already said `declining`; a live docs/wire drift found + fixed). Close: `operations/handoffs/founder/2026-07-08-trust-layer-S0b-ADR-CLOSE.md`. Next: S1.

**For the founder. Paste as the first message of a fresh session.** (Rename the date prefix to the actual session date.)

**Stream:** founder.
**Tier:** `governance` — Standard risk under 0d-ii (documents: one new ADR + record verification + a founder-gated manifest edit). **Two riders may elevate:** (i) the manifest R5 number fix is a governance edit **founder-gated in-session** (explicit approval before the manifest is touched; cache-drift check per the update discipline); (ii) the `direction_of_travel` normalization touches a **Live** wire value (`meta.trajectory.direction_of_travel` on `/api/reason`, M7) — if the elected fix changes what the live overlay emits, that step is **Elevated (`code-elevated`)** and the session's highest tier follows it. Confirm at open. **AC7 NOT engaged** — no flag, schema, credential, or perimeter change; nothing deploys until the founder's push, and the only candidate behaviour change is the disclosed vocabulary normalization.
**Governing frame:** /adopted/standing-protocol-cache.md (lean templates; the day's deliverable named below).
**Predecessor session close:** `operations/handoffs/founder/2026-07-08-corroboration-check-activation-CLOSE.md`.
**Predecessor decision-log entries:** `D-TRUST-LAYER-BUILD-PLAN-ADOPTED` (the S0b mandate); `D-TRUST-LAYER-S0A-CORROBORATION-CHECK-BUILT-DARK-REVIEW-FOLDED` + `…-LIVE-BATTERY-GREEN` + `…-LIVE-GATE-ACTIVATION` (S0a fully discharged AND live).

## Why this session matters

The Trust Layer build now has its Phase-0 prerequisite **live in production** (the corroboration check, both surfaces) but no **design-of-record**: the trust definition, the mentor's seven trust-infrastructure specifications, the four-layer discernment protocol, and the nine binding precision answers live in a verbatim record and a plan, not in an ADR the P1–P4 slices can cite as their governing design surface. S0b closes Phase 0 by authoring that ADR — including the honest-claims envelope every later public surface (S10) and activation (S11) must stay inside — and clears two small governance debts the plan names (the stale manifest R5 free-tier number; the `direction_of_travel` vocabulary split) **before S1 builds the trust store on top of that signal**.

## Pre-conditions
1. The activation session's commit is pushed (the corroboration check live + documented; 16 agent-card extensions on the live surface).
2. No API credits needed (documents session; no LLM calls).

## Part A — Open under the protocol

Read in order:
1. `/adopted/standing-protocol-cache.md` (~3 min — tier, signals, lean templates)
2. `operations/handoffs/founder/2026-07-08-corroboration-check-activation-CLOSE.md` (~5 min — the live state the ADR must describe honestly)
3. `operations/trust-layer-2026-07/trust-layer-build-plan.md` — §Context, §S0b, §Mentor-spec traceability, §Standing gates (the ADR's skeleton)
4. `operations/trust-layer-2026-07/2026-07-07-mentor-nine-answers-verbatim.md` — **in full** (BINDING; the ADR encodes, never paraphrases-over)
5. The two mentor .rtf responses + `inbox/harness research.txt` (committed 2026-07-07) — targeted read for the seven specs + the discernment protocol; `operations/trust-layer-2026-07/2026-07-07-harness-research-findings.md` for the interop/positioning grounding
6. `adopted/adr/2026-06-24-sage-practice-measurement-instrument-reframe.md` (ADR-012 — the three-use ladder the sequencing section must encode)
7. `/operations/decision-log.md` — last 2 entries

Confirm at open: tier (+ the rider elevations above); hold-point (P0 0h active); model selection N/A (documents); status vocabulary; signals/risk class. **Founder election at open (E1):** the `direction_of_travel` canonical form — recommendation: normalize the trust-layer boundary to the engine/D17 vocabulary **`declining`** (the sandwich's `DirectionOfTravel` type at `layer2-mechanisms.ts:107` is canonical; the reused aggregator's `regressing` was kept only because the component was reused as-is — `trajectory-overlay.ts:67-70` documents the split), mapped at the boundary so the aggregator itself is untouched. **E2:** land the normalization this session (small mapping + type reconcile + unit regression; Elevated) or record it as a named S1 pre-step (documents-only today).

## Part B — Procedure

### Step 1 — Verify the capture set (verify, don't re-capture)
The S0b capture half was largely discharged at plan adoption. Verify first-hand that these are committed and complete: the three inbox primary sources (`inbox/harness research.txt`, `inbox/mentor infrastructure response.rtf`, `inbox/mentor response to discernment enquiry.rtf`), the nine-answers verbatim record (incl. the retrieved answer-9 tail), and the research findings. Fold any gap found (that would be a real capture step); otherwise record "verified complete" in the close.

### Step 2 — Author the Trust Layer ADR (the day's primary deliverable)
`adopted/adr/<date>-sage-trust-layer.md` — design-of-record for the whole arc. Required sections (plan §S0b):
- **Trust definition** (mentor spec 1) and the seven trust-infrastructure specifications, each mapped to its build slice (reuse the plan's traceability table — spec → S-number).
- **The four-layer discernment protocol** (L1 honestum / L2 fit / L3 axia / L4 out-of-band passion audit) as adopted design.
- **The nine mentor answers as BINDING specifications** — cite the verbatim record as canonical; the ADR states the design decision each answer fixes (A1 combiner routing incl. the corroboration key; A2 domain distance; A3 decay + floors; A4 transparency ratio; A5 seven multiplicative confidence tiers; A6 un-profiled candidates; A7 L4 out-of-band; A8 habitual-pause bound; A9 authority boundary + the three delegation cases).
- **Architecture:** trust core + reference harness; the five founder elections of record; the seven-layer harness framing (Verification + Governance = the sage practice).
- **Measure→enforce sequencing under ADR-012:** record the gate state HONESTLY as of this session — the corroboration check is **LIVE on both surfaces** (`D-…-LIVE-GATE-ACTIVATION`), so the logos-enforce *activation condition* is discharged; **binding enforcement still does not exist until S11's own founder-walked Critical activation** (plan §S11; log-and-continue at S4). Nothing in this ADR pre-approves it.
- **Honest-claims envelope (R18):** what a trust record attests / does NOT attest — the disclosed extraction-trust ceiling (the A2 self-report-omission class + the Arm-B consistent-lie class), the A9 case-3 uncatchable class, no reasoning-quality claim beyond what the signed artifacts carry, **weights/training-signal claims BLOCKED throughout**. This section is the boundary S10's public surface must publish inside.
- Status: Adopted on founder sign-off in-session; cross-reference the plan + ADR-010/011/012.

### Step 3 — Manifest R5 number fix (founder-gated)
`manifest.md:125` still reads "Free API access provides 100 calls per month" — stale vs the adopted-and-live 30/1/1 (`D-FOUNDATION-COMPLETION-SESSION1-…`, terms/pricing already reconciled 2026-07-07). With explicit founder approval in-session: 100→30 (touch nothing else in R5). Then run the cache-update discipline check: grep the standing protocol cache for any quoted R5 number; if the cache is affected, amend it same-session + `D-CACHE-DRIFT-RESOLVED-<date>`.

### Step 4 — `direction_of_travel` normalization (per E1/E2)
Ground truth first-hand before electing: `layer2-mechanisms.ts:107` (`'improving' | 'stable' | 'declining' | 'single_snapshot'`) vs the reused trust-layer aggregator's `'regressing'` surfaced through the Live M7 overlay (`trajectory-overlay.ts:67-70` documents the deliberate keep). If E2 = land now: map `regressing`→`declining` at the trust-layer boundary (the overlay composition point), reconcile the type, add the unit regression, disclose the wire-value change (Elevated; the M7 overlay is Live — `meta.trajectory` consumers see the new value on deploy; grep public docs for `regressing` and reconcile if present). If E2 = defer: record the elected canonical form in the ADR + a named S1 pre-step. Either way the **ADR names the canonical vocabulary** so S1's trust events never inherit the split.

### Step 5 — Records
Lean decision-log entry (`D-TRUST-LAYER-S0B-ADR-ADOPTED-…`) + lean close + CLAUDE.md PR18 refresh (Phase 0 complete; S1 next) + mark this prompt SPENT. If Step 4 landed code: `tsc` + the touched unit suite + `npm run build` before close.

## Part C — Anticipated session shape
| Phase | Estimate |
|---|---|
| Cache + close + plan + verbatim record + sources read | 30–40 min |
| Step 1 capture verification | 10 min |
| Step 2 ADR authoring | 60–90 min |
| Step 3 manifest fix + cache check | 10 min |
| Step 4 normalization (if landed) | 20–30 min |
| Step 5 records | 20–30 min |
| **Total** | **~2.5–3.5 h** |

## Rollback path
`git revert` the session commit — documents (+ at most the small boundary mapping). Each of the three deliverables (ADR / manifest line / normalization) is independently revertable; nothing live changes until the founder's push, and the only push-time behaviour change is the disclosed Step-4 wire value (if elected).

## Forecast
Ends with Phase 0 complete: the Trust Layer ADR adopted as the design-of-record the P1–P4 slices cite, the capture set verified, the two governance debts cleared, and the vocabulary boundary fixed before S1 builds on it. **Next: S1 — trust state + event vocabulary** (`code-critical`: new schema + data rights; its own founder-walked 0c-ii for the migration). Weights claims BLOCKED; the 0h call remains the founder's.

End of prompt.
