# Next session — C15 doctrinal-split follow-on: execute the mentor's three-part mandate

**Paste this as the first message of a new session, beneath the standing session opener.**

**Tier: mixed, split by item — classify each of the three items below at the point you touch it, not
once for the whole session.** Item 1 (the `manifest.md` R0 addition) is `governance`, per the mentor's
own ruling text and this repo's standing discipline for edits to that file. Items 2 and 3 are
`code-elevated` (public-doc + database/code vocabulary consistency, no schema/flag/credential/auth
change expected). AC7 not engaged unless the founder explicitly redirects.

**Governing sources, read in order before touching anything:**
1. `manifest.md`, The Moral Community Boundary amendment's closing parenthetical (ruling C15) —
   re-read it fresh; it is the item this whole arc traces back to.
2. `operations/agent-circles-2026-08/2026-08-12-c15-oikeiosis-circle-enumeration-scoping.md` — the
   full first-hand inventory (six sites, file:line citations) this mandate is built on.
3. `operations/agent-circles-2026-08/2026-08-12-mentor-consultation-c15-doctrinal-split-ruling-
   verbatim.md` — **the binding ruling, verbatim wins over every summary below, including this one.**
4. `operations/decision-log.md`, entries `D-C15-OIKEIOSIS-CIRCLE-ENUMERATION-SCOPED-2026-08-12` and
   `D-C15-DOCTRINAL-SPLIT-MENTOR-RULING-ADOPTED-2026-08-12`.

---

## 0. Concurrency — run the parallel-window pre-flight first, as always

`operations/handoffs/founder/2026-08-10-idea-loop-parallel-window-NEXT-SESSION-PROMPT.md`. Re-derive
current state; do not inherit a cycle count from memory. None of this session's three items touch the
fenced IDEA-loop surfaces (`SUBSTRATE_FRESH_ENABLED`/`SUBSTRATE_WATCHING_ENABLED`/
`SUBSTRATE_LOOP_ID_FIELD_ENABLED`, the `CANDIDATE_LEVEL_OUTCOMES`/`CYCLE_LEVEL_OUTCOMES` vocabulary, the
idea-loop credential, or `/api/reason`/`/api/guardrail`/`/api/practice/fresh`/`/api/practice/watching`
request/response contracts) — Item 3 touches `sage-reflect/engine.ts` and its DB-backed sources, which
are NOT on that fenced list, but re-check the pre-flight anyway in case something has changed since
this prompt was authored.

---

## The mentor's ruling, in one paragraph (read the verbatim record for the full reasoning)

Both five-stage oikeiosis vocabularies in this codebase are doctrinally correct — they draw on
genuinely different, coexisting ancient emphases (Cicero's political-community stage vs. the
Hieroclean/Marcus/Epictetus local-to-universal reading with no separate political tier), not a right
answer and a wrong one. **They legitimately coexist, each canonical within its own domain**: the
engine vocabulary (`self_preservation`/`household`/`local_community`/`political_community`/
`cosmopolis`, `layer1-extractor.ts`) for the live scoring/trust-fold path; the reflect/human-tool
vocabulary (`self_preservation`/`household`/`community`/`humanity`/`cosmic`) for the practitioner-
facing reflect wire contract and the human tools. R0 (`manifest.md`) stays unchanged as content — it
was never claiming a specific five-stage expansion — but gains a clarifying statement. The naming drift
within the reflect/human-tool family (`self_preservation` vs. `self`) is resolved: `self_preservation`
is the canonical underlying vocabulary, `self` may remain a display label only.

---

## Item 1 — the R0 clarifying statement (`manifest.md`, governance-tier)

**Add 2-3 sentences to R0's own section** (after the existing four-circle list, `manifest.md:99-104`,
and before or alongside The Moral Community Boundary amendment that already sits below it — use your
judgement on exact placement, but it belongs near R0 itself, not buried elsewhere) stating, in your own
words but faithful to the ruling:

- The four circles above are a governance-level abstraction, not a claim that the correct philosophical
  expansion has exactly four stages.
- Two five-stage expansions exist in the codebase's live systems, each canonical within its own domain
  for a different, doctrinally legitimate reason (name them briefly — the engine's political-community
  distinction for justice-assessment purposes; the reflect/human-tool family's universal-humanity stage
  for practitioner accessibility) — cite the verbatim mentor ruling record as the source, do not
  re-derive the doctrinal argument inline.
- This clarifies R0's *scope*; it is not an amendment changing R0's substantive content (per the
  mentor's own framing — do not word it as a new rule or a change to the oikeiosis sequence R0 states).

**This is the one governance-tier edit in this session.** Follow the standing discipline this repo
uses for `manifest.md` changes (careful, scoped, cite the source ruling, do not let it grow beyond what
the ruling actually licenses).

**Also correct, in the same edit:** `manifest.md:118`'s current parenthetical description of the trust
core's `OikeiosisCircle` type as "five, free-form" — the scoping document's §1e found this imprecise
(the type is an unconstrained `string`, not literally five values; it is populated in practice by the
engine vocabulary but does not enforce that). Reword to something like "an unconstrained string,
populated in practice by the layer1-extractor engine vocabulary" — small, but worth fixing while this
section is open, since it is the same sentence that states the C15 discrepancy.

**Also update the C15 parenthetical itself** — it currently reads as declining to resolve the
discrepancy; note that it has now been ruled (coexistence, not convergence) with a pointer to the
verbatim record, so a future reader of `manifest.md` doesn't re-open a question already settled.

---

## Item 2 — the `llms.txt` public-honesty gap (`code-elevated`)

**The defect, confirmed at the scoping session:** `website/public/llms.txt:20` states, as a top-level
capability description: *"**oikeiosis**: Assessment across the five circles of concern (self,
immediate relations, wider community, rational beings, cosmos)"* — this reads as the reflect/human-tool
family. Twelve lines later, `llms.txt:130`'s worked JSON example shows `"circle": "local_community"` —
an engine-family value that does not exist in the vocabulary the prose just described. Nowhere is the
engine's actual five-value vocabulary published as an explicit list.

**The fix, per the ruling's framing (both families are canonical in their own domain — say so, don't
pick one):** re-word the line-20 description (and check for any other single-vocabulary phrasing
nearby) to disclose **both** vocabularies explicitly, each named for the surface it actually governs —
e.g., something to the effect of: "oikeiosis assessment on `/api/reason`/`/api/guardrail` uses
`self_preservation | household | local_community | political_community | cosmopolis`; the Sage Reflect
session-close contract (`circle_at_open`) and the human-practitioner tools use
`self_preservation | household | community | humanity | cosmic` — two distinct, both doctrinally
grounded five-stage readings, documented separately because they serve different purposes (see
[wherever you place a pointer, if one is warranted])." Verify the exact wording doesn't overclaim or
underclaim — re-read the worked JSON example at line 130 and the reflect section (`circle_at_open`,
further down the same file) after your edit to confirm both are now internally consistent with the
corrected prose.

**Check `agent-card.json` and `api-docs/page.tsx` for the same gap** — the scoping document's §4 named
`llms.txt` specifically but did not exhaustively check whether the other two R18 surfaces repeat the
same paraphrase-vs-example mismatch. Grep for the same "five circles of concern"-shaped phrasing (or
equivalent) in both, and correct if found.

**Verification:** after the edit, `npm run build` (this touches `website/public/` static files and
possibly `api-docs/page.tsx` — the standing lesson from CLAUDE.md's `nextjs-route-export-validation`
memory doesn't directly apply here since this isn't a `route.ts`, but running the build is cheap and
catches any accidental JSX/JSON break); re-read all three surfaces once more, side by side, before
closing.

---

## Item 3 — standardise `self_preservation` as canonical in the reflect/human-tool family (`code-elevated`)

**Scope, per the ruling: standardise the WIRE CONTRACT and DB-BACKED sources on `self_preservation`;
leave `self` as a permitted DISPLAY label in the human-practitioner tools.** Do not touch the engine
vocabulary (`layer1-extractor.ts` and everything downstream of it) — this item is entirely inside the
reflect/human-tool family (§1c/§1d of the scoping document).

**The reflect/human-tool family already, correctly, uses `self_preservation`** at its wire-contract
core: `sage-reflect/engine.ts`'s `CircleLevel` type, the `circle_at_open` field on
`POST /api/practice/reflect`, `stoic-brain.ts`'s `OIKEIOSIS_STAGES`, `sage-mentor/persona.ts`'s
`OikeioisMapEntry`, `mentor-profile-adapter.ts`'s validation set, `/api/baseline/agent`,
`/api/assessment/full`, and the two v3 DB migrations (`supabase-v3-baseline-progress-migration.sql`,
`supabase-v3-agent-assessment-migration.sql`). **These need no change.**

**The `self` variant needs to change its underlying storage/validation vocabulary to
`self_preservation`, while the human-facing display can keep saying "Self":**

- `website/supabase-mentor-gaps-migration.sql:169` — `oikeiosis_reflections.stage` CHECK constraint.
  **This table has live rows** (per CLAUDE.md, the quarterly diagnostic has been in production use) —
  a widening-then-data-migration, NOT a destructive rewrite: widen the CHECK to accept BOTH `self` and
  `self_preservation` first (additive), then decide whether to actually migrate existing `self` rows to
  `self_preservation` or leave them (check with the founder — a live-data UPDATE is a bigger step than
  this prompt should pre-authorize; the safe default is widen-and-accept-both, write new rows as
  `self_preservation`, leave old rows alone unless the founder wants a backfill).
- `website/src/app/api/mentor/oikeiosis/route.ts:9` — `VALID_STAGES` — update to accept
  `self_preservation` going forward (and `self` too, if the table still admits both, for backward
  compatibility with anything already written).
- `website/supabase-circle-extension-migration.sql:44-49` — `circle_extension_entries.current_circle`
  / `.extended_circle` CHECK constraints. **Check whether this table has live rows first** (it is
  newer than `oikeiosis_reflections` — confirm via a read-only count before deciding whether this is a
  clean rename or needs the same widen-first care).
- `website/src/app/api/mentor/oikeiosis/extension/route.ts:11` — `CIRCLES` local const — update to
  match whatever the migration decision above lands on.
- `website/src/app/oikeiosis/page.tsx:70-74` and `website/src/app/score/page.tsx:428` — these are
  **display-only** and may keep showing "Self" as a human-readable label (per the ruling's explicit
  allowance) — but confirm the underlying `id`/value each label maps to is updated to
  `self_preservation` wherever that id round-trips to the API (i.e., if the page sends
  `current_circle: 'self'` in a request body, that now needs to become `current_circle:
  'self_preservation'` even though the on-screen label still reads "Self").

**Migration discipline:** any DB CHECK-constraint widening follows this repo's standing
`§PRE`/`§APPLY`/`§VERIFY`/`§INVERSE` migration-file shape (see `operations/handoffs/founder/
2026-08-10-idea-loop-parallel-window-NEXT-SESSION-PROMPT.md`'s Mode 1 for the exact discipline this
repo uses elsewhere) — migration before code, TEST before production, founder runs the actual SQL.
**Do not silently rewrite live practitioner data** without the founder's explicit sign-off on whether
existing `self` rows get backfilled or left as a permitted legacy value.

---

## What NOT to do

- Do not touch the engine vocabulary (`layer1-extractor.ts`, `layer2-mechanisms.ts`,
  `kathekon-engagement.ts`, or anything downstream) — the ruling explicitly keeps it as-is, canonical
  for its own domain.
- Do not reword R0's actual four-circle content (Item 1 adds a clarifying statement; it does not
  change "Self / Household / Community / Cosmos" or reduce/expand that list).
- Do not silently pick a side on the doctrinal question anywhere in code comments or docs — every
  place that now explains the two-vocabulary split should attribute it to the ruling (coexistence, not
  one being more correct).
- Do not touch the fenced IDEA-loop surfaces (§0 above).
- Do not resolve the `idea-loop-types.ts` comment nit (pointing at `profiles.ts` instead of the
  layer1-extractor vocabulary) unless it's a one-line drive-by while already in a nearby file — it was
  named as a non-urgent nit in the scoping document, not part of this mandate.

---

## Verification before you close

1. `git diff --stat` — confirm the touched-file set matches exactly: `manifest.md` (Item 1); `llms.txt`
   + possibly `agent-card.json`/`api-docs/page.tsx` (Item 2); the reflect/human-tool family's route
   files, one new or amended migration file, and the two display pages' request-body values (Item 3).
   No engine file (`layer1-extractor.ts`, `layer2-mechanisms.ts`, `kathekon-engagement.ts`,
   `trajectory-delta.ts`, `orientation-reading.ts`, `guardrail-sandwich.ts`, `sage-reason-engine.ts`)
   should appear in the diff.
2. `npm run build` clean.
3. Live or TEST verification of Item 3's migration per the founder-walked discipline (whichever table
   changed) — a read-before/read-after on the actual constraint, not just a green battery.
4. Re-read all three R18 public surfaces once more after Item 2, side by side with the two vocabularies
   now correctly attributed, to confirm no remaining internal contradiction.

## Close with

- A decision-log entry (mixed-tier — note the split classification per item, per the standing
  discipline for sessions that cross tiers) recording all three items' execution.
- Update `CLAUDE.md`'s C15 status from "ruled — coexistence, not convergence; execution pending" to
  reflect completion, quoting the mentor's closing line ("C15 is closed") once all three items are
  actually done — do not mark it closed if only some of the three land; note which remain if the
  session runs out of room.
