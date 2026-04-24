# SageReasoning Project Index

Last updated: 23 April 2026 | Maintained as part of P0 item 0e
Prior version preserved: `/archive/2026-04-11_INDEX.md`

---

## Inbox / Outbox

| Folder | Direction | Purpose |
|--------|-----------|---------|
| /inbox/ | Founder to AI | Drop any file here for review. It gets read, acted on, then filed into the correct folder. Your in-tray. |
| /outbox/ | AI to Founder | Drafts, reports, and deliverables placed here for your review. Once approved, moved to the right folder or replaces the correct version. Your out-tray. |

## Archive Protocol (canonical as of 2026-04-23, resolving D6-A)

Single canonical archive location: **`/archive/`** at repo root.

When a governing or strategic file is updated, the previous version is copied to `/archive/` with a date-prefixed descriptive name (e.g. `2026-04-23_INDEX.md`) BEFORE the update is applied. No version is silently lost.

Superseded forms (retired by D6-A, 23 April 2026):
- `/backup/` subfolders inside strategic folders — previously documented here. Existing empty `/backup/` folders remain as harmless placeholders; prior content was migrated to `/archive/2026-04-15_R20a-drafts-backup/`.
- Inline `.backup-YYYY-MM-DD` sibling files — retired. Existing inline backups were migrated to `/archive/2026-04-21_inline-backups/` and `/archive/2026-04-22_inline-backups/`.

Resolution recorded in `/operations/decision-log.md` (DD-2026-04-23-01) and `/operations/discrepancy-sort-2026-04-23.md` (D6).

## Handoff Structure (canonical as of 2026-04-23, resolving D7-C)

Single canonical handoff path: **`/operations/handoffs/`** with six role subfolders plus a rollup folder.

| Subfolder | Purpose |
|-----------|---------|
| `/operations/handoffs/founder/` | Founder-led sessions, top-level decisions, scope changes |
| `/operations/handoffs/ops/` | Operational state, costs, infrastructure, deployment, sage-ops |
| `/operations/handoffs/tech/` | Code changes, architecture, build state, context loaders |
| `/operations/handoffs/growth/` | Content, positioning, market signals |
| `/operations/handoffs/support/` | User-facing safety, crisis resources, support inbox |
| `/operations/handoffs/mentor/` | Mentor-system changes, mentor profile, mentor KB |
| `/operations/handoffs/_rollup/` | Milestone summaries appended from stream handoffs (R1 manual — founder signals "rollup [milestone-name]") |

File-name conventions per stream (emergent, kept):
- `*-prompt.md` — session-opening prompt
- `*-handoff.md` — mid-work state
- `*-close.md` — session-closing note

Retired paths:
- `/operations/session-handoffs/` — migrated to `/operations/handoffs/founder/`. Empty stub with `MIGRATED.md` breadcrumb left because the sandbox cannot remove the directory.
- `/website/operations/session-handoffs/` — abandoned; archived to `/archive/2026-04-16_website-session-handoffs/`.

Rollup mechanism: **R1 (manual)**. Founder signals "rollup [milestone-name]"; AI consolidates the relevant stream entries into a single file in `_rollup/` with date and milestone name; stream files remain in place (history preserved); founder approves before commit.

---

## Root Files

| File | Purpose | Status |
|------|---------|--------|
| manifest.md | Master governance (R0-R20). Read before every task. | Current (CR-2026-Q2-v4) |
| README.md | Project overview and documentation | Current (needs V1 ref cleanup) |
| INDEX.md | This file. One-line-per-document navigation. | Current |
| SageReasoning_Ecosystem_Map.html | Interactive visual map of all 148 components | Current (v3, 6 Apr 2026) |
| package.json | Root NPM config (docx generation scripts) | Current |
| LICENSE | Proprietary Evaluation-Only licence | Current |

---

## Folder Structure

### Governance and Planning

| Folder | Purpose | Key Contents |
|--------|---------|-------------|
| /adopted/ | Current governing documents beyond the manifest | V3 Adoption Scope (complete), Addendum P12-P19 |
| /drafts/ | Documents under review, pending founder approval | Empty — previous drafts adopted and archived |
| /archive/ | Superseded versions (moved here, not deleted) | Pre-R17-R20 versions, adopted drafts (Manifest Amendments, Build Priorities, Project Instructions), early marketing strategy, baseline assessment spec |

### Business and Finance

| Folder | Purpose | Key Contents |
|--------|---------|-------------|
| /business/ | Business plan, financials, pricing, revenue | Break-Even Analysis (.xlsx), Investment Analysis, Revenue Strategy, Pricing Research |
| /legal/ | Licences, terms, privacy, IP protection | Source License Audit, Policy Amendments |
| /marketing/ | Market research, competitive analysis, UX research | Deep Market Research v2, Mythos Competitive Analysis, Market Opportunity, Onboarding AX Research (879KB), Marketing Strategy (early, from inbox) |

### Product and Engineering

| Folder | Purpose | Key Contents |
|--------|---------|-------------|
| /product/ | Product specs, brainstorms, architecture docs | AGENTS.md (API guide), Trust Layer Framework, Mentor Architecture, Path of the Prokoptos, Baseline Assessment Spec, 19 files total |
| /engineering/ | Technical docs, scripts, audits, deployment | Deployment Checklist, Token Efficiency, Website Audit, Vercel Deployment Gotchas, JS build scripts, SQL scripts |
| /prototypes/ | Legacy HTML mockups, demo outputs | Setup Plan, Wrapper Demo (hub prototypes superseded by live pages at /mentor-hub, /private-mentor, /ops-hub) |

### Operations

| Folder | Purpose | Key Contents |
|--------|---------|-------------|
| /operations/ | Ops blueprints, manuals, assessments | Sage Cofounder Blueprint, Support Agent Manual, Founder Profile, Sage Ops Assessments (v1, v2) |
| /operations/handoffs/ | Canonical handoff tree (P0 item 0b, resolved D7-C on 2026-04-23). Six role subfolders + `_rollup/`. See "Handoff Structure" section above. | founder/, ops/, tech/, growth/, support/, mentor/, _rollup/ |
| /operations/session-handoffs/ | Retired 2026-04-23. Empty stub with MIGRATED.md breadcrumb. Content moved to /operations/handoffs/founder/. | MIGRATED.md stub only |
| /operations/decision-log.md | Append-only decision record (P0 item 0f) | 22+ dated entries; most recent 2026-04-23 |
| /operations/discrepancy-sort-2026-04-23.md | Governance corpus discrepancy register (17 entries D1–D17; D6 and D7 resolved) | Material resolutions: D6-A, D7-C + R1. D1, D3, D4 outstanding; D17 resolution scheduled for next session. |
| /operations/knowledge-gaps.md | PR5 register — concepts needing permanent reference (seeded KG1–KG10 on 2026-04-17) | 10 entries |
| /operations/verification-framework.md | How both parties verify work (P0 item 0c) | Verification methods by work type, session-start protocol, pre-commit checklist, pre-deployment checklist, pre-session environment check |
| /compliance/ | Regulatory register, audit logs, security reviews | compliance_register.json (28 obligations), audit_log.json, Security Audits, Art6 Classification |
| /reference/ | Knowledge context, ethical analysis, research | Ethical Analysis (R17-R20 source), Knowledge Context (45KB), Human-AI Development KB (53KB), Journal 10 Layers |

### Brand, Templates, and Manuals

| Folder | Purpose | Key Contents |
|--------|---------|-------------|
| /brand/ | Brand guidelines, logos, visual assets | Brand_Guidelines.docx, logo concepts (Sage, Owl, Lotus, Lion, Scales, Zeus) |
| /_templates/ | Operational templates for support, leads, KB | lead.md, workflow-playbook.md, inbox-item.md, kb-article.md, notification.md |
| /manuals/ | Instruction manuals for how to use things | How-to guides for founder, operators, and users. Distinct from /docs/ which is developer-facing API documentation. |

---

## Code Directories (Do Not Reorganise)

| Folder | Purpose | Status |
|--------|---------|--------|
| /website/ | Next.js 14 application (React + TypeScript + Tailwind) | Scaffolded |
| /api/ | OpenAPI spec, SQL schemas, migrations | Scaffolded |
| /sage-mentor/ | Mentor system (20 TypeScript modules, ~12,800 LOC) | Scaffolded |
| /trust-layer/ | Agent Trust Layer (14 TypeScript modules) | Scaffolded |
| /stoic-brain/ | V3 reference dataset (8 JSON files) | Verified |
| /stoic-brain-v1/ | Archived V1 dataset (read-only) | Archived |
| /agent-assessment/ | Assessment framework (55 assessments, V3) | Verified |

## Operational Directories

| Folder | Purpose | Status |
|--------|---------|--------|
| /docs/ | Technical documentation (4 files) | Current |
| /knowledge-base/ | Support KB articles (10 articles, 5 categories) | Current |
| /research/ | Primary Stoic sources (9 texts) + Apple research | Current |
| /support/ | Support inbox (10 tickets) | Active |
| /workflows/ | Operational playbooks (6 workflows) | Current |
| /leads/ | Lead management (active/qualified/closed) | Empty |
| /notifications/ | Notification outbox and sent archive | Active |
| /feedback/ | User feedback collection | 3 files |
| /out/ | Output artifacts (iOS roadmap, gap analysis) | Current |
| /Scheduled/ | Automated tasks (monthly security, quarterly compliance) | Active |

---

## Quick Reference

**To find a document:** Open SageReasoning_Ecosystem_Map.html and use the search box.

**Before any task:** Read manifest.md. Quote applicable rules by number.

**Status vocabulary (P0 item 0a):**
Scoped > Designed > Scaffolded > Wired > Verified > Live

**Communication signals (P0 item 0d):**
Founder: "Explore" / "Design" / "Build" / "Ship" / "I've decided" / "Thinking out loud"
AI: "Confident" / "Making an assumption" / "Need your input" / "Push back" / "Limitation"
