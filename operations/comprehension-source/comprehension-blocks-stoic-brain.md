# Comprehension Blocks — Stoic Brain Three-Layer System

**Produced:** 17 April 2026  
**Source sessions:** 6, 7, 7d, 7e, 7f, 14 (Layer 3 wiring)  
**Source documents:** context-architecture-build.md, architectural-decisions-extract.md, decision-log.md

---

## Factual Gap Resolutions

### Gap 1: Exported Constants in stoic-brain-compiled.ts

Eight exported constants, all marked `as const`:

| Constant | Approx. chars | Key structure |
|---|---|---|
| `STOIC_BRAIN_FOUNDATIONS` | ~850 | core_premise, dichotomy_of_control (up_to_us / not_up_to_us), flourishing |
| `PSYCHOLOGY_CONTEXT` | ~1,300 | causal_sequence (4 stages), ruling_faculty, impulse_taxonomy (8 items) |
| `PASSIONS_CONTEXT` | ~2,200 | four_root_passions (epithumia, hedone, phobos, lupe + sub-species), diagnostic_sequence (5 steps), three_good_feelings |
| `VIRTUE_CONTEXT` | ~1,600 | unity_thesis, four_expressions (phronesis, dikaiosyne, andreia, sophrosyne + sub_expressions) |
| `VALUE_CONTEXT` | ~1,800 | hierarchy, preferred_indifferents (12), dispreferred_indifferents (10), selection_principles (5) |
| `ACTION_CONTEXT` | ~1,700 | two_layers (kathekon / katorthoma), oikeiosis_sequence (5 stages), deliberation_framework (Q1–Q5) |
| `PROGRESS_CONTEXT` | ~1,900 | binary_foundation, progress_gradient (3 grades + indicators), progress_metrics (4) |
| `SCORING_CONTEXT` | ~1,400 | evaluation_sequence (4 stages), katorthoma_proximity_scale (5 levels: reflexive → sage_like) |

**Total:** ~13,150 characters across 8 constants. File header notes Stoic Brain v3.0.0 (2026-03-31), optimised for LLM context injection, 500–1000 tokens per block, 3000–6000 tokens total ceiling.

### Gap 2: project-context.json Field Structure

```
version: "1.0.0"                    (string)
last_updated: "2026-04-16"          (string)
baseline:                           (object)
  identity:                         (string — SageReasoning's purpose statement)
  mission:                          (string — principled reasoning as standard AI capability)
  founder:                          (string — sole non-technical founder, AI collaboration)
  ethical_commitments:              (object)
    R17_privacy:                    (string — AES-256-GCM, deletion endpoint)
    R18_honest_certification:       (string — badge scope, adversarial evaluation)
    R19_limitations:                (string — limitations page, mirror principle)
    R20_vulnerable_users:           (string — detection, redirection, asymmetry guidance)
dynamic_defaults:                   (object)
  current_phase:                    (string — "P0 — Foundations (R&D Phase)")
  active_tensions:                  (array of 3 strings)
  recent_decisions:                 (array of 5 timestamped strings)
```

Two-level design: `baseline` is static identity and commitments; `dynamic_defaults` carries phase-specific state that will eventually be served from Supabase when the migration is run.

### Gap 3: Supabase project_context Migration Status

**Not run in production.** Evidence chain:

- Session 7e handoff (10 April 2026): status table shows `supabase-project-context-migration.sql` as "not yet run."
- Session 7f deep thought review: documents migration steps as "when ready to run" and states "not urgent — static defaults in project-context.json are accurate for current phase."
- Layer 3 wiring session (15 April 2026): explicitly states "No schema changes. No env var changes. No migration. No auth changes."
- architectural-decisions-extract.md (15 April 2026): flags this as an open gap requiring code inspection.

**Current behaviour:** `project-context.ts` attempts a Supabase read, catches any error (including table-not-found), and falls back silently to static defaults from `project-context.json`. The fallback is functionally correct for P0.

---

## Comprehension Block: stoic-brain-compiled.ts

**Path:** `website/src/data/stoic-brain-compiled.ts`  
**Purpose:** Single compiled source of all Stoic philosophical knowledge for LLM context injection. Replaces runtime JSON file reads that are incompatible with Vercel's serverless deployment model. Each constant represents one domain of Stoic theory, structured for selective extraction by mechanism-specific loaders.

**Risk classification:** Standard. Additive, read-only data. No auth, no external calls, no state mutation. (Decision log, 6 April 2026 — "sage-reason-engine Shared Module Created + 5 Tools Refactored" entry. The entire Layer 1 pipeline is additive infrastructure with no auth or state mutation.)

**Key decisions:**

- **Compiled TypeScript over runtime JSON.** Vercel serverless functions cannot read from arbitrary filesystem paths at runtime. Compiled constants are bundled into the deployment artifact. (Context-architecture-build.md, session 6; architectural-decisions-extract.md, Layer 1 section.)
- **Eight domain-specific constants, not one monolith.** Each constant maps to a Stoic mechanism (psychology, passions, virtue, value, action, progress, scoring, foundations). This enables the loader to extract only the fields relevant to a given depth level without parsing or filtering a single large object. (Session 7d handoff, Layer 1 rollout.)
- **Token-conscious sizing.** Each constant targets 500–1000 tokens. The file header documents a 3000–6000 token ceiling for the full set. Observed totals: quick ~995, standard ~1538, deep ~2007 — all well under ceiling. (Session 7d verification results.)
- **Source version pinned.** Stoic Brain v3.0.0 (2026-03-31). Changes to the philosophical model require recompilation and redeployment — this is intentional, not a limitation. The philosophical layer should change rarely and deliberately.

**Architectural tensions:** None specific to this file. The compile-time constraint is a Vercel deployment fact, not a design tension.

---

## Comprehension Block: stoic-brain-loader.ts

**Path:** `website/src/lib/context/stoic-brain-loader.ts`  
**Purpose:** Mechanism-specific context builders that extract, format, and compose philosophical knowledge from the compiled constants for injection into LLM system prompts. The loader sits between the raw data (stoic-brain-compiled.ts) and the reasoning engine (sage-reason-engine.ts), translating structured JSON into formatted text blocks sized for each depth level.

**Risk classification:** Standard. Pure data transformation — no external calls, no state, no auth. (Same classification as Layer 1 pipeline, decision log 6 April 2026.)

**Key decisions:**

- **Six mechanism-specific builders, not one generic formatter.** Each `get*Context()` function (control filter, passion diagnosis, oikeiosis, value assessment, kathekon, iterative refinement) knows exactly which fields from which constants it needs. This prevents over-injection: a quick-depth call gets only control filter, passion diagnosis, and oikeiosis data. (Context-architecture-build.md, Layer 1 specification; session 7d handoff.)
- **Three depth levels with explicit mechanism inclusion.** `quick` = 3 mechanisms (~3000 token ceiling); `standard` = 5 mechanisms (~6000 ceiling); `deep` = 6 mechanisms (~6000 ceiling). Depth determines which builders fire, not how much each builder returns. (Session 7d handoff, architectural-decisions-extract.md Layer 1 section.)
- **Composite builder for engine integration.** `getStoicBrainContext(depth)` maps depth to mechanism set, calls each builder, concatenates with separators. `getStoicBrainContextForMechanisms(mechanisms[])` allows callers to override the depth-to-mechanism mapping for special cases. (Architectural-decisions-extract.md.)
- **Separation from reasoning logic.** The loader is a pure formatting module. It does not call LLMs, evaluate actions, or make decisions. All reasoning lives in sage-reason-engine.ts. This separation means the philosophical knowledge layer can be tested, measured, and versioned independently of the reasoning pipeline. (Context-architecture-build.md design principle.)

**Architectural tensions:** None internal. The loader's output feeds into the engine as a parameter, not auto-injected — the caller must opt in by passing `stoicBrainContext`. This was a deliberate choice to prevent response shape regressions when Layer 1 was first wired (session 7d handoff, "no auto-Stoic-Brain injection" note in engine architecture).

---

## Comprehension Block: sage-reason-engine.ts

**Path:** `website/src/lib/sage-reason-engine.ts`  
**Purpose:** Single source of truth for all Stoic reasoning across 23+ endpoints. Accepts a structured input (decision text, depth, optional context layers), composes a multi-block system + user message, calls Claude, validates the response, and returns a structured evaluation envelope with audit receipt. Every endpoint that performs Stoic evaluation calls `runSageReason()` — there is no alternative path.

**Risk classification:** Standard. The engine is additive infrastructure; it does not handle auth, sessions, or user data directly. Individual endpoints handle auth before calling the engine. (Decision log, 6 April 2026 — "sage-reason-engine Shared Module Created + 5 Tools Refactored." Rules served: R4, R5, R12, R14.)

**Key decisions:**

- **Singular Anthropic client.** `getClient()` returns a singleton, enabling connection pooling and unified rate limiting across all endpoints. (Architectural-decisions-extract.md, engine section.)
- **System message separation.** Stoic Brain context (Layer 1) and Agent Brain context are injected as separate blocks in the system message array — never concatenated. This preserves each knowledge source's integrity and makes it possible to measure token contribution per layer. (Session 7d handoff; architectural-decisions-extract.md.)
- **User message stratification with fixed composition order.** The user message is built in six layers: (1) base input + domain context, (2) practitioner context (Layer 2), (3) project context (Layer 3), (4) urgency context, (5) stage scoring instruction, (6) "Return only the JSON evaluation object." This ordering ensures the LLM sees progressively more specific context. (Context-architecture-build.md, "Critical Constraint — Composition Order"; session 7e handoff, Layer 3 wiring.)
- **Model-depth mapping.** quick → Haiku + 3,072 max tokens; standard → Sonnet + 6,000; deep → Sonnet + 8,192. Temperature 0.2 across all depths for reproducible evaluations. (Architectural-decisions-extract.md, engine section.)
- **Haiku-to-Sonnet reliability retry.** If Haiku fails JSON parse on quick depth, the engine auto-retries with Sonnet. Trades latency for consistency without requiring the caller to handle retry logic. (Architectural-decisions-extract.md.)
- **Cache by input hash.** Before any LLM call, the engine checks a cache keyed on input + depth + context hash. Identical queries return cached results immediately. (Architectural-decisions-extract.md, engine section.)
- **Reasoning receipt as first-class output.** Every evaluation generates a receipt tying the output to its mechanisms, model, timing, and quality scores. This serves R14 (audit trail). (Decision log, 6 April 2026.)
- **Three context layers accepted as optional parameters.** `stoicBrainContext` (Layer 1), `practitionerContext` (Layer 2), `projectContext` (Layer 3) are all optional. The engine does not auto-generate any of them — callers must provide what they want injected. This prevents regressions and keeps each endpoint's context profile explicit. (Session 7d handoff, "no auto-Stoic-Brain injection"; session 7e handoff, Layer 3 wiring matrix.)

**Architectural tensions:**

- **Agent-facing endpoints receiving Layer 3 is accepted risk (P3).** The context-architecture-build.md originally specified that agent-facing endpoints (foundational, full, agent baseline) should receive Layer 1 only. During Layer 3 wiring (session 7e, session 14), some agent-adjacent endpoints (guardrail, score-iterate) now inject project context. This leaks SageReasoning's internal state (phase, tensions, recent decisions) to external agents on every call. Flagged in architectural-decisions-extract.md as accepted risk deferred to P3 review. (Architectural-decisions-extract.md, unresolved question #5.)
- **Latency increase from context layers.** Layer 1 alone adds ~24s baseline. Layer 1+2 pushes to ~34-38s due to ~1900 additional context tokens. Layer 3 adds further tokens. No latency budget is formally defined — the impact is documented but not gated. (Session 7d verification results.)

---

## Comprehension Block: guardrails.ts

**Path:** `website/src/lib/guardrails.ts`  
**Purpose:** Middleware layer providing two distinct safety functions: (1) a V3 virtue gate for agent action decisions using the katorthoma proximity scale, and (2) distress detection for human-facing endpoints. The virtue gate tells agents whether their proposed action meets a minimum virtue threshold. The distress detector intercepts human input showing signs of psychological crisis before any LLM call is made.

**Risk classification:** Standard for the virtue gate infrastructure itself. The distress detection function serves R20a (Critical ethical safeguard per project priorities P2), but the guardrails.ts file is additive code — no auth changes, no session mutation, no deployment configuration changes. The R20a pipeline as a whole (classifier, Supabase schema, review workflow) carries its own risk classification at the ADR level. (Decision log, 8 April 2026 — "sage-guard risk_class" entry classifies the guardrail API addition as Elevated; the guardrails.ts module itself is Standard infrastructure.)

**Key decisions:**

- **Ordinal proximity levels replace numeric scores.** V1 used 0–100 weighted virtue scores. V3 uses five qualitative levels (reflexive → habitual → deliberate → principled → sage_like) with explicit ordinal ranking. This prevents false precision and aligns with Stoic developmental theory — the progression toward virtue is qualitative, not quantitative. (Architectural-decisions-extract.md, guardrails section; aligns with R6b/R6c — unified virtue assessment, no independent virtue weights.)
- **Threshold as a gate, not a score target.** The calling agent sets a minimum acceptable proximity level. The guardrail compares and returns a four-level recommendation (proceed / proceed_with_caution / pause_for_review / do_not_proceed) based on the gap between observed proximity and threshold. This is honest: agents declare their risk tolerance; the system evaluates against it. (Architectural-decisions-extract.md, guardrails section.)
- **Four-level recommendation with gap logic.** proximity ≥ threshold+1 → proceed; proximity = threshold → proceed_with_caution; proximity = threshold-1 → pause_for_review; proximity < threshold-1 → do_not_proceed. The gap-based logic means an agent setting a high threshold gets more conservative gating automatically. (Guardrails.ts implementation, lines 69–79.)
- **Distress detection architecturally separate from reasoning.** `detectDistress(text)` runs before any LLM call in human-facing endpoints. If acute or moderate distress is detected, the endpoint returns a redirect to crisis resources immediately — no Stoic evaluation occurs. This prevents the framework from being applied where it doesn't belong (R20a, R20d). (Architectural-decisions-extract.md; decision log 15 April 2026, "R20a Detection Model" entry.)
- **Three-tier severity classification.** Acute (suicidal ideation, self-harm, hopelessness, crisis planning) → block + redirect. Moderate (perceived burdensomeness, extreme isolation, neglected basic needs) → block + redirect. Mild (severe emotional distress without imminent danger) → proceed + append crisis resources. (Decision log, 15 April 2026; guardrails.ts implementation.)
- **Hardcoded crisis resources.** Lifeline AU (13 11 14), Beyond Blue AU (1300 22 4636), NSPL US (988), Crisis Text Line (US/UK/CA), Samaritans UK (116 123). All 24/7. The persistent footer on mentor/journal UIs displays these regardless of detection — detection adds them to API responses as well. (Decision log, 15 April 2026, "R20a Detection Model" entry.)
- **Deliberation quality and alternatives enforcement.** Added 8 April 2026: guardrail responses include `deliberation_quality` field (thorough / adequate / hasty / impulsive). For Critical-risk actions under urgency, if `considered_alternatives` is missing, the system forces `pause_for_review` + `alternatives_warning`. This operationalises the hasty assent concept from Stoic psychology. (Decision log, 8 April 2026, "Second Implementation Batch" entry.)
- **Risk-class-aware depth selection.** The `risk_class` parameter (standard / elevated / critical) auto-selects evaluation depth: standard → quick, elevated → standard, critical → deep. Critical responses include a `rollback_path` field. This embeds the project's Change Risk Classification (0d-ii) into the product itself. (Decision log, 8 April 2026, "Batch 1C" entry.)

**Architectural tensions:**

- **R17c coupling via support_access_log.** The append-only audit trail (ON DELETE RESTRICT) blocks plain user deletion. R17c (genuine deletion endpoint, P2) must design an anonymise-then-delete path. This is documented in decision log 15 April 2026, "CCP-R17a-01" entry, and flagged for P3 legal review.
- **Classifier cost monitoring.** If the R20a two-stage classifier (rule-based + Haiku) exceeds 20% of monthly mentor-turn cost, ADR-R20a-01 is reopened. This cost gate is documented but not yet instrumented — it depends on P4 Stripe/cost-health-alert infrastructure. (Decision log, 15 April 2026, "ADR-R20a-01" entry.)
- **Fail-open-with-alerting on classifier outage.** If the distress classifier is unavailable, the system serves the response normally and fires an alert. This is an accepted trade-off: blocking all human-facing responses during an outage would be worse than missing a detection. The risk is mitigated by the persistent crisis-resources footer that displays regardless of classifier state. (Decision log, 15 April 2026, "ADR-R20a-01" D6-c.)

---

## Cross-File Architecture Summary

| Layer | Data source | Loader | Engine integration | Token budget |
|---|---|---|---|---|
| 1 — Stoic Brain | stoic-brain-compiled.ts (8 constants, ~13K chars) | stoic-brain-loader.ts (6 mechanism builders, 3 depths) | Second system message block (separate from main prompt) | quick ~995, standard ~1538, deep ~2007 |
| 2 — Practitioner | Supabase mentor_profiles (encrypted) | practitioner-context.ts | User message, after domain_context | ~300–500 tokens |
| 3 — Project | project-context.json (static) + Supabase project_context (not yet deployed) | project-context.ts (4 levels: full/summary/condensed/minimal) | User message, after practitioner context | full ~500, summary ~250, condensed ~150, minimal ~200 |

**Composition order in user message (fixed):**
1. Base input + domain_context
2. Practitioner context (Layer 2)
3. Project context (Layer 3)
4. Urgency context
5. Stage scoring instruction
6. "Return only the JSON evaluation object"

**Guard layer:** guardrails.ts sits outside the three-layer stack. Distress detection runs before the engine is called. The virtue gate runs through the engine (guardrail endpoint calls `runSageReason` with Layer 1 context).
