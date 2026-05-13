# Next-Session Prompt — Anthropic-Native Posture: CLAUDE.md + Skills Install + PR15 Amendment + Features Survey Refresh + agent-card.json Currency Check

**Stream:** founder.
**Tier:** `governance` (primary) + light `code-standard` for the skills-install scaffolding. **Standard** risk under 0d-ii. Lean + Elevated additions per cache (project-instructions amendment is Elevated for the PR15 amendment specifically).
**Governing frame:** `/adopted/standing-protocol-cache.md` (full governance via the cache). Deliverable-of-the-day = a coordinated set of changes adopting Anthropic's canonical Skills + CLAUDE.md pattern alongside our existing multi-stream governance.
**Predecessor session close (most recent):** `/operations/handoffs/founder/2026-05-14-A9-J6-cost-monitoring-close.md` (A9 + J6 Verified; substrate cost monitoring re-pointed; R5's two manifest-named alert rules wired).
**Predecessor decision-log entries (most recent first):** `D-A9-J6-COST-MONITORING-WIRED-2026-05-14`; `D-A7-R20A-GATE-SCAFFOLDED-VERIFIED-2026-05-13`; `D-AGENTIC-COMMERCE-UPSTREAM-REWORK-2026-05-13`.
**Risk classification:** **Standard** for most changes under 0d-ii; **Elevated** for the PR15 project-instructions amendment (per 0d-ii: changes to project-instructions surface). Critical Change Protocol **NOT engaged** (no auth, no encryption, no R20a perimeter, no env-flag activation). AC7 **NOT engaged**. PR6 **NOT engaged**.

## Why this session matters

The Cowork session 2026-05-13 surfaced two related gaps from the founder's PR11-style research:

1. **The 17 Anthropic official Skills** (`anthropics/skills` — March 7 2026 release covering creative, design, documents, technical, enterprise categories) are not installed in this repo. Six are bundled into Cowork mode automatically (docx/pdf/pptx/xlsx + setup-cowork + consolidate-memory); the other 11 are not. For Claude Code sessions on this repo, none are available. PR15 (bias toward existing Anthropic infrastructure) lists category labels but doesn't mandate consulting specific Anthropic repos. The 2026-05-10 features survey identified this but stayed in `/drafts/` without being operationalised.

2. **A2A** is real, in the repo as `agent-card.json` served LIVE at `sagereasoning.com/.well-known/agent-card.json` (per README line 411 — completed 28 March 2026), but: (a) it's Google's protocol not Anthropic's, the labelling is correct in current docs but the J1 ADR 2026-05-13 amendment focused on payment-stack protocols (ACP/UCP/AP2/MPP/AgentCore) and didn't name A2A as the underlying coordination protocol; (b) the agent-card.json has not been checked for currency against the A2A v1 spec finalised after the card was published in March 2026.

This session adopts Anthropic's canonical Skills + CLAUDE.md pattern (per Anthropic's published guidance — `code.claude.com/docs/en/skills`; `github.com/anthropics/skills` README) alongside our existing multi-stream governance cache pattern (which has advantages our current setup needs to preserve), refreshes the features survey to current state, and operationalises PR15 to mandate cookbook/skills consultation before bespoke builds. The founder's call after the 2026-05-13 research was: **adopt Anthropic's guide where it has clear advantages; preserve our cache pattern where it has clear advantages; converge**.

This session lands BEFORE A6 / A10 / A11a / A8 (the four electable next-substrate-build sessions per the A9+J6 close) so subsequent build-arc sessions can reference the installed skills + amended PR15 from session-open.

## Pre-conditions

1. **A9+J6 commit pushed and Vercel green.** Founder confirms `git log --oneline -3 origin/main` shows the A9+J6 commit on top, preceded by 2026-05-13 A7, preceded by A5. Vercel redeploy completed without errors.
2. **A9+J6 verification clean between sessions.** Six checks from the A9+J6 close ran clean: tsc clean; A5 28/28 PASS; A7 33/33 PASS; invocation greps confirmed; substrate steady-state probes passed.
3. **A1–A7+A9+J6 still Verified.** No regression since A7 / A9+J6 sessions.
4. **Founder commits to a 2-3 hour bounded session** — Standard-tier governance + research; Elevated for PR15 amendment.
5. **Production state unchanged.** `SUBSTRATE_LAYER3_ENABLED` UNSET; `SUBSTRATE_R20A_GATE_ENABLED` UNSET; `/api/reason` byte-identical; `/api/substrate/layer3` returns 503; `/api/billing/usage-summary` returns the A9+J6 extended schema.
6. **Founder has Claude Code installed** (this session's Step 1 uses `/plugin marketplace add anthropics/skills` for the install). If only Cowork is available, the install falls back to a manual git clone of `anthropics/skills` into `.claude/skills/` — both paths are documented at Step 1.

## Part A — Open under the protocol

Read in order:

1. **`/adopted/standing-protocol-cache.md`** (~3 min) — confirms tier; model selection (N/A — no LLM calls this session); status vocabulary; signals; risk classification; lean+Elevated template additions.
2. **`/operations/handoffs/founder/2026-05-14-A9-J6-cost-monitoring-close.md`** (~5 min) — predecessor close; confirms production state + A9+J6 Verified + the four Next Session Should elections (this session is the founder's PRE-elected addition before those four).
3. **`/operations/r5-cost-shape-impact-assessment-2026-05-14.md`** (~3 min) — J6 output; relevant context for any session referencing R5 mechanics.
4. **`/adopted/project-instructions-snapshot.md`** §PR15 — read in full (~5 min). The rule this session amends. Note current state: PR15 lists category labels (Claude Code commands, Sub-agents, Skills, Managed agents, MCP servers, SDK patterns, Plugin spec, Dreams, Outcomes, Multi-agent orchestration) but does NOT mandate consulting specific Anthropic repos OR the `/operations/agentic-commerce-findings-downstream-order.md` tracker.
5. **`/drafts/anthropic-features-survey-2026-05-10.md`** — read in full (~10 min). The starting-point inventory. Note the CORRECTION NOTICE at the top (Dreams/Outcomes/Multi-agent omission). Note §9 explicitly recommends CLAUDE.md adoption.
6. **`/operations/agentic-commerce-findings-downstream-order.md`** — read in full (~3 min). The forward-looking findings tracker (F1-F4) that PR15 will be amended to reference.
7. **`/website/public/.well-known/agent-card.json`** — read in full (~5 min). The LIVE A2A discovery surface. Note its declared capabilities + version + last-updated date.
8. **`/README.md`** §A2A entries (lines 114, 240, 276, 411) — confirm how the agent-card is presented to readers.
9. **`/manifest.md`** §R18a (J1 Character Kernel category language) + §R20a (perimeter potential-broadening note) (~5 min) — confirms positioning context for the agent-card currency check.
10. **`/adopted/adr/2026-05-12-substrate-category-character-kernel.md`** §"Agentic-commerce-stack adjacency" sub-section (~5 min) — the J1 ADR amendment from 2026-05-13 that named peer payment protocols but not A2A. Confirm whether this session should also add an A2A-as-foundational-coordination-protocol note (optional Step 6b).
11. **`/operations/decision-log.md`** — last 3 entries (~5 min) for most recent governance context.
12. **`https://github.com/anthropics/skills`** README + **`https://code.claude.com/docs/en/skills`** (~5 min) — the canonical Anthropic installation guidance. Confirm the two plugins (`document-skills` / `example-skills`) and the two install paths (`~/.claude/skills/` user-global vs `.claude/skills/` project-local).

**Confirm at session open** (state explicitly, briefly):

- Tier: governance (primary) + light code-standard (skills install); session-as-a-whole Standard, with the PR15 amendment specifically Elevated per 0d-ii
- Hold-point status: P0 0h active
- Model selection: N/A — no new LLM calls; no model selection decisions this session
- Status vocabulary: implementation `Scoped → ... → Live`; decision `Adopted / Under review / Superseded`
- Signals + risk classification: Standard for most changes; Elevated for PR15 amendment; CCP not engaged; AC7 + PR6 not engaged
- PR10 PEV loop applies in lean form (Plan + Execute + Verify with diagnostic-certainty signalling)
- PR11 (authoritative-current-sources) — at session-open, re-scan `/inbox/` for any new material dated since 2026-05-14
- PR12 (negative-finding discipline) — when checking what's currently installed at `.claude/skills/`, don't conclude "doesn't exist" from a single check; verify the path itself + the global path `~/.claude/skills/`
- PR16 (positioning + dogfood lens) — applied per item: each change strengthens Character Kernel positioning by adopting standard Anthropic primitives where they don't conflict with our governance discipline

## Part B — Procedure

### Step 1 — Skills install election + scaffolding (~20-30 min)

**Surface to founder at session-open:** which skills to install? Default recommendation = all 17 (Anthropic-canonical; progressive disclosure means no context cost; trivial storage cost). Alternatives:

- **Option 1 — All 17 (Recommended):** install both `document-skills` (docx/pdf/pptx/xlsx) and `example-skills` (the other 13 Apache-2.0). Most comprehensive; matches the Cowork bundle in part.
- **Option 2 — Document-skills only (4):** redundant with Cowork's bundled set but explicit in the project repo for Claude Code sessions. Lighter footprint.
- **Option 3 — Example-skills only (13 Apache-2.0):** complements the Cowork bundle (which already covers documents). Lighter footprint.
- **Option 4 — Selective:** founder names specific skills (e.g. `claude-api`, `mcp-builder`, `skill-creator` for technical work; `frontend-design` for marketplace listings).

**Execution:**

Two install paths depending on founder's tooling:

**Path (i) — Claude Code (preferred per Anthropic canonical):**
```
/plugin marketplace add anthropics/skills
/plugin install document-skills@anthropic-agent-skills
/plugin install example-skills@anthropic-agent-skills
```
Installation goes to `.claude/skills/` at repo root (project-local) when run inside the repo, OR `~/.claude/skills/` (user-global) outside. **For this session, project-local install is recommended** so the skills are version-controlled with the project and visible to any collaborator (today: just the founder + AI; future-proofs against multi-collaborator state).

**Path (ii) — Manual git clone (Cowork or fallback):**
```
cd "/Users/clintonaitkenhead/Claude-work/PROJECTS/sagereasoning"
mkdir -p .claude/skills
cd .claude/skills
git clone --depth=1 https://github.com/anthropics/skills.git anthropic-skills-temp
# Copy only the chosen skill folders out, then remove the temp clone
cp -r anthropic-skills-temp/skills/* .
rm -rf anthropic-skills-temp
ls -la
```
Verify the directory shows the expected skill folders (each with its own SKILL.md).

**.gitignore consideration:** decide at session-open whether `.claude/skills/*/scripts/` artefacts (e.g. compiled output, downloaded fonts in canvas-design) should be gitignored. Default: commit everything that lands in `.claude/skills/` as-shipped from `anthropics/skills`. If any sub-folders contain large binaries or build outputs, add a targeted `.gitignore` rule.

**Verification at step end:**
- `ls .claude/skills/` lists the installed skill folders
- One representative skill's SKILL.md is readable (e.g. `cat .claude/skills/claude-api/SKILL.md | head -20`)
- README.md / standing protocol cache do not need editing yet (Step 2 + Step 4 handle that)

### Step 2 — Create CLAUDE.md at repo root (~20-30 min)

Create `/CLAUDE.md` as a short Claude Code session-open entry point that:

1. **Points at our existing governance** as the heavy-lifter:
   - `/adopted/standing-protocol-cache.md` — general session protocol
   - `/adopted/build-sessions-protocol-cache.md` — build-arc context
   - `/adopted/project-instructions-snapshot.md` — operative project instructions
   - `/manifest.md` — rules + architectural constraints

2. **Lists what's installed at `.claude/skills/`** with a one-line description each. References `github.com/anthropics/skills` for canonical docs.

3. **Names PR15 expectation explicitly** — "Before any bespoke build, the AI consults skills installed at `.claude/skills/` and the agentic-commerce-findings tracker at `/operations/agentic-commerce-findings-downstream-order.md` for relevant patterns. Bespoke election requires justification in the decision-log entry."

4. **Notes the Cowork vs Claude Code distinction:** Cowork mode already bundles 6 Anthropic skills (docx/pdf/pptx/xlsx/setup-cowork/consolidate-memory) — these load automatically when relevant; CLAUDE.md is primarily for Claude Code sessions; the Cowork project-instructions panel paste-sync discipline continues.

5. **Cross-references** to A7 + A5 + A9+J6 closes as the most-recent substrate-build context; build-arc-cache as the primary build-context reference.

6. **Short.** Aim ≤100 lines. CLAUDE.md is an entry point, not a re-statement of governance. Heavy content lives in the existing cache files.

**Sample CLAUDE.md structure** (founder approves at draft; this is suggested skeleton):

```
# CLAUDE.md — SageReasoning project entry point for Claude Code sessions

> For Cowork mode sessions: the project-instructions panel is the operative
> surface; this file is supplementary. Founder paste-syncs the panel against
> /adopted/project-instructions-snapshot.md between sessions.

## At session-open
Read /adopted/standing-protocol-cache.md (general protocol) +
/adopted/build-sessions-protocol-cache.md (build-arc context) +
the most recent close in /operations/handoffs/<stream>/ +
the day's primary deliverable.

## What's in .claude/skills/
<list of installed skill folders with one-liner each>

## PR15 expectation (project instructions §PR15)
Before any bespoke build, consult .claude/skills/ for relevant Anthropic
skills and /operations/agentic-commerce-findings-downstream-order.md for
forward-looking findings whose target session matches the day's scope.
Bespoke election requires justification in the session's decision-log entry.

## Most-recent substrate-build context
- A7 close: /operations/handoffs/founder/2026-05-13-A7-r20a-gate-close.md
- A9+J6 close: /operations/handoffs/founder/2026-05-14-A9-J6-cost-monitoring-close.md
- Decision log: /operations/decision-log.md (last 3 entries at session-open)
```

### Step 3 — Amend PR15 in project instructions (~30-40 min, ELEVATED)

This is the only Elevated-risk step in the session — it changes a governing rule. Founder approval required before commit.

The amendment adds (a) a mandate to consult `.claude/skills/` and the agentic-commerce-findings tracker before bespoke; (b) a cross-reference to anthropics/skills + anthropic-cookbook as canonical Anthropic-infrastructure surfaces beyond the existing category labels.

**Surface the proposed amendment text to founder before applying.** Suggested text (founder amends or approves):

```
PR15 — Bias Toward Existing Anthropic Infrastructure (AMENDED YYYY-MM-DD per D-PR15-AMENDED-FROM-ANTHROPIC-NATIVE-YYYY-MM-DD)

Source: ST2 Phase 3 Q8 election (Adopt SR4 as PR15). Amended YYYY-MM-DD to
operationalise the 2026-05-13 research findings and the 2026-05-14
Anthropic-native posture session.

Before proposing any bespoke build, the AI evaluates whether existing
Anthropic infrastructure delivers the same outcome with less custom work.

EXISTING INFRASTRUCTURE CATEGORIES (Anthropic-canonical primitives):
- Claude Code commands (incl. /security-review, /plugin)
- Sub-agents (Claude Code; Agent SDK)
- Skills (Anthropic-published at github.com/anthropics/skills; 17 official
  skills as of March 2026; installed locally at .claude/skills/)
- Managed agents (REST API; long-horizon agents)
- MCP servers (Model Context Protocol; standardised tool integration)
- SDK patterns (Claude Agent SDK Python + TypeScript)
- Plugin spec (Claude Code Plugins; lightweight packaging)
- Cookbook patterns (anthropic-cookbook/patterns/agents)
- Reference agents (anthropics/financial-services; legal-tools plugins)
- Dreams (memory consolidation; research preview)
- Outcomes (rubric + separate grader; public beta)
- Multi-agent orchestration (specialist agents; public beta)

OPERATIONAL DISCIPLINE (added YYYY-MM-DD):
Before electing a bespoke build, the AI MUST:
1. Consult skills installed at /.claude/skills/ for relevant SKILL.md
   patterns that match the session's scope.
2. Consult /operations/agentic-commerce-findings-downstream-order.md for
   forward-looking findings whose target session matches the day's scope;
   fold-in named action at the named point per the findings document.
3. State whether an Anthropic-canonical primitive could deliver the
   outcome before stating the bespoke election.
4. If bespoke is elected, justification is recorded in the decision-log
   entry under "Reasoning" naming the Anthropic primitive considered and
   why bespoke is preferable for this case.

Existing infrastructure is the default; bespoke work is the alternative
requiring justification. Justification is recorded in the decision log
when bespoke is elected.
```

**Apply the amendment to `/adopted/project-instructions-snapshot.md` §PR15.** Preserve the prior version per §0e: copy the current PR15 to `/archive/YYYY-MM-DD-pr15-pre-anthropic-native.md` before editing. This is the preserve-prior-versions discipline from §0e.

**Founder approval gate:** explicit approval before applying. The amendment changes a governing rule that affects every future session.

### Step 4 — Amend standing protocol cache (~15-20 min)

Per cache-update discipline: when project instructions change, update the cache in the same session. Standard-risk amendment.

Updates needed:
1. **§"How to use this cache at session open"** — add a note that for Claude Code sessions, `CLAUDE.md` at repo root is the auto-loaded entry point; for Cowork sessions, the project-instructions panel paste-sync continues. Cache stays the heavy-lifter for both.
2. **§"Cache update discipline"** — note the PR15 amendment date + reference D-PR15-AMENDED-FROM-ANTHROPIC-NATIVE-YYYY-MM-DD.
3. **§"Cross-references"** — add `/CLAUDE.md` + `/.claude/skills/` paths.
4. **Header status line** — add amendment note: "Amended YYYY-MM-DD under D-CACHE-DRIFT-RESOLVED-YYYY-MM-DD to incorporate CLAUDE.md adoption + PR15 amendment."

### Step 5 — Refresh features survey (~20-30 min)

The current survey at `/drafts/anthropic-features-survey-2026-05-10.md` is incomplete (CORRECTION NOTICE: missed Dreams/Outcomes/Multi-agent). It also predates the 2026-05-05 Anthropic finance agents announcement and the 12 legal plugins.

Two options for the refresh:

- **Option (a) — Update in place + adopt to `/adopted/`.** Edit the draft to add missing features (the 10 finance agents; the 12 legal plugins; the anthropic-cookbook patterns/agents; current AAIF/A2A governance status; the 17 skills now installed at `.claude/skills/`). Move from `/drafts/` to `/adopted/`. Preserves history via git diff.
- **Option (b) — Append a 2026-05-14 supplement section, leave the original in `/drafts/`.** Keeps the original as a snapshot of what was known on 2026-05-10. Adds a new section "Supplement — 2026-05-14 update".

**Default recommendation:** Option (a). The CORRECTION NOTICE already pattern-establishes in-place revision. Move to `/adopted/` so the survey is governing reference, not draft.

**Content additions for the refresh:**
- §"The 17 Anthropic Official Skills" — now installed at `.claude/skills/`; cross-reference Claude World article + anthropics/skills repo
- §"Finance + Legal reference agents" — anthropics/financial-services (10 agents); legal tools (12 plugins per TechRadar 2026)
- §"Agentic-commerce stack alignment" — current state of A2A governance via Linux Foundation AAIF (six co-founders including Anthropic); MCP + A2A complementarity; cross-reference J1 ADR adjacency sub-section + agentic-commerce-findings-downstream-order
- §"Anthropic-cookbook patterns/agents" — `anthropics/anthropic-cookbook/patterns/agents` as a reference resource; if any pattern matches A6/A10/A11a/A8 upcoming work, name it
- Correction notice on the original CORRECTION NOTICE: confirm the three previously-omitted features are now in PR15's category list

### Step 6 — agent-card.json currency check vs A2A v1 (~20-30 min)

Read `/website/public/.well-known/agent-card.json`. Compare against the A2A v1 spec (per Linux Foundation AAIF — confirm via WebFetch of the A2A spec docs).

**Specific checks:**
1. **Schema version field:** A2A v1 specifies a `protocolVersion` or `schemaVersion` field. Does our card carry it? If yes, does the value match v1?
2. **Capabilities structure:** A2A v1 specifies a particular shape for the `capabilities` array. Does ours match?
3. **Authentication declaration:** A2A v1 spec for auth declarations.
4. **Endpoints:** does the card name the correct endpoints (`/api/reason` etc.) per current substrate state?
5. **Last-updated date:** when was the card last modified? Per README line 411, completed 28 March 2026 — has anything material changed since?

**Output options based on findings:**

- **If aligned:** record as Verified in the decision-log entry. No code change.
- **If misaligned in minor ways (cosmetic; declarations only):** fix in this session as a small code change (Standard risk; additive metadata only).
- **If misaligned in load-bearing ways (capability declarations don't match actual endpoints; auth declared incorrectly):** flag as Elevated change; defer the fix to a follow-up session with its own Critical-or-Elevated tier; document the gap precisely in the decision-log entry so the follow-up is well-scoped.

**Step 6b (optional) — J1 ADR addendum:** if the founder elects, add a short note to the J1 ADR's "Agentic-commerce-stack adjacency" sub-section explicitly naming A2A as the foundational coordination protocol underneath AP2 + the payment-stack protocols. Single surgical edit; Elevated risk per amending-Adopted-strategic-document discipline.

### Step 7 — Verify

```bash
cd "/Users/clintonaitkenhead/Claude-work/PROJECTS/sagereasoning"

# 1. CLAUDE.md exists at repo root
ls -la CLAUDE.md
# Expected: file exists; size > 0

# 2. .claude/skills/ contains the installed skills
ls .claude/skills/
# Expected: skill folder names (algorithmic-art, canvas-design, ..., depending on which option was elected at Step 1)

# 3. Representative SKILL.md is readable
cat .claude/skills/claude-api/SKILL.md | head -10 2>/dev/null || \
  cat .claude/skills/docx/SKILL.md | head -10
# Expected: YAML frontmatter (---) + name + description fields visible

# 4. PR15 amendment present in project-instructions snapshot
grep -A 5 "PR15.*Bias Toward Existing Anthropic Infrastructure" /adopted/project-instructions-snapshot.md | head -15
# Expected: amended text visible including "AMENDED YYYY-MM-DD"

grep -c "OPERATIONAL DISCIPLINE" adopted/project-instructions-snapshot.md
# Expected: >= 1 (the new section in PR15)

# 5. Standing cache updated
grep -c "CLAUDE.md" adopted/standing-protocol-cache.md
# Expected: >= 1

# 6. Features survey adopted (if Option (a) elected)
ls adopted/anthropic-features-survey-*.md 2>/dev/null || \
  ls drafts/anthropic-features-survey-*.md
# Expected: file exists in /adopted/ (Option a) or /drafts/ with supplement (Option b)

# 7. Archive of pre-amendment PR15 exists (preserve-prior-versions per §0e)
ls archive/*pr15-pre-anthropic-native*.md
# Expected: file exists

# 8. TypeScript still compiles (defensive — no code changes expected this session)
cd website && npx tsc --noEmit -p tsconfig.json && cd ..
# Expected: zero errors

# 9. A5 + A7 regression checks (defensive — no code changes expected)
cd website && npx tsx src/lib/substrate/__tests__/layer3-service.test.ts && cd ..
# Expected: 28/28 pass
cd website && npx tsx src/lib/substrate/__tests__/r20a-gate.test.ts && cd ..
# Expected: 33/33 pass

# 10. Substrate steady state preserved
curl -sS -o /dev/null -w "%{http_code}\n" -X POST https://www.sagereasoning.com/api/substrate/layer3
# Expected: 503

curl -sS https://www.sagereasoning.com/api/public-key | python3 -c "
import json, sys
d = json.load(sys.stdin)
ok = d.get('previous') is None and d.get('rotation_overlap_until') is None and d.get('algorithm') == 'Ed25519'
print('PASS' if ok else 'FAIL')
"
# Expected: PASS
```

### Step 8 — Append decision-log entries (~20-30 min)

Likely three to four entries this session (one umbrella + per-amendment entries per the §0f discipline):

1. **`D-ANTHROPIC-NATIVE-POSTURE-YYYY-MM-DD`** — umbrella entry naming what this session accomplished, the Step 1 election (which skills), the Step 5 election (Option a or b), the Step 6 outcome (aligned / minor-fix / deferred). Lean form per cache §"Lean decision-log entry" but with Elevated additions for the PR15 amendment.

2. **`D-PR15-AMENDED-FROM-ANTHROPIC-NATIVE-YYYY-MM-DD`** — the project-instructions amendment specifically. Elevated risk. Names the prior version archived. Cross-references the umbrella entry.

3. **`D-CACHE-DRIFT-RESOLVED-YYYY-MM-DD`** — standing protocol cache amendment. Standard risk per cache-update discipline.

4. **`D-FEATURES-SURVEY-ADOPTED-YYYY-MM-DD`** (Option a path) — survey refresh + adoption. Standard risk.

If Step 6 surfaces an agent-card.json fix (small) or deferred follow-up (large), add a 5th entry: `D-AGENT-CARD-CURRENCY-CHECK-YYYY-MM-DD`.

### Step 9 — Session close (lean + Elevated form per cache)

Path: `/operations/handoffs/founder/YYYY-MM-DD-anthropic-native-posture-close.md`. Lean template + Elevated additions per `/adopted/standing-protocol-cache.md` §"Lean session close":

- **Decisions Made** — list the 3-5 decision-log entries appended
- **Status Changes** — table covering: CLAUDE.md (did-not-exist → NEW); `.claude/skills/` (did-not-exist → installed-with-N-skills); PR15 (prior → amended); standing cache (prior → amended); features survey (drafts → adopted OR drafts with supplement); agent-card.json (status from Step 6); substrate production state (unchanged)
- **Next Session Should** — A6 prose_mode templates OR A10 per-agent credentials OR A11a audits OR A8 V3 endpoint mapping per founder election (per A9+J6 close's list)
- **Blocked On** — uncommitted files + production state at session close
- **Open Questions** — any deferred (e.g. push-style alert delivery; per-path metric split trigger; agent-card v1 fix if deferred)
- **Founder Verification** — commands from Step 7 + commit command
- **Cross-references** — predecessor close (A9+J6); this session's decision-log entries; new/modified files

## Part C — Anticipated session shape

| Phase | Estimate |
|---|---|
| Cache + predecessor close + deliverable reads (Part A) | 20-30 min |
| Step 1 — Skills install election + scaffolding | 20-30 min |
| Step 2 — Create CLAUDE.md | 20-30 min |
| Step 3 — Amend PR15 (Elevated; founder approval gate) | 30-40 min |
| Step 4 — Amend standing protocol cache | 15-20 min |
| Step 5 — Refresh features survey | 20-30 min |
| Step 6 — agent-card.json currency check (+ optional Step 6b) | 20-30 min |
| Step 7 — Verify | 15-20 min |
| Step 8 — Decision-log entries (3-5 entries) | 20-30 min |
| Step 9 — Session close (lean+Elevated form) | 15-25 min |
| **Total** | **~3-4.5 hours** |

If founder elects a tighter scope (~2 hours), drop Step 5 (features survey refresh) and Step 6 (agent-card check) into a follow-up session; do Steps 1+2+3+4+8+9 only. The PR15 amendment + skills install + CLAUDE.md scaffold are the load-bearing items.

## Rollback path

Code/config changes (skills install at `.claude/skills/` + CLAUDE.md): `git revert <session-commit>` and push via GitHub Desktop. `.claude/skills/` directory deletes itself on revert (it was created in this session's commit); CLAUDE.md removes itself. No production impact (these don't deploy to Vercel — the `.claude/` path is a Claude Code convention, not a Next.js bundle path).

PR15 amendment + standing cache amendment: revert restores prior versions in `/adopted/` and the preserve-prior-versions archive at `/archive/YYYY-MM-DD-pr15-pre-anthropic-native.md` is preserved either way (it survives the revert as a verbatim snapshot).

Features survey adoption: if Option (a) was elected and the file moved from `/drafts/` to `/adopted/`, the revert returns it to `/drafts/`.

agent-card.json: if Step 6 surfaced a fix and applied it, revert restores the prior card. If Step 6 deferred the fix, no revert needed for the card.

## Forecast

Successful session produces:

- **CLAUDE.md at repo root** — auto-read by Claude Code at session-open; ≤100 lines; points at our existing governance heavy-lifters
- **`.claude/skills/`** populated with 4-17 installed Anthropic skills (per founder election); progressive disclosure means no context cost; available to any Claude Code session on this repo
- **PR15 amended** with operational discipline mandating consultation of `.claude/skills/` + agentic-commerce-findings tracker before bespoke election; prior version archived per §0e
- **Standing protocol cache amended** to reference CLAUDE.md + the PR15 amendment date
- **Features survey refreshed** to current state (May 2026); adopted (Option a) or supplemented (Option b)
- **agent-card.json currency check completed** — Verified OR small-fix-applied OR deferred-to-follow-up with precise gap documented
- **3-5 decision-log entries** appended; lean + Elevated form
- **Convergence pattern documented:** Anthropic canonical pattern (CLAUDE.md + .claude/skills/ auto-loading) coexists with our multi-stream governance (standing cache + build-arc cache + project-instructions snapshot); both retained; no conflict

**Stage 1 status after this session:** existing critical chain A1→A2→A3→A4→A5→A7 + cost monitoring (A9 + J6) + Anthropic-native posture complete. Stage 1 remaining: A6 (prose_mode templates) / A8 (V3 endpoint mapping) / A10-A19 (Stage 1 expansion). Substrate operationally ready for K-category migration prep (Stage 2 still gated on A10 + Stage 1 close).

**Next session after this:** A6 prose_mode templates (Standard; ~2-3hr), A10 per-agent credentials kickoff (Critical; ~3-4hr), A11a endpoint-auth audits (Standard; ~1hr), or A8 V3 endpoint mapping (Standard; ~1-2hr) — per founder election. Subsequent sessions consult `.claude/skills/` and the agentic-commerce-findings tracker at session-open per amended PR15.

End of prompt.
