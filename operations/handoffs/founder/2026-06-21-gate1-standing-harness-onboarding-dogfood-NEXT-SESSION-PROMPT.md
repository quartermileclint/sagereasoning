# Next-Session Prompt — Gate-1 Standing Harness Onboarding: dogfood the plugin + issue the first STANDING `pre_decision_harness`

**For the founder. Paste as the first message of a fresh session.**

**Stream:** founder.
**Tier:** `code-critical` — **Critical** (AC7 + PR6). **Full Critical Change Protocol (0c-ii), not abbreviated.** The Critical part is a *standing* operator-credential mint on production + a **persisting** `pre_decision_harness` marker on the LIVE public accreditation credential — **NO smoke teardown**. There is **no repo code change** (the harness is already built + trajectory-Verified; the install is local config; the marker is a prod data change).
**Governing frame:** /adopted/standing-protocol-cache.md → §"Critical-risk sessions" (full templates).
**Predecessor close:** operations/handoffs/founder/2026-06-21-gate1-arc3-slice4-configuration-contract-published-close.md.
**Predecessor decision-log entry:** `D-SAGE-PRACTICE-GATE1-ARC3-SLICE4-CONFIGURATION-CONTRACT-PUBLISHED`.
**Governing design:** `adopted/adr/2026-06-20-pre-decision-harness-arc2.md` (ADR-011 — **D2** two surfaces / **D4** fail modes / **D7** operator-minted marker + §"Consequences" dogfood/reference-integration); the harness README + the Slice-3 live-verify walkthrough (`harness/gate1-pre-decision/README.md`, `harness/gate1-pre-decision/claude-code/SLICE3-LIVE-VERIFY-WALKTHROUGH.md`); the Slice-3b chain (`D-SAGE-PRACTICE-GATE1-ARC2-SLICE3B-FIRST-PRE-DECISION-HARNESS-ISSUED-LIVE` — replayed here **without** the teardown).

## Why this session matters

The Gate-1 surface-honesty arc (Arcs 1–3) is complete: the `pre_decision_harness` marker mechanism is **Verified-live** (3b), the harness hooks are **trajectory-Verified** (live trace 2026-06-21: `tool_name=Agent`, `updatedInput` applied), and the two "Gate 1" configurations are documented on the public surfaces (Slice 4). But the 3b proof was **smoke-torn-down** — *"no standing credential earns its place until genuine onboarding"* — so **no standing marker exists**, and the plugin has never run in a real loop.

This session makes the harness **real in a genuine loop** — the founder's own dogfooded Claude Code sessions (PR16 dogfood; the reference integration ADR-011 §Consequences names) — and issues the **first PERSISTING** `pre_decision_harness` on the live public credential.

## Benchmark A/B — handled by a clean bare environment, NOT an in-hook toggle (founder decision 2026-06-21)

The founder's requirement — be able to run *"without harness"* comparison benchmarks — is met by **running the bare arm in a clean Claude Code environment where the Gate-1 hooks are not registered** (a fresh `git worktree` at the same baseline; the gitignored project-local hook registration makes the worktree harness-free by construction), per **`harness/gate1-pre-decision/claude-code/HARNESS-VS-BARE-BENCHMARK-WALKTHROUGH.md`** (written 2026-06-21). **No `GATE1_ENABLED` toggle is built** — this keeps the harness code free of a benchmark-only affordance, removes the *"did the off-path truly no-op?"* question, and mirrors the existing P1 leg-A/leg-B precedent. The actual harnessed-vs-bare *run* (and any verdict memo) is a **follow-on**; this session only confirms the bare environment is reproducible (Step 4) and issues the standing marker.

## The six Critical-Change-Protocol elements (state these up front; get explicit approval)

1. **What is changing — plain language.** (a) The existing harness installed in the founder's own Claude Code loop (local `.claude/settings.local.json` — gitignored, not committed). (b) A **standing operator UPC minted on PRODUCTION** carrying `examination_enforcement: pre_decision_harness`. (c) Genuine pre-decision-framed consult(s) + **one accreditation write** that clears the live R18f gate and **PERSISTS**, so the public GET reads `pre_decision_harness` for the dogfood agent. **No smoke teardown — the marker stands. No repo code / server / schema / flag change.**
2. **What could break — failure modes.** The prod credential mint is admin-gated (same path as 3b). The accreditation write must clear the **live R18f provenance gate** (needs a genuine Ed25519-signed consult). The `examination_mode` column + `SUBSTRATE_EXAMINATION_MODE_ENABLED` flag predate this (Arc 1, Live) — untouched.
3. **What happens to existing sessions.** Nothing. The new standing credential is additive; existing prod credentials/rows untouched; the install is the founder's local machine config only.
4. **Rollback plan.** Revoke the standing credential + delete its `agent_accreditation` row (cascade `evaluated_actions`/`grade_history`) → returns to the no-standing-marker state; remove the local `.claude/settings.local.json` hook blocks. **Unlike 3b this is NOT auto-torn-down** — retracting the standing marker is a deliberate later act.
5. **Verification step.** A **TEST dogfood dry-run** (harness fires top-level + subagent in a real session) **before** prod; the prod marker SQL-verified on the row; the public GET reads `pre_decision_harness`; and the **bare-arm environment confirmed reproducible** (a fresh worktree shows no Gate-1 hook fires) so the A/B benchmark capability is real.
6. **Explicit founder approval specific to the named risks** — in particular that a **persisting `pre_decision_harness` on the live public credential is intended** (not smoke-torn-down), and that the dogfood credential's real traffic (billing/trajectory/audit rows) will accumulate under it.

## Pre-conditions
1. Production at the Slice-4 end-state: Arc 1 Live (`SUBSTRATE_EXAMINATION_MODE_ENABLED=true`); **no standing marker credential/row**; the Slice-4 docs committed + Vercel green (founder confirmed 2026-06-21).
2. The harness is built + trajectory-Verified (`harness/gate1-pre-decision/`); local gates green (`logic-harness.mjs` 32/0, `negative-battery.mjs` 56/0). **The harness code is NOT modified this session.**
3. A prod admin JWT available for the mint (memory `prod-mint-needs-prod-admin-jwt` — the only `MINT_CLI_ADMIN` env file targets TEST; prod needs `MINT_CLI_ADMIN_JWT` from a logged-in `www.sagereasoning.com` session). A K1-**canonical** `agent_id` chosen for the dogfood agent (memory `upc-mint-vs-accreditation-agent-id` — `namespace:name@version` or the accreditation write 400s). Raise the credential's limits before multi-consult use (memory `api-key-1-per-day-limit-masks-as-401`).
4. 0h remains held — pre-0h trust-layer dogfood work; the session does not touch the launch call.

## Part A — Open under the protocol (full Critical reads)
Read in order:
1. /adopted/standing-protocol-cache.md (~3 min) + §"Critical-risk sessions".
2. The predecessor Slice-4 close (above) + the 3b close (the mint→marker→read chain to replay **without** teardown).
3. `adopted/adr/2026-06-20-pre-decision-harness-arc2.md` — D2 / D4 / D7 + §"Consequences" (the dogfood/reference-integration is the explicit positive).
4. `harness/gate1-pre-decision/README.md` + `claude-code/SLICE3-LIVE-VERIFY-WALKTHROUGH.md` (install + live-verify; the desktop `/plugin`-absent standalone fallback) + `claude-code/HARNESS-VS-BARE-BENCHMARK-WALKTHROUGH.md` (the bare-arm environment method).
5. `sdk/typescript/examples/gate1-3b-walk.ts` (the parameterized consult→verify→write→read driver — reuse for the prod write).
6. Memories: `prod-mint-needs-prod-admin-jwt`, `upc-mint-vs-accreditation-agent-id`, `api-key-1-per-day-limit-masks-as-401`, `mint-cli-env-file-export-leak`, `claude-code-desktop-app-hook-env`.

Confirm at open: tier (**Critical**); 0h held; **model N/A for the session** (hooks are deterministic JS; the framing consult uses `quick`/`standard` per ADR-011 D3 — never `deep` — the server's existing AC1 selection, not a session choice); status vocab; risk class; **the six 0c-ii elements above, with explicit founder approval**.

## Part B — Procedure (full)

### Step 1 — TEST dogfood dry-run (rehearse the loop BEFORE prod; PR1 single-surface proof)
Point everything at TEST. Mint a **TEST** `sr_live_`/`sr_prac_` `consult`-capable key and **raise its limits** (the dogfood makes many consults — memory `api-key-1-per-day-limit-masks-as-401`). Install the harness in a fresh Claude Code conversation via the **standalone registration** (the desktop build has no `/plugin`; merge the `UserPromptSubmit` + `PreToolUse` `Task|Agent` blocks into `.claude/settings.local.json` per the SLICE3 walkthrough), with the `env` block (credential + `GATE1_ENDPOINT`=TEST; memory `claude-code-desktop-app-hook-env`). Prove, in your own session: (a) the top-level task is framed (`gate1.log` `FRAMED`); (b) a delegated subagent is framed (`FRAMED-SUBAGENT`); (c) the subagent reasons from the frame (its prompt leads with the `[SageReasoning Gate 1 — pre-decision examination]` block). Tear down the TEST key. *(If you have the `claude` CLI, optionally verify the `/plugin marketplace add` + `/plugin install` marketplace path too — CLI-only; not required, the standalone path is the supported desktop install.)*

### Step 2 — Mint the STANDING operator UPC on PRODUCTION (Critical/AC7; founder-walked PR17)
Export `MINT_CLI_ADMIN_JWT` once and verify length (`echo "${#MINT_CLI_ADMIN_JWT}"`); keep `MINT_CLI_BASE_URL` **inline** (never export — cross-env leak hazard; memory `mint-cli-env-file-export-leak`). Mint an operator UPC: a **K1-canonical** `agent_id` for the dogfood agent (e.g. `sagereasoning:gate1-dogfood@v1` — your call; **canonical or the accreditation write 400s**, memory `upc-mint-vs-accreditation-agent-id`), capabilities `consult,accreditation_write`, `owner_kind operator` → your profile, `credential_provenance.examination_enforcement=pre_decision_harness`. **SQL-verify** `credential_provenance.examination_enforcement = "pre_decision_harness"` on the actual row (the unforgeability root). Raise the new key's limits.

### Step 3 — Issue the first STANDING `pre_decision_harness` (Critical/AC7; NO teardown)
Set the founder's local harness `env` to the **standing prod credential** + `GATE1_ENDPOINT=https://www.sagereasoning.com/api/reason`. Then issue the marker via `sdk/typescript/examples/gate1-3b-walk.ts` (parameterized) **or** a genuine dogfood consult: an `assessment_first` consult (`signature verifies: true`) → an accreditation **seed** write clearing the live R18f gate (`status: ok`) → `GET /api/accreditation/<dogfood agent_id>` reads **`examination_mode: "pre_decision_harness"`**, `coverage_status: "agent_elected"` (D3). **This row PERSISTS — it is the standing marker.** *(Optional: a paired standing control reading `post_decision_check` if you want the differentiation visible standing too.)*

### Step 4 — Confirm the standing marker + the bare-arm benchmark environment (live)
Re-read the public GET → `pre_decision_harness` stands; the harness fires in the founder's real loop (`gate1.log` `FRAMED`; a new `loop_billing_events` row). Then **confirm the bare arm is reproducible** per `HARNESS-VS-BARE-BENCHMARK-WALKTHROUGH.md`: `git worktree add ../sagereasoning-bare <baseline>`; open a fresh Claude Code conversation rooted there; confirm **no Gate-1 hook fires** (no `gate1.log` line, no frame block). `git worktree remove` after. **This proves the founder can run harness-vs-no-harness comparison runs by environment, no toggle.**

### Step 5 — Decision-log entry (full Critical form)
Record: the standing `pre_decision_harness` is **Live + PERSISTING** (production **NOT** byte-equivalent to before — a deliberate, intended standing change); the dogfood loop is the reference integration (ADR-011 §Consequences, PR16); the benchmark A/B is by clean environment (`HARNESS-VS-BARE-BENCHMARK-WALKTHROUGH.md`), no toggle. Include the Critical sections (Verification Method, Risk Classification Record, PR5 Carry-Forward). Suggested id: `D-SAGE-PRACTICE-GATE1-STANDING-HARNESS-DOGFOOD-PRE-DECISION-MARKER-LIVE`.

### Step 6 — Session close (full Critical form) + CLAUDE.md PR18
Add a **new "Live in production" entry**: the standing dogfood `pre_decision_harness` marker. Note the dogfood credential's traffic is **real-internal** (tag/track the dogfood `agent_id`; the founder decides whether to exclude it from any external-adopter sample). Carry forward: the harnessed-vs-bare comparison *run* (the bare-environment method enables it) as a follow-on; the `/plugin install` marketplace verification as a CLI-only optional; the 0h launch call (the founder's).

## Risk classification
**Critical** under 0d-ii — a credential mint on production + a **persisting** non-null marker on the Live public trust credential (data change; AC7 + PR6). **No repo code / server / schema / flag / perimeter change** (R18f / R20a / distress / Layer-2 signing / UPC auth all untouched — the column + flag predate this, Arc 1). KG1 engages on the prod DB write.

## Rollback path
Revoke the standing credential (`mint-credential.ts revoke`) + delete its `agent_accreditation` row (cascade) → no-standing-marker state restored; remove the local `.claude/settings.local.json` hook blocks. Deliberate, not automatic.

## Forecast
Ends with the harness running in the founder's own Claude Code loop, a **standing, persisting `pre_decision_harness`** on the live public credential (the first one that earns its place), and a **confirmed bare-arm environment method** so harness-vs-bare comparison benchmarks can run cleanly (no toggle). After this, the remaining Gate-1 items are the harnessed-vs-bare comparison *run* and the optional `/plugin install` marketplace verification (CLI-only); the **0h launch call** stays the founder's.

## Cross-references
- `adopted/adr/2026-06-20-pre-decision-harness-arc2.md` (ADR-011 — D2/D4/D7 + Consequences)
- `D-SAGE-PRACTICE-GATE1-ARC2-SLICE3B-FIRST-PRE-DECISION-HARNESS-ISSUED-LIVE` (the chain replayed without teardown)
- `D-SAGE-PRACTICE-GATE1-ARC3-SLICE4-CONFIGURATION-CONTRACT-PUBLISHED` (predecessor)
- `harness/gate1-pre-decision/README.md` + `claude-code/SLICE3-LIVE-VERIFY-WALKTHROUGH.md` + `claude-code/HARNESS-VS-BARE-BENCHMARK-WALKTHROUGH.md`
- `sdk/typescript/examples/gate1-3b-walk.ts`
- memories: `prod-mint-needs-prod-admin-jwt`, `upc-mint-vs-accreditation-agent-id`, `api-key-1-per-day-limit-masks-as-401`, `mint-cli-env-file-export-leak`, `claude-code-desktop-app-hook-env`

End of prompt.
