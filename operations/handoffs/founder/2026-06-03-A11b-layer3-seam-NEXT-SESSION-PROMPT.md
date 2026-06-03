# Next-Session Prompt — A11b (cont.): Prompt-Injection Defence at Layer 3 — completes A11b (Critical)

Paste this whole file into a new session to proceed. This is the canonical prompt for the next critical-path session after the A11b Layer-1 seam reached **Wired-inert + Verified-in-sandbox** (2026-06-03).

**Stream:** founder. **Tier:** `code-critical` — **Critical** under 0d-ii. **PR6 ENGAGED** (Layer 3 carries the A5.4 R20a deterministic distress pass-through injection — safety-critical). The full Critical Change Protocol (0c-ii) runs visibly in the conversation before any deploy or flag flip — not optional; urgency does not downgrade it. Engaged process rules: **PR1** (single-endpoint proof — prove the Layer-3 defence on the `/api/reason` path first), **PR2** (build-to-wire verification immediate; grep the call path, not the import), **PR6** (safety surface = Critical), **PR7** (record any deferral), **PR10** (Plan→Execute→Verify with diagnostic-certainty signalling), **PR15** (consult Anthropic primitives + agentic-commerce findings before any bespoke build), **PR17** (every founder-performed step — any TEST run, env var, smoke test — walked through live, click-by-click, not handed off).

**Governing frame:** `/adopted/standing-protocol-cache.md` (Critical sessions keep the FULL templates) + `/adopted/build-sessions-protocol-cache.md` ("no current users" holds — CCP step 3 answers "N/A: only founder + test logins exist") + `/adopted/substrate-plugin-staging-plan.md` (§A11b — the Layer 3 half + the Stage-1 dependency + Stage-1 risk profile).

**Predecessor close:** `/operations/handoffs/founder/2026-06-03-A11b-layer1-injection-defence-close.md`.
**Predecessor decision-log entry:** `D-A11B-LAYER1-INJECTION-DEFENCE-WIRED-INERT-2026-06-03` (plus the A10 chain it builds behind: `D-A10-SMOKE-TEST-VERIFIED-LIVE-2026-06-03`).

---

## Founder elects the item at open

The Layer-1 seam is Wired-inert + Verified-in-sandbox; A11b reaches **Verified** once the Layer-3 seam is hardened too. This prompt is scoped to the **Layer 3 prose seam** (the default — the remaining half of A11b). If you'd rather take a different item this session, say so at open and the AI re-scopes:

* **A11b Layer 3 seam** — prompt-injection defence at `generateProse` (Critical; ~1 session) — this prompt's default. Completes A11b → Verified.
* **A11b flag-ON TEST adversarial probe** — the live verification that moves the Layer-1 seam (and, if done after the Layer-3 build, both seams) from Verified-in-sandbox to **Verified-live**. Walked live per PR17. Can be combined with the Layer-3 build's verification in one TEST run.
* **A12 — OpenTelemetry GenAI instrumentation + call-grain audit** (Elevated; ~1–2 sessions) — folds in agentic-commerce finding F4 (AC10/AP2 alignment) at session-open per the findings tracker.
* **A15a — R17c genuine deletion endpoint** (Critical; ~1 session) — replaces the 503 placeholder; depends on A10's identity discrimination.
* **A19 — Abuse-detection + rate-limiting** (Elevated; ~1 session) — depends on A10.

**Recommendation:** the **Layer 3 seam** next (completes A11b across both LLM seams), then one combined flag-ON TEST adversarial probe over both seams.

## Where this sits (one paragraph)

A11b hardens the two LLM-touching seams of the translation-sandwich against prompt injection. The **Layer 1 seam** (feature extraction) is done this arc: a deterministic, no-LLM `injection-defence.ts` module + a `buildLayer1UserMessage` refactor, wired into `extractFeatures` behind the UNSET flag `SUBSTRATE_INJECTION_DEFENCE_ENABLED` (production byte-identical), with a 57-assertion adversarial suite incl. the safety invariant (distress still fires under an injection wrapper). The **Layer 3 seam** (prose generation) is the remaining half: the prose model (`generateProse` in `layer3-prose.ts`) reads the Layer 2 assessment, whose free-text "evidence quote" fields originate from Layer 1's extraction of untrusted user input — so an injection smuggled into those quotes is the "injection-into-prose" vector. The defence is already partly built: `neutraliseFreeText` (a pure, R7-safe, free-text-sanitising copy function) was written + unit-tested in the Layer-1 session, ready to apply at the Layer 3 input boundary.

## Why this session matters

Layer 3 is the second and last LLM seam of the sandwich (Layer 2 is deterministic and closed). Hardening it — proven on the `/api/reason` path first (PR1), with the A5.4 distress-injection path explicitly preserved — **closes Phase-1.5 gap G6 (T3-13 + T3-14) entirely** and is a precondition for opening the substrate to external plugin traffic.

## Pre-conditions (founder confirms at open; AI verifies by read)

1. The A11b Layer-1 files are committed + pushed; Vercel green. Confirm `D-A11B-LAYER1-INJECTION-DEFENCE-WIRED-INERT-2026-06-03` is in `/operations/decision-log.md` and `injection-defence.ts` + the test + the `extractFeatures` wiring are on `main`. (Founder confirmed committed/pushed/green at the end of the Layer-1 session.)
2. Production unchanged from the Layer-1 close: `SUBSTRATE_INJECTION_DEFENCE_ENABLED` UNSET; `PLUGIN_INSTALL_AUTH_ENABLED` UNSET; all four R20a flags `true`; `SUBSTRATE_LAYER3_ENABLED` UNSET (`/api/substrate/layer3` → 503); `/api/reason` byte-identical.
3. No Layer-3-seam work has begun — confirm by scanning the decision log for any entry after `D-A11B-LAYER1-INJECTION-DEFENCE-WIRED-INERT-2026-06-03`.
4. TEST-env reminder (for any live run this session): `npm run dev` reads `website/.env.development.local`, which overrides `.env.local` and points at the TEST project (`iwdtrvuphogkwmovhnvz`). Production `.env.local` (`jdbefwkonfbhjquozgxr`) must never be the dev target.

## Part A — Open under the protocol

Read in order:

1. `/adopted/standing-protocol-cache.md` (~3 min — tier, model selection, risk class, signals, status vocabulary, the AI-failure-modes table).
2. `/adopted/build-sessions-protocol-cache.md` (the "no current users" note — CCP step 3 is N/A while it holds).
3. `/operations/handoffs/founder/2026-06-03-A11b-layer1-injection-defence-close.md` (predecessor close — what was built, the safety-invariant logic, production state).
4. `/adopted/substrate-plugin-staging-plan.md` §A11b (the Layer 3 half) + the Stage-1 dependency + risk-profile lines.
5. The live Layer 3 source (the surfaces this session hardens):
   - `website/src/lib/translation-sandwich/layer3-prose.ts` — `generateProse` (the live Sonnet prose call on `/api/reason`), `generateFallbackProse`, the per-consumer system prompt, `validateLayer3` / `Layer3ValidationError`.
   - `website/src/lib/substrate/layer3-service.ts` — `applyLayer3Injections` / `generateLayer3Response` and the **A5.4 R20a distress pass-through injection** (the safety-critical part of Layer 3; currently dormant because `SUBSTRATE_LAYER3_ENABLED` is UNSET).
   - `website/src/lib/translation-sandwich/parallel-run.ts` — `runSandwichInner` lines ~686–765 (where `generateProse` is called and where `applyLayer3Injections` is gated).
6. `website/src/lib/translation-sandwich/injection-defence.ts` — the module built last session; reuse `neutraliseFreeText`, `detectInjection`, `scanFreeTextFields`, `isInjectionDefenceEnabled`, the fence helpers.
7. `/operations/decision-log.md` last 2–3 entries.

**Confirm at open:** tier (`code-critical`; Critical); hold-point status (P0 0h active); model selection per the cache (Layer 3 = Sonnet/DeepModel — cite the AC1 "Layer 3 translation (alt-3)" row; the injection defence itself is deterministic, no LLM); status vocabulary; signals + risk class; PR6 ENGAGED; PR1, PR2, PR10, PR15, PR17 engaged. Narrate before substantive work: where we are in the arc (Layer-1 seam Wired-inert + Verified-in-sandbox; Layer-3 seam next completes A11b); what's queued behind A11b (A12/A13/A15a/A19); what's awaiting the founder vs the AI.

## Part B — Procedure (Critical Change Protocol governs throughout)

### Step 1 — PR15 consult + threat model + design lock (no code yet)
Consult `.claude/skills/anthropic/` + `/operations/agentic-commerce-findings-downstream-order.md`; summarise inline (note F4 targets A12, not this session). Produce a short threat model for the Layer 3 seam: the injection-into-prose vector (assessment free-text "evidence quote" fields — originating from untrusted user input via Layer 1 — steering the prose model) and consumer-context contamination (future plugin consumers' context). State what "defended" means: Layer 3 output is already schema-validated (`validateLayer3` + the "every claim must be supported by the assessment" composition contract); the residual is sanitising the assessment's free-text inputs before the prose call. Lock the small design decisions: where the sanitisation sits (recommend: apply `neutraliseFreeText` to a COPY of the assessment fed to `generateProse`, behind the same `SUBSTRATE_INJECTION_DEFENCE_ENABLED` flag — NOT mutating the stored assessment, preserving R7); how a detected injection is handled (neutralise-and-flag, consistent with the Layer-1 election); and **how the A5.4 distress-injection path is preserved** (the deterministic R20a pass-through runs after `generateProse` and operates on its own injected text, not the assessment free-text, so they must not conflict — prove it). Present; founder confirms before code. PR1: the `/api/reason` `generateProse` path is the proof surface.

### Step 2 — Build the Layer-3 defence on the one surface (PR1; PR2)
Apply the free-text sanitisation at the `generateProse` input boundary behind the flag (reuse `neutraliseFreeText`; factor any new pure logic per PR2). Add adversarial unit tests covering injection-into-prose patterns, including **the safety invariant for Layer 3**: a distress-bearing assessment (or one carrying the A5.4 distress signal) still produces the correct distress/redirect content through the prose path with the defence on. Grep the call path to confirm the sanitisation is actually invoked in the seam, not just defined. Keep the OFF path byte-identical.

### Step 3 — Critical Change Protocol (visible, before any deploy/flag flip)
Complete all six 0c-ii steps in the conversation: (1) what is changing — plain language; (2) what could break — specific failure modes (e.g. "over-aggressive sanitisation alters a legitimate quote in the prose" / "a bypass leaves the prose seam exposed"); (3) existing sessions — "N/A, no current users"; (4) rollback — gate behind the same unset flag, default off, so the seam is byte-identical until flipped (or revert the commit if additive); (5) verification — the founder's checks; (6) explicit founder approval specific to the named risks. **Default: commit inert / behind the unset flag**, exactly like the Layer-1 seam — the founder elects whether/when to enable and run live TEST adversarial probes.

### Step 4 — Verify
Per the 0c framework + the working test forms in `/CLAUDE.md` (plain `npx tsx` for Supabase-free tests). `tsc --noEmit` clean. PR2 call-path grep. Classify findings per PR10 diagnostic-certainty. If a live TEST adversarial run is elected (recommended: one combined run over BOTH seams now that both are built), walk it live per PR17 against the TEST override, never production.

### Step 5 — Decision-log entry (full Critical form)
Include the Layer-3 safety-invariant verification (the A5.4 distress pass-through still fires under the defence) and a perimeter note (AC5 — assess whether the change touches the R20a perimeter or is adjacent).

### Step 6 — Session close (full Critical form)
Verification Method Used, Risk Classification Record, PR5 Knowledge-Gap Carry-Forward, Founder Verification (Between Sessions), Orchestration Reminder. State production state explicitly. Name the next session (the flag-ON TEST adversarial probe to take A11b to Verified-live, or A12) + its pre-conditions. Mark A11b → Verified (both seams) once this lands.

## What is NOT in this session

* Flag activation (`SUBSTRATE_INJECTION_DEFENCE_ENABLED=true`) in production — a separate future Critical step (live TEST adversarial probe + CCP); do not bundle.
* A10 production activation, `SUBSTRATE_LAYER3_ENABLED` activation, retiring `PLUGIN_AUTH_SECRET` — each its own future Critical step.
* A12/A13/A15a/A19 — they queue behind A11b unless the founder elects one of them as this session's item instead.

## Rollback path

The Layer-3 defence lands inert (behind the unset flag, or as additive validation off by default) → nothing to roll back at commit. If enabled and it misbehaves: unset `SUBSTRATE_INJECTION_DEFENCE_ENABLED` + redeploy, or revert the commit. The CCP supplies exact commands in-session.

## Forecast

Most likely: the threat model + design lock are agreed; the Layer-3 free-text sanitisation is wired at the `generateProse` boundary behind the existing flag, adversarially unit-tested (incl. the A5.4 distress-path safety invariant), Verified-in-sandbox, and committed inert — taking **A11b to Verified across both seams**. Optionally, a single combined flag-ON TEST adversarial probe over both seams (walked live, PR17) takes A11b to Verified-live. The parallel legal/insurance (FPE) track and lawyer engagement remain worth starting whenever you choose — they gate the eventual marketplace launch on wall-clock, not build pace.

End of prompt. Opens on `main`. Critical-tier; the full Critical Change Protocol governs any deploy or flag flip; throwaway TEST data only.
