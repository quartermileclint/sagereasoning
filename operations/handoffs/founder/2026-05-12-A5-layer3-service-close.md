# Session Close — 2026-05-12 — A5 Layer 3 Server-Side Substrate Service

**Stream:** founder.
**Governing frame:** `/adopted/standing-protocol-cache.md` + `/adopted/build-sessions-protocol-cache.md` + the amended staging plan + the amended manifest + the project-instructions snapshot.
**Tier:** code-critical — **Critical** risk under 0d-ii. PR6 + AC4 + AC5 + AC7 + AC8 + AC9 + AC10 + AC11 all engaged. **Full** templates per the standing cache §"Critical-risk sessions".
**Date:** 2026-05-12.
**Predecessor close:** `/operations/handoffs/founder/2026-05-12-adoption-session-close.md` (ST2 amendments adoption; stress-test arc CLOSED).
**Operative session prompt:** the A5 next-session prompt drafted at adoption-session close (in chat).

---

## Decisions Made

- `D-A5-LAYER3-SCAFFOLDED-VERIFIED-2026-05-12` appended (+~70 lines). Stage 1 item A5 (Layer 3 server-side substrate service) reaches Scaffolded + Wired + Verified on the `/api/reason` PR1 single-endpoint proof. Three founder session-open elections committed: (1a) new API route + new library module; (2a) defensive read of future fields for A5.4 R20a; (3a) prose_mode parameter plumbing only. Two new PR5 knowledge-gap candidates logged (two-entry-point substrate pattern; defensive-read-of-future-fields pattern). PR15 bespoke election justified (no existing Anthropic primitive delivers per-consumer deterministic injection). PR16 positioning + dogfood lens applied (Character Kernel strengthened; substrate-consultable via /api/reason).

## Status Changes

| Item | Old | New |
|---|---|---|
| Stage 1 A5 (Layer 3 server-side service) | Scoped | **Verified** (on /api/reason PR1 proof) |
| `/website/src/lib/substrate/layer3-service.ts` | did not exist | NEW (~600 lines; A5.1-A5.8 components + two entry points + forward-looking types) |
| `/website/src/app/api/substrate/layer3/route.ts` | did not exist | NEW (~125 lines; flag-gated 503 today; ready for A10 auth wiring) |
| `/website/src/lib/substrate/__tests__/layer3-service.test.ts` | did not exist | NEW (~230 lines; 28 functional tests, all PASS) |
| `/website/src/lib/translation-sandwich/parallel-run.ts` | A4-Verified state | MODIFIED (imports + SandwichRunResult field + flag-gated A5 call site + composed-output surfacing) |
| `SUBSTRATE_LAYER3_ENABLED` env var (Vercel) | did not exist | UNSET (default OFF — no production behaviour change at session close) |
| Substrate production | A4 Verified; `/api/public-key` steady state | **unchanged** — A5 wired in code, flag UNSET, behaviour byte-identical |

## Next Session Should

The build arc proceeds under the amended staging plan. Two candidate next-sessions per the indicative session-9 packaging in the amended plan:

- **Option A — A7 server-side R20a gate scaffolding.** Continues the critical chain. A7 is the second-layer R20a defence (guards Layer 2 API; populates `assessment.distress_signal` for A5.4 to consume). Critical-risk (R20a perimeter + PR6 + AC5). When A7 reaches Verified, A5.4 activates from structurally-complete-but-inert to operationally-active. ~3-4 hours. Recommended if maintaining critical-chain momentum is the priority.
- **Option B — A6 prose_mode per-mode templates.** Closes the A5.5 parameter-plumbing-only scope by filling in clinical / terse / standard / educational templates. Standard-risk (per staging plan); does not unblock A5.4 activation but does unblock K-category migration consumers needing mode-specific prose. ~2-3 hours. Recommended if K-category migration prep is the priority.

**Founder elects at next session-open.** Both options are valid under the amended plan; A7 and A6 are independent. A combined A7 + A6 session is feasible but would push past the bounded-session preference.

**Pre-conditions for either next session:**

1. This session's work committed to origin/main (commit command in §"Founder Verification" below).
2. Founder runs the production-state verification probes between sessions to confirm A5 substrate steady state preserved.
3. Founder paste-syncs `/adopted/project-instructions-snapshot.md` content into the Cowork project-instructions panel if changed since last paste-sync (no PI changes this session, so likely unchanged).

**Next-session prompt:** to be drafted at the start of the next session. Standing protocol cache + build-sessions cache + this close + the A5 decision-log entry are sufficient session-opening references.

## Blocked On

**Files uncommitted (to be committed by founder before next session):**

```
?? website/src/lib/substrate/layer3-service.ts
?? website/src/app/api/substrate/layer3/route.ts
?? website/src/lib/substrate/__tests__/layer3-service.test.ts
M  website/src/lib/translation-sandwich/parallel-run.ts
M  operations/decision-log.md
?? operations/handoffs/founder/2026-05-12-A5-layer3-service-close.md
```

**Production state at session close:** unchanged from session start (and from adoption-session close). Substrate at A4 Verified. `/api/public-key` serves steady-state shape (`previous: null`; `rotation_overlap_until: null`; `algorithm: Ed25519`). `SUBSTRATE_LAYER3_ENABLED` env var UNSET. `/api/reason` behaviour byte-identical to pre-A5. `/api/substrate/layer3` returns 503 (flag unset). All four `SUBSTRATE_LAYER2_PREVIOUS_*` env vars UNSET. Vercel state: unchanged. No env-var changes; no schema migrations; no auth-surface changes on production traffic; no R20a perimeter changes.

## Open Questions

**New open questions surfaced this session:**

1. **A5.4 production activation timing.** A5.4 R20a distress pass-through injection is structurally complete but functionally inert today (all three signal sources absent on Layer2Assessment). Activation requires either A7 wiring `assessment.distress_signal` OR AC9 producer (layer2-decision-mapping.ts) setting `decision='ESCALATE'`. Revisit condition: A7 sub-stage kickoff OR AC9 implementation.

2. **A6 timing.** Whether A6 (prose_mode per-mode templates) folds into the next session alongside A7 or runs separately. Revisit condition: next session-open; founder elects.

3. **Cost capture posture when flag flipped ON.** Today's wire-in preserves cost capture via the existing `generateProse` call site in parallel-run.ts. When future consumers use `generateLayer3Response` directly (the full service entry point), cost capture must be via AC11 span emission rather than the existing per-call cost field. Flagged for the A12 session.

4. **`/api/substrate/layer3` auth posture finalisation.** Today the route returns 503 when flag unset. When flag flips ON at Stage 3, auth must use A10 per-agent credentials. Revisit condition: A10 sub-stage kickoff (must complete before flag flips ON in production).

5. **Component-registry update batching.** Per the A4 close note's open question, A1-A4 surfaces are due for a batch capability-matrix update at a routine governance session. A5 joins that batch. Revisit condition: routine governance session post-A5.

**Carry-forward open questions from predecessor sessions (still open):**

All twelve carry-forward open questions from the adoption-session close remain open. None closed in this session.

## Verification Method Used (per 0c framework)

| Work type | Verification method |
|---|---|
| TypeScript module + new API route (code-critical) | AI in-session clean `tsc --noEmit -p tsconfig.json` pass + AI grep invocation-pattern verification (12-occurrence check across six injection helpers + applyLayer3Injections + isSubstrateLayer3Enabled). Founder re-runs same commands between sessions. |
| Functional tests (28-of-28 PASS) | AI in-session `npx tsx` execution with PASS/FAIL output line per test. Founder re-runs same command between sessions. |
| Production-state probe (`/api/public-key` + `/api/substrate/layer3`) | Founder runs curl probes between sessions; sandbox HTTP 403 precludes in-session probes (documented A4 limitation). |
| Decision-log entry (Critical full-form) | Founder reads directly. |
| Manifest / governance | No manifest amendment this session; the existing R3/R17/R18a/R18e/R19/R20a/AC1-AC11 rules govern A5's behaviour. Founder reads decision-log entry to confirm coverage. |

## Risk Classification Record (0d-ii)

| Change | Classification | Reason |
|---|---|---|
| New A5 library module + API route | **Critical** | PR6 (R20a deterministic injection is safety-critical third-layer defence); AC8 (new substrate directory alongside translation-sandwich); CCP completed in full. |
| Modification to parallel-run.ts (flag-gated wire-in) | **Critical** | Same surface as above; A5 call site introduced into the `/api/reason` execution path. |
| New test file (no production touch) | Standard | Test code does not deploy to production runtime; pre-runtime validation only. |
| Component-registry entry | N/A this session | Deferred to routine governance batch with A1-A4 entries. |

All Critical changes covered by the single CCP writeup in the decision-log entry. Founder approval received at the Step 5 gate specific to the three named risks before commit.

## PR5 Knowledge-Gap Carry-Forward

**KG references applied this session (no re-explanation needed; rules honoured):**

- **KG1 (Vercel five rules)** — applied: env-var read per-call (not module-load) in `isSubstrateLayer3Enabled()`; no DB writes from A5; pure synchronous code in injection path. Cumulative recurrence count: no new entry.
- **AC1 (model selection — Sonnet for Layer 3 translation)** — applied per cache Element 6. Confirmed at session-open; honoured in implementation.

**New PR5 candidates logged (first observation this session):**

1. **Two-entry-point pattern for substrate services migrating existing consumers** — A5 exposes both `applyLayer3Injections` (wrapper, for existing consumers like /api/reason that already call generateProse) and `generateLayer3Response` (full service, for new consumers like future plugin-originated traffic). This sidesteps the double-LLM-call risk that a single-entry-point design would create. Logged in `/operations/knowledge-gaps.md` as Candidate observed once. Promotion criterion: if this pattern recurs at A7 (which migrates existing R20a perimeter consumers) or at another future substrate service, promote to KG entry per PR5 promotion rules.

2. **Defensive-read-of-future-fields pattern for substrate services depending on not-yet-implemented producers** — A5 reads `assessment.decision` (AC9 producer lands at Stage 1 close or Stage 3), `assessment.distress_signal` (A7 producer), `assessment.provenance`/`use_policies` (AC10 producer lands at A12 + Stage 3) defensively. The structural skeleton is complete; functional activation arrives with each producer. Logged as Candidate observed once. Promotion criterion: if this pattern recurs at A7 (reading A10 credential fields), A12 (reading A13 cost fields), or another substrate-dependency relationship, promote to KG entry.

**No KG promotion this session.** Both candidates are first observations; per PR5, third recurrence (or pre-population from a structured extraction pass) is required for permanent KG status.

## Founder Verification (Between Sessions)

```bash
cd "/Users/clintonaitkenhead/Claude-work/PROJECTS/sagereasoning"

# 1. TypeScript compile
cd website && npx tsc --noEmit -p tsconfig.json && cd ..
# Expected: no errors; clean exit.

# 2. Functional tests (expected: 28 pass / 0 fail)
cd website && npx tsx src/lib/substrate/__tests__/layer3-service.test.ts && cd ..
# Expected output ends with: "28 pass / 0 fail"

# 3. Invocation tests
grep -cn "injectR3Disclaimer\|injectR19Limitations\|injectR19MirrorPrinciple\|injectR20aDistressPassthrough\|injectR18aCategory\|injectR18eTransparencyNotice" website/src/lib/substrate/layer3-service.ts
# Expected: 12 (six function definitions + six call sites inside applyLayer3Injections)

grep -cn "applyLayer3Injections" website/src/lib/translation-sandwich/parallel-run.ts
# Expected: >= 2 (import + call site)

grep -cn "isSubstrateLayer3Enabled" website/src/lib/translation-sandwich/parallel-run.ts
# Expected: >= 2 (import + call site)

# 4. Confirm /api/substrate/layer3 returns 503 in production (flag unset by default)
curl -sS -o /dev/null -w "%{http_code}\n" -X POST https://www.sagereasoning.com/api/substrate/layer3 \
  -H "Content-Type: application/json" -d '{}'
# Expected: 503

# 5. Confirm /api/reason behaviour byte-identical (substrate steady state)
curl -sS https://www.sagereasoning.com/api/public-key | python3 -c "
import json, sys
d = json.load(sys.stdin)
ok = d.get('previous') is None and d.get('rotation_overlap_until') is None and d.get('algorithm') == 'Ed25519'
print('PASS — substrate steady state preserved (key_id={})'.format(d['key_id']) if ok else 'FAIL — state regression')
"
# Expected: PASS line
```

If any check fails, A5 has regressed; engage Path A rollback (unset `SUBSTRATE_LAYER3_ENABLED` in Vercel + redeploy) and report at next session open.

**Session-close commit:**

```bash
cd "/Users/clintonaitkenhead/Claude-work/PROJECTS/sagereasoning"
git add -A
git commit -m "Stage 1 A5 scaffolded + wired + verified: Layer 3 substrate service

A5 reaches Verified on /api/reason PR1 single-endpoint proof.

New files:
- website/src/lib/substrate/layer3-service.ts (~600 lines).
  A5.1-A5.8 components: two entry points (applyLayer3Injections wrapper +
  generateLayer3Response full service); six deterministic injection helpers
  (R3 + R19c + R19d + R20a + R18a + R18e); ProseMode enum; Layer2Decision +
  Provenance + UsePolicy forward-looking types; AC11 span emission stub;
  SUBSTRATE_LAYER3_ENABLED flag reader.
- website/src/app/api/substrate/layer3/route.ts (~125 lines).
  Substrate-API endpoint for future plugin-originated traffic; flag-gated
  to 503 today; ready for A10 auth wiring at Stage 3.
- website/src/lib/substrate/__tests__/layer3-service.test.ts (~230 lines).
  28 functional tests covering FT-1..FT-12, AC9 projection, AC10 projection,
  AC11 span emission, INV invariants. All 28 PASS.

Modified:
- website/src/lib/translation-sandwich/parallel-run.ts: imports +
  SandwichRunResult.substrate_layer3_response field + flag-gated
  applyLayer3Injections call site + composed-output surfacing.

Production state at commit: unchanged. SUBSTRATE_LAYER3_ENABLED env var
UNSET in Vercel (default). /api/reason behaviour byte-identical to pre-A5.
/api/substrate/layer3 returns 503. Substrate continues at A4 Verified;
all SUBSTRATE_LAYER2_PREVIOUS_* env vars UNSET; /api/public-key
steady-state shape preserved.

Three founder session-open elections committed:
- Choice 1(a) new API route + new library module
- Choice 2(a) defensive read of future fields for A5.4 R20a
- Choice 3(a) prose_mode parameter plumbing only (A6 fills templates)

Verification:
- 28-of-28 functional tests PASS (npx tsx).
- TypeScript clean compile (tsc --noEmit).
- 12-occurrence invocation grep across six injection helpers.
- applyLayer3Injections + isSubstrateLayer3Enabled wired in parallel-run.ts.

Decision-log entries appended:
- D-A5-LAYER3-SCAFFOLDED-VERIFIED-2026-05-12

Next session: A7 (R20a gate scaffolding) or A6 (prose_mode templates) per
founder election at next session-open. A5.4 activation pending A7 wire
OR AC9 implementation."
```

Then push via GitHub Desktop. This commit touches `/website/src/` (Vercel will redeploy) and `/operations/` (governance only — no Vercel impact). Vercel redeploy expected: A5 files now in the deployed bundle; the new `/api/substrate/layer3` route exists but returns 503 because the flag is unset; `/api/reason` behaviour byte-identical to pre-commit because the flag is unset; no env-var changes; no DB schema changes.

## Orchestration Reminder

This is a Critical-tier session. The standing protocol cache §"Critical-risk sessions" requires the full template form. This close uses the full form (Verification Method Used; Risk Classification Record; PR5 Knowledge-Gap Carry-Forward; Founder Verification; Orchestration Reminder — all present). The lean form is NOT used for this session.

Per AC12 (Sub-Agent Verification Option for Critical-Tier Work) — this session did NOT spawn a verifier sub-agent. Founder verification is in-session via the AI's own grep + tsx + tsc invocations (per the Verification Method Used table above) plus between-session re-runs by the founder. If between-session verification surfaces any discrepancy, engage Path A rollback (~30s flag flip).

Per PR16 — at each design decision in this session, positioning + dogfood lens was applied. A5 strengthens Character Kernel positioning by carrying R18a category language deterministically; substrate is dogfood-consultable via /api/reason (every Layer 3 invocation is a substrate consultation of its own output discipline, and the substrate's principled output discipline is what A5 enforces).

## Cross-references

- Operative session prompt (in chat; not a separate file this session).
- Predecessor close: `/operations/handoffs/founder/2026-05-12-adoption-session-close.md`
- Predecessor decision-log entries: `D-A4-KEY-MANAGEMENT-WIRED-VERIFIED-2026-05-10`; `D-STAGING-PLAN-AMENDED-FROM-ST2-2026-05-12`; `D-MANIFEST-AMENDED-FROM-ST2-2026-05-12`; `D-PROJECT-INSTRUCTIONS-AMENDED-FROM-ST2-2026-05-12`; `D-CACHE-DRIFT-RESOLVED-2026-05-12`.
- This session's decision-log entry: `D-A5-LAYER3-SCAFFOLDED-VERIFIED-2026-05-12`.
- Adopted artefacts (new + modified):
  - `/website/src/lib/substrate/layer3-service.ts` (NEW)
  - `/website/src/app/api/substrate/layer3/route.ts` (NEW)
  - `/website/src/lib/substrate/__tests__/layer3-service.test.ts` (NEW)
  - `/website/src/lib/translation-sandwich/parallel-run.ts` (MODIFIED)
  - `/operations/decision-log.md` (entry appended)
- Governing frame:
  - `/adopted/substrate-plugin-staging-plan.md` Stage 1 item A5 (success criteria SATISFIED on /api/reason)
  - `/manifest.md` §R3, R18a, R18e, R19, R20a, AC1, AC2, AC4, AC5, AC7, AC8, AC9, AC10, AC11
  - `/adopted/adr/2026-05-04-layer3-prose-template-api-reason.md` (the api_reason template A5 wraps)
  - `/adopted/adr/2026-05-12-substrate-category-character-kernel.md` (R18a category language sourced)
- Caches (unchanged this session):
  - `/adopted/standing-protocol-cache.md`
  - `/adopted/build-sessions-protocol-cache.md`

---

*End of A5 Layer 3 substrate-service session close. Stage 1 critical chain A1→A2→A3→A4→A5 complete on /api/reason. Substrate production state preserved: SUBSTRATE_LAYER3_ENABLED unset; /api/reason byte-identical to pre-A5. Build arc proceeds to A7 (R20a gate) or A6 (prose_mode templates) per founder election at next session-open.*
