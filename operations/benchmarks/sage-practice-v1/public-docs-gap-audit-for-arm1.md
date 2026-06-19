# Public-Docs Gap Audit — Can Arm 1 (contract-only) Succeed?

**As of:** 2026-06-19 · **Status:** Audit finding for founder decision (non-governing). Companion to `invocation-representativeness-assessment.md`.
**Question:** Do the live public surfaces reflect the product line + approved loop well enough for a contract-only agent to integrate and run the loop unaided?
**Surfaces audited (everything an external agent can see):** `website/public/llms.txt`, `website/public/.well-known/agent-card.json`, `website/src/app/api-docs/page.tsx`. Diffed against the actual route code. Two load-bearing claims re-verified by direct grep.

---

## Bottom line

Split verdict.

- **Approved-loop *grounding* (the concepts): GOOD.** The two-gate cadence, the Gate-2 self-screen, loop-closure, reflect-at-close, and the risk→depth ladder are all clearly documented in `llms.txt` (439–491) and mirrored in the agent-card extensions. An agent reading the contract learns *when* to examine. No change needed here.
- **Product-line *call mechanics*: MATERIALLY INCOMPLETE for 3 of the 4 products.** An agent knows *when* to act but, for three of four products, cannot reliably learn *how to call them* from public docs alone. **As they stand, the docs would cause Arm 1 to fail for documentation reasons, not product reasons** — which would waste the run.

The irony worth naming: v4 §C ("verified call shapes so you do zero discovery") was you unconsciously patching exactly these gaps by hand. Arm 1's whole purpose is to remove that patch — so the patch has to move into the shipped docs first.

---

## Per-product status (and Arm 1 impact)

| Product | Endpoint | Discoverable? | Call shape in public docs? | Arm 1 impact |
|---|---|---|---|---|
| **sage-reason** | `/api/reason` | Yes (llms.txt 95–148) | **Marginal.** Request fields OK (`input`, `depth`, `response_format`, `prior_feedback`, `continuation`/`clarification` all documented). **But no full happy-path response example** — the verdict nesting `.assessment.assessment`, `meta`, `prose`, deferred-narrative, and `examination.ref` shapes are described in prose, not shown. The `.assessment.assessment` nesting already bit a prior run. | **Workable** — agent can make one exploratory call to learn the shape — but a response example removes the friction and the parse-error risk. |
| **Sage Reflect** | `/api/practice/reflect` | Concept only | **Absent.** Confirmed by grep: appears only as the practice-hint + "fires at close" disposition. **No request shape** (`session_id`, `agent_id`, `session_summary` on open, `response` on turns — `session_summary` appears nowhere public), **no response shape**, no stateful open→Q1–Q6→complete flow, no auth note. | **BLOCKING.** Reflect-at-close is the loop's default closing step. A contract-only agent cannot construct the call → it either fails the step or breaks the rules by reading source (the exact v3 friction). This blocks even the narrow Arm 1. |
| **Sage Assent** | `/api/accreditation/{id}` | Yes (llms.txt 258–307; agent-card `sage-assent-write-auth/v1`; api-docs section) | **High friction.** The `provenance.signed_assessments` round-trip is named but the extraction path is ambiguous; **`CarriedProfile` internals** (`accreditation_record`, `evaluated_actions`, `window_config`, `carried_candidates`), `transition_result`, the error codes (403/422/409…), and the loop-closure gate are missing/partial. | **Not needed for the Meridian memo task** (no accreditation write). Blocks only if a scenario exercises the trust layer. Caps what Arm 1 can *claim*. |
| **Sage Calling** | `/api/calling` | **No — invisible.** Confirmed by grep: zero matches in all three surfaces. | **Completely undiscoverable.** An external agent cannot know it exists. | **Not exercised by Meridian.** But "Arm 1 tests the product line" is false until Calling is documented at all. |

---

## What Arm 1 needs, by scope

**Option A — Minimal unblock (run Arm 1 on the Meridian task as designed).** The Meridian memo only exercises the consult + loop-closure + reflect-at-close. So the binding fixes are just two:

1. **Document the Sage Reflect wire shape** (request: open call with `session_summary`, answer turns with `response`; response: the `interaction_type` progression, the Q1–Q6 flow, completion profile read-back, the distress-redirect shape; the `sr_assent_`/`sr_prac_` auth note). *Without this, Arm 1 cannot close the loop honestly.*
2. **Add a full `/api/reason` response example** (both `full` and `assessment_first`), showing the `.assessment.assessment` nesting, `signature`/`key_id`, `meta`, `narrative` deferred, and `examination.ref`. *Removes the exploratory-call dependency and the nesting-parse risk.*

Guardrail is optional in v4, but if you want it available, the deferred `/api/guardrail` api-docs section (already on your follow-up list) should land too.

**Option B — Full line coverage (Arm 1 can legitimately test "the product line").** Everything in A, plus:

3. **Document Sage Assent fully** — the `CarriedProfile` shape, the `provenance` extraction round-trip (which field of `/api/reason` to copy), the error codes, and the loop-closure gate.
4. **Give Sage Calling a public contract at all** — endpoint, auth (same `sr_assent_`/`sr_prac_`), the session flow, `interaction_type` values, the approve step.

Note B is also a prerequisite if you ever want **Mode C autonomous discovery** to reach the trust layer — which §8.2 of the design calls the central agent-developer benefit.

---

## Recommended sequence (the test is the acceptance check)

A contract-only run is, in effect, an **acceptance test of the public docs.** Running it on today's docs guarantees a reflect-step failure that only re-confirms a gap you already know about. So:

1. Fix the binding gaps (Option A minimum) → 2. *Then* run Arm 1 → 3. The run now measures "do the corrected docs actually let an agent integrate + adopt the loop unaided." That is the signal you want before the 0h launch call.

If you'd rather not touch docs yet, the honest alternative is to keep the v4 hand-patched run and **label it explicitly** as "integration assumed, not tested" — but that leaves the single biggest adoption risk (onboarding friction) unmeasured.

---

## Caveats

- This is a documentary diff (public surfaces vs route code), not a live integration attempt. The surest confirmation is a dry-run: hand an agent only the public docs + a key and watch where it gets stuck. That dry-run *is* Arm 1.
- Fixing these docs is a content change to live public surfaces (R18 honesty applies — document only what's true and live). It is not a code/flag/perimeter change, so it's low-risk, but it is a real edit to shipped material and should follow your normal review.
- I have not edited any public surface. Drafting the additions is the next action, pending your scope call.
