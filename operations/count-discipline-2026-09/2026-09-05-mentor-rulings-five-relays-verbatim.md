# Mentor rulings — the five 2026-09-05 relays (verbatim)

**Received 2026-09-05 (~23:05 AEST), one relay carrying five questions.** Questions answered:
Part 1 `2026-09-06-mentor-question-option-s-directional-decomposition-FOR-RULING.md`; Part 2
`agent-circles-2026-08/2026-09-03-MENTOR-QUESTION-route-i-what-is-l1-supply-for.md`; Part 3
`founder-hub-2026-09/2026-09-02-mentor-question-continuity-window-FOR-RULING.md`; Part 4
`2026-09-05-mentor-question-a11b-defence-vs-dogfood-harness-FOR-RULING.md`; Part 5
`2026-09-05-mentor-question-r20a-non-length-pre-check-rejections-FOR-RULING.md`. **This file is the
canonical record. Where any summary disagrees with the text below, the text below governs.**
Adopted under `D-MENTOR-RULINGS-FIVE-RELAYS-ADOPTED-2026-09-05`.

---

## Part 1 — Should Option S's directional decomposition exist at all?

**The decomposition is removed. Per-probe distributions replace it.**

Line 2 settles this on its own terms, without requiring Line 1 to transfer. The mechanism is identical to D6a's round-5 finding: the candidate set was selected on the variable being re-measured, direction is a pure function of floor_n×2 versus n_v, and the published split therefore tends toward the 15:9 role ratio by construction. Publishing that split as a finding would report the candidate set's composition back as though it were a measurement. That is the failure D6a's round 5 was ruled on, and the remedy there was removal. The same remedy applies here.

Line 1 is addressed for the record because the document asks whether the pooled-sweep ruling's reasoning transfers to instruments beyond D6a. It does, where the mechanism is the same. The pooled-sweep ruling's ground was not instrument-specific — it was that a decomposition arithmetically forced by probe composition is not a genuine finding. That ground applies wherever the mechanism applies. Option S is such a case. The ruling transfers.

**Consequences:**
- B1 is moot. The output it corrects would not be published.
- `option-s-runner.py:45`'s assertion is corrected before any spend. The line records a ruling's requirement; the requirement has changed.
- Option S publishes per-probe distributions.
- The run is unblocked on this question. The remaining three pre-run blockers govern whether the run proceeds.

**On the general principle:** a directional decomposition is a genuine finding when the probe composition does not arithmetically force the split. It is not a finding when it does. Disclosure of the composition alongside the split does not rescue it — a tautology disclosed is still a tautology.

---

## Part 2 — What is caller-supplied extraction for, and should route (i) be built now?

**Q1: Elect 2b now, independent of any route (i) decision.**

The recommendation is correct. Item 2b — narrowing `l1_supply` out of the `ecosystem` preset — is cheap, reversible, already carried, and converts a general-population Arm-B threat into a single-caller-class threat with materially stronger accountability. The marginal cost is negligible. The marginal benefit is real. It does not depend on any route (i) decision and should not wait for one.

**Q2: Do not build route (i) now.**

The case against building it is stronger post-2b than the 2026-08-25 scoping found. After 2b, the remaining `l1_supply`-capable population is `plugin_install` credentials only — a narrower, structurally more accountable caller class. Route (i)'s marginal benefit against that population is lower. Its cost — M6, the mandatory `l1_supply` requirement on the plugin path — is unchanged. Under three of the four disagreement-policy shapes, route (i) either permanently taxes or functionally eliminates the one documented reason the capability exists.

The trigger for revisiting route (i) is a demonstrated Arm-B threat from the post-2b population — a `plugin_install` credential holder supplying a manipulated `layer1_schema` in a way that reaches `/api/reason` or the public trust-record surface and produces a materially wrong output. That is an empirical condition, not a design condition. It should not be anticipated by building a remedy for a threat that has not materialised in the narrower population.

**Q3: If route (i) is ever elected, flag-and-proceed.**

The scope document's recommendation is correct. Reject-on-disagreement re-opens closed over-strictness. Take-the-stricter is safe but biased and untested against a two-field attack. Take-the-server's makes the supplied schema decorative and de facto deprecates `l1_supply`. Flag-and-proceed closes nothing structurally but is honest, cheap, and introduces no new gaming class. It is the right starting point precisely because the other three each recreate a problem this project has already spent real effort closing.

The named residual — whether `l1_supply` should be removed from `plugin_install` entirely — is correctly out of scope here.

---

## Part 3 — How much continuity should the private mentor have?

**Q1: The fixed window is the wrong shape for binding rulings. The right shape is already in use.**

The verbatim record is the memory channel for anything that binds. The observation history, profile snapshots, and structured mentor observations are the memory channels for developmental continuity. The raw message window is the channel for conversational context within a session. These three channels serve different purposes and should not be conflated.

A governing advisory surface whose rulings bind the project should not depend on a rolling window of raw messages for the integrity of those rulings. The verbatim record exists precisely because the window cannot be trusted to carry rulings forward reliably. The 2026-08-31 to 09-02 contamination is the proof: the mentor answered confidently from an incomplete window with no signal that it was incomplete, and a ruling was generated without the mentor seeing its own immediately-preceding reply.

The shape is not wrong in the sense of needing replacement. It is wrong in the sense of being misunderstood as a memory channel for binding outputs. It is a conversational context channel. Treat it as that.

**Q2: The window should be bounded by session, not by message count.**

A message count is the wrong unit because message length varies by orders of magnitude. A token budget is better-behaved but adds complexity. A time span — the current session — is the right conceptual bound, because what the mentor needs for conversational coherence is what was said in this exchange, not an arbitrary slice of prior exchanges.

The practical implementation is a token-budgeted fetch of the current session's messages, with a hard cap to prevent runaway cost. The test pin at `MENTOR_HISTORY_WINDOW === 20` is correct discipline — any change should appear as a deliberate diff referencing a ruling. The number 20 is not ruled here as correct or incorrect. The shape ruling above is what matters: the window is for conversational context, not for binding rulings.

**Q3: The mentor should be told what it cannot see.**

This is not optional. A mentor that cannot distinguish "the founder never said that" from "that fell outside my window" will answer confidently from incomplete information, which is what happened in the contamination window.

The system prompt should carry a line stating the window's scope explicitly — something of the form: "Your conversational history shows the current session. Prior rulings and developmental observations are supplied through separate channels. If you cannot find something in your history, say so rather than inferring it was never said."

This is cheap, addresses Q3 directly, and allows the mentor to ask for what it lacks rather than confabulating from absence.

**Q4: The contamination window's rulings.**

The 2026-08-31 corrected ruling (row 1003) requires the founder's assessment from the verbatim, not a re-affirmation from the mentor. The question is whether the founder's correction message (row 1002) was self-contained enough that the mentor's inability to see row 1001 did not matter. That is a reading of the verbatim, which only the founder can do. If the correction message supplied the full context of what was being corrected, the ruling stands. If it assumed the mentor could see what it could not, the ruling should be noted as generated under impaired context and the relevant portion re-examined.

The rows 1004–1011 exchange is a separate matter. If it contained rulings and those rulings are uncaptured in the repo, the founder should read the database rows and determine whether any binding output was produced. Uncaptured rulings from a contaminated window are the highest-priority recovery item from this episode.

---

## Part 4 — The injection defence blinds the harness on exactly the sessions that maintain the substrate. Which duty governs?

**Remedy (a) governs. Harness-side redaction, with the channel-law question answered explicitly.**

The question of principle is: when the defence's duty and the harness's duty conflict on the operator's own loop, which governs? Neither duty is absolute, but the conflict is resolvable without sacrificing either.

The defence's duty is to refuse internal-field smuggling, fail closed. That duty is correctly calibrated for the practitioner population — a practitioner typing about their day will not produce `distress_detected` or `is_kathekon` naturally. The tuning was correct for its intended caller.

The harness's duty is to examine the agent's consequential actions, especially on the substrate itself. That duty is most important precisely where the defence fires — on sessions that maintain the substrate, where the agent's actions are most consequential and the transcript tail is full of schema identifiers by construction.

Remedy (b) — a credential-scoped downgrade — creates a trust-scoped exception in a security surface. That is the exact shape a defence should not have. The document's own assessment against it is correct. It is not elected.

Remedy (c) — accept and classify — leaves the instrument absent precisely where the mentor's Gate-1 framing says it matters most. That is not acceptable as a permanent posture. It may be acceptable as a temporary posture while (a) is built, but it is not the ruling.

Remedy (a) — harness-side redaction — is the right location for the remedy because it keeps the defence untouched and keeps the channel out-of-band. The channel-law question is whether a mechanically redacted tail is still "out-of-band verbatim." The answer is yes, with disclosure. The channel law's purpose is to prevent the agent from authoring its own answer. Mechanical redaction of schema identifiers with neutral placeholders is deterministic, not agent-authored, and does not give the agent any influence over what is sent. The examined text is shaped, but it is shaped by a rule, not by the agent. That is within the channel law's terms, provided the redaction rule is disclosed in the harness documentation and the redaction is logged so a future reader knows what was replaced.

The engineering item — the masked-200 fallback on `/api/reason` should write a `route_errors` row — is confirmed as correct and should be built alongside (a). A real injection attempt against the consult surface currently leaves no trace. That is a gap independent of this ruling.

**Practical consequence:** the redaction rule should cover the `schema_field_injection` regex's full token list, replace each match with a bracketed placeholder that names the category (e.g. `⟨schema-field⟩`), and log the replacement count per call. The harness documentation should carry a note that substrate sessions produce redacted tails and name the rule. This is `code-elevated`, harness only.

---

## Part 5 — Does the length-guard ruling's principle extend to other pre-distress-check refusals?

**The principle extends to P′ and to O where the screened text is present. J, A, and F are outside it.**

The ruling's ground is: what is owed to a person who submits a distressed input is recognition and a response. The distress check runs before any rejection that fires on a body whose screened text is present and readable. That ground is not specific to length guards. It applies wherever the screened text exists and the rejection fires before the check sees it.

**P′ — yes, extend.** The screened text is present. The person is refused because a sibling field is missing. Under the ruling's ground this is the length case wearing a different coat. The three sites should move after the check, following the Group-1 shape. Add to the remediation list.

**O — yes, extend where the screened text is present.** A distressed person submitting a body whose screened text is present and readable is owed the crisis form before being told their `visibility` value is invalid or their `bypass_pattern_cache` must be a boolean. The non-text field's invalidity does not change what is owed on the screened field. Apply case by case: if the screened text is present and readable, the check runs first. If the screened text is itself the invalid field (a non-text value where text is expected), the check has nothing to screen and the rejection may stand first.

**J — outside the principle.** There is no field to screen. The body is not readable. The ruling's ground requires a present and readable screened text. A malformed JSON body does not meet that condition. No move is owed.

**A — outside the principle.** The 403 protects the founder's private surface from a different person. The person refused is not the founder, and the founder's crisis form is not owed to them on that route. A non-founder in distress who hits a founder-only gate is on a surface not designed for them. The principle does not extend to surfaces whose human-facing design excludes the person being refused.

**F — outside the principle.** The feature is honestly closed. A closed route owes no response beyond the honest closure. The principle applies to routes that are open and processing — a closed route is not refusing a distressed input, it is refusing all inputs equally.

**The boundary stated explicitly, so it is ruled rather than assumed:** the principle binds where three conditions are jointly met — the route is open, the caller is the intended human user of that surface, and the screened text is present and readable in the submitted body. Where any of the three fails, the principle does not bind.
