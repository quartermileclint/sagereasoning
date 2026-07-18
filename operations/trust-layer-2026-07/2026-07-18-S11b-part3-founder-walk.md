# S11b Part 3 — the founder walk: reducer narrowing deploy + the s9-loop justice-cap correction

**Tier:** `code-critical`, founder-walked (AC7 + PR17; register D3 — `derive-trust-events.ts` is LIVE trust-event emission).
**Binding ground:** the F2 verdict R11/R14 (verbatim wins); the S11a diagnosis §5 disposition (disclose-and-carry ends HERE); register D1.
**The AI performs no git/Vercel/Supabase op in this walk — every step below is the founder's.**

---

## Critical Change Protocol (0c-ii)

1. **What is changing.** (a) One code deploy: `deriveWorstJusticeOutcome`'s `unevaluated` branch now requires **≥1 identified circle** (`derive-trust-events.ts` — a zero-circle dikaiosyne tag no longer emits `justice-surface-unevaluated`; a circle-present-but-unevaluated assessment, the U2/J2 class, still does). The same push carries the S11b Part-1 harness recomposition (already live locally via hot-reload) and the Part-2 predicate/report changes (report-time only). No flag, no schema, no mint. (b) One data correction: `justice_floor_active` → `false` on the single `agent_trust_state` row (`sagereasoning:s9-loop@v1`, `dikaiosyne`) — the cap that latched off the S9 install's zero-circle assessment (register D1: ONE event, 2026-07-11).
2. **What could break.** If the narrowing were mis-scoped, the J2 latch class could stop firing — pinned against by trust-core 98/0 (`S11b: circle present + no assessment ⇒ unevaluated (J2 KEPT)`) and kathekon-engagement 79/0 (§7.2/§7.3). The SQL could target the wrong row — guarded by the exact two-column WHERE and the pre-state SELECT that must return exactly 1 row before anything is updated.
3. **Existing sessions.** N/A — only founder + test logins (standing build-cache note). The public trust record for `sagereasoning:s9-loop@v1` changes (`justice_capped: true → false`) — a deliberate, intended standing change; the ledger event is NOT deleted (append-only historical truth, elected 2026-07-18).
4. **Rollback.** Code: `git revert` the S11b commit + redeploy (emission reverts to the pre-narrowing predicate). State: the restoring UPDATE in §C below (written BEFORE the forward step, per the session prompt). Note: restoring the latch without reverting the code re-publishes the incorrect signal — only roll back the state together with the code.
5. **Verification.** §D below (SELECT + public GET + the re-latch watch).
6. **Founder approval** is specific to: the live emission change on the accreditation path; the public record change on `sagereasoning:s9-loop@v1`; the one-row UPDATE.

## A. Pre-conditions (all discharged in-session before this walk)

- Batteries green: kathekon-engagement **79/0** · trust-core **98/0** · emission-hooks **15/0** · S10 **106/0** · logic-harness **150/0** · false-hold-capture **32/0** · **negative-battery 230/0 RELEASE GATE PASS** · `tsc` **0**.
- The adversarial review (Workflow `wf_1be6db48-016`) folded — see the session close for the disposition.
- The frozen-buffer dry-run under the narrowed arm reproduces the S11a §4.2 reconstruction (128 FP / 1 CH) — evidence, not a readiness claim.

## B. Step 1 — commit + push (founder; ENUMERATED paths, never `git add -A` — the 2026-07-17 incident lesson)

The commit command is in the session close's §Founder Verification. Then push via GitHub Desktop → **wait for the Vercel deploy to go green.** The SQL in §C MUST NOT run before the deploy is green — a data-only clear against the un-narrowed live reducer is one close-write away from re-latching (the S11a stability argument; verified at source: `accreditation/[agent_id]/route.ts:803` → `derive-trust-events.ts` → `trust-transition.ts:196`).

## C. Step 2 — the state correction (founder; Supabase SQL editor, PRODUCTION)

**C1 — pre-state (must return exactly 1 row; record the values):**
```sql
SELECT agent_id, virtue_domain, earned_level, justice_floor_active, coverage_status, updated_at
FROM public.agent_trust_state
WHERE agent_id = 'sagereasoning:s9-loop@v1' AND virtue_domain = 'dikaiosyne';
-- expect: 1 row; justice_floor_active = true
```

**C2 — THE ROLLBACK STATEMENT (do not run now — recorded before the forward step, per the session prompt):**
```sql
-- ROLLBACK ONLY (with a git revert of the reducer commit):
UPDATE public.agent_trust_state
SET justice_floor_active = true, updated_at = now()
WHERE agent_id = 'sagereasoning:s9-loop@v1' AND virtue_domain = 'dikaiosyne';
```

**C3 — the forward step:**
```sql
UPDATE public.agent_trust_state
SET justice_floor_active = false, updated_at = now()
WHERE agent_id = 'sagereasoning:s9-loop@v1' AND virtue_domain = 'dikaiosyne';
```
(The SQL editor shows "Success. No rows returned" on UPDATE — verify with C1 re-run, never by the editor message.)

**The ledger is untouched.** The single `justice-surface-unevaluated` event (2026-07-11 05:45:29.674+00) remains in `agent_trust_events` as append-only historical truth.

**⚠ Disclosed stability caveat (first-hand review, 2026-07-18):** because the historical EVENT stays in the ledger, any future **full-ledger replay** of the materialised state (the C-3 by-hand repair path — no rebuild tooling exists today) would re-apply its `cap` effect and RE-LATCH this row, undoing the correction. Any future rebuild tooling must either re-apply this correction after replay or carry a narrowing-aware replay; until then, if a by-hand replay is ever run for this identity, re-run §C3 afterward. Recorded in the register D1.

## D. Step 3 — §VERIFY

1. **DB:** re-run C1 → `justice_floor_active = false`.
2. **Public surface:** `GET https://www.sagereasoning.com/api/trust-record/sagereasoning:s9-loop@v1` → `justice_capped: false`; the dikaiosyne basis no longer reads "justice cap active". (Read-only; the AI can perform this re-read.)
3. **The re-latch watch (the stability proof):** after the NEXT session close-write on the gen-2 accred credential (the natural H4 write), re-run the GET → `justice_capped` must STILL be `false`. Post-narrowing, only a genuinely circle-carrying unevaluated/indeterminate assessment can latch — which would then be a correct signal. Record the outcome in the register D1.

---

*Walk record ends. On completion, D1 in `S11-FLIP-PREREQUISITES-REGISTER.md` moves to CORRECTED (stable) and the S11a disclose-and-carry disposition is discharged.*

---

## ✅ WALK DISCHARGED — 2026-07-18 (founder-performed; the AI guided + verified, ran no git/Vercel/Supabase op)

- **B:** commit `b2ae8d5` on `origin/main`; Vercel green; the narrowed reducer verified present on the pushed tree (`derive-trust-events.ts:208`) BEFORE any SQL ran.
- **C1:** 1 row, `justice_floor_active = true` (pre-state as expected). **C2:** rollback saved, not run. **C3:** forward UPDATE run; post-SELECT read `justice_floor_active = false`.
- **D1/D2:** public GET verified first-hand — `justice_capped: false`; basis "minimum-domain rule across 1 evaluated domain(s): dikaiosyne=deliberate; weighted by source confidence (min weight 0.420)"; the earned level correctly retained at `deliberate`.
- **D3 (pending observation):** the re-latch watch at the next gen-2 close-write — record the GET result in the register D1.
