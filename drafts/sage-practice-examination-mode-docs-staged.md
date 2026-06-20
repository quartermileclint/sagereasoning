# Staged public-contract docs — `examination_mode` (Gate-1 Arc 1)

**As of:** 2026-06-20 · **Status:** STAGED, **NOT applied to any public surface.** Nothing public changes until activation (R18). Companion to `drafts/sage-practice-examination-mode-credential-build-scope.md` and `D-SAGE-PRACTICE-GATE1-SURFACE-HONESTY-OPTION2-DIFFERENTIATION`.

## Why staged, not applied
Per Arc 1 sequencing the `pre_decision_harness` marker is **issued to no one** (no genuine pre-decision harness exists yet). With the `SUBSTRATE_EXAMINATION_MODE_ENABLED` flag OFF the field is not served at all; with it ON every credential reads `post_decision_check` (honest for today's all-discretionary surfaces). Documenting `pre_decision_harness` as an available configuration **before the harness exists** would be a forward-claim. So this text is held until: (1) the field is activated, and — for the per-configuration "Gate 1 — pre-decision / post-decision (check)" contract language — (2) the harness (Arc 2) exists. The **attestation-limit** paragraph below is the load-bearing honesty and must ship verbatim whenever any of this is applied.

---

## 1. `llms.txt` — new subsection (apply at activation)

```
### Accreditation — Examination mode (pre- vs post-decision)

The public accreditation payload may carry an `examination_mode` field stating
WHEN the examination that backs the credential fired relative to the agent's
decision. It is a separate axis from `coverage_status` (which states coverage
breadth, not timing).

  - "post_decision_check"  — the examination fired AFTER the agent formed its
                             judgement: an honest check that feeds developmental
                             progression. This is the mode for every discretionary
                             API write path.
  - "pre_decision_harness" — the examination was fired by an operator-issued
                             Gate-1 harness BEFORE the agent reasoned.
  - null (or absent)       — examination mode unstated (a credential written
                             before this field existed).

HONEST LIMIT (read this before relying on the field). `examination_mode` is an
ATTESTATION, not a cryptographic proof of timing. The server cannot prove from an
API write that a hook fired pre-decision — timing is not observable in the call,
and even the Ed25519 assessment signature proves "examined," not "examined-
pre-decision." `pre_decision_harness` is unforgeable AGAINST THE CONSUMER (it is
server-composed, and the credential that earns it is minted only by the operator —
a consumer cannot self-issue it), but its honesty rests on (a) the write arriving
via an operator-issued harness credential and (b) the harness enforcing
pre-decision framing by construction. Treat it as you would the rest of the
credential's provenance: trustworthy to the extent you trust the operator's
issuance discipline, not as a timing receipt.
```

## 2. `agent-card.json` — new `extensions` entry (apply at activation)

```json
{
  "id": "examination-mode/v1",
  "description": "Accreditation payloads may carry examination_mode (pre_decision_harness | post_decision_check | null) — the timing axis of the credential. An attestation rooted in operator issuance + harness construction, NOT a cryptographic proof of timing. Separate from coverage_status (breadth). See llms.txt.",
  "added": "2026-06-20"
}
```

## 3. api-docs (`/api-docs` page) — accreditation response note (apply at activation)

> **`examination_mode`** *(string | null, optional)* — present on the accreditation
> payload when the feature is enabled. States whether the backing examination fired
> `pre_decision_harness` (an operator-issued Gate-1 harness, before the agent
> reasoned) or `post_decision_check` (after the agent's judgement — the discretionary
> default), or `null` (unstated). **An attestation, not a cryptographic proof of
> timing** — see the llms.txt honest-limit note. Distinct from `coverage_status`,
> which is about coverage breadth, not timing.

---

## Out of scope for this file (later arcs)
- The **per-configuration contract language** — "Gate 1 — pre-decision" (developer surfaces) vs "Gate 1 — post-decision (check)" (hosted surfaces) — is **Arc 3** (the hosted-configuration contract). It depends on the Arc 2 harness existing. Do not write "Gate 1 — pre-decision" onto a public surface until the harness is real.
- No public surface may present the post-decision check as pre-decision framing (the mentor's binding constraint).
