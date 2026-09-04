# NEXT SESSION PROMPT — carried items after the count-discipline sweep

**Paste into a fresh session. Tier: `governance`** unless item 3 is elected (`code-elevated`).
**Written 2026-09-05** at the close of the session that ran items A–D of
`2026-09-05-post-ruling-autonomous-work-NEXT-SESSION-PROMPT.md`.

---

## 1. Open

1. `/adopted/standing-protocol-cache.md`; `/CLAUDE.md` (**the count-discipline note**); `/manifest.md`
   targeted only.
2. The close: `2026-09-05-post-ruling-autonomous-work-CLOSE.md`.
3. **`ListAgents` at open; `git status` at open and again before every staging.** Path-scoped commits;
   never `git add -A`. Peers were active all through the predecessor session and HEAD moved under it
   repeatedly.
4. **Re-derive every count from source.** Do not quote one from this prompt or from CLAUDE.md.
5. **Standing fact:** on this shared checkout a peer's push publishes your commits. The commit, not
   the push, is the point of no return.

---

## 2. Founder-gated — do NOT apply without sign-off

### F-A. The R18 assessment-contract corrections
`operations/count-discipline-2026-09/2026-09-05-R18-assessment-contract-SIGNOFF-PACKAGE.md`.
Eleven wording edits across `llms.txt`, `agent-card.json` and `skill-registry.ts`, closing a contract
that has returned HTTP 400 for ~5 months.

**Apply the wording and the assertion as ONE change.** Wording alone repeats the original failure
(docs written three days before the code moved, never updated). The assertion ships as
`…-assessment-contract-drift.test.ts.draft`; move it to
`website/src/lib/__tests__/assessment-contract-drift.test.ts` **in the same commit**. It was verified
both directions: **6/7** against the live surfaces, **13/0** against corrected copies.

### F-B. `api-docs/page.tsx` — its own R18 item
Both assessment entries document `{agent_id, scenario, context}`; the routes take
`{agent_id, responses:[…]}` and **neither reads `scenario`**. A rewrite of two endpoint entries, kept
deliberately out of F-A so a rewrite is not hidden inside a typo fix.

### F-C. Option S — do not run yet
`operations/count-discipline-2026-09/2026-09-05-option-s-PR19-REVIEW-FINDINGS.md`.
**B1–B4 are pre-run**: they change what the same 240 calls yield, so fixing after the sweep means
re-spending ≈$3.41–4.12. **Q1 and Q2 are mentor questions, not code fixes** — in particular whether
the directional decomposition should exist at all, given the ruling it cites appears to have been
superseded the same day.

### F-D. Perimeter ordering on `/api/score-conversation`
The new `format` 400 sits before the R20a block, matching its siblings — so an oversized `format`
carrying distress now gets a bare 400 rather than the crisis redirect. After-block placement is
stronger on that axis but lets oversized requests reach the classifier. **A whole-route decision;
both siblings share the property.**

---

## 3. Autonomous — nothing here needs the founder

### A. Item E — the CLAUDE.md production-state refresh
**`governance`.** Deferred twice now. PR18 governs: close-time artifact, rewritten from the decision
log, carrying its as-of date. **Fold in the two corrections already drafted and owed:**

- the **community-map annotation** (`…-community-map-42703-DIAGNOSIS.md`) — the named follow-up is
  closed and its stated cause was wrong; **annotate the dated bullet, do not rewrite it**;
- **do not** refresh the ~20 dated extension counts — each was correct when written.

**Check for peer activity on CLAUDE.md before starting.** It is the highest-collision file in the
repo and a half-done refresh is worse than a stale one.

### B. The comment-stripping weakness in the R20a guard battery
**`code-elevated`.** `loadRouteSource()` gained a `codeOnly` view for the new FV-* cases, but the
pre-existing **INV-*/SRC-*** cases still match raw source — so a commented-out safety call satisfies
them. Disclosed rather than silently changed, because switching them risks 57 passing assertions.
**Do it deliberately:** switch, run, and if anything goes red, find out whether the assertion was
relying on comment text.

### C. Verify the six decision-log entries appended at the 2026-09-05 close
Read-only, against their verbatim records. Cheap insurance; still not done.

### D. The stale weekly environmental scan
Last 2026-06-22. Scope it first — research is autonomous; live data is not.

---

## 4. Do NOT

Run Option S. Read production. Mint or size a credential. Apply a migration or flip a flag. Change
`.claude/settings.local.json`. Apply any public R18 wording without sign-off. Rewrite dated
historical bullets to make counts current. Touch `operations/agent-circles-2026-08/d6a/` (frozen
instrument) or any file matching the byte-identity `GUARD_RE`.

**One hypothesis to check, not to assume:** a guard call timed out at 55,000ms during the
predecessor session, which *suggests* F1's `GATE1_TIMEOUT_MS` raise has been applied. Nobody read the
settings file. Confirm before relying on it.

---

## 5. Verification

```bash
cd "/Users/clintonaitkenhead/Claude-work/PROJECTS/sagereasoning"
git log --oneline -8
cd website && npx tsx src/lib/__tests__/r20a-invocation-guard.test.ts | tail -1          # 720 passed
npx tsx src/app/api/score-conversation/__tests__/r20a-invocation.test.ts | tail -1        # 63/63
python3 -c "import json;d=json.load(open('public/.well-known/agent-card.json'));print(len(d['capabilities']['extensions']))"
```

*Start at §3A only if the founder has not elected a §2 item. §2 is where the value is.*
