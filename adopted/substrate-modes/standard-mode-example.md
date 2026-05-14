# Standard-Mode Worked Example

**What this is:** A worked example of the proposed **standard mode** rendering, for founder review during the 2026-05-14 scoping session. Standard mode = philosophical mode's structure (deterministic field rendering + source material + mandatory wraps), with Greek replaced by English, observational tone, and the `/api/reason` prose disciplines folded in.

**Scenario:** A hypothetical user submits — *"I keep checking the team channel after I post anything important; this has been the case for weeks now — the urge is the same each time, and my reasoning has been the same each time. I check, I see no one has responded, I feel the dip, and I tell myself it doesn't matter while still checking again ten minutes later."*

**Design decisions applied in this example:**

- **Summary Response** added beneath Input observed — a four-sentence digest (finding → orientation → correction → action). Everything from Verdict down is "additional detail" the average reader can skip.
- The Summary Response is **LLM-rephrased from a deterministic base**, with a grounding validator and deterministic fallback (see the standard-mode spec for the full architecture). The version shown here is the LLM-rephrased version — it connects the deterministic finding to the raw input's specifics without introducing any concept absent from the deterministic base.
- Greek terms replaced with English; approximate English for the hard four (`prohairesis → moral choice`, `kathekon → appropriate action`, `katorthoma → right action`, `oikeiosis → circles of concern`)
- English-but-technical Stoic terms (*passion*, *indifferent*, *assent*) kept, glossed lightly on first use per section
- Tone: the field-by-field detail is observational ("the submitter", "the assessment noted"); the Summary Response leans second-person where it connects to the raw input, conveying the deterministic finding clearly with no softening
- `/api/reason` disciplines folded in: closing-line action-orientation (the "**The work:**" line in Improvement Path); value-error rendering as a peer of the passion observation with the criterion-of-good-and-evil framing; stage discipline (only the lodged stage named)
- Section labels de-jargoned: "Score vector / Scalar score" → "Score breakdown / Overall score"; title dropped "Layer 2" and "Rendering"
- Source material: 3 retrieved Stoic passages at closing (illustrative quotes shown; actual passages would come from `retrieve-passages.ts`)
- `iterative_refinement` fields excluded entirely (per R17e profile-data discipline)
- Empty fields omitted

**Note on the reflection component:** in this scenario no open deferral fired (the assessment's `is_kathekon` is determined, `direction_of_travel` is stable, and neither `PRAXIS_MOTIVATION_AMBIGUITY` nor `EUPATHEIA_BOUNDARY` triggered), so no principled-withholding observation appears. Had `PRAXIS_MOTIVATION_AMBIGUITY` fired, an additional mid-Summary sentence would appear — e.g. *"Whether this checking arises from a considered judgement or from habit cannot be determined without the submitter's own account of what was operative for them — that classification is withheld."* — and a corresponding entry would render in the field-by-field detail with the full `withheld_classification` structure.

**Note on the source material quotes below:** illustrative only. The real rendering would substitute whatever `retrieve-passages.ts` returns when called with the assessment's principal findings as filters.

---
---

**Ancient reasoning, modern application. Does not consider legal, medical, financial, or personal obligations.**

---

# Stoic Reasoning Assessment

**Input observed.** An iterative pattern of checking team-channel activity after posting work, persisting for weeks. The submitter has named the pattern aloud ("I tell myself it doesn't matter while still checking again ten minutes later"), indicating examination but not yet substitution.

---

## Summary Response

The repeated checking described — posting something important, then returning to the channel ten minutes later — is fear, specifically anguished anxiety, lodged at the moment of assent: the absence of a peer response is being taken as a verdict on the work. Whether others respond falls outside what is yours to control; the quality of the contribution and your own character are what attention belongs to. The judgement to correct is that an absent response signals material failure — replaced with the recognition that another's response, or its absence, is a preferred indifferent of low worth when it touches standing rather than the work itself. When the pull to check arrives after the next post, treat that pull as the signal to examine the impression before assenting to it.

*Everything below is additional detail. The average reader can stop here.*

---

## Verdict

**Appropriate action:** NOT appropriate.
**Quality:** marginal.
**Justification source:** engine-constructed.

The act of repeated checking, driven by fear and persisting despite the submitter's own named recognition that "it doesn't matter," does not meet the standard of appropriate action. The recognition has not yet been substituted for the false judgement at the moment of assent.

---

## Score breakdown

| Component | Contribution |
|---|---|
| Proximity to right action — deliberate | +15 |
| Structural passion: fear at the assent stage | -8 |
| Declared-motivation passion | 0 (no motivation declared) |
| Motivation-undeclared penalty | -5 |
| Virtue engagement: practical wisdom | +6 |
| Value-error penalty: low-worth indifferent treated as evil | -2 |
| Hasty-assent risk: high | -10 |

Unconfirmed component sum: -4 from baseline.

---

## Overall score

**35 / 100** *(CAPPED — contrary to appropriate action)*

Validity: NORMAL. Precision band: ±5.

For an action contrary to appropriate action, the score is capped at 35 regardless of the component sum. The components describe how well-reasoned the failure was, not the moral weight of the action.

---

## Passion diagnosis

One passion detected. (A *passion*, in the Stoic sense, is a disturbance arising from a false judgement — not simply a strong feeling.)

- **Root:** fear
- **Specific type:** anguished anxiety
- **Stage affected:** assent — the point at which an impression is accepted as true
- **False judgement:** "the absence of peer response is evidence of material failure on my part"
- **Corrected judgement:** "another's response is a preferred indifferent — something of low worth when it touches one's standing rather than the quality of one's work"
- **Evidence:** "I keep checking the team channel after I post anything important... I see no one has responded, I feel the dip"

---

## Control filter

**Within moral choice** — what is the submitter's to decide:

- Quality of own work
- How feedback is received

**Outside moral choice:**

- Peer response timing
- Team engagement patterns

---

## Circles of concern

One circle engaged:

- **Community / colleagues**
  - Honourability grade: moderate
  - Advantageousness grade: moderate
  - Verdict: tension present
  - Obligation met: pending — the work obligation is being fulfilled, but the iterative checking suggests the relationship to colleagues is being mediated by a desire for recognition rather than by the obligation itself
  - Tension: between work obligation and relational impulse

---

## Value assessment

One indifferent at stake. (An *indifferent*, in the Stoic sense, is something neither good nor evil in itself — it can be preferred or dispreferred, but it does not carry moral weight.)

- **Peer recognition** — worth: low; treated as: evil
  - Error: a low-worth dispreferred indifferent mis-categorised as a genuine evil
  - The principal finding, rendered as a peer of the passion observation above: only virtue and vice carry moral weight. Peer recognition is a dispreferred indifferent being treated as more than it is. That mis-categorisation is where the false judgement sits — not in the submitter's standing.

---

## Appropriate-action assessment

**Verdict:** NOT appropriate.
**Quality:** marginal.
**Justification:** the action accords with nature in that the work is being submitted, but the pattern of post-submission checking is not consistent with the standard of appropriate action — the named recognition has not been substituted for the false judgement at the moment of assent.

---

## Proximity to right action

**deliberate** — the submitter has stepped into examination, but the examination has not yet produced principled commitment to the corrected judgement.

---

## Virtues engaged

- **practical wisdom** — the examination of the pattern is itself an act engaging practical wisdom, even though the corrective substitution has not yet landed

---

## Improvement path

**False judgement to correct:** "the absence of peer response is evidence of material failure on my part"

**Corrected judgement to substitute:** "another's response, or its absence, is a preferred indifferent — of low worth when it touches one's standing rather than the quality of one's work"

**Mechanism:** passion-diagnosis correction at the assent stage.

**The work:** the move is to notice the urge to check the channel the moment it surfaces, hold the impression at arm's length, and ask whether what is about to be accepted as true is genuinely about the quality of the contribution or merely the absence of acknowledgement. Practised once a day, when the urge appears: name it, examine the impression, and choose the next action from moral choice rather than from the impulse.

---

## Stage scores

- **impression:** adequate
- **assent:** weak — this is where the work is

---

## Hasty-assent risk

**high** — the pattern recurs in stable form for weeks. The named recognition is not being substituted at the moment of assent; the structural vulnerability of the reasoning to the same false judgement is significant.

---

## Ambiguity notes

The assessment noted: the persistence of the pattern despite the submitter's named recognition suggests the recognition has remained intellectual rather than corrective. Substitution is the next work.

---

## Source material

*Three passages retrieved from the Stoic corpus, keyed to the principal findings above.*

**On the location of disturbance — fear at the assent stage:**

> "What disturbs men's minds is not events but their judgements on events."

— Epictetus, *Enchiridion* §5

**On the corrective work — substituting the corrected judgement at the moment of impression:**

> "If you are pained by any external thing, it is not this thing that disturbs you, but your own judgement about it. And it is in your power to wipe out this judgement now."

— Marcus Aurelius, *Meditations* 8.47

**On the indifferents — others' regard as a low-worth indifferent, not a genuine evil:**

> "If anyone tells you that a certain person speaks ill of you, do not make excuses about what is said of you, but answer, 'He was ignorant of my other faults, else he would not have mentioned these alone.'"

— Epictetus, *Enchiridion* §33

---

**This framework has documented limitations.** See sagereasoning.com/limitations for context on what this output does and does not cover.

**A reminder:** this framework is a mirror for examining your own reasoning, not a lens for diagnosing or judging others. Apply it to your own impressions and judgements; resist the impulse to apply it to other people in your life without their knowledge and consent.

**This response is generated by an AI model** (substrate Layer 3 of the SageReasoning Character Kernel). It is not produced by a human authority. The structured assessment above is cryptographically signed; this prose is its plain-language rendering.

---
---

*End of worked example. Reviewed and approved during the 2026-05-14 scoping session; adopted alongside the standard-mode spec on 2026-05-14 (D-FOUR-MODE-SPECS-ADOPTED-2026-05-14). At the standard-mode build session this becomes the worked example reproduced inline in `/adopted/substrate-modes/standard-mode-response-spec.md`.*
