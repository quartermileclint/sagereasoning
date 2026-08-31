# Next-Session Prompt — Confirm the perimeter LIVE, then publish `/limitations`

**Paste as the first message of a new session, in the `sagereasoning` repo root.**

**Stream:** founder.
**Tier: `code-critical`** — a founder-walked live confirmation on the R20a perimeter (AC5) plus a
public-claim change (R18). **AC7 engages at the live smoke.**
**Predecessor:** `2026-08-18-perimeter-completion-CLOSE.md` (commits `fba9b4c`, `6b8434a`).

**Why this is the recommended next session:** it completes an arc that is otherwise 90% done, it is
cheap (a live smoke plus a page edit), and — the substantive reason — **it makes the honest
disclosure live without waiting for M-5 to be built.** A practitioner caught by the perimeter today
is told nothing about what happens next. Publishing that gap honestly is available now and is a
practitioner-facing benefit in its own right. The mentor asked for exactly this: the disclosure must
say it "clearly, once the perimeter is confirmed."

---

## Step 0 — Open

Read `/adopted/standing-protocol-cache.md`, then this file, then **both binding rulings verbatim**
(verbatim wins over every paraphrase here):

- `operations/agent-circles-2026-08/2026-08-18-mentor-rulings-perimeter-claim-bounds-and-curiosity-scoping-verbatim.md` — **Q3 is the operative one**
- `operations/trust-layer-2026-07/2026-08-17-mentor-ruling-limitations-perimeter-practice-family-verbatim.md` — **whose publication instruction Q3 AMENDS**
- `operations/agent-circles-2026-08/2026-08-18-limitations-crisis-wording-STAGED.md` — the ruled wording

**Check HEAD, do not assume it.** Re-verify the byte-identity guard posture first-hand
(`GATE1_FALSE_HOLD_CAPTURE` in the process env AND `.claude/settings.local.json`).

---

## ⚠ THE TRAP THAT WILL BITE THIS SESSION

**The 2026-08-17 ruling says "Publish A3's original wording." DO NOT.**

That instruction is **AMENDED** by the 2026-08-18 Q3 ruling: a bare **"every time" OVER-PROMISES and
may not be published**. A session that reads the 2026-08-17 ruling, finds its conditions met, and
publishes the original wording would publish a claim the mentor has since ruled dishonest.

Both rulings are binding and they are in tension on this exact point. **Q3 is later and governs.**

---

## Step 1 — Confirm the perimeter LIVE (founder-walked; AC7)

**Grounding fact to re-verify, not assume:** `SUBSTRATE_R20A_GAP_CLOSURE_ENABLED` was already `true`
in Vercel Production before the perimeter-completion commit, and the 20 newly-registered routes share
that flag — so they began screening on the founder's push of `fba9b4c`. **No flag flip is needed.**
Confirm this first-hand before smoking; if the flag is somehow unset, the smoke will silently pass
for the wrong reason.

**The smoke (founder-run, AI guides and verifies, AI performs no live op):**
Pick **3 routes across the three grounds**, so the confirmation is not narrow:
- one **practice-family** route (e.g. `/api/mentor/view-from-above` — the mentor named it the
  clearest case in the family)
- one **mentor-examination** route wired 2026-08-18 (`/api/mentor-appendix` or `/api/mentor-profile`)
- `/api/evaluate` (**verify the auth gate holds** — an unauthenticated call must 401 BEFORE any
  screening; the ruling forbids screening an anonymous surface)

For each: a benign submission saves normally; an acute submission returns the crisis redirect with
**no write**. Verify the no-write side by row count, not by the response alone.

**Tear down every artifact** and record what was created and removed.

## Step 2 — Publish `/limitations` (R18)

Apply the ruled wording from the STAGED file. **Two things must both be present:**

1. **The Q3 coverage bound** — preferred formulation, or the floor if length forces it. Do not
   compress below the floor, do not paraphrase it looser, and **do not drop the "found incomplete
   once" clause** — that clause is the entire substance of the bound.
2. **The M-5 disclosure — "nothing happens afterwards" — PROMINENT.** The mentor named it *"the more
   important half"* and said it "should remain prominent in whatever wording is eventually
   published." A practitioner caught by the perimeter receives an in-session redirect and nothing
   else. Say so plainly.

**Check the other R18 surfaces** (`llms.txt`, `agent-card.json`, api-docs) for any coverage claim
that would need the same bound — do not assume the page is the only surface carrying one.

## Step 3 — Verify + records

`npx tsx src/lib/__tests__/r20a-invocation-guard.test.ts` (expect **689/0**) · `tsc` 0 ·
**`npm run build`** (mandatory — tsc does not catch Next.js route-export violations) ·
decision-log entry · session close.

**PR19** if any live-surface code changes. A page-copy edit plus a live smoke may not require it —
say so honestly rather than skipping silently.

---

## What must NOT happen in this session

- **No new perimeter members, no registry changes, no floor changes.** The sweep is green at 689/0;
  leave it.
- **No M-5 build.** Publishing the disclosure is not building the write path. M-5 stays P0 and
  undischarged — the disclosure exists precisely because it is not built.
- **No `/api/evaluate` re-opening to anonymous access.** Membership and its auth gate stand or fall
  together.

## Carried, not in scope

Empty-subject billed-call defect in the **17 prior-session routes** (`hasScreenableSubject` covers
only the 3 wired 2026-08-18) · no per-route runtime invocation tests for those 3 ·
PR24 retention parity for `agent_hold_observations` · the curiosity/taxonomy stubs
(`2026-08-18-curiosity-taxonomy-stubs-NEXT-SESSION-PROMPT.md`, ruled and ready, queued behind this) ·
M-4 obligations 1 and 4 · the RLS survey remainder.

*End of prompt. The perimeter catches people now; this session is about telling them the truth about
what that does and does not mean.*
