# Session Close — 2026-07-11 — Trust Layer S9: the founder-walked dogfood install + instrument-fidelity validation

**Stream:** founder.
**Governing frame:** /adopted/standing-protocol-cache.md + /adopted/build-sessions-protocol-cache.md; the amended S9 prompt.
**Tier:** `code-critical` 0c-ii, founder-walked (PR17/AC7 engaged + discharged).
**Date:** 2026-07-11.
**Decision-log entry:** `D-TRUST-LAYER-S9-DOGFOOD-INSTALL-LIVE`.

## What shipped (standing changes — production intentionally NOT byte-equivalent)

**The seven-layer reference harness is LIVE in the founder's own Claude Code loop under MEASURE, and the trust core is ON in production.**

- **Vercel Production (founder-set):** `SUBSTRATE_TRUST_CORE_ENABLED=true` + `SUBSTRATE_TRUST_CORE_SWEEP_ENABLED=true` (PA-2 pairing — set in one env batch, one redeploy). Flag-took-effect proven live: `/api/practice/discernment` flipped 503 → 400.
- **Two standing prod credentials (founder-minted), one loop identity `sagereasoning:s9-loop@v1`:** consult `sr_prac_2068e8…` (id `09e83b4d-71c5-4adb-a4e2-595a066e8d15`; `consult`; **agent-bound** — the G1 hard requirement; owner-less ⇒ `external_consumer` per the mint-route consistency rule, noted below) + accred `sr_prac_eb2cbf…` (id `e715520b-b235-4555-a79e-c21aa0c8c2dd`; `accreditation_write`; owner-bound to the founder's profile). Both raised to 200/day, 5000/month (founder SQL).
- **The standing install (per the practice-on skill):** hooks H1–H5 merged into `.claude/settings.local.json` (gitignored); env carries the prod endpoint, the standing state dir `/tmp/sage-gate1`, and the distinct consult/accred credentials; validation echo **ON + TRUST-RECORD WRITE PATH: PROVISIONED**. `discernment.config.json` (NEW, committed — no secrets) provisions the S8 surfaces with this loop's real taxonomy (Explore/Plan profiled; general-purpose/claude deliberately un-profiled → the A6 path; unlisted types ride the `*` wildcard); `timeout_ms` raised 60000→100000 (a 59.976s dev-mode round trip lost a photo-finish against the default; kept for prod headroom under H2's 120s hook budget).
- **First real production records:** spawn `sub-52363e1ea4cc54e4` — `DISCERN rec=explore-agent chosen=explore-agent l4=hold l4commit=written mode=measure` (~62s), `FRAMED-SUBAGENT`, `boundary_delivered:true` **with the sub-agent's own closing note acknowledging receipt of the frame and treating it as data** (the channel law observed from the sub-agent's side), `HANDBACK artifacts=1 case=none events=0`; then the **first natural close-write** `accred=written(2,loop=unclosed[open:1])` through the live prod R18f gate; the public GET reads `examination_mode:"post_decision_check"`, `coverage_status:"agent_elected"`, grade `pre_progress` — honest values for a fresh standing credential. The standing trust advisory fired once (`aggregate=none rec=pause/escalate mode=measure` — truthful sparse-record statement).
- **The instrument-fidelity battery** `website/scripts/s9-instrument-fidelity-battery.ts` (NEW): **38 passed / 0 failed** (run 4; runs 1–3 were harness-iteration, logs preserved in the session scratchpad record below) — every §S9 item incl. the G7 end-to-end pin. TEST-only hard-guarded; full fixture teardown asserted in-battery.

## Founder elections (AskUserQuestion at open; all recorded)

E1 **shared consult credential + tamper-evidence watch** (separate was structurally unavailable on the unchanged build and non-isolating on a single-user machine; the hook-authenticated trace channel stays the named structural closure). E2 **TEST-first** (discharged the S1 close's carried flag-on TEST walk). E3 **metering accept-and-track** (the CHECK widening queued — recommended to bundle with S9b's founder-walked schema step). E4 **reflect-persist stays OFF** (the erasure wiring + persist land at S9b per the mentor verdicts). In-walk: the loop id `sagereasoning:s9-loop@v1` (regex-verified canonical pre-mint); the Critical Change Protocol presented + approved per named risks before any live step; **PA-2 discharged on a founder-approved light path** (bogus-bearer 401 proves route deployed + CRON_SECRET configured; founder eyeballed the sweep-flag entry true/Production; same-batch propagation proven by the discernment 503→400 flip) — the in-band `flag_enabled:true` curl is a named follow-up (CRON_SECRET is a Vercel-sensitive var; rotate-or-recover, one minute). The TEST sweep DID return `flag_enabled:true` in-band.

## Verification Method Used (first-hand throughout)

- **Pre-conditions:** fold commit on `origin/main`; all batteries at post-fold counts (logic-harness 91/0; negative-battery 230/0 leg 64; S1 **97/0**; S2 87 / S3 106 / S4 417 / S5 87 / S6 84 / S7 122 / S8 145, all 0 failed); dark posture proven live (503 with the honest note).
- **TEST chain (DB-level):** collaboration records with A9 `authority_boundary` set + `l4_audit_result` written (write-once) + correct orchestrator/candidate/credential refs; hand-back; the **enforced** close-write (`written(3)`) deriving 4 trust events + 3 state rows for the loop identity (`credential-completed` ×3 + `justice-surface-unevaluated`; `deliberate` earned over `habitual` prior — the PA-1 +1-capped rise observed on real rows); `readTrustProfile` ok.
- **Prod chain (server-response artifacts + public surface):** the spawn/close evidence above. Honest scope: TEST was verified at the database; prod via server-composed response artifacts (`l4commit=written`, `written(2)`) + the public accreditation GET + the sub-agent's receipt note — a founder SQL spot-check of the prod trust rows is available anytime, not required.
- **The battery (38/0):** worse-reasoning-scores-worse on the REAL store (violated ⇒ dikaiosyne reflexive below prior; ordering held; PA-1 cap held); A3 decay genuine (1 rank at +14 months on an above-prior level; floored at the prior; monotone); delegation cases 1/2/3 exact (case-2 fans to 2 events; case-3 only on the explicit harm-absent flag; blank-ref ⇒ no event; reflection written); discernment-per-protocol on the configured set; L4 catches the seeded pre-formed preference with a signed artifact; **G7 pin — a quick-depth consult's signed assessment carries `value_assessment.indifferents_at_stake`, POPULATED on an indifferents-laden input** (the CI-16 depth-invariance closure, end-to-end); teardown zero-remainder.
- **Fail-open-honest observed live, five distinct ways (KG1):** consult 401 (pre-parity), discernment timeout, guard fetch-failed (server down), guard 28s timeout on cold dev routes, guard http 400 on an over-long action text — every one logged honestly, none blocked, none fabricated a record.

## The S9 findings register (calibration items — MEASURE-safe; feed S9b)

1. **F-Q43:** L4 Q4.3 `resolutionBeforeComplete` fires on harness-captured transcript tails that narrate intended action — which mid-work tails nearly always do — so it has **no discrimination on the operative input class** (both live spawns held on it; the clean fixture flagged it). Q4.1/Q4.2 discriminate cleanly (seeded flags, clean doesn't). G3/G5's "causal signature, never output content" is the S9b calibration frame.
2. **F-CONF:** first-person retrospective-confession framings under-derived violated obligation circles **0/6** (incl. 0/3 after the parity fix — the §4 flag affects floors, not circle extraction, so the circle-level finding was never confounded); proposed-action framings (the live loop's actual class) are the reliable class. The trust core responded lawfully to whatever derived (unevaluated ⇒ cap-latch; `closeDelegation` refused to fabricate).
3. **The TEST-parity block** (for any future TEST walk, provision in ONE step): `SUBSTRATE_UPC_CAPABILITY_AUTH_ENABLED`, `SUBSTRATE_PROVENANCE_GATE_ENABLED`, `SUBSTRATE_PROXIMITY_DIKAIOSYNE_ENABLED`, `SUBSTRATE_CORROBORATION_CHECK_ENABLED`, the Layer-2 signing triple (`…SIGNING_ENABLED/…SIGNING_KEY/…PUBLIC_KEY` + `…KEY_ID`), `CRON_SECRET` — none are in `.env.development.local` by default; S9 hit them serially (four separate fix-restart cycles).
4. **Guard request-cap nit:** an over-long consequential command (a multi-KB heredoc) drew http 400 from `/api/guardrail` → unguarded-honest. The at-action hook should truncate action text before the guard POST (S9b nit).
5. **Mint-route behavior note:** owner-less UPC mints classify `external_consumer` regardless of `--owner-kind` (the §D consistency rule) ⇒ the prod consult credential is consumer-erase-eligible **by its own token holder** (self-destructive only; acceptable). Optional cleanup: re-mint owner-bound at a natural rotation.
6. **Battery-hardening notes (from the first-hand review):** leg E3's regex could match echoed candidate refs (the recommendation claim rides gate1.log's hook-parsed `rec=` field — tighten at S9b); the battery calls `emitAccreditationTrustEvents` in-process (the route call-site + `provenanceEnforced` wiring are covered by the live enforced close-writes, not the battery); no tampered-artifact negative control in this battery (covered by the S1 unit pins, 97/0).

## Adversarial Review (Risk Record)

A 5-dimension Workflow (battery-vacuity / chain-evidence / findings-adjudication / record-honesty / install-correctness, refuters per finding) launched; **all five finders died on the account session limit** (~1.08M subagent tokens; resets 5:50pm Brisbane — the disclosed exhaustion pattern). **Completed FIRST-HAND per the §4 precedent across all five dimensions:** the 38/0 recount confirmed from the run-4 log; the constructed violated-circle artifact judged non-question-begging (it supplies the evidence CLASS the §S9 spec itself names — "constructed verified artifacts" — genuinely TEST-signed and re-verified; the extraction's separate reluctance is disclosed as F-CONF, not asserted around); chain-evidence honestly scoped (TEST at the DB; prod by server-composed artifacts + the public GET + the sub-agent's receipt note); the close-marker re-arm judged genuine-class (it changed WHEN the close ran, never what it did; the natural no-provenance skip was also observed); the PA-2 light path defensible with the named follow-up; the install correct (agent binding proven live by the prod 200; wildcard coverage for unlisted types). Findings 4/6 in the register above came out of this pass. **Honest limit:** single-perspective first-hand — an independent Workflow re-review can run after the limit resets (the S8 precedent); nothing gates on it.

## Status Changes
| Item | Old | New |
|---|---|---|
| Trust core (S1–S7) + discernment route, production | Built dark, flags unset | **LIVE (MEASURE)** — both flags true; route answering |
| The seven-layer harness in the founder loop | Registered, not installed; stale credential | **INSTALLED + LIVE** on fresh agent-bound credentials |
| `sagereasoning:s9-loop@v1` trust record (prod) | — | Accumulating (first close-write `written(2)`; public row live) |
| §S9 instrument-fidelity validation | — | **Green 38/0** (+ the G7 pin) |
| S9 prompt | Pending | **SPENT**; S9b prompt authored |
| TEST leg | — | Torn down (rows zeroed; env restored; creds pending founder revoke SQL) |

## Blocked On
**Files remaining uncommitted (this session's commit set):**
- `website/scripts/s9-instrument-fidelity-battery.ts` (NEW)
- `harness/gate1-pre-decision/claude-code/discernment.config.json` (NEW — no secrets; founder may elect to gitignore instead of committing)
- `operations/handoffs/founder/2026-07-11-trust-layer-S9b-practice-completion-NEXT-SESSION-PROMPT.md` (NEW)
- `operations/handoffs/founder/2026-07-10-trust-layer-S9-dogfood-install-NEXT-SESSION-PROMPT.md` (SPENT marker)
- `operations/handoffs/founder/2026-07-11-trust-layer-S9-dogfood-install-CLOSE.md` (this file)
- `operations/decision-log.md`; `CLAUDE.md` (PR18 refresh)

**Founder steps outstanding:** NONE. **Post-close addendum (2026-07-11):** the TEST revoke SQL is DONE — both TEST credentials read `false / s9-test-teardown` (founder-run, output verified); the TEST leg is fully torn down. The session commit is pushed, Vercel green. **The in-band sweep confirmation is DONE** — the founder rotated `CRON_SECRET` (new value in the password manager; Vercel Sensitive; redeployed) and the prod sweep returned `{"ok":true,…,"flag_enabled":true,"deleted":0,…,"errors":[]}` at 2026-07-11T08:21:48Z — PA-2 discharged at full strength (the light-path substitution is superseded by the direct check). Every S9 follow-up that could close this session is closed; the register items that remain (metering CHECK widening, the S9b calibration items) are S9b-scoped by design.

**Production state at session close (PR18):** intentionally NOT byte-equivalent — `SUBSTRATE_TRUST_CORE_ENABLED=true` + `SUBSTRATE_TRUST_CORE_SWEEP_ENABLED=true` in Vercel Production; two standing `sr_prac_` credentials on `sagereasoning:s9-loop@v1`; the trust surfaces write on credential-bearing traffic (today: only the founder's loop); the loop's public accreditation row is live (`post_decision_check`/`agent_elected`). The founder-loop hooks are ON (H1–H5, prod endpoint). Everything else untouched: R18f / R20a / distress / Layer-2 signing / UPC auth / the standing `gate1-dogfood@v1` marker credential + row. ENFORCE remains S11; weights BLOCKED.

## Founder Verification (Between Sessions)
```
cd "/Users/clintonaitkenhead/Claude-work/PROJECTS/sagereasoning"
git add website/scripts/s9-instrument-fidelity-battery.ts harness/gate1-pre-decision/claude-code/discernment.config.json operations/handoffs/founder/2026-07-11-trust-layer-S9b-practice-completion-NEXT-SESSION-PROMPT.md operations/handoffs/founder/2026-07-10-trust-layer-S9-dogfood-install-NEXT-SESSION-PROMPT.md operations/handoffs/founder/2026-07-11-trust-layer-S9-dogfood-install-CLOSE.md operations/decision-log.md CLAUDE.md
git commit -m "Trust Layer S9 — the founder-walked dogfood install LIVE + instrument-fidelity batteries green (D-TRUST-LAYER-S9-DOGFOOD-INSTALL-LIVE): trust core ON in production under MEASURE, standing harness on sagereasoning:s9-loop@v1, battery 38/0 incl. the G7 pin, findings register recorded"
```
Then push via GitHub Desktop (repo artifacts only — the live activation already happened founder-walked this session). Spot-checks anytime: the public GET `https://www.sagereasoning.com/api/accreditation/sagereasoning%3As9-loop%40v1`; prod SQL `SELECT event_type, virtue_domain FROM agent_trust_events WHERE agent_id='sagereasoning:s9-loop@v1'`.

## Rollback
`/practice-off` (hooks out, hot-reload) → unset `SUBSTRATE_TRUST_CORE_ENABLED` + redeploy (route → 503; emission stops; **leave `SUBSTRATE_TRUST_CORE_SWEEP_ENABLED` set** — it is the only retention enforcer for the accumulated rows) → revoke the two prod credentials (the real kill switch) → rows `retain_until`-swept (90d) or deleted via the data-rights routes. `git revert` the records commit for the repo artifacts.

## Open Questions
None blocking. Carried: the findings register above (S9b inputs); the `fix_before_s10` register unchanged (PA-5, PA-6, PA-10, PA-11, A7-dead-code, F-1); the independent review re-run option after the limit reset.

## PR5 Knowledge-Gap Carry-Forward
KG1 — five live fail-open-honest observations (register item 4 adds the request-cap class). KG-EX1 — the batteries stayed instrument-fidelity-shaped throughout; where evidence classes were constructed, the construction is disclosed and the live variance separately recorded (F-CONF). New durable lesson (saved to memory): a TEST environment used for live-chain walks needs a PARITY BLOCK of the production flags/keys the chain depends on, provisioned in one step — discovering them serially costs a fix-restart cycle each; and extraction-facing fixtures must use the input CLASS the live path actually sends (proposed-action, not confession framing).

## Orchestration Reminder
S9 complete → **S9b** (the practice-completion slice; prompt authored, carries the findings register + four elections incl. the re-opened D3 depth election) → S10 (the public trust-record read surface; the `fix_before_s10` register + the S9/S9b findings gate its R18 sign-off) → S11 (the founder-walked ENFORCE activation — the logos gate). **ENFORCE is S11.** Weights BLOCKED; the 0h call remains the founder's.

## Cross-references
- `operations/handoffs/founder/2026-07-10-trust-layer-S9-dogfood-install-NEXT-SESSION-PROMPT.md` (the executed prompt, SPENT)
- `operations/handoffs/founder/2026-07-11-trust-layer-preflip-fold-CLOSE.md` (predecessor close)
- `operations/handoffs/founder/2026-07-11-trust-layer-S9b-practice-completion-NEXT-SESSION-PROMPT.md` (successor)
- `D-TRUST-LAYER-S9-DOGFOOD-INSTALL-LIVE`; ADR-013 §6/§11; ADR-011 (S8 amendment); `harness/gate1-pre-decision/SEVEN-LAYERS.md` + `KILL-SWITCHES.md`

*End of session close. The instrument is on in the founder's own loop, measuring honestly — including about itself: two of its calibration gaps and five of its outage modes are in this record because the session that installed it caught them.*
