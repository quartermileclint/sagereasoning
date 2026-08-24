# PR25 Rule Text — Founder Sign-off Package

**Date:** 2026-08-24 · **Tier:** `governance`; the amendment itself is **Elevated** under 0d-ii (any project-instructions amendment is, per the snapshot's own update discipline).
**Status:** DRAFT — awaiting founder sign-off. **Nothing has been applied to `/adopted/project-instructions-snapshot.md`.**
**Ruling being encoded:** `D-REFLECTIONS-EXAMINATION-SECOND-RULING-ROUND-FOLDED-2026-08-23` — IS-1 → encode, in PR18's form.

---

## Number verification (PR20)

Enumerated first-hand from `adopted/project-instructions-snapshot.md`: **24 `### PR` headings, PR1–PR24, contiguous, no gaps.** `PR25` appears nowhere in the repository except the session prompt proposing it. **PR25 is correct**, confirmed by enumeration rather than inherited.

## Two citation corrections found while verifying this prompt's own claims

1. **`RULING-Q2-2026-08-23` is not a ruling identifier.** It occurs in exactly three places: twice inside `2026-08-23-reflections-corpus-json-schema-design.md` as an **illustrative example value** for the schema's `id` field, and once in the session prompt, where it is presented as the citable ruling. The genuine citable record is the decision-log entry `D-REFLECTIONS-EXAMINATION-SECOND-RULING-ROUND-FOLDED-2026-08-23`. The draft below cites that.
2. **The R096 quotation differs between artifacts.** The Stage 1 extraction's R096 entry records the comment as *"VERIFIED FIRST-HAND 2026-08-18 that this is NOT a perimeter bypass"* and the self-correction as *"the prose claim preceded its evidence."* The phrase *"the assertion I wrote to defend the exclusion is what refuted it"* appears in the findings record's §1 pattern register (`:104`), not in the extraction entry. The draft below quotes only what is verified in the extraction.

---

## Draft rule text — as it would appear in the snapshot

> ### PR25 — A Verification Claim in a Code Comment Carries Its Check (NEW; 2026-08-24)
>
> **Source:** the project-reflections examination's IS-1 / IW-1 findings (`operations/reflections-examination-2026-08/2026-08-23-project-reflections-findings-record.md`, §3 IS-1 and §4 IW-1), ruled by the mentor and recorded under `D-REFLECTIONS-EXAMINATION-SECOND-RULING-ROUND-FOLDED-2026-08-23`; adopted under `D-PR25-ADOPTED-VERIFICATION-CLAIM-CARRIES-ITS-CHECK-2026-08-24`. The ruling's distinguishing reasoning, which this rule's *form* follows and not merely its content: IS-2 (the authority boundary) holds architecturally without encoding; **IS-1 demonstrably does not** — the corpus shows it failing in the presence of correct knowledge. *"A disposition that fails in the presence of its own articulation is not a stable disposition; it is a known gap wearing the appearance of one."*
>
> **Rule.** A **verification claim written into a code comment** — any assertion that a property has been checked or holds, in any wording (*verified*, *confirmed*, *proven*, *checked*, *guaranteed*, *cannot happen*, *is safe*) — is resolved, **before the commit that ships it**, into exactly one of two branches:
>
> 1. **The completed-check branch.** The comment names **the check that was actually run** and **the scope that check actually covered**. "Verified" on its own does not satisfy this, and a check named without its scope is not named: a property established on one path is written as established on that path, not on the route. The next reader must be able to re-run what the comment claims.
> 2. **The provisional branch.** The claim carries an explicit `UNVERIFIED:` or `ASSUMED:` marker naming what would establish it. **This branch is legitimate, and it is not the lesser outcome.** It exists so the rule never forces a choice between shipping a false claim and deleting a true observation — an author with no such branch routes around the rule instead of using it.
>
> **The moment and the source, in PR18's shape.** The moment is **the commit, not the sentence**. The failure this addresses is not that a provisional claim was drafted — drafting is how the reasoning is done — but that no gate stood between the provisional draft and the durable record. The source is **the staged diff**: before committing, grep it for the claim vocabulary above and resolve each hit into branch 1 or branch 2. **Citing this rule does not discharge it; only the grep and the resolution do.** Convention-only at adoption, matching PR22's posture — a pre-commit grep is the named escalation if the pilot does not hold.
>
> **Pilot scope, deliberately narrow.** Code comments only. The general case — every claim entering every durable internal artifact — was considered and **explicitly not taken**, matching PR1's single-endpoint-proof-before-rollout discipline. Extension to further artifact classes (migration rationales, records documents, briefs) is a separate election made on the pilot's evidence, not assumed by it.
>
> **Grounding.** **R096** shipped a code comment reading *"VERIFIED FIRST-HAND … that this is NOT a perimeter bypass"* about `/api/compose`, having verified one property and generalised it into a claim about the whole route — *"I never checked whether every target screens"* — and named the failure itself: *"the prose claim preceded its evidence."* That instance is the pilot class, and both branches of the rule would have caught it: branch 1 by forcing the scope into the sentence, branch 2 by making the honest partial claim writable. **R093** states the correction exactly — *"The part I'd judge differently is the order: I wrote the claim, then tested it … Reversing that order — establish, then assert — would have cost nothing and is the actual lesson."* **R089** and **R101** are why a maxim was rejected in favour of a moment-and-source rule: each **states the correct discipline in the same reflection in which it reports having broken it** — R089, *"the lesson's form is verify before reproducing, not reproduce then verify"*; R101, *"The claim is currently ahead of its basis by exactly the margin of three still-running agents."*
>
> **Rationale:** the project's most reliably exercised capability — treating an authoritative document as an impression to be tested rather than a fact to be inherited — has, until now, no rule requiring it, while five narrow rules (PR18, PR2/AC4, PR24, ES3, R18/R19) each encode it for one artifact class and nothing covers the daily working surface. A general exhortation would not close it: the corpus's evidence is that this discipline is already correctly stated by the sessions that break it, so a maxim adds a sentence to cite and citing-without-testing is the project's other central weakness (IW-2, PR23's own named failure mode). A moment-and-source rule requires an *action* to satisfy, not a recitation, which is what makes it harder to cite without applying. **One thing this rule does not claim, and the finding it comes from is explicit about it:** rules are scaffolding for sustained attention (*prosoche*), not a substitute for it (§2 SC-2). PR25 gives that attention a structural anchor at a named moment; it does not make the attention more sustained, and a reader who takes it to close IS-1 on its own has misread its source. **Engagement:** any session committing a code comment that asserts a property has been checked. Not engaged for comments that describe behaviour, name intent, or cite a decision without asserting a check.

---

## One addition beyond the ruling's literal words, surfaced rather than slipped in

The mentor's ruled form is: *a claim carries its completed check, **or** an explicit provisional marker.* Branch 1 above adds **"and the scope that check actually covered."**

**Why it is proposed:** R096's failure was not only ordering — it was scope generalisation. The comment's author *had* run a real check; the claim outran what the check covered. A rule satisfied by naming any check would have been satisfied by R096's author, and would have shipped the same comment.

**Why it is flagged:** it is a reading of "its completed check," not a quotation of the ruling. If the founder prefers the ruling's literal form, delete the four words *"and the scope that check actually covered"* and the sentence following them; the rest stands unchanged.

---

## What follows sign-off, in order

1. Apply to `adopted/project-instructions-snapshot.md` (Elevated; amendment in this file first, per its own update discipline).
2. Update `/adopted/standing-protocol-cache.md` in the **same session** — the cache-update discipline — logged as `D-CACHE-DRIFT-RESOLVED-2026-08-24`.
3. Decision-log entry `D-PR25-ADOPTED-VERIFICATION-CLAIM-CARRIES-ITS-CHECK-2026-08-24`, appended at the physical tail.
4. The founder paste-syncs the Cowork project-instructions panel; a `D-PI-SYNC-…` entry marks both surfaces synced. **That step is the founder's and is not performed by this session.**
