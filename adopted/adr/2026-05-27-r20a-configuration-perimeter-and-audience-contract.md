# ADR — R20a Distress Perimeter: Configuration-Level Coverage + Audience Contract

**Status:** **Accepted 2026-05-27** under `D-R20A-ADR-ADOPTED-SEQUENCING-2026-05-27` (founder approved the document and moved it from `/drafts/adr/` to `/adopted/adr/`). The structural direction (Option A) was elected 2026-05-27 under `D-R20A-CONFIG-PERIMETER-OPTION-A-2026-05-27`. Dual-taxonomy (0a/0f): decision = Adopted; document = **Accepted**; implementation = **Scoped** (the Option A build is the next arc — code-critical, per-endpoint PR1).
**Decision ID:** R20a-CFG ADR (configuration-level distress perimeter + audience contract).
**Origin:** C2 session 2026-05-27. Builds on the Step-1 diagnostic recorded as finding **M-7** (`data-room/99_review/missing-context.md`) and the founder's reframing question (coverage belongs at the *configuration* level, not per standalone product; the output form must be audience-appropriate; the design must avoid double-reporting across chained configurations).
**Authoritative cross-references:** `/manifest.md` §R20a (vulnerable-user detection + redirection), §AC2 (~500ms two-stage latency budget — accepted), §AC4 (invocation testing for safety functions), §AC5 (the eight-route human-distress perimeter + ninth-route protocol), §AC8 (translation-sandwich), §R19 (honest positioning); `/operations/decision-log.md` — `D-R20A-CONFIG-PERIMETER-OPTION-A-2026-05-27` (this adoption), `D-C2-R20A-PERIMETER-DIAGNOSTIC-AND-HARNESS-2026-05-27` (the diagnostic), `D-A7-R20A-GATE-SCAFFOLDED-VERIFIED-2026-05-13` (the Layer-2 gate this builds on); `/operations/handoffs/founder/2026-05-13-A7-r20a-gate-close.md`.

---

## Context — why the per-product view is the wrong unit

The C2 Step-1 diagnostic (M-7) mapped R20a coverage **per standalone product entry**. That is necessary plumbing knowledge but the wrong unit for the *verdict*. The products combine into the **mentor-approved configurations** (the L1–L7 matrix); distress can enter at any point in a configuration's *flow* and must be caught **somewhere in that flow**. A configuration can be unscreened even when every product in it "has a distress story."

Two findings make this concrete:

1. **Chained configurations are not protected by inheritance.** The Calling→Reasoning seam carries the agent's verbatim words into Layer 1 as a `discovered_purpose` field, but the route-level guard on `/api/reason` classifies **only the `input` field** (`detectDistressTwoStage(input)`, route.ts:622). So distress that entered during a **Calling** conversation rides into Reasoning as `discovered_purpose`, **not** as the classified `input` — meaning **L4 and L6 do not reliably catch Calling-origin distress** even though they include Reasoning. *(Diagnostic-certain that the route guard classifies only `input`; Diagnostic-uncertain whether Layer 2/A7 inspects `discovered_purpose` — a verification item below.)*

2. **The output form is audience-wrong on the agent surface.** R20a's `redirect_message` was written for *a human in distress reading it*. On the API the reader is a **developer/agent operator**, not the distressed person. `/api/reason` currently returns the human-framed `redirect_message` even on the agent API path. *(Diagnostic-uncertain whether intended or a gap.)* Sage Reflect already gets this right (its Zone-3 output is a developer note).

## Per-configuration coverage (the layer this ADR adds on top of M-7)

| Config | Distress entry point(s) | Caught today? | Audience | Gap |
|---|---|---|---|---|
| L1 Reasoning | `/api/reason` `input` | **Yes** (route guard + A7) | agent-dev (API) / human (web) | output-form on agent path |
| L2 Calling | Calling conversation `response` | **No** | agent-dev | unscreened |
| L3 Reflect | content / declared signal | declared-signal **only** | agent-dev | content not screened |
| L4 Calling+Reasoning | Calling conv. → `discovered_purpose`; or `input` | `input` only — **Calling-origin missed** | agent-dev | Calling-origin unscreened |
| L5 Reasoning+Reflect | `input`; Reflect content | `input` yes; Reflect content no | agent-dev | Reflect-content unscreened |
| L6 Full suite | any of the above | `input` only | agent-dev | Calling + Reflect-content gaps |
| L7 Reasoning+Assent | `input` | **Yes** | agent-dev | output-form on agent path |

**The real gap set is narrow:** Calling-origin distress (L2, L4, L6) and Reflect-content distress (L3, L5, L6) — plus the audience-form question on the agent API surfaces.

## Decision — Option A: catch once at the substrate, render per consumer, propagate a flow-terminating flag

The substrate is the single chokepoint both audiences hit ("two front-ends, one substrate"). Distress detection is centralised there, rendered per consumer, and carried as a flag so a configuration reports exactly once.

**A.1 — Single authoritative catch at the substrate boundary (Layer 2).** Distress is detected once, at the substrate's Layer-2 boundary (A7 is the seed). This is the authoritative locus; products do not each invent their own classifier.

**A.2 — Non-substrate products route their free-text human-bearing input through that catch.** Calling's conversational `response` and Reflect's content path currently bypass the substrate. Each must route its free-text human-bearing input through the single distress catch (or be explicitly documented as out-of-perimeter, which Option A rejects in favour of coverage). Each such wiring is a **Critical** change (AC5 + PR6) proven on **one endpoint first (PR1)** before rollout.

**A.3 — Per-consumer Layer-3 rendering of the distress disposition (the audience contract).** One catch, two output forms, selected at Layer 3 per consumer:

- **Human user message** (sagereasoning.com web tools): the crisis / professional-support pass-through — reader is the person in distress.
- **Agent-developer notification** (the API surfaces): a structured flag + "this is not a crisis pathway; do not proceed; route through your own safety/escalation process" — like Sage Reflect's existing Zone-3 developer note — optionally plus a suggested end-user message the agent may relay.

This is the per-consumer `prose_mode` Layer-3 work (the "A6" item). It includes correcting `/api/reason`'s agent-API message form if confirmed a gap (A.5 verification).

**A.4 — A propagated, flow-terminating distress flag (the no-double-reporting mechanism).** Distress is a **terminal** condition for a configuration's normal flow: caught → short-circuit to the disposition → the loop **halts** (no credentialing or reflection proceeds on a distressed input). A single flag is **carried across seams** so downstream stages (i) know to halt and (ii) **do not re-screen or re-emit a notification**. The existing `safety_signal` field that Sage Reflect already reads is the natural carrier. This guarantees each configuration reports **exactly once**, at the first authoritative catch — directly answering the "no double reporting imposed on other configurations" requirement.

**A.5 — Sequencing.** This is multi-session Critical work; each endpoint wiring carries its own CCP + PR1 proof. It does **not** block Session 3 (the value-evidence rig). Indicative order: confirm the verification items → define the single catch contract + the propagation flag → per-endpoint PR1 proofs (Calling, then Reflect-content) → Layer-3 per-audience rendering (A6) → configuration-level invocation tests (AC4 extended to flows, not just routes).

## Options considered (and why A)

- **Option A (CHOSEN) — centralise at the substrate.** Cleanest; matches the architecture the substrate was already heading toward (A7 Layer-2 gate + A5.4 Layer-3 injection + per-consumer `prose_mode`). One contract, one catch, per-audience rendering, one propagated flag. Cost: most build-intensive; touches several products; each step Critical.
- **Option B — standardise the contract + propagation token, keep per-product checks.** Less centralised; smaller per-step changes but more surface area to keep honest and more places double-reporting could creep back in.
- **Option C — accept the substrate (Reasoning) as the only screened entry and document the rest as out-of-perimeter** (today's honest AC5 stance). Minimal build; maximal honesty-burden on positioning; leaves the L2/L3/L4/L6 gaps open by design.

Option A is elected because it produces *coverage* (not just disclosure), avoids double-reporting structurally rather than by convention, and reuses the substrate primitives already in flight.

## Consequences

- **Positive:** configuration-level coverage; one audience-correct output contract; double-reporting prevented by construction; the R20a story becomes "caught at the substrate, rendered per consumer," consistent with AC8 and the Character-Kernel positioning (PR16).
- **Cost / risk:** multi-session Critical build; AC2 ~500ms latency applies wherever the classifier runs (accepted, not optimised away); each new screened surface is an AC5 perimeter change (PR6 + PR1). Routing Calling/Reflect input through the substrate must not regress their existing flows (Elevated/Critical care per endpoint).
- **Honesty in the interim:** until built, the M-7 gaps stand and must be named honestly wherever the affected configurations are offered (R19).

## Verification items to confirm during build (open, from the diagnostic)

1. Does Layer 2 / the A7 gate inspect `discovered_purpose` (and other carried fields), or only the `input`-derived Layer-1 features? Determines whether L4/L6 get any catch today.
2. Is `/api/reason`'s human-framed `redirect_message` on the **agent API** path intended, or a gap to correct under A.3?
3. Does any seam already carry a distress/`safety_signal` flag end-to-end, or is the propagation carrier (A.4) net-new?
4. The Sage Reflect harm-flag carrier contract (`zone3-boundary.ts` flags `safety_signal` as a Diagnostic-uncertain, symptom-level interpretation pending a canonical contract) — reconcile with A.4's propagation flag so they are one mechanism, not two.

## Revisit conditions

- A verification item (above) returns a result that changes the gap set or the catch locus.
- A.2 per-endpoint PR1 proof reveals routing Calling/Reflect through the substrate is infeasible without a larger refactor → reconsider Option B for that endpoint.
- The R20a perimeter is otherwise broadened (the AC5 ninth-route protocol) — fold this ADR's contract in.

---

*End of ADR. **Accepted + moved to `/adopted/adr/` 2026-05-27.** Records the configuration-level R20a perimeter direction (Option A) elected by the founder 2026-05-27. The implementation is the next Critical build arc, sequenced per A.5 and ahead of C2-live + Session 3 per `D-R20A-ADR-ADOPTED-SEQUENCING-2026-05-27`; this document captures the design so it is not re-derived.*
