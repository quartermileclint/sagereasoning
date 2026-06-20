# Next-Session Prompt — Gate-1 Arc 1 ACTIVATION (`examination_mode`) — founder-walked Critical 0c-ii

**For the founder.** Paste as the first message of a fresh session. This activates the Arc 1 `examination_mode` field built dark on 2026-06-20. It is **Critical** (touches the accreditation write boundary + the public trust credential). Per PR17 the AI walks every founder-performed step **live, one at a time**, waits for your confirmation, and never hands you a one-liner. Do NOT run any step ahead of the walkthrough.

**Tier:** `code-critical`. **Model:** per the cache AC1 row. **Pre-condition:** the Arc 1 build commit is pushed and Vercel is green (the close's Founder Verification block). If not pushed yet, push first — it deploys byte-identical (flag UNSET).

## Session open
Read: `/adopted/standing-protocol-cache.md`; the Arc 1 close `operations/handoffs/founder/2026-06-20-gate1-arc1-examination-mode-close.md`; the decision-log entry `D-SAGE-PRACTICE-GATE1-ARC1-EXAMINATION-MODE-BUILT-DARK-TEST-VERIFIED`; `drafts/sage-practice-examination-mode-docs-staged.md`. Confirm at open: tier; 0h still held; the inviolable order **migration BEFORE flag**.

## Critical Change Protocol (0c-ii) — read before any step
1. **What is changing.** (a) Add a nullable `examination_mode` column to the `agent_accreditation` table. (b) Turn on `SUBSTRATE_EXAMINATION_MODE_ENABLED` in Vercel. After this, the public accreditation credential will state `examination_mode` — and because no pre-decision harness credential is issued yet, **every credential will read `post_decision_check` (new writes) or `null` (older rows)**. Nothing reads `pre_decision_harness` until Arc 2.
2. **What could break.** The migration is additive + nullable + idempotent — it cannot affect existing reads/writes (the column is ignored until the flag is on). The flag, once on, makes accreditation writes include the new column; if the column were missing the write would 503 (PGRST204) — **which is why the migration must be applied first.** No auth, no sign-in, no distress perimeter, no signing is touched.
3. **Existing sessions / data.** No effect on signed-in users or stored data. Older accreditation rows read back `examination_mode: null` ("unstated") — honest. No credential is invalidated.
4. **Rollback.** Unset `SUBSTRATE_EXAMINATION_MODE_ENABLED` in Vercel + redeploy → the field disappears, byte-identical to today. The column can stay (harmless) or be dropped (SQL at the bottom of the migration file). Rollback is independent of the migration.
5. **Verification.** After each step, a specific check (below).
6. **Approval.** You say "go ahead" before each live step; the AI stops if it cannot answer any of the above.

## Step 1 — Apply the migration to PRODUCTION (Supabase) — DO THIS FIRST
The AI will walk you through it. Exact path:
1. Open the Supabase dashboard → your SageReasoning **production** project → left sidebar **SQL Editor** → **New query**.
2. Paste the entire contents of `website/supabase-agent-accreditation-examination-mode-migration.sql`.
3. Run the **§0 pre-flight** SELECT first (it lists current columns) — paste the result back to the AI to confirm `examination_mode` is absent.
4. Run **§1** (the `ADD COLUMN IF NOT EXISTS` + the CHECK).
5. Run **§2 VERIFY** — expected: one column row (`examination_mode | text | YES`) + one constraint row (`agent_accreditation_examination_mode_check`). Paste back to confirm.
**Confirmation check:** the VERIFY output shows the column + constraint. The flag is still OFF, so behaviour is still byte-identical — the column simply exists, unused. STOP and confirm before Step 2.

## Step 2 — Turn on the flag in Vercel + redeploy
1. Vercel dashboard → the SageReasoning project → **Settings** → **Environment Variables**.
2. **Add New**: Key `SUBSTRATE_EXAMINATION_MODE_ENABLED`, Value `true`, Environment **Production**. Save.
3. **Deployments** tab → the latest production deployment → **⋯** → **Redeploy** (so the new env var is picked up).
**Confirmation check:** the redeploy finishes green. STOP and confirm before Step 3.

## Step 3 — Verify the field is live and honest (the AI provides the exact commands)
The AI will give you a copy-paste check. The intent:
- Mint (or reuse) an ordinary accreditation-write credential (NO `--examination-enforcement` flag) and do one accreditation write, then GET `https://www.sagereasoning.com/api/accreditation/<agent_id>` and confirm the payload shows **`"examination_mode": "post_decision_check"`** (a freshly written row) — the honest label for a discretionary write.
- Confirm an older agent's payload shows **`"examination_mode": null`** (unstated) — not an error.
- Confirm NO credential reads `pre_decision_harness` (none is issued — the marker is un-issued by design until Arc 2).
**Confirmation check:** `post_decision_check` on a fresh write; `null` on an old row; never `pre_decision_harness`. If anything else, the AI says "I caused this" and walks the rollback (Step-2 unset + redeploy).

## Step 4 — Apply the public docs (founder election)
Founder choice, with the AI's recommendation:
- **Recommended:** apply ONLY the field-semantics + **attestation-limit** text from `drafts/sage-practice-examination-mode-docs-staged.md` (§1 llms.txt, §2 agent-card, §3 api-docs) — documents what is actually served (`post_decision_check`/`null`) with the honest "attestation, not a cryptographic proof of timing" limit. **Hold** the per-configuration "Gate 1 — pre-decision / post-decision (check)" contract language — that is **Arc 3**, and depends on the Arc 2 harness existing.
- **Alternative:** hold ALL public docs until Arc 3. Defensible if you'd rather not surface the field publicly until the pre/post distinction is real.
Do NOT publish "Gate 1 — pre-decision" onto any public surface until the Arc 2 harness exists (the mentor's binding constraint).

## After activation
- The `pre_decision_harness` marker stays **un-issued**. Issuing it is part of **Arc 2** (the pre-decision harness/plugin) — only a credential minted by a genuine harness integration earns it.
- Then **Arc 3** — the hosted-configuration contract language.
- 0h launch call: unchanged, still yours.

## Rollback (independent, any time)
Unset `SUBSTRATE_EXAMINATION_MODE_ENABLED` in Vercel + redeploy → byte-identical to today. (The column may stay; drop SQL is in the migration file footer.)

## Cross-references
`D-SAGE-PRACTICE-GATE1-ARC1-EXAMINATION-MODE-BUILT-DARK-TEST-VERIFIED` · the Arc 1 close · `drafts/sage-practice-examination-mode-credential-build-scope.md` · `drafts/sage-practice-examination-mode-docs-staged.md` · `website/supabase-agent-accreditation-examination-mode-migration.sql`.

End of prompt.
