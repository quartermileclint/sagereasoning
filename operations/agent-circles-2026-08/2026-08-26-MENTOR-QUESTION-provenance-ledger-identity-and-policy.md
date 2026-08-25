# Mentor question — the provenance ledger: an identity conflict, an unruled policy, and one departure

**Raised 2026-08-26**, from the scoping session ruled onto this date
(`2026-08-26-provenance-ledger-SCOPE.md`, `D-PROVENANCE-LEDGER-SCOPED-2026-08-26`).

**Status: FOUR questions, founder-elected escalation.** The scoping document's own §15 concluded that
**no** mentor question was owed and offered the founder the escalation explicitly. **The founder
elected to escalate**, and two rounds of independent review — the second run specifically to check the
first — found that §15 was wrong on every question below: Q1 rests on a structural conflict the first
pass had not found; Q3 is a departure from binding text the first pass made without labelling it as one;
Q2 the first pass never raised at all; and Q4 (a threshold-termination problem plus a public-record
honesty hole) surfaced only on the second independent pass. **This document itself was corrected twice
before reaching this state** — recorded, not smoothed over, because the corrections are as informative
as the findings.

**Binding and not re-opened:** option (a); refuse-on-missing; insert-once; the owner+agent scoping
unit *as a principle*; the phased record-only→enforce shape; F-2's requirement that a refusal be
visible; the attestation standing as written; route (i) and route (ii) as separate questions.

**Licenses no code.** Nothing has been built. Every step remains its own founder-walked 0c-ii.

---

## §0 — What the scoping found that the ruling could not see

Three things, in the order they matter.

**1. F-1's correction cannot be satisfied by any credential configuration reachable today.** Not for
the harness it was raised to protect, and not by misconfiguration — by the interaction of three
independent live constraints. **This is Q1**, and it is the one the scoping could not resolve.

**2. The ledger's central policy question is unruled.** Q4 ruled what happens when an artifact has **no**
ledger entry. It did not rule what happens when an entry **exists and says `supplied`** — which is the
case the whole urgent item is about. **This is Q2.**

**3. F-2 named `coverage_gaps` as the surface; the mechanism cannot carry what F-2 requires.** The
scoping recommended a sibling field and did not label that as a departure. **This is Q3.**

**4. The switch-on threshold may be unmeetable on an open population, and the honesty surface it gates
has a 404-shaped hole.** Both surfaced only when a second independent review checked the first pass's
own design arguments. **This is Q4.**

---

## §1 — Q1: the identity rule and the credential-uniqueness index are in structural conflict

### 1.1 What F-1 corrected, and why

F-1 corrected the scoping unit from bare credential to the **owner+agent pair with a credential-only
fallback**, because a bare-credential scoping *"refuses every mint from the project's own dogfood"* —
the harness runs a **consult** credential that produces the signed assessments and a separate
**accreditation-write** credential that submits them. The correction's stated purpose was to permit
*"the same owner's same declared agent resolving its own signatures across a legitimate consult/write
split and across rotation."*

### 1.2 Why the corrected unit does not deliver that

**Four facts, each verified at source, together closing every exit.**

**(a) `resolveLongitudinalIdentity` reaches `owner_agent_pair` only when owner AND agent are both
non-null.** Otherwise it returns `{kind:'credential', …}` — and it does so *deliberately*, as a
cross-tenant guard, because a `(null, agent_id)` join would aggregate any owner-less credential
claiming that agent_id. The module names the s9-loop consult credential by shape in its own docstring.
`website/src/lib/substrate/longitudinal-identity.ts:20-25, 76-92`

**(b) The s9-loop consult credential is owner-less — and this is FORCED, not chosen.**
`api_keys_upc_owner_agent_active_uniq` is `UNIQUE (owner_user_id, agent_id) WHERE is_active AND
owner_user_id IS NOT NULL AND agent_id IS NOT NULL`, and the 6e migration states the consequence in its
own words: it *"already forbids two ACTIVE rows per (owner,agent) **across all purposes**."* The
write-class credential **must** be owner+agent bound (the 6e §A invariant). **So an agent using a split
consult/write pair can only have both active if the consult credential is owner-less.**
`supabase-api-keys-upc-step3-unique-index-migration.sql:57-61`; `…step6e…:357-359`

**(c) This has already happened on production, been root-caused, and been resolved in exactly this
direction.** A mint that owner-bound both credentials collided on that index with a `23505`; the record
states the resolution: the consult credential was *"revoked and re-minted owner-less (matching the
s9-loop precedent exactly — only the write credential is owner-bound)."*
`operations/decision-log.md:15851`

**(d) The single-credential escape is refused by the harness's own code.** Collapsing to one credential
carrying both `consult` and `accreditation_write` would satisfy the identity rule. **The reference
harness refuses to write in that configuration**: `if (cfg.accredCredential === cfg.credential) return
"refused-marker-credential";` — a guard added deliberately from a HIGH adversarial-review finding at
Slice 5a, to keep the consult/marker credential out of the write path.
`harness/gate1-pre-decision/claude-code/hooks/close-hook.mjs:152-154`

**The conclusion:** for any agent using a split consult/write pair, the consult side resolves to
`credential` and the write side to `owner_agent_pair`, they never match, and **every mint is refused.**
Not as a misconfiguration to be corrected — as the only configuration the uniqueness index permits.

### 1.3 F-1's supporting example is defeated by the same fact

The addendum cited the rotation incident: bare-credential scoping *"would have truncated the trust
record at that point."* But **gen-1 and gen-2 consult credentials are both owner-less**, so pair scoping
would not have joined them either. The identity module says so itself: for the agent-declared owner-less
case it *discloses* truncation rather than spanning it, naming the gen-1→gen-2 s9-loop instance by name.
`longitudinal-identity.ts:136-138`

**We state this plainly because F-1's principle is not in question and should not be diluted by
overstating what it fixed.** The principle — do not introduce an unbounded cross-credential lookup — is
sound and we are not asking for it to be revisited. What is in question is whether the unit it names can
be satisfied at all.

### 1.4 The three exits, and why scoping could not take any of them

| | Exit | Why it is not available to a scoping session |
|---|---|---|
| **A** | Collapse to **one credential per agent** carrying both capabilities | Satisfies the rule, and is what the UPC design (SR-14, "one credential") intends. **But it reverses the documented least-privilege split** — the harness's two credentials exist so the credential that produces assessments cannot also submit them, and the harness enforces that separation in code (1.2d). **This project has had a credential-exposure incident** (2026-07-17, which caused the rotation F-1 cites). Merging enlarges the blast radius of the next one. **That is a security-posture decision traded for a provenance mechanism, and it is not ours to make.** |
| **B** | **Relax the ledger's matching** so a `credential`-kind entry resolves to an `owner_agent_pair` lookup sharing the agent_id | This *is* the `(null, agent_id)` join the cross-tenant guard forbids, and it reintroduces exactly the cross-credential surface F-1's principle protects. **Rejecting this is not a close call.** |
| **C** | Accept that split-pair agents are permanently refused, and let the coverage gaps show | Honest, and F-2 makes it visible. But it means **the project's own reference integration can never mint a trust event under enforcement** — and the switch-on threshold could then never be met honestly. |

**F-3 set the escalation threshold explicitly: *"Escalate only if the tension proves unresolvable in
scoping."*** We judge it unresolvable, because every exit trades away something ruled or documented
elsewhere.

### 1.5 The question

> **Q1. Given that the owner+agent pair cannot be reached on the consult side for any agent using a
> split consult/write credential pair — and that the split is forced by the uniqueness index, not
> chosen — which of A, B, or C is right? Specifically: is collapsing to one credential per agent
> (exit A) an acceptable trade of the documented least-privilege separation for provenance
> verifiability, in a project that has already had one credential exposure?**

**One fact is still owed and we are not asserting it.** The s9-loop consult credential's live
`owner_user_id` is a repo-record claim converging from four places, **not a database verification** — no
repo session can query production. The founder's query is in the scope's §12.1. **If it returns
owner-bound, Q1 narrows** from a live defect to a general rule about split pairs — but the rule, and
the uniqueness-index conflict behind it, hold either way.

---

## §2 — Q2: what happens when the ledger entry exists and says `supplied`

### 2.1 The gap

Q4's first policy ruled the **missing-entry** case: *"an artifact with no ledger entry ⇒ REFUSE the
mint."* Neither the ruling nor the prior scoping states what happens when the lookup **succeeds** and
returns `layer1_source = 'supplied'`.

That is not an edge case. **It is the case the urgent item is about.** The registered defect is that
`emitAccreditationTrustEvents` has no extraction-provenance check while its sibling
`emitOrientationReadingTrustEvent` has exactly one — `if (input.layer1Source !== 'server') return //
supplied extractions never mint a reading`. Confirmed at HEAD: `layer1Source` appears **only** in the
orientation hook and **nowhere** in the accreditation hook.
`website/src/lib/substrate/trust-core/emission-hooks.ts:465` vs `:74-124`

**The two readings give opposite mechanisms:**

- **Refuse on `supplied`** — mirrors the sibling guard and actually closes the asymmetry the ruling
  named. The ledger's purpose becomes *enabling* the guard the older surface lacks.
- **Mint on `supplied`** — the ledger records provenance but gates nothing on it, and the corrected
  public attestation would still be inaccurate for exactly the population it was corrected for.

We read the ruling's intent as the first. **But we will not build the first on inference**, because it
has a consequence the ruling did not weigh.

### 2.2 The consequence, which is why this cannot be inferred

**A supplied `layer1_schema` is MANDATORY on the plugin path** (`sr_inst_`; absent ⇒ 400), and the
`plugin_install` capability preset is `{consult, l1_supply}` — **no `accreditation_write`**, so a plugin
credential can never submit its own artifacts.
`api/reason/route.ts:554-568`; `practice-credential.ts:216-220`

**So refuse-on-`supplied` means no plugin-path artifact can ever mint an accreditation trust event.**
That decides the plugin path's standing in the trust record **as a side effect of a provenance
mechanism** — which is precisely the failure mode ruled against for route (i): *"it decides that
capability's fate — including on the plugin path where it is mandatory — as a side effect rather than
as a decision."* Q3 sent that question to its own session for exactly this reason.

### 2.3 The question

> **Q2. Does a ledger entry reading `supplied` refuse the mint, mirroring the orientation sibling's
> guard? And if so, is it acceptable that this bars the plugin path — where supplied extraction is
> mandatory — from the trust record entirely, or does that consequence belong with route (i)'s own
> session rather than being settled here?**

---

## §3 — Q3: the coverage-gap surface, and a departure we should have labelled

### 3.1 What F-2 said, and what we recommended

F-2, verbatim: *"The existing coverage_gaps field is the right surface."*

**The scoping recommended a new sibling field instead**, and — this is the defect — presented it as a
design decision rather than as a departure from binding text. **The independent review found that, and
it is right.** Recorded here rather than corrected quietly.

### 3.2 Why the mechanism resists the literal instruction

`coverage_gaps` is `VirtueTrustDomain[]` — a bare array of virtue-domain *names*, living inside the
aggregate block, populated from domains whose evidence was A2-zeroed
(`if (!contributes) coverageGaps.push(s.domain)`). It has no room for a reason string or the
did-not-practise clause, **and a refused mint is an event-level fact, not a domain-level one.**
`trust-record-payload.ts:131, 383`; `combiner.ts:678-683`

So F-2's minimum content cannot be carried there without restructuring the field — which is itself a
served-payload change, and one that would give a single field two unrelated meanings.

### 3.3 What we recommend instead, and why we think it honours F-2's reasoning

The same payload already carries an exact structural precedent — **the C2c `orientation_readings`
list**: optional, capped, newest-first, **each entry carrying its honest clause inline** (ruled that way
because *"the entry is the unit that will be read in isolation"*), served with a total count so a reader
sees *"showing 50 of 847"* rather than inferring completeness. F-2's three required elements map onto it
one-for-one, and F-2's hard exclusion can be enforced at the **schema** level rather than the serialiser,
so no future serving change can leak artifact detail.

### 3.4 The question

> **Q3. Is a sibling field modelled on `orientation_readings` an acceptable reading of F-2 — the
> existing machinery, one layer over from the field named — or should `coverage_gaps` itself be
> restructured to carry event-level refusals despite the mixed semantics?**

---

## §3b — Q4: whether the switch-on threshold can ever clear, and a public-record honesty hole a
second-pass review found

**Two further findings, both from an independent review run after this document's first draft, both
real.**

**The threshold may be unmeetable as stated.** Condition C1 (identity coherence) is a universal over
*every* agent with a write in the trailing 90 days, evaluated on an **open, growing** population — every
future onboarding re-tests it. §1 shows the fix is cheap for the founder's own harness but, per §1.4
exit A/B's rejection and the erasure-path cost named there, is not free for an **external consumer** —
binding an owner to a consult credential removes it from `POST /api/credential/erase`'s scope
(`owner_user_id IS NULL`). A threshold that gets harder to satisfy as the system grows is the wrong
shape for a phase addendum 2 requires to terminate, and "accept and disclose" is already ruled
unavailable. **Concretely: an agent whose accreditation chain legitimately resubmits one pre-ledger
signed assessment never reaches 100% resolution under C2, permanently — insert-once means no backfill,
and absence is indistinguishable from missing.**

**F-2's guarantee has a hole at exactly the population it is meant to protect.** `GET
/api/trust-record/{agent_id}` 404s when no domain carries evidence (the ENV-1 evidence gate — itself a
correct, previously-ruled design decision). The proposed `provenance_gaps` field lives inside the
payload that gate only composes on a 200. **An agent whose mints are ALL refused — precisely the
population C1 targets — never accumulates evidence, its record 404s, and its gap entries render
nowhere.** The reader gets silence for the agent F-2 is most concerned with, while the live claim
promises the gap will appear *"on this record."*

### The question

> **Q4. Given that C1's population is open and growing, with at least one concrete non-clearing
> scenario (the immortal-chain agent above): should the switch-on threshold be evaluated once, over a
> FROZEN cohort of agents active at evaluation time (new agents onboard into enforcement rather than
> blocking it) — and should there be a named exception path, or a hard review date, for an agent that
> cannot clear? And separately: should the public trust record's 404 gate (ENV-1) be relaxed so a
> provenance-gap-only agent still surfaces its gaps, or is the honest answer that such an agent's
> refusals go unseen until it produces other evidence — a limit that itself needs to be disclosed
> somewhere the reader can find it?**

## §4 — Full results: what the scoping settled and is NOT asking about

Reported for completeness. **No ruling is sought on any of these**; they are stated so that a ruling on
Q1–Q3 can be given against the whole picture.

| | Result |
|---|---|
| **Option (a) does not fail** | No limit was found that makes it unacceptable. **(b) and the hybrid stay available and unneeded.** The limits Q1 and Q2 raise are about *policy and configuration*, not about the ledger's structure |
| **Switch-on threshold** (addendum 2's hard requirement) | Defined as four checkable conditions: identity coherence; 100% artifact resolution over the trailing 30 days observed two weeks; a ≥90-day drain of pre-ledger artifacts; the gap surface live and R18-signed before any refusal can fire. **100% is argued, not assumed** — at ~10 agents any percentage below it is one agent, and would ship enforcement into a known silent refusal. **Q1 is condition 1, and today it fails** |
| **Q4 wording** (addendum 2's named task) | **Confirmed; no amendment recommended.** The live clause binds the update to a fix *characterised by* the coverage-gap behaviour, so read whole it already fires the second edit at **enforcement**, not at first ship — a consequence of §F-2-DRAFT putting both halves in one sentence. The residual whole-sentence-parse dependency is stated rather than hidden; amending would be a third edit to a served claim to sharpen a distinction the sentence already carries |
| **Window: 90 days** (F-3 ii, from data) | PA-10's exposure is currently **unbounded**, so every finite window strictly improves it; 90 is where all three sibling tables already retain; and the only production write pattern on record is **session-scoped by construction** (`close-hook.mjs` writes at `Stop` from a session-id-keyed provenance file), so submitted artifacts are hours old |
| **PA-10 coupling** (F-3 i) | **Runs opposite to the de-scheduling reading.** A5's recency tier has never been wired because **no artifact-age signal exists anywhere** — the signed envelope has no timestamp, which is why AE-2 took ADR-014 §6's refuse branch and disclosed that replayed evidence is not age-detectable. A ledger storing `recorded_at` supplies that missing input for the first time, so it **enables** the scheduled closure rather than substituting for it. **Recommendation: do not de-schedule it** |
| **F-3 iii** (F-2's effect on the cost calculus) | Carried explicitly. At 90 days against a session-scoped write pattern, the steady-state frequency of *out-of-window* gap entries is approximately zero; the entries that would appear are transitional and the threshold is designed to drain them |
| **The refusal record is not a trust event** | `agent_trust_events.artifact_ref` is `NOT NULL` under the stated invariant *"no trust event without a verifiable artifact"* — and a refusal is by definition the case where none exists. Putting it there means fabricating a ref or widening the invariant `TRUST_RECORD_ENVELOPE.attests[0]` publicly rests on. The `agent_hold_observations` precedent is the right one |
| **"Refuse the mint" ≠ "refuse the write"** | The emission hook sits after the writer and never throws to it; the accreditation write still returns 200 |
| **What the fix does not cover** | The **454 unmarked historical consults** — no ledger repairs them and the attestation stays inaccurate for events already minted from them; every artifact signed before the ledger exists; artifacts outside the window; **Arm-B**; the emission-hooks asymmetry as a class; user-JWT consults; `/api/guardrail`, which is structurally supply-proof |

---

## §5 — Verification status, stated honestly

**Verified first-hand at source** and then **independently re-reviewed** by a separate reviewer
instructed to refute rather than confirm: every mechanism fact in Q1 and Q2, the uniqueness-index
conflict, the production `23505` record, the harness's same-credential refusal, the `coverage_gaps`
shape and its combiner source, and the absence of any `layer1Source` check at the accreditation hook.

**Not verified, and not asserted:**
- The s9-loop consult credential's **live `owner_user_id`** — repo record converging from four places,
  no database access from a repo session. Q1's liveness turns on it; Q1's structure does not.
- The **age distribution of submitted artifacts** — unmeasurable today, because nothing persists a
  signature. That is the defect itself. A proxy query is in the scope's §12.2.

**A correction against the scoping session's own judgement, stated twice because it happened twice.**
Its §15 first argued no mentor question was owed, and was wrong: on Q1 because the session had not found
the uniqueness-index conflict; on Q3 because the session departed from binding text without labelling
the departure; Q2 the session did not identify at all. **A second independent-review pass, run on the
design arguments the first pass had already accepted, then found Q4** — that the switch-on threshold as
first drafted may be structurally unable to clear, and that the honesty surface it gates 404s for
exactly the population it is meant to serve. **The founder's election to escalate was correct on the
merits at every step, not merely permitted, and the document is stronger for having been checked twice
rather than once.**

---

## Cross-references

- `2026-08-26-provenance-ledger-SCOPE.md` — the scoping this qualifies
- `2026-08-25-mentor-ruling-extraction-provenance-fix-choice-verbatim.md` — binding, with both addenda
- `operations/primal-substrate-2026-08/00-PRIORITY-INDEX.md` — ⚠ URGENT, item 2
