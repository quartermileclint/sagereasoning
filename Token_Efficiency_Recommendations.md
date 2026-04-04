# Token Efficiency Recommendations for SageReasoning

**Date:** 4 April 2026
**Source:** "Stop burning tokens and blaming the model" transcript + codebase audit
**Purpose:** Apply the transcript's principles to the existing build and remaining sage-mentor work

---

## What the Transcript Argues

The core thesis: frontier models are getting more expensive (not cheaper), so token efficiency is a job skill. The six principles are: convert documents to markdown before ingestion, don't sprawl conversations, use the right model for the right task, audit what loads before you type, cache stable context, and measure what you burn.

For agent builders specifically, the five commandments are: index your references, prepare context for consumption, cache stable context, scope every agent's context to the minimum it needs, and measure per-call token cost.

---

## What SageReasoning Already Does Well

The existing build is in better shape than most. Specifically:

**Prompt caching is implemented.** Every scoring endpoint uses Anthropic's `cache_control: { type: 'ephemeral' }` on system prompts. This gives you the 90% discount on cache hits that the transcript considers the "lowest effort, highest impact" optimisation.

**Model routing is already in place.** Haiku handles ~70% of operations (quick scoring, classification, prioritisation). Sonnet handles deep deliberation chains. This is exactly the "don't bring a Ferrari to the grocery store" principle.

**Stoic-brain data is not embedded in API requests.** The 8 JSON files (~21K tokens total) are used as reference material for prompt engineering. The actual prompts reference concepts from them without dumping the raw files into context.

**Application-level LRU cache exists.** SHA-256-keyed with 1-hour TTL and 500-entry limit. Identical inputs return cached results at zero token cost.

**Ring-wrapper has local-first logic.** `findRelevantJournalPassage()` and `checkPassionPatterns()` use keyword matching without an LLM call. Authority promotion uses deterministic thresholds. These save ~500-800 tokens per ring cycle by avoiding unnecessary LLM roundtrips.

---

## Recommended Changes to the Existing Build

### 1. Add a third model tier — use Haiku for the ring's routine checks

**Where:** `sage-mentor/ring-wrapper.ts` (executeBefore / executeAfter)

**Problem:** The ring wrapper builds ~1,200-token prompts for before/after checks but doesn't specify which model to use. When this gets wired to the LLM, the default will likely be whatever the caller passes — which could be Sonnet or even Opus for a simple "does this task align with their values?" check.

**Fix:** Define explicit model routing in the ring wrapper. Routine before/after checks (where `shouldCheckAction` returns true via sampling) should default to Haiku. Only escalate to Sonnet when the before-check detects genuine concerns (passion pattern match or value misalignment).

**Estimated saving:** 3-4x cost reduction on ring evaluations, which will be the most frequent LLM call in the mentor system.

### 2. Compress the mentor persona system prompt

**Where:** `sage-mentor/persona.ts` (buildMentorPersona)

**Problem:** The full mentor persona prompt is ~3,500-4,000 tokens. It includes the complete 7-pathway table, all governance rules, the physician metaphor, and the ring architecture explanation. Much of this is instructional scaffolding that modern models don't need repeated every session.

**Fix:** Split the persona into two tiers:
- **Core persona** (~1,200 tokens): Identity, voice principles, the 4-stage evaluation summary, key rules (R1, R3, R6c, R12). This loads every session.
- **Extended reference** (~2,800 tokens): Full pathway table, governance details, physician metaphor, ring architecture. This loads only on first interaction of a session or when the ring detects a complex situation (e.g., grade transition boundary, new passion detected).

Cache the core persona with Anthropic's prompt caching. The extended reference only loads when needed.

**Estimated saving:** ~2,500 tokens per routine interaction (saving the extended reference on ~80% of calls).

### 3. Scope journal ingestion extraction prompts per phase

**Where:** `sage-mentor/journal-ingestion.ts` (buildExtractionPrompt)

**Problem:** Every extraction prompt includes the full passion taxonomy (25 species), complete causal sequence, all value categories, all oikeiosis stages, and all virtue domains. That's ~800 tokens of static reference material per chunk — and the pipeline processes 7+ chunks.

**Fix:** The `PHASE_BRAIN_MAPPING` already maps each journal phase to specific brain files and extraction targets. Use this to scope the reference material:
- Foundation phase → only load core concepts + value categories
- Emotions phase → load full passion taxonomy + causal sequence
- Wisdom phase → load virtue domains + progress dimensions
- Integration phase → load all (this is the synthesising phase)

**Estimated saving:** ~400-500 tokens per chunk × 5-6 chunks = ~2,500-3,000 tokens per journal ingestion.

### 4. Pre-compute and cache the profile context string

**Where:** `sage-mentor/persona.ts` (buildProfileContext) + `sage-mentor/profile-store.ts`

**Problem:** `buildProfileContext()` reconstructs the full profile string every time it's called — including iterating over passions, values, oikeiosis, virtues, and causal tendencies. This string only changes when the profile is updated (after interactions are recorded).

**Fix:** Compute the profile context string once when the profile loads or updates, and store it on the profile object. The ring wrapper then reads this pre-computed string instead of rebuilding it on every before/after check.

**Estimated saving:** Negligible token savings (same output), but measurable latency improvement when the ring runs multiple checks per session.

### 5. Add token instrumentation to the ring wrapper

**Where:** `sage-mentor/ring-wrapper.ts` (new addition)

**Problem:** The transcript's fifth commandment: "Measure what you burn." The ring wrapper will make frequent LLM calls but has no mechanism to track per-call or per-session token usage.

**Fix:** Add a `TokenUsage` type and accumulator to `RingSession`:
- Track input tokens, output tokens, model used, and cost estimate per call
- Aggregate per session (morning check-in + N ring cycles + evening reflection)
- Surface in the profile store so you can monitor cost per user over time

This also feeds the business model — you'll need per-user cost data to validate pricing tiers.

---

## Recommended Changes to the Remaining Build

### 6. Proactive scheduling (Priority 5) — use Haiku for morning/evening prompts

**Context:** The brainstorm's Priority 5 is proactive scheduling — morning check-ins, evening reflections, weekly pattern mirrors. These will be the most frequent LLM calls per user.

**Recommendation:** Morning check-ins and evening reflections are conversational — they ask a question and listen. They don't need Sonnet-level reasoning. Default to Haiku. Only escalate to Sonnet for the weekly pattern mirror (which needs to synthesise a week of data into narrative insight).

**Estimated saving:** 3-4x cost reduction on daily proactive calls. For a user with 2 daily proactive calls, this is the difference between ~$0.02/day and ~$0.005/day per user.

### 7. Pattern recognition engine (Priority 6) — batch and pre-compute

**Context:** The brainstorm's Priority 6 is the pattern recognition engine that identifies recurring passion patterns, value-action gaps, and oikeiosis shifts across the rolling window.

**Recommendation:** Do NOT run pattern recognition on every interaction. Instead:
- Run it as a batch job after every Nth interaction (e.g., every 5th) or once daily
- Pre-compute pattern summaries and store them in the profile
- The ring wrapper reads pre-computed patterns instead of running fresh analysis each time

This follows the transcript's principle: "prepare your context for consumption — a reference document should arrive ready to be used, not ready to be processed."

### 8. Inner agent authority manager (Priority 7) — keep it deterministic

**Context:** The brainstorm's Priority 7 is the authority promotion system for inner agents.

**Recommendation:** This should remain fully deterministic (threshold-based) with zero LLM calls. The existing `evaluateAuthorityPromotion()` already works this way. Don't add an LLM evaluation step to authority decisions — it would add cost with minimal benefit since the thresholds are well-defined.

### 9. Journal ingestion — use chunked summarisation with model routing

**Context:** When the full journal ingestion pipeline runs, it will process 7+ chunks of a 190-page journal. Each chunk gets an extraction prompt sent to the LLM.

**Recommendation:**
- Use Sonnet for the extraction phase (needs analytical depth to identify passions, false judgements, causal tendencies)
- Use Haiku for the aggregation phase (merging chunk results is more mechanical)
- Cache the extraction prompt's static reference material (passion taxonomy, etc.) since it repeats across chunks — this is exactly the "cache stable context" commandment

### 10. Document input handling — enforce markdown conversion

**Context:** The transcript's number one rookie mistake: feeding raw PDFs. SageReasoning already has a journal ingestion pipeline, but future features may accept user-uploaded documents for scoring.

**Recommendation:** If you build document upload for the mentor (e.g., "evaluate my decision memo"), add a mandatory markdown conversion step before the content enters any prompt. The scoring endpoint already handles text input cleanly — make sure any document upload path strips formatting overhead before it reaches the LLM.

---

## Summary Table

| # | Change | Where | Token Impact | Effort |
|---|--------|-------|-------------|--------|
| 1 | Model routing in ring wrapper | ring-wrapper.ts | 3-4x on ring calls | Low |
| 2 | Split persona into core/extended | persona.ts | ~2,500/routine call | Medium |
| 3 | Phase-scoped extraction prompts | journal-ingestion.ts | ~3,000/ingestion | Medium |
| 4 | Pre-compute profile context | persona.ts + profile-store.ts | Latency only | Low |
| 5 | Token instrumentation | ring-wrapper.ts | Measurement | Medium |
| 6 | Haiku for daily proactive calls | (Priority 5 build) | 3-4x on dailies | Low |
| 7 | Batch pattern recognition | (Priority 6 build) | Avoids per-call analysis | Medium |
| 8 | Keep authority deterministic | (Priority 7 build) | Zero LLM cost | None |
| 9 | Model routing for journal ingestion | journal-ingestion.ts | Haiku on aggregation | Low |
| 10 | Markdown conversion on upload | (future feature) | Up to 20x on documents | Low |

---

## What NOT to Change

The transcript warns against over-optimisation too. These parts of the build should stay as they are:

- **The full passion taxonomy in extraction prompts** — yes it's ~800 tokens, but passion identification is the core analytical task. Stripping it risks false negatives on sub-species detection. (Though scoping by phase as in #3 above is safe.)
- **The governance rules in the persona prompt** — R1, R3, R6c, and R12 are non-negotiable. They must appear in every LLM call that produces evaluative output. The savings from #2 above come from the *other* rules and the pathway table, not the core four.
- **The application-level LRU cache** — it's well-implemented with appropriate TTL and keying. Don't over-optimise the cache itself.
- **Sonnet for deliberation chains** — the score-iterate endpoint uses Sonnet and it should. Multi-step reasoning with iterative refinement is exactly what the more capable model is for.
