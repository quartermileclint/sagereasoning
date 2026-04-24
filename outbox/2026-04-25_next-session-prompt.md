# Next-Session Prompt — Paste into the next session to continue

**Usage:** Copy everything below the line into the next session's opening message. The prompt references files by path — do not paste the file contents themselves, just the prompt text. The AI will read the referenced files as part of session opening.

---

You are resuming the SageReasoning project. This is the first session operating under the Session Opening Protocol from session open (the protocol was adopted mid-session on 2026-04-24; its first live application was partial).

## Session opening (per `/adopted/session-opening-protocol.md`, Part A, 8 elements)

Follow all 8 opening elements. Specifically:

**Element 1 — Tier declaration.** State this session's stream focus and the canonical-source tier being read, per `/adopted/canonical-sources.md`. Default tier for this session: **1 + 2 + 3** (every session) plus **4 + 6** (this session starts with governance verification). If scope expands into code, add 8 + 9 at that point.

**Element 2 — Canonical-source read sequence.** Read in this order:
1. `/manifest.md`
2. Project instructions (already in system prompt — confirm loaded and quote the 0b, PR5, and 0a passages back; see Priority 1 below for why)
3. `/operations/handoffs/founder/2026-04-24-protocol-adoption-and-hub-wiring-close.md` (most recent founder-stream handoff — authoritative for this session's opening scope)
4. `/operations/decision-log.md` — scan the tail; the most recent entry is DD-2026-04-24-09
6. `/operations/knowledge-gaps.md` — scan KG1–KG11 for entries relevant to this session's scope

**Element 3 — Handoff read.** The "Next Session Should" and "Founder Verification (Between Sessions)" blocks in the 2026-04-24 close note are authoritative for this session's opening scope.

**Element 4 — Knowledge-gaps scan.** Pay attention to KG11 (FUSE sandbox deletion permission) — this resolution is now permanent; if you hit `Operation not permitted` on any `rm`/`mv`, call `mcp__cowork__allow_cowork_file_delete` proactively rather than re-deriving the workaround.

**Element 5 — Hold-point status.** Confirm whether P0 hold-point (project instructions §0h) is still active at session open. Surface this even if the session's scope doesn't touch product work — element 5 was skipped in the previous session's open and flagged in the handoff as minor protocol drift to correct.

**Element 6 — Model selection.** Only if this session will involve code. If so, confirm against `/website/src/lib/ai/constraints.ts` before any endpoint design.

**Elements 7 and 8 — Status vocabulary + signals + risk classification.** Confirm readiness procedurally. No action needed unless the session requires their use.

State which tier you read at session open. State P0 hold-point status.

## What landed in the previous session (2026-04-24)

- **Session Opening Protocol adopted** at `/adopted/session-opening-protocol.md`. 21 elements across Parts A/B/C. D17 Track B closed.
- **Canonical-sources list adopted** at `/adopted/canonical-sources.md`. 9 sources, tier-assigned by session type.
- **Hub route wired.** `SESSION_OPENING_PROTOCOL_EXTRACT` constant added at `/website/src/app/api/founder/hub/route.ts` line 63, prepended to `session_prompt` on both return branches of `getOpsRecommendedAction` (lines 756, 766). Verified in production by the founder.
- **KG11 promoted.** FUSE sandbox deletion permission pattern — third recurrence triggered the PR5 promotion.
- **All governance changes committed and pushed.** Two commits on 2026-04-24: one bundled adoption + hub wiring, one for post-verification cleanup (outbox archives + KG11 + handoff).
- **Decision log:** 31 dated entries. DD-2026-04-24-09 is the adoption entry.
- **`/operations/outbox/` is empty.** `/outbox/` has this prompt file plus a few unrelated items.

## Priority 1 — Verification tasks

Work through each item in the previous handoff's "Founder Verification (Between Sessions)" list. The founder may ask you to do these as a checklist, or may ask about individual items.

**Highest-priority item:** confirm project-instructions amendments are visible in this session's system prompt. In the previous session, the amendments (D8 handoff format, D9 PR5 wording, D14 dual status taxonomy) were applied at the Cowork UI by the founder, but the system prompt loaded mid-session still showed pre-amendment wording. A Claude desktop restart was performed. This session's system-prompt load is the first opportunity to verify.

Do this by quoting back:

- 0b section's handoff format. Pre-amendment shows a 5-section minimum only (Decisions Made / Status Changes / Next Session Should / Blocked On / Open Questions). Post-amendment should add a defined-extensions block (Verification Method Used / Risk Classification Record / PR5 Knowledge-Gap Carry-Forward / Founder Verification) with the condition "used when the session involved code, deployment, or safety changes."
- PR5 wording. Pre-amendment says "At three re-explanations, a documentation task is created in operations/knowledge-gaps.md and the concept earns a permanent entry in the Knowledge Gaps Register." Post-amendment should recognise three entry states: Candidate (first observation) / Candidate 2nd recurrence / Entry (third recurrence or pre-populated from a structured extraction pass), with explicit pre-population authorisation.
- 0a status table area. Post-amendment should add a paragraph (after the 6-row table) documenting both axes: implementation status (Scoped → Designed → Scaffolded → Wired → Verified → Live) vs decision status (Adopted / Under review / Superseded by [ref]), with a rule not to mix the two.

Report each as **APPLIED** (you see the post-amendment wording), **NOT APPLIED** (you see the pre-amendment wording — the Cowork UI apply did not propagate), or **UNCLEAR** (quote what you see and let the founder decide).

If any item reports NOT APPLIED, do not rewrite the project instructions yourself — that is a Cowork UI action the founder performs. Flag it; the founder decides next steps.

## Priority 2 — First live-protocol session feedback

This is the second session under the adopted protocol but the first to open under it from the start. As you work, surface friction:

- Any protocol element that felt awkward, heavy-handed, or out of place for the session's actual scope.
- Any element that you wanted to skip but couldn't identify a justification under Part B 18 (scope caps) to do so.
- Any gap — a procedural discipline the project uses that isn't in the protocol's 21 elements.

Do not propose amendments unsolicited. Surface observations as **first-pass friction**; the founder decides which (if any) merit an amendment pass under D6-A.

## Priority 3 — Founder-directed work

No work is queued at session open. The founder will direct scope. If the founder signals "Explore" or "Design", do not build. If "Build", classify risk first per 0d-ii before executing.

## Open questions carried forward

- The knowledge-gaps register in `/operations/knowledge-gaps.md` has KG1–KG11; the manifest's Knowledge Gaps Register section names only KG1–KG7 permanent slots with KG3 and KG7 as TBD placeholders. Two numbering schemes coexist. Not urgent; flag if the founder asks about KG vocabulary or if a future discrepancy pass opens this corner.
- The adopted protocol's "How this protocol relates to the hub route" section describes the hub-extract file with past-conditional wording (see it "until the hub is wired, then in archive after"). Now that both conditions resolved, the text is accurate retrospectively but could be rewritten past-tense for clarity. Minor housekeeping.
- The drafts referenced the function as `getRecommendedAction`; the actual function is `getOpsRecommendedAction`. Drafts now archived with the wrong name preserved for historical fidelity. No action unless the confusion recurs.

## What not to do

- Do not touch `/adopted/` without a D6-A pre-edit archive and explicit founder approval.
- Do not wire, refactor, or re-architect the hub route (`/website/src/app/api/founder/hub/route.ts`) without a new Critical Change Protocol pass (0c-ii) and explicit approval. Any change affecting authentication, cookie scope, session validation, or domain-redirect behaviour is Critical by default (AC7).
- Do not assume the pre-amendment wording is the current rule if post-amendment wording is visible in this session's system prompt. Quote before citing.
- Do not extend scope beyond what the founder selects at session open.
- Do not propose additional fixes once the founder signals "Done for now".

## Session close

At close, produce a handoff at `/operations/handoffs/founder/[date]-[description].md` per Part C element 20 of the protocol:

- **Required minimum (every handoff):** Decisions Made / Status Changes / Next Session Should / Blocked On / Open Questions.
- **Defined extensions (add when session involves code, deployment, or safety):** Verification Method Used / Risk Classification Record / PR5 Knowledge-Gap Carry-Forward / Founder Verification.
- **Orchestration reminder (Part C element 21):** state at close that this protocol was the governing frame for the session, and name any element that was skipped and the reason.
