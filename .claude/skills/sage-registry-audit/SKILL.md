# sage-registry-audit — Component Registry Correctness & Completeness Audit

**Trigger:** The founder says "run the registry audit", "audit the registry", "audit the component registry", "verify registry completeness", "check the registry against reality", "is the registry correct?", or any variant indicating that the existing `/website/public/component-registry.json` should be verified against the codebase and recent decisions before any further updates are layered on top.

---

## What This Skill Does

This skill verifies that `/website/public/component-registry.json` reflects reality. It does not bring in new work since `lastUpdated` — that is the role of `sage-registry-update`. This skill answers a different question: **is the existing registry correct and complete, given the current state of the codebase and the decision log?**

**Why this matters:** the registry is the single source of truth for both `/SageReasoning_Capability_Inventory` and `/SageReasoning_Architecture_Map`. If the registry has accumulated drift between its claims and reality, every dashboard view is misleading, and every subsequent update via `sage-registry-update` builds on a wrong baseline.

**The skill proposes; the founder approves; the skill then applies.** Same propose-then-apply pattern as `sage-registry-update`. The registry is never silently mutated.

**Output:** a single audit proposal document organised by finding type. Once approved, corrections apply as a patch version bump (typically v1.X.Y → v1.X.(Y+1)), with a minor bump only if completeness gaps require adding new components.

---

## When to Use

- After a substantial period of work where the registry's `lastUpdated` may have drifted.
- Before running `sage-registry-update` on a registry whose accuracy is uncertain.
- After a registry rollback (e.g., the v1.3.0 rollback of 2026-04-28).
- As a periodic baseline check (e.g., monthly) when the founder decides it's needed.

Do **not** use when:

- The change is to bring in new work since `lastUpdated` — use `sage-registry-update` instead.
- The change is to architecture map node positions — use `sage-flows-update` instead.
- The change is to the registry schema itself (new fields across all components, field renames) — that is a separate decision requiring its own approval cycle.

---

## How It Works

### Step 1: Read the registry and capture current header state

Read `/website/public/component-registry.json`. Capture the current values of `version`, `lastUpdated`, `totalComponents`, `statusSummary`. These will be cross-checked in Pass E.

### Step 2: Pass A — Path existence

For every component in the registry with a non-empty `path` field:

- If the path looks like a file (ends with `.ts`, `.tsx`, `.md`, `.json`, etc.), confirm the file exists in the workspace.
- If the path looks like a directory (ends with `/`, or no extension), confirm the directory exists in the workspace.
- If `path` is empty or looks conceptual (e.g., `n/a`), skip.

Record each component as one of: **path exists**, **path missing**, or **skipped (no path)**.

### Step 3: Pass B — Code-grep integration check

For every component whose path is verified by Pass A:

- Search `/website/src/` for imports or string references to the path. Use a robust search: import statements, dynamic imports, file path literals.
- Count distinct files in `/website/src/` that reference the component.
- Cross-reference with the component's `status` and `blocker` field:

  | Registry says | `/website/src/` shows | Finding |
  |---|---|---|
  | status `wired` / `verified` / `live` | ≥1 reference | Consistent — no action |
  | status `wired` / `verified` / `live` | 0 references | **Inconsistent** — flag for status review or path correction |
  | blocker contains "isolated" / "not integrated" / "zero imports" | ≥1 reference | **Inconsistent** — flag for blocker rewrite |
  | blocker contains "isolated" / "not integrated" / "zero imports" | 0 references | Consistent — no action |
  | status `scoped` / `designed` / `scaffolded` | ≥1 reference | **Inconsistent** — status may be stale; flag for review |
  | status `scoped` / `designed` / `scaffolded` | 0 references | Consistent — no action |

- For sage-mentor and trust-layer components specifically, also search the sage-mentor and trust-layer directories themselves for cross-component references — these reflect internal cohesion separate from website integration.

### Step 4: Pass C — Internal consistency

For every row in the registry (every component, not just those flagged by Passes A/B):

- Check `status` × `blocker` consistency:
  - `status: verified` AND blocker mentions "isolated" / "not integrated" → inconsistent.
  - `status: verified` AND blocker is empty → consistent only if there is no remaining work; per the update skill's Q2 rule (always preserve a remaining-work note), an empty blocker on a Verified row is itself a flag for review.
  - `status: live` AND blocker mentions "not deployed" → inconsistent.
- Check `status` × `notes` consistency:
  - `status: verified` AND notes contain "Not integrated" / "Isolated" / "stub only" → inconsistent.
  - `status: live` AND notes contain "Not yet" / "Pending" → inconsistent.
- Check `humanReady` × `status` consistency:
  - `humanReady: ready` AND `status` in {`scoped`, `designed`, `scaffolded`} → inconsistent.
  - `humanReady: not-ready` for a component whose `journey` is `internal` (pipeline-internal engine) → flag per Q3 rule (`na` is the truer value for pipeline-internal components).
- Check `agentReady` × `status` consistency: same shape as `humanReady`.
- Check `journey` × `status` consistency:
  - `journey: deprecated` AND `status: live` → inconsistent.

Each contradiction is recorded as a finding with the row's id, the contradicting fields, and a proposed correction.

### Step 5: Pass D — Completeness walk

Walk every significant directory in the workspace and identify modules without a registry entry.

Directories to walk (recursive, excluding node_modules and build artefacts):

- `/website/src/` — every `.ts`, `.tsx` file
- `/sage-mentor/` — every `.ts` file
- `/trust-layer/` — every `.ts` file
- `/agents/` — every `.md` and `.ts` file
- `/operations/` — strategic documents only (e.g., `Sage_Cofounder_Blueprint.md`, `Stoic_Brain_v3` reference). Routine handoffs, decision-log, knowledge-gaps are NOT components.

For each file found, search the registry's components for any whose `path` field references this file. If no component references the file, classify the gap:

- **Strong gap** — file is a substantive module with named exports / functions / agent definitions. Propose adding a new component.
- **Wiring gap** — file is short, mostly re-exports / type imports / glue between two named components. Propose attributing it to an existing component (or one of its `connects`).
- **Out-of-scope** — file is test, fixture, build script, generated output. No registry action needed.

Each finding lists: file path, line count, brief description, and proposed classification with reasoning.

### Step 6: Pass E — Header consistency

Verify the registry's header fields against actual content:

- `totalComponents` must equal `components.length`. Any mismatch is a finding.
- `statusSummary` counts must equal a fresh per-status recount. Any mismatch is a finding (this caught the previous session's undercounted `scaffolded` and overcounted `wired`/`designed`).
- `lastUpdated` must be older than or equal to the most recent `decision-log.md` entry that names a component touched in the registry. If `lastUpdated: 2026-04-18` but the registry contains content from D-D1-* entries dated 2026-04-25, that is a stale-header finding.
- `version` must follow semver per the update skill's rules (patch / minor / major bumps for the relevant change types).

### Step 7: Pass F — Decision-log cross-reference

Walk `/operations/decision-log.md`. For each entry that names a specific component ID or component name in its **Decision** or **Reasoning** section, check whether the entry's outcome is reflected in the registry.

Examples of entries this should catch:

- `D-D1-1` through `D-D1-12` (2026-04-25 journey-field changes) — confirm each component's `journey` matches.
- `D-D3-1` (2026-04-22 rename of `doc-journal-layers` → `reasoning-journal-layers`) — confirm component id is the new one.
- `D-RING-2-S4C` (2026-04-26 canonical profile migration) — confirm `engine-ring-wrapper` reflects.
- `D-PE-01-S6-REFLECT-RECOMPUTE-VERIFIED` (2026-04-26) — confirm `engine-pattern-engine` reflects.
- `D-PE-LEDGER-WIRING-REDIRECTED` (2026-04-26) — confirm `engine-mentor-ledger` reflects the redirect outcome.

Any decision-log entry whose outcome isn't reflected in the registry is a Pass F finding.

### Step 8: Build the audit proposal document

Create a file at:

```
operations/registry-updates/audit-YYYY-MM-DD.md
```

If a file with that name already exists (multiple audit sessions in one day), append a letter suffix (`audit-YYYY-MM-DD-b.md`).

Use this exact format:

```markdown
# Registry Audit — [Today's Date]

**Registry version audited:** [version]
**Registry lastUpdated audited:** [date]
**Total components audited:** [N]
**Audit findings:** [N total] — [N header drift] / [N per-row drift] / [N internal consistency] / [N completeness gaps] / [N decision-log items not reflected]
**No-change findings:** [N rows audited and confirmed consistent]

---

## 1. Header drift findings (Pass E)

[Each finding: current value, proposed correction, reasoning.]

---

## 2. Per-row drift findings (Passes A and B)

### [Component ID] — [Component Name]

**Current state:**
- status: [current]
- blocker: "[current]"
- path: "[current]"

**Proposed correction:**
- [field]: [current] → **[proposed]**

**Evidence:**
- Pass A: [path exists / path missing]
- Pass B: [N references in /website/src/]
- Reasoning: [why this evidence justifies the proposed correction]

[repeat per finding]

---

## 3. Internal consistency findings (Pass C)

### [Component ID]

**Contradiction:** [field-1: value-1] vs [field-2: value-2]

**Proposed correction:** [which field changes, to what]

**Reasoning:** [why this resolves the contradiction]

[repeat per finding]

---

## 4. Completeness gaps (Pass D)

### [File path]

**Classification:** Strong gap / Wiring gap / Out-of-scope
**Lines:** [N]
**Brief:** [one-sentence description]

**Proposed action:**
- (a) Add new component with id [proposed-id], status [proposed-status], path [path]; OR
- (b) Attribute to existing component [existing-id]; OR
- (c) No registry action needed (out-of-scope).

[repeat per finding]

---

## 5. Decision-log items not yet reflected (Pass F)

### [Decision entry ID]

**Decision summary:** [brief]
**Component(s) affected:** [list]
**Registry state:** [what registry currently shows]
**Proposed correction:** [what should change]

[repeat per finding]

---

## 6. No-change findings

[N rows audited and confirmed consistent — list by id with one-line confirmation.]

---

## Founder review prompt

Please reply with one of:
- "Apply all findings" (everything in sections 1–5)
- "Apply sections 1, 2, 3 only" (or any subset)
- "Apply per-finding instructions follow:" (then a list)
- "Reject and re-audit" (if the audit itself needs rework)
```

### Step 9: Present the audit proposal to the founder

Summarise in plain language:

- "I audited [N] components against the codebase, the decision log, and internal consistency rules."
- "I found [N] drift findings, [N] internal consistency contradictions, [N] completeness gaps, and [N] decision-log items not yet reflected."
- "The biggest categories are: [top three]."
- "The full audit proposal is at `/operations/registry-updates/audit-YYYY-MM-DD.md`."
- Ask: "Review the proposal and tell me which findings to apply, modify, or reject."

**Do not apply any corrections in this step.** Wait for explicit founder approval.

### Step 10: Apply approved corrections (only on explicit approval)

Once the founder approves, in this exact order:

**10.1. Pre-edit backup.** Copy the current registry to:

```
archive/component-registry/component-registry.json.backup-audit-YYYY-MM-DD-HHMM
```

Note the `-audit-` infix — this distinguishes audit backups from update-skill backups.

**10.2. Apply approved corrections.** For each approved finding, update the named fields. Preserve all other fields. Preserve key ordering. Preserve JSON formatting (2-space indent, multi-line arrays).

**10.3. Recompute `statusSummary`.** Count components by their (possibly newly corrected) `status` field. Update the summary to match. Include only statuses with non-zero counts.

**10.4. Update `lastUpdated`.** Set to today's date in YYYY-MM-DD format.

**10.5. Increment `version`:**
- **Patch bump** (v1.X.Y → v1.X.(Y+1)) if only existing components were corrected and no completeness gaps added new components.
- **Minor bump** (v1.X.Y → v1.(X+1).0) if completeness gaps added new components.
- **Major bump** never automatic — major bumps require a separate decision under the update skill's rules.

**10.6. Update `totalComponents`.** Set to actual `components.length`.

**10.7. JSON validation.** Parse the result. If parsing fails, abort, restore from the Step 10.1 backup, tell the founder what failed.

**10.8. Write the file.**

### Step 11: Write a decision-log entry

Append to `/operations/decision-log.md`:

```markdown
## [Today's Date] — D-REGISTRY-AUDIT-vX.Y.Z

**Decision:** Audited /website/public/component-registry.json against codebase, decision log, and internal consistency rules. Applied [N] corrections from sections [1, 2, 3, 4, 5] of /operations/registry-updates/audit-YYYY-MM-DD.md. Registry advanced from vX.Y.Z to vX.Y.(Z+1) [or appropriate version bump]. Pre-edit backup at /archive/component-registry/component-registry.json.backup-audit-YYYY-MM-DD-HHMM.

**Reasoning:** [Brief — what categories of drift were found and corrected. Reference the audit proposal as the audit trail for evidence per finding.]

**Rules served:** R0 (oikeiosis audit trail — audit proposal is part of the trail), 0a (status vocabulary preserved), 0d-ii (Standard risk; backup + rollback path).

**Status:** Adopted. Cross-references: [decision-log entries that contributed to findings, e.g., D-RING-2-*, D-PE-01-*, D-D1-*]. Audit proposal at /operations/registry-updates/audit-YYYY-MM-DD.md. Skill at /.claude/skills/sage-registry-audit/SKILL.md.
```

### Step 12: Provide the git commands

Tell the founder, exactly:

```
The registry audit corrections are applied. To deploy, run these commands in your terminal:

cd "/Users/clintonaitkenhead/Claude-work/PROJECTS/sagereasoning"
git add website/public/component-registry.json operations/registry-updates/audit-YYYY-MM-DD.md operations/decision-log.md archive/component-registry/
git commit -m "registry audit vX.Y.(Z+1): [N] corrections (passes A-F)"
git push

If git push fails (sandbox-can't-push pattern, see D-PR8-PUSH 2026-04-26), use GitHub Desktop:
  1. Open GitHub Desktop.
  2. Confirm the changes appear under "Changes".
  3. Type the commit message above into the summary box.
  4. Click "Commit to main".
  5. Click "Push origin".

Vercel will redeploy automatically (~1 minute). Refresh both pages to see corrected statuses and any new components:
  https://www.sagereasoning.com/SageReasoning_Capability_Inventory.html
  https://www.sagereasoning.com/SageReasoning_Architecture_Map.html
```

After the founder confirms the deploy succeeded, walk through one or two specific rows together to confirm the live-site rendering matches the audit proposal. If anything looks wrong, restore from the Step 10.1 backup and report what failed.

---

## Important Constraints

- **Read-only until approved.** Steps 1–9 produce a proposal document. They never edit the registry.
- **Status vocabulary (P0 0a):** Allowed `status` values are exactly: `scoped`, `designed`, `scaffolded`, `wired`, `verified`, `live`. Reject any proposed correction that uses other words — flag for founder decision.
- **Do not mix taxonomies (D14):** `status` is implementation status. Do not write decision-log words ("Adopted", "Under review") into the registry's `status` field.
- **Be conservative with status promotions.** A status promotion (e.g., `wired` → `verified`) requires explicit decision-log evidence (e.g., a Verified entry), not just code-grep evidence. Code presence proves wiring; explicit verification claims proof of testing.
- **Be conservative with completeness additions.** A "Strong gap" finding (Pass D) proposes a new component — this is a major action. Provide all required fields (id, name, type, subtype, status, ext, path, desc, deps, rules, priority, connects, blocker as needed) in the proposal. Founder must explicitly approve each addition.
- **No silent deletions.** A path-missing finding (Pass A) does NOT mean the component should be deleted. Propose either path correction or component deprecation, never silent removal.
- **Schema changes are not routine.** Do not propose adding new fields across components or renaming fields. Those require separate approval.
- **Q3 rule (humanReady/agentReady for pipeline-internal):** the audit applies the convention that pipeline-internal components (those with `journey: internal` or whose role is to be invoked by other engines, not by users or external agents) read `humanReady: na` and `agentReady: na`. Existing rows showing `not-ready` for these components are flagged in Pass C.
- **Q2 rule (blocker semantics):** the audit applies the convention that a `blocker` field on a Verified or Live row should always carry a remaining-work note rather than being empty. An empty blocker on Verified/Live is flagged in Pass C.
- **Q4 rule (Layer A and Layer B):** the audit covers both layers. Layer A fields (`status`, `blocker`, `notes`, `humanReady`, `agentReady`, `desc`, `oldStatus`, `origin`, `name`, `type`) and Layer B fields (`connects`, `deps`, `journey`, `priority`, `rules`, `path`, `subtype`) are all subject to drift checking.

---

## File Locations

| File | Purpose |
|------|---------|
| `/website/public/component-registry.json` | The registry being audited |
| `/operations/registry-updates/audit-YYYY-MM-DD.md` | One audit proposal per audit session |
| `/archive/component-registry/component-registry.json.backup-audit-YYYY-MM-DD-HHMM` | Pre-correction backup |
| `/operations/decision-log.md` | Decision-log entry per applied audit |
| `/operations/handoffs/**/*.md` | Source for Pass F cross-reference |
| `/website/src/` | Source for Pass B integration check and Pass D completeness walk |
| `/sage-mentor/`, `/trust-layer/`, `/agents/` | Additional sources for Pass D completeness walk |

---

## Quality Checklist

Before declaring an audit complete, verify:

- [ ] All six passes (A, B, C, D, E, F) ran against the registry.
- [ ] Audit proposal document exists at the expected path.
- [ ] Every finding has evidence (Pass identifier + specific quote / count / decision reference).
- [ ] No-change rows are listed for transparency (founder can see what was checked but not flagged).
- [ ] Pre-edit backup exists in `/archive/component-registry/` before any write.
- [ ] JSON parses successfully after corrections applied.
- [ ] `lastUpdated` is today's date.
- [ ] `version` was incremented per the rules above.
- [ ] `statusSummary` counts match the actual components by `status`.
- [ ] `totalComponents` matches `components.length`.
- [ ] Decision-log entry written with `D-REGISTRY-AUDIT-vX.Y.Z` identifier.
- [ ] Git commands provided to the founder verbatim.
- [ ] No status field uses non-vocabulary words.
- [ ] No decision-log taxonomy words ("Adopted", "Under review") written into the registry.

---

## Rollback

If the founder reports the registry is wrong after deploy:

1. Restore the registry from the Step 10.1 backup:
   ```
   cp archive/component-registry/component-registry.json.backup-audit-YYYY-MM-DD-HHMM website/public/component-registry.json
   ```
2. Validate the restored JSON.
3. Tell the founder the exact git commands to commit and push the rollback:
   ```
   git add website/public/component-registry.json
   git commit -m "rollback: restore registry to pre-audit-vX.Y.Z state"
   git push
   ```
4. Append a supersession entry to the decision log: `D-REGISTRY-AUDIT-vX.Y.Z-SUPERSEDED`.
5. Add a debrief entry per `0b-ii` if the failure affected what the founder relies on for live-site verification.

---

## Relationship to other registry skills

| Skill | Question it answers | When to use |
|---|---|---|
| `sage-registry-audit` (this skill) | Is the existing registry correct and complete? | Before update if accuracy is uncertain; periodically as a baseline check; after a rollback. |
| `sage-registry-update` | What changed since the last update was deployed? | After substantial new work; routine cadence between audits. |
| `sage-flows-update` | Have flow node positions or edges changed? | When the architecture map's layout needs updating (separate from registry content). |

The audit answers correctness; the update answers freshness. Run the audit when the foundation is uncertain; run the update when the foundation is trusted but stale.
