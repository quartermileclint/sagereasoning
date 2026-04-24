# Session Opening Protocol — DRAFT

**Status:** Drafted 2026-04-24 under D17 (discrepancy-sort 2026-04-23). Not yet adopted.
**Promotion path:** On founder approval, this file is moved to `/adopted/session-opening-protocol.md` per D6-A archive protocol. The distilled extract at `/operations/outbox/session-opening-protocol-hub-extract.md` is then wired into the hub route's `getRecommendedAction` system prompt per a separate Elevated-risk change.

**Governs:** How an AI agent opens, conducts, and closes a session in the SageReasoning project. Applies to every session — founder-driven, Ops, Tech, Growth, Support, Mentor, or scheduled.

**Does not govern:** What gets built. That is the manifest's and the project instructions' remit. This protocol governs how the agent works, not what the work is.

**Canonical-sources reference:** `/outbox/2026-04-24_canonical-sources-for-protocol.md` (list of the 9 persistent reference files, ordered by read sequence, tier-assigned by session type). This protocol points to that file rather than duplicating its contents, so the list can be maintained in one place.

---

## Protocol structure

The protocol has three parts:
- **Part A — Session opening.** Reads and confirmations before any work begins.
- **Part B — Session conduct.** Discipline that applies throughout the session.
- **Part C — Session close.** Handoff obligations before the session ends.

Each part contains numbered elements. The 21 elements collectively close the gap D17 identified between the hub's current task brief and a real protocol.

---

## Part A — Session opening (elements 1–8)

**1. Tier declaration.**
State the session's stream focus (founder / ops / tech / growth / support / mentor) and which canonical-source tier is being read. Tiers are defined in `/outbox/2026-04-24_canonical-sources-for-protocol.md` §"Tier assignment". Every session reads sources 1, 2, 3. Governance sessions add 4, 5, 6. Code sessions add 8, 9. Orientation sessions add 7.

**2. Canonical-source read sequence.**
Read the tier's sources in the order listed in the canonical-sources file. Do not read more than the tier requires unless the session's scope changes mid-session, in which case read the additional sources at the point of scope change.

**3. Handoff read.**
Read the most recent handoff in `/operations/handoffs/[stream]/` for the session's stream. If uncertain which stream applies, read `founder/`. The handoff's "Next Session Should" block is authoritative for the session's opening scope.

**4. Knowledge-gaps scan (PR5).**
Scan `/operations/knowledge-gaps.md` for any entry whose concept is relevant to the session's scope. If any match, read the resolution before beginning work. This is the concrete PR5 obligation at session open.

**5. Hold-point status confirmation (P0 0h).**
Note whether the P0 hold-point (project instructions §0h) is still active. Some work types are not permissible pre-hold-point (e.g., product work outside the hold-point assessment set). If the session's requested work falls outside what is currently permissible, surface this before starting.

**6. Model selection (PR4).**
If the session will involve code, confirm model selection against `/website/src/lib/ai/constraints.ts`. Model selection is a session-opening checkpoint, not a mid-session discovery.

**7. Status-vocabulary confirmation (0a + 0f, D14).**
Recognise two separate taxonomies: implementation status (Scoped → Designed → Scaffolded → Wired → Verified → Live) applies to modules, rules, endpoints, features. Decision status (Adopted / Under review / Superseded by [ref]) applies to decision-log entries. Do not mix the two.

**8. Signals and risk classification ready.**
Confirm readiness to use the AI signals ("I'm confident" / "I'm making an assumption" / "I need your input" / "I'd push back on this" / "This is a limitation" / "This change has a known risk" / "I caused this") and the founder signals ("Explore" / "Design" / "Build" / "Ship" / "I've decided" / "Thinking out loud" / "Done for now" / "Treat as critical"). Confirm readiness to classify each change as Standard / Elevated / Critical per 0d-ii.

---

## Part B — Session conduct (elements 9–18)

**9. Change classification before execution (0d-ii).**
Classify every code change before executing it: Standard, Elevated, or Critical. The founder may reclassify upward at any time. Urgency does not reduce the classification.

**10. Critical Change Protocol (0c-ii).**
For Critical changes: explain what changes, what could break, what happens to existing sessions, rollback plan, verification step, and obtain explicit approval before deployment. All five steps must appear in the conversation before the founder deploys.

**11. Safety-critical changes are always Critical (PR6).**
Any change to the distress classifier, Zone 2 classification, Zone 3 redirection, encryption pipeline, session management, access control, data deletion, or deployment configuration is Critical regardless of apparent scope.

**12. Safety systems are synchronous (PR3).**
No safety-critical function runs as a background or fire-and-forget process. The check completes before the response is constructed. Accept latency cost.

**13. Single-endpoint proof before rollout (PR1).**
Prove a new architectural pattern on a single endpoint before deploying it across multiple. A single-endpoint proof must reach Verified status (0a) before any rollout begins.

**14. Verification is immediate (PR2).**
When a function is wired, verify the wiring in the same session. For safety-critical functions: confirm invocation in the execution path by grepping for calls, not definitions.

**15. Deferred decisions are logged (PR7).**
When a decision is explicitly deferred, record in `/operations/decision-log.md`: what was considered, why deferred, what condition triggers revisit. Deferred decisions are as significant as adopted ones.

**16. Tacit-knowledge promotion (PR8).**
Tacit-knowledge findings tagged T-series become process rules on the third recurrence — not sooner, not later. The decision log records the promotion with the three recurrence sessions cited.

**17. Stewardship tiering (PR9).**
F-series findings are classified on logging as Catastrophic (immediate), Long-term regression (steady-state maintenance), or Efficiency & stewardship (steady-state maintenance). Middle and lower tiers are absorbed into ongoing work, not scheduled as one-off cleanups.

**18. Scope caps.**
Do not expand session scope without founder signal. If scope expansion is needed, flag it explicitly ("This session will exceed the scope stated at open; do you want me to proceed or to close at the current boundary?"). Respect "Done for now" immediately.

---

## Part C — Session close (elements 19–21)

**19. Stabilise before closing.**
If the session involved changes that could leave the system in a half-changed state, stabilise to a known-good state before closing. Do not propose additional fixes once the founder signals "Done for now".

**20. Handoff in required-minimum format (0b).**
Produce a handoff note in the minimum format (Decisions Made / Status Changes / Next Session Should / Blocked On / Open Questions) at `/operations/handoffs/[stream]/[date]-[description].md`. If the session involved code, deployment, or safety changes, add the defined extensions (Verification Method Used / Risk Classification Record / PR5 Knowledge-Gap Carry-Forward / Founder Verification). The minimum is what every handoff carries; extension use is the AI's judgement, and the founder may request any extension at close.

**21. Orchestration reminder.**
State plainly at close that this protocol was the governing frame for the session. If any element was skipped, name it and the reason. This prevents protocol drift — the protocol itself gets audited by being named at close.

---

## How this protocol relates to the hub route

The hub route (`/website/src/app/api/founder/hub/route.ts`, ~1,500 lines) hosts `getRecommendedAction`, which produces the session's opening `session_prompt`. That prompt is a task brief — specific to the day's intended work — and should remain so. This protocol is the enduring frame surrounding the day's brief.

The hub wiring concatenates a distilled extract of this protocol (see `/operations/outbox/session-opening-protocol-hub-extract.md`) ahead of `getRecommendedAction`'s output. The extract covers the non-negotiables that every session needs. The full protocol is this file; the hub does not attempt to carry the full text.

The two artefacts maintain together: amend the full protocol, regenerate the extract, redeploy the hub. The hub change is Elevated risk (affects orchestration behaviour for every session). Founder approval is required before it ships.

---

## Amendments and maintenance

This protocol is a governing document. Any change follows D6-A archive protocol: pre-edit copy to `/archive/[date]_session-opening-protocol_pre-[change-id].md`, then edit, then reference the change in the decision log.

The canonical-sources file (`/outbox/2026-04-24_canonical-sources-for-protocol.md`) is maintained separately so additions or retirements of reference files do not require editing this protocol. This protocol points at the list; the list carries the content.

The hub extract is regenerated whenever this protocol changes in a way that alters the non-negotiables. The regeneration is a manual step until a tooling rule justifies automating it.

---

## What this protocol does not do

- It does not prescribe what the session's work is. That is the handoff's and the founder's remit.
- It does not override the manifest or project instructions. Those are higher-authority documents; this protocol is procedural.
- It does not apply to non-session interactions (scheduled tasks, artifact views, etc.) unless those interactions invoke a session-opening flow.

---

## Adoption checklist (for founder)

Before moving this file to `/adopted/`:

1. Read Parts A, B, C end-to-end. The 21 elements should feel complete — if any major process rule is missing, say so.
2. Read the distilled hub extract (`/operations/outbox/session-opening-protocol-hub-extract.md`). Confirm the extract faithfully represents the non-negotiables.
3. Confirm the hub-route change plan (a separate file, not yet created — will be drafted once this protocol is approved). The hub change is Elevated risk.
4. Approve the protocol move to `/adopted/session-opening-protocol.md`.
5. Approve the hub-route change separately, after reviewing its diff and rollback plan.

Rollback: if the adopted protocol produces unintended behaviour, revert the move (return the file to `/operations/outbox/`) and restore the prior hub-route `getRecommendedAction` implementation from `/archive/`.
