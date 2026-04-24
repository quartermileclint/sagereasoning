# Session Opening Protocol — Hub Extract (DRAFT)

**Status:** Drafted 2026-04-24 under D17. Not yet wired into the hub route.
**Purpose:** This is the distilled extract that the hub's `getRecommendedAction` concatenates ahead of its per-session task brief. It carries only the non-negotiables. The full protocol lives at `/adopted/session-opening-protocol.md` (once promoted).
**Length discipline:** This file must stay under ~400 words so the hub's prompt budget is not consumed by the extract. If the extract grows, the full protocol absorbs the detail and the extract stays this length.

---

## Extract text (the block concatenated into `session_prompt`)

```
--- Session Opening Protocol (extract) ---

Before doing any work this session, complete these steps. The full protocol is at /adopted/session-opening-protocol.md.

1. State the session's stream focus and the canonical-source tier being read. Tiers: every session reads manifest + project instructions + most recent handoff in the stream; governance sessions add decision log + discrepancy register + knowledge-gaps register; code sessions add tech guide + verification framework; orientation sessions add PROJECT_STATE. Full list and order: /outbox/2026-04-24_canonical-sources-for-protocol.md.

2. Read the most recent handoff at /operations/handoffs/[stream]/. The "Next Session Should" block in that handoff is authoritative for opening scope.

3. Scan /operations/knowledge-gaps.md for entries relevant to the session's scope; read the resolution before starting.

4. Confirm the P0 hold-point status. Some work is not permissible pre-hold-point — if the requested work is outside the permissible set, surface this before starting.

5. If the session involves code, confirm model selection against /website/src/lib/ai/constraints.ts. Model selection is a session-opening check, not a mid-session discovery.

6. Use both status taxonomies correctly: implementation status (Scoped / Designed / Scaffolded / Wired / Verified / Live) for modules and features; decision status (Adopted / Under review / Superseded) for decision-log entries. Do not mix.

7. Classify every code change as Standard, Elevated, or Critical (project instructions 0d-ii). Any change to distress classification, Zone 2, Zone 3, encryption, session management, access control, data deletion, or deployment config is Critical regardless of apparent scope (PR6). For Critical changes, complete the Critical Change Protocol (0c-ii) in the conversation before asking for deployment.

8. Prove new architectural patterns on a single endpoint before rolling out (PR1). Verify wiring in the same session as the build (PR2). Safety-critical functions run synchronously, never as background processes (PR3).

9. Log deferred decisions in /operations/decision-log.md with what was considered, why deferred, and the revisit condition (PR7).

10. Close the session with a handoff in the required-minimum format (0b) at /operations/handoffs/[stream]/. Add defined extensions if the session involved code, deployment, or safety. Name any protocol element skipped and the reason.

--- End Session Opening Protocol (extract) ---
```

---

## Implementation notes (for wiring, not for inclusion in the extract)

The block between the two `---` fences above is the exact text the hub concatenates. Everything outside the fences (including this section) is maintenance context only.

Word count of the extract text: ~380 words.

The extract is a sibling to the hub's existing `getRecommendedAction` system prompt, concatenated before it. The existing prompt continues to produce the per-session task brief. The extract frames the brief with protocol obligations.

Hub change (pending approval):
- File: `/website/src/app/api/founder/hub/route.ts`
- Function: `getRecommendedAction` (system prompt construction block)
- Edit: prepend the extract text (between the fences above) to the system prompt.
- Risk classification: Elevated (affects every session's opening behaviour; no safety-critical functions touched).
- Rollback: revert the single edit via git or by restoring from `/archive/[date]_route_pre-protocol-extract.ts.md`.

Pre-change verification needed: confirm `getRecommendedAction`'s current system prompt structure (lines ~654–738 per the addendum) so the prepend lands in the right place and the existing prompt's behaviour is preserved.
