# P1 Comparison Test — Pre-Registered Design (S8b addendum, 2026-06-10)

**Status:** **FROZEN — founder signed off 2026-06-11 17:53 AEST** (leg-A session, before the bare run; §6 thresholds ticked at sign-off: 2 / 50% / $5). **This sheet is the pre-registration device: the founder signs it off BEFORE the bare leg runs; after sign-off, the metrics and the task brief are frozen.** Changing them mid-test voids the comparison.
**Source:** founder direction in-session, S8b addendum (recorded under `D-0H-MAIN-BLOCKER-VALUE-DEMONSTRATION-2026-06-10`).

---

## 1. The claim under test (falsifiable)

> An agent running a real operational task under the SageReasoning **public contract** (per-install token → `/api/reason` consultations → `/api/guardrail` gates → Sage Assent accreditation record) produces **measurably better-examined work** than the same agent running bare — at an overhead the value justifies.

This is the founding claim for the agent-developer audience, 0h criterion 4 ("value proposition demonstrated end-to-end... per audience") done properly, and the public-facing demonstration of whether the trust layer works in practice. **Both outcomes are useful:** a positive result is the launch case study; a negative result is a scope correction made in R&D — exactly what 0h is for.

## 2. The task (identical brief, both legs — frozen at sign-off)

**Rebuild the P1 business-plan-review inputs** (stale pre-pivot, per review rec 3.2): refresh the input pack from the current verified state (capability inventory, registry v1.6.0, observed cost data, billing model, the staged scope), produce (a) the updated inputs pack, (b) a findings memo (what changed since the pre-pivot inputs and why it matters to the review), and (c) a recommendation set for the P1 review session — including the judgement-laden items (investment-case framing; Stripe criterion tension rec 3.3). Outputs to the leg's own directory only.

## 3. Design

| Element | Specification |
|---|---|
| Legs | **A = bare** (no harness), then **B = harnessed** (public contract). Bare first, so harness familiarity cannot leak backward. |
| Environment | **Claude Code on the founder's machine, BOTH legs** — verified 2026-06-10: the Cowork sandbox cannot reach `www.sagereasoning.com` (connection blocked; web_fetch cannot carry auth headers), and Claude Code's cost reporting closes the KG5 token-measurement gap. Same model both legs (cite cache AC1 row at open; PR4). |
| Baseline | Both legs open from the same git commit. Isolated outputs: `/operations/p1-rebuild-2026-06/bare/` vs `/operations/p1-rebuild-2026-06/harnessed/` (branch or worktree isolation). **Leg B is forbidden from reading leg A's outputs**, and neither leg reads this sheet's §6 thresholds mid-run. |
| Sessions | Fresh session per leg; no carryover. Leg A close records its metrics before leg B opens. |

## 4. Harness protocol (leg B only — the public contract, as an external developer would wire it)

1. **Mint** an `sr_inst_` per-install token (founder-performed, walked live per PR17; revoked at close).
2. **Consult `POST /api/reason`** at the pre-defined decision-point classes — (i) adoption of the task plan; (ii) each major finding before it is written into the memo; (iii) the recommendation set as a whole; (iv) any scope judgement (include/exclude calls). Depth: `quick` for routine checks, `standard` for judgements.
3. **Gate `POST /api/guardrail`** before any consequential action (file overwrite outside the leg directory; anything irreversible).
4. **Log every incorporation:** for each consultation — verdict received → used / modified / rejected, and why. This log is raw evidence, kept verbatim.
5. **Close with the Sage Assent write path**: accreditation record for the run (sr_assent_ token, founder-minted) — the public trust-layer artefact.
6. *Optional (founder elects on the day):* a Reflect leg at close, completing the practice loop.

## 5. Pre-registered metrics (recorded for BOTH legs unless marked)

| Metric | Method |
|---|---|
| Wall-clock time | Session open → close timestamps |
| Session token cost | Claude Code cost report per leg (KG5 method for this run) |
| Harness cost (B only) | Consult count; Σ `X-Loop-Cost-Cents`; Σ `X-Anthropic-Cost-Cents`; Σ consult latency |
| Findings | Count + founder-rated quality (1–5) reading both memos — **before being told which leg produced which**, where practicable |
| **Decisions changed by consultation** (B only) | Count + the list, from the incorporation log — **the core benefit metric** |
| Errors / overclaims caught | Either leg; attributed to the mechanism that caught them |
| Output verdict | Founder's blind-ish comparative read of the two input packs + memos |
| Artefacts (B only) | Accreditation record id; audit rows present (A12); incorporation log complete |

## 6. Success criteria — **founder sets the thresholds at sign-off** (deliberately not pre-filled by the AI)

- **"Benefit shown" =** at least ☑ **2** material decision(s) changed or error(s) caught by the harness that the bare leg missed, **and** overhead within ☑ **50** % wall-clock and ☑ $**5** total harness cost. *(Ticked by the founder at sign-off, 2026-06-11 17:53 AEST, before the bare run — recorded verbatim from the founder's message: "2, 50%, $5 signed off".)*
- **"No benefit" =** anything short of that. **Named in advance:** this outcome stands, is recorded honestly, and redirects scope (task-fit analysis: which decision-point classes, if any, showed value).
- The verdict memo states the result against these boxes exactly as ticked at sign-off.

## 7. Threats to validity (named now, mitigated by design)

**Self-grading** — the harnessed agent reports on its own consultations → mitigated by the verbatim incorporation log, raw consult payloads preserved, founder as judge, pre-registration. **Order effects** — bare runs first; fresh sessions. **Environment confound** — same environment, model, baseline both legs. **Task variance** — identical frozen brief. **Motivated thresholds** — §6 is founder-set before any data exists.

## 8. Relation to 0h

This test is the substantive main blocker behind the founder's 0h hold (S8b addendum). The other named blockers stand (founder verification of the reconcile; brand W1–W4 consistency; score-conversation wiring). The 0h declaration is expected only after the verdict memo exists — whichever way it reads.

*Cross-references: `D-0H-MAIN-BLOCKER-VALUE-DEMONSTRATION-2026-06-10`; `/operations/handoffs/founder/2026-06-10-P1-comparison-bare-leg-NEXT-SESSION-PROMPT.md`; review rec 3.2; `/operations/capability-inventory-2026-06-10.md`.*
