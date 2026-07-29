# Next-Session Prompt — Post Independent-Review-Reruns: Founder's Choice

**Stream:** founder (substrate / general).
**Tier:** open — depends entirely on what the founder wants to work on. Nothing is gated on the prior session.
**Prior session:** `operations/handoffs/founder/2026-07-29-independent-review-reruns-ae1-s11b-phase0-phase1-CLOSE.md` (`D-INDEPENDENT-REVIEW-RERUNS-AE1-S11B-PHASE0-PHASE1-FOLDED-2026-07-29`) — ran four independent reviews (AE-1, S11b, Phase 0, Phase 1), folded three HIGH-and-above findings plus two MEDIUMs, fixed two more standalone diagnosed-but-unbuilt gaps (`oikeiosis_context`, the milestones/baseline rate-limit bucket), and closed a historical double-counting audit (one confirmed instance, isolated to smoke-test traffic, left as-is). Five commits landed (`17b7a31`, `ee726fa`, `ae1d879`, `a918b98`, `603f94d`), all unpushed.

**This is not a continuation of a build arc.** Read `/adopted/standing-protocol-cache.md` at open per usual, then use your judgement. There is no forced next step.

---

## Closed this cycle

- ~~PR19 retroactive review debt (AE-1 + S11b)~~ — both reviewed independently and folded; the one remaining HIGH (`derive-trust-events.ts` self-circle narrowing) is D4, already tracked, not new.
- ~~Human Phases 0–1 independent-review re-runs~~ — Phase 0 reviewed and folded; Phase 1 came back clean. Both debts discharged.
- ~~`oikeiosis_context` never written~~ — fixed.
- ~~`/api/milestones` + `/api/baseline` on the `scoring` bucket~~ — fixed (GET paths isolated to `analytics`; `/api/baseline`'s POST deliberately left on `scoring`).
- ~~Historical double-counting audit~~ — done; one confirmed instance on smoke-test traffic, left as-is per founder direction.

## Still open — buildable dark, no policy question, just needs doing

- **B5 per-session-granularity decline signal** — could be scoped and built behind a flag; whether to actually turn it on is a separate call.
- **The fold-open closure class** — gated on a founder-walked schema step (the CI-4 marker-persistence migration) before any dependent code could be applied; the code itself could be written dark now.
- **R17 on `milestones`** — the table is absent from `/api/user/delete`/`/api/user/export`; a code fix could be built dark, but any live data-rights change needs founder walkthrough to apply.
- **The consult-lookup resilience follow-up** (credential-lookup retry-before-fail-close + composed-consult latency) — same shape: buildable dark, needs a push and possibly a flag flip to matter.

## Still open — genuinely need the founder

- **The logos byte-identity guard** — explicitly the founder's call to scope or retire.
- **P2's 0h call** — explicitly the founder's call among the three branches the P2 rerun verdict memo names.
- **S11 ENFORCE readiness** — needs live production data accumulated over time plus a founder-walked flag decision; not something a single session can discharge.
- **Resend email provisioning** — literal account/domain/API-key setup only the founder can perform.

## Still open — needs a founder product decision, not further diagnosis

- **The journal UTC pace-gate mismatch** — `/api/journal`'s daily rate-limit compares UTC dates; the dashboard's evening-doorbell prompt compares local dates. Already root-caused. The fix depends on what "one entry per day" is supposed to mean (practitioner's day vs. server's day) — that's the founder's call, not a bug to silently fix.
- **The day-55 evening-pole case** — the journal is a fixed 55-day, insert-only curriculum; past day 55 the evening review permanently reads "not yet" without private-mentor access. Already root-caused. Needs a decision about what the evening review becomes once the curriculum ends.

## Boundaries (carried forward)

- Do not touch `derive-trust-events.ts` (register item D4) without a founder-walked Critical step — this session's own reviews confirmed the finding is real but explicitly deferred it.
- Do not touch `stoic-brain.ts` or reopen the logos byte-identity guard question unilaterally.
- Any live production verification write needs the founder's participation or JWT — this environment cannot mint prod admin credentials on its own. The reliable workaround when the password-grant path 403s: pull a live JWT from the browser's `sb-*-auth-token` localStorage entry and pass it as `MINT_CLI_ADMIN_JWT`, skipping the password grant entirely.
- `sdk/` is a sibling directory of `website/`, not nested inside it — `cd sdk/typescript` from inside `website/` will fail; use `cd ../sdk/typescript` or an absolute path.
- This session's five commits are unpushed. Confirm with the founder before pushing, unless they've already indicated otherwise by the time you read this.

## Forecast

Success = the founder gets a clean, working session on whatever they actually want next — not a forced continuation of review-and-fix housekeeping just because that's what the last several sessions happened to be. If asked to pick, the buildable-dark items (B5, R17-on-milestones code, the consult-lookup resilience fix) are the highest-leverage next step that doesn't require the founder's direct involvement to *start* — though R17's actual application still needs them.

End of prompt.
