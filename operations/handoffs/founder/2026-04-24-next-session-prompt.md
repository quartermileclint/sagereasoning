# Next-Session Prompt — Governance Clean-up + Session Opening Protocol Draft

*Paste this entire file as the opening message of the next Cowork session. It is self-contained.*

---

## 1. Who you are, what you are doing

You are the Claude agent working in Cowork mode on the SageReasoning project. You are continuing from a session that ran on 23 April 2026. The founder (Clinton) is non-technical, sole founder, and works in fast bounded phases. Default to plain language, step-by-step instructions, and computer:// links for any file surfaced.

This session has two tracks:

**Track A — Finish the governance corpus clean-up** (resolve remaining discrepancies that block the protocol draft).

**Track B — Draft the Session Opening Protocol** (the hybrid artefact: canonical file in `/adopted/`, distilled extract concatenated into the hub's `session_prompt`, pointer to full file).

Track A must finish before Track B begins, because Track B depends on a stable canonical-source list.

---

## 2. Session-opening reads (MANDATORY — do these first, in order)

Read the following files before any other work:

1. `/manifest.md` — master governance (R0–R20, CR-2026-Q2-v4). Quote any rules relevant to the work.
2. Project instructions — configured at project level, already in your context.
3. `/INDEX.md` — navigation layer. Freshly updated 2026-04-23 for Archive Protocol + Handoff Structure; other sections still partially stale (D4).
4. `/operations/discrepancy-sort-2026-04-23.md` — 17 discrepancies D1–D17. D6 and D7 resolved last session. D17 scheduled. Everything else outstanding.
5. `/operations/handoffs/founder/2026-04-23-discrepancy-sort-close.md` — full session close from the previous session.
6. `/operations/decision-log.md` — 22+ entries; most recent four are DD-2026-04-23-01 through DD-2026-04-23-04.
7. `/operations/knowledge-gaps.md` — PR5 register. Scan for concepts relevant to today's scope.
8. `/summary-tech-guide.md` and `/summary-tech-guide-addendum-context-and-memory.md` — technical state summaries. Note [DIVERGENCE] and [TBD] tags (discrepancy items D11, D12).

At the end of the reads, report in one paragraph:

- The resolution status of each of the 17 discrepancies (use the Summary table in the discrepancy-sort as the source of truth).
- Any rule numbers you will cite during today's work.
- Any knowledge-gap entries relevant to today's scope.

Then wait for the founder before proceeding.

---

## 3. Operating rules (carry into every action this session)

- **Status vocabulary (0a):** Scoped → Designed → Scaffolded → Wired → Verified → Live. Use these terms when declaring work state; do not invent others.
- **Communication signals (0d):** Use "I'm confident / making an assumption / need your input / push back / limitation / I caused this" prefixes when appropriate.
- **Risk classification (0d-ii):** Every code change classified Standard / Elevated / Critical before execution. See PR6 — anything touching safety-critical functions (distress classifier, Zone 2/3, their wrappers) is automatically Critical.
- **Critical Change Protocol (0c-ii):** For Critical changes, complete all six steps visibly in chat before asking for deploy approval.
- **PR1 (single-endpoint proof):** Any new architectural pattern proven on one endpoint first, reach Verified, then roll out.
- **PR2 (verification immediate):** Wire = call it = verify in same session.
- **PR4 (model selection is a constraint):** Check `/website/src/lib/constraints.ts` before designing any new endpoint. Session-opening checkpoint, not mid-session discovery.
- **PR7 (deferred decisions documented):** Any decision explicitly deferred is logged in the decision log with reasoning and revisit condition.
- **Archive protocol (D6-A, canonical as of 2026-04-23):** Before any governing or strategic file is updated, prior version copied to `/archive/` with date-prefixed descriptive name. No inline `.backup-*`. No per-folder `/backup/` subfolders.
- **Handoff structure (D7-C + R1, canonical as of 2026-04-23):** All handoffs live in `/operations/handoffs/<stream>/` where stream is one of founder/ops/tech/growth/support/mentor. Rollups in `_rollup/` on founder signal "rollup [milestone-name]". File-name convention: `*-prompt.md`, `*-handoff.md`, `*-close.md`.
- **Close-out format:** 9-section close note per D8 current practice (Decisions Made, Status Changes, What Was Done, Verification Method Used, Risk Classification Record, PR5 Knowledge-Gap Carry-Forward, Blocked On, Open Questions, Next Session Should).

---

## 4. Track A — Finish the governance corpus clean-up (do first)

**Goal:** Bring every Material discrepancy to Resolved or Deferred-with-reasoning before protocol drafting begins.

**Outstanding Material items:**

### D1 — `/drafts/` byte-identical to adopted files

Facts:
- `/drafts/manifest-DRAFT-2026-04-18.md` is byte-identical to `/manifest.md` (verified by `diff -q` last session).
- `/drafts/2026-04-20_PROJECT_STATE_draft.md` is byte-identical to `/PROJECT_STATE.md`.
- `/drafts/project-instructions-DRAFT-2026-04-18.md` (D2) relationship to adopted instructions undocumented.

Recommended path:
- Option A: Move to `/archive/` with `2026-04-18_manifest_snapshot.md` naming (treats them as point-in-time snapshots).
- Option B: Delete outright.
- Option C: Rename in place + header note.
- Option D: Replace with actual proposed-successor content.

Ask Clinton for a decision on D1 and D2 (D2 can be resolved by cheap `diff` against `/archive/2026-04-18_Project-Instructions.md`).

### D3 — Two V3 Adoption Scope versions co-exist in `/adopted/`

Facts:
- `V3_Adoption_Scope.md` (Mar 30, R1–R9) and `V3_Adoption_Scope_Revised_April.md` (Apr 2, R1–R13) both in `/adopted/`.
- Revised file header states "Supersedes: V3_Adoption_Scope.md".
- Manifest has since grown to R0–R20; both are now behind.

Recommended path:
- Option A: Move original Mar 30 to `/archive/2026-04-02_V3_Adoption_Scope_original.md`.
- Option C (A+B): Move original to archive AND refresh Revised's rule references to R0–R20.
- Option D: Audit whether the Revised itself is still current.

Ask Clinton for a decision.

### D4 — INDEX.md broader staleness (partial resolution last session)

Two sections refreshed last session (Archive Protocol, Handoff Structure). Other stale claims:
- `/website/` Status "Scaffolded" (actual: hub orchestration is wired and live at supervised level).
- Status vocabulary mismatch: uses "Current/Active/Archived" vs 0a "Scoped→Live". D14 related.
- Does not mention summary-tech-guide.md or addendum (both adopted 2026-04-22).

Recommended path:
- Option A: Full refresh pass in this session.
- Option B: Trim INDEX to "where governance docs live" only; push project-state details to PROJECT_STATE.md / TECHNICAL_STATE.md.
- Option C: Auto-generate from a file-tree scan (higher up-front cost).

Ask Clinton for a decision.

**Notable items** (D2, D5, D8, D10–D12, D14–D16) — surface each briefly with the options, ask Clinton to resolve, defer with PR7 reasoning, or queue.

**Minor items** (D9, D13) — batch housekeeping after Material items clear.

---

## 5. Track B — Draft the Session Opening Protocol

**Goal:** Produce the hybrid protocol artefact per DD-2026-04-23-01.

**Form:**

1. **Canonical file** at `/adopted/session-opening-protocol.md`. Full-fat version. Governs via the adopted folder's rhythm (D6-A archive protocol applies — any future edit preserves prior version).
2. **Distilled extract** — the text concatenated into the hub's `session_prompt`. Short enough to fit in the hub's 3–8 sentence target, dense enough to carry the non-negotiables. Ends with a pointer to the canonical file.
3. **Hub wiring change** — modify `/website/src/app/api/founder/hub/route.ts` so the `getRecommendedAction` function (lines 654–738) or the `session_prompt` construction path prepends the distilled extract before the task brief.

**Protocol must cover (minimum):**

- The four persistence mechanisms requiring founder discipline (per addendum §E) — the session opener must remind the founder these are founder-held, not AI-held.
- Governance reads (manifest → project instructions → INDEX → discrepancy-sort → decision-log → knowledge-gaps).
- Status vocabulary (0a) and communication signals (0d).
- Risk classification (0d-ii) and Critical Change Protocol (0c-ii).
- Closing obligations — the 9-section close-note format, placement in correct `/operations/handoffs/<stream>/` subfolder.
- Scope cap — "do the task; do not enlarge it without an explicit founder signal."
- R20a gap disclosure — until R20a is wired to the hub (deferred to P2, see addendum §I), the hub's outputs are not safety-gated at the hub layer; agents using hub output must treat user-facing language with R20a caution inherited from their own guardrails.
- Existence-of-orchestration reminder — the session might be kicked off via the hub's recommended action, or directly by the founder; both entry paths follow the same protocol.
- Pointer to the full canonical file at the end of the distilled extract.

**Sequence of work for Track B:**

1. Propose the structure of the canonical file in chat; wait for Clinton's "Build" signal.
2. Draft the canonical file (Markdown). Produce it at `/operations/outbox/session-opening-protocol-DRAFT.md` first (not directly to `/adopted/`) so Clinton can review before adoption.
3. Draft the distilled extract (short form) separately in the chat for Clinton's approval before wiring.
4. On Clinton's "Ship" signal for the canonical file: move to `/adopted/session-opening-protocol.md`; archive any prior version per D6-A.
5. On Clinton's "Ship" signal for the distilled extract: modify `/website/src/app/api/founder/hub/route.ts` to prepend the extract to the session_prompt.

   This is an Elevated change (touches the hub's prompt construction, which affects every session opened via the hub).
   - Name what could break: hub response may exceed token budget if extract too long; malformed concatenation could produce a prompt that reads oddly.
   - Rollback: `git revert` the route.ts commit.
   - Verification step: deploy to preview, call the hub from the founder-hub page, paste the returned `session_prompt` into a test session, confirm the protocol reads correctly at session open.

6. PR1 applies — this is a single-endpoint proof (hub only). No rollout to direct agent endpoints until Verified on the hub.

---

## 6. Decisions carried forward from 23 April 2026

Do not re-debate these:

- **DD-2026-04-23-01** — Session Opening Protocol = hybrid form.
- **DD-2026-04-23-02** — Discrepancy-sort adopted; Option 1.
- **DD-2026-04-23-03** — `/archive/` at root canonical (D6-A).
- **DD-2026-04-23-04** — `/operations/handoffs/` with role subfolders + R1 manual rollup (D7-C + R1).

See `/operations/decision-log.md` for full entries.

---

## 7. Artefacts created in the prior session (reference)

- `/operations/discrepancy-sort-2026-04-23.md` — 17 discrepancies with options and resolutions.
- `/operations/handoffs/founder/2026-04-23-discrepancy-sort-close.md` — prior session close.
- `/archive/2026-04-11_INDEX.md` — prior INDEX before refresh.
- `/archive/2026-04-23_discrepancy-sort_pre-resolution.md` — prior discrepancy-sort before resolutions were added.
- `/archive/2026-04-23_decision-log_pre-resolution-entries.md` — prior decision-log before the four new entries.
- `/archive/2026-04-15_R20a-drafts-backup/` — migrated `/drafts/backup/` content.
- `/archive/2026-04-16_website-session-handoffs/` — archived abandoned handoff path.
- `/archive/2026-04-21_inline-backups/` + `/archive/2026-04-22_inline-backups/` — migrated inline `.backup-*` files.
- `/operations/handoffs/` — 7-subfolder canonical tree.
- `/operations/session-handoffs/MIGRATED.md` — retirement stub for old path.

---

## 8. Closing obligations for THIS session (next one you are running)

At session close, produce a close note at:
`/operations/handoffs/founder/2026-04-DD-governance-cleanup-and-protocol-close.md`

Use the 9-section format. Include decision-log entries for any new decisions. Archive prior versions per D6-A before updating any governing file.

If scope is cut short (Clinton signals "I'll go" or "done for now"), stabilise to a known-good state and write the close note covering whatever was completed — do not propose additional fixes unless Clinton specifically asks.

---

## 9. First thing to say when this session opens

After you complete the session-opening reads (§2), respond with:

> **Reads complete. Governance corpus state:** [one-paragraph summary of discrepancy-sort status, citing counts].
> **Ready for Track A.** Outstanding Material items: D1, D3, D4 (partial). Which should we resolve first?

Then wait.

---

*End of next-session prompt.*
