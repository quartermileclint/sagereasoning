# Gate-1 Pre-Decision Harness — Claude Code surface (Arc 2)

**Status:** Slice 1 — `UserPromptSubmit` framing hook. Logic-Verified in-sandbox; trajectory proof runs in Claude Code (see `claude-code/PR1-PROOF-WALKTHROUGH.md`).
**Governing design:** `adopted/adr/2026-06-20-pre-decision-harness-arc2.md` (ADR-011).
**As of:** 2026-06-20.

## What this is

A developer-installed harness that fires SageReasoning's **Gate 1 examination *before* the agent
reasons** — deterministically, via a Claude Code `UserPromptSubmit` hook. A self-directed agent
forms a view on contact with a task and runs Gate 1 *after* deciding (Arm-1 evidence), so the
examination lands as post-decision confirmation. A hook fires in the control flow, before the
model processes the prompt, so the frame is genuinely pre-decision. *"Your CLAUDE.md is a wish;
your hooks are a contract."*

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
│   ├── hooks/framing-hook.mjs             ← the hook (Node 18+, no deps)
│   ├── gate1.config.example.json          ← copy to gate1.config.json to override defaults
│   ├── settings.snippet.json              ← the .claude/settings.json registration block
│   ├── fixtures/slice1-discretionary-task.md  ← the one PR1-proof task
│   └── PR1-PROOF-WALKTHROUGH.md            ← founder-walked Claude Code proof (reaches trajectory-Verified)
└── test/
    ├── mock-reason-server.mjs             ← local /api/reason stub (assessment_first)
    └── logic-harness.mjs                  ← in-sandbox logic proof (22 assertions)
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

## Fail modes (ADR-011 D4) — both honest (KG1 / R18)

- **`open` (default):** if `/api/reason` is down/slow, the task proceeds **and** the injected context
  states the task is **unframed** — never silently treated as framed. The success marker is not
  written, so a later turn may retry once the service recovers.
- **`strict`:** if framing is unavailable, the task is **blocked** (`exit 2`) with an honest stderr
  message. Favours correctness over availability.

## Run the logic proof (in-sandbox)

```
node harness/gate1-pre-decision/test/logic-harness.mjs
```
Expected: `32 passed, 0 failed`. This proves request construction, frame parsing (both the signed and
the unsigned `/api/reason` response shapes, with object-valued control_filter/oikeiosis items), the
fire-once guard, and both fail modes against a local mock. It is **not** the trajectory proof.

## Scope boundaries

- **Slice 1 (here):** the hook + the single-fixture PR1 proof (framing-before-first-action).
- **Slice 2:** the full negative battery — skip-attempt, outage, continuation, subagent — as a CI gate.
- **Slice 3:** plugin packaging (`.claude-plugin/plugin.json` + `hooks/hooks.json` + `.mcp.json` + `skills/`) and the **operator credential mint** that issues the first `pre_decision_harness` marker.
- **Later:** the Agent SDK orchestration surface (after this one reaches Verified — PR1).

## Wire contracts (verified first-hand, `code.claude.com/docs/en/hooks`, 2026-06-20)

`UserPromptSubmit` fires before the model; inject via `{"hookSpecificOutput":{"hookEventName":"UserPromptSubmit","additionalContext":"…"}}` (≤10,000 chars); `exit 2` blocks + erases the prompt; `matcher` is ignored (fire-once lives in the script); default timeout 30s. Five handler types exist — `command`, `http`, `mcp_tool`, `prompt`, `agent`. We use **`command`** because the `http` type can only fail *open* (non-2xx/timeout are non-blocking and cannot block), so it cannot satisfy `strict` mode; one `command` artifact serves both modes. `http` remains a valid simplification for fail-open-only installs.
