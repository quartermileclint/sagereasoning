# Gate-1 Full-Loop Harness — Claude Code surface (Arc 2/3)

**Status:** Slice 1 (`UserPromptSubmit` framing hook) — trajectory-Verified. Slice 2 (negative-battery
release gate) — in-sandbox-Verified + live legs founder-walked. Slice 3a (`PreToolUse`-on-`Agent`
subagent-framing hook + plugin packaging) — in-sandbox-Verified; plugin-install + subagent live-verify
founder-walked. **H1 + H2 are LIVE in the founder's dogfood install. Slice 5a (this) — the full-loop
hooks H3 (at-action: guard + score + iterate) and H4 (close: reflect-initiate + accreditation write)
— BUILT DARK + battery-green (logic 50/0, battery 98/0). They are registered in the plugin's
`hooks/hooks.json` but NOT installed into any `settings.local.json`; live-fire is the founder-walked
Slice 5b.**
**Governing design:** `adopted/adr/2026-06-20-pre-decision-harness-arc2.md` (ADR-011, incl. the
2026-06-21 full-loop amendment — H1–H4, D-A…D-F).
**As of:** 2026-06-21.

## What this is

A developer-installed harness that invokes SageReasoning's practice **across the whole task loop —
deterministically, via Claude Code hooks** (control-flow, not prompt guidance). A self-directed agent
forms a view on contact with a task and invokes the practice *after* deciding, or not at all (the
bare-into-harness finding: an uninstructed agent self-invoked the practice **zero** times). Hooks fire
in the control flow, so each stage happens regardless. *"Your CLAUDE.md is a wish; your hooks are a
contract."*

**Four hooks, three events (the minimum floor — ADR-011 amendment):**

| Hook | Event | What it does | Status |
|---|---|---|---|
| **H1** | `UserPromptSubmit` | Gate 1 — frame the **top-level** task before the model sees it (inject as `additionalContext`). | **Live** |
| **H2** | `PreToolUse` / `Task\|Agent` | Gate 1 — frame **each delegated subagent's** task (prepend to `tool_input.prompt` via `updatedInput`). | **Live** |
| **H3** | `PreToolUse` / `Bash\|Edit\|Write\|…` | The **R5 at-action cadence**: **guard** (block a `do_not_proceed` on an irreversible action via `/api/guardrail`), **score** (a deduped Gate-2 `/api/reason` consult, injected as `additionalContext`), **iterate** (loop-closure — carry `prior_feedback` at the same depth). | **Built dark (5a)** |
| **H4** | `Stop` | **Reflect-at-close** (open `/api/practice/reflect`, force the Q1–Q6 turn) + the **accreditation write** (carry the session's accumulated signed assessments; R18f). | **Built dark (5a)** |

H1/H2 inject the pre-decision frame. H3/H4 deliver the rest of the dossier's operating model (Gate 2,
loop-closure, reflect-at-close, the accreditation write) that guidance alone does not reliably trigger.

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
│   │   ├── hooks.json                     ← plugin hook registration (H1–H4; ${CLAUDE_PLUGIN_ROOT})
│   │   ├── framing-hook.mjs               ← H1: UserPromptSubmit (top-level agent)
│   │   ├── subagent-framing-hook.mjs      ← H2: PreToolUse-on-Agent (delegated subagents) — Slice 3
│   │   ├── at-action-hook.mjs             ← H3: PreToolUse (guard + score + iterate) — Slice 5a (dark)
│   │   ├── close-hook.mjs                 ← H4: Stop (reflect-initiate + accreditation write) — Slice 5a (dark)
│   │   └── lib/
│   │       ├── framing-core.mjs           ← shared examine/render/fail core (+ fetchGuardrail, provenance)
│   │       ├── session-state.mjs          ← provenance log + loop state + decision dedup (H3/H4)
│   │       └── loop-closure.mjs           ← the same-depth closure rule (mirrors the LIVE CI-4 gate)
│   ├── gate1.config.example.json          ← copy to gate1.config.json to override defaults
│   ├── settings.snippet.json              ← standalone .claude/settings.json registration (non-plugin)
│   ├── fixtures/slice1-discretionary-task.md
│   ├── PR1-PROOF-WALKTHROUGH.md            ← Slice-1 founder-walked proof
│   ├── SLICE2-LIVE-LEGS-WALKTHROUGH.md     ← Slice-2 founder-walked live legs (skip-attempt / outage)
│   └── SLICE3-LIVE-VERIFY-WALKTHROUGH.md   ← Slice-3 founder-walked plugin-install + subagent capture/verify
└── test/                                  ← OUTSIDE the plugin root (not shipped)
    ├── mock-reason-server.mjs            ← mocks /api/reason + /api/guardrail + /api/practice/reflect + /api/accreditation
    ├── logic-harness.mjs                 ← in-sandbox logic proof (50 assertions; incl. H3/H4 + flag-off byte-identity)
    └── negative-battery.mjs              ← the release gate (skip / outage / continuation / subagent / at-action / close)
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
| Endpoint | `GATE1_ENDPOINT` | `http://localhost:3000/api/reason` | set your hosted endpoint on install; H3's guard + H4's reflect/accred endpoints derive from it |
| Depth | `GATE1_DEPTH` | `standard` | `quick` \| `standard` — `deep` is force-downgraded (D3) |
| Fail mode | `GATE1_FAIL_MODE` | `open` | H1/H2 frame outage: `open` (honest-log + proceed) \| `strict` (block, exit 2) |
| Timeout | `GATE1_TIMEOUT_MS` | `28000` | under Claude Code's 30s hook kill |
| State dir | `GATE1_STATE_DIR` | `<os-tmp>/sage-gate1` | holds the markers, provenance log, loop state + `gate1.log` |
| Fire once | `GATE1_FIRE_ONCE` | `true` | H1: per session; H2: per spawn; H3: per distinct decision; H4: per session (D5) |
| Credential | `SAGE_GATE1_CREDENTIAL` | — | `sr_live_…` / `sr_prac_…` (needs `consult`). **Required.** |
| Debug dump | `GATE1_DEBUG` | (unset) | dumps the raw hook stdin to `<stateDir>/<eventName>-stdin.json` — confirms the exact command-hook wire shape. |
| **H3/H4 — provenance** | `GATE1_PROVENANCE_ENABLED` | `false` | accumulate each consult's signed assessment for H4's accreditation write (D-D). **Default off ⇒ H1/H2 byte-identical.** Set with H3/H4 at install. |
| **H3 — guard outage** | `GATE1_GUARD_FAIL_MODE` | `open` | the guardrail's OUTAGE mode (a genuine `do_not_proceed` always blocks): `open` (allow + honest note) \| `strict` (deny). |
| **H3 — guard set** | `GATE1_IRREVERSIBLE_PATTERNS`, `GATE1_GUARD_TOOLS` | built-in list / `[]` | the irreversible-Bash regexes + always-guard tools that route to the blocking guardrail (D-A). |
| **H4 — accred credential** | `SAGE_GATE1_ACCRED_CREDENTIAL` | — | a **NON-marker** `accreditation_write` credential. **Never the standing `pre_decision_harness` marker** (a write on it would clobber the marker). Unset ⇒ H4 writes nothing (honest skip). |
| **H4 — marker credential** | `SAGE_GATE1_MARKER_CREDENTIAL` | (= consult credential) | the standing marker token, **named so H4 can refuse it by identity**. Defaults to the consult credential (covers the dogfood). **When the consult and marker credentials genuinely differ, name the marker explicitly at Slice 5b** so the guard protects it. |
| **H4 — agent id** | `SAGE_GATE1_AGENT_ID` | — | the loop's K1-canonical `namespace:name@version`. Unset ⇒ no accreditation write. |
| **H4 — reflect credential** | `SAGE_GATE1_REFLECT_CREDENTIAL` | (= accred credential) | needs the `reflect` capability; defaults to the accred credential. |
| **H4 — reflect mode** | `GATE1_REFLECT_INITIATE_MODE` | `block` | `block` (force the Q1–Q6 turn via Stop `decision:block`) \| `context` (soft `additionalContext`) \| `off` (accred write only). |

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

Live-verified 2026-06-21: the real `tool_name` is **`Agent`** (not `Task`), the task is at
`tool_input.prompt`, and `updatedInput` is applied (the subagent's transcript shows its prompt leading
with the frame). The matcher `Task|Agent` is kept for portability to builds that use `Task`.

## The full loop — H3 (at-action) + H4 (close) (Slice 5a, built dark)

H1/H2 deliver only the pre-decision *frame*. The dossier's full model — Gate 2, loop-closure,
reflect-at-close, the accreditation write — needs more hooks (a self-directed agent self-invoked the
practice **zero** times in the bare-into-harness test). H3 + H4 are the deterministic floor.

**H3 — `at-action-hook.mjs` (PreToolUse on the consequential-tool set).** Three roles, one hook
(ADR-011 D-A):

- **Guard** (irreversible subset) — a `Bash` command matching an irreversible pattern (`rm -rf`,
  `drop table`, force-push, deploy…) or a configured guard tool calls `/api/guardrail`. On a genuine
  `do_not_proceed`, it **blocks** (`permissionDecision:"deny"`); over-blocking is the safe error. An
  /api/guardrail OUTAGE follows `GATE1_GUARD_FAIL_MODE` (`open` default — allow + honest note; `strict`
  — deny). NOT deduped (a previously-blocked command must re-block on retry).
- **Score** (broader consequential) — a Gate-2 `/api/reason` consult (`assessment_first`), **deduped
  per distinct decision** (one consult per file / per command, not before every tool call), injected
  as `additionalContext`. It **never blocks**. The signed assessment is appended to the session
  provenance (D-D).
- **Iterate** (loop-closure, D-B) — when a consult issues a redirection (`improvement_path_structured`),
  it **opens a loop**; the next consult carries `prior_feedback` at the **same depth** and the loop is
  **closed** when a re-examination clears. The closure rule **mirrors the LIVE CI-4
  `analyseLoopClosure`** (`loop-closure.mjs`) so a chain H3 builds reads `closed` at the write boundary.

**H4 — `close-hook.mjs` (Stop).** Fire-once per session (+ the `stop_hook_active` loop guard):

- **Reflect-initiate** (D-C) — opens `/api/practice/reflect` and **forces one more model turn** so the
  agent runs its Q1–Q6 reflection. A hook cannot drive a multi-turn exchange, so it **initiates** and
  the **model drives** (honest partial; the sequence is never abbreviated). Mechanism: a `Stop` hook
  continues the agent via `{"decision":"block","reason":"…"}` — the `reason` is the model's next
  instruction. (`context` and `off` modes are configurable.)
- **Accreditation write** (D-D) — reads the session's **accumulated** signed assessments and POSTs an
  accreditation seed carrying them, so the credential rests on genuine examination (R18f). It uses a
  **NON-marker** `accreditation_write` credential bound to the loop's `agent_id` — **never** the
  standing `pre_decision_harness` marker credential (a write on it would clobber the marker). Two
  guards refuse it: it must not equal the **named** marker credential (`SAGE_GATE1_MARKER_CREDENTIAL`,
  defaulting to the consult credential so the dogfood is protected; name it explicitly when consult ≠
  marker), and it must not equal the consult credential directly (no short-circuit). With no
  accumulated provenance, or no non-marker credential / agent_id, it **writes nothing and says so** —
  never a false success.

**Fail posture (D-F):** everything fails-open-with-an-honest-log **except** the guard block (which
blocks a genuine `do_not_proceed`, and fails-open on an OUTAGE by default). No fake frames; no silent
blocks. **Flag-off byte-identity:** `GATE1_PROVENANCE_ENABLED` is **off by default**, so H1/H2 write no
provenance and are byte-identical to before Slice 5a (machine-asserted in the logic harness).

## Run the in-sandbox gate

```
node harness/gate1-pre-decision/test/logic-harness.mjs       # expect: 53 passed, 0 failed
node harness/gate1-pre-decision/test/negative-battery.mjs     # expect: 108 passed, 0 failed — RELEASE GATE: PASS
```

The **logic harness** (53) proves request construction + frame parsing (signed/unsigned, object-valued
fields), fire-once, both fail modes, the **provenance flag-off byte-identity** (H1 writes no provenance
file when the flag is unset), H3's `prior_feedback`/same-depth construction + dedup/loop state, the
multi-redirection abandoned-loop behaviour, and H4's accreditation-body + reflect-open construction.
The **negative battery** (108) is the release gate (ADR-011 D6): skip-attempt (8), outage (28),
continuation (4), subagent (16), **at-action (30)** — guard-blocks-on-`do_not_proceed`, the
guard-coverage forms (separated/long `rm`, `vercel --prod`, `+ref` force-push, bare `truncate`),
consult-fires-on-consequential, dedup, loop-closure carries `prior_feedback` + closes, guard/consult
outage fail-modes — and **close (22)** — reflect-initiates (`decision:block`), accreditation carries the
accumulated provenance, fire-once + `stop_hook_active` guard, outage honesty, the never-the-marker-
credential guard (named-marker + consult, incl. the empty-consult case), and the `context`/`off` modes.
Both run against the local mock — **not** the live trajectory proof.

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
- **Slice 3b (done):** the operator credential mint → the first `pre_decision_harness` marker (live,
  then smoke-torn-down); the standing marker + dogfood install followed.
- **Slice 5a (this):** **H3 (at-action) + H4 (close) built DARK** + the release-gate extension (logic
  50/0, battery 98/0) + the close-event wire-contract confirmation. Repo-only — no install, no prod /
  perimeter / auth / schema / flag / credential change. `git revert` undoes it; nothing is live.
- **Slice 5b (next, `code-critical`/AC7, founder-walked):** install H3 + H4 in a real loop on a
  **non-marker** credential; live-verify the four behaviours (a destructive action is blocked; a
  mid-task consult fires + a loop opens/closes; reflect initiates at close; an accreditation write
  lands carrying provenance) — and **capture the real `Stop` stdin via `GATE1_DEBUG`** (the close
  event is unexercised; confirm `decision:block` initiates a turn first-hand, the Slice-2 lesson).
- **Deferred further:** per-task re-framing within one session; calling for purposeless agents
  (`SessionStart`, H5); the Agent SDK orchestration surface.

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
the subagent tool's exact name — live-verify confirmed it is `Agent` in this build [2026-06-21]; the
matcher `Task|Agent` + the `tool_input.prompt` read stay robust across builds.)

**`PreToolUse` on real tools (H3, confirmed `code.claude.com/docs/en/hooks`, 2026-06-20):** the
`tool_input` shapes are `Bash.command`, `Edit.file_path`/`.new_string`, `Write.file_path`/`.content`,
`NotebookEdit.notebook_path`. A consequential action is allowed-with-context via
`{"hookSpecificOutput":{"hookEventName":"PreToolUse","additionalContext":"…"}}`; an irreversible action
is blocked via `{"hookSpecificOutput":{"hookEventName":"PreToolUse","permissionDecision":"deny",
"permissionDecisionReason":"…"}}`.

**`Stop` (H4 — the close event, D-E; confirmed `code.claude.com/docs/en/hooks`, 2026-06-20):** `Stop`
fires when the agent finishes responding. Command-hook stdin: `{ session_id, transcript_path, cwd,
hook_event_name:"Stop", permission_mode?, stop_hook_active }`. A Stop hook **can initiate a model
turn** by emitting `{"decision":"block","reason":"…"}` (exit 0) — the `reason` is fed to the model as
its next instruction (this is reflect-initiate's mechanism). The **loop guard** is `stop_hook_active`:
`true` means a Stop hook already blocked **this** turn, so we allow the stop (plus our own fire-once
close marker). **`SessionEnd` is NOT used** — it has no decision control (it cannot block, continue, or
inject context; cleanup-only), so it cannot initiate the reflect turn. The 8-block backstop and
`CLAUDE_CODE_STOP_HOOK_BLOCK_CAP` are noted but not relied on (fire-once bounds H4 to a single block).
**This contract is doc-confirmed but the `Stop` event is unexercised — the live raw-stdin capture
(`GATE1_DEBUG`) + the `decision:block`-initiates-a-turn behaviour are confirmed FIRST-HAND at the
founder-walked Slice 5b** (the Slice-2 lesson — see below).

**Plugin** (`code.claude.com/docs/en/plugins-reference`): `.claude-plugin/plugin.json` (`name` is the
only required field); `hooks/hooks.json` is auto-discovered at the plugin root (same shape as a
settings `hooks` block); `${CLAUDE_PLUGIN_ROOT}` is the plugin's install dir — in hook commands use
**exec form with `args`** so the path passes as one argument unquoted; install **copies** the plugin
dir to a cache, so the plugin must be self-contained (ours is — the hooks + `lib/` are all inside
`claude-code/`). **Marketplace:** `.claude-plugin/marketplace.json` lists the plugin; `/plugin
marketplace add` then **explicit** `/plugin install` (adding a marketplace never auto-installs).

**Slice-2 lesson (carried):** a hook's SDK *callback* input type ≠ its *command-hook* stdin — confirm
command-hook shapes by capturing raw stdin (`GATE1_DEBUG`), not from SDK TS types or docs alone. This
is why the `Stop` stdin + `decision:block` behaviour above stay flagged for first-hand confirmation at
Slice 5b, even though the docs are clear.
