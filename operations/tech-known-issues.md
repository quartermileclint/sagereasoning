---
updated: 2026-04-20
maintainer: founder
---

# Tech — Known Issues

Hand-maintained single source of truth for current and recently-resolved
system issues. Tech agent reads this file at request time via
`website/src/lib/context/tech-system-state.ts`.

**Maintenance contract:** Founder updates this file at session close when
any issue is observed, any change goes live, or any deploy fails. The AI
may propose edits but does not overwrite without approval.

**Not in scope:** This file is the operator's situational awareness layer,
not a replacement for Vercel runtime logs or the decision log. Vercel logs
are out of reach from inside the serverless runtime; the decision log
tracks reasoning, not live state.

**Severity tiers** (per PR9):

- `catastrophic` — Immediate response. Live system down or unsafe.
- `significant` — Material loss of function for some surface. Not a crisis.
- `minor` — Degraded but functioning. Steady-state maintenance.
- `cosmetic` — Visual or wording. Steady-state maintenance.

**Status values:** `open` / `investigating` / `mitigated` / `resolved`.

---

## Current Issues

No known issues at 20 April 2026.

---

## Recently Resolved (last 30 days)

No recently-resolved issues at 20 April 2026.
