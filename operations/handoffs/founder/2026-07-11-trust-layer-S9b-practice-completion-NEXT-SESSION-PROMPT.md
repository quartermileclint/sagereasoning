# Next-Session Prompt — Trust Layer S9b: the practice-completion slice (calling gate + screened reflection + Gate-2 elicitation + depth calibration)

**For the founder. Paste as the first message of a fresh session.** (Rename the date prefix to the actual session date.)

**Stream:** founder.
**Tier:** **`code-elevated` for the build → `code-critical` at the schema-widening step** (the founder-walked migration; PR17/AC7). The build slices are repo-local and flag-gated; the ONE live step is the `agent_trust_events` CHECK widening (TEST → prod), walked by the founder under the full Critical Change Protocol.
**Governing frame:** /adopted/standing-protocol-cache.md + /adopted/build-sessions-protocol-cache.md.
**Design-of-record:** ADR-013 §11 (`adopted/adr/2026-07-08-sage-trust-layer.md`) — **the verbatim mentor record wins** (`operations/trust-layer-2026-07/2026-07-11-mentor-consultation-calling-reflection-gate2-verbatim.md`).
**Plan of record:** `operations/trust-layer-2026-07/trust-layer-build-plan.md` §S9b.
**Predecessor close:** `operations/handoffs/founder/2026-07-11-trust-layer-S9-dogfood-install-CLOSE.md`.

## Why this session matters

S9 put the seven-layer harness LIVE in the founder's loop under MEASURE — real trust records now accumulate on `sagereasoning:s9-loop@v1`. S9b completes the practice's four-stage shape on that clean baseline: the CALLING stage upstream (the hard gate + purpose-acknowledgement + profile seeding), the REFLECTION stage's full credential (screened → out-of-band Q1–Q6 against the verbatim persist), the Gate-2 structured elicitation, and per-domain depth calibration from the live trust profile. Every addition is MEASURE until S11.

## Pre-conditions (confirm at open)

1. The S9 close commit is pushed; the standing install is ON (`/practice-on` echo: hooks + `PROVISIONED`); the prod trust flags remain `true`; real records exist for `sagereasoning:s9-loop@v1`.
2. Batteries green at open: `s9-instrument-fidelity-battery` requires the TEST walk env (skip unless re-provisioned — see the S9 close's TEST-parity block); the repo batteries at their standing counts (S1 97/0 … S8 145/0, hooks 91/0 + 230/0).
3. The S9 findings register is read (S9 close §Findings): **(F-Q43)** L4 Q4.3 `resolutionBeforeComplete` has no discrimination on faithful orchestrator traces (fires on any narrated intention — G3/G5's "causal signature, never output content" is the calibration frame); **(F-CONF)** retrospective-confession framings under-derive violated obligation circles (0/6) — an S2/S9b evidence-weighting consideration; proposed-action framings (the live loop's class) are reliable.

## The founder elections this session must take (AskUserQuestion at open)

1. **The re-opened D3 depth election (G5, mentor-specified).** `readTrustVerdict` per domain now calibrates depth: reflexive ⇒ **deep required** (this re-opens the harness's never-deep election); habitual ⇒ standard; deliberate ⇒ standard (quick permitted with a strong recent credential + no justice surface); principled+ ⇒ quick; mid-session recalibration on trust-reducing events. Adopt as specified, or hold deep behind a config gate for the dogfood period?
2. **Bundle the loop-metering CHECK widening into the schema step?** S9's election 3 queued the `loop_billing_events` surface-CHECK widening (the discernment surface consumes Sonnet unmetered) as its own founder-walked step before S10. S9b's schema step is already a founder-walked CHECK widening on TEST→prod — bundling both into one walk is one migration instead of two (each independently reversible). Recommended: bundle.
3. **Reflect-persist activation.** G2 requires the reflect-persist erasure wiring (`/api/user/delete` + `/api/credential/erase` + a retention cron for `sage_reflect_sessions`) — the standing prerequisite is IN-SCOPE here. Election: after the wiring lands, does `SAGE_GATE1_REFLECT_PERSIST_ENABLED` go ON in the standing install this session (the G2 out-of-band Q1–Q6 needs the persisted verbatim), or does the persist activation get its own smaller walk?
4. **TEST-parity provisioning for the S9b batteries.** The S9 close records the four-flag + signing-keypair TEST-parity block. Re-provision it for this session's TEST legs as one step at open (recommended — S9 hit these gaps serially), or run repo-only batteries where possible?

## Scope (build plan §S9b verbatim governs; condensed here)

- **G1 — calling:** the SessionStart **hard gate** for purposeless agents (profile read → declared purpose present ⇒ proceed; absent ⇒ a calling session before any task frame); the scoped **purpose-acknowledgement at spawn** → the collaboration record (full calling only for un-profiled candidates, per A6); calling records as the **primary seeding mechanism** for S2/S5 profiles + domain weights (declaration-tier confidence).
- **G2 — screened reflection:** H4's forced turn + verbatim persist credentialed `screened`; the harness runs the **full Q1–Q6 out-of-band against the verbatim persist** ⇒ `reflect-completed-honest` on pass; screened-only patterns = a developmental signal. Gated on the erasure wiring (in-scope).
- **G3 — Gate-2 elicitation:** the tool-class trigger stays the suppression-resistant OUTER gate; on fire, the three-sub-question structured elicitation is captured out-of-band and examined deterministically — calibrated to the **causal signature, never output content**.
- **G4 — the suppression watch:** `passion-unflagged-by-self-screen` emitted by the reflect service (reflect Q4 × the session's signed assessments; 3-part standard incl. sub-species; `self-screen-absent` distinct).
- **G5 — depth calibration:** per-domain from `readTrustVerdict` (election 1), with mid-session recalibration.
- **The founder-walked schema step:** widen the `agent_trust_events` event-type CHECK for `calling-completed` (asymmetric update), `reflect-screened-honest` (**quarter-rate** decay modulation — a new constant beside the half-rate cap), `self-screen-absent`; + the engine `EVENT_EFFECT` rows and derivers, each R18f-parallel. (+ the billing CHECK if election 2 bundles.)

## Procedure

1. Reads: the two caches; the S9 close (incl. the findings register + TEST-parity block); ADR-013 §11; the verbatim mentor record (it wins); build plan §S9b.
2. Elections (above).
3. Build the G1–G5 slices flag-gated + fail-honest on the current harness (the S8 channel-law classifications govern: injected content is ADVISE; out-of-band actions are the binding/record channels; MEASURE throughout — nothing new binds before S11).
4. Batteries per slice (tsx convention; constructed genuinely-signed artifacts where determinism matters — the S9 precedent; live extraction where the live path is under test; F-Q43/F-CONF inform the fixtures).
5. The founder-walked schema step (TEST → prod; §VERIFY green both; reversible).
6. Adversarial review (Workflow fan-out; refuters on every load-bearing claim; §4 first-hand fallback).
7. Records: close + decision log + CLAUDE.md PR18 refresh + mark this prompt SPENT + author the S10 prompt.

## Rollback
Each build slice: `git revert` (flag-gated; dark without its flag). The schema step: the widening is additive (new enum members) — reversible by CHECK restore while the three event types are unemitted. The standing install: `/practice-off` + unset flags per the S9 close's rollback block.

## Forecast
Ends with the four-stage practice complete in the standing harness under MEASURE — calling seeding profiles, screened + full reflection credentials earning honestly, Gate-2 elicitation firing on the causal signature, depth calibrated per domain — and the S10 public read surface unblocked (the `fix_before_s10` register + the S9/S9b findings gate its R18 sign-off). **ENFORCE is S11.** Weights BLOCKED; the 0h call remains the founder's.

End of prompt.
