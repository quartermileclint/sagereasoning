# Next-Session Prompt — AE-1 ACTIVATION: the layer1_source migration + `SUBSTRATE_TRAJECTORY_DELTA_ENABLED` + the R18 docs

**Stream:** founder (agent-extension).
**Tier:** **`code-critical` 0c-ii, founder-walked** (AC7 + PR6 + PR17 engage): a prod schema migration + an env-flag activating a NEW field on `/api/reason`'s public response shape + R18 public-docs changes. The AI guides + verifies and performs **no** Supabase/Vercel/git op; the founder runs every live step, walked live (PR17 — never a one-line hand-off).
**Governing frame:** `/adopted/standing-protocol-cache.md` §Critical-risk sessions (the full Critical Change Protocol, cited not abbreviated) + `/adopted/build-sessions-protocol-cache.md`.
**Predecessor close:** `operations/handoffs/founder/2026-07-18-agent-extension-AE1-delta-layer-CLOSE.md`.
**Predecessor decision-log entry:** `D-AGENT-EXTENSION-AE1-DELTA-LAYER-BUILT-DARK-REVIEW-FOLDED-2026-07-18`.
**Binding design:** ADR-014 §§3.1, 4, 5.

## What this activates (plain language — Critical protocol step 1)

The AE-1 practice-delta layer, built dark 2026-07-18: `meta.trajectory` gains an additive **`delta`** block (schema `agent-trajectory-delta-v1`) on credential-bearing `/api/reason` consults — per-mechanism deltas (sub-species frequency `fading|recurring|new|stable`; kathekon-quality, first-circle obligation, domain-engagement trends; the four dimension trends + persisted passions the aggregator already computed), every signal floored (`insufficient_extraction`, never a defaulted `stable`) with a `*_basis`, regime-split at the S11b boundary, identity-scoped with the rotation disclosure, provenance-mix disclosed. The same flag turns on the **`layer1_source`** write stamp + read column (election E-AE1-1). MEASURE-only; the engine assessment is byte-identical; nothing binds.

## What could break (step 2) + existing sessions (step 3)

- **Wrong order = wrong data, not an outage:** flag before migration ⇒ the windowed read errors on the missing column and **fails honest** (the route logs; the whole `meta.trajectory` overlay is omitted for that consult; response otherwise unaffected) — the build hardened `isMissingTableError` so this can never serve a false-empty window. Still: **the order below is mandatory.**
- The response-shape change is additive-only; a consumer ignoring unknown keys is unaffected. No auth/perimeter/encryption path is touched (battery-asserted).
- Existing sessions: N/A — no third-party sessions exist (standing no-users note); the founder-loop harness simply starts seeing the delta block on its consults.

## Rollback (step 4)

Unset `SUBSTRATE_TRAJECTORY_DELTA_ENABLED` + redeploy ⇒ byte-identical flag-off (test-asserted; no delta block, no stamp, no extra select column). The migration may stay (nullable, inert flag-off) or be reversed per its ROLLBACK footer (**unset the flag first**). `git revert` the docs commit for the R18 surfaces.

## The walk (inviolable order)

1. **Migration TEST → prod:** run `website/supabase-agent-assessment-history-layer1-source-migration.sql` in the Supabase SQL Editor — TEST project first, §VERIFY green (column `layer1_source | text | YES`; the named CHECK; `marked_rows = 0`), then production, §VERIFY green again.
2. **Flag:** set `SUBSTRATE_TRAJECTORY_DELTA_ENABLED=true` in Vercel (Production) + redeploy (green). Pre-condition: `SUBSTRATE_TRAJECTORY_READ_ENABLED` is already `true` (it is, since B1 2026-06-14) — the delta consumes the M7 window and does nothing without it.
3. **Live smokes** (a throwaway or the gen-2 s9-loop consult credential; the AI drafts the exact curls at the session):
   a. A consult on a credential **with prior history** → `meta.trajectory.delta` present; `schema: 'agent-trajectory-delta-v1'`; starved signals read `insufficient_extraction` with honest `*_basis` counts (over today's distribution most will — that is the honest reading, not a failure); `regime.segment_used` names the post-S11b era; `provenance.n_unknown` = the window size (pre-column rows).
   b. A **fresh** credential → overlay `single_snapshot`, delta present with everything floored (sparse basis) — no fabricated trend.
   c. Re-run (a) once → the new row now carries `layer1_source='server'` (SQL spot-check: `SELECT layer1_source, count(*) FROM agent_assessment_history GROUP BY 1;` — the newest rows stamped, older NULL).
4. **R18 docs (founder sign-off BEFORE any public surface changes, then applied + pushed):** `llms.txt` (the `meta.trajectory` section gains the delta-block description: per-signal floors + `insufficient_extraction` semantics + basis fields + regime-split + rotation/provenance disclosures + the mention-conversion bound + the first-circle semantics), `agent-card.json` (a new `trajectory-delta/v1` extension — 18 extensions), api-docs (a `/api/reason` bullet). **Every doc surface restates: evaluative-never-predictive, record-descriptive past tense, and WEIGHTS BLOCKED** (ADR-014 §5 — a per-mechanism improvement gradient is the shape of a training reward; no such use is licensed). Validate `agent-card.json` parses; `npm run build` green.
5. Records: decision-log activation entry + close per the cache; CLAUDE.md production-state refresh (PR18).

## Out of scope

The reflect projection (still gated on reflect-store owner-scoping — ships NOTHING until then); AE-2/AE-3; any regime column or request-shape change (the boundary-date split is the elected v1 mechanism); any change to the S11 refusal (**ENFORCE remains S11; MEASURE throughout; the 0h call remains the founder's**).

End of prompt.
