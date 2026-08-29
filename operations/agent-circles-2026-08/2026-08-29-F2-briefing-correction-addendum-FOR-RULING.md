# F2 briefing-correction addendum — dated 2026-08-29 — **RULED APPROVED; THE REVIEW MAY PROCEED**

> **Status update, 2026-08-29 (same day):** ruled approved in full — all nine corrections
> "accurate, properly sourced, and scoped correctly"
> (`2026-08-29-mentor-ruling-f2-addendum-approved-verbatim.md`; verbatim wins). Three precision
> rulings bind the review on top of this addendum: **A4** — the single-backward-edge design
> constraint stands on its merits regardless of the citation's unverified posture (only the
> paper's empirical claim is off-limits as a finding basis). **A6 — SHARPENED:** Probe 2's
> question is now *what of the gate's available resolution — the graded `katorthoma_proximity`
> and the three-way recommendation — does the loop's ELECTION LOGIC actually consume?* — i.e.
> whether the loop treats the gate as binary in practice; resolution loss between the gate and
> the election step is the finding class. **A9** — the two data absences are confirmed structural
> findings, named in **Probe 1** (oikeiosis-circle) and **Probe 2** (completion-signal), never
> framed as deferrals, and carried forward as standing-runner design observations.

**What this is.** The Q3 ruling (2026-08-29, `2026-08-29-mentor-ruling-five-instruction-family-verbatim.md`)
elected option (a): the adversarial-review instruction's text stays untouched
(`2026-08-25-mentor-instruction-adversarial-review-seven-probes-verbatim.md` carries it verbatim),
and this dated addendum corrects its "What you know about the harness" briefing, each correction
citing its decision-log source. Per the ruling's own closing sentence — *"The correction addendum
is reviewed by the mentor before the review runs. The relaying session drafts it and surfaces it
for ruling before proceeding"* — **the review is HELD until this addendum is ruled on.** Each
numbered item below states: the briefing's sentence as written → the corrected fact → the source.
The reviewer reads the briefing WITH this addendum; wherever they differ, the addendum wins.

---

**A1 — The provenance thread (three sentences corrected to current live state).**
- *As written:* "A honesty correction is owed and pending founder sign-off."
  → **Corrected:** the honesty correction is APPLIED AND LIVE — edit 1 (served envelope: scoped
  `attests[1]` + a new extraction-origin `does_not_attest` item + ADR-013 §8 dated amendment +
  five mutation-verified pins) and edit 2 (all three R18 surfaces) were founder-signed, applied,
  and production-verified by direct query on 2026-08-25.
  Sources: `D-EXTRACTION-PROVENANCE-HONESTY-CORRECTION-EDIT-1-APPLIED-2026-08-25`;
  `D-EXTRACTION-PROVENANCE-HONESTY-CORRECTION-EDIT-2-APPLIED-2026-08-25`;
  `D-EXTRACTION-PROVENANCE-CORRECTION-LIVE-AND-LEDGER-PROMPT-AUTHORED-2026-08-25`.
- *As written:* "A signature-keyed provenance ledger is the elected structural fix direction, unbuilt."
  → **Corrected:** the ledger's slices 1–2 are BUILT AND LIVE RECORD-ONLY —
  `agent_provenance_ledger` + `agent_provenance_gaps` applied to TEST and production (2026-08-26);
  `SUBSTRATE_PROVENANCE_LEDGER_ENABLED=true` in all Vercel environments (2026-08-26); every
  credential-bearing signed consult writes a ledger row; `emitAccreditationTrustEvents` runs the
  classification record-only (never refuses a mint, never writes the gaps table); the two-week C2
  readiness watch for slice-5 enforcement started 2026-08-26; slices 3 (served `provenance_gaps`
  field + attestation amendment) and 5 (ENFORCE) remain gated.
  Sources: `D-PROVENANCE-LEDGER-SLICE1-MIGRATIONS-APPLIED-2026-08-26`;
  `D-PROVENANCE-LEDGER-SLICE2-ACTIVATION-LIVE-2026-08-26`.
- *As written (Probe 4):* the l1_supply population degrades the trust record's stock as writes accumulate.
  → **Corrected population facts:** ZERO active `l1_supply`-carrying credentials (both revoked
  2026-08-25, founder-verified `active_with_l1_supply = 0`); ZERO supplied extractions across
  3,200 recorded consults (2,746 stamped `server`; 454 pre-stamp rows genuinely unknown, not
  inferred clean); the preset still grants the capability on new ecosystem/plugin mints, and the
  plugin path requires it structurally, so the exposure CLASS survives at zero current population.
  Probe 4's degradation question remains legitimate as a structural analysis; its premise about
  the current population is corrected as above.
  Sources: `D-L1-SUPPLY-CREDENTIAL-HYGIENE-DISCHARGED-2026-08-25`;
  `D-PROVENANCE-LEDGER-URGENCY-PHASING-RULED-2026-08-25` (addendum 2).

**A2 — The character count.** *As written:* "4,159 characters of project context." →
**Corrected: 5,616 characters** (`length(current_phase)` on the production `project_context` row
at v1.4.1, founder-run). Source: `D-PROJECT-CONTEXT-LIVE-ROW-UPDATED-ENCODING-INCIDENT-2026-08-24`.

**A3 — The injection scope.** *As written:* "The live extraction prompt injects project context
verbatim into **every** Layer-1 extraction call." → **Corrected: scoped to `/api/reason` only** —
`getProjectContext('condensed')` is injected on every `/api/reason` request
(`route.ts:1413-1418,1454`); the LIVE guardrail sandwich branch carries NO project-context
injection (`guardrail-sandwich.ts`: zero references; `guardrail/route.ts:389`'s
`getProjectContext('minimal')` sits on the legacy path only, past the sandwich branch's return).
**Probe 3 and Probe 7's project-context items are scoped accordingly.** Sources: first-hand code
verification 2026-08-29 (independently re-traced by the claims-vs-source review pass);
`D-REASON-INPUT-CAP-VS-PROJECTCONTEXT-CONTAMINATION-FIXED` (the labelling fix);
`D-PROJECT-CONTEXT-LIVE-ROW-UPDATED-ENCODING-INCIDENT-2026-08-24` (the row feeding it).

**A4 — The Rajpal citation.** *As written:* a 2026 Communications Physics paper "establishes" the
single-backward-edge optimality, stated as "a named design constraint." → **Corrected posture:
recorded-but-not-independently-verified** — the citation was marked unverified-at-relay at the
cybernetics execution and has not since been verified. The design constraint stands as the
mentor's ruled constraint regardless; **no review finding may rest on the paper's claim as a
verified fact.** Source: `D-CYBERNETICS-INSTRUCTION-EXECUTED-AND-FOUNDER-ELECTIONS-2026-08-24`.

**A5 — The component table's comparator row.** *As written:* "Comparator | The Stoic Risk Gate
guardrail and the ATRF's blast-radius and virtue-domain assessment." → **Corrected: the ATRF
blast-radius and virtue-domain assessment is DESIGNED-AND-UNBUILT** — ruled (ATRF Q-B1/Q-B2), its
migration authored (`website/supabase-idea-loop-candidates-atrf-blast-radius-and-s4-migration.sql`)
with no apply record; the columns are deliberately-optional insert keys, absent from every live
row. By F2's own constraint, listing it as a live comparator is a false positive; the review must
not inherit it as one. The live comparator is the guardrail gate alone. Sources:
`D-ATRF-EE-PRODUCTION-WAVE-BUILT-PR19-FOLDED-2026-08-23`;
`D-MENTOR-RULINGS-ATRF-SIXTEEN-ADOPTED-EXECUTED-2026-08-23`.

**A6 — Probe 2's gate-resolution premise.** *As written:* "The Stoic Risk Gate produces a binary
pass/fail, not a graded error signal." → **Corrected: the live gate emits a graded
`katorthoma_proximity` (five-value ordinal) and a three-way recommendation (proceed /
pause_for_review / deny) on every verdict** — observed first-hand in the executing session's own
GUARD-CAUTION frames, and carried per-candidate into `idea_loop_candidates.guardrail_proximity`.
**Probe 2's question becomes: what of that available resolution does the LOOP consume** (the
runner's election logic and the generation step), not whether the gate lacks resolution. Sources:
first-hand observation 2026-08-29; `idea-loop-watching-store.ts:156-172`; the §6 report's
per-candidate guardrail counts (9 rejected of 120 candidates, derived from these live rows —
`2026-08-16-idea-loop-S6-report.md`).

**A7 — The "primary error signal" framing.** *As written:* "The proximity score … is the
harness's primary error signal." → **Corrected to F3's own ruled doctrine: the proximity score is
a point estimate, not a control signal.** GS-CYB-1 — whether it may serve as an error signal
inside a weighting function — is OPEN and gated behind the amended two-condition weights-BLOCKED
constraint, neither condition met. **The review must not inherit as a premise the thing GS-CYB-1
holds open**; probes that touch the score's control role analyse it as a candidate error signal
whose adoption is blocked, per F2's own weights-BLOCKED constraint paragraph. Sources:
`D-GAMING-BAR-ROUTE-II-RULED-AGAINST-GS-CYB1-CONSTRAINT-AMENDED-2026-08-24`; F3's captured record.

**A8 — GS-ATRF-3 and GS-ATRF-4 status (per the Q4 ruling).** *As written:* "The completion signal
return path (GS-ATRF-3) is an open question" (and the briefing's general open-questions posture).
→ **Corrected:** GS-ATRF-3's return path is RULED (ATRF Q-C1: schema, direct credentialed POST,
refuse-to-attest required) and its endpoint is BUILT DARK (`POST /api/practice/completion-signal`
behind `SUBSTRATE_COMPLETION_SIGNAL_ENABLED`, unconsumed); the operational balancing loop is
still absent — which is exactly what Probe 2's missing-balancing-loop analysis should name, now
as a designed-but-unactivated mechanism rather than an unruled question. GS-ATRF-4 is RULED AND
LIVE (production `project_context`, 2026-08-19). The authoritative status list is the ATRF sixteen
rulings record, not any briefing block. Sources:
`D-MENTOR-RULINGS-ATRF-SIXTEEN-ADOPTED-EXECUTED-2026-08-23`;
`D-ATRF-EE-PRODUCTION-WAVE-BUILT-PR19-FOLDED-2026-08-23`; `D-GSATRF4-EPISTEMIC-STATUS-LIVE-2026-08-19`.

**A9 — Two data absences the review names as confirmed structural findings (per the Q2a ruling,
restated here so the reviewer carries them into the probes, not as deferrals):** (i)
completion-signal data does not exist — the run produced none, the endpoint postdates it; (ii)
per-candidate oikeiosis-circle data does not exist for the historical 20 cycles and cannot be
backfilled. Also per Q2c: the cycle-over-cycle proximity delta is derivable at read time from
each cycle's winner-candidate `guardrail_proximity`; no persisted column exists — a design
observation for the standing-runner session.

---

**Not corrected (checked and accurate as written):** the three human-switched operational states
as program names (per the Q5a domain-scoping ruling); the IDEA loop's causal sequence and the
single-backward-edge design constraint's status AS a ruled constraint (only the citation's
epistemic posture changes, A4); the weights-BLOCKED constraint paragraph (verbatim-consistent
with the amended two-condition ruling); the emission-hooks asymmetry's description as a
structural condition (the enforcement gap is real until slice 5 — only its population and
remediation state move, A1); "the architectural fix — removing project context from
API-key-authenticated calls — is ruled and unbuilt" (still true).

*Drafted 2026-08-29 by the relaying session; awaiting the mentor's ruling. The review does not
run until this addendum is ruled on.*
