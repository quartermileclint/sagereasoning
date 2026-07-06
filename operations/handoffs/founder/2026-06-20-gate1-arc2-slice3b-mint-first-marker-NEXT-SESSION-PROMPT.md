# Next-Session Prompt — Gate-1 Arc 2 Slice 3b: operator mint → the FIRST `pre_decision_harness`

**For the founder. Paste as the first message of a fresh session.**

**Stream:** founder.
**Tier:** `code-critical` (AC7) — **the genuinely Critical slice.** An operator credential mint that
sets the `pre_decision_harness` provenance marker, and **the first non-null `examination_mode`
reaching the Live public accreditation read.** Full **Critical Change Protocol (0c-ii)** applies — do
not abbreviate it.
**Governing frame:** /adopted/standing-protocol-cache.md → §"Critical-risk sessions" (full templates).
**Predecessor close:** operations/handoffs/founder/2026-06-20-gate1-arc2-slice3a-subagent-hook-and-plugin-packaging-close.md.
**Predecessor decision-log entry:** `D-SAGE-PRACTICE-GATE1-ARC2-SLICE3A-SUBAGENT-HOOK-AND-PLUGIN-PACKAGING-BUILT-VERIFIED`.
**Governing design:** adopted/adr/2026-06-20-pre-decision-harness-arc2.md (ADR-011 §Slice 3 + **D7**).
**Risk classification:** **Critical** under 0d-ii (credential mint / provenance marker / public trust
credential change). Critical Change Protocol **engaged**.

## Why this session matters

Slice 3a built + packaged the harness (the `UserPromptSubmit` + `PreToolUse`-on-`Agent` framing hooks;
battery 56/0; a Claude Code plugin). But `pre_decision_harness` is still issued to **no one** — every
credential reads `post_decision_check`/`null`. **Slice 3b is where the marker is finally earned and
issued:** mint the operator credential carrying `examination_enforcement: pre_decision_harness`, make
a harness-backed accreditation write, and make the public payload read `pre_decision_harness` for the
first time. This makes Option-2's shared "Gate 1" name honest two hops downstream
(`D-SAGE-PRACTICE-GATE1-SURFACE-HONESTY-OPTION2-DIFFERENTIATION`) and unblocks Arc 3 (Slice 4).

## Pre-conditions — read first

1. **Slice 3a's live-verify is walked** — **DONE 2026-06-21 (Leg A, PASS).** The harness is
   **trajectory-proven live**: the subagent hook fires + frames a delegated task, the real
   **`tool_name` is `Agent`**, and `updatedInput` is applied (the subagent's own transcript shows its
   prompt leads with the Gate-1 frame). The `/plugin install` path could NOT be exercised (`/plugin`
   is absent in the founder's desktop build), so the hooks were verified via the standalone
   `.claude/settings.local.json` registration and the plugin packaging stays
   in-sandbox-structurally-validated. (Detail: the Slice-3a decision-log entry's "Live-verified" note.)
2. **Arc 1 is Live:** `SUBSTRATE_EXAMINATION_MODE_ENABLED=true` in prod; the public GET
   `/api/accreditation/{agent_id}` already folds `examination_mode` (`post_decision_check` on new
   discretionary writes, `null` on pre-field rows). `pre_decision_harness` is reachable ONLY via the
   provenance marker this session mints.
3. **The accreditation write path is Live:** confirm in Vercel that **`SUBSTRATE_WRITE_PATH_ENABLED=true`**
   (the kill-switch at `verifyAgentIdOwnership`) and **`SUBSTRATE_UPC_CAPABILITY_AUTH_ENABLED=true`**
   (so a `sr_prac_` UPC validates on the Bearer write boundary — `accreditation/route.ts:426-428`).
   Both are Live per the CI-14 + B2 closes; confirm before minting.
4. **The R18f provenance gate is Live and untouched.** The accreditation write must carry **genuine
   examination evidence** (a signed assessment from a real consult) or it 403s `no_examination`
   (observed at the B2 close on a synthetic signature). So the flow is *consult → write with that
   evidence*, not a bare write.
5. **Four operational memories bind for the live legs:** `prod-mint-needs-prod-admin-jwt` (prod mints
   need `MINT_CLI_ADMIN_JWT` from a logged-in www.sagereasoning.com session — the anon key is not
   admin); `api-key-1-per-day-limit-masks-as-401` (raise the key's limits for multi-call proofs);
   `claude-code-desktop-app-hook-env` (credential via `settings.env`); `test-admin-needs-profiles-row`
   (the owner_email must match a real `profiles` row — see the mint constraint below).
6. **0h remains held** — pre-0h trust-layer work; this session does not touch the launch call.

## The mint → marker → read chain (re-verified first-hand at the 3a close; matches D7, no drift)

- **Mint (admin-gated — the unforgeability root):** `/api/admin/api-keys` sets
  `credential_provenance.examination_enforcement='pre_decision_harness'` ONLY when explicitly supplied
  (`route.ts:246-252`). `requireAdmin` walls it — a consumer cannot self-issue it.
- **The operator credential is a UPC carrying `consult` + `accreditation_write`** (consult so the
  harness can frame via `/api/reason`; accreditation_write so it can write the accreditation that earns
  the marker). **Because it carries a write-class capability, the mint REQUIRES `owner_email` matching
  EXACTLY ONE `profiles` row + a non-empty `agent_id`** (`route.ts:219-229`) — else a clear 400. Use
  the founder's own prod account email (one profile) + a chosen `agent_id`.
- **Read (fail-closed):** on the write, after auth, `readPreDecisionMarker(credential_id)` reads the
  provenance (`accreditation/route.ts:458-461`); the route selects `via='harness_enforced'` iff
  `isExaminationModeEnabled() && examination_marker` (`route.ts:744-747`) →
  `composeK1InitialCoverage(record,'harness_enforced')` stamps `examination_mode:'pre_decision_harness'`
  (`coverage-status.ts`). `coverage_status` stays `agent_elected` (D3 — timing ≠ breadth).

**The mint command (CLI; verified against `mint-credential-core.ts`):**
```
# prod (needs MINT_CLI_ADMIN_JWT + MINT_CLI_BASE_URL=https://www.sagereasoning.com)
npx tsx --env-file=.env.development.local scripts/mint-credential.ts mint practice \
  --label "Gate-1 operator harness" \
  --capabilities consult,accreditation_write \
  --agent-id <your-agent-id> \
  --owner-email <founder-prod-email-matching-exactly-one-profile> \
  --owner-kind operator \
  --examination-enforcement pre_decision_harness
```

## Part A — Open under the protocol (full reads — code-critical)
Read in order:
1. /adopted/standing-protocol-cache.md → §"Critical-risk sessions" + the model/risk tables.
2. operations/handoffs/founder/2026-06-20-gate1-arc2-slice3a-subagent-hook-and-plugin-packaging-close.md.
3. adopted/adr/2026-06-20-pre-decision-harness-arc2.md — **D7** + §Slice 3.
4. First-hand re-verify the chain (PR11) — confirm no drift since the 3a close:
   - `website/src/app/api/admin/api-keys/route.ts:142-259` (the mint; `credential_provenance` set; write-class owner+agent guard).
   - `website/src/lib/substrate/examination-mode-flag.ts` (`readPreDecisionMarker`, fail-closed).
   - `website/src/app/api/accreditation/[agent_id]/route.ts:458-461, 744-747` (marker read + write-path select).
   - `website/src/lib/substrate/trust-layer/accreditation/coverage-status.ts` (`harness_enforced` → `pre_decision_harness`).
5. /operations/decision-log.md — last 2 entries.
6. The four memories named above.

Confirm at open: tier (`code-critical`); 0h held; **model N/A**; status vocab; risk class; **the six
Critical-Change-Protocol elements stated explicitly before any prod step.**

## Part B — Procedure (Critical Change Protocol + the live walk)

State the **six 0c-ii elements** up front: (1) what's changing — plain language; (2) what could break —
specific failure modes; (3) what happens to existing sessions/credentials; (4) rollback plan;
(5) verification step; (6) explicit founder approval specific to the named risks. Then:

### Step 1 — TEST: prove the whole chain end-to-end (founder-walked, PR17)
On TEST: ensure a `profiles` row exists for the owner email (`test-admin-needs-profiles-row`); mint the
operator UPC (consult + accreditation_write + marker); **raise its limits**; run a harness-backed
consult to get a genuine signed assessment; submit the accreditation write (`POST
/api/accreditation/{agent_id}`, Bearer the UPC) carrying that evidence; **confirm the public GET reads
`examination_mode:"pre_decision_harness"`** for that agent. Then mint a NON-marked UPC, write, and
confirm it still reads `post_decision_check` (honest differentiation holds). Tear down (revoke creds;
R17c-delete the test accreditation rows + cascade).

### Step 2 — PROD activation (the Critical step; founder-walked, AC7)
Inviolable order (no migration this session — the column + flag predate it, Arc 1). Confirm the
pre-condition flags (step 3 above). Mint the operator UPC on prod (`prod-mint-needs-prod-admin-jwt`);
run the harness-backed consult; make the accreditation write with that evidence; **verify
`pre_decision_harness` reads live on the public payload** for that agent; confirm a NON-marked
credential still reads `post_decision_check`. Confirm **no regression** to the R18f provenance gate /
R20a / distress / Layer-2 signing / UPC auth (all untouched — this is an additive provenance marker + a
read fold). Smoke + teardown of any throwaway artifacts (revoke the operator cred if it was a smoke;
or keep it if it is the real operator harness credential — founder's call).

### Step 3 — Re-run the gates + verify
`logic-harness.mjs` 32/0; `negative-battery.mjs` 56/0; the live marker read on the public payload.

### Step 4 — Full Critical session close + decision-log entry (full templates)
Include: Verification Method Used, Risk Classification Record, PR5 Knowledge-Gap Carry-Forward,
Founder Verification (Between Sessions), Orchestration Reminder. Update the CLAUDE.md production-state
block (PR18) — this is a real production change (the first non-null marker on the Live read).

## Rollback path
Revoke the operator credential + revert/repair the one accreditation row so its `examination_mode`
returns to `post_decision_check`/`null` (additive provenance — removal is non-destructive). The
`examination_mode` column + `SUBSTRATE_EXAMINATION_MODE_ENABLED` flag predate this session (Arc 1) and
stay.

## Forecast
End with the **first `pre_decision_harness` issued and reading live** on the public accreditation
payload (consumer-unforgeable), the gates green, and the harness plugin live-verified. That satisfies
the mentor's binding constraint (the harness is real) and **unblocks Slice 4 / Arc 3** — publishing the
held "Gate 1 — pre-decision" per-configuration contract language to `llms.txt` / `agent-card.json` /
api-docs (`drafts/sage-practice-examination-mode-docs-staged.md`). The 0h launch call remains the
founder's throughout.

## Cross-references
- adopted/adr/2026-06-20-pre-decision-harness-arc2.md (ADR-011 §Slice 3 + D7)
- harness/gate1-pre-decision/ (the packaged plugin + the live-verify walkthrough)
- `D-SAGE-PRACTICE-GATE1-ARC1-EXAMINATION-MODE-ACTIVATION` (the Live field this slice first populates)
- `D-SAGE-PRACTICE-GATE1-SURFACE-HONESTY-OPTION2-DIFFERENTIATION` (why the marker must be unforgeable)
- drafts/sage-practice-examination-mode-docs-staged.md (the Slice-4 / Arc-3 contract language)
- memory: `prod-mint-needs-prod-admin-jwt`, `api-key-1-per-day-limit-masks-as-401`, `claude-code-desktop-app-hook-env`, `test-admin-needs-profiles-row`

End of prompt.
