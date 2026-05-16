# Next-Session Prompt — Kathekon-Aligned Alternative: Design Pass (post-6b arc, step 5 of 8)

**Stream:** founder.
**Tier:** `governance` — **Standard** risk under 0d-ii. **Lean** template. AC5 / AC7 / PR6 / Critical Change Protocol not engaged.
**Governing frame:** `/adopted/standing-protocol-cache.md` (general protocol — `governance` row → Lean template) + `/adopted/build-sessions-protocol-cache.md` (build-arc context).
**Predecessor session close:** `/operations/handoffs/founder/2026-05-16-hand-back-report-close.md` (the trajectory-enriched developer hand-back report build).
**Predecessor decision-log entries:** `D-HAND-BACK-REPORT-WIRED-VERIFIED-2026-05-16`; `D-ATL-ITEMS-1-3-BUILD-WIRED-VERIFIED-2026-05-16`; `D-ATL-ITEMS-1-3-DESIGN-LOCKED-2026-05-16`.
**Sequencing source:** `/operations/handoffs/founder/2026-05-15-post-build-brainstorm-close.md` — step 5 of 8 in the post-6b arc (6b → items 1–3 design pass → items 1–3 build → trajectory-enriched developer hand-back report → **kathekon-aligned alternative design pass** → kathekon-aligned alternative build → write-path → A10).

---

## Why this session matters

The substrate's Layer 2 assessment produces two parallel signals about each evaluated action:

- **`katorthoma_proximity`** — the 5-level qualitative proximity scale (`reflexive` / `habitual` / `deliberate` / `principled` / `sage_like`). This is the load-bearing signal in the current architecture: it drives the typical proximity, the Senecan grade, the authority level, the direction of travel, the dimension levels, and the entire trajectory.
- **`is_kathekon` + `kathekon_quality`** — whether the action was the appropriate-in-the-circumstances fitting act (boolean plus a quality enum: `strong` / `moderate` / `marginal` / `contrary`). This signal currently surfaces as `kathekon_compliance_rate` on the `WindowSnapshot` and per-decision `kathekon (strong)` / `non-kathekon (marginal)` notation in the hand-back report — but it does NOT drive a parallel grade, authority, or trajectory projection.

The kathekon-aligned alternative asks: what would an output projection look like if `is_kathekon` + `kathekon_quality` were the load-bearing signal, alongside or as an alternative to proximity?

This matters because:

- **Proximity measures HOW the agent reasoned** (the cognitive quality of the act, on the Stoic katorthoma–reflexive ladder). **Kathekon measures WHETHER the act was appropriate-in-the-circumstances.** Both are Stoic-canonical and both matter, but they answer different questions.
- An agent might be high-proximity but consistently non-kathekon (highly considered acts that are nonetheless inappropriate in context). Or low-proximity but consistently kathekon (reflexive acts that nonetheless hit the mark). The proximity-only signal collapses these distinctions.
- The hand-back report (Section 3) and the badge currently surface proximity as the primary credential, with kathekon as a secondary rate. An alternative might invert or balance this — and an agent developer or a third-party verifier may want to see both.

The design pass produces a design document under `/adopted/atl-kathekon-aligned-alternative-design.md`. It locks WHAT the alternative is, with founder-elected decisions on each open question. The build (step 6 of the post-6b arc) implements it.

After this session, the founder has a documented, evidence-based design for the alternative. The build session's scope is bounded.

The session is bounded. Plan ~3–4 hr. Expect mid-session founder input at the Step 2 design-decision gate (likely 2–3 rounds of AskUserQuestion).

---

## Pre-conditions

1. **The hand-back report commits are pushed; Vercel green.**
2. **The founder ran the runtime test suite locally** per the hand-back report close's Founder Verification block, and all tests passed.
3. **The founder has reviewed `/operations/decision-log.md` entry `D-HAND-BACK-REPORT-WIRED-VERIFIED-2026-05-16`** and confirmed the six design-decision-gate elections match the session-open intent.
4. **Production state unchanged from the hand-back report close:** substrate at A7 Verified; flags UNSET; `/api/reason` byte-identical; `/api/substrate/layer3` returns 503; `/api/accreditation/[agent_id]` Live; the `agent_accreditation.typical_deliberation_breadth` column present and defaulted.
5. **No env-var changes; no auth-surface changes; no R20a-perimeter changes anticipated this session.** Design-only.
6. **Founder commits to a ~3–4 hr bounded session.** Mid-session founder input at the Step 2 design-decision gate.

---

## Part A — Open under the protocol

Read in order:

1. `/adopted/standing-protocol-cache.md` (~3 min) — confirm tier (`governance`), risk class (Standard), Lean template, signals, status vocabulary.
2. `/adopted/build-sessions-protocol-cache.md` (~3 min) — build-arc context; the "no current users" governing note applies (Critical Change Protocol NOT engaged anyway — design-only).
3. `/operations/handoffs/founder/2026-05-16-hand-back-report-close.md` (~5 min) — the immediate predecessor session close.
4. `/adopted/atl-items-1-3-design.md` (in full, ~10 min) — the items 1–3 design document. The kathekon-aligned alternative design will follow the SAME shape (Decisions A / B / C / … each with Why / Structural constraint / Field shape / Wrapper supplier / Aggregation / Badge persistence / R-rule engagement / Layer 1 implication). This is the structural template.
5. `/adopted/substrate-modes/agent-trust-layer-wrapper-spec.md` — read targeted sections only:
   - §"Component 2 — The Layer 3 agent-mode rendering" (where the alternative might surface in the in-loop machine-readable JSON)
   - §"Component 3 — The Badge / Accreditation" (where the alternative might surface in the public credential)
   - §"Component 4 — Trajectory awareness" (where the alternative interacts with the trajectory mechanism)
   - §"The report the agent hands back to the developer" (where the alternative projects into the just-built developer view)
   - §"R-rule engagement" (R18a's Character Kernel category — does the alternative require a separate category label, or does Character Kernel accommodate both signals?)
6. `/operations/decision-log.md` — last 3 entries (the hand-back report; the items 1–3 build; the items 1–3 design pass).
7. The code files that bear on the design — read targeted sections only:
   - `/website/src/lib/translation-sandwich/layer2-mechanisms.ts` — the `Layer2Assessment` shape, specifically `kathekon_assessment` (`is_kathekon`, `quality`, `justification`).
   - `/website/src/lib/substrate/trust-layer/types/evaluation.ts` — `EvaluatedAction.is_kathekon` + `kathekon_quality` + `WindowSnapshot.kathekon_compliance_rate`.
   - `/website/src/lib/substrate/trust-layer/types/accreditation.ts` — `AccreditationRecord` + `AccreditationPayload` (where a parallel kathekon-aligned credential might live; how the items 1–3 build threaded `typical_deliberation_breadth` is the relevant prior art).
   - `/website/src/lib/substrate/trust-layer/grade-engine/grade-transition-engine.ts` — the grade transition logic (where a parallel kathekon-grade transition might live).
   - `/website/src/lib/substrate/trust-layer/evaluation-window/window-aggregator.ts` — the `WindowSnapshot` computation (where parallel kathekon-aligned aggregation might be computed).
   - `/website/src/lib/substrate/agent-hand-back-report.ts` — the just-built developer view (where the alternative output projects into the five-section structure).
   - `/adopted/adr/2026-05-12-substrate-category-character-kernel.md` — the J1 ADR (Character Kernel category language). Does the alternative require a parallel ADR (e.g., a "Right Action Kernel" category), or does Character Kernel accommodate both?
8. **PR11 inbox scan** — list `/inbox/` files dated since 2026-05-16. F1–F4 in `/operations/agentic-commerce-findings-downstream-order.md` — confirm none target this session.
9. **PR15 consult** — `.claude/skills/anthropic/` review focused on Anthropic primitives for credentialing / observation patterns. Bespoke is likely correct (the alternative is substrate-specific), but the consult is mandatory; record the outcome in the decision-log entry.

**Confirm at open:** tier (`governance`); hold-point status (P0 0h active); model selection N/A (no LLM calls); status vocabulary; signals + risk classification.

---

## Part B — Procedure

### Step 0 — Scope confirm (~5 min)
State scope: design pass only. Produce a design document under `/adopted/atl-kathekon-aligned-alternative-design.md` modelled on `/adopted/atl-items-1-3-design.md`'s structure. **NOT in scope:** writing code; touching any module; touching Supabase; the build itself (step 6 of the post-6b arc); the write-path (step 7); A10 (step 8). Founder confirms via AskUserQuestion.

### Step 1 — Surface the design questions (~30–45 min)
Open the design space. Output ~20–30 lines surfacing the candidate design questions. Founder reviews; founder elects which belong in the design pass and which are deferred (PR7). Likely candidate questions to surface:

**Q1 — Relationship to proximity.** Is the kathekon-aligned alternative:
- (a) a complete alternative REPLACING proximity as the load-bearing signal,
- (b) a parallel credential ALONGSIDE proximity (both surfaced independently),
- (c) a composite signal BLENDING proximity and kathekon, or
- (d) something else?

The choice cascades through every subsequent question. **This is the load-bearing question of the design pass.**

**Q2 — Aggregation model.** How does `is_kathekon` + `kathekon_quality` aggregate over a window? Proximity has a `typical_proximity` using a threshold. Does kathekon have a:
- `typical_kathekon` (e.g., majority must be kathekon at moderate-or-stronger quality)?
- `kathekon_compliance_grade` (mapping the existing `kathekon_compliance_rate` to a grade ladder)?
- `quality-weighted_kathekon_score` (a composite of presence + quality)?

**Q3 — Grade ladder.** Does the alternative produce:
- A parallel Senecan grade (kathekon-derived, alongside the existing proximity-derived `senecan_grade`)?
- A new progress dimension on the existing `AccreditationRecord` (e.g., `kathekon_alignment` joining the existing four: `passion_reduction` / `judgement_quality` / `disposition_stability` / `oikeiosis_extension`)?
- A modulation of the existing grade (e.g., consistent non-kathekon downgrades the proximity-derived grade)?

**Q4 — Authority mapping.** Does the alternative produce:
- A parallel authority level (kathekon-derived)?
- A modulation of the existing authority level (e.g., proximity says "autonomous" but consistent non-kathekon downgrades to "spot_checked")?
- No authority impact (kathekon is informational only)?

**Q5 — Layer 1 implications.** Does the alternative require new Layer 1 schema fields:
- A new `kathekon_history` payload distinct from `carried_profile`?
- A new field on the existing `carried_profile` payload (e.g., `typical_kathekon_quality`)?
- No new Layer 1 fields (the existing `carried_profile.window_snapshot.kathekon_compliance_rate` is sufficient)?

If the answer requires a new field or version bump, Rule A (licensing gate) applies — recorded in the decision-log entry.

**Q6 — R18a category language.** The badge currently uses "Character Kernel" category framing (J1 ADR, 2026-05-12). Does the alternative require:
- A separate category label (e.g., "Right Action Kernel")?
- A sub-category within Character Kernel?
- No change — Character Kernel accommodates both signals?

**Q7 — Hand-back report surface.** How does the alternative project into the developer hand-back report's structure (the module just built this session)? Does:
- Section 3 ("Grade / Authority / Badge") gain a kathekon parallel column?
- A separate Section 3.5 ("Kathekon Credential") appear?
- The alternative replace Section 3 entirely when active?
- The per-decision rows in Section 1 carry additional kathekon-aligned fields?

**Q8 — Public endpoint shape.** Does `/api/accreditation/[agent_id]`:
- Gain a parallel `kathekon_payload` alongside the existing `accreditation_payload`?
- Get accompanied by a new endpoint (`/api/kathekon/[agent_id]`)?
- Remain unchanged (the kathekon signal is internal-only)?

**Q9 — Wrapper interaction.** Does the alternative interact with the three iteration patterns (Component 5)? E.g., does `accumulateChosen` (Pattern 2) carry a kathekon signal alongside the existing committed-reasoning carriage? Does `runOrchestrationStep` (Pattern 3) propagate peer agents' kathekon signals?

These are CANDIDATE questions. Founder elects the actual gate questions at this step. Some questions cascade — Q1's answer (a/b/c/d) narrows the others. The design pass may close some questions in this session and defer others to follow-on design work per PR7.

### Step 2 — Design-decision gate (~45–90 min)
Use AskUserQuestion across 2–3 rounds to elect each design decision. For each question, surface options with reasoning. The Step 1 output framed the questions; this step picks the answers. The gate may surface additional questions as earlier answers cascade.

### Step 3 — Draft the design document (~30–45 min)
Produce `/adopted/atl-kathekon-aligned-alternative-design.md` modelled on `/adopted/atl-items-1-3-design.md`'s structure:

- Status + Stream + Governing frame
- Governs / Does not govern
- Sequencing (cross-reference the brainstorm sequencing)
- Scope (in / out)
- Per-Decision sections (one per elected question from Step 2; each with Why / Structural constraint / Field shape / Wrapper supplier / Aggregation / Badge persistence / R-rule engagement / Layer 1 implication as relevant)
- Cross-references

### Step 4 — Verify (~15 min)
Founder reads the design document. Confirm the decisions captured match the Step 2 elections. Any drift gets corrected. No code, no automated checks — design documents verify by founder read (per `/adopted/standing-protocol-cache.md` §"Element 6 — Verification framework" / 0c row "Business document").

### Step 5 — Append decision-log entry (lean form)
`D-ATL-KATHEKON-ALIGNED-ALTERNATIVE-DESIGN-LOCKED-YYYY-MM-DD`. Lean form per `/adopted/standing-protocol-cache.md` §"Lean decision-log entry". Rules served expected: 0a, 0c, 0d-ii, 0f, R0 (the alternative serves trajectory honesty by distinguishing how-reasoned from whether-it-was-fitting), R3, R4 (the boundary preserved — engine internals stay closed), R18a (the Character Kernel question is explicitly answered), R18b (badge transparency on any new credential surface), R18c (interoperability — additive/versioned), AC8, PR7 (deferred items named explicitly), PR10 (Plan/Execute/Verify with Verify = founder read), PR11 (inbox scan), PR15 (consult outcome). PR4/PR6 not engaged.

### Step 6 — Session close (lean form)
`/operations/handoffs/founder/YYYY-MM-DD-kathekon-aligned-alternative-design-pass-close.md` per the lean template. "Next Session Should" names the **kathekon-aligned alternative — build** (step 6 of the post-6b arc).

---

## Part C — Anticipated session shape

| Phase | Estimate |
|---|---|
| Part A — caches + predecessor close + items 1–3 design + wrapper-spec sections + code-file shapes + J1 ADR + PR11 + PR15 | 25–35 min |
| Step 0 — scope confirm | 5 min |
| Step 1 — surface design questions | 30–45 min |
| Step 2 — design-decision gate (2–3 rounds) | 45–90 min |
| Step 3 — draft design document | 30–45 min |
| Step 4 — Verify (founder read) | 15 min |
| Step 5 — decision-log entry | 15–25 min |
| Step 6 — session close | 15–25 min |
| **Total** | **~3–4 hr** |

The natural pause point if the session runs long is after Step 2 (gate complete; document draft is the next bounded chunk). The founder elects whether to take that pause if it comes up.

---

## Rollback path

**Governance rollback:** if any design decision needs revision after the session closes, the rollback is a superseding decision-log entry naming the change + the reasoning. The design document gets revised in a follow-on session (Elevated risk because edits to an adopted governance document are Elevated under 0d-ii). No code rollback — nothing was built this session. The design pass is reversible at any future point without operational impact.

---

## Forecast

A successful design pass produces:

- `/adopted/atl-kathekon-aligned-alternative-design.md` — the design document with founder-elected decisions per the Step 2 gate.
- A decision-log entry recording the design adoption (`D-ATL-KATHEKON-ALIGNED-ALTERNATIVE-DESIGN-LOCKED-YYYY-MM-DD`).
- A session close pointing at the next step (step 6 of the post-6b arc — the kathekon-aligned alternative build).

After this session, the founder has a bounded design for the alternative ready for the build session. The build will likely be Elevated risk (additive types + module changes + possibly a Supabase migration, paralleling the items 1–3 build's shape). With the design locked, the build session's scope is well-bounded — Step 1 of the build session will be a surface survey + small implementation-decision gate, not an open-ended architecture conversation.

After the build (step 6), the write-path session (step 7) lands, then A10 (step 8) closes the post-6b arc.

*End of prompt.*
