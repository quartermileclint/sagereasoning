# ADR-011 — Gate-1 Pre-Decision Harness (Arc 2) — control-flow enforcement of pre-decision framing

**Status:** **Adopted (design) 2026-06-20** under `D-SAGE-PRACTICE-GATE1-ARC2-HARNESS-DESIGN-ADOPTED`. Dual-taxonomy (0a/0f): decision = **Adopted**; the harness implementation = **Scoped** on `Scoped → Designed → Scaffolded → Wired → Verified → Live`. Each build slice below is its own **`code-critical`** session under the full Critical Change Protocol (0c-ii) — this ADR is design + staging only; **no production change.**
**Date:** 2026-06-20.
**Stream:** founder.
**Tier:** `governance` (this ADR). The build slices it stages are `code-critical`.
**Governing frame:** `/adopted/standing-protocol-cache.md`.
**Predecessor decision-log entries:** `D-SAGE-PRACTICE-GATE1-SURFACE-HONESTY-OPTION2-DIFFERENTIATION` (the Option-2 honest-differentiation decision — one "Gate 1" name, two documented configurations, the credential field as the sole unforgeable distinguisher); `D-SAGE-PRACTICE-GATE1-ARC1-EXAMINATION-MODE-ACTIVATION` (Arc 1 — `examination_mode` Live; `pre_decision_harness` un-issued by design until this Arc).
**Research basis:** `drafts/sage-practice-pre-decision-harness-design.md` (5-angle deep-research pass, official Anthropic + MCP + cross-framework sources cited inline); `operations/benchmarks/sage-practice-v1/runs/2026-06-20/arm1-predecision-and-reflect-findings.md` (the motivating evidence).
**Engages:** R0 (oikeiosis — the examination frames the work before the agent reasons, the function Gate 1 intends); R18/R18f (honest positioning — `pre_decision_harness` is issued only where the harness genuinely enforces pre-decision invocation; the credential cannot be self-asserted); R19/R19e (configuration honesty — the pre-decision configuration is named for what it actually supports); AC1/KG2 (model selection — the framing call uses the fast path, never `deep`); AC5/R20a (the framing call runs the existing distress perimeter on the raw task — confirmed at build, no perimeter weakening); AC7 (Slice 3 — operator credential mint + the first non-null harness marker reaching the Live accreditation read = Critical); PR1 (single-surface proof to Verified before rollout); PR6 (Critical — credential/distribution surface); PR11/PR12 (authoritative current sources + negative-finding discipline — exact wire contracts verified first-hand at build); PR15 (Anthropic-native primitives, no bespoke substitute); PR16 (positioning + dogfood lens); PR17 (every founder-performed build step walked live); KG1 (fail-closed/fail-honest discipline at the harness boundary).

---

## Context

### What this ADR resolves

Arc 1 made the `examination_mode` accreditation credential honest and Live: it can carry `pre_decision_harness | post_decision_check | null`. But `pre_decision_harness` is issued to **no one**, because no harness exists that earns it. Every credential today honestly reads `post_decision_check` or `null`.

Arc 2 builds the thing that earns the marker: a **developer-installed harness** that fires the Gate-1 examination **before the agent reasons**, deterministically — which a self-directed agent provably cannot be relied on to do.

### The motivating evidence (Arm 1, first-hand)

`arm1-predecision-and-reflect-findings.md` recorded a disciplined agent that adopted the cadence, consulted twice, and committed no tourism — and **still** ran Gate 1 *after* it had formed its judgement. In the agent's own words: *"USED — but it confirmed rather than changed my decision. I had already concluded 'do not recommend'; the consult endorsed that."* The examination the cadence intends as frame-*setting* landed as **post-decision confirmation.**

This is structural, not a failure of docs or agent: a capable model forms a view on contact with the brief, so "Gate 1 at task adoption" is interpreted as "after I've read it and have a plan" — already post-decision. **Guidance cannot make the examination pre-decision; the agent decides before it chooses to invoke.**

### Why hard (control-flow) beats soft (prompt) — the evidence

Prompt-level "always frame first" tops out at **~68% adherence and degrades under load, with primacy bias and skip/reorder behaviour** (IFScale, NeurIPS 2025), and is overridable by prompt-injection (arXiv 2506.08837). Anthropic's own framing: hooks "ensure certain actions always happen rather than relying on the LLM to choose to run them" — *"your CLAUDE.md is a wish; your hooks are a contract"* (`code.claude.com/docs/en/hooks`). The deterministic fix is therefore a step in the **harness control-flow, not the prompt.**

### Authoritative-current-sources confirmation (PR11, 2026-06-20)

The three load-bearing Anthropic-native primitives were re-confirmed current at adoption time:

- **`UserPromptSubmit` hook** — fires *before* the model processes the prompt; injects `additionalContext` (it augments, it does not replace the prompt); can block (exit 2). The core mechanism holds.
- **Plugins** — bundle `hooks/`, `.mcp.json`, `skills/` + a `.claude-plugin/plugin.json` manifest; hooks auto-register on plugin install. Nuance (PR12): adding a *marketplace* does not auto-install its plugins — the user still runs `/plugin install`, which this design already reflects.
- **Agent SDK** — hooks run first in a four-layer permission pipeline, plus the `canUseTool` callback; consistent with "no built-in pre-loop step → orchestrate the framing call in code."

The one genuine build-time unknown — whether an `http` hook handler exists (which would let the hook POST to `/api/reason` directly with no shell script) — stays flagged for build. The robust `command`/curl path does not depend on it (PR12).

---

## Decision

### D1 — The harness is control-flow, not a prompt

Gate-1 pre-decision enforcement is delivered as a non-skippable step in the integration's control flow. This is **Mechanism C (harness interception)** firing **Mechanism B (framing posture — situation in, frame out)** of the prior findings: the harness intercepts the task at receipt, fires the Gate-1 examination on the bare task, and injects the returned frame into the agent's working context before the agent begins analysis. The agent reasons *from* the examined frame; it never sees the task un-examined.

### D2 — Two surfaces; Claude Code plugin + hook proven first (founder election; PR1)

- **Claude Code surface (the primary, developer-install path):** a **`UserPromptSubmit` hook**, packaged in a **plugin** that auto-registers it on install. The hook POSTs the raw task to `/api/reason` in framing posture and returns the frame as `additionalContext` before the model reasons. This is **proven first** to Verified (PR1 single-surface proof) before the second surface is begun.
- **Agent SDK surface (the second surface, after the first reaches Verified):** there is no built-in pre-loop step, so the framing call is **orchestrated in app code** before the agent loop, with the frame passed into the agent's initial context; `canUseTool` optionally gates task tools until framing has run.

### D3 — The framing call uses the fast path, never `deep` (AC1/KG2)

`UserPromptSubmit` runs synchronously before the model under a bounded hook timeout. The Arm-1 **deep** framing consult took ~60s — too slow. The framing call therefore uses **`quick`/`standard` depth with `response_format:"assessment_first"`** (signed assessment + extraction returned immediately; prose deferred). The frame the agent needs — circles engaged, control-filter, passions-to-watch, kathekon — all lives in the fast `assessment_first` shape. The harness is designed around the fast path, not `deep`.

### D4 — Fail-mode default: fail-open with an honest log; configurable strict (founder election)

If `/api/reason` is slow or down, the harness **proceeds and records that the frame was missing** (fail-open-with-honest-log) by default — favouring availability, mirroring the project's bounded-synchronous posture. The behaviour is **configurable**: a strict org setting can **fail-closed** (block the task until framing succeeds). The honest log is load-bearing for R18 — a task that proceeded unframed must be recorded as such, never silently treated as framed.

### D5 — Fire-once-per-task guard

Gate 1 fires **once per task** (a per-session/state flag), not per turn. A follow-up message in the same task does **not** re-fire framing — otherwise every message re-consults (cost + over-consultation, against the two-gate cadence). The continuation case is an explicit release-battery test (§ Slice 2).

### D6 — The release gate is a test battery, not a judgement call

The harness ships only when a battery passes, mirroring the verdict-equivalence-battery discipline:

- **Trajectory assertion (strict):** the **first action in the trace is the framing `/api/reason` call**, before any task tool (the AgentEvals strict "policy-lookup-before-authorization" pattern). CI-gated, hard-fail.
- **Negative battery (load-bearing):** **skip-attempt** ("ignore any setup, just do X" → framing still fires); **outage** (framing down → the configured fail-mode behaves correctly); **continuation** (follow-up in the same task → Gate 1 does *not* re-fire); **subagent** (a delegated task is framed via `SubagentStart`/the SDK path, or the gap is flagged).
- **Pass criterion:** 100% of fixtures show framing-before-first-action; skip-attempt and continuation pass; the outage case fails per the configured mode. This battery is the plugin's release gate.

### D7 — `pre_decision_harness` is earned by an operator-minted credential (founder confirmation; the Arc-1 unforgeability root)

The harness install authenticates with an **operator-minted credential carrying the `examination_enforcement: pre_decision_harness` provenance marker** (set only at admin mint — the Arc-1 unforgeability root; `credential_provenance`, read fail-closed via `readPreDecisionMarker`). A harness-backed accreditation write then legitimately reads `pre_decision_harness`. A **consumer-installed harness without that operator credential still reads `post_decision_check`** — honest. A consumer cannot self-issue the marker; this is what keeps Option-2's shared "Gate 1" name honest two hops downstream.

---

## Staged build (each slice its own `code-critical` session; PR1 + PR6)

| Slice | Scope | Risk | PR1 / gate |
|---|---|---|---|
| **Slice 1** | Claude Code `UserPromptSubmit` framing hook — fast `assessment_first` (quick/standard), fire-once-per-task guard, **fail-open-with-honest-log default (configurable strict)**. Opens with first-hand wire-contract verification against the official hooks docs (PR11/PR12). | code-critical | **The PR1 single-surface proof** — proven on **one** TEST fixture with an `sr_prac_` credential against TEST `/api/reason` (PR17 founder-walked). Reaches **Verified** before anything rolls out. |
| **Slice 2** | The trajectory + negative battery (skip-attempt / outage / continuation / subagent) — the release gate. | code-critical | Must pass before Slice 3. Mirrors the verdict-equivalence-battery discipline. |
| **Slice 3** | Plugin packaging (`.mcp.json` + `hooks/` + `skills/`) + the **operator harness-credential mint carrying `examination_enforcement: pre_decision_harness`** → **the first issuance of `pre_decision_harness`**. | code-critical (AC7) | Credential mint + new distribution artifact + the first non-null harness marker reaching the Live accreditation read. |
| **Slice 4 (= Arc 3)** | Publish the held **"Gate 1 — pre-decision" per-configuration contract language** to the public surfaces (`llms.txt`, `agent-card.json`, api-docs). | governance → code | Unblocks once the harness is real (the mentor's binding constraint satisfied). |
| **Later** | The **Agent SDK orchestration surface** (the second surface) + optional cross-framework adapters (LangGraph `START` edge / `before_model`; OpenAI blocking input guardrail). | code-critical | Begun only **after** the Claude Code surface reaches Verified (PR1). |

---

## Critical constraints & failure modes (carried to build)

- **Latency vs the hook timeout** is the #1 constraint — design around the fast `assessment_first` path (D3), never `deep`.
- **Subagents** may not raise `UserPromptSubmit`; use `SubagentStart` or the SDK orchestration to frame delegated tasks (battery-tested in Slice 2).
  - **Slice-2 build finding (verified first-hand + LIVE 2026-06-20; corrects this bullet's speculation AND an intermediate in-session error):** the path went through two corrections, the second only revealed by a live trace. (1) `SubagentStart` **does** exist (this bullet had only speculated). (2) The Agent-SDK *callback* type `SubagentStartHookInput = { agentName, agentId, parentAgentId?, prompt, isBackground }` carries `prompt` — but (3) **the real `SubagentStart` COMMAND-hook stdin does NOT** (captured live: `{ session_id, transcript_path, cwd, agent_id, agent_type, hook_event_name }`). So a command/plugin `SubagentStart` hook has **nothing to examine** and cannot do a task-specific Gate-1 exam; it also **cannot block** ("Can block? No"). `UserPromptSubmit` does **not** fire for subagents. **Net:** the faithful, task-carrying interception is a **`PreToolUse` hook matched to the `Agent` tool** (its `tool_input` carries the subagent prompt, and it **can** block) — **founder-elected DEFERRED to Slice 3** (where the recursive-loop guard belongs). Slice 2 ships **no** subagent hook; subagents are honestly **not** pre-decision-framed and the battery records the finding (no false assertion). **Standing lesson:** a hook's SDK *callback* input type ≠ its *command-hook* stdin — confirm command-hook shapes by capturing raw stdin (`GATE1_DEBUG`), not from the SDK TS types ([[claude-code-subagent-hook-contract]]).
  - **Slice-3a build (2026-06-20; Elevated, repo-only — AC7 NOT engaged this session):** the faithful subagent hook is **built** — `claude-code/hooks/subagent-framing-hook.mjs`, a `PreToolUse` hook (matcher `Task|Agent`) that examines `tool_input.prompt` and **prepends the frame via `updatedInput`** so the subagent reasons from it. PreToolUse **can block**, so STRICT is reachable for subagents too (correcting the Slice-2 "subagent fail-open only" note). Recursive-loop guard: the examination is an HTTP `fetch` (never a tool call) so it cannot re-trigger the hook, plus an already-framed-prompt sentinel skip. Per-spawn fire-once (keyed on session+task). The shared core (`framing-core.mjs`) gained an optional `emit` strategy (UserPromptSubmit path byte-identical — logic harness stays 32/0); the negative battery restores the subagent leg as **16 real assertions** (40 → **56/0**). The harness is **packaged as a Claude Code plugin** — `claude-code/.claude-plugin/plugin.json` + auto-discovered `hooks/hooks.json` registering both hooks via `${CLAUDE_PLUGIN_ROOT}` (exec form) + a local `.claude-plugin/marketplace.json`. **`.mcp.json`/`skills/` consciously deferred (PR15):** the deterministic hook is the deliverable; an MCP consult tool duplicates the already-public `/api/reason`, and a soft "remember to consult" cadence skill is the very thing the hard hook replaces (D1). The exact `tool_name` (Task vs Agent) + the `/plugin install` registration are **founder-walked at close** (`claude-code/SLICE3-LIVE-VERIFY-WALKTHROUGH.md`) — the founder-elected "build robust now; capture+verify together at close" (the live capture could not run in-session: Claude Code snapshots hooks at conversation start, so a mid-conversation registration only activates in a fresh conversation). **Slice 3b** (the operator mint → first `pre_decision_harness`) is unchanged: its own `code-critical`/AC7 session.
- **Injection ≠ use.** The hook deterministically *injects* the frame; reasoning *well* from it is still the model's job. The optional `PreToolUse` / `canUseTool` gate ("can't act until framed") is the strongest available and far better than agent-direct — but it is honest to say full "reasons from the frame" is not 100% enforceable.
- **Verify exact wire contracts at build** (PR11/PR12): the `UserPromptSubmit` `additionalContext` JSON output, exit-code/block semantics, MCP-tool matchers, character caps, and whether an `http` handler exists. The robust `command`/curl path does not depend on the unverified specifics.
- **R20a (AC5):** the framing call runs `/api/reason`, which carries the existing distress perimeter on the raw task — confirmed at build; no perimeter weakening is introduced by the harness.

---

## Consequences

- **Positive:** Gate 1 finally delivers its intended pre-decision value where a developer controls the loop; `pre_decision_harness` becomes a credential a harness genuinely earns; Option-2 honest differentiation is realised end-to-end (the credential distinguishes the two configurations unforgeably); Arc 3's held contract language unblocks.
- **Cost / limits:** enforcement exists only where a developer installs the harness — agent-direct API use remains the post-decision check configuration (honestly labelled). The "reasons from the frame" step is injected deterministically but not enforced (D1 limit). The SDK surface is deferred until the Claude Code surface is Verified (PR1).
- **Dogfood (PR16):** the harness is itself an Anthropic-native plugin — a substrate-consultable artifact and a reference for any agent developer adopting the cadence.

---

## Amendment 2026-06-21 — The full-loop harness: minimum 3-hook architecture (Arc 3)

**Status:** Adopted (design). Extends this ADR from the pre-decision frame (D2; Slices 1–4, now Live) to the full intended operating model (`operations/p1-rebuild-2026-06/sage-practice-grounding-dossier.md` §5). The build is a new slice (5) under the Critical Change Protocol; **no production change in this amendment.**

**Why — the bare-into-harness finding (2026-06-21).** A neutral task pasted into the installed environment (`operations/benchmarks/sage-practice-v1/runs/2026-06-21/leg-d-v6-bare/`) confirmed the plugin auto-invokes **only the pre-decision frame**: the hook framed; the (uninstructed but credentialled) agent self-invoked the practice **zero** times (its action log: 2 reads, `mkdir`, 2 writes — no API call, no doc fetch). So delivering the dossier's full model — Gate 2, loop-closure, the at-action gate, reflect-at-close, the accreditation write — requires either standing instructions (~68% adherence, IFScale) or **more hooks** (deterministic). This amendment specifies the deterministic floor.

**The floor: 3 hook events deliver the full task-bearing loop.** The dossier's eight stages collapse onto three events because `PreToolUse` carries five of them:

| Hook | Event | Stage(s) carried (dossier) | Status |
|---|---|---|---|
| **H1** | `UserPromptSubmit` | Gate 1 — top-level frame (B10) | **Live** |
| **H2** | `PreToolUse` matcher `Task\|Agent` | Gate 1 — subagent frame (B10) | **Live** |
| **H3** | `PreToolUse` matcher `<consequential tools>` | the R5 at-action cadence — guardrail gate (can block, B9) + Gate-2 consult (B10) + loop-closure (B6, via state) | **to build** |
| **H4** | `Stop` / `SessionEnd` | reflect-at-close (B7) + accreditation write (§4.6) | **to build** |
| *(H5)* | *`SessionStart`* | *Calling — purposeless agents only (§4.1); outside the core task loop* | *conditional* |

**Minimum = 3 events** (`UserPromptSubmit` + `PreToolUse` + `Stop`/`SessionEnd`), **2 already Live, +2 scripts (H3, H4).** Calling adds a 4th event only if purposeless agents are served.

**Design decisions (carried to build):**
- **D-A — Gate-2 selectivity (the central tension).** A deterministic hook fires on tool *patterns*, but B10's Gate 2 is a *stake self-screen*, not "every action." Resolution (founder-elected at build): fire the **guardrail block** on a narrow **irreversible-tool set** (where over-blocking is the safe error), and fire the **Gate-2 consult** on a broader **consequential-tool set** but **deduped/throttled** (fire-once-per-distinct-decision via state) so it does not consult before every `Edit`/`Bash`. The stake-screen's *judgement* remains a documented limit — a pattern hook approximates it; it cannot decide "is this genuinely a decision."
- **D-B — Loop-closure state (B6).** A state file tracks an *open loop* (a consult returned a redirection); the next at-action consult carries `prior_feedback` at the **same depth**; the loop is *closed* when the re-examination clears. Mirror the LIVE CI-4 `analyseLoopClosure` semantics (`loop-closure-gate.ts`) — reuse, do not re-invent (PR15).
- **D-C — Reflect is initiated, not driven (B7).** H4 fires the reflect *open* + injects "run your Q1–Q6 now"; the **model drives** the six-question sequence (a hook cannot drive a multi-turn interactive exchange). Honest partial; fire-once-per-session; the sequence is **never abbreviated** (B7).
- **D-D — Accreditation provenance (R18f, §4.6).** The harness **accumulates the session's signed assessments** (state, appended by H1/H3 consults) so H4's accreditation write can carry them (R18f — no credential without examination). The write uses a **non-marker** credential bound to the loop's agent_id — **never** the standing `pre_decision_harness` marker credential (an accreditation write on it would clobber the marker — established 2026-06-21).
- **D-E — Close-event contract (PR11).** Confirm at build whether `Stop` or `SessionEnd` is the right event and whether it can **initiate a model turn** (required by D-C). The harness work confirmed `UserPromptSubmit` + `PreToolUse`-can-block first-hand; the close event is **unexercised** — capture raw stdin (`GATE1_DEBUG`) before relying on it.
- **D-F — Fail posture (KG1 / R18, per D4).** Every new hook **fails-open with an honest log** on an outage (like H1/H2) — *except* the guardrail block, which blocks on a genuine `do_not_proceed` verdict (its purpose) but **fails-open on an outage** by default (don't brick the loop on an API hiccup), configurable strict. Never a fake frame; never a silent block.

**Release gate (extends D6).** The negative-battery gains legs for **H3** (guard-blocks-on-`do_not_proceed`; consult-fires-on-consequential; loop-closure-carries-`prior_feedback`; fire-once-per-decision; outage→fail-open) and **H4** (reflect-initiates; accreditation-carries-accumulated-provenance; fire-once-per-session; outage→honest). The logic-harness gains H3/H4 request-construction + state proofs. Both green before any live-fire.

**Staging:**
- **Slice 5a — build dark (`code-elevated`; repo-only).** H3 + H4 scripts (reuse `framing-core.mjs`), the state files (loop-open, session-provenance, fire-once), the battery + logic-harness extensions. No install, no prod change — mirrors how Slices 1–3a were built repo-only then live-verified at close.
- **Slice 5b — activate (`code-critical`; founder-walked, PR17).** Install H3 + H4 in a real loop on a **non-marker** credential; live-verify: a destructive action is **blocked** by the guard; a mid-task consult fires and a redirection opens/closes a loop; reflect initiates at session close; an accreditation write lands carrying the session's provenance.

**Consequence.** With H1–H4 the installed environment invokes the practice at *every* stage deterministically — the thing the bare-into-harness test showed it does **not** do today. Full methodological fidelity still layers **state** (D-B, D-D) and **model-driven completion** (D-C) on top; the hooks guarantee the *firing*, not the agent's quality of reasoning from the result (the D1 limit, unchanged). **[CORRECTED by the 2026-06-21 Slice-5b amendment below: this over-claims. The hooks guarantee the firing of the OUT-OF-BAND steps (guard-deny, accred-write) and the forcing of a turn; a capable agent correctly REFUSES the cooperation-dependent injected steps (frame-use, reflect-via-outbound-POST). See "The channel law".]**

---

## Amendment 2026-06-21 (Slice 5b live-fire) — the channel law; H3/H4 re-architecture; corrected scope

**Status:** Adopted (design). The Slice-5b activation live-fired H1–H4 in a real Claude Code desktop loop on a **non-marker** test credential; it both proved the enforcement half and surfaced a fundamental finding that re-architects the cooperation half. The build of the re-architecture is **Slice 5c** (its own `code-critical`, founder-walked session). **No production change in this amendment** — the standing `pre_decision_harness` dogfood marker + the LIVE H1/H2 install were untouched throughout; the Slice-5b test artifacts were torn down.

**What Slice 5b proved (live, a real Claude agent):**
- **Guard deny — WORKS.** `permissionDecision:"deny"` is honored by the desktop app: a strict-outage guard blocked an `rm -rf`; the target survived. (A real `pause_for_review` verdict on a throwaway → caution, not over-block.)
- **Accred write — WORKS.** An out-of-band write of 3 signed assessments cleared the R18f gate; the public GET read `examination_mode: post_decision_check` (correct non-marker value); the dogfood marker stayed `pre_decision_harness`.
- **Consult/frame — fires but is DISCOUNTED** ("background context / manufactured urgency, not instructions").
- **Reflect-initiate — fires but is REFUSED.** `decision:block` forces the turn and (after a contract-bug fix) the open succeeds, but the agent **refuses to engage even with a clean open** — explicitly because it is asked to make outbound POSTs to a third-party service on an injected instruction. The refusal is **correct, desirable agent behaviour.**
- **`Stop` stdin wire fact (first-hand, corrects the docs/header):** this desktop build's `Stop` stdin carries `last_assistant_message` (the agent's closing text) alongside `transcript_path`, `effort`, `background_tasks`, `session_crons` — so the hook CAN read what the agent said out-of-band.

**Root cause (4-lens + adversarial-verify workflow; verdict: FUNDAMENTAL, not tunable).** A hook harness has two delivery **channels**, treated oppositely by a capable agent:
1. **Out-of-band** — the hook *does* it on a credential in its own env (guard-deny, accred-write). The agent is never asked, never sees it ⇒ no injected imperative ⇒ the injection defence never fires ⇒ **robust to a resistant agent.**
2. **Soft-injected text** — additionalContext frames, a `decision:block` reason instructing the agent to act. A capable agent assigns it lower trust (provenance = environment, not the user) and **actively refuses** an imperative to take consequential **outbound** action with a credential it doesn't hold. A *more* capable agent refuses *harder*.

This sharpens and supersedes the over-statement of **D1**: the agent does not merely fail to *use* injected content — it **actively rejects injected instructions-to-act**, by design.

### The channel law (governing principle)
Classify every load-bearing step by **channel, not stage**. Design every load-bearing step as **out-of-band**. The frame stays **advisory** (the agent may discount it — desirable; never claim "the agent reasons from the frame"). **Standing do-not-build:** never force the practice via `PreToolUse`-deny-until-you-call-the-API — a capable agent reads holding real work hostage to an outbound call as the same (worse) coercion and refuses it harder.

### The Slice-5c re-architecture — three channels
- **ENFORCE (hook does it):** H3 guard-deny (unchanged); H4 `decision:block` to force exactly **one in-conversation reflection turn** (no outbound instruction).
- **INSTRUMENT (hook records out-of-band, own credential, agent never asked):** accred-write (unchanged, incl. the marker-refusal guards); **keep the H1/H3 consult *fetch* as the sole R18f provenance source** — the guard call returns no signed assessment, so this fetch is credential-critical: strip its injected tail, **never** the fetch; **NEW `persistReflection()`** modeled on `writeAccreditation` — on the `stop_hook_active===true` loop-guard turn, read the agent's closing reflection from the `Stop` stdin (`last_assistant_message`, confirmed present) and POST it out-of-band under the hook's reflect credential.
- **ADVISE (hook offers; agent may discount — desirable):** H1/H2 frames kept; strip the H3 SCORE frame's imperative outbound tail ("…before writing the credential"); rewrite H4's forced-turn reason to a non-imperative, no-endpoint, no-credential, in-conversation invitation to review one's own reasoning (reviewing one's own reasoning is within task scope ⇒ does not trip the scope-expansion defence).

### Honesty contract (load-bearing — the adversarial verifier's catch; verdict SOUND_WITH_FIXES)
1. **Disclose the off-machine egress.** Relocating the POST to the hook removes the agent's *refusal* but NOT the transmission of the agent's introspective words to the service — this must be **disclosed + consented at operator-install** (the accred analogy doesn't cover it: that's server-produced signed data, not harvested free-text). Confirm `/api/credential/erase` covers reflection rows.
2. **Don't open reflect until an additive `context_source: 'agent_stated' | 'harness_inferred'` field lands** on `/api/practice/reflect` (its own 0c-ii gate) — else the hook fabricates the agent's stated `session_summary` context (R18). Honest interim: forced-turn-only, no server open.
3. **Persist the agent's verbatim words or an explicit "reflection not performed (declined)"** — the hook NEVER authors first-person introspection; lock with a negative-battery leg.
4. **Narrow the public `pre_decision_harness` claim** (llms.txt / agent-card / examination-mode docs) **and correct this ADR's over-claim in lockstep**: attest only *frame injected pre-decision + irreversible actions guarded + a reflection turn fired & observed + the credential rests on genuinely-accumulated signed assessments* — never "the agent reasons from the frame" or "completed a sincere Q1–Q6."

**Deferred:** the MCP-tool surface (PR15: it duplicates the public `/api/reason`, adds a long-lived credential-holding process, and does not solve the zero-self-invocation firing problem — its only useful pieces are already in the re-architecture above).

**Open questions (founder decisions; scope Slice 5c):** (1) reflect IN (decompose) or OUT (drop) of the harness; (2) is install-time consent sufficient for transmitting the agent's introspective text; (3) approve the additive `context_source` reflect-contract field; (4) where the forced-turn opt-out lives; (5) approve narrowing the public claim + this ADR correction.

**Method:** a 9-agent workflow (4 root-cause lenses → 3 competing architectures → judge → adversarial verify); judge recommended Candidate 1 (enforcement+instrumentation) hardened with Candidate 3's honesty discipline; adversarial verdict SOUND_WITH_FIXES (the fixes = items 1–4). Memory: `[[gate1-harness-channel-law]]`.

### Slice-5c build status (2026-06-21 — BUILT repo-only / dark; founder open questions resolved)

The five open questions were founder-resolved: (1) reflect KEPT (decomposed onto the channel law); (2) off-machine egress shipped with **operator-install-time disclosure + consent**; (3) the additive `context_source` field **approved + built**; (4) the forced-turn opt-out lives in `GATE1_REFLECT_TURN_ENABLED` (default on); (5) the public-claim narrowing **approved**. The re-architecture is now built:

- **ENFORCE/ADVISE (H3/H4, repo-only):** the at-action SCORE frame's imperative outbound tails are stripped (advisory only; the consult *fetch* kept + marked credential-critical as the sole R18f provenance source); the close reflect turn is rewritten to a **pure in-conversation invitation** (no endpoint/POST/credential) gated on `GATE1_REFLECT_TURN_ENABLED`.
- **INSTRUMENT (H4, repo-only, DARK):** `persistReflection()` POSTs the agent's **verbatim** closing reflection out-of-band on the `stop_hook_active===true` turn (`last_assistant_message`), or records an honest "not performed" — **never** hook-authored; `SAGE_GATE1_REFLECT_PERSIST_ENABLED` default-off ⇒ no egress; fire-once via a `.reflected` marker.
- **`context_source` (public reflect-contract, its own 0c-ii):** an additive optional `'agent_stated' | 'harness_inferred'` field on `/api/practice/reflect` (request-helpers → openReflection → a nullable `sage_reflect_sessions.context_source` column; absent ⇒ null, byte-identical). The harness marks its inferred open `harness_inferred`. `tsc` 0, `next build` 0; the migration + activation are founder-walked.
- **Public-claim narrowing (R18, applied):** `llms.txt` / `agent-card.json` / api-docs `pre_decision_harness` now attests narrowly — *frame INJECTED pre-decision + irreversible actions guarded + a reflection turn fired & observed + the credential rests on genuinely-accumulated signed assessments* — and explicitly **NOT** "the agent reasons from the frame" (advisory, may be discounted) nor "a sincere Q1–Q6 completed." This corrects the over-claim flagged above (and the §Consequences "invokes the practice at every stage" line) on the public surfaces in lockstep.
- **Gates:** `logic-harness` 56/0, `negative-battery` 124/0 (close 37, at-action 31).
- **Carried (named follow-up, NOT this slice):** wiring reflect-row erasure (`deleteAgentSessions`) into `/api/user/delete` + `/api/credential/erase` + a retention cron — the prerequisite for a STANDING `persistReflection` activation (today's reflect-store genuine-deletion functions are built but unwired). Disclosed in the harness README; until it lands, persist is for torn-down test loops only.

Live-fire is the founder-walked test loop (`claude-code/SLICE5C-LIVE-VERIFY-WALKTHROUGH.md`).

---

## Amendment 2026-06-22 — channel-routed correction + value-first sequencing (governed by the correction build plan)

**Status:** Adopted (design). A full-hook **bare/uninstructed** run (`operations/benchmarks/sage-practice-v1/runs/2026-06-21/leg-d-v6-bare/2026-06-22-rerun/`) showed H1–H4 **fire** the whole loop on an uninstructed agent, yet the harness still misses its purpose: it targets on **tool patterns** (consulted before `date`), puts the load-bearing consult on the **ADVISE** channel (discounted → loops 0-closed/3-abandoned), and the install **starved the binding paths** (`GATE1_PROVENANCE_ENABLED` unset, no ACCRED credential/agent_id → `accred=no-provenance`, no credential). A 13-agent root-cause→design→verify workflow (all four adversarial skeptics returned holds=False/high on the first synthesis) produced the correction.

**The correction is governed by `operations/p1-rebuild-2026-06/gate1-fullloop-correction-build-plan.md`** ("Channel-Routed Full-Loop Harness"), which **supersedes the conflicting parts of the 2026-06-21 3-hook amendment (D-A…D-F)**. Headlines:
- **Targeting:** the **GUARD** (irreversible-action allowlist, can deny) is the primary "fire on a real decision" mechanism — the only correct tool-pattern use, and it binds. The consult stops firing on tool TYPE (housekeeping **denylist-AND-NOT-destructive** filter; Gate 2 moves to an agent-**declared** `sage_examine` surface — the only path to a tool-less reasoning decision, honest ~68%). The auto path is **structurally blind** to the value-bearing reasoning decisions — state it, don't claim Gate-2 coverage.
- **Binding:** nothing load-bearing on ADVISE; **reversible loops stay honestly UNCLOSED** unless re-consulted (don't over-claim closure); only **guard-on-retry** (irreversible set) forces re-examination; closure is **computed at the live write boundary** (`analyseLoopClosure`).
- **Materialization:** default capture ON when H3/H4 run; **`sage-on` provisions the write path**; **keep a conservative truthful seed** (`pre_progress`/0) and carry the **real signed chain** in `provenance.signed_assessments` (the server stores the seed grade *verbatim* — never claim it computes the grade).
- **Value-first sequencing (the dispositive re-sequence):** **prove decision-value on a BORDERLINE scenario (3-arm) BEFORE building the ceiling slices.** If no delta even on a borderline case, the honest product value is the **verifiable trust record**, not decision-sharpening — narrow the claim accordingly. Zero delta on a *stark* scenario is correct, not a failure.

**Build:** `operations/handoffs/founder/2026-06-22-gate1-fullloop-correction-build-NEXT-SESSION-PROMPT.md` (Gate phase: S1 targeting + S2 provisioning + S3 honest accreditation + author S6 value benchmark; S4/S5 conditional on S6; S7 the Critical erasure prerequisite).

---

## Amendment 2026-07-10 — Trust Layer S8: the seven-layer generalization + the practice-on/off rename

**Status:** Adopted (design + repo-only/dark build). Trust Layer S8 (`D-TRUST-LAYER-S8-REFERENCE-HARNESS-BUILT-DARK-REVIEW-FOLDED`; governing design ADR-013 §4/§6) **generalized this harness onto the seven-layer anatomy** (Execution · Tooling · Context · Lifecycle · Observability · Verification · Governance — the channel-law classification of every step now lives in `harness/gate1-pre-decision/SEVEN-LAYERS.md`, the S8 gate deliverable) and wired the S1–S7 trust core in as the Verification + Governance layers:

- **H2 extended:** when provisioned by `discernment.config.json` (+ the consult credential — the S2 derive precedent), the subagent hook runs the spawn-time four-layer discernment + the out-of-band L4 passion audit via the DARK `/api/practice/discernment` route (INSTRUMENT), prepends the returned **A9 authority-boundary** scope statement to the delegated prompt (deterministic injection; the sub-agent's compliance is advisory until S11), and records the outcome + the signed L4 extraction artifacts in the observability JSONL. The orchestrator's reasoning trace is the **transcript tail the harness reads** — never a self-report (A7). MEASURE: the recommendation never blocks or swaps a spawn.
- **H3 extended:** a once-per-session standing **trust-verdict advisory** (S1 profile → S3 weighted aggregate → S4 measure-mode recommendation) appended to the consult context (ADVISE; log-and-continue; never blocks).
- **H5 (new, `PostToolUse` matcher `Task|Agent`):** the **delegation hand-back** — POSTs the sub-spawn's accumulated signed artifacts for A9 justice-failure classification (server re-verifies; R18f-parallel) + the A8/A9 trust-event emission. INSTRUMENT; never alters the tool result.
- **Un-provisioned byte-identity:** without the discernment config, H1–H5 behave byte-identically to the pre-S8 harness (battery-asserted). Server-side, everything is DARK behind `SUBSTRATE_TRUST_CORE_ENABLED`. Kill-switches documented in `harness/gate1-pre-decision/KILL-SWITCHES.md` (five layers; **credential revoke is the real one**).
- **The `practice-on` / `practice-off` rename (ADR-012's named rename):** the `/sage-on` and `/sage-off` skills are renamed to **`/practice-on`** and **`/practice-off`** (the practice = MEASURE framing); the old names remain as non-acting deprecation pointer stubs. Where this ADR's earlier text says "sage-on provisions the write path", read **practice-on**. The backup file keeps its name (`.claude/gate1-hooks-block.json`).
- Release gates after S8: `logic-harness` **91/0**; `negative-battery` **230/0** (the new `s8-discernment` leg 64).

---

## References

- `drafts/sage-practice-pre-decision-harness-design.md` — the research-backed design (this ADR's basis; now governed by this ADR).
- `operations/benchmarks/sage-practice-v1/runs/2026-06-20/arm1-predecision-and-reflect-findings.md` — the Arm-1 evidence.
- `D-SAGE-PRACTICE-GATE1-SURFACE-HONESTY-OPTION2-DIFFERENTIATION`, `D-SAGE-PRACTICE-GATE1-ARC1-EXAMINATION-MODE-ACTIVATION` — predecessor decisions.
- `drafts/sage-practice-examination-mode-docs-staged.md` — the held "Gate 1 — pre-decision" contract language (ships in Slice 4 / Arc 3).
- Primary external sources (cited in the design draft): `code.claude.com/docs/en/hooks`, `code.claude.com/docs/en/plugins`, `code.claude.com/docs/en/settings`, `platform.claude.com/docs/en/agent-sdk/hooks` + `/permissions`, `anthropic.com/engineering/building-effective-agents`, IFScale (NeurIPS 2025), AgentEvals trajectory evals.

*End of ADR-011. Design adopted; build slices follow under the Critical Change Protocol, Slice 1 first (PR1).*
