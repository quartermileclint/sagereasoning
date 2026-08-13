# SCOPING SESSION RECORD — Layer 3 per-consumer rendering: re-open the S7 decision?

**Status: OPEN — awaiting ruling.** **Tier: `governance`.** Opened 2026-08-12 by mentor ruling on
finding 1 of `2026-08-12-guide-function-agent-vs-human-practitioner.md`.

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
