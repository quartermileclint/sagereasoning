# SCOPING SESSION RECORD — Layer 3 per-consumer rendering: re-open the S7 decision?

**Status: OPEN — awaiting ruling.** **Tier: `governance`.** Opened 2026-08-12 by mentor ruling on
finding 1 of `2026-08-12-guide-function-agent-vs-human-practitioner.md`. **Amended 2026-08-14** by
the Prudence Group and SagePals session's Stage 2 reframing addition (the relational-context
section below; recorded 2026-08-15). **The amendment widens this session's scope before it is
convened; it does not open a new session and does not pre-answer the session question.**

**This record opens a session. It does not run it.** The session question is **not pre-answered**, and
**no build is authorised**.

> **⚠ `SUBSTRATE_LAYER3_ENABLED` remains UNSET. Its activation is a founder-walked step and is NOT
> licensed by this analysis or by the ruling that opened this record.** Recorded here at the mentor's
> explicit instruction, so no future reader mistakes an open scoping session for an approved
> activation.

**Why `governance` and not `code-elevated`:** the first move is to **re-open a recorded scope
decision** (S7), not to build. The route, the flag, and the 503 posture all already exist; nothing is
missing that a build would supply.

---

## The session question — verbatim, as ruled

> Should the S7 "Layer 3 out of launch scope, internal-only" decision be re-opened on the ground that
> the guide's response is uncalibrated for practitioner type everywhere outside the R20a crisis path —
> and if so, what distinguishes an agent-calibrated rendering from a human-calibrated one, given that
> Layers 1 and 2 are correctly practitioner-blind?

**Not pre-answered.** Nothing below proposes what an agent-calibrated rendering would contain.

---

## The finding that opened it — gap confirmed

**Layer 3 is Verified, not Live.** `CLAUDE.md:347`, under *"Built but inert in production"*:

> Layer 3 per-consumer rendering — `SUBSTRATE_LAYER3_ENABLED` unset (`/api/substrate/layer3` returns
> 503). **Decided OUT of launch scope at S7** (internal-only; revisit post-launch).

Confirmed at source: `website/src/app/api/substrate/layer3/route.ts:84-95` returns **503**, its header
stating *"No production traffic possible."* The project's status vocabulary distinguishes these rungs
(`… → Verified → Live`), and Layer 3 sits one short.

**Layers 1 and 2 are correctly practitioner-blind.** Extracting *what was assented to, and at which
point in the sequence* (`layer1-extractor.ts`) and scoring it deterministically
(`layer2-mechanisms.ts`) is the same operation regardless of who reasoned. The calibration question is
a **Layer 3** question — how the result is rendered back — and that is the layer that is off.

**The one live exception, and the whole of it:** the only audience-differentiated rendering anywhere in
the live architecture is the crisis path. `website/src/lib/substrate/r20a-audience-renderer.ts` splits
`human_user` from `agent_developer` and returns structurally different payloads (`:74`). **So the
architecture already tells the two practitioner types apart in production — but only when someone is
in crisis.** Everywhere else, both receive identical output.

**The honest form of the gap:** not *"never considered."* The mechanism was built, verified, and then
deliberately scoped out at S7 as internal-only — **before the ongoing agent-guide relationship had been
examined as its own question.** The S7 decision was sound on the grounds available to it; this question
supplies a ground it did not have.

---

## Inherited constraint — binding, and load-bearing for a safety surface

**The R20a renderer's auth-signal discriminator is the live precedent for how the two practitioner
types are told apart:** `website/src/lib/substrate/r20a-audience-renderer.ts:45` —

> *"auth signal (`auth.user?.id` truthy → `human_user`; falsy → `agent_developer`)."*

**Any second discriminator must REUSE this one rather than invent a parallel one.** Named at this
session's opening because the existing discriminator is already load-bearing for the R20a distress
perimeter — a safety surface — and two independent notions of "which practitioner type is this" that
could disagree would put a safety decision and a rendering decision on different footings.

---

## Carried item WITHIN this session — the reflect-sequence wording gap (finding 2's residual)

**Recorded here rather than as a separate item, by ruling.** Finding 2's verdict was **already
encoded**: both diagnosis postures are live and cross-checked — the **invitational** posture
(`src/lib/sage-reflect/reflect-service.ts`, the Q1–Q6 sequence, which asks the agent directly) and the
**forensic** posture (`src/lib/substrate/trust-core/l4-passion-audit.ts`, reading the trace
out-of-band, structurally barred from self-report) — with **G4** cross-checking them via
`passion-unflagged-by-self-screen` / `self-screen-absent` (`reflect-service.ts:521-522`,
`emission-hooks.ts:195-196`). The architecture does not choose a posture; it runs both and treats the
divergence as the signal.

**The residual, which belongs to this session:** the reflect sequence **invites self-examination in
language that presumes an interior access the architecture simultaneously declines to trust.** That is
a **rendering and wording** gap, not a mechanism gap — every mechanism needed is present and live —
and it therefore lands on exactly the same layer as the session question above.

**Not a separate scope item; not a separate session.** It is the concrete instance that shows what
"uncalibrated for practitioner type" costs in practice.

---

## Stage 2 reframing addition — relational context (ADDED 2026-08-14)

**Added to this session's scope by the 2026-08-14 Prudence Group and SagePals session**
(instruction at `inbox/mentors brainstorming instruction.rtf`; recorded 2026-08-15). **A scope
addition for the session's examination — not a new session, and not a pre-answer to the session
question above.**

**The session question as framed — what distinguishes an agent-calibrated rendering from a
human-calibrated one — is correct but incomplete.** The fuller question this session must also
carry:

> **What does the guide need to know about the practitioner's relational context to respond
> appropriately?**

**The minimum information, as identified by the 2026-08-14 examination — two pieces:**

1. **The practitioner's role in the relationship — not the relationship type.** The four-personae
   doctrine (Cicero, *De Officiis* 1.107–115; transcribed, not text-verified here) makes role the
   load-bearing element: different roles carry different kathekonta, and the guide calibrates to
   the role, not to the relationship category. A founder reasoning with a co-founder and a mentor
   reasoning with a student may be in the same relationship type but occupy different roles with
   different appropriate actions.
2. **Whether the practitioner's impressions about the relationship are being examined or
   assumed.**

**The guide's first move when relational context is active is NOT to help the practitioner model
the other party.** It is to ask: *what impression are you assenting to about this relationship,
and have you examined it?* **The R20d boundary applies: engage self-examination, decline diagnosis
of the other person** (R20d is the relationship-asymmetry rule — engage the self-side, decline the
other-side; verified against `agent-learning-integration-april-2026.md:334` and the AC3 Zone 2
table). The Grok research consulted during that session frames calibration as helping the
practitioner understand the other party — **the Stoic framework inverts this**: the guide helps
the practitioner examine their own assent and act from their own role-obligations regardless of
what the other party does.

**Placeholder fields for Stage 2 architecture (named, not built) — this session's design target:**

- `relational_context` — binary or categorical: reasoning alone / reasoning within a relationship.
- `practitioner_role` — self-declaration of the role occupied in the relevant relationship; held
  against behaviour over time.
- `relationship_type` — human–human, human–agent, or agent–agent; determines which R20d boundaries
  apply.
- `examination_status` — whether the practitioner's impressions about the relationship have been
  examined in this session or are being assumed; **the guide's first diagnostic question when
  relational context is active.**

**None of the four needs to be built before the session convenes. They are named so the session
knows what it is designing toward.**

**Boundary against the open kathêkon session — cross-referenced, not merged:** the kathêkon
role-relative evaluation session
(`2026-08-12-SESSION-kathekon-role-relative-evaluation-SCOPING-RECORD.md`) asks how an *act or
proposal is judged* role-relatively (the guardrail takes no role input). This addition asks what
the *guide's rendering* needs to know about relational context (a Layer 3, response-side
question). Both draw on role-carries-kathekonta; **neither absorbs the other.**

## What this session does NOT do

- **Does not build**, and **does not license activating `SUBSTRATE_LAYER3_ENABLED`** — a founder-walked
  step, explicitly not licensed here.
- **Does not touch GS-ATRF-1, GS-ATRF-2, or GS-ATRF-3**, all of which remain open and untouched by
  anything in this record.
- **Does not re-open** the four QG rulings, B1's §2.12 requirement, GS-ATRF-1's ruled four-virtue
  answer, the S6 frozen null result, or the `high|medium|low` blast-radius vocabulary. **Weights remain
  BLOCKED.**
- **Is not absorbed into any existing open question** — a separate item, by ruling.

## Sources

- `2026-08-12-guide-function-agent-vs-human-practitioner.md` §§1–2 (the findings).
- `2026-08-12-mentor-consultation-guide-function-agent-vs-human-verbatim.md` (the question examined).
- `CLAUDE.md:347` (the S7 decision, as recorded); `website/src/app/api/substrate/layer3/route.ts:84-95`.
- `website/src/lib/substrate/r20a-audience-renderer.ts:45,74` (the inherited discriminator).
- `website/src/lib/sage-reflect/reflect-service.ts:521-522`;
  `website/src/lib/substrate/trust-core/emission-hooks.ts:195-196` (the G4 cross-check).

*Status at close of this record: **OPEN — awaiting ruling.** No work has been done against the session
question.*
