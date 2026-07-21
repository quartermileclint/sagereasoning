# Next-Session Prompt — P4 (agent 1): Tech's calling + credential provisioning

**Stream:** founder (AO program — P4, the first agent-provisioning session; it also settles the pattern the rest of P4 reuses).
**Tier:** split, per plan §3-P4 — `governance` for the calling draft (Step 3), `code-standard` for the CLI fix this session found is needed first (Step 2), **`code-critical` for the credential mint + harness install + first live verification** (Steps 4–6). **The highest-risk category sets the template form for the session as a whole — this is a Critical session. Follow the full Critical Change Protocol (six elements: what's changing, what could break, what happens to existing sessions, rollback plan, verification step, explicit founder approval) for every live step, not the lean forms.**
**Governing frame:** `/adopted/standing-protocol-cache.md` (full governance via the cache; the day's primary deliverable is the AO plan §3-P4 + the signed P5 matrix, both named below). `/adopted/standing-protocol-cache.md` §"Critical-risk sessions" governs the template form.
**Predecessor session close:** `operations/handoffs/founder/2026-07-21-P5-permissions-matrix-CLOSE.md`.
**Predecessor decision-log entries:** `D-P5-PERMISSIONS-MATRIX-TECH-OPS-ROWS-SIGNED-2026-07-21`; `D-AGENT-ORG-EVIDENCE-BUILD-PLAN-ADOPTED-2026-07-19`; `D-LAUNCH-FEEDBACK-RECONCILIATION-FOLDED-INTO-AO-PLAN-2026-07-19`.
**Risk classification:** Elevated for Step 2 (the CLI fix); Standard for Step 3 (the calling draft, documents only); **Critical for Steps 4–6** (credential mint, harness install, first live verification) — AC7 + PR6 + PR17 all engage there. Nothing in this prompt pre-approves the mint or install; the founder runs every live command live, per PR17, no one-line hand-off.

## Why this session matters

P5 discharged its gate: Tech's permissions-matrix row is founder-signed (`operations/agent-org-2026-07/P5-permissions-matrix.md`, §6), so P4 is now genuinely unblocked rather than waiting on an unenforced aspiration. This is also the **first** agent identity minted under the whole AO program — per plan §3-P4, "the first agent's session also settles the pattern." Decisions made here (how a dedicated agent's Claude-Code-loop harness coexists with the founder's own s9-loop install without hot-reload collision; the exact discernment-config + settings shape; how the tagged-verification-traffic discipline actually gets executed) become the template Ops (agent 2) reuses without re-deciding them — so it is worth being deliberate here even though it costs more time than agent 2 will.

**A genuine gap this session's drafting found, named up front so it isn't discovered mid-mint:** the admin mint CLI's `mint practice` command (`website/scripts/mint-credential.ts` → `buildPracticeMintPlan` in `website/src/lib/admin-mint/mint-credential-core.ts`) does **not** read `--monthly`/`--daily`/`--chain` flags — it always lands on the route's 30/1/1 default, silently, with no error. The underlying route (`website/src/app/api/admin/api-keys/route.ts`) *does* accept `monthly_limit`/`daily_limit`/`max_chain_iterations` overrides in the POST body for a UPC-mode mint (confirmed by direct read, lines ~121–123 and ~254–281) — this is a CLI-only omission, not a route limitation, and the sibling `mint api` command already reads these three flags via a small loop (`buildApiMintPlan`, lines ~183–197). **Left as-is, minting Tech's credentials via the CLI today would silently mint on the exact 30/1/1 starve-class default the signed matrix row (150/mo·15/day) was deliberately written to avoid** — the CLI would not error; it would just quietly not honor the signed policy. Step 2 below fixes this before any mint runs.

## Part A — Open under the protocol

Read in order:
1. `/adopted/standing-protocol-cache.md` (~3 min — confirm tier, model selection N/A, the Critical-risk-sessions template form, signals).
2. `operations/handoffs/founder/2026-07-21-P5-permissions-matrix-CLOSE.md` (~5 min).
3. `operations/agent-org-2026-07/P5-permissions-matrix.md` — read Tech's row (§3, Row 1) and §6 (sign-off record) in full.
4. `operations/agent-org-2026-07/P1-agent-roster-gap-analysis.md` §1 (the architecture split — Tech's chat-persona vs. the Gate-1/UPC system this program provisions are NOT the same thing), §4.1's meta-finding (agent context going stale without a "load current build-state first" precondition), §5 (ranked order).
5. `operations/agent-org-2026-07/agent-org-and-evidence-build-plan.md` §2 (standing constraints — the hard floor, attended-only default, traffic-tagging rule), §3-P4 (the per-agent steps a–f this session executes), §7 (Rule B — **the harness hook tree hot-reloads into every concurrently running live loop**; sessions touching it should avoid running concurrently with other live agent-loop sessions where practical).
6. `harness/gate1-pre-decision/KILL-SWITCHES.md` (all five layers — this session adds Tech as a new instance of layers 1–4; §4 already points at the credential ledger).
7. `operations/agent-org-2026-07/credential-ledger.md` (currently empty — this session writes its first rows).
8. `harness/gate1-pre-decision/claude-code/discernment.config.example.json` (the `orchestrator_profile` shape Step 5 fills in for Tech) and its sibling `discernment.config.json` (the founder's own live s9-loop config — read for the shape, do not edit).
9. `operations/trust-layer-2026-07/S11-FLIP-PREREQUISITES-REGISTER.md` §E (the two-credential-per-identity precedent, live-verified once already).

Confirm at open: tier (split, Critical governs); hold-point P0 0h (active — R&D-phase permissible; this session's mint is itself the kind of production-affecting change 0d-ii requires the Critical protocol for); model selection N/A (no LLM call in the mint/install steps themselves; Tech's own future consults will use the model rows already in the cache); status vocabulary; signals/risk classification (Critical for Steps 4–6).

## Part B — Procedure

### Step 1 — Resolve the harness-isolation architecture (AskUserQuestion; decide before touching any file)

Tech's real work happens *on this repo* (reading code/state files, drafting fixes, running diagnostics — P1's own characterization), so Tech's Claude-Code-loop session needs to operate against the actual `sagereasoning` working tree, not a scratch/sibling project. But `.claude/settings.local.json` is untracked and per-working-directory, and Rule B (§7 of the plan) names the harness hook tree as a shared-mutable-surface risk: if Tech's harness env vars (`SAGE_GATE1_CREDENTIAL`, `SAGE_GATE1_AGENT_ID`, `SAGE_GATE1_ACCRED_CREDENTIAL`, `GATE1_STATE_DIR`) were written into the *same* `settings.local.json` the founder's own s9-loop identity uses, the two identities would collide — whichever was written last wins, and a mid-session edit hot-reloads into any concurrently running founder session too.

**Recommend:** a **git worktree** for Tech — `git worktree add` a sibling checkout of `sagereasoning` (e.g. `../sagereasoning-tech`, matching the existing sibling-directory convention this project already uses for test-loop isolation), on the same branch (or its own working branch, founder's call). A worktree shares the repo's `.git` history but gives each checkout its own untracked files — so Tech's `.claude/settings.local.json` and `discernment.config.json` live entirely separately from the founder's main-checkout install, with zero collision risk, while Tech's session can still read, edit, and commit real repo content that flows back through normal git (push/PR) like any other checkout. This also gives Tech's sessions the same isolation property the harnessed-vs-bare benchmark already relies on for exactly this kind of "separate identity, same repo content" need.

Ask the founder to confirm this approach (or name an alternative) before Step 5. If confirmed, `git worktree add` is itself a local, reversible, non-destructive operation (`git worktree remove` cleans it up) — Standard risk, not Critical, but still worth a one-line explicit go-ahead since it's new repo-management surface for this project.

### Step 2 — Fix the CLI's practice-mint limit-flag gap (Standard risk; additive, mirrors existing code)

In `website/src/lib/admin-mint/mint-credential-core.ts`, `buildPracticeMintPlan` (around line 211–265): insert the same `limitFlags` loop `buildApiMintPlan` already uses (lines ~183–197) — reading `--monthly`/`--daily`/`--chain` into `monthly_limit`/`daily_limit`/`max_chain_iterations` on the body, each validated as a positive integer, omitted (falling to the route's 30/1/1 default) when not passed. Update the `USAGE` string's `mint practice` block to list the same three flags the `mint api` block already documents, so the CLI's own help text stops silently under-describing what it can do. This is a pure additive change to an existing dev-ops script — no production runtime path, no auth/schema/perimeter touch. Verify with `tsc --noEmit` (or the project's usual quick script check) before minting anything.

**If the founder prefers not to touch the CLI this session:** the fallback is a manual `curl` PATCH to `/api/admin/api-keys` (the route already supports `monthly_limit`/`daily_limit`/`max_chain_iterations` updates on an existing row, per its PATCH handler) using the same admin JWT the CLI itself would obtain — walked live, exact command, per PR17. Name whichever path is taken in the close; do not silently accept the 30/1/1 default as a substitute for the signed row.

### Step 3 — Draft Tech's calling (governance; documents only)

Per plan §3-P4(a): a session-prompt-shaped document declaring purpose, role responsibilities, current project status, and goals — written to **discharge** the G1 calling gate honestly, not decorate it. Per P1's meta-finding (§4.1 of the gap map): ground this in a **"load current build-state first" precondition** — the calling should point Tech at CLAUDE.md's Live/inert lists, the decision-log tail, and the S11 register, rather than describing Tech's role in the abstract, so Tech's first framed session (Step 6) isn't working from the same kind of stale context that made the April role-agents' launch feedback substantially wrong about what was already live. Save as `operations/agent-org-2026-07/tech-calling-v1.md`. This becomes (or feeds) `orchestrator_profile.purpose` in Tech's `discernment.config.json` at Step 5.

### Step 4 — Election E2 + CRITICAL: mint Tech's credential pair (founder-walked, PR17 — every command live)

**Election E2:** confirm `sagereasoning:org-tech@v1` (the plan's own illustrative example, already used in the signed matrix row) as Tech's real K1 identity, or a founder-preferred alternative — record the decision either way.

**What's changing:** two new, additive `api_keys` rows — a consult-class credential (`capabilities: [consult]`, per the signed row — `l1_supply` deliberately excluded) and a write-class credential (`capabilities: [accreditation_write, calling, reflect]`, owner+agent-bound per the 6e §A invariant), both scoped to the confirmed E2 identity, both `150`/mo · `15`/day per the signed matrix row.

**What could break:** nothing existing — these are brand-new, additive rows on a brand-new agent_id; no other credential, table, flag, or schema is touched. The residual risks are (a) minting on the CLI's un-fixed 30/1/1 default if Step 2 was skipped (mitigated: Step 2 runs first, or the fallback PATCH is used), and (b) a credential mis-bound to a non-canonical agent_id (mitigated: the CLI's own K1-canonical `namespace:name@version` validation at the write boundary, confirmed in the practice-credential memory — a malformed id would 400, not silently mis-bind).

**What happens to existing sessions:** none affected — the founder's own s9-loop identity, its credentials, and its live hooks are untouched by this mint.

**Commands (from `website/`, adjust `--env-file`/`MINT_CLI_BASE_URL` for TEST vs. prod per the founder's choice — TEST-first is available but not required for a credential-only change with no schema step; name the choice made):**
```
npx tsx --env-file=.env.development.local scripts/mint-credential.ts \
  mint practice --label "org-tech consult" \
  --capabilities consult \
  --agent-id sagereasoning:org-tech@v1 \
  --owner-kind operator \
  --monthly 150 --daily 15

npx tsx --env-file=.env.development.local scripts/mint-credential.ts \
  mint practice --label "org-tech write" \
  --capabilities accreditation_write,calling,reflect \
  --agent-id sagereasoning:org-tech@v1 \
  --owner-kind operator \
  --monthly 150 --daily 15
```
(If Step 2's fallback PATCH path was chosen instead of the CLI fix, mint plain — `--capabilities` only, no `--monthly`/`--daily` — then PATCH each row's id with the same numbers before proceeding.)

**Rollback:** revoke both credentials (`mint-credential.ts revoke practice --id <uuid>` — `PATCH is_active=false`) — instant, per KILL-SWITCHES.md Layer 4. No DB row is ever hard-deleted by this path.

**Verification step:** `npx tsx --env-file=.env.development.local scripts/mint-credential.ts list` — confirm both new rows: correct `agent_id`, correct `capabilities`, `150`/`15` limits (not `30`/`1`), `is_active:true`.

**Explicit founder approval:** required before either mint command runs — this is the Critical step; state the two capability sets and limits plainly and get a clear go-ahead, per the six-element protocol, before executing.

**Immediately after minting:** append both rows to `operations/agent-org-2026-07/credential-ledger.md`, per that file's own row-format notes (truncated id, capabilities, limits, `LIVE`, mint date + this session's reference). No row may exist there for an agent whose matrix row isn't signed — Tech's is, so this is in order.

### Step 5 — Harness install (Critical; only if Step 1 confirms the Gate-1-harnessable surface, per P1's E1 recommendation)

In Tech's worktree (or wherever Step 1 landed):
- Copy `discernment.config.example.json` → `discernment.config.json`. Fill in `orchestrator_profile.agentId` = the confirmed E2 identity (**must exactly match** the consult credential's `agent_id` — a mismatch 403s every spawn, per that file's own `_credential_binding` note), `purpose` = drawn from Step 3's calling document, `circle` and `currentKathekonta` reasoned honestly for Tech's actual remit (not copied verbatim from the example file's generic values).
- In that worktree's `.claude/settings.local.json`, set the `env` block: `SAGE_GATE1_CREDENTIAL` = Tech's consult token (raw, printed once at mint — capture it then, it cannot be retrieved later), `SAGE_GATE1_AGENT_ID` = the E2 identity, `SAGE_GATE1_ACCRED_CREDENTIAL` = Tech's write-class token, `GATE1_ENDPOINT` = the production endpoint, `GATE1_STATE_DIR` = a durable, **Tech-specific**, non-`/tmp` path (e.g. `/Users/clintonaitkenhead/.sage-gate1-tech` — deliberately distinct from the founder's own `~/.sage-gate1`, so state files never collide).
- Do **not** touch `GATE1_FALSE_HOLD_CAPTURE` — the observation clock stays stopped per the AO plan's own P8b gating (that's a later, separate session, deliberately started only once real multi-identity traffic exists).
- Copy the canonical hooks block (`.claude/gate1-hooks-block.json`, per the `/practice-on` pattern) into that worktree's settings — the same H1–H5 hooks the founder's own install uses, now bound to Tech's own credentials via the env block above.

### Step 6 — First framed session, tagged as verification/smoke traffic (§2's traffic-tagging rule)

Open one real, attended session as Tech (from the worktree). Confirm the harness frames correctly — `gate1.log` should read `FRAMED` (not `UNFRAMED reason=...`) on the first consult, proving the new credential and agent-id binding actually work end-to-end. Do one small, genuinely Tech-shaped piece of work in that session (a real diagnostic read of current build state, per Step 3's calling — not a synthetic no-op). **Explicitly tag this session's own consults and any accreditation writes as verification/smoke traffic in the close** — per plan §3-P4(d), this session's own generated records are excluded from Track B's evidence base by design, not silently absorbed into it.

### Step 7 — Confirm attended-only posture (no exceptions)

State explicitly in the close that Tech's default posture is **attended-only**, per §2's hard floor. Nothing in this session activates unattended operation for Tech, regardless of how cleanly Step 6 went — that is a separate, later, explicitly Critical-tier step this session does not take.

### Step 8 — Append decision-log entry (full Critical form — cite `/adopted/standing-protocol-cache.md` §"Critical-risk sessions"; include Verification Method Used, Risk Classification Record, PR5 Knowledge-Gap Carry-Forward, Founder Verification, Orchestration Reminder)

### Step 9 — Session close (full Critical form, same additional sections as Step 8)

## Part C — Anticipated session shape

| Phase | Estimate |
|---|---|
| Cache + P5 close + P5 matrix + P1 §1/§4.1/§5 + plan §2/§3-P4/§7 + KILL-SWITCHES + ledger + discernment example + register §E | 30–40 min |
| Step 1 — worktree decision + `git worktree add` | 15–20 min |
| Step 2 — CLI fix + verify | 15–20 min |
| Step 3 — calling draft | 25–35 min |
| Step 4 — election E2 + Critical mint (both credentials, approval, verification, ledger update) | 30–40 min |
| Step 5 — harness install | 20–30 min |
| Step 6 — first framed + tagged session | 20–30 min |
| Step 7 — attended-only confirmation | 5 min |
| Decision-log (full) + close (full) | 40–50 min |
| **Total** | **~3.5–4.5 hours** (heavier than a lean session by design — this is the pattern-setting first agent, and it carries a genuine Critical mint) |

## Rollback path

Steps 1–3 (worktree, CLI fix, calling draft) are trivially reversible (`git worktree remove`; `git revert` the CLI-fix and calling-document commits). Steps 4–6 (the mint and install) roll back by revoking both credentials (instant, per KILL-SWITCHES.md Layer 4) — the harness then runs unframed with honest logs from that worktree, never blocking anything. No schema, flag, or existing-credential change occurs anywhere in this session, so nothing else is at risk from a rollback.

## Forecast

Success is: Tech has a real, signed identity with two live, correctly-limited credentials recorded in the ledger; a genuine (not decorative) calling grounded in current build state; a working, isolated harness install that framed correctly on its first real session; and an explicit, unambiguous attended-only posture. The isolation pattern (worktree) and the CLI fix this session lands become reusable — Ops's own P4 session should need neither rediscovered, just applied.

End of prompt.
