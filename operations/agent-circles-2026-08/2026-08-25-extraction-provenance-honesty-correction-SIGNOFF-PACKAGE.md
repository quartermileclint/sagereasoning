# R18 sign-off package — the extraction-provenance honesty correction (first edit)

**Authored 2026-08-25.** `governance`, **documents only — NOTHING IS APPLIED.** This is the wording
put to the founder for R18 sign-off. **No public surface, code file, ADR, or battery has been touched.**

**Mandated by:** the 2026-08-25 mentor ruling, Q2 — *"the correction is owed now"*, independent of and
ahead of any structural fix — as extended by its same-day **F-2** addendum. Verbatim canonical:
`2026-08-25-mentor-ruling-extraction-provenance-fix-choice-verbatim.md`.

**The founder signs off the WORDING before any surface changes.** That is the R18 gate, and it is the
reason this file exists rather than a commit.

---

## §0 — The two constraints this wording must satisfy simultaneously

1. **Q2: the first edit's wording must NOT anticipate the fix.**
2. **F-2: the coverage-gap behaviour belongs in the FIRST edit, not the second.**

**No ledger exists. Nothing is being refused today.** So a present-tense claim that refused mints
surface as coverage gaps would publish behaviour that does not exist — the exact defect class this
correction addresses. **Every F-2 sentence below is therefore future-tensed**, sitting beside the
forward commitment the mentor already specified. See the ruling record's §F-2-DRAFT.

## §0b — ORDERING (a binding precedent, not a preference)

ADR-013 §8's 2026-08-15 amendment established it explicitly: *"publishing them ahead of this code
edit is deliberately avoided — it would make a public surface claim a `does_not_attest` entry the
served envelope does not yet carry."*

1. **Edit 1 — code + ADR + pins, one commit:** `TRUST_RECORD_ENVELOPE`, the ADR-013 §8 dated
   amendment, and the battery pins land **together**.
2. **Edit 2 — the three R18 public surfaces**, after 1 is live.

**The public surfaces must not lead.**

---

## §1 — `attests[1]` (`trust-record-payload.ts:48`)

**Discipline:** the existing sentence is preserved **word-for-word** and qualified by appending — the
S2-39/S2-40 precedent. Nothing is rewritten, so any future pin on the original clause still holds.

**CURRENT (served today, inaccurate):**
> HOW the aggregated decisions were reasoned, as narrated and extracted from the submitted text:
> examination before acting, justice structure over the affected circles named in the text, passion
> diagnosis, and proximity to right reason with per-domain floors.

**PROPOSED:**
> HOW the aggregated decisions were reasoned, as narrated and extracted from the submitted text:
> examination before acting, justice structure over the affected circles named in the text, passion
> diagnosis, and proximity to right reason with per-domain floors. **This holds for consults whose
> extraction the server itself produced; it does not hold where the caller supplied the extraction —
> see the extraction-origin item in the does-not-attest list.**

## §2 — NEW `does_not_attest` entry

**PROPOSED (the mentor's three sentences, plus the F-2 clause in future tense):**
> **Extraction origin on caller-supplied consults.** The served attestation that decisions were
> reasoned as narrated and extracted from the submitted text does not hold for consults where the
> caller supplied the extraction rather than the server producing it. On those consults the
> extraction's origin is not verified at the point where trust events are minted. ⟦*optional clause —
> see §2b*⟧ This disclaimer list will be updated when a structural fix is in place; that fix will
> surface any artifact whose origin it cannot verify as a **named coverage gap on this record, never
> as silence** — an absent event will say why it is absent, and that it does not mean the agent did
> not practise.

**Traceability to the mandate** — every clause earns its place:

| Clause | Source |
|---|---|
| "does not hold for consults where the caller supplied the extraction rather than the server producing it" | Q2, mentor's substance, near-verbatim |
| "the extraction's origin is not verified at the point where trust events are minted" | Q2, mentor's substance, verbatim |
| "This disclaimer list will be updated when a structural fix is in place" | Q2, mentor's substance, verbatim |
| "named coverage gap … never as silence"; "does not mean the agent did not practise" | F-2, **future-tensed** per §0 |

## §2b — ONE ELECTION FOR THE FOUNDER

**Optional clause:** *"…and a supplied extraction is not distinguishable, at that point, from one the
server produced."*

- **For including it:** it is the mechanism fact, and stating it is the most honest form of the
  correction. It is **not a new disclosure** — `llms.txt` already documents that supplying a schema
  *"skips server-side Layer-1 extraction."*
- **Against:** it sharpens a live exploit path for which **no fix yet exists**, and the mentor's own
  specified substance did **not** include it.
- **Recommendation: include.** The whole finding is that the record misdescribes itself; a correction
  that stops short of the mechanism repeats the pattern in a smaller way. But this is a judgement
  about how much to say while a fix is pending, and it is the founder's.

## §3 — `llms.txt` (~line 759, both lists)

**Under WHAT A TRUST RECORD ATTESTS** — replace the second bullet:
> - HOW the aggregated decisions were reasoned, as narrated and extracted from the submitted
>   text (examination before acting; justice structure over the circles named in the text;
>   passion diagnosis; proximity with per-domain floors) — **for consults whose extraction the
>   server produced; not where the caller supplied it (see the extraction-origin limit below)**;

**Under WHAT IT DOES NOT ATTEST (HONEST LIMIT)** — new bullet, placed **immediately after** the
`harms omitted from the submitted text` bullet (its nearest neighbour: both are extraction-trust
limits, and a reader meeting one should meet the other):
> - extraction origin on caller-supplied consults — where the caller supplied the extraction rather
>   than the server producing it, that origin is not verified at the point trust events are minted;
>   ⟦*optional clause*⟧ this list will be updated when a structural fix is in place, and that fix
>   will surface any artifact whose origin it cannot verify as a named coverage gap, never as
>   silence — an absent event will say why, and that it does not mean the agent did not practise;

## §4 — `agent-card.json` (~line 446, the `trust-record/v1` description)

Single-line description; insert into the **does-NOT-attest enumeration**, immediately after
`harms omitted from the submitted text (the disclosed extraction-trust ceiling),`:

> `extraction origin on caller-supplied consults (where the caller supplied the extraction rather than the server producing it, that origin is not verified at the point trust events are minted; this list will be updated when a structural fix is in place, and that fix will surface any unverifiable artifact as a named coverage gap, never as silence),`

And in the same description's attests clause, `and HOW decisions were reasoned as narrated and
extracted` → `and HOW decisions were reasoned as narrated and extracted (for server-produced
extractions; not for caller-supplied ones)`.

**Check on apply:** the file must still parse, and the extension count must remain **24** (verified at
drafting, 2026-08-25) — this is an edit to an existing description, **not** a new extension.

## §5 — ADR-013 §8 dated amendment (lands in the SAME commit as §1–§2)

**PROPOSED, following the 2026-08-15 amendment's form:**
> **2026-08-25 amendment (the extraction-provenance correction; mentor ruling Q2 + F-2, first edit).**
> `attests[1]` is qualified and the does-not-attest list gains an **extraction-origin** item, because
> the served attestation that decisions were reasoned *"as narrated and extracted from the submitted
> text"* **is inaccurate today for the caller-supplied-extraction population**:
> `emitAccreditationTrustEvents` gates on signature validity only and has no extraction-provenance
> check, while `meta.layer1_source` rides outside the signed bytes, so a supplied extraction is not
> distinguishable from a server-produced one at mint time. The ruling ordered this corrected **ahead
> of and independent of any structural fix**, because no structural fix repairs already-minted events
> — the decisive ground being that a published note already directs readers to this list *"for the
> canonical condition"* while the list carries nothing on this axis: *"a reader following that
> pointer in good faith today receives a false assurance."* Per **F-2**, the item also commits, **in
> the future tense**, that the eventual fix will surface an unverifiable artifact as a **named
> coverage gap, never as silence** — the wording is deliberately forward-looking because no ledger
> exists and no mint is being refused at the time of writing. The live `TRUST_RECORD_ENVELOPE` gains
> the identical items in the **same edit**, with battery pins **S2-43/S2-44/S2-45**, because S2-37 is
> strict reference identity and cannot by itself detect a missing envelope item. **This is the FIRST
> of two edits**; the second updates the wording to the fix's actual coverage once it ships. The
> three R18 public surfaces carry the amendment **after** this code edit, never ahead of it.

## §6 — Battery pins (`s10-trust-record-surface.test.ts`; next free numbers are S2-43+)

Without these the edit is unheld — `attests[1]` has **no content pin today**, and S2-37's own comment
says it cannot detect a missing item.

```ts
assert(
  env.includes('Extraction origin on caller-supplied consults'),
  'S2-43 envelope: the extraction-origin does-not-attest item (2026-08-25 ruling Q2)',
)
assert(
  env.includes('not verified at the point where trust events are minted'),
  'S2-44 envelope: extraction-origin item names the MINT POINT, not merely the consult',
)
assert(
  env.includes('never as silence'),
  'S2-45 envelope: the F-2 commitment that an unverifiable artifact surfaces as a named coverage gap',
)
```

**Plus the pin `attests[1]` has never had** — the qualification is the load-bearing half of §1, and
nothing today would catch its removal:

```ts
assert(
  env.includes('This holds for consults whose extraction the server itself produced'),
  'S2-46 envelope: attests[1] is scoped to server-produced extractions (2026-08-25)',
)
```

**Mutation check required before commit** (the standing discipline): delete each clause in turn and
confirm the matching pin fails. A pin that passes against its own deletion is not a pin.

---

## §7 — A finding for item 2's scoping, NOT a blocker here

**F-2 names `coverage_gaps` as "the existing machinery." Verified at source 2026-08-25: that field
cannot carry what F-2 requires.**

`coverage_gaps: VirtueTrustDomain[]` (`trust-record-payload.ts:125`) is a **bare array of virtue-domain
names**, populated from `aggregate.coverageGaps` and scoped to the aggregate block. It names *which
domains lack evidence*. It has no room for the non-mint, the reason, or the does-not-mean-they-didn't-
practise clause — and a refused mint is an **event-level** fact, not a domain-level one.

So delivering F-2 will require **either** extending that field to a structured shape **or** adding a
sibling field — **either way a change to a served public payload**, with its own R18 sign-off and its
own §8 treatment. F-2's *"the existing machinery"* framing may have implied this was free. **It is
not, and the ledger's scoping should carry it as a named input.**

**This does not affect the wording above**, which only commits to the behaviour in the future tense —
which is exactly why the tense discipline matters.

---

## §8 — What sign-off authorises, and what it does not

**Authorises:** applying §1, §2 (with the §2b election), §5 and §6 as one commit; then §3 and §4 as a
second, after the first is live.

**Does NOT authorise:** any ledger work; any change to `coverage_gaps`; the second edit; anything in
route (i). **No flag, migration, credential, or endpoint behaviour changes anywhere in this package.**

**Rollback:** `git revert` either commit independently. The public surfaces can be reverted without
touching the served envelope; the reverse is the order that must not be used, per §0b.

*End of package. Nothing applied; the wording awaits founder sign-off.*
