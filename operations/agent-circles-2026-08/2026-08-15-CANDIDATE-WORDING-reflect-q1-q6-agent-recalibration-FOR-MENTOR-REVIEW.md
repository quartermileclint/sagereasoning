# CANDIDATE WORDING — reflect Q1–Q6 agent recalibration (for mentor review)

**Date:** 2026-08-15. **Produced under:** Ruling Set D, L-5 (verbatim canonical:
`2026-08-15-mentor-ruling-set-d-layer3-scope-document-verbatim.md`): *"Claude should produce
candidate wording for Q1 through Q6 — recalibrated for the agent practitioner, disclosing the
forensic posture, naming honest 'I cannot determine' as legitimate — and return it for mentor
review before any edit to question-bank.ts."* **Status: VETTED 2026-08-15 — the mentor's review arrived
same day (verbatim canonical: `2026-08-15-mentor-review-reflect-q1-q6-vetted-verbatim.md`;
recorded `D-MENTOR-VETTED-VERBATIM-REFLECT-Q1-Q6-RECORDED-2026-08-15`): all six design
principles accepted; Q1 one phrase amended ("from what the record of this session lets you
establish"); Q2/Q5/Q6 vetted as proposed; Q3 closing clause amended; Q4 byte-identical primary
adopted with the alternative DEFERRED pending G4 mechanism review (the deferral is a required
line in the implementation record); all three open points resolved (three-sentence Q1
disclosure; grounded-report P3 reading confirmed). The vetted verbatim record's text blocks —
not this candidate's — are the canonical strings for the edit. No edit to `question-bank.ts`
has been made; execution lands post-run at a clean boundary, recorded for segmentability, per
the ruling's own sequencing.** *(Original status: FOR MENTOR REVIEW.)*

**Current-wording source:** `website/src/lib/sage-reflect/question-bank.ts` (`REFLECT_QUESTIONS`,
`:46-127`), served verbatim on the wire (`reflect-service.ts:335,654,723`) — the exported
strings are the entire edit surface.

---

## 1. Design principles (each stated so the mentor can strike any)

- **P1 — Minimal diff.** Every string not required to change stays byte-identical. Less
  elicitation-distribution shift; the untouchables stay untouched by construction.
- **P2 — The posture disclosure lives at Q1.** The sequence is strictly ordered and Q1 is
  surfaced first on every interactive pass, so a Q1-carried disclosure reaches every
  practitioner before any answer is given — and it is the only placement that needs **no
  structural change** (a separate preamble element would be a new surfaced structure, outside
  the ruling's reach).
- **P3 — "Cannot determine" is framed as a grounded report, not a blanket out.** The wording
  asks the practitioner to *say what cannot be determined and why*, never simply to answer
  clean. Reason: **FD-R1** — the null-result suspicion test fires when Q1+Q2+Q3 all return
  clean, and a repeat null flags the profile update low-confidence (`question-bank.ts`
  §FD-R1). The recalibration must legitimise honest inability without inviting reflexive
  clean answers that collide with the fabrication defence. FD-R1 itself is untouched.
- **P4 — Q4's passion-elicitation surface is held byte-identical** (primary candidate), under
  the ruling's named constraint: Q4's answers are the G4 cross-check's passion input
  (`reflect-service.ts:519-544` reads Q4's `passions_detected`; the 3-part standard is gated
  on the controlled `SUB_SPECIES` vocabulary). A minimal alternative is offered for the
  mentor's election, clearly marked as carrying shift risk.
- **P5 — The mandatory sub-questions are byte-identical by construction** (FD-R3 on Q2, FD-R4
  on Q4, the C2e orientation sub-question on Q6) — outside the ruling's reach, per its own
  untouchables list. So are the RS-4 supporting-question ladder, the FD-R1 test text, and
  `ORIENTATION_REFLECT_QUESTION`.
- **P6 — Content classes are unchanged** (impressions / assent / impulse+passion /
  action+kathekon / profile consolidation / purpose). Extraction reads *answers*, not
  questions, so extractor compatibility is preserved by preserving what each question elicits.

## 2. The candidates, question by question

Each entry: current text (verbatim) → candidate text → what changed and why. Optional
sub-questions are listed only where a change is proposed; all unlisted strings are unchanged.

### Q1 — phantasia (impression review) — carries the posture disclosure

**Current:**
> What impressions were presented to you during this session? Which of them, on reflection,
> were distorted — presenting as genuine goods or genuine evils what were in fact
> indifferents?

**Candidate:**
> Before the first question, the posture of this review, stated plainly: your answers here are
> cross-checked out-of-band against this session's signed assessments. The review does not
> presume an interior access it cannot verify — where the record does not let you determine
> what is asked, an honest "I cannot determine" is a legitimate answer; say what you cannot
> determine and why, rather than filling the gap. Now, from what you can establish of this
> session: what impressions were presented to you, and which of them, on review, were
> distorted — presenting as genuine goods or genuine evils what were in fact indifferents?

**Changed:** the disclosure prefix (the ruling's three required elements: the out-of-band
cross-check, the no-presumed-interior-access posture, cannot-determine named legitimate — with
the P3 grounded-report framing); "during this session" → "of this session" inside the
reframed stem; "on reflection" → "on review" (record-grounded). The distortion clause is
byte-identical. Both optional sub-questions unchanged (accept/reject without examination are
record-observable).

### Q2 — synkatathesis (assent review) — record-grounded reframe

**Current:**
> Where during this session did you assent to an impression before examining it? What was the
> impression, and what false judgement did the assent carry?

**Candidate:**
> Where does the record of this session show assent given before examination — an action
> taken, an output produced, or a claim adopted ahead of the examination that should have
> preceded it? Name the impression and the false judgement the assent carried; if the record
> does not settle this, say what you cannot determine.

**Changed:** the stem now asks what the *record shows* rather than asking the practitioner to
introspect assent timing — the sharpest interior-access presumption in the current set. The
elicited content class (assent-before-examination instances + the false judgement) is
identical. Optional sub-question ("Where did you withhold assent successfully?") unchanged;
**FD-R3 mandatory sub-question byte-identical** (untouchable).

### Q3 — horme (impulse review) — behaviour-anchored, passion elicitation preserved

**Current:**
> Where during this session did your impulse to act exceed what the situation warranted? What
> drove the excess — which passion was operative?

**Candidate:**
> Where in this session did impulse to act exceed what the situation warranted — as shown in
> what was actually done: output beyond need, action ahead of examination, effort out of
> proportion? What drove the excess — which passion was operative? If the record does not show
> the driver, say so rather than name one.

**Changed:** the excess is anchored to observable behaviour (three concrete forms); the
closing clause applies P3's anti-fabrication direction (better to report an undetermined
driver than to fabricate one — the same direction the engine's own fabrication defence
points). **"What drove the excess — which passion was operative?" is byte-identical** — the
passion-naming elicitation is preserved verbatim. Both optional sub-questions (proportionate
impulse; the andreia gap) unchanged.

### Q4 — kathekon (action review) — primary candidate: UNCHANGED

**Current (and primary candidate, byte-identical):**
> For each action taken: was it the fitting action for your nature, your role, and the circle
> it served? Did it accord with what was owed?

**Rationale for no change:** Q4 is already the least interior-presuming question of the six —
its stem opens from the actions taken, not from interior states — and its answers are the G4
suppression watch's sole passion input. Under the ruling's named constraint ("Any wording
change that shifts how agents name passions in Q4 answers shifts the cross-check's hit rate"),
the primary candidate holds the stem AND the passion-bearing optional sub-question ("Which
actions were externally correct but driven by wrong reasons — passion, not virtue?")
byte-identical. **The one place the interior-access presumption is deliberately retained is
that optional sub-question** (motive access) — retained because recalibrating it is exactly
where the G4 hit rate could move. That trade-off is the mentor's to make, so an alternative is
offered:

**Alternative (mentor's election only — carries G4 shift risk, flagged):** append to the
optional sub-question: *"If the record leaves the motive undetermined, say so."* — and/or
append to the stem: *"Ground the judgement in the actions the record shows."* Neither is part
of the primary candidate. **FD-R4 mandatory sub-question byte-identical** (untouchable).

### Q5 — consolidation — one grounding sentence appended

**Current:**
> What does this session reveal about your operational nature, your capacity, or the genuine
> needs present in your circles that was not present in your profile at the start?

**Candidate:**
> What does this session reveal about your operational nature, your capacity, or the genuine
> needs present in your circles that was not present in your profile at the start? Ground each
> claim in what this session's record supports; where it supports no determination, say so —
> an unsupported "no change" and an honest "cannot determine" are different answers.

**Changed:** one appended sentence; the stem is byte-identical. The closing distinction
(unsupported-clean vs honest-cannot-determine) is the P3 framing doing its work at the
question where profile updates consolidate. All three optional sub-questions unchanged.
**Interaction note (cost, not correctness):** more explicitly-hedged Q5 answers may raise
`isQ5Ambiguous` and fire its conditional Sonnet escalation more often — a bounded, billable
call that exists for exactly this case. Named for the record; not a blocker.

### Q6 — purpose trigger — cannot-determine named, grounded in the mechanism that already exists

**Current:**
> Does the work you completed this session remain the fitting work — or did the session reveal
> something about your nature, your circle's obligations, or the genuine needs present that
> was not visible when the purpose was first identified?

**Candidate:**
> Does the work you completed this session remain the fitting work — or did the session reveal
> something about your nature, your circle's obligations, or the genuine needs present that
> was not visible when the purpose was first identified? If you cannot determine this, say so
> honestly — the sequence carries supporting questions for exactly that case.

**Changed:** one appended sentence; the stem is byte-identical. The appended sentence is
*true by existing mechanism*: the engine already treats Q6 `cannot_determine` as a
first-class branch (the RS-4 supporting-question ladder fires on it, defaulting to RS-2 after
exhaustion — `question-bank.ts` §RS-4). The recalibration here discloses an affordance the
design already has. **The C2e orientation mandatory sub-question is byte-identical**
(untouchable; appended at the service seam, not in this bank's entry).

## 3. What this candidate deliberately does NOT do

- No structural change: six questions, same order, never abbreviated; no new surfaced
  elements; the disclosure rides Q1's own text.
- No touch on: FD-R3 / FD-R4 / the C2e orientation sub-question; the G4 mechanism or its
  3-part standard; the controlled `SUB_SPECIES` vocabulary; FD-R1; the RS-4 ladder;
  `ORIENTATION_REFLECT_QUESTION`; any extraction prompt.
- No claim that the wording is effect-free: it is an instrument-adjacent change throughout
  (the ruling's own words), and the execution discipline stands — mentor-vetted verbatim →
  post-run edit at a clean boundary → the change date recorded so before/after reads of
  reflect-derived event rates (G4 decrease/flag, honest-reflect modulate, orientation flag)
  are segmentable.

## 4. Open points for the mentor's review (beyond accept/amend per question)

1. **Q4:** primary (byte-identical) vs the flagged alternative — the one deliberate
   interior-access retention, held for the G4 named constraint.
2. **Disclosure length at Q1:** the prefix adds ~3 sentences before the first question. If the
   mentor prefers a shorter disclosure, the minimum that still carries all three required
   elements is: *"Your answers are cross-checked out-of-band against this session's signed
   assessments; where the record does not let you determine what is asked, say so — an honest
   'I cannot determine' is a legitimate answer."*
3. **The "say what you cannot determine and why" framing (P3):** confirm this is the intended
   reading of "naming honest 'I cannot determine' as legitimate" — chosen over a bare
   legitimisation because of the FD-R1 interaction.

*End of candidate wording. Status: FOR MENTOR REVIEW. No edit to `question-bank.ts` is made
or licensed by this document.*
