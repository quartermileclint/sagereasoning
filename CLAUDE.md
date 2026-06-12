# CLAUDE.md — SageReasoning project entry point for Claude Code sessions

> **For Cowork mode sessions:** the project-instructions panel is the operative
> surface. This file is supplementary. The founder paste-syncs the panel against
> `/adopted/project-instructions-snapshot.md` between sessions. The standing
> protocol cache at `/adopted/standing-protocol-cache.md` is the heavy-lifter
> for both Cowork and Claude Code.

## At session open

Read in this order:

1. `/adopted/standing-protocol-cache.md` — general session protocol (~3 min)
2. `/adopted/build-sessions-protocol-cache.md` — build-arc context (when the session is a substrate-build session)
3. `/adopted/project-instructions-snapshot.md` — operative project instructions (PR1–PR16; verification framework 0c; risk classification 0d-ii; signals)
4. `/manifest.md` — rules + architectural constraints (R0–R20; AC1–AC13; KG1–KG7) — read targeted sections only, not in full
5. The most recent close in `/operations/handoffs/founder/` for the session's stream
6. The day's primary deliverable in full

Confirm at open: tier; hold-point status (P0 0h); model selection per cache AC1 row; status vocabulary (`Scoped → Designed → Scaffolded → Wired → Verified → Live` for implementation; `Adopted / Under review / Superseded` for decisions); signals + risk classification per 0d-ii.

## Skills available locally

**`.claude/skills/anthropic/`** — 17 official Anthropic skills from [`anthropics/skills`](https://github.com/anthropics/skills), installed 2026-05-14. Categories: Creative (algorithmic-art, canvas-design, slack-gif-creator, theme-factory), Documents (docx, pdf, pptx, xlsx — source-available, not open source), Enterprise (brand-guidelines, doc-coauthoring, internal-comms), Technical (claude-api, frontend-design, mcp-builder, skill-creator, web-artifacts-builder, webapp-testing). See `.claude/skills/anthropic/README.md` for the full table + update instructions.

**`.claude/skills/sage-*`** — 7 SageReasoning-internal skills built per project-instructions §0g (Workflow Skills — Build When They Earn Their Place): `sage-consult`, `sage-flows-update`, `sage-interpret`, `sage-registry-audit`, `sage-registry-update`, `sage-stenographer`, `sage-wiring-fix`.

> **For Cowork sessions:** the six Anthropic skills bundled into Cowork mode (`docx`, `pdf`, `pptx`, `xlsx`, `setup-cowork`, `consolidate-memory`) load automatically when relevant. The 17 skills above are for Claude Code sessions on this repo.

## PR15 expectation (project instructions §PR15, amended 2026-05-14)

Before any bespoke build, consult:

1. `.claude/skills/anthropic/` — for relevant Anthropic skills matching the session's scope
2. `/operations/agentic-commerce-findings-downstream-order.md` — for forward-looking findings (F1–F4) whose target session matches the day's scope
3. Anthropic-canonical primitives more broadly — Claude Code commands, Sub-agents, Skills, Managed agents, MCP servers, SDK patterns, Plugin spec, Cookbook patterns, Reference agents, Dreams, Outcomes, Multi-agent orchestration

Bespoke election requires justification in the session's decision-log entry under "Reasoning," naming the Anthropic primitive considered and why bespoke is preferable for this case.

## Most-recent substrate-build context

- **A7 close** (R20a server-side gate Verified): `/operations/handoffs/founder/2026-05-13-A7-r20a-gate-close.md`
- **A9 + J6 close** (cost monitoring + R5 impact assessment): `/operations/handoffs/founder/2026-05-14-A9-J6-cost-monitoring-close.md`
- **A5 close** (Layer 3 service Verified): referenced from the A7 close
- **Decision log** (last 3 entries at session-open): `/operations/decision-log.md`
- **Active build-arc cache**: `/adopted/build-sessions-protocol-cache.md`

## Production state (as of 2026-06-12, sage-practice grounding session close)

Refreshed at the sage-practice grounding close (`D-SAGE-PRACTICE-GROUNDING-FRESH-ANALYSIS-BUILD-PLAN-2026-06-12` — **documents + read-only research only; no production touch of any kind this session**; prior refreshes: verdict `D-P1-COMPARISON-VERDICT-NO-BENEFIT-2026-06-11` + same-evening forensic `D-P1-FORENSIC-EXECUTION-ANALYSIS-2026-06-11`; leg B `D-P1-COMPARISON-LEG-B-HARNESSED-2026-06-11`; leg A `D-P1-COMPARISON-LEG-A-BARE-2026-06-11`; S8b `D-PRELAUNCH-S8B-RECONCILE-R18-RIDES-2026-06-10` + `D-REGISTRY-UPDATE-v1.6.0`). **Successor-arc state (2026-06-12):** Parts 1–3 of the mechanism-correction arc are complete as documents in `/operations/p1-rebuild-2026-06/` — the grounding dossier (`sage-practice-grounding-dossier.md`; methodology-vs-mechanism boundary table B1–B12), the fresh test analysis (`fresh-test-analysis.md`; FX-1…FX-17, all defects mechanism-attributed; key re-attribution: stateless per-instance scoring is designed, stateless *practice* is not), and the build plan (`mechanism-correction-build-plan.md`). **Same day, later: the five parked methodology questions were mentor-consulted (founder-elected, verbatim record `2026-06-12-mentor-consultation-methodology-verdicts.md`) and all five verdicts ADOPTED** (`D-SAGE-PRACTICE-METHODOLOGY-AMENDMENTS-ADOPTED-2026-06-12`): two-gate consultation cadence (mandatory at task adoption + three-sub-question stake screen); narrative-existence requirement (verdict-only configurations blocked); reflect default-on at session close for agents (explicit opt-out, sequence never abbreviated); mandatory same-depth re-examination after correction; quick-tier minimal value classification. Dossier + build plan amended in place (CI-1/4/13/15 reshaped; **CI-16 + CI-17 added**; plan now CI-1…CI-17, M1–M8) — **still stopped at the founder item-by-item approval gate; nothing built**. **No flag, schema, or perimeter/code-path change at S8b, leg A, or leg B** (leg A: documents + read-only queries; leg B: documents + authenticated API consumption under existing Live surfaces — production data written: 1 expiring `agent_accreditation` seed row, 10 `loop_billing_events` rows of real metering **(test traffic — exclude from billing-tuning samples)**, 12 audit rows, 3 credentials minted-then-retired). The S8b commit (`a3db4c7`) is **pushed** (verified at leg-A open, 2026-06-11); it carried **content only**: registry v1.6.0 (191→214 components, 44 corrections, Live count 2→48 — the criterion-1 completeness audit), the R18 public-materials corrections (llms.txt v3.1 incl. sr_inst_ + safety-behaviour disclosure + translation-sandwich-v1 response-shape fix; agent-card safety-redirect/v1 extension; api-docs/marketplace/mcp-contracts tier+latency honesty), the H1 renames ("Preparing for Adversity"; "Expanding Your Circle of Concern"), the founder-hub prompt-text reconcile (Haiku leg now S8a-verified; score-conversation inside-perimeter exception named), home-page imagery (audience cards → Human/Developer PNGs; **the logos flame now represents the Sage — Zeus reassigned to the apprentice/user**, founder directions in-session), and the PROJECT_STATE/tech-guide retire-to-archive with pointer stubs. Per **PR18**: this block is rewritten only at session close, from the decision log + that session's verified observations, and always carries its as-of date. **Architecture truth (unchanged from S8a):** the human tool routes run the original prose paths (`runSageReason` on the five score routes; raw `messages.create` on `/score-scenario` + `/reflect`); the translation sandwich is Live on `/api/reason` only; the founder-elected migration (A8 vehicle) is pre-launch, parallel with the lawyer engagement, and now couples the W3/W4 presentation work. **0h: HELD — main blocker (founder, S8b addendum): the bare-vs-harnessed value demonstration on a real task** (P1 comparison pair; design sheet **FROZEN at founder sign-off 2026-06-11 — thresholds 2 decisions/errors, 50% wall-clock, $5 harness cost**; **leg A (bare) complete 2026-06-11** from baseline `a3db4c7`, outputs in `/operations/p1-rebuild-2026-06/bare/`, 11 findings, 2 errors caught; **leg B (harnessed, Fable 5, same baseline) complete 2026-06-11**, outputs in `/operations/p1-rebuild-2026-06/harnessed/` — 12 findings, 4 consultation-changed decisions, errors caught incl. the live mint-defaults drift (admin route 667/50/20 vs adopted 30/1/1) and the accreditation write/read asymmetry, full incorporation log + harness telemetry (76¢ billed / 38¢ Anthropic metered), credentials retired + negative-auth verified; **verdict memo COMPLETE 2026-06-11** (`/operations/p1-rebuild-2026-06/verdict-memo.md`): **No benefit per the frozen boxes as ticked** — Box 1 PASS 2/2 (F12 mint-defaults drift + accreditation write/read asymmetry; founder adjudicated contract-exercising catches as counting), Box 2 FAIL +333% wall-clock (fails every convention; +188% credential-adjusted), Box 3 PASS $0.76; founder quality ratings bare 3/5 / harnessed 4/5 (harnessed preferred); task-fit analysis: value in standard-depth judgement consults + product-test catches, 8/12 consults confirmations, overhead structural; **the founder's 0h call is now the gating item** (memo §8, branches 1–3); both legs ran in Claude Code — the Cowork sandbox cannot reach production, re-verified at S8b; the verdict session itself was documents-only in Cowork); supporting blockers: founder verification of the reconcile (post-deploy spot-check), brand/presentation consistency (W1–W4), and the `/api/score-conversation` distress-check wiring. Production is served at `www.sagereasoning.com` (the apex `sagereasoning.com` 307-redirects to `www`).

**Live in production:**
- Core distress detection + redirect, audience-correct rendering, and the server-side gate — **all four R20a flags `true`** (`SUBSTRATE_CALLING_R20A_ENABLED`, `SUBSTRATE_REFLECT_R20A_ENABLED`, `SUBSTRATE_R20A_AUDIENCE_RENDERING_ENABLED`, `SUBSTRATE_R20A_GATE_ENABLED`) — Live since 2026-05-31; both audience branches production-verified at S6 (human path → human crisis message; agent path → developer-form payload). The safety floor.
- `/api/reason` — Substrate at A7 Verified; behaviour byte-identical to pre-A7 cutover (OTel + audit are additive, no-throw, off the hot path)
- A12 OpenTelemetry + call-grain audit (S2) — `SUBSTRATE_OTEL_ENABLED=true`; `substrate_audit_events` Live, receiving masked (structural-only) rows on `/api/reason`
- GDPR data-rights (S1) — `compliance_access_log` + `compliance_rectification_log` Live; `/api/user/access` (A15b) + `/api/user/rectify` (A15c) + `/api/user/delete` (R17c) + `/api/user/export` (R17i) Verified-live
- A13 cost-health detection — Live; **A13 automated delivery — Live since S7b (2026-06-10)**: daily Vercel Cron `0 8 * * *` → `/api/cron/observability` (CRON_SECRET-gated) runs both evaluators and posts fired signals to Slack (`ALERT_WEBHOOK_URL`). Forced-signal test verified end-to-end (200, both evaluators ok, Slack message received; negative-auth 401). Self-calls route via `CRON_SELF_BASE_URL=https://www.sagereasoning.com` — required because Vercel Deployment Protection (Standard) walls the `*.vercel.app` URLs that `VERCEL_URL` resolves to.
- **A14 SLO/health tracker — Live (provisional) since S7b**: `/api/admin/slo-health`, `SUBSTRATE_SLO_TRACKER_ENABLED=true`, founder-admin gated (Bearer JWT only — a browser page-visit 401s; use the console-fetch snippet; see tech-known-issues).
- **A19 abuse-detection (S3 + S5) — all three detectors Live** (`SUBSTRATE_ABUSE_DETECTION_ENABLED=true` + `SUBSTRATE_ABUSE_DETECTION_ROLLOUT_ENABLED=true` + `ABUSE_DETECTION_EVAL_TOKEN` set); `abuse_signals` Live; `/api/abuse/evaluate` 200 with service token / 401 without. Detection-only (no enforcement).
- **A10 per-install plugin auth — Live since S5 (2026-06-09)** (`PLUGIN_INSTALL_AUTH_ENABLED=true`): mint→use→revoke→401 cycle production-verified; per-install metering/quota enforcement deferred (trigger: first paid agent onboard).
- **A11b injection defence — Live since S4 (2026-06-08)** (`SUBSTRATE_INJECTION_DEFENCE_ENABLED=true`); TEST-parity adversarial probe re-passed in production.

**Built but inert in production (flags UNSET or by decision):**
- Layer 3 per-consumer rendering — `SUBSTRATE_LAYER3_ENABLED` unset (`/api/substrate/layer3` returns 503). **Decided OUT of launch scope at S7** (internal-only; revisit post-launch).
- R20b independence-coaching — `R20B_INDEPENDENCE_COACHING_ENABLED` unset (off-perimeter, reviewed at S6).
- All four `SUBSTRATE_LAYER2_PREVIOUS_*` env vars UNSET; `/api/public-key` serves steady-state shape (Ed25519; `previous: null`; `rotation_overlap_until: null`).
- Stripe billing — `not_configured` in production (per `/api/health`); activation deliberately deferred (launch-criterion tension recorded for P1).

Verify against `/manifest.md` AC7 disposition + the most-recent session close's "Production state at session close" line before any change to user-facing functionality.

## Running the substrate test suite

The substrate + translation-sandwich test files (`website/src/lib/substrate/__tests__/*.test.ts`, `website/src/lib/translation-sandwich/__tests__/*.test.ts`) are plain-assertion scripts run with `tsx` — no Jest. Standing requirements (added 2026-05-15 after a founder cross-session verification run surfaced both gaps):

- **`tsx` is a devDependency** (`website/package.json`, added 2026-05-15). On a clean checkout run `npm install` in `website/` first; if `tsx` is somehow absent, `npm install --save-dev tsx`.
- **Run the verification commands one at a time**, not as a pasted block — any command that prompts (e.g. a missing-package install) otherwise consumes the next pasted line.
- **Tests that transitively import `supabase-server.ts` need `--env-file`.** `supabase-server.ts` constructs a Supabase client at *module load*, so any test importing that chain throws `supabaseUrl is required.` under a bare `npx tsx`. Run those with `npx tsx --env-file=.env.local <path>` — the client is constructed but never called, so real creds are loaded but unused. As of 2026-05-15 this applies to `agent-mode-service.test.ts` and `philosophical-mode-service.test.ts`; the other substrate/translation-sandwich tests run with plain `npx tsx <path>`.

Every session close's "Founder Verification" block must use this working form: plain `npx tsx` for the Supabase-free tests, `npx tsx --env-file=.env.local` for the two that need it. The root cause (eager client construction at module load in `supabase-server.ts`) is a test-harness ergonomics issue noted for a future session — not a defect in any substrate module.

*End of CLAUDE.md. Updated when the underlying governance changes; this is a pointer file, not the governing surface itself.*
