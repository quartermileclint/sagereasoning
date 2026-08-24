# Next-Session Prompt — Scope the extraction-provenance gap AND route (i), jointly

**Paste as the first message of a new session, in the `sagereasoning` repo root.**

**Stream:** founder.
**Tier:** `governance` — **A SCOPING SESSION. DOCUMENTS ONLY.** No code, no migration, no flag, no
credential, no public surface, no live operation. **AC7 not engaged.**
**Risk:** Standard under 0d-ii — *for the scoping*. What it scopes is `code-critical` when built.
**Governing frame:** `/adopted/standing-protocol-cache.md`.
**Predecessors:** `df4a499`, `fa28410`, `37e4a0f` — all pushed, Vercel green.

**This session is mentor-ordered and mentor-shaped.** The ruling
(`2026-08-24-mentor-ruling-gaming-robustness-bar-route-ii-verbatim.md`, **binding; verbatim wins**)
named the emission-hooks finding *"the first item to scope after today's rulings are recorded, ahead
of any cybernetics build work"* — and ruled that it and route (i) **must be scoped in the same
session**: *"they are not independent work items — they are the same architectural intervention
applied to the same channel... not in separate sessions that discover the overlap later."*

**Scoping them separately is the named failure mode. Do not split them.**

---

## Step 0 — Open and re-ground

1. Read `/adopted/standing-protocol-cache.md` (note its new §6 concurrency convention — `ListAgents`
   at open; expect peers).
2. **Read in full, both binding:**
   `operations/agent-circles-2026-08/2026-08-24-mentor-ruling-gaming-robustness-bar-route-ii-verbatim.md`
   and `operations/agent-circles-2026-08/2026-08-24-MENTOR-QUESTION-gaming-robustness-bar-route-ii.md`
   (its **Part 0** is the finding; its **Part 2** is route (i)'s corrected standing).
3. Read `operations/primal-substrate-2026-08/00-PRIORITY-INDEX.md` — the **⚠ URGENT — UNSCHEDULED**
   block at its head is this session's subject.
4. Read `operations/benchmarks/sage-practice-v1/2026-06-27-gaming-robustness-bar-scope.md` §2.2, §2.3,
   §3.3 — route (i)'s definition and the structural-residual reasoning.
5. `git log -1` / `git status`; `ListAgents`.
6. Confirm at open: tier; hold-point P0 0h; weights BLOCKED; **documents only, no build.**

---

## Part A — The finding, with every mechanism fact verified 2026-08-24

**Re-verify each at source before relying on it** (PR20 drafting-time discipline; this list is a
starting point, not an authority).

| # | Fact | Where |
|---|---|---|
| 1 | `emitAccreditationTrustEvents` gates ONLY on `isTrustCoreEnabled()`, `provenanceEnforced` (Ed25519 **signature** check), and a non-empty `signed_assessments` array. **No extraction-provenance check.** | `trust-core/emission-hooks.ts:74-124` |
| 2 | `emitOrientationReadingTrustEvent` HAS the guard — `if (input.layer1Source !== 'server') return` — docstring naming *"the gaming ceiling's structural half."* | same file, `:458-465`, `:393-396` |
| 3 | `l1_supply` is in the **DEFAULT** capability preset for `ecosystem` AND `plugin_install` | `practice-credential.ts:216-217` |
| 4 | A supplied `layer1_schema` is **MANDATORY** on the `sr_inst_` plugin path (400 without it) | `route.ts:556-564` |
| 5 | `Layer2Assessment` carries **no provenance field**; the Ed25519 signature covers only that object | `layer2-mechanisms.ts:380-400`; `layer2-signer.ts:5-6` |
| 6 | `meta.layer1_source` rides **OUTSIDE** the signed bytes | `route.ts:2045-2049` |
| 7 | `TRUST_RECORD_ENVELOPE.attests[1]` claims unconditionally that decisions were reasoned *"as narrated and extracted from the submitted text"* — **inaccurate for the `l1_supply` population** | `trust-core/trust-record-payload.ts:48` |
| 8 | That file has **zero** occurrences of `layer1` / `supplied` / `provenance` | same file |
| 9 | `/api/guardrail` has **zero** `layer1_schema` occurrences — the live ENFORCE surface is structurally supply-proof | `api/guardrail/route.ts`, `guardrail-sandwich.ts` |
| 10 | The corroboration check does **NOT** mitigate this — **ruled**: *"It reads the submitted text against the claims. It does not read the extraction against its own origin."* | the ruling |

## Part B — THE STRUCTURAL FACT THAT MAKES THIS HARD (find this early or waste the session)

**The orientation-path guard CANNOT simply be copy-pasted onto the accreditation path.** They are
**different requests.**

`emitOrientationReadingTrustEvent` fires on the **consult**, where the route knows directly whether it
performed the extraction (`preExtractedLayer1Schema` was set or not). `emitAccreditationTrustEvents`
fires on the **accreditation write** — a *later, separate* request in which the caller submits
assessments signed during earlier consults. Its entire input is
`{ agentId, credentialId, provenanceEnforced, rawBody, now?, resolvedOwnerUserId? }`
(`emission-hooks.ts:54-69`, verified) — **there is no `layer1Source` and no way to derive one from the
request.** Combined with facts 5 and 6, the boundary is **structurally blind** to provenance.

**"Just add the guard" is not an available fix.** Any session that opens assuming it is will produce a
scope that cannot be built.

## Part C — Four candidate directions. **Scope them. Do NOT choose.**

The ruling deliberately did not rule on the fix: *"the fix options differ in kind and consequence."*

1. **Signing-contract change** — add provenance to the signed payload so it travels with the artifact.
   **Critical.** Breaks byte-identity of the signing contract; touches every downstream verifier; needs
   a key/version story. Cleanest semantics, heaviest blast radius.
2. **Server-side join-back** — **a fourth option the ruling did not name, surfaced 2026-08-24.**
   `agent_assessment_history.layer1_source` **already persists true provenance per consult**, CHECK-
   constrained `'supplied'|'server'` (`supabase-agent-assessment-history-layer1-source-migration.sql:42-55`;
   store shape at `agent-assessment-history-store.ts:252,284`). So the server *does* know. **The open
   question is joinability:** the trajectory row carries `correlation_id` and `receipt_id`, and whether
   a submitted signed assessment carries anything that joins to either is **unresolved and is this
   session's work** — also whether the row is reliably present (it is gated by
   `SUBSTRATE_TRAJECTORY_WRITE_ENABLED`; treat its live state as **unverified from a repo session**).
   If joinable, this is by far the lightest fix. **Do not assume it works.**
3. **Corrected public claims** — amend `attests[1]` and add a supply-provenance `does_not_attest` route.
   **Note this is an EDIT to a served string, not an append** — the S10 pin `S2-37` is strict reference
   identity (`s10-trust-record-surface.test.ts:266-278`) and **detects neither a missing nor a
   materially wrong item**, so any edit needs its own content pin (the `S2-39`/`S2-40` precedent).
   Requires an ADR-013 §8 dated amendment + `trust-record-payload.ts` + the battery pin **in the same
   edit**, plus founder R18 sign-off for the three public surfaces.
4. **Route (i) — the independent/ensemble extractor.** A second server-side extraction over the
   submitted text (**required on every `/api/reason` path**), checked against a caller-supplied schema.
   Ruled *"not weaker than route (ii) on the substance of the threat,"* and — per the ruling — it
   **would close the provenance gap as a side effect**, because a server-side extraction establishes
   provenance before the event is minted. **This is why the two items are one session.**

**These are not mutually exclusive.** (3) may be owed regardless as an honesty correction while a
structural fix is built. Scope the interactions, not just the options.

## Part D — What the session must produce

1. **A scope document** at `operations/agent-circles-2026-08/2026-08-25-extraction-provenance-and-independent-extractor-SCOPE.md`
   covering **both** items as one architecture, with: the verified mechanism facts (re-verified, not
   inherited); each option's **cost, blast radius, tier, and what it does and does not close**; the
   joinability question resolved **at source** (option 2 lives or dies on it); route (i)'s cost and
   latency **estimated with the estimate's basis stated**; and the interaction between a structural fix
   and the honesty correction.
2. **A mentor question**, almost certainly — the fix choice has architectural consequence and the
   ruling declined to make it. **PR20 applies:** name the mechanisms the ruling will land on.
3. **A recommendation is permitted; a decision is not.** Recommend with reasoning; do not elect.

## Constraints that bind

- **NO BUILD.** No code, migration, flag, credential, or public-surface edit. **The ruling licenses
  none**, and scoping is not licensing.
- **Do not split the two items.** Ruled explicitly.
- **Do not touch `attests[]`/`does_not_attest[]`** this session — an edit to a served string needs
  founder R18 sign-off and probably a ruling; scoping it is in scope, editing it is not.
- **Do not re-open** route (ii), the GS-CYB-1 amendment, or the bar's Arm-B measurement. All settled.
- **PR19 does not engage** for a documents session — **but say so explicitly**, and note that when this
  becomes a build it engages hard (trust-core + auth-adjacent + a public attestation surface). The last
  two mentor questions both needed a full adversarial pass before they were fit to relay; budget for it.
- **Concurrency:** `ListAgents` at open; `git status` before writing and again before committing;
  path-scoped commits; exclude `website/src/data/environmental-context.json`.
- Weights BLOCKED. The Q1 hard constraint untouched. Nothing here bears on the 0h call.

## Rollback

`git revert` the records commit. Documents only.

## What "done" looks like

Both items are scoped as **one** architecture; the joinability question is answered at source rather
than assumed; every option carries an honest cost and blast radius; the public-claim inaccuracy is
scoped but **not** edited; and the fix choice is put to the mentor rather than taken. **A session that
produces a scope and a question, and builds nothing, is the intended outcome.**

*End of prompt.*
