# Session Close — 2026-06-21 — Gate-1 Standing Harness Onboarding: first STANDING `pre_decision_harness` Live + harness dogfooded in the founder's loop

**Stream:** founder.
**Governing frame:** /adopted/standing-protocol-cache.md → §"Critical-risk sessions" (full templates).
**Tier:** `code-critical` — **Critical** risk under 0d-ii. **AC7 + PR6 engaged.** Full Critical Change Protocol (0c-ii) walked, not abbreviated.
**Date:** 2026-06-21.
**Decision-log entry:** `D-SAGE-PRACTICE-GATE1-STANDING-HARNESS-DOGFOOD-PRE-DECISION-MARKER-LIVE`.
**Governing design:** `adopted/adr/2026-06-20-pre-decision-harness-arc2.md` (ADR-011 — D2 / D4 / D7 + §Consequences dogfood/reference-integration).

## What happened

The harness became **real in a genuine loop**, and the first marker that **earns its place** was issued. 3b proved the `pre_decision_harness` mechanism Verified-live then smoke-tore-down the proof ("no standing credential earns its place until genuine onboarding"); Slice 4 published the two-configurations contract. This session minted a **standing** operator credential on production, issued the **first PERSISTING** `pre_decision_harness` on the Live public accreditation read, installed the Gate-1 harness into the founder's own Claude Code loop (the PR16 dogfood / ADR-011 §Consequences reference integration), and confirmed both hooks fire from genuine prod consults.

The six Critical-Change-Protocol elements were stated up front; the founder gave explicit approval specific to the named risks — in particular that the marker **PERSISTS** (no teardown) and the dogfood traffic accumulates — and elected **straight-to-prod** (skipping the optional TEST dry-run; 3b already proved the prod chain).

**The live walk (founder ran every prod step; the AI guided + verified — PR17):**

1. **Mint** the standing operator UPC `sagereasoning:gate1-dogfood@v1` (`sr_prac_7e9b11`, id `322b0eb7-b878-4aab-aba9-2df89168e583`) — capabilities `consult,accreditation_write`, `owner_kind operator` → gmail profile `clintonaitkenhead@gmail.com`, `examination_enforcement: pre_decision_harness`. The candidate agent_id was **regex-checked canonical BEFORE the mint** (CI-12 / `CANONICAL_AGENT_ID_PATTERN`), pre-empting the 3b mis-mint class. **SQL-verified** on the row: `examination_enforcement = pre_decision_harness`, `owner_kind = operator`, `capabilities = {consult,accreditation_write}`, `is_active = true`. Limits raised to 200/day, 5000/mo.
2. **Issue** the marker via `sdk/typescript/examples/gate1-3b-walk.ts` (the 3b driver, re-used): consult (`assessment_first`/`standard`, `signature verifies: true`) → accreditation **seed** write that cleared the **live R18f provenance gate** (`status: ok`) → public GET read **`examination_mode: "pre_decision_harness"`**, `coverage_status: "agent_elected"` (D3), `senecan_grade: "pre_progress"`, `credential_basis` carrying *"examined pre-decision by an operator-issued Gate-1 harness (attestation: harness-enforced framing before the agent reasoned)."* **The row PERSISTS — it is the standing marker.**
3. **AI independent re-read** (read-only public GET, no auth): HTTP 200, `examination_mode: pre_decision_harness`, `coverage_status: agent_elected` — confirmed standing on prod, independent of the driver run.
4. **Dogfood install** (founder's gitignored `.claude/settings.local.json`, NOT committed): both hooks (`UserPromptSubmit` → `framing-hook.mjs`; `PreToolUse` matcher `Task|Agent` → `subagent-framing-hook.mjs`) + an `env` block (the standing UPC, `GATE1_ENDPOINT` = prod `/api/reason`, `GATE1_STATE_DIR=/tmp/sage-gate1`, `GATE1_DEPTH=standard`). Live-verified in the founder's real Claude Code sessions (`/tmp/sage-gate1/gate1.log`): 2× `UNFRAMED reason="http 401"` (fail-open-with-honest-log, demonstrated live while the credential was a placeholder), then **`FRAMED`** (top-level, 2 distinct sessions) + **`FRAMED-SUBAGENT`** (1 spawn, `session=sub-24ebe6d9…`) — both hooks framing from genuine prod consults, per-spawn fire-once markers written.
5. **Bare-arm benchmark confirmed (no toggle):** a `git worktree add --detach ../sagereasoning-bare 78849b9` (the Slice-4 baseline) carries the **same harness code** but **no project-local settings → no Gate-1 hook → bare by construction**; no tracked `.claude/settings*.json` exists to carry hooks into a worktree. Worktree removed after the structural confirm. Harness-vs-bare runs are reproducible by environment.

**Incidental finding (recorded):** this Claude Code **desktop build hot-reloaded the hooks mid-conversation** from the `settings.local.json` edit — the hook fired in the same conversation the edit was made in, not only in a fresh one — correcting the standing "hooks snapshot at conversation start" assumption (3a close / memory `claude-code-desktop-app-hook-env`). Env hot-reload (already documented) also held: the post-swap consult succeeded on the next prompt with no restart.

## Decisions Made
- `D-SAGE-PRACTICE-GATE1-STANDING-HARNESS-DOGFOOD-PRE-DECISION-MARKER-LIVE` appended. The standing `pre_decision_harness` marker is **Live + PERSISTING**; the harness is **Live in the founder's own Claude Code loop**; the bare-arm benchmark environment is confirmed reproducible.

## Status Changes
| Item | Old | New |
|---|---|---|
| `pre_decision_harness` issuance | Verified-live then smoke-torn-down (3b — no standing marker) | **Live + PERSISTING** on `sagereasoning:gate1-dogfood@v1` (the first that earns its place) |
| Gate-1 pre-decision harness (install) | trajectory-Verified (3a), never in a standing loop | **Live in the founder's own Claude Code loop** (dogfood / reference integration) |
| Harness-vs-bare benchmark capability | designed (`HARNESS-VS-BARE-…`) | **Confirmed reproducible** (clean worktree, no toggle) |
| Production data | byte-equivalent to pre-3b | **NOT byte-equivalent — a deliberate standing marker credential + row** |

## Verification Method Used
- **First-hand regex check** of the candidate agent_id against `agent-id-vocabulary.ts` `CANONICAL_AGENT_ID_PATTERN` (PR11) — canonical confirmed before the mint.
- **First-hand env-contract check** of `framing-core.mjs` (L77–79) — the hook reads `SAGE_GATE1_CREDENTIAL` (primary) with a `GATE1_CREDENTIAL` fallback; the README is correct (no drift).
- **Local gates** (AI-run): `logic-harness.mjs` **32/0**, `negative-battery.mjs` **56/0 — RELEASE GATE: PASS**.
- **Live prod walk** (founder-walked, PR17): marker SQL-verified on the row; consult signature verified true; seed write cleared R18f (`status: ok`); public read `pre_decision_harness`; limits raised.
- **AI-independent public read** (read-only, no auth): HTTP 200, `pre_decision_harness` — the marker stands on prod independent of the driver.
- **Live dogfood trajectory** (AI read `/tmp/sage-gate1/gate1.log` directly): 2× UNFRAMED-401 (fail-open honest), then FRAMED (top-level ×2) + FRAMED-SUBAGENT (×1); fire-once markers present.
- **Bare-arm structural proof** (AI-run): worktree at `78849b9` has no project-local settings → no hook registration → bare by construction; harness code present (same baseline).

## Risk Classification Record
**Critical** under 0d-ii — a standing credential mint on production + a persisting non-null marker on the Live public trust credential. **AC7 engaged; PR6 engaged** (credential surface); **KG1 engaged** (prod DB write). The six 0c-ii elements were stated and the founder gave explicit approval specific to the named risks (the marker persists; the dogfood traffic accumulates; straight-to-prod). End state: **production NOT byte-equivalent to before** (a deliberate, intended standing change). R18f / R20a / distress / Layer-2 signing / UPC auth all **untouched** (the marker is an additive server-composed read fold + an admin-only mint attribute that predate this session, Arc 1).

## PR5 Knowledge-Gap Carry-Forward
- **`claude-code-desktop-app-hook-env`** (UPDATED): the desktop build **hot-reloads hooks mid-conversation** from a `settings.local.json` edit — a fresh conversation is not strictly required to activate a newly-registered hook (it activated in the same conversation). The earlier "snapshot at conversation start" claim is corrected. (Env hot-reload, already documented, also held.)
- **Standing-credential ergonomics (carried):** the prod mint pattern from 3b held — `export MINT_CLI_ADMIN_JWT` once + verify length; keep `MINT_CLI_BASE_URL` inline. The `--examination-enforcement pre_decision_harness` flag + a canonical agent_id are the two load-bearing inputs; verify both before spending the consult.

## Next Session Should
There is **no required next slice** — the Gate-1 surface-honesty arc (Arcs 1–3) is complete and the harness is now dogfooded Live. Two longer-horizon Gate-1 items remain, neither blocking:
- **The harnessed-vs-bare comparison *run*** — the bare-arm environment method is now confirmed, so a real A/B comparison can run (capture under one benchmark run dir per `drafts/sage-practice-benchmark-v1.md` + the leg-A/leg-B precedent). A follow-on, not this session's scope.
- **The optional `/plugin install` marketplace verification** — CLI-only (the desktop build has no `/plugin`); the standalone project-local registration is the supported desktop path and is now proven.

The **0h launch call remains the founder's** — this was pre-0h trust-layer honesty work.

## Blocked On
**Files changed this session (founder commits by name):**
- `operations/decision-log.md` — the standing-harness entry.
- `CLAUDE.md` — production-state block refresh (PR18, as-of 2026-06-21): header line + new top refresh paragraph + new Live-in-production bullet.
- `operations/handoffs/founder/2026-06-21-gate1-standing-harness-dogfood-pre-decision-marker-live-close.md` (this close).

**NOT committed (by design):**
- `.claude/settings.local.json` — **gitignored**; holds the standing prod credential (the dogfood install). It stays local. Do **not** commit it.
- Memory (outside the repo): `claude-code-desktop-app-hook-env` updated.

**Pre-existing uncommitted changes** carried in the tree from prior sessions (the founder's call whether to fold or commit separately): `harness/gate1-pre-decision/README.md`, `…/subagent-framing-hook.mjs`, `…/test/negative-battery.mjs`, the `operations/benchmarks/sage-practice-v1/runs/2026-06-16/*` + `…/2026-06-20/*` files, the 3a/3b/Slice-4 handoff files, `drafts/*`, `website/tsconfig.tsbuildinfo`.

**Production state at session close:** **NOT byte-equivalent to before** — a standing operator credential (`sagereasoning:gate1-dogfood@v1`, `322b0eb7…`) + a persisting `agent_accreditation` row reading `examination_mode: pre_decision_harness` are now Live (deliberate). Arc 1 still Live (`SUBSTRATE_EXAMINATION_MODE_ENABLED=true`). No Vercel/Supabase **flag/schema/code** change this session; the only prod changes are the credential mint + the accreditation row (data). The harness runs in the founder's own loop (gitignored local config). 0h remains held.

## Founder Verification (Between Sessions)
```
cd "/Users/clintonaitkenhead/Claude-work/PROJECTS/sagereasoning"
node harness/gate1-pre-decision/test/logic-harness.mjs      # expect: 32 passed, 0 failed
node harness/gate1-pre-decision/test/negative-battery.mjs    # expect: 56 passed, 0 failed — RELEASE GATE: PASS
curl -s 'https://www.sagereasoning.com/api/accreditation/sagereasoning%3Agate1-dogfood%40v1' | python3 -c "import sys,json;d=json.load(sys.stdin);x=d.get('data',d);print('examination_mode:',x.get('examination_mode'))"   # expect: pre_decision_harness
git add operations/decision-log.md CLAUDE.md operations/handoffs/founder/2026-06-21-gate1-standing-harness-dogfood-pre-decision-marker-live-close.md
git commit -m "Gate-1 Standing Harness Onboarding: first STANDING pre_decision_harness Live + harness dogfooded in the founder's loop (Critical/AC7); decision-log + close + CLAUDE.md"
```
Then push via GitHub Desktop. **Vercel: no build impact** — docs only (the SDK driver was committed in 3b; `.claude/settings.local.json` is gitignored). **Do not commit `.claude/settings.local.json`** (it holds the standing credential).

## Orchestration Reminder
The Gate-1 surface-honesty arc (Arcs 1–3) is complete **and** the harness is now real in a genuine loop with a standing marker that earns its place. The marker **persists** by design — retracting it (revoke credential + delete row + remove local hooks) is a deliberate later act, not an automatic teardown. The harness fires on every new task in this project going forward (fire-once-per-task, fail-open) — that *is* the dogfood. The **0h launch call remains the founder's** throughout.

## Cross-references
- `/operations/decision-log.md` — `D-SAGE-PRACTICE-GATE1-STANDING-HARNESS-DOGFOOD-PRE-DECISION-MARKER-LIVE`
- `adopted/adr/2026-06-20-pre-decision-harness-arc2.md` (ADR-011 — D2 / D4 / D7 + §Consequences)
- `operations/handoffs/founder/2026-06-21-gate1-arc3-slice4-configuration-contract-published-close.md` (predecessor)
- `operations/handoffs/founder/2026-06-21-gate1-arc2-slice3b-first-pre-decision-harness-issued-live-close.md` (the chain replayed here without teardown)
- `harness/gate1-pre-decision/claude-code/SLICE3-LIVE-VERIFY-WALKTHROUGH.md` + `HARNESS-VS-BARE-BENCHMARK-WALKTHROUGH.md`
- `sdk/typescript/examples/gate1-3b-walk.ts` (the walk driver)
- memory: `claude-code-desktop-app-hook-env` (updated), `prod-mint-needs-prod-admin-jwt`, `upc-mint-vs-accreditation-agent-id`, `api-key-1-per-day-limit-masks-as-401`, `mint-cli-env-file-export-leak`

*End of session close. The first STANDING, PERSISTING `pre_decision_harness` is Live on the public accreditation credential, the Gate-1 harness is dogfooded Live in the founder's own Claude Code loop (both hooks framing from genuine prod consults), and the harness-vs-bare benchmark environment is confirmed reproducible — no toggle. Production carries a deliberate standing change; the marker stands. 0h remains the founder's.*
