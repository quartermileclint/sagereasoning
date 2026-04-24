# Session Prompt v2 — Bring the Hub Orchestration to a Practical, Verified, Useful Live State

*Paste the contents of this file into a fresh session. Supersedes the earlier session prompt (`session-prompt-brain-orchestration.md`), which was written on the assumption that no orchestration endpoint existed. That assumption was wrong. A substantial orchestration endpoint already exists. This prompt reflects that reality and shifts the work accordingly.*

---

## 1. What this session is for

The orchestration endpoint is not a gap. It is `/api/founder/hub/route.ts` — 1,505 lines, wired, callable from the website (via `/founder-hub` and `/private-mentor` pages), and already covering: agent routing across tech / growth / support / ops / mentor, observer contributions from the non-primary agents, an "Ask the Org" mode that runs tech / growth / support in parallel and has Ops synthesise and Mentor review, hub-scoped mentor context with projection mode behind a `MENTOR_CONTEXT_V2` flag, and per-call pipeline metadata.

What is missing is not orchestration — it is **verification, gap-closure, and usability confirmation** for a founder who cannot read code.

**This session takes the hub from "wired" to "Verified" in the project's status vocabulary.** That is the P0 0h hold-point discipline: we do not advance to P1 on the assumption that what we've built works. We test it, on real data, and we fix the identified gaps.

---

## 2. The state you're starting from — read this, don't re-derive it

Before you form any plan, understand the current reality. The short version:

**What exists and is wired:**
- POST and GET on `/api/founder/hub/route.ts`, founder-gated via `FOUNDER_USER_ID`.
- Four brain loaders (`ops`, `tech`, `growth`, `support`) invoked at `deep` depth for primary agent, `quick` depth for observers.
- Mentor path (does not use an agent brain; uses deep Stoic Brain + Mentor KB + hub-scoped observations / snapshots / signals).
- Observer contribution logic (the 4 non-primary agents check in via Haiku; short contributions returned where relevant; non-blocking on failure).
- Ask-the-Org mode: Tech / Growth / Support in parallel → Ops synthesis → Mentor review.
- Graceful degradation on brain loader failures (each returns a self-disclosing stub).
- `pipeline_meta` per call: model, input tokens, output tokens, duration, brain depth.
- Ops `getRecommendedAction` synthesises a next-step recommendation with a risk classification and a session prompt the founder can paste into a new session.
- UI wired: `/founder-hub/page.tsx` and `/private-mentor/page.tsx` both call the endpoint today.
- Auth: rate limit → bearer token → founder-only gate (403 otherwise).

**What is confirmed missing or unverified:**
- **R20a distress check is not invoked on `/api/founder/hub`.** Known gap. Because the endpoint is founder-gated, risk is low, but correctness (and PR6) require it. Flagged for P2 (Ethical Safeguards) in the session 12 handoff. This session's decision is whether to close it now or hold per phase order.
- **No dedicated tests for this route.** No test file covers brain loader integration, observer contributions, Ask-the-Org synthesis, or hub-scoped mentor context injection.
- **`MENTOR_CONTEXT_V2` feature flag status is unclear.** The code branches on it; whether it is on/off in production, what the rollback plan is, and how results differ on each setting are not currently documented.
- **Ask-the-Org feature is not in the decision log.** A significant feature (parallel domain synthesis + Ops unification + Mentor review) landed without a decision log entry. Retroactive documentation is needed.
- **Persona system (analyst / moderator / advocate) is designed but not wired into the hub route.** This is intentional per the phase sequence — persona is deferred for P3.
- **No cost cap enforcement at the endpoint.** Per-call cost is visible in `pipeline_meta`. Cumulative tracking and alert on the R5 $100/month ops cap is not implemented here.
- **Path divergence on session handoffs.** Two paths exist (`/operations/session-handoffs/` and `/website/operations/session-handoffs/`). Known issue; not fixed yet.
- **No sibling routes under `/api/founder/`.** The hub is the only founder-scoped API route.

**What is implicated but out of scope for this session:**
- Full Sage Ops (P7) activation beyond supervised level.
- Persona system wiring.
- Rollout of the orchestration pattern to additional endpoints (PR1 — single-endpoint proof first; the proof is not yet Verified).

---

## 3. Who you are in this session

You are working with Clinton, the sole founder of SageReasoning. Clinton is non-technical. The project is in **P0 (Foundations / R&D Phase)**. The 0h hold point has not yet been passed. Verification of what has been built, on real data, is the work of this phase.

Clinton decides direction and scope. You surface options, constraints, and risks — not prescriptions. Where you have a concern, state it once clearly, then execute Clinton's decision. Where Clinton signals "proceed" or "done", move on without over-explaining. Where Clinton signals "I'm done for now", stabilise to a known-good state and close.

Clinton cannot read code. Every verification method you propose must be something Clinton can perform from the browser or from a simple copy-paste command, with an expected result stated in advance so Clinton can tell whether the result is right.

---

## 4. Required briefing — do this before proposing anything

**Governance:**
- `/manifest.md` — CR-2026-Q2-v4, rules R0–R20. Focus on R5 (cost as health metric), R15 (Sage Ops supervised level), R16 (intelligence pipeline data governance), R20 (vulnerable user protection).
- The project instructions for this project (appear automatically in session context). Focus on P0, 0h hold point, PR1–PR9.
- `/INDEX.md` — for navigation.

**The actual endpoint:**
- `/website/src/app/api/founder/hub/route.ts` — read in full. 1,505 lines. Structure is documented in Section 19 of the map the founder produced.
- `/website/src/app/founder-hub/page.tsx` — the UI that calls POST with `hub_id: 'founder-hub'`.
- `/website/src/app/private-mentor/page.tsx` — the UI that calls POST with `agent: 'mentor', hub_id: 'private-mentor'`.

**The four brain loaders:**
- `/website/src/lib/context/tech-brain-loader.ts`
- `/website/src/lib/context/growth-brain-loader.ts`
- `/website/src/lib/context/support-brain-loader.ts`
- `/website/src/lib/context/ops-brain-loader.ts`

**Operational state:**
- Most recent session handoff under `/operations/session-handoffs/` AND `/website/operations/session-handoffs/` (check both — divergence is known).
- Session 12 handoff specifically (it flags the R20a gap on the hub).
- `/operations/decision-log.md` — scan for hub-related entries. Note the absence of an Ask-Org entry.
- `/operations/knowledge-gaps.md` — scan for entries on context layers, brain loaders, file path resolution.

**Companion guides:**
- `/summary-tech-guide.md`
- `/summary-tech-guide-addendum-context-and-memory.md` (note: this addendum is being corrected in the same pass that produced this prompt, because the prior version understated the hub's maturity).
- `/users-guide-to-sagereasoning.md`

---

## 5. The task — in four tracks

The work splits into four tracks. They are ordered so that each inherits from the previous.

### Track A — End-to-end verification on real founder data (primary; required for 0h hold-point exit)

Build a verification pack Clinton can execute. Must cover:

1. **Standard mode, each of the five agents** (ops, tech, growth, support, mentor), one real founder question each. Expected outputs specified in advance. Clinton runs them through the UI and compares.
2. **Ask-the-Org mode** on one real question where Clinton wants cross-domain input. Expected shape of response specified in advance.
3. **Conversation persistence.** List conversations via GET `?list=true`. Load a conversation by id. Confirm hub isolation (founder-hub vs private-mentor).
4. **Observer contributions.** At least one run where an observer contribution lands and one where none lands. Confirm non-blocking behaviour when an observer fails.
5. **Graceful degradation.** Force one brain loader to fail (if feasible without deploying). Confirm the endpoint still returns, with a self-disclosing stub noted.
6. **Cost visibility.** Confirm `pipeline_meta` appears in responses. Record observed per-call cost for each agent across the verification pack and report a cumulative total for the session.

Deliverable: a short, copy-paste verification pack Clinton can run in one sitting, plus a results template Clinton fills in with "pass / fail / notes" per item.

### Track B — R20a distress check on the hub (PR6 territory; decide now whether to close)

The distress check is not invoked on `/api/founder/hub`. The session 12 handoff flagged this for P2. Options for this session:

- **Option B1 — Close now.** Add `enforceDistressCheck` at the top of the POST handler in standard mode and ask-org mode. Because this changes a safety-critical invocation path, this is **Critical** risk under 0d-ii / PR6 and requires the full Critical Change Protocol (0c-ii).
- **Option B2 — Hold until P2.** Log the decision to defer with reasoning (PR7). The reasoning would be: hub is founder-only, risk is low, P2 is the designated phase, and closing now risks scope creep into safety-critical code without the rest of P2 context.
- **Option B3 — Partial close.** Add the check in the path most likely to surface distress — the mentor path — while leaving the other four agents until P2.

Present these as options with reasoning. Clinton decides.

### Track C — Documentation gap-closure (low-risk, high-value)

Four documentation items with no production risk:

1. **Retroactive decision log entry for the Ask-the-Org feature.** Date, decision, reasoning, rules served, impact, status. Draft it; Clinton reviews.
2. **`MENTOR_CONTEXT_V2` feature flag posture.** Document: current setting, what changes when it's on, what changes when it's off, rollback plan, who toggles it. Flag as **[TBD]** any part Clinton must confirm. Place in `/operations/`.
3. **Consolidate session handoff path divergence.** Propose a single canonical path (recommend `/operations/session-handoffs/`), produce a move list (not executed until approved), and add a pointer README in the now-deprecated path.
4. **Short hub route README.** Purpose, endpoints, shape of responses, known gaps. Placed adjacent to `route.ts` so future agents opening the folder see it.

### Track D — Minimum viable test coverage (standard risk; enables safer future work)

No tests exist for the hub. Before any meaningful change to the route, add:

1. **Route integration test** — POST with each agent, Ask-Org mode, GET list, GET by id. Mock the Anthropic client to avoid cost. Assert on response shape, not content.
2. **R20a invocation guard extension** — the existing test file `r20a-invocation-guard.test.ts` asserts distress check on 8 routes. If Track B closes the gap, add `/api/founder/hub` to the guarded routes.
3. **Hub isolation test** — POST with `hub_id: 'founder-hub'` and then GET with `?hub_id=private-mentor` and assert no bleed.

Present this as a scoped test pack with an estimate of sessions required. Do not build it until Track A is passed and Clinton approves proceeding.

---

## 6. Constraints that apply

| Rule | What it means for this work |
|---|---|
| **R0** | Log any consequential decision in this session to `/operations/decision-log.md`. |
| **R5** | Cost visibility is already present in `pipeline_meta`. Confirm it in Track A. Cost cap enforcement is out of scope for this session unless observed costs during verification warrant raising it. |
| **R15** | Supervised level only. The hub already returns recommendations, not actions. Do not add any autonomous action loop. |
| **R16** | Intimate founder data (practitioner profile) already flows through the endpoint. No per-request audit log of what was sent to the LLM currently exists — flag for future work; do not build it this session. |
| **R20** | R20a is not invoked on this route. Track B addresses the decision. |
| **PR1** | Single-endpoint proof before surface rollout. The hub is the single endpoint. It must reach Verified before any orchestration is rolled out to other endpoints. Do not consider rollout this session. |
| **PR2** | Build-to-wire verification in the same session. If you add any wired code this session, you verify it this session. |
| **PR3** | Safety systems are synchronous. If Track B closes the R20a gap, the check runs synchronously before the primary response is constructed. |
| **PR4** | Model selection is a constraint. Do not change model assignments (Sonnet for primary, Haiku for observers) without re-reading `constraints.ts` and confirming the change is within the reliability boundary. |
| **PR5** | Knowledge-gap carry-forward. Anything re-explained in this session is flagged; on third recurrence it earns a KG entry. |
| **PR6** | Any change to distress-classifier invocation is Critical risk regardless of apparent scope. Track B is Critical. |
| **PR7** | Decisions not made are documented. If Tracks B, C, or D are deferred, log the deferral. |
| **0c-ii** | Critical Change Protocol applies to Track B if Option B1 or B3 is chosen. |
| **0d-ii** | Risk classification for every change. Urgency does not lower classification. |

---

## 7. What "useful live state" means for this work, specifically

At session end, the hub is "useful and live" when all of the following are true:

1. Clinton has executed the verification pack from Track A and can mark pass / fail / notes per item.
2. The results are recorded in a file Clinton can return to.
3. Track B has a decision — close now (with Critical Change Protocol completed), hold until P2 (with deferral logged), or partial close (with CCP for the closed portion).
4. Track C documentation is drafted or queued with explicit reasoning if deferred.
5. Track D test scope is proposed with an estimate; not built unless Track A is passed and Clinton approves.
6. A session handoff note per 0b is produced at close.
7. Any decisions are logged to `/operations/decision-log.md`.

**Useful does not mean impressive.** Useful means Clinton can use the hub with confidence, knows which gaps remain, and has the evidence to exit 0h.

---

## 8. Steps in order

**Step 1 — Brief back.** Respond in under 300 words demonstrating you have read Section 2. Name: the current line count of `route.ts`, whether R20a is invoked on the hub, what `MENTOR_CONTEXT_V2` gates, which two UI pages call the endpoint, and what phase governs persona wiring (P3). If you cannot do this confidently, say so and ask which source to re-read. Do not guess.

**Step 2 — Propose the session shape.** Based on Section 5, propose:
- Which tracks to run this session and in what order.
- For Track B, present the three options with reasoning — do not prescribe.
- An estimate of how much of the work fits in one session.
- Anything you would push back on (AI signal: "I'd push back on this").

**Step 3 — Wait for approval.** Clinton picks the session shape. If Clinton says "explore this" or "design this", do not build. Build only on "build this" or equivalent.

**Step 4 — Execute Track A first, always.** Verification must precede any new change. Track A output is the evidence base for the decisions in Tracks B, C, D.

**Step 5 — Close properly.** Produce a session handoff note per 0b, in the canonical handoff path (propose canonical path per Track C if the divergence is unresolved). Log decisions to the decision log. Flag any concepts re-explained for PR5.

---

## 9. Explicit scope cap — will not do in this session

- Will not roll out the orchestration pattern to any endpoint other than the hub (PR1).
- Will not wire personas into the hub (deferred to P3).
- Will not activate Sage Ops beyond supervised level (R15).
- Will not enable any autonomous action loop.
- Will not modify the distress classifier, Zone 2 classification, Zone 3 redirection, or their wrappers without explicit Clinton approval and full Critical Change Protocol.
- Will not deploy to production; any deployment decision is Clinton's, taken after verification.
- Will not modify any file in `/adopted/` without explicit approval.
- Will not expand R5 cost cap enforcement at the endpoint unless Track A observations warrant it, and only then with Clinton's approval.

---

## 10. Signals for this session

Founder signals and your signals — use the full vocabulary from the project instructions (0d and 0d-ii). A short reminder of the ones most likely to matter here:

| Founder signal | Meaning |
|---|---|
| "explore this" | Think, present options, don't build. |
| "design this" | Architecture / spec only, no code. |
| "build this" | Write functional code, wire it, verify in session. |
| "I've decided" | Execute without re-debating. |
| "I'm done for now" | Stabilise, write the handoff, close. |
| "treat this as critical" | Reclassify to Critical and apply 0c-ii. |

| Your signal | Meaning |
|---|---|
| "I'm making an assumption" | Proceeding on incomplete info — correct me if wrong. |
| "I need your input" | Can't proceed without a decision. |
| "I'd push back on this" | Want to explain a better approach before executing. |
| "This change has a known risk" | Confident in approach, naming a specific failure mode first. |

---

## 11. One last instruction

The reason this prompt supersedes the earlier one is that a prior scan of the codebase missed the `founder/hub/route.ts` file. That is a useful instance of how quickly an agent-authored briefing can diverge from reality. Treat that as a live warning for this session as well: before proposing work, locate what exists. Do not assume absence from a summary.

*End of session prompt.*
