# Next session — open on informed foundations, then receive the founder's instruction (post-Prudence-Group)

**Paste this as the FIRST message of a new session.** This prompt has **no task of its own.** Its
entire job is to bring the session to a verified, current grounding and then **stop and wait** —
the founder will supply the instruction once grounding is confirmed. Do not guess at the
instruction, do not pick an item off the standing queue, do not self-start anything.

**It supersedes `2026-08-15-informed-foundation-NEXT-SESSION-PROMPT.md`** (same shape, now-stale
deltas — that prompt's session ran 2026-08-15 and its work is folded in below).

**Tier: not yet classifiable — classify when the instruction arrives** (per
`/adopted/standing-protocol-cache.md` 0d-ii, and state the classification before acting on it).
The grounding pass itself is read-only plus at most one `git` state check; nothing in it needs a
tier above `code-standard`.

---

## Step 1 — Read the standing opener, then apply this prompt's delta list

`operations/handoffs/founder/STANDING-SESSION-OPENER-grounded-foundations.md` — **Version
2026-08-15** (confirm the stamp; earlier stamp = stale checkout, `git pull` first). Read it in
full: the 2026-08-15 amendment box, the ⚠️ run box, Part B's "The window since 2026-08-12"
section, and the standing queue.

**The opener has NOT been re-versioned since 2026-08-15 morning, and the following points in it
are now stale — this delta list is authoritative where they conflict:**

1. **Push state is CLEAN through `b993b04`.** The founder pushed `02b6643`, `0941a47`, `9c48c42`,
   and `b993b04` on 2026-08-15 and confirmed **Vercel green**. The opener's Part B commit triple
   and queue item 24's "push if still unpushed" half are discharged. (The commit adding this
   prompt file may itself be unpushed when you open — if `git log origin/main..HEAD` shows only
   that one documents commit, that is expected; anything else, tell the founder before building on
   it.)
2. **New since the opener — read as the most recent close:**
   `D-PRUDENCE-GROUP-AND-SAGEPALS-AMENDMENTS-DOCUMENTED-2026-08-15` (decision log, 2026-08-15,
   incl. its addendum). It executed the founder-relayed 2026-08-14 mentor session instruction
   (`inbox/mentors brainstorming instruction.rtf`): **(a)** NEW record
   `operations/future-directions/2026-08-14-prudence-group.md` — the practice layer SagePals
   exists to support (five operational forms, six-stage sequence, credential structure, eleven
   placeholder fields named-not-built, five open questions); **(b)** three amendments to
   `operations/future-directions/2026-08-13-sagepals.md` — North Star = *innovation in service to
   the truth*, verifiable criterion = **examined assent**, task-declaration mechanism, and the
   governing design constraint **visibility is relational, not broadcast** (Seneca-to-Lucilius,
   not marketplace); **(c)** the **Layer 3 scoping session's scope is WIDENED** by a Stage 2
   reframing addition (relational context; role-not-relationship-type; examined-vs-assumed; R20d
   self-side boundary; four Stage 2 placeholder fields as design target) — **the session remains
   OPEN — awaiting ruling**, and the priority-index row matches. All documents-only; GS-ATRF-1/2/3
   untouched; Q11 undisturbed; weights BLOCKED.
3. **`operations/future-directions/` now holds two records** (SagePals, amended; Prudence Group),
   deliberately outside every arc. **The five Prudence Group open questions are that thread's live
   edge** — Q1 (who convenes the circle in which the guide is the bringer) and Q2 (the wiki
   second-order audit) flagged most pressing. They are carried **"into the next discussion with
   the mentor or with Claude"** — a discussion the **founder convenes**; do not pre-answer them or
   open it yourself.
4. **CLAUDE.md's C15 Item 3 line is STILL stale** ("uncommitted/undeployed" — false since
   `3e26dc9`, which is on origin/main with all three code files). Fix it in whichever next session
   edits CLAUDE.md; confirm rather than re-litigate.
5. **Expected strays (wider than the opener's Part A item 7):** besides the enumerated ones, ~12
   untracked 2026-08-12 handoff prompts, the three untracked c15 records, and the untracked
   08-01 opener archive all sit in the working tree — **untracked-until-elected is deliberate
   practice; do not "clean up" any of them**, and never treat another session's uncommitted files
   as yours to stage.

## Step 2 — Run the parallel-window pre-flight, fresh

`operations/handoffs/founder/2026-08-10-idea-loop-parallel-window-NEXT-SESSION-PROMPT.md`, steps
1–3, exactly as written. **Do not inherit a mode or cycle count from this prompt or from memory.**

- Snapshot at this prompt's writing (live-queried 2026-08-15): **15 completed cycles** — 11
  `winner` / 3 `dependency_unavailable` / 1 `null_cycle`; latest cycle 2026-08-14 06:08 UTC. The
  Mode 3 trigger range opens at **20 completed cycles** — this session may find the run in Mode 3
  territory. If the query shows ≥20 AND the founder confirms the runner has reported back, say so
  explicitly before anything else: **Mode 3 (the §6 report) takes precedence over any queued item
  and feeds the mentor before any standing-runner design.**
- Practical note, proven 2026-08-15: the pre-flight's read-only count can be run from the repo via
  PostgREST — production Supabase URL + service-role key from `website/.env.local` (the
  `jdbefwkonfbhjquozgxr` project is production; `.env.development.local` is TEST), filtering
  `idea_loop_cycles` on the run's `loop_id` (URL-encode `%3A`/`%40`/`%23`) and aggregating
  locally. Read-only SELECT only; never print the key.
- If a `*-CHANGE-SPEC.md` or `*-BLOCKED.md` file (other than the resolved
  `NOT-SELECTED-CHANGE-SPEC.md`) exists in the scratch project
  (`/Users/clintonaitkenhead/Claude-work/PROJECTS/idea-loop-validation-run/`) → **Mode 1**, read
  it in full first. Otherwise → Mode 2, ordinary work under the fences.

## Step 3 — Verify the working-tree and push state

```bash
git fetch origin && git log origin/main..HEAD --oneline && git status --short
```

Expected: empty or only this prompt's own authoring commit (delta item 1). Anything else unpushed,
tell the founder before building on its content.

## Step 4 — Confirm grounding with a short readback, then STOP

Post a readback of **no more than ~15 lines** stating:

1. Opener version read (2026-08-15) + this prompt's deltas applied, and the three facts most
   relevant to whatever the founder is likely to ask (your judgement — the guard collision, the
   three OPEN sessions with Layer 3's widened scope, and the run's current mode are strong
   candidates).
2. The parallel-window **mode** (1 / 2 / 3) from the fresh pre-flight, with the current
   completed-cycle count from the live query, not from any document.
3. Push state (clean, or exactly which commits await the founder's push).
4. Any **surprise** — anything found during grounding that contradicts the opener + this delta
   list. (The CLAUDE.md C15 line, delta item 4, is known — confirm, don't re-litigate.)
5. **Then: "Grounded. Ready for the instruction."** — and wait.

## What NOT to do in this session's opening

- **Do not** start any queue item, however ready it looks (item 11's RLS prompt is authored
  precisely so the founder can paste it into its *own* session when elected).
- **Do not** decide the byte-identity guard's scope — queue item 15, a founder/mentor call; it
  blocks six items and has been deliberately left to that call twice.
- **Do not** run any of the three OPEN scoping sessions (kathêkon; drift+melete; Layer 3 with its
  widened Stage 2 scope) — the "who runs them" ambiguity (queue item 23) is unresolved and they
  await the mentor.
- **Do not** pre-answer the five Prudence Group open questions or the Stage 4
  continuity-of-experience question — carried for the founder-convened discussion, explicitly not
  to be pre-answered.
- **Do not** touch the fenced surfaces (the three IDEA-loop flags, the watching vocabularies, the
  runner credential `527cc86b-…`, the four live route contracts, `idea_loop_*` schema) for any
  reason short of a Mode 1 blocking spec.
- **Do not** treat at-action frame timeouts as anomalies — ~79% loss is the measured, disclosed
  state of the channel (opener Part D); proceed deliberately when frames fail open.

## Context the instruction will likely assume (one-paragraph orientation)

The project is in P0 Foundations, 0h held (the founder's call, unchanged). The trust layer S1–S10
is live under MEASURE; weights are BLOCKED; ENFORCE is S11, readiness-gated. The IDEA-loop bounded
validation run is the most operationally live thread; its §6 report gates the ATRF scoping
session, the standing-runner design, S6's reordering decision, and the GS-ATRF-2 migration. Three
mentor-opened `governance` scoping sessions are OPEN and awaiting ruling — the Layer 3 one now
carrying the 2026-08-14 Stage 2 relational-context reframing. The byte-identity guard's scope
(queue item 15) remains the sharpest open decision, blocking six items including two
mentor-instructed edits. The future-directions thread (SagePals + the Prudence Group) is fully
documented as of 2026-08-15 with five open questions carried for the founder's next mentor
discussion — Q1, the guide's own examination, is the structural-integrity question ("a circle
whose guide is not subject to examination is a hierarchy with philosophical vocabulary").
GS-ATRF-1/2/3 remain open; nothing pre-answers them. The Q1 hard constraint — **the loop proposes;
it never executes** — is binding and doctrinally grounded (a proposal is a *phantasia*; the
election is the *synkatathesis*; Q1 ≡ L4 Q4.3 at two scales, and since 2026-08-14, the same
discipline applied to the output side is SagePals' examined-assent criterion).

---

**Forecast.** Success = the session reaches "Grounded. Ready for the instruction." within ~15
minutes, with a mode determination made from live data, the push state verified, and no work
started — so that the founder's instruction lands on a session that already knows what is live,
what is open, what is blocked, and why.

*End of prompt.*
