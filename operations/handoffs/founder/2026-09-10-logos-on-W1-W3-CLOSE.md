# Session close — logos-on W1 (documentation + justification) + W3 (S11-anchored staging rules)

**Session `8fe3a6ae-dcb1-4324-846d-631d51336dc4` (continuation).** Tier per the plan's own §5
classification: **W1 = `governance` + R18 (Elevated at the public surfaces; sign-off-before-touch)**;
**W3 = register annotations `governance`; pins `code-standard`.** **AC7 not engaged.** No production
surface touched, no `GUARD_RE` file edited, no flag/schema/credential changed.

## Status: COMPLETE for what this session's tier licenses. W2 remains untouched by design.

Governing plan: `operations/agent-circles-2026-08/2026-08-01-agent-circles-logos-on-plan.md`.
Governing verbatim (canonical, wins over this document and the plan):
`operations/agent-circles-2026-08/2026-08-01-mentor-consultation-agent-circles-logos-on-verbatim.md`.

## Gate re-verified from source before opening either workstream

The plan's §4 dependency graph (`operations/architecture-map-2026-08/06-PLAIN-TEXT-MIRROR.md`, items
4/6/8) states: **W1 blocked only by D4 closing; W3 blocked by C1c, C2, and D4 all closing — "the
narrowest gate in the whole graph."** Re-verified directly from `/CLAUDE.md`'s "Live in production"
list rather than trusted from the user's paraphrase or the Cognitive-OS standing-close prompt that
named these unblocked:

- **D4** (`SUBSTRATE_JUSTICE_SELF_CIRCLE_NARROWING_ENABLED=true`) — live and took-effect-proven since
  2026-09-05.
- **C2/C1c** (the fifth-circle orientation reading + its trust-event class) — live (MEASURE) since
  2026-08-08.

**Both gates are genuinely discharged. Both workstreams are licensed to open.**

## W1 — Documentation + justification: DONE (mechanism-side), DRAFTED (public-surface side)

Per plan §3 W1, three items:

1. **ADR-level dated amendment — DONE.** `adopted/adr/2026-07-08-sage-trust-layer.md` gains **§12**,
   a new dated amendment naming the deterministic engine's fidelity work as fifth-circle instantiation
   and the enforcement surfaces as that disposition acting, with quotes anchored to the verbatim
   record (L1, L2). It states explicitly what it does NOT do (pre-approve no activation; W2/W3-pins
   remain unbuilt; the R18 restatement is drafted not applied) — following this ADR's own §10
   discipline.
2. **R18 surfaces — DRAFTED, NOT APPLIED.** See "R18 wording, for sign-off" below. Per the plan's own
   §5 risk classification ("sign-off-before-touch"), no public surface (`llms.txt`, `agent-card.json`,
   `api-docs/page.tsx`) was edited this session. The wording is presented here for the founder to
   sign off before any session touches those files.
3. **The logos-on/practice-on relationship stated canonically — DONE**, inside the §12 amendment
   above (two postures of one instrument).

## R18 wording, for sign-off (NOT applied to any live public surface)

**Proposed addition to `website/public/llms.txt`**, placed near the existing practice-on/logos-on
mode framing (exact insertion point to be chosen by whichever session applies this, after re-reading
the current file — do not assume the surrounding text is unchanged from this drafting):

> **Logos-on and practice-on are two postures of one instrument, not two separate tools.** The
> deterministic engine's fidelity work (the unity thesis, the justice floors, the corroboration
> overrides) instantiates a fifth circle of concern — the rational order — as a settled disposition
> the infrastructure holds as a fixed condition. Logos-on is that disposition acting: the guardrail's
> deny, the intervention engine once flipped, the calling gate's enforce arm. Practice-on is a
> practitioner developing within that fixed condition through examined responses. A logos-on deny is
> the infrastructure declining on the rational order's behalf, not merely a rule blocking a prohibited
> action.

**Proposed addition to `website/public/.well-known/agent-card.json`** — a documentation-only note
(not a new extension; W1 licenses no mechanism change) inside whichever existing extension already
describes the guardrail/gate behaviour, restating the same framing in the agent-card's own register.
No new capability is claimed.

**Proposed addition to `website/src/app/api-docs/page.tsx`** — a short paragraph near the existing
`/api/guardrail` documentation, same framing, human register.

**All three drafts deliberately say nothing W2/W3 have not yet built** — no claim about enforcement
class recording, regime markers, or circle-4 staging appears, since none of that exists in the record
yet. **Founder: sign off on this wording (as-is, amended, or rejected) before any session applies it.**

## W3 — S11-anchored staging rules: register annotations DONE; pins named, NOT built

Per plan §3 W3:

1. **Register annotations (at adoption) — DONE.** `operations/trust-layer-2026-07/S11-FLIP-PREREQUISITES-REGISTER.md`
   gains **§F**: the four dated annotations (a)–(d) from the plan text, each anchored to its source
   verdict (L3, L4, L2, L5/L7), plus the two named-not-built pins. Also appended a matching Change-log
   entry per the register's own convention.
2. **Pins (battery assertions, buildable dark) — NOT BUILT, correctly.** Both pins target
   `website/src/lib/substrate/trust-core/intervention-engine.ts`, which matches `GUARD_RE` on **both**
   `/substrate/` and `trust-core`. The observation window is currently ARMED (confirmed at this
   session's own opener-regrounding work, same session). Building or even test-scaffolding against
   this file — including a new test file under a `trust-core/__tests__/` path, which would itself
   match `GUARD_RE` by substring — requires a recorded founder waiver, which this session does not
   have. **Correctly left for its own, separately-waived session.** Both pins are fully specified in
   the register's §F so that session does not need to re-derive them from the plan document.

## What was NOT done, correctly

- **W2 (record honesty — the enforcement class, regime markers, compliance-not-virtue clause) was not
  touched.** It was never in scope for this session (the user's task named W1 and W3 only), and W3's
  own annotation (a)/(d) explicitly notes W2 is still unbuilt and soft-dependent on C1c's schema being
  settled, not on anything this session did.
- **No `GUARD_RE` file was created, edited, or scaffolded.**
- **No public surface (`llms.txt`, `agent-card.json`, `api-docs/page.tsx`) was touched** — the R18
  wording above is a draft for sign-off, not an applied change.
- **The S11 flip prerequisites register's §A–§E existing content was not altered** — §F is a pure
  append, and the Change-log append is likewise additive.

## Verified at close

| Check | Result |
|---|---|
| `GUARD_RE` files modified in tree | none |
| Public surfaces (`llms.txt`/`agent-card.json`/`api-docs/page.tsx`) touched | none |
| D4 live (re-checked from `/CLAUDE.md`) | confirmed, since 2026-09-05 |
| C2/C1c live (re-checked from `/CLAUDE.md`) | confirmed, since 2026-08-08 |
| ADR-013 §12 amendment | added, quotes verified against the verbatim source file |
| Register §F | added, four annotations + two named pins |
| Production surface touched | none |

## Commit scoping

This session's own new/modified paths: `adopted/adr/2026-07-08-sage-trust-layer.md` (§12 append),
`operations/trust-layer-2026-07/S11-FLIP-PREREQUISITES-REGISTER.md` (§F + Change-log append), this
close file, and a decision-log tail append. **None matches `GUARD_RE`.** Several other files remain
uncommitted in the tree from other, closed sessions — none was staged or touched.

**The S11 flip remains REFUSED. Weights remain BLOCKED. The 0h call remains the founder's.**
