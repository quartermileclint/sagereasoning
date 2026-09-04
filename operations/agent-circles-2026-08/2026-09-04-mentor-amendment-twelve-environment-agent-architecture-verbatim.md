# Mentor amendment — the twelve-environment agent architecture as a named input, and Q-ENV-1…Q-ENV-4 (verbatim)

**Relayed by the founder 2026-09-04**, amending the governing brief for the standing-runner design
session (Part 3 of `2026-09-04-mentor-brief-standing-runner-design-session-and-rulings-verbatim.md`).

**Status: ADOPTED AS BINDING on relay, per project convention. This verbatim record wins over every
summary of it** — including the decision-log entry, R10, the register rows, and any successor prompt.

**Recording entry:** `D-MENTOR-AMENDMENT-TWELVE-ENVIRONMENT-ARCHITECTURE-ADOPTED-R10-RUN-2026-09-04`.

**What it does:** adds one research input (a twelve-environment *agent* architecture) and four design
questions (Q-ENV-1…Q-ENV-4) to the session's open design questions. **What it explicitly does not
do:** modify any existing ruling, reopen any settled question, license any build act, move the M/W/S
deferral, license cross-agent memory, or license profile storage in the runner or any environment
agent.

---

## ⚠ One premise in this amendment is behind the record — named, not silently absorbed (PR20)

The amendment states three times that the session is unopened and its gate unmet:

> *"The session gate (Option S's disagreement-rate data in hand) remains unmet. Nothing here opens the
> session."* … *"They do not gate the session's opening."* … *"End of amendment. The standing-runner
> design session remains unopened and its gate unmet."*

**As at relay, the session is OPEN and has run two sittings.** The mentor's own same-day ruling
(`D-MENTOR-RULING-OPTION-S-GATE-ITEM-LEVEL-SESSION-MAY-OPEN-2026-09-04`) corrected the session-level
reading of the Option S gate to an **item-level** one and reserved the opening to the founder; the
founder opened it in-conversation; **R9 ran, was PR19-reviewed by three blind agents, closed, and is
committed (`d8dfc80`) and on `origin/main`.**

**The half of the statement that is correct:** the Option S gate *is* unmet, and it binds the **M/W/S
floor-semantics election** and **R8-D7's sampling policy** — both of which remain deferred in writing
in R9 and in R10. Nothing in this amendment moves them.

**Why the discrepancy does not block the substance.** The amendment's own sequencing note says the
four questions *"are examined when the session opens, in the order the session determines"* and that
they *"do not gate the session's opening."* The session is open; the questions are therefore examined
now. The stale premise bears on **which vehicle** carries the examination — a third sitting (R10)
folding an amendment, rather than a first sitting receiving a brief — not on **whether** it is
licensed. **Question Q-A of
`2026-09-04-MENTOR-QUESTION-twelve-environment-architecture-clarifications.md` puts this to the
mentor rather than resolving it here.**

---

## The amendment, verbatim

> ## STANDING-RUNNER DESIGN SESSION — AMENDMENT INSTRUCTIONS
>
> **To Claude:** The following amends the governing brief for the standing-runner design session. The amendment adds one new research input and its associated design questions. It does not modify any existing ruling, reopen any settled question, or license any build act. All standing constraints remain unchanged. The session gate (Option S's disagreement-rate data in hand) remains unmet. Nothing here opens the session.
>
> ---
>
> ### NEW RESEARCH INPUT — Twelve-environment agent architecture
>
> **Source:** Architectural assessment produced 2026-09-04. Carried as an orienting design candidate, not a build specification. Status: named input for the standing-runner design session.
>
> **The proposal:** Rather than building task-specific agents, build twelve task-agnostic environment agents — one per cognitive environment — that compose into pipelines for any reasoning job. The same twelve agents serve any client problem by sequencing the appropriate rooms. The Stoic harness remains deterministic and model-agnostic; it routes findings into the appropriate environment rather than being replicated per task.
>
> **What the assessment establishes:**
>
> The combinatorial explosion problem with task-specific agents is real. Task-specific agents multiply without bound as client problems diversify. Environment agents compose. A Forest agent, a Garden agent, and an Arena agent can be sequenced for strategy, due diligence, creative R&D, or executive coaching without writing new orchestration logic for each. The composable pipeline is a first-class reusable artefact, not an implementation detail.
>
> The economic framing is sound for a sole-founder operation: twelve rooms, not twelve products. Twelve well-crafted agents plus a thin routing and harness layer is more maintainable than task-specific agent sprawl. The environments themselves are potentially productisable as modular capabilities.
>
> The Stoic profile and trust layer fit is genuine. Every environment agent reads the same agent trust layer and Stoic profile. The profile becomes a persistent character that travels across rooms rather than being re-implemented per task agent.
>
> **What the assessment does not address — the load-bearing joint the session must examine:**
>
> Each environment agent interfaces with the Stoic harness — the deterministic examination engine. The harness is not a routing layer. It is a moral architecture. Every candidate that surfaces from any environment agent passes through the same examination: impression, assent, impulse, action. The four virtues evaluate every move. The proximity floors fire regardless of which room produced the candidate.
>
> The assessment does not ask what the harness does at the boundary between an environment agent and the examination engine. Specifically: what does the harness do when a Forest agent produces a weak-tie association that is genuinely novel but has no clear kathekon grounding? What does it do when a Cellar agent surfaces an assumption that, once examined, dissolves the entire pipeline's premise? These are not edge cases. They are the normal operation of the adversarial and foundational environments.
>
> The harness-environment interface is the design question the session must answer before the twelve-agent architecture can be evaluated as buildable.
>
> **Rulings that bear on this input:**
>
> - C1: The environment tag is runner-attested. The runner declares which environment it operated in; the harness records it without independent verification. Trust posture: disclosed and unverified.
> - C4: Arena means adversarial examination of the assent attestation only. Q-C1/Q-C2a govern. No task-outcome content. No outcome comparison.
> - D4: Under Q1c's distinct-identities ruling, the runner and the executing agent are distinct. The longitudinal environment sequence records the runner's environment exposure history, not the executing agent's.
> - B4: The clean residual is the executing agent's examined state as held in the harness. The runner reads this state from the harness at cycle start. It does not hold it independently.
>
> **Carried as orienting under UNVERIFIED-AT-RELAY discipline:** The differential pricing observation — Laboratory and Threshold on reliability/SLA basis, Forest and Garden on insight/novelty basis — is a business model input. It is not a design question for this session. It is noted for a later session.
>
> ---
>
> ### DESIGN QUESTIONS THE SESSION CARRIES FROM THIS INPUT
>
> Add the following to the session's open design questions.
>
> **Q-ENV-1 — The harness-environment interface.** What is the contract between an environment agent and the Stoic examination engine? Specifically: does each environment agent produce a candidate in the existing proposal shape, which the harness then examines deterministically? Or does the environment agent participate in the examination step in some way? The constraint is that the examination engine remains deterministic and doctrine-grounded regardless of which generative environment produced the candidate. The session must specify the interface contract precisely enough that a build brief could be written from it.
>
> **Q-ENV-2 — Pipeline sequencing as a first-class artefact.** If composable pipelines are the product — Forest → Garden → Workshop → Arena → Threshold for strategy; Library → Laboratory → Cellar → Arena → Threshold for due diligence — what governs the sequencing? Is sequencing a founder-specified parameter, a harness-computed routing decision, or a runner-declared classification? The session must name the sequencing authority and its trust posture, consistent with C1's runner-attestation principle and the harness's governance role.
>
> **Q-ENV-3 — The twelve-agent architecture's relationship to the standing runner.** The standing runner as currently designed is a single runner identity (`sagereasoning:idea-loop@v1`) that selects environments and dwells in them. The twelve-agent architecture proposes twelve distinct agents, one per environment. These are different architectures. The session must examine whether they are compatible, whether one subsumes the other, or whether they are alternatives. The examination must be explicit, not defaulted.
>
> **Q-ENV-4 — Profile persistence across rooms.** The assessment states that the Stoic profile becomes a persistent character that travels across rooms. Under Q1c's distinct-identities ruling and B4's harness-held state principle, the profile is held in the harness, not in the runner or the environment agent. The session must confirm that profile persistence across rooms is a harness function — the harness supplies the profile to each environment agent at the start of its cycle — and not a cross-agent memory function. Cross-agent memory is not licensed by any current ruling.
>
> ---
>
> ### SEQUENCING NOTE
>
> These four design questions are added to the session's open design questions alongside the existing questions from the governing brief. They do not gate the session's opening. They do not modify the Option S gate. They are examined when the session opens, in the order the session determines, subject to the standing constraint that the M/W/S floor-semantics election and R8-D7's sampling policy remain deferred until Option S's data is in hand.
>
> The twelve-agent architecture is a named candidate for the session's environment framework discussion. It is not a settled design decision. The session may confirm it, revise it, or reject it in favour of the single-runner architecture, provided the examination is explicit and the reasoning is carried in the session's output.
>
> ---
>
> ### STANDING CONSTRAINTS — UNCHANGED
>
> The loop proposes; it never executes. Weights BLOCKED. The examination engine remains deterministic and doctrine-grounded. The dwelling period is harness-controlled. No environment introduces a retrieval surface that bypasses the examination engine. Task details, agent skills, and operational state remain private to the agent. The runner and the executing agent are distinct identities under Q1c.
>
> ---
>
> ### WHAT THIS AMENDMENT DOES NOT LICENSE
>
> No build. No schema change. No activation. No publication. No modification to existing rulings A1–A4, B1–B4, C1–C5, D1–D5. No reopening of the nine-candidate close gate. No modification to the Option S gate. No movement of the M/W/S deferral. No cross-agent memory function. No profile storage in the runner or any environment agent.
>
> *End of amendment. The standing-runner design session remains unopened and its gate unmet.*

---

## Executing-session notes (not the mentor's text)

### What was executed, documents-only, on relay

- This verbatim record (NEW).
- **R10** — `2026-09-04-standing-runner-design-R10-twelve-environment-amendment.md`: the third sitting,
  examining Q-ENV-1…Q-ENV-4 explicitly per the amendment's own requirement that the Q-ENV-3
  examination *"must be explicit, not defaulted"*, PR19-reviewed.
- **The mentor-question document** —
  `2026-09-04-MENTOR-QUESTION-twelve-environment-architecture-clarifications.md`.
- **Correction, added after R10's own PR19 review (CV-13):** this record originally claimed a
  dated pointer was added at R9's head. **That pointer was never added — R9's committed body
  (`d8dfc80`, PR19-reviewed and pushed) contains no reference to R10.** R9's body is not
  rewritten — it is the PR19-reviewed artefact of record and stays legible as reviewed, exactly
  as intended — but the executing-session claim that a pointer exists was false and is corrected
  here rather than silently fixed. The cross-reference relationship is carried in R10's own head
  and in this record, which is sufficient; no edit to R9's reviewed body is made.
- The named-input register; `operations/decision-log.md`; `/CLAUDE.md`.

**Nothing else.** No code, schema, flag, migration, credential, or live operation. The Option S gate
is untouched and unmet; the M/W/S election and R8-D7's sampling policy remain deferred; weights remain
BLOCKED; the Q1 hard constraint holds; `SUBSTRATE_LAYER3_ENABLED` stays unset.

### The four unverifiable-at-relay items, named

1. **The architectural assessment is not in this repository.** A repo-wide search for the
   twelve-environment vocabulary returns only the governing brief and R9. R10 therefore examines the
   **mentor's characterisation** of the assessment, not the assessment. Where R10 reasons about what
   the assessment "establishes", it is reasoning about the relayed summary.
2. **The differential pricing observation** is carried UNVERIFIED-AT-RELAY and deferred by the
   amendment itself; R10 does not examine it and it is not load-bearing anywhere.
3. **"Twelve well-crafted agents plus a thin routing and harness layer is more maintainable"** is an
   economic claim about maintenance surface. R10 accepts it on that axis and finds it does not
   transfer to the identity/attestation axis (§4).
4. **The session-state premise** — §above, and Q-A of the question document.

### Cross-references

`2026-09-04-mentor-brief-standing-runner-design-session-and-rulings-verbatim.md` (the brief this
amends; C1, C3, C4, C5, D4, B4 and the twelve-room table live there) ·
`2026-09-04-mentor-ruling-standing-runner-gate-item-level-session-may-open-verbatim.md` (the ruling
the amendment's session-state premise predates) ·
`2026-09-04-standing-runner-design-R9.md` (the second sitting this amendment extends) ·
`2026-09-04-standing-runner-design-R10-twelve-environment-amendment.md` (the examination) ·
`2026-08-08-autonomous-loop-design-brief.md` §4 + §8 Q1 (the Q1 hard constraint's scope) ·
`D-MENTOR-BRIEF-STANDING-RUNNER-DESIGN-SESSION-ADOPTED-RECORDED-2026-09-04`.

*End of record. Verbatim wins.*
