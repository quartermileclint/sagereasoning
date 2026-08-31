# Next-Session Prompt — Route the deliberation-reading doctrinal open question to its correct home

**Paste as the first message of a new session, in the `sagereasoning` repo root.**

**Stream:** founder.
**Tier:** `governance` — **documents only.** No code, no flag, no schema, no credential, no public
surface, no live operation. **AC7 not engaged.**
**Risk:** Standard under 0d-ii.
**Governing frame:** `/adopted/standing-protocol-cache.md`.
**Predecessors:** commits `bcd8ed0` and `8aa9fae`, both pushed and **live-confirmed on production**
(`D-OIKEIOSIS-SCOPE-NOTE-R18-PUBLISHED-2026-08-24`,
`D-KATORTHOMA-PROXIMITY-DELIBERATION-TERM-SCOPE-NOTE-PUBLISHED-2026-08-24`).

**This session is SMALL — one routing question, put to the mentor, then recorded.** It is a
legitimate candidate for folding into a larger `governance` session rather than run alone; that is
the founder's call. What it must NOT do is quietly pick a home by AI judgement, because the reason
it exists is that the AI's own verification found the mentor's stated premise does not hold.

---

## Step 0 — Open and re-ground

1. Read `/adopted/standing-protocol-cache.md`.
2. **Read the binding ruling in full, verbatim governing:**
   `operations/agent-circles-2026-08/2026-08-24-mentor-ruling-katorthoma-proximity-scope-note-and-doctrinal-open-question-verbatim.md`
   — specifically its **Secondary question** section, which is what this session serves.
3. Read `2026-08-23-evaluative-engine-status-documentation-map.md` **§5b, §5c and §5d**. §5d is the
   open question; §5b/§5c are the two published notes that disclose the proxy without resolving it.
4. `git log -1` / `git status` — confirm HEAD is at or after `8aa9fae`.
5. `ListAgents`, and check `git status` for edits to `adopted/` — see the coordination note below.
6. Confirm at open: tier; hold-point P0 0h; weights BLOCKED; **documents only.**

**Do not re-verify the publication.** All three surfaces were live-confirmed against production at
the predecessor session's close, after push and a green Vercel deploy: `llms.txt` carries both scope
notes (2 matches for the shared phrase, 1 for the proximity heading); the live `agent-card.json`
serves 24 extensions with both clauses present inside `epistemic-status-map/v1`; the live `/api-docs`
page carries the proximity clause. Nothing about the publication is open.

---

## Part A — What is owed

**The mentor ruled (2026-08-24, second ruling) that the doctrinal question is OPEN and must be
carried deliberately.** The question:

> Does a ruling faculty that is deliberating in the control-filter, value-assessment, or
> causal-stage mechanisms — but not in the oikeiosis mechanism — count as deliberating, in the
> Stoic sense?

**The mentor's own answer is not neutral, and is already recorded:** the *hegemonikon* is **not
partitioned by mechanism**; Epictetus describes a unified rational capacity. Therefore
*"the oikeiosis-only reading is not the doctrinally correct reading… It is a proxy — a tractable
computational approximation."* Both published notes disclose it as such. **The disclosure question is
closed. The design question is not.**

**The specific instruction this session serves, verbatim:**

> *"carry this as a named open question in the build sequence — specifically, as a scoping question
> for the generation-step or standing-runner design sessions, where the deliberation reading's
> architecture is already in scope. Do not let the published note stand as the resolution."*

The predecessor session recorded the question at map **§5d**. That is a records document. The mentor
said *"in the build sequence."* **§5d is not yet anchored anywhere a design session will actually
read it** — which is the whole of what remains.

---

## Part B — The finding that must be put to the mentor, not resolved by the AI

**PR20 verification of the ruling's own premise, performed first-hand at the predecessor session's
close. The premise — *"where the deliberation reading's architecture is already in scope"* — does not
appear to hold for either home the mentor named.**

| Named home | Verified state |
|---|---|
| **Generation-step scope** (`operations/agent-circles-2026-08/2026-08-09-generation-step-scope.md`) | Exists, 75KB, extensively ruled. **Does not discuss the deliberation reading.** Every `deliberat*` hit is the adverb ("deliberately NOT an input") or config-jitter language ("deliberate variation in which friction point is examined"). No `ruling_faculty`, no `hegemonikon`, no oikeiosis-only bound. |
| **Standing-runner design** | **The document does not exist.** No file matches `*standing-runner*`. Per `operations/primal-substrate-2026-08/00-PRIORITY-INDEX.md`, the standing-runner design is **parked on the bounded validation run's §6 report** — so this home cannot receive an anchor yet, only a forward reservation. |

**And there is a third candidate the mentor may not have known about, which fits the question's own
shape better than either:**

`operations/agent-circles-2026-08/2026-08-12-SESSION-hegemonikon-drift-and-melete-SCOPING-RECORD.md`
— **RULED 2026-08-15 on items 1–4, and explicitly STILL OPEN for the "uniformity-reads-as-stable"
family.** Three reasons it is a strong fit, each verified against the record:

1. **It is already the hegemonikon session by name.** §5d's question is a hegemonikon question in
   the mentor's own framing ("the hegemonikon is not partitioned by mechanism").
2. **Its central ruled finding is the SAME SHAPE of defect.** Ruling Set B, R-1: the
   `computeDispositionStability` sharpening — *zero variance certifies `advanced` / "approaching
   hexis"*, and the conflation is **stability-under-perturbation vs absence-of-perturbation**
   (Seneca *Letters* 75.8–9). That is a narrow mechanism signal carrying a label implying something
   broader — structurally identical to an oikeiosis-only deliberation term labelled as the ruling
   faculty's deliberation.
3. **It is already the machinery this note class uses.** Its R-2/M-A adopted an explicit
   `does_not_attest` item under founder R18 sign-off, with an ADR-013 §8 dated amendment plus
   `trust-record-payload.ts` plus the S10 battery in the same edit — the same publication pattern
   §5b/§5c followed.

**Do NOT re-route on the strength of the above.** The mentor named two homes; the AI found the
premise unmet for both and found a third. That is a finding to relay, not a decision to take. Put it
to the mentor and let the routing be ruled.

### What to put to the mentor

A short brief — no more than a page — containing:

- The verified state of the two named homes (the table above, first-hand).
- The hegemonikon-drift candidate and the three reasons, **including the structural parallel to the
  `computeDispositionStability` conflation**, which is the substantive point.
- One genuine question of principle the founder may want ruled alongside the routing: **is the
  oikeiosis-only deliberation term and the zero-variance-certifies-`advanced` finding ONE defect
  class or two?** If one, the routing follows automatically and a single scoping session should hold
  both. If two, they need separate homes and the parallel is coincidental. The AI should not answer
  this — it is exactly the kind of judgement the shape-vs-substance distinction turns on, and the
  mentor has ruled on one half of it already.
- Explicitly: **nothing here asks to open the doctrinal question as a build item.** The mentor's
  *"do not let the published note stand as the resolution"* is honoured by anchoring, not by
  designing.

---

## Part C — Build order

1. Author the brief (above). Path: `operations/agent-circles-2026-08/2026-08-24-MENTOR-BRIEF-deliberation-reading-open-question-routing.md`.
2. **Relay to the mentor. Stop there if no ruling is available this session** — a prepared brief with
   nothing anchored is a legitimate outcome, not a failure. Do not pick a home to avoid stopping.
3. On a ruling: record it verbatim in `operations/agent-circles-2026-08/` under the established
   naming convention, adopted as binding on the founder's relay.
4. Anchor §5d where ruled — a pointer in the receiving document plus a reciprocal cross-reference
   back to map §5d, so neither can drift out of sight of the other. If the ruling routes it to the
   standing-runner design, record it as a **forward reservation** with its gate named (the validation
   run's §6 report), since that document does not exist yet.
5. Add the routing to `operations/primal-substrate-2026-08/00-PRIORITY-INDEX.md` if and only if the
   ruling puts it in that family's sequence — the index is that family's register, not a general one.
6. **Lean decision-log entry.** Name: the premise finding, the ruling, the home, and that the
   doctrinal question remains OPEN and undesigned.
7. **Path-scoped commit**, excluding `website/src/data/environmental-context.json` and anything under
   `adopted/` this session did not itself author. Hand the founder the push.

---

## Constraints that bind

- **Do not open the doctrinal question as a build item.** Ruled explicitly. Anchor it; do not scope
  a fix. The published notes disclose the proxy; whether the proxy is the right design is for the
  receiving session.
- **Do not touch the two published notes.** `bcd8ed0` and `8aa9fae` are live and verified. Nothing
  in this session's scope changes a public surface, so **R18 does not engage** — if a draft starts
  proposing public wording, it has drifted out of scope.
- **Do not re-litigate the lifetime.** §5b's lifetime was restated by ruling to *"until the
  deliberation reading reflects the full ruling faculty's deliberative state across all mechanisms."*
  The prior formulation is retained as superseded record. Both notes inherit it.
- **Do not cite `website/smoke_a_prod.json` under §5c.** It is evidence for §5b only. Its
  `katorthoma_proximity` is `principled`, reached by a branch carrying **no deliberation term** — the
  term never bit on that snapshot. §5c records this explicitly; do not undo it.
- **Do not re-open** `D-D4-COMPLETION-…-2026-08-23`, or either publication. All closed.
- Weights BLOCKED. The Q1 hard constraint untouched. Nothing here bears on the 0h call.

---

## Coordination note — carried, and it has already materialised once

During the predecessor session, `adopted/project-instructions-snapshot.md` and
`adopted/standing-protocol-cache.md` became modified in the working tree by a **concurrent session** —
neither predecessor commit touched `adopted/` (confirmed by name-only inspection). Eight peer
sessions were open. Path-scoped commits kept it harmless.

**Two consequences for this session.** First: read `adopted/standing-protocol-cache.md` at open
knowing it may have changed under you, and prefer the file over any memory of it. Second: this
session edits shared records (`00-PRIORITY-INDEX.md` is a likely target, and it is heavily
co-edited) — `git status` before writing and again before committing, and commit path-scoped. A
working-tree check detects staged and committed state but **not** another session mid-edit; if that
is going to keep happening, a real mechanism is owed and is worth naming to the founder.

---

## Rollback

`git revert` the records commit. Documents only; nothing deploys from the map, the index, or the
decision log.

## What "done" looks like

The doctrinal question is anchored where a design session will actually encounter it, by ruling
rather than by AI choice; the premise finding is on the record rather than absorbed; the question is
still explicitly OPEN and undesigned; and §5d and its new home each point at the other. If the mentor
is unavailable, "done" is the brief authored and nothing anchored.

*End of prompt.*
