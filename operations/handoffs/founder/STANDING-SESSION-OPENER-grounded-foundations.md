# Standing Session Opener — Grounded Foundations

**Version 2026-09-05** (amends the 2026-08-29 version, archived at
`archive/2026-08-29_STANDING-SESSION-OPENER-grounded-foundations.md`; predecessors at
`archive/2026-08-15_…`, `archive/2026-08-12_…`, `archive/2026-08-01_…`).

> **How this version was grounded.** Written by a Fable 5.1 session on 2026-09-05 (Sat, AEST) that
> re-derived the whole 2026-08-29 → 2026-09-05 window from primary sources, **first-hand and without
> subagents**: every decision-log entry from `D-STANDING-OPENER-2026-08-29-UPDATE` to the physical
> tail (`D-SCORE-CONVERSATION-FORMAT-MOVE-DEPLOYED-LIVE-2026-09-06`, ~75 entries, read in full); the
> fourteen session closes dated 2026-09-03 → 2026-09-06-labelled; every open or recently-spent
> next-session prompt; the S11 register in full; the priority index's head and named-input register;
> the 2026-08-24 outstanding-questions register and its 08-30 addendum; the count-discipline
> directory; the standing protocol cache; and direct first-hand checks of git state, the R20a registry
> arrays, the agent-card extension count, the PR range by enumeration, `vercel.json`, the founder's
> dogfood `settings.local.json` (keys only — no token read), the live `gate1.log`, the false-hold
> buffer, and one unauthenticated public GET (`llms.txt`). Claims a repo session cannot verify —
> Vercel environment values, Supabase state, whether the founder has pushed — are marked
> **unverified** rather than restated. **The record's last activity is 2026-09-05 09:15 AEST**
> (`099b218`); at writing `git log origin/main..HEAD` showed **one unpushed records commit**
> (`099b218` — the founder pushes). Re-derive both facts at your own open.

**For the founder. Paste this as the FIRST message of a new session, then state your task beneath it
(or in your next message).** This opener grounds the session in the project's current state and the
trust-layer harness *before* any work begins, under the standard protocol. It is **reusable across
any task** — a preamble, **not a task**: read, confirm, then wait for the task. **The prioritised
session plan is the "Standing queue" section below; the first-priority session has its own
paste-ready prompt** (`2026-09-05-SESSION-1-r20a-perimeter-ordering-audit-SESSION-PASTE.md`).

---

## ⚠️ The facts every session in this window must know before anything else

1. **Production has changed six times since the 08-29 opener, all founder-walked or founder-pushed,
   all recorded, none reverted.** In order: the **verdict-variance disclosure** on the public R18
   surfaces + `TRUST_RECORD_ENVELOPE` (08-30/31 — n=100, 12%, Wilson 7.0–19.8%, per-probe leads, no
   directional split, the borderline class split, live-verified at all seven places); **provenance
   ledger slice 3** + the **404-contract alignment** (08-30/31 — served `provenance_gaps`, the ENV-1
   gate relaxed, live under the already-`true` `SUBSTRATE_PROVENANCE_LEDGER_ENABLED`; **unsetting
   that flag is NOT a rollback path**); **`/api/score/save` joined the R20a perimeter** (09-02,
   `SUBSTRATE_SCORE_SAVE_R20A_ENABLED=true`, 422 refusal, ten fields screened); the **PostgREST
   row-cap fixes** — founder-hub thread + C1 + C4, 24+ sites now exhaustive-read (09-03, code-only);
   **register D4 activated** (09-05, `SUBSTRATE_JUSTICE_SELF_CIRCLE_NARROWING_ENABLED=true` — a
   self-only-circle assessment emits no `dikaiosyne` justice event; **took-effect proven the same
   day** on a torn-down throwaway); and the **`/api/score-conversation` `format` length guard**
   landed (09-05, always-on, `4c1cd94`) **then MOVED behind the distress check** under a mentor
   ruling the same day (`0126645` + PR19 fold `97db750`; both on `origin/main`, Vercel green).
   **Three guards still precede that route's R20a block** (`conversation` max, `context` max, and the
   `conversation` **minimum** `<20` — the ruling's sharpest case: a 14-character cry for help still
   400s before the check runs). Rollback for the guard work is `git revert` of those three commits
   together, never a flag.

2. **A cluster of records is labelled one day ahead of reality — read past it, do not fix it.**
   Everything labelled "2026-09-06" or "2026-09-07" (the CLAUDE.md item-E block; the post-sweep
   close + prompt; the R20a ordering ruling verbatim; the environmental-scan scope; the audit prompt;
   the five decision-log entries headed 2026-09-06; the P6 BUILD prompt) was **authored on
   2026-09-05 AEST per git** (commits `aa4e567`…`099b218`, 05:31–09:15 +1000; the P6 BUILD prompt on
   09-04 19:57). Those sessions took the date from the conversation context. The labels stay (they
   are cited by filename); each file carries its true date in `git log`. **Date your own artifacts
   from `date` and `git log`, never from the context date** — the same error misdated three separate
   sessions this window (memory `date-artifacts-from-machine-clock`).

3. **The R20a perimeter-ordering ruling is binding and its follow-on is the ruled next step.**
   *"Purpose (b) governs for human-facing members of the perimeter. The distress check runs before the
   length guard on any route where the human crisis form is rendered."* The follow-on is a
   **perimeter-wide execution-order audit** (its own `governance` session; prompt authored; **a
   textual-position sweep was tried and discarded as unsound — do not resurrect its 20/10/13 split**),
   then a `code-critical` founder-walked remediation. Agent-facing members are governed by purpose (a)
   alone and must **not** be "fixed". Framing: *"inherited properties are not examined properties"* —
   report findings as accretion, not as anyone's error.

4. **The S11 track moved a long way and the flip is still REFUSED.** P1 ruled and discharged (the
   at-action verdict, filtered by Q3's kathekon threshold, is the table's per-action input; the
   sibling seam `interventionInputFromAtAction` is built dark, wired to nothing); D5 closed
   (`taskHasJusticeSurface` now REQUIRED at every call site); the H3 advisory no longer injects the S4
   recommendation; P6's purpose **widened** to measure the table's recommendation (derived at report
   time, never stored — the report script now prints both columns, PR19-folded); **D4 live and
   proven**; **D1's re-latch watch is OPEN and cannot discharge from harness traffic** (the close hook
   is seed-only and the row exists ⇒ 409 before emission — the 08-30 C2 finding, now cross-referenced
   in the register); **D2's priority is RAISED** (`credential-completed` still tags dikaiosyne on a
   self-only action — now an `increase` where D4 removed a cap); **bound B4** (guard availability
   11–32% on ordinary days, 60% on the 09-04 outlier; the remedy — `GATE1_TIMEOUT_MS=55000` + all hook
   timeouts to 60 s — is applied, its follow-up measurement **due ≥2026-09-08 UTC**); **F-3′** makes a
   bounded availability rate a **second window precondition** with its threshold **unset** (a P6
   design question). **The window therefore cannot start yet, and its start is one founder act with
   three names** — setting `GATE1_FALSE_HOLD_CAPTURE` is P8a's activation, the window start, the
   standing-runner track's "item D restoration", and the byte-identity guard re-arming, all at once.

5. **The standing-runner track has run three sittings (R8, R9, R10) and waits on founder elections.**
   The Option S gate is **item-level**: only the M/W/S floor-semantics election and R8-D7's sampling
   policy wait on its data; everything else is ungated and the session may open on the founder's act.
   **Option S is built and has never made a call**; a PR19 review found **four pre-run blockers**
   and one **mentor question pending relay** (should the directional decomposition exist at all — if
   removed, blocker B1 is moot); **Path A's one precondition is the production extraction** (F2).
   The twelve-environment agent architecture is REVISED-not-confirmed and **prospective in v1**;
   Q1 reaches any composed pipeline (assent at Threshold's handoff); environment agents accumulate no
   trust records in v1; Attic/Cellar not elected. Hold prompt:
   `2026-09-04-standing-runner-post-R10-grounding-and-await-NEXT-SESSION-PROMPT.md`.

6. **Concurrency produced this project's first real collision, and two practices now bind.** On
   2026-09-05 a peer's unscoped `git add` swept 187 lines of another session's decision-log entry into
   `468fcf9` under an unrelated message (content intact; history not rewritten). The standing cache's
   "zero actual collisions" sentence is annotated false; **whether this triggers the pre-commit-hook
   / PR26 escalation is the founder's call.** Standing practices: **a peer's push publishes your local
   commits** (the commit is the point of no return); **run `git status` whole, never truncated**;
   `ListAgents` at open (**three interactive peers at this writing**); path-scoped commits, always.

7. **CLAUDE.md is CURRENT through the 09-06-labelled item-E block** — a reversal of the 08-29 opener's
   fact 3 — and carries a 2026-09-05 grounding note pointing here. Its ~20 dated extension counts and
   every perimeter figure are **historical by design**; re-derive every count from source
   (`HUMAN_FACING_POST_ROUTES` / `SUBSTRATE_GATE_ROUTES` in
   `website/src/lib/__tests__/r20a-invocation-guard.test.ts`; the agent-card `extensions` array;
   PR1–PR25 by enumeration).

8. **Three mentor questions are pending relay and one R18 package awaits signature** — see the
   "Founder actions between sessions" list in the Standing queue. Nothing self-starts on them.

---

## Part A — Open under the standard protocol (Tier 1 — always; ~8–10 min)

Read, in order:
1. `/adopted/standing-protocol-cache.md` — session protocol, model selection (AC1), risk
   classification (0d-ii), the five-row AI-failure-mode table, the **concurrency check §6** (now
   carrying the 2026-09-05 collision annotation), the status vocabulary. **Process rules are PR1–PR25
   — verify by enumeration in `/adopted/project-instructions-snapshot.md`, do not quote this line.**
2. `/adopted/build-sessions-protocol-cache.md` — if the task is a substrate/trust-layer build.
3. `/adopted/project-instructions-snapshot.md` — PR19 (independent review REQUIRED — this window
   again shows independent review finding HIGHs first-hand review missed, five separate times), PR20
   as amended (timestamp-check present-tense mechanism facts at relay), PR25.
4. `/manifest.md` — targeted sections only: R0 + the **four** un-numbered mentor-directed sections
   (the Moral Community Boundary; the ATRF; the Consciousness and Continuity Obligation; **the
   Prerequisite Criterion, binding governance since 2026-08-29**); AC5 (note its internal
   contradiction, fact 7 of the queue below); AC7.
5. `/CLAUDE.md` — the 2026-09-05 grounding note, then the 09-06-labelled item-E block, then the
   "Live in production" list. Treat every count as a claim to re-derive.
6. `/operations/decision-log.md` — the last 3 entries at the **physical tail** (as of this writing:
   `D-STANDING-OPENER-2026-09-05-UPDATE-SESSION-PLAN-AND-RECORDS-HYGIENE`,
   `D-SCORE-CONVERSATION-FORMAT-MOVE-DEPLOYED-LIVE-2026-09-06`,
   `D-D4-TOOK-EFFECT-PROVEN-D1-WATCH-OPEN-RETRY-HELD-2026-09-05`). The head of the file is NOT the
   newest material (the placement note).
7. **The most recent close matched to your task:** S11 track →
   `2026-09-05-post-D4-live-op-cluster-CLOSE.md` and `2026-09-05-D4-activation-and-F3prime-CLOSE.md`;
   R20a / count-discipline → `2026-09-06-post-sweep-carried-items-CLOSE.md` and
   `2026-09-05-post-ruling-autonomous-work-CLOSE.md`; standing runner →
   `2026-09-04-standing-runner-design-R10-twelve-environment-CLOSE.md`; this grounding →
   `2026-09-05-grounding-and-session-plan-CLOSE.md`.
8. **`git status`** (whole) and **`git fetch origin && git log --oneline origin/main..HEAD`** — know
   the pending tree and whether anything is unpushed. Expected at this writing: a clean tree; HEAD at
   or after `099b218`; nothing ahead of `origin/main` once the founder has pushed. Never stage another
   session's files.
9. **`ListAgents`** — note the peer count before writing anything.

*Tier 2 (task-dependent):* the day's deliverable in full; for the S11 track,
`operations/trust-layer-2026-07/S11-FLIP-PREREQUISITES-REGISTER.md` **in full** plus
`2026-08-15-false-hold-new-window-scoping-note.md` §2.4/§3/§7; for the standing-runner track,
`operations/primal-substrate-2026-08/00-PRIORITY-INDEX.md` §"Named inputs" (the register) and the
R9/R10 designs' head-of-document withdrawals and RULED addenda; for the R20a ordering work,
`operations/count-discipline-2026-09/` (the ruling verbatim, the two mentor questions, the R18
package, the Option S findings) and `2026-09-07-r20a-perimeter-ordering-AUDIT-NEXT-SESSION-PROMPT.md`;
for anything in the agent-circles/ATRF/EE/provenance line, `operations/agent-circles-2026-08/` (the
mentor verbatims are canonical — **verbatim wins over every summary including this one**).

---

## Part B — Ground in the current project state (confirm you can state these)

### Production state — what is live beyond the 08-29 opener's list

The substrate is live at `www.sagereasoning.com`. Everything the 08-29 opener listed as live remains
live. **New or changed since 2026-08-29, in rough order of consequence:**

- **The R20a perimeter is 43 route-level + 2 substrate-gate members** (re-derived 2026-09-05 from
  the registry arrays; 31 flag-pair entries across 30 flag-gated routes + 13 unconditional). The
  43rd is `/api/score/save` (09-02). **The perimeter count is now enforced, not warned:** the guard
  battery asserts that no hand-maintained count appears anywhere in its own comments (RA-2 closed
  09-04; widened 09-05 after two body-position counts were found beside the corrected assertions —
  *"a guard scoped to where the last instance happened does not arrest the class"*); the same battery
  now strips comments before every per-route import check (a commented-out safety import used to
  pass — mutation-proven both ways; guard **722/0** at this writing).
- **`/api/score-conversation`** — the `format` length guard (always-on 400 above `TEXT_LIMITS.long`)
  now sits **after** the R20a block and before `domainContext`; pinned by a brace-matched
  block-end anchor (FV-6a–d) after three PR19 reviewers found the first pin anchored on the block's
  *opening*. The `conversation`/`context` max guards and the `conversation` min guard still precede
  the block — **non-conformant under the ruling, carried to the audit.** The authenticated live smoke
  of the new ordering (an oversized distressed `format` should now redirect, not 400) has **never
  been run** — needs a Bearer JWT (memory `human-routes-bearer-jwt-console-smoke`).
- **D4 live** (`SUBSTRATE_JUSTICE_SELF_CIRCLE_NARROWING_ENABLED=true`, 09-05, `99e9603`): the
  reducer withholds the dikaiosyne justice emission for self-only-circle assessments, symmetric across
  all four outcomes per M-1. Proven by a three-legged took-effect test (`indeterminate` path only;
  `violated`/`met` un-exercised). The predicate deliberately does **not** receive the flag — passing
  it would empty `loop_fold`'s live `self_regarding` bucket and falsify the R18 claim at
  `llms.txt:548`. D4 does not close D1's full-ledger-replay caveat.
- **The row-cap arc is closed** (09-02 → 09-03): the founder-hub thread truncation (1,013 rows,
  the mentor re-answering row 1000) fixed with keyset pagination + a "Load earlier messages"
  affordance; two shared primitives (`website/src/lib/db/paged-select.ts` — `pagedRows` keyset;
  `pagedRangeSelect` offset, with a disclosed ordering residual); C1 (cost-alerts, abuse, SLO,
  admin-metrics — H10/H11 were truncating live) and C4 (all data-rights + store reads) live. Two
  deliberate exceptions: `provenance-ledger-store.ts` (WATCHED) and C5 (Stripe-gated). A
  `REQUEST_VELOCITY_LOOKBACK_HOURS: 24` bound was added to abuse detection. The
  `/api/practice/discernment` route now writes `route_errors` on both catch paths (the 63
  historical `ELICIT-OUTAGE` 503s remain unrecoverable without founder Vercel-log access).
- **Provenance ledger:** slice 3 + the 404-contract tail live (08-30/31); `provenance_gaps` served
  at `data.record.provenance_gaps` (empty for every agent until slice 5 enforces — the empty-state
  note says so); `/limitations` gained a trust-record section. **Switch-on scoreboard: C1 ✅ (empty
  population, re-check at switch-on is a HARD obligation) · C2 ✅ (discharged on SCOPE's pre-ledger
  exclusion after the project's own population premise was found wrong) · C4 ✅ · C3 ⏳ the 90-day
  soak from 2026-08-26 → ~2026-11-24. Slice 5 is not to be opened before that.** The C2 finding
  also established that **the harness close hook can never produce a classifiable write on the
  existing `s9-loop` row** (seed-only, 409 before emission) — the same fact that keeps D1 open.
- **The verdict-variance disclosure is live at seven places** (08-30/31, five applications in three
  days; battery 156/0 at the last count; every figure re-derived from raw probe records):
  `/api/guardrail` 12% aggregate disagreement, Wilson 95% CI 7.0–19.8%, n=100, per-input crossings
  0/0/2/2/8 of 20, no directional decomposition, the class limit at K=20, composition dependence
  published beside it, the borderline population split (grave-vocabulary traffic vs near-boundary
  inputs), role-blindness reclassified a confirmed design deficiency, `/api/reason`'s rate stated
  unmeasured. D6a's runs are frozen evidence (`operations/agent-circles-2026-08/d6a/`) — **never
  "refresh" the figures.**
- **The at-action seam** (`at-action-seam.ts`, 09-04) is built dark and wired to no live caller;
  its first consumer is S11 G6(a) work, which is refused. **D5 is closed** (the flag is REQUIRED;
  the two live `false` call sites are load-bearing and must not be flipped). **The H3 advisory line
  `S4 measure-mode recommendation: …` is gone** from the injected frame (aggregate line stays; the
  observation relocated to the log and the API). **The P6 report script** prints classification
  and recommendation columns, split by population, with four bounds printed on the rate and a v3/v4
  lift check that aborts (PR19: five reviewers, one HIGH — an arithmetic-identity "target MET" —
  removed; six vacuous pins rebuilt; battery 74/0). Over the frozen 130 the P1 filter moves exactly
  one record; **Q2's zero-false-positive floor was restored by the S11b reducer narrowing of
  2026-07-18, not by P1.**
- **The founder-loop harness config** (read first-hand, keys only): `GATE1_TIMEOUT_MS=55000`; hook
  timeouts `UserPromptSubmit` 60 s, `PreToolUse Task|Agent` 120 s, `PreToolUse Bash|Edit|…` 60 s,
  `PostToolUse Task|Agent` 60 s, `Stop` 60 s; `GATE1_FALSE_HOLD_CAPTURE` **absent** (window not
  started; byte-identity guard dormant; `stoic-brain.ts` freeze + SHA pin unconditional);
  `GATE1_ACTION_TEXT_MODE` absent (composed — lean mode is ruled **doctrinal**, not an operational
  preference); `GATE1_TELOS_LINE_ENABLED=true`; `GATE1_CLOSE_CONTENT_VARIATION_ENABLED=true`;
  `SAGE_GATE1_REFLECT_PERSIST_ENABLED=true`; `GATE1_STATE_DIR=/Users/clintonaitkenhead/.sage-gate1`.
  The false-hold buffer holds **138** v1 records, of which the frozen file is an exact 130-record
  prefix (`runs/2026-07-17/FREEZE-NOTE.md`).
- **The public assessment contract is still broken on three served surfaces** (`llms.txt`,
  `agent-card.json`, `skill-registry.ts` document 11/37/7 assessments and a phantom `SO-01` id
  against a live 14/55/8 — the routes return 400 on the documented shape; ~5 months old; exposure
  nil pre-0h). **Re-confirmed served live by unauthenticated GET on 2026-09-05.** The eleven-edit
  R18 package + a drift assertion are drafted and verified both directions; **apply wording and
  assertion as one change, on the founder's signature.** `api-docs/page.tsx` documents a request
  shape neither assessment route ever accepted — a separate R18 rewrite.
- **`environmental_context` has no producer.** Six crons are scheduled and none is the weekly scan;
  no route writes the table; two live perimeter routes (`/api/skill/sage-classify`,
  `/api/skill/sage-prioritise`) read it into the LLM user message; the loader is fail-safe on
  `last_scanned`. Severity turns on one founder-run query; the disposition (deliberate P7
  scaffolding vs unfinished wiring) is a purpose question, deliberately not recommended on.
- **`/api/community-map` 42703** — fixed and live since 2026-08-03 (`f198736`); its carried cause
  ("column missing") was wrong; the CLAUDE.md bullet is annotated. Lesson carried: re-derive a
  carried item's cause before trusting its priority.

### Verified first-hand at this writing (2026-09-05, AEST morning)

| Claim | Check | Result |
|---|---|---|
| Git state | `git status`; `git log origin/main..HEAD` | clean tree; **`099b218` unpushed** (records only) |
| R20a route-level members | count of quoted entries inside `HUMAN_FACING_POST_ROUTES` | **43** |
| Substrate-gate members / flag-pair entries | `route:` keys inside the two other arrays | **2** / **31** |
| Agent-card extensions | `len(d['capabilities']['extensions'])` | **26** |
| Process rules | headings enumerated in the snapshot | **PR1–PR25** |
| Scheduled crons | `vercel.json` | **6** (none is the environmental scan) |
| Harness config | `settings.local.json` keys | as listed above; `GATE1_FALSE_HOLD_CAPTURE` absent |
| Guard log since the timeout raise | `gate1.log` after the last `28000ms` line | 83 guard events, **1** outage (`55000ms`) — an early indication, **not** B4's measurement |
| False-hold buffer | `wc -l` | 138 |
| Stale assessment contract | unauthenticated `curl` of the live `llms.txt` | still served (`11 assessments`, `SO-01`, `37 assessments`) |
| D4 flag / any Vercel value | — | **unverified** from a repo session (recorded at activation, founder-observed) |
| Supabase state (ledger counts, `justice_floor_active`) | — | **unverified** here; last read 2026-09-05 by the D4-proof session |

### The window's method lessons (fresh instances, all this window)

- **Independent review found what first-hand review missed — five more times.** The `format` guard's
  own tests (two HIGH: a commented-out check passed; an inline array literal was parsed); the move's
  ordering pin anchored on the block's *opening* (three reviewers converged); the P6 column's
  "target MET" arithmetic identity + six vacuous pins; Option S's first version (6 HIGH) and second
  (4 pre-run blockers); R9's three and R10's eight structural over-claims, one a false source claim.
  **PR19 is not a formality here, and self-review that checks *presence* rather than *strength* of a
  constraint misses the relaxations.**
- **Checks calibrated to expectation rather than to the specification.** One session wrote six
  miscalibrated checks and caught all six itself; the discipline that saved it was discarding the
  unsound result rather than publishing it (which the mentor commended by name).
- **Date from the machine, not the context** (fact 2). **A carried item's stated cause is worth
  re-deriving before its priority is trusted** (community-map). **A guard scoped to the last instance
  does not arrest the class** (the perimeter count, fifth recurrence). **Rulings issued to two tracks
  on one day can carry a condition that belongs to only one** (the v3/v4 lift check landed in the
  Path A ruling; caught at provenance). **Re-relaying an answered question without its ruling
  attached risks a divergent second ruling** (the ordering ruling's second relay was consistent; the
  cheap mitigation is to attach the prior ruling).
- **Under an ENFORCE deny, an agent softened four phrases toward what the classifier would pass
  without deciding to** (D4 close §8b) — the failure mode the instrument cannot see, because it keeps
  verdicts, not the drafts shaped to earn them. **Read the grounds of every guardrail caution**
  (sparse-extraction ×2 and a genuine engine outage appeared in one session and would have been
  flattened by habit); a deny is ENFORCE and is honored; an outage is not a deny.
- **The harness capture was run before the P8a build was recorded in the register** — a
  present-tense mechanism fact ("the guard path writes no record") stayed in the register 19 days
  after it became false and was inherited by a scope document. PR20's timestamp check earns its
  place on carried items, not only on relayed ones.

### Threads (updated)

1. **Trust Layer / S11** — see fact 4. Register:
   `operations/trust-layer-2026-07/S11-FLIP-PREREQUISITES-REGISTER.md` (P1 discharged; P2/P3
   landed; P4/P5/P6 open; B1–B4; D1 open with its C2 cross-reference; D2 raised; D3 standing; D4
   live+proven; D5 closed). **The window's two preconditions:** P8a activation (= the window start)
   and a bounded guard-availability rate whose threshold is a P6 design question. B4's follow-up
   measurement is due **≥2026-09-08 UTC** (≥3 days of ordinary traffic after the 09-04 ~19:00 UTC
   raise). **The S11 flip is REFUSED, MEASURE throughout, weights BLOCKED.**
2. **Standing runner / agent circles** — see fact 5. Founder elections standing (R9 §16): Path A;
   the build brief's second increment; the A2 engine change (gated on item D); item D's restoration
   (= the window start); the ATRF item-3 amendment draft; the vocabulary-direction recommendation;
   the two unoccupied-room heuristics (not elected by Q-F); the v2 chooser; the
   environment-sensitive indicator (a mentor question if ever wanted); **a harness identity with an
   examined record for the v1 executing actor** (the binding prerequisite three findings converge
   on). R11 is the founder's to open. O-C Gate 3 is **CLOSED** (ruled 09-03; its §11 items named
   to this track). Route (i) scoped 09-03 with a mentor question pending (recommendation: elect item
   2b, defer route (i)).
3. **R20a perimeter + website** — see facts 1 and 3. Also open: the `/api/score/save`
   local-storage bypass (§6(b) — no in-app way to change storage mode after the first choice);
   `api/mentor/private/reflect/route.ts:660`'s body-supplied `user_id` (founder-ordered first of
   the named-unbuilt list on 08-24, still unbuilt); the view-grants remediation migration
   (authored, not run) + the escalated `vulnerability_flag_owner_view`; `triggered_rules`
   encryption; M-5(b) identity threading; 15 of 22 routes without per-route invocation tests; the
   `mentor_profiles` decrypt failure; `founder_conversations` plaintext-at-rest + no data-rights
   wiring (two LOWs); `stoa-boundary` battery RED since 08-03 (awaiting ruling #20).
4. **Count discipline / R18** — the assessment-contract package (signature owed); the api-docs
   rewrite; the manifest AC5 contradiction (bolds "does not hand-enumerate" then enumerates all 43 —
   counts correct today; a governing surface, the founder's); the same false claim in
   `D-RA2-CLOSED-PERIMETER-COUNT-ENFORCED-NOT-WARNED-2026-09-04`.
5. **Provenance ledger** — C3 clock only; the switch-on re-check is a hard obligation; the 454
   pre-stamp consults are repairable by no ledger; item 2b carried.
6. **Reflections / close hook** — case 2 (the consult-verdict path) still unobserved, a founder
   decision pending on one disclosed constructed test case; IW-7 opening 2 HELD by ruling.
7. **Founder hub / mentor continuity** — the row-cap fix live; the continuity-window question
   (`operations/founder-hub-2026-09/2026-09-02-mentor-question-continuity-window-FOR-RULING.md`)
   pending relay, gated on the founder's own reading of the contamination-window verbatim (rows
   1001–1013, incl. the 08-31 corrected ruling generated without sight of row 1001).
8. **Future directions** (recorded, not build items): SagePals / the Prudence Group (Stage-3 scoping
   not convened); the engine-evolution examination; the incubation entry type; melete (needs an
   agent-side rehearsal surface).

### The 0h launch hold-point

**Unchanged in substance.** P2's verdict stands; the founder's three branches remain the standing
decision; the 2026-08-22 sequencing stands (all current tasks complete before any 0h assessment).
Nothing in this window bears on the call. **Weights BLOCKED throughout** (GS-CYB-1's two-condition
gate + the Prerequisite Criterion). **The Q1 hard constraint holds: the loop proposes; it never
executes** — and now reaches any composed pipeline on this harness (Q-B, 2026-09-04).

---

## Standing queue — the prioritised session plan (as of 2026-09-05; none self-starts)

**Ordering principle:** each session removes a blocker for the next or closes a live harm class;
autonomous sessions lead where the founder's action is not on the critical path; founder-attended
work is batched so one sitting discharges many gates; every session is sized to one context window.

### A. Founder actions between sessions (no session needed — each unblocks something)

| # | Action | Unblocks |
|---|---|---|
| F-1 | **Push `099b218`** (and this session's records commit) via GitHub Desktop | the record's visibility to peers; nothing deploys |
| F-2 | ~~Relay the Option S decomposition question~~ **RULED 2026-09-05 — the decomposition is REMOVED; B1 moot; correct `option-s-runner.py:45` before any spend** (`count-discipline-2026-09/2026-09-06-mentor-question-option-s-directional-decomposition-FOR-RULING.md`) | S6 (Option S pre-run fixes) → Path A → the M/W/S election |
| F-3 | ~~Relay the route (i) question~~ **RULED 2026-09-05 — elect 2b now; route (i) NOT built; flag-and-proceed if ever** (`agent-circles-2026-08/2026-09-03-MENTOR-QUESTION-route-i-what-is-l1-supply-for.md`) | S7 (item 2b, `l1_supply` out of the ecosystem preset) or route (i) |
| F-4 | **Sign the R18 assessment-contract package** (`count-discipline-2026-09/2026-09-05-R18-assessment-contract-SIGNOFF-PACKAGE.md`) — or say what to change | S2 |
| F-5 | **Run the one `environmental_context` query** in `operations/2026-09-06-environmental-scan-staleness-SCOPE.md` and say whether the two call sites are deliberate P7 scaffolding | the item's disposition (S8 or a route session) |
| F-6 | **The two `/api/score-conversation` smokes** (oversized `format` → 400 on a benign conversation; oversized distressed `format` → the crisis redirect) — Bearer JWT; can ride S3 | closes the last unobserved live property of the guard work |
| F-7 | **Decide the manifest AC5 fix** (remove the enumeration, or remove the bolded claim) | a governing-surface edit any session can then apply |
| F-8 | **Decide the concurrency escalation** after the first collision (pre-commit hook / PR26 / leave as convention) | the standing cache's §6 |
| F-9 | **TEST parity, one sitting:** the ATRF-EE Step-0 read-only determination on TEST; TEST's `project_context` row (v1.4.0 parity) | removes two "undetermined" carries |
| F-10 | **Path A's production extraction** (`option-s/EXTRACTION.sql` §PRE/§2/§3) — only after F-2's ruling; if it returns 24, the ruling's "20 winners" gets a correction note | S6's run |
| F-11 | ~~Relay the mentor-continuity question~~ **RULED 2026-09-05 on shape (session-bounded context channel; tell the mentor what it cannot see). STILL OWED, the founder's alone: Q4 — read rows 1001–1011, decide whether the 08-31 corrected ruling stands, recover any uncaptured ruling** | the founder-hub `MENTOR_HISTORY_WINDOW` decision |
| F-12 | **Relay the mentor's reception of R9/R10** at your cadence; elect from R9 §16 if you wish | the standing-runner track |

### B. Sessions, in priority order

1. **S1 — The R20a perimeter-ordering AUDIT. RUN 2026-09-05 — see `2026-09-05-r20a-perimeter-ordering-audit-CLOSE.md` (16 non-conformant / 27 conformant / 2 not reached; S3 unblocked, prompt authored).** `governance`, **autonomous**, ruled. Classify every
   route-level member on two axes (realistic caller; rendered form at the actual
   `renderR20aRedirectResponse` call site) and record each human-facing member's **execution order**
   by control-flow tracing — never textual position; establish the real set of bounding forms from
   source; say whether the ruling reaches the 2 substrate-gate members; check provenance with
   `git log -L` before characterising anything; disclose any route whose order cannot be established
   by reading. **Changes no route.** Paste:
   `2026-09-05-SESSION-1-r20a-perimeter-ordering-audit-SESSION-PASTE.md` (the method prompt it
   executes: `2026-09-07-r20a-perimeter-ordering-AUDIT-NEXT-SESSION-PROMPT.md`). **Unblocks S3.**
2. **S2 — R18 corrections.** `code-elevated`; short; **the founder signs at open** (F-4). Apply the
   eleven wording edits **and** the drift assertion as one commit
   (`assessment-contract-drift.test.ts` moves out of `.draft` in the same change; expect 13/0 after,
   26 extensions unchanged); draft the `api-docs/page.tsx` assessment-entry rewrite (both routes take
   `{agent_id, responses:[…]}`, neither reads `scenario`), sign, apply; `tsc`; `npm run build` (a
   `page.tsx` changes); push is the founder's; **live `curl` after the push** (this arc's defects
   were repeatedly found only that way). Closes a five-month broken public contract.
3. **S3 — Perimeter-ordering REMEDIATION. GROUP 1 LIVE 2026-09-05 (`c679739`, eight smokes green incl. F-6 — see `2026-09-05-r20a-perimeter-ordering-remediation-session3-CLOSE.md`); Groups 2–3 remain.** `code-critical`, **founder-walked, PR19 required**;
   after S1. Start with `/api/score-conversation`'s three remaining pre-block guards (the `<20`
   minimum first), then the audit's human-facing non-conformant list in the audit's own priority;
   each move pinned by an execution-order anchor of the FV-6 brace-matched shape (a textual anchor
   passed green while the harm was reproduced inside the block); mutation-verify against the
   demonstrated bypasses; bundle F-6's two smokes into the walk. Agent-facing members untouched.
4. **S4 — Window-start readiness.** Read-only autonomous half + one founder act; **not before
   2026-09-08 UTC.** (a) B4's follow-up measurement from `gate1.log`, method unchanged, reporting the
   three things B4 names (per-day outage rate vs the 11–32% baseline; whether any residual reports
   `55000ms` vs a killed hook with no line; distinct sessions per day); record it **in the B4 cell**.
   (b) Propose the availability **threshold** F-3′ leaves unset (a P6 design question — draft for
   founder election, mentor if the founder elects). (c) Confirm both preconditions and that S5's
   answer does not require an engine-class edit before the window (an engine edit after the window
   opens contaminates it: the byte-identity guard re-arms on the same flag). **(c′) RULED 2026-09-05
   (mentor reception of R9/R10, E5): S9's harness-side redaction must LAND BEFORE (d)** — restoring the
   flag before redaction *"would accumulate records that mix genuine outages with injection-caused
   blindness, which the B4 measurement cannot distinguish."* (d) Then **the founder**
   sets `GATE1_FALSE_HOLD_CAPTURE` — which is P8a's activation, the window start, item D's
   restoration, and the guard re-arm in one act — and the ≥7-day representative window runs.
5. **S5 — D2 scope-for-ruling.** `governance`, autonomous, **before S4(d)**. The domain-tagging
   mis-attribution (`computeVirtueDomains` still tags dikaiosyne engaged on a self-only action →
   `credential-completed` emits an `increase` into dikaiosyne with no circle test,
   `derive-trust-events.ts:86-99`); scope the remedy's *location* (engine — measured surface, window
   contamination and the byte-identity guard bite; vs reducer — `code-critical`, window-neutral) and
   its relation to M-1's ruled destination (phronesis/sophrosyne); PR20 mechanism facts; put to the
   mentor. Mirrors the P1 scope-for-ruling shape.
6. **S6 — Option S pre-run fixes, then the run.** `code-elevated` + PR19 for the fixes; the run is
   founder-elected spend. **F-2 RULED 2026-09-05: B1 is moot; correct `option-s-runner.py:45` before any spend; publish per-probe distributions.** Then B2 (the floor set must include `habitual` — the live
   block set at the `deliberate` threshold), B3 (an ordinal proximity scale; a deterministic even-K
   median convention; true worst-of-K), B4 (a `proceed` flip via `tier1_pause` must count), and B1
   or its removal; add resume/idempotency and the six D6a safeguards the reimplementation dropped;
   have `summary()` read `option-s-candidates.json`. Then F-10, then the founder-elected run
   (≈$3.41–4.12, quota = calls × 2), then the M/W/S + R8-D7 brief carrying the closed-run-population
   limit. **Do not spend before the fixes.**
7. **S7 — Item 2b** (`l1_supply` narrowed out of the `ecosystem` preset). `code-critical`,
   founder-walked, PR19. **ELECTED by the 2026-09-05 ruling (F-3); route (i) NOT built.** Verify the
   population is still zero at open (`active_with_l1_supply = 0` on 08-25).
8. **S9 (NEW, ruled 2026-09-05 Part 4) — harness-side schema-token redaction + the masked-200 `route_errors` row.** `code-elevated`. The at-action composer and the elicitation capture replace every `schema_field_injection` token with a category placeholder (`⟨schema-field⟩`), log the replacement count per call, and the harness docs name the rule; `/api/reason`'s Branch-2 fallback writes a `route_errors` row. **Inside the measured surface, and NOW A PRECONDITION OF THE WINDOW START (mentor reception 2026-09-05, E5: redaction → restoration → accumulation) — land BEFORE S4(d); the "or after the window" branch is closed.** Memory `harness-blind-on-substrate-sessions-a11b-schema-tokens`; verbatim `2026-09-05-mentor-rulings-five-relays-verbatim.md`.
9. **S10 (NEW, ruled 2026-09-05 Part 3) — founder-hub mentor continuity.** `code-elevated`. A session-bounded, token-budgeted history fetch with a hard cap (the `MENTOR_HISTORY_WINDOW === 20` pin changes only by a diff citing the ruling); a system-prompt line telling the mentor what it cannot see. **Precondition: F-11's Q4.**
10. **S3 gains Group 2b (ruled 2026-09-05 Part 5)** — the three P′ presence-on-sibling-field sites and the O cases where the screened text is present; see the remediation prompt's ruled addition. J/A/F are outside the principle.
11. **S8 — Records fold + governing-surface edits on election.** `governance`: the CLAUDE.md
   production-state block per PR18 after S2/S3 change production; the AC5 fix per F-7; the
   environmental-context disposition per F-5; retire any spent prompts this plan has closed. Batch
   with whichever of S2/S3 lands first rather than running alone.

### C. Held / gated — do not open

Slice 5 (C3 clock → ~2026-11-24, then the hard C2 re-check); IW-7 opening 2 (signal-quality gap);
Spec 4 dispersion (M-4 restoration); the hegemonikon uniformity family (unruled); melete; the
Prudence Stage-3 scoping session; Layer 3 activation (`SUBSTRATE_LAYER3_ENABLED` unset; O-C Gate 3
CLOSED; per-consumer rendering owned by the standing-runner track's next session); R11 (the founder
opens); Attic/Cellar heuristics (founder-walked, own scoping session); the `agent_hold_observations`
sweep (HOLD by ruling until P6 says the buffer is finished with); the `stoic-brain.json` citations
(HOLD — P6's call; the guard is dormant today but the freeze on `stoic-brain.ts` is unconditional);
Resend / ST7; AE-3 (deferred, preconditions unmet); the S11 flip; the 0h call; **weights**.

### D. Longer-tail named-unbuilt (unchanged; re-derive before acting)

The view-grants migration + the escalated view; `triggered_rules` encryption + M-5(b); reflect
`route.ts:660` `user_id` (founder-ordered first); close-hook case 2; R3 (`/api/reason` status
masking; input-cap steps 2/3); R7 (permission-scrutiny 14–17); C5 (Stoa reactivation guard, ruled
M3); the `/api/score` local-storage bypass; `founder_conversations` LOWs; the `mentor_profiles`
decrypt failure; the CLAUDE.md dated bullets (never rewritten — annotated only).

---

## Part C — The trust-layer harness + its capabilities (deltas since 08-29)

On top of the 08-29 opener's Part C (all of which stands):

- **The trust record's envelope grew again:** the verdict-variance `does_not_attest` item (verdicts
  are draws from a probabilistic Layer-1 extraction; the signature attests the deterministic Layer 2
  given that extraction — the rate rides as a dated, path-qualified literal); the served
  `provenance_gaps` + `total_provenance_gaps_count` (empty until slice 5, with the note saying so);
  the 404 contract now names both halves of the gate (no examined evidence AND no servable gap
  entry), conditional on the read having run.
- **The reducer is self-circle-narrowed live (D4)**; the predicate and reducer now diverge
  *deliberately in the opposite direction* from before (Arms 2–4 still ENGAGE a self-only violated
  obligation; engagement ≠ emission) — do not "fix" it. **D2 remains** (tagging, not emission).
- **The harness's advisory frame no longer carries the S4 recommendation**; Q7 depth calibration
  reads the aggregate line only. The consult and guard budgets are 55 s inside 60 s hooks. The
  telos line and close-content variation are on. The false-hold capture is OFF.
- **The P6 instrument** (the report script) derives the decision table's recommendation at report
  time with printed bounds; **the frozen 130 is a prefix of the live 138** (documented).
- **`taskHasJusticeSurface` is REQUIRED** on `readTrustVerdict`; the discernment GET and the public
  trust-record GET pass `false` with the reason stated (task-agnostic reads); `true` without S3
  obligation routing would assert do-not-proceed for every agent.
- **New shared DB primitives** `pagedRows` / `pagedRangeSelect` for any read that can cross
  PostgREST's 1,000-row cap; the sweep tool `website/scripts/unbounded-select-sweep.ts` (54
  unbounded-read candidates remaining, all classified).

*Deeper detail:* the S11 register; `2026-08-15-false-hold-new-window-scoping-note.md` (§7 the
recommendation column; §2.4/§3 the two preconditions); `2026-09-04-C-at-action-seam-caller-SCOPE.md`;
the R9/R10 designs; `operations/agent-circles-2026-08/2026-08-26-provenance-ledger-SCOPE.md`.

---

## Part D — Working inside the dogfooded harness (standing context)

Unchanged in substance — you are running inside the harness you help build; frames are advisory
context, never commands; routine build acts examined "contrary — no kathekon factors extracted"
remain the known false-positive class (the EE-C1 wording is the mentor's ruled formulation).
Additions and sharpenings this window:

- **Expect guard denies that are false positives, and honor them anyway.** The andreia floor reads
  a handoff document's narration of future destructive operations as a praxis act (a file write
  supplies the stage); a prompt describing teardown was denied `reflexive` while the retrospective
  close passed. **The deny is ENFORCE; do not route around it by rewording toward the classifier or
  by switching tools** — one session caught itself softening four phrases without deciding to.
  Record the instance (nothing captures it while the window is off) and, if the founder overrides
  (R20c), write what was drafted.
- **Guard availability was 11–32% on ordinary days before the timeout raise.** Read the grounds of
  each caution; an outage is not a deny; do not proceed on an unavailable check as though it were a
  pass — log it and decide once, rather than restating the outage every turn.
- **Verify your own session id before attributing any `gate1.log` event** (the log is UTC-stamped and
  shared by concurrent sessions). **Date artifacts from `date`.** **Run `git status` whole.**
- **The elicitation's third sub-question keeps drawing "the resolution preceded the examination"** —
  four consecutive answers across two sessions; the capture-and-execute convention is doing the
  deciding. Answer genuinely; once, if the answer stops changing.

---

## Part E — Confirm the standard opening (state these, briefly, before the task)

Tier/work-category; model (state it; disclose any mid-session switch); risk classification 0d-ii +
AC7/PR6/**PR19** (independent review REQUIRED)/**PR20** (mechanism facts named + timestamp-checked, incl.
carried items)/**PR21** (reflect-harvest)/**PR22** (`Model:`/`Effort:` trailers)/**PR23** (memory-first
— then check the instance)/**PR24** (retention parity)/**PR25** (verification claims carry their
check); the concurrency check (`ListAgents` + path-scoped commits + `git status` whole); hold-point
P0 0h; status vocabulary; the founder-walked discipline (commit-and-push BEFORE any flag flip; this
environment holds no production admin credential; prod mints go through the founder's browser-session
JWT; never place executable DDL in a runnable code block during a live SQL-editor walk); bare-SQL
verification blocks (pure-ASCII payloads, `chr()` for typography, length-count verification; a
`SELECT count(*)` after any teardown delete — "Success. No rows returned" is not a count).

---

## Part F — Now state the task

With the foundations in place, **state the task** (if you haven't already). The session will then:
declare its tier + risk for that task, read the task-specific deliverables (Tier 2), check the
standing queue for collisions with in-flight watches (the C3 clock; B4's pending measurement; the
window's two preconditions; the three peer sessions), and proceed under the protocol — grounded,
honest, and scope-aware.

*Reusable across sessions. Update when the ground state shifts materially (a session in the plan
above closes, a licensed session opens, a flag flips, a mentor ruling lands) — archive the prior
version to `archive/` with its date, per this file's own convention. The 0h call remains the
founder's.*
