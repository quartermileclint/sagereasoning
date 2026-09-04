> **SPENT 2026-09-05** — items A–D executed (`2026-09-05-post-ruling-autonomous-work-CLOSE.md`); item E executed by the successor session (`2026-09-06-post-sweep-carried-items-CLOSE.md`, authored 2026-09-05 AEST). Founder-gated §4 items are carried in the standing opener's queue (Version 2026-09-05).

# NEXT SESSION PROMPT — post-ruling autonomous work, ordered by what needs no founder step

**Paste into a fresh session. Tier: `code-elevated`** (items B and D touch code; the rest is
`governance`). **Sections 2 and 3 need NO founder-walked step, no credential, no production read,
no migration, no flag and no spend** — that is the ordering principle. Section 4 is founder-only and
is listed last so it is not started by mistake.

**Written 2026-09-05** at the close of the session that built Option S, diagnosed Gate-2, and folded
two mentor rulings. **This supersedes**
`2026-09-05-autonomous-housekeeping-and-drift-enforcement-NEXT-SESSION-PROMPT.md`, which was written
before those rulings landed; its items survive here, re-ordered and updated.

---

## 1. Open

1. Read `/adopted/standing-protocol-cache.md`; `/CLAUDE.md` (the **count-discipline note** added
   2026-09-04 — and note the reading list now names **four** un-numbered manifest sections, the
   fourth being **The Prerequisite Criterion**, binding governance); `/manifest.md` targeted only.
2. Read the close: `2026-09-05-option-s-gate2-and-drift-enforcement-CLOSE.md`.
3. **`ListAgents` at open; `git status` at open and again before every staging.** Commits
   path-scoped; never `git add -A`.
4. **⚠ A PEER SESSION IS ACTIVE ON `operations/trust-layer-2026-07/` (the P6 / false-hold window
   track). Do not touch it.** The one exception already taken — bound **B4** in the S11 register —
   was mentor-mandated and is done; do not extend it.
5. **Standing fact:** on this shared checkout **a peer's push publishes your commits too**. The
   commit, not the push, is the point of no return. Never describe work as "committed but not
   published" as though that were enforceable.
6. **Do not re-derive from this prompt.** Every count here (perimeter, extensions, PR range) must be
   read from source. That is the subject of item A.

---

## 2. Autonomous work — in order. Nothing here needs the founder.

### A. Finish the count-discipline sweep — START HERE
**`governance` + possibly one test.** The project has now been bitten **four times** by a count in
prose going stale, and an instruction not to hand-maintain it failing to prevent recurrence. The
2026-09-04 session fixed two and **enforced** one with an assertion
(`docstring carries no hand-maintained perimeter count`, mutation-verified, suite 717/0).

**Do:** grep the governing and **public** surfaces for hand-maintained counts. **Prioritise the
public R18 surfaces** — `website/public/llms.txt`, `website/public/.well-known/agent-card.json`,
`website/src/app/api-docs/page.tsx` — because a stale count there is worse than one in CLAUDE.md.
Then the registry and any test docstring stating a figure its own arrays hold.

**Rules:** **do not rewrite dated historical bullets** — each was correct when written; annotate or
add a standing note (the 2026-09-04 precedent). **Prefer an executing assertion to a written
instruction** wherever it is cheap. Any public-surface wording change is **R18** and needs founder
sign-off before it goes live — draft it, do not apply it.

**Deliverable:** the drift list, the safe fixes, assertions where cheap, and a named list of anything
needing R18 sign-off.

### B. `/api/score-conversation` — the `format` field has no length validation
**`code-elevated`.** Named at the 2026-07-07 eleventh-route activation, never done. Confirmed at
source: `format` is destructured (`route.ts:108`) and used (`:201`) with **no length check at the 400
boundary**, while `conversation`/`context` are capped. The R20a distress composition already caps each
field at 15,000 chars, **so the perimeter is not exposed** — this is input validation, not safety.

**Why it was deferred:** it changes **always-on** behaviour (a new 400 path), so it is not flag-off
safe. **Still repo-only** — no migration, no flag.

**Required:** a test that fails before the fix and passes after; the route's existing battery green;
**PR19 independent review** (the route is inside the R20a perimeter, so PR19's widened scope binds).

### C. Diagnose the `/api/community-map` 42703
**`governance` — diagnosis only.** CLAUDE.md carries this as `community_map_pins.show_on_map`
missing. **That description is already partly stale:** the column exists in
`supabase-location-migration.sql`, and `api/community-map/route.ts:10` says the gate *"lives INSIDE
the view."* So the likely cause is a **view** predating the column or the ST1 degrade migration.

**Deliverable:** a root-cause note; if the fix is a migration, author it **without applying it**
(`§PRE`/`§APPLY`/`§VERIFY`/`§INVERSE`).

### D. PR19 the **rebuilt** Option S runner
**`governance`.** The 2026-09-04 rebuild folded 6 HIGH findings but **the reviewers only ever saw
version one.** The new logic — the floor-count estimator, the direction classifier, the M/W recovery
fields, the strata blocks, the K=10 fold — has had **no** independent review. R9 and R10 both record
that a second blind pass finds what the first missed.

**Do:** three parallel blind read-only reviewers on the rebuilt artifact only. Fold at the root;
withdraw over-claims at the head, not buried.

### E. `/CLAUDE.md` production-state refresh — LAST, only if time
**`governance`.** The block is dated 2026-09-03 and the 2026-09-04 addendum has grown long.
**PR18 governs:** close-time artifact, rewritten from the decision log, carrying its as-of date.
**Do not start this before A–D** — a half-done refresh is worse than a stale one.

---

## 3. Also autonomous, if A–E finish

- **The stale weekly environmental scan** (last 2026-06-22, named in CLAUDE.md). Scope it first —
  if it is a research task it is autonomous; if it needs live data it is not.
- **Verify the six decision-log entries appended at the 2026-09-05 close** read correctly against
  their verbatim records. They were written at close after being found missing; a second pass is
  cheap insurance.

---

## 4. Founder-only — do NOT start these

- **F1 — the Gate-2 timeout raise.** Hook `30→60 s` **and** `GATE1_TIMEOUT_MS`→~55000 **together**
  in `.claude/settings.local.json`. Raising only the inner value converts a logged fail-open into a
  *killed hook*. **Highest-value founder item:** the guard is unavailable 11–32% of the time
  (bound **B4**). **Lean mode is NOT the remedy and is ruled doctrinal** — do not set
  `GATE1_ACTION_TEXT_MODE`.
- **F2 — Path A.** One precondition left: run `EXTRACTION.sql` against production. If it returns
  **24**, correct the ruling's "20 cycle winners" **with a note naming the mechanism** (a
  reconstruction that missed the five no-winner cycles). Then elect and size the credential — K=10,
  ~240–290 calls, ≈$3.41–4.12, **quota units = calls × 2**.
- **F3** the `agent_hold_observations` sweep (hold — 138 live vs 130 frozen is live evidence);
  **F4** the `stoic-brain.json` citations (hold — byte-identity guard, P6's call).

---

## 5. What this session does NOT do

Does not run Option S, read production, mint or size a credential, apply a migration, flip a flag,
or change `.claude/settings.local.json`. Does not open R11 or any design sitting. Does not touch
`operations/trust-layer-2026-07/` or `operations/agent-circles-2026-08/d6a/` (frozen instrument), or
any file matching the byte-identity `GUARD_RE`. Does not apply a public R18 wording change without
founder sign-off. Does not rewrite dated historical bullets to make counts current.

## 6. Verification

```bash
cd "/Users/clintonaitkenhead/Claude-work/PROJECTS/sagereasoning"
git log --oneline -6
cd website && npx tsx src/lib/__tests__/r20a-invocation-guard.test.ts | tail -1   # expect 717 passed, 0 failed
python3 -c "import json;d=json.load(open('public/.well-known/agent-card.json'));print(len(d['capabilities']['extensions']))"  # derive, never quote
```

*Sections 2 and 3 are several sessions' work that need nothing from the founder. Start at A.*
