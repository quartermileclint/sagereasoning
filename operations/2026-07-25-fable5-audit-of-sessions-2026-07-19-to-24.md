# Fable-5 Audit — Sessions of 2026-07-19 → 2026-07-24

**Date:** 2026-07-25 · **Auditor:** Claude Fable 5 (first Fable session since 2026-07-19 08:10) · **Requested by:** the founder.

**Brief:** audit the lesser-model sessions since 2026-07-19 for (1) thoroughness/technical merit of code written, (2) adversarial-review integrity — the spend-limit-death → first-hand-fallback pattern, and whether anything first-hand-only is now live unre-reviewed, (3) in-session deferrals silently dropped or accepted-as-done unverified, (4) the week's session reflections — repeated findings and process incorporations, (5) recommendations for what to proceed with next.

**Method:** commit-by-commit model attribution (git trailers); full diff inventory since Fable's last commit (`79b0677` — 2,799 insertions across 43 files); first-hand Fable code review of every load-bearing surface; three parallel verification agents (mentor-route wiring + batteries; password-reset fix verification; deferral sweep); extraction and analysis of all 20 Sage Reflect close-turns from the local session transcripts; cross-checks of every dropped-item candidate against the living artifacts.

**Honest limits:** this is itself a single-reviewer audit (one Fable session + its three subagents). Live env values (Vercel flags, applied SQL) are verified only where a repo-side or founder-recorded artifact attests them. Worktree branches (`agent-org-tech/-ops/-growth`) were not code-audited (config-only diffs).

---

## §0a Executive summary

**The code the lesser models wrote is mostly genuinely good — the failures are in review coverage and follow-through, not raw technical merit, with one exception.** The P-GL builds (the week's largest diff, live in production) survive Fable-level adversarial reading cleanly: the standing lessons (PGRST204 trap, KG1 waitUntil, fail-open preservation) were applied correctly, and the mentor-route fail-open split was the week's best judgment call. The one genuine shipped defect is **AUTH-1**: the password-reset form trusts a bare `SIGNED_IN` event, giving two deterministic borrowed-device takeover vectors — found by this audit in code the Sonnet Workflow had reviewed and passed. **The founder's central concern is confirmed and quantified:** every independent re-run of a spend-limit-killed review found real defects the first-hand pass missed (2/2 on code this week; AUTH-1 now makes the tier-gap point even against a *completed* Sonnet review), while ~1,000 lines of P-GL code went live with **no** adversarial review at all — against the session's own reflection's advice, which nothing captured. Three reflection findings were dropped for want of a capture path; four AE-2 smoke credentials have no revocation record; a twice-flagged Next.js security action item was never acted on; the committed grounding doc contradicts the open P2; and four sessions' record files sit uncommitted, one 12 days deep. Top actions: the CRED-1 credential check (one command), the AUTH-1/AUTH-2 fix (~15 lines, Critical-tier), the P2 Fable-5 rerun while Fable lasts, retroactive reviews of AE-1/S11b, and the reflect-harvest process change.

---

## §1 Model attribution (who actually ran each session)

Fable 5's last work: `79b0677` (AE-2 loop-fold build + independent re-review fold, 07-19 08:10) and the AE-2 activation prompt.

| Commit | Session | Model (trailer) |
|---|---|---|
| `a506916` 07-19 | AE-2 activation LIVE + mentor self-circle verdict | **Opus 4.8** |
| `bcf8667` 07-19 | Kathekon self-circle narrowing + loop_fold v2 (code) | **Opus 4.8** |
| `c613b86` 07-19 | AO plan adopted + s9 refresh prompt | **Sonnet 5** |
| `fa8f59f` 07-19 | s9-loop credential diagnosis | **Opus 4.8** |
| `a335b2e` / `3ad7f07` 07-20 | AO plan fold / P-GL prompt | **Opus 4.8** |
| `5e19141` 07-20 | P1 roster gap analysis | *(no trailer)* |
| `803448a` 07-20 | **P-GL gate builds — the biggest code commit** | *(no trailer)* |
| `9a370f0` 07-20 | P-GL finish (mentor-route wiring) | *(no trailer)* |
| `a7b7a5d` 07-21 | P2 harnessed arm + erratum | *(no trailer; erratum records Sonnet 5 at LOW effort)* |
| `bbfb7e8` 07-21 | PR19 adoption | **Sonnet 5** |
| `5387cb9` / `51a9c3c` / `f48a82f` / `8c930dd` / `bc834a9` 07-21/22 | P5, P4×3, P5b | *(no trailer)* |
| `69c9b71` / `17a30dd` 07-22 | Section D / cost_health migration | *(no trailer)* |
| `63a70e1` / `ac7ffae` 07-22/23 | Password-reset build / close-out | **Sonnet 5** |
| `6d83b36` 07-24 | CLAUDE.md grounding + brand/nav | *(no trailer)* |

**Finding M-1 (process, MEDIUM):** 10 of 21 commits carry **no model trailer**, including the two largest production-code commits (P-GL). The P2 erratum's root cause was exactly an unlogged model substitution. Model identity is currently unrecoverable for roughly half the week's work.

---

## §2 Adversarial-review integrity — the founder's central concern

The founder's observation is **confirmed and quantified**: every time a spend-limit-killed adversarial pass was later re-run as a genuinely independent Workflow, the re-run found real defects the first-hand completion had missed. Since 07-19 the hit rate is **2/2 on code (plus the AO-plan critique, 3/3 counting documents)**:

| Build | First pass | Independent re-run | What the re-run found |
|---|---|---|---|
| AE-2 loop fold (07-19, Fable) | Died whole (6/6 finders, spend limit) → first-hand: 3 findings, "clean" | `wf_05daaca5`, 14 agents, same day | **7 confirmed defects incl. a genuine spec-infidelity** (calibration loops feeding domain levels) — all fixed at root |
| Self-circle narrowing (07-19, Opus 4.8) | Died whole (6/6) → first-hand: 5 dimensions CLEAN | `wf_95e8d22f`, 20 agents, same day (founder-forced) | **1 HIGH** (isSelfRegardingLoop missing the `!engaged` gate → double-counting broke the split's mutual exclusivity) + 1 LOW — fixed at root |
| AO build plan (07-19) | first-hand draft | `wf_e55e52e4`, independent critique | 23 confirmed findings, 0 refuted → v2 |
| Launch-feedback reconciliation (07-19) | — | `wf_3e81a945` completed fully (13 agents) | all 28 verdicts confirmed (clean run) |
| Password-reset (07-22, Sonnet) | — | 18-agent Workflow completed fully | 3 defects (1 HIGH) fixed pre-deploy — **PR19 honored** |

**Finding R-1 (the central gap, HIGH):** the **P-GL gate builds (`803448a`, 07-20) and P-GL finish (`9a370f0`) received NO adversarial review of any kind** — not even a first-hand pass framed as one. ~1,000 lines touching `/api/reason`'s catch path, `security.ts`'s five 429 sites, `/api/health`, the dashboard data-rights UI, and 13 route catch blocks went live the same evening on batteries + tsc + build alone. The session's **own reflection explicitly recommended** "an independent adversarial pass over the security.ts and catch-block edits before the founder deploys" — the recommendation appears in no close, no checklist, and was never run. (§3 is that review, five days late; outcome: the load-bearing claims all hold and the code quality is genuinely good — but the review still surfaced two real follow-ups, C-6/C-7, and one retention gap, C-1, that a pre-deploy pass would have caught. Good outcome ≠ good process.)

**The password-reset contrast makes the tier point concrete:** that build DID get its 18-agent Sonnet Workflow pre-deploy (3 defects fixed) — and this audit's Fable-level re-verification of the same four files **still found a live defect the Sonnet review missed** (AUTH-1, §3.3: the reviewer read the auth-js source for the one race it was hunting but never mapped the full `SIGNED_IN` emission surface). Review tier matters independently of review structure.

**Finding R-2 (PR19 retroactive gaps, MEDIUM-HIGH):** three first-hand-only reviewed builds from 07-18 are **live and never got their re-run**, despite each close saying one "can follow the limit reset":
- **AE-1 practice-delta layer** (LIVE in production, MEASURE) — first-hand only (5 findings folded).
- **S11b action-composer + reducer narrowing** (LIVE in the founder's loop + deployed) — first-hand only (1 HIGH folded first-hand).
- **S11a extraction diagnosis** (analysis; 13/14 verifiers died) — first-hand completion of the dead refutations.
Given the measured 2/2 re-run hit rate on the sibling builds from the very next day, the probability these harbor missed defects is not small. PR19 (adopted 07-21) made re-runs mandatory going forward but was never applied retroactively.

**Finding R-3 (PR19 scope, MEDIUM):** PR19's wording covers "trust-core/predicate/fold/engine surfaces" and build plans. The P-GL class (auth-adjacent `security.ts`, route error paths, a public health endpoint, data-rights UI) falls **outside** its literal scope — which is exactly where this week's only unreviewed live code landed. The password-reset session reviewed anyway (correctly); the rule shouldn't depend on the session's own judgment.

---

## §3 Code review — technical merit of the lesser-model code

### 3.1 P-GL gate builds (`803448a`) + finish (`9a370f0`) — first-hand Fable review (the missing review, performed now)

**Overall verdict: genuinely good code.** The founder's technical-merit concern does **not** materialize here — several choices show the standing lessons were applied correctly:

- `observability-store.ts` — CORRECT: lazy client (no import-time DB effect); both writers full-try/catch, never throw into the request path; `waitUntil`-scheduled (KG1-safe — never blocks the response); `isMissingTableError` deliberately narrowed to table-not-found forms and **explicitly avoids the PGRST204 column false-benign trap** (the AE-1 F1 memory, applied); IPs stored as SHA-256 hashes; message/stack truncation.
- `llm-outage.ts` — CORRECT: duck-typed with a real precision guard (bare `status:500` alone doesn't trip it); zero-dependency leaf.
- `/api/reason` catch wiring — CORRECT: `logRouteError` before the branch (non-throwing); X-Loop-* headers preserved on the outage 503; ledger write skipped on both 500 and 503 (consistent fail-open on the bill); no CORS regression (the old 500 carried none either); the 503 body actually **stops leaking `error.message`** internals that the 500 path still exposes.
- `/api/health` — CORRECT and notably well-judged: the Anthropic probe is `models.list()` — a **token-free GET** (no per-probe spend), timeout-bounded (2.5s), 10s-cached per instance; the encryption check stays presence-only so the existing `mentor_encryption: active` proof survives.
- Dashboard #28 — CORRECT: typed-DELETE confirm gate, honest 200/207 split (never claims full success on partial), accessible modal, sign-out+redirect on true 200. `authFetch` sets `Content-Type: application/json` when a body is present, so the DELETE body contract with `/api/user/delete` holds.
- Mentor-route split (#10 only on the 2 raw-500 routes; NOT on the 5 reviewed fail-open gates) — the standout judgment call of the week: the prompt described the wiring as "mechanical ×7"; the session read the code first and refused to reverse a shipped fail-open safety property. *(Agent verification of the split + batteries: §3.4.)*
- `mint-credential-core.ts` limit-flags fix — clean, mirrored from the sibling, regression-tested, USAGE text updated.

**Defects/concerns found (none critical):**

| ID | Sev | Finding |
|---|---|---|
| C-1 | **MEDIUM** | **`route_errors` + `throttle_events` retention is declared but UNENFORCED** — every row carries `retain_until` (indexed), the migrations' comments claim "90-day retention," but **no sweep purges either table** (grep: the only code referencing them is the writer; none of the four crons touches them). Same class the trajectory/trust-core/narrative sweeps were built to close. Fix: extend one daily sweep with two `delete().lt('retain_until', now())` calls (`code-standard/elevated`, small). |
| C-2 | LOW | `logThrottleEvent` fires **one DB insert per 429** with no dedupe — under a sustained flood the observability table becomes a write-amplification target. Recommend once-per-window-per-IP dedupe (or accept + note; severity low given fail-soft + 90d retention once C-1 lands). |
| C-3 | LOW | Health probe timeout (2.5s) may produce occasional false "degraded" 503 blips on slow upstream days; cache is per-warm-instance. Tunable, not a defect. |
| C-4 | INFO→latent | `isLlmOutage`'s message hints (`timeout`, `fetch failed`…) would classify ANY outage-shaped throw as an LLM outage. The verification agent traced why this is contained **today**: postgrest-js *resolves* network failures into `{error}` results rather than throwing, so DB outages never reach the outer catch as outage-shaped throws. Any future direct `fetch` added inside those try blocks silently reclassifies its failures as `ai_temporarily_unavailable`. Latent hazard — worth a one-line comment in `llm-outage.ts`. |
| C-5 | INFO | The pre-existing 500 path on `/api/reason` still returns raw `error.message` to callers (pre-dates this week; the new 503 is cleaner). Candidate cleanup, not this week's defect. |
| C-6 | **LOW (pre-existing, UI honesty)** | **`private-mentor/page.tsx:248-270` renders FALSE SUCCESS on any error response** — no `res.ok` check, so during an outage (503 or the old 500 alike) the page still displays "Your reflection has been recorded and analyzed by the mentor." #10's honest degradation exists only at the HTTP layer on this page; the screen lies. Pre-dates the week (the old 500 hit the same path) — exposed by this audit, not introduced. Small fix: gate the success rendering on `res.ok`. |
| C-7 | **MEDIUM (checklist honesty)** | **#5's real coverage is narrower than the go-live checklist's "error monitoring ✅ VERIFIED-LIVE" reads:** on all 5 gate-route files the most probable production 500s — checked DB-error returns in POST/PATCH — bypass `logRouteError` entirely, and the GET handlers have **no try/catch at all** (unexpected GET throws → Next's default 500, unlogged); `passion-classify`'s 502 parse-failure return is likewise unlogged. Zero behaviour change, but `route_errors` is not yet "the prod error picture," and the checklist row should say so before the 0h call leans on it. |

**Verification-agent confirmation (leg a, completed):** the #10 fail-open split is **exactly as the close claimed** — conclusive grep: `llmOutageResponse`/503 appear ONLY in `passion-classify` + `private/reflect`; every fail-open gate return is an unchanged context line; both #10 targets were genuinely reachable raw-500 paths pre-fix. `logRouteError` verified **structurally incapable** of throwing/blocking (async body fully try/caught → promise never rejects; `waitUntil` no-ops outside Vercel — the fallback comment's mechanism is wrong but the behaviour is safe). R20a ordering untouched; `private/reflect`'s distress gate fires before any LLM call; perimeter registry unchanged at 92. **Batteries, all first-hand: llm-outage 35/0 · r20a-invocation-guard 92/0 · all SIX mentor boundary suites green (hupexairesis 466/0, morning 466/0, oikeiosis 327/0, premeditatio 451/0, sage-compass 527/0, view-from-above 466/0 — the close said "all 5"; there are 6) · `tsc` exit 0.** Non-vacuity proven: boundary assertion counts *grew* vs the build-time records (368→466 etc.), so the new imports are demonstrably iterated, not skipped.

### 3.2 Kathekon self-circle narrowing + loop_fold v2 (`bcf8667`, Opus 4.8)

Spot-verified first-hand: the independent re-review's **HIGH fix is present at the root** — `isSelfRegardingLoop` gates on `!el.engagement.engaged` first, `isCalibrationLoop` excludes self-regarding, and the calibration class is excluded from verdict-building entirely (the ADR-014 §3.2 guard), each with the full explanatory comment and non-vacuous pins. This surface is the week's best-covered: built by Opus, first-hand-reviewed, independently re-reviewed (20 agents), mutation-verified, batteries 105/0 + 179/0. **No further action needed.**

### 3.3 Password-reset flow (`63a70e1`, Sonnet 5) — Fable-level re-verification: **one genuine live defect found**

The Fable verification agent read the installed `@supabase/auth-js` (2.99.3) source against the shipped code. Of the three defects the 18-agent Sonnet Workflow claimed fixed: **fix 1 (error-hash dead-end) VERIFIED present** (correctly ordered before the token early-return; no leak, no loop), **fix 3 (timeout lockout) VERIFIED present** (timeout only stops the spinner; single `cancelled` guard across all three async sources), but:

**AUTH-1 (MEDIUM-HIGH, live): fix 2 is only HALF-present — the reset form trusts a bare `SIGNED_IN` event with no marker.** `reset-password/page.tsx:52` accepts `SIGNED_IN` on the premise "the event itself is proof of a genuine recovery happening right now." That premise is false: `SIGNED_IN` has **12 emission sites** in the installed auth-js, only one hash-driven. Two deterministic bypass vectors were traced to source: (a) *same-tab* — the client's unconditional `visibilitychange` listener re-emits `SIGNED_IN` for any valid ambient localStorage session on every tab-switch-back (`GoTrueClient.js:2423-2447 → 2126`); (b) *cross-tab* — the default `BroadcastChannel` re-notifies `SIGNED_IN` from any other tab of the origin. **Concrete failure: on a shared/borrowed device with the victim signed in, an attacker opens `/auth/reset-password`, sees "no active reset link," switches tabs and back — the form appears, and `updateUser({password})` succeeds without the current password → account takeover with lockout — the exact threat the fix named.** The Sonnet review read the library for the one race it was hunting and never mapped the full `SIGNED_IN` emission surface — precisely the tier-gap class this audit was commissioned to find. **Minimal fix (small, Critical-tier, founder-walked): remove `SIGNED_IN` from the trusted set on this page** — `PASSWORD_RECOVERY` (only 2 emission sites, both hash/OTP-driven) + the marker-gated `getSession()` path cover both documented arrival cases.

**AUTH-2 (MEDIUM, pre-existing — NOT introduced this week): open redirect on `/auth`.** `auth/page.tsx:23-27` returns `params.get('redirect')` unvalidated into `window.location.href` — `?redirect=//evil.com` sends a signed-in user off-site (a phishing primitive on the real domain, adjacent to the credential flow). Introduced in `44fc844` (pre-dates the week; provenance git-verified). Fix trivial: accept only `/^\/(?!\/)/`.

Lower-severity concerns from the same leg: the `error=` detection is substring-on-hash only (a GoTrue redirect carrying only `error_code=`/`error_description=` — which the library's own parser treats as valid error forms — would be missed and reproduce the original dead-end; and the check dies silently if `flowType` ever moves to `pkce`); the redirect discards *why* the link failed (user sees a bare sign-in form and may retry the dead link); the sessionStorage marker can linger if the hand-off aborts pre-mount (an expiry timestamp closes it); password bar is the Supabase-default 6 chars; no other-session invalidation after a successful change. `npx tsc --noEmit` exit 0. The four audited files are byte-identical to `63a70e1` in the working tree, so all findings apply to the live deploy.

### 3.4 Agent verification legs — status

**All three complete.** Leg (a) mentor-route wiring + batteries: folded into §3.1 (the confirmation block + C-6/C-7). Leg (b) password-reset: §3.3 (AUTH-1/AUTH-2). Leg (c) deferral sweep: merged into §4. Combined agent spend ~955k tokens, 100 tool calls, zero errors — the genuinely-independent review posture PR19 mandates, applied to the week that mostly lacked it.

---

## §4 Deferred / accepted-as-done items — dropped-risk register (first-hand + independent sweep, merged)

The independent sweep agent verified every row below against the current working tree (code greps, git history, package-lock, the decision-log tail), not against close-file claims.

### 4.1 DROPPED (contradicted or forgotten by later records)

| Item | What happened | Attention |
|---|---|---|
| **CRED-1: the four AE-2 smoke credentials were never confirmed revoked.** The 07-19 AE-2 activation close carried the teardown ("revoke `ae2-smoke` `75923e2b…` / `ae2-smoke2` `af53d18d…` / `ae2-smoke3` `89b7981b…` / `ae2-smoke4` — id via `list`") | **Zero record of revocation anywhere** — not in the decision log, not in the credential ledger (created 07-21, never listed them), not in any later close. `ae2-smoke4`'s id was never even captured, and its daily limit had been raised to 30 by SQL. Four possibly-still-active production UPCs. | **HIGH — founder one-liner:** `mint-credential.ts list \| grep ae2-smoke`, then revoke any active row. |
| **NEXT-1: the Next.js security action item, dropped twice.** Deployed **14.2.35**; the 06-22 scan set the baseline at 15.5.18/16.2.6 ("verify the deployment is at or above it") and the 07-20 scan's headline ACTION-WORTHY item was the 20-July Security Release (4 high + 5 medium CVEs) patching **16.2.x/15.5.x only** | No commit since 07-20 touches package.json/lock; the deployed major is not in the patched branch set at all, and whether 14.2.x is affected/EOL was never assessed. No tracking artifact outside the scan blob — which is itself uncommitted. | **HIGH — needs its own exposure-assessment session** (do the CVE sets affect 14.2.x?) and likely a planned major-upgrade arc. |
| **P2 verdict-memo limitations (reflection findings dropped).** The bare-arm session's own reflection named two validity threats — answer keys authored by the brief author; the synthetic S3 status log unrealistically well-organized, likely inflating leg A — and said to fold them into the memo | **The memo has no limitations section; neither appears anywhere in it.** The Fable-rerun prompt requires sweep independence but NOT answer-key independence. | Fold into the rerun spec before it runs (§6.7). |
| **PROTO-1: the inter-agent-handoff-protocol precondition, silently bypassed.** P1 §2 + its close said the protocol should be activated-or-retired "BEFORE any of tech/growth/support/ops receive a P4 harnessed identity" | All three P4 sessions proceeded (07-21/22) with **no recorded resolution, waiver, or mention** of it. The protocol remains "Designed (2026-04-11), no evidence of live use." | MEDIUM — retroactive founder decision: retire it explicitly or schedule its activation; either is fine, silence is not. |

### 4.2 AT-RISK (single-mention / rot-prone tracking; several verified still-not-done)

| Item | Verified status |
|---|---|
| **GROUND-1: committed CLAUDE.md contradicts the open P2.** The 07-24 grounding session's section reads "Closed / settled… **P1–P5** + P4" — sweeping the erratum'd, still-open P2 into "settled" — and its awaiting-commencement list omits the Fable-5 rerun entirely (today is its named start date). This session's opener revision repairs it, but that repair is uncommitted, and CLAUDE.md itself still needs the one-line correction. |
| **Mentor feedback on website pages (`inbox/…rtf`, sat unprocessed since 07-17):** targets **LIVE pages, not drafts** — `/limitations` (live since 06-07) says "Every evaluation … is generated by an AI language model" (`limitations/page.tsx:53`); `/welcome` has two "AI-generated" lines (:100, :215). The mentor's REQUIRED amendments (the deterministic Layer-2 engine is not Claude-generated) target publicly-served honesty claims. No prompt, no tracker entry until this session's opener. R18-relevant. |
| **Consult-lookup resilience + latency prompt (07-19) — the one true ORPHAN:** no CLOSE exists, absent from committed CLAUDE.md's awaiting-commencement list; code confirms neither remedy landed (no retry logic in `practice-credential.ts`; no `GATE1_ACTION_TEXT_MODE` set). The transient-401/28s-timeout class fired repeatedly in this very audit session. |
| **classifier_cost_log verification — revisit trigger fired without the revisit:** its condition ("once Step 4/5 complete") was met 07-22/23; no record the `classifier_30d` reading or the sibling deliverables were ever checked. Its only home is an **uncommitted** close file. |
| **Auth-handler try/catch hardening** (`handleSignIn`/`handleSignUp`/`handleMagicLink`, named out-of-scope by the password-reset review): code-verified still bare — an exception mid-call leaves the button stuck. Single-mention tracking only. |
| Users-guide Ch.22 TBDs (3 confirmed still present, ~6 more elsewhere; no "broader founder review" session exists or is queued) · docx-skill Python-3.10 gap (one decision-log sentence) · Ops-C1 formal promotion to Verified (functionally satisfied 07-22/23; the P1 recommendation never discharged on paper) · TypeScript 7.0 scoped trial (scan-blob only). |

### 4.3 Tracked-but-stalled (SAFE homes, lapsed triggers)

- **In-app "Forgot your password?" retest** — the "retest once the rate limit resets (~1h)" trigger lapsed **~2 days ago** with no retest recorded anywhere. 2-minute founder task; also the natural moment to verify the AUTH-1 fix once made.
- **P8a/P8b (guard-path capture + the new observation window)** — their stated dependency (≥1 harnessed org agent live) has been satisfied since 07-22 (three are live); runnable, unscheduled, no prompts exist. Same for P6/P7.
- **Growth spend check-in (~08-05)** — rides "the next Growth-touching session"; if none runs by then, nothing fires it.
- Resend (#15), go-live #11/#27, WebSearch/WebFetch matcher, Support ring-vs-Gate1, brand/nav build open questions, AE-2 R18 docs, register D4/P1/P5/P6, AE-3 — all correctly tracked where future sessions will read them.

### 4.4 Records hygiene (uncommitted working tree, ≥12 days deep)

5 modified + 5 untracked record files span **four** sessions' leftovers: the 07-22 cost-health session's close + prompt were **omitted from its own commit list** (the session's record of itself — including the classifier_cost_log open question — has never entered history); the 07-20 environmental scan (source of both un-actioned ACTION-WORTHY items) is uncommitted 5 days; the 07-13 D4-flag confirmation edits are uncommitted **12 days**; the P3/P4 post-close corrections and the executed P3/P5 prompts were never committed. One records commit fixes all of it (this audit's own files ride along).

---

## §5 The week's session reflections — 20 extracted, analysed

All 20 close-turn reflections since 07-19 were extracted from the local transcripts. They are consistently genuine — specific, self-critical, and in three cases they surfaced **real findings that then went nowhere**, because the reflect turn fires *after* the close file is written and nothing harvests it.

**Repeated finding classes:**

1. **"Verify the inherited claim before acting on it" — the discipline that kept working (9+ sessions).** Catches attributable to it this week: the Support manual's false "already deployed" claim; the second false Resend claim; a stale next-session prompt (P1 already done); the CLI limit-flag gap; the "schema already exists" claim verified before reuse; CLI flag names re-read from source before every Critical mint. This is now the project's single most-validated behaviour and is only informally encoded (callings' "load current build-state first"; the failure-mode table).
2. **Single-pass/partial-read confidence — the recurring failure (3 sessions).** The s9-credential session offered decisions twice on undiagnosed premises against the prompt's own "Diagnostic-certain" gate and *dismissed the exact standing memory that documented the answer*; the PR19 session transcribed finding-counts on one pass ("exactly the kind of single-pass confidence this session institutionalizes against"); another session re-bisected the known setInterval-keepalive hang before recalling its own memory note. **Pattern: memories are being consulted late or not at all when a symptom looks familiar.**
3. **Reflection findings have no capture path — 3 confirmed drops** (the P-GL security-review recommendation; the two P2 validity threats). The reflect turn structurally post-dates the close, so its content never reaches any tracked artifact unless the next session happens to read the transcript. This audit is the first thing that has ever read them.
4. **Founder-question economy (3 sessions, minor):** sequential AskUserQuestions where one front-loaded round would do; verification performed before surfacing the decision it served.
5. **Restraint successes worth naming (the positive pattern):** the mentor-route fail-open discovery; declining to touch `hooks.json` mid-session; refusing to route around missing credentials; not manufacturing a nominal #11 closure; treating Gate-1/Gate-2 frames per the channel law throughout — no session outsourced judgment to the harness.

---

## §6 Process recommendations (incorporating the learnings)

1. **Close the reflect-to-record gap (highest leverage).** Add to the standing protocol + the sage-stenographer skill: *when the Sage Reflect invitation fires, any concrete finding or follow-up named in the reflection MUST be written back into the session's close file (Open Questions / Next Session Should) before the session ends — and the next session's opener Step 6 gains "check the predecessor's reflect turn for unharvested findings."* Optionally: a small weekly report over `sage_reflect_sessions` (the data is already persisted server-side, encrypted). Three real findings were lost this week for want of this.
2. **Widen PR19 (PR19a amendment).** Extend mandatory independent adversarial review to: (a) any session touching auth/session/perimeter/security code (`security.ts`, `auth/*`, R20a surfaces, credential paths) regardless of "trust-core" wording, and (b) any live-surface diff above a size threshold (suggest ~150 lines). The password-reset session did this voluntarily; P-GL did not — the rule should not depend on session judgment.
3. **Retroactive PR19 sweep while Fable is available:** independent re-reviews of **AE-1** (live in prod) and **S11b action-composer + reducer** (live in the founder loop) — the two first-hand-only surfaces with the highest blast radius. The measured 2/2 re-run hit rate on their same-week siblings is the argument. (P-GL's missing review is discharged by §3 of this audit.)
4. **Model + effort logging, made structural.** Every close header and every commit trailer records the model + reasoning effort (10/21 commits this week have no trailer); every benchmark metrics file gets a mandatory `model`/`effort` field (the P2 erratum's own lesson, generalized). A one-line addition to the standing cache's close template.
5. **Memory-first triage line in the opener/cache:** *"On any familiar-looking symptom (hangs, 401s, mint errors), grep MEMORY.md before diagnosing."* Two sessions lost cycles re-deriving documented answers; one mis-recommended against a correct memory.
6. **Retention parity rule for new tables:** any migration adding `retain_until` must, in the same session, either wire the purge into an existing sweep or name the gap in the close as a tracked follow-up (C-1 is the instance).
7. **P2 rerun spec addendum:** independent answer-key authorship (author ≠ key-writer ≠ sweep-reviewer) + a realism note on any synthetic status-log artifact + the mandatory model/effort field — folding the dropped reflection findings into the rerun before it runs.
8. **Checklist honesty amendment (C-7):** re-word the go-live checklist's #5 row to state what `route_errors` actually captures (outer-catch throws; not checked-error 500s, not GET throws on the gate routes) — so the 0h call reads the artifact at its true strength.

---

## §7 What to proceed with next (recommended order)

> **Same-session addendum (2026-07-25, post-audit):** items 3, 6-partial were executed in the audit session itself under founder approval — the AUTH-1/AUTH-2 fixes + both riders (error-hash broadening, private-mentor `res.ok` gate) are implemented (tsc 0, build ✓, deploy founder-walked); the P2 rerun prompt (with §6.7 folded) and the AE-1/S11b retroactive-review prompt are authored; CLAUDE.md's GROUND-1 line + awaiting-commencement list are corrected. Remaining as listed: CRED-1 (founder command), the retest/smokes post-deploy, and items 4–11.

**Immediate founder one-liners (minutes, today):**
1. **CRED-1:** `mint-credential.ts list | grep ae2-smoke` → revoke any active row (four smoke UPCs with no revocation record).
2. **In-app password-reset retest** (the lapsed trigger) — ideally after item 3 lands, verifying both at once.

**Small Critical-tier auth fix (founder-walked, next code session — before or alongside the P2 arc):**
3. **AUTH-1 + AUTH-2 together** (~15 lines total): remove `SIGNED_IN` from the reset page's trusted event set; validate `/auth`'s `?redirect=` against `/^\/(?!\/)/`. Optionally fold the AUTH-1 leg's low-severity hardenings (error-hash param parsing, marker expiry, C-6's `res.ok` gate on private-mentor). Auth/session → Critical tier, PR19 review applies — and per this audit's own finding, run that review at the strongest available tier.

**While Fable 5 access lasts (the scarce resource — spend it only where the top model is load-bearing):**
4. **P2 Fable-5 rerun** — the standing note's own priority, unblocked today 08:00; the spec *requires* Fable. Fold in §6.7 first (30 minutes of spec amendment, then the 3–4 session arc).
5. **Retroactive independent reviews of AE-1 + S11b** (§6.3) — Fable-run; these are live surfaces whose same-week siblings' re-runs hit 2/2.

**Founder-walkable / lesser-model-safe (any time, PR19 discipline applies):**
6. **Commit the pending records** (one commit; includes this audit, the updated opener + archive, the 07-20 environmental scan, and the four sessions' stranded closes/prompts) + the one-line CLAUDE.md corrections (GROUND-1 "P1–P5 → P1/P3/P4/P5"; add the P2 rerun + consult-lookup prompt to awaiting-commencement).
7. **Mentor's live-page amendments** (`/limitations` + `/welcome` architecture wording) — small, honesty-critical (`code-standard`, copy-only; author the prompt from the RTF's required items).
8. **Observability retention sweep** (C-1) + optionally the 429-dedupe (C-2) and the C-7 gate-route GET try/catch — one small `code-elevated` session.
9. **Next.js exposure assessment** (NEXT-1) — determine whether the May/July CVE sets affect 14.2.x; plan the upgrade arc if so.
10. **Consult-lookup resilience + latency** (the orphaned prompt) — daily harness-friction reducer.
11. **Process adoptions** (§6.1/2/4/5/6/8 + PROTO-1's explicit retire-or-activate decision) — one governance session amending the cache/PR19/stenographer/checklist + the P2 spec.

Then the standing queue continues as already tracked (brand/nav build, Resend, D4, AE-2 R18 docs, AE-3, register P1/P5/P6, P6–P8b).

---

## §8 This audit's own classification

`governance` / read-only + documents (this report, the opener correction) under 0d-ii — Standard. No code, schema, flag, mint, or deploy touched; three read-only verification agents + battery runs. AC7/PR6 not engaged. Rollback: `git revert` the records commit. **S11 remains REFUSED; MEASURE throughout; weights BLOCKED; the 0h call remains the founder's.**
