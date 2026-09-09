# Cognitive OS — Step 2 / Step 4 CLOSE: Phase 1 built, reviewed, mentor-approved

**Session type:** `code-elevated`. Opened under
`2026-09-09-SESSION-cognitive-os-STEP-2-phase-1-build-SESSION-PASTE.md`, per the
2026-09-09 mentor review (`2026-09-09-mentor-review-gap-analysis-approved-step2-licensed-verbatim.md`)
and the 2026-09-08 thirteen rulings (`2026-09-08-mentor-rulings-cognitive-os-thirteen-questions-verbatim.md`).
**AC7 not engaged.** No table, no migration, no SQL, no flag, no credential, no deploy, no harness
file, no `GUARD_RE` file touched.

**Full build report (canonical for this session's work):**
`operations/cognitive-os-2026-09/2026-09-09-STEP-2-PHASE-1-BUILD-REPORT.md`. **This close summarises
it and adds the mentor's post-hoc review of the report plus the three founder-relayed rulings — it
does not restate the report's detail.**

---

## What happened, in sequence

1. **Built** a pure, deterministic, dependency-free TypeScript library at
   `website/src/lib/cognitive-os/` — the nine ruled Phase-1 components (`Claim`, `BeliefState`,
   `EventStore`, `DependencyGraph`, `TruthMaintenanceSystem`, `BasicBeliefRevision`,
   `HandoffEnvelope`, `PermissionModel`, plus `types.ts`/`index.ts`). In-memory only; nothing wired to
   any live response, route, flag or table.
2. **The Step-3 critical test passed deterministically** — belief retraction → dependency propagation
   → decision reopening, run twice from independent clocks, traces compared byte-for-byte.
3. **Mutation-verified the build first-hand**, 30-plus mutations against the initial battery. **Two
   pins were vacuous** (both in the semantic — "indeterminate is not resolved" — the review had named
   as load-bearing), found only because the stake in the critical test's own green result was named
   explicitly before trusting it. Both closed and re-verified killing.
4. **PR19 independent review** — 22 agents, 8 dimensions, each finding adversarially verified, model
   `sonnet` throughout per the founder's permission to drop the review tier. **14 findings upheld, 0
   refuted, all folded.** Two HIGHs mattered most: `EvidenceRef.verification` was caller-settable with
   no verification subsystem behind it, while three headers falsely claimed it was "set by the
   system" (fixed by branding the type to one chokepoint and stating the honest limit instead of the
   false claim — a real evidence verifier is now a named Phase-2 prerequisite); and the C8
   "internal-only score never leaves the system" boundary had four live bypasses (Map/Set,
   non-enumerable properties, prototype getters, Symbol keys), fixed by making the egress scan
   fail-closed on anything it cannot exhaustively read rather than patching each hole.
5. **9 fold-mutations, all 9 kill.** Session total: **40 mutations applied, 2 survivors, both found
   and closed.**
6. **Final gates:** battery 147/0 · critical scenario 30/0 · project-wide `tsc --noEmit` 0
   diagnostics · byte-identity guard 250/0 · both SHA pins unchanged.
7. **Report sent to the founder**, who relayed it to the mentor along with three flagged items and
   this session's own three questions.

---

## The mentor's review of the report — ADOPTED

**Verbatim wins over this close.** The mentor's response is not filed as a separate verbatim record
this session (relayed inline via the founder, not pasted as a standalone document) — captured here in
full effect, and the founder holds the original text.

**Phase 1 is approved.** The mentor's framing: *"The work is complete in the sense that matters: not
merely passing, but honest about what it does not yet do."* Both HIGH PR19 fixes were praised
specifically for the third part — not just fixing the gap, but **naming the residual honestly**
(Phase 1 ships no verifier and says so; the egress boundary is now fail-closed by construction, not
patched). The mutation-verification finding (M6/M9) was called *"the most honest part of the
document"* — found because the stake was named, not despite it.

### The three founder-flagged items — ALL RULED

- **3.4(a) — the `"actor": "Laboratory"` spec-vs-ruling collision.** Resolution confirmed correct
  (rulings win; `scope` + `caused_by` carried instead of `actor`). No further ruling needed unless the
  founder wants to overrule the precedence call.
- **3.4(b) — the immutable-decision-record contradiction** (step 9 "becomes REVIEW_REQUIRED" vs step
  10 "remains immutable"). Resolution confirmed correct — ordinary engineering, status derived from
  the event log, record never edited. No ruling needed.
- **3.4(c) — Attic's zero write verbs.** **Now RULED, not merely inferred:** *"Attic holds no write
  verbs."* Same logic as Constraint 6, made structural rather than procedural — *"a procedural rule
  can be forgotten; a structural one cannot."* The founder may narrow further if the architecture
  requires it; zero is the correct floor.

### Phase 2 — confirmed NOT licensed, with prerequisites sharpened

R9/R10 handoff reconciliation is a **prerequisite**, not a follow-up. The table step's data-rights
obligation **opens** that step, doesn't close it. **C7 and C8 must be designed against from Phase 2's
opening**, not retrofitted — the debt score becomes real in Phase 2, the egress boundary becomes
load-bearing in Phase 2. The manifest amendment stays at Phase 3, unchanged.

---

## This session's three questions — ALL RULED

**Q1 — Bash-authoring / consult-floor coupling.** The counter is **not broken** — it measures consult
events correctly; what was incomplete was treating that count as a reliable proxy for examination
density across tool modes. **No change to the counter, no change to the floor.** New standing
obligation: **the pre-flip report must disclose tool-mode composition per baseline day alongside the
consult count** — Option D discipline applied to the baseline itself. Sharpened by the mentor into a
concrete finding: **day 2 of the baseline was 12 consult records, all governance documentation; day 3
(this session) was 1 consult record for a 2,462-line build with 147 tests and 40 mutations verified**
— the mirror image of the existing representativeness concern. Also raised, **not ruled**: whether
harness tool-mode routing should become a founder-visible setting — carried to the standing-runner
design session as a question, not a decision.

**Q2 — the `cat >` truncating-redirect pattern.** **Disclosure-after-the-fact is not sufficient as
standing practice.** The mentor named the precise failure: not the use of the pattern, but classifying
the guard's signal from a **prior session's** classification instead of the current frame — twelve
firings, twelve times read through an old lens. Named as a synkatathesis error. **No ENFORCE** (a
truncating redirect to an empty path is not the same action as one to an existing file; blocking the
shape would catch legitimate uses). **Ruling: a practice requirement** — examine the guard's signal
from the current frame every time — **plus a standing addition owed to the session opener** for
Bash-mode sessions: *"`cat >` redirects will fire the guard; read the frame before proceeding."* **Not
yet added to the opener — carried forward, below.**

**Q3 — PR19 finding-cap disclosure.** Confirmed as a real gap. **Ruling: cap-transparency is now a
standing requirement for future review workflows** — any per-dimension finding cap must be disclosed
in the report, stating the cap value and whether it bound (findings dropped, and how many) or did not.
Does not retroactively change this session's findings (independently verified regardless). Applies
going forward.

---

## Verified first-hand at close

| Claim | Check | Result |
|---|---|---|
| Byte-identity guard | battery **run** | **250 passed, 0 failed** |
| `layer2-mechanisms.ts` SHA pin | `shasum -a 256` | `60cefedb5f4f7882…` — unchanged |
| `stoic-brain.ts` SHA pin | `shasum -a 256` | `fa8895ec949b9f6d…` — unchanged |
| Cognitive OS battery | `npx tsx` | **147 passed, 0 failed** |
| Critical scenario | `npx tsx`, twice-run determinism | **30 passed, 0 failed** |
| Project-wide typecheck | `npx tsc --noEmit` | **0 diagnostics** |
| False-hold buffer | parsed record-by-record | **361** rows; window **222** |
| Baseline days (≥1 consult) | grouped by `capturedAt` UTC day | **3 of 5** (09-06, 09-07, 09-08) |
| `git status` | whole, un-truncated | only `operations/cognitive-os-2026-09/` and `website/src/lib/cognitive-os/` are mine to stage; two modified + one untracked file remain peer work, untouched |

---

## Carried forward, visibly, so nothing here is rediscovered

1. **The table step is owed next** — schema, data-rights wiring (`/api/user/access`, `/export`,
   `/delete`, `/api/credential/erase`), `retain_until`, sweep, migration. Founder-walked. Opens with
   the C7/C8 design constraints already on the surface per the mentor's Phase-2 ruling above.
2. **R9/R10 handoff reconciliation — owed BEFORE Phase 2 opens.** A prerequisite, not a follow-up.
3. **The two owed pre-flip disclosures are now three**, per this session's Q1 ruling: (i) baseline
   composition day-by-day with tool distribution — **now specified in detail** (this session is the
   Day-3 datapoint); (ii) loop count by action class; (iii) **tool-mode composition per baseline day,
   newly ruled this session.** All three still unbuilt — `Q-PREFLIP-REPORTS`, gated behind a founder
   waiver (the report script matches `GUARD_RE`).
4. **The session-opener addition from Q2 is not yet made.** A line for Bash-mode sessions —
   *"`cat >` redirects will fire the guard; read the frame before proceeding"* — is owed to
   `STANDING-SESSION-OPENER-grounded-foundations.md` at its next revision.
5. **The cap-transparency requirement from Q3** is standing for any future PR19-style review
   workflow — not yet encoded anywhere beyond this record; worth folding into the process-instructions
   snapshot at the next `governance` session that touches it.
6. **A manifest amendment is owed BEFORE Phase 3** (unchanged) — naming the boundary between the
   queryable record and the deepening disposition.

---

## State at close

**Phase 1 COMPLETE and mentor-approved. Phase 2 NOT STARTED and NOT LICENSED.** Nothing pushed —
committed by the founder's own act, path-scoped to this session's files only. The byte-identity guard
is **armed and green (250/0)**; both SHA pins unchanged; `classifyCaller` byte-unchanged; the
observation window ran untouched throughout; baseline stands at **3 of 5**.

**The S11 flip remains REFUSED; weights remain BLOCKED; the 0h call remains the founder's.**
