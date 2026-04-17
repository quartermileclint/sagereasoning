# Hold Point Test Report

**Assessment 1: What works?**
Generated: 2026-04-17 22:57:18

---

## Summary

| Result | Count |
|--------|-------|
| PASS | 199 |
| FAIL | 0 |
| WARN | 11 |
| SKIP | 0 |
| **Total** | **210** |

### Warnings (WARN)

- **4. API Routes > /api/billing/checkout**: Placeholder (503 coming_soon). 166 LOC.
  - Fix: Implement this endpoint — required for P2 ethical safeguards
- **4. API Routes > /api/billing/portal**: Placeholder (503 coming_soon). 73 LOC.
  - Fix: Implement this endpoint — required for P2 ethical safeguards
- **4. API Routes > /api/billing/tidings**: Placeholder (503 coming_soon). 141 LOC.
  - Fix: Implement this endpoint — required for P2 ethical safeguards
- **4. API Routes > /api/mentor-profile**: Placeholder (503 coming_soon). 142 LOC.
  - Fix: Implement this endpoint — required for P2 ethical safeguards
- **4. API Routes > /api/webhooks/stripe**: Placeholder (503 coming_soon). 364 LOC.
  - Fix: Implement this endpoint — required for P2 ethical safeguards
- **9. Database > 20260417_r20a_classifier_cost_tracking.sql (RLS)**: No Row Level Security policies found
  - Fix: Add RLS for R17 compliance
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
| PASS | /api/analytics | 132 LOC. Exports handler. Uses Supabase. | — |
| PASS | /api/assessment/foundational | 319 LOC. Exports handler. Uses Anthropic. Uses Supabase. | — |
| PASS | /api/assessment/full | 463 LOC. Exports handler. Uses Anthropic. Uses Supabase. | — |
| PASS | /api/badge/[id] | 138 LOC. Exports handler. Uses Supabase. | — |
| PASS | /api/baseline/agent | 324 LOC. Exports handler. Uses Anthropic. Uses Supabase. | — |
| PASS | /api/baseline | 160 LOC. Exports handler. Uses Supabase. | — |
| WARN | /api/billing/checkout | Placeholder (503 coming_soon). 166 LOC. | Implement this endpoint — required for P2 ethical safeguards |
| WARN | /api/billing/portal | Placeholder (503 coming_soon). 73 LOC. | Implement this endpoint — required for P2 ethical safeguards |
| WARN | /api/billing/tidings | Placeholder (503 coming_soon). 141 LOC. | Implement this endpoint — required for P2 ethical safeguards |
| PASS | /api/billing/usage-summary | 186 LOC. Exports handler. Uses Supabase. 2 TODO(s). | — |
| PASS | /api/community-map | 30 LOC. Exports handler. Uses Supabase. | — |
| PASS | /api/compose | 231 LOC. Exports handler. | — |
| PASS | /api/deliberation-chain/[id]/conclude | 92 LOC. Exports handler. Uses Supabase. | — |
| PASS | /api/deliberation-chain/[id] | 134 LOC. Exports handler. Uses Supabase. | — |
| PASS | /api/evaluate | 245 LOC. Exports handler. Uses Anthropic. Uses Supabase. | — |
| PASS | /api/execute | 317 LOC. Exports handler. Uses Supabase. | — |
| PASS | /api/founder/hub | 1152 LOC. Exports handler. Uses Anthropic. Uses Supabase. | — |
| PASS | /api/guardrail | 355 LOC. Exports handler. Uses Anthropic. Uses Supabase. | — |
| PASS | /api/health | 60 LOC. Exports handler. | — |
| PASS | /api/journal | 158 LOC. Exports handler. Uses Supabase. | — |
| PASS | /api/keys | 203 LOC. Exports handler. Uses Supabase. | — |
| PASS | /api/marketplace/[id] | 92 LOC. Exports handler. | — |
| PASS | /api/marketplace | 87 LOC. Exports handler. | — |
| PASS | /api/mcp/tools | 117 LOC. Exports handler. | — |
| PASS | /api/mentor/founder/history | 99 LOC. Exports handler. Uses Supabase. | — |
| PASS | /api/mentor/gap4 | 463 LOC. Exports handler. Uses Supabase. | — |
| PASS | /api/mentor/journal-feed | 153 LOC. Exports handler. Uses Supabase. | — |
| PASS | /api/mentor/oikeiosis | 149 LOC. Exports handler. Uses Supabase. | — |
| PASS | /api/mentor/passion-classify | 158 LOC. Exports handler. Uses Anthropic. Uses Supabase. | — |
| PASS | /api/mentor/passion-log | 208 LOC. Exports handler. Uses Supabase. | — |
| PASS | /api/mentor/premeditatio | 256 LOC. Exports handler. Uses Anthropic. Uses Supabase. | — |
| PASS | /api/mentor/private/baseline | 132 LOC. Exports handler. Uses Anthropic. | — |
| PASS | /api/mentor/private/baseline-response | 213 LOC. Exports handler. Uses Anthropic. Uses Supabase. | — |
| PASS | /api/mentor/private/founder-facts | 119 LOC. Exports handler. | — |
| PASS | /api/mentor/private/history | 99 LOC. Exports handler. Uses Supabase. | — |
| PASS | /api/mentor/private/journal-week | 142 LOC. Exports handler. Uses Anthropic. | — |
| PASS | /api/mentor/private/reflect | 507 LOC. Exports handler. Uses Anthropic. Uses Supabase. | — |
| PASS | /api/mentor-baseline | 116 LOC. Exports handler. Uses Anthropic. | — |
| PASS | /api/mentor-baseline-response | 163 LOC. Exports handler. Uses Anthropic. | — |
| PASS | /api/mentor-journal-week | 133 LOC. Exports handler. Uses Anthropic. | — |
| WARN | /api/mentor-profile | Placeholder (503 coming_soon). 142 LOC. | Implement this endpoint — required for P2 ethical safeguards |
| PASS | /api/milestones | 121 LOC. Exports handler. Uses Supabase. | — |
| PASS | /api/patterns | 402 LOC. Exports handler. Uses Supabase. | — |
| PASS | /api/practice-calendar | 223 LOC. Exports handler. Uses Supabase. | — |
| PASS | /api/reason | 156 LOC. Exports handler. Uses Anthropic. | — |
| PASS | /api/receipts | 201 LOC. Exports handler. Uses Supabase. | — |
| PASS | /api/reflect | 285 LOC. Exports handler. Uses Anthropic. Uses Supabase. | — |
| PASS | /api/score | 202 LOC. Exports handler. Uses Anthropic. | — |
| PASS | /api/score-conversation | 187 LOC. Exports handler. Uses Anthropic. Uses Supabase. | — |
| PASS | /api/score-decision | 259 LOC. Exports handler. Uses Anthropic. Uses Supabase. | — |
| PASS | /api/score-document/[id] | 43 LOC. Exports handler. Uses Supabase. | — |
| PASS | /api/score-document | 328 LOC. Exports handler. Uses Anthropic. Uses Supabase. | — |
| PASS | /api/score-iterate | 729 LOC. Exports handler. Uses Anthropic. Uses Supabase. | — |
| PASS | /api/score-scenario | 395 LOC. Exports handler. Uses Anthropic. Uses Supabase. | — |
| PASS | /api/score-social | 202 LOC. Exports handler. Uses Anthropic. Uses Supabase. | — |
| PASS | /api/skill/sage-align | 31 LOC. Exports handler. | — |
| PASS | /api/skill/sage-classify | 239 LOC. Exports handler. Uses Anthropic. | — |
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
| PASS | /api/skill/sage-prioritise | 264 LOC. Exports handler. Uses Anthropic. | — |
| PASS | /api/skill/sage-resolve | 31 LOC. Exports handler. | — |
| PASS | /api/skill/sage-retro | 55 LOC. Exports handler. | — |
| PASS | /api/skills/[id] | 56 LOC. Exports handler. | — |
| PASS | /api/skills | 53 LOC. Exports handler. | — |
| PASS | /api/stoic-brain | 105 LOC. Exports handler. Uses Supabase. | — |
| PASS | /api/update-location | 47 LOC. Exports handler. Uses Supabase. | — |
| PASS | /api/usage | 133 LOC. Exports handler. Uses Supabase. | — |
| PASS | /api/user/delete | 118 LOC. Exports handler. Uses Supabase. | — |
| PASS | /api/user/export | 71 LOC. Exports handler. Uses Supabase. | — |
| WARN | /api/webhooks/stripe | Placeholder (503 coming_soon). 364 LOC. | Implement this endpoint — required for P2 ethical safeguards |
## 5. Product Pages

| Status | Component | Detail | Fix Action |
|--------|-----------|--------|------------|
| PASS | admin | 276 LOC. Functional UI. | — |
| PASS | auth | 278 LOC. Functional UI. | — |
| PASS | baseline | 466 LOC. Functional UI. | — |
| PASS | community | 443 LOC. Functional UI. | — |
| PASS | dashboard | 519 LOC. Functional UI. | — |
| PASS | founder-hub | 971 LOC. Functional UI. | — |
| PASS | journal | 605 LOC. Functional UI. | — |
| PASS | journal-feed | 402 LOC. Functional UI. | — |
| PASS | limitations | 162 LOC. Functional UI. | — |
| PASS | marketplace | 201 LOC. Functional UI. | — |
| PASS | mentor-hub | 1480 LOC. Functional UI. | — |
| PASS | mentor-index | 412 LOC. Functional UI. | — |
| PASS | methodology | 183 LOC. Functional UI. | — |
| PASS | oikeiosis | 501 LOC. Functional UI. | — |
| PASS | ops-hub | 1949 LOC. Functional UI. | — |
| PASS | Landing Page | 271 LOC. Functional UI. | — |
| PASS | passion-log | 744 LOC. Functional UI. | — |
| PASS | premeditatio | 431 LOC. Functional UI. | — |
| PASS | pricing | 462 LOC. Functional UI. | — |
| PASS | privacy | 286 LOC. Functional UI. | — |
| PASS | private-mentor | 1916 LOC. Functional UI. | — |
| PASS | scenarios | 500 LOC. Functional UI. | — |
| PASS | score/[id] | 225 LOC. Functional UI. | — |
| PASS | score | 606 LOC. Functional UI. | — |
| PASS | score-document | 386 LOC. Functional UI. | — |
| PASS | score-policy | 278 LOC. Functional UI. | — |
| PASS | score-social | 284 LOC. Functional UI. | — |
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
| PASS | Overall | 613 LOC. Core reasoning module intact. | — |
## 7. Sage Mentor

| Status | Component | Detail | Fix Action |
|--------|-----------|--------|------------|
| PASS | Module count | 21 TypeScript modules found | — |
| PASS | Total LOC | 14,491 lines across 21 modules | — |
| PASS | TODO count | 2 TODOs (acceptable) | — |
| PASS | Website integration | Found imports in website/src | — |
| PASS | ring-wrapper.ts | 912 LOC | — |
| PASS | profile-store.ts | 1160 LOC | — |
| PASS | support-agent.ts | 938 LOC | — |
| PASS | llm-bridge.ts | 647 LOC | — |
| PASS | session-bridge.ts | 1189 LOC | — |
## 8. Trust Layer

| Status | Component | Detail | Fix Action |
|--------|-----------|--------|------------|
| PASS | Module count | 13 TypeScript modules, 3,763 LOC total | — |
| PASS | Website integration | Found imports in website/src | — |
| PASS | card/accreditation-card.ts | Exists, 318 lines | — |
| PASS | schema/trust-layer-schema-REVIEW.sql | Exists, 327 lines | — |
## 9. Database

| Status | Component | Detail | Fix Action |
|--------|-----------|--------|------------|
| PASS | SQL migration count | 34 SQL files found | — |
| PASS | api-keys-schema.sql | 218 LOC. Creates tables. Alters tables. Has RLS policies. | — |
| PASS | deliberation-chain-schema.sql | 154 LOC. Creates tables. Alters tables. Has RLS policies. | — |
| PASS | add-journal-entries-table.sql | 47 LOC. Creates tables. Alters tables. Has RLS policies. | — |
| PASS | openbrain-memory-layer.sql | 138 LOC. Creates tables. Alters tables. Has RLS policies. | — |
| PASS | stripe-billing-schema.sql | 231 LOC. Creates tables. Alters tables. Has RLS policies. | — |
| PASS | support-agent-schema.sql | 92 LOC. Creates tables. Alters tables. Has RLS policies. | — |
| PASS | revenue-model-migration.sql | 63 LOC. Alters tables. | — |
| PASS | supabase-schema.sql | 218 LOC. Creates tables. Alters tables. Has RLS policies. | — |
| PASS | supabase-add-hub-id-migration.sql | 42 LOC. Alters tables. | — |
| PASS | supabase-baseline-migration.sql | 34 LOC. Creates tables. Alters tables. Has RLS policies. | — |
| PASS | supabase-document-scores-migration.sql | 35 LOC. Creates tables. Alters tables. Has RLS policies. | — |
| PASS | supabase-environmental-context-migration.sql | 55 LOC. Creates tables. Alters tables. Has RLS policies. | — |
| PASS | supabase-founder-conversations-migration.sql | 58 LOC. Creates tables. Alters tables. Has RLS policies. | — |
| PASS | supabase-location-migration.sql | 50 LOC. Alters tables. Has RLS policies. | — |
| PASS | supabase-mentor-gaps-migration.sql | 286 LOC. Creates tables. Alters tables. Has RLS policies. | — |
| PASS | supabase-mentor-profiles-migration.sql | 64 LOC. Creates tables. Alters tables. Has RLS policies. | — |
| PASS | supabase-milestones-migration.sql | 37 LOC. Creates tables. Alters tables. Has RLS policies. | — |
| PASS | supabase-project-context-migration.sql | 34 LOC. Creates tables. Alters tables. Has RLS policies. | — |
| PASS | supabase-receipts-patterns-migration.sql | 61 LOC. Creates tables. Alters tables. Has RLS policies. | — |
| PASS | supabase-reflections-migration.sql | 36 LOC. Creates tables. Alters tables. Has RLS policies. | — |
| PASS | supabase-v3-agent-assessment-migration.sql | 181 LOC. Creates tables. Alters tables. Has RLS policies. | — |
| PASS | supabase-v3-baseline-progress-migration.sql | 182 LOC. Creates tables. Alters tables. Has RLS policies. | — |
| PASS | supabase-v3-migration.sql | 267 LOC. Creates tables. Alters tables. Has RLS policies. | — |
| PASS | 20260404_session_bridge_tables.sql | 121 LOC. Creates tables. Alters tables. Has RLS policies. | — |
| PASS | 20260411_agent_handoffs.sql | 135 LOC. Creates tables. Alters tables. Has RLS policies. | — |
| PASS | 20260412_hub_isolation.sql | 348 LOC. Creates tables. Alters tables. Has RLS policies. | — |
| PASS | 20260413_logging_refactor_gap4.sql | 363 LOC. Creates tables. Alters tables. Has RLS policies. | — |
| PASS | 20260413_observation_tracking.sql | 35 LOC. Alters tables. | — |
| PASS | 20260414_snapshot_type_mentor_session.sql | 47 LOC. Alters tables. | — |
| PASS | 20260415_r17a_audit_schema.sql | 232 LOC. Creates tables. Alters tables. Has RLS policies. | — |
| PASS | 20260416_r20a_verification.sql | 194 LOC. | — |
| PASS | 20260416_r20a_vulnerability_flag.sql | 275 LOC. Creates tables. Alters tables. Has RLS policies. | — |
| PASS | 20260417_r20a_classifier_cost_tracking.sql | 110 LOC. Creates tables. Alters tables. | — |
| WARN | 20260417_r20a_classifier_cost_tracking.sql (RLS) | No Row Level Security policies found | Add RLS for R17 compliance |
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
| PASS | Decision log | 35 decisions logged | — |
| PASS | llms.txt | Exists, 292 lines | — |
| PASS | agent-card.json | Exists, 170 lines | — |
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
| PASS | Handoff notes | 38 handoff note(s) found | — |
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
