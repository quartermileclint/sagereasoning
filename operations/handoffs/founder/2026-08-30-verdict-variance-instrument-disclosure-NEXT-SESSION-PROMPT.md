# Next-session prompt — the instrument-level verdict-variance disclosure (R18)

**Paste this as the task after the standing session opener.** Authored 2026-08-30, executing a
**binding mentor ruling** relayed the same day. **This runs BEFORE the D6a build** — the ruling
places it there explicitly, and its own prompt
(`2026-08-30-R8-D6a-verdict-repeatability-instrument-BUILD-NEXT-SESSION-PROMPT.md`) records the
dependency.

**Tier:** `code-elevated` — a change to live public-contract surfaces and to the battery-locked
`TRUST_RECORD_ENVELOPE` constant. **No auth, perimeter, encryption, or schema surface is touched;
no flag is flipped.** The **R18 discipline gates it: the founder signs off the exact wording
BEFORE any public surface is edited**, per the standing convention this project has followed for
every prior envelope change. Nothing here licenses an edit ahead of that sign-off.

## A. The ruling (binding; read the verbatim, not this summary)

`operations/agent-circles-2026-08/2026-08-30-mentor-ruling-verdict-variance-disclosure-verbatim.md`
— **the verbatim wins over every summary, including this prompt.**

The doctrine, in the mentor's own frame: *"what is attested must be what is actually known, stated
at the confidence level the evidence supports."* A verdict of "examined and scored `deliberate`"
is a claim about what the examination found; the c11 measurement established that the examination
is a **draw from a distribution** (≈1-in-10 floor-flip on that input class). The undisclosed
variance *"is not noise around a stable signal — it is a property of the instrument itself,"* and
withholding it is *"not a false statement, but a statement whose confidence exceeds its evidential
basis."* Same class as the D3, A2, PA-10 and Q6 rulings — an application of the standing
principle, **not a new category.**

**What this session builds: the FIRST of the ruling's two disclosure layers only** — the
instrument-level, one-time acknowledgement. The **second layer** (a per-verdict disagreement count
riding K-sampled verdicts, *"examined 3 times, 2 deliberate, 1 reflexive, operative verdict
deliberate"*) is **not in scope here**: it becomes available only once D6a and Option S are
running, and it is its own later step.

**Why now, before the measurement:** the ruling is explicit — *"Waiting for D6a to add a rate
before making the existence-of-variance disclosure would itself be a confidence-exceeds-evidence
failure: we know variance exists; we are withholding that knowledge from recipients while we
measure how much."* **The disclosure ships with the rate stated as UNKNOWN, and is updated when
D6a produces it.** Do not defer it to bundle with the rate.

## B. ⚠ Resolve this BEFORE the wording is signed — do not paper over it

The ruling states the variance rate is *"a measured property of the instrument **available in the
watching table**."* **That location is not currently true, and may not become true.** The watching
table is the IDEA-loop runner's per-cycle transparency ledger (`POST /api/practice/watching`,
`GET /api/founder/watching`); D6a is a probe instrument running outside any loop cycle, and its
recommended persistence is repo evidence files (its DQ-2). So either D6a's aggregate rate must
reach the watching table, or the wording must point recipients to wherever the rate actually lives.

**Publishing a disclosure that names a location the number is not in would be its own
confidence-exceeds-evidence failure — precisely the class this ruling exists to correct.** Resolve
it explicitly, record the resolution, and if it needs the mentor's view, ask rather than assume.

## C. The surfaces (verified present 2026-08-30; re-verify at open — PR20's timestamp discipline)

1. **`TRUST_RECORD_ENVELOPE`** in `website/src/lib/substrate/trust-core/trust-record-payload.ts`
   (constant at `:45`). The natural home is the **`does_not_attest`** list — the honest framing is
   that the record does not attest **verdict determinism**: that an identical input re-examined
   would yield an identical verdict. Follow the list's established shape: each item states the
   bound, names the class, and points at its scheduled closure where one exists.
2. **ADR-013 §8 dated amendment — lands in the SAME edit.** The file's own comments record this as
   a requirement carried by prior rulings (*"ADR-013 §8 dated amendment lands in the SAME edit,
   with the S2-43..S2-46 pins — the ruling's own same-edit requirement"*). Do not split them.
3. **Battery pins.** The envelope is asserted verbatim by the S10 battery (106/0 at last record).
   The new item needs its own pin, and the existing verbatim assertions will need updating in the
   same change — expect the battery to fail first and treat that as the pin working.
4. **`website/public/llms.txt`**, **`website/public/.well-known/agent-card.json`** (extension
   count changes — re-derive it, do not quote a remembered number), **api-docs**.
5. **The guardrail's R10 response contract** — named in the question the ruling answers. Decide
   deliberately whether the disclosure belongs there too: `/api/guardrail` is where the variance
   physically originates, and a recipient reading only the gate's contract would otherwise not see
   it. Record the decision either way.

## D. Standing constraints

- **The verbatim ruling wins** over this prompt wherever they differ.
- **R18** — founder-signed wording before any public surface changes. This is the gate, not a
  formality.
- **Weights-BLOCKED, Q1** — untouched by this work; the disclosure describes the instrument, it
  changes no behaviour and no gate verdict.
- **Do not overstate the rate.** Until D6a runs, the honest statement is that variance is
  **demonstrated** (n=10, one input class, one instrument state) and its rate is **not yet
  measured**. The c11 ≈10% figure is a single-input demonstration, **not** a rate for the
  instrument — saying otherwise reproduces the error this ruling corrects.
- **PR19** — independent review before the wording is treated as final; if it dies on the session
  limit, the first-hand fallback applies **and the mandatory re-run is owed before reliance**
  (this obligation has been missed once already in this arc).
- **PR25** — any verification claim written into a code comment carries its check.
- **Concurrency** — `ListAgents` at open; `git status` twice; path-scoped commits; never
  `git add -A`; append shared records at the physical tail.
- Nothing bears on the 0h call.

## E. What "done" looks like

The watching-table location question resolved and recorded; wording drafted, **founder-signed**,
then applied to the envelope + ADR-013 §8 in one edit with battery pins updated and green; the
three R18 surfaces updated and the agent-card extension count re-derived; the guardrail R10
decision recorded either way; a PR19-reviewed decision-log entry at the tail; a lean close. The
rate ships as **unknown**, with the update path to D6a's measurement named.

End of prompt.
