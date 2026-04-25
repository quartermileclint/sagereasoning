# Session Close — 25 April 2026 (Shape Adapter Session 3b — Second Consumer Migration: `/api/mentor-baseline-response` fully migrated to `loadMentorProfileCanonical()`)

**Stream:** tech
**Governing frame:** `/adopted/session-opening-protocol.md`
**Authority for the work:** `/compliance/ADR-Ring-2-01-shape-adapter.md` (Adopted 25 April 2026), §7 Session 3 + §12 Session 3 notes
**Tier read this session:** 1, 2, 3, 6, 8, 9 (every-session + KG governance scan + code)
**Risk classification across the session:** Elevated × 1 (per ADR §7 Session 3). Pre-deploy `tsc` clean at two checkpoints; pre-commit hook (TypeScript + ESLint safety-critical) passed; commit `ea505ec` made on local `main`. Push pending on founder.

## Decisions Made

Three step-5 decisions made at session open per the session prompt + ADR-Ring-2-01 §12 Session 3:

1. **Decision 1 — Wire-contract translation for `current_profile`** → option **(c)**: drop `current_profile` from the response body entirely. **AI pushed back on the prompt's framing** — the prompt's binary rule ("recommend (a) if no client consumes `current_profile`; recommend (b) or (c) if a client does") didn't account for the case the audit actually found: no client reads the field AND no internal code reads it. A grep for `\.current_profile` (property access) returned zero matches across `/website/src`. The field was a pure pass-through being persisted into localStorage and `mentor_appendix` without any consumer. (c) is the cleanest end-state: removes a dead field, simplifies the response surface, prevents mixed-shape rounds accumulating in the archive as the migration progresses. Founder approved (c).
2. **Decision 2 — Field-access translation inside the route** → proceed: simplifies to `buildProfileSummary(currentProfile)`. Confirmed at decision-walk that `currentProfile` is read only at two call sites (the buildProfileSummary line and the response body); both are resolved by Decisions 1 and the loader switch. No other field translations needed.
3. **Decision 3 — Static fallback (`mentorProfileFallback`) shape** → option **(a)**: keep the static JSON file unchanged in legacy `MentorProfileData` shape; adapt at the use site via `adaptMentorProfileDataToCanonical(mentorProfileFallback as MentorProfileData)`. The `adaptMentorProfileDataToCanonical` import stays in the route (used at the fallback site only, no longer at the buildProfileSummary site). The file retires alongside `MentorProfileData` in Session 5.

Additional session decisions:

- **C-α posture preserved.** Canonical `MentorProfile` type unchanged this session. Session 2 did the type extension; Session 3 sub-sessions execute consumer migrations. No fallback to C-β triggered.
- **Sage-mentor encapsulation preserved.** Zero new imports from `/sage-mentor/` into `/website/` beyond what Session 2 already established. The route's new type-only import of `MentorProfile` from `'../../../../../sage-mentor'` mirrors the existing pattern in `mentor-profile-store.ts:24`.
- **AC7 (Session 7b standing constraint) confirmed at three checkpoints** (session open, plan walk, commit). No change to authentication, cookie scope, session validation, or domain-redirect behaviour. AC7 not engaged.

## Status Changes

| Item | Old status | New status |
|---|---|---|
| `/api/mentor-baseline-response/route.ts` (public baseline) | Live (transitional shim — calls `buildProfileSummary(adaptMentorProfileDataToCanonical(currentProfile))` after `loadMentorProfile()`) | **Live** (fully migrated — calls `loadMentorProfileCanonical()`, passes canonical `currentProfile` directly to `buildProfileSummary`, response body no longer carries `current_profile`) — PR1 proof for this session |
| Transitional shim at `/api/mentor-baseline-response` | Live (introduced Session 3a) | **Retired** (Session 3b) |
| Wire contract: `current_profile` in `/api/mentor-baseline-response` response body | Live (echoed `MentorProfileData`) | **Removed** (Decision 1 = c) |
| `/api/mentor-profile/route.ts` (GET) | Live (transitional shim — Session 3a) | **Live (transitional shim — unchanged)** — un-migrated; awaits Session 3c |
| `/api/founder/hub/route.ts` | Live (no shim — uses `loadMentorProfile` directly) | **Live (unchanged)** — un-migrated; awaits Session 3e |
| ADR-Ring-2-01 Session 3 (private baseline) | Verified (founder confirmed by paste-snippet check on commit `7065234` — pending decision-log adoption) | **Verified (decision-log adoption proposed below as D-RING-2-S3a)** |
| ADR-Ring-2-01 Session 3b (public baseline) | Adopted (planned) | **Verified (pending founder live-probe post-deploy of commit `ea505ec`)** |
| `MentorProfileData` (legacy type) | Live (unchanged) | **Live (unchanged — retires Session 5)** |
| `loadMentorProfile()` (legacy) | Live (unchanged) | **Live (unchanged — retires Session 5)** |
| `MentorProfile` (canonical) | Live (16 required + 7 optional fields) | **Live (unchanged)** |
| Push posture | Sandbox push fails (3rd observation, Session 3a close) | **Sandbox push fails (4th observation, this session)** — already promoted under PR8 (proposal D-PR8-PUSH from Session 3a close pending founder approval) |
| Stale-lock (`.git/index.lock`) | 2nd observation (Session 3a close) | **3rd observation, this session** — promotes per PR8 (see Open Questions / Decision Log Entries below) |

## What Was Changed

| File | Action | Notes |
|---|---|---|
| `website/src/app/api/mentor-baseline-response/route.ts` | Edited (full migration) | Imports: `loadMentorProfile` → `loadMentorProfileCanonical`; added `import type { MentorProfile } from '../../../../../sage-mentor'`. Type annotation: `let currentProfile: MentorProfileData` → `let currentProfile: MentorProfile`. Loader call: `loadMentorProfile(auth.user.id)` → `loadMentorProfileCanonical(auth.user.id)`. Static fallback: `(mentorProfileFallback as MentorProfileData)` (used in two branches) → `adaptMentorProfileDataToCanonical(mentorProfileFallback as MentorProfileData)`. `buildProfileSummary` call: shim retired — direct `buildProfileSummary(currentProfile)`. Response body: `current_profile: currentProfile` removed; comment block explains the Decision 1=c removal and points at this handoff. Docstring "Output:" line updated; new wire-contract note added below the docstring. Inline comments at the loader/fallback block and the buildProfileSummary call name this as the Session 3b migrated caller. |
| `website/tsconfig.tsbuildinfo` | Edited (build artefact) | Regenerated by `tsc --noEmit`. Tracked in git per prior practice. |

**Total diff:** 2 files changed, 37 insertions(+), 21 deletions(-). Single commit `ea505ec` on local `main`.

### Files NOT changed
- All distress classifier code (`r20a-classifier.ts`, `constraints.ts` SafetyGate) — untouched. R20a/AC5 perimeter unaffected.
- All sage-mentor runtime files — unchanged.
- `/api/mentor/ring/proof` (Session 1's PR1 proof) — unchanged.
- `/api/mentor/private/baseline-response/route.ts` — unchanged. Still on the Session 3a shim. Migrates fully when scheduled.
- `mentor-profile-store.ts` — unchanged. Both `loadMentorProfile` and `loadMentorProfileCanonical` continue to coexist.
- `mentor-profile-summary.ts` — unchanged. `buildProfileSummary` already canonical-consuming since Session 3a.
- `mentor-profile-adapter.ts` — unchanged.
- `practitioner-context.ts` and `mentor-context-private.ts` — unchanged. Neither calls `buildProfileSummary` directly; both consume `stored.summary` from the loader's envelope.
- `/api/mentor/private/reflect/route.ts` — unchanged (Session 4 — Critical, R20a perimeter, AC5).
- `/api/founder/hub/route.ts` — unchanged (Session 3e).
- `/api/mentor-profile/route.ts` — unchanged. Still on the Session 3a shim. Migrates as Session 3c.
- `mentor-baseline/page.tsx` (posting client) — unchanged. The Decision 1=c response-body change does not break this client because it never read `current_profile`. The client persists `data` (the response object) into localStorage and `/api/mentor-appendix` as the `refinement` field; the absence of `current_profile` simply means future stored rounds will not carry that field. Past rounds in storage are unaffected.
- `mentor-baseline/refinements/page.tsx` (viewer) — unchanged. The viewer types `current_profile?: unknown` (optional, never read); the absence of the field on future rounds compiles and runs without modification.
- `/api/mentor-appendix/route.ts` — unchanged. Stores the `refinement` payload encrypted; doesn't inspect inner fields.
- The encryption pipeline — unchanged.
- Database schema or rows — unchanged. **No DB changes. No SQL. No DDL. No env vars added. No safety-critical files modified.**

## Verification Method Used (0c Framework)

Per `/operations/verification-framework.md`:

- **Pre-deploy: TypeScript clean — two checkpoints.** `npx tsc --noEmit` in `/website/` exit 0:
  - **Checkpoint 1** (after the five edits to the route file applied): exit 0. Build green.
  - **Checkpoint 2** (post-commit, sanity): exit 0.
- **Pre-commit hooks:** `.husky` pre-commit ran TypeScript compilation check + ESLint safety-critical modules check. Both passed (visible in commit output).
- **Caller-side audit (Decision 1 risk mitigation).** Before changing the response body shape, ran a grep across `/website/src` for `current_profile` (any usage) and `\.current_profile` (property access). The first returned six matches (the route's own write/comment/docstring lines, the viewer's type declaration, plus internal comments — see "Audit findings" in the conversation transcript). The second returned **zero matches**. No consumer reads any field from `current_profile`. The shape change has no functional impact on any code path.
- **Post-deploy verification — pending founder push and live-probe.** Pass criteria below.

| Criterion | Expected | Verification |
|---|---|---|
| HTTP status | 200 | Founder live-probe |
| `success` | `true` | Founder live-probe |
| `responses_processed` | `1` (or whatever count was sent) | Founder live-probe |
| `refinement` | populated object (sage-reason output) | Founder live-probe |
| `current_profile` | **must be undefined** (Decision 1 = c) | Founder live-probe — the assertion below explicitly checks this |
| Server logs (Vercel) | no errors during the request | Founder check (optional) |

**Why this verification is sufficient.** The migrated route's behavioural contract is unchanged from any consumer's perspective: same HTTP status, same `success`, same `responses_processed`, same `refinement` content. The wire contract change is the absence of `current_profile`; this is verified positively (the field MUST be undefined). The internal change is that the profile-summary text passed into sage-reason is now built from the canonical loader output rather than from the legacy loader's output adapted at the call site. Both paths produce structurally equivalent summaries (the rewrite preserves every section heading the legacy implementation produced — already verified by the structural-completeness test from Session 3a). A regression here would manifest as either the rewritten function producing a malformed string (caught by tsc in advance because the rewrite would not compile against `MentorProfile`) or the canonical loader producing incorrect output (covered by Session 1's verified adapter test).

## Risk Classification Record (0d-ii)

- **Loader switch + buildProfileSummary direct call — Elevated.** Production request path. Public-facing endpoint (no founder gate beyond `requireAuth`). TypeScript catches signature mismatch at compile time; the field-access translation work was already done in Session 3a's `buildProfileSummary` rewrite, so the only new risk is whether the canonical loader's output matches what the rewrite expects. Mitigated: Session 1 verified the canonical loader on `/api/mentor/ring/proof`; Session 3a verified the rewritten `buildProfileSummary` on the private baseline; this session combines the two patterns on the public baseline.
- **Wire contract change (drop `current_profile`) — Elevated.** Response body shape changes for an external surface. Mitigated by the audit confirming zero consumers within the codebase. External consumers (third-party API clients) are not enumerable from inside the codebase, but the route is gated by `requireAuth` (Bearer token from Supabase auth), so an unknown external consumer is unlikely without a known integration. Listed as a known limitation under Open Questions below.
- **Static fallback adaptation — Standard.** `mentorProfileFallback` is the static JSON file at `/website/src/data/mentor-profile.json`, written under `MentorProfileData` shape. Adapter call at the use site is a pure synchronous transform; identical to the pattern used elsewhere.
- **Encryption-pipeline interaction — none.** No file under R17b touched. `loadMentorProfileCanonical` continues to encrypt/decrypt as before; the canonical adaptation operates on plaintext post-decryption, pre-return — unchanged from Session 1's posture.
- **AC7 — not engaged.** No auth, cookie scope, session validation, or domain-redirect change. Confirmed at three checkpoints. Diff inspection confirmed no `requireAuth`, cookie, session, or origin-handling logic modified.
- **PR6 — not engaged.** No safety-critical surface modified. Distress classifier, Zone 2/3 logic, encryption pipeline, session, access control, deletion, and deployment-config all untouched.

## PR5 — Knowledge-Gap Carry-Forward

No re-explanations this session. Existing entries scanned and respected:

- **KG1 (Vercel rules):** respected. Route already async; no fire-and-forget added; no self-call introduced; no header-stripping concern; no execution-after-response; no `process.cwd()` change. The migrated caller's existing await-on-loader behaviour preserved.
- **KG2 (Haiku boundary):** not relevant — no LLM in `buildProfileSummary`'s path. The route's downstream `runSageReason` invocation is unchanged.
- **KG3 (hub-label consistency):** not relevant — no `mentor_interactions` writes or reads.
- **KG6 (composition order):** respected. `buildProfileSummary`'s output continues to land in `fullInput` (a user-message-side string), exactly as before. AC6 placement unchanged.
- **KG7 (JSONB shape):** not relevant — no JSONB read or write.

**Cumulative re-explanation count:** zero. Knowledge-gaps register unchanged.

**Observation candidates updated:**

1. **Sandbox cannot push to GitHub.** **4th occurrence** (1st Session 1 close, 2nd Session 2 close, 3rd Session 3a close, 4th this session). Already at promotion threshold per PR8 since Session 3a; the proposed promotion (D-PR8-PUSH from Session 3a close) is still pending founder approval. No new logging needed — the proposal stands as-is.
2. **Sandbox stale `.git/index.lock` after `git add` in mounted folder.** **3rd occurrence** (1st Session 2 close, 2nd Session 3a close, 3rd this session). Per PR8, this **promotes to a process rule on third recurrence**. Operational mitigation worked again this session: `mcp__cowork__allow_cowork_file_delete` invoked at lock-encounter, lock plus the two `tmp_obj_*` files removed via `rm -f`, commit proceeded cleanly. Decision-log entry below proposes the formal promotion as **D-LOCK-CLEANUP**.

## Founder Verification (Between Sessions)

You verify this session by completing the deployment loop. Three steps.

### Step 1 — Push the commit using GitHub Desktop

1. Open **GitHub Desktop**.
2. Top-left, check the **Current Repository** dropdown — it should say `sagereasoning`. If it doesn't, click and switch to it.
3. Top-right, you should see a button labelled **"Push origin"** with a small number badge showing **1** (one commit ready to push).
4. Click **Push origin**.
5. Wait for the spinner to finish (usually 2–5 seconds). The button label returns to "Fetch origin" with no badge when done.

If you don't see the "1" badge, do not push anything else — tell me what you see instead. The most likely cause would be wrong repository or wrong branch. The commit hash you're pushing is `ea505ec`.

### Step 2 — Wait for Vercel to deploy `ea505ec`

Open Vercel → your project → Deployments. Wait until the most recent deployment shows **Ready** with commit hash starting `ea505ec`. Usually 60–90 seconds. **Do not run Step 3 until this is confirmed Ready.** Testing against the wrong deployment will produce a misleading result.

### Step 3 — Live-probe the migrated caller (`/api/mentor-baseline-response`)

Open `https://sagereasoning.com` in a browser. Sign in (any signed-in account works — this route is auth-gated, not founder-gated). Open DevTools (F12 or right-click → Inspect → Console tab). Paste **exactly this snippet** and press Enter:

```js
(async () => {
  const token = JSON.parse(localStorage.getItem(Object.keys(localStorage).find(k => k.includes('auth-token')))).access_token;
  const r = await fetch('/api/mentor-baseline-response', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      responses: [
        {
          question_id: 'session3b-probe',
          question_text: 'A live-probe stub for the Session 3b PR1 verification.',
          answer: 'Probing the migrated public-baseline caller after the loader switch and the current_profile drop. No real reflection — verifying the route returns 200, refinement is populated, and current_profile is undefined.'
        }
      ]
    })
  });
  const j = await r.json();
  console.log('STATUS:', r.status);
  console.log('success:', j.success);
  console.log('responses_processed:', j.responses_processed);
  console.log('refinement present:', Boolean(j.refinement));
  console.log('current_profile present (must be false):', 'current_profile' in j);
})();
```

**This route runs sage-reason which can take 10–30 seconds.** Wait. The browser console will show the results when the response arrives.

You should see:

```
STATUS: 200
success: true
responses_processed: 1
refinement present: true
current_profile present (must be false): false
```

**The last line matters most for this session** — it confirms Decision 1 (c) landed cleanly: `current_profile` is no longer in the response body. If the line shows `true`, the change did not deploy correctly.

**If all five match: Session 3b is Verified.** Tell me "verified" and I'll record it in the decision log next session.

**If any of the five is different: tell me what you see — do not attempt to fix it.** Most likely cause would be that Vercel is still building, or the wrong deployment is live; second-most-likely is that the rewritten loader path produced a string that the downstream sage-reason call rejected. The rollback for that is `git revert ea505ec && git push origin main` (~5 minutes via GitHub Desktop's history view + revert; or via terminal if you're comfortable). Rollback restores the Session 3a transitional shim and the legacy loader at this caller; Sessions 1, 2, and 3a remain Verified.

## Next Session Should

Per ADR-Ring-2-01 §7, two un-migrated route callers remain plus the founder hub, then Session 4 (Critical), then Session 5 (legacy retirement). Founder picks the next from:

1. **Session 3c — Migrate `/api/mentor-profile/route.ts` (GET).** Removes the transitional shim AND translates the `meta` block (`journal_name`, `proximity_estimate.level`, etc.) to canonical field names. Touches the wire contract for any client reading the GET response. Same caller pattern as Session 3b; the additional `meta`-block work makes it slightly larger.
2. **Session 3d — Migrate `practitioner-context.ts` and `mentor-context-private.ts`.** Lower-stakes consumer migrations; no `buildProfileSummary` involvement. Switch their internal `loadMentorProfile()` calls to `loadMentorProfileCanonical()` and update field accesses inside `buildCondensedContext`.
3. **Session 3e — Migrate `/api/founder/hub/route.ts`.** Larger surface (~1,540 lines). May be split into multiple sub-sessions.
4. **Migrate `/api/mentor/private/baseline-response/route.ts` fully** — Session 3a wrapped this caller in a transitional shim but kept it on the legacy loader. A small follow-up session can switch its loader fully to `loadMentorProfileCanonical()` (founder-only, smallest blast radius — quickest win).
5. **Defer Session 3 series** — Sessions 1, 2, 3a, and 3b are Verified after this session's live-probe. A pause is acceptable. Other priorities can advance independently because Sessions 4–5 are gated on completing the Session 3 consumer migrations.

If proceeding, the next session-opening prompt should reference ADR-Ring-2-01 §7 + §12 Session 3 and this handoff. The "simplest first" ordering from ADR §12 suggests Session 3d (lower-stakes context loaders) or the private-baseline full migration before Session 3c (which adds `meta`-block translation work).

## Blocked On

- **Founder push of commit `ea505ec`** to GitHub via GitHub Desktop.
- **Founder live-probe** of `/api/mentor-baseline-response` confirming the five pass criteria.

## Open Questions

- **O-3B-A — D-RING-2-S3a still pending decision-log adoption.** Session 3a's verification was confirmed by the founder's paste-snippet check on commit `7065234`, but the decision-log entry was proposed at Session 3a close and is still pending formal approval. Surface again at next session open. Approve to lock the decision-log trail.
- **O-3B-B — D-PR8-PUSH still pending decision-log adoption.** Promotion of the sandbox-cannot-push limitation to a process rule was proposed at Session 3a close (3rd recurrence) and is still pending. Now at 4th recurrence this session — the threshold is well-passed. Surface again at next session open.
- **O-3B-C — D-LOCK-CLEANUP newly at promotion threshold.** Sandbox stale `.git/index.lock` reached 3rd recurrence this session. Decision-log entry below proposes formal promotion under PR8.
- **O-3B-D — External consumers of `current_profile` (Decision 1 = c risk).** No code in `/website/src` reads the field, but the route is reachable by any signed-in API consumer with a Supabase Bearer token. If any third-party integration relied on `current_profile`, the field's removal will break it silently (404 on the missing key, which most JSON consumers tolerate). No known external integration depends on this field; surfaced as a known limitation rather than a blocker. Mitigation: if the founder hears from a consumer post-deploy, the route can be reverted (`git revert ea505ec`) — Session 3b's rollback restores the field exactly as it was.
- **O-3B-E — `current_profile` wire-contract inspection at follow-up sessions.** When Session 3c migrates `/api/mentor-profile/route.ts`, the same wire-contract decision arises for that route's `meta` block. The GET endpoint's response body is more likely to have external consumers than this route's POST refinement output (it's the obvious profile-fetch endpoint). Recommend the same audit-first approach (`grep -r 'meta\.' website/src` or specific field paths before changing the loader).

## Process-Rule Citations

- **PR1** — respected. Single endpoint (`/api/mentor-baseline-response`) is the proof endpoint for this session — first full loader-switch on a public-facing route. The remaining route callers continue to call the legacy `loadMentorProfile()` (or its Session 3a shim equivalent). Each becomes its own future PR1 proof.
- **PR2** — respected. Verification immediate: `tsc --noEmit` clean at two checkpoints (after the five edits applied, and post-commit sanity). Live-probe of the migrated caller queued for the founder same-deploy.
- **PR3** — respected. No async behaviour added. Route already async; loader switch preserves that posture. No fire-and-forget introduced.
- **PR4** — respected. No model selection in this session — no LLM in `buildProfileSummary`'s path. The route's downstream `runSageReason` invocation is unchanged.
- **PR5** — respected. No re-explanations. Two existing observation candidates updated (sandbox push 4th, stale lock 3rd — promotes).
- **PR6** — respected. No safety-critical surface modified. Distress classifier, Zone 2/3 logic, encryption pipeline, session, access control, deletion, and deployment-config all untouched. Session 3b correctly classified Elevated; Session 4 (live reflect + journal pipeline) will be Critical when it lands.
- **PR7** — respected. The Session 3a transitional shim at this caller retired this session per its named retirement condition. Two transitional shims remain inline in their respective route files with explicit retirement comments. Decisions 1 and 3 are both adopted (not deferred); Decision 2 was procedural confirmation. No new PR7 deferrals introduced this session.
- **PR8** — engaged. Stale-lock cleanup hits 3rd recurrence — promotion proposed in decision-log entry below as **D-LOCK-CLEANUP**. Push limitation at 4th recurrence; D-PR8-PUSH (proposed Session 3a close) remains pending.
- **AC7** — respected. No auth, cookie scope, session validation, or domain-redirect change. Confirmed at session open, plan walk, and commit checkpoint. Diff inspection confirmed only commentary, type-import, and the loader/buildProfileSummary/response-body lines changed; the existing `requireAuth` import and call lines were unchanged.

## Decision Log Entries — Proposed (Founder Approval Required)

```
## 2026-04-25 — D-RING-2-S3b: ADR-Ring-2-01 Session 3b second consumer
                              migration verified — public-baseline route
                              fully migrated to loadMentorProfileCanonical;
                              Session 3a transitional shim retired;
                              current_profile dropped from response body
                              (Decision 1 = c)

**Decision:** Migrate /api/mentor-baseline-response/route.ts (the public
baseline) fully to loadMentorProfileCanonical(). Retire the Session 3a
transitional shim at the buildProfileSummary call site (now direct
buildProfileSummary(currentProfile)). Adapt the static
mentorProfileFallback at the use site (Decision 3 = a — JSON file
unchanged this session). Drop current_profile from the response body
(Decision 1 = c — audit confirmed zero readers across /website/src).

**Reasoning:** Session 3b of the staged transition adopted under
ADR-Ring-2-01 (25 April 2026). Per ADR §12 Session 3, the public
baseline is the second consumer migration — same caller pattern as
Session 3a's private baseline but with a larger blast radius
(public-facing rather than founder-only) and a wire-contract change
(current_profile in the response body). Decision 1 = c (drop the field
entirely) over a (let it become MentorProfile) and b (preserve legacy
shape via dual-loader) is an AI pushback against the prompt's
recommendation rule: the prompt's binary rule didn't account for the
case the audit actually found — no client reads the field AND no
internal code reads it. Removing dead fields is cleaner than migrating
them. Founder accepted (c). Decision 3 = a keeps the static JSON file
unchanged (it retires alongside MentorProfileData in Session 5);
Decision 2 confirmed no other field accesses on currentProfile exist.

**Alternatives considered:**
  - Decision 1: option (a) switch loader and let current_profile become
    MentorProfile (preserves the field but creates mixed-shape rounds
    in the appendix archive over time, with no consumer benefiting);
    option (b) call both loaders to preserve legacy shape (extra DB
    round-trip for no benefit).
  - Decision 3: option (b) convert the static JSON file to canonical
    shape (expands session scope; the file retires in Session 5
    regardless).

**Revisit condition:** None for the migration itself. If a third-party
consumer of /api/mentor-baseline-response reports breakage from
current_profile being absent, the response body can be reverted
(restore the field) without reverting the loader switch — narrower
fix.

**Rules served:** PR1 (single-endpoint proof — public baseline this
session), PR2 (verification immediate, two tsc checkpoints), PR3 (no
async added), PR6 (no safety-critical surface), PR7 (one shim retired
per its named condition; no new deferrals), R17 (surface unchanged —
canonical loader operates on post-decryption plaintext via the
existing Session 1 path), AC7 (not engaged — confirmed three
checkpoints).

**Impact:** ADR-Ring-2-01 Session 3b reaches Verified status pending
founder live-probe of commit ea505ec. The public baseline is now the
first route fully on the canonical loader (Session 3a's private
baseline still uses the shim approach — its full loader switch is
queued as a future small session). Two transitional shims remain on
the system: /api/mentor-profile (GET, Session 3c) and /api/founder/hub
(Session 3e). The wire contract for /api/mentor-baseline-response no
longer carries current_profile; existing stored rounds in localStorage
and mentor_appendix retain whatever shape they were written under,
while new rounds will not carry the field at all.

**Status:** Adopted, pending founder live-probe post-deploy of commit
ea505ec confirming the five pass criteria.
```

```
## 2026-04-25 — D-LOCK-CLEANUP: Promote the stale-lock cleanup discipline
                                to a process rule (PR8 — third recurrence)

**Decision:** Codify as a process rule: in sandbox-mediated
SageReasoning sessions, when `git add` (or any git operation) fails
with "Operation not permitted" warnings on `.git/index.lock` and/or
`.git/objects/**/tmp_obj_*` files, the AI invokes
`mcp__cowork__allow_cowork_file_delete` for the repository's `.git/`
directory and removes the stale lock plus any `tmp_obj_*` files via
`rm -f` before retrying the failed operation. The session-close
handoff records the recurrence count under PR5 even after promotion
so the pattern's frequency stays visible.

**Reasoning:** Three recurrences across Session 2 close, Session 3a
close, and Session 3 b (this session) close. Same posture each time:
warnings appear during `git add`; staged changes still register but
subsequent operations would fail without lock cleanup; the cleanup
sequence (allow → rm → retry) takes <30 seconds and has worked
reliably each time. PR8 promotes a tacit-knowledge finding to a
process rule on third recurrence. Operational mitigation has been
working without friction across all three sessions; the promotion
formalises the discipline so future sessions do not waste cycles
re-discovering the resolution.

**Alternatives considered:**
  - Investigate the root cause in the FUSE virtiofs sandbox layer.
    Rejected as in-scope for this project — the sandbox is not under
    SageReasoning's control; cleanup discipline is the durable fix.
  - Pre-emptively call `allow_cowork_file_delete` at every git-heavy
    session open. Acceptable variant; the rule above triggers the
    cleanup reactively (on encountering the warning), which has the
    same effect with less noise. Pre-emptive call remains an option
    for sessions known in advance to involve large numbers of git
    operations.

**Revisit condition:** None expected. If the sandbox layer's
permission model changes such that the warnings stop appearing, the
rule retires; until then, the discipline remains operative.

**Rules served:** PR8 (third-recurrence promotion).

**Impact:** Future session-close handoffs continue to log the lock
encounter (count visible in PR5 carry-forward) but do not need to
re-derive the cleanup procedure — the process rule names it.

**Status:** Proposed — pending founder approval at next session.
```

The two pending decision-log entries from Session 3a close (**D-RING-2-S3a** and **D-PR8-PUSH**) remain at "Proposed — pending founder approval." Their text is unchanged and is preserved at `/operations/handoffs/tech/2026-04-25-shape-adapter-session-3-private-baseline-close.md`.

## Orchestration Reminder (Protocol element 21)

This session was governed end-to-end by `/adopted/session-opening-protocol.md`. All 21 elements applied:

- **Part A** (elements 1–8): tier declared (1, 2, 3, 6, 8, 9), canonical sources read in sequence (manifest, project instructions pinned, prior tech handoff, ADR-Ring-2-01 in full, summary-tech-guide reference scoped, verification framework, knowledge-gaps register, source code files via Read + Grep), KG scan completed (KG1/2/3/6/7 confirmed not relevant per the prompt's pre-screening and re-confirmed against the actual edits), hold-point status confirmed (P0 0h still active — this work permissible inside the assessment set), model selection confirmed not material (no LLM in `buildProfileSummary`'s path), status-vocabulary separation maintained throughout (implementation status for modules; decision status reserved for decision-log entries), signals and risk-classification readiness confirmed.
- **Part B** (elements 9–18): Elevated classification named pre-execution per ADR §7 Session 3; AI pushback signal used at Decision 1 (founder accepted the alternative — option (c) over the prompt's recommended (a)); Critical Change Protocol not invoked (this is Elevated, not Critical); PR6 honoured (no safety-critical surface modified); PR3 honoured (no async added); PR1 honoured (single migrated caller as the proof); PR2 honoured (verification immediate, two tsc checkpoints, live-probe queued); deferred decisions logged where applicable (no new PR7 deferrals this session); tacit-knowledge findings — push limitation at 4th recurrence (already-promoted proposal pending), stale lock at 3rd (newly proposed for promotion as D-LOCK-CLEANUP); stewardship findings none new; scope cap respected — exactly the file named in the plan touched, plus the build artefact regenerated by `tsc`.
- **Part C** (elements 19–21): system stabilised to known-good state (commit `ea505ec` ready locally, `tsc` clean, pre-commit hook passed); handoff produced in required-minimum format plus all four extensions (Verification Method Used, Risk Classification Record, PR5 Knowledge-Gap Carry-Forward, Founder Verification, Decision Log Entries — Proposed); this orchestration reminder names the protocol explicitly and confirms no element was skipped.

Authority for the work itself was `/compliance/ADR-Ring-2-01-shape-adapter.md` §7 Session 3 + §12 Session 3 notes. The protocol governed *how* the session ran; the ADR governed *what* the session built.

---

*End of session close.*
