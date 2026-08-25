# Mentor question, round 4 — Q3's case and the 404's case, both made

**Raised 2026-08-26.** Two pieces of work the mentor asked for in earlier rounds, now done rather than
named: Q3's case for `coverage_gaps` being inadequate (asked in round 1, worked but never actually
relayed), and a genuine argued case for the 404 question (which the prior round only named two shapes
for, without picking).

**Everything else in this arc is ruled and implemented** — Q1 (defer the harness by name), Q2 (the
two-branch refusal design), §9's restructured threshold. Not re-opened here.

---

## Part 1 — Q3: the case for a sibling field over widening `coverage_gaps`

**Ruled instruction (round 1):** *"bring the alternative field back with the departure labelled
explicitly. State what `coverage_gaps` cannot do that the alternative field can, or what the alternative
field does that `coverage_gaps` cannot... If `coverage_gaps` can carry the refused-mint signal without
modification, use it."*

**The case, in full, at `2026-08-26-provenance-ledger-SCOPE.md §6.1–6.4`.** Summary:

**Unmodified reuse is possible in exactly one degraded form, and it's worse than useless.** For a
`caller_supplied_extraction` refusal, the artifact's own extraction is in hand, so its
`virtue_domains_engaged` could be pushed into `coverage_gaps` as bare domain names, at zero schema
cost. **This is rejected on the merits, not skipped**: it would make a provenance refusal
indistinguishable from an existing, unrelated signal — a domain whose evidence was A2-zeroed — which is
the exact confusion F-2 exists to prevent, in the ruling's own words: *"Honest refusal and absence look
identical to the reader... a fidelity failure, not a cosmetic one."* For the other three refusal
reasons (missing, out-of-window, identity-mismatch) there is no extraction in hand at all, so even this
degraded form is unavailable — an empty entry, functionally silence.

**Modification — widening `coverage_gaps`'s element type into a discriminated union — was weighed
seriously, not dismissed.** It is rejected for two reasons, not one: (1) it is a breaking change to a
documented, currently plain-shaped public field, and this project has a standing, repeatedly-applied
answer for exactly this situation — every prior addition of a new signal to this same payload
(`orientation_readings`, `meta.trajectory.delta`, `loop_fold`) shipped as a NEW optional field, never as
a retrofit, even where an adjacent overload was arguably available; (2) the two kinds of gap are
different kinds of fact at different grains — A2-zeroed-domain coverage is a property of the aggregate's
evidence composition across history; a provenance refusal is a property of one accreditation write at
one moment — and folding them into one field's element type makes every reader re-derive that
distinction from a discriminant tag instead of from field identity.

**Question:** does this case satisfy the instruction — is `coverage_gaps` genuinely inadequate (not
merely inconvenient) for the reasons given, licensing the sibling field
(`provenance_gaps`/`total_provenance_gaps_count`, shaped exactly on the `orientation_readings`
precedent)? Or does the mentor judge the breaking-change cost acceptable and rule for widening
`coverage_gaps` instead?

---

## Part 2 — The 404: a case is made, not just two names

**The mentor's own framing (round 1, ruled the more serious finding):** *"does the public trust record
need a stub record... or does the coverage gap need to surface through a different mechanism for the
zero-evidence population?"*

**The case, in full, at `SCOPE.md §6.5`.** Two corrections to the prior draft's own claims came first,
because the case depends on them:

**Correction 1 — a prior claim that a stub record would be nearly free was checked and is wrong.** The
composer (`composeTrustRecordPayload`) has exactly one live caller, called only after the 404 gate
passes. Its own "no evidence" branch is dead code on that path — `readTrustVerdict` never returns a
null aggregate alongside a non-null profile in practice. Reaching that branch for the first time is new
surface needing new test coverage, not free reuse.

**Correction 2 — what the 404 gate actually is, once traced.** It is not "does a profile exist" — a
zero-evidence agent still gets a real, honestly-`sparse: true` profile with all domains present at
`hasEvidence: false`. The gate is exactly one condition: `domains.some(hasEvidence)`.

**The case for relaxing that one condition, over a separate endpoint:** ENV-1's own stated purpose,
quoted in its own source comment, was never "must have virtue evidence" as an end in itself — it was to
reject a *bare row* (a declaration-class event seeding a state row with no real evidence) from
falsifying a "200 implies examined evidence" claim. **A provenance-gap entry is not a bare row — it is
proof the ledger genuinely examined an artifact's origin and reached a determinate refusal.** Extending
the gate to `domains.some(hasEvidence) || provenance_gaps.length > 0` is read here as a faithful
extension of ENV-1's actual principle, not a violation of it.

**Weighed against the alternative:** a separate endpoint leaves the main record's contract untouched,
but only stays honest if the existing 404 body is modified to point to it — otherwise it reproduces the
exact "pointer resolves to nothing" defect this arc opened by correcting. Once that pointer is added,
the separate-endpoint approach costs a new endpoint plus a modified 404 body — not smaller in total than
one relaxed condition on the endpoint already being changed this session.

**The disclosed cost, not hidden because the case favours the recommendation:** every 200 today
implicitly means some evidence exists; this relaxation means a future integration checking only HTTP
status, not `aggregate.level`, could misread a zero-evidence stub as an evaluated record. Bounded — the
payload already discloses `sparse: true` and the honest `aggregate.basis` — but real.

**Recommendation:** relax the gate, tied to the same flag gating the ledger so it is inert until the
ledger ships (flag-off ⇒ `provenance_gaps` never populated ⇒ the OR-condition is never true ⇒
byte-identical).

**Question:** does this case land the ruling on the stub-record shape, or does the mentor still prefer
the separate-mechanism reading, priced at its full honest cost (a new endpoint AND a modified 404 body,
not just a new endpoint)?

---

## Why both together

§3.3 of the scope document names a real dependency: the harness-deferral ruling's own honesty claim —
*"the refusal is named, not silent"* — is only true once this 404 question is settled. Sending both
together lets one relay close the loop that opened it.

## Verification status

Every mechanism claim in Part 2 (the composer's single caller, the dead branch, the actual gate
condition, `sparse`'s computation) was re-verified at source this session — `composeTrustRecordPayload`
(`trust-record-payload.ts:286`), its sole call site (`handler.ts:269`), `readTrustVerdict`
(`harness-integration.ts:503-582`), `readTrustProfile` (`trust-core-store.ts:524-550`), and
`computeTrustProfile`'s `sparse` computation (`trust-aggregate.ts:110`). Part 1's claims were verified
in the prior round and are unchanged.

## Cross-references

- `2026-08-26-provenance-ledger-SCOPE.md §6` — both cases in full
- `2026-08-26-mentor-ruling-provenance-ledger-q1-q4-verbatim.md` — round 1, Q3 and Q4's original rulings
- `2026-08-26-mentor-ruling-provenance-ledger-q1-round2-verbatim.md` — the harness-visibility dependency
