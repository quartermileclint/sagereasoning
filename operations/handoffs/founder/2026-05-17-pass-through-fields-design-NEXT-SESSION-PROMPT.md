# Next-Session Prompt — Session #3 of the post-6b arc tail: Pass-Through Fields Design Pass

**Stream:** founder.
**Tier:** `governance` — **Standard** risk under 0d-ii. **Lean** template per the standing protocol cache (governance row). Critical Change Protocol NOT engaged this session (engages at session #4 — pass-through fields build).
**Governing frame:** `/adopted/standing-protocol-cache.md` (general protocol — `governance` row → **Lean** template) + `/adopted/build-sessions-protocol-cache.md` (build-arc context — "no current users" governing note still applies for downstream sessions).
**Predecessor session close:** `/operations/handoffs/founder/2026-05-17-billing-model-build-close.md` (Option D build).
**Predecessor decision-log entries:** `D-BILLING-MODEL-BUILD-WIRED-VERIFIED-2026-05-17` (session #2 build — Option D metering layer Verified end-to-end including post-deploy curl + ledger row + Stripe test-mode wiring); `D-BILLING-MODEL-LOCKED-2026-05-17` (session #1 design — Option D spec); `D-ATL-A10-DESIGN-LOCKED-2026-05-16` (A10 design Adopted; will be Superseded at session #5 of this arc tail per the brainstorm sequencing — NOT affected by this session).
**Sequencing source:** session #3 of 6 in the post-6b arc tail per `/operations/handoffs/founder/2026-05-16-A10-design-pass-close.md` Part 2 + session #2's close.
**Risk classification:** **Standard** under 0d-ii. Governance — design decisions only; no code, no schema, no env, no production exposure. AC7 not engaged. PR6 not engaged.

---

## Why this session matters

Six pass-through fields on `EvaluatedAction` / `CarriedProfile` surface enterprise-grade accountability data the substrate doesn't currently expose: `operation_class` (read/draft/execute per the Nate B Jones taxonomy), `downstream_identity_model` (who the agent acts on behalf of), `path_posture` (how the agent reaches the target system), `target_system` (what the action affects), `outcome_verification` (how the agent will know if the action succeeded), `reversibility_signal` (can the action be undone). These aren't substrate-reasoning fields — Layer 1, 2, 3 don't need them to evaluate impressions. They're pass-through observability data that wrappers populate and downstream consumers read for audit, compliance, and tiered-billing decisions.

After this design pass locks (session #3), the build session (session #4, Elevated) lands them as additive schema fields + interface extensions. Once present, three downstream surfaces immediately benefit: (i) A10's credential model (session #5 rewrite supersedes `D-ATL-A10-DESIGN-LOCKED-2026-05-16` to integrate them); (ii) tiered-per-action billing (Option C from the Option D brainstorm — deferred until `operation_class` exists and is populated); (iii) enterprise-readable accreditation badges (the `AccreditationPayload` GET endpoint can expose these for third-party verifier inspection).

**Plan ~2.5–3 hr** matching the Option D design pass shape. Founder mid-session input concentrated at Step 1 (the six prompt-named questions surfaced) and Step 2 (founder elections via AskUserQuestion across two or three rounds).

---

## Pre-conditions

1. **Vercel green for the Option D build commit** (founder confirmed at session #2 close 2026-05-17). Substrate carries per-loop metering live; `loop_billing_events` ledger populating on every billable response branch.
2. **Founder has read the brainstorm scoping** in `/operations/handoffs/founder/2026-05-16-A10-design-pass-close.md` Part 2 where the six fields were named, and `/inbox/20260508-262-promptkit-1.md` (Nate B Jones prompt kit — Agent System Touch Map + Renewal Interrogation) which informed the field selection. The prompt kit is the primary source material for what these fields mean operationally; the design pass references it throughout.
3. **Founder commits to a ~2.5–3 hr bounded session** with mid-session input concentrated at Steps 1 + 2.
4. **Production state unchanged from session #2 close** (substrate at A7 Verified; per-loop metering live; Stripe test-mode wiring in place via STRIPE_SECRET_KEY + STRIPE_PUBLISHABLE_KEY + STRIPE_WEBHOOK_SECRET + STRIPE_PER_LOOP_PRICE_ID all set to test-mode values; live activation deferred pending accountant + lawyer engagement per the build close's open questions).

---

## Part A — Open under the protocol

Read in order:

1. **`/adopted/standing-protocol-cache.md`** (~3 min) — confirms tier (`governance`), risk class (Standard), Lean template, signals, status vocabulary. Model selection N/A this session (no LLM calls — governance design only).
2. **`/adopted/build-sessions-protocol-cache.md`** (~3 min) — confirm "no current users" simplification still applies for downstream sessions (matters at session #4 build's CCP step 3 — moot for this design-only session).
3. **`/operations/handoffs/founder/2026-05-17-billing-model-build-close.md`** (~5 min) — predecessor close. Particularly the "Next Session Should" block scoping pass-through fields, and the "Open Questions" block naming the Stripe-Price-ID follow-on session as independent of this work.
4. **`/operations/handoffs/founder/2026-05-16-A10-design-pass-close.md` Part 2** (~5 min) — the brainstorm scoping where the six pass-through fields were named.
5. **`/inbox/20260508-262-promptkit-1.md`** in full (~10–15 min) — **the day's primary source material; informs what each field means and why**. Particularly the Agent System Touch Map (taxonomy of operation classes; downstream identity models; target system categories) and the Renewal Interrogation (what enterprise procurement reviews ask for; what fields satisfy those asks).
6. **`/adopted/billing-model-design.md`** (~5 min — targeted re-read of Decision A "Loop definition" + Decision E "Cost tracking surface" + the deferred-under-PR7 items naming tiered-per-action billing). Pass-through fields integrate with Option D's loop_billing_events where appropriate; this re-read confirms what's already in place.
7. **`/adopted/atl-a10-design.md`** (~5 min — targeted re-read of Decisions B "Issuance authority + agent_id binding" + C "Credential storage" + H "Audit trail + observability"). The A10 rewrite at session #5 will integrate pass-through fields; this re-read surfaces where they land in A10's surface.
8. **Targeted code + schema files** (~5–10 min):
   - `/website/src/lib/substrate/trust-layer/types/accreditation.ts` — current `AccreditationRecord` + `EvaluatedAction` + `CarriedProfile` shapes (the surfaces the new fields extend)
   - `/website/src/lib/substrate/trust-layer/accreditation/accreditation-record.ts` — the constructor + validator the build session will extend
9. **`/operations/decision-log.md` last 3 entries** (~5 min) — `D-BILLING-MODEL-BUILD-WIRED-VERIFIED-2026-05-17`, `D-BILLING-MODEL-LOCKED-2026-05-17`, `D-ATL-A10-DESIGN-LOCKED-2026-05-16`. The first names the post-deploy verifications + Stripe test-mode setup state at session #2 close.
10. **PR11 inbox scan** — list `/inbox/` for files dated since 2026-05-17. The prompt kit (`20260508-262-promptkit-1.md`) is already a known source. Note any new files.
11. **PR15 consult** — `.claude/skills/anthropic/` review (or, in Cowork mode, the project-instructions panel reference). Candidate primitives for this design: `skill-creator` (informational — the design pass produces a governance document, not a skill); `mcp-builder` (forward pointer for R18c interoperability post-launch — pass-through fields could later be exposed via MCP tool descriptions). Bespoke election expected — substrate-internal type-system design has no Anthropic primitive substitute.

**Confirm at open:** tier (`governance`); hold-point status (P0 0h active); model selection N/A (no LLM calls — governance design only); status vocabulary (`Scoped → Designed → Scaffolded → Wired → Verified → Live` for implementation; `Adopted / Under review / Superseded` for decisions); signals + risk classification; **Critical Change Protocol NOT engaged this session** (engages at session #4 build).

---

## Part B — Procedure

### Step 0 — Brief addendum to D-BILLING-MODEL-BUILD-WIRED-VERIFIED-2026-05-17 (~15–20 min)

The session #2 close was written before the founder completed:
- Post-deploy verification (curl returned HTTP/2 200 with all six X-Loop-* headers; `loop_billing_events` row landed with `loop_id = af9b21ac-5d47-4e7b-a7e0-ac670a551f8a` matching the curl response; total_cents = 4; overage_fired = true; internal_calls = 2 — BILL-3 case from Decision D's worked examples verified live)
- Stripe test-mode setup (Stripe account created in Australia; STRIPE_SECRET_KEY + STRIPE_PUBLISHABLE_KEY + STRIPE_WEBHOOK_SECRET + STRIPE_PER_LOOP_PRICE_ID all set in Vercel with test-mode values; test-mode Product + Price + webhook endpoint live in Stripe Dashboard with 6 events subscribed including `invoice.created`; smoke-test curl post-redeploy returned identical X-Loop-* headers confirming no regression)
- Live activation explicitly deferred pending accountant + lawyer engagement (per the build close's "open questions" — Stripe-Price-ID follow-on session)

Open `D-BILLING-MODEL-BUILD-WIRED-VERIFIED-2026-05-17` in `/operations/decision-log.md` and append a brief addendum block at the bottom of the entry (above the closing `---` separator) capturing:

```
**Addendum 2026-05-17 (post-close):** Post-deploy verification + Stripe test-mode wiring completed in a continuation conversation after the session close was written. Verified Live:
  - /api/reason curl with sr_live_* paid-tier key returned HTTP/2 200 with all six X-Loop-* response headers; loop_billing_events ledger row landed matching response shape (loop_id = af9b21ac-5d47-4e7b-a7e0-ac670a551f8a, total_cents=4, overage_fired=true, internal_calls=2 — BILL-3 case from Decision D verified live in production).
  - Stripe test-mode setup: Stripe account created (Australia, individual/sole-trader for test mode without live commitment); STRIPE_SECRET_KEY + STRIPE_PUBLISHABLE_KEY + STRIPE_WEBHOOK_SECRET + STRIPE_PER_LOOP_PRICE_ID set in Vercel (all three environments) with test-mode values; test-mode Product (SageReasoning per-loop billing, AUD 0.00 monthly recurring) + Price created; test-mode webhook endpoint live at https://www.sagereasoning.com/api/webhooks/stripe subscribed to six events (checkout.session.completed, invoice.created, invoice.paid, invoice.payment_failed, customer.subscription.updated, customer.subscription.deleted); post-redeploy smoke-test curl confirmed no regression.
  - Live Stripe activation explicitly deferred — founder will engage Australian accountant for business-structure decision (sole trader vs sole trader with ABN vs Pty Ltd company) before live activation; lawyer engagement (Stage 1 close per ST2 Q4 election) covers liability + TOS scope.
  - Part E (end-to-end Stripe webhook test with test customer + subscription + manual invoice) deferred — covered in the Stripe-Price-ID follow-on session noted in the build close's open-questions block.
  - Substrate component statuses after addendum: Option D metering — Verified end-to-end (response headers + ledger persistence + post-deploy curl). Stripe test-mode wiring — Verified (env vars + webhook endpoint + redeploy smoke-test). Stripe live-mode activation — Deferred. Stripe-Price-ID follow-on session — Scoped.
```

**Founder action:** confirm via AskUserQuestion that the addendum text matches your recollection of the post-deploy + Stripe work. The text above is the AI's best capture from the continuation conversation; founder reads + approves or edits.

After approval, the build entry's implementation status is more accurately reflected. No new decision-log entry needed (the addendum extends the existing entry rather than creating a new one — keeps the decision trail compact).

### Step 1 — Surface the six prompt-named questions (~10–15 min)

Six fields = six design decisions. Surface via the prompt-naming pattern — the AI restates each question with the field's name, candidate types/values, and the Layer 1/2/3 + downstream-consumer implications.

The six questions:

- **Q1 — `operation_class`** — What taxonomy + enum values? Nate B Jones essay names `read` / `draft` / `execute` as the core trichotomy; the prompt kit's Agent System Touch Map may add finer-grained categories (e.g., `query`, `compose`, `send`, `transact`). What's the enum? Free-form alternative? Default?
- **Q2 — `downstream_identity_model`** — On whose behalf does the agent act? Candidate values: `self` (the agent's own decision), `user` (acting for an identified end-user), `org` (acting for an organisation), `system` (acting for an automated system/pipeline). Determines accountability path. What's the enum? Default? Who populates (wrapper-supplied or substrate-derived)?
- **Q3 — `path_posture`** — How does the agent reach the target system? Candidate values: `direct` (agent calls target API itself), `via_wrapper` (agent's call routed through a wrapper that adds checkpoints), `via_orchestrator` (agent embedded in a multi-agent orchestration that mediates). Determines where to send accountability signals.
- **Q4 — `target_system`** — What system does the action affect? Free-form identifier (URL / domain / service name) vs enum (`api`, `database`, `human_facing_ui`, `file_system`, `messaging_platform`)? Validation rules? Mix (enum-with-detail-field)?
- **Q5 — `outcome_verification`** — How will the agent know if the action succeeded? Candidate values: `self_reported` (agent claims success), `system_confirmed` (target system returns confirmation), `external_auditor` (third party verifies), `not_applicable` (action has no verifiable outcome). Determines downstream-billing posture (Option C tiered-per-action could weight differently by outcome verifiability).
- **Q6 — `reversibility_signal`** — Can the action be undone? Candidate values: `reversible` (undo path exists + practical), `partially_reversible` (some effects undoable; others not), `irreversible` (cannot be undone), `unknown` (agent doesn't know). Drives risk presentation to downstream consumers (an `irreversible` action that's `outside_prohairesis` gets higher scrutiny).

Founder may add or remove questions; the six above match the brainstorm scoping. **Founder action via AskUserQuestion:** accept the six as scoped OR amend (add/remove questions).

### Step 2 — Founder elections via AskUserQuestion (~45–60 min)

Surface across **two rounds** (matches the Option D design pass shape; avoids overwhelming with six questions at once). Each round groups thematically:

- **Round 1 of 2 — Core taxonomy (Q1 + Q2 + Q3):** the three fields that define what kind of action this is and who's accountable. These are interconnected — `path_posture: via_wrapper` implies a wrapper is in the loop, which constrains `downstream_identity_model` options; `operation_class: execute` raises the stakes regardless of identity model. Surface together so the founder sees how the three compose.

- **Round 2 of 2 — Operational fields (Q4 + Q5 + Q6):** the three fields that define what the action does + how it's verified + how reversible it is. These integrate with Option D's `loop_billing_events.surface` enum (where `target_system` might overlap) and the existing R20a risk-classification path (where `reversibility_signal: irreversible` could elevate scrutiny).

For each question the AI presents 3–4 candidate options (matching AskUserQuestion's 2–4 option constraint per question) with reasoning. Founder elects per question or amends.

If any question needs follow-up clarification (e.g., the founder asks for impact analysis on Q1's choice before electing Q2), the AI provides it inline and re-asks the question. This matches the Option D design pass's mid-round elaboration pattern (where Q2's cost-per-loop estimate was produced before the base-rate election).

### Step 3 — Write `/adopted/pass-through-fields-design.md` (~30–45 min)

Modelled on `/adopted/billing-model-design.md` (eight-decision shape extended/contracted to six here per session scope). Per-decision sections:

- **Why** (the problem the field addresses)
- **Elected position** (the chosen enum/type/default)
- **Why this and not alternatives** (rejected candidates + reasoning)
- **Structural constraint** (how the field lands in the type system: which interface, validation rule, default value, who populates)
- **R-rule engagement** (R10 marketplace consistency, R17 intimate data implications, R18a Character Kernel framing, AC7/AC8/AC10 engagement at build session)
- **Layer 1 implication** (does this field flow into the Layer 1 schema? Most answers: No — these are pass-through, not reasoning inputs)
- **Deferred under PR7** (per-decision deferred items with revisit conditions)

Plus a closing section: **"Integration with adjacent surfaces"** naming where the six fields land in:
- **Option D billing** (loop_billing_events.operation_class? loop_billing_events.target_system? if any of these should propagate from the request body or X-* headers into the ledger)
- **A10 credential surface** (which fields belong on the AccreditationPayload that third-party verifiers read)
- **Tiered-per-action billing (Option C from the Option D brainstorm)** (`operation_class` is the gating field; once populated, Option C becomes implementable as a follow-on Elevated session)
- **R20a risk classification** (`reversibility_signal: irreversible` + `operation_class: execute` is the highest-risk-class combination; whether the existing risk_class field on the guardrail endpoint should be derived from these or set independently)

Plus a **build-session implementation summary table** naming the expected file changes for session #4:
- `/website/src/lib/substrate/trust-layer/types/accreditation.ts` (MODIFIED — add 6 fields to `EvaluatedAction` + `CarriedProfile`)
- `/website/src/lib/substrate/trust-layer/accreditation/accreditation-record.ts` (MODIFIED — validator + constructor accept the new fields with documented defaults)
- `/api/migrations/` (NEW — if any field requires schema columns; likely yes for `agent_accreditation` to persist per-loop history of these fields)
- `/website/src/lib/translation-sandwich/layer1-extractor.ts` (potentially MODIFIED — if any of these fields require Layer 1 awareness; likely not, but the design's "Layer 1 implication" sections will name this)
- Test files exercising the new fields' validation
- Discovery files (`/AGENTS.md` + `/website/public/llms.txt` + `/website/public/.well-known/agent-card.json`) documenting the new fields

### Step 4 — Founder verification (~5–10 min)

Via AskUserQuestion: founder confirms the six locked decisions match the elections from Step 2. If any decision needs adjustment, surface as Elevated edit (per 0d-ii — edits to a draft-being-adopted are Elevated; this design pass would re-run Step 2 for the contested decision).

If founder approves all six → proceed to decision-log + close.

### Step 5 — Append `D-PASS-THROUGH-FIELDS-LOCKED-YYYY-MM-DD` decision-log entry (lean form) (~10–15 min)

Pattern: per `/adopted/standing-protocol-cache.md` §"Lean decision-log entry". Six sub-decisions summarised; deferred items named under PR7 (~15–20 expected); PR11 inbox scan + PR15 election recorded; cross-references to design source + predecessor entries.

### Step 6 — Session close (lean form) (~15–20 min)

Pattern: per `/adopted/standing-protocol-cache.md` §"Lean session close". Sections: Decisions Made, Status Changes, Next Session Should (names session #4 — pass-through fields build), Blocked On (files uncommitted; production state at close), Open Questions, Founder Verification (git add + commit block + push instructions; no Supabase action this session; no env change), Cross-references.

---

## Part C — Anticipated session shape

| Phase | Estimate |
|---|---|
| Part A — caches + predecessor close + brainstorm scoping + prompt-kit in full + targeted code/schema + decision-log + PR11 + PR15 | 40–60 min |
| Step 0 — addendum to Option D build entry | 15–20 min |
| Step 1 — surface the six prompt-named questions | 10–15 min |
| Step 2 — founder elections (2 rounds) | 45–60 min |
| Step 3 — write `/adopted/pass-through-fields-design.md` | 30–45 min |
| Step 4 — founder verification | 5–10 min |
| Step 5 — decision-log entry (lean form) | 10–15 min |
| Step 6 — session close (lean form) | 15–20 min |
| **Total** | **~3–4 hr** |

(Slightly over the 2.5–3 hr estimate in the predecessor close because Part A is heavier — the prompt-kit in full + the targeted re-reads of Option D + A10 designs add ~20 min vs the design pass minimum. If the founder skips the prompt-kit full read in favour of a targeted scan, the session can compress back to ~3 hr.)

---

## Rollback path

Governance-only. If any of the six decisions is reconsidered before the session #4 build lands, append a superseding decision-log entry (`D-PASS-THROUGH-FIELDS-REVISED-YYYY-MM-DD`) marking `D-PASS-THROUGH-FIELDS-LOCKED-…` as `Superseded by D-…`. Edit `/adopted/pass-through-fields-design.md` in a follow-on Elevated session (edits to an adopted governance document are Elevated under 0d-ii). No production-state recovery required — nothing is built this session.

If the Step 0 addendum text is wrong or incomplete, edit the decision-log entry directly (Standard-risk amendment per the cache's update discipline) — no formal supersession needed for documentation accuracy improvements.

---

## Forecast

A successful design pass produces `/adopted/pass-through-fields-design.md` with six locked decisions A–F; the `D-PASS-THROUGH-FIELDS-LOCKED-YYYY-MM-DD` entry adopted; the lean close written. The build session (session #4 — Elevated; ~2–3 hr) lands the schema + type + validator changes; the discovery files update. After session #4, sessions #5 (A10 design rewrite — Standard; ~1–2 hr) and #6 (A10 build — Critical; ~3–4 hr) close the post-6b arc.

Plus the independent **Stripe-Price-ID follow-on session** (Standard-to-Elevated; ~30–60 min) — can be scheduled at any point post-deploy; deferred this conversation pending accountant + lawyer engagement.

Post-arc-close, the substrate carries: authenticated read AND write public surfaces (post-A10); per-loop billing with R5 prospectively enforced (post Option D, already live); enterprise-readable pass-through fields (post-pass-through, this design pass + build). The remaining pre-launch gates are commercial (Stage 1 close lawyer engagement, FPE-5 TOS + liability), regulatory, and market.

*End of prompt.*
