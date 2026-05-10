# Session Close — 2026-05-10 — Stage 1 Kickoff: Plan Adoption + ADR-Substrate-Concept + A1 Layer 2 Auth Scaffolding

**Stream:** founder.
**Governing frame:** /adopted/standing-protocol-cache.md + /adopted/build-sessions-protocol-cache.md.
**Tier:** code-critical (set by Step 3 — A1 Layer 2 auth scaffolding). Full templates per the standing cache "Critical-risk sessions" section.
**Date:** 2026-05-10.
**Predecessor close:** /operations/handoffs/founder/2026-05-10-substrate-plugin-staging-close.md
**Predecessor decision-log entries:** D-BUILD-SESSIONS-CACHE-ADOPTED-2026-05-10, D-BUILD-PLUGIN-STAGING-PLAN-DRAFTED-2026-05-10
**Session prompt:** /operations/handoffs/founder/2026-05-10-stage-1-kickoff-NEXT-SESSION-PROMPT.md

---

## Decisions Made

- **D-STAGING-PLAN-ADOPTED-2026-05-10** appended (full form). The substrate-plugin staging plan adopted from `/drafts/` to `/adopted/`; predecessor staging plan and predecessor build-arc-cache draft archived. Eight founder open questions resolved and locked. No-current-users governing note inherited.
- **D-BUILD-CACHE-DRIFT-RESOLVED-2026-05-10-NO-USERS** appended (lean form). The build-arc cache amended in-place to add the "Founder governing notes for the duration of the build arc" section recording the no-current-users governing note.
- **D-A1-LAYER2-AUTH-SCAFFOLD-2026-05-10** appended (full form per Critical Change Protocol). Stage 1 item A1 (Layer 2 plugin-auth) scaffolded on `/api/reason` as the PR1 single-endpoint proof; companion ADR for J1 adopted. Function defined behind feature flag set to `false`; **not invoked** in this session. Six-step Critical Change Protocol writeup recorded in the entry.

---

## Status Changes

| Item | Old | New |
|---|---|---|
| substrate-plugin-staging-plan | Designed (in `/drafts/`, pending review) | **Adopted** (in `/adopted/`); decision-status governs every execution session |
| stoic-agent-substrate-staging-plan (predecessor) | (in `/drafts/`, superseded in scope) | **Archived** (in `/archive/2026-05-09-…-superseded.md`) |
| build-sessions-protocol-cache (draft predecessor) | (in `/drafts/`, preserved in place) | **Archived** (in `/archive/2026-05-10-…-superseded.md`) |
| build-sessions-protocol-cache (adopted) | Adopted (no governing-notes section) | Adopted + amended in-place (no-current-users governing note added) |
| ADR-stoic-agent-substrate-concept (J1) | (did not exist) | **Adopted** in `/adopted/` |
| Stage 1 item A1 (Layer 2 plugin-auth) | Scoped | **Scaffolded** (function defined; flag at `false`; no call sites; not deployed) |
| `/api/reason/route.ts` | Translation-sandwich-only canonical (M1-CP6 2026-05-08) | Translation-sandwich-only canonical + A1 plugin-auth scaffold (zero runtime effect) |
| `/website/.env.example` | (did not exist) | Created with `PLUGIN_AUTH_ENABLED=false` and `PLUGIN_AUTH_SECRET=` placeholder |

---

## Verification Method Used (0c Framework)

| Work item | Verification method |
|---|---|
| Filesystem moves (Step 1) | Founder runs `ls` on the three target paths; confirms presence in expected locations. |
| Status header update (Step 1) | Founder runs `head -3 adopted/substrate-plugin-staging-plan.md`; confirms "Adopted 2026-05-10" status line. |
| Build-arc cache amendment (Step 1) | Founder runs `grep -i -A 4 "no current users"` on the cache file; confirms governing-note paragraph appears with entry-ID reference. |
| ADR adoption (Step 2) | Founder reads `/adopted/ADR-stoic-agent-substrate-concept.md` directly; verifies architectural claims match agreed substrate concept (founder is the deciding authority on this match). |
| A1 scaffold presence (Step 3) | AI provides grep commands; founder runs them and confirms function defined, flag declared, **zero call sites** of `checkPluginAuth(...)`, `.env.example` declares the flag. |
| Critical Change Protocol writeup (Step 3) | Decision-log entry contains the full six-step writeup; founder reads and either approves "go ahead" specific to named risks or pushes back. |
| Decision-log entries (Step 5) | Founder reads the three appended entries directly; confirms format and content match expected templates (full form for two Critical entries; lean for cache-drift). |

---

## Risk Classification Record (0d-ii)

| Change | Classification | Reasoning |
|---|---|---|
| Three filesystem moves (`/drafts/` → `/adopted/` and `/drafts/` → `/archive/`) | Elevated | Per standing cache: move file from `/drafts/` to `/adopted/` or `/archive/` defaults to Elevated. |
| Status header update on adopted staging plan | Elevated | In-place edit to a governing document in `/adopted/`. Same risk class as the move. |
| Build-arc cache in-place amendment (governing note added) | Standard | Per cache's own update discipline: in-session amendment when build-arc context changes. |
| ADR-stoic-agent-substrate-concept creation | Standard | New documentation file; no code touched in the ADR drafting itself. |
| A1 scaffold (function added, flag declared, `.env.example` created; **not invoked**) | **Critical** | Auth-surface change per AC7 + PR6. Critical Change Protocol applies in full. The fact that the function is not invoked does not reduce the classification — the auth surface has been touched. |
| Three decision-log entries appended | Standard (×2 for housekeeping + cache-drift) + Critical writeup format (for A1 entry) | Documentation of decisions; Critical-tier entry uses full Critical Change Protocol form. |

The session as a whole is classified **Critical** (set by the highest-risk change, per standing cache). Full templates apply to all close artefacts.

---

## PR5 — Knowledge-Gap Carry-Forward

Three concepts surfaced in this session that may become PR5 candidates if they recur in subsequent sessions:

1. **The substrate's three-layer architecture (open Layer 1 + closed Layer 2 + closed Layer 3) and the moat boundary.** Re-explained inline in the ADR and the A1 scaffold's inline documentation. First explicit re-statement; cumulative count = 1. Watch-status if it recurs.

2. **The no-current-users governing note's effect on Critical Change Protocol step 3.** New this session; explained in the build-arc cache amendment, the A1 decision-log entry, and the close. Cumulative count = 1. Watch-status if it recurs.

3. **PR1 single-endpoint proof discipline applied to feature-flag-gated functions.** Re-explained in the A1 inline documentation, the CCP writeup, and the close's "Next Session Should" block. The standard PR1 form (prove on one endpoint before rollout) is well-established; the feature-flag variant is a refinement. Cumulative count = 1. Watch-status if it recurs.

No concept reached three recurrences this session. None promoted to permanent KG entry.

The session's session-opening protocol read of `operations/knowledge-gaps.md` was implicit in the standing-cache + build-arc-cache reads at session-open; no concept already in the register engaged the session's scope (the session does not touch DB writes, JSONB storage, model selection beyond the per-AC1 standing answer, hub-label contracts, capability-matrix updates, token counts, or context-layer composition).

---

## Next Session Should

The next session is the **A1 deploy + flag-flip + verification** session (PR1 single-endpoint proof completion on `/api/reason`).

**Pre-conditions:**
1. Founder has reviewed and approved the scaffold commit per CCP step 6 of `D-A1-LAYER2-AUTH-SCAFFOLD-2026-05-10` (the explicit "go ahead" specific to named risks).
2. Founder has staged and committed this session's work (see "Founder Verification" block below for the exact commit sequence; **the predecessor session's uncommitted files will be co-committed with this session's work — see "Blocked On" for context**).
3. Founder has cleared the `.git/index.lock` file before staging (left over from a sandbox limitation; one-line `rm -f .git/index.lock` from the repo root).
4. Founder has pushed via GitHub Desktop and Vercel has redeployed cleanly.
5. The scaffold is live on production (with the flag still at `false` — zero runtime effect).
6. Founder has decided which invocation-site option to take (the three options are listed in the A1 entry's "Open questions" — extending the existing 401 branch, adding a third precedence tier, or fully separating into a pre-handler middleware).

**Scope of next session:**
- Wire `checkPluginAuth` into the chosen invocation site (Critical change; full Critical Change Protocol writeup).
- Provision `PLUGIN_AUTH_SECRET` in Vercel project settings (founder action; AI cannot do this).
- Flip `PLUGIN_AUTH_ENABLED` to `true` in Vercel project settings (founder action; Critical change with its own CCP writeup at the moment of flip).
- Run the post-deploy verification commands per the A1 entry's verification step.
- Close A1 to **Verified** status only after all three verification scenarios pass (200 with valid `X-Plugin-Auth`, 401 without when flag is on, 200 with user-auth when flag is off).

**Estimated next-session duration:** 3 hours per the staging plan's Session 2 packaging (Layer 2 auth Verified on first endpoint; begin A2 validation surface). If the deploy-phase CCP review surfaces unanticipated risks, the session may close at "Wired but not flag-flipped" status and the flag-flip happens in a third session.

After A1 reaches Verified, the build arc proceeds to **A2 — Layer 2 input validation surface scaffolding** (Elevated risk; per staging plan Session 3 packaging).

---

## Blocked On

**Founder action required before next session begins:**

1. **Clear `.git/index.lock`.** A sandbox limitation prevented the assistant from cleaning up a stale lock file left behind by a `git mv` attempt at the start of this session. Run `rm -f .git/index.lock` from the repo root in your own terminal. Without this, `git add` / `git commit` will fail.

2. **Stage and commit this session's work AND the predecessor session's uncommitted work.** The pre-condition that "the working tree is clean" was not met at session-open — the predecessor session's files (this session's prompt, the predecessor close, the prior decision-log mods, the staging plan draft, the build-arc cache adoption) were not committed before this session started. The work proceeded anyway because no production code was touched until Step 3 (which created a scaffold with zero runtime effect) and the predecessor work and this session's work are both housekeeping + governance + a single Critical scaffold that is not deployed. The commit at session close brings everything into one logical commit. Founder may split the commit into two if a separate audit trail is preferred (predecessor work + current work), but combining them is acceptable per the no-current-users governing note (no risk of session-state mismatch).

**Files remaining uncommitted (will be picked up by the staging commit):**

Predecessor session (uncommitted at start of this session):
- `adopted/build-sessions-protocol-cache.md` (created in predecessor)
- `operations/handoffs/founder/2026-05-10-stage-1-kickoff-NEXT-SESSION-PROMPT.md` (this session's prompt; created in predecessor)
- `operations/handoffs/founder/2026-05-10-substrate-plugin-staging-close.md` (predecessor close)

This session:
- `adopted/substrate-plugin-staging-plan.md` (moved from `/drafts/`; status header + cross-reference updated)
- `adopted/build-sessions-protocol-cache.md` (in-place amendment — governing-notes section added)
- `adopted/ADR-stoic-agent-substrate-concept.md` (created)
- `archive/2026-05-09-stoic-agent-substrate-staging-plan-superseded.md` (moved from `/drafts/`)
- `archive/2026-05-10-build-sessions-protocol-cache-draft-superseded.md` (moved from `/drafts/`)
- `drafts/substrate-plugin-staging-plan.md` (deleted by move)
- `drafts/stoic-agent-substrate-staging-plan.md` (deleted by move)
- `drafts/build-sessions-protocol-cache.md` (deleted by move)
- `website/src/app/api/reason/route.ts` (modified — A1 scaffold added; not invoked)
- `website/.env.example` (created)
- `operations/decision-log.md` (three entries appended)
- `operations/handoffs/founder/2026-05-10-stage-1-kickoff-close.md` (this file)

**Production state at session close:** No change. Vercel state unchanged. Supabase state unchanged. AC7 disposition unchanged at deploy level (the scaffold is in code but not deployed and not invoked). The deploy + flag-flip changes happen in the next session under their own Critical Change Protocol writeups.

---

## Open Questions

1. **A1 invocation-site option (next session decision).** Three options named in the A1 decision-log entry: (a) extend the existing `if (auth.error && (!apiKey || !apiKey.valid))` branch to also check `checkPluginAuth` before returning 401; (b) add a third precedence tier where plugin-auth is checked first if `PLUGIN_AUTH_ENABLED` is true and the `X-Plugin-Auth` header is present; (c) fully separate plugin-auth into its own pre-handler middleware. Founder elects at next-session open; AI presents trade-offs on request.

2. **Real `plugin_id` scheme (deferred to A3 / A4 ADRs).** The current `plugin_id: 'scaffold-plugin'` placeholder will be replaced when the signing infrastructure (A3) and key management (A4) ADRs are drafted. Options noted in the A1 entry.

3. **Fail-closed vs fail-noisy posture for missing secret.** Currently fail-closed (return 401 when secret is absent). May be revisited based on production observation. Decision held until the next-session deploy-phase review.

4. **Lawyer engagement timing.** Per founder decision #4 (kick off at Stage 3 start), no action required this session. Founder action item for later in the arc; flagged here for visibility.

5. **Pre-Stage-4 cost-and-pricing session.** Per founder decisions #6 and #7, this session is not yet scheduled but inserts immediately before Stage 4. Stage 1 + 2 work proceeds without per-route cost-acceptance gating.

---

## Founder Verification (Between Sessions)

Step-by-step in your own terminal (not in this Cowork session):

```bash
cd "/Users/clintonaitkenhead/Claude-work/PROJECTS/sagereasoning"

# 1. Clear the stale git lock left by a sandbox limitation
rm -f .git/index.lock

# 2. Confirm housekeeping moves
ls adopted/substrate-plugin-staging-plan.md
ls archive/2026-05-09-stoic-agent-substrate-staging-plan-superseded.md
ls archive/2026-05-10-build-sessions-protocol-cache-draft-superseded.md
head -3 adopted/substrate-plugin-staging-plan.md
# Expected: third line reads "Adopted 2026-05-10 under D-STAGING-PLAN-ADOPTED-2026-05-10..."

# 3. Confirm governing-notes section in build-arc cache
grep -i -A 4 "no current users" adopted/build-sessions-protocol-cache.md
# Expected: paragraph beginning "No current users (affirmed 2026-05-10)..."

# 4. Confirm ADR exists
ls adopted/ADR-stoic-agent-substrate-concept.md
head -10 adopted/ADR-stoic-agent-substrate-concept.md
# Expected: title "ADR-stoic-agent-substrate-concept: The Three-Layer Stoic Agent Substrate"
# and Status line citing D-A1-LAYER2-AUTH-SCAFFOLD-2026-05-10

# 5. Confirm A1 scaffold (function defined, NOT invoked)
grep -n "checkPluginAuth\|PLUGIN_AUTH_ENABLED" website/src/app/api/reason/route.ts
# Expected: function definition at line ~199; flag declaration at line ~170;
# void references at lines ~270-271; inline doc-comment lines

# 5b. Confirm ZERO call sites
grep -nE "checkPluginAuth\(" website/src/app/api/reason/route.ts | grep -v ":function"
# Expected: ZERO output lines (the third grep filters out the function declaration itself)

# 6. Confirm feature flag in .env.example
grep -n "PLUGIN_AUTH_ENABLED" website/.env.example
# Expected: PLUGIN_AUTH_ENABLED=false declaration

# 7. Stage and commit (this session + predecessor session, one commit)
git add \
  adopted/substrate-plugin-staging-plan.md \
  adopted/build-sessions-protocol-cache.md \
  adopted/ADR-stoic-agent-substrate-concept.md \
  archive/2026-05-09-stoic-agent-substrate-staging-plan-superseded.md \
  archive/2026-05-10-build-sessions-protocol-cache-draft-superseded.md \
  drafts/substrate-plugin-staging-plan.md \
  drafts/stoic-agent-substrate-staging-plan.md \
  drafts/build-sessions-protocol-cache.md \
  website/src/app/api/reason/route.ts \
  website/.env.example \
  operations/decision-log.md \
  operations/handoffs/founder/2026-05-10-substrate-plugin-staging-close.md \
  operations/handoffs/founder/2026-05-10-stage-1-kickoff-NEXT-SESSION-PROMPT.md \
  operations/handoffs/founder/2026-05-10-stage-1-kickoff-close.md

git commit -m "Stage 1 kickoff: adopt staging plan; ADR-substrate-concept; A1 scaffold (not invoked)

Plan adoption housekeeping (Elevated):
- Move substrate-plugin-staging-plan from /drafts/ to /adopted/; status header updated to Adopted
- Archive predecessor staging plan (2026-05-09) to /archive/
- Archive predecessor build-arc-cache draft (2026-05-10) to /archive/
- Amend /adopted/build-sessions-protocol-cache.md in-place: add no-current-users governing note

ADR-substrate-concept (Standard):
- Create /adopted/ADR-stoic-agent-substrate-concept.md (Stage 1 item J1)
- Captures three-layer architecture, three-layer R20a defence, two-front-ends-one-substrate, moat boundary, consequences

A1 Layer 2 auth scaffold (Critical; PR1 single-endpoint proof on /api/reason):
- Add checkPluginAuth function and PLUGIN_AUTH_ENABLED feature flag to /api/reason/route.ts
- Function defined but NOT INVOKED (flag at false; no call sites)
- Create /website/.env.example documenting the flag and companion secret placeholder
- Critical Change Protocol writeup (six steps) recorded in D-A1-LAYER2-AUTH-SCAFFOLD-2026-05-10

Decision-log entries:
- D-STAGING-PLAN-ADOPTED-2026-05-10 (full form; eight founder decisions locked)
- D-BUILD-CACHE-DRIFT-RESOLVED-2026-05-10-NO-USERS (lean form)
- D-A1-LAYER2-AUTH-SCAFFOLD-2026-05-10 (full form per CCP)

Includes uncommitted predecessor-session files (staging close, this session prompt,
adopted build-sessions-protocol-cache, prior decision-log mods).

No deploy in this commit. Scaffold has zero runtime effect until PLUGIN_AUTH_ENABLED
is set to true AND an invocation site is added (next session)."
```

Then push via GitHub Desktop. **Vercel WILL redeploy** because `website/src/app/api/reason/route.ts` is in the build path. The redeploy is safe — the scaffold has zero runtime effect (function defined; not invoked; flag at `false`).

**After Vercel deploys, smoke-test `/api/reason` to confirm normal behaviour is unchanged:**

```bash
# Replace YOUR_SUPABASE_JWT with a current session token from the sagereasoning.com browser session
curl -X POST https://sagereasoning.com/api/reason \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_SUPABASE_JWT" \
  -d '{"input":"Should I respond to this email today or wait until tomorrow?","depth":"quick"}' \
  | head -c 400
```

Expected: a JSON response with `prose.philosophical_reflection`, `prose.improvement_guidance`, `prose.summary`, and `disclaimer` fields (the standard translation-sandwich-v1 shape per M1-CP6). If you see this shape, the scaffold has not regressed `/api/reason`. If you get a 401 / 500 / unexpected shape, **revert immediately** with:

```bash
git revert HEAD && git push origin main
```

…and report the output back at the next session open. This would indicate the scaffold accidentally engaged something it shouldn't have, which contradicts the in-session verification but is the conservative response.

---

## Orchestration Reminder

Per the standing cache and the build-arc cache: the next session's open block reads (1) the standing cache, (2) the build-arc cache, (3) this close, (4) the adopted staging plan §"Items in this stage" for Stage 1 A1 + A2, (5) the last 4 decision-log entries (the three from this session plus `D-BUILD-PLUGIN-STAGING-PLAN-DRAFTED-2026-05-10`), (6) the existing `/api/reason/route.ts` to see the scaffold in context, (7) the founder's election on the invocation-site option (per Open Question 1 above) before drafting the next-session prompt's Critical Change Protocol writeup.

The next session is **Critical-tier** by default (auth surface; PR6; AC7). Full templates apply.

---

## Cross-references

- Predecessor close: `/operations/handoffs/founder/2026-05-10-substrate-plugin-staging-close.md`
- This session's prompt: `/operations/handoffs/founder/2026-05-10-stage-1-kickoff-NEXT-SESSION-PROMPT.md`
- Adopted staging plan: `/adopted/substrate-plugin-staging-plan.md`
- ADR (J1): `/adopted/ADR-stoic-agent-substrate-concept.md`
- Build-arc cache (amended this session): `/adopted/build-sessions-protocol-cache.md`
- Standing protocol cache: `/adopted/standing-protocol-cache.md`
- Decision-log entries appended this session:
  - `D-STAGING-PLAN-ADOPTED-2026-05-10`
  - `D-BUILD-CACHE-DRIFT-RESOLVED-2026-05-10-NO-USERS`
  - `D-A1-LAYER2-AUTH-SCAFFOLD-2026-05-10`
- Companion canonical references:
  - `D-M1-CP6-CUTOVER-2026-05-08` (translation-sandwich substrate canonical at `/api/reason`)
  - `ADR-ENCRYPTION-WIRING-01` (encryption pattern Layer 2/3 protections inherit)
  - `ADR-RAG-MENTOR-ALT3-01-translation-sandwich-deterministic-engine` (Phase-1 translation-sandwich architecture)
- Code paths:
  - `/website/src/app/api/reason/route.ts` (A1 scaffold target — Critical surface)
  - `/website/.env.example` (created this session)
  - `/website/src/lib/security.ts` (existing dual-auth canonical reference; unchanged)
  - `/website/src/lib/translation-sandwich/parallel-run.ts` (Layer 1 + Layer 3 wiring; unchanged)

*End of session close. The build arc has crossed the threshold from planning to execution. Stage 1 A1 is scaffolded behind a feature flag set to off; founder approval requested for the scaffold commit only (not for deploy). Next session: A1 deploy + flag-flip + verification on `/api/reason`, completing the PR1 single-endpoint proof.*
