# Next-Session Prompt — Whole-System Test: Build + Run L1–L6 (on the proven L7 pattern, PR1)

**Stream:** founder.
**Tier:** `code-standard` — **Standard** risk. The harness is **test scaffolding** under `website/scripts/whole-system-harness/` (outside `src/`, never bundled, never deployed); it runs against the **TEST** environment only. **No production code, schema, env, or deploy touched.** Critical Change Protocol NOT engaged. PR6 NOT engaged. KG1 NOT engaged (the harness calls endpoints over HTTP and imports only *pure* modules; it writes no DB rows itself — the test endpoints write to the **test** project. If a runner is ever changed to import a DB-write module directly, KG1 engages then — call it out).
**Governing frame:** `/adopted/standing-protocol-cache.md` + `/adopted/build-sessions-protocol-cache.md` ("no current users" holds — founder + test logins only).
**Predecessor session close:** `/operations/handoffs/founder/2026-05-25-L7-live-verification-test-env-standup-close.md` (read its **Continuation** addendum).
**Predecessor decision-log entries:** `D-L7-AGENT-NATIVE-RERUN-STEP7-COMPLETE-2026-05-25`; `D-L7-SINGLE-LOOP-PROOF-LIVE-VERIFIED-2026-05-25`; `D-L7-SINGLE-LOOP-PROOF-BUILD-2026-05-24`; `D-WHOLE-SYSTEM-HARNESS-DESIGN-2026-05-24`.

## Why this session matters

L7 (Reasoning + Assent) is **LIVE-VERIFIED** on an agent-native input, and the Combination-1 negatives passed on the same env (the gate discriminates). This session builds the **remaining positive scenarios — L1 through L6 — on that proven pattern** (PR1: one at a time, each to Verified before the next), against the **standing** test environment. These complete the 0h-criterion-4 value demonstrations across the single-product and combination configurations. It does **not** build Combination 2 (blocked on Priority 4) or C2 (the distress perimeter — Critical-tier, a separate Critical session).

## Locked context — do NOT re-derive

- **The test environment is already standing** (built 2026-05-25): separate test Supabase project `iwdtrvuphogkwmovhnvz` (production `public` schema cloned, structure-only); test Ed25519 key-pair (verified matched pair); two seeded `api_keys` credentials; `website/.env.local` switched to the test project (signing/gate/Layer-3 on; `SUBSTRATE_R20A_GATE_ENABLED` intentionally UNSET — C2 deferred). **Production untouched.** Restore prod local dev only when ALL testing is done: `cp website/.env.local.prod-backup-2026-05-24 website/.env.local`.
- **The harness exists and its pattern is proven:** `website/scripts/whole-system-harness/` — `run-l7.ts`, `lib/{http-client,bridge-step,assertions,capture,fixtures,scenario-input}.ts`, `mint-test-credentials.ts`, `smoke-negatives.ts`, `README.md`. Reuse `lib/` (the assertion ledger, the fetch wrapper, capture-to-`data-room/05_outputs/`). Build L1–L6 as sibling runners (e.g. `run-l1.ts` … `run-l6.ts`) or a parameterised `run-loop.ts` — founder elects at open.
- **Scenario specs are written:** `data-room/04_test_brief/scenario-matrix.md` (L1–L6 rows) + `data-room/04_test_brief/test-brief.md` (§B per-seam criteria) + `03_seam_map/seam-map.md`. Read the L1–L6 rows; the headline assertions are there.
- **AGENT-NATIVE framing is a standing requirement** (founder decision 2026-05-25): every scenario input is expressed in agent terms — inferences, objectives, reward-weighting, the judgement assented to — **no emotion words**. The substrate reasons about false value-judgements, not feelings (project glossary). `lib/scenario-input.ts` (the L7 input) is the reference style.
- **Auth per endpoint (verified by code-read; diagnostic-certain):** `/api/reason` → `X-Api-Key` (`WSH_API_KEY`, an `sr_live_` key). `/api/calling`, `/api/accreditation/[agent_id]`, `/api/practice/reflect` → `Authorization: Bearer sr_assent_<token>` (`WSH_ASSENT_TOKEN`, bound to `wsh-test-agent-L7`). The existing two credentials cover all of L1–L6 — no re-minting needed.
- **The seed-409 wrinkle:** any scenario that does a *genuine accreditation seed* for `wsh-test-agent-L7` (the full-suite **L6**, or re-running L7) will return **409** because that row already exists. Run the one-line teardown first: `delete from public.agent_accreditation where agent_id='wsh-test-agent-L7';` (its `grade_history` cascades). Alternatively mint a fresh agent_id (`npx tsx scripts/whole-system-harness/mint-test-credentials.ts <owner_uuid> <new_agent_id>` + paste its SQL). The negatives don't hit this (the provenance gate rejects them first).
- **Combination 1 negatives are DONE** (`smoke-negatives.ts`: no-provenance→422, forged→403). **Combination 2** is blocked on Priority 4 (disclaimer text). **C2 distress perimeter** is Critical-tier — out of scope here.
- **Branch:** `main` (this arc's working branch; `whole-system-data-room` is older). The AI does **no** git operations; clear any `.git/index.lock` host-side.
- **Production state:** UNCHANGED. Provenance gate Live; rollback (unset `SUBSTRATE_PROVENANCE_GATE_ENABLED` + redeploy) unchanged and independent.

## Pre-conditions (confirm at open)

1. **Test env still standing.** Terminal 1 (`npm run dev` in `website/`, reading the test `.env.local`) is up, or restart it. Quick re-confirm: `GET http://localhost:3000/api/public-key` returns `key_id: substrate-layer2-test`. Terminal 2 still has the `WSH_…` exports, or re-export them (the values from `mint-test-credentials.ts`).
2. **`.env.local` still points at the test project** (0 production refs; `grep -c jdbefwkonfbhjquozgxr website/.env.local` → 0).
3. Working tree clean of unintended changes; on `main`.

## Part A — Open under the protocol

Read in order:
1. `/adopted/standing-protocol-cache.md` (~3 min — tier, status vocabulary, model selection per AC1, lean templates, risk class).
2. `/adopted/build-sessions-protocol-cache.md` (build-arc context).
3. `/operations/handoffs/founder/2026-05-25-L7-live-verification-test-env-standup-close.md` (predecessor close + Continuation).
4. `data-room/04_test_brief/scenario-matrix.md` (L1–L6 rows) + `data-room/04_test_brief/test-brief.md` §B + `website/scripts/whole-system-harness/README.md`.
5. `/operations/decision-log.md` — the four predecessor entries named above.

**PR15 consult (before any bespoke build):** the L1–L6 runners extend the *existing* harness `lib/` + the repo's plain-`tsx` assertion pattern — not greenfield. State the Anthropic-primitive consideration before writing code. Confirm at open: tier; branch; test-env-standing; status vocabulary; model selection (the test env's `/api/reason` uses Sonnet L1/L3 + Haiku quick-depth per AC1 — no model choice is the harness's to make).

## Part B — Procedure (PR1: one scenario at a time, Verified before the next)

**Step 0 — Read the two endpoint contracts the harness does not yet drive.** The harness drives `/api/reason` + `/api/accreditation`. L2/L3/L4/L5/L6 also need `/api/calling` and `/api/practice/reflect` — read their request/response shapes (route files + `/adopted/purpose-discovery-product-design.md`, `/adopted/sage-reflect-product-design.md`) and extend `lib/http-client.ts` with `postCalling` / `postReflect`. Ground this by code-read (diagnostic-certain), as was done for reason/accreditation.

**Then build + run, one at a time (each to Verified, capturing a ledger to `data-room/05_outputs/`):**

- **L1 — Reasoning alone.** `/api/reason` (agent-native impression). Assert 200 + a Layer-2 assessment + Layer-3 prose; honest (examines; no false "practice" claim). No seam, no bridge.
- **L2 — Calling alone.** `/api/calling` (Bearer). Two variants: complete dialogue → `DiscoveredPurpose` with the agent's own words in all five slots; incomplete → a developer clarification and **no handoff**.
- **L3 — Reflect alone.** `/api/practice/reflect` (Bearer), Q4 `KathekonAssessment[]` material. Assert 200 review; profile present but thin (no Reasoning upstream).
- **L4 — Calling + Reasoning (Seam S1).** Calling (approved) → thread the five slots into `/api/reason`. Assert all five slots survive into Layer 1 (print input slots beside what Layer 1 received).
- **L5 — Reasoning + Reflect (Seam S3).** `/api/reason` → `/api/practice/reflect` with Q4 records. **Verify by DB query** in the test SQL editor (founder-run): `agent_accreditation` updated **via the engine** (grade moves on evidence + hysteresis, not hand-set); FK-seed fires for a fresh agent; SR-15 per-domain proximity written. Provide the exact verify SQL.
- **L6 — Full suite (S1, S2, S3, S4).** Calling → Reasoning → genuine credential write (run the **teardown** first — seed-409) **+ the Seam-2 bridge `tsx` step** → Reflect (Q4) → consume `exit_path` (re-enter reason/calling). Assert each seam's §B criterion in sequence and that **S4 actually closes the loop** (the `exit_path` is acted on, not just correct).

Determinism: keep `TRANSLATION_SANDWICH_PARALLEL_RUN='false'` (already set). Only L6 needs the bridge `tsx` step.

**Step N — Verify (PEV, PR10).** Per scenario: assertions green + ledger written; for L5/L6, the founder runs the DB-query check. Classify diagnostic certainty.

**Step N+1 — Append decision-log entry (lean form).** Per `/adopted/standing-protocol-cache.md` §"Lean decision-log entry". Record which of L1–L6 reached Verified + the `05_outputs/` artefact paths.

**Step N+2 — Session close (lean form).** Per the cache. Provide founder commit commands (stage by name — untracked `website/scripts/whole-system-harness/` additions + `data-room/05_outputs/` ledgers; do **not** `git add .`; do not stage `website/.env.local*`, `website/tsconfig.tsbuildinfo`, or `website/src/data/environmental-context.json`). No Vercel impact (test scaffolding is never deployed).

## Part C — Anticipated session shape

| Phase | Estimate |
|---|---|
| Caches + predecessor close + scenario matrix + README read | 15–20 min |
| Step 0 (read Calling/Reflect contracts; extend http-client) | 30–45 min |
| L1 + L2 + L3 (single-endpoint scenarios) | 45–75 min |
| L4 + L5 (S1, S3; L5 needs DB-query verify) | 45–75 min |
| L6 (full suite; teardown + bridge + loop close) | 45–60 min |
| Decision-log + close | 20–30 min |
| **Total** | **~3.5–5 hours** (split across sittings if needed; each scenario is an independent checkpoint) |

## Rollback

Test scaffolding only — nothing deployed, nothing in production to roll back. New runner files are additive (delete host-side if abandoned). The test env writes only to the test Supabase project. Restore production local dev when all testing is done: `cp website/.env.local.prod-backup-2026-05-24 website/.env.local`.

## Forecast

Success = L1–L6 each run green against the test env, captured in `data-room/05_outputs/`, completing the positive scenario coverage on the proven pattern. After this: Combination 2 (once Priority 4 writes the disclaimer), C2 distress perimeter (a Critical session), and then the harness becomes the control-vs-treatment rig for the "is the agent better *with* the substrate?" comparison.

End of prompt. Opens on `main`; build + run against the **test** environment only — production is unchanged by this session.
