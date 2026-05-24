# Next-Session Prompt — Data Room: Combination-1 → Passing (+ optional first manual loop)

**Stream:** founder.
**Tier:** `governance` — workspace + documentation on the `whole-system-data-room` branch. **Standard** risk. **No production code, schema, env, or deploy touched.** Critical Change Protocol NOT engaged. PR6 NOT engaged. KG1 NOT engaged.
**Governing frame:** `/adopted/standing-protocol-cache.md` + `/adopted/build-sessions-protocol-cache.md`.
**Predecessor session close:** `/operations/handoffs/founder/2026-05-24-sage-assent-provenance-gate-build-close.md` (the gate build).
**Predecessor decision-log entry:** `D-SAGE-ASSENT-PROVENANCE-GATE-BUILD-WIRED-VERIFIED-2026-05-24`.

## Why this session matters
The Sage Assent provenance gate (R18f, option (a)) is now **Live and verified in production** (2026-05-24): a token-authenticated credential write with no signed provenance returns **422 `bad_provenance`**, and a forged one returns **403 `no_examination`**. So the whole-system data room's headline negative test — **Combination 1 (Sage Assent without SageReasoning)** — has flipped from a *documented gap* to something the live system actually prevents. This session records that in the data room, and (optionally) runs the first manual end-to-end loop the room was built for (hold-point 0h criterion 4).

## Locked context — production + build state (do NOT re-derive)
- **Gate Live.** `SUBSTRATE_PROVENANCE_GATE_ENABLED='true'` in Vercel (Production). Verified 2026-05-24: no-provenance write → **422 `bad_provenance`**. **Rollback = unset that flag + redeploy** (one toggle, no code change).
- **Gate code is on `main`** (committed + deployed): `website/src/lib/translation-sandwich/layer2-verifier.ts`; `website/src/app/api/accreditation/[agent_id]/{provenance-contract.ts, provenance-gate.ts}`; the wired `route.ts` + `response-builders.ts`; their tests (45 assertions); + the decision-log entry.
- **The data room is on the `whole-system-data-room` branch** (created off `e0278ab`, i.e. *before* the gate), so the branch is now behind `main`. **Branch handling is a founder call at open (Pre-condition 1).** Keep ALL git operations host-side — the sandbox cannot do git working-tree ops; an earlier in-sandbox `git checkout` left a stale `.git/index.lock` that needed clearing host-side.
- **Canonical domain:** `https://www.sagereasoning.com` (the bare apex 307-redirects to www; always use `www`).
- **A test write-credential exists** for `agent_provtest_v1` (`sr_assent_…`, unscoped) from the gate verification. Harmless. No accreditation row was written (the gate rejected before the writer). Optional cleanup: `DELETE https://www.sagereasoning.com/api/admin/accreditation-credentials?id=<CRED_ID>` with your admin Supabase bearer token.
- **Token facts:** write-token prefix is `sr_assent_` (the older `sr_atl_` was renamed); admin-mint `purpose` must be `sage_assent_write`; admin auth = your Supabase access token (DevTools → Application → Local Storage → `sb-…-auth-token` → `access_token`).
- **Test-harness note (flagged, not yet fixed):** `layer2-signer.test.ts` + `layer2-canonical-json.test.ts` are Jest-style but Jest isn't installed → they don't run; the runnable convention is the plain-assertion `npx tsx` style (the new gate tests use it). `route.test.ts` needs `npx tsx --env-file=.env.local`. `CLAUDE.md`'s test-running notes are inaccurate on both — a candidate cleanup.

## Pre-conditions (confirm at open)
1. **Branch handling (founder call).** Options: (a) merge `main` into `whole-system-data-room` host-side so the room sits on top of the live gate; (b) just edit the room docs on the branch (the docs cite the production evidence + the `main` decision-log entry, which is safe regardless); or (c) merge the branch into `main` first and work on `main`. (a) or (c) give a single coherent trail; (b) is fine to keep moving. The AI confirms the checked-out branch before editing and does NO git ops itself.
2. Working tree clean; no `.git/index.lock` (clear host-side if present).
3. (Optional) gate still Live — re-run the 422 check from the predecessor close if you want reassurance.

## Part A — Open under the protocol
Read in order:
1. `/adopted/standing-protocol-cache.md` (~3 min — tier, status vocabulary, lean templates).
2. `/adopted/build-sessions-protocol-cache.md` (build-arc context).
3. `/operations/handoffs/founder/2026-05-24-sage-assent-provenance-gate-build-close.md` (the gate build close).
4. `/operations/decision-log.md` — `D-SAGE-ASSENT-PROVENANCE-GATE-BUILD-WIRED-VERIFIED-2026-05-24` + `D-WHOLE-SYSTEM-DATA-ROOM-BUILD-2026-05-24`.
5. The data room: `data-room/README.md`; `data-room/04_test_brief/test-brief.md` (the A.2 / S2-neg Combination-1 rows); `data-room/99_review/missing-context.md` (M-4).

Confirm at open: tier (`governance`/Standard); which branch is checked out; status vocabulary; that the gate is Live.

## Part B — Procedure
### Step 1 — Flip the Combination-1 rows to "passing"
In `data-room/04_test_brief/test-brief.md`, change the A.2 / S2-neg Combination-1 row(s) from "DOCUMENTS THE GAP" to a **passing assertion**, citing the 2026-05-24 production verification (gate Live; no-provenance write → 422 `bad_provenance`; forged → 403 `no_examination`) and `D-SAGE-ASSENT-PROVENANCE-GATE-BUILD-WIRED-VERIFIED-2026-05-24`.

### Step 2 — Resolve the gap record
In `data-room/99_review/missing-context.md`, mark **M-4** (the Combination-1 enforcement gap) resolved, citing the gate build + the production verification.

### Step 3 — Record the update
Append a lean decision-log entry — `D-DATA-ROOM-COMBINATION-1-PASSING-2026-05-24` — per `/adopted/standing-protocol-cache.md` §"Lean decision-log entry", recording the flip with the production evidence. (On whichever branch you settled in Pre-condition 1.)

### Step 4 (optional / stretch) — Run ONE manual loop (data-room Step 7)
Per `data-room/04_test_brief/test-brief.md` + `data-room/04_test_brief/test-flag-config.md`: run one **human-practitioner** journey + one **agent-developer** journey end-to-end against the live system; capture both into `data-room/05_outputs/` (0h criterion 4). The agent-developer journey's centrepiece is the **genuine → 200** provenance path: produce a real signed assessment via the substrate, then a credential write carrying it that the gate accepts. **No production code changes** — founder-run, AI-captured.

### Step 5 — Close (lean form)
Per `/adopted/standing-protocol-cache.md` §"Lean session close". Provide founder commit commands (stage files by name; `www` for any live checks).

## Part C — Anticipated shape
| Phase | Estimate |
|---|---|
| Caches + close + decision-log + data-room read | 15–20 min |
| Steps 1–3 (doc flip + gap resolve + record) | 30–45 min |
| Step 4 (manual loop, if elected) | 60–90 min |
| Close | 20–30 min |

## Rollback
Doc-only on a branch — nothing to roll back at runtime. The gate's own rollback (unset `SUBSTRATE_PROVENANCE_GATE_ENABLED` + redeploy) is unchanged and independent of this session.

## Forecast
Success = the data room records Combination-1 as a **passing** assertion with the production evidence; M-4 resolved; (optionally) one manual loop per audience captured in `05_outputs/` — the first end-to-end value demonstration the hold point (0h criterion 4) wants. After this: the broader hold-point exit criteria; or layer **(b)** `loop_id` → `loop_billing_events` defense-in-depth onto the gate (ADR revisit-condition 4); or schedule the **aggregate-faithfulness** closure (ADR revisit-condition 1) as its own decision.

End of prompt. Opens on the `whole-system-data-room` branch (confirm at open). Documentation/workspace only — the live gate is unchanged by this session.
