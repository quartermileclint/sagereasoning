# C15 — scoping the oikeiosis-circle enumeration discrepancy

**Date:** 2026-08-12
**Tier:** `governance` (scoping only — no code/schema/doc-of-record edit performed here beyond this
document, the decision-log entry, and the `CLAUDE.md` status correction named in the prompt).
**Ruling this session executes:** `manifest.md`, The Moral Community Boundary amendment, closing
parenthetical, ruling **C15** — *"three committed enumerations of the oikeiosis circles disagree in
count and vocabulary… This amendment deliberately declines to resolve that discrepancy… and carries
its resolution as a separate, unscoped item."* This document is that scoping, not that resolution.

**No `.ts`/`.tsx`/`.sql`/`.json` file was touched.** Verified at close via `git diff --stat` (§6).

---

## 1. Verified, first-hand inventory

The ruling's own text names three sites. First-hand investigation this session found **six** distinct
enumeration sites, which collapse into **three genuinely different vocabularies** plus one honestly
free-form type and one self-aware local abstraction. Every claim below is a direct grep/read result,
not carried forward from the ruling text, `CLAUDE.md`, or the scoping prompt.

### 1a. Governance abstraction — `manifest.md` R0

`manifest.md:99-104`. Four circles, prose only, no machine-readable IDs:

> Circle 1 (Self) · Circle 2 (Household) · Circle 3 (Community) · Circle 4 (Cosmos)

This is the text the C15 ruling itself cites as "four." Confirmed unchanged since the ruling was
written (`manifest.md:118` quotes it verbatim as "four").

### 1b. The live engine vocabulary — `layer1-extractor.ts` `OikeiosisCircle`

`website/src/lib/translation-sandwich/layer1-extractor.ts:80-85`:

```
export type OikeiosisCircle =
  | 'self_preservation'
  | 'household'
  | 'local_community'
  | 'political_community'
  | 'cosmopolis'
```

**This is the one that actually drives live scoring.** Confirmed load-bearing consumers, each verified
by direct import or literal-vocabulary citation:

- `website/src/lib/translation-sandwich/layer2-mechanisms.ts` — imports the type directly (line 44,
  82), and three lookup tables key off it verbatim: `CIRCLE_HONOURABILITY_BASE` (:772),
  `CIRCLE_ADVANTAGEOUSNESS_BASE` (:780), `CIRCLE_STAGE_NUMBER` (:788) — the deterministic Layer-2
  scoring mechanisms that compute `katorthoma_proximity` on every `/api/reason` and `/api/guardrail`
  call.
- `website/src/lib/substrate/trust-core/kathekon-engagement.ts` — imports the type directly (line 56),
  and its own header comment (:62-67) states the exclusion is "typed against the CANONICAL extraction
  vocabulary… so the exclusion can never drift from the extractor's actual circle names." This is the
  self-circle-narrowing predicate gating dikaiosyne trust-fold events (AE-1/AE-2, live since
  2026-07-18/19).
- `website/src/lib/substrate/trust-core/harness-extractors.ts:79` — imports the type for the S8
  discernment harness's task-circle reading.
- `website/src/lib/substrate/trajectory-delta.ts`, `website/src/lib/translation-sandwich/
  orientation-reading.ts`, `website/src/lib/guardrail-sandwich.ts`, `website/src/lib/sage-reason-
  engine.ts` — all reference the same `local_community`/`political_community`/`cosmopolis` vocabulary
  (confirmed by grep for those two literals, which are unique to this family — see §1e for why that
  grep is a reliable discriminator).
- `website/src/lib/substrate/idea-loop-types.ts:31-36` — its own comment explicitly names this as
  "the existing `OikeiosisCircle` (profiles.ts)" (an imprecision in the comment's own wording — the
  numeric rank is actually disclaiming widening of the *layer1-extractor* vocabulary that
  `kathekon-engagement.ts` re-exports the type from, not the free-form `profiles.ts` string alias; see
  §2c for this specific correction).

No public surface publishes this vocabulary's five values as an explicit enumerated list anywhere
(see §4).

### 1c. The "reflect family" — `self_preservation` variant, live and public

A second five-value vocabulary, structurally different from 1b at circles 3–4 (`community` +
`humanity`, not `local_community` + `political_community`), independently declared at **four separate
source sites**, all agreeing on spelling (`self_preservation`, not `self`):

1. `website/src/lib/stoic-brain.ts:445-451` (`OIKEIOSIS_STAGES`) — a display/reference constant with
   primary-source citations (DL 7.51-60; Cicero De Finibus 3.62-68; Cicero De Officiis 1.11-12).
   **Verified NOT load-bearing on any live decision path**: `getOikeiosisStage`/`OIKEIOSIS_STAGES` are
   consumed only inside `stoic-brain.ts` itself (`stoic-brain.ts:740`) and are imported by no other
   file in `website/src` (`grep -rln "getOikeiosisStage\b"` returns exactly one file: `stoic-
   brain.ts`). The prompt's suspicion that this might be display-only, not scoring-live, is confirmed
   correct.
2. `sage-mentor/persona.ts:193` (`OikeioisMapEntry['oikeiosis_stage']`) — an independent literal-union
   declaration in the older "ring" architecture (per `CLAUDE.md`'s own standing distinction between
   `sage-mentor/*` and the Gate-1/UPC substrate). Not imported from `stoic-brain.ts`; happens to share
   the identical five values and spelling by coincidence or unrecorded copy, not by import.
3. `website/src/lib/mentor-profile-adapter.ts:173-179` — a local `ReadonlySet` validation copy, typed
   against `persona.ts`'s `OikeioisMapEntry['oikeiosis_stage']` (line 150), not against `stoic-
   brain.ts`.
4. `website/src/lib/sage-reflect/engine.ts:58-63` (`CircleLevel`) — a fourth independent literal-union
   declaration, backing the **live, public** `circle_at_open` field on `POST /api/practice/reflect`.
   Validated server-side at `website/src/app/api/practice/reflect/request-helpers.ts:81-82` against a
   `CIRCLES` array of this same vocabulary, and documented publicly (§4).

Also present in this family, sourced from `sage-reflect`/`persona.ts` rather than `stoic-brain.ts`
directly: `website/src/app/api/baseline/agent/route.ts:179,186` and `website/src/app/api/assessment/
full/route.ts:312,336` (both prompt-instruct an LLM to classify into this exact five-value list), and
two DB migrations — `website/supabase-v3-baseline-progress-migration.sql:32` and `website/supabase-v3-
agent-assessment-migration.sql:68,123` (both CHECK-constrain an `oikeiosis_stage` column to this
family's spelling).

### 1d. The "human-tool family" — `self` variant, live and public, otherwise identical to 1c

A **fifth** independent declaration site, structurally identical to 1c (household/community/
humanity/cosmic) but spelling the innermost circle `self`, not `self_preservation`:

- `website/supabase-mentor-gaps-migration.sql:169` — `oikeiosis_reflections.stage` CHECK constraint
  (the pre-existing quarterly diagnostic table).
- `website/src/app/api/mentor/oikeiosis/route.ts:9` — `VALID_STAGES`, the route that writes to it.
- `website/supabase-circle-extension-migration.sql:44-49` — `circle_extension_entries.current_circle`
  / `.extended_circle` CHECK constraints (the newer #6/#15 circle-extension practice).
- `website/src/app/api/mentor/oikeiosis/extension/route.ts:11` — `CIRCLES`, that route's own local
  const.
- `website/src/app/oikeiosis/page.tsx:70-74` — the public page's own display array (labels: Self,
  Household, Community, Humanity, Cosmic).
- `website/src/app/score/page.tsx:428` — public UI copy: *"Circles of concern: self → household →
  community → humanity → cosmic order."*
- `website/src/app/score-policy/page.tsx:185-187` and `website/src/app/baseline/page.tsx:289-302` —
  both read `result.oikeiosis_stage`/`result.oikeiosis_impact` fields against this same five-name set
  (though these two pages do not themselves declare `self` vs `self_preservation`, since they only
  branch on `household`/`community`/`humanity`/`cosmic`).

**1c and 1d are the same concept under two different spellings of one value.** This is the shallowest
and least defensible of the discrepancies found — see §2.

### 1e. The free-form trust-core type — `profiles.ts` `OikeiosisCircle`

`website/src/lib/substrate/trust-core/profiles.ts:52-53`:

```
/** An oikeiosis circle identifier (a party/relationship the task engages). Free
 *  string — the task names its circles. */
export type OikeiosisCircle = string
```

**Correction to the ruling's own characterization:** `manifest.md:118` describes this as "five,
free-form." The type itself is an unconstrained `string`, not literally five values — its own header
comment says exactly that: "the task names its circles." In practice, every consumer of this type in
the live S5–S9 trust-core/discernment subsystem (`collaboration-record.ts`, `discernment-engine.ts`,
`harness-extractors.ts`) receives strings that originate from the 1b engine vocabulary when populated
from real extraction data — but the type does not enforce that, and nothing prevents a
deployer-supplied task profile (per mentor A2 — deployer-defined function types) from naming an
arbitrary circle string. "Five, free-form" is a reasonable shorthand for the common case but is not
literally accurate as a type description; a future edit to the ruling text or `CLAUDE.md` should say
"unconstrained string, populated in practice by the layer1-extractor vocabulary" rather than "five."
This is a precision nit on the ruling's own wording, not a new discrepancy — flagged for completeness,
not urgency.

### 1f. The self-aware local abstraction — `idea-loop-types.ts` `OikeiosisCircleRank`

`website/src/lib/substrate/idea-loop-types.ts:31-36`:

```
export type OikeiosisCircleRank = 1 | 2 | 3 | 4 | 5
```

A numeric rank (not a named vocabulary), local to the dark `POST /api/practice/fresh` route only
(confirmed unconsumed elsewhere at the module's own header, :5-10, and by the fact that no other file
imports it outside its own tests). Its own comment explicitly disclaims being "a widening of the
existing `OikeiosisCircle` (profiles.ts)" — **this file is already doing the work the prompt asked
this scoping session to do**: naming the relationship to another enumeration explicitly rather than
leaving it implicit. Not a discrepancy in need of resolution; cited here only because the prompt asked
this document to be exhaustive, and because its own comment (imprecisely) points at `profiles.ts`
(§1e) when the numeric "current+1" ordering it encodes actually mirrors the *five-position ordinal
structure* common to both 1b and 1c/1d, not `profiles.ts`'s free-form string. Worth a one-line comment
fix in that file at whatever session next touches it — not urgent, not blocking.

---

## 2. Judgement — is this a real problem, or a defensible layering difference?

**Both, in different places. This is not one discrepancy; it is three, of different severity.**

### 2a. `manifest.md` R0 (four circles) vs. the engine/practice vocabularies (five circles) —
**defensible layering, very likely intentional, does not need to be forced into 1:1 correspondence.**

R0 is explicitly a **governance-level** rule: *"All SageReasoning decisions, from product design to
pricing to partnerships, are evaluated against the oikeiosis sequence"* (`manifest.md:99`). Its four
circles (Self / Household / Community / Cosmos) read as a coarse, company-decision-scale abstraction —
each with one line of prose, no IDs, no citations, no CHECK constraint anywhere. Every one of the
five-value vocabularies (1b/1c/1d), by contrast, is an **engine-level or practice-level** extraction
schema built to classify a single action or a single practitioner's reflection with enough resolution
to distinguish "your town" from "your nation" (1b) or "your local circle" from "humankind as such"
(1c/1d) — a resolution R0 was never trying to reach. A four-vs-five collapse where "Community" (R0)
maps onto two engine-level circles is exactly what you would expect from a coarser rule sitting above
a finer one, not evidence of drift. **Recommendation: do not force R0 to five values.** The gap worth
closing is not the count mismatch itself but the *absence of a stated mapping* — R0 currently gives no
guidance on how its four map onto either five-value family, so a reader moving from the governance
rule to the code has to guess. That absence is real and worth fixing, but the fix is documentation (a
mapping note), not a re-count of R0.

### 2b. The 1c/1d naming drift (`self_preservation` vs `self`) — **a real problem, but a shallow one:
an internal-consistency fix, not a doctrinal question.**

1c and 1d are the *same* five-position sequence, same order, same three shared labels
(household/community/humanity/cosmic), same primary-source lineage (DL 7.51-60; Cicero) — they differ
only in what the innermost circle is called. There is no textual or philosophical reason for the two
spellings to coexist; nothing in Diogenes Laertius or Cicero forces a choice between "self" and
"self_preservation" as the machine-readable token — both are English glosses of the Greek, not
citations of a term the sources themselves fix. This reads as an ordinary implementation drift (two
different sessions, at different times, wrote the same five-stage list from scratch instead of
importing a shared constant) rather than a considered design choice anyone would defend. **This does
not need a mentor ruling** — it is a naming-consistency decision squarely inside engineering judgement,
not a re-interpretation of Stoic doctrine or of R0. See §5 for why the founder can decide this
directly.

### 2c. 1b (engine: `local_community`/`political_community`/`cosmopolis`) vs. 1c/1d (reflect/human-
tool: `community`/`humanity`/`cosmic`) — **the real, load-bearing, and doctrinally substantive
discrepancy.**

Unlike 2b, this is not a spelling difference — it is a genuine disagreement about how many named
stages sit between "household" and "the cosmos," and what they are called. The engine vocabulary
(1b) draws a Ciceronian **political** distinction — `local_community` (your town) vs.
`political_community` (your nation/citizenship) — before reaching `cosmopolis`. The reflect/human-tool
family (1c/1d) instead names a single `community` stage, then jumps to a **universal-humanity**
stage (`humanity`) before `cosmic` — a reading that emphasizes the bond of shared rationality across
all humans as its own distinct circle, with no separate political-community stage at all. Both
readings are textually defensible (Cicero's *De Officiis* 1.11-12/1.20-22 supports both a
political-community reading and a universal-humanity reading, depending on which passage is
emphasized; `stoic-brain.ts` itself cites 1.20-22 for "community" and 1.11-12 for "humanity" — so even
the *citations already in this codebase* draw the split at a different place than 1b does). This is
not a bug with an obvious correct answer; it is a live choice between two defensible five-stage
readings of the same classical sequence, one of which (1b) is what actually governs `/api/reason`,
`/api/guardrail`, the kathekon self-circle narrowing, and the AE-1/AE-2 trust folds, and the other of
which (1c/1d) is what is publicly documented on `/api/practice/reflect`'s `circle_at_open` field and
shown to human practitioners on `/oikeiosis` and `/score`. **This is the one that needs a mentor
ruling** — see §5.

---

## 3. Which vocabulary is load-bearing where

Confirmed, restating §1b/§1c/§1d/§1e findings as a single table for the record:

| Vocabulary | Where it's canonical | Live decision-path role |
|---|---|---|
| 1a — R0 (4, prose) | `manifest.md` | Governance-level company-decision rule. Not consumed by any code. |
| 1b — engine (5, `local_community`/`political_community`/`cosmopolis`) | `layer1-extractor.ts` | **Load-bearing on every `/api/reason` + `/api/guardrail` call**: Layer-2 scoring tables (`CIRCLE_HONOURABILITY_BASE` etc.), the kathekon self-circle-narrowing predicate (AE-1/AE-2 trust folds, live), trajectory-delta, orientation-reading. |
| 1c — reflect family (5, `self_preservation`/`community`/`humanity`) | `sage-reflect/engine.ts` (live, public `circle_at_open`); `stoic-brain.ts` (display-only, unconsumed); `sage-mentor/persona.ts` (ring architecture) | Public wire contract on `POST /api/practice/reflect`; two prompt-instructed classification routes (`/api/baseline/agent`, `/api/assessment/full`); two DB CHECK constraints. Not consumed by `/api/reason`/`/api/guardrail`. |
| 1d — human-tool family (5, `self`/`community`/`humanity`) | `oikeiosis_reflections` + `circle_extension_entries` tables and their routes | Two human-practitioner-facing tools + the public `/oikeiosis` page + `/score` page copy. Structurally identical to 1c, differs only in the innermost label. |
| 1e — trust-core (unconstrained `string`) | `profiles.ts` | The S5–S9 discernment protocol's task/candidate/orchestrator profiles (mostly dark/MEASURE). In practice fed by 1b when populated from real extraction data; not itself a fifth vocabulary. |
| 1f — idea-loop rank (numeric 1-5, no names) | `idea-loop-types.ts` | Local to the dark `/api/practice/fresh` route only; self-disclosed as distinct. |

**Confirming the prompt's own prediction:** yes, `layer1-extractor.ts`'s vocabulary (1b) is the one
"that actually matters operationally." The prompt's suggestion that `profiles.ts`'s bare `string` might
be overstated as "a fifth enumeration in its own right" is also confirmed — it is not; see §1e/§2's
correction to the ruling's own wording.

---

## 4. The public-honesty gap — flagged at higher urgency, per the prompt's own instruction

`website/public/llms.txt:20` states, as a top-level capability description:

> **oikeiosis**: Assessment across the five circles of concern (self, immediate relations, wider
> community, rational beings, cosmos)

This prose reads as a paraphrase of the **1c/1d family** (self → household → community → humanity →
cosmic), not the 1b engine family that actually powers `/api/reason` and `/api/guardrail`. Yet the
**same document**, twelve lines later in a worked JSON response example (`llms.txt:130`), shows:

```
"oikeiosis": { "relevant_circles": [ { "circle": "local_community", "obligation_assessment": {...} } ] }
```

`"local_community"` is a **1b-family value that does not exist in the 1c/1d family the opening prose
just described**. Nowhere in `llms.txt`, `agent-card.json`, or `api-docs/page.tsx` is the engine's
actual five-value vocabulary (`self_preservation | household | local_community | political_community |
cosmopolis`) published as an explicit enumerated list — the only place it is visible to a reader of the
public contract is this one inline example value, which contradicts the prose two paragraphs above it.
An agent reading `llms.txt` top-to-bottom would form the reasonable but wrong expectation that
`/api/reason`'s `oikeiosis.relevant_circles[].circle` field takes one of `self`/`immediate
relations`/`wider community`/`rational beings`/`cosmos`-shaped values, then encounter `"circle":
"local_community"` in the very next example with no explanation of the mismatch.

**This is a genuine live public-documentation defect**, independent of which side of the §2c doctrinal
question the mentor eventually favours — the description at `llms.txt:20` should describe whichever
vocabulary is actually served on the endpoint it is describing capabilities for. It is flagged here at
higher urgency than the rest of this scoping per the prompt's own instruction (§1, "fourth candidate"),
but **the fix is not performed in this session** (§2 of the governing prompt forbids editing
`llms.txt` here, and correcting the prose without first resolving §2c risks baking in whichever
five-value family this session happens to pick, silently pre-empting the mentor ruling this document
recommends). It should be corrected as part of whatever session executes the §2c ruling's outcome, or
sooner as a narrow, disclosed-scope correction if the founder judges the gap urgent enough to fix
independently of the doctrinal question (the safe interim wording would simply be to describe the
engine's actual five values, since those are what a caller of `/api/reason` will observe regardless of
how 1c/1d are eventually reconciled).

---

## 5. Recommendation for next steps

**Three separate items, of three different weights — do not bundle them into one session or one
ruling:**

1. **§2c (1b vs. 1c/1d, the doctrinal five-stage disagreement) needs a mentor ruling.** This is a
   genuine interpretive question about the correct Stoic circle sequence, it determines which
   vocabulary the *other* two families should eventually converge toward (or whether they legitimately
   serve different purposes and should not converge at all — e.g. the reflect/human-tool family's
   universal-humanity emphasis may be a deliberately more accessible practitioner-facing framing that
   should NOT be forced into the engine's more technical political/local distinction), and it touches
   R0-adjacent governing content per the ruling's own caution against silently changing R0. A ruling
   request is authored as this session's deliverable — see §7 / the companion file.
2. **§2b (`self_preservation` vs `self` naming drift) is directly founder-decidable, no mentor
   consultation needed.** It is a pure engineering-consistency call — pick one spelling, propagate it
   to the four 1d sites, keep a compatibility read path if any already-written rows use the old
   spelling. This can be scoped as its own small `code-elevated` session once the founder picks a
   spelling (or defers it until after the §2c ruling, since the ruling might affect which five-value
   family 1d should even be aligned to).
3. **§4 (the `llms.txt` public-honesty gap) is also founder-decidable as an interim safe correction**
   (describe the engine's actual served values), independent of the §2c ruling's outcome, though the
   full, durable fix likely waits on that ruling to avoid re-writing the same prose twice.

**Do not treat any of the three as urgent enough to justify skipping the §2c ruling** — none of them
are live safety, perimeter, or credential issues; all three are documentation/consistency questions
that can sit, disclosed, exactly as this document leaves them, until the founder and mentor are ready.

---

## 6. Verification before close

- `git diff --stat` at close: only this file (new), `operations/decision-log.md`, `CLAUDE.md`, and the
  companion ruling-request file (new, §7) are touched. Zero `.ts`/`.tsx`/`.sql`/`.json` files.
- Every enumeration claim above is backed by a direct grep/read citation (file + line), captured
  first-hand this session — none carried forward from the governing prompt, `CLAUDE.md`'s prior
  characterization, or the C15 ruling text itself (which was independently re-read at §1a/§1e and
  found to contain one imprecision, corrected at §1e).
- **PR19 independent second pass:** a second, independent grep sweep was run for `oikeiosis`,
  `circle`, `self_preservation`, `humanity`, `cosmic`, `local_community`, `political_community`,
  `cosmopolis` across `website/src/app/**/*.tsx` (beyond the `website/src/lib` sweep that found §1a–§1f)
  specifically to catch any consumer this document's first pass might have missed. It surfaced the
  five additional page-level citations folded into §1d (`score-policy/page.tsx`, `baseline/page.tsx`,
  `score/page.tsx`) and confirmed no consumer outside the six sites in §1 exists in the pages
  directory. No new vocabulary family was found by the second pass — the six sites in §1 are believed
  complete for `website/src`; `sage-mentor/` (the separate ring architecture) was checked only for the
  one file (`persona.ts`) that `mentor-profile-adapter.ts` names as its source, not swept exhaustively,
  since `CLAUDE.md` already documents that architecture as a distinct, largely-legacy system outside
  this session's live-decision-path focus — a future session touching `sage-mentor/` directly should
  re-sweep it specifically.
