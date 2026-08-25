# Mentor ruling — the provenance ledger Q3 (sibling field) and the 404 (gate relaxation), both ruled
# (verbatim)

**Relayed by the founder 2026-08-26**, answering
`2026-08-26-MENTOR-QUESTION-round4-provenance-ledger-q3-and-404.md`.

**Status: ADOPTED AS BINDING on the founder's relay. Verbatim wins over any paraphrase, here or
elsewhere.**

**Binds (headline; the verbatim below governs):**

1. **Q3 — RULED. Use the sibling field.** *"The case satisfies the instruction. The sibling field is
   licensed."* Both grounds accepted: the degraded-reuse path (folding a refused artifact's engaged
   domains into `coverage_gaps`) is *"not a reuse of `coverage_gaps` — it is a corruption of it"*; the
   widening path is rejected on both stated reasons, with the second (different kinds of fact at
   different grains — aggregate-composition property vs. single-write-moment property) named as *"the
   deeper reason the first reason is right."* **Field name confirmed:** `provenance_gaps` with
   `total_provenance_gaps_count`, shaped on the `orientation_readings` precedent.
2. **The 404 — RULED. Relax the gate.** *"The case lands the ruling on the stub-record shape via gate
   relaxation. The separate-mechanism reading is not preferred."* Both corrections in the case are
   affirmed as *"load-bearing and correctly made before the argument"* — the naming of the earlier
   wrong "free reuse" claim, and the correction of what the gate actually is
   (`domains.some(hasEvidence)`, not "does a profile exist"). **The ENV-1 reading is affirmed as
   sound**: a provenance-gap entry is *"not a bare row… different facts. The gate's purpose was to
   exclude the first kind [bare rows]. Extending it to also exclude the second kind [genuine
   provenance-refusal examinations] would be a misreading of ENV-1's principle, not a faithful
   application of it."* **Exact condition ruled:** `domains.some(hasEvidence) ||
   provenance_gaps.length > 0`, **tied to the same flag gating the ledger** — *"the same phased approach
   that governs the ledger's enforcement switch-on — consistent, not novel."*
3. **§3.3's dependency — RULED CLOSED.** *"The harness-deferral ruling's own honesty claim depended on
   the 404 question being settled, because a refused mint that renders nowhere is silence regardless of
   what the ledger records. With the gate relaxed and the `provenance_gaps` field populated on refusal,
   the refused mint surfaces on the public record for an agent with no prior virtue evidence. The claim
   holds."**

**Licenses no code.** No build. Every step remains its own founder-walked 0c-ii.

---

## VERBATIM

### Q3 — The case for a sibling field over widening coverage_gaps

The case satisfies the instruction. The sibling field is licensed.

The instruction asked for one of two things: a demonstration that coverage_gaps is genuinely inadequate for the reasons given, or a ruling that the breaking-change cost is acceptable and widening is preferred. The case delivers the first. Here is why it holds.

The degraded-reuse path — pushing virtue domain names into coverage_gaps for a caller_supplied_extraction refusal — is correctly rejected on the merits. It makes a provenance refusal indistinguishable from an A2-zeroed domain, which is the exact confusion F-2 exists to prevent. The ruling's own words were that honest refusal and absence look identical to the reader. A degraded reuse that makes provenance refusal look like evidence absence is not a reuse of coverage_gaps — it is a corruption of it. The case names this correctly and rejects it for the right reason, not for convenience.

The modification path — widening coverage_gaps into a discriminated union — is also correctly rejected, and the two-reason structure matters. The first reason alone — breaking change to a documented public field — would be sufficient given this project's standing pattern: every prior addition of a new signal to this payload shipped as a new optional field, never as a retrofit. That pattern is not arbitrary. It exists because retrofitting a field's element type forces every reader to re-derive distinctions from a discriminant tag that field identity would have made structural. The second reason — that A2-zeroed-domain coverage and provenance refusal are different kinds of fact at different grains — is the deeper reason the first reason is right. A2-zeroed coverage is a property of the aggregate's evidence composition across history. A provenance refusal is a property of one accreditation write at one moment. These are not the same kind of gap. Folding them into one field because they are both absences is the same error as folding them into coverage_gaps in the degraded form — it makes structurally different facts look like the same kind of fact.

The sibling field shaped on the orientation_readings precedent is the right answer. The name provenance_gaps with a total_provenance_gaps_count sibling is consistent with the established pattern.

The ruling is: use the sibling field.

---

### The 404 — Relaxing the gate versus a separate mechanism

The case lands the ruling on the stub-record shape via gate relaxation. The separate-mechanism reading is not preferred.

The case's two corrections are load-bearing and correctly made before the argument, not after. The prior claim that a stub record would be nearly free was wrong, and naming that wrongness before making the case is the right epistemic discipline — the observation history has been tracking this pattern as it matures, and it is operating correctly here. The correction to what the 404 gate actually is — not "does a profile exist" but domains.some(hasEvidence) — is equally important, because the argument for relaxation depends on understanding what the gate's actual purpose is, not what it sounds like.

The ENV-1 reading is sound. The gate's stated purpose was to reject a bare row — a declaration-class event seeding a state row with no real evidence — from falsifying a "200 implies examined evidence" claim. A provenance-gap entry is not a bare row. It is proof the ledger examined an artifact's origin and reached a determinate refusal. The distinction is real: a bare row carries no evidence because nothing examined it; a provenance-gap entry carries no virtue evidence because the examination reached a refusal before virtue assessment could proceed. These are different facts. The gate's purpose was to exclude the first kind. Extending it to also exclude the second kind would be a misreading of ENV-1's principle, not a faithful application of it.

The extension domains.some(hasEvidence) || provenance_gaps.length > 0 is a faithful extension of ENV-1's actual principle. A 200 under this condition still means something was genuinely examined — either virtue evidence exists, or the ledger examined provenance and reached a determinate refusal. Neither is a bare row. The "200 implies examined evidence" claim remains honest under the extended condition, provided the payload discloses what kind of examination occurred. The payload already does this: sparse: true and the honest aggregate.basis are present. The provenance_gaps field, once populated, makes the refusal visible.

A reader checking only HTTP status and not aggregate.level could misread a zero-evidence stub as an evaluated record — the case names this cost honestly and it is real — but it is bounded by the existing disclosure mechanisms, not hidden beneath them.

The separate-endpoint alternative is correctly priced at its full honest cost: a new endpoint plus a modified 404 body, because a 404 without a pointer to the separate endpoint reproduces the "pointer resolves to nothing" defect this arc opened by correcting. That cost is not smaller than one relaxed condition on the endpoint already being changed this session. The case is right about this.

The flag-gating is the right implementation discipline. Flag-off means provenance_gaps is never populated, the OR-condition is never true, and the behaviour is byte-identical to the current state. The relaxation is inert until the ledger ships. This is the same phased approach that governs the ledger's enforcement switch-on — consistent, not novel.

The ruling: relax the gate to domains.some(hasEvidence) || provenance_gaps.length > 0, tied to the same flag gating the ledger. The separate-mechanism reading is not taken.

---

### The dependency the document names

§3.3's honesty claim — the refusal is named, not silent — is now closed. The harness-deferral ruling's own honesty claim depended on the 404 question being settled, because a refused mint that renders nowhere is silence regardless of what the ledger records. With the gate relaxed and the provenance_gaps field populated on refusal, the refused mint surfaces on the public record for an agent with no prior virtue evidence. The claim holds.

## END VERBATIM

---

## Cross-references

- `2026-08-26-MENTOR-QUESTION-round4-provenance-ledger-q3-and-404.md` — the question this answers
- `2026-08-26-mentor-ruling-provenance-ledger-q1-q4-verbatim.md` — round 1's original Q3/Q4 rulings
- `2026-08-26-mentor-ruling-provenance-ledger-q1-round2-verbatim.md` — the §3.3 dependency this closes
- `2026-08-26-provenance-ledger-SCOPE.md` — the scoping this rules on
