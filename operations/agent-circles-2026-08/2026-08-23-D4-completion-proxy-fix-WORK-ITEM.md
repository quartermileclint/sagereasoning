# WORK ITEM — the D4-completion proxy fix, and the disclosure it retires

**Status: CLOSED 2026-08-23** — `D-D4-COMPLETION-RULING-FACULTY-DELIBERATION-PROXY-REPLACED-2026-08-23`.
The proxy is replaced and every surface this file's completion gate enumerates was cleared in the
same commit. The closure record is at the end of this file; everything above it is preserved
verbatim as the condition that was actually discharged, not rewritten to match the outcome.

*(Original status, retained: **OPEN. Not scheduled. Not licensed.** This file existed to make a
removal condition trackable, not to schedule the work it gated.)*

**Created 2026-08-23** on a founder governance-hygiene note raised while reviewing the EE
Shape-1 R18 sign-off package. The note, in the founder's own framing: the interim disclosure's
removal condition was stated correctly in the published text and in the decision log — but
**named nowhere as a work item**, so it existed only in the artifact it was a condition on.
That is the lesson-cited-not-tracked pattern the reflections-examination arc has itself been
examining. A published condition with no owner is a condition that gets published forever.

---

## The work item

**Replace `ruling_faculty_state`'s deliberation proxy.**

`ruling_faculty_state`'s deliberation input currently counts the *presence* of deliberation
notes rather than testing whether any note is **substantive** — so the filler note
*"No circles engaged in this snapshot."* is counted as deliberation.

The D4 correction that fixed this class was **deliberately scoped to the proximity reading
only**: `hasGenuineDeliberation` (`layer2-mechanisms.ts`) requires a substantive note and
governs proximity; `ruling_faculty_state` was left on the older proxy. Its own docstring says
so, verbatim: *"ruling_faculty_state is untouched this session (the broader proxy
re-examination is a named follow-up)."*

**Standing:** a code item with its own PR19-reviewed build scoping when elected. Nothing in
the EE arc licenses it — EE-E3 confirmed it *"keeps its own standing"*, and this session's
only contribution to it was EE-C2's ruling on the interim label.

---

## THE COMPLETION GATE — this is why the file exists

**The fix is not complete until the interim disclosure is removed in the same commit.**

EE-C2, ruled: *"it is removed when the D4-completion code follow-up lands and the proxy is
replaced… the documentation-map entry is removed at the same commit that fixes the proxy. This
is named now, not left to the build session to discover."*

Concretely, the commit that replaces the proxy must ALSO remove:

1. **§4 of** `operations/agent-circles-2026-08/2026-08-23-evaluative-engine-status-documentation-map.md`
   — the interim-label entry, including its own restatement of this condition.
2. **The `Interim disclosure — ruling_faculty_state` paragraph** from the live
   `llms.txt` "Epistemic status of engine outputs" section — *if and once the Shape-1 R18
   publication has shipped*. Check whether it is live before assuming it is; as of this file's
   creation the publication was awaiting founder signature.
3. **The corresponding clause** in the `epistemic-status-map/v1` extension description in
   `website/public/.well-known/agent-card.json`, same condition.

**Same commit. Not a later tidying pass.** A disclosure that outlives the limitation it
discloses is not a harmless leftover — it is a false statement about the engine's current
basis, published on a public surface.

---

## What this file does NOT do

- It does not schedule the fix, license it, or scope it.
- It does not claim the proxy is a defect requiring urgent attention — the limitation is known,
  documented in code, and honestly disclosed while it stands. That is the whole point of the
  interim label.
- It does not touch the reflections-examination arc's own four sequenced work items. This is a
  code item on the evaluative engine; it is filed in the EE arc's own directory rather than
  folded into an arc it does not belong to.

## Cross-references

- `2026-08-23-mentor-rulings-evaluative-engine-epistemic-status-verbatim.md` — EE-C2, EE-E3 (binding)
- `2026-08-23-evaluative-engine-status-documentation-map.md` — carried the disclosure this gated, in
  its §4; that section was removed at closure and §5–§8 renumbered, so there is no §4 to point at now
- `2026-08-23-evaluative-engine-shape1-r18-signoff-package.md` — the publication half
- `D-ATRF-EE-PRODUCTION-WAVE-BUILT-PR19-FOLDED-2026-08-23`

---

## CLOSURE RECORD — 2026-08-23

**Decision-log entry:** `D-D4-COMPLETION-RULING-FACULTY-DELIBERATION-PROXY-REPLACED-2026-08-23`.
**Commit:** the one that carries this file's CLOSED status — its hash is recorded in the session
close (a commit cannot contain its own hash).

### The completion gate, item by item

| # | Surface | Cleared |
|---|---|---|
| — | `layer2-mechanisms.ts` — the proxy itself | ✅ the `computeRulingFacultyState` call site now passes `hasGenuineDeliberation(oik)`; `hasGenuineDeliberation`'s own docstring, which recorded the gap, is rewritten in the same edit |
| 1 | documentation map §4 (the interim-label entry) | ✅ section removed; §5–§8 renumbered to §4–§7; §5's "named, not built (see §4)" bullet — which became false the moment the fix landed — rewritten as a closure note |
| 2 | `website/public/llms.txt` — the `Interim disclosure — ruling_faculty_state` paragraph | ✅ removed. It **was** live (the Shape-1 R18 publication had shipped), so the check this file asked for was performed rather than assumed |
| 3 | `website/public/.well-known/agent-card.json` — the clause in `epistemic-status-map/v1` | ✅ clause removed from the extension description; the extension itself stays; JSON re-parses, extension count unchanged at 24 |

### The flag election (the question the build prompt left open)

**No flag.** `ruling_faculty_state` is consequential under EE-B1 on conditions (b), (c) and (d) —
served on a public surface, carried into the accreditation record, and named in a disclosure — but
**not on (a)**: nothing floors or determines a verdict from it. Traced first-hand: `/api/guardrail`'s
`proceed` comes from `katorthoma_proximity`; `guardrail-sandwich` and `philosophical-mode-service`
read the field for **prose only**; no trust-event deriver, aggregator, or overlay reads it at all.
The §4 precedent (`SUBSTRATE_PROXIMITY_DIKAIOSYNE_ENABLED`) gated a change that moved verdicts. This
one does not.

The decisive consideration is this file's own gate. EE-C2 binds the disclosure's removal to the
commit that fixes the proxy. A flag separates *the commit that fixes it* from *the moment it is
fixed*, and the disclosure's truth-condition tracks the second. A flag-gated build would therefore
either publish "fixed" while dark (a false statement, the precise failure this file exists to
prevent) or defer removal to activation (contradicting "at the same commit… not left to the build
session to discover"). A flag would buy near-zero risk reduction — nothing gates on the field — at
the cost of fighting the ruling. Full reasoning in the decision-log entry.

### What was NOT done, deliberately

- `computeProximity`'s `!dikaiosyne` branch still reads the raw legacy proxy. It is the
  byte-identical pre-§4 path; narrowing it is an unrelated regression. A battery assertion now
  **pins** that branch and goes red if a later session "tidies" it.
- No flag, no schema, no migration, no credential, no live op.
