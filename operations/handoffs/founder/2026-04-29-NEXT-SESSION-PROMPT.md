# Next Session Prompt — Update-Skill Redesign + v1.2.2/v1.3.0

**Copy the text below this line into the next session.**

---

Governing frame: `/adopted/session-opening-protocol.md`.

Read the session handoff first: `/operations/handoffs/founder/2026-04-28-registry-audit-v121-close.md`. That close describes the previous session in full — what was built (the new `sage-registry-audit` skill), what was applied (16 corrections as v1.2.1 of the registry, deployed live), what was decided (four Q1–Q4 answers locking in the update-skill redesign), and what was deferred (the update-skill redesign itself; Section 6 completeness candidates).

This is a continuation of SageReasoning P0 (R&D phase). Session focus: founder/tech, governance scope.

What just happened (in one paragraph):

The previous session created a new audit skill (`sage-registry-audit`), ran it against the v1.2.0 registry, applied 16 corrections as v1.2.1 with founder approval per section, and deployed live. The dashboard now reflects the actual current state of the major Verified work (ADR-PE-01 pattern engine, ADR-Ring-2-01 ring wrapper, support agent unit-Wired). 87 substantive completeness gaps and 21 minor were identified by Pass D's codebase walk; these were triaged into Class A (62 candidates for new components), Class B (45 sub-files), Class C (1 needs judgement) and the tables appended to the audit proposal for between-session review. The update skill (`sage-registry-update`) still has the design debt from the session of 2026-04-28 v1.3.0 rollback — its redesign was deferred from that session because the founder picked the two-skill split (audit + update separate). Four design decisions for the redesign are already locked in.

The founder's actual end-goal (this is the test for everything below):

"I want to be able to see what progress has been made by all of the work that I have done. The end goal is that everything that is needed to be updated or added in the two HTMLs is done to reflect the current status so I can see what work is done and what still needs to be done."

The two HTMLs are `https://www.sagereasoning.com/SageReasoning_Capability_Inventory.html` and `https://www.sagereasoning.com/SageReasoning_Architecture_Map.html`. Both render at runtime from `/website/public/component-registry.json` and `/website/public/flows.json`. Updates land by editing those JSON files and pushing.

What this session should do (in order)

Part A — Open the session under the protocol (no shortcuts)

Per `/adopted/session-opening-protocol.md` Part A elements 1–8, do the full read sequence. Tier: founder/tech, governance scope. Read:

1. `/manifest.md`
2. (Project instructions — already in system prompt)
3. `/operations/handoffs/founder/2026-04-28-registry-audit-v121-close.md` (the previous session's full close — required context)
4. `/operations/decision-log.md` — at minimum the last three entries (`D-REGISTRY-AUDIT-SKILL-CREATED`, `D-REGISTRY-AUDIT-v1.2.1`, plus the prior `D-REGISTRY-UPDATE-1.3.0-SUPERSEDED` for context)
5. `/operations/registry-updates/skill-redesign-plan-2026-04-28.md` (the redesign plan adopted last session; the four Q1–Q4 decisions are in here)
6. `/operations/registry-updates/audit-2026-04-28.md` (the audit proposal with Section 6 triage tables — read at least the totals and the Class A list to know what's deferred)
7. `/operations/knowledge-gaps.md` — scan KG1–7; the two PR5 candidates from the prior session may have advanced toward promotion
8. `/.claude/skills/sage-registry-update/SKILL.md` (the skill being redesigned — read it BEFORE the rewrite so the rewrite is grounded in what's actually there)
9. `/.claude/skills/sage-registry-audit/SKILL.md` (the new audit skill from last session — useful as a model for the rewrite's structure and conventions)
10. `/website/public/component-registry.json` (now v1.2.1 — note `lastUpdated: 2026-04-28`)

Confirm: tier, hold-point status (still active), model selection (no code expected; flag if changes), status-vocabulary readiness, signals/risk-classification readiness.

Part B — Verify state (no git issues expected)

The previous session pushed v1.2.1 cleanly. Working tree should be clean. Quick check with the founder:

```
cd "/Users/clintonaitkenhead/Claude-work/PROJECTS/sagereasoning"
git status -s
```

Expected: empty (no modifications). If anything appears, pause and stabilise before proceeding.

Part C — Redesign the update skill

The four Q1–Q4 decisions are already made and recorded in `/operations/registry-updates/skill-redesign-plan-2026-04-28.md`. Do not re-debate them unless the founder explicitly chooses to override.

The decisions:

- **Q1 — One comprehensive skill.** The redesigned `sage-registry-update` runs the comprehensive shape every time. No depth flag. No second skill (the audit role belongs to `sage-registry-audit` now).
- **Q2 — Always preserve a remaining-work note.** When integration is complete, the `blocker` field carries a short remaining-work note rather than clearing to empty. Rows with substantive next steps stay marked red on the dashboard, with the content of the note describing what's done and what's next.
- **Q3 — `na` for pipeline-internal.** `humanReady` and `agentReady` read `na` for engines never intended to face users or agents directly (those with `journey: internal` or whose role is invocation-by-other-engines). Audit Pass C flags rows that read `not-ready` and should read `na`; the redesigned skill applies the rule consistently when proposing edits.
- **Q4 — Edit both layers when stale.** Layer A (rendered fields: `name`, `type`, `oldStatus`, `status`, `desc`, `notes`, `humanReady`, `agentReady`, `origin`, `blocker`) and Layer B (interpretation fields: `connects`, `deps`, `journey`, `priority`, `rules`, `path`, `subtype`) are both edited when stale. The skill is comprehensive across both layers.

The rewrite should encode:

1. The four passes from the redesign plan: Pass 1 (source scan since `lastUpdated`), Pass 2 (code-grep verification — use targeted import-pattern grep, not stem-match, per the audit session's lesson), Pass 3 (transitive impact via `connects`/`deps` walk), Pass 4 (internal consistency).
2. Source-of-truth per field (table from the redesign plan).
3. Output: single comprehensive proposal at `/operations/registry-updates/proposed-YYYY-MM-DD.md`.
4. Apply mechanics: pre-edit backup at `/archive/component-registry/component-registry.json.backup-YYYY-MM-DD-HHMM` (no `-audit-` infix — that distinguishes from the audit skill's backups), JSON validation, statusSummary recompute, `lastUpdated` and `version` bump per semver, `totalComponents` recount.
5. Decision-log entry per applied update, identifier shape `D-REGISTRY-UPDATE-vX.Y.Z`.
6. Provide git commands verbatim; if `git push` fails, fall back to GitHub Desktop per D-PR8-PUSH 2026-04-26.

Pre-edit backup of the existing SKILL.md per D6-A archive convention before the rewrite:

```
/archive/2026-04-28_sage-registry-update-SKILL_pre-redesign.md
```

(The backup file's date can be 2026-04-28 since that's when the redesign plan was adopted; the rewrite happens at next session's date but the design predates it.)

Append decision-log entry: `D-REGISTRY-UPDATE-SKILL-REDESIGNED-YYYY-MM-DD`.

Risk classification: the SKILL.md edit is **Elevated** (governing document). Rollback by restoring from the archive copy. No live system risk.

Part D — Run the redesigned skill

After the rewrite:

1. Run the skill against v1.2.1.
2. Output: `/operations/registry-updates/proposed-YYYY-MM-DD.md`. The proposal should be sparse — most recent work was reflected by the audit. If it is sparse, that's a successful run, not a problem.
3. Founder reviews the proposal once. Approves / modifies / rejects per item or in bulk.
4. Apply approved edits in one pass. One backup. One decision-log entry. One push.
5. Per skill: pre-edit backup, JSON validation, header recompute, version bump (patch v1.2.1 → v1.2.2 if no new components added; minor v1.2.1 → v1.3.0 if new components added).

Part E — Verify on the live site

After deploy (Vercel ~1 minute after push):

1. Open both HTMLs. Confirm the banner shows the new `lastUpdated` date.
2. Walk the founder through one or two specific changed rows together to confirm rendering.
3. If anything looks wrong, restore from the pre-edit backup and report what failed.

Optional Part F — Section 6 Class A review (if time permits this session)

The audit proposal at `/operations/registry-updates/audit-2026-04-28.md` has 62 Class A completeness candidates in Section 6a. These are files in the codebase that don't have a registry entry and look substantive. Adding them is a major action (per skill rule: "no silent additions"); each addition needs founder approval.

If the founder has appetite for this in the same session as the update-skill run, walk through the Class A list together. Suggested approach: skim by category (API routes, context loaders, agent docs, lib modules); founder picks a batch to add; the redesigned `sage-registry-update` skill handles the additions as part of its run with version bump to v1.3.0.

If not, defer Class A review to a dedicated future session. The triage tables remain accessible at the audit proposal path.

Important context

Founder is a non-coder. Plain-language explanations of what each change does and means. Exact copy-paste terminal commands for any deploy. Describe changes in terms of what they do for the founder, not how they're implemented.

Founder decides direction; AI surfaces options with reasoning. Never edit governing documents (manifest, project instructions, adopted protocols, the skill SKILL.md files) without explicit approval. The SKILL.md rewrite in Part C is a governing-document edit — propose the plan first if anything in the redesign needs revisiting; otherwise the four Q1–Q4 decisions are adopted and the rewrite proceeds on those.

Previous session worked well — the founder confirmed the live site matches expectations and signalled "verified" cleanly. The two-skill split (audit + update) is now the established pattern for registry maintenance. Don't merge them back into one skill without explicit founder direction.

Don't propose a parallel skill for `flows.json` this session. The flows skill (`sage-flows-update`) is also Scaffolded but is out of scope for the registry stream until the founder picks it up.

Risk classification: the SKILL.md rewrite is Elevated; the registry edits in Part D are Standard with backup + rollback; the push is Standard but reaches the live site so verification follows.

Standing reminders

- Single source of truth for both dashboards: `/website/public/component-registry.json`. Do not edit `/website/public/SageReasoning_*.html` for content updates — that's not how the rendering works.
- Pre-edit backups go to `/archive/component-registry/` (update skill) before any JSON write. Audit skill uses the same folder with `-audit-` infix in the filename.
- Decision-log entry per applied update.
- Provide the founder with `git add / git commit / git push` commands verbatim for every deploy-bound change. If `git push` fails (the recurring sandbox-can't-push pattern noted in D-PR8-PUSH 2026-04-26), use GitHub Desktop instead.
- Founder verifies between sessions, not in real time. Provide URLs, expected results, and copy-paste commands.
- The audit skill runs less often than the update skill. After this session, the typical cadence is: update skill after each major work milestone; audit skill periodically (e.g., monthly) or before any update where accuracy is uncertain.

End of prompt. Confirm receipt and full Part A read before proceeding to Part B.
