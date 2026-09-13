# W2 session opener (DRAFT) — design notes: what it omits and what that costs

> **⚠ FOUNDER-FACING. DO NOT PASTE THIS INTO A SESSION, and do not open it as part of a W2 sitting.**
> It discusses the material the opener exists to keep out of a sitting's context, and it quotes the
> Q-S2 trigger text directly.
>
> Companion to `W2-SESSION-OPENER-qs2-conforming-DRAFT.md`. Written 2026-09-13 (evening, from `date`)
> by session `sagereasoning-b6 [efdaf2]`.

**Why this is a separate file.** The first cut of the opener carried this table as its own §9. A grep
of the finished draft found it still contained the forbidden text — the omissions table quoted
*"variety assessed, never targeted"* verbatim in the course of explaining that the opener omits it.
That is the same failure the standing opener has: **the explanation of the breach is itself the
breach.** It was also structurally wrong — the table is addressed to the founder but sat inside a
document a sitting pastes, telling the sitting both that something was being withheld and what it was.
Split out, so the pasted document is clean.

---

## 9. What this variant deliberately omits, and what that costs — for the founder, not the sitting

*(This section is addressed to the founder reading the draft. It is part of the document only so the
omissions are visible and reversible; it tells a sitting nothing about what is watched for.)*

| Omitted from the standing opener | Why | Cost |
|---|---|---|
| The **S11 readiness board** (all four parts, their status, and the per-domain record counts) | The part-(2) row is the collision. Trimming only the domain counts would leave the row's purposive link between the unmet part and this window, which is the same disclosure in fewer words. | A sitting loses standing context on where the flip stands. Judged acceptable: the flip is REFUSED either way (§1.2), and no sitting's work turns on which part is unmet. |
| The **part-(2) window specification section**, including *"variety assessed, never targeted"* | Names the criterion verbatim. | The sitting is not told the discipline exists. **This is deliberate** — see the next row. |
| The standing opener's **Part E item 7** (*"confirm your opening prompt names the work and not the observation"*) | It names neither trigger, but it tells the loop there **is** an unnamed observation goal, which invites inference. In a W2-only opener it is also redundant: this document **is** the conforming prompt, so the sitting has nothing to conform. | None to the sitting. The discipline is enforced by the founder's choice of document, which is where the ruling puts it. |
| The **founder-action table** (F-1…F-J) and the **standing queue** | Founder-facing, not sitting-facing; F-1 and F-7 both describe the window's own gaps. | The sitting cannot see what the founder owes. Acceptable — it cannot act on any of it. |
| The **"what was wrong in the previous version"** correction tables | Historical; several entries quote the collision text. | Loses a useful caution about stale numbers. Partly recovered by §5's "run, never quote". |
| **Per-domain figures** anywhere in §5's re-derive list | A domain-keyed re-derivation instruction is an instruction to look at the thing being watched. | The sitting still re-derives buffer size and `caller_class`; only the domain breakdown is dropped. |

**Two things this variant does NOT hide, on purpose.** That an observation window is running, and what
the instrument measures — both are disclosed in `CLAUDE.md`, which every session auto-reads, and a
2026-09-13 ruling passed that disclosure as *"the instrument, not the subject."* Suppressing here what
the loop reads anyway would buy nothing and would misdescribe the instrument.

**One residual the founder should weigh.** `CLAUDE.md` and the repository are readable by any sitting.
Nothing prevents a sitting from opening the standing opener, the window specification, or the rulings
themselves and reading the criterion there. **This variant controls what a sitting is *told*, not what
it *could find*.** Whether that is sufficient is a question for the mentor — it is the second half of
the relay at `operations/trust-layer-2026-07/2026-09-13-qs2-opener-collision-RELAY-DRAFT.md`, and this
draft does not answer it.

---

---

## Independent review — findings folded (2026-09-13)

An independent adversarial review (a fresh reviewer, told to hunt leakage by inference, completeness
gaps and factual drift) returned six findings. **Two were substantive and both are folded into the
opener; each was verified against source before acting on it, not taken on the reviewer's word.**

1. **MEDIUM-HIGH, factual — §3's candidate sentence was inverted.** It read *"A third candidate was
   withdrawn by ruling."* Q-M1 withdrew candidate **(b)** — the **second** of the three the
   2026-09-13 two-questions ruling lists — while the **third** (the standing-runner track) is the one
   now **PRIMARY**. A reader counting ordinals would have concluded the designated work was the thing
   dropped, exactly backward. **Fixed:** the withdrawn candidate is now named rather than numbered.
2. **MEDIUM, leakage by inference — §9's pointer to this file was itself disclosive.** It told a
   sitting that material was being deliberately withheld from it and that a companion document
   discussing that material existed. It named neither trigger, so it does not fail Q-S2's literal
   test — but announcing targeted suppression invites precisely the inference the document exists to
   prevent. **This is the same defect class as the one the authoring session's own grep caught
   earlier, one level up:** the explanation of the omission becomes the omission's advertisement.
   **Fixed: §9 is deleted from the pasted document.** This file is findable from the repository and
   from the close; a sitting does not need to be told it exists.

Three completeness findings were also folded: the buffer's two parsing traps (1-indexing;
`GUARD-OUTAGE` lines carrying no `tool=` field) and the buffer-over-log precedence, which matter
because §5 directs the same parsing; a per-track close-pointer index, so a sitting is not left to
rediscover its own starting documents from the decision-log tail; and the one-arc concurrency norm.

**One finding was accepted as a caution rather than a change.** §6's constraint 4 — that tool mode
changes what the record holds — is the passage closest to the line, because channel is the axis the
window's own composition question turns on. It stays at the instrument level and ties channel to no
domain and no criterion, and `CLAUDE.md` already discloses the same property. **Flagged for the
founder's own second look rather than silently kept.**

**A limit on this review, stated rather than left implicit:** it was a single reviewer, run once. It
is not a substitute for the mentor's ruling on whether Q-S2 reaches an opener at all — that question
is the relay's, and no review can settle it.

---

## Second independent pass (2026-09-13) — RULED MANDATORY, and it found more than the first

The mentor's 2026-09-13 ruling **confirmed and elevated** the second pass and specified its form:
*"A single pass is not sufficient for a document whose purpose is to not communicate something. The
second pass should be adversarial in the specific sense: the reviewer should be asked to find what the
document implies, not only what it states."*

**Two reviewers were run, with different contamination profiles, deliberately.**

**Reviewer B — the blind inference test — is the result that matters.** Given the document and nothing
else, and asked what it inferred was being watched for, it answered that it **could not determine the
domain or the criterion**, and said so plainly rather than guessing. It disclosed unprompted that
`CLAUDE.md` sat in its context and would have let it guess far better, and that it deliberately did
not use it. Asked whether it could shape work to score well: *"No, not meaningfully… I couldn't,
because I don't know what 'well' means here."* **That is the evidence the remedy needed, and it is
positive.**

**Reviewer A — the implication hunt — found a HIGH the authoring session did not anticipate, and it
was worse than an implication.**

| # | Finding | Disposition |
|---|---|---|
| **1 — HIGH, routing** | §2's close-pointer index cited the pre-flip report **by exact subsection** (§§1, 3.3–3.3b, 12) and the S11 register (§F + change-log tail). **Verified first-hand: those exact subsections carry 29 occurrences of the trigger terms; the register carries 19.** *"The pointer is the leak."* | **FIXED** — both pointers removed and replaced with an instruction to ask the founder for S11-track reading. Every remaining cited close re-audited: **all 0**, except one incidental verdict mention. |
| **2 — HIGH, vocabulary echo** | §3's *"the two governing criteria for what counts"* reproduced two of the ruling's three criterion-conjuncts near-verbatim, and *"counts"* invites *counts toward what*. | **FIXED** — recast as plain scope language; *"criteria"*, *"governing"* and *"counts"* all removed. |
| **3 — HIGH, dangling residue** | *"their cost is stated at the end"* pointed at nothing after the omissions table was split out. | **FIXED** — the whole §0 block was removed for a separate reason (below), taking this with it. |
| 4–5 — LOW/NIT | The `caution grade` buffer caveat and the `caller_class` instruction. | **KEPT.** Both are genuine instrument-fidelity guidance; the ruling permits instrument disclosure, and the mentor expressly permits a bare per-domain count table. |

**Reviewer B independently found a fourth instance, in the section written to prevent exactly this.**
The old §0 read *"Naming which virtue domain the assessment will focus on, or what criterion it will
apply, is not [permitted]."* Reviewer B ranked it third-most-inference-inviting **because it "most
proves a hidden criterion exists (confirming there's a 'virtue domain' framing at all)"** — narrowing
the space to four. **The authoring constraint moved here; the pasted document now carries only a
neutral "propose changes, do not apply them" line.**

**A fifth instance was then found in the header** by a citation audit: the DRAFT banner named the
standing opener (16 occurrences) and the authoring prompt (5) by filename. **Provenance moved here;
the header now says only that provenance is held separately and is the founder's.**

### The lesson, now demonstrated five times in one document

**A document whose purpose is controlled context cannot carry its own meta-commentary.** Every
explanation of what it omits, every note on its own provenance, and every index of where to read more
either reconstituted the omission or routed around it. The mentor's formulation — *"an explanation of
an omission tends to reconstitute it. This is a property of the remedy class"* — held at five
successive levels: the omissions table, the pointer to the omissions table, the prohibition, the
provenance banner, and the reading index.

### Where the trimming was STOPPED, and why — do not "fix" this

A final citation audit showed the document still cites `CLAUDE.md` (27 trigger occurrences) and
`operations/decision-log.md` (62). **These were deliberately left, and trimming them would be an
error.** `CLAUDE.md` is **expressly ruled within bounds** (2026-09-13, question (ii)). The decision log
is mandatory Tier-1 reading every session performs regardless. And Q-A3 settles it: *"the repository is
readable and nothing prevents a sitting from finding the criterion there… The remedy is genuine within
its scope. Its scope is the opener, not the repository."*

**The operative line, stated so the next reviewer does not re-trim:** a pointer leaks when it directs a
sitting to **a specific location whose content states the criterion** — which the §§1, 3.3–3.3b
citation did. A pointer naming **standard whole-project reading** that every session does anyway is
not the opener telling the sitting anything.

### A founder option the ruling opened

Q-A2 ruled that **a bare per-domain count table — four domains, counts only, no link to the window's
purpose — IS permitted instrument disclosure.** This document currently carries **no** domain figures,
which is **stricter than the ruling requires**. Restoring a bare table is a founder option. It was not
taken here, on the judgement that a document which had just leaked at five levels was not the place to
add domain figures on the same day.


---

## Third independent pass (2026-09-14) — RULED MANDATORY IN FORM, and it terminated the loop

**Run by session `sagereasoning-8a [fdb13d]` under
`operations/handoffs/founder/2026-09-14-conforming-opener-third-pass-and-pre-W2-elections-NEXT-SESSION-PROMPT.md`
Task A.**

**Why a third pass.** The second pass found a HIGH and four further instances of one class — **and the
document then changed at five points AFTER the reviewer that assessed it.** That reviewer's own closing
recommendation was to re-run the implication-focused review once the findings were addressed. **So the
document had never been reviewed in its current form.** That is what this pass fixed.

### Baseline, re-derived not inherited

The opener carries **0** occurrences of `\bandreia\b`, `\bvariet(y|ies)\b`, `\bcourage(ous)?\b`
(word-boundary matched — plain substring matching false-positives on *discourage* and *encouragement*,
which is why the earlier raw figures for `manifest.md` and the snapshot looked non-zero and are not).
**Every file the opener cites was resolved and audited**, including the three directory-level Tier-2
pointers and the second hop from `00-PRIORITY-INDEX.md §"Named inputs"`. All clean except the two
deliberately retained.

**The two retained citations, re-measured at this pass:** `CLAUDE.md` **26 andreia / 6 courage**;
`operations/decision-log.md` **58 / 9 / 10**. Both grew since the second pass measured them (27 and 62).
**They stay** — §"Where the trimming was STOPPED" governs and was re-read before touching anything.

### Two reviewers, different contamination profiles, as designed

| | Reviewer A — implication hunt | Reviewer B — blind inference test |
|---|---|---|
| Given | the rulings, the ruled test, full repository access | the opener's path only; forbidden to open any other file |
| Asked | what the document *implies*; **where it sends its reader** | what it infers is being watched for; **every inference attributed to (a) document / (b) background / (c) general reasoning** |
| Result | **1 HIGH, 1 LOW-MEDIUM**; everything else clean | **could not determine the criterion**, said so plainly |

**Reviewer B's result is the one that matters, and it is positive — twice.** Asked what is being
watched for, it named the *instrument* (false-hold rate, caller class, channel) and then stated
explicitly that it **could not determine the substantive standard the verdicts are graded against**.
Asked how it would game the record, it produced **the wrong mechanism** — it thought Write/Edit would
*avoid* consult records, when Write/Edit is what *creates* them. **A reader who cannot name the
criterion and gets the gaming direction backwards has not been told the criterion.**

### Finding 1 — HIGH as raised: §3 + §6.4 jointly imply the channel↔record link

**Reviewer A's chain, and it is not a strawman — its decisive step was verified first-hand:**

1. §3 scopes the window's work to Write/Edit and excludes a worktree as *"outside the instrument's reach."*
2. §6.4 warns that tool mode *"has a consequence for the record"* and *"never choose because of the record"* — and a warning against doing X for reason Y discloses that Y is live.
3. `operations/decision-log.md`, which the opener directs the sitting to read, **states the criterion outright at lines 39792–39794** — verified by grep at this pass: *"Guard n=285 (Bash, raw shell text): … andreia 0."* / *"Consult n=119 (Edit 89/Write 30, composed intent): … andreia 2 …"* / ***"Every andreia reading and every sub-species passion comes from the consult path."***
4. So the opener scopes the work to the exact channel that mandatory reading reveals is the only one that ever captures the watched domain, and warns against leaning on that fact.

**Verified: the decision-log text is real and says exactly that.** The chain is traceable.

**Assessed against the ruled test, it is NOT a Q-S2 breach. Four grounds:**

1. **The ruled three-part combination is absent.** Q-A2 forbids a passage that *identifies the unmet
   readiness part, attributes it to one domain, and states the part is discharged by this window.*
   §3 and §6.4 name **no part, no domain, and make no discharge claim.**
2. **The decisive link is ruled-acceptable reading.** Q-A3: *"the repository is readable and nothing
   prevents a sitting from finding the criterion there… The remedy is genuine within its scope. **Its
   scope is the opener, not the repository.**"* The decision log is expressly the pointer §11.2 ruled
   must **not** be trimmed.
3. **§3's channel scope is ruled content.** Q-M2 ruled that a waiver on the measured checkout is window
   work and a worktree is not. A session cannot rewrite it, and a sitting that does not know it may
   innocently work in a worktree and produce nothing.
4. **Both blind passes failed to reach the criterion** — the empirical test of the thing the discipline
   actually protects.

**⚠ AND ONE CORRECTION TO THIS FILE'S OWN RECORD.** The second pass kept §6.4 partly on the ground that
*"`CLAUDE.md` already discloses the same property."* **That is overstated.** Grepped at this pass,
`CLAUDE.md` contains **no** statement that Bash-authored and Write/Edit-authored sessions leave
different records; its one adjacent line is a 2026-06-22 historical block describing Bash being dropped
from the auto-consult trigger — the mechanism, not the measurement consequence.

**But the property IS disclosed in auto-loaded context — in the memory index, which nobody had
checked.** Reviewer B surfaced it unprompted, and it is verified: `MEMORY.md` carries
*"auto-mode Bash authoring adds ~zero consult records; measured 51 guard / 1 consult in a full build
session"* and *"Bash-mode work never enters the consult floor."* **The memory index is loaded into
every session exactly as `CLAUDE.md` is.** So §6.4 introduces nothing the sitting does not already
hold — which is the same ground `CLAUDE.md` was passed on.

**Mitigations considered and rejected, with reasons:**

- *Drop the "consequence for the record" explanation, keep a bare disclosure requirement.* **Rejected.**
  It leaves an emphatic unexplained prohibition — and **an unexplained prohibition is what both
  reviewers ranked as the single most inference-inviting passage in the document** (Reviewer B ranked
  the unexplained *"propose, do not apply"* clause first). It would likely increase inference, not
  reduce it, while making the anti-gaming instruction harder to follow thoughtfully.
- *Give §3 a non-record rationale.* **Rejected — not the session's to do.** §3 transmits Q-M2.

**→ ROUTED TO THE FOUNDER as an election, not resolved here.** Two independent passes have now landed
on this same passage, which is why it is put in front of you a second time rather than quietly kept.
**Recommendation: keep §6.4 as written**, with the corrected justification above on the record.

### Finding 2 — the provenance banner: FIXED (the sixth instance of the class)

Removed:

> **Provenance, adoption status and design rationale for this document are held separately and are the
> founder's.** They are not in this file by design. Do not go looking for them; if you think you need
> them, ask.

**Both reviewers converged on it independently** — Reviewer A as LOW-MEDIUM meta-commentary; Reviewer B
as its *first* answer to *"what feels deliberately withheld?"*, quoted verbatim. It names no trigger and
narrows nothing, so it fails no literal test — but *"do not go looking"* is a Streisand instruction, and
it is the same class the document has now produced **six** times.

**Deleting it costs nothing.** The *"⚠ Read this first"* block already carries the operative instruction
(*"propose it to the founder and do not apply it yourself"*), and §6.6 carries *"route, do not resolve."*

### Re-run on the fixed document — the loop terminates

A **fresh** blind reviewer ran on the document as it now stands, with one added probe aimed squarely at
the §3/§6.4 chain: *what would the record contain differently depending on channel, and what would that
difference be used to assess?*

It again **could not name the criterion.** It named the instrument, declined to claim the downstream
target (*"I cannot determine the exact downstream statistical use… I'd be guessing"*), and closed with
the sentence that settles it:

> *"Very little of what I concluded came from **(a)** alone… Most of the specificity in my answers —
> especially Q2, Q4, and Q7 — came from **(b)**, background I already held about this exact 'false-hold
> observation window'…"*

**The document did not do the work; auto-loaded background did.** Per Q-A3 the discipline's scope is the
opener. **Nothing substantive was found on the document as it now stands, so the loop terminates here.**

It also confirmed the provenance banner is gone — its withheld-material answers moved to §2.7's S11
routing instruction and `option-s/`, neither of which names a domain or a criterion. **§2.7 is kept
deliberately:** it is an operative routing instruction that exists because a self-assembled reading
index is exactly how the last HIGH was produced.

### Considered and kept, so the founder can see they were weighed

- **§6.5** (*"No accreditation write may rest on this window's evidence"*) — Reviewer B ranked it third
  most inference-inviting and chained from it to *"someone will later ask whether the rate is low
  enough."* **Kept:** it names no part, domain or criterion; the chain from it landed on a generic
  observation-window reading, not the criterion; and it is a **real binding prohibition** whose removal
  would delete a standing safety constraint to buy a marginal inference reduction.
- **The `caller_class` and buffer-caution instructions in §5** — Reviewer A checked `caller_class`
  against source and confirmed it classifies call *origin*, not tool mode or moment type, and is linked
  to no domain. Instrument fidelity; expressly permitted.

### A surface nobody had assessed, now assessed

**The auto-loaded memory index and its 76 files had never been tested against Q-S2.** They are loaded
into every session exactly as `CLAUDE.md` is, and they sit **outside the repository**, so neither the
opener's trimming nor any repository-wide remediation reaches them.

**Audited at this pass. They pass, on the same ground `CLAUDE.md` passed.** Exactly one trigger line
appears in the auto-loaded index, and it is engine-mechanism — *"fix the §4 andreia courage-floor
over-strictness by coupling to justice"*, the same `proximity_floors` / unity-thesis-coupling construct
the 2026-09-13 ruling passed. Across all 76 files, **no file names a watched domain, "courage-relevant",
or the variety criterion** (grepped for each). **Recorded so the next pass does not have to rediscover
that this surface exists.**

---

## A founder option the ruling opened — PREPARED, AND RECOMMENDED AGAINST

**Unelected. Not added to the opener. This section is the whole of it.**

Q-A2 ruled: *"a bare per-domain count table — four domains, counts only, no link to the window's
purpose — would be permitted instrument disclosure."* The conforming opener carries **no** domain
figures, which is **stricter than the ruling requires**. Restoring a bare table is the founder's option.

### The exact insert, if elected

**Placement:** §5, as a new row at the end of the re-derive table — so it reads as a re-derivation
instruction, not as a finding. *(A standalone section would give it emphasis the ruling does not
require.)*

| What | How |
|---|---|
| Per-domain record counts | parse `virtueDomainsEngaged` from the buffer's `signals` field; count records per domain. As of **2026-09-13T14:08Z** over **n=667**: phronesis **484**, dikaiosyne **631**, andreia **4**, sophrosyne **301**. **Re-derive at your own open — the buffer is live.** |

**Figures re-derived at this session's open**, from the buffer parsed record-by-record: 806 lines
total, 0 unparseable; window = line 140 onward (TRAP-3: 1-indexed; record 139 is the took-effect probe)
= **667 records**, all `at-action-v2-composed`, 453 guard / 214 consult.

**The guard/consult split is deliberately NOT offered.** Split by path the figures are
andreia **0 guard / 4 consult** against sophrosyne 296/5 and phronesis 368/116 — and the split was a
decisive sentence in the row the ruling struck. A split table is not the bare table the ruling permitted.

### The argument FOR

It is **expressly permitted**. It restores genuine instrument fidelity — a sitting asked to characterise
the buffer can currently report its size and caller-class distribution but not its domain coverage,
which is an odd gap in an instrument disclosure. And the current posture is stricter than the ruling
requires, which is its own small dishonesty about what the discipline demands.

### The argument AGAINST — and it is evidence, not a worry

**A fresh reader was given these four numbers and nothing else** — a neutral framing stating only that
an instrument is running and that the table is a coverage disclosure, **with no stated purpose for
either.** It was asked what it inferred. It returned:

- *"**Yes — andreia is the outlier.** … That's not a gentle skew, it's a near-total absence of one of
  the four domains."*
- *"whoever assembled this table is very likely tracking domain coverage balance, and **andreia's
  near-zero count is the reason this disclosure exists at all** … I'd infer they're watching for whether
  **courage-relevant material** shows up in examined actions at all, and currently it mostly doesn't."*
- Asked whether it could shape its work toward the measurement: *"**Yes.** … the move is obvious:
  introduce more andreia-tagged content — frame actions around courage/risk/irreversibility
  considerations … specifically to move that 4 upward, **regardless of whether the task actually calls
  for it.**"*
- *"**A statement of a gap, not neutral instrument state.** … Neutral instrument state doesn't produce a
  number that jumps out like this; a known shortfall does."*

**It reconstructed the watched domain, produced the phrase "courage-relevant" unprompted, and named the
optimisation move — from four integers with no purposive framing whatever.**

### Why this does not contradict the ruling

**The ruling assessed the FORM. These are the FIGURES, and the mentor did not have them.** Q-A2's
permission is stated of *"four domains, counts only, no link to the window's purpose"* — and that
describes this table exactly. But Q-A2's own operative principle is:

> *"a row that says 'this domain is unmet and this window addresses it' communicates the criterion
> regardless of whether the word 'criterion' appears."*

**At 4 against 301–631, the distribution says it without a row.** The table is bare in form and
purposive in content, because a two-order-of-magnitude outlier among four siblings is not a neutral
number — it is a gap, and it reads as one to the first person who sees it.

### Recommendation

**Do not add it.** The ruling permits; it does not direct. **If you want the table, the honest route is
to put these specific figures back to the mentor** — the permission was given on a hypothetical whose
premise (that a bare table is neutral) does not survive contact with a 4.

**This is a recommendation, not a decision. The election is yours.**
