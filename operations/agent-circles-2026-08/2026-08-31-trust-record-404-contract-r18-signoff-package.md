# R18 sign-off package — the trust-record 404 contract, and the /limitations pointer

**Status: AWAITING FOUNDER SIGNATURE. Nothing below is applied.**
Authored 2026-08-31 in the post-slice-3 carried-tail session. Four edits across four
published surfaces. Per R18 no public surface changes before signature; per the slice-3
option-B precedent, once signed these ship in the SAME commit as the served-message fix,
because the flag is already live and there is no dark interval that would make "after"
meaningful.

---

## Why this exists

Slice 3 widened the trust-record 404 gate to `no examined evidence AND no servable
provenance-gap entry`, and updated all three R18 surfaces to publish both halves. The
SERVED 404 message was left naming only the first half. This session fixed the served
message — and independent PR19 review then found that the published half is itself
**overstated**, in the exact way the fix's own code comment argues against.

The gate counts only the **servable** set (`isServableProvenanceGapReason` admits the four
keys of the wording map). An agent can hold gap ROWS whose reason is not renderable and
still 404 — pinned by S2-92 and by this session's new S2-103c. So:

> published: "404 = ... AND no provenance-gap entry **exists**"
> the gate:  "404 = ... AND no provenance-gap entry **the record can surface**"

Two independent reviewers reached this separately, and one made it an explicit condition on
its approval of the served-message fix: fix the published half in the same arc, "or the
change leaves the contract mismatched in the opposite direction while claiming the mismatch
is closed."

A second, smaller defect rides along: the served message says "available to surface", a
qualifier that appears on NO published surface (zero hits across all three). Adopting the
same predicate in the contract resolves both in one edit.

---

## Edit 1 — `website/public/llms.txt` (lines ~770-775)

**Before**
```
data.schema = 'sage-trust-record/v1'. 404 = no examined trust evidence has been folded for that
agent AND no provenance-gap entry exists — declaration-class records alone do not surface a
public record (an honest miss, never a low score). A 200 therefore implies EITHER at least one
domain carries examined evidence OR the ledger reached a determinate verdict about an artifact's
origin; where only the latter holds, the record honestly carries aggregate.level null and
sparse true, so check aggregate.level before treating a 200 as evaluative.
```

**After**
```
data.schema = 'sage-trust-record/v1'. 404 = no examined trust evidence has been folded for that
agent AND no provenance-gap entry the record can surface — declaration-class records alone do
not surface a public record (an honest miss, never a low score). A 200 therefore implies EITHER
at least one domain carries examined evidence OR the ledger reached a determinate verdict whose
reason the record can surface; where only the latter holds, the record honestly carries
aggregate.level null and sparse true, so check aggregate.level before treating a 200 as
evaluative. Gap rows whose reason this version cannot render do not lift a 404 — the gate
counts what the record would actually show you, not what the store holds.
```

**Two changes, not one.** The 404 clause is corrected. The 200 clause inherited the same
error — "reached a determinate verdict" is broader than the gate, which requires a verdict
whose reason is renderable — so it is tightened in the same breath. The final sentence
states the servable-set rule plainly rather than leaving it inferable.

---

## Edit 2 — `website/public/.well-known/agent-card.json` (the `trust-record/v1` extension description, line ~446)

**Before (two fragments inside the one description string)**
```
404 = no examined trust evidence has been folded for that agent AND no provenance-gap entry exists
```
```
a 200 therefore implies EITHER examined domain evidence OR a determinate ledger verdict about an artifact's origin
```

**After**
```
404 = no examined trust evidence has been folded for that agent AND no provenance-gap entry the record can surface
```
```
a 200 therefore implies EITHER examined domain evidence OR a determinate ledger verdict whose reason the record can surface
```

No other part of that description changes. The file must re-parse and still report 26
extensions.

---

## Edit 3 — `website/src/app/api-docs/page.tsx` (lines ~864-865)

**Before**
```
404 = no examined trust evidence has been folded AND no provenance-gap entry
exists;
```

**After**
```
404 = no examined trust evidence has been folded AND no provenance-gap entry
the record can surface;
```

---

## Edit 4 — `website/src/app/limitations/page.tsx` — a NEW section

**Why here.** The 404 body's only pointer is `documentation_url`, which is
`https://sagereasoning.com/limitations` — and that page today contains ZERO mention of the
trust record or of provenance (grep-verified). A caller landing there from a 404 cannot
reach the context that makes the clause interpretable: the classification step has never
executed in production, so the clause is currently true of every agent.

`TRUST_RECORD_DOCUMENTATION_URL` is shared by ALL NINE responses on the surface, so
re-pointing the URL would be wrong — it is the surface's doc URL, not the 404's. Adding the
context to the page makes the existing pointer sufficient for every response.

**Insert before the closing "Independence matters" section:**
```
        <div>
          <h2 className="font-display text-xl font-semibold text-sage-800 mb-3">
            A trust record can say less than it appears to
          </h2>
          <p>
            The public trust record reports how an agent&rsquo;s decisions were reasoned,
            drawn from signed examination artifacts. It also carries a field named
            <em>provenance gaps</em> &mdash; examinations whose origin we could not verify.
            That field is <strong>empty for every agent today, and stays empty until
            enforcement begins.</strong> An empty list means the check that would populate
            it has never run in production. It does not mean no gaps exist.
          </p>
          <p>
            The same caution applies when the endpoint reports that it holds no record for
            an agent. That answer means we hold no examined evidence for it and no
            provenance-gap entry the record can surface. It is an honest miss, never a low
            score, and never a finding about that agent&rsquo;s reasoning.
          </p>
        </div>
```

---

## What this package deliberately does NOT change

- **The served 404 message.** Already corrected in this session's code commit; it is the
  honest side of the mismatch and the contract is being moved to match it, not the reverse.
- **The 503 body.** Its vagueness is a deliberate posture (the accreditation-503 precedent;
  enumerating internal read failures to unauthenticated callers is a reconnaissance
  surface). The distinguishing cause IS already published in llms.txt and logged
  operator-side. Recorded in-code as intentional this session rather than left to read as
  an oversight.
- **The row-cap limit.** The gate reads only `.entries` and ignores `capped`/`totalCount`,
  so the 404's absence claim is scoped to the newest 50 rows. Not reachable today (zero
  rows; classification has never executed). Named in-code with its check, carried to
  slice 5 — the two candidate fixes are a design choice with a contract consequence.
- **The extension count.** Still 26. No new extension; existing wording corrected.

## Verification required after applying

`agent-card.json` parses and reports 26 extensions; `tsc --noEmit` clean; `npm run build`
exit 0 with `/api-docs`, `/limitations` and `/api/trust-record/[agent_id]` registered;
S10 battery green; a post-deploy live `curl` against production confirming the corrected
404 clause on all three machine-readable surfaces — three of the four defects in the recent
envelope arc were found only that way.

---

**Founder signature:** ______________________  **Date:** ____________
