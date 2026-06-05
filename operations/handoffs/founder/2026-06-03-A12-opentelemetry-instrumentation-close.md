# Session Close — 2026-06-03 — A12 OpenTelemetry Instrumentation + Call-Grain Audit — VERIFIED-LIVE (proof endpoint /api/reason)

**Stream:** founder.
**Governing frame:** `/adopted/standing-protocol-cache.md` + `/adopted/build-sessions-protocol-cache.md` ("no current users" holds).
**Tier:** `code-elevated` — **Elevated** under 0d-ii (instruments existing user-facing functionality + new external dependency). PR6 boundary preserved (not engaged). AC7 not engaged.
**Date:** 2026-06-03. **Branch:** `main`.
**Predecessor close:** `/operations/handoffs/founder/2026-06-03-A11b-combined-flag-on-test-probe-close.md`.

## What this session did

Built the A12 telemetry contract as a flag-gated, additive single-endpoint proof on `/api/reason` (PR1): OpenTelemetry GenAI spans over Layer 1 → Layer 2 → Layer 3, a correlation id (loop_id, else a fresh UUID) threaded through the sandwich, an append-only immutable `substrate_audit_events` table with a masked writer (structural fields only — never raw/free text), `provenance` + `use_policies` in an AP2-compatible shape (F4 / AC10), and a per-identity cost-baseline helper for A13/A19. Everything is inert in production behind `SUBSTRATE_OTEL_ENABLED` (unset). The R20a perimeter was not touched (PR6). Sandbox verification passed; the live TEST run is the founder's between-sessions step.

## Decisions Made
- `D-A12-OTEL-INSTRUMENTATION-AUDIT-PROOF-2026-06-03` (Elevated) appended. PR15 bespoke-vs-Agent-SDK-native justification + F4 fold-in recorded; PR6 boundary documented; rollback + founder-walked verification specified.
- `D-A12-OTEL-INSTRUMENTATION-VERIFIED-LIVE-2026-06-03` (Standard) appended. Founder-walked flag-ON TEST run passed: trace `ce61…` (L1/L2/L3/root spans, GenAI conventions, per-layer costs) + audit row whose `correlation_id` matches the trace, masking intact, AP2 provenance/use_policies present. **A12 → Verified-live on `/api/reason`.**

## Live Verification Result (2026-06-03, founder-performed in this session)
- **Trace:** `ce61b6a2946b96b6d2052d10dfacf333` — `substrate.reason` (root, OK) → `layer1.extract_features` (sonnet; cost 10413 µc) → `layer2.apply_mechanisms` (deterministic; no GenAI attrs) → `layer3.generate_prose` (sonnet; cost 13308 µc); all `sage.correlation_id=39a4f5c5-…`. Next.js auto-instrumentation also surfaced the real `fetch POST api.anthropic.com/v1/messages` span (free model-call telemetry once a backend is wired).
- **Audit row:** `correlation_id` matches the trace; `decision_event=assessment`; `provenance`+`use_policies` AP2-shaped; `masked_context` = counts/codes only (`input_char_count:72`, no raw text). Masking confirmed on real data.
- **No regression:** HTTP 200 normal assessment; no distress redirect; R20a untouched. Production never involved (TEST only).

## Status Changes
| Item | Old | New |
|---|---|---|
| A12 (instrumentation + audit) | Scoped | **Verified-live (proof endpoint /api/reason)** |
| `substrate_audit_events` table | — | Applied to TEST + a row written/verified (production application deferred) |
| OTel deps (`@opentelemetry/*`) | absent | added + installed; live trace emitted via ConsoleSpanExporter |

A12 reached **Verified-live** this session — the founder-walked TEST run passed (see Live Verification Result above).

## Verification Method Used (0c Framework)
- **AI side (complete this session):** `npx tsx src/lib/substrate/__tests__/substrate-audit-writer.test.ts` → **25/25 passed** (decision-event mapping; masking-contract structural-only + no-canary-leak; AP2 provenance/use_policies shape; telemetry no-op safety flag-off AND flag-on-without-provider). `npx tsc --noEmit` → **0 errors** project-wide. **PR2 grep** confirms invocation on the live path: `route.ts:893` (root span wraps `runSandwich`), `route.ts:948` (audit write), `parallel-run.ts:557/676/753` (L1/L2/L3 spans).
- **Founder side (between sessions; the live half — reaches `localhost`, which the Cowork sandbox cannot):** see "Founder Verification" below.

## Risk Classification Record (0d-ii)
- Code + migration + deps: **Elevated** (`code-elevated`). Additive, flag-gated, reversible. PR6 not engaged (no R20a-perimeter touch — by design + grep-confirmed). AC7 not engaged.
- Decision-log entry + this close: **Standard** (governance/docs).

## PR5 — Knowledge-Gap Carry-Forward
- No concept required re-explanation. One new one-time observation: tsx's CJS transform rejects top-level `await` in a test script — wrap the run body in an async IIFE. Cumulative count: 1 (not yet a register entry).

## Next Session Should
**Your election.** Recommended: **A13 — R5 cost-as-health-metric alerts** (Elevated; ~1 session) — depends on A12; consumes the per-identity baseline helper + the audit/billing surfaces this session built. Then Stage-1 close work. **A15a** (R17c deletion endpoint, Critical) and **A19** (abuse-detection, Elevated) remain available. **Before A13:** run the A12 live TEST below to take A12 to Verified-live, and (optionally) approve the AC10 manifest cross-reference (F4 governance edit, deferred).

## Blocked On
**Files remaining uncommitted (commit commands below):**
- `supabase/migrations/20260603_a12_substrate_audit_events.sql`
- `website/src/lib/substrate/substrate-telemetry.ts`
- `website/src/lib/substrate/substrate-audit-writer.ts`
- `website/src/lib/substrate/substrate-identity-baseline.ts`
- `website/src/lib/substrate/__tests__/substrate-audit-writer.test.ts`
- `website/src/instrumentation.ts`
- `website/next.config.js`
- `website/package.json` + `website/package-lock.json`
- `website/src/lib/translation-sandwich/parallel-run.ts`
- `website/src/app/api/reason/route.ts`

**Production state at session close:** **UNCHANGED / byte-identical.** `SUBSTRATE_OTEL_ENABLED` UNSET everywhere; `experimental.instrumentationHook` is enabled but `register()` is a strict no-op without the flag. `substrate_audit_events` not yet applied to any DB. `SUBSTRATE_INJECTION_DEFENCE_ENABLED` UNSET; all four R20a flags `true`; `SUBSTRATE_LAYER3_ENABLED` UNSET (503); `PLUGIN_INSTALL_AUTH_ENABLED` UNSET; `/api/reason` byte-identical. AC7 not engaged.

## Open Questions
- **AC10 manifest cross-reference (F4):** governing-doc edit — deferred pending your approval (I will not edit the manifest without it).
- **Production migration + flag activation + OTel backend:** separate deploy decisions; not needed for the proof (PR7).
- **Failure-path spans, route-level-redirect audit, windowed baselines:** trivial follow-ons before rollout (PR7).

## Founder Verification (Between Sessions)

**Part 1 — persist the build (docs + code; no Vercel behaviour change — the flag is unset, so the deploy is byte-identical):**
```
cd "/Users/clintonaitkenhead/Claude-work/PROJECTS/sagereasoning"
git add supabase/migrations/20260603_a12_substrate_audit_events.sql \
        website/src/lib/substrate/substrate-telemetry.ts \
        website/src/lib/substrate/substrate-audit-writer.ts \
        website/src/lib/substrate/substrate-identity-baseline.ts \
        website/src/lib/substrate/__tests__/substrate-audit-writer.test.ts \
        website/src/instrumentation.ts \
        website/next.config.js \
        website/package.json website/package-lock.json \
        website/src/lib/translation-sandwich/parallel-run.ts \
        website/src/app/api/reason/route.ts \
        operations/decision-log.md \
        operations/handoffs/founder/2026-06-03-A12-opentelemetry-instrumentation-close.md
git commit -m "A12 Wired (inert; sandbox-verified): OTel GenAI spans + append-only call-grain audit on /api/reason, flag-gated behind SUBSTRATE_OTEL_ENABLED; masked audit writer (no raw text), AP2 provenance/use_policies (F4/AC10); 25/25 unit + tsc clean; production byte-identical. (D-A12-OTEL-INSTRUMENTATION-AUDIT-PROOF-2026-06-03)"
```
Then push via GitHub Desktop. **Independent verification after push:** Vercel deploy goes green; `/api/reason` behaves exactly as before (the flag is unset in production).

**Part 2 — the live TEST run (takes A12 to Verified-live). Do this against the TEST Supabase project, not production:**
1. **Apply the migration to TEST.** Supabase dashboard → your **TEST** project → **SQL Editor** → **New query** → paste the full contents of `supabase/migrations/20260603_a12_substrate_audit_events.sql` → **Run**. Expected: "Success. No rows returned."
2. **Confirm the table exists.** In the SQL Editor run: `SELECT count(*) FROM substrate_audit_events;` → expected `0`.
3. **Install + start dev against TEST.** In a terminal:
   ```
   cd "/Users/clintonaitkenhead/Claude-work/PROJECTS/sagereasoning/website"
   npm install
   SUBSTRATE_OTEL_ENABLED=true npm run dev
   ```
   Expected: the dev server starts and prints `[instrumentation] SageReasoning substrate OTel registered (… ConsoleSpanExporter)`.
4. **Make one benign `/api/reason` call** (API-key path, as in the A10/A11b runs — same throwaway key/JWT you used there). Use a plainly benign input (e.g. "I keep putting off a tedious work task and feel mildly annoyed at myself").
5. **Watch terminal 1.** A `substrate.reason` trace prints with child spans `substrate.layer1.extract_features`, `substrate.layer2.apply_mechanisms`, `substrate.layer3.generate_prose`, and `substrate.audit.insert`, all sharing one `sage.correlation_id`.
6. **Check the audit row.** In the TEST SQL Editor:
   ```
   SELECT decision_event, severity_band, models_used, provenance, use_policies, masked_context
   FROM substrate_audit_events ORDER BY occurred_at DESC LIMIT 1;
   ```
   Expected: one row, `decision_event = 'assessment'`, `masked_context` containing only structural fields (`input_char_count`, `engine_attribution`, etc.) and **no raw input text or prose**, `provenance` + `use_policies` populated.
7. **Confirm masking (the safety check).** Read the `masked_context` value — it must contain no sentence from your input and no free-text findings. If it does, stop and tell me (that would be a masking defect).
8. **Teardown.** Stop the dev server (Ctrl-C); the flag was only set for that shell, so nothing persists. Production was never involved.

Paste terminal output + the SQL row back next session and I'll record A12 → Verified-live.

## Cross-references
- Decision log: `D-A12-OTEL-INSTRUMENTATION-AUDIT-PROOF-2026-06-03`
- Predecessor close: `/operations/handoffs/founder/2026-06-03-A11b-combined-flag-on-test-probe-close.md`
- Staging plan: `/adopted/substrate-plugin-staging-plan.md` §A12 (+ A13 dependency)
- F4 finding: `/operations/agentic-commerce-findings-downstream-order.md` §F4
- Identity surface A12 builds on: `D-A10-SMOKE-TEST-VERIFIED-LIVE-2026-06-03`

*End of session close. Stabilised to known-good — production byte-identical to session open; A12 code Wired + inert behind `SUBSTRATE_OTEL_ENABLED`; sandbox-verified (25/25 unit, tsc clean, PR2 grep); the live TEST run is the founder's between-sessions step to reach Verified-live.*
