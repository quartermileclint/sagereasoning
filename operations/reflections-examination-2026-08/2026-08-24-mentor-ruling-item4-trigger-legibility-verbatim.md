# Mentor Ruling — Item 4 (Trigger Legibility) — Verbatim

**Date relayed:** 2026-08-24 · **Relayed by:** the founder, in-chat, same thread as the item-4 close.
**Question put:** §5 of `2026-08-24-item4-trigger-legibility-combined-scope.md`, verbatim, per the founder's election that the scope document is the brief.
**Scope of the ruling, as the mentor states it:** the architectural question only. The mentor explicitly declines to rule on the §3.3 redirect-phrase row, naming it *"a founder call, not a mentor call."*

---

### The question restated precisely

Is exposure-keyed trigger plus occasion-varied content the right general answer to the trigger-legibility problem — and if so, is the content-variation mechanism in §4.3 sufficient to pay for it, or does adding a second exposure-keyed instrument to this loop simply relocate the erosion IW-4 already records?

The document correctly identifies that this is the question. It also correctly identifies that the §3.3 table row and its phrase are a founder call, not a mentor call. I will not rule on those. I will rule on the architectural question only.

---

### The ruling

Adding a second exposure-keyed instrument to a loop that already carries one with a measured erosion problem does not solve the trigger-legibility problem. It relocates it, and likely accelerates it. Here is the reasoning.

**IW-4 is a measurement, not a hypothesis.** The at-action advisory's false-positive rate is recorded. The erosion it names is not a predicted future state — it is the current state of an instrument that has already been running. The question asks whether adding a second exposure-keyed instrument to this loop would simply relocate the erosion IW-4 records. The honest answer is: it would do more than relocate it. Two exposure-keyed instruments in the same loop interact. If the first instrument's erosion is driven by frequency — the agent learns to treat the advisory as ambient rather than signal — the second instrument enters a loop that has already been conditioned toward ambient treatment of exposure-keyed prompts. The second instrument's erosion baseline is not the same as the first instrument's starting point. It is lower.

**The content-variation mechanism in §4.3 addresses legibility, not frequency.** Occasion-varied content makes each trigger instance distinguishable from the last. That is a real improvement over uniform content. But the trigger-legibility problem has two components: the content must be legible, and the trigger must be credible. Frequency erodes credibility regardless of content variation. An agent that encounters an exposure-keyed prompt on every action of a certain class will eventually treat the prompt as a structural feature of that action class, not as a signal about this particular action. Content variation slows this but does not prevent it. The mechanism pays for legibility; it does not pay for credibility.

**The interaction between the two instruments is not modelled, and that is load-bearing.** The document names this honestly: "the interaction between them is not modelled here." For a ruling, that gap matters. The at-action hook (H3) already carries the guard and the Gate-2 consult. Adding reflect-turn logic to H3 puts a second instrument on the same path that already carries the most consequential gate in the loop. A defect in the reflect-turn logic reaches the guard path. The document names this correctly. What it does not name is the interaction effect: if the reflect-turn fires on the same action class as the at-action advisory, the agent receives two exposure-keyed prompts in close temporal proximity on the same action. The combined signal is not twice as legible — it is more likely to be treated as a single ambient feature of that action class. The interaction effect runs against the content-variation mechanism's purpose.

**The trust record question is not a detail.** Whether a mid-session reflect fire should count the way a close fire counts is named as a substantive question the scope does not answer. For a ruling on the general architecture, this matters: if mid-session fires count differently, the trust record's per-session reflect surface becomes heterogeneous in a way that is not currently disclosed. If they count the same, the trust record's signal is diluted by fires that occur under different conditions than the close fires the record was designed to capture. Neither resolution is obviously correct, and the fact that the scope does not answer it means the architectural proposal is incomplete at a surface that carries public attestation consequences. **The emission-hooks finding from earlier today makes this more acute, not less** — the trust record's attestation accuracy is already a live concern on a different path.

**PR21's harvest rule write side already outruns the instrument.** This is named in the preamble and it is the most direct evidence against the general answer. If the harvest rule's write side already outruns the instrument that is supposed to govern it, adding a second instrument to the same loop does not close that gap. It adds a second instrument that the harvest rule's write side will also outrun. The problem is not instrument count — it is that the write side's velocity exceeds the instrument's coverage. A second exposure-keyed instrument does not change the velocity.

---

### What the ruling does not foreclose

The ruling is against exposure-keyed trigger plus occasion-varied content as the right general answer to the trigger-legibility problem, given the specific conditions of this loop. It does not foreclose:

**A non-exposure-keyed trigger** — one that fires on a condition other than action class membership. If the trigger condition is more specific and less frequent, the credibility erosion problem is reduced. The content-variation mechanism in §4.3 would then be paying for legibility in a context where credibility is not already compromised by frequency.

**A structural intervention rather than an instrument intervention.** The trigger-legibility problem may be better addressed by changing what the loop does at certain action classes than by adding a prompt that asks the agent to reflect on what it is doing. The at-action hook already carries the guard and the Gate-2 consult. If the Gate-2 consult is not producing the reflect behaviour the scope is trying to elicit, the question is whether the Gate-2 consult's design is the right target for improvement, not whether a second instrument should be added alongside it.

**A close-hook intervention only, without the mid-session component.** The close-hook already exists and `GATE1_REFLECT_INITIATE_MODE` already exists. A ruling against the mid-session component does not disturb the close-hook's existing function. If the trigger-legibility problem is primarily a close-session problem, the existing mechanism may be the right surface and the question is whether its content is legible, not whether a second instrument is needed.
