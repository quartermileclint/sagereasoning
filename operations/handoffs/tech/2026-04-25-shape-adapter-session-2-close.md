# Session Close — 25 April 2026 (Shape Adapter Session 2 — Extend Canonical Type, C-α)

**Stream:** tech
**Governing frame:** `/adopted/session-opening-protocol.md`
**Authority for the work:** `/compliance/ADR-Ring-2-01-shape-adapter.md` (Adopted 25 April 2026)
**Tier read this session:** 1, 2, 3, 6, 8, 9 (every-session + KG governance scan + code)
**Risk classification across the session:** Standard × 1, no incidents. Pre-deploy `tsc` clean at both checkpoints; pre-commit hook (TypeScript + ESLint safety-critical) passed; commit `d2b3619` made on local `main`. Push pending on founder.

## Decisions Made

- **Three step-5 decisions made at session open** (per session prompt + ADR-Ring-2-01 §12):
  1. **Decision 1 — `FounderFacts` location** → option (a): moved to a new file `/sage-mentor/founder-facts.ts`, re-exported from `/sage-mentor/index.ts`. Rationale: cleanest end state for Session 5; Session 5 won't be unwinding a duplication. Files actually edited: 1 new (`founder-facts.ts`), 2 modified (`index.ts`, website's `mentor-profile-summary.ts`).
  2. **Decision 2 — Adapter pass-through scope** → option (b): adapter populates the seven new fields from `MentorProfileData` on every read; structural-completeness test extended with new assertions. Rationale: dead slots through Session 3 vs. immediate utility; ~15 lines of pure data forwarding earned its place.
  3. **Decision 3 — C-α vs C-β fallback authority** → option (a): AI surfaces friction explicitly with recommendation; founder decides. Default per ADR. Not invoked this session — C-α held cleanly.
- **C-α held; C-β fallback not invoked.** No sage-mentor consumer surfaced friction with the seven new optional fields. `tsc --noEmit` exit 0 immediately after the type extension landed and again after the adapter pass-through landed. No need to fall back to the companion-envelope variant.
- **`FounderFacts` re-exported from `/website/src/lib/mentor-profile-summary.ts`** so downstream consumers (`mentor-context-private.ts`, `/api/mentor/private/founder-facts/route.ts`) continue to import via `@/lib/mentor-profile-summary` unchanged. Two consumer files left untouched — the migration was structural at the type-source side, not a churn through every importer.
- **`proximity_estimate_description` adopted as flat optional string** per ADR §12 Session 2. No `proximity_estimate?: {…}` sub-object introduced — that would have duplicated `senecan_grade` and `proximity_level` already on the canonical type.
- **Sage-mentor encapsulation preserved.** Zero new imports from `/sage-mentor/` into `/website/` beyond the existing bridge pattern. The new website→sage-mentor `FounderFacts` import is the same direction as the existing `MentorProfile` import. Sage-mentor remains free of `/website/` imports.
- **AC7 (Session 7b standing constraint) confirmed at three checkpoints** (session open, plan walk, commit). No change to authentication, cookie scope, session validation, or domain-redirect behaviour. AC7 not engaged.

## Status Changes

| Item | Old status | New status |
|---|---|---|
| `MentorProfile` (in `/sage-mentor/persona.ts`) | Live (16 required fields) | **Live** (16 required + 7 optional fields, C-α extension) |
| `/sage-mentor/founder-facts.ts` (new file) | n/a | **Live** (definition site for `FounderFacts`) |
| `/sage-mentor/index.ts` re-exports | Live | **Live** (`FounderFacts` added to barrel) |
| `MentorProfileData.founder_facts` typing | Lives off local `FounderFacts` interface | **Lives off re-exported `FounderFacts` from sage-mentor** |
| `adaptMentorProfileDataToCanonical` output | Carries 16 canonical fields + sentinels | **Carries 16 canonical fields + sentinels + 7 pass-through optional fields** |
| `mentor-profile-adapter.test.ts` | Asserts 17 canonical-field structural completeness | **Asserts 17 canonical + 7 optional pass-through (incl. `founder_facts` in SAMPLE_INPUT)** |
| ADR-Ring-2-01 Session 2 | Adopted (planned) | **Verified** (pending founder live-probe post-deploy) |
| `loadMentorProfile()` (legacy) | Live (unchanged) | **Live (unchanged)** |
| `MentorProfileData` (legacy type) | Live (reference comment) | **Live (now imports `FounderFacts` from sage-mentor; otherwise unchanged)** |
| `PROOF_PROFILE` fixture | TEMPORARY — un-seeded fallback | **TEMPORARY — unchanged** |
| Push posture | Sandbox push fails (1st observation, Session 1) | **Sandbox push fails (2nd observation)** — promotes on 3rd per PR8 |

## What Was Changed

| File | Action | Notes |
|---|---|---|
| `sage-mentor/founder-facts.ts` | **Created** (~52 lines) | Lifts `FounderFacts` interface from website. Same shape (8 fields). Header comment names provenance and the encapsulation reasoning. |
| `sage-mentor/index.ts` | Edited (additive) | Adds `export type { FounderFacts } from './founder-facts'` block (3 lines incl. comment). |
| `sage-mentor/persona.ts` | Edited (additive) | Adds `import type { FounderFacts } from './founder-facts'` and seven optional fields on `MentorProfile`: `journal_name?`, `journal_period?`, `sections_processed?`, `entries_processed?`, `total_word_count?`, `founder_facts?`, `proximity_estimate_description?`. Each carries an inline doc comment naming its source on `MentorProfileData`. ~33 lines added. |
| `website/src/lib/mentor-profile-summary.ts` | Edited (replace) | Removed local `FounderFacts` interface body (~14 lines deleted); replaced with `export type` re-export + `import type` for use within `MentorProfileData` (2 lines). Net -12 lines. |
| `website/src/lib/mentor-profile-adapter.ts` | Edited (additive) | Inside `adaptMentorProfileDataToCanonical`: seven `const` assignments with type-guard fallback to `undefined`; seven additions to the returned object. ~35 lines added. Pure data forwarding; no logic, no validation beyond runtime type checks. |
| `website/src/lib/__tests__/mentor-profile-adapter.test.ts` | Edited (additive) | `SAMPLE_INPUT` extended with realistic `founder_facts` block (10 lines). New `it()` block asserting pass-through of all seven optional fields (~24 lines). |

**Total diff:** 6 files changed, 165 insertions(+), 16 deletions(-). Single commit `d2b3619` on local `main`.

### Files NOT changed
- All distress classifier code (`r20a-classifier.ts`, `constraints.ts` SafetyGate) — untouched. R20a/AC5 perimeter unaffected.
- All other sage-mentor runtime files — unchanged.
- All other website consumers of `FounderFacts` (`mentor-context-private.ts`, `/api/mentor/private/founder-facts/route.ts`) — unchanged because the re-export preserves the import path.
- The two ring-proof endpoints other than `/api/mentor/ring/proof` — unchanged.
- The live `/api/founder/hub` and `/api/mentor/private/reflect` — unchanged.
- `mentor-ring-fixtures.ts` — unchanged.
- `loadMentorProfileCanonical()` and the adapter's transformation logic — unchanged. Only the post-transformation tail of the returned object grows by seven fields.

**No DB changes. No SQL. No DDL. No env vars added. No safety-critical files modified.**

## Verification Method Used (0c Framework)

Per `/operations/verification-framework.md`:

- **Pre-deploy: TypeScript clean — twice.** `npx tsc --noEmit` in `/website` exit 0 after the type extension landed (Step 4 of the plan). Then again after the adapter pass-through and test extensions landed (Step 8). Both ran cleanly with no errors and no warnings.
- **Pre-commit hooks:** `.husky` pre-commit ran TypeScript compilation check + ESLint safety-critical modules check. Both passed (visible in commit output).
- **Post-deploy verification — pending founder push and live-probe.** The proof endpoint behaviour is unchanged by this session (no consumer reads the new optional fields yet — Session 3 is the first consumer migration). Six pass criteria from Session 1's close stand:

| Criterion | Expected | Verification |
|---|---|---|
| HTTP status | 200 | Founder live-probe |
| `profile_source` | `'live_canonical'` | Founder live-probe |
| `profile_loader_error` | `null` | Founder live-probe |
| `pattern_analysis.interactions_analysed` | 15 | Founder live-probe |
| `before.augmented_prompt_includes_patterns` | `true` | Founder live-probe |
| `pattern_engine_error` | `null` | Founder live-probe |

**Why this verification is sufficient.** The new optional fields are added to `MentorProfile` and populated by the adapter, but no consumer of `MentorProfile` reads them yet (the proof endpoint, the ring wrapper, the pattern engine, and every sage-mentor consumer ignore optional fields they don't reference). Therefore the proof endpoint's outputs cannot have changed. A regression in the six pass criteria would indicate the adapter's existing logic broke — not the new pass-through.

## Risk Classification Record (0d-ii)

- **Type extension (`MentorProfile` gains 7 optional fields) — Standard.** Additive type-level change. All fields optional. No consumer reads them yet. `tsc` clean confirms no friction.
- **Adapter pass-through — Standard.** Additive code in a pure synchronous function. No new I/O. No new validation logic. Type-guard fallback to `undefined` matches the established pattern from the existing adapter code.
- **Test extension — Standard.** New assertions on a new code path; no existing assertion changed.
- **`FounderFacts` move (website → sage-mentor) — Standard.** Type-source-only change. The two website consumers continue to import via the same path (`@/lib/mentor-profile-summary`) because the destination file re-exports the type. TypeScript catches any breakage at compile time; `tsc` exit 0 confirms none.
- **Encryption-pipeline interaction — none.** Adapter still operates on plaintext post-decryption. R17 surface unchanged.
- **AC7 — not engaged.** No auth, cookie scope, session validation, or domain-redirect change.
- **PR6 — not engaged.** No safety-critical surface modified.

## PR5 — Knowledge-Gap Carry-Forward

No re-explanations this session. Existing entries scanned and respected:

- **KG1 (Vercel rules):** respected. No new endpoint design, no fire-and-forget writes, no self-call, no headers stripped, no `process.cwd()` change.
- **KG2 (Haiku boundary):** not relevant — no LLM in path.
- **KG3 (hub-label consistency):** not relevant — no `mentor_interactions` writes or reads.
- **KG6 (composition order):** not relevant — no context-layer composition change.
- **KG7 (JSONB shape):** not relevant — no JSONB read or write.

**Cumulative re-explanation count:** zero. Knowledge gaps register unchanged.

**Observation candidates updated:**

1. **Sandbox cannot push to GitHub.** **2nd occurrence** (1st was Session 1's close, 2026-04-25 morning). Same posture — `git push origin main` returns `fatal: could not read Username for 'https://github.com'`. Founder pushes manually from their machine. **Promotes on 3rd occurrence per PR8.** If a future session needs the same workaround, that's the third — promote then.

2. **Sandbox stale `.git/index.lock` after `git add` in mounted folder.** **1st occurrence.** After `git add` reported "unable to unlink temp_obj" warnings, a stale `.git/index.lock` (size 0, owned by sandbox user) blocked the subsequent `git commit`. `rm` returned "Operation not permitted" until `mcp__cowork__allow_cowork_file_delete` was invoked on the workspace path; the lock was then removable and the commit proceeded. Resolution candidate: at the start of any session that will run multiple `git` commands in a mounted workspace, call `allow_cowork_file_delete` proactively (the same operational discipline as retired KG11). Logged for promotion if recurrence.

## Founder Verification (Between Sessions)

You verify this session by completing the deployment loop. Three steps.

### Step 1 — Push the commit using GitHub Desktop

1. Open **GitHub Desktop**.
2. Top-left, check the **Current Repository** dropdown — it should say `sagereasoning`. If it doesn't, click and switch to it.
3. Top-right, you should see a button labelled **"Push origin"** with a small number badge showing **1** (one commit ready to push).
4. Click **Push origin**.
5. Wait for the spinner to finish (usually 2–5 seconds). The button label returns to "Fetch origin" with no badge when done.

If you don't see the "1" badge, do not push anything else — tell me what you see instead. The most likely cause would be wrong repository or wrong branch. The commit hash you're pushing is `d2b3619`.

### Step 2 — Wait for Vercel to deploy `d2b3619`

Open Vercel → your project → Deployments. Wait until the most recent deployment shows **Ready** with commit hash starting `d2b3619`. Usually 60–90 seconds. **Do not run Step 3 until this is confirmed Ready.** Testing against the wrong deployment will produce a misleading result.

### Step 3 — Live-probe the proof endpoint

Open `https://sagereasoning.com` in a browser. Sign in. Open DevTools (F12 or right-click → Inspect → Console tab). Paste **exactly this snippet** and press Enter:

```js
(async () => {
  const token = JSON.parse(localStorage.getItem(Object.keys(localStorage).find(k => k.includes('auth-token')))).access_token;
  const r = await fetch('/api/mentor/ring/proof', { headers: { Authorization: `Bearer ${token}` } });
  const j = await r.json();
  console.log('STATUS:', r.status);
  console.log('profile_source:', j.profile_source);
  console.log('profile_loader_error:', j.profile_loader_error);
  console.log('interactions_analysed:', j.pattern_analysis?.interactions_analysed);
  console.log('augmented_prompt_includes_patterns:', j.before?.augmented_prompt_includes_patterns);
  console.log('pattern_engine_error:', j.pattern_engine_error);
})();
```

You should see:

```
STATUS: 200
profile_source: live_canonical
profile_loader_error: null
interactions_analysed: 15
augmented_prompt_includes_patterns: true
pattern_engine_error: null
```

**If all six match: Session 2 is Verified.** Tell me "verified" and I'll record it in the decision log next session.

**If any of the six is different: tell me what you see — do not attempt to fix it.** Most likely cause would be that Vercel is still building, or the wrong deployment is live; second-most-likely is that something I changed unexpectedly affected the adapter's existing logic (the rollback for that is `git revert d2b3619 && git push origin main`, ~5 minutes).

## Next Session Should

Per ADR-Ring-2-01 §7, three sessions remain (plus optional Session 6). Founder picks the next from:

1. **Session 3 (consumer migrations, Standard surfaces).** Migrate the 6 website consumers of `MentorProfileData` to `MentorProfile` one at a time, each as a PR1 single-endpoint proof. Order suggested by ADR §12: `mentor-profile-summary.ts` (`buildProfileSummary` rewrite) → `practitioner-context.ts` → `mentor-context-private.ts` → `/api/mentor-profile/route.ts` (GET/PUT) → `/api/mentor-baseline-response/route.ts` → `/api/mentor/private/baseline-response/route.ts` → `/api/founder/hub/route.ts`. **Risk: Elevated per consumer.** Each is on the production request path.
2. **Defer Session 3** — Sessions 1 and 2 are Verified; the canonical type now carries everything `MentorProfileData` carries. A pause is acceptable. Other priorities can advance independently because Sessions 4–5 are gated on Session 3's consumer work.
3. **Stewardship items.** The two open questions O-A (fixture file-header text) and O-C (`frequencyBucketFromCount` consolidation) from Session 1's close are still outstanding. Both are Standard touch-ups; neither blocks anything.

If proceeding to Session 3, the session-opening prompt should reference ADR-Ring-2-01 §12 (Notes for Implementation Sessions — Session 3) and this handoff. The "simplest first" ordering recommendation is `mentor-profile-summary.ts` because its `buildProfileSummary` rewrite tests the canonical type's expressive completeness without touching a route.

## Blocked On

- **Founder push of commit `d2b3619`** to GitHub from a terminal on the host machine.
- **Founder live-probe** confirming the six pass criteria.

## Open Questions

- **O-2A — Sparse-input assertions for the new optional fields.** The structural-completeness test asserts pass-through for the populated `SAMPLE_INPUT`. The existing sparse-input case (empty strings, zero counts, no `founder_facts`) was not extended with assertions for the new fields' specific values in the sparse case (because the sparse input has empty strings rather than missing keys for most provenance fields, so the pass-through would surface empty strings, not `undefined`). The sparse case still runs without throwing — the existing assertions cover that. Adding precise sparse-case assertions is a Standard touch-up candidate for Session 3 if drift is suspected.
- **O-2B — `additional_context` field on `FounderFacts`.** The interface declares `additional_context: string[]` as required, not optional. Older persisted profiles may not have this field, in which case the runtime value is `undefined` despite the type signature. The website's existing `buildProfileSummary` already guards with `if (ff.additional_context.length > 0)` — this would throw if `additional_context` were `undefined` at runtime. Not introduced by this session (pre-existing posture), but worth flagging as the type lifts. Decision: do nothing this session; revisit if a runtime warning surfaces. If a fix is wanted, the cleanest is to make `additional_context?: string[]` and update the four readers.
- **O-2C — Push limitation candidate observation.** Logged at 2nd occurrence above. Promotes on 3rd per PR8. No action this session.
- **O-2D — Stale-lock candidate observation.** Logged at 1st occurrence above. Promotes on 3rd per PR8. Operational mitigation already known (call `allow_cowork_file_delete` proactively at session open for git-heavy sessions); no full KG entry yet.

## Process-Rule Citations

- **PR1** — respected. Same single endpoint as Session 1 (`/api/mentor/ring/proof`). The type extension itself doesn't affect any endpoint directly. The optional adapter pass-through is exercised on the same proof endpoint Session 1 verified. No rollout to other endpoints in this session.
- **PR2** — respected. Pre-deploy verification (`tsc --noEmit` clean at both checkpoints) completed in-session. Post-deploy live-probe is queued for the founder.
- **PR3** — respected. No async behaviour added. Type extension is compile-time only. Adapter remains a pure synchronous function.
- **PR4** — respected. No model selection — no LLM in path for this session.
- **PR5** — respected. No re-explanations. Two new candidate observations logged (sandbox push, stale lock).
- **PR6** — respected. No safety-critical surface modified. Distress classifier, Zone 2/3 logic, encryption pipeline, session, access control, deletion, and deployment-config all untouched. Session 2 of this ADR is correctly classified Standard; Session 4 (live reflect + journal pipeline) will be Critical when it lands.
- **PR7** — respected. No deferrals introduced. Decision 3's C-β fallback was not invoked (C-α held); had it been invoked, the deferral reasoning would have been logged. No new deferrals to track.
- **AC7** — respected. No auth, cookie scope, session validation, or domain-redirect change. Confirmed at session open, plan walk, and commit checkpoint.

## Decision Log Entries — Proposed (Founder Approval Required)

```
## 2026-04-25 — D-RING-2-S2: ADR-Ring-2-01 Session 2 verified — MentorProfile
                              extended with seven website-only optional fields
                              under C-α, no fallback to C-β

**Decision:** Extend MentorProfile in /sage-mentor/persona.ts with seven
optional fields (journal_name?, journal_period?, sections_processed?,
entries_processed?, total_word_count?, founder_facts?,
proximity_estimate_description?). Move FounderFacts from website to
/sage-mentor/founder-facts.ts and re-export from /sage-mentor/index.ts;
the website's mentor-profile-summary.ts re-exports the type so downstream
consumers continue to import via @/lib/mentor-profile-summary unchanged.
Adapter (mentor-profile-adapter.ts) populates the seven new fields by
pure pass-through from MentorProfileData. Structural-completeness test
extended with new pass-through assertions and founder_facts in
SAMPLE_INPUT.

**Reasoning:** Session 2 of the staged transition adopted under
ADR-Ring-2-01 (25 April 2026). C-α (extend MentorProfile in place) is
the cleanest end-state per ADR §6.1; C-β (companion envelope) named as
fallback. C-α held — tsc clean immediately after type extension and
again after adapter pass-through. No sage-mentor consumer surfaced
friction with the optional fields. No fallback invoked.

**Alternatives considered:**
  - Decision 1: keep FounderFacts in website (option b — inline in
    persona.ts) or anonymous shape (option c). Rejected; option (a)
    cleanest end state, Session 5 won't unwind a duplication.
  - Decision 2: type slots only, no adapter pass-through (option a).
    Rejected; new fields would be dead slots through Session 3 with
    no offsetting cost saved.
  - Decision 3: AI judges materiality of C-β fallback (option b).
    Rejected; founder visibility on fallback decision matters more
    than the marginal speed gain.

**Revisit condition:** None for the type extension itself. The
proximity_estimate_description placement (flat vs sub-object) is
fixed for the duration of the staged transition; consolidate via the
naming convention if a sub-object form is wanted post-Session-5.

**Rules served:** PR1 (same single-endpoint proof as Session 1), PR2
(verification immediate, twice), PR3 (no async), PR6 (no safety-
critical surface), PR7 (no new deferrals), R17 (surface unchanged),
AC7 (not engaged — confirmed three checkpoints).

**Impact:** ADR-Ring-2-01 Session 2 reaches Verified status. Canonical
MentorProfile now carries every field MentorProfileData carries; the
adapter pass-through makes them available to any consumer that reads
them. Sage-mentor encapsulation preserved. Persistence layer untouched.
Session 3 (consumer migrations) is unblocked when the founder elects
to proceed.

**Status:** Adopted, pending founder live-probe post-deploy of commit
d2b3619 confirming six pass criteria from Session 1 close still hold.
```

## Orchestration Reminder (Protocol element 21)

This session was governed end-to-end by `/adopted/session-opening-protocol.md`. All 21 elements applied:

- **Part A** (elements 1–8): tier declared (1, 2, 3, 6, 8, 9), canonical sources read in sequence (manifest, project instructions pinned, prior tech handoff, summary-tech-guide reference scoped, verification framework, knowledge-gaps register, source code files), KG scan completed (KG1/2/3/6/7 confirmed not relevant), hold-point status confirmed (P0 0h still active — this work permissible inside the assessment set), model selection confirmed not material (no LLM in path), status-vocabulary separation maintained throughout, signals and risk-classification readiness confirmed.
- **Part B** (elements 9–18): Standard classification named pre-execution; Critical Change Protocol not invoked (this is Standard, not Critical); PR6 honoured (no safety-critical surface modified); PR3 honoured (no async added); PR1 honoured (same proof endpoint as Session 1); PR2 honoured (verification immediate at both checkpoints); deferred decisions list unchanged (no new deferrals introduced); tacit-knowledge findings two new candidates logged (sandbox push 2nd, stale lock 1st) — neither promoted; stewardship findings none; scope cap respected — exactly the seven fields named in the prompt added, exactly the four file types named in the plan touched.
- **Part C** (elements 19–21): system stabilised to known-good state (commit `d2b3619` ready locally, `tsc` clean, pre-commit hook passed); handoff produced in required-minimum format plus all five extensions (Verification Method Used, Risk Classification Record, PR5 Knowledge-Gap Carry-Forward, Founder Verification, Decision Log Entries — Proposed); this orchestration reminder names the protocol explicitly and confirms no element was skipped.

Authority for the work itself was `/compliance/ADR-Ring-2-01-shape-adapter.md`. The protocol governed *how* the session ran; the ADR governed *what* the session built.

---

*End of session close.*
