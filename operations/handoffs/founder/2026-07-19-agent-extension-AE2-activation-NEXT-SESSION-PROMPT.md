# Next-Session Prompt — AE-2 ACTIVATION: the CI-4 loop fold goes live (MEASURE)

**Stream:** founder (agent-extension).
**Tier:** **`code-critical` 0c-ii, founder-walked** (AC7 + PR6 + PR17 engage). One env flag activates a NEW field on a live route's response (`loop_fold` on the accreditation write 200) — 0d-ii names env-flags-activating-new-surfaces Critical. **Nothing is pre-approved by the build session**; the assent is given here or not at all.
**Governing frame:** `/adopted/standing-protocol-cache.md` §Critical-risk sessions + `/adopted/build-sessions-protocol-cache.md`.
**Predecessor close:** `operations/handoffs/founder/2026-07-19-agent-extension-AE2-ci4-loop-fold-CLOSE.md`.
**Predecessor decision-log entry:** `D-AGENT-EXTENSION-AE2-CI4-LOOP-FOLD-BUILT-DARK-REVIEW-FOLDED-2026-07-19`.
**Binding design:** ADR-014 §§3.2/4/5 + ADR-013 §8. Verbatim/ADR wins over this prompt.

## What this activates

`SUBSTRATE_LOOP_FOLD_ENABLED=true` in Vercel Production makes the accreditation write 200 carry the additive **`loop_fold`** block (schema `agent-loop-fold-v1`): the submitted provenance chain Ed25519 re-verified per element, each loop's opening verdict classified through the canonical kathekon-engagement predicate, engaged loops folded per-domain via the S3 `combineVerificationResults` (conflict ⇒ pause, never average; evidence-floored `insufficient_extraction`), the false-positive hold class surfaced separately as `instrument_calibration`, temporal/regime attribution REFUSED on-block, PA-10 + submission-order + chain-scope bounds disclosed. **MEASURE-only — nothing binds; the write outcome is unreachable by construction.** Flag-on also adds ONE PK read on `api_keys` per successful write (deduped into the trust-event emission).

## Pre-conditions (STOP if unmet)

1. The AE-2 build commit is pushed + Vercel green (the fold code deploys DARK — flag unset ⇒ byte-identical, battery-asserted).
2. Batteries green on the pushed build: loop-fold **104/0** · accreditation route **90/90** · s3-combiner 106/0 · kathekon 79/0 · `tsc` 0 · `npm run build` ✓.
3. Read the close §Critical Change Protocol answers + this prompt in full.

## The walk (inviolable order; every live op the founder's — PR17)

1. **Set `SUBSTRATE_LOOP_FOLD_ENABLED=true`** in Vercel Production + redeploy (green). No migration exists for this arm (no schema).
2. **Live smoke (one write, then torn down or left as a real record — founder's call):** an accreditation write on the gen-2 s9-loop accred credential (or a throwaway owner+agent-bound `sr_prac_` with `accreditation_write`) carrying ≥1 signed assessment with CI-4 markers. Expect HTTP 200 with `loop_fold` present: `envelope.n_verified ≥ 1`, `schema:"agent-loop-fold-v1"`, `regime.write_era:"post-s11b-recomposition"`, `ordering.occurred_at_basis:"submission_order"`, the attribution-refusal + PA-10 + measure notes verbatim, `bounds` carrying both NARROWED_ARM_BOUNDS clauses. A chain with an unclosed engaged loop should read `character.loops.open ≥ 1`; a marker-less chain reads counts honestly at zero with `insufficient_extraction` domains. **Flag-took-effect proof:** flag-off omits the `loop_fold` key entirely.
3. **The R18 election (decide BEFORE any public surface changes):** whether to document `loop_fold` now on the three public surfaces (llms.txt / agent-card extension / api-docs) or defer documentation until the surface has real consumers. If documenting: founder signs off the wording FIRST; every surface restates **evaluative-never-predictive · record-descriptive · MEASURE-only · WEIGHTS BLOCKED** (a closure gradient is the shape of a training reward). If deferring: record the deferral in the decision log (the field is additive + flag-gated; the R18 posture tolerates a short undocumented dark-to-lit window poorly — prefer documenting).
4. **Records:** decision-log entry (`D-AGENT-EXTENSION-AE2-ACTIVATION-LIVE-…`), close, CLAUDE.md production-state refresh (PR18).

## Rollback

Unset `SUBSTRATE_LOOP_FOLD_ENABLED` + redeploy — the response is byte-identical flag-off (battery-asserted); `git revert` any docs commit. No schema to reverse.

## Explicitly out of scope

The S11 refusal (ENFORCE remains S11; MEASURE throughout; weights BLOCKED; the 0h call remains the founder's). The A8-review inputs (chains half; CarriedProfile; the marker row-widening decision). AE-3 (last). The s9-loop consult-credential refresh remains its own recommended `code-critical` step — until it lands the founder-loop harness runs unframed.

End of prompt.
