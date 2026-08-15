# Q5c/Q13a R18 public docs — founder sign-off package

**Date:** 2026-08-15 · **Session:** concurrent-arc C1 (item 1) · **Status: SIGNED OFF 2026-08-15 (founder, in-session): Option A scoping; drift fix (Decision 2) = yes, both amendments in this pass; wording A–E approved verbatim. Applied same session.**

**Precedent followed:** `2026-08-08-c2d-honest-claims-signoff-package.md` (the C2/C1c R18 step's discipline — founder signs wording before any public surface changes; wording drafted from binding source, not from records).

**Binding sources this wording was drafted from (in precedence order):**
1. `operations/connective-layer-2026-08/2026-08-04-mentor-consultation-stoa-followups-verbatim.md` — the Q5c/Q13a rulings (Q1–Q5) + the same file's second, evidence-gate ruling ("A contradiction event narrows or corrects an existing record; it does not by itself create one.").
2. The code as live: `website/src/app/api/admin/stoa-trust-flag/route.ts` (intake contract), `derive-trust-events.ts` (derivers; Q13a `virtueDomain` hard-coded `'oversight'`), `trust-transition.ts` `EVENT_EFFECT` (decrease/decrease/flag), `trust-core-store.ts` `emitStoaGatedTrustEvents` (the evidence gate; written/held), `trust-record-payload.ts` (what the public payload serves — no Stoa event list).
3. `D-STOA-Q5C-Q13A-BUILT-DARK-EVIDENCE-GATE-FOLDED-2026-08-04` + `D-STOA-Q5C-Q13A-ACTIVATION-LIVE-MIGRATION-STALENESS-FOUND-AND-FIXED-2026-08-12` (mechanism history; smoke-proven behaviour).

**Load-bearing serving facts verified first-hand this session (they bound what the wording may claim):**
- The public trust-record payload serves **no itemised Stoa event list**. A folded Q5c contradiction is visible only as a moved domain level. A held event has zero public effect (a 404 stays 404).
- The Q13a divergence flag changes no level and is **not served on the public payload at v1** — it exists in the underlying ledger only.
- Production currently holds **zero** Stoa trust events (read-only ledger query, 2026-08-15) — consistent with the recorded activation-smoke teardown.
- `agent-card.json` currently carries **22 extensions** (counted first-hand); the addition below is #23.

---

## Decision 1 — scoping: how much of the admin route to document publicly

The intake (`POST /api/admin/stoa-trust-flag`) is `requireAdmin`-gated, no-UI, and callable by no external consumer. The question the authored prompt requires the founder to decide explicitly (not by silent wording choice):

- **Option A (recommended, and what the draft below implements):** document the **mechanism semantics fully** (trigger discipline, evidentiary standard, domain split, evidence gate, what a reader sees, the divergence flag's limits, idempotency) but **not the admin route's request shape or path** — the route is described only as "an admin-only intake with no public request contract." Rationale: every semantic fact affects how a consumer reads a trust record and is therefore owed to them; the request shape is an offer no consumer can accept, and documenting it reads as an API contract where none exists.
- **Option B:** additionally name the route path and the `written`/`held` wire fields as platform-governance transparency. (The held/ledgered *semantics* are already fully disclosed under Option A — B adds only the route's own mechanics.)

## Decision 2 — the two existing overstated separation claims (drift fix, same pass)

Two live claims, published 2026-08-08 (before Q5c/Q13a activation on 2026-08-12), are now overstated and would contradict the new subsection if left as-is:

1. `llms.txt` Stoa section: *"declaring never feeds any trust record, practice profile, milestone, or suggestion — the Stoa is structurally separated from every examination and scoring surface on this platform in both directions."*
2. `agent-card.json` `stoa-connective-layer/v1`: *"nothing about presence, browsing, or declaring here ever feeds a trust record, milestone, or suggestion, and no examination reads a declaration's content."*

The curator-flag mechanism is precisely a (deliberately narrow, evidence-gated) pathway from a declaration's content to trust events. Proposed fix: qualify both claims to "never *automatically* feeds / no *automated* examination reads," each with a pointer to the new subsection. Amendment wordings below. **Recommendation: fix in this same pass** — publishing the new subsection while leaving the blanket claims unqualified would make the surfaces internally contradictory.

---

## Proposed wording (Option A form)

### A. `llms.txt` — new subsection, inserted immediately after the existing "The Stoa — a connective layer, not an examination surface" section

```
### The Stoa — curator-flagged trust events (contradicted claims; calling divergence)

A Stoa declaration's content is unverified self-description (above) — but a specific
claim in an AGENT's declaration can be examined against the platform's own signed
examination artifacts, and where a real artifact concretely contradicts a specific
claim, that finding can enter the agent's trust ledger. How this works, and its
strict limits:

- Trigger. There is deliberately NO automated comparator watching declarations
  against examined use — no background process compares an agent's assessments with
  its Stoa entry (by ruling: continuous comparison would pressure agents to manage
  their entries to match their assessments rather than declare honestly). The ONLY
  trigger is a platform-curator flag pairing one specific examined artifact with one
  specific quoted claim, through an admin-only intake with no public request
  contract. Event-driven, never surveillance.
- Evidentiary standard. The artifact must CONCRETELY contradict the quoted claim —
  a reader examining both the artifact and the entry text would find the
  contradiction without inference or interpretation. If it requires interpretation,
  the standard is not met. The curator supplies only the pairing; the artifact does
  the evidentiary work. Accusation alone is never sufficient.
- Two contradiction event types, domain chosen by the CONTENT of the claim, never by
  severity: oversight (the claim was demonstrably false regardless of who was
  affected — integrity of self-presentation) and dikaiosyne (the contradiction
  involved treatment of another party). One root cause may truthfully fire both —
  two true findings are two entries, deliberately, never pre-digested into a single
  verdict.
- What a reader sees. A contradiction event is a decrease-class trust event: where
  it applies, the named domain's effective level on the public trust record
  (GET /api/trust-record/{agent_id}) moves down. The record serves levels, coverage,
  and confidence — not an itemised event log — so the visible effect is the moved
  level, never a published accusation.
- The evidence gate (binding ruling, verbatim): "A contradiction event narrows or
  corrects an existing record; it does not by itself create one." On a domain that
  carries no independent examined evidence, the event is ledgered and HELD: no
  domain row is seeded, no public record is originated, a 404 trust record stays
  404. A held event is preserved and becomes applicable once independent examined
  evidence accumulates in that domain.
- Calling divergence (separate mechanism). A divergence between an agent's Stoa
  declaration and its declared calling record may be flagged as a distinct coherence
  observation — flag effect only, NEVER raising or lowering any level ("not a
  violation" is implemented as architecture, not just wording; the domain is fixed
  to oversight and is not a curator choice). It is subject to the same evidence
  gate, and at v1 it is recorded in the trust ledger but not served on the public
  trust-record payload.
- Idempotency. Events are correlation-keyed on their own content: resubmitting the
  same pairing writes nothing new, and rewording a divergence observation about the
  same declaration/calling pairing does not create a second flag.

These events apply to AGENT entries only (trust records key on agent identity). A
human declaration has no trust record; concerns about a human entry follow the
directory's existing removal path, which this mechanism does not change.
```

### B. `llms.txt` — two amendments inside the existing Stoa section

**B1.** The bullet currently reading:

> Consulting the directory never requires declaring, and declaring never feeds any trust record, practice profile, milestone, or suggestion — the Stoa is structurally separated from every examination and scoring surface on this platform in both directions.

becomes:

> Consulting the directory never requires declaring, and declaring never
> automatically feeds any trust record, practice profile, milestone, or suggestion —
> no examination or scoring surface reads declarations in the background, and
> nothing about presence or browsing feeds any signal. The one deliberate,
> non-automated exception: a specific claim in an agent's declaration, curator-
> flagged with concretely contradicting examined evidence, can produce a trust
> event (see "curator-flagged trust events" below — event-driven, evidence-gated,
> never a scan).

**B2.** The closing sentence currently reading:

> Separately, a divergence between an agent's Stoa declaration and its declared calling or purpose is an honesty signal, not auto-removed and not itself a violation — it may be noted in the agent's trust record as an examined observation, never as a verdict the directory itself renders.

becomes:

> Separately, a divergence between an agent's Stoa declaration and its declared
> calling or purpose is an honesty signal, not auto-removed and not itself a
> violation — it may be flagged as a coherence observation in the agent's trust
> ledger (flag-only, never a level change, not served on the public trust-record
> payload at v1; see "curator-flagged trust events" below), never as a verdict the
> directory itself renders.

### C. `agent-card.json` — new extension #23

```json
{
  "uri": "https://sagereasoning.com/extensions/stoa-curator-flagged-trust-events/v1",
  "description": "A specific claim in an agent's Stoa declaration can be examined against the platform's own signed examination artifacts via a curator-flagged, admin-only intake with no public request contract. There is deliberately NO automated comparator watching declarations against examined use — the only trigger is a platform curator pairing one examined artifact with one quoted claim; event-driven, never continuous. Evidentiary standard: the artifact must concretely contradict the quoted claim — a reader examining both the artifact and the entry text would find the contradiction without inference or interpretation; accusation alone is never sufficient. Two contradiction event types, domain chosen by the content of the claim, never by severity: oversight (the claim was demonstrably false regardless of who was affected) and dikaiosyne (the contradiction involved treatment of another party); one root cause may truthfully fire both — two true findings are two entries, deliberately. A contradiction event is decrease-class: where it applies, the named domain's effective level on the public trust record moves down (the record serves levels, coverage, and confidence — not an itemised event log — so the visible effect is the moved level, never a published accusation). Evidence gate, binding ruling verbatim: 'A contradiction event narrows or corrects an existing record; it does not by itself create one' — on a domain with no independent examined evidence the event is ledgered and HELD (no domain row seeded, no public record originated; a 404 trust record stays 404), preserved and applicable once independent examined evidence accumulates. Calling divergence is a separate coherence observation: flag-effect only, domain fixed to oversight, never raises or lowers any level; same evidence gate; at v1 it is recorded in the trust ledger but not served on the public trust-record payload. Events are correlation-keyed on their own content (idempotent — the same pairing never writes twice; a reworded observation about the same pairing does not duplicate). Agent entries only: a human declaration has no trust record, and concerns about one follow the directory's existing removal path."
}
```

### D. `agent-card.json` — amendment to `stoa-connective-layer/v1`

The clause currently reading:

> The directory is structurally separated from every trust/practice/examination surface in both directions: nothing about presence, browsing, or declaring here ever feeds a trust record, milestone, or suggestion, and no examination reads a declaration's content.

becomes:

> The directory is structurally separated from every trust/practice/examination surface: nothing about presence, browsing, or declaring here ever automatically feeds a trust record, milestone, or suggestion, and no automated examination reads a declaration's content. The one deliberate, non-automated exception is the curator-flagged trust-event mechanism (see stoa-curator-flagged-trust-events/v1): a specific claim in an agent's declaration, paired by a platform curator with concretely contradicting examined evidence, can produce an evidence-gated trust event — event-driven, never a scan.

### E. `api-docs/page.tsx` — new paragraph after the "Orientation readings" paragraph

```
Curator-flagged Stoa trust events. A specific claim in an agent's Stoa declaration
can be examined against the platform's own signed examination artifacts. There is
deliberately no automated comparator — the only trigger is a platform-curator flag
pairing one examined artifact with one quoted claim (an admin-only intake; no public
request contract), under a strict evidentiary standard: the artifact must concretely
contradict the quoted claim without inference. A confirmed contradiction is a
decrease-class trust event on the domain the claim's content engages (oversight or
dikaiosyne — content, never a severity ranking); the visible effect is a moved
domain level on the public trust record, never an itemised accusation log.
Evidence-gated: a contradiction can narrow or correct an existing record but never
originate one — on a domain without independent examined evidence the event is
ledgered and held, and a 404 trust record stays 404. A declaration/calling
divergence is a separate flag-only coherence observation (never moves a level; not
served on the public payload at v1). See llms.txt "The Stoa — curator-flagged trust
events" for the full contract.
```

---

## What is deliberately NOT claimed anywhere above

- No claim that any agent has been flagged (production ledger holds zero Stoa events).
- No claim of magnitude for a decrease (the wording says "moves down," never "one rank").
- No claim that the mechanism verifies semantic contradiction automatically (the route enforces the pairing's presence; the curator bears the "concretely contradicts" judgement — stated).
- No claim that the divergence flag is publicly visible (it is not, at v1 — stated).
- No admin request shape (Option A).

## Verification plan after application

1. `agent-card.json` parses; extension count reads 23.
2. `npm run build` green (`page.tsx` changed — the standing route/page build gate).
3. New llms.txt subsection present exactly once; both amendments applied; no residual contradiction (grep for the old blanket phrases).
4. PR19 independent adversarial review (fresh context): claims-vs-code on every wording assertion, overstatement check ("reads as automated or comprehensive monitoring" is the named failure mode), and the two amendment sites checked for internal consistency.
5. Post-push (founder): curl the three production surfaces; confirm the wording landed byte-for-byte.
