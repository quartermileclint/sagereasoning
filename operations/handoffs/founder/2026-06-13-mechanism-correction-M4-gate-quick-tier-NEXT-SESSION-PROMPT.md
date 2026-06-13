# Next-Session Prompt — Mechanism-Correction Build M4: gate + quick-tier session (CI-8 + CI-9 + CI-10 + CI-16)

**Stream:** founder. **Model:** Fable 5, maximum reasoning effort (arc default). **Environment:** Claude Code on the founder's machine; TEST Supabase for live verification; founder-performed steps walked live per PR17.
**Tier:** `code-standard` (CI-8 meta-field honesty as drafted; CI-9 diagnostic-only) + `code-elevated` (CI-10 billing surface; CI-16 deterministic engine change on Live routes). **Standing guards (unchanged):** any touch of auth surfaces, the R20a branch/distress classifier, the A5 wrapper, or zone logic reclassifies Critical; **no production flag/config activation inside the build** (each is its own 0c-ii step).
**Governing frame:** `/adopted/standing-protocol-cache.md` + `/adopted/build-sessions-protocol-cache.md`. PR10 PEV (CI-9 is **diagnostic-first** — founder ack before any "resolved" claim); PR1 single-endpoint proof (CI-16 proven on `/api/reason` quick first, the gate inherits second); PR2 same-session wire-verification.
**Predecessor close:** `operations/handoffs/founder/2026-06-13-mechanism-correction-M3-accreditation-close.md`.
**Predecessor decision-log entries:** `D-MECHANISM-CORRECTION-M3-ACCREDITATION-BUILT-TEST-VERIFIED-2026-06-13`, `D-MECHANISM-CORRECTION-BUILD-PLAN-APPROVED-2026-06-12`.

## Why this session matters

The at-action gate (`/api/guardrail`) is the practice's at-action discipline, and the P1 test found its **verdicts sane but its envelope degraded** (B9): a stale competitor-anchored price still reported in meta (FX-14), an unexplained 20,015ms-vs-46ms latency split both labelled `ai_generated` (FX-15), and the gate's LLM cost loop-unmetered (FX-16). CI-8/9/10 make the gate's telemetry honest. **CI-16** is the one engine-touching item: the Q5 mentor verdict (adopted) requires `quick` depth to perform a **minimal value classification** (the object of the operative passion: genuine good / genuine evil / indifferent) before returning a verdict — without it `quick` is a *screen*, not an examination, and "what distinguishes Stoic examination from generic emotional regulation" is not true at every tier. All four serve launch readiness under any 0h branch.

## The approved queue (work top-down; this prompt scopes M4)

| # | Session | Items | Status |
|---|---|---|---|
| 1 | M1 — consult-path levers | CI-1 + CI-17, CI-2 + CI-3 | **Verified (TEST) 2026-06-13; production inert** |
| 2 | M2 — mint session | CI-6 + CI-7 | **Verified 2026-06-13** (CI-6 live on the M2 push) |
| 3 | M3 — accreditation session | CI-11 + CI-12 + CI-4 write-boundary half | **TEST-Verified 2026-06-13; production inert** |
| **→ 4** | **M4 — gate + quick-tier session (THIS PROMPT)** | **CI-8 + CI-9 + CI-10 + CI-16** | Standard ×2 + Elevated ×2 |
| 5 | M5 — practice-completion session | CI-4 (reason-route half) + CI-13 + CI-15 | Elevated |
| 6 | M6/M7 — trajectory persistence | CI-5 | Standard schema + Elevated |
| 7 | M8 — credential consolidation design | CI-14 (design only) | Standard |

**Independent of this queue (founder may elect any time, each its own 0c-ii step):** the M1 activation (six-item checklist in the M1 decision-log entry); the M3 CI-11 production migration + CI-4 flag activations (M3 decision-log entry).

## Pre-conditions

1. The M3 close commit pushed; Vercel green. The M3 deploy is **behaviourally inert** (flags unset, no migration) — newly minted/written ids now validate against the shared vocabulary on the write boundary, and the store refuses an unreadable agent_id; no other behaviour change.
2. `npx tsc --noEmit` passes at open.
3. TEST Supabase available (`.env.development.local`). For a CI-10 live leg the founder mints via the CI-7 CLI (`website/scripts/mint-credential.ts`).
4. The AI does no git operations; founder commits by name at close.

## Part A — Open under the protocol (read order)

1. `/adopted/standing-protocol-cache.md` + `/adopted/build-sessions-protocol-cache.md`
2. This prompt; the M3 close
3. Build plan items **CI-8 + CI-9 + CI-10 + CI-16 in full** (`operations/p1-rebuild-2026-06/mechanism-correction-build-plan.md`)
4. Fresh analysis **FX-14, FX-15, FX-16** (§3.8) **+ FX-4** (§3.2, the quick-tier latency context); dossier rows **B9, B3** (B3 is amended per Q5 — the quick-tier value classification is the adopted methodology CI-16 implements)
5. **Path-check discipline (carried from M2/M3 — verify before citing):** the stale cost constant is at **`website/src/lib/response-envelope.ts:91-92`** (NOT `src/lib/substrate/`); the gate route is **`website/src/app/api/guardrail/route.ts`** (risk-class→depth map at ~`:96-103`, `standard→quick`); locate the Option-D loop telemetry (`loop_billing_events` + `X-Loop-*` headers) emitters the consult path already uses and confirm the gate's path before wiring CI-10; for CI-16, **confirm the quick-tier Layer-1 extraction already carries the value features the classification needs** (the L1 schema is depth-independent in design — verify in `layer1-extractor.ts` / `layer2-mechanisms.ts` `value_assessment` before wiring) — if it does not, STOP and surface it (the value classification cannot be added without its inputs).
6. KG scan: KG1 (CI-10 DB write on `loop_billing_events`); KG2/AC1 (CI-16 — quick depth is Haiku per the cache model table; confirm the added classification stays within Haiku's reliability boundary, else the depth/model mapping is in tension); PR4 model selection cited for CI-16.

Confirm at open: tier; hold-point (0h HELD); status vocabulary; signals.

## Part B — Procedure

### Step 1 — CI-9: gate latency-variance diagnostic (Standard; **diagnostic-first, PR10**)
A **bounded diagnostic, not a fix.** Instrument/replay the gate path in TEST to determine whether the 46ms `ai_generated` verdict was a cache hit, a mislabelled fallback, or something else; report with diagnostic-certainty signalling (`Diagnostic-certain` / `Diagnostic-uncertain — symptom level`). Produce a one-page note naming the mechanism with evidence. **Founder acknowledgement is required before any "resolved" claim**; any actual fix is a follow-on item with its own risk class (do not fix in this step). Doing CI-9 first informs whether CI-8's cost field can honestly report a measured value.

### Step 2 — CI-8: retire the stale `$0.0025` gate-meta constant (Standard)
`response-envelope.ts:91-92` stops reporting the retired sage-guard competitor-anchored price. Gate meta either reports the **measured/billed** cost (if CI-10 lands the metering this session) or **omits `cost_usd`** with an honest field note. No verdict-path change. Grep the docs/marketplace/mcp-contract strings for `0.0025` and reconcile any that quote it (R18 honesty lineage, S8b corrections).

### Step 3 — CI-10: gate loop metering — `X-Loop-*` on `/api/guardrail` (Elevated)
The gate's LLM cost joins the Option-D loop telemetry the consult surface already emits (`loop_billing_events` row + `X-Loop-*` headers). **Flag-gated metering write** (unset = today's behaviour). PR1: prove on `/api/guardrail`. KG1: the new DB write is awaited, no fire-and-forget, no self-call. **Exclude this session's TEST metering rows from billing-tuning samples** (the M2/leg-B precedent).

### Step 4 — CI-16: quick-tier minimal value classification (Elevated; **PR1 — `/api/reason` quick first, gate inherits**)
The engine's `quick` depth adds **one deterministic classification** before returning a verdict: *is the object of the operative passion a genuine good, a genuine evil, or an indifferent (selective value noted)?* — a minimal M8 read against the value hierarchy, **not** the full standard-tier assessment. **Flag-gated** (unset = today's 3-mechanism quick). Prove on `/api/reason` quick first; the gate (`standard-risk → quick`) inherits automatically — verify in-session. **Engine determinism must hold** (same input → byte-equal output; assert it). If the founder ever elects *not* to ship this, the mentor's named alternative (rename `quick` → *screening* and credential it as the lesser claim) is a bigger surface and is **not** this item.

### Step 5 — Tests
Plain-assertion `tsx` per CLAUDE.md: CI-16 classification unit coverage (good/evil/indifferent against the value hierarchy) + the determinism assertion; CI-10 metering-row shape + header presence (flag-on) and byte-identity (flag-off); CI-8 meta no longer carries `0.0025`. CI-9 is the diagnostic note, not a test.

### Step 6 — Verify (PR2, founder-walked where environment-touching)
`npx tsc --noEmit`; tests; TEST live legs as elected: a quick consult with a passion present returns the value-classification field (pre-flag shows today's shape); a gate call returns `X-Loop-Cost` headers with a matching `loop_billing_events` row (SQL); gate meta no longer reports `0.0025`. Production untouched (flag activations are founder-elected 0c-ii steps).

### Step 7 — Close (lean) + decision log (lean) + PR18
Status changes as earned; production-state rewrite at close only; write the **M5 prompt** (practice-completion: CI-4 reason-route half + CI-13 default-on reflect + CI-15 two-gate cadence docs) per the queue.

## What is NOT in scope

Any production flag/config activation (CI-10 + CI-16 flags, the M1 + M3 activations — all founder-elected 0c-ii); CI-9's actual fix (diagnostic only this session); the R20a perimeter / distress classifier / A5 wrapper / zone logic / auth surfaces; the engine's **scope** mapping (B3 methodology — only the Q5 value-classification *addition* is in play, not a re-scope of which mechanisms run at each depth); methodology of any other kind; the 0h call.

## Rollback

CI-8: `git revert` (meta-field local). CI-9: n/a (diagnostic). CI-10: flag-gated metering write or `git revert` (additive). CI-16: flag-gated mechanism step (unset = today's quick) or `git revert`.

## Anticipated session shape

| Phase | Estimate |
|---|---|
| Open + reads (incl. value-feature pre-check) | 20–25 min |
| CI-9 diagnostic (replay + note) | 30–45 min |
| CI-8 meta honesty + doc grep | 20–30 min |
| CI-10 gate metering (flag-gated) | 40–50 min |
| CI-16 quick-tier classification (PR1 + determinism) | 45–60 min |
| Tests + TEST live legs (founder-walked) | 30–40 min |
| Close + M5 prompt | 25–30 min |
| **Total** | **~3–4 h** |

## Forecast

Success looks like: the gate's diagnostic note names the latency mechanism with evidence (founder-acked); gate meta no longer reports a retired price; the gate's LLM cost is loop-metered behind a flag; `quick` performs a genuine-if-compressed value examination behind a flag, proven on `/api/reason` and inherited by the gate, with determinism intact; the M5 prompt ready. The B9 gate-envelope trio and the Q5 quick-tier amendment are then built (production activation remaining a separate founder election).

End of prompt. Open on `main`; production untouched except by founder election; founder performs every environment-touching step live (PR17); nothing activates without 0c-ii.
