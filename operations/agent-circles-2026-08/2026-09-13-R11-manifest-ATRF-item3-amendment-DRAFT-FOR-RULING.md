# R11 — Deliverable C: `manifest.md` ATRF item 3 — amendment DRAFT FOR RULING (removing the outcome-comparison reading)

**Authored 2026-09-13 (from `date`)** by the standing-runner design sitting R11
(`sagereasoning-6b [802222]`), tier `governance`. **`manifest.md` is NOT edited by this sitting. This
is a draft for the mentor's ruling and the founder's application; it changes nothing until both
happen.** It discharges R9 §16.5 (*"The manifest ATRF item-3 wording — draft an amendment for ruling
removing the outcome-comparison reading… a `governance` draft, not an edit"*).

---

## 1. The line as it stands

`manifest.md`, the Agent Task Reasoning Framework section, the third carried element (one
occurrence, `manifest.md:265` at this writing — line numbers rot; the opening words identify it):

> **3. Idea completion signal.** When the IDEA loop proposes an action and the agent elects and
> executes it, a thin task-agnostic completion signal returns to the harness: whether the idea was
> completed and how the outcome compared to the proposal. This closes the loop on each proposed idea
> without exposing task details.

## 2. Why it needs amending — the ruling that read it down

**C4, verbatim** (`2026-09-04-mentor-brief-standing-runner-design-session-and-rulings-verbatim.md`):

> *"Arena means adversarial examination of the assent attestation. It does not reintroduce outcome
> comparison.*
>
> *Q-C1/Q-C2a govern: the completion signal carries examination-quality content only. R8 §4.2's
> ruling — the absence of task-outcome content is the ruling's own doctrine made structural — is not
> modified by the environment label.*
>
> *C4: Arena at the completion signal step means adversarial examination of the assent attestation —
> did the agent examine the impression it assented to when it adopted the proposal, or was the assent
> habitual? Does the agent stand behind the outcome or refuse to attest? It does not reintroduce
> outcome comparison. Q-C1/Q-C2a govern. If the ATRF item 3's wording requires correction to remove
> the outcome-comparison reading, that is a governing-document amendment for the session, not a ruling
> here."*

The same record's executing-session note: *"`manifest.md` ATRF item 3 reads 'whether the idea was
completed and how the outcome compared to the proposal'; the ruled and built Q-C1 schema carries no
task-outcome content and no comparison. The mentor rules the ATRF wording 'is read in that light'…
Nothing is edited now. The manifest line stands as written until that session drafts the amendment
for ruling."* This is that draft.

**What the built and ruled signal actually carries** (Q-C1, 2026-08-23: *"Schema: loop_id,
provenance status, examination content, refuse-to-attest branch"*; Q-C2a as amended by the 2026-08-30
Q2 ruling; Q-C3 the refuse-to-attest branch REQUIRED; R8 §2 item 2: *"There is no success/failure
indicator and no elapsed-time field, and no justice-verdict field — by ruling"*): the cycle identity
(`loop_id` + `cycle_number`); the producer's provenance status; the three examination questions —
*"What impression did you assent to when you adopted and executed this idea?"*; whether the assent
was examined or habitual; whether the threshold reached was katorthoma or kathekon; and a
refuse-to-attest branch. **No task-outcome content. No comparison of outcome to proposal.**

The phrase *"how the outcome compared to the proposal"* is therefore a reading the governing document
carries that the ruled schema does not, and one that C4 explicitly declined to reintroduce.

## 3. The proposed amendment

Replace the third element with:

> **3. Idea completion signal.** When the IDEA loop proposes an action and an executing agent adopts
> and executes it, a thin task-agnostic completion signal returns to the harness carrying the
> executing agent's **examination of its own assent** — what impression it assented to when it
> adopted and executed the idea, whether that assent was examined or habitual, and whether the
> threshold reached was katorthoma or kathekon — with a refuse-to-attest branch and the cycle
> identity, under the producer's declared provenance. **It carries no task-outcome content and no
> comparison of outcome to proposal:** it closes the loop on each proposed idea as evidence about the
> quality of the assent, never about the result, and without exposing task details.

Minimal-difference alternative, if the mentor prefers the least edit:

> **3. Idea completion signal.** When the IDEA loop proposes an action and the agent elects and
> executes it, a thin task-agnostic completion signal returns to the harness: whether the idea was
> completed and ~~how the outcome compared to the proposal~~ **the executing agent's examination of
> its own assent (Q-C1/Q-C2a), with a refuse-to-attest branch; no task-outcome content and no
> comparison of outcome to proposal**. This closes the loop on each proposed idea without exposing
> task details.

**A second phrase is flagged, not amended:** *"whether the idea was completed"*. The ruled schema has
*"no success/failure indicator"* (R8 §2). Whether "completed" in the manifest's sense means *executed
at all* (which the signal's existence attests — a producer attests only after executing) or *succeeded*
(which the signal does not carry) is a reading the mentor may wish to fix in the same amendment. The
first proposed wording above removes the phrase; the minimal alternative keeps it. **The choice is
the mentor's.**

## 4. What this draft does not do

It does not edit `manifest.md`. It does not touch the completion-signal schema, endpoint, migration or
handler. It does not re-open Q-C1, Q-C2a, Q-C3 or C4. It proposes wording for a ruling; application
after ruling is the founder's, on the governing surface, with its own record.

## 5. Question for the mentor (NOT sent)

**Q-R11-C1.** Which of the two wordings in §3 is ruled, and is the *"whether the idea was
completed"* phrase to be removed with the outcome-comparison phrase or retained in the
"executed-at-all" sense?

*End of Deliverable C.*
