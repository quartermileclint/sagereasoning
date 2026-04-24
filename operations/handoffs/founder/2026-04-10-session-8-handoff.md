# Session Close — 10 April 2026 (Session 8)

## Decisions Made

- **Product endpoints = Stoic Brain + Practitioner Context only**: All human-facing and agent-facing product endpoints must contain zero internal operational context (no agent brains, no project context, no environmental context). This is now an architectural principle, not just a cleanup task. Reasoning: the entire startup package (brains, context layers, session protocols) is intended to become a reusable product for other founders/teams. Product endpoints must be portable — they serve any customer's content through universal Stoic principles, not through SageReasoning's internal knowledge.

- **Internal-only endpoints keep their brains**: The 4 mentor/reflect endpoints (Support Brain) and 2 Ops skill handlers (sage-prioritise, sage-classify — Ops Brain) remain wired with their respective agent brains. These serve as examples of how a customer would wire their own brains into their own internal tools.

- **Agent brains = template pattern, not product content**: What becomes the product is the *pattern* (brain loaders, context layer architecture, multi-brain injection) — not the actual brain content. Each customer brings their own equivalent of Growth Brain, Tech Brain, Ops Brain, Support Brain.

## Status Changes

### Contamination Removal — Completed (7 of 13 endpoints)
These endpoints had project context and/or agent brains removed:

| Endpoint | Pattern | What was removed | Status |
|---|---|---|---|
| `/api/score` | runSageReason | projectContext param | **Verified** |
| `/api/score-conversation` | runSageReason | projectContext param | **Verified** |
| `/api/score-decision` | runSageReason | projectContext param | **Verified** |
| `/api/score-social` | runSageReason | projectContext param | **Verified** |
| `/api/reason` | runSageReason | projectContext param | **Verified** |
| `/api/guardrail` | runSageReason | projectContext param | **Verified** |
| `/api/evaluate` | Direct LLM call | projectContext, growthBrainContext, environmentalContext — removed from imports, context calls, system blocks, and user message | **Verified** |

### Contamination Removal — Pending (6 endpoints)
These endpoints have been fully read and diagnosed. Exact lines documented. Edits not yet made:

| Endpoint | Pattern | What needs removal |
|---|---|---|
| `/api/score-document` | Direct LLM call | `getProjectContext`, `getGrowthBrainContext`, `getEnvironmentalContext` — imports (lines 19-21), context calls (lines 69-71), growthBrainContext from system array (line 88), projectContext + environmentalContext from userContent (lines 78-79) |
| `/api/score-scenario` | Direct LLM call | `getProjectContext`, `getGrowthBrainContext`, `getEnvironmentalContext` — imports (lines 10-12), GET handler: growthBrainContext + environmentalContext calls (lines 101-102), growthBrainContext from system array (line 116), environmentalContext from user message (line 118). POST handler: projectContext + growthBrainContext + environmentalContext calls (lines 220-222), scoringGrowthContext from system array (line 243), projectContext + environmentalContext from userMessage (lines 233-234) |
| `/api/score-iterate` | Direct LLM call | `getTechBrainContext`, `getEnvironmentalContext` — imports (lines 10-11). TWO modes: Initial mode: techBrainContext + environmentalContext calls (lines 130-131), techBrainContext from system array (line 141), environmentalContext from user message (line 143). Continue mode: iterTechBrainContext + iterEnvironmentalContext calls (lines 393-394), iterTechBrainContext from system array (line 403), iterEnvironmentalContext from user message (line 406) |
| `/api/assessment/foundational` | Direct LLM call | `getTechBrainContext`, `getEnvironmentalContext` — imports (lines 24-25), context calls (lines 187-188), techBrainContext from system array (line 197), environmentalContext from user message (line 199) |
| `/api/assessment/full` | Direct LLM call | `getTechBrainContext`, `getEnvironmentalContext` — imports (lines 25-26), context calls (lines 217-219). techBrainContext appears in system blocks at lines 230, 240, 250, and 362. environmentalContext appears in user messages at lines 232, 243, 254, and 365. All 4 API calls need cleanup. |
| `/api/baseline/agent` | Direct LLM call | `getTechBrainContext`, `getEnvironmentalContext` — imports (lines 22-23), context calls (lines 202-203), techBrainContext from system array (line 212), environmentalContext from user message (line 214) |

### Layer 5 Wiring — Completed
- `/api/mentor-baseline` — Mentor Knowledge Base wired via `getMentorKnowledgeBase` → **Verified**
- `/api/mentor-baseline-response` — Same pattern → **Verified**
- `/api/mentor-journal-week` — Same pattern → **Verified**

### Documentation Created
- `context-layer-summary.md` (repo root) — Comprehensive reference of all 5 context layers, endpoint matrix, update frequencies. Needs update after remaining contamination removal.
- `startup_org_chart.html` (repo root) — Updated with all 4 agent brains LIVE, context layer visual stack, brain & layer status table.

## Commits This Session
- `6b738a5` — Layer 5 Mentor Knowledge Base wiring to 3 remaining mentor endpoints
- `bea8f1a` — Remove project context from 6 scoring endpoints + add context layer summary + update org chart

## Next Session Should

1. **Complete contamination removal** on the 6 remaining endpoints listed above. All files have been read and exact edit locations documented. The pattern is consistent: remove brain loader imports, remove environmental context import, remove context variable declarations, remove brain from system message array (3rd element), remove environmental context from user message concatenation.

2. **Update `context-layer-summary.md`** to reflect all removals — the endpoint matrix tables need updating to show which endpoints now only have Stoic Brain.

3. **Compile check and commit** — all 6 endpoint edits + summary update in one commit.

4. **Consider**: document the "startup package as product" architectural vision somewhere permanent (decision log or a new architecture doc). The principle that product endpoints are portable and brains are the template pattern should be captured while it's fresh.

## Blocked On
- Nothing blocked. All 6 remaining edits are straightforward and fully documented above.

## Open Questions
- Where to formally document the "startup package as product" vision — decision log entry, or a dedicated architecture document?
- Whether the `context-layer-summary.md` and `startup_org_chart.html` should also reflect the future product vision (showing how customers would plug in their own brains).

## Architectural Principle Established This Session

**Product endpoints are universal Stoic reasoning tools. Internal endpoints are project-specific operational tools.**

The 5 context layers serve two distinct purposes:
- **Product surface** (human-facing + agent-facing endpoints): L1 Stoic Brain + L2b Practitioner Context only. These are the portable product.
- **Internal surface** (mentor/reflect + Ops skills): L1 Stoic Brain + L2 Project Context + L3 Agent Brain + L4 Environmental Context + L5 Mentor Knowledge Base. These are SageReasoning-specific operational tools that demonstrate the pattern other customers would replicate with their own content.

When the startup package becomes a product, customers get:
- The product endpoints as-is (universal Stoic reasoning)
- The brain loader infrastructure as a template (they create their own brains)
- The context layer architecture as a pattern (they wire their own layers)
- Their own internal endpoints following the mentor/Ops pattern
