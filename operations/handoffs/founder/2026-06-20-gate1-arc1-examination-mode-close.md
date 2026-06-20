# Session Close — 2026-06-20 — Gate-1 Arc 1: `examination_mode` credential extension (built DARK, TEST-Verified)

**Stream:** founder.
**Governing frame:** /adopted/standing-protocol-cache.md (Critical templates) + project instructions 0c-ii.
**Tier:** `code-critical` — Critical risk (accreditation write boundary + public trust credential; AC7).
**Date:** 2026-06-20.
**Mode:** Cowork (cannot reach production — activation is a separate founder-walked session).

## Decisions Made
- `D-SAGE-PRACTICE-GATE1-ARC1-EXAMINATION-MODE-BUILT-DARK-TEST-VERIFIED` appended. Arc 1 — the unforgeable `examination_mode` credential field — built dark, flag-gated (`SUBSTRATE_EXAMINATION_MODE_ENABLED`, UNSET), un-issued, TEST-Verified. **No production change.**
- Founder election: marker-threading = **minimal-touch** (narrow route-local provenance read; shared validators left byte-identical) over extending the shared validator.

## Status Changes
| Item | Old | New |
|---|---|---|
| `examination_mode` credential extension (Arc 1) | Scoped | **Verified (dark)** — Live awaits activation |
| `examination-mode-flag.ts` (flag + marker read) | — (new) | Verified (dark) |
| `agent_accreditation.examination_mode` migration | — (new) | Written, **NOT applied** to prod |
| Public docs for `examination_mode` | — | **Staged** (not applied) |
| Arc 2 (pre-decision harness) / Arc 3 (hosted contract) | Scoped | Scoped (carried) |

## What was built (all dark; flag-off byte-identical to pre-Arc-1)
The unforgeable end-to-end chain: **admin mint** sets `credential_provenance.examination_enforcement` (admin-gated — the unforgeability root) → the **accreditation route** reads it flag-gated + fail-closed → the **composer** (`harness_enforced` path) server-composes `examination_mode` (a consumer record's own value is ignored) → the **writer** forwards it → the **store chokepoint** writes the column flag-gated (flag-off omits the key → no PGRST204) → **`buildAccreditationPayload`** folds it onto the public payload (flag-off omits the key). D3 honoured: `coverage_status` stays `agent_elected`; `continuous` is not repurposed. Both `/trust-layer` mirror trees synced.

## Verification Method Used (0c framework)
- **Governance implementation / API:** tsc `--noEmit` **0 errors**; the unforgeability + byte-identity battery `examination-mode.test.ts` **32/0**; writer forwarding regression `sage-assent-accreditation-writer.test.ts` **57/0** (incl. W-EXAM-1/2/3); accreditation `route.test.ts` **90/90**; regression `coverage-status` 26/0, `accreditation-store-k1-fields` 14/0, `mint-credential-core` 56/0.
- **Adversarial pre-activation review** (2 parallel subagents, first-hand code trace): both load-bearing claims **HOLD** — (1) unforgeability (only an admin-minted provenance marker reaches `pre_decision_harness`; consumer record values ignored at compose + store; mint is admin-gated; marker matched exactly + fail-closed), (2) flag-off byte-identity (no column written, no payload key, no extra auth DB read; pure mappers env-free). One **HIGH** finding (the writer dropped the field between route and store) — **folded + regression-locked in-session**. Two LOW consciously left (lazy Supabase client preserves the pure flag-helpers' import-safety; cosmetic mirror comment drift).
- **`next build` limitation:** not runnable in the Linux sandbox — the mounted `node_modules` carries macOS-built native binaries (the same cause that blocked `tsx`, worked around with a sandbox-local tsx in `/tmp`). Its unique gate (no new non-handler route exports) confirmed by inspection; the real Linux build runs at deploy. **Founder to run `npm run build` between sessions** (command below).

## Risk Classification Record (0d-ii)
- Whole session: **Critical** (accreditation write boundary + public trust credential; AC7). The build made **no production change** (dark/flag-off byte-identical); the full Critical Change Protocol governs ACTIVATION (separate session). PR2 engaged.

## PR5 — Knowledge-Gap Carry-Forward
- No concepts required re-explanation. One environment note worth carrying: **`tsx` cannot run against the mounted `node_modules` in the Linux sandbox** (macOS-built esbuild/SWC binaries) — worked around by installing `tsx` into a sandbox-local `/tmp` prefix (no side effects on the repo). `tsc` (pure JS) runs fine. This is a sandbox ergonomics fact, not a code defect.

## Blocked On
**Files remaining uncommitted (the founder commits by name):** see Founder Verification.
**Production state at session close (PR18):** **unchanged — NO production change this session.** `SUBSTRATE_EXAMINATION_MODE_ENABLED` is UNSET everywhere; the `agent_accreditation.examination_mode` migration is NOT applied; nothing public changed. Everything Live in production before this session is exactly as the 2026-06-19 Part-C close left it. Arc 1 is **built dark / inert**, awaiting a founder-walked activation.

## Open Questions
None blocking.

## Next Session Should
**Activate Arc 1** (a founder-walked Critical 0c-ii) per `operations/handoffs/founder/2026-06-20-gate1-arc1-examination-mode-ACTIVATION-NEXT-SESSION-PROMPT.md`: apply the migration (BEFORE the flag), set the flag in Vercel + redeploy, verify a discretionary write reads `post_decision_check`, apply the staged docs. **The `pre_decision_harness` marker stays UN-ISSUED until Arc 2 exists.** Then Arc 2 (the pre-decision harness/plugin) and Arc 3 (the hosted-configuration contract). The 0h launch call remains the founder's and is unaffected (this is pre-0h trust-layer honesty work).

## Founder Verification (between sessions)
```
cd "/Users/clintonaitkenhead/Claude-work/PROJECTS/sagereasoning/website"
npx tsc --noEmit
npx tsx --env-file=.env.local src/lib/substrate/__tests__/examination-mode.test.ts                 # 32 passed, 0 failed
npx tsx --env-file=.env.local src/lib/substrate/__tests__/sage-assent-accreditation-writer.test.ts # 57 passed / 0 failed
npm run build                                                                                       # compiles clean
```
Then commit + push (the change is dark — flag UNSET — so pushing deploys byte-identical behaviour; the migration is a separate founder-applied step at activation):
```
cd "/Users/clintonaitkenhead/Claude-work/PROJECTS/sagereasoning"
git add website/src/lib/substrate/examination-mode-flag.ts \
        website/src/lib/substrate/trust-layer/types/accreditation.ts \
        website/src/lib/substrate/trust-layer/accreditation/coverage-status.ts \
        website/src/lib/substrate/trust-layer/accreditation/accreditation-record.ts \
        website/src/lib/substrate/sage-assent-accreditation-store.ts \
        website/src/lib/substrate/sage-assent-accreditation-writer.ts \
        "website/src/app/api/accreditation/[agent_id]/route.ts" \
        website/src/app/api/admin/api-keys/route.ts \
        website/src/lib/admin-mint/mint-credential-core.ts \
        website/src/lib/substrate/__tests__/examination-mode.test.ts \
        website/src/lib/substrate/__tests__/sage-assent-accreditation-writer.test.ts \
        website/supabase-agent-accreditation-examination-mode-migration.sql \
        trust-layer/types/accreditation.ts \
        trust-layer/accreditation/coverage-status.ts \
        trust-layer/accreditation/accreditation-record.ts \
        drafts/sage-practice-examination-mode-credential-build-scope.md \
        drafts/sage-practice-examination-mode-docs-staged.md \
        operations/decision-log.md \
        operations/handoffs/founder/2026-06-20-gate1-arc1-examination-mode-close.md \
        operations/handoffs/founder/2026-06-20-gate1-arc1-examination-mode-ACTIVATION-NEXT-SESSION-PROMPT.md
git commit -m "Gate-1 Arc 1: examination_mode credential extension (dark, flag-gated, un-issued; TEST-Verified)"
```
Then push via GitHub Desktop. Vercel should build green; **behaviour is byte-identical until activation** (flag UNSET).

## Cross-references
- /operations/decision-log.md — `D-SAGE-PRACTICE-GATE1-ARC1-EXAMINATION-MODE-BUILT-DARK-TEST-VERIFIED`
- drafts/sage-practice-examination-mode-credential-build-scope.md (the Arc 1 spec)
- drafts/sage-practice-examination-mode-docs-staged.md (the staged public docs)
- operations/handoffs/founder/2026-06-20-gate1-arc1-examination-mode-ACTIVATION-NEXT-SESSION-PROMPT.md (activation)
- drafts/D-gate1-surface-honesty-option2-honest-differentiation.md (the decision)

*End of session close. Stable, known-good state: Arc 1 built dark and TEST-Verified; flag UNSET; no production change; activation is the founder's next, walked-live step.*
