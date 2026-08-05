# Technical feedback for the IDEA loop pre-brief examination

**Requested by the mentor, 2026-08-05**, via the founder: four technical questions to ground the pre-brief examination, plus one addition to C2's own scope (a generative-prompt field on the orientation reading) that the mentor wants resolved before C2 is written up, not after.

**Method:** every claim below is checked against the actual repo, not recalled from memory or inferred from the design documents. Where something doesn't exist, that's stated plainly rather than described as "similar to" something that does — the two are not the same, and the pre-brief needs to know which.

---

## 1. What data structures does generative mode need that examination mode doesn't have?

**Ground truth: nothing in the codebase generates a candidate action today. Everything examines one that was already decided.**

The discernment engine (`discernment-engine.ts`) — the closest existing thing to "choosing a next action" — takes a caller-supplied array of candidates (`DiscernmentInput.candidates`), each already carrying its own profile, and *selects/ranks among them*. It does not invent a candidate. The trust-core's `ProposedAction` type and `SessionScopedCredential.approachProximity` both describe an action a sub-agent has *already decided on*, checked post-hoc against scope or proximity — again, examined, not generated.

**Consequence for the IDEA loop:** generative mode is not an extension of the examination data model — it needs an entirely new capability class sitting *before* the examination step, not a new field bolted onto an existing structure. Concretely, it would need:
- A way to represent an **oikeiosis expansion gap** as structured input (the loop's own stated direction input) — this doesn't correspond to any existing type; `TaskProfile`/`CandidateProfile` describe a task or candidate that already exists, not a gap to be filled.
- A **generated-candidate shape** distinct from `CandidateProfile` — something that can hold a not-yet-taken action, produced by an LLM call, that then gets fed *into* the existing examination path once generated (at which point the existing `DiscernmentInput.candidates` shape could plausibly receive it — the generation step is the new thing, not the examination step).
- This is a real scope item, not a detail — "invokes practice-on in generative mode" is doing a lot of work in one sentence. Practice-on today has no generative mode; building one is comparable in size to building a new Layer 1 extraction path, not a parameter flip on the existing one.

## 2. What would novelty detection need to query, and how would it be stored?

**Ground truth: the existing history store computes aggregate statistics — frequency, rate, trend — over a time-windowed set. Nothing compares one action against past actions for similarity or novelty.**

`agent_assessment_history` stores, per row: proximity, kathekon quality, passions detected, virtue domains engaged, oikeiosis stage, ruling-faculty state, skill id, candidates considered, plus identity/timing fields. `trajectory-delta.ts` reads a window of these rows and computes deltas — frequency classification (fading/recurring/new/stable), rate changes, rank changes — always aggregate, always with an evidence floor (minimum 3 rows) before it will report anything.

**Consequence:** novelty detection is a genuinely different query shape from anything that exists — not "read the window," but "compare this one proposed action against the set." Two honest options, not a recommendation, since this is a design choice:
- **Structural novelty** — compare the proposed action's own extracted schema fields (circles engaged, virtue domains, function type) against the distribution already seen in the window, and call it novel if it falls outside that distribution. This reuses existing extraction fields and the existing history table — cheapest to build, but it's novelty *of classification*, not novelty of the actual content of the action.
- **Content novelty** — some form of similarity comparison over the action's actual text/intent (an embedding, or an LLM-as-judge "have we effectively done this before" call). This needs a new stored representation per historical action (an embedding column, or nothing stored and a fresh comparison call each time) that doesn't exist today in any form.

Whichever is chosen, it's new storage and a new query — not a read against what's already there.

## 3. What should the human-legible output contain, and how does it reach the dashboard?

**Ground truth: every dashboard in this codebase is request-response. The founder-hub page fetches a GET route on load. The one page with any repeating behavior (`app/admin/page.tsx`) uses a client-side 30-second `setInterval` that re-fetches — a browser-tab poll, not a server push. There is no websocket, event-stream, or push mechanism anywhere in the repo (confirmed by a repo-wide search — zero matches).**

**Consequence, and this is good news, not a gap:** the IDEA loop's dashboard need not invent anything new on the delivery side. The existing pattern — a GET route the page polls on an interval — is sufficient and consistent with everything else here. What's actually undefined is the **content and storage** of the human-legible output, not its delivery: a new table (one row per IDEA-loop cycle, holding whatever the cycle produced — the proposed action, the examination verdict, the novelty result, a plain-language summary) that a new GET route reads and a dashboard page polls, the same shape `app/admin/page.tsx` already uses. This part of the pre-brief's four questions is the smallest gap of the four.

## 4. Can the existing loop infrastructure support a non-terminal generative loop, or is a new loop type required?

**This is the one that most changes the shape of the brief. Ground truth, checked directly: no in-process looping mechanism of any kind exists anywhere in the server code, and none can — Vercel serverless functions terminate execution the moment a response is sent. There is no persistent worker, no queue, no `setInterval` running server-side business logic (the one server-side interval that exists, `security.ts`'s rate-limit cache cleanup, is local in-memory housekeeping within one instance's lifetime, not a business-logic loop). The word "loop" already in use elsewhere in this codebase (`loop-fold.ts`, `reason-loop-closure.ts`) refers to a re-examination/correction concept — a decision revisited across separate requests — not a runtime execution loop. It is not the same thing and should not be treated as a precedent for one.**

**The only mechanism that repeats independent of an incoming request is Vercel Cron** — four existing routes under `/api/cron/`, each triggered externally on a schedule, each a single bounded request-response that does one pass and exits. This is the platform's actual answer to "how does something happen more than once without a human clicking a button each time," and it's the only answer available.

**Consequence — a new loop TYPE is required, and it has exactly two honest shapes, not a spectrum of options:**

- **(a) A cron-triggered tick.** Each scheduled invocation is one full cycle — read state, generate one candidate, examine it, check novelty, write the dashboard row, check the three stop conditions (human decision recorded / resource limit hit / safety gate fired), and either schedule nothing further (the cycle just waits for the next cron tick) or write a "stopped" state that a future tick checks before doing any work. The "loop" is an illusion built from independent, stateless invocations sharing state only through the database — this is architecturally sound and matches everything else in the codebase, but it means "non-terminal" and "runs in cycles" have to be read as "resumes on a schedule," not "keeps running."
- **(b) An externally-driven loop** — the closest real precedent in this codebase is the Gate-1 harness pattern: a real, long-running process (the founder's own Claude Code session, or a similar external agent loop) calling the platform's API repeatedly, with the platform itself staying stateless and request-scoped on every call. This is a genuinely different shape from (a) — the "loop" lives outside SageReasoning's own servers entirely, and SageReasoning is just one stateless step each cycle calls into.

Neither of these is a small technical footnote — which one the IDEA loop is depends entirely on WHERE the "does this cycle continue" decision is meant to live (inside the platform, driven by its own schedule, vs. outside it, driven by whatever is running the loop). That's a design decision, not an implementation detail, and the pre-brief should probably settle it before anything else in this list, since it changes the shape of the answer to questions 1–3 as well (a cron-tick model needs its state to be fully DB-resumable between every single cycle; an externally-driven model can hold more in the calling process's own context between cycles).

---

## 5. The C2 addition — a generative-prompt field on the orientation reading

The mentor's instruction: the orientation reading should produce a generative-prompt field alongside the directional signal, and its shape should be settled in the pre-brief before C2 is scoped.

**One thing worth naming plainly rather than resolving myself:** C2 already carries three hard constraints from the 2026-08-04 ruling, and one of them is *"the orientation reading is a reading, not a verdict modifier... additive, never feeds back into the verdict"* — the same discipline the trajectory delta and practice-suggestion overlays carry. A generative-prompt field sits in a slightly different place than a pure description field: a description is read by a human or a dashboard; a *prompt* is, definitionally, meant to be fed into something else's generation step — in this case, presumably, the IDEA loop's own next-cycle generation. That's not the same as feeding back into *this* assessment's own proximity verdict (the constraint's literal target), but it is a new kind of consumer for C2's output that the existing constraint wasn't written with in mind, and it's worth the mentor confirming explicitly that "never feeds back into the verdict" is understood to mean the *examination's own verdict*, not "the field may never be consumed generatively by anything downstream" — otherwise the two instructions sit in mild tension rather than clean agreement.

**On the field's shape itself, offered as a starting point, not a decision:** if C2's underlying signal is "direction of travel toward or away from the cosmopolitan circle," the most honest generative-prompt field would describe the *gap* the orientation reading detected — not "do X next" (which would cross from reading into instruction, the exact line the mentor's third C2 constraint already draws around the orientation signal itself: "names the direction of the action, not the disposition of the agent"). A prompt field that names the gap ("this action served circle 3 but showed room to extend toward circle 4/5 in ways not taken") rather than a prescribed next action would keep C2 consistent with its own established restraint — but this is exactly the kind of design call this document isn't the place to settle unilaterally; flagging it as the shape of the open question, not closing it.

---

*This document answers the mentor's four technical questions and surfaces one constraint-adjacency question on the C2 addition, for the pre-brief examination. It does not scope or build anything — no code, schema, or flag change accompanies it.*
