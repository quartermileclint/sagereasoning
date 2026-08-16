# Next session — R2: Agent build batch 1 (trust-core + harness, the guard bundle)

**Paste this as the first message of a new session, in the `sagereasoning` repo root.**

**Tier: mixed, `code-elevated`→`code-critical` per item, all dark/additive — no flag is SET in
this session (PR24's two items build dark behind their own flag; activation is R4). Founder
presence: none required mid-build; two PAUSE points around the consolidated PR19 review.**

---

## Step 0 — Open

Read: `/adopted/standing-protocol-cache.md` (~3 min) → this prompt in full → the arc plan's own R2
section (`operations/handoffs/founder/2026-08-15-concurrent-arc-plan.md`, search "☐ R2") → the two
staged specs named in Part B below (they are pre-verified, repo-measured specifications — read
them fully, don't skim) → `git status` and `git log --oneline -5` to confirm nothing moved
underneath this prompt since it was authored (2026-08-16, `741b5ea`).

**The IDEA-loop parallel-window fences are LIFTED — the run closed at 20 cycles.** No pre-flight
check against the fenced route contracts is required. The three flags
(`SUBSTRATE_FRESH_ENABLED`/`SUBSTRATE_WATCHING_ENABLED`/`SUBSTRATE_LOOP_ID_FIELD_ENABLED`), the
runner credential, and the four route contracts remain live production surfaces that nothing in
R2 touches — no reason to touch them, not a fence forbidding it.

**Prerequisite confirmed satisfied at authoring:** the M1 guard ruling is executed
(`human-practitioner-boundary.test.ts` §C, window-conditional, four-state-verified 2026-08-15).
**Re-check its live posture at THIS session's open, not at this prompt's authoring** —
`GATE1_FALSE_HOLD_CAPTURE` was UNSET (window dormant) as of 2026-08-16; both staged specs below
depend on this staying true or, if the window has restarted, on R2 coordinating with the window
rules rather than assuming dormancy (their own words, not this prompt's paraphrase).

---

## Part A — Why this session matters

R1 (the §6 report) is compiled and mentor-accepted in full. R2 is the first of two dark/additive
agent-side build batches gating R4 (the founder-walked activation sitting). **R2's own scope in the
arc plan understates what is actually ready to execute:** a later concurrent-arc session (C3b,
2026-08-16) staged two documents with exact line cites, resolved elections, and founder sign-off
covering three items the arc plan's C2 ruled-additions block explicitly homes to R2 but never
folded into R2's own numbered list. **Read Part B's "Staged specs" subsection before starting —
treating R2 as only its original 8 items would silently under-deliver a founder-signed batch this
prompt exists to prevent.**

---

## Part B — What R2 builds

### The arc plan's own 8 items (`2026-08-15-concurrent-arc-plan.md`, "☐ R2")

1. **D4 + D1** — the trust-ledger reducer self-circle narrowing coupled with D1's cap logic
   (`derive-trust-events.ts:165` `deriveWorstJusticeOutcome`). Build + battery dark; the live walk
   is R4, not this session.
2. **AE-3** — the third agent extension, on the seam AE-1 pre-built.
3. **The L4 audit header amendment** — exact pending text preserved in the decision-log entry
   `D-FIVE-PRINCIPLES-AND-GUIDE-FUNCTION-RULINGS-EXECUTED-2026-08-12` (`l4-passion-audit.ts`
   header). Read that entry for the verbatim text; do not paraphrase it from memory.
4. **Corpus citation fixes** — `stoic-brain/stoic-brain.json:151` (Meditations 4.26 → 7.9,
   load-bearing by ruling) + the DL 7.38 cite. Recompile via `scripts/compile-stoic-brain.ts` into
   `website/src/lib/stoic-brain.ts`. **Update the boundary test's §C2 SHA freeze in the same edit**
   — the M1 ruling's own mechanism requires an explicit SHA update whenever `stoic-brain.ts`
   changes, regardless of the guard's window-conditional binding state.
5. **The reflect-path `loop_id` metering fix** — the close-hook under `harness/gate1`'s loop-billing
   UUID contract fails soft today; fix at the root.
6. **The trust-record payload total-unknown composition note (M6)** — **superseded by Spec 2
   below; use the staged spec, not this one-line summary.**
7. **PR24 retention parity, both named gaps** — `agent_hold_observations` (false-hold paths,
   guard-gated) + `stoa_entries` sweep coverage. Build dark behind their own flag; no flag set in
   this session.
8. **P8a guard-path capture** — feeds the new false-hold observation window (R4's own last step
   starts the window; this item only builds the capture, dark).

### Staged specs (C3b, 2026-08-16) — read in full, not summarised

**`operations/agent-circles-2026-08/2026-08-16-post-run-edit-specs-STAGED.md`** — four
precision-measured specs, every line cite re-derived first-hand at staging time and flagged as
staging-time-only (re-derive again at execution, don't inherit):

- **Spec 1 — B/M-A code half (the `does_not_attest` discriminative-range item).** Natural home:
  R2. **THE SAME-EDIT RULE governs:** the ADR-013 §8 dated amendment
  (`adopted/adr/2026-07-08-sage-trust-layer.md`), the ninth `does_not_attest` array item
  (`website/src/lib/substrate/trust-core/trust-record-payload.ts`, currently 8 items `:52-61`),
  and the S10 battery's new mutation-verified pin land in **ONE commit** — the mentor's own words:
  "the battery is pinned to the object-identical `does_not_attest` array and must be updated in
  the same edit." The R18 public-surface half (three docs) is NOT this edit — it belongs to the
  signed-off R18 package (see below) and is explicitly a separate, later application.
- **Spec 2 — M6: the total-unknown-branch curation disclosure.** Natural home: R2 (arc plan item
  6, superseding the one-liner above). Exact insertion mechanics resolved and founder-approved:
  fold the mentor sentence after the existing operational clause at
  `trust-record-payload.ts:312-313` (verified location as of 2026-08-16 — re-derive at execution),
  retaining the existing clause so battery pin S6-5d survives; add one new mutation-verified pin on
  an M6-distinctive substring.
- **Spec 3 — D/L-5: the reflect Q1–Q6 recalibration.** Natural home: **R2 or its own small
  post-run step, at a clean boundary** — this session decides which, and records the choice. The
  change-map, the implementation-record skeleton (all four mentor-required elements pre-drafted),
  and a completed byte-check against the live file (one real divergence found and resolved: a
  U+2019/U+0027 transcription artifact in the markdown records, NOT a file drift — the file's Q6
  stem keeps its Unicode apostrophe; only the appended sentences are new text) are all done. If
  this session takes it up: follow Spec 3 exactly, re-run its byte-check first (§3.1 — "if
  anything has moved by execution time: STOP, flag loudly, re-run"), and land the four
  `default_text` string changes (Q1 replace, Q2 replace, Q3 replace, Q4 no-edit, Q5 append, Q6
  append) with zero other changes to the file.
- **Spec 4 — B/M-B: the AE-1 delta dispersion member.** Natural home: **R2 or R3** — this session
  decides which if it takes it up at all (it is not one of the arc plan's original 8 items, and
  nothing forces it into this session). **The founder-resolved election is already recorded and
  need not be re-opened:** a **dedicated flag**, `SUBSTRATE_TRAJECTORY_DISPERSION_ENABLED` (UNSET
  everywhere ⇒ byte-identical, battery-asserted; activation is its own R4 step with a live smoke
  and a one-line rollback), and the schema stays `agent-trajectory-delta-v1` (additive-optional
  member, not a re-specification). **Copy Spec 4's §4.1 flag-discipline statement into the
  implementation record BEFORE touching code** — this is a mentor-stated requirement, not a
  convenience: a member riding the existing `SUBSTRATE_TRAJECTORY_DELTA_ENABLED` flag would be
  live the moment it deploys, which is exactly the risk the dedicated flag exists to avoid.

**`operations/agent-circles-2026-08/2026-08-16-post-run-r18-signoff-package-STAGED.md`** — the R18
public-docs package (A/R-5 kathêkon role-blindness qualification; B/M-A's R18 half; D/O-A
practitioner-type calibration disclosure). **Already fully founder-signed** ("approved as
recommended," 2026-08-16) — every insertion point, wording, and election is resolved. **This is
explicitly optional for R2, not required:** the package itself names its landing point as "R2's
close or R4." If Spec 1 (B/M-A code half) is taken up this session, the package's own recommended
ordering is code-half-first-or-same-push — **do not publish the `does_not_attest` disclosure on
public docs before the live envelope actually carries the new item** (the exact drift class the
package's own precedent exists to prevent). Applying the signed package is a genuine option to fold
into this session's close if time allows; deferring it to a dedicated small step or to R4 is
equally faithful to what was staged.

---

## Part C — Session-open decisions (state your choice in the implementation record, don't decide silently)

1. **Does this session take up Spec 3 (D/L-5) and Spec 4 (B/M-B)?** Both are optional to R2
   specifically (Spec 3: "R2 or its own step"; Spec 4: "R2 or R3"). If deferred, name where each
   goes (R3, or a new small post-run step) so nothing silently drops.
2. **Does this session apply the signed R18 package at its close?** Optional per the package's own
   text. If yes, honour the code-half-first ordering for B/M-A.
3. **Split point, if context runs hot:** the arc plan pre-authorises splitting at the review
   boundary into R2a (arc-plan items 1–4) and R2b (items 5–8 + whichever staged specs were taken
   up), one PR19 review each, rather than forcing one oversized review.

---

## Part D — Build discipline

- **No flag is set in this session.** PR24's two items and Spec 4's dispersion member all build
  dark behind their own (new) flags. Activation for everything R2 touches is R4's job.
- **Guard-class awareness:** `trust-record-payload.ts` and `derive-trust-events.ts` both sit under
  `/substrate/` + `trust-core` — the boundary guard's `GUARD_RE` matches them. Per the M1 ruling,
  the git byte-identity guard is now **window-conditional**
  (`human-practitioner-boundary.test.ts` §C, `:431` — binds iff `GATE1_FALSE_HOLD_CAPTURE ===
  'true'`). Re-check the live posture at this session's open (Step 0) rather than assuming last
  week's dormant state.
- **`stoic-brain.ts` recompiles gated on its own SHA-freeze mechanism** (item 4) — this is the one
  edit in this batch that is unconditionally required to update the freeze, regardless of the
  guard's window state.
- **Route/build-graph files:** if the R18 package is applied, `route.ts` (guardrail GET) and
  `page.tsx` (api-docs) are both touched — the standing gate applies: `npm run build`, not just
  `tsc` (memory `nextjs-route-export-validation`).
- **Every staged line cite is a staging-time measurement.** Re-derive with `grep -n`/`awk` at
  execution time before editing; if a cite has drifted, treat it as a loud flag per both specs'
  own instruction, not an inconvenience to route around silently.

---

## Part E — Adversarial review (PR19)

One consolidated PR19 review across whatever this session actually builds (arc-plan items +
whichever staged specs were taken up per Part C's decisions). **PAUSE before launching the review**
— founder drops the model setting. **PAUSE after the review returns** — founder restores it. If
split per Part C item 3, one review per half (R2a, R2b).

---

## Part F — Close

- Lean decision-log entry (or full form if any item's own tier calls for it — Spec 1's ADR
  amendment and Spec 4's new flag are both `code-critical`-adjacent by the standing risk table;
  judge per item, the highest-risk item in the batch sets the session's own form).
- State explicitly in the record: which of Parts B's items were built, which staged specs were
  taken up vs deferred (and to where), whether the R18 package was applied, and the mutation-
  verification result for every new battery pin (Spec 1 and Spec 2 both require one).
- Tick the arc plan's R2 checkbox (or R2a/R2b if split) with a DONE annotation naming the decision-
  log entry, following the C2/C3/C4 precedent in the same file.

---

## What NOT to do

- Do not set any flag. Do not activate anything. R4 does that, after R2 AND R3 are both built,
  committed, and pushed.
- Do not open R3, R4, R5, R6, R7, or R8 from this session unless this session's own close explicitly
  hands off to one of them per the arc plan's routing.
- Do not treat Spec 3 or Spec 4 as mandatory — both are genuinely optional to this specific
  session, per their own "natural home" language.
- Do not re-open any election the R18 sign-off package already resolved ("approved as
  recommended") — apply it as signed, or defer it whole; don't partially re-litigate it.

---

## Rollback path

Every item in this batch is dark, additive, and flag-gated where a flag is involved. Any single
item's build can be `git revert`ed independently without touching the others (they are unrelated
files except where the same-edit rules bind Spec 1's three components together — revert that as
one unit). Nothing in R2 is live in production regardless of outcome; R4 is the separately-walked
activation.

## Forecast

Success = the arc-plan's 8 items built dark with clean batteries; Spec 1 and Spec 2 applied under
their exact same-edit and insertion-mechanics rules with mutation-verified new pins; Spec 3/Spec 4
either applied faithfully or explicitly deferred with a named destination; one clean consolidated
PR19 review (or two, if split) with both pause points honoured; nothing activated; R3 next.

*End of prompt.*
