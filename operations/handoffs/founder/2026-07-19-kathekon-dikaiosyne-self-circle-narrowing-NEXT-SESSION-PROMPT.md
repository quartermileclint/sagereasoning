# Next-Session Prompt — kathekon predicate: narrow the justice arm off the self-preservation circle (mentor-mandated)

**Stream:** founder (trust-core / agent-extension).
**Tier:** **`code-elevated`** — Elevated under 0d-ii. A pure-predicate change to a shared module + its downstream MEASURE surfaces; NO schema / flag-set / mint / deploy is required to BUILD it (dark/additive where possible). **Note the reach:** the predicate is the exact function the eventual S11 enforce flip binds on (G6(a)), so although everything is MEASURE today, treat the change with S11-grade care — an adversarial review + full battery are mandatory. If any part is elected to change a live surface's behaviour non-additively, that part escalates to `code-critical` and is founder-walked.
**Governing frame:** `/adopted/standing-protocol-cache.md` + `/adopted/build-sessions-protocol-cache.md`.
**Binding spec (verbatim wins):** `operations/trust-layer-2026-07/2026-07-19-mentor-consultation-dikaiosyne-self-circle-verbatim.md` — ADOPTED 2026-07-19 (`D-MENTOR-CONSULTATION-DIKAIOSYNE-SELF-CIRCLE-ADOPTED-2026-07-19`). Read it in full first.
**Predecessor:** `operations/handoffs/founder/2026-07-19-agent-extension-AE2-activation-CLOSE.md` (the AE-2 fold is LIVE, MEASURE — the finding that prompted the consultation is recorded there).

## The ruling to implement

`dikaiosyne` is other-directed. The **`self_preservation` circle, standing alone with no other identified party, is NOT a justice surface.** Narrow the kathekon-engagement predicate's **justice-surface arm (Arm 1)** to require **≥1 circle beyond `self_preservation`** — a circle containing another rational agent whose good is genuinely at stake. Self-regarding action is `phronesis`/`sophrosyne`, not `dikaiosyne`. The A2-omission class is an **extraction** responsibility, not predicate breadth — do NOT broaden the predicate to catch omitted harms.

## Scope

1. **`assessKathekonEngagement`** (`website/src/lib/substrate/trust-core/kathekon-engagement.ts`): narrow the justice-surface arm so a lone `self_preservation` circle does not satisfy it. Confirm the exact circle vocabulary the extractor emits (the live probe read `self_preservation` as the circle name; verify the canonical set before coding the exclusion — do not hard-code a guessed string). Keep the other three arms (violated obligation / proximity ≤ habitual / sub-species passion) unchanged. Update `NARROWED_ARM_BOUNDS` text to reflect the new boundary.
2. **The design question the mentor flagged (do NOT skip):** once `self_preservation` alone stops satisfying the justice arm, decide deliberately where a genuinely-`phronesis` self-regarding redirection goes in the AE-2 `loop_fold` split — character-`phronesis` vs `instrument_calibration`. A self-only *prudential* redirection is a genuine phronesis matter (character signal), NOT necessarily instrument noise; make sure the narrowing does not silently dump real phronesis signal into `instrument_calibration`. This may require the split to key on the *presence of any kathekon factor* correctly, or a distinct treatment of self-only-phronesis. Design it against the verbatim, get it right, disclose the choice on-block.
3. **Re-verify AE-2 `loop_fold`** against the corrected predicate: the loop-fold battery (currently 132/0) must be updated + green; re-run a smoke-equivalent fixture set to confirm self-only redirections now classify per the ruling.
4. **The S11 gate path (G6(a)) + the false-hold labelling instrument:** the corrected predicate changes both. Re-run the kathekon-engagement battery (79/0) + the false-hold-capture battery. **Re-classify the frozen false-hold observation buffer** (`operations/trust-layer-2026-07/runs/2026-07-17/false-hold-record-FROZEN-2026-07-17.jsonl`, 130 records) under the corrected predicate and record how the false-hold *rate* shifts (self-only holds previously counted as engaged/correct will move) — this feeds the S11 readiness standard part (3).
5. **ADR amendment:** land the binding ruling as a dated amendment to the governing ADR (ADR-013 §11 pattern, or ADR-014 as fits) pointing at the verbatim record.
6. **Adversarial review** (Workflow or first-hand per the §4 precedent) + full battery sweep (kathekon 79/0, loop-fold 132/0, false-hold-capture, trust-core S1, negative-battery RELEASE GATE, `tsc`, build).

## Explicitly out of scope / carried

- The S11 flip (ENFORCE remains S11; MEASURE throughout; weights BLOCKED; the 0h call remains the founder's).
- AE-3 (last; per ADR-014 §3.4).
- The Layer-1 extraction reliability work the mentor names as the *real* home of the A2-omission class (its own step).
- The s9-loop consult-credential refresh (recommended; the harness framed intermittently this session).

## Rollback

The predicate change is a pure-lib edit — `git revert` the build commit. The AE-2 fold stays live (MEASURE) throughout; if the narrowing's re-verification surfaces a regression, the fold can be rolled to dark independently (unset `SUBSTRATE_LOOP_FOLD_ENABLED` + redeploy).

End of prompt.
