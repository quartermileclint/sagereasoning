# Session Close — 27 April 2026

## Decisions Made

- **Architecture finding (corrects prior misunderstanding):** Both `/SageReasoning_Capability_Inventory.html` and `/SageReasoning_Architecture_Map.html` already auto-render from JSON. They fetch `/component-registry.json` (and `/flows.json` for the architecture map) at runtime. To update statuses or red text, the JSON is edited; the HTML never needs touching. Reasoning: AI's first answer wrongly described the pages as static and needing hand-editing. Founder pushed back; AI investigated, found the `fetch('/component-registry.json')` calls, and corrected with "I caused this" signal. → **Impact:** Update workflow is JSON-only; the rendering pipeline already exists.

- **Path A adopted for new skills (vs. Cowork plugin packaging).** Reasoning: matches the existing project convention (sage-stenographer, sage-wiring-fix, sage-interpret, sage-consult), zero install friction, files travel with the repo. Trade-off accepted: skills are convention-only (Cowork doesn't formally register `.claude/skills/`), so reliable invocation depends on the founder uttering the trigger phrase in a session that has the project folder mounted. → **Impact:** Two new skill files created at `.claude/skills/`; banner instructions on both HTML pages tell the founder how to invoke them.

- **Two skills, not one.** Reasoning: `component-registry.json` and `flows.json` have different schemas, different change cadences (registry frequent, flows rare), and different governance needs (registry uses status vocabulary; flows requires positional judgement). One coupled skill would force the rare case to drag the common case. → **Impact:** `sage-registry-update` and `sage-flows-update` are independent skills with a documented coordination protocol for the new-component case.

- **Propose-then-apply pattern.** Reasoning: matches the founder's decision-authority preference ("Never edit strategic or governing documents without my explicit approval"). The registry isn't strictly governing but is consequential — wrong edits go live to public pages. → **Impact:** Both skills produce a proposed-edits document for founder review before applying any changes.

- **Skill instructions visible on the pages.** Reasoning: founder cannot rely on memory across long-spaced update sessions; putting the trigger phrase on the artefact being updated removes that dependency. → **Impact:** Slim banner on each page, displaying trigger phrase + dynamic `lastUpdated` date.

- **Belt-and-braces session-opening reminder declined.** Considered: adding a one-line reminder in each skill file pointing to `/adopted/session-opening-protocol.md`. Rejected: matches existing project convention (none of the four existing skills include such a reminder). Founder confirmed the governing-frame declaration at session open is enough. → **Impact:** Skills assume the session is already opened under the protocol; founder declares the frame at every session open.

- **Stale root HTML copies archived (not edited or deleted).** Reasoning: The deployed copies live in `/website/public/`; the root copies were last edited Apr 20–21 and had drifted from deployment by Apr 24. Archiving (not deleting) preserves history per D6-A pattern. → **Impact:** Project root no longer has the two HTML files; only `/website/public/` copies are real and deployed.

## Status Changes

- `/SageReasoning_Capability_Inventory.html` (root copy): Live → **Archived** (`/archive/2026-04-27_root-html-stale-copies/`)
- `/SageReasoning_Architecture_Map.html` (root copy): Live → **Archived** (same folder)
- `/website/public/SageReasoning_Capability_Inventory.html`: Live → **Live** (banner added locally; not yet deployed — see Blocked On)
- `/website/public/SageReasoning_Architecture_Map.html`: Live → **Live** (banner added locally; not yet deployed — see Blocked On)
- `sage-registry-update` skill: not-exists → **Scaffolded** (SKILL.md written; first invocation pending = proof point)
- `sage-flows-update` skill: not-exists → **Scaffolded** (same)

## Completed Work

1. Investigated the actual rendering architecture of both HTML pages — confirmed JSON-driven runtime fetching. Corrected the AI's first wrong answer.
2. Archived stale root HTML copies to `/archive/2026-04-27_root-html-stale-copies/`.
3. Created `/.claude/skills/sage-registry-update/SKILL.md` (~12.5KB, propose-then-apply pattern, status-vocabulary enforcement, semver bump rules, pre-edit backup, decision-log entry, git command output).
4. Created `/.claude/skills/sage-flows-update/SKILL.md` (~10KB, narrower scope, position decisions stay manual, referential-integrity validation against component-registry.json).
5. Created supporting folders: `/operations/registry-updates/` (with README), `/operations/flow-updates/`, `/archive/component-registry/`, `/archive/flows/`.
6. Added `.skill-banner` CSS, banner div, and JS `lastUpdated` wiring to `/website/public/SageReasoning_Capability_Inventory.html`.
7. Added equivalent banner pattern to `/website/public/SageReasoning_Architecture_Map.html` (slim bar between header and canvas; updated container height calc to accommodate).
8. Verified locally: JSON files untouched (both still parse, 163 components / 96 nodes / 39 flows preserved); HTML tag balance clean; founder visually verified both banners render correctly.

## Where We Are in P0

P0 (R&D phase) item **0g (Workflow skills — build when they earn their place)** advanced. The component-registry update pattern was observed in three manual update cycles (Apr 9, Apr 18, Apr 25) — the threshold for promotion from manual to skill. Two new skills now formalise that pattern with safety rails (backup, validate, propose-then-apply, status-vocabulary check).

Hold-point (0h) is unchanged by this session — no product capability was added or tested. The work was infrastructure for keeping the existing capability inventory honest.

PR1 (Single-endpoint proof before rollout): not yet exercised. The first invocation of sage-registry-update is the proof point.

## Next Session Should

1. **Open the session under `/adopted/session-opening-protocol.md`.** Full Part A read this time — Tier declaration (founder/tech), canonical-source sequence (manifest, decision log, knowledge-gaps), handoff read (this file plus the most recent tech handoff), hold-point status, model selection (N/A unless code work), status-vocabulary confirmation, signals/risk classification ready.
2. **Confirm the deploy is live.** Founder should have run the git push from this session (see Blocked On). Visit both URLs and confirm the banners appear on sagereasoning.com.
3. **Run the sage-registry-update skill as the proof-of-pattern invocation.** Handoff scan since `lastUpdated: 2026-04-18`. Nine days of handoffs to walk back through. 19 components currently flagged with non-empty `blocker` strings in the registry. Walk through one or two blocker-clearance edits together to verify the propose-then-apply workflow end-to-end.
4. **If anything fails in the first invocation**, treat it as the design feedback the proof exists to surface. Adjust the SKILL.md, then re-run. Do not adopt the pattern broadly until the first run is clean.

## Blocked On

- **Founder deploy of this session's changes.** The git push commands at the end of this session have not been confirmed run. Until they are, the banners exist only locally and the live pages are unchanged. Commands provided in the session response — copy-paste into terminal.

## Open Questions

- **Which of the 19 currently-blocked components have actually had their blockers resolved?** Not assessed in this session. This is the work for the first sage-registry-update skill run. Recent handoffs that may carry resolutions: ADR-PE-01 sessions (2026-04-26 chain), infra-resend read-and-report (2026-04-26), Sage Ops D1 journey close (2026-04-25).
- **Should the existing four sage-* skills (sage-stenographer, sage-wiring-fix, sage-interpret, sage-consult) be promoted from convention-only to formally registered Cowork plugins?** Logged for stewardship — F-series Long-term regression, not Catastrophic. No action this session.

## Key Files Modified This Session

| File | Change |
|------|--------|
| `/SageReasoning_Capability_Inventory.html` | Archived to `/archive/2026-04-27_root-html-stale-copies/` (was stale; deployed copy lives in `/website/public/`) |
| `/SageReasoning_Architecture_Map.html` | Archived to same folder (same reason) |
| `/website/public/SageReasoning_Capability_Inventory.html` | Added `.skill-banner` CSS rule, banner div after data-source-banner, JS to populate `#skillLastUpdated` from `registry.lastUpdated` |
| `/website/public/SageReasoning_Architecture_Map.html` | Added `.skill-banner` CSS rule, banner element between header and container, JS to populate `#skillLastUpdated`; updated container `height: calc()` from `100vh - 80px` to `100vh - 80px - 44px` |
| `/.claude/skills/sage-registry-update/SKILL.md` | New (12,504 bytes) |
| `/.claude/skills/sage-flows-update/SKILL.md` | New (10,094 bytes) |
| `/operations/registry-updates/README.md` | New (1,264 bytes) |
| `/operations/registry-updates/` | New folder |
| `/operations/flow-updates/` | New (empty) folder |
| `/archive/component-registry/` | New (empty) folder |
| `/archive/flows/` | New (empty) folder |
| `/archive/2026-04-27_root-html-stale-copies/` | New folder — contains the two archived root HTML files |

---

## Verification Method Used (0c Framework)

| Work Type | Method Used |
|-----------|-------------|
| Website pages (banners) | Founder opened both files locally and visually verified banners render correctly with expected text and dynamic `lastUpdated` value |
| HTML structural integrity | AI ran tag-balance count: Capability Inventory 32/32 `<div>` pairs, Architecture Map 35/35; both have 1/1 `<style>` and 1/1 `<script>` |
| JSON files (untouched check) | AI ran `python3 -c 'json.load(open(...))'` on both files; both parse cleanly with original counts (163 components, 96 nodes, 39 flows); modification times preserved |
| New skill files | **Not yet functionally verified.** First invocation of `sage-registry-update` in next session is the proof point per PR1 |
| Folder creations | AI listed contents to confirm structure; verified empty folders are present and writeable |

## Risk Classification Record (0d-ii)

| Change | Classification | Reasoning |
|--------|----------------|-----------|
| Archive stale root HTML copies | Standard | File move; deployed copies (`/website/public/`) untouched; live site unaffected |
| Create new SKILL.md files | Standard | Additive; no overwriting; no live system impact |
| HTML banner additions (CSS + div + JS) | Standard | Purely additive UI; no auth/session/encryption/safety classifier touched; rollback is `git checkout` |
| Folder creations | Standard | New empty folders; no data |

All changes Standard. No Elevated or Critical changes this session. Rollback for any single file: `git checkout <file>`. Rollback for the whole commit before push: `git reset HEAD~1`.

## PR5 — Knowledge-Gap Carry-Forward

- **AI knowledge gap (1st recurrence — Candidate per PR5):** AI's initial response described both HTML pages as static, needing hand-editing. The actual architecture is JSON-driven runtime fetching (both pages call `fetch('/component-registry.json')` and the architecture map also calls `fetch('/flows.json')`). Founder pushed back; AI corrected after diffing the deployed HTML content. Resolution: when asked about how a public page updates, **inspect the page's JS for fetch calls before describing the update mechanism**. Logged as Candidate. If recurrence observed in a future session, promote to Watch (PR5 stage 2). Source: this session, founder's first message asked about auto-update behaviour.
- **No founder concept re-explanation observed** this session.

## Founder Verification (Between Sessions)

**To verify the deploy succeeded after running the git push commands:**

1. Open in a browser: `https://www.sagereasoning.com/SageReasoning_Capability_Inventory.html`
   - Expected: green-tinted banner just below the existing purple "Data source" banner
   - Banner text should include: *"To update this page: in a Cowork session, say `Run the sage-registry-update skill`"* and *"scans session handoffs since 2026-04-18"*
2. Open: `https://www.sagereasoning.com/SageReasoning_Architecture_Map.html`
   - Expected: slim banner between the header bar and the canvas area
   - Banner text should include both *"Run the sage-registry-update skill"* and *"Run the sage-flows-update skill"*, plus *"Registry last updated: 2026-04-18"*
3. If the banner appears but `lastUpdated` shows `[loading]`, the JSON fetch may have failed. Open the browser's developer console (Cmd-Opt-J on Mac) and look for fetch errors. Report findings to next session.
4. If neither banner appears after Vercel completes redeploy (~1 minute after push), confirm with `git log -1 --stat` that both `website/public/SageReasoning_*.html` files were included in the push.

**Failure mode and rollback:** if any deployed page is broken (not just missing the banner), revert with `git revert HEAD` and push. The previous deployed state is the Apr 24 version.

---

## Orchestration Reminder (Element 21)

This session was governed by `/adopted/session-opening-protocol.md`. Honest audit of Part A elements at session open:

- **Element 1 (Tier declaration)** — Not declared at open. The session was tech/founder stream (HTML edits + governance design). Corrective action for next session: declare tier explicitly in the first response.
- **Element 2 (Canonical-source read sequence)** — Partial. The protocol itself was read mid-session when the founder named the governing frame ("Governing frame: /adopted/session-opening-protocol.md"). Manifest, decision log, knowledge-gaps register, hold-point status — none read at open. Read selectively as the work demanded them.
- **Element 3 (Handoff read)** — Not done at open. The most recent founder/ handoff was not read. The most recent tech/ handoff (`2026-04-26-infra-resend-read-and-report-close.md`) was noted but not read.
- **Element 4 (Knowledge-gaps scan)** — Not done.
- **Element 5 (Hold-point status confirmation)** — Not done. (No product work was attempted, so this gap did not affect the session's output, but it remains a compliance gap.)
- **Element 6 (Model selection / PR4)** — N/A; no code path through `constraints.ts` was modified.
- **Element 7 (Status-vocabulary confirmation)** — Observed throughout. No mixing of taxonomies.
- **Element 8 (Signals & risk classification ready)** — Observed throughout. "I caused this" used appropriately on the architecture-finding correction. "I'd push back on this" used on the founder's "skill should update HTMLs" proposal. All changes classified Standard.

**Net assessment:** Part A compliance was incomplete at session open. The session produced clean output despite this — partly because the founder explicitly named the governing frame mid-session, partly because the work was discovery + design rather than code-deployment that would have required full canonical-source context. **For next session, full Part A read at open is the corrective action.** Add this as the first item on the Next Session Should list, which it already is.
