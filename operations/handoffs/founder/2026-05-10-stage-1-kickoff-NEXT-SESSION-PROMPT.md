# Next-Session Prompt — Stage 1 Kickoff: Plan Adoption + ADR-Substrate-Concept + A1 Layer 2 Auth Scaffolding

**Stream:** founder.
**Tier:** code-critical (A1 touches authentication; full templates per standing cache).
**Governing frame:** `/adopted/standing-protocol-cache.md` + `/adopted/build-sessions-protocol-cache.md`.
**Predecessor session close:** `/operations/handoffs/founder/2026-05-10-substrate-plugin-staging-close.md`.
**Predecessor decision-log entries:** `D-BUILD-SESSIONS-CACHE-ADOPTED-2026-05-10`, `D-BUILD-PLUGIN-STAGING-PLAN-DRAFTED-2026-05-10`.
**Risk classification:** Critical under 0d-ii (A1 auth surface). **Critical Change Protocol applies** to A1 — see Step 3 below. Plan-adoption housekeeping (Step 1) and ADR drafting (Step 2) are Elevated/Standard respectively; the highest-risk step (Step 3) sets the session's overall tier per standing-cache rule.

---

## Founder decisions locked at session-open (do not re-debate)

The eight open questions surfaced in the staging plan have been answered by the founder between sessions. The next session inherits these as already-decided:

| # | Question | Founder decision | Effect on this session |
|---|---|---|---|
| 1 | Plugin variant strategy (C8) | **As recommended:** single configurable plugin with mode parameter for the first marketplace listing; revisit family-strategy after first-listing telemetry | No effect on Session 1 (Stage 3 concern); applied at Stage 3 start |
| 2 | Repository structure (B4) | **Substrate-as-package** | Applied at Stage 3 start; informs Stage 1's A8 endpoint mapping (each future endpoint is consumable as a package import) |
| 3 | First marketplace target (G1) | **Claude Cowork marketplace** | Applied at Stage 4 start; Stage 1 + 2 + 3 work feeds packaging for this target |
| 4 | Lawyer engagement timing | **As recommended:** kick off at Stage 3 start so review is queued in parallel | No action this session; founder action item later in the arc |
| 5 | Tier 3 (R20a perimeter) migration sequencing approach | **Resolve D24 findings during migration** — not critical at this time with no users | Applied at K3 sequencing; Stage 2 sessions carry resolution as part of migration |
| 6 | Cost-shape acceptance for migrated website endpoints (K5) | **Cost and pricing examined immediately before Stage 4** (deferred from K5 in-Stage-2) | Stage 2 proceeds without per-route cost-acceptance gating; pre-Stage-4 cost-and-pricing session inserted |
| 7 | Plugin economics tariff (G6) | **Decided when cost and pricing are examined immediately before Stage 4** (same session as #6) | Combined with #6 into a single pre-Stage-4 cost-and-pricing session |
| 8 | Trust signalling specifics (I5) | **As recommended:** limitations page link, R18 honest-certification language, security review status | No action this session; applied at Stage 4 |

These decisions are recorded in the decision-log entry produced this session (Step 5).

---

## Founder governing note — no current users

**Affirmed by the founder on 2026-05-10:** "No current users will be affected by build as there is only my login and testing logins so don't build around preserving access or service to existing users."

**Effect on the build arc:** the Critical Change Protocol's question "What happens to existing sessions?" (0c-ii step 3) is **moot for the duration of the build arc** — the only sessions are the founder's own login and known test logins. This materially reduces the friction of Critical-tier work without weakening any other Critical Change Protocol step. The other five steps (what is changing; what could break; rollback plan; verification step; explicit approval) remain in full force.

**Operational implication:** Critical Change Protocol writeups in this arc may say "step 3: N/A — only founder + test logins exist; no third-party sessions to invalidate" without further elaboration. This is a build-arc-wide simplification, not a global one — when the plugin ships and external users exist, the simplification ends and step 3 returns to full force.

**Bookkeeping:** this session adds the governing note to the build-arc cache (`/adopted/build-sessions-protocol-cache.md`) as a small in-session amendment per the cache's own update discipline. The amendment is logged via `D-BUILD-CACHE-DRIFT-RESOLVED-2026-05-10-NO-USERS` (lean form).

---

## Why this session matters

This is the first execution session of the substrate-as-plugin build arc. Three things happen:

1. **Plan adoption housekeeping** — move the staging plan from `/drafts/` to `/adopted/`, archive the predecessor staging plan, record the eight founder decisions and the no-current-users governing note. This is the threshold the build arc crosses to leave planning and enter execution.

2. **ADR-substrate-concept (J1)** — the first ADR captures the substrate's three-layer architecture, moat boundaries, and structural role. It is the anchor document every subsequent build session can cite without re-explaining the architecture.

3. **A1 Layer 2 auth scaffolding (PR1 single-endpoint proof)** — Critical-tier work. Scaffolds the authentication surface for plugin-originated calls on a single endpoint first, with the dual-auth pattern (KG4) as the canonical reference. Full Critical Change Protocol applies. The single endpoint chosen for the proof is `/api/reason` because it is already on the translation-sandwich substrate (per M1-CP6 cutover 2026-05-08) and the dual-auth pattern is canonical there.

The session is time-bounded at ~3.5–4 hours per the holistic-pass session-shape discipline. A1 may not reach Verified in this session — that is acceptable; A1 may span multiple sessions, with this session bringing it to Scaffolded or Wired and the subsequent session(s) bringing it to Verified.

---

## Pre-conditions

1. Founder has reviewed and approved the staging plan (confirmed at the close of the planning session)
2. Founder decisions on the eight open questions captured at the top of this prompt
3. Founder has read the predecessor close (`/operations/handoffs/founder/2026-05-10-substrate-plugin-staging-close.md`)
4. Founder has run the git commit from the predecessor close's Founder Verification block before opening this session (so the working tree is clean)
5. Founder is ready for a Critical-tier session — block 3.5–4 hours; expect Critical Change Protocol writeup before A1 deployment is requested

---

## Part A — Open under the protocol

Read in order:

1. `/adopted/standing-protocol-cache.md` (~3 min — confirms tier, model selection, risk class, signals; cites the Critical-risk sessions section as pointer for Step 3)
2. `/adopted/build-sessions-protocol-cache.md` (~3 min — build-arc context; the no-current-users governing note will be added to this cache during Step 1)
3. `/operations/handoffs/founder/2026-05-10-substrate-plugin-staging-close.md` (~5 min — predecessor close)
4. `/adopted/substrate-plugin-staging-plan.md` once moved (Stages 1–3 sections in detail; Stage 1 §"Items in this stage" maps the work for this and subsequent sessions)
5. `/operations/decision-log.md` last 4 entries (the two from 2026-05-10 plus the M1-CP6 cutover and the consumer-page adaptation)
6. **For Step 3 specifically (A1):** the Layer 2 design notes in the predecessor staging plan and the existing `/api/reason` route handler at `/website/src/app/api/reason/route.ts` (the canonical dual-auth pattern reference per KG4)

Confirm at open: tier (code-critical); hold-point status (P0 0h still active; substrate work happens alongside, not after); model selection (Step 1 + 2 are documentation — N/A; Step 3 has no LLM calls — N/A); status vocabulary; signals; risk class; build-arc Rule A applicability (no — this session does not produce public artefacts); Rule B applicability (no — this is execution, not planning); the no-current-users governing note (acknowledged before Step 3 begins).

---

## Part B — Procedure

### Step 1 — Plan adoption housekeeping (~30 min, Elevated)

Three sub-tasks:

**1a. Move the staging plan from `/drafts/` to `/adopted/`.**

```
cd "/Users/clintonaitkenhead/Claude-work/PROJECTS/sagereasoning"
git mv drafts/substrate-plugin-staging-plan.md adopted/substrate-plugin-staging-plan.md
```

Then update the status header in `/adopted/substrate-plugin-staging-plan.md` to read:

```
**Status:** Adopted 2026-05-10 under `D-STAGING-PLAN-ADOPTED-2026-05-10`. Founder approved with eight open questions answered (see decision-log entry). Governing for every execution session in the build arc.
```

(The line currently reads `**Status:** Draft. Created 2026-05-10...` — replace it.)

**1b. Archive the predecessor staging plan.**

The predecessor `/drafts/stoic-agent-substrate-staging-plan.md` was scoped against an earlier architecture and is superseded by the adopted plan. Move it to `/archive/`:

```
git mv drafts/stoic-agent-substrate-staging-plan.md archive/2026-05-09-stoic-agent-substrate-staging-plan-superseded.md
```

(If `/archive/` does not exist, create it first via `mkdir -p archive`.)

**1c. Archive the predecessor build-cache draft.**

The `/drafts/build-sessions-protocol-cache.md` was preserved in place during the planning session because deletion was permission-gated. Now is the moment to clean up. Move it to `/archive/`:

```
git mv drafts/build-sessions-protocol-cache.md archive/2026-05-10-build-sessions-protocol-cache-draft-superseded.md
```

**1d. Update the build-arc cache with the no-current-users governing note.**

Add a new section to `/adopted/build-sessions-protocol-cache.md` after the "Product migration intent — the K-category" section, titled "Founder governing notes for the duration of the build arc." Body:

> **No current users (affirmed 2026-05-10).** The only logins are the founder's and known test logins. The Critical Change Protocol's step 3 ("What happens to existing sessions?") is moot for the build arc and may be answered "N/A — only founder + test logins exist; no third-party sessions to invalidate." All other Critical Change Protocol steps remain in full force. When the plugin ships and external users exist, this simplification ends.

Risk class for Step 1: Elevated (file moves between `/drafts/`, `/adopted/`, `/archive/`; one in-place edit to an `/adopted/` cache file). Sub-task 1d is an in-session amendment to the build-arc cache per the cache's own update discipline.

### Step 2 — ADR-substrate-concept (J1) (~45 min, Standard)

Create `/adopted/ADR-stoic-agent-substrate-concept.md` capturing:

- Context — the substrate's purpose (principled reasoning accessible to every rational agent — human and artificial); the architectural problem the substrate solves (consistent, auditable, R20a-protected reasoning across human and agent front-ends)
- Decision — the three-layer architecture: Layer 1 (text → structured features, open-sourced), Layer 2 (deterministic mechanism application, closed and server-side), Layer 3 (prose generation, closed and server-side); the moat sits jointly on Layer 2 + Layer 3
- Three-layer R20a defence — Layer A (in-plugin script, fast local), Layer B (server-side gate at Layer 2 ingress), Layer C (Layer 3 deterministic injection of the distress pass-through statement)
- Two front-ends, one substrate — `sagereasoning.com` for humans, plugins for agents, both calling the same Layer 2 + Layer 3 backend
- Consequences — what this enables (consistent reasoning across audiences; trust-signalable certification; standards-formation potential for the Layer 1 input contract); what this requires (signing infrastructure; key management; cost-monitoring on the new path; per-consumer migration of existing bundled-prose endpoints)
- Cross-references — the eight 2026-05-10 decisions; the staging plan; the build-arc cache; the predecessor close

Risk class: Standard. Use the full ADR template per the engineering:architecture skill if it provides one; otherwise mirror the ADR-RAG-MENTOR-ALT3-01 file structure already in `/adopted/`.

### Step 3 — A1 Layer 2 auth scaffolding (PR1 single-endpoint proof) (~2 hr, **Critical**)

This is the Critical-tier work. The full Critical Change Protocol applies before the founder is asked to deploy. Per the standing cache "Critical-risk sessions" section, this session uses the **full templates**, not the lean ones, for any close artefact that touches Step 3.

**Single-endpoint proof target:** `/api/reason` (already on translation-sandwich per M1-CP6; canonical dual-auth pattern per KG4).

**Scope of this step:**

- Design the Layer 2 authentication surface for plugin-originated calls (in addition to existing user-auth)
- Identify the dual-auth pattern's extension points: the existing user-auth check + the new plugin-auth check
- Scaffold the new plugin-auth check inside `/api/reason` — function-only, not yet invoked, behind a feature flag set to off
- Produce the Critical Change Protocol writeup (six steps, fully named) covering: what is changing; what could break; what happens to existing sessions ("N/A — only founder + test logins exist; no third-party sessions to invalidate" per the governing note); rollback plan; verification step; explicit approval requested
- **Do not deploy in this session.** Step 3 closes at "scaffolded behind feature flag set to off; CCP writeup complete; founder approval pending"
- The deploy + flag-flip + verification sequence happens in the next session per PR1 (single-endpoint proof discipline; verify on `/api/reason` before any rollout)

Risk class for Step 3: Critical. PR1 + PR4 + PR6 (when the auth check engages) + AC7 (auth-surface change). Constrains.ts type guards apply where the new plugin-auth check produces an authenticated payload.

### Step 4 — Verify (~15 min)

Founder-performable verification within the session (does not require deploy):

```
cd "/Users/clintonaitkenhead/Claude-work/PROJECTS/sagereasoning"

# Verify housekeeping
ls adopted/substrate-plugin-staging-plan.md
ls archive/2026-05-09-stoic-agent-substrate-staging-plan-superseded.md
ls archive/2026-05-10-build-sessions-protocol-cache-draft-superseded.md
head -3 adopted/substrate-plugin-staging-plan.md   # confirms Adopted status
grep -A 4 "no-current-users" adopted/build-sessions-protocol-cache.md   # confirms governing note added (case-insensitive grep)
ls adopted/ADR-stoic-agent-substrate-concept.md
head -10 adopted/ADR-stoic-agent-substrate-concept.md   # confirms ADR

# Verify A1 scaffold (function present, not invoked)
grep -n "plugin.*auth\|pluginAuth\|PLUGIN_AUTH_ENABLED" website/src/app/api/reason/route.ts | head -10

# Verify feature flag exists and defaults to off
grep -n "PLUGIN_AUTH_ENABLED" website/.env.example
```

Expected:
- Staging plan in `/adopted/` with Adopted status header
- Predecessor drafts in `/archive/` with date-prefixed names
- Build-arc cache contains the governing note
- ADR file created
- A1 scaffold function present in `/api/reason/route.ts` but not invoked (no callers); feature flag declared and defaults to off

### Step 5 — Append decision-log entries (full form, since touching Critical work)

Three entries:

1. **D-STAGING-PLAN-ADOPTED-2026-05-10** — full form. Records the move from `/drafts/` to `/adopted/`; cites the eight founder decisions; cites the no-current-users governing note; marks the staging plan as the operative reference for the rest of the arc.
2. **D-BUILD-CACHE-DRIFT-RESOLVED-2026-05-10-NO-USERS** — lean form. Records the addition of the governing note to the build-arc cache.
3. **D-A1-LAYER2-AUTH-SCAFFOLD-2026-05-10** — full form per Critical Change Protocol. Records what was scaffolded; what the CCP writeup said in each of six steps; that deploy + flag-flip + verification are deferred to the next session per PR1 discipline. References the J1 ADR and the staging plan's Stage 1 success criteria.

Pattern reference: `/adopted/standing-protocol-cache.md` §"Critical-risk sessions" (which keeps the full templates) and the existing `/operations/decision-log.md` Critical entries for shape.

### Step 6 — Session close (full form, since Critical work present)

Save to `/operations/handoffs/founder/2026-05-10-stage-1-kickoff-close.md`. Pattern: the full session-close form per the project instructions 0c-ii, including the additional sections (Verification Method Used, Risk Classification Record, PR5 Knowledge-Gap Carry-Forward, Founder Verification Between Sessions, Orchestration Reminder).

The close's "Next Session Should" block names: A1 deploy + flag-flip + verification on `/api/reason` (PR1 single-endpoint proof completion) → A2 input validation surface scaffolding once A1 reaches Verified.

---

## Part C — Anticipated session shape

| Phase | Estimate | Tier |
|---|---|---|
| Caches + predecessor close + plan reads | 15–20 min | governance |
| Step 1 — plan adoption housekeeping | 30 min | Elevated |
| Step 2 — ADR-substrate-concept | 45 min | Standard |
| Step 3 — A1 Layer 2 auth scaffolding (PR1 single-endpoint proof) + CCP writeup | 2 hr | **Critical** |
| Step 4 — verify (in-session) | 15 min | governance |
| Step 5 — decision-log entries (full form for the two Critical entries; lean for the cache-drift) | 30 min | governance |
| Step 6 — session close (full form) | 30 min | governance |
| **Total** | **~4 hr** | **Critical (set by Step 3)** |

If the session runs to 4 hours before Step 3 reaches "scaffolded behind feature flag" status, close at the time budget per the time-bounded session discipline. The close names what's complete and what's next. The next session resumes Step 3 from where it left off.

---

## Critical Change Protocol pointer

The full protocol lives in `/adopted/standing-protocol-cache.md` §"Critical-risk sessions" and in the project instructions §0c-ii. **Do not abbreviate.** Step 3's CCP writeup names all six steps explicitly:

1. What is changing — plain language, no jargon
2. What could break — specific worst case
3. What happens to existing sessions — **"N/A — only founder + test logins exist; no third-party sessions to invalidate"** per the governing note
4. Rollback plan — exact steps the founder can perform; in this case, since the scaffold is behind a feature flag set to off, rollback is "leave the flag off" plus optionally `git revert` the scaffold commit
5. Verification step — what the founder checks after the deploy + flag-flip; URLs, expected results, what to do if different
6. Explicit approval — the founder says "OK" or "go ahead" specific to the named risks

Because deploy is **not** in this session's scope (deferred to the next session per PR1), step 6's explicit approval is requested **for the scaffold commit** in this session, not for the deploy. Deploy approval is a separate explicit-approval moment in the next session after CCP review of any post-scaffold-discovered risks.

---

## Rollback path

- Step 1 (housekeeping): `git revert` the housekeeping commit; the moves are undone, files return to `/drafts/`
- Step 2 (ADR): `git rm adopted/ADR-stoic-agent-substrate-concept.md` and revert
- Step 3 (A1 scaffold): the scaffold is behind a feature flag set to off; even if deployed (which this session does not do), the flag-off state is the rollback. For the scaffold commit itself: `git revert` of the scaffold commit
- Decision-log entries: revertible via git; the entries are append-only so revert removes the new lines without affecting prior entries

---

## Forecast

Most-likely path: Step 1 lands clean (5 file moves, 1 in-place cache edit). Step 2 lands clean (ADR-substrate-concept is well-precedented). Step 3 reaches "scaffolded behind feature flag set to off; CCP writeup complete; founder approval requested for scaffold commit only" within the 2-hour budget. Session close at ~4 hours total.

Possible variations:
- A1 design surfaces an unanticipated coupling with the existing user-auth check; Step 3 budget extends and Steps 5/6 compress into the close. Acceptable.
- The dual-auth pattern requires constraints.ts amendments to type-enforce the plugin-auth payload; treat as in-scope and budget the constraint addition into Step 3. The Critical Change Protocol writeup includes the constraints.ts addition as an additional change.
- The founder elects to deploy the scaffold in this session (flag still off) so the next session can start with deploy verification rather than scaffold deployment. Acceptable per PR1 (the proof is the flag-on verification, which can happen in any session after scaffold is deployed). The CCP writeup adjusts step 6 to request deploy approval rather than just scaffold-commit approval.

What success looks like at session close:
- Staging plan is at `/adopted/substrate-plugin-staging-plan.md`, predecessor drafts in `/archive/`
- ADR-stoic-agent-substrate-concept.md adopted
- Build-arc cache amended with the no-current-users governing note
- A1 plugin-auth check scaffolded behind feature flag in `/api/reason/route.ts`; CCP writeup complete; founder approval recorded for the scaffold commit
- Three decision-log entries appended (two full-form for Critical, one lean for cache drift)
- Full-form session close at `/operations/handoffs/founder/2026-05-10-stage-1-kickoff-close.md`
- Next session named: A1 deploy + flag-flip + verification

End of prompt.
