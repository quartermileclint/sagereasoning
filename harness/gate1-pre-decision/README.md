# The Seven-Layer Reference Harness — Claude Code surface (Gate-1 Arcs 2/3 → Trust Layer S8)

**Status:** Slices 1–5c (H1–H4, the Gate-1 full-loop harness) — built + live-fired; the channel law
proven (out-of-band hook actions are robust to a resistant agent; soft-injected instructions-to-act
are correctly refused). **Trust Layer S8 (2026-07-10) GENERALIZED the harness onto the seven-layer
anatomy** (Execution · Tooling · Context · Lifecycle · Observability · Verification · Governance —
see `SEVEN-LAYERS.md` for the channel-law classification of every step) and wired the S1–S7 trust
core in: **H2** gains the spawn-time four-layer discernment + the out-of-band L4 passion audit
(A9 authority boundary prepended to the delegated prompt); **H3** gains the once-per-session
trust-verdict advisory (S1→S3→S4, MEASURE); **H5** (new, `PostToolUse Task|Agent`) is the
delegation hand-back (A9 justice-failure classification + the A8/A9 trust events). All S8 surfaces
are **provisioned by `discernment.config.json`** (un-provisioned installs behave byte-identically to
the pre-S8 H1–H4 harness) and **DARK server-side** until `SUBSTRATE_TRUST_CORE_ENABLED` is set (the
route answers 503; the hooks fail open honestly; zero spend). MEASURE throughout — nothing S8 added
binds; **ENFORCE is S11**. Batteries: logic 91/0, negative-battery 230/0.
**Governing design:** `adopted/adr/2026-07-08-sage-trust-layer.md` (ADR-013 §4/§6) +
`adopted/adr/2026-06-20-pre-decision-harness-arc2.md` (ADR-011, incl. the channel-law amendment +
the 2026-07-10 S8 amendment). Kill-switches: `KILL-SWITCHES.md` (credential revoke is the real one).
**As of:** 2026-07-10.

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
| **H3** | `PreToolUse` / `Bash\|Edit\|Write\|…` | The **R5 at-action cadence**: **guard** (ENFORCE — block a `do_not_proceed` on an irreversible action via `/api/guardrail`), **score** (INSTRUMENT — a deduped Gate-2 `/api/reason` consult; the *fetch* is the sole R18f provenance source; the injected frame is ADVISE-only, no imperative outbound tail), **iterate** (loop-closure — carry `prior_feedback` at the same depth). | **Re-arch (5c)** |
| **H4** | `Stop` | **Reflect turn** (ENFORCE — force ONE in-conversation review turn; a pure invitation, no endpoint/POST/credential) + **accreditation write** (INSTRUMENT — carry the session's accumulated signed assessments; R18f) + **`persistReflection()`** (INSTRUMENT — POST the agent's VERBATIM reflection out-of-band; **dark by default**; off-machine egress — see disclosure below). | **Re-arch (5c)** |
| **H5** | `PostToolUse` / `Task\|Agent` | **S8 delegation hand-back** (INSTRUMENT): POST the sub-spawn's accumulated SIGNED artifacts to the dark `/api/practice/discernment` route for A9 justice-failure classification (capacity-proportional; server re-verifies — R18f-parallel) + the A8/A9 trust-event emission. Never alters the tool result; fires only when the spawn ran discernment. | **S8 (dark)** |

**S8 additions inside H2/H3** (provisioned by `discernment.config.json`; see `SEVEN-LAYERS.md`):
H2 runs the spawn-time **four-layer discernment** over the configured candidate set + the
**out-of-band L4 passion audit** on the orchestrator's transcript-tail trace (never self-report —
A7), opens the collaboration record + sets the **A9 authority boundary** server-side, and
**prepends the boundary scope statement** to the delegated prompt; H3 appends the once-per-session
**standing trust verdict** (S1 profile → S3 weighted aggregate → S4 MEASURE recommendation) as an
advisory observation. All MEASURE; every outage fails open with an honest log.

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
├── SEVEN-LAYERS.md                        ← S8: the seven-layer channel-law classification (the gate deliverable)
├── KILL-SWITCHES.md                       ← S8: the five kill-switch layers (credential revoke = the real one)
├── .claude-plugin/marketplace.json        ← local marketplace listing the plugin (Slice 3)
├── claude-code/                           ← THE PLUGIN ROOT (copied to cache on /plugin install)
│   ├── .claude-plugin/plugin.json         ← plugin manifest (Slice 3)
│   ├── hooks/
│   │   ├── hooks.json                     ← plugin hook registration (H1–H5; ${CLAUDE_PLUGIN_ROOT})
│   │   ├── framing-hook.mjs               ← H1: UserPromptSubmit (top-level agent)
│   │   ├── subagent-framing-hook.mjs      ← H2: PreToolUse-on-Agent (subagent framing + S8 spawn discernment/L4)
│   │   ├── at-action-hook.mjs             ← H3: PreToolUse (guard + score + iterate + S8 trust-verdict advisory)
│   │   ├── close-hook.mjs                 ← H4: Stop (reflect turn + accreditation write + persistReflection) — Slice 5c
│   │   ├── handback-hook.mjs              ← H5: PostToolUse-on-Agent (S8 delegation hand-back — A8/A9 events)
│   │   └── lib/
│   │       ├── framing-core.mjs           ← shared examine/render/fail core (+ fetchGuardrail, provenance)
│   │       ├── session-state.mjs          ← provenance log + loop state + decision dedup (H3/H4)
│   │       ├── loop-closure.mjs           ← the same-depth closure rule (mirrors the LIVE CI-4 gate)
│   │       └── discernment.mjs            ← S8: config/derive, transcript-tail trace, spawn payload, observability JSONL + OTel-shaped spans
│   ├── gate1.config.example.json          ← copy to gate1.config.json to override defaults
│   ├── discernment.config.example.json    ← S8: copy to discernment.config.json to provision the discernment surfaces
│   ├── settings.snippet.json              ← standalone .claude/settings.json registration (non-plugin)
│   ├── fixtures/slice1-discretionary-task.md
│   ├── PR1-PROOF-WALKTHROUGH.md            ← Slice-1 founder-walked proof
│   ├── SLICE2-LIVE-LEGS-WALKTHROUGH.md     ← Slice-2 founder-walked live legs (skip-attempt / outage)
│   └── SLICE3-LIVE-VERIFY-WALKTHROUGH.md   ← Slice-3 founder-walked plugin-install + subagent capture/verify
└── test/                                  ← OUTSIDE the plugin root (not shipped)
    ├── mock-reason-server.mjs            ← mocks /api/reason + /api/guardrail + /api/practice/reflect + /api/accreditation + /api/practice/discernment (S8)
    ├── logic-harness.mjs                 ← in-sandbox logic proof (91 assertions; incl. the S8 pure helpers + the G2 resolveSpawnKey pins)
    └── negative-battery.mjs              ← the release gate (skip / outage / continuation / subagent / at-action / close / materialization / s8-discernment — 230)
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
| **H4 — reflect credential** | `SAGE_GATE1_REFLECT_CREDENTIAL` | (= accred credential) | needs the `reflect` capability; defaults to the accred credential. Used **out-of-band** by `persistReflection()`. |
| **H4 — reflect turn** | `GATE1_REFLECT_TURN_ENABLED` | `true` | the operator opt-out: `false` disables the one-extra in-conversation review turn while **keeping** guard + accred + persist. |
| **H4 — reflect mode** | `GATE1_REFLECT_INITIATE_MODE` | `block` | `block` (force the in-conversation review turn via Stop `decision:block`) \| `context` (soft `additionalContext`) \| `off` (no turn). The turn is a **pure invitation to review one's own reasoning** — no endpoint/POST/credential (channel law). |
| **H4 — persist reflection** | `SAGE_GATE1_REFLECT_PERSIST_ENABLED` | `false` | **DARK by default.** When set, H4 POSTs the agent's VERBATIM closing reflection out-of-band to `/api/practice/reflect` (marked `context_source: agent_stated`; the open is marked `harness_inferred`). **This transmits the agent's introspective text off-machine — disclose + consent at install (see below).** Unset ⇒ no egress. |
| **S8 — discernment config** | `SAGE_GATE1_DISCERNMENT_CONFIG` | `claude-code/discernment.config.json` | the operator's discernment provisioning (orchestrator/candidate profiles + the A2 taxonomy — see `discernment.config.example.json`). **File absent/malformed ⇒ every S8 surface is OFF and H1–H5 are byte-identical to the pre-S8 harness.** |
| **S8 — consult-credential binding** | (the credential's own `agent_id`) | — | **REQUIRED for the S8 POST surfaces.** The discernment spawn + hand-back POSTs ride the **consult** credential (`SAGE_GATE1_CREDENTIAL`), and the server refuses (**403**) unless that credential's `agent_id` **equals `orchestrator_profile.agentId` in `discernment.config.json`**. A NULL-agent or mismatched consult credential ⇒ every spawn 403s, the hook fails open (the frame still injects), and **no collaboration record / L4 audit / trust event is ever produced** — visible only as a `DISCERN-OUTAGE … http 403 — forbidden: the credential must be bound to orchestrator_agent_id` line in `gate1.log`. (The H3 trust-verdict GET is scoped to the credential's own agent and is unaffected.) Mint the loop's consult credential bound to the same K1-canonical agent id you put in the config. |
| **S8 — discernment switch** | `SAGE_GATE1_DISCERNMENT_ENABLED` | (derive) | explicit override of the derive-from-provisioning: `false` kills the S8 surfaces even when the config is present. |
| **S8 — server flag** | `SUBSTRATE_TRUST_CORE_ENABLED` (server-side) | unset | the whole `/api/practice/discernment` surface is **DARK** until this is set in the deployment — the route answers an honest 503; the hooks fail open; zero spend. |

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
- **Score** (broader consequential, INSTRUMENT + ADVISE) — a Gate-2 `/api/reason` consult
  (`assessment_first`), **deduped per distinct decision** (one consult per file / per command, not
  before every tool call). It **never blocks**. The signed assessment is appended to the session
  provenance (D-D). **Channel law (Slice 5c):** the consult *fetch* is the **sole R18f provenance
  source** (the guard returns no signed assessment), so it is credential-critical — never stripped;
  but the *frame* it injects is **ADVISE-only** (a capable agent may discount it) and its imperative
  outbound tail (`…before writing the credential` / `…the accreditation chain reads as having open
  loops`) is **removed** — those referenced the hook's own out-of-band write and a capable agent reads
  them as injected instructions-to-act and refuses them.
- **Iterate** (loop-closure, D-B) — when a consult issues a redirection (`improvement_path_structured`),
  it **opens a loop**; the next consult carries `prior_feedback` at the **same depth** and the loop is
  **closed** when a re-examination clears. The closure rule **mirrors the LIVE CI-4
  `analyseLoopClosure`** (`loop-closure.mjs`) so a chain H3 builds reads `closed` at the write boundary.

**H4 — `close-hook.mjs` (Stop).** Three channels (Slice 5c), fire-once per session (+ the
`stop_hook_active` loop guard):

- **Reflect turn** (ENFORCE, D-C) — on the first `Stop`, `{"decision":"block","reason":…}` **forces one
  more in-conversation turn**. The `reason` is a **pure invitation** to review one's own reasoning —
  **no endpoint, no POST, no credential, no scope expansion**. Reviewing one's own reasoning is within
  task scope, so a capable agent does not read it as injected scope-expansion (the channel law; the
  Slice-5b finding that a capable agent refuses an injected *outbound* instruction). The model reviews;
  the hook never asks it to call anything. `GATE1_REFLECT_TURN_ENABLED=false` (operator opt-out) or
  `GATE1_REFLECT_INITIATE_MODE=off` suppresses the turn; `context` makes it a soft note.
- **Accreditation write** (INSTRUMENT, D-D) — out-of-band; reads the session's **accumulated** signed
  assessments and POSTs an accreditation seed carrying them (R18f). **NON-marker** `accreditation_write`
  credential bound to the loop's `agent_id` — **never** the standing `pre_decision_harness` marker (a
  write on it would clobber the marker). Two guards refuse it: it must not equal the **named** marker
  credential (`SAGE_GATE1_MARKER_CREDENTIAL`, defaulting to the consult credential so the dogfood is
  protected) nor the consult credential directly (no short-circuit). No provenance / no non-marker
  credential / no agent_id ⇒ **writes nothing and says so** — never a false success.
- **`persistReflection()`** (INSTRUMENT, Slice 5c) — out-of-band; on the **`stop_hook_active===true`**
  turn (the turn *after* the forced reflect turn, when the agent's reflection is in
  `last_assistant_message`), it POSTs the agent's **VERBATIM** reflection to `/api/practice/reflect`
  under the reflect credential — the agent is never asked, so the injection defence never fires
  (channel law). The hook **never authors first-person introspection**: it submits the agent's literal
  words (`context_source: agent_stated`), or — when there is no reflection — opens the record only and
  records an honest **"not performed"** (no fabricated answer). The `session_summary` the harness
  supplies is marked `context_source: harness_inferred` (the harness inferred it; the agent did not
  state it). **DARK by default** (`SAGE_GATE1_REFLECT_PERSIST_ENABLED` unset ⇒ no egress).

**Fail posture (D-F):** everything fails-open-with-an-honest-log **except** the guard block (which
blocks a genuine `do_not_proceed`, and fails-open on an OUTAGE by default). No fake frames; no silent
blocks; no fabricated reflection or accreditation. **Flag-off byte-identity:** `GATE1_PROVENANCE_ENABLED`
and `SAGE_GATE1_REFLECT_PERSIST_ENABLED` are **off by default**, so H1/H2 write no provenance and the
agent's words never leave the machine (machine-asserted in the logic harness + battery).

## Reflect-at-close — what is persisted, and your consent (Slice 5c, READ BEFORE ENABLING)

When `SAGE_GATE1_REFLECT_PERSIST_ENABLED=true`, the close hook **transmits the agent's closing
reflection — the verbatim text of the agent's own review turn — off your machine to SageReasoning**
(`POST /api/practice/reflect` under your reflect credential). This is the one place in the harness
where the **agent's introspective free-text leaves the local environment**. Specifically:

- The hook reads `last_assistant_message` from the `Stop` event (the agent's review turn) and POSTs it
  **verbatim** (truncated only at a generous transport cap, never altered or authored). If there is no
  reflection, it records an honest **"not performed"** — it never writes words the agent did not say.
- The text is stored by `/api/practice/reflect` **encrypted at rest** (AES-256-GCM, R17b) in the
  `sage_reflect_sessions` table, with the supplied session context marked `context_source:
  harness_inferred` so the record never misrepresents the harness's inferred framing as agent-stated.
- **This is an operator decision.** Enable it only with the **informed consent** of whoever owns the
  agent whose reasoning is being persisted. The default-off posture means a fresh install transmits
  nothing; you opt in deliberately.

**Erasure (prerequisite for STANDING activation — not yet wired):** reflect-session rows are deletable
via the reflect store's genuine-deletion functions (`deleteSession` / `deleteAgentSessions`) and a
90-day retention window (`sweepExpiredSessions`), but as of Slice 5c **those functions are not yet
wired into the live erase routes** (`/api/user/delete`, `/api/credential/erase`) or a scheduled
retention cron. **Do not enable `SAGE_GATE1_REFLECT_PERSIST_ENABLED` for a standing install until that
wiring lands** (a named follow-up Critical session) — otherwise the "deletable on request" promise is
not yet honoured by an automated path. A torn-down test loop (as in Slice 5b) is fine: delete the test
`sage_reflect_sessions` rows by hand at teardown.

## Run the in-sandbox gate

```
node harness/gate1-pre-decision/test/logic-harness.mjs       # expect: 91 passed, 0 failed
node harness/gate1-pre-decision/test/negative-battery.mjs     # expect: 230 passed, 0 failed — RELEASE GATE: PASS
```

The **logic harness** (56) proves request construction + frame parsing (signed/unsigned, object-valued
fields), fire-once, both fail modes, the **provenance flag-off byte-identity**, H3's
`prior_feedback`/same-depth construction + dedup/loop state, the multi-redirection abandoned-loop
behaviour, H4's accreditation-body, the **channel-law reflect turn** (pure invitation — no
POST/endpoint/credential; the first Stop does not hit `/api/practice/reflect`), and **persistReflection**
(out-of-band open marked `harness_inferred` + the agent's VERBATIM answer marked `agent_stated`).
The **negative battery** (124) is the release gate (ADR-011 D6): skip-attempt (8), outage (28),
continuation (4), subagent (16), **at-action (31)** — guard-blocks-on-`do_not_proceed`, the
guard-coverage forms, consult-fires-on-consequential, dedup, loop-closure carries `prior_feedback` +
closes, the **channel-law check (the OPEN frame has no imperative outbound tail)**, guard/consult outage
fail-modes — and **close (37)** — the reflect turn is a pure invitation (no POST/endpoint/credential),
the accreditation write carries the accumulated provenance, **persistReflection** (verbatim
`agent_stated` answer; **verbatim-or-not-performed** honesty — empty reflection ⇒ open-only, no
fabricated answer; **dark by default** — no egress without the flag; fire-once via `.reflected`; outage
honesty), the never-the-marker-credential guard, and the `context`/`off`/opt-out modes. The S8 leg
(**s8-discernment**, 64) covers the seven-layer additions: un-provisioned byte-identity, the spawn
discernment POST construction (task-profile mapping, config candidates, the out-of-band transcript
trace, the named-chosen candidate), the A9 boundary prepend, the observability JSONL + OTel-shaped
span refs, discernment outage/dark fail-open, the H5 hand-back (R18f artifacts, spawn-record flags,
fire-once, honest skips), and the H3 trust-verdict advisory (once per session; outage honesty). The
logic harness case 16 (24) proves the S8 pure helpers. Both run against the local mock — **not** the
live trajectory proof.

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
- **Slice 5a (done):** H3 + H4 built DARK + the release-gate extension. Repo-only.
- **Slice 5b (done):** H1–H4 **live-fired** in a real Claude Code loop on a non-marker credential, then
  torn down. Proved the **channel law**: guard-deny + accred-write are honored out-of-band (robust to a
  resistant agent); the soft-injected reflect-via-outbound-POST instruction was **correctly refused** by
  a capable agent. Captured the real `Stop` stdin (carries `last_assistant_message`).
- **Slice 5c (this):** **H3/H4 re-architected onto the channel law** + the honesty fixes — strip the
  at-action imperative outbound tails (advisory only); the close reflect turn becomes a **pure
  in-conversation invitation**; add **`persistReflection()`** (out-of-band, dark by default, verbatim-
  or-not-performed); add the additive **`context_source`** field to `/api/practice/reflect`; **narrow the
  public `pre_decision_harness` claim** to what the channels enforce. Battery 56/0 + 124/0. The
  `context_source` field + claim-narrowing are public-surface changes (founder-walked); the hooks stay
  registered-but-not-installed. Live-fire is a founder-walked test loop (`SLICE5C-LIVE-VERIFY-WALKTHROUGH.md`).
- **Deferred further:** wiring reflect-row erasure into the live erase routes + a retention cron (the
  prerequisite for STANDING persist activation); per-task re-framing within one session; calling for
  purposeless agents (`SessionStart`, H5); the Agent SDK orchestration surface.

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

**`Stop` (H4 — the close event, D-E; CONFIRMED FIRST-HAND at the founder-walked Slice 5b, 2026-06-21):**
`Stop` fires when the agent finishes responding. This desktop build's command-hook stdin carries
`{ session_id, transcript_path, cwd, hook_event_name:"Stop", stop_hook_active, last_assistant_message,
effort, background_tasks, session_crons }` — note **`last_assistant_message`** (the agent's closing
text), which `persistReflection()` reads on the `stop_hook_active===true` turn to capture the agent's
reflection out-of-band. A Stop hook **can initiate a model turn** by emitting
`{"decision":"block","reason":"…"}` (exit 0) — confirmed live (the 2nd `Stop` read `stop_hook_active:
true`). The **loop guard** is `stop_hook_active`: `true` means a Stop hook already blocked **this** turn
— H4 then runs `persistReflection` (the reflection is now in `last_assistant_message`) and allows the
stop. **`SessionEnd` is NOT used** — it has no decision control (cleanup-only), so it cannot initiate
the reflect turn. Fire-once (`.closed` for the close, `.reflected` for the persist) bounds H4 to a
single block + a single out-of-band POST per session.

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
