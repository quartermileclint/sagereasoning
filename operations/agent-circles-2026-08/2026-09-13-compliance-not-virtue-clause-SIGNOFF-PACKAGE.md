# D-3 — the record-level compliance-not-virtue clause: SIGN-OFF PACKAGE

**Prepared 2026-09-13 (evening, from `date`) by session `sagereasoning-b6 [efdaf2]` under
`2026-09-14-QS2-opener-collision-and-pre-W2-items-NEXT-SESSION-PROMPT.md` Task B.**

> **NOTHING IS APPLIED.** No code, no ADR, no public surface, no pin. This package verifies the staged
> wording against source, names the surfaces and exact insertion points, and surfaces the drift and the
> one decision the founder has to make before signing. **The signature is the founder's; the
> application is its own session.**
>
> **Filename note:** the authoring prompt labelled this `2026-09-14-…`; the machine clock reads
> **Sun 13 Sep 2026 23:07 AEST**, and the file is dated from `date`.

**Staged source:** `operations/agent-circles-2026-08/2026-09-12-W2-compliance-not-virtue-clause-STAGED-R18.md`
**Mentor source (wins over every restatement):** `operations/agent-circles-2026-08/2026-08-01-mentor-consultation-agent-circles-logos-on-verbatim.md` §L7

---

## 1. Verification against source — what holds

Each checked first-hand against the code and the verbatim, not against the staged file's own account.

| # | Claim in the staged file | Checked against | Result |
|---|---|---|---|
| 1 | `COMPLIANCE_NOT_VIRTUE_CLAUSE` is byte-equal to §1's text | `website/src/lib/substrate/trust-core/enforcement-clause.ts:18–22` | **HOLDS.** Identical, including the straight apostrophes (pinned at `w2-enforcement-record.test.ts` §1.3). |
| 2 | §1's text is mentor L7 verbatim | the L7 verbatim record | **HOLDS.** Word-for-word. |
| 3 | `ENFORCEMENT_CONTEXT_MARKER` carries L5's three statements | `enforcement-clause.ts:30–33`; battery §1.2 | **HOLDS.** All three present; the battery pins each by regex. |
| 4 | The served field is named `enforcement_outcomes` | `trust-record-payload.ts:350` | **HOLDS.** With a sibling `total_enforcement_outcomes_count` (line 354). |
| 5 | The inline half is live in the composer | `trust-record-payload.ts:578–579` | **HOLDS.** Each entry carries `context_marker` and `compliance_not_virtue_clause`. |
| 6 | §3's phrase *"the fifth-circle item above"* resolves | the live `does_not_attest` array | **HOLDS.** The fifth-circle item is item **8 of 11**; a new item appends as **12**, so *"above"* is accurate. (Items 9–11 sit between them; all three predate the staging, so this is not new drift.) |
| 7 | L7 requires the clause at record level **as well as** inline | the L7 verbatim | **HOLDS, and it is an obligation, not an option:** *"This clause must appear at the record level **and** travel with enforcement-class entries inline."* Only the inline half has shipped. |

---

## 2. Drift found — one item, documentation-only

**DRIFT-1 (LOW).** The staged file's status line reads: *"The inline half (per-entry) is built dark
**on branch `w2-record-honesty`** and is battery-locked verbatim."*

**That branch state no longer holds.** The W2 machinery was **merged onto `main`** at **`0e4ea4e`**
(*"Merge W2 enforcement-record machinery onto main under a per-commit waiver"*), and `origin/main` is
at that merge's descendant today. The inline half is not on a branch — it is on `main`, deployed, and
dark behind an unset flag.

**Consequence: none for the wording.** It matters only so the founder does not go looking for a branch,
and so the application session does not re-derive the inline half from a stale premise. **No other
drift was found** — the clause text, the marker, the field names, and the cross-reference all hold.

---

## 3. ⚠ The one decision the founder must make before signing

**This is not a defect in the wording. It is a sequencing question the staged file does not settle, and
this project has ruled on its two halves four times.**

### 3.1 The fact

`enforcement_outcomes` is **structurally absent from every served payload** while
`SUBSTRATE_ENFORCEMENT_RECORD_ENABLED` is unset — which it is, everywhere
(`trust-record-payload.ts:346`: *"ABSENT entirely while SUBSTRATE_ENFORCEMENT_RECORD_ENABLED"*).
`TRUST_RECORD_ENVELOPE`, by contrast, is served on **every** trust-record read regardless of any flag.

So applying §3 today publishes, on a live public surface, an item whose first sentence reads:

> "Entries in `enforcement_outcomes` describe outcomes the infrastructure produced by blocking or
> redirecting an action (each carries its own inline clause and context marker)."

— describing entries that **cannot appear in any response until the flag is set.**

### 3.2 Why this project treats that as a live question and not a nicety

Two established disciplines meet here, both from ADR-013 §8's own amendment history:

- **2026-08-25, the extraction-provenance amendment:** the future tense is *"load-bearing and is not
  stylistic: **no provenance ledger exists and no mint is being refused at the time of writing**, so a
  present-tense claim would publish behaviour that does not exist — the precise defect class this
  amendment corrects."*
- **2026-08-30, the provenance-ledger slice-3 amendment:** its trigger was corrected *"so the record
  cannot simultaneously display a mechanism and disclaim that it exists."*

And the ordering rule is stated in four consecutive amendments (2026-08-15, 08-25, and twice on
08-30), in the same words each time: *"The three R18 public surfaces carry the amendment **after** this
code edit, never ahead of it"* — because otherwise a surface would *"claim a `does_not_attest` entry
the served envelope does not yet carry."*

**The present case is the mirror image of that rule**, one level in: the *envelope* would carry a
disclaimer about a *field* the payload does not yet carry.

### 3.3 The honest counter-argument, stated fairly

§3's sentence is **definitional, not existential** — it says what such entries describe, in the manner
of a schema note, and does not assert any exist. And **L7 obliges** the record-level clause; deferring
it indefinitely is not a neutral act either, since the obligation is already partly discharged inline
while the record level carries nothing.

### 3.4 The three options

| | Option | What it costs |
|---|---|---|
| **(a)** | **Sign and apply as worded.** | Publishes a present-tense description of a field that cannot appear. Small, and arguably definitional — but it is the pattern two prior amendments were corrected to avoid. |
| **(b)** | **Sign, with §3's first sentence reworded** to name the trigger rather than the state — the 2026-08-25 future-tense precedent. E.g. *"When enforcement-class recording is enabled, entries in `enforcement_outcomes` will describe…"*, the rest byte-identical so the clause itself is untouched. | One sentence's wording. **Preserves the mentor's verbatim clause entirely** — only the framing sentence moves. |
| **(c)** | **Sign now, apply at activation**, alongside the three R18 doc surfaces the staged §5 already defers to that session. | The record level stays empty on an obligation L7 states plainly, for however long activation takes. |

**A relevant internal inconsistency in the staged file itself, offered as evidence and not as a
recommendation:** §5 defers the `llms.txt` / `agent-card.json` / `api-docs` documentation to *"the
activation session's R18 step, **once the field can actually appear**"* — but applies no such test to
the envelope, in the same document. Whatever the founder decides, the two halves should be decided on
the same reasoning.

**This session states no preference among (a), (b) and (c).** It is an R18 wording decision and R18
wording is the founder's.

---

## 4. Surfaces and exact insertion points

Line numbers re-derived at this writing; the anchoring text is authoritative.

### 4.1 The envelope — `website/src/lib/substrate/trust-core/trust-record-payload.ts`

- **Array:** `TRUST_RECORD_ENVELOPE.does_not_attest`, opening at **line 58** (`does_not_attest: [`),
  closing at **line 148** (`],`).
- **Insertion point:** after the final item, which ends at **line 147** and begins *"Verdict
  determinism — that the same text re-examined yields the same verdict…"*. The new item becomes the
  **twelfth**.
- **Ordering matters:** appending keeps *"the fifth-circle item above"* accurate. **Do not insert it
  before item 8.**

### 4.2 The ADR — `adopted/adr/2026-07-08-sage-trust-layer.md`

- **Section 8**, *"The honest-claims envelope (R18) — what a trust record attests, and what it does
  not"*, beginning **line 101**.
- Amendments are appended as `**<date> amendment (…).**` paragraphs; the most recent is the
  2026-08-30 provenance-ledger slice-3 paragraph.
- **⚠ The staged §4 text carries a placeholder date, `2026-09-XX`.** It must be replaced with the
  actual application date at the time of the edit.

### 4.3 The three R18 public surfaces — **not in this edit**

`website/public/llms.txt`, `website/public/.well-known/agent-card.json`,
`website/src/app/api-docs/page.tsx`. **Verified: all three carry zero occurrences** of
`enforcement_outcomes` or the clause text today. Per staged §5 these are the activation session's
step. **Per the four-times-stated ordering rule they must in any case land *after* the envelope edit,
never ahead of it.**

### 4.4 The same-edit rule

The envelope item and the ADR §8 amendment land in **ONE commit**, with pins, in the same pass. This is
not a style preference — it is the requirement every prior envelope amendment followed
(2026-08-15, 08-25, 08-30 ×2), and 2026-08-15 gives the reason: `s10-trust-record-surface.test.ts`'s
`S2-37` pin is **strict reference identity** and therefore **cannot by itself detect a missing envelope
item**.

### 4.5 Pins the application session must add

Staged §6 calls for *"an S10 battery pin (the S2-series idiom)"*. Concretely:

- The battery is `website/src/lib/substrate/trust-core/__tests__/s10-trust-record-surface.test.ts`.
- **The highest pin in use is `S2-103`** — re-derived by counting, not quoted. **New pins start at
  `S2-104`.**
- **Every pin must be mutation-verified** (remove the item, confirm exactly that pin fails, restore) —
  the standing discipline in each prior amendment.
- **At minimum:** the three clause sentences present **in order** (a substring pin is order-blind; the
  `S2-64` ordering-pin idiom is the precedent), and, if option (b) is elected, a pin on the reworded
  trigger clause so it cannot silently revert to present tense.

---

## 5. A wording recommendation the staged file itself invites

Staged §3's **final sentence paraphrases** L7's closing paragraph. The staged file recommends
substituting the verbatim, *"since verbatim is the house discipline for mentor wording."*

**Verified against the L7 record — the exact sentences are:**

> The record shows what examinations demonstrated. It does not attest to what the agent is. It does not
> attest to alignment the infrastructure produced rather than the agent's reasoning constructed.

**This session concurs with the staged file's own recommendation** and notes it is a wording
substitution the founder can elect independently of §3.4's (a)/(b)/(c).

---

## 6. What is NOT owed here

- The three R18 public-surface edits (§4.3) — the activation session's.
- Anything touching `SUBSTRATE_ENFORCEMENT_RECORD_ENABLED`. **The flag stays unset**; nothing in this
  package licenses activation, and activation remains coupled to the S11 flip, which is **REFUSED**.
- The per-entry regime marker and the inline clause — **already built, merged, and battery-locked.**

---

## 7. What this session did and did not do

**Did:** read the staged wording; verify every one of its claims against `enforcement-clause.ts`,
`trust-record-payload.ts`, `w2-enforcement-record.test.ts`, the L7 verbatim, ADR-013 §8's amendment
history, and the three public surfaces; re-derive the insertion points and the next free pin number;
find one documentation drift and one sequencing question.

**Did not:** edit any file; apply any wording; touch a public surface, the ADR, the envelope, a pin, a
flag, or a credential; sign anything.

**D2 remains blocked. The S11 flip remains REFUSED. Weights remain BLOCKED. The 0h call remains the
founder's.**
