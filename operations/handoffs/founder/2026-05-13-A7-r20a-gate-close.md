# Session Close — 2026-05-13 — A7 Server-Side R20a Gate Scaffolding

**Stream:** founder.
**Governing frame:** `/adopted/standing-protocol-cache.md` + `/adopted/build-sessions-protocol-cache.md` + the amended staging plan + the amended manifest + the project-instructions snapshot.
**Tier:** code-critical — **Critical** risk under 0d-ii. PR6 + AC4 + AC5 + AC7-not-engaged + AC8 + AC11 all engaged. **Full** templates per the standing cache §"Critical-risk sessions".
**Date:** 2026-05-13.
**Predecessor close (substrate-build):** `/operations/handoffs/founder/2026-05-12-A5-layer3-service-close.md` (A5 Layer 3 substrate service Verified).
**Predecessor close (most recent):** `/operations/handoffs/founder/2026-05-13-agentic-commerce-upstream-rework-close.md` (governance-only session; production state unchanged).
**Operative session prompt:** in-chat A7 next-session prompt + `/operations/handoffs/founder/2026-05-12-A7-r20a-gate-NEXT-SESSION-PROMPT.md`.

---

## Decisions Made

- `D-A7-R20A-GATE-SCAFFOLDED-VERIFIED-2026-05-13` appended (+~140 lines). Stage 1 item A7 (server-side R20a gate) reaches **Scaffolded + Wired + Verified** status on the `/api/reason` PR1 single-endpoint proof. One founder session-open election committed: **Option (a)** A7 runs AFTER Layer 1 extraction (cleaner — A7 sees what Layer 2 sees). Two PR5 knowledge-gap candidates promoted from 1st-recurrence (logged at A5) to 2nd-recurrence WATCH status (two-entry-point substrate pattern; defensive-read-of-future-fields pattern). PR12 negative-finding discipline applied to the A7 prompt's "plugin-auth bypass" framing — found out of date; recalibration surfaced honestly to founder at Step 1; founder approved the work with the recalibrated framing. PR15 bespoke election justified (no existing Anthropic primitive delivers per-substrate-boundary R20a enforcement). PR16 positioning + dogfood lens applied (Character Kernel strengthened via substrate-boundary R20a enforcement). F3 fold-in operationalised: A5 Layer3Response shape recognised as AP2-style mandate-output; A7 is producer in mandate-input chain.

---

## Status Changes

| Item | Old | New |
|---|---|---|
| Stage 1 A7 (Server-side R20a gate) | Scoped | **Verified** (on /api/reason PR1 proof) |
| `/website/src/lib/substrate/r20a-gate.ts` | did not exist | NEW (~450 lines; A7.1-A7.7 components + type guards + fallback constant) |
| `/website/src/lib/substrate/__tests__/r20a-gate.test.ts` | did not exist | NEW (~350 lines; 33 functional + invariant + latency + type-guard tests; all PASS) |
| `/website/src/lib/translation-sandwich/layer2-mechanisms.ts` | A5-Verified state | MODIFIED (Layer2Assessment extended with optional `distress_signal?: boolean` field + docstring; ~25 line addition) |
| `/website/src/lib/translation-sandwich/parallel-run.ts` | A5-Verified state | MODIFIED (7 changes; A7 imports + SafetyGate import + SandwichInput field + FailureCategory + SandwichRunResult field + two result-object initializations + A7 call site after Layer 1 + attachDistressSignalToAssessment call after Layer 2 narrowing) |
| `/website/src/app/api/reason/route.ts` | M1-CP6 / A5-Verified state | MODIFIED (2 changes; safetyGate passed to runSandwich + Branch 1.7 handling r20a_gate_redirect) |
| `Layer2Assessment.distress_signal` field | did not exist | NEW (optional; defensive default undefined) |
| `A5.4 distress pass-through injection` (per A5 close open question) | structurally complete, functionally inert | **producer-side ready** — A7 now produces the distress_signal field A5.4 reads. Operational activation gated on BOTH SUBSTRATE_R20A_GATE_ENABLED=true AND SUBSTRATE_LAYER3_ENABLED=true |
| `SUBSTRATE_R20A_GATE_ENABLED` env var (Vercel) | did not exist | UNSET (default OFF — no production behaviour change at session close) |
| Substrate production | A5 Verified; flag UNSET; `/api/public-key` steady state | **unchanged** — A7 wired in code, flag UNSET, behaviour byte-identical |

---

## Next Session Should

The build arc proceeds under the amended staging plan. Per the indicative session-10 packaging: **A9 cost monitoring on the new substrate path + J6 R5 cost-impact assessment** (Elevated; ~1-2h). Alternative elections per the founder's call:

- **Option A — A9 + J6** (Elevated; ~1-2h). Per the staging plan's session-10 packaging. R5 cost-as-health-metric alerts re-pointed for the substrate path. Cost shape under translation-sandwich (Layer 1 cost shifts to plugin per Stage 3; Layer 2 cost near-zero; Layer 3 cost stays metered). J6 is the cost-impact assessment. Recommended if maintaining staging-plan sequencing is the priority.
- **Option B — A6 prose_mode per-mode templates** (Standard; ~2-3h). Closes A5.5 parameter-plumbing-only scope by filling in clinical/terse/standard/educational templates. F3 fold-in applies (A6 session references A5; per the recommended-order tracker). Recommended if K-category migration prep is the priority.
- **Option C — A10 per-agent credentials kickoff + token-format ADR** (Critical; ~3-4h, token-format ADR drafted in-session). The highest-leverage Critical item — token-format ADR now consumes four candidates (JWT / W3C VC / AP2-style mandate / hybrid) per the 2026-05-13 agentic-commerce upstream re-work. Recommended if Stage 1 critical-path expansion is the priority.

**Founder elects at next session-open.** All three are valid under the amended plan.

**Pre-conditions for any next session:**
1. This session's work committed to origin/main (commit command in §"Founder Verification" below).
2. Founder runs the production-state verification probes between sessions to confirm substrate steady state preserved (A7 flag UNSET; A5 flag UNSET; /api/reason byte-identical; /api/substrate/layer3 returns 503).
3. Founder paste-syncs `/adopted/project-instructions-snapshot.md` content into the Cowork project-instructions panel if changed since last paste-sync (no PI changes this session; the snapshot is still post-ST2 — pre-2026-05-13 sync state is acceptable for the next session per this session's session-open partial-sync resolution).

**Next-session prompt:** to be drafted at the start of the next session. Standing protocol cache + build-sessions cache + this close + the A7 decision-log entry are sufficient session-opening references.

---

## Blocked On

**Files uncommitted (to be committed by founder before next session):**

```
?? website/src/lib/substrate/r20a-gate.ts
?? website/src/lib/substrate/__tests__/r20a-gate.test.ts
M  website/src/lib/translation-sandwich/layer2-mechanisms.ts
M  website/src/lib/translation-sandwich/parallel-run.ts
M  website/src/app/api/reason/route.ts
M  operations/decision-log.md
?? operations/handoffs/founder/2026-05-13-A7-r20a-gate-close.md
```

**Production state at session close:** unchanged from session start (and from 2026-05-13 agentic-commerce upstream re-work close). Substrate at A5 Verified. `/api/public-key` serves steady-state shape (`previous: null`; `rotation_overlap_until: null`; `algorithm: Ed25519`). `SUBSTRATE_LAYER3_ENABLED` env var UNSET. `SUBSTRATE_R20A_GATE_ENABLED` env var UNSET (NEW — added in this session's scope but not provisioned in Vercel; the variable does not exist yet). `/api/reason` behaviour byte-identical to pre-A7. `/api/substrate/layer3` returns 503 (flag unset). All four `SUBSTRATE_LAYER2_PREVIOUS_*` env vars UNSET. Vercel state: unchanged. No env-var changes; no schema migrations; no auth-surface changes on production traffic; no R20a perimeter changes (AC5 perimeter intact).

---

## Open Questions

**New open questions surfaced this session:**

1. **A7 production activation timing.** A7 is operationally ready but `SUBSTRATE_R20A_GATE_ENABLED` env var remains UNSET in Vercel. Production activation requires founder decision + Critical Change Protocol re-engagement for the flag-flip (per the A1 + A4 precedent). Revisit condition: explicit founder decision to activate A7 in production OR Stage 1 close gating step (whichever comes first).

2. **A5.4 production activation timing (updated from A5's open question).** A5.4 was previously inert because all three signal sources were absent. A7 now produces the `distress_signal` source. A5.4 activates when BOTH flags are ON in production. Recommended order: A7 flag flipped first (verify A7 behaviour in production with monitoring), then A5 flag flipped (third-layer defence comes online). Revisit condition: founder elects A7 production activation.

3. **AC2 latency budget verification for the fresh-call path.** LT-1 verified the reused-gate path is 0ms. The fresh-call path (future substrate consumers without their own perimeter) would inherit the AC2 ~500ms regex → Haiku budget. Not exercised this session. Revisit condition: first non-/api/reason consumer wires A7.

4. **Component-registry update batching.** A7 joins the deferred batch with A1-A5 entries. Revisit condition: routine governance session post-A7.

**Carry-forward open questions from predecessor sessions (still open):**

- A6 timing (A5 close open question #2) — A6 is now an explicit Option B at next session.
- Cost capture posture when flag flipped ON (A5 close open question #3) — flagged for A12 session; unchanged this session.
- `/api/substrate/layer3` auth posture finalisation (A5 close open question #4) — unchanged this session; A10 sub-stage kickoff still the revisit condition.

---

## Verification Method Used (per 0c framework)

| Work type | Verification method |
|---|---|
| TypeScript module (new) + interface extension + modified orchestrator + modified route (code-critical) | AI in-session clean `tsc --noEmit -p tsconfig.json` pass (EXIT_CODE=0) + AI grep invocation-pattern verification (enforceLayer2R20aGate: 2 occurrences in parallel-run.ts; isSubstrateR20aGateEnabled: 2 occurrences; attachDistressSignalToAssessment: 2 occurrences; safetyGate + r20a_gate_redirect confirmed in route.ts). Founder re-runs same commands between sessions. |
| Functional tests (33-of-33 PASS) | AI in-session `npx tsx` execution with PASS/FAIL output line per test. Founder re-runs same command between sessions. |
| A5 regression check | Layer2Assessment interface extension was the only A5-adjacent change. A5's defensive read continues to work via the optional field type. Founder re-runs A5's 28-test suite between sessions to confirm no regression. |
| Production-state probe (`/api/public-key` + `/api/substrate/layer3`) | Founder runs curl probes between sessions; sandbox HTTP 403 precludes in-session probes (documented A4 limitation; persists from A5 close). |
| Decision-log entry (Critical full-form) | Founder reads directly. |
| Manifest / governance | No manifest amendment this session; the existing R20a/AC1/AC2/AC4/AC5/AC7/AC8/AC11 rules govern A7's behaviour. Founder reads decision-log entry to confirm coverage. |

---

## Risk Classification Record (0d-ii)

| Change | Classification | Reason |
|---|---|---|
| New A7 library module + new test file | **Critical** | PR6 (R20a server-side gate is safety-critical second-layer defence); AC8 (extends substrate library); CCP completed in full. |
| Layer2Assessment interface extension (optional field) | **Critical** | PR6 (safety-critical surface — the field A7 writes for A5.4 to read); type-checked clean; backwards compatible (optional field). |
| Modification to parallel-run.ts (A7 call site + attachment + new FailureCategory + new SandwichRunResult field) | **Critical** | Same surface as above; A7 call site introduced into the `/api/reason` execution path between Layer 1 and Layer 2. |
| Modification to route.ts (safetyGate plumb-through + Branch 1.7) | **Critical** | Same surface; A7 wires into the user-facing API path; route handles new redirect branch. |
| New test file (no production touch) | Standard | Test code does not deploy to production runtime; pre-runtime validation only. |
| Component-registry entry | N/A this session | Deferred to routine governance batch with A1-A5 entries. |

All Critical changes covered by the single CCP writeup in the decision-log entry. Founder approval received at Step 5 specific to the five named risks before commit (1. Layer2Assessment extension; 2. new FailureCategory; 3. AC5 perimeter not broadened; 4. AC7 not engaged; 5. production behaviour byte-identical with flag UNSET).

---

## PR5 Knowledge-Gap Carry-Forward

**KG references applied this session (no re-explanation needed; rules honoured):**

- **KG1 (Vercel five rules)** — applied: env-var read per-call (not module-load) in `isSubstrateR20aGateEnabled()`; no DB writes from A7; pure synchronous code in the attachment path. Cumulative recurrence count for KG1 in code-critical sessions remains at established level (no new entry).
- **KG2 (Haiku reliability boundary)** — applied: A7 inherits Haiku via the existing classifier; no new LLM call introduced. Cumulative recurrence count unchanged.
- **AC1 (model selection — Haiku for safety-critical R20a classifier)** — applied per cache Element 6 row. Confirmed at session-open; honoured in implementation via inheritance.

**PR5 candidates PROMOTED from 1st-observation to 2nd-recurrence WATCH status (first observed at A5; recurred at A7):**

1. **Two-entry-point pattern for substrate services migrating existing consumers.** First observed at A5 (`applyLayer3Injections` wrapper for existing consumers + `generateLayer3Response` full service for new consumers). Recurs at A7 via the `EnforceR20aGateInput.gate` parameter (reused-gate path for existing consumers like /api/reason; fresh-call path for future substrate consumers without their own route-level perimeter). Per PR5 promotion rules, 2nd recurrence promotes to "Candidate (watch status with proposed resolution sketch)". **Proposed resolution:** substrate services migrating existing consumers should expose both a minimum-disruption injection/wrapper entry-point AND a full-service entry-point, with shared internal logic. Logged in `/operations/knowledge-gaps.md`. Third recurrence (e.g., at A11b prompt-injection defence) promotes to permanent KG entry.

2. **Defensive-read-of-future-fields pattern for substrate services depending on not-yet-implemented producers.** First observed at A5 (defensive read of `assessment.decision`, `assessment.distress_signal`, `assessment.provenance`, `assessment.use_policies`). Recurs at A7 via the `EnforceR20aGateInput.gate` optional parameter (reads SafetyGate when present from route-level perimeter; absent for future consumers — A7 makes a fresh classifier call). 2nd recurrence; promote to watch status. **Proposed resolution:** substrate services with cross-stage dependencies should design optional input fields with defensive defaults; document the producer-consumer chain. Third recurrence promotes to permanent KG entry.

**No KG promotion to permanent entry this session.** Both candidates promote from 1st-observation to watch status per PR5 rules. Third recurrence required for permanent KG status.

---

## Founder Verification (Between Sessions)

```bash
cd "/Users/clintonaitkenhead/Claude-work/PROJECTS/sagereasoning"

# 1. TypeScript compile (expected: no errors; clean exit)
cd website && npx tsc --noEmit -p tsconfig.json && cd ..

# 2. A7 functional tests (expected: 33 pass / 0 fail)
cd website && npx tsx src/lib/substrate/__tests__/r20a-gate.test.ts && cd ..
# Expected output ends with: "33/33 pass | 0/33 fail"

# 3. A5 regression check (expected: 28 pass / 0 fail)
cd website && npx tsx src/lib/substrate/__tests__/layer3-service.test.ts && cd ..
# Expected output ends with: "28 pass / 0 fail"

# 4. A7 invocation greps
grep -cn "enforceLayer2R20aGate" website/src/lib/translation-sandwich/parallel-run.ts
# Expected: >= 2 (import + call site)

grep -cn "isSubstrateR20aGateEnabled" website/src/lib/translation-sandwich/parallel-run.ts
# Expected: >= 2

grep -cn "attachDistressSignalToAssessment" website/src/lib/translation-sandwich/parallel-run.ts
# Expected: >= 2

# 5. Route plumbing
grep -cn "safetyGate" website/src/app/api/reason/route.ts
# Expected: >= 1 (the safetyGate: gate line in the runSandwich call)

grep -cn "r20a_gate_redirect" website/src/app/api/reason/route.ts
# Expected: >= 1 (Branch 1.7 handler)

# 6. Production state probes — substrate steady state
curl -sS -o /dev/null -w "%{http_code}\n" -X POST https://www.sagereasoning.com/api/substrate/layer3
# Expected: 503

curl -sS https://www.sagereasoning.com/api/public-key | python3 -c "
import json, sys
d = json.load(sys.stdin)
ok = d.get('previous') is None and d.get('rotation_overlap_until') is None and d.get('algorithm') == 'Ed25519'
print('PASS — substrate steady state preserved (key_id={})'.format(d['key_id']) if ok else 'FAIL — state regression')
"
# Expected: PASS line
```

If any check fails, A7 has regressed; engage Path A rollback (verify `SUBSTRATE_R20A_GATE_ENABLED` UNSET in Vercel) or Path B (git revert the A7 commit + redeploy) and report at next session open.

**Session-close commit:**

```bash
cd "/Users/clintonaitkenhead/Claude-work/PROJECTS/sagereasoning"
git add -A
git commit -m "Stage 1 A7 scaffolded + wired + verified: server-side R20a gate

A7 reaches Verified on /api/reason PR1 single-endpoint proof.

New files:
- website/src/lib/substrate/r20a-gate.ts (~450 lines).
  A7.1-A7.7 components: R20aGateOutput discriminated union (PASS / REDIRECT /
  BYPASSED); enforceLayer2R20aGate with fail-CLOSED outer wrapper;
  attachDistressSignalToAssessment; R20aGateBypassedResult sentinel;
  isSubstrateR20aGateEnabled flag reader; emitR20aGateSpan AC11 stub;
  A7_FALLBACK_REDIRECT_MESSAGE constant; three type guards.
- website/src/lib/substrate/__tests__/r20a-gate.test.ts (~350 lines).
  33 functional + invariant + latency + type-guard tests. All 33 PASS.

Modified:
- website/src/lib/translation-sandwich/layer2-mechanisms.ts:
  added optional distress_signal?: boolean field to Layer2Assessment for
  A5.4 to read.
- website/src/lib/translation-sandwich/parallel-run.ts: 7 changes - A7
  imports + SafetyGate import; safetyGate? on SandwichInput; r20a_gate_redirect
  FailureCategory; substrate_r20a_gate_output field on SandwichRunResult +
  two initializations; A7 call site between Layer 1 and Tier 1 ELEMENT_FUSION
  (Option (a) sequencing); const→let + attachDistressSignalToAssessment
  call after Layer 2 narrowing.
- website/src/app/api/reason/route.ts: 2 changes - safetyGate: gate passed
  to runSandwich (zero-added-latency gate-passthrough); Branch 1.7 handling
  r20a_gate_redirect with 200 redirect response matching line 547-549 shape.

Production state at commit: unchanged. SUBSTRATE_R20A_GATE_ENABLED env var
UNSET in Vercel (default). /api/reason behaviour byte-identical to pre-A7.
/api/substrate/layer3 returns 503 (A5 flag also UNSET). Substrate
continues at A5 Verified; /api/public-key steady-state shape preserved.

One founder session-open election committed:
- Option (a) A7 runs AFTER Layer 1 extraction (cleaner; marginal Layer 1 cost
  on redirected requests is acceptable since reused-gate path has zero added
  latency for /api/reason).

Verification:
- 33-of-33 functional tests PASS (npx tsx).
- TypeScript clean compile (tsc --noEmit; EXIT_CODE=0).
- Invocation grep: enforceLayer2R20aGate 2 occurrences in parallel-run.ts;
  isSubstrateR20aGateEnabled 2; attachDistressSignalToAssessment 2.
- safetyGate + r20a_gate_redirect wired in route.ts.
- A5.4's defensive read pattern now meets A7 producer.

PR5 candidates promoted from 1st observation (A5) to 2nd-recurrence watch:
- Two-entry-point substrate pattern (applyLayer3Injections + generateLayer3Response
  at A5; reused-gate + fresh-call at A7).
- Defensive-read-of-future-fields pattern (A5 reads decision/distress_signal/
  provenance/use_policies; A7 reads SafetyGate).

PR12 negative-finding discipline: A7 prompt's plugin-auth bypass framing
checked against actual code at /api/reason/route.ts line 544; framing
found out of date (line 544 covers all three auth paths); honest
recalibration surfaced to founder at Step 1; A7's real current-state
value is the MILD-severity gap closure (route-level only redirects
MODERATE/ACUTE) + A5.4 activation + defence-in-depth + forward-looking
protection for future substrate consumers.

F3 fold-in (per /operations/agentic-commerce-findings-downstream-order.md):
A5 Layer3Response shape recognised as AP2-style mandate-output; A7 is
producer in mandate-input chain via distress_signal field.

Decision-log entries appended:
- D-A7-R20A-GATE-SCAFFOLDED-VERIFIED-2026-05-13

Next session: A9 + J6 cost-monitoring (recommended per session-10
indicative packaging) OR A6 prose_mode templates OR A10 per-agent
credentials kickoff per founder election."
```

Then push via GitHub Desktop. This commit touches `/website/src/` (Vercel will redeploy) and `/operations/` (governance only — no Vercel impact). Vercel redeploy expected: A7 files now in the deployed bundle; the new `substrate_r20a_gate_output` field on the sandwich result exists but is null because the flag is unset; `/api/reason` behaviour byte-identical to pre-commit because the flag is unset; A5 also continues UNSET; no env-var changes; no DB schema changes.

---

## Orchestration Reminder

This is a Critical-tier session. The standing protocol cache §"Critical-risk sessions" requires the full template form. This close uses the full form (Verification Method Used; Risk Classification Record; PR5 Knowledge-Gap Carry-Forward; Founder Verification; Orchestration Reminder — all present). The lean form is NOT used for this session.

Per AC12 (Sub-Agent Verification Option for Critical-Tier Work) — this session did NOT spawn a verifier sub-agent. Founder verification is in-session via the AI's own grep + tsx + tsc invocations (per the Verification Method Used table above) plus between-session re-runs by the founder. If between-session verification surfaces any discrepancy, engage Path A rollback (~30s flag verification — flag is already UNSET, so Path A reduces to "confirm UNSET state").

Per PR12 — the A7 prompt's "plugin-auth bypass" framing was checked against actual code (line-by-line read of /api/reason/route.ts) and found out of date. The recalibration was surfaced honestly to the founder at Step 1 Plan (CCP inline). The founder approved the work AND the recalibrated framing. The recalibration is captured in the decision-log entry's Reasoning section + this close's relevant sections. Future A-series prompts should be checked against actual code state at session-open rather than trusting prompt framing.

Per PR16 — at each design decision in this session, positioning + dogfood lens was applied. A7 strengthens Character Kernel positioning by enforcing R20a at the substrate boundary (substrate consultation of its own safety discipline); substrate-consultable via /api/reason — every Layer 2 call now passes through A7 when the flag is on.

Per F3 fold-in — A5 Layer3Response shape recognised as AP2-style mandate-output; A7 is a producer in the mandate-input chain via the `distress_signal` field that completes A5.4's defensive read. The substrate-consultation-mandate lens is now operational across A5 + A7. F3 is hereby operationalised for the A5/A7 relationship.

---

## Cross-references

- Operative session prompt: in-chat A7 next-session prompt + `/operations/handoffs/founder/2026-05-12-A7-r20a-gate-NEXT-SESSION-PROMPT.md`.
- Predecessor substrate-build close: `/operations/handoffs/founder/2026-05-12-A5-layer3-service-close.md`
- Predecessor most-recent close: `/operations/handoffs/founder/2026-05-13-agentic-commerce-upstream-rework-close.md`
- Predecessor decision-log entries: `D-A5-LAYER3-SCAFFOLDED-VERIFIED-2026-05-12`; `D-AGENTIC-COMMERCE-UPSTREAM-REWORK-2026-05-13`; `D-STAGING-PLAN-AMENDED-FROM-ST2-2026-05-12`; `D-MANIFEST-AMENDED-FROM-ST2-2026-05-12`; `D-CACHE-DRIFT-RESOLVED-2026-05-12`.
- This session's decision-log entry: `D-A7-R20A-GATE-SCAFFOLDED-VERIFIED-2026-05-13`.
- Adopted artefacts (new + modified):
  - `/website/src/lib/substrate/r20a-gate.ts` (NEW)
  - `/website/src/lib/substrate/__tests__/r20a-gate.test.ts` (NEW)
  - `/website/src/lib/translation-sandwich/layer2-mechanisms.ts` (MODIFIED — Layer2Assessment extended with distress_signal field)
  - `/website/src/lib/translation-sandwich/parallel-run.ts` (MODIFIED)
  - `/website/src/app/api/reason/route.ts` (MODIFIED)
  - `/operations/decision-log.md` (entry appended)
- Governing frame:
  - `/adopted/substrate-plugin-staging-plan.md` Stage 1 item A7 (success criteria SATISFIED on /api/reason)
  - `/manifest.md` §R20a, AC1, AC2, AC4, AC5, AC7, AC8, AC11
  - `/website/src/lib/r20a-classifier.ts` (reused without modification)
  - `/website/src/lib/constraints.ts` (SafetyGate token reused for gate-passthrough)
  - `/website/src/lib/substrate/layer3-service.ts` (A5 — A5.4 defensive read now meets A7 producer)
  - `/adopted/adr/2026-05-12-substrate-category-character-kernel.md` (J1 ADR — R18a category language inherited via A5 path)
  - `/operations/agentic-commerce-findings-downstream-order.md` (F3 fold-in operationalised by this session)
- Caches (unchanged this session):
  - `/adopted/standing-protocol-cache.md`
  - `/adopted/build-sessions-protocol-cache.md`

---

*End of A7 server-side R20a gate session close. Stage 1 critical chain A1→A2→A3→A4→A5→A7 complete on /api/reason. Substrate production state preserved: SUBSTRATE_R20A_GATE_ENABLED unset; SUBSTRATE_LAYER3_ENABLED unset; /api/reason byte-identical to pre-A7. A5.4 third-layer R20a defence is now producer-side ready (A7 produces the distress_signal field); operational activation gated on both flags ON in production via the Critical Change Protocol. Build arc proceeds to A9+J6 (recommended), A6 prose_mode templates, or A10 per-agent credentials per founder election at next session-open.*
