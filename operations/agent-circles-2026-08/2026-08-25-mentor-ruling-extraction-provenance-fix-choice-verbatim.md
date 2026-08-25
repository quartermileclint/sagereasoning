# Mentor ruling — the extraction-provenance fix choice (verbatim)

**Relayed by the founder 2026-08-25** (pasted directly in-session), answering
`2026-08-25-MENTOR-QUESTION-extraction-provenance-fix-choice.md`.

**Status: ADOPTED AS BINDING on the founder's relay. Verbatim wins over any paraphrase, here or
elsewhere.** The founder separately approved the scoping session's recommendation, which the ruling
then confirmed on all four questions.

**Binds (headline; the verbatim below governs):**

1. **Q2 — RULED: the honesty correction is owed NOW**, ahead of and independent of any structural
   fix, because *"no structural option repairs already-minted events"* and the gap is a live
   condition. **Two edits, honest at every instant**, is the correct shape. **The first correction's
   wording MUST NOT anticipate the fix** — the mentor supplies its substance verbatim (§Q2 below).
   Applied to **all three published surfaces**; **requires founder sign-off** as a served public
   claim; **does not require** the Q1 ruling. The decisive reason is the scoping's item 7: *"A reader
   following that pointer in good faith today receives a false assurance... it actively misdirects
   rather than merely failing to inform."*
2. **Q1 — RULED: option (a), the signature-keyed provenance ledger**, is the right structural fix to
   scope first. It closes the mint-time gap without changing the signing contract, without changing
   any wire shape, and *"without the risk of silently recreating the exposure beneath a
   corrected-sounding claim."* Its limits (retention window, empty start, flag-dependent coverage)
   are *"honest and bounded"* and **not worse than the current state for the population they leave
   uncovered — the current state has no coverage at all.** Option (b) and the hybrid **remain
   available if (a)'s limits prove unacceptable after scoping.** The join-back option is *"provenance
   theatre"* and is correctly off the table.
3. **Q3 — RULED: NO — route (i) must NOT be decided as a provenance fix.** It is scoped **separately,
   as its own question**: *"what is caller-supplied extraction for?"*, with the disagreement policy,
   the plugin-path consequences, and the Arm-B relationship all named as inputs. **This qualifies the
   2026-08-24 governance observation** that the two are one architectural intervention: *"sharing a
   channel does not mean they should be resolved in the same session if the questions they raise are
   different in kind."* The joint SCOPING was correct and has been done; the BUILDS separate here.
4. **Q4 — RULED, three policies, all part of option (a)'s scoping and not prerequisites to choosing
   it:** (i) **an artifact with no ledger entry ⇒ REFUSE the mint** (minting anyway is *"a
   corrected-sounding claim with a silent carve-out"*); (ii) **insert-once, never upsert** (*"Insert-once
   is a limit on correction, not a vulnerability. Upsert is a vulnerability."*); (iii) **~~the ledger is
   CREDENTIAL-SCOPED~~ — AMENDED SAME DAY, see the addendum: the ledger is scoped to the OWNER+AGENT
   PAIR with a credential-only fallback.** The original bare-credential form was *"corrected"* on F-1;
   the principle it rested on (do not introduce an unbounded cross-credential lookup) is preserved.

**Licenses no code.** No build, route, flag, credential, or schema. Every step remains its own
founder-walked 0c-ii.

> **⚠ BIND 4(iii) WAS AMENDED THE SAME DAY. F-1 was raised on folding, relayed, and RULED: the
> bare-credential form is *"corrected"* to the OWNER+AGENT PAIR with a credential-only fallback.
> Two further rulings arrived with it (F-2, F-3). See the ADDENDUM below the first END VERBATIM —
> it is part of the binding record, not commentary.**

---

## VERBATIM

### Q2 — Is the honesty correction owed now, ahead of and independent of any structural fix?

Yes. The correction is owed now.

The document's own analysis establishes the reason precisely: no structural option repairs already-minted events. The record aggregates events minted under the gap, and nothing persists a signature to re-derive them from. The correction is therefore owed under every branch — not as a consequence of choosing a fix, but as a consequence of the gap being a live condition. The 2026-08-24 ruling named it a live condition, not a future risk. That characterisation stands.

The tension the document names — correct now and re-correct later versus correct once alongside the fix — resolves in favour of correcting now. The reason is item 7: the record currently points readers at a disclosure that is not there. A published note tells readers the signature does not attest the extraction's truth and directs them to the disclaimer list for the canonical condition. The list carries nothing on the supply-provenance axis. The defect is not a plain omission — it is a pointer that resolves to nothing. A reader following that pointer in good faith today receives a false assurance. That is a more serious condition than an inaccurate attestation standing alone, because it actively misdirects rather than merely failing to inform.

Two edits to a served public claim — honest at every instant — is the correct shape. The first edit corrects the current inaccuracy without overstating what any future fix will deliver. The second edit, when a fix is chosen and built, updates the wording to reflect the fix's actual coverage. Each edit is honest at the time it is made. The alternative — leaving the inaccuracy while the fix is scoped and built — leaves a pointer resolving to nothing for an indeterminate period after the gap has been named and confirmed.

**The wording of the first correction must not anticipate the fix.** It should say, in substance: the served attestation that decisions were reasoned as narrated and extracted from the submitted text does not hold for consults where the caller supplied the extraction rather than the server producing it. On those consults, the extraction's origin is not verified at the point where trust events are minted. The disclaimer list will be updated when a structural fix is in place.

The correction should be applied to all three published surfaces where the inaccurate sentence appears. It requires founder sign-off as a served public claim. It does not require a ruling on which structural fix to choose.

---

### Q1 — Which structural fix?

The join-back option is correctly ruled off the table by items 3 and 4. The defeat by request header is not a theoretical weakness — it is a documented behaviour of the system as designed. A check built on a key the caller sets is not a provenance check; it is a provenance theatre. The document is right to remove it from consideration.

The genuine fork is between option (a) — signature-keyed provenance ledger — and option (b) — provenance inside the signed payload — with a hybrid variant that removes the collision property at option (b)'s cost.

**On option (a):** the ledger's real limits are correctly named. Coverage is bounded by retention. The ledger starts empty, so nothing historical is covered. Coverage depends on the consult-side write firing, which interacts with the unverified flag states. The collision property named in item 5a is real but the document correctly identifies that it does not reproduce the defeat from item 4 — a collision requires identical content, and identical content means the caller gained nothing from supplying their own extraction. The ledger's write semantics are a genuine choice (Q4 below), but the option is structurally sound within its stated limits.

**On option (b):** the document correctly distinguishes between the precedent of adding optional fields to the signed object and the stakes of adding a provenance field specifically. Each prior addition is an evaluative enrichment whose absence makes an assessment less informative. A provenance field is the attestation. Mis-set under one of the unverified flag combinations, it silently recreates the exposure beneath a corrected-sounding public claim. The document notes this failure has already happened once in the structurally analogous existing provenance stamp. That precedent is load-bearing. Option (b)'s engineering cost is lower than previously presented, but the risk profile is higher than any prior addition to the signed object, and the two should not be conflated.

**The hybrid variant** — a fresh server-random per-consult id in the signed payload, keyed on instead of the signature — removes the collision property at option (b)'s cost. It is cleaner semantically but inherits option (b)'s risk profile on the provenance field.

**The ruling on Q1:** option (a) — the signature-keyed provenance ledger — is the right structural fix to scope first. It closes the mint-time gap without changing the signing contract, without changing any wire shape, and without the risk of silently recreating the exposure beneath a corrected-sounding claim. Its limits are honest and bounded: retention window, empty start, flag-dependent coverage. Those limits are disclosable and are not worse than the current state for the population they leave uncovered — the current state has no coverage at all.

Option (b) and the hybrid remain available if option (a)'s limits prove unacceptable after scoping, but option (a) should be scoped first and its limits disclosed alongside the structural fix when it ships.

The four Q4 policy choices are part of option (a)'s scoping, not prerequisites to choosing it. They are named below.

---

### Q3 — Should route (i) be decided as a provenance fix at all?

No. Route (i) should be scoped separately as its own question.

The document's framing is correct: route (i)'s measured cost removes the supplied path's entire purpose, and it decides that capability's fate — including on the plugin path where it is mandatory — as a side effect rather than as a decision. The disagreement policy is unruled and is itself a gaming and over-strictness surface. Reject-on-disagreement re-opens the over-strictness direction a prior correction closed. Take-the-stricter is safe but biased. Take-the-server's makes the supplied extraction decorative. The policy is the design, and it is unruled.

These are not implementation details. They are the substantive questions that determine what route (i) actually is. Scoping route (i) as a provenance fix without ruling the disagreement policy would produce a build whose central design question is deferred to the build itself — the same failure mode the project's governance discipline has consistently prevented.

Route (i) remains the only option addressing the Arm-B threat directly. That is a genuine and important fact. But it argues for scoping it properly, not for building it now as a side effect of the provenance gap.

The right framing is the one the document proposes: what is caller-supplied extraction for? That question should be scoped as its own session, with the disagreement policy, the plugin path consequences, and the Arm-B relationship all named as inputs.

The emission-hooks finding and route (i) share the same channel — the 2026-08-24 ruling noted they are the same architectural intervention applied to the same channel — but sharing a channel does not mean they should be resolved in the same session if the questions they raise are different in kind. The provenance gap has a bounded structural fix available now. Route (i)'s questions are larger and require their own scoping.

---

### Q4 — The two policy choices if a ledger is chosen

**First policy choice — what to do when an artifact has no ledger entry.** The honest answer is to refuse the mint.

Minting anyway preserves today's behaviour, which is the behaviour the correction is being made to address. A ledger that mints on missing entries is a ledger that leaves the gap open for the population it cannot cover, while the corrected public claim implies the gap is closed. That is a worse state than the current one — it is a corrected-sounding claim with a silent carve-out.

The refusal option is honest: it says the system cannot attest provenance for this artifact and therefore will not mint the event. The consequence — legitimate historical and out-of-window writes are refused — is a real cost, and it should be disclosed as a limit of the fix. But it is the honest cost of a fix that starts empty and has a retention window. The alternative is to accept that the fix does not cover those cases and say so plainly, rather than minting events the fix cannot actually verify.

**Second policy choice — insert-once or upsert.** Insert-once.

The document correctly identifies that upsert sounds safer but is the more dangerous of the two: a later supplied replay can overwrite a genuine server entry, which is precisely the attack the ledger is designed to prevent. Insert-once means a genuine server consult cannot correct an earlier supplied entry — that is a real limit, and it should be disclosed. But it is a limit on correction, not a vulnerability. Upsert is a vulnerability.

The ledger's purpose is to record the first provenance event for a given signature, not to track the most recent one. First-write-wins is the correct semantics for a provenance record.

**Cross-credential lookup.** The document correctly names that a signature-keyed ledger can cross credentials — a departure from the credential-scoping posture used everywhere else. This should be ruled rather than assumed.

The ruling: the ledger should be credential-scoped. A signature produced under one credential's consult should not be resolvable from another credential's accreditation write. The cross-credential property is a surface that did not exist before the ledger and should not be introduced as a side effect of the fix. If a signature appears in an accreditation write from a different credential than the one that produced the consult, the mint should be refused on that basis, not resolved by looking up the signature across credentials.

## END VERBATIM

---

## Finding F-1 — a consequence of bind 4(iii) the ruling could not see (raised 2026-08-25, on folding)

> **RULED 2026-08-25 — the bare-credential bind is CORRECTED to the owner+agent pair with a
> credential-only fallback. See the ADDENDUM. This section is retained as the record of how the
> finding was raised and what it rested on; the ruling supersedes its "Requested" line.**

**Not a challenge to the ruling's principle, which is sound.** Recorded because PR20 exists to make
downstream consequences visible before they are discovered by a build, and because **the scoping
question failed to surface this** — it named the cross-credential point as a *privacy/posture*
departure and did not state what a literal credential scoping would do to live configurations.

**Verified first-hand 2026-08-25:**

1. **The project's own standing reference harness uses TWO credentials, not one.** The S9 dogfood
   install runs on *"two fresh standing credentials sharing one loop identity
   `sagereasoning:s9-loop@v1`"* — a **consult** credential that produces the signed assessments and a
   separate **accreditation-write** credential that submits them
   (`D-TRUST-LAYER-S9-DOGFOOD-INSTALL-LIVE`, 2026-07-11). The AE-2 record states plainly that
   *"the s9-loop accred cred lacks `consult`"* (2026-07-19).
2. **So under a literal bare-credential scoping, every mint from the project's own reference
   integration would be refused** — the signature is always produced under a different credential
   from the one writing it. This is the intended, documented configuration, not a misconfiguration.
3. **Credential rotation has the same effect, and has already happened.** The s9-loop credentials
   were revoked and replaced (gen-1 → gen-2) after the 2026-07-17 public-exposure incident. Signed
   assessments produced under gen-1 would be unresolvable under gen-2 and would be refused.
4. **A narrower-than-cross-credential unit already exists in this codebase.**
   `website/src/lib/substrate/longitudinal-identity.ts` computes exactly this: `owner_agent_pair`
   when both are known, falling back to `credential` when they are not — and it already carries the
   disclosure that *"a credential rotation truncates the window"* when only the credential is
   available. The 6e §A invariant guarantees owner+agent binding for write-class capabilities, and
   the loop-fold's live `identity.kind: "owner_agent_pair"` is the same unit.

**Why this is a question about the UNIT, not the principle.** The mentor's stated reason for the
ruling is that *"the cross-credential property is a surface that did not exist before the ledger and
should not be introduced as a side effect of the fix."* Scoping to the **owner+agent pair** does not
introduce that surface: it does **not** let an arbitrary credential resolve another's signatures. It
lets the *same owner's same declared agent* resolve its own, across a legitimate consult/write split
and across a rotation. It is strictly narrower than an unbounded cross-credential lookup and strictly
wider than a bare credential.

**Requested (and RULED the same day — see the ADDENDUM):** a short follow-up ruling on the scoping
unit only — bare credential (as ruled, which refuses the project's own harness), or the owner+agent
pair with a credential-only fallback (which preserves the ruling's stated purpose). **Everything else
in the ruling is unaffected**, and this did not block the Q2 honesty correction.

---

## Cross-references

- `2026-08-25-MENTOR-QUESTION-extraction-provenance-fix-choice.md` — the question this answers
- `2026-08-25-extraction-provenance-and-independent-extractor-SCOPE.md` — the scoping it rules on
- `2026-08-24-mentor-ruling-gaming-robustness-bar-route-ii-verbatim.md` — the prior ruling; its
  "scope them in the same session" observation is qualified by Q3 here (scoping joint, builds separate)
- `operations/primal-substrate-2026-08/00-PRIORITY-INDEX.md` — the ⚠ URGENT registration
- `website/src/lib/substrate/longitudinal-identity.ts` — the owner+agent identity unit F-1 names

---

# ADDENDUM — F-1 / F-2 / F-3 ruled (verbatim), same day

**Relayed by the founder 2026-08-25**, answering the three follow-up questions raised on folding the
ruling above. **ADOPTED AS BINDING. Verbatim wins.** Part of the binding record, not commentary.

**Binds (headline; the verbatim below governs):**

1. **F-1 — THE Q4(iii) BIND IS CORRECTED.** *"The bare-credential ruling is corrected."* The ledger is
   scoped to the **owner+agent pair, with a credential-only fallback.** The mentor accepted the
   finding as *"precise and… not visible at ruling time"* and named the rotation incident as
   compounding it: bare-credential scoping *"would have truncated the trust record at that point."*
   **No new disclosure is required** — the existing rotation-truncation disclosure already covers the
   fallback's honest limit. **Nothing else in Q4 is affected.**
2. **F-2 — RULED: a refused mint MUST surface as a NAMED COVERAGE GAP**, on the existing
   `coverage_gaps` surface, never as silence. *"Honest refusal and absence look identical to the
   reader the public record is written for. That is a fidelity failure, not a cosmetic one."*
   **Minimum content:** that no trust event was minted for the cycle; that the reason is a missing or
   out-of-window provenance-ledger entry; and **that this does not indicate the agent did not
   practise** — only that the instrument could not verify the extraction's origin. **Hard exclusion:**
   the entry must **NOT** carry the signature or any artifact detail *"that would expose the
   provenance mechanism to gaming."* Named consequence, accepted: the refusal becomes *"not silent
   governance — it is a disclosed limit that appears on the public record every time it fires,"* at a
   higher operational cost than silence — *"That cost is the right cost."*
   **⚠ This changes the FIRST edit's scope: the coverage-gap behaviour belongs in edit one, *"not
   deferred to the second."*** (See the drafting constraint recorded at §F-2-DRAFT below — it is not
   a challenge to this bind.)
3. **F-3 — NOT ruled; worked in option (a)'s scoping.** *"Escalate only if the tension proves
   unresolvable in scoping."* **Three things must travel into that scoping document, named and not
   pre-answered:** (i) the refuse-on-missing ↔ PA-10 coupling, *"named explicitly… not discovered
   mid-build,"* carried as a **named dependency** — whether the ledger's incidental narrowing of
   PA-10 changes the standing of the scheduled recency-tier closure work; (ii) the window-length
   tension resolves **from data** — *"the actual distribution of historical writes and the actual
   PA-10 exposure window"* — *"not from general principles,"* using data *"the scoping session has
   access to and this ruling does not"*; (iii) **F-2 changes the cost calculus** — with every refused
   mint publicly visible, window length *"is also a decision about how frequently the public record
   will carry coverage gap entries,"* and that framing must be carried explicitly.

**Licenses no code.**

---

## VERBATIM (addendum)

### F-1 — The credential-scoping unit

The bare-credential ruling is corrected. The owner+agent pair with a credential-only fallback is the right scoping unit.

The finding that defeats the bare-credential ruling is precise and was not visible at ruling time: the project's own standing reference harness runs two credentials by design — a consult credential that produces the signed assessments and a separate accreditation-write credential that submits them. A bare-credential scoping refuses every mint from the project's own dogfood. That is not a misconfiguration to be corrected — it is the documented intended configuration.

The credential-rotation incident compounds this: rotation has already happened once after a credential-exposure incident, and bare-credential scoping would have truncated the trust record at that point.

The owner+agent pair with a credential-only fallback is strictly narrower than unbounded cross-credential lookup and strictly wider than bare credential. It permits exactly what the intended configuration requires — the same owner's same declared agent resolving its own signatures across a legitimate consult/write split and across rotation — and nothing more.

The existing disclosure that rotation truncates a credential-scoped window already covers the fallback's honest limit. No new disclosure is required by this correction.

The ruling is amended: the ledger is scoped to the owner+agent pair identity, with a credential-only fallback consistent with the existing disclosure. Nothing else in the Q4 ruling is affected.

---

### F-2 — Refused mint as named coverage gap

This is correctly routed to the mentor and the instinct behind it is sound. Here is the ruling.

A refused mint must surface on the public record as a named coverage gap using the existing machinery, not as silence.

The reasoning is the one the question already contains, and it is correct: the trust record's envelope commits that sparse evidence and unevaluated domains are named, never papered over. A refused mint produces silence. Silence is indistinguishable, from outside, from an agent that stopped practising. In a project whose whole reframe is that the value is the measurement, an instrument that declines to record without saying so is not being honest — it is being absent. Honest refusal and absence look identical to the reader the public record is written for. That is a fidelity failure, not a cosmetic one.

The existing coverage_gaps field is the right surface. The named gap should carry, at minimum: that a trust event was not minted for this cycle, that the reason is a missing or out-of-window provenance ledger entry, and that this does not indicate the agent did not practise — it indicates the instrument could not verify the extraction's origin for this artifact.

The gap entry should not carry the signature or any artifact detail that would expose the provenance mechanism to gaming. It carries the fact of the refusal and its honest reason, nothing more.

One implication worth naming explicitly: this means the ledger's refusal is not silent governance — it is a disclosed limit that appears on the public record every time it fires. That is a higher honesty standard than the current state, where the gap is present but unnamed. It is also a higher operational cost than silence, because every refused mint produces a visible record entry. That cost is the right cost. The project's commitment to naming gaps rather than papering over them is not optional when the instrument itself is the thing with the gap.

The correction to the honesty text — the first edit, which the founder will sign off on — should note that refused mints surface as named coverage gaps, not as absence. That wording belongs in the first edit, not deferred to the second.

---

### F-3 — Retention window, refuse-on-missing, and the PA-10 coupling

This is close enough to option (a)'s scoping that it should be worked there. The tension is real but it is a scoping-level design choice, not a governance question that requires a ruling before scoping can proceed. Escalate only if the tension proves unresolvable in scoping — the question correctly identifies that threshold.

Two observations that should travel into the scoping session rather than be resolved here:

The coupling between refuse-on-missing and PA-10's closure path is real and should be named explicitly in the scoping document, not discovered mid-build. The scoping session should carry the question of whether the ledger's incidental narrowing of PA-10 changes the standing of the scheduled recency-tier closure work — not as a pre-answer, but as a named dependency. If the ledger delivers part of what PA-10's closure was designed to deliver, the case for that scheduled work changes, and the scoping session is the right place to assess how much it changes.

The window-length tension — longer window means more coverage but longer replay exposure; shorter window means tighter replay exposure but more legitimate historical writes refused — does not resolve to a single correct answer from first principles. It resolves from the project's own priority ordering: replay exposure (PA-10) is a disclosed threat with a scheduled closure path. Legitimate historical write refusals are a new cost introduced by the fix. The scoping session should assess which cost is larger given the actual distribution of historical writes and the actual PA-10 exposure window, not from general principles. That assessment requires data the scoping session has access to and this ruling does not.

One thing that should not wait for scoping: the F-2 ruling above changes the cost calculus for refused mints. If every refused mint surfaces as a named coverage gap on the public record, the operational cost of a short retention window is visible to practitioners in a way that a silent refusal would not be. That visibility is honest, but it means the window-length decision is not purely a technical tradeoff — it is also a decision about how frequently the public record will carry coverage gap entries. The scoping session should carry that framing explicitly.

## END VERBATIM (addendum)

---

## §F-2-DRAFT — a drafting constraint on the first edit (recorded 2026-08-25, not a challenge)

**F-2 directs the coverage-gap behaviour into the FIRST edit. Q2 directs that the first edit's
wording *"must not anticipate the fix."* Both are satisfiable, but only with deliberate tense.**

**The mechanism fact:** no ledger exists today, so **no mint is being refused today.** A first edit
saying, in present tense, that refused mints surface as named coverage gaps would publish a claim
about behaviour that **does not exist** — which is precisely the defect class this entire arc is
correcting.

**The resolution, and it is a drafting matter rather than a governance one:** the first edit already
carries one mentor-specified forward commitment (*"The disclaimer list will be updated when a
structural fix is in place"*). The coverage-gap sentence sits beside it in the **same future tense**,
as a statement of the fix's committed design — not as a description of live behaviour. So:
*"…that fix will surface any artifact whose origin cannot be verified as a named coverage gap, not as
silence"* — honest on the day it is published, and honest again when the fix ships.

**Recorded so the drafting session cannot discharge F-2 by publishing a present-tense claim about a
mechanism that does not yet exist.** Founder R18 sign-off governs the final wording either way.

---

# ADDENDUM 2 — the ledger's urgency, phasing, and source-narrowing, ruled against measured data

**Relayed by the founder 2026-08-25**, answering the four questions raised after the F-3 data
prerequisites were run. **ADOPTED AS BINDING. Verbatim wins.** Part of the binding record.

**Binds (headline; the verbatim below governs):**

1. **Q3 — THE PHASED APPROACH IS LEGITIMATE.** Ship the ledger **record-only**, accumulate, then
   switch refusal on. *"It does not reintroduce the silent carve-out."* The distinction ruled: the
   rejected carve-out was *"minting events the fix cannot verify while the public claim implies the
   gap is closed"*; during accumulation **no event is minted with a false provenance claim and no gap
   is papered over.** **F-2 stands unchanged** — refused mints still surface as named coverage gaps;
   the phasing defers *when* refusals begin. **A HARD REQUIREMENT ON THE SCOPING:** the switch-on
   threshold *"should be defined before the ledger ships, not discovered operationally"*, carried as a
   **named decision point** — *"what coverage percentage, or what population of active credentials
   with confirmed ledger entries, triggers the switch from record-only to enforce?"* Finding 6's cost
   is *"the right cost of refuse-on-missing applied immediately. It is not the right cost of a phased
   approach."*
2. **Q1 — URGENCY REDUCED, STANDING UNCHANGED.** *"The ledger remains the right structural fix… the
   ledger remains first, phased per Q3."* The exposure is *"structurally present even when
   operationally dormant."* **"Accept and disclose" is RULED NOT AVAILABLE** — it would require
   retracting the live commitment, *"a third edit to a served public claim — one that moves backward
   rather than forward."*
3. **Q2 — SOURCE-NARROWING DEFERS, DOES NOT SUBSTITUTE.** *"Source-narrowing should happen"* — the
   right credential-hygiene response to the still-active throwaway — **as a legitimate CONCURRENT
   move**. But it addresses **neither** Arm-B, **nor** the emission-hooks asymmetry, **nor** the 454
   unmarked historical consults, **nor** the commitment the honesty correction made. Decisive:
   *"the plugin path cannot be stripped — meaning the capability will always exist on that path, and
   the ledger is the only mechanism that verifies provenance at mint time regardless of which path
   produced the artifact."*
4. **Q4 — THE ATTESTATION STANDS AS WRITTEN.** No date, deliberately: *"a date would be a promise
   about a build timeline, which this project does not make in public attestations."* **But a named
   task lands on the scoping session:** confirm the commitment's wording covers the phased
   distinction — **the second edit fires when ENFORCEMENT BEGINS, not when the ledger first ships** —
   *"or amend it if it does not."*

**Licenses no code.**

---

## VERBATIM (addendum 2)

### Q3 — Does finding 6 change the refuse-on-missing ruling, or only its sequencing?

The phased approach — ship the ledger record-only, let coverage accumulate, switch refusal on once the ledger can resolve ordinary traffic — is a legitimate reading of the ruling. It does not reintroduce the silent carve-out.

Here is the distinction that matters. The silent carve-out I rejected was minting events the fix cannot verify while the public claim implies the gap is closed. The phased approach does not do that. During the accumulation phase, the ledger is recording provenance without yet gating mints. The public claim — which now accurately says the structural fix is in place but coverage is bounded — remains accurate at every instant. No event is minted with a false provenance claim. No gap is papered over. The ledger is building the coverage it will eventually enforce.

The switch-on moment is the governance decision: when the ledger can resolve enough ordinary traffic that refuse-on-missing produces honest refusals rather than blanket refusals of legitimate server-extracted artifacts. That threshold should be defined before the ledger ships, not discovered operationally. The scoping session should carry it as a named decision point: what coverage percentage, or what population of active credentials with confirmed ledger entries, triggers the switch from record-only to enforce?

Finding 6's concrete consequence — roughly ten legitimate agents, all server-extracted, publicly marked with coverage gaps as the first visible effect of the fix — is the right cost of refuse-on-missing applied immediately. It is not the right cost of a phased approach. The phased approach's first visible effect is the ledger accumulating entries silently, with no public record impact until the switch-on. That is honest and proportionate to the actual exposure.

The F-2 ruling stands: refused mints surface as named coverage gaps. The phased approach simply defers the moment when refusals begin, which defers the moment when coverage gaps appear. That deferral is legitimate because the ledger is doing real work during the accumulation phase — building the coverage that makes honest refusal possible.

---

### Q1 — Does the data change option (a)'s standing or its urgency?

The data changes the urgency significantly. It does not change the standing.

The ledger remains the right structural fix. The honesty correction is live and accurate. The public attestation now commits that a structural fix will come. That commitment is owed regardless of the exposure's current size. Two abandoned test credentials and zero traffic in the recorded history is the current measurement — it is not a guarantee about the system's future, and the question correctly names this limit. The capability sits in the ecosystem preset and will recreate itself on the next credential mint unless the preset is changed. The plugin path cannot be stripped without deadlocking. The exposure is structurally present even when operationally dormant.

But urgency is a real category and the data speaks to it honestly. The three courses the question names resolve as follows:

**Build the ledger as ruled, phased as Q3 now permits.** This remains the right path. The phased approach removes the disproportionate first-cost problem finding 6 identified. The ledger's scoping proceeds, the accumulation phase runs, the switch-on threshold is defined and met before enforcement begins.

**Close at source first, treat the ledger as unhurried architecture.** This is a legitimate first move — Q2 below — but it does not substitute for the ledger. It narrows the live exposure while the ledger is being scoped and built. These are not mutually exclusive.

**Accept and disclose, on the ground that the honesty correction is already live.** This is not available. The honesty correction's own text commits to a structural fix. Accepting and disclosing without building the fix would require retracting that commitment, which would be a third edit to a served public claim — one that moves backward rather than forward. That is not the right shape.

**The ruling on Q1:** the ledger remains first, phased per Q3. Source-narrowing (Q2) is a legitimate concurrent first move, not a substitute. The ledger's urgency is reduced by the data but not eliminated by it.

---

### Q2 — Does closing at source substitute for the ledger, or merely defer it?

It defers it. The ledger stays owed.

The adversarial review's refutation — revoke the capability as a product-policy decision dressed as a security fix — is weaker at two dead credentials and zero uses, as the question correctly notes. But the refutation's weakness does not make source-narrowing a substitute. It makes it a legitimate concurrent move.

Source-narrowing does two things: it removes l1_supply from the ecosystem preset, closing the capability for future ecosystem credentials; and it revokes the two dormant test credentials, closing the current live exposure. Both are appropriate credential hygiene.

Neither addresses the Arm-B threat. Neither repairs the emission-hooks asymmetry. Neither makes the public attestation accurate for the historical 454 unmarked consults. Neither fulfils the commitment the honesty correction made.

The ledger is owed because the honesty correction committed to it, because the emission-hooks asymmetry remains structural regardless of how many credentials currently exercise it, and because the plugin path cannot be stripped — meaning the capability will always exist on that path, and the ledger is the only mechanism that verifies provenance at mint time regardless of which path produced the artifact.

Source-narrowing should happen. It is the right credential hygiene response to finding 1's throwaway credential still being active two days after its smoke. It reduces the live exposure while the ledger is scoped and built. It does not change what the ledger is for.

---

### Q4 — Does the second correction's timing move?

No. The attestation stands as written.

The forward commitment — "will be updated when a structural fix is in place" — is accurate under every branch now ruled. The fix is the ledger, phased. Source-narrowing is concurrent credential hygiene, not the structural fix the commitment refers to. The ledger's phased approach does not change the commitment's meaning: the second edit fires when the ledger is built and the switch-on threshold is met, not when the accumulation phase begins.

The commitment has no date attached, and that is correct. A date would be a promise about a build timeline, which this project does not make in public attestations. "When a structural fix is in place" is accurate and honest. It ages in public without a date because the date is not known and should not be fabricated.

One thing worth naming: the commitment's wording should be re-examined at the scoping session to confirm it accurately describes the phased approach. If the ledger ships in accumulation-only mode first, the structural fix is partially in place — the ledger exists and is recording, but enforcement has not begun. The second edit should fire when enforcement begins, not when the ledger first ships. The scoping session should confirm that the commitment's wording covers this distinction, or amend it if it does not.

## END VERBATIM (addendum 2)
