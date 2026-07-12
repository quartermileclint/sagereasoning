# S10 R18 Governance Sign-off Memo — the public trust-record read surface

**Date:** 2026-07-12. **Stream:** founder. **Session:** Trust Layer S10 (`code-elevated` build → `code-critical` at the carried activation).
**Governing bound:** ADR-013 §8 (the honest-claims envelope, as amended 2026-07-12 — the PA-6 narrowing + the PA-10 disclosure). The surface publishes INSIDE it, verbatim (`TRUST_RECORD_ENVELOPE`, battery-locked).
**Sign-off mechanics:** per ADR-013 §10 and the build plan §S10, **nothing publishes before the founder's R18 sign-off**. This memo is the sign-off instrument: the founder's approval at the activation walk (flag + staged docs) IS the sign-off. Until then the route answers an honest 503 and no doc surface mentions it.

## 1. What the surface is

`GET /api/trust-record/{agent_id}` — public, unauthenticated (founder election E1), rate-limited 30/min/IP, **dark behind `SUBSTRATE_TRUST_READ_SURFACE_ENABLED`** (unset ⇒ 503, zero DB work). Serves the S1→S3 **state fold only**: per-domain effective levels (decay realized at read — decayed truth, never stale rows), the minimum-domain aggregate with its conservative read-time confidence basis, coverage gaps named, the justice latch surfaced, the reflect record as a **modulate-only** class, and the honest-claims envelope verbatim. **Not served (design decisions of record):** the S4 intervention recommendation (orchestrator-facing machinery; publishing it would read as advising third parties whether to proceed); the event ledger (event payloads can carry passion sub-species detail — the R17e-adjacent conservative posture is state-fold-only in v1).

## 2. The `fix_before_s10` register — disposition of every item

| Item | Disposition | Where |
|---|---|---|
| **PA-5** (MEDIUM — reflect events mintable by a credentialed agent via the direct API path) | **Disclosed + bounded on-surface; structural closure CARRIED to S11.** The surface serves reflect history only as a `modulate-only` record with the verbatim note that it "cannot raise any trust level and is not attested as a verified pattern of honesty"; the envelope states "no claim rests on agent self-report alone." The S9b screened-exam path now governs the live loop, but the direct `/api/practice/reflect` mint path (client `context_source` + agent-influenceable answers) remains open — its hardening is the S11 election the founder declined to take here (rider election, 2026-07-12), taken with the A2/PA-10 decrease-surface decision. | `trust-record-payload.ts` (REFLECT_MODULATE_ONLY_NOTE + envelope); S11 prompt |
| **PA-6** (MEDIUM — §8 envelope overstated the reflect artifact) | **CLOSED.** ADR-013 §8 carries the dated 2026-07-12 narrowing; the surface publishes the narrowed envelope verbatim; battery pins S2-28..S2-37 lock the load-bearing phrases. | ADR-013 §8 amendment; `TRUST_RECORD_ENVELOPE` |
| **PA-10** (LOW — stale-artifact replay sustains a domain at its once-demonstrated proximity) | **Disclosed on-surface; structural closure CARRIED to the S2 fold wiring** (founder election E2, 2026-07-12: the mentor-A5 recency confidence tier is the shaped fix; an ad-hoc age bound in the live deriver was declined). The envelope's does-not-attest list names the class verbatim ("Freshness beyond the artifact record…"). The S9b extension (the suppression-watch screen-caught exception accepts genuinely replayed assessments) is the same class — carried with it. | Envelope bullet 3; S2-wiring/S11 |
| **PA-11** (LOW — latch set/clear asymmetry) | **CARRIED** (S2/S9 refinement). Safe direction — trust reads lower; watched in the S9 instrument-fidelity batteries. Not publication-class: the surface serves the latch state honestly however it was set. | register |
| **A7-dead-code standing note** | **RECORDED (standing tripwire, restated):** the A7 `higher` L4 tier is unreachable in this build — no event type can raise the oversight domain. The moment a positive oversight event type is added, the reflect-count leg of the higher-tier gate silently arms and the reflect artifact becomes load-bearing for softening L4 holds — harden the reflect path or re-audit the AND-guard **in the same change**. S10 adds no oversight-raising event type (the surface is read-only). | this memo; audit report §3 |
| **F-1** (LOW — emission hooks had no unit test) | **CLOSED.** `emission-hooks.test.ts` 15/0: flag-off ⇒ zero DB-layer work (structural — hermetic env would have logged any touch); flag-on + store failure ⇒ no throw to the route + `[trust-core]`-prefixed log; pre-condition no-ops silent. | new battery |

## 3. The S9/S9b findings — disposition

| Item | Disposition |
|---|---|
| **F-CONF** (confession framings under-derive violated circles 0/6) | **CARRIED** (extractor calibration, S11-adjacent). Not a surface claim: the envelope's "as narrated and extracted" wording states the extraction dependence honestly; the live loop's operative class (proposed-action) is the reliable one. |
| **S9 mint-route note** (owner-less consult credential is consumer-erase-eligible by its own token holder) | **CARRIED** (operational; re-mint owner-bound at a natural rotation). |
| **G5 per-domain depth refinement + deliberate⇒quick carve-out** | **CARRIED to S11** (disclosed in `loop-closure.mjs`; aggregate-keying is the conservative direction — reflexive in any domain forces deep). |
| **`/api/user/export` reflect rows (R17i)** | **CLOSED (rider, this session).** `getAgentSessionsForExport` (session-store) + the export route's §2e fold: owner→agent_ids (the delete-path scoping), rows exported with the R17b response history **decrypted for the data subject** (the Art-20 usable-form precedent), raw ciphertext columns dropped, per-row decrypt failure an honest marker. INV-pinned (S5-10..S5-14); **the live verification is a REQUIRED export smoke at the founder walk** (upgraded from optional per review finding BATT-1). The agent_id-scoping boundary it inherits from the delete precedent is the NEW carried item in §9. |
| **Seeding-engine wiring** | **CARRIED** (revisit: first candidate with accumulated calling records). |
| **A2-as-decrease-surface note** | **CARRIED to S11** (the enforce decision names it). |
| 2026-07-07 standing follow-ups (`format` length validation; sibling mild-mutes-stage-2) | **STANDING** — predate this register; unchanged; named for completeness. |

## 4. AC5 / R20a re-check (the S8-mandated re-check, performed)

- **The new route:** agent-facing READ; the only input is the agent_id path segment — **no free-text human submission exists on this surface**, so the distress classifier has no subject text. **OUTSIDE the human-distress perimeter**; recorded in both the route and handler headers (the discernment-precedent comment form). The perimeter registry is untouched (r20a-invocation-guard 92/0 re-run green this session). AC5 untouched; no new human-facing POST route exists.
- **The discernment route's S8 recorded decision** (which named this re-check): **re-confirmed.** Its POST inputs remain agent-produced (profiles, an orchestrator's reasoning trace, elicitation text captured from an agent transcript); the S9b elicitation phase did not change the input class. The recorded decision stands.

## 5. EU AI Act Art 12 / Art 14 evidence framing (for the staged docs)

The staged public docs frame the trust record as **evidence infrastructure a deployer may draw on** for record-keeping-style logging (Art 12-shaped: signed, reproducible, retention-governed examination artifacts per decision) and human-oversight support (Art 14-shaped: MEASURE-mode advisory records with R20c human-override supremacy stated on the surface itself). Framed honestly: **not a compliance certification, not legal advice, not a conformity assessment** — the same posture as the existing R18e Article-50 placeholder (final wording lawyer-coupled at the standing engagement). High-risk obligations bind 2026-08-02 (the positioning fact from the plan's research record).

## 6. Interop posture (founder election 4, honored)

The payload shape is W3C-VC-claims-mappable (subject/issuer/claims-per-domain/evidence-basis) and versioned as an A2A-extension-shaped schema (`sage-trust-record/v1`); OTel-GenAI span-ref shaping stays in the observability logs. `interop.published_externally: false` rides the wire. **Nothing is registered or published to any external standard body at v1.**

## 7. Elections of record (2026-07-12, AskUserQuestion)

- **E1 — surface/auth:** new public unauthenticated GET (`/api/trust-record/{agent_id}`), accreditation-GET posture, dark behind its own flag.
- **E2 — PA-10:** disclose + carry to S2-wiring (mentor-shaped recency-tier closure; no ad-hoc live-deriver age bound).
- **E3 — riders:** close F-1 + the R17i export fold here; decline the PA-5 API-path hardening (S11).

## 8. What the sign-off licenses (and what it does not)

Approving this memo at the walk licenses: the flag flip (`SUBSTRATE_TRUST_READ_SURFACE_ENABLED=true`), the application of the staged docs (llms.txt + agent-card 17th extension + api-docs), and the live smokes. It does **not** license: any enforce behavior (S11), any weights-tier claim (blocked throughout), any external interop publication, or any change to the R20a perimeter. Rollback: unset the flag + redeploy (dark 503, byte-identical flag-off, battery-asserted); `git revert` for the docs.

## 9. Adversarial-review addendum (2026-07-12, post-build — the first wave's folds)

The first review launch (6 dimensions, Fable) died 5/6 on the account session limit (the disclosed exhaustion pattern); the completed **abuse-surface** dimension returned two findings, both **first-hand confirmed** (their refuters also died) and **FOLDED + pinned** before the Opus relaunch of the dead dimensions (the prompt's §4 fallback):

- **S10-ABUSE-1 (LOW, the substantive one):** the missing-table-benign regex (`isMissingTableError` matches `schema cache` messages — the register's A-3 class in a NEW direction) would have turned a transient PostgREST schema-cache stale into a benign empty profile ⇒ a **false, publicly-cached 404** claiming "no trust events have been folded." **Folded at the root:** `readTrustProfile` gained `opts.strictMissingTable` (default off — every existing caller byte-identical, control-pinned); `readTrustVerdict` threads `opts.strictStore`; the handler's real binding sets it, so the class now answers **503 no-store** (pins S4-24..S4-27, S5-15, S5-17).
- **S10-ABUSE-2 (NIT):** `readHonestReflectSummary` fetched all matching rows unbounded on a public path. **Folded:** desc-ordered + capped at `HONEST_REFLECT_SUMMARY_ROW_CAP` (500) with a `capped` flag — the count under-reports at the cap (the safe direction) and the payload notes it honestly (pins S4-28/S4-29, S5-16). The S7 L4 consumer (threshold ≥3) is unaffected.

Post-fold verification: the full regression sweep re-ran green at standing counts (S1 97 · S2 87 · S3 106 · S4 417 · S5 87 · S6 84 · S7 122 · S8 146 · S9b 86 · emission-hooks 15 · reflect 28/34/17 · erasure 25/40 · hooks 104 + 230 RELEASE GATE PASS).

**The Opus relaunch COMPLETED FULLY (17 agents, 0 errors, ~3.86M tokens): all 6 dimensions returned; fold-verification CLEAN (both first-wave folds verified correct, pins non-vacuous); 4 confirmed findings (ALL LOW — zero critical/high/medium), 7 refuted with cited reasoning. All four confirmed are folded or dispositioned:**

- **S10-ENV-1 (LOW, folded at the root):** the staged docs' "404 = no examination-derived events" was false at application — a declaration-class record-only event (the v1 harness_computed calling acknowledgement) SEEDS a state row at the profile prior with `hasEvidence=false`, so a bare row-existence 404 gate would have served such an agent a 200. **Folded:** the handler 404 now gates on *no domain carries evidence* (`!domains.some(hasEvidence)`), so a 200 genuinely implies examined evidence; the 404 message + staged-docs line name the declaration-class bound; pins S4-30..S4-34 (incl. the mixed-profile control: a seeded domain rides a 200 honestly as `has_evidence:false`).
- **S10-EXPORT-RIDER-CROSS-TENANT-REFLECT (LOW, disclosed + CARRIED — NEW register item "reflect-store owner-scoping"):** `sage_reflect_sessions` carries no owner column and agent_id is NOT owner-unique (UPC uniqueness is the (owner, agent) PAIR), so the export rider — like the SHIPPED S9b delete precedent it mirrors — scopes intimate reflect content by agent_id alone; if two owners ever held the same agent_id, one owner's export would disclose the other's decrypted reflections. **Zero live exposure today** (pre-0h; single operator; reflect-persist founder-local). Closure requires a schema step (owner column or unique-ownership filter) covering BOTH export and delete — **trigger: BEFORE any external multi-tenant onboarding**; disclosed at both code sites.
- **BATT-1 (LOW):** the export rider had source-grep coverage only — **the export smoke is now a REQUIRED step of the S10 founder walk** (not optional): one authenticated `/api/user/export` call verifying the `sage_reflect_sessions` key + a decrypted `response_history`.
- **S10-RECORDS-1 (LOW):** a stale battery count in the S11 prompt — corrected.

Refuted (with the refuters' reasoning on record in the workflow journal): the calling-event artifact-class disclosure (accurately narrowed already), the oversight-aggregate exclusion (served + basis-named; cardinal scoping is the design of record), the two-clock nit (display-only, decay uses one injected instant), the reflect-note screened wording (accurate as written), the envelope substring-lock sufficiency (the governance re-derivation gate is the control), the decay-magnitude boundary (owned by the S1 decay battery over the same module), and the untested OPTIONS/405/rate-limit boilerplate (thin-route design; the S5-6 pin was nonetheless tightened to the call form).

*End memo. The register is fully dispositioned: PA-6 + F-1 + R17i-export closed; PA-5 + PA-10 disclosed-on-surface + carried with named targets; PA-11 + F-CONF + G5 + seeding + A2-note + mint-note carried with named targets; the A7 tripwire restated; the two first-wave review findings folded + pinned (§9).*
