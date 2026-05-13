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

## Production state (as of 2026-05-14)

- Substrate at A7 Verified
- `SUBSTRATE_LAYER3_ENABLED` UNSET in Vercel; `/api/substrate/layer3` returns 503
- `SUBSTRATE_R20A_GATE_ENABLED` UNSET in Vercel
- `/api/reason` behaviour byte-identical to pre-A7 cutover
- All four `SUBSTRATE_LAYER2_PREVIOUS_*` env vars UNSET
- `/api/public-key` serves steady-state shape (Ed25519; `previous: null`; `rotation_overlap_until: null`)

Verify against `/manifest.md` AC7 disposition + the most-recent session close's "Production state at session close" line before any change to user-facing functionality.

*End of CLAUDE.md. Updated when the underlying governance changes; this is a pointer file, not the governing surface itself.*
