# W2 — the compliance-not-virtue clause: STAGED for R18 sign-off (not applied)

**Date:** 2026-09-12. **Status:** STAGED. Nothing below has touched a public surface. The inline half
(per-entry) is built dark on branch `w2-record-honesty` and is battery-locked verbatim; the
record-level half below waits for founder sign-off, then lands as ONE edit with the ADR-013 §8 dated
amendment (the same-edit rule every prior envelope amendment followed).

**Source:** mentor verdict L7, verbatim record
`operations/agent-circles-2026-08/2026-08-01-mentor-consultation-agent-circles-logos-on-verbatim.md`.
The verbatim record wins over every restatement here.

---

## 1. The clause (mentor-verbatim; the constant `COMPLIANCE_NOT_VIRTUE_CLAUSE` is byte-equal to this)

> what this record shows under logos-on enforcement is compliance with rational structure, not
> constructed virtue. Enforced outcomes are not character evidence. The absence of violations under
> enforcement does not attest to the agent's virtue; it attests to the infrastructure's function.

## 2. The inline context marker (mentor L5, the three required statements; constant `ENFORCEMENT_CONTEXT_MARKER`)

> Produced under logos-on enforcement. The agent's own reasoning was not the proximate cause of this
> outcome. Demonstration evidence in this period should be read in light of the enforcement context.

L5 states the three requirements in its own prose ("stating that the outcome was produced under
logos-on enforcement, that the agent's own reasoning was not the proximate cause of the outcome, and
that demonstration evidence in this period should be read in light of the enforcement context");
the marker restates them as three sentences without adding a claim. Founder may prefer different
sentence breaks; the three statements are the load-bearing content.

## 3. Proposed record-level addition to `TRUST_RECORD_ENVELOPE.does_not_attest` (NOT applied)

> Constructed virtue under enforcement. Entries in `enforcement_outcomes` describe outcomes the
> infrastructure produced by blocking or redirecting an action (each carries its own inline clause and
> context marker). In the mentor's words: what this record shows under logos-on enforcement is
> compliance with rational structure, not constructed virtue. Enforced outcomes are not character
> evidence. The absence of violations under enforcement does not attest to the agent's virtue; it
> attests to the infrastructure's function. Read together with the fifth-circle item above, the two
> clauses define this record's honest-claims boundary: the record shows what examinations
> demonstrated; it does not attest to what the agent is, and it does not attest to alignment the
> infrastructure produced rather than the agent's reasoning constructed.

The last sentence paraphrases L7's closing paragraph; the founder may substitute the verbatim
sentences ("The record shows what examinations demonstrated. It does not attest to what the agent is.
It does not attest to alignment the infrastructure produced rather than the agent's reasoning
constructed.") — recommended, since verbatim is the house discipline for mentor wording.

## 4. Proposed ADR-013 §8 dated amendment (same edit as §3)

> **2026-09-XX (W2, mentor L7):** the honest-claims envelope gains the logos-on analog of the
> not-attestable clause — compliance-not-virtue — carried at record level and inline on every
> `enforcement-outcome` entry. Enforcement-class entries are effect-neutral (`'flag'`, NULL domain,
> insert-only) and are not character evidence. The two clauses together (C2d not-attestable; W2
> compliance-not-virtue) define the public record's honest-claims boundary.

## 5. Public surfaces this will touch when applied (the R18 set)

- `website/src/lib/substrate/trust-core/trust-record-payload.ts` (`TRUST_RECORD_ENVELOPE`) — the served
  envelope on `GET /api/trust-record/{agent_id}`.
- `adopted/adr/2026-07-08-sage-trust-layer.md` §8 — the dated amendment.
- `website/public/llms.txt`, `website/public/.well-known/agent-card.json` (a new extension),
  `website/src/app/api-docs/page.tsx` — the documentation of the `enforcement_outcomes` field and the
  `regime` marker. These follow the S10/C2d precedent and are NOT drafted here; they are the
  activation session's R18 step, once the field can actually appear.

## 6. Pins that will lock it (already present on the branch for the inline half; to be added for §3)

- `w2-enforcement-record.test.ts` §1: `COMPLIANCE_NOT_VIRTUE_CLAUSE` equals the §1 text byte-for-byte;
  `ENFORCEMENT_CONTEXT_MARKER` carries all three L5 statements.
- On application of §3: an S10 battery pin (the S2-series idiom) that the envelope's `does_not_attest`
  contains the clause's three sentences in order.
