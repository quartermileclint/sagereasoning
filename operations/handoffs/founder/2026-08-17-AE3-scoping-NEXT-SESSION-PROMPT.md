> **SPENT 2026-09-03** — executed in full; recommendation DEFER unchanged, no build prompt authored; the prompt's own `loop_id` claim corrected (`D-AE3-SCOPING-DEFERRED-LOOP-ID-CLAIM-CORRECTED`, 2026-09-03; scope: `operations/agent-circles-2026-08/2026-09-03-AE3-scoping-SCOPE.md`).

# Next session — AE-3 scoping (NOT a build session)

**Paste this as the first message of a new session, in the `sagereasoning` repo root.**

**Tier: `governance` / scope — documents and read-only analysis only. NO code, no flag, no schema,
no migration, nothing activated.** Founder presence: **required for two questions this session
cannot answer from the repo** (see Part C).

---

## Step 0 — Open

Read: `/adopted/standing-protocol-cache.md` → this prompt in full → **ADR-014 §3.4 in full** (the
cadence-provenance section — it is the reason this item is scoped rather than built) → the R2a
decision-log entry's Part-C decision 2 and the R2b entry's carried list → the AE-1 and AE-2 records
in `CLAUDE.md`'s production-state block.

**Expected HEAD at authoring:** `a256b59` (R2b close). Nothing pushed.

---

## Part A — Why this is a SCOPING session and not a build

AE-3 was in R2b's original build list and was **deliberately deferred by founder election
(2026-08-16)**, on grounds worth restating because they decide what this session does:

> Its first precondition — **structural cadence-provenance** — is **an unmade design decision, not
> a build task.** ADR-014 names two candidate mechanisms (per-channel credentials; a derived
> per-task/per-loop measure) and **makes neither.** And the harness today runs a **single consult
> credential**, so *every* consult is mandated and the "excess consults" the detector keys on is
> effectively **zero**. Building against that produces exactly what ADR-014 §3.4 warns of:
> *"simultaneously always-triggering and never-triggering: pure noise."*

**So the deliverable here is a scope document and a recommendation — not code.** If the session
finds it can be built, it says so and authors a build prompt. If it finds the precondition is still
unmade, it says that plainly and names what would have to be decided first.

**Resist the pull to build.** The failure mode this project has recorded repeatedly
(`method-before-purpose`, KG-EX1) is picking a mechanism before grounding what the thing is *for*
and what observable proves it. AE-3 is the exact shape of that trap: a detector whose signal is
undefined until the cadence question is settled.

---

## Part B — What the session must establish

### 1. What is AE-3 actually for?

State the purpose in one sentence, from ADR-014 §7's own framing — not from the name. Then state
**the observable**: what, concretely, would a working AE-3 let someone see that they cannot see
today? If that observable cannot be stated crisply, that is itself the finding.

### 2. Is structural cadence-provenance decidable now?

ADR-014 names two candidates. For each, establish first-hand:

- **Per-channel credentials.** What would have to change? The harness currently runs
  `sagereasoning:s9-loop@v1` with a single consult credential (see the S9 Live bullet in
  `CLAUDE.md`). Would this mean minting per-channel credentials, and what does that do to the UPC
  capability model, the trust-record identity (the `(owner_user_id, agent_id)` pair), and the
  windowed reads that key on `credential_ref`?
- **A derived per-task/per-loop measure.** Is there enough in the persisted row to derive it?
  `agent_assessment_history` carries `correlation_id`, `credential_ref`, `agent_id`, `created_at`,
  `receipt_id`, `skill_id`, `candidates_considered`, `depth_tier`, `session_marker`, `loop_id`.
  **Read the actual select list** (`agent-assessment-history-store.ts`) rather than this summary.

**Then answer the question that decides the item:** with a single mandated-consult credential, is
the "excess consults" quantity AE-3 keys on **structurally zero**? If yes, AE-3 cannot be built
usefully regardless of which mechanism is chosen, and the recommendation is to keep it deferred
with the precondition named.

### 3. The empirical half — the live proximity distribution

The deferral names *"a non-monoculture distribution"* as the second precondition. **This cannot be
answered from the repo.** It needs a read of the live trajectory rows for the harness identity.

**Recommendation:** ask the founder to run a read-only aggregate — proximity level counts over
`agent_assessment_history` for `sagereasoning:s9-loop@v1`, grouped by `depth_tier` — and bring the
numbers back. If the distribution is a monoculture (one proximity dominating), that is a second
independent reason AE-3 would be noise, and it is worth knowing before any design.

**Do not attempt this from the session.** No prod credentials; the read is the founder's.

---

## Part C — The two questions only the founder can answer

1. **Is per-channel credentialing something the founder wants at all?** It is a real change to the
   credential model and to how the trust record identifies an agent. If the answer is no, that
   collapses one of ADR-014's two candidates and simplifies the scope considerably.
2. **The live proximity distribution** (Part B.3) — the founder runs the read.

---

## Part D — Deliverable

A scope document at `operations/agent-circles-2026-08/` (or the trust-layer directory, whichever
the session judges the better home — state the choice) covering: the purpose and observable; both
candidate mechanisms assessed against the actual code; the structural-zero question answered
plainly; the empirical distribution if the founder supplied it; and **a firm recommendation** —
build, defer with a named precondition, or drop.

Plus a decision-log entry. **If the recommendation is "build", author the build prompt; if it is
"defer" or "drop", say so and do not author one.**

## What NOT to do

- **Do not write code.** Not even "just the pure detector".
- **Do not design a cadence-provenance mechanism** if the finding is that the precondition is
  unmade — naming what must be decided is the deliverable, not deciding it unilaterally.
- **Do not treat AE-1/AE-2's existence as an argument that AE-3 must follow.** The seam AE-1
  pre-built makes AE-3 *cheap to add*, which is not the same as *worth adding*.

## Forecast

Success = the structural-zero question answered first-hand and plainly, both candidate mechanisms
assessed against real code, and a recommendation the founder can act on — including, quite
possibly, "keep this deferred, and here is the one decision that would unblock it."
