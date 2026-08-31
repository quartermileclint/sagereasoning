# Ruling request — the load-bearing oikeiosis five-stage doctrinal split (C15, §2c)

**Date:** 2026-08-12
**Prepared by:** AI (Claude Code), per `manifest.md`'s own ruling **C15** (the Moral Community
Boundary amendment's closing parenthetical): *"three committed enumerations of the oikeiosis circles
disagree in count and vocabulary… This amendment deliberately declines to resolve that discrepancy…
and carries its resolution as a separate, unscoped item."* The scoping session this request is drawn
from is `operations/agent-circles-2026-08/2026-08-12-c15-oikeiosis-circle-enumeration-scoping.md` —
read that document's §2 and §3 first; this request summarizes only the one part of it (§2c) judged to
need a mentor ruling. The other two findings (§2b naming drift; §4 public-doc gap) are recorded there
as directly founder-decidable and are NOT part of this request.
**Status:** open question. No wording has been changed anywhere. This is the request itself, not a
proposed fix.

## The fact already established

`manifest.md` R0 states four circles (Self / Household / Community / Cosmos) as a governance-level
abstraction. Live code and public docs carry **two different, mutually incompatible five-value
expansions** of that same sequence:

- **The engine vocabulary** (`layer1-extractor.ts:80-85`, live on every `/api/reason` and
  `/api/guardrail` call, and load-bearing on the kathekon self-circle-narrowing predicate that gates
  the AE-1/AE-2 dikaiosyne trust folds):
  `self_preservation → household → local_community → political_community → cosmopolis`
- **The reflect/human-tool family** (`sage-reflect/engine.ts`'s public `circle_at_open` field on
  `POST /api/practice/reflect`; the `/oikeiosis` and `/score` practitioner-facing pages; `stoic-
  brain.ts`'s reference constant, though that one is display-only and not itself consumed live):
  `self(_preservation) → household → community → humanity → cosmic`

These are not the same five stages differently spelled — they draw the split between "household" and
"cosmos" in genuinely different places. The engine reading follows a Ciceronian **political**
distinction (your town vs. your nation/citizenship) before reaching the cosmopolis. The reflect/human-
tool reading instead names a single `community` stage, then a distinct **universal-humanity** stage
(the bond of shared rationality across all humans), before `cosmic` — no separate political-community
stage at all.

Both readings are textually defensible from the sources already cited elsewhere in this codebase.
`stoic-brain.ts:448-449` itself cites Cicero *De Officiis* 1.20-22 for its "community" stage and
1.11-12 for its "humanity" stage — i.e. the codebase's own citation trail draws on passages that
*could* support either a political-community stage or a universal-humanity stage, depending on which
is emphasized, and the two live vocabularies have simply made that choice differently in different
places without anyone deciding it as a single question.

## Why this is a ruling request, not an engineering fix

Three reasons, each independently sufficient:

1. **It is a live doctrinal disagreement about the correct Stoic circle sequence**, not a naming typo
   (contrast the separate, directly founder-decidable `self` vs. `self_preservation` spelling drift
   recorded in the scoping document's §2b, which genuinely is just an implementation inconsistency).
2. **It is R0-adjacent.** The C15 ruling itself specifically declined to resolve this "here" because
   doing so "would silently change R0" — R0's four circles are the governance abstraction both
   five-value families claim to be expansions of, and picking one family as canonical is, in effect, a
   statement about how R0 should be read at finer resolution.
3. **It has already shipped in two different, live, mutually visible places** — one governs the
   engine's actual scoring behaviour and trust-fold logic, the other is documented and shown to human
   practitioners as *the* oikeiosis sequence on a public page and a public API contract. Neither is
   hidden or dark; a mentor ruling here is correcting a live disagreement, not gating an unbuilt
   feature.

## The question(s)

1. **Is one of the two five-stage readings the doctrinally correct expansion of R0's four circles**,
   such that the other should eventually be migrated to match it? Or:
2. **Are the two readings legitimately serving different purposes** — the engine's political-community
   distinction suiting fine-grained action-scoring, the reflect family's universal-humanity emphasis
   suiting a more accessible practitioner-facing framing — such that they should be allowed to
   *coexist*, each canonical within its own domain, with the relationship between them simply
   *documented* rather than collapsed?
3. **If a single canonical five-stage reading is preferred, which one, and does R0 itself need any
   amendment** (a fifth line naming the mapping, or a footnote) to state how its four circles expand
   into it — or does R0 stay untouched as a deliberately coarser abstraction that no five-value
   reading needs to literally nest inside?
4. **A related, smaller question the same ruling could dispose of in the same pass:** the scoping
   document also found a straightforward spelling inconsistency between the two halves of the reflect/
   human-tool family itself (`self_preservation` in the reflect wire contract and its DB-backed
   sources, vs. `self` in the two human-practitioner tools and their DB tables and public page) — this
   was judged directly founder-decidable and does NOT need a mentor ruling on its own, but if the
   mentor's answer to Q1/Q2 above settles on the reflect/human-tool family (rather than the engine
   family) as canonical for *some* purpose, the mentor may wish to specify which spelling that
   canonical form should use, saving a second, later question.

## What happens after the ruling

No wording or code changes anywhere pending the mentor's ruling. Once ruled, the outcome becomes its
own separately-classified session's mandate (per the governing scoping prompt's §7) — most likely
`code-elevated` if it is a documentation/consistency convergence, or possibly touching `manifest.md`
itself (which would need its own `governance`-tier session per the standing discipline for edits to
that file) if the ruling calls for an R0 amendment. The public-honesty gap named in the scoping
document's §4 (`llms.txt`'s prose describing the reflect-family vocabulary while its own worked example
shows an engine-family value) should very likely be corrected in the same follow-on session, once the
canonical wording is settled by this ruling — though the founder may elect to fix it sooner, as an
interim safe correction, independent of this ruling's timeline (see the scoping document's §4/§5 for
that option).
