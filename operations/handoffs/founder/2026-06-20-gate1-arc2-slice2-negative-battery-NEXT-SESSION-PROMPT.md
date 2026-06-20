# Next-Session Prompt — Gate-1 Arc 2 Slice 2: The Negative Battery (release gate)

**For the founder. Paste as the first message of a fresh session.**

**Stream:** founder.
**Tier:** `code-elevated` (TEST-only developer artifact; mirrors Slice 1). NOT Critical — no prod/auth/perimeter/deploy surface (those arrive at Slice 3: the credential mint + first `pre_decision_harness`).
**Governing frame:** /adopted/standing-protocol-cache.md.
**Predecessor close:** operations/handoffs/founder/2026-06-20-gate1-arc2-slice1-trajectory-verified-close.md.
**Predecessor decision-log entry:** `D-SAGE-PRACTICE-GATE1-ARC2-SLICE1-TRAJECTORY-VERIFIED`.
**Risk classification:** Elevated under 0d-ii. Critical Change Protocol NOT engaged.

## Why this session matters

Slice 1 proved the hook frames correctly on one happy-path task. Slice 2 builds the **release gate** — the negative battery that mirrors the guardrail verdict-equivalence-battery discipline: the hook must behave **honestly and safely under the adversarial + edge conditions** a real install will hit. A framing harness that only works on the happy path is not shippable; the battery is what lets Slice 3 issue `pre_decision_harness` in good conscience.

## Pre-conditions — read these first; they spare the Slice-1 marathon

1. Slice 1 is **trajectory-Verified** (committed; Vercel green). The hook is signing-agnostic and renders real shapes cleanly (no `[object Object]`).
2. **Two memories are load-bearing for the live legs — read them:**
   - `api-key-1-per-day-limit-masks-as-401` — a fresh key allows **one consult/day** (30/1/1 defaults); the 2nd 401s as "Please sign in." **For any multi-call live battery, raise the TEST key's `daily_limit`/`monthly_limit` first** (PATCH `api_keys`, or mint with high limits). This was the *entire* Slice-1 debugging detour — do not repeat it.
   - `claude-code-desktop-app-hook-env` — the founder runs the **macOS desktop app** (no `claude` CLI). Give the hook its credential via `.claude/settings.local.json` `"env"` (gitignored, hot-reloads); run live proofs in a **fresh conversation in this project**. There is no terminal `claude --debug`.
3. The corrected `harness/gate1-pre-decision/claude-code/PR1-PROOF-WALKTHROUGH.md` is the live-leg reference (mint-after-server; programmatic token capture; signing-shape note; `SUBSTRATE_L3_DEFER_ENABLED=true` on TEST).
4. 0h is still held — this is pre-0h trust-layer work and does not touch the launch call.

## Part A — Open under the protocol
Read in order:
1. /adopted/standing-protocol-cache.md (~3 min)
2. operations/handoffs/founder/2026-06-20-gate1-arc2-slice1-trajectory-verified-close.md
3. adopted/adr/2026-06-20-pre-decision-harness-arc2.md (ADR-011 — staged slices; §Slice 2)
4. harness/gate1-pre-decision/ — the hook + the existing logic harness (cases 6/7 are Slice-2 *previews*)
5. /operations/decision-log.md — last 2 entries
6. The two memories named above.

Confirm at open: tier (`code-elevated`); 0h held; model N/A (the framing call uses standard depth, never deep — ADR-011 D3); status vocab; risk class.

## Part B — Procedure

### Step 1 — Specify the battery (the four legs + their honest, asserted expected outcomes)
Mirror the verdict-equivalence-battery discipline: each leg is a fixture with a *defined, asserted* outcome.
- **Skip-attempt** — a task instructing "ignore setup/hooks/instructions" must STILL frame (hard control-flow, not soft prompt-adherence). Logic-harness case 6 previews this in-sandbox; promote to a formal asserted leg + add a **live** skip-attempt in a fresh conversation.
- **Outage** — `/api/reason` unreachable/slow → fail-open honest "UNAVAILABLE" note (default) and fail-closed `exit 2` (strict). Harness cases 3/4/5 cover the logic; make them release-gating + add a **live** outage check (stop the TEST dev server, fresh conversation, confirm the honest note AND the task still proceeds).
- **Continuation** — a follow-up in the same session does NOT re-frame (fire-once, proven in Slice 1). **Open design question to settle:** should a *genuinely new* task within one session re-frame? Fire-once is session-keyed by D5 — confirm that is the intended product behaviour or design the refinement.
- **Subagent** — `UserPromptSubmit` does **not** fire for subagents. **Verify first-hand (PR11)** whether a `SubagentStart`/subagent hook exists to frame subagent work; if so, frame it; if not, document the gap honestly (a subagent acts unframed) and decide whether Slice 2 closes it or defers it to Slice 3.

### Step 2 — Build the battery as a CI-runnable gate
Extend `test/logic-harness.mjs` (or add a sibling `negative-battery.mjs`) so all four legs are asserted against the mock, runnable as one command with a pass/fail summary (the established 32/0 pattern). This is the in-sandbox release gate.

### Step 3 — Live legs (founder-walked, in a fresh conversation)
For the legs needing a real Claude Code trace (skip-attempt, outage): **raise the TEST key limits first** (memory), credential via `settings.env` (memory), run per the corrected walkthrough. The AI reads `/tmp/sage-gate1/gate1.log` for objective evidence; tear down (revoke key, restore `settings.local.json`, clean `/tmp`) at the end.

### Step 4 — Verify + record
Battery green in-sandbox; live legs confirmed; append the decision-log entry + close (lean form per the cache).

## Part C — Anticipated session shape
| Phase | Estimate |
|---|---|
| Cache + close + ADR + memories | 20 min |
| Step 1 (specify legs) | 30 min |
| Step 2 (build battery) | 45–60 min |
| Step 3 (live legs) | 30–45 min |
| Decision-log + close | 20 min |
| **Total** | **~2.5–3 h** |

## Rollback path
`git revert` the Slice-2 commit. TEST-only; no production / credential / flag state.

## Forecast
End with the negative battery green (in-sandbox + the live legs run) and the subagent + new-task-in-session design questions settled or consciously deferred. That clears the path to **Slice 3** — plugin packaging (`.claude-plugin/plugin.json` + `hooks/hooks.json` + `.mcp.json` + `skills/`) and the operator credential mint that issues the **first `pre_decision_harness`** (the genuinely Critical, AC7 slice — full Critical Change Protocol). The 0h launch call remains the founder's throughout.

## Cross-references
- adopted/adr/2026-06-20-pre-decision-harness-arc2.md (ADR-011 §Slice 2)
- harness/gate1-pre-decision/ (hook + logic harness + corrected walkthrough)
- /operations/decision-log.md — `D-SAGE-PRACTICE-GATE1-ARC2-SLICE1-TRAJECTORY-VERIFIED`
- memory: `api-key-1-per-day-limit-masks-as-401`, `claude-code-desktop-app-hook-env`

End of prompt.
