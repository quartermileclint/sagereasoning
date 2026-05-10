# Session Close — 2026-05-10 — Stage 1 A4 Wired + Verified: Key Management on /api/public-key

**Stream:** founder.
**Governing frame:** /adopted/standing-protocol-cache.md + /adopted/build-sessions-protocol-cache.md.
**Tier:** code-critical — **Critical** risk under PR6 + AC7. Full templates per the standing cache (NOT lean form).
**Date:** 2026-05-10.
**Predecessor close:** /operations/handoffs/founder/2026-05-10-stage-1-a3-wired-verified-close.md
**Predecessor decision-log entries:** D-A3-LAYER2-SIGNING-WIRED-VERIFIED-2026-05-10, D-A3-LAYER2-SIGNING-ADR-ADOPTED-2026-05-10, D-A2-INPUT-VALIDATION-SURFACE-2026-05-10, D-A1-FLAG-FLIP-VERIFIED-2026-05-10, D-STAGING-PLAN-ADOPTED-2026-05-10.
**Session prompt:** pasted in conversation by founder; preserved at /operations/handoffs/founder/2026-05-10-stage-1-a4-key-management-NEXT-SESSION-PROMPT.md (untracked at session close; founder may commit separately for traceability).

---

## Decisions Made

- **D-A4-KEY-MANAGEMENT-WIRED-VERIFIED-2026-05-10** appended (full-form per Critical session). Stage 1 item A4 (Key management) reaches **Verified** on `/api/public-key`. The substrate's quarterly rotation contract (committed in A3 ADR §Decision 4) is now operationalised: four optional environment variables populate the `previous` slot during a 30-day rotation overlap window; a founder-performable runbook documents the 9-step procedure plus an off-cycle (compromise-suspected) variant plus three rollback paths. Four session-opening elections committed: **Choice 1(a)** rehearse rotation procedure now on test keypair; **Choice 2(a)** four optional env vars for previous-key slot only (refinement: `SUBSTRATE_LAYER2_PREVIOUS_KEY_ISSUED_AT` added at Step 4 deliberation to populate the A3 ADR Decision 3 response shape); **Choice 3(a)** rotation runbook delivered as markdown file at `/operations/runbooks/`; **Choice 4(a)** first scheduled rotation Sunday 2026-09-06. Three production verification scenarios passed. PR1 single-endpoint proof on `/api/public-key` is COMPLETE for A4. A4 implementation status moves Designed → Scaffolded → Wired → Verified within this session.

---

## Status Changes

| Item | Old | New |
|---|---|---|
| Stage 1 item A4 (Key management) | Scoped (per D-STAGING-PLAN-ADOPTED-2026-05-10); operational gap inherited from A3 ADR §Decision 4 | **Verified** on `/api/public-key` |
| `/adopted/ADR-A4-key-management.md` | did not exist | NEW (~278 lines); four design decisions; four-env-var refinement note; pre-drafted CCP responses; approval-gate Path A elected |
| `/drafts/ADR-A4-key-management.md` | did not exist | drafted in-session, then moved to `/adopted/` per Path A approval at Step 8 |
| `/website/src/app/api/public-key/route.ts` | A3-modified | A4-modified — four new env-var constants + `resolvePreviousKey()` helper + GET handler populates `previous` block + `rotation_overlap_until` when all four set |
| `/website/src/app/api/public-key/__tests__/public-key-route.test.ts` | did not exist | NEW (~281 lines); 13 Jest-style invariant tests covering all five scenarios; ready-to-run when Jest is configured |
| `/operations/runbooks/substrate-layer2-key-rotation.md` | did not exist | NEW (~314 lines); 9-step founder-performable runbook + off-cycle (compromise-suspected) variant + rollback paths during a rotation + post-rotation reflection discipline |
| `/operations/runbooks/` | did not exist | NEW directory created this session; first occupant is the layer 2 key-rotation runbook |
| Vercel env vars `SUBSTRATE_LAYER2_PREVIOUS_PUBLIC_KEY` + `SUBSTRATE_LAYER2_PREVIOUS_KEY_ID` + `SUBSTRATE_LAYER2_PREVIOUS_KEY_ISSUED_AT` + `SUBSTRATE_LAYER2_PREVIOUS_KEY_RETIRES_AT` | did not exist | provisioned at Step 10 Scenario 2 with test values; unset at Step 10 cleanup; production steady state at session close = all four UNSET |
| Founder calendar | no first-rotation reminder | reminder pending for Sunday 2026-09-06 — "Substrate Layer 2 key rotation — first scheduled rotation per ADR-A4 Decision 4. Run /operations/runbooks/substrate-layer2-key-rotation.md." (founder action between sessions) |
| Decision status: A4 Wired+Verified | did not exist | **Adopted** |
| Build arc | Stage 1 A3 Verified (signing live); A4 unblocked | **Stage 1 A4 Verified** on `/api/public-key`; **A5 — Layer 3 server-side service** unblocked for next session (Critical risk per AC5; the R20a deterministic injection sits inside Layer 3) |

---

## Verification Method Used (per 0c framework)

This session exercised three founder-performable verification methods:

1. **TypeScript type-check on the whole project** (`npx tsc --noEmit -p tsconfig.json`) — exit code 0. Catches any structural type error introduced by the route extension + the new test file. (Side effect: `website/tsconfig.tsbuildinfo` was modified by the type-check; reverted twice during the session and flagged as F-series stewardship debt for `.gitignore` addition at a routine governance session.)

2. **Runtime smoke test via `npx tsx`** (`/website/tmp/a4-smoke-test.ts`, written this session). Exercised the route extension's GET handler against a stub of the four-env-var contract. **24 of 24 invariants PASS**:
   - Scenario 1 (no rotation): status 200; previous=null; rotation_overlap_until=null; current key_id preserved; algorithm=Ed25519 (5 invariants)
   - Scenario 2 (rotation in progress): status 200; previous non-null with all four fields matching; rotation_overlap_until mirrors previous.retires_at; current key fields preserved (8 invariants)
   - Scenario 3a-3e (partial state for each of four env vars + empty-string env var): all default to previous=null + rotation_overlap_until=null per fail-safe (5 invariants)
   - Scenario 4 (current public key env var unset): status 503; error code `substrate_public_key_unavailable` (2 invariants — preserves A3 contract)
   - Scenario 5 (env vars read at call time): three sequential GETs flip the response shape correctly as env state changes between calls (3 invariants)
   - A3 contract preserved: Cache-Control header = `public, max-age=3600, s-maxage=3600` on 200 (1 invariant)

3. **Three production verification scenarios on `/api/public-key`** (founder-executed via curl + Python):
   - **Scenario 1** (steady state at Step 9.7 immediately after deploy): `previous: None`, `rotation_overlap_until: None` — confirmed deploy did not regress existing behaviour. Zero regression.
   - **Scenario 2** (founder set four test env vars in Vercel + redeployed): `previous.key_id = substrate-layer2-DRYRUN-2026Q3`; `previous.public_key_pem` matches the test PEM exactly; `previous.issued_at = 2026-05-10T06:58:58.447Z`; `previous.retires_at = 2026-06-10T06:58:58.447Z`; `rotation_overlap_until = 2026-06-10T06:58:58.447Z` (mirrors retires_at). Endpoint correctly publishes the populated previous-key block during a simulated rotation overlap.
   - **Scenario 3** (founder unset `SUBSTRATE_LAYER2_PREVIOUS_PUBLIC_KEY` only; other three remain set; redeployed): `previous: None`, `rotation_overlap_until: None`. Fail-safe posture confirmed; partial config defaults to no-rotation rather than serving an inconsistent response.
   - **Cleanup** (founder unset remaining three env vars; redeployed): production back to Scenario 1 steady state for end-of-session.

The combination of (1) + (2) + (3) collectively satisfies AC4 (invocation testing for safety functions) at the production level. The Jest-style `.test.ts` file in `__tests__/` is ready-to-run when Jest is configured (F-series stewardship debt from A3 close still open); the `npx tsx` smoke test serves as interim verification per the T-A3-NEW-4 pattern.

---

## Risk Classification Record (per 0d-ii)

Three sub-changes this session, each classified independently:

| Sub-change | Risk class | Rationale |
|---|---|---|
| ADR drafting + adoption (Path A move from /drafts/ to /adopted/) | **Elevated** | File move from /drafts/ to /adopted/ per the standing cache's risk table |
| Implementation of `resolvePreviousKey()` helper + GET handler extension on `/api/public-key/route.ts` | **Critical** | Cryptographic key management infrastructure; co-resides with the signing surface that A3 made authoritative; PR6 + AC7 engaged |
| Rotation runbook + new `/operations/runbooks/` directory | **Standard** | Operational documentation; no production code changes; no production state changes |
| Vercel env-var provisioning during Step 10 (test values; all four unset at end of session) | **Elevated** | Deployment-configuration changes activating new previous-key surface; production state at session close = all four UNSET; test values were not real production previous-key values |

The session-as-a-whole is **Critical** under 0d-ii (the highest-risk sub-change governs). The full Critical Change Protocol was completed in chat: pre-drafted in the A4 ADR per the T-A3-NEW-1 pattern (third observation; eligible for promotion); confirmed at Step 3 walkthrough; explicit founder approval received at Step 8 naming the four risks (wire-format change, fail-safe on partial state, test-env-var pollution risk, mid-rotation rollback complexity).

The "no current users (affirmed 2026-05-10)" governing note from `/adopted/build-sessions-protocol-cache.md` §"Founder governing notes for the duration of the build arc" applied: CCP step 3 ("What happens to existing sessions?") was answered "N/A — only founder + test logins exist; no third-party sessions to invalidate." All other CCP steps remained in full force. The note will become re-engaged when the plugin ships and external users + verifiers exist.

---

## PR5 — Knowledge-Gap Carry-Forward

Watch-status concepts from predecessor sessions, updated this session:

1. **Apex-domain-redirect-on-POST behaviour at sagereasoning.com.** Engaged at Step 9.7 + Step 10 verifications (founder used `https://www.sagereasoning.com` for all curls, avoiding the apex-domain redirect). Cumulative count remains at 2 (watch-status). One more recurrence would promote this to a permanent KG entry per PR8.

2. **The substrate's three-layer architecture and the moat boundary.** Cited inside the new ADR's Plain-language summary section without re-explanation — the canonical reference remains `/adopted/ADR-stoic-agent-substrate-concept.md` §"The moat boundary". Resolution-already-canonical pattern. Cumulative count not advanced this session.

3. **The no-current-users governing note's effect on Critical Change Protocol step 3.** Cited at Step 3 (CCP walkthrough) and Step 8 (explicit approval) of this session via the inherited CCP responses pre-drafted in the A4 ADR. Resolution-already-canonical (cumulative count remains at 3+; not advanced because no re-explanation occurred).

4. **PR1 single-endpoint proof discipline applied to feature-flag-gated functions.** Re-engaged this session in adapted form — A4 used env-var-based fail-safe (the four previous-key env vars in the unset state preserve existing behaviour exactly) rather than a feature flag. The pattern is the same: PR1 proof on a single endpoint before any rollout to additional endpoints, with a rollback path that's a small operational reversion. Cumulative count = 4 (fourth application). Re-confirms PR8 third-recurrence eligibility from A3 close; recommended for promotion at a separate routine governance session per Rule B.

5. **Cryptographic-signing payload-vs-hash trade-off.** Not engaged this session (no signing surface modifications). Cumulative count remains at 2.

6. **Jest is not configured in the codebase.** Second observation (A3 + A4). The new `__tests__/public-key-route.test.ts` follows the existing co-located convention; Jest still not in `package.json`. Workaround applied: `npx tsx /website/tmp/a4-smoke-test.ts` (24/24 invariants PASS). **Recommended follow-up:** add Jest as a dev dependency + minimal config + test script in a Standard-risk governance session. Not blocking for A5.

7. **Feature-flag-gated rollout pattern's relationship to Path A rollback.** Adapted-and-applied this session — the env-var-based fail-safe (un-set four env vars + redeploy = ~30s recovery) plays the same role A3's feature flag did. Cumulative count = 2 (second observation in adapted form).

8. **NEW finding — `tsconfig.tsbuildinfo` recurrence in `git status` after `npx tsc` runs.** First observation this session. The `npx tsc --noEmit` writes to `website/tsconfig.tsbuildinfo` even when no compilation errors exist. The file is not in `.gitignore`. Workaround: `git checkout -- website/tsconfig.tsbuildinfo` before commit. F-series efficiency-and-stewardship; should be added to `.gitignore` at a routine governance session.

9. **NEW finding — `git mv` does not work on untracked files.** First observation this session at Step 9. The ADR file was at `/drafts/` but never tracked by git (it was a new file created in-session). `git mv drafts/... adopted/...` failed with `fatal: not under version control`. Workaround: regular `mv` + `git add adopted/...` + `git commit --amend --no-edit`. Founder navigation friction during this discovery; runbook pattern added to the session-close commit pattern: when moving a new untracked file from /drafts/ to /adopted/, use `mv + git add` not `git mv`. Cumulative count = 1 (first observation).

10. **NEW finding — multi-step Vercel UI procedures introduce founder navigation friction at scale.** First observation this session at Step 10 (3 scenarios × env-var-set + redeploy + verify cycle = ~9 distinct Vercel actions plus 3 curl verifications). Founder reported "this is too hard, I don't know what you are asking me to do" when the runbook + git steps got too dense. Mitigation applied mid-session: reset to single command blocks; one verification per response; explicit copy-paste instructions. The runbook itself (rotation procedure) carries this risk for the live 2026-09-06 rotation; the runbook's per-step verification + the AI's in-session presence at the live rotation are the mitigation. Cumulative count = 1 (first observation as a named pattern). May recur in any future session involving Vercel UI work for non-trivial procedures.

---

## Tacit-knowledge findings (T-series register, per PR8)

**T-AT-LEAST-NEW-1 — Three-scenario verification methodology.** Re-applied this session for the FOURTH confirmed time (A1 verification + A2 verification deferred per Rule B + A3 verification + A4 verification this session). Already eligible for promotion at A3 close; reaffirmed here. Recommended promotion text remains: *"Three-scenario production verification — every Verified-status migration of a Critical-or-Elevated surface uses (1) pre-state happy path returns the existing expected shape (zero regression); (2) post-state happy path returns the new expected shape; (3) tamper/perturbation/regression-check fails as expected (proving the discipline catches the kind of failure the surface exists to prevent)."* Promotion pending separate routine governance session per Rule B.

**T-A2-NEW-1 — Validator-throw-to-400-with-preserved-fields.** Not exercised this session.

**T-A3-NEW-1 — Critical Change Protocol drafted ahead of time inside the ADR.** Re-engaged this session — the A4 ADR's CCP responses were pre-drafted in §"Critical Change Protocol responses" before the scaffolding work began. Cumulative count = 3 (third observation; the pattern is now well-validated). **Eligible for promotion to a process rule per PR8 third-recurrence rule.** Recommended promotion text: *"Critical-tier ADR drafts include the Critical Change Protocol responses pre-drafted in a §'Critical Change Protocol responses (drafted ahead of time per [precedent])' section. The eventual scaffolding session inherits the responses and confirms them at session-open rather than re-deriving them under time pressure."* Promotion pending separate routine governance session per Rule B.

**T-A3-NEW-2 — ADR commits Critical-classification of the eventual scaffolding session inside the document.** Re-engaged this session — the A4 ADR's AC7 compatibility posture section explicitly classified this session as Critical before it began, and the scaffolding session inherited that classification. Cumulative count = 3 (third observation). **Eligible for promotion** to a process rule per PR8 third-recurrence rule. Same recommended timing as T-A3-NEW-1 (consolidated routine governance session).

**T-A3-NEW-3 — Feature-flag-gated rollout pattern's Path A rollback property.** Adapted application this session via env-var-based fail-safe; see PR5 carry-forward item 7 above. Cumulative count = 2 (second observation in adapted form).

**T-A3-NEW-4 — Inline `npx tsx` smoke test as interim test runner when Jest is unavailable.** Re-engaged this session — wrote `/website/tmp/a4-smoke-test.ts` exercising the four-env-var contract; 24/24 invariants PASS. Cumulative count = 2 (second observation as a named pattern). May recur in any future code-critical session until Jest is configured.

**T-A4-NEW-1 — `git mv` fails on untracked files; use `mv + git add` instead.** New this session — see PR5 carry-forward item 9 above. Cumulative count = 1 (first observation). May recur in future sessions that move new untracked files between directories.

**T-A4-NEW-2 — Multi-step Vercel UI procedures need founder-paced single-command blocks.** New this session — see PR5 carry-forward item 10 above. The lesson: when surfacing multi-step Vercel UI procedures, reset to one verification per response after every founder action; do not batch multiple verifications into a single response if the founder shows navigation friction. Cumulative count = 1 (first observation as a named pattern). The rotation runbook itself carries this risk for the live 2026-09-06 rotation; mitigated by per-step verification structure and AI in-session presence.

**T-A4-NEW-3 — Implementation refinements may surface during code that adjust prompt-stated env-var counts; founder reaffirmation captures the change in the ADR before adoption.** New this session — the four-env-var refinement (adding `SUBSTRATE_LAYER2_PREVIOUS_KEY_ISSUED_AT` to the prompt's stated three) was discovered at Step 4, surfaced to founder with three options (A/B/C), founder elected (A), and the ADR's Decision 2 was amended in-session before the Path A adoption. The pattern: implementation work may surface details prompt-deliberation didn't anticipate; the ADR captures the refinement with reasoning and alternatives so the change is visible in the architectural record. Cumulative count = 1.

---

## Stewardship findings (F-series register, per PR9)

No catastrophic or long-term-regression findings opened this session. Three efficiency-and-stewardship findings logged for the steady-state queue, plus two carry-forwards from A3:

- **NEW — `tsconfig.tsbuildinfo` not in `.gitignore`.** Side-effect of `npx tsc` runs during code-critical sessions. Workaround: manual revert before commit. Tier: **Efficiency & stewardship** per PR9; absorbed into ongoing steady-state maintenance. The next governance session should add this to `.gitignore` (~5 min).
- **NEW — `website/tmp/` scratch directory not in `.gitignore`.** Created in-session for `npx tsx` smoke tests; permission constraints prevented in-session deletion. Should be cleaned manually post-session (`rm -rf` from founder's terminal) and added to `.gitignore` together with `tsconfig.tsbuildinfo` in the same routine governance session.
- **NEW — Multi-step Vercel UI procedures' navigation-friction risk** (also logged as T-A4-NEW-2). The rotation runbook carries this risk for the live 2026-09-06 rotation. Mitigation: per-step verification structure + AI in-session presence. Future sessions involving non-trivial Vercel UI work should chunk responses to one founder action + one verification per turn.
- **CARRY-FORWARD — Jest configuration debt** (from A3 close). Two `__tests__/` files at A3 + one new at A4 = three tests files cannot run via `npm test`. Tier: **Efficiency & stewardship** per PR9; ~30 min in a routine governance session to add `jest` + minimal config + `test` script.
- **CARRY-FORWARD — Founder calendar carries multiple cryptographic-key reminders** (from A3 close). Now expanded: monthly `MENTOR_ENCRYPTION_KEY` verification + monthly `SUBSTRATE_LAYER2_SIGNING_KEY` verification + the new quarterly Layer 2 rotation cadence (first 2026-09-06). Tier: **Efficiency & stewardship**. Consolidate into a single recurring "Cryptographic key custody check" item at the next routine governance session, plus add the quarterly rotation cadence as a separate calendar event.

Recommendation: bundle all three NEW + the two CARRY-FORWARD findings into a single ~45 min Standard-risk governance session post-A4 to clear the operational debt the build arc has accumulated. Same session can promote T-AT-LEAST-NEW-1 + T-A3-NEW-1 + T-A3-NEW-2 to process rules.

---

## Open Questions

1. **Capability-matrix update for the public-key surface at /api/public-key (with the new previous-block contract).** Inherited from A1, A2, A3-ADR-Adopted, A3-Wired-Verified closes; A4 adds another surface to the queue. Continues to accumulate; the upcoming K-category planning session(s) should clear in batch.

2. **Whether the three-scenario verification methodology promotion to a process rule (PR8 third recurrence per T-AT-LEAST-NEW-1) and the CCP-pre-drafted-in-ADR promotion (T-A3-NEW-1, third recurrence this session) should happen at A5 session-close or at a separate routine governance session.** Recommendation per Rule B: separate governance session post-A5 (allow another sleep cycle; both findings have now reached the third+ recurrence with consistent application). If the founder prefers, the promotions can land in A5's session-close to keep momentum.

3. **Jest configuration in the codebase.** Logged as F-series efficiency-and-stewardship; not blocking; deferrable to any routine governance session.

4. **`tsconfig.tsbuildinfo` and `website/tmp/` `.gitignore` additions.** F-series efficiency-and-stewardship; consolidate with the Jest configuration session.

5. **Founder calendar consolidation** for cryptographic-key reminders. F-series efficiency-and-stewardship; same session as above.

6. **Plugin-manifest `signing_keys` block schema for the multi-key case.** Deferred to Stage 3 C1; A4 has committed the substrate side (current + previous published via API discovery during overlap). C1 implements the plugin-manifest matching schema.

7. **Verifier-side helper API surface for multi-key verification.** Deferred to Stage 3 B1; the open Layer 1 reference will expose `verifyLayer2Assessment(signedAssessment, knownKeys[]): boolean` once B1 lands.

8. **Telemetry for previous-slot usage during rotation overlap.** Out of scope for A4; revisit at first scheduled rotation post-event (2026-09-06) when observed verifier behaviour can inform telemetry design.

9. **Encryption-key rotation runbook** mirroring this A4 pattern. F-series; future Standard-risk governance session can produce `/operations/runbooks/mentor-encryption-key-rotation.md` mirroring this ADR's structure.

---

## Founder Verification (Between Sessions)

Step-by-step in your own terminal (not in this Cowork session):

```bash
cd "/Users/clintonaitkenhead/Claude-work/PROJECTS/sagereasoning"

# 1. Confirm session-close commit + A4 wiring commit are on origin/main
git log --oneline -5 origin/main
# Expected: most recent commit = the session-close commit (decision-log entry +
# this close); preceded by the A4 wiring commit (the four files); preceded
# in turn by the A3 session-close commit and earlier history.

# 2. Confirm the new files exist
ls adopted/ADR-A4-key-management.md
ls operations/runbooks/substrate-layer2-key-rotation.md
ls website/src/app/api/public-key/__tests__/public-key-route.test.ts
# Expected: each command lists its file; no errors.

# 3. Confirm decision-log entry was appended
grep -nE "^## 2026-05-10 — D-A4-KEY-MANAGEMENT-WIRED-VERIFIED-2026-05-10" operations/decision-log.md
# Expected: one hit at the bottom of the active log.

# 4. Optional governance verification (re-runs the steady-state check;
#    confirms the deploy is stable post-session)
curl -s https://www.sagereasoning.com/api/public-key | python3 -c "
import json, sys
d = json.load(sys.stdin)
ok = d.get('previous') is None and d.get('rotation_overlap_until') is None and d.get('algorithm') == 'Ed25519'
print('PASS — A4 steady state preserved (key_id={})'.format(d['key_id']) if ok else 'FAIL — state regression: ' + str({k: d.get(k) for k in ['previous','rotation_overlap_until','algorithm']}))
"
# Expected: PASS line.

# 5. Optional cleanup of session scratch files
rm -rf website/tmp
git checkout -- website/tsconfig.tsbuildinfo 2>&1 || true
# Expected: tmp directory removed; tsconfig.tsbuildinfo reverted (or unchanged
# if not modified at session close). Both are F-series stewardship items
# planned for `.gitignore` addition at a routine governance session.

# 6. Founder calendar: add a reminder for Sunday 2026-09-06.
#    Title: "Substrate Layer 2 key rotation — first scheduled rotation per
#    ADR-A4 Decision 4. Run /operations/runbooks/substrate-layer2-key-rotation.md."
#    Calendar event is the founder's responsibility; not in git.
```

Expected: all four "Confirm" steps return their expected lines; the optional governance curl returns PASS. If any fails, A4 may have regressed; engage Path A rollback (un-set the four `SUBSTRATE_LAYER2_PREVIOUS_*` env vars in Vercel + redeploy, though they should already be unset post-session) and report at next session open.

**Session-close commit** — this is the second commit to push (the first was the A4 wiring commit at Step 9):

```bash
cd "/Users/clintonaitkenhead/Claude-work/PROJECTS/sagereasoning"
git add operations/decision-log.md operations/handoffs/founder/2026-05-10-stage-1-a4-key-management-close.md
git commit -m "Stage 1 A4 Verified: decision-log entry + close

D-A4-KEY-MANAGEMENT-WIRED-VERIFIED-2026-05-10 appended (full-form per
Critical session). Stage 1 item A4 reaches Verified on /api/public-key
with three production verification scenarios passed:
  - Scenario 1 (no rotation in progress): previous=null +
    rotation_overlap_until=null; existing behaviour preserved with
    zero regression.
  - Scenario 2 (rotation in progress; four test env vars set):
    previous block populated correctly with all four fields;
    rotation_overlap_until mirrors previous.retires_at exactly.
  - Scenario 3 (partial state; one of four env vars unset):
    previous=null + rotation_overlap_until=null; fail-safe posture
    confirmed.

A4 implementation status: Designed -> Scaffolded -> Wired -> Verified
within one session (mirroring the A3 precedent).

Session close (full-form per Critical session) at
operations/handoffs/founder/2026-05-10-stage-1-a4-key-management-close.md.

Production state: SUBSTRATE_LAYER2_PREVIOUS_* env vars all UNSET at
session close (test values from Step 10 cleaned up). /api/public-key
returns the steady-state shape (previous=null, rotation_overlap_until=null)
with key_id=substrate-layer2-2026Q2. Path A rollback (un-set the four
previous-key env vars + Vercel redeploy) remains available at <30s
recovery.

Founder calendar reminder pending for Sunday 2026-09-06: first scheduled
rotation per ADR-A4 Decision 4.

Next session: A5 — Layer 3 server-side service (Critical risk per AC5;
the R20a deterministic injection sits inside Layer 3)."
```

Then push via GitHub Desktop. The session-close commit only touches `/operations/` paths; Vercel will not redeploy from this commit.

---

## Next Session Should

The next session is **Stage 1 item A5 — Layer 3 server-side service** (Critical risk per AC5).

**Pre-conditions:**
1. Founder has staged + committed + pushed this session-close commit per the Founder Verification block above.
2. A4 implementation status remains Verified on `/api/public-key` (between-session governance verification confirms — see Founder Verification step 4 above).
3. All four `SUBSTRATE_LAYER2_PREVIOUS_*` env vars remain UNSET in Vercel (steady-state production posture).
4. Founder calendar reminder for 2026-09-06 set per Founder Verification step 6.
5. Optional: F-series stewardship items addressed at a routine governance session before A5 begins (Jest configuration; `.gitignore` additions; founder calendar consolidation; T-series promotions). Not blocking for A5 but recommended for stewardship hygiene.

**Scope of A5 (initial scoping; AI will surface design choices at A5 session-open):**

- Build the Layer 3 server-side service that generates prose from Layer 2's authoritative output. Per A3 ADR §"The moat boundary": Layer 3 is the per-consumer prose adaptation layer (`prose_mode` parameter) that closes the substrate's three-layer architecture.
- **R20a deterministic injection sits inside Layer 3.** Per the substrate ADR's three-layer R20a defence (Decision 3): in-plugin script (fast local) + server-side gate (compliance) + Layer 3 deterministic injection (final enforcement). A5 implements the third layer.
- A5 risk classification: **Critical** per AC5 (R20a perimeter — direct).
- PR1 single-endpoint proof on a single endpoint first; full Critical Change Protocol applies; AI drafts CCP responses ahead of time inside the A5 ADR per the T-A3-NEW-1 pattern (now reaching cumulative count 3+; eligible for process-rule promotion).
- A5 + A7 (server-side R20a gate) together complete the three-layer R20a defence's server-side portion.

**Estimated A5 duration:** 3-5 hours (Critical risk; ADR drafting + scaffolding + Critical Change Protocol writeups + founder explicit approval + PR1 single-endpoint proof + verification scenarios on the proof endpoint).

After A5 reaches Verified, the build arc proceeds to **A7 — Server-side R20a gate** (Critical per AC5 + PR6).

---

## Blocked On

**Founder action required before next session begins:**

1. Stage and commit the session-close commit per the Founder Verification block above. This appends the decision-log entry + this close.
2. Push via GitHub Desktop (one push for this single commit).
3. Optional: cleanup of `website/tmp/` and `website/tsconfig.tsbuildinfo` per Founder Verification step 5.
4. Add calendar reminder for Sunday 2026-09-06 per Founder Verification step 6.
5. Optional: between-sessions verification curl per Founder Verification step 4. If it fails, engage Path A rollback (un-set four previous-key env vars + Vercel redeploy; though they should already be unset) and report at next session open.

**Files remaining uncommitted (after this session's wiring commit at Step 9):**
- `operations/decision-log.md` (D-A4-KEY-MANAGEMENT-WIRED-VERIFIED-2026-05-10 appended)
- `operations/handoffs/founder/2026-05-10-stage-1-a4-key-management-close.md` (this file)

**Files untracked at session close (founder may handle separately):**
- `operations/handoffs/founder/2026-05-10-stage-1-a4-key-management-NEXT-SESSION-PROMPT.md` (the session prompt, saved to disk by founder for reference; commit separately or leave untracked)
- `website/tmp/a4-smoke-test.ts` (session scratch; clean up per Founder Verification step 5)

**Production state at session close:** A4 Verified and live at `/api/public-key`. Production steady state: all four `SUBSTRATE_LAYER2_PREVIOUS_*` env vars UNSET. The endpoint serves the same shape as before A4 (`previous: null`, `rotation_overlap_until: null`) until a real rotation begins (first scheduled Sunday 2026-09-06 per ADR-A4 Decision 4). Vercel state: latest deploy is the post-cleanup deploy. AC7 disposition: A1 plugin-auth + A2 input-validation + A3 signing + A4 key-management surfaces all Verified and operational. The site is in a stable, known-good state with the rotation contract now operationally exercisable.

---

## Orchestration Reminder

Per the standing cache and the build-arc cache: the next session's open block reads (1) the standing cache, (2) the build-arc cache, (3) this close, (4) the predecessor A3 closes (`/operations/handoffs/founder/2026-05-10-stage-1-a3-wired-verified-close.md` + `/operations/handoffs/founder/2026-05-10-stage-1-a3-adr-adopted-close.md`), (5) the A3 ADR `/adopted/ADR-layer2-signing-infrastructure.md` (still relevant — A5 builds on the substrate's Layer 2 + Layer 3 architecture), (6) the substrate ADR `/adopted/ADR-stoic-agent-substrate-concept.md` (especially §"The moat boundary" and §"Three-layer R20a defence"), (7) the last 3 decision-log entries (this session's `D-A4-KEY-MANAGEMENT-WIRED-VERIFIED-2026-05-10` + `D-A3-LAYER2-SIGNING-WIRED-VERIFIED-2026-05-10` + `D-A3-LAYER2-SIGNING-ADR-ADOPTED-2026-05-10`), (8) the existing Layer 3 surface in the codebase (the bundled-prose path — A5 designs the translation-sandwich Layer 3 service that replaces it for substrate-originated calls).

The next session is **Critical-tier** by default (R20a perimeter — direct; Layer 3 carries the deterministic distress injection per the three-layer R20a defence). Full Critical Change Protocol writeups apply to any code change. The AI should draft the CCP responses ahead of time inside the A5 ADR per the T-A3-NEW-1 pattern (third confirmed application across the build arc; eligible for process-rule promotion at a separate routine governance session per Rule B).

**The PR8 third-recurrence eligibility for T-AT-LEAST-NEW-1** (three-scenario verification methodology, now FOURTH confirmed application) and **T-A3-NEW-1** (CCP pre-drafted in ADR, now THIRD confirmed application) and **T-A3-NEW-2** (ADR commits Critical-classification of eventual scaffolding session, now THIRD confirmed application) are all recorded above in the T-series register. Recommendation per Rule B: do not promote within A5 itself; promote at a separate routine governance session after a sleep cycle. The recommended session also clears the F-series stewardship items (`.gitignore` for `tsconfig.tsbuildinfo` + `website/tmp/`; Jest configuration; founder calendar consolidation).

The new T-series findings this session (T-A4-NEW-1 git-mv-fails-on-untracked-files; T-A4-NEW-2 multi-step-Vercel-UI-needs-founder-paced-blocks; T-A4-NEW-3 implementation-refinements-surface-during-code) are at first observation; logged for re-recurrence tracking.

The new F-series stewardship findings this session (`tsconfig.tsbuildinfo` gitignore; `website/tmp/` gitignore; multi-step Vercel UI navigation-friction risk for the rotation runbook) are absorbed into ongoing steady-state maintenance per PR9 efficiency-and-stewardship tier.

The four-env-var refinement (T-A4-NEW-3) demonstrates the principle: the prompt's framing of Choice 2(a) was "two env vars" (later refined to three then four during implementation deliberation); the ADR captures the refinement with reasoning so the architectural record reflects what was actually built. This pattern may recur whenever code-level details surface implementation requirements that prompt-level deliberation didn't anticipate.

---

## Cross-references

- Predecessor close: `/operations/handoffs/founder/2026-05-10-stage-1-a3-wired-verified-close.md`
- This session's prompt: pasted in conversation by founder; saved to disk at `/operations/handoffs/founder/2026-05-10-stage-1-a4-key-management-NEXT-SESSION-PROMPT.md` (untracked at session close)
- A4 ADR (the architectural anchor for this session): `/adopted/ADR-A4-key-management.md`
- A3 ADR (the rotation contract A4 operationalises): `/adopted/ADR-layer2-signing-infrastructure.md` §Decision 4
- Substrate ADR (architectural anchor for the moat): `/adopted/ADR-stoic-agent-substrate-concept.md` §"The moat boundary"
- Cryptographic-precedent ADR: `/adopted/ADR-ENCRYPTION-WIRING-01.md` §Decision 4 Option 4A + §Decision 5 (key-custody and rollback discipline mirrored by the rotation runbook)
- Adopted staging plan: `/adopted/substrate-plugin-staging-plan.md` Stage 1 item A4 (success criteria SATISFIED; A4 implementation status: Designed → Scaffolded → Wired → Verified within this session)
- Build-arc cache: `/adopted/build-sessions-protocol-cache.md`
- Standing protocol cache: `/adopted/standing-protocol-cache.md`
- Decision-log entry appended this session: `D-A4-KEY-MANAGEMENT-WIRED-VERIFIED-2026-05-10`
- Companion canonical references:
  - `D-A3-LAYER2-SIGNING-WIRED-VERIFIED-2026-05-10` (the substrate's signing surface A4 extends with rotation support)
  - `D-A3-LAYER2-SIGNING-ADR-ADOPTED-2026-05-10` (the A3 ADR with §Decision 4 rotation contract)
  - `D-STAGING-PLAN-ADOPTED-2026-05-10` (Stage 1 A4 commitment)
- New code/test files this session:
  - `/website/src/app/api/public-key/__tests__/public-key-route.test.ts`
- Modified code files this session:
  - `/website/src/app/api/public-key/route.ts` (resolvePreviousKey() helper + GET handler extension)
- New operational documentation this session:
  - `/operations/runbooks/substrate-layer2-key-rotation.md`
- New ADR this session:
  - `/adopted/ADR-A4-key-management.md` (moved from `/drafts/` per Path A)
- Vercel state at session close (founder action; not in git):
  - All four `SUBSTRATE_LAYER2_PREVIOUS_*` env vars UNSET (steady-state production posture)
  - The four env vars `SUBSTRATE_LAYER2_SIGNING_KEY` + `SUBSTRATE_LAYER2_PUBLIC_KEY` + `SUBSTRATE_LAYER2_KEY_ID` + `SUBSTRATE_LAYER2_KEY_ISSUED_AT` remain unchanged from A3
  - Founder calendar reminder pending for Sunday 2026-09-06 (founder action between sessions)
- Cryptographic-precedent files (read at session-open per Orchestration Reminder above):
  - `/website/src/lib/translation-sandwich/tier1-token.ts` (env-var-at-call-time discipline mirrored)
  - `/website/src/lib/server-encryption.ts` (rotation-ready `version` field pattern mirrored conceptually for the previous-slot)
  - `/website/src/app/api/reason/route.ts` lines 215–278 (`checkPluginAuth` constant-time-comparison precedent)

*End of session close. The build arc has crossed the second critical-path threshold of Stage 1: A4 — Key Management Verified. The substrate's quarterly rotation contract committed in the A3 ADR §Decision 4 is now operationally exercisable — the `/api/public-key` endpoint can publish a previous key during a 30-day overlap window, controlled by four optional env vars; a founder-performable runbook documents the 9-step procedure plus an off-cycle (compromise-suspected) variant plus three rollback paths; the first scheduled rotation lands Sunday 2026-09-06. The four design choices committed in the A4 ADR (rehearse-now dry-run; four-env-var refinement; markdown runbook at `/operations/runbooks/`; first rotation 2026-09-06) translated cleanly into implementation; three production verification scenarios confirmed the discipline at the boundary. Next: A5 — Layer 3 server-side service (Critical risk per AC5; R20a deterministic injection lives inside Layer 3).*
