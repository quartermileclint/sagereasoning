# Session Close — 2026-06-20 — Gate-1 Arc 1: `examination_mode` ACTIVATED in production

**Stream:** founder.
**Governing frame:** /adopted/standing-protocol-cache.md (Critical templates) + project instructions 0c-ii + PR17.
**Tier:** `code-critical` — Critical risk (accreditation write boundary + public trust credential; AC7; env-flag activation).
**Date:** 2026-06-20.
**Mode:** Cowork. Every production step (Supabase migration, Vercel flag + redeploy, the live read checks) was **founder-performed, walked live one step at a time** (PR17). The AI performed no Supabase/Vercel/git operation — it guided, supplied exact SQL/URLs, and verified.

## Decisions Made
- `D-SAGE-PRACTICE-GATE1-ARC1-EXAMINATION-MODE-ACTIVATION` appended (Critical full form). Arc 1 `examination_mode` is **Live in production**.
- **Founder election 1 — verification depth:** STOP at the light proof (DB NULL read + public-GET field presence); do not land a genuine examination-backed `post_decision_check` write (TEST-verified composition + live R18f provenance-gate cost made it disproportionate).
- **Founder election 2 — public docs:** APPLY the field-semantics + attestation-limit tier now; HOLD the per-configuration "Gate 1 — pre-decision" contract language until the Arc 2 harness exists.

## Status Changes
| Item | Old | New |
|---|---|---|
| `examination_mode` credential extension (Arc 1) | Verified (dark) | **Live** |
| `agent_accreditation.examination_mode` migration | Written, not applied | **Applied to production** |
| `SUBSTRATE_EXAMINATION_MODE_ENABLED` | UNSET | **`true` (Vercel Production)** |
| Public docs (llms.txt / agent-card / api-docs) | Staged | **Applied (live on the founder's push)** |
| Arc 2 (pre-decision harness) / Arc 3 (hosted contract) | Scoped | Scoped (carried) |

## What was activated
Migration **before** flag (inviolable order). The public GET `/api/accreditation/{agent_id}` now folds `examination_mode` onto `data`: `post_decision_check` for new discretionary writes, `null` for rows written before the field. `pre_decision_harness` is unreachable — no operator-issued harness credential exists (the marker is **un-issued by design** until Arc 2). The three public surfaces carry the field definition + the load-bearing "attestation, not a cryptographic proof of timing" honesty note.

## Verification Method Used (0c framework)
- **Schema (Database change):** §0 pre-flight SELECT confirmed `examination_mode` absent; §2 VERIFY confirmed the column (`text`, nullable) + the CHECK present.
- **API endpoint:** `GET /api/accreditation/agent_test_v1` returned `"examination_mode": null` inside `data` — the key's **presence** is the flag-took-effect proof (flag-off omits it entirely). DB `SELECT` showed all 5 existing rows `NULL`.
- **Governance/JSON:** `agent-card.json` machine-validated (valid JSON, 13 extensions, `examination-mode/v1` values `[pre_decision_harness, post_decision_check, null]`).
- **NOT exercised live:** the `post_decision_check` fresh-write path (founder election 1) — rests on the dark-build battery (32/0) + the unchanged store write chokepoint.

## Risk Classification Record (0d-ii)
- Whole session: **Critical** (AC7 — public credential read changed; deployment-config env-flag activation). Full Critical Change Protocol completed visibly before each live step; PR17 engaged throughout; PR6 NOT engaged (no R20a/distress/Layer-2-signing surface touched).

## PR5 — Knowledge-Gap Carry-Forward
- No concepts required re-explanation. Two environment facts carried: (1) the Cowork **sandbox mount blocks `rm`/unlink inside `.git`** — a stale `.git/index.lock` left by a sandbox `git status` cannot be cleared from the sandbox; the founder clears it on their machine (command in Founder Verification). (2) `next build` is not runnable in the sandbox (macOS-built `node_modules` binaries) — the founder runs it; **the api-docs `page.tsx` change makes `npm run build` a required gate this session**, not just `tsc`.

## Blocked On
**Files changed this session (the founder commits by name):**
- `website/public/llms.txt` — new "Accreditation — Examination mode" subsection
- `website/public/.well-known/agent-card.json` — new `examination-mode/v1` extension (13 total)
- `website/src/app/api-docs/page.tsx` — accreditation read-back note + example field
- `operations/decision-log.md` — `D-SAGE-PRACTICE-GATE1-ARC1-EXAMINATION-MODE-ACTIVATION`
- `CLAUDE.md` — production-state block (PR18, as-of 2026-06-20)
- `operations/handoffs/founder/2026-06-20-gate1-arc1-examination-mode-ACTIVATION-close.md` (this file)

(The `agent_accreditation.examination_mode` migration is **already applied to production** — a founder-performed DB step, not a code change. The migration SQL file was committed in the Arc 1 build commit `5047b48`.)

**Production state at session close (PR18):** `SUBSTRATE_EXAMINATION_MODE_ENABLED=true` in Vercel Production; `agent_accreditation.examination_mode` column live; the public accreditation payload serves `examination_mode` (`post_decision_check`/`null`; `pre_decision_harness` un-issued). The public-doc changes go live on the founder's push. **No other production change.** Everything else Live before this session is unchanged.

## Open Questions
None blocking.

## Next Session Should
**Arc 2 — the pre-decision harness/plugin** (where `pre_decision_harness` is first issued to a genuine operator-minted harness credential), then **Arc 3 — the hosted-configuration contract language**. Both Scoped (`drafts/sage-practice-pre-decision-harness-design.md`). The 0h launch call remains the founder's and is unaffected — this was pre-0h trust-layer honesty work.

## Founder Verification (between sessions)
First, clear the stale sandbox lock so GitHub Desktop can commit (the AI could not remove it from the sandbox):
```
rm -f "/Users/clintonaitkenhead/Claude-work/PROJECTS/sagereasoning/.git/index.lock"
```
Then build (REQUIRED — `page.tsx` is in the build graph) and spot-check the live surfaces:
```
cd "/Users/clintonaitkenhead/Claude-work/PROJECTS/sagereasoning/website"
npm run build        # expect: compiles; /api-docs + /api/accreditation registered
```
Public spot-checks (browser, no auth):
- `https://www.sagereasoning.com/api/accreditation/agent_test_v1` → `data.examination_mode: null`
- `https://www.sagereasoning.com/.well-known/agent-card.json` → `capabilities.extensions` includes `examination-mode/v1`

Then commit the files listed in **Blocked On** and push via GitHub Desktop. Vercel should build green; the public docs go live on push.

## Cross-references
- /operations/decision-log.md — `D-SAGE-PRACTICE-GATE1-ARC1-EXAMINATION-MODE-ACTIVATION`
- operations/handoffs/founder/2026-06-20-gate1-arc1-examination-mode-close.md (the build close)
- operations/handoffs/founder/2026-06-20-gate1-arc1-examination-mode-ACTIVATION-NEXT-SESSION-PROMPT.md (this session's prompt)
- drafts/sage-practice-examination-mode-docs-staged.md (the staged docs — now applied)
- drafts/sage-practice-pre-decision-harness-design.md (Arc 2)
- website/supabase-agent-accreditation-examination-mode-migration.sql (the applied migration)

*End of session close. Stable, known-good state: Arc 1 `examination_mode` is Live in production and reads honestly; docs applied (live on push); `pre_decision_harness` un-issued until Arc 2; rollback = unset the flag + redeploy.*
