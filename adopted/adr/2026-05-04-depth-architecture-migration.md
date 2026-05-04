# ADR-003 — Depth-as-Migration-Scaffolding for the Translation-Sandwich Architecture

**Status:** Adopted (founder approval at Sub-session E9, 2026-05-04 — "approve" with no edits to the draft). Promotes the framing captured at Sub-session E8 (D-E8-CLEANUP-AND-DEPTH-FRAMING-2026-05-04 §3) from session insight to architectural decision.
**Date:** 2026-05-04.
**Stream:** founder.
**Decided by:** founder, informed by AI recommendation.
**Governing frame:** `/adopted/standing-protocol-cache.md`.
**Predecessor decision-log entries:** `D-E8-CLEANUP-AND-DEPTH-FRAMING-2026-05-04` (E8 — framing origin); `D-DECISION-RAG-WIRED-2026-05-04` (E7 — PR1 rollout arc complete); `D-PATTERN-A1-INTRODUCED-AND-WIRED-2026-05-04` (E5); `D-INTERNAL-RETRIEVE-ROUTE-VERIFIED-2026-05-04` (Sub-session D — ADR-001 origin).
**Related deliverables:** `/adopted/adr/2026-05-04-d6-d7-consumer-wiring.md` (ADR-001 — Pattern A1 + Pattern A2); `/adopted/adr/2026-05-04-d6-d7-loop-pattern-wiring.md` (ADR-002 — α loop pattern); `/website/src/lib/sage-reason-engine.ts` (today's `runSageReason`); `/website/src/lib/depth-constants.ts` (today's `ReasonDepth` + `DEPTH_MECHANISMS`).
**Engages:** R0 (oikeiosis — the migration serves Circle 3 + 4 by aligning the reasoning engine with the project's stated design intent); R4 (IP protection — server-side reasoning unchanged); R5 (cost guardrail — migration touches LLM-call shape and therefore cost); R7 (source fidelity — Layer 1 RAG retrieval unchanged); AC1 (model selection — migration affects which calls are Sonnet vs Haiku); AC6 (four-layer context architecture — translation-sandwich sits inside L1 + L3 layer composition); AC-12 (translation-sandwich narrowness — this ADR is the formal naming of that architecture); KG2 (Haiku reliability boundary — migration may shift which calls land within Haiku's reliability surface); PR1 (single-endpoint proof before rollout — applies to migration too); PR4 (model selection as a constraint — depth-tier today bundles model into a depth choice; migration unbundles it); PR8 (process-rule promotion threshold — this ADR is the second recurrence of the framing; the third would warrant promotion to a process rule).

---

## Context

### What this ADR resolves

Sub-session E8 closed two cleanup items and surfaced a framing decision: depth tiers (`'quick' | 'standard' | 'deep'`) are migration scaffolding for a translation-sandwich architecture, not a primitive. The framing was adopted as session insight in D-E8 §3 and explicitly NOT promoted to a binding architectural constraint at that session.

E9 takes the next step: codify the framing as ADR-003 so future sessions have a single referenceable target architecture and a named migration sequence. The ADR is a plan, not the migration itself; the first migration step is a downstream session.

### Today's depth-tier reality

Across the codebase as at 2026-05-04, the `depth` parameter on `runSageReason` and on Layer 1 RAG retrieval does six jobs simultaneously:

| Job | Mechanism | Source |
|---|---|---|
| 1. Mechanism count for the LLM to apply (3 / 5 / 6) | `DEPTH_MECHANISMS` | `depth-constants.ts:31-35` |
| 2. System prompt selection (`QUICK_SYSTEM_PROMPT` / `STANDARD_…` / `DEEP_…`) | `DEPTH_CONFIG` | `sage-reason-engine.ts:156-368` |
| 3. Model selection (Haiku for `quick`; Sonnet for `standard` and `deep`) | `DEPTH_CONFIG` | `sage-reason-engine.ts:364-368` |
| 4. Max-tokens (3072 / 6000 / 8192) | `DEPTH_CONFIG` | `sage-reason-engine.ts:364-368` |
| 5. Required-fields validation (different JSON shape per depth) | `REQUIRED_FIELDS` | `sage-reason-engine.ts:371-375` |
| 6. Layer 1 corpus tier (which subset of Stoic Brain passages D6 retrieves for grounding) | Route-level `loadLayer1BlockWithFallback(input, depth, …)` | e.g. `/api/score-document/route.ts:139` (deep); `/api/score-scenario/route.ts:335` (quick for SCORING) |

Per-consumer depth choices (`grep depth: ` across `/website/src/app/api/`):

- **`'quick'`** — `/api/skill/sage-moderate`. (`/api/reason` accepts `'quick'` from request body but defaults to `'standard'`.)
- **`'standard'`** — `/api/score`, `/api/score-decision`, `/api/score-social`, `/api/score-scenario` (GENERATION call site only — line 194), and 11 skills (`sage-pivot`, `sage-negotiate`, `sage-retro`, `sage-compliance`, `sage-align`, `sage-premortem`, `sage-resolve`, `sage-educate`, `sage-coach`, `sage-invest`).
- **`'deep'`** — `/api/score-conversation`, `/api/score-document`, `/api/mentor-baseline`, `/api/mentor-baseline-response`, `/api/mentor-journal-week`, `/api/mentor/private/baseline`, `/api/mentor/private/baseline-response`, `/api/mentor/private/journal-week`, and 2 skills (`sage-identity`, `sage-govern`).
- **Mixed-depth route** — `/api/score-scenario` is the only consumer with two Layer 1 corpus-tier choices: `'standard'` for the GENERATION call site (line 194) and `'quick'` for the SCORING call site (line 335). The SCORING call site invokes Sonnet (`MODEL_DEEP`) at the LLM layer despite using Layer 1 corpus tier `'quick'` — the depth-mismatch open question carried forward as Candidate 3 in E8's menu.

### Why the framing is real

The depth-tier as it exists today encodes an LLM-as-reasoner assumption: the LLM applies the mechanisms, decides the JSON shape, and produces both the schema and the prose. The framing in D-E8 §3 names a different design intent: the LLM is a translator, not a reasoner. The reasoning middle is meant to be deterministic — code applies all mechanisms to a structured representation, and the LLM is invoked only at the boundaries (text-in → schema, schema → text-out).

Under the LLM-as-reasoner reading, depth-tier is a primitive: it tells the model how hard to think. Under the LLM-as-translator reading, depth-tier is scaffolding: it persists today only because not all consumers operate under the new architecture, and the engine has to handle both.

The framing also serves R0 (oikeiosis). A reasoning engine that lets the LLM's training-data biases substitute for principled mechanism application is one that serves the LLM's defaults rather than the Stoic framework. The translation-sandwich routes the LLM's flexibility to the boundaries (where natural-language understanding is genuinely needed) and gives the framework's mechanism application to deterministic code (where principled discipline is genuinely needed).

## Decision

### Target architecture — the translation-sandwich

ADR-003 names the translation-sandwich as the target architecture for the reasoning engine. Three layers; the LLM operates at layers 1 and 3 only:

| Layer | Function | LLM? | Today |
|---|---|---|---|
| **Layer 1 — Text-to-schema translation** | Reads the user's input text. Extracts structured features: which passions appear, which control-filter elements are present, which oikeiosis circles are engaged, which value-assessment categories are at stake, and so on. Produces a deterministic-shape schema. | Sonnet (per AC1; multi-step structured feature extraction; Haiku unreliable per KG2) | Conflated with Layer 2 inside `runSageReason`'s system prompt — the LLM both extracts features and reasons about them in the same call. |
| **Layer 2 — Mechanism application (the reasoning middle)** | Receives the Layer 1 schema. Applies all six Stoic mechanisms (control filter, passion diagnosis, oikeiosis, value assessment, kathekon, iterative refinement) deterministically in code. Produces the assessed schema (proximity, virtue domains, philosophical reflection content, improvement path). | **No LLM.** Code only. | Currently performed by the LLM as part of the same call as Layer 1 + Layer 3. Deterministic application does not yet exist as code. |
| **Layer 3 — Schema-to-text translation** | Receives the assessed schema. Produces per-consumer prose appropriate to the consumer's audience and depth of explanation: a short reflection for `/api/reason`; a scoring envelope for the `/api/score-*` family; a mentor-voice response for `/api/mentor/private/reflect`. | Sonnet (per AC1; per-consumer prose generation requires reliable structured output) | Conflated with Layer 1 + Layer 2 inside `runSageReason`'s system prompt — the same LLM call produces all three. |

### What depth-tier becomes post-migration

Once Layer 2 is deterministic code, the four depth-tier jobs that name LLM behaviour collapse:

- **Job 1 (mechanism count)** — All six mechanisms always apply, deterministically. There is no "quick" reasoning that omits value assessment; there is only the schema and the code that populates it.
- **Job 2 (system prompt selection)** — Layer 1 has its own system prompt (extraction). Layer 3 has its own system prompts (per-consumer prose). Neither is a depth-tier choice; each is a layer-and-consumer choice.
- **Job 3 (model selection)** — Layer 1 is Sonnet (per AC1). Layer 3 is Sonnet (per AC1). Neither layer's model is a depth-tier choice. Haiku-for-`quick` collapses with the depth-tier; if a consumer's Layer 3 prose is short and simple-JSON enough to fit Haiku's reliability boundary (KG2), that is a per-consumer Layer 3 choice, not a depth-tier choice.
- **Job 5 (required-fields validation)** — The schema is fixed; the validator validates against the schema, not against a depth-tier shape.

The two jobs that survive the collapse are not depth-tier jobs; they are independent parameters that today happen to be bundled into depth:

- **Job 4 (max-tokens)** — Survives as a per-Layer-1-and-Layer-3-call parameter, set per call site, not by depth-tier. May still take three values (small / medium / large) for prose-elaboration purposes at Layer 3, but those values are not the same axis as today's `'quick' | 'standard' | 'deep'`. Today's depth ties max-tokens to mechanism count; post-migration it ties to per-consumer prose-elaboration choice.
- **Job 6 (Layer 1 corpus tier)** — Survives as a retrieval-scope parameter on D6. Today it is bundled with depth (`loadLayer1BlockWithFallback(input, depth, …)`); post-migration it is independent (`retrievePassages({ ..., mechanism_filter: [...] })` already exposes per-mechanism filtering — see ADR-001 §"Request shape"). The retrieval-scope choice may map to "narrow / medium / broad" tiers but is not the same axis as depth-as-LLM-reasoning-tier.

In short: depth-tier today does six jobs because the engine conflates three layers into one LLM call. Post-migration, the layers are separate, the mechanism application is deterministic, and depth-tier as a single bundled parameter has no remaining job. Its components survive as independent per-call parameters at Layer 1 and Layer 3.

### Migration as scaffolding

Today's depth-tier is the scaffolding that holds the engine together while the layers are conflated. It persists in the codebase only because not all consumers operate under the new architecture. The migration retires the scaffolding consumer by consumer; once all consumers have moved to the layer-separated engine, depth-tier as a parameter on `runSageReason` and on Layer 1 retrieval can be deleted.

### Migration sequence — consumer-by-consumer

The migration is not a single switch. Each consumer is moved individually, the new engine surface is verified per consumer, and only when all consumers have moved is the depth-tier scaffolding removed. The sequence below is the proposed order; the founder revises at session-open if a different order serves better.

| Order | Consumer(s) | Why this order | Risk class |
|---|---|---|---|
| **M1 — pilot** | `/api/reason` (single consumer; defaults to `'standard'`; the reference implementation that other consumers' wiring patterns derive from per ADR-001 + ADR-002) | First proof of the layer-separated engine. PR1 single-endpoint discipline. The pilot establishes the Layer 1 + Layer 2 + Layer 3 surfaces of the new engine and proves them on the simplest consumer. | Critical (per AC7-style standing constraint for engine architecture; the pilot changes the shape of the LLM call for a user-facing route — the Critical Change Protocol applies). |
| **M2 — score family** | `/api/score`, `/api/score-decision`, `/api/score-social`, `/api/score-scenario`, `/api/score-document` (rest of the `/api/score-*` family; all wired under Pattern A1 or A2 per ADR-001 + ADR-002) | Once the pilot proves the new engine, the `/api/score-*` family is the next-largest cluster sharing similar scoring-envelope output shapes. The five routes can be migrated as a group with a single new Layer 3 prompt template per shape. | Elevated per route (changes existing user-facing functionality); cumulative effect = Critical (engine-wide migration). |
| **M3 — mentor family** | `/api/mentor-baseline`, `/api/mentor-baseline-response`, `/api/mentor-journal-week`, `/api/mentor/private/baseline`, `/api/mentor/private/baseline-response`, `/api/mentor/private/journal-week`, `/api/mentor/private/reflect` | Mentor routes use `systemPromptOverride` (per `runSageReason`'s `ReasonInput.systemPromptOverride` parameter) and have their own bespoke system prompts. Migration here is more invasive — the bespoke prompts conflate Layer 1 + Layer 2 + Layer 3 differently from the engine defaults. Each route needs its own Layer 3 prompt analysis. | Elevated per route; cumulative Critical for the mentor surface. R17b applies (intimate-data routes). |
| **M4 — skill family** | All `/api/skill/sage-*` routes (15+ skills using depth `'quick' | 'standard' | 'deep'`) | Skills are wrappers around `runSageReason` with depth chosen per skill type (per `/api/skill/sage-*/route.ts`). Once the engine is layer-separated, the skills' depth choices become per-skill Layer 3 prose-elaboration choices; the migration here is mechanical. | Elevated per route; cumulative Critical for the skill marketplace surface. R10 applies. |
| **M5 — scaffolding retirement** | Delete the `depth` parameter from `runSageReason`; delete `DEPTH_MECHANISMS`, `DEPTH_CONFIG`, `REQUIRED_FIELDS`, `QUICK_SYSTEM_PROMPT`, `STANDARD_SYSTEM_PROMPT`, `DEEP_SYSTEM_PROMPT`. Delete `loadLayer1BlockWithFallback`'s `depth` parameter. Delete `depth-constants.ts`. | The retirement step is itself a migration — every reference to depth-tier across the codebase is removed. Only after M1–M4 are Verified-in-place across all consumers. | Critical (engine-wide deletion; the Critical Change Protocol applies — rollback path is `git revert` of the deletion commit). |

### Retirement triggers

Depth-tier scaffolding can be retired (M5) when **all** of the following are true:

1. Every user-facing consumer in the R20a perimeter (per AC5: `/api/score`, `/api/score-decision`, `/api/score-document`, `/api/score-scenario`, `/api/score-social`, `/api/reason`, `/api/reflect`, `/api/mentor/private/reflect`) is Verified-in-place under the layer-separated engine.
2. Every skill route is Verified-in-place under the layer-separated engine.
3. Every mentor route is Verified-in-place under the layer-separated engine.
4. The R20a invocation harness (`r20a-invocation-guard.test.ts`) passes against the layer-separated engine — the distress check at AC2 + AC5 fires once per request, before any layer call.
5. The full RAG harness (`verify-reason-rag.ts`, currently 171 checks; will likely grow during migration) passes against the layer-separated engine.
6. The eval suite (per ES1 + ES2 + ES3) passes against the layer-separated engine.
7. The founder approves M5 at a dedicated session with the manifest in front, per the project instructions's protection of governing documents.

If any of 1–6 are not met, M5 does not happen and the scaffolding stays. There is no partial retirement.

### What this ADR does not decide

- **The pilot session's exact wiring shape.** ADR-003 names the architecture; the pilot session (M1) drafts its own ADR specifying the new engine's interface, error handling, fallback semantics, and verification harness. ADR-004 (or whatever number it earns) is downstream of this one.
- **Whether Layer 1's schema shape exactly matches today's JSON envelope.** The migration may simplify or restructure the schema for deterministic mechanism application. The pilot session decides.
- **Whether Layer 3 produces today's exact prose envelopes.** Per-consumer Layer 3 prompts may produce different prose. The pilot session decides for `/api/reason`; subsequent migration sessions decide per consumer.
- **Whether Layer 2's deterministic mechanism application uses any non-LLM AI assistance** (e.g. embedding-based similarity at Layer 2 to augment passion diagnosis). The pilot session decides; the default is deterministic code only, no embeddings or other AI in Layer 2.
- **Cost differentials.** Today's depth-tier `'quick'` (Haiku) is cheaper than `'standard'` and `'deep'` (Sonnet). Post-migration, Layer 1 + Layer 3 are both Sonnet — likely more expensive than today's `'quick'` consumers, comparable to today's `'standard'` and `'deep'` consumers. The pilot session measures and reports; the founder decides whether the cost is acceptable per R5.
- **Cost data for stress-testing the framing.** D-E8 §3 noted that cost differentials are not yet measured. ADR-003 codifies the framing without that data; the pilot session is where the data is gathered. If the pilot finds the cost is unacceptable per R5, ADR-003 is revisited.
- **The depth question on Candidate 3 (`/api/score-scenario` SCORING).** Under ADR-003, Candidate 3 becomes a holding-pattern fix that stops mattering at M2 (when score-scenario is migrated). Whether the founder still wants to execute Candidate 3 before M2 is a separate decision; the migration lens does not foreclose it.

### Pattern variant naming

For cross-reference in future sessions, the layer-separated engine is named the **translation-sandwich engine**. Today's engine is named the **bundled-depth engine** (retrospectively). The migration is named the **translation-sandwich migration**. Pattern A1 + Pattern A2 + α loop pattern (ADR-001 + ADR-002) describe the route-engine wiring discipline; they continue to apply post-migration with the route's stoicBrainContext source coming from D6 + D7 retrieval (unchanged) but the route's engine call invoking Layer 1 + Layer 3 separately.

## AC8 candidate wording

ADR-003 proposes adding **AC8 — Translation-Sandwich Architectural Constraint** to the manifest's Architectural Constraints section. Proposed wording for founder approval (separate decision; AC8 lands in a future amendment session if approved):

> ### AC8 — Translation-Sandwich Architectural Constraint
>
> The reasoning engine's target architecture is the translation-sandwich: text → Layer 1 LLM (extract schema) → Layer 2 deterministic mechanism application (no LLM) → schema → Layer 3 LLM (per-consumer prose). LLM calls operate at the boundaries; mechanism application is deterministic code.
>
> Today's bundled-depth engine (where depth-tier on `runSageReason` selects mechanism count, system prompt, model, max-tokens, required fields, and Layer 1 corpus tier in a single bundled choice) is migration scaffolding. It persists in the codebase only because not all consumers operate under the new architecture. The depth parameter on `runSageReason` and on Layer 1 retrieval is retired (per the migration plan in ADR-003) once all consumers have moved.
>
> Any new consumer added to the codebase before scaffolding retirement (M5) operates under the bundled-depth engine to maintain consistency; consumers added after M5 operate under the translation-sandwich engine.
>
> *Source: ADR-003, 2026-05-04. Migration sequence: ADR-003 §"Migration sequence — consumer-by-consumer". Retirement triggers: ADR-003 §"Retirement triggers".*

The founder may approve AC8 verbatim, edit the wording, defer AC8 to a separate amendment session, or reject AC8 entirely (in which case ADR-003 stands as a plan but does not have manifest-level binding force).

## Consequences

### Positive

- The depth-architecture framing is codified. Future sessions touching `runSageReason` or any consumer's depth choice have a single referenceable target architecture and a named migration sequence.
- The translation-sandwich naming distinguishes today's bundled-depth engine from the target architecture, removing ambiguity in cross-session reference.
- The migration sequence (M1 → M2 → M3 → M4 → M5) gives the founder a concrete picture of what the migration looks like, in what order, with what risk class. No session is committed to a specific timing; the order itself is the artefact.
- Candidate 3's status is clarified — under ADR-003 it becomes a holding-pattern fix that stops mattering at M2. The founder retains the option to execute it before M2 or to defer it entirely.
- The migration's downstream sessions (M1 onwards) inherit a clear contract from ADR-003: each session drafts its own consumer-specific ADR proving the wiring on one consumer first (PR1 discipline) before generalising.

### Negative / known costs

- ADR-003 codifies a framing without measured cost data. The founder accepts the framing without the data; the data is gathered at the pilot session (M1). If the pilot finds cost is unacceptable per R5, ADR-003 is revisited.
- The pilot session (M1) is Critical-tier under PR6-style escalation (changes the shape of an LLM call for a user-facing route in the R20a perimeter). The Critical Change Protocol applies — what changes, what breaks, rollback plan, verification step, explicit approval. This is documented overhead for the pilot.
- The migration spans multiple sessions (5+, given M1 alone is a Critical session). The founder is choosing a multi-session arc. The framing is captured even if the migration never completes — depth-as-scaffolding remains the lens for any future session touching the engine.
- AC8 (if adopted) constrains new consumer additions to operate under the bundled-depth engine until M5. This is a small ongoing cost: any new consumer added pre-M5 will need migration twice (once into the bundled engine, again at M5). The alternative — letting new consumers land under the translation-sandwich engine before M5 — would create two engine surfaces simultaneously, defeating the migration's purpose. The cost is accepted.

### Risks named

- **Cost underestimate.** Layer 1 + Layer 3 are both Sonnet calls per AC1. A request that today is one Sonnet call (e.g. `/api/score` at `'standard'`) becomes two Sonnet calls under the migration. Per-request cost roughly doubles for `'standard'` and `'deep'` consumers; cost increases significantly for `'quick'` consumers (which today use Haiku). R5's 2x revenue-to-cost threshold may engage. The pilot session measures and reports.
- **Latency increase.** Two sequential LLM calls instead of one. Layer 2's deterministic mechanism application is fast (code, not LLM) but does not reduce the wall-clock latency from sequential LLM calls. The pilot session measures and reports.
- **Schema fidelity.** The deterministic mechanism application at Layer 2 must produce assessments equivalent in quality to today's LLM-as-reasoner output. If the Layer 1 schema does not capture enough of the input's nuance, Layer 2's mechanism application will be impoverished. The pilot session is where this risk is tested.
- **R20a perimeter unaffected at the architecture layer, but per-pilot-session attention required.** The R20a distress check (per AC5) fires before any reasoning call regardless of architecture. The pilot session must verify that the layer-separated engine does not bypass or alter the perimeter. PR6 + AC4 invocation testing applies.
- **Rollback complexity at M5.** Retiring depth-tier across the codebase is a single large commit; rollback is `git revert` of the deletion commit. If retirement reveals an unmigrated consumer or a verification gap, M5 is reverted, the gap is closed, and M5 is re-run. The Critical Change Protocol applies.
- **Skill-marketplace breakage.** Skills (M4) are public-facing surfaces (per R10). Migration of skills must not break their public contracts. Skill migration sessions need explicit per-skill verification.
- **Mentor-route intimacy.** Mentor routes (M3) handle intimate data (per R17). Migration must preserve R17b application-level encryption and R17c deletion semantics. Mentor migration sessions are Critical-tier per R17f.

### What this ADR is not

- **Not a session-by-session schedule.** ADR-003 names the migration sequence, not its timing. The founder decides session-by-session whether to advance the migration, defer it, or pivot to other Priority work.
- **Not a deletion of today's depth-tier.** Today's bundled-depth engine continues to operate without modification post-ADR-003. The first deletion is at M5, after every consumer has migrated.
- **Not a commitment to AC8.** AC8 is a candidate; the founder decides separately whether it lands.
- **Not a foreclosure on Candidate 3 (`/api/score-scenario` SCORING).** The migration lens reframes Candidate 3 as a holding-pattern fix, but does not prohibit executing it before M2. The founder decides.

## Approval

Approval signal from the founder: "approve" (or specific edits) → ADR moves from `/drafts/adr/` to `/adopted/adr/` in this session, and the AC8 candidate wording is surfaced separately for adopt-now / defer / reject. If the founder rejects ADR-003, the framing remains as session insight in D-E8 §3 and is revisited at a future session.

## Changelog

- **2026-05-04 (initial Adoption, Sub-session E9)** — drafted in `/drafts/adr/`, approved verbatim by founder ("approve" — no edits), moved to `/adopted/adr/`. Promotes the framing captured at D-E8 §3 (E8 session insight) to architectural decision. AC8 candidate wording surfaced for separate decision; disposition recorded in this session's decision-log entry.

---

*End of ADR-003.*
