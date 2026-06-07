# Next-Session Prompt — Post-A15-confirm: Stage-1 build continuation (founder elects at open)

Paste this whole file into a new session to proceed. Canonical prompt for the session after the A15 SAR + portability governance-confirm pass reached Verified (documentation-only; committed, pushed, Vercel green; production byte-identical).

**Stream:** founder. **Tier:** set by the elected item (see menu) — `governance` for the housekeeping/confirm items; `code-elevated` for A18 / A19-surface-rollout; `code-critical` for A15b / A15c or any inert-flag production activation. Confirm at open.
**Governing frame:** `/adopted/standing-protocol-cache.md` + `/adopted/build-sessions-protocol-cache.md` ("no current users" holds → Critical Change Protocol step 3 = N/A; all other steps in full force).
**Predecessor close:** `/operations/handoffs/founder/2026-06-07-A15-sar-portability-confirm-close.md`.
**Predecessor decision-log entries:** `D-A15-SAR-PORTABILITY-GOVERNANCE-CONFIRM-2026-06-07`; `D-A14-SLO-ERROR-BUDGET-POLICY-2026-06-07`; `D-A19-VELOCITY-VERIFIED-LIVE-2026-06-06`; `D-R17C-A15A-STALE-DRIFT-RECONCILED-2026-06-06`.

## Carried-forward state (read before scoping)

- **A15 is now scoped.** The disposition `/adopted/a15-sar-portability-disposition.md` (Adopted under `D-A15-...-2026-06-07`) confirms: **A15d (portability / Art 20) is build-complete** via the live `/api/user/export` (remaining = lawyer posture sign-off + an optional format ADR — no build); **A15b (SAR / Art 15) shrank to a thin add-on** — the export already delivers the data-copy; what's missing is an Art 15 supplementary-information block (purposes, recipients/sub-processors, retention, rights, complaint path, source, and the Art 15(1)(h) **profiling disclosure**), plus **request logging** and **rate-limiting**; **A15c (rectification / Art 16) remains a focused Critical build** (`/api/user/rectify` + correctable-field allow-list + immutable before/after audit table).
- **A15b packaging is a founder decision at A15b kickoff** (disposition §5): Option 1 dedicated `/api/user/access` (matches manifest R17g naming; no governing-doc edit) vs Option 2 augment `/api/user/export` (+ manifest rename, needs approval + backup). The disposition makes the case for Option 1 but does not prescribe.
- **Three pending governing-doc approval edits** (each Elevated; each needs explicit approval + a prior-version backup, same shape as the R17c reconcile):
  1. `manifest.md` `CR-GDPR-A20-PORTABILITY` posture → "implementation complete; pending lawyer review" (disposition §8).
  2. `adopted/substrate-plugin-staging-plan.md` §A15 annotation → record A15d build-complete + A15b/A15c shrunk scope.
  3. `adopted/substrate-plugin-staging-plan.md` §A14 status → "governance done; implementation deferred" (carried from the A14 close).
- **Carried housekeeping:** `CLAUDE.md` "Production state (as of 2026-05-14)" block is stale — refresh in a governance pass.
- **PR5 candidate (count 1)** — append-only teardown. Seeding `substrate_audit_events` for any TEST run requires `ALTER TABLE … DISABLE TRIGGER trg_sae_no_delete` around the teardown DELETE (the table is append-only). Promote on recurrence.
- **Operational note (new):** the AI should avoid running git commands in the Cowork sandbox — they leave a `.git/index.lock` the sandbox can't remove, which blocks the founder's commit until cleared with `rm -f .git/index.lock`. Read git state via the file tools / `git` is the founder's job. (Surfaced 2026-06-07; the founder cleared the lock at the A15-confirm close Part 0.)

## Founder elects the item at open

This prompt's default + recommendation: **a short governance/housekeeping pass** to clear the three pending approval edits + refresh the stale `CLAUDE.md` block (cheap; clears accumulated governing-doc drift before it compounds), **and/or kick off the FPE/legal track** on wall-clock (the long-pole gating A16/A17 and Stage-1 close — highest-leverage parallel move). The two are independent and can run in parallel. Say so at open; the AI re-scopes to any of the below.

- **Governance/housekeeping pass** (`governance`; ~1 short session). With approval + backups, apply the three approval edits (manifest A20 posture; staging §A15 annotation; staging §A14 status) and refresh `CLAUDE.md`'s production-state block. Clears the carried governing-doc debt. **This prompt's cheap default.**
- **FPE / legal track kickoff** (founder-initiated; startable on wall-clock anytime). Gates A16 + A17 and therefore Stage-1 close. Not an AI build session per se — the AI helps scope the lawyer engagement, the L1 entity ADR, and the I1 insurance quote. Independent of the build items; can run in parallel. **Highest-leverage strategic move.**
- **A18 — onboarding + limitations governance pass** (mixed Standard/Elevated; ~1–2 sessions). R19c limitations page, R19d mirror principle in mentor prompts, R20b framework-dependence detection (PR6 applies to A18c), accessibility statement (A18d), first-run experience (A18a), cognitive-accessibility pass (A18e). The next clean no-lawyer build item; similar shape to A14. Founder elects which slice.
- **A19 surface rollout** (`code-elevated`; ~1 session). Add the `systematic_enumeration` + `rapid_input_variation` detectors to the now-Verified A19 evaluator (PR1 surface rollout — the pattern is proven). Structural-only off `masked_context` (no raw text — R3/R17 boundary).
- **A15b** (`code-critical`; now thin). The SAR add-on: Art 15 supplementary-info block + request logging + rate-limit on the export's existing data-copy. Decide Option 1 vs 2 (disposition §5) at kickoff. Full Critical Change Protocol applies.
- **A15c** (`code-critical`; focused). Rectification: `/api/user/rectify` + correctable-field allow-list + immutable before/after audit table. Full Critical Change Protocol applies.
- **Deferred Critical activations** (`code-critical` each) — A19 production activation; A13 automated-delivery follow-on; A10 / A11b / A12 production activations; A14 live-adherence tracker (needs A12 OTel active + traffic). Each its own Critical session, same shape as the A13 activation (2026-06-06). Low urgency (no traffic/revenue yet).

**Recommendation:** clear the cheap governance debt (the three approval edits + `CLAUDE.md`) and/or kick off the FPE/legal track in parallel; for substantive build progress, A18 is the next clean no-lawyer item and A15b is now small. The FPE track gates the most remaining items, so starting it on wall-clock is the highest-leverage move regardless of which build item is elected.

## Where this sits (one paragraph)

Stage 1 of the substrate-as-plugin arc. Verified-live: A10 (identity), A11b (injection defence), A12 (OTel + baselines), A13 (cost-health — also activated in production), A14 (SLOs/error-budgets — governance half), A15a (R17c deletion), A15d (portability, build-complete), and A19 (abuse-detection, detection-only). A10/A11b/A12/A19 are Verified-live on TEST but inert in production (flags UNSET; activation deferred under PR7). Stage-1 close needs all A10–A19 Verified — remaining: **A15b** (thin), **A15c** (focused), **A16**, **A17**, **A18** (A16/A17 lawyer-coupled), plus the deferred A14 tracker — plus lawyer engagement initiated, an EU-customer plausibility decision, and the parallel FPE track (L1 ADR + I1 quote). Stage-1 close is several sessions out, not imminent.

## Pre-conditions (founder confirms at open; AI verifies by read)

1. The A15-confirm commit is pushed; Vercel green; `/api/reason` byte-identical. (Last commit should reference `D-A15-SAR-PORTABILITY-GOVERNANCE-CONFIRM-2026-06-07`; working tree clean; no `.git/index.lock`.)
2. Production flags unchanged: all four R20a flags `true`; `SUBSTRATE_OTEL_ENABLED` / injection-defence / Layer3 / plugin-install-auth / `SUBSTRATE_ABUSE_DETECTION_ENABLED` all UNSET; A13 cost-health detection Live (activated).
3. `D-A15-SAR-PORTABILITY-GOVERNANCE-CONFIRM-2026-06-07` is the last decision-log entry; no work begun after it. Branch `main`; the AI does no git operations.
4. No outstanding TEST seed data (A19 teardown completed; `substrate_audit_events` append-only guard re-enabled).

## Part A — Open under the protocol

Read in order:
1. `/adopted/standing-protocol-cache.md` — tier, model selection, risk class, signals, status vocabulary, the AI-failure-modes table (KG-EX1 prescribe-before-grounding + PR17 one-line-hand-off redirects).
2. `/adopted/build-sessions-protocol-cache.md` — "no current users" note; living-state references (component-registry is the status source-of-truth).
3. The predecessor close in full: `/operations/handoffs/founder/2026-06-07-A15-sar-portability-confirm-close.md`.
4. For the elected item: `/adopted/a15-sar-portability-disposition.md` (if A15b/A15c) **or** `/adopted/substrate-plugin-staging-plan.md` §A18 / §A19 / Stage-1-close gating (if A18 / A19 / FPE). Read against the decision log, not at face value.
5. `/operations/decision-log.md` last 4 entries (the predecessor entries above) + grep the Verified-live states for A10/A11b/A12/A13/A14/A15a/A15d/A19.
6. `/manifest.md` targeted for the elected item — for A15b/A15c: R17f/g/h (Critical surface + Critical Change Protocol); for A18: R19c/R19d/R20b; for A19-rollout: R3 + R17 (no-PII scope).

Confirm at open (narrate before substantive work, per the cache's failure-modes subsection): where we are in the arc; what's queued; what's awaiting the founder vs the AI. Model selection per the cache AC1 table (N/A unless an LLM classifier is introduced — confirm; A18c framework-dependence detection may introduce one). KG scan: KG1 on any DB-write code; KG7 on JSONB writes. PR15 consult before any bespoke build (`.claude/skills/anthropic/` + `/operations/agentic-commerce-findings-downstream-order.md`; state whether an Anthropic-canonical primitive could deliver the outcome before electing bespoke). PR6 applies to A15b/A15c and A18c.

## Part B — Procedure (default: governance/housekeeping pass)

If the housekeeping pass is elected (re-scope per the staging-plan section if a build item is chosen instead):

1. **Confirm the three approval edits + the CLAUDE.md refresh with the founder**, one at a time, stating the exact before/after text for each. Governing-doc edits are not made without explicit per-edit approval.
2. **Back up each governing doc before editing** — copy to `archive/2026-06-07-post-A15-housekeeping/<file>.backup-2026-06-07-pre-edit` (same shape as the R17c reconcile). No edit precedes its backup.
3. **Apply the approved edits** in place: `manifest.md` `CR-GDPR-A20-PORTABILITY` posture; `adopted/substrate-plugin-staging-plan.md` §A15 annotation + §A14 status; `CLAUDE.md` production-state block (refresh to the 2026-06-07 state: A13 cost-health Live; A10/A11b/A12/A19 Verified-live on TEST, inert in production; A14 governance + A15d build-complete; flags per pre-condition 2).
4. **Verify (0c governance):** a requirements-vs-in-place diff the founder reads — `grep` each edited line to confirm old text gone / new text present. No code/schema/production change.
5. **Decision-log entry (lean form)** + **session close (lean form)** per the standing-cache templates. Record the status movements.

If a **build item** is elected instead (A18 / A19-rollout / A15b / A15c): re-scope to the staging-plan section + disposition; for A15b/A15c run the **full Critical Change Protocol (0c-ii) visibly** before any production change, prove on a single surface first (PR1), verify build-to-wire in-session (PR2), and walk every founder-performed dashboard/Vercel/Terminal step live (PR17).

## What is NOT in this session

- No production activation of any inert flag (A19 / A10 / A11b / A12 / A13-delivery / A14 tracker) unless explicitly elected — each is its own Critical session.
- No R20a / Zone 2/3 / classifier / wrapper touch (PR6 trip-wire — if any step is found to, it becomes Critical).
- No A15b/A15c code in the default (housekeeping) pass — those are separate Critical sessions.
- No git operations by the AI (founder commits/pushes via GitHub Desktop). The AI does not run sandbox git commands (avoids the `index.lock` side effect).
- No edits to governing docs (manifest, staging plan, CLAUDE.md) without explicit per-edit founder approval + prior-version backup.

## Rollback path

Per the elected item. The housekeeping default is in-place governing-doc edits → revertible by restoring each file from its `archive/2026-06-07-post-A15-housekeeping/*.backup-2026-06-07-pre-edit` copy; no production effect. Build items carry their own rollback (additive + flag-gated for A18/A19; full Critical rollback plan for A15b/A15c).

## Forecast

Most likely: the housekeeping pass clears three accumulated approval edits + the stale `CLAUDE.md` block in one short session, leaving the governing docs in sync — then the substantive choice is A18 (next clean build) or A15b (now thin) for build progress. The FPE/legal track remains the long-pole gating A16/A17 and Stage-1 close, so starting it on wall-clock in parallel is the highest-leverage move regardless of which build item is elected.

End of prompt. Opens on `main`. Tier set by the elected item; if a Critical item is chosen, the full Critical Change Protocol (0c-ii) is completed visibly before any production change, and every founder-performed dashboard/Vercel/Terminal step is walked live (PR17).
