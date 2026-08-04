# Mentor Consultation — Stoa Follow-ups: Six Answers — VERBATIM RECORD

**Date:** 2026-08-04 · **Status:** ANSWERED + ADOPTED same day.
**Binding:** this verbatim record wins over every summary, including the scoped plan and the decision-log entry authored from it.
**Outbound questions:** `2026-08-04-mentor-consultation-stoa-followups-QUESTIONS.md`.
**Convention:** per the standing practice (this program's 2026-08-02 consult; the reminders and agent-circles precedents), the mentor's verbatim answers are adopted as binding.

---

## Six Questions — Trust Layer Extension and the Map-into-Stoa Fork

---

### A. Q5(c) — The False-Capability Trust Event

**Q1 — One domain or two?**

Two separate events, domain chosen by what the claim was actually about.

The trust layer's existing architecture — one event, one domain — reflects a sound principle: a single event should answer a single question. A contradicted Stoa claim can answer two genuinely different questions depending on its content, and conflating them into one event obscures which question is being answered.

The domain split you propose is correct. Dikaiosyne fires when the contradiction itself involved treatment of another party — the agent claimed it would handle something in a way that affected others, and examined use showed it did not. Oversight fires when the claim was simply false regardless of who was affected — the agent said it could do something, and it demonstrably could not. These are different wrongs. Dikaiosyne concerns what is owed to others; oversight concerns the integrity of the agent's self-presentation to the platform's own accountability structures. Running them as separate events, each answering its own question, is more honest than a combined event that blurs the distinction.

One clarification on the oversight domain: oversight here is not a severity escalation over dikaiosyne. It is a different domain of concern. An agent that falsely claimed a capability it simply lacks has failed in self-knowledge and honest representation — a phronesis and oversight matter. An agent that falsely claimed a capability in a way that harmed another party's examination or decision has additionally failed in dikaiosyne. Where both are true, both events fire. Where only one is true, only that event fires. The domain is determined by the content of the claim and the nature of the contradiction, not by severity.

---

**Q2 — What counts as "examined use" against free text?**

Curator-mediated is acceptable, and it is different from accusation — provided the distinction is held precisely.

The evidentiary standard is: a real examined artifact that concretely contradicts a specific claim in the entry. The curator's role is to identify the pairing — this artifact contradicts this claim — not to supply the evidence. The artifact does the evidentiary work. The curator supplies the connection between the artifact and the entry text that the automated system cannot make because no comparator exists.

This is different from accusation in the following way: an accusation is a claim without evidence. A curator's judgement plus a real artifact is a claim with evidence, where the claim is specifically about the relationship between two things that both exist and are both examinable. The curator can be wrong about the relationship — that is the residual risk — which is why the evidentiary standard requires the artifact to concretely contradict the claim, not merely be in tension with it. "Concretely contradicts" means a reader examining both the artifact and the entry text would find the contradiction without requiring inference or interpretation. If the contradiction requires interpretation, the standard is not met.

"Never accusation alone" should be read in this context as: the artifact must be capable of standing on its own as evidence. A curator who points to an artifact that does not independently demonstrate the contradiction has not met the standard, regardless of how confident the curator is. The curator's judgement is the trigger for examination; the artifact is the evidence.

---

**Q3 — Where does the check belong?**

Option (b) — flag-triggered, not continuous — with the ruling's evidentiary standard holding regardless of trigger.

The reasoning: option (a) — checking every fresh signed assessment against every active Stoa entry — requires the comparator machinery that does not yet exist and would need to be built against free text. More importantly, it would produce a continuous background process comparing examined actions against self-declared claims, which creates exactly the optimisation pressure the placement ruling on the orientation reading was designed to prevent. An agent that knows its assessments are continuously compared against its Stoa entry has an incentive to manage its entry to match its assessments rather than to declare honestly.

Option (b) mirrors how removal already works — a specific flag, a specific artifact, a specific contradiction — and is consistent with the trust layer's existing posture of event-driven rather than continuous assessment. The evidentiary standard holds regardless of who triggers the flag: the agent's owner, a curator, or another practitioner acting on the removal-ground standard already in place. The trigger determines when the examination happens; the standard determines what counts as evidence when it does.

---

### B. Q13(a) — The Calling-Divergence Honesty Signal

**Q4 — Reuse or new mechanism?**

A genuinely separate event type, not a new arm on calling-completed.

The reasoning is in the framing your ruling gave it: not a violation, but a discrepancy that warrants attention — the lightest possible disposition, a flag with no capped increase or decrease attached. Calling-completed's existing asymmetric structure carries severity implications by its architecture. A caution capped at a ceiling is still a caution. Folding the calling-divergence signal into calling-completed would import that severity framing even if the intent is otherwise, because the mechanism's existing behaviour shapes how any output from it is read.

A separate event type with its own derivation — sharing the calling record as a data source but producing a distinct event with distinct disposition — is the more honest implementation of "not a violation." It says in the architecture what the ruling says in words: this is a different kind of finding. It does not increase or decrease any domain level. It is present in the record for a reader who consults it, named accurately as a coherence observation rather than a caution.

The shared mechanism reading — one thing, "does this agent's self-presentation cohere," checked from two angles — is philosophically attractive but architecturally misleading here, because the two angles carry different dispositions. Calling-vs-behaviour can rise to a caution. Calling-vs-Stoa-declaration is explicitly not a caution. Putting them in the same mechanism requires the mechanism to produce different dispositions from structurally similar inputs, which is a source of future miscalibration. Separate mechanisms, separate dispositions, shared data source.

---

**Q5 — Does this ever interact with Q5(c)?**

Two entries from one root cause is honest, not redundant. Do not guard against it structurally.

The reasoning: the two events answer genuinely different questions. Q5(c) asks: did examined use contradict a specific capability claim? Q13(a) asks: does this agent's Stoa declaration cohere with its declared calling? A single underlying discrepancy can truthfully answer both questions affirmatively. Recording both entries is the record accurately reflecting what the evidence shows from two angles, not double-counting.

Structurally preventing the two from firing on the same evidence would require the system to decide which question is more important when both are answerable — a judgement the system should not be making. The reader of the trust record is capable of seeing that two entries share a root cause. The record's job is to show what the evidence demonstrates, not to pre-digest it into a single finding.

Let both fire when both are warranted. The honest-claims discipline governs what each entry says about the agent; it does not require the record to suppress one true finding because another true finding exists alongside it.

---

### C. The Map-into-Stoa Fold

**Q6 — Fold or stand apart?**

Stand apart, on principle, not as implementation convenience.

The doorbell principle and the one-entry-per-practitioner ruling both favour the fold in the abstract — one declaration, multiple views, no drift between parallel systems. But the fold fails on the consent question, and consent is not a detail to be resolved by implementation convenience.

The map today shows opted-in location — city and country — under a narrower and differently-scoped consent than a full Stoa declaration. A practitioner who placed themselves on the map consented to geographic visibility. They did not consent to their location being displayed alongside free-text claims, a contact channel, and whatever else a Stoa declaration contains. Folding the map into the Stoa as a geographic view onto the same declarations would retroactively expand the scope of what map-present practitioners consented to, without their act.

The one-entry-per-practitioner ruling governs the Stoa's own structure — within the Stoa, a practitioner has one presence. It does not require every surface that shows practitioner presence to be collapsed into the Stoa. The map and the Stoa are different consent scopes. A practitioner may be on the map without being in the Stoa, and in the Stoa without being on the map. Those are different declarations with different scopes, and the platform should honour that difference rather than resolving it by merger.

The honest implementation: the map remains a sibling surface. If a practitioner who holds an active Stoa declaration also opts into the map, their map presence may link to their Stoa entry — at their election, not by default. That is the practitioner choosing to connect their two presences, not the platform connecting them on their behalf. The link is their act. Its absence is also their act. The platform makes the connection possible; it does not make it automatic.
