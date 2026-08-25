# Next-Session Prompt — Scope the signature-keyed provenance ledger (ruled option (a))

**Paste as the first message of a new session, in the `sagereasoning` repo root.**

**Stream:** founder.
**Tier:** `governance` — **A SCOPING SESSION. DOCUMENTS ONLY.** No code, migration, flag, credential,
or public surface. **AC7 not engaged.**
**Risk:** Standard *for the scoping*. **What it scopes is `code-critical` when built** — new schema +
trust-core + the accreditation write boundary + a served public payload.
**Governing frame:** `/adopted/standing-protocol-cache.md` (note §6 concurrency — `ListAgents` at open).

**This is mentor-ordered.** The 2026-08-25 ruling elected option (a) — *"the signature-keyed
provenance ledger is the right structural fix to scope first"* — and placed its four policy choices
**inside this scoping**, not before it. **Binding, verbatim wins:**
`operations/agent-circles-2026-08/2026-08-25-mentor-ruling-extraction-provenance-fix-choice-verbatim.md`
**including its ADDENDUM** (F-1/F-2/F-3), which is part of the binding record.

---

## Step 0 — Open and re-ground

1. `/adopted/standing-protocol-cache.md`; `git log -1`; `git status`; `ListAgents`.
2. **Read in full, both binding:** the ruling above **and its ADDENDUM**; then
   `operations/agent-circles-2026-08/2026-08-25-extraction-provenance-and-independent-extractor-SCOPE.md`
   (the mechanism facts — §2, §2.1, §3 especially).
3. Read `operations/primal-substrate-2026-08/00-PRIORITY-INDEX.md`, the ⚠ URGENT block (item 2 is this).
4. Confirm at open: tier; hold-point P0 0h; weights BLOCKED; **documents only, no build.**

## Step 1 — What is already RULED and must not be re-litigated

| | Ruled |
|---|---|
| **The option** | Option (a), the signature-keyed ledger. (b) signed-payload provenance and the hybrid **remain available only if (a)'s limits prove unacceptable after scoping** — do not silently re-open them; if scoping shows (a) fails, say so explicitly and stop. |
| **Missing entry** | **Refuse the mint.** *"A ledger that mints on missing entries… is a corrected-sounding claim with a silent carve-out."* |
| **Write semantics** | **Insert-once, never upsert.** *"Insert-once is a limit on correction, not a vulnerability. Upsert is a vulnerability."* |
| **Scoping unit** | **Owner+agent pair, with a credential-only fallback** — the bare-credential form was **corrected** (F-1). Use `website/src/lib/substrate/longitudinal-identity.ts`'s existing `resolveLongitudinalIdentity`; **do not invent a second identity notion.** No new disclosure is required — the existing rotation-truncation disclosure covers the fallback. |
| **Refusal visibility** | **Every refused mint surfaces as a NAMED COVERAGE GAP, never silence** (F-2). Minimum content: the non-mint; the reason (missing/out-of-window entry); **that it does not mean the agent did not practise.** **Hard exclusion:** no signature or artifact detail *"that would expose the provenance mechanism to gaming."* |

## Step 2 — THE FINDING THAT WILL SHAPE THIS MOST (find it early or waste the session)

**F-2 names `coverage_gaps` as "the existing machinery." It cannot carry what F-2 requires.**

Verified 2026-08-25 and re-confirmed at HEAD: `coverage_gaps: VirtueTrustDomain[]`
(`trust-record-payload.ts:131`) is a **bare array of virtue-domain names**, populated from
`aggregate.coverageGaps` and **scoped to the aggregate block**. It names *which domains lack evidence*.
It has no room for a reason string or the did-not-stop-practising clause — **and a refused mint is an
EVENT-level fact, not a domain-level one.**

So delivering F-2 requires **either** extending that field to a structured shape **or** adding a
sibling field. **Either way it is a change to a served public payload**, with its own R18 founder
sign-off, its own ADR-013 §8 treatment, and its own battery pins. **Scope this as a first-class part
of the work, not an implementation detail.** The public honesty commitment is already live and
future-tensed (*"that fix will surface… as a named coverage gap, never as silence"*), so **the fix
cannot ship without satisfying it.**

## Step 3 — F-3's three named inputs (ruled INTO this session, not pre-answered)

1. **The PA-10 coupling — carry it as a named dependency.** Refuse-on-missing **incidentally narrows
   the disclosed stale-artifact replay class**, whose declared closure path is *"recency-tier
   confidence weighting at the S2 fold wiring."* **Assess how much it changes the case for that
   scheduled work.** Name it in the scope document — *"not discovered mid-build."*
2. **Window length resolves FROM DATA, not first principles.** Longer = more coverage but longer
   replay exposure; shorter = tighter replay but more legitimate historical writes refused. The
   mentor: assess *"which cost is larger given the actual distribution of historical writes and the
   actual PA-10 exposure window"* — data *"the scoping session has access to and this ruling does
   not."* **Get the numbers; do not reason from principle.**
3. **F-2 changes the cost calculus.** With every refusal publicly visible, window length is *"also a
   decision about how frequently the public record will carry coverage gap entries."* **Carry that
   framing explicitly.**

## Step 4 — Mechanism facts to inherit (re-verify at source; PR20 — this list is a starting point)

- **The signature is per-CONTENT, not per-consult.** Ed25519 signing is deterministic over a
  `Layer2Assessment` with **no timestamp/nonce/request-id**, and `/api/reason` **returns
  `extraction: layer1Schema`**, so a caller can replay the server's own extraction and obtain an
  identical assessment and signature. **This does not defeat the ledger** (a collision needs identical
  content, which gains the caller nothing; the reachable direction fails closed) — **but it is why
  insert-once was ruled**, and the scoping must not assume a 1:1 consult↔signature mapping.
- **Nothing persists a signature today.** The A12 audit row stores only a boolean
  `layer2_signature_present`. The ledger starts empty; **no history is recoverable.**
- **The consult-side write point:** the signed assessment is in scope at `route.ts` where the
  trajectory write already happens (`sandwichResult.output.assessment`), so the ledger write is a
  small addition there — but it inherits that path's gating (`isTrajectoryWriteEnabled()`, error/Tier-1
  exclusions, `credentialRef !== null`).
- **PR24 binds:** if the ledger table declares `retain_until`, **its purge and sweep wiring ship in
  the same session.** Precedent: `purgeExpiredTrajectory` + its cron.
- **`/api/guardrail` is supply-proof** and out of scope — nothing here reaches the surface that acts.

## Step 5 — Founder-run prerequisites (the AI cannot settle these from a repo session)

**Name these at open and ask the founder to run them; several inputs above depend on them.**
1. Live state of `SUBSTRATE_TRAJECTORY_WRITE_ENABLED`, `SUBSTRATE_TRAJECTORY_DELTA_ENABLED`,
   `SUBSTRATE_REASON_LOOP_CLOSURE_ENABLED`, `SUBSTRATE_L1_SCHEMA_KEY_PATH_ENABLED`.
2. **The `l1_supply` population** — how many live credentials carry it (one SQL query). This sizes the
   whole problem and is also the gating input for the route (i) session.
3. **The actual distribution of historical accreditation writes** — Step 3's item 2 cannot be answered
   without it.

## Step 6 — What the session must produce

1. **A scope document** at `operations/agent-circles-2026-08/2026-08-26-provenance-ledger-SCOPE.md`:
   the schema; the write path and its gating; the read/lookup at the accreditation boundary keyed on
   the owner+agent pair; the refusal path; **the coverage-gap surface decision (Step 2) with its cost
   and blast radius**; the retention window **with its data basis stated**; PR24 wiring; the PA-10
   dependency; and an honest statement of what the fix does **not** cover.
2. **A mentor question only if one is genuinely owed** — the fix choice and all four policies are
   already ruled. **Do not manufacture one.** The likely candidate is the coverage-gap surface shape,
   if it turns out to need a served-payload change the ruling did not anticipate.
3. **A recommendation is permitted; a decision is not.**

## Constraints that bind

- **NO BUILD.** Scoping is not licensing. Every schema/flag/credential/public-surface step remains its
  own founder-walked 0c-ii.
- **PR19 engages HARD at build** — trust-core + the auth-adjacent write boundary + a public
  attestation surface, three named surfaces at once. **Budget for a full independent review**, and say
  so in the scope.
- **Do not re-open** the fix choice, Q4's policies, route (ii), GS-CYB-1, or the bar's Arm-B
  measurement. All settled.
- **Concurrency:** `ListAgents` at open; `git status` before writing and again before staging;
  path-scoped commits; exclude `website/src/data/environmental-context.json`.
- Weights BLOCKED. The Q1 hard constraint untouched. Nothing here bears on the 0h call.

## What "done" looks like

The ledger is scoped as a buildable `code-critical` change with an honest coverage statement; **the
coverage-gap surface question is answered rather than deferred**; the retention window carries a
**data-derived** basis, not a principled guess; the PA-10 dependency is named; and nothing is built.

*End of prompt.*
