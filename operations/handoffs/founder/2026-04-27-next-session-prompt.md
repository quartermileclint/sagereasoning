# Next Session Prompt

Copy everything below the line into a new session.

---

Governing frame: `/adopted/session-opening-protocol.md`.

Read the session handoff first: `/operations/handoffs/founder/2026-04-27-html-skill-architecture-and-banner-deploy-close.md`.

This is a continuation of SageReasoning P0 (R&D phase). Session focus: tech / founder stream.

**What's done:**
- Both public dashboard pages (Capability Inventory and Architecture Map) confirmed to auto-render from `/website/public/component-registry.json` and `/website/public/flows.json` at runtime.
- Two new skills created at `.claude/skills/sage-registry-update/SKILL.md` and `.claude/skills/sage-flows-update/SKILL.md`.
- Skill instruction banners added to both HTML pages, with dynamic `lastUpdated` display read from the JSON.
- Stale root HTML copies archived.

**What's just happened:**
- Founder visually verified the banners locally. Deploy commands provided in the prior session — confirm with the founder whether the push has been done before relying on the live site reflecting the changes.

**What to do now:**

1. Run full Part A of `/adopted/session-opening-protocol.md` properly this time:
   - Declare tier (tech / founder).
   - Read canonical sources in sequence: manifest, decision log, knowledge-gaps register.
   - Read this handoff and the most recent tech handoff (`/operations/handoffs/tech/2026-04-26-infra-resend-read-and-report-close.md`).
   - Confirm hold-point (P0 0h) status — note whether work outside the hold-point assessment set is permissible.
   - Confirm model selection if any code work is anticipated.
   - Confirm status-vocabulary readiness and signal/risk-classification readiness.

2. Confirm the banner deploy with the founder. If not yet pushed, ask whether to wait or proceed without it.

3. **Run the `sage-registry-update` skill** as the proof-of-pattern invocation (PR1).
   - The skill scans handoffs since `lastUpdated: 2026-04-18`.
   - 19 components currently have non-empty `blocker` strings — these are the rendered red rows / red node labels.
   - Recent handoffs likely to carry resolutions: ADR-PE-01 sessions (the chain on 2026-04-26), infra-resend read-and-report (2026-04-26), Sage Ops D1 journey close (2026-04-25).
   - Walk through one or two blocker-clearance edits with the founder before applying broadly.
   - **Expectation:** the skill propose-then-apply pattern means a `proposed-YYYY-MM-DD.md` document will appear at `/operations/registry-updates/` for founder review before any JSON write.

4. If the first run reveals design issues in the SKILL.md, treat it as the design feedback the proof exists to surface. Adjust the skill, then re-run. Do not adopt the pattern broadly until the first run is clean.

**Important context:**

- Founder is a non-coder. Communicate in plain language; describe changes in terms of what they do, not how they're implemented. Provide exact copy-paste terminal commands when a deploy is needed.
- Founder decides direction; AI surfaces options with reasoning and constraints. Never edit governing documents (manifest, project instructions) without explicit founder approval.
- Risk classification per 0d-ii applies to every code change. Safety-critical changes (PR6) are always Critical regardless of apparent scope.
- The two new skills are Scaffolded, not yet Wired. First successful invocation moves them to Wired; founder validation of the proposed-edits document moves them to Verified.

**Standing reminders:**

- Single source of truth for both dashboards: `/website/public/component-registry.json`. Do not edit `/website/public/SageReasoning_*.html` for content updates — that's not how the rendering works.
- Pre-edit backups go to `/archive/component-registry/` (registry skill) or `/archive/flows/` (flows skill) before any JSON write.
- Decision-log entry per applied update.
- Provide the founder with `git add / git commit / git push` commands verbatim for every deploy-bound change.

---

End of prompt. Confirm receipt before proceeding with Part A.
