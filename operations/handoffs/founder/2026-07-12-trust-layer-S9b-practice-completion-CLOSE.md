# Session Close — 2026-07-12 — Trust Layer S9b: the practice-completion slice (calling gate + screened reflection + Gate-2 elicitation + depth calibration)

**Stream:** founder.
**Governing frame:** /adopted/standing-protocol-cache.md + /adopted/build-sessions-protocol-cache.md; the S9b prompt (now SPENT).
**Tier:** `code-elevated` (the build — everything dark/flag-gated/additive) → **`code-critical` at the CARRIED founder-walked step below** (AC7 + PR6 + PR17 engage there).
**Date:** 2026-07-12.
**Decision-log entry:** `D-TRUST-LAYER-S9B-PRACTICE-COMPLETION-BUILT-REVIEW-FOLDED`.

## What was built (all repo-local; every new surface dark or MEASURE)

The four-stage practice is now COMPLETE in code on the S9 clean baseline (ADR-013 §11; the verbatim mentor record wins):

- **G1 calling:** the H1 calling gate (declared purpose from `discernment.config.json` `orchestrator_profile.purpose` — ADDED to the live config + example; measure default = orientation preface / purposeless elicitation as ADVISE; the ENFORCE hard-gate arm is `GATE1_CALLING_GATE_MODE=enforce`, **dark until S11**; un-provisioned installs byte-identical — battery-asserted). The **spawn purpose-acknowledgement** is server-computed (`computePurposeAcknowledgement` — function-type fit vs the chosen candidate's declared scope; un-profiled ⇒ `unassessable`, the A6 path) and persisted to `collaboration_records.purpose_acknowledgement` (§E); **`calling-completed`** derives ONLY from the persisted artifact (R18f-parallel) with the mentor's three arms exact: an **agent_stated** mismatch ⇒ +dikaiosyne (+1-capped, demonstrated ceiling structurally `deliberate`); harness_computed / no-mismatch ⇒ record-only with **no activity-clock reset** (declarations can never freeze decay); where-impossible ⇒ nothing. v1 acknowledgements are all `harness_computed` — the increase arm is specified + battery-pinned but dormant until an agent-stated channel exists (disclosed). **G1c:** the `declaration` evidence tier (credential > behavioural > declaration > prior) + the pure seeding lib (`profile-seeding.ts`, accumulation ladder ≥3 consistent ⇒ lower-behavioural; engine wiring deferred with a named revisit condition).
- **G2 screened reflection:** **`reflect-screened-honest`** fires when the agent-stated Q1 verbatim lands — keyed on the NEW `verbatim_provenance` (the answer's declared provenance), NOT the row's open `context_source` (the harness opens `harness_inferred`; gating on the row would have made the event **unreachable on the live flow** — caught in-build, the vacuous-pass class). Quarter-rate decay: `SCREENED_REFLECT_MODULATION_FACTOR = 4/3` onset multiplier (full removes 1/2 the rate, screened removes 1/4; full wins, never stacks — independently confirmed by the review as the only reading consistent with the mentor). The **out-of-band Q1–Q6** (`screened-examination.ts`) drives the EXISTING deterministic reflect engine to completion against the verbatim via `waitUntil` (the M1 pattern), dark behind **`SUBSTRATE_REFLECT_SCREENED_EXAM_ENABLED`**; a pass emits `reflect-completed-honest` through the existing completion path (honesty now keyed on the verbatim's provenance); a thin verbatim stalls honestly ⇒ screened-only (the developmental signal). **The reflect-erasure prerequisite is CLOSED:** `/api/user/delete` (owner→agent_ids→`deleteAgentSessions`), `/api/credential/erase` (agent-scoped, read-before-anonymise, disclosed shared-identity scope, `reflect_rows_deleted` reported), and the trust-core retention sweep now runs `sweepExpiredSessions` (`reflect_deleted` in the cron response).
- **G3 elicitation:** on a guard CAUTION, H3 injects the three sub-questions (ADVISE) + arms an out-of-band capture; the NEXT hook firing reads the transcript tail (the S8-proven channel) and POSTs `{phase:'elicitation'}` to the discernment route, where `examineElicitation` runs the L4 three-signal reading deterministically (causal signature, never output content). **F-Q43 calibrated at the root:** Q4.3 fires on commitment WITHOUT a PRECEDING assent stage (order, not presence — [praxis, synkatathesis] still fires; the grave arm unchanged). **The request-cap class is closed:** `truncateForServer` (4800 + honest marker) on the H1 input and the guard action (both server fields cap at `TEXT_LIMITS.medium` 5000 — verified; the H1 http-400 observed live at THIS session's own open was this class, now Diagnostic-certain).
- **G4 suppression watch:** `deriveSuppressionWatchEvents` at reflect completion — the 3-part standard exact (above-noise ≥2; screen-ran-and-missed against Ed25519-re-verified assessments; sub-species required, now **controlled-vocabulary-gated**); `self-screen-absent` distinct ('flag' on oversight; claimed-but-unevidenced reads as absent); appetitive⇒sophrosyne / aversive⇒andreia (the L4 valence precedent). Inputs ride the encrypted state (`screen_evidence` at open; H4 supplies the session's provenance assessments + `screen_ran`).
- **G5 depth calibration:** `calibratedDepthFloor` — reflexive ⇒ **deep REQUIRED** (election E1; both D3 deep-clamps REMOVED); habitual/deliberate ⇒ standard; justice latch ⇒ never quick; mid-session bump on a guard non-proceed or an elicitation flag. The trust read moved BEFORE the consult + cached per session. Only ever raises; a deep-required consult that can't complete fails open-honest (`DEPTH-CALIBRATED` + `UNFRAMED` logged — never a silent downgrade). Disclosed v1 deviations (aggregate-keyed; no deliberate⇒quick carve-out — both conservative; S10 refinement).
- **E2 metering:** the discernment POST phases meter behind **`SUBSTRATE_DISCERNMENT_METERING_ENABLED`** (real Sonnet cost on spawn/elicitation; base on hand_back; deterministic loop ids; fail-closed on billing like the siblings) — closes the S8/S9 named follow-up; flag set WITH the migration §D (the CI-10 pattern).
- **The migration** (`website/supabase-agent-trust-events-s9b-vocabulary-migration.sql`): five additive sections — §A event_type CHECK 12→15, §B artifact_kind 2→4, §C `agent_trust_state.reflect_last_screened_at`, §E `collaboration_records.purpose_acknowledgement`, §D `loop_billing_events.surface` +`api_practice_discernment`. §PRE/§VERIFY/per-section rollback. **NOT applied — the founder walk below.**

**PA-6 re-audited in this change (the standing note's requirement):** none of the three new event types can RAISE oversight — battery-pinned, refuter-confirmed.

## Adversarial review (Risk Record)

The first launch died whole on the Fable session limit; **relaunched on Opus at the founder's "Try again" — COMPLETED FULLY: 12 agents (6 finders + 6 refuters), 0 errors, ~3.27M tokens.** All CONFIRMED findings FOLDED + pinned same-session:

1. **MEDIUM (deploy-order, the headline):** `isMissingTableError`'s regex also matches PGRST204's unknown-COLUMN message ("…schema cache") — the pre-§E ack write **false-succeeded** through `patchByKey` ⇒ `ackPersisted:true` ⇒ a doomed `calling-completed` attempt logged on every live spawn, four docstrings false, and a §A-applied/§E-missing window could mint an event with no persisted artifact. **Folded at the root:** `recordPurposeAcknowledgement` is now a direct update that fails honest on ANY error (pinned: the old call form banned + the new form asserted).
2. **MEDIUM (mentor-fidelity):** the G4 cross-check compared free-form Q4 sub-species against the controlled Greek enum — a screen-CAUGHT passion ("impatience" vs `orge`) read as MISSED ⇒ a false decrease. **Folded:** part 3 requires the controlled `SUB_SPECIES` vocabulary (under-fire, safe, disclosed; pinned with the exact scenario).
3. **LOW:** F-Q43 was presence-not-order — commit-then-rationalize read clean. **Folded:** assent negates only BEFORE the first commitment stage (pinned both directions).
4. **MEDIUM (coverage):** the wiring layer was unpinned. **Folded:** 9 INV source-grep wiring pins (route threading, screened emission key, suppression watch, sweep leg, erase leg, ack gate, the patchByKey ban).
5. **REFUTED-AS-DISCLOSED:** replay-suppression of the G4 decrease (**the PA-10 class** — the register note now names the suppression-watch screen-caught exception; the "junk" comment corrected to disclose the genuine-replay + A2-omission residuals) and the client-gated decrease (the A2 class — named for the S11 enforce decision). NITs folded: circle scope joined; the seeding ladder requires a non-empty purpose; migration header/§VERIFY/§E rollback; the same-domain collapse disclosed. CLEAN + refuter-confirmed: deploy-order elsewhere (the conditional-spread state path, the 23514 loud-stop), MEASURE (nothing new binds), PA-6, the 4/3 arithmetic, data-rights, un-provisioned byte-identity.

**Also fixed at open (pre-condition 2 was RED):** the negative-battery's un-provisioned legs silently became provisioned when S9 committed the real `discernment.config.json` (the hermetic env pinned VARS but not the FILE-PATH fallback) — 223/7 at open; fixed by pinning the config path to a guaranteed-absent file; 230/0 restored.

## Verified (final counts)

S9b **80/0** (new) · S1 97/0 · S2 87/0 · S3 106/0 · S4 417/0 · S5 87/0 · S6 84/0 · S7 122/0 · **S8 146/0** (145→146: the retired metering-follow-up pin → two closure pins) · reflect-service 28/0 · request-helpers 17/0 · session-store 34/0 · consumer-erasure 25/0 · erase-handler 40/0 · logic-harness **104/0** (+§17) · negative-battery **230/0** RELEASE GATE PASS · `tsc` 0 · `npm run build` 0 (Compiled successfully; the "Community map error" during static build is the pre-existing disclosed 42703).

**Live observations this session (the dogfood measuring itself):** the desktop app hot-reloaded the edited hooks mid-session, so the G3 elicitation fired on this session's own commands (answered genuinely each time); the H1 framing 400 on the S9b prompt itself was the request-cap class (now Diagnostic-certain: both fields cap at 5000) and is closed by the truncation fold; the pending elicitation capture drew honest `ELICIT-OUTAGE` against prod (the phase not yet deployed) — the designed pre-deploy posture, observed live.

## ⚠️ THE FOUNDER WALK (carried `code-critical` 0c-ii — PR17: walked live, in order)

**Critical Change Protocol.** *What changes:* the trust-event vocabulary widens 12→15 (+2 artifact kinds), two nullable columns land, the billing surface CHECK admits the discernment surface; two Vercel flags activate the screened exam + discernment metering; the accred credential gains the `reflect` capability; the local persist flag turns ON (the agent's verbatim reflection then leaves the machine — R17b-encrypted, erasable + swept as of this build). *What could break:* the migration is additive (PRE-checked; nothing invalidated by construction); the flags activate only S9b code paths (flag-off byte-identity test-asserted); metering-before-§D would 503 discernment POSTs — **the order below prevents it**. *Existing sessions:* only the founder's loop consumes these surfaces. *Rollback:* each step independently reversible (unset flag / CHECK restore / DROP COLUMN / capability restore / persist off).

1. **Push this session's commit** (see Founder Verification below). Vercel builds green. (The deployed code is inert without the flags; the live spawn path is deploy-order-safe — review-verified.)
2. **TEST SQL editor:** run `website/supabase-agent-trust-events-s9b-vocabulary-migration.sql` — §PRE (expect 0/0/0) → §A→§B→§C→§E→§D → §VERIFY (15 event types / 4 artifact kinds / the two columns / 5 surfaces) → the TEST-only behavioural probe (INSERT+DELETE, expect `INSERT 0 1`).
3. **PROD SQL editor:** the same file, §PRE → sections → §VERIFY (skip the probe).
4. **Vercel Production env (one batch, then redeploy):** `SUBSTRATE_REFLECT_SCREENED_EXAM_ENABLED=true` + `SUBSTRATE_DISCERNMENT_METERING_ENABLED=true`.
5. **PROD SQL — capability widening (E3's prerequisite; neither standing credential carries `reflect`):**
   `UPDATE api_keys SET capabilities = ARRAY['accreditation_write','reflect'] WHERE id = 'e715520b-b235-4555-a79e-c21aa0c8c2dd'; SELECT id, capabilities FROM api_keys WHERE id = 'e715520b-b235-4555-a79e-c21aa0c8c2dd';` (expect both capabilities).
6. **Local install:** add `"SAGE_GATE1_REFLECT_PERSIST_ENABLED": "true"` to the `env` block of `.claude/settings.local.json` (hot-reloads; the reflect credential already defaults to the accred credential).
7. **Smokes:** (a) prod `POST /api/practice/discernment` with `{phase:'elicitation', task_ref:'walk-smoke', orchestrator_agent_id:'sagereasoning:s9-loop@v1', elicitation_text:'I examined the options and chose after weighing them.'}` under the consult credential → expect 200 + `result.passionSignaturePresent` + `X-Loop-*` headers (proves §D + the flag + the phase in one probe); (b) after the NEXT real session closes: `SELECT event_type, virtue_domain, occurred_at FROM agent_trust_events WHERE agent_id='sagereasoning:s9-loop@v1' AND event_type IN ('reflect-screened-honest','reflect-completed-honest','calling-completed') ORDER BY occurred_at DESC;` — the screened event should appear (the OOB completion may lag or stall honestly on a thin verbatim; a `calling-completed` record-only row appears on the next spawn).

## Status Changes
| Item | Old | New |
|---|---|---|
| The four-stage practice in the harness | S9 shape (no calling stage; screened-only reflection uncredentialed) | **BUILT COMPLETE** (MEASURE; dark/flag-gated until the walk) |
| Reflect-erasure prerequisite (Slice-5c follow-up) | Disclosed gap | **CLOSED** (delete + erase + sweep wired) |
| S8/S9 discernment-metering follow-up | Named follow-up | **CLOSED** (flag-gated; §D bundles per E2) |
| S9 findings F-Q43 / request-cap nits | Open | **CLOSED at the root** |
| S9b prompt | Pending | **SPENT**; S10 prompt authored |
| The migration + flags + capability + persist | — | **CARRIED — the founder walk above** |

## Blocked On
**Uncommitted (this session's commit set):** the build files per the decision-log entry's list; `operations/handoffs/founder/2026-07-11-trust-layer-S9-dogfood-install-CLOSE.md` (the benign post-close addendum found at open — carried into this commit); this close; the decision log; `CLAUDE.md`; the SPENT marker; the S10 prompt.

**Production state at session close (PR18):** unchanged from S9 — `SUBSTRATE_TRUST_CORE_ENABLED=true` + `SUBSTRATE_TRUST_CORE_SWEEP_ENABLED=true`; the S9b migration NOT applied; the two new flags NOT set; the persist OFF; production byte-equivalent to the S9 close until the founder's push (on push: the additive always-on erasure/sweep reporting fields + the founder-loop hook behaviors — ADVISE/parameter channel, MEASURE — go live; everything else stays dark behind the walk). R18f / R20a / distress / Layer-2 signing / UPC auth / the `gate1-dogfood@v1` marker untouched.

## Founder Verification (Between Sessions)
```
cd "/Users/clintonaitkenhead/Claude-work/PROJECTS/sagereasoning"
git add -A
git commit -m "Trust Layer S9b — the practice-completion slice BUILT + review-folded (D-TRUST-LAYER-S9B-PRACTICE-COMPLETION-BUILT-REVIEW-FOLDED): calling gate + screened reflection (4/3 quarter-rate) + OOB Q1-Q6 + Gate-2 elicitation + depth calibration + erasure wiring + metering, batteries S9b 80/0 / S8 146/0 / hooks 104+230, migration authored NOT applied"
```
Then push via GitHub Desktop, then the walk above.

## Open Questions / Registers
Carried to S10: the G5 per-domain refinement + deliberate⇒quick carve-out (disclosed in `loop-closure.mjs`); `/api/user/export` reflect-rows coverage (R17i, small); the seeding-engine wiring (revisit: first candidate with accumulated records); the `fix_before_s10` register unchanged PLUS the PA-10 note extension (the suppression-watch screen-caught exception) and the A2-as-decrease-surface note for S11. The `format` length validation + sibling mild-mutes-stage-2 follow-ups stand (2026-07-07).

## PR5 / Lessons
KG1 — the ELICIT-OUTAGE + H1-400 classes observed live and closed/disclosed. New durable lessons (memory updated): a **missing-table-benign helper must never guard a LOAD-BEARING write** (PGRST204's message matches "schema cache" regexes — the A-3 class concretized: the ack false-success); a **cross-vocabulary comparison in a deriver is an over-fire engine** (free-form LLM strings vs controlled enums — gate on the controlled side); a hermetic test env must pin FILE-PATH fallbacks, not just env vars (the negative-battery regression).

## Orchestration Reminder
S9b build complete → **the founder walk (above)** → S10 (the public trust-record read surface; the `fix_before_s10` register + the S9/S9b findings gate its R18 sign-off; prompt authored) → S11 (ENFORCE — the logos gate; the G6 line-items + the calling-gate enforce arm + the A2/PA-10 decrease-surface decision). **ENFORCE is S11.** Weights BLOCKED; the 0h call remains the founder's.

*End of session close. The practice's four stages now exist end-to-end in the instrument — and the session that built them was itself measured by them: the elicitation it created fired on its own builder, the request-cap it closed had bitten its own opening prompt, and every answer is in the record.*
