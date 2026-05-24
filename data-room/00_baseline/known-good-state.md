# 00 — Known-Good Baseline (Comparison + Rollback Anchor)

> **READ-ONLY. NEVER EXPERIMENT ON THIS FOLDER.** This is the snapshot of the
> system as it stood when the data room was built. Every test result in
> `05_outputs/` is compared *against* this. If a test ever appears to change the
> system, this is the state to restore to.

**Captured:** 2026-05-24 (room build), describing the post-P1 production baseline as of `main` = `e0278ab`.
**Source of truth for this snapshot:** the predecessor close `/operations/handoffs/founder/2026-05-23-P1-sage-assent-dependency-rule-close.md` ("Production state at session close") + `/CLAUDE.md` "Production state (as of 2026-05-14)" carried forward + the decision-log entries through 2026-05-23.

---

## Git / deploy anchor

| Item | Value |
|---|---|
| `main` HEAD | `e0278ab` — "P1 (2026-05-23): adopt Sage Assent → SageReasoning dependency rule (R18f) + configuration-honesty (R19e); enforcement-seam ADR …" |
| This room's branch | `whole-system-data-room`, branched from `e0278ab` |
| Vercel | Green (confirmed 2026-05-23) |
| Working tree at room build | Clean except the untracked P2 prompt + this new `data-room/` |

## Product status (0a implementation vocabulary)

| Product | Status | Live gate (production) |
|---|---|---|
| Sage Calling | **Live** (E#1 fix Verified 2026-05-23) | `SAGE_CALLING_ENABLED` |
| Sage Reasoning (substrate) | **A7 Verified** | `/api/reason` behaviour **byte-identical to pre-A7 cutover** |
| Sage Assent | **A10 Live + Verified** | `SUBSTRATE_WRITE_PATH_ENABLED='true'` |
| Sage Reflect | **Live / Verified** | `SAGE_REFLECT_ENABLED='true'` |

## Production environment-flag disposition (the safety-relevant part)

| Flag | Production state | Effect |
|---|---|---|
| `SUBSTRATE_WRITE_PATH_ENABLED` | `'true'` | Sage Assent credential write path (A10) is live |
| `SAGE_CALLING_ENABLED` | set (Live) | Sage Calling endpoint live |
| `SAGE_REFLECT_ENABLED` | `'true'` | Sage Reflect endpoint live |
| `SUBSTRATE_LAYER3_ENABLED` | **UNSET** | `/api/substrate/layer3` returns **503** |
| `SUBSTRATE_R20A_GATE_ENABLED` | **UNSET** | The substrate-side R20a server gate is off (R20a still enforced on the eight AC5 routes by the existing invocation guard) |
| `SUBSTRATE_LAYER2_SIGNING_ENABLED` | (per A3/A4 Verified) | Layer 2 signing operational; `/api/public-key` serves the steady-state Ed25519 shape (`previous: null`, `rotation_overlap_until: null`) |
| `SUBSTRATE_LAYER2_PREVIOUS_*` (4 vars) | **UNSET** | No key-rotation overlap window active |

## Known open items carried into this baseline (not defects of the room)

1. **Combination 1 is NOT structurally prevented today.** The option-(a) Ed25519 write-boundary gate is **Designed, not built** (P1 ADR `/adopted/adr/2026-05-23-sage-assent-sagereasoning-dependency-enforcement.md`). A holder of a valid `sr_assent_write` credential could POST a fabricated `accreditation_record` with no SageReasoning pass behind it, and the server would persist it. This is the headline gap the whole-system test **documents** (see `04_test_brief/`). Expected, per 0h — gaps are useful.
2. **Founder mentor-profile decrypt failure — OPEN.** Per `D-FOUNDER-HUB-MENTOR-PROFILE-DECRYPT-GUARD-2026-05-23`: the `/api/founder/hub` crash is guarded (degrades to no-profile, no 500), but the founder's `mentor_profiles` row remains undecryptable under the current `MENTOR_ENCRYPTION_KEY`. Out of scope for the whole-system test; recorded here only so the baseline is honest. Any key/decrypt change is Critical (R17f).

## What "unchanged" must mean after any future test

A whole-system test (run in a later session, against a **test** environment) must leave this production baseline **byte-identical**: same `main` HEAD, same Vercel deploy, same env-flag disposition, no writes to production Supabase tables. The test flag-config (`04_test_brief/test-flag-config.md`) is deliberately *different* from this production disposition — that difference is itself a safety control.
