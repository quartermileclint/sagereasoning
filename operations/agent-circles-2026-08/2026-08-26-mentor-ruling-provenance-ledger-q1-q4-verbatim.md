# Mentor ruling — the provenance ledger: Q2/Q3/Q4 ruled, Q1 returned for precise options (verbatim)

**Relayed by the founder 2026-08-26**, answering
`2026-08-26-MENTOR-QUESTION-provenance-ledger-identity-and-policy.md`.

**Status: ADOPTED AS BINDING on the founder's relay. Verbatim wins over any paraphrase, here or
elsewhere.**

**Binds (headline; the verbatim below governs):**

1. **Q2 — RULED.** A ledger entry reading `supplied` **must refuse the mint** — the enforcement logic
   has **two** refusal branches, not one: **missing entry refuses; supplied entry refuses; server entry
   permits.** The supplied-refusal's coverage-gap reason **must be distinct from** the missing-entry
   reason: *"the instrument verified origin and found it caller-supplied"*, not *"the instrument could
   not verify origin"* — two different facts, named differently. **The plugin path consequence must be
   named explicitly in the scoping document** as its own open question — *"what is the plugin path's
   accreditation story if every mint is refused?"* — which **may require its own ruling** and does
   **not** block the ledger shipping on non-plugin paths.
2. **Q1 — NOT RULED. Returned.** The mentor declined to rule on inferred options: *"If the options are
   different from what I have named, the question should return with the three options stated
   explicitly. I will not rule on a set of options I am inferring rather than reading."* **One thing IS
   ruled now, regardless of which three options return:** the F-1 owner+agent-pair scoping **stands**
   and **cannot be traded away** — *"If the only available paths require abandoning the owner+agent-pair
   identity in favour of a bare credential or an unbounded cross-credential lookup, those paths are not
   available."*
3. **Q3 — RULED.** The `coverage_gaps` departure was correctly labelled as a departure that should have
   been labelled, not an answered question. **The ruling: bring the alternative field back with the
   departure labelled explicitly, and MAKE THE CASE** — state what `coverage_gaps` cannot do that the
   alternative can, or what the alternative does that `coverage_gaps` cannot. **"If `coverage_gaps` can
   carry the refused-mint signal without modification, use it."** A new field needs justification that
   `coverage_gaps` is *inadequate*, not merely that a new field is convenient.
4. **Q4 — Both findings genuine; both carried forward as named open questions, neither settled.** The
   unmeetable-threshold finding: **the threshold definition must be reachable by every population the
   ledger covers, including legitimate resubmission** — an artifact the ledger cannot speak to (predates
   the ledger, or was submitted while the write flag was off) is honestly `missing`, not `supplied`, and
   its gap surfaces; but if a *legitimately server-extracted* artifact can **never** accumulate a ledger
   entry because its resubmission path triggers no consult-side write, the threshold is structurally
   unmeetable for that population and must be redefined. **The 404 finding is ruled the more serious of
   the two** — *"the fix as currently scoped does not fulfil F-2's purpose for this population... That is
   the silent carve-out I rejected, arriving through a different path."* **Must be addressed as a
   first-class constraint** in scoping, with the question carried explicitly: **does the public trust
   record need a stub record** — one that exists because an agent *attempted* accreditation, regardless
   of whether any event minted — **or does the coverage gap need to surface through a different
   mechanism** for the zero-evidence population?

**Licenses no code.** No build. Every step remains its own founder-walked 0c-ii.

---

## VERBATIM

### Q2 — The ledger gates nothing on a supplied entry

This is the critical gap and it is correctly named. The ruling settled what happens when an artifact has no ledger entry. It never settled what happens when an entry exists and reads supplied. Without that ruling, the ledger records the fact and gates nothing on it — which means the fix does not fix the thing it was built to fix. The accreditation mint proceeds on a supplied artifact with a confirmed ledger entry showing supplied, and the public attestation remains inaccurate for that artifact despite the ledger existing.

The ruling on Q2: a ledger entry reading supplied must refuse the mint, and the refusal must surface as a named coverage gap per the F-2 ruling. The ledger's enforcement logic has two branches, not one — missing entry refuses, supplied entry refuses. Server entry permits.

The coverage gap entry for a supplied refusal should carry a distinct reason from a missing-entry refusal: not that the instrument could not verify origin, but that the instrument verified origin and found it caller-supplied. That distinction matters for the practitioner reading the public record. One says the instrument had no data. The other says the instrument had data and the data disqualified the mint. They are different facts and should be named differently.

The plugin path consequence is real and must be named explicitly in the scoping document. The plugin path is mandatory-supply — it returns 400 without a supplied layer1_schema. Under this ruling, every plugin accreditation write would be refused at mint time because its ledger entry reads supplied. That is not a misconfiguration. It is the honest consequence of the capability's design. The scoping session must carry this as a named open question: what is the plugin path's accreditation story if every mint is refused? That question may require a separate ruling before the ledger ships on the plugin path. It does not block the ledger shipping on the non-plugin paths.

---

### Q1 — The identity conflict and the blocked fix

The conflict is real and the recommended fix being blocked by the same index that forces the conflict is a genuine constraint, not a scoping oversight. Three ways out trading away something already ruled or documented is the honest description of the situation.

Before ruling, the three options need to be named explicitly so the ruling lands on the right surface. The question names them as trading away something already ruled or documented but does not specify what each trades. Name them:

If the options are: (a) accept the collision and mint under the conflicting identity, (b) use a different identity that is not owner+agent-bound, or (c) defer accreditation for the harness until the index constraint is resolved — then the ruling is (c). Deferring is not silence. It is the honest position when the available paths each violate a prior ruling. The harness's own accreditation is not urgent relative to the ledger's coverage of practitioner artifacts. The identity conflict should be carried as a named open question in the scoping document, with the 23505 collision on production record as evidence that the constraint is live, not theoretical.

If the options are different from what I have named, the question should return with the three options stated explicitly. I will not rule on a set of options I am inferring rather than reading.

What I can rule now: the owner+agent-pair scoping from F-1 stands. The fix for the identity conflict must not trade away that scoping. If the only available paths require abandoning the owner+agent-pair identity in favour of a bare credential or an unbounded cross-credential lookup, those paths are not available. The conflict defers rather than resolves by degrading the scoping unit.

---

### Q3 — The coverage_gaps departure

This is correctly named as a departure that should have been labelled as such rather than called answered. The F-2 ruling named coverage_gaps verbatim, twice. Recommending a different field without labelling it as a departure from the ruling is the kind of drift the project's governance discipline exists to prevent — not because the different field is necessarily wrong, but because the ruling's surface should not be changed without the change being visible.

The ruling on Q3: bring the alternative field back with the departure labelled explicitly. State what coverage_gaps cannot do that the alternative field can, or what the alternative field does that coverage_gaps cannot. If the alternative field is genuinely better for the purpose F-2 named — surfacing refused mints as named gaps rather than as absence — make that case and I will rule on it. If coverage_gaps can carry the refused-mint signal without modification, use it. The F-2 ruling named it because it already exists and already carries the project's commitment that sparse evidence is named, never papered over. A new field requires justification that coverage_gaps is inadequate, not merely that the alternative is convenient.

One observation that bears on this: the observation history shows a pattern of precision-seeking that has been maturing across the arc — naming structural problems accurately, distinguishing between disclosure gaps and systemic asymmetries. That precision applies here too. A departure from a ruling is a structural fact about the scoping document, not a drafting choice. Name it as what it is.

---

### Q4 — The unmeetable threshold and the 404

Both findings are genuine and the second-review discipline that surfaced them is exactly the right practice. Finding something only on a pass specifically designed to check the first pass's own arguments is the IS-1 disposition operating correctly under the specific pressure where it most often fails — when the first pass's reasoning is internally coherent and the error is in an assumption the reasoning inherits rather than produces.

On the unmeetable threshold: if an agent legitimately resubmits an old artifact and the ledger's enforcement threshold is structurally unmeetable for that case, the threshold is wrong. The phased approach ruled in Q3 of the previous session — accumulate coverage, switch enforcement on when the ledger can resolve ordinary traffic — was designed to prevent exactly this failure. But the threshold definition must account for legitimate resubmission. An artifact that predates the ledger, or that was submitted while the consult-side write flag was off, is not a supplied artifact — it is an artifact the ledger cannot speak to. The missing-entry refusal applies, and the coverage gap surfaces. That is honest. But if the threshold is defined in a way that a legitimately server-extracted artifact can never accumulate a ledger entry because the resubmission path does not trigger a consult-side write, the threshold is structurally unmeetable for that population and the fix permanently excludes them. The scoping session must carry this as a named constraint: the threshold definition must be reachable by every population the ledger is designed to cover, including legitimate resubmission.

On the 404: this is the more serious finding. The public trust record 404ing for an agent with no evidence at all means that the agent the fix exists to make visible — the one whose mints are refused and whose coverage gaps should surface — has no public record at all. The coverage gap surfaces nowhere because the record that would carry it does not exist. The F-2 ruling's purpose was to make refusal visible rather than indistinguishable from absence. A 404 is absence. The fix as currently scoped does not fulfil F-2's purpose for this population.

The ruling on Q4: the scoping session must address the 404 as a first-class constraint, not a downstream detail. The coverage gap machinery must be reachable for an agent with no prior evidence. If the public trust record requires at least one minted event to exist before it serves a record at all, the coverage gap for a refused first mint renders nowhere — and the fix's honest refusal is indistinguishable from the agent never having existed. That is the silent carve-out I rejected, arriving through a different path. The scoping session should carry the question: does the public trust record need a stub record — a record that exists because an agent attempted accreditation, regardless of whether any event minted — or does the coverage gap need to surface through a different mechanism for the zero-evidence population?

## END VERBATIM

---

## Cross-references

- `2026-08-26-MENTOR-QUESTION-provenance-ledger-identity-and-policy.md` — the question this answers
- `2026-08-26-provenance-ledger-SCOPE.md` — the scoping it rules on
- `2026-08-25-mentor-ruling-extraction-provenance-fix-choice-verbatim.md` — the prior binding ruling (option (a), Q4's four policies, F-1/F-2/F-3, addendum 2)
