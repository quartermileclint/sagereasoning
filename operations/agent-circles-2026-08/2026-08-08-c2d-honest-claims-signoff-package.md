# C2d Sign-off Package — the fifth-circle not-attestable clause (founder sign-off REQUIRED before any public file changes)

**Status: SIGNED OFF (mentor, relayed by the founder, 2026-08-08).** The mentor's response, verbatim disposition: §1's clause confirmed verbatim; §2's ADR-013 §8 amendment approved as drafted; §3's `TRUST_RECORD_ENVELOPE` addition approved as drafted (waits for the activation walk); §4's R18 surface changes approved as drafted **subject to the §6(b) aggregate-note addition being carried into the llms.txt and agent-card disclosures at activation** (now folded into §4 below); §5's non-claims confirmed correct and complete. Both §6 open questions RULED — see §6, updated in place. *"The activation-walk prompt governs the application order. Nothing in this sign-off licenses skipping the hard gate."* Recorded in `D-C2D-SIGNOFF-AND-SECTION6-RULINGS-2026-08-08`. Per the C2d hard gate (`D-C2-C1C-STORAGE-HOME-VIRTUE-DOMAIN-RULED-2026-08-06` follow-on confirmation 4, restated in the build prompt: *"Does not proceed past C2c/C2d without the founder walking sign-off on the exact honest-claims wording — this is a named hard gate, not a build-time detail to improvise past"*), **nothing in this package has been applied to any live public surface.** The 2026-08-08 build session built the flag-gated dark halves only (the S10 per-entry inline clause, served exclusively when `SUBSTRATE_ORIENTATION_READING_ENABLED` is on); every surface below changes ONLY at the founder-walked activation session, after this sign-off, in the order the ruling fixed: **(a) ADR-013 §8 dated amendment → (b) `TRUST_RECORD_ENVELOPE` → (c) the three R18 surfaces.**

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

- **`llms.txt`** — in the trust-record section, a new short subsection "Orientation readings (fifth circle — MEASURE)": the capped `orientation_readings` list **with the `total_orientation_readings_count` field alongside it (the mentor's §6(b) ruling — a reader sees "showing 50 of 847", never a bare window implying completeness; the list is a recency window, not the full record)**; per-entry inline clause (quoted verbatim); computed deterministically server-side; never on the consult response; a supplied `layer1_schema` carrying `orientation_observations` is refused with 400 `orientation_observations_not_suppliable`; the field limits + extraction-trust ceiling disclosures carried per the corroboration precedent.
- **`agent-card.json`** — a new extension `orientation-reading/v1` (would bring the live total 20 → 21), summarising the same contract + the verbatim clause **+ the total-count disclosure (§6(b))**.
- **`api-docs`** — one bullet on the trust-record section naming the capped list + the total count + the clause; one bullet on `/api/reason` naming the 400 refusal code.

## 5. What is deliberately NOT claimed anywhere

- No aggregation, trend, score, or "orientation rate" is served or computed — entries only, capped at 50 most recent, newest first.
- No claim of gaming-proofness: the reading is *harder* to game than proximity by design (no per-consult feedback; server-extraction-only), and still extraction-trust-bounded — the disclosure wording above keeps the A2-class ceiling named.
- Nothing binds: MEASURE throughout; ENFORCE remains S11; the logos-on staging rules (W3) already pin that the orientation reading is never an enforcement input.

## 6. Two open questions from the PR19 independent re-run — BOTH RULED (mentor, 2026-08-08)

Neither was resolved by silent code change; both were put to the mentor with the sign-off and are now ruled.

**(a) The calling-moment telos line's branch scope — RULED: option (i), leave as built (declared-purpose branch only).** The mentor's reasoning, verbatim: *"The elicitation branch fires precisely when no purpose has been declared — the agent has not yet oriented itself. Placing the telos line in the elicitation branch would be presenting a fifth-circle framing to an agent that has not yet named what it is doing, which is not orientation — it is imposition. The telos line belongs where orientation is occurring, not where it is being solicited."* No code change; the existing battery pin ("the purposeless elicitation is unchanged") now pins a RULED design decision rather than an unexamined one.

**(b) S10's recency-window disclosure — RULED: option (ii), add an aggregate note.** The mentor's framing, verbatim: the residual *"is a different problem from gaming — it is an honest-scope failure of the same kind the corroboration check's own disclosure wording was designed to prevent... A total-count alongside the capped list... gives any reader the information they need to know the window is partial. The disclosure cost is trivial. The honest-scope gain is real."* Specific form ruled: **a `total_orientation_readings_count` field alongside the capped list** ("showing 50 of 847", never "showing 50" implying completeness; the oldest-excluded-timestamp named as a second option, the count ruled simpler and sufficient). **IMPLEMENTED 2026-08-08, same session:** `readOrientationReadings` computes the total (row-count when at-or-below the cap — the CAP+1 probe already proves completeness; one exact-count head query when above it, fail-honest to an omitted-count + disclosed note on a transient failure); the payload serves `record.total_orientation_readings_count` and the capped note reads "shows the N most recent of M total readings (a recency window, not the full record)". Battery-pinned both directions (orientation-trust-events §6.2a-ii/b-ii/c; S10 S6-5/5b/5c/5d + the S6-1c flag-off negative).

---

*Prepared 2026-08-08 at the C2/C1c build session; §6 added 2026-08-08 after the PR19 independent re-run. The activation-walk prompt (`operations/handoffs/founder/2026-08-08-c2-c1c-activation-NEXT-SESSION-PROMPT.md`) carries the application order and the walk steps; it stops at a hard gate pointing back to this package.*
