# Next-Session Prompt — Parked-2: Retire the last two parked internals — the `mode:'atl_wrapper'` discriminant rename **and** the `trust-layer/` directory rename

**Stream:** founder.
**Tier:** opens at **`code-elevated`** (the higher of the two bites; the discriminant rename alone would be `code-standard`/`code-elevated`, the directory rename is `code-elevated`). Re-declare if you elect only one bite at open.
**Governing frame:** `/adopted/standing-protocol-cache.md` + `/adopted/build-sessions-protocol-cache.md` ("no current users" holds — founder + test logins only).
**Predecessor session close:** `/operations/handoffs/founder/2026-05-23-parked1-atl-wrapper-classification-close.md` (Parked-1 — the classification that de-risked bite 1; Adopted/CLOSED).
**Predecessor decision-log entry:** `D-ATL-WRAPPER-CLASSIFICATION-INTERNAL-DISPATCH-2026-05-23` + its ADR `/adopted/adr/2026-05-23-atl-wrapper-discriminant-classification.md`.
**Deliverable-of-the-day (read in full):** the Parked-1 ADR (above) + `/drafts/2026-05-23-track-followons-design-pack.md` §C (the rename impact-map, the (A)/(B)/(C)/(D) categories) + the substrate files named in Part B.
**Risk classification:** **Elevated** under 0d-ii (the session as a whole). AC7 **not** engaged (no auth/credential/session/encryption logic changes — both bites are name/path renames that preserve behaviour). PR6 **not** engaged (neither bite touches the R20a distress classifier, Zone-2/Zone-3 logic, or their wrappers — the agent-mode renderer *contains* the R20a distress passthrough, but renaming the dispatch discriminant string does not alter that logic; the existing agent-mode-service test suite's distress assertions guard it). The founder may reclassify upward at any time.

## Why this session matters
These are the last two deliberately-parked internals from the Track C ATL→Sage Assent rename arc. Bite 1 (the `mode:'atl_wrapper'` discriminant rename) was gated on a classification that is now done — Parked-1 classified it **internal-dispatch**, so this rename opens at **Standard/Elevated**, not Critical. Bite 2 (the `trust-layer/` directory rename) was parked because a directory rename's cross-boundary import surface is partly invisible to `tsc` and needs grep-compensated verification. Doing both this session retires the parked-item backlog entirely — after this, "ATL"/"Agent Trust Layer"/`atl`/`trust-layer` naming is gone from live code, and future sessions move to a genuinely new task (you elect it at the next open).

## Locked context (do NOT re-litigate)
- **Track C is done end-to-end** (Phases 1+2+3 Verified; "ATL"/"Agent Trust Layer" retired from internal, governance, and external/wire/public surfaces). Credential prefix `sr_assent_`; DB scope `sage_assent_write`; agent-card extension `sage-assent-write-auth/v1`. The wrapper/bridge/iteration-pattern **files** were already renamed `sage-assent-*` in Phase 1.
- **Parked-1 is closed.** `mode:'atl_wrapper'` is **internal-dispatch** (`Diagnostic-certain`): the value is read only in the in-process dispatch `switch` (`philosophical-mode-service.ts:1524`); no `/api` route serializes the `AgentModeResponse` JSON; zero occurrences in `website/public/`; zero in any `.sql`. The classification holds *as of current production state*, with three wire-exposure revisit-conditions in the ADR. **If any revisit-condition has since fired (a route now serializes `AgentModeResponse`; the value is persisted; the value is published into a contract), STOP bite 1 and reclassify it Critical before renaming.** Confirm none has fired at open.
- Every `D-ATL-*` decision ID is **immutable** (historical anchors — do not rename them). The `version:'agent-mode-response-v1'` schema tag already uses "agent-mode", not "atl" — it does **not** need renaming. The symbol names `AgentMode*` / `renderAgentMode` already use "AgentMode" — they do **not** need renaming. **Only the discriminant string VALUE `'atl_wrapper'` is renamed in bite 1.**
- "No current users" holds.

## Pre-conditions (confirm at open)
1. Working tree clean; Parked-1 committed + pushed; Vercel green; no `.git/index.lock` (close/reopen GitHub Desktop if it complains). `.fuse_hidden*` is gitignored.
2. Production on the post-Parked-1 baseline (Parked-1 changed only `.md` files, so production is byte-identical to the post-E1 baseline): `discovery_sessions` at 12 columns; `SAGE_REFLECT_ENABLED=true`; `MENTOR_ENCRYPTION_KEY` set; substrate A7 Verified; A10 Live+Verified; Sage Calling Live (gated); `SUBSTRATE_WRITE_PATH_ENABLED='true'`; Layer-3 + R20a substrate gates UNSET.
3. `cd website && npm install` if a clean checkout (`tsx` is a devDependency).

## Part A — Open under the protocol
Read in order:
1. `/adopted/standing-protocol-cache.md` (~3 min — tier, model selection N/A, risk class, signals, status vocab).
2. `/adopted/build-sessions-protocol-cache.md` (~3 min — build-arc context; "no current users").
3. `/operations/handoffs/founder/2026-05-23-parked1-atl-wrapper-classification-close.md` (predecessor) + `/adopted/adr/2026-05-23-atl-wrapper-discriminant-classification.md` (the classification + its revisit-conditions).
4. `/operations/decision-log.md` last 2 entries (`D-ATL-WRAPPER-CLASSIFICATION-INTERNAL-DISPATCH-2026-05-23`; `D-SAGE-CALLING-E1-…`) + the Phase-3 entry `D-TRACK-FOLLOWONS-C-PHASE3-EXTERNAL-WIRE-2026-05-23` (the rename precedent: grep-for-consumers not just change-the-const; clean-cutover posture; immutable `D-ATL-*` IDs).
5. `/drafts/2026-05-23-track-followons-design-pack.md` §C (the impact-map; (A) internal identifiers).
6. The live code (read targeted):
   - Bite 1: `website/src/lib/substrate/philosophical-mode-service.ts` (`Layer3RenderMode` union ~`:208–211`; the dispatch `switch` ~`:1521–1539`); `website/src/lib/substrate/agent-mode-service.ts` (`AgentModeResponse.mode` `:315`; `AgentModeRenderResult.mode` `:353`; the JSON payload `:566`; the dispatch return `:913`); `website/src/lib/substrate/sage-assent-iteration-patterns.ts` (`ParallelCandidate.input` type `:364`).
   - Bite 2: grep the directory + its consumers at open (see Part B bite 2 step 1) — do not assume the file list.

Confirm at open: tier (`code-elevated`); hold-point (P0 0h active); model selection (**N/A** — no LLM, both bites are renames); status vocabulary; signals/risk class. **PR15 consult** (`.claude/skills/anthropic/` + `/operations/agentic-commerce-findings-downstream-order.md` — no Anthropic primitive substitutes for renaming this project's own internal identifiers; F1–F4 do not target these). **PR16 lens** (both renames complete the Sage Assent / Character Kernel (R18a) internal-naming cleanup; positioning-neutral but finishes the C-arc; dogfood relevance n/a). **PR10 PEV loop** engaged (code-elevated). **PR1/PR2** apply (verify in-session).

## Part B — The work
**Surface both bites at open and let the founder confirm the names + the sequence.** Recommended order = **bite 1 first** (smaller, de-risked, independent of bite 2), then bite 2. The founder may elect only one, or split bite 2 into its own session if it proves larger at open-scoping.

### Bite 1 — rename the `'atl_wrapper'` discriminant value (Standard, tsc-guarded)
1. **Confirm no Parked-1 revisit-condition has fired** (see Locked context). If one has, stop and reclassify Critical.
2. **Name decision (founder elects at open).** Recommended target: **`'agent_mode'`** — it parallels the other `Layer3RenderMode` members (`'philosophical'`, reserved `'standard'`/`'private'`), which are render-*mode* names; the symbols are already `AgentMode*` and the version tag is already `agent-mode-response-v1`, so `'agent_mode'` is the consistent value. Alternative: `'sage_assent'` (names the component, but reads oddly beside `'philosophical'`). State the choice; this is a PR16 positioning micro-decision.
3. **Rename every occurrence of the literal `'atl_wrapper'`** (grep `website/src` for `atl_wrapper` — ~9 non-test code sites + 3 test files as of 2026-05-23): the `Layer3RenderMode` union member; the dispatch `case`; the overload signature; `AgentModeResponse.mode`; `AgentModeRenderResult.mode`; the JSON payload const; the dispatch return; the `ParallelCandidate.input` intersection type; all comments naming `'atl_wrapper'`; the three test files (`agent-mode-service.test.ts`, `agent-hand-back-report.test.ts`, `sage-assent-iteration-patterns.test.ts`). Do **not** touch `version:'agent-mode-response-v1'`, the `AgentMode*` symbol names, or any `D-ATL-*` ID.
4. **Verify (PR2 immediate):** `cd website && npx tsc --noEmit` → 0 (the exhaustiveness guard at the dispatch `default` catches an incomplete union edit). Then the affected suites (one command at a time; the two that transitively import `supabase-server.ts` need `--env-file=.env.local` per CLAUDE.md):
   - `npx tsx --env-file=.env.local src/lib/substrate/__tests__/agent-mode-service.test.ts` (incl. the R20a distress assertions — must stay green)
   - `npx tsx --env-file=.env.local src/lib/substrate/__tests__/philosophical-mode-service.test.ts`
   - `npx tsx src/lib/substrate/__tests__/sage-assent-iteration-patterns.test.ts`
   - `npx tsx src/lib/substrate/__tests__/agent-hand-back-report.test.ts`
   Expected: tsc 0; all green; the DSP-1/DSP-4 assertions now reference the new value.
5. **Confirm the negative:** `grep -rIn "atl_wrapper" website/src` → no matches after the rename.

### Bite 2 — rename the `trust-layer/` directory (Elevated, grep-compensated)
1. **Scope at open (the path/surface was not confirmed in advance).** Grep first:
   - `grep -rIln "trust-layer" website/src` (as of 2026-05-23 ~34 files reference it — importers across `sage-assent-*`, `sage-reflect/*`, `mentor-profile-adapter.ts`, and the live `/api/accreditation/[agent_id]` route + its tests).
   - List the directory: `website/src/lib/substrate/trust-layer/` now holds `types/`, `grade-engine/`, `evaluation-window/`, `accreditation/` (incl. `public-endpoint.ts`), `card/`, `validation/`.
   - Check whether a root-level `/trust-layer/` (the original source-of-truth codebase, outside `website/`) still exists, and whether the website mirror's KEEP-IN-SYNC banners require the website directory structure to stay byte-identical to the root one. **This is the load-bearing design question:** renaming the website-side directory may break the "relative imports resolve verbatim against the root mirror" guarantee. Decide one of: (a) rename the website mirror only and update its banners to drop the structural-identity claim; (b) rename root `/trust-layer/` too (larger; the root is a separate codebase); (c) leave the directory name and accept it as the one residual `trust-layer` token (a legitimate "scope-down" outcome — record the decision).
   - Catch tsc-invisible references: `grep -rIn "import(\|await import\|['\"].*trust-layer" website/src` and any path strings, banners, or doc comments naming `trust-layer/`.
2. **Name decision (founder elects at open).** Candidates: `sage-assent-trust/`, `accreditation-engine/`, `assent-grade/`. Recommend stating the choice before moving files; this is a PR16 micro-decision.
3. **Execute (if elected):** rename the directory + update every import path + every KEEP-IN-SYNC banner + any path string. PR1 discipline: this is a single mechanical pass on a proven structure.
4. **Verify (grep-compensated, because `tsc` cannot see dynamic-import path strings / banner text):**
   - `cd website && npx tsc --noEmit` → 0.
   - Full substrate + translation-sandwich + accreditation-route suites green (one command at a time; `--env-file=.env.local` for the supabase-importing ones). The live `/api/accreditation/[agent_id]` route is a consumer — its test suite must stay green.
   - `grep -rIn "trust-layer" website/src` → only the intentionally-retained references remain (none, if you renamed root too; or only the residual if you elected (c)).
   - State a **PR10 diagnostic-certainty** signal on the verify: `Diagnostic-certain` only if grep + tsc + suites are all conclusive; otherwise `Diagnostic-uncertain — symptom level` and flag for founder acknowledgement.

### Decision-log + close (lean form)
Append a lean entry per `/adopted/standing-protocol-cache.md` §"Lean decision-log entry" recording: the two renames, the names elected, the directory design-decision (a/b/c), the grep-compensated verification result, and that the Track C internal-naming cleanup is now complete. New entries use the Sage Assent name; do not alter `D-ATL-*` IDs. **Cache-drift check:** neither cache nor the manifest references the literal discriminant value or the directory path → no cache update expected; confirm and state it. Write the lean session close (§"Lean session close"); note the parked-item backlog is now empty and the next session opens on a new task.

## Part C — Anticipated session shape
| Phase | Estimate |
|---|---|
| Caches + predecessor close + ADR + design-pack §C + targeted code reads | 25–35 min |
| Bite 1 — discriminant rename + verify | 30–45 min |
| Bite 2 — scope at open (grep + design decision) | 20–30 min |
| Bite 2 — directory rename + import updates + grep-compensated verify | 45–75 min |
| Decision-log + lean close | 20–30 min |
| **Total** | **~2.5–3.5 hours** (if bite 2 proves larger at scoping, split it — do bite 1 + scope bite 2, defer bite 2's execution) |

## Rollback path
Both bites are reversible: `git revert <commit>` + push → Vercel rebuilds to the pre-rename shape. No schema, no env, no deploy-config, no data. Zero live credentials/users → no runtime implications. If `tsc` or a suite fails mid-session, the rename is incomplete — finish or revert; do not commit a red tree.

## Forecast
Success = both parked internals retired: `'atl_wrapper'` renamed (recommended `'agent_mode'`) with `tsc` + the distress-guarding suite green, and the `trust-layer/` directory renamed (or its name consciously retained per design-decision (c)) with grep-compensated verification clean. After this, the Track C ATL→Sage Assent rename arc is **fully complete** — internal, governance, external, *and* the parked internals — and the next session opens on a new task (founder elects at open). If only bite 1 is elected, the `trust-layer/` rename remains the sole parked item.

End of prompt. Opens as a `code-elevated` two-bite rename on a stable known-good baseline (Parked-1 Verified/CLOSED; Track C complete; Vercel green; production byte-identical to post-E1).
