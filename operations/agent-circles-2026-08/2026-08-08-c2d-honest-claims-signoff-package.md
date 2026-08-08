# C2d Sign-off Package — the fifth-circle not-attestable clause (founder sign-off REQUIRED before any public file changes)

**Status: AWAITING FOUNDER SIGN-OFF.** Per the C2d hard gate (`D-C2-C1C-STORAGE-HOME-VIRTUE-DOMAIN-RULED-2026-08-06` follow-on confirmation 4, restated in the build prompt: *"Does not proceed past C2c/C2d without the founder walking sign-off on the exact honest-claims wording — this is a named hard gate, not a build-time detail to improvise past"*), **nothing in this package has been applied to any live public surface.** The 2026-08-08 build session built the flag-gated dark halves only (the S10 per-entry inline clause, served exclusively when `SUBSTRATE_ORIENTATION_READING_ENABLED` is on); every surface below changes ONLY at the founder-walked activation session, after this sign-off, in the order the ruling fixed: **(a) ADR-013 §8 dated amendment → (b) `TRUST_RECORD_ENVELOPE` → (c) the three R18 surfaces.**

---

## 1. The clause itself (mentor-verbatim, Q6 — the ONLY sentence pair needing sign-off as-is)

> The record can attest that specific examinations were oriented toward the rational order. It cannot attest that the agent is fifth-circle-aligned.

This exact text is already in the dark build as `ORIENTATION_NOT_ATTESTABLE_CLAUSE` (`website/src/lib/translation-sandwich/orientation-reading.ts`), carried INLINE on every flag-gated S10 orientation entry (the placement ruling's structural addition: *"the entry is the unit that will be read in isolation"*). Battery-locked verbatim.

## 2. Proposed ADR-013 §8 dated amendment (draft — for sign-off)

Append to ADR-013 §8 (the honest-claims bounds), as a dated amendment:

> **2026-08-XX amendment (agent-circles C2/C1c — the fifth-circle orientation reading; mentor Q6, verbatim binding).** The trust record MAY carry a capped list of per-examination orientation readings (`orientation_readings` on the public trust-record payload): each entry describes whether ONE examination's reasoning moved toward or away from the rational order, computed deterministically from the server-side extraction's habit-vs-genuine-examination markers. The record can attest that specific examinations were oriented toward the rational order. It cannot attest that the agent is fifth-circle-aligned. Fifth-circle alignment is not a state the record can attest, regardless of what the orientation readings show — the distinction is between describing what the reasoning did and claiming what the agent is. Each served entry carries this clause inline. The reading is never placed in the signed assessment, never rendered in any practice-voiced surface, never fed back to the agent as a reading to be improved, and binds nothing (a `'flag'`-effect, NULL-domain ledger event outside every fold, aggregate, and recommendation). It rests on the honest extraction of the submitted text and inherits the extraction-trust ceiling (reasoning narrated as examination reads as examination); a caller-supplied extraction can never produce a reading.

## 3. Proposed `TRUST_RECORD_ENVELOPE` change (draft — for sign-off)

Add ONE line to `does_not_attest` (`website/src/lib/substrate/trust-core/trust-record-payload.ts`, served live on every S10 200):

> `'Fifth-circle alignment: orientation_readings entries describe single examinations (each carries its own inline clause); the record cannot attest that the agent is fifth-circle-aligned (mentor Q6).'`

*Note:* this edits a LIVE public payload (the envelope serves on every current 200 regardless of the orientation flag) — which is exactly why it waits for sign-off + the activation walk rather than riding the dark build.

## 4. Proposed R18 surface changes (draft — for sign-off; applied third, after (a) and (b))

- **`llms.txt`** — in the trust-record section, a new short subsection "Orientation readings (fifth circle — MEASURE)": the capped `orientation_readings` list; per-entry inline clause (quoted verbatim); computed deterministically server-side; never on the consult response; a supplied `layer1_schema` carrying `orientation_observations` is refused with 400 `orientation_observations_not_suppliable`; the field limits + extraction-trust ceiling disclosures carried per the corroboration precedent.
- **`agent-card.json`** — a new extension `orientation-reading/v1` (would bring the live total 20 → 21), summarising the same contract + the verbatim clause.
- **`api-docs`** — one bullet on the trust-record section naming the capped list + the clause; one bullet on `/api/reason` naming the 400 refusal code.

## 5. What is deliberately NOT claimed anywhere

- No aggregation, trend, score, or "orientation rate" is served or computed — entries only, capped at 50 most recent, newest first.
- No claim of gaming-proofness: the reading is *harder* to game than proximity by design (no per-consult feedback; server-extraction-only), and still extraction-trust-bounded — the disclosure wording above keeps the A2-class ceiling named.
- Nothing binds: MEASURE throughout; ENFORCE remains S11; the logos-on staging rules (W3) already pin that the orientation reading is never an enforcement input.

## 6. Two open questions from the PR19 independent re-run — for explicit acknowledgement alongside the wording sign-off (added 2026-08-08)

Neither of these was resolved by silent code change (per this arc's standing discipline of surfacing genuine ambiguity rather than improvising past it). Both are dark/inert regardless of your answer; neither blocks signing §1–§5 above if you'd rather decide these separately.

**(a) The calling-moment telos line's branch scope.** The mentor's Q7 answer says the telos belongs at "the purpose-declaration gate at session open... where the agent orients itself." The build wired it ONLY into the branch that fires when a purpose is already declared (`renderPurposeOrientation`) — not the branch that fires when no purpose has been declared yet and the harness is eliciting one (`renderCallingElicitation`, "there is nothing to call and nothing to send"). Both readings are defensible; the mentor's text doesn't pick one. Options: (i) leave as built (declared-purpose only); (ii) also add it to the elicitation branch; (iii) put the question back to the mentor for an explicit ruling.

**(b) S10's capped, recency-ordered `orientation_readings` list has a gaming residual the mentor's binding record doesn't name.** Because the served list is the 50 MOST RECENT readings (not a monotonic safe-direction undercount, unlike the reflect-summary's own cap), an agent could generate enough favorable `toward` consults to push unfavorable `away`/`indeterminate` entries out of the visible window — a curated-looking record without any single entry being dishonest. Options: (i) accept as a disclosed limitation of the MEASURE-only surface (no fix); (ii) add an aggregate note (e.g. a total-count or oldest-excluded-timestamp) alongside the capped list so a reader knows the window is partial; (iii) put the question to the mentor.

---

*Prepared 2026-08-08 at the C2/C1c build session; §6 added 2026-08-08 after the PR19 independent re-run. The activation-walk prompt (`operations/handoffs/founder/2026-08-08-c2-c1c-activation-NEXT-SESSION-PROMPT.md`) carries the application order and the walk steps; it stops at a hard gate pointing back to this package.*
