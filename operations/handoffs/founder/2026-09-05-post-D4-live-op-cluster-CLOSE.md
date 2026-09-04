# Close — D4's took-effect proof discharged, D1 settled open, the retry held on a measurement

**Date:** 2026-09-05. **Stream:** founder. **Tier:** `code-critical` (item 1) + read-only (item 2)
+ `governance` (item 3's record). **AC7:** engaged and discharged. **PR6 + PR17:** engaged.
**PR18/PR20/PR21/PR23:** engaged. **Model:** `claude-opus-5`.
**Decision-log entry:** `D-D4-TOOK-EFFECT-PROVEN-D1-WATCH-OPEN-RETRY-HELD-2026-09-05`.
**Production state at close: byte-equivalent to session open.** No schema, flag, deploy, credential
or perimeter change survives the session. **The S11 flip remains REFUSED; P4/P5/P6 unmoved; the
window has not started.**

## 1. Status in one paragraph

All three prompt items are resolved, two of them by producing evidence and one by declining to act on
the evidence found. **D4's took-effect proof is discharged** — the claim the activation close could
only make negatively is now made positively, by a three-legged proof in which no leg is sufficient
alone. **D1's watch is settled as genuinely OPEN**, which is the weaker of the two available answers
and the one the prompt predicted. **The credential-lookup retry was NOT flipped**, because the check
its own item mandates returned a decisive negative. **A fourth finding surfaced that nothing set out
to look for:** D4's activation has a live consequence on the adjacent `credential-completed` path that
neither the register nor the activation close names.

## 2. Item 1 — D4 took effect

**Proven, and the method is the point.** A live absence of `justice-surface-*` is also what a
silently-failed write looks like, so the proof has three legs:

| Leg | What it establishes |
|---|---|
| **Local differential on the real signed artifact** | `deriveWorstJusticeOutcome` run twice over the production consult's own assessment: `false` ⇒ `justice-surface-indeterminate`, `true` ⇒ `null`. **The branches provably differ on this input.** |
| **Positive control** | Three `credential-completed` rows — the emission path demonstrably ran. |
| **The finding** | **No `justice-surface-*` row of any kind**; `agent_trust_state.dikaiosyne.justice_floor_active = false`. |

**The differential was validated before it was trusted**, against two negative controls that each
would have produced a hollow proof: a two-circle fixture (**flag-on still emits** — not gated) and a
status-less self-only fixture (**flag-off also silent** — no differential). **Both are plausible
outcomes of a real consult**, and either would have been written to production and read as success.

**Corroboration recorded as premise-only.** The write's `loop_fold` independently classified the input
as a self-regarding prudential loop (`n_dikaiosyne_level_excluded: 1`, dikaiosyne absent from
`character.domains`). That is **production's own predicate agreeing the input is self-only** — but it
runs on `assessKathekonEngagement`, which **deliberately does not receive the D4 flag**, so it
corroborates the premise and **not** the conclusion.

**Honest scope:** the `indeterminate` path only. `violated` and `met` are un-exercised.

**Teardown complete and verified:** credential `734c28a2-…` revoked; `agent_trust_events` /
`agent_trust_state` / `agent_accreditation` all confirmed `0 / 0 / 0` by explicit count, not by
"Success. No rows returned".

## 3. Item 2 — D1 is open, and the carried query would have answered wrongly

**No qualifying accreditation close-write since 2026-07-18.** Four event types, all
`virtue_domain: null`: `orientation-reading-toward` (1356), `orientation-reading-indeterminate` (786),
`reflect-screened-honest` (165), `reflect-completed-honest` (107). **No `credential-completed`.**

So `justice_capped: false` is consistent with the correction holding and **proves nothing about it.**
**The watch stands.**

**The method note is the transferable part.** The carried query was `order by occurred_at desc
limit 50` over **2,414 rows** — it would have returned 50 orientation readings from one day and
nothing else, and *"no accreditation writes appear"* would have been **the right conclusion by an
unsound route**, indistinguishable from the limit hiding them. Replaced with a `group by` before
running. This is the `postgrest-row-cap-silent-truncation` class in a new costume: not a client cap
this time, an explicit `limit` in a carried query nobody re-derived.

**Separate observation, named not diagnosed:** consults and reflects both fire on this credential
through 2026-09-04, so credential and harness work — **but no accreditation write has landed in seven
weeks.** The H4 close-hook write is either not firing or failing silently.

## 4. Item 3 — held, on the check the item itself demanded

**The transient-401 class is silent.** Last genuine `http 401`: **2026-08-08T12:36:34Z**. **Zero
across 26 traffic days since**, on days of 500–1,460 log lines. The 48 `401` string matches in that
window were checked, not assumed — all `.401Z` milliseconds and UUID fragments. **The class has not
changed shape either:** `http 503` is sporadic across the whole log *including before* 2026-08-08. No
commit touched `practice-credential.ts` in the window, so **the stop is unexplained** — a reason to
keep the retry built, not to activate it blind.

**The deciding argument was verifiability, not the rate.** The retry fires only on a genuine transient
DB error, which cannot be induced — so flipping it would have added a **second unverifiable
activation** to the record, in the session convened to close the first one. **Founder-elected: hold
and record.** Flag remains unset; code remains built-dark and byte-identical.

## 5. The finding nobody went looking for — D2, evidenced

`credential-completed` is emitted **one per engaged domain straight from `virtue_domains_engaged`,
with no circle test** (`derive-trust-events.ts:86-99`); its effect is **`'increase'`**
(`trust-transition.ts:41`). On the self-only fixture: **`dikaiosyne: earned_level 'deliberate',
profile_prior 'habitual', justice_floor_active false`.**

**M-1's correction reached the justice-surface EMISSION but not the domain TAGGING.**
`computeVirtueDomains` still tags dikaiosyne engaged on a self-only action, so the same
mis-attribution now yields an **increase instead of a cap**. At one event the level is identical
either way; **the difference is the latch, which governs future rises.** D4 correctly ends the
permanent-cap class D1 documents — what remains is that **dikaiosyne can rise past `deliberate` on
evidence from actions with no other party at any circle.**

**Confidence marked: single-event state OBSERVED; multi-event rise REASONED from
`trust-transition.ts`, not measured.** **Not an argument against D4** — M-1 is right, and the remedy
is D2, not restoring a mis-attributed cap. **But D4's activation raised D2's priority.**

## 6. Session honesty notes (PR21)

- **I broke a markdown table and caught it by checking rather than by reading.** Writing `` `0|0|0` ``
  into a register cell added two unescaped pipes, silently splitting the row into extra columns. Found
  by counting pipes per row, fixed to `0 / 0 / 0`. **The neighbouring D2 row does it correctly with
  `\|` escapes** — the pattern was already in the file I was editing.
- **I then raised a false alarm about that same D2 row** (its 8 pipes are *escaped*), and had to
  correct myself. My counter was naive; the file was fine.
- **I used a column name from a prose summary instead of the schema** — `volatility` and
  `last_activity_at` do not exist (`volatility_rating`, `last_domain_activity_at` do). The query
  errored read-only and changed nothing, but it is precisely the failure this session's subject is
  about: asserting a fact from a description rather than a source.
- **I ran the differential on a reconstruction first and called it sufficient**, then ran it on the
  real artifact when it arrived. The reconstruction reasoning was correct — the reducer reads exactly
  three fields — but "sufficient" was my judgement about my own shortcut. **When writing the real
  artifact to a file I also shortened three long free-text fields to survive a shell heredoc**;
  disclosed at the time rather than presented as a pristine run.
- **I dismissed the first two guardrail cautions with a citation rather than a reading** — naming the
  D4 close's documented false-positive class instead of examining the grounds. That is KG-EX2 exactly,
  in a session whose prompt says to read the grounds each time. **Three distinct grounds appeared**:
  sparse-extraction (×2), and one genuine **engine outage** (`proximity: unknown`) which is not the
  same thing and would have been flattened by the habit.
- **The peers were live throughout** — four files modified mid-session, then committed
  (`0126645`, `97db750`, the perimeter-ordering work). **Nothing of theirs was touched or staged.**
  My one repo-resident scratch file went in and out inside single commands.
- **Peer entries are dated 2026-09-06 while `date` returns 2026-09-05 AEST** (UTC 2026-09-04 22:50,
  matching the DB timestamps exactly). I used `date`, per the prompt. **The discrepancy is unresolved
  and is flagged, not adopted.**

## 7. Verification method used

Batteries at open: trust-core **112/0**, kathekon **113/0**, negative-battery **251/0** +
`RELEASE GATE: PASS` — exact match to expectation. D4 live-confirmed by public read-only GET.
Differential validated against two negative controls, then run on the real signed artifact. Live
proof by founder-run Supabase queries and console `fetch`. **The AI performed no Supabase, Vercel,
git-push or mint operation.**

## 8. Carried — yours

1. **D1's watch stays open.** Blocked in practice by §3's observation — no accreditation write in
   seven weeks.
2. **Why no accreditation write on `s9-loop` since 2026-07-18?** Named, not diagnosed.
3. **D2's priority is raised** (§5); the fix is not scoped here.
4. **B4's follow-up measurement — still NOT DUE** (2026-09-08 earliest; ≥3 days of ordinary traffic).
   One `reason="timeout after 55000ms"` already appears in the log, which is the post-remedy residual
   B4's point (2) asks about — **do not read it as a rate.**
5. **The retry stays built-dark**; revisit if the 401 class returns.
6. **The window remains blocked** on B4 and P8a; `GATE1_FALSE_HOLD_CAPTURE` untouched.

## 9. Founder verification (between sessions)

```
cd "/Users/clintonaitkenhead/Claude-work/PROJECTS/sagereasoning"
git status --short
git add operations/decision-log.md \
        operations/trust-layer-2026-07/S11-FLIP-PREREQUISITES-REGISTER.md \
        operations/handoffs/founder/2026-09-05-post-D4-live-op-cluster-CLOSE.md
git commit -F <commit-message-file>
```
Then push via GitHub Desktop. **Path-scoped deliberately — peers are live; never `git add -A`.**
**Records only; nothing deploys and Vercel state is unchanged.**

## 10. Cross-references

`2026-09-05-D4-activation-and-F3prime-CLOSE.md` §5/§6 (the two items this discharges) ·
`S11-FLIP-PREREQUISITES-REGISTER.md` §D D1/D2/D4 ·
`2026-08-16-mentor-rulings-M1-M5-r2b-verbatim.md` **M-1** ·
`2026-08-15-false-hold-new-window-scoping-note.md` §2.4/§3 ·
`2026-09-05-post-D4-live-op-cluster-NEXT-SESSION-PROMPT.md`.

*End of close. Two claims the record could previously only make negatively are now made positively,
and one activation was declined on the strength of its own required check.*
