# Next-Session Prompt — P4 (agent 3): Growth's calling + credential provisioning

**Stream:** founder (AO program — P4, the third agent-provisioning session; it reuses the pattern Tech's and Ops's sessions settled).
**Tier:** split, per plan §3-P4 — `governance` for the calling draft, **`code-critical` for the credential mint + harness install + verification**. Follow the full Critical Change Protocol (six elements: what's changing, what could break, what happens to existing sessions, rollback plan, verification step, explicit founder approval) for every live step.
**Governing frame:** `/adopted/standing-protocol-cache.md` §"Critical-risk sessions".
**Predecessor session:** `operations/handoffs/founder/2026-07-22-P5b-growth-permissions-matrix-row-CLOSE.md` (the session that drafted and signed Growth's row) and, for the settled provisioning pattern, `operations/handoffs/founder/2026-07-21-P4-agent2-ops-calling-and-provisioning-CLOSE.md` (read the pattern this session should reuse almost verbatim).
**Predecessor decision-log entries:** `D-P5B-GROWTH-PERMISSIONS-MATRIX-ROW-SIGNED` (including its same-session addendum, which resolved the two open questions this prompt folds in below); `D-P4-AGENT2-OPS-CALLING-AND-PROVISIONING-2026-07-21`.
**Risk classification:** Standard for the calling draft (documents only); **Critical for the mint + install + verification** — AC7 + PR6 + PR17 all engage there. Nothing in this prompt pre-approves the mint or install; the founder runs every live command live.

## Why this session matters, and what NOT to re-derive

Growth's matrix row is already signed (`operations/agent-org-2026-07/P5-permissions-matrix.md` §3 Row 3), grounded in its own real remit rather than the Tech/Ops template — do not re-derive that grounding here, just read it. The provisioning *pattern* itself was fully worked out — sometimes the hard way — across Tech's and Ops's sessions, and Ops's session ran it a second time cleanly. **Reuse it; do not rediscover it:**

1. **Harness isolation:** a git worktree, same as Tech's and Ops's. `git worktree add ../sagereasoning-growth -b agent-org-growth`. No election needed — this is the confirmed approach.
2. **The CLI limit-flag fix is already merged** (`website/src/lib/admin-mint/mint-credential-core.ts`, `buildPracticeMintPlan` now reads `--monthly`/`--daily`/`--chain`). Do not re-diagnose this — just use the flags directly.
3. **The owner-email mint-planning lesson — apply this correctly from the start, don't rediscover it live:** mint the **consult** credential WITHOUT `--owner-email` (owner-less, agent-bound only). Mint the **write** credential WITH `--owner-email` (owner-bound). Passing `--owner-email` on BOTH will collide on the `api_keys_upc_owner_agent_active_uniq` partial-unique index and the second mint will 500. This bit Tech's session directly; Ops's session applied it correctly from the start — do the same here.
4. **Verification — use the direct hook-invocation method as PRIMARY, not the GUI.** A model can confabulate a perfectly plausible-looking Gate-1 frame block without one ever actually firing (confirmed via a production DB query showing zero new rows in Tech's session). **Any GUI-session claim of a frame having fired MUST be verified server-side** (`agent_assessment_history` / `loop_billing_events` filtered on the credential's exact id) before being trusted. See memories `claude-code-desktop-worktree-session-routing` and `model-confabulates-plausible-harness-output`. The direct hook-invocation proof (invoking `framing-hook.mjs` from inside the worktree with `env` read from that worktree's own `settings.local.json` and a simulated `UserPromptSubmit` stdin payload) is the recommended, reliable path — treat a genuine GUI session as optional, not a blocker, exactly as Ops's session did.
5. **Credential hygiene:** never ask the founder to paste raw credential values into chat. Give exact file-edit instructions (placeholders in `settings.local.json`) for the founder to fill in themselves, off-transcript.
6. **Traffic tagging:** any TEST or direct-hook-proof consult is verification/smoke traffic — tag it explicitly at close, per plan §2.
7. **DO NOT touch `harness/gate1-pre-decision/claude-code/hooks/hooks.json` this session** — specifically, do not add WebSearch/WebFetch to the H3 consult-trigger matcher (`Bash|Edit|Write|MultiEdit|NotebookEdit`). This was explicitly considered and deferred at the P5b session (`D-P5B-GROWTH-PERMISSIONS-MATRIX-ROW-SIGNED` addendum): the matcher is shared harness-wide (a change would touch Tech's and Ops's installs too), a change now would be speculative (no usage data exists yet), and the trigger's existing target — state-changing, potentially irreversible actions — is arguably already the right shape, since Growth's judgment calls crystallize when something is written down, not when a page is fetched. **If this session's own results make the founder want to revisit that,** treat it as its own separate, later, scoped harness-code session — not a rider on this one.
8. **Schedule the spend-envelope usage check-in — do not skip it.** Growth's `120/10/1` envelope (both credentials) was set at P5b as a reasoned default, explicitly not a measured one, with a prediction that actual utilization will run below Tech's/Ops's (WebSearch/WebFetch never bills a consult). **This session's own close should not just mint and move on** — name the concrete follow-up explicitly: after Growth's first week or two of real attended use, run `mint-credential.ts list` (or the equivalent usage query) and record actual daily/monthly utilization against the `120/10` ceiling. Expected outcome is confirmation of comfortable headroom, not a need to adjust — but it must actually be checked and recorded, not assumed a second time.

## Part A — Open under the protocol

Read in order:
1. `/adopted/standing-protocol-cache.md` (~3 min).
2. `operations/handoffs/founder/2026-07-22-P5b-growth-permissions-matrix-row-CLOSE.md` — the session that signed Growth's row and resolved both open questions.
3. `operations/handoffs/founder/2026-07-21-P4-agent2-ops-calling-and-provisioning-CLOSE.md` — the provisioning-pattern template this session reuses almost verbatim.
4. `operations/agent-org-2026-07/P5-permissions-matrix.md` §3 Row 3 (Growth) and §6 (sign-off record).
5. `operations/agent-org-2026-07/P1-agent-roster-gap-analysis.md` §3, §4 recommendation 3 (the founder-drafts/Growth-reviews content-workflow framing — **do not narrow Growth's calling to review-only**; the founder explicitly chose the uniform, non-narrowed Gate-1-harness posture at P5b, declining a review-sessions-only variant, so the calling should cover both content drafting/reviewing and competitive-intel research), and §5 (Growth's ranked-order rationale: "moderate" org-urgency, "moderate" evidence-dividend fit).
6. `operations/handoffs/growth/growth-wiring-fix-close.md` — Growth's own real-remit grounding (the actions-log/market-signals context channels already Wired on the older founder-hub persona; the sparse-state disclosure pattern; the process gaps this session's calling should be aware of, not duplicate).
7. `operations/agent-org-2026-07/credential-ledger.md` — current state (Tech's 3 rows + Ops's 2 rows already present; Growth's rows land this session).
8. `harness/gate1-pre-decision/KILL-SWITCHES.md` (Layer 4, unchanged since Tech's and Ops's sessions).
9. Memories: `claude-code-desktop-worktree-session-routing`, `model-confabulates-plausible-harness-output`, `test-admin-needs-profiles-row`, `prod-mint-needs-prod-admin-jwt`.

Confirm at open: tier; hold-point P0 0h (active); model selection N/A; status vocabulary; signals/risk classification (Critical for the mint/install/verify steps).

## Part B — Procedure

### Step 1 — Create Growth's worktree (Standard risk; no election needed, pattern already confirmed)
```
cd /Users/clintonaitkenhead/Claude-work/PROJECTS/sagereasoning
git worktree add ../sagereasoning-growth -b agent-org-growth
```

### Step 2 — Draft Growth's calling (governance; documents only)
Per plan §3-P4(a): grounded in Growth's own real remit (P1 §3/§4 recommendation 3/§5; `growth-wiring-fix-close.md`), **not** copy-pasted from Tech's or Ops's. Growth's real work spans **both** content drafting/reviewing (P1 §3/§5: "drafting blog/social content") and competitive-intel/market-signal research (WebSearch/WebFetch-heavy, per the P5b row's own finding) — the calling should not artificially narrow to just one, since the founder explicitly chose the uniform, non-narrowed operating-surface option at P5b. Include the same mandatory "load current build-state first" precondition (Tech's and Ops's callings are good templates for the *shape* of this section, not its content). **Explicitly state in the calling itself** that sparse or low consult activity on research-heavy days is expected and healthy, not a defect — mirroring the row's own disclosed asymmetry (H3 doesn't fire on WebSearch/WebFetch), so a future reader of Growth's trust record doesn't misread a thin day as something wrong. Save as `operations/agent-org-2026-07/growth-calling-v1.md`.

### Step 3 — Election + Critical: mint Growth's credentials (founder-walked, PR17)

Confirm the identity string via AskUserQuestion (recommend `sagereasoning:org-growth@v1`, matching the matrix's own illustrative example — do not assume without asking). Confirm the owner-email (recommend `clintonaitkenhead@gmail.com`, matching every prior operator mint — still worth a quick confirm).

Present the full Critical Change Protocol (what's changing: two new additive `api_keys` rows under the confirmed identity, `[consult]` at 120/mo·10/day and `[accreditation_write, calling, reflect]` at 120/mo·10/day, per the signed matrix row Row 3 — **same limits as Ops's, not Tech's 150/15**; what could break: nothing existing; rollback: revoke, instant; verification: `list`) and get explicit approval before running anything.

**TEST-first is optional** (the CLI fix and the owner-email pattern are both proven twice now; ask the founder rather than assume). If TEST-first is chosen, remember: TEST's `profiles` table is separately-provisioned from prod's — the write-class TEST mint will 400 honestly if the operator email isn't there (not a defect; skip or provision the row, founder's call).

**Mint commands (adjust TEST/prod targeting per the founder's choice; own-email on write only, per the lesson above):**
```
npx tsx scripts/mint-credential.ts \
  mint practice --label "org-growth consult" \
  --capabilities consult \
  --agent-id sagereasoning:org-growth@v1 \
  --monthly 120 --daily 10

npx tsx scripts/mint-credential.ts \
  mint practice --label "org-growth write" \
  --capabilities accreditation_write,calling,reflect \
  --agent-id sagereasoning:org-growth@v1 \
  --owner-kind operator \
  --owner-email clintonaitkenhead@gmail.com \
  --monthly 120 --daily 10
```
(Prefix with `MINT_CLI_BASE_URL=https://www.sagereasoning.com MINT_CLI_ADMIN_JWT=<fresh JWT from the founder's own logged-in browser session>` for prod — get a fresh JWT even if one was used recently.)

Verify via `list`, update `credential-ledger.md` (append rows — Growth's are the 6th–7th rows, following Tech's 3 + Ops's 2).

### Step 4 — Harness install in Growth's worktree (Critical)
Same pattern as Tech's and Ops's: `discernment.config.json` filled with Growth's real purpose/kathekonta/circle (drawn from Step 2's calling document); `settings.local.json` with the canonical H1–H5 hooks block + placeholders for the two raw credential values (founder fills in directly, off-transcript) + `GATE1_STATE_DIR=/Users/clintonaitkenhead/.sage-gate1-growth` (a fourth, distinct state directory — never reuse the founder's own, Tech's, or Ops's).

### Step 5 — Verify the wiring (direct hook-invocation, primary method)
Write a small script (mirroring Tech's and Ops's own hook-proof pattern) that reads Growth's `settings.local.json` env block, simulates a `UserPromptSubmit` stdin payload, and invokes the actual `framing-hook.mjs` file inside Growth's worktree directly. Confirm exit 0, a genuine frame in the output quoting Growth's own declared purpose verbatim, and `~/.sage-gate1-growth/gate1.log` showing a fresh `FRAMED` entry. This alone is sufficient — do not treat a GUI attempt as required; any GUI success claim must be verified against production's `agent_assessment_history`/`loop_billing_events` before being trusted, per the confabulation finding above.

### Step 6 — Confirm attended-only posture
State explicitly: Growth's default posture is attended-only. Nothing in this session activates unattended operation.

### Step 7 — Confirm the H3 matcher and spend envelope are left untouched, and name the check-in
Explicitly note in the close: `hooks.json`'s consult-trigger matcher was not modified this session (per item 7 above); the spend-envelope usage check-in (item 8 above) is scheduled for after Growth's first week or two of real use, not performed here (there will be essentially no usage yet at the moment of provisioning).

### Step 8 — Decision-log entry + session close (full Critical form)
Cite `/adopted/standing-protocol-cache.md` §"Critical-risk sessions"; include Verification Method Used, Risk Classification Record, PR5 Knowledge-Gap Carry-Forward, Founder Verification, Orchestration Reminder.

## Part C — Anticipated session shape

Should run at roughly Ops's pace — no CLI fix to build, no isolation election to make, no mint-planning mistake to make-and-correct (all three already paid down). The calling draft may take slightly longer than Ops's did, since Growth's remit genuinely spans two different kinds of work (drafting/reviewing content and researching) rather than one uniform shape.

| Phase | Estimate |
|---|---|
| Opens reads | 20–25 min |
| Step 1 — worktree | 5 min |
| Step 2 — calling draft | 30–40 min |
| Step 3 — election + Critical mint | 25–35 min |
| Step 4 — harness install | 15–20 min |
| Step 5 — direct-hook verification | 15–20 min |
| Step 6 — attended-only confirmation | 5 min |
| Step 7 — matcher/envelope confirmation | 5 min |
| Decision-log + close | 30–40 min |
| **Total** | **~2.5–3.5 hours** |

## Rollback path
Steps 1–2 trivially reversible (`git worktree remove`; `git revert` the calling document). Steps 3–4 roll back by revoking both credentials (instant, `KILL-SWITCHES.md` Layer 4). No schema, flag, or existing-credential change occurs anywhere in this session — and per item 7 above, `hooks.json` itself is not touched, so there is nothing harness-wide to roll back either.

## Forecast
Success is: Growth has a real, signed identity with two correctly-limited live credentials in the ledger; a genuine calling grounded in its own dual remit (drafting/reviewing *and* research, not narrowed to either); a working, isolated harness install verified via the direct-hook method; an explicit attended-only posture; the H3 matcher question left deliberately untouched with its reasoning restated, not silently revisited; and a concrete, dated usage check-in named for the near future rather than left as an open-ended "someday." This completes P4's rollout of all three org agents with signed matrix rows (Tech, Ops, Growth). Support (agent 4) remains separately deferred, gated on the founder's own ring-vs-Gate1 decision — unchanged by this session.

End of prompt.
