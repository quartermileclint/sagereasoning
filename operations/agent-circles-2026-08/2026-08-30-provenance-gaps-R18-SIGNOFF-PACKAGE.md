# R18 sign-off package — the `provenance_gaps` served field (provenance-ledger slice 3)

**Status: STAGED — AWAITING FOUNDER SIGNATURE. Nothing in §3–§5 is applied.**
**Authored 2026-08-30.** (Note on dating: today's later sessions have been labelling artifacts
`2026-08-31`; the verifiable local date is 2026-08-30 and this file uses it. If the founder
prefers arc-consistency, this file and the slice-3 close rename together.)

**What is already signed and is NOT re-asked here:** the §10 attestation amendment's exact
replacement wording, founder-signed 2026-08-26 (SCOPE §10). It is applied in the code edit this
package accompanies. SCOPE §10's own words: *"No further mentor question or founder sign-off is
owed on this wording unless the built PR19 review surfaces a reason to revisit it."* The PR19
review of this build ran; if it surfaced such a reason it is recorded in the slice-3 close, and
this line should be read against that.

**What IS being asked:** signature on (a) the four served `reason_text` templates + the shared
`not_attestable_clause`, which are **new public text** shipped inside the code edit, and (b) the
three R18 surface additions in §3–§5.

**The ordering rule this package obeys** (2026-08-15 / 08-25 / 08-31 precedent): the public
surfaces carry the amendment **after** the code edit, never ahead of it, and never before signature.

---

## §1 — What the field is, in one paragraph

`GET /api/trust-record/{agent_id}` gains `record.provenance_gaps` (a capped list, 50 most recent,
newest first) and `record.total_provenance_gaps_count` (the honest total). An entry records one
accreditation write whose submitted artifact the provenance ledger **could not verify the origin
of**, and says **why**. It delivers F-2's binding requirement — *"a refused mint must surface on
the public record as a named coverage gap… not as silence"* — and it is a **sibling field, ruled
so twice**: reusing `coverage_gaps` unmodified would launder a provenance refusal into a
domain-coverage signal a reader cannot distinguish from an A2-zeroed domain, and widening its
element type would break a documented public field's shape.

Both keys are **absent entirely** while `SUBSTRATE_PROVENANCE_LEDGER_ENABLED` is unset.

> ### ⚠️ READ THIS BEFORE SIGNING — the sentence above is true of the CODE and misleading about the DEPLOYMENT
>
> **`SUBSTRATE_PROVENANCE_LEDGER_ENABLED` has been `true` in Vercel across ALL environments,
> Production included, since 2026-08-26** (`D-PROVENANCE-LEDGER-SLICE2-ACTIVATION-LIVE-2026-08-26`;
> corroborated by 187 real ledger rows). **There is therefore no dark interval and no activation
> step left for slice 3.** On the next push+deploy this ships **live immediately**: every trust-record
> 200 gains the two keys, every request gains one DB read, and the relaxed gate and the new 503
> branch are live.
>
> Three independent PR19 reviewers converged on this. It is the standing lesson
> `shared-flag-dark-is-per-flag-not-per-feature` in its sharpest form — not a sibling feature on a
> shared flag, **the same flag, already on**.
>
> **The ruling that produced it is not in doubt; its premise has expired.** SCOPE §6.5.6 ruled the
> relaxation *"should be tied to the same flag gating the ledger… so that flag-off leaves this
> endpoint byte-identical"*, and gave as its reason that *"the change is inert until the ledger
> itself ships."* The ledger shipped four days later. The tie no longer produces inertness, so the
> ruling's stated reason is discharged while its instruction still stands — a **PR20-class stale
> mechanism fact**, surfaced rather than silently re-decided.
>
> **This is a founder decision and possibly a mentor question. Two options:**
>
> **(A) Give the served field + gate relaxation their own flag** (e.g.
> `SUBSTRATE_PROVENANCE_GAPS_SURFACE_ENABLED`), so slice 3 ships dark and activates as its own
> founder-walked 0c-ii step — consistent with AC7, with how slices 1 and 2 were each walked, and
> with this being `code-critical` precisely because it changes a served public attestation and
> relaxes a gate. Cheap to add. **Departs from §6.5.6's literal instruction**, so it likely owes the
> mentor a note.
>
> **(B) Ship on the existing flag** — live on next deploy, no activation step — with the close, the
> ADR and these docs saying so plainly, and the R18 surfaces applied **at the same time** as the
> deploy rather than after it (there is no dark window in which to document ahead of exposure).
>
> Until this is settled, **do not push.** The rollback line for (B) is `git revert` only; unsetting
> the flag would also stop the live ledger write, which is a standing production change.

---

## §2 — The served strings, for signature

These are shipped **in the code edit**, not in the docs. They are published text and are put here
because that is what R18 is for.

### §2a — The four `reason_text` templates

**These are the POST-REVIEW texts.** An independent PR19 reviewer found the first drafts carried an
unsupported frequency claim, a window conflation, and a near-accusation; all three are corrected
below and the reasons are recorded in the code beside each string.

The Q2 ruling requires the served reason to distinguish *"the instrument had no data"* from *"the
instrument had data and the data disqualified the mint."*

**`no_ledger_entry`** — the first draft said *"most often because the artifact was signed before the
ledger began recording."* That was an empirical frequency claim with a **zero-observation
denominator**, and it **inverts in steady state**: the ledger row's `retain_until` is 90 days and its
purge is wired into the scheduled sweep, so a row is deleted at almost exactly the moment the
artifact crosses the 90-day classification window — routine aged-out artifacts therefore arrive
*here*, not at `out_of_window`, and would have been served a pre-ledger explanation.

> No provenance record exists for this artifact. The ledger was consulted and has no record of where
> this examination's extraction came from — the artifact may predate the ledger, or its record may
> have passed the ledger's retention window, or none was ever written. The ledger cannot distinguish
> these. This is an absence of instrument data, not a finding about the artifact.

**`out_of_window`** — the first draft conflated **retention** (which governs deletion) with
**acceptance** (which governs this outcome), and asserted the ledger *"can no longer speak to"* the
origin, which is **false here**: reaching this outcome means the entry *was* found and read `server`.
A malformed timestamp also lands here, where nothing aged out at all. The window is now
**interpolated from the constant**, killing a three-way drift risk.

> A provenance record for this artifact exists, but it falls outside the 90-day window within which
> the ledger will accept a record as current — or it carries a timestamp the ledger could not read.
> The record is too old, or too uncertain, to verify this artifact's origin against. This is a limit
> on what the instrument will accept, not a finding about the artifact.

**`identity_mismatch`** — **the sharpest correction, and the string this system would serve FIRST**:
all 187 live ledger rows are `identity_kind: 'credential'`, and the C2 baseline's own recorded
sample outcome is `identity_mismatch`. The first draft's opening sentence (*"it was recorded under a
different identity than the one submitting it"*) reads as a near-accusation that another party
presented someone else's artifact. For that population the truth is a credential-configuration
difference the harness has **by design** — its consult credential is owner-less while its write
credential is owner+agent bound, same operator, same agent. The causal sentence is dropped.

> A provenance record for this artifact exists, but the identity it was recorded under and the
> identity submitting it do not resolve to the same longitudinal scope — which can mean a different
> agent, or the same agent using credentials whose identity scopes differ. The ledger cannot confirm
> that the agent presenting this artifact is the agent whose consult produced it.

**`caller_supplied_extraction`** — reviewed **accurate as first drafted**; unchanged.

> A provenance record for this artifact exists, and it records that the extraction was supplied by
> the caller rather than produced by the server. The instrument had data and the data disqualified
> the mint: the served attestation that a decision was reasoned as narrated and extracted from the
> submitted text does not hold where the caller supplied the extraction.

**A precondition of all four, recorded in code:** a gap row renders ONLY under enforcement. If any
future slice writes a gap row without refusing a mint, every string above becomes false on render.

### §2b — The shared `not_attestable_clause`, carried INLINE on every entry

The first draft's middle clause read *"an absent event is a limit of what the instrument can VERIFY
about this artifact's origin"* — which, served beside `caller_supplied_extraction`'s *"the instrument
had data and the data disqualified the mint"*, **flatly contradicted it**, reintroducing one line
later the very distinction Q2 exists to preserve. F-2's uniformity holds for the did-not-practise
half, not the causal half; the causal half is gone.

> The record can attest that this mint was declined and why. It cannot attest that the agent did not
> practise — a declined mint is a fact about what could be established about this artifact's origin,
> never a finding about the agent's reasoning.

### §2c — Payload notes (served in `record.notes`)

**The empty-state note is the review's headline finding and is NEW.** Without it, an ordinary agent
is served `provenance_gaps: []` beside `total_provenance_gaps_count: 0` and **no note at all** — a
quantitative, machine-readable claim that this agent's artifacts were checked for origin and none
failed, from a pipeline that has never run. The envelope prose was carefully kept future-tense for
exactly this reason, and the data field then made the present-tense claim numerically.

> provenance_gaps is empty because origin classification is in a record-only phase: no mint has yet
> been refused, and no gap entry can be written until enforcement begins. An empty list here is not a
> finding that this agent's artifacts had verified origins.

Plus: a capped note naming "N most recent of M"; a capped note when the total is unavailable; a
fail-honest outage note; and a dropped-unknown-reason note.

---

## §3 — `website/public/llms.txt` — proposed new section

To be inserted **after** the existing `### Orientation readings (fifth circle — MEASURE)` section,
mirroring its shape.

```
### Provenance gaps (extraction origin — MEASURE, and currently EMPTY)

A trust record's `provenance_gaps` field is a capped list (50 most recent, newest first) of
accreditation writes whose submitted artifact the extraction-provenance ledger could not verify
the origin of. Each entry names ONE such write, gives the reason in one of four closed values
(`no_ledger_entry`, `out_of_window`, `identity_mismatch`, `caller_supplied_extraction`), and
carries a not-attestable clause inline. It is a SIBLING of `coverage_gaps`, never a widening of
it: `coverage_gaps` is a property of the aggregate's evidence composition across an agent's
history, whereas a provenance gap is a property of one accreditation write at one moment. They
are different kinds of fact at different grains and are deliberately not merged.

Alongside the capped list the record carries `total_provenance_gaps_count`: the true total, so a
reader sees "showing 50 of 847," never a bare window implying completeness. The count is OMITTED,
never fabricated, if the count read fails. No signature-derived value is ever served on an
entry.

READ THIS BEFORE INTERPRETING THE FIELD. As published, `provenance_gaps` is EMPTY for every
agent, and it will stay empty until enforcement begins. The ledger runs in record-only mode: it
records where each consult's extraction came from, but nothing yet refuses a mint or writes a gap
entry. Further, as of 2026-08-30 the classification step that would produce these entries has
never once executed in production — it is reached only from the accreditation-write route, which
returns 409 for a repeat `seed` write before reaching it, and every close observed since the
ledger was activated took that path. The field is published ahead of enforcement deliberately,
because the surface must exist before the first refusal can fire; it is NOT evidence that any
artifact has been examined for origin and passed. An empty `provenance_gaps` today means the
mechanism has not run, not that no gaps exist.

The four served reasons say different things and should not be read as one. `no_ledger_entry`,
`out_of_window` and `identity_mismatch` each report a limit of the instrument. Only
`caller_supplied_extraction` reports a positive finding: the ledger had data and the data
disqualified the mint.

Every served entry carries this clause inline, verbatim:

> The record can attest that this mint was declined and why. It cannot attest that the agent did
> not practise — an absent event is a limit of what the instrument can verify about this
> artifact's origin, never a finding about the agent's reasoning.

One consequence of the field participating in the record's own availability: an agent with no
virtue-domain evidence but at least one provenance-gap entry now receives a 200 rather than a
404, because a gap entry is proof the ledger genuinely examined an artifact's origin and reached
a determinate verdict. Such a record honestly carries `aggregate.level: null` and `sparse: true`.
An integration that reads a 200 as meaning "an evaluative level exists" must additionally check
`aggregate.level`. Where the gap read itself fails and no domain carries evidence, the endpoint
returns 503 rather than a 404, because a 404 is a positive claim of absence and it is not made
from a read that did not succeed.

Gap entries age out on the same 90-day clock as the events they stand in for.
```

---

## §3b — THE TRIGGER EDIT IS REQUIRED ON ALL THREE SURFACES, AND THEY DO NOT SHARE WORDING

**Corrected in drafting, by checking rather than asserting.** The first draft of this package said
only `llms.txt` needed it. A case-insensitive repo sweep found the superseded trigger on **all
three** public surfaces — and each **paraphrases** the envelope differently, so this is **not one
find/replace**. Each needs its own quoted before/after, and each must be diffed separately.
(Historical carriers — the ADR's own 2026-08-25 dated amendment, the decision log, the verbatims,
the 2026-08-25 sign-off package — quote what was live *then* and are correctly left untouched.)

**1. `website/public/llms.txt`** — comma, not semicolon; "this list", not "This disclaimer list":

> BEFORE: `…from one the server produced; this list will be updated when a structural fix is in place, and that fix will surface any artifact…`
> AFTER:  `…from one the server produced; this list will be updated when a structural fix begins enforcing which events are minted, and that fix will surface any artifact…`

**2. `website/public/.well-known/agent-card.json`** — inside the **`trust-record/v1`** extension's
`description` (NOT a new extension; the new one is §4):

> BEFORE: `…from one the server produced; this list will be updated when a structural fix is in place, and that fix will surface any artifact…`
> AFTER:  `…from one the server produced; this list will be updated when a structural fix begins enforcing which events are minted, and that fix will surface any artifact…`

**3. `website/src/app/api-docs/page.tsx`** — the shortest form; it **truncates before** the "and
that fix will surface…" clause entirely, so only the trigger is present:

> BEFORE: `…that origin is not verified at the point trust events are minted, and this list will be updated when a structural fix is in place</em>;`
> AFTER:  `…that origin is not verified at the point trust events are minted, and this list will be updated when a structural fix begins enforcing which events are minted</em>;`

**Verification for this edit specifically:** after applying, `grep -rniE 'structural fix (is|was) in
place'` across `website/public/` and `website/src/` must return **zero** hits, and the same sweep
across `operations/` and `adopted/` must return **only** the historical carriers named above. Count
the hits; do not estimate.

---

## §4 — `website/public/.well-known/agent-card.json` — proposed extension #26

Current count is **25**; this makes **26**. Verify by parsing, not by trusting this line.

```json
{
  "uri": "https://sagereasoning.com/extensions/provenance-gaps/v1",
  "description": "A trust record may carry provenance_gaps: a capped, newest-first list of accreditation writes whose submitted artifact the extraction-provenance ledger could not verify the origin of, each naming one of four closed reasons (no_ledger_entry, out_of_window, identity_mismatch, caller_supplied_extraction) and carrying a not-attestable clause inline, alongside total_provenance_gaps_count as the honest total. It is a sibling of coverage_gaps, not a widening of it: coverage_gaps is a property of the aggregate's evidence composition across an agent's history, a provenance gap is a property of one accreditation write at one moment. AS PUBLISHED THE FIELD IS EMPTY FOR EVERY AGENT AND STAYS EMPTY UNTIL ENFORCEMENT BEGINS: the ledger is record-only, nothing yet refuses a mint, and as of 2026-08-30 the classification step that would produce these entries has never executed in production. An empty provenance_gaps means the mechanism has not run, not that no gaps exist. Only caller_supplied_extraction reports a positive finding; the other three report a limit of the instrument. No signature-derived value is ever served. MEASURE — the field binds no decision.",
  "required": false
}
```

---

## §5 — `website/src/app/api-docs/page.tsx` — proposed bullets

Under the existing trust-record section:

- `provenance_gaps` (optional) — a capped, newest-first list of accreditation writes whose
  artifact origin the provenance ledger could not verify, each with one of four closed reasons and
  an inline not-attestable clause; `total_provenance_gaps_count` carries the honest total.
  **Empty for every agent until enforcement begins, and the step that populates it has not yet
  run in production** — an empty list means the mechanism has not run, not that no gaps exist.
- A record with no virtue-domain evidence but at least one provenance-gap entry returns **200**,
  not 404, and honestly carries `aggregate.level: null` with `sparse: true`. Check
  `aggregate.level` before treating a 200 as evaluative.

---

## §6 — What this package deliberately does NOT claim

- **It does not claim the fix is in place.** The amended disclaimer's commitment stays in the
  **future tense** — this is edit one of two, and edit two (the substantive description of the
  fix's actual coverage) fires at enforcement, slice 5.
- **It does not claim any artifact has been verified.** Nothing has: the field is empty and its
  producing step has never run.
- **It does not repair the 454 pre-stamp historical consults**, or any artifact signed before the
  ledger existed, or anything outside the retention window (SCOPE §11).
- **It makes no weights-tier claim.** Weights remain BLOCKED.

---

## §7 — Application order, once signed

1. Code edit committed and pushed (already done at signature time — the docs never lead).
2. Apply §3, §4, §5.
3. Verify by parsing `agent-card.json` and counting extensions; verify the llms.txt trigger-clause
   edit by quoted first/last words against the live file, **case-insensitively**, and confirm the
   superseded *"is in place"* trigger appears nowhere.
4. `npm run build`.
5. After deploy, verify by **live `curl` against production**, not by a local sweep — three of the
   four defects in the recent envelope arc were found only that way.
