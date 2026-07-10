# Kill-switches — the five layers (deepest last; credential revoke is the real one)

**Status:** documented at Trust Layer S8 (2026-07-10). Governing design: ADR-013 §6 + ADR-011. Every layer below is independently sufficient to stop the thing it names; they are listed shallowest (fastest, local) to deepest (server-side, unforgeable). The harness is fail-open-honest by design, so no kill-switch can strand a loop — switching anything off degrades to the bare loop with honest logs, never a block.

## 1 — Hook uninstall (the whole harness, local, instant)

`/practice-off` (the renamed `/sage-off`) removes the `hooks` block from `.claude/settings.local.json` (refreshing the canonical backup `.claude/gate1-hooks-block.json` first). Hooks hot-reload — no restart. `/practice-on` restores. This kills ALL local firing (H1–H5) but touches no credential and no server state.

## 2 — Per-surface environment switches (local, per-behaviour)

| Var | Effect when set |
|---|---|
| `SAGE_GATE1_DISCERNMENT_ENABLED=false` | Kills the S8 spawn-discernment + hand-back + trust-read surfaces even when `discernment.config.json` is provisioned (the derive election in reverse). Deleting/renaming `discernment.config.json` has the same effect. |
| `GATE1_REFLECT_TURN_ENABLED=false` | Kills the one forced review turn at close (accred write + persist unaffected). |
| `SAGE_GATE1_REFLECT_PERSIST_ENABLED` unset (default) | The agent's reflection text never leaves the machine (dark by default). |
| `GATE1_CONSULT_BASH` unset (default) | Non-guard Bash never auto-consults. |
| `GATE1_FAIL_MODE=open` / `GATE1_GUARD_FAIL_MODE=open` (defaults) | Outages never block; `strict` opts into fail-closed per surface. |
| Unset `SAGE_GATE1_ACCRED_CREDENTIAL` / `SAGE_GATE1_AGENT_ID` | Kills the accreditation write path AND (via the derive) provenance capture. |

## 3 — Server-side feature flag (all S8 surfaces + the whole trust core, one flip)

`SUBSTRATE_TRUST_CORE_ENABLED` unset (the production state today) ⇒ `/api/practice/discernment` answers an honest 503; no discernment/L4/trust-verdict computation runs; no collaboration record, L4 result, or trust event is ever written; zero LLM spend. The hooks fail open with honest logs. Unsetting the flag after activation is the documented rollback for the entire trust-layer surface (byte-identical flag-off, test-asserted).

## 4 — Credential revoke (THE REAL ONE — server-side, instant, unforgeable)

Revoking the UPC credential (`is_active=false` on the `api_keys` row — the founder's mint CLI or admin surface) kills every server interaction the harness can make, from any machine, regardless of local state: consults 401, guard checks 401, discernment 401, accreditation writes 401. The hooks then run UNFRAMED with honest logs (`UNFRAMED reason="http 401"` — demonstrated live at the standing-harness onboarding). Nothing local can resurrect a revoked credential; this is the switch that holds even against a compromised or misconfigured install.

## 5 — Data plane (server-side; the records themselves)

Service-role-only RLS means no credential — revoked or live — can read or write the trust tables directly. Genuine deletion on request: `/api/user/delete` + `/api/user/export` (owner), `/api/credential/erase` (consumer credential), and the retention sweeps (`retain_until` 90d) cover `agent_trust_events`, `agent_trust_state`, and `collaboration_records` (always-on, missing-table-benign). The write-once columns (`authority_boundary`, `l4_audit_result`) are readable-not-modifiable by trigger — deletion is the only mutation, and only through the data-rights paths.
