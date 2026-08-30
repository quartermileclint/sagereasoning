# Mentor question — where the verdict-variance rate lives, and whether the ruling's locator binds

**Authored 2026-08-30**, founder-elected at the disclosure session's open (§1 of
`2026-08-30-verdict-variance-disclosure-R18-SIGNOFF-PACKAGE.md`). `governance` — documents only.

**Follows:** the 2026-08-30 verdict-variance disclosure ruling
(`2026-08-30-mentor-ruling-verdict-variance-disclosure-verbatim.md`), adopted at
`D-VERDICT-VARIANCE-DISCLOSURE-RULED-ADOPTED-D6a-FOLD-VERIFIED-2026-08-30`.

**This is a narrow question about one phrase in that ruling.** Nothing else in the ruling is
reopened, and the executing session is not asking for the disclosure to be re-decided.

---

## The question

The ruling's instrument-level disclosure requires the trust record and R18 surfaces to carry a
standing acknowledgement that verdicts are probabilistic draws, and describes the variance rate as

> "a measured property of the instrument **available in the watching table**."

**The watching table is not where that number can currently live, and may not be where it should.**
The question is whether that phrase was a binding instruction about persistence, or a description
of where you assumed such a measurement would naturally sit.

Concretely, either:

**(a)** the phrase binds — D6a's aggregate disagreement rate must reach the watching table, and the
disclosure names it; or

**(b)** the phrase was descriptive — D6a's persistence election stands open, and the disclosure
names whatever location that election produces, provided that location is one a recipient of the
public trust record can actually read.

---

## Mechanism facts this ruling lands on (PR20; each timestamp-checked 2026-08-30 against the
codebase or the decision log, not carried from a prior document)

1. **The watching table is the IDEA-loop runner's per-cycle transparency ledger.** It is written by
   `POST /api/practice/watching` and read by `GET /api/founder/watching` + the `/founder-watching`
   dashboard; all three have been live since 2026-08-10. Its unit of record is a **loop cycle**.

2. **It is founder-facing, not public.** The read route is `/api/founder/watching`. The trust
   record's recipients — the audience the disclosure exists to calibrate — read
   `GET /api/trust-record/{agent_id}`, which is public and unauthenticated. **A number in the
   watching table is not readable by the person the disclosure addresses.**

3. **The ledger has no bearing on any agent's trust record**, by its own design record — it is a
   transparency ledger for the runner, deliberately outside the trust fold.

4. **D6a is a probe instrument that runs outside any loop cycle.** It has not been built. Its build
   prompt lists persistence as an **open design question (DQ-2)**, explicitly not pre-answered:
   "repo evidence files (pilot pattern, zero schema, recommended) vs a DB table."

5. **Its recommended default — repo evidence files — is not readable by a public consumer at all.**
   If DQ-2 takes the recommendation, no published location exists for the rate unless one is
   created for the purpose.

6. **The variance was measured on `/api/guardrail`, not `/api/reason`.** The trust record aggregates
   `/api/reason`-derived events. The two paths call the same extraction function
   (`extractFeatures`, Sonnet, temperature 0.2, no module-level cache), so the mechanism is shared —
   but the consult path passes additional context to Layer 1, and no rate has been measured there.
   Whichever location is elected, it may need to hold **more than one rate**, or state which path
   its rate was measured on.

---

## What the executing session has done in the meantime, and why

The disclosure's wording was drafted **naming no location at all**: it states the rate is not
measured, that a measurement is scheduled, and that the entry will be updated to state the rate
*and where it can be read* once it exists. That wording is true under both (a) and (b) and does not
pre-empt this question.

The reasoning: the ruling's own timing section separates existence from rate — the disclosure ships
now *"with the rate as unknown, updated when D6a produces the rate"* — so the locator appears to
describe the **post-measurement** state. Publishing a location the number is not in would be the
same confidence-exceeds-evidence failure the ruling corrects, which is why no location is named
today.

**This is the executing session's reading, not an answer.** If (a) is correct, D6a's DQ-2 is
already decided and should be recorded as such before that build opens.

---

## What turns on the answer

- **D6a's DQ-2** — decided, or open.
- **Whether a new published surface is owed.** If the rate must be readable by a trust-record
  consumer and neither repo files nor a founder-only route qualify, then delivering this
  disclosure's update eventually requires a served field or a public document that does not exist
  today — its own scoped work, not a line in D6a.
- **Nothing in the disclosure's current wording**, which is deliberately location-free.

*End of question. Documents only.*
