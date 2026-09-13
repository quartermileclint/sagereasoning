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

