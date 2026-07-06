# Next-Session Prompt — Gate 1 surface honesty: examination_mode credential (Arc 1) + the two follow-on arcs

> **For the founder.** Paste this as the first message in a fresh session. It executes **Arc 1** (the `examination_mode` credential field — the Option-2 gating safety item, built **dark + un-issued**) and then carries **Arc 2** (the pre-decision harness/plugin) and **Arc 3** (the hosted-configuration contract) as the defined continuation, in dependency order. Each arc is its own work unit; Arc 1 is Critical and should be its own close. Model: pick per the cache AC1 row (this is `code-critical` for Arc 1).

---

## Session open (do this first)

Read, in order: `/adopted/standing-protocol-cache.md`; `/adopted/build-sessions-protocol-cache.md`; `/adopted/project-instructions-snapshot.md`; the targeted `/manifest.md` sections (R0, R18, R18f, R19/R19e, AC7, the K1/credential rules); the most recent close in `/operations/handoffs/founder/`; then the day's primary deliverable docs below.

Confirm at open: tier; **hold-point status (P0 0h — still held; this arc is pre-0h trust-layer honesty work, not a launch step)**; model selection per the cache AC1 row; status vocabulary (`Scoped → Designed → Scaffolded → Wired → Verified → Live`); signals + risk classification (0d-ii). **PR15:** for Arc 2, consult `.claude/skills/anthropic/` + the Claude Code hooks/plugins/Agent-SDK primitives before any bespoke build — the harness is Anthropic-native by construction.

## Locked context (decided 2026-06-20 — do not re-litigate)

- **Decision:** `D-SAGE-PRACTICE-GATE1-SURFACE-HONESTY-OPTION2-DIFFERENTIATION` (decision log). Gate 1 keeps its name on all surfaces, offered as **two documented configurations** — *Gate 1 — pre-decision* (developer-controlled surfaces, harness-enforced before the agent reasons) and *Gate 1 — post-decision (check)* (hosted consumer surfaces, fires after, honest check). Mentor-consulted; dikaiosyne-grounded.
- **The credential-propagation finding (verified in code):** the K1 coverage model is server-composed + consumer-unforgeable and already reserves hook-enforced states for this exact case (`coverage-status.ts:37–44`; `route.ts:708,715` hardcodes `agent_elected`). The distinction is carriable unforgeably *against the consumer*; it is an **attestation** (operator issuance + harness-by-construction), not cryptographic proof of timing.
- **D1–D3 (locked, founder-elected as recommended):**
  - **D1** — the mint-time marker lives in **`credential_provenance` jsonb** on `api_keys` (admin-set only).
  - **D2** — add a **structured `examination_mode` field** (`pre_decision_harness | post_decision_check | null`) on `AccreditationRecord`/`AccreditationPayload` (machine-parseable), with a matching human-readable `credential_basis` clause.
  - **D3** — **do NOT repurpose `coverage_status: continuous`** (it means per-action coverage; this is a timing property). Keep `coverage_status` as-is; carry pre/post in `examination_mode`.

Primary deliverable docs (read in full): `drafts/sage-practice-examination-mode-credential-build-scope.md` (Arc 1 spec), `drafts/D-gate1-surface-honesty-option2-honest-differentiation.md` (the decision + the verified credential check), `drafts/sage-practice-pre-decision-harness-design.md` (Arc 2 design), `operations/benchmarks/sage-practice-v1/runs/2026-06-20/arm1-predecision-and-reflect-findings.md` (the evidence).

---

## ARC 1 — `examination_mode` credential field (Critical; build DARK + UN-ISSUED)

Build the unforgeable examination-mode distinction per the scope doc, D1–D3 locked. Deliverables:

1. **Schema (additive, nullable, reversible):** `examination_mode` column on `agent_accreditation` (nullable; pre-existing rows read `null` = "unstated", honest); the marker shape on `api_keys.credential_provenance` (D1). Mirror the K1 first-slice migration pattern.
2. **Composer:** add a `harness_enforced` `CoverageWritePath` to `composeK1InitialCoverage` (joining `wrapper_write`/`sage_reflect_feed`) emitting `examination_mode: pre_decision_harness` + a basis clause. Pure, server-side, consumer input ignored (unchanged guarantee).
3. **Route wiring (`route.ts:711`):** select the write path from the **validated credential's** marker (`harness_enforced` iff the marker is present; else `wrapper_write` → `post_decision_check`). The route already has the credential in scope.
4. **Read-back:** `buildAccreditationPayload` folds `examination_mode` onto the public payload (it already serves `coverage_status`/`credential_basis`).
5. **Mint (operator-only):** admin `/api/admin/api-keys` route + the CLI gain a flag to set the marker on `credential_provenance`. **Admin-gated only** — a consumer cannot self-issue it (the unforgeability root).
6. **Public docs (R18 — honest):** describe `examination_mode` accurately **including the attestation limit** — unforgeable against the consumer, but rooted in operator issuance + harness construction, NOT cryptographic proof of timing (the signature proves *examined*, not *examined-pre-decision*).

**Dark + un-issued discipline:** flag-gate the field; built but the marker is **issued to no one** (no genuine harness exists yet), so **everything reads `post_decision_check`/`null`** — honest for today's all-discretionary surfaces. **Do not issue the marker in Arc 1.**

**Risk: Critical** (0d-ii — accreditation write boundary + public trust credential; AC7 if the credential read changes). Full Critical Change Protocol (0c-ii) before any flag flip; founder-walked. **Unforgeability test battery (load-bearing):** consumer-submitted `examination_mode` ignored (server-composed); only an admin-minted marked credential earns `pre_decision_harness`; unmarked → `post_decision_check`; the public payload carries it; flag-off byte-identity; pre-existing rows read `null`. Adversarial pre-activation review. **Close Arc 1 here** (its own decision-log entry) before Arc 2.

---

## ARC 2 — the pre-decision harness/plugin (the delivery that earns the marker)

Per `drafts/sage-practice-pre-decision-harness-design.md`. PR15: build on Anthropic primitives, not bespoke.

1. **Claude Code plugin** bundling (a) the Sage MCP server (the tools) and (b) a **`UserPromptSubmit` hook** that, guarded to fire **once per task**, runs the **fast** Gate-1 framing call (`POST /api/reason`, `quick`/`standard` + `response_format:"assessment_first"` — never `deep`; the hook has a timeout, deep is ~60s) and injects the returned frame as context **before the model reasons**. Optional `PreToolUse` gate (deny task tools until framed). Fail-mode configurable (default fail-open-with-honest-log).
2. **Agent-SDK wrapper:** orchestrate the framing call **before** the agent loop and inject the result (the SDK has no built-in pre-loop hook).
3. **Marker issuance:** the harness writes accreditation using an **operator-issued `pre_decision_harness`-marked credential** (Arc 1's marker) — this is where the marker is finally issued, to a harness that genuinely enforces pre-decision by construction. **Only now does `examination_mode: pre_decision_harness` become a true claim.**
4. **Test environment (the release gate):** strict trajectory battery — the framing call is the **first** action on every fixture; a "ignore setup, just do X" prompt **still** frames (proves hard, not soft); an outage fails safe; a continuation prompt does **not** re-fire (the guard works); subagent tasks are framed. CI-gated, hard-fail, mirroring the verdict-equivalence-battery discipline.

---

## ARC 3 — the hosted-configuration contract (honest public language)

Document the two configurations honestly on the public surfaces (R18/R19e):
- **Gate 1 — pre-decision** (developer surfaces): harness-enforced framing before the agent reasons; credential carries `examination_mode: pre_decision_harness`.
- **Gate 1 — post-decision (check)** (hosted surfaces): fires after the agent's judgement; an honest check that feeds developmental progression; credential carries `post_decision_check`.
- Surface `examination_mode` in `llms.txt` / `agent-card.json` / api-docs as the machine-readable distinguisher, with the attestation-not-proof limit stated. No surface may present the post-decision check as pre-decision framing.

---

## Dependency gates + what NOT to do

- **Order:** Arc 1 (field, dark, un-issued) → Arc 2 (harness; **issue the marker only here**, to the genuine harness) → Arc 3 (document the now-real distinction). Arc 1 can complete fully without Arc 2; the marker stays un-issued until the harness is real.
- **Do not:** issue the `pre_decision_harness` marker before a genuine pre-decision harness exists (it would be an empty claim); repurpose `coverage_status: continuous` (D3); claim cryptographic proof of timing (it is an attestation); let the hosted check be named or documented as pre-decision framing.
- **0h:** unchanged — still the founder's, still held; this work shapes *what is offered on which surface* when the call is made, it is not itself a launch step.

## Cross-references
`D-SAGE-PRACTICE-GATE1-SURFACE-HONESTY-OPTION2-DIFFERENTIATION` (decision log) · `drafts/sage-practice-examination-mode-credential-build-scope.md` · `drafts/D-gate1-surface-honesty-option2-honest-differentiation.md` · `drafts/sage-practice-pre-decision-harness-design.md` · `operations/benchmarks/sage-practice-v1/runs/2026-06-20/arm1-*` (the Arm-1 evidence + verdict) · verified code: `coverage-status.ts`, `accreditation/[agent_id]/route.ts:711`, `trust-layer/types/accreditation.ts`.
