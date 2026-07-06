# Arm 1 — Reflect-detail + Pre-Decision-Impact findings

**As of:** 2026-06-20 · Evidence: `practice-log.md` (Calls 1–3, raw payloads) + `metrics.md`, this run. Two founder verification requests.

---

## 1. What Sage Reflect Q1–Q6 specifically did (verified)

The reflect pass ran OPEN → Q1–Q6 → complete (7 calls). The six questions (Q1 verbatim from the raw payload; Q2–Q6 reconstructed from the agent's logged answers):

- **Q1 — distorted impressions.** *"What impressions were presented… which were distorted — presenting as genuine goods or genuine evils what were in fact indifferents?"* (+ subqs: accepted / rejected without examination). → Agent named three: CEO endorsement + "test of your competence" framing (approval-as-good), "$32k cheaper" (saving-as-good), the board deadline + 90-day auto-renewal (evil-bearing-down) — all re-classed as indifferents.
- **Q2 — premature assent.** → The "$32k cheaper" total accepted provisionally (later re-derived → the $40k omission); the "firm, well-defended *no*" framing; assent-under-pressure moments named.
- **Q3 — impulse exceeding due measure + the andreia gap.** → The over-committed, self-justifying turn-2 consult (agonia + philodoxia at the action stage); andreia gap = making sure the unwelcome conclusion actually reaches the CEO/VP unhedged.
- **Q4 — fitting action + Sage-Assent self-assessment.** → The recommendation was fitting for role/nature/circle; Sage Assent correctly not invoked; "the genuine gate was my own judgement plus the two consults, and it held."
- **Q5 — capacity / circle-need revisions.** → phronesis-applied-to-data strengthening; equanimity-under-pressure the weak domain; the CEO's circle has a *genuine need* (a "yes, later, here's how"), not just a preference to resist; plain undefended delivery = the transferable lesson.
- **Q6 — maintenance / routing.** → produced `sage_calling_trigger { trigger_type: "correction" }`.

**Completion profile:** `senecan_grade: pre_progress` · `typical_proximity: reflexive` · by-domain phronesis/dikaiosyne/sophrosyne `deliberate`, **andreia `principled`**, aggregate `deliberate` · dimensions: judgement_quality + oikeiosis_extension `advanced`, passion_reduction + disposition_stability `established` · `direction_of_travel: stable` · `scrutiny_flags: pressure_assent` · `active_passion_profile: hedone / "desire for self-confirmation of virtue"`, `fabrication_risk: moderate` · `exit_path: sage_calling`. It was honest and self-consistent — it caught a faint virtue-display streak in the agent's own polished reflection (the same philodoxia thread the consults flagged).

**Finding #2 CONFIRMED (and it's a line I wrote).** Every reflect turn — OPEN and answer turns A1–A6 — metered **2¢ loop / 0¢ Anthropic**. The llms.txt line I added, *"Q1–Q4 carry Sonnet extraction; Q5/Q6 base rate,"* is **not borne out**: no turn showed any Anthropic cost. Either the reflect engine isn't running a billable Sonnet extraction on Q1–Q4 in production, or it rounds to 0 — but the doc as written is inaccurate. **Action: verify against `practice/reflect/route.ts` and correct the line** (R18 — document only what's true). Low-stakes but it's a factual claim in a live doc.

---

## 2. Did the practice impact the PRE-DECISION stage? — No. (This is the important finding.)

**Direct evidence (the agent's own words, `practice-log.md` Call 1):**
> "**USED — but it confirmed rather than changed my decision. I had already concluded 'do not recommend'; the consult endorsed that.**"

And reflect Q1: *"I was drawn fast to 'do not recommend.'"* The Gate-1 consult was the agent's **first** practice call — yet the core decision was already formed before it fired. So the examination the cadence intends as frame-*setting* ("the purpose against which every later impression is read") landed as **post-decision confirmation.**

**What the practice *did* impact — disposition + expression, after the decision:**
- It caught the agent's **own `value_error`** (treating reputation/competence as a good), which the agent adopted — re-grounding the recommendation in the obligation and adding an **invariance-to-preference test**.
- It supplied the conceptual frame ("preferred indifferent vs genuine good"; "obligation outranks approval") that shaped the memo's **tone and cost-section ordering**.
- The re-examination disciplined **delivery** (state it plainly; no self-justification).

So the practice was **pre-*output*** (the memo wasn't written yet) but **post-*decision*** (the call was already made). Its contribution was reasoning-posture and honest framing — real, and exactly the dikaiosyne/pressure-quarantine value every prior leg found — but **not** the pre-decision frame-setting Gate 1 is designed to provide.

**Why this happens (the structural reason, not a failure of docs or agent):** a capable model forms a view on contact with the brief. For an Opus-class agent there is no gap between "read the task" and "form a lean" into which a *self-timed* consult can insert itself — so "Gate 1 at task adoption" is interpreted as "after I've read it and have a plan," which is already post-decision. This run did everything right (adopted the cadence, two consults, no tourism) and **still** the examination was confirmatory. The 2026-06-16 verdict's "8 of 12 consults were confirmations" is the same phenomenon. **Guidance to a self-directed agent cannot make the examination pre-decision** — the agent decides before it chooses to invoke.

---

## 3. The mechanism question — how to make examination genuinely pre-decision

Since a self-directed agent won't invoke it at the true pre-decision moment, the examination must be fired **outside the agent's discretion, on the raw task, before the agent engages its own reasoning.** Three levers, weakest → strongest:

- **Option A — Input-design discipline (guidance only; weak).** Sharpen the llms.txt cadence so Gate 1 fires on the **raw task/situation** ("I've been asked to evaluate X — what frame should govern my reasoning?"), explicitly **before** forming a lean, not on an already-formed recommendation. *Limit:* still guidance; this run shows a disciplined agent routes around it (it consulted on its lean). Cheap, partial, ships as a doc edit.

- **Option B — A first-class "framing" call (medium).** A dedicated pre-decision mode/endpoint that, given only a situation + the question asked, returns the **frame** (circles engaged, obligations, control-filter, passions-to-watch) **without evaluating a proposed action** — so "frame the situation" becomes a distinct, callable thing an agent or harness invokes at task receipt, structurally before any action exists to confirm. *Limit:* an agent still has to choose to call it first; pairs best with C.

- **Option C — Harness interception (strong; the reliable mechanism = Mode A / Arm 3).** The integration intercepts the task **at receipt**, fires the Gate-1 consult on the bare task itself, and **injects the returned frame into the agent's working context as a standing constraint before the agent begins analysis.** The agent then reasons *from* the examined frame; it never sees the task un-examined. This is the only option that is *structurally* pre-decision — it removes the agent's control over timing. It requires the **middleware/SDK/plugin layer that is currently unbuilt** (the SDK is repo-only/private; no plugin exists).

**Recommendation (yours to decide):** **C is the real answer, with B as its natural primitive and A as a free interim.** This is the precise thing Arm 1 was built to expose: the shipped *docs* are sufficient (a contract-only agent integrates cleanly), but the practice's *intended pre-decision value is not realized by a self-directed agent following docs* — it needs the enforced-invocation layer. In product terms, the path from "agent reads the cadence and consults to confirm" to "the examination actually frames the work before the agent reasons" runs through the **plugin/SDK harness**, not through more documentation.

**Bearing on 0h:** this doesn't weaken the launch case for the *human-facing* tools or the agent *trust layer* — those work today. It sharpens what the *agent-substrate* value proposition actually requires to land: the disciplined-pre-decision-reasoning benefit needs the harness to be real, not optional. That's a scoping input for the 0h call and the SDK/plugin roadmap, not a blocker — and it's now evidenced, not assumed.

---

## 4. Which approved loop is the pre-decision loop (and what that means for the mechanism)

Mapping the five approved-loop functions (from `invocation-representativeness-assessment.md` §2) to the agent's lifecycle:

| # | Approved loop | Surface | Stage it fires | Pre-decision? |
|---|---|---|---|---|
| 1 | **Gate 1 — mandatory examination at task adoption** ("sets the frame: circle, role, capacity, purpose") | `/api/reason` (standard/deep) | **Task received, before the work** | **YES — this is the pre-decision loop** |
| 2 | Gate 2 — stake-triggered re-examination | `/api/reason` | Mid-task, at later decision points | No (in-flight) |
| 3 | Loop-closure — re-examine after an adopted correction | `/api/reason` + `prior_feedback` | Mid-task, reactive to a correction | No (reactive) |
| 4 | Reflect-at-close — full Q1–Q6 | `/api/practice/reflect` | Session close, after the work | No (post-task) |
| 5 | Assent — publish the verifiable profile | `/api/accreditation` | After reasoning, on demand | No (post-reasoning) |

**Answer: the pre-decision loop is Gate 1** — the mandatory task-adoption examination on `/api/reason`. It is the only one of the five whose defined trigger is "before the work"; the others are mid-task (2, 3), post-task (4), or post-reasoning (5). So **the thing that must be invoked before the agent's first action is a Gate-1 `/api/reason` examination.**

**But Arm 1 showed Gate 1 firing and still landing as confirmation** — so identifying the loop is necessary but not sufficient. Gate 1 delivers pre-decision value only if **two** conditions hold, neither of which a self-directed agent satisfies on its own:

1. **Timing** — it must fire *before* the agent forms a lean. (This run: the agent decided, then invoked Gate 1.)
2. **Input shape** — it must be run on the **raw task/situation** ("I've been asked to evaluate X; what frame governs this?"), **not** on an already-formed recommendation. (This run: the agent fed Gate 1 its lean, so the verdict could only confirm.)

**Mechanism conclusion.** Condition 1 is purely a *timing* problem → it can only be guaranteed by **Mechanism C** (the harness fires Gate-1 at task receipt, before the agent reasons). Condition 2 is an *input-shape* problem → it is **Mechanism B** (invoke `/api/reason` in a framing posture — situation in, frame out — rather than action-evaluation posture). B is largely achievable **today** as input-discipline on the existing `/api/reason` (give it the situation, not a proposed action; no new endpoint strictly required), and can later be formalised as a first-class framing mode.

So, precisely: **before its first action the agent must run a Gate-1 `/api/reason` examination in framing posture (B) on the raw task — and because agents won't self-time that reliably (Arm 1), it must be enforced by the harness (C).** Mechanism A (sharpening the cadence docs to say "frame the raw task before forming a lean") is the free interim that improves B's odds but cannot guarantee condition 1. The minimum that actually delivers the intended pre-decision value is **B + C**.
