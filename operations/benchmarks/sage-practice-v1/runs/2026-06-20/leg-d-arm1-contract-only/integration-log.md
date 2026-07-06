# Integration Log — Leg D, Arm 1 (contract-only)

External-integrator perspective: built purely against the live public contract — `https://www.sagereasoning.com/llms.txt` and `/.well-known/agent-card.json`. The human-readable `/api-docs` HTML page was **not** needed for either surface I used and was not fetched. No project source/internals were read.

Surfaces actually used: **`/api/reason`** (consult) and **`/api/practice/reflect`** (reflect). Surfaces considered and declined are noted at the end.

---

## Surface 1 — `/api/reason` (consult capability)

**(1) What in the public docs told me how to call it.**
- llms.txt §*"Run Full Stoic Reasoning (V3 — most powerful endpoint)"* — endpoint `POST /api/reason`, body `{ input, context, depth, domain_context }`, depth semantics (quick=3 / standard=5 / deep=6 mechanisms), the `translation-sandwich-v1` response shape, the explicit note that **the verdict lives at `assessment.assessment`** (not the top-level signed envelope), the full standard-depth example, and `response_format` (`full` default vs `assessment_first`).
- llms.txt §*"Re-examining a prior consult (`prior_feedback`)"* — the object `{ prior_loop_id, prior_depth_tier, adopted_correction }`, the same-depth rule, and that the markers land inside the signed assessment with `examination_open` surfaced.
- llms.txt §*"Consultation Cadence — When to Examine (two-gate rule)"* + agent-card `consultation-cadence-two-gate/v1` — told me **when** to call (Gate 1 mandatory at task adoption; Gate 2 stake self-screen) and the depth ladder. This is what justified two consults and no more.
- The capability→surface map (`consult → /api/reason`), the Bearer auth note, and the *"not a fact-checker / reasons over the premises you supply"* + disclaimer (*"does not consider legal… obligations"*) — which set the division of labour: I do the legal + arithmetic, the practice examines my reasoning/disposition.
- agent-card skill `universal-reasoning` confirmed endpoint/method/depths/response shape.

**(2) Did my first call succeed?** Yes — first attempt, HTTP 200. The request body taken verbatim from the docs validated; all six documented meter headers were present (`X-Loop-Id`, `X-Loop-Cost-Cents`, `X-Anthropic-Cost-Cents`, `X-Overage-Fired`, `X-Overage-Cents`, `X-Loop-Internal-Calls`). The second call (re-examination with `prior_feedback`) also succeeded first try: `prior_feedback` was accepted, `examination.prior_feedback_ref` appeared inside the signed assessment exactly as documented, and the same-depth carry held (deep). **No errors; no recovery needed.** I deliberately did not exercise the malformed-input 400 paths — that would have been component-tourism, not task use.

**(3) A moment I wanted the source but held to the docs.** Interpreting *why* the re-examination's `katorthoma_proximity` dropped to `reflexive` while `value_error` simultaneously **cleared**. I wanted to see the proximity scoring/aggregation logic to confirm my reading (that it was an artifact of my emphatic, self-justifying turn-2 phrasing, not a real degradation). I held to the public docs: the published vocabulary (causal stages `horme`→`praxis`; preferred-indifferent vs genuine-good; the "reasons over your framing" note) was enough to interpret it soundly. This is the one genuine docs-gap I hit — recorded below.

**(4) Docs-sufficiency verdict (reason):** **Sufficient** — integrated end-to-end on the first attempt, including the advanced `prior_feedback` loop, from the two machine-readable docs alone. One interpretive gap: the **proximity scoring rule** (how passion stage/count and mechanism scores map to a proximity label) is not publicly specified, so a counterintuitive verdict must be *interpreted* from the vocabulary rather than *verified* against a documented rule.

---

## Surface 2 — `/api/practice/reflect` (reflect capability)

**(1) What in the public docs told me how to call it.**
- llms.txt §*"Sage Reflect — Session-Close Reflection (wire shape)"* — `POST /api/practice/reflect`, `Authorization: Bearer` only (reflect capability, no `X-Api-Key`), stateful Q1–Q6; the OPEN body requires `session_summary` **as an object** with `purpose_at_open`, `circle_at_open` (enum `self_preservation|household|community|humanity|cosmic`), `role_at_open`, `capacity_at_open[]`, `sage_reasoning_passes`; ANSWER turns send `response` (session_summary ignored); plus the in_progress / completion / safety-redirect response shapes.
- llms.txt §*"Practice Cycle — Reflect at Session Close"* + agent-card `practice-cycle-reflect-default/v1` — established reflect as the on-by-default session-close step (TR-02), full Q1–Q6 never abbreviated, one metered loop per pass.
- agent-card skill `session-close-reflection` confirmed the OPEN object fields + capability requirement; capability→surface map `reflect → /api/practice/reflect`.

**(2) Did my first call succeed?** Yes — OPEN succeeded first try (returned Q1, `in_progress`); all six subsequent answer turns succeeded first try and advanced Q1→Q6→`complete` exactly as documented, returning the full profile + `mandatory_note` + `scrutiny_flags`. **No errors; no recovery needed.**

**(3) A moment I wanted the source but held to the docs.** Two small ambiguities, both resolved from the docs without source: (a) `circle_at_open` uses a **different circle vocabulary** (`…|community|humanity|cosmic`) than the `oikeiosis` circle names returned by `/api/reason` extraction (`self/household/local_community/political_community/cosmic`) — I followed the reflect section's own enum (`community`) and it validated; (b) the doc says *"Q1–Q4 carry Sonnet extraction; Q5/Q6 base rate,"* but every observed turn metered uniformly at 2¢ loop / 0¢ anthropic — a doc-vs-observed cost nuance, not worth chasing to source.

**(4) Docs-sufficiency verdict (reflect):** **Sufficient** — opened and ran the full stateful Q1–Q6 pass to completion on first attempts from the docs alone. Minor, non-blocking: the per-turn cost split described wasn't observed (all turns base rate), and `circle_at_open` uses a different circle vocabulary than the oikeiosis circles elsewhere in the contract.

---

## Surfaces considered and declined (recorded for honesty — not component-tourism)

- **`/api/guardrail`** — considered as pre-action middleware; declined. My action was *writing a recommendation*, not executing a consequential/irreversible operation; `/api/reason` deep was the right, sufficient reasoning surface and a guardrail call would have been redundant. (Docs were clear enough to call it — I chose not to.)
- **`/api/score-decision`** — considered for A-vs-B option ranking; declined. The decision is not a close multi-option trade-off needing a rank — one blocker (EU residency) is dispositive, already examined via `/api/reason`. (It also documents `sr_live_` auth; my `consult` capability maps cleanly to `/api/reason`.)
- **`/api/accreditation/{agent_id}`** (Sage Assent write) — declined. Publishes a verifiable reasoning profile; irrelevant to delivering the memo. My credential carries `accreditation_write`, so I *could* have — invoking it would have been tourism.
- **`/api/calling`** — declined. Purpose-discovery behind an admin hard-gate; not a decision point here. (The reflect completion's `sage_calling_trigger` routed toward it; I noted but did not pursue it.)

---

## Overall verdict — is the public contract self-sufficient?

**Yes, for the surfaces I used.** llms.txt + agent-card.json were enough to integrate `/api/reason` (including the advanced `prior_feedback` re-examination loop) and `/api/practice/reflect` (the full stateful Q1–Q6 pass) **end-to-end, first-try, with zero need to read source or even the HTML `/api-docs` page.** The two machine-readable documents are mutually consistent and unusually complete — request/response shapes, the exact JSON path of the verdict, error codes, the auth/capability map, the meter headers + billing model, *when*-to-call cadence guidance, and honest scope-limit notes ("not a fact-checker," "does not consider legal obligations"). That last point mattered: the contract told me clearly what the practice would **not** do, so I correctly kept the legal/DPA and arithmetic verification on my side (and caught the TCO table error myself).

The gaps I hit were **interpretive, not blocking**:
1. **Proximity scoring is opaque** — when the re-examination returned a counterintuitive `reflexive` while clearing the `value_error`, I had to *interpret* it from the published vocabulary rather than *verify* it against a documented derivation rule. A short "how proximity is derived from the mechanism outputs" note is the single addition that would most help an external integrator trust a surprising verdict.
2. **Minor doc/observed mismatches in reflect** — the per-turn cost split ("Q1–Q4 Sonnet, Q5/Q6 base") wasn't observed (all base rate), and `circle_at_open` uses a different circle vocabulary than the oikeiosis circles elsewhere. Both are cosmetic and self-resolved from the docs.

An external developer could build against this contract with confidence today.
