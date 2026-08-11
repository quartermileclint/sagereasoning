# Mentor brief — S7 build summary: `/impulse`, the primal-impulse examination tool

**Date:** 2026-08-12. **Purpose:** report what was built against your five S7 rulings (2026-08-11), what
was independently found and fixed, and what remains before anything is live.

**Status: built, dark, uncommitted.** A page, a route, a migration, a local vocabulary module, two test
suites, and the data-rights/nav wiring exist in the working tree. **Nothing is live and nothing is
applied to any database.** `SUBSTRATE_IMPULSE_R20A_ENABLED` does not exist in production; the migration
has not been run on TEST or prod. A PR19 independent adversarial review has run and its findings are
folded in below. The founder-walked migration, the flag activation, and the commit itself are all still
ahead.

---

## Part A — What the tool is, briefly

The entry point is the trait — which primal impulse is most active for the practitioner right now.
Three of your four pathways then run the committed `DIAGNOSTIC_SEQUENCE`
(`website/src/lib/stoic-brain.ts:595-601`) entered from that trait, narrowing step 4's candidate
sub-species. The fourth — reciprocity — runs your own two-question set instead, because it is not a
passion sub-species. The framing you required — that noticing the impulse *"is not failing — they are
generating examination material"* — is rendered in the page's own copy at the point of use, not left in
a framing document (`website/src/app/impulse/page.tsx`, the reframe block above the form).

---

## Part B — Each ruling, as built

**B2 — new tool, not an extension of `/passion-log`.** `passion_events` is untouched: no import, no
foreign key, no shared table. The link is stated in prose in the page's own copy (*"Where the Passion
Log catches a passion as it arises, this works backwards from the impulse to the judgement that produced
it"*), with a hyperlink and nothing else. The boundary test asserts zero code-level references to
`passion_events` across the route, the vocabulary module, and the page — with one correction the build
itself required: the raw-source form of that assertion initially failed on its *own documentation of the
rule*, because the comment explaining "must not couple to passion_events" contains the string
`passion_events`. Fixed by stripping comments before the check, the same discipline already used
elsewhere in this codebase's guard tests for the opposite reason (comment-satisfiability).

**B3 — inside the R20a distress perimeter, a ruled departure from family precedent.** This is the
heaviest part of the build, so I'll be specific.

- `await enforceDistressCheck(detectDistressTwoStage(...))` runs on **both** POST (create) and PATCH
  (revise) — a revision carries the same free text as a creation, so both are screened
  (`website/src/app/api/mentor/impulse/route.ts`).
- The check runs **before the gate's LLM call and before the route's own field validation** — a
  deliberate divergence from the `/api/score-conversation` precedent, which validates first. The subject
  composer is total over unknown/malformed input (non-strings skipped, every field capped), so this is
  safe and strictly more conservative: distress written into an otherwise-invalid body still catches
  rather than being answered with a 400 before the check ever runs.
- On moderate/acute, the human-audience crisis message renders and **nothing is saved** — traced and
  confirmed: the redirect returns before the database write on both paths.
- On mild, the entry **is** saved and the crisis resources ride alongside, worded specifically for this
  tool rather than borrowed verbatim from the score-conversation precedent — the mild-fold message
  explicitly reassures that *"examining an impulse is not the same as being ruled by one,"* because a
  message that read as a reprimand for writing honestly would undo the reframe the whole tool exists to
  carry.
- The mild-escalation logic is reused from the score-conversation precedent, but for a different, tool-
  specific reason recorded at the reuse site: on that route the escalation exists because a third party's
  words could mute the check for the submitter's own distress; here every field is the practitioner's
  own words, but distress-adjacent language is common **by design** (the tool exists to elicit `aischyne`
  — shame — and `agonia` — dread), so a bare stage-1 'mild' hit is common and under-informative, and the
  same escalation mechanism closes that gap for a different reason.
- The perimeter registry (`website/src/lib/__tests__/r20a-invocation-guard.test.ts`) is updated in the
  same change: this tool is the **fourteenth** route-level entry (fifteenth on your own recount below).
  AC5's requirement that the departure and its reason be recorded is discharged in four places — the
  route, the colocated `r20a.ts` module, the registry entry, and the decision-log entry — because every
  sibling records the opposite decision and a future reader comparing this tool to its siblings would
  otherwise read the membership as a mistake and remove it.
- Flag-gated behind `SUBSTRATE_IMPULSE_R20A_ENABLED`, defaulting OFF; when unset, both blocks are
  skipped entirely — no classifier call, no latency, no wire-shape change. Verified by test, not just
  asserted.

**B4 — the reciprocity pathway is a distinct mode, your own question set verbatim.** The two questions
are stored as constants and rendered on the page character-for-character:
*"Is this cooperation grounded in recognition of the other as a rational being, or in expected return?"*
and *"What would the action look like if the expected return were removed?"* Not paraphrased. The
reciprocity mode carries **no** `sub_species` field — enforced twice: the application code never sets
one on that branch, and the database CHECK independently rejects any reciprocity row where one is
present, so even a bug in the route could not smuggle a sub-species onto a reciprocity examination. Not
routed to `/oikeiosis`. Not omitted.

**C1/A1 — `DIAGNOSTIC_SEQUENCE` applied, not re-authored.** The five stored fields map 1:1 onto your five
steps. No sixth field was invented; no bespoke taxonomy was authored, so no PR15 justification is owed.

**C12 — local vocabulary duplication, plus the drift pin.** The 20 sub-species are transcribed locally
into a zero-import module (`website/src/app/api/mentor/impulse/vocabulary.ts`), never imported from
`stoic-brain.ts` — which is imported directly by both `api/guardrail/route.ts` and
`guardrail-sandwich.ts`, so reading it is fine and editing it is forbidden. The boundary test reads
`stoic-brain.ts` **as text**, imports nothing from it, and asserts: every local id is present in the
corpus; the migration's CHECK constraint matches the local vocabulary exactly; and — as a disclosure, not
a subset check — the corpus still holds exactly 20, so if it ever grows the test goes red rather than the
divergence going unnoticed.

**C13 — four traits wired in v1, the vocabulary built extensible.** The database CHECK admits all
**eleven** committed traits while only five carry a v1 pathway (see the correction below on why five, not
four). Adding a pathway for one of the other traits is therefore a code-only change with no migration —
the CHECK is real today, not a placeholder, so the extensibility claim is structural rather than a
promise.

---

## Part C — A correction found and recorded, not inherited from the scope document

**`ROOT_PASSIONS` holds 20 sub-species, not 25.** The S7 scope document
(`operations/primal-substrate-2026-08/S7-primal-substrate-practice-activities-scope.md`) states *"4
roots / 25 sub-species."* Counted first-hand in the actual source (`stoic-brain.ts:311-364`): epithumia
6, hedone 3, phobos 6, lupe 5 = **20**. This was independently re-derived twice more — by a dedicated
fact-verification workflow launched before any code was written, and by a decision-log entry from
2026-05-01 (`D-RAG-MENTOR-ALT3-PHASE1-DRAFTS`) that had already recorded 20 for an unrelated deliverable.
The scope document's individual line citations (philodoxia `:323`, philoplousia `:322`, agonia `:348`,
oknos `:344`, aischyne `:345`) are all correct — only the total was wrong, and the drift pin now asserts
against the source, never the document.

**A second, smaller correction, disclosed to be complete:** your Heading 7 mapping reads
"competition/hierarchy → philodoxia," one slash. The research names Competition and Hierarchy /
Dominance as two **distinct** traits. Rather than inventing a merged trait id (which the source doesn't
support and the cite-by-name rule forbids), both are wired as selectable entry points and both route to
the philodoxia pathway. Five trait ids, four pathways — recorded as a deliberate reading of your ruling,
not a silent deviation.

**A third correction, found while updating the registry, unrelated to S7's own content:** the perimeter
registry's own test header had read *"eight route-level + one substrate-gate = nine"* — stale for
months, contradicted by the accurate prose block a few lines below it in the same file, which already
tracked the real growth. Corrected in the same change.

---

## Part D — Verification performed

- `tsc` — clean. `npm run build` — clean, both `/api/mentor/impulse` and `/impulse` registered (the
  route colocates two non-handler modules inside an `app/api/` directory; Next.js's build-time export
  validation is the real gate for that shape, and it passed).
- **Measurement neutrality verified by git byte-identity, not inspection.** `stoic-brain.ts` is
  byte-unchanged; no file in the `/api/reason` or `/api/guardrail` import graph was touched.
- **The boundary test's own import guard was tightened, not loosened, to accommodate this tool's one
  required exception** (it must import the shared crisis-renderer, the one substrate module every
  perimeter route needs). A forbidden **value** import at one hop still fails the guard; the one
  **type-only** hop this tool's dependency chain genuinely carries (a `KatorthomaProximityLevel` type,
  erased at compile) is permitted only via an explicit register whose observed set must equal the
  expected set — so a second one appearing later fails loudly rather than being silently absorbed.
- **Every boundary pin was mutation-verified: 21 mutations applied by hand, 21 went red, zero vacuous.**
  This included deliberately reproducing the exact defeat a prior sibling build's review found —
  renaming a classifier's parameters to innocuous names and passing the sensitive field positionally at
  the call site — to confirm the equivalent pin here catches it too. **One of the pins I wrote was
  itself found vacuous by this harness**: a check that the crisis message renders the human audience used
  an existence test (does *any* call site do this) rather than a universal one, so flipping one of the
  two redirect call sites to the developer-facing form stayed green. Fixed to count call sites and forbid
  every other audience explicitly.
- Full regression sweep: every other sibling's boundary test still green (sage-compass 594/0, morning
  467/0, and the nine remaining Remaining-Principles suites), the score-conversation R20a suite still
  green (57/0), the erasure/data-rights suites still green.

---

## Part E — The PR19 independent adversarial review

Five reviewer agents, each given only the source files and the binding rulings — no access to my own
build reasoning — covering R20a fidelity, measurement neutrality, ruling fidelity, migration/schema
correctness, and route logic/security. **Zero critical or high findings.**

| Finding | Severity | Disposition |
| --- | --- | --- |
| An authenticated practitioner could `INSERT` directly against this table via the public client (anon key + `auth.uid() = user_id` RLS), bypassing the route entirely — including the distress check | **Medium** | **Named, not fixed.** Every table this app writes uses the identical RLS shape; the whole architecture treats the route as the sole enforcement point everywhere, not only here. A local fix would be a false guarantee (the same client can still write to any other intimate table the same way); an app-wide fix is outside this session's scope and permitted paths. Recorded as its own unscoped carried item — sharper here than on any sibling, because this is the one table where a bypass reaches the exact population the perimeter exists to protect. |
| A migration comment claimed a field was "optional in both directions"; the CHECK constraint actually forces it NULL in reciprocity mode | Low | Fixed — comment corrected, no functional gap existed (the route already enforced the CHECK's real behaviour). |
| A non-numeric `?limit=` query parameter on the feed endpoint produced `NaN`, passed through to the database client rather than a clean 400 | Low | Fixed. Not exploitable for resource exhaustion — the ceiling still binds on any finite input — but inconsistent with the route's own established honest-400 discipline. (This exact pattern is inherited from `/sage-compass`'s identical GET handler and was left alone there — fixing a sibling was out of scope.) |
| The boundary test's one-hop import guard doesn't descend far enough to see a real (but pre-existing, untouched) value-import of `stoic-brain.ts` two hops away | Nit | No action — the test's own header already discloses exactly this limitation and correctly argues the operative safety property is the git byte-identity guard, not import purity. |
| The "20, not 25" correction was flagged by one reviewer as something it could not itself verify without running the test | Nit | No action — already corroborated three independent ways (see Part C), and the drift pin asserting it is green. |

Everything else was checked and confirmed clean, explicitly, by dimension: every write path correctly
scoped to the authenticated user; every enum validated at runtime (a `TypeScript`-only cast does not
silence a real runtime check); the UUID on the revise path validated before reaching the database; no
error detail leaked to a client; the classification gate fails open on every traced path; rate limits
present and deliberately, not reflexively, chosen (read traffic on a looser bucket, write traffic on the
tighter one shared with `/api/reason` — recorded rather than silently inherited); the two examination
modes' field-handling traced line by line with no cross-branch leakage; and the database's mode-fields
CHECK constraint worked by hand as a truth table and confirmed genuinely bidirectional and null-safe — no
row shape exists that satisfies it without being fully one mode or the other.

Both fixes were re-verified after landing: build clean, all suites unchanged in count, the full mutation
harness re-run — 21/21 red, zero vacuous, unchanged — and measurement neutrality re-confirmed.

---

## Part F — What is carried, in order

1. **The founder-walked migration, TEST then prod**, with its six-part `§VERIFY` block, including a
   TEST-only behavioural probe that the mode CHECK genuinely rejects a malformed row (not merely that it
   exists).
2. **The `SUBSTRATE_IMPULSE_R20A_ENABLED` activation**, with a live distress smoke, as its own
   founder-walked Critical step.
3. **CLAUDE.md's perimeter-count line**, which this build's own registry recount found stale by two even
   before `/impulse` — it predates the two Stoa routes that joined 2026-08-03. Outside S7's permitted
   paths; named for a future refresh.
4. **The RLS-vs-route-enforcement gap** the review surfaced — unscoped, app-wide, a founder-elected
   session of its own.

Nothing here bears on the 0h call. Nothing here touches the IDEA-loop validation run — pre-flight
checked at session open; this tool shares no flag, route, credential, or table with it.
