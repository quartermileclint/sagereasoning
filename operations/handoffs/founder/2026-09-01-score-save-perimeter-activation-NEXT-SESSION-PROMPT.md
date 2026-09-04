> **SPENT 2026-09-02** — activation LIVE, founder-walked, three probes green (`2026-09-02-score-save-activation-CLOSE.md`; `D-R20A-SCORE-SAVE-PERIMETER-ACTIVATION-LIVE-2026-09-02`). §6(b), the local-storage bypass, remains open and is carried in the standing opener's queue.

# Next-session prompt — activate `/api/score/save`, verify the private-mentor fix, continue from here

**Founder: paste this file as the first message of a new session.**

Open under the standing opener first —
`operations/handoffs/founder/STANDING-SESSION-OPENER-grounded-foundations.md`. **Where it conflicts
with §0 below, this file wins** (it predates everything in this file and knows nothing of it).

**This file supersedes an earlier draft of itself from earlier today** — that draft covered only the
score/save activation; two more commits have landed since (a production bug fix, and a governance
capture), both described below.

---

## §0 — Re-derive at open. Do not trust this document on faith.

```
git log origin/main..HEAD --oneline      # expect EMPTY — everything below is pushed
git log -1 --oneline                     # expect 7fe838c or later
cd website && npx tsx src/lib/__tests__/r20a-invocation-guard.test.ts        # expect 715/0 GREEN
cd website && npx tsx src/lib/__tests__/r20a-gap-closure-route-wiring.test.ts # expect 936/0 GREEN
cd website && npx tsx src/app/api/score/save/__tests__/perimeter-functional.test.ts # expect 111/0
cd website && npx tsx src/app/api/founder/hub/__tests__/message-persistence.test.ts # expect 13/0
```

If any of these disagree with what this file claims, **trust the command output, not this file** —
say so and stop rather than proceeding on a stale number.

### What happened today (2025-08-31 → 2026-09-01), in three paragraphs

**Thread 1 — the `/api/score/save` R20a perimeter rebuild.** Ruled into the perimeter (screen 10
caller-supplied fields for acute distress before persisting; refuse with a non-200 status; the
calling page must render crisis resources, not "saved"). Built, reviewed under PR19 (29 agents
across two waves — 7 review dimensions + 22 independent refuters, 0 errors), and **two CRITICAL
bypasses were found and fixed at the root** — a JSONB depth-6 silent cutoff and a separator-inflation
defect, both of which let acute distress persist unscreened despite every battery being green.
Multiple HIGH findings folded, including a false "flag-off is byte-identical" claim (now genuinely
true — differentially tested against 13 pre-rebuild body shapes) and three separate instances of a
vacuous test pin. Nine commits, `299c3e9`→`9843bb2`, pushed, Vercel confirmed green by the founder.
**The rebuild is dark** — `SUBSTRATE_SCORE_SAVE_R20A_ENABLED` is unset in production. This is the
main task waiting on this session (§1–§2 below).

**Thread 2 — a founder-reported production bug, found and fixed.** The founder reported the
`/private-mentor` page losing yesterday's mentor responses and not retaining today's exchange across
a refresh. Root cause: every message-persistence write in `/api/founder/hub` discarded its database
error instead of checking it — the mentor's reply is rendered entirely from the API response, never
re-fetched, so a failed write was completely invisible until the next page load. **This is the third
instance of this exact failure class in this codebase** (after `action_evaluations_v3` and the Sage
Reflect completion 503). Fixed: the two critical saves (the founder's message, the mentor's reply)
now throw on a write failure instead of silently succeeding; supplementary saves log loudly.
Regression-tested (mutation-verified) and pushed as `9fae6f4`. **This is pushed and deployed, but its
actual effect in production is unverified from this session** — see §3.

**Thread 3 — a mentor instruction captured, nothing built.** The founder relayed a mentor instruction
about a "bidirectional algorithm" naming two candidate connections to open project questions
(GS-ATRF-1's blast-radius proxy basis; the generation-step architecture, gated by GS-CYB-1). The
instruction states twice, in its own words, that it is not a ruling and not to be built now. Captured
verbatim, cross-referenced against the current register state, and recorded as two pointer rows for
the standing-runner design track's next session. Nothing designed, nothing built. Pushed as `7fe838c`.
**No action needed on this thread** — informational only, unless you want to discuss it.

### Binding documents

| Document | What it binds |
|---|---|
| `operations/handoffs/founder/2026-08-31-score-save-perimeter-rebuild-CLOSE.md` | **THE FULL score/save BUILD + REVIEW RECORD.** §6 has two decisions that are yours; §7 is the activation walk this session executes (below, restated); §9/§10 are honest limits and the full 29-agent PR19 record. |
| `operations/agent-circles-2026-08/2026-08-31-mentor-ruling-corrected-questionB-and-A2b-verbatim.md` | The operative score/save ruling. |
| `operations/decision-log.md` (tail) | Three entries in order: `D-R20A-SCORE-SAVE-PERIMETER-REBUILT-DARK-PR19-PENDING`, then the founder/hub fix (no dedicated decision-log entry — folded into the commit only, named here so it isn't lost), then `D-MENTOR-INSTRUCTION-BIDIRECTIONAL-ALGORITHM-CAPTURED-2026-09-01`. |
| `website/src/app/api/founder/hub/__tests__/message-persistence.test.ts` | The private-mentor fix's own record — its header explains the bug, the fix, and the honest limits of a source-pattern test in full. |

---

## §1 — TWO DECISIONS THAT ARE YOURS, for score/save (close §6)

**(a) The mild-variant copy.** The mild-distress path folds `buildMildSupportResources('practice')`
— founder-signed crisis-adjacent copy, reused from the existing gap-closure module, not authored new.
It opens *"Your entry is saved, and working through this deliberately was the right thing to do…"* —
true on this path, since mild does not block the write. `'practice'` was the builder's choice among
three existing signed variants. **Confirm it, or say which of the other two you'd rather have, or ask
for new copy** — either way it's a one-line change plus a wiring-battery row update.

**(b) The local-storage bypass — a consequence of this ruling, not inherited.** `score/page.tsx`'s
`storageMode === 'local'` branch never calls `/api/score/save` at all, and `/api/score` itself screens
only the `action` field. So a practitioner on local storage writing acute distress into
`emotional_state`, `relationships`, or `context` is screened by **nothing** — and this rebuild does
not touch that path. The durable fix is upstream, in `/api/score` (engine-adjacent,
measurement-neutrality-protected, deliberately not touched here). **This needs your call**: its own
session, folded into a future one, or deferred with the gap explicitly documented as known.

---

## §2 — THE ACTIVATION WALK for score/save (close §7). `code-critical`, AC7 engages here.

This environment holds no production admin credential; every live step is yours.

1. **Confirm deploy is genuinely a no-op on the screening path**: submit a benign evaluation on
   `/score` in cloud mode, confirm it saves normally.
2. **Set `SUBSTRATE_SCORE_SAVE_R20A_ENABLED=true`** in Vercel Production. Redeploy.
3. **Live smoke, both directions, on a throwaway practitioner account:**
   - Acute language in `emotional_state` (real trigger phrases in
     `src/lib/guardrails.ts` `DISTRESS_PATTERNS`). Expect **422**, no scoring card, crisis resources
     on screen, and — the assertion that actually matters — **the row count on `action_evaluations_v3`
     does not move.**
   - A benign evaluation. Expect normal 200, row count increments by one.
4. **Tear down** the throwaway account/rows.

**Rollback:** unset `SUBSTRATE_SCORE_SAVE_R20A_ENABLED` and redeploy (differentially tested
byte-identical to pre-rebuild — `perimeter-functional.test.ts` §17), or `git revert`. **Never** touch
the shared `SUBSTRATE_R20A_GAP_CLOSURE_ENABLED` flag to mitigate an incident here — unsetting it
strips distress screening from 25 other routes, including the most distress-likely tools in the
product.

---

## §3 — Verify the private-mentor fix is actually working, in production

The code fix is pushed and deployed, but nothing in this environment can confirm it's actually
resolving the reported symptom in production — that needs your eyes.

1. **Use `/private-mentor`**: send a message, get a reply, **refresh the page**, confirm the exchange
   is still there.
2. If it's still not retaining, or if you can check server logs: look for lines starting
   `Founder hub error at step [save_founder_message]` or `[save_primary_response]` — if either
   appears, a write is genuinely failing (not just going silently as before) and the underlying
   database-level cause (network, RLS, something else) needs its own investigation, which this
   session's fix was explicitly not able to diagnose from here — it only makes the failure loud
   instead of silent.
3. If the fix confirms working, this thread is closed — no further action.

---

## §4 — Named follow-ups, not done, not blocking anything above

- **The "Ask the Org" mode in `/api/founder/hub`** — a different feature in the same file, with the
  identical unchecked-insert defect (4 sites, confirmed by `message-persistence.test.ts` §6's
  informational count). Left alone deliberately to keep the fix scoped to what was reported.
- **The response-handling execution-coverage gap** on score/save (close §10) — `score/page.tsx`'s
  distress-branch pins are source-index assertions, not execution (no DOM/React test runtime in this
  project). The property is true (hand-traced, and will be confirmed again by §2's live smoke) but not
  machine-proven at that layer. Worth a scoping conversation if you want real coverage there.
- **`userId` not passed to the classifier** on score/save (perimeter-wide, ~40 sites, confirmed inert
  as currently written — `buildVulnerabilityFlagRow` already requires both `userId` and a valid
  `sessionId` before it writes anything). A real fix needs both threaded everywhere, not a per-route
  patch.

---

## §5 — Elsewhere, unchanged and not to be disturbed

The provenance-ledger C3 soak (a clock, do not open), ATRF/EE production state, weights BLOCKED, the
0h call remains the founder's. Nothing in today's work bears on any of those. Two new pointer rows now
wait in the named-input register for the standing-runner track's next design-capable session (§ Thread
3 above) — informational, nothing to act on unless you're opening that session.

---

## §6 — The election

1. **The activation walk (§2)** — recommended first; the rebuild has been reviewed to the depth this
   project's process demands and is waiting on exactly this step.
2. **Verify §3** — cheap, and closes the loop on a real founder-facing bug.
3. **Decide §1(a) and §1(b)** — can happen before, during, or after the walk.
4. Anything else queued in the standing opener, at your discretion.

**Held / do not open:** the response-handling DOM-coverage gap (§4, needs a scoping conversation
first); anything the standing opener already names as held.

**End of prompt.**
