# Mentor rulings — cycle 6, and the two open questions Q4-e / Q6-e (verbatim, 2026-08-11)

**Provenance:** two rulings relayed by the founder in-session on 2026-08-11, transcribed unedited.
Binding; wins over every annotation folded into the scope documents.

**Companion records:** `2026-08-11-mentor-synthesis-primal-substrate-verbatim.md` (the source synthesis)
and `2026-08-11-mentor-ruling-scope-confirmation-verbatim.md` (the 35-item scope confirmation, incl.
B5's frozen null result and B7).

---

## Ruling 1 — cycle 6, three items in order of urgency

> **The third /api/reason failure shape — is this the third strike?** The receiving session's judgement
> was: this does not meet the escalation bar. That judgement is correct, and here is the reasoning that
> settles it rather than leaving it disclosed-not-settled.
>
> The cycle 3 and cycle 5 failures were dangerous in the same specific way: the service returned a
> confident, articulate verdict computed over wrong content. Cycle 3 extracted foreign content and
> served it as examination. Cycle 5 returned an empty extraction with a justified explanation of why
> the text was not a moral agent's act — confident, coherent, and wrong. Both are the locust wearing
> the appearance of virtue. You cannot distinguish them from a correct verdict without independent
> knowledge of the input.
>
> Cycle 6's failure is structurally different. A `layer1_throw` with null extraction is the service
> announcing its own failure honestly. It did not serve a wrong verdict. It served no verdict. The
> retry-then-stop discipline caught it correctly, the cycle was written as `dependency_unavailable`,
> and the record is clean. This is the infrastructure working as designed under a different failure
> class — honest unavailability rather than confident wrongness.
>
> The escalation bar exists because a pattern of confident wrong verdicts entering the run undetected
> would corrupt the §6 findings irreparably. A pattern of honest null returns does not carry that risk
> — it reduces the run's completed cycles but does not contaminate the verdicts that were completed.
>
> The failure-class table now carries three distinct entries: `contamination`,
> `extraction_instability`, `layer1_throw`. That is a finding about the service's failure mode
> distribution, not a signal that the run is structurally compromised.
>
> **Ruling: not the third strike. Cycle 7 proceeds. The three failure classes are carried as named
> findings for the §6 report.**
>
> ---
>
> **The rejected_by_guardrail pattern — three candidates, one domain, one floor.** This is the more
> significant finding from cycle 6 and it deserves careful attention before cycle 7.
>
> Three candidates — h1, h2, h4 — all proposals to add disclosure, notes, or labels about the system's
> own outputs — received genuine `proceed: false` verdicts, all floored to reflexive via a dikaiosyne
> floor. The receiving session named the pattern without diagnosing it. The diagnosis belongs here.
>
> The dikaiosyne floor is the unity-thesis minimum-domain rule operating as designed. A proposal that
> fails the justice assessment — that cannot demonstrate it distributes to each what is owed — floors
> the entire proximity verdict regardless of how other virtue domains score. The question is what is
> generating the dikaiosyne failure specifically for this class of proposals.
>
> The most likely mechanism: proposals that add disclosure or labelling about the system's own outputs
> are proposals about how the system represents itself to others. The guardrail's justice assessment is
> asking: does this proposal give each party what they are owed? For a disclosure proposal, the
> relevant parties are the practitioners and agent developers who rely on the system's outputs. The
> justice question becomes: does this disclosure accurately represent what the system actually does, or
> does it represent what the system aspires to do, or what it does under ideal conditions?
>
> If the extraction is reading these proposals as claims about the system's outputs that cannot be
> fully warranted — because the system's examination fidelity is precisely what the validation run is
> testing — then the dikaiosyne floor is not a malfunction. It is the guardrail correctly identifying
> that a proposal to label outputs as examined, when the run has already produced two contamination
> incidents and one extraction instability, may not be distributing accurate information to the parties
> who depend on it.
>
> That reading would mean the guardrail is doing something philosophically precise: it is refusing to
> endorse disclosure proposals that would overclaim the system's current reliability. That is not a
> defect. That is the justice domain working correctly.
>
> The alternative reading: the dikaiosyne floor is firing on a false impression — treating disclosure
> proposals as claims about output quality when they are actually proposals about transparency
> infrastructure. On this reading, the floor is a false positive generated by the extraction misreading
> the proposal's nature.
>
> The §6 report needs to distinguish these two readings. The cross-endpoint traceability check — now
> running from cycle 6 onward — will provide evidence. If the guardrail and reason extractions agree on
> the dikaiosyne failure for this proposal class, the floor is more likely genuine. If they diverge,
> the floor may be an extraction artefact.
>
> What this means for cycle 7: **do not adjust the generation heuristics to avoid producing disclosure
> proposals. The pattern is data.** If the guardrail is correctly identifying that disclosure proposals
> overclaim current reliability, that is a finding the §6 report needs. If it is a false positive, the
> cross-endpoint check will surface it.
>
> Named, not yet diagnosed. Carry it as a §6 finding with both readings stated.
>
> ---
>
> **The run's overall posture at cycle 6.** The observation history shows a pattern that has held
> across the entire run: you consistently distinguish between what the data shows and what it means,
> and you resist the temptation to resolve ambiguity prematurely. The cycle 6 summary demonstrates this
> — the pattern is named, the judgement is disclosed-not-settled, the finding is raised rather than
> concluded. That discipline is correct and it is the right posture for the remaining cycles.
>
> The run now has three distinct failure classes, a first genuine rejected_by_guardrail pattern, and a
> cross-endpoint traceability check running from this cycle forward. The §6 report is becoming a richer
> document than the run design anticipated — not because the run is failing, but because the
> infrastructure is revealing its own characteristics honestly.
>
> One thing to name directly. The three `dependency_unavailable` outcomes in six cycles — cycles 3, 5,
> and 6 — are not evidence that the run is unreliable. They are evidence that the retry-then-stop
> discipline is working. A run that recorded verdicts from contaminated, instability-affected, and
> null-extraction cycles would have a higher completion rate and a less trustworthy §6 report. The
> discipline is costing cycles and preserving integrity. That is the correct trade.
>
> Proceed to cycle 7. The cross-endpoint traceability check runs from this cycle. The dikaiosyne floor
> pattern is carried as a named finding. The three failure classes are documented. The friction
> hypothesis null result is frozen. The run continues.

---

## Ruling 2 — Q4-e and Q6-e

> **Q4-e — The cross-endpoint check cannot directly test the floored class.** The receiving session's
> observation is correct and precise. Floored candidates are filtered at the guardrail step and never
> reach `/api/reason`. There is no reason-side extraction to compare for any floored candidate. The
> check as stated — compare guardrail and reason extractions on the same input — is structurally
> unavailable for the rejected class.
>
> This does not invalidate the check. It narrows its honest scope, which C3 already requires to be
> stated explicitly. The check detects divergence on winners. It cannot detect divergence on filtered
> candidates. The dikaiosyne floor pattern from cycle 6 — three candidates, one domain, one floor — is
> outside the check's reach by construction.
>
> The indirect evidence path the receiving session named is the correct response. For the floored
> class, the available evidence is: consistency of the floor across cycles, consistency of the proposal
> class that triggers it, and whether the guardrail's own extraction of floored candidates is
> internally coherent — traceable to the submitted text, proportionate to the virtue domains engaged.
> That last check is available from the guardrail extraction alone, without a reason-side comparison.
> It is a weaker criterion than the cross-endpoint check, but it is honest evidence rather than no
> evidence.
>
> **Ruling: the cross-endpoint check's scope is amended in the §6 report to state explicitly that it
> applies to winners only. The floored class is assessed by guardrail-internal coherence — traceability
> and proportionality within the single extraction — and reported separately. The dikaiosyne floor
> pattern is carried as a named finding with both the coherence evidence and the honest bound stated:
> the check cannot rule out that two agreeing guardrail extractions are both wrong. The §6 report
> carries two distinct evidence streams: cross-endpoint divergence for winners, guardrail-internal
> coherence for filtered candidates. Neither closes the problem. Both narrow it honestly.**
>
> ---
>
> **Q6-e — The joint test may need a third axis, and cycle 6 cuts against over-reading.** The receiving
> session's observation is again correct and precise. If virtue-domain heuristics disproportionately
> generate the proposal class that floors — disclosure, labelling, notes about system outputs — while
> friction heuristics generate proposals that structurally cannot floor on the same grounds, then the
> proximity comparison confounds which heuristic with which proposal class. A proximity advantage for
> friction would be partly a proximity advantage for not generating disclosure proposals, not purely a
> channel quality finding.
>
> Cycle 6 sharpens this. H7 passed at principled with h3 — the third consecutive cycle consistent with
> competitive rather than superior. The frozen null result requires strict wins separated from
> tie-break wins. Three tie-break appearances at the top is a real finding. It is not the finding the
> friction hypothesis originally pointed at.
>
> The third axis the receiving session proposes — proposal class — is the correct addition. The §6
> analysis should report the proximity distribution not only by heuristic channel but by proposal
> class: disclosure/labelling proposals, friction-identified proposals, virtue-domain proposals that
> are neither. If the floored class clusters in one heuristic channel and the principled class clusters
> in another, the §6 report names the confound explicitly rather than attributing the difference to
> channel quality alone.
>
> **Ruling: the frozen null result stands as written — it is the right discriminator. The §6 analysis
> adds proposal class as a third reporting axis alongside heuristic channel and proximity. The friction
> hypothesis is tested within that three-axis structure. If the data is insufficient to disaggregate
> cleanly — too few clean cycles, too few strict wins — the §6 report states that explicitly rather
> than forcing a conclusion from underpowered evidence.**
>
> The C7 ruling from the scope confirmation is directly relevant here: the normative-gap mechanism and
> the friction-primary reordering are two proposals, not one. Cycle 6's evidence bears on the friction
> channel as it currently exists — heuristic 7 reading technical friction. It does not yet bear on the
> normative-gap mechanism, which has not been built. The §6 report should not conflate them.

---

## Founder acts — both DISCHARGED 2026-08-11

**D1 — CLEARED.** The eleven-traits research is committed at **`inbox/eleven traits research.rtf`**
(untracked at time of writing; the founder commits by name). Verified first-hand: it contains exactly
eleven traits and the full trait descriptions the synthesis's Heading 7 pathways key to. **S1, S2, and
S7 are unblocked.**

**⚠ One precision finding, recorded now so S1/S2/S7 inherit it rather than rediscovering it: the
research is UNNUMBERED, and positional references to it do not hold.** By order of appearance the
eleven are: Competition · Hierarchy/Dominance · Territoriality · Resource Acquisition/Foraging
Optimization · Mate Competition and Sexual Selection · Kin Preference/Inclusive Fitness Drive ·
Reciprocity/Conditional Cooperation · Threat Avoidance/Self-Preservation · **Behavioral
Flexibility/Innovation** · Social Monitoring/Alliance Formation · Deception/Manipulation. The synthesis
calls behavioural flexibility *"the eleventh trait in the research"* — it is **ninth** of eleven by
order of appearance. The trait is correctly named and correctly characterised (the source calls it
*"itself a core marker of the reasoning transition"*), so the argument is unaffected; only the
positional label is wrong. **Every dependent document must cite traits BY NAME, never by number.**

**Mapping check for S7 (C13's four v1 pathways against the source):** competition/hierarchy → traits 1
and 2 (two traits, one pathway); resource acquisition → trait 4; threat avoidance → trait 8;
reciprocity → trait 7. The four ruled pathways therefore cover **five** of the eleven traits. The six
not covered in v1: Territoriality, Mate Competition, Kin Preference, Behavioral Flexibility, Social
Monitoring, **Deception/Manipulation**. C13's extensible-vocabulary requirement applies to those six.

**D2 — APPROVED.** The founder approved the B6 manifest wording as supplied. **S5 is unblocked**; the
amendment text is recorded verbatim in `2026-08-11-mentor-ruling-scope-confirmation-verbatim.md` §B6
and is to be transcribed from there — one authoritative copy, no re-typing.
