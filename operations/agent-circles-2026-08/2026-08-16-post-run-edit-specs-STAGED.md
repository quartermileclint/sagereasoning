# Post-run edit specs — the code-adjacent ruled items (STAGED for R2/R3)

**Date staged:** 2026-08-16 · **Session:** concurrent-arc C3b (Deliverable 2) ·
**Status: STAGED — NOTHING EXECUTED.** These are precise, repo-verified specifications for the
post-run build sessions (R2, R3 per the arc plan), so those sessions open with the constraint
structure already pinned. **No file named below was edited in the staging session.** Every
line cite was re-measured first-hand on 2026-08-16 (`grep -n`/`awk`, never a display's
numbering, per the citations lesson). The verbatim mentor records govern over everything here:
Ruling Sets A/B (`2026-08-15-mentor-rulings-C2-scope-documents-verbatim.md`), M6
(`operations/handoffs/founder/2026-08-15-mentor-response-concurrent-arc-M1-M7-verbatim.md`),
Set D + the vetted Q1–Q6
(`2026-08-15-mentor-ruling-set-d-layer3-scope-document-verbatim.md`,
`2026-08-15-mentor-review-reflect-q1-q6-vetted-verbatim.md`). **Claims-vs-repo check run at
close (independent read-only agent, 2026-08-16), findings folded and disclosed:** the Q6
U+2019 line cite was off by two (`:123`→`:121`, corrected); two quotations in the first draft
were not verbatim — the Spec 3.3 skeleton's G4-deferral quote had dropped two phrases, and
Spec 4's "ruling's requirement" quote was a splice of the mentor's sequencing sentence with
the arc plan's paraphrase — both corrected to true verbatim with the splice named in place.
All four mentor wordings (A/R-5, B/M-A, M6, the Q1/Q3 amendments) byte-matched their sources
in every rendering, including the TS-escaped forms.

**Standing constraints restated for every spec:** execution is post-run per M2; the
parallel-window fences bind until the run closes; `SUBSTRATE_LAYER3_ENABLED` activation is not
licensed by anything here; weights BLOCKED; the P0 0h hold stands. The specs below name checks
the executing session performs **at execution time** — a fact verified at staging time is a
staging fact, not an execution fact.

---

## Spec 1 — B/M-A: the discriminative-range `does_not_attest` item (SAME-EDIT RULE)

> **THE SAME-EDIT RULE (this spec's defining constraint, stated in its header so it cannot be
> split by accident):** the ADR-013 §8 dated amendment, the `does_not_attest` array addition
> in `trust-record-payload.ts`, and the S10 battery update land in **ONE edit** (one commit).
> The ruling's words: "The S10 battery (s10-trust-record-surface.test.ts:265) moves with it —
> the battery is pinned to the object-identical does_not_attest array and must be updated in
> the same edit." The three R18 surfaces are the SIGN-OFF PACKAGE's
> (`2026-08-16-post-run-r18-signoff-package-STAGED.md`, Item 2) — NOT this edit. Recommended
> order: this code edit lands first; the R18 half follows at the R18 close (or same push).

**Natural home:** R2 (a code+battery+ADR edit). Guard-class note: `trust-record-payload.ts`
matches the boundary guard's `GUARD_RE` (`/substrate/` + `trust-core`); the M1 ruling made the
git byte-identity guard **window-conditional** (`human-practitioner-boundary.test.ts` §C,
`:431` — binds iff `GATE1_FALSE_HOLD_CAPTURE === 'true'`). At staging time the window is
stopped (guard DORMANT). **The R2 session re-checks the live posture at execution time** — if
the window has been restarted by then, the guard re-arms by design and R2 coordinates with the
window rules rather than assuming dormancy.

### Component (a) — ADR-013 §8 dated amendment (`adopted/adr/2026-07-08-sage-trust-layer.md`)

§8 heading at `:101`. The section's pattern (verified): later does-not-attest items land as
**dated amendment paragraphs** after the original list (the 2026-07-12 PA-6/PA-10 paragraph,
the two 2026-08-08 paragraphs). The ruling fixes this amendment's date: *"added to ADR-013 §8
(dated amendment, 2026-08-15)"* — the amendment is dated **2026-08-15** (the ruling date), with
the application date recorded alongside. Verbatim-ready draft (the inner wording is
mentor-fixed; the frame is the ADR's amendment-paragraph house style):

> **2026-08-15 amendment (hegemonikon-drift Ruling Set B, R-2 — the discriminative-range
> does-not-attest item; applied post-run <APPLICATION-DATE> at R2):** the does-not-attest list
> gains: *"Discriminative range — whether the agent's proximity readings vary across different
> types of actions, or whether stability in the record reflects tested relapse-resistance
> rather than absence of perturbation. The disposition_stability dimension measures
> consistency of proximity readings; it cannot distinguish a stable disposition that has been
> tested under varied conditions from one that has not been tested at all."* The item names
> discriminative range specifically — not variance or dispersion generically — because the
> doctrinal concept at stake is the Senecan relapse-resistance criterion (Seneca 75.8-9), not
> statistical variance as such (the ruling's own ground). The live
> `TRUST_RECORD_ENVELOPE` (`website/src/lib/substrate/trust-core/trust-record-payload.ts`)
> gains the identical item in the same edit, with the S10 battery.

### Component (b) — the `does_not_attest` array (`website/src/lib/substrate/trust-core/trust-record-payload.ts`)

Verified current state (2026-08-16): array opener `:52`, **eight items** `:53-60` (last:
"Confirmed delivery…"), closer `:61` — the ruling's `:52-61` cite is exact today. **Edit:**
append the mentor wording verbatim as the **ninth** item, after `:60`.

**Code-point discipline (verified against file convention):** the mentor wording contains
ASCII apostrophes ("the agent's proximity readings"). The envelope's strings are single-quoted
TS literals using `\'` escapes (e.g. item `:60` carries `entry\'s`). The new item escapes its
apostrophe the same way. No typographic quotes are introduced.

### Component (c) — the S10 battery (`website/src/lib/substrate/trust-core/__tests__/s10-trust-record-surface.test.ts`)

Verified current state (2026-08-16): the envelope substring pins **S2-28…S2-36** at
`:256-264`; the **S2-37** pin at `:265` — `eq(payload.envelope, TRUST_RECORD_ENVELOPE, 'S2-37
the payload ships THE envelope object')`. The battery's `eq` helper (`:77-79`) is **strict
`===` reference identity**, so S2-37 passes by construction when the payload ships the same
mutated object — it does not, by itself, detect the new item. **Therefore "updated in the same
edit" concretely means: add a new S2-28-style substring pin for the new item** — e.g.
`assert(env.includes('Discriminative range'), '<label> envelope: discriminative-range item
(Ruling Set B R-2)')` — inserted with the S2-28…S2-36 block, **and mutation-verify it**
(remove the new envelope item alone → the new pin fails → restore; the pin was proven capable
of failing, per the standing mutation-verification lesson). Battery re-run green; `tsc` 0.

### Verification block for the executing session

1. Re-derive `:52-61`, `:256-265` at execution time (they move if any upstream edit lands
   first — do not inherit from this spec).
2. One commit containing (a)+(b)+(c); battery green; mutation-verify the new pin.
3. State in the implementation record: the same-edit rule was honoured; the amendment date is
   2026-08-15 (ruling) with the application date recorded; the R18 half is deliberately NOT in
   this commit (it is the sign-off package's).

---

## Spec 2 — M6: the total-unknown-branch curation disclosure

**Natural home:** R2 (arc plan item 6). Same guard-class posture check as Spec 1 (same file).

**The mentor sentence (M6, verbatim, binding):**

> The trust record for this agent is incomplete. The total number of interactions cannot be
> confirmed. Curation effects — where high-volume interaction patterns may suppress individual
> signal visibility — cannot be assessed at this time. This record should be read with that
> limitation in mind.

**The branch, located first-hand (2026-08-16):** `trust-record-payload.ts` — the capped-note
ternary inside the orientation-readings block. The total-KNOWN arm (condition `:305`,
known-arm string literals `:306-311`) carries the
composition note folded 2026-08-12
(`D-CURATION-VIA-VOLUME-FOLDED-INTO-LIVE-PAYLOAD-2026-08-12`). The total-UNKNOWN arm is the
else-arm at **`:312-313`**:

```
:312          : 'orientation_readings is capped at the bounded read window (older readings not ' +
:313            'listed; the total count was unavailable this read); ') +
```

with the shared tail (`:314`) `'each entry describes one examination only — see its inline
not-attestable clause'`. The branch fires when `orientationReadings.capped` is true AND
`totalCount` is not a number — i.e. a capped read whose count query failed (the
`total_orientation_readings_count` field is then omitted, never fabricated — existing pin
S6-5c, condition line `:650`; its `assert(` spans `:649-652`).

**Insertion mechanics (AI-recommended; FOUNDER-APPROVED 2026-08-16, "approved as
recommended"):** RETAIN the arm's existing operational clause and fold
the M6 disclosure verbatim after it, before the `'); '` join — the existing clause states the
mechanical fact (window capped, count unavailable this read) and M6 states the honest
consequence. Rationale: the existing battery pin **S6-5d** (`:654` —
`n.includes('total count was unavailable')`) then **holds**; replacing the clause would break
S6-5d and force a same-edit pin rewrite (permitted alternative, but the larger diff buys
nothing). **Battery expectations:** a new pin on an M6-distinctive substring (e.g.
`'cannot be assessed at this time'`), mutation-verified (remove the M6 fold alone → new pin
fails → restore); S6-5c/S6-5d re-run green. (Cite convention: S6-5d's `:654` is the condition
line of an `assert(` spanning `:653-656` — same convention as S6-5c above.)

**Two named wording facts (record, don't adapt):** (1) M6 says "interactions" where the
surrounding payload speaks of "readings" — the mentor wording lands verbatim; the surrounding
note supplies the readings context, and the M6 ruling's own logic ("the total-unknown branch
cannot quantify the curation effect, so it names the inability to assess") is
vocabulary-independent. (2) The M6 disclosure is consistent with the total-known branch's
disclosure logic by the mentor's own statement — no reconciliation edit to the known-arm is
needed or licensed.

**Guard posture at execution:** as Spec 1 — the R2 session re-checks
`GATE1_FALSE_HOLD_CAPTURE` at execution time; dormancy is a staging-time fact only.

---

## Spec 3 — D/L-5: the reflect Q1–Q6 recalibration — implementation-record skeleton + current-strings byte-check

**Natural home:** R2 or its own small post-run step, **at a clean boundary** (the ruling:
recorded so any before/after read of reflect-derived event rates — G4 decrease/flag,
honest-reflect modulate, orientation flag — is segmentable). **The vetted verbatim record's
text blocks are the canonical strings**
(`2026-08-15-mentor-review-reflect-q1-q6-vetted-verbatim.md`); the candidate document is
historical.

### 3.1 The current-strings byte-check — RUN 2026-08-16, results

Method: programmatic byte-comparison of `question-bank.ts`'s `REFLECT_QUESTIONS`
`default_text` strings (concatenated TS literals) against the candidate document's "Current:"
blocks. Span re-verified: `REFLECT_QUESTIONS` at `:46-127` (the candidate's cite is still
exact); the wire seam serves the strings verbatim (`reflect-service.ts:335,654,723` — all
three re-verified by grep).

- **Q1, Q2, Q3, Q4, Q5: byte-IDENTICAL** to the candidate's recorded baselines. No drift
  between vetting and staging.
- **Q6: ONE code-point divergence, in the markdown records, not the file.** The live file's
  Q6 stem carries the Unicode right single quote **U+2019** in `circle’s`
  (`question-bank.ts:121`); the candidate's "Current:" block AND the vetted record's Q6 text
  block carry ASCII **U+0027** (`circle's`). This is a markdown transcription artifact — the
  candidate itself declared Q6's stem "byte-identical" (its intent was stem-unchanged), and
  the vetted record amended nothing in the Q6 stem. **The file has not drifted.**
- **Consequence pinned for the edit (the load-bearing finding):** a naive copy of the vetted
  markdown block into `question-bank.ts` would silently mutate the stem's U+2019 → U+0027 — an
  unintended byte change beyond the sanctioned appended sentence. **Rule: the unchanged Q6
  stem retains its U+2019; only the appended sentence is new text.** Same for Q5's
  sub-question `circles’` (untouched — sub-questions are unchanged; `question-bank.ts:111`).
  File-wide convention
  verified: exactly **2** U+2019 code points exist in the whole file (`:111` and `:121`); embedded
  double quotes are straight U+0022 (22 occurrences) — so the vetted record's straight quotes
  in new text (`"I cannot determine"`, `"no change"`, `"cannot determine"`) match the file's
  own convention. New apostrophes in new text (e.g. Q2's "session's", Q5's "session's"):
  follow the vetted record (ASCII, escaped `\'` in single-quoted TS literals per file style).
- **If anything has moved by execution time** (the strings, the span, the seam lines): STOP,
  flag loudly, re-run this byte-check — the vetted verbatim record remains canonical; this
  spec's baselines do not override a fresh measurement.

### 3.2 The change-map (from the vetted record's own summary — canonical)

| Q | Edit | Canonical source |
|---|---|---|
| Q1 | REPLACE `default_text`: three-sentence posture disclosure + amended stem ("from what the record of this session lets you establish") | vetted record, Q1 block |
| Q2 | REPLACE `default_text`: record-grounded reframe | vetted record, Q2 block |
| Q3 | REPLACE `default_text`: behaviour-anchored + amended closing clause | vetted record, Q3 block |
| Q4 | **NO EDIT — byte-identical** (primary adopted; alternative DEFERRED) | vetted record, Q4 block |
| Q5 | APPEND one sentence to `default_text` (stem byte-identical) | vetted record, Q5 block |
| Q6 | APPEND one sentence to `default_text` (stem byte-identical **incl. its U+2019**) | vetted record, Q6 block |

Sub-questions, mandatory sub-questions, FD-R1, RS-4, `ORIENTATION_REFLECT_QUESTION`: **all
byte-identical** (untouchables + the candidate's P5, mentor-accepted).

### 3.3 The implementation-record skeleton (the four mentor-required elements, pre-drafted)

> **Reflect Q1–Q6 agent recalibration — implementation record (D/L-5, Ruling Set D).**
> **1. Change date: <EXECUTION-DATE>.** Recorded so before/after reads of reflect-derived
> event rates (G4 decrease/flag events, honest-reflect modulate events, the orientation flag)
> are segmentable at this boundary — the same discipline the arc applies to the false-hold
> observation window. The edit landed at a clean boundary: <state the boundary — post-run,
> no concurrent reflect-surface change in the same deploy>.
> **2. The Q4 alternative is DEFERRED, deliberately.** The optional sub-question's
> interior-access retention ("Which actions were externally correct but driven by wrong
> reasons — passion, not virtue?") is a deliberate hold pending G4 mechanism review, not an
> oversight — the flagged G4 elicitation-distribution shift risk is the decisive constraint
> (mentor, verbatim: "The alternative is not ruled out permanently — it is deferred until the
> G4 mechanism's design can absorb the elicitation-distribution shift safely"; revisit if G4
> is ever redesigned to condition on a wider vocabulary).
> **3. The Q1 and Q3 amendments land in their vetted canonical forms:** Q1 — "from what the
> record of this session lets you establish" (replacing the candidate's "from what you can
> establish of this session"); Q3 — the closing clause "If the record does not show the driver
> clearly, say so — naming an undetermined driver as undetermined is more useful than naming
> one without grounds." The vetted record's text blocks are the canonical strings.
> **4. All other strings are byte-identical to the candidate as proposed** — which the
> 2026-08-16 staging byte-check verified equals byte-identical to the pre-edit file (with the
> one recorded U+2019 transcription note on Q6's stem, preserved in-file).
> Untouchables confirmed untouched: the never-abbreviated six-question sequence; FD-R3 (Q2),
> FD-R4 (Q4), the C2e orientation sub-question (Q6); the G4 mechanism + its 3-part standard;
> the controlled `SUB_SPECIES` vocabulary; FD-R1; the RS-4 ladder;
> `ORIENTATION_REFLECT_QUESTION`. This is an instrument-adjacent change (live trust-event
> elicitation surface), treated as such throughout — not effect-free copy-editing.

### 3.4 Verification block for the executing session

`tsc` 0; the reflect batteries green; a diff review confirming the change-map (exactly four
`default_text` strings changed, two of them append-only; zero changes elsewhere in the file);
the U+2019 check (`grep -c '’' question-bank.ts` still reads 2, both in unchanged text).

---

## Spec 4 — B/M-B: the AE-1 delta dispersion member — flag-discipline statement (drafted) + the named founder decision

**Natural home:** R2 or R3. The ruling's requirement (Sequencing for Ruling Set B, mentor
verbatim): *"Flag discipline: a new member riding SUBSTRATE_TRAJECTORY_DELTA_ENABLED is live
the moment it deploys; per-feature darkness needs its own flag. This must be stated in the
implementation record before the edit is made."* (The arc plan's "The flag-discipline
statement must be in the implementation record BEFORE the edit" is the founder-plan paraphrase
of the same requirement, not mentor text — the staging session's first draft spliced the two;
corrected at the claims-vs-repo fold.) This spec drafts that statement verbatim-ready so the
executing session copies it into its record before touching code.

### 4.1 The flag-discipline statement (verbatim-ready draft)

> **Flag discipline (Ruling Set B, B/M-B — stated in this record BEFORE the edit, per the
> ruling's requirement):** the dispersion member lands inside `meta.trajectory.delta`
> (`TrajectoryDeltaBlock`, schema `agent-trajectory-delta-v1` —
> `website/src/lib/substrate/trajectory-delta.ts:300-301`), which is gated by
> `SUBSTRATE_TRAJECTORY_DELTA_ENABLED`
> (`agent-assessment-history-store.ts:111` `TRAJECTORY_DELTA_ENV_VAR`), **LIVE in production
> since 2026-07-18**. A new member riding this flag is **live the moment it deploys** — there
> is no dark state on the existing flag. Per-feature darkness needs its own flag. The
> founder's election on this was made before the edit: **election (b), a dedicated flag**
> (resolved 2026-08-16, founder: "approved as recommended" on the staged spec; suggested name
> `SUBSTRATE_TRAJECTORY_DISPERSION_ENABLED`, UNSET everywhere ⇒ byte-identical,
> battery-asserted; activation is its own founder-walked R4 step with a live smoke and the
> one-line rollback: unset + redeploy).

### 4.2 The named founder decision — **RESOLVED 2026-08-16: election (b), the dedicated flag** (founder: "approved as recommended"; the R2/R3 session copies the resolved 4.1 statement into its implementation record before the edit and need not re-open the election unless something has changed)

- **(a) Ride `SUBSTRATE_TRAJECTORY_DELTA_ENABLED` → live-on-deploy.** The member appears on
  credential-bearing consults at the next deploy. Smaller surface; consistent with the delta's
  own additive-member history; but activation ceases to be a separately-walked step.
- **(b) A dedicated flag** (e.g. `SUBSTRATE_TRAJECTORY_DISPERSION_ENABLED`; UNSET everywhere ⇒
  byte-identical, battery-asserted) with its own founder-walked activation at R4. Preserves
  the build-dark/activate-later discipline at the cost of one more flag.

**AI recommendation (added 2026-08-16 at the founder's request; FOUNDER-APPROVED same day —
the election is resolved and recorded inside the 4.1 statement, per the ruling's requirement):
(b) — the dedicated flag.** Three grounds: (1) the project's
own nearest precedent — the B5 session-decline signal fed an EXISTING live surface (the A1
suggestion composer) and still took its own flag (`SUBSTRATE_SESSION_DECLINE_SIGNAL_ENABLED`)
rather than riding the composer's; (2) the dispersion member is a genuinely NEW signal class
(a variance reading, not another level/rate member), and its first live appearance deserves
R4's atomic-activation shape — its own live smoke and its own stated one-line rollback
(unset + redeploy), which riding the existing flag forfeits (rollback would then be a code
revert on a live surface); (3) the cost is one env var and one flag-off byte-identity battery
leg — the discipline the whole build history already pays everywhere else. Election (a) is
defensible if the founder wants the flag count held down; nothing breaks either way.

**AI recommendation on the schema-version note (FOUNDER-APPROVED 2026-08-16): keep
`agent-trajectory-delta-v1`.**
The member is additive-optional with its own evidence floor — the delta's internal precedent
(its members landed additively under v1), not the loop-fold's re-specification case (v1→v2
changed the meaning of existing buckets). Bump only if the R18 pass elects to present the
member as a contract change; decide and record at the edit alongside the extension-#18
(`trajectory-delta/v1`) description update.

### 4.3 Ruled constraints that ride the member whichever way (from Ruling Set B, R-3/R-5)

- Served **only** inside the AE-1 delta on credential-bearing `/api/reason` consults — **never
  on the public trust record** (M-C not adopted; M-D not adopted — the emission-path choice
  needs its own scoping session first).
- The **two named honest limits carried in the member's own disclosure**: consults that fail
  server-side produce no row; rows include examinations whose framing was never delivered to
  the agent — a variance signal over this window **cannot condition on delivery**.
- The M7 window (90-day / last-30) **stands** (R-5); the member inherits the delta's evidence
  floors and regime segmentation by construction; the n=1 survivorship limitation stands as
  ordered (observations, not a distribution to design against).
- MEASURE-only; evaluative-never-predictive; weights BLOCKED (standing).
- **Schema-version note (a design decision the executing session makes, named here):** whether
  the additive member keeps `agent-trajectory-delta-v1` or bumps the schema id. Precedents cut
  both ways — the loop-fold bumped `v1`→`v2` on a re-specification of existing semantics; the
  delta's own members landed additively under `v1`. An additive optional member with its own
  evidence floor is the second class; a bump is defensible if the R18 docs treat the member as
  a contract change. Decide and record at the edit, alongside the R18-doc follow-through
  (`trajectory-delta/v1` is agent-card extension #18 — its description will need the member
  added when the R18 pass runs).

---

*End of staged edit-specs. Produced by C3b (documents only); nothing here was executed. Each
spec's line cites are staging-time measurements — the executing session re-derives them at
execution time and treats any divergence as a loud flag, not an inconvenience.*
