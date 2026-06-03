# Next-Session Prompt — A11b: Prompt-Injection Defence at Layer 1 + Layer 3 (Critical)

Paste this whole file into a new session to proceed. This is the canonical prompt for the next critical-path session after **A10 reached Verified-live** (2026-06-03).

**Stream:** founder. **Tier:** `code-critical` — Critical under 0d-ii. **PR6 ENGAGED** (A11b is a safety-critical change — prompt-injection defence guards the Layer-1 feature extraction that the R20a distress signal and the deterministic engine both depend on). The full **Critical Change Protocol (0c-ii)** runs visibly in the conversation before any deploy or flag flip — not optional; urgency does not downgrade it. Engaged process rules: **PR1** (single-endpoint proof — prove the defence on ONE surface before any rollout), **PR2** (build-to-wire verification immediate; grep the call path, not the import), **PR6** (safety surface = Critical), **PR7** (record any deferral), **PR10** (Plan→Execute→Verify with diagnostic-certainty signalling), **PR15** (consult Anthropic primitives + agentic-commerce findings before any bespoke build), **PR17** (every founder-performed step — any TEST run, env var, smoke test — walked through live, click-by-click, not handed off).

**Governing frame:** `/adopted/standing-protocol-cache.md` (Critical sessions keep the FULL templates) + `/adopted/build-sessions-protocol-cache.md` ("no current users" holds — CCP step 3 answers "N/A: only founder + test logins exist") + `/adopted/substrate-plugin-staging-plan.md` (§A11b + the A10→A11b dependency + Stage-1 risk profile).

**Predecessor close:** `/operations/handoffs/founder/2026-06-03-A10-critical-implementation-close.md` (incl. the same-day "Update — TEST smoke test PASSED → A10 Verified-live" section).
**Predecessor decision-log entries:** `D-A10-SMOKE-TEST-VERIFIED-LIVE-2026-06-03`; `D-A10-CRITICAL-IMPL-WIRING-REVOCATION-2026-06-03`; `D-A10-TOKEN-FORMAT-ADR-AND-SCAFFOLD-2026-06-03`.

---

## Founder elects the item at open

A10 Verified-live unblocked **A11b, A12, A13, A15a, A19**. This prompt is scoped to **A11b** (the next critical-path item per the staging plan's `A10 → A11b → A12 → A13 → A15a → Stage 1 close` sequence). If you'd rather take a different item this session, say so at open and the AI re-scopes:

- **A11b — Prompt-injection defence at Layer 1 + Layer 3** (Critical; ~2 sessions) — *this prompt's default.*
- **A11a — Audits** (Standard; ~1 session) — endpoint-auth inventory + a CI check for new unauthenticated routes + a JSON-key SQL-injection code-review pass. A good **session-filler to pair with A11b** (per Efficiency 9 / indicative session 13), or a lighter standalone session.
- **A12 — OpenTelemetry GenAI instrumentation + call-grain audit** (Elevated; ~1–2 sessions) — folds in agentic-commerce finding **F4** (AC10/AP2 alignment) at session-open per the findings tracker.
- **A13 — R5 cost-as-health-metric alerts** (Elevated; ~1 session) — depends on A12.
- **A15a — R17c genuine deletion endpoint** (Critical; ~1 session) — replaces the 503 placeholder; depends on A10's identity discrimination.
- **A19 — Abuse-detection + rate-limiting** (Elevated; ~1 session) — depends on A10.

Recommendation: **A11b**, optionally paired with **A11a** as the low-attention closing filler.

---

## Where this sits (one paragraph)

A10 (per-install plugin-auth) is **Verified-live on TEST** — the identity keystone the rest of Stage 1 depends on is done: schema migration Verified on TEST, the admin mint/revoke endpoint and the `/api/reason` per-install wiring built and Verified-in-sandbox, and the full mint→authenticate→revoke→401 path Verified-live. Production is byte-identical (the per-install flag is UNSET in production; the path is inert there). A11b now hardens the **input-handling** side of the substrate: it makes Layer 1 (feature extraction) and Layer 3 (prose generation) resistant to prompt-injection — adversarial inputs that try to "ignore previous instructions", escape into tool calls, suppress the distress signal, or inject prompts into generated prose. This matters because Layer 1's structured output feeds both the deterministic engine and the R20a safety signal; an injection that corrupts Layer 1 could degrade safety, which is why A11b is Critical / PR6.

## Why this session matters

Layer 1 and Layer 3 are the two LLM-touching seams of the translation-sandwich. Layer 2 is deterministic and already closed. Hardening the two LLM seams against injection — proven on ONE surface first (PR1), with the safety-signal path explicitly tested — closes Phase 1.5 gap G6 (T3-13 + T3-14) and is a precondition for opening the substrate to external plugin traffic.

## Pre-conditions (founder confirms at open; AI verifies by read)

1. **The A10 doc updates are committed + pushed; Vercel green.** Confirm `D-A10-SMOKE-TEST-VERIFIED-LIVE-2026-06-03` is in `/operations/decision-log.md` and the close's "Update — TEST smoke test PASSED" section is on `main`. (These were the two files committed at the end of the A10 session.)
2. **Production unchanged from the A10 close:** `PLUGIN_INSTALL_AUTH_ENABLED` UNSET (production); `PLUGIN_AUTH_ENABLED` UNSET; all four R20a flags `true`; `SUBSTRATE_LAYER3_ENABLED` UNSET (503); `SUBSTRATE_WRITE_PATH_ENABLED` `true`; `/api/reason` byte-identical. The A10 per-install path is inert in production.
3. **No A11b work has begun** — confirm by scanning the decision log for any entry after `D-A10-SMOKE-TEST-VERIFIED-LIVE-2026-06-03`.
4. **TEST-env reminder (for any live run this session):** `npm run dev` reads `website/.env.development.local`, which overrides `.env.local` and points at the TEST project (`iwdtrvuphogkwmovhnvz`). Production `.env.local` (`jdbefwkonfbhjquozgxr`) must never be the dev target. (Tidying this split is a separate future task; not this session.)

## Part A — Open under the protocol

Read in order:

1. `/adopted/standing-protocol-cache.md` (~3 min — tier, model selection, risk class, signals, status vocabulary, the AI-failure-modes table).
2. `/adopted/build-sessions-protocol-cache.md` (the "no current users" note — CCP step 3 is N/A while it holds).
3. `/operations/handoffs/founder/2026-06-03-A10-critical-implementation-close.md` (predecessor close + the Verified-live update — production state + what's built).
4. `/adopted/substrate-plugin-staging-plan.md` §A11b (lines ~79–84) + the Stage-1 dependency + risk-profile lines (the operative spec for this session's scope).
5. The live Layer 1 + Layer 3 source (the surfaces A11b hardens): `website/src/lib/translation-sandwich/layer1-extractor.ts` (`extractFeatures` / `validateLayer1Schema` / `Layer1ValidationError`); the Layer 3 prose engine under `website/src/lib/substrate/` (the `sage-prose-engine` / `layer3-service.ts`); and `website/src/lib/translation-sandwich/parallel-run.ts` (`runSandwich` / `runSandwichInner` — where Layer 1 output flows to Layer 2 + the R20a signal).
6. `website/src/lib/r20a-classifier.ts` + `website/src/lib/constraints.ts` (`enforceDistressCheck`) — so the injection-defence work explicitly preserves the distress-signal path (the PR6 reason A11b is Critical).
7. `/operations/decision-log.md` last 2–3 entries.

Confirm at open: tier (`code-critical`; Critical); hold-point status (P0 0h active); model selection per the cache (Layer 1 = Sonnet/DeepModel; Layer 3 = Sonnet — cite the AC1 rows); status vocabulary; signals + risk class; **PR6 ENGAGED**; PR1, PR2, PR10, PR15, PR17 engaged. Narrate before substantive work: where we are in the arc (A10 Verified-live; A11b next); what's queued behind A11b (A12/A13/A15a/A19); what's awaiting the founder vs the AI.

## Part B — Procedure (Critical Change Protocol governs throughout)

### Step 1 — PR15 consult + threat model + design lock (no code yet)
Consult `.claude/skills/anthropic/` (esp. anything on prompt-injection / safe tool-use patterns) + `/operations/agentic-commerce-findings-downstream-order.md`; summarise inline. Produce a short **threat model** for the two seams: the injection patterns in scope (instruction-override, tool-call/escape attempts, distress-signal suppression at Layer 1; prompt-injection-into-prose + consumer-context contamination at Layer 3) and what "defended" means for each. Lock the small design decisions (where sanitisation sits; whether Layer 1 defence is input-preprocessing vs output-validation vs both; how a detected injection is handled — reject vs neutralise-and-flag; how the distress path is protected). Present; founder confirms before code. **PR1: pick ONE surface to prove first** (recommend Layer 1 `extractFeatures`, since it feeds the safety signal).

### Step 2 — Build the defence on ONE surface (PR1; PR2)
Implement the chosen Layer-1 (or Layer-3) defence as testable units (factor the pure detection/sanitisation logic per PR2). Add adversarial unit tests covering the threat-model patterns, including a test that a distress-bearing input with an injection wrapper still produces the correct distress signal (the safety invariant). Grep the call path to confirm the defence is actually invoked in the seam, not just defined.

### Step 3 — Critical Change Protocol (visible, before any deploy/flag flip)
Complete all six 0c-ii steps in the conversation: (1) what is changing — plain language; (2) what could break — specific failure modes (e.g. "over-aggressive sanitisation strips legitimate input" / "a bypass leaves the seam exposed"); (3) existing sessions — "N/A, no current users"; (4) rollback plan — exact steps (gate behind a flag, default off, so the seam is byte-identical until flipped; or revert-the-commit if additive); (5) verification step — the founder's checks; (6) explicit founder approval specific to the named risks. **Default: commit inert / behind an unset flag**, exactly like A10 — the founder elects whether/when to enable and run live TEST adversarial probes.

### Step 4 — Verify
Per the 0c framework + the working test forms in `/CLAUDE.md` (plain `npx tsx` for Supabase-free tests; `--env-file=.env.local` for any that touch the client — though A11b is unlikely to need Supabase). `tsc --noEmit` clean. PR2 call-path grep. Classify findings per PR10 diagnostic-certainty. If a live TEST adversarial run is elected, walk it live per PR17 (against the TEST override, never production).

### Step 5 — (Optional companion) A11a audits
If running A11a as the closing filler: produce the endpoint-auth inventory (every route in `website/src/app/api/`, classified authenticated / unauthenticated / public-by-design); note the `/security-review` GitHub Action CI candidate; do the JSON-key SQL-injection code-review pass over `from()` + `select()` calls. Standard risk; lean form.

### Step 6 — Decision-log entry (full Critical form)
Include the safety-invariant verification (the distress path still fires under an injection wrapper) and a perimeter note (A11b hardens Layer 1/Layer 3 — assess whether it touches the R20a perimeter or is adjacent).

### Step 7 — Session close (full Critical form)
Verification Method Used, Risk Classification Record, PR5 Knowledge-Gap Carry-Forward, Founder Verification (Between Sessions), Orchestration Reminder. State production state explicitly. Name the next session (A12, or continue A11b if it spans two sessions) + its pre-conditions.

## What is NOT in this session

- **A10 production activation** (re-run the migration on production + mint a credential + CCP + flip `PLUGIN_INSTALL_AUTH_ENABLED` in production) — a separate future Critical step; do not bundle.
- **Rollout of the injection defence to surfaces beyond the one proven** (PR1 — prove on one first).
- **A12/A13/A15a/A19** — they queue behind A11b unless the founder elects one of them as this session's item instead.
- **Retiring `PLUGIN_AUTH_SECRET`** — stays as the fallback until the founder elects to remove it.

## Rollback path

A11b lands inert (behind an unset flag, or as additive validation that is off by default) → nothing to roll back at commit. If enabled and it misbehaves (e.g. false-positive sanitisation): unset the flag + redeploy, or revert the commit. The CCP supplies exact commands in-session.

## Forecast

Most likely: the threat model + design lock are agreed; the Layer-1 injection defence is built + adversarially unit-tested on one surface (incl. the distress-path safety invariant), Verified-in-sandbox, and committed inert; optionally A11a's audits land as the closing filler. That advances A11b toward Verified (it may span a second session for the Layer-3 seam + live adversarial probes). The parallel legal/insurance (FPE) track and lawyer engagement remain worth starting whenever you choose — they gate the eventual marketplace launch on wall-clock, not build pace.

End of prompt. Opens on `main`. Critical-tier; the full Critical Change Protocol governs any deploy or flag flip; throwaway TEST data only.
