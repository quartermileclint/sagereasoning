# Next-Session Prompt — Stage 1 A1: Invocation Site + Flag-Flip + Verification (PR1 single-endpoint proof completion)

**Stream:** founder.
**Tier:** code-critical (auth-surface invocation site + flag-flip; full templates per standing cache).
**Governing frame:** `/adopted/standing-protocol-cache.md` + `/adopted/build-sessions-protocol-cache.md`.
**Predecessor session close:** `/operations/handoffs/founder/2026-05-10-stage-1-kickoff-close.md`.
**Predecessor decision-log entries:** `D-STAGING-PLAN-ADOPTED-2026-05-10`, `D-BUILD-CACHE-DRIFT-RESOLVED-2026-05-10-NO-USERS`, `D-A1-LAYER2-AUTH-SCAFFOLD-2026-05-10`.
**Risk classification:** Critical under 0d-ii (auth-surface invocation site change + deployment-configuration change at flag-flip). **Critical Change Protocol applies twice this session** — once for the invocation-site code change, once for the deploy + flag-flip. See Part B Steps 2 and 4.

---

## Founder verification received (2026-05-10)

Confirmed before this session begins:

1. **Both commits pushed to origin/main and confirmed by AI via `git fetch origin main`:**
   - `541a412` — Stage 1 kickoff: adopt staging plan; ADR-substrate-concept; A1 scaffold (not invoked)
   - `94bee25` — tsbuild (a small follow-up commit immediately after)
2. **Vercel built and deployed `94bee25` (green).** Vercel's normal "skip intermediate" behaviour meant `541a412` does not appear as its own deployment in the dashboard, and the GitHub commits page shows no green tick against `541a412` for the same reason. This is not a problem: `94bee25` contains all the code from `541a412` because git commits are sequential, and the Vercel deployment of `94bee25` therefore deployed everything from the Stage 1 kickoff session.
3. **Smoke test passed.** The founder signed in to sagereasoning.com, ran a Stoic Check on /ops-hub against a real business decision, and confirmed the standard three-paragraph translation-sandwich-v1 response (philosophical reflection + improvement guidance + summary). Zero regression from the A1 scaffold being on the box. This was the test specified in the predecessor session-close's "Founder Verification" block.
4. **The A1 scaffold is therefore live on production** with `PLUGIN_AUTH_ENABLED` at its default `false`. The `checkPluginAuth` function exists in the deployed code at `/website/src/app/api/reason/route.ts` (line ~199) but has zero call sites, so it has zero runtime effect on production traffic.
5. **Founder approved the scaffold commit per Critical Change Protocol step 6** of `D-A1-LAYER2-AUTH-SCAFFOLD-2026-05-10` by virtue of staging, committing, pushing, deploying, and verifying. No deploy-phase concerns surfaced.

The scaffold-phase Critical Change Protocol cycle is complete. This session opens the deploy-phase cycle.

---

## Founder governing note (still in force for the duration of the build arc)

Per the build-arc cache `/adopted/build-sessions-protocol-cache.md` §"Founder governing notes for the duration of the build arc": **No current users.** The Critical Change Protocol's step 3 ("What happens to existing sessions?") is moot for this session and may be answered "N/A — only founder + test logins exist; no third-party sessions to invalidate." All other Critical Change Protocol steps remain in full force.

---

## Why this session matters

This session completes the PR1 single-endpoint proof on `/api/reason` for Stage 1 item A1 (Layer 2 plugin-auth). Three things happen:

1. **Founder elects the invocation-site option** at session-open from the three named in `D-A1-LAYER2-AUTH-SCAFFOLD-2026-05-10` Open Question 1.
2. **Wire the invocation site** (Critical change; Critical Change Protocol writeup before the code change). The scaffolded `checkPluginAuth` function gets a call site such that flag-on plugin-auth traffic is actually authenticated.
3. **Provision the secret in Vercel + flip the flag + verify the three scenarios** (Critical change; Critical Change Protocol writeup before deploy/flip). After all three verification scenarios pass, A1 closes to **Verified** status — the PR1 single-endpoint proof is complete and the build arc unblocks A2 (Layer 2 input validation surface scaffolding) in the subsequent session.

If the session reaches the 4-hour budget before A1 reaches Verified, it closes at the most stable known point (typically: invocation site Wired but not flag-flipped; or flag-flipped but only one of three verification scenarios completed). The next session resumes from the documented stable point.

---

## Pre-conditions

1. Founder verification block above is true (both commits live; smoke test passed; scaffold present with flag at false on production).
2. Founder is ready to elect the invocation-site option at session-open from the three named in the A1 decision-log entry. AI presents trade-offs on request before the founder elects.
3. Founder has access to Vercel project settings (Settings → Environment Variables → Production). The secret provisioning is a founder action; AI cannot do it.
4. Founder is ready for two Critical Change Protocol writeups in this session (one before the invocation-site code change; one before deploy + flag-flip).
5. Founder blocks 3.5–4 hours.

---

## Part A — Open under the protocol

Read in order:

1. `/adopted/standing-protocol-cache.md` (~3 min — confirms tier, model selection, risk class, signals; cites the Critical-risk sessions section as pointer for full-template discipline)
2. `/adopted/build-sessions-protocol-cache.md` (~3 min — build-arc context; confirm the no-current-users governing note still in force)
3. `/operations/handoffs/founder/2026-05-10-stage-1-kickoff-close.md` (~5 min — predecessor close)
4. Last 4 decision-log entries — read these in full because they contain the architectural anchor (J1 ADR adoption is recorded in D-A1-LAYER2-AUTH-SCAFFOLD; the eight founder decisions are in D-STAGING-PLAN-ADOPTED; the no-current-users governing note is in D-BUILD-CACHE-DRIFT-RESOLVED-NO-USERS; the predecessor staging-plan adoption context is in D-BUILD-PLUGIN-STAGING-PLAN-DRAFTED):
   - `D-A1-LAYER2-AUTH-SCAFFOLD-2026-05-10` (most recent — contains the scaffold details, the three invocation-site options, and the Critical Change Protocol writeup that just completed)
   - `D-BUILD-CACHE-DRIFT-RESOLVED-2026-05-10-NO-USERS`
   - `D-STAGING-PLAN-ADOPTED-2026-05-10`
   - `D-BUILD-PLUGIN-STAGING-PLAN-DRAFTED-2026-05-10`
5. `/adopted/substrate-plugin-staging-plan.md` §"Stage 1 — Backend foundations" (especially the Items table: A1 + A2 rows; success criteria; risk profile)
6. `/adopted/ADR-stoic-agent-substrate-concept.md` (~5 min — the architectural anchor adopted in the predecessor session)
7. `/website/src/app/api/reason/route.ts` — read in full to see the scaffold (lines ~127–273) + the existing dual-auth pattern (lines ~129–134) in their actual position. The invocation site decision depends on understanding both.
8. `/website/src/lib/security.ts` (the `requireAuth` and `validateApiKey` functions; the existing dual-auth canonical reference per KG4)
9. `/website/.env.example` (the flag and secret declarations)

Confirm at open: tier (code-critical); hold-point status (P0 0h still active; substrate work happens alongside); model selection (N/A this session — no LLM calls in any step); status vocabulary; signals; risk class; build-arc Rule A applicability (no — this session does not produce public artefacts); Rule B applicability (no — this is execution, not planning); the no-current-users governing note (acknowledged before any Critical work begins).

---

## Part B — Procedure

### Step 1 — Founder elects invocation-site option (~15 min, governance)

Three options recorded in `D-A1-LAYER2-AUTH-SCAFFOLD-2026-05-10` Open Question 1:

**(a) Extend the existing 401 branch.** Inside the existing `if (auth.error && (!apiKey || !apiKey.valid))` block, before returning `auth.error`, also check `checkPluginAuth(request)` if `PLUGIN_AUTH_ENABLED` is true. On valid plugin-auth, treat the request as authenticated (no `auth.user` available; `practitionerContext` resolves to null exactly as for API-key callers).

**(b) Add a third precedence tier checked first.** Before `requireAuth`, if `PLUGIN_AUTH_ENABLED` is true and the `X-Plugin-Auth` header is present, run `checkPluginAuth` first. If valid, skip user-auth and API-key checks. If invalid, fall through to user-auth + API-key (so a malformed plugin-auth attempt does not lock out a user with valid Supabase JWT).

**(c) Fully separate plugin-auth into a pre-handler middleware.** Extract authentication into a single helper (`authenticateRequest`) that tries plugin-auth → API-key → user-auth in precedence order and returns a unified `AuthenticatedCaller` shape. Replace the current dual-auth block with one call.

AI presents trade-offs at session-open if requested. Founder elects. Decision recorded inline in `D-A1-INVOCATION-SITE-2026-MM-DD` (Step 6).

**Recommendation default if founder defers:** Option (a). Lowest blast radius (the only branch touched is the existing 401 branch); preserves the current code shape; PR1 single-endpoint proof discipline strongest. Options (b) and (c) are better long-term shapes but introduce more surface in this single session and are better deferred to A2 or a subsequent dedicated refactor.

### Step 2 — Wire the invocation site (~1.5 hr, **Critical**)

Per the elected option. **The full Critical Change Protocol writeup goes inline in the response BEFORE any code change.** Six steps named explicitly:

1. What is changing (plain language)
2. What could break (worst case named)
3. What happens to existing sessions — **"N/A — only founder + test logins exist; no third-party sessions to invalidate"** per the governing note
4. Rollback plan (exact `git revert` + flag-off path)
5. Verification step (the post-deploy curl commands in Step 5)
6. Explicit founder approval requested specific to the named risks

**PR1 single-endpoint proof discipline:** the invocation site is added on `/api/reason` only. No other route file touched.

**Risk class:** Critical (PR6 + AC7 + AC4). AC4 fully engages here because the function will actually run in production once deployed and the flag is on; AC4's "invocation testing for safety functions" requires the post-deploy verification (Step 5) to confirm the function is actually being called.

### Step 3 — Founder provisions `PLUGIN_AUTH_SECRET` in Vercel (~15 min, founder action)

AI generates the secret value via `openssl rand -hex 32` (a 64-character hex string; cryptographically strong). Founder action sequence:

1. Vercel dashboard → sagereasoning project → Settings → Environment Variables.
2. Add new variable. Name: `PLUGIN_AUTH_SECRET`. Value: paste the AI-generated string. Environment: tick **Production** (and Preview + Development if desired for parity, but Production is the only one that matters for the verification).
3. Save.
4. Copy the same value to `/website/.env.local` as `PLUGIN_AUTH_SECRET=<value>` for local-dev parity. **Do NOT commit** — `.env.local` is in `.gitignore`.

`PLUGIN_AUTH_ENABLED` is **not** set in Vercel yet — that's Step 4.

### Step 4 — Deploy + flag-flip (~30 min, **Critical**)

**The full Critical Change Protocol writeup goes inline in the response BEFORE the deploy/flip.** Six steps. Step 3 = "N/A — only founder + test logins exist; no third-party sessions to invalidate."

Sequence:

1. Founder commits the invocation-site change locally + pushes via GitHub Desktop.
2. Vercel redeploys the new code (the invocation site is now live but the flag is still unset → effectively `false` → `checkPluginAuth` is still not called).
3. Founder runs **smoke test 1 (regression check)**: any reasoning surface still works as before. AI provides curl + browser test instructions. Expected: identical behaviour to today (zero regression).
4. Founder sets `PLUGIN_AUTH_ENABLED=true` in Vercel → Settings → Environment Variables → Production. Saves.
5. Vercel redeploys with the flag on. Plugin-auth path is now live.
6. Proceed to Step 5 verification.

**Rollback at any moment:** set `PLUGIN_AUTH_ENABLED` back to `false` (or remove it entirely) in Vercel and trigger a redeploy. The function remains in code but is never called. Effectively a no-op deploy.

### Step 5 — Post-deploy verification (~30 min, governance)

Three scenarios. AI provides exact curl commands; founder runs them; AI interprets responses.

**Scenario 1 — Plugin-auth path with valid secret returns 200.**
```bash
curl -X POST https://sagereasoning.com/api/reason \
  -H "Content-Type: application/json" \
  -H "X-Plugin-Auth: <the_PLUGIN_AUTH_SECRET_value>" \
  -d '{"input":"Test plugin-auth path","depth":"quick"}' | head -c 400
```
Expected: 200 with the standard translation-sandwich-v1 response shape.

**Scenario 2 — Plugin-auth path with invalid secret returns 401 (when no fallback to user-auth/API-key is intended; depends on the elected option).**
```bash
curl -X POST https://sagereasoning.com/api/reason \
  -H "Content-Type: application/json" \
  -H "X-Plugin-Auth: WRONG-SECRET-VALUE" \
  -d '{"input":"Test invalid plugin-auth","depth":"quick"}' | head -c 400
```
Expected: depends on elected option. (a) and (c) → 401 with `"Plugin authentication failed"`. (b) → falls through to user-auth → 401 with `"Authentication required. Please sign in."` (because no JWT either).

**Scenario 3 — Existing user-auth path still returns 200 (the proof that the invocation site does not regress existing traffic).**
```bash
# In a browser signed in to sagereasoning.com, run a Stoic Check on /ops-hub.
# Expected: identical behaviour to today.
```
Expected: standard three-paragraph translation-sandwich-v1 response — zero regression.

If all three pass, A1 reaches **Verified** status. If any fails, **immediately set `PLUGIN_AUTH_ENABLED=false` in Vercel** and report the response back; AI diagnoses and decides whether to revert the code change too.

### Step 6 — Append decision-log entries (~30 min, full form for both)

Two entries (both Critical-tier):

1. **`D-A1-INVOCATION-SITE-2026-MM-DD`** — full form. Records: the elected invocation-site option with the trade-off reasoning the founder accepted; the Critical Change Protocol writeup (six steps); the code change in detail; PR1 + PR6 + AC4 + AC7 engagement; rollback path; in-session verification (the smoke test from Step 4 sub-step 3).

2. **`D-A1-FLAG-FLIP-VERIFIED-2026-MM-DD`** — full form. Records: the deploy + flag-flip as a Critical change; the Critical Change Protocol writeup (six steps); the three verification scenarios with their actual responses; A1 status moves to **Verified**; PR1 single-endpoint proof complete on `/api/reason`. Cross-references to `D-A1-LAYER2-AUTH-SCAFFOLD-2026-05-10` (scaffold predecessor) and `D-A1-INVOCATION-SITE-2026-MM-DD` (this session's predecessor entry).

Pattern: full form per the standing cache "Critical-risk sessions" section and the existing Critical entries in the active log.

### Step 7 — Session close (full form)

Save to `/operations/handoffs/founder/2026-MM-DD-stage-1-a1-verified-close.md`. Pattern: full session-close form per the project instructions 0c-ii including the additional sections (Verification Method Used, Risk Classification Record, PR5 Knowledge-Gap Carry-Forward, Founder Verification Between Sessions, Orchestration Reminder).

The close's "Next Session Should" block names: **A2 Layer 2 input validation surface scaffolding** (Elevated risk; per staging plan Session 3 packaging — A2 partial scaffolding alongside any A1 follow-on hygiene).

---

## Part C — Anticipated session shape

| Phase | Estimate | Tier |
|---|---|---|
| Caches + predecessor close + ADR + decision-log + route file reads | 20–25 min | governance |
| Step 1 — invocation-site option election | 15 min | governance |
| Step 2 — wire invocation site (CCP writeup + code change) | 1.5 hr | **Critical** |
| Step 3 — founder provisions secret in Vercel | 15 min | founder action |
| Step 4 — deploy + flag-flip (CCP writeup + Vercel actions) | 30 min | **Critical** |
| Step 5 — post-deploy verification (three scenarios) | 30 min | governance |
| Step 6 — two decision-log entries (both full form) | 30 min | governance |
| Step 7 — full-form session close | 30 min | governance |
| **Total** | **~4.25 hr** | **Critical (set by Steps 2 + 4)** |

If the session runs to 4 hours before A1 reaches Verified, close at the most stable known point per the time-bounded session discipline. Documented stable points:

- After Step 2, before Step 3: invocation site Wired but not deployed. Rollback = `git revert`.
- After Step 4, before Step 5: flag-flipped but verification incomplete. Rollback = set `PLUGIN_AUTH_ENABLED=false` in Vercel → redeploy.
- After Step 5 partial: name which scenario(s) passed and which remain. Rollback as above.

---

## Critical Change Protocol pointer

The full protocol lives in `/adopted/standing-protocol-cache.md` §"Critical-risk sessions" and in the project instructions §0c-ii. **Do not abbreviate.** Two writeups in this session: one before the invocation-site code change (Step 2); one before the deploy + flag-flip (Step 4). Each names all six steps explicitly:

1. What is changing — plain language, no jargon
2. What could break — specific worst case
3. What happens to existing sessions — **"N/A — only founder + test logins exist; no third-party sessions to invalidate"** per the governing note
4. Rollback plan — exact founder-performable steps
5. Verification step — the curl commands in Step 5 (or, for Step 2's writeup, the in-session smoke test in Step 4 sub-step 3)
6. Explicit approval — founder says "go ahead" specific to named risks

---

## Rollback path

- **Step 2 (invocation site):** `git revert <invocation-commit-hash>` and push. Vercel redeploys the prior code (scaffold present but not invoked). Rollback time ≤5 min after Vercel redeploy.
- **Step 4 (flag-flip):** Set `PLUGIN_AUTH_ENABLED=false` (or remove) in Vercel → Settings → Environment Variables → Production → Save → trigger redeploy. Rollback time ≤5 min after Vercel redeploy. The code remains; the flag-off state is the rollback.
- **Combined catastrophic rollback:** Both of the above in sequence. The site returns to today's exact production state.

---

## Forecast

**Most-likely path:** Step 1 election lands quickly (founder defers to AI's recommendation if pressed for time → Option (a)). Step 2 wiring is small (~30 min code change inside the existing 401 branch under Option (a); larger under (b) or (c)). Step 3 secret provisioning takes ~5 min once the founder is in Vercel. Step 4 deploy + flag-flip lands cleanly. Step 5 all three scenarios pass on first attempt. Steps 6 + 7 close the session at ~4 hours total. A1 reaches Verified.

**Possible variations:**
- Step 2 surfaces an unanticipated coupling with the existing CORS / rate-limit / continuation-token surface; budget extends; Steps 3–5 may push to a follow-up session. Acceptable per PR1 — single-endpoint proof completion can span sessions.
- Founder elects Option (b) or (c) → Step 2 budget extends by ~30 min; total session ~4.5 hr. Acceptable; close at 4-hour budget if needed.
- Vercel propagation delay causes Scenario 1 or 2 to fail intermittently. Re-run after 1–2 minutes; if still failing, this is a real bug — investigate.
- Scenario 2's expected behaviour differs from elected option's actual behaviour. If the response is unexpected but reasonable, document and decide whether to accept or amend the elected option. Critical Change Protocol applies to any amendment.

**What success looks like at session close:**

- Invocation site wired in `/website/src/app/api/reason/route.ts` per the elected option.
- `PLUGIN_AUTH_SECRET` provisioned in Vercel Production.
- `PLUGIN_AUTH_ENABLED=true` in Vercel Production.
- All three verification scenarios passed.
- A1 status = **Verified** (final cell of the implementation-status taxonomy for this item).
- Two full-form decision-log entries appended (`D-A1-INVOCATION-SITE` + `D-A1-FLAG-FLIP-VERIFIED`).
- Full-form session close at `/operations/handoffs/founder/2026-MM-DD-stage-1-a1-verified-close.md`.
- Next session named: **A2 Layer 2 input validation surface scaffolding** (Elevated risk; ~3 hr).

End of prompt.
