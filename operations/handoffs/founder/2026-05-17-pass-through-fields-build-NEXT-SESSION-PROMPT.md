# Next-Session Prompt — Session #4 of the post-6b arc tail: Pass-Through Fields Build

**Stream:** founder.
**Tier:** `code-elevated` — **Elevated** risk under 0d-ii. **Lean** template + Elevated additions per the standing protocol cache. Critical Change Protocol NOT engaged this session (additive type-system changes; no auth surface change; AC7 NOT engaged in the conventional sense). PR6 NOT engaged.
**Governing frame:** `/adopted/standing-protocol-cache.md` (general protocol — `code-elevated` row → **Lean** template + Elevated additions) + `/adopted/build-sessions-protocol-cache.md` (build-arc context — "no current users" governing note applies; load-bearing for the simplification that no third-party consumers depend on the substrate's EvaluatedAction / CarriedProfile interface today).
**Predecessor session close:** `/operations/handoffs/founder/2026-05-17-pass-through-fields-design-pass-close.md` (design pass adopting the six locked decisions).
**Predecessor decision-log entries:** `D-PASS-THROUGH-FIELDS-LOCKED-2026-05-17` (the six-decision design — this build's spec); `D-BILLING-MODEL-BUILD-WIRED-VERIFIED-2026-05-17` (Option D build Verified end-to-end including the 2026-05-17 addendum; not directly affected by this build but the metering layer's loop_billing_events ledger is the surface pass-through fields integrate with in future at session #5 + Option C tiered billing); `D-ATL-A10-DESIGN-LOCKED-2026-05-16` (A10 design Adopted; will be Superseded at session #5).
**Sequencing source:** session #4 of 6 in the post-6b arc tail per the 2026-05-16 A10 design close Part 2 + the 2026-05-17 Option D build close + the 2026-05-17 pass-through fields design close.
**Risk classification:** **Elevated** under 0d-ii. Additive type-system changes + new validator module + discovery-files update + tests; no schema migration in the lean form (persistence deferred to session #5); no auth surface change; backward-compatible per-field optional posture preserves existing substrate consumers. Elevated additions per the cache: name what could break and provide a rollback path; founder approves before deployment; verification step provided.

---

## Why this session matters

Session #3 (today) locked the design for six pass-through fields landing on `EvaluatedAction` (`operation_class`, `target_system_vendor`, `target_system_detail`, `outcome_verification`, `reversibility_signal`) and `CarriedProfile` (`downstream_identity_model`, `path_posture`). The substrate validates the enum values and persists them; it does not interpret them for Layer 1/2/3 reasoning. Downstream consumers (Option C tiered billing once activated; enterprise procurement reviewers reading the `AccreditationPayload`; the A10 credential surface at session #5; future MCP integrations per R18c) read these fields for audit, compliance, and tiered-billing decisions.

Session #4 implements the design. After this build lands, the substrate carries enterprise-readable metadata across every action evaluation. Three downstream surfaces immediately benefit: Option C tiered-per-action billing becomes implementable (was blocked on `operation_class` existing); the A10 design rewrite at session #5 can integrate the fields into the credential surface; the AccreditationPayload's typical-class exposure becomes possible (deferred to session #5 in the lean form).

**Plan ~2–3 hr** matching the design's build-session estimate. Founder mid-session input concentrated at Step 0 (scope confirmation + ~3 build-session discretion picks) and Step 4 (founder approval before deploy per Elevated discipline).

---

## Pre-conditions

1. **Session #3's commit pushed to git** (founder confirms via the predecessor close's Founder Verification block). No Vercel rebuild expected for the governance commit; production state unchanged.
2. **Founder has read `/adopted/pass-through-fields-design.md`** end-to-end and the six locked decisions A–F match the founder's recollection of the Step 2 elections from the design pass.
3. **Founder commits to a ~2–3 hr bounded session** with mid-session input at Step 0 + Step 4.
4. **Production state unchanged from session #3 close** (substrate at A7 Verified; Option D per-loop metering Live + Verified; Stripe test-mode wiring Verified; Stripe live activation Deferred; SUBSTRATE_WRITE_PATH_ENABLED UNSET; SUBSTRATE_LAYER3_ENABLED UNSET; SUBSTRATE_R20A_GATE_ENABLED UNSET; both ATL tables empty).

---

## Part A — Open under the protocol

Read in order:

1. **`/adopted/standing-protocol-cache.md`** (~3 min) — confirms tier (`code-elevated`), risk class (Elevated), Lean + Elevated template, signals, status vocabulary. Model selection N/A this session (no LLM calls — type-system + validator implementation only).
2. **`/adopted/build-sessions-protocol-cache.md`** (~3 min) — confirm "no current users" governing note (load-bearing for the simplification that existing substrate consumers are byte-untouched at runtime; only the type-system extends).
3. **`/operations/handoffs/founder/2026-05-17-pass-through-fields-design-pass-close.md`** (~5 min) — predecessor close. Particularly the "Next Session Should" block + the build-session implementation summary table referenced.
4. **`/adopted/pass-through-fields-design.md`** (~10–15 min — the day's primary deliverable; read in full) — six decisions A–F with TypeScript type definitions + validator helpers + structural constraints + integration-with-adjacent-surfaces section + ~10-row build-session implementation summary table.
5. **Targeted code reads** (~10–15 min — confirm current shapes before extending):
   - `/website/src/lib/substrate/trust-layer/types/evaluation.ts` (current `EvaluatedAction` + `KathekonQuality` + `DeliberationBreadth` shapes; also check if `CarriedProfile` lives here)
   - `/website/src/lib/substrate/trust-layer/types/accreditation.ts` (the verbatim-port file; check if `CarriedProfile` lives here instead; check the port-mirror banner for keep-in-sync discipline)
   - `/website/src/lib/substrate/trust-layer/accreditation/accreditation-record.ts` (the constructor + `buildAccreditationPayload`; informational — AccreditationPayload exposure deferred to session #5)
   - `/website/src/lib/substrate/atl-wrapper.ts` (existing consumer — confirms it produces `EvaluatedAction`s without the new fields; backward-compatibility check)
   - At least one other existing consumer (e.g., the kathekon-aligned scorer or hand-back report) to triple-check backward compatibility
6. **`/operations/decision-log.md` last 3 entries** (~5 min) — `D-PASS-THROUGH-FIELDS-LOCKED-2026-05-17` (this build's spec), `D-BILLING-MODEL-BUILD-WIRED-VERIFIED-2026-05-17` (with Addendum 2026-05-17), `D-BILLING-MODEL-LOCKED-2026-05-17` (Option D design — informs the loop_billing_events integration context).
7. **PR11 inbox scan** — list `/inbox/` for files dated since the predecessor close (2026-05-17). Prompt kit (`20260508-262-promptkit-1.md`) is already-consumed source.
8. **PR15 consult** — `.claude/skills/anthropic/` review (or, in Cowork mode, the project-instructions panel reference). Candidate primitives: `skill-creator` (informational); `mcp-builder` (forward pointer for R18c — pass-through fields could later be exposed via MCP tool descriptions). Bespoke election expected — substrate-internal type-system + validator code has no Anthropic primitive substitute.

**Confirm at open:** tier (`code-elevated`); hold-point status (P0 0h active); model selection N/A (no LLM calls); status vocabulary (`Scoped → Designed → Scaffolded → Wired → Verified → Live` for implementation; `Adopted / Under review / Superseded` for decisions); signals + risk classification per 0d-ii; **Critical Change Protocol NOT engaged** this session.

---

## Part B — Procedure

### Step 0 — Scope confirmation + build-session discretion picks (~10–15 min)

Via AskUserQuestion, surface:

1. **Scope confirmation.** Implement the six-field design as written? Or amend any decision before build? (Default: implement as written — Standard election.)
2. **`CarriedProfile` location.** The build session has discretion on where `CarriedProfile` lives (`evaluation.ts` vs `accreditation.ts`). The design names `evaluation.ts` as the preferred location but acknowledges the build session checks. If `CarriedProfile` lives in `accreditation.ts`, the port-mirror pattern requires parallel changes in `/trust-layer/types/`.
3. **Validator module placement.** The design names `/website/src/lib/substrate/trust-layer/validation/pass-through-fields.ts` as a NEW file. If `/trust-layer/validation/` doesn't exist yet, the build session creates the directory. Confirm or override the path.
4. **Test scope.** ~40–50 plain-assertion tests covering each normaliser's enum membership + default behaviour + soft-fallback + length cap. Confirm test count is in the right ballpark, or scope narrower (e.g., 20–30 tests) / wider (full property-test coverage).

Other discretion picks may surface in-session; founder elects per question.

### Step 1 — Extend `evaluation.ts` with 6 new types + extend interfaces (~20–30 min)

Add the six new exported types:

```ts
export type OperationClass = 'read' | 'search' | 'summarize' | 'draft' | 'recommend' | 'write' | 'approve' | 'execute' | 'delete' | 'unknown'
export type DownstreamIdentityModel = 'delegated_user' | 'service_account' | 'vendor_framework' | 'api_key' | 'browser_session' | 'mcp_server' | 'unknown'
export type PathPosture = 'endorsed' | 'open_api' | 'ambiguous' | 'unsanctioned'
export type TargetSystemVendor = 'salesforce' | 'microsoft' | 'servicenow' | 'sap' | 'workday' | 'zendesk' | 'hubspot' | 'atlassian' | 'other' | 'none'
export type OutcomeVerification = 'self_reported' | 'system_confirmed' | 'external_auditor' | 'not_applicable'
export type ReversibilitySignal = 'reversible' | 'partially_reversible' | 'irreversible' | 'unknown'
```

Extend `EvaluatedAction` with 5 optional fields (`operation_class`, `target_system_vendor`, `target_system_detail`, `outcome_verification`, `reversibility_signal`). Each field documented with a comment naming the decision (A, D, E, F) + the date + the PR15 backward-compatibility note. Extend `CarriedProfile` with 2 optional fields (`downstream_identity_model`, `path_posture`).

Verify `tsc --noEmit` passes after the change (existing substrate consumers should be byte-untouched — optional fields mean undefined is valid).

### Step 2 — Port-mirror update if required (~5–10 min)

If `CarriedProfile` lives in `accreditation.ts` (per Step 0's confirmation), the verbatim-port banner requires the same changes in `/trust-layer/types/accreditation.ts`. If `CarriedProfile` lives in `evaluation.ts`, check whether `evaluation.ts` is also a verbatim port (check the file's banner) and propagate accordingly.

Verify `tsc --noEmit` clean.

### Step 3 — New validator module (~20–30 min)

Create `/website/src/lib/substrate/trust-layer/validation/pass-through-fields.ts` (NEW; create directory if needed). Per the design's structural constraints:

- Six `VALID_*` constants (one per enum)
- Six `normalise*` functions (one per field; soft-fallback to default with warning log on unknown values; length cap on `target_system_detail`)
- All exports typed
- One module for cohesion (the design's recommendation)

Verify `tsc --noEmit` clean.

### Step 4 — Tests (~30–45 min)

Create `/website/src/lib/substrate/trust-layer/validation/__tests__/pass-through-fields.test.ts` (NEW). Plain-assertion shape matching the substrate's existing test pattern (per CLAUDE.md: `tsx` is a devDependency; tests are plain-assertion scripts run with `npx tsx`). Expected ~40–50 tests covering:

- Each of the six normalisers: enum membership (every valid value round-trips); default behaviour (undefined / null / empty string → default); soft-fallback (unknown value → default with warning); plus field-specific cases (length cap on target_system_detail; vendor 'other' vs 'none' distinction)
- A few cross-field cases (e.g., a complete EvaluatedAction with all five new fields populated; a CarriedProfile with both new fields)
- Backward-compatibility: an EvaluatedAction without any new fields type-checks + the optional fields default correctly when read

Run the test file with `npx tsx <path>`. Expected: all tests pass; tsc clean. Build session confirms in-session before proceeding.

### Step 5 — Discovery files (~15–20 min)

Update three discovery files to document the six fields:

- `/product/AGENTS.md` — pass-through-metadata section added; six fields documented with enums + defaults + cross-reference to the prompt kit source
- `/website/public/llms.txt` — same as AGENTS.md
- `/website/public/.well-known/agent-card.json` — `accepts` or `metadata` extension naming the six field schemas

The build session has discretion on the exact copy within the constraint "consistent language across all three surfaces."

### Step 6 — Elevated discipline: founder approval before deploy (~10–15 min)

Per 0d-ii Elevated: name what could break, provide a rollback path, founder approves before deploy.

What could break:
- Existing substrate consumers producing `EvaluatedAction`s without the new fields — should be byte-untouched at runtime (optional fields + defaults at read time)
- The verbatim-port pattern in `/trust-layer/types/` — if not propagated, the port-mirror diverges (Standard-risk follow-up to reconcile)
- Discovery-file readers parsing AGENTS.md / llms.txt / agent-card.json — additive metadata; readers that ignore unknown fields are unaffected

Rollback path:
- Pre-push: `git reset --hard HEAD~N` discards local commits; no production effect.
- Post-push: `git revert HEAD~N..HEAD --no-edit` + push via GitHub Desktop; Vercel rebuilds (~2 min); type-system reverts to pre-build shape.

Verification step:
- Local: `cd "/Users/clintonaitkenhead/Claude-work/PROJECTS/sagereasoning/website"`; then `npx tsc --noEmit` (expected: exit 0); then `npx tsx src/lib/substrate/trust-layer/validation/__tests__/pass-through-fields.test.ts` (expected: all tests pass).
- Post-deploy: smoke-test `curl -i -X POST https://www.sagereasoning.com/api/reason -H "Authorization: Bearer sr_live_*" -H "Content-Type: application/json" -d '{"input":"test","depth":"quick"}'` confirms `/api/reason` still emits the six X-Loop-* headers and returns HTTP/2 200 (additive type-system change must not regress Option D metering).

Founder elects: "OK to deploy" or "Hold for review".

### Step 7 — Append `D-PASS-THROUGH-FIELDS-BUILD-WIRED-VERIFIED-YYYY-MM-DD` decision-log entry (lean form per Elevated) (~10–15 min)

Pattern: per `/adopted/standing-protocol-cache.md` §"Lean decision-log entry" + Elevated additions. Six sub-decisions implemented; build-session discretion picks named; risk classification recorded; rollback path + verification step named; deferred items under PR7 (the persistence shape + AccreditationPayload exposure both still deferred to session #5); cross-references to design source + predecessor entries.

### Step 8 — Session close (lean form per Elevated) (~15–20 min)

Pattern: per `/adopted/standing-protocol-cache.md` §"Lean session close". Sections: Decisions Made, Status Changes, Next Session Should (names session #5 — A10 design rewrite), Blocked On (files uncommitted; production state at close), Open Questions, Founder Verification (git add + commit block + push instructions; local + post-deploy verification commands), Cross-references.

---

## Part C — Anticipated session shape

| Phase | Estimate |
|---|---|
| Part A — caches + predecessor close + design document in full + targeted code reads + decision-log + PR11 + PR15 | 35–50 min |
| Step 0 — scope confirmation + build-session discretion picks | 10–15 min |
| Step 1 — extend evaluation.ts with 6 types + interface extensions | 20–30 min |
| Step 2 — port-mirror update if required | 5–10 min |
| Step 3 — new validator module | 20–30 min |
| Step 4 — tests | 30–45 min |
| Step 5 — discovery files | 15–20 min |
| Step 6 — Elevated discipline (founder approval before deploy) | 10–15 min |
| Step 7 — decision-log entry (lean form per Elevated) | 10–15 min |
| Step 8 — session close (lean form per Elevated) | 15–20 min |
| **Total** | **~2.5–3.5 hr** |

(Within the predecessor close's ~2–3 hr estimate; Part A is the heaviest single phase because the design document is the day's primary deliverable and the targeted code reads confirm shapes before extension.)

---

## Rollback path

Pre-push: `git reset --hard HEAD~N` discards local commits; no production effect.

Post-push: `git revert HEAD~N..HEAD --no-edit` + push via GitHub Desktop. Vercel rebuilds (~2 min). Type-system reverts to pre-build shape; the six new fields no longer exist on EvaluatedAction / CarriedProfile; existing substrate consumers byte-untouched throughout.

No schema migration in this build means no SQL rollback required. Persistence shape decisions deferred to session #5 (A10 rewrite).

---

## Forecast

A successful build session produces the type-system extensions + validator module + tests + discovery-files update. The `D-PASS-THROUGH-FIELDS-BUILD-WIRED-VERIFIED-YYYY-MM-DD` entry adopted; lean close written. After this session lands:

- **Session #5 (A10 design rewrite — governance; Standard; ~1–2 hr)** opens against the new pass-through fields. Will Supersede `D-ATL-A10-DESIGN-LOCKED-2026-05-16` with the `owner_user_id` + `agent_id` correction + integration with Option D's `loop_billing_events` + integration with the pass-through fields per the design's Integration §A10 section. The persistence shape (whether the six fields persist per-loop on `agent_accreditation`) is decided in context.
- **Session #6 (A10 build — Critical; ~3–4 hr)** closes the post-6b arc.

Plus the independent **Stripe-Price-ID follow-on session** (Standard-to-Elevated; ~30–60 min) — pending accountant + lawyer engagement per the 2026-05-17 addendum.

Post-arc-close, the substrate carries: authenticated read AND write public surfaces (post-A10); per-loop billing with R5 prospectively enforced (post Option D, live); enterprise-readable pass-through fields on every action evaluation (post this session). The remaining pre-launch gates are commercial (Stage 1 close lawyer engagement, FPE-5 TOS + liability), regulatory, and market.

*End of prompt.*
