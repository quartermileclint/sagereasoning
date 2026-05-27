# ADR — Credential Scope and Coverage Status (Sage Practice)

**Status:** Accepted 2026-05-26 under `D-SAGE-PRACTICE-DISTRIBUTION-IDENTITY-ELECTIONS-2026-05-26`. Builds on `D-SAGE-PRACTICE-DIRECTION-COVERAGE-STATUS-2026-05-26` (the substrate-consultation verdict that produced the `coverage_status` design + the Sage Practice naming).
**Decision ID:** K1 ADR (Credential Scope + Coverage Status).
**Scope:** How a Sage Practice / Sage Assent credential is **identified, scoped, and kept honest** — the agent-identity key, the operator-vs-agent separation, the portable-creator-credential rule, and the `coverage_status` state machine. This ADR is the **keystone the Session-4 Sage Practice guardrail + dashboard spec consumes** (the spec must not re-derive identity or coverage_status — it builds on this).
**Authoritative cross-references:** `/manifest.md` §R18f (no false credential), §R18d (adversarial containment), §R19 (honest positioning), §R16/§R17 (data governance + R17c genuine deletion); `/operations/decision-log.md` — `D-SAGE-PRACTICE-DISTRIBUTION-IDENTITY-ELECTIONS-2026-05-26` (adoption entry) + `D-SAGE-PRACTICE-DIRECTION-COVERAGE-STATUS-2026-05-26` (the coverage_status verdict).

---

## Decision

A Sage Assent credential is a **dated, scoped verdict — not a binary pass/fail** — governed by two coupled mechanisms:

### 1. Composite identity key

A credential is keyed by the pair:

```
(operator_account, agent_identity)        agent_identity = namespace:name@version
```

- **operator_account** — whoever is *running and monitoring* the agent (the developer in front of it).
- **agent_identity** — what the agent *is*, independent of who runs it: a publisher namespace + name + version, named like a package.

The accreditation record is keyed by the pair, so **own-use and trial-use are always distinct records and are never merged.**

### 2. `coverage_status` state machine

Every credential carries a `coverage_status` object, always present and always accurate:

```
coverage_status: {
  status: enum            // continuous | suspended | resumed_unverified | expired | agent_elected
  operator: string        // the operator_account the verdict was earned under
  agent_identity: string  // namespace:name@version
  monitored_since: timestamp
  gap_present: boolean
  gap_duration: integer | null   // turns or minutes
  credential_basis: string       // e.g. "examined under <operator> from <t1> to <t2>; identity <ns:name@version>"
}
```

State transitions:

- **`continuous`** — the deterministic hook examined every consequential action over the window. The only state that earns a "continuously examined" claim.
- **`suspended`** — the guardrail hook is off. The prior examination was real (not revoked); the *current* reasoning is unexamined.
- **`resumed_unverified`** — the hook returned. The credential does **not** auto-resume; a fresh SageReasoning pass is required before it is `continuous` again.
- **`expired`** — a wall-clock backstop crossed without renewal; re-earn via a fresh pass. (Gaps and expiry are the same idea — a dated, scoped verdict — handled by one machine.)
- **`agent_elected`** — earned via *discretionary* MCP-tool consultation (the agent chose which actions to submit). Inherently partial; **never** `continuous`. This is the honest label for the MCP-distribution path where no deterministic monitor exists.

### 3. Portable creator credential as reference

A downloaded/trialed agent may **arrive carrying its creator's credential** (the portable `carried_profile` + provenance). It is shown **read-only as a reference** ("earned under [creator], window Y"). The trialer's runs build a **separate** operator-scoped record. The creator's credential is never added to, and never claimed as the trialer's own. The provenance attestation (R18f) is what keeps this honest.

### 4. The two settled choices

- **Coarse version granularity.** `@version` is developer-declared or a content-hash of the agent's defining config (prompt/model/tools). A **material** change forks `agent_identity` (or triggers `resumed_unverified`) — a substantially changed agent should not silently inherit its old credential.
- **Trial → adopt.** A trial record carries forward into an own-agent record **only when operator + conditions are unchanged**; otherwise it forks.

---

## Context

Three forces converged this session:

1. **The honest-credential verdict** (2026-05-26 substrate consultation): "refuse to certify across gaps" — a credential covers only the reasoning actually examined; the toggle turns monitoring off, not the credential silently off-but-running.
2. **The MCP-vs-hook distinction** (verified against current Claude Code docs, PR11): MCP tool invocation is *model-discretionary*; deterministic continuous monitoring requires a **client-side hook**, which an MCP server cannot install. So credentials earned via MCP tools vs the hook carry different evidentiary weight — hence the `agent_elected` vs `continuous` values.
3. **Two real scenarios** the founder raised: a developer with a *library of own agents*, and *trialing downloaded agents not created by the developer*. The simple `account:agent_name` key conflates the operator with the agent and breaks the trialing case (it would either pollute the creator's record or let a downloaded credential be passed off as the trialer's deployment-safety evidence).

This ADR also reuses the **portable `carried_profile` + provenance** from the 2026-05-26 scaling analysis (central persistence for the certified subset; aggregate-not-raw), and composes with the elected distribution stack (MCP tool/read surface → plugin hook/control surface → web dashboard read surface).

### The four cases

| Case | operator_account | agent_identity | Record behaviour | What the developer sees |
|---|---|---|---|---|
| Own — new agent | you | `you:name@v1` | fresh record; builds under your monitoring | your agent's emerging credential |
| Own — existing agent | you | `you:name@vN` | continues (subject to version forking) | a `continuous` credential (if hook-monitored) |
| **Trial — downloaded agent** | you | `publisher:name@v` (from its package) | a **new** record under *your* account | the creator's credential **read-only as a reference** + your own trial credential (in progress) |
| Trial → you fork/modify it | you | `you:fork-of(publisher:name)@v1` | fresh record — a different entity | a new own-agent credential |

Friction handling: **own agents** are declared via a manifest/registry or auto-assigned (bulk, not one-at-a-time); **downloaded agents self-identify** from their package / agent-card (the trialer names nothing — the trial record is auto-keyed by `their_account + the agent's declared identity`).

---

## Alternatives considered (and reasoning for rejection)

**Simple `account:agent_name` key.** Rejected — conflates the operator with the agent. It cannot represent a trialed agent (whose identity belongs to its publisher, not the trialer) without either polluting the creator's record or letting a downloaded credential be passed off as the trialer's. The composite pair fixes this.

**Merging trial runs into the creator's record.** Rejected — different operator, different conditions, possibly different config. Merging corrupts the creator's record and is an integrity hazard (R18d). Trial runs always fork an operator-scoped record.

**MCP-as-tools alone delivering `continuous` coverage.** Rejected — MCP tool invocation is discretionary, so it cannot honestly claim every action was examined. The `agent_elected` state is the honest label for that path; `continuous` is reserved for the hook.

**Fine-grained per-change versioning.** Rejected as the default — too many credential resets. A coarse content-hash/declared version that forks only on *material* change is the chosen balance (revisit if it proves wrong).

**Treating `expires_at` as a separate concern.** Rejected — folded into the `coverage_status` machine (`expired` is just another non-continuous state), so gaps and expiry share one mechanism.

---

## Reasoning for adoption

1. **Honesty by construction (R18f / R19).** A credential is always scoped to *operator + agent_identity@version + examined window*. `credential_basis` makes "whose hands, which version, which window" legible to any downstream reader. A developer who omits the coverage_status downstream is the one misrepresenting — the product is not. This is the same principle as the Session-1 no-practice disclaimer.
2. **Adversarial defence (R18d).** Operator-scoping defeats the download-a-well-credentialed-agent-and-pass-off-its-score attack: the creator's credential is clearly earned elsewhere; the trialer's own record is thin and theirs.
3. **Covers both real scenarios cleanly** — own libraries and trialed downloads — without special-casing.
4. **Composes with the elected distribution stack.** `agent_elected` is the honest MCP-tool credential; `continuous` is the honest plugin-hook credential; the web dashboard reads both from the central store.
5. **Reuses existing architecture** — the portable `carried_profile` + provenance attestation, and the aggregate-not-raw / certified-subset persistence from the scaling analysis.

---

## Consequences

**Positive.**

- A single honest credential model across distribution channels (MCP-tool and plugin-hook).
- Clean separation of own-use vs trial-use; no record pollution.
- `credential_basis` gives downstream consumers an auditable scope statement.
- Gaps and expiry share one state machine.

**Negative / accepted trade-offs.**

- Implementing `coverage_status` is a **Sage Assent output-schema change** and the composite key is an accreditation-store change — both are **code-elevated/critical when built** (they touch the credential surface), each its own session. This ADR is the decision; the build is deferred.
- Coarse versioning resets a credential on material change (accepted — a changed agent shouldn't inherit an old verdict).
- The **control surface (toggle, presets) and the live "running now" view are client-coupled** — they live where the hook lives, so a pure web dashboard can display state/last-known but enforcement is in the plugin.

---

## Revisit conditions

1. **Deterministic MCP invocation emerges.** If an MCP client/protocol mechanism guarantees a tool runs before others, re-evaluate whether `agent_elected` can ever upgrade toward `continuous` on the MCP path.
2. **Version-granularity miscalibration.** If coarse versioning causes too many resets (continuity lost) or too few (stale credentials surviving big changes), revisit the fork rule.
3. **Multi-tenant / org operator cases.** If a real deployment needs an operator to be an *organisation* with many developers, or shared-agent ownership, the `(operator_account, agent_identity)` pair may need an org dimension.
4. **R18 certification-language drift.** If the manifest's R18 honest-certification language changes the required disclosures, align `credential_basis` wording.

Each revisit produces a new ADR superseding this one. The original is preserved.

---

## Cross-references

- `/operations/decision-log.md` — `D-SAGE-PRACTICE-DISTRIBUTION-IDENTITY-ELECTIONS-2026-05-26` (adoption); `D-SAGE-PRACTICE-DIRECTION-COVERAGE-STATUS-2026-05-26` (the coverage_status verdict + Sage Practice naming)
- `/operations/handoffs/founder/2026-05-26-sage-practice-exploration-close.md` (the exploration arc that produced these findings)
- `/operations/handoffs/founder/2026-05-26-sage-practice-sequence-v2-NEXT-SESSION-PROMPT.md` (the sequence; Session 4 consumes this ADR)
- `/manifest.md` §R18f, §R18d, §R19, §R16, §R17
- The substrate / Sage Assent surfaces this will touch when built: `website/src/lib/substrate/sage-assent-accreditation-store.ts`, `sage-assent-wrapper.ts` (`createCarriedProfile`, the portable profile + provenance), `website/src/app/api/accreditation/[agent_id]/` (the credential write/output surface), `website/src/lib/translation-sandwich/layer1-extractor.ts` (`carried_profile` / `profile_provenance` carried-context fields)

---

*End of K1 ADR. Credential scope (composite key) + coverage_status state machine accepted 2026-05-26 as the keystone for the Sage Practice guardrail + dashboard spec. Implementation deferred to its own code-elevated/critical session(s); revisit on the four named conditions above.*
