# CLOSE — Session S5: D2 scope-for-ruling (the self-only dikaiosyne domain tag)

**2026-09-06 (machine date), ~13:15 AEST. Tier `governance`, autonomous. Model `claude-opus-5`.**
Decision code `D-D2-VIRTUE-DOMAIN-TAGGING-SCOPED-FOR-RULING-2026-09-06`. HEAD at open `793e493`.

## Production state at session close

**UNCHANGED. Nothing in production moved and nothing could have.** No code, schema, flag,
credential, migration or public surface was touched. `layer2-mechanisms.ts`,
`derive-trust-events.ts` and `trust-transition.ts` were **read only**. Documents only.
**Weights remain BLOCKED. The S11 flip remains REFUSED. The 0h call remains the founder's.**

## What was produced

1. `operations/trust-layer-2026-07/2026-09-06-D2-virtue-domain-tagging-SCOPE-FOR-RULING.md`
2. `operations/trust-layer-2026-07/2026-09-06-mentor-question-D2-virtue-domain-tagging-FOR-RULING.md`
   — relay-ready, readable without the codebase
3. The decision-log entry at the physical tail
4. The register's **D2 row annotated, appended not rewritten**
5. This close; the opener's S5 row marked done, **S4 next**, and a new **F-14** (relay)

## The finding, in one paragraph

Two tests for "is dikaiosyne engaged" live in `layer2-mechanisms.ts`. One was narrowed to the
2026-07-19 ruling in August and excludes the self circle; the other has **no circle test at all**,
and it is the one whose output the trust ledger reads to mint `credential-completed` — a **positive**
event. So on a self-regarding action dikaiosyne is still tagged, and after D4 it accrues **credit**
where it previously accrued a **cap**. Four things go beyond the register: the correctly narrowed
test **already exists 307 lines above** the un-narrowed one; the register's own D2 row is **stale,
pre-Q4, datably** (row `94ba579` 2026-07-17; predicate `aac6442` 2026-08-02); **Q2 already routes**
to phronesis/sophrosyne but its docstring says it deliberately does **not remove** dikaiosyne, and
the ledger consequence was foreseen and disclosed there; and the second trigger is **non-monotone**
— it fires on 3, 2 and **0** kathekon factors but not on 1.

## The honest headline of this session is the review, not the findings

**PR19 ran as three blind reviewers on separate dimensions. Every finding was folded; none was
refuted. Two of them changed the document's character rather than its details, and both had steered
in the same direction — toward "a change is owed", which is exactly what the paste forbade.**

- **A wholly omitted on-point ruling.** The 2026-08-02 Q4-residual consultation holds that an
  accumulation surface and a verdict surface have *different governing principles* and that *"the
  answer that is right for one is wrong for the other."* `credential-completed` is an accumulation
  surface; the narrowed predicate was built for and ruled on as a **verdict** surface. It is the
  prior ruling closest to the question and it was not in front of the mentor. The reviewer showed
  how it went missing: the draft quoted that very comment block and **stopped immediately before the
  paragraph stating the distinction.**
- **A structurally asymmetric options list.** Both remedies carried a heading promising "Costs";
  one list held four costs, the other two costs and two advantages. That ranks by composition. A
  disclaimer on one bullet did not cure it — the fix was symmetric headings, which both now have.
- Also folded: M-1's **conditional** had been rendered as an asserted premise about "the reducer"
  where the mentor wrote "the implementation" (framing the mentor as partly wrong about something
  the mentor never claimed); Q2's own words had been replaced by the builder's docstring on the
  precise question being re-put; two quoted elisions both dropped the same exculpatory clause; and
  one sentence decided the question in the prose while §13 claimed it did not.
- **Consequence:** the "no change is owed" disposition — which the draft gave two lines and no
  argument — is now a developed **Option 3**, and on the sources it has the **strongest prior-ruling
  support of the three**. The material for it had been in hand and dropped.

Source fidelity separately found four errors, two of which **understated costs this document exists
to weigh** (`isDikaiosyneEngaged` is **not** exported; the suppression-collapse partition omitted
the `met`-only case), plus a `llms.txt` locus inherited from D4's row rather than re-derived
(`:418` → **`:548`**) and "four months" where the true gap is **fourteen days** — a correction
against the drafting session's own point.

## Carried

- **F-14 — the founder relays the question.** Nothing self-starts on the answer.
- **S4's leg (c) is amended and the amendment is in the opener.** It asked to confirm "S5 needs no
  engine edit". **S5 cannot confirm that and did not** — it depends on the ruling. The engine option
  would move the false-hold predicate; the **frozen 130-record buffer is insulated** (capture stores
  the already-computed field) but a **new** window would not be. So S4(c) is now: either the ruling
  has returned and excludes an engine edit, or the founder accepts starting the window with D2
  unruled. **S4's date gate (≥2026-09-08 UTC) is unchanged.**
- **D4's row still carries the `llms.txt:418` mis-citation** — left as written under the append-only
  discipline, with the correct locus recorded in D2's annotation. It travels with the words
  *"verified verbatim 2026-08-17"*, which is how a stale citation survives a re-read.
- **Not checked:** whether any agent id other than `sagereasoning:s9-loop@v1` carries
  `credential-completed` rows. A ledger query would settle it; this session had no database access.

## Rollback

`git revert` the records commit. Documents only.
