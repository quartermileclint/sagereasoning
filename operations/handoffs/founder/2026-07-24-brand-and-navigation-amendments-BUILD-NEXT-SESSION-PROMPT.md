# Next-Session Prompt — Build the brand + navigation amendments (proposals → live)

**Stream:** founder (website build — executes the two proposals drafted 2026-07-23/24, not a new program).
**Tier:** `code-elevated` overall (existing user-facing pages change: `NavBar.tsx`, the site footer in `layout.tsx`, `milestones.ts`, `page.tsx`, `score/page.tsx`, `community/page.tsx`, `dashboard/page.tsx`, `methodology/page.tsx`, `journal/page.tsx` + `journal-content.ts`, `stoic-brain.ts`; five new pages; one new page). **Not** `code-critical` in the strict CLAUDE.md sense — no auth, session, encryption, or deploy-flag-activation surface is touched. **One R20a/AC5 precedent question applies and must be followed, not re-decided fresh** — see Pre-conditions.
**Predecessor sessions:** `operations/brand-2026-07/2026-07-23-brand-assets-audit-and-page-mapping-proposal.md` (revised three times — read its §0 changelog first, it's shorter than re-deriving the history from the doc body), `operations/brand-2026-07/2026-07-24-navigation-audit-header-footer-gaps.md`.
**Predecessor decision-log entries:** `D-BRAND-ASSETS-AUDIT-AND-PAGE-MAPPING-PROPOSAL-2026-07-23`, `D-BRAND-ASSETS-PROPOSAL-CORRECTED-AND-EXTENDED-2026-07-23`, `D-BRAND-STAGE-COLOUR-AND-CROSSING-MECHANISM-RESOLVED-2026-07-24`, `D-BRAND-STAGE-PAGES-FINAL-MECHANISM-2026-07-24`, `D-NAVIGATION-AUDIT-HEADER-FOOTER-GAPS-2026-07-24`.
**Risk classification:** Elevated under 0d-ii ("changes to existing user-facing functionality," "new module/route file"). Critical Change Protocol NOT automatically engaged — nothing here is auth/session/encryption/R20a-perimeter/deploy-flag. AC7 not engaged (no live credential/deploy op). PR6 not engaged.

## Why this session matters, and what NOT to re-derive

Two proposal sessions already did the grounding work: every colour value, every passion-to-image mapping, every orphaned page, and every founder decision (colour palette adopted; the five-stages-are-five-pages-not-a-dashboard-indicator mechanism; `onion→penthos`, `wax scribbled→agonia`, `achos`-pending-placeholder) is already settled and cited with exact file/line sources in the two proposal docs. **Do not re-audit the codebase from scratch** — read the two proposals in full (they are the deliverable-of-the-day) and build from them. Where a genuine open question remains (flagged explicitly below), ask the founder via `AskUserQuestion` at the relevant point — don't silently pick an answer, and don't re-litigate what's already settled.

**This is a large, multi-part build. Splitting it across sessions is expected and fine**, per this project's own "fast, bounded phases" working style — the six phases below are ordered by dependency (each enables the next), and stopping cleanly after any phase, with a session close + an updated decision-log entry naming exactly what's done and what's carried forward, is a completely legitimate outcome. Do not force all six phases into one sitting at the cost of rushing verification.

## Pre-conditions

1. **This session's own prior governance commit must already be pushed** — the two proposal docs, the `CLAUDE.md` brand-assets/navigation-audit sections, and `website/Brand/`/`website/public/images/` (the guideline docx + the 26 image files) all need to be on `main` before this build starts, since the build reads them. If `git log` doesn't show this commit, stop and get it committed first (see the companion terminal-commit prompt).
2. **The R20a/AC5 precedent for new human-facing practice pages applies here — follow it, don't re-decide it.** Per CLAUDE.md's own standing note on the Remaining Principles tools: every such page "carries `SupportFooter` (R20a §4 crisis exit) and sits OUTSIDE the distress perimeter by precedent (whether the family should join is a standing Critical/AC5 call... sharper for the grief-facing view-from-above tool)." The five new Stage pages (Phase 4) and the new image-glossary page (Phase 5) are new human-facing pages of the same general kind — **add `SupportFooter` to all six, and do not attempt to resolve the broader perimeter-inclusion question yourself** (that's still a standing, unresolved Critical/AC5 call across the whole Remaining Principles family, not something this session should quietly settle one way or the other for its own six pages).
3. Confirm the dev server runs cleanly before starting (`npm run build` in `website/`) so any new failures are attributable to this session's own changes, not a pre-existing break.

## Part A — Open under the protocol

Read in order:
1. `/adopted/standing-protocol-cache.md` (~3 min).
2. `operations/brand-2026-07/2026-07-23-brand-assets-audit-and-page-mapping-proposal.md` — in full, including §0's changelog (the doc's own history of corrections — read this before the body so later sections aren't misread against superseded framing).
3. `operations/brand-2026-07/2026-07-24-navigation-audit-header-footer-gaps.md` — in full.
4. `/CLAUDE.md`'s "Brand assets" section — the condensed, current-state summary; cross-check against the full docs above rather than relying on the summary alone for anything load-bearing.
5. The files each phase below touches, read before editing (not before the session opens — read each as you reach its phase, so context stays fresh and scoped).

Confirm at open: tier (Elevated, restated above); hold-point status (P0 0h, unchanged); model selection N/A (no LLM calls in this build); status vocabulary; signals + risk classification.

**Ask the founder these two open questions via `AskUserQuestion` before Phase 4** (both are named as genuinely unresolved in the proposal, not guessed at there, and shouldn't be guessed at here either):
- Does each stage's milestone fire on a **single** qualifying evaluation (matching the existing `first_deliberate`/`first_principled` pattern — cheaper, simpler), or a **sustained/consistent** run (matching `consistent_deliberate`'s 5-in-a-row bar)?
- Is a stage's page **locked/inaccessible** before its milestone is earned, or **visitable but inert** (viewable, just not yet "yours")?

## Part B — Procedure (six phases, ordered by dependency)

### Phase 1 — Centralize the shared constants (foundation for everything else)
- In `website/src/lib/stoic-brain.ts` (alongside the existing `VIRTUE_DISPLAY`/`OIKEIOSIS_STAGE_ENGLISH` pattern), add: the adopted `PROXIMITY_COLORS` (5 hex values, proposal §2.1), a canonical `ROOT_PASSION_ENGLISH` (currently independently duplicated in `score/page.tsx` and `scenarios/page.tsx` — centralize and update both call sites to import it), and a new `PASSION_IMAGE_MAP: Record<string, string>` (all 20 sub-species `id`s → `/images/<file>.PNG`, per the proposal's §3 table — including `achos` pointing at a placeholder path).
- **`achos`'s placeholder needs an actual asset created**, not just a path reference — a small, plain, honestly-marked "image pending" graphic (an SVG or PNG consistent with the site's existing "analogue pencil" imagery style per the brand guideline §5) — swap this one path for the real millstone image later; nothing else should need to change when it arrives.
- Update `page.tsx`, `score/page.tsx`, `community/page.tsx`, `dashboard/page.tsx` to import `PROXIMITY_COLORS` from `stoic-brain.ts` instead of each hardcoding its own (three divergent copies today, per the navigation... no — per the *brand* proposal's §2.4 table). This is the one genuinely visible colour change in this phase (`sage_like` moves from dark green to warm gold on every page that renders it) — a real, noticeable shift, expected and already founder-approved, not a bug.

### Phase 2 — Wire the passion images (depends on Phase 1's `PASSION_IMAGE_MAP`)
Add the matching icon wherever a sub-species passion currently renders as text-only:
- `website/src/app/passion-log/page.tsx` — next to every `PASSION_LABELS[...]` render (the dropdown's current selection, the submitted-event feed, the classification-result card, the trends/catch-rate breakdowns).
- `website/src/app/score/page.tsx` — next to each `passion_diagnosis.passions_detected` entry.
- `website/src/app/scenarios/page.tsx`, `website/src/app/score-document/page.tsx`, `website/src/app/score-social/page.tsx`, `website/src/app/score-policy/page.tsx` — same pattern, all four confirmed rendering the same shape.
- `website/src/lib/journal-content.ts` + `website/src/app/journal/page.tsx` — days 30–33 (proposal §3.2's table names exactly which sub-species each day enumerates) get a small row of the relevant images alongside that day's teaching text. Days 29 and 34+ are NOT targets (they don't enumerate specific sub-species by name).

### Phase 3 — Single-purpose image fixes (small, independent of Phases 1–2)
- `page.tsx`'s "Who is this for?" section — replace the "AI Agents" card's `Developer.PNG` with `agent.PNG` (currently duplicated with the "Developers" card; leave that one's `Developer.PNG` use untouched).
- `methodology/page.tsx:158` — add `mirror.PNG` alongside the existing "A measure of your worth as a person" list item.

### Phase 4 — The five Stage pages + milestone extension (depends on Phase 1's colours; depends on the two AskUserQuestion answers from Part A)
- Extend `MILESTONE_DEFINITIONS` in `website/src/lib/milestones.ts` with five new entries, one per proximity level — Reflexive and Habitual are **genuinely new** (the existing set only names forward achievements today); word all five as honest recognition, not achievement-or-failure, matching the guideline's own "what it feels like to be there, not what has been achieved" framing and this file's existing R1/R6c/R9 compliance comments.
- Build five new page routes, one per stage (naming not fixed by the proposal — a nested family such as `/stages/the-storm` is one reasonable option; pick one and apply it consistently). Each page: background tinted to that stage's `PROXIMITY_COLORS` value, the stage image, the guideline's own descriptive line for that stage, the "not a fixed ladder" caveat stated plainly (proposal §2.2), and `SupportFooter` (Pre-condition 2).
- Wire whatever currently surfaces earned milestones (check `MilestonesDisplay`, rendered on `dashboard.tsx`) so a newly-unlocked stage milestone links through to its page.
- Implement the reveal-gating per whichever `AskUserQuestion` answer the founder gave in Part A (locked vs. visitable-but-inert).

### Phase 5 — The image-glossary page (depends on Phases 1–2's centralized tables; independent of Phase 4)
- New page (naming not fixed — `/glossary` is one option) showing: the five virtue/persona logos with their one-line meanings; all five Stages (shown regardless of unlock status — this is reference material, explicitly distinct from Phase 4's individually-earned pages, per proposal §5's own note not to conflate the two); Mirror with its evaluative-honesty framing; all 20 passion logos (19 real + the `achos` placeholder) grouped by root family (epithumia/hedone/phobos/lupe), each with name + description.
- Draw entirely from the Phase 1 centralized tables — this page is the one place that most needs them to already be correct and shared, since it displays literally everything at once (proposal §5's own point).
- `SupportFooter` (Pre-condition 2).

### Phase 6 — Navigation additions (independent of Phases 1–5; can run in parallel or first, founder's call)
- **`NavBar.tsx`** — a new "Practice" dropdown (sibling to the existing "Tools" dropdown), containing: `/view-from-above`, `/morning`, `/hupexairesis`, `/premeditatio`, `/sage-compass`, `/oikeiosis`, `/passion-log`.
- **`layout.tsx`'s footer** — a matching fourth "Practice" column with the same seven links.
- **`/logos`** → add to the footer's existing "Philosophy" column.
- **`/marketplace`** → add to the footer's existing "Tools" column (consider a header link too — it's public product surface, not gated).
- **`/journal-feed`** → add a link from within `/journal` itself (a tab or "View live feed" link), plus a footer "Tools" entry near the existing `/journal` link.
- **`/reflections`** → add a link from `/dashboard` and/or `/private-mentor`, plus a footer entry.
- **`/mentor-baseline`** → add a link from `/mentor-hub` and/or `/private-mentor`, mirroring the already-correct `/mentor-index` pattern (linked from `private-mentor/page.tsx:485`) exactly.
- **`/baseline`** → add a persistent footer link (Philosophy or the new Practice column both fit) so the dashboard CTA isn't the only path in.
- **Minor asymmetries** — add `/methodology` to the header; add `/pricing` to the footer.
- **The Phase 5 image-glossary page** — add a footer link (Philosophy column, alongside `/logos`/`/methodology`) once it exists. The five Phase 4 stage pages should **not** get generic nav entries — they're individually earned/revealed, not standing destinations (name this explicitly if a reviewer asks why they're absent from nav).

### Verification (after each phase, not only at the end)
- `npm run build` in `website/` must stay green throughout — a type error in an early phase should be caught before compounding into later phases.
- Manually click through: every new/changed page renders; the new "Practice" dropdown opens/closes correctly (matching the existing "Tools"/"Hubs" dropdown behaviour); each Stage page's background colour and image render correctly; the passion icons appear correctly on all six wired pages plus the two journal days; the `achos` placeholder renders (not a broken image) everywhere `achos` appears.
- Confirm no existing test suite regresses (check for any existing component-level tests touching `NavBar`, `milestones.ts`, or the pages this session edits, and re-run them).

### Decision-log + close
Full or lean form depending on how much of the six phases land in one sitting — cite the standing cache's lean template if the session naturally splits into a smaller, cleanly-scoped chunk (e.g., "Phases 1–3 only"). Name explicitly, in the close, which phases are done and which are carried forward, and author a fresh next-session prompt for whatever remains — don't leave a partial build undocumented.

## Part C — Anticipated session shape

| Phase | Estimate |
|---|---|
| Opens + reads (Part A) | 25–35 min |
| Phase 1 — centralize constants | 45–60 min |
| Phase 2 — wire passion images (6 pages + 2 journal days) | 60–90 min |
| Phase 3 — agent.PNG + mirror.PNG | 15–20 min |
| Phase 4 — five stage pages + milestones | 90–120 min |
| Phase 5 — image-glossary page | 45–60 min |
| Phase 6 — nav additions | 45–60 min |
| Verification (spread across phases) + decision-log/close | 40–60 min |
| **Total if done in one sitting** | **~6–8 hours — very plausibly worth splitting; treat any clean phase-boundary stop as a full success, not an incomplete session** |

## Rollback path
Every phase is an additive/existing-file edit with no schema, auth, or deploy-flag surface — `git revert` the relevant commit(s) restores the prior state. If phases are committed separately (recommended, given the size — one commit per phase, or at minimum one commit per session if split), each reverts independently without touching the others.

## Forecast
Success is: the passion-log page (and everything else this session's own review found orphaned) genuinely reachable from the header and footer; the brand guideline's five Stages, Mirror, and 19+1 passion logos all live somewhere on the site rather than sitting unused in `public/images/`; the site's three-way colour-palette drift resolved to one canonical source; and — if all six phases land — a new practitioner able to discover `/logos` (their intended first stop) without already knowing the URL, which was the single most consequential gap either audit found.

End of prompt.
