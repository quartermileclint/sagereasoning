# Next Session Prompt — Blocker-Field Convention + Pass 4 Heuristic Enhancement

**Copy the text below this line into the next session.**

---

Governing frame: `/adopted/session-opening-protocol.md`.

Read the session handoff first: `/operations/handoffs/founder/2026-04-28-update-skill-redesign-and-v1.2.2-close.md`. That close describes the previous session in full — three governance changes landed (the `sage-registry-update` skill redesign, the Pass 1 lookback patch, and the v1.2.2 deploy of 35 field changes across 18 rows), plus one issue surfaced at live-site verification that's now this session's first agenda.

This is a continuation of SageReasoning P0 (R&D phase). Session focus: founder/tech, governance scope.

What just happened (in one paragraph):

The previous session redesigned `sage-registry-update` (D-REGISTRY-UPDATE-SKILL-REDESIGNED), patched its Pass 1 lookback rule when the founder caught the `lastUpdated`-shared-with-audit flaw (D-REGISTRY-UPDATE-SKILL-PASS1-FIX), then ran the redesigned-and-patched skill end-to-end. The first run produced a proposal organised into four sections (Pass 1 with anchor 2026-04-08 → 1 finding for engine-mentor-ledger; Pass 4 internal consistency → 3 notes-drift fixes, 13-component Q3 batch, 28 Q2 review with 5 receiving remaining-work notes per founder approval). All sections were approved and applied as v1.2.2; founder pushed and Vercel redeployed. On verification, founder flagged that engine-pattern-engine and engine-ring-wrapper still render RED on the architecture map. Diagnosis: their `blocker` text describes verification provenance (achievement) rather than remaining work. Per the Q2 convention as written, blocker = remaining-work note (cleared when no work remains AND no next step named). The audit's blocker rewrites mixed both — engine-pattern-engine has both verification description AND a substantive next step (§8 founder-hub switch); engine-ring-wrapper has only verification description with no remaining work named. The dashboard correctly renders what the registry says — the issue is upstream in the convention/text shape. Founder direction at session close: don't restore, diagnose, write into close, write next-session prompt. This is that prompt.

The founder's actual end-goal (still the test for everything below):

"I want to be able to see what progress has been made by all of the work that I have done. The end goal is that everything that is needed to be updated or added in the two HTMLs is done to reflect the current status so I can see what work is done and what still needs to be done."

The two HTMLs are `https://www.sagereasoning.com/SageReasoning_Capability_Inventory.html` and `https://www.sagereasoning.com/SageReasoning_Architecture_Map.html`. Both render at runtime from `/website/public/component-registry.json` and `/website/public/flows.json`. Updates land by editing those JSON files and pushing.

What this session should do (in order)

Part A — Open the session under the protocol (no shortcuts)

Per `/adopted/session-opening-protocol.md` Part A elements 1–8, do the full read sequence. Tier: founder/tech, governance scope. Read:

1. `/manifest.md`
2. (Project instructions — already in system prompt)
3. `/operations/handoffs/founder/2026-04-28-update-skill-redesign-and-v1.2.2-close.md` (the previous session's full close — required context)
4. `/operations/decision-log.md` — at minimum the last three entries (`D-REGISTRY-UPDATE-SKILL-REDESIGNED`, `D-REGISTRY-UPDATE-SKILL-PASS1-FIX`, `D-REGISTRY-UPDATE-v1.2.2`)
5. `/operations/registry-updates/proposed-2026-04-28-b.md` (the v1.2.2 proposal — what was applied)
6. `/operations/knowledge-gaps.md` — scan KG1–7
7. `/.claude/skills/sage-registry-update/SKILL.md` (the current skill, post-patch, post-redesign)
8. `/website/public/component-registry.json` (now v1.2.2 — note `lastUpdated: 2026-04-28`)

Confirm: tier, hold-point status (still active), model selection (no code expected; flag if changes), status-vocabulary readiness, signals/risk-classification readiness.

Part B — Verify state (no git issues expected)

The previous session pushed v1.2.2 cleanly. Working tree should be clean. Quick check with the founder:

```
cd "/Users/clintonaitkenhead/Claude-work/PROJECTS/sagereasoning"
git status -s
```

Expected: empty (no modifications). If anything appears, pause and stabilise before proceeding.

Part C — Decide the blocker-field convention (this is the upstream decision)

This is the irreplaceable founder decision that drives everything below. Surface the options with reasoning; do NOT prescribe. Two options:

* **Option A — Strict Q2: blocker = ONLY remaining work / next steps.** Achievement description belongs in `notes` or `desc`. Per Q2 strictly: clear blocker when no work remains AND no next step is named. This is what Q2 already says; the issue is the audit's blocker rewrites mixed achievement and remaining-work text. Choosing Option A means going through audit-touched rows and paring blockers down to remaining-work-only.

  Implications for the architecture map: red rows accurately mean "has remaining work named" — useful as a "what's next" map. The map becomes less red as work completes. Genuinely complete components don't render red.

* **Option B — Loose Q2: blocker = "any text the dashboard should highlight as needing attention."** Achievement description with context of remaining work stays. The Q2 convention loosens. Choosing Option B means amending Q2 in the SKILL.md — `blocker` is no longer "remaining work only" but "anything notable about this row's state."

  Implications for the architecture map: more rows render red (the state is verbose). The map shows "rows with notable state" rather than "rows with remaining work." Less actionable as a "what's next" map; more comprehensive as a "what's been said about each row" map.

Recommend asking the founder which they want before proposing per-row corrections. The decision changes both the registry edits AND the SKILL.md (Q2 wording).

Part D — Apply per-row corrections per the chosen convention

If Option A is chosen:

1. **`engine-pattern-engine` blocker:** pare to "Next: founder-hub per-consumer 2A-recompute switch (ADR-PE-01 §8 — deferred)." Move the verification provenance to `notes` (already there from v1.2.2's Section 4a — this is just removing it from blocker).
2. **`engine-ring-wrapper` blocker:** clear (no remaining work named; row should not be red). Move verification provenance to `notes` (already there from v1.2.2's Section 4a).
3. **`engine-profile-store` notes:** rewrite to match blocker (Pass 4 missed this case in v1.2.2 because of an over-narrow heuristic — the engine-profile-store blocker uses "integrated via canonical MentorProfile" instead of one of Pass 4's matched strings like "Verified" / "consume canonical").
4. **Walk other audit-corrected blockers** for the same achievement-vs-next-step shape and apply the same logic.

If Option B is chosen:

1. Amend Q2 in `/.claude/skills/sage-registry-update/SKILL.md` to reflect the looser convention.
2. Append decision-log entry for the convention change.
3. No registry edits needed (current state matches the loosened convention).

Part E — Enhance Pass 4 to catch the broader contradiction patterns

Two enhancement options for Pass 4 that should be discussed regardless of A/B:

1. **Broaden the integration-claim verb set** in the `blocker_corrected_notes_stale` check. Currently matches "Verified", "verified end-to-end", "consume canonical". Add: "integrated", "Verified at", "Verified across", "Verified end-to-end" (case-insensitive), "now consumes", "wired through", "connects via". This catches the engine-profile-store class of contradiction.

2. **Add an achievement-language check on Verified rows' blockers** (only relevant if Option A is the chosen convention). Heuristic: if a Verified row's blocker contains achievement language (Verified / Confirmed / Complete / Validated) but no next-step language (Next: / Outstanding: / Remaining: / Pending: / P[0-9]: / TODO:), flag for blocker pare-down. This would catch engine-pattern-engine and engine-ring-wrapper automatically in future runs.

Apply the agreed enhancements via edit to `/.claude/skills/sage-registry-update/SKILL.md`. Pre-edit backup per D6-A archive convention to `/archive/2026-04-29_sage-registry-update-SKILL_pre-Q2-and-Pass4-enhancement.md` (or appropriate name reflecting the actual changes). Append decision-log entry.

Part F — Apply registry corrections as v1.2.3

After Part D's per-row edits (and Part E's skill enhancement, if any), apply as patch bump v1.2.2 → v1.2.3. Pre-edit backup per skill convention. JSON validation. Decision-log entry per skill format. Push to deploy.

Part G — Verify on the live site

After Vercel redeploys (~1 minute):

1. Open both HTMLs. Confirm the banner shows the new `lastUpdated` date.
2. Walk the founder through engine-pattern-engine, engine-ring-wrapper, engine-profile-store specifically to confirm the architecture map renders them correctly (red iff blocker is non-empty AND describes remaining work, per Option A).
3. If anything looks wrong, restore from the pre-edit backup and report what failed.

Optional Part H — Section 6 Class A review (still deferred from prior sessions)

The audit proposal at `/operations/registry-updates/audit-2026-04-28.md` has 62 Class A completeness candidates in Section 6a. These remain available for a dedicated session. Not in scope for this session unless founder appetite changes.

Important context

Founder is a non-coder. Plain-language explanations of what each change does and means. Exact copy-paste terminal commands for any deploy. Describe changes in terms of what they do for the founder, not how they're implemented.

Founder decides direction; AI surfaces options with reasoning. Never edit governing documents (manifest, project instructions, adopted protocols, the skill SKILL.md files) without explicit approval. The Part E SKILL.md enhancement is a governing-document edit — propose first.

Part C is the irreplaceable founder decision. The session shouldn't proceed past it without an explicit direction. If the founder defers, accept the deferral and close — don't push toward a decision.

Risk classification: SKILL.md edits in Part E are Elevated (governing document); registry edits in Part F are Standard with backup + rollback; the push is Standard but reaches the live site so verification follows.

Standing reminders

* Single source of truth for both dashboards: `/website/public/component-registry.json`. Do not edit `/website/public/SageReasoning_*.html` for content updates.
* Pre-edit backups go to `/archive/component-registry/` (update skill) before any JSON write. Audit skill uses `-audit-` infix.
* Decision-log entry per applied update.
* Provide the founder with `git add / git commit / git push` commands verbatim for every deploy-bound change. If `git push` fails (D-PR8-PUSH 2026-04-26), use GitHub Desktop instead.
* Founder verifies between sessions, not in real time. Provide URLs, expected results, and copy-paste commands.

End of prompt. Confirm receipt and full Part A read before proceeding to Part B.
