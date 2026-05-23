# Next-Session Prompt — C Phase 2: ATL → Sage Assent docs / registry rename

**Stream:** founder.
**Tier:** opens at **`governance`** (Phase 2 — docs / registry / internal prose). Standard risk. Re-declare if the elected bite differs (Phase 3 = `code-critical`; E#1 = `code-elevated`).
**Governing frame:** `/adopted/standing-protocol-cache.md` + `/adopted/build-sessions-protocol-cache.md` ("no current users" holds — founder + test logins only).
**Predecessor session close:** `/operations/handoffs/founder/2026-05-23-C-phase1-rename-close.md` (Phase 1 internal-identifier rename — built, Verified, committed, pushed, Vercel-green).
**Predecessor decision-log entry:** `D-TRACK-FOLLOWONS-C-PHASE1-RENAME-2026-05-23`.
**Deliverable-of-the-day (read in full):** `/drafts/2026-05-23-track-followons-design-pack.md` **§Track C** — the impact-map + phased plan (read the Phase-2 rows + the "(C) Docs/governance/registry" and "(D) Public-facing" inventory).
**Risk classification:** **Standard** under 0d-ii (documentation / registry / internal prose; no external/wire surface, no schema, no deploy, no auth/safety logic). `component-registry.json` is a `registry` update (Standard). Critical Change Protocol NOT engaged for Phase 2.

## Locked decisions (from the 2026-05-23 gate — do not re-litigate)
- **Full internal + external rename:** "Sage Assent" replaces "Agent Trust Layer" / "ATL" everywhere — phased.
- **`D-ATL-*` decision-log IDs are IMMUTABLE** — historical anchors; do **NOT** rename them anywhere (in the log, in code comments, or in docs). New entries use the new name. Renaming them breaks cross-references.
- **Phase 1 is DONE + Verified:** the internal code identifiers (the six `sage-assent-*` files + tests, the `security.ts` write-credential symbols + the two `kind:'sage_assent_*'` log tags, SR-15 proximity naming) are renamed and live in `main`.
- **Phase 3 (external / wire-format + public copy) stays its own dedicated Critical session** — see the deferral list below.

## Carried-forward items from Phase 1 (decisions still open)
- **`trust-layer/` directory rename — DEFERRED.** It is a repo-root source-of-truth directory **outside website's tsconfig root**, with a `tsc`-invisible cross-boundary import (`mentor-profile-adapter.ts` → `../../../trust-layer/`) and a KEEP-IN-SYNC ported mirror at `website/src/lib/substrate/trust-layer/`. Renaming it carries a verification blind spot (`tsc` will not catch a broken cross-boundary import). If elected, it needs its **own** step: rename the root dir + the mirror together, update the relative imports, and compensate for the `tsc` blind spot with a manual import-grep (confirm no `trust-layer` import path remains) + the runtime suite. **Not part of Phase 2 by default.**
- **`mode:'atl_wrapper'` Layer-3 render-mode discriminant — needs classification.** It flows through `philosophical-mode-service.ts` / `agent-mode-service.ts` / the renamed iteration-patterns module and is asserted in several suites. Before any rename, classify it: pure internal dispatch (safe, Phase 1/2-style) vs a parameter/wire contract a caller supplies (Phase 3). **Do not rename until classified.**

## Why this session matters
Phase 1 retired "ATL" in the live code. Phase 2 brings the **governance + docs + registry + internal prose** into line, so the project's own records call the thing by its real name ("Sage Assent" / "Character Kernel" per R18a) — without touching the external wire-format or the immutable decision IDs. It is the low-risk middle phase: no code behaviour changes, so the verification bar is "founder reads the changed docs + `tsc` stays 0 + suites stay green (comment-only code edits don't change behaviour)."

## Pre-conditions (confirm at open)
1. Working tree clean; Phase 1 committed + pushed (done); Vercel green (done); no `.git/index.lock` (if GitHub Desktop complains of "another process," close/reopen it).
2. Production unchanged: `SAGE_REFLECT_ENABLED=true`; `MENTOR_ENCRYPTION_KEY` set; substrate A7 Verified; A10 Live+Verified; Sage Calling Live (gated); Sage Reflect Live/Verified (gated; A-track migrations run); Layer-3 + R20a substrate gates UNSET.
3. `cd website && npm install` if a clean checkout (tsx is a devDependency).

## Part A — Open under the protocol
Read in order:
1. `/adopted/standing-protocol-cache.md` (~3 min — tier, model selection, risk class, signals, status vocab).
2. `/adopted/build-sessions-protocol-cache.md` (~3 min — build-arc context; "no current users").
3. `/operations/handoffs/founder/2026-05-23-C-phase1-rename-close.md` (predecessor — what landed + the carried-forward items).
4. `/operations/decision-log.md` — last 2 entries (`D-TRACK-FOLLOWONS-C-PHASE1-RENAME-2026-05-23`, `D-TRACK-FOLLOWONS-A-BUILD-2026-05-23`).
5. `/drafts/2026-05-23-track-followons-design-pack.md` §Track C — the phasing + the (C)/(D) inventory.

Confirm at open: tier; hold-point (P0 0h active); model selection (PR4 — **rename; no LLM calls; N/A**); status vocabulary; signals/risk class. **PR15 consult** (`.claude/skills/anthropic/` + `/operations/agentic-commerce-findings-downstream-order.md`) — record it; for a docs rename no Anthropic primitive substitutes, the load-bearing reuse is the project's own naming. **PR16 positioning lens:** Phase 2 is where the docs adopt the "Character Kernel" / "Sage Assent" naming (R18a) — flag positioning impact.

## Part B — The work
**Surface the day's bite at open and let the founder elect.** Recommended bite = **C Phase 2 (docs/registry)**. Alternatives the founder may elect instead: **C Phase 3** (external/wire-format — CRITICAL, full Critical Change Protocol, its own session), **E#1** (persist the Agent-Card verdict — `code-elevated`, ~1 short session), or one of the carried-forward items (the `trust-layer/` folder rename, or classifying `mode:'atl_wrapper'`). State the election at open.

### If C Phase 2 is elected — scope
Rename "Agent Trust Layer" / "ATL" → "Sage Assent" (preserving every `D-ATL-*` ID verbatim) across:
- `manifest.md`
- `/adopted/project-instructions-snapshot.md`
- the `adopted/*-design.md` corpus (e.g. `adopted/atl-a10-design.md`, the `adopted/substrate-modes/agent-trust-layer-wrapper-spec.md` spec — consider renaming the spec **file** too and updating the code comments that reference its path)
- `drafts/`
- handoffs (scope to the relevant/recent ones; historical handoffs may be left)
- `website/public/component-registry.json` (the two "Agent Trust Layer" entries — `registry` update)
- the project-context data: `website/src/data/project-context.json` + `project-context-compiled.ts` (the mission-statement "The Agent Trust Layer extends the moral community…" + the `agent_trust_layer:` key) — positioning copy
- the **internal code comments / prose** left in Phase 1 ("Agent Trust Layer" / "ATL Wrapper" descriptions in the `sage-assent-*` files, `score-architecture.ts`, `layer1-extractor.ts`, etc.) — comment-only; preserves the `D-ATL-*` IDs and the `/trust-layer/` path mentions (the folder isn't renamed yet)

**Do NOT touch in Phase 2 (Phase 3 / immutable / deferred):**
- the `sr_atl_` token value, the `atl_write` **DB purpose** scope value, the `Bearer sr_atl_` runtime checks (Phase 3)
- the published `website/public/.well-known/agent-card.json` (incl. `tokenPrefix`, the extension URI, and the brand line at `:137`) (Phase 3)
- the 3 public-copy UI surfaces: `limitations/page.tsx:114`, `ops-hub/page.tsx:894`, `guardrail/route.ts:44` (Phase 3)
- the `mode:'atl_wrapper'` discriminant (classify first)
- the `trust-layer/` directories (deferred)
- every `D-ATL-*` decision ID (immutable)

**Cache-drift discipline:** if a governed surface changes (manifest, `project-instructions-snapshot.md`, or either cache), update the affected cache **in the same session** and log a `D-CACHE-DRIFT-RESOLVED-…` entry per the standing cache's update discipline.

### Verify
Docs: founder reads the changed governing docs (0c "Business document" / "Manifest change" rows). Registry: `component-registry.json` stays valid JSON. Code comments: `npx tsc --noEmit` → 0 and the affected suites stay green (comment-only edits change no behaviour). Confirm by grep that no `D-ATL-*` ID was altered.

### Decision-log + close (lean)
Append a lean `D-…-C-PHASE2-…` entry; write the lean close per `/adopted/standing-protocol-cache.md`. If the session ends mid-arc, the close's "Next Session Should" names Phase 3 (Critical) or the next elected bite.

## Part C — Anticipated session shape (Phase 2)
| Phase | Estimate |
|---|---|
| Caches + predecessor close + design-pack §C read | 15–20 min |
| Map the docs/registry/prose surface (grep, classify) | 20–30 min |
| Rename pass (docs + registry + project-context + internal comments; preserve `D-ATL-*`) | 45–75 min |
| Verify (founder doc-read list + tsc 0 + suites green + `D-ATL-*` untouched grep) | 15–25 min |
| Decision-log + close (+ any cache-drift entry) | 20–30 min |
| **Total** | **~2–2.5 hours** |

## Rollback path
Docs/registry/comment edits are reversible by reverting the commit; no runtime behaviour changes (the wire-format, DB scope, and credential surface are all untouched until Phase 3).

## Forecast
Success = "Agent Trust Layer" / "ATL" retired across the project's governance, docs, registry, and internal prose (with `D-ATL-*` IDs preserved), leaving only the external/wire-format + public copy for the dedicated **Phase 3 Critical** session. After Phase 2, the remaining C work is Phase 3; then the locked order returns to **E** (E#1 — persist the Agent-Card verdict — being the one pre-launch item). The two carried-forward decisions (the `trust-layer/` folder rename; the `mode:'atl_wrapper'` classification) are surfaced at open for the founder to slot in. The founder elects each session's bite at open.

End of prompt. Opens as a `governance` Phase-2 docs/registry session (re-declare to `code-critical` for Phase 3, or `code-elevated` for E#1). Baseline: C Phase 1 + A-track Live/Verified (gated), Vercel green — stable known-good.
