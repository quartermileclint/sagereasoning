# Brain Wiring Blockers Audit — 21 April 2026
## Source: Explore subagent across operations/handoffs/ and operations/session-handoffs/

## Summary Table

| Brain | Status | Blocker | Reference Files |
|-------|--------|---------|-----------------|
| Tech | Wired-but-stub-on-Vercel (both channels) | Vercel process.cwd() path resolution | Handoff: tech-wiring-fix-close.md · Next: context-loader-stub-fix-prompt.md |
| Growth | Built + type-checked, removed from product endpoints (architectural decision) | N/A — intentionally internal-only | Handoff: 2026-04-10-session-8-handoff.md (contamination removal) |
| Support | Unit-verified (30/30 assertions) but no caller exists | No run-loop caller built | Handoff: support-wiring-fix-close.md + support-wiring-mount-close.md |
| Ops | Wired (2 endpoints) + stub-on-production (C1) + stub-on-Vercel (C2) | C1: Supabase migration not run · C2: Vercel path resolution | Handoff: ops-wiring-fix-close.md |

## Detail by Brain

### Tech Brain
- **Channels:** Ch1 (operations/tech-known-issues.md), Ch2 (TECHNICAL_STATE.md)
- **Status:** Both channels fail on Vercel because process.cwd() resolves to website/ not repo root
- **Harness:** 40/40 assertions passed locally
- **Fix queued in:** context-loader-stub-fix-prompt.md
- **Handoff file:** /operations/handoffs/tech-wiring-fix-close.md

### Growth Brain
- **Status:** Built and wired in session 7h, then removed from product endpoints in session 8
- **Architectural decision:** Product endpoints = universal Stoic reasoning only; no agent brains
- **Remains in:** Internal-only mentor/reflect endpoints as session-level context
- **This is not a blocker — it's a deliberate architectural choice**
- **Handoff files:** /operations/handoffs/session-7h-three-brains-wiring.md, /operations/session-handoffs/2026-04-10-session-8-handoff.md

### Support Brain
- **Channels:** Ch1 (distress pre-processing), Ch2 (interaction history/synthesis)
- **Status:** Both channels built and unit-verified (30/30 assertions)
- **Blocker:** processInboxItem and processInboxItemWithGuard exist but have ZERO external callers
- **Next:** Dedicated 3-session scope: ADR → build caller → mount + live test (per PR1)
- **Handoff files:** /operations/handoffs/support-wiring-fix-close.md, /operations/handoffs/support-wiring-mount-close.md

### Ops Brain
- **Channel 1 (Live Cost State):** Supabase table cost_health_snapshots does not exist in production. Migration file exists but hasn't been run. Stub-fallback correctly discloses "table not found."
- **Channel 2 (Operational Continuity State):** Same Vercel process.cwd() issue as Tech/Growth
- **Wired to:** sage-classify and sage-prioritise endpoints
- **Fix queued in:** context-loader-stub-fix-prompt.md (path resolution) + Critical Change Protocol session (Supabase migration)
- **Handoff files:** /operations/handoffs/ops-wiring-fix-close.md, /operations/handoffs/session-7g-ops-brain-wiring-env-context.md

## Shared Blocker: Vercel Path Resolution
Affects: Tech (2 loaders), Growth (2 loaders), Ops Channel 2 (1 loader) = 5 loaders total
Fix prompt: context-loader-stub-fix-prompt.md
Single session can fix all 5.
