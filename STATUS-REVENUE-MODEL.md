# SageReasoning Revenue Model Implementation Status

**Priority:** 10 (Revenue Generation)
**Created:** 2026-03-29
**Last Updated:** 2026-03-29

## Overview

Implement revenue model for AI agent API access, protect intellectual property, and prepare for Stripe integration. This document tracks the pre-Stripe changes required so that when payment processing goes live, the value proposition is protected and the tier structure is enforced.

---

## TASK 1: Change Licence from MIT to Proprietary Evaluation-Only
**Status:** DONE (2026-03-29)
**Files affected:**
- `/stoic-brain/stoic-brain.json` (currently CC BY 4.0 in meta.license)
- `/stoic-brain/virtues.json` (no explicit licence, inherits from stoic-brain.json)
- `/stoic-brain/indifferents.json` (no explicit licence, inherits)
- `/stoic-brain/scoring-rules.json` (no explicit licence, inherits)
- `/stoic-brain/schema.json` (no explicit licence, inherits)
- `/AGENTS.md` (states "MIT-licensed" on line 88)
- `/website/public/llms.txt` (no licence stated but says "open dataset")
- `/website/public/.well-known/agent-card.json` (capability description says "MIT-licensed")
- New file: `/LICENSE` (proprietary licence text)

**What to do:**
1. Create `/LICENSE` with proprietary evaluation-only licence text
2. Update `stoic-brain.json` meta.license from "CC BY 4.0" to reference the new licence
3. Update `AGENTS.md` line 88 — remove "MIT-licensed" and reference the proprietary licence
4. Update `agent-card.json` capability description — remove "MIT-licensed"
5. Update `llms.txt` footer — remove "Open dataset" reference

**Licence terms must state:**
- Public JSON files may be read for evaluation and integration testing
- Using the data to build or operate a competing Stoic scoring service is prohibited
- Using the data via the SageReasoning API (free or paid) is permitted
- Enterprise licence available for self-hosted deployment (contact for pricing)
- The philosophical source texts themselves remain public domain; this licence covers only SageReasoning's structured data compilation

---

## TASK 2: Strip Public JSON Files to Conceptual Overview
**Status:** DONE (2026-03-29)
**Files affected:**
- `/stoic-brain/virtues.json` — STRIP: sub-virtue scoring_weights, remove sub-virtue Greek terms and detailed descriptions. KEEP: virtue names, IDs, high-level descriptions, tier definitions
- `/stoic-brain/indifferents.json` — STRIP: virtue_relevance scores, scoring_notes, sage_stance details. KEEP: indifferent names, categories (preferred/dispreferred/neutral), brief descriptions
- `/stoic-brain/scoring-rules.json` — STRIP: virtue_weights (the 0.30/0.25/0.25/0.20 formula), scoring_criteria (the score_high_if/score_low_if lists), conflict_resolution rules, indifferents_scoring_map algorithm, past/prospective action scoring input/output field specifications. KEEP: top-level description, scoring tier names and ranges
- `/stoic-brain/schema.json` — STRIP: scoring_weight properties from virtue and sub-virtue definitions, virtue_relevance from indifferent definition. KEEP: structural definitions without scoring mechanics
- `/stoic-brain/stoic-brain.json` — STRIP: ai_agent_instructions that say "fetch this file and virtues.json + indifferents.json for full context". REPLACE with: instruction to use the API for scoring

**What the stripped files provide:**
- Discovery: an agent understands what SageReasoning is and what the four virtues are
- Motivation: enough context to see the value of virtue-based scoring
- Integration path: clear pointer to the API as the way to get scores

**What the stripped files do NOT provide:**
- The precise weighting formula (wisdom 30%, justice 25%, etc.)
- The 16 sub-virtue scoring weights
- The virtue_relevance scores for each indifferent
- The scoring criteria (what scores high/low)
- The conflict resolution rules from Cicero
- The indifferent ranking algorithm
- The input/output field specifications for scoring

---

## TASK 3: Preserve Full JSON Files as Server-Side Assets
**Status:** DONE (2026-03-29)
**Files to create:**
- `/stoic-brain/internal/virtues-full.json` — complete file with all scoring weights
- `/stoic-brain/internal/indifferents-full.json` — complete file with virtue_relevance scores
- `/stoic-brain/internal/scoring-rules-full.json` — complete file with all formulas and criteria
- `/stoic-brain/internal/schema-full.json` — complete schema with scoring properties

**Important:**
- Add `/stoic-brain/internal/` to `.gitignore` so full files are never committed to the public repo
- These files are used server-side by the scoring API routes
- Enterprise licence customers receive copies of these files
- The existing API route code references the scoring data via hardcoded prompts (not file reads), so the API continues to work without changes

**Note:** The scoring prompts in the API routes (e.g., `score-iterate/route.ts`, `baseline/agent/route.ts`) already contain the virtue weights and scoring criteria inline in their system prompts. The JSON files are reference data, not runtime dependencies. This means stripping the public files does NOT break the scoring engine.

---

## TASK 4: Restructure Free Tier for AI Agents
**Status:** DONE (2026-03-29)
**Files affected:**
- `/api/api-keys-schema.sql` — update DEFAULT values in CREATE TABLE
- `/website/src/lib/security.ts` — update comments documenting free tier limits
- `/website/src/app/api/score-iterate/route.ts` — add iteration cap enforcement

**Changes:**
| Parameter | Current Free Tier | New Free Tier |
|-----------|------------------|---------------|
| monthly_limit | 667 | 1 per day (use daily_limit only) |
| daily_limit | 50 | 1 |
| max_chain_iterations | 20 | 1 |

**Implementation detail:**
- Set `monthly_limit` to 30 (1/day * 30 days, with slight buffer)
- Set `daily_limit` to 1
- Set `max_chain_iterations` to 1
- The `score-iterate` route must check `chain.iteration_count >= keyCheck.max_chain_iterations` and return a 403 with upgrade messaging when exceeded

**Messaging on limit hit:**
- Daily: "Free tier allows 1 API call per day. Upgrade to a paid key for production access."
- Chain iteration: "Free tier deliberation chains are limited to 1 iteration. Paid keys support up to 3 iterations per chain."
- Include link to API docs and upgrade contact

---

## TASK 5: Define Paid Tier for AI Agents
**Status:** DONE (2026-03-29) — defaults documented; Stripe webhook pending
**Files affected:**
- `/api/api-keys-schema.sql` — document paid tier defaults
- `/website/src/lib/security.ts` — update comments
- Future: Stripe webhook endpoint to provision paid keys

**Paid tier parameters:**
| Parameter | Value |
|-----------|-------|
| monthly_limit | Configurable per key (start with 10,000) |
| daily_limit | Configurable per key (start with 500) |
| max_chain_iterations | 3 |
| pricing | 200% of Anthropic API cost per call |

**Pricing model (to implement with Stripe):**
- Per-call pricing at 200% of the Anthropic API cost for the model used (claude-sonnet-4-6)
- Monthly invoice based on actual usage tracked in api_key_usage table
- Pre-paid credit balance option for predictable costs
- The api_key_usage table already tracks per-endpoint breakdown (guardrail, score_iterate, agent_baseline, other) for granular billing

---

## TASK 6: Enforce Baseline Assessment Retake Limits
**Status:** DONE (2026-03-29)
**Files affected:**
- `/website/src/app/api/baseline/agent/route.ts` — add retake enforcement
- Database: need to track last baseline date per agent_id

**Rules:**
- 1 baseline assessment per agent_id
- 1 retake per agent_id per calendar month
- Track using existing `analytics_events` table (event_type: 'agent_baseline_assessment') or add a dedicated column to a new table
- On POST, check if this agent_id has already completed a baseline this month; if so, return 403 with next eligible date

**Implementation approach:**
- Query `analytics_events` for event_type = 'agent_baseline_assessment' where metadata->agent_id matches, ordered by created_at desc
- If the most recent assessment was this calendar month and there are already 2 records this month (initial + 1 retake), reject
- This aligns with human baseline retake policy (1 retake per month)

---

## TASK 7: Update Discovery Files
**Status:** DONE (2026-03-29)
**Files affected:**
- `/website/public/llms.txt` — update to reflect new tier structure, remove "no iteration limit" language, remove "open dataset" reference
- `/website/public/.well-known/agent-card.json` — update authentication section to reflect API key requirement, remove "MIT-licensed" from capability descriptions, update rate limits
- `/AGENTS.md` — update "Public Endpoints" table to clarify auth requirements, remove "MIT-licensed" reference, add tier information

**Key changes to communicate:**
- Free tier: 1 call/day, 1 deliberation iteration, 1 baseline retake/month
- Paid tier: production access at per-call pricing
- API key required for all scoring endpoints
- Full Stoic Brain data available only through API (not downloadable)

---

## TASK 8: Verify Consistency
**Status:** DONE (2026-03-29)

**Checklist:**
- [x] No file references "MIT" or "CC BY" licence for Stoic Brain data (only historical references in STATUS doc)
- [x] No file says "no iteration limit" or "unlimited" for free tier
- [x] Public JSON files contain no scoring weights, formulas, or virtue_relevance scores
- [x] Full JSON files exist in /stoic-brain/internal/ (gitignored)
- [x] score-iterate route enforces max_chain_iterations from the API key record
- [x] baseline/agent route enforces 1 retake per month per agent_id
- [x] llms.txt, agent-card.json, and AGENTS.md all reflect new tier structure
- [x] api-keys-schema.sql defaults match new free tier (monthly_limit=30, daily_limit=1, max_chain_iterations=1)
- [x] Existing API scoring functionality is unaffected (prompts contain weights inline)

---

## Implementation Order

1. **Licence change** (Task 1) — text file, no code risk
2. **Strip public JSON files** (Task 2) — data files, no runtime impact since scoring prompts are inline
3. **Preserve full files server-side** (Task 3) — create /internal/ copies, update .gitignore
4. **Update free tier defaults** (Task 4) — schema and security.ts
5. **Add iteration cap enforcement** (Task 4 continued) — score-iterate route
6. **Add baseline retake enforcement** (Task 6) — baseline/agent route
7. **Update discovery files** (Task 7) — llms.txt, agent-card.json, AGENTS.md
8. **Verify consistency** (Task 8) — full audit pass

---

## Dependencies

- **Stripe integration** (not yet built): Tasks 1-8 are pre-Stripe. Paid tier provisioning will need a Stripe webhook to create/upgrade API keys when payment is confirmed.
- **Database migration**: Task 4 requires updating DEFAULT values in api_keys table. Can be done via Supabase SQL Editor (ALTER TABLE).
- **Existing API keys**: Any keys already issued at the old free tier limits will need to be updated. Run an UPDATE statement to set new defaults on existing free-tier keys.

---

## Notes from Brainstorming Session (2026-03-29)

**Core insight:** The current free tier (667 calls/month, 50/day, 20 iterations) is far too generous. An agent developer can fully evaluate AND run light production workloads without paying. The new model gives enough to evaluate (1 call/day, 1 iteration) but not enough to build on.

**Pricing rationale:** 200% of Anthropic API cost gives 100% gross margin before hosting/infrastructure. This covers Vercel hosting, Supabase, monitoring, and gives headroom for prompt caching savings to flow to the bottom line. As volume grows, Anthropic volume pricing may widen this margin further.

**Deliberation chain logic:** 1 iteration (free) lets agents see "here's your score, here's how to improve" — that's the hook. 3 iterations (paid) covers most real-world improvement curves. The system already issues a Stoic advisory every 5th iteration encouraging decisive action.

**Baseline alignment:** 1 retake per month per agent_id, same rhythm as human users. Tied to agent_id (not API key) so a developer with multiple distinct agents can baseline each one.

**Public JSON files as marketing, API as product:** The stripped files explain what SageReasoning measures and why. The API provides the authoritative scores. The files are the brochure, the API is the product.

**Enterprise licence:** Full unredacted JSON + schema for organisations needing self-hosted Stoic reasoning. Separate product, premium pricing. Not implemented in this phase.
