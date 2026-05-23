# Next-Session Prompt — C Phase 3: ATL → Sage Assent external / wire-format (CRITICAL)

**Stream:** founder.
**Tier:** opens at **`code-critical`** (Phase 3 — external, persisted, wire-format surfaces + public copy). **Full Critical Change Protocol (0c-ii) applies and must be completed visibly in the conversation before any deploy.** Re-declare only if the elected bite differs (E#1 = `code-elevated`; `mode:'atl_wrapper'` classification = `governance`/`code-standard`; `trust-layer/` folder rename = `code-elevated`).
**Governing frame:** `/adopted/standing-protocol-cache.md` + `/adopted/build-sessions-protocol-cache.md` ("no current users" holds — founder + test logins only; **but the agent-card is a published external contract**, so "no users" does not fully neutralise the public-contract risk).
**Predecessor session close:** `/operations/handoffs/founder/2026-05-23-C-phase2-docs-registry-close.md` (Phase 2 docs/registry/prose rename — built, Verified, committed, pushed, Vercel-green).
**Predecessor decision-log entry:** `D-TRACK-FOLLOWONS-C-PHASE2-DOCS-REGISTRY-2026-05-23`.
**Deliverable-of-the-day (read in full):** `/drafts/2026-05-23-track-followons-design-pack.md` **§Track C** — specifically the **(B) External / wire-format / persisted** inventory and the **(D) Public-facing** inventory, and the **Phase 3** row of the proposed phasing.
**Risk classification:** **Critical** under 0d-ii — touches authentication/credential format, a persisted DB scope value (schema change to an existing table), a published A2A contract, and deployment. AC7 engaged. PR6 NOT engaged (no distress-classifier / Zone-2 / Zone-3 logic touched), but Critical stands on the auth + schema + public-contract surfaces regardless.

## Locked decisions (from the prior gates — do NOT re-litigate)
- **Full internal + external rename:** "Sage Assent" replaces "Agent Trust Layer" / "ATL" everywhere — phased. Phase 3 is the **external** phase.
- **`D-ATL-*` decision-log IDs are IMMUTABLE** — historical anchors; never rename them anywhere.
- **Phase 1 DONE + Verified** (internal code identifiers). **Phase 2 DONE + Verified** (governance / docs / registry / internal prose + 5 design-file renames; live path-refs only, history left intact).
- **Category label is "Character Kernel" (R18a); product name is "Sage Assent."** Public copy in Phase 3 should reflect both correctly (Sage Assent = the component; Character Kernel = the marketplace/positioning category).

## The four external surfaces in scope (from design-pack §C (B) + (D))
These are the surfaces Phases 1–2 deliberately did NOT touch. Each is a breaking/public change.

1. **Credential prefix `sr_atl_` (LIVE TOKEN VALUE).** Defined as the VALUE of `SAGE_ASSENT_WRITE_TOKEN_PREFIX` in `website/src/lib/security.ts`; matched in `Bearer sr_atl_` runtime checks in `website/src/app/api/accreditation/[agent_id]/route.ts`, `…/api/calling/route.ts`, `…/api/practice/reflect/route.ts`. Changing the value invalidates any issued credential and changes the published agent-card contract.
2. **`atl_write` persisted DB scope value.** `website/supabase-api-keys-a10-migration.sql`: a `CHECK (purpose IN ('ecosystem','atl_write'))`, the constraint `api_keys_atl_write_requires_owner_and_agent`, the unique index `api_keys_atl_write_owner_agent_unique`, an index, and the profile-delete trigger — all filtering `WHERE purpose='atl_write'`. Also `.eq('purpose','atl_write')` in `security.ts`, the admin route, and `validation.ts`. Renaming requires a data migration on existing rows + constraint/index/trigger recreation.
3. **Published A2A contract** `website/public/.well-known/agent-card.json`: `tokenPrefix:"sr_atl_"`, the `Bearer sr_atl_<token>` example, the **extension URI** `https://sagereasoning.com/extensions/atl-write-auth/v1` (a versioned external identifier), and the brand line at `:137` ("The Agent Trust Layer write surface").
4. **The 3 public-copy UI surfaces:** `website/src/app/limitations/page.tsx:114` (user copy), `website/src/app/ops-hub/page.tsx:894` (UI label "P3: Agent Trust Layer"), `website/src/app/api/guardrail/route.ts:44` (a comment).

## Naming decisions to make at OPEN (Phase-0 style — surface, founder elects; do NOT prescribe)
Phase 3 cannot proceed until these external names are chosen. The AI surfaces options + trade-offs; the founder elects:
- **New credential prefix value** (e.g. `sr_sage_` / `sr_sa_` / other). Phase 1 kept the VALUE `'sr_atl_'` and renamed only the const NAME, so this value is still open.
- **New DB scope value** — recommend `sage_assent_write` for consistency with the Phase-1 internal log tags (`kind:'sage_assent_write'`/`'sage_assent_verify'`). Confirm.
- **New extension URI** — version bump and/or path change (e.g. `https://sagereasoning.com/extensions/sage-assent-write-auth/v1` or bump `atl-write-auth/v1`→`/v2`). This is a public-contract identifier — decide the migration story.
- **Cutover vs dual-accept** — because production has **zero live credentials** right now, a clean cutover is viable and is the lowest-cost window. The design pack's default is the safer **dual-accept old+new prefix during a window** + **additive-then-remove DB scope**. Founder elects clean-cutover vs dual-accept per surface.
- **Public-copy wording** for the 4th surface (Sage Assent vs Character Kernel where each is correct).

## Why this session matters
Phases 1–2 retired "ATL" everywhere it was safe (live code identifiers; governance/docs/registry/prose). Phase 3 is the last C phase: the **external, persisted, published** surfaces — the credential prefix, the DB scope, the agent-card contract, and the public copy. These are breaking changes, which is exactly why they were quarantined into a dedicated Critical session. Doing it now is the lowest-cost moment (zero live credentials), but it still changes a published contract, so it gets the full Critical Change Protocol and a single-endpoint proof before any surface-wide rollout.

## Pre-conditions (confirm at open)
1. Working tree clean; Phase 2 committed + pushed; Vercel green; no `.git/index.lock` (if GitHub Desktop complains of "another process," close/reopen it). `.fuse_hidden*` is gitignored (added in Phase 2) — host shadow files won't be committed.
2. Production unchanged from Phase 2 close: `SAGE_REFLECT_ENABLED=true`; `MENTOR_ENCRYPTION_KEY` set; substrate A7 Verified; A10 Live+Verified; Sage Calling Live (gated); Sage Reflect Live/Verified (gated; A-track migrations run); Layer-3 + R20a substrate gates UNSET.
3. `cd website && npm install` if a clean checkout (tsx is a devDependency).
4. **Confirm zero live credentials** before electing clean-cutover: query `api_keys` for active `purpose='atl_write'` rows (founder-run in Supabase). If any exist beyond known test creds, reconsider the cutover-vs-dual-accept election.

## Part A — Open under the protocol
Read in order:
1. `/adopted/standing-protocol-cache.md` (~3 min — tier, model selection, risk class, signals, status vocab; note the **Critical** rows in §"Risk classification").
2. `/adopted/build-sessions-protocol-cache.md` (~3 min — build-arc context; "no current users").
3. `/operations/handoffs/founder/2026-05-23-C-phase2-docs-registry-close.md` (predecessor — what landed; the deferral list).
4. `/manifest.md` — targeted: **AC7** (auth/session disposition), **R17c** (deletion endpoint — the profile-delete trigger filters on `purpose='atl_write'`), **R18** (honest certification / the agent-card contract). Do not read the manifest in full.
5. `/operations/decision-log.md` — last 2 entries (`D-TRACK-FOLLOWONS-C-PHASE2-DOCS-REGISTRY-2026-05-23`, `D-TRACK-FOLLOWONS-C-PHASE1-RENAME-2026-05-23`) + skim the `D-ATL-A10-*` entries that established the credential/scope surface.
6. `/drafts/2026-05-23-track-followons-design-pack.md` §Track C — (B) + (D) inventories + the Phase 3 row.

Confirm at open: tier (`code-critical`); hold-point (P0 0h active); model selection (PR4 — rename + auth/schema; no new LLM calls; **N/A**); status vocabulary; signals/risk class. **PR15 consult** (`.claude/skills/anthropic/` + `/operations/agentic-commerce-findings-downstream-order.md`) — record it; note F4 (AC10/AP2 mandate alignment) is agent-card-adjacent if the extension URI is being versioned. **PR16 positioning lens:** Phase 3 changes what an agent developer SEES the product called (the agent-card + public copy) — flag positioning impact (strengthens "Character Kernel"/"Sage Assent" external identity).

## Part B — The work (only if C Phase 3 is elected)
**Surface the day's bite at open and let the founder elect.** Recommended bite = **C Phase 3** (locked order: C before E). Alternatives the founder may elect instead: **E#1** (persist the Agent-Card verdict — `code-elevated`, ~1 short session, the one pre-launch item); **classify `mode:'atl_wrapper'`** (internal-dispatch vs wire-contract — `governance`, prerequisite to ever renaming that discriminant); the **`trust-layer/` directory rename** (deferred — `code-elevated`, needs grep-compensated verification for the `tsc`-invisible cross-boundary import). State the election at open.

### If C Phase 3 is elected — procedure
Follow **PR1 (single-endpoint proof before surface rollout)** and **PR10 (Plan → Execute → Verify)** throughout. Suggested order:

1. **Make the naming + cutover elections** (above). Record them in the conversation.
2. **B1 — credential prefix.** Prove on a SINGLE route first (recommend `practice/reflect/route.ts`): implement the elected approach (clean cutover → swap the prefix value + Bearer check; OR dual-accept → accept old+new during a window). Reach Verified on the one route, THEN roll to the other two routes + `security.ts`.
3. **B2 — DB scope migration.** Idempotent migration: if dual-accept, ADD the new `purpose` value to the CHECK + recreate the constraint/unique-index/index/trigger to accept both, backfill existing rows, then (later window) remove the old; if clean cutover (zero live rows), a single idempotent migration swapping the value + recreating the dependent objects. Treat as a schema change to an existing table. Founder runs it in the Supabase SQL editor.
4. **B3 — agent-card.json.** Update `tokenPrefix`, the `Bearer` example, the brand line at `:137`, and the **extension URI** per the versioning election. This is the published-contract change — coordinate with B1 (the prefix the card advertises must match what the routes accept).
5. **B4 — the 3 public-copy UI surfaces.** `limitations/page.tsx:114`, `ops-hub/page.tsx:894`, `guardrail/route.ts:44` per the elected public-copy wording.

### Critical Change Protocol (0c-ii) — complete VISIBLY before asking the founder to deploy
1. **What is changing** — plain language, per surface.
2. **What could break** — the specific worst case (e.g. "an agent presenting an old-prefix token gets 401 after cutover"; "a malformed scope migration drops the unique index and lets duplicate write-credentials exist").
3. **What happens to existing sessions / credentials** — "no current users" → third-party N/A; but state the test-credential impact and whether any issued token stops working.
4. **Rollback plan** — exact founder-runnable steps per surface (revert commit for code/agent-card; the inverse SQL for the scope migration — provide it).
5. **Verification step** — per surface: a `curl`/test command with expected output (e.g. old-prefix token → 401; new-prefix token → 200); agent-card serves the new shape; the 3 UI surfaces render the new copy.
6. **Explicit founder approval** specific to the named risks before deploy.

### Verify
`npx tsc --noEmit` → 0. Affected suites green (the accreditation route suites, `security.test.ts`, calling/reflect route suites — several need `npx tsx --env-file=.env.local` per `/CLAUDE.md`). For the live surfaces: founder runs the per-surface verification commands from the Critical Change Protocol (prefix accept/reject; agent-card shape; scope migration VERIFY block; UI copy). Grep-confirm no `D-ATL-*` ID altered and that the OLD prefix/scope values are gone from live code (or dual-accepted, per election).

### Decision-log + close (FULL Critical form)
Append a `D-…-C-PHASE3-…` entry. Write the **full** Critical session close (per `/adopted/standing-protocol-cache.md` §"Critical-risk sessions": Verification Method Used, Risk Classification Record, PR5 Knowledge-Gap Carry-Forward, Founder Verification (Between Sessions), Orchestration Reminder). If a governed surface changes, update the affected cache in the same session and log a `D-CACHE-DRIFT-RESOLVED-…` entry.

## Part C — Anticipated session shape (Phase 3)
| Phase | Estimate |
|---|---|
| Caches + manifest targeted + predecessor close + design-pack §C read | 20–30 min |
| Naming + cutover elections | 15–25 min |
| B1 single-route prefix proof → rollout | 45–75 min |
| B2 DB scope migration (write + founder-run) | 30–60 min |
| B3 agent-card + B4 public copy | 30–45 min |
| Critical Change Protocol (visible) + verify | 30–45 min |
| Decision-log + full Critical close | 30–45 min |
| **Total** | **~3.5–5 hours (consider splitting across two sittings)** |

## Rollback path
Per surface: code + agent-card + UI copy revert by reverting the commit; the DB scope migration reverts via the inverse SQL (provide it in the Critical Change Protocol). No runtime behaviour changes until the founder runs the migration + deploys.

## Forecast
Success = "ATL" / "Agent Trust Layer" fully retired across the external/wire-format + public surfaces (new prefix, new scope, versioned extension URI, public copy), completing the Track C rename arc end-to-end. After Phase 3, the locked order returns to **E** (E#1 — persist the Agent-Card verdict — the one pre-launch item). The two parked decisions remain available to slot in: the `trust-layer/` folder rename and the `mode:'atl_wrapper'` classification (the latter is a sensible quick win to do before any future attempt to rename that discriminant). The founder elects each session's bite at open.

End of prompt. Opens as a `code-critical` Phase-3 session (re-declare to `code-elevated` for E#1 or the trust-layer/ rename, or `governance` for the atl_wrapper classification). Baseline: C Phases 1 + 2 done/Verified, A-track Live/Verified (gated), Vercel green — stable known-good.
