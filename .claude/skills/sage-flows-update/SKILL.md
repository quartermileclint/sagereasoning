# sage-flows-update — Architecture Map Flow Update Automation

**Trigger:** The founder says "run the sage-flows-update skill", "update the flows", "update the architecture map nodes", "add a node to the architecture map", "move a node on the architecture map", "remove a node from the architecture map", or any variant indicating that `/website/public/flows.json` should be changed.

---

## What This Skill Does

This skill manages `/website/public/flows.json`, which controls the visual layout of the SageReasoning Architecture Map. The file defines the position, label, category, and layer of every node, plus the connection lines (flows) between nodes. The Architecture Map page fetches this JSON at runtime and renders the diagram from it.

This skill is **scoped narrowly to layout changes** — adding a new node, moving an existing node, removing a node, or adding/removing a connection. Component status changes and red-text updates are handled by the `sage-registry-update` skill, which works on `component-registry.json`. Both skills can be needed together when adding a brand-new component (registry entry + flow node).

**The skill proposes; the founder approves; the skill then applies.** The same propose-then-apply pattern as `sage-registry-update`. Position decisions in particular need founder judgement — node x/y values affect visual clarity and the skill should never invent positions.

---

## When to Use

- A new component has been added to `component-registry.json` and needs to appear on the Architecture Map.
- An existing node is in the wrong position, overlaps another node, or sits in the wrong layer.
- A flow path needs to add or remove a connection (e.g., a new dependency between two components).
- A component has been removed from the registry and its node should be removed from the map.

Do **not** use when:
- The change is to a component's `status`, `blocker`, `notes`, or any other non-positional field — use `sage-registry-update` instead.
- The change is to the page's CSS, rendering logic, or controls — that's a code change to the HTML file, not a flow update.

---

## How It Works

### Step 1: Read the current flows file

Read `/website/public/flows.json`. Note the structure:

```json
{
  "nodes": {
    "node-id": { "x": 180, "y": 80, "label": "...", "category": "...", "layer": "..." },
    ...
  },
  "flows": {
    "flow-name": [ "node-id-1", "node-id-2", ... ],
    ...
  }
}
```

### Step 2: Confirm the founder's intent

Before proposing edits, ask the founder for the specifics:

**For a new node:**
- Component ID (must match a component in `component-registry.json`, or be flagged as a registry-skill prerequisite).
- Label (the visible text on the node — usually the component's `name` field).
- Category (one of: `product`, `agent`, `engine`, `data`, `infra`, `reasoning`, `tool`, `doc`, `ops`).
- Layer (which horizontal band — `entry`, `1`, `2`, `3`, `4`, `5`, etc.).
- Position: explicit x/y, or "near node X, offset right" / "below node Y", and the skill will compute from neighbours.
- Which flow(s) this node belongs to (if any).

**For a move:**
- Node ID.
- New x/y, or "next to node Z" with offset direction.

**For a remove:**
- Node ID.
- Confirmation that the corresponding component-registry entry has already been removed (or will be — the founder may want both to happen in sequence).

**For a flow addition or removal:**
- Flow name.
- Node IDs being added or removed from the flow's path.
- Whether to preserve order in the path (flows are ordered arrays).

### Step 3: Build the proposed-edits document

Create a file at:

```
operations/flow-updates/proposed-YYYY-MM-DD.md
```

If a file with that name already exists (multiple update sessions in one day), append a letter suffix.

Use this format:

```markdown
# Flow Update Proposal — [Today's Date]

**Action:** [Add node / Move node / Remove node / Modify flow]
**Components affected:** [N nodes, M flows]

---

## Proposed Edits

### [Action 1]

**Type:** [Add node / Move / Remove / Flow change]
**Node ID:** [id]
**Current state:** [e.g., "Not in flows.json" / "Currently at x=180, y=80, layer=1"]
**Proposed state:**
- x: [value]
- y: [value]
- label: "[text]"
- category: [value]
- layer: [value]

**Reasoning:** [Why this position / change makes visual sense — e.g., "Sits between the API layer and the data layer, in the same x-band as similar engines."]

**Visual impact:** [What changes on the rendered map. If a position move, name what would shift around it.]

---

[repeat for each edit]
```

### Step 4: Present the proposal to the founder

Summarise:
- "I'm proposing [N] flow changes."
- "[Brief description of each]."
- "The full proposal is at `/operations/flow-updates/proposed-YYYY-MM-DD.md`."
- Ask: "Approve, modify, or reject?"

**Do not apply any edits in this step.**

### Step 5: Apply approved edits (only on explicit approval)

In this exact order:

**5.1. Pre-edit backup.** Copy the current flows file to:

```
archive/flows/flows.json.backup-YYYY-MM-DD-HHMM
```

Create the `archive/flows/` folder if it does not exist.

**5.2. Apply the changes.** Update the relevant nodes and/or flows entries. Preserve all unaffected entries. Preserve the existing JSON formatting style.

**5.3. Validate JSON syntax.** Parse the result. If parsing fails, abort, restore from the Step 5.1 backup, and tell the founder what failed.

**5.4. Validate referential integrity.** Every node ID referenced in any `flows` array must exist as a key in `nodes`. Every node ID, ideally, has a matching entry in `/website/public/component-registry.json` — flag any that don't (the architecture map will still render, but the red-text logic depends on registry alignment).

**5.5. Write the file.**

### Step 6: Write a decision-log entry

Append to `/operations/decision-log.md`:

```markdown
## [Today's Date] — Flow Update

**Decision:** Updated flows.json — [N] node changes, [M] flow changes.
**Reasoning:** [Brief: why these changes — usually tied to a component addition/removal in the registry].
**Rules served:** R0 (architecture transparency).
**Impact:** Architecture Map renders the new layout on next deploy.
**Status:** Adopted
```

### Step 7: Provide the git commands

Tell the founder, exactly:

```
The flows file is updated. To deploy, run these commands in your terminal:

cd "/Users/clintonaitkenhead/Claude-work/PROJECTS/sagereasoning"
git add website/public/flows.json operations/flow-updates/proposed-YYYY-MM-DD.md operations/decision-log.md archive/flows/
git commit -m "flows update: [brief summary]"
git push

Vercel will redeploy automatically. Refresh https://www.sagereasoning.com/SageReasoning_Architecture_Map.html to see the new layout.
```

Wait for the founder to confirm the deploy succeeded.

---

## Important Constraints

- **Never invent positions.** If the founder hasn't specified x/y or a relative anchor ("near node X"), ask for one. Inventing positions creates visual chaos.
- **Layer values must be consistent.** Use only values already present in the file unless the founder explicitly approves a new layer band.
- **Category values must be from the allowed set.** `product`, `agent`, `engine`, `data`, `infra`, `reasoning`, `tool`, `doc`, `ops`. New categories require founder approval and a CSS update on the page (out of scope for this skill).
- **A node must reference an existing component when possible.** If a node is added without a matching entry in `component-registry.json`, the red-text logic on the page will not be able to flag it as blocked. Flag this as a finding in the proposal.
- **Flow paths are ordered.** When adding a node to a flow, the order in the array determines the visual line. Confirm intended position in the path with the founder.
- **Do not edit nodes outside the proposal.** Even if a node looks misaligned, don't fix it unless the founder asked. Surface the finding instead.

---

## File Locations

| File | Purpose |
|------|---------|
| `/website/public/flows.json` | The flows file itself — source of truth for the Architecture Map layout |
| `/website/public/component-registry.json` | Component registry (used for cross-validation) |
| `/operations/flow-updates/` | Directory for proposed-edits documents |
| `/operations/flow-updates/proposed-YYYY-MM-DD.md` | One per update session |
| `/archive/flows/flows.json.backup-YYYY-MM-DD-HHMM` | Pre-edit backups |
| `/operations/decision-log.md` | Decision log entry per applied update |

---

## Quality Checklist

Before declaring an update complete, verify:

- [ ] Pre-edit backup exists in `/archive/flows/`
- [ ] JSON parses successfully after edits
- [ ] Every node ID in `flows` arrays exists in `nodes`
- [ ] Every new or moved node has explicit founder-approved x/y values
- [ ] Category and layer values are from the allowed sets
- [ ] Decision-log entry written
- [ ] Git commands provided to the founder verbatim

---

## Coordination With sage-registry-update

When adding a brand-new component to the project:

1. Run `sage-registry-update` first to add the component entry. This determines the component ID, name, and category.
2. Run `sage-flows-update` next to place the new node on the Architecture Map. The skill uses the registry entry to suggest a default category and ask only for position and layer.
3. Both updates can be committed in a single push if done in the same session.

When removing a component:

1. Run `sage-flows-update` first to remove the node from the map (so the page doesn't reference a missing component).
2. Run `sage-registry-update` next to remove the component from the registry.

---

## Rollback

If the founder reports the architecture map is broken or wrong after deploy:

1. Restore the flows file from the Step 5.1 backup:
   ```
   cp archive/flows/flows.json.backup-YYYY-MM-DD-HHMM website/public/flows.json
   ```
2. Validate the restored JSON.
3. Provide the git commands to commit and push the rollback:
   ```
   git add website/public/flows.json
   git commit -m "rollback: restore flows to pre-[date-time] state"
   git push
   ```
