---
updated: 2026-04-20
maintainer: founder
---

# Growth Actions Log

Single source of truth for growth-domain actions taken by the operator.
Read by `website/src/lib/context/growth-actions-log.ts` at request time
and injected into the Sage-Growth chat persona in
`website/src/app/api/founder/hub/route.ts` (`case 'growth'`).

## Maintenance contract

- **Who updates this file:** the founder, at session close when any
  growth-domain action has been taken during the session. The AI may
  propose a new entry at session close for a session that produced one,
  but will not overwrite without explicit approval.
- **When to update:** any action that would appear in the decision log
  under a growth-domain tag — positioning changes, audience scope
  decisions, content shipped, devrel moves, community outreach, metrics
  decisions, pricing changes, messaging revisions.
- **When not to update:** observations about the market or community go
  in `operations/growth-market-signals.md`, not here. This file records
  actions the operator took; that file records signals the operator
  observed.
- **Rolling window:** the loader returns the last 90 days by default.
  Older entries remain here for audit but are not injected into context.
- **Severity / scale:** entries do not carry a severity field; every
  entry is by definition significant enough to be worth remembering,
  and the loader does not weight them.

## Entry format

Each entry is a top-level bullet with indented key:value children.

```
- **<One-line summary>**
    date: YYYY-MM-DD
    domain: positioning | audience | content | devrel | community | metrics | pricing | messaging
    action_type: decided | drafted | shipped | tested | opened | paused | reversed
    outcome: <short phrase> | awaiting_signal
    reference: <optional link to decision log entry or handoff file>
```

Entries appear in reverse chronological order (most recent first).

## Actions

- **Growth wiring fix designed and scaffolded**
    date: 2026-04-20
    domain: positioning
    action_type: decided
    outcome: awaiting_signal
    reference: operations/handoffs/growth-wiring-fix-handoff.md
