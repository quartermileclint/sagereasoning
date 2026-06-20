# Next-Session Prompt — Gate-1 Arc 2, Slice 1: the `UserPromptSubmit` framing hook (PR1 single-surface proof)

**For the founder. Paste as the first message of a fresh session.**

**Stream:** founder.
**Tier:** `code-critical` — per the founder's Arc-2 staging (the Critical Change Protocol applies). *Honest classification note: Slice 1 itself is TEST-only and touches no production / auth / R20a-perimeter / deployment-config surface — it builds a hook and proves it on one TEST fixture against TEST `/api/reason`. The genuine AC7 triggers (operator credential mint + the first `pre_decision_harness` marker reaching the Live accreditation read) arrive at **Slice 3**. The Critical posture here is the founder's election to treat the enforcement artifact with full care. The AI may, at open, propose `code-elevated` if the founder prefers — the founder's call.*
**Governing frame:** /adopted/standing-protocol-cache.md + /adopted/build-sessions-protocol-cache.md.
**Predecessor session close:** operations/handoffs/founder/2026-06-20-gate1-arc2-harness-design-staging-close.md.
**Predecessor decision-log entry:** `D-SAGE-PRACTICE-GATE1-ARC2-HARNESS-DESIGN-ADOPTED`. **Governing design:** `adopted/adr/2026-06-20-pre-decision-harness-arc2.md` (ADR-011).
**Risk classification:** Critical under 0d-ii per the staging (Critical Change Protocol applies — see Part B Step 5/6). PR6 NOT engaged (no distress-classifier / Zone / Layer-2-signing surface). AC5/R20a confirmed-not-weakened (the framing call runs the existing perimeter on the raw task).

## Why this session matters
This is the **PR1 single-surface proof** for the whole harness. ADR-011 D2 elected the Claude Code plugin + hook surface first; this session builds the `UserPromptSubmit` framing hook and proves — on **one** TEST fixture — that the Gate-1 framing call fires **before the agent's first action** and **cannot be skipped**. Nothing rolls out until this reaches **Verified**. The full negative battery is Slice 2; the plugin packaging + credential mint (the first issuance of `pre_decision_harness`) is Slice 3.

## Pre-conditions
1. ADR-011 is Adopted (`D-SAGE-PRACTICE-GATE1-ARC2-HARNESS-DESIGN-ADOPTED`, 2026-06-20).
2. Arc 1 is Live (`examination_mode` activated 2026-06-20); `pre_decision_harness` still un-issued (it is first issued at Slice 3).
3. A TEST `/api/reason` is reachable and the `sr_prac_` credential mint flow is available (the existing CLI mint flow).
4. 0h is still held — pre-0h trust-layer honesty work; does not touch the launch call.

## Part A — Open under the protocol
Read in order:
1. /adopted/standing-protocol-cache.md (~3 min — tier, model selection, risk class, signals)
2. /adopted/build-sessions-protocol-cache.md (build-arc context)
3. **adopted/adr/2026-06-20-pre-decision-harness-arc2.md — in full** (the governing design; D1–D7 + §Staged build + §Constraints)
4. operations/handoffs/founder/2026-06-20-gate1-arc2-harness-design-staging-close.md (predecessor close)
5. /operations/decision-log.md — last 2 entries

Confirm at open: tier; 0h held; **model selection — the framing call uses the fast `assessment_first` path at quick/standard depth, never `deep`** (AC1/KG2, ADR-011 D3); status vocabulary; signals + risk class. Critical Change Protocol (0c-ii) stated visibly before any code that the founder will run.

## Part B — Procedure
### Step 1 — Wire-contract verification FIRST (PR11/PR12)
Verify first-hand against `code.claude.com/docs/en/hooks` (and `…/plugins`, `…/settings`): the `UserPromptSubmit` JSON output (`additionalContext`), exit-code/block semantics (exit 2), matchers, character caps, and **whether an `http` hook handler exists** (would let the hook POST to `/api/reason` directly — no shell script). If `http` is unconfirmed, use the robust **`command`/curl** handler (PR12 — state "couldn't find it with the queries I tried; the feature may still exist," do not conclude it doesn't). Summarise findings inline before building.

### Step 2 — Build the hook (ADR-011 D3/D4/D5)
- POST the **raw task** to TEST `/api/reason` in **framing posture** (situation in → frame out), `response_format:"assessment_first"`, **quick/standard depth**.
- Return the frame (circles, control-filter, passions-to-watch, kathekon) as **`additionalContext`**.
- **Fire-once-per-task guard** (a per-session/state flag) — a follow-up message in the same task does NOT re-fire.
- **Fail-open-with-honest-log default**, configurable to **fail-closed (strict)** — a task that proceeds unframed is recorded as unframed (R18), never silently treated as framed.

### Step 3 — PR1 single-fixture proof (PR17 — founder-walked, live)
On **one** TEST fixture, with an `sr_prac_` credential against TEST `/api/reason`: confirm the framing call is the **first action** in the trace, before any task tool, and that the injected `additionalContext` is present in the model's first turn. Walk every founder-performed step live (credential mint, running the fixture). Reach **Verified** on this one fixture — the full battery is Slice 2.

### Step 4 — Verify
Trace shows framing-before-first-action on the fixture; the fire-once guard holds on a follow-up; the fail-mode behaves as configured on a forced outage (a quick manual check — the exhaustive battery is Slice 2). No production change; no credential marker issued.

### Step 5 — Append decision-log entry (full Critical form)
Per the Critical templates (this is a `code-critical` session). Record the wire-contract findings, the hook design, the PR1 proof outcome, and the Verified status.

### Step 6 — Session close (full Critical form)
Per /adopted/standing-protocol-cache.md §"Critical-risk sessions". Scope Slice 2 (the negative battery) for the next session.

## Part C — Anticipated session shape
| Phase | Estimate |
|---|---|
| Cache + ADR-011 + predecessor close read | 15–20 min |
| Step 1 (wire-contract verification) | 20–30 min |
| Step 2 (build the hook) | 45–60 min |
| Step 3 (PR1 proof, founder-walked) | 30–45 min |
| Step 4 verify | 15 min |
| Decision-log + close | 30 min |
| **Total** | **~2.5–3 hours** |

## Rollback path
TEST-only — `git revert` removes the hook + tests; nothing in production or in any credential is touched. No marker is issued in Slice 1.

## Forecast
End with the `UserPromptSubmit` framing hook **Verified** on one TEST fixture (the PR1 proof), wire contracts confirmed first-hand, and Slice 2 (the release battery) scoped. The 0h launch call remains the founder's throughout.

## Cross-references
- adopted/adr/2026-06-20-pre-decision-harness-arc2.md (ADR-011 — the governing design)
- operations/handoffs/founder/2026-06-20-gate1-arc2-harness-design-staging-close.md (this session's close)
- /operations/decision-log.md — `D-SAGE-PRACTICE-GATE1-ARC2-HARNESS-DESIGN-ADOPTED`
- drafts/sage-practice-pre-decision-harness-design.md (research basis — §3a the hook mechanism; §5 failure modes; §6 the test environment)

End of prompt.
