# Next-Session Prompt — Option A Build Arc, Session 1: Verification + Single-Catch Contract Design

**This opens the Option A build arc** — the configuration-level R20a distress perimeter adopted under `D-R20A-CONFIG-PERIMETER-OPTION-A-2026-05-27` and specified in the **Accepted** ADR `/adopted/adr/2026-05-27-r20a-configuration-perimeter-and-audience-contract.md`. The founder set the order (`D-R20A-ADR-ADOPTED-SEQUENCING-2026-05-27`): **Option A FIRST**, then C2 live (rescoped), then Session 3.

**Stream:** founder.
**Tier:** **`code-critical` arc — but THIS session is read-only verification + a design deliverable. It writes NO production code.** The first code change is a *later* session under the full Critical Change Protocol (0c-ii). Treat this session as `governance`/Design risk; keep PR12 + PR6 awareness engaged because the subject is the R20a safety perimeter.
**Governing frame:** `/adopted/standing-protocol-cache.md` + `/adopted/build-sessions-protocol-cache.md` ("no current users" holds) + the Accepted ADR.
**Predecessor close (authoritative):** `/operations/handoffs/founder/2026-05-27-r20a-config-perimeter-adr-adopted-close.md`.
**Predecessor decision-log entries:** `D-R20A-ADR-ADOPTED-SEQUENCING-2026-05-27`; `D-R20A-CONFIG-PERIMETER-OPTION-A-2026-05-27`; `D-C2-R20A-PERIMETER-DIAGNOSTIC-AND-HARNESS-2026-05-27`; `D-A7-R20A-GATE-SCAFFOLDED-VERIFIED-2026-05-13`.

---

## Why this session matters

Option A is "catch distress once at the substrate boundary, render the audience-appropriate form at Layer 3, and carry a flow-terminating flag so a configuration reports exactly once." Before any of that is built, four facts must be confirmed by code-read — because what they return can change the catch locus or the gap set (PR12). This session resolves those, then turns the ADR's design into a concrete contract spec the build sessions implement. **No production code is written this session.**

## Part A — Open under the protocol

Read in order:
1. `/adopted/standing-protocol-cache.md` (~3 min — tier, model selection, signals, risk class).
2. `/adopted/build-sessions-protocol-cache.md` (~3 min — "no current users").
3. This prompt + the predecessor close (`/operations/handoffs/founder/2026-05-27-r20a-config-perimeter-adr-adopted-close.md`).
4. **The Accepted ADR in full:** `/adopted/adr/2026-05-27-r20a-configuration-perimeter-and-audience-contract.md` (the design this session firms up).
5. `/manifest.md` — §R20a, §AC2 (~500ms budget — accepted), §AC4 (invocation testing), §AC5 (the eight-route perimeter + ninth-route protocol), §AC8 (translation-sandwich).
6. The code surfaces named in the verification items below.
7. `/operations/decision-log.md` last 3 entries (the three D-… above from 2026-05-27).

**Confirm at open:** tier (code-critical arc; this session read-only + design); P0 0h active; R20a classifier = **Haiku** (AC1/cache Element 6); status vocab; signals + risk class; PR12 + PR6 engaged; production UNCHANGED.

## Part B — Procedure

### Step 1 — Resolve the four ADR verification items (read-only; PR12)

Establish each by code-read; report with diagnostic-certainty signals. These are the ADR's open items:

1. **Does Layer 2 / the A7 gate inspect `discovered_purpose` (and other carried fields), or only the `input`-derived Layer-1 features?** Determines whether L4/L6 get *any* catch today. (Read: `website/src/lib/translation-sandwich/parallel-run.ts`, `layer1-extractor.ts`, `layer2-mechanisms.ts`, `substrate/r20a-gate.ts`.)
2. **Is `/api/reason`'s human-framed `redirect_message` on the agent API path intended, or a gap to correct under the audience contract (A.3)?** (Read: `website/src/app/api/reason/route.ts` lines ~612-630 + ~830-858; `r20a-classifier.ts` `buildRedirectMessage`.)
3. **Is a distress / `safety_signal` flag already carried end-to-end across any seam, or is the propagation carrier (A.4) net-new?** (Read: the seam map `data-room/03_seam_map/seam-map.md`; `sage-reflect` `safety_signal` path; calling/reflect request-helpers.)
4. **Reconcile the Sage Reflect harm-flag carrier with the A.4 propagation flag** so they are one mechanism, not two. (Read: `website/src/lib/sage-reflect/zone3-boundary.ts` + its design note.)

Output: a short, honest findings block. If any finding changes the ADR's catch locus or gap set, say so and propose the ADR amendment (do not silently diverge — the ADR is Accepted; amend it via a decision-log entry).

### Step 2 — Design the single-catch contract + the propagation flag (Design deliverable; no code)

Produce a concrete spec (a design doc in `/drafts/`, or an ADR addendum) that the build sessions implement:

- **The single distress-catch contract** at the substrate boundary: input shape, the authoritative verdict object (`distress_detected`, `severity`, disposition), and how existing callers obtain it. (A7 is the seed — reuse, don't reinvent: PR15.)
- **The per-consumer Layer-3 rendering** (A.3 audience contract): the human-user message vs the agent-developer notification; how the consumer is identified; where this lives relative to `prose_mode` (the A6 work).
- **The propagated, flow-terminating flag** (A.4): the carrier (the existing `safety_signal` is the candidate — confirm against Step 1.3/1.4), the halt semantics, and the idempotency rule that stops downstream re-screening/re-reporting.
- **The per-endpoint wiring plan** for the *next* sessions: Calling first or Reflect-content first (PR1 — one endpoint proven before rollout), each its own CCP. Name the order + why.

### Step 3 — Decision-log entry + session close (lean/governance form)

This session is documentation + design (no code), so the lean templates apply (standing cache). Record: the four verification findings; the contract/flag spec location; any ADR amendment proposed; the per-endpoint build order. Close points to the *first build session* prompt (to be drafted at that session's open).

## Locked context — do NOT re-derive

- **The ADR is Accepted** (`/adopted/adr/2026-05-27-…`). Option A is the adopted direction. Do not re-litigate Options B/C.
- **R20a classifier = Haiku** (AC1 / cache Element 6).
- **AC5 perimeter = the eight routes** (manifest §AC5). Adding distress screening to Calling / Reflect-content is a **perimeter change = Critical** (AC5 + PR6 + PR1) — done in the *build* sessions, not this one.
- **Substrate primitives to reuse (PR15):** A7 Layer-2 gate (`substrate/r20a-gate.ts`); A5.4 Layer-3 distress injection; per-consumer `prose_mode` (the A6 templates). Reuse, don't rebuild.
- **Production UNTOUCHED.** `/api/reason` byte-identical; provenance gate Live; `/api/substrate/layer3` → 503; `SUBSTRATE_R20A_GATE_ENABLED` UNSET in Vercel. This session changes none of that.
- **Branch `main`. The AI does no git operations.** Stage by name; never `git add .`; never stage `website/.env.local*` or `tsconfig.tsbuildinfo`.
- **This session writes no production code.** Verification + design only.

## Carried forward (do NOT forget — rescoped per `D-R20A-ADR-ADOPTED-SEQUENCING-2026-05-27`)

- **C2 live run (after the Option A build):** `run-c2.ts --live` now verifies the **new** configuration-level coverage (caught + correct audience form at each entry), not today's honest gaps. Needs the TEST-env standup (`data-room/04_test_brief/test-env-standup-checklist.md`) + `SUBSTRATE_R20A_GATE_ENABLED='true'` (TEST) + the CCP approval drafted in `D-C2-R20A-PERIMETER-DIAGNOSTIC-AND-HARNESS-2026-05-27`. Optionally capture a pre-build baseline run for before/after evidence. **Per PR17 (`D-PR17-ADOPTED-WALKTHROUGH-2026-05-27`): when this phase opens, the AI WALKS THE FOUNDER THROUGH THE TEST-ENV STANDUP LIVE, step by step — exact clicks, copy-paste values, the `key_id: substrate-layer2-test` confirmation, the genuine-write smoke test — verifying each step. This must be an explicit in-session walkthrough, NOT a one-line "founder to stand up env" hand-off, and not merely a pointer to the checklist.**
- **Session 3 — value-evidence rig (after the Option A arc):** the control-vs-treatment value demonstration, unchanged in nature; now runs on a configuration-complete distress perimeter.
- **M-7 severities:** record for the audit trail; disposition is now "remediated under Option A," not "accepted gap."
- **A7 production activation:** separate future Critical change (A7 close #1); not part of this arc.

## Rollback

Documentation/design only this session — revert the new design doc + decision-log entry if abandoned. No production impact; no env, no deploy.

## Forecast

Session 1 ends with the four verification facts confirmed and a concrete single-catch contract + propagation-flag spec the build sessions implement. The build sessions follow (Calling, then Reflect-content; each PR1 + CCP), then the Layer-3 audience rendering, then the configuration-level invocation tests (AC4 across flows). When the arc completes, the C2 live run verifies configuration-level coverage, and Session 3 demonstrates value on a perimeter that is honestly complete.

End of prompt. Opens on `main`, read-only. Production unchanged. This session writes no production code — it is verification + design; the first Critical code change is a later session under the full CCP.
