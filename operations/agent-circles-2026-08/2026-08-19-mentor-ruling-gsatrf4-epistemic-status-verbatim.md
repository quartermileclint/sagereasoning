# Mentor ruling — GS-ATRF-4 formal addition + vocabulary scope (verbatim)

**Relayed by the founder 2026-08-19**, in response to
`2026-08-19-mentor-question-epistemic-status-fourth-question-FOR-RULING.md`.

**Status: ADOPTED AS BINDING SPECIFICATION. Verbatim wins over any paraphrase, here or elsewhere.**

**Binds:** `website/src/data/project-context.json`'s "ATRF INTEGRATION — GENERATION-STEP OPEN
QUESTIONS" block and its live Supabase `project_context` mirror (GS-ATRF-4 formally added, verbatim
question text ruled below); the routing of `operations/primal-substrate-2026-08/gs-atrf-corrections.md`
§(c-bis) (carried forward, not resolved by this ruling); and — as a named direction, not a ruling —
the eventual scope of the `high | medium | low` blast-radius vocabulary at the generation-step scoping
session.

---

**MENTOR RULINGS — GS-ATRF-4 formal addition + vocabulary scope**

**Date:** 2026-08-19. Three-part question. All three parts answered. The question was prepared with
precision and the mechanism facts are stated correctly — the distinction between occasioning a ruling
and the ruling itself is held cleanly throughout.

---

**Q(a) — Should the framework be formally added as GS-ATRF-4?**

Yes. The epistemic status framework is formally added to the ATRF open questions block as GS-ATRF-4.
The terms already named stand: treating every consequential proposition flowing through the reasoning
harness as carrying an epistemic status — observation, inference, assumption, unknown — with the
governing rule that confidence of an explanation must never exceed its evidential basis. The addition
follows the same class of edit as GS-ATRF-1 through 3: a static-file change plus an authored SQL
UPDATE for the live row, founder-walked, tsc and import-verified.

The question text for the live block should read:

*GS-ATRF-4 — Epistemic status of propositions. The ATRF carries propositions through the reasoning
harness — impressions, candidate ideas, blast-radius assessments, completion signals. Open question:
should each consequential proposition carry a formal epistemic status (observation / inference /
assumption / unknown), and if so, where in the harness does that status get assigned, checked, and
disclosed? The governing rule is that confidence of an explanation must never exceed its evidential
basis. The honest answer may be that epistemic status assignment belongs at the generation step, with
disclosure riding the proposal shape alongside the blast-radius indicator. If that is the ruling, the
epistemic status field is disclosed as an assessed classification, not a measurement — consistent with
the blast-radius indicator being a proxy, disclosed as such.*

---

**Q(b) — Standalone question or amendment to GS-ATRF-1?**

Standalone. GS-ATRF-4 is a new, separately-scoped question. GS-ATRF-1's ruled answer is not amended.

The reasoning is this. The §(c-bis) gap in GS-ATRF-1's ruled answer — that the four-virtue proxy has
no basis at all for a friction-detection candidate and the high/medium/low vocabulary cannot express
basis-lessness — is a real gap, and the epistemic status framework's unknown category does supply the
missing disclosure branch. But folding GS-ATRF-4 into GS-ATRF-1 would mean amending a ruled answer,
and ruled answers are not amended by the addition of new open questions. They are amended by a ruling
that specifically re-opens and revises them.

The correct path for §(c-bis) is: GS-ATRF-4 is added as a standalone question, and when the
generation-step scoping session opens, §(c-bis) is brought as a named carry-forward alongside
GS-ATRF-1 through 4. At that session, the question of whether GS-ATRF-4's unknown category closes
§(c-bis) directly — or whether GS-ATRF-1's ruled answer needs a separate amendment — is examined and
ruled. That is the right sequence. It does not leave §(c-bis) unaddressed; it routes it correctly
rather than resolving it by implication.

Add a cross-reference note to the GS-ATRF-4 entry:

*See also: §(c-bis) in gs-atrf-corrections.md — the unknown category may close the basis-lessness gap
in GS-ATRF-1's ruled four-virtue proxy. To be examined at the generation-step scoping session.*

---

**Q(c) — Should the high/medium/low vocabulary gain a fourth value, and is that in scope to rule now?**

It is in scope to rule on whether it is in scope. The answer is: not yet, but the shape of the
eventual ruling is nameable now, and naming it is useful.

The high/medium/low vocabulary is fixed in manifest.md and this question correctly notes that
manifest.md is not this question's to amend. The vocabulary question is therefore deferred to the
generation-step scoping session, where GS-ATRF-1, GS-ATRF-2, and now GS-ATRF-4 will all bear on it
simultaneously. That is the right place to rule on it, because the vocabulary decision cannot be made
cleanly until the epistemic status assignment question in GS-ATRF-4 is answered — the two are coupled.

The shape of the eventual ruling, named now for the record: the assessStructuralNovelty precedent —
returning novel: true, confidence: 0 rather than manufacturing a rating — is the stronger model. A
null or absent indicator with a separate disclosure flag is more honest than a fourth vocabulary
value, because a fourth value (unknown or basis-less or similar) inside the high/medium/low register
implies the indicator was assessed and found to be in that state, whereas a null with a flag says the
indicator was not assessable on the available basis. Those are different epistemic claims and the
vocabulary should reflect the difference.

This is not a ruling on the vocabulary. It is a named direction that the generation-step scoping
session should carry in. Record it as such.

---

## Execution notes (added by the AI at recording; NOT part of the ruling)

**Applied same session:**
1. `website/src/data/project-context.json` — v1.3.0 → v1.4.0. "These three questions" → "These four
   questions"; GS-ATRF-4's ruled question text (verbatim above) plus the ruled cross-reference note
   appended after GS-ATRF-3's paragraph; `last_updated` → 2026-08-19; one `recent_decisions` entry
   prepended. JSON-parse-verified via `tsx`; `tsc --noEmit` clean.
2. `website/supabase-project-context-2026-08-19-gsatrf4-update.sql` — authored, NOT run (founder-walked
   live step; the AI performs no Supabase op). Same idiom as
   `supabase-project-context-2026-08-09-atrf-update.sql`: §0 pre-flight, `UPDATE` (a `replace()` for
   the wording fix + `||` append for the new paragraph, plus a `jsonb` prepend for the recent-decisions
   entry), §VERIFY with explicit boolean checks for the wording fix, ROLLBACK, and a re-run GUARD.

**Not applied, and not this ruling's to apply:**
- The `high | medium | low` vocabulary is unchanged. Q(c) explicitly defers it.
- `gs-atrf-corrections.md` §(c-bis) and §(e) are **carry-forward-updated** to reflect the routing
  (standalone GS-ATRF-4, examined not resolved at the generation-step scoping session) but the gap
  itself remains open, per the mentor's own words.
- The generation-step scoping session itself remains post-first-build-gate per the Q11 sequence;
  nothing here reopens it early.

**M-5 is untouched by this and remains P0.**

---

## Dated correction (mentor ruling 2026-08-21, applied 2026-08-22; NOT part of the original ruling)

**The phrase "the generation-step scoping session" in Q(b), Q(c), and the ruled cross-reference note
above is a stale-mechanism-fact error, corrected by dated ruling**
(`2026-08-21-mentor-rulings-five-questions-examination-session-verbatim.md`, Q1 — verbatim wins):
the generation-step scoping session was ruled 2026-08-09 and is **closed**; the mentor's own words —
the ruling *"used the phrase 'generation-step scoping session' when it should have said 'ATRF
scoping session'"*, an error *"of the class the PR20 amendment was designed to catch."* **GS-ATRF-4,
§(c-bis), and the blast-radius vocabulary question all land at the ATRF scoping session**
(post-first-build-gate, distinct from the closed generation-step session). The verbatim text above is
preserved unaltered; this dated correction governs its reading.
