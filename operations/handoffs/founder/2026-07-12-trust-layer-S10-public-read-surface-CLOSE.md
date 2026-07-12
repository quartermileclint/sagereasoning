# Session Close — 2026-07-12 — Trust Layer S10: the public trust-record read surface (built dark; activation carried)

**Stream:** founder.
**Governing frame:** /adopted/standing-protocol-cache.md + /adopted/build-sessions-protocol-cache.md; the S10 prompt (now SPENT).
**Tier:** `code-elevated` (the build — dark/flag-gated + the intended always-on R17i export fold) → **`code-critical` at the CARRIED founder walk below** (AC7 + PR6 + PR17 engage there).
**Date:** 2026-07-12.
**Decision-log entry:** `D-TRUST-LAYER-S10-READ-SURFACE-BUILT-DARK`.

## What was built

**`GET /api/trust-record/{agent_id}`** — the public trust-record read surface (build plan §S10), public-unauthenticated (election E1, the accreditation-GET posture), rate-limited 30/min/IP, **DARK behind the NEW `SUBSTRATE_TRUST_READ_SURFACE_ENABLED`** (unset ⇒ honest 503, zero DB work). Serves the S1→S3 **state fold only**, composed live per read (zero LLM calls, PR15 maximal reuse of `readTrustVerdict` + `readHonestReflectSummary`): per-domain effective levels (**decayed truth** — decay realized lazily at read; the justice latch capped + surfaced), the minimum-domain aggregate over the evidence-bearing cardinal domains with its conservative read-time confidence basis, coverage gaps named, the reflect record as a **modulate-only** class, and **the ADR-013 §8 honest-claims envelope verbatim** (`TRUST_RECORD_ENVELOPE` — PA-6-narrowed, PA-10-disclosed, battery-locked). Deliberately NOT served: the S4 recommendation; the event ledger (state-fold-only, R17e-adjacent). A 200 **genuinely implies examined evidence** (the ENV-1 fold: declaration-class seeded rows alone ⇒ 404). Interop: VC-claims-mappable / A2A-extension-shaped BY DESIGN; `published_externally:false` on the wire (election 4 honored).

**The register gate:** the R18 sign-off memo (`operations/trust-layer-2026-07/2026-07-12-s10-r18-signoff-memo.md`) dispositions EVERY `fix_before_s10` item — **CLOSED:** PA-6 (the §8 envelope narrowed by dated ADR amendment + published verbatim), F-1 (`emission-hooks.test.ts` 15/0), R17i export reflect-rows (the §2e fold + `getAgentSessionsForExport`, decrypt-for-subject). **Disclosed-on-surface + carried:** PA-5 (modulate-only bound; structural → S11), PA-10 (the replay class in the envelope; structural → S2-wiring). **Carried named:** PA-11, F-CONF, G5, seeding-wiring, A2-decrease (S11), the A7 tripwire restated, + the NEW item from review: **reflect-store owner-scoping** (below). Elections: E1 public route; E2 PA-10 disclose+carry; E3 riders F-1 + R17i (PA-5 hardening declined → S11).

## Adversarial review (Risk Record)

Wave 1 (6-dim Workflow, Fable) died 5/6 on the account session limit; the completed **abuse-surface** dimension returned 2 findings, both first-hand confirmed + FOLDED: **(S10-ABUSE-1, LOW)** the missing-table-benign regex (the A-3 class, new direction) would have served a transient PostgREST schema-cache stale as a **false, publicly-cached 404** → folded at the root (`readTrustProfile` `opts.strictMissingTable`, `readTrustVerdict` `opts.strictStore`, the handler binds strict ⇒ the class 503s no-store; every existing caller byte-identical, control-pinned); **(S10-ABUSE-2, NIT)** unbounded reflect-summary fetch → bounded (cap 500 desc + `capped` flag + honest payload note; the S7 consumer unaffected).

**The Opus relaunch (the prompt's §4 fallback) COMPLETED FULLY — 17 agents, 0 errors, ~3.86M tokens: 6/6 dimensions; fold-verification CLEAN (both wave-1 folds verified correct, pins non-vacuous); 4 confirmed — ALL LOW, zero critical/high/medium — all folded/dispositioned; 7 refuted with cited reasoning:**
1. **S10-ENV-1 (LOW, headline — folded at the root):** the staged docs' "404 = no examination-derived events" was false at application: a **declaration-class record-only event** (the v1 `harness_computed` calling acknowledgement) SEEDS a state row at the profile prior with `hasEvidence=false`, so a row-existence 404 gate served such an agent a 200. The handler 404 now gates on **no domain carries evidence**; message + staged docs name the declaration-class bound; pins S4-30..S4-34 incl. the mixed-profile control.
2. **S10-EXPORT-RIDER-CROSS-TENANT (LOW, disclosed + CARRIED — NEW register item "reflect-store owner-scoping"):** `sage_reflect_sessions` has no owner column and agent_id is not owner-unique (UPC uniqueness = the (owner, agent) pair) ⇒ the export rider — like the SHIPPED S9b delete precedent, same root — scopes intimate reflect content by agent_id alone. Zero live exposure (pre-0h, single operator, persist founder-local). Closure = a schema step covering export AND delete; **trigger: BEFORE any external multi-tenant onboarding**; disclosed at both code sites.
3. **BATT-1 (LOW):** export rider had grep-only coverage → **the export smoke is REQUIRED at the walk** (step 5 below).
4. **S10-RECORDS-1 (LOW):** stale battery count in the S11 prompt → corrected (106/0).

Also caught in-build by the battery itself: the **ByteString header defect** (an em-dash in a header value crashes every response at runtime) — fixed + ASCII-pinned (S4-11b). Refuted (reasoning in the workflow journal): calling-artifact disclosure, oversight-aggregate scoping, two-clock nit, reflect-note wording, envelope substring-lock sufficiency, decay-magnitude boundary, route-boilerplate coverage (S5-6 nonetheless tightened to the call form).

## Verified (final counts)

**S10 106/0** (new) · **emission-hooks 15/0** (new, F-1) · S1 97/0 · S2 87/0 · S3 106/0 · S4 417/0 · S5 87/0 · S6 84/0 · S7 122/0 · S8 146/0 · S9b 86/0 · reflect-service 28/0 · session-store 34/0 · request-helpers 17/0 · consumer-erasure 25/0 · erase-handler 40/0 · logic-harness 104/0 · negative-battery 230/0 RELEASE GATE PASS · r20a-invocation-guard 92/0 (untouched, re-run) · `tsc` 0 · `npm run build` ✓ (`ƒ /api/trust-record/[agent_id]` registered; the "Community map error" is the pre-existing disclosed 42703).

## ⚠️ THE FOUNDER WALK (carried `code-critical` 0c-ii — PR17: walked live, in order)

**Critical Change Protocol.** *What changes:* one Vercel flag opens the NEW public read surface; the staged R18 docs then publish it (llms.txt section + the agent-card **17th** extension + an api-docs note). *What could break:* nothing existing — the route is new + additive; flag-off is a 503 with zero DB work (battery-asserted); the only always-on delta riding the push is the R17i export fold (§2e) + comments. *Existing sessions:* unaffected (public GET; no auth change). *Rollback:* unset the flag + redeploy (dark 503); `git revert` the docs commit. *Verification:* the smokes below. **Your approval of the R18 sign-off memo at this walk IS the sign-off — nothing publishes before it.**

1. **Commit + push** (see Founder Verification below — the commit set includes the three pending S9b walk-record files). Vercel builds green; the route deploys DARK (a probe now answers 503).
2. **Read + approve the sign-off memo** (`operations/trust-layer-2026-07/2026-07-12-s10-r18-signoff-memo.md`) — this is the R18 governance gate.
3. **Vercel Production env:** add `SUBSTRATE_TRUST_READ_SURFACE_ENABLED` = `true` → redeploy → wait for green.
4. **Live smokes (browser or curl, no auth needed):**
   a. `https://www.sagereasoning.com/api/trust-record/sagereasoning:s9-loop@v1` → expect **HTTP 200**, `data.schema:"sage-trust-record/v1"`, `mode:"measure"`, real per-domain levels with `has_evidence:true` somewhere, the `envelope` block present, `interop.published_externally:false`. (The 200 itself is the flag-took-effect proof — flag-off 503s.)
   b. `https://www.sagereasoning.com/api/trust-record/test:no-such-agent@v1` → expect **404** `status:"not_found"` with the "declaration-class" wording.
5. **REQUIRED export smoke (the BATT-1 fold): ✅ DONE 2026-07-12 16:48 AEST, PRE-SIGN** (moved ahead of the flag per the mentor's pre-sign review — the §2e fold is always-on, so the smoke needed no flag). HTTP 200; `sage_reflect_sessions` present; 4 agents each with decrypted `response_history` + ciphertext dropped (memo §10 item 1 carries the full record). No re-run needed at this step.
6. **Apply the staged docs** (`operations/trust-layer-2026-07/2026-07-12-s10-docs-staged-for-activation.md` §1–§3, in order) → validate `agent-card.json` parses (**17 extensions**) → `npm run build` green → commit + push the docs.
7. Confirm the sweep of records: mark the walk done in the decision-log entry (a one-line addendum), then S11 opens per its prompt.

## Status Changes
| Item | Old | New |
|---|---|---|
| The public trust-record read surface | Scoped (build plan §S10) | **BUILT DARK + review-folded** (Verified at the battery level; activation carried) |
| `fix_before_s10` register | Open (gated this session's sign-off) | **Fully dispositioned** (memo; PA-6/F-1/R17i-export closed; rest disclosed/carried named) |
| ADR-013 §8 envelope | Overstated the reflect path (PA-6) | **Narrowed (dated amendment); published form battery-locked** |
| S10 prompt | Pending | **SPENT**; S11 prompt authored |
| The flag + staged docs | — | **CARRIED — the founder walk above** |

## Blocked On
**Uncommitted (this session's commit set):** the build files per the decision-log entry's list; PLUS the three pending S9b walk-record files (`CLAUDE.md`, `operations/decision-log.md` walk addendum, the S9b close addendum — the "final records commit" the S9b walk named); this close; the S11 prompt; the SPENT marker.

**Production state at session close (PR18):** unchanged from the S9b walk — `SUBSTRATE_TRUST_CORE_ENABLED` + `SUBSTRATE_TRUST_CORE_SWEEP_ENABLED` + `SUBSTRATE_REFLECT_SCREENED_EXAM_ENABLED` + `SUBSTRATE_DISCERNMENT_METERING_ENABLED` all `true`; the S9b standing changes live under MEASURE. **`SUBSTRATE_TRUST_READ_SURFACE_ENABLED` is NOT set** (the route will deploy dark on push); production is byte-equivalent to the S9b-walk state until the founder's push (on push: the §2e export fold + code comments are the only always-on deltas). R18f / R20a / distress / Layer-2 signing / UPC auth / the `gate1-dogfood@v1` marker untouched.

## Founder Verification (Between Sessions)
```
cd "/Users/clintonaitkenhead/Claude-work/PROJECTS/sagereasoning"
git add -A
git commit -m "Trust Layer S10 — the public trust-record read surface BUILT DARK + review-folded (D-TRUST-LAYER-S10-READ-SURFACE-BUILT-DARK): GET /api/trust-record/{agent_id} behind SUBSTRATE_TRUST_READ_SURFACE_ENABLED, the §8 envelope narrowed (PA-6) + published verbatim, the fix_before_s10 register fully dispositioned, riders F-1 + R17i closed, batteries S10 106/0 / emission-hooks 15/0 / all standing counts green; carries the S9b walk-record addenda"
```
Then push via GitHub Desktop, then the walk above.

## Open Questions / Registers
Carried (all named in the memo): PA-5 structural + the A2-decrease decision + G5 per-domain + the calling-gate enforce arm (S11 elections); PA-10/PA-11 (S2-wiring); **reflect-store owner-scoping** (NEW — gates external multi-tenant onboarding; covers the export rider AND the shipped delete precedent); F-CONF (extractor calibration); seeding-engine wiring (revisit condition); the 2026-07-07 standing follow-ups.

## PR5 / Lessons
New durable lesson (saved to memory): **HTTP header values are ByteString (Latin-1)** — a typographic character (em-dash) in a header constant crashes every response at runtime while `tsc`/`build` stay green; only driving the real `NextResponse` catches it. Second: **a missing-table-benign read helper is dishonest on a surface where the table must exist** — thread a strict mode for publication-class callers (the A-3/ABUSE-1 class, now closed both directions). Third: **a 404 on a public attestation surface is itself a claim** — gate it on the absence of the attested thing (examined evidence), not on row non-existence (declaration-class rows made the two diverge).

## Orchestration Reminder
S10 built dark → **the founder walk (above: push → memo approval → flag → smokes incl. the REQUIRED export smoke → staged docs)** → **S11** (ENFORCE — the logos gate; prompt: `operations/handoffs/founder/2026-07-12-trust-layer-S11-enforce-activation-NEXT-SESSION-PROMPT.md`). **ENFORCE is S11.** Weights BLOCKED; the 0h call remains the founder's.

*End of session close. The trust record the arc has been accumulating since S9 now has an honest public voice — built dark, envelope-bounded, and waiting on the founder's sign-off to speak.*
