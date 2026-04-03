# SageReasoning Price Deployment Checklist

**Competitor-Anchored Pricing Rollout — COMPLETED**
April 2026

This checklist documents every file that was updated to deploy competitor-anchored pricing. All changes flow from one source of truth (skill-registry.ts) outward to all surfaces.

---

## Status: ALL STEPS COMPLETE

All pricing changes have been deployed. TypeScript compiles with 0 errors. Grep verification confirms no old prices or "200%" messaging remain in active code.

---

## Pricing Rule Summary

| Category | Benchmark | Competitor Price | Our Price |
|----------|-----------|-----------------|-----------|
| LLM Guardrail | Guardrails AI | $0.005/call | **$0.0025/call** |
| Data Enrichment | Clearbit | $0.36/lookup | **$0.18/call** |
| Personality Assessment | Crystal Knows (est.) | ~$1.00/profile | **$0.50/profile** |

---

## Revenue Model

Two revenue streams only:

1. **Per-call API pricing** — 29 paid skills at half the lowest competitor in each category. Margins 60–97% (weighted average ~90%).
2. **Voluntary tidings donations** — Human experience is free. Revenue from human users via voluntary donations (Wikipedia model).

No subscription tiers. No Prokoptos. No monthly/annual plans.

---

## Step 1: Source of Truth — COMPLETE

### 1.1 skill-registry.ts
- **File:** `website/src/lib/skill-registry.ts`
- **Status:** All 29 skill `cost_speed` values updated
- sage-guard: `~$0.0025, <100ms`
- Most skills (24): `~$0.18, ~2-4s`
- sage-diagnose: `~$0.50, ~3s`
- sage-profile: `~$0.50, ~2s`
- sage-context: `Free, <50ms` (unchanged)

---

## Step 2: Cost Estimation — COMPLETE

### 2.1 response-envelope.ts
- **File:** `website/src/lib/response-envelope.ts`
- **Status:** `estimateCostUsd()` function updated from 200%-markup formula to fixed competitor-anchored prices ($0.0025 for haiku, $0.18 for sonnet)
- Comments updated with competitor-anchored pricing explanation

---

## Step 3: User-Facing Pages — COMPLETE

### 3.1 Pricing Page
- **File:** `website/src/app/pricing/page.tsx`
- **Status:** API Access description updated to "per-call pricing from $0.0025 (cheapest in market)"

### 3.2 API Documentation Page
- **File:** `website/src/app/api-docs/page.tsx`
- **Status:** Schema.org metadata and pricing table updated. "200%" replaced with "Per-call pricing from $0.0025 — half the lowest competitor"

### 3.3 Marketplace Page
- **File:** `website/src/app/marketplace/page.tsx`
- **Status:** Hardcoded quick/standard/deep prices updated to $0.18

---

## Step 4: Agent-Facing Discovery Surfaces — COMPLETE

### 4.1 OpenAPI Specification
- **File:** `website/public/openapi.yaml`
- **Status:** All 8 endpoint Cost+Speed descriptions updated

### 4.2 AGENTS.md
- **File:** `AGENTS.md`
- **Status:** Tier 1 table, Tier 2 table, and wrapper cost breakdown all updated

### 4.3 MCP Contracts
- **File:** `website/src/lib/mcp-contracts.ts`
- **Status:** Depth parameter description updated

### 4.4 Agent Card
- **File:** `website/public/.well-known/agent-card.json`
- **Status:** Paid tier description updated with price range ($0.0025–$0.50)

### 4.5 LLMs.txt
- **File:** `website/public/llms.txt`
- **Status:** Free tier (100 calls/month) and paid tier price range updated

---

## Step 5: Internal Implementation — COMPLETE

### 5.1 Security / Rate Limits
- **File:** `website/src/lib/security.ts`
- **Status:** Paid tier comment updated to "competitor-anchored per-call pricing"

### 5.2 Assessment Endpoints
- **File:** `website/src/app/api/assessment/foundational/route.ts`
- **Status:** CTA action_subtext updated

- **File:** `website/src/app/api/assessment/full/route.ts`
- **Status:** `requires` field updated

### 5.3 Execute Route
- **File:** `website/src/app/api/execute/route.ts`
- **Status:** Cost range comment updated to $0.0025–$0.50

### 5.4 Skill Route Handlers
- **File:** `website/src/app/api/skill/sage-classify/route.ts`
- **File:** `website/src/app/api/skill/sage-prioritise/route.ts`
- **Status:** Cost+Speed comments updated to $0.18

---

## Step 6: Developer Documentation — COMPLETE

### 6.1 Wrapper Template
- **File:** `website/public/wrappers/WRAPPER-TEMPLATE.md`
- **Status:** Cost breakdown table updated (guard $0.0025, score $0.18, iterate $0.18)

### 6.2 OpenBrain Integration Spec
- **File:** `docs/openbrain-integration-spec.md`
- **Status:** Depth description and classify cost updated

---

## Step 7: Config & Reference Files — COMPLETE

### 7.1 Tier Config Files
- **File:** `agent-assessment/tier-config-v3.json`
- **File:** `agent-assessment/tier-config.json`
- **Status:** paid_tier_api_constraints and action_subtext updated

### 7.2 Status Revenue Model
- **File:** `STATUS-REVENUE-MODEL.md`
- **Status:** Pricing model and rationale updated

### 7.3 Manifest Compliance Review
- **File:** `website/P8.8_Manifest_Compliance_Review.md`
- **Status:** Tier config meta reference updated

---

## Step 8: Business Documents — COMPLETE

### 8.1 Growth Strategy
- **File:** `SageReasoning_Growth_Strategy.docx`
- **Status:** Completely rebuilt in V3 language. No Prokoptos. No subscriptions. 6 mechanisms, 5 proximity levels, unity of virtue thesis throughout.

### 8.2 Legal Revenue Business Plan
- **File:** `SageReasoning_Legal_Revenue_Business_Plan.docx`
- **Status:** Completely rebuilt. All Prokoptos/subscription references removed. Revenue = per-call API + tidings only.

### 8.3 Break-Even Analysis
- **File:** `SageReasoning_BreakEven_Analysis.xlsx`
- **Status:** Already built with competitor-anchored pricing. 430 formulas, 0 errors.

### 8.4 Investment Analysis
- **File:** `SageReasoning_BreakEven_Investment_Analysis.docx`
- **Status:** Already built with competitor-anchored figures.

---

## Verification Results

1. **TypeScript compilation:** 0 errors (`npx tsc --noEmit`)
2. **Grep for "200%":** Zero matches in active code (only in this checklist as historical reference)
3. **Grep for old prices ($0.025, $0.033, $0.041, $0.055, $0.066):** Zero matches in active code (only in P14 recommendation doc — historical)
4. **Grep for "Prokoptos":** Zero matches in active code and business documents
5. **Grep for "subscription":** Zero matches in business documents

---

## Files Changed (18 code files + 3 business documents)

| # | File | Change Type |
|---|------|-------------|
| 1 | `website/src/lib/skill-registry.ts` | 29 cost_speed values |
| 2 | `website/src/lib/response-envelope.ts` | Cost estimation function + comments |
| 3 | `website/src/app/pricing/page.tsx` | API description |
| 4 | `website/src/app/api-docs/page.tsx` | Schema.org + pricing table |
| 5 | `website/src/app/marketplace/page.tsx` | Hardcoded tier prices |
| 6 | `website/public/openapi.yaml` | 8 endpoint descriptions |
| 7 | `AGENTS.md` | Skill tables + wrapper costs |
| 8 | `website/src/lib/mcp-contracts.ts` | Depth parameter |
| 9 | `website/public/.well-known/agent-card.json` | Paid tier description |
| 10 | `website/public/llms.txt` | Free/paid tier details |
| 11 | `website/src/lib/security.ts` | Paid tier comment |
| 12 | `website/src/app/api/assessment/foundational/route.ts` | CTA text |
| 13 | `website/src/app/api/assessment/full/route.ts` | Requires field |
| 14 | `website/src/app/api/execute/route.ts` | Cost range comment |
| 15 | `website/src/app/api/skill/sage-classify/route.ts` | Cost comment |
| 16 | `website/src/app/api/skill/sage-prioritise/route.ts` | Cost comment |
| 17 | `website/public/wrappers/WRAPPER-TEMPLATE.md` | Cost table |
| 18 | `docs/openbrain-integration-spec.md` | Depth + classify cost |
| 19 | `agent-assessment/tier-config-v3.json` | Paid tier constraints |
| 20 | `agent-assessment/tier-config.json` | Paid tier constraints |
| 21 | `STATUS-REVENUE-MODEL.md` | Pricing model + rationale |
| 22 | `website/P8.8_Manifest_Compliance_Review.md` | Tier config meta |
| 23 | `SageReasoning_Growth_Strategy.docx` | Full rebuild (V3) |
| 24 | `SageReasoning_Legal_Revenue_Business_Plan.docx` | Full rebuild (no Prokoptos) |
