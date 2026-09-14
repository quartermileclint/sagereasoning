# Session close — R12: the standing-runner build brief, second increment

**2026-09-14, 18:31 → ~20:15 AEST (from `date`).** Session `sagereasoning-b1 [4bc334]`, opened on the
founder's designation of **the standing-runner design track, excluding R8-D7's parameters**, under
the W2 conforming opener. **Tier `governance` / design. AC7 not engaged.** Model: Opus 5; the three
PR19 reviewers ran on Sonnet under the founder's standing permission (the session's own model
unchanged, so there was nothing to return).

**Production state at close (PR18): unchanged from open.** No code, schema, flag, credential,
migration, deploy, push, `GUARD_RE` file or R18 surface touched. Nothing in this session changes what
production serves.

---

## 1. What the designation turned out to contain

The track's remaining design work is **much narrower than the designation implies**, and this is
worth recording because a later session will otherwise re-derive it:

- **The M/W/S election is CLOSED** — W elected 2026-09-13, which **fully discharged** the Option S
  gate. Both items it ever bound are resolved.
- **R10's six questions, Q-R11-A1/A2/A3/A4/B1/B2/C1, and the `manifest.md` ATRF wording** are all
  ruled and, in the manifest's case, applied by the founder this morning.
- Of R8 §11's five follow-ons and R9 §16's ten, exactly **one** is design-class, unexcluded, and
  unauthored: **the standing-runner build brief, second increment** (R9 §16.2; R8 §11.2). Both
  sittings named it; neither wrote it.

**That is what this session authored.**

## 2. The deliverable

`operations/agent-circles-2026-08/2026-09-14-R12-standing-runner-build-brief-second-increment.md`
— one buildable specification consolidating both source lists: six schema columns plus one table in
a single Q-B2 window, three read surfaces behind three new flags, the runner-side components with
R8-D2's closure predicate, the capability question, data-rights wiring, six prerequisites, the phase
ladder with R9's phase 1′, R8-D7's unparameterised slot, and the Prerequisite-Criterion and
standing-constraint tables.

**It authorises nothing.** Every element remains a founder election; the build it specifies is a
`code-critical`, founder-walked, PR19-reviewed step licensed by nothing in it.

## 3. The three things the founder should read first

1. **§5 + Q-R12-A — the capability question.** R8-D1b requires a read-scoped capability that is
   explicitly *not* `watching_write`. **None exists.** The obvious fix — add it to
   `WRITE_CLASS_CAPABILITIES` so the 6e §A CHECK applies — **would reject a mint on the established
   owner-less runner-credential shape**, because that CHECK demands `owner_user_id` as well as
   `agent_id` while the read's scoping needs only `agent_id`. A third option (a narrower
   agent-bound-only CHECK) is now the recommendation. **This is a mentor question.**
2. **§7.6 — the producer question.** R8 §4.0 item 2 asks how an executing agent learns
   `loop_id` + `cycle_number`. It is unanswered, so **nobody but the runner can post a completion
   signal**, so phase 3 would consume a stream only the runner produces. R8 named the
   producer-question mentor brief as **the recommended first follow-on, ahead of any build**; that
   judgement stands and this brief does not displace it.
3. **§8.4 + Q-R12-B — the window collision.** Exactly **one** file in the whole bundle matches
   `GUARD_RE`: `website/src/lib/substrate/idea-loop-watching-store.ts`. Every route handler, the
   credential module, both data-rights routes and every `.sql` file are free. **All three read paths
   need that one store file**, so the read work is precisely the part that collides with the armed
   guard; the migration, the capability and the data-rights wiring do not. Whether the window's
   discipline tolerates a guarded-file waiver as the window's own work **remains unruled**.

## 4. PR19 — three blind reviewers, twelve findings, all folded

Launched together, each given only the deliverable and source paths, no visibility into the author's
assessment or into each other. **Every finding was verified first-hand at source before folding.**

- **A (source-fact correctness): CLEAN**, zero findings — it re-derived every line-number citation
  and mechanically re-applied the live `GUARD_RE`. One parenthetical was a genuine PR20 gap and was
  folded (two production claims now marked recorded-but-not-independently-verified).
- **B (fidelity to sittings and rulings): six findings, all confirmed.** Headline: §9 listed
  `surface` as **both settled and open** — the five-item list is the pre-ruling state, and the
  ruling settled `surface` (gate only) and incomplete-series (hold). Also: R8-D2's **closure
  predicate** was missing — the exact defect R8 itself named and fixed; the proposal-shape
  environment field was claimed in §0 and specified nowhere; two of three named dashboard views were
  dropped, one of which was melete's **only** reader; the producer-question prerequisite was absent
  from a §7 framed as exhaustive; R8-D9's exclusion read as an oversight rather than a gate.
- **C (constraints and safety): six findings, all confirmed.** Headline: the melete **delete path**
  cannot ride the cascade — the sibling's own comment says *"erasure is verified by query, never
  inferred from a cascade"*, and the cascade reading would have shipped a `tables_cleared`
  compliance claim for an unverified deletion. And **§5's recommendation was withdrawn** on the
  CHECK's actual predicate. Clean on: PR24 non-engagement, absence of any candidate→execution path
  or harness-computed scalar, and §11's three core compliance claims.

**One refinement made against a reviewer**, recorded because verification is the point: C reported
"no export path at all" for owner-less credentials. `/api/user/export` **does** carry a
`credential_ref`-keyed pattern for an operator's owner-NULL credentials; the correct fix is to follow
*that* sibling, which is narrower than the reviewer's reading.

## 5. A finding about the instrument itself — routed, not fixed

Verified at source in `harness/gate1-pre-decision/claude-code/hooks/lib/false-hold-capture.mjs`:

- **`buildFalseHoldRecord` — the consult path, schema v3 — takes no `callerClass`, `clientVersion` or
  `clientEntrypoint` parameter.** Only `buildGuardHoldRecord` (v6) does. So the Condition-3
  disclosure the 2026-09-07/09-10 rulings put on the guard path **has no counterpart on the consult
  path**, and consult records cannot be attributed to live-agent vs subagent at all. Confirmed on a
  record written by this session, not only on history.
- **Capture is imported only by `at-action-hook.mjs`.** The session-open frame and the subagent frame
  write **no record**, so a frame outage on either is invisible to the buffer. This session hit that
  three times — the `Agent` launches returned *"no assessment in response"* and produced nothing,
  where the guard path would have written `captureBasis: no_assessment`.

**These are `harness/gate1` files. `GUARD_RE` matches them and the guard is armed, so this is named
for the founder rather than fixed.** It bears directly on F-3′.

## 6. F-3′ — counted, not estimated

Window population (records 140 onward; the 138 v1 records and the took-effect probe at 139 excluded):
**681**. **Consult 215 · guard 466**, reported separately as the obligation requires. **Consult
records exist on 9 of 9 window days** — availability from day one is satisfied, not assumed.
Guard outcomes: `pause_for_review` 364, `proceed_with_caution` 54, `proceed` 37, `do_not_proceed` 8,
`outage_open` 3. Buffer read-only throughout; nothing written to `~/.sage-gate1/`.

## 7. Re-derived at open and at close (run, not quoted)

Byte-identity guard **250/0, ARMED** (`GATE1_FALSE_HOLD_CAPTURE=true` in this session's environment),
at open and at close. SHA pins unchanged: `60cefedb…` / `fa8895ec…` / `db86fccb…`. R20a perimeter
**43 route-level + 2 substrate-gate = 45**. Agent-card extensions **26**. Process rules **PR1–PR25**
by enumeration. Crons **7**. All eleven cross-reference paths resolve.

**A stale fact in the opener, for the founder:** §7 states client `2.1.260`. The buffer's most recent
records — including today's — read **`2.1.270`** (window spread: 2.1.260 ×41, 2.1.266 ×188,
2.1.270 ×4). The opener invites re-derivation, so this may be intentional; either way the correction
is the founder's.

## 8. Tool-mode disclosure

The deliverable and this close were authored through **Write/Edit**, per the designation's channel
scope. Bash was used for reading, verification and re-derivation only. Disclosed on the merits: the
work is document authoring, which is what Write/Edit is for — not chosen for the record.

## 9. Files touched

**New:** the brief; this close; the decision-log entry.
**Not touched:** any `GUARD_RE` file; any R18 surface; `option-s/`; `manifest.md`; `~/.sage-gate1/`;
`agent_hold_observations`; the priority index (no named input consumed or redirected — the one
redirected row, the GS-ATRF-4 vocabulary direction, stays held open and owned by no session per D1).
Another session's `environmental-context.json` and two untracked peer prompts were **not staged**.

## 10. The founder's next steps (elections, none taken here)

1. Read §5/Q-R12-A, §7.6 and §8.4/Q-R12-B — the three items that gate any build.
2. Carry Q-R12-A, Q-R12-B and Q-R12-C to the mentor if wanted.
3. Decide the three founder elections in §13 (`accepted_move_count` storage; `election_basis`
   placement; phase-3's N).
4. Weigh whether R8's own recommendation still holds — the **producer-question mentor brief first,
   ahead of any build**. This brief's §7.6 is evidence that it does.
5. Push this commit (the AI never pushes).

---

**D2 remains blocked. The S11 flip remains REFUSED. Weights remain BLOCKED. The 0h call remains the
founder's.**

---

## Addendum, same session (~20:30–21:10 AEST) — the relay went, all three questions RULED, folds applied, pushed

**The close above was written before the ruling existed. It is left as written; this addendum
supersedes its §10 where they differ.**

Sequence: the founder asked for the three questions in relay form → they were authored with every
PR20 mechanism fact **re-verified at relay** (`2026-09-14-MENTOR-QUESTIONS-R12-three-questions-FOR-RULING.md`,
commit `c5f5e42`) → the founder relayed → the mentor ruled all three → captured verbatim, adopted and
folded (`2026-09-14-mentor-ruling-R12-three-questions-verbatim.md` +
`D-MENTOR-RULING-R12-THREE-QUESTIONS-ADOPTED-FOLDED-2026-09-14`, commit `f990299`) → **founder pushed;
all three commits confirmed on `origin/main`; Vercel green.**

**Vercel green is not evidence about this work.** `git diff --name-only 2f881be~1 f990299` returns
**zero** files under `website/`. The deploy is documents-only by construction; a green build confirms
the push, not the brief.

### What the ruling settled

- **Q-R12-A — option (c).** A narrower CHECK on `agent_id` only, for read-class capabilities.
  **(a) ruled out** on the RLS-survey precedent. The two-migration structure is confirmed as right
  discipline, and the brief's disclosure of it as a Q-B2 exception is accepted.
- **Q-R12-B — NO, and this is the consequential one.** The window's waiver admission is confined to
  **authoring**. *"The build brief is complete and ruled. The build waits for the window to close."*
  **The ruling's ground is behaviour-alteration, not `GUARD_RE` membership** — so it gates the
  **whole bundle**, including the migrations and the capability work, which are not guarded files.
- **Q-R12-C — the envelope is NOT sufficient for machine consumption.** A **Prerequisite Criterion
  finding**, not a pass. The anchor now serves **coverage and confidence state only, without
  per-domain levels**. This brief's own argument was found insufficient: *"presence is not
  engagement."*

### The brief's status has changed

**From *Designed, three questions open* → *Designed and ruled, awaiting the window's close.*** There
is no remaining design question inside the brief. Everything it specifies is settled; what it waits
on is the window, not a decision.

### Folded by annotation, not rewrite

Banner at the head plus six settled sections — §5, §8.1, §8.4, §3.3 block 2, §10, §13. The
superseded argument in §3.3 is **left in place** as the record of what the brief argued, per the
repo's discipline for a ruled document.

### One genuinely new open item, belonging to a different session

**Whether the runner's generation step must include an explicit examination of the anchor's disclosed
limitations before reasoning from it.** Ruled *"not mandatory at this stage, but the correct
direction"*, and to be carried **as an open design question for the generation-step scoping session,
never as a resolved parameter.** R12 does not own it and does not assign it.

### §10 of the close above is superseded as follows

Items 1–2 (read the three gating items; carry the questions to the mentor) are **discharged** — they
were carried and ruled. Item 5 (push) is **discharged**. **Items 3 and 4 stand**, and one is now
sharper: the producer-question mentor brief is no longer merely R8's recommendation — **§7.6 and
Q-R12-B together make it the only tractable next step on this track while the window runs**, because
it is authoring, which the window admits, whereas everything else in the brief is a build, which it
does not.

### Verified at addendum close (run, not quoted)

Byte-identity guard **250/0, ARMED**. SHA pins unchanged (`60cefedb…`/`fa8895ec…`/`db86fccb…`).
All three commits on `origin/main`. Working tree carries only the peer session's
`environmental-context.json` and two untracked peer prompts — **none staged, none touched.**

**D2 remains blocked. The S11 flip remains REFUSED. Weights remain BLOCKED. The 0h call remains the
founder's.**
