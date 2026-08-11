# S7 — Scope: practice activities for primal-substrate examination (human practitioners)

**Mentor heading 7.** **Execution order: 8 of 8 — but PARALLEL-SAFE: start any time after S1.**
See `00-PRIORITY-INDEX.md`.

---

> **RULED 2026-08-11 — all five open questions answered, every one in the direction this scope
> recommended, including the two that departed from precedent.** Verbatim record, which wins over every
> annotation below: `2026-08-11-mentor-ruling-scope-confirmation-verbatim.md`. **New tool, not an
> extension** (B2). **INSIDE the R20a distress perimeter** (B3) — a ruled departure from family
> precedent, with the reason recorded. **The reciprocity pathway is a distinct mode framed around the
> `praxis` failure mode** (B4). **`DIAGNOSTIC_SEQUENCE` adopted; no parallel taxonomy** (C1).
> **BLOCKED on S1 and D1** — the eleven-traits research is a founder act, not yet performed. Rulings
> folded inline below as **RULED** annotations; proposal prose kept, marked ruled rather than deleted.

## §0 Status, tier, gate

**Status: SCOPE. Nothing here licenses a build until the founder elects it and the precondition below
is met.** This is the **only item in the family that produces a shippable product change**, and the
one to open if the founder wants a build session rather than a documents session.

- **Tier:** `code-elevated` **+ schema** if a new table lands → the migration is a **founder-walked
  0c-ii Critical step**, TEST → prod with a `§VERIFY` block. (If the build extends the existing
  `passion_events` table instead, see §3.1 — the tier is the same but the blast radius differs.)
- **Depends on:** **S1** (the reframe; and S1 §2.2's finding that the examination pathway already
  exists in the corpus).
- **HARD PRECONDITION: the eleven-traits research must be committed to the repo.** The mentor's four
  examination pathways are keyed to named traits; there are eleven traits and four pathways given.
  Building the other seven — or deciding there are only four — from a summary of a taxonomy rather
  than the taxonomy is exactly the failure verbatim-wins exists to prevent.
- **Parallel-safe.** It shares no module, table, route, or surface with the IDEA loop, the trust core,
  the validation run, or any other item in this family. It queues behind nothing except S1.
- **Nothing is parked.** The mentor marks this heading wholly concurrent: *"Yes. These practice
  activities can be developed and documented now. They do not depend on cycle findings."*

---

## §1 What the mentor said

The gap:

> The existing practice activities are **oriented toward virtue aspiration** — identifying what virtue
> requires and moving toward it. They are **less well-developed for the examination of primal
> substrate** — surfacing the specific impulse, tracing it to its passion sub-species, and examining
> the false judgement underneath it.

The four pathways given:

> **Competition and hierarchy** map to **philodoxia** — love of honour — and the false judgement that
> status is a genuine good. The examination asks: what is the impression driving this competitive
> impulse? What false belief about what constitutes security or worth is underneath it?
>
> **Resource acquisition** maps to **philoplousia** — love of wealth — and the false judgement that
> possessions are genuine goods. The examination asks: what is the impression driving this acquisition
> impulse? What would be sufficient, and why is that not sufficient now?
>
> **Threat avoidance** maps to **phobos and its sub-species — agonia, timidity, shame**. The
> examination asks: what is the impression of danger? Is the danger to something genuinely good, or to
> a preferred indifferent?
>
> **Reciprocity and conditional cooperation** map to **the tension between dikaiosyne and enlightened
> self-interest**. The examination asks: am I cooperating because I recognise this person as a
> rational being to whom I have genuine obligations, or because I expect return?

The requirement:

> These examination pathways should be developed as specific practice activities — **not generic
> virtue aspiration but targeted examination of the specific primal impulse that is most active for
> the practitioner in their current context.**

And from Heading 4, which this surface implements:

> the equivalent mechanism is **the practice of naming the specific impression that generated the
> impulse. Not "I felt competitive" but "I felt competitive when X said Y, because I interpreted it as
> a threat to Z."** The specificity is the evidence of genuine examination rather than formulaic
> self-report.

---

## §2 Mechanism facts (PR20)

### §2.1 Three of the four mappings land on committed sub-species IDs; the fourth does not

`ROOT_PASSIONS` (`website/src/lib/stoic-brain.ts:311-366`), 4 roots / 25 sub-species, each sourced to
Stobaeus Ecl. / DL:

| Mentor's mapping | Committed ID | Location | Committed description |
| --- | --- | --- | --- |
| Competition & hierarchy → philodoxia | `philodoxia` (under `epithumia`) | `:323` | *"Craving for reputation as an end"* |
| Resource acquisition → philoplousia | `philoplousia` (under `epithumia`) | `:322` | *"Craving for wealth as an end"* |
| Threat avoidance → agonia / timidity / shame | `agonia` `:348`, `oknos` `:344`, `aischyne` `:345` (under `phobos`, whose six species span `:343-348`) | as cited | *"Fear of an uncertain outcome"* / *"Fear of future effort or exertion"* / *"Fear of ill-repute"* |
| Reciprocity & conditional cooperation → dikaiosyne vs enlightened self-interest | **none** | — | **not a passion sub-species** |

**The fourth mapping is structurally different and the build must not force it into the same shape.**
The first three are *"trace this impulse to its passion sub-species and examine the false judgement."*
The fourth is a **virtue-domain tension** — a question about the *ground* of an action that may be
outwardly correct either way. That is the corpus's own fourth `CAUSAL_SEQUENCE` failure mode:
*"Action from passion — externally correct behaviour driven by wrong reasons"* (`:588`).

Forcing it into the sub-species shape would either (a) invent a sub-species that is not in the corpus
— an R7 source-fidelity violation — or (b) silently drop it. **Named as Q7-b.**

### §2.2 The examination pathway already exists, committed and sourced — do not author a new one

`stoic-brain.ts:595-601`, `DIAGNOSTIC_SEQUENCE`, from `passions.json > diagnostic_use`:

1. *"Was the agent's impression of the situation distorted? If so, by which of the 4 root passions?"*
2. *"Did the agent assent to a false impression? Which false belief drove the assent?"*
3. *"Did the impulse exceed what reason warranted?"*
4. *"Which specific sub-species was operative?"*
5. *"What is the corresponding correct judgement that would replace the false one?"*

**Every one of the mentor's four pathways is this sequence entered from a different starting point.**
"What is the impression driving this competitive impulse?" is step 1. "What false belief … is
underneath it?" is step 2. "What would be sufficient?" is step 5 for philoplousia.

**PR15 consequence:** the build **applies** this sequence per trait; it does not author a parallel
taxonomy. A bespoke pathway would require justification in the decision-log entry naming this
primitive and why bespoke is preferable — and there is no visible reason it would be.

**Design consequence:** the five steps are the **five questions of the exercise**, and the trait is
the **entry point** that pre-fills step 1's framing and narrows step 4's candidate sub-species.

### §2.3 What `/passion-log` already does — and the gap, precisely

`/passion-log` + `POST /api/mentor/passion-log` → table **`passion_events`**. Fields captured today:
`passion_type`, `intensity`, `caught_before_assent`, `false_judgement`, `description?`,
`linked_journal_entry_id?`.

Mapped against `DIAGNOSTIC_SEQUENCE`:

| Step | Covered by `/passion-log`? |
| --- | --- |
| 1 — the distorted impression | **Partly** — `description` is free text, not a required, structured impression |
| 2 — the false belief driving assent | **Yes** — `false_judgement`, required |
| 3 — did the impulse exceed reason? | **No** |
| 4 — which sub-species? | **Partly** — `passion_type`; whether it reaches sub-species granularity must be confirmed at build |
| 5 — the correct judgement that replaces it | **No** — the false judgement is captured; its replacement is not |

**So the mentor's gap is real and is now precisely locatable: steps 1 (as a required, specific
impression), 3, and 5 are missing, and the *trait entry point* is missing entirely.** That is a much
better-defined build than "develop practice activities."

**One live coupling the build must know about:** `/api/mentor/passion-log`'s save path is wired into
the **Phase-2 in-session practice suggestion** (Step M mapping — the engine's reading drives every
sub-species row). So `passion_events` is not an isolated table; it feeds a live, mentor-vetted
suggestion surface. **This is the strongest argument for a new table rather than an extension** (§3.1).

### §2.4 The build pattern is fixed by seven shipped precedents

The Remaining-Principles family (`/premeditatio`, `/hupexairesis`, `/oikeiosis` extension,
`/view-from-above`, `/morning`, `/sage-compass`, `/logos`) established a pattern this build follows
exactly:

- `website/src/app/<name>/page.tsx` + `layout.tsx`
- `website/src/app/api/mentor/<name>/route.ts` — user-JWT auth via `requireAuth`,
  `checkRateLimit(RATE_LIMITS.…)`, `validateTextLength(…, TEXT_LIMITS.…)`; **POST + PATCH
  revise-in-place** (the PR-3 affordance every sibling now has)
- `website/supabase-<name>-migration.sql` — additive, idempotent, reversible via a DROP at the foot;
  user-scoped RLS with 5 policies; FK → `auth.users` `ON DELETE CASCADE`
- `website/src/app/api/mentor/<name>/__tests__/human-practitioner-boundary.test.ts`
- Data-rights wiring: the table added to `/api/user/access`, `/api/user/export`, `/api/user/delete`
- `SupportFooter` on the page (R20a §4 crisis exit)

**The measurement-neutrality discipline, verbatim from the shipped `/sage-compass` route:**

> The four cardinal virtues, in plain language. Defined **LOCALLY on purpose**: this human surface
> must not import the engine's virtue-domain vocabulary (the reflect engine's proximity-domains
> module, the Stoic-brain knowledge base, or any substrate module), which would put it inside the
> `/api/reason` import graph and break the measurement-neutrality guarantee.

**This creates the single sharpest design constraint in this build**, and it is a real tension:

- The passion sub-species vocabulary the exercise needs **is** in `stoic-brain.ts`.
- `stoic-brain.ts` is imported **directly** by `api/guardrail/route.ts` **and** `guardrail-sandwich.ts`
  — two measured surfaces. **Reading it is permitted; editing it is forbidden.**
- The shipped precedent for a human surface that needs engine-adjacent vocabulary is to **define it
  locally** and pin the boundary with a test.

**So: the 25 sub-species must be transcribed locally into the route (or a local, zero-import module),
not imported.** That is duplication, and it is the correct call under the shipped precedent — but it
introduces a **drift risk** the siblings did not have, because a locally-copied 25-item vocabulary can
silently diverge from the corpus. **Named as Q7-c**, with a recommended mitigation.

### §2.5 ⚠ R20a / AC5 — this family is closer to the distress perimeter than any sibling

Every Remaining-Principles tool sits **outside** the R20a human-distress perimeter by precedent,
carrying `SupportFooter` as the crisis exit. **This one is different in kind, and the difference should
be examined rather than inherited.**

The four pathways deliberately elicit, in the practitioner's own words:

- **shame** (`aischyne` — *"fear of ill-repute"*), an explicitly named sub-species of the exercise;
- **fear of an uncertain outcome** (`agonia`);
- and the family sits beside `lupe`'s sub-species — `penthos` (grief), `phthonos` (envy),
  `zelotypia` (jealousy), `achos` (*"distress that weighs on the mind without clear object"*).

A tool that asks a practitioner to write, specifically and at length, about their shame or their
anxiety — and whose whole design premise is that they should **not** suppress it — is materially
closer to the perimeter than a tool asking which virtue a decision engages.

**AC5 requires a recorded decision, not an inherited default.** The precedent is real (`/view-from-above`
handles grief and sits outside), and the `/api/score-conversation` eleventh-route wiring (live since
2026-07-07) is the pattern if inclusion is elected: a route-level `enforceDistressCheck` over the
submitted free text **before any LLM call**, with the human-audience rendering.

**The AI's recommendation: put this to the mentor explicitly (Q7-d), and default to *inside* the
perimeter unless ruled otherwise.** The cost of a false positive is a crisis-resource redirect on a
non-distressed practitioner; the cost of a false negative is a practitioner writing about shame into a
tool that does not notice. The asymmetry is not close.

---

## §3 The build

### §3.1 The central decision: extend `/passion-log`, or a new tool?

**Not decided here. Q7-a.** Both are viable; the trade-off is real.

| | Extend `/passion-log` | New tool (e.g. `/impulse`) |
| --- | --- | --- |
| Coherence | One passion surface; no fragmentation | Two tools that both examine impulses |
| Risk | **`passion_events` feeds the live Phase-2 suggestion surface** (§2.3) — additive columns are safe, but a changed required-field set touches a live, mentor-vetted mapping | Zero coupling; independently revertable, matching every sibling's "reverts independently" property |
| Migration | Additive columns on a live table | New table, the exact sibling shape |
| Trait entry point | Retrofits onto an existing flow | Designed in from the start |
| Precedent | — | **Seven shipped siblings**, all standalone |

**AI's recommendation: a new tool**, on the strength of the live-coupling risk and the independent-
revert property that every sibling has and that this family's discipline depends on — with a link
between the two surfaces (the `/passion-log` ↔ `/impulse` relationship stated in page prose, the way
`/sage-compass` links `/passion-log` **conceptually, with no code coupling**).

### §3.2 The exercise shape

**Entry point: the trait.** The practitioner names which primal impulse is most active for them right
now — the mentor's *"targeted examination of the specific primal impulse that is most active for the
practitioner in their current context."* The trait list comes from the committed research (**precondition**).

**Then `DIAGNOSTIC_SEQUENCE`, as five questions** (§2.2), with the trait narrowing step 4's candidates:

1. **The specific impression** — required, and this is where Heading 4's specificity requirement lands.
   The field's own prompt should carry the mentor's own example: not *"I felt competitive"* but
   *"I felt competitive when X said Y, because I interpreted it as a threat to Z."*
2. **The false belief** that drove the assent.
3. **Did the impulse exceed what reason warranted?**
4. **Which sub-species was operative** — selected by the practitioner from the locally-defined
   vocabulary, narrowed by the trait.
5. **The correct judgement that would replace the false one.**

**The framing the mentor requires, in the page's own copy:** noticing the impulse *"is not failing —
they are generating examination material"* (S1's reframe, made visible at the point of use rather than
left in a framing document).

### §3.3 The gate — at most one, classification-only

Every gated sibling has **exactly one** classification-only gate, deterministic pre-authored messages,
no LLM-authored commentary, fail-open, cached, `MODEL_FAST`.

**Recommendation:** gate **step 1 (the impression)** on **specificity** — a two-value
`specific | general` classification, because specificity is precisely what Heading 4 names as *"the
evidence of genuine examination rather than formulaic self-report."* The gate is the mentor's own
criterion, applied at the only point in the family where it can be applied to a human.

**What the gate must NOT touch:** steps 2–5. In particular it must never classify, score, or grade the
**correct judgement** (step 5) — that would make the tool an assessor of the practitioner's philosophy,
which no sibling does and which `/sage-compass`'s binding not-a-verdict constraint rules out by
analogy. **Pinned in the boundary test, argument-position-verified** (the `/sage-compass` lesson: a pin
that checks only a parameter *name* is defeated by a rename-and-pass-positionally; pin the call-site
arguments and mutation-verify).

### §3.4 Deliverables

1. `website/src/app/<name>/page.tsx` + `layout.tsx`, with `SupportFooter`
2. `website/src/app/api/mentor/<name>/route.ts` — POST + PATCH revise-in-place
3. `website/supabase-<name>-migration.sql` — additive, idempotent, reversible, RLS + 5 policies,
   FK → `auth.users` ON DELETE CASCADE, CHECKs on every enum
4. `website/src/app/api/mentor/<name>/__tests__/human-practitioner-boundary.test.ts`
5. Data-rights wiring in `/api/user/access`, `/api/user/export`, `/api/user/delete`
6. Nav wiring — the Practice dropdown + the footer Practice column (the 2026-07-24 navigation audit
   found twelve orphaned pages; do not create a thirteenth)
7. If R20a inclusion is ruled (§2.5): the route-level `enforceDistressCheck`, behind its own flag,
   following the `/api/score-conversation` pattern

---

## §4 The parked half

**None.** The mentor marks this heading wholly concurrent.

The **agent-side** analogue — surfacing the functional analogue of primal impulse in the ATRF's
pre-task reasoning (S1's second consequence) — is **not** part of this build and belongs to the ATRF
scoping session, post-validation-run.

---

## §5 Open questions for the mentor

**Q7-a — Extend `/passion-log`, or a new tool?** (§3.1.) Recommendation: **new tool**, for the
live-coupling risk and the independent-revert property, with a conceptual link and no code coupling.

**Q7-b — How is the fourth pathway (reciprocity) shaped, given it is not a passion sub-species?**
(§2.1.) Options: (i) a distinct mode within the same tool with its own question set — the corpus's own
*"externally correct behaviour driven by wrong reasons"* is its natural home; (ii) route it to
`/oikeiosis`'s circle-extension exercise, which already asks what is owed to whom; (iii) omit from v1
and name it. Recommendation: **(i)**, because the mentor's question — *"am I cooperating because I
recognise this person as a rational being … or because I expect return?"* — is a genuine examination
that no existing tool asks.

**Q7-c — Locally-duplicated sub-species vocabulary: accepted, with what mitigation?** (§2.4.) The
shipped precedent requires local definition; local definition risks silent drift from the corpus.
Recommendation: **accept the duplication** (the precedent is load-bearing and the guard is the git
byte-identity discipline, not import purity) **and add a drift pin** to the boundary test — assert the
local IDs are a subset of the corpus's, by reading `stoic-brain.ts` **as text** in the test, not by
importing it. The test already reads source text and imports nothing; this stays inside that property.

**Q7-d — Does this tool sit inside or outside the R20a distress perimeter?** (§2.5.) **The AI
recommends inside**, contrary to the family's precedent, because the exercise deliberately elicits
shame, anxiety, grief-adjacent, and envy-adjacent material by design. AC5 requires this be a recorded
decision either way.

**Q7-e — Do the other seven traits get pathways in v1?** The mentor gives four of eleven.
Recommendation: **build the four given**, and design the trait list so the remaining seven can be added
without a schema change (an open vocabulary with a recorded closure decision — the same rule S5 §2.4
proposes for participant classes).

---

### §5-RULED — the 2026-08-11 rulings

> **RULED (Q7-a / B2) — NEW TOOL, not an extension of `/passion-log`.** *"The live-coupling risk is
> real. The Step M mapping means any schema change to `passion_events` touches the live Phase-2
> in-session practice suggestion. The independent-revert property is a design principle the shipped
> siblings all carry. The `/sage-compass` precedent is the correct model: **conceptual link in page
> prose, no code coupling.** Ruling: new tool … The build proceeds on this basis."*
> ⇒ **§3.1's decision is settled. `passion_events` is not touched. The new table follows the sibling
> shape and reverts independently.**

> **RULED (Q7-d / B3) — INSIDE the R20a distress perimeter. A ruled departure from family precedent.**
> *"This tool is different in kind. It deliberately elicits shame and agonia in the practitioner's own
> words, beside grief, envy, and jealousy. The design premise is that the practitioner should not
> suppress this material — **which means the tool is doing exactly what the perimeter exists to catch
> when it fires genuinely.** … The asymmetry favours inclusion. Ruling: inside the perimeter. The
> `/api/score-conversation` `enforceDistressCheck` pattern is the implementation precedent. **AC5
> records this as a departure from family precedent, with the reason stated.**"*
>
> **Build consequences, now mandatory rather than optional:**
> - a route-level `await enforceDistressCheck(...)` over the submitted free text **before any LLM
>   call**, following `/api/score-conversation`'s shape (`website/src/lib/score-conversation-r20a.ts`
>   is the reference implementation, incl. its per-field caps, mild-escalation check, and
>   fail-open-to-mild posture);
> - the human-audience crisis rendering (the developer form is unreachable on a cookie-session human
>   route);
> - the **R20a perimeter registry count changes.** **CORRECTED 2026-08-11 — this document originally
>   said "11 route-level + 2 substrate-gate = 13", inherited from CLAUDE.md, which is stale.** Counted
>   first-hand in the authoritative registry (`website/src/lib/__tests__/r20a-invocation-guard.test.ts`,
>   `HUMAN_FACING_POST_ROUTES` + `SUBSTRATE_GATE_ROUTES`): **13 route-level + 2 substrate-gate = 15**.
>   Both Stoa routes joined on 2026-08-03 (`mentor/stoa` twelfth, `mentor/stoa/draft-reflect`
>   thirteenth) after CLAUDE.md's last refresh of that line. **This tool would be the FOURTEENTH
>   route-level entry.** The registry guard must be updated **in the same PR**, or it fails;
> - **AC5 requires the departure and its reason to be recorded in the route and in the decision-log
>   entry.** This is not a formality: every sibling records the opposite decision, so a future reader
>   will otherwise read this one as an error.
> - The flag follows the sibling pattern (`SUBSTRATE_<NAME>_R20A_ENABLED`), making activation its own
>   founder-walked step with a byte-identical flag-off path.

> **RULED (Q7-b / B4) — distinct mode within the same tool, framed around the `praxis` failure mode.**
> *"Ruling: **distinct mode within the same tool**, with its own question set, entered from the
> reciprocity trait and framed around the praxis failure mode. **Not routed to `/oikeiosis` in v1** —
> the examination is about the ground of the action, which belongs in this tool's scope. **Not
> omitted.**"*
>
> **The mentor supplied the question set** — build to it verbatim, do not re-author:
> 1. *"is this cooperation grounded in recognition of the other as a rational being, or in expected
>    return?"*
> 2. *"What would the action look like if the expected return were removed?"*
>
> The second question is the discriminating one and has no analogue in the other three pathways — it is
> a counterfactual, not a diagnosis. The mode's shape therefore genuinely differs from the
> `DIAGNOSTIC_SEQUENCE` three, exactly as §2.1 anticipated; the corpus anchor is the committed `praxis`
> failure mode, *"externally correct behaviour driven by wrong reasons"* (`stoic-brain.ts:588`).

> **RULED (Q7-c / C12) — accept the duplication, add the drift pin.** *"The boundary test reads
> `stoic-brain.ts` as text — imports nothing — and asserts the local IDs are a subset. Silent drift is
> the risk; the pin catches it without coupling."*

> **RULED (Q7-e / C13) — four traits in v1, extensible vocabulary.** *"Build the four given traits in
> v1. Design the trait vocabulary so the remaining seven can be added without a schema change. The four
> are: competition/hierarchy → philodoxia; resource acquisition → philoplousia; threat avoidance →
> phobos sub-species; reciprocity → praxis failure mode (distinct mode, B4 ruling above)."*
> Note this inherits S5's C17 rule: the trait vocabulary is **built extensible**, or its closure is a
> **recorded decision** rather than a default.

> **RULED (C1 / A1) — `DIAGNOSTIC_SEQUENCE` is the pathway; no parallel taxonomy is licensed.** The
> five questions of §3.2 are the committed sequence (`stoic-brain.ts:595-601`) entered from a trait
> starting point — for three of the four modes. The fourth (reciprocity) has its own ruled question set
> per B4.

---

## §6 Build-success criteria

1. **Measurement neutrality holds.** No file in the `/api/reason` or `/api/guardrail` import graph is
   edited. `stoic-brain.ts` is **not edited** — it is imported directly by `api/guardrail/route.ts`
   and `guardrail-sandwich.ts`. Verified by the git byte-identity check at commit, not by inspection.
2. **The boundary test passes and is non-vacuous.** Every pin mutation-verified live, in both
   directions. Specifically: the pin that step 5 is never classified must survive a
   rename-and-pass-positionally mutation (the `/sage-compass` lesson).
3. **The five questions are `DIAGNOSTIC_SEQUENCE`, not a new taxonomy** (§2.2). If the build departs
   from it, the decision-log entry names the primitive and justifies the departure (PR15).
4. **Sub-species IDs match the corpus exactly** — verified by the drift pin (Q7-c), not by eye. R7
   source fidelity: no invented sub-species.
5. **Migration** additive, idempotent, reversible; RLS verified by query on TEST **and** prod; FK
   cascade confirmed (`confdeltype='c'`); every enum CHECKed. Founder-walked.
6. **Data-rights wiring verified by query**, not assumption, on both environments.
7. **The page is reachable from nav** — no thirteenth orphan.
8. **R20a decision recorded** in the route and in the decision-log entry, whichever way it goes.
9. **PR19 independent adversarial review before the migration is walked.** If an account limit forces
   a first-hand fallback, that is disclosed and an independent re-run follows — the AE-2 lesson.
10. **The tool reverts independently** — self-contained test, no shared imports, one migration to drop.

---

## §7 Corrections carried

1. **The examination pathway already exists** as `DIAGNOSTIC_SEQUENCE` (§2.2) — the synthesis reads as
   though the pathways must be authored; they must be **applied**. This is the single largest change
   to how this heading should be built.
2. **The fourth mapping is not a passion sub-species** (§2.1) and must not be forced into the same
   shape — doing so would either invent a sub-species (R7 violation) or drop the pathway.
3. **The gap is more precisely locatable than "less well-developed"** — `/passion-log` covers steps 2
   and partly 1 and 4; steps 3 and 5 and the trait entry point are absent (§2.3).
4. **`passion_events` feeds a live suggestion surface** (§2.3) — the strongest argument against
   extending it in place.
5. **The vocabulary must be duplicated locally, not imported** (§2.4) — a real constraint the synthesis
   does not anticipate, with a real drift risk and a proposed mitigation.
6. **R20a is a live AC5 question here, not an inherited default** (§2.5) — this tool elicits shame and
   anxiety by design, unlike any sibling.
7. **The eleven-traits research is a hard precondition** — four of eleven pathways are given; the trait
   list itself comes from a document not in the repo.

---

## §8 Rollback

`git revert` the build PR **+** `DROP TABLE public.<name>_entries;` (the migration's own footer). If
the build extends `passion_events` instead, rollback is `git revert` **+** `ALTER TABLE … DROP COLUMN`
per added column — safe because every added column is additive and nullable, and the live Phase-2
suggestion path reads none of them. Either way the tool is self-contained and reverts without touching
any sibling.
