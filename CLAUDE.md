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

## Production state (as of 2026-06-09)

Refreshed at the Pre-Launch S3 close (`D-PRELAUNCH-S3-ABUSE-DETECTION-ACTIVATION-2026-06-08`); **corrected at the Pre-Launch S6 close 2026-06-09** (`D-PRELAUNCH-S6-R20A-AUDIENCE-RENDERING-VERIFIED-2026-06-09`) — the two R20a flags (`SUBSTRATE_R20A_AUDIENCE_RENDERING_ENABLED` + `SUBSTRATE_R20A_GATE_ENABLED`) were mislisted here as inert; they have in fact been Live since 2026-05-31 and were production-verified at S6 (both audience branches observed). The drift originated in the 2026-06-07 completion-plan table and propagated through the S3–S5 blocks. Supersedes the 2026-05-14 block (prior version preserved in git history). Production is served at `www.sagereasoning.com` (the apex `sagereasoning.com` 307-redirects to `www`).

**Live in production:**
- Core distress detection + redirect, audience-correct rendering, and the server-side gate — **all four R20a flags `true`** (`SUBSTRATE_CALLING_R20A_ENABLED`, `SUBSTRATE_REFLECT_R20A_ENABLED`, `SUBSTRATE_R20A_AUDIENCE_RENDERING_ENABLED`, `SUBSTRATE_R20A_GATE_ENABLED`) — Live since 2026-05-31; both audience branches production-verified at the S6 close 2026-06-09 (human path → human crisis message; agent path → developer-form payload). The safety floor.
- `/api/reason` — Substrate at A7 Verified; behaviour byte-identical to pre-A7 cutover (OTel + audit are additive, no-throw, off the hot path)
- A12 OpenTelemetry + call-grain audit (S2) — `SUBSTRATE_OTEL_ENABLED=true`; `substrate_audit_events` Live, receiving masked (structural-only) rows on `/api/reason`
- GDPR data-rights (S1) — `compliance_access_log` + `compliance_rectification_log` Live; `/api/user/access` (A15b) + `/api/user/rectify` (A15c) + `/api/user/delete` (R17c) + `/api/user/export` (R17i) Verified-live
- A13 cost-health detection — Live
- **A19 abuse-detection (S3)** — `SUBSTRATE_ABUSE_DETECTION_ENABLED=true` + `ABUSE_DETECTION_EVAL_TOKEN` set (Production); `abuse_signals` Live; `/api/abuse/evaluate` answers (200 with service token, 401 without — was 503). Detection-only (no enforcement). Runs the `request_velocity_anomaly` detector only in production.

**Built but inert in production (flags UNSET):**
- A19 structural detectors `systematic_enumeration` + `rapid_input_variation` — behind `SUBSTRATE_ABUSE_DETECTION_ROLLOUT_ENABLED` (sandbox-verified; production rollout is an S4 flag-flip)
- A10 per-agent identity + metering — `PLUGIN_INSTALL_AUTH_ENABLED`
- A11b injection defence — `SUBSTRATE_INJECTION_DEFENCE_ENABLED`
- Layer 3 per-consumer rendering — `SUBSTRATE_LAYER3_ENABLED` (`/api/substrate/layer3` returns 503)
- All four `SUBSTRATE_LAYER2_PREVIOUS_*` env vars UNSET; `/api/public-key` serves steady-state shape (Ed25519; `previous: null`; `rotation_overlap_until: null`)

*(R20a audience-correct rendering + the R20a server-side gate were previously listed here as inert; corrected to Live above at the S6 close 2026-06-09 — see the dated note under "Production state".)*

Verify against `/manifest.md` AC7 disposition + the most-recent session close's "Production state at session close" line before any change to user-facing functionality.

## Running the substrate test suite

The substrate + translation-sandwich test files (`website/src/lib/substrate/__tests__/*.test.ts`, `website/src/lib/translation-sandwich/__tests__/*.test.ts`) are plain-assertion scripts run with `tsx` — no Jest. Standing requirements (added 2026-05-15 after a founder cross-session verification run surfaced both gaps):

- **`tsx` is a devDependency** (`website/package.json`, added 2026-05-15). On a clean checkout run `npm install` in `website/` first; if `tsx` is somehow absent, `npm install --save-dev tsx`.
- **Run the verification commands one at a time**, not as a pasted block — any command that prompts (e.g. a missing-package install) otherwise consumes the next pasted line.
- **Tests that transitively import `supabase-server.ts` need `--env-file`.** `supabase-server.ts` constructs a Supabase client at *module load*, so any test importing that chain throws `supabaseUrl is required.` under a bare `npx tsx`. Run those with `npx tsx --env-file=.env.local <path>` — the client is constructed but never called, so real creds are loaded but unused. As of 2026-05-15 this applies to `agent-mode-service.test.ts` and `philosophical-mode-service.test.ts`; the other substrate/translation-sandwich tests run with plain `npx tsx <path>`.

Every session close's "Founder Verification" block must use this working form: plain `npx tsx` for the Supabase-free tests, `npx tsx --env-file=.env.local` for the two that need it. The root cause (eager client construction at module load in `supabase-server.ts`) is a test-harness ergonomics issue noted for a future session — not a defect in any substrate module.

*End of CLAUDE.md. Updated when the underlying governance changes; this is a pointer file, not the governing surface itself.*
