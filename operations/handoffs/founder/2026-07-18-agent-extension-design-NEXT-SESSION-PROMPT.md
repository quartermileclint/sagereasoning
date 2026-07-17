# Next-Session Prompt — Agent-Extension Design: the five mentor-named components, reconciled against the live trust layer

**Stream:** founder.
**Tier:** `governance` — a design session (documents + read-only code grounding). **No build, no schema, no flag, no mint.** Any build slice it elects becomes its own later session at its own tier (anything touching `/api/reason`, the trust core, or the R20a perimeter is `code-critical` + founder-walked per AC7/PR17).
**Governing frame:** `/adopted/standing-protocol-cache.md`; open under `STANDING-SESSION-OPENER-grounded-foundations.md`.
**Predecessor:** `operations/handoffs/founder/2026-07-17-trust-layer-S11-F2-mentor-briefing-CLOSE.md` (trust-layer state) + the scoping session of 2026-07-18 (`D-AGENT-EXTENSION-MENTOR-COMPONENT-REVIEW-CAPTURED-SCOPED-2026-07-18`).
**Binding input:** `operations/agent-extension-2026-07/2026-07-17-mentor-json-components-review-verbatim.md` — **read §1 verbatim first; the verbatim wins over every digest, including this prompt's.**
**Risk classification:** Standard under 0d-ii (documents only). Critical Change Protocol NOT engaged in this session; it is named ahead for the build slices.

## Why this session matters

The mentor reviewed the component registry (v1.7.0, 304 rows) and named the five components "where the extension work lives" for extending the practice to agents: **D17 (progression delta) → sage-iterate → sage-practice-reflect (agent variant) → R20b (agent variant) → D13 (trigger catalogue review)** — with the governing principle *"Assessment without longitudinal tracking is a snapshot. Practice requires a trajectory."* But the mentor answered from the registry rows, and several rows understate what the trust-layer arc has since built: parts of the mentor's list are **already live for agents**. Designing the extensions without first reconciling against that live machinery would build duplicates of things that exist (violating PR15) or — worse — a second, divergent longitudinal record. This session produces the design-of-record: per-item dispositions (already-served / extend-existing / build-new / defer), the founder's elections on the real forks, and prompts for any elected build slices.

## Pre-conditions

1. The scoping session's records commit is pushed (the verbatim record + this prompt + the decision-log entry + the inbox RTF).
2. The trust-layer state is as the 2026-07-17 close left it: S11 flip REFUSED; S11a queued (extraction gate PRIOR); gen-2 harness credentials live; observation clock stopped, buffer frozen at 130.
3. No dependency on S11a or RA-1-F1 — this session is documents-only and can run before, between, or after them. **The founder sequences.**

## Part A — Open under the protocol

Read in order:
1. `/adopted/standing-protocol-cache.md` (~3 min)
2. `operations/agent-extension-2026-07/2026-07-17-mentor-json-components-review-verbatim.md` — **§1 in full, verbatim**
3. This prompt in full, including the grounded current-state table below
4. `/operations/decision-log.md` — last 2 entries
5. Task-dependent (Tier 2): ADR-012 (measurement-instrument reframe — the trajectory IS the product), ADR-013 §2/§8 (trust definition + honest-claims envelope), `adopted/rag-mentor-alt3/progression-delta.md` (D17) and `three-tier-intake.md` (D13) as the items reach them

Confirm at open: tier (`governance`, Standard); hold-point P0 0h; model selection N/A (no LLM calls; if the session elects a substrate consult per PR16, cite the AC1 row); status vocabulary; signals.

## Part B — The grounded current state (verified first-hand 2026-07-18; re-verify anchors before relying on them)

| # | Mentor item | What ALREADY exists for agents (anchors) | The genuine gap |
|---|---|---|---|
| 1 | **D17 → agents** | The M6/M7 trajectory feature (LIVE since 2026-06-14): `agent_assessment_history` rows per credential-bearing consult; `meta.trajectory` overlay surfaces `prior_instances`, `confidence_weighted` (the D17/AC-17 bands, adapted), `direction_of_travel`, `typical_proximity`, `single_snapshot\|windowed` (`website/src/lib/substrate/trajectory-overlay.ts:51-128`). D17's windowing (90d/30) is applied via `computeWindowSnapshot` reuse. Plus the S1 trust core: per-`(agent_id, virtue_domain)` longitudinal state with decay/latches/coverage (LIVE-MEASURE). | D17's **per-mechanism** delta signals (`progression-delta.md:157-204`): sub-species frequency delta (fading/recurring/new), false-judgement repetition, virtue-rating trend, domain-matched windowing (≥3 domain-matched preferred), profile-tension flags, and the `delta_signals` response block. The agent path carries only the composite. Registry row reads `agentReady: "na"` — stale. |
| 2 | **sage-iterate longitudinal** | CI-4 loop-closure (LIVE): `prior_feedback` input, `examination_open`, same-depth rule, `examination.{ref,depth_tier,prior_feedback_ref}` markers **inside the signed assessment**; the accreditation gate reads them (detect mode). This is submit→feedback→revise→re-examine for agents, with signed provenance. sage-iterate itself (`/api/score-iterate`, `deliberation_chains_v3`, `iteration_count`, journey "both") runs the V3 prose engine; A8 migration is its named blocker. | Neither surface **folds iteration history into a longitudinal profile** — CI-4 loops are per-session correction loops; chains are per-decision. The mentor's ask ("serve a longitudinal agent reasoning profile") = does chain/loop history feed D17-style deltas and/or the trust record? This is an **A8 design-review input**, exactly as the mentor frames it. |
| 3 | **sage-practice-reflect agent variant** | `/api/practice/reflect` IS agent-facing + LIVE (SR-13): Q1–Q6, Q5 consolidation deltas as "the primary profile update", `active_passion_profile`, `profile_update_confidence` (`website/src/lib/sage-reflect/engine.ts:152,247,254`); S9b screened examination out-of-band; reflect trust events (`reflect-completed-honest`, `reflect-screened-honest`, `self-screen-absent` — modulate-only). | **Cross-session recurring-pattern identification returned to the agent as delta signals** — the completion profile is per-session; nothing reads N prior reflect sessions and says "this sub-species is recurring." Note this gap is largely item 1's per-mechanism deltas viewed from the reflect surface — design them together, not twice. ⚠ Do not confuse with RA-1-F1, which concerns the HUMAN `/api/reflect`. |
| 4 | **R20b agent variant** | `detectFrameworkDependence` (pure, wired single-endpoint on `/api/mentor/private/reflect`, flag inert by decision): window 7d, minFrequency 25, triviality proxy = median input length ≤120, shallow-share ≥0.6 reflexive/habitual (`website/src/lib/r20b-dependence.ts:35-110`). The data an agent variant needs already accumulates: consult frequency (`loop_billing_events`), proximity + depth per consult (`agent_assessment_history`). CI-15's two-gate cadence (llms.txt:634) already documents the discipline. | Agent-specific detection + response. **Design constraint:** the harness MANDATES a Gate-1 consult at task adoption — the detector must key on consulting *beyond the two-gate cadence* (per-decision querying), never on designed cadence. Response channel is also open (a `meta` advisory? a trust-record note? coaching text is a human idiom). R20b activation itself remains post-launch by decision — the agent variant can be designed now, activation-gated. |
| 5 | **D13 agent trigger review** | The 7 engine-level codes are LIVE on agent consults (`layer2-mechanisms.ts:151-354` — Tier-1 force-clarification + the Live continuation fix; T2/T3 vocabularies present). The 12 surface-level codes are all bound to HUMAN tool routes (`three-tier-intake.md:69-88`). | **No agent-surface trigger class exists.** Candidates the review should weigh: injected-instruction patterns, delegation-pressure, and — the live convergence — a **bare-tool-payload trigger** (an action text that is a filesystem path/diff with no party, role, or purpose). Note: S11a found 129/130 captured verdicts had zero circles on file-write actions; a trigger that ASKS instead of emitting a starved extraction is a candidate answer to S11a's "starved vs mis-sited" question. The catalogue architecture already supports growth ("the engine-level catalogue is closed; the surface-level catalogue grows per consumer" — `three-tier-intake.md:495`). |

**Identity axis (cross-cutting; the mentor said "the per-install identifier from A10"):** the two live longitudinal stores key differently — trajectory on **`credential_ref`** (nullable `agent_id`, label-fallback to credential; `agent-assessment-history-store.ts:126-128,223-231`), trust state on **`(agent_id, virtue_domain)`** (`trust-core-store.ts:75-77,266`). A10's `install_id` is a third axis. An agent with rotated credentials fragments its trajectory but keeps its trust state (gen-1→gen-2 on `s9-loop@v1` is a live instance of exactly this); an agent-unbound consult credential accrues trajectory but no trust identity. **The canonical key for "the agent's practice trajectory" is a real design decision, not a detail.**

## Part C — Procedure

### Step 1 — Ground (read-only)
Re-verify the Part B anchors that the session's elections depend on (they were verified 2026-07-18; drift is possible). Read D17 §"Signal definition" and D13 §"Engine-level vs surface-level" in full.

### Step 2 — Surface the forks; founder elections (AskUserQuestion; do not pick silently)
1. **Per-item disposition** for each of the five: *already-served (record it) / extend-existing (name the surface) / build-new (justify vs PR15) / defer (PR7 — record the trigger to revisit)*. The AI recommends per item from Part B; the founder elects.
2. **Identity axis:** canonical key for the agent practice trajectory — `agent_id` (the trust core's axis; survives credential rotation) vs `credential_ref` (the trajectory's axis; operator-scoped) vs `install_id` (the mentor's literal words) — and whether a join/backfill is designed or deferred.
3. **Sequencing:** the mentor left Phase 2 vs Phase 3 to the founder; concretely — where does elected build work slot relative to **S11a** (queued, extraction gate prior) and **RA-1-F1** (queued, code-critical)? Note the D13 item 5 convergence with S11a's extraction question: if the founder runs S11a first, its extraction findings feed item 5; if this design runs first, item 5's trigger candidate feeds S11a.
4. **Form of record:** ADR (recommended if the identity-axis or a new longitudinal surface is elected — it is architecture) vs design doc.

### Step 3 — Author the design-of-record
Per-item dispositions with the reconciliation reasoning; the identity-axis decision; the honest-claims posture of any new surface (see Constraints); named build slices with tier + risk classification each.

### Step 4 — Name the follow-ups
Registry corrections (at minimum: the D17 row's `agentReady`, and any rows the dispositions change) — **as a named follow-up for a `registry` session per the sage-registry-update skill, not edited inline here.** Author a NEXT-SESSION-PROMPT for the first elected build slice.

### Step 5 — Records
Lean decision-log entry + lean session close per the cache templates.

## Constraints (binding on the design)

- **Honest-claims envelope (ADR-013 §8):** any trajectory/pattern surface is **evaluative, never predictive** — `direction_of_travel` describes the record, it does not forecast behaviour; no fact-checking claim; the extraction-trust ceiling is disclosed; **weights-tier claims BLOCKED throughout.**
- **Measurement-side only:** all five items are MEASURE-side. Nothing designed here binds; ENFORCE remains S11, explicitly refused on readiness. Nothing here re-opens that gate.
- **The S11a caution (mentor R13):** a longitudinal profile inherits its extraction quality — over the frozen observation window the at-action extractions were starved (129/130 zero circles on file writes). *"The narrowing produces a clean number on a starved input"* generalises: **a trajectory over starved extractions is a clean trend line over noise.** The design must state, per surface, what extraction classes feed it and how starvation is visible rather than laundered.
- **PR15:** existing machinery is the default; every build-new election records the Anthropic primitive + the internal surface considered and why neither serves.
- **PR16:** flag positioning impact (the trajectory-as-product strengthens the ADR-012 position) + dogfood relevance (high — the founder's loop is the first consumer; a substrate consult on kathekon-laden elections is on offer, founder elects).
- **Tier boundaries ahead:** `/api/reason` response-shape changes, trust-core event/state changes, and any new agent-facing surface are `code-critical` or `code-elevated` builds with their own sessions; R20b activation stays post-launch by standing decision; the human tools are untouched throughout.

## Anticipated session shape

| Phase | Estimate |
|---|---|
| Open + verbatim record + this prompt + Tier-2 reads | 20–30 min |
| Step 1 re-ground | 20–30 min |
| Step 2 elections | 20–30 min |
| Step 3 design-of-record | 60–90 min |
| Step 4 follow-ups + Step 5 records | 30–40 min |
| **Total** | **~2.5–3.5 h** |

## Rollback path

Documents only — `git revert` the session's records commit. No code, schema, flag, or credential is touched by this session.

## Forecast

Success = the five mentor items each carry an explicit, founder-elected disposition grounded in what actually exists; the identity-axis question is decided or explicitly deferred with a trigger; a design-of-record exists; and the first build slice (most likely the per-mechanism delta extension of the live trajectory machinery — the mentor's "D17 and sage-iterate are the natural starting point," realised as an extension rather than a duplicate) has an authored prompt. The mentor's sequencing question (Phase 2 vs Phase 3) gets its answer as a recorded election rather than an assumption.

End of prompt.
