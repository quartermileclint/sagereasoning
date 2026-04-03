# SageReasoning Price Deployment Checklist

**Competitor-Anchored Pricing Rollout**
April 2026

This checklist documents every file that needs updating to deploy the new competitor-anchored pricing. Changes flow from one source of truth (skill-registry.ts) outward to all surfaces.

---

## Pricing Rule Summary

| Category | Benchmark | Competitor Price | Our New Price | Old Price |
|----------|-----------|-----------------|---------------|-----------|
| LLM Guardrail | Guardrails AI | $0.005/call | **$0.0025/call** | $0.001 |
| Data Enrichment | Clearbit | $0.36/lookup | **$0.18/call** | $0.025–$0.066 |
| Personality Assessment | Crystal Knows (est.) | ~$1.00/profile | **$0.50/profile** | $0.033 |

---

## Step 1: Source of Truth (DO FIRST)

### 1.1 Update skill-registry.ts
- **File:** `website/src/lib/skill-registry.ts`
- **What:** Update the `cost_speed` property on all 29 skill entries
- **Changes needed:**

| Skill | Old cost_speed | New cost_speed |
|-------|---------------|----------------|
| sage-reason-quick | `~$0.025, ~2s` | `~$0.18, ~2s` |
| sage-reason-standard | `~$0.041, ~3s` | `~$0.18, ~3s` |
| sage-reason-deep | `~$0.055, ~4s` | `~$0.18, ~4s` |
| sage-score | `~$0.033, ~2s` | `~$0.18, ~2s` |
| sage-guard | `~$0.001, <100ms` | `~$0.0025, <100ms` |
| sage-iterate | `~$0.033 per iteration, ~2s` | `~$0.18 per iteration, ~2s` |
| sage-decide | `~$0.033, ~2s` | `~$0.18, ~2s` |
| sage-audit | `~$0.033, ~3s` | `~$0.18, ~3s` |
| sage-converse | `~$0.033, ~3s` | `~$0.18, ~3s` |
| sage-scenario | `~$0.066, ~4s` | `~$0.18, ~4s` |
| sage-reflect | `~$0.033, ~2s` | `~$0.18, ~2s` |
| sage-diagnose | `~$0.033, ~3s` | `~$0.50, ~3s` |
| sage-profile | `~$0.025, ~2s` | `~$0.50, ~2s` |
| sage-classify | `~$0.041, ~3s` | `~$0.18, ~3s` |
| sage-negotiate | `~$0.041, ~3s` | `~$0.18, ~3s` |
| sage-align | `~$0.041, ~3s` | `~$0.18, ~3s` |
| sage-resolve | `~$0.041, ~3s` | `~$0.18, ~3s` |
| sage-invest | `~$0.041, ~3s` | `~$0.18, ~3s` |
| sage-prioritise | `~$0.041, ~3s` | `~$0.18, ~3s` |
| sage-retro | `~$0.025, ~2s` | `~$0.18, ~2s` |
| sage-premortem | `~$0.041, ~3s` | `~$0.18, ~3s` |
| sage-pivot | `~$0.055, ~4s` | `~$0.18, ~4s` |
| sage-educate | `~$0.041, ~3s` | `~$0.18, ~3s` |
| sage-moderate | `~$0.055, ~4s` | `~$0.18, ~4s` |
| sage-coach | `~$0.041, ~3s` | `~$0.18, ~3s` |
| sage-comply | `~$0.025, ~2s` | `~$0.18, ~2s` |
| sage-govern | `~$0.041, ~3s` | `~$0.18, ~3s` |
| sage-identity | `~$0.055, ~4s` | `~$0.18, ~4s` |
| sage-context | `Free, <50ms` | `Free, <50ms` (no change) |

**Note:** The `/api/skills` and `/api/skills/{id}` endpoints read directly from skill-registry.ts, so updating this file automatically updates the API responses.

---

## Step 2: User-Facing Pages

### 2.1 Pricing Page
- **File:** `website/src/app/pricing/page.tsx`
- **Line ~72:** Change `"paid tier for production at 200% of Anthropic API cost"` to `"paid tier for production — per-call pricing from $0.0025 (cheapest in market)"`
- **Line ~69:** Update API Access description to reference competitor-anchored pricing
- **Lines 74–76:** Update any specific price examples

### 2.2 API Documentation Page
- **File:** `website/src/app/api-docs/page.tsx`
- **Line ~14:** Update Schema.org pricing metadata
- **Line ~360:** Update pricing table row from "200% of Anthropic API cost per call" to "Per-call pricing from $0.0025 — half the lowest competitor"
- **Lines 343–360:** Update free/paid tier comparison table if prices are mentioned

### 2.3 Marketplace Page
- **File:** `website/src/app/marketplace/page.tsx`
- **Lines 114, 119, 124:** Update hardcoded tier price examples (these display cost_speed from registry, but verify no hardcoded values)

---

## Step 3: Agent-Facing Discovery Surfaces

### 3.1 OpenAPI Specification
- **File:** `website/public/openapi.yaml`
- **Lines 48, 136, 193, 230, 268, 305, 340, 376:** Update Cost + Speed values in endpoint descriptions
- Each endpoint description contains a line like `Cost + Speed: ~$0.033, ~2s` — update all to match new prices

### 3.2 AGENTS.md
- **File:** `AGENTS.md`
- **Lines 64–66:** Update sage-reason tier costs (quick: ~$0.18, standard: ~$0.18, deep: ~$0.18)
- **Lines 72–83:** Update all Tier 2 skill cost_speed values
- **Lines 129–131:** Verify free tier (100 calls/month — already correct)
- **Lines 136–142:** Update wrapper cost breakdown

### 3.3 MCP Contracts
- **File:** `website/src/lib/mcp-contracts.ts`
- **Line ~103:** Update depth parameter description: `"quick: 3 mechanisms (~$0.18, ~2s). standard: 5 mechanisms (~$0.18, ~3s). deep: 6 mechanisms (~$0.18, ~4s)."`

### 3.4 Agent Card
- **File:** `website/public/.well-known/agent-card.json`
- **Lines 99–107:** Update paid tier description if specific prices are mentioned
- Change any "200% of Anthropic API cost" references

### 3.5 LLMs.txt
- **File:** `website/public/llms.txt`
- Update any pricing references (lines ~40, 54, 58, 77, 105, 157, 183, 194–199)

---

## Step 4: Internal Implementation

### 4.1 Response Envelope (Cost Estimation)
- **File:** `website/src/lib/response-envelope.ts`
- **Lines 74, 79:** Change "200% of estimated Anthropic API cost" to "competitor-anchored pricing (see skill-registry.ts)"
- **Lines 76–88:** Update cost estimation comments with new customer-facing prices
- **Lines 90–96:** The `estimateCostUsd()` function may need updating if it calculates customer price from LLM cost using 2× multiplier. It should now return the actual customer price from skill-registry.ts instead.

### 4.2 Security / Rate Limits
- **File:** `website/src/lib/security.ts`
- **Line ~244:** Change "PAID TIER (production access — 200% of Anthropic API cost per call):" to "PAID TIER (production access — competitor-anchored per-call pricing):"

### 4.3 Assessment Endpoints
- **File:** `website/src/app/api/assessment/foundational/route.ts` (line ~250)
- **File:** `website/src/app/api/assessment/full/route.ts` (line ~76)
- Update response metadata strings from "200% of Anthropic API cost per call" to "competitor-anchored per-call pricing"

---

## Step 5: Developer Documentation

### 5.1 Wrapper Template
- **File:** `website/public/wrappers/WRAPPER-TEMPLATE.md`
- **Lines 28–30:** Update cost breakdown table:
  - sage-guard: ~$0.001 → ~$0.0025
  - sage-score: ~$0.025–0.055 → ~$0.18
  - sage-iterate: ~$0.035 → ~$0.18
- **Line 32:** Update: "Free tier (100 calls/month) supports ~33–50 wrapped skill invocations" — recalculate based on new prices (free tier is call-count-based, not cost-based, so this may not change)

### 5.2 Marketplace API Endpoint
- **File:** `website/src/app/api/marketplace/route.ts`
- **Line ~63:** Verify `pricing_note` is still accurate

---

## Step 6: Messaging Changes

**Every instance of "200% of Anthropic API cost" must be replaced.** The new messaging options:

| Context | Old Text | New Text |
|---------|---------|----------|
| User-facing | "200% of Anthropic API cost" | "Per-call pricing from $0.0025 — half the cheapest competitor" |
| Agent-facing | "200% of Anthropic API cost per call" | "Competitor-anchored per-call pricing ($0.0025–$0.50)" |
| Internal/comments | "Uses 200% markup" | "Customer price from skill-registry.ts (competitor-anchored)" |
| Legal/ToS | N/A | No change needed (ToS references "usage-based pricing" generically) |

**Files with "200%" references to update:**
1. `src/app/pricing/page.tsx` (line ~72)
2. `src/app/api-docs/page.tsx` (lines ~14, ~360)
3. `src/lib/response-envelope.ts` (lines ~74, ~79)
4. `src/lib/security.ts` (line ~244)
5. `src/app/api/assessment/foundational/route.ts` (line ~250)
6. `src/app/api/assessment/full/route.ts` (line ~76)

---

## Step 7: Verification

After all changes are deployed:

1. **Run TypeScript compilation:** `npm run build` — must produce 0 errors
2. **Check /api/skills endpoint:** Verify all cost_speed values reflect new prices
3. **Check /api/marketplace endpoint:** Verify pricing_note is accurate
4. **Visual check:** Load pricing page, api-docs page, marketplace page in browser
5. **Agent discovery check:** Fetch `/.well-known/agent-card.json`, `openapi.yaml`, `llms.txt` and verify no old prices remain
6. **Grep for old prices:** Search entire codebase for `$0.025`, `$0.033`, `$0.041`, `$0.055`, `$0.066`, `$0.001` (non-LLM-cost contexts) and `200%` to catch any missed references

---

## Order of Operations

1. Update `skill-registry.ts` (source of truth)
2. Update `response-envelope.ts` (cost estimation logic)
3. Update user-facing pages (pricing, api-docs, marketplace)
4. Update agent-facing surfaces (openapi.yaml, AGENTS.md, mcp-contracts.ts, agent-card.json, llms.txt)
5. Update developer docs (wrapper template)
6. Replace all "200%" messaging
7. Run verification checks
8. Deploy

**Estimated effort:** 1 engineering day for all file changes + verification.
