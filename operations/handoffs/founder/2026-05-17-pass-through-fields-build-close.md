# Session Close — 2026-05-17 — Pass-Through Fields Build

**Stream:** founder.
**Governing frame:** `/adopted/standing-protocol-cache.md` (general protocol — `code-elevated` row → **Lean** template + Elevated additions) + `/adopted/build-sessions-protocol-cache.md` (build-arc context — "no current users" governing note applies; CCP step 3 simplified to "N/A — only founder + test logins exist").
**Tier:** `code-elevated` — **Elevated** risk under 0d-ii. Lean template + Elevated additions. Critical Change Protocol NOT engaged. AC7 NOT engaged. PR6 NOT engaged.
**Date:** 2026-05-17.

Session #4 of 6 in the post-6b arc tail. Implemented the six pass-through fields design adopted yesterday under `D-PASS-THROUGH-FIELDS-LOCKED-2026-05-17`. Six enum types + five fields on `EvaluatedAction` land in `evaluation.ts`; two fields on `CarriedProfile` land in `atl-wrapper.ts`; a new validator module + 80-test suite land at `trust-layer/validation/`; three discovery files document the seven fields. tsc clean throughout; 80/80 tests pass.

**Part A** — read both caches; the predecessor design-pass close; the design document in full; targeted code reads (`evaluation.ts`, `accreditation.ts`, `accreditation-record.ts`, `atl-wrapper.ts`); the F-tracker; the decision log's last 3 entries via grep; `/inbox/` PR11 scan. **One material finding:** `CarriedProfile` lives in `atl-wrapper.ts` as an `interface`, NOT in `evaluation.ts` or `accreditation.ts` as the design document anticipated. `atl-wrapper.ts` is substrate-website-side code (not a verbatim port — no port-mirror discipline applies). This made the design's "Step 2 port-mirror update" call simpler: only the `EvaluatedAction` changes in `evaluation.ts` notionally trigger the port-mirror, and even that I skipped (see Step 2 note below).

**Step 0** — four scope-confirmation questions via AskUserQuestion; founder elected all four Recommendations. Implementation proceeds as written.

**Step 1** — extended `evaluation.ts`: 5 new fields on `EvaluatedAction` (operation_class, target_system_vendor, target_system_detail, outcome_verification, reversibility_signal) + 6 new exported enum types (OperationClass, DownstreamIdentityModel, PathPosture, TargetSystemVendor, OutcomeVerification, ReversibilitySignal). Extended `atl-wrapper.ts`: 2 new fields on `CarriedProfile` interface (downstream_identity_model, path_posture) + 2 type imports + 6 type re-exports. tsc clean.

**Step 2** — port-mirror SKIPPED. The source-of-truth `/trust-layer/types/evaluation.ts` (April 3 baseline) is already drifted (the 2026-05-16 KathekonQuality, DeliberationBreadth, candidates_considered, carried_candidates_max additions never propagated there either). Following established practice. Flagged as Standard-risk follow-up in the decision-log entry's Open Questions block.

**Step 3** — created `/website/src/lib/substrate/trust-layer/validation/pass-through-fields.ts`. 6 readonly `VALID_*` tuples + `MAX_TARGET_DETAIL_LENGTH` constant + 7 `normalise*` helpers (one per field; soft-fallback to default with `console.warn` on unrecognised values; length-cap truncation on target_system_detail; non-string inputs return undefined). tsc clean.

**Step 4** — created `__tests__/pass-through-fields.test.ts`. 80 PASS lines (above the ~40-50 estimate because enum-loop coverage generates one PASS per enum value). Coverage: enum-membership (39) + defaults (18) + soft-fallback (7) + target_detail-specific (9) + cross-field (5) + PP-NOT-UNKNOWN semantic (1) + invariant (1). All pass.

**Step 5** — extended discovery files: `/product/AGENTS.md` new "Pass-Through Metadata for Wrappers" section between "Sage Skill Wrappers" and "Marketplace"; `/website/public/llms.txt` new same-titled section between "API Access Tiers" and "Core Principle"; `/website/public/.well-known/agent-card.json` new `pass-through-metadata/v1` extension entry in `capabilities.extensions`. agent-card.json validated as valid JSON. Consistent language across all three surfaces.

**Step 6** — Elevated discipline visible: what could break + rollback path + verification commands named in conversation; founder approved "OK to proceed".

**Step 7** — `D-PASS-THROUGH-FIELDS-BUILD-WIRED-VERIFIED-2026-05-17` appended (lean form per Elevated, ~80 lines). Captures: six locked decisions implemented; build-session discretion picks (CarriedProfile location, validator path, test scope, port-mirror skip); risk classification + rollback + verification step; source-of-truth port-mirror reconciliation added as a new PR7-deferred item.

**Step 8** — this close.

## Decisions Made

- **`D-PASS-THROUGH-FIELDS-BUILD-WIRED-VERIFIED-2026-05-17`** appended (lean form per Elevated risk). Status: Adopted. Six pass-through fields implemented per the design; CarriedProfile fields landed in `atl-wrapper.ts` (build-session discretion call per Step 0); port-mirror SKIPPED following established practice (flagged as deferred follow-up); 80-test suite passes; three discovery files updated with consistent language; agent-card.json valid JSON.

## Status Changes

| Item | Old | New |
|---|---|---|
| Pass-through fields (post-6b arc tail session #4) | **Designed** (per `D-PASS-THROUGH-FIELDS-LOCKED-2026-05-17`) | **Verified** (this session) |
| `evaluation.ts` — 6 enum types + 5 `EvaluatedAction` fields | did not exist | **Verified** (tsc clean; back-compat preserved) |
| `atl-wrapper.ts` — 2 `CarriedProfile` fields + 6 type re-exports | did not exist | **Verified** (tsc clean) |
| `trust-layer/validation/pass-through-fields.ts` | did not exist | **Verified** (80/80 tests pass) |
| `trust-layer/validation/__tests__/pass-through-fields.test.ts` | did not exist | **Verified** (80/80 pass; idempotent) |
| `AGENTS.md` pass-through-metadata section | did not exist | **Live** (document is the live surface) |
| `llms.txt` pass-through-metadata section | did not exist | **Live** |
| `agent-card.json` `pass-through-metadata/v1` extension | did not exist | **Live** (valid JSON) |
| Source-of-truth `/trust-layer/types/evaluation.ts` port-mirror | drifted (since 2026-05-16) | **Drifted further** (this session; deferred reconciliation logged under PR7) |
| Production state | unchanged from session open | **Unchanged at session close** — no schema migration; no env-flag change; no auth surface change; no runtime behaviour change for existing substrate consumers |

## Next Session Should

**Session #5 of the post-6b arc tail — A10 design rewrite.** `governance` tier; **Standard** risk under 0d-ii. Lean template. Estimated **~1–2 hr**.

The rewrite Supersedes `D-ATL-A10-DESIGN-LOCKED-2026-05-16` with three integrations:

1. The `owner_user_id` + `agent_id` correction from the 2026-05-16 brainstorm Finding 1.
2. Integration with Option D's `loop_billing_events` where the credential surface touches billing (per `D-BILLING-MODEL-BUILD-WIRED-VERIFIED-2026-05-17`).
3. Integration with the seven pass-through fields per the design's Integration §A10 section — the rewrite decides whether the fields persist per-loop on `agent_accreditation` (schema migration would land at session #6 A10 build), AND whether the `AccreditationPayload` exposes typical-class fields (matching the existing `typical_deliberation_breadth` + `typical_kathekon_quality` pattern).

After session #5 lands, **session #6 (A10 build — Critical; ~3–4 hr)** closes the post-6b arc.

Plus the independent **Stripe-Price-ID follow-on session** (Standard-to-Elevated; ~30–60 min) — pending accountant + lawyer engagement per the 2026-05-17 Addendum.

The next-session prompt for #5 is **not yet written** — to be drafted between sessions (or at session open) based on the predecessor `D-ATL-A10-DESIGN-LOCKED-2026-05-16` + this session's pass-through fields surface + the design's Integration §A10 section. Estimated prompt write: ~15–20 min.

## Blocked On

**Files remaining uncommitted (to be committed by the founder per the Founder Verification block below):**

```
 M operations/decision-log.md                                                                       (D-PASS-THROUGH-FIELDS-BUILD-WIRED-VERIFIED-2026-05-17 appended)
 M product/AGENTS.md                                                                                (pass-through-metadata section added)
 M website/public/.well-known/agent-card.json                                                       (pass-through-metadata/v1 extension added)
 M website/public/llms.txt                                                                          (pass-through-metadata section added)
 M website/src/lib/substrate/atl-wrapper.ts                                                         (2 CarriedProfile fields + 6 re-exports + 2 imports)
 M website/src/lib/substrate/trust-layer/types/evaluation.ts                                        (6 enum types + 5 EvaluatedAction fields)
?? website/src/lib/substrate/trust-layer/validation/                                                (NEW directory containing the validator module + test file)
?? operations/handoffs/founder/2026-05-17-pass-through-fields-build-close.md                        (NEW — this close)
```

**Production state at session close:** **unchanged from session open**. Substrate at A7 Verified. Option D per-loop metering Live (Verified end-to-end per 2026-05-17 Addendum). Stripe test-mode wiring Verified; Stripe live activation Deferred. `SUBSTRATE_WRITE_PATH_ENABLED` UNSET (write surface inert pre-A10). `SUBSTRATE_LAYER3_ENABLED` UNSET. `SUBSTRATE_R20A_GATE_ENABLED` UNSET. `/api/reason` byte-identical (emits the six X-Loop-* headers on every billable response branch per Option D). `/api/substrate/layer3` returns 503. `/api/accreditation/[agent_id]` Live (GET 404 / POST 503). Both ATL tables empty. **New this session:** the type-system carries seven additional optional fields; no consumer populates them yet; no runtime branch has changed.

## Open Questions

- **Source-of-truth port-mirror reconciliation** (NEW this session). `/trust-layer/types/evaluation.ts` is now further drifted (April 3 baseline lacks both the 2026-05-16 additions and this session's 6 enum types + 5 EvaluatedAction fields). Standard-risk governance session could reconcile. Revisit condition: a future session intends to pull from the source-of-truth (no consumer does today).
- **All other open questions** from `D-PASS-THROUGH-FIELDS-LOCKED-2026-05-17` carry forward at the same revisit conditions (AccreditationPayload typical-class exposure → session #5; persistence shape → session #5; Option C tiered billing → 2–4 weeks of populated data + customer interest; R20a risk_class derivation from pass-through fields → future Elevated session if manual setting is mis-calibrated; and the ~14 smaller deferred items).

## Founder Verification

**Two things to do, in order. Take them one at a time — do not paste the multi-line blocks as one command per the CLAUDE.md note about prompt-consumption.**

### 1. Verify locally

Run each command on its own line. Expected output noted after each.

```
cd "/Users/clintonaitkenhead/Claude-work/PROJECTS/sagereasoning/website"
```

```
npx tsc --noEmit
```

Expected: exits 0 with no output. (No "Error" or "error" lines.)

```
npx tsx src/lib/substrate/trust-layer/validation/__tests__/pass-through-fields.test.ts
```

Expected: ends with `--- Results: 80 pass, 0 fail ---` and exits 0.

### 2. Commit and push

Use targeted adds (explicit paths, not `git add -A`). Run each command on its own line.

```
cd "/Users/clintonaitkenhead/Claude-work/PROJECTS/sagereasoning"
```

```
rm -f .git/index.lock
```

```
git add operations/decision-log.md
```

```
git add product/AGENTS.md
```

```
git add website/public/.well-known/agent-card.json
```

```
git add website/public/llms.txt
```

```
git add website/src/lib/substrate/atl-wrapper.ts
```

```
git add website/src/lib/substrate/trust-layer/types/evaluation.ts
```

```
git add website/src/lib/substrate/trust-layer/validation/
```

```
git add operations/handoffs/founder/2026-05-17-pass-through-fields-build-close.md
```

Then the commit (one command, multi-line message — paste the whole block including the closing `"`):

```
git commit -m "Pass-through fields build — 6 enum types + 7 fields + validators + tests + discovery

Session #4 of 6 in the post-6b arc tail. Implements the six locked
decisions A-F from D-PASS-THROUGH-FIELDS-LOCKED-2026-05-17.

Substrate type system:
  - 6 new enum types in trust-layer/types/evaluation.ts:
    OperationClass, DownstreamIdentityModel, PathPosture,
    TargetSystemVendor, OutcomeVerification, ReversibilitySignal
  - 5 new optional fields on EvaluatedAction (operation_class,
    target_system_vendor, target_system_detail, outcome_verification,
    reversibility_signal)
  - 2 new optional fields on CarriedProfile in atl-wrapper.ts
    (downstream_identity_model, path_posture) — landed there because
    CarriedProfile lives in atl-wrapper.ts as an interface; per Step 0
    discretion election, fields land in place rather than refactoring

Validator module + tests:
  - NEW trust-layer/validation/pass-through-fields.ts — 6 VALID_*
    tuples + 7 normalise* helpers (soft-fallback to default with
    warning log; length-cap truncation on target_system_detail)
  - NEW __tests__/pass-through-fields.test.ts — 80 plain-assertion
    tests covering enum membership, defaults, soft-fallback,
    length cap, cross-field, and determinism. All pass.

Discovery files (consistent language across all three):
  - AGENTS.md — new 'Pass-Through Metadata for Wrappers' section
  - llms.txt — new same-titled section
  - agent-card.json — new pass-through-metadata/v1 extension

Substrate validates and persists; it does NOT interpret these fields
for Layer 1/2/3 reasoning. Backward-compatible per-field optional
posture preserves existing substrate consumers (ATL Wrapper,
kathekon-aligned scorer, hand-back report) — every field defaults
to a sensible value. Downstream consumers (Option C tiered billing
once activated; enterprise procurement reviewers reading the
Accreditation Payload; A10 credential surface at session #5; future
MCP integrations per R18c) read these fields for audit, compliance,
and tiered-billing decisions.

Source-of-truth /trust-layer/types/evaluation.ts port-mirror SKIPPED
(file already drifted since 2026-05-16; following established
practice). Reconciliation logged as Standard-risk deferred item
under PR7.

Verification: tsc --noEmit clean; 80/80 tests pass; agent-card.json
valid JSON. Smoke-test curl on /api/reason post-deploy confirms the
six X-Loop-* headers remain (additive type-system change does not
regress Option D metering).

Elevated risk under 0d-ii. AC7 not engaged. PR6 not engaged.

Next: session #5 — A10 design rewrite (governance; Standard; ~1-2 hr).

Per D-PASS-THROUGH-FIELDS-BUILD-WIRED-VERIFIED-2026-05-17."
```

Then push via **GitHub Desktop**.

**Expected Vercel behaviour:** rebuild (~2 min) because TypeScript source files in `website/src/lib/substrate/` changed. No runtime behaviour change expected — the seven new fields are optional with sensible defaults; existing substrate consumers byte-untouched at runtime.

**Post-deploy smoke-test** (after Vercel finishes the rebuild — watch the deploy in the Vercel dashboard; takes ~2 min):

```
curl -i -X POST https://www.sagereasoning.com/api/reason -H "Authorization: Bearer sr_live_<your-key>" -H "Content-Type: application/json" -d '{"input":"test","depth":"quick"}'
```

Expected: HTTP/2 200 + six `X-Loop-*` response headers (`X-Loop-Id`, `X-Loop-Cost-Cents`, `X-Anthropic-Cost-Cents`, `X-Overage-Fired`, `X-Overage-Cents`, `X-Loop-Internal-Calls`). The additive type-system change must not regress Option D metering.

If the smoke-test fails (HTTP non-200, or any X-Loop-* header missing), follow the rollback path: `git revert HEAD~1..HEAD --no-edit` then push via GitHub Desktop; Vercel rebuilds within ~2 min back to the pre-build shape.

## Cross-references

- Operative session prompt: the inline next-session prompt provided at session open (Session #4 of the post-6b arc tail: Pass-Through Fields Build)
- Predecessor session close: `/operations/handoffs/founder/2026-05-17-pass-through-fields-design-pass-close.md` (the design adopted at `D-PASS-THROUGH-FIELDS-LOCKED-2026-05-17`)
- Design document (the spec implemented this session): `/adopted/pass-through-fields-design.md`
- Decision-log entry (this session): `D-PASS-THROUGH-FIELDS-BUILD-WIRED-VERIFIED-2026-05-17`
- Decision-log entries (predecessors):
  - `D-PASS-THROUGH-FIELDS-LOCKED-2026-05-17` (the spec)
  - `D-BILLING-MODEL-BUILD-WIRED-VERIFIED-2026-05-17` (Option D Live; metering layer the future Option C will integrate with via `operation_class`)
  - `D-ATL-A10-DESIGN-LOCKED-2026-05-16` (A10 design Adopted; will be Superseded at session #5 to integrate the seven pass-through fields)
- Inbox primary source: `/inbox/20260508-262-promptkit-1.md` (Nate B Jones SaaS Renewal Agent License Prompt Kit — Agent System Touch Map's enum vocabularies are the verbatim source for Decisions A + B + C + D)
- Inbox secondary source: `/inbox/Related to agent API billing.rtf` (companion essay — fair-license criteria framing applied across all six decisions)
- Files touched (8 total):
  - `/website/src/lib/substrate/trust-layer/types/evaluation.ts`
  - `/website/src/lib/substrate/atl-wrapper.ts`
  - `/website/src/lib/substrate/trust-layer/validation/pass-through-fields.ts` (NEW)
  - `/website/src/lib/substrate/trust-layer/validation/__tests__/pass-through-fields.test.ts` (NEW)
  - `/product/AGENTS.md`
  - `/website/public/llms.txt`
  - `/website/public/.well-known/agent-card.json`
  - `/operations/decision-log.md`
  - (plus this close)
- F-tracker: `/operations/agentic-commerce-findings-downstream-order.md` (pass-through fields are upstream provenance candidates for A12 OpenTelemetry integration parallel to `loop_billing_events`; F1/F2/F4 future-stage, F3 past A6/A7; none target this session)
- Governance: `/adopted/standing-protocol-cache.md` (`code-elevated` row → Lean + Elevated additions) + `/adopted/build-sessions-protocol-cache.md` ("no current users" governing note — CCP step 3 N/A simplification applied)
- Manifest: `/manifest.md` §R0 (audit trail accuracy preserved); §R9 (Decision E primary — verification posture describes claim not outcome); §R10 (marketplace consistency across substrate + validator + 3 discovery files); §R17 (intimate-data adjacency via Decisions B + D); §R18a (Character Kernel framing preserved — pass-through fields are operational metadata); §R18c (additive interoperability); §R20 (adjacent — Decision F could inform R20a risk_class in a future session); AC7 (NOT engaged — additive type-system change); AC8 (translation-sandwich substrate; Layer 4 pass-through); AC10 (provenance — upstream for A12 OpenTelemetry); KG1 (engaged — synchronous validator normalisation; soft-fallback warning log synchronous); KG7 (NOT engaged — no JSONB writes)

*End of session close. The substrate now carries enterprise-readable accountability metadata on every action evaluation. Three sessions remain in the post-6b arc tail: A10 design rewrite at #5; A10 build at #6; plus the independent Stripe-Price-ID follow-on (pending accountant + lawyer engagement). Production state unchanged at session close — no schema migration; no auth change; no env-flag activation. Type system extended; runtime byte-untouched until wrappers begin populating the fields.*
