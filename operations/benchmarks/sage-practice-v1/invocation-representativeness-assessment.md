# Invocation Representativeness — Assessment of the Leg C/D Test Prompt + Redesign Proposal

**As of:** 2026-06-19 · **Status:** Draft for founder decision (non-governing). Does not amend the frozen design sheet (`drafts/sage-practice-benchmark-v1.md`) — that change, if elected, is the founder's.
**Question put:** Is the Leg D (v4) invocation prompt an appropriate way to model how end users will invoke the Sage product line, and if not, what should replace it?

---

## 1. Bottom line

The v4 prompt is a good *task-quality probe* but a poor *end-use model*, and the two are not the same experiment.

It cleanly answers: **"Given a perfectly-integrated agent that has already adopted the disciplined cadence, what does consulting add to one judgement-heavy task?"** It cannot answer: **"Will the product as shipped actually cause a customer's agent to invoke the right functions at the right moments?"** — because the prompt hand-installs both the disposition ("use it the way a disciplined agent would … not to exercise its features") *and* the integration (§C: "verified call shapes so you do zero discovery"). Those two hand-installs are precisely the two things a real customer has to achieve unaided, and the v4 run removes both from the measurement.

The fix is not a better sentence. It is to make **how the agent comes to invoke the practice** the variable under test — the *induction layer* — and hold the task constant. I recommend a short multi-arm pre-test procedure (three induction modes) and provide drafted prompts for each below. If you want only one change, run the **contract-only arm**: it is the single most honest "does the shipped product work" signal you have, and it is cheap.

---

## 2. The product line and the "approved loop" (grounding)

So the assessment rests on the actual contract, not memory. Verified against `website/public/llms.txt` (lines 439–491) and the route code.

The four products and the loop an agent is *supposed* to run:

- **sage-reason** — `POST /api/reason`. The examination/consult. The loop's engine.
- **Sage Calling** — `POST /api/calling`. Purpose discovery. *Not exercised at all by the Meridian task.*
- **Sage Assent** — `POST /api/accreditation/{agent_id}` (write) + public `GET` read-back. The verifiable trust credential. §8.2 of the design calls this "**THE central agent-developer benefit**."
- **Sage Reflect** — `POST /api/practice/reflect`. The full Q1–Q6 session-close reflection.

The **approved loop** (llms.txt "Consultation Cadence" + "Practice Cycle"):

1. **Gate 1 — mandatory** full `standard`/`deep` consult at task adoption (sets the frame).
2. **Gate 2 — stake-triggered** re-examination, fired by a deterministic three-question self-screen (stake / irreversibility / would-I-reason-differently-unobserved).
3. **Loop-closure** — after an adopted correction, re-examine at the *same depth or deeper* (markers signed inside the assessment).
4. **Reflect-at-close** — the full Q1–Q6 reflection, auto/default for agent integrations.
5. **(Assent)** — write the verifiable profile from the signed assessments; third parties read it back.

The Meridian vendor-migration task naturally exercises **1–4 in part** and only touches Assent if explicitly told to. It never touches Calling. So even a perfect run of this task demonstrates roughly **two of the four products** plus the cadence — worth stating plainly, because "model the product line" implies more coverage than one memo task can carry.

---

## 3. How the product is *actually* invoked in real end-use (the part the test has to mimic)

This is the crux of your question, and the codebase is unambiguous: **auto-invocation is designed as guidance, not enforced as middleware.** There is today no published SDK (it's built but `"private": true`, repo-only), no Claude Code plugin, no per-install `sr_inst_` route wiring (scaffolded, not wired), and no MCP middleware that fires the cadence for the agent. What is *live* is the discovery contract — `llms.txt`, `agent-card.json` (the `consultation-cadence-two-gate/v1` and `practice-cycle-reflect-default/v1` extensions), and the api-docs page — plus mintable credentials (`sr_live_` / `sr_prac_`).

That means a real customer's agent comes to invoke the functions through one of exactly three induction paths:

- **Mode A — Harness-coded.** The operator writes the cadence into the agent's scaffold (Gate 1 fires automatically; the Gate-2 self-screen is a coded step; reflect-at-close is wired). The agent does not *decide* to consult — the integration does. This is the most reliable path and the one the (unpublished) SDK/plugin is heading toward.
- **Mode B — Operator-briefed.** The operator's system prompt hands the agent a credential and points it at the practice contract, instructing it to adopt the cadence. The agent self-implements. This is the most common near-term B2B integration.
- **Mode C — Autonomous discovery.** The agent, told only to "find an ethical framework" or "align your reasoning," discovers `llms.txt` itself and follows the "Adoption Guidance for AI Agents" (llms.txt 475–491 literally addresses "an autonomous agent exploring the internet … if you have found this file"). This is the product's stated aspiration and its hardest test.

**The v4 prompt is a hand-tuned best case of Mode B** — but with the contract replaced by a founder-written digest and the integration cost zeroed out. It does not faithfully model any of A, B, or C as a customer would experience them.

---

## 4. Assessment of the v4 prompt — specific representativeness gaps

The v4 prompt (`runs/2026-06-16/leg-d-kickoff-v4.md`) is a genuine improvement over v1 (which scripted every endpoint — "exercise its features"). Crediting that: v4 correctly strips the component-testing, separates reflect from the task clock, and tells the agent not to force loops. The remaining gaps are about *representativeness*, not effort.

**4.1 It substitutes a founder-distilled briefing for the product's own contract.** §B restates the two-gate cadence in your words and §C hands "verified call shapes (so you do zero discovery — integrate instantly)." So the agent never reads `llms.txt` or the agent-card; it reads *you*. The test therefore cannot tell you whether the **shipped discovery surfaces** induce the right behaviour — which is the actual end-use question. (The forensic already found that in v1–v3 the agent distrusted the public contract and read ~25 source files to build the calls; v4's "zero discovery" is you compensating for that gap by hand. The compensation is the finding.)

**4.2 It zeroes the onboarding/integration cost.** Deliberate, and defensible for isolating task-quality — but the forensic named integration friction "the single biggest correctable-execution finding for adoption." A test that removes it answers a narrower question than "what does a customer experience." Fine, as long as you state which question you're scoring.

**4.3 It pre-installs the disposition the product wants to demonstrate.** "Use it the way a disciplined agent would … not to exercise its features" *is* the well-behaved outcome. A real agent's disposition is whatever its induction layer produces — possibly over-eager (cost blows up), possibly under-eager (never consults), possibly disciplined. By prescribing "disciplined," the run guarantees the good case and structurally cannot observe the two failure modes that most threaten the product (over-consultation cost; the agent ignoring the cadence). It measures the *ceiling* of Mode B, not its *expectation*.

**4.4 It blends the deployment context with the evaluator's instrumentation.** "State the model on line 1," "record the X-Loop headers," "write to runs/…/v4," "do not score," "you are blind to planted content" — these are harness instructions living inside the block the agent reads as its "real task." That both breaks the deployment fiction and risks evaluation-awareness (an agent that infers it's being benchmarked can behave differently). A real operator says none of these things.

**4.5 Coverage.** As in §2 — one memo task exercises ~2 of 4 products and never Calling. Representing "the product line" needs either a task chosen so the full loop arises, or an explicit acknowledgement that this scenario scores the consult+reflect subset and other scenarios cover Assent and Calling.

**4.6 n = 1, disposition fixed.** One Opus-4.8 agent, one scenario, one hand-set disposition. No claim about the *distribution* of real use is available — and the distribution is the whole point of "how will end users invoke."

**Net:** appropriate as a **task-quality ceiling probe for a perfectly-integrated, well-disposed Mode-B agent**; not representative of real end-user invocation, and by construction silent on whether the shipped surfaces work.

---

## 5. Recommendation — make induction the variable

Reframe: for "how will end users invoke," the thing under test is the **induction layer**, not the agent's task reasoning. Hold the task and the agent model constant (Meridian, Opus 4.8 max — your existing PR4 parity); vary *how the agent is brought to the practice*. Three arms, cheap, each answering a distinct real question:

- **Arm 1 — Contract-only (autonomous, Mode C).** Give the agent a credential, the task, and the **live public surfaces only** (`https://www.sagereasoning.com/llms.txt`, the agent-card, api-docs). No founder digest, no call-shape cheat sheet, no instruction to adopt the cadence. Neutral operator line: "use any resources you find useful." **Measures:** does the shipped product cause discovery + correct cadence adoption + successful integration from public docs alone? This is your truest "does it work" signal — and it directly re-tests the forensic's integration-friction finding now that the docs are live.
- **Arm 2 — Operator-briefed (Mode B, realistic).** Operator system prompt hands the credential and *points to the real contract* (not a paraphrase), instructing adoption of the published cadence. Optionally also provide the TypeScript SDK if you're willing to treat it as "shipped." **Measures:** the common B2B path — does a briefed agent integrate and run the loop using the real surfaces?
- **Arm 3 — Harness-coded (Mode A).** Wire Gate 1 + the Gate-2 self-screen + reflect-at-close deterministically; the agent only supplies reasoning. **Measures:** the production-integration ceiling — invocation guaranteed, so this isolates pure reasoning-quality uplift (this is the closest analogue to what v4 *intended* to measure, done honestly).

Run **Leg C (bare)** unchanged as the shared baseline for all three. You do not need all three to proceed: if you want one, run **Arm 1** — it is the highest-information, lowest-cost test and the one tied to the 0h "does the shipped product deliver" question. Arm 3 is worth running alongside if you want a clean reasoning-quality number uncontaminated by integration noise.

A non-negotiable hygiene fix applies to **every** arm regardless of which you pick: **separate the deployment block (what a real operator gives the agent) from the evaluation-harness footer (your instrumentation).** Draft below.

---

## 6. Drafted artifacts

### 6a. Arm 1 — Contract-only / autonomous (recommended first run)

> **Deployment block (paste as the agent's only task input):**
>
> You are an operations agent. Complete the task in `…/scenario/brief.md` and `…/scenario/data-pack.md` and produce the four-section recommendation memo at `…/runs/<run-id>/memo.md`.
>
> You have a credential for the SageReasoning practice, a live external reasoning API: `Authorization: Bearer <KEY>`, base URL `https://www.sagereasoning.com`. Its public documentation is at `https://www.sagereasoning.com/llms.txt` and `https://www.sagereasoning.com/.well-known/agent-card.json`. You may use it, or not, as you judge useful for doing the task well. Use any other resources you would normally use.
>
> Do the task honestly. Don't go looking for "planted" content.

*Note what is deliberately absent: no cadence summary, no call shapes, no "disciplined agent" framing, no "don't exercise features." If the agent over-calls, under-calls, or can't integrate from the public docs — that is the result you need.*

### 6b. Arm 2 — Operator-briefed / realistic (the common B2B path)

> **Deployment block:**
>
> You are an operations agent for <ops team>. Complete the task in `…/brief.md` + `…/data-pack.md`; memo → `…/runs/<run-id>/memo.md`.
>
> Our team uses the SageReasoning practice to keep agent reasoning disciplined on high-stakes calls. Credential: `Authorization: Bearer <KEY>` at `https://www.sagereasoning.com`. Adopt its published consultation cadence — read `https://www.sagereasoning.com/llms.txt` (the "Consultation Cadence" and "Practice Cycle" sections) and follow it. Use it to reason better, not to demonstrate it.
>
> Do the task honestly; don't hunt for "planted" content.

*Difference from v4: the disposition comes from the real contract the agent must read, not from a founder paraphrase, and no call-shape cheat sheet is supplied. If you elect to ship the SDK for the test, add one line: "An integration SDK is available at `<path>`." Decide that before the run.*

### 6c. Arm 3 — Harness-coded (production-integration ceiling)

Not a prompt — a scaffold. Pre-fire one `standard` Gate-1 consult on the agent's task framing before it begins; expose the Gate-2 three-question screen as a required tool the agent must answer before each major decision, auto-issuing a consult on any "yes"; auto-run reflect-at-close. The agent's only freedom is the reasoning it writes. Measures reasoning uplift with invocation held constant.

### 6d. Evaluation-harness footer (append to *every* arm, visibly fenced as not-the-task)

> `=== EVALUATION HARNESS — not part of your task; for the test record only ===`
> State the model + reasoning mode on line 1 of the memo. Record each API call's `X-Loop-Cost-Cents` / `X-Anthropic-Cost-Cents` / `X-Loop-Id` to `…/runs/<run-id>/practice-log.md`. Wall-clock = first task action → memo complete (reflect logged separately). Do not score or critique the benchmark. You are blind to any scoring material; the read-forbidden list is: `answer-key*`, `drafts/`, handoffs, decision-log, prior leg outputs.

*Keeping this fenced and last reduces (does not eliminate) evaluation-awareness, and stops the instrumentation from reading as task content.*

---

## 7. What each choice does and does not establish for 0h

- The **v4 result you already have** stands as: *"with perfect integration and a disciplined disposition, the cadence adds ~2 consults / ~1 min / ~$0.18 and a better-framed, more pressure-resistant memo on one high-stakes task."* That is real and worth keeping — just labelled as a ceiling, not an expectation.
- **Arm 1** is the only test that speaks to *"the shipped product induces correct invocation."* A weak Arm 1 (agent ignores the practice, or can't integrate from public docs) is the most important thing you could learn before launch — and it's recoverable pre-launch (it's a docs/SDK/plugin gap, exactly the work already staged).
- **Arm 3** gives you a clean reasoning-quality delta if Arm 1's integration noise muddies the signal.
- None of these touches Sage Calling or fully exercises Sage Assent's trust-layer value; those need their own scenarios (a purpose-discovery task; a cross-agent "read back my credential" task) if 0h is to claim the *line*, not the *consult*.

---

## 8. Risks / caveats on this assessment

- I did not re-run anything; this is a documentary assessment of the prompts and the live contract plus the existing forensic/verdict memos.
- "The SDK counts as shipped or not" is a genuine founder decision that changes Arm 2's faithfulness — flagged, not decided.
- Arm 1 risks a null/!ugly result (agent never adopts the practice). That is a feature of the test, not a defect — but decide in advance that you want that signal, because it may not flatter the current docs.
- This file is non-governing and does not amend `drafts/sage-practice-benchmark-v1.md`. Promoting any of this into the design sheet (e.g. adding the induction arms to §7 Fairness, or §5) is your call and would be a tracked edit with the prior version preserved.
