# Item 4 — Combined Scope: Trigger Legibility (IW-2 route (c) + IW-7 reflect cadence)

**Date:** 2026-08-24 · **Tier:** `governance`, scope + design proposal. **No build.** **AC7 not engaged.**
**Mandate:** run as ONE session, per `D-REFLECTIONS-EXAMINATION-FOUNDER-APPROVALS-CLOSED-2026-08-23` — *"both surfaces reduce to the same underlying question … Solving that once and applying the answer to both surfaces is cheaper than two separate sessions converging on two different answers to one problem."*
**Status:** a scope and a design proposal. **It rules on nothing.** The reflect-cadence question was explicitly named as needing *"a design proposal and a measured trial, not a direct ruling"*; route (c)'s phrase is the founder's to accept or reject. This document is the input to both.

---

## §1 — The shared question, and why the two surfaces are one

> **How does a party recognise a trigger moment without having already diagnosed the thing the trigger exists to catch?**

For **route (c)** the party is the **founder**, mid-session. For **IW-7** it is the **session itself**, mid-work. Both fail the same way if designed naively: a trigger keyed on the failure requires the diagnosis, and whoever has the diagnosis does not need the trigger.

The findings record states the trap precisely for route (c) — *"a phrase that requires the founder to have already diagnosed the failure mode before deploying it inherits the exact blind spot it exists to sidestep"* — and for IW-7 as constraint (a): *"a trigger requiring an outside party to notice the moment and ask is not structurally different from the current design, it just fires more often when someone remembers to."*

---

## §2 — The proposed answer: key on exposure, not on failure

**Do not try to detect the failure. Detect the moment of exposure** — a surface event that is present in **both** the failing and the succeeding case, cheap to observe, and requiring no diagnosis to spot. Let the trigger's *content* do the diagnostic work after it fires.

This inverts the usual design. A failure-keyed trigger needs the diagnosis before it can fire. An exposure-keyed trigger needs only an observable, and is therefore recognisable by a party who knows nothing about the failure mode.

**It has one cost, and naming it honestly is the whole design constraint.** An exposure-keyed trigger fires when nothing was wrong. That is precisely the property the record shows erodes an instrument: IW-4 / AP-5, the at-action guardrail whose ordinary output *must* be routinely and correctly discounted, and which thereby *trains* discounting. Constraint (b) says the same thing about the reflect turn.

**So the design must pay for exposure-keying with occasion-varied content.** A trigger that says the same thing every fire can be pattern-matched away after the third one. A trigger whose content is derived from *what actually happened since it last fired* cannot be discounted without being read.

> **The spine of this proposal, for both surfaces: an exposure-keyed trigger with occasion-varied content.**

---

## §3 — Route (c): the founder redirect phrase

### 3.1 The exposure event

**The AI cites a prior lesson, memory, rule, precedent, or established pattern *as a warrant*** — offering a reference where a result was asked for.

Not *any* citation. Descriptive citation is constant in this project and triggering on it would fire dozens of times a session. The narrowing that matters is **justificatory** use: the citation is doing the work of establishing that something is fine.

### 3.2 What the founder actually observes — the legibility test

The existing table's "What it looks like" column is written as **what the founder sees**, not what the failure is. In that register:

> *"I asked whether something holds. I was told what a document says."*

The founder needs no knowledge of the lesson, the code, or the failure mode — only the **shape of the answer**. That is what makes this legible where a failure-keyed trigger is not.

### 3.3 Candidate row for `/adopted/standing-protocol-cache.md` §"AI failure modes to watch for at session open"

| Pattern | What it looks like | Founder redirect phrase |
|---|---|---|
| **Lesson cited, not tested** (KG-EX2) | The AI answers a *"does this hold?"* question with a **reference instead of a result** — naming a memory, rule, PR, precedent, or "the established pattern" as the reason something is fine. The citation is usually correct; that is what makes it hard to see. Sharpest form: the AI cites a lesson **in the same breath as the work that breaks it.** | *"That's the rule — what did the check return?"* |

**Why this phrasing.** It concedes the citation (no argument about whether the rule was recalled correctly — it usually was), and asks for the one thing a citation cannot supply. It is answerable in one sentence when the check was genuinely run, and unanswerable when it was not. **It requires an action to satisfy, not a recitation** — the same property that made PR25's form the right one.

**The alternative considered and not recommended.** The findings record's own candidate, *"Have you tested that lesson against this case?"*, is close but presumes the founder identified that a lesson was cited *and* that testing is the missing step. The recommended phrase requires only noticing that a reference arrived where a result was expected.

### 3.4 Honest limits

- **It fires on correct citations.** By design — that is exposure-keying. The mitigating property is that a genuine check answers it in one sentence, so the cost of a false positive is one sentence, not a derail.
- **It depends on the founder hearing a distinction** between "the rule says X" and "I checked and found Y". That distinction is audible but not automatic, and this proposal has no evidence about how reliably it is heard in practice. **This is the residual legibility risk and it is not designed away.**
- **It is not content-varied.** A fixed phrase is the mechanism the table already uses, and the founder deploys it at their discretion rather than on a schedule — so the habituation risk falls on the founder's judgment, not on a firing rate. That is a genuine asymmetry with §4 and the reason the two surfaces need different treatments of the same spine.

---

## §4 — IW-7: reflect cadence

### 4.1 The finding that dissolves constraint (a)

Constraint (a) requires a trigger the session can recognise *without external prompting*. **The cleanest way to satisfy it is to stop asking the session to recognise anything.**

**Mechanism facts, verified first-hand this session (PR20 — present-tense claims, checked at drafting):**
- `harness/gate1-pre-decision/claude-code/hooks/hooks.json` registers **H3 as `PreToolUse` on matcher `Bash|Edit|Write|MultiEdit|NotebookEdit`** — it already fires on every consequential action.
- H3 **already carries a once-per-session cached advisory** (the S8 trust-verdict read, with per-session state files at `trustVerdictStatePath`), so "fire once per boundary, cache per session" is an established pattern in this exact hook, not a new mechanism.
- `framing-core.mjs` exports a general **`markerPath(cfg, key)`** fire-once helper.
- `close-hook.mjs` is the `Stop` hook, fire-once via a `.closed` marker, forcing one turn via `decision:block`.
- **`GATE1_REFLECT_INITIATE_MODE` already accepts `'context'`** — a soft mode that supplies `additionalContext` only, without forcing a turn.

**Consequence: IW-7 needs no new hook and no session judgment.** It needs a **boundary predicate on H3**, firing in the **already-existing soft `context` mode**. The harness recognises; the session never has to.

### 4.2 Candidate boundary predicates — all mechanical, all already visible to H3

| Predicate | Observable to H3 | Note |
|---|---|---|
| A `git commit` in a Bash command | the command string | The strongest — a commit *is* a phase boundary the project already treats as one |
| An Edit/Write under `operations/` | the file path | Records-writing marks a phase ending in this project's actual working pattern |
| N consequential actions since last fire | H3's own per-session counter | Interval-shaped; the weakest, and the one most likely to habituate |
| A subagent hand-back | H5 already fires here | Reuses existing machinery per the ruling's direction |

**Recommendation for the trial: the first two only.** They are event-shaped rather than interval-shaped, which is what the ruling's *"reusing existing machinery … is the right direction"* points at, and they correspond to boundaries this project already recognises in its own conventions.

### 4.3 Content variation — the part that pays for exposure-keying

**The mid-session fire must not reuse the close turn's text.** Constraint (b) is explicit that identical content across fires imports IW-4's erosion into the one instrument that has so far escaped it.

Proposal: **derive the content from the window since the last fire.** At a commit boundary, the fire names *what was committed* and asks about the assents in that window specifically, rather than asking a general question about the session. The close turn keeps its general form; the mid-session fires are occasion-specific and therefore not pattern-matchable.

**This is the load-bearing and least-evidenced part of the proposal.** It is the mechanism that is supposed to prevent habituation, and there is no evidence yet that it does.

### 4.4 The trial, and how it can fail honestly

A cadence change must be able to distinguish *"it worked"* from *"it fired more."* Proposed observables, in the project's own idiom:

1. **The habituation measure, and it is mechanically computable:** compare the *content* of successive reflect fires within one session. **If fire 2 and fire 3 say substantially the same thing, habituation has arrived** — regardless of what the fires are about. This is a direct measure of constraint (b) and it can fail the design, which is what makes it worth running.
2. **The coverage measure:** the findings record's own metric — the share of tool calls falling after the last reflect fire. Its baseline is **58% across 102 sessions**, a figure this document takes from that record and has **not** independently re-derived.
3. **A named null result.** If the mid-session fires produce no finding that the close turn would not have produced anyway, the design has failed and should be reverted. **Stating that in advance is what stops the trial from being a demonstration.**

### 4.5 The PR21 interaction, unresolved and left so

The findings record observes that **four of the eight harvested findings in the decision log have no reflect turn behind them** — *"the discipline is outrunning the instrument"* — and names it as the mentor's to say whether that is a problem or an acceptable division of labour. **This scope does not resolve it**, and a cadence change would change the ratio without answering the question. Flagged as an input to the ruling, not pre-answered.

---

## §5 — What this document is asking for

**For the founder:** accept, amend, or reject the §3.3 table row and its phrase. That is a founder call and needs no mentor.

**For the mentor (PR20 — the architectural surfaces this ruling would land on, named so the consequence is visible before the ruling, not after):**
- **H3 (`at-action-hook.mjs`)** — the PreToolUse hook on `Bash|Edit|Write|MultiEdit|NotebookEdit`. Adding a boundary predicate here puts reflect-turn logic into the hook that already carries the guard and the Gate-2 consult. A defect here reaches the guard path.
- **`close-hook.mjs` / `GATE1_REFLECT_INITIATE_MODE`** — the soft `context` mode already exists and would be reused rather than invented.
- **The trust record.** Mid-session reflect fires would change what the reflect surface records per session. Whether a mid-session fire should *count* the way a close fire counts is a substantive question this scope does not answer.
- **PR21** — the harvest rule's write side already outruns the instrument (§4.5).
- **The at-action advisory's own false-positive rate (IW-4)** — this proposal deliberately adds a second exposure-keyed instrument to a loop that already carries one that has eroded. The interaction between them is not modelled here.

**The question for the ruling, stated plainly:** is *exposure-keyed trigger plus occasion-varied content* the right general answer to the trigger-legibility problem — and if so, is the content-variation mechanism in §4.3 sufficient to pay for it, or does adding a second exposure-keyed instrument to this loop simply relocate the erosion IW-4 already records?

---

## §6 — Limits of this document

- **It is a scope, not a ruling, and not a build.** Nothing here is authorised to be implemented.
- **The mechanism facts in §4.1 were verified first-hand this session** by reading `hooks.json`, `at-action-hook.mjs`, `close-hook.mjs`, and `framing-core.mjs`. **The 58% coverage figure in §4.4 was not** — it is carried from the findings record and marked as such.
- **The claim that the false-hold observation window is stopped** (relevant because it is the nearest precedent for a measured trial) is taken from `CLAUDE.md` and is **recorded-but-not-independently-verified**: the flag lives in the founder's local environment, which a repo session cannot read. Noted precisely because inheriting a status claim from `CLAUDE.md` is the failure this arc's IW-3 documents.
- **Not independently reviewed.** PR19's letter does not engage a governance session.
- **§4.3 is the weakest part** and is flagged rather than smoothed: the content-variation mechanism is what the whole design rests on for habituation resistance, and it has no evidence behind it yet.
