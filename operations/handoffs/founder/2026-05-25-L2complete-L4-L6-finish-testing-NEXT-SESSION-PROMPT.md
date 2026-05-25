# Next-Session Prompt — Finish the Positive Scenarios: L2-complete, L4 (Seam S1), L6 (full suite)

**Stream:** founder.
**Tier:** `code-standard` — **Standard** risk. The harness is test scaffolding under `website/scripts/whole-system-harness/` (outside `src/`, never bundled, never deployed); it runs against the **TEST** environment only. **No production code, schema, env, or deploy is touched.** Critical Change Protocol NOT engaged. PR6 NOT engaged. KG1: the runners call endpoints over HTTP and import only *pure* modules; if you elect a path that imports a DB-write module directly (e.g. a pure `buildDiscoveredPurpose` step is fine, but a direct store read/write is not), KG1 engages — call it out.
**Governing frame:** `/adopted/standing-protocol-cache.md` + `/adopted/build-sessions-protocol-cache.md` ("no current users" holds — founder + test logins only).
**Predecessor close:** `/operations/handoffs/founder/2026-05-25-L1-L5-clean-scenarios-build-close.md` (read its **Verification Outcome** + **Post-commit** addenda).
**Predecessor decision-log entries:** `D-L1-L5-CLEAN-SCENARIOS-BUILD-2026-05-25` (read its **Verification + post-commit update**); `D-L7-AGENT-NATIVE-RERUN-STEP7-COMPLETE-2026-05-25`; `D-L7-SINGLE-LOOP-PROOF-LIVE-VERIFIED-2026-05-25`.

## Why this session matters

L1, L2-incomplete, L3, L5, and L7 are **Verified live** on the standing test env. This session finishes the **positive** scenario matrix — the three that were deferred because they hinge on the five-slot `DiscoveredPurpose`: **L2-complete** (Calling approved path), **L4** (Seam S1 — five-spec → Layer 1), and **L6** (the full four-seam loop). Completing these closes 0h-criterion-4's value-demonstration coverage across every supported single-product and combination configuration. It does **not** build **Combination 2** (blocked on Priority 4 disclaimer text) or **C2** (the R20a distress perimeter — Critical-tier, a separate Critical session).

## Opening decision — the approval-seam election (settle this at open)

The five-slot `DiscoveredPurpose` that L2-complete and L4 need is **not** produced by `/api/calling` (which stops at the Hard Gate, `status: 'awaiting_approval'`). It is built only on the approved path, two possible ways. **Pick one before building** (founder elects; the AI states which Anthropic primitive was considered per PR15, then executes):

- **Option A — pure `tsx` step (recommended for the first pass).** Drive `/api/calling` (Bearer) to the Hard Gate, then run `buildDiscoveredPurpose(response_history, role_hint)` as a pure `tsx` step (it's an exported pure function in `calling-service.ts`, the same shape as the proven Seam-2 `bridge-step.ts`). The `response_history` comes from a **founder-run DB read** of the session row in the test project (consistent with how S3/L5 was verified). Asserts the five-spec **assembly** + (in L4) survival into Layer 1. Does **not** exercise the admin gate — fine, because the gate (D-14 admin-only) is not what S1 tests; the five-spec assembly + the Layer-1 thread is. No admin credential, no new flags.
- **Option B — admin HTTP approve route (higher fidelity).** Call `POST /api/calling/approve` with **admin Supabase auth** (`requireAdmin` / `ADMIN_USER_ID`); the response returns `discovered_purpose` directly. Exercises the real gate end-to-end. Requires you to supply an **admin session token** to the harness (a credential the `sr_assent_` bearer is not) — more setup.

**AI recommendation:** Option A for this pass (no new auth machinery; mirrors the bridge-step + the founder-runs-SQL pattern). Option B is the better choice if you want the admin gate itself exercised — note it as a follow-up either way.

The same fork applies to **L4's Layer-1 thread**: the five-spec reaches Layer 1 as a `Layer1Schema.discovered_purpose` field, consumed only on the **plugin-auth** path — **not** a body field on `/api/reason`'s agent path. So L4 is either a **pure `tsx` step** (`validateLayer1Schema` over a `Layer1Schema` carrying the `DiscoveredPurpose` — recommended; directly proves "five slots survive the Layer 1 schema, no dropped slot") **or** a plugin-auth HTTP call (needs `PLUGIN_AUTH_ENABLED='true'` + `PLUGIN_AUTH_SECRET` set in the test env). Recommend pure `tsx` for the first pass.

## Locked context — do NOT re-derive

- **The test env is standing** (built 2026-05-25): test Supabase project `iwdtrvuphogkwmovhnvz`; test Ed25519 key-pair; two seeded `api_keys`/`sr_assent_` credentials; `website/.env.local` on the test project (signing/gate/Layer-3 on; `SUBSTRATE_R20A_GATE_ENABLED` intentionally UNSET — C2 deferred). **The test project now ALSO carries the A1 `sage_reflect_sessions` columns** (`complexity`, `calibration_all_correct`) applied during L3/L5 verification — Reflect completion works from the start. **Production untouched.** Restore prod local dev only when ALL testing is done: `cp website/.env.local.prod-backup-2026-05-24 website/.env.local`.
- **The harness + its `lib/` are proven.** `website/scripts/whole-system-harness/` — reuse:
  - `lib/http-client.ts` — `postReason` (X-Api-Key), `postAccreditation` / `postCalling` / `postReflect` (Bearer `sr_assent_`), `getPublicKey`.
  - `lib/reflect-driver.ts` — **adaptive** Reflect dialogue driver (proven in L3/L5). Reuse verbatim for L6's S3 leg.
  - `lib/bridge-step.ts` — the Seam-2 bridge `tsx` step (proven in L7). Reuse for L6's S2 bridge.
  - `lib/assertions.ts`, `lib/capture.ts` (generalised to any scenario label), `lib/fixtures.ts`, `lib/scenario-input.ts`.
  - Build a **`calling-driver`** for L2-complete/L6 the same way `reflect-driver` was built: adaptive, answers whatever `stage` the engine surfaces, but steered to the **Hard Gate** (`awaiting_approval`) with "complete" answers (the mirror of `run-l2.ts`'s incomplete answers). To reach the gate: Q1 grounded → Q2 evidence-grounded → Q3 **independence-affirmed** (use independent-evidence markers: `observed`, `documented`, `reported`, `independently`, `exists regardless`, `measurable`) → Q4 commitment (`i commit`, `i am ready`, `i will take`) → Q5 act-committed (`i will start by`, `the first act is`, `i commit to`). Read `engine.ts` `nextStep` + the marker sets to author these (deterministic, no LLM — the engine matches plain substrings with NO negation handling, so avoid disqualifying substrings).
- **Auth per endpoint (verified by code-read; diagnostic-certain):** `/api/reason` → `X-Api-Key` (`WSH_API_KEY`, `sr_live_`). `/api/calling`, `/api/accreditation/[id]`, `/api/practice/reflect` → `Authorization: Bearer sr_assent_…` (`WSH_ASSENT_TOKEN`, bound to `wsh-test-agent-L7`). `/api/calling/approve` → **admin Supabase auth** (Option B only). The two existing credentials cover L2-complete/L4/L6's HTTP calls — no re-minting.
- **The seed-409 wrinkle (L6):** the genuine credential write in L6 does a real accreditation **seed** for `wsh-test-agent-L7`, which already has a row (from L7 + L5) → **409**. Run the one-line teardown first: `delete from public.agent_accreditation where agent_id='wsh-test-agent-L7';` (its `grade_history` cascades). Then the seed writes fresh.
- **Scenario specs:** `data-room/04_test_brief/scenario-matrix.md` (L2/L4/L6 rows) + `test-brief.md` §B (S1/S2/S3/S4 criteria) + `03_seam_map/seam-map.md`. AGENT-NATIVE framing is a standing requirement (no emotion words; `lib/scenario-input.ts` is the reference style).
- **Branch:** `main`. The AI does **no** git operations; clear any `.git/index.lock` host-side.
- **Production state:** UNCHANGED. Provenance gate Live; rollback (unset `SUBSTRATE_PROVENANCE_GATE_ENABLED` + redeploy) unchanged and independent.

## Lessons carried from the L1–L5 session (apply these)

1. **Verify with `npx tsc --noEmit`, not only `npx tsx`.** `tsx` runs the code but strips types without type-checking; a type-only error will pass `tsx` and then fail the pre-commit hook (which runs `cd website && npx tsc --noEmit`) and the Vercel build. Run `npx tsc --noEmit` (full project) before declaring any harness change done. (A TS7022 inference cycle slipped through once for exactly this reason.)
2. **Test-env-clone-gap reflex.** If a live call 503s at a write step, the cause is usually a column/table the structure-only clone never received. Read the **Terminal 1 dev-server log** for the `… does not exist` line (the HTTP 503 is deliberately vague, R4), then apply the missing migration to the **TEST** project. (L4 pure-`tsx` + the proven L6 write paths shouldn't hit this — the Reflect completion path and the `/api/accreditation` write are already proven against the test env — but keep the reflex.)
3. **Adaptive drivers, not fixed scripts.** Engines branch; the driver should answer whatever step is surfaced and loop to the target terminal. Reuse `reflect-driver`; build `calling-driver` the same way.
4. **Clean up throwaway build-only/dry-preview ledgers** from `data-room/05_outputs/` (file deletion is enabled for the folder). Keep only real live-run ledgers.

## Pre-conditions (confirm at open)

1. **Test env standing.** Terminal 1 (`npm run dev` in `website/`, reading the test `.env.local`) up, or restart it; quick re-confirm: `GET http://localhost:3000/api/public-key` → `key_id: substrate-layer2-test`. Terminal 2 has the `WSH_…` exports, or re-export them.
2. **`.env.local` still points at the test project** (`grep -c jdbefwkonfbhjquozgxr website/.env.local` → 0; `grep -c iwdtrvuphogkwmovhnvz website/.env.local` → 2).
3. Working tree clean of unintended changes; on `main`.

## Part A — Open under the protocol

Read in order:
1. `/adopted/standing-protocol-cache.md` (~3 min — tier, status vocabulary, model selection per AC1, lean templates, risk class).
2. `/adopted/build-sessions-protocol-cache.md` (build-arc context).
3. `/operations/handoffs/founder/2026-05-25-L1-L5-clean-scenarios-build-close.md` (predecessor close + its two addenda).
4. `data-room/04_test_brief/scenario-matrix.md` (L2/L4/L6 rows) + `test-brief.md` §B + `website/scripts/whole-system-harness/README.md` (the L1–L6 build section).
5. `/operations/decision-log.md` — the three predecessor entries named above.

**PR15 consult (before any bespoke build):** L2-complete/L4/L6 extend the *existing* harness `lib/` + the repo's plain-`tsx` assertion pattern — not greenfield. State the Anthropic-primitive consideration before writing code. Confirm at open: tier; branch; test-env-standing; status vocabulary; model selection (the test env's `/api/reason` uses Sonnet L1/L3 + Haiku quick per AC1 — no model choice is the harness's to make).

## Part B — Procedure (PR1: one scenario at a time, Verified before the next)

**Step 0 — settle the approval-seam election (above) + build the `calling-driver`.** Read `engine.ts` `nextStep` + the marker sets; author the "complete-path" stage answers that reach the Hard Gate. Code-read `buildDiscoveredPurpose` (calling-service.ts §D-5) + `validateLayer1Schema` + the `Layer1Schema.discovered_purpose` shape (layer1-extractor.ts) so the pure-`tsx` steps are grounded (diagnostic-certain). Run `npx tsc --noEmit` after building the driver.

**Then build + run, one at a time (each to Verified, capturing a ledger to `data-room/05_outputs/`):**

- **L2-complete — Calling approved path.** Drive `/api/calling` (Bearer) to `awaiting_approval`. Then per the elected option produce the `DiscoveredPurpose`. Assert: the five slots (`work`; `capacity`; `circle_and_obligation{circle, obligation}`; `first_appropriate_act`; `role`) are present and carry the **agent's own words** (verbatim from the dialogue), with **no dropped/mis-slotted slot**. (Ties to scenario-matrix L2 + seam-map S1 (a)/(c).)
- **L4 — Calling + Reasoning (Seam S1).** Take L2-complete's `DiscoveredPurpose` → thread into Layer 1 (pure `tsx` `validateLayer1Schema`, or plugin-auth HTTP). Assert **all five slots survive into the Layer 1 schema** (print the five input slots beside what Layer 1 received, for founder comparison). (Ties to §B **S1** + seam-map S1 (a)+(b).)
- **L6 — Full suite (S1, S2, S3, S4).** Run the teardown first (seed-409). Then: Calling (approved → `DiscoveredPurpose`) [S1] → `/api/reason` (thread the discovered_purpose via the elected mechanism) → genuine credential write to `/api/accreditation/[id]` (the L7-proven genuine→200 recipe) [S2] **+ the Seam-2 bridge `tsx` step** on the same signed assessment [S2] → Reflect (open + drive with `reflect-driver`, Q4 review) [S3] → consume the `exit_path` ('sage_reasoning' → re-enter `/api/reason`; 'sage_calling' → re-enter `/api/calling`) [S4]. Assert each seam's §B criterion **in sequence**, and that **S4 actually closes the loop** — the `exit_path` is acted on (re-entered), not merely correct as a string. Keep `TRANSLATION_SANDWICH_PARALLEL_RUN='false'`.

**Step N — Verify (PEV, PR10).** Per scenario: assertions green + ledger written; for L6's S2 (genuine write) and S3 (feed), the founder runs the DB-query check (provide the exact SQL — reuse the L5 `agent_accreditation` / `evaluated_actions` / `grade_history` queries, `order by occurred_at` for `grade_history`). Classify diagnostic certainty. Run `npx tsc --noEmit` before declaring done.

**Step N+1 — Append decision-log entry (lean form)** per `/adopted/standing-protocol-cache.md` §"Lean decision-log entry". Record which of L2-complete/L4/L6 reached Verified + the `05_outputs/` artefact paths + the elected approval-seam option.

**Step N+2 — Session close (lean form)** per the cache. Founder commit commands (stage by name — the new runner(s) + `lib/calling-driver.ts` + the `05_outputs/` ledgers; do **not** `git add .`; do not stage `website/.env.local*`, `website/tsconfig.tsbuildinfo`, or `website/src/data/environmental-context.json`). No Vercel behaviour change (test scaffolding is never bundled).

## Part C — Anticipated session shape

| Phase | Estimate |
|---|---|
| Caches + predecessor close + scenario rows + README read | 15–20 min |
| Step 0 (approval-seam election; `calling-driver`; code-read assembly/validator) | 45–60 min |
| L2-complete (drive to gate + produce + assert five slots) | 45–60 min |
| L4 (S1 thread + five-slot survival) | 30–45 min |
| L6 (full suite; teardown + bridge + loop close; 4 seams in sequence) | 60–90 min |
| `tsc --noEmit` + decision-log + close | 30–40 min |
| **Total** | **~3.5–5 hours** (split across sittings if needed; each scenario is an independent checkpoint) |

## Rollback

Test scaffolding only — nothing deployed, nothing in production to roll back. New runner/`lib` files are additive (delete host-side if abandoned). The test env writes only to the test Supabase project. The L6 teardown is the documented one-liner (its `grade_history` cascades). Restore production local dev when all testing is done: `cp website/.env.local.prod-backup-2026-05-24 website/.env.local`.

## Forecast

Success = L2-complete, L4, and L6 each run green against the test env, captured in `data-room/05_outputs/`, completing the **positive** scenario coverage on the proven pattern. After this: **Combination 2** (once Priority 4 writes the no-practice disclaimer text), **C2** (the distress perimeter — a Critical session), and then the harness becomes the control-vs-treatment rig for the "is the agent better *with* the substrate?" comparison.

End of prompt. Opens on `main`; build + run against the **TEST** environment only — production is unchanged by this session.
