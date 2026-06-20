# Gate-1 Pre-Decision Harness — Claude Code surface (Arc 2)

**Status:** Slice 1 (`UserPromptSubmit` framing hook) — trajectory-Verified. Slice 2 (negative-battery
release gate) — in-sandbox-Verified + live legs founder-walked. **Slice 3a (this) — the
`PreToolUse`-on-`Agent` subagent-framing hook + Claude Code plugin packaging — in-sandbox-Verified
(logic 32/0, battery 56/0); the plugin-install + subagent live-verify is founder-walked at close.**
Slice 3b (operator credential mint → the first `pre_decision_harness` marker) is a separate
`code-critical`/AC7 session.
**Governing design:** `adopted/adr/2026-06-20-pre-decision-harness-arc2.md` (ADR-011).
**As of:** 2026-06-20.

## What this is

A developer-installed harness that fires SageReasoning's **Gate 1 examination *before* the agent
reasons** — deterministically, via Claude Code hooks. A self-directed agent forms a view on contact
with a task and runs Gate 1 *after* deciding (Arm-1 evidence), so the examination lands as
post-decision confirmation. A hook fires in the control flow, before the model processes the work, so
the frame is genuinely pre-decision. *"Your CLAUDE.md is a wish; your hooks are a contract."*

Two hooks, same job (examine via `/api/reason`, inject the Stoic frame), different surface:

- **`UserPromptSubmit`** — frames the **top-level** task before the model sees it.
- **`PreToolUse`** matched to the subagent-spawn tool (`Task`/`Agent`) — frames **each delegated
  subagent's** task (`tool_input.prompt`) before the subagent runs, by prepending the frame to the
  subagent's prompt via `updatedInput`. Both can block (strict mode).

## How it works

1. Claude Code runs the hook **before** the model/subagent processes the work.
2. The hook POSTs the raw task to `/api/reason` in **framing posture** (`response_format:"assessment_first"`, `quick`/`standard` — never `deep`, ADR-011 D3).
3. It reads the verdict — signing-agnostic: nested at `assessment.assessment` when Layer-2 signing is ON, or directly at `assessment` when OFF — and renders the Stoic frame (circles of concern, control-filter, passions-to-watch, kathekon, proximity).
4. **Top-level:** the frame is injected as `additionalContext`. **Subagent:** the frame is prepended to the subagent's prompt via `updatedInput`, so the subagent reasons **from** it.

## Directory layout

```
harness/gate1-pre-decision/
├── README.md                              ← this file
├── .claude-plugin/marketplace.json        ← local marketplace listing the plugin (Slice 3)
├── claude-code/                           ← THE PLUGIN ROOT (copied to cache on /plugin install)
│   ├── .claude-plugin/plugin.json         ← plugin manifest (Slice 3)
│   ├── hooks/
│   │   ├── hooks.json                     ← plugin hook registration (both hooks; ${CLAUDE_PLUGIN_ROOT})
│   │   ├── framing-hook.mjs               ← UserPromptSubmit hook (top-level agent)
│   │   ├── subagent-framing-hook.mjs      ← PreToolUse-on-Agent hook (delegated subagents) — Slice 3
│   │   └── lib/framing-core.mjs           ← shared examine/render/fail core (+ GATE1_DEBUG stdin capture)
│   ├── gate1.config.example.json          ← copy to gate1.config.json to override defaults
│   ├── settings.snippet.json              ← standalone .claude/settings.json registration (non-plugin)
│   ├── fixtures/slice1-discretionary-task.md
│   ├── PR1-PROOF-WALKTHROUGH.md            ← Slice-1 founder-walked proof
│   ├── SLICE2-LIVE-LEGS-WALKTHROUGH.md     ← Slice-2 founder-walked live legs (skip-attempt / outage)
│   └── SLICE3-LIVE-VERIFY-WALKTHROUGH.md   ← Slice-3 founder-walked plugin-install + subagent capture/verify
└── test/                                  ← OUTSIDE the plugin root (not shipped)
    ├── mock-reason-server.mjs
    ├── logic-harness.mjs                  ← in-sandbox logic proof (32 assertions)
    └── negative-battery.mjs               ← the release gate (skip / outage / continuation / subagent)
```

## Installing as a Claude Code plugin (Slice 3)

The harness ships as a plugin so a developer installs it once and both hooks register automatically.
**Adding a marketplace does NOT auto-install — install is an explicit step (PR12).**

```shell
# from the repo root, in a Claude Code session
/plugin marketplace add ./harness/gate1-pre-decision        # registers the local marketplace "sagereasoning"
/plugin install sage-gate1-pre-decision@sagereasoning       # explicit install — registers both hooks
```

Local dev alternative (no marketplace): `claude --plugin-dir ./harness/gate1-pre-decision/claude-code`.

**Per-install config is via environment, never bundled.** Set these in your `.claude/settings.json`
(or `settings.local.json`) `"env"` block — the credential must never live in the repo or the plugin:

```json
{ "env": { "SAGE_GATE1_CREDENTIAL": "sr_prac_…", "GATE1_ENDPOINT": "https://www.sagereasoning.com/api/reason" } }
```

(Non-plugin alternative: merge `claude-code/settings.snippet.json` into your settings — but it
registers only the `UserPromptSubmit` hook; the plugin's `hooks/hooks.json` registers both.)

## Configuration

Precedence: **env override > `gate1.config.json` > built-in default.** The credential is **never**
stored in config or code — it is read from an env var.

| Setting | Env override | Default | Notes |
|---|---|---|---|
| Endpoint | `GATE1_ENDPOINT` | `http://localhost:3000/api/reason` | set your hosted endpoint on install |
| Depth | `GATE1_DEPTH` | `standard` | `quick` \| `standard` — `deep` is force-downgraded (D3) |
| Fail mode | `GATE1_FAIL_MODE` | `open` | `open` (honest-log + proceed) \| `strict` (block, exit 2) |
| Timeout | `GATE1_TIMEOUT_MS` | `28000` | under Claude Code's 30s hook kill |
| State dir | `GATE1_STATE_DIR` | `<os-tmp>/sage-gate1` | holds the fire-once markers + `gate1.log` |
| Fire once | `GATE1_FIRE_ONCE` | `true` | top-level: per session; subagent: per spawn (D5) |
| Credential | `SAGE_GATE1_CREDENTIAL` | — | `sr_live_…` / `sr_prac_…` (needs `consult`). **Required.** |
| Debug dump | `GATE1_DEBUG` | (unset) | dumps the raw hook stdin to `<stateDir>/<eventName>-stdin.json` — confirms the exact command-hook wire shape. |

## Fail modes (ADR-011 D4) — both honest (KG1 / R18)

- **`open` (default):** if `/api/reason` is down/slow, the work proceeds **and** the injected context
  states it is **unframed** — never silently treated as framed. No success marker is written, so a
  later turn/spawn may retry once the service recovers.
- **`strict`:** if framing is unavailable, the work is **blocked** (`exit 2`) with an honest stderr
  message. Both hooks can block — `UserPromptSubmit` erases the prompt; `PreToolUse` blocks the spawn.

## Subagents — the faithful build (Slice 3)

`UserPromptSubmit` does **not** fire for subagents, and the `SubagentStart` command-hook stdin carries
**no `prompt`** (Slice-2 finding: `{ session_id, transcript_path, cwd, agent_id, agent_type,
hook_event_name }`) — so it cannot do a task-specific exam and cannot block. The faithful path is a
**`PreToolUse` hook matched to the subagent-spawn tool**: its `tool_input.prompt` carries the
delegated task, and it can block.

`subagent-framing-hook.mjs` examines that prompt and **prepends the frame to it via `updatedInput`**,
so the subagent reasons from the frame. Guarantees:

- **Recursive-loop guard:** the examination is an HTTP `fetch` (not a tool call), so it cannot
  re-trigger the hook; additionally, a prompt that already carries the frame sentinel is **not**
  re-examined.
- **Per-spawn fire-once:** each distinct delegated task is framed once (keyed on session + task);
  an identical re-delegation is not re-consulted.
- **Honest degradation:** an outage (open) prepends an UNAVAILABLE note and allows the spawn; strict
  blocks it. A `PreToolUse` event with no `prompt` fails honestly — never a false "framed".

The exact `tool_name` (`Task` vs `Agent`) is confirmed by the close's live-verify (`GATE1_DEBUG`); the
registered matcher (`Task|Agent`) covers both, and the hook reads `tool_input.prompt` either way.

## Run the in-sandbox gate

```
node harness/gate1-pre-decision/test/logic-harness.mjs       # expect: 32 passed, 0 failed
node harness/gate1-pre-decision/test/negative-battery.mjs     # expect: 56 passed, 0 failed — RELEASE GATE: PASS
```

The **logic harness** proves the `UserPromptSubmit` hook's request construction, frame parsing (signed
+ unsigned shapes, object-valued control_filter/oikeiosis), fire-once, and both fail modes. The
**negative battery** is the release gate (ADR-011 D6): skip-attempt (8), outage (28, both modes ×
503/timeout/malformed/connection-refused), continuation/fire-once (4), and **subagent (16)** — framing
via `updatedInput`, the recursive-loop/already-framed guard, per-spawn fire-once, both fail modes, and
honest no-prompt degradation. Both run against a local mock — **not** the live trajectory proof.

## Scope boundaries

- **Slice 1 (done):** the `UserPromptSubmit` hook + the single-fixture PR1 proof.
- **Slice 2 (done):** the negative battery + the verified subagent finding (live legs founder-walked).
- **Slice 3a (this):** the **`PreToolUse`-on-`Agent` subagent-framing hook** (faithful build) + its
  battery leg (→ 56/0) + **Claude Code plugin packaging** (`.claude-plugin/plugin.json`,
  `hooks/hooks.json`, local `marketplace.json`). Plugin-install + subagent framing are
  founder-walked at close (`SLICE3-LIVE-VERIFY-WALKTHROUGH.md`).
  - **`.mcp.json` + `skills/` deferred (PR15):** the plugin's value is the deterministic
    control-flow *hook*. An MCP consult tool duplicates the already-public `/api/reason` surface, and
    a soft "remember to consult" cadence skill is the very thing the hard hook replaces (ADR-011 D1).
    Neither earns its place in Slice 3; both can be added later if a concrete need appears.
- **Slice 3b (next, `code-critical`/AC7):** the operator credential mint carrying
  `examination_enforcement: pre_decision_harness` → the first `pre_decision_harness` reaching the Live
  public accreditation read.
- **Deferred further:** per-task re-framing within one session; the Agent SDK orchestration surface.

## Wire contracts (verified first-hand, `code.claude.com/docs/en/{hooks,plugins,plugins-reference,plugin-marketplaces}`, 2026-06-20)

**`UserPromptSubmit`** fires before the model; inject via
`{"hookSpecificOutput":{"hookEventName":"UserPromptSubmit","additionalContext":"…"}}` (≤10,000 chars);
`exit 2` blocks + erases the prompt; `matcher` ignored (fire-once lives in the script); timeout 30s.

**`PreToolUse`** fires before a tool executes and **can block** (`exit 2` or
`hookSpecificOutput.permissionDecision:"deny"`). stdin: `{ session_id, transcript_path, cwd,
permission_mode, hook_event_name, tool_name, tool_input }`. We modify the spawn with
`{"hookSpecificOutput":{"hookEventName":"PreToolUse","updatedInput":{…prompt prepended}}}`. The
subagent-spawn tool's `tool_input` carries the task at `.prompt` (with `.description`,
`.subagent_type`); the matcher `Task|Agent` covers both possible `tool_name`s. (The docs do not pin
the subagent tool's exact name — the close's live-verify confirms it; the matcher + `tool_input.prompt`
read are robust either way.)

**Plugin** (`code.claude.com/docs/en/plugins-reference`): `.claude-plugin/plugin.json` (`name` is the
only required field); `hooks/hooks.json` is auto-discovered at the plugin root (same shape as a
settings `hooks` block); `${CLAUDE_PLUGIN_ROOT}` is the plugin's install dir — in hook commands use
**exec form with `args`** so the path passes as one argument unquoted; install **copies** the plugin
dir to a cache, so the plugin must be self-contained (ours is — the hooks + `lib/` are all inside
`claude-code/`). **Marketplace:** `.claude-plugin/marketplace.json` lists the plugin; `/plugin
marketplace add` then **explicit** `/plugin install` (adding a marketplace never auto-installs).

**Slice-2 lesson (carried):** a hook's SDK *callback* input type ≠ its *command-hook* stdin — confirm
command-hook shapes by capturing raw stdin (`GATE1_DEBUG`), not from SDK TS types or docs alone.
