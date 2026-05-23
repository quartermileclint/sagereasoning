# Next-Session Prompt — E#1: Persist the Sage Calling Agent-Card verification verdict

**Stream:** founder.
**Tier:** opens at **`code-elevated`** (Sage Calling follow-on; touches existing gated-Live functionality + an additive schema change to an existing table). Re-declare if the elected bite differs (the two parked items below are `code-elevated` / `governance`).
**Governing frame:** `/adopted/standing-protocol-cache.md` + `/adopted/build-sessions-protocol-cache.md` ("no current users" holds — founder + test logins only).
**Predecessor session close:** `/operations/handoffs/founder/2026-05-23-C-phase3-external-wire-close.md` (Track C Phase 3 — Verified; the ATL→Sage Assent rename arc closed end-to-end).
**Predecessor decision-log entry:** `D-TRACK-FOLLOWONS-C-PHASE3-EXTERNAL-WIRE-2026-05-23`.
**Deliverable-of-the-day (read in full):** `/drafts/2026-05-23-track-followons-design-pack.md` **§Track E** (the surfaced follow-on list — item 1 is this session) + `/adopted/purpose-discovery-product-design.md` (the locked Sage Calling design — D-13 agent-card acceptance + the five specifications + the role / innermost-circle concepts).
**Risk classification:** **Elevated** under 0d-ii — additive schema change to the existing `discovery_sessions` table + a new write on the gated-Live `/api/calling` path + a read on the `/api/calling/approve` path. AC7 NOT engaged (no auth/session/credential surface). PR6 NOT engaged (no distress / Zone-2 / Zone-3 logic). Critical Change Protocol NOT engaged.

## Why this session matters

Sage Calling accepts an optional `agent_card_url` (D-13), fetches it, and verifies it — but the verdict is **only logged, never stored**. Today: `calling/route.ts` computes `verdict = verifyAgentCard(url, fetched)` and logs `{kind:'sage_calling_agent_card', verified, reason}` (~line 271); the approval path (`calling/approve/route.ts:91–94`) notes that because the chosen-role hint isn't persisted (no column, no migration this stage), `role` **defaults to `individual_nature`** in the five-spec assembly. E#1 persists the verdict so a verified Agent Card's chosen-role hint actually carries into the assembly. Per the design pack §E this is "the most actionable item — a concrete code effect," and it's the one pre-launch E item (E#2/#4/#5 are gated on conditions that don't hold yet; E#3 is finding-conditional).

## Locked context (do NOT re-litigate)

- Track C is **done** (Phases 1+2+3 Verified; "ATL"/"Agent Trust Layer" retired across internal, governance, and external/wire/public surfaces). The credential prefix is `sr_assent_`, the DB scope is `sage_assent_write`, the agent-card extension URI is `sage-assent-write-auth/v1`.
- D-13 stands: Sage Calling accepts `agent_card_url` only, declines `available_tools` (tool-poisoning vector). The verdict is engine-internal (R4) — logged, never surfaced to the agent.
- "No current users" holds → Critical Change Protocol step 3 N/A; all other discipline in force.

## Pre-conditions (confirm at open)

1. Working tree clean; Phase 3 committed + pushed; Vercel green; no `.git/index.lock` (close/reopen GitHub Desktop if it complains). `.fuse_hidden*` is gitignored.
2. Production on the Phase-3 baseline: `SAGE_REFLECT_ENABLED=true`; `MENTOR_ENCRYPTION_KEY` set; substrate A7 Verified; A10 Live+Verified on the `sr_assent_`/`sage_assent_write` surface; Sage Calling Live (gated); `SUBSTRATE_WRITE_PATH_ENABLED='true'`; Layer-3 + R20a substrate gates UNSET.
3. `cd website && npm install` if a clean checkout (tsx is a devDependency).

## Part A — Open under the protocol

Read in order:

1. `/adopted/standing-protocol-cache.md` (~3 min — tier, model selection, risk class, signals, status vocab).
2. `/adopted/build-sessions-protocol-cache.md` (~3 min — build-arc context; "no current users").
3. `/operations/handoffs/founder/2026-05-23-C-phase3-external-wire-close.md` (predecessor — what landed).
4. `/operations/decision-log.md` last 1–2 entries (`D-TRACK-FOLLOWONS-C-PHASE3-EXTERNAL-WIRE-2026-05-23`) + `D-SAGE-CALLING-STAGE2-ENGINE-STORE-WIRED-VERIFIED-2026-05-21` (the Sage Calling engine/store baseline E#1 extends).
5. `/drafts/2026-05-23-track-followons-design-pack.md` §Track E + `/adopted/purpose-discovery-product-design.md` (the five-spec assembly + role concepts).
6. The live code: `website/src/app/api/calling/route.ts` (verdict computation/logging, ~line 240–312), `website/src/app/api/calling/approve/route.ts` (the five-spec assembly + the `role` default, ~line 85–100), and `website/supabase-discovery-sessions-migration.sql` (the table E#1 likely extends).

Confirm at open: tier (`code-elevated`); hold-point (P0 0h active); model selection (PR4 — no new LLM calls expected; **N/A**, confirm against `constraints.ts`); status vocabulary; signals/risk class. **PR15 consult** (`.claude/skills/anthropic/` + `/operations/agentic-commerce-findings-downstream-order.md` — F1–F4 unlikely to target Sage Calling). **PR16 lens** (does persisting the verdict strengthen positioning? likely neutral — internal behaviour).

## Part B — The work (only if E#1 is elected)

**Surface the bite at open and let the founder elect.** Recommended = **E#1** (locked order; the one pre-launch E item). Alternatives the founder may elect instead: the parked **`trust-layer/` directory rename** (`code-elevated`; needs grep-compensated verification for the `tsc`-invisible cross-boundary import); or the parked **`mode:'atl_wrapper'` discriminant classification** (`governance`; internal-dispatch vs wire-contract — the sensible quick win to clear before any future attempt to rename that discriminant). State the election at open.

### If E#1 is elected — suggested procedure (PR1 + PR10)

This is a design-then-build item (mirror A1's "design note then build" posture if the founder prefers). At open, surface the design choices and let the founder elect:
- **What to persist** — minimally a boolean (`agent_card_verified`) and the chosen-role hint the assembly needs (so `role` can be set instead of defaulting to `individual_nature`). Confirm the exact role vocabulary against the locked design's five specifications.
- **Where** — an additive nullable column (or columns) on the existing `discovery_sessions` table (idempotent migration; reversible via `ALTER TABLE … DROP COLUMN`). Confirm against `supabase-discovery-sessions-migration.sql`.
- **Fail-open posture** — a verdict write-failure on the `/api/calling` path must not break the session (degrade to today's behaviour: unpersisted → role defaults), mirroring the A1 fail-closed-to-current-behaviour pattern.

Then build: (1) the migration; (2) write the verdict on the `/api/calling` path where it's computed; (3) read it on the `/api/calling/approve` path and feed the chosen-role hint into the five-spec assembly. PR1: prove the persistence round-trip on the single calling→approve path before declaring done. PR2: wire-and-verify in the same session.

### Verify

`npx tsc --noEmit` → 0. Affected suites green (the calling-route + approve-route suites; the question-library/engine suites should be untouched). Founder runs the `discovery_sessions` migration in Supabase + confirms the VERIFY block. Founder smoke: run a calling session with a verifiable `agent_card_url`, approve it, and confirm (Supabase) the verdict persisted and the assembled `role` reflects the verified card rather than `individual_nature`.

### Decision-log + close (lean form)

Append a lean `D-…-E1-…` entry (per `/adopted/standing-protocol-cache.md` §"Lean decision-log entry"). Write the lean session close (§"Lean session close"). If a governed surface changes, update the affected cache + log a `D-CACHE-DRIFT-RESOLVED-…` entry (none expected).

## Part C — Anticipated session shape

| Phase | Estimate |
|---|---|
| Caches + predecessor close + design-pack §E + Sage Calling design + the 3 code files | 20–30 min |
| Design choices (what to persist; where) — founder elects | 15–20 min |
| Migration + write (calling path) + read (approve path) | 45–75 min |
| Verify (tsc + suites + founder migration + smoke) | 20–30 min |
| Decision-log + lean close | 20–30 min |
| **Total** | **~2–3 hours** |

## Rollback path

Additive + reversible: the migration drops via `ALTER TABLE … DROP COLUMN`; the code reverts via `git revert` the commit + push (Vercel rebuilds to the pre-E1 shape). No runtime behaviour changes until the founder runs the migration + deploys; the verdict-read degrades to today's `individual_nature` default if the column is absent.

## Forecast

Success = a verified Agent Card's chosen-role hint persists and carries into the five-spec assembly, replacing the `individual_nature` default — closing the one actionable pre-launch Sage Calling follow-on. After E#1, the remaining E items are condition-gated (E#2/#4/#5 wait on external users / observability / demand; E#3 on a missed-signal finding), and the two parked items (`trust-layer/` rename; `mode:'atl_wrapper'` classification) remain available. The founder elects the next bite at open.

End of prompt. Opens as a `code-elevated` Sage Calling follow-on. Baseline: Track C complete (Phases 1+2+3 Verified), A-track Live/Verified (gated), Vercel green — stable known-good.
