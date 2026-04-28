# sage-registry-update — Comprehensive Component Registry Update

**Trigger:** The founder says "run the sage-registry-update skill", "update the registry", "update the component registry", "update the capability inventory", "update the architecture map statuses", "update the red text", or any variant indicating that `/website/public/component-registry.json` should be brought up to date with recent work.

**Status of this skill:** Redesigned 2026-04-28 (D-REGISTRY-UPDATE-SKILL-REDESIGNED-2026-04-28). Supersedes the prior narrow "diff against handoffs" design rolled back under D-REGISTRY-UPDATE-1.3.0-SUPERSEDED. Pre-redesign version archived at `/archive/2026-04-28_sage-registry-update-SKILL_pre-redesign.md`.

---

## What This Skill Does

This skill brings `/website/public/component-registry.json` up to date with the **current state of the project across every field that drives the two HTML dashboards**. The registry is the single source of truth that drives both `/SageReasoning_Capability_Inventory` and `/SageReasoning_Architecture_Map` — both pages fetch this JSON at runtime and render from it. Update the JSON, push to deploy, and both pages auto-render the new state on next page load.

**The question this skill answers:** *Does the registry reflect the actual current state of the project, across every field that drives the two HTML dashboards?*

**Not:** *What edits do recent handoffs justify against `status` and `blocker`?* (That was the narrow framing of the pre-redesign skill, which produced internally-contradictory partial states.)

**Why this matters:** Without a comprehensive update path, the registry drifts. New statuses bury in handoffs and never reach the public dashboards. Worse, partial updates leave rows where `status: verified` coexists with `notes: "Not integrated"` — internally contradictory states the dashboards faithfully render. This skill closes both gaps by walking every component, verifying every rendered field, and applying every approved correction in one comprehensive pass.

**The skill proposes; the founder approves; the skill then applies.** Same propose-then-apply pattern as `sage-registry-audit`. The registry is never silently mutated.

---

## When to Use

- The founder asks to update the registry, capability inventory, or architecture map statuses.
- A session has just resolved a blocker that's still flagged red on the live site.
- A new component has been built and needs to be added to the registry.
- The founder wants the dashboards to reflect work completed since the registry's `lastUpdated` date.

Do **not** use when:

- The change is to verify the existing registry's correctness against codebase reality — use `sage-registry-audit` instead. Audit answers "is the existing registry correct?"; this skill answers "what changed since the last update?".
- The change is to architecture map node positions or layout — use `sage-flows-update` instead.
- The change is to the HTML rendering logic — that's a code change, not a registry update.
- The change is to the registry schema itself (new fields across all components, field renames) — that requires its own approval cycle as a major version bump.

---

## Layer A vs Layer B (what each field does)

Per the redesign plan's reading of both HTML pages' source:

**Layer A — fields the HTMLs render directly:**
- `name`, `type`, `oldStatus`, `status` (renamed "Honest Status" in Capability Inventory), `desc`, `notes`, `humanReady`, `agentReady`, `origin`, `blocker` (used for red row colour when non-empty), plus `id` for matching.

**Layer B — fields that drive interpretation but don't render:**
- `connects`, `deps`, `journey`, `priority`, `rules`, `ext`, `path`, `subtype`, `proximity`.

**The skill audits and updates both layers** (Q4 decision, locked in 2026-04-28). Layer A drift is what users see on the dashboards. Layer B drift misleads future analyses (e.g., a stale `connects` array breaks the Pass 3 transitive impact check).

---

## The Four Passes

The skill walks every component, not just those mentioned in handoffs. For each, it runs four passes.

### Pass 1 — Source scan since the last *update* run (NOT since `lastUpdated`)

**Lookback anchor rule (patched 2026-04-28 under D-REGISTRY-UPDATE-SKILL-PASS1-FIX):**

The registry's `lastUpdated` field is bumped by both `sage-registry-audit` and `sage-registry-update`. Using it as the Pass 1 anchor produces an empty lookback whenever this skill runs after an audit. The fix is to anchor Pass 1 to the most recent *update-skill* run, not to any edit.

Determine the Pass 1 anchor in this priority order:

1. **Walk `/operations/decision-log.md` backwards from today.** Find the most recent entry whose identifier matches `D-REGISTRY-UPDATE-vX.Y.Z` AND whose status is **not** `Superseded`. Use that entry's date as the lookback start. (Skill-level entries like `D-REGISTRY-UPDATE-SKILL-REDESIGNED` or `D-REGISTRY-UPDATE-SKILL-PASS1-FIX` do NOT count — only registry-content updates with a version identifier.)

2. **If no such entry exists** (first non-superseded run, or all prior update runs were superseded), prompt the founder: *"No prior non-superseded update entry found. The pre-audit registry `lastUpdated` was [date X]. Use [date X] as the Pass 1 anchor, or specify a different anchor?"* Read [date X] from the most recent `D-REGISTRY-AUDIT-vX.Y.Z` entry's reasoning section, which records the pre-audit `lastUpdated` value.

3. **If no audit entry exists either** (truly first run on a fresh registry), prompt the founder for the anchor with no suggested default.

The anchor is named explicitly at the top of the proposal document (the "Lookback range" line) so the founder can verify the skill walked the right window.

**Once the anchor is fixed,** read every handoff in `/operations/handoffs/**/*.md` modified on or after that date. Read every entry in `/operations/decision-log.md` dated on or after that date.

For each handoff and decision-log entry, extract claims about each component:

- **Status Changes** — entries of the form "[Module/Component]: [Old status] → **[New status]**".
- **Decisions Made** — decisions whose impact line names a specific component.
- **Completed Work** — items that resolve a known blocker.
- **Blocked On** — current blockers (these confirm what should still be flagged).

Match handoff entries to component IDs in this priority order:

1. Exact ID match.
2. Stripped-prefix match (e.g., `resend` matches `infra-resend` after stripping `infra-`, only when the stripped portion is multi-word OR is itself unambiguous).
3. Component `name` field match.
4. Path or file match.
5. Explicit alias match.

When a match is ambiguous, **do not silently choose**. Flag as ambiguous in the proposal and ask the founder to confirm.

### Pass 2 — Code-grep verification

For each component whose `path` is in the registry, verify integration against actual code by **targeted import-pattern grep against actual call sites** — not stem-match.

**Why targeted, not stem-match:** the prior session's audit (D-REGISTRY-AUDIT-v1.2.1) found that stem-match grep over-flagged and under-flagged equally. For example, an initial stem-match for `profile-store` found 14 references in `/website/src/`, but a targeted grep against the actual import path `/sage-mentor/profile-store` found 7 distinct dynamic-import callers — different number, different files, different conclusion. PR5 candidate (count: 2 of 3) at the time of this rewrite; promote to permanent KG entry on third recurrence.

**The targeted grep pattern:**

For TypeScript/TSX files, search `/website/src/` for one of these patterns where `<path-stem>` is the module path stripped of leading `/` and trailing `.ts`:
- `from ['\"]<path-stem>['\"]`
- `import\(['\"]<path-stem>['\"]`
- `require\(['\"]<path-stem>['\"]`

Count distinct files in `/website/src/` that reference the component. Cross-reference with the component's `status` and `blocker`:

| Registry says | `/website/src/` shows | Finding |
|---|---|---|
| status `wired` / `verified` / `live` | ≥1 reference | Consistent — no action |
| status `wired` / `verified` / `live` | 0 references | **Inconsistent** — flag for status review or path correction |
| `blocker` contains "isolated" / "not integrated" / "zero imports" | ≥1 reference | **Inconsistent** — flag for blocker rewrite |
| `blocker` contains "isolated" / "not integrated" / "zero imports" | 0 references | Consistent — no action |
| status `scoped` / `designed` / `scaffolded` | ≥1 reference | **Inconsistent** — status may be stale; flag for review |
| status `scoped` / `designed` / `scaffolded` | 0 references | Consistent — no action |

For sage-mentor and trust-layer components specifically, also search the sage-mentor and trust-layer directories themselves for cross-component references — these reflect internal cohesion separate from website integration.

### Pass 3 — Transitive impact

For each component changed by Pass 1 or Pass 2, walk the registry's `connects` and `deps` arrays. For every related component whose `blocker` text references the changed component's *old* state, flag for review.

Example: if `engine-pattern-engine` moves from "isolated" to "verified", every component whose `blocker` says "Pattern engine not integrated" needs its `blocker` reviewed. This pass prevents the "rows promoted but transitively-blocked rows still claim the old block" failure mode that caused the 2026-04-28 v1.3.0 rollback.

### Pass 4 — Internal consistency (every row, not only touched ones)

For every row in the registry, check that the rendered fields are mutually consistent. This is the pass that was missing from the pre-redesign skill.

**Status × blocker checks:**
- `status: verified` AND `blocker` mentions "isolated" / "not integrated" → inconsistent.
- `status: verified` AND `blocker` is empty → flag per Q2 rule (Verified rows should carry a remaining-work note).
- `status: live` AND `blocker` mentions "not deployed" → inconsistent.

**Status × notes checks:**
- `status: verified` AND `notes` contain "Not integrated" / "Isolated" / "stub only" / "Not yet" / "Pending" → inconsistent. The `notes` field is the one most likely to go stale because the audit skill and prior update skill focused on `status` and `blocker`. **Pass 4 catches `notes` drift explicitly.**
- `status: live` AND `notes` contain "Not yet" / "Pending" → inconsistent.

**humanReady / agentReady × status checks:**
- `humanReady: ready` AND `status` in {`scoped`, `designed`, `scaffolded`} → inconsistent.
- `humanReady: not-ready` for a component whose `journey` is `internal` or whose role is to be invoked by other engines → flag per Q3 rule (`na` is the truer value for pipeline-internal components).
- Same shape for `agentReady`.

**Journey × status checks:**
- `journey: deprecated` AND `status: live` → inconsistent.

Each contradiction is recorded as a finding with the row's id, the contradicting fields, and a proposed correction.

---

## Source-of-truth per field

Before proposing any change, the skill names where each field's truth comes from. This prevents silent guesses.

| Field | Source-of-truth |
|---|---|
| `status` | Most recent handoff or decision-log entry using 0a vocabulary (Scoped / Designed / Scaffolded / Wired / Verified / Live). Status promotions require explicit decision-log evidence (not just code-grep). |
| `oldStatus` | Snapshot of `status` at the time of the previous registry update. Preserved automatically; updated to the previous `status` value when `status` changes. |
| `desc` | Plain-language description of what the component is. Edited only if the component's architecture has changed. |
| `notes` | Synthesis of the row's *current state*: what a reader needs to know right now. Must be consistent with `status` and `blocker`. The field most likely to go stale; Pass 4 catches drift explicitly. |
| `humanReady` | Whether a human user can use this component as-is. Per Q3 rule, reads `na` for pipeline-internal components. |
| `agentReady` | Whether an external agent (API consumer) can use this component. Per Q3 rule, reads `na` for pipeline-internal components. |
| `blocker` | Specific remaining work. Per Q2 rule, always carries a short remaining-work note when the row has substantive next steps; cleared only when no work remains AND no next step is named. |
| `origin` | Source attribution (e.g., "founder-built", "AI-generated", "external-library"). Edited only if the source attribution changes. |
| `connects` | Registry-internal edges. Updated when a component's logical dependencies in the registry change (renames, additions). |
| `deps` | External dependencies (claude-api, supabase, resend, etc). Edited only if the external surface changes. |
| `journey` | Where the component sits in the product surface (free_tier, paid_tier, internal, deprecated). Edited under decision-log entries (D-D1-* etc). |
| `priority` | Planning priority (P0–P7). Edited only when project priorities change. |
| `rules` | Manifest rules governing this component. Edited when rules added/removed or amendment changes coverage. |
| `path` | Canonical file path. Single file path only; no `+` separator. Multi-file components document companion files in `desc` or `notes`. |
| `subtype` | Component subtype taxonomy. Edited only when subtype taxonomy itself changes. |

---

## Conventions encoded as rules (Q1–Q4 + audit-skill conventions)

### Q1 — One comprehensive skill (locked in 2026-04-28)

The redesigned skill always runs all four passes. No depth flag. No "quick mode". No second skill (the audit role belongs to `sage-registry-audit`). If the founder needs only a correctness check on the existing registry without bringing in new work since `lastUpdated`, that's `sage-registry-audit`. If the founder needs new work brought in plus a correctness check, that's this skill (which encompasses both via the four passes).

### Q2 — Always preserve a remaining-work note (locked in 2026-04-28)

When integration is complete but a substantive next step is named, the `blocker` field carries a short remaining-work note (e.g., "Next: P3 evaluation"; "Next: §8 founder-hub switch"; "Layers 9-10 outstanding") rather than clearing to empty. Rows with substantive next steps stay marked red on the dashboard; the content of the note describes what's done and what's next.

The `blocker` field is cleared (empty string) only when:
- No work remains, AND
- No specific next step is named.

This keeps the dashboards meaningful as a "what's done / what's next" map. An empty blocker means the row is genuinely complete with no named follow-up; a non-empty blocker means the row has a named next action and renders red so the eye catches it.

### Q3 — `na` for pipeline-internal components (locked in 2026-04-28)

`humanReady` and `agentReady` read `na` (rendered "N/A" on the dashboard) for engines never intended to face users or agents directly. Specifically:

- Components with `journey: internal`.
- Components whose role is to be invoked by other engines, not by users or external agents (e.g., `engine-pattern-engine`, `engine-ring-wrapper`, `engine-progression`).

The audit skill's Pass C flags rows that read `not-ready` and should read `na`. The redesigned skill's Pass 4 applies the rule consistently when proposing edits.

### Q4 — Edit both Layer A and Layer B when stale (locked in 2026-04-28)

Layer A (rendered fields: `name`, `type`, `oldStatus`, `status`, `desc`, `notes`, `humanReady`, `agentReady`, `origin`, `blocker`) and Layer B (interpretation fields: `connects`, `deps`, `journey`, `priority`, `rules`, `path`, `subtype`) are both subject to drift checking and both edited when stale.

Layer A drift is what users see on the dashboards. Layer B drift misleads future analyses. The skill is comprehensive across both layers.

### Audit-skill conventions carried over

These are the conventions adopted for the audit skill (D-REGISTRY-AUDIT-SKILL-CREATED-2026-04-28) that apply equally to this skill:

- **Be conservative with status promotions.** A status promotion (e.g., `wired` → `verified`) requires explicit decision-log evidence (e.g., a Verified entry, an ADR section marked Verified, a session-close noting Verified). Code presence proves wiring; explicit verification claims prove testing. Do not promote `wired` → `verified` from code-grep evidence alone.
- **No silent additions.** A new component (one not in the registry but found in the codebase or named in a handoff) is a major action — propose explicitly with all required fields, require founder approval before adding. New components trigger a minor version bump (vX.Y.Z → v(X+1).0.0).
- **No silent deletions.** A component removed from the registry is a major action. Always require founder approval; never delete because a handoff said something is "deprecated" without explicit instruction. A path-missing finding does NOT mean the component should be deleted — propose either path correction or component deprecation, never silent removal.
- **Schema changes are not routine.** A new field across all components, a field rename, or a structural change to the JSON shape is a major version bump (vX.Y.Z → v(X+1).0.0) and requires its own approval cycle. Do not piggyback schema changes onto a routine update.
- **Status vocabulary discipline (P0 0a).** Allowed `status` values are exactly: `scoped`, `designed`, `scaffolded`, `wired`, `verified`, `live`. Reject any handoff entry that uses other words ("done", "built", "complete") — flag for founder decision rather than guessing.
- **Do not mix taxonomies (D14).** `status` is implementation status. Do not write decision-log words ("Adopted", "Under review", "Superseded") into the registry's `status` field.

---

## Output shape

A single comprehensive proposal at:

```
operations/registry-updates/proposed-YYYY-MM-DD.md
```

If a file with that name already exists (multiple update sessions in one day), append a letter suffix (`proposed-YYYY-MM-DD-b.md`).

Use this exact format:

```markdown
# Registry Update Proposal — [Today's Date]

**Registry version:** [current]
**Registry lastUpdated:** [date from JSON]
**Lookback range (Pass 1 anchor):** [anchor-date per Pass 1 rule] → [today]
**Components audited (Pass 4):** [N — should equal totalComponents]
**Handoffs scanned (Pass 1):** [N files]
**Decision-log entries scanned (Pass 1):** [N entries since Pass 1 anchor]
**Components proposed for update:** [N total]
**New components proposed (if any):** [N — each needs explicit founder approval]
**Ambiguous matches needing founder input:** [N]

---

## 1. Source-scan findings (Pass 1)

### [Component ID] — [Component Name]

**Current state:**
- status: [current]
- blocker: "[current text or empty]"
- notes: "[current notes]"
- [other fields if changing]

**Proposed change:**
- status: [current] → **[new]**
- blocker: "[current]" → "[new — per Q2 rule]"
- notes: append/replace "[new note]"

**Evidence:**
- Source: `/operations/handoffs/[stream]/[date]-[file].md` OR `/operations/decision-log.md` entry [D-XXX]
- Quoted text: "[exact quote]"
- Reasoning: [why this evidence justifies the change]

[repeat per finding]

---

## 2. Code-grep findings (Pass 2)

### [Component ID]

**Current state:**
- status: [current]
- blocker: "[current]"
- path: "[current]"

**Targeted grep result:** [N distinct files in /website/src/ reference this path]
**Files referencing:** [list — top 5, "+ N more" if more]

**Proposed correction:** [field: new value]

**Reasoning:** [Pass 2 table outcome]

[repeat per finding]

---

## 3. Transitive impact findings (Pass 3)

### [Component ID changed in Pass 1/2]

**Components whose blocker references the old state:**
- `[related-id-1]` — current blocker: "[text mentioning old state]" → proposed: "[updated text]"
- `[related-id-2]` — ...

[repeat per change]

---

## 4. Internal consistency findings (Pass 4)

### [Component ID]

**Contradiction:** [field-1: value-1] vs [field-2: value-2]

**Proposed correction:** [which field changes, to what — favouring Q2/Q3/Q4 rules where they apply]

**Reasoning:** [why this resolves the contradiction]

[repeat per finding]

---

## 5. New component proposals (if any — Pass 1 or codebase-walk)

### [proposed-id] — [proposed name]

**Full proposed entry:**
```json
{
  "id": "[id]",
  "name": "[name]",
  "type": "[type]",
  "subtype": ["[subtype]"],
  "status": "[status]",
  "oldStatus": null,
  "ext": "[ext]",
  "path": "[path]",
  "desc": "[desc]",
  "notes": "[notes]",
  "humanReady": "[ready/not-ready/na per Q3]",
  "agentReady": "[ready/not-ready/na per Q3]",
  "origin": "[origin]",
  "connects": [],
  "deps": [],
  "journey": "[journey]",
  "priority": "[priority]",
  "rules": [],
  "blocker": "[blocker per Q2]"
}
```

**Justification:** [why this component should exist in the registry; what evidence (handoff, decision-log, code presence) supports it]

[repeat per proposal]

---

## 6. Ambiguous matches requiring founder decision

### [Handoff entry]

**Source:** `/operations/handoffs/[file].md`
**Quoted text:** "[exact quote]"
**Possible matches:**
- `[component-id-1]` — [name]
- `[component-id-2]` — [name]

**Founder decision needed:** Which component (if any) does this entry refer to?

---

## 7. No-change findings

[Optional — components scanned and confirmed consistent. List by id with one-line confirmation. Useful for transparency: founder can see what was checked but not flagged.]
```

---

## Step 1: Read the registry and capture current header state

Read `/website/public/component-registry.json`. Capture: `version`, `lastUpdated`, `totalComponents`, `statusSummary`. These are baselines for the apply step (recompute). The Pass 1 lookback anchor is determined separately per the Pass 1 rule — NOT from `lastUpdated`.

## Step 2: Run Pass 1 (source scan since the last *update* run — see Pass 1 lookback anchor rule)

Walk `/operations/handoffs/**/*.md` modified on or after `lastUpdated`. Read each. Walk `/operations/decision-log.md` for entries dated on or after `lastUpdated`. Extract claims per the matching rules above.

## Step 3: Run Pass 2 (code-grep verification)

For every component with a `path`, run the targeted import-pattern grep. Build the per-component reference count. Apply the Pass 2 table.

## Step 4: Run Pass 3 (transitive impact)

For every component changed by Pass 1 or Pass 2, walk `connects` and `deps`. Flag related components whose `blocker` references the changed component's old state.

## Step 5: Run Pass 4 (internal consistency)

For every row (every component, not just touched), apply the Pass 4 contradiction checks. Apply Q2/Q3/Q4 rules consistently.

## Step 6: Build the proposal

Create the proposal at `/operations/registry-updates/proposed-YYYY-MM-DD.md` per the Output shape above.

## Step 7: Present the proposal to the founder

Summarise in plain language:

- "I scanned [N] handoffs and [N] decision-log entries from [lastUpdated] to today, and audited every component (Pass 4)."
- "I'm proposing [N] component updates, [N] new components (if any), and flagging [N] ambiguous matches."
- "Top three changes: [list]."
- "The full proposal is at `/operations/registry-updates/proposed-YYYY-MM-DD.md`."
- Ask: "Review the proposal and tell me which edits to apply, modify, or reject."

**Do not apply any edits in this step.** Wait for explicit founder approval, in the form of "apply all", "apply sections [N, N]", "apply per-edit instructions follow:", or per-edit instructions.

## Step 8: Apply approved edits (only on explicit approval)

Once the founder approves, in this exact order:

**8.1. Pre-edit backup.** Copy the current registry to:

```
archive/component-registry/component-registry.json.backup-YYYY-MM-DD-HHMM
```

Note: NO `-audit-` infix. The `-audit-` infix is used by `sage-registry-audit` to distinguish its backups; this skill's backups have no infix.

Create the `archive/component-registry/` folder if it does not exist.

**8.2. Apply the field updates.** For each approved edit, update the named fields in the named component. Preserve all other fields. Preserve key ordering. Preserve the existing JSON formatting style (2-space indent, multi-line arrays).

For each `status` change: copy the previous `status` value into `oldStatus`.

**8.3. Apply approved new components.** For each approved new component, append to the `components` array using the proposed JSON entry.

**8.4. Recompute `statusSummary`.** Count components by their (possibly newly corrected) `status` field. Update the summary block to match. Include only statuses with non-zero counts.

**8.5. Update `lastUpdated`.** Set to today's date in YYYY-MM-DD format.

**8.6. Increment `version`** per semver:
- **Patch bump** (e.g., 1.2.1 → 1.2.2) for field-only updates to existing components.
- **Minor bump** (e.g., 1.2.1 → 1.3.0) when components are added or removed.
- **Major bump** (e.g., 1.2.1 → 2.0.0) only if the schema itself changes (a new field added to all components, or a field renamed). Major bumps require explicit founder approval as a separate decision — they are not adopted as part of a routine update.

**8.7. Update `totalComponents`.** Set to actual `components.length`.

**8.8. JSON validation.** Parse the result. If parsing fails, abort, restore from the Step 8.1 backup, and tell the founder what failed.

**8.9. Write the file.**

## Step 9: Write a decision-log entry

Append to `/operations/decision-log.md`:

```markdown
## [Today's Date] — D-REGISTRY-UPDATE-vX.Y.Z

**Decision:** Updated /website/public/component-registry.json from vA.B.C to vX.Y.Z. [N] components changed, [N] new components added (if any). Four passes ran: Pass 1 source scan since [anchor-date per Pass 1 rule], Pass 2 code-grep verification, Pass 3 transitive impact, Pass 4 internal consistency. Approved edits documented in /operations/registry-updates/proposed-YYYY-MM-DD.md. Pre-edit backup at /archive/component-registry/component-registry.json.backup-YYYY-MM-DD-HHMM.

**Reasoning:** [Brief — what the four passes surfaced, what categories of change were applied. Reference the proposal as the audit trail for evidence per edit. Note any deferrals (Pass-2 inconsistencies the founder chose to defer, etc.) per PR7.]

**Rules served:** R0 (oikeiosis audit trail — proposal and this entry), 0a (status vocabulary preserved), 0d-ii ([Standard for field-only updates / Elevated if schema-adjacent]; pre-edit backup; rollback path documented), PR1 (single-endpoint proof — first invocation of the redesigned skill validates the design), PR2 (verification immediate — JSON re-parsed cleanly post-write; statusSummary recount validated), PR5 (note any concept re-explanation observations), PR7 (note any deferred decisions explicitly).

**Status:** Adopted. Cross-references: [decision-log entries that contributed to findings]. Proposal at /operations/registry-updates/proposed-YYYY-MM-DD.md. Skill at /.claude/skills/sage-registry-update/SKILL.md.
```

## Step 10: Provide the git commands

Tell the founder, exactly:

```
The registry is updated. To deploy, run these commands in your terminal:

cd "/Users/clintonaitkenhead/Claude-work/PROJECTS/sagereasoning"
git add website/public/component-registry.json operations/registry-updates/proposed-YYYY-MM-DD.md operations/decision-log.md archive/component-registry/
git commit -m "registry update vX.Y.Z: [N] components ([passes ran])"
git push

If git push fails (sandbox-can't-push pattern, see D-PR8-PUSH 2026-04-26), use GitHub Desktop:
  1. Open GitHub Desktop.
  2. Confirm the changes appear under "Changes".
  3. Type the commit message above into the summary box.
  4. Click "Commit to main".
  5. Click "Push origin".

Vercel will redeploy automatically (~1 minute). Refresh both pages to see the changes:
  https://www.sagereasoning.com/SageReasoning_Capability_Inventory.html
  https://www.sagereasoning.com/SageReasoning_Architecture_Map.html
```

After the founder confirms the deploy succeeded, walk through one or two specific changed rows together to confirm live-site rendering matches the proposal. If anything looks wrong, restore from the Step 8.1 backup and report what failed.

---

## File Locations

| File | Purpose |
|------|---------|
| `/website/public/component-registry.json` | The registry itself — single source of truth |
| `/operations/registry-updates/` | Directory for proposal documents |
| `/operations/registry-updates/proposed-YYYY-MM-DD.md` | One per update session |
| `/archive/component-registry/component-registry.json.backup-YYYY-MM-DD-HHMM` | Pre-edit backups (no `-audit-` infix; that's reserved for `sage-registry-audit`) |
| `/operations/decision-log.md` | Decision-log entry per applied update |
| `/operations/handoffs/**/*.md` | Source for Pass 1 |
| `/website/src/` | Source for Pass 2 |
| `/sage-mentor/`, `/trust-layer/` | Additional sources for Pass 2 cross-component cohesion check |

---

## Quality Checklist

Before declaring an update complete, verify:

- [ ] All four passes (1, 2, 3, 4) ran against the registry.
- [ ] Proposal document exists at the expected path.
- [ ] Every proposed change has Pass-identified evidence (handoff quote, decision-log entry, code-grep count, internal-consistency reasoning).
- [ ] No-change findings are listed for transparency where helpful.
- [ ] Pre-edit backup exists in `/archive/component-registry/` (no `-audit-` infix).
- [ ] JSON parses successfully after edits.
- [ ] `lastUpdated` is today's date.
- [ ] `version` was incremented per the rules above.
- [ ] `statusSummary` counts match the actual components by `status`.
- [ ] `totalComponents` matches `components.length`.
- [ ] Every applied edit has a corresponding entry in the proposed document with founder approval.
- [ ] Decision-log entry written with `D-REGISTRY-UPDATE-vX.Y.Z` identifier.
- [ ] Git commands provided to the founder verbatim.
- [ ] No status field uses non-vocabulary words.
- [ ] No decision-log taxonomy words ("Adopted", "Under review") written into the registry.
- [ ] No silent additions; every new component had explicit founder approval.
- [ ] No silent deletions; every removal had explicit founder approval.
- [ ] No silent schema changes piggybacked onto the routine update.
- [ ] Q2 rule applied: Verified/Live rows have a remaining-work note in `blocker` unless genuinely complete with no named next step.
- [ ] Q3 rule applied: pipeline-internal components read `na` for `humanReady` / `agentReady`.
- [ ] Q4 rule applied: Layer B fields edited where stale.

---

## Rollback

If the founder reports the registry is wrong after deploy:

1. Restore the registry from the Step 8.1 backup:
   ```
   cp archive/component-registry/component-registry.json.backup-YYYY-MM-DD-HHMM website/public/component-registry.json
   ```
2. Validate the restored JSON.
3. Tell the founder the exact git commands to commit and push the rollback:
   ```
   git add website/public/component-registry.json
   git commit -m "rollback: restore registry to pre-vX.Y.Z state"
   git push
   ```
4. Append a supersession entry to the decision log: `D-REGISTRY-UPDATE-vX.Y.Z-SUPERSEDED`.
5. Add a debrief entry per `0b-ii` if the failure affected what the founder relies on for live-site verification.

---

## Relationship to other registry skills

| Skill | Question it answers | When to use |
|---|---|---|
| `sage-registry-audit` | Is the existing registry correct and complete? | Before update if accuracy is uncertain; periodically as a baseline check; after a rollback. |
| `sage-registry-update` (this skill) | What changed since the last update was deployed, AND is every row internally consistent? | After substantial new work; routine cadence between audits; whenever the dashboards need to reflect the current state. |
| `sage-flows-update` | Have flow node positions or edges changed? | When the architecture map's layout needs updating (separate from registry content). |

The audit answers correctness; the update answers freshness AND consistency. Run the audit when the foundation is uncertain; run the update when new work has landed and the dashboards need to catch up.

---

## Provenance

- **Pre-redesign version (rolled back 2026-04-28):** `/archive/2026-04-28_sage-registry-update-SKILL_pre-redesign.md`. The narrow "diff against handoffs" design that produced internally-contradictory partial states.
- **Redesign plan:** `/operations/registry-updates/skill-redesign-plan-2026-04-28.md`. Adopted with Q1–Q4 decisions on 2026-04-28.
- **Decision-log entries:** D-REGISTRY-UPDATE-1.3.0 (the original attempt), D-REGISTRY-UPDATE-1.3.0-SUPERSEDED (the rollback rationale), D-REGISTRY-AUDIT-SKILL-CREATED (the companion audit skill), D-REGISTRY-UPDATE-SKILL-REDESIGNED-2026-04-28 (this rewrite).
