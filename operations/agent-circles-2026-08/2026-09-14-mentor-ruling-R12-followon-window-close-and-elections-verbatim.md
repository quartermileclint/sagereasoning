# Mentor ruling — R12 follow-on: the window's close condition, three elections, next session, the capture gap (verbatim)

**Relayed 2026-09-14**, in response to this session's four-item request for what the founder must
supply to progress the track.

**This capture is canonical. Verbatim wins over every summary, including this file's own
executing-session notes.**

**Adopted as binding** under `D-MENTOR-RULING-R12-FOLLOWON-ADOPTED-PREMISE-FLAGGED-2026-09-14`, with
**one premise flagged for the founder's determination** — see the notes below. The flag does **not**
qualify the ruling; it asks whether a fact the ruling reasons from is current.

---

## The ruling, verbatim

> ## R12 follow-on — rulings and recommendations
>
> ---
>
> **Item 1 — When does the observation window close, and on what condition?**
>
> This is a mentor ruling, not a founder election.
>
> The window closes when the S11-D2 baseline is complete — five ordinary post-remedy consult days counted from W2's first record, as Q-M4 ruled. That condition has not yet been met because W2's clock has not started.
>
> The founder opens W2's first sitting; that sitting's first consult record starts the clock; five ordinary days from that record sets the baseline; the baseline's completion is the close condition.
>
> The F-3′ obligations the brief cites — count consult availability from day one, report the guard population separately, set the consult-side bound threshold after five ordinary post-remedy days, publication waits on it — are the reporting obligations that follow the close. They are not the close condition itself.
>
> The window has run nine days with consult records on all nine, but those are the current window's records. W2 has not opened. The nine days do not count toward the five-day baseline.
>
> The practical implication for Q-R12-B: the build bundle waits for W2's five-day baseline to complete and the window to close. That is the condition. It is not indefinite — it is bounded by a clock that starts when the founder opens W2's first sitting.
>
> **Item 2 — Three elections (§13 of the brief)**
>
> These are the founder's elections and the ruling does not make them. But the ruling offers a recommendation on each, clearly marked as such.
>
> On `accepted_move_count` — store versus derive: derive from `derivation.moves[]`. Storing it duplicates a fact that is already structurally present in the derivation array. A derived field that duplicates a stored fact creates two sources of truth for the same value, which is the shape that produces silent inconsistency when one is updated and the other is not. The derivation array is the authoritative source; read from it.
>
> On `election_basis` — candidate row versus cycle row: candidate row. R8's "per-cycle" wording describes the cadence of the election, not the granularity of the record. The election selects a candidate. The record that carries the election's basis should be the candidate row, where the candidate's properties are already present. A cycle row carrying the election basis would require joining back to the candidate to interpret it.
>
> On Phase 3's N: this is genuinely the founder's election and the ruling does not constrain it beyond the stated non-zero requirement. One recommendation: set N low enough that the first completion signals are informative before the threshold is reached, and high enough that the threshold is not met by a single anomalous signal. Three is a reasonable starting point — it requires a pattern, not a single occurrence, and it is small enough to reach in a reasonable window.
>
> **Item 3 — Which authoring session to open next**
>
> Open the producer-question mentor brief.
>
> R8's judgement that it should precede any build is confirmed as hard rather than advisory by Q-R12-B's ruling. The reasoning is precise: without an answer to how an executing agent learns `loop_id` and `cycle_number`, nobody but the runner can post a completion signal, and phase 3 would consume a stream only the runner produces. That is a structural dependency, not a design preference.
>
> The generation-step scoping session carries Q-R12-C's new open item and can wait — it does not gate the build in the same way.
>
> **Item 4 — The consult-path capture gap**
>
> This is a mentor question and the ruling is: consult-side parity with the guard-side Condition-3 disclosure is owed, but repairing it mid-window falls under Q-R12-B's ruling. The fix is in harness/gate1 files, which are behaviour-altering changes to the measured checkout. It cannot be made mid-window.
>
> The ruling on whether consult-side caller-class attribution was ever required: yes. The 2026-09-07 and 2026-09-10 rulings required the Condition-3 disclosure on the guard path because the guard path's records are the instrument's primary evidence. The consult path's records are the same instrument's secondary evidence. Parity is owed not because the guard side has it but because the disclosure's purpose — honest representation of what the record attests — applies to both paths equally. The gap is a defect, not a design choice. It waits for the window to close.

---

## Executing-session notes (NOT the mentor's text)

### ⚠ ONE PREMISE FLAGGED FOR THE FOUNDER — Item 1 reasons from "W2 has not opened"

**The ruling's structure is adopted without qualification.** The close condition is the S11-D2
baseline: five ordinary post-remedy consult days from **W2's first record**. The F-3′ obligations are
reporting obligations that **follow** the close, not the close condition — a correction this session
needed, having read them as the condition.

**What is flagged is a fact, not the reasoning.** The ruling states *"W2 has not opened"* and *"the
nine days do not count."* This session cannot confirm that, and three facts pull the other way:

1. **This session opened under the W2 conforming opener**, whose §3 states *"This window's designated
   work is the standing-runner design track"* — i.e. the designation F-1 called for.
2. **The founder made that designation in this session**, naming the standing-runner design track and
   its one exclusion.
3. **This session produced 27 consult-path records**, the first at **`2026-09-14T08:44:36.147Z`**
   (tool `Write`) — which is what F-1 says starts the clock: *"The clock starts at that work's first
   consult record."*

**Against that:** the recorded criterion is *"the act of opening being what makes it the first"*
(`D-QS2-OPENER-COLLISION-...-2026-09-13`), which makes this **the founder's act, not an inference from
the work performed**; and the two immediately prior sittings each declared themselves **"NOT W2's
first sitting"** explicitly, while **no session has ever declared itself the first.**

**This is a PR20 gap in this session's own relay, and it is named as such.** The four-item request did
not tell the mentor that the founder had designated this session's work under the W2 opener. The
ruling reasoned from *"W2 has not opened"* without that fact in front of it. **Per PR20's 2026-08-19
amendment a ruling given on a stale or withheld premise stands** — and this one may well be correct,
since opening is the founder's act — **but standing-by-luck is not the standard, so the premise is put
back rather than assumed.**

**Why it matters concretely.** If the founder's opening of this session *was* W2's first sitting, the
clock started 2026-09-14T08:44:36Z and the five-day baseline completes around **2026-09-19**, putting
the build bundle days away. If it was not, the build waits until the founder opens W2. **The
difference is the whole schedule of the track, and only the founder can settle it.**

### What is settled and needs no founder act

- **Item 1's structure:** the close condition is the S11-D2 baseline's completion, bounded by a clock,
  **not indefinite**. F-3′'s obligations follow the close; they are not it.
- **Item 3 — RULED:** open **the producer-question mentor brief** next. *"A structural dependency, not
  a design preference."* The generation-step scoping session **can wait**.
- **Item 4 — RULED:** consult-side parity **is owed**; the gap **is a defect, not a design choice**;
  and it **cannot be repaired mid-window** under Q-R12-B. The ground is general and worth carrying:
  parity is owed *"not because the guard side has it but because the disclosure's purpose — honest
  representation of what the record attests — applies to both paths equally."*

### What remains the founder's, with recommendations recorded as recommendations

- **`accepted_move_count`: recommended DERIVE, not store.** This **reverses §2.3's specification**,
  which stores it as its own column. The brief had flagged the duplication risk and left it electable;
  the recommendation resolves it toward deriving, on the two-sources-of-truth ground.
- **`election_basis`: recommended CANDIDATE ROW** — confirms §2.5's specification and its stated
  reasoning.
- **Phase 3's N: genuinely open**; **3** recommended as a starting point.

### What this ruling does not license

No build. Item 1 confirms the bundle waits. No migration, flag, mint, capability addition or deploy is
authorised, and nothing here touches R8-D7's open parameters.

### Cross-references

- The prior ruling: `2026-09-14-mentor-ruling-R12-three-questions-verbatim.md`
- The brief: `2026-09-14-R12-standing-runner-build-brief-second-increment.md` (annotated in place)
- The close: `operations/handoffs/founder/2026-09-14-standing-runner-R12-build-brief-CLOSE.md`
