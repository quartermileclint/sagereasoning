# Hold Point Test Report

**Assessment 1: What works?**
Generated: 2026-04-07 07:23:14

---

## Summary

| Result | Count |
|--------|-------|
| PASS | 158 |
| FAIL | 0 |
| WARN | 5 |
| SKIP | 0 |
| **Total** | **163** |

### Warnings (WARN)

- **15. P0 Protocols > Handoff: Decisions Made**: Section missing from latest handoff
  - Fix: Add Decisions Made section
- **15. P0 Protocols > Handoff: Status Changes**: Section missing from latest handoff
  - Fix: Add Status Changes section
- **15. P0 Protocols > Handoff: Next Session Should**: Section missing from latest handoff
  - Fix: Add Next Session Should section
- **15. P0 Protocols > Handoff: Blocked On**: Section missing from latest handoff
  - Fix: Add Blocked On section
- **15. P0 Protocols > Handoff: Open Questions**: Section missing from latest handoff
  - Fix: Add Open Questions section

---

## 1. Core Files

| Status | Component | Detail | Fix Action |
|--------|-----------|--------|------------|
| PASS | Manifest (R0-R20) | Exists at /manifest.md | — |
| PASS | Project Index | Exists at /INDEX.md | — |
| PASS | Proprietary License | Exists at /LICENSE | — |
| PASS | Ecosystem Map v3 | Exists at /SageReasoning_Ecosystem_Map.html | — |
| PASS | Capability Inventory | Exists at /SageReasoning_Capability_Inventory.html | — |
| PASS | Decision Log | Exists at /operations/decision-log.md | — |
| PASS | Verification Framework | Exists at /operations/verification-framework.md | — |
## 2. Stoic Brain v3

| Status | Component | Detail | Fix Action |
|--------|-----------|--------|------------|
| PASS | virtue.json | Valid JSON, 218 lines, 4 top-level keys | — |
| PASS | action.json | Valid JSON, 157 lines, 5 top-level keys | — |
| PASS | scoring.json | Valid JSON, 149 lines, 4 top-level keys | — |
| PASS | progress.json | Valid JSON, 144 lines, 5 top-level keys | — |
| PASS | psychology.json | Valid JSON, 137 lines, 5 top-level keys | — |
| PASS | passions.json | Valid JSON, 148 lines, 5 top-level keys | — |
| PASS | value.json | Valid JSON, 144 lines, 6 top-level keys | — |
| PASS | stoic-brain.json | Valid JSON, 195 lines, 4 top-level keys | — |
## 3. TypeScript

| Status | Component | Detail | Fix Action |
|--------|-----------|--------|------------|
| PASS | Full type check | Zero type errors across entire codebase | — |
## 4. API Routes

| Status | Component | Detail | Fix Action |
|--------|-----------|--------|------------|
| PASS | /api/admin/api-keys | 247 LOC. Exports handler. Uses Supabase. | — |
| PASS | /api/admin/metrics | 111 LOC. Exports handler. Uses Supabase. | — |
| PASS | /api/analytics | 50 LOC. Exports handler. Uses Supabase. | — |
| PASS | /api/assessment/foundational | 312 LOC. Exports handler. Uses Anthropic. Uses Supabase. | — |
| PASS | /api/assessment/full | 447 LOC. Exports handler. Uses Anthropic. Uses Supabase. | — |
| PASS | /api/badge/[id] | 138 LOC. Exports handler. Uses Supabase. | — |
| PASS | /api/baseline/agent | 317 LOC. Exports handler. Uses Anthropic. Uses Supabase. | — |
| PASS | /api/baseline | 160 LOC. Exports handler. Uses Supabase. | — |
| PASS | /api/community-map | 30 LOC. Exports handler. Uses Supabase. | — |
| PASS | /api/compose | 237 LOC. Exports handler. | — |
| PASS | /api/deliberation-chain/[id]/conclude | 92 LOC. Exports handler. Uses Supabase. | — |
| PASS | /api/deliberation-chain/[id] | 135 LOC. Exports handler. Uses Supabase. | — |
| PASS | /api/evaluate | 189 LOC. Exports handler. Uses Anthropic. | — |
| PASS | /api/execute | 284 LOC. Exports handler. | — |
| PASS | /api/guardrail | 220 LOC. Exports handler. Uses Anthropic. Uses Supabase. | — |
| PASS | /api/journal | 158 LOC. Exports handler. Uses Supabase. | — |
| PASS | /api/keys | 203 LOC. Exports handler. Uses Supabase. | — |
| PASS | /api/marketplace/[id] | 92 LOC. Exports handler. | — |
| PASS | /api/marketplace | 87 LOC. Exports handler. | — |
| PASS | /api/mcp/tools | 117 LOC. Exports handler. | — |
| PASS | /api/milestones | 121 LOC. Exports handler. Uses Supabase. | — |
| PASS | /api/patterns | 324 LOC. Exports handler. Uses Supabase. | — |
| PASS | /api/practice-calendar | 223 LOC. Exports handler. Uses Supabase. | — |
| PASS | /api/reason | 90 LOC. Exports handler. Uses Anthropic. | — |
| PASS | /api/receipts | 202 LOC. Exports handler. Uses Supabase. | — |
| PASS | /api/reflect | 207 LOC. Exports handler. Uses Anthropic. Uses Supabase. | — |
| PASS | /api/score | 105 LOC. Exports handler. Uses Anthropic. | — |
| PASS | /api/score-conversation | 150 LOC. Exports handler. Uses Anthropic. Uses Supabase. | — |
| PASS | /api/score-decision | 193 LOC. Exports handler. Uses Anthropic. Uses Supabase. | — |
| PASS | /api/score-document/[id] | 43 LOC. Exports handler. Uses Supabase. | — |
| PASS | /api/score-document | 250 LOC. Exports handler. Uses Anthropic. Uses Supabase. | — |
| PASS | /api/score-iterate | 651 LOC. Exports handler. Uses Anthropic. Uses Supabase. | — |
| PASS | /api/score-scenario | 309 LOC. Exports handler. Uses Anthropic. Uses Supabase. | — |
| PASS | /api/score-social | 174 LOC. Exports handler. Uses Anthropic. Uses Supabase. | — |
| PASS | /api/skill/sage-align | 31 LOC. Exports handler. | — |
| PASS | /api/skill/sage-classify | 220 LOC. Exports handler. Uses Anthropic. | — |
| PASS | /api/skill/sage-coach | 31 LOC. Exports handler. | — |
| PASS | /api/skill/sage-compliance | 35 LOC. Exports handler. | — |
| PASS | /api/skill/sage-educate | 35 LOC. Exports handler. | — |
| PASS | /api/skill/sage-govern | 31 LOC. Exports handler. | — |
| PASS | /api/skill/sage-identity | 31 LOC. Exports handler. | — |
| PASS | /api/skill/sage-invest | 31 LOC. Exports handler. | — |
| PASS | /api/skill/sage-moderate | 31 LOC. Exports handler. | — |
| PASS | /api/skill/sage-negotiate | 31 LOC. Exports handler. | — |
| PASS | /api/skill/sage-pivot | 34 LOC. Exports handler. | — |
| PASS | /api/skill/sage-premortem | 31 LOC. Exports handler. | — |
| PASS | /api/skill/sage-prioritise | 245 LOC. Exports handler. Uses Anthropic. | — |
| PASS | /api/skill/sage-resolve | 31 LOC. Exports handler. | — |
| PASS | /api/skill/sage-retro | 31 LOC. Exports handler. | — |
| PASS | /api/skills/[id] | 56 LOC. Exports handler. | — |
| PASS | /api/skills | 53 LOC. Exports handler. | — |
| PASS | /api/stoic-brain | 101 LOC. Exports handler. Uses Supabase. | — |
| PASS | /api/update-location | 47 LOC. Exports handler. Uses Supabase. | — |
| PASS | /api/usage | 133 LOC. Exports handler. Uses Supabase. | — |
| PASS | /api/user/delete | 118 LOC. Exports handler. Uses Supabase. | — |
| PASS | /api/user/export | 71 LOC. Exports handler. Uses Supabase. | — |
## 5. Product Pages

| Status | Component | Detail | Fix Action |
|--------|-----------|--------|------------|
| PASS | admin | 276 LOC. Functional UI. | — |
| PASS | auth | 236 LOC. Functional UI. | — |
| PASS | baseline | 466 LOC. Functional UI. | — |
| PASS | community | 443 LOC. Functional UI. | — |
| PASS | dashboard | 519 LOC. Functional UI. | — |
| PASS | journal | 613 LOC. Functional UI. | — |
| PASS | limitations | 162 LOC. Functional UI. | — |
| PASS | marketplace | 201 LOC. Functional UI. | — |
| PASS | mentor-hub | 1481 LOC. Functional UI. | — |
| PASS | methodology | 183 LOC. Functional UI. | — |
| PASS | ops-hub | 1949 LOC. Functional UI. | — |
| PASS | Landing Page | 271 LOC. Functional UI. | — |
| PASS | pricing | 313 LOC. Functional UI. | — |
| PASS | privacy | 286 LOC. Functional UI. | — |
| PASS | private-mentor | 1776 LOC. Functional UI. | — |
| PASS | scenarios | 468 LOC. Functional UI. | — |
| PASS | score/[id] | 225 LOC. Functional UI. | — |
| PASS | score | 564 LOC. Functional UI. | — |
| PASS | score-document | 357 LOC. Functional UI. | — |
| PASS | score-policy | 279 LOC. Functional UI. | — |
| PASS | score-social | 256 LOC. Functional UI. | — |
| PASS | terms | 287 LOC. Functional UI. | — |
| PASS | transparency | 183 LOC. Functional UI. | — |
## 6. Core Engine

| Status | Component | Detail | Fix Action |
|--------|-----------|--------|------------|
| PASS | runSageReason export | Core function exported | — |
| PASS | Anthropic client singleton | Singleton pattern present | — |
| PASS | Depth configurations | All 3 depth levels configured | — |
| PASS | System prompts | 6 system prompt(s) found | — |
| PASS | Receipt generation | Receipt generation present | — |
| PASS | Overall | 396 LOC. Core reasoning module intact. | — |
## 7. Sage Mentor

| Status | Component | Detail | Fix Action |
|--------|-----------|--------|------------|
| PASS | Module count | 21 TypeScript modules found | — |
| PASS | Total LOC | 14,180 lines across 21 modules | — |
| PASS | TODO count | 2 TODOs (acceptable) | — |
| PASS | Website integration | Found imports in website/src | — |
| PASS | ring-wrapper.ts | 827 LOC | — |
| PASS | profile-store.ts | 1006 LOC | — |
| PASS | support-agent.ts | 947 LOC | — |
| PASS | llm-bridge.ts | 645 LOC | — |
| PASS | session-bridge.ts | 1094 LOC | — |
## 8. Trust Layer

| Status | Component | Detail | Fix Action |
|--------|-----------|--------|------------|
| PASS | Module count | 13 TypeScript modules, 3,787 LOC total | — |
| PASS | Website integration | Found imports in website/src | — |
| PASS | card/accreditation-card.ts | Exists, 319 lines | — |
| PASS | schema/trust-layer-schema-REVIEW.sql | Exists, 327 lines | — |
## 9. Database

| Status | Component | Detail | Fix Action |
|--------|-----------|--------|------------|
| PASS | SQL migration count | 18 SQL files found | — |
| PASS | api-keys-schema.sql | 218 LOC. Creates tables. Alters tables. Has RLS policies. | — |
| PASS | deliberation-chain-schema.sql | 154 LOC. Creates tables. Alters tables. Has RLS policies. | — |
| PASS | add-journal-entries-table.sql | 47 LOC. Creates tables. Alters tables. Has RLS policies. | — |
| PASS | openbrain-memory-layer.sql | 138 LOC. Creates tables. Alters tables. Has RLS policies. | — |
| PASS | support-agent-schema.sql | 92 LOC. Creates tables. Alters tables. Has RLS policies. | — |
| PASS | revenue-model-migration.sql | 63 LOC. Alters tables. | — |
| PASS | supabase-schema.sql | 218 LOC. Creates tables. Alters tables. Has RLS policies. | — |
| PASS | supabase-baseline-migration.sql | 34 LOC. Creates tables. Alters tables. Has RLS policies. | — |
| PASS | supabase-document-scores-migration.sql | 35 LOC. Creates tables. Alters tables. Has RLS policies. | — |
| PASS | supabase-location-migration.sql | 50 LOC. Alters tables. Has RLS policies. | — |
| PASS | supabase-milestones-migration.sql | 37 LOC. Creates tables. Alters tables. Has RLS policies. | — |
| PASS | supabase-receipts-patterns-migration.sql | 61 LOC. Creates tables. Alters tables. Has RLS policies. | — |
| PASS | supabase-reflections-migration.sql | 36 LOC. Creates tables. Alters tables. Has RLS policies. | — |
| PASS | supabase-v3-agent-assessment-migration.sql | 181 LOC. Creates tables. Alters tables. Has RLS policies. | — |
| PASS | supabase-v3-baseline-progress-migration.sql | 182 LOC. Creates tables. Alters tables. Has RLS policies. | — |
| PASS | supabase-v3-migration.sql | 267 LOC. Creates tables. Alters tables. Has RLS policies. | — |
| PASS | 20260404_session_bridge_tables.sql | 121 LOC. Creates tables. Alters tables. Has RLS policies. | — |
| PASS | trust-layer-schema-REVIEW.sql | 327 LOC. Creates tables. Alters tables. Has RLS policies. | — |
## 10. Environment

| Status | Component | Detail | Fix Action |
|--------|-----------|--------|------------|
| PASS | NEXT_PUBLIC_SUPABASE_URL | Set | — |
| PASS | NEXT_PUBLIC_SUPABASE_ANON_KEY | Set | — |
| PASS | SUPABASE_SERVICE_ROLE_KEY | Set | — |
| PASS | ANTHROPIC_API_KEY | Set | — |
| PASS | NEXT_PUBLIC_SITE_URL | Set | — |
## 11. Wrapped Skills

| Status | Component | Detail | Fix Action |
|--------|-----------|--------|------------|
| PASS | Skill count | 15 wrapped skills found | — |
| PASS | Factory pattern | 13 use factory, 2 custom implementations | — |
## 12. Governance

| Status | Component | Detail | Fix Action |
|--------|-----------|--------|------------|
| PASS | Manifest rules | 21 rules found | — |
| PASS | Compliance register | 24 obligations tracked | — |
| PASS | Decision log | 12 decisions logged | — |
| PASS | llms.txt | Exists, 226 lines | — |
| PASS | agent-card.json | Exists, 158 lines | — |
| PASS | robots.txt | Exists, 69 lines | — |
| PASS | OpenAPI spec | 1312 lines. Comprehensive. | — |
## 13. Security

| Status | Component | Detail | Fix Action |
|--------|-----------|--------|------------|
| PASS | Anthropic API key in source | No hardcoded secrets found in source | — |
| PASS | JWT token in source (non-env) | No hardcoded secrets found in source | — |
| PASS | .gitignore: .env | Excluded from git | — |
| PASS | .gitignore: .env.local | Excluded from git | — |
| PASS | .gitignore: node_modules | Excluded from git | — |
| PASS | .gitignore: .next | Excluded from git | — |
| PASS | Encryption module | AES-GCM: yes, PBKDF2: yes | — |
## 14. Ethical (P2)

| Status | Component | Detail | Fix Action |
|--------|-----------|--------|------------|
| PASS | R20a: Distress detection | Distress detection patterns found in guardrails | — |
| PASS | R19c: Limitations page | Page exists | — |
| PASS | R19d: Mirror principle | Mirror principle references found | — |
## 15. P0 Protocols

| Status | Component | Detail | Fix Action |
|--------|-----------|--------|------------|
| PASS | Handoff notes | 5 handoff note(s) found | — |
| WARN | Handoff: Decisions Made | Section missing from latest handoff | Add Decisions Made section |
| WARN | Handoff: Status Changes | Section missing from latest handoff | Add Status Changes section |
| WARN | Handoff: Next Session Should | Section missing from latest handoff | Add Next Session Should section |
| WARN | Handoff: Blocked On | Section missing from latest handoff | Add Blocked On section |
| WARN | Handoff: Open Questions | Section missing from latest handoff | Add Open Questions section |

---

## How to Use This Report

1. Review the Critical Issues (FAIL) section first — these block progress.
2. Review Warnings (WARN) — these are gaps but may not block.
3. To approve a fix: tell your AI collaborator which fix to apply.
4. After fixes, re-run: `node operations/holdpoint-test-harness.mjs --clear --run`
5. Repeat until the report is clean enough for real data testing.

**Note:** This harness tests structure, compilation, and configuration.
Real data testing (Assessment 1 live tests) requires a running dev server
and an Anthropic API key. Those tests happen in the next phase.
