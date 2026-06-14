# Scope — Trajectory-Retention Sweep (the M6-P2 gate)

**Date:** 2026-06-14. **Stream:** founder. **Session:** Mechanism-Correction M8 (credential-consolidation design).
**Status:** **Scoped** (design only this session — M8 was elected documents-only). The build is a small, self-contained later step (`code-standard` + a deployment-config change), on its own 0c-ii.
**Why this exists:** the M6 close + the M6-P1 production-migration entry named a **trajectory-retention sweep** as the gate on **M6-P2** (the production `SUBSTRATE_TRAJECTORY_WRITE_ENABLED` activation) — and therefore on the whole M6→M7 trajectory activation. `agent_assessment_history` carries a 90-day `retain_until` (R17c), but **nothing enforces it**: there is no cron that hard-deletes expired rows. For the **null-owner external-consumer rows** (`sr_live_` keys with no `profiles`/JWT account — see [the credential-consolidation ADR](../../adopted/adr/2026-06-14-credential-consolidation.md)), `retain_until` is the **primary** genuine-deletion mechanism, not a backstop. This document scopes the cron so a future build session (or a founder-elected ride-along) can ship it directly.

---

## 1. What the sweep must do

Enforce the universal `retain_until` retention limit on `public.agent_assessment_history` by hard-deleting every row past its `retain_until`, on a schedule, idempotently and fail-honestly.

**Scope decision — delete ALL expired rows, not only null-owner rows.** `retain_until` (90 days, `migration:121`) is a universal R17 minimisation limit that applies to *every* row. Owner-bearing rows are *also* erasable on demand earlier via the user-JWT data-rights paths (`/api/user/delete`, `/api/user/export`, wired at M6); `retain_until` is their backstop. The null-owner external-consumer rows are simply the rows for which the sweep is the *only* deletion mechanism. A `WHERE retain_until < now()` predicate covers both cleanly — no `owner_user_id IS NULL` narrowing (which would let owner-bearing rows accumulate past 90 days, violating the same limit). The M6 reader flagged this as "unspecified in code"; the resolution is: **universal predicate, no owner narrowing.**

---

## 2. The template — mirror the M1 narrative-sweep exactly

The M1 narrative-sweep (`website/src/app/api/cron/narrative-sweep/route.ts`) is the proven precedent and the founder-known pattern. Copy its structure; drop the LLM-regeneration scaffolding (this sweep is purge-only).

| Aspect | Narrative-sweep (template) | Trajectory-retention sweep (this scope) |
|---|---|---|
| Route | `GET /api/cron/narrative-sweep` | `GET /api/cron/trajectory-retention-sweep` (NEW) |
| Secret gate | `CRON_SECRET`: 503 if unset, else `if (authHeader !== \`Bearer ${cronSecret}\`)` → 401 (`route.ts:58-68`) | **identical — copy verbatim** |
| Flag guard | `isL3DeferEnabled()` (`SUBSTRATE_L3_DEFER_ENABLED==='true'`); 200 `{ok, flag_enabled:false, note}` when unset (`route.ts:75-85`) | a **dedicated** kill-switch flag (see §3) — same honest-when-unset 200 shape |
| Purge fn | `purgeExpiredNarratives()` — `.from('substrate_audit_narratives').delete().lt('retain_until', now).select('narrative_id')` returning `{deleted, error}` (`narrative-retention.ts:445-461`) | `purgeExpiredTrajectory()` — `.from('agent_assessment_history').delete().lt('retain_until', now).select('id')` returning `{deleted, error}` (build verifies the PK column name is `id`) |
| Invocation | **direct import**, `await`ed (KG1 rule-1 — no HTTP self-call) (`route.ts:14-16,88`) | **identical — direct import, awaited** |
| Missing-table | (table always present) | **benign no-op** via the store's existing `isMissingTableError` (42P01/PGRST205) guard |
| Route config | `dynamic='force-dynamic'`, `maxDuration=60` (sized for LLM work) | `dynamic='force-dynamic'`; `maxDuration` can drop to the default/30 (a bounded indexed DELETE, no LLM) |
| Schedule | **none in `vercel.json`** — only `/api/cron/observability` at `0 8 * * *` is scheduled; the cron entry is a deferred 0c-ii step (`vercel.json:3-8`) | **same** — add the `vercel.json` entry at activation (see §4) |
| Migration | — | **NONE** — the table + `idx_aah_retain_until` already exist on production **and** TEST (`migration:139-141`; M6-P1) |

**File placement.** Add `purgeExpiredTrajectory()` to the existing store `website/src/lib/substrate/agent-assessment-history-store.ts` (where the table's other helpers and the `isMissingTableError` guard already live — least surface, KG1-clean). *Alternative:* a sibling `trajectory-retention.ts` mirroring `narrative-retention.ts` for symmetry. The build session elects; the store is recommended.

---

## 3. The flag — a dedicated kill-switch, NOT the write flag

**Recommended:** a new dedicated flag `SUBSTRATE_TRAJECTORY_SWEEP_ENABLED` (mirroring `isL3DeferEnabled`'s call-time `=== 'true'` read; honest `flag_enabled:false` 200 when unset).

**Why not reuse `SUBSTRATE_TRAJECTORY_WRITE_ENABLED`:** the activation order requires the sweep to be **live before** M6-P2 flips the write flag (the sweep is the *gate* on P2). If the sweep were gated by the write flag, it could not exist independently before P2. A dedicated flag lets the founder: deploy the route inert → add the `vercel.json` cron → set `SUBSTRATE_TRAJECTORY_SWEEP_ENABLED=true` → verify it runs (`200`, `deleted: 0` on the empty table) → *then* flip the write flag. Rollback = unset the sweep flag (the route reverts to the honest no-op 200).

*Alternative (named, not recommended):* run the purge **unconditionally** (no flag) — defensible because a `retain_until < now()` DELETE on an empty/absent table is a safe 0-row no-op. Rejected as the default only for flag-discipline symmetry with the narrative-sweep precedent and a clean rollback verb.

---

## 4. Activation sequence (founder-elected 0c-ii — the M6-P2 gate)

1. Build + push the route + `purgeExpiredTrajectory()` + a tsx test (behaviourally inert: flag UNSET ⇒ honest no-op; no `vercel.json` entry yet).
2. Add `{ "path": "/api/cron/trajectory-retention-sweep", "schedule": "0 8 * * *" }` to `website/vercel.json`'s `crons` array (a deployment-config change; daily 08:00 UTC matches the observability cron — ample for a 90-day limit; hourly is available on Pro if preferred). **Founder elects the schedule.**
3. Set `SUBSTRATE_TRAJECTORY_SWEEP_ENABLED=true` in Vercel; verify a manual `Bearer $CRON_SECRET` call returns `200 { ok:true, flag_enabled:true, deleted:0 }` against the (still-empty) production table; verify negative-auth `401`.
4. **Only now is M6-P2 unblocked:** set `SUBSTRATE_TRAJECTORY_WRITE_ENABLED=true` (rows begin accruing with a 90-day `retain_until`; the sweep will enforce it).
5. Then M7: set `SUBSTRATE_TRAJECTORY_READ_ENABLED=true` (the overlay surfaces once ≥2 prior rows exist on a credential).

This sweep does **not** touch auth → it is **not** on the credential-consolidation Critical track.

---

## 5. Risk classification (named tension for the founder)

**Recommended: `code-standard` (Standard)** — a new secret-gated cron route + one indexed, bounded `DELETE`, no auth/perimeter/signing surface; mirrors the narrative-sweep, which shipped Standard. The prompt frames it as "small, Standard — a cron + an indexed delete on `idx_aah_retain_until`."

**Tension to surface:** 0d-ii lists *"Data deletion functionality → Critical."* This sweep IS deletion functionality. The mitigants that keep it Standard-defensible: (a) it deletes only rows past a **pre-set `retain_until`** (an indexed `< now()` predicate — no arbitrary/operator-supplied scope), (b) it operates only on **internal, service-role-only** trajectory rows (no public read; RLS `REVOKE ALL`), (c) it is the genuine-deletion mechanism R17c **requires** (not new risk — *reduced* risk), (d) it has a flag kill-switch + an indexed, reversible-by-not-running predicate. **Founder confirms the classification at the build step**; if the founder prefers Critical, run the full 0c-ii.

---

## 6. Test (PR2 — same-session, tsx)

- `purgeExpiredTrajectory()` deletes rows with `retain_until < now()` and **leaves** rows with `retain_until` in the future.
- Missing-table ⇒ `{deleted:0, error:null}` (benign, via `isMissingTableError`).
- Route: `CRON_SECRET` unset ⇒ 503; wrong Bearer ⇒ 401; flag unset ⇒ `200 {flag_enabled:false}` (no DB work); flag set ⇒ `200 {flag_enabled:true, deleted:N}`.

---

## 7. Rollback

Code: `git revert` (additive route + helper; the store helper no-ops on a missing table). Activation: unset `SUBSTRATE_TRAJECTORY_SWEEP_ENABLED` (route reverts to no-op) and/or remove the `vercel.json` cron entry. No schema change to unwind. A delete is irreversible per row, but bounded strictly to rows already past their adopted 90-day `retain_until`.

---

*Cross-references: the M6 close + `D-MECHANISM-CORRECTION-M6-TRAJECTORY-PERSISTENCE-BUILT-TEST-VERIFIED-2026-06-14` (the table + the null-owner R17c boundary); `D-MECHANISM-CORRECTION-M6-P1-PRODUCTION-MIGRATION-2026-06-14` (P2 HELD on this sweep); the M1 narrative-sweep precedent (`website/src/app/api/cron/narrative-sweep/route.ts`, `website/src/lib/substrate/narrative-retention.ts`); the M8 credential-consolidation ADR (`adopted/adr/2026-06-14-credential-consolidation.md`); the M8 next-session prompt §Step 3.*
