# Mentor question, round 2 — Q1 only: the three actual options, stated as scoped

**Raised 2026-08-26**, returning `2026-08-26-MENTOR-QUESTION-provenance-ledger-identity-and-policy.md`
§1 per the mentor's own instruction: *"If the options are different from what I have named, the
question should return with the three options stated explicitly. I will not rule on a set of options I
am inferring rather than reading."*

**They are different from what was inferred**, in two respects the mentor's guess did not have in
front of it — both real, neither large enough to change which question is being asked, both stated
below so nothing is inferred a second time.

**Already ruled and not re-opened:** F-1's owner+agent-pair scoping stands; no path that requires a bare
credential or an unbounded cross-credential lookup is available. Q2, Q3, and half of Q4 are ruled and
folded into the scoping document (`2026-08-26-provenance-ledger-SCOPE.md §§5,6,9`); this question is
narrower than the round-1 document and concerns Q1 alone.

---

## The three options, exactly as scoped (`SCOPE.md §1.4`), not as guessed

| | Option, verbatim from the scoping document | The mentor's provisional guess, for comparison |
|---|---|---|
| **A** | *"Collapse to one credential per agent carrying both capabilities."* Satisfies the identity rule; is what the UPC design intends; **but reverses the documented least-privilege split** — the harness's two credentials exist so the credential that produces assessments cannot also submit them, and the harness's own code refuses to write when they are the same credential (a guard added deliberately after a HIGH adversarial-review finding). This project has had one credential-exposure incident already; merging enlarges the blast radius of the next one. **A security-posture trade for a provenance mechanism.** | Not named in the guess |
| **B** | *"Relax the ledger's matching so a `credential`-kind entry resolves to an `owner_agent_pair` lookup sharing the agent_id."* This IS the `(null, agent_id)` join the cross-tenant guard forbids. **Already ruled out** by the mentor's standing instruction that no path abandoning owner+agent-pair scoping for a bare-credential or unbounded lookup is available. | Close to the guess's (a)/(b) — but the guess's (a) ("mint under the conflicting identity") and (b) ("use an identity not owner+agent-bound") are two DIFFERENT moves this scoping treated as one, because both land on the same ruled-out surface: (a) would mean minting despite the mismatch (silently degrading enforcement, not a genuine option under Q2's now-ruled two-branch design — a mismatch already refuses); (b) is what B above states directly |
| **C** | *"Accept that split-pair agents are permanently refused, and let the coverage gaps show."* Honest, and F-2 makes it visible. **But scoped generally, across every agent using a split pair — not narrowed to the harness alone.** Consequence as scoped: the project's own reference integration can never mint a trust event under enforcement, and the switch-on threshold (§9's C1) could never clear while any split-pair agent remains active — which is why §9 needed a cohort-freeze or exception mechanism regardless of Q1's answer. | The guess's (c) — *"defer accreditation for the harness until the index constraint is resolved... The harness's own accreditation is not urgent relative to the ledger's coverage of practitioner artifacts."* **This is narrower and better-scoped than option C as originally written**, because it defers ONE named agent's accreditation rather than adopting a general policy toward every split-pair agent, present and future |

## Where the difference matters

**B is already closed** by the standing instruction — it does not need to return.

**A is a real option this document scoped and the guess did not name.** Whether merging the harness's
two credentials into one is an acceptable security trade for provenance verifiability is a founder-level
call this scoping session is not positioned to make, and the guess's provisional ruling (c) did not
weigh it because it was not offered.

**C, as scoped, is broader than the guess's (c), and the guess's narrower framing looks like the better
answer — but that is an observation, not an assumption made here.** The scoping session's C was a
general policy toward every present and future split-pair agent (which is why it required §9's
cohort-freeze machinery to avoid blocking enforcement forever); the guess's (c) is a decision about one
named agent — the harness — deferred until its own configuration resolves, leaving other agents to be
handled by whatever C1's eventual population-wide answer is. **These produce different scoping
consequences:** if the ruling is "defer the harness specifically" rather than "accept permanent refusal
generally," then §9's C1 does not need to treat split-pair agents as a structural, permanent exception
class at all — it can simply exclude the harness by name until its configuration changes, and C1's
population-wide reachability concern (§9, scenario ii) narrows considerably, possibly to nothing, once
the actual population of split-pair agents beyond the harness is known (unmeasured; a founder
prerequisite, not answered here).

## The question

> **Q1, restated. Given the three options as actually scoped — (A) merge the harness's two credentials
> into one, trading the documented least-privilege split for provenance coverage; (B) already ruled out;
> (C) accept permanent refusal for every split-pair agent as a general policy — is the correct ruling
> (C) as scoped, or the narrower move the provisional guess named: defer the harness's own accreditation
> specifically, as a named, single-agent decision, leaving the general population question to be settled
> by however many other split-pair agents turn out to exist? And separately: is (A) — merging the
> harness's credentials — available at all, or does the least-privilege posture it would reverse make it
> unavailable on the same footing as (B)?**

## Verification status

Both option A and the narrowed reading of C were derived from source already cited in the round-1
document and re-checked, not newly asserted: the harness's same-credential refusal
(`close-hook.mjs:152-154`), the 2026-07-17 credential-exposure incident (named in `CLAUDE.md`'s S9 Live
bullet and the incident record), and the uniqueness-index collision on production
(`operations/decision-log.md:15851`). **Not verified and not assertable from a repo session:** how many
agents beyond the harness currently use a split consult/write pair — the population C's breadth actually
depends on. If that population is one (the harness alone), the narrower reading of C and the guess's
(c) may be the same ruling in practice; if it is larger, they are not, and the general-policy question
in C as originally scoped still needs its own answer.

## Cross-references

- `2026-08-26-mentor-ruling-provenance-ledger-q1-q4-verbatim.md` — the ruling this returns to
- `2026-08-26-MENTOR-QUESTION-provenance-ledger-identity-and-policy.md` — round 1, §1
- `2026-08-26-provenance-ledger-SCOPE.md` — §1.4, §9 (both now folded with Q2/Q3/Q4's ruled halves)
