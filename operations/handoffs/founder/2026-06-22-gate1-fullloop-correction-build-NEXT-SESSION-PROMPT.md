# Next-Session Prompt — Gate-1 Full-Loop Harness: the channel-routed correction (value-first gate phase)

**For the founder. Paste as the first message of a fresh session.**

**Stream:** founder.
**Tier:** `code-elevated` for **this** session — the gate phase is repo-only/dark hook fixes + a `sage-on` provisioning change + a benchmark spec; no production call, no live-fire. *(The S6 value-benchmark RUN is founder-walked; the live-fire activation of the fixes and S7 are carried `code-critical`.)*
**Governing frame:** /adopted/standing-protocol-cache.md.
**Governing design:** `operations/p1-rebuild-2026-06/gate1-fullloop-correction-build-plan.md` — **read it in full; this prompt executes its Gate phase (S1 + S2 + S3 + author S6).** It supersedes the conflicting parts of the ADR-011 "Amendment 2026-06-21 — 3-hook architecture" (D-A…D-F).
**Predecessor finding:** `operations/benchmarks/sage-practice-v1/runs/2026-06-21/leg-d-v6-bare/2026-06-22-rerun/{invocation-footprint.md,assessment.md}` — the full-hook bare run that fired every stage but bound nothing and earned no credential.
**Diagnosis source:** a 13-agent root-cause→design→verify workflow; all four adversarial skeptics returned holds=False (high) on the first synthesis; their fixes are folded into the build plan §3.

## Why this session matters

The harness **fires** the practice at every loop stage but does not achieve its purpose: it targets on tool patterns (consulted before `date`), puts the load-bearing consult on the ADVISE channel (which a capable agent discounts → loops never close), and the install starved the binding paths (`GATE1_PROVENANCE_ENABLED` unset, no ACCRED credential/agent_id → the accreditation wrote nothing). And the "no value" result was measured on a **stark** scenario where no mechanism could add value. The correction (build-plan §2) re-routes each stage onto the channel that can carry it — **but the adversarial pass insists the value premise be PROVEN before the machine is built (§3.4).** So this session does the **Gate phase**: the cheap targeting fix, the provisioning + honest-accreditation fixes that materialise the trust record, and the **borderline value benchmark that gates everything else.**

## The correction in one paragraph
Nothing load-bearing stays on ADVISE. The **GUARD** (irreversible-action allowlist, can deny) becomes the primary "fire on a real decision" mechanism — the only place a tool-pattern is the right observable, and it binds. The **consult** stops firing on tool TYPE: housekeeping is denylist-filtered (over-fire gone), and Gate 2 moves to an agent-**declared** surface (the only path to a tool-less reasoning decision — honest ~68%). Provenance is **captured** out-of-band on every consult and the **accreditation is written** out-of-band on a non-marker credential → the trust record materialises. Loop closure is **computed at the live write boundary** (honest: reversible loops stay unclosed unless re-consulted). The public claim is narrowed to exactly what binds.

## Founder elections to make at open (build-plan §5)
1. **`sage_examine` declared surface PRIMARY + denylist-auto floor** (rec: ship both) — affects S5 scope (S5 is ceiling-phase, but decide the intent now).
2. **Default `captureProvenance` ON in H3/H4 context** vs **derive from ACCRED-credential+agent_id presence** (rec: derive — no egress until provisioned).
3. **Guard-on-retry now (with S4) or later** (rec: with S4, irreversible set only).

## Pre-conditions
1. H1–H4 built + the hooks intact; gates currently green. The standing dogfood marker + the `sage-on`/`sage-off` skills exist. This session does **not** install hooks into a live loop or call prod.
2. Work is **repo-only** under `harness/` + the `sage-on` skill + the benchmark spec + the decision log + the close. No mint, no prod write, no live-fire.
3. 0h held.

## Part A — Open under the protocol
Read in order:
1. /adopted/standing-protocol-cache.md (~3 min).
2. **`operations/p1-rebuild-2026-06/gate1-fullloop-correction-build-plan.md`** — in full (the diagnosis §1, the per-stage design §2, the four corrections §3, the slices §4, elections §5, rejected §6, the honest value position §7).
3. `adopted/adr/2026-06-20-pre-decision-harness-arc2.md` — the 3-hook amendment + the Slice-5b/5c amendments (context for what this corrects).
4. The dossier `operations/p1-rebuild-2026-06/sage-practice-grounding-dossier.md` §4 + §6 rows **B6 / B9 / B10**.
5. The hook code: `harness/gate1-pre-decision/claude-code/hooks/at-action-hook.mjs`, `close-hook.mjs`, `lib/framing-core.mjs` (esp. `captureProvenance` ~:89 + `DEFAULT_IRREVERSIBLE_PATTERNS` ~:146-169), `lib/loop-closure.mjs`, `lib/session-state.mjs`, `hooks.json`; the `sage-on` skill (`.claude/skills/sage-on/SKILL.md`).
6. The live write-boundary gate `website/src/app/api/accreditation/[agent_id]/loop-closure-gate.ts` (`analyseLoopClosure` :202-260) and the **seed writer `website/src/lib/substrate/sage-assent-accreditation-writer.ts` (`seedAccreditation` :289-320)** — Step 0 re-confirms its verbatim-store behaviour.
7. Memory `gate1-harness-channel-law`.

Confirm at open: tier; the three elections above; status vocab; 0h held.

## Part B — Procedure (Gate phase)

### Step 0 — PR11: re-confirm the three load-bearing facts first-hand (don't trust the plan)
- **Seed-write stores the grade VERBATIM** (build-plan §3.3): confirm `seedAccreditation` persists `senecan_grade`/`actions_evaluated`/`dimension_levels` from the submitted record, and only `coverage_status`/`monitored_since`/`credential_basis`/`examination_mode` are server-composed. (If false, re-open §3.3.)
- **The provenance append path**: confirm `appendProvenance` runs only when `captureProvenance` AND a signed assessment is returned, and that nothing wrote `.provenance.jsonl` in the failing run.
- **The guard deny contract**: confirm `PreToolUse permissionDecision:"deny"` is the binding primitive + the current irreversible allowlist.
Record findings in the close.

### Step 1 — S1 targeting fix (`code-standard`, repo-only)
In `at-action-hook.mjs`: add a **denylist-AND-NOT-destructive** housekeeping filter (suppress the auto-consult only if a read-only verb matches AND no destructive token — `rm`/`-delete`/`-exec`/`xargs`/`dd`/`:>`/redirection to a non-`/dev/null` target — is present); **drop Bash from the SCORE trigger** (keep Write/Edit/MultiEdit + the guard list); **broaden the guard irreversible allowlist** (`find … -delete`, `xargs\s+rm`, `git push.*--force`, redirection to a real path). Battery legs both ways: consult does-NOT-fire on `date`/`ls`/`wc`; guard DOES fire on `find … -delete`/`xargs rm`/`git push --force`; consult DOES fire on a Write/Edit.

### Step 2 — S2 materialization / provisioning (`code-elevated`, repo-only)
`captureProvenance` ON when H3/H4 run (or derive from ACCRED-credential+agent_id presence per election #2; keep H1/H2 default-off byte-identity). Make **`sage-on` WRITE** into `settings.local.json` env: `GATE1_PROVENANCE_ENABLED=true`, a **non-marker** `SAGE_GATE1_ACCRED_CREDENTIAL`, a **K1-canonical** `SAGE_GATE1_AGENT_ID`; add an install-validation echo of which write-path inputs are present + the **loud three-reason honest-skip** (`no-provenance`/`no-accred-credential`/`no-agent-id`). Keep the dual marker-refusal guards (never the standing marker credential).

### Step 3 — S3 honest accreditation (`code-elevated`, repo-only)
In `close-hook.mjs` `writeAccreditation`: keep the **conservative truthful seed** (`pre_progress`/`actions_evaluated:0`/`reflexive`/`emerging`); carry the **real accumulated `signed_assessments`** as the R18f provenance; surface the `analyseLoopClosure` verdict honestly (DETECT). **Do not** claim the server computes the grade.

### Step 4 — Gates + register dark
Extend `test/negative-battery.mjs` + `test/logic-harness.mjs` with S1/S2/S3 legs; run both green; `tsc`/`node` clean. No install into a live loop.

### Step 5 — Author S6, the value-gate benchmark: a CAPABILITY × scenario × arm matrix (`governance`/test-design, repo-only)
Write the spec + runbook for a **matrix**, not a single Opus run (build-plan §S6 — capability is the PRIMARY axis, because every prior run was Opus-4.8-max, the hardest case for harness value):
- **Capability (primary):** {Opus 4.8 max, Opus 4.8 low-effort, Sonnet 4.6, Haiku 4.5} (all selectable in Claude Code).
- **Scenario:** {stark (the existing Meridian brief), borderline (a new class — no single dispositive fact; the value lever is a **pressure-induced misweighting**, not a checkable error)}.
- **Arm:** {bare / advisory-record (H1 frame only) / binding-capture (full hooks + capture ON)}.
- **Metrics per cell:** decision-direction, catch-rate, misweighting-quarantine, blind-rated justification quality, trust-record materialisation (capability-independent), cost/latency.
- **Key reads:** does value RISE as capability falls? does it appear on STARK scenarios for weaker models? **does advisory-record beat bare on weaker models** (the channel law may be capability-dependent — the frame binds for the long tail)? is the trust record flat across capability?
- **Controls:** one axis at a time; blind the justification rater; same prompt across arms.

Put it under `operations/benchmarks/sage-practice-v1/`. **Decision rule in the spec:** **characterise WHERE value appears in the matrix — do NOT gate the machine on Opus alone.** Value anywhere meaningful (likely weaker-models × more-scenarios, and/or the advisory frame binding on weaker models) → proceed to the ceiling slices and **target the product at that region**; the trust record materialises regardless. Narrow the public claim to the region found; if decision-value appears nowhere even on weaker × borderline cases, the honest value is the trust record alone.

### Step 6 — Decision-log + close
Record S1–S3 built dark + battery-green; S6 authored; the elections; the carried steps. **Carried:**
- **The S6 GATE RUN (founder-walked):** run the **capability × scenario × arm matrix** (Opus-max / Opus-low / Sonnet / Haiku × stark / borderline × bare / advisory / binding-capture) with the fixes installed (`sage-on` now provisions the write path) on a non-marker `@`-class credential; **characterise WHERE value appears** (do not gate on Opus alone). *This is the deciding step — it gates the ceiling phase and sets the honest public claim.*
- **Ceiling phase (conditional on S6):** S4 (loop-closure re-channel + guard-on-retry) + S5 (`sage_examine` declared surface).
- **S7 (`code-critical`, carried):** wire reflect-row erasure into `/api/user/delete` + `/api/credential/erase` + a retention cron, **before** any standing `SAGE_GATE1_REFLECT_PERSIST_ENABLED`.

## Risk classification
**This session: `code-elevated`** — repo-only hook + skill + benchmark-spec changes; no prod call, no live-fire; reversible by `git revert`. **Carried `code-critical`:** the S6 gate run + the live-fire activation of S1–S4 (out-of-band egress + a real accreditation write + tool-blocking in a live loop) + S7 (R17 erasure prerequisite) — all founder-walked, PR17.

## Rollback
`git revert` the gate-phase commit (hook fixes + `sage-on` provisioning + the benchmark spec). Nothing installed/live; the standing dogfood marker + H1/H2 untouched. `sage-off` removes any hooks if installed for testing.

## Forecast
Ends with the over-fire fixed, the trust record actually materialising (provenance captured → a real verifiable credential written), the accreditation honest (truthful seed + real signed chain), and the **capability × scenario value benchmark authored and ready to run as the gate.** The gate run then answers the question this whole arc has been circling — but on the **right axis**: not "does it help Opus-max" (the hardest case, where it can't), but **where in the capability × scenario space does the fully-bound practice add value** — and **does the advisory frame bind on weaker models** even where it doesn't on Opus. The expectation is value rising as capability falls, with the verifiable trust record flat across all tiers. Either way the result is real; the plan refuses to claim frontier-decision-sharpening without proof, and refuses to dismiss the practice on an Opus-only test. The 0h call remains the founder's.

End of prompt.
