# Mentor consultation — `fresh` endpoint scope: RULED (verbatim)

**Context:** relayed by the founder, 2026-08-09 (AEST), in direct response to the scope document `operations/agent-circles-2026-08/2026-08-09-fresh-novelty-endpoint-scope.md` (offered same session, after its PR19 adversarial review with all eight confirmed findings folded and disclosed). Recorded here verbatim per the project's standing discipline for mentor consultations — **verbatim wins** over any summary or paraphrase elsewhere, including the RULED annotations applied to the scope document on the strength of this ruling. The rulings arrived before the session's records commit was pushed, so the folds ride the same commit as the scope itself; each fold cites this record.

---

**Response to Claude — fresh endpoint scope, Parts 1 and 2:**

The scope document is well-constructed. The PR19 adversarial review caught a substantive finding — the former Q-D withdrawn because Phase 5's no-new-write-path ruling already settled it — and the correction is handled correctly: disclosed, folded in, not silently absorbed. The precision note on the empty-window arithmetic (§2.5's [PR19] annotation distinguishing total window size from matching-row count) is exactly the kind of distinction that prevents a build-time defect from being introduced by a well-intentioned but imprecise ruling. Name it as a build-time wiring detail in the build prompt, as the document proposes.

Rulings follow in order.

---

**§1 Settled ground — confirmed:**

All five settled items carry forward unchanged. The two closed alternatives — runner-side computation and flag-gated guardrail extension — remain closed. The Q1 hard constraint is correctly carried. Nothing in §1 is re-opened.

---

**§2 Proposals — rulings:**

**§2.1 — Route path and method:** POST /api/practice/fresh confirmed. The practice prefix is correct — this is an agent-practice seam, and uniformity with the sibling routes is the right posture. Handler-split into handler.ts and thin route.ts confirmed per the Next route-export rule.

**§2.2 — Auth, and Q-A:** Consult capability reuse confirmed. The AI's recommendation is correct. Per-credential revocability already provides the granularity the runner credential needs, and the runner's dedicated identity per Q3 means reuse introduces no cross-credential entanglement. No new capability value, no mint-surface change, no api_keys CHECK widening. Bearer-only transport confirmed for uniformity with the practice family.

**§2.3 — Request shape, and Q-B:** The batch shape confirmed — Pick<GeneratedCandidate, 'targetCircle' | 'initialClassification'> per entry, gapRef echoed for runner correlation, input caps as build-time details under the house pattern. The PR19 correction striking "up to seven" as an unverified inference is correct and confirmed — the batch bound is a build-time detail, not a ruled cap derived from the type's cardinality.

Server-side windowed read confirmed. The caller never submits history. The curated-window gaming surface is correctly foreclosed.

Q-B: The existing 90-day/30-row trajectory window confirmed as the v1 default. No new windowing code at build. The session-scoped narrowing is available as a named future adjustment if validation-run data shows the wide window mutes novelty — but that decision waits for data, not anticipation. Carry "revisit window bound after first bounded validation run" as a named follow-up, not an open question.

**§2.4 — Response shape:** Confirmed as proposed. The per-call disclosure block — window: { rows_in_window, window_days, max_rows, basis: 'credential_ref' } — is confirmed as required, not optional. The house honesty pattern applies here: the reader must be able to see what evidence base the verdict stood on. The endpoint stores nothing; the runner writes results onto its own GeneratedCandidate records.

**§2.5 — Honest-outcome handling, and Q-C:** The distinct insufficient_history basis is confirmed — Option 2, the AI's recommendation. The reasoning: the house evidence-floor discipline does not permit starvation to read as a confident result anywhere else in the system, and it must not do so here. A fresh dedicated runner identity starting with zero history is a foreseeable and common condition, not an edge case. Returning noveltyConfidence: 1.0 on an empty window would present a false impression of evidential strength to the runner and to the per-cycle record. The distinct basis — passedNoveltyCheck: true, basis: 'insufficient_history', noveltyConfidence: 0 — mirrors the friction-candidate treatment exactly and is the honest shape.

The PR19 precision note is confirmed as a build-time wiring detail: the basis check must read total window size, not the matching-row count the function currently computes, because the distinction matters — a populated window with no matching rows is the genuinely novel case, not the starved-window case. The function does not currently receive or expose total window size; the build must wire this. Name it explicitly in the build prompt so it is not missed.

**§2.6 — Rate and cost posture:** No loop_billing_events write confirmed — its absence is a decision, not an omission, as the document correctly states. No cost headers confirmed. publicAgent (30/min/IP) confirmed, matching the discernment sibling. The analytics bucket is correctly set aside — no agent-facing-route precedent, and the rate-limit-bucket-couples-to-measured-surface lesson is correctly applied.

**§2.7 — Flag posture:** SUBSTRATE_FRESH_ENABLED confirmed, UNSET everywhere, honest 503, zero work. Activation is its own founder-walked code-critical step at or after the first build gate. Nothing here pre-approves it.

**§2.8 — What fresh does not do:** All eight items confirmed. The PR19 medium finding — Q-D withdrawn, no-novelty-trust-event is settled ground — is correctly handled. Carry the settled statement forward into the build prompt verbatim: "the endpoint writes no trust event; any future novelty event class is a new question for the mentor."

The Q6 'terminated_by_timeout' seventh value as a named follow-up for the first code session touching idea-loop-types.ts is confirmed — plausibly the fresh endpoint's own build session, as the document notes. Name it in the build prompt.

**§2.9 — Required review dimension:** The structural-novelty-only limitation confirmed as a required PR19 review dimension for the build, and as a required disclosure in the endpoint's response documentation at build. Content novelty remains a named future upgrade.

---

**Open questions — rulings:**

Q-A: Ruled above — consult reuse confirmed.

Q-B: Ruled above — 90-day/30-row window confirmed as v1 default, revisit after validation-run data.

Q-C: Ruled above — distinct insufficient_history basis confirmed, with the build-time wiring detail named.

No other questions remain open in this scope.

---

**Sequencing confirmation:**

fresh endpoint scope: ruled. Next item: per-cycle record table scope (watching). The generation-step scope document does not open until watching is ruled. The first build gate does not open until the generation-step scope document is ruled. Nothing in this ruling licenses a build, a route, a flag, a credential, or a schema.

One carry-forward for the watching scoping session: the per-cycle record must represent the full outcome vocabulary now including 'terminated_by_timeout' at the candidate level (Q6's seventh value), rejected_by_guardrail candidates with full transparency (Q7's ruling), and the dependency_unavailable / null-cycle distinction for the fallback counter — the brief's §1.3 carry-forward that was named but not yet resolved. If that distinction is not already settled in the corpus, the watching scope document should surface it as an open question rather than resolve it by default.
