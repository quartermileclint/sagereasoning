# Next-Session Prompt — Session #5 of the post-6b arc tail: A10 Design Rewrite

**Stream:** founder.
**Tier:** `governance` — **Standard** risk under 0d-ii. **Lean** template per the standing protocol cache. Critical Change Protocol NOT engaged this session (governance design-pass only; no code lands; AC7 NOT engaged in the conventional sense). PR6 NOT engaged.
**Governing frame:** `/adopted/standing-protocol-cache.md` (general protocol — `governance` row → **Lean** template) + `/adopted/build-sessions-protocol-cache.md` (build-arc context — "no current users" governing note applies; moot this session since no code lands).
**Predecessor session close:** `/operations/handoffs/founder/2026-05-17-pass-through-fields-build-close.md` (pass-through fields build Verified end-to-end; smoke-test confirmed Option D metering preserved; Layer 3 prose anomaly logged as separate Standard-risk follow-up).
**Predecessor decision-log entries:** `D-PASS-THROUGH-FIELDS-BUILD-WIRED-VERIFIED-2026-05-17` (session #4 — seven pass-through fields now live in the substrate type system; this rewrite integrates them); `D-PASS-THROUGH-FIELDS-LOCKED-2026-05-17` (the design that session #4 implemented; §"Integration with adjacent surfaces / A10 credential surface" is load-bearing for this rewrite); `D-BILLING-MODEL-BUILD-WIRED-VERIFIED-2026-05-17` (Option D Live + Verified end-to-end; `loop_billing_events` is the ledger A10 may need to touch at credential issuance / revocation); `D-ATL-A10-DESIGN-LOCKED-2026-05-16` (the A10 design that this session **Supersedes** — current shape Adopted but with the three known issues this rewrite resolves).
**Sequencing source:** session #5 of 6 in the post-6b arc tail per the 2026-05-17 pass-through-fields-build close's "Next Session Should" block.
**Risk classification:** **Standard** under 0d-ii. Documentation-only design pass; no code, schema, env, or production exposure. AC7 NOT engaged. PR6 NOT engaged. Lean template per standing cache §"Lean decision-log entry" + §"Lean session close".

---

## Why this session matters

The A10 design at `/adopted/atl-a10-design.md` was Adopted 2026-05-16 under `D-ATL-A10-DESIGN-LOCKED-2026-05-16`, but three things have changed since: (1) the 2026-05-16 brainstorm surfaced **Finding 1 — the owner_user_id + agent_id correction** that the original A10 design got wrong; (2) **Option D billing landed live in production** on 2026-05-17 with the `loop_billing_events` ledger, so A10's credential issuance / revocation surface now has a billing-side integration question that didn't exist when the original design was written; (3) **seven pass-through fields landed in the substrate type system** on 2026-05-17 (this session's predecessor), and per `/adopted/pass-through-fields-design.md` §"Integration with adjacent surfaces / A10 credential surface", the A10 rewrite is where the per-credential scoping + AccreditationPayload typical-class exposure decisions get made.

This session is the design pass that resolves all three. No code lands. The output is a rewritten `/adopted/atl-a10-design.md` (or an addendum, depending on how invasive the changes are — Step 0 decides the form). After this design is Adopted, **session #6 (A10 build — Critical; ~3–4 hr)** implements it and closes the post-6b arc tail.

Plan **~1.5–2.5 hr** matching the predecessor close's ~1–2 hr estimate plus a generous Part A read budget (the A10 design is substantial; the pass-through fields Integration §A10 section is dense; the brainstorm transcript's two findings need careful re-reading).

---

## Pre-conditions

1. **Session #4's commit pushed to git** and Vercel rebuild complete (founder confirms via the predecessor close's Founder Verification block — both local verify steps pass + post-deploy curl smoke-test returns HTTP/2 200 + six X-Loop-* headers).
2. **Founder has read the 2026-05-17 pass-through-fields-build close** end-to-end and the "Open Questions" block's Layer 3 prose anomaly finding has been noted (this session does NOT investigate the prose anomaly — that's a separate Standard-risk session to be scheduled when the founder elects).
3. **Founder commits to a ~1.5–2.5 hr bounded session** with mid-session input at Step 0 (scope confirmation) + Steps 1–3 (three design decisions, one AskUserQuestion round each, or one combined round if scope allows).
4. **Production state unchanged from session #4 close** (substrate at A7 Verified; pass-through fields Verified end-to-end; Option D per-loop metering Live + Verified; Stripe test-mode wiring Verified; Stripe live activation Deferred; `SUBSTRATE_WRITE_PATH_ENABLED` UNSET; `SUBSTRATE_LAYER3_ENABLED` UNSET; `SUBSTRATE_R20A_GATE_ENABLED` UNSET; both ATL tables empty).

---

## Part A — Open under the protocol

Read in order:

1. **`/adopted/standing-protocol-cache.md`** (~3 min) — confirms tier (`governance`), risk class (Standard), Lean template, signals, status vocabulary. Model selection N/A this session (no LLM calls — design pass only).
2. **`/adopted/build-sessions-protocol-cache.md`** (~3 min) — confirm "no current users" governing note (moot this session — no code lands).
3. **`/operations/handoffs/founder/2026-05-17-pass-through-fields-build-close.md`** (~5 min) — predecessor close. Particularly the "Open Questions" block's Layer 3 prose anomaly entry (noted but not investigated this session) + the "Next Session Should" block naming this session.
4. **`/adopted/atl-a10-design.md`** in full (~10–15 min) — the design this session Supersedes. Read with the three known issues in mind (Finding 1; loop_billing_events integration question; pass-through fields integration question).
5. **`/operations/handoffs/founder/2026-05-16-A10-design-pass-close.md`** Part 2 in full (~5–10 min) — the brainstorm that surfaced Finding 1 (the owner_user_id + agent_id correction) AND the original scoping of the seven pass-through fields. Particularly Q1–Q5 from the brainstorm.
6. **`/adopted/pass-through-fields-design.md`** §"Integration with adjacent surfaces" — particularly the **§A10 credential surface** subsection (lines ~580–590 of the design document) which names the two A10-integration calls this session makes (per-credential scoping + AccreditationPayload typical-class exposure) + the §Option D billing subsection (lines ~573–580) which informs the loop_billing_events integration call.
7. **`/adopted/billing-model-design.md`** targeted re-read (~5 min) — particularly Decision A's loop definition + the `loop_billing_events` schema. Informs the A10 credential issuance / revocation billing question.
8. **`/operations/decision-log.md` last 3 entries** (~5 min) — `D-PASS-THROUGH-FIELDS-BUILD-WIRED-VERIFIED-2026-05-17` (session #4 implementation status) + `D-PASS-THROUGH-FIELDS-LOCKED-2026-05-17` (the spec) + `D-BILLING-MODEL-BUILD-WIRED-VERIFIED-2026-05-17` (Option D Live).
9. **Targeted code reads** (~5–10 min — informational; this session writes no code):
   - `/website/src/lib/substrate/trust-layer/types/evaluation.ts` — confirm the seven new pass-through fields landed correctly per session #4 (informational for the A10 integration calls)
   - `/website/src/lib/substrate/atl-wrapper.ts` — confirm `CarriedProfile` has the two new fields (`downstream_identity_model`, `path_posture`)
   - `/website/src/lib/substrate/trust-layer/accreditation/accreditation-record.ts` — confirm `buildAccreditationPayload` shape (the typical-class exposure question lands here at build session #6)
10. **PR11 inbox scan** — list `/inbox/` for files dated since the predecessor close (2026-05-17). The prompt kit (`20260508-262-promptkit-1.md`) is already-consumed source material.
11. **PR15 consult** — `.claude/skills/anthropic/` review (or, in Cowork mode, the project-instructions panel reference). Candidate primitives: `skill-creator` (informational); `mcp-builder` (forward pointer for R18c — credential surface could later be exposed via MCP tool descriptions). Bespoke election expected — substrate-internal credential design has no Anthropic primitive substitute, but the consult must be performed and recorded per PR15.

**Confirm at open:** tier (`governance`); hold-point status (P0 0h active); model selection N/A (no LLM calls); status vocabulary (`Scoped → Designed → Scaffolded → Wired → Verified → Live` for implementation; `Adopted / Under review / Superseded` for decisions); signals + risk classification per 0d-ii; **Critical Change Protocol NOT engaged** this session.

---

## Part B — Procedure

### Step 0 — Scope confirmation (~5–10 min)

Via AskUserQuestion, surface:

1. **Output form.** Rewrite `/adopted/atl-a10-design.md` in full (Supersedes the predecessor; the predecessor is preserved in git history)? Or write an **addendum** appended to the existing design (predecessor stays Adopted; addendum captures the three integration decisions only)? **Default: rewrite in full** — the three integration calls touch most sections of the design; an addendum would fragment the spec across two files. The build session at #6 prefers one canonical source.
2. **Decision scope.** Confirm the three integration decisions are the right scope, or amend before proceeding. (Default: three decisions as scoped — owner_user_id correction; loop_billing_events integration; pass-through fields integration.)
3. **AskUserQuestion batching.** Ask the three design decisions in three separate rounds (one decision per round, fuller reasoning per question) OR in one combined round (faster; less reasoning surfaced per question)? **Default: three separate rounds** — design decisions benefit from the AI surfacing options + risks per question per the founder's preference "surface options, constraints, and risks. Present choices with reasoning — not prescriptions".

Other discretion picks may surface in-session; founder elects per question.

### Step 1 — Decision 1: owner_user_id + agent_id correction (~15–20 min)

Re-read 2026-05-16 A10 design close Part 2 Finding 1 in full. The finding identified an issue with how `owner_user_id` and `agent_id` were modeled in the original A10 design — the AI surfaces the specific issue + 2–3 candidate corrections, founder elects via AskUserQuestion.

Expected discussion points:
- What was the original design's assumption about owner_user_id ↔ agent_id?
- Why is it wrong (per Finding 1's reasoning)?
- What are the candidate corrections? (e.g., separate owner_user_id as a column; nullable foreign key; composite key; etc.)
- What's the impact on the credential surface + revocation + audit trail?

Founder election locks the correction.

### Step 2 — Decision 2: loop_billing_events integration (~15–20 min)

Re-read Option D's `loop_billing_events` schema + the A10 design's credential issuance / revocation operations. The AI surfaces 2–3 candidate integration shapes, founder elects via AskUserQuestion.

Expected discussion points:
- Should credential issuance trigger a `loop_billing_events` row? (Treats credential management as a billable operation.)
- Should credential revocation? (Probably not — revocation is a corrective action, not a billable loop.)
- If issuance is billable, at what rate? (Same $0.02 base as a standard loop? Higher? Free?)
- How does the `surface` enum extend? (`credential_issuance` as a new value?)
- What about credential validation reads (e.g., a third-party verifier checks an AccreditationPayload)? Billable, free, or rate-limited?

Founder election locks the integration shape. Note: this may have downstream effects on `loop_billing_events.surface` enum (Standard-risk schema change at build session #6) and `computeLoopBill` (Standard-risk code change at build session #6).

### Step 3 — Decision 3: pass-through fields integration (~20–30 min)

Re-read `/adopted/pass-through-fields-design.md` §Integration §A10 in full. The AI surfaces the two integration calls per the design's Integration section, founder elects via AskUserQuestion (one round with both questions, OR two rounds if scope allows).

**Decision 3a — Per-credential scoping** (Decisions B + C from the pass-through fields design):
- Should a credential carry `downstream_identity_model` + `path_posture` as scoping columns? E.g., a credential issued for `(vendor_framework: agentforce, path_posture: endorsed)` only — agents using `browser_session` paths would not match.
- Alternatives: leave the fields on `CarriedProfile` only (no scoping on the credential); add as nullable scoping columns (optional per credential); add as required scoping columns (every credential is scoped).
- Founder election locks the scoping shape.

**Decision 3b — AccreditationPayload typical-class exposure** (Decisions A + D + E + F):
- Should `AccreditationPayload` expose `typical_operation_class`, `typical_target_system_vendor`, `typical_outcome_verification`, `typical_reversibility_signal` (matching the existing `typical_deliberation_breadth` + `typical_kathekon_quality` pattern from `D-ATL-ITEMS-1-3` + `D-ATL-KATHEKON-ALIGNED-ALTERNATIVE`)?
- Alternatives: full exposure (all four typical-class fields); partial exposure (e.g., only `typical_operation_class` since it's the most procurement-actionable); no exposure (defer to a later session when populated data exists).
- Founder election locks the exposure shape.

**Decision 3c — Persistence shape** (the storage-vs-not-storage call deferred from session #4):
- Do the seven pass-through fields persist per-loop on `agent_accreditation` (additive nullable columns)? Per-action on a new table (`evaluated_action_history`)? Or remain in-memory only (no persistence; downstream consumers compute from the in-memory `EvaluatedAction[]` carried on the request)?
- Alternatives: persist per-loop on `agent_accreditation`; persist per-action on a new table; no persistence (in-memory only).
- Founder election locks the persistence shape. Note: this decides whether build session #6 includes a schema migration.

### Step 4 — Produce the rewritten design (~20–30 min)

Per Step 0's output-form election, EITHER:
- Rewrite `/adopted/atl-a10-design.md` in full incorporating the three locked decisions; original preserved in git history (no separate archive file needed — git handles versioning).
- OR write an addendum to `/adopted/atl-a10-design.md` capturing the three integration decisions only.

The rewritten design (or addendum) carries:
- Predecessor decision-log entry's reference (`D-ATL-A10-DESIGN-LOCKED-2026-05-16`)
- Supersession status (`Adopted YYYY-MM-DD; Supersedes D-ATL-A10-DESIGN-LOCKED-2026-05-16`)
- Three locked decisions with full reasoning (Why; Elected position; Why this and not alternatives; Structural constraint; R-rule engagement; Layer 1 implication; Deferred under PR7)
- Updated build-session implementation summary (what session #6 implements; updated file change estimate; updated risk classification)
- Cross-references to predecessor + pass-through fields design + billing-model design

### Step 5 — Founder verification (~5 min)

Via AskUserQuestion, founder confirms the rewritten design (or addendum) matches the three elections from Steps 1–3. Edits requested → make them; founder reconfirms.

### Step 6 — Append `D-ATL-A10-DESIGN-LOCKED-REWRITE-YYYY-MM-DD` decision-log entry (lean form per Standard) (~10–15 min)

Pattern: per `/adopted/standing-protocol-cache.md` §"Lean decision-log entry". Three sub-decisions summarised; integration with adjacent surfaces named (Option D billing; pass-through fields; A10 build session #6); deferred items under PR7; supersession of predecessor entry explicitly named; cross-references to design source + predecessor entries + pass-through fields design + billing-model design.

The predecessor `D-ATL-A10-DESIGN-LOCKED-2026-05-16` is marked **Superseded by `D-ATL-A10-DESIGN-LOCKED-REWRITE-YYYY-MM-DD`** in the same operation (small edit to the predecessor entry's Status line; Standard amendment per 0d-ii).

### Step 7 — Session close (lean form per Standard) (~10–15 min)

Pattern: per `/adopted/standing-protocol-cache.md` §"Lean session close". Sections: Decisions Made, Status Changes (`/adopted/atl-a10-design.md` Designed → Designed-rewrite; predecessor entry Adopted → Superseded; A10 build session #6 still Scoped), Next Session Should (names session #6 — A10 build; Critical risk; ~3–4 hr), Blocked On (files uncommitted; production state at close — unchanged), Open Questions (Layer 3 prose anomaly carries forward; source-of-truth port-mirror reconciliation carries forward; any new deferred items from this session), Founder Verification (git add + commit block + push instructions — no code verification needed; this is governance-only), Cross-references.

---

## Part C — Anticipated session shape

| Phase | Estimate |
|---|---|
| Part A — caches + predecessor close + A10 design + 2026-05-16 brainstorm + pass-through fields Integration §A10 + billing-model targeted read + decision-log + targeted code reads + PR11 + PR15 | 35–50 min |
| Step 0 — scope confirmation | 5–10 min |
| Step 1 — Decision 1 (owner_user_id correction) | 15–20 min |
| Step 2 — Decision 2 (loop_billing_events integration) | 15–20 min |
| Step 3 — Decision 3 (pass-through fields integration; three sub-decisions) | 20–30 min |
| Step 4 — produce rewritten design (or addendum) | 20–30 min |
| Step 5 — founder verification | 5 min |
| Step 6 — decision-log entry (lean form per Standard) + predecessor status amendment | 10–15 min |
| Step 7 — session close (lean form per Standard) | 10–15 min |
| **Total** | **~2–3 hr** |

(Slightly above the predecessor close's ~1–2 hr estimate because Part A's read budget is larger than predecessor anticipated — the A10 design + the 2026-05-16 brainstorm + the pass-through fields Integration §A10 section together carry more material than a typical successor-design session.)

---

## Rollback path

This is a governance-only session — no code, no schema, no env, no production exposure. Pre-push: `git reset --hard HEAD~N` discards local commits; no production effect. Post-push: `git revert HEAD~N..HEAD --no-edit` + push via GitHub Desktop; the predecessor A10 design (`D-ATL-A10-DESIGN-LOCKED-2026-05-16`) is restored as the operative design. No Vercel rebuild expected (governance documents don't trigger builds). Production state unchanged throughout.

If the rewritten design (or addendum) is reverted, the predecessor entry's Status reverts from `Superseded` back to `Adopted` (a small amendment to the decision-log).

---

## Forecast

A successful design rewrite produces an updated `/adopted/atl-a10-design.md` (or addendum) carrying the three locked integration decisions, plus the `D-ATL-A10-DESIGN-LOCKED-REWRITE-YYYY-MM-DD` decision-log entry (with the predecessor entry marked Superseded). The lean close is written; the founder commits + pushes the governance files. After this session lands:

- **Session #6 (A10 build — Critical; ~3–4 hr)** implements the rewritten design. Closes the post-6b arc tail. The Critical Change Protocol applies (auth surface change — A10 introduces per-agent credentials + revocation). PR6 engages. Expected scope: Supabase schema migration (additive credential table + revocation table; possibly per-loop persistence schema per Decision 3c); credential issuance endpoint; revocation endpoint; per-credential scoping logic (per Decision 3a); AccreditationPayload typical-class exposure (per Decision 3b); env-flag activation pattern (the existing `SUBSTRATE_*_ENABLED` pattern extended for the credential surface). The build session's next-session prompt is drafted at this session's close OR between sessions.

Plus the independent **Stripe-Price-ID follow-on session** (Standard-to-Elevated; ~30–60 min) — pending accountant + lawyer engagement per the 2026-05-17 Addendum.

Plus the deferred **Layer 3 prose anomaly investigation** (Standard-risk; ~30–60 min; potentially escalates to Elevated if identifier-leakage is confirmed as R3 PII adjacency concern) — to be scheduled when the founder elects.

Post-arc-close, the substrate carries: authenticated read AND write public surfaces (post-A10 build); per-agent credentials with revocation + per-credential scoping (post-A10 build); per-loop billing with R5 prospectively enforced (Option D Live); enterprise-readable pass-through fields on every action evaluation (post session #4, live now); honest typical-class exposure on the AccreditationPayload (per Decision 3b). The remaining pre-launch gates are commercial (Stage 1 close lawyer engagement, FPE-5 TOS + liability), regulatory, and market.

*End of prompt.*
