# Next-Session Prompt — Gate-1 Full-Loop Harness (Slice 5b): install H3 + H4 live + verify the four behaviours

**For the founder. Paste as the first message of a fresh session.**

**Stream:** founder.
**Tier:** **`code-critical`** — full Critical Change Protocol (0c-ii). Installing H3 + H4 makes them fire **real prod** `/api/reason` consults + `/api/guardrail` gates + `/api/practice/reflect` opens + `/api/accreditation` writes, and **H3's guard can BLOCK tool calls** in a real loop. **AC7 + PR6 engaged.** Every prod step is the founder's (PR17); the AI guides + verifies.
**Governing frame:** /adopted/standing-protocol-cache.md.
**Governing design:** `adopted/adr/2026-06-20-pre-decision-harness-arc2.md` — the **2026-06-21 amendment, §"Slice 5b — activate"** (+ D-A…D-F). Read it first.
**Predecessor decision-log entry:** `D-SAGE-PRACTICE-GATE1-FULL-LOOP-HARNESS-SLICE5A-BUILT-TEST-VERIFIED` (H3/H4 built dark + battery-green + adversarially reviewed).
**Predecessor close:** `operations/handoffs/founder/2026-06-21-gate1-full-loop-harness-slice5a-built-test-verified-close.md`.

## Why this session matters

H1 + H2 (the pre-decision frame) are Live and dogfooded. H3 (at-action: guard + score + iterate) and H4 (close: reflect-initiate + accreditation write) are **built dark, battery-green (logic 53/0, battery 108/0), and adversarially hardened** — but **inert** (registered, not installed). This session installs them in a real loop and **live-verifies the four behaviours**, making the installed environment invoke the practice at *every* stage deterministically — the gap the bare-into-harness test exposed. After this, the harnessed-vs-bare value comparison can run on the *real* product. The close-event contract (`Stop` initiates via `decision:block`) is **doc-confirmed but unexercised** — this session confirms it first-hand (`GATE1_DEBUG`), per the Slice-2 lesson.

## Critical Change Protocol (state these at open; get explicit founder approval per named risk)

1. **What is changing:** install H3 (`PreToolUse` on `Bash|Edit|Write|MultiEdit|NotebookEdit`) + H4 (`Stop`) into a Claude Code loop via a gitignored `.claude/settings.local.json` (+ the env block), so they fire real prod calls and H3's guard can deny tool calls.
2. **What could break / the named risks:**
   - **Guard over-block** — H3 sends irreversible-pattern Bash to `/api/guardrail`; a `do_not_proceed` **denies the tool call** in your live loop. Mitigate: verify in a **dedicated test project/session, NOT your main working loop** (so a block can't disrupt real work); start with the open fail-modes.
   - **Marker clobber** — H4's accreditation write must use a **NON-marker** credential bound to a **fresh test `agent_id`**, never `sagereasoning:gate1-dogfood@v1`. Mitigate: name the marker via `SAGE_GATE1_MARKER_CREDENTIAL` (the guard then refuses it by identity) + a distinct test `agent_id`. (The Slice-5a review hardened this; we test it lands.)
   - **Latency / noise** — a Gate-2 consult rides each distinct consequential decision (deduped); H4 forces one reflect turn at session close. Acceptable in a test loop; reviewed before any main-loop install.
3. **What happens to existing sessions:** H1/H2 unchanged (byte-identical). The desktop build **hot-reloads hooks mid-conversation** (memory [[claude-code-desktop-app-hook-env]]), so the new hooks take effect on the next prompt without a restart.
4. **Rollback:** remove the H3/H4 `hooks` blocks (+ the H3/H4 env vars) from `settings.local.json`; revoke the test accred credential + delete its `agent_accreditation` row (+ any reflect session). H1/H2 + the standing marker are untouched throughout.
5. **Verification:** the four live behaviours below + the `Stop` stdin capture.
6. **Approval:** the founder approves each named risk before any install/mint.

## Pre-conditions
1. Slice 5a committed + pushed (done); gates green (`logic-harness` 53/0, `negative-battery` 108/0). Re-run them at open.
2. **A NON-marker test credential** (minted in Step 2): a fresh UPC bound to a **fresh K1-canonical test `agent_id`** (e.g. `sagereasoning:gate1-loop-test@v1`), capabilities `consult,accreditation_write,reflect`. Prod mint needs a prod admin JWT — memory [[prod-mint-needs-prod-admin-jwt]] (anon key ≠ admin); the agent_id must be canonical or the accreditation write 400s — memory [[upc-mint-vs-accreditation-agent-id]].
3. `SAGE_REFLECT_ENABLED=true` in prod (it is — SR-13 is Live) so the reflect open succeeds.
4. A **dedicated test project dir** (or a throwaway worktree) for the live-verify, so a guard block can't interrupt real work. 0h remains held.

## Part A — Open under the protocol
Read in order:
1. /adopted/standing-protocol-cache.md (§Critical-risk sessions; model N/A — hooks are deterministic JS; status vocab; risk class).
2. `adopted/adr/2026-06-20-pre-decision-harness-arc2.md` — the 2026-06-21 amendment, esp. §"Slice 5b — activate" + D-A…D-F.
3. The Slice-5a close (above) + the decision-log entry `D-SAGE-PRACTICE-GATE1-FULL-LOOP-HARNESS-SLICE5A-BUILT-TEST-VERIFIED`.
4. `harness/gate1-pre-decision/README.md` — the config table (the H3/H4 env vars), the "Stop"/close-event wire contract, and the "Slice 5b" scope boundary.
5. Memories: [[claude-code-stop-close-hook-contract]] (the close-event contract — confirm live), [[prod-mint-needs-prod-admin-jwt]], [[upc-mint-vs-accreditation-agent-id]], [[claude-code-desktop-app-hook-env]].

Confirm at open: tier (code-critical); the Critical Change Protocol stated; status vocab; 0h held.

## Part B — Procedure (founder-walked; PR17)

### Step 1 — Confirm the build + gates
- Re-run both gates green. `node --check` the four hook scripts. Confirm `git status` shows the Slice-5a commit is in (nothing dark left uncommitted).

### Step 2 — Mint the non-marker test credential (prod, founder-walked)
- With a prod admin JWT (`MINT_CLI_ADMIN_JWT`), mint a UPC for a **fresh** `agent_id` (`sagereasoning:gate1-loop-test@v1`), capabilities `consult,accreditation_write,reflect`, raise limits for a multi-call walk (e.g. 200/5000). Record the token + id. **This is NOT the marker** — it must differ from `sagereasoning:gate1-dogfood@v1`.

### Step 3 — Capture the real `Stop` stdin (the genuine unknown — PR11/PR12)
- In the test project, install **H4 only** first, with `GATE1_DEBUG=1`. End a turn → read `<stateDir>/Stop-stdin.json`. Confirm first-hand: the field names (`session_id`, `stop_hook_active`, …) and that emitting `{"decision":"block","reason":…}` **initiates another model turn** (the `reason` becomes the next instruction). If `decision:block` does NOT initiate a turn in this build, set `GATE1_REFLECT_INITIATE_MODE=context` (the documented fallback) and record the finding. Update the README wire-contracts section + the close with what stdin actually carried.

### Step 4 — Install H3 + H4 in the test loop
- Add to the test project's `.claude/settings.local.json`: the H3 (`PreToolUse` consequential matcher) + H4 (`Stop`) hook blocks (use `claude-code/hooks/hooks.json` as the shape, with absolute paths or `${CLAUDE_PROJECT_DIR}`), and the `env` block:
  - `SAGE_GATE1_CREDENTIAL` = a consult credential (the test UPC, or the standing marker — consults don't clobber).
  - `SAGE_GATE1_ACCRED_CREDENTIAL` = the test UPC (non-marker), `SAGE_GATE1_AGENT_ID` = the test agent_id.
  - `SAGE_GATE1_MARKER_CREDENTIAL` = the standing marker token (so H4's guard refuses it).
  - `SAGE_GATE1_REFLECT_CREDENTIAL` = the test UPC (has `reflect`).
  - `GATE1_PROVENANCE_ENABLED=true`, `GATE1_ENDPOINT` = prod `/api/reason`, `GATE1_STATE_DIR` = a test dir.
  - Start with `GATE1_FAIL_MODE=open` + `GATE1_GUARD_FAIL_MODE=open` (don't brick the loop on an outage).

### Step 5 — Live-verify the four behaviours
1. **Guard blocks a destructive action** — in the test loop, have the agent attempt a deliberately harmless-but-pattern-matching irreversible command (e.g. `rm -rf /tmp/sage-gate1-test-throwaway`); confirm H3 calls `/api/guardrail` and, on a `do_not_proceed`, the tool call is **denied** (`gate1.log`: `GUARD-BLOCK`). Confirm a benign command (`git push origin main`) is **not** blocked.
2. **A mid-task consult opens/closes a loop** — a consequential Edit/Write fires a Gate-2 consult (`gate1.log`: `CONSULT … loop=opened`); after the agent adopts the redirection, a re-examination consult closes it (`loop=closed`). Confirm the at-action frame surfaced.
3. **Reflect initiates at close** — end a session; confirm H4 opened a reflect session + forced the Q1–Q6 turn (`gate1.log`: `CLOSE … reflect=opened`; the agent ran reflect).
4. **An accreditation write lands carrying provenance** — confirm `gate1.log`: `CLOSE … accred=written(N)`, and the public GET on the test `agent_id` reads the seed (the **standing marker row untouched** — re-read `sagereasoning:gate1-dogfood@v1` still `pre_decision_harness`). Confirm the marker-guard fired if you deliberately mis-set the accred slot to the marker (optional negative check).

### Step 6 — Decide standing vs teardown; record
- Founder elects: keep H3+H4 installed in a chosen loop (standing) **or** tear down (remove the hook blocks; revoke the test UPC + delete its accreditation row + reflect session). Either way, record the live findings (esp. the Step-3 `Stop` stdin) in the close + README.

### Step 7 — Decision-log (full Critical form) + close
- Decision-log entry (suggested `D-SAGE-PRACTICE-GATE1-FULL-LOOP-HARNESS-SLICE5B-ACTIVATION`): the four behaviours verified live; the `Stop` stdin confirmed; standing-vs-teardown election; AC7/PR6 walked; test artifacts dispositioned.
- Full Critical close (per the cache) + CLAUDE.md production-state refresh (the harness now fires the full loop in `<the installed loop>`; the standing marker untouched).

## Risk classification
**`code-critical`** — installing the hooks live makes them fire prod consults/gates/writes and **block tool calls** in a real loop (AC7 + PR6, founder-walked). The credential mint + the accreditation write are prod changes on the trust surface. Full Critical Change Protocol; every prod step the founder's (PR17).

## Rollback
Remove the H3/H4 hook blocks + env vars from `settings.local.json` (the hooks stop firing on the next prompt — hot-reload). Revoke the test UPC + delete its `agent_accreditation` row (cascade) + any reflect session. H1/H2 + the standing `pre_decision_harness` marker are untouched throughout. The Slice-5a build is `git revert`-able independently if needed.

## Forecast
Ends with H3 + H4 **Live-verified in a real loop**: a destructive action blocked, a mid-task loop opened/closed, reflect initiated at close, an accreditation write landed on a non-marker test credential (the standing marker untouched), and the `Stop` stdin + `decision:block` behaviour confirmed first-hand. The full 3-hook loop then invokes the practice at *every* stage deterministically — and the harnessed-vs-bare value comparison can finally run on the real product. The 0h call stays the founder's.

End of prompt.
