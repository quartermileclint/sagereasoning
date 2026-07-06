# Next-Session Prompt — Gate-1 Arc 2: Pre-Decision Harness — design decision + build staging

**For the founder. Paste as the first message of a fresh session.**

**Stream:** founder.
**Tier:** `governance` (this session = design decision + build staging; **no production change**). The build slices that follow are each their own **`code-critical`** session (new distribution artifact + credential mint + the first issuance of `pre_decision_harness`).
**Governing frame:** /adopted/standing-protocol-cache.md.
**Predecessor close:** operations/handoffs/founder/2026-06-20-gate1-arc1-examination-mode-ACTIVATION-close.md.
**Predecessor decision-log entry:** `D-SAGE-PRACTICE-GATE1-ARC1-EXAMINATION-MODE-ACTIVATION`.
**Risk classification:** Standard under 0d-ii (design + decision-log only). Critical Change Protocol NOT engaged this session — but it governs every build slice that follows.

## Why this session matters

Arc 1 made `examination_mode` honest and live — but `pre_decision_harness` is issued to **no one**, because no harness exists yet. Every credential today honestly reads `post_decision_check` or `null`. Arc 2 builds the thing that earns `pre_decision_harness`: a **developer-installed harness** that fires Gate-1 framing **before** the agent acts — deterministically, which a self-directed agent provably cannot be relied on to do (Arm 1 showed a disciplined agent still framed *after* deciding; prompt-level "frame first" tops out ~68% adherence and is injection-overridable). The fix is control-flow, not prompt: a Claude Code plugin + `UserPromptSubmit` hook on the native surface, and a code-orchestration wrapper on the Agent SDK surface.

This session is the **design decision + build staging** — not the build. It ends with an adopted (or refined) design and a PR1-respecting slice plan.

## Pre-conditions

1. Arc 1 is **Live** (`examination_mode` activated 2026-06-20; committed, pushed, Vercel green; `agent_test_v1` reads `examination_mode: null`).
2. The harness design draft exists and is research-backed: `drafts/sage-practice-pre-decision-harness-design.md`.
3. 0h is still held — this is pre-0h trust-layer honesty work and does not touch the launch call.

## Part A — Open under the protocol

Read in order:
1. /adopted/standing-protocol-cache.md (~3 min — tier, model selection, risk class, signals)
2. operations/handoffs/founder/2026-06-20-gate1-arc1-examination-mode-ACTIVATION-close.md (~3 min)
3. **drafts/sage-practice-pre-decision-harness-design.md — in full** (the deliverable of the day)
4. operations/benchmarks/sage-practice-v1/runs/2026-06-20/arm1-predecision-and-reflect-findings.md (the finding that motivates Arc 2)
5. /operations/decision-log.md — last 2 entries

Confirm at open: tier (`governance`); 0h held; model selection (N/A for this design session — but note the harness's framing call must use the **fast `assessment_first` path** at `quick`/`standard` depth, never `deep`, per the design's latency constraint — confirm at build, KG2/AC1); status vocabulary; signals + risk class.

## Part B — Procedure (Design + Decision)

### Step 1 — AI surfaces the design spine + the open decisions
The AI states, plainly, the design's load-bearing claims and the decisions they force (don't re-derive — carry from the draft): harness = control-flow not prompt; two surfaces (Claude Code plugin/hook + Agent SDK orchestration); the fast `assessment_first` framing path; fail-open-logged vs fail-closed on outage; fire-once-per-task guard; the trajectory/negative test battery as the release gate.

### Step 2 — PR15 + PR11/PR12 check (Anthropic-native posture)
The design is already Anthropic-native (Claude Code hooks + plugins + Agent SDK) — confirm no bespoke substitute is being reached for. **Flag for build:** the exact wire contracts (`UserPromptSubmit` `additionalContext` output, exit-code/block semantics, MCP-tool matchers, and whether an `http` hook handler exists) must be verified first-hand against `code.claude.com/docs/en/hooks` and `code.claude.com/docs/en/plugins` at build time (PR11 authoritative-current-sources; PR12 negative-finding discipline). The robust path (a `command`/curl hook) does not depend on the unverified specifics.

### Step 3 — Founder decisions (surface as options with reasoning; the founder elects)
1. **Adopt or refine** — promote the draft to an adopted Arc 2 ADR, or refine it first. (Governing-doc change → explicit founder approval; previous version preserved via git.)
2. **First surface (PR1 single-surface proof)** — the Claude Code plugin/hook path (the named primary, strongest, developer-install) **or** the SDK orchestration path. *AI recommendation:* Claude Code plugin/hook first; SDK second.
3. **Fail-mode default** — fail-open-with-honest-log (availability) vs fail-closed (strict). *AI recommendation:* configurable, default fail-open-logged; a strict org setting can fail-closed.
4. **`pre_decision_harness` issuance model** — confirm the harness install authenticates with an **operator-minted credential carrying the `examination_enforcement: pre_decision_harness` provenance marker** (the Arc-1 unforgeability root, set only at admin mint). This is what makes a harness-backed accreditation write legitimately read `pre_decision_harness`. A consumer-installed harness without that operator credential still reads `post_decision_check` — honest.

### Step 4 — Stage the build (each slice its own `code-critical` session, PR1 + PR6-aware)
Proposed slices (the founder adjusts):
- **Slice 1** — the `UserPromptSubmit` framing hook (Claude Code surface), fast `assessment_first` path, fire-once guard. Proven on **one** TEST fixture with a `sr_prac_` credential (PR1 single-surface proof; PR17 founder-walked).
- **Slice 2** — the trajectory + negative battery (skip-attempt / outage / continuation / subagent) — the release gate, mirroring the verdict-equivalence-battery discipline.
- **Slice 3** — plugin packaging (`.mcp.json` + `hooks/` + `skills/`) + the operator harness-credential mint with the pre-decision marker → **the first issuance of `pre_decision_harness`** (Critical — credential mint + new distribution artifact, AC7).
- **Slice 4** — publish the held **"Gate 1 — pre-decision" per-configuration contract language** (this is Arc 3; it unblocks once the harness is real — the mentor's binding constraint is satisfied).

### Step 5 — Append decision-log entry (lean form)
Record the adopted (or refined) design + the staging, OR a PR7 deferred-decision entry if the founder elects to refine first.

### Step 6 — Session close (lean form)
No code this session → lean close. If the founder elects to proceed straight into Slice 1, switch to the Critical templates and the full Critical Change Protocol before any code.

## Part C — Anticipated session shape

| Phase | Estimate |
|---|---|
| Cache + Arc 1 close + harness draft read | 15–20 min |
| Step 1–2 (spine + PR15/PR11 check) | 15 min |
| Step 3 (founder decisions) | 20–30 min |
| Step 4 (staging) | 15 min |
| Decision-log + close | 15–20 min |
| **Total** | **~1.5 hours** |

## Rollback path

None needed — governance/design only, no production change. If the design is refined rather than adopted, the draft stays a draft (non-governing) and nothing ships.

## Forecast

End with an adopted (or consciously refined) harness design and a staged, PR1-respecting build plan; Slice 1 scoped for the next session. Completing Arc 2 is what finally lets a credential honestly read `pre_decision_harness` — and unblocks Arc 3's contract language. The 0h launch call remains the founder's throughout.

## Cross-references
- drafts/sage-practice-pre-decision-harness-design.md (the design — this session's deliverable)
- operations/handoffs/founder/2026-06-20-gate1-arc1-examination-mode-ACTIVATION-close.md (Arc 1 activation close)
- /operations/decision-log.md — `D-SAGE-PRACTICE-GATE1-ARC1-EXAMINATION-MODE-ACTIVATION`, `D-SAGE-PRACTICE-GATE1-SURFACE-HONESTY-OPTION2-DIFFERENTIATION`
- drafts/sage-practice-examination-mode-docs-staged.md (the held "Gate 1 — pre-decision" contract language — ships in Slice 4 / Arc 3)
- operations/benchmarks/sage-practice-v1/runs/2026-06-20/arm1-predecision-and-reflect-findings.md (the motivating finding)

End of prompt.
