# Scope — "what is caller-supplied extraction for?" (route (i), as its own question)

**Authored 2026-09-03.** `governance`, **documents only.** No code, migration, flag, credential, or
public-surface edit. AC7 not engaged. Weights BLOCKED throughout. Nothing here bears on the 0h call.

**Mentor-ordered.** `2026-08-25-mentor-ruling-extraction-provenance-fix-choice-verbatim.md` (Q3,
binding, verbatim wins) ruled route (i) must NOT be decided as a side effect of the provenance-gap
fix, and must be scoped as its own session — *"what is caller-supplied extraction for?"* — with three
named inputs: the disagreement policy, the plugin-path consequences, and the Arm-B relationship.
**This document is that session.** Its precondition — the `l1_supply` population query — was already
run and returned **zero live exposure** (`operations/agent-circles-2026-08/
2026-08-25-extraction-provenance-honesty-correction-SIGNOFF-PACKAGE.md`; both active `l1_supply`
credentials revoked as dead test artifacts, item 2a). Openable on election, per the standing queue;
this session elects to open it.

**Relationship to the prior scoping.**
`2026-08-25-extraction-provenance-and-independent-extractor-SCOPE.md` (§4.4, "Option 4 — route (i)")
already did substantial groundwork under a different question ("how do we fix the provenance gap?")
— measured latency/cost, named the two architectural consequences, and correctly declined to rule the
disagreement policy. This document does not repeat that groundwork; it cites it, adds what changes
under the narrower question the mentor actually asked, and reaches the point where a ruling becomes
possible.

---

## §1 — What `l1_supply` is for, verified at source (not assumed)

The capability exists for exactly one documented reason: **the plugin path.** `route.ts:20-21` —
*"plugin-authenticated callers submit a pre-computed Layer1Schema (the plugin ran Layer 1
locally...)"* — dated to the original substrate-as-plugin build (Stage 1, 2026-05-10). A
plugin-installed integration already has an LLM in its own execution loop; the design choice was to
let it produce the extraction itself rather than pay for a second, server-side Sonnet call on every
consult. This is a genuine cost/latency optimisation for a specific caller class, not a vestigial or
accidental surface.

`presetForPurpose` grants `l1_supply` to two presets: `ecosystem` and `plugin_install`
(`practice-credential.ts:216-220`). Only the second has a documented purpose. **The `ecosystem`
grant has no stated reason in the codebase** — the closest thing to one is that both active
`ecosystem`-preset credentials carrying the capability were, on inspection, dead test artifacts
(item 2a), never a live integration. Item 2b (already carried, re-tiered `code-critical`, "no longer
urgent") proposes removing `l1_supply` from the `ecosystem` preset specifically — this document treats
that proposal as directly relevant evidence, not a separate item, because it bears on §4 below.

## §2 — What Arm B actually threatens, and what it does not, given the current state

`memory: gaming-robustness-extraction-trust-locus-split` (2026-06-27, re-confirmed 2026-07-26) is the
canonical statement: **Arm B is a caller supplying a fabricated Layer-1 extraction — the deterministic
Layer-2 scorer trusts whatever schema it is given, so a supplied schema claiming `met`/
`examined_before_acting:true` throughout scores `sage_like` regardless of the true action.** All
seeds tested crossed to `sage_like`. This is the "same structural ceiling [as the self-report-omission
class, A2], one layer earlier."

Three facts, each independently verified this session and in the 08-25 scope document, narrow what
this actually threatens **today**:

1. **Current exposure is zero.** No active credential carries `l1_supply` (item 2a). Arm B requires a
   credential holding the capability; none exists. This is not a permanent property — a future mint
   could restore it — but it means route (i) would be built against a threat that is currently
   unreachable, not one currently being exploited.
2. **The live ENFORCE surface is already structurally immune.** `/api/guardrail`'s route and its
   sandwich have zero `layer1_schema` occurrences; the body destructure is closed to a fixed field set
   (fact 9, the 08-25 scope document). Arm B cannot reach the surface that actually binds a
   proceed/block decision on an irreversible action, with or without route (i).
3. **Route (i) does not unblock weights, because A2 remains a separate, structural ceiling
   regardless.** The self-report-omission class (A2) — an honest extractor faithfully recording a
   narration that omits a real harm — is *"un-catchable from text alone… needs an independent 'who is
   affected?' pass, not a schema/text check"* (the same memory). Route (i) closes Arm B; it does
   nothing to A2. Since weights use is BLOCKED by the more general "extraction can be made to lie or
   omit" finding, not by Arm B specifically, **closing Arm B alone would not move the weights
   disposition.**

**What Arm B threatens, precisely stated:** the `/api/reason` consult response (whose `assessment`
field a caller reads back) and the public trust-record/accreditation surface (the events that
`emitAccreditationTrustEvents` mints from a submitted signed assessment) — the developer-refine and
logos-enforce tiers of the trust ladder, not the ENFORCE gate and not weights. This is real and worth
naming precisely, and it is a materially smaller threat surface than "route (i) closes the whole
Arm-B problem" reads as in isolation.

## §3 — The disagreement policy, worked rather than merely flagged

The 08-25 document correctly identified that "checked against" needs a policy and that the policy is
itself a gaming/over-strictness surface, but did not work the options. Doing that now, because the
mentor's Q3 ruling named it as a required input, not an implementation detail to defer.

| Policy | Mechanism | What it costs |
|---|---|---|
| **Reject-on-disagreement** | Any divergence between the supplied and server-re-extracted schema → refuse the consult or floor to `reflexive`. | Re-opens the exact over-strictness direction the §4 unity-thesis coupling closed (`memory: over-strictness-check-must-be-rank-preserving`). Extraction at `temperature: 0.2` is not deterministic; two honest extractions of the same text can differ on a borderline field. This policy would floor legitimate variance, not just lies. |
| **Take-the-stricter** | Score using whichever of the two extractions yields the more conservative `katorthoma_proximity`. | Safe direction (never scores more leniently than either extraction alone would). But biased: a caller who knows this rule can supply a schema that is *stricter than the truth* on fields that don't matter and *lenient on the one that does*, hoping the aggregate stricter-of-two still favours it on the load-bearing field. Untested against this specific attack shape. |
| **Take-the-server's** | Use the server's own re-extraction; the supplied schema is read but never scored. | Makes the supplied schema **purely decorative** — the caller pays the plugin's local-extraction cost for nothing, since the server extracts anyway and that is what gets scored. This is functionally identical to deprecating `l1_supply`, just without saying so. |
| **Flag-and-proceed (not previously named)** | Score the supplied schema as today; when the two disagree, attach a disclosed `extraction_disagreement` field to the response/signed assessment rather than altering the verdict. | Closes nothing structurally — Arm B still crosses whenever the two disagree in the attacker's favour, since the verdict is unchanged. But it is honest, cheap (no re-scoring logic, no new gaming surface), and gives a downstream consumer the same signal the corroboration check already gives for the text-vs-claim class. Worth naming because every one of the first three options either re-opens a closed gaming class or makes the plugin path pointless; this one does neither, at the cost of closing Arm B less completely. |

**No option in this table closes Arm B without cost.** The first three each recreate a problem this
project has already spent real effort closing (over-strictness) or defeat the plugin path's entire
purpose (§4). The fourth is honest and cheap but leaves the crossing possible — it converts an
unmonitored gap into a monitored one, the same shape as the provenance-ledger's own honest,
bounded-coverage compromise (option 2′, already ruled the right structural fix for the sibling
problem). **This is the genuine design choice the disagreement policy represents, and it is the
founder's/mentor's to make, not this document's.**

## §4 — The plugin-path consequence, sharpened

The 08-25 document named this correctly but did not follow it through: `l1_supply` is **mandatory**
on the plugin path (fact 4, `route.ts:554-568` — absent/null `layer1_schema` on that auth path is a
400). Route (i), under **any** of the first three disagreement policies, means every plugin call now
also pays the server-side extraction cost — the same ~10-13s / ~$0.04-0.06 the 08-25 document measured
as the incremental cost on the schema-supplied subset, landing in full on the ONE caller class the
capability was built for.

Under take-the-server's, this is not a subtle cost increase — it is the removal of the plugin path's
reason to exist, while the plugin still pays for its own local extraction on top. Under
reject-on-disagreement or take-the-stricter, the plugin path keeps its purpose but gains route (i)'s
full latency/cost burden as a permanent tax, on every call, to guard against a threat (§2) that
currently has zero active holders anywhere in the system, plugin path included — the population query
covered all `l1_supply`-capable credentials, not only `ecosystem`-preset ones.

**The honest framing: route (i) does not merely have a cost on the plugin path — under three of its
four disagreement policies, it either taxes the plugin path's own design purpose permanently or
eliminates that purpose outright.** Only flag-and-proceed avoids this, at the cost of leaving Arm B
open.

## §5 — A narrower alternative this document surfaces, not previously compared directly

Item 2b (narrow `l1_supply` out of the `ecosystem` preset, keep it on `plugin_install` only) was
carried as a credential-hygiene item, not compared against route (i) as an alternative mitigation for
the SAME threat. It should be, because the comparison changes the shape of the decision:

- **After 2b alone** (no route (i)): `l1_supply` becomes reachable ONLY via the `plugin_install`
  preset. A plugin author supplying a lying extraction is not an arbitrary public caller gaming an
  API — they are the entity that installed the plugin and is, in effect, vouching for their own
  agent's reasoning with their own credential. This is a materially different trust posture than
  "any ecosystem credential can supply a fabricated extraction," and it is the SAME kind of
  narrowing-closes-most-of-the-gap move the mentor already ruled sound for the sibling problem
  (option 2′ over option 1 — "not worse than the current state for the population they leave
  uncovered — the current state has no coverage at all").
- **The residual after 2b:** a malicious or compromised plugin author could still lie. Route (i) is
  the only option that closes this residual directly (§4.4 of the 08-25 document, unchanged). Whether
  that residual is worth route (i)'s cost — given it would now apply to a single, narrower, more
  accountable caller class rather than the general population — is a materially different question
  than "should route (i) exist to guard the whole `l1_supply` surface," and is the one this document
  recommends actually be put to a ruling.
- **2b is cheap and mostly orthogonal.** It is a credential-scoping change (`code-critical` per its
  own carried tier, but narrow — a preset edit, not a new engine behaviour), buildable and reversible
  independent of any route (i) decision. It does not foreclose route (i) later if the narrower
  residual is judged unacceptable.

## §6 — Recommendation *(permitted; this elects nothing)*

Offered with reasoning, as house convention allows. **The founder and the mentor decide.**

**Recommended shape: elect 2b now, defer route (i) pending a fresh look at the narrower residual.**

- **2b first**, because it is cheap, reversible, already carried and merely un-prioritised, and
  because it converts the general-population Arm-B threat into a single-caller-class threat with a
  fundamentally stronger accountability posture — without route (i)'s cost to the plugin path's own
  purpose or its risk of re-opening the over-strictness class.
- **Route (i) not now**, for reasons this document adds to the 08-25 document's own case: current
  exposure is zero everywhere (not just in the `ecosystem` preset); the ENFORCE surface it might seem
  to protect is already immune; weights stays blocked by A2 regardless of whether Arm B closes; and
  three of its four disagreement-policy shapes tax or eliminate the one documented purpose
  `l1_supply` serves. **This is a stronger case against building it now than the 08-25 document made**,
  because that document analysed route (i) against the FULL `l1_supply` population; after 2b, the
  remaining population is smaller and structurally more accountable, which lowers route (i)'s
  marginal benefit further.
- **If the mentor judges the post-2b residual (a plugin author lying about their own extraction)
  unacceptable, route (i) remains available**, and this document's §3 table is the disagreement-policy
  starting point for that build — **flag-and-proceed is the option this document would recommend
  first**, if route (i) is elected at all, because it is the only one that does not either recreate a
  closed gaming class or defeat the plugin path's purpose.
- **A named residual this document does not resolve:** whether `l1_supply` should be REMOVED from
  `plugin_install` too (making every plugin call pay server-side extraction unconditionally) is a
  materially different, more disruptive question than 2b, was not asked by the mentor's Q3, and is
  explicitly out of this document's scope.

## §7 — Constraints observed, and what this does not do

- **Nothing was built.** No code, migration, flag, credential, or public-surface edit.
- **The provenance-gap fix (option 2′), already ruled, is unaffected** — this document is entirely
  about route (i) as its OWN question, per Q3's explicit separation.
- **Route (ii) and the ADR-012 tension are not re-opened.**
- **PR19 does not engage** for a documents session; no adversarial review was run. It engages hard the
  moment this becomes a build (trust-core, the write boundary, a public attestation surface, and now
  an engine behaviour change on every `/api/reason` path — the largest blast radius of any item in
  this whole thread).
- **Concurrency:** `git status` checked before staging; commit path-scoped.

---

## Cross-references

- `2026-08-25-mentor-ruling-extraction-provenance-fix-choice-verbatim.md` — Q3, binding, the order to
  scope route (i) separately
- `2026-08-25-extraction-provenance-and-independent-extractor-SCOPE.md` — §4.4, §5, §6 (the prior
  groundwork this document builds on, not repeats)
- `2026-08-25-extraction-provenance-honesty-correction-SIGNOFF-PACKAGE.md` — item 2a, the population
  query result this document's §2 leans on
- memory `gaming-robustness-extraction-trust-locus-split` — the canonical Arm-B/A2 definition
- `operations/decision-log.md` — the standing queue entry naming this item (`D-ROW-CAP-SWEEP-...`
  session tail, 2026-09-03), the two prior verification entries this same session

*End of scope. Nothing built, nothing disclosed, no claim changed, no fix elected.*
