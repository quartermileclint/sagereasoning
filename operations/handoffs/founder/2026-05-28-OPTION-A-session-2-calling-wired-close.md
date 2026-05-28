# Session Close — 2026-05-28 — Option A Build Arc, Session 2: Calling-Side R20a Catch Wired

**Stream:** founder.
**Governing frame:** `/adopted/standing-protocol-cache.md` + `/adopted/build-sessions-protocol-cache.md` ("no current users" holds) + `/adopted/adr/2026-05-27-r20a-configuration-perimeter-and-audience-contract.md` (Accepted) + `/drafts/2026-05-28-r20a-single-catch-contract.md` §5.2 (the implementation contract).
**Tier:** `code-critical` — **full Critical Change Protocol applied**. The full CCP responses (1–6) are recorded in the decision-log entry `D-R20A-OPTIONA-S2-CALLING-WIRED-2026-05-28` and were drafted visibly in chat at Step 1, with explicit founder approval obtained before any code was touched.
**Date:** 2026-05-28.
**Branch:** `main` (the AI did **no** git operations).
**Predecessor close:** `/operations/handoffs/founder/2026-05-28-OPTION-A-session-1-verification-design-close.md`.

## What this session did

1. **Opened under the protocol.** Read the standing cache, build-sessions cache, design spec, manifest targeted sections (§R20a, §AC2, §AC4, §AC5, §AC7, §AC8), last 5 decision-log entries, and code surfaces (`r20a-gate.ts`, `/api/calling/route.ts`, `calling-service.ts`, `parallel-run.ts`, `zone3-boundary.ts`, `r20a-invocation-guard.test.ts`, `scenario-input.ts`). Confirmed AI-verified pre-condition (Calling not in AC5 registry); confirmed founder pre-conditions (design spec accepted as written; AC5 ninth-route protocol via Option α — extend existing registry; Cowork panel paste-synced; proceed to CCP).
2. **Drafted full CCP visibly.** Six steps with named risks and explicit founder approval ask on five items; obtained "OK" specific to those items + my recommendation on the functional-test mocking sub-question.
3. **Executed Step 2 — AC5 ninth-route protocol (option α).** Extended `r20a-invocation-guard.test.ts` with `SUBSTRATE_GATE_ROUTES` registry + four `test.each` blocks asserting `enforceLayer2R20aGate` imported and called awaited, plus `isCallingR20aEnabled` imported and called.
4. **Executed Step 3 — wired the catch into `/api/calling`.** Added `isCallingR20aEnabled()` + canonical `SafetySignal` type to `r20a-gate.ts`; added `buildCallingDistressRedirectResponse` + optional `safetySignal` plumbing to `response-builders.ts`; wired the catch into Case B (response supplied, in-progress session) BEFORE `computeAdvance`, gated behind `isCallingR20aEnabled()`. **Surfaced a design tension mid-step**: A7's existing flag check would couple Calling's activation to A7's flag, contrary to design spec §5.6's "two independent activations" intent. Founder elected Option A (add additive `overrideFlag?: boolean` parameter to A7); implemented; `parallel-run.ts` unchanged.
5. **Executed Step 4 — wrote AC4 functional + invocation tests.** New tsx plain-assertion file at `website/src/app/api/calling/__tests__/r20a-invocation.test.ts` mirroring the existing `r20a-gate.test.ts` pattern. 44 assertions across INV-1–5 (invocation grep), VH-1–4 (verdict-handling via reused-gate), FT-1–4 (flag semantics), DC-1–2 (decoupling from A7), RB-1–4 (response-builder shape).
6. **Executed Step 5 — sandbox verify.** Two diagnostic-certainty signals:
   - **Diagnostic-certain — root cause identified** on the Calling substantive work: tsx test **44/44 PASS, EXIT 0**; `npx tsc --noEmit` whole-project **EXIT 0**.
   - **Diagnostic-uncertain — pattern level** on the extended Jest registry: `npx jest ...r20a-invocation-guard.test.ts` failed with `SyntaxError: Cannot use import statement outside a module` — pre-existing F-series Jest-config debt (referenced in manifest §AC12), not introduced by this session's structural edits. Substantive AC4 invocation coverage for `/api/calling` is satisfied by the tsx test.
7. **Executed Step 6 — decision-log entry (Critical full form)** at `D-R20A-OPTIONA-S2-CALLING-WIRED-2026-05-28`. Includes CCP responses, files touched, risk classification, AC4 invocation testing record, PR5 knowledge-gap carry-forward, verification commands, open questions, rules served.
8. **Executed Step 7 — this session close.**

## Decisions Made

- `D-R20A-OPTIONA-S2-CALLING-WIRED-2026-05-28` appended — full Critical-tier entry; Calling-side R20a catch Wired + Verified (substantive); A7 `overrideFlag` parameter Wired + Verified (additive); canonical `SafetySignal` schema Wired; AC5 registry extended.

## Status Changes

| Item | Old | New |
|---|---|---|
| Calling-side R20a catch (`/api/calling` Case B) | Scoped (per session 1) | **Wired**, **Verified** (substantive — Diagnostic-certain on tsx 44/44 + tsc EXIT 0; Diagnostic-uncertain — pattern level on Jest registry, pre-existing F-series) |
| `SUBSTRATE_CALLING_R20A_ENABLED` env flag | Did not exist | **Scaffolded** (default OFF; UNSET in Vercel; created in `r20a-gate.ts`) |
| Canonical `SafetySignal` schema (per design §4.2) | Designed (in design spec) | **Wired**, **Verified** (exported from `r20a-gate.ts`; used by Calling; widens existing Reflect carrier additively) |
| A7 `overrideFlag` parameter on `EnforceR20aGateInput` | Did not exist | **Wired**, **Verified** (additive; default behaviour preserved for `parallel-run.ts`) |
| AC5 registry extended with `SUBSTRATE_GATE_ROUTES` | 8 routes (route-level pattern only) | 8 routes (unchanged) + 1 substrate-gate route (`/api/calling`); **Wired** structurally, execution gated on F-series Jest-config remediation |
| Production state (Vercel) | All R20a flags UNSET | **UNCHANGED** — `SUBSTRATE_CALLING_R20A_ENABLED` UNSET (new flag); `SUBSTRATE_R20A_GATE_ENABLED` UNSET; `/api/reason` byte-identical; `/api/substrate/layer3` → 503 |
| Reflect-content R20a catch (session 3) | Scoped | Scoped (unchanged; queued next) |
| Layer-3 audience rendering (session 4) | Scoped | Scoped (unchanged) |
| Configuration-level invocation tests (session 5) | Scoped | Scoped (unchanged) |

## Verification Method Used (0c framework)

| Work type | Verification |
|---|---|
| Code change (route handler, response builders, substrate gate, test file, registry) | tsx plain-assertion test exercising verdict logic + response-builder shapes + flag semantics + decoupling (44 assertions); whole-project `tsc --noEmit` |
| Governance documentation (decision-log entry, this session close) | Founder reads directly |
| Manifest interpretation (AC5 ninth-route protocol via option α) | Founder elected at session open; recorded in this close |

The diagnostic-certainty signal pair (PR10) is integral to this verification: Diagnostic-certain on the substantive work; Diagnostic-uncertain — pattern level on the Jest registry execution. Both signals are honestly named in the decision-log entry and require no further action from you to "resolve" — the Jest signal is a pre-existing F-series stewardship issue, separate from this session's scope.

## Risk Classification Record (0d-ii)

**Critical** under PR6 + AC5 for the substantive change (R20a perimeter ninth-route broadening; safety-critical function wiring on a new route).

Sub-changes:
- Catch wiring in `/api/calling` — Critical; full CCP applied.
- A7 `overrideFlag` parameter add — additive Critical change to A7 (a Critical surface); default behaviour preserved; existing callers (`parallel-run.ts`) unchanged.
- Response-builder additions — Standard (additive to existing builders; new builder is purely additive).
- Registry test extension — Standard (test scaffolding only; never deployed).

AC7 not engaged (no auth/cookie/session/redirect change).
KG1 not engaged for the catch path (no DB writes; metering path unchanged).
PR17 not engaged (no founder-performed operational step required between sessions beyond the commit + verification commands below).

## PR5 — Knowledge-Gap Carry-Forward

**0 concepts re-explained this session.** No KGs from the existing register engaged:
- KG1 (Vercel five rules) — N/A (no DB writes in the catch path)
- KG2 (Haiku reliability boundary) — implicit via PR4 model selection (Haiku via A7's classifier; no new selection decision)
- KG3–KG7 — N/A

**One new pattern observation (candidate, 1st recurrence):** "Design-spec-vs-implementation flag-coupling tension surfaces only when the design spec is implemented end-to-end. The spec assumed independent flag activations across modules; A7 as implemented gated itself behind one flag, which would have coupled all callers. The tension would not have appeared in design review — only in implementation." This is logged as a *candidate* per PR5 (observed once); promotion to a permanent KG entry awaits a second recurrence in a future session. Not added to `operations/knowledge-gaps.md` yet (candidate state) — will be added if recurrent.

## Next Session Should

**Open Option A build arc — session 3** (Reflect-content R20a catch + propagation). Pre-conditions before opening:

1. Founder reviews this close + the decision-log entry `D-R20A-OPTIONA-S2-CALLING-WIRED-2026-05-28` and confirms (or amends) the disposition of the Diagnostic-uncertain — pattern level signal on the Jest registry. (My recommendation: acknowledge as pre-existing F-series stewardship, no session-3 blocker.)
2. Founder confirms whether to **fold-in the spec §7 open question** about AC5 registry coverage of `/api/practice/reflect` — does the existing `/api/reflect` entry cover the practice path, or is session 3 a tenth-route protocol session rather than augmenting an existing entry? Will be re-verified by code-read at session 3 open.
3. The Cowork project-instructions panel remains paste-synced (no changes this session).

The next-session prompt for session 3 (Reflect-content wiring) is **not drafted in this session** — drafted at session 3's open per the founder's preference (same posture as session 2's predecessor close).

## Blocked On — single commit list (stage by name; do NOT `git add .`; never stage `website/.env.local*` or `website/tsconfig.tsbuildinfo`)

```bash
cd "/Users/clintonaitkenhead/Claude-work/PROJECTS/sagereasoning"
git add \
  website/src/lib/substrate/r20a-gate.ts \
  website/src/app/api/calling/response-builders.ts \
  website/src/app/api/calling/route.ts \
  website/src/lib/__tests__/r20a-invocation-guard.test.ts \
  website/src/app/api/calling/__tests__/r20a-invocation.test.ts \
  operations/decision-log.md \
  "operations/handoffs/founder/2026-05-28-OPTION-A-session-2-calling-wired-close.md"
git commit -m "Option A build arc session 2: Calling-side R20a catch Wired. Substrate gate enforceLayer2R20aGate wired into /api/calling Case B before computeAdvance, gated behind new env flag SUBSTRATE_CALLING_R20A_ENABLED (default OFF; UNSET in Vercel). Canonical SafetySignal schema per design §4.2 added to r20a-gate.ts and emitted on REDIRECT (developer-form payload) + on PASS+mild (additive on outward response). A7 gained additive overrideFlag?: boolean parameter to decouple Calling's activation from A7's flag per design §5.6 (parallel-run.ts unchanged). AC5 ninth-route protocol via option α — r20a-invocation-guard.test.ts extended with SUBSTRATE_GATE_ROUTES + four substrate-gate-pattern test.each blocks. AC4 invocation + functional testing via new tsx test at website/src/app/api/calling/__tests__/r20a-invocation.test.ts: 44/44 PASS EXIT 0; npx tsc --noEmit EXIT 0; Jest registry execution gated on pre-existing F-series Jest-config debt (AC12). Production UNCHANGED. (D-R20A-OPTIONA-S2-CALLING-WIRED-2026-05-28). Critical / code-critical; full CCP applied."
```

Then push via GitHub Desktop. **No Vercel behaviour change** — `SUBSTRATE_CALLING_R20A_ENABLED` is a new flag; remains UNSET in Vercel. `SUBSTRATE_R20A_GATE_ENABLED` remains UNSET. `/api/reason` byte-identical. The new code path is invisible to any traffic at session close.

**Production state at session close:** **UNCHANGED.** `SUBSTRATE_CALLING_R20A_ENABLED` UNSET in Vercel (new flag); `SUBSTRATE_R20A_GATE_ENABLED` UNSET in Vercel; `/api/reason` byte-identical; `/api/substrate/layer3` → 503; provenance gate Live; A7 `overrideFlag` parameter additive (no production impact). Local dev still on **production** (the TEST standup remains a deferred founder step, carried forward to the C2 live run after Option A per PR17 live walkthrough discipline).

## Open Questions

Carried from the decision-log entry:
- **Functional-test live-Haiku coverage.** Reused-gate path only this session; live Haiku covered by the C2 live run post-Option-A.
- **Mild-signal threading onto `DiscoveredPurpose` envelope.** Out of PR1 single-endpoint scope. Revisit at session 4.
- **A6 — `developer_note` + `suggested_user_message` formalisation.** Placeholder text in `buildCallingDistressRedirectResponse`. Revisit at A6 session.
- **F-series Jest-config debt.** Pre-existing infrastructure issue surfaced by this session's Jest run; not introduced. Revisit at F-series stewardship session.
- **A.4 cross-seam propagation end-to-end test.** Calling-side carrier is emitted; downstream Reasoning does not yet read a Calling-emitted `safety_signal`. Revisit at session 4 + session 5.

## Founder Verification (Between Sessions)

**Confirm the new tsx test passes:**

```
cd "/Users/clintonaitkenhead/Claude-work/PROJECTS/sagereasoning/website"
npx tsx src/app/api/calling/__tests__/r20a-invocation.test.ts
```
Expected last line: `44/44 pass | 0/44 fail`. EXIT 0. Five intermediate log lines starting `[substrate.layer2.r20a_gate.span]` are expected (A7's span emit on the reused-gate path) and harmless.

**Confirm the whole-project type-check:**

```
cd "/Users/clintonaitkenhead/Claude-work/PROJECTS/sagereasoning/website"
npx tsc --noEmit
```
Expected: no output. EXIT 0.

**Confirm the decision-log entry exists:**

```
cd "/Users/clintonaitkenhead/Claude-work/PROJECTS/sagereasoning"
grep -n "D-R20A-OPTIONA-S2-CALLING-WIRED-2026-05-28" operations/decision-log.md
```
Expected: a match near the end of the active log, after `D-R20A-SC1-SINGLE-CATCH-CONTRACT-DRAFTED-2026-05-28`.

**Confirm this close exists:**

```
ls "/Users/clintonaitkenhead/Claude-work/PROJECTS/sagereasoning/operations/handoffs/founder/2026-05-28-OPTION-A-session-2-calling-wired-close.md"
```
Expected: the file exists.

**Confirm production is UNCHANGED** (no Vercel action required this session, but verify if you want):
- Vercel dashboard → Settings → Environment Variables: `SUBSTRATE_CALLING_R20A_ENABLED` should not exist (new flag, UNSET); `SUBSTRATE_R20A_GATE_ENABLED` should not exist (unchanged from session 1 close)
- `https://sagereasoning.com/api/substrate/layer3` → 503 (unchanged)
- `https://sagereasoning.com/api/public-key` → steady-state shape (Ed25519; `previous: null`; `rotation_overlap_until: null`) — unchanged

**No live-system action required this session.** Production was not touched.

## Orchestration Reminder

- The Cowork project-instructions panel stays paste-synced against `/adopted/project-instructions-snapshot.md` (PR1–PR17). No governance changes this session — no re-sync needed.
- Session 3 (Reflect-content) opens against this session's Verified Calling work as the PR1 proof. The cross-seam propagation contract proven here (Calling emits canonical `safety_signal`; the route-side wiring honours flag + decoupling) is the pattern session 3 follows for Reflect.
- PR17 is engaged for the deferred C2 live run (post-Option-A); the live TEST-env standup will be walked through interactively when that session opens, not handed off.

## Cross-references

- Decision log: `D-R20A-OPTIONA-S2-CALLING-WIRED-2026-05-28`
- Design spec (implemented this session): `/drafts/2026-05-28-r20a-single-catch-contract.md` §§2, 3, 4.2, 5.2, 5.6
- Parent ADR (Accepted): `/adopted/adr/2026-05-27-r20a-configuration-perimeter-and-audience-contract.md`
- Predecessor close: `/operations/handoffs/founder/2026-05-28-OPTION-A-session-1-verification-design-close.md`
- Predecessor decision-log entries: `D-R20A-SC1-SINGLE-CATCH-CONTRACT-DRAFTED-2026-05-28`; `D-R20A-ADR-ADOPTED-SEQUENCING-2026-05-27`; `D-R20A-CONFIG-PERIMETER-OPTION-A-2026-05-27`; `D-C2-R20A-PERIMETER-DIAGNOSTIC-AND-HARNESS-2026-05-27`; `D-A7-R20A-GATE-SCAFFOLDED-VERIFIED-2026-05-13`
- A7 substrate gate (the seed primitive reused): `/website/src/lib/substrate/r20a-gate.ts` + `/operations/handoffs/founder/2026-05-13-A7-r20a-gate-close.md`
- AC5 registry (extended this session): `/website/src/lib/__tests__/r20a-invocation-guard.test.ts`
- New tsx test (this session): `/website/src/app/api/calling/__tests__/r20a-invocation.test.ts`
- Sage Calling endpoint (wired this session): `/website/src/app/api/calling/route.ts`
- Sage Calling response builders (extended this session): `/website/src/app/api/calling/response-builders.ts`
- Sage Reflect Zone-3 boundary (carrier reconciled in canonical SafetySignal schema): `/website/src/lib/sage-reflect/zone3-boundary.ts`
- Seam map: `/data-room/03_seam_map/seam-map.md`

*End of session close. Stabilised to a known-good state: the Calling-side R20a catch is Wired + Verified at the substantive level behind `SUBSTRATE_CALLING_R20A_ENABLED` (default OFF; UNSET in Vercel); A7 gained an additive `overrideFlag` parameter decoupling Calling's activation from A7's flag per design §5.6; canonical `SafetySignal` schema Wired and used by Calling; AC5 registry extended (option α; structural — Jest execution awaits F-series remediation). Production UNCHANGED. Next: session 3 — Reflect-content R20a catch + propagation (Critical; PR1; CCP). The next-session prompt is drafted at session 3's open.*
