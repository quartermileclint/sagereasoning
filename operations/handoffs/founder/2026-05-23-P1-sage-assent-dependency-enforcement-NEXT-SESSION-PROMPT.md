# Next-Session Prompt — Priority 1: Sage Assent → SageReasoning Dependency — Rule + ADR

**Stream:** founder.
**Tier:** `governance` — **Standard** risk. **No code this session** — this is decision + rule + ADR (design) only. The eventual *build* of the enforcement gate is **Critical** (Critical Change Protocol); it is NOT in this session's scope.
**Governing frame:** `/adopted/standing-protocol-cache.md` + `/adopted/build-sessions-protocol-cache.md` ("no current users" holds — founder + test logins only).
**Predecessor session close:** `/operations/handoffs/founder/2026-05-23-selective-offering-data-room-brief-close.md`.
**Predecessor decision-log entries:** `D-PARKED2-DISCRIMINANT-RENAME-TRUST-LAYER-RETAIN-2026-05-23`; `D-ATL-WRAPPER-CLASSIFICATION-INTERNAL-DISPATCH-2026-05-23`; `D-SAGE-CALLING-E1-AGENT-CARD-VERDICT-PERSIST-2026-05-23`.
**Risk classification:** **Standard** under 0d-ii (documentation/governance: a decision-log entry, a proposed manifest rule, and an ADR — no code, schema, env, or deploy). Critical Change Protocol NOT engaged this session; it is named as the discipline the *build* session will follow.

## Why this session matters

A 2026-05-23 private-mentor consultation ruled that the four products may be offered selectively, but **one combination must be structurally prevented**: **Sage Assent without SageReasoning** issues a credential for reasoning that was never examined — a false credential, the pressure-assent failure mode built into the infrastructure. The mentor's instruction is that this be **enforced at the API level, not left to documentation**. This session adopts that rule and pins *where and how* it is enforced — the architecture decision that must precede any code (a standing cross-cutting limitation). It also records the lighter, documentation-only requirement (no-Reflect configs must not be marketed as a "practice") so the rule set is complete. The full configuration ruling is captured in `/drafts/2026-05-23-whole-system-data-room-brief.md` §3.

## Locked context (do NOT re-litigate)
- The configuration ruling is **as stated in the brief §3**. This session adopts it; it does not re-derive it.
- The hard dependency is the priority; the documentation requirement is secondary (Standard, R18/R19 — handled at P3/P4 for the actual doc text; this session only records the rule).
- Selective offering **is** legitimate (per the mentor) — the rule blocks exactly one combination and documentation-gates one claim; it does not force the full suite.
- "No current users" holds.

## Pre-conditions (confirm at open)
1. Working tree clean; the predecessor selective-offering commit pushed; Vercel green; no `.git/index.lock`.
2. Production on the post-Parked-2 baseline (renames only; byte-identical to post-E1): substrate **A7 Verified**; Sage Assent **A10 Live+Verified**; Sage Calling **Live (gated)**; Sage Reflect **Live/Verified (gated `SAGE_REFLECT_ENABLED=true`)**; `SUBSTRATE_WRITE_PATH_ENABLED='true'`; Layer-3 + R20a substrate gates UNSET.
3. No code, schema, env, or deploy change is expected this session.

---

## Part A — Open under the protocol
Read in order:
1. `/adopted/standing-protocol-cache.md` (~3 min — tier, model selection, risk class, signals, status vocab).
2. `/operations/handoffs/founder/2026-05-23-selective-offering-data-room-brief-close.md` (predecessor close).
3. `/drafts/2026-05-23-whole-system-data-room-brief.md` §3 (the configuration rules being adopted) — read in full.
4. `/operations/decision-log.md` — last 3 entries.
5. `/manifest.md` — **R18** (honest certification / Character Kernel / badge transparency), **R19** (honest positioning / limitations), **R18d** (adversarial), **AC7** (auth surface), **AC8** (substrate). Targeted read.
6. `/adopted/sage-assent-write-path-design.md` (the credential write path — Decision C, the `verifyAgentIdOwnership` seam) + `/adopted/sage-assent-a10-design.md` (A10 credential surface; the "wrapper-computes-aggregates-then-POSTs" pattern; the `loop_id` JOIN trace).
7. The code the ADR pins (read targeted, do not change): `website/src/app/api/accreditation/[agent_id]/route.ts`; `website/src/lib/substrate/sage-assent-bridge.ts` (the `deriveReceiptId(signature)` anchor); `website/src/lib/substrate/sage-assent-accreditation-writer.ts` and `…-store.ts` (the `loop_id` field).

Confirm at open: tier (`governance` / Standard); hold-point (P0 0h active); status vocabulary; signals + risk class. Model selection: **N/A** (no LLM). Run the PR15 consult (`.claude/skills/anthropic/` + `/operations/agentic-commerce-findings-downstream-order.md`) and note the PR16 lens.

---

## Part B — Procedure (no code)

### Step 1 — Confirm the rule statement
Restate, from the brief §3, the two obligations precisely: (a) the **hard dependency** — Sage Assent requires a completed SageReasoning pass, API-enforced, Combination 1 blocked; (b) the **documentation requirement** — no-Reflect configs carry the no-practice disclaimer. Confirm the supported-configuration table is unchanged. Flag any conflict with existing manifest rules before proposing text (Task Protocol step 3).

### Step 2 — Draft the manifest rule (founder approval required on text)
Propose rule text in the R18/R19 family. Recommended shape (founder elects exact placement + wording — **do not edit `/manifest.md` without explicit "OK" on the text**):
- **R18f (new) — No credential without examination.** Sage Assent must not issue an accreditation for reasoning that has not passed through the SageReasoning substrate. Enforced at the API level: a credential write lacking verifiable SageReasoning provenance is rejected. Protects R18a/R18b badge integrity.
- **R19 clause (new — e.g. R19e) — Configuration honesty.** Partial configurations are documented for what they support and do not support; a configuration without Sage Reflect must not be represented as an ongoing Stoic "practice."

Present as a proposal with reasoning + the rules each serves; get founder approval before writing into the manifest.

### Step 3 — Draft the ADR for the enforcement seam
This is the session's core deliverable. Author an ADR (pattern: the existing `/adopted/adr/2026-05-23-atl-wrapper-discriminant-classification.md` — boundary-trace evidence with file:line, options, consequences, revisit conditions). It must answer:

1. **What proves "a completed SageReasoning pass"?** Options to evaluate (surface all, recommend one; founder elects):
   - **(a) Verify the substrate Ed25519 signature** on the credited reasoning at the write boundary. The bridge already derives `receipt_id` from the signature (`deriveReceiptId(context.signature)` in `sage-assent-bridge.ts`) — but **confirm whether the signature is currently *verified server-side*, or merely hashed into an ID.** If only hashed, verification is the missing enforcement.
   - **(b) Require the `loop_id` linkage** (`agent_accreditation.loop_id` → `loop_billing_events.loop_id`) proving a real `/api/reason` call occurred for this agent.
   - **(c) Introduce a new explicit "SageReasoning session token"** issued by the substrate and presented at the credential write.
   - (Combinations of the above.)
2. **Where is the gate?** Confirm it is the accreditation write path (`POST /api/accreditation/[agent_id]`), distinct from the A10 agent-id-ownership check (which verifies *who* writes, not *whether examination occurred*).
3. **Does the write path verify provenance today, or trust submitted aggregates?** State the finding. (Predecessor assumption to confirm: the "wrapper-computes-aggregates-then-POSTs" pattern means the path likely trusts aggregates — the false-credential door. Mark the diagnostic-certainty per PR10: **certain** if the code confirms it, **symptom/pattern-level** if not yet conclusive — founder acknowledgement required before treating as settled.)
4. **Consequences + revisit conditions**, and the **risk tier of the eventual build** (Critical — AC7-adjacent access-control gating; PR6 NOT engaged; Critical Change Protocol applies at build).

### Step 4 — Append the decision-log entry (lean form)
Pattern: `/adopted/standing-protocol-cache.md` §"Lean decision-log entry". Adopt the dependency rule + documentation requirement; cross-reference the ADR, the brief §3, this prompt, and the predecessor close. Record the manifest-rule placement the founder approved (or "manifest text approved pending" if deferred). Note PR7 for anything still deferred (e.g. disclaimer wording → P4).

### Step 5 — Session close (lean form)
Pattern: `/adopted/standing-protocol-cache.md` §"Lean session close". Status changes: the rule → **Adopted** (decision status); the enforcement implementation → **Designed** (the ADR specifies; build deferred). Next session pointer: Priority 2 (test legitimate configurations + disclaimers) or the build session for the gate, founder's call.

---

## Part C — Anticipated session shape
| Phase | Estimate |
|---|---|
| Cache + predecessor close + brief §3 + manifest + write-path reads | 20–30 min |
| Step 1 rule statement | 10 min |
| Step 2 manifest rule draft + founder approval | 20–30 min |
| Step 3 ADR (boundary trace + options + recommendation) | 45–60 min |
| Step 4 decision-log entry | 15 min |
| Step 5 close | 15 min |
| **Total** | **~2–2.5 hours** |

## Rollback path
Governance only — nothing to roll back at runtime. `git revert` the commit reverses the manifest edit + ADR + decision-log entry. No code, schema, env, or deploy.

## Forecast
Success = the dependency rule is **Adopted** (decision-log + approved manifest rule), and an **ADR pins the enforcement seam** with the provenance question answered from the code (which primitive enforces it; whether the write path verifies provenance today). After this, Priority 2 (test legitimate configurations + disclaimers) and the Critical build of the gate can proceed from a settled design — and the whole-system data room (the brief) can be built knowing exactly which configuration is blocked and how.

End of prompt. Opens read-only on a stable known-good baseline (production unchanged since post-E1; configuration rule proposed/Under-review awaiting adoption here).
