# Session Close — 2026-06-07 — Pre-Launch S2: A12 OpenTelemetry activation (production go-live)

**Stream:** founder.
**Governing frame:** `/adopted/standing-protocol-cache.md` §"Critical-risk sessions" (full Critical Change Protocol) + `/adopted/build-sessions-protocol-cache.md`. PR17 — founder-performed steps walked live, not handed off.
**Tier:** `code-critical` — **Critical** under 0d-ii (deployment-config env-flag activation on the live `/api/reason` request path + a production `schema` migration; highest category governs).
**Date:** 2026-06-07. **Branch:** `main`.
**Operative prompt:** Session 2 of `/operations/pre-launch-bring-forward-plan-2026-06-07.md` (S2 next-session prompt).
**Predecessor closes:** `/operations/handoffs/founder/2026-06-03-A12-opentelemetry-instrumentation-close.md` (A12 built + Verified-live on TEST), `/operations/handoffs/founder/2026-06-07-prelaunch-S1-data-rights-go-live-close.md` (S1; most recent).

## What this session did

Session 2 of the pre-launch bring-forward plan. Turned on the A12 OpenTelemetry instrumentation + call-grain audit that was already built, Verified-live on TEST (2026-06-03), and deployed inert in production behind one unset flag. **No code changed** — the A12 code shipped 2026-06-03 (last A12 commit `739b28d`, on `main`). Two production changes, both founder-performed and walked live (PR17): (1) created the append-only `substrate_audit_events` table in the **production** Supabase project (`jdbefwkonfbhjquozgxr`, US East / N. Virginia); (2) set `SUBSTRATE_OTEL_ENABLED=true` for the Vercel **Production** environment and redeployed. Verified end-to-end in production with one benign `/api/reason` call → a masked audit row whose masking checked out. The substrate now records its own per-request timing + health into the audit table — the data Sessions 3 (A19) and 5 (A14) read.

Two decisions settled at open (founder elected both AI recommendations): **(1)** instrument `/api/reason` only (PR1 single-endpoint-proof; broadening is a separate Elevated session); **(2)** defer the production trace backend (PR7; ConsoleSpanExporter → Vercel logs suffices; the audit table is what unblocks A19/A14).

## Decisions Made
- `D-PRELAUNCH-S2-OTEL-ACTIVATION-2026-06-07` (**Critical**) appended. Full Critical-Change-Protocol record (6 points), risk classification, rollback path, and the founder-performed verification result (audit row + masking confirmation) recorded. Closes the "A12 OTel not active in production" deferral; unblocks Sessions 3 + 5.

## Status Changes
| Item | Old | New |
|---|---|---|
| `substrate_audit_events` (production) | absent | **Live (production)** |
| `SUBSTRATE_OTEL_ENABLED` (Vercel Production) | UNSET | **set `true`** |
| A12 (instrumentation + call-grain audit) | Verified-live (proof endpoint, TEST) | **Live (production, /api/reason)** |

## Verification Method Used (0c Framework)
- **Database change:** AI supplied the migration SQL + column-check + count queries; founder ran them in the **production** SQL editor (ref `jdbefwkonfbhjquozgxr`, confirmed before running) → "Success. No rows returned."; 14-column table confirmed; `count(*) = 0` before activation. ✅
- **Deployment-configuration change:** AI supplied the exact Vercel steps; founder set `SUBSTRATE_OTEL_ENABLED=true` (Production) + redeployed → build green, build log detected `@opentelemetry/sdk-trace-node@1.30.1` + the `instrumentationHook` experiment. ✅
- **API endpoint (live):** AI directed one benign `/api/reason` call via the founder-facing `/admin/test-reason` page (authenticated session, standard depth) → normal assessment, no distress redirect. Audit row confirmed in production Supabase; **masking read + confirmed by the AI** (structural fields only — Diagnostic-certain). ✅

## Risk Classification Record (0d-ii)
- Env-flag activation on the live `/api/reason` path: **Critical** (`code-critical`; deployment-configuration). Full Critical Change Protocol applied + walked live (PR17).
- Production migration (additive, idempotent, append-only): Elevated on its own; subsumed under the session's Critical classification.
- Decision-log entry + this close: **Standard** (governance/docs).
- PR6 **not** engaged — A12 instruments Layer 1/2/3 only; it does not touch the R20a distress classifier, the A7 Zone-2 gate, or their wrappers (grep-confirmed in the A12 close + the `substrate-telemetry.ts` PR6-boundary docstring). AC7 not engaged. No auth/session/encryption/access-control change.

## PR5 — Knowledge-Gap Carry-Forward
- No concept required re-explanation this session. Cumulative count: 0.

## Next Session Should
**Founder's election.** Per the pre-launch bring-forward plan: **Session 3 — A19 abuse-detection go-live + the two remaining detectors** (now unblocked — it reads the `substrate_audit_events` data this session activated), or **Session 4 — A13 automated alert delivery** (independent of OTel). Both are available; A19 is the natural follow-on since its data source is now live.

## Blocked On
**Files remaining uncommitted (docs only):**
- `operations/decision-log.md` (one entry appended)
- `operations/handoffs/founder/2026-06-07-prelaunch-S2-otel-activation-close.md` (this close)

**Production state at session close:** A12 instrumentation + call-grain audit **Live in production** on `/api/reason`; `substrate_audit_events` **Live (production)** and receiving masked rows; `SUBSTRATE_OTEL_ENABLED=true` (Production); spans export via ConsoleSpanExporter → Vercel runtime logs (no persistent trace backend — deferred PR7). `/api/reason` assessment behaviour unchanged (instrumentation is additive + no-throw). Both GDPR data-rights audit tables remain Live (S1); A13 cost-health detection Live; all four R20a flags `true`; injection-defence / Layer3 / plugin-install-auth flags UNSET; abuse-detection (A19) flag UNSET. AC7 not engaged.

## Open Questions
- None new. PR7 deferrals stand: production trace backend; broadening instrumentation beyond `/api/reason`; failure-path spans + route-level-redirect audit + windowed baselines.
- Pre-existing, **not caused this session** and **out of scope:** the production build log shows `Community map error: column community_map_pins.show_on_map does not exist` during static generation of `/api/community-map`. Unrelated to A12 (different table); did not fail the build (129/129 pages, deploy completed). Noted for a future session.

## Founder Verification (Between Sessions)
Commit the docs (no code change → the deploy is a behavioural no-op; the production changes this session were the hand-run Supabase migration + the Vercel flag, already applied):
```
cd "/Users/clintonaitkenhead/Claude-work/PROJECTS/sagereasoning"
rm -f .git/index.lock
git add operations/decision-log.md \
  operations/handoffs/founder/2026-06-07-prelaunch-S2-otel-activation-close.md
git commit -m "Pre-Launch S2: A12 OpenTelemetry activation — created substrate_audit_events in production (jdbefwkonfbhjquozgxr) + set SUBSTRATE_OTEL_ENABLED=true (Production) + redeployed; one benign /api/reason call wrote a masked audit row (masking confirmed). A12 -> Live (production, /api/reason). Docs only; no code change. Unblocks Sessions 3 (A19) + 5 (A14). (D-PRELAUNCH-S2-OTEL-ACTIVATION-2026-06-07)"
```
Then push via GitHub Desktop. The committed files are under `/operations/` (outside `/website/`), so even if Vercel rebuilds, no deployed behaviour changes — the redeploy that activated the flag already happened during the session.

**Independent re-verification (any time):** in the production Supabase SQL editor, run `select decision_event, masked_context, occurred_at from public.substrate_audit_events order by occurred_at desc limit 1;` → the latest row is `decision_event='assessment'` with a structural-only `masked_context` (no raw text).

## Orchestration Reminder
The AI has no persistent memory between sessions; these docs are its memory. At the next session open, read this close first, then the pre-launch bring-forward plan, then the chosen session's predecessor context. The arc: pre-launch bring-forward plan — S1 (data-rights go-live) ✅, **S2 (A12 OTel activation) ✅ this session**, S3 (A19 abuse-detection, now unblocked), S4 (A13 alert delivery, independent), S5 (A14 SLO/health tracker, now unblocked). Queued behind: Stage-1 close lawyer engagement (R19 register-posture upgrades; LRQ items); the stale `CLAUDE.md` production-state block + queued governance edits (separate housekeeping item).

## Cross-references
- `/operations/handoffs/founder/2026-06-03-A12-opentelemetry-instrumentation-close.md` (A12 build + TEST Verified-live)
- `/operations/handoffs/founder/2026-06-07-prelaunch-S1-data-rights-go-live-close.md` (predecessor; S1)
- `/operations/pre-launch-bring-forward-plan-2026-06-07.md`
- Decision log: `D-PRELAUNCH-S2-OTEL-ACTIVATION-2026-06-07` (+ predecessors `D-A12-OTEL-INSTRUMENTATION-AUDIT-PROOF-2026-06-03`, `D-A12-OTEL-INSTRUMENTATION-VERIFIED-LIVE-2026-06-03`)
- Migration: `supabase/migrations/20260603_a12_substrate_audit_events.sql`
- Flag gate: `website/src/instrumentation.ts`, `website/src/lib/substrate/substrate-telemetry.ts`

*End of session close. Stabilised to known-good: A12 OTel Live in production on `/api/reason`; `substrate_audit_events` Live + receiving masked rows; masking verified intact; two docs uncommitted awaiting the founder's commit; one-flag rollback available (delete `SUBSTRATE_OTEL_ENABLED` + redeploy → byte-identical).*
