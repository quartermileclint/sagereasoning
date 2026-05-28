# Session Close — 2026-05-28 — Option A Build Arc, Session 4: Layer-3 Audience Rendering + `/api/reason` Agent-API Fix Wired

**Stream:** founder.
**Governing frame:** `/adopted/standing-protocol-cache.md` + `/adopted/build-sessions-protocol-cache.md` ("no current users" holds) + `/adopted/adr/2026-05-27-r20a-configuration-perimeter-and-audience-contract.md` (Accepted) + `/drafts/2026-05-28-r20a-single-catch-contract.md` §§3, 3.4, 3.5, 5.4 (the implementation contract).
**Tier:** `code-critical` — **full Critical Change Protocol applied**. CCP responses (1–6) recorded in decision-log entry `D-R20A-OPTIONA-S4-AUDIENCE-RENDERING-WIRED-2026-05-28` and drafted visibly in chat at Step 1; founder approved all eight named items before any code was touched.
**Date:** 2026-05-28.
**Branch:** `main` (the AI did **no** git operations).
**Predecessor close:** `/operations/handoffs/founder/2026-05-28-OPTION-A-session-3-reflect-wired-close.md`.

## What this session did

1. **Opened under the protocol.** Read the standing cache, build-sessions cache, design spec §§3, 3.4, 3.5, 5.4, 6, S3 predecessor close, manifest targeted sections, the decision log's last entry (S3), and code surfaces (`layer3-service.ts`, `r20a-gate.ts`, `/api/reason/route.ts`, `r20a-classifier.ts`, `zone3-boundary.ts`, Calling + Reflect response-builders, the S2 Calling test as PR15 model). Verified all five pre-conditions:
   - PC1 design spec re-read — GREEN.
   - PC2 Jest-registry F-series carry-forward acknowledged — GREEN (pre-existing AC12; not a S4 blocker).
   - PC3 `/api/reason` web-vs-API auth signal — **GREEN, Diagnostic-certain.** The determinant is `auth.user?.id` (truthy → web; falsy → API). Already used at `route.ts:721` for `getPractitionerContext` gating. **No design-spec §3.2 revisit needed.**
   - PC4 `ConsumerContext` shape — GREEN (additive `audience?` field clean).
   - PC5 A6 wording posture — Option (a) (initial wording drafted in-session; founder-reviewed at Step 2 before code-write).
2. **Drafted full CCP visibly in chat.** Six steps with eight named approval items: (i) render helper location (new sibling file), (ii) flag default OFF + name, (iii) audience determinant = `auth.user?.id`, (iv) audience assignment per surface, (v) A6 wording Option (a) with in-session founder review, (vi) thin-wrapper refactor + structurally-identical regression (not literal byte-identical), (vii) four independent flags, (viii) regression-check posture = re-run S2 + S3 in-session. Founder reviewed and approved all eight via "ok" reply.
3. **Executed Step 2 — built render helper + ConsumerContext.audience + A6 wording.** Surfaced the drafted `R20A_DEVELOPER_NOTE_DEFAULT` wording in chat first (per CCP item (v) commitment); founder approved via AskUserQuestion ("OK as drafted"). Created new file `/website/src/lib/substrate/r20a-audience-renderer.ts` (~270 lines) with: `R20aAudience` type; `R20A_DEVELOPER_NOTE_DEFAULT` formalised standing string; `R20aHumanUserRedirectPayload` + `R20aAgentDeveloperRedirectPayload` payload shapes + discriminated union; `renderR20aRedirectResponse` pure-sync helper; `isR20aAudienceRenderingEnabled` env-flag check. Edited `layer3-service.ts` to add optional `audience?: R20aAudience` field to `ConsumerContext` + re-export of the type alias (forward-compat scaffold for K-category migration).
4. **Executed Step 3 — wired audience at `/api/reason`.** Added imports for the helper + flag + type. Added `r20aAudience` derivation from `auth.user?.id` (after `isApiKeyAuth` line). Rewired both redirect branches: route-guard (~line 626; the `enforceDistressCheck` redirect) and Branch 1.7 (~line 854; the A7 `r20a_gate_redirect` pass-through) — both compute `effectiveAudience = isR20aAudienceRenderingEnabled() ? r20aAudience : 'human_user'` and call the helper. Calling + Reflect routes don't need route-level audience changes (their audience is hardcoded `'agent_developer'` in the builder refactor at Step 4).
5. **Executed Step 4 — refactored Calling + Reflect builders to thin wrappers.** `buildCallingDistressRedirectResponse` and `buildReflectDistressRedirectResponse` both now call `renderR20aRedirectResponse({ audience: 'agent_developer', ... })`, merge in their `session_id`, and pass to their existing `build()` helper which adds surface-specific fields (`interaction_type`, `disclaimer`, `documentation_url`) + standing headers. The per-surface placeholder constants (`CALLING_R20A_DEVELOPER_NOTE_PLACEHOLDER`, `REFLECT_R20A_DEVELOPER_NOTE_PLACEHOLDER`) are retired.
6. **Executed Step 5 — sandbox verify.** Wrote new test `/website/src/app/api/reason/__tests__/r20a-audience-rendering.test.ts` (66 assertions; PR15 model mirroring S2 + S3 tsx pattern). Ran four verification commands:
   - **S4 new test:** **66/66 PASS | EXIT 0** (INV-0..7 + PR-1..3 + FT-1..5 + AR-1..10 + RB-Calling-1..12 + RB-Reflect-1..12 + SH-1).
   - **S2 Calling regression:** **44/44 PASS | EXIT 0** (no updates required — S2 RB-1f checks `length > 0`, not exact text).
   - **S3 Reflect regression:** **55/55 PASS | EXIT 0** (no updates required — same posture).
   - **`tsc --noEmit` whole-project:** **EXIT 0, no output.**
   - **Total: 165/165 assertions PASS.**
   - **Diagnostic-certainty signal:** **Diagnostic-certain — root cause identified** on the substantive S4 work. **Diagnostic-uncertain — pattern level** carried forward on the Jest registry execution (pre-existing F-series AC12 debt; not a S4 regression).
   - **Unexpected positive observation:** the CCP item (vi) "byte-identical regression" concern was over-cautious; S2/S3 tests passed unchanged because their `developer_note` assertions are structural (length > 0), not text-exact. Logged as a new PR5 candidate observation.
7. **Executed Step 6 — decision-log entry (Critical full form)** at `D-R20A-OPTIONA-S4-AUDIENCE-RENDERING-WIRED-2026-05-28`. Includes CCP responses, files touched, risk-classification record, AC4 invocation-testing record (10 assertion-group rows), PR5 carry-forward (one new candidate; two prior candidates from S2 + S3 did NOT recur), open questions, founder-performable verification commands, rules served (extensive — see entry), status (Adopted; implementation status across nine items).
8. **Executed Step 7 — this session close.**

## Decisions Made

- `D-R20A-OPTIONA-S4-AUDIENCE-RENDERING-WIRED-2026-05-28` appended — Critical-tier full entry. Audience-rendering helper Wired + Verified; `R20A_DEVELOPER_NOTE_DEFAULT` formalised + founder-approved; `ConsumerContext.audience` additive; `/api/reason` two redirect branches rewired (code-Wired; activation deferred to future Critical session); Calling + Reflect builders refactored to thin wrappers; placeholder constants retired; AC5 perimeter unchanged at 10 routes. Production UNCHANGED.

## Status Changes

| Item | Old | New |
|---|---|---|
| `renderR20aRedirectResponse` helper | Scoped (per design spec §3.3) | **Wired**, **Verified** (Diagnostic-certain on 165/165 assertions + tsc EXIT 0) |
| `R20A_DEVELOPER_NOTE_DEFAULT` formalised prose-mode key | Did not exist (placeholders in per-surface builders) | **Wired**, **Verified** (founder-approved at Step 2 via AskUserQuestion) |
| `ConsumerContext.audience` field | Did not exist | **Wired**, **Verified** (additive; forward-compat for K-category migration) |
| `SUBSTRATE_R20A_AUDIENCE_RENDERING_ENABLED` env flag | Did not exist | **Scaffolded** (default OFF; UNSET in Vercel; created in `r20a-audience-renderer.ts`) |
| `r20aAudience` derivation in `/api/reason/route.ts` | Did not exist | **Wired**, **Verified** (INV-6 + INV-7 confirm pattern + count) |
| `/api/reason` route-guard redirect branch (~line 626) | Emitted human-framed shape to ALL callers (Finding 2 bug) | **Code-Wired** (calls render helper with `effectiveAudience`); **activation deferred** behind `SUBSTRATE_R20A_AUDIENCE_RENDERING_ENABLED` UNSET — bug preserved until future Critical session |
| `/api/reason` Branch 1.7 (A7 pass-through, ~line 854) | Same as above | **Code-Wired** + **activation deferred** (same posture) |
| `buildCallingDistressRedirectResponse` (Calling) | Used `CALLING_R20A_DEVELOPER_NOTE_PLACEHOLDER` | **Wired** (thin wrapper); **Verified** (RB-Calling-1..12 + SH-1 PASS; placeholder retired) |
| `buildReflectDistressRedirectResponse` (Reflect) | Used `REFLECT_R20A_DEVELOPER_NOTE_PLACEHOLDER` | **Wired** (thin wrapper); **Verified** (RB-Reflect-1..12 + SH-1 PASS; placeholder retired) |
| AC5 perimeter count | 10 (8 route-level + 2 substrate-gate) | **10 (UNCHANGED)** — existing surfaces modified; no new routes added |
| Production state (Vercel) | All R20a flags UNSET; `/api/reason` byte-identical | **UNCHANGED** — `SUBSTRATE_R20A_AUDIENCE_RENDERING_ENABLED` UNSET (new flag); all three existing R20a flags remain UNSET; `/api/reason` byte-identical to pre-S4 for ALL caller types |
| Layer-3 audience rendering (session 4 scope) | Scoped | **Wired**, **Verified** at substantive level |
| Configuration-level invocation tests (session 5) | Scoped | Scoped (unchanged; queued next) |

## Verification Method Used (0c framework)

| Work type | Verification |
|---|---|
| Code change (new helper module, ConsumerContext edit, route rewiring, builder refactors) | New tsx test `r20a-audience-rendering.test.ts` (66 assertions across 7 groups: INV / PR / FT / AR / RB-Calling / RB-Reflect / SH); regression re-run of S2 (44/44) + S3 (55/55) tests; whole-project `tsc --noEmit` (EXIT 0) |
| New A6 wording (`R20A_DEVELOPER_NOTE_DEFAULT`) | Founder reviewed and approved the drafted wording in chat at Step 2 via AskUserQuestion ("OK as drafted") BEFORE any code was written |
| Governance documentation (decision-log entry, this session close) | Founder reads directly |
| Audience determinant on `/api/reason` (PC3) | AI verified by code-read at session open (the `auth.user?.id` signal exists as a clean determinant; INV-6 + INV-7 test assertions protect the pattern) |

The diagnostic-certainty signal pair (PR10) is integral to this verification: **Diagnostic-certain** on the substantive work; **Diagnostic-uncertain — pattern level** on the Jest registry execution (carried forward from S2 + S3). Both signals are honestly named in the decision-log entry and require no further action from you to "resolve" — the Jest signal is a pre-existing F-series stewardship issue separate from this session's scope.

## Risk Classification Record (0d-ii)

**Critical** under PR6 + AC5 for the substantive change (R20a redirect-rendering surface modified across three routes — `/api/reason`, `/api/calling`, `/api/practice/reflect`; safety-critical function wiring).

Sub-changes:

- New `r20a-audience-renderer.ts` module — Critical (PR6 — adds a function in the R20a safety path).
- `/api/reason` redirect branch rewiring (both branches) — Critical (PR6 + AC5).
- `r20aAudience` derivation from `auth.user?.id` — Standard (reads existing auth signal; no auth-surface change).
- New flag `SUBSTRATE_R20A_AUDIENCE_RENDERING_ENABLED` — Critical-gated (the flag gates a Critical change).
- `ConsumerContext.audience` additive field — Standard.
- Calling + Reflect builder thin-wrapper refactor — Elevated (changes existing emitted-shape internals; structural identity preserved; `developer_note` text formalised).
- New tsx test — Standard.

AC7 NOT engaged (no auth/cookie/session/redirect change).
KG1 NOT engaged for the helper path (pure-sync; no DB writes).
PR17 NOT engaged (no founder-performed operational step required between sessions beyond the commit + verification commands below).

## PR5 — Knowledge-Gap Carry-Forward

**0 concepts re-explained this session.** No KGs from the existing register engaged (KG1 N/A — no DB writes; KG2 N/A — no LLM call in helper; KG3–KG7 N/A).

**PR5 candidate observation status (carried forward from S2 + S3):**

- **S2 candidate (1st recurrence)** — "design-spec-vs-implementation flag-coupling tension surfaces only when the design spec is implemented end-to-end" — **DID NOT recur in S4.** The new flag was added cleanly using the established posture (default OFF, UNSET in Vercel, independent of existing flags per design §5.6). Remains at 1st recurrence.
- **S3 candidate (1st recurrence)** — "design-spec wording at the route ('X first, Y second') admits conservative-vs-closes-silent-gap interpretations" — **DID NOT recur in S4.** The `/api/reason` redirect branch wording was unambiguous. Remains at 1st recurrence.

**One NEW PR5 candidate observation (1st recurrence) from THIS session:** "regression-check assumptions can be over-cautious when assertions are structural rather than text-exact — verify the existing test posture before assuming bulk test updates." Surfaced in CCP item (vi); turned out to be unnecessary at Step 5 (S2 + S3 RB-1f checks `length > 0`, not exact text). Logged as a candidate; promotion to PR5 entry awaits second recurrence in a future session.

## Next Session Should

**Open Option A build arc — session 5** (configuration-level invocation tests across L1–L7 flows — Critical or Elevated; AC4 extension from per-route to per-flow). Pre-conditions before opening:

1. Founder reviews this close + the decision-log entry `D-R20A-OPTIONA-S4-AUDIENCE-RENDERING-WIRED-2026-05-28` and confirms the disposition of the carried-forward Diagnostic-uncertain — pattern level signal on the Jest registry (recommendation: continue to acknowledge as pre-existing F-series stewardship; no session-5 blocker).
2. Founder confirms whether session 5 should also touch `/api/reason`'s metering posture under `SUBSTRATE_R20A_AUDIENCE_RENDERING_ENABLED=ON` (CCP-item-2(g) follow-up — out of scope today; revisit at pre-activation review).
3. The Cowork project-instructions panel remains paste-synced (no governance changes this session).

The next-session prompt for session 5 is **not drafted in this session** — drafted at session 5's open per the founder's preference (same posture as S2 + S3 + S4).

After session 5 Verified, the Option A build arc is complete. The C2 live run (rescoped per `D-R20A-ADR-ADOPTED-SEQUENCING-2026-05-27`) then verifies the new coverage end-to-end with **PR17 live walkthrough** (founder-performed TEST-env standup walked through interactively in-session, not handed off).

## Blocked On — single commit list (stage by name; do NOT `git add .`; never stage `website/.env.local*` or `website/tsconfig.tsbuildinfo`)

```bash
cd "/Users/clintonaitkenhead/Claude-work/PROJECTS/sagereasoning"
git add \
  website/src/lib/substrate/r20a-audience-renderer.ts \
  website/src/lib/substrate/layer3-service.ts \
  website/src/app/api/reason/route.ts \
  website/src/app/api/calling/response-builders.ts \
  website/src/app/api/practice/reflect/response-builders.ts \
  website/src/app/api/reason/__tests__/r20a-audience-rendering.test.ts \
  operations/decision-log.md \
  "operations/handoffs/founder/2026-05-28-OPTION-A-session-4-audience-rendering-close.md"
git commit -m "Option A build arc session 4: Layer-3 audience rendering + /api/reason agent-API fix Wired. New helper module website/src/lib/substrate/r20a-audience-renderer.ts is the single source of truth for the R20a redirect wire shape across both audiences (human_user / agent_developer). ConsumerContext.audience added (additive optional field). R20A_DEVELOPER_NOTE_DEFAULT formalised prose-mode key replaces both per-surface placeholders (CALLING_R20A_DEVELOPER_NOTE_PLACEHOLDER + REFLECT_R20A_DEVELOPER_NOTE_PLACEHOLDER retired); founder-approved wording at Step 2 via AskUserQuestion. /api/reason route.ts: r20aAudience derived from auth.user?.id (truthy=human_user; falsy=agent_developer); both redirect branches (route-guard ~line 626 + Branch 1.7 ~line 854) rewired to call the helper with effectiveAudience; agent_developer branch gated behind SUBSTRATE_R20A_AUDIENCE_RENDERING_ENABLED (default OFF; UNSET in Vercel; fallback to 'human_user' when unset preserves byte-identical pre-S4 behaviour for ALL caller types). Calling + Reflect distress-redirect builders refactored to thin wrappers over the helper; structural wire shape preserved; developer_note now formalised. AC4 invocation + functional testing via new tsx test at website/src/app/api/reason/__tests__/r20a-audience-rendering.test.ts: 66/66 PASS EXIT 0; S2 Calling regression 44/44 PASS (no updates needed); S3 Reflect regression 55/55 PASS (no updates needed); npx tsc --noEmit EXIT 0; total 165/165 assertions. Jest registry execution gated on pre-existing F-series Jest-config debt (AC12; carried forward from S2 + S3). AC5 perimeter unchanged at 10 routes; AC7 not engaged. Production UNCHANGED — SUBSTRATE_R20A_AUDIENCE_RENDERING_ENABLED UNSET in Vercel; SUBSTRATE_REFLECT_R20A_ENABLED + SUBSTRATE_CALLING_R20A_ENABLED + SUBSTRATE_R20A_GATE_ENABLED remain UNSET; /api/reason byte-identical to pre-S4. Finding 2 fix lives in code; activation deferred to a separate future Critical session. (D-R20A-OPTIONA-S4-AUDIENCE-RENDERING-WIRED-2026-05-28). Critical / code-critical; full CCP applied (eight approval items; wording founder-approved at Step 2)."
```

Then push via GitHub Desktop. **No Vercel behaviour change** — `SUBSTRATE_R20A_AUDIENCE_RENDERING_ENABLED` is a new flag; remains UNSET in Vercel. All three existing R20a flags remain UNSET. `/api/reason` byte-identical to pre-S4 for ALL caller types (the route's `effectiveAudience = flag ? r20aAudience : 'human_user'` fallback preserves the existing human-form wire shape when the flag is unset). The new code path is invisible to any traffic at session close.

**Production state at session close:** **UNCHANGED.** `SUBSTRATE_R20A_AUDIENCE_RENDERING_ENABLED` UNSET in Vercel (new flag); `SUBSTRATE_REFLECT_R20A_ENABLED` UNSET in Vercel (unchanged from S3); `SUBSTRATE_CALLING_R20A_ENABLED` UNSET in Vercel (unchanged from S2); `SUBSTRATE_R20A_GATE_ENABLED` UNSET in Vercel; `/api/reason` byte-identical for ALL caller types; `/api/substrate/layer3` → 503; provenance gate Live; A7 `overrideFlag` parameter additive (no production impact). Finding 2 bug on `/api/reason` agent-API path is preserved until a separate future Critical session activates the new flag.

## Open Questions

Carried from the decision-log entry:

- **A6 wording revision opportunities.** `R20A_DEVELOPER_NOTE_DEFAULT` is the formalised initial wording (founder-approved at Step 2). Revisable after the C2 live run or after operational data. Revisit: A6 follow-up session OR opportunistically when first agent-developer activates the new flag.
- **`r20a_suggested_user_message` formalisation.** Currently runtime-derived from `gateOutput.redirect_message` (the classifier's existing pass-through). A future A6 refinement could let prose-mode override (per design §7 Q2). Revisit: A6 follow-up.
- **Audience selector for plugin-internal calls.** §7 Q1 defers; default `'agent_developer'`. Revisit: Stage 3 plugin-tools work.
- **F-series Jest-config debt.** Pre-existing AC12 debt; carried forward from S2 + S3. Revisit: F-series stewardship session.
- **Cross-seam propagation end-to-end test (L1–L7 flows).** Session 5 work.
- **`SUBSTRATE_R20A_AUDIENCE_RENDERING_ENABLED` production activation.** Separate future Critical session. Until activation, Finding 2 bug on `/api/reason` agent-API is preserved (the fix lives in code).
- **R18 honest certification interaction with the new agent-developer wire shape.** Deferred per design §7. Revisit: R18 build session.
- **`/api/reason` agent-API metering posture under flag ON.** Existing Option-D loop-billing path preserved unchanged this session. Revisit: pre-activation review session.

## Founder Verification (Between Sessions)

**Confirm the new tsx test passes:**

```
cd "/Users/clintonaitkenhead/Claude-work/PROJECTS/sagereasoning/website"
npx tsx src/app/api/reason/__tests__/r20a-audience-rendering.test.ts
```

Expected last line: `66/66 pass | 0/66 fail`; EXIT 0. The `npm notice New major version of npm available...` lines printed in-session can be ignored (informational only). One `[stripe.ts] STRIPE_SECRET_KEY is not set...` line MAY appear (Stripe is imported transitively but never called by the test) — expected and harmless.

**Confirm the S2 Calling regression test still passes:**

```
cd "/Users/clintonaitkenhead/Claude-work/PROJECTS/sagereasoning/website"
npx tsx src/app/api/calling/__tests__/r20a-invocation.test.ts
```

Expected last line: `44/44 pass | 0/44 fail`; EXIT 0.

**Confirm the S3 Reflect regression test still passes:**

```
cd "/Users/clintonaitkenhead/Claude-work/PROJECTS/sagereasoning/website"
npx tsx src/app/api/practice/reflect/__tests__/r20a-invocation.test.ts
```

Expected last line: `55/55 pass | 0/55 fail`; EXIT 0.

**Confirm the whole-project type-check:**

```
cd "/Users/clintonaitkenhead/Claude-work/PROJECTS/sagereasoning/website"
npx tsc --noEmit
```

Expected: no output. EXIT 0.

**Confirm the decision-log entry exists:**

```
cd "/Users/clintonaitkenhead/Claude-work/PROJECTS/sagereasoning"
grep -n "D-R20A-OPTIONA-S4-AUDIENCE-RENDERING-WIRED-2026-05-28" operations/decision-log.md
```

Expected: a match near the end of the active log, after `D-R20A-OPTIONA-S3-REFLECT-WIRED-2026-05-28`.

**Confirm this close exists:**

```
ls "/Users/clintonaitkenhead/Claude-work/PROJECTS/sagereasoning/operations/handoffs/founder/2026-05-28-OPTION-A-session-4-audience-rendering-close.md"
```

Expected: the file exists.

**Confirm production is UNCHANGED** (no Vercel action required this session, but verify if you want):

- Vercel dashboard → Settings → Environment Variables:
  - `SUBSTRATE_R20A_AUDIENCE_RENDERING_ENABLED` should NOT exist (new flag, UNSET).
  - `SUBSTRATE_REFLECT_R20A_ENABLED` should NOT exist (unchanged from S3).
  - `SUBSTRATE_CALLING_R20A_ENABLED` should NOT exist (unchanged from S2).
  - `SUBSTRATE_R20A_GATE_ENABLED` should NOT exist (unchanged).
- `https://sagereasoning.com/api/substrate/layer3` → 503 (unchanged).
- `https://sagereasoning.com/api/public-key` → steady-state shape (Ed25519; `previous: null`; `rotation_overlap_until: null`) — unchanged.

**No live-system action required this session.** Production was not touched. PR17 NOT engaged (no founder-performed operational step between sessions).

## Orchestration Reminder

- The Cowork project-instructions panel stays paste-synced against `/adopted/project-instructions-snapshot.md` (PR1–PR17). No governance changes this session — no re-sync needed.
- Session 5 (configuration-level invocation tests across L1–L7 flows) opens against this session's Verified work + S2 + S3's Verified work — the audience contract is now proven end-to-end across all three R20a-emitting surfaces. After session 5 Verified, the Option A build arc completes; the C2 live run verifies the new coverage end-to-end under PR17 live walkthrough discipline.
- The new PR5 candidate observation from this session ("regression-check assumptions can be over-cautious when assertions are structural rather than text-exact") is logged for watchfulness in session 5 and beyond. If a session-5 regression check assumes literal byte-identical and turns out to be structural, the candidate promotes per PR5.
- The four M-7 finding rows (Calling-side gap, Reflect-content gap, audience-contract gap, propagation-flag gap) now ALL close from "documented gap" to "remediated via Option A" — Calling and Reflect-content closed at S2 + S3 respectively; audience-contract + Finding-2 close in this session. **M-7 severities + audit note transitions from "carry-forward backlog" to "ready for founder convenience review."**
- PR17 is engaged for the deferred C2 live run (post-Option-A); the live TEST-env standup will be walked through interactively when that session opens, not handed off.

## Cross-references

- Decision log: `D-R20A-OPTIONA-S4-AUDIENCE-RENDERING-WIRED-2026-05-28`
- Design spec (implemented this session): `/drafts/2026-05-28-r20a-single-catch-contract.md` §§3, 3.4, 3.5, 5.4, 5.6, 6, 7
- Parent ADR (Accepted): `/adopted/adr/2026-05-27-r20a-configuration-perimeter-and-audience-contract.md`
- Predecessor close (S3 — Reflect-content wiring): `/operations/handoffs/founder/2026-05-28-OPTION-A-session-3-reflect-wired-close.md`
- Predecessor close (S2 — Calling-side wiring; PR15 model): `/operations/handoffs/founder/2026-05-28-OPTION-A-session-2-calling-wired-close.md`
- Predecessor decision-log entries: `D-R20A-OPTIONA-S3-REFLECT-WIRED-2026-05-28`; `D-R20A-OPTIONA-S2-CALLING-WIRED-2026-05-28`; `D-R20A-SC1-SINGLE-CATCH-CONTRACT-DRAFTED-2026-05-28`; `D-R20A-ADR-ADOPTED-SEQUENCING-2026-05-27`; `D-R20A-CONFIG-PERIMETER-OPTION-A-2026-05-27`; `D-A7-R20A-GATE-SCAFFOLDED-VERIFIED-2026-05-13`
- A7 substrate gate (the seed primitive reused): `/website/src/lib/substrate/r20a-gate.ts` + `/operations/handoffs/founder/2026-05-13-A7-r20a-gate-close.md`
- New render helper (this session): `/website/src/lib/substrate/r20a-audience-renderer.ts`
- Layer 3 service (ConsumerContext.audience added this session): `/website/src/lib/substrate/layer3-service.ts`
- `/api/reason` route (audience derivation + both redirect branches rewired this session): `/website/src/app/api/reason/route.ts`
- Calling builder (refactored to thin wrapper this session): `/website/src/app/api/calling/response-builders.ts`
- Reflect builder (refactored to thin wrapper this session): `/website/src/app/api/practice/reflect/response-builders.ts`
- New tsx test (this session): `/website/src/app/api/reason/__tests__/r20a-audience-rendering.test.ts`
- Seam map: `/data-room/03_seam_map/seam-map.md`

*End of session close. Stabilised to a known-good state: the Layer-3 audience-rendering helper is Wired + Verified at the substantive level (Diagnostic-certain on 165/165 assertions + tsc EXIT 0). `R20A_DEVELOPER_NOTE_DEFAULT` formalised prose-mode key replaces both retired per-surface placeholders (Calling + Reflect); founder-approved wording. `ConsumerContext.audience` additive scaffold. `/api/reason` two redirect branches rewired (code-Wired) behind `SUBSTRATE_R20A_AUDIENCE_RENDERING_ENABLED` (default OFF; UNSET in Vercel) — the Finding 2 fix lives in code; the bug is preserved until a future Critical activation session. Calling + Reflect distress-redirect builders refactored to thin wrappers over the helper — single source of truth for the agent-developer wire shape across all three R20a-emitting surfaces; structural wire shape preserved (S2 + S3 regression tests pass unchanged because their developer_note assertions check length, not text); developer_note now formalised. AC5 perimeter unchanged at 10 routes. Production UNCHANGED. The audience contract is now proven end-to-end across `/api/reason`, `/api/calling`, `/api/practice/reflect` — three non-substrate consumers (with Calling + Reflect carrying their own substrate-gate flags + `/api/reason` carrying the new audience-rendering flag; four independent activations per design §5.6). Session 5 (configuration-level invocation tests across L1–L7 flows) opens against this proven contract; closes the Option A build arc when Verified; the C2 live run verifies end-to-end under PR17 live walkthrough. The next-session prompt is drafted at session 5's open.*
