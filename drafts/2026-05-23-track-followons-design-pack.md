# Track Follow-ons Design Pack — Sage Reflect PR7 (A) + ATL→Sage Assent (C) + Sage Calling (E) + Cleanup (F)

**Status:** Draft / **Under review**. Nothing here is Adopted or built. This pack is the safe-layer output of the 2026-05-23 track-election session (design notes, a governance ack, a rename impact-map + plan, a surfaced follow-on list, and a founder-side cleanup handoff). The code builds in A and C await an explicit "build this" from the founder at the gate in the final section.
**Date:** 2026-05-23.
**Stream:** founder. **Session tier:** `governance` (election + design/scope only; no code touched, no deploy, no schema change).
**Governing frame:** `/adopted/standing-protocol-cache.md` + `/adopted/build-sessions-protocol-cache.md` ("no current users" holds — founder + test logins only).
**Predecessor:** `/operations/handoffs/founder/2026-05-22-sage-reflect-stage-b-build-close.md`; decision-log `D-SAGE-REFLECT-STAGE-B-METERING-FIX-AND-LIVE-VERIFICATION-2026-05-22`.
**Baseline:** Sage Reflect **Live / Verified (gated)** behind `SAGE_REFLECT_ENABLED=true`. Reversible at any time by unsetting the flag (→ 503, no redeploy).

---

## How to use this pack

Each design note is written so you can decide whether to greenlight the build without reading code. The build-go-ahead gate is the last section. Read A3 first — it is the one item that needs a decision from you (a governance acknowledgement), not just a greenlight.

Risk language is per 0d-ii: **Standard / Elevated / Critical**. Status language is per 0a: `Scoped → Designed → Scaffolded → Wired → Verified → Live`. Everything below is currently at most **Designed**.

---

# Track A — Sage Reflect PR7 follow-ons

These are refinements to the now-live product. The deterministic engine already implements all the cross-session logic (FD-R2 / FD-R4 / Q1-3-null) and the R18d suite proves it on fixtures; the live endpoint just doesn't yet feed it real data. A1, A2, A4 are about feeding real data faithfully. A3 is a governance confirmation.

## A3 — Zone-3 harm-flag carrier field (GOVERNANCE ACK — needs your confirmation)

**Why this is first.** This is the only carried item flagged *Diagnostic-uncertain (symptom level)* in the Stage B build, which under PR10 means it needs your explicit acknowledgement before it counts as resolved. It is not a build — it is a decision about a contract.

**What the code does today** (`website/src/lib/sage-reflect/zone3-boundary.ts`). Before any reflection runs, a deterministic boundary asks "did this session reveal an act that caused significant harm?" It engages (records a contrary-kathekon, surfaces the developer note, and does NOT run the six questions) when **either** of two signals is present:

1. `safety_signal.harm_flagged === true` — an explicit boolean the upstream/developer sets at session close (the TR-03 "blocked act" path supplies this), or
2. any entry in `acts_blocked[]` whose `category === 'harm'` — i.e. Sage Assent blocked an act for a harm reason.

The locked design (`/adopted/sage-reflect-product-design.md`, SR-9) names the boundary's *behaviour* but never named the exact *carrier field*. Stage B chose the two-signal reading above as the most faithful interpretation and flagged it for your confirmation.

**The decision in front of you (pick one):**

- **(a) Confirm the two-signal reading as canonical.** Then this is **governance only (Standard)** — I update SR-9 in the product design to state the carrier explicitly, log the confirmation, and the code is unchanged. Recommended-neutral: it is what is already live and tested.
- **(b) Name a single canonical field** (e.g. only `safety_signal.harm_flagged`, treating `acts_blocked` category as advisory). This is a **code change to a safety boundary → PR6 → Critical**, full Critical Change Protocol, because it narrows what trips the boundary.
- **(c) Broaden the carrier** (e.g. add a third signal). Also **PR6 → Critical**.

**My read (stated, not prescribed):** (a) is the safe default — the two-signal reading is permissive (more inputs trip the boundary, never fewer), which is the conservative posture for a harm gate. (b) narrows the gate and is the one to think hardest about. I have no concern with (a); I'd want the Critical Change Protocol if you choose (b) or (c).

**This needs a one-word answer from you: (a), (b), or (c).**

---

## A1 — Cross-session context faithful population (design note)

**Your stated sequence for A1 was "design note then build." This is the note.**

**The gap.** The live endpoint hands the engine `prior_sessions: []` and `sage_assent_agreement_streak: 0` on every call (`reflect-service.ts` → `buildContext`, lines 81–83). So three engine behaviours never fire from real history:

- **FD-R2** (cross-session progress-dimension hold) — holds a profile from improving on a suspiciously "clean" session unless the session is genuinely comparable to prior ones. Needs prior sessions' *failure counts* and *complexity*.
- **The Q1 3-null flag** — flags a pattern of three consecutive "nothing to report" Q1 answers. Needs prior sessions' `q1_clean` booleans.
- **FD-R4 deference detection** — flags an all-correct calibration record sustained over a streak as possible deference to the upstream product rather than independent judgement. Needs the `sage_assent_agreement_streak`.

**The exact contract the engine consumes** (`engine.ts`):

```
interface PriorSessionSummary {
  complexity: number     // coarse: turn/action count of the prior session
  q1_clean:  boolean     // was that session's Q1 a clean (no-distortion) read
  failures:  number      // synkatathesis failures recorded that session  (FD-R2 mean)
}
ReflectContext.prior_sessions            // most-recent-first; engine uses up to last 3
ReflectContext.sage_assent_agreement_streak  // consecutive all-correct calibration sessions
```

**What to build.**

1. **Schema (Elevated — change to an existing table).** Add cleartext scalars to `sage_reflect_sessions`, written at completion, so the open-path read never has to decrypt prior sessions' intimate blobs (R17b stays intact):
   - `complexity int` — the completed turn count (the engine computes `currentComplexity = history.length`; store the same).
   - `calibration_all_correct boolean` — `verdicts_reviewed > 0 AND discrepancies_found = 0` for that session (the streak input).
   - `q1_clean` and `failures` are **already derivable in cleartext** from the existing plaintext logs (`phantasia_distortion_log` empty → q1_clean; `synkatathesis_failure_log.length` → failures), so no new column is needed for those. Confirm at build that the logs are populated at completion as assumed.
2. **Open-path read (Elevated — new query on the live endpoint's open path).** Replace the hardcoded empties in `buildContext` with: a query of the last 3 completed `sage_reflect_sessions` rows for this `agent_id` (most-recent-first) mapped to `PriorSessionSummary`, plus a streak computation walking completed rows newest-first counting consecutive `calibration_all_correct = true`.
3. **Wire** `buildContext` to take and pass these (it currently takes only the summary).

**Risk / rollback.** Elevated. Additive schema (new nullable columns; reversible via `ALTER TABLE ... DROP COLUMN`). The read is on the open path of the live endpoint — a query failure must fail-closed to the current behaviour (empty context) rather than 503, so a bad read degrades to today's behaviour, not an outage. Engine logic is unchanged and already fixture-proven.

**Verification (founder-performable).** After build: run a second reflection for the same test agent and confirm (Supabase) the new columns populate at completion; then a third clean session should trip the Q1 3-null flag / FD-R2 hold visible in the response's coarse status. Existing 163-assertion suite must stay green; add engine-context integration assertions.

**Open question for build.** Confirm the `PriorSessionSummary.failures` field maps to `synkatathesis_failure_log` length (not a combined failure count) — to be checked against `engine.ts` FD-R2 at build.

**Note on overlap with C.** A1's streak read touches the Sage-Assent-feed/calibration concepts that the C rename also touches. If both are greenlit, sequence A1's build **before** C's rename, or C will have to re-touch A1's new code. (Flagged again in Track C.)

---

## A2 — Precise R5 cost-health (design note)

**The gap.** `makeMeter` (`route.ts`, line 145) does `Math.round(rawCostCents)` before recording `anthropicCostCents`. This is correct for *billing* — the `increment_api_usage` RPC stores integer cents and the loop bills at base rate. But it means a sub-cent Sonnet pass records **0** anthropic cost. The R5 "revenue-to-cost ≥ 2x" health signal reads that figure, so true sub-cent cost is invisible to the guardrail and the 2x ratio looks artificially healthy.

**What to build (Elevated — additive; does NOT change the bill).** Keep the integer-cents loop bill exactly as is (it is the customer-facing billing contract and it works). Add, alongside it, a **microcent-precise cost accumulator** mirroring the substrate's `incrementCostTracker` pattern: `sonnetCostMicrocents()` already returns microcents pre-rounding (`reflect-extractor.ts` `usageToCents` divides by 10000 *then* the route rounds) — record the raw microcents into a per-agent / per-surface / per-period accumulator that the R5 cost-health reporter reads. This decouples *billing rounding* (integer cents to the customer) from *cost truth* (microcent accumulation for the health metric).

**Files (anticipated).** `route.ts` (`makeMeter` — add the accumulator call alongside `recordLoopBilling`); a small cost-tracker module or RPC mirroring the substrate's; the R5 cost-health reporter to read the accumulated microcents. Confirm the exact substrate `incrementCostTracker` signature at build (it is referenced in the metering-fix decision-log entry).

**Risk / rollback.** Elevated, but lower-stakes than A1/A4: it is purely additive observability and does not alter the billed amount or the response path. **Extra caution flag:** this is the same metering path that had two defects fixed on 2026-05-22 — so even though additive, treat it with a deliberate verify step (assert the accumulator total equals the summed raw microcents across a multi-call pass). Rollback: remove the accumulator call; billing is untouched throughout.

**Verification.** A multi-question pass should accumulate a microcent total that, summed and divided by 10000, matches the sum of per-call `usageToCents` floats — proving no precision is lost. The integer bill is unchanged.

---

## A4 — Q5 sandwich-escalation (design note)

**The gap.** `buildQ5Deterministic` (`reflect-extractor.ts`, lines 189–200) always returns the conservative reading: `reasoning_pattern_change: false`, no capacity delta. That is correct by default (a single session shouldn't move the profile without confirmation). But it means the engine's FD-R2 `q5ConfirmsChange` gate can never be satisfied from a genuine, clearly-stated change — when an agent's Q5 free text really does report a confirmed reasoning-pattern change, the deterministic keyword read can miss it and the progress-dimension hold stays on.

**What to build (Elevated — adds one conditional Layer-1 call).** Add an `extractQ5` method to the Sonnet extractor (mirroring `extractQ1..Q4`) plus an **ambiguity detector** on the deterministic read. The flow: run `buildQ5Deterministic` first (free); if the result is *ambiguous* (free text contains change-cues but the structural read can't resolve capacity delta vs. carry-over), make the optional 5th Sonnet call to extract `capacity_delta` + `reasoning_pattern_change`; otherwise keep the conservative default. The meter already takes the per-call cost, so billing follows automatically.

**R5 cost impact (flag).** This moves the documented bound from "≤4 Layer-1 calls per pass" to "≤5 in the ambiguous case." That is a change to the AC-level cost-bound statement (`reflect-extractor.ts` header + the design doc), so the design doc's R5 bound must be updated and the cost-health guardrail (ideally A2's precise one) should be in place first. **Recommend sequencing A2 before A4.**

**Files (anticipated).** `reflect-extractor.ts` (new `extractQ5` + ambiguity detector + a `Q5_SYSTEM` prompt); `reflect-service.ts` (Q5 branch calls the escalation when ambiguous and bills it); the design doc + header R5-bound update; new assertions.

**Risk / rollback.** Elevated. Touches the extraction + cost path. Rollback: remove the conditional call → reverts to today's always-conservative Q5. Defensive-parse posture (drop invalid vocabulary, never coerce) carries over from the existing mappers.

**Verification.** A Q5 answer with an explicit confirmed change should now release the FD-R2 hold (visible in coarse status); an ambiguous-but-not-changed answer should still hold; a clearly-unchanged answer makes no 5th call (assert call count). Confirm a full pass never exceeds 5 Sonnet calls.

---

# Track C — ATL → Sage Assent rename (impact-map + phased plan)

**Headline: this is a CRITICAL, multi-session arc, not a find-replace.** "ATL" / "Agent Trust Layer" appears across ~140 files (~50 in live code, ~15 load-bearing). Two of those touch **external, persisted, wire-format** surfaces — renaming them naively is a breaking change. A blanket rename would break issued credentials, the published agent-card contract, and DB constraints. The plan below phases the safe parts away from the breaking parts.

## Impact inventory (categorised)

**(A) Internal code identifiers — safe to rename freely (~20 files).** File names `atl-*.ts` (`atl-wrapper`, `atl-bridge`, `atl-accreditation-writer/store`, `atl-tree-search-adapter`, `atl-iteration-patterns`), functions `generateAtlWriteToken` / `validateAtlWriteToken` / `evaluateAtlWriteRow`, the const **name** `ATL_WRITE_TOKEN_PREFIX` (the name, not its value), the type tag `kind:'atl_write'` in internal audit events, `trust-layer/grade-engine/`, `window-aggregator.ts`, `card/accreditation-card.ts`, and import-only references in `sage-reflect/sage-assent-feed.ts` + `agent-hand-back-report.ts`. Mechanical: file renames + import updates + symbol renames. **Standard/Elevated.**

**(B) External / wire-format / persisted — BREAKING. These set the arc's risk to Critical.**
- **`sr_atl_` credential prefix (LIVE TOKEN VALUE).** Hardcoded in `security.ts:551` and matched in `Bearer sr_atl_` checks in `accreditation/[agent_id]/route.ts:390`, `calling/route.ts:153`, `practice/reflect/route.ts:115`. Changing the value **invalidates every issued credential** and breaks the published agent-card contract. *Mitigant:* production currently has **zero live credentials** (the test cred was/will be revoked under F), so the cost of changing the prefix is at its lowest right now — but it still breaks the published `.well-known/agent-card.json` contract, so it needs a coordinated change, not a silent one.
- **`atl_write` persisted DB scope value.** `website/supabase-api-keys-a10-migration.sql` has a `CHECK (purpose IN ('ecosystem','atl_write'))`, a constraint `api_keys_atl_write_requires_owner_and_agent`, a unique index `api_keys_atl_write_owner_agent_unique`, an index, and the profile-delete trigger — all filtering `WHERE purpose='atl_write'`. Renaming requires a **data migration on existing rows + constraint/index/trigger recreation** (a Critical schema change).
- **Published A2A contract** `website/public/.well-known/agent-card.json`: `tokenPrefix:"sr_atl_"`, the `Bearer sr_atl_<token>` example, and the **extension URI** `https://sagereasoning.com/extensions/atl-write-auth/v1` — a versioned external identifier third-party agents key on. Changing it is a public-contract change (version bump + notice territory).

**(C) Docs / governance / registry (~120 files, mostly historical).** `operations/decision-log.md` has ~60 `D-ATL-*` decision IDs — **immutable historical anchors; do not rename** (renaming breaks cross-references). `manifest.md`, `adopted/project-instructions-snapshot.md`, several `adopted/*-design.md`, `drafts/`, many handoffs, and `website/public/component-registry.json` (two entries named "Agent Trust Layer"). Archive/backup/reference files are likely out of scope.

**(D) Public-facing product/brand language (4 surfaces — R18a/R18b).** `agent-card.json:137` ("The Agent Trust Layer write surface"), `limitations/page.tsx:114` (user copy), `ops-hub/page.tsx:894` (UI label "P3: Agent Trust Layer"), `guardrail/route.ts:44` (a comment). These are a positioning decision as much as a rename — they change what a user/developer sees the product called.

## Proposed phasing (for your approval — not yet sequenced into sessions)

1. **Phase 0 — Naming decision (governance, Standard).** Confirm the target: is it "Sage Assent" everywhere, or does "Agent Trust Layer" survive as the *external/public* category label while internals become "Sage Assent"? This decision determines whether (D) and the external contract in (B) change at all. **This is a positioning call (PR16) and should be made before any code moves.** Decide the `D-ATL-*` ID policy (recommend: leave historical IDs as-is; new entries use the new name).
2. **Phase 1 — Internal identifiers (A) (code-elevated).** File/symbol/import renames with no external surface. Single mechanical pass, tsc + suites green. No deploy risk beyond a normal build.
3. **Phase 2 — Docs / registry (C, D-internal) (Standard/governance).** Markdown, manifest, registry copy, project-instructions. Leave decision-log IDs.
4. **Phase 3 — External/wire-format (B) + public copy (D) (CRITICAL — full Critical Change Protocol, dedicated session(s)).** Only if Phase 0 decided the external name changes. Backward-compatible handling: dual-accept old+new credential prefix during a window; scope migration that adds the new value before removing the old; version-bump the agent-card extension URI; coordinate the public copy. **Lowest-cost window for the prefix is now (zero live credentials) — but still Critical.**

**SR-15 reconciliation (carried).** The Sage Reflect side computes per-domain proximity (`sage_reflect_proximity_domains`) while the ATL/Sage-Assent store keeps an aggregate `typical_proximity`. The rename arc is the natural place to reconcile the naming + decide whether a native per-domain field replaces the Sage-Reflect-side computation. Fold into Phase 1/2.

**Sequencing note:** if A1 (cross-session) is greenlit, build it **before** Phase 1 of C, so C renames A1's code once rather than A1 landing on soon-renamed code.

---

# Track E — Sage Calling PR7 follow-ons (surfaced)

From the Sage Calling LIVE close + locked design. The close frames these as "small, optional refinements," tier `code-elevated`/`code-standard` per sub-item. **None requires your acknowledgement** — they are electable, not pending.

1. **Persist the Agent-Card verification verdict** — so the chosen-role hint carries into the five-spec assembly; today the verdict is logged but not stored, so `role` defaults to `individual_nature`. *The most actionable item — a concrete code effect.*
2. **Per-developer delegated Hard-Gate approval** (vs admin-only) — *"only meaningful once external users exist."* Defer until there are external users.
3. **Rules+LLM hybrid (D-4)** — *not triggered* (the R18d suite showed the rules held); revisit only on a future missed-signal finding. Would engage PR4 + KG2 + a `constraints.ts` row.
4. **D-10 — substrate-supplied operational-health signal** — trigger: the wrapper observability surface becomes available.
5. **D-11 — full interruptibility** (mid-sequence context injection; cross-session stage-skipping) — trigger: demonstrated post-launch demand.

(D-7 retention/deletion, D-12 timeout/new-context, and R18b badge appear resolved or N/A — built during the Sage Calling arc.)

**My read:** only #1 is worth doing pre-launch and pre-external-users; #2/#4/#5 are explicitly gated on conditions that don't hold yet ("no current users"); #3 is conditional on a finding that hasn't occurred. So E realistically = "build #1, park the rest."

---

# Track F — Cleanup handoff (founder-side commands)

The cleanup is founder-side: I can't reach Supabase, the live admin route, or delete files in your workspace (deletion is permission-gated). I attempted the local script removal — it was blocked by the workspace, so the file is untouched. Run these between sessions.

**1. Inspect then delete the smoke rows** (Supabase SQL editor). Inspect first:
```sql
SELECT session_id, agent_id, current_step, created_at
FROM sage_reflect_sessions
WHERE session_id LIKE 'smoke-reflect-%'
ORDER BY created_at;
```
Then delete (data deletion is Critical-tier, but these are your own smoke rows, no users):
```sql
DELETE FROM sage_reflect_sessions WHERE session_id LIKE 'smoke-reflect-%';
```
Optionally also clear the proximity row(s) the smoke agent created, if you used a dedicated smoke `agent_id`:
```sql
-- inspect first; only if the agent_id was smoke-only
SELECT * FROM sage_reflect_proximity_domains WHERE agent_id LIKE '%smoke%';
```

**2. Revoke the two test credentials** via the admin route (`DELETE /api/admin/accreditation-credentials`). Revocation needs the credential's **UUID** (`id`), not the label. First find the IDs in Supabase:
```sql
SELECT id, label, agent_id, is_active
FROM api_keys
WHERE purpose = 'atl_write'
  AND (label IN ('agent_smoketest_v1','agent_reflect_smoke_v1')
       OR agent_id IN ('agent_smoketest_v1','agent_reflect_smoke_v1'));
```
Then, for each `id`, call the admin route (founder-authenticated, e.g. via the admin UI or an authenticated request):
```
DELETE https://sagereasoning.com/api/admin/accreditation-credentials?id=<credential-uuid>
   body (optional): { "reason": "smoke-test cleanup 2026-05-23" }
```
Expected: `200 { "revoked": true, "credential_id": "...", "revoked_at": "..." }`. Revocation sets `is_active=false` (the verifier only matches active rows), so the token stops working immediately. A `409` means it was already revoked (fine).

**3. Delete the local smoke script** (git-tracked, so this both removes and stages the deletion):
```
cd "/Users/clintonaitkenhead/Claude-work/PROJECTS/sagereasoning"
git rm smoke-test-reflect.sh
```
(Commit it with the rest of this session's changes.)

---

# THE GATE — what needs your decision

1. **A3 (decision, not a build):** answer **(a)** confirm the two-signal harm-flag carrier as canonical [governance only], **(b)** name a single canonical field [Critical], or **(c)** broaden it [Critical].
2. **A1 / A2 / A4 (greenlight to build):** say "build" on any subset. Recommended order if multiple: **A2 → A4** (A2's precise cost-health should land before A4 raises the call bound to 5); **A1** independent but **before C**.
3. **C (approve the phasing + Phase 0 naming decision):** confirm whether the *external/public* name changes or only internals do. That single decision sets whether C is a mechanical internal rename (Phases 1–2, Elevated) or also a Critical external-contract change (Phase 3).
4. **E:** elect #1 (persist Agent-Card verdict) if you want it pre-launch; the rest are condition-gated.
5. **F:** run the three command blocks above between sessions.

Nothing here is built or committed. The session touched no code, changed no schema, and made no deploy — the baseline (Sage Reflect Live/Verified, gated) is unchanged.
