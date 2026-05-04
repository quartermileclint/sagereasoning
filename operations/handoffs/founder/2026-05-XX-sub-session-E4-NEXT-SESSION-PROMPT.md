# Next-Session Prompt — Sub-session E4: /api/score-social standard-depth wiring (Group A second consumer)

**Stream:** founder.
**Tier:** code-elevated.
**Governing frame:** `/adopted/standing-protocol-cache.md` (full governance via the cache; deliverable-of-the-day named below).
**Predecessor session close:** `/operations/handoffs/founder/2026-05-04-sub-session-E3-close.md`.
**Predecessor decision-log entries:** `D-CONSUMER-WIRING-LIFT-2026-05-04`; `D-SCORE-RAG-WIRED-2026-05-04`; `D-REASON-RAG-WIRED-2026-05-04`; `D-INTERNAL-RETRIEVE-ROUTE-VERIFIED-2026-05-04`.
**Risk classification:** Elevated under 0d-ii (changes to existing user-facing functionality). Critical Change Protocol NOT engaged.

## Why this session matters

After E3, four consumers are wired with D6/D7 retrieval at Layer 1: Candidate C internal route + `/api/reason` quick-depth + `/api/score` standard-depth + `/api/score-conversation` deep-depth. The shared substrate (`/lib/rag/helpers.ts` + `/lib/rag/load-layer1-with-fallback.ts`) is in place. E4 wires Group A's second consumer — `/api/score-social` at standard depth — using the shared substrate. This is the lightest-touch wiring in the rollout: no refactor, no new pattern dimension; copy the wiring shape from `/api/score-conversation`, extend the harness with a Phase F call.

After E4, both Group A consumers are wired. E5 + E6 then introduce Group B (Pattern A1 — manual `client.messages.create` injection bypassing the engine) with an ADR-001 amendment.

## Pre-conditions

1. Founder pushed Sub-session E3's ten artefacts via GitHub Desktop. Working tree clean at session open. Vercel green confirmation post-push.
2. Founder ran the E3 harness independently and confirmed `SUMMARY: 59 / 59 checks passed`. (Verifies the E3 helper-lift refactor introduced no regression before adding E4 consumer to the shared substrate.)
3. Founder availability for ~1.5–2.5 hours.

## Part A — Open under the protocol

Read in order:

1. `/adopted/standing-protocol-cache.md` (~3 min — confirms tier, model selection, risk class, signals; `code-elevated` row engages).
2. `/operations/handoffs/founder/2026-05-04-sub-session-E3-close.md` (~5 min — predecessor close).
3. `/operations/decision-log.md` last entry (`D-CONSUMER-WIRING-LIFT-2026-05-04`) — read the "Files touched" + "Open questions" sections in full.
4. `/website/src/app/api/score-conversation/route.ts` — re-read in full. The wiring shape this session copies.
5. `/website/src/lib/rag/load-layer1-with-fallback.ts` — re-read; the shared wrapper E4 imports.
6. `/website/src/app/api/score-social/route.ts` — read in full to understand the existing context-loading shape being replaced.
7. `/website/scripts/verify-reason-rag.ts` — re-read the V2 `runConsumerWiringPhase` helper and the existing Phase E call site (Phase F is one similar call).
8. `/adopted/adr/2026-05-04-d6-d7-consumer-wiring.md` — ADR-001. Re-read §"Wiring shape" + §"AC-12 narrowness preservation" only.

Confirm at session open per cache:
- **Tier:** code-elevated.
- **Hold-point:** P0 0h still active.
- **Model selection (PR4):** confirm against the cache table — `/api/score-social` runs at standard depth; per the table, standard = Sonnet. Verify the existing route uses `MODEL_DEEP` or `MODEL_FAST` and document any pre-existing exception (likely none for `score-social`, but check).
- **Status vocabulary targets:** end-of-session — `/api/score-social` standard-depth wiring reaches **Wired** then **Verified** (founder runs the harness — extended with Phase F); harness Phase F → **Wired** pre-run, **Verified** on harness pass; Phase-2 pass-1 inventory adds an "E4 consumer" item.
- **KGs engaged at minimum:** KG1 rule 4 (per-request `Map` cache) + KG6 (composition order — engine handles placement per Pattern A2; not a new KG6 surface).

## Part B — Procedure

### Step 1 — Confirm consumer + path-not-pause

Founder confirms (at session open):
- E4 = `/api/score-social` standard depth (per E3's open question #4 default).
- Continuing the rollout to E5 + E6 after this session (Group B with ADR-001 amendment).
- Or override: pause / pick a different consumer / etc.

Default plan: proceed with `/api/score-social`.

### Step 2 — Wire `/api/score-social`

Implement per the established Pattern A2 shape (copy from `/api/score-conversation/route.ts`):

1. Add imports: `type RetrieveResult` from `@/lib/rag`; `loadLayer1WithFallback` from `@/lib/rag/load-layer1-with-fallback`.
2. Remove direct `getStoicBrainContext` import if unused after the change (the shared wrapper consumes it on the fallback path).
3. Inside POST: declare `const ragCache = new Map<string, RetrieveResult>()` (KG1 rule 4 — never module-level).
4. Extend the existing `Promise.all` with `loadLayer1WithFallback(<input>, 'standard', ragCache, '/api/score-social')`.
5. Replace `stoicBrainContext: getStoicBrainContext('standard')` in the `runSageReason` call with `...layer1` spread.
6. Update the route's header comment with E4 wiring documentation referencing ADR-001 + this session's decision-log entry.
7. Compile check: `npx tsc --noEmit -p .` (must be clean).

Risk: Elevated. If the wiring touches anything beyond the Layer 1 swap (e.g., a route-specific custom prompt or auth pattern), reclassify and revisit.

### Step 3 — Extend the harness with Phase F

In `/website/scripts/verify-reason-rag.ts`, add one new `runConsumerWiringPhase` call after Phase E:

```typescript
const phaseF = await runConsumerWiringPhase(
  {
    label: 'F',
    depth: 'standard',
    consumerDescription: '/api/score-social standard-depth wiring (E4)',
    ceilingChars: 12000,
  },
  deps,
)
totalChecks += phaseF.totalChecks
passedChecks += phaseF.passedChecks
```

Update the harness header comment (E4 Phase F line + cross-reference to `/api/score-social/route.ts`).

Total expected checks after E4: **75** (E3 was 59; Phase F adds 16 — same shape as E2's Phase D).

### Step 4 — Founder-performable verification

Founder runs from Mac Terminal:

```
cd "/Users/clintonaitkenhead/Claude-work/PROJECTS/sagereasoning/website" && npx -y tsx scripts/verify-reason-rag.ts 2>&1 | tee ../operations/migrations/2026-05-04-verify-reason-rag-output-E4.log
```

Expected: `SUMMARY: 75 / 75 checks passed` followed by `ALL CHECKS PASSED`.

### Step 5 — Append decision-log entry

Pattern: per `/adopted/standing-protocol-cache.md` §"Lean decision-log entry". Cross-reference E3's entry (substrate origin) + ADR-001.

Entry name: `D-SCORE-SOCIAL-RAG-WIRED-2026-05-04` (or similar — pick at session close).

### Step 6 — Session close

Pattern: per `/adopted/standing-protocol-cache.md` §"Lean session close". Updates Phase-2 pass-1 readiness inventory with "E4 consumer wired (`/api/score-social` Group A second member)".

### Step 7 — Next-session prompt

E5 — `/api/score-document` deep-depth via Pattern A1 (manual injection). The session opens with the AI proposing the ADR-001 amendment introducing Pattern A1 — direct passage-block injection into the route's own system message array, bypassing the engine. Founder approves the amendment before wiring proceeds.

## Part C — Anticipated session shape

| Phase | Estimate |
|---|---|
| Cache + predecessor close + `/api/score-social` source read | 15–25 min |
| Step 1 — path confirmation | 5 min |
| Step 2 — wiring (light copy-paste from `/api/score-conversation`) | 25–40 min |
| Step 3 — harness Phase F (one new function call + comment update) | 10–15 min |
| Step 4 — founder-performable verification | 20–40 min |
| Steps 5–7 (decision-log + close + next-session prompt) | 25–40 min |
| **Total** | **~1.5–2.5 hours** |

## Rollback path

`git revert` of the wiring commit removes (1) `/api/score-social`'s D6/D7 call site (restoring the prior `getStoicBrainContext('standard')` call), and (2) the harness Phase F. Engine signature unchanged. Shared substrate untouched. The `loadLayer1WithFallback` try/catch fallback inside the shared module means runtime retrieval failures don't break user-facing responses — they fall back to compiled-string Layer 1 silently.

## Forecast

**On clean completion:** five consumers Verified. Both Group A consumers (`/api/score-conversation` + `/api/score-social`) wired with Pattern A2. Phase-2 pass-1 readiness inventory records the second Group A consumer + the standard-depth Pattern A2 second-consumer evidence (matching E2's `/api/score`).

**Next-next session:** E5 — `/api/score-document` deep-depth via Pattern A1 (manual injection). ADR-001 amendment proposed at session open; founder approves before wiring. New design dimension introduced with documentation discipline.

End of prompt.
