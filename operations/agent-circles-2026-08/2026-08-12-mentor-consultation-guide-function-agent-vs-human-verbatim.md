# Mentor consultation — the guide's function for an agent vs. a human practitioner — VERBATIM RECORD

**Date:** 2026-08-12. **Status:** the question is recorded verbatim; the response is the analysis at
`2026-08-12-guide-function-agent-vs-human-practitioner.md`. **No mentor ruling on that analysis has
been received as of this record — its verdicts are the AI's, offered for ruling, not adopted.**

**Second consultation of the day on adjacent ground.** Structural difference 3 below restates
principle 5 of `2026-08-12-mentor-consultation-five-stoic-principles-verbatim.md`; the response
answers it by reference rather than re-deriving it, and names the convergence.

---

## The mentor's question, verbatim

> **Context:** SageReasoning encodes Stoic wisdom into infrastructure that helps any rational agent —
> human or artificial — examine impressions, diagnose false judgements, and progress toward virtue. The
> website serves human practitioners. The API and skill contracts serve agent developers. The Sage
> Assent extends the moral community to include artificial agents. Phase: P0 Foundations. Context
> architecture build complete: Layer 1, 2, and 3 verified live. ATRF governing document live. Q11
> sequence binding.
>
> **Background to this question:** The project has considered new practitioner types from the
> onboarding surface — what does an agent need to know to begin? This question approaches it from the
> other direction: what does the Stoic guide need to do differently once the agent is practising?
> Onboarding is a one-time event. The guide relationship is ongoing. These are structurally different
> questions and the second has not yet been examined directly.
>
> **The question:** How does a Stoic guide function differently for an agent practitioner versus a
> human practitioner — and what are the architectural implications, if any?
>
> **Three structural differences have been identified for examination. Assess each: does it name
> something already encoded in the architecture, expose a design gap, or collapse into something
> already carried? Name the specific architectural location or carried item.**
>
> **1. Examination object.** For a human practitioner, the guide examines the impression as
> experienced — always partially reconstructed, filtered through memory and narrative. The guide works
> beneath the narrative to surface the original impression. For an agent practitioner, the guide
> examines the reasoning trace as recorded — more complete in causal sequence, but opaque about the
> weight given to each step. The guide's question shifts from "what did you actually see?" to "what did
> you assent to, and at which point in the sequence?" The Layer 1 extractor already performs this work.
> Is the guide's response to that extraction currently calibrated for an agent practitioner, or only
> for a human one? If not, is this a design gap or a later-phase item?
>
> **2. Passion diagnosis posture.** For a human practitioner, passion diagnosis is collaborative — the
> practitioner has interior access to their own felt state and can confirm or deny the guide's reading.
> The guide invites self-examination. For an agent practitioner, passion diagnosis is entirely
> inferential — the guide reads the causal structure of the trace and identifies the passion class from
> structural signatures, not from anything the agent reports feeling. The agent cannot confirm or deny
> from interior access; it can only assess whether the causal reading is accurate. This shifts the
> guide's posture from inviting self-examination to presenting a forensic reading for rational
> assessment. Is this posture difference currently reflected anywhere in the architecture, or is it an
> unexamined assumption that the guide functions identically for both practitioner types?
>
> **3. Progress dimension.** For a human practitioner, progress is tracked across the Senecan grades —
> reduction of passions, quality of judgement, stability of disposition, extension of natural
> affiliation — as a developing character, a hexis becoming more stable over time. For an agent
> practitioner, the trust record tracks orientation readings over time, but orientation readings are
> snapshots of current state. The Consciousness and Continuity Obligation named in the ATRF identifies
> accumulated memory as a tractable future build direction. The open question is whether the trust
> record is currently oriented toward measuring current state only, or whether it can support
> developmental trajectory tracking in the Senecan sense. If drift detection — the gradual narrowing of
> discrimination through repeated assent to the same impression class — is absent from the trust
> record's current scope, is this a gap in the trust-record scope or a later-phase item?
>
> **Constraints:** Primary Stoic sources only for doctrinal claims. Architectural claims must reference
> specific components, endpoints, or governing documents by name. Verdict for each structural
> difference must be explicit: already encoded / design gap / collapses into carried item. If any
> finding warrants its own scoping session, name the session tier (code-elevated / governance) and the
> specific question it would answer. Do not pre-answer GS-ATRF-1, GS-ATRF-2, or GS-ATRF-3. Do not expand
> the scope of any open question.

---

## The response given

`2026-08-12-guide-function-agent-vs-human-practitioner.md`.

**Headline:** a premise correction (Layer 3 is **Verified, not Live** — `SUBSTRATE_LAYER3_ENABLED`
unset, 503, scoped out at S7), and a cross-cutting result — **two of the three structural differences
land on that same switched-off layer**, so the guide-function question is largely one architectural
question wearing three faces.

**Verdicts:** (1) **design gap**, one `governance` session proposed to re-open the S7 Layer 3
decision; (2) **already encoded**, and more completely than assumed — both postures run and are
cross-checked by G4 — with the residual collapsing into (1); (3) **partly already encoded** (Senecan
grades *are* agent-side, contrary to a claim the response nearly made and corrected by checking;
AE-1's delta layer is live trajectory machinery), with the drift half **collapsing into** the item
carried from the same morning's five-principles §5, plus Seneca *Letters* 75.8–9 supplied as that
session's criterion (relapse-resistance, not level).

**Nothing in that analysis is adopted.** It licenses no build or flag activation, pre-answers none of
GS-ATRF-1/2/3, and expands no open question.

*End of record.*
