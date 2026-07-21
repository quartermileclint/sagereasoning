# Agent-Organization credential ledger

**Status:** stood up 2026-07-21 at P5 (`operations/agent-org-2026-07/P5-permissions-matrix.md`); empty of entries — **no mint has occurred**. Populated by P4, one row per credential, at each agent's provisioning session.

**Scope (per plan §5):** this is the ONE home for every credential this program mints, for **every AO org-agent identity** (Tech, Ops, and any later-onboarded agent). It is **not** `operations/trust-layer-2026-07/S11-FLIP-PREREQUISITES-REGISTER.md` §E — that register is explicitly scoped to the `sagereasoning:s9-loop@v1` S11-flip-prerequisite subject and states its own discipline as "short by design… do not let it sprawl." Repurposing it for N org-agent identities would violate its stated scope. This file's **row format** is drawn from that register's §E precedent (generation, ids, capabilities, limits, disposition) — format only, not the same table.

**Update discipline:** every mint, revoke, or limit change lands a new row (never edits an existing row's history — append, mirroring the register's own append-and-supersede pattern) in the same session that performs the live op, by the founder, walked live (PR17). The AI never mints; it records what the founder minted.

---

## Rows

| Agent | Identity (K1) | Purpose class | Credential id | Capabilities | Limits (monthly/daily/chain) | Status | Minted |
|---|---|---|---|---|---|---|---|
| Tech | `sagereasoning:org-tech@v1` | consult | `45fc0147…` | `[consult]` | 150/15/1 | LIVE | 2026-07-21 — P4 agent-1 (prod) |
| Tech | `sagereasoning:org-tech@v1` | write | `c941830c…` | `[accreditation_write, calling, reflect]` | 150/15/1 | LIVE | 2026-07-21 — P4 agent-1 (prod) |
| Tech | `sagereasoning:org-tech@v1` | consult | `3c4495b0…` | `[consult]` | 150/15/1 | REVOKED — mint-planning error: minted with `--owner-email` set, which resolved a non-null `owner_user_id` and collided with the write credential's own `(owner_user_id, agent_id)` uniqueness index (`api_keys_upc_owner_agent_active_uniq`). Re-minted owner-less (see the row above) to match the s9-loop precedent, per which only the write credential is owner-bound. | 2026-07-21 — P4 agent-1 (prod), superseded same session |
| Ops | `sagereasoning:org-ops@v1` | consult | `854e12ac…` | `[consult]` | 120/10/1 | LIVE | 2026-07-21 — P4 agent-2 (prod) |
| Ops | `sagereasoning:org-ops@v1` | write | `6c26d372…` | `[accreditation_write, calling, reflect]` | 120/10/1 | LIVE | 2026-07-21 — P4 agent-2 (prod) |

**TEST proof artifact (not a standing Tech credential — noted for completeness, not a ledger row for this identity's live state):** a throwaway `sr_prac_` consult credential (id `b1229d04…`) was minted on TEST during this session purely to prove the fixed CLI actually applies `--monthly`/`--daily` overrides (it did — 150/15 confirmed). Revoked same session once its purpose was served; never carried real traffic.

---

## Row-format notes for P4 (fill in per the table above)

- **Agent** — the org role (`Tech`, `Ops`, …), matching a signed row in `P5-permissions-matrix.md`. **No row may be added here for an agent whose P5 matrix row is not yet founder-signed** (mirrors P4's own dependency on P5 in the build plan).
- **Identity (K1)** — the real, minted `namespace:name@version` string decided at P4's election E2 (not the matrix's illustrative placeholder).
- **Purpose class** — `consult` or `write` (the two-credential pattern the matrix rows recommend).
- **Credential id** — the `api_keys` row id (truncate to the first 8 chars + `…`, matching the register §E convention — the full id is retrievable via `mint-credential.ts list`, never pasted in full into a repo-tracked file alongside anything that could reconstruct the raw token).
- **Capabilities** — the exact array minted, cross-checked against the signed matrix row.
- **Limits** — `monthly_limit/daily_limit/max_chain_iterations`, cross-checked against the signed matrix row (or the founder's adjustment, if the mint deliberately deviates — note the deviation and why).
- **Status** — `LIVE`, `REVOKED — <reason>`, or `SUPERSEDED — <replacement row>`.
- **Minted** — date + session reference (the P4 sub-session that performed the mint).

**On revoke:** append a new row updating Status to `REVOKED — <reason>`; do not delete the original row. This mirrors the register §E precedent's own gen-1/gen-2 pattern (both generations stay visible; revocation is recorded, not erased) and gives `KILL-SWITCHES.md` a single, always-current place to point.

---

## Cross-references

- `operations/agent-org-2026-07/P5-permissions-matrix.md` — the signed rows this ledger's entries must match
- `operations/agent-org-2026-07/agent-org-and-evidence-build-plan.md` §5 — the decision to give this program its own ledger, separate from the S11 register
- `operations/trust-layer-2026-07/S11-FLIP-PREREQUISITES-REGISTER.md` §E — row-format precedent (format only; different subject scope)
- `harness/gate1-pre-decision/KILL-SWITCHES.md` — Layer 4 points here for current per-agent credential ids

*End of ledger (empty pass). First entry lands at P4.*
