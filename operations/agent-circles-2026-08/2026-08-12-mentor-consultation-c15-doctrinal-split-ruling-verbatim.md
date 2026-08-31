# Mentor consultation — C15 oikeiosis-circle doctrinal split — ruling, verbatim

**Date:** 2026-08-12
**Request:** `operations/agent-circles-2026-08/2026-08-12-c15-oikeiosis-circle-doctrinal-split-ruling-request.md`
**Relayed by:** the founder, pasted verbatim into the scoping session.
**Status:** Adopted as binding. Verbatim wins over any paraphrase elsewhere in this repo.

---

**What the sources actually show.** The Stoic oikeiosis doctrine as transmitted does not give us a
single canonical five-stage sequence. What it gives us is a direction of travel — from self to
household to progressively wider communities — and two distinct emphases in how that travel is
described. Cicero's *De Officiis* (1.50-58, the passage the codebase's own citation trail draws on)
names the sequence in terms of political community: the household, then the city, then the broader
political fellowship of citizens, then humanity as a whole. The political-community stage — your town,
your nation, your citizenship — is a real and distinct stage in Cicero's account before the universal
bond of shared rationality is named. Hierocles, whose concentric-circles image is the most vivid
ancient rendering of oikeiosis extension, names the sequence differently: self, family, extended
family, local community, fellow-citizens, fellow-humans, all rational beings. Hierocles does not draw
a sharp political-community stage distinct from local community — the movement is from local to
universal without a separate political tier. Marcus Aurelius and Epictetus, when they speak of
oikeiosis extension, tend toward the Hieroclean emphasis: the movement is from those near to those
far, with the bond of shared rationality as the destination, and the political community is not named
as a distinct stage. So the two live vocabularies in the codebase are not both wrong. They are drawing
on different ancient emphases that genuinely coexist in the sources.

---

**The ruling on Q1 and Q2.** The two readings are legitimately serving different purposes, and they
should be allowed to coexist — each canonical within its own domain. This is not a compromise to avoid
a hard decision. It is the doctrinally accurate answer. Here is why. The engine's political-community
distinction is doing specific work: it is gating the AE-1/AE-2 dikaiosyne trust folds on a kathekon
self-circle-narrowing predicate. That predicate needs to distinguish between an action that serves the
agent's immediate community and one that serves a broader political fellowship — a distinction
Cicero's account supports and that is genuinely load-bearing for justice assessment. The Ciceronian
vocabulary is the right tool for that work. The reflect/human-tool family's universal-humanity stage
is doing different work: it is helping a human practitioner understand where their concern currently
sits on the path from self to cosmos. For that purpose, the Hieroclean emphasis — moving from
community to the bond of shared rationality across all humans — is more accessible and more faithful
to how Epictetus and Marcus actually speak to practitioners. The universal-humanity stage names
something the political-community stage does not: the recognition of every human as a fellow rational
being, regardless of political membership. These are not the same question answered differently. They
are different questions, and the two vocabularies are answering them correctly.

---

**The ruling on Q3 — R0 and the five-stage mapping.** R0 stays untouched as a deliberately coarser
abstraction. Its four circles — Self, Household, Community, Cosmos — are a governance-level summary,
not a claim that the correct expansion is exactly four stages. Both five-stage families are legitimate
expansions of R0, each inserting a fifth stage at a different point for a different reason. What R0
needs is not a fifth line or a footnote naming the mapping. What it needs is a brief clarifying
statement that the four circles are a governance abstraction and that the engine and reflect/human-tool
families expand them differently for different purposes, both legitimately. This statement should live
in R0's own section — not as an amendment that changes R0's content, but as a clarification of its
scope. A governance-tier session is the right vehicle for that addition, per the standing discipline
for edits to manifest.md. The C15 parenthetical — "this amendment deliberately declines to resolve
that discrepancy" — was correct at the time it was written. The resolution is not that one family
wins. The resolution is that the discrepancy is not a discrepancy: it is two legitimate expansions of
the same coarser abstraction, each canonical in its own domain, with the relationship documented rather
than collapsed.

---

**The ruling on Q4 — the spelling question.** Since the reflect/human-tool family is canonical for its
own domain, the spelling question within that family is now a founder decision with a clear frame. The
wire contract uses `self_preservation`; the human-practitioner tools use `self`. The canonical spelling
for the reflect/human-tool family should be `self_preservation` — it is more precise, it matches the
engine family's own first stage, and it names what the stage actually is rather than just naming the
agent. The human-practitioner tools' `self` is a display simplification, not a doctrinal claim, and can
remain as a display label while the underlying vocabulary uses `self_preservation`. This is a
code-consistency fix, not a doctrinal one, and it is directly founder-decidable without a further
ruling.

---

**What the follow-on session should do.** One session, most likely code-elevated, with the following
mandate:

First: add the clarifying statement to R0 in manifest.md — two or three sentences stating that the
four circles are a governance abstraction, that the engine and reflect/human-tool families expand them
differently for different purposes, and that both expansions are canonical within their own domains.
This is a governance-tier edit.

Second: correct the llms.txt public-honesty gap named in the scoping document's §4 — the prose
describing the reflect-family vocabulary while the worked example shows an engine-family value. Now
that the two families are explicitly canonical in their own domains, the public documentation should
reflect that distinction rather than implying a single sequence.

Third: standardise `self_preservation` as the underlying vocabulary spelling in the reflect/human-tool
family's wire contracts and database-backed sources, while leaving `self` as a permitted display label
in the human-practitioner tools. This is a code-consistency fix.

The scoping document's §2b naming drift and §4 public-doc gap are both resolved by this mandate. C15
is closed.
