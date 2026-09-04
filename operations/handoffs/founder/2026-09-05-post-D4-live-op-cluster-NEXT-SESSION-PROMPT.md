# Next session — the post-D4 live-op cluster: two honesty gaps, and one activation

**Three items, all founder-walked live ops, all bounded.** Items 1 and 2 close gaps the D4 activation
session opened and named rather than papered over. Item 3 is an independent window-adjacent activation.
**Any of the three can be dropped without harming the others.**

**This session is ATTENDED and `code-critical`.** Item 1 mints a credential and writes to a live trust
ledger; item 3 flips a flag on the live credential-validation path. **AC7 engages; PR6 and PR17 engage;
every live op is yours, not the AI's.**

**Read first, in this order:** `/adopted/standing-protocol-cache.md` ->
`operations/handoffs/founder/2026-09-05-D4-activation-and-F3prime-CLOSE.md` **including sections 5, 6
and 8** -> `S11-FLIP-PREREQUISITES-REGISTER.md` **section A P6, section B B4, section D D1 and D4** ->
`2026-08-15-false-hold-new-window-scoping-note.md` **sections 2.4 and 3** (both amended 2026-09-05 by
F-3') -> then this file.

## State at hand-off (2026-09-05)

**D4 is LIVE.** `SUBSTRATE_JUSTICE_SELF_CIRCLE_NARROWING_ENABLED=true` in Vercel Production; commit
`99e9603` on `origin/main`, Vercel green. A self-only-circle assessment no longer emits a `dikaiosyne`
justice event. **Production is not byte-equivalent to before — a deliberate standing change.**

**Concurrency is high and continuous, and it produced this project's FIRST real collision.** A peer's
commit `468fcf9` ("Record item D: Option S...") added 190 lines to `operations/decision-log.md`, of which
**187 were the D4 session's entry, swept up by an unscoped add and committed under an unrelated message.**
The content is intact and correct; only the attribution is wrong, and history was deliberately NOT
rewritten on a shared checkout. **The standing cache's claim that path-scoping has caught every case is
now false, and a pre-commit hook is its own named escalation.** Commit path-scoped; run `git status`
twice; leave other sessions' files alone.

**Do NOT truncate `git status`.** The D4 session raised a false peer-collision alarm because a `head -3`
cut the third modified file off the list. Run it whole.

## First move: verify, don't trust this file

```bash
cd "/Users/clintonaitkenhead/Claude-work/PROJECTS/sagereasoning"
date && git fetch origin && git status --short && git log --oneline -3
cd website && npx tsx src/lib/substrate/trust-core/__tests__/trust-core.test.ts
npx tsx src/lib/substrate/trust-core/__tests__/kathekon-engagement.test.ts
cd .. && node harness/gate1-pre-decision/test/negative-battery.mjs | tail -2
```

Expected: `112 passed`; `113 passed`; `251 passed, 0 failed` + `RELEASE GATE: PASS`.

**Confirm D4 is still live and the cap has not moved** (public, read-only, no credential needed):

```bash
curl -s "https://www.sagereasoning.com/api/trust-record/sagereasoning:s9-loop@v1" | python3 -m json.tool | grep -E "justice_capped|earned_level|honest_reflect_count"
```

Expected: `justice_capped: false`, `earned_level: "deliberate"`. **`honest_reflect_count` will have moved
past 119 — that is the harness running, not a fault.** **Date artifacts from `date` / `git log`, never
from the context date** — that error misdated a whole session on 2026-09-04.

---

## Read this before planning: P8a's activation IS the window start

**Verified first-hand at the D4 session, because the register's phrasing invites the opposite reading.**
`cfg.falseHoldCapture` — i.e. `GATE1_FALSE_HOLD_CAPTURE` — is the **single gate for both** the guard-path
capture (P8a, `at-action-hook.mjs:487`) and the consult-path capture (`:726`).

**There is no separate "activate P8a" step.** Setting that flag starts the window. The scoping note is
consistent with this (P8a's activation is item 7, not items 1-6), but register D4's *"ACTIVATION remains
open"* reads as though a standalone P8a activation exists. **It does not. Do not go looking for it.**

**Consequence: the window cannot start this session**, because it now has **two** preconditions (F-3',
scoping note section 3) and one of them is not yet due — see item 4.

---

## Item 1 — the D4 took-effect proof (`code-critical`)

**Why it is owed.** D4's activation was verified only by a **non-regression** check. That check reads
identically flag-on and flag-off **by design**, because D4 moves no existing state — so it cannot fail,
and the D4 close labels it accordingly rather than calling it verification. **No route reads or echoes
this flag** (verified), so there is no cheap read-only proof.

**The proof.** Mint a throwaway `accreditation_write` credential; write a signed assessment whose
oikeiosis carries **exactly one circle, `self_preservation`**, with an `obligation_assessment` status;
then confirm **no `justice-surface-*` row** reached `agent_trust_events` for that agent. Flag-off, that
write would emit one. Then remove every test artifact and confirm the public GET returns 404.

**Design the assessment against `derive-trust-events.ts:225-303` first, not from this description** — the
gate is `beyondSelfCircleCount === 0`, and a circle whose name is blank counts as *unknown*, not
self-only (STRICT). A fixture that gets that wrong proves nothing.

**This is optional and D4 is safe without it** — the failure direction is *withholding* an emission, the
conservative side. **What it buys is a claim the record can currently only make negatively.**

## Item 2 — D1's full discharge (read-only)

A single query settles it. D1's re-latch watch asks for a re-read *after the next gen-2 accreditation
close-write*; the D4 session could only observe that the cap is **still `false`**, because the public
record exposes **state, not the ledger**. So `false` is consistent with two worlds: the write happened
and correctly did not latch, or **no qualifying write happened at all.**

```sql
select event_type, virtue_domain, occurred_at, artifact_ref
from agent_trust_events
where agent_id = 'sagereasoning:s9-loop@v1' and occurred_at > '2026-07-18'
order by occurred_at desc limit 50;
```

**Record the answer in D1's row beside the existing observation.** If a qualifying close-write did occur
and did not latch, the watch is discharged in the strong sense — say so. If none occurred, **say that
instead**; it is the more likely reading and it means the watch is still genuinely open.

Pairs naturally with item 1 — same Supabase session.

## Item 3 — the credential-lookup retry activation (`code-critical`)

Built dark 2026-07-30 behind **`SUBSTRATE_CREDENTIAL_LOOKUP_RETRY_ENABLED`** (unset everywhere means a
byte-identical single attempt). It retries a genuine **transient** lookup error once, never an unknown
key, and **deliberately never the usage RPC** — billing double-increment risk. It targets the diagnosed
transient-401 class (memory `gate1-consult-401-is-transient-fail-secure`).

**Check the current 401 profile in `~/.sage-gate1/gate1.log` BEFORE flipping**, per the item's own
standing instruction — if the class has gone quiet, the activation buys nothing, and that is worth
knowing before rather than after.

**Relation to the window:** scoping note section 2.4 names this as preceding the window and shrinking the
transient-401 loss class. It is **not** a window precondition; it improves one of the counted losses.

## Item 4 — what is NOT available this session, and why

- **B4's follow-up measurement — NOT DUE.** The F1 remedy landed **2026-09-05** and the method needs
  **at least 3 days of ordinary traffic**, so **2026-09-08 at the earliest**. It is one of the window's
  two preconditions. **Do not run it early on thin data** — B4 itself says *"one successful call is not a
  rate."* Its method, and the three things it must report, are in B4 verbatim; do not re-derive them.
- **The window start** — blocked on B4 above, and it is the same flag as P8a (see the boxed note).
- **`agent_hold_observations` PR24 retention** — **HOLD confirmed by ruling**
  (`2026-09-05-mentor-ruling-guard-availability-and-lean-mode-doctrine-verbatim.md`, F3): a retention
  sweep during an active measurement arc would remove evidence the arc needs. *"Do not touch until P6
  says the buffer is finished with."*
- **Lean mode** — ruled **doctrinal**, not an operational preference, and explicitly not to be adopted.
  If it comes up, the live question is the narrow one that ruling's executing note records: *given that
  lean mode is doctrinal, does doctrine permit adopting it, and under what disclosure?*

## What this session must NOT do

- **Not** set `GATE1_FALSE_HOLD_CAPTURE` or change `GATE1_STATE_DIR`. That starts the window, and the
  window is blocked.
- **Not** treat any of this as progress toward the flip. **The S11 flip is REFUSED and stays refused.**
  P4/P5/P6 are unmoved. If a move starts to feel like it is building toward the flip, stop and name it.
- **Not** "fix" the deliberate predicate/reducer divergence. The predicate's Arms 2-4 still ENGAGE a
  self-only violated obligation; **engagement is not emission**, and M-1 rules only on emission. Pinned
  at sections 8.9d and 8.9e. **Making the predicate pass the D4 flag empties `loop_fold`'s live
  `self_regarding` bucket and falsifies a published claim at `llms.txt:548`** — mutation-verified
  2026-09-05.
- **Not** re-route a self-only *violation* to `phronesis`/`sophrosyne`. M-1 named that as the correct
  destination **and did not license building it**; the live posture is the ruled interim WITHHOLD.
- **Not** let the AI perform any Supabase, Vercel, git-push or mint operation. It guides and verifies.
- **Not** fold in the standing-runner or count-discipline tracks even if their files appear in
  `git status` — peer sessions work there.

## Standing constraints

- **Verify against source, not against this file.** The D4 session found a docstring asserting the rule
  M-1 **overturned**, still sitting on the option type a caller reads; the code was right and the record
  was wrong. **Two register line-number citations had also drifted** (418 to 548, 632 to 762).
- **Mutation-verify, don't read.** Reading four gate lines would have "verified" M-1 symmetry. Mutating
  them showed **one** pin carries it. **A lesson cited is not a lesson tested** (KG-EX2).
- **PR19 applies** to any code change. **Assume your own mutation sweep is weaker than you think** — an
  independent sweep of 29 found six survivors an author's 8 had missed.
- **PR20:** timestamp-check every present-tense mechanism fact you write.
- **Guardrail cautions: read the grounds.** A deny is ENFORCE and is honored; an outage is not a deny.
  **The D4 session hit a guard-path ENFORCE deny that was a FALSE POSITIVE** — see the close, section 8.
  Expect the class; read the grounds each time rather than assuming either way.

## Anticipated shape

| Phase | Estimate |
|---|---|
| Reads + first-move verification | 20-25 min |
| Item 2 (ledger query + record it) | 15 min |
| Item 1 (fixture design, mint, write, verify, artifact removal) | 60-75 min |
| Item 3 (401-profile check, flip, verify) | 30-40 min |
| Decision-log + close | 30 min |

**Rollback:** item 1's test artifacts are removed in-session by design. Item 3 — unset
`SUBSTRATE_CREDENTIAL_LOOKUP_RETRY_ENABLED` and redeploy; flag-off is byte-identical. **No schema change
is involved in any of the three.**

End of prompt.
