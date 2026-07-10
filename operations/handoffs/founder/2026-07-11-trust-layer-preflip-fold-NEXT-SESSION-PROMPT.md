# Next-Session Prompt — Trust Layer PRE-FLIP FOLD (run between the safety audit and S9)

> **SPENT 2026-07-11** — executed same-day (`D-TRUST-LAYER-PREFLIP-FOLD`). PA-1+PA-9 folded at the root (S1 battery 97/0; the 4-dimension adversarial review completed fully — ratchet CLOSED on every reachable path); PA-3/PA-4/PA-7/PA-8/C-3 folded + pinned; the S9 prompt amended per PA-2. Close: `operations/handoffs/founder/2026-07-11-trust-layer-preflip-fold-CLOSE.md`. **S9 is unblocked** once the fold commit is pushed.

**For the founder. Paste as the first message of a fresh session.** (Rename the date prefix to the actual session date.)

**Stream:** founder.
**Tier:** `code-elevated` — a pure-lib S1-engine change + one store hardening + battery pins; repo-only, DARK (the flag stays unset; production byte-equivalent until the founder's push, and byte-identical flag-off after it). NO flag, NO schema, NO migration, NO mint, NO deploy. AC7 not engaged.
**Governing frame:** /adopted/standing-protocol-cache.md + /adopted/build-sessions-protocol-cache.md.
**Mandate:** the 2026-07-11 pre-activation safety audit (`operations/trust-layer-2026-07/2026-07-11-preactivation-safety-audit-report.md`; `D-TRUST-LAYER-PREACTIVATION-SAFETY-AUDIT`). **S9 is gated on this fold** — PA-1 is `blocks_flag_flip`.
**Binding specs:** ADR-013 §3 row 2 + §5 (mentor answers verbatim: `operations/trust-layer-2026-07/2026-07-07-mentor-nine-answers-verbatim.md`) — check every fix against the mentor's stated semantics before folding; the audit's recommended designs are recommendations, not spec.

## The mandatory fold (blocks the flip)

**PA-1 (HIGH) + PA-9 — the uncapped justice-met ratchet, fixed with the rise-only hardening in the SAME change.**
- Defect: `derive-trust-events.ts:117` omits `demonstratedProximity` from the `justice-surface-transparently-handled` payload; `trust-transition.ts:119-123` then defaults the cap to `sage_like` ⇒ an unconditional +1 per met-obligation write, to rank 4, ungated by coverage. Two ordinary `deliberate`-grade writes take dikaiosyne `habitual → sage_like`. Re-submitting the same met assessment inside a superset write re-credits (fresh content-hash correlation).
- Recommended fix (audit §4; verify against mentor A-answers first): the deriver computes the CONSERVATIVE (weakest) `katorthoma_proximity` across the verified assessments that carried the met obligation and passes it as `payload.demonstratedProximity`; the engine's `clear-cap-and-increase` branch clears the latch unconditionally but raises ONLY when `demonstratedRank > fromRank` (`newRank = min(demonstratedRank, fromRank + 1)`, else `fromRank`) — PA-9: without the rise-only guard, supplying the field arms a latent 3-rank DROP on a positive event (`trust-transition.ts:123` has no `>` guard). Consider also whether the branch should honor `coverageContinuous` like the `increase` branch does — a deliberate spec question, not an assumption.
- Pins (all must be NEW battery cases): (i) the exact live payload shape — a justice event with NO demonstratedProximity must no longer reach sage_like (lock whatever the folded semantics are); (ii) the two-write ratchet scenario from the audit (habitual + 2× deliberate-grade met writes ⇒ must NOT read sage_like); (iii) demonstrated-below-current on a positive event ⇒ level unchanged + latch cleared; (iv) the latch still clears on a genuine met evaluation.

## Cheap riders (fix_before_s10 items in the same files — fold now, or explicitly carry)

- **PA-4** (`derive-trust-events.ts:151-164`): gate `sawMet` on `virtue_domains_engaged.includes('dikaiosyne')`, matching the gate the `unevaluated` branch already has (the violated/indeterminate directions stay ungated — conservative-safe). Pin: a phronesis-only assessment with a met circle mints NO dikaiosyne event.
- **PA-3** (`trust-core-store.ts:174-179, 214`): inspect the `error` field on the fold's state read and ABORT the fold on a real error (missing-table stays benign); check the upsert result. Pin: a transient read error must not overwrite an existing row with the habitual seed (extend `fake-supabase.ts` to inject a transient select error).
- **PA-7** (`emission-hooks.ts:84,127` or inside `emitTrustEvents`): log the discarded `ok:false` StoreResult (console.error, matching the stated log-and-continue contract). Pin: a store rejection produces a log line, never a throw.
- **PA-8** (`api/credential/erase/handler.ts:245-264`): add collaboration_records to `tables_cleared` + a `collaboration_rows_deleted` response field (the value already returns from `consumer-erasure.ts:312`). Pin: extend the erase-handler test.
- **C-3** (`trust-transition.ts:162-172`): correct the docstring ("the store's rebuild path" does not exist), or build the small ledger-replay rebuild — founder's call; the docstring fix is the minimum.

## Also in this session (records, not code)

1. **Amend the S9 prompt** (`operations/handoffs/founder/2026-07-10-trust-layer-S9-dogfood-install-NEXT-SESSION-PROMPT.md`): add the PA-2 step — set `SUBSTRATE_TRUST_CORE_SWEEP_ENABLED=true` (verify the cron returns `flag_enabled:true`) at the same time as `SUBSTRATE_TRUST_CORE_ENABLED`, TEST and prod; note the rollback line's dependency on it.
2. Mark the audit's gate as discharged in the S9 prompt's pre-condition 0 (point at the fold commit + re-run batteries).

## Verify (gates)

S1 battery (`trust-core.test.ts`) green with the new pins (75 + new); S2–S8 regressions unchanged (87/106/417/87/84/122/145); `tsc` 0; `npm run build` 0. Adversarial review per the arc's slice pattern (budget-check first; the §4 first-hand precedent if the limit bites) — at minimum, independent refuters on the PA-1 fold ("does the fix close the ratchet on every reachable path; does the rise-only guard break any legitimate rise; does the latch still clear").

## Rollback

`git revert` the fold commit. The flag stays unset throughout ⇒ nothing live changes; flag-off byte-identity is unaffected (the touched code paths only execute flag-on).

## Forecast

Ends with PA-1/PA-9 closed + pinned, the riders folded or consciously carried, the S9 prompt amended, and S9 unblocked: the founder-walked dogfood install proceeds on an engine whose justice dynamics match its own stated doctrine. The `fix_before_s10` register (PA-5, PA-6 envelope narrowing, PA-3/PA-4/PA-7/PA-8 if carried, the A7-dead-code note, F-1 hooks-test hardening) remains open for S10's R18 sign-off. **ENFORCE is S11.** Weights BLOCKED; the 0h call remains the founder's.

End of prompt.
