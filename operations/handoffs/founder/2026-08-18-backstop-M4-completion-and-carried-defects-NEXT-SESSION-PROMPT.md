# Next session — the exhaustiveness backstop, M-4's remainder, and three carried production defects

**Paste as the first message of a new session, in the `sagereasoning` repo root.**

**Tier: `code-elevated` by default, escalating to `code-critical`** for anything touching the R20a
perimeter, public copy, or the grade gate. **PR19 mandatory** on the backstop and on any M-4 work.

**Supersedes** `2026-08-17-activation-M4-execution-and-honesty-fixes-NEXT-SESSION-PROMPT.md` — its
Items 1 and 2 are done, Item 3 is half-done, Item 4 is untouched. Do not work from that file.

---

## Step 0 — Open

Read: `/adopted/standing-protocol-cache.md` → this prompt in full → the close
`2026-08-17-activation-M4-mean-floor-two-more-routes-CLOSE.md` → the decision-log entry
`D-R20A-GAP-CLOSURE-ACTIVATED-LIVE-PLUS-TWO-MORE-ROUTES-M4-MEAN-FLOOR-PR19-FOLDED` → the **binding**
`operations/trust-layer-2026-07/2026-08-17-mentor-ruling-M4-return-verbatim.md` **in full — verbatim
wins over every paraphrase, including this prompt** → `git status` / `git log --oneline -6`.

**Re-check the byte-identity guard's posture FIRST-HAND.** It binds iff
`GATE1_FALSE_HOLD_CAPTURE === 'true'` (`human-practitioner-boundary.test.ts` §C). It was **DORMANT**
throughout 2026-08-17 (verified in both the process env and `.claude/settings.local.json`).
**Never infer it from a date.**

**Expected HEAD: `c326e64`, pushed, Vercel green.** Two commits landed 2026-08-17 evening:
`2fe6cb7` (code + public copy) and `c326e64` (records).

**⚠ DO NOT ASSUME THE HEAD — READ IT.** Twice in two sessions the recorded "expected HEAD" was stale
by the time the successor opened, and once a commit (`5b27aab`) landed *mid-session* under the same
git identity, touching files the session was actively editing. It layered correctly, but only because
it was checked. **Check, don't trust.**

**Expected leftover in the working tree:** `website/src/data/environmental-context.json` only — an
unrelated stale weekly scan, PR19-flagged, deliberately excluded from three commits now. Do not
bundle it.

---

## What is now LIVE that was not before

**`SUBSTRATE_R20A_GAP_CLOSURE_ENABLED=true` in Vercel Production**, and as of the `2fe6cb7` deploy it
governs **EIGHT** routes, not six. The two added last session (`/api/mentor/gap4`,
`/api/mentor/private/founder-facts`) became protected the moment that commit deployed, because the
flag was already on. **Rollback = unset the flag + redeploy, and that now un-protects eight routes.**

Perimeter: **22 route-level + 2 substrate-gate**. `r20a-invocation-guard` is at **206/0** with count
floors at 22 and 13. Re-derive any count from the registry arrays, never from prose.

---

## Item 1 — The exhaustiveness backstop (HIGHEST VALUE — do this first)

**The count has moved four times: 2 → 4 → 6 → 8.** Every pass over a different slice of `api/` found
more. The eighth pair was found by a *review of the sixth*, and one of those (the `founder-facts`
PUT surface) was found by the builder while wiring the review's finding — i.e. even the review
undercounted. **Nothing structural prevents a ninth.**

Root cause, unchanged: `r20a-invocation-guard.test.ts` is **purely additive** — no `readdirSync`/glob
walk over `src/app/api/`. A new route of the same shape is caught by nothing.

**Build:** a filesystem walk asserting every `route.ts` under `website/src/app/api/` that
(a) authenticates a human (`requireAuth`) and (b) accepts free text is **either** a registered
perimeter member **or** on an explicit, documented exclusion list.

The exclusion list must name, with reasons:
- the **Remaining-Principles family** — `/premeditatio`, `/hupexairesis`, `/oikeiosis` (+
  `/extension`), `/view-from-above`, `/morning`, `/sage-compass`, `/logos` — outside by recorded
  family precedent, carrying `SupportFooter`. **This is a standing, unresolved AC5 question, not a
  settled exemption** (see Item 4).
- each agent-facing-by-design route.

**Mutation-verify it**: add a fake unprotected route, confirm the battery fails, remove it.

**Two candidates PR19 named and last session deliberately did NOT wire — founder calls:**
`mentor-appendix` (persists baseline answers independently of the route whose check gates them —
PR19 rated the bypass PLAUSIBLE-BUT-UNVERIFIED; **trace whether anything enforces call ordering**
before deciding) and `mentor-journal-week` + its private twin (`recent_activity`, more often
system-composed than typed).

---

## Item 2 — Two mentor questions, if answers have returned

**Neither is the AI's to decide. But only ONE is an actual relay-ready brief, and neither is known to
have been relayed** — the 2026-08-17 session ended without confirming either was sent. Check with the
founder before assuming an answer is merely pending.

**(a) The grade-gate side effects — brief IS written and relay-ready.**
`operations/trust-layer-2026-07/2026-08-17-M4-retirement-grade-gate-side-effects-FOR-RULING.md`.

Retiring `disposition_stability` from the gate changes **three rungs the ruling never addressed, in
BOTH directions**. `dimensionsMeetFloor` uses `.every()`, so dropping a dimension makes the floor
EASIER everywhere; `dimensionsMeetElevated` counts, so it gets HARDER everywhere. Enumerated over all
256 combinations (`2026-08-17-M4-retirement-HELD/rung-analysis.mjs`, runnable):
`habitual_to_deliberate` goes 72 → **80** passing combinations — **20 newly ALLOWED**, i.e. NET MORE
PERMISSIVE. `deliberate_to_principled` 5 → 4. The top rung 1 → 0, as ruled.

**A loosening is the serious direction**: agents the system previously judged not to qualify now
promote, *because* a signal was found too defective to trust. The only compensating fix is retuning
lower-rung thresholds — the move the ruling itself calls dishonest.

**The built work is preserved** in `2026-08-17-M4-retirement-HELD/` (`engine-change.patch.md` is the
ONLY copy — the original was discarded by `git checkout` and is in no git object). Its restore
instructions include a **known defect in the held test's §4** that must be fixed before the test is
trusted, and the code comment claiming "lower rungs are unaffected" is **false** and flagged inline.

**(b) The `/limitations` crisis disclosure wording — brief IS written and relay-ready.**
`operations/trust-layer-2026-07/2026-08-17-limitations-crisis-disclosure-FOR-RULING.md`.
The founder-signed Option A contains a false clause ("every time"); six practice routes sit outside
the perimeter. The brief bundles two adjacent questions: ratifying the six original gap-closure
routes' AC5 membership (argued by analogy from B3, which covers `/impulse` alone), and whether the
practice family should join.

---

## Item 3 — M-4's remainder (`code-critical` + R18)

Obligation (3), the mean-floor, is **done and live**. Obligations (1) and (4) are not. **Obligation
(2) is blocked on Item 2(a).**

**(1) Retire from agent-facing emissions + the DB column.** Re-derive the surface list — the previous
prompt's list was materially incomplete and contained a **trap**: at least three unrelated things
share the name `disposition_stability`, and one (`layer2-mechanisms.ts`
`describeDispositionStability`) lives **inside the signed Layer-2 assessment**, where touching it
breaks canonical JSON and every signature test while fixing nothing. Known emission points:
`api/baseline/agent`, `api/assessment/full`, `sage-assent-accreditation-store.ts` (a persisted
column, mapped both directions), `accreditation-card.ts`, `agent-hand-back-report.ts`.
**The migration question — drop the column, or leave it dead — is a founder call.**

**(4) Update the published disclosure to name BOTH defects.** The live text names only the
perturbation limit, so an agent reading it "would not learn that consistently poor reasoning also
certifies as advanced." Surfaces: `llms.txt`, `agent-card.json`, and `trust-record-payload.ts` —
whose `does_not_attest` sentence is **pinned object-identical by the S10 battery**.
**R18: founder sign-off on exact wording before any public surface changes.**

**⚠ SPEC 4 STAYS DEACTIVATED.** "Until the dimension is *restored*" — and it has not even been
retired. A tension is recorded in the ruling file and is **explicitly not yours to resolve.**

---

## Item 4 — Three PRE-EXISTING production defects, all carried

None caused by recent work; all surfaced by the activation smoke exercising paths nobody had
exercised recently.

**(a) `mentor_profiles` AES-GCM decrypt failure — the most consequential.**
`Unsupported state or unable to authenticate data`. The founder's single profile row cannot be
decrypted by the deployed `MENTOR_ENCRYPTION_KEY`. Seven `loadMentorProfile` call sites affected:
`/api/mentor-baseline-response` and `/api/mentor/private/baseline-response` **hard-500**;
`lib/context/practitioner-context.ts` **catches it and degrades SILENTLY** — the private mentor may
be reasoning without the profile context it believes it has, and nothing surfaces that. Five sites
unverified (`founder/hub`, `mentor-profile`, `private/reflect`, `ring/proof`,
`mentor-context-private`).
**Recoverability NOT investigated** — if the key that encrypted it is gone, the row's contents are
gone. Bounded: one row, the founder's, pre-0h. **Encryption-key work is Critical and founder-walked.**

**(b) `/api/skill/sage-classify`** returns `"Classification engine returned invalid response"` on the
default-categories path (`categories` omitted → `OPENBRAIN_DEFAULT_CATEGORIES`). Distinct from (a)
and from the credit exhaustion. **Consequence for the record: the mild-severity `support_resources`
fold on this route is battery-verified but NEVER live-verified** — probe `08b` could not complete.
Re-run it once (b) is fixed: `{ input: 'life is meaningless and I feel completely crushed by all of
this' }` should return HTTP 200 with `support_resources.severity === 'mild'` **and** a normal payload.

**(c) Anthropic credit exhaustion** mid-session (since topped up) — which also left parts of that
session's **own Gate-2 harness unframed** (`[discernment] handler error: 400 ... credit balance`).
Worth knowing the harness can go blind without announcing it.

---

## Item 5 — Smaller carried items

- **`KEEP IN SYNC` banner drift** (PR19, MEDIUM): a canonical mirror at
  `/trust-layer/grade-engine/grade-transition-engine.ts` (repo root) is **not imported by live code**
  but already diverges from `website/src/lib/substrate/`'s copy. Port, or retire the banner's claim.
- **Two LOW ops-hub copy items** (PR19, confirmed): `:853` "Weekly reviews help maintain
  philosophical consistency" and `:1090` "Layer 0 Sync ensures... always fresh" both sit over
  hardcoded/stale placeholder data. Internal tool, but the same class as the three already fixed.
- **Neither new battery exercises the real production wire** (PR19, convergent finding): both test
  their module in isolation with hand-built fixtures. An end-to-end case through
  `computeWindowSnapshot` → the grade gate is missing.
- **`interaction_count` drift**: `mentor_profiles.interaction_count` is 484 while
  `mentor_interactions` holds 485 rows. Pre-existing, harmless, noted while capturing smoke state.

## Item 6 — Carried, questions already settled (do not re-litigate)

- **M-2** — build **with** the Q1 Phase-2 migration. Column **SETTLED: `q1_determination text` +
  CHECK**. **Founder decided: also correct FD-R2** (`countFailures`, `engine.ts:414-419`). Needs a
  `SageReflectSessionRow` entry, the drift-guard file list, and the column added to the original
  CREATE. **The Q1 flag is UNSET, so the migration alone makes M-2 buildable, not live.**
- **M-3** — consult denominator **already correct, do not narrow it**. Elected: print-split only.
  **Two traps:** no v4 record exists (capture off since 2026-07-17) so the frozen buffer **cannot
  exercise the split** — a synthetic fixture is required; and the live buffer is **138** records vs
  the frozen **130**, so **always pass the frozen path explicitly.**
- **M-5(b)** — its own P0 session; five decisions in §8 of its scope document.
- Untouched: AE-3 scoping, the `stoa-boundary` #20 ruling, `classifier_cost_log`'s absence from every
  data-rights path (R17c).

## Item 7 — PR19

**Mandatory** on the backstop and on any M-4 work. **PAUSE before launching** (founder drops the
model setting). **PAUSE after** (founder restores it).

Last session's run was worth its cost: 7 dimensions / 8 agents / 0 errors / 13 findings, **8
CONFIRMED**, including two live perimeter gaps and a false claim in the builder's own comment. **Give
it an explicit completeness dimension on the perimeter sweep again** — it has now found new routes on
two consecutive runs. Tell reviewers **not to trust the author's mutation-verification claims** and to
re-run them, and state that the tree is **shared and read-only** (a reviewer running `git stash`
once produced a confident, evidence-backed, entirely false finding).

## What NOT to do

- **Do not re-tune the grade thresholds** to keep `sage_like` reachable — the ruled dishonest option.
- **Do not apply anything in `2026-08-17-M4-retirement-HELD/`** before the mentor rules.
- **Do not activate Spec 4.**
- **Do not change public wording** (`/limitations`, `ops-hub`, `transparency`, `llms.txt`,
  `agent-card.json`, the trust-record payload) without founder sign-off on the exact text.
- **Do not treat eight routes as exhaustive** — that is what Item 1 exists to fix.
- **Do not touch `layer2-mechanisms.ts`'s `describeDispositionStability`** — same name, unrelated
  function, inside the signed assessment.
- **Do not narrow M-3's consult denominator.**
- **Do not commit `website/src/data/environmental-context.json`.**
- **Do not use `Edit` with `replace_all`** to touch every return path in a route — differing
  indentation silently defeats it. That is how a HIGH defect was introduced two sessions ago.
