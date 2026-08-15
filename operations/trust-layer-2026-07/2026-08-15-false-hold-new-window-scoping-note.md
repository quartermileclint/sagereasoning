# False-hold observation — NEW window scoping note

**Date:** 2026-08-15 · **Session:** concurrent-arc C1 (item 4) · **Tier:** documents only — nothing here builds, activates, or starts anything.
**Register homes:** trust-layer `S11-FLIP-PREREQUISITES-REGISTER.md` **P6** (the new window) and **P5** (the denominator gap this design must solve). The **P8a/P8b** numbering is the *agent-org/P2-verdict program's* (CLAUDE.md: "P8a/P8b — guard-path capture + the new observation window") — same underlying work, different register. **Note the collision: the agent-org register's P6 is the founder console, an unrelated item.** This note serves trust-layer P6 ≡ agent-org P8b, with agent-org P8a (guard-path capture) as its hard precondition.
**Binding sources:** the 2026-07-12 S11 deferral verdict (the four-part readiness standard), the 2026-07-17 F2/exclusion-clause verdict (R6: the guard path writes no record), the 2026-07-19 self-circle ruling (the narrowed predicate), the S11b recomposition record, the 2026-08-15 M1 ruling (window-conditional guard), and the concurrent-arc plan (R2/R4 sequencing).

---

## 1. Purpose

Make the mentor's readiness-standard **part (3)** — a measured false-hold **rate** over the live distribution, target: false holds on kathekon-free actions ≤ correct holds on genuinely problematic ones — measurable **on the current instrument**, which the frozen 2026-07-12→17 buffer cannot do (old lean composition, one action class, no denominator; register P6). Parts (1) and (2) ride the same window: ≥7 days over a **representative** distribution; all four cardinal domains evaluated with confidence above conservative on ≥2.

## 2. What the new window must capture (post-S11b composed-input regime)

1. **v3 records only, regime-stamped.** Every capture record is `false-hold-record-v3` (circle identities captured; regime mark `at-action-v2-composed`). The report classifies STRICT on v3. **Never mix regimes in one rate** (register P6, verbatim input): the frozen 130-record buffer is a different regime and stays frozen as historical evidence — no record from it enters any new-window computation.
2. **The narrowed predicate as the classifier — unchanged for the window's duration.** `assessKathekonEngagement` (Arm 1 requires ≥1 circle beyond `self_preservation`; Arms 2–4 unchanged) is the shared function the eventual S11 G6(a) flip binds on; the window measures *it*, not a reimplementation. Because **D4 (the reducer self-circle narrowing) lands before the window opens** (R2 build → R4 walk), predicate and reducer are aligned for window-period data — removing, for this window, the P1 "third axis" divergence on self-only circles. If D4 slips, the window still runs (the predicate is the flip's input), but the report must state the predicate⊂reducer divergence as a bound.
3. **A populated denominator — the guard path must write records (P8a; solves register P5).** The 2026-07-17 ruling's blocker, verbatim: *"The genuinely dangerous actions are on the guard path, which writes no record."* The existing capture fires only inside `runConsult`; `runGuard` writes nothing. P8a extends capture to the guard path (verdict, kathekon signals where derivable, deny/caution/proceed outcome) so "correct holds on genuinely problematic actions" is populated. **Without P8a, part (3) is unmeasurable again and the window would repeat the first window's defining failure.**
4. **Coverage accounting (the honest denominator-of-the-denominator).** The window must record its own losses: consults attempted vs framed vs captured, 28s-timeout losses, transient 401s — all fail-open-honest and therefore *invisible in the buffer unless counted*. Register P6 names the bias plainly: timeout losses bias the sample toward fast consults. The credential-lookup retry activation (R4 item 6) precedes the window and should shrink the transient-401 class; residual losses are counted, never assumed away. Design implication: the capture layer needs a lightweight attempt-counter (e.g., an `ATTEMPTED`/`CAPTURED` line class in the same durable dir), not just success records.
5. **Stated bounds ride every computed rate.** The mention-conversion bound (Layer 1 converts *quoted* party language into circles ⇒ inflates `correct_holds`; `NARROWED_ARM_BOUNDS.mentionConversion`) and the self-circle exclusion bound are printed on the report's rate, not footnoted elsewhere. The Layer-1 re-check that could close mention-conversion is its own named Critical step and is **not** assumed done.
6. **Representativeness + domain coverage tracked in-window.** Part (1) failed last time on "one tool class, one depth, one proximity." The window's report must break records out by tool class, depth tier, and evaluated cardinal domain so representativeness is *demonstrated*, not asserted — and so part (2)'s four-domain requirement is checkable from the same buffer.

## 3. Does P8a precede the window start? — YES (three independent reasons)

1. **Measurement necessity:** without guard-path records the part-(3) ratio has no denominator (§2.3 above; register P5).
2. **The contamination rule (the sequencing rationale this note exists to encode):** every guard-bundle edit changes the measured instrument, so **the window must open on the new instrument state, not span the edits — a window contaminated mid-flight by instrument edits measures neither state.** Adding P8a mid-window is exactly such an edit.
3. **The M1 guard makes mid-window edits structurally loud:** per the 2026-08-15 M1 ruling, the logos byte-identity guard is window-conditional — it re-arms the moment `GATE1_FALSE_HOLD_CAPTURE` is set. A mid-window measured-file edit would trip the armed guard. The discipline and the enforcement now point the same way.

**Sequencing (mirrors the concurrent-arc plan):** P8a builds dark in **R2** (item 8) → all guard-bundle activations walk in **R4** (items 1–6, incl. D4+D1 and PR24 retention for `agent_hold_observations`) → **the window starts as R4's LAST step** (item 7): `GATE1_FALSE_HOLD_CAPTURE=true` + durable `GATE1_STATE_DIR`.

## 4. Durable state-dir requirement

`GATE1_STATE_DIR` must be a **durable path** (the 2026-07-12 activation precedent: `/Users/clintonaitkenhead/.sage-gate1`; **never `/tmp`**, which does not survive reboots), set **before** the flag, and **unchanged for the whole window** — a mid-window dir change fragments the buffer. The buffer is append-only; at window close it is frozen by copy into `operations/trust-layer-2026-07/runs/<date>/` (the 2026-07-17 freeze precedent) before any ingest or re-classification. Server-side ingest into `agent_hold_observations` (already migrated, empty) happens via the existing report script; **PR24 retention parity for that table activates at R4, before ingest begins**, so the ingested rows are retention-governed from day one — the first window's rows never were, because ingest never ran.

## 5. Window close + assessment

≥7 days elapsed AND the representativeness break-out (§2.6) shows more than one tool class/depth → freeze the buffer → run the report (strict v3 classification; bounds printed) → assess **all four parts** of the readiness standard → the founder's day-7 spot-check of a sample of classifications (the 2026-07-12 election: structural predicate + human spot-check). The report informs the S11 flip reconsideration; **it does not make it** — the flip session re-reads the register in full, and the assent is re-confirmed at flip time (PR7).

## 6. Explicitly out of scope here

No predicate change (the classifier is frozen as the thing measured); no flip preparation beyond part-(3) measurability; no capture-code build (that is R2/P8a's job, with its own review); no activation (R4's job, founder-walked). **The flip remains REFUSED; readiness NOT met; MEASURE throughout; weights BLOCKED; the 0h call remains the founder's.**
