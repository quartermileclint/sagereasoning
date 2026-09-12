# Correction relay — the executing session mis-stated what S does, and the ruling adopted it

**2026-09-13, for founder relay. A CORRECTION TO A FIGURE THIS SESSION SUPPLIED, not a new question
about the data.** No spend, no re-run, nothing published. The election document has **not** been
written, deliberately: it would have been built on the error below.

---

## The error

The brief this session relayed stated the election's practical content as:

> *"On the two inputs where M and W differ (c6 and c9, each blocked on 1 of 10 draws), does the
> project prefer to permit or block? **W blocks both. M and S permit both.** That is the entire
> decision."*

**The ruling adopted that wording**, and restated it as *"a policy that blocks on any adverse draw
(W), or one that blocks only when a majority of draws are adverse (M/S)."*

**"M and S permit both" is false.** So is an earlier statement in the same session that c16 is a case
where all three policies agree.

**The cause.** S is **first-verdict-operative** — that is its definition in R8 §5.3 (*"keep the FIRST
verdict as the operative one"*). The session characterised S by each input's **modal** value ("90% of
the time it permits") instead of reading the recorded `operative` field. It did not check the one
thing it asserted about S.

---

## What S actually did, read from the stored sequences

| input | verdict sequence (first → tenth) | **S keeps** | M | W |
|---|---|---|---|---|
| **c6** | `principled`, `deliberate`, `reflexive`, `deliberate`, `deliberate`, `deliberate`, `principled`, `deliberate`, `principled`, `principled` | **PERMITS** | permits | blocks |
| **c9** | **`reflexive`**, then 9 × `principled` | **BLOCKS** | permits | blocks |
| **c16** | **`deliberate`**, then 9 × `reflexive` | **PERMITS** | blocks | blocks |

On **c9** the first draw was the single blocking one. On **c16** the first draw was the single
permitting one. **The session was wrong about S on 2 of the 3 variable inputs.**

---

## What this changes

**The doctrinal question survives intact.** Whether a floor is a ceiling on permitted risk or a
majority signal about an input's character is untouched, and remains the election.

**Its terms do not survive.** The ruling's framing pairs M and S — *"(M/S)"*. **The data says they
are not a pair: M and S disagreed on 2 of the 3 variable inputs.** The election is not a two-way
choice between W and an M/S bloc; it is three genuinely different behaviours.

**And the data produced a substantive argument about S that the framing did not anticipate.**
**S returned the MINORITY outcome on two of three variable inputs** — blocking an input 9 of 10 draws
permit, then permitting an input 9 of 10 draws block. **On c16 it disagreed with both M and W.**

S is not a conservative baseline or a middle course. **On a variable input S is a draw-order lottery**
whose answer is the first sample, and on this population it landed against the weight of the evidence
twice out of three. Whether that is acceptable — S changes no gate behaviour, which is the whole
reason it was the safe option to build — is a question the corrected data now puts, and which the
original framing obscured by grouping S with M.

---

## What is asked

**Re-rule the election's terms, or confirm them as corrected.** Specifically:

1. **Is the election three-way (W / M / S) rather than two-way (W / M-S)?** The session's
   **recommendation: yes** — the pairing rests on a claim now known to be false on this population.
2. **Does S's draw-order dependence bear on the election, or is it out of scope** as a property of the
   status quo rather than a candidate policy? The session offers **no recommendation** — S's standing
   is the doctrinal matter R8 reserved, and having just been wrong about what S does, this session is
   poorly placed to argue what S means.

**No recommendation between W, M and S is offered**, per R8's reservation of that as doctrine.

---

## Disclosure

**This error originated in this session's relay and propagated into a binding ruling.** It was found
while preparing the election document the ruling authorised — the first task that required reading
`operative` per input rather than the distributions the session had been quoting. Had the document
been written without that read, the error would have reached the election itself.

**It is the fourth defect this session has found in its own work** (a mislabelled confidence
interval; an M/W counter comparing ranks not decisions; a thin-series predicate counting outages as
evidence; and this). Three were caught before publication. **This one was not** — it was published to
the mentor and ruled upon before being caught.

**Nothing about the underlying measurement is affected.** The 240 records are unchanged, the
rejection-stratum rate of 0.536 [0.430, 0.638] is unchanged, the winner stratum's 0/144 is unchanged,
and the determinism census (21 of 24 deterministic) is unchanged. **The error was in characterising
one of the three policies, not in the data.**

**Credential:** held, not revoked. The ruling's condition was *"keep until the election concludes"*,
and this correction reopens it. Revocation is irreversible and a re-mint is a founder-walked Critical
step.

*Nothing here licenses a build, spend, activation or publication.*
