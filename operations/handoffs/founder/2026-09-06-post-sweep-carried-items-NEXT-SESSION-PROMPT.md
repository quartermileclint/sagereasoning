> **SPENT 2026-09-05** (this file's "2026-09-06" label is a context-date error; git author date 2026-09-05 04:59 +1000) — §4A–§4D executed and §3A put to the mentor and RULED (`2026-09-06-post-sweep-carried-items-CLOSE.md`; `D-MENTOR-RULING-R20A-LENGTH-GUARD-ORDERING-ADOPTED-2026-09-06`). §2 (the post-deploy smoke), §3B, §3C and §3D remain founder-gated and are carried in the standing opener's queue (Version 2026-09-05).

# NEXT SESSION PROMPT — carried items after the count-discipline sweep

**Paste into a fresh session. Tier: `governance`** unless §3B or §4B is elected (`code-elevated`).

**Written 2026-09-05**, revised the same day **after the push and a green Vercel deploy** — the
production-state section below supersedes the one in the close, which was written pre-push.
Predecessor: `2026-09-05-post-ruling-autonomous-work-CLOSE.md` (items A–D).

---

## 1. Open

1. `/adopted/standing-protocol-cache.md`; `/CLAUDE.md` (**the count-discipline note**); `/manifest.md`
   targeted only.
2. The predecessor close, then this prompt's §2 — the production state changed at the deploy.
3. **`ListAgents` at open; `git status` at open and again before every staging.** Path-scoped commits;
   never `git add -A`. Peers were active throughout the predecessor session and HEAD moved under it
   repeatedly; a peer close (`2026-09-05-D4-activation-and-F3prime-CLOSE.md`) may still be untracked —
   **leave it alone**.
4. **Re-derive every count from source.** Do not quote one from this prompt, from CLAUDE.md, or from
   the findings documents.
5. **Standing fact:** on this shared checkout a peer's push publishes your commits. The commit, not
   the push, is the point of no return.

---

## 2. Production state — READ THIS FIRST, it changed at the deploy

The predecessor session closed byte-equivalent. **It is no longer.** The push carried one always-on
runtime change, now **LIVE**:

**`/api/score-conversation` now returns 400 for a string `format` longer than `TEXT_LIMITS.long`
(15,000).** Everything else in those nine commits is documents and tests, with no runtime effect.

Two consequences that were pending when the close was written and are now live:

- **It is NOT flag-reversible.** The check sits outside `SUBSTRATE_SCORE_CONVERSATION_R20A_ENABLED`
  by design. Unsetting that flag does **not** revert it. **Rollback = `git revert 4c1cd94` +
  redeploy.** The module's own docstrings were corrected to say this; the old "byte-identical
  flag-off" claim was false once this landed.
- **The crisis-redirect tradeoff is now live behaviour.** An oversized `format` carrying distress in
  its first 15,000 chars now receives a bare 400 **instead of the crisis redirect it would previously
  have triggered**. The engine-leak direction is closed either way. This was disclosed as a tradeoff
  pre-deploy; it is now a live property, which is why §3A is first.

**Owed, cheap, founder-performable — the post-deploy smoke, which was never run:**

```bash
# expect HTTP 400, body: format exceeds maximum length of 15000 characters
# (needs a session Bearer JWT — this route is cookie/JWT auth, see memory
#  human-routes-bearer-jwt-console-smoke; a bare fetch 401s by design)
```
A benign control (short `format`, valid conversation) should still return 200. Neither has been
observed against production.

---

## 3. Founder-gated — do NOT apply without sign-off

### 3A. The perimeter-ordering decision — now live, so it leads
`/api/score-conversation`'s three length checks all sit **before** the R20a block. After-block
placement would preserve the crisis redirect for an oversized field carrying distress, at the cost of
letting oversized requests reach the classifier (a bounded but real cost-amplification vector —
`escalateMildDistress` can call Haiku). **All three siblings share the property**, so this is a
whole-route decision, not a `format` one. Reachability is genuinely narrow (a >15,000-char *format*
field). Recorded in `route.ts` and in
`D-SCORE-CONVERSATION-FORMAT-VALIDATION-LANDED-PR19-FOLDED-2026-09-05`.

### 3B. The R18 assessment-contract corrections
`operations/count-discipline-2026-09/2026-09-05-R18-assessment-contract-SIGNOFF-PACKAGE.md`.
Eleven wording edits across `llms.txt`, `agent-card.json` and `skill-registry.ts`, closing a contract
that has returned HTTP 400 for ~5 months.

**Apply the wording and the assertion as ONE change.** Wording alone repeats the original failure —
docs written three days before the code moved, never updated. The assertion ships as
`…-assessment-contract-drift.test.ts.draft`; move it to
`website/src/lib/__tests__/assessment-contract-drift.test.ts` **in the same commit**. Verified both
directions: **6/7** against the live surfaces, **13/0** against corrected copies.

**One cheap honesty step first.** Every "Live" claim in the findings document is an inference from
**HEAD**, not an observation — no production fetch was made. `llms.txt` is public and unauthenticated:

```bash
curl -s https://www.sagereasoning.com/llms.txt | grep -nE "11 assessments|37 assessments|SO-01|11 free-tier"
```
Hits confirm the stale contract is genuinely served. That upgrades the finding from inference to
observation and closes the gap a PR19 reviewer raised.

### 3C. `api-docs/page.tsx` — its own R18 item
Both assessment entries document `{agent_id, scenario, context}`; the routes take
`{agent_id, responses:[…]}` and **neither reads `scenario`**. A rewrite of two endpoint entries, kept
deliberately out of 3B so a rewrite is not hidden inside a typo fix.

### 3D. Option S — do not run
`operations/count-discipline-2026-09/2026-09-05-option-s-PR19-REVIEW-FINDINGS.md`.
**B1–B4 are pre-run**: they change what the same 240 calls yield, so fixing after the sweep means
re-spending ≈$3.41–4.12. **Q1 and Q2 are mentor questions, not code fixes** — in particular whether
the directional decomposition should exist at all, given the ruling it cites appears to have been
superseded the same day. Do not fix B1–B4 unilaterally: several remedies are open methodological
choices (whether `habitual` joins the floor set; the even-K median convention).

---

## 4. Autonomous — nothing here needs the founder

### 4A. Item E — the CLAUDE.md production-state refresh
**`governance`.** Deferred twice. PR18 governs: close-time artifact, rewritten from the decision log,
carrying its as-of date. **It must now also record the live `format` 400 from §2.** Fold in the two
drafted corrections:

- the **community-map annotation** (`…-community-map-42703-DIAGNOSIS.md`) — the named follow-up is
  closed and its stated cause was wrong; **annotate the dated bullet, do not rewrite it**;
- **do not** refresh the ~20 dated extension counts — each was correct when written.

**Check for peer activity on CLAUDE.md before starting.** Highest-collision file in the repo; a
half-done refresh is worse than a stale one.

### 4B. The comment-stripping weakness in the R20a guard battery
**`code-elevated`.** `loadRouteSource()` gained a `codeOnly` view for the new FV-* cases, but the
pre-existing **INV-*/SRC-*** cases still match raw source — so a commented-out safety call satisfies
them. Disclosed rather than silently changed, because switching them risks 57 passing assertions.
**Do it deliberately:** switch, run, and if anything goes red, find out whether the assertion was
relying on comment text rather than "fixing" the test.

### 4C. Verify the six decision-log entries appended at the 2026-09-05 close
Read-only, against their verbatim records. Cheap insurance; still not done.

### 4D. The stale weekly environmental scan
Last 2026-06-22. Scope it first — research is autonomous; live data is not.

---

## 5. Do NOT

Run Option S. Mint or size a credential. Apply a migration or flip a flag. Change
`.claude/settings.local.json`. Apply any public R18 wording without sign-off. Rewrite dated
historical bullets to make counts current. Touch `operations/agent-circles-2026-08/d6a/` (frozen
instrument) or any file matching the byte-identity `GUARD_RE`.

**One hypothesis to check, not to assume:** a guard call timed out at 55,000ms during the predecessor
session, which *suggests* F1's `GATE1_TIMEOUT_MS` raise has been applied. Nobody read the settings
file. Confirm before relying on it.

---

## 6. Verification

```bash
cd "/Users/clintonaitkenhead/Claude-work/PROJECTS/sagereasoning"
git log --oneline -8
cd website && npx tsx src/lib/__tests__/r20a-invocation-guard.test.ts | tail -1          # 720 passed
npx tsx src/app/api/score-conversation/__tests__/r20a-invocation.test.ts | tail -1        # 63/63
python3 -c "import json;d=json.load(open('public/.well-known/agent-card.json'));print(len(d['capabilities']['extensions']))"
```

*Start at §3A — it is the only item whose subject is already live in production. §3B is where the
largest finding sits.*
