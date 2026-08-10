# Session Close — 2026-08-10 — ARC2 Session 2: Next.js 14 EOL assessment + upgrade to 16.3.0

**Stream:** founder.
**Governing frame:** /adopted/session-opening-protocol.md (cached via /adopted/standing-protocol-cache.md).
**Tier:** `code-critical` — **reclassified upward** from the prompt's `code-elevated` by founder election at open.
**Date:** 2026-08-10.
**Model:** claude-opus-5 (assessment, upgrade, verification, records); claude-sonnet-5 (PR19 independent adversarial review round, founder-directed model change). Effort: high throughout.

## Disclosure — unframed session

Gate-1/Gate-2 hooks timed out (28s) repeatedly across the session, as the prompt's pre-condition 5
anticipated. Several edits and all five review-agent launches proceeded **unframed**, disclosed at
the point of occurrence and here. A number of at-action Gate-2 elicitations *did* fire and were
answered genuinely in-conversation; one guardrail check also timed out and its action proceeded
unguarded, disclosed inline.

## What was decided

- **`D-ARC2-SESSION2-NEXTJS-14-EOL-UPGRADE-TO-16-2026-08-10`** appended.

**The prompt's central forecast was false.** It predicted "the most likely genuine outcome is a
patch bump within 14.x" and warned against talking oneself into a major. Established first-hand:
**`14.2.35` is the terminal 14.x release** (published 2025-12-11), Next 14 is listed unsupported on
nextjs.org/support-policy, and Vercel **explicitly refused** a 14.2.x backport request in discussion
#93868. There was no patch path. This is the **third inherited prompt claim ARC2 has found false in
two sessions.**

**Founder elections at open:** target **16.3.0** over 15.5.23 (Next 15 leaves Maintenance LTS on
21 Oct 2026 — ~10 weeks — so 15 repeats the work before year-end); tier **Critical + PR19 review**.
The six-point Critical Change Protocol disclosure was given and approval obtained **before**
`package.json` was touched.

## Status Changes

| Item | Old | New |
|---|---|---|
| `next` | `^14.2.0` (14.2.35, EOL, 21 open advisories) | **`16.3.0`** — all `next` advisories closed |
| `react` / `react-dom` | `^18.3.0` | **`19.2.8`** (required by Next 16) |
| `eslint` | `^8.57.0` | **`^9.39.5`** (pinned — codemod's eslint@10 crashes) |
| ESLint config | `.eslintrc.json` (legacy) | **`eslint.config.mjs`** (flat; legacy deleted) |
| Auth gate | `src/middleware.ts` | **`src/proxy.ts`** (rename only — logic byte-identical) |
| Next.js audit advisories | 21 applicable | **0** |
| Carried "Next.js security" item | dropped twice, no recorded discharge | **DISCHARGED** — assessed *and* acted |

## Verification

Every number below was established against a **pre-upgrade baseline run on the same runner**, not
against the prompt's cited figures (which were stale).

| Check | Pre | Post | Result |
|---|---|---|---|
| Full suite (154 files) | 133 P / 14 F / 7 HUNG | 137 P / 10 F / 7 HUNG | **0 regressions, 4 fixes** |
| `tsc --noEmit` | — | exit 0 | clean |
| `npm run build` | exit 0, 169 routes | exit 0, **169 routes** | parity; 4 cron routes + `/api/guardrail` present |
| `npm run lint` | 90 warn / 0 err / exit 0 | 53 err / 140 warn / exit 1 | **pre-existing, newly surfaced — see below** |
| `npm audit` (next-specific) | 21 | **0** | closed |
| r20a-invocation-guard | — | **115/0** | green |
| r20a-audience-rendering | — | **66/66** | green |
| human-practitioner-boundary | 249/0 | **249/0** | green — `/api/reason` byte-identity guard holds |
| `proxy.ts` auth redirect | — | 307 → `/auth?redirect=…`; control 200 | live-verified |

**The 4 "fixes" are honest, not an improvement claim:** the same forced `jsx: react-jsx` transform
that broke one file fixed four `.tsx` suites failing on `ReferenceError: React is not defined`.
Same root cause, opposite direction.

**The 14 pre-existing failures were characterised, not left as noise:** 9 are the known
`--env-file` / `supabaseUrl is required` class (across a **wider file set than the memory's
two-file allowlist** — the memory is stale); 4 were the React-import class, now fixed; 1 is
`stoa-boundary.test.ts` reporting **genuine architecture-boundary violations** in
`stoa-draft-reflect.ts` — real, pre-existing, unrelated, carried.

## Six real defects the migration forced

Each found by verification, none anticipated:

1. **`next-lint-to-eslint-cli` installed `eslint@10.8.1`, which crashes** under the resolved
   `@typescript-eslint@8.66.0` — the linter did not run at all. Pinned to `^9.39.5`.
2. **`cache-components-instant-false` inserted `export const instant = false` into 33 files, and
   `next build` rejects it** without `cacheComponents` enabled (unused here). The codemod produced
   non-compiling output for this project. Stripped from all 33; verified byte-identical after.
3. **React 19's stricter `useRef` typing** broke two prop types in `private-mentor/page.tsx`.
4. **`next build` auto-rewrote `tsconfig.json`** to `jsx: react-jsx`, making one `import React`
   genuinely unused in `founder-hub/page.tsx`.
5. **`experimental.instrumentationHook` is now an unrecognized key**; removed, A12 rationale kept.
6. **The repo's own pre-commit hook then caught a sixth, after the review had finished.** It lints
   four safety-critical R20a modules and blocked on an unused `catch (parseError)` in
   `r20a-classifier.ts:133`. **ESLint 9 changed `no-unused-vars`'s `caughtErrors` default from
   `"none"` to `"all"`** (confirmed empirically with a `Linter` probe, not assumed); the ported
   override never specified it. **Fixed in config, not in the safety module** — `caughtErrors:
   "none"` pinned, preserving exact pre-upgrade semantics. Lint total 53 → 52 errors, confirming it
   touched only that finding. The hook caught what the five-dimension review did not.

## PR19 independent adversarial review

5 dimensions, launched fresh against the raw diff, **no prior summary fed to any reviewer**.

| Dimension | Verdict |
|---|---|
| Codemod fidelity & scope isolation | CLEAN (2 minor observations, folded) |
| Safety-surface non-regression | CLEAN — 0 findings, claims re-verified with live output |
| EOL/exposure claims-vs-evidence | **all 5 VERIFIED** independently |
| Rollback integrity & commit-readiness | CLEAN + **1 confirmed finding** |
| Type-safety & build-completeness | 1 finding — **REFUTED** |

**2 confirmed, both folded:** the superseded `.eslintrc.json` was left behind (deleted; lint output
identical at 53/140, proving it inert); and **a rollback without first clearing `.next` produces a
spurious `PageNotFoundError` that mimics a broken revert** — now in the rollback path.

**A methodology defect in my own orchestration, recorded because it nearly produced a false alarm:**
one reviewer reported `package.json` was never bumped. It was a **race** — another reviewer was
running `git stash`/`stash pop` against the *same shared working tree* while the first read it
mid-stash. Verified directly afterwards that the tree is correct. **Independent reviewers must not
be given destructive git operations on a shared tree while others read it** — isolation has to
extend to the filesystem, not just the prompt.

## Blocked On

**Nothing blocking.** Two commits await your push:

| Commit | Contents |
|---|---|
| `44dff78` | The upgrade, isolated — nothing else in it, so a regression bisects straight to it |
| `4fff6cc` | Records: decision-log entry + this close |

**Files remaining uncommitted (pre-existing, not this session's):**
`website/src/data/environmental-context.json`, `a3-developmental-streak.py`,
`brand/Brand_Guidelines_superseded.docx`, `sdk/typescript/package-lock.json`,
`website/smoke_a_prod.json`, and the two 2026-08-10 next-session prompts.

**Production state at session close (as of 2026-08-10):** **unchanged.** Nothing deployed, no flag
set, no schema applied, no credential minted or revoked, nothing pushed. AC7 not engaged. The
`/api/reason` byte-identity guard is green (249/0) — the agent instrument and the frozen
measurement surfaces are untouched. **CLAUDE.md's production-state block deliberately NOT updated,
per PR18** — it is a close-time artifact for what actually deploys, and nothing has.

## Open Questions / carried

- **`npm run lint` exits 1 with 53 pre-existing errors** — invisible for as long as the linter was
  crashing; the older `next lint` never failed on them. Spot-checked against the diff: the only
  lint-erroring file also in the diff is `private-mentor/page.tsx`, error at line 275 vs this
  session's edits at 642/1116. **Not fixed** — 53 app-code issues, several needing behavioural
  `<a>`→`<Link>` changes, are out of scope for an isolated framework bump. Their own session.
- **`react-simple-maps@3.0.0` peer override** — latest published version, peers cap at React 18,
  installed against React 19 via `--legacy-peer-deps`. Renders correctly (verified live at
  `/community`). **If the Vercel deploy fails on `ERESOLVE`, this is the cause** — add
  `legacy-peer-deps=true` to an `.npmrc` or an `overrides` entry.
- **`/community` map is empty (pre-existing, unrelated)** — its data fetch to
  `cdn.jsdelivr.net/npm/world-atlas` is blocked by the app's own CSP `connect-src` allowlist, which
  omits `jsdelivr.net`. Neither file is in this diff; it fails identically on 14.2.35.
- **`stoa-draft-reflect.ts` boundary violations** — `stoa-boundary.test.ts` A.2/A.3/B.2, genuine and
  pre-existing.
- **Stale memory:** the `--env-file` note's two-file allowlist understates the affected set (9 files).
- **11 unrelated advisories remain** — `@anthropic-ai/sdk` (direct, its own small upgrade),
  OpenTelemetry stack, dev-tooling transitives. Pre-existing, out of scope.
- **PR24's queued gaps** (`agent_hold_observations`, `stoa_entries`) and the **sweep activation**
  remain carried from Session 1.

## Founder Verification

```
cd "/Users/clintonaitkenhead/Claude-work/PROJECTS/sagereasoning/website"
rm -rf .next
npx tsc --noEmit && npm run build
npx tsx src/app/logos/__tests__/human-practitioner-boundary.test.ts
npx tsx src/lib/__tests__/r20a-invocation-guard.test.ts
npx tsx src/app/api/reason/__tests__/r20a-audience-rendering.test.ts
```
Expected: tsc exit 0; build exit 0 with 169 routes; 249/0; 115/0; 66/66.
`npm run lint` exits 1 with 53 pre-existing errors — expected, not a regression.

Then push via GitHub Desktop. **Watch the Vercel build for `ERESOLVE`** — if it fails there, it is
the `react-simple-maps` peer override, fixed with `legacy-peer-deps=true` in an `.npmrc`.

**Rollback:** `git revert` the upgrade commit, then **`rm -rf website/.next`** *before*
`npm install --legacy-peer-deps` — skipping the cache clear produces a `PageNotFoundError` that
mimics a broken revert. If already deployed, **Vercel's instant-rollback is the faster first move.**

## Next Session Should

- **ARC2 Session 3** — CRED-1 (`ae2-smoke*` revocation check) + the four AUTH post-deploy smokes.
  Founder-performed, AI-guided, no code. Unchanged and carried.
- **The sweep activation** — `SUBSTRATE_OBSERVABILITY_SWEEP_ENABLED` + the `vercel.json` cron entry.
  Its own founder-walked Critical step.
- **Optionally, the lint debt** — 53 errors now visible for the first time; a scoped session.

## Cross-references

- `operations/handoffs/founder/2026-08-10-ARC2-session-2-nextjs-upgrade-NEXT-SESSION-PROMPT.md`
- `operations/handoffs/founder/2026-08-10-ARC2-session-1-carried-work-CLOSE.md`
- `operations/decision-log.md` — `D-ARC2-SESSION2-NEXTJS-14-EOL-UPGRADE-TO-16-2026-08-10`
- `operations/review-harness/independent-review-workflow-template.md`
- https://github.com/vercel/next.js/discussions/93868 — the backport refusal
- https://nextjs.org/support-policy — the 2-year Maintenance LTS policy

*End of session close. A twice-dropped item discharged with a durable answer, a false prompt
forecast caught, five migration defects found and fixed, zero test regressions — and production
untouched.*
