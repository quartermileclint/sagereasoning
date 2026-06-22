# Next-Session Prompt — Gate-1 S6 Value-Gate Run, Phase 1 (provision + author/freeze the scenario set + the enforced-channel smoke)

**For the founder. Paste as the first message of a fresh session.**

**Stream:** founder.
**Tier:** **`code-critical`** for this session — it includes the founder-walked write-path **provisioning** (mint a non-marker `accreditation_write` credential + `sage-on` writes the env + a per-tier **enforced-channel smoke** that installs live hooks on throwaway credentials). The scenario **authoring** sub-part is repo-only, but the highest-risk category (Critical, AC7 + PR6, PR17) sets the form for the whole session.
**Governing frame:** /adopted/standing-protocol-cache.md.
**Governing runbook:** `operations/benchmarks/sage-practice-v1/2026-06-22-S6-value-gate-benchmark-spec.md` — **read it in full; this session executes its §10 run-prep checklist steps 1–4** (push-confirm, author+freeze the scenario families, provision the write path, the per-tier smoke), then positions for the screening half-matrix (§3.4).
**Governing design:** `operations/p1-rebuild-2026-06/gate1-fullloop-correction-build-plan.md` (§S6 = the gate; §3.4/§7 = the honest value position; §S4/S5/S7 = carried, conditional on this gate).
**Predecessor close:** `operations/handoffs/founder/2026-06-22-gate1-fullloop-correction-gate-phase-CLOSE.md`.
**Predecessor decision-log entry:** `D-SAGE-PRACTICE-GATE1-FULLLOOP-CORRECTION-GATE-PHASE-S1S3-BUILT-S6-AUTHORED`.

## Why this session matters

The Gate phase (S1–S3) is built dark + battery-green and the S6 benchmark is authored. **S6 is THE gate** — it answers the arc's question on the right axis (where in the capability × scenario space does the fully-bound practice add value — not "does it help Opus-max", the hardest case) and sets the honest public claim. But the gate run can't start until two things are true that are NOT yet true: **(1) the scenario set is authored + frozen** (the matrix has nothing to run without it), and **(2) the trust-record write path is provisioned** (a minted non-marker accred credential + `sage-on` env, so a binding-capture cell actually materialises a credential instead of honest-no-writing). This session does both, plus the per-tier enforced-channel smoke that confirms the binding arm binds on each tier before spending the matrix on it. **The matrix runs themselves (§10 steps 5–7) are the immediately-following founder-walked work — multi-session — not this one.**

## Carried state — what is/ isn't done (read carefully)

- The S1–S3 build + the S6 spec are **committed + pushed** (gate-phase commit `c105a17`). The new `sage-on` provisioning behaviour + the derive code are live in the working tree — `/sage-on` now provisions + validates the write path.
- The starvation root cause (`GATE1_PROVENANCE_ENABLED` unset) is **structurally corrected** — capture now DERIVES from the write path (no separate flag to forget); `sage-on` provisions + loudly validates it. But **no live install is provisioned yet** (the dogfood `settings.local.json` still has only `SAGE_GATE1_CREDENTIAL`/`GATE1_ENDPOINT`/`GATE1_STATE_DIR`/`GATE1_DEPTH`, no hooks). Provisioning is Step 3 below.
- **No accred credential has been minted.** That is a prod-mint step (Step 3). The standing dogfood marker credential must **NEVER** be reused for the accred slot (the hook auto-refuses it; `sage-on`'s echo flags `MISCONFIGURED`).
- 0h held.

## Part A — Open under the protocol
Read in order:
1. /adopted/standing-protocol-cache.md (~3 min) — confirm tier, model selection, risk class, signals, the Critical Change Protocol (0c-ii) pointer.
2. The predecessor close (above) + the decision-log entry.
3. **`operations/benchmarks/sage-practice-v1/2026-06-22-S6-value-gate-benchmark-spec.md`** — in full (the runbook; §2 the scenario classes + freeze guards, §10 the checklist).
4. `operations/benchmarks/sage-practice-v1/scenario/brief.md` + `answer-key.SEALED.md` — the existing **stark** template (Meridian) the new scenarios mirror.
5. The hook code you'll provision: `.claude/skills/sage-on/SKILL.md` (the new provisioning + validation echo); `harness/gate1-pre-decision/claude-code/hooks/hooks.json` (H1–H4); `harness/gate1-pre-decision/claude-code/hooks/close-hook.mjs` `writeAccreditation` (the marker-refusal guards).
6. Memories to recall (verify each still applies before relying on it): `prod-mint-needs-prod-admin-jwt`, `mint-cli-env-file-export-leak`, `upc-mint-vs-accreditation-agent-id`, `test-loop-dirs-under-claude-work-projects`, `api-key-1-per-day-limit-masks-as-401`, `claude-code-desktop-app-hook-env`, `gate1-harness-channel-law`.

Confirm at open: tier (`code-critical`); 0h held; status vocab; that you have the prod admin JWT (`MINT_CLI_ADMIN_JWT` from a logged-in www.sagereasoning.com session) for the Step-3 mint.

## Part B — Procedure (Phase 1 = spec §10 steps 1–4)

### Step 0 — Base sanity check (the gate-phase commit `c105a17` is already pushed)
The derive code + the new `sage-on` skill are live. Re-run the gates green as a sanity check before provisioning:
```
node harness/gate1-pre-decision/test/logic-harness.mjs    | grep -E "passed, [0-9]+ failed"   # expect 61/0
node harness/gate1-pre-decision/test/negative-battery.mjs  | grep -E "RELEASE GATE|^[0-9]+ passed"  # expect 166/0 PASS
```

### Step 1 — Author + freeze the scenario set (spec §2 + §10 step 1; repo-only)
Author the families the matrix needs (a workflow is a good fit here — parallel scenario designers + a dispositive-fact-sweep critic, the way S6 itself was designed):
- **Borderline family:** ≥3 briefs (graded pressure levers; authority/competence as the *counterable* primary lever per §2.2), **≥1 reserved as a held-out calibration sibling** (NEVER scored into the matrix — §2.3, the anti-train-on-test fix). Start from the two sketches in spec §2.5 (Halcyon = keep-with-guard; Northwind = **reject-and-rewrite within-band** per the §2.5 note).
- **Stark-2:** one new stark brief (Meridian-shaped: 1–2 dispositive checkable facts).
- **Agentic ×1 (mandatory, §1.2):** a tool-using scenario with ≥1 genuinely irreversible action available — the only task shape that gives the binding arm's guard + provenance accrual real surface area.
- Each ships a **sealed key** + a **sealed, pre-registered dispositive-fact sweep** (§2.4 guard 1: "here is every element I tried to make dispositive, and why it isn't"), under `operations/benchmarks/sage-practice-v1/scenario/` (e.g. `borderline-1/`, `agentic-1/`).
- **Freeze gates (§2.4):** the dispositive-fact sweep (repo); then the bare-Opus closeness + weak-tier-headroom pre-tests on the **calibration siblings** (these need real model runs — founder-walked; freeze only on pass). Calibration briefs are tuned here and never appear in the matrix.

### Step 2 — Choose the K1-canonical agent_id(s) (BEFORE the mint)
Pick `SAGE_GATE1_AGENT_ID` value(s) in canonical `namespace:name@version` form (e.g. `sagereasoning:s6-bench@v1`) — the accreditation write boundary rejects a free-form id (memory `upc-mint-vs-accreditation-agent-id`). Per §6 the binding-capture arm wants a **fresh agent_id + credential per (capability × scenario) cell**; for Phase 1 mint at least one for the smoke.

### Step 3 — Provision the write path (founder-walked Critical; spec §10 step 3)
The Critical Change Protocol applies — state plainly: what's changing (a new non-marker `accreditation_write` credential + the `sage-on` env keys), what could break (none in prod — this is a new credential + a local settings edit), rollback (revoke the credential + `sage-off`).
1. **Mint** a NON-marker `accreditation_write` credential (the CLI `practice`/UPC class). Use `MINT_CLI_ADMIN_JWT` from a logged-in prod session (memory `prod-mint-needs-prod-admin-jwt`); **unset any exported prod creds first** so `--env-file` isn't shadowed (memory `mint-cli-env-file-export-leak`). It must be DISTINCT from the dogfood marker credential.
2. **`/sage-on`** providing the minted credential + the agent_id → the skill writes `SAGE_GATE1_ACCRED_CREDENTIAL` + `SAGE_GATE1_AGENT_ID` into `settings.local.json` env (capture derives ON automatically; do NOT set `GATE1_PROVENANCE_ENABLED`).
3. **Confirm the loud echo reads `PROVISIONED`** (not `NOT PROVISIONED` / not `MISCONFIGURED`). This is the guard against the v6 starvation recurring — do not proceed past a non-`PROVISIONED` echo.

### Step 4 — Per-tier enforced-channel smoke (spec §6 + §10 step 4; founder-walked)
On the **agentic** scenario, run a **one-cell smoke per capability tier** in the binding-capture arm confirming the guard fires + provenance accrues on that tier (so no later binding cell's "no value" is an un-validated channel assumption). Use throwaway credentials/agent_ids; put any test loops as a **sibling of the repo under `Claude-work/PROJECTS/`** (memory `test-loop-dirs-under-claude-work-projects`), not `/tmp`. Raise `daily_limit` on the consult credential for multi-call runs (memory `api-key-1-per-day-limit-masks-as-401`).

### Step 5 — Decision-log + close
Record: scenarios authored + which froze (+ the sealed sweeps); the write path provisioned (`PROVISIONED` echo); the smoke result per tier; the benchmark credentials minted (tag them for billing/trajectory exclusion). **Positioned for:** the screening half-matrix (§3.4) → the full matrix (§3) → scoring + the §8 decision rule. Use the lean close + decision-log forms (the Critical session keeps the full Critical-session close sections per the cache).

## Critical-change reminders
- Every prod step is **yours** (PR17) — the AI guides + verifies, performs no mint/Vercel/Supabase/git op. The Critical Change Protocol (six points) is walked live, not handed off in one line.
- **Benchmark credentials are test artifacts:** tag the agent_ids; exclude their traffic from billing/trajectory samples; **revoke at teardown.**
- The standing `pre_decision_harness` dogfood marker + the LIVE H1/H2 install stay **untouched** — the S6 binding arm uses separate, throwaway non-marker credentials.
- `persistReflection` stays **dark** (`SAGE_GATE1_REFLECT_PERSIST_ENABLED` unset) — S7 (reflect-row erasure) is the prerequisite for any standing persist, and is a *separate* carried Critical session.

## Risk classification
**`code-critical`** under 0d-ii — a prod credential mint + a live (throwaway) hook install for the smoke; founder-walked; reversible by credential revoke + `sage-off`. The scenario authoring sub-part is repo-only/Standard but does not lower the session's form.

## Rollback
Revoke any minted benchmark credential + delete its `agent_accreditation` row if a smoke write landed; `git revert` the scenario-authoring commit; `/sage-off` to remove the smoke hook install. Nothing standing changes; the dogfood marker + H1/H2 are untouched.

## Forecast
Ends with the scenario set authored + frozen (with sealed keys + dispositive-fact sweeps), the trust-record write path **provisioned** (`PROVISIONED` confirmed — the v6 starvation can't recur), and the binding channel **smoke-confirmed per tier** — i.e. everything ready to start the screening half-matrix, then the full capability × scenario × arm matrix that is the deciding gate. The result characterises WHERE the practice adds value (the expectation: value rising as capability falls, the trust record flat across tiers) and sets the honest public claim. **Do NOT gate the machine on Opus alone.** S4/S5 are conditional on this gate; S7 is the separate Critical prerequisite for standing persist. The 0h call remains yours.

End of prompt.
