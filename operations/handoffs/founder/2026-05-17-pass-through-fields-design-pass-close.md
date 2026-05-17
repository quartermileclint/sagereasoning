# Session Close — 2026-05-17 — Pass-Through Fields Design Pass

**Stream:** founder.
**Governing frame:** `/adopted/standing-protocol-cache.md` (general protocol — `governance` row → **Lean** template) + `/adopted/build-sessions-protocol-cache.md` (build-arc context — "no current users" governing note applies; moot this session).
**Tier:** `governance` — **Standard** risk under 0d-ii. Lean template per the standing cache. Critical Change Protocol NOT engaged this session (NOT expected to engage at the build session either — Elevated under 0d-ii is the build-session classification). AC7 not engaged this session. PR6 not engaged.
**Date:** 2026-05-17.

Produced `/adopted/pass-through-fields-design.md` (the six pass-through fields design — six locked decisions A–F + integration-with-adjacent-surfaces section + ~10-row build-session implementation summary table) and appended `D-PASS-THROUGH-FIELDS-LOCKED-2026-05-17` to the decision log. Also extended `D-BILLING-MODEL-BUILD-WIRED-VERIFIED-2026-05-17` with the **Addendum 2026-05-17 (post-close)** block capturing the post-deploy verification + Stripe test-mode wiring that landed in a continuation conversation after the predecessor session's close was written.

This was the **design half** of session #3 in the new post-6b arc tail — no code landed in this session.

**Part A** — read both caches (standing + build-arc); the predecessor Option D build close in full; the predecessor A10 design close Part 2 (brainstorm scoping source); `/inbox/20260508-262-promptkit-1.md` in full (the Nate B Jones SaaS Renewal Agent License Prompt Kit — Agent System Touch Map provides the canonical enum vocabularies); `/adopted/billing-model-design.md` targeted re-read (Decision A loop definition + Decision E cost tracking + deferred-under-PR7 tiered-per-action billing); `/adopted/atl-a10-design.md` targeted re-read (Decisions B + C + H — A10's `credential_audit` surface + AccreditationPayload at session #5 rewrite); targeted code reads (`/website/src/lib/substrate/trust-layer/types/accreditation.ts` + `accreditation-record.ts` — confirmed `EvaluatedAction` + `CarriedProfile` live in `evaluation.ts` not `accreditation.ts`; verbatim-port banner means changes propagate to `/trust-layer/types/`); the last three decision-log entries (`D-BILLING-MODEL-BUILD-WIRED-VERIFIED-2026-05-17` + `D-BILLING-MODEL-LOCKED-2026-05-17` + `D-ATL-A10-DESIGN-LOCKED-2026-05-16`); PR11 inbox scan (no new files since predecessor close); PR15 consult (`.claude/skills/anthropic/` reviewed — 17 official skills; `mcp-builder` forward pointer for R18c; no Anthropic primitive substitutes for substrate-internal type-system design).

**Part A surfaced two material findings affecting the design pass:**

1. **The prompt-kit's taxonomies are richer than the prompt's framing.** The Agent System Touch Map names 9-value operation_class (not 3-value read/draft/execute); 7-value identity_model; 4-value path_posture; 8-value vendor list. The session should use the prompt-kit vocabularies as the candidate enum source for Q1–Q4. Founder elected option (a): "Use prompt-kit vocabularies + note evaluation.ts" — the design uses prompt-kit vocabularies verbatim.

2. **`EvaluatedAction` + `CarriedProfile` live in `/website/src/lib/substrate/trust-layer/types/evaluation.ts`**, not in `accreditation.ts`. The build-session implementation summary table names `evaluation.ts` as the primary modified file (in addition to `accreditation.ts` if the port-mirror pattern requires updates there).

**Step 0** — addendum to `D-BILLING-MODEL-BUILD-WIRED-VERIFIED-2026-05-17` drafted. Founder approved as drafted: "Approve as drafted — append it". Addendum block appended above the entry's closing `---` separator. Captures: post-deploy verification (BILL-3 case verified live; loop_id af9b21ac-5d47-4e7b-a7e0-ac670a551f8a; six X-Loop-* response headers); Stripe test-mode setup (account + Vercel env vars + test-mode Product + Price + webhook endpoint + 6 subscribed events + post-redeploy smoke-test); live Stripe activation deferred (pending accountant + lawyer engagement); Part E end-to-end webhook test deferred to the Stripe-Price-ID follow-on session; substrate component statuses updated.

**Step 1** — six prompt-named questions surfaced (Q1–Q6) with candidate values + Layer 1/2/3 + downstream-consumer implications. Founder accepted the six as scoped without amendment.

**Step 2** — two AskUserQuestion rounds; all six elections matched the AI's Recommended options.

| Round | Questions | Founder's elections |
|---|---|---|
| 1 of 2 | Q1 (operation_class) + Q2 (downstream_identity_model) + Q3 (path_posture) | 9-value prompt-kit + 'unknown' default; 7-value prompt-kit + 'unknown' default; 4-value prompt-kit + 'ambiguous' default |
| 2 of 2 | Q4 (target_system) + Q5 (outcome_verification) + Q6 (reversibility_signal) | Two-field vendor enum + free-form detail; 4-value enum incl. external_auditor + 'self_reported' default; 4-value enum + 'unknown' default |

**Step 3** — `/adopted/pass-through-fields-design.md` written in a single Write call, modelled on `/adopted/billing-model-design.md`'s eight-decision shape contracted to six here. Per-decision sections: Why; Elected position; Why this and not alternatives; Structural constraint (with TypeScript type definitions + validator helpers per decision); R-rule engagement; Layer 1 implication (all six: None); Deferred under PR7. Plus integration-with-adjacent-surfaces section (Option D billing — no propagation to `loop_billing_events` this design; Option C tiered billing deferred under PR7 with `operation_class` as gating field; A10 credential surface — integration deferred to session #5; R20a risk classification — no logic change this design; discovery files updated at build). Plus build-session implementation summary table (~10 file changes; ~2–3 hr; Elevated risk; PR1 single-build proof applies).

**Step 4** — founder verification via AskUserQuestion: "Yes — proceed to decision-log + close." No edits requested.

**Step 5** — `D-PASS-THROUGH-FIELDS-LOCKED-2026-05-17` appended (lean form per Standard governance risk). Six sub-decisions summarised; integration with adjacent surfaces named; ~20 deferred items named under PR7; PR11 inbox scan + PR15 election recorded; cross-references to design source + predecessor entries + structural template.

**Step 6** — this close.

## Decisions Made

- **`D-PASS-THROUGH-FIELDS-LOCKED-2026-05-17`** appended (lean form per Standard governance risk). Status: Adopted. Six sub-decisions A–F summarised; integration with adjacent surfaces named (Option D billing no-propagation + Option C deferred + A10 to-be-integrated-at-session-#5 + R20a unchanged + discovery files at build); ~20 deferred items named under PR7.
- **Addendum 2026-05-17 (post-close)** appended to `D-BILLING-MODEL-BUILD-WIRED-VERIFIED-2026-05-17`. Captures post-deploy verification + Stripe test-mode wiring + live-activation deferral. Documentation accuracy improvement; decision entry's implementation status now reflects post-deploy + test-mode work completed.

## Status Changes

| Item | Old | New |
|---|---|---|
| Pass-through fields design (post-6b arc tail session #3) | **Scoped** (brainstormed at the 2026-05-16 A10 design close Part 2) | **Designed** under `D-PASS-THROUGH-FIELDS-LOCKED-2026-05-17` (the build session at #4 implements) |
| `/adopted/pass-through-fields-design.md` | did not exist | **Adopted** (decision); **Designed** (implementation) |
| Option D metering (Decision A in implementation summary) | **Wired** | **Verified end-to-end** per Addendum (response headers + ledger persistence + post-deploy curl) |
| Stripe test-mode wiring (env vars + webhook endpoint) | did not exist | **Verified** per Addendum (Stripe account + Vercel env vars + test-mode Product/Price + webhook endpoint + 6 subscribed events + smoke-test) |
| Stripe live-mode activation | **Scoped** (deferred) | **Deferred** per Addendum (pending accountant + lawyer engagement) |
| Stripe-Price-ID follow-on session | **Scoped** | **Scoped** (unchanged) — independent of sessions #4–#6; can be scheduled at any point post-deploy |
| Production state | A7 Verified; per-loop metering live (Option D); Stripe test-mode wiring live; live Stripe activation deferred | **Unchanged** — no code, schema, env, or production exposure this session |

## Next Session Should

**Session #4 of the new post-6b arc tail — pass-through fields build.** `code-elevated` tier; Elevated risk under 0d-ii. Lean template + Elevated additions per the standing protocol cache. Estimated **~2–3 hr**.

Per the build-session implementation summary table in `/adopted/pass-through-fields-design.md`:

- Modify `/website/src/lib/substrate/trust-layer/types/evaluation.ts` — add 6 new exported types + extend `EvaluatedAction` with 5 fields + extend `CarriedProfile` with 2 fields (build session confirms which file carries `CarriedProfile`; the port-mirror pattern may require parallel changes in `/trust-layer/types/`).
- New file `/website/src/lib/substrate/trust-layer/validation/pass-through-fields.ts` — six `VALID_*` constants + six `normalise*` functions per the design's structural constraints.
- New tests `/website/src/lib/substrate/trust-layer/validation/__tests__/pass-through-fields.test.ts` — ~40–50 plain-assertion tests covering each normaliser's enum membership + default behaviour + soft-fallback + length cap.
- Modify discovery files (`/product/AGENTS.md` + `/website/public/llms.txt` + `/website/public/.well-known/agent-card.json`) — pass-through-metadata section documenting the six fields.
- `AccreditationPayload` typical-class exposure DEFERRED to session #5 (A10 rewrite).
- Schema migration for per-loop persistence DEFERRED to session #5 (A10 rewrite — storage shape decided in context).
- New decision-log entry `D-PASS-THROUGH-FIELDS-BUILD-WIRED-VERIFIED-YYYY-MM-DD` (lean form per Elevated).
- New session close (lean form per Elevated).

After session #4 lands, sessions #5 (A10 design rewrite — governance; Standard; ~1–2 hr) + #6 (A10 build — Critical; ~3–4 hr) close the post-6b arc.

Plus the independent **Stripe-Price-ID follow-on session** (Standard-to-Elevated; ~30–60 min) — can be scheduled at any point post-deploy; deferred pending accountant + lawyer engagement per the Addendum.

The next-session prompt for #4 is **not yet written** — to be drafted by the AI between sessions (or at session open) based on this design's build-session implementation summary table. Estimated prompt write: ~15–20 min.

## Blocked On

**Files remaining uncommitted (to be committed by the founder per the Founder Verification block below):**

```
?? adopted/pass-through-fields-design.md                                                   (NEW — design document)
 M operations/decision-log.md                                                              (D-PASS-THROUGH-FIELDS-LOCKED-2026-05-17 appended + Addendum 2026-05-17 appended to predecessor entry)
?? operations/handoffs/founder/2026-05-17-pass-through-fields-design-pass-close.md         (NEW — this close)
```

**Production state at session close:** **unchanged from session open** — no code, schema, env, or production exposure this session. Substrate at A7 Verified. Option D per-loop metering Live (Verified end-to-end per Addendum). Stripe test-mode wiring Verified (env vars + webhook endpoint + smoke-test); Stripe live activation Deferred. `SUBSTRATE_WRITE_PATH_ENABLED` UNSET (write surface inert pre-A10). `SUBSTRATE_LAYER3_ENABLED` UNSET. `SUBSTRATE_R20A_GATE_ENABLED` UNSET. `/api/reason` byte-identical (now emits X-Loop-* headers on every billable response branch per Option D — the metering layer is additive, not behaviour-changing for the substrate's reasoning paths). `/api/substrate/layer3` returns 503. `/api/accreditation/[agent_id]` Live (GET 404 / POST 503). Both ATL tables empty.

## Open Questions

The decision-log entry's "Open questions (deferred per PR7)" block names ~20 deferred items. The headline ones to keep in mind between sessions:

- **Pass-through fields build session.** Session #4 of the new post-6b arc tail — natural next session. Expected risk: Elevated; expected time: ~2–3 hr.
- **A10 design rewrite incorporating pass-through fields.** Session #5. Will supersede `D-ATL-A10-DESIGN-LOCKED-2026-05-16` with: (i) the `owner_user_id` + `agent_id` correction from the 2026-05-16 brainstorm Finding 1; (ii) integration with Option D's `loop_billing_events` where the credential surface touches billing; (iii) integration with the new pass-through fields per the design's Integration §A10 section.
- **Persistence shape for pass-through fields (per-loop history).** Schema-migration call deferred to session #5 where the storage-vs-not-storage decision is made in context.
- **`AccreditationPayload` typical-class exposure.** Extend `buildAccreditationPayload` to compute typical-class fields across the evaluation window. Deferred to session #5.
- **Option C tiered-per-action billing.** Implementation depends on `operation_class` existing + populated. Revisit at 2–4 weeks of populated data + real customer interest.
- **Stripe live activation.** Deferred pending accountant + lawyer engagement (per Addendum). Independent of sessions #4–#6.

## Founder Verification

**Two things to do, in order. Take them one at a time — do not paste the multi-line blocks as one command per the CLAUDE.md note about prompt-consumption.**

### 1. Read the new design document

Open `/adopted/pass-through-fields-design.md` in a text viewer. Confirm the six locked decisions A–F match the elections from Step 2 (Round 1: 9-value operation_class + 'unknown' default; 7-value identity_model + 'unknown' default; 4-value path_posture + 'ambiguous' default. Round 2: two-field target_system with vendor enum + free-form detail + 'none' default; 4-value outcome_verification including external_auditor + 'self_reported' default; 4-value reversibility_signal + 'unknown' default).

Also read the 2026-05-17 addendum block now appended to `D-BILLING-MODEL-BUILD-WIRED-VERIFIED-2026-05-17` (line ~6419 of `/operations/decision-log.md`). Confirm the text matches your recollection of the post-deploy verification + Stripe test-mode work.

If anything needs adjusting, message me. Edits to the design document are Elevated under 0d-ii; edits to the addendum are Standard amendments per the cache's update discipline.

### 2. Commit and push

Use targeted adds (explicit paths, not `git add -A`). Run each command on its own line:

```
cd "/Users/clintonaitkenhead/Claude-work/PROJECTS/sagereasoning"
```

```
rm -f .git/index.lock
```

```
git add adopted/pass-through-fields-design.md
```

```
git add operations/decision-log.md
```

```
git add operations/handoffs/founder/2026-05-17-pass-through-fields-design-pass-close.md
```

Then the commit (one command, but multi-line message — paste the whole block including the closing `"`):

```
git commit -m "Pass-through fields design pass + Option D build addendum

Session #3 of 6 in the new post-6b arc tail. Six pass-through fields
locked on EvaluatedAction (operation_class, target_system_vendor,
target_system_detail, outcome_verification, reversibility_signal) and
CarriedProfile (downstream_identity_model, path_posture). All six enum
vocabularies taken verbatim from the Nate B Jones SaaS Renewal Agent
License Prompt Kit (Agent System Touch Map). All six optional with
sensible defaults — backward compatibility preserved at the type-system
level for existing substrate consumers (ATL Wrapper, kathekon-aligned
scorer, hand-back report, etc.).

Substrate validates the enum values and persists them; it does not
interpret them for Layer 1, 2, or 3 reasoning. Downstream consumers
(Option C tiered billing once activated; enterprise procurement
reviewers reading the AccreditationPayload; A10 credential surface at
session #5; future MCP integrations per R18c) read these fields for
audit, compliance, and tiered-billing decisions.

Integration with adjacent surfaces:
  - Option D billing: no propagation to loop_billing_events (per-loop
    aggregate vs per-action distinction)
  - Option C tiered billing deferred under PR7; operation_class is the
    gating field — once populated, Option C becomes implementable
  - A10 credential surface: integration deferred to session #5 A10
    rewrite (per-credential scoping vs AccreditationPayload typical-
    class exposure call made there)
  - R20a risk classification: no logic change; risk_class remains
    independently set
  - Discovery files (AGENTS.md + llms.txt + agent-card.json) updated
    at build

Also this session: Addendum 2026-05-17 appended to D-BILLING-MODEL-
BUILD-WIRED-VERIFIED-2026-05-17 capturing post-deploy verification
(BILL-3 case verified live; loop_id af9b21ac-5d47-4e7b-a7e0-ac670a551f8a;
six X-Loop-* response headers) + Stripe test-mode wiring (account +
Vercel env vars + test-mode Product + Price + webhook endpoint + 6
subscribed events + post-redeploy smoke-test). Live Stripe activation
deferred pending accountant + lawyer engagement.

Standard risk; governance only; no code, schema, env, or production
exposure. AC7 not engaged. PR6 not engaged.

Next: session #4 — pass-through fields build (Elevated; ~2-3 hr).

Per D-PASS-THROUGH-FIELDS-LOCKED-2026-05-17."
```

Then push via **GitHub Desktop**.

**Expected Vercel behaviour:** no rebuild — only governance files changed. Production state unchanged.

## Cross-references

- Operative session prompt: the inline next-session prompt provided at session open (Session #3 of the post-6b arc tail: Pass-Through Fields Design Pass)
- Predecessor session close: `/operations/handoffs/founder/2026-05-17-billing-model-build-close.md`
- Scoping source: `/operations/handoffs/founder/2026-05-16-A10-design-pass-close.md` Part 2 (six pass-through fields originally named in the brainstorm)
- Design document (this session): `/adopted/pass-through-fields-design.md`
- Decision-log entry (this session): `D-PASS-THROUGH-FIELDS-LOCKED-2026-05-17`
- Decision-log entry extended this session: `D-BILLING-MODEL-BUILD-WIRED-VERIFIED-2026-05-17` (Addendum 2026-05-17 appended)
- Predecessor decision-log entries:
  - `D-BILLING-MODEL-BUILD-WIRED-VERIFIED-2026-05-17` (Option D build Verified end-to-end including the Addendum)
  - `D-BILLING-MODEL-LOCKED-2026-05-17` (Option D design source)
  - `D-ATL-A10-DESIGN-LOCKED-2026-05-16` (A10 design Adopted; will be Superseded at session #5 of the new post-6b arc tail)
- Structural template: `/adopted/billing-model-design.md` (eight-decision design-pass shape contracted to six here)
- Inbox primary source: `/inbox/20260508-262-promptkit-1.md` (Nate B Jones SaaS Renewal Agent License Prompt Kit — Agent System Touch Map's enum vocabularies are taken verbatim for Decisions A + B + C + D)
- Inbox secondary source: `/inbox/Related to agent API billing.rtf` (companion essay — fair-license criteria framing applied across all six decisions)
- Future build targets: `/website/src/lib/substrate/trust-layer/types/evaluation.ts` (the 7 new fields land here) + new file `/website/src/lib/substrate/trust-layer/validation/pass-through-fields.ts` + discovery files (`/product/AGENTS.md` + `/website/public/llms.txt` + `/website/public/.well-known/agent-card.json`)
- F-tracker: `/operations/agentic-commerce-findings-downstream-order.md` (pass-through fields are upstream provenance candidates for A12 OpenTelemetry integration parallel to `loop_billing_events`)
- Governance: `/adopted/standing-protocol-cache.md` (Lean template; governance row; Standard risk default) + `/adopted/build-sessions-protocol-cache.md` ("no current users" governing note — moot this session; load-bearing at session #4 build)
- Manifest: `/manifest.md` §R0 (audit trail authenticity); §R9 (Decision E primary engagement — outcome verification posture lives in R9's vicinity); §R10 (marketplace consistency across all six decisions); §R17 (intimate-data adjacency via Decisions B + D); §R18a (Character Kernel framing preserved — pass-through fields are operational metadata); §R18c (additive interoperability); AC7 (NOT engaged); AC8 (translation-sandwich substrate; Layer 4 pass-through; no Layer 1 contract change); AC10 (provenance — pass-through fields are upstream provenance candidates for A12 mirroring `loop_billing_events`); KG1 (engaged at build session — validator normalisation synchronous; soft-fallback with warning log; no fire-and-forget); KG7 (NOT engaged — all six fields text or text-array; no JSONB writes)

*End of session close. With the design adopted, the decision-log entry appended, and the Option D build addendum captured, session #3 of the new post-6b arc tail closes. Three sessions remain in the tail (pass-through fields build at #4; A10 rewrite at #5; A10 build at #6) plus the independent Stripe-Price-ID follow-on (pending accountant + lawyer engagement). Production state unchanged — no code, schema, env, or live-system exposure this session.*
