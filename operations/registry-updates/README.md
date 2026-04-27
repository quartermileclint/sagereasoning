# Registry Updates

Proposed-edits documents produced by the `sage-registry-update` skill before applying any changes to `/website/public/component-registry.json`.

## Pattern

The skill follows a propose-then-apply pattern:

1. The skill reads the registry's `lastUpdated` date.
2. It scans `/operations/handoffs/**/*.md` for files modified since.
3. It builds a candidate-edit list per component, citing the source handoff and quoted text.
4. It writes the proposal to `proposed-YYYY-MM-DD.md` in this folder.
5. The founder reviews, approves, modifies, or rejects.
6. The skill applies only what was approved, with a pre-edit backup at `/archive/component-registry/`.

## File Naming

- One proposal per update session: `proposed-2026-04-27.md`.
- Multiple sessions on the same day: `proposed-2026-04-27.md`, `proposed-2026-04-27-b.md`, etc.

## Retention

Proposed-edits documents are kept indefinitely as part of the R0 oikeiosis audit trail. They show what was considered, what was applied, and what was deferred. Do not delete them.

## Related

- Skill file: `/.claude/skills/sage-registry-update/SKILL.md`
- Source of truth: `/website/public/component-registry.json`
- Backups: `/archive/component-registry/`
- Decision log: `/operations/decision-log.md`
