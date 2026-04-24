# Governance Discrepancy Sort — 23 April 2026

**Purpose:** Surface every discrepancy across the governance corpus that needs founder resolution before the Session Opening Protocol (the "hybrid" — canonical file in `/adopted/`, distilled extract concatenated by code into the hub's `session_prompt`, pointer to full file) can be drafted against a stable corpus.

**Method:** Read every adopted governance source, compare against drafts (Option B), check three handoff paths, identify existing archive conventions in use, cross-reference for contradictions. File modification times used alongside filename dates.

**Status of this document:** Partially resolved (23 April 2026).
- **Resolved:** D6 (Option A), D7 (Option C + R1 manual rollup). See entries below for resolution markers and execution notes. Prior version preserved at `/archive/2026-04-23_discrepancy-sort_pre-resolution.md`.
- **Outstanding:** D1, D3, D4 (Material); D2, D5, D8, D10–D12, D14–D16 (Notable); D9, D13 (Minor). Carried into next session.
- **Scheduled:** D17 — protocol drafting (canonical decision already recorded; the draft itself is next session's work).

---

## Corpus reviewed

Adopted (currently governing):
- `/manifest.md` (CR-2026-Q2-v4, mtime Apr 18)
- Project instructions (in session context, configured at project level)
- `/INDEX.md` (mtime **Apr 11** — stale, see D4)
- `/PROJECT_STATE.md` (mtime Apr 20)
- `/TECHNICAL_STATE.md` (mtime Apr 11)
- `/summary-tech-guide.md` (mtime Apr 22)
- `/summary-tech-guide-addendum-context-and-memory.md` (mtime Apr 22)
- `/users-guide-to-sagereasoning.md` (mtime Apr 22)
- `/adopted/V3_Adoption_Scope.md` (mtime Mar 30)
- `/adopted/V3_Adoption_Scope_Revised_April.md` (mtime Apr 2)
- `/operations/decision-log.md` (1,090 lines, 22 dated entries, most recent Apr 22)
- `/operations/knowledge-gaps.md` (KG1–KG10)

Drafts (compared per Option B):
- `/drafts/manifest-DRAFT-2026-04-18.md`
- `/drafts/project-instructions-DRAFT-2026-04-18.md`
- `/drafts/2026-04-20_PROJECT_STATE_draft.md`

Handoff paths (all three reviewed):
- `/operations/session-handoffs/` (29 files, date-named, most recent Apr 21)
- `/operations/handoffs/` (48+ files, role/task-named, most recent Apr 22)
- `/website/operations/session-handoffs/` (5 files, all Apr 16)

Archive conventions identified:
- `/archive/` at root (per tech guide and addendum)
- `/backup/` subfolders inside 10 strategic folders (per INDEX)
- Inline `.backup-YYYY-MM-DD` files alongside originals (actual practice)

---

## How to read this list

Each entry follows this shape:
- **What is the discrepancy** — the conflict, in plain language
- **Where it appears** — files and lines
- **Why it matters** — what breaks downstream if unresolved
- **Options** — 2–3 ways to resolve, with reasoning
- **Severity** — Material (blocks protocol drafting) / Notable (should be resolved but doesn't block) / Minor (housekeeping)

Severity is the AI's assessment for prioritisation; the founder may reclassify.

---

## D1 — `/drafts/` contents are byte-identical to adopted files

**Severity:** Material

**What:** `drafts/manifest-DRAFT-2026-04-18.md` is byte-identical to `/manifest.md` (29,428 bytes; `diff -q` returns no output). `drafts/2026-04-20_PROJECT_STATE_draft.md` is byte-identical to `/PROJECT_STATE.md`. They are not drafts of proposed successors — they are copies of the current adopted state.

**Where:** `/drafts/manifest-DRAFT-2026-04-18.md`, `/drafts/2026-04-20_PROJECT_STATE_draft.md`. Compare to `/manifest.md` and `/PROJECT_STATE.md`.

**Why it matters:** The folder name says "drafts." The contents say "current adopted." Anyone — agent or founder — opening `/drafts/` to find proposed successor governance will find the same text as the adopted version, which is misleading. INDEX.md compounds this by claiming `/drafts/` is "Empty — previous drafts adopted and archived" (which is also wrong — the files exist).

**Options:**
- A — Move to `/archive/` with `2026-04-18_manifest_snapshot.md` naming. Treats them as point-in-time snapshots taken when the adopted versions were updated. Consistent with the existing archive use.
- B — Delete outright. They duplicate what's in `/manifest.md` and `/PROJECT_STATE.md`; nothing is lost. Simplest.
- C — Rename in place to `_SNAPSHOT.md` and add a header note explaining they are snapshots, not drafts. Keeps them visible in `/drafts/` but reclassifies them.
- D — If they were intended as drafts of proposed *successor* versions, replace their contents with the actual proposed changes.

**Reasoning:** A and B are both clean. A preserves discoverability if ever needed. B is the minimum viable cleanup. C adds clutter. D requires founder to know what was intended — if it was nothing, A or B is correct.

---

## D2 — `/drafts/project-instructions-DRAFT-2026-04-18.md` exists; status not documented

**Severity:** Notable

**What:** A 28,139-byte file named `project-instructions-DRAFT-2026-04-18.md` sits in `/drafts/`. Project instructions live in the session context (configured at project level), not in a file in the repo, so a direct `diff` against the adopted version is not possible. The draft exists; its relationship to current adopted instructions is undocumented.

**Where:** `/drafts/project-instructions-DRAFT-2026-04-18.md` (mtime Apr 18 04:48). The matching archive entry exists: `/archive/2026-04-18_Project-Instructions.md` (mtime Apr 18 05:03, 28,139 bytes).

**Why it matters:** Same as D1. If this is a snapshot of the current adopted instructions, treat it as such. If it is a proposed successor, surface it for adoption review.

**Options:**
- A — Treat as a snapshot per D1 Option A.
- B — Diff against the archive entry (`/archive/2026-04-18_Project-Instructions.md`). If identical, it is a duplicate snapshot — delete the drafts copy.
- C — If it is a proposed successor, raise it for review.

**Reasoning:** Option B is the cheapest test. If it matches the archive copy, it is a redundant snapshot. If it doesn't, then something changed and the relationship needs clarification.

---

## D3 — Two versions of V3 Adoption Scope co-exist in `/adopted/`

**Severity:** Material

**What:** `/adopted/` contains both `V3_Adoption_Scope.md` (Mar 30, references "all 9 rules R1–R9") and `V3_Adoption_Scope_Revised_April.md` (Apr 2, says "Supersedes: V3_Adoption_Scope.md", references "all 13 rules R1–R13"). The Revised file explicitly supersedes the original, but the original was never moved to `/archive/`. The manifest has since grown to R0–R20 — both V3 docs are now out of sync with the manifest's current rule count.

**Where:** `/adopted/V3_Adoption_Scope.md`, `/adopted/V3_Adoption_Scope_Revised_April.md`, current `/manifest.md`.

**Why it matters:** "Adopted" is meant to be the unambiguous current governance. Two versions in the same folder, one explicitly superseded by the other, makes "current" ambiguous. The protocol's pointer-to-canonical-files mechanism can't reliably point to "the V3 Adoption Scope" if there are two.

**Options:**
- A — Move `V3_Adoption_Scope.md` (original Mar 30) to `/archive/2026-04-02_V3_Adoption_Scope_original.md`. Apply the archive protocol the supersession statement implies. Cleanest.
- B — Update both V3 files' rule references from R1–R9 / R1–R13 to R0–R20 to match current manifest. Does not address the superseded-doc question.
- C — Both A and B. Move original to archive AND refresh the Revised's rule reference to R0–R20.
- D — Audit whether the Revised is still current at all. The Revised dates from Apr 2 (3 weeks old); Apr 18 brought a major manifest update (CR-2026-Q2-v4). The Revised may itself need a successor.

**Reasoning:** A is the supersession the original document already declares — it should have been done Apr 2. C is more thorough. D is a deeper question that may or may not be on the founder's plate.

---

## D4 — `INDEX.md` is materially stale (12+ days)

**Severity:** Material

**What:** INDEX claims "Last updated: 11 April 2026". File mtime confirms Apr 11. Multiple of its claims are now factually wrong:

| INDEX claim | Reality |
|---|---|
| "/drafts/ Empty — previous drafts adopted and archived" | Three files in `/drafts/` (per D1, D2). |
| `/operations/session-handoffs/` contains "2026-04-06 session close (first handoff note)" | 29 files, most recent Apr 21. |
| Decision log has "11 decisions, 21 March – 6 April 2026" | 22 dated entries, most recent Apr 22. |
| `/website/` Status: "Scaffolded" | Hub orchestration is **wired and live at supervised level** per the addendum (1,504-line `route.ts`, called by two UI pages). |
| INDEX status field for itself: "Current" | Stale by 12 days. |
| `/operations/` "Key Contents" lists Sage Cofounder Blueprint, Support Agent Manual, etc. — does not mention `/operations/handoffs/` (the role/task-named handoff path) | Path exists with 48+ files, most recent Apr 22. |

INDEX also does not mention either summary-tech-guide.md or its addendum (both adopted Apr 22, three weeks after INDEX was last updated).

**Where:** `/INDEX.md`. Many entries.

**Why it matters:** INDEX is meant to be the navigation layer ("read at session open to navigate"). A stale navigation layer sends agents and the founder to the wrong files or to non-existent files. A protocol that depends on "read INDEX.md to find canonical sources" is unreliable until INDEX is current.

**Options:**
- A — Refresh INDEX.md as part of the discrepancy-sort follow-up. Required reading for the protocol to work.
- B — Adopt a smaller, more stable INDEX limited to "where do governance docs live" only, leaving project-state details to PROJECT_STATE.md and TECHNICAL_STATE.md. Reduces refresh burden.
- C — Replace INDEX with an auto-generated listing (script that scans the file tree and produces a current map). Higher up-front effort, lower ongoing maintenance.

**Reasoning:** A is the minimum action; B is structurally cleaner; C is the long-term answer if INDEX staleness is a recurring problem (and the file mtime suggests it is).

---

## D5 — `TECHNICAL_STATE.md` is materially stale

**Severity:** Notable

**What:** `TECHNICAL_STATE.md` mtime Apr 11. 35,197 bytes — substantial document. Has not been touched since the same day INDEX was last updated. Major technical changes since Apr 11 include the hub orchestration becoming live (per addendum revision Apr 22) and brain loader file-path bug fix (per addendum Section D.6, Apr 21).

**Where:** `/TECHNICAL_STATE.md`.

**Why it matters:** Same risk as D4 — a stale technical-state document misleads anyone reading it as current.

**Options:**
- A — Refresh, treating it as a sibling of the tech guide / addendum.
- B — Retire and let the tech guide + addendum carry the technical-state burden. The two summary docs are fresh; TECHNICAL_STATE.md duplicates their purpose at lower fidelity.
- C — Refresh and define a refresh trigger (e.g., updated when each session handoff identifies a status change).

**Reasoning:** B reduces the maintenance surface — one fewer doc to keep current. A preserves it. C ties the refresh to an existing rhythm so it doesn't drift again.

---

## D6 — Three archive conventions in active competing use

**✅ RESOLVED 2026-04-23 — Option A.** `/archive/` at root is canonical.

**Execution (this session):**
- Three inline `.backup-*` files on `decision-log.md` → migrated to `/archive/2026-04-22_inline-backups/` (renamed to drop the `.backup-` suffix)
- Two inline `.backup-2026-04-21*` files on architecture map / component-registry / ops-continuity-state → migrated to `/archive/2026-04-21_inline-backups/`
- Three inline `.backup-2026-04-22*` files (component-registry, ops-continuity-state, component-registry-d3) → migrated to `/archive/2026-04-22_inline-backups/`
- Three files in `/drafts/backup/` (R20a protection drafts v1, v2, ADR classifier pipeline) → migrated to `/archive/2026-04-15_R20a-drafts-backup/`
- INDEX.md "Backup Protocol" section rewritten to "Archive Protocol" naming `/archive/` as single canonical location; references to `/backup/` subfolders and inline `.backup-*` marked retired
- Empty `/backup/` subfolders across 10 strategic folders left in place as harmless placeholders (sandbox cannot remove empty directories cleanly; cleanup is cosmetic, not structural)

**Forward rule:** Before any governing or strategic file is updated, previous version is copied to `/archive/` with a date-prefixed descriptive name. No inline `.backup-*` siblings. No per-folder `/backup/` subfolders.

**Severity:** Material (touches Clinton's stated requirement to use the existing archive protocol)

**What:** Three different archive conventions are documented and/or in use:

| Convention | Documented in | Actually used? |
|---|---|---|
| `/archive/` at root | Tech guide ("old version moved to /archive/ per the folder convention"), addendum (same wording), V3_Adoption_Scope_Revised_April.md (supersession header) | Yes — manifest Apr 18 prior version, project-instructions Apr 18 prior, ethical analysis, draft amendments, etc. |
| `/backup/` subfolders inside strategic folders | INDEX.md line 16 ("Every strategic folder ... contains a /backup/ subfolder. When a governing or strategic file is updated, the previous version is copied to backup/ with a date prefix") | Folders exist for 10 categories (adopted, business, compliance, drafts, engineering, legal, marketing, operations, product, reference). `/operations/backup/` is empty. Other folders' usage not yet sampled. |
| Inline `.backup-YYYY-MM-DD` files | Not documented | Yes — `decision-log.md` has three: `.backup-2026-04-22`, `.backup-2026-04-22-d3`, `.backup-2026-04-22-d3-pre-dd3-1`. Archive map HTML has `.backup-2026-04-21`. |

**Where:** Tech guide §5 (preface), addendum §I (closing instruction), INDEX.md line 16, `/archive/`, `/operations/backup/`, `/operations/decision-log.md.backup-*`, `/SageReasoning_Architecture_Map.html.backup-2026-04-21`.

**Why it matters:** Three protocols cannot all be canonical. The protocol Clinton wants applied to this discrepancy-sort process — and to the handoff categorisation in D7 — needs to point to ONE convention. Until one is canonical, "use the archive protocol" is ambiguous.

**Options:**
- A — `/archive/` at root is canonical. Most-used in practice for governance docs. Simplest mental model. INDEX's `/backup/` subfolder reference is removed; existing inline `.backup-*` files are migrated into `/archive/` with descriptive names.
- B — `/backup/` subfolders inside strategic folders is canonical (per INDEX). Locality — backups stay close to the live file. Requires `/archive/` contents to be moved to the relevant folder's `/backup/`. Higher migration cost.
- C — Inline `.backup-YYYY-MM-DD` files are canonical (current habit for decision log). Maximum locality. But pollutes the live folder and breaks the "browse to find prior versions" pattern.
- D — Hybrid: `/archive/` for promoted versions and superseded major docs; `/backup/` subfolders for in-flight working backups; inline `.backup-*` discouraged. Two locations, clearly purposed.

**Reasoning:** A is the simplest and matches the wording in two of the three governance docs. D matches actual mixed usage but requires written rules to keep separation clean. The choice affects D7 (handoff archive policy) and the protocol's final form.

---

## D7 — Three handoff paths in active or partial use; naming conventions divergent; categorisation undesigned

**✅ RESOLVED 2026-04-23 — Option C (path) + R1 (rollup mechanism).**

Single canonical path: **`/operations/handoffs/`** with six role subfolders + `_rollup/`.

**Execution (this session):**
- Created subfolders: `founder/`, `ops/`, `tech/`, `growth/`, `support/`, `mentor/`, `_rollup/`
- Migrated existing `/operations/handoffs/` files by filename prefix:
  - `growth-wiring-fix-*` → `growth/` (3 files)
  - `ops-wiring-fix-*`, `sage-ops-*` → `ops/` (10 files)
  - `support-wiring-*` → `support/` (5 files)
  - `tech-wiring-fix-*`, `tech-stub-fix-*`, `context-*`, `session-7*` → `tech/` (16 files)
  - `session-8-reflections-v3-and-mentor-bridge`, `session-9-*` through `session-14-*` → `founder/` (12 files)
- Migrated all 42 date-named files from `/operations/session-handoffs/` → `/operations/handoffs/founder/`. Founder subfolder now contains 55 files total.
- Left `/operations/session-handoffs/` folder in place with `MIGRATED.md` stub (sandbox-permission constraint on directory removal; stub preserves breadcrumb for anyone following stale references)
- Archived abandoned `/website/operations/session-handoffs/` → `/archive/2026-04-16_website-session-handoffs/` (5 files)
- `mentor/` created as empty stream ready for use (no existing mentor-stream handoffs)

**Rollup mechanism R1 — manual, how it works:**
1. Founder signals: *"rollup [milestone-name]"* (example: *"rollup stream/ops for Sage Ops Governance Loop"*)
2. AI consolidates relevant stream entries into a single file in `/_rollup/` with date + milestone name (example: `2026-04-23_sage-ops-governance-loop.md`)
3. Stream files remain in place — history preserved; rollup is a synthesis, not a replacement
4. Founder reviews and approves rollup before commit

**Forward rule:** Every handoff lives in exactly one stream. `*-prompt.md` / `*-handoff.md` / `*-close.md` file-name convention kept. Rollup happens on founder signal; no automatic rollup.

**Severity:** Material (Clinton flagged this for design)

**What:** Three handoff folders exist:

| Path | Files | Naming convention | Most recent | Status |
|---|---|---|---|---|
| `/operations/session-handoffs/` | 29 | Date-prefixed (e.g., `2026-04-14-session-context-loader.md`) | Apr 21 | Active |
| `/operations/handoffs/` | 48+ | Role/task-named (e.g., `growth-wiring-fix-close.md`, `sage-ops-d3-registry-hygiene-close.md`, `tech-wiring-fix-handoff.md`) | Apr 22 | Active |
| `/website/operations/session-handoffs/` | 5 | Date-prefixed | Apr 16 | Abandoned |

Conventions in active use within `/operations/handoffs/` include three file types per role/task: `*-prompt.md` (session-opening), `*-handoff.md` (mid-state), `*-close.md` (session-closing). Roles already represented: tech, growth, support, ops, sage-ops, mentor (implicit), context (cross-cutting).

The 0b protocol in project instructions defines a single handoff format (Decisions Made / Status Changes / Next Session Should / Blocked On / Open Questions). Actual handoff practice has evolved richer structure (the most recent close note has 9 sections including Verification Method, Risk Classification, PR5 Knowledge-Gap Carry-Forward, Founder Verification). The documented protocol lags reality.

**Why it matters:** Clinton explicitly asked for design here — role-specific handoff streams (founder/ops/tech/support/growth/mentor) that can run independently and roll up to an overall handoff at milestone or founder-closure. The current state already has emergent role/task structure in `/operations/handoffs/` but no formal categorisation.

**Options for path consolidation:**
- A — Single canonical path (`/operations/handoffs/`), absorb the date-named entries from `/operations/session-handoffs/`, archive `/website/operations/session-handoffs/`. Most recent file lives in the canonical path; one place to look.
- B — Two paths with explicit purposes: `/operations/session-handoffs/` for top-level founder-session closes (whole-session context); `/operations/handoffs/` for role/task-streams. Each has a clear purpose. Explicit rules for which goes where.
- C — Single path with a sub-folder per role: `/operations/handoffs/founder/`, `/handoffs/ops/`, `/handoffs/tech/`, etc. Cleanest categorisation. Requires migrating existing files into the right sub-folders.

**Options for categorisation design (per Clinton's brief):**

Proposed structure regardless of path choice — six handoff streams plus a rollup:
- `founder/` — founder-led sessions, top-level decisions, scope changes
- `ops/` — operational state, costs, infrastructure, deployment
- `tech/` — code changes, architecture, build state
- `growth/` — content, positioning, market signals
- `support/` — user-facing safety, crisis resources, support inbox
- `mentor/` — mentor-system changes, mentor profile, mentor KB
- `_rollup/` — milestone summaries appended from individual streams when a milestone is reached or the founder closes a body of work

Each stream uses three file types: `*-prompt.md` / `*-handoff.md` / `*-close.md` — already the emergent convention.

**Rollup mechanism options:**
- R1 — Manual: founder signals "rollup [milestone-name]", AI consolidates the relevant stream entries into a single rollup file in `_rollup/` with date and milestone name. Stream files remain in place (history preserved). Founder approves rollup before commit.
- R2 — Automated by completion-criterion: each handoff close file ends with a "milestone progress" line; when a milestone is named complete, AI scripts generate the rollup. Higher build cost; lower founder burden.
- R3 — Hybrid: manual signal triggers the rollup; the AI uses heuristics to suggest which stream entries belong to which milestone. Founder reviews, approves, AI commits.

**Archive policy for handoffs:**
- Apply whichever archive convention is chosen in D6.
- Suggested rule: rolled-up stream files move to `/archive/handoffs/[stream]/[milestone-name]-rollup-2026-MM-DD/` once the rollup is adopted, leaving only the rollup file in the live stream folder. Or: stream files stay in place permanently (history is the record); only superseded stream files (e.g., a corrected close note) are archived.

**Reasoning:** B (path) + C (categorisation) is the most explicit. A (path) is the simplest mental model but loses the existing role/task convention's value. R1 (manual rollup) is the simplest to implement first; R3 is the better long-term answer but involves AI work that should earn its place per project instruction PR8 / sage-stenographer-style discipline.

---

## D8 — 0b session handoff format is documented as 5 sections; actual practice uses 9+

**Severity:** Notable

**What:** Project instructions 0b defines the handoff format as: Decisions Made, Status Changes, Next Session Should, Blocked On, Open Questions. The most recent handoff (`sage-ops-d3-registry-hygiene-close.md`, 22 Apr) uses: Decisions Made, Status Changes, What Was Done, Verification Method Used (0c Framework), Risk Classification Record (0d-ii), PR5 — Knowledge-Gap Carry-Forward, Founder Verification (Between Sessions), Blocked On, Open Questions. Other handoffs use varying subsets.

**Why it matters:** The protocol's "session opening" step instructs the agent to "read the handoff first." If the format isn't standardised, the agent's read-time and parsing behaviour vary. Standardising would also help the protocol's "what to write at session close" obligation — there's a single format to comply with.

**Options:**
- A — Update 0b to match current practice (the 9-section format). The richer structure has earned its place; promote it.
- B — Leave 0b as the minimum, allow the richer format as expansion at the AI's judgment per session. Maintains flexibility.
- C — Define the 0b minimum (5 sections, all required) plus a defined extension set (Verification Method, Risk Classification, Knowledge-Gap, Founder Verification — added when the session involved code, deployment, or safety changes).

**Reasoning:** C separates "what every handoff has" from "what some handoffs additionally have." Reduces cognitive load on simple sessions; preserves the richer structure for sessions that need it.

---

## D9 — Knowledge-gaps register populated beyond 3-recurrence threshold

**Severity:** Minor

**What:** PR5 says concepts earn a permanent KG entry on the third recurrence. The register currently has 10 entries (KG1–KG10) seeded from a Build Knowledge Extraction on 17 Apr 2026, not all of which earned promotion via the 3-recurrence threshold (some are pre-populated documentation). KG entries also include "candidate patterns" (first observation), which the file's protocol does not strictly authorise.

**Where:** `/operations/knowledge-gaps.md`.

**Why it matters:** Minor on its own. Worth flagging because the discipline that PR5 describes (threshold-triggered) and the actual register (richer, includes candidates) are different. The protocol may need to allow pre-population and candidate tracking.

**Options:**
- A — Update PR5 wording to reflect the broader use: pre-population from extraction passes is allowed; candidates are tracked at first observation; promotion occurs at three.
- B — Split the file: KG entries (promoted) and "candidates" (under-three). Cleaner separation.
- C — No action. Document is rich and useful; the protocol divergence is theoretical.

**Reasoning:** A or B both match reality. C is the lowest-effort.

---

## D10 — Decision log not referenced consistently across docs

**Severity:** Notable

**What:**
- INDEX claims decision log has "11 decisions, 21 March – 6 April 2026". Actual: 22 dated entries, most recent Apr 22.
- The addendum references the decision log as the place "where the reasoning trail for every major decision to date" lives, but flags the Ask-the-Org feature as a missing entry (gap acknowledged).
- The hub route's `getRecommendedAction` system prompt instructs the model to reference "specific files, endpoints, or decisions when relevant" — but the decision log is not named as a canonical source the new session should consult.

**Where:** `/INDEX.md`, `/summary-tech-guide-addendum-context-and-memory.md`, `/website/src/app/api/founder/hub/route.ts` lines 670–693.

**Why it matters:** The decision log is meant to be the canonical decision audit trail (and the R0 oikeiosis audit trail when P5 operationalises it). Inconsistent referencing reduces its discoverability.

**Options:**
- A — Update INDEX (covered by D4). Add explicit decision-log reference to the hub's session_prompt template.
- B — Define a "canonical sources" list once, in the protocol, and have all docs (and the hub) point to it.
- C — No action; note the gap and revisit after protocol drafting.

**Reasoning:** B is structurally cleanest — single source of truth for what the canonical sources are. A is the minimum.

---

## D11 — Tech guide [DIVERGENCE] items unresolved

**Severity:** Notable (technical accuracy)

**What:** Tech guide flags six [DIVERGENCE] items in §1.2 and §1.3:
- `rate-limits.ts`, `cors.ts`, `response.ts`, `validation.ts` named in earlier briefs but not present as files (logic is embedded in `security.ts`, `response-envelope.ts`, `constraint.ts`, `guardrails.ts`)
- `stoic-brain-quick.ts` / `-standard.ts` / `-deep.ts` named in earlier briefs but not present (single `stoic-brain.ts` with depth as runtime parameter)
- `vercel.json` named but not present

Tech guide §1.2 states: *"Action for founder: decide whether to reconcile the divergence by (a) renaming/refactoring to match the named structure, or (b) amending project documentation to match the actual structure. Both are valid; mixed state is not."*

**Why it matters:** Documentation-vs-reality drift. Doesn't block the protocol but is exactly the kind of item the protocol should surface for founder decision when it appears.

**Options:**
- A — Defer; not protocol-blocking. Track in decision log as outstanding decision.
- B — Resolve now via Option (b) from tech guide — amend documentation to match reality. Lowest cost.
- C — Resolve now via Option (a) — rename files to match earlier briefs. Higher cost; preserves whatever value the original naming had.

**Reasoning:** B is the lowest-effort answer that closes the [DIVERGENCE] tag.

---

## D12 — `[TBD]` items in tech guide and addendum left open

**Severity:** Notable (governance hygiene)

**What:** Tech guide and addendum collectively contain ~15 [TBD] markers. Examples: R17c deletion endpoint state, R19 limitations page status, R20 implementation completeness, latest handoff date, decision log count, MENTOR_CONTEXT_V2 production setting.

**Why it matters:** [TBD] is by design a temporary marker meaning "unconfirmed." A protocol whose canonical references contain unresolved [TBD]s is referencing uncertainty.

**Options:**
- A — Resolve all [TBD]s as part of the protocol drafting follow-up. One pass through both docs, mark each as confirmed or escalate.
- B — Leave [TBD]s in place; the protocol's session-opening obligation should include "scan canonical references for [TBD] items relevant to today's scope and resolve before proceeding".
- C — Move all [TBD]s into a single "open questions" register in `/operations/`, keep the guides clean.

**Reasoning:** A clears the tags; B normalises living with them; C centralises them. A is best for a clean protocol baseline.

---

## D13 — `route.ts` line count discrepancy (1,504 vs 1,505)

**Severity:** Minor

**What:** Addendum and pasted session prompt state `/website/src/app/api/founder/hub/route.ts` is 1,505 lines. Actual: 1,504 lines (`wc -l`).

**Where:** Addendum §B and §D.6, Section 19 of the architecture map (referenced), session prompt v2.

**Why it matters:** Trivial number, but it is exactly the kind of derived fact a protocol that "points to canonical references" must be careful with — derived facts drift fastest.

**Options:**
- A — Replace specific line counts in governance docs with descriptors ("~1,500 lines, single-file orchestration endpoint"). Removes the drift surface.
- B — Update the references to 1,504 and accept the drift cost.
- C — Reference a script that prints the count on demand.

**Reasoning:** A removes the maintenance burden. B is a one-time fix that will drift again.

---

## D14 — Status vocabulary applied inconsistently

**Severity:** Notable

**What:** Project instructions 0a defines six statuses (Scoped → Designed → Scaffolded → Wired → Verified → Live). Actual usage:
- INDEX.md uses: Current, Scaffolded, Verified, Active, Archived (only 2 of 6 official statuses; 3 unofficial values)
- Tech guide uses: [TBD], [DIVERGENCE] — also unofficial
- Decision log uses: Adopted, Under review, Superseded by [ref] — different vocabulary entirely (these are decision statuses, not implementation statuses, but the distinction is undocumented)

**Why it matters:** "Status" means different things in different docs. The protocol's vocabulary section should clarify that 0a is implementation status (Scoped → Live) and decision status is separate (Adopted / Under review / Superseded).

**Options:**
- A — Document the two status taxonomies explicitly: implementation (0a) and decision (in 0f). Remove unofficial values from INDEX and replace with the right vocabulary.
- B — Allow per-document vocabulary as long as the document defines its own. More flexible; less consistent.
- C — Single status taxonomy across everything. Likely too rigid given decision-vs-implementation are genuinely different things.

**Reasoning:** A separates the two concerns and cleans up INDEX.

---

## D15 — Tech guide 10-step "Steps From Here" sequence vs project instructions P1–P7 sequence

**Severity:** Notable

**What:** Tech guide §5 lists 10 steps as "prioritised" next actions (verification pass, support readiness, positioning, llms.txt/agent-card.json publishing, evaluate self-doc, blog posts, privacy policy, R20 implementation, analytics baseline, cost monitoring). Project instructions list P0–P7 priorities (with 0h hold point, then P1 business plan review, P2 ethical safeguards, etc.). The two sequences address overlapping concerns at different abstraction levels but use different numbering and groupings.

For example:
- Tech guide step 1 (verification pass) maps to P0 0h hold point (testing on real data).
- Tech guide step 8 (R20 implementation) maps to P2 (ethical safeguards).
- Tech guide step 7 (privacy policy) is loosely associated with P3 in project instructions.
- Tech guide step 4 (publish llms.txt) is in P6 launch criteria in project instructions.

**Why it matters:** Two roadmaps. An agent or the founder reading both gets two different answers to "what's next." A protocol that asks the agent to consult both will surface this conflict at session-open.

**Options:**
- A — Make project instructions canonical for sequence; deprecate tech guide §5 or rewrite it as "current focus per the P0–P7 sequence."
- B — Keep tech guide §5 as a tactical 10-step working list inside P0–P2; explicitly map each step to the priority it serves. Frame as "concrete next actions" rather than "priorities."
- C — Reconcile both into a single sequence document.

**Reasoning:** B preserves both views — strategic (P0–P7) and tactical (10 steps) — by explicitly mapping one to the other. A is the simplest. C is the most thorough.

---

## D16 — Addendum claims R20a not invoked on the hub; confirmed by code; not yet logged as a decision-to-defer

**Severity:** Notable

**What:** Addendum (§D.6 and §I) flags the hub's R20a gap and notes it's deferred to P2. PR7 (project instructions) says deferred decisions are recorded in the decision log with reasoning, alternatives, and revisit conditions. No such entry appears in the decision log for "R20a on the hub deferred to P2."

**Where:** Addendum §D.6, §I; `/operations/decision-log.md` (no matching entry).

**Why it matters:** PR7 compliance gap. A consequential decision (defer a safety-critical wiring step) is documented in the addendum but not in the decision log. The protocol's "consult the decision log for relevant prior decisions" instruction would miss this.

**Options:**
- A — Backfill the decision log with the R20a deferral entry, citing the addendum and the session 12 handoff.
- B — Same as A, plus retroactive backfill of any other deferrals known to be missing (Ask-the-Org feature flagged in addendum §I as another).
- C — Define the decision log as the source of truth for deferrals going forward; existing gaps documented in /operations/known-gaps-pre-2026-04-23.md, fixed when convenient.

**Reasoning:** B closes both known PR7 gaps at once. A closes the most urgent.

---

## D17 — Hub route's session_prompt is a task brief, not a protocol (carry-over from prior session)

**Severity:** Material (this is the discrepancy that originated the entire exercise)

**What:** Confirmed in prior session — the hub's `getRecommendedAction` produces a 3–8 sentence task brief, missing all 21 protocol elements (governance reads, hold-point reminder, status vocabulary, signals, closing obligations, scope caps, existence-of-orchestration reminder).

**Why it matters:** This is the discrepancy the Session Opening Protocol exists to close. Listed here for completeness in the discrepancy register; resolution is the next session's protocol-drafting work.

**Options:** Already decided — hybrid approach (canonical file in `/adopted/`, distilled extract concatenated by code, pointer to full file).

**Resolution path:** Out of scope for this discrepancy-sort; this is what the next session builds, against the corpus reconciled by the resolutions to D1–D16.

---

## Summary

| ID | Discrepancy | Severity | Status (2026-04-23) |
|---|---|---|---|
| D1 | `/drafts/` byte-identical to adopted | Material | Outstanding |
| D2 | `project-instructions-DRAFT-2026-04-18.md` status undocumented | Notable | Outstanding |
| D3 | Two V3 Adoption Scope versions in `/adopted/` | Material | Outstanding |
| D4 | `INDEX.md` materially stale | Material | **Partially resolved** (archive + handoff sections refreshed; broader stale claims still outstanding) |
| D5 | `TECHNICAL_STATE.md` materially stale | Notable | Outstanding |
| D6 | Three archive conventions in active competing use | Material | **✅ Resolved — Option A** |
| D7 | Three handoff paths; no formal categorisation | Material | **✅ Resolved — Option C + R1** |
| D8 | 0b handoff format vs actual 9+ sections | Notable | Outstanding |
| D9 | Knowledge-gaps register beyond 3-recurrence threshold | Minor | Outstanding |
| D10 | Decision log referenced inconsistently | Notable | Outstanding |
| D11 | Tech guide [DIVERGENCE] items unresolved | Notable | Outstanding |
| D12 | Multiple [TBD] items unresolved across guides | Notable | Outstanding |
| D13 | `route.ts` line count drift (1,504 vs 1,505) | Minor | Outstanding |
| D14 | Status vocabulary applied inconsistently | Notable | Outstanding |
| D15 | Tech guide 10-step vs P1–P7 sequence | Notable | Outstanding |
| D16 | R20a hub deferral not in decision log (PR7 gap) | Notable | Outstanding |
| D17 | Hub `session_prompt` is task brief, not protocol | Material | **Scheduled** (canonical approach decided; next-session build) |

Material items (D1, D3, D4, D6, D7, D17) should be resolved before the protocol is drafted, because they affect what "canonical" means for the protocol's pointer-and-reference mechanism.

Notable items can be resolved in parallel or queued.

Minor items can be batched into a single housekeeping pass.

---

## What this document does not propose

- Any change to safety-critical functions (PR6).
- Any deployment.
- Any modification to `/adopted/` files.
- The Session Opening Protocol itself — that is the next session's work, against whatever corpus the founder's resolution decisions produce.

---

## Next-session input

Once the founder marks resolutions on D1–D16 (or defers per PR7 with reasoning), the next session can:
1. Apply the resolutions (file moves, doc refreshes, archive applications) per chosen options.
2. Produce a clean canonical-source list against which the protocol is drafted.
3. Draft the Session Opening Protocol per the hybrid approach already decided.

---

*End of discrepancy sort.*
