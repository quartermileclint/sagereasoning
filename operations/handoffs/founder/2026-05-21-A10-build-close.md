# Session Close — 2026-05-21 — A10 Build (Per-Agent Credentials) — CLOSES THE POST-6B ARC

**Stream:** founder.
**Governing frame:** `/adopted/standing-protocol-cache.md` (`code-critical` → **Full** template + Critical Change Protocol) + `/adopted/build-sessions-protocol-cache.md` ("no current users" → CCP step 3 N/A).
**Tier:** `code-critical` — **Critical** risk under 0d-ii. AC7 ENGAGED. PR6 NOT engaged. KG1 ENGAGED. Full Critical Change Protocol completed visibly before any code.
**Date:** 2026-05-21.
**Operative spec:** `/adopted/atl-a10-design.md` (`D-ATL-A10-DESIGN-LOCKED-REWRITE-2026-05-17`).
**Decision-log entry:** `D-ATL-A10-BUILD-WIRED-VERIFIED-2026-05-21`.

Session #6 of 6 in the post-6b arc tail. Implemented the rewritten A10 design in full — all nine decisions A–I + the three rewrite integrations. After deploy, the substrate carries authenticated read AND write public surfaces, both auditable.

## What was built (code complete + verified in-session)

- **Per-agent write credentials.** `POST /api/accreditation/[agent_id]` is now gated by opaque `sr_atl_<32hex>` bearer tokens bound to one `agent_id` (Decisions A, B, E). Optional per-credential scope on `downstream_identity_model` / `path_posture` (Decision 3a) — a scoped credential rejects a write whose CarriedProfile doesn't match (fails closed).
- **Admin mint/revoke endpoint** at `/api/admin/accreditation-credentials` (Decision D, F), founder-only via the **existing `ADMIN_USER_ID`** env var (your Step-1 election — no new env var).
- **`credential_audit` table** (Decision H) — issue + revoke events; mint compensates (deletes the credential) if the audit write fails; revoke stays disabled if its audit write fails.
- **Kill-switch retained** (Decision I) — `SUBSTRATE_WRITE_PATH_ENABLED` still globally gates the surface.
- **Four `typical_*` aggregates** on `AccreditationPayload` (Decisions 3b/3c) + a nullable **`loop_id`** JOIN-trace column on `agent_accreditation` (Decision 2 — no billing integration).
- **`agent-card.json`** declares the A10 auth method (`atl-write-auth/v1` extension) for A2A discovery.
- **Orphan auto-revocation** (your Step-1 election) — a `BEFORE DELETE ON profiles` trigger revokes a deleted owner's atl_write credentials; the CHECK constraint was refined to exempt revoked rows so the deletion succeeds (see decision-log + the migration header).
- **Port-mirror reconciled** (your Step-1 election) — the two named `/trust-layer/` accreditation files brought into sync (6 fields + 6 enum types; reference-only, zero deploy impact).

**In-session verification:** `tsc --noEmit` clean (exit 0) across the project; 5 test files green — `security.test.ts` 20/20, `admin/.../route.test.ts` 23/23, `accreditation/.../route.test.ts` 90/90, plus regressions `atl-accreditation-store.test.ts` 83/0 and `atl-accreditation-writer.test.ts` 54/0.

## Decisions Made

- **`D-ATL-A10-BUILD-WIRED-VERIFIED-2026-05-21`** appended (full Critical form). Status: Adopted; implementation **Wired** (code + in-session tests Verified) → **Verified** (production) upon your post-deploy smoke tests.
- Two design refinements recorded (CHECK-exemption for revoked rows, forced by orphan auto-revocation; pure-function factoring for testability). Both within the design's granted build-session latitude.

## Status Changes

| Item | Old | New |
|---|---|---|
| A10 per-agent credentials | Designed | **Wired** (Verified in-session; production-Verified pending founder smoke tests) |
| `/api/accreditation/[agent_id]` POST auth gate | env-flag stopgap (Verified) | per-agent token + scope (Wired) |
| `/api/admin/accreditation-credentials` | did not exist | **Wired** (NEW) |
| `credential_audit` table | did not exist | migration authored (founder runs) |
| `api_keys` / `agent_accreditation` columns | pre-A10 | migrations authored (founder runs) |
| post-6b arc | session #6 pending | **CLOSED on deploy** |

## Next Session Should

The post-6b arc is closed on deploy. Independent post-arc tracks (founder elects order):
- **K-category migration** (translation-sandwich consumer migration) — the larger remaining build-arc work.
- **Stage 1 lawyer engagement** (FPE-5 TOS + liability) — critical path per ST2 Q4.
- **Purpose-discovery product design pass** — `/operations/handoffs/founder/2026-05-20-purpose-discovery-design-pass-NEXT-SESSION-PROMPT.md` (pre-conditioned on A10 Verified for its recommended auth).
- **Source-of-truth `evaluation.ts` re-port** — the broader EvaluatedAction/WindowSnapshot drift (distinct from this session's bounded accreditation-type reconciliation).
- **Layer 3 prose anomaly investigation**; **Stripe-Price-ID follow-on**; **Layer 4 payment kill switch** (deferred in Option D).

## Blocked On

**Files uncommitted (commit via GitHub Desktop per the Founder Verification block):** the 18 code/migration/test files + `operations/decision-log.md` + this close. Full list in the decision-log entry's "Files touched."

**Production state at session close:** **UNCHANGED — nothing deployed this session.** Substrate at A7 Verified. `SUBSTRATE_WRITE_PATH_ENABLED` UNSET (write-path returns 503). `SUBSTRATE_LAYER3_ENABLED` UNSET. `SUBSTRATE_R20A_GATE_ENABLED` UNSET. Both ATL tables empty. Option D Live + Verified. The A10 code exists locally + verified, but is not committed, not deployed, and the migrations are not yet applied. The write surface remains inert until you complete the steps below.

## Open Questions

- Orphan auto-revocation does not write a `credential_audit` row (the reason lives on the row's `suspended_reason`; a PR7 enhancement could add one).
- Same-(owner, agent) revoke-then-reissue is constrained by the literal unique index (aligned with the PR7 reactivation deferral) — to reissue for the same agent, revoke then mint works only if owner differs OR via a future reactivation flow; the orphan path nulls the owner so a *different* owner can re-claim.
- Layer 3 prose anomaly; Layer 4 payment kill switch; full `evaluation.ts` re-port — all carried forward.

## Verification Method Used (0c framework)

- **API endpoint / library logic:** pure decision functions factored + unit-tested (security 20, admin 23); `tsc` clean; route 90 incl. request-helpers.
- **Database change:** idempotent migrations with inline VERIFY SELECTs; founder runs + confirms.
- **Deployment-configuration:** founder confirms `ADMIN_USER_ID`; flips the write flag only after pre-flip checks pass.
- **Supabase round-trips (admin mint/revoke, route end-to-end):** founder post-deploy smoke tests below (same posture as the write-path build).

## Risk Classification Record (0d-ii)

Critical. Full CCP completed before any code (six steps; founder approved against named risks). AC7 ENGAGED. PR6 NOT engaged. KG1 ENGAGED. KG7 NOT engaged. Port-mirror files Standard (reference-only).

## PR5 — Knowledge-Gap Carry-Forward

No re-explanation needed. Reinforced: the `sr_live_`→`sr_atl_` opaque-token primitive; the "factor pure functions + smoke-test the Supabase round-trip" posture for this route group. No new register entries.

---

## Founder Verification (Between Sessions)

**Do these in order. Take them one at a time. The write surface stays safely inert (503) until the very last step.**

### 1. Run the three migrations (Supabase → SQL Editor → New Query)

Run each file's full contents, one at a time; paste back / eyeball each VERIFY block:
1. `website/supabase-api-keys-a10-migration.sql` — VERIFY 7e must return **0** (no pre-existing bad rows).
2. `website/supabase-credential-audit-migration.sql`.
3. `website/supabase-agent-accreditation-a10-migration.sql` — run the pre-flight SELECT (step 0) first.

If any VERIFY looks wrong, stop and tell me before committing.

### 2. Confirm the admin env var is already set (Vercel → Settings → Environment Variables)

Confirm **`ADMIN_USER_ID`** exists (Production) — it powers your existing `/api/admin/api-keys` endpoint, so it should already be set. A10 reuses it; **no new env var to add.** If it's somehow missing, set it to your Supabase user id before deploying.

### 3. Commit + push (GitHub Desktop — recommended)

Because one folder path contains square brackets (`[agent_id]`) that the `git add` command mishandles, **use GitHub Desktop**: review the ~20 changed files (all under `website/`, `trust-layer/`, and `operations/`), confirm they're all this session's A10 work, paste the commit message below, commit, then push.

```
A10 per-agent credentials — write-surface auth + admin mint/revoke + audit (closes post-6b arc)

Implements the rewritten A10 design (D-ATL-A10-DESIGN-LOCKED-REWRITE-2026-05-17)
in full: per-agent sr_atl_ tokens gating POST /api/accreditation/[agent_id] with
optional per-credential scope; new founder-only admin mint/revoke endpoint;
credential_audit table; 4 typical_* aggregates on AccreditationPayload;
agent_accreditation.loop_id JOIN-trace column; agent-card.json atl-write-auth/v1.
Orphan auto-revocation trigger (CHECK refined to exempt revoked rows). Admin auth
reuses ADMIN_USER_ID. Port-mirror reconciled (reference-only).

Critical risk; full CCP completed. tsc clean; tests green (security 20, admin 23,
route 90, store 83, writer 54). Production deploy + smoke tests are this commit's
verification step. Per D-ATL-A10-BUILD-WIRED-VERIFIED-2026-05-21.
```

Vercel rebuilds (~2 min) after the push.

### 4. Pre-flip checks (after the rebuild, BEFORE enabling writes)

The write flag is still UNSET, so writes still 503. First confirm the deploy is healthy: the GET endpoint should be unchanged, e.g. open `https://www.sagereasoning.com/api/accreditation/agent_test_v1` (expect a 404 JSON "no record" — same as before).

### 5. Mint a test credential (admin endpoint)

This needs your signed-in Supabase access token. Sign in at sagereasoning.com, open browser DevTools → Application → Local/Session Storage → copy the `access_token` value from the Supabase auth entry. Then:

```
curl -s -X POST "https://www.sagereasoning.com/api/admin/accreditation-credentials" \
  -H "Authorization: Bearer <YOUR_SUPABASE_ACCESS_TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{"agent_id":"agent_test_v1","purpose":"atl_write","label":"A10 smoke test"}'
```

Expect **201** with a `token` field (`sr_atl_...`) and a "shown once" warning. **Record the token** — it can't be retrieved later. (A non-admin / no token → 401.)

### 6. Enable writes + smoke-test the write path

Set **`SUBSTRATE_WRITE_PATH_ENABLED` = `true`** in Vercel → wait for the redeploy. Then POST a seed write with the minted token (a minimal CarriedProfile body — I can give you a ready-made body if you want one):

```
curl -s -X POST "https://www.sagereasoning.com/api/accreditation/agent_test_v1" \
  -H "Authorization: Bearer <MINTED_sr_atl_TOKEN>" \
  -H "Content-Type: application/json" \
  -d '<SEED_BODY>'
```

Expect **200** and an `agent_accreditation` row for `agent_test_v1` in Supabase.

### 7. Failure-mode smoke tests (each should reject)

- No `Authorization` header → **401**.
- A made-up `sr_atl_` token → **401**.
- The valid token against a *different* agent_id in the URL → **401** (wrong_agent).
- Revoke the credential: `curl -X DELETE "https://www.sagereasoning.com/api/admin/accreditation-credentials?id=<CREDENTIAL_ID>" -H "Authorization: Bearer <YOUR_SUPABASE_ACCESS_TOKEN>"` → **200**; then the revoked token on a write → **401**.

### 8. Decide the resting state

Leave `SUBSTRATE_WRITE_PATH_ENABLED='true'` (write surface **Live**) OR revert it to UNSET (Live-but-inert for further testing) — your call. Clean up the test credential + the `agent_test_v1` row if you don't want them lingering.

**If anything fails:** the rollback path is in the decision-log entry + `/operations/handoffs/founder/2026-05-20-A10-build-NEXT-SESSION-PROMPT.md` (rollback SQL is idempotent; `ADMIN_USER_ID` was reused, not added, so nothing to remove there). Tell me what failed and I'll diagnose.

## Orchestration Reminder

I (this session) cannot run Supabase SQL, set Vercel env vars, commit/push, or hit production endpoints — those are yours. The code is written + verified in-session; the production-Verified status flips once your smoke tests (steps 5–7) pass.

## Cross-references

- Operative design: `/adopted/atl-a10-design.md` (`D-ATL-A10-DESIGN-LOCKED-REWRITE-2026-05-17`)
- Operative prompt: `/operations/handoffs/founder/2026-05-20-A10-build-NEXT-SESSION-PROMPT.md`
- Decision-log entry: `D-ATL-A10-BUILD-WIRED-VERIFIED-2026-05-21`
- Predecessor close: `/operations/handoffs/founder/2026-05-17-A10-design-rewrite-close.md`
- Predecessor builds: `D-ATL-WRITE-PATH-BUILD-WIRED-VERIFIED-2026-05-16` (auth seam A10 fills); `D-BILLING-MODEL-BUILD-WIRED-VERIFIED-2026-05-17` (loop_id JOIN target); `D-PASS-THROUGH-FIELDS-BUILD-WIRED-VERIFIED-2026-05-17` (the 7 fields A10 integrates)
- Governance: `/adopted/standing-protocol-cache.md`; `/adopted/build-sessions-protocol-cache.md`

*End of session close. A10 code complete + in-session-Verified (tsc clean; 5 test files green); the post-6b arc closes once the founder completes the deploy + smoke tests above. Production state unchanged at session close — the write surface remains inert (503) until the founder runs the migrations, commits, and flips the flag.*
