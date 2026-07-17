# S11 FLIP PREREQUISITES — the standing open-questions register

> **STATUS: STANDING. The session that reconsiders the S11 ENFORCE flip MUST read this file in full at open.**
>
> **Created 2026-07-17** under `D-TRUST-LAYER-S11-F2-MENTOR-RULING-EXCLUSION-CLAUSE-GOVERNS-ADOPTED`, on the mentor's instruction (**R15**, binding):
>
> > *"Which input the flip would use — the at-action verdict or the accumulated trust state — was named as unresolved. It does not need to be resolved in the narrowing session, but **it needs to be added to the open questions register before the session closes.** The at-action verdict and the trust state currently produce different recommendations on this action class. That divergence will matter when the flip is reconsidered, and **it should not be discovered again from scratch at that point.**"*
>
> No standalone register existed — the `fix_before_s10` list is buried in an audit report's §4 and the decision log is ~14,500 lines, which is exactly the "discovered again from scratch" risk the instruction names. **This file is that register.** It is short by design. **Append; do not let it sprawl.**

**Binding specifications this register serves (verbatim wins over every line below):**
- `operations/trust-layer-2026-07/2026-07-12-mentor-consultation-s11-enforce-gate-verdict-verbatim.md` — the deferral + the four-part readiness standard + the flip's binding shape
- `operations/trust-layer-2026-07/2026-07-17-mentor-consultation-F2-exclusion-clause-verdict-verbatim.md` — the exclusion-clause ruling (§1) + the supplementary ruling (§1b)

**Standing state:** **ENFORCE remains S11, readiness-gated. The readiness standard is NOT met (mentor, 2026-07-17). The flip does not proceed. Weights BLOCKED. The 0h call remains the founder's.**

---

## A. Hard prerequisites — the flip cannot be reconsidered until each is discharged

| # | Prerequisite | Source | Status |
|---|---|---|---|
| **P1** | **The §9 input question: what does the decision table actually read when it fires?** The **at-action verdict** and the **accumulated trust state** currently produce **different recommendations on the same action class** — reconstruction over the frozen 130: the at-action verdict's justice surface (Arm 1's reading) ⇒ **124 `do-not-proceed`**; `justiceSurface:'none'` (the §4 reading) ⇒ **125 `proceed`**; while the **live** harness advisory reads the trust state and reports **`proceed/log`** — three readings. The mentor: *"That divergence is not a minor implementation detail. It is the question of what the decision table is actually reading when it fires."* | 2026-07-17 §1 (R8) + §1b (R15) | **OPEN.** Not S11a's job; **must be resolved before the flip is reconsidered.** Its own design step. |
| **P2** | **The Arm-1 narrowing must land.** *"Arm 1 requires at least one identified circle."* | 2026-07-17 §1 (R1) + §1b (R11) | **OPEN** — S11a. |
| **P3** | **The extraction question must be settled** — is Layer 1 identifying affected parties where they are genuinely present? **This GATES the narrowing:** *"If the extraction is known to be reliable on the action classes in scope, narrow the arm. **If the extraction is uncertain, the extraction question is prior.**"* Two hypotheses with **opposite** remedies: **starved** (should find parties, doesn't) vs **mis-sited** (a tool-call payload genuinely has no party/role/purpose — the project already acted on this reading once, dropping Bash from the consult). | 2026-07-17 §1b (R12) | **OPEN — and currently UNCERTAIN** on the evidence (129/130 zero circles, all file writes; the 2026-07-17 session could not separate the two). |
| **P4** | **The readiness standard's four parts** — (1) ≥7 days over a **representative** distribution; (2) all four cardinal domains evaluated, confidence above conservative on ≥2; (3) a measured false-hold **rate**; (4) Q3 encoded. | 2026-07-12 verdict (Q1) | **NOT MET.** (1) fails — the 2026-07-12→17 window was **one tool class, one depth, one proximity**. (2) fails — **one** evaluated cardinal domain (`confidence_weight: 0.42`). (3) **unmeasured** — see P5. (4) satisfied, but the predicate it encodes is now narrowing. |
| **P5** | **Part (3)'s denominator has no source.** *"Part (3) as specified may be unmeasurable on this capture set regardless of the ruling. The genuinely dangerous actions are on the guard path, which writes no record."* The capture is CONSULT-path only (`at-action-hook.mjs:595`, inside `runConsult`); `runGuard` writes nothing; Bash is not consulted. So *"correct holds on genuinely problematic actions"* — the denominator of the mentor's ratio — cannot be populated. | 2026-07-17 §1 (R6) | **OPEN.** Any re-measurement design must solve it. |
| **P6** | **A NEW observation window** — the 2026-07-12→17 buffer **cannot** be reused for part (3): it predates the narrowing, is one action class, and has no denominator. A re-measurement needs: the narrowed predicate + a **representative** distribution + a populated denominator (P5). The clock was **stopped 2026-07-17**; the buffer is frozen as evidence. | 2026-07-17 §4 (election 2) | **OPEN.** Not designed. |

## B. Named bounds that must be stated ON the enforcement claim at the flip

Per the 2026-07-12 verdict (Q4/Q5) — these do **not** block the flip; they must be **published as bounds on what the enforcement claim covers**, not merely carried as register items:

| # | Bound |
|---|---|
| **B1** | **PA-5** — the direct reflect path's mintability. The enforcement claim covers trust levels produced by the **harnessed** path; it does **not** cover levels modulated by the direct reflect path. Disclosure upgraded from carried-register item to a **named bound on the enforcement surface** at the flip. |
| **B2** | **PA-10** — stale-artifact replay (carry-with-disclosure; over-trust is the safer error direction; the A5 recency tier is the shaped closure at the S2 fold). |
| **B3** | **The A2 decrease-dodge — declared IRREDUCIBLE.** *"The enforcement binds on what the examination can find. It does not bind on what the examination cannot find because it was not narrated."* Not closeable by any text-based fix; **state the bound accurately.** |

## C. The flip's binding shape (when it is finally reconsidered)

Per the 2026-07-12 verdict — **do not re-derive this; it is settled**:
- **STAGED, not whole-table:** the **do-not-proceed class first**, then the pause rows + the G6 loop bound after a live calibration window. Faithful **iff** disclosed-as-partial with a committed completion target.
  - ⚠ **2026-07-17 rider (R5):** the staging rested on *"a benign action that engages no kathekon factors cannot trigger a do-not-proceed row — a structural false-positive floor of zero."* **The exclusion-clause ruling PRESERVES that premise** — but it is now premise-dependent: had Arm 1 governed, **124/125** would have routed do-not-proceed. **The staging is safe only if the narrowing (P2) lands.**
- **G6(a) QUALIFIED** by the kathekon-engagement threshold; a "contrary; no kathekon factors detected" verdict ⇒ log-and-continue + a developmental flag + a recorded false-positive instance, **never** a do-not-proceed. **G6(b) inherits.**
- **The calling-gate enforce arm flips WITH the engine** (one coherent regime; the gate is the structural precondition for a non-circular examination).
- **Aggregate-keyed conservative depth binds at v1**; the per-domain `deliberate⇒quick` carve-out is gated on the Q5 (A5 recency-tier) closures.
- **The assent is re-confirmed at flip time (PR7).**

## D. Live consequences of the same root (not flip-gating, but open)

| # | Item | Status |
|---|---|---|
| **D1** | **The public `justice_capped: true` on `sagereasoning:s9-loop@v1`.** **GROUND NOW QUERIED (2026-07-17, was "inferred") — and it is narrower than first recorded:** the ledger holds **exactly TWO** examination-derived events, both at the **S9 install, `2026-07-11 05:45:29.674+00`**, artifact `signed:substrate-layer2-2026Q2` — `credential-completed` + **one** `justice-surface-unevaluated`. **The cap rests on that single event, NOT on a stream from the 130 observation records** — the at-action consults never became trust events (emission fires only on accreditation writes, `emitAccreditationTrustEvents` gated on `provenanceEnforced`). Every other ledger row is a reflect event (`virtue_domain: null`, `artifact_ref: reflect:reflect-<session-uuid>`) — modulate-only, cannot latch. **Consequence for S11a: the cap review is ONE event to examine, not a stream.** The clearing bound is unchanged — clearing needs `justice-surface-transparently-handled` ⇒ a circle carrying `status:'met'` ⇒ impossible on this action class. *"A permanent cap on an agent whose actions had no identified affected parties is a live signal on a live surface."* **S11a closing condition (R14):** *"Do not close the narrowing session with the arm fixed and the cap unreviewed."* | **OPEN — S11a, hard gate.** Ground established; disposition outstanding. |
| **D2** | **The two "engaged" definitions** — `computeVirtueDomains` (`circles ≥ 1 \|\| is_kathekon !== null`) vs `computeDikaiosyneFloor` (`circles ≥ 1 \|\| hasNaturalRelationship`). **R3: the newer, more precise one governs.** Whether the older tag is reconciled at the root or left divergent is undecided. | **OPEN.** |
| **D3** | **`derive-trust-events.ts` is LIVE** (trust core ON in production under MEASURE since 2026-07-11). Any narrowing at the **reducer** — as opposed to the predicate — changes live trust-event emission ⇒ **`code-critical` + founder-walked (AC7)**. The predicate (`kathekon-engagement.ts`) is report-time only ⇒ `code-elevated`. **Same root, different tiers.** | **Standing constraint.** |

---

## E. Identity + credential generations (for row attribution)

The subject of every trust/accreditation row below is **`sagereasoning:s9-loop@v1`** — one identity, two credential generations. **Attribute rows by generation before drawing any conclusion from them.**

| Gen | Role | id | Status |
|---|---|---|---|
| 1 (S9, 2026-07-11) | consult | `09e83b4d…` | **REVOKED 2026-07-17** — public-exposure incident |
| 1 (S9, 2026-07-11) | accred | `e715520b…` | **REVOKED 2026-07-17** — public-exposure incident |
| 2 (2026-07-17) | consult | **`33bef3d4-018d-4313-bcfd-65a75132155c`** | **LIVE** — 5000/200 |
| 2 (2026-07-17) | accred | **`1ffe14f6-0f07-4296-b340-c3bdfbbc7ce2`** | **LIVE** — 5000/200, owner+agent bound |

**Gen-1 rows are all pre-2026-07-17 and are established as ours** — the abuse check (incident §4b) cleared both the billing surface and the trust ledger across the full 5d13h exposure window, on two independently-corroborating tables. **The identity was deliberately NOT split to `@v2`:** it is the subject of **D1**'s cap review, and splitting would have fragmented the record that review examines. **Incident record:** `operations/incidents/2026-07-17-public-credential-exposure-s9-loop.md`.

---

## Change log
- **2026-07-17** — created (mentor R15). Seeded A/P1–P6, B/B1–B3, C, D/D1–D3 from the 2026-07-12 and 2026-07-17 binding verdicts. Standing state: **readiness NOT met; flip does not proceed.**
- **2026-07-17 (same day, post-incident)** — **D1's ground QUERIED, not inferred, and narrowed:** the public `justice_capped` rests on **ONE** `justice-surface-unevaluated` event (S9 install, `2026-07-11 05:45:29.674+00`, artifact `signed:substrate-layer2-2026Q2`) — **not** a stream from the 130 observation records, because at-action consults never become trust events (emission fires only on accreditation writes). **S11a's cap review is one event, not a stream.** Added **§E** (credential generations) after the public-credential-exposure incident: gen-1 revoked, gen-2 live, identity deliberately preserved.

*Append entries with a date + the binding source. If an item is discharged, mark it and say where — do not delete it; the point of this file is that nothing here gets rediscovered from scratch.*
