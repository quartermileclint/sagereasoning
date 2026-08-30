# ⚠ SUPERSEDED — `2026-08-30-verdict-variance-disclosure-R18-SIGNOFF-PACKAGE.md`

**Read this before reading, quoting, or applying anything from that package.**

**Written 2026-08-31 as a SIBLING file, deliberately.** The signed package is not edited. A prior
session had inserted a supersession banner into it on its own judgement and disclosed the fact; on
2026-08-31 the founder elected to restore the artifact and record the supersession here instead.
**Restoring a signed artifact is not editing it; writing into one is.**

**Precisely what it was restored to.** The package is byte-identical to its state at `3cca0b7` — the
last change made to it by an authorised act, being the founder's own record that the mentor had
released the hold. It is *not* byte-identical to the moment of signature at `3387f0a`, because
`3cca0b7` legitimately updated its status header afterwards. The banner (`683e07a`, 21 lines) is the
only content removed. This distinction is stated rather than glossed because a document whose
subject is a false precision claim should not open with one of its own.

## Status: SUPERSEDED IN PART, and more widely than the earlier banner said

The 2026-08-30 D6a sweep **measured the rate that package repeatedly asserts is unmeasured**, and the
measured disclosure went live on 2026-08-31. Superseded:

| § | Elected? | Falsified content | Superseded by |
|---|---|---|---|
| **§3** | signed | *"Its rate has not been measured"*; *"an instrument to measure it is scheduled"* | revised wording (a) |
| **§4** | Ordering step 1 | *"The item publishes no rate"*; *"the observed 1-in-10 figure"*; the DQ-2 location obligation; "BEFORE the measuring instrument is built" | revised wording (e) → **ADR-013 §8, 2026-08-31 amendment** |
| **§5** | signed | **pin S2-49** (`'Its rate has not been measured'`) | **RETIRED**; S2-51 is its inverse guard |
| **§6a** | signed | rate-unmeasured clause | revised wording (b) |
| **§6b** | signed | `"rate": "not measured"`; `"rate_location": "not yet determined"` | revised wording (c) |
| **§6c** | signed | *"rate not yet measured"* | revised wording (d) |
| **§7** | ELECTED IN FULL | *"has not been measured and none is claimed here"*; *"a measurement is scheduled"* | revised wording (f) |
| **§8** | ELECTED "TAKE IT" | *"Its rate is unmeasured"* | revised wording (g) |

**Fourteen falsified strings across seven sections and a battery pin.**

**The earlier banner said four, and that undercount was itself the defect.** It counted only the
sections the first revision had chosen to rewrite, leaving §4, §7, §8 and pin S2-49 still governing
with falsified content — §7 targeting the *same `llms.txt` file* as the replacement trust-record
bullet, so applying both would have published "aggregate disagreement rate 12%" and "the rate has not
been measured" in one live document. **PR19 found this on 2026-08-31, before anything was applied.**

## What in that package still governs

Its §"Ordering", commit sequencing, and pins **S2-48** and **S2-50** are unaffected and were followed.
It remains the record of what the founder signed on the pre-sweep wording, and that traceability is
the reason it is preserved unedited rather than corrected in place.

## Where the live wording is

- `2026-08-30-verdict-variance-disclosure-REVISED-WORDING-FOR-SIGNATURE.md` — approved 2026-08-31, applied
- `D-VERDICT-VARIANCE-DISCLOSURE-APPLIED-CARRYING-MEASURED-RATE-2026-08-31` — the decision-log record
- ADR-013 §8, **2026-08-31 amendment** — the governing ADR text
- Binding above all of these: `2026-08-30-mentor-ruling-verdict-variance-rate-presentation-verbatim.md`
