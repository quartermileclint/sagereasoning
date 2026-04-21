# Flow Tracer Endpoint Audit — 21 April 2026
## Source: Explore subagent against /website/src/app/api/**

### Key Finding: /api/score-conversation EXISTS
The previous session flagged this as orphaned. The subagent found it IS present and operational (POST, uses runSageReason, L1+L2+L3, deep depth, multi-party conversation analysis). **Do NOT remove from Flow Tracer.**

---

## Summary Statistics
- Total route.ts files: 78
- LLM-calling endpoints: 28
- Non-LLM endpoints: 50

## LLM Endpoints by Category

### A. Human-Facing Scoring (12 LLM)
| Route | LLM Call | Context Layers | Distress Check |
|-------|----------|----------------|----------------|
| /api/score | runSageReason | L1, L2, L3 | Yes |
| /api/score-iterate | client.messages.create | L1, L3 | No |
| /api/score-conversation | runSageReason | L1, L2, L3 | No |
| /api/score-scenario | client.messages.create | L1 (gen); L1,L2,L3 (score) | Yes (POST) |
| /api/score-decision | runSageReason | L1, L2, L3 | Yes |
| /api/score-social | runSageReason | L1, L2, L3 | Yes |
| /api/score-document | client.messages.create | L1, L2, L3 | Yes |
| /api/reason | runSageReason | L1, L2/null, L3 | Yes |
| /api/reflect | client.messages.create | L1, L2, L3 | Yes |
| /api/evaluate | client.messages.create | L1 only | No |
| /api/guardrail | runSageReason | L1, L3 (minimal) | No |

### B. Private Mentor (4 LLM, founder-only)
| Route | LLM Call | Context Layers | Distress Check |
|-------|----------|----------------|----------------|
| /api/mentor/private/reflect | client.messages.create | L1, L2, L3, L5, growth | Yes |
| /api/mentor/private/baseline | runSageReason | L1, L3, L5, growth | No |
| /api/mentor/private/baseline-response | runSageReason | L1, L3, L5, growth | No |
| /api/mentor/private/journal-week | runSageReason | L1, L3, L5, growth | No |

### C. Public Mentor (4 LLM)
| Route | LLM Call | Context Layers | Distress Check |
|-------|----------|----------------|----------------|
| /api/mentor-baseline | runSageReason | L1, L3 | No |
| /api/mentor-baseline-response | runSageReason | L1, L3 | No |
| /api/mentor-journal-week | runSageReason | L1, L3 | No |
| /api/founder/hub | client.messages.create | Multi-agent (ops, tech, growth, support, mentor brains); L5 for mentor | No |

### D. Assessment (2 LLM + 1 non-LLM)
| Route | LLM Call | Context Layers | Distress Check |
|-------|----------|----------------|----------------|
| /api/assessment/foundational | runSageReason | L1, L3 | No |
| /api/assessment/full | runSageReason | L1, L3 | No |
| /api/baseline | none (scoring only) | — | No |

### E. Agent/API-Facing (1 LLM)
| Route | LLM Call | Context Layers | Distress Check |
|-------|----------|----------------|----------------|
| /api/baseline/agent | client.messages.create | L1 only | No |

### F. Skills (15 LLM, all via runSageReason, all L1+L2+L3)
sage-premortem, sage-negotiate, sage-invest, sage-pivot, sage-align, sage-resolve, sage-identity, sage-coach, sage-govern, sage-compliance, sage-moderate, sage-educate, sage-classify, sage-prioritise, sage-retro

### G. Mentor Utility (4 LLM + 8 non-LLM)
LLM: passion-classify, premeditatio, oikeiosis, gap4
Non-LLM: mentor-profile, mentor-appendix, mentor-appendix/[id], private/history, private/founder-facts, founder/history, passion-log, journal-feed

### H–M. Non-LLM Categories
- Data persistence: journal, reflections, receipts, deliberation-chain/[id], compose, execute
- Auth: keys, admin/api-keys
- Billing: checkout, portal, tidings, usage-summary, usage
- System: health, stoic-brain, analytics, admin/metrics, webhooks/stripe, update-location
- User data: user/export, user/delete
- Content: skills, skills/[id], marketplace, marketplace/[id], patterns, community-map, practice-calendar, milestones, badge/[id], mcp/tools

## Distress Classifier Coverage
10 endpoints use enforceDistressCheck:
score, score-iterate (guardian), score-scenario (POST), score-decision, score-social, score-document, reason, reflect, mentor/private/reflect

## Context Layer Summary
- L1 (Stoic Brain): All 28 LLM endpoints
- L2 (Practitioner): 12 human-facing (auth-based)
- L3 (Project): 13 endpoints (condensed); minimal on /guardrail
- L5 (Mentor KB): 4 private mentor + founder hub mentor mode
- Growth accumulation: 4 private mentor endpoints
