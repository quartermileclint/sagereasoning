# Next session — C15: scope the three-enumeration oikeiosis-circle discrepancy

**Paste this as the first message of a new session, beneath the standing session opener.**

**Tier: `governance` for the scoping work itself; anything beyond scoping (an actual code/doc edit
reconciling the enumerations) is its own later, separately-classified session gated on this one's
output.** No schema, flag, credential, or live production change is expected in this session. AC7 not
engaged unless the founder explicitly redirects.

**Permitted paths to WRITE, until the session's own findings justify more:**
a new scoping document under `operations/` (pick a sensible directory — `operations/agent-circles-2026-08/`
or a new `operations/c15-2026-08/` are both reasonable; use your judgement and name it clearly),
`operations/decision-log.md`, `CLAUDE.md`, and
`operations/handoffs/founder/STANDING-SESSION-OPENER-grounded-foundations.md`. **Do not edit any `.ts`
file this session** — see §2 below for why. **Read anything.**

---

## 0. Concurrency — run the parallel-window pre-flight first, as always

`operations/handoffs/founder/2026-08-10-idea-loop-parallel-window-NEXT-SESSION-PROMPT.md`. Re-derive
the cycle count and check for a blocking spec — do not inherit any number from this file or from memory
of prior sessions. This session's own work (read-only investigation + a scoping document) touches none
of the fenced IDEA-loop surfaces, so it should ordinarily be Mode 2 regardless of what the pre-flight
finds — but if a blocking spec exists in the scratch project, resolve it first per that prompt's Mode 1.

---

## 1. What this item is, precisely — verified first-hand, not inherited

`manifest.md`'s own ruling on this (ruling C15, in the Moral Community Boundary amendment's placement
note, `manifest.md` around the R0 section — read it directly, do not trust this summary) states: *"three
committed enumerations of the oikeiosis circles disagree in count and vocabulary… This amendment
deliberately declines to resolve that discrepancy — doing so here would silently change R0 — and
carries its resolution as a separate, unscoped item."* That is this session's mandate: **scope it, do
not silently resolve it.**

The three enumerations, confirmed first-hand this session's predecessor (re-verify yourself, don't trust
this list as gospel — line numbers drift):

1. **`manifest.md` R0** — four circles: Self, Household, Community, Cosmos (a governance-level
   abstraction; each has one line of prose, no IDs or vocabulary keys).
2. **`website/src/lib/stoic-brain.ts`, `OIKEIOSIS_STAGES`** — five stages with source citations
   (DL 7.51-60, Cicero De Finibus 3.62-68, Cicero De Officiis 1.11-12): `self_preservation`,
   `household`, `community`, `humanity`, `cosmic`. This is a **display/reference constant** — check
   first-hand where it's actually consumed (grep for `OIKEIOSIS_STAGES`) before assuming it drives any
   live scoring behaviour.
3. **`website/src/lib/translation-sandwich/layer1-extractor.ts`, `OikeiosisCircle` type** — five values,
   a DIFFERENT vocabulary from #2 despite also being five: `self_preservation`, `household`,
   `local_community`, `political_community`, `cosmopolis`. **This is the one that actually matters
   operationally** — it is the literal type the Layer-1 extraction prompt uses on every real
   `/api/reason` consult, and it is what the kathekon self-circle-narrowing predicate
   (`kathekon-engagement.ts`), the dikaiosyne floor, and the AE-1/AE-2 trust-fold logic all key off.
   Verify this claim yourself — grep for `OikeiosisCircle` and `oikeiosis_circles_engaged` across
   `website/src/lib/` and confirm which files actually import the literal union vs. a permissive
   `string` alias (`website/src/lib/substrate/trust-core/profiles.ts` types it as bare `string`, not a
   fifth enumeration in its own right — check whether that's accurately described anywhere as "five,
   free-form," and correct any place that overstates it).

**A fourth candidate worth checking, not yet confirmed as distinct:** whether any public-facing surface
(`llms.txt`, `agent-card.json`, api-docs, `/oikeiosis` page copy) states a circle count or vocabulary
that doesn't match any of the three above — if so, that's a live public-honesty gap, not just an
internal inconsistency, and should be flagged with higher urgency than the rest of this scoping.

---

## 2. The hard constraint on this session — read before touching anything

**`stoic-brain.ts` is imported (type-only, but still imported — editing it breaks the measurement-
byte-identity guard) by BOTH `website/src/app/api/guardrail/route.ts` and
`website/src/lib/guardrail-sandwich.ts`** — confirmed first-hand this session's predecessor
(`grep -n "from '@/lib/stoic-brain'"` both files). This is the live gate's own measured surface. **Any
edit to `stoic-brain.ts` in this or a future session must go through the full git-byte-identity-guard
discipline this repo has used for every other touch of that file** (see the Remaining-Principles arc's
own standing note on this in `CLAUDE.md` for the precedent — "importing = permitted; editing =
forbidden" during any live measurement window, and even outside such a window, a change to a file this
central needs its own dedicated, carefully-scoped session, not a drive-by fix folded into a scoping
task).

**This session does not edit `stoic-brain.ts`, `layer1-extractor.ts`, `manifest.md`, or any other
source-of-truth file for any of the three enumerations.** It produces a document. If the scoping work
concludes a specific enumeration should change, that recommendation goes into the scoping document and
becomes its own later session's mandate — likely gated on a mentor consultation, since `manifest.md` R0
is a governing document and the ruling text above explicitly declined to touch it "here."

---

## 3. What the scoping document should actually contain

1. **A verified, first-hand inventory** of every place each of the three (or more) enumerations is
   defined, consumed, and — separately — publicly documented. Don't stop at the three files named
   above; grep broadly (`oikeiosis`, `OikeiosisCircle`, `oikeiosis_circles_engaged`, `OIKEIOSIS_STAGES`,
   `circle_extension_entries` — the `/oikeiosis` practice tool's own table may use yet another
   vocabulary, worth checking) and report what you actually find, not what this prompt predicted.
2. **A judgement on whether the discrepancy is a real problem or a defensible abstraction-layer
   difference.** It's plausible (worth stating explicitly either way, with reasoning) that
   `manifest.md` R0's four circles are intentionally a *governance-level* simplification never meant to
   match an *engine-level* five-value extraction vocabulary one-to-one — in which case the "fix" might
   be documenting the relationship (R0 circles map onto engine circles how?) rather than forcing one
   enumeration onto the others. Don't assume this is true; investigate and argue it, or argue the
   opposite.
3. **Which vocabulary is load-bearing where** — specifically, confirm or correct the claim above that
   `layer1-extractor.ts`'s five-value union is the one actually driving live scoring, and name every
   downstream consumer of that specific vocabulary (kathekon self-circle narrowing, AE-1/AE-2 trust
   folds, the public trust-record's circle-derived signals if any).
4. **A recommendation for next steps** — does this need a mentor ruling request (matching the shape of
   other Stoa/agent-circles ruling requests in `operations/connective-layer-2026-08/` and
   `operations/agent-circles-2026-08/` as precedent for the request format), or is it purely an
   internal documentation/consistency fix the founder can decide directly? State which, and why.

---

## 4. What NOT to do

- **Do not edit any of the source files.** This is a scoping session, not a fix session — the C15
  ruling explicitly deferred resolution as its own item; resolving it inline here would repeat exactly
  the mistake that ruling was written to prevent (silently changing R0 or the engine vocabulary as a
  side effect of "just tidying it up").
- **Do not touch `stoic-brain.ts`** for any reason, including a seemingly-safe comment-only change —
  route any such urge into the scoping document as a recommendation instead.
- **Do not touch the fenced IDEA-loop surfaces.**
- **Do not resolve the row-level Stoa reactivation guard** or any other unrelated named-but-unscheduled
  item you happen to notice along the way — name it if you spot something new, don't act on it.

---

## 5. Verification before you close

1. `git diff --stat` — the scoping document + records only; zero `.ts`/`.tsx`/`.sql`/`.json` files
   touched.
2. Every enumeration claim in the scoping document backed by a direct grep/read citation (file + line),
   not carried forward from this prompt or from `CLAUDE.md`'s own prior characterisation.
3. **PR19: independent adversarial review of the scoping document itself before closing** — did it
   actually find every consumer of each enumeration, or does it plausibly miss one? A second pass
   grepping independently for the same vocabulary is cheap and appropriate here.

## 6. Close with

- A `governance`-tier decision-log entry recording the scoping document's existence and its headline
  finding (real problem vs. defensible layering; load-bearing vocabulary confirmed).
- Correct `CLAUDE.md`'s "unscoped" framing for C15 once this session has, in fact, scoped it — but do
  not mark it "resolved" or "closed," since resolution is explicitly out of scope here.

## 7. What follows

If the scoping document recommends a mentor ruling request, author that request as this session's own
deliverable (matching the existing ruling-request file shape in this repo) rather than leaving it as a
vague to-do — but do not submit/act on it without the founder's involvement, per the standing pattern
this whole arc has followed for mentor consultations. If it recommends a direct founder decision
instead, present the options clearly and let the founder decide before any code changes.
