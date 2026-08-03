# Session Close — 2026-08-03 — Stoa ST4: the agent surface + R18 staging (dark)

**Stream:** founder.
**Governing frame:** /adopted/standing-protocol-cache.md; the Stoa build plan §2 (all thirty) + §3 ST4/ST5 + §4; the binding verbatim record (Q6(b)/Q7/Q13(a)/§5-item-ii).
**Tier:** `code-elevated` (dark throughout — `SUBSTRATE_STOA_ENABLED` UNSET everywhere; the R18 public-surface changes are STAGED ONLY, not applied). **Date:** 2026-08-03. **Model:** Sonnet 5 (`claude-sonnet-5`) — zero LLM calls in the built surface (deterministic auth + presentation only).
**Honesty notes:** the Gate-1/Gate-2 hooks ran intermittently framed this session — several at-action consults 401'd/timed-out fail-open-honest (the known transient class), but several genuine frames also landed and were engaged, including one open-loop re-examination (the browse-route scope edit) that closed cleanly on re-examination at the same depth.

## What happened

The Stoa is now reachable by credentialed agents, dark. Two new arms share one UPC `consult` capability (the §5-item-ii election — no schema/mint change this session): a **presence** check on `GET /api/stoa/entries` (dual transport, no metering, never a gate — elevates browse scope to community exactly like a human JWT does) and a **declare** identity floor on the new `POST/GET/PATCH/DELETE /api/stoa/declare` (Bearer-only, owner-bound credential required per #13, agent_id taken exclusively from the credential's own binding — never a request body). The declare route is a deliberate R20a exclusion (agent-authored text over a credential-authenticated call, not human free text — the standing exclusion the guard registry already names for agent-facing endpoints), recorded by extending that registry's comment (no array change). Agent entries in the served view now carry `trust_record_url`/`accreditation_url` (#19 — static links, no live probe, the target endpoints' own honest-absence design does the rest). The machine-readable R18 contract (llms.txt section, an `agent-card.json` extension, an api-docs bullet) is **staged, not applied** — `operations/connective-layer-2026-08/st4-r18-docs-staged.md` — awaiting founder sign-off at ST5, per the standing R18 discipline.

**PR19 (three parallel independent reviewers — the disclosed Workflow-equivalent):** 2 MEDIUM findings, both resolved; everything else independently confirmed clean by first-hand code tracing, not re-assertion. The first MEDIUM was a real fidelity slip in the staged doc — the first draft blended `STOA_ETHIC`'s verbatim quotation with newly-authored prose, dropping the constant's closing sentence in the process (the exact class of drift ST3's I.1 fold was built to catch, this time in a not-yet-live document no battery watches) — fixed by isolating the verbatim quote in its own blockquote and clearly labelling the added material as new. The second MEDIUM is a disclosed, not fixed, limitation: the new `stoa-credential.test.ts` battery (19/0) drives an injectable validator seam throughout, never the real `validatePracticeCredential` — an integration-level mismatch between the two modules would not be caught by this session's tests. Recorded as ST5's job (a live-DB smoke), consistent with the discernment route's own precedent of unit-testing the pure seam and smoke-testing the real one. Full disposition: `D-STOA-ST4-AGENT-SURFACE-BUILT-DARK-2026-08-03`.

## Decisions Made
- `D-STOA-ST4-AGENT-SURFACE-BUILT-DARK-2026-08-03` appended (both elections + the full PR19 disposition).

## Status Changes
| Item | Old | New |
|---|---|---|
| ST4 (agent surface) | Scoped | **Verified (build-level; boundary 86/0 · stoa-credential 19/0 · store 65/0 unchanged · guard 102/0 unchanged · tsc 0 · build ✓ · PR19 folded) — dark, awaiting ST5** |
| R20a perimeter | 12 route-level + 2 substrate-gate = 14 | **Unchanged** — the declare route is a recorded exclusion, not an addition |
| R18 public surfaces | unaware of the Stoa | **Staged, not applied** (`st4-r18-docs-staged.md` — llms.txt section, `agent-card.json` ext #21, api-docs bullet) |

## Verification Method Used
The credential-auth decision logic is battery-tested via an injectable-validator seam (mirroring the discernment route's `DiscernmentRouteDeps` pattern) covering the full failure taxonomy (no_token/invalid_token/no_owner/no_agent) and transport narrowing (Bearer-only on declare, dual-transport on presence), with non-vacuity pins (a varied credential row produces a varied identity — not hardcoded). The structural-separation battery's exact allowlist + forbidden-keyword scan were extended and re-confirmed non-vacuous against the two new files specifically (traced by an independent reviewer via a hypothetical-forbidden-import scenario, not merely re-run). The #19 link mechanism's honest-absence claim was verified against the actual target endpoint's handler code, not the comment asserting it. Flag-off byte-identity holds structurally (every new/modified handler 503s or returns unmodified public/community scope before any new code path runs when the flag is unset — no separate byte-identity battery needed since the credential-presence arm's own early-return-to-null design makes it inert without a credential, and it's the credential that's absent in every flag-off/no-credential caller).

## Risk Classification Record
Elevated per 0d-ii — new agent-facing routes, dark; no auth-path change (the UPC chokepoint is consumed via its existing exported function, never modified); no schema/flag/mint this session. AC7 NOT engaged. Rollback: `git revert` the session commit — every route stays flag-gated dark (the flag itself is unchanged, so nothing needs unsetting); the staged R18 file is repo-only.

## Blocked On
**Production state at session close (PR18, as of 2026-08-03):** production is **byte-equivalent on push except inert additions** — the new/modified routes register but 503/return unmodified scope (`SUBSTRATE_STOA_ENABLED` UNSET everywhere; no credential can reach the presence/declare code paths' new branches from an unauthenticated caller). `stoa_entries` remains applied-inert on TEST + PROD (ST2, unchanged). No flag, schema, credential, or deploy action was taken this session.

**Files remaining uncommitted (this session's — stage ONLY these; the tree carries other sessions' strays, untouched):** see the Founder Verification block.

## Open Questions
- Carried unchanged from ST3: the row-level reactivation guard (recency-cycling residual, potentially a mentor question); the anonymous-sign-ins-OFF check; the q-filter pagination bound.
- New for ST5: re-diff the staged R18 doc's `STOA_ETHIC` quote against the live constant, and re-count `agent-card.json`'s extensions (currently 20; the staged doc assumes it lands as #21) — both could drift if another session lands between ST4 and ST5.
- The live-DB integration smoke for `stoa-credential.ts` (named in the PR19 disposition as ST5's job, not built this session).

## Next Session Should
Run ST5 — the founder-walked `code-critical` 0c-ii activation walk: push → Vercel green → `SUBSTRATE_STOA_ENABLED=true` → the full smoke matrix (visibility scopes incl. the credential-presence arm; a throwaway owner-bound agent credential's full declare→tend→withdraw cycle; the R20a exclusion holding live) → apply the staged R18 docs after re-verifying the two drift risks above → rollback line confirmed. See `operations/handoffs/founder/2026-08-03-stoa-ST5-activation-NEXT-SESSION-PROMPT.md`.

## Founder Verification

```bash
cd "/Users/clintonaitkenhead/Claude-work/PROJECTS/sagereasoning/website"
npx tsx src/lib/stoa/__tests__/stoa-boundary.test.ts
npx tsx src/lib/stoa/__tests__/stoa-credential.test.ts
npx tsx src/lib/stoa/__tests__/stoa-store.test.ts
npx tsx src/app/api/mentor/stoa/__tests__/r20a-invocation.test.ts
npx tsx src/lib/__tests__/r20a-invocation-guard.test.ts
npx tsc --noEmit && npm run build
```
Expected: 86/0 · 19/0 · 65/0 · 42/0 · 102/0 · tsc silent · ✓ Compiled successfully.

**Files to stage (this session only):**
```
git add website/src/lib/stoa/stoa-credential.ts
git add website/src/app/api/stoa/declare/route.ts
git add website/src/lib/stoa/__tests__/stoa-credential.test.ts
git add website/src/lib/stoa/stoa-presentation.ts
git add website/src/app/api/stoa/entries/route.ts
git add website/src/lib/stoa/__tests__/stoa-boundary.test.ts
git add website/src/lib/__tests__/r20a-invocation-guard.test.ts
git add operations/connective-layer-2026-08/st4-r18-docs-staged.md
git add operations/connective-layer-2026-08/2026-08-02-stoa-build-plan.md
git add operations/decision-log.md
git add operations/handoffs/founder/2026-08-03-stoa-ST4-agent-surface-CLOSE.md
git add operations/handoffs/founder/2026-08-03-stoa-ST5-activation-NEXT-SESSION-PROMPT.md
```
Do NOT `git add -A` — the tree carries other sessions' unrelated strays (brand assets, an SDK lockfile, a superseded docx).
