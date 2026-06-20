# Session Close — 2026-06-21 — Gate-1 Arc 2 Slice 3b: the first `pre_decision_harness` issued + read LIVE (then smoke-torn-down)

**Stream:** founder.
**Governing frame:** /adopted/standing-protocol-cache.md → §"Critical-risk sessions" (full templates).
**Tier:** `code-critical` — **Critical** risk under 0d-ii. **AC7 engaged.** Full Critical Change Protocol (0c-ii) walked, not abbreviated.
**Date:** 2026-06-21.
**Decision-log entry:** `D-SAGE-PRACTICE-GATE1-ARC2-SLICE3B-FIRST-PRE-DECISION-HARNESS-ISSUED-LIVE`.
**Governing design:** `adopted/adr/2026-06-20-pre-decision-harness-arc2.md` (ADR-011 §Slice 3 + **D7**).

## What happened

The genuinely-Critical slice. `pre_decision_harness` had been issued to **no one** since Arc 1 made the field Live. This session **earned + issued it for the first time, end-to-end on production**, then **smoke-tore-down** every proof artifact (founder-elected "full smoke").

The six Critical-Change-Protocol elements were stated up front and the founder **approved straight-to-prod** (the chain was code-verified no-drift, gates green) with the keeper-vs-smoke call deferred to teardown.

**The live walk (founder ran every prod step; the AI guided + verified — PR17):**

1. **Mint** the operator UPC `sagereasoning:gate1-harness@v1` (`sr_prac_aa2b34`, id `de53ddda-…`) — capabilities `consult,accreditation_write`, `owner_kind operator` → the gmail profile `babdde33-…`, `examination_enforcement: pre_decision_harness`. **SQL-verified** `credential_provenance.examination_enforcement = "pre_decision_harness"` on the actual row (the unforgeability root, confirmed first-hand).
2. **Consult → verify → write → read** via the new SDK driver: a genuine `assessment_first` consult (`signature verifies: true`) → an accreditation **seed** write that **cleared the live R18f provenance gate** (`status: ok`) → the public GET read **`examination_mode: "pre_decision_harness"`**, `coverage_status: "agent_elected"` (D3 holds), `credential_basis` carrying *"examined pre-decision by an operator-issued Gate-1 harness…"*.
3. **Differentiation control:** a non-marked UPC `sagereasoning:gate1-control@v1` (`sr_prac_d510f3`, id `3f44f8c8-…`) ran the identical flow → public read **`examination_mode: "post_decision_check"`** — the first `post_decision_check` on a *fresh* prod write (closes the Arc-1 light-verification gap). The mint-time marker is the **sole** difference.
4. **Full smoke teardown:** all 3 `sr_prac_` creds revoked (`cfe3526e`/`de53ddda`/`3f44f8c8`), both `agent_accreditation` rows deleted (cascade `evaluated_actions`/`grade_history`; `remaining = 0`), `MINT_CLI_ADMIN_JWT` unset.

**In-session build correction (caught BEFORE spending a consult — PR10/PR11):** the operator UPC was first minted as `sage-gate1-harness@v1` (id `cfe3526e`). The UPC mint accepts any free-string `agent_id`, but the accreditation write boundary **rejects** it (`isAcceptedAgentId`, CI-12 — needs K1-canonical `namespace:name@version`; `accreditation/[agent_id]/route.ts:641` → 400). Caught against the regex first-hand, revoked, re-minted canonical. Memory `upc-mint-vs-accreditation-agent-id` saved. (Two earlier mint hiccups were operator-input, not defects: a no-resolvable-owner 400 when the email didn't reach the route, and a 403/missing-auth from the JWT placeholder not being substituted.)

## Decisions Made
- `D-SAGE-PRACTICE-GATE1-ARC2-SLICE3B-FIRST-PRE-DECISION-HARNESS-ISSUED-LIVE` appended. The `pre_decision_harness` marker mechanism is **Verified (live, end-to-end)**; the first **standing** issuance is deferred to genuine harness onboarding.

## Status Changes
| Item | Old | New |
|---|---|---|
| `pre_decision_harness` issuance | un-issued | **Verified-live (first issuance minted + read live on the public payload; differentiation proven), then smoke-torn-down** |
| `post_decision_check` on a fresh prod write | unproven (Arc-1 stopped at light verification) | **Verified-live** (the control arm) |
| `sdk/typescript/examples/gate1-3b-walk.ts` | — | **new** (repo-only SDK walk driver) |
| Production data | — | **byte-equivalent to pre-3b** (full smoke; no standing marker credential/row) |

## Verification Method Used
- **First-hand code re-verification** of the mint→marker→read chain (PR11) — no drift from D7/ADR-011: `api-keys/route.ts:173-259`, `examination-mode-flag.ts`, `accreditation/route.ts:458-461, 744-747`, `coverage-status.ts`.
- **Regex pre-check** of the candidate agent_id against `agent-id-vocabulary.ts` — caught the non-canonical mis-mint before the consult/write was spent.
- **Local gates** (AI-run): `logic-harness.mjs` **32/0**, `negative-battery.mjs` **56/0 — RELEASE GATE: PASS** (twice — open + close).
- **Live prod walk** (founder-walked): marker SQL-verified on the row; consult signature verified true; write cleared R18f (`status: ok`); public read `pre_decision_harness`; control read `post_decision_check`; teardown `remaining = 0`.

## Risk Classification Record
**Critical** under 0d-ii — credential mint + provenance marker + first non-null value on the Live public trust credential. AC7 engaged; PR6 engaged. The six 0c-ii elements were stated and the founder gave explicit approval specific to the named risks (straight-to-prod). End state after smoke teardown: byte-equivalent to pre-3b production. R18f / R20a / distress / Layer-2 signing / UPC auth all untouched.

## PR5 Knowledge-Gap Carry-Forward
- **`upc-mint-vs-accreditation-agent-id`** (NEW memory): the UPC mint accepts any `agent_id`; the accreditation write enforces K1-canonical — mint write-class UPCs with a canonical id, verify against the regex before minting.
- **Prod-mint JWT ergonomics:** export `MINT_CLI_ADMIN_JWT` once + verify with `echo "${#MINT_CLI_ADMIN_JWT}"` (the placeholder/empty-var traps cost two round-trips). Keep `MINT_CLI_BASE_URL` inline (never export it — the cross-env leak hazard).

## Next Session Should
**Slice 4 / Arc 3 — publish the held "Gate 1 — pre-decision" per-configuration contract language** to the public surfaces (`llms.txt`, `agent-card.json`, api-docs) from `drafts/sage-practice-examination-mode-docs-staged.md`. The mentor's binding constraint (the harness must be real) is now satisfied — the marker is proven issuable + readable live, so it is faithful to document the two named "Gate 1" configurations publicly. `governance → code`; not Critical unless it touches a perimeter surface. Separately, the **standing** operator-harness onboarding (real plugin distribution into a real loop + a standing operator credential) is the longer-term path that re-mints the marker for genuine use.

## Blocked On
**Files changed this session (founder commits by name):**
- `sdk/typescript/examples/gate1-3b-walk.ts` (new — repo-only SDK walk driver; nothing deploys)
- `operations/decision-log.md` (the 3b entry)
- `CLAUDE.md` (production-state block, PR18, as-of 2026-06-21)
- `operations/handoffs/founder/2026-06-21-gate1-arc2-slice3b-first-pre-decision-harness-issued-live-close.md` (this close)
- Memory (outside the repo, no commit): `upc-mint-vs-accreditation-agent-id` + MEMORY.md index line.

**Pre-existing uncommitted changes** in the tree at session open (from the 3a live-verify; the founder's call whether to fold into this commit or a separate one): `harness/gate1-pre-decision/README.md`, `…/subagent-framing-hook.mjs`, `…/test/negative-battery.mjs`, the 3a close + the 3b prompt, plus the unrelated `operations/benchmarks/…/2026-06-16/*` and `website/tsconfig.tsbuildinfo` edits.

**Production state at session close:** **byte-equivalent to pre-3b** (Arc 1 still Live: `SUBSTRATE_EXAMINATION_MODE_ENABLED=true`, the field folds `post_decision_check`/`null`). The `pre_decision_harness` mechanism is **Verified-live** but **no standing marker credential/row exists** (full smoke). No Vercel/Supabase/flag/schema change this session. 0h remains held.

## Founder Verification (Between Sessions)
```
cd "/Users/clintonaitkenhead/Claude-work/PROJECTS/sagereasoning"
node harness/gate1-pre-decision/test/logic-harness.mjs      # expect: 32 passed, 0 failed
node harness/gate1-pre-decision/test/negative-battery.mjs    # expect: 56 passed, 0 failed — RELEASE GATE: PASS
git add sdk/typescript/examples/gate1-3b-walk.ts operations/decision-log.md CLAUDE.md operations/handoffs/founder/2026-06-21-gate1-arc2-slice3b-first-pre-decision-harness-issued-live-close.md
git commit -m "Gate-1 Arc 2 Slice 3b: first pre_decision_harness issued + read live on prod, then smoke-torn-down (Critical/AC7); SDK walk driver"
```
Then push via GitHub Desktop. **Vercel: no build impact** — the only repo change in the build graph would be none (the SDK is outside `website/`; the rest is docs). Confirm prod teardown is complete (the `remaining = 0` query + the two `Revoked:` outputs you already ran).

## Orchestration Reminder
This was the genuinely-Critical slice of Arc 2 and it is **done + verified**. Arc 2 (the pre-decision harness) is now complete end-to-end: the harness hooks are trajectory-Verified (3a) and the marker is proven issuable + readable live (3b). The next move is **Slice 4 / Arc 3** (publish the contract language) — `governance → code`, not Critical. The **0h launch call remains the founder's** throughout; this was pre-0h trust-layer honesty work.

## Cross-references
- `/operations/decision-log.md` — `D-SAGE-PRACTICE-GATE1-ARC2-SLICE3B-FIRST-PRE-DECISION-HARNESS-ISSUED-LIVE`
- `adopted/adr/2026-06-20-pre-decision-harness-arc2.md` (ADR-011 §Slice 3 + D7)
- `sdk/typescript/examples/gate1-3b-walk.ts` (the walk driver)
- `operations/handoffs/founder/2026-06-20-gate1-arc2-slice3a-subagent-hook-and-plugin-packaging-close.md` (predecessor)
- `drafts/sage-practice-examination-mode-docs-staged.md` (Slice 4 / Arc 3 — now unblocked)
- memory: `upc-mint-vs-accreditation-agent-id`, `prod-mint-needs-prod-admin-jwt`, `api-key-1-per-day-limit-masks-as-401`

*End of session close. The first `pre_decision_harness` was issued + read live on the public accreditation payload, differentiation proven against a non-marked control, then smoke-torn-down — production byte-equivalent to pre-3b; the marker mechanism Verified-live; Arc 2 complete; Slice 4 / Arc 3 unblocked.*
