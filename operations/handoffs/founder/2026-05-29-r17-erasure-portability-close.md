# Session Close — 2026-05-29 — R17 Erasure + Portability Completeness (Gap #1)

**Stream:** founder.
**Governing frame:** `/adopted/standing-protocol-cache.md` + `/adopted/build-sessions-protocol-cache.md` ("no current users" holds).
**Tier:** `code-critical` — Critical risk (data deletion + service-role access). Full templates + Critical Change Protocol applied.
**Date:** 2026-05-29.
**Branch:** `main` (the AI did no git operations).

## What this session did

Diagnosed and resolved the inventory's top-ranked gap. **The diagnosis overturned the premise:** erasure of the intimate mentor store was already complete via the database cascade — `auth.admin.deleteUser` removes the `auth.users` row and Postgres cascade-deletes the whole intimate store. The real, confirmed gap was **export** (no cascade assists it; the intimate store was omitted). Per founder election, both routes were changed: delete made belt-and-braces + honest log; export extended to include the intimate store with plaintext decryption for the subject.

## Decisions Made
- `D-R17-ERASURE-PORTABILITY-COMPLETENESS-2026-05-29` appended (full form). Diagnosis result (all tables Class A/B, no orphans), the two route changes, the Critical Change Protocol record, and the pending live-test counts.

## Status Changes
| Item | Old | New |
|---|---|---|
| Belief: deletion omits the intimate store (inventory gap #1) | Assumed (diagnostic-uncertain) | **Corrected — erasure already complete via cascade** (Diagnostic-certain) |
| `/api/user/delete` intimate-store coverage | Cascade-only (implicit) | **Explicit + honest audit log** (Wired + typecheck-verified; Verified-live pending) |
| `/api/user/export` intimate-store coverage | Omitted (Art 15/20 incomplete) | **Included, decrypted for subject** (Wired + typecheck-verified; Verified-live pending) |
| 0h criterion / LC#7 erasure+access leg | Open gap | **Closed pending live test** |
| Production state | Four R20a flags UNSET | **UNCHANGED** (no deploy this session) |

## Verification Method Used (0c Framework)
- **API endpoint** work type → "AI provides a test command with expected output; founder runs it." Static check done in-session (`npx tsc --noEmit` → EXIT=0, 0 errors). The end-to-end live test is the founder-run leg (walkthrough doc), because it requires a TEST environment the Cowork sandbox cannot reach (PR17).

## Risk Classification Record (0d-ii)
- `/api/user/delete` change — **Critical** (data deletion + service-role). Critical Change Protocol completed; founder approved the named scoping-column risk ("go ahead").
- `/api/user/export` change — **Elevated** (changes existing user-facing functionality; no deletion). Held under the Critical template for the session.

## PR5 — Knowledge-Gap Carry-Forward
- No concept required re-explanation this session. KG1 (Vercel/DB-write rules) engaged and observed (independent per-table deletes, graceful "does not exist" handling, fail-soft logging preserved). No new candidate entries.

## Next Session Should
Record the live-test counts (founder runs the walkthrough), then either (a) promote the inventory to `/adopted/` and/or fix the two documentation-drift observations in a short governance pass, or (b) move to the inventory's gap **#2/#3 — finish Option A** (R20a agent-path live proof: resume `/operations/handoffs/founder/2026-05-28-OPTION-A-session-5-NEXT-SESSION-PROMPT.md`). Founder picks.

## Blocked On — single commit list (stage by name; do NOT `git add .`)

**Files remaining uncommitted (this session):**
- `website/src/app/api/user/delete/route.ts`
- `website/src/app/api/user/export/route.ts`
- `operations/handoffs/founder/2026-05-29-r17-erasure-portability-LIVE-TEST-WALKTHROUGH.md`
- `operations/decision-log.md` (one entry appended)
- `operations/handoffs/founder/2026-05-29-r17-erasure-portability-close.md` (this file)

**Production state at session close:** **UNCHANGED.** No deploy this session. All four R20a flags UNSET; `/api/reason` byte-identical; `/api/substrate/layer3` → 503. The two route changes are committed to the repo only when the founder pushes; they reach production on the next Vercel deploy. AC7 not engaged. PR6 not engaged.

## Open Questions
- Live-test counts pending (founder runs the walkthrough; report back to fill the decision-log Verification block).
- Manifest R17c "placeholder 503" drift and the `mentor_profiles` dual-definition schema-drift — fix in a later governance/registry pass? (Both noted as observations; neither blocks anything.)

## Founder Verification (Between Sessions)

**1. Confirm the deliverables landed:**
```
cd "/Users/clintonaitkenhead/Claude-work/PROJECTS/sagereasoning"
grep -n "D-R17-ERASURE-PORTABILITY-COMPLETENESS-2026-05-29" operations/decision-log.md
ls operations/handoffs/founder/2026-05-29-r17-erasure-portability-LIVE-TEST-WALKTHROUGH.md
git diff --stat website/src/app/api/user/delete/route.ts website/src/app/api/user/export/route.ts
```
Expected: grep matches near the end of the log; walkthrough file exists; both routes show additive changes.

**2. Run the live test** per `operations/handoffs/founder/2026-05-29-r17-erasure-portability-LIVE-TEST-WALKTHROUGH.md` against a TEST environment (throwaway users only — never your own account). Report the before/after counts and the export key list; I'll record them in the decision-log Verification block and mark both routes Verified-live.

**3. To commit (stage by name; do NOT `git add .`):**
```
cd "/Users/clintonaitkenhead/Claude-work/PROJECTS/sagereasoning"
git add \
  website/src/app/api/user/delete/route.ts \
  website/src/app/api/user/export/route.ts \
  "operations/handoffs/founder/2026-05-29-r17-erasure-portability-LIVE-TEST-WALKTHROUGH.md" \
  operations/decision-log.md \
  "operations/handoffs/founder/2026-05-29-r17-erasure-portability-close.md"
git commit -m "R17 erasure+portability completeness (code-critical; CCP applied). Diagnosis: intimate-store erasure already complete via DB cascade (all tables Class A/B, no orphans). Delete route extended to explicit belt-and-braces deletion + honest compliance_deletion_log; export route extended to include full intimate store with plaintext decryption for the data subject (GDPR Art 15/20). tsc clean. Live test pending (throwaway-account walkthrough). No production change; four R20a flags UNSET. (D-R17-ERASURE-PORTABILITY-COMPLETENESS-2026-05-29)"
```
Then push via GitHub Desktop. **Vercel will deploy the two route changes on push** — this is the first production-affecting step; behaviour change is limited to `/api/user/delete` (now deletes more, explicitly) and `/api/user/export` (now returns more). Run the live test before or right after deploy to confirm.

## Cross-references
- `/operations/handoffs/founder/2026-05-29-capability-inventory-first-pass-close.md` — predecessor (gap ranking).
- `/drafts/2026-05-29-capability-inventory-first-pass.md` — gap #1 (and #5) source.
- `/operations/handoffs/founder/2026-05-29-r17-erasure-portability-LIVE-TEST-WALKTHROUGH.md` — the live-test script.
- `/operations/handoffs/founder/2026-05-28-OPTION-A-session-5-NEXT-SESSION-PROMPT.md` — the #2/#3 next gap (Option A).
- Decision log: `D-R17-ERASURE-PORTABILITY-COMPLETENESS-2026-05-29`.

*End of session close. Stabilised to a known-good state: diagnosis complete (erasure was already cascade-complete), both routes hardened + extended and typecheck-clean, live-test walkthrough ready, production UNCHANGED until the founder pushes. The one remaining gate is the founder-run live test.*
