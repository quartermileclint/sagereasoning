# Session Close — 2026-06-20 — Gate-1 Arc 2 Slice 3a: subagent hook + plugin packaging

**Stream:** founder.
**Governing frame:** /adopted/standing-protocol-cache.md.
**Tier:** `code-elevated` — Elevated risk (TEST/repo-only; no deployed surface). **AC7 NOT engaged.**
**Date:** 2026-06-20.

## What happened

Opened the Slice-3 prompt as a `code-critical` session, then — at the prompt's own recommendation —
the founder **split Slice 3**:

- **3a (this session, Elevated, repo-only):** the faithful subagent-framing hook + Claude Code plugin
  packaging.
- **3b (its own `code-critical`/AC7 session):** the operator credential mint → the first
  `pre_decision_harness` reaching the Live public accreditation read.

Built **3a** and verified it in-sandbox:

- **`PreToolUse`-on-`Agent` subagent hook** (`claude-code/hooks/subagent-framing-hook.mjs`) — the
  faithful path the Slice-2 finding pointed to. Reads the delegated task at `tool_input.prompt`,
  examines it via `/api/reason`, and **prepends the frame to the subagent's prompt via `updatedInput`**
  so the subagent reasons from it. PreToolUse **can block**, so STRICT is reachable for subagents too
  (correcting the Slice-2 "subagent fail-open only" note). Recursive-loop guard (HTTP fetch can't
  re-trigger a hook + already-framed sentinel skip) + per-spawn fire-once.
- **Shared core** gained an optional `emit` strategy (the UserPromptSubmit path stays byte-identical —
  **logic harness 32/0** unchanged) + `FRAME_SENTINEL`/`shortHash`; stale `SubagentStart` comments
  corrected.
- **Negative battery** restored the subagent leg as **16 real assertions** → **56/0, RELEASE GATE: PASS**.
- **Plugin packaging:** `claude-code/.claude-plugin/plugin.json` + auto-discovered `hooks/hooks.json`
  (both hooks via `${CLAUDE_PLUGIN_ROOT}`, exec form) + a local `.claude-plugin/marketplace.json`.
  **Structure validated** (parses; scripts inside the plugin root; marketplace→plugin linkage; `test/`
  excluded). `.mcp.json`/`skills/` **deferred (PR15)** — the hook is the deliverable.

**The live capture had to move to the close.** The founder elected "build robust now; capture+verify
together at close." I confirmed first-hand *why* live capture can't run in this conversation: Claude
Code **snapshots the hooks block at conversation start**, so a mid-conversation hook registration only
activates in a fresh conversation. (Registered a throwaway capture hook → spawned a subagent → nothing
fired → a manual stdin feed proved the capture script works → only the snapshot blocks it. The capture
hook was then unregistered; settings restored byte-for-byte.) The matcher `Task|Agent` covers both
possible tool names and the hook reads `tool_input.prompt` either way, so the build is robust to the
one unknown the live-verify pins down.

## Decisions Made
- `D-SAGE-PRACTICE-GATE1-ARC2-SLICE3A-SUBAGENT-HOOK-AND-PLUGIN-PACKAGING-BUILT-VERIFIED` appended.

## Status Changes
| Item | Old | New |
|---|---|---|
| Subagent framing (`PreToolUse`-on-`Agent`) | documented finding (deferred) | **built; in-sandbox-Verified** (live-verify at close) |
| Negative battery | 40/0 | **56/0** (subagent leg = 16 real assertions) |
| Claude Code plugin packaging | not started | **built + structure-VALID** (`/plugin install` founder-walked) |
| Logic harness | 32/0 | 32/0 (core refactor behaviour-preserving) |
| `pre_decision_harness` issuance | un-issued | un-issued (first issued at **Slice 3b**) |

## Next Session Should
**Slice 3b — the operator credential mint → the first `pre_decision_harness`** (`code-critical`/AC7,
full Critical Change Protocol), per
`operations/handoffs/founder/2026-06-20-gate1-arc2-slice3b-mint-first-marker-NEXT-SESSION-PROMPT.md`.
The mint→marker→read chain is re-verified first-hand this session (matches ADR-011 D7, no drift) and
carried into that prompt with the exact mint command.

## Blocked On
**Files changed this session (uncommitted — founder commits by name; all repo-only):**
- `harness/gate1-pre-decision/claude-code/hooks/subagent-framing-hook.mjs` (new)
- `harness/gate1-pre-decision/claude-code/hooks/lib/framing-core.mjs` (emit strategy + FRAME_SENTINEL/shortHash + comment fix)
- `harness/gate1-pre-decision/claude-code/hooks/framing-hook.mjs` (comment fix)
- `harness/gate1-pre-decision/claude-code/hooks/hooks.json` (new — plugin hook registration)
- `harness/gate1-pre-decision/claude-code/.claude-plugin/plugin.json` (new — manifest)
- `harness/gate1-pre-decision/.claude-plugin/marketplace.json` (new — local marketplace)
- `harness/gate1-pre-decision/test/negative-battery.mjs` (subagent leg → 56/0)
- `harness/gate1-pre-decision/claude-code/SLICE3-LIVE-VERIFY-WALKTHROUGH.md` (new)
- `harness/gate1-pre-decision/README.md` (Slice-3 rewrite)
- `adopted/adr/2026-06-20-pre-decision-harness-arc2.md` (dated Slice-3a note)
- `operations/decision-log.md` (entry) + this close + the Slice-3b prompt

**Live-verify still owed** (founder, at close — `claude-code/SLICE3-LIVE-VERIFY-WALKTHROUGH.md`):
mint a throwaway TEST key + raise its limits; install the plugin (`/plugin install
sage-gate1-pre-decision@sagereasoning`); in a fresh conversation, delegate to a subagent; confirm
`gate1.log` shows `FRAMED-SUBAGENT`, `PreToolUse-stdin.json` shows the real `tool_name` +
`tool_input.prompt`, and the subagent received the frame; teardown (revoke key, uninstall, `rm -rf
/tmp/sage-gate1`). **Record the confirmed `tool_name`** — it tightens the matcher comment + the 3b prompt.

**Production state at session close:** **byte-unchanged.** Changes touch only `harness/`, the ADR, and
operations docs — all outside the Next build graph. No Vercel env / Supabase / flag / schema /
perimeter change. `pre_decision_harness` un-issued; 0h remains held (pre-0h trust-layer work).

## Open Questions
- The live-verify (plugin install + subagent framing + `tool_name` capture) — founder-walked at close.
- Whether `updatedInput` modifies the subagent's prompt for the subagent-spawn tool — the walkthrough
  confirms; an `additionalContext` fallback is documented if not. Neither blocks Slice 3b.

## Founder Verification
```
cd "/Users/clintonaitkenhead/Claude-work/PROJECTS/sagereasoning"
node harness/gate1-pre-decision/test/logic-harness.mjs        # expect: 32 passed, 0 failed
node harness/gate1-pre-decision/test/negative-battery.mjs      # expect: 56 passed, 0 failed — RELEASE GATE: PASS
node --check harness/gate1-pre-decision/claude-code/hooks/subagent-framing-hook.mjs
git add harness/gate1-pre-decision adopted/adr/2026-06-20-pre-decision-harness-arc2.md operations/decision-log.md operations/handoffs/founder/2026-06-20-gate1-arc2-slice3-plugin-packaging-and-first-marker-NEXT-SESSION-PROMPT.md operations/handoffs/founder/2026-06-20-gate1-arc2-slice3a-subagent-hook-and-plugin-packaging-close.md operations/handoffs/founder/2026-06-20-gate1-arc2-slice3b-mint-first-marker-NEXT-SESSION-PROMPT.md
git commit -m "Gate-1 Arc 2 Slice 3a: PreToolUse-on-Agent subagent hook + Claude Code plugin packaging (battery 56/0); 3b mint deferred to its own Critical session"
```
Then push via GitHub Desktop. Vercel: no build impact — `harness/` is outside `website/`.

## Cross-references
- /operations/decision-log.md — `D-SAGE-PRACTICE-GATE1-ARC2-SLICE3A-SUBAGENT-HOOK-AND-PLUGIN-PACKAGING-BUILT-VERIFIED` (+ predecessor `…SLICE2-NEGATIVE-BATTERY-BUILT-VERIFIED`)
- harness/gate1-pre-decision/claude-code/hooks/subagent-framing-hook.mjs + hooks.json + .claude-plugin/plugin.json
- harness/gate1-pre-decision/.claude-plugin/marketplace.json
- harness/gate1-pre-decision/claude-code/SLICE3-LIVE-VERIFY-WALKTHROUGH.md
- adopted/adr/2026-06-20-pre-decision-harness-arc2.md (ADR-011 §Slice 3 + the dated Slice-3a build note)
- operations/handoffs/founder/2026-06-20-gate1-arc2-slice3b-mint-first-marker-NEXT-SESSION-PROMPT.md (next — Critical)
- memory: `claude-code-desktop-app-hook-env`, `api-key-1-per-day-limit-masks-as-401`, `prod-mint-needs-prod-admin-jwt`, `test-admin-needs-profiles-row`

*End of session close. Slice 3a in-sandbox-Verified (subagent hook + plugin, battery 56/0); live-verify is the founder close-step; the Critical mint + first marker is Slice 3b; production byte-unchanged.*
