# Next-Session Prompt — P4 (agent 2): Ops's calling + credential provisioning

**Stream:** founder (AO program — P4, the second agent-provisioning session; it reuses the pattern Tech's session settled).
**Tier:** split, per plan §3-P4 — `governance` for the calling draft, **`code-critical` for the credential mint + harness install + verification**. Follow the full Critical Change Protocol (six elements: what's changing, what could break, what happens to existing sessions, rollback plan, verification step, explicit founder approval) for every live step.
**Governing frame:** `/adopted/standing-protocol-cache.md` §"Critical-risk sessions".
**Predecessor session:** `operations/handoffs/founder/2026-07-21-P4-agent1-tech-calling-and-provisioning-CLOSE.md` (read the Addendum at the top first — it corrects the body below it).
**Predecessor decision-log entry:** `D-P4-AGENT1-TECH-CALLING-AND-PROVISIONING-2026-07-21` (including its same-day erratum).
**Risk classification:** Standard for the calling draft (documents only); **Critical for the mint + install + verification** — AC7 + PR6 + PR17 all engage there. Nothing in this prompt pre-approves the mint or install; the founder runs every live command live.

## Why this session matters, and what NOT to re-derive

Ops's matrix row is already signed (`operations/agent-org-2026-07/P5-permissions-matrix.md` §3 Row 2). The pattern this session should follow was fully worked out — sometimes the hard way — in Tech's session. **Reuse it; do not rediscover it:**

1. **Harness isolation:** a git worktree, same as Tech's. `git worktree add ../sagereasoning-ops -b agent-org-ops`. No election needed — this is already the confirmed approach (Tech's session's Election E1).
2. **The CLI limit-flag fix is already merged** (`website/src/lib/admin-mint/mint-credential-core.ts`, `buildPracticeMintPlan` now reads `--monthly`/`--daily`/`--chain`). Do not re-diagnose this — just use the flags directly.
3. **The owner-email mint-planning lesson — apply this correctly from the start, don't rediscover it live:** mint the **consult** credential WITHOUT `--owner-email` (owner-less, agent-bound only). Mint the **write** credential WITH `--owner-email` (owner-bound). Passing `--owner-email` on BOTH will collide on the `api_keys_upc_owner_agent_active_uniq` partial-unique index ("at most one active credential per (owner_user_id, agent_id)") and the second mint will 500. This is not optional caution — it is a hard DB constraint that bit Tech's session directly.
4. **Step 6 verification — use the direct hook-invocation method as PRIMARY, not the GUI.** Tech's session eventually got the GUI's `pwd` resolution working (register the worktree as its own project via Home → Projects → Add, not via "working directory" inside the original `sagereasoning` project), but a subsequent check found **the model can confabulate a perfectly plausible-looking Gate-1 frame block without one ever actually firing** (confirmed via a production DB query showing zero new rows). **Any GUI-session claim of a frame having fired MUST be verified server-side** (`agent_assessment_history` / `loop_billing_events` filtered on the credential's exact id) before being trusted — never accept the model's own narrated self-report of "I saw a system-reminder" as sufficient. See memories `claude-code-desktop-worktree-session-routing` and `model-confabulates-plausible-harness-output` for the full detail. Given this, the direct hook-invocation proof (see Tech's session for the exact method — invoking `framing-hook.mjs` from inside the worktree with `env` read from that worktree's own `settings.local.json` and a simulated `UserPromptSubmit` stdin payload) is the recommended, reliable path — treat a genuine GUI session as a nice-to-have, not a blocker.
5. **Credential hygiene:** never ask the founder to paste raw credential values into chat. Give exact file-edit instructions (placeholders in `settings.local.json`) for the founder to fill in themselves, off-transcript, exactly as done for Tech.
6. **Traffic tagging:** any TEST or direct-hook-proof consult is verification/smoke traffic — tag it explicitly at close, per plan §2.

## Part A — Open under the protocol

Read in order:
1. `/adopted/standing-protocol-cache.md` (~3 min).
2. `operations/handoffs/founder/2026-07-21-P4-agent1-tech-calling-and-provisioning-CLOSE.md` — **read the Addendum at the top first**, then the body. This is Ops's session template.
3. `operations/agent-org-2026-07/P5-permissions-matrix.md` §3 Row 2 (Ops) and §6 (sign-off record).
4. `operations/agent-org-2026-07/P1-agent-roster-gap-analysis.md` §5 (Ops's ranked-order rationale: "high" org-urgency — the incident/rollback runbook, migration-strategy formalization, go-live-checklist maintenance; "high" evidence-dividend fit — checklist/runbook/decision-log work is native Claude-Code-loop shape) and §4.1 (the "load current build-state first" precondition, same as Tech's calling).
5. `operations/agent-org-2026-07/credential-ledger.md` — current state (Tech's 3 rows already present; Ops's rows land this session).
6. `harness/gate1-pre-decision/KILL-SWITCHES.md` (Layer 4, unchanged since Tech's session).
7. Memories: `claude-code-desktop-worktree-session-routing`, `model-confabulates-plausible-harness-output`, `test-admin-needs-profiles-row`, `prod-mint-needs-prod-admin-jwt`.

Confirm at open: tier; hold-point P0 0h (active); model selection N/A; status vocabulary; signals/risk classification (Critical for the mint/install/verify steps).

## Part B — Procedure

### Step 1 — Create Ops's worktree (Standard risk; no election needed, pattern already confirmed)
```
cd /Users/clintonaitkenhead/Claude-work/PROJECTS/sagereasoning
git worktree add ../sagereasoning-ops -b agent-org-ops
```

### Step 2 — Draft Ops's calling (governance; documents only)
Per plan §3-P4(a): grounded in Ops's own real remit (P1 §5), **not** copy-pasted from Tech's calling. Ops's real work is file-and-state-centric: drafting checklists, monitoring decision-log/KG state, maintaining runbooks, the incident/rollback protocol, migration-strategy formalization, go-live-checklist upkeep — distinct from Tech's diagnostic/fix-drafting remit. Include the same mandatory "load current build-state first" precondition (§2 of Tech's calling is a good template for the *shape* of this section, not its content). Save as `operations/agent-org-2026-07/ops-calling-v1.md`.

### Step 3 — Election E2 + Critical: mint Ops's credentials (founder-walked, PR17)

Confirm the identity string via AskUserQuestion (recommend `sagereasoning:org-ops@v1`, matching the matrix's own illustrative example — do not assume without asking, same as Tech's session). Confirm the owner-email (recommend `clintonaitkenhead@gmail.com`, matching every prior operator mint — still worth a quick confirm, not a silent assumption).

Present the full Critical Change Protocol (what's changing: two new additive `api_keys` rows under the confirmed identity, `[consult]` at 120/mo·10/day and `[accreditation_write, calling, reflect]` at 120/mo·10/day, per the signed matrix row — **note Ops's limits are 120/10, not Tech's 150/15**; what could break: nothing existing; rollback: revoke, instant; verification: `list`) and get explicit approval before running anything.

**TEST-first is optional this time** (the CLI fix and the owner-email pattern are both already proven — TEST-first added real value for Tech because it caught two genuine defects; if the founder prefers to skip straight to prod given both are now known-good, that's a reasonable, foundable call, but ask rather than assume). If TEST-first is chosen, remember: TEST's `profiles` table is separately-provisioned from prod's — the write-class TEST mint will 400 honestly if the operator email isn't there (not a defect; skip or provision the row, founder's call, same as Tech's session).

**Mint commands (adjust TEST/prod targeting per the founder's choice; own-email on write only, per the lesson above):**
```
npx tsx scripts/mint-credential.ts \
  mint practice --label "org-ops consult" \
  --capabilities consult \
  --agent-id sagereasoning:org-ops@v1 \
  --monthly 120 --daily 10

npx tsx scripts/mint-credential.ts \
  mint practice --label "org-ops write" \
  --capabilities accreditation_write,calling,reflect \
  --agent-id sagereasoning:org-ops@v1 \
  --owner-kind operator \
  --owner-email clintonaitkenhead@gmail.com \
  --monthly 120 --daily 10
```
(Prefix with `MINT_CLI_BASE_URL=https://www.sagereasoning.com MINT_CLI_ADMIN_JWT=<fresh JWT from the founder's own logged-in browser session>` for prod — get a fresh JWT even if one was used recently, since Tech's session found an earlier one had gone stale.)

Verify via `list`, update `credential-ledger.md` (append rows, matching the existing format — Ops's are the 4th–5th rows).

### Step 4 — Harness install in Ops's worktree (Critical)
Same pattern as Tech's Step 5: `discernment.config.json` filled with Ops's real purpose/kathekonta/circle (drawn from Step 2's calling document); `settings.local.json` with the canonical H1–H5 hooks block + placeholders for the two raw credential values (founder fills in directly, off-transcript) + `GATE1_STATE_DIR=/Users/clintonaitkenhead/.sage-gate1-ops` (a third, distinct state directory — never reuse Tech's or the founder's own).

### Step 5 — Verify the wiring (direct hook-invocation, primary method)
Write a small script (mirroring Tech's `tech-hook-proof.mjs` pattern) that reads Ops's `settings.local.json` env block, simulates a `UserPromptSubmit` stdin payload, and invokes the actual `framing-hook.mjs` file inside Ops's worktree directly. Confirm exit 0, a genuine frame in the output, and `~/.sage-gate1-ops/gate1.log` showing a fresh `FRAMED` entry. This alone is sufficient — do not treat a GUI attempt as required; if the founder wants to also try the GUI (now that the "register as its own project" fix is known), that's optional, and any success claim must be verified against production's `agent_assessment_history`/`loop_billing_events` before being trusted, per the confabulation finding above.

### Step 6 — Confirm attended-only posture
State explicitly: Ops's default posture is attended-only. Nothing in this session activates unattended operation.

### Step 7 — Decision-log entry + session close (full Critical form)
Cite `/adopted/standing-protocol-cache.md` §"Critical-risk sessions"; include Verification Method Used, Risk Classification Record, PR5 Knowledge-Gap Carry-Forward, Founder Verification, Orchestration Reminder.

## Part C — Anticipated session shape

Should be meaningfully faster than Tech's session — no CLI fix to build, no isolation election to make, no mint-planning mistake to make-and-correct (all three consumed real time in Tech's session).

| Phase | Estimate |
|---|---|
| Opens reads | 20–25 min |
| Step 1 — worktree | 5 min |
| Step 2 — calling draft | 25–35 min |
| Step 3 — election + Critical mint | 25–35 min |
| Step 4 — harness install | 15–20 min |
| Step 5 — direct-hook verification | 15–20 min |
| Step 6 — attended-only confirmation | 5 min |
| Decision-log + close | 30–40 min |
| **Total** | **~2.5–3 hours** |

## Rollback path
Steps 1–2 trivially reversible (`git worktree remove`; `git revert` the calling document). Steps 3–4 roll back by revoking both credentials (instant, `KILL-SWITCHES.md` Layer 4). No schema, flag, or existing-credential change occurs anywhere in this session.

## Forecast
Success is: Ops has a real, signed identity with two correctly-limited live credentials in the ledger; a genuine calling grounded in its own actual remit; a working, isolated harness install verified via the direct-hook method; an explicit attended-only posture — achieved faster than Tech's session precisely because Tech's session already paid down the CLI fix, the isolation-pattern election, and the owner-email lesson. Growth and Support remain deferred, unchanged.

End of prompt.
