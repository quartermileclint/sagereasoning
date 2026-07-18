# Session Close — 2026-07-18 — AE-1 ACTIVATION: the practice-delta layer is LIVE in production (MEASURE)

**Stream:** founder (agent-extension).
**Governing frame:** `/adopted/standing-protocol-cache.md` §Critical-risk sessions + `/adopted/build-sessions-protocol-cache.md`.
**Tier:** `code-critical` 0c-ii, **founder-walked** (AC7 engaged + discharged; PR6 + PR17). The founder ran every Supabase/Vercel/git/mint op; the AI guided + verified + made the repo doc edits and performed no live op.
**Date:** 2026-07-18.
**Binding design executed:** ADR-014 §§3.1, 4, 5 (the activation arm of `D-AGENT-EXTENSION-AE1-DELTA-LAYER-BUILT-DARK-REVIEW-FOLDED-2026-07-18`).

## Decisions Made
- **`D-AGENT-EXTENSION-AE1-ACTIVATION-LIVE-2026-07-18`** appended (full form — the complete record; this close is the operational digest).

## 1. What went live

The AE-1 practice-delta layer, built dark 2026-07-18, is now **LIVE in production under MEASURE**. On credential-bearing `/api/reason` consults the additive `meta.trajectory.delta` block (schema `agent-trajectory-delta-v1`) is served, and the M6 trajectory write stamps `layer1_source` (TRUE provenance). **Production is intentionally NOT byte-equivalent — a deliberate, intended standing change. Nothing binds; the engine assessment is untouched (read-and-describe).**

## 2. The walk (inviolable order — every step founder-run)

1. **Migration TEST → prod.** `website/supabase-agent-assessment-history-layer1-source-migration.sql` applied to TEST then PRODUCTION. §VERIFY green both: `layer1_source | text | YES`; the named CHECK `agent_assessment_history_layer1_source_check` present; at apply time TEST `total_rows=1 / marked_rows=0`, PROD `total_rows=454 / marked_rows=0` (every existing row unmarked).
2. **Flag + redeploy.** `SUBSTRATE_TRAJECTORY_DELTA_ENABLED=true` in Vercel Production + redeploy (green). Precondition `SUBSTRATE_TRAJECTORY_READ_ENABLED` already `true` (B1).
3. **Live smokes** (see §3).
4. **Teardown** — the throwaway smoke credential revoked (post-revoke consult → 401).
5. **R18 docs** — signed off, then applied + build-verified (see §4).

## 3. The live smokes — and the credential finding

**Credential finding (recorded; NOT fixed here):** the intended with-history credential is the gen-2 s9-loop consult. Its raw token in `.claude/settings.local.json` is **stale** — a live consult returned **HTTP 401** while the credential row `33bef3d4-018d-4313-bcfd-65a75132155c` reads `is_active=true` (the row is live; the token no longer hashes to it). This is the same 401 the session-open + at-action framing hooks showed all session — **the founder-loop harness is currently running unframed.** Refreshing/rotating it is its own follow-up and touches the S11a-cap-review-tracked s9-loop credential. So the smokes ran on a **throwaway** `sr_live_` credential (`mint api --daily 20 --monthly 50`, label "AE-1 activation smoke"), revoked at teardown.

| Smoke | Result |
|---|---|
| **3b — fresh → single_snapshot** | HTTP 200; `delta` present, `schema:"agent-trajectory-delta-v1"`; **every** signal floored `insufficient_extraction` with `*_basis` (floor 3); no fabricated trend; `vocabulary_note` names both floor causes; `bounds.mention_conversion` names `oikeiosis_extension` (both review LOW folds live); identity `presenting_credential`/`credential`/`agent_declared:false` |
| **3a — windowed** | `prior_instances:3`, `evidence:"windowed"`; `regime{ rows_in_window:3, rows_excluded_boundary_band:3, rows_in_segment:0, segment_used:null }` — the conservative regime split working correctly (see below) |
| **3c — the `layer1_source` stamp** | prod `SELECT layer1_source, count(*) GROUP BY 1` → **`server=4, null=454`** — the write stamp on true server-extraction provenance; all pre-column rows honestly unmarked |

**The boundary-day observation (honest limit):** today (2026-07-18) *is* the S11b extraction-regime boundary day, so every same-day throwaway row falls in the excluded one-day uncertainty band. The delta therefore correctly computed over nothing (segment empty, `segment_used:null`) and floored — the conservative split doing exactly its job. **Consequence:** a *populated* post-S11b segment and a non-zero `provenance.n_server` **within the delta** were not live-observable today (both battery-covered — trajectory-delta 73/0; they surface naturally on rows dated 07-19+). Nothing is wrong; nothing gates on it.

## 4. R18 docs (signed off before any public surface changed)

The M7 `meta.trajectory` overlay was itself **previously undocumented** on every public surface, so the honest R18 addition documents parent + child together (founder-approved scope).
- `website/public/llms.txt` — new `meta.trajectory` overlay + `meta.trajectory.delta` subsection in the `/api/reason` area.
- `website/public/.well-known/agent-card.json` — new `trajectory-delta/v1` extension (**18 extensions**; parses OK).
- `website/src/app/api-docs/page.tsx` — new `/api/reason` response-note bullet.

**Every surface restates:** evaluative-never-predictive · record-descriptive past tense · **WEIGHTS BLOCKED** (ADR-014 §5 — a per-mechanism improvement gradient is the shape of a training reward; no such use is offered or supported). `npm run build` ✓ Compiled successfully (exit 0; `/api-docs` + `/api/reason` registered).

## 5. Status Changes

| Item | Old | New |
|---|---|---|
| AE-1 (ADR-014 §7 slice 1) | Built dark; activation carried | **LIVE (MEASURE) in production** |
| `SUBSTRATE_TRAJECTORY_DELTA_ENABLED` | unset | **`true` (Vercel Production)** |
| `agent_assessment_history.layer1_source` (E-AE1-1) | authored, unapplied | **applied TEST + PROD; stamping live (`server`)** |
| agent-card extensions | 17 | **18** (`trajectory-delta/v1`) |
| `meta.trajectory` overlay (M7) | Live but undocumented | **documented (R18)** |
| s9-loop consult token in settings.local.json | (assumed valid) | **stale — harness running unframed (named follow-up)** |
| The S11 flip | REFUSED | **Unchanged. MEASURE throughout; weights BLOCKED.** |

## 6. Next Session Should

- **AE-2** (the CI-4 loop fold — wires `combineVerificationResults` through the shared identity module; kathekon-engagement-classified; MEASURE-only) → **AE-3** (last).
- **Named follow-up (recommended soon):** rotate/refresh the **s9-loop consult credential** so the founder-loop harness authenticates again (currently unframed). Its own step; touches the S11a-cap-review-tracked credential.
- Parallel, unblocked: RA-1-F1; the registry follow-up; the Layer-1 mention-conversion re-check (named at S11b).
- **First observable delta segment:** on any consult dated 07-19+ the post-S11b segment populates and `provenance.n_server` surfaces within the delta — worth an eyeball then (no action required).
- `inbox/Mentor feedback on website pages.rtf` remains uncaptured (its own session's input).

## 7. Blocked On

**The doc + records commit must be pushed** (the R18 docs go live on the founder's push; the migration + flag are already live). See §Founder Verification.

**Production state at session close (2026-07-18, PR18):** **AE-1 is LIVE (MEASURE)** — `SUBSTRATE_TRAJECTORY_DELTA_ENABLED=true`; the `layer1_source` migration applied on TEST + PROD and stamping (`server`); the R18 docs applied (live on push). Rollback = unset the flag + redeploy (byte-identical flag-off, test-asserted) + `git revert` the docs commit. All live trust/S9b flags, the trajectory flags (write/read/sweep), R18f, R20a, distress, Layer-2 signing, UPC auth, the `gate1-dogfood@v1` marker untouched. **The S11 enforce flag does not exist/is unset; the intervention engine remains MEASURE; ENFORCE remains S11 — refused on readiness. Weights BLOCKED. The 0h call remains the founder's.**

**Batteries (green, on the pushed build `933faf7`):** trajectory-delta **73/0** · trajectory-overlay **36/0** · agent-assessment-history-store **120/0** · `npm run build` ✓ (exit 0, `/api-docs` + `/api/reason` registered). No harness/trust-core file touched.

**Test artifacts (exclude from billing/trajectory samples):** the throwaway `sr_live_` "AE-1 activation smoke" credential (revoked) wrote 4 `agent_assessment_history` rows + ~5 `loop_billing_events` rows dated 07-18, `retain_until`-swept in 90d.

## 8. Founder Verification

```
cd "/Users/clintonaitkenhead/Claude-work/PROJECTS/sagereasoning"

git add website/public/llms.txt \
        website/public/.well-known/agent-card.json \
        website/src/app/api-docs/page.tsx \
        operations/decision-log.md \
        operations/handoffs/founder/2026-07-18-agent-extension-AE1-activation-CLOSE.md \
        CLAUDE.md

git commit -m "AE-1 ACTIVATION: the practice-delta layer is LIVE (MEASURE) — migration TEST->prod (layer1_source column + CHECK; 454 rows unmarked at apply) + SUBSTRATE_TRAJECTORY_DELTA_ENABLED=true in Vercel Production + redeploy (founder-walked 0c-ii, AC7); /api/reason now serves meta.trajectory.delta (agent-trajectory-delta-v1) + stamps layer1_source (TRUE provenance, server); live smokes green (3b fresh->single_snapshot all floored no fabrication; 3a windowed boundary-day exclusion working 3/3 excluded; 3c stamp server=4 null=454); throwaway smoke credential revoked (s9-loop settings token found STALE -> harness running unframed, NAMED FOLLOW-UP); R18 docs signed-off + applied (llms.txt meta.trajectory overlay + delta subsection [the M7 overlay was itself undocumented]; agent-card trajectory-delta/v1 = 18 extensions; api-docs bullet) all restating evaluative-never-predictive + WEIGHTS BLOCKED; batteries 73/0 . 36/0 . 120/0 . build green; production intentionally NOT byte-equivalent (MEASURE); S11 flip REFUSED; the 0h call remains the founder's

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>"
```
Then push via GitHub Desktop. **Vercel deploys the R18 docs (llms.txt / agent-card / api-docs); the delta feature is already live from the flag flip.**

Do NOT `git add -A` — the working tree carries other-stream files (`operations/handoffs/founder/2026-07-13-remaining-principles-build-plan-CLOSE.md`, `operations/trust-layer-2026-07/2026-07-13-remaining-stoic-principles-build-plan.md`, `website/src/data/environmental-context.json`, `inbox/Mentor feedback on website pages.rtf`) — untouched this session; add only the files enumerated above.

## 9. Cross-references
- `D-AGENT-EXTENSION-AE1-ACTIVATION-LIVE-2026-07-18` — the full record
- `D-AGENT-EXTENSION-AE1-DELTA-LAYER-BUILT-DARK-REVIEW-FOLDED-2026-07-18` — the build
- `operations/handoffs/founder/2026-07-18-agent-extension-AE1-activation-NEXT-SESSION-PROMPT.md` — the prompt executed this session
- ADR-014 §§3.1/4/5 (binding design) · the S11b close + `b2ae8d5` (the regime settlement)

---

*End of session close. One migration, one flag, one signed-off doc set — walked. The instrument now projects its own record's practice deltas on the live surface, floored where the evidence is thin and silent across the regime it just crossed. What it will not do is offer that record as a gradient to optimise against. MEASURE holds; the enforce assent is still yours.*
