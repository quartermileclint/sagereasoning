# Gate-1 Pre-Decision Harness — Claude Code surface (Arc 2)

**Status:** Slice 1 (`UserPromptSubmit` framing hook) — trajectory-Verified. Slice 2 (the negative
battery release gate) — in-sandbox-Verified (40/0) + live legs founder-walked. Subagent framing is a
**verified finding, deferred to Slice 3** (see "Subagents" below).
**Governing design:** `adopted/adr/2026-06-20-pre-decision-harness-arc2.md` (ADR-011).
**As of:** 2026-06-20.

## What this is

A developer-installed harness that fires SageReasoning's **Gate 1 examination *before* the agent
reasons** — deterministically, via a Claude Code `UserPromptSubmit` hook. A self-directed agent
forms a view on contact with a task and runs Gate 1 *after* deciding (Arm-1 evidence), so the
examination lands as post-decision confirmation. A hook fires in the control flow, before the model
processes the prompt, so the frame is genuinely pre-decision. *"Your CLAUDE.md is a wish; your hooks
are a contract."*

## How it works

1. The user submits a task. Claude Code runs the `UserPromptSubmit` hook **before** the model sees it.
2. The hook POSTs the raw task to `/api/reason` in **framing posture** (`response_format:"assessment_first"`, `quick`/`standard` depth — never `deep`, per ADR-011 D3).
3. It reads the verdict — signing-agnostic: nested at `assessment.assessment` when the deployment has Layer-2 signing ON, or directly at `assessment` when it's OFF — and injects the Stoic frame (circles of concern, control-filter, passions-to-watch, kathekon, proximity) as `additionalContext`.
4. The model reasons **from** the examined frame. It never sees the task un-examined.

## Directory layout

```
harness/gate1-pre-decision/
├── README.md                              ← this file
├── claude-code/
│   ├── hooks/
│   │   ├── framing-hook.mjs               ← UserPromptSubmit hook (top-level agent)
│   │   └── lib/framing-core.mjs           ← shared examine/render/fail core (+ GATE1_DEBUG stdin capture)
│   ├── gate1.config.example.json          ← copy to gate1.config.json to override defaults
│   ├── settings.snippet.json              ← the .claude/settings.json registration block
│   ├── fixtures/slice1-discretionary-task.md  ← the PR1-proof task
│   ├── PR1-PROOF-WALKTHROUGH.md            ← Slice-1 founder-walked proof (reaches trajectory-Verified)
│   └── SLICE2-LIVE-LEGS-WALKTHROUGH.md     ← Slice-2 founder-walked live legs (skip-attempt / outage)
└── test/
    ├── mock-reason-server.mjs             ← local /api/reason stub (assessment_first)
    ├── logic-harness.mjs                  ← in-sandbox logic proof (32 assertions)
    └── negative-battery.mjs               ← the release gate (skip / outage / continuation; + subagent finding)
```

## Configuration

Precedence: **env override > `gate1.config.json` > built-in default.** The credential is **never**
stored in config or code — it is read from an env var.

| Setting | Env override | Default | Notes |
|---|---|---|---|
| Endpoint | `GATE1_ENDPOINT` | `http://localhost:3000/api/reason` | TEST dev server |
| Depth | `GATE1_DEPTH` | `standard` | `quick` \| `standard` — `deep` is force-downgraded (D3) |
| Fail mode | `GATE1_FAIL_MODE` | `open` | `open` (honest-log + proceed) \| `strict` (block, exit 2) |
| Timeout | `GATE1_TIMEOUT_MS` | `28000` | under Claude Code's 30s `UserPromptSubmit` kill |
| State dir | `GATE1_STATE_DIR` | `<os-tmp>/sage-gate1` | holds the fire-once markers + `gate1.log` |
| Fire once | `GATE1_FIRE_ONCE` | `true` | once per session, not per turn (D5) |
| Credential | `SAGE_GATE1_CREDENTIAL` | — | `sr_live_…` / `sr_prac_…` (consult). **Required.** |
| Debug dump | `GATE1_DEBUG` | (unset) | when set, dumps the raw hook stdin to `<stateDir>/<eventName>-stdin.json` — diagnostic for confirming the exact command-hook wire shape. |

## Fail modes (ADR-011 D4) — both honest (KG1 / R18)

- **`open` (default):** if `/api/reason` is down/slow, the task proceeds **and** the injected context
  states the task is **unframed** — never silently treated as framed. The success marker is not
  written, so a later turn may retry once the service recovers.
- **`strict`:** if framing is unavailable, the task is **blocked** (`exit 2`) with an honest stderr
  message. Favours correctness over availability. (`UserPromptSubmit` "Can block? Yes".)

## Subagents — verified finding (framing deferred to Slice 3)

`UserPromptSubmit` does **not** fire for subagents, so a delegated subagent would reason un-framed.
Slice 2 investigated the fix first-hand and captured the **real `SubagentStart` command-hook stdin**:

```json
{ "session_id", "transcript_path", "cwd", "agent_id", "agent_type", "hook_event_name" }
```

It carries **no `prompt`** — so a command/plugin `SubagentStart` hook has nothing to examine and
cannot do a task-specific Gate-1 exam. (The Agent-SDK *callback* type `SubagentStartHookInput` does
carry `prompt`, but that is the SDK path, not the settings.json command-hook stdin.) The faithful,
task-carrying interception is a **`PreToolUse` hook matched to the `Agent` tool** — its `tool_input`
carries the subagent's prompt and it can block — **deferred to Slice 3** (founder-elected), where the
recursive-loop guard belongs anyway. Until then, subagents are honestly **not** pre-decision-framed.

## Run the in-sandbox gate

```
node harness/gate1-pre-decision/test/logic-harness.mjs       # expect: 32 passed, 0 failed
node harness/gate1-pre-decision/test/negative-battery.mjs     # expect: 40 passed, 0 failed — RELEASE GATE: PASS
```

The **logic harness** proves the hook's request construction, frame parsing (both the signed and
unsigned `/api/reason` shapes, object-valued control_filter/oikeiosis), the fire-once guard, and both
fail modes. The **negative battery** is the release gate (ADR-011 D6): skip-attempt, outage (both
modes × 503/timeout/malformed/connection-refused), continuation (fire-once), and the subagent
documented finding. Both run against a local mock — they are **not** the live trajectory proof.

## Scope boundaries

- **Slice 1 (done):** the `UserPromptSubmit` hook + the single-fixture PR1 proof (framing-before-first-action).
- **Slice 2 (this):** the negative battery (CI release gate, 40/0) + the verified subagent finding.
  Live legs (skip-attempt, outage) founder-walked.
- **Slice 3:** plugin packaging (`.claude-plugin/plugin.json` + `hooks/hooks.json` + `.mcp.json` + `skills/`); the **`PreToolUse`-on-`Agent` subagent-framing hook** (the faithful path found in Slice 2); and the **operator credential mint** that issues the first `pre_decision_harness` marker.
- **Deferred further:** per-task re-framing within one session; the Agent SDK orchestration surface.

## Wire contracts (verified first-hand, `code.claude.com/docs/en/hooks` + `…/agent-sdk`, 2026-06-20)

**`UserPromptSubmit`** fires before the model; inject via
`{"hookSpecificOutput":{"hookEventName":"UserPromptSubmit","additionalContext":"…"}}` (≤10,000 chars);
`exit 2` blocks + erases the prompt ("Can block? Yes"); `matcher` is ignored (fire-once lives in the
script); default timeout 30s. We use the **`command`** handler (the `http` handler can only fail open,
so it can't satisfy strict mode; one `command` artifact serves both).

**`SubagentStart`** (the Slice-2 subagent finding):
- It **exists** and fires when a subagent is spawned, but its **command-hook stdin has no `prompt`**
  (only `session_id`, `transcript_path`, `cwd`, `agent_id`, `agent_type`, `hook_event_name`) — so it
  cannot frame the subagent's task. It also **cannot block** ("Can block? No").
- **Lesson:** a hook's SDK *callback* input type (which lists `prompt`) ≠ its *command-hook* stdin.
  Confirm command-hook shapes by capturing raw stdin (`GATE1_DEBUG`), not from the SDK TS types.
- The task-carrying path for subagents is therefore `PreToolUse`-on-`Agent` (Slice 3).
