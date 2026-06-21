# Session Close — 2026-06-21 — Gate-1 Full-Loop Harness (Slice 5a): H3 + H4 built dark, battery-green

**Stream:** founder.
**Governing frame:** /adopted/standing-protocol-cache.md (full governance) + `adopted/adr/2026-06-20-pre-decision-harness-arc2.md` (ADR-011, the 2026-06-21 full-loop amendment).
**Tier:** `code-elevated` — Elevated risk. Repo-only / dark; no live-fire. AC7 not engaged; PR6 not engaged.
**Date:** 2026-06-21.

## What happened

Built **H3 (at-action) + H4 (close)** — the two new full-loop hooks — **DARK + battery-green + adversarially reviewed**, extending the Gate-1 harness from the pre-decision frame (H1/H2, Live) to the dossier's whole task-bearing loop. No install, no production change; `git revert` undoes everything.

- **H3** (`at-action-hook.mjs`, `PreToolUse` on `Bash|Edit|Write|MultiEdit|NotebookEdit`): the R5 cadence — **guard** (block a genuine `do_not_proceed` on an irreversible action via `/api/guardrail`; fail-open-honest on outage, configurable strict) + **score** (deduped Gate-2 `/api/reason` consult, injected as context, never blocks) + **iterate** (loop-closure carries `prior_feedback` at the same depth, mirroring the LIVE CI-4 `analyseLoopClosure`).
- **H4** (`close-hook.mjs`, `Stop`): **reflect-initiate** (open `/api/practice/reflect` + force the Q1–Q6 turn via `decision:block`; model-driven; honest partial) + **accreditation write** (carry the session's accumulated signed assessments; R18f) on a **non-marker** credential, never the standing marker.
- New shared modules `lib/loop-closure.mjs` + `lib/session-state.mjs`; `framing-core.mjs` extended with opts/flag-gated additions (`GATE1_PROVENANCE_ENABLED` default off ⇒ **LIVE H1/H2 behaviourally byte-identical**, battery-asserted).
- **Close-event contract confirmed (Step 1):** `Stop` (not `SessionEnd`) — only `Stop` can initiate a turn; loop-guarded by `stop_hook_active` + a fire-once marker. Doc-confirmed; the live `GATE1_DEBUG` capture is a Slice-5b step.
- **Adversarial review (7-dim/10-agent):** 4 claims hold; **5 findings folded + re-verified** — 1 HIGH marker-credential guard (now refuses by **named** marker identity, `SAGE_GATE1_MARKER_CREDENTIAL`), 2 HIGH + 1 MEDIUM guard-coverage misses (`rm -r -f` / `rm --recursive --force`, `vercel --prod` boundary bug, `git push +ref`, bare `truncate` — all now block; 26/26 destructive forms covered, 14/14 benign allowed), 1 LOW loop-closure overclaim (softened + `abandonedRefs` surfaced).

## Decisions Made
- `D-SAGE-PRACTICE-GATE1-FULL-LOOP-HARNESS-SLICE5A-BUILT-TEST-VERIFIED` appended. H3 + H4 built dark + battery green; repo-only; founder elections recorded; Slice 5b staged.

## Status Changes
| Item | Old | New |
|---|---|---|
| H3 (`at-action-hook.mjs`) | — | Verified (in repo); built dark, not installed |
| H4 (`close-hook.mjs`) | — | Verified (in repo); built dark, not installed |
| `lib/loop-closure.mjs`, `lib/session-state.mjs` | — | Verified (in repo) |
| `framing-core.mjs` (shared) | Live (H1/H2) | extended (opts/flag-gated, default-off byte-identical) |
| negative-battery | 56/0 | **108/0** (RELEASE GATE: PASS) |
| logic-harness | 32/0 | **53/0** |

## Next Session Should — **Slice 5b (`code-critical`/AC7, founder-walked, PR17)**
Install H3 + H4 in a real loop on a **non-marker** credential and live-verify the four behaviours. This is the Critical activation (the hooks fire prod consults/gates/writes and **block tool calls** in a real loop). Procedure:
1. **Mint a non-marker `accreditation_write` credential** bound to a fresh loop `agent_id` (K1-canonical `namespace:name@version`) — NOT the standing `sagereasoning:gate1-dogfood@v1` marker. Set its env at install: `SAGE_GATE1_ACCRED_CREDENTIAL`, `SAGE_GATE1_AGENT_ID`, and **name the marker** `SAGE_GATE1_MARKER_CREDENTIAL` (the standing dogfood credential) so H4's guard refuses it by identity. The `reflect` capability is needed on the reflect credential (defaults to the accred credential).
2. **Capture the real `Stop` stdin** (`GATE1_DEBUG=1`) and confirm first-hand: the field names (`stop_hook_active` etc.) and that `{"decision":"block","reason":…}` **initiates a model turn** (the Slice-2 lesson — don't trust the docs alone). If `decision:block` doesn't initiate, fall back to `GATE1_REFLECT_INITIATE_MODE=context`.
3. **Live-verify the four behaviours:** (a) a destructive action (`rm -rf …` / `vercel --prod`) is **blocked** by the guard; (b) a mid-task consult fires + a redirection opens/closes a loop; (c) reflect initiates at session close; (d) an accreditation write lands carrying the session's provenance — on the non-marker credential, the standing marker untouched.
4. Tear down the Slice-5b test artifacts (or keep, per the founder's call). Full Critical Change Protocol; every prod step the founder's.

Prompt to write at 5b open if desired; the spec above + the README "Slice 5b" boundary + ADR-011 §"Slice 5b — activate" are sufficient.

## Blocked On
**Files remaining uncommitted (all under `harness/gate1-pre-decision/` + the decision log + this close):**
- `claude-code/hooks/at-action-hook.mjs` (new), `claude-code/hooks/close-hook.mjs` (new)
- `claude-code/hooks/lib/loop-closure.mjs` (new), `claude-code/hooks/lib/session-state.mjs` (new)
- `claude-code/hooks/lib/framing-core.mjs`, `claude-code/hooks/hooks.json`, `claude-code/.claude-plugin/plugin.json`, `claude-code/gate1.config.example.json`, `README.md`
- `test/mock-reason-server.mjs`, `test/negative-battery.mjs`, `test/logic-harness.mjs`
- `operations/decision-log.md`, this close

**Production state at session close:** **byte-unchanged.** No Vercel/Supabase/flag/credential change this session. The standing `pre_decision_harness` marker (`sagereasoning:gate1-dogfood@v1`) + the dogfood H1/H2 install are untouched and still Live. H3/H4 are repo-only, registered-but-not-installed. AC7 not engaged.

## Open Questions
- None blocking. The `Stop`-`decision:block`-initiates-a-turn behaviour is doc-confirmed but unexercised → confirmed live at Slice 5b. A degenerate H4 config (no consult credential AND no `SAGE_GATE1_MARKER_CREDENTIAL` named, with the marker pasted into the accred slot) is the one residual the guard cannot catch by value — mitigated by naming the marker at 5b (documented as a precondition).

## Founder Verification
```
cd "/Users/clintonaitkenhead/Claude-work/PROJECTS/sagereasoning"
node harness/gate1-pre-decision/test/logic-harness.mjs       # 53 passed, 0 failed
node harness/gate1-pre-decision/test/negative-battery.mjs     # 108 passed, 0 failed — RELEASE GATE: PASS ✓
git status --porcelain website/src sdk                        # empty — no production source touched
git add harness/gate1-pre-decision operations/decision-log.md operations/handoffs/founder/2026-06-21-gate1-full-loop-harness-slice5a-built-test-verified-close.md
git commit -m "Gate-1 Full-Loop Harness Slice 5a: H3 (at-action) + H4 (close) built dark + battery-green (logic 53/0, battery 108/0); adversarial review folded (marker-guard by named identity, guard coverage, loop-closure); repo-only, no prod change"
```
Then push via GitHub Desktop. **No Vercel rebuild needed for behaviour** (harness is outside the Next build graph); the commit carries scripts + tests + docs only — nothing deploys, nothing fires until Slice 5b.

## Cross-references
- `operations/handoffs/founder/2026-06-21-gate1-full-loop-harness-3hook-build-NEXT-SESSION-PROMPT.md` (this session's prompt)
- `operations/handoffs/founder/2026-06-21-gate1-standing-harness-dogfood-pre-decision-marker-live-close.md` (predecessor — H1/H2 Live)
- `adopted/adr/2026-06-20-pre-decision-harness-arc2.md` (ADR-011, the 2026-06-21 amendment — H1–H4, D-A…D-F, Slice 5a/5b)
- `operations/p1-rebuild-2026-06/sage-practice-grounding-dossier.md` (§4 operating model; B6/B7/B9/B10)
- `harness/gate1-pre-decision/README.md` (full-loop docs + the confirmed wire contracts)
- decision-log: `D-SAGE-PRACTICE-GATE1-FULL-LOOP-HARNESS-SLICE5A-BUILT-TEST-VERIFIED`

*End of session close. H3 + H4 are built dark, battery-green, and adversarially hardened; the full 3-hook loop is ready for the founder-walked Slice-5b activation. The 0h call stays the founder's.*
