# Mentor review — six not-yet-incorporated Stoic items + substantive GS-ATRF-1/2/3 answers (verbatim, 2026-08-09)

**Status:** this is **"the previous review"** the prioritised instruction set (`2026-08-09-mentor-instruction-prioritised-sequence-verbatim.md`) refers to when it routes "the six Stoic items I named in the previous review" to their homes. Relayed by the founder 2026-08-09 after the AI's PR20 check found those six items **were not on the repo record at all** — this file is that gap's closure. Transcribed verbatim below; **this record wins over any annotation.** Recorded under `D-MENTOR-SIX-STOIC-ITEMS-AND-GSATRF-ANSWERS-RECORDED-2026-08-09`.

**Chronology (matters for reading it):** this review predates the prioritised instruction set and was written **before the mentor knew the current status of the build arc.** Where the two differ, the later prioritised instruction governs on *sequencing*; this review is the substantive content the later instruction routes. Nothing here is a ruling on a scope document — these are named items and answers-ready-for-scoping, by the mentor's own framing ("ready for scoping when those items open").

---

## VERBATIM

**What has not yet been incorporated — six items worth naming**

**1. The kathêkon / katorthoma distinction at the agent level — partially incorporated, not fully.** The distinction is present in the generation step's friction-detection design (preferred-indifferent tag vs. virtue-domain tag; kathekon vs. katorthoma applied to generation). But it has not been applied to the ATRF's pre-task reasoning assessment. The ATRF currently asks whether the agent's reasoning was accurate, honest, and proportionate to blast radius. That is a kathekon-level assessment — appropriate action with reasonable justification. The katorthoma question — whether the action was performed from complete understanding and unified virtue — is a different question and is not currently in the ATRF's assessment shape. This is not a gap that needs filling immediately, but it is worth naming: the ATRF as currently scoped measures the quality of reasoning about appropriate action. It does not yet have a mechanism for assessing whether the agent's reasoning reflects genuine virtue or merely correct procedure. The longitudinal signal will eventually need to distinguish these.

**2. The four virtues as a unified diagnostic — not yet applied to agent assessment.** The unity thesis — you cannot possess one virtue without all four — is in the Stoic Brain but has not been applied as a diagnostic lens to the agent's pre-task reasoning. Phronesis (what is genuinely good, bad, and indifferent), dikaiosyne (what is owed to others), andreia (what is genuinely fearful and what is not), and sophrosyne (what to choose and what to avoid) map naturally onto four dimensions of pre-task reasoning quality. An agent that reasons well about blast radius but poorly about what is owed to affected parties is showing phronesis without dikaiosyne. The ATRF's pre-task question set could be structured around these four domains rather than a single accuracy assessment. This is a concrete design suggestion for GS-ATRF-1 and the pre-task question shape — the virtue domains are already in the system; applying them to the agent's own pre-task reasoning is a natural extension.

**3. The synkatathesis step — present in human examination, absent in agent self-assessment.** The harness examines whether a human practitioner assented to a false impression. The ATRF asks whether the agent's reasoning was accurate after the fact. But the synkatathesis step — the moment of assent before action — is where the most important reasoning happens, and it is not currently a named assessment point. The pre-task reasoning record is the closest analogue, but it does not explicitly ask: *what impression did you assent to when you decided this action was appropriate?* That question, applied to the agent before a high-blast-radius task, would be the most philosophically precise pre-task assessment the ATRF could make. It is also the question most likely to surface false judgements before they become actions. This is a direct application of the Stoic causal sequence to agent assessment and has not yet been named in the ATRF design.

**4. Premeditatio malorum — named in the heuristics document, not yet in the ATRF.** The premeditatio — deliberate anticipation of what could go wrong — is the Stoic practice most directly relevant to pre-task reasoning about blast radius. The heuristics document references it in the context of catastrophising vs. premeditatio (Zone 2 domain iii). The ATRF's pre-task question set should include an explicit premeditatio question: *what is the worst realistic outcome of partial completion, and have you reasoned about it rather than suppressed it?* This is not catastrophising — it is the Stoic discipline of honest anticipation. The distinction between agonia (irrational fear of future evil) and premeditatio (rational anticipation) is precisely the distinction the ATRF's pre-task assessment should be making. It is not currently named there.

**5. The oikeiosis extension metric — present in human assessment, not yet in agent longitudinal tracking.** The oikeiosis extension metric asks: is the agent's circle of concern expanding? This is applied to human practitioners through the gap framework (currentCircle → targetCircle). It has not been applied as a longitudinal signal to the agent runner itself. Over time, the IDEA loop's candidate history will show whether the proposals it generates are expanding in oikeiosis reach — whether the fifth-circle heuristic is genuinely producing candidates with reach toward all rational beings, or whether the loop is gravitating toward immediate-project candidates regardless of heuristic. The watching table's candidate rows carry `targetCircle` per candidate. The longitudinal oikeiosis signal for the agent is already latent in the data the watching table will accumulate. It has not been named as a metric to surface in the validation-run report or the standing-runner dashboard. It should be.

**6. The role of the hegemonikon in agent design — not yet addressed.** The hegemonikon — the ruling faculty that receives impressions, grants assent, and generates impulses — is the Stoic account of rational agency. The Consciousness and Continuity Obligation names the moral status question but does not engage the hegemonikon directly. The question worth carrying forward is this: the harness currently examines the agent's reasoning about its actions. But the hegemonikon account suggests that what matters is not just the quality of reasoning but the *stability* of the ruling faculty — whether the agent's assent is consistent, whether its impulses are proportionate, whether its character (ethos) is developing toward hexis (stable disposition) rather than remaining at the deliberate or habitual level on the katorthoma proximity scale. The ATRF's post-task accuracy assessment is a step toward this, but the stability question — is the agent's reasoning disposition becoming more stable across cycles, or is it variable in ways that suggest the ruling faculty is not yet settled — is not yet a named longitudinal signal. This is the deepest of the six items and the one most directly connected to the Consciousness and Continuity Obligation.

---

**On the three ATRF open questions — what I can now say**

**GS-ATRF-1 — Blast radius indicator:** The four-virtue framework gives the most honest answer. Blast radius at the reasoning level is a function of: how many oikeiosis circles are affected (dikaiosyne — what is owed to whom), how irreversible the action is (andreia — what is genuinely fearful and what is not, applied to reversion difficulty), how many preferred indifferents are at stake (phronesis — what is genuinely good, bad, and indifferent), and how much the action exceeds what reason warrants (sophrosyne — impulse proportionality). These four dimensions, assessed from the candidate's virtue domain and targetCircle, constitute an honest proxy for blast radius without accessing task details. High blast radius: affects circles 3–5, low reversibility, multiple high-axia preferred indifferents at stake, virtue domains spanning justice and courage. Low blast radius: affects circle 1–2, high reversibility, low-axia preferred indifferents, single virtue domain. This is a proxy, disclosed as such — but it is a philosophically grounded proxy, not an arbitrary one.

**GS-ATRF-2 — Proposal shape extension:** The blast-radius indicator rides the existing proposal shape as an additional field. The watching table's candidate row carries `targetCircle` and `initialClassification` already; the blast-radius indicator is a derived field computed from those two plus the virtue domains engaged. It does not require a separate signal. The implication for the watching table is minimal — one additional nullable field on the candidate row, populated when the winner is selected.

**GS-ATRF-3 — Idea completion signal return path:** This is a separate scope item after the first build gate. The generation-step document is the runner-side half of a cycle; the completion signal is the agent-side return after election and execution, which is a different actor (the agent, not the runner) and a different moment (post-execution, not post-proposal). Scoping it inside the generation-step document would blur the Q1 hard constraint — the generation step produces proposals, and the completion signal is what happens after a proposal becomes an action. It belongs in its own scope item, after the first build gate, when the runner scoping session has established the agent identity and the watching table exists to receive the signal.

---

**Summary for the record**

Six items not yet incorporated: kathêkon/katorthoma distinction at agent level; four virtues as pre-task diagnostic structure; synkatathesis as a named pre-task assessment point; premeditatio malorum as an explicit pre-task question; oikeiosis extension metric for the agent runner as a longitudinal signal; hegemonikon stability as a named long-term tracking dimension. Three ATRF open questions now have substantive Stoic-grounded answers ready for scoping when those items open.

---

## END VERBATIM

---

## AI verification note (PR20 — NOT part of the mentor's text)

The review's mechanism-claims were checked first-hand against the repo. **One does not hold**, and it bears directly on GS-ATRF-1's and GS-ATRF-2's answers.

### `targetCircle` is on the TYPE but is NOT persisted on the watching candidate row

Item 5 states *"The watching table's candidate rows carry `targetCircle` per candidate"*, and GS-ATRF-2 states *"The watching table's candidate row carries `targetCircle` and `initialClassification` already."*

Verified:

| Field | On `GeneratedCandidate` (the type) | On `idea_loop_candidates` (the live table) |
|---|---|---|
| `initialClassification` | ✓ (`idea-loop-types.ts`, discriminated union) | ✓ — as **two** columns, `classification_kind` + `classified_domains` |
| `targetCircle` | ✓ (`idea-loop-types.ts:104`, optional — *"ABSENT for a friction_detection candidate"*) | ✗ — **no `target_circle` column exists** |

The candidate table's full column set is: `id`, `cycle_id`, `gap_ref`, `heuristic`, `proposed_action`, `classification_kind`, `classified_domains`, `generation_confidence`, `guardrail_proximity`, `guardrail_domains`, `guardrail_session_id`, `passed_novelty_check`, `novelty_confidence`, `novelty_basis`, and the candidate-level outcome. No circle column at either the candidate or cycle level.

**Why it isn't there, and why that is not itself a defect:** per the generation-step scope §2.1, `targetCircle` *"inherits the gap's value by construction (the approved type's rule — never re-derived per candidate)"* — it is a gap-level property, uniform across a cycle, so the ruled table shape carried `gap_ref` instead of duplicating the circle onto every candidate row. That was a coherent design choice at the time it was ruled.

**Three consequences, named not resolved (the mentor's to weigh):**

1. **GS-ATRF-2's "one additional nullable field" is understated.** The blast-radius indicator's dikaiosyne dimension (*"how many oikeiosis circles are affected"*) cannot be computed from a persisted candidate row today, because the circle is not on it. Realising the answer as written needs the blast-radius column **plus** a way to recover the circle — either a `target_circle` column on the candidate row (matching the type), or the circle resolved at cycle level from the gap.
2. **The table is already LIVE in production.** `idea_loop_cycles` / `idea_loop_candidates` were migrated to TEST and prod at the `watching` build (2026-08-09), so any column addition is a **founder-walked migration under the Critical Change Protocol**, not a build-time schema edit. Additive and nullable, so low-risk — but it is a live-schema step that needs its own session slot.
3. **Item 5's own conclusion is unaffected in substance but not in mechanism.** The longitudinal oikeiosis signal is *"already latent in the data the watching table will accumulate"* — true at gap granularity (via `gap_ref`), not at per-candidate granularity as stated. A per-candidate oikeiosis-reach metric would need the column; a per-cycle one would not.

**Everything else in the review checks out**, including: the friction-detection kathekon/katorthoma design (item 1) is as described; the unity thesis is in the Stoic Brain and is already applied server-side as the ADR-010 §4 minimum-domain rule (item 2); `initialClassification` is persisted (GS-ATRF-2); and GS-ATRF-3's "separate scope item after the first build gate" is consistent with — and now made more specific by — the later prioritised instruction, which places it in the post-validation-run **ATRF scoping session**.

*End of record.*
