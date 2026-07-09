# Next-Session Prompt — Trust Layer S6: the four-layer discernment engine (L1–L3)

> **SPENT — executed 2026-07-09.** S6 is built + battery-verified (84/0) + review-folded (16-agent Workflow; the headline justice-gate fail-open closed). See the close `operations/handoffs/founder/2026-07-09-trust-layer-S6-discernment-engine-CLOSE.md` + `D-TRUST-LAYER-S6-DISCERNMENT-ENGINE-BUILT-REVIEW-FOLDED`. **Next: S7** — `operations/handoffs/founder/2026-07-09-trust-layer-S7-l4-passion-audit-NEXT-SESSION-PROMPT.md`.

**For the founder. Paste as the first message of a fresh session.** (Rename the date prefix to the actual session date.)

**Stream:** founder.
**Tier:** `code-elevated` — a deterministic engine (the L1–L3 discernment logic) + extraction ONLY where a profile requires reading free text (the same Sonnet Layer-1 machinery, injectable/flag-gated for tests). **NO new schema** (S5 landed `collaboration_records`); **NO new perimeter route** (agent-facing only ⇒ AC5 untouched — re-check at S10); the collaboration-store writes it exercises are flag-gated (`SUBSTRATE_TRUST_CORE_ENABLED`) + MEASURE + fail-honest, nothing wired to a live decision path (S8's reference harness is the live consumer). Lean + Elevated template. **The out-of-band L4 passion audit is S7** (`code-critical`, consult-path). **ENFORCE is S11.**
**Governing frame:** /adopted/standing-protocol-cache.md (+ the build-sessions cache for arc context).
**Design-of-record:** `adopted/adr/2026-07-08-sage-trust-layer.md` (ADR-013 **§4 the four-layer discernment protocol** — L1/L2/L3 questions + the return/selection recommendation; **§5 A2 + A5 + A6** — domain distance, confidence tiers, un-profiled handling).
**Binding methodology:** `operations/trust-layer-2026-07/2026-07-07-mentor-nine-answers-verbatim.md` — **A6** (un-profiled candidates: absence ≠ failure; exclusion only on positive evidence; the session-scoped credential above the habitual class) + **A2** (domain distance = Σ|Δweights| over the four-virtue-domain profile; per-dimension transfer; zero floor above the deployer threshold) + **A5** (the seven confidence tiers). Read them verbatim; where the ADR and the verbatim record diverge, the verbatim record wins. Also `inbox/mentor response to discernment enquiry.rtf` (the four-layer protocol source) — but the ADR §4 encodes it.
**Plan of record:** `operations/trust-layer-2026-07/trust-layer-build-plan.md` §S6.
**Predecessor close:** `operations/handoffs/founder/2026-07-09-trust-layer-S5-profiles-collaboration-record-CLOSE.md`.
**Predecessor decision-log entry:** `D-TRUST-LAYER-S5-PROFILES-COLLABORATION-RECORD-BUILT-MIGRATED-REVIEW-FOLDED`.

## Why this session matters

S5 built the three profile schemas + the collaboration record. **S6 is the discernment ENGINE** that reads them: given a task profile, a set of candidate profiles, and the orchestrator profile, it runs L1 (the honestum gate), L2 (the four-dimension fit score), and L3 (axia comparison when >1 candidate qualifies), and returns a per-candidate result + a selection recommendation — setting the A9 `authority_boundary` at selection and opening a collaboration record. This is the "which sub-agent" decision framed as a kathekon question at the orchestrator's level (not "which is objectively best" but which best enables the orchestrator to fulfil its kathekonta without compromising the honestum threshold). It is the load-bearing consumer of S2 (domain distance + confidence) and S5 (profiles + the collaboration record).

## What S6 builds (per ADR-013 §4 + §5 A2/A5/A6 + build plan §S6)

1. **L1 — the honestum gate** (threshold, binary; a failure EXCLUDES before capability is assessed):
   - **Q1.1 role alignment** — a match on the task's specific function type, NOT general capability.
   - **Q1.2 justice-surface check** — a non-consenting party in scope (the S5 task profile's `justiceSurface.present`) ⇒ a **mandatory L3 justice branch**; that party in scope **AND** a candidate with no justice-evaluation capacity ⇒ **fail**; **no party in scope ⇒ the justice branch is skipped**.
   - **Q1.3 credential integrity** — coverage of THIS function type; a credential earned in another domain does not transfer at full weight — **reuse S2's domain distance** (A2 per-dimension proportional transfer, zero floor above the deployer threshold). Do NOT re-implement A2; call `evidence-weighting.ts`.
   - **A6 un-profiled handling (BINDING, verbatim):** absence of a profile is an evidence gap, **NOT** a honestum failure. Exclusion at L1 requires **positive** evidence (`known-justice-violation | incompatible-role | revoked-credential` — the S5 `ExclusionEvidence` vocabulary), never mere absence. An un-profiled candidate is assessed on profile prior at **tier-7** confidence (S2/A5); **at or above the habitual intervention threshold** it must first complete a **task-scoped standard-depth examination** yielding a **session-scoped credential** (valid for this task only, reduced confidence); **below** it may proceed on the prior with the reduced confidence marked and the **independence flag** active.
2. **L2 — role and task fit** (a FOUR-DIMENSION fit score, NOT pass/fail):
   - Q2.1 specificity of capability; Q2.2 **stability under the task's ACTUAL conditions** (the prior-interaction record enters HERE — A9/L4 — never before L1); Q2.3 transparency of reasoning (the independence principle applied to the collaboration — reuse the S4 A4 transparency ledger); Q2.4 circle alignment (purpose misalignment is a **dikaiosyne risk, not a capability failure**).
3. **L3 — axia comparison** (ONLY when >1 candidate passes L1+L2): Q3.1 which capability is more *kata physin* for this task; Q3.2 which introduces fewer dispreferred indifferents; Q3.3 which output is most integrable into the orchestrator's continued examined practice.
4. **Dynamic question generation** from the three profiles (deterministic generative logic; **extraction ONLY where a profile carries free text that must be read** — the same Sonnet Layer-1 machinery, injectable so the battery runs pure).
5. **Return / selection recommendation:** per candidate — the L1 pass/fail (with reason), the four L2 fit scores, the L3 comparison where applicable, and (a placeholder for) the L4 flags. The recommendation = **the highest four-dimension L2 fit among the L1 passers, adjusted by L3 where >1 qualifies**; L4 flags are surfaced for the orchestrator's examination before the selection finalizes (**the L4 audit itself is S7** — S6 leaves the seam). On selection, **set the A9 `authority_boundary`** (via `authorityBoundaryFromTask` + `boundaryAttenuatesOrchestrator`) and **open a collaboration record** (via the S5 store, flag-gated).

## What S6 CONSUMES (already built — reuse, do not re-implement)

- **S5 `profiles.ts`** — the three profile shapes + validators + `classifyCandidatePresence` (A6) + the `ExclusionEvidence` vocabulary.
- **S5 `collaboration-record.ts` + `collaboration-store.ts`** — `authorityBoundaryFromTask`, `boundaryAttenuatesOrchestrator`, `newCollaborationRecord`, `openCollaborationRecord`, `recordAuthorityBoundary` (the L4 write is S7).
- **S2 `evidence-weighting.ts` + `confidence-tiers.ts`** — A2 domain distance (Q1.3 credential integrity), A5 tiers (the un-profiled tier-7 + the session-scoped credential's reduced confidence).
- **S4 `transparency-ledger.ts`** — Q2.3 (the independence principle / transparency of reasoning).

## The discipline (non-negotiable this session)

- **MEASURE / record-only.** S6 computes a recommendation; it binds no selection. ENFORCE is S11.
- **Reuse the built primitives** (KG-EX1 / PR15 — the S2/S4/S5 libs). Any new bespoke arithmetic (fit-score weights) is a DERIVED monotone convenience the mentor fixes ORDERINGS not magnitudes for — mark it tunable pending S9, exactly as S2/S3/S4 did.
- **A6 verbatim:** never exclude on absence; the session-scoped credential is a single standard-depth examination, not a full credential.
- **Instrument-fidelity battery** (never beats-bare): worse-fit-scores-worse; L1 excludes only on positive evidence; the justice branch is mandatory iff a non-consenting party is in scope; the un-profiled path yields tier-7 + (above habitual) a session-scoped credential; the selection recommendation picks the highest L2 fit adjusted by L3; extraction injectable so the battery is pure.
- Adversarial review (Workflow PR15 or first-hand per the §4 precedent — **check the account credit/session balance first**; it has exhausted mid-run). Fold every confirmed finding.

## Procedure (Lean + Elevated)
- **Read** the cache + the S5 close + ADR §4 + §5 A2/A5/A6, then the verbatim A6/A2/A5, then the S5 profiles + store + the S2/S4 libs it reuses.
- **Build** the L1/L2/L3 engine (pure deterministic core; extraction injected) + the selection recommendation + the collaboration-record open/boundary-set seam + battery.
- **Verify** tsc 0; the S1–S5 batteries green; the new S6 battery; `npm run build`.
- **Adversarial review** (A6 fidelity; the justice-branch mandatory trigger; the domain-distance reuse; worse-fit-scores-worse; the selection-recommendation correctness; claims-vs-code). Fold.
- **Records** (Lean + Elevated): decision-log entry + close + CLAUDE.md PR18 refresh + mark this prompt SPENT + author the **S7 prompt** (the out-of-band L4 passion audit, `code-critical` consult-path).

## Session shape
Reads 30–40m · L1 gate 45–60m · L2 fit 45–60m · L3 axia + selection recommendation 40–55m · the collaboration-record open/boundary seam 25–35m · battery 45–60m · verify 20–30m · review + folds 40–60m · records 25–35m · **~5–7 h**.

## Rollback
`git revert` the build commit (a pure engine + tests; nothing deploys to a live path, no schema/flag). No S1–S5 file behaviour changed (reused, not modified).

## Forecast
Ends with the L1–L3 discernment engine built + battery-verified + reviewed, DARK/MEASURE, consuming the S5 profiles + the S2/S4 libs, opening a collaboration record + setting the A9 authority boundary at selection. Ready for **S7 — the out-of-band L4 passion audit** (`code-critical`, consult-path — runs the deterministic engine on the orchestrator's reasoning trace, writes the readable-not-modifiable `l4_audit_result`). ENFORCE is S11. Weights BLOCKED; the 0h call remains the founder's.

End of prompt.
