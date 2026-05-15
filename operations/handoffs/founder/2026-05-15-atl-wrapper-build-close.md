# Session Close — 2026-05-15 — ATL Wrapper Session 5: The Wrapper (Components 1 + 4)

**Stream:** founder.
**Governing frame:** `/adopted/standing-protocol-cache.md` (general protocol) + `/adopted/build-sessions-protocol-cache.md` (build-arc context).
**Tier:** `code-standard` — **Standard** risk under 0d-ii. Lean template.
**Date:** 2026-05-15.
**Operative session prompt:** `/operations/handoffs/founder/2026-05-16-atl-wrapper-build-NEXT-SESSION-PROMPT.md`.

---

## What this session did

ATL Wrapper spec **step 5 — the wrapper itself**. The founder elected the **Components 1 + 4** scope at Step 0 (the recommended option) and pre-approved all four Step 2 design decisions as recommended. The carried-profile mechanism is now **real**: `atl-wrapper.ts` accumulates an agent's substrate consultations into a `CarriedProfile` and aggregates it into a `WindowSnapshot` + a grade transition. The `/trust-layer/` ↔ `website` integration boundary — the bridge session's carried-forward open question — is **resolved**.

**Part A — opened under the protocol.** Read both caches, the predecessor score-wiring close, the ATL Wrapper spec **in full**, the `/trust-layer/` BUILD-LOG + the 5 window/grade files in full, `atl-bridge.ts` (re-read the tsconfig-boundary header), and the last three decision-log entries. PR15 consult + PR11 inbox scan done — no Anthropic primitive delivers an in-process deterministic accumulator/aggregator; no `/inbox/` files since the predecessor session; the agentic-commerce findings tracker carries no F-finding targeting this session (F4 is a contextual note only — its target is A12).

**Step 1 — surveyed the integration surface.** Three findings worth recording: (1) the dependency closure of `computeWindowSnapshot` + `evaluateGradeTransition` is **5 files / ~1,700 lines**, not the full `/trust-layer/` ~4,200; (2) `atl-bridge.ts`'s mirrored `EvaluatedAction` matches the `/trust-layer/` original field-for-field — no drift; (3) the ported `/trust-layer/` functions **read the system clock** for their ISO-timestamp fields — `accumulate` is fully pure, but `computeTrajectory` is deterministic only modulo timestamps. Plus: `evaluateGradeTransition` needs a *prior* `AccreditationRecord`, so the `CarriedProfile` carries one (seeded at reflexive / pre_progress for a fresh agent).

**Step 2 — design-decision gate** (consolidated; founder pre-approved all four as recommended): (1) the `/trust-layer/` integration boundary — **port** the 5-file closure into `website/src/lib/substrate/trust-layer/` (option a — stays Standard risk; the founder did NOT elect the Elevated tsconfig option, so no reclassification); (2) the carried-profile data structure + the `atl-wrapper.ts` module location; (3) storage — **wrapper-side carriage, no server persistence**; (4) the `carried_profile` payload carries the aggregated **`WindowSnapshot`**, not the raw action list. Plus the founder-elected sub-decision: **repoint `atl-bridge.ts`** at the ported canonical types.

**Steps 3–4 — built and verified.** Built `atl-wrapper.ts` (Components 1 + 4), the 5-file ported `/trust-layer/` closure (verbatim mirrors, KEEP-IN-SYNC banners), and the repoint of `atl-bridge.ts` (its local type mirror removed — one definition in `website/src` now). Wrote `atl-wrapper.test.ts` — **55 assertions**, invoking every exported function (PR2). `tsc --noEmit` clean; all seven prior-arc regressions green and unchanged.

Six new files (the wrapper, its test, the 5 ported files) imported by no route, plus one pure refactor of `atl-bridge.ts` (a not-yet-wired module). Nothing wired to a route; no env flag; no production surface touched.

## Decisions Made

- **`D-ATL-WRAPPER-WIRED-VERIFIED-2026-05-15`** appended (lean form, +~70 lines). Components 1 + 4 built + Verified; the four Step 2 decisions + the bridge-repoint sub-decision recorded with reasoning; the `/trust-layer/` ↔ `website` integration boundary recorded as **resolved** (closing the open question from `D-ATL-BRIDGE-WIRED-VERIFIED-2026-05-15`).

## Status Changes

| Item | Old | New |
|---|---|---|
| ATL Wrapper Component 1 (carried-profile mechanism) | Designed (spec) | **Verified** (Scaffolded → Wired → Verified this session) |
| ATL Wrapper Component 4 (trajectory awareness) | Designed (spec) | **Verified** (Scaffolded → Wired → Verified this session) |
| `atl-wrapper.ts` | — (did not exist) | **Verified** (new module; 55/0 test) |
| `/trust-layer/` window/grade closure (5 files) | Verified at `/trust-layer/` (offline, pre-substrate) | **Verified, ported** into `website/src/lib/substrate/trust-layer/` (in-tsconfig, KEEP-IN-SYNC mirrors) |
| `atl-bridge.ts` | Verified (local `EvaluatedAction` mirror) | **Verified** (repointed at the ported canonical types; 31/0 unchanged) |
| `/trust-layer/` ↔ `website` integration boundary | Open question (deferred from the bridge session to "the wrapper build") | **Resolved** — porting elected + done |
| `score-architecture.ts` / `agent-mode-service.ts` / `philosophical-mode-service.ts` | Verified | **Unchanged** (regressions 69/0, 63/0, 43/0) |
| Production state | A7 Verified; flags UNSET; steady-state | **Unchanged** — no code wired to a route; no env-var, schema, auth, or R20a-perimeter change |

## Next Session Should

There are two unblocked next steps; the founder elects which at session-open.

**ATL Wrapper Session 6 — Component 5 (the three iteration patterns):** sequential loop / parallel evaluation / multi-agent orchestration. Pattern 3 (multi-agent orchestration) carries a **load-bearing PR15 consult** — the spec flags Anthropic's multi-agent-orchestration primitive (public beta) as a named primitive the build session MUST evaluate before electing a bespoke build. `code-standard` expected, ~3–4 hr; consumes the now-Verified `atl-wrapper.ts`. Pre-conditions: this session committed + pushed, Vercel green.

**ATL Wrapper step 6 — the badge (Component 3):** `AccreditationRecord` / `AccreditationPayload` / `public-endpoint.ts` / `accreditation-card.ts`, Supabase-integrated. This is **higher-risk** — it adds a public verification endpoint (an auth + a route surface) and engages the existing build's pending Supabase integration + the DRAFT 5-table schema. Likely `code-elevated` or `code-critical` per the auth surface; the build session classifies. It ports the remaining `/trust-layer/` files (badge / card) it needs. Once the badge lands, the **trajectory-enriched developer hand-back report** becomes buildable.

The **ATL Wrapper Session 6 next-session prompt (Component 5 — the three iteration patterns)** is drafted and ready to paste into a new session: `/operations/handoffs/founder/2026-05-16-atl-wrapper-session6-component5-NEXT-SESSION-PROMPT.md`. A step-6 (badge) prompt is drafted separately if the founder elects that path instead at session-open.

## Blocked On

**Files remaining uncommitted (to be committed by the founder):**

```
 M website/src/lib/substrate/atl-bridge.ts                                    (pure refactor — the repoint; local type mirror removed)
 M website/tsconfig.tsbuildinfo                                               (incremental-build cache)
 M operations/decision-log.md                                                (entry appended)
?? website/src/lib/substrate/atl-wrapper.ts                                   (NEW — the wrapper, Components 1 + 4)
?? website/src/lib/substrate/__tests__/atl-wrapper.test.ts                    (NEW — 55 assertions)
?? website/src/lib/substrate/trust-layer/                                     (NEW — the 5-file ported closure)
?? operations/handoffs/founder/2026-05-15-atl-wrapper-build-close.md          (this file)
```

The `trust-layer/` directory contains 5 files: `types/accreditation.ts`, `types/evaluation.ts`, `accreditation/accreditation-record.ts`, `evaluation-window/window-aggregator.ts`, `grade-engine/grade-transition-engine.ts`.

**Production state at session close:** unchanged from session start. Substrate at A7 Verified. `SUBSTRATE_LAYER3_ENABLED` UNSET. `SUBSTRATE_R20A_GATE_ENABLED` UNSET. `/api/reason` byte-identical. `/api/substrate/layer3` returns 503. `/api/public-key` serves Ed25519 steady-state. No env-var changes, no schema migrations, no auth-surface changes, no R20a-perimeter changes. All six new files are imported by no route; the `atl-bridge.ts` refactor is behaviour-preserving (31/0 confirms) and `atl-bridge.ts` is itself imported by no route.

## Open Questions

- **`/trust-layer/` ↔ `website` boundary — resolved, with a KEEP-IN-SYNC point.** The 5-file ported closure is canonical for `website/src` consumers; the `/trust-layer/` originals remain the source of truth. If a `/trust-layer/` original changes, the ported mirror must be re-ported in the same change (each ported file's banner names this). The remaining 9 `/trust-layer/` files are NOT ported — the badge session ports what it needs.
- **`trust-layer-bridge.ts` reconciliation (carry-forward).** `website/src/lib/trust-layer-bridge.ts` — a pre-existing 48-line "Scaffolded" file that type-only re-exports `/trust-layer/` types and dynamically `await import()`s its functions; imported by no module. It now overlaps the ported closure. It references `handleAccreditationLookup` / `buildAccreditationCard` — badge concerns — so reconcile or retire it in the badge session (step 6).
- **Spec-hygiene finding (carried forward — now larger still).** The Adopted ATL Wrapper spec §"Component 2" still owes the superseded agent-mode spec's content inline, plus the accumulated rendering-detail + score-wiring decisions from the prior three sessions. This session adds no new owed content to §Component 2, but the finding stands. Governance-session item — founder approval + a preserve-prior-versions snapshot before the Adopted spec is edited.
- **The trajectory-enriched developer hand-back report is NOT built.** It draws on the now-buildable `WindowSnapshot` plus the badge's `AccreditationRecord` / `AccreditationCard`. Buildable once the badge (step 6) lands.
- **Progression-toolkit relationship (spec open question 1) — untouched, still deferred.** Whether the 9-tool / 7-pathway progression toolkit is part of the wrapper or a separate ATL surface is unresolved.
- **DRAFT 5-table `/trust-layer/` schema (spec open question 2) — untouched.** This session kept the carried profile wrapper-side (no server persistence), so no schema work. The badge (step 6) is where `agent_accreditation` + `grade_history` server persistence is needed.
- **Agent-identity authentication (spec open question 8) — `agent_id` is a wrapper-supplied opaque string.** Authenticating it is A10 (per-agent credentials). `profile_provenance` is an attestation, not yet a cryptographic verification — re-verifying the `receipt_id_chain` needs the agent-identity mechanism.
- **PR10 PEV Verify diagnostic — Diagnostic-certain.** The `agent-mode-service` + `philosophical-mode-service` regressions fail on *import* in the build sandbox: `supabase-server.ts` constructs a Supabase client at module load and throws when `NEXT_PUBLIC_SUPABASE_URL` is absent. Root cause identified — missing process-env Supabase vars, not a regression (this session adds new files + a pure refactor; touches no Supabase surface). Confirmed 63/0 + 43/0 in-session with dummy import-resolution env vars. On the founder's machine with `.env.local` resolvable, both run clean. The `atl-wrapper` test imports `layer1-extractor.ts`, which does NOT transitively construct a Supabase client — it runs clean unconditionally. Revisit condition: none — sandbox env limitation, documented in the predecessor closes.
- **Stale `.git/index.lock` — I caused this.** Running `git status` inside the build sandbox created a 0-byte `.git/index.lock`; the sandbox mount blocks `unlink` on it (the in-session `rm -f` attempt returned "Operation not permitted"). No live git process. Remove it (`rm -f .git/index.lock`) before `git add` / `git commit`. Revisit condition: none — one-time cleanup, same as the predecessor sessions.

## Founder Verification (between sessions)

> **Post-session correction (2026-05-15).** This block was corrected after the
> founder's cross-session verification check surfaced two gaps — in the *tooling*,
> not in any session's code, and affecting no Verified status: (a) `tsx` (the test
> runner) was never declared as a devDependency, and (b) the `agent-mode` /
> `philosophical-mode` test commands need `--env-file=.env.local` to run under
> `tsx`. Both are fixed below. See the "## Post-session note" section and
> `/CLAUDE.md` §"Running the substrate test suite".

```
cd "/Users/clintonaitkenhead/Claude-work/PROJECTS/sagereasoning"

# 0. Clear the stale sandbox-created .git/index.lock.
#    (I caused this — running git status in the build sandbox; the mount blocks
#    unlink. One-time cleanup, same as the predecessor sessions.)
rm -f .git/index.lock

# 1. Ensure tsx is installed (one-time). tsx is the runner for the .ts test
#    files — a dev-only tool, imported by no route, ships to nothing. Skip if
#    `npx tsx --version` already prints a version.
cd website
npm install --save-dev tsx

# 2. Verify the build. RUN ONE LINE AT A TIME (a pasted block can break on an
#    interactive prompt). Expected result is in the comment on each line.
npx tsc --noEmit -p tsconfig.json                                               # clean, exit 0
npx tsx src/lib/substrate/__tests__/atl-wrapper.test.ts                         # 55/0
npx tsx src/lib/substrate/__tests__/atl-bridge.test.ts                          # 31/0
npx tsx src/lib/substrate/__tests__/score-architecture.test.ts                  # 69/0
npx tsx src/lib/substrate/__tests__/layer3-service.test.ts                      # 28/0
npx tsx src/lib/substrate/__tests__/r20a-gate.test.ts                           # 33/33
npx tsx src/lib/translation-sandwich/__tests__/layer1-schema-additions.test.ts  # 33/0
# These two transitively import supabase-server.ts, which builds a Supabase
# client at MODULE LOAD — they need --env-file so tsx loads .env.local. Both
# tests construct the client but never call it: your real creds are loaded but
# unused; nothing touches live Supabase.
npx tsx --env-file=.env.local src/lib/substrate/__tests__/agent-mode-service.test.ts          # 63/0
npx tsx --env-file=.env.local src/lib/substrate/__tests__/philosophical-mode-service.test.ts  # 43/0
cd ..

# 3. Commit the wrapper build — TARGETED add (explicit paths, not `git add -A`).
git add website/src/lib/substrate/atl-wrapper.ts
git add website/src/lib/substrate/__tests__/atl-wrapper.test.ts
git add website/src/lib/substrate/trust-layer/
git add website/src/lib/substrate/atl-bridge.ts
git add website/tsconfig.tsbuildinfo
git add operations/decision-log.md
git add operations/handoffs/founder/2026-05-15-atl-wrapper-build-close.md
git add operations/handoffs/founder/2026-05-16-atl-wrapper-session6-component5-NEXT-SESSION-PROMPT.md
git commit -m "ATL Wrapper Session 5: the wrapper (Components 1 + 4)

Builds ATL Wrapper spec step 5 — the carried-profile mechanism
(Component 1) + trajectory awareness (Component 4). atl-wrapper.ts
accumulates an agent's substrate consultations into a CarriedProfile
(mapping each Layer2Assessment via atl-bridge.ts) and aggregates it into
a WindowSnapshot + a grade transition (driving the ported /trust-layer/
computeWindowSnapshot + evaluateGradeTransition), and emits the
carried_profile / profile_provenance payloads for the agent's next
Layer1Schema input.

Step 2 design-decision gate (founder pre-approved all four as
recommended): (1) the /trust-layer/ integration boundary — PORT the
5-file dependency closure of computeWindowSnapshot + evaluateGrade-
Transition into website/src/lib/substrate/trust-layer/ (verbatim
KEEP-IN-SYNC mirrors; stays Standard risk — NOT the Elevated tsconfig
option); (2) the CarriedProfile data structure + module location;
(3) storage — wrapper-side carriage, no server persistence; (4) the
carried_profile payload carries the aggregated WindowSnapshot. Plus the
founder-elected sub-decision: repoint atl-bridge.ts at the ported
canonical types — its local EvaluatedAction mirror removed, one
definition in website/src. This RESOLVES the /trust-layer/ <-> website
integration boundary — the carried-forward open question from
D-ATL-BRIDGE-WIRED-VERIFIED-2026-05-15.

New (imported by no route; no env flag):
- website/src/lib/substrate/atl-wrapper.ts — Components 1 + 4:
  createCarriedProfile, accumulate (pure), computeTrajectory,
  toCarriedProfilePayload / toProfileProvenancePayload.
- website/src/lib/substrate/trust-layer/ — the 5-file ported closure
  (types/accreditation.ts, types/evaluation.ts,
  accreditation/accreditation-record.ts,
  evaluation-window/window-aggregator.ts,
  grade-engine/grade-transition-engine.ts) — verbatim mirrors with
  KEEP-IN-SYNC banners.
- website/src/lib/substrate/__tests__/atl-wrapper.test.ts — 55
  assertions; invokes every exported function (PR2).

Modified:
- website/src/lib/substrate/atl-bridge.ts — pure refactor (the
  repoint): local MIRRORED TARGET TYPES block removed; imports +
  re-exports the canonical EvaluatedAction / KatorthomaProximityLevel /
  RootPassionId from the ported trust-layer/types/. No behaviour
  change — atl-bridge.test.ts 31/0.

Decision log: D-ATL-WRAPPER-WIRED-VERIFIED-2026-05-15. Tier
code-standard, Standard risk; AC7 / PR6 / Critical Change Protocol not
engaged. tsc clean; atl-wrapper 55/0 + atl-bridge 31/0 +
score-architecture 69/0 + agent-mode 63/0 + philosophical 43/0 +
layer3-service 28/0 + r20a-gate 33/33 + layer1-schema-additions 33/0."

# 4. Commit the verification-tooling fix SEPARATELY — kept as its own small
#    housekeeping commit so this session's decision-log entry (which lists only
#    the wrapper files) stays accurate. tsx is test tooling — imported by no
#    route, ships to nothing. CLAUDE.md gains the standing "how to run the
#    substrate test suite" note.
git add website/package.json website/package-lock.json
git add CLAUDE.md
git commit -m "Add tsx as devDependency + document the substrate test-run form

The substrate / translation-sandwich test files run via npx tsx (no
Jest framework). tsx was assumed by every ATL-arc session's
verification commands but never declared, and the agent-mode /
philosophical-mode test commands needed an --env-file flag that no
prior close gave — both surfaced by the founder's 2026-05-15
cross-session verification check. Fixes: tsx declared as a devDependency
(dev-only test runner; imported by no route, ships to nothing);
CLAUDE.md gains a standing 'Running the substrate test suite' note so
every future session close uses the working command form."
```

Then push via GitHub Desktop. **No Vercel behaviour change** — all six new files are imported by no route; the `atl-bridge.ts` refactor is behaviour-preserving and `atl-bridge.ts` is itself imported by no route; `tsx` is a devDependency (test tooling, never imported by app code); `/api/reason` and `/api/substrate/layer3` are byte-identical. Vercel should build green (everything compiles clean under `tsc`).

## Post-session note — verification tooling (added 2026-05-15)

The founder's cross-session verification check (run 2026-05-15, immediately after this session) surfaced two gaps in the *verification tooling* — not in any session's code, and not affecting any Verified status:

1. **`tsx` was never declared as a devDependency.** Every ATL-arc session's close wrote `npx tsx …` verification commands, but `tsx` was assumed, never added to `website/package.json`. On a clean checkout `npx tsx` prompts to install interactively, which breaks a pasted command block. Fixed: `npm install --save-dev tsx` (committed separately — see step 4 above).
2. **The `agent-mode` / `philosophical-mode` test commands were not runnable as written.** Both tests transitively import `supabase-server.ts`, which constructs a Supabase client at *module load*; `npx tsx` does not auto-load `.env.local` the way the Next.js app does, so the commands threw `supabaseUrl is required.` before the test could start. The predecessor closes said these "run clean on the founder's machine with `.env.local` resolvable" but never gave the flag that resolves it. Fixed: those two commands now use `npx tsx --env-file=.env.local …`.

Both gaps are now reflected in the corrected Founder Verification block above, and the working form is recorded as a standing note in `/CLAUDE.md` §"Running the substrate test suite" so every future session close uses it. All eight suites were confirmed green on the founder's machine after the fixes (`55/0, 31/0, 69/0, 28/0, 33/33, 33/0, 63/0, 43/0`; `tsc` clean) — the cross-session integrity check the founder ran *passed*.

The deeper root cause — `supabase-server.ts` eagerly constructs its client at module load, so any test importing that chain needs the env present even though it never calls Supabase — is a test-harness ergonomics issue noted for a future session; it is not a defect in any substrate module and changes no Verified status.

## Cross-references

- Predecessor close: `/operations/handoffs/founder/2026-05-15-philosophical-mode-score-wiring-close.md`
- Operative session prompt (this session): `/operations/handoffs/founder/2026-05-16-atl-wrapper-build-NEXT-SESSION-PROMPT.md`
- Next-session prompt (Session 6 — Component 5, the three iteration patterns): `/operations/handoffs/founder/2026-05-16-atl-wrapper-session6-component5-NEXT-SESSION-PROMPT.md`
- Decision-log entry: `D-ATL-WRAPPER-WIRED-VERIFIED-2026-05-15`
- Predecessor decision-log entry: `D-PHILOSOPHICAL-MODE-SCORE-WIRED-VERIFIED-2026-05-15`
- Integration-boundary open question closed from: `D-ATL-BRIDGE-WIRED-VERIFIED-2026-05-15`
- Consumed/Verified dependencies: `D-ATL-SCORE-ARCHITECTURE-WIRED-VERIFIED-2026-05-15`, `D-ATL-AGENT-MODE-RENDERING-WIRED-VERIFIED-2026-05-15`, `D-LAYER1-SCHEMA-ADDITIONS-WIRED-VERIFIED-2026-05-14`
- Deliverable-of-the-day: `/adopted/substrate-modes/agent-trust-layer-wrapper-spec.md` §"Component 1" + §"Component 4" + §"Build sequencing"
- New files: `/website/src/lib/substrate/atl-wrapper.ts`, `/website/src/lib/substrate/__tests__/atl-wrapper.test.ts`, the 5-file `/website/src/lib/substrate/trust-layer/` ported closure
- Modified: `/website/src/lib/substrate/atl-bridge.ts`
- Survey targets: `/trust-layer/BUILD-LOG.md`, `/trust-layer/types/evaluation.ts`, `/trust-layer/types/accreditation.ts`, `/trust-layer/evaluation-window/window-aggregator.ts`, `/trust-layer/grade-engine/grade-transition-engine.ts`, `/trust-layer/accreditation/accreditation-record.ts`

*End of session close. The ATL Wrapper's Components 1 + 4 are built and Verified (atl-wrapper 55/0; tsc clean; all seven prior-arc regressions green) — the carried-profile mechanism is real, the `/trust-layer/` ↔ `website` integration boundary is resolved (the bridge session's carried-forward open question closed), and `atl-bridge.ts` carries one canonical `EvaluatedAction` definition. Next: ATL Wrapper Session 6 — Component 5 (the three iteration patterns, with the load-bearing PR15 multi-agent-orchestration consult) — or step 6, the badge (Component 3, Supabase-integrated, higher-risk). Production state unchanged; `/api/reason` byte-identical; no route imports any new file. One one-time cleanup (`.git/index.lock`) must be cleared from the founder's machine before committing — flagged "I caused this".*
