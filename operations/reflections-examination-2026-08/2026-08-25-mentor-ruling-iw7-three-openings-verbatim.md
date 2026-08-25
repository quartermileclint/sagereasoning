# Mentor Ruling — IW-7's Three Openings — Verbatim

**Date relayed:** 2026-08-25 · **Relayed by:** the founder, in-chat, same thread as the scope
document's close.
**Question put:** the message drafted in this session, itself derived from §4 of
`2026-08-25-iw7-three-openings-scope.md`, per the same convention as the item-4 brief (the document's
own §4 is the backing material; the relayed message restates it).
**Scope of the ruling:** all three openings, plus the flagged design detail (sparse-extraction default
gating) the drafting session surfaced and left unresolved. The mentor rules on all four.

---

### The flagged detail — gating on a bare `is_kathekon` reading

This is correctly flagged and correctly not resolved before bringing it here. It is the load-bearing
design question for opening 2, and the fact that it was caught before being shipped is the right
outcome of the discipline the observation history has been tracking — surfacing what is actually true
before claiming what the evidence supports.

The sparse-extraction default is not a genuine adverse verdict. A documents-only session with nothing
adverse in it returning `is_kathekon === false` is the instrument failing to find signal, not the
instrument finding a genuine failure. Gating a reflect-turn trigger on that reading would fire the
trigger on instrument silence, not on practitioner reasoning. That is a false positive at the trigger
level — and false positives at the trigger level are exactly what erodes the instrument's credibility
over time. The observation history shows this pattern has been named and fixed on a sibling surface
once already. Shipping it again on a new surface, even with existing machinery, would be repeating a
known error.

The design detail that must be resolved before opening 2 can be armed: the trigger must distinguish a
genuine adverse verdict from a sparse-extraction default. The honest answer may be that this
distinction is not currently derivable from the consult's output — that the consult returns
`is_kathekon === false` without a signal quality indicator that would let the hook know whether the
false reading reflects genuine reasoning or extraction failure. If that is true, opening 2 cannot be
armed until the consult's output carries that signal, or until the hook has an independent basis for
filtering sparse-extraction defaults. This is not a small detail. It is the design.

---

### Opening 2 — Arming the existing elicitation from the Gate-2 consult's verdict

Not yet, and the reason is the flagged detail above — not the frequency concern your ruling turned on
[note: referring to the prior item-4 ruling]. The frequency concern is real but secondary here. The
consult fires on every distinct decision, which is meaningfully more often than the guard's allowlist.
That frequency increase is smaller in scale than the boundary-predicate design the item-4 ruling
rejected, but it operates on the same axis: exposure-keyed frequency determines credibility erosion
rate. A machinery-reusing frequency increase does relocate the erosion, as the question correctly
anticipates — on a longer fuse, but the same fuse.

However, the frequency concern is not what blocks opening 2 right now. What blocks it is that the
trigger condition is not yet specifiable without the sparse-extraction default problem being solved.
A trigger that cannot distinguish genuine adverse verdicts from instrument silence is not a trigger —
it is noise. Arming the existing elicitation machinery from a noisy trigger does not improve on the
current state; it adds firing events that carry no signal.

**The ruling on opening 2: hold until the consult's output carries a signal quality indicator or an
equivalent basis for filtering sparse-extraction defaults.** When that basis exists, bring opening 2
back. The frequency question will need to be ruled at that point — it is not pre-answered here. The
machinery reuse is a genuine advantage and the frequency increase is genuinely smaller than the
item-4 design. Whether it clears the erosion threshold depends on the actual firing rate against real
session data, which does not yet exist.

---

### Opening 3 — Varying the close turn's content on-condition from the session's own record

This is the right intervention and it does not repeat the item-4 error. The item-4 ruling rejected a
second exposure-keyed instrument firing on every action of a class. Opening 3 is not that. It is a
change to what is said at a firing point that already exists, on a condition derived from what the
session actually recorded. The firing frequency is unchanged — the close hook fires once per session
regardless. The content varies based on whether the session produced a guard caution or a poor
consult verdict. That is occasion-varied content at an existing firing point, which is exactly what
the item-4 ruling named as a legitimate path.

The specific condition matters. A guard caution is a genuine risk signal — the guard's own allowlist
is narrow and named, and a caution on that allowlist is not a sparse-extraction default. A poor
consult verdict carries the same sparse-extraction problem that blocks opening 2. **The close turn's
content variation should be conditioned on the guard caution signal, not on the consult verdict,
until the sparse-extraction default problem is resolved.**

This means opening 3 has two phases. **Phase one, available now:** vary the close turn's content
on-condition from a guard caution in the session record. **Phase two, available when the
sparse-extraction default problem is resolved:** extend the condition to include genuine adverse
consult verdicts. Phase one does not require waiting for phase two.

The invariant five-question string is the right target for this change. The session-specific content
should be interpolated into the existing structure, not replace it — the five questions carry the
philosophical substance; the session-specific content carries the occasion. The interpolation pattern
already exists in the guard's elicitation machinery. Reusing it here is the right call.

---

### The coverage gap question

Does opening 3 alone, without opening 2, close the coverage gap the item-4 ruling left? Partially.
The close turn's content variation addresses the legibility problem at the one firing point that
already exists. It does not address the gap between a session's consequential decisions and the close
turn — a session where a guard caution fires at hour one and the close turn fires at hour six has a
five-hour gap where the caution is not reflected in any elicitation. Opening 2, when it becomes
available, would close that gap by arming the elicitation closer to the event.

Opening 3 closes the legibility gap at the close; opening 2 would close the temporal gap between event
and elicitation. The honest answer is that opening 3 is the right first move, opening 2 is the right
second move when its trigger condition is specifiable, and the coverage gap is partially closed rather
than fully closed by opening 3 alone. That partial closure is better than the current state and does
not introduce the erosion the item-4 ruling was concerned about.
