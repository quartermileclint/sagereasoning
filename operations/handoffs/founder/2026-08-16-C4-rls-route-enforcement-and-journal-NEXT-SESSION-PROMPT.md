# Next session — concurrent-arc C4: the RLS-vs-route-enforcement gap (+ journal)

**Paste this as the first message of a new session, in the `sagereasoning` repo root.**

C4 is a block of the concurrent arc
(`operations/handoffs/founder/2026-08-15-concurrent-arc-plan.md` — the governing document; its
C4 heading was restored 2026-08-16 at C3b after an earlier session's edit had overwritten it,
so re-derive the block from the file itself, not from memory). It is **concurrent-safe by
design** — it clears both the IDEA-loop parallel-window fences — so it can run now, alongside
the bounded validation run, without waiting on R1's §6 report or any other post-run gate.

**Tier: mixed, phased — classify each phase separately.** The journal decisions (Step 1) and
the RLS survey (Step 2, Phase 1) are `code-standard`/read-only. The `impulse_entries` RLS fix
(Step 2, Phase 2) is **`code-critical`** — an auth/security/perimeter change to a production
data-access-control surface, triggering **PR19** (independent adversarial review) and **AC7**
(Critical Change Protocol, six-point disclosure before any live DB policy change). The journal
build tail (Step 3) is `code-standard`. **Founder presence: full walk** on Step 2 Phase 2 (the
migration, the AC7 disclosure, the production apply); otherwise as needed.

**Standing instruction (carry it all session):** before launching the PR19 adversarial review
in Step 2, **PAUSE so the founder can drop the model setting**, and **PAUSE after it completes
so the founder can restore it.**

---

## Step 0 — Concurrency pre-flight (mandatory, fresh — every time)

Run `operations/handoffs/founder/2026-08-10-idea-loop-parallel-window-NEXT-SESSION-PROMPT.md`'s
pre-conditions exactly, from scratch — **do not inherit a cycle count, mode, or blocking-spec
status from an earlier conversation or from this prompt.** Check the scratch project
(`/Users/clintonaitkenhead/Claude-work/PROJECTS/idea-loop-validation-run/`) for any
`*-CHANGE-SPEC.md`/`*-BLOCKED.md` (Mode 1 preempts everything if found); otherwise re-derive the
live cycle count read-only against production (`idea_loop_cycles`, loop
`sagereasoning:idea-loop@v1#001`). This session's surfaces (RLS policies on human-practitioner
tables — never `idea_loop_*`, never the four fenced routes, never the runner credential) should
read as **Mode 2** (ordinary build work) — confirm rather than assume; the run may have
completed or hit a new blocking spec since this prompt was authored (2026-08-16).

`git fetch origin && git log origin/main..HEAD --oneline && git status --short` — confirm clean
against the founder's last push before starting.

---

## Step 1 — The journal decision block (~5 min, at open)

Present these two options to the founder and record the decision before moving on:

**(a) The UTC-vs-local pace-gate mismatch.** The journal's evening "write your journal" nudge
can fire while `/api/journal` is still 429-rate-limiting the practitioner for up to ~10
local-morning hours, because the pace gate resets on UTC, not local time. Options to put to the
founder: shift the gate to a local-time boundary (needs a timezone signal the app may not
reliably have); soften the mismatch window; leave as-is and disclose it in the nudge copy; or
another option the session surfaces on inspection of the actual gate code
(`grep -rn` the journal pace-gate implementation first, don't assume the shape).

**(b) The day-55 evening-pole terminal case.** The journal is a finite 55-day curriculum. What
should the evening-pole nudge do once a practitioner has completed it — stay silent, switch to
a different message, point elsewhere? Present options grounded in what the journal UI already
does post-completion (check first, don't assume nothing exists).

Record both decisions plainly at the top of the session's eventual close — they gate Step 3,
not Step 2.

---

## Step 2 — The RLS-vs-route-enforcement gap (the substance of this session)

**Run the fully authored prompt as written, in full:**
`operations/handoffs/founder/2026-08-12-rls-vs-route-enforcement-gap-NEXT-SESSION-PROMPT.md`

Read it start to finish before doing anything else in this step — it carries its own Part A
read order (the two origin decision-log entries `D-S7-IMPULSE-PR19-INDEPENDENT-REVIEW-CLEAN`
and `D-S7-IMPULSE-MENTOR-CLEARANCE-AND-FOLLOW-THROUGH`, the priority-index item, and the
sibling-table contrast read), its own Phase 1 (survey, ~14 tables, read-only) / Phase 2
(`impulse_entries` fix, Critical, PR19+AC7) split, and its own explicit "what is NOT in scope"
and rollback sections. **Do not paraphrase from memory of an earlier conversation — read the
file itself; it is the governing procedure for this step, not this wrapper.**

**One-line summary of what it asks, for orientation only (the file above is authoritative):**
every human-practitioner table across the Remaining Principles arc (14+ tables, migration list
inside the linked prompt — re-run the grep, don't trust the list as current) ships per-verb
owner RLS policies, which lets any authenticated practitioner bypass the Next.js route entirely
via direct PostgREST — and with it every server-side check, including, for `/impulse`
specifically, the R20a distress check. The mentor confirmed the severity, refused a local-only
patch (*"a fix here that doesn't fix the architecture creates an illusion of protection that is
worse than the honest gap"*), and named `impulse_entries` as the mandatory first table (*"the
one table in the application where a route bypass reaches the exact population the perimeter
exists to protect"*). Phase 1 surveys all affected tables and produces a written
`safe-to-fix-same-pattern` / `needs-route-change-first` / `needs-further-investigation` verdict
per table. Phase 2 fixes `impulse_entries` only — new migration with
`§PRE`/`§APPLY`/`§VERIFY`/`§INVERSE`, a live before/after bypass proof on TEST then production,
AC7 disclosure, a fresh PR19 review (checking SELECT too, not just the write bypass) before the
production step.

**Do not fix any table beyond `impulse_entries` in this session**, even if Phase 1's survey
turns up several easy ones — the authored prompt is explicit on this; land one clean, prove the
pattern live, and let the founder elect the next table for a future session.

---

## Step 3 — Journal build tail (droppable)

The small, human-side, non-fenced build implementing the Step 1 decisions. **If the session
runs hot, this tail carries to a future session's tail instead** (the arc plan names R4's tail
as the fallback slot) — it is explicitly not load-bearing for this session's success.

---

## Close

- Lean decision-log entry for Step 2's Phase 1 survey (`code-standard`) and a full-form entry
  for Phase 2's `impulse_entries` fix (`code-critical`, AC7/PR19 discharge recorded per the
  standing protocol). A separate short entry for Step 1's journal decisions if Step 3 ran; note
  explicitly if Step 3 was deferred.
- Tick the arc plan's **C4** checkbox
  (`operations/handoffs/founder/2026-08-15-concurrent-arc-plan.md`), with a dated annotation
  naming what closed (Phase 1 survey + Phase 2 `impulse_entries` fix; journal tail
  done/deferred) and what remains carried (the rest of the Phase 1 survey's table backlog, for
  a future founder-elected session, in whatever order the founder elects — the mentor ruled
  `impulse_entries` first; it did not rule an order for the rest).
- Commit only this session's own outputs (the survey document, the new migration file, any
  route-file changes, the decision-log entries, the arc-plan tick). Use `git commit -F <file>`
  if any message quotes verbatim text.
- Founder pushes; confirm Vercel green before calling Phase 2 closed.

## What NOT to do

- Do not fix any table beyond `impulse_entries` (the authored prompt's own scope boundary).
- Do not touch `route_errors`, `throttle_events`, `collaboration_records`, `agent_trust_events`,
  `agent_trust_state`, `substrate_audit_narratives`, or any other table already on the correct
  service-role-only pattern — these are the target shape, not part of the gap.
- Do not redesign the R20a perimeter, the distress-check mechanism, or any
  `/api/reason`/`/api/guardrail` surface — this gap is about direct-database bypass of the
  route layer, not the perimeter logic itself.
- Do not touch the three IDEA-loop flags, the watching vocabularies, the runner credential
  `527cc86b-…`, the four live route contracts (`/api/reason`, `/api/guardrail`,
  `/api/practice/fresh`, `/api/practice/watching`), or `idea_loop_*` schema.
- Do not skip Step 0's fresh pre-flight, even though this session's surfaces are unlikely to
  intersect the run — the standing discipline is to re-derive, never inherit.

---

**Forecast.** Success = the journal decisions recorded; a written, table-by-table RLS survey
turning "unscoped" into a real backlog with a verdict per table; `impulse_entries` specifically
closed — its direct-PostgREST bypass proven blocked on both TEST and production, its own
legitimate route path proven unbroken, PR19 clean, AC7 discharged, migration-with-inverse in
the repo — an honest, explicit statement that the remaining surveyed tables are carried, not
closed; the journal tail landed or explicitly deferred; C4 ticked; the run undisturbed.

*End of prompt.*
