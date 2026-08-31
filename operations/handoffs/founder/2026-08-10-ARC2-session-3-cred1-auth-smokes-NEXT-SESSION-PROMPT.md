# Next-Session Prompt — ARC2 Session 3: CRED-1 + the four AUTH post-deploy smokes

**Stream:** founder.
**Tier:** `governance` — **founder-performed, AI-guided.** No code, no commit, no push. Standard
risk under 0d-ii (a credential-revocation confirmation and a set of live UI smokes against
already-deployed, already-live code — nothing new is built or shipped).
**Governing frame:** `/adopted/standing-protocol-cache.md`.
**Predecessor decision-log entries:** `D-ARC2-SESSION1-PROCESS-ADOPTIONS-2026-08-10`,
`D-ARC2-SESSION2-NEXTJS-14-EOL-UPGRADE-TO-16-2026-08-10`.
**Predecessor closes:**
`operations/handoffs/founder/2026-08-10-ARC2-session-1-carried-work-CLOSE.md`,
`operations/handoffs/founder/2026-08-10-ARC2-session-2-nextjs-upgrade-CLOSE.md`.

---

## Why this session exists

Both items were raised by the 2026-07-25 Fable-5 audit, handed to the founder, and then **fell off
every carried list with no recorded discharge** through 2026-07-26 — CLAUDE.md's own record calls
the earlier "live smokes founder-walked" phrasing an overstatement. This is the exact failure mode
the whole ARC2 arc exists to close (`D-FABLE5-REGROUNDING-AUDIT-SESSIONS-2026-07-26-TO-30-2026-08-01`).
Sessions 1 and 2 are both closed; this is the third and final piece, sharing no surface with
either. It costs the least session overhead of the three — it was sequenced last only so the
founder could bundle it in one sitting if convenient, not because anything depends on it.

**This session touches no code.** Both items are live, already-deployed checks: revoking a
credential and clicking through an existing auth flow. The AI's role is to give exact commands and
URLs, read back what happened, and write the closing record — not to build or push anything.

---

## ⚠️ Read this before anything else: verify, don't inherit

**This arc has now found stale or false claims in its own inherited prompts three separate times**
(Session 1: a mentor record it believed missing existed; three images it believed unwired had been
wired 8 days earlier — two for two. Session 2: the prompt's central forecast, "the most likely
outcome is a patch bump within 14.x," was false — Next 14 turned out to have no patch path at
all). **Treat every claim in this document as a hypothesis, not a fact**, including:
- that the `ae2-smoke*` credentials are still active (they may have been revoked by someone since)
- that the password-reset flow is still deployed exactly as CLAUDE.md describes it (re-check the
  live pages match the described behavior before running the smokes)
- that nothing has changed about `/auth`, `/auth/reset-password`, or the reset-password code path
  since 2026-07-25 (Session 2 just deployed a Next.js 14→16 / React 18→19 upgrade — confirm at
  session open that it's live on production and nothing in the auth flow regressed, per Session
  2's own carried verification step, before treating any auth-flow oddity as a pre-existing bug
  rather than a fresh regression)

---

## Pre-conditions

1. Confirm ARC2 Session 2's two upgrade-fix commits have been pushed and Vercel is green
   (`git log --oneline -3` should show `f68d191`/`7f897b6` reachable from `origin/main`; if not
   yet pushed, that's fine — this session doesn't depend on it, but note it in the open).
2. **PR23** (memory-first): check the memory index before diagnosing anything unexpected here —
   `prod-mint-needs-prod-admin-jwt` is directly load-bearing for Part B Step 1.
3. **PR22**: any commit this session produces (should be none, but the decision-log/close records
   do get committed) carries `Model:`/`Effort:` trailers.
4. If Gate-1/Gate-2 hooks time out (the known 28s transient class, recurring across this whole
   arc's history) — proceed unframed, disclosed at open and close.

---

## Part A — Open

Read in order:
1. `/adopted/standing-protocol-cache.md` (~3 min).
2. This prompt in full — self-contained; no other document is required reading.
3. The CLAUDE.md excerpt below (already quoted in full, so a separate read isn't strictly
   necessary, but re-read it in place if you want the surrounding context):

   > "The password-reset flow... 2026-08-01 correction (Fable-5 re-audit): the four post-deploy
   > smokes (the AUTH-1 negative tab-switch check; the in-app 'Forgot password' retest, which
   > doubles as the AUTH-1 positive smoke; the `?redirect=//example.com` check; the expired-link
   > path) were carried as OUTSTANDING through every close to 2026-07-26 and then dropped off
   > carried lists with no recorded discharge... they re-enter the founder's checklist alongside
   > CRED-1 (the ae2-smoke credential revocation check, same status: handed to the founder
   > 2026-07-25, no recorded outcome)."

Confirm at open: tier (`governance`, founder-performed); hold-point P0 0h; **no AC1 model-selection
row applies** — this session introduces no LLM call; status vocabulary; signals.

---

## Part B — Procedure

### Step 1 — CRED-1: confirm and revoke any still-active `ae2-smoke*` credential

The `ae2-smoke`/`ae2-smoke2`/`ae2-smoke3`/`ae2-smoke4` throwaway credentials were minted during the
2026-07-19 AE-2 activation smoke and were supposed to be revoked at teardown — CLAUDE.md's own
production-state block says the teardown "may leave some trailing" and this check was never
confirmed discharged.

```bash
cd website
npx tsx --env-file=.env.local scripts/mint-credential.ts list | grep ae2-smoke
```

**This needs a production admin JWT, not the TEST-targeting env file** — memory
`prod-mint-needs-prod-admin-jwt` (the only `MINT_CLI_ADMIN` env file on this machine targets TEST;
production mints/lists need `MINT_CLI_ADMIN_JWT` from a logged-in `www.sagereasoning.com` session).
Confirm which env var the `list` command actually reads before running it — do not assume
`--env-file=.env.local` reaches production; verify against the script's own source
(`website/scripts/mint-credential.ts`) or its `--help` output first.

For any row still `is_active`, revoke it:

```bash
npx tsx --env-file=.env.local scripts/mint-credential.ts revoke practice --id <uuid>
```

Confirm the revoke with a second `list` showing `is_active: false` (or the row absent from an
active-only listing — check which the script does). If **zero** rows are found active, that is
itself the complete, successful outcome — record "already clean" rather than treating an empty
result as a missed step.

### Step 2 — The four AUTH post-deploy smokes

All four exercise the password-reset flow fixed and deployed 2026-07-25
(`D-AUTH-RESET-TRUST-AND-REDIRECT-FIXES-2026-07-25`). Run them against production
(`www.sagereasoning.com`), in a real browser session, signed in as `zeus@sagereasoning.com` where
noted (or whichever account you use for this class of check).

**(a) AUTH-1 negative — the tab-switch check.** While signed in, open `/auth/reset-password`
directly in a new tab, then **switch away to another tab and back** (this is the specific
regression class found in the 2026-07-25 audit — `auth-js` re-emits a bare `SIGNED_IN` event on
tab-visibility change, which the fix removed from the reset page's trusted event set). Expected:
"No active reset link" or equivalent — **not** a false positive treating the ambient signed-in
session as a valid reset flow.

**(b) The in-app retest — doubles as the AUTH-1 positive smoke.** From `/auth`, click "Forgot your
password?", complete the flow with a real (or test) email, follow the reset link when it arrives,
and confirm the reset actually completes. This is the flow that was blocked by a Supabase
email-rate-limit at 2026-07-25's original test time and has never been confirmed live since — the
single most load-bearing of the four, since it's the only one testing the *positive* path.

**(c) The open-redirect check (AUTH-2).** Navigate to `/auth?redirect=//example.com` (or a similar
scheme-relative/off-origin value). Expected: the same-origin-path validation rejects it — you
should **not** end up redirected to `example.com` after auth completes. Try one or two variant
payloads (`/auth?redirect=https://example.com`, `/auth?redirect=/\evil.com`) if the first is
unambiguously safe, to raise confidence rather than relying on a single probe.

**(d) The expired-link path.** Use an old or already-used password-reset link (from a prior test,
or trigger a fresh one and let/force it to expire if there's a fast way to do that). Expected: a
clean, honest failure state — **not** the false-success rendering the 2026-07-25 fix also
addressed (an outage or invalid-link condition should never display something like "recorded and
analyzed").

For each of the four, **the AI reads back the result you report and confirms it against the
expected outcome stated above** — do not just take "it worked" at face value; ask what was actually
seen on screen if the report is ambiguous.

### Step 3 — Records

- Decision-log entry, lean form. Record the outcome of all five checks (CRED-1 + AUTH a–d)
  individually — **a "no active credentials found" or "smoke passed" is itself a complete,
  positive result and must be recorded as explicitly as a defect would be**, per this exact
  failure mode (results silently going unrecorded) being what created this session in the first
  place.
- If any smoke fails, do **not** attempt a code fix in this session — record it as a new finding,
  named and carried, with enough detail (which check, what was expected, what was observed) for a
  future `code-critical` session to act on it without re-deriving the context.
- Session close, lean form.

---

## What this session does NOT do

- **No code changes.** If a smoke fails, the finding is recorded and carried — not fixed here.
- **No commit beyond the decision-log entry and close** (which are themselves `governance`,
  Standard risk, documentation-only).
- **Does not touch the Next.js upgrade, the lint debt, the `/community` CSP gap, the
  `stoa-draft-reflect.ts` boundary violations, or any other item carried out of ARC2 Session 2** —
  all separate, unrelated surfaces.
- **Does not touch the IDEA-loop arc** — no flag, no `idea_loop_*` table, no `watching`/`fresh` route.
- **Does not activate the observability retention sweep** (`SUBSTRATE_OBSERVABILITY_SWEEP_ENABLED`
  stays unset) — that remains its own founder-walked Critical step, carried from Session 1.

---

## Rollback path

Nothing to roll back — Step 1 is a credential revocation (already inherently a one-way, intended
action; re-minting is possible if ever needed, but nothing here is reversible-by-design in the
usual sense). Step 2 touches no code or config. The only artifacts are the decision-log entry and
close, independently `git revert`-able.

---

## Forecast

Success is **not** "all four smokes passed." Success is that CRED-1 and all four AUTH smokes have
an **explicitly recorded outcome** — pass, fail, or "already clean" — closing the exact gap that
let this item disappear from two prior closes without anyone noticing. If any smoke reveals a real
regression (worth double-checking given ARC2 Session 2's Next 16 / React 19 upgrade landed on
production in between), that is a genuine, valuable finding and should be named plainly rather than
smoothed over — it is not this session's job to fix it, only to surface it durably.

This closes the ARC2 arc: with Sessions 1, 2, and 3 all discharged, the six items the 2026-08-01
regrounding audit found silently dropped will all have a recorded outcome, not just a recorded
intention.

End of prompt.
