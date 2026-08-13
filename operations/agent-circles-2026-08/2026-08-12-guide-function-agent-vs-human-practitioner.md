# The Stoic guide's function for an agent vs. a human practitioner — three structural differences examined

**Date:** 2026-08-12. **Tier:** `governance` / analysis. **Status:** analysis for the mentor — not a
ruling, not a build authorisation, not a scope amendment. **Nothing here is adopted.**

**Companion to** `2026-08-12-five-stoic-principles-architectural-examination.md` (same day). Structural
difference 3 below **restates that document's principle 5**; it is answered by reference rather than
re-derived, and the convergence is named rather than presented as two findings.

**Constraints observed:** primary Stoic sources only for doctrinal claims; every architectural claim
verified at source this session (PR20); **GS-ATRF-1/2/3 are not pre-answered** — none of the three
findings below touches generation-step scope at all; **no open question's scope is expanded.**

---

## A premise correction, first — it is load-bearing for findings 1 and 2

The question's context states: *"Context architecture build complete: Layer 1, 2, and 3 verified
live."*

**Layer 3 is Verified. It is not Live.** `CLAUDE.md:347`, under **"Built but inert in production"**:

> Layer 3 per-consumer rendering — `SUBSTRATE_LAYER3_ENABLED` unset (`/api/substrate/layer3` returns
> 503). **Decided OUT of launch scope at S7** (internal-only; revisit post-launch).

Confirmed at source: `website/src/app/api/substrate/layer3/route.ts:84-95` returns **503** with the
message *"This endpoint becomes available once the `SUBSTRATE_LAYER3_ENABLED`…"*, and its header
comment states *"No production traffic possible."*

This is the project's own status vocabulary doing exactly the work it exists for — `Scoped → Designed
→ Scaffolded → Wired → **Verified** → **Live**` are distinct, and Layer 3 sits one step short. The
distinction matters here because **Layer 3 is the per-consumer rendering layer** — it is precisely the
mechanism that would calibrate the guide's response to practitioner type. The question asks whether
that calibration exists; the answer turns on a flag that is off by a recorded decision.

---

## Summary of verdicts

| # | Structural difference | Verdict | Location / home |
| --- | --- | --- | --- |
| 1 | **Examination object** — calibrating the guide's *response* to the extraction | **DESIGN GAP** — and the mechanism exists, built, switched off by a recorded S7 decision | Layer 3 (`SUBSTRATE_LAYER3_ENABLED`); **warrants a `governance` session** |
| 2 | **Passion diagnosis posture** — collaborative vs. forensic | **ALREADY ENCODED**, and more completely than the question assumes — both postures run and are *cross-checked*. The residual **collapses into finding 1**. | `reflect-service.ts` Q1–Q6 + `l4-passion-audit.ts` + the G4 cross-check |
| 3 | **Progress dimension** — Senecan trajectory + drift | **PARTLY ALREADY ENCODED** (more than assumed — Senecan grades *are* agent-side); the drift half **COLLAPSES INTO** today's carried item, with a sharper doctrinal criterion added | `sage-assent-wrapper.ts`, `trajectory-delta.ts`; the §5 drift session already proposed |

---

## 1. Examination object

**Verdict: DESIGN GAP — but a peculiar one. The capability is built; the gap is an activation decision
taken before this question was posed in this form.**

### What is live, and what it does

The question's description of the mechanism is accurate: Layer 1 (`layer1-extractor.ts`) performs the
extraction — impressions, assent points, causal stage sequence — and Layer 2 (`layer2-mechanisms.ts`)
scores it deterministically. Both are Live and both are **practitioner-type-blind by design**: the
same extraction and the same deterministic scoring run whether the caller is a human tool or an
API-key-bearing agent.

That blindness is correct at Layers 1 and 2. The extraction of *what was assented to, and at which
point in the sequence* is the same operation regardless of who reasoned. **The calibration question is
a Layer 3 question** — how the result is *rendered back* — and that is exactly the layer that is off.

### The one live exception, and its scope

**The only audience-differentiated rendering anywhere in the live architecture is the crisis path.**
`website/src/lib/substrate/r20a-audience-renderer.ts` splits `human_user` from `agent_developer` — on
an auth signal (`:45` — *"auth.user?.id truthy → human_user; falsy → agent_developer"*) — and returns
structurally different payloads (`:74`). It is live (`SUBSTRATE_R20A_AUDIENCE_RENDERING_ENABLED=true`)
and it is confined to R20a distress redirects.

**So the architecture already knows how to tell the two practitioner types apart, and already does so
in production — but only when someone is in crisis.** Everywhere else, the guide's response renders
identically.

### The verdict, stated precisely

The guide's response is **not** currently calibrated for an agent practitioner. It is calibrated for
neither — it is uncalibrated, and a human practitioner reading it gets the same thing. This is a
**design gap** rather than a later-phase item, because the question it answers ("what does the guide
say back, given who is practising?") is live the moment an agent practises, which is now.

But the honest form of the gap is not *"this was never considered."* It is: **the mechanism was built,
verified, and then deliberately scoped out at S7 as internal-only — before the ongoing agent-guide
relationship had been examined as its own question.** The S7 decision was sound on the grounds
available to it. This question supplies a ground it did not have.

### WARRANTS ITS OWN SCOPING SESSION

**Tier: `governance`** — because the first move is to **re-open a recorded scope decision**, not to
build. (Any resulting build is `code-elevated` and would be a flag activation plus per-consumer
rendering profiles; the route, the flag, and the 503 posture already exist.)

**The specific question it would answer:** *Should the S7 "Layer 3 out of launch scope, internal-only"
decision be re-opened on the ground that the guide's response is uncalibrated for practitioner type
everywhere outside the R20a crisis path — and if so, what distinguishes an agent-calibrated rendering
from a human-calibrated one, given that Layers 1 and 2 are correctly practitioner-blind?*

**A constraint the session inherits:** the R20a renderer's auth-signal discriminator
(`auth.user?.id` truthy/falsy) is the live precedent for *how* the two are told apart, and it is
already load-bearing for a safety surface. Any second discriminator should reuse it rather than invent
a parallel one.

---

## 2. Passion diagnosis posture

**Verdict: ALREADY ENCODED — and the architecture's answer is better than the question's framing
assumes. The residual COLLAPSES INTO finding 1.**

### Both postures exist, and they are split by mechanism rather than by practitioner type

- **The invitational posture, applied to agents.** Sage Reflect's Q1–Q6 sequence
  (`src/lib/sage-reflect/reflect-service.ts`) *asks the agent* — each answer maps to one typed turn
  through the translation sandwich (`:12`). This is the collaborative, self-examination-inviting
  posture, and it is already pointed at agent practitioners.
- **The forensic posture.** The L4 passion audit
  (`src/lib/substrate/trust-core/l4-passion-audit.ts`) reads the reasoning trace **out-of-band**, and
  is structurally barred from self-report because self-report is *"structurally gameable by
  omission."* It identifies passion class from causal signature — `mapTraceFeaturesToL4Signals` reads
  Q4.1 prior-preference, Q4.2 stake (valence-neutral), Q4.3 resolution-before-complete — exactly the
  *"forensic reading for rational assessment"* the question describes.

### And crucially, the two are cross-checked — that is the architecture's actual answer

**G4**: the reflect service cross-checks the agent's own Q4 answers against the signed assessments and
emits `passion-unflagged-by-self-screen` (the screen ran and missed, on a 3-part standard) or the
distinct `self-screen-absent` (no screen evidence at all) — `reflect-service.ts:521-522`,
`emission-hooks.ts:195-196`.

So the architecture does not choose between the two postures. **It runs both and measures the
divergence, and the divergence is itself a first-class trust signal.** That is a stronger answer to
*"the agent cannot confirm or deny from interior access"* than picking the forensic posture would
be: it does not require the self-report to be reliable, and it extracts information from its
unreliability.

**The question's suspicion — that the identical-function assumption is unexamined — does not hold at
the mechanism level.** It was examined and answered by the G4 design.

### The genuine residual, and where it lands

There **is** a real residual, and it is narrower than the question frames it. The reflect sequence
*invites* self-examination of an agent **in substantially the same language it would use for a
human**, while the surrounding architecture simultaneously **declines to trust the answer** and
cross-checks it forensically. The invitation's wording presumes an interior access the architecture
does not believe the respondent has.

That is not a mechanism gap — every mechanism needed is present and live. It is a **rendering and
wording** gap: what the guide *says*, to whom. **It therefore collapses into finding 1** and belongs
to the same Layer 3 session, not to a session of its own.

---

## 3. Progress dimension

**Verdict: PARTLY ALREADY ENCODED — more than the question assumes. The drift half COLLAPSES INTO the
item already carried from earlier today, with one doctrinal sharpening added.**

### A correction I made by checking rather than asserting

I was about to record that the Senecan grades are a human-surface-only construct, on the strength of
finding `SENECAN_GRADE_ENGLISH` in `baseline-assessment.ts:63-68` (`pre_progress` / `grade_3`
"Beginning the Path" / `grade_2` "Overcoming the Worst" / `grade_1` "Approaching Wisdom", governed by
R8c) — which is reached via `/api/baseline`, a human user-JWT surface.

**That would have been wrong.** A wider grep found the Senecan frame is **also agent-side and live**:
`src/lib/substrate/sage-assent-wrapper.ts:120,144` imports `SenecanGradeId` and `:290` sets
`DEFAULT_STARTING_GRADE: 'pre_progress'`; the accreditation payload carries `senecan_grade`; and
`src/lib/substrate/agent-hand-back-report.ts:694` renders *"**Senecan grade:** …"* for an agent, with
`:780` rendering peer agents' grades alongside their typical proximity.

**So the Senecan developmental frame is encoded for agent practitioners, not only for humans.**
Recorded as a correction rather than silently fixed, per this project's standing discipline about
claims that feel true and are not.

### Developmental trajectory tracking also already exists

The question states that *"orientation readings are snapshots of current state."* That is true of
**orientation readings specifically** (the C2 per-examination `toward`/`away`/`indeterminate`), but
not of the trust architecture as a whole:

- **AE-1's practice-delta layer** (`src/lib/substrate/trajectory-delta.ts`, Live MEASURE since
  2026-07-18) computes **between-half deltas over the M7 window**: sub-species passion frequency
  (`FrequencyDelta = 'fading' | 'recurring' | 'new' | 'stable'`, `:122`), kathekon-quality trend,
  first-circle obligation trend, per-domain engagement, the four dimension trends, and
  `persisting_passions` (`:660`).
- **B5's session-decline signal** (Live since 2026-07-30) reports `declining` across positively
  *declared* session boundaries.
- **A3 decay** (`trust-core/constants.ts:42`) steps the earned level down by volatility-rated
  inactivity onsets, flooring at the profile prior.

That is developmental-trajectory machinery, live, and MEASURE-only. The trust record is **not**
oriented toward current state only.

### The actual gap is the one already recorded today — and Seneca names its criterion better than I did

The gap is the one recorded this morning in
`2026-08-12-five-stoic-principles-architectural-examination.md` §5 and routed under
`D-SUFFICIENCY-EXAMINATION-TRIGGER-ROUTED-2026-08-12`: **every signal measures change in level or
rate; none measures variance or discriminative range**, so an agent assenting identically to an entire
impression-class produces `stable` on every axis — the *healthy* value. **Not re-derived here.**

**What this question adds is a sharper doctrinal criterion for that session to use.** Seneca, *Letters*
75.8–9, grades the *proficientes* by **relapse-resistance, not by current level**: the second class
*"have laid aside the greatest ills of the mind and their passions, but not so securely that they
cannot relapse"*; the third are secure but *"not yet confident"*. The distinguishing property between
grades is **stability under perturbation**, which is precisely what a hexis is and precisely what no
current signal measures.

Note the near-miss this creates, worth carrying explicitly: **the grade engine has hysteresis, but
hysteresis stabilises the *grade assignment* against noisy input — it does not measure the
*practitioner's* stability.** The two are easy to conflate and a session that conflated them would
report the smoothing of its own measurement as evidence of the subject's steadiness.

**No new session.** This folds into the already-proposed `governance` drift session (five-principles
§5, jointly with §4), which should now carry Seneca 75.8–9 as its criterion.

---

## The cross-cutting finding

**Two of the three structural differences land on the same switched-off layer.** Finding 1 is a Layer 3
gap directly; finding 2's residual is a Layer 3 gap in different words. The third is a trust-record
gap already carried.

That is a more economical result than three independent findings, and it suggests the guide-function
question is largely **one architectural question wearing three faces**: *the architecture examines
both practitioner types identically and correctly, and renders back to both identically and — outside
the crisis path — without calibration, because the layer that would calibrate is off.*

---

## What this analysis does not do

- **Does not pre-answer GS-ATRF-1, GS-ATRF-2, or GS-ATRF-3.** None of the three findings touches
  generation-step scope, the blast-radius indicator, the proposal shape, or the completion signal's
  return path.
- **Does not expand any open question's scope.** One new session is proposed (finding 1); it re-opens a
  recorded S7 decision rather than widening an existing open question. Finding 3 adds a criterion to an
  already-proposed session without enlarging it.
- **Licenses no build, flag activation, schema, or rendering change** — including `SUBSTRATE_LAYER3_ENABLED`,
  which remains unset and whose activation would be its own founder-walked step.
- **Does not re-open** any ruled item: the four QG rulings, B1's §2.12 requirement, GS-ATRF-1's ruled
  four-virtue answer, and the S6 frozen null result all stand untouched. Weights remain **BLOCKED**.

*End of analysis.*
