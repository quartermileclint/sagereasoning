# Session Close — 2026-06-14 — Trajectory & CI-4 activation, Part B2: the CI-4 loop-closure chain (6a → 6b detect)

**Stream:** founder.
**Governing frame:** `/adopted/standing-protocol-cache.md` + `/adopted/build-sessions-protocol-cache.md`. PR17 (every founder Vercel/Supabase step walked live). PR18 at close.
**Tier:** **`code-critical`** — env-flag activation of new production surfaces (full templates + Critical Change Protocol 0c-ii). **No application code shipped** (pure flag activation); one doc correction.
**Environment:** Claude Code on the founder's machine (production reachable). Model: Opus 4.8 (1M).
**Date:** 2026-06-14.
**Operative prompt:** `operations/handoffs/founder/2026-06-14-trajectory-and-ci4-activation-NEXT-SESSION-PROMPT.md` §Part B2.
**Predecessor close:** `operations/handoffs/founder/2026-06-14-trajectory-B1-activation-close.md` (the sibling chain; B1 closed Live same day).

## What this session did

Activated **Chain B2 — the CI-4 loop-closure affordance** — in its inviolable order. Both flags are now **Live in production**; reject mode (6c) is deferred.

- **6a — M5 reason-route (`SUBSTRATE_REASON_LOOP_CLOSURE_ENABLED=true`) — Live.** `/api/reason` now carries the re-examination affordance: a `prior_feedback` input, an `examination_open` response field on redirections, the **same-depth rule** (a re-examination runs at the original depth), and `examination.{ref,depth_tier,prior_feedback_ref}` markers placed **inside the signed assessment**. TEST-verified (consult #1 redirect → markers + `examination_open:true`; consult #2 same-depth carry, requested `quick` held at `standard`, `prior_feedback_ref` linked) and PROD-verified (markers nested in the signed wrapper `assessment.assessment.examination`; prod signing confirmed ON via `signature`+`key_id`; engine judgement otherwise unchanged).
- **6b — M3 write-boundary, DETECT mode (`SUBSTRATE_LOOP_CLOSURE_GATE_ENABLED=true`, `_REJECT` UNSET) — Live.** The accreditation write boundary now annotates `loop_closure` and flags unclosed chains; **it cannot reject** (detect mode). TEST live leg: unclosed chain → 200 + `verdict:"unclosed"` (write proceeded, not rejected); closed chain → 200 + `verdict:"closed"`. PROD: flag set; a synthetic-signature write 403'd at the **live R18f provenance gate** — confirming the loop-closure gate is correctly ordered behind it.
- **6c reject mode — deferred** (its own later step, only once real chains demonstrably close).
- **Prompt correction:** Step 6b's expected `enforced:false` corrected to **`enforced:true`** (detect mode = gate active; `enforced:false` is gate-OFF), citing `loop-closure-gate.ts:309`.

## Decisions Made
- `D-MECHANISM-CORRECTION-CI4-LOOP-CLOSURE-B2-ACTIVATION-2026-06-14` appended (full Critical form).

## Status Changes
| Item | Old | New |
|---|---|---|
| CI-4 reason-route half (6a) | Built dark (flag UNSET) | **Live in production** |
| CI-4 write-boundary gate (6b) | Built dark (flags UNSET) | **Live in production — detect mode** (`_REJECT` UNSET) |
| CI-4 reject mode (6c) | — | **Deferred** (its own later step) |
| Chain B2 | Not started | **Complete** |

## Verification Method Used
- Two path-check **workflows** with adversarial refutation: (a) the four CI-4 flag names + flag-off byte-identity + the load-bearing marker-ordering dependency; (b) the 6b gate's marker extraction against the **production signed-assessment shape** (`item.assessment.examination`, unwrapping the `{assessment,signature,key_id}` wrapper) — both adversarial probes failed to refute; the one successful refutation surfaced the `enforced:false→true` prompt correction.
- Assertion suites green at open: `reason-loop-closure.test.ts` 33/0, `loop-closure-gate.test.ts` 29/0, `tsc --noEmit` exit 0.
- **Live legs walked (PR17):** 6a TEST (2 consults) + PROD (1 consult); 6b TEST (2 accreditation writes) + PROD (flag set; the 403 confirming gate ordering).
- Direct DB probes (service-role, throwaway scripts removed after): TEST `agent_accreditation` columns present; admin profiles row present; credential locations (the env-leak diagnosis).

## Risk Classification Record
**Critical** under 0d-ii (env-flag activation of new surfaces). **AC7 not engaged** (signing algorithm/keys untouched; 6a adds an additive field to the signed payload only). **PR6 not engaged** (no R20a/distress/A5; substrate judgement unchanged). R18f provenance gate untouched + confirmed correctly ordered ahead of the loop-closure gate. Rollback per flag = unset (byte-identical).

## Incident (PR10 "I caused this")
Two `sr_assent_` credentials were mistakenly minted to **production** during the 6b TEST setup: Node's `--env-file` does **not** override already-`export`ed shell vars, so the prod-6a-teardown exports leaked into the TEST mint. Diagnosed via DB probe, both prod creds revoked (`is_active:false`), re-minted on TEST from a fresh terminal. Memory `mint-cli-env-file-export-leak` saved; verify the CLI `Target:` line on every mint/revoke.

## Next Session Should
There is **no required successor** — Chain B2 is complete and B1 is Live. Founder-elected, each its own step: **6c reject mode** (only once real chains close); the optional **CI-15 docs-flip**; the carried **M1 / M3-CI-11 / M4 / M5-CI-13** activations; the **credential-consolidation (CI-14)** Critical build; **CI-16** (parked); the **0h call**.

## Blocked On
**Files remaining uncommitted (founder commits by name; the AI did no git ops):**
- `operations/decision-log.md` (the B2 entry)
- `operations/handoffs/founder/2026-06-14-trajectory-ci4-B2-activation-close.md` (this file)
- `operations/handoffs/founder/2026-06-14-trajectory-and-ci4-activation-NEXT-SESSION-PROMPT.md` (the Step 6b `enforced` correction)
- `CLAUDE.md` (PR18 production-state refresh)
- **Exclude:** `website/tsconfig.tsbuildinfo`; never stage `.env*`.

**Production state at session close:** the **CI-4 loop-closure affordance is Live** — `SUBSTRATE_REASON_LOOP_CLOSURE_ENABLED=true` + `SUBSTRATE_LOOP_CLOSURE_GATE_ENABLED=true` (detect mode, `_REJECT` UNSET). B1 (trajectory) + the four R20a flags + CI-10 remain Live. No code/schema change this session (pure flag activation). **Production test artifacts (exclude from samples):** 1 `sr_live_` consult key minted-then-revoked (wrote 1 trajectory row + 1 `loop_billing_events` row, `retain_until`-swept in 90d); 2 `sr_assent_` creds mis-minted to prod then revoked; 1 `sr_assent_` prod-verify cred (revoking — see Founder Verification; no accreditation row written).

## Open Questions
- 6c reject mode; the genuine-signature end-to-end prod 6b proof (un-exercised by election); the `/api/reason` 429→401 masking (spawned task); TEST teardown (throwaway creds + TEST flags). See the decision-log entry's Open Questions for the full carried list (incl. the 0h call).

## Founder Verification (Between Sessions)
1. **Confirm the prod-verify credential is revoked:** the `agent_ci4_6b_prodverify` `sr_assent_` cred from prod Step 2 — `revoke assent --id <record_id> --reason "ci4-6b prod verify teardown"` (prod creds inline; verify `Target:` = prod). No SQL delete needed (the 403 wrote no row).
2. **Optional TEST teardown:** revoke the two TEST `sr_assent_` creds (`agent_ci4_6b_test`/`agent_ci4_6b_closed`) and/or remove the TEST flags from `.env.development.local` — all throwaway/TEST.
3. **Commit + push:**
```
cd "/Users/clintonaitkenhead/Claude-work/PROJECTS/sagereasoning"
git add operations/decision-log.md \
  "operations/handoffs/founder/2026-06-14-trajectory-ci4-B2-activation-close.md" \
  "operations/handoffs/founder/2026-06-14-trajectory-and-ci4-activation-NEXT-SESSION-PROMPT.md" \
  CLAUDE.md
git commit -m "Trajectory & CI-4 activation B2: CI-4 loop-closure chain Live (6a reason-route + 6b write-boundary detect) — decision log + close + PR18 + Step 6b enforced correction"
```
Then push via GitHub Desktop. **Vercel deploy is behaviourally inert** — no code/schema changed; the activation is the two Vercel env flags (already set + green).

## Orchestration Reminder
The Vercel env flags (`SUBSTRATE_REASON_LOOP_CLOSURE_ENABLED`, `SUBSTRATE_LOOP_CLOSURE_GATE_ENABLED`) live in production, not the repo. Rollback for either = unset in Vercel (byte-identical). The commit above carries documents only.

## Cross-references
- `D-MECHANISM-CORRECTION-CI4-LOOP-CLOSURE-B2-ACTIVATION-2026-06-14` (the authoritative record)
- `operations/handoffs/founder/2026-06-14-trajectory-B1-activation-close.md` (sibling chain)
- `operations/handoffs/founder/2026-06-14-trajectory-and-ci4-activation-NEXT-SESSION-PROMPT.md` §Part B2 (the operative prompt)
- The 6a build: `D-MECHANISM-CORRECTION-M5-PRACTICE-COMPLETION-BUILT-TEST-VERIFIED-2026-06-14`; the 6b build: `D-MECHANISM-CORRECTION-M3-ACCREDITATION-BUILT-TEST-VERIFIED-2026-06-13`

*End of session close. Chain B2 is complete: the CI-4 loop-closure affordance is Live (6a reason-route + 6b write-boundary detect mode); reject mode (6c) is deferred; the mechanism-correction arc's activation queue advances. Production judgement is byte-identical apart from the additive examination markers + the detect-mode annotation.*
