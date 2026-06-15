# Next-Session Prompt — Credential Consolidation (CI-14) **completion**: Step 6e (invariant re-anchor) + Step 7 (consumer-erasure-by-token)

**Stream:** founder. **Model:** session default, maximum reasoning. **Environment:** Claude Code on the founder's machine (TEST **and production** reachable).
**Tier:** **`code-critical`** for BOTH steps — 6e changes load-bearing CHECK constraints on the authentication table (`api_keys`); Step 7 is **data-deletion functionality** (0d-ii Critical). Full templates + Critical Change Protocol (0c-ii) per sub-step. **AI does no git/Supabase/Vercel ops; the founder commits by name and performs every Supabase/Vercel action; the AI builds + walks each step live (PR17).**
**Governing frame:** `/adopted/standing-protocol-cache.md` + `/adopted/build-sessions-protocol-cache.md`. PR1; PR17 (every Supabase step walked live); PR18 at close.
**Spec:** `adopted/adr/2026-06-14-credential-consolidation.md` — Migration §6 (the re-anchor tail) + §7 (the retention follow-up) + §6 per-install index. **Predecessor close:** `operations/handoffs/founder/2026-06-15-credential-consolidation-CI14-step6-cutover-close.md`. **Predecessor decisions:** `D-CI14-UPC-CUTOVER-STEP6-LIVE-2026-06-15` (the cutover), `D-CI14-UPC-BUILD-DARK-STEPS-1-5-TEST-VERIFIED-2026-06-15` (the build).

> **Scope note:** these are the **only** remaining CI-14 build items, and both are **non-blocking cleanups** — the UPC is already Live and correct without them. The founder elects scope at open: **6e only**, **Step 7 only**, or **both**. If you'd rather spend the session on a different open thread (the carried M1/M3-CI-11/M4/M5 activations, parked CI-16, or **the 0h launch call** — see §"Other open threads"), say so at open and skip this prompt.

---

## Why this session matters

The Step-6 cutover left two deliberate "after cutover is stable" tails (ADR Migration §6e + §7). **6e** finishes the consolidation's *honesty*: the two load-bearing invariant CHECKs + the per-purpose unique/lookup indexes still key off the legacy `purpose` discriminator, but `capabilities` is now authoritative — so a `sr_prac_` UPC carrying `accreditation_write` is **not** yet forced (by constraint) to have `owner_user_id`+`agent_id` the way a legacy `sage_assent_write` row is (today it's enforced only in the validator, not the DB). **Step 7** finishes the consolidation's *data-rights*: `owner_kind='external_consumer'` rows are currently deletable only by the time-based retention sweep (`retain_until`); the ADR promises an **on-demand** consumer-erasure-by-token path (the R17c "genuine deletion on request" for un-accountable rows that have no user-JWT).

## Pre-conditions (verify at open)
1. CI-14 is **Live + stable** in production: `SUBSTRATE_UPC_CAPABILITY_AUTH_ENABLED=true`; the prod `api_keys` table carries `capabilities`/`owner_kind`/`credential_provenance` + the `api_keys_upc_owner_agent_active_uniq` index; the dark-build + cutover commits are pushed + Vercel green. (No new prod incidents since the cutover.)
2. `tsc --noEmit` clean; the credential suites green (practice-credential 29, security 20, plugin-install 22, api-key-defaults 8, mint-core 56, accreditation route 90, upc-transport-narrowing 19) — run with `node_modules/.bin/tsx <file> > /tmp/x 2>&1; tail -2 /tmp/x` (the security-importing ones keepalive-hang; never `| tail`; never use foreground `sleep` — it aborts the command).
3. The TEST `api_keys` schema mirrors prod (UPC columns + backfill + index applied at the dark build); a fresh terminal for any TEST mint (memory `mint-cli-env-file-export-leak`); the TEST admin `profiles` row exists (memory `test-admin-needs-profiles-row`).

## The inviolable constraints (unchanged)
Every issued credential keeps validating throughout; all four prefixes validate; the R18f provenance gate / R20a / distress / Layer-2 signing stay untouched; the write-class transport narrowing stays Authorization-Bearer-only. **6e is additive-then-narrowing** (the transition predicate accepts BOTH `purpose`-based and `capabilities`-based meanwhile — never a window where a currently-valid row becomes invalid). **Step 7 deletes ONLY `owner_kind='external_consumer'` rows** (operator rows are erased via the existing `/api/user/delete` R17c user-JWT path — never by this token path).

## Part A — Step 6e: re-anchor the invariants from `purpose` to `capabilities`

Each its own 0c-ii gate; additive + reversible; TEST first then prod, every VERIFY founder-walked.

1. **`api_keys_sage_assent_write_requires_owner_and_agent`** — today: `purpose='sage_assent_write' ⇒ owner_user_id+agent_id NOT NULL`. Re-anchor (transition): fire on **`purpose='sage_assent_write' OR 'accreditation_write' = ANY(capabilities)`** ⇒ owner+agent NOT NULL. Drop-and-re-add WIDER (the sanctioned widen idiom; the new predicate is a strict superset — no currently-valid row is invalidated). Verify a UPC row carrying `accreditation_write` without owner/agent is now refused at the DB (it already is at the validator).
2. **`api_keys_plugin_install_requires_identity`** — re-anchor analogously (`purpose='plugin_install' OR` the install-capability semantics; confirm the exact predicate against the current constraint def first — a per-install UPC carries `{consult,l1_supply}` + a non-null `install_id`, NOT a distinct capability, so the re-anchor here may stay `purpose`-OR-`install_id`-based; **path-check before changing**).
3. **Per-purpose unique / lookup indexes** — the legacy `api_keys_sage_assent_write_owner_agent_unique` (purpose-partial) is now subsumed for assent rows by `api_keys_upc_owner_agent_active_uniq`. Decide its fate: **retire (DROP) only after** proving the new index covers every assent-row uniqueness case (a zero-gap pre-check), or keep both (the current dual-index state is harmless — Step-3 VERIFY 2b). This is the one place a DROP is in scope (constraint-4's "nothing dropped" was for the build/cutover; 6e is the sanctioned retire) — do it last, reversibly, with a recreate-block on file.
4. **Do NOT yet narrow to capability-ONLY** unless the founder elects it: the transition (BOTH) predicate is the safe steady state until every legacy `purpose` value is provably redundant. Narrowing-to-capability-only is itself a later gate.

**Acceptance (6e):** the invariants fire on the capability (TEST: a capability-bearing UPC missing owner/agent is DB-refused; a legacy `purpose` row still refused exactly as before); flag-off and flag-on auth both unchanged (re-run the credential suites); prod applied + VERIFY-walked; no currently-active row invalidated.

## Part B — Step 7: on-demand consumer-erasure-by-token

Each its own 0c-ii gate (data deletion = Critical). The retention sweep (`retain_until` + `GET /api/cron/trajectory-retention-sweep`) stays the time-based mechanism-of-record; this adds the **on-demand** path.

- **Design first** (PR15 — consider the existing `/api/user/delete` R17c shape + the sweep before bespoke). A token-or-id-authenticated erasure that, for an **`owner_kind='external_consumer'`** credential, genuinely deletes: the `api_keys` row **and** its `agent_assessment_history` trajectory children (keyed by `credential_ref`), plus any other child rows the credential owns (audit/billing per R17c retention rules — confirm which are erasable vs which are retained-by-law).
- **Hard scope guard:** refuse (or no-op with an honest 4xx) if `owner_kind='operator'` — those route through `/api/user/delete` (the cascade + user-JWT). The token path must not become a second deletion path for operator data.
- **Honesty (R17/R18f):** the response states what was deleted; no false "deleted" for rows that don't exist or aren't owned by the presented token.
- **Build behind a flag** (UNSET = path returns 503/404, byte-identical) if a dark-ship is warranted; TEST leg (mint an external_consumer UPC → write a trajectory row → erase-by-token → confirm both gone) then prod.

**Acceptance (Step 7):** TEST erase-by-token removes the credential + its trajectory children; an operator credential is refused; a non-existent/unowned token gets an honest negative; `/api/user/delete` + `/api/user/export` unaffected; the sweep still works.

## What is NOT in scope
Narrowing the invariants to capability-ONLY (a later gate); prefix retirement; the portable creator credential (deferred A10 Surface-2); per-install metering/quota; any R18f/R20a/distress/Layer-2-signing change; the carried M-activations + the 0h call (below).

## Other open threads (for visibility — pick one instead at open if the founder prefers)
- **M1 consult-path activation** (`SUBSTRATE_L3_DEFER_ENABLED` + `SUBSTRATE_L1_SCHEMA_KEY_PATH_ENABLED` + the narrative-sweep cron + staged docs) — a pending 0c-ii (checklist in the M1 decision-log entry). **Note:** activating `SUBSTRATE_L1_SCHEMA_KEY_PATH_ENABLED` in prod would also make the UPC `l1_supply` capability gate *enforce* on `/api/reason` (today the flag-off path skips it) — worth sequencing awareness.
- **M3 CI-11** K1 coverage columns (prod migration `supabase-agent-accreditation-k1-coverage-migration.sql` + the folds).
- **M4/M5** doc/flag activations (CI-13 practice hint, CI-15 staged docs).
- **CI-16** (parked — the gate-engine value-classification decision).
- **The 0h launch call** — the gating blocker (the bare-vs-harnessed verdict was "no benefit"; founder's branch decision per `operations/p1-rebuild-2026-06/verdict-memo.md` §8). This is a founder strategic decision, not a build session.

## Rollback (summary)
6e: each constraint/index change is drop-and-re-add with an inverse block on file (re-add the narrower predicate; recreate the dropped index). Step 7: unset its flag (if dark-shipped) / `git revert`; no destructive migration (it adds a path, not a schema change — verify). Nothing here touches the live UPC auth path.

## Forecast
Success: the CI-14 consolidation is **fully complete** — the invariants and data-rights match the capability model, not the legacy `purpose`. After this, the entire mechanism-correction arc (build + activation + cleanup) is closed; only the carried M-activations, parked CI-16, and **the 0h call** remain — and the 0h call is the one true launch gate.

End of prompt. Open on `main`; the AI does no git/production operations; nothing proceeds out of the additive/reversible/flag-gated order; every already-issued credential keeps validating throughout.
