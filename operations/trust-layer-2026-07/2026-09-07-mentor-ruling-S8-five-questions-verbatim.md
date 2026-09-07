# Mentor ruling — session S8, five questions: Option C′ conditionally reopened; baseline day counts; G6(a) needs a further qualification (VERBATIM)

**Received 2026-09-07 AEST (`date`) = 2026-09-07 UTC, in answer to
`operations/trust-layer-2026-07/2026-09-07-mentor-question-caller-class-agentid-in-h3-FOR-RULING.md`
(session S8).**
**Status: ADOPTED AS BINDING SPECIFICATION.**

**THIS RECORD IS CANONICAL. It wins over every summary of it — the decision-log entry, the S11
register, the standing opener, the session close, and the question document it answers.**
Reproduced exactly as relayed; nothing paraphrased, nothing elided.

**Binds:** whether Option D's "unimplementable as wired" is reopened and on what conditions; what is
owed before `classifyCaller` may be modified; whether the amended segment-1 clause changes now;
whether a documentation-only day counts toward the five-day baseline and how it is disclosed; whether
G6(a) binds on protocol-required record-keeping loops; and what is owed in the pre-flip report.

---

## The ruling (verbatim)

## Session S8 — five questions ruled

The document is the most complex single relay this project has produced. Five questions, three of them genuinely open, two of them surfacing structural properties of the window that have not been visible until now. The ruling addresses them in order of logical dependency.

---

### On the agent_id finding — does it reopen ruling 3's exclusion as viable?

Yes. Option D's "unimplementable on this harness as wired" is conditionally reopened. The condition is that the controlled-conditions check named below must pass before anything is built.

The finding is real. The diff is clean. The provenance proof — both captures carry `tool_name: Bash`, which H2's matcher structurally cannot see, so these are provably H3 records by content — is exactly the discipline the ruling's method requirement asked for. The wire shape was observed, not inferred from SDK types.

The June capture and this capture already disagree once, which means the wire has moved before. That fact cuts both ways: it establishes that `agent_id`'s presence is a discovery, not an assumption, and it establishes that its continued presence is not guaranteed.

The mechanism the ruling asked to be tested — Option C, SubagentStart correlation — was superseded before the test could confirm or deny it. That is not a failure of the investigation. It is the investigation working correctly: the bounded question was "does SubagentStart supply a signal that correlates to an H3 record via a key other than session ID?" The answer is that H3 supplies its own signal directly, making the correlation question moot. Option C′ — H3 self-discrimination via `agent_id` presence — is the candidate that emerges.

**What is owed before it may be built — three conditions, all three required:**

**Condition 1 — False-positive check under controlled conditions with ground truth.** The same discipline that falsified Option B must be applied here. The specific question: does the harness's own PR19 review-fleet architecture ever have the parent session act with `agent_id` set? The document names `CLAUDE_CODE_CHILD_SESSION=1` as observed on this session's own environment and explicitly not chased down. That is the right call for a bounded investigation, and it is the first thing the false-positive check must examine. A parent session acting with `agent_id` set would mean `agent_id` presence does not discriminate — it would be the spawn-depth failure mode in a different form.

**Condition 2 — A second live capture on a separate day and session.** One capture on one client version on one machine is a candidate. Two captures on different days, different sessions, same client version, confirming the field is present in both, elevates it to a finding. The June capture established that the field was absent. This capture establishes it is now present. A third capture establishes it is stable. That is the minimum for a wire contract that a build can rest on.

**Condition 3 — Client version pinning in the disclosure.** The Option D ruling's amended segment-1 clause must note the client version (2.1.260) at which `agent_id` was first observed. If the mechanism is built and the client updates, the harness must detect the field's absence and fall back to `unknown` rather than silently misclassifying. This is not a build instruction — it is a condition on what the build must include when it lands.

All three conditions must be met before `classifyCaller` is modified. The investigation is not complete until Condition 1's `CLAUDE_CODE_CHILD_SESSION` question is answered under controlled conditions.

**The amended segment-1 clause stands exactly as the Option D ruling left it until a build actually lands.** A candidate mechanism, however promising, does not change what the disclosure may currently claim. The clause reports what the instrument currently does. The instrument currently emits `unknown` for all records. That is what the disclosure says. It continues to say that until the build lands and the field is verified stable.

---

### Question A — does a documentation-only day count toward the five-day baseline?

The day counts. The recommendation to count and disclose is correct, and it is ruled on the same grounds the recommendation names.

Part (1)'s "representative action distribution" clause requires that the baseline characterise the prior state of the instrument across the kinds of actions the instrument will be asked to examine. A day composed entirely of markdown authoring is a day the instrument examined Write and Edit actions. Those are actions the instrument examines. They are in the measured population by design — the consult floor includes Write/Edit/MultiEdit/NotebookEdit deliberately. The day is admissible evidence for part (1).

The representativeness concern is real but it is a disclosure concern, not a filtering concern. Filtering a day because its records came from documentation rather than engineering work would be a post-hoc narrowing of the population mid-window — the move ruled against twice already. The consistent treatment is Option D's: state plainly what the days are made of.

**The disclosure for the baseline reports composition alongside the count.** Day 2 of 5: 12 consult records, all Write/Edit, all governance documentation authoring, zero engineering actions on the product. That is what the baseline contains. The disclosure names it. A reader of the published rate sees the composition and can assess what the baseline characterises.

**A1 answer:** The day counts on the same footing, with composition disclosed.

**A2 answer:** Disclosure of composition is the right remedy, not filtering. The Option D shape — name what the population is made of rather than filter it — is the consistent treatment.

One further observation on this finding. The mechanism is not a defect, as the document correctly states. But the finding reveals something the window was designed to surface: the instrument's measured population is shaped by tool mode, and tool mode is shaped by the kind of work the session does. A session that writes governance documents produces consult records. A session that runs Bash commands does not. This is a structural property of the measurement, and it will be present in the published rate. The disclosure names it. The reader of the rate sees it. That is the window working correctly.

---

### Question B1 — is this a class G6(a) should bind on?

No. A session that produces many sequential documents, each drawing a kathekon-engaged redirection that the next document supersedes, is not a class G6(a) should bind on.

The reasoning is direct. G6(a)'s purpose is to catch a pattern where the agent is proceeding despite a genuine examination finding that the action is problematic. The eleven abandonments in this session are not that pattern. They are a working mechanism measuring a session that never paused to re-examine until the end. The twelfth loop closed because the session did something different — it stopped producing new artifacts and re-examined its own prior reasoning at the same depth. That is the closure condition working exactly as designed.

The kathekon-engagement qualification is the right boundary. The loops that opened were kathekon-engaged by the predicate's own reading — `is_kathekon: true`, quality moderate or strong, role obligation engaged. But the kathekon engagement here is the engagement of the act of writing the record the protocol requires. The record-keeping is itself the fitting action. A loop that opens on a fitting action and closes when the fitting action is re-examined is not a false positive in the sense that matters. It is the mechanism doing its job on a population it was not primarily designed for.

**B2 answer:** The kathekon-engagement qualification is not sufficient as it stands for this class. A further qualification is owed: a loop opened by the agent's own record-keeping — where the action that drew the redirection is itself a protocol-required documentation act — is in a different class from a loop opened by a consequential action on the product.

The distinction is not between documentation and engineering in general. It is between actions the protocol requires and actions the agent elects. A Write that is the governance record the protocol requires is a different kind of action from a Write that modifies the product. G6(a) should bind on the latter class. Whether it binds on the former is a question of whether the protocol's own requirements can generate a do-not-proceed condition on the act of following the protocol. They should not.

The further qualification: G6(a) binds on kathekon-engaged loops opened by consequential actions on the product or its governing documents, not on loops opened by the agent's own protocol-required record-keeping. The distinction is carried as a disclosed property of the measurement, not as a filter on the loop count.

**B3 answer:** Yes. A "loops opened vs. loops closed, by action class" figure should be reported alongside the false-hold rate before the flip. The eleven abandonments on documentation actions and the one closure are exactly the kind of finding the window exists to surface. Leaving it to be discovered at flip time is the move the window was designed to prevent. The composition of the loop count — how many loops opened on product actions, how many on documentation actions, how many closed, how many abandoned — is a disclosure that belongs in the pre-flip report alongside the false-hold rate.

---

### On the structural observation the document closes with

The document notes that writing the section on Question B opened a thirteenth loop, and that chasing the count would open a fourteenth and a fifteenth. It stops rather than chase.

That is the right call, and it is worth naming why. The Stoics held that practical wisdom includes knowing when an inquiry has reached the point where further pursuit of the inquiry becomes the thing the inquiry is examining. The document reached that point and stopped. The count is left visible rather than tidied away because the mechanism by which the twelfth closed is the most useful thing in the question — and that mechanism is visible precisely because the document stopped producing new artifacts and re-examined its own prior reasoning.

That is the practice operating correctly under the specific pressure of a recursive situation: a question about examination loops, asked by a session running examination loops, which closes an examination loop by asking the question. The document saw the recursion, named it, and stopped. That is phronesis applied to the act of inquiry itself, in its most demanding form.

---

### Summary of what is settled and what is owed

**Settled:**
- `agent_id` presence at H3 is a viable candidate for Option C′. Option D's "unimplementable" is conditionally reopened.
- The amended segment-1 clause stands until a build lands. No disclosure change now.
- Day 2 of 5 counts toward the baseline. Composition is disclosed.
- G6(a) needs a further qualification distinguishing protocol-required record-keeping from consequential product actions.
- A loops-by-action-class figure is owed in the pre-flip report.

**Owed before `classifyCaller` is modified:**
1. False-positive check under controlled conditions, specifically examining `CLAUDE_CODE_CHILD_SESSION` and nested delegation.
2. Second live capture on a separate day and session confirming `agent_id` stability.
3. Client version pinning in the build, with fallback to `unknown` on field absence.

**Owed before the flip:**
- Baseline composition disclosure (day-by-day, tool distribution).
- Loop count by action class (product actions vs. protocol-required documentation).

The window keeps running. Nothing built, nothing changed, nothing actioned unilaterally. That discipline has held across every session this week. The observation history will carry it.
