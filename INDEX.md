# SageReasoning Project Index

Last updated: 6 April 2026 | Maintained as part of P0 item 0e

---

## Inbox / Outbox

| Folder | Direction | Purpose |
|--------|-----------|---------|
| /inbox/ | Founder to AI | Drop any file here for review. It gets read, acted on, then filed into the correct folder. Your in-tray. |
| /outbox/ | AI to Founder | Drafts, reports, and deliverables placed here for your review. Once approved, moved to the right folder or replaces the current version. Your out-tray. |

## Backup Protocol

Every strategic folder (adopted, drafts, business, compliance, legal, operations, product, reference, marketing, engineering) contains a `/backup/` subfolder. When a governing or strategic file is updated, the previous version is copied to `backup/` with a date prefix (e.g. `backup/2026-04-06_filename.md`) before the update is applied. This ensures no version is silently lost.

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
| /engineering/ | Technical docs, scripts, audits, deployment | Deployment Checklist, Token Efficiency, Website Audit, JS build scripts, SQL scripts |
| /prototypes/ | Legacy HTML mockups, demo outputs | Setup Plan, Wrapper Demo (hub prototypes superseded by live pages at /mentor-hub, /private-mentor, /ops-hub) |

### Operations

| Folder | Purpose | Key Contents |
|--------|---------|-------------|
| /operations/ | Ops blueprints, manuals, assessments | Sage Cofounder Blueprint, Support Agent Manual, Founder Profile, Sage Ops Assessments (v1, v2) |
| /operations/session-handoffs/ | Session continuity notes (P0 item 0b) | 2026-04-06 session close (first handoff note) |
| /operations/decision-log.md | Append-only decision record (P0 item 0f) | 11 decisions, 21 March – 6 April 2026 |
| /operations/verification-framework.md | How both parties verify work (P0 item 0c) | Verification methods by work type, session-start protocol |
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
