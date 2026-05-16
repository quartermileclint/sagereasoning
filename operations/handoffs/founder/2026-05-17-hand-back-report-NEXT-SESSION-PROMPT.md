# Next-Session Prompt — Trajectory-Enriched Developer Hand-Back Report (post-6b arc, step 4 of 8)

**Stream:** founder.
**Tier:** `code-elevated` — **Elevated** risk under 0d-ii. **Lean + Elevated additions** template. The Critical Change Protocol does NOT apply (no auth / session / encryption / data-deletion / deployment-config / R20a-perimeter surface). AC5 / AC7 / PR6 not engaged. PR1: this is the single build session for the hand-back report module; verify before any extension into route wiring.
**Governing frame:** `/adopted/standing-protocol-cache.md` (general protocol — `code-elevated` row → Lean + Elevated additions) + `/adopted/build-sessions-protocol-cache.md` (build-arc context).
**Predecessor session close:** `/operations/handoffs/founder/2026-05-16-atl-items-1-3-build-close.md` (the items 1–3 build session).
**Predecessor decision-log entries:** `D-ATL-ITEMS-1-3-BUILD-WIRED-VERIFIED-2026-05-16`; `D-ATL-ITEMS-1-3-DESIGN-LOCKED-2026-05-16`; `D-ATL-PUBLIC-ACCREDITATION-ENDPOINT-WIRED-VERIFIED-2026-05-16`; `D-ATL-ITERATION-PATTERNS-WIRED-VERIFIED-2026-05-15`; `D-ATL-WRAPPER-WIRED-VERIFIED-2026-05-15`.
**Sequencing source:** `/operations/handoffs/founder/2026-05-15-post-build-brainstorm-close.md` — this is step 4 of 8 in the post-6b arc (6b → items 1–3 design pass → items 1–3 build → **trajectory-enriched developer hand-back report** → kathekon-aligned alternative design pass → kathekon-aligned alternative build → write-path → A10).

---

## Why this session matters

The wrapped agent runs its loop, consuming the in-loop machine-readable agent-mode rendering to make decisions. But the agent does not exist in isolation — it has a developer. At task end, session end, or on demand, the wrapped agent should **hand back a report to its developer** (Wrapper spec §"The report the agent hands back to the developer"). That report is the developer's window into their wrapped agent:

- Every decision the agent consulted the substrate on, and how the substrate assessed each
- The agent's trajectory across the session (the `WindowSnapshot` direction of travel)
- The agent's current grade, authority level, and badge status (`AccreditationRecord` / `AccreditationCard`)
- Persisting passions — the recurring distortions in the agent's reasoning the developer should know about
- For an orchestrator agent: how it weighed each peer agent's assessment

Items 1–3 (just landed) make the report **much richer**:

- **`deliberation_breadth` per action** lets the report distinguish intuited vs deliberated vs multi-branch-deliberated commitments — the developer can see HOW the agent reasoned, not just WHAT it decided.
- **`carried_candidates`** lets the report show what siblings the agent still holds under consideration — visible decision-support state, not just commitments.
- **`typical_deliberation_breadth` on the badge** gives the report's headline section an R18a-honest observable credential alongside grade / proximity.

After this session, agent developers have a documented hand-back-report rendering they can call at task end / session end / on demand. The badge + the trajectory + the deliberation signals + the carried working set become a coherent, human-readable narrative — the developer's view of their wrapped agent's session. That makes the kathekon-aligned alternative design pass (step 5) better-grounded: it can name how the alternative output projects into the report.

The session is bounded. Plan ~3.5–4.5 hr. Expect mid-session founder input at the Step 1 design-decision gate (rendering format + structure) and at the Step 8 Verify step.

---

## Pre-conditions

1. **The items 1–3 build commits are pushed; Vercel green.** Founder confirmed Vercel green after the items 1–3 build session push. `git log --oneline -3 origin/main` shows the items 1–3 build commit on top.
2. **The founder ran the runtime test suite locally** per the items 1–3 build close's Founder Verification block, and all tests passed.
3. **The founder ran the Supabase migration** for `typical_deliberation_breadth` and confirmed the column exists with the expected default.
4. **Production state unchanged from the items 1–3 build close:** substrate at A7 Verified; flags UNSET; `/api/reason` byte-identical; `/api/accreditation/[agent_id]` Live; `agent_accreditation` table has the new column (defaulted, unwritten); `grade_history` table exists and is empty.
5. **No env-var changes; no auth-surface changes; no R20a-perimeter changes** anticipated this session. The hand-back report is a pure rendering surface — it reads from CarriedProfile / WindowSnapshot / AccreditationRecord and produces a developer-facing report. No DB writes from this module.
6. **Founder commits to a ~3.5–4.5 hr bounded session.** Mid-session founder input at the Step 1 design-decision gate (rendering format + section structure) and at the Step 8 Verify step.

---

## Part A — Open under the protocol

Read in order:

1. `/adopted/standing-protocol-cache.md` (~3 min) — confirm tier (`code-elevated`), risk class (Elevated), Lean + Elevated additions template, AC1 model selection row (N/A this session — no LLM calls), signals, status vocabulary.
2. `/adopted/build-sessions-protocol-cache.md` (~3 min) — build-arc context; the "no current users" governing note applies (Critical Change Protocol step 3 would be N/A if engaged; it is NOT engaged this session).
3. `/operations/handoffs/founder/2026-05-16-atl-items-1-3-build-close.md` (~5 min) — the items 1–3 build close. Items 1–3 made the hand-back report much richer; the close describes what the report can now show.
4. `/adopted/atl-items-1-3-design.md` — read targeted sections: §"Decision A — `deliberation_breadth`" (what the badge gains) + §"Decision B — `carried_candidates`" (what the working-set slot carries).
5. `/operations/decision-log.md` — last 2 entries (the items 1–3 build + design pass).
6. `/adopted/substrate-modes/agent-trust-layer-wrapper-spec.md` — read in full: §"Component 2 — The Layer 3 agent-mode rendering" (the in-loop rendering — the hand-back is its dual-purpose human-readable companion); §"Component 4 — Trajectory awareness"; §"The report the agent hands back to the developer" (the spec's primary description of what this session builds); §"Layer 1 implications" (carried-context fields the report visualises); §"R-rule engagement" (mandatory wraps + R17e-not-engaged distinction); the new §"Tree-search composition" (in case the report needs to render tree-search-evaluator usage).
7. The code files that bear on the build — read targeted sections only:
   - `/website/src/lib/substrate/atl-wrapper.ts` — `CarriedProfile` shape (incl. `carried_candidates`); `toCarriedProfilePayload` / `toCarriedCandidatesPayload`; `CarriedProfilePayload` / `CarriedCandidatesPayload`.
   - `/website/src/lib/substrate/atl-iteration-patterns.ts` — `SequentialStepResult` (what the iteration patterns now return per step — the data the report aggregates across a session); `OrchestrationStepResult` (the peer_agent_assessments field for orchestrator reports).
   - `/website/src/lib/substrate/agent-mode-service.ts` — `renderAgentMode` (Component 2 in-loop rendering). The hand-back report is its human-readable companion; read for inheritable patterns (consumer-context handling, mandatory wraps, deterministic structure).
   - `/website/src/lib/substrate/trust-layer/types/evaluation.ts` — `EvaluatedAction` (incl. `candidates_considered`); `WindowSnapshot` (incl. `deliberation_breadth_distribution` / `typical_deliberation_breadth`); `DeliberationBreadth` enum + `deriveDeliberationBreadth`.
   - `/website/src/lib/substrate/trust-layer/types/accreditation.ts` — `AccreditationRecord` (incl. `typical_deliberation_breadth`).
   - `/website/src/lib/substrate/trust-layer/accreditation/accreditation-record.ts` — `buildAccreditationPayload` (the R4-compliant public shape; the hand-back report respects the same R4 boundary).
8. **PR11 inbox scan** — list `/inbox/` files dated since 2026-05-16. Read any that look relevant to the hand-back report (e.g., developer-experience research, hand-back UX, agent-trust-layer reference distributions). F1–F4 in `/operations/agentic-commerce-findings-downstream-order.md` — confirm none target this session.
9. **PR15 consult** — `.claude/skills/anthropic/` review focused on:
   - `frontend-design` skill — does it inform the report's structure or formatting conventions for developer-facing rendering?
   - `internal-comms` skill — does it inform the report's voice / phrasing for developer audience?
   - `doc-coauthoring` skill — does it suggest structural patterns for a session-end summary deliverable?
   - The dual-purpose framing of agent-mode (§Component 2) — the hand-back rendering is the human-readable companion to the in-loop machine-readable rendering. Bespoke is correct (the existing `renderAgentMode` is bespoke; this is its companion); no Anthropic primitive substitutes.

**Confirm at open:** tier (`code-elevated`); hold-point status (P0 0h active); model selection N/A (no LLM calls); status vocabulary; signals + risk classification per 0d-ii; AC5/AC7/PR6/Critical Change Protocol NOT engaged.

---

## Part B — Procedure

### Step 0 — Scope confirm + risk gate (~5 min)

State scope: build the trajectory-enriched developer hand-back report rendering function in this single session per PR1 single-build proof. Confirm NOT in scope: wiring the report into any route (that's a future Elevated/Critical session); persisting the report to Supabase (no DB writes this session); changing any of the items 1–3 decisions; touching the kathekon-aligned alternative; touching A10. Founder confirms.

### Step 1 — Hand-back report surface survey + design-decision gate (~30–45 min)

Output ~20 lines covering: the module location; the function signature; the input shape; the output shape; the section structure; the consumer-context handling; the mandatory-wraps inheritance from Component 2; the orchestrator branch. Surface the design-decision questions the wrapper spec didn't lock. Founder elects via AskUserQuestion at the gate. Expected gate questions:

**Q1 — Module location.** Sibling to `agent-mode-service.ts` (`/website/src/lib/substrate/agent-hand-back-report.ts`) — RECOMMENDED, or a new directory `/website/src/lib/substrate/hand-back/` for future expansion.

**Q2 — Output shape.** Markdown-string (a single rendered document the developer pastes into their tooling) — RECOMMENDED, or structured JSON+Markdown dual output (machine-readable header + Markdown body), or HTML.

**Q3 — Section structure.** Five sections matching the spec's five bullets (decisions; trajectory; grade/authority/badge; persisting passions; orchestrator peers — last shown only when applicable) — RECOMMENDED, or a flatter narrative format, or a verbose multi-section drill-down.

**Q4 — Deliberation_breadth visualisation.** Per-action label in the decisions section + a session-headline `typical_deliberation_breadth` line in the trajectory section — RECOMMENDED, or just the headline, or a separate "How the agent reasoned" subsection.

**Q5 — `carried_candidates` visualisation.** A "Still under consideration" subsection listing the top-K with proximity + considered_at — RECOMMENDED, or omit entirely (treat as wrapper-internal state not surfaced to the developer), or only when non-empty.

**Q6 — Orchestrator branch.** Render only when `peer_agent_assessments` is non-empty for at least one step — RECOMMENDED, or always render with "no peers" empty state, or as an opt-in option flag.

### Step 2 — Module scaffolding (~20–30 min)

Create the elected module file (Q1) with the header banner (governing documents, what-this-module-is, compliance posture per R3/R4/R17e/R18a/R18e/AC8/PR1/PR2/PR4/PR6/PR10). Define the input shape (likely `{ profile: CarriedProfile; steps: ReadonlyArray<SequentialStepResult | OrchestrationStepResult>; consumer_context: ConsumerContext; options?: HandBackOptions }` — Step 1 gate decides). Define the output shape per Q2. Define the public function signature (likely `renderAgentHandBackReport(input): HandBackReportResult`).

### Step 3 — Decisions section build (~30–40 min)

Render the per-action log: each EvaluatedAction's proximity, kathekon assessment, deliberation_breadth label (intuited / deliberated / multi-branch deliberated), passions detected, virtue domains engaged, evaluated_at timestamp, skill_id. For Pattern-2 steps where `candidates_considered > 1`, surface the slate size. Deterministic ordering (chronological per `evaluated_at`).

### Step 4 — Trajectory section build (~30–40 min)

Render the `WindowSnapshot` summary: actions_in_window, total_actions_evaluated, typical_proximity, typical_deliberation_breadth, direction_of_travel, proximity_distribution, deliberation_breadth_distribution, kathekon_compliance_rate, virtue_breadth. Render the proximity_trajectory (the ordered list) as a compact in-line sequence. R4-respecting — no internal thresholds or micro-logic surfaced.

### Step 5 — Grade / authority / badge section build (~20–30 min)

Render the `AccreditationRecord` (or `AccreditationPayload` — the R4-compliant subset is the design-decision-gate question): senecan_grade, typical_proximity, authority_level, dimension_levels, direction_of_travel, evaluation_window_size, actions_evaluated, grade_since, last_evaluation, passions_persisting, typical_deliberation_breadth, verification_url. Include the R3 disclaimer. The verification_url is the link to the public accreditation endpoint (`/api/accreditation/[agent_id]`).

### Step 6 — Persisting passions section + `carried_candidates` subsection + orchestrator branch (~30–40 min)

**Persisting passions:** render `passions_persisting[]` with occurrence_count + occurrence_rate. Empty-state language when none persist.

**`carried_candidates` (Q5):** if elected to render — list top-K with rank, proximity (from layer2_assessment.katorthoma_proximity), considered_at. Empty-state language when empty.

**Orchestrator branch (Q6):** if any step's `peer_agent_assessments` is non-empty, render the orchestration section: peer agent_id, accreditation summary (grade / proximity / direction_of_travel / typical_deliberation_breadth from the peer's AccreditationPayload), latest_rendering presence indicator.

### Step 7 — Mandatory wraps (~15–25 min)

Per the wrapper spec's R-rule engagement, both renderings carry mandatory wraps. The hand-back report should include:

- **R3 — evaluative disclaimer** (already present via `record.disclaimer`)
- **R19c — limitations link** (the limitations page URL)
- **R19d — mirror principle reminder** for the developer audience
- **R18a — Character Kernel category language** in any "what this report measures" preamble
- **R18e — Article 50 transparency** on any substrate-generated prose if the report quotes Layer 3 prose (it likely doesn't; confirm at Step 1)
- **R20a passthrough** — the report SHOULD NOT contain new R20a content; it can reflect that an R20a-classified action occurred in the trajectory (the EvaluatedAction's existing fields will reflect this naturally — no new wrap needed)

### Step 8 — Tests (~30–45 min)

New file `/website/src/lib/substrate/__tests__/agent-hand-back-report.test.ts`:

- `RENDER-1` — empty CarriedProfile (fresh agent, no steps) → renders a coherent empty-state report.
- `RENDER-2` — one Sequential step → decisions section shows one action; trajectory section shows the snapshot.
- `RENDER-3` — Pattern-2 step (accumulateChosen) → decisions section reflects `candidates_considered === N`; carried_candidates subsection shows the N-1 retained candidates (if Q5 elected to render).
- `RENDER-4` — orchestrator step with peers → orchestrator branch renders peer entries.
- `RENDER-5` — orchestrator step without peers → orchestrator branch hidden (per Q6 elected behaviour).
- `RENDER-6` — `typical_deliberation_breadth` headline appears in trajectory section.
- `RENDER-7` — `passions_persisting` non-empty renders with occurrence_count + occurrence_rate.
- `RENDER-8` — verification_url renders and matches the AccreditationRecord's URL.
- `DET-1` — deterministic: two renders with identical input produce byte-identical output (no clock reads inside this module; the test asserts).
- `R4-1` — output contains no internal thresholds, no UPGRADE/DOWNGRADE numeric thresholds, no dimension confidence scores (those are internal-only).
- `R3-1` — output contains the ACCREDITATION_DISCLAIMER text.
- `R18a-1` — output contains the Character Kernel category language (per Q-gate-elected phrasing).

### Step 9 — Verify (~20–30 min)

PR10 PEV Verify step. Run:

```
cd "/Users/clintonaitkenhead/Claude-work/PROJECTS/sagereasoning/website"
npx tsc --noEmit -p tsconfig.json
npx tsx src/lib/substrate/__tests__/agent-hand-back-report.test.ts
npx tsx src/lib/substrate/__tests__/atl-wrapper.test.ts
npx tsx src/lib/substrate/__tests__/atl-iteration-patterns.test.ts
npx tsx src/lib/substrate/__tests__/atl-bridge.test.ts
npx tsx src/lib/substrate/__tests__/atl-tree-search-adapter.test.ts
npx tsx --env-file=.env.local src/lib/substrate/__tests__/atl-accreditation-store.test.ts
npx tsx src/lib/substrate/__tests__/score-architecture.test.ts
npx tsx src/lib/substrate/__tests__/layer3-service.test.ts
npx tsx src/lib/substrate/__tests__/r20a-gate.test.ts
npx tsx --env-file=.env.local src/lib/substrate/__tests__/agent-mode-service.test.ts
npx tsx --env-file=.env.local src/lib/substrate/__tests__/philosophical-mode-service.test.ts
```

Classify the Verify outcome per PR10 diagnostic-certainty signals. The end-to-end developer experience (a wrapped agent runs N steps, then calls `renderAgentHandBackReport` and pastes the output into the developer's tooling) is verified between sessions — see Founder Verification.

### Step 10 — Append decision-log entry (lean + Elevated additions)

`D-HAND-BACK-REPORT-WIRED-VERIFIED-YYYY-MM-DD`. Lean form per `/adopted/standing-protocol-cache.md` §"Lean decision-log entry" with Elevated additions: name the rollback path explicitly; name what could break. Rules served expected: 0a, 0c, 0d-ii, 0f, R0 (the trajectory awareness now has a developer-facing rendering surface), R3 (disclaimer present), R4 (engine internals stay closed; only AccreditationPayload-shape data crosses), R18a (Character Kernel category language), R18e (Article 50 transparency if Layer 3 prose is quoted), R19c (limitations link), R19d (mirror principle reminder), R17e (NOT engaged for agent profiles — the load-bearing distinction from private mode), AC8, KG1 (no DB writes; no self-calls; no redirects), PR1 (single-build proof), PR2 (build-to-wire-immediate: the new test file invokes every exported function in the same session), PR7 (deferred items: route wiring; persistence; the on-demand vs task-end vs session-end orchestration choice), PR10 (PEV — Plan was Step 1 gate, Execute is Steps 2–8, Verify is Step 9 + founder between-sessions), PR11 (inbox scan), PR15 (Anthropic-primitive consult — no substitutes for the bespoke hand-back rendering; the in-loop companion `renderAgentMode` is also bespoke). PR4/PR6 not engaged.

### Step 11 — Session close (lean + Elevated additions)

`/operations/handoffs/founder/YYYY-MM-DD-hand-back-report-close.md` per the lean template + Elevated additions (the rollback path; what could break; the test commands in Founder Verification). "Next Session Should" names the **kathekon-aligned alternative — design pass** (step 5 of the post-6b arc).

---

## Part C — Anticipated session shape

| Phase | Estimate |
|---|---|
| Caches + items 1-3 build close + design doc + spec sections + code files + PR11 + PR15 (Part A) | 25–35 min |
| Step 0 — scope confirm + risk gate | 5 min |
| Step 1 — design-decision gate (6 questions) | 30–45 min |
| Step 2 — module scaffolding | 20–30 min |
| Step 3 — decisions section build | 30–40 min |
| Step 4 — trajectory section build | 30–40 min |
| Step 5 — grade/authority/badge section build | 20–30 min |
| Step 6 — persisting passions + carried_candidates + orchestrator | 30–40 min |
| Step 7 — mandatory wraps | 15–25 min |
| Step 8 — tests | 30–45 min |
| Step 9 — Verify | 20–30 min |
| Step 10 — decision-log entry | 25–35 min |
| Step 11 — session close | 25–35 min |
| **Total** | **~5–6 hr** |

This is comparable to the items 1–3 build session. The natural pause point if the session runs long is at the end of Step 5 (decisions + trajectory + grade sections complete; persisting passions / carried_candidates / orchestrator / wraps deferred to a same-day continuation). The founder elects whether to take that pause if it comes up.

---

## Rollback path

**Code rollback:** `git revert HEAD --no-edit` + push via GitHub Desktop. After Vercel rebuild (~2 min), the new module + its test file are removed. The agent-mode-service.ts, atl-wrapper.ts, atl-iteration-patterns.ts, and all items-1-3 artefacts are untouched. `/api/reason`, `/api/substrate/layer3`, `/api/accreditation/[agent_id]`, and `/api/public-key` are byte-identical (the hand-back report is imported by no route this session).

The rollback is reversible within ~5 min of founder action. No Supabase changes this session.

---

## What could break (Elevated additions)

1. **Existing tests fail** because the report module's helper functions (e.g., a deliberation-breadth labeller, a passion-name formatter) inadvertently re-export names that clash with existing imports. Mitigation: keep all helpers module-private (non-exported); export only the top-level `renderAgentHandBackReport` function.
2. **R4 boundary violation in the report** — an internal threshold or micro-confidence value crosses into the rendered output. Mitigation: source the report's data only from the AccreditationPayload shape (the R4-compliant subset built by `buildAccreditationPayload`) and the WindowSnapshot's public fields. Add an R4-1 test asserting no internal thresholds appear in the output.
3. **Determinism violation** — the report module reads the clock or uses randomness. Mitigation: the module reads no clock and uses no randomness; the test asserts byte-identical output for identical input.
4. **`carried_candidates` rendering exposes a raw Layer2Assessment** — including engine internals beyond the AccreditationPayload boundary. Mitigation: render only `katorthoma_proximity` (the qualitative level) and `considered_at`; the `layer2_assessment` field is read but only its public-shape fields are exposed.
5. **The Character Kernel language is too vague or too strong** — overpromises or underpromises what the badge measures. Mitigation: re-use the language from the existing AccreditationPayload disclaimer and the R18a Character Kernel ADR (`/adopted/adr/2026-05-12-substrate-category-character-kernel.md`); founder reviews the elected phrasing at the Step 1 gate.

---

## Forecast

A successful build session produces:

- A new module `/website/src/lib/substrate/agent-hand-back-report.ts` exposing `renderAgentHandBackReport()` — pure, synchronous, deterministic, R3/R4/R18a/R18e/R19c/R19d-respecting.
- A new test file `/website/src/lib/substrate/__tests__/agent-hand-back-report.test.ts` covering RENDER-1..8 + DET-1 + R3-1 + R4-1 + R18a-1.
- All existing tests pass; type-check clean.
- Vercel green; `/api/reason` byte-identical; `/api/accreditation/[agent_id]` byte-identical. The new module is imported by no route — it is a library-only deliverable this session.

After this session, the wrapped agent's developer has a documented hand-back-report rendering they can call at task end / session end / on demand. The hand-back report is one of the three audience surfaces named in the wrapper spec (agent in-loop view → `renderAgentMode`; developer view → `renderAgentHandBackReport`; third-party view → the public accreditation endpoint). All three exist after this session.

That makes the **kathekon-aligned alternative design pass** (step 5 of the post-6b arc) better-grounded — it can name how the alternative output projects into the hand-back report. After the kathekon-aligned alternative is designed + built (steps 5–6), the write-path session lands (step 7), then A10 (step 8) closes the arc.

*End of prompt.*
