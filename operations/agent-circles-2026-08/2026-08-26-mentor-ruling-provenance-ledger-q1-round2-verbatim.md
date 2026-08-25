# Mentor ruling — the provenance ledger Q1, round 2: option A available-not-ruled, option C's narrower
# move chosen (verbatim)

**Relayed by the founder 2026-08-26**, answering
`2026-08-26-MENTOR-QUESTION-round2-provenance-ledger-q1-options.md`.

**Status: ADOPTED AS BINDING on the founder's relay. Verbatim wins over any paraphrase, here or
elsewhere.**

**Binds (headline; the verbatim below governs):**

1. **Option A (merge the harness's two credentials) — AVAILABLE IN PRINCIPLE, NOT RULED, left as a
   founder election.** Unlike option B, A does not violate the standing owner+agent-pair scoping — it
   satisfies the identity requirement cleanly. What makes it unavailable is a **security posture**, not
   a structural impossibility: *"The least-privilege split is not a preference. It is a documented
   response to a real incident and a HIGH adversarial finding."* The mentor's own recommendation: **do
   not take it** — *"Trading it for provenance coverage of a never-exercised capability, on a harness
   that is the project's own reference integration rather than a live practitioner surface, is a
   disproportionate trade."* **If the founder elects it anyway, the security trade must be documented
   explicitly alongside the provenance rationale, not absorbed as a side effect of the identity fix.**
2. **Option C — RULED. The narrower move, not the general policy.** *"Defer the harness's accreditation
   specifically, by name, as a single-agent decision. Do not adopt option C's general policy."* The
   general-policy reading (permanent refusal for every present and future split-pair agent) is *"broader
   than the question requires"* and would make the §9 cohort-freeze machinery *"load-bearing for the
   entire enforcement design"* on the basis of one known agent and an unmeasured population.
3. **§9 consequence — RULED, and it reorders the scoping's own sequencing.** *"C1's population-wide
   threshold is defined AFTER the split-pair population is measured, not before."* **The harness is
   excluded from C1's denominator BY NAME** until its configuration changes; the threshold is then set
   against the population the ledger actually covers. **The split-pair population measurement is a
   founder prerequisite that must happen BEFORE §9's C1 is defined**, not merely before this scoping
   closes. The cohort-freeze/exception-register machinery the prior draft carried as open alternatives
   is **not needed** under this ruling — a named single-agent exclusion is *"cleaner… and more
   honest"* than a general freeze mechanism.
4. **One consequence named explicitly by the mentor, and it is load-bearing for a dependency this
   document must track:** deferring the harness's accreditation means **the harness's own practice is
   not visible on the public trust record under enforcement.** The mentor states this is proportionate
   and honest *"because the coverage gap surfaces per F-2 — the refusal is named, not silent."* **That
   claim presupposes Q4's still-open 404 finding is resolved** — under the CURRENT unresolved state, an
   agent whose every mint is refused gets a 404, not a coverage-gap entry (Q4, ruled the more serious
   finding, 2026-08-26 round 1). This tension is not raised or resolved by the mentor here and is
   flagged in the scope document as a named dependency, not silently absorbed.

**Licenses no code.** No build. Every step remains its own founder-walked 0c-ii.

---

## VERBATIM

### Option A — Merging the harness's two credentials

Option A is not available on the same footing as B, but the reasoning is different from B's and worth stating precisely. B was ruled out because it abandons the owner+agent-pair scoping for a bare-credential or unbounded cross-credential lookup — it violates a standing structural ruling. A does not violate that ruling. A satisfies the identity requirement cleanly: one credential per agent carrying both capabilities is exactly what the owner+agent-pair scoping was designed to resolve. The identity conflict disappears.

What makes A unavailable is not a structural ruling but a security posture that this project has already paid the cost of learning. The least-privilege split exists because the credential that produces assessments should not also be able to submit them. The harness's own code refuses to write when they are the same credential — a guard added deliberately after a HIGH adversarial-review finding. The project has had one credential-exposure incident already. Merging enlarges the blast radius of the next one.

The question asks whether A is available at all, or whether the least-privilege posture makes it unavailable on the same footing as B. The honest answer is that A is available in principle — it is a founder-level security trade, not a structural impossibility — but it should not be taken. The least-privilege split is not a preference. It is a documented response to a real incident and a HIGH adversarial finding. Trading it for provenance coverage of a never-exercised capability, on a harness that is the project's own reference integration rather than a live practitioner surface, is a disproportionate trade. The blast radius of the next credential-exposure incident is not a theoretical concern — the project has already had one.

Option A is available to the founder as a decision. It is not available as a ruling from me. If the founder takes it, the security trade should be documented explicitly alongside the provenance rationale, not absorbed as a side effect of the identity fix.

---

### Option C — The general policy versus the narrower move

The narrower move is correct. The provisional guess named it better than the scoping document wrote it, and the document correctly identifies this without assuming it.

Option C as scoped — accept permanent refusal for every split-pair agent as a general policy — is broader than the question requires and produces consequences that are disproportionate to the problem. The switch-on threshold cannot clear while any split-pair agent remains active. The cohort-freeze machinery in §9 becomes load-bearing for the entire enforcement design. A general policy toward every present and future split-pair agent is a structural commitment made on the basis of one known agent — the harness — and an unmeasured population beyond it.

The narrower move: defer the harness's own accreditation specifically, as a named single-agent decision, until its configuration resolves. This is not option C. It is a decision about one named agent that leaves the general population question open until the actual population of split-pair agents beyond the harness is known. If that population is one — the harness alone — the general policy question in C never needed to be answered. If it is larger, the general policy question gets answered with real population data rather than on the basis of a single case.

The ruling: defer the harness's accreditation specifically, by name, as a single-agent decision. Do not adopt option C's general policy. The §9 cohort-freeze machinery should not be built to handle a structural permanent exception class until the actual population of split-pair agents is measured. That measurement is a founder prerequisite — the document correctly names it as unverified and not assertable from a repo session. The measurement should happen before §9's C1 threshold is defined, not after.

One implication worth naming explicitly: this ruling means the harness's own practice is not visible on the public trust record under enforcement. That is the honest consequence of the harness running a configuration the ledger cannot verify. The coverage gap surfaces per F-2 — the refusal is named, not silent. The harness is not a practitioner whose progress is being obscured; it is the project's own reference integration whose configuration creates the identity conflict. Deferring its accreditation is proportionate and honest.

---

### The §9 consequence

If the ruling is the narrower move rather than option C's general policy, §9's C1 reachability concern narrows considerably — possibly to nothing, once the split-pair population beyond the harness is measured. The scoping document should carry this explicitly: C1's population-wide threshold is defined after the split-pair population is measured, not before. The harness is excluded from C1's denominator by name until its configuration changes. The threshold is then set against the actual population the ledger is designed to cover.

This is cleaner than the cohort-freeze machinery §9 currently requires under option C's general policy. It is also more honest: the threshold reflects the population the ledger actually covers, not a population that includes a permanently excluded agent whose exclusion is papered over by a freeze mechanism.

## END VERBATIM

---

## Cross-references

- `2026-08-26-MENTOR-QUESTION-round2-provenance-ledger-q1-options.md` — the question this answers
- `2026-08-26-mentor-ruling-provenance-ledger-q1-q4-verbatim.md` — round 1 (Q2/Q3/Q4 ruled, Q1 returned)
- `2026-08-26-provenance-ledger-SCOPE.md` — the scoping this rules on
