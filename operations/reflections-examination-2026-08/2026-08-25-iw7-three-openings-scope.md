# IW-7's three openings — scope, all three, in one document

**Date:** 2026-08-25 · **Tier:** `governance`, scope + design proposal. **No build.** **AC7 not engaged.**
**Predecessor:** `operations/reflections-examination-2026-08/2026-08-24-item4-trigger-legibility-combined-scope.md`
§6a, folding `D-ITEM4-MENTOR-RULING-EXPOSURE-KEYED-TRIGGER-REJECTED-2026-08-24`. That document's §4
design (a boundary predicate on H3, firing a new mid-session reflect turn) was **ruled against**; §6a
recorded three openings, **none scoped**. This document scopes all three, per the founder's explicit
election.

**Status: a scope, not a ruling, and not a build.** Nothing here is authorised to ship. The prior
document's own precedent is the reason: a design proposal of this exact shape was drafted, found
architecturally consequential, put to the mentor per PR20, and rejected — so this document is put
through the same discipline rather than skipped, even though what it proposes reuses existing
machinery instead of adding a new instrument.

**[RULED 2026-08-25.]** §2 (opening 2) is **HELD** — not rejected on the frequency grounds the item-4
ruling turned on, but blocked on the flagged sparse-extraction-default design gap this document itself
surfaced and left open: the consult's `is_kathekon` output cannot currently distinguish a genuine
adverse verdict from instrument silence, and arming a trigger on an unfiltered reading would be "noise,"
not a trigger. §3 (opening 3) is **RULED FOR, in two phases** — phase one (vary the close turn's
content on a guard-CAUTION signal only) is cleared now; phase two (extending the condition to consult
verdicts) is gated on the same signal-quality gap that holds §2. §1 is unaffected (a measurement task,
not a design). Verbatim:
`operations/reflections-examination-2026-08/2026-08-25-mentor-ruling-iw7-three-openings-verbatim.md`.
**This ruling licenses no code in this session** — see the close for why.

---

## §0 — Mechanism facts, verified first-hand this session (PR20)

Read directly: `harness/gate1-pre-decision/claude-code/hooks/at-action-hook.mjs` (764 lines),
`close-hook.mjs` (447 lines), `hooks.json`. Not inherited from the prior scope document or from
`CLAUDE.md`.

**H3 (`at-action-hook.mjs`) actually runs two separable things on every consequential action
(`Bash|Edit|Write|MultiEdit|NotebookEdit`), and they are gated differently:**

1. **`runGuard`** — fires only on the guard's own irreversible-action set (a narrow, named allowlist
   of destructive command shapes; not every action). Returns `do_not_proceed` (blocks), a caution
   (`recommendation !== "proceed"`, allows with a warning), or a clean `proceed` (allows silently).
2. **`runConsult`** — the Gate-2 `/api/reason` consult, **deduped per distinct decision**
   (`decisionKey = sessionId|consult|action.signature`) — it does not fire on every action, only once
   per distinct decision the session makes.

**A structured three-sub-question elicitation ALREADY EXISTS, and it already satisfies "non-exposure-
keyed."** `runGuard`'s CAUTION branch (line 531-561) — and *only* that branch, not the clean-proceed
branch and not the block branch — writes an elicitation marker and injects
`renderGate2ElicitationBlock(action.summary)` into the same context that carries the caution warning:

```
[SageReasoning Gate 2 — structured elicitation at a consequential action]
Before proceeding with: <action.summary, truncated to 200 chars>
Answer the three examination sub-questions briefly, in your own words, in this conversation
(there is nothing to call and nothing to send):
1. Prior preference — had you formed a preference for this action BEFORE examining it?
2. Stake — do you have a stake in this outcome (efficiency, completion, avoiding rework,
   appearing capable)? Name it if so.
3. Resolution — was the resolution reached before the examination completed, or did the
   examination genuinely precede the decision?
Your answers are captured out-of-band and examined deterministically...
```

The answer is captured out-of-band at the *next* hook firing (`maybeFlushElicitation`, flushed via a
one-shot marker file) and sent to the discernment route for deterministic examination
(`passionSignaturePresent`), which can bump the session's depth floor. **This already has occasion-
varied content** (the action summary is interpolated), **already fires on a condition narrower and
more specific than action-class membership** (a guard CAUTION, not "any Bash/Edit/Write"), and
**already reuses existing machinery** rather than being a new hook. It is gated on
`discernmentEnabled(cfg, dcfg)` — un-provisioned installs never fire it, silently and honestly.

**Close-hook's reflect invitation is a single, fully invariant string.** `renderReflectInvitation()`
(line 255-264) returns the same five-part prompt (impressions, assent/withheld, actions chosen,
what you'd judge differently, purpose served) every time, for every session, with **zero interpolated
session-specific content**. `GATE1_REFLECT_INITIATE_MODE` (`block` default / `context` soft / `off`)
governs *whether* and *how forcefully* it fires — never *what it says*.

---

## §1 — Opening 1: a non-exposure-keyed trigger

**The honest finding: this substantially already exists, and the open question is narrower than the
opening implied.** The elicitation described in §0 IS a non-exposure-keyed trigger — it is gated on
guard-CAUTION (a genuine, if partial, risk signal), not on the mere fact that an action happened. It
already satisfies constraint (a) (the harness recognises the moment, the session does not) and already
carries occasion-varied content (§4.3's requirement, already met on this path, not merely proposed
for it).

**What is actually open:** whether the guard-CAUTION gate is *wide enough* to matter. The guard fires
only on a narrow, deliberately conservative set of irreversible command shapes (`rm -rf` variants,
force-pushes, and similar — the D-A/D-F irreversible allowlist). Most consequential actions in an
ordinary session — edits, non-destructive writes, ordinary Bash — never reach `runGuard`'s CAUTION
branch at all, because the guard itself never runs on them (H3 only calls `runGuard` on the irreversible
set; everything else goes through `runConsult` alone). So the elicitation, as it exists today, likely
fires far too rarely to move the coverage figure (§4.4's cited 58%, not independently re-derived here
either) in any noticeable way. **This is not a new design; it is a measurement question about an
existing mechanism**, and it is answerable without a mentor ruling: instrument the existing capture
log (`ELICIT` lines already written to `honestLog`) and count firings against total consequential
actions over a representative window. No code change is required to answer it — the counting can run
against the harness's own existing logs.

**[Measured 2026-08-25.]** Run against the live `~/.sage-gate1/gate1.log` (28,406 lines,
2026-07-12–2026-08-25, exhaustive accounting). The inference above was correct and sharper than
stated: completed elicitations reach only **12.9%** of the guard cautions that arm them and **2.1%**
of total decision volume. A second, unanticipated finding: the completion rate is *declining* across
the window (29.2% in July → 7.0% in August), driven almost entirely by the discernment route's own
503 rate more than doubling — an infrastructure fact, not a trigger-design one. Full report:
`operations/reflections-examination-2026-08/2026-08-25-iw7-opening1-measurement.md`.

**If that count shows the existing gate is too narrow, the honest next question is not "add a new
trigger" — it is "widen this one's gate," which is §2.**

---

## §2 — Opening 2: a structural intervention on the Gate-2 consult [HELD, 2026-08-25; RECONFIRMED HELD 2026-08-25]

**[Follow-up ruling, 2026-08-25.]** The signal-quality gap was scoped
(`operations/reflections-examination-2026-08/2026-08-25-signal-quality-gap-scope.md`) and a derivable,
zero-server-change confidence proxy was found (cross-referencing the kathekon-empty reading against
whether the extraction's *other* arrays are also empty). **The mentor confirmed the proxy is real but
ruled it insufficient for opening 2 specifically**, because a confidence proxy at opening 2's firing
rate is *"a rate-limiter on false positives that still passes false positives through"* — the
condition this document's §4 named (a genuine second-pass check on the kathekon dimension, or a new
wire field) is not satisfied by a proxy built from adjacent dimensions. **Opening 2 remains HELD.**
Verbatim: `2026-08-25-mentor-ruling-signal-quality-gap-verbatim.md`.

**Ruled: hold.** Not on the frequency grounds this section itself anticipated as the likely objection
— the mentor named the frequency concern as real but secondary. **What blocks this opening is the
flagged design detail below being genuinely unresolved**, not resolvable by qualification alone: the
Gate-2 consult's output does not currently carry a signal-quality indicator distinguishing a genuine
adverse `is_kathekon`/proximity reading from a sparse-extraction default. Arming a trigger on an
unfiltered reading "does not improve on the current state; it adds firing events that carry no
signal." **Reopen when** the consult's output carries that signal, or the hook gains an independent
basis for filtering sparse defaults — at which point the frequency question, left open here, gets
ruled on with actual firing-rate data. Verbatim above.

**This is where opening 1 and opening 2 converge, and the convergence is itself the finding.** The
ruling's opening 2 asks whether the Gate-2 consult's own design — not a second instrument — is the
right target if the reflect behaviour sought isn't showing up. Reading the code answers this directly:
**the elicitation is currently wired to the GUARD's verdict only, never to the CONSULT's verdict.**
`runConsult` (the deduped, broader-reaching path — it fires on every distinct decision, not only the
irreversible-action subset) never touches `elicitMarkerPath` or `renderGate2ElicitationBlock` at all.

**The proposed structural change, and it is genuinely structural rather than a new instrument:** arm
the *same* elicitation marker from `runConsult`'s own verdict, under a condition analogous to the
guard's CAUTION gate — for example, a consult returning `katorthoma_proximity` at `reflexive` or
`habitual`. **Not** a bare `is_kathekon === false` alone: this session's own opening frame carried
exactly that reading (`is_kathekon=false — quality=contrary — No kathekon factors were extracted`),
which the harness's own documentation elsewhere names as a sparse-extraction default rather than a
genuine adverse finding — arming on that signal without qualification would likely fire on ordinary
governance-only sessions like this one, reproducing the exact false-positive class Letter V's whole
subject is about, in a new location. Distinguishing a genuine adverse `is_kathekon` reading from a
sparse-default one is exactly the kind of design detail this scope should surface rather than paper
over, and it is not resolved here. This:

- **Adds no new hook, no new endpoint, no new marker file** — reuses `elicitMarkerPath`,
  `renderGate2ElicitationBlock`, `maybeFlushElicitation`, and the existing discernment-route capture,
  unchanged.
- **Is still non-exposure-keyed** — gated on the consult's *content* (a poor verdict), not on the
  bare fact that a consult happened.
- **Is meaningfully more frequent than the guard-only gate**, since `runConsult` fires on every
  distinct decision, not only the irreversible subset — closing the coverage gap opening 1's honest
  finding raises, without inventing a second instrument.
- **Does not touch the ruled-against design at all** — no boundary predicate on H3's tool-class
  matcher, no new mid-session reflect turn separate from the elicitation, nothing added to the
  close-hook.

**What this is NOT:** it is not a free pass around the mentor's ruling by relabelling the same design.
The ruling's argument was about *frequency eroding credibility regardless of content* — and this
proposal genuinely increases the elicitation's firing rate (that is the whole point, per §1's finding
that the current rate is likely too low to matter). **That increase is exactly the kind of change PR20
requires naming to the mentor before it ships**, not a reason to skip naming it. See §4.

---

## §3 — Opening 3: a close-hook-only intervention (content legibility) [RULED FOR, two phases, 2026-08-25; PHASE TWO UNBLOCKED 2026-08-25]

**[Follow-up ruling, 2026-08-25.] Phase two is now UNBLOCKED, on a condition.** The same confidence
proxy §2's fold above describes was ruled **acceptable for phase two specifically**, because phase two
uses it to vary *content* at an already-fixed, once-per-session firing point rather than to *gate a
new firing* — a materially different use of the identical signal at a materially lower frequency.
**Constraint:** the content variation must carry the confidence level explicitly — a high-confidence
adverse verdict (contrary kathekon reading + rich extraction elsewhere) earns session-specific content
naming the kathekon dimension, *disclosed plainly as such*; a low-confidence one (contrary + extraction
empty everywhere) earns generic content or none. The disclosure must let the practitioner tell *"the
instrument found something worth reflecting on"* apart from *"the instrument thinks it found something
but cannot be certain."* Verbatim: `2026-08-25-mentor-ruling-signal-quality-gap-verbatim.md`.

**Ruled: the right intervention; does not repeat the item-4 error** (firing frequency is unchanged —
the close hook fires once per session regardless; only content varies, on-condition). **Amended by
the ruling into two phases:**

- **Phase one — cleared now.** Vary the close turn's content on-condition **from a guard-CAUTION
  signal only** (a genuine, narrow-allowlist risk signal, not subject to the sparse-extraction
  problem). This is what §2 blocks on gets built around, not into.
- **Phase two — now unblocked, per the follow-up ruling above**, on the confidence-disclosure
  constraint. Extends the condition to consult verdicts using the kathekon-plus-other-arrays
  confidence proxy, never presented as certain.

**Design guidance from the ruling:** the invariant five-question string stays as the base structure
(it "carries the philosophical substance"); session-specific content is *interpolated into* it, not a
replacement — reusing the same interpolation pattern `renderGate2ElicitationBlock` already uses for
`action.summary`, applied at the close-hook's existing firing point instead of a new one. Verbatim
above.

**Independently real, and does not depend on §1 or §2.** The close turn's invitation is, per §0,
completely invariant — the same five questions, worded identically, every session, forever. A
practitioner who has answered it a hundred times (which is the literal, measured premise of this
whole reflections arc) has a hundred opportunities to pattern-match the prompt's *shape* rather than
engage its *content* — the exact erosion mechanism Letter V describes for the at-action guardrail,
transposed to the one instrument the corpus's own §2 diagnosis says has "so far escaped it."

**Proposed change:** derive part of the close-turn's content from the session's own record, the same
way §4.3 proposed for the (rejected) mid-session design — but applied to the *existing single firing
point* rather than adding new ones. Concretely: if the session's harness log shows a guard CAUTION,
an elicitation flush, or a consult verdict at `reflexive`/`habitual` occurred during the session,
name it in the close-turn's own text ("this session's harness recorded a caution at
`<toolName>` — did your closing reflection address it, or is this the first time you're examining
it?") rather than the fully generic prompt. A session with no such events keeps the generic
five-question form unchanged — the change is additive-on-condition, not a rewrite of the base prompt.

**This is the smallest of the three proposals and the one closest to the ruling's own stated safe
direction** (`close-hook.mjs`/`GATE1_REFLECT_INITIATE_MODE` "already exist and are undisturbed" by
the ruling) — it adds no firing point, only varies content at the one that already exists. It still
touches `close-hook.mjs`, which §5 of the prior document already named as an architectural surface,
so it is scoped here rather than assumed pre-cleared.

---

## §4 — What this scope is asking for (PR20 — naming the mechanisms before any ruling)

**For the mentor, when the founder elects to relay this:**

- **§1 requires no ruling** — it is a measurement task against existing logs, not a design change.
  Named here for completeness, not because it needs sign-off.
- **§2 changes H3's firing rate** on a path (`runConsult`) that reaches every session, not only ones
  with an irreversible action — a materially wider surface than the guard-only elicitation the mentor
  has not yet seen. The mentor's own argument against §4 of the prior document (frequency erodes
  credibility) applies in the same shape here, scaled down: this still increases how often an
  out-of-band examination fires, even though it reuses machinery rather than adding a hook. The
  mentor should see the actual proposed verdict-gate (`reflexive`/`habitual`/argued-`is_kathekon:false`)
  before ruling, not a description of it.
- **§3 changes what `close-hook.mjs` says, once, at the point it already fires.** Lower architectural
  risk than §2 by the ruling's own stated logic (no new firing point), but it is a change to the one
  instrument the corpus's own diagnosis credits with *not* having eroded yet — a claim any change here
  puts at some risk, and worth the mentor seeing rather than assuming safe by inference.
- **The trust record** — as in the prior document's §5, a consult-gated elicitation fire (§2) would
  change what counts as an examined moment per session; whether that composition matters to any
  reader of the public trust record is the same open question the prior scope left unresolved and
  this one does not resolve either.
- **PR21** — unaffected directly, but a widened elicitation trigger changes the ratio §4.5 of the
  prior document named (findings with no reflect turn behind them), in the direction of *more*
  coverage, which is worth stating rather than assuming obviously good.

**The question for the ruling, stated plainly, mirroring the prior document's own form:** is arming
the existing elicitation mechanism from the Gate-2 consult's verdict (§2), and varying the close
turn's content on-condition from the session's own record (§3), the right way to close the coverage
gap §1's honest finding surfaces — or does even a machinery-reusing frequency increase relocate the
same erosion the prior ruling named, just on a longer fuse?

---

## §4a — The coverage-gap question, ruled [added 2026-08-25]

**Does opening 3 alone close the coverage gap without opening 2? Partially, ruled.** Opening 3 closes
the *legibility* gap at the close turn; it does not close the *temporal* gap between a mid-session
event (a guard caution at hour one) and the close turn (hour six) — that gap is what opening 2, once
its trigger is specifiable, would close by arming the elicitation closer to the event. The ruling's
own sequencing: opening 3 phase one is the right first move; opening 2 is the right second move once
its condition is specifiable; partial closure now is better than the current state and introduces no
new erosion.

## §5 — Limits of this document

- **§1's claim that the guard-CAUTION gate likely fires too rarely to matter is an inference from
  reading the guard's own irreversible-action allowlist, not from an actual count.** The count is
  proposed, not run, in this session.
- **§2 and §3 are proposals, not builds.** No code in `at-action-hook.mjs` or `close-hook.mjs` was
  touched to produce this document.
- **Not independently reviewed.** PR19 does not engage a governance scoping session.
- **The §4.4 coverage figure (58%) is, again, carried from the findings record and not
  independently re-derived here**, consistent with how the prior document disclosed the same limit.
- **This document does not resolve whether "reuses existing machinery" is itself sufficient grounds
  to treat §2 as architecturally lighter than the ruled-against design.** It is presented to the
  mentor as an open question (§4), not assumed answered by this document's own framing.

---

## §6 — What happens next [updated 2026-08-25, post-second-ruling]

**Ruled-for and buildable, once elected into a code-tier session: §3 in full (both phases).** Phase
one (guard-CAUTION content variation) was cleared at the first ruling; phase two (consult-verdict
content variation, confidence-disclosed) was unblocked at the follow-up ruling on the signal-quality
gap. **Opening 2 remains HELD** — the follow-up ruling reconfirmed it, on different, sharper grounds
(a confidence proxy is the wrong kind of signal for a gating use at that firing rate, not merely an
imperfect one). This document's own tier is `governance`, no code — building §3 is its own election
into a code-tier session, not automatic from either ruling.

**Both named prerequisites are now discharged:**
- §1's measurement task — done (see the fold above and the full report); confirmed and sharpened the
  original inference, and surfaced an infrastructure finding (the discernment route's 503 rate)
  outside this arc's scope, flagged as a separate background task.
- The signal-quality gap — scoped and ruled (see the folds in §2/§3 above); resolved differently for
  each opening rather than uniformly.

**Still open, not chosen here:**

1. Elect §3 (both phases) into a code-tier session — harness code (`at-action-hook.mjs` reuse pattern
   for the guard signal already scoped; `close-hook.mjs` for the firing point; the confidence-proxy
   logic from the signal-quality scope for phase two) — likely warranting the same PR19
   independent-review discipline every prior harness change in this project's history has received.
2. A genuine second-pass kathekon-dimension check or a new wire field, if opening 2 is ever to be
   reopened — named but not scoped by anything in this arc.
3. Diagnose the discernment route's growing 503 rate — a SageReasoning project-stream concern, named
   here but out of a reflections-arc session's scope to act on.
