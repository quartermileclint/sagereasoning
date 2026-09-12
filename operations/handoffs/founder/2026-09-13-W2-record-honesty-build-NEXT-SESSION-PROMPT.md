Read `operations/handoffs/founder/STANDING-SESSION-OPENER-grounded-foundations.md` first, then
CLAUDE.md's session-open reading list in order, then this prompt in full.

# Build W2 — the enforcement-class record machinery for logos-on

**Tier:** `code-elevated` (dark, flag-gated) → founder-walked `code-critical` at the schema step and
at activation. Nothing in this session is pre-approved to activate; every schema/flag/deploy step is
its own founder-walked 0c-ii.

**Source of truth — read before writing anything:**
`operations/agent-circles-2026-08/2026-08-01-agent-circles-logos-on-plan.md` §3 W2, and the binding
mentor verdicts L5 and L7 in
`operations/agent-circles-2026-08/2026-08-01-mentor-consultation-agent-circles-logos-on-verbatim.md`
(verbatim wins over the plan on any divergence; the plan wins over this prompt).

## What W2 is

The trust record currently has no way to distinguish an outcome that was **enforced** (the
infrastructure blocking or redirecting an action) from an outcome the loop **reasoned its own way
to**. Once the S11 flip eventually happens, every enforcement-class outcome that lands in the record
without this machinery would misrepresent history — reading as demonstrated virtue when it is, in the
mentor's own words, "compliance with rational structure, not constructed virtue." W2 builds the
machinery that keeps that distinction honest. It has five parts (plan §3 W2, items 1–5):

1. **The enforcement class itself** — a distinct record-entry class for enforced outcomes (today:
   guard denies; eventually: S11 interventions once flipped). It must move **no domain level in
   either direction** — EVENT_EFFECT-neutral by construction — and re-run the PA-6
   no-oversight-increase audit in the same change. Each entry carries an **inline context marker**:
   produced under enforcement; the agent's reasoning was not the proximate cause; demonstration
   evidence in this period reads in light of the enforcement context.
2. **Per-entry regime markers** — `practice-on` vs `logos-on-enforcement`, on examination entries,
   alongside the existing examination-timing credential field.
3. **The compliance-not-virtue clause** — record level and inline on every enforcement-class entry,
   mentor-verbatim (L7): *"what this record shows under logos-on enforcement is compliance with
   rational structure, not constructed virtue. Enforced outcomes are not character evidence. The
   absence of violations under enforcement does not attest to the agent's virtue; it attests to the
   infrastructure's function."* This clause lands in the SAME honest-claims amendment as practice-on
   C2d's not-attestable clause — the two clauses together define the record's honest-claims boundary.
4. **An engineering election, decided at build and recorded:** ride the schema surface of
   practice-on C1c's already-founder-walked CHECK-widening step, or take a separate schema step.
   Efficiency favours riding; your own review at build time may split it. Record the decision and
   the reasoning either way.
5. **L4's dual-recording rule, pinned both directions:** when an enforcement fires on an
   other-directed (circle-2/3/4) violation that co-occurs with a first-circle failure, the
   enforcement entry must cite the other-directed trigger as the ground — the first-circle failure
   is recorded separately, measure-only, never as the cited enforcement ground. Write batteries that
   prove both halves: an other-directed-only enforcement cites correctly, and a co-occurring
   first-circle-plus-other-directed case still cites the other-directed trigger and records the
   first-circle failure in its own, non-enforcement lane.

## Standing constraints that apply here as everywhere in this repo

- **The byte-identity guard is armed** (the false-hold observation window is running). No file
  matching `GUARD_RE` may sit modified in the working tree unless you have an explicit,
  per-commit founder waiver for that commit. If your build needs to touch a `GUARD_RE`-matched file
  (this is likely, since trust-event derivation and the record schema live under
  `substrate/trust-core`), stop and ask for the waiver before staging it — do not assume one.
- **Path-scoped commits, always** — `git commit -- <explicit paths>`, never a bare `git commit`.
- **PR19 independent adversarial review** before any commit that touches a load-bearing surface.
- **Re-derive every number you cite from source** — do not carry forward a count from a prior
  session's prose (this file's own author has been independently caught doing exactly that, twice,
  in the sessions immediately preceding this one).
- **The intervention engine (`intervention-engine.ts`) already carries two source-grepped pins**
  (test-file only, in `s4-intervention-engine.test.ts` §W3) proving it consumes no orientation
  reading and no first-circle-only enforcement ground. W2's dual-recording battery (item 5 above)
  should sit alongside those, not duplicate their approach — read §W3 first.
- **Nothing here licenses building or discussing the S11 flip itself, or any accreditation write.**
  Those are separate, later, founder-walked steps and are out of scope for this build.

## What "done" looks like for this session

At minimum: the enforcement-class record shape designed and reviewed; the schema election made and
recorded; the compliance-not-virtue clause drafted (staged, not yet publicly applied — that is its
own R18 sign-off step per house discipline); the dual-recording rule built and battery-proven both
directions; everything dark behind a new flag (unset elsewhere ⇒ byte-identical). A founder-walked
schema/activation session is the natural next step after this one, not part of it, unless the
founder explicitly extends scope in this session.

Work the plan's five items in whatever order the actual dependencies require; they are listed above
in the plan's own order, not necessarily the build order.
