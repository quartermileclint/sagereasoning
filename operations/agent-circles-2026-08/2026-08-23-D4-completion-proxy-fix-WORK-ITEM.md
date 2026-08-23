# WORK ITEM — the D4-completion proxy fix, and the disclosure it retires

**Status: OPEN. Not scheduled. Not licensed.** This file exists to make a removal condition
*trackable*, not to schedule the work it gates.

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
- `2026-08-23-evaluative-engine-status-documentation-map.md` §4 — the disclosure this gates
- `2026-08-23-evaluative-engine-shape1-r18-signoff-package.md` — the publication half
- `D-ATRF-EE-PRODUCTION-WAVE-BUILT-PR19-FOLDED-2026-08-23`
