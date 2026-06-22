# Gate-1 Full-Loop Harness — Correction Build Plan (channel-routed; value-first)

**Date:** 2026-06-22. **Stream:** founder. **Tier of this doc:** `governance` (design + plan; no production change).
**Why it exists:** the full-loop harness (H1–H4) was built and live-fired, but a bare/uninstructed run with the full hook set (`operations/benchmarks/sage-practice-v1/runs/2026-06-21/leg-d-v6-bare/2026-06-22-rerun/`) showed it **fires** the practice at every stage yet does not achieve its purpose — it over-fires on tool patterns, the load-bearing step doesn't bind, no trust credential is earned, and (on a stark scenario) it changes nothing. This plan corrects it.
**Provenance:** produced by a 13-agent workflow (5 root-cause → 3 competing designs → 1 synthesis → 4 adversarial skeptics). **All four skeptics returned holds=False (high)** against the first synthesis; their fixes are folded here (§3). Governs the build slices in §4; supersedes the relevant parts of the ADR-011 "Amendment 2026-06-21 — 3-hook architecture" (D-A…D-F) where they conflict.
**Hard constraint (unchanged):** corrections target the **mechanism** (how the hooks deliver the functions), never the Stoic methodology (dossier §6 boundary).

---

## §1 — Diagnosis: why the design missed its purpose

The harness **conflated "the hook FIRES the practice" with "the practice OPERATES and BINDS,"** and made that error at every stage by putting the load-bearing step on the wrong channel:

1. **The one in-loop value/provenance carrier — the H3 at-action consult — sits on the ADVISE channel** (emitted as `additionalContext`, `at-action-hook.mjs:75,344`). The **channel law** (live-proven, Slice-5b) says a capable agent correctly **discounts** advisory injection — so the consult never bound.
2. **Loop CLOSURE was defined as a function of the agent's next freely-chosen action** (`loop-closure.mjs:102-123`) — an event no hook can compel. Result in the run: loops opened + reopened ×3 but **0 closed / 3 abandoned** (`1f0f4176.loop.json`).
3. **Targeting fired on tool TYPE** (`hooks.json` matcher `Bash|Edit|Write|MultiEdit|NotebookEdit`; `describeAction`/`isGuardAction` key only on `tool_name` + a Bash regex). A `PreToolUse` hook's wire payload carries **no intent/stake** and is **blind to tool-less reasoning decisions** — so it consulted before `date`/`ls` (over-fire) and could not see the actual decisions.
4. **The install starved the binding paths.** `GATE1_PROVENANCE_ENABLED` was **unset** (default-false, `framing-core.mjs:89`) so `appendProvenance` never ran on the 4 consults (no `.provenance.jsonl`); `SAGE_GATE1_ACCRED_CREDENTIAL` / `SAGE_GATE1_AGENT_ID` were **absent** (SKILL.md documents them but `sage-on` did not *provision* them) → the close write returned `no-provenance` and wrote nothing. **This — not loop abandonment — is the dispositive cause of the missing credential.**
5. **The zero output-delta is a SEPARATE, non-defect fact.** The test scenario is stark/one-sided (the decisive EU-residency fact is stated in the brief in plain prose), so there is **no counterfactual any mechanism could tip.** Value was measured where it structurally cannot appear.

---

## §2 — The corrective design: "Channel-Routed Full-Loop Harness"

Apply the channel law **per stage**: nothing load-bearing on ADVISE; the action-intrinsic on ENFORCE; the unforgeable on INSTRUMENT; the rest honestly ADVISE.

| Stage (dossier) | Channel | Mechanism | Binds? |
|---|---|---|---|
| **Gate-1 frame** (H1/H2) | ADVISE | `UserPromptSubmit` + `PreToolUse Task\|Agent` inject the frame; its **signed envelope** becomes the first provenance element | NO (frame text) / YES (the signed envelope, on INSTRUMENT) |
| **Gate-2 WHEN-to-consult** (B10 stake screen) | ADVISE | agent-**declared** surface (a `sage_examine` MCP tool/sentinel the agent emits when its own 3-sub-question screen fires) + a denylist-filtered auto path as the floor | NO — standing instruction (~68%); **the only path to a tool-less reasoning decision** |
| **At-action GUARD** (B9, the PRIMARY "fire on a real decision") | **ENFORCE** | `PreToolUse` `permissionDecision:"deny"` on the **narrow irreversible-action allowlist** + **guard-on-retry**; irreversibility IS in the command text, over-block is the safe error | **YES** — out-of-band deny binds a resistant agent (Slice-5b proven) |
| **At-action SCORE/ITERATE consult** (4.2/4.3, provenance) | **INSTRUMENT** | on a non-housekeeping consequential action (or a declared `sage_examine`): `fetchFrame(assessment_first)` → **append the SIGNED assessment** (the sole R18f provenance source); the redirection TEXT stays ADVISE | PARTIAL — the fetch+append binds; the injected redirection does not |
| **Loop closure** (B6) | **INSTRUMENT + ENFORCE-at-write** | each consult writes `examination.{ref,depth_tier,prior_feedback_ref}` **inside the signed payload**; the LIVE write-boundary gate `analyseLoopClosure` (`loop-closure-gate.ts:202-260`) **computes** closure from the signed chain (agent-independent, unforgeable); the hook's `loop-closure.mjs` becomes **log-only** | YES for the credential's *honest record* of closure; **reversible redirections stay honestly UNCLOSED** unless the agent re-consults (see §3.2) — only **guard-on-retry** forces re-examination, and only on the irreversible set |
| **Reflect at close** (B7) | **INSTRUMENT** | `Stop` `decision:block` forces ONE in-conversation turn (pure invitation, no endpoint); `persistReflection` POSTs the **verbatim** `last_assistant_message` out-of-band (`agent_stated` or honest "not performed"), DARK until §S7 | PARTIAL — the turn is forced; the content is the agent's (may decline); the verbatim capture binds |
| **Accreditation write** (4.6, the credential) | **INSTRUMENT** | `Stop` → `writeAccreditation` POSTs the **accumulated signed chain** out-of-band on a **non-marker** `SAGE_GATE1_ACCRED_CREDENTIAL` bound to a K1-canonical `SAGE_GATE1_AGENT_ID`; server verifies Ed25519 + clears R18f (fabrication → 403); DETECT-mode closure annotated honestly | **YES** — out-of-band write; the credential cannot be self-issued |
| **VALUE measurement** | (off-hook) | not a hook stage — measured on a **borderline** benchmark, 3-arm (§S6) | N/A |

**Targeting model, in one line:** GUARD = action-intrinsic irreversible pattern (correct, binds); CONSULT = agent-declared stake (correct, advisory, the only reasoning-decision path); housekeeping = denylist-filtered (over-fire gone). **Binding model:** nothing load-bearing on ADVISE; closure + credential computed/written out-of-band; the public claim narrowed to exactly what bound. **Materialization model:** default capture ON when H3/H4 installed; `sage-on` provisions the write path; carry the real signed chain (not a fabricated grade).

---

## §3 — The four adversarial corrections (folded; each skeptic returned holds=False/high)

**§3.1 Targeting — the auto path is blind to the decisions that matter, and the denylist has a destructive hole.**
- The value-bearing acts in the motivating run (the do-not-proceed recommendation; the $40k arithmetic catch) were **pure-reasoning decisions carried by NO tool** — invisible to GUARD, CONSULT-auto, and the denylist alike. **Accept this as structural:** the auto path catches only *tool-manifested* decisions; the **`sage_examine` declared surface (~68%) is the ONLY path to a tool-less reasoning decision** — state this honestly; do not claim the auto path covers Gate 2.
- The housekeeping denylist must be **"read-only verb AND NOT destructive"**, not a verb-prefix match: `find … -delete`, `grep … | xargs rm`, `cmd > prod.db` start with read-only verbs but ARE destructive. Suppress only if a read-only verb matches AND none of a destructive-token set is present (`rm`, `-delete`, `-exec`, `xargs`, `dd`, `:>`, `>`/`>>` to a non-`/dev/null` target). **Broaden the guard allowlist** to the forms it misses (`find … -delete`, `xargs\s+rm`, `git push.*--force`, redirection to a real path). Battery legs both ways.

**§3.2 Binding — do NOT claim reversible loops close.** Closure has a closing element in the signed chain **only if the agent re-consults corrected reasoning on the discounted ADVISE channel** — so reversible redirections **stay honestly unclosed in DETECT mode**; the credential reads "unclosed," which is the truth, not "loops close." **Promote guard-on-retry to the only binding force-re-examination,** scoped to the irreversible allowlist. The per-stage "binds: YES at the write boundary" means the *computation* is unforgeable, **not** that loops close for a bare agent.

**§3.3 Honesty — the server does NOT compute the grade on a seed write; keep a truthful seed.** `seedAccreditation` (`sage-assent-accreditation-writer.ts:289-320`) persists `senecan_grade`/`actions_evaluated`/`typical_proximity`/`dimension_levels` **verbatim** from the submitted record (only `coverage_status`/`monitored_since`/`credential_basis`/`examination_mode` are server-composed). So "let the server compute the grade" is **false** and submitting a real-looking grade would be a **fabrication**. **Correction:** keep a conservative truthful seed (`senecan_grade: pre_progress`, `actions_evaluated: 0`, `typical_proximity: reflexive`, `dimension_levels: emerging`) — `actions_evaluated:0` truthfully states no windowed evaluation occurred — and put the **real accumulated signed chain in `provenance.signed_assessments`** (the R18f-verified artifact). The run's failure was the empty chain (capture OFF), not the seed grade.

**§3.4 Value — prove it BEFORE building the machine, and sweep CAPABILITY as a primary axis.** The entire decision-value case rests on a scenario class never run. **Re-sequence: S6 is a GATE, run first.** But the gate is **not** "does Opus-max show a delta on a borderline case" — every prior run was **Opus 4.8 at max reasoning, the HARDEST case for harness value** (a frontier model catches the planted issues and resists pressure unaided, leaving nothing to add). **Decision-value is plausibly INVERSE to base capability**, so S6 must sweep **capability × scenario**, not just borderline-on-Opus:
- the practice may add value on **more scenarios** for **weaker/cheaper/lower-effort** agents (Sonnet, Haiku, Opus-low-effort) — including **stark** scenarios a weaker model would fail;
- the **channel law may itself be capability-dependent** — a weaker model may **reason FROM** the advisory frame that Opus discounts, so the "advisory doesn't bind" finding (and the whole move-off-ADVISE correction) may be partly an Opus artifact, and the advisory-record arm × capability is a key read;
- the **two value classes have different capability profiles**: decision-sharpening **rises as capability falls**; the verifiable **trust record is capability-INDEPENDENT** (every agent earns it).

**Decision rule (refined):** do not kill the machine if Opus shows no delta — **characterize the region of the capability × scenario space where value appears** (likely weaker-models × more-scenarios) and target the product there; the trust record stands regardless. The honest public claim names that region — *strongest for the long tail of agents that need it*, plus a trust record for all — never "it sharpens a frontier model's decisions."

---

## §4 — Build slices (value-first re-sequenced)

**Gate phase (build the minimum to materialize the trust record + measure value, then decide):**

- **S1 — Targeting fix (`code-standard`; repo-only).** In `at-action-hook.mjs`, add the **denylist-AND-NOT-destructive** housekeeping filter between `describeAction` and the guard/consult branch; **drop Bash from the SCORE trigger** (keep Write/Edit/MultiEdit + the guard list); **broaden the guard irreversible allowlist** (§3.1). Battery: consult does-NOT-fire on `date`/`ls`/`wc`; DOES fire on a Write/Edit and on a declared decision; guard DOES fire on `find … -delete` / `xargs rm` / `git push --force`. H1/H2 byte-identical.
- **S2 — Materialization / provisioning (`code-elevated`).** Default `captureProvenance` ON when H3/H4 run (keep H1/H2 default-off for the dark dogfood) — **or** derive it from `ACCRED-credential + agent_id` presence (the more conservative form; founder election §5). Make **`sage-on` WRITE** into `settings.local.json` env: `GATE1_PROVENANCE_ENABLED=true`, a **non-marker** `SAGE_GATE1_ACCRED_CREDENTIAL` (`accreditation_write`), a **K1-canonical** `SAGE_GATE1_AGENT_ID`; add an install-validation echo of which write-path inputs are present + the **loud three-reason honest-skip** note (`no-provenance` / `no-accred-credential` / `no-agent-id`). Keep the dual marker-refusal guards.
- **S3 — Honest accreditation (`code-elevated`).** In `close-hook.mjs` `writeAccreditation`: keep the **conservative truthful seed** (§3.3); carry the **real accumulated `signed_assessments`**; surface the `analyseLoopClosure` verdict honestly (DETECT). Verify on TEST that the public GET reads a **real verifiable credential** earned from genuine examinations.
- **S6 — Off-hook VALUE benchmark: a capability × scenario × arm MATRIX (the GATE; `governance`/test-design, then founder-walked runs).** Author the spec + runbook:
  - **Capability axis (PRIMARY):** {Opus 4.8 max, Opus 4.8 low-effort, Sonnet 4.6, Haiku 4.5} — all selectable in Claude Code, so the sweep is feasible. (A non-Claude/older agent is future work.) The low-effort arm isolates *reasoning budget* from *model*.
  - **Scenario axis:** {**stark** (the existing Meridian brief — where Opus needs no help but a weaker model may), **borderline** (a new class: no single dispositive fact; the value lever is a **pressure-induced misweighting**, not a checkable error)}. 2–3 of each for signal.
  - **Arm axis:** {**bare** (no hooks), **advisory-record** (H1 frame only), **binding-capture** (full hooks + capture ON)}.
  - **Metrics per cell:** decision-direction (correct/defensible call?); catch-rate (planted issues surfaced?); misweighting-quarantine (pressure resisted?); blind-rated justification quality; trust-record materialisation (signed chain + credential — the capability-independent check); cost + latency.
  - **The key reads:** (a) does value **rise as capability falls**? (b) on weaker models, does value appear on **stark** scenarios too? (c) **does the advisory-record arm beat bare on weaker models** (the channel law is capability-dependent → the frame binds for the long tail)? (d) is the trust record **flat** across capability? (e) cost/value per tier.
  - **Controls:** vary one axis at a time; blind the justification rater to the arm; same scenario/prompt across arms; factor that consult overhead is proportionally larger (and cheaper) on weaker tiers.
  - **Decision rule:** **characterise WHERE value appears** in the matrix — do NOT gate the whole machine on Opus alone. Value anywhere meaningful (likely weaker-models × more-scenarios, and/or the advisory frame binding on weaker models) → proceed to the ceiling slices and **target the product at that region**. The trust record materialises regardless. Narrow the public claim to the region found; never claim frontier-decision-sharpening if the matrix doesn't show it.

**Ceiling phase (build only if S6 warrants):**

- **S4 — Loop-closure re-channel (`code-elevated`).** Demote `loop-closure.mjs` to **log-only**; ensure `examination.{ref,depth_tier,prior_feedback_ref}` markers ride **inside** the signed payload so the live gate computes closure; add **guard-on-retry** (a redirected **irreversible** action re-routes through deny until a re-consult at ≥depth clears). **State honestly** that reversible loops stay unclosed in DETECT (§3.2). Never deny-until-you-call on the broad set.
- **S5 — Agent-declared decision surface (`code-elevated`).** Ship a lightweight `sage_examine` MCP tool / recognized sentinel + a standing instruction/skill carrying B10's three sub-questions; `PreToolUse` matcher fires the consult on it. The denylist-filtered auto path stays the floor. Document ~68% adherence; the **only** path to tool-less reasoning decisions.

**Gated/standing (carried, `code-critical`):**

- **S7 — Standing persist activation.** Wire reflect-row erasure into `/api/user/delete` + `/api/credential/erase` + a retention cron (the carried named follow-up) **first**, then consider `SAGE_GATE1_REFLECT_PERSIST_ENABLED` for a standing install. Until then `persistReflection` stays DARK.

---

## §5 — Open decisions (founder elections)
1. **`sage_examine` declared surface PRIMARY** vs the denylist-auto path primary. *Rec: ship both — declared primary, filtered-auto floor.*
2. **Default `captureProvenance` ON in H3/H4 context** vs **derive from ACCRED-credential+agent_id presence**. *Rec: derive — no provenance egress until the operator has provisioned the write path; keeps H1/H2 byte-identical either way.*
3. **Guard-on-retry now or later.** Only honest force-re-examination; over-block-adjacent on the narrow set. *Rec: with S4, scoped to the irreversible allowlist.*
4. **DETECT mode permanent** vs reject-mode (422) escalation once live chains demonstrably close. *Rec: DETECT until chains close (reject-before-closure refuses every redirection-bearing write).*
5. **Fast-model intent classifier** as a degraded auto fallback. *Rec: defer — still can't read true intent; cost/latency.*
6. **S7 ordering** — reflect-row erasure is the hard prerequisite for any standing persist; its own founder-walked Critical session before activation.

## §6 — Rejected alternatives (standing do-not-build)
- **Deny-until-you-call on the broad consequential set** (hold work hostage until the agent consults) → channel-law violation: a capable agent reads coercion + refuses harder; over-blocks legitimate work. Binding belongs only on the narrow irreversible set.
- **Fast-model intent classifier as the PRIMARY trigger** → still infers from action bytes, not intent; blind to tool-less decisions; cost/latency. Default-off fallback only.
- **Keep computing closed/abandoned from the agent's next tool action in the hook** → structurally unreachable (closure-by-cooperation on the discounted channel). Compute it at the write boundary.
- **Drive interactive Q1–Q6 via repeated `decision:block`** → a Stop hook can force turns but can't run the six-question examination, the FD defences, or RS routing (that's the server `/api/practice/reflect` state machine). Keep the honest single-turn invitation + verbatim capture; narrow the claim.
- **Submit a fixed degraded seed grade so a credential always materialises** → bypasses hysteresis + misrepresents the grade. Carry only real signed assessments; let the server compute coverage_status.
- **Patch the harness to change the stark-scenario memo** → no counterfactual to tip; would be theatre/over-block. Measure value off-hook on a borderline scenario; zero delta on a stark case is correct.

## §7 — The honest value position (carry into the public claim)
- **Binds (claimable):** the frame is injected pre-decision; irreversible actions are guarded (can block); a reflection turn fires & is observed; the credential rests on genuinely-accumulated **signed** assessments.
- **Honest-partial (claim with the caveat):** Gate-2 consults fire on a declared surface (~68%, cooperative) + a tool-manifested auto floor; reversible loops close only if the agent re-consults (DETECT reads unclosed honestly); reflect is one forced turn + verbatim capture, **not** a sincere Q1–Q6 discipline.
- **Structurally impossible (never claim):** the hook makes the agent *reason from* the frame; it sees tool-less reasoning decisions on the auto path; it manufactures decision-value on a stark scenario.
- **Capability profile (the honest value story; S6 to confirm):** decision-sharpening **rises as base capability falls** — strongest for the long tail of weaker / cheaper / lower-effort / constrained agents that actually miss catches and yield to pressure; near-zero for a frontier model at max reasoning (which needs no help). The **verifiable trust record is capability-independent** (every agent earns it). So the claim is *strongest for the agents that need it, plus a trust record for all* — never *it sharpens a frontier model's decisions*. Watch the **channel-law-capability read**: if the advisory frame *binds* on weaker models, the advisory channel is a genuine value lever for the long tail (and the move-off-ADVISE correction is partly Opus-specific). If S6 shows decision-value **nowhere** — even on weaker models × borderline cases — the honest agent-substrate value is the trust record alone; say exactly that.

*End. The first build session executes the Gate phase (S1+S2+S3 dark + battery, then author + run S6 as the gate); S4/S5 are conditional on S6; S7 is the carried Critical prerequisite. The 0h launch call remains the founder's.*
