# Agentic-Commerce Findings — Downstream Order

**Provenance:** `/operations/handoffs/founder/2026-05-12-agentic-commerce-inbox-synthesis-close.md` (predecessor inbox synthesis); operationalised in this artefact under `D-AGENTIC-COMMERCE-UPSTREAM-REWORK-2026-05-13`.

For each forward-looking finding from the 2026-05-12 inbox synthesis, this document specifies the target session, trigger condition, and one-sentence action instruction. Future sessions PR11-inbox-scan this file to pick up findings relevant to their scope.

---

## Findings

### F1 — FPE-5 (TOS + liability) scope expansion

- **Target session:** FPE-5 drafting session (parallel pre-launch track; before Stage 1 close lawyer engagement)
- **Trigger:** when FPE-5 is scheduled OR when the lawyer engagement brief is being prepared
- **Action:** add a sub-bullet to FPE-5's scope specifying "liability allocation when an agent uses substrate output to inform a commercial decision; reference AP2 mandate + ACP merchant-of-record allocation conventions"
- **Cross-reference:** `/operations/parallel-track-fpe-status.md`

### F2 — Stage 4 G3 marketplace listing copy positioning vector

- **Target session:** Stage 4 G3 marketplace listing copy drafting session
- **Trigger:** when Stage 4 G3 is scheduled (post-Stage-1-close; post-licensing-gate)
- **Action:** incorporate "upstream of commerce; judgment primitive that informs commerce action" framing; position Character Kernel as complementary to ACP / UCP / AP2 / MPP / AgentCore — not competing
- **Cross-reference:** J1 ADR amended 2026-05-13 (this session — `/adopted/adr/2026-05-12-substrate-category-character-kernel.md` §"Agentic-commerce-stack adjacency"); `/adopted/substrate-plugin-staging-plan.md` §Stage 4 G3

### F3 — A5 retrospective mandate-producer framing

- **Target session:** next session that references A5 (likely A6 prose_mode templates OR A7 R20a gate)
- **Trigger:** any session whose Part A read sequence includes the A5 close or A5 service file
- **Action:** note in the session's open + decision-log entry that A5's Layer3Response shape is structurally a substrate-consultation-mandate producer (R3 + R19c + R19d + R20a + R18a + R18e injections + AC9/AC10/AC11 projections = AP2-style mandate-output shape)
- **Cross-reference:** `/website/src/lib/substrate/layer3-service.ts`; `D-A5-LAYER3-SCAFFOLDED-VERIFIED-2026-05-12`; `D-AGENTIC-COMMERCE-UPSTREAM-REWORK-2026-05-13`

### F4 — AC10 / AP2 mandate alignment cross-reference

- **Target session:** A12 (OpenTelemetry GenAI instrumentation) — the session where AC10 first gets implemented
- **Trigger:** A12 session-open
- **Action:** add cross-reference in AC10's manifest entry naming AP2 mandate alignment as external validation; producer at A12 should emit `provenance` + `use_policies` in the shape compatible with downstream AP2-consuming agents
- **Cross-reference:** `/manifest.md` §AC10; `/adopted/substrate-plugin-staging-plan.md` §A12

---

## Recommended order of downstream work (post-this-session)

This is the recommended sequencing for the next ~18 substrate-build sessions, with the four forward-looking findings folded into their natural sessions. The founder elects at each session-open; this is a recommendation, not a prescription.

1. **A7 — R20a server-side gate scaffolding** (Critical; ~3-4h)
   Existing prompt: `/operations/handoffs/founder/2026-05-12-A7-r20a-gate-NEXT-SESSION-PROMPT.md`.
   Findings folded: F3 (note A5 retrospective at session-open; minor inline reference in the decision-log entry).

2. **A6 — prose_mode per-mode templates** (Standard; ~2-3h) OR **A10 — per-agent credentials kickoff + token-format ADR** (Critical; ~3-4h, token-format ADR drafted in-session)
   Founder elects after A7. A10 is now the highest-leverage Critical item — its token-format ADR consumes the AP2 candidate added at Step 3 of this session.
   Findings folded: F4 partial (AC10 alignment is named in A10's credential design); F3 if A6 is elected (A5 retrospective in A6's session-open).

3. **FPE-1 + FPE-2** (parallel track; lawyer + accountant engagements) — may already be in progress per the adoption-session close.
   Findings folded: not yet — FPE-5 timing.

4. **A11a — Audits** (endpoint-auth inventory + JSON-key SQL audit) (Standard; ~1h).

5. **A11b — Prompt-injection defence at Layer 1 + Layer 3** (Critical; ~2h).

6. **A12 — OpenTelemetry GenAI semantic conventions** (Elevated; ~1-2h)
   Findings folded: F4 (AC10 / AP2 alignment cross-reference applied in-session).

7. **A13 — R5 cost-as-health-metric alerts** (Elevated; ~1h).

8. **FPE-5 — TOS + liability** (parallel track; lawyer-coupled)
   Findings folded: F1 (liability allocation sub-bullet added in-session).

9. **A9 + J6** (cost monitoring on new path + R5 impact assessment) (Elevated/Standard; ~1-2h).

10. **A8 + K1** (V3 endpoint relationship design + bundled-prose consumer inventory) (Standard; ~1-2h).

11. **A14 — SLOs + error-budget discipline** (Standard governance + Elevated implementation; ~1-2h).

12. **A15a-d — R17 expansion** (SAR + rectification + portability) (Critical x 4; ~5h total).

13. **A16 + A17** (privacy + regulatory governance passes) (Standard; lawyer-coupled; ~4h total).

14. **A18a-e** (onboarding + limitations governance pass) (mixed; ~3-4h total).

15. **A19 — Abuse-detection + rate-limiting** (Elevated; ~1-2h).

16. **Stage 1 close gating step** — lawyer engagement complete; EU customer plausibility decision; all A10-A19 Verified.

17. **Stage 2 — K-category migration** begins (delayed-start per ST2; gated on A10 Verified + Stage 1 close).

18. **Stage 4 G3 — marketplace listing copy** (when Stage 4 begins post-licensing-gate)
    Findings folded: F2 (positioning vector applied in-session).

---

## How to use this document

At any future session-open, the AI's PR11 inbox-scan reads this file (in addition to `/inbox/`). Findings whose target session matches the day's scope get folded in at the named action point. Findings whose trigger condition hasn't fired stay pending. When all four findings have been folded into their target sessions, this document is moved to `/archive/`.

**Cross-reference:** `/operations/handoffs/founder/2026-05-12-agentic-commerce-inbox-synthesis-close.md` (provenance for these findings); `/adopted/adr/2026-05-12-substrate-category-character-kernel.md` §"Agentic-commerce-stack adjacency" (J1 amendment that motivated this artefact); `/operations/decision-log.md` — `D-AGENTIC-COMMERCE-UPSTREAM-REWORK-2026-05-13`.

---

*End of recommended-order document. Created 2026-05-13. Folds into `/archive/` when all four findings have been operationalised in their target sessions.*
