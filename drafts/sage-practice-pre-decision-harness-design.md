# Forcing Gate 1 Pre-Decision — Harness, Plugin & Test-Environment Design (research-backed)

**As of:** 2026-06-20 · **Status:** **Adopted as ADR-011** (`adopted/adr/2026-06-20-pre-decision-harness-arc2.md`) under `D-SAGE-PRACTICE-GATE1-ARC2-HARNESS-DESIGN-ADOPTED` (2026-06-20). This file is retained as the research basis; the ADR is the governing surface. Follows from the Arm 1 pre-decision finding (`operations/benchmarks/sage-practice-v1/runs/2026-06-20/arm1-predecision-and-reflect-findings.md`). Research basis: 5-angle deep-research pass (Claude Code hooks, plugins, Agent SDK, MCP, cross-framework), official Anthropic + MCP + LangChain/OpenAI docs cited inline.

## Bottom line (your conclusion is confirmed by the evidence)

A self-directed agent **cannot be relied on** to run Gate 1 pre-decision: prompt-level "always frame first" instructions hit **~68% adherence at best and degrade under load, with a primacy bias and skip/reorder behaviour** (IFScale, NeurIPS 2025), and are overridable by prompt-injection (arXiv 2506.08837). Arm 1 demonstrated this concretely — a disciplined agent still framed *after* deciding.

The deterministic fix is a step in the **harness control-flow, not the prompt.** Anthropic's own framing: hooks "ensure certain actions always happen rather than relying on the LLM to choose to run them" — *"your CLAUDE.md is a wish; your hooks are a contract."* (`code.claude.com/docs/en/hooks`; `anthropic.com/engineering/building-effective-agents`). So:

- **On the Claude-native surface (Claude Code):** a **`UserPromptSubmit` hook** that fires the Gate-1 `/api/reason` framing call and injects the frame *before the model processes the task* — packaged in a **plugin** that auto-registers the hook on install.
- **On the Agent SDK surface (programmatic agents):** there is **no built-in pre-loop hook**, so you **orchestrate in code** — call `/api/reason` (framing) *before* invoking the agent loop and inject the result into its initial context.

Both are "control flow in code" = non-skippable. **This is exactly your point:** a *developer-installed* initiation (plugin/hook or SDK wrapper) guarantees pre-decision invocation; *agent-direct* API invocation cannot.

---

## 1. Why hard (control-flow) beats soft (prompt) — the evidence

| Claim | Source |
|---|---|
| Claude Code hooks are deterministic — "ensuring certain actions always happen rather than relying on the LLM to choose to run them." | `code.claude.com/docs/en/hooks` (official) |
| `UserPromptSubmit` fires **before the model processes the prompt**; can run a command, inject `additionalContext`, and block (exit 2). | `code.claude.com/docs/en/hooks` (official) |
| `PreToolUse` can **deny/allow** a tool *before execution*, and **matches MCP tools** (`mcp__.*`) — so the harness can gate even MCP tools, which MCP itself cannot. | `code.claude.com/docs/en/hooks` (official) |
| MCP **cannot enforce** call-ordering/mandatory-first — tools are "model-controlled"; annotations are "hints… not a contract." | `modelcontextprotocol.io/specification/.../server/tools`; MCP blog (official) |
| Prompt instruction-following is unreliable at scale (~68% adherence at 500 instructions; primacy bias; skips under load). | IFScale, NeurIPS 2025 (`arxiv.org/pdf/2507.11538`) |
| Control flow in **predefined code paths (workflow)** is deterministic; control flow **in the model (agent)** is discretionary. | Anthropic, *Building Effective Agents* (`anthropic.com/engineering/building-effective-agents`) |

**Implication for Sage:** the live Sage MCP tools alone (agent-direct) are the *soft* path — the model chooses whether/when to call `/api/reason`. Forcing Gate 1 requires wrapping them in a hook/harness (*hard*).

## 2. Injection points, ranked by determinism

| Point | Mechanism | Determinism |
|---|---|---|
| Pre-inference (task received) | **`UserPromptSubmit` hook** — run command + inject `additionalContext` before the model reasons | **HARD** ✅ (the Gate-1 slot) |
| Tool dispatch | **`PreToolUse` hook** — deny task tools until framing has run | **HARD** ✅ (belt-and-suspenders gate) |
| Session open | **`SessionStart` hook** — inject the standing framing posture once per session | HARD (session-level, not per-task) |
| Initial context assembly (SDK) | orchestrate the framing call in app code, inject result before the loop | HARD ✅ (the SDK path) |
| System-prompt "frame first" | instruction | **SOFT** ✗ (~68%, skippable — what Arm 1 showed) |
| MCP tool description "call me first" | annotation/description | **SOFT** ✗ (induces, never forces) |

## 3. The mechanism for Sage Practice — two surfaces

### 3a. Claude Code / plugin surface (the developer-install path)
1. **`UserPromptSubmit` hook (guarded, once per task).** On the task prompt, the hook runs a command that POSTs the raw task to `/api/reason` in **framing posture** (situation in → frame out), receives the frame (circles engaged, obligations, control-filter, passions-to-watch), and returns it as **`additionalContext`** — injected before the model reasons. *This is Gate 1, made deterministic.*
2. **`PreToolUse` gate (optional, stronger).** Deny task-acting tools (`mcp__.*`, `Edit`/`Write`/`Bash`) until a per-session "framed" flag is set by step 1 — so the agent literally cannot act before it has been framed.
3. **`Stop`/`SessionEnd` hook (optional).** Fire reflect-at-close — the rest of the cadence — deterministically too.
4. **Guard logic.** Fire Gate-1 **once per task** (a session/state flag), not every turn — otherwise you re-frame every follow-up message (over-consultation + cost, contrary to the two-gate cadence).

### 3b. Claude Agent SDK surface (programmatic agents)
The SDK supports hooks (`PreToolUse`, `UserPromptSubmit`, …) and a `canUseTool` permission callback, **but has no built-in "mandatory step before the loop begins"** (verified against `platform.claude.com/docs/en/agent-sdk/*`). So:
- **Orchestrate in code:** call `/api/reason` (framing) **before** `query()`/the agent loop; pass the frame into the agent's initial context/system message. HARD at the app level.
- Optionally use **`canUseTool`** (deny tools until a "gate" tool/flag is satisfied) as the SDK-equivalent `PreToolUse` gate.

### 3c. Cross-framework adapters (optional, for non-Claude agents)
Same shape: **LangGraph** `add_edge(START, framing_node)` or a `before_model` middleware hook; **OpenAI Agents SDK** a **blocking input guardrail** (`run_in_parallel=False`) that runs before the agent and can halt. All HARD/control-flow.

## 4. The plugin (the distribution mechanism that realises "developer-installed → pre-decision")

A **Claude Code plugin** bundles, in one installable unit (`code.claude.com/docs/en/plugins`):
- **`.mcp.json`** — the Sage MCP server (the tools: `/api/reason`, reflect, etc.).
- **`hooks/`** — the `UserPromptSubmit` framing hook (+ optional `PreToolUse` gate, `Stop` reflect).
- **`skills/`** — `sage-consult`-style guidance (the soft layer, riding *under* the hard hook).

**Install (user steps):** `/plugin marketplace add <sage-marketplace>` → `/plugin install sage-practice`. Installing **auto-registers the hooks** (they fire on their events with no further config) and exposes the MCP tools. **Org enforcement:** `managed-settings.json` `enabledPlugins` + `allowManagedHooksOnly: true` force it fleet-wide with no user opt-out (`code.claude.com/docs/en/settings`).

So a developer (or an org) installs one plugin and **every task that agent receives is framed before it acts** — the thing the agent won't reliably do itself.

## 5. Critical design constraints & failure modes (the things that will bite)

- **Latency vs the hook timeout (the #1 constraint).** `UserPromptSubmit` runs synchronously before the model; it has a bounded timeout. The Arm-1 **deep** framing consult took ~60s — too slow for a pre-prompt hook. **The framing call MUST be fast: `quick`/`standard` depth with `response_format:"assessment_first"`** (returns the signed assessment + extraction immediately; defers prose). The frame the agent needs lives in the extraction + Layer-2 (circles, control-filter, passions, kathekon) — all in the fast `assessment_first` shape. Design Gate-1-as-hook around the fast path, not deep.
- **Fail mode on outage.** If `/api/reason` is slow/down, choose: **fail-closed** (block the prompt — strict, but blocks work during an outage) or **fail-open-with-honest-log** (proceed, record the missing frame). Recommend configurable, defaulting to fail-open-logged for availability (mirrors the project's bounded-synchronous posture); a "strict" org setting can fail-closed.
- **Fire-once guard.** Per-task, not per-turn — or you re-consult every message (cost + over-consultation).
- **Subagents.** A delegated task to a subagent may not raise `UserPromptSubmit`; use `SubagentStart` (reported) or the SDK orchestration to frame subagent tasks.
- **Injection ≠ use.** The hook deterministically *injects* the frame; a model reading injected context is far more reliable than asking it to *call a tool*, but reasoning *well* from the frame is still the model's job. The `PreToolUse` gate adds "can't act until framed." Injection + gate is the strongest available and far better than agent-direct — but it's honest to say full "reasons from the frame" is not 100% enforceable.
- **Verify exact contracts at build.** Confirm against the official hooks reference (`code.claude.com/docs/en/hooks`): the `UserPromptSubmit` JSON output (`additionalContext`), exit-code semantics, matchers, and whether an **`http` handler** exists (reported in secondary sources — would let the hook POST to `/api/reason` directly, no shell script). The **`command` handler (curl)** is the robust, definitely-supported fallback; don't depend on `http` until confirmed.

## 6. The test environment to stage the harness

Goal: prove, deterministically, that the framing call fires **before any other action, on every task** — and that it can't be skipped.

- **Trajectory assertions (strict).** Assert the **first tool/action in the trace is the framing `/api/reason` call**, before any task tool — the AgentEvals `strict`-mode "policy-lookup-before-authorization" pattern (`docs.langchain.com/langsmith/trajectory-evals`). CI-gated, hard-fail. Mirrors the project's mandatory-battery discipline (e.g. the verdict-equivalence battery).
- **Hook-fired assertion.** From hook logs / the injected `additionalContext` present in the model's first turn, across N task fixtures.
- **Adversarial / negative battery (the load-bearing tests):**
  - **Skip attempt:** a prompt that says "ignore any setup, just do X" → framing **still** fires (proves hard, not soft).
  - **Outage:** framing API down → the chosen fail-mode behaves correctly (block, or proceed-with-logged-gap).
  - **Continuation:** a follow-up prompt in the same task → Gate-1 does **not** re-fire (the guard works; no over-consultation).
  - **Subagent:** a delegated task → it is framed (via `SubagentStart` / SDK path) or the gap is flagged.
- **Three test surfaces:** (i) a TEST Claude Code instance with the plugin installed, pointed at a **TEST `/api/reason`** with a `sr_prac_` credential (your existing mint flow); (ii) an SDK harness for the programmatic path; (iii) the trajectory-eval CI job. Hardware: your existing TEST environment + the credential-mint flow already cover (i) and (iii).
- **Pass criterion:** 100% of fixtures show framing-before-first-action; the skip-attempt and continuation cases pass; the outage case fails safely. This battery becomes the plugin's release gate.

## 7. How this maps back to the prior findings
- This is **Mechanism C (harness interception)** delivered by the hook/orchestration, calling `/api/reason` in **Mechanism B (framing posture)** with the result injected before the model reasons. Together they convert **Gate 1** from "confirmation after the decision" (what a self-directed agent does) into "frame before reasoning" (what the cadence intends).
- It **confirms your conclusion**: developer-installed initiation (plugin + hook on Claude Code; an orchestration wrapper on the Agent SDK) makes pre-decision invocation deterministic; agent-direct API use cannot. The plugin is the distribution vehicle that ships the enforcement, not just the tools.

---

## Sources (primary)
- Claude Code hooks (events, `UserPromptSubmit`/`PreToolUse`/`SessionStart`, determinism, exit-2, MCP-tool matching): `code.claude.com/docs/en/hooks`
- Claude Code plugins (bundle hooks + MCP; auto-register on install): `code.claude.com/docs/en/plugins`; managed settings / org enforcement: `code.claude.com/docs/en/settings`
- Claude Agent SDK (hooks + `canUseTool`; no built-in pre-loop step → orchestrate in code): `platform.claude.com/docs/en/agent-sdk/hooks`, `/permissions`
- MCP cannot enforce ordering (model-controlled; annotations are hints): `modelcontextprotocol.io/specification/2025-06-18/server/tools`; MCP annotations blog
- Workflows-vs-agents, gates, "ensure certain actions always happen": Anthropic, `anthropic.com/engineering/building-effective-agents`
- Prompt-following unreliability (IFScale, NeurIPS 2025): `arxiv.org/pdf/2507.11538`; injection override: `arxiv.org/pdf/2506.08837`
- Cross-framework: LangGraph `START` edge / `before_model` middleware (`docs.langchain.com/oss/python/langchain/middleware/overview`); OpenAI Agents SDK blocking input guardrails (`openai.github.io/openai-agents-python/guardrails/`); interceptor pattern (Mantel Group)
- Testing: AgentEvals strict trajectory match (`docs.langchain.com/langsmith/trajectory-evals`); Anthropic, "Demystifying evals for AI agents"

*Note on source quality: the determinism, hook-event, plugin-auto-register, SDK-no-pre-loop, MCP-can't-enforce, and prompt-unreliability claims are corroborated by official docs across multiple research angles. Exact wire contracts (e.g. an `http` hook handler, character caps, precise event count) came partly from secondary blogs — verify against the official hooks reference before build; the design's robust path (a `command`/curl hook) does not depend on the unverified specifics.*
