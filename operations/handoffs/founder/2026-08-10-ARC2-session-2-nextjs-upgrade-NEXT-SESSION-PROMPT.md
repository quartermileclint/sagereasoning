# Next-Session Prompt — ARC2 Session 2: Next.js version assessment + upgrade

**Stream:** founder.
**Tier:** `code-elevated` under 0d-ii ("new external dependencies"). **Not Critical** — no auth,
encryption, R20a-perimeter, credential, schema, or deployment-flag change is *authored* by this
session. Read §"Why this is Elevated and not Critical" before accepting that classification; it
is a judgement call this session should confirm or overturn at open, not inherit.
**Governing frame:** `/adopted/standing-protocol-cache.md`.
**Predecessor close:** `operations/handoffs/founder/2026-08-10-ARC2-session-1-carried-work-CLOSE.md`.
**Predecessor decision-log entry:** `D-ARC2-SESSION1-PROCESS-ADOPTIONS-2026-08-10`.

---

## Why this session exists

The 2026-08-01 Fable-5 regrounding audit found the Next.js security action item had been
**dropped twice** — raised, carried, and lost from carried lists with no recorded discharge,
the exact failure mode ARC2 exists to close. ARC2 Session 1 deliberately did **not** touch it:
a framework-wide dependency bump has app-wide regression potential qualitatively different from
four narrowly-scoped changes, and bundling them would make any regression harder to isolate for
no real time saved. This session is that upgrade, alone, in its own commit.

---

## ⚠️ Read this before anything else: the stale-baseline trap

**The audit's CVE figures are now stale and you must not act on them.** For the record, what it
said on 2026-07-25: deployed `14.2.35` against a `15.5.18` / `16.2.6+` patched baseline, with
14.x **not** in the 20-July patched set. That was accurate then. Next.js advisories move fast,
the patched baseline itself moves, and by the time you run this it may have moved again in
either direction.

**Your first substantive act is to establish the CURRENT exposure first-hand.** Do not carry the
paragraph above into your reasoning as a finding. Re-derive it.

This is not pedantry — ARC2 Session 1 found that **both** factual premises its own prompt
asserted were false on inspection (a mentor record it claimed was missing existed; three images
it claimed were unwired had been wired eight days earlier). Two for two. Treat every inherited
claim in this document, including the ground-truth block below, as a hypothesis to check.

---

## Ground truth as of 2026-08-10 (verified first-hand at authoring; re-verify at open)

| Fact | Value |
|---|---|
| `next` pinned | `^14.2.0` (`website/package.json:19`) |
| `next` installed | `14.2.35` |
| `eslint-config-next` pinned | `^14.2.0` |
| `react` / `react-dom` pinned | `^18.3.0` |
| Local Node | `v24.15.0` (Vercel's runtime may differ — check the project settings) |
| Lockfile | `website/package-lock.json` present (~273 KB) |
| Test files | **154** (`*.test.ts` / `*.test.tsx` under `website/src`) |
| Standalone batteries | 19 `.ts` scripts under `website/scripts/` |
| `npm test` script | **Does not exist.** Only `dev`, `build`, `start`, `lint`. |
| Route handlers | 122 `route.ts` |
| Pages | 47 `page.tsx` |
| Dynamic-param route dirs | 10 (`src/app/**/[*]/`) |
| Files importing `next/headers` | 1 |
| Vercel plan | Pro (needed for the hourly crons; see CLAUDE.md) |

Repo state at authoring: `b718dcd` on `origin/main`, Vercel confirmed green by the founder.

---

## Pre-conditions

1. **PR21 (new, adopted 2026-08-10):** read the predecessor close's reflect findings before
   starting substantive work. The relevant one for you: ARC2 Session 1 shipped a defect *inside
   a fix for a defect of the same class*, caught only by re-running a mutation instead of
   trusting the fix. Apply that suspicion to your own verification here.
2. **PR23 (new):** check the memory index before diagnosing or writing in a recurring class.
   Two entries are directly load-bearing for this session — `nextjs-route-export-validation`
   (a `route.ts` may export only handlers + segment config; `tsc` does **not** catch a
   violation, `npm run build` does) and `tsx-tests-setinterval-keepalive-hang` (tests importing
   `security.ts` print their tally then never exit — redirect to a file, never pipe to `tail`).
3. **PR22 (new):** every commit you author carries `Model:` and `Effort:` trailers.
4. Confirm `git log --oneline -1` shows `b718dcd` or later, and that the working tree is clean
   of the ARC2 Session 1 commits (they are pushed).
5. If the Gate-1/Gate-2 hooks time out (the known 28s transient class — it ran for the whole of
   Session 1), proceed **unframed**, disclosed at open and close. Do not block on it.

---

## Part A — Open

Read in order:
1. `/adopted/standing-protocol-cache.md` (~3 min). **Note the PR range is now PR1–PR24.**
2. This prompt in full — self-contained; no other document is required reading.
3. `operations/handoffs/founder/2026-08-10-ARC2-session-1-carried-work-CLOSE.md` (the
   predecessor close, incl. its reflect findings per PR21).

Confirm at open: tier (`code-elevated`, or your reclassification with reasons); hold-point P0 0h;
**model selection — no AC1 row applies** (this session introduces no LLM call); status
vocabulary; signals; risk classification.

---

## Part B — Procedure

### Step 1 — Establish current exposure, first-hand

Do this before forming any view on whether to upgrade.

- `npm audit` in `website/` for the machine-readable picture, and read what it actually says
  rather than the summary line — note which advisories are `next` itself vs transitive, and
  which are dev-only (a dev-only advisory does not justify a production framework bump on its
  own).
- Check the current Next.js release/security page and the GitHub security advisories for
  `vercel/next.js` directly. Establish: what is the latest patched 14.x, if any; what is the
  current supported/patched baseline; is 14.x still receiving security patches at all.
- For each advisory that genuinely applies to `14.2.35`, determine whether **this** app is
  actually exposed — several historical Next advisories affect only the image optimizer, only
  `next/server` middleware in specific configurations, or only self-hosted deployments rather
  than Vercel-hosted. An advisory that cannot reach this app is worth recording as assessed and
  not-applicable, not as a reason to upgrade.

**Record the finding either way.** "Assessed, current exposure is X, no upgrade warranted" is a
complete and successful outcome for this session and discharges the carried item. The item is
"assess and act," not "upgrade."

### Step 2 — Decide the upgrade target, and say why

If Step 1 warrants action, the options are meaningfully different in risk:

- **Patch within 14.x** (e.g. `14.2.35` → latest `14.2.x`) — lowest risk, no migration, likely
  a lockfile-only change. Prefer this if it closes the exposure.
- **Minor/major to 15.x or 16.x** — a real migration. Do **not** choose this merely because it
  is the newest. Choose it only if 14.x is genuinely unpatched for a live exposure, or the
  founder elects it for reasons beyond security.

**If a major is on the table, surface these to the founder via `AskUserQuestion` before doing
it** — they change scope materially and are the founder's call, not yours:
- Next 15 made several request APIs asynchronous (`cookies()`, `headers()`, `params`,
  `searchParams`). **Verify this against the current official migration guide rather than
  taking my word for it** — but if it holds, this repo has 10 dynamic-param route directories
  and 122 route handlers, so it is a real, mechanical, broad migration. There is a codemod;
  confirm it exists and works before assuming it.
- Caching defaults changed between 14 and 15 (fetch/route-handler caching). This app has crons,
  dark flag-gated routes, and `dynamic = 'force-dynamic'` exports — verify how each is affected.
- React version pairing: check what the target Next requires vs the pinned `^18.3.0`. A forced
  React 19 bump is a second framework upgrade riding along and should be named as such, not
  absorbed silently.

### Step 3 — Upgrade, isolated

- Bump in `website/package.json`, keeping `eslint-config-next` in step with `next`.
- One commit, containing **only** the upgrade and whatever mechanical migration it forces.
  Nothing else — no drive-by fixes, no unrelated tidying. The whole point of isolating this
  session is that a regression must be trivially bisectable.
- If a migration codemod is run, note in the commit body exactly which codemod and what it
  touched, so a later reader can distinguish machine edits from hand edits.

### Step 4 — Verify: the full suite, not the touched-file batteries

**A framework upgrade can regress anything, so the usual "run the batteries near what you
touched" discipline does not apply here.** Run everything.

**There is no `npm test`.** The 154 test files are plain-assertion `tsx` scripts run
individually. This runner works (validated at authoring on a subset — validate it yourself on a
few files before trusting a full run):

```bash
cd website
cat > /tmp/run-all-tests.sh <<'SH'
fail=0; pass=0; failed_files=""
for f in $(find src -name "*.test.ts" -o -name "*.test.tsx" | sort); do
  if out=$(npx tsx "$f" 2>&1); then
    pass=$((pass+1))
  else
    echo "FAIL  $f"; echo "$out" | tail -5; fail=$((fail+1)); failed_files="$failed_files $f"
  fi
done
echo "==== $pass passed, $fail failed"
[ -n "$failed_files" ] && { echo "Failed:"; for f in $failed_files; do echo "  $f"; done; }
SH
bash /tmp/run-all-tests.sh 2>&1 | tee /tmp/test-run.log
```

Two caveats that will bite you if ignored:
- **Two tests need `--env-file`.** `src/lib/substrate/__tests__/agent-mode-service.test.ts` and
  `philosophical-mode-service.test.ts` transitively import `supabase-server.ts`, which builds a
  client at module load and throws `supabaseUrl is required.` under a bare `npx tsx`. Run those
  two with `npx tsx --env-file=.env.local <path>`. They will show as failures in the bulk run
  above; that is expected, not a regression — confirm by running them correctly.
- **Never pipe a test to `tail` directly** (memory `tsx-tests-setinterval-keepalive-hang`) —
  suites importing `security.ts` keep the event loop alive and never exit. Redirect to a file
  and read it, as the runner above does.

Then, in addition:
- `npx tsc --noEmit`
- `npm run build` — **mandatory, not optional.** It is the only check that catches the
  route-export-validation class, and a framework upgrade is exactly when that surface moves.
  Confirm the route count/list looks unchanged, especially the four cron routes.
- `npm run lint`
- **Establish a baseline first.** Run the full suite *before* the upgrade and save the log, so
  "was this already failing?" is answerable. Some of the 154 may be red for unrelated reasons;
  without a baseline you will burn the session chasing a pre-existing failure.

### Step 5 — Safety-surface re-verification

An upgrade authors no change to these, but it changes what executes them. Confirm explicitly:
- The **R20a distress perimeter** batteries are green (`r20a-invocation-guard` and siblings —
  92/0 and 66/0 were the standing numbers; confirm against your pre-upgrade baseline).
- The **human-practitioner boundary guard** is green (249/0 at Session 1's close). This carries
  the git byte-identity check on the `/api/reason` import graph — it should be unaffected by a
  dependency bump, and if it is *not*, that is a finding worth stopping for.
- **Middleware still gates `PROTECTED_ROUTES`.** `src/middleware.ts` is the auth gate for 20
  routes; middleware is a surface Next has changed across majors. If you take a major, test at
  least one protected route redirect live against a dev server.

### Step 6 — Preview verification

Start the dev server via `preview_start` (`.claude/launch.json` has `website-dev`) and check a
representative set actually renders — at minimum: `/` , `/welcome`, `/limitations` (both
corrected in Session 1), one dynamic route, and one auth-gated route confirming the redirect.
Read the console for hydration errors, which are the classic silent symptom of a React/Next
version mismatch that builds clean.

### Step 7 — Records

- Decision-log entry, lean form per the cache. Record the assessed exposure **whether or not**
  you upgraded — a "no action warranted" finding must be as durably recorded as an upgrade, or
  the item gets dropped a third time.
- Session close, lean form.
- Update `CLAUDE.md`'s production-state block **only if** the upgrade actually deploys
  (PR18: close-time artifact, written from verified observation, carrying its as-of date).

---

## Why this is Elevated and not Critical

**Confirm or overturn this at open rather than inheriting it.** The argument for Elevated: this
session authors no change to auth, encryption, R20a-perimeter, credential, schema, or
deployment-flag code — 0d-ii's Critical triggers are about *what you change*, and a dependency
version is none of them.

The argument for Critical, which is not frivolous: the upgrade changes the runtime executing
every one of those surfaces at once, and its blast radius is larger than most Critical-tier
changes. If you take a **major** version, I would lean toward treating it as Critical and
running the full Change Protocol — six-point disclosure, explicit founder approval naming the
risks. For a **patch within 14.x**, Elevated is right.

**PR19 (as widened 2026-08-10) is a genuine judgement call here.** Its letter covers "auth /
security / R20a-perimeter surfaces, or any code path that deletes data" — you author none of
those. But a framework upgrade is precisely the change most likely to break something nobody
thought to test. If you take a major, an independent adversarial review of the migration diff is
warranted; record the decision either way rather than letting it go unexamined.

---

## What this session does NOT do

- **Does not touch the ARC2 Session 3 items** (CRED-1, the four AUTH smokes) — those are
  founder-performed and share no surface.
- **Does not touch the IDEA-loop arc** — no flag, no `idea_loop_*` table, no `watching`/`fresh` route.
- **Does not activate the observability retention sweep** — `SUBSTRATE_OBSERVABILITY_SWEEP_ENABLED`
  stays unset and no `vercel.json` cron entry is added. That is its own founder-walked Critical step.
- **Does not close PR24's queued gaps** (`agent_hold_observations`, `stoa_entries` retention
  sweeps) — carried, separate.
- **Does not push.** Commit only; the founder pushes and confirms Vercel green.

---

## Rollback path

`git revert` the single upgrade commit and `npm install` to restore the prior lockfile state.
Because the upgrade is isolated to one commit containing nothing else, the revert is clean and a
regression is bisectable to it directly. If the upgrade has already deployed and a regression
appears in production, Vercel's own instant-rollback to the prior deployment is faster than a
revert-and-redeploy and should be the first move.

---

## Forecast

Success is **not** "Next.js was upgraded." Success is that the current exposure is established
first-hand, the decision to upgrade or not is made on that evidence and recorded durably, and —
if an upgrade happened — the full 154-file suite plus build plus lint is green against a
pre-upgrade baseline, in one isolated, revertible commit.

The most likely genuine outcome, given how many Next 14.2.x patch releases exist, is a patch
bump within 14.x that closes the exposure with no migration at all. Do not talk yourself into a
major to feel thorough. If 14.x turns out to be genuinely end-of-life for security patches, that
is a real finding and the founder decides the major on your evidence.

End of prompt.
