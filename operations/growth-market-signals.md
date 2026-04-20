---
updated: 2026-04-20
maintainer: founder
---

# Growth Market Signals

Single source of truth for market, content, community, and competitive
observations the founder has seen. Read by
`website/src/lib/context/growth-market-signals.ts` at request time and
injected into the Sage-Growth chat persona in
`website/src/app/api/founder/hub/route.ts` (`case 'growth'`).

## Maintenance contract

- **Who updates this file:** the founder, at session close or on direct
  observation. The AI does not invent signals; if a section is empty,
  it stays empty with a "no signal yet" placeholder dated to the last
  review.
- **When to update:** any time the operator observes a signal that would
  help Growth reason about the market — a piece of content that landed
  or did not land, a developer who reached out, a piece of community
  feedback, a shift in competitor positioning.
- **When not to update:** actions the operator took (positioning
  decisions, content shipped, pricing changes) go in
  `operations/growth-actions-log.md`, not here. This file records what
  the operator observed; that file records what the operator did.
- **Rolling window:** the loader returns the last 120 days by default,
  broader than the actions log because market signals accumulate slowly.
  If fewer than 5 signals exist across all sections within the window,
  the loader widens to all available entries.
- **Signal strength:** each entry carries `strength: strong | weak |
  anecdotal`. This is a founder-judgement field, not an algorithmic
  score. Strong = multiple corroborating observations; weak = single
  noticed signal worth recording; anecdotal = one-off remark that may
  or may not matter.

## Entry format

Each entry is a top-level bullet with indented key:value children.

```
- **<One-line observation>**
    date: YYYY-MM-DD
    reference: <piece title / URL / person / competitor name>
    strength: strong | weak | anecdotal
```

Entries appear in reverse chronological order within each section.

---

## Content Performance

Observations about published content — blog posts, landing pages, social
posts. What landed, what did not, with whom.

_no signal yet (as of 2026-04-20)_

---

## Developer Discovery

Agent-side signals — API key sign-ups the founder has been told about,
agent-card.json fetches, developer questions in DMs or forums.

_no signal yet (as of 2026-04-20)_

---

## Community Feedback

Direct feedback from practitioners — emails, tweets, conversations,
in-person remarks.

_no signal yet (as of 2026-04-20)_

---

## Competitive / Market Observations

Noticed positioning changes by adjacent companies, new entrants, shifts
in language used in the space.

_no signal yet (as of 2026-04-20)_
