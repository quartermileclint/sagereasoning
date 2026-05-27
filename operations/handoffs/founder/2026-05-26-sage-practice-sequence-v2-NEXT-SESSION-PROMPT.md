# Next-Session Prompt — Sage Practice Sequence (v2 — elections locked + ADR)

**Supersedes:** `2026-05-26-sage-practice-spec-sequence-NEXT-SESSION-PROMPT.md` (v1) and the two 2026-05-25 next-scope/sequence drafts. This is the authoritative prompt.
**Stream:** founder.
**Tier:** varies per queue item (declare at each session's open). Session 1 = `governance`/Standard; Session 2 (C2) = **`code-critical`**; Session 3 = `code-standard`; Session 4 (spec) = `governance`/Standard.
**Governing frame:** `/adopted/standing-protocol-cache.md` + `/adopted/build-sessions-protocol-cache.md` ("no current users" holds).
**Predecessor closes:** `/operations/handoffs/founder/2026-05-26-sage-practice-exploration-close.md`; `…/2026-05-25-L2complete-L4-L6-finish-positive-scenarios-build-close.md`.
**Predecessor decision-log entries:** `D-SAGE-PRACTICE-DISTRIBUTION-IDENTITY-ELECTIONS-2026-05-26`; `D-SAGE-PRACTICE-DIRECTION-COVERAGE-STATUS-2026-05-26`; `D-L2COMPLETE-L4-L6-POSITIVE-SCENARIOS-BUILD-2026-05-25`.
**Keystone ADR (Session 4 consumes it):** `/adopted/adr/2026-05-26-credential-scope-and-coverage-status.md` (K1 — composite identity key + coverage_status state machine).

## How to use this prompt

The positive matrix L1–L7 is Verified; Combination 1 passes in production. This prompt **sequences the remaining whole-system-test work in dependency order**, ending with drafting the **Sage Practice** guardrail + dashboard spec — which now **builds on the K1 ADR rather than re-deriving identity/coverage_status.** Work the queue **top-down — each row is its own session.** Session 1 is scoped in full; Sessions 2–4 are scoped in brief.

**Naming (adopted):** **"Sage Practice"** = the umbrella product (Sage Calling, SageReasoning, Sage Assent, Sage Reflect). Use it consistently.

## The sequence (work top-down)

| # | Session | Tier / risk | Dependency | Delivers |
|---|---|---|---|---|
| 1 | **Priority 4 disclaimer + Combination 2** | `governance`/Standard | **HARD** — disclaimer text must exist before Comb 2 can assert it | completes negative-scenario coverage |
| 2 | **C2 — R20a distress perimeter** | **`code-critical`** (full Critical Change Protocol) | independent; completes the safety story | distress caught + redirected at each entry |
| 3 | **Control-vs-treatment rig** (substrate ON vs OFF) | `code-standard` | best after the matrix is complete | the value evidence (0h criterion 4) |
| 4 | **Sage Practice guardrail + dashboard SPEC** (design only) | `governance`/Standard | best after #3; **consumes the K1 ADR** | the spec that spawns its own build sessions |
| — | Option B (admin-gate fidelity) — *optional* | `code-standard`/`elevated` | none | higher-fidelity backfill; can be dropped |

## Where this sits in the priority stack (context, not scope)

This queue finishes **P0 0h**. P1 (Business Plan Review), P2, etc. remain *your* call on when 0h closes. Sage Practice is a candidate product direction (~P3); the Session-4 spec slots into the stack at your discretion. **Distribution channel-stack is elected** (below); pricing + marketplace targeting are not.

---

## ── START HERE: Session 1 — Priority 4 disclaimer + Combination 2 ──

**Why:** the last negative scenario; documentation-gated; blocked only on the disclaimer text. Lowest risk; **no test env.**

**Pre-conditions:** on `main`, tree clean; no test env; **resolve at open** whether the disclaimer is "Priority 4" or P2 2e (project-instructions P4 is Stripe — likely belongs to P2 2e honest-positioning, R19c/d).

**Part A — open (read order):** standing cache; build-arc cache; the predecessor closes; `data-room/04_test_brief/test-brief.md` §A.2 + §A.3 + `scenario-matrix.md` (Comb 2 row); the surfaces (`website/public/llms.txt`, `website/public/.well-known/agent-card.json`, limitations page source, developer docs); `/manifest.md` R18f + R19c/d/e. Confirm tier (`governance`/Standard); PR15 consult.

**Part B — procedure:**
1. Draft the no-practice disclaimer — plain-language, accurate; the Reasoning + Assent (no Reflect) config is legitimate single-session credentialing, not an ongoing "practice." **Keep the wording aligned with the K1 ADR's coverage_status honesty principle** (a dated, scoped verdict). **Founder approves the wording.**
2. Place it on each surface (docs, `llms.txt`, `agent-card.json`, limitations page).
3. Build `run-comb2.ts` (or a doc-grep on the proven harness pattern) asserting the string present + non-empty on every surface.
4. Verify: `npx tsc --noEmit` if any TS added; the grep asserts presence; founder eyeballs wording.
5. Decision-log entry (lean) + close (lean); update the scenario-matrix Comb 2 row + test-brief §A.2/§A.3 status.

---

## Sessions 2–4 (expand into their own prompts when reached)

**Session 2 — C2 (Critical).** Enable `SUBSTRATE_R20A_GATE_ENABLED` in TEST **under the full Critical Change Protocol (0c-ii), visibly**. Build `run-c2.ts` submitting a distress input at each product entry; assert redirect/pass-through (synchronous, PR3; **PR6 throughout**; PR1 one-route-first). Re-point `.env.local` at TEST first. Rollback = unset the flag (production untouched).

**Session 3 — control-vs-treatment rig.** Parameterise the runners (or `run-compare.ts`) to run a scenario with the substrate ON vs OFF; capture both into a ledger; define "better with the substrate" as an assertion / founder-readable diff. The 0h criterion-4 value demonstration + Sage Practice's value evidence. Needs the test env.

**Session 4 — Sage Practice guardrail + dashboard SPEC (design only — no build). CONSUMES the K1 ADR; do not re-derive identity or coverage_status.** Produce a one-page spec:
- **Distribution stack (elected):** **MCP (`mcp/tools`) is the keystone** tool/read surface (products appear as tools to every client); the **plugin layers the deterministic PreToolUse hook** on top (gating *consequential* tools only — selectivity; advisory/fail-open first; PR1 single-tool proof); a standalone authenticated **web dashboard** is the client-agnostic read surface (the Cowork artifact is one embedding). Read surface = universal (scores, coverage_status, cost, loops); control surface (toggle, presets) + live "running now" are client-coupled → in the plugin.
- **Credential honesty (from K1 ADR — carry, don't re-derive):** the `coverage_status` state machine (`continuous | suspended | resumed_unverified | expired | agent_elected`) and the composite `(operator_account, agent_identity@version)` key. `continuous` requires the hook; MCP-tool consultation earns `agent_elected`. Keep wording aligned with the Session-1 disclaimer. **Note:** implementing `coverage_status` + the composite key are Sage Assent surface changes → **code-elevated/critical when built**, separate sessions.
- **Packaging (elected): bundle-first.** Lead with the loop bundles (L5 reason→reflect; the full Sage Practice suite L6); atomic products available but **disclaimer-gated**, not the front door; pair with advisory/selectivity defaults + a minimal-viable-loop onboarding.
- **Dashboard:** the six panels — (1) hook on/off toggle; (2) agents + scores reusing `agent_accreditation`, surfacing `coverage_status`; (3) guardrail cost/time (own cost easy; total session partial); (4) loop/cost detection (= R5; can auto-pause); (5) config presets; (6) best-effort "running now + config."
- **Scale posture (assumption):** portable carried credential (central persistence for the certified subset) + decoupled async accreditation write + aggregate-not-raw.
- **Privacy/consent (R16/R17):** the hook sends planned actions (incl. code) to `/api/reason` — explicit consent; R17c deletion at scale.
- **Safe rollout:** throwaway sandbox dir, never the real repo or production; test-env `/api/reason`.
- Output = the spec; references the K1 ADR + `D-SAGE-PRACTICE-DISTRIBUTION-IDENTITY-ELECTIONS-2026-05-26`.

---

## Locked context — do NOT re-derive

- **Adopted 2026-05-26:** Sage Practice naming; the **coverage_status / composite-key credential model** (K1 ADR); **MCP-as-keystone**; **bundle-first**; the two settled choices (coarse versioning → material change forks; trial→adopt only if operator+conditions unchanged). Distribution *channel-stack* elected; pricing/marketplace targeting NOT.
- **Findings (recorded):** guardrails need *hooks* not the anchor file (F1); products built, distribution layer unproven (F2); scaling — `evaluated_actions` firehose + read-amplification, **inference cost the dominant ceiling** (F4); distribution channels + three packaging granularities, Sage Practice = the *platform* packaging (F5). See `D-SAGE-PRACTICE-DIRECTION-COVERAGE-STATUS-2026-05-26`.
- **Positive matrix L1–L7 — Verified live** (`data-room/05_outputs/`). **Combination 1** passing in production (R18f gate Live).
- **Production UNTOUCHED.** `/api/reason` byte-identical; provenance gate Live.
- **Local dev is on PRODUCTION** (`.env.local` 0 test / 1 prod). **No one-line "restore test" backup** — Sessions 2 & 3 re-point per `/data-room/04_test_brief/test-env-standup-checklist.md`, restart the dev server, confirm `key_id: substrate-layer2-test`. **Sessions 1 & 4 need no test env.** Return to prod: `cp website/.env.local.prod-backup-2026-05-24 website/.env.local`.
- **Standing test env** (2026-05-25): test Supabase `iwdtrvuphogkwmovhnvz`; test key-pair; two seeded credentials (`WSH_*` from `mint-test-credentials.ts`); A1 columns present; `SUBSTRATE_R20A_GATE_ENABLED` UNSET (Session 2 turns it on, under the Critical protocol).
- **Harness `lib/` proven — reuse, don't rebuild** (PR15): `http-client`, `reflect-driver`, `bridge-step`, `calling-driver`, `discovered-purpose-asserts`, `assertions`, `capture`, `fixtures`, `scenario-input`; runners `run-l1/2/3/5/7` + `run-l2-complete/4/6`.
- **Verify with `npx tsc --noEmit`** (full project), not only `npx tsx`. Live runs reach localhost:3000, which the build sandbox cannot — live runs + the `Verified` stamp are the founder's between-session step (0c).
- **Branch:** `main`. The AI does **no** git operations; stage by name (never `git add .`; never stage `website/.env.local*` or `website/tsconfig.tsbuildinfo`); clear any `.git/index.lock` host-side.

## Rollback

Sessions 1 & 4 are additive docs/scaffolding (nothing deployed). Session 2's rollback = unset `SUBSTRATE_R20A_GATE_ENABLED` in TEST. Session 3 is additive test scaffolding. Restore production local dev when test work is done.

## Forecast

Completing the queue closes the whole-system test's remaining coverage and arrives at the **Sage Practice** spec (Session 4) with the value proof, the reusable scores, the safety story, and the **K1 ADR** (identity + coverage_status) already settled. The spec then spawns its own build sessions, slotted into the priority stack at your discretion.

End of prompt. Opens on `main`. Production unchanged at session open; Sessions 2–3 re-point `.env.local` at TEST first; Sessions 1 & 4 need no test env.
