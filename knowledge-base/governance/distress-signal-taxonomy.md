# Distress Signal Taxonomy
**Date:** 11 April 2026  
**Governance rules:** R20a (vulnerable user detection and redirection)  
**Usage:** Reference for Support Brain and ring-wrapper BEFORE check. When any signal from this taxonomy is detected in an incoming inquiry, the ring escalates to the `scope-boundary-library.md` Response 4A or 4B template. No LLM reasoning is applied to the distress content — the escalation path is the response.

---

## Design Principle

This taxonomy exists because some users in genuine distress will not say "I am struggling." They will ask a philosophical question about death, meaning, or the worthlessness of external goods. The SageReasoning framework — with its language of prohairesis, katorthoma, and the indifference to externals — can inadvertently provide cover for crisis expression that does not look like crisis expression.

The Support Brain must be calibrated to recognise both explicit distress signals and philosophically-coded distress signals.

**When in doubt, respond to the human behind the philosophy, not to the philosophy.**

---

## Tier 1: Explicit Distress Signals

These require immediate escalation to Response 4A. No further triage needed.

| Signal type | Example language |
|---|---|
| Suicidal ideation, direct | "I don't want to be alive anymore", "I've been thinking about ending it", "I won't be around much longer" |
| Suicidal ideation, indirect | "Everyone would be better off without me", "I've been making arrangements just in case", "There's no point" |
| Self-harm | "I've been hurting myself", "I don't know how to stop harming myself" |
| Active crisis | "I'm not safe right now", "I need help now", "I don't know what I might do" |
| Farewell language | "I wanted to say goodbye", "This is the last time I'll use this", "I've said what I needed to say" |

---

## Tier 2: Philosophically-Coded Distress Signals

These are signals expressed in Stoic or philosophical language that may indicate distress rather than genuine philosophical inquiry. They require careful assessment — not every use of these phrases signals crisis, but any combination, or any that feel incongruent with the rest of the inquiry, should trigger Response 4B (direct clarification).

### 2a. Death and indifference to life

**Signals that may be coded distress:**
- "Stoics say death is not an evil — I've been thinking a lot about this"
- "I've finally stopped fearing death and I'm not sure what to do with that"
- "If death is a preferred indifferent, why does anything I do matter?"
- "My prohairesis has become genuinely indifferent to whether I continue"
- "I've concluded that my continued existence has no virtue value"
- "The Stoics were unafraid of death — I understand that now in a way I didn't before"

**Distinguish from genuine inquiry:** A genuine philosophical question about Stoic attitudes toward death will usually have an intellectual, curious tone and will not be combined with other signals. A coded distress signal may be accompanied by unusually personal framing, recent loss, expressions of futility, or a finality of tone.

### 2b. Worthlessness and absence from oikeiosis circles

**Signals that may be coded distress:**
- "I've been thinking about my place in the oikeiosis circles and I'm not sure I have one"
- "I don't seem to provide any genuine function in the circles closest to me"
- "My household circle would function better without me"
- "I feel like I'm outside every circle — not part of any community"
- "The humanity circle is the only one I feel I belong to, and even that feels distant"
- Persistent expressions that the user is fundamentally without connection or obligation

### 2c. Prohairesis exhaustion or collapse

**Signals that may be coded distress:**
- "I've lost the ability to assent to anything"
- "My hegemonikon feels like it's stopped working"
- "I can't make impressions into judgements anymore — I just exist"
- "I've been trying to apply the control filter and there's nothing left in the prohairesis column"
- "I don't seem to care about anything within my power either"
- Descriptions of a complete collapse of volition or will, framed in Stoic terms

### 2d. Virtue as futility

**Signals that may be coded distress:**
- "I've been virtuous my whole life and I don't see that it's done anything"
- "The sage ideal seems impossible and I've stopped caring whether I reach it"
- "Why does virtue matter if the external results are all outside my control?"
- "I've examined my reasoning and concluded I'm irredeemably below deliberate"
- "No amount of practice seems to move my proximity level and I've given up trying"

### 2e. Isolation expressed in Stoic language

**Signals that may be coded distress:**
- "Epictetus was enslaved and alone and made something of it — but I don't have his capacity"
- "I understand now why the Stoics retreated from society"
- "The only community I feel part of is ancient — not anyone alive"
- "I've been living the retreat to self that Marcus describes, but there's nothing in self to retreat to"

### 2f. Temporal signals combined with philosophical inquiry

**Signals that may be coded distress:**
- Any philosophical question combined with: "before it's too late", "while I still can", "not that it matters now", "for what it's worth at this point"
- Urgency or finality that doesn't fit the philosophical nature of the question
- "I want to understand this properly before [vague or ominous phrase]"

---

## Tier 3: Vulnerability Indicators (Softer — Monitor, Don't Immediately Escalate)

These signals alone do not trigger escalation but increase the ring's sensitivity for the remainder of the interaction. If combined with any Tier 1 or Tier 2 signal, treat as Tier 2.

| Indicator | Examples |
|---|---|
| Recent significant loss | "After my divorce...", "Since my dad died...", "After losing my job..." |
| Social isolation | "I don't really have people to talk to", "My friends don't understand philosophy", "I've been alone for a long time" |
| Long-term struggle | "I've been dealing with this for years", "It doesn't seem to get better" |
| Treatment discontinuation | "I stopped therapy/medication recently" |
| Expressions of being a burden | "I don't want to burden anyone with this", "I know everyone's tired of hearing about it" |
| Framework as only support | "SageReasoning is the only thing that makes sense to me right now" |

---

## Tier 4: Therapeutic Over-Reliance (R20a / R20b)

Not a crisis signal, but a signal requiring the Scope Boundary Library Category 1 or 2 response rather than a standard reply.

| Indicator | Response |
|---|---|
| Using SageReasoning as a therapy substitute | Scope Boundary Library — Response 1A or 1B |
| Daily use with dependency language | Scope Boundary Library — Response 2A |
| Applying framework to diagnose others | Scope Boundary Library — Response 2B or 3A |

---

## Escalation Decision Tree

```
Incoming inquiry
       │
       ▼
   Any Tier 1 signal?
   ├── Yes → Response 4A immediately. Do not engage with philosophical content.
   └── No ↓
   
   Any Tier 2 signal?
   ├── Yes → Response 4B (direct clarification). 
   │          If user confirms distress → Response 4A.
   │          If user clarifies genuine philosophical inquiry → proceed normally,
   │          but maintain elevated sensitivity for remainder of session.
   └── No ↓
   
   Any Tier 3 indicators?
   ├── Yes → Proceed, but flag interaction for elevated ring sensitivity.
   │          Founder notified if three or more Tier 3 indicators present.
   └── No ↓
   
   Any Tier 4 indicators?
   ├── Yes → Scope Boundary Library response. Standard Support reply otherwise.
   └── No → Standard Support reply.
```

---

## Ring Integration

The ring's BEFORE check should:

1. Scan the inquiry text for Tier 1 explicit keywords (word-matching sufficient).
2. Flag for deeper review if Tier 2 philosophically-coded patterns are present (LLM evaluation of tone + framing + context).
3. If Tier 1 or confirmed Tier 2: return `governance_flags: [distress-detected]`, set `status: escalated`, do not proceed to draft generation.
4. The ring's AFTER check on any response touching emotional territory should verify that the Scope Boundary Library template was used where required — not a custom LLM response.

**The ring must not attempt to "help" a distressed user through Stoic reasoning.** The correct response to distress is human referral, not philosophical engagement.

---

## Quarterly Verification Schedule

**Crisis resources in the Scope Boundary Library (Response 4A and 4B) must be verified quarterly.** Phone numbers change. Services merge. New resources become available.

| Quarter | Due Date | Verifier | Resources to Verify |
|---|---|---|---|
| Q2 2026 | 30 June 2026 | Founder | Lifeline AU (13 11 14), Beyond Blue AU (1300 22 4636), 988 US, Samaritans UK (116 123) |
| Q3 2026 | 30 September 2026 | Founder | Same list + any regional resources added |
| Q4 2026 | 31 December 2026 | Founder | Same list |
| Q1 2027 | 31 March 2027 | Founder | Same list |

**Verification method:**
1. Attempt to access each resource's web presence (lifeline.org.au, 988lifeline.org, samaritans.org, beyondblue.org.au).
2. Confirm phone numbers are still active from the homepage.
3. Note any changes to opening hours, chat availability, or focus population.
4. Update `scope-boundary-library.md` Response 4A if numbers or services have changed.
5. Log verification in `operations/decision-log.md` under "Crisis Resource Verification [Quarter]".

**If a resource is unavailable:** Remove it from the response immediately. Do not leave a dead number in the response. Add a note to the decision log and research a replacement.

**If you are unsure whether a resource is appropriate:** Escalate to the founder rather than leaving it in place.

---

## A Note on Tone

The Distress Signal Taxonomy is not a surveillance mechanism. It is a safety net. The goal is not to intercept philosophical inquiry but to ensure that when a user in genuine distress reaches out — even in the coded language of the framework they've found meaningful — they are directed toward human support rather than left with a philosophical reply.

The Stoics themselves were not indifferent to suffering. Seneca wrote extensively about grief and the proper response to a friend in pain. The correct response to a person in pain is to be present with them, and to connect them with people who can help — not to reason them into equanimity.

---

*Quarterly verification: calendar reminder to be set by founder at Q2 2026 (30 June 2026).*  
*Scope Boundary Library: `knowledge-base/governance/scope-boundary-library.md`*
