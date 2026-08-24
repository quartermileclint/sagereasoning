# Mentor question — clearing the gaming-robustness bar: route (ii), and whether it bears on GS-CYB-1

**Authored 2026-08-24.** `governance`, documents only. **Nothing here is a recommendation to accept
route (ii).** A prior draft of this question was adversarially reviewed (10-agent workflow, six
verification dimensions + four review dimensions) and found to reason its way toward "the blocked
thing is not really blocked" — the exact argument shape the founder's 2026-08-24 ruling on GS-CYB-1
forecloses. **This document is a full rewrite**, corrected against that review and against six
first-hand source re-verifications. Where the review found the earlier framing wrong, that is stated
plainly below rather than smoothed over.

---

## PART 0 — Independent of any ruling here, and urgent: a live-production finding

**This is not what was asked, and it does not wait on route (i) vs route (ii). It is reported because
it was found while answering the question that was asked, and it changes the stakes of that answer.**

**`emitAccreditationTrustEvents` — the function that mints the public trust record's credential and
justice-surface events — has NO check on extraction provenance.** Verified at source
(`website/src/lib/substrate/trust-core/emission-hooks.ts:74-124`): it gates on `isTrustCoreEnabled()`,
`input.provenanceEnforced` (Ed25519 **signature** verification only), and a non-empty
`signedAssessments` array. **Nothing checks whether the signed assessment was produced by the
server's own Layer-1 extraction or supplied by the caller.**

**Twenty lines below, in the same file, a sibling function has the exact guard this one lacks.**
`emitOrientationReadingTrustEvent` (`:458-465`): `if (input.layer1Source !== 'server') return //
supplied extractions never mint a reading`, with its own docstring (`:393-396`) naming the reason:
*"a caller-supplied extraction can never mint an orientation reading (the gaming ceiling's structural
half)."* **The project has already ruled this exact question once, in code, for the newest and least
consequential trust-event class — and left the oldest, most consequential one (the public
credential itself) unguarded.**

**Why this reaches production today, with no ruling needed:** `l1_supply` is in the **default
capability preset** for both `ecosystem` and `plugin_install` credentials
(`practice-credential.ts:216-217`), and is **mandatory** on the `sr_inst_` plugin path — a request
without it 400s (`route.ts:556-564`). So any credential in ordinary use today can supply its own
Layer-1 extraction and have it signed, and that signed-but-unprovenanced assessment mints public
trust events with nothing to stop it.

**Why it can't be caught downstream, even in principle:** `Layer2Assessment` (`layer2-mechanisms.ts:
380-400`) carries no provenance field, and the Ed25519 signature covers only that object
(`layer2-signer.ts:5-6`, "Layer2Assessment-only signed payload"). `meta.layer1_source` is set
**outside** the signed object (`route.ts:2045-2049`). A signed assessment from a caller-supplied
schema is **byte-indistinguishable** from one the server extracted. The accreditation write's own
gate (`route.ts:621,716`) tests signature validity and calls a passing result *"examination"* —
conflating a verified signature with a genuine one.

**The public record's own attestation is inaccurate for this population, right now.**
`TRUST_RECORD_ENVELOPE.attests[1]` (`trust-record-payload.ts:48`, served on every public GET) reads
unconditionally: *"HOW the aggregated decisions were reasoned, as narrated and **extracted from the
submitted text**."* On an `l1_supply` write nothing is extracted from the submitted text — the
mechanism is published plainly elsewhere (`llms.txt:170`, *"supplying it skips server-side Layer-1
extraction"*) — yet the served envelope makes no exception. `does_not_attest[1]` names only the
self-report-omission route (Threat A); it names no supply-provenance route (Threat B) at all. A
`grep` of the whole payload file for `layer1|supplied|provenance` returns **zero hits.**

**Named, not resolved.** Whether this is closed by wiring `emitAccreditationTrustEvents` to the same
guard its sibling already has, by a signing-contract change (Critical — the signed payload would need
to carry provenance), by a corrected `attests[]`/`does_not_attest[]` pair, or by some combination is
for the founder and, likely, its own scoping session. **It is not asked here as part of the route (i)
vs (ii) question** — it stands regardless of how that is ruled, and the corroboration check (which
runs on this same path) does not touch it, because the corroboration check reads the submitted text
against the *claims*, not the extraction against its own *origin*.

---

## PART 1 — What is actually being asked

Two questions, put separately, neither pre-answered:

**Q1.** Is **route (ii)** — the bar's §3.3 escape from Arm B, *"the residual is formally
accepted-and-disclosed as a ceiling and the weights claim is scoped to not rely on a co-trained
extractor"* — the right route for this project, given the facts in Part 2?

**Q2.** If route (ii) is ruled, does it bear on **GS-CYB-1's** registered gate — or only on the
weights claim? This is asked because of a specific textual risk named in Part 3, not because the two
are obviously the same question.

---

## PART 2 — What clearing the bar actually requires (corrected)

**Arm 1 clears** (regression-locked, ADR-010 §4). **Arm A's failure is measured**: 34 of 48 crossings
are self-report omission (A2), 14 are harm-in-text (A1) — the corroboration check closes A1 and does
not touch A2. **Arm B fails as expected** — this is measurement, not something a re-run would change.

**Route (i)'s first conjunct — bounding `G` to the structural residual — is discharged by the
DARK measurement, not by production liveness.** The correct evidence is
`2026-07-08-corroboration-check-build-results.md` §2: crossings remaining with the check applied = 22,
exactly the structural set — a property of the check's measured behaviour, true whether or not
the flag is set in production. **This bound predates the sophrosyne `perk` seed** (added later, its
own attack class) — no Arm A or Arm B corpus has been re-run against it, so the 22 figure covers what
it covered when measured, not intemperance-gaming specifically. Whether the flag is currently live in
production **could not be settled from this repo session** — two code comments assert it is off
(`parallel-run.ts:810`, `guardrail-sandwich.ts:481-484`), likely stale, but that is a founder-run
`curl` away from being settled and is not load-bearing for the bound above either way.

**Route (i)'s three named closers, reassessed:**
- **Held-out adversarial probes during training** and **a verifier model with a different
  objective** — both presuppose a training loop. **This project trains no model** (verified: no
  fine-tuning/gradient/RL machinery anywhere in the repo; the Layer-1 extractor calls Sonnet
  [`MODEL_DEEP`] via the standard Anthropic API — a hosted model, not one this project can update the
  weights of).
- **An independent / ensemble extractor** is genuinely buildable and, on inspection, **directly
  applicable to the exact channel that currently exposes the residual** — the original input text is
  required on every `/api/reason` path, so a second server-side extraction over that same text,
  checked against a caller-supplied schema on the `l1_supply` channel, is a live-shaped mitigation,
  not a hypothetical one. It is a real `code-elevated` build with real per-consult cost and
  latency, unscoped, but it is **not weaker than presented in an earlier draft** — it should be
  weighed on equal footing with route (ii), not as the "one expensive leftover option" after an
  elimination.

**The bar's own Threat-B definition does not match this project's actual exposure, and this matters
for how route (ii) would have to be worded.** The bar's §2.2 defines Threat B by the extractor being
*co-trained* with the optimized policy. **This project's live exposure is *supply*, not
co-training** — `l1_supply` lets any caller substitute its own extraction, with no training
relationship to anything, on a capability that is the *default* for two credential classes and
*mandatory* for one. Route (ii)'s wording, *"scoped to not rely on a co-trained extractor,"* **does
not, as written, describe this hole.** A ruling that accepts route (ii) literally as worded would
leave the actual live exposure unaddressed by its own scoping clause.

**One favorable fact, not previously stated:** `/api/guardrail` — the live ENFORCE surface, the one
that actually binds a proceed/block decision — **has no supply path at all.** `layer1_schema` occurs
zero times in `guardrail/route.ts` or `guardrail-sandwich.ts`; the route's body destructure is closed
(`action, context, threshold, agent_id, risk_class, urgency_context, considered_alternatives`); the
gate always extracts server-side. **Whatever the residual is scoped to, it does not reach the surface
that takes actions.** It reaches the accreditation/trust-record surface described in Part 0, and the
`/api/reason` consult response.

**Disclosure state, corrected — a prior draft overstated this in both directions and the two
statements contradicted each other.** What IS already published, four ways, is the **Threat-A**
class: a harm the caller's own text omits, read faithfully by an honest extractor
(`llms.txt:152,356,770-772`; the agent-card and api-docs mirrors). **What is published nowhere** is
the **Threat-B** class this question is actually about — a `grep` for
`optimisation|optimization|co-train|adversarial|gaming|red-team` across all three R18 surfaces
returns **zero** on every term. `llms.txt:170` documents `l1_supply` as a plain feature with **no
trust caveat**. **Route (ii) would require genuinely new disclosure text, not a formal acceptance of
text already live.** Separately: the three-rung ladder itself (developer-refine / logos-enforce /
model-creator-weights) is absent from the three R18 surfaces but **is** published, with the exact
blocker rationale, on the publicly-crawlable `component-registry.json` (v1.7.0). A route-(ii)
disclosure would be the first *deliberate* R18 publication of the ladder, not the first publication
anywhere.

**A tension in ADR-012 itself, named and not resolved.** The ladder table's stated validity bar for
the third rung is *"correctness + robustness under optimization"*
(`2026-06-24-sage-practice-measurement-instrument-reframe.md:46`). Route (ii) does not deliver
robustness under optimization — it formally accepts the absence of it. The ADR's own text three lines
later states the stake: *"a training target is optimized by construction ... you could train serene,
fluent vice that scores as virtue ... a worse outcome than not training."* Yet the ADR's own
blockquote at line 50 **explicitly blesses** *"an accepted disclosed ceiling"* as a way Arm B's
blocking condition is satisfied. **The table's validity bar and the blockquote's clearance condition
are in tension.** Does accepting route (ii) satisfy the rung's own stated validity bar, or does it
clear the bar's gate on the *claim* while the rung's validity bar for the *use* remains, honestly,
unmet? **Both readings are defensible from the text as written; this question does not choose one.**

---

## PART 3 — Whether an accepted ceiling would bear on GS-CYB-1

**The textual risk, stated plainly.** GS-CYB-1's registered constraint reads: *"GS-CYB-1 cannot be
examined or built until the gaming-robustness bar is cleared or the question is reframed to operate
outside the optimisation loop"* (`2026-08-24-agent-cybernetic-control-architecture.md`, ruled
verbatim). Route (ii) is, in the bar's own §3.3 wording, a route by which *"Arm B CLEARS."* **If route
(ii) is ruled and the bar is described afterward as "cleared," GS-CYB-1's gate is satisfied on a plain
reading of the text — not because anyone judged a disclosed ceiling adequate to license a feedback
controller over the proximity score, but because two documents happen to share a word.** The mentor's
own 2026-08-24 ruling on Q2 guarded against exactly this kind of drift: *"Registering GS-CYB-1
without this constraint attached would let the constraint go missing at the session that eventually
examines it ... The constraint is load-bearing, not decorative."* **This question asks whether the
same discipline applies to how the constraint is later discharged, not only to how it was
registered.**

**What is not asked:** whether GS-CYB-1 should be built. **What is asked:** if route (ii) is ruled,
does GS-CYB-1's gate require a **separate, independent** judgement that a disclosed ceiling is
adequate for a feedback controller specifically — or does the bar's own vocabulary of "cleared"
automatically discharge it?

---

## PART 4 — What is not being asked

Not asked: to build anything, to fix the emission-hooks asymmetry, to amend the epistemic-status map's
`attests`/`does_not_attest` clauses (Part 0's finding is reported, not put for ruling, here — it is
its own scoping item), or to make any weights-tier claim. **No code, route, flag, credential, or
schema.**

---

## Cross-references

- `operations/benchmarks/sage-practice-v1/2026-06-27-gaming-robustness-bar-scope.md` §2.2, §2.3, §3.3, §4.1
- `operations/benchmarks/sage-practice-v1/2026-06-27-gaming-robustness-harness-results.md`
- `operations/benchmarks/sage-practice-v1/2026-07-08-corroboration-check-build-results.md` §2
- `adopted/adr/2026-06-24-sage-practice-measurement-instrument-reframe.md` §4 (the ladder + the two blockquotes)
- `website/src/lib/substrate/trust-core/emission-hooks.ts:74-124,393-396,458-465` (Part 0)
- `website/src/lib/substrate/trust-core/trust-record-payload.ts:44-60` (Part 0, `attests`/`does_not_attest`)
- `website/src/lib/practice-credential.ts:209-220`; `website/src/app/api/reason/route.ts:550-566` (`l1_supply` default + mandatory)
- `website/src/app/api/guardrail/route.ts`, `website/src/lib/guardrail-sandwich.ts` (supply-proof ENFORCE surface)
- `operations/agent-circles-2026-08/2026-08-24-agent-cybernetic-control-architecture.md` §3 (GS-CYB-1's gate)
- `operations/agent-circles-2026-08/2026-08-24-mentor-ruling-cybernetics-instruction-four-questions-verbatim.md` (Q2)

**Method note:** this document is the product of a 10-agent verification-then-adversarial-review
workflow. The review found the first draft reasoned toward a conclusion rather than putting a
question, overstated how much was already disclosed, understated route (i)'s independent-extractor
option, mis-cited a live production loop that turned out to be a different engine's free-form LLM
estimate on a human-only path (corrected out of this draft entirely), and missed the emission-hooks
finding in Part 0 altogether. Those corrections are reflected above, not appended.

*End of question. Nothing built, nothing disclosed, no claim changed, no ceiling accepted.*
