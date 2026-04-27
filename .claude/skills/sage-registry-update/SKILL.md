# sage-registry-update — Component Registry Update Automation

**Trigger:** The founder says "run the sage-registry-update skill", "update the registry", "update the component registry", "update the capability inventory", "update the architecture map statuses", "update the red text", or any variant indicating that `/website/public/component-registry.json` should be brought up to date with recent work.

---

## What This Skill Does

This skill brings `/website/public/component-registry.json` up to date with status changes, blocker resolutions, and other component-level findings recorded in recent session handoffs. The registry is the single source of truth that drives both `/SageReasoning_Capability_Inventory` and `/SageReasoning_Architecture_Map` — both pages fetch this JSON at runtime and render from it. Update the JSON, push to deploy, and both pages auto-render the new state on next page load.

**Why this matters:** Without a structured update path, the registry drifts — new statuses are buried in handoffs and never reach the public-facing dashboards. This skill closes the gap by walking back to the registry's `lastUpdated` date, surfacing every relevant change since, and applying them safely.

**The skill proposes; the founder approves; the skill then applies.** This matches the founder's decision-authority preference and prevents the registry from being silently mutated.

---

## When to Use

- The founder asks to update the registry, capability inventory, or architecture map status.
- A session has just resolved a blocker that's still flagged red on the live site.
- A new component has been built and needs to be added to the registry.
- The founder wants to audit drift between handoffs and what the public pages show.

Do **not** use when:
- The change is to architecture map node positions or layout — use `sage-flows-update` instead.
- The change is to the HTML rendering logic — that's a code change, not a registry update.

---

## How It Works

### Step 1: Read the registry and note the lastUpdated date

Read `/website/public/component-registry.json`. Note the `lastUpdated` field at the top (format: `YYYY-MM-DD`). This is the boundary for the lookback in Step 2.

### Step 2: Scan handoffs since lastUpdated

Walk every file under `/operations/handoffs/**/*.md` that was modified on or after `lastUpdated`. Read each file. For each, extract candidate updates from these sections (when present):

- **Status Changes** — entries of the form "[Module/Component]: [Old status] → **[New status]**"
- **Decisions Made** — decisions whose impact line names a specific component
- **Completed Work** — completed items that resolve a known blocker
- **Blocked On** — current blockers (these confirm what should still be flagged)

Also scan `/operations/decision-log.md` for entries dated on or after `lastUpdated`.

### Step 3: Match handoff entries to component IDs

The registry uses component IDs (e.g., `agent-private-mentor`, `engine-trust-layer`, `infra-resend`). Handoffs use module names, file paths, or rule numbers. Apply matching in this order:

1. Exact ID match (`infra-resend` mentioned literally).
2. Stripped-prefix match (`resend` mentioned, matches `infra-resend` after stripping `infra-` — only when the stripped portion is multi-word OR is itself unambiguous).
3. Component `name` field match (the human name like "Email (Resend)").
4. Path or file match (handoff mentions `/website/src/lib/email.ts`, registry component has matching `path`).
5. Explicit alias match (e.g., "Journal Interpretation" → `reasoning-journal-layers`).

When a match is ambiguous, **do not silently choose**. Flag it as ambiguous in the proposed-edits document and ask the founder to confirm the intended target.

### Step 4: Build the proposed-edits document

Create a file at:

```
operations/registry-updates/proposed-YYYY-MM-DD.md
```

If a file with that name already exists (multiple update sessions in one day), append a letter suffix:

```
operations/registry-updates/proposed-YYYY-MM-DD-b.md
```

Use this exact format:

```markdown
# Registry Update Proposal — [Today's Date]

**Registry lastUpdated:** [Date from JSON]
**Lookback range:** [lastUpdated] → [Today]
**Handoffs scanned:** [N files]
**Components proposed for update:** [N]
**Ambiguous matches needing founder input:** [N]

---

## Proposed Edits

### [Component ID] — [Component Name]

**Current state:**
- status: [current]
- blocker: "[current text or empty]"
- notes: "[current notes]"

**Proposed change:**
- status: [current] → **[new]**
- blocker: "[current]" → "" (clear)
- notes: append "[new note]"

**Evidence:**
- Source: `/operations/handoffs/[stream]/[date]-[file].md`
- Quoted text: "[exact quote from handoff]"
- Reasoning: [why this evidence justifies the change — be conservative]

---

[repeat for each proposed edit]

---

## Ambiguous Matches Requiring Founder Decision

### [Handoff entry]

**Source:** `/operations/handoffs/[file].md`
**Quoted text:** "[exact quote]"
**Possible matches:**
- `[component-id-1]` — [name]
- `[component-id-2]` — [name]

**Founder decision needed:** Which component (if any) does this entry refer to?

---

## No-Change Findings

[Optional section — handoffs that were scanned but produced no proposed edit, with reason]

- `[handoff file]`: No component-level changes recorded.
- `[handoff file]`: Mentioned [component] but only in passing — no status assertion made.
```

### Step 5: Present the proposal to the founder

Summarise:
- "I scanned [N] handoffs from [lastUpdated] to today."
- "I'm proposing [N] component updates and flagging [N] ambiguous matches."
- "Top three changes: [list]."
- "The full proposal is at `/operations/registry-updates/proposed-YYYY-MM-DD.md`."
- Ask: "Review the proposal and tell me which edits to apply, modify, or reject."

**Do not apply any edits in this step.** Wait for explicit founder approval, in the form of "apply all", "apply the listed ones", or per-edit instructions.

### Step 6: Apply approved edits (only on explicit approval)

Once the founder approves, in this exact order:

**6.1. Pre-edit backup.** Copy the current registry to:

```
archive/component-registry/component-registry.json.backup-YYYY-MM-DD-HHMM
```

Create the `archive/component-registry/` folder if it does not exist.

**6.2. Apply the field updates.** For each approved edit, update the named fields in the named component. Preserve all other fields. Preserve key ordering. Preserve the existing JSON formatting style (2-space indent, multi-line arrays).

**6.3. Recompute `statusSummary`.** Count components by their new `status` field. Update the summary block to match. Include only statuses with non-zero counts.

**6.4. Update `lastUpdated`.** Set to today's date in YYYY-MM-DD format.

**6.5. Increment `version`.** Use semver:
- Patch bump (e.g., 1.2.0 → 1.2.1) for field-only updates to existing components.
- Minor bump (e.g., 1.2.0 → 1.3.0) when components are added or removed.
- Major bump (e.g., 1.2.0 → 2.0.0) only if the schema itself changes (a new field added to all components, or a field renamed). Major bumps require explicit founder approval as a separate decision — they are not adopted as part of a routine update.

**6.6. Update `totalComponents`.** Set to the actual length of the components array.

**6.7. Validate JSON syntax.** Parse the result. If parsing fails, abort, restore from the Step 6.1 backup, and tell the founder what failed.

**6.8. Write the file.**

### Step 7: Write a decision-log entry

Append to `/operations/decision-log.md`:

```markdown
## [Today's Date] — Registry Update [version]

**Decision:** Updated component-registry.json from [old version] to [new version]. [N] components changed.
**Reasoning:** Brought registry up to date with handoffs from [lastUpdated] to [today]. Approved edits documented in `/operations/registry-updates/proposed-YYYY-MM-DD.md`.
**Rules served:** R0 (oikeiosis audit trail), 0a (status vocabulary).
**Impact:** Capability Inventory and Architecture Map now reflect current state on next deploy.
**Status:** Adopted
```

### Step 8: Provide the git commands

Tell the founder, exactly:

```
The registry is updated. To deploy, run these commands in your terminal:

cd "/Users/clintonaitkenhead/Claude-work/PROJECTS/sagereasoning"
git add website/public/component-registry.json operations/registry-updates/proposed-YYYY-MM-DD.md operations/decision-log.md archive/component-registry/
git commit -m "registry update: [N] components, [version] (handoff scan since [lastUpdated])"
git push

Vercel will redeploy automatically. Refresh https://www.sagereasoning.com/SageReasoning_Capability_Inventory.html and https://www.sagereasoning.com/SageReasoning_Architecture_Map.html to see the changes — red text will appear or disappear based on the new blocker fields.
```

Wait for the founder to confirm the deploy succeeded. If they report any of the pages broken or fields wrong, restore from the Step 6.1 backup and report what went wrong.

---

## Important Constraints

- **Status vocabulary (P0 0a):** Allowed `status` values are exactly: `scoped`, `designed`, `scaffolded`, `wired`, `verified`, `live`. Reject any handoff entry that uses other words ("done", "built", "complete") — flag for founder decision rather than guessing the right status.
- **Do not mix taxonomies (D14):** `status` is implementation status. Do not write decision-log words ("Adopted", "Under review") into the registry's `status` field.
- **Be conservative with `blocker` clearing.** Only propose clearing a `blocker` field when a handoff explicitly states the blocking condition is resolved (e.g., "infra-resend now integrated into website API"). Don't clear a blocker just because the status moved up. A wired-but-isolated component still has a blocker.
- **Preserve unaffected fields.** A status change should not touch `notes`, `deps`, `connects`, or any field not explicitly named in the proposed edit.
- **No silent additions.** A new component (one not in the registry but mentioned in a handoff) is a major action — propose it explicitly with all required fields, and require founder approval before adding.
- **No silent deletions.** A component removed from the registry is also a major action. Always require founder approval; never delete because a handoff said something is "deprecated" without explicit instruction.
- **Schema changes are not routine.** If a handoff suggests a new field on all components or a rename, that's a major version bump and requires its own approval cycle. Do not piggyback schema changes onto a routine update.

---

## File Locations

| File | Purpose |
|------|---------|
| `/website/public/component-registry.json` | The registry itself — single source of truth |
| `/operations/registry-updates/` | Directory for proposed-edits documents |
| `/operations/registry-updates/proposed-YYYY-MM-DD.md` | One per update session |
| `/archive/component-registry/component-registry.json.backup-YYYY-MM-DD-HHMM` | Pre-edit backups |
| `/operations/decision-log.md` | Decision log entry per applied update |
| `/operations/handoffs/**/*.md` | Source material scanned in Step 2 |

---

## Quality Checklist

Before declaring an update complete, verify:

- [ ] Pre-edit backup exists in `/archive/component-registry/`
- [ ] JSON parses successfully after edits
- [ ] `lastUpdated` is today's date
- [ ] `version` was incremented per the rules above
- [ ] `statusSummary` counts match the actual components by status
- [ ] `totalComponents` matches `components.length`
- [ ] Every applied edit has a corresponding entry in the proposed document with founder approval
- [ ] Decision-log entry written
- [ ] Git commands provided to the founder verbatim
- [ ] No status field uses non-vocabulary words
- [ ] No blocker was cleared without explicit handoff evidence

---

## Rollback

If the founder reports the registry is wrong after deploy:

1. Restore the registry from the Step 6.1 backup:
   ```
   cp archive/component-registry/component-registry.json.backup-YYYY-MM-DD-HHMM website/public/component-registry.json
   ```
2. Validate the restored JSON.
3. Tell the founder the exact git commands to commit and push the rollback:
   ```
   git add website/public/component-registry.json
   git commit -m "rollback: restore registry to pre-[version] state"
   git push
   ```
4. Add a debrief entry per `0b-ii` if the failure affected live data the founder depends on.
