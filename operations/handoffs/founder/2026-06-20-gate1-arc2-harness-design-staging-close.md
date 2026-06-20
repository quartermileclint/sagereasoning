# Session Close — 2026-06-20 — Gate-1 Arc 2: harness design adopted + build staged

**Stream:** founder.
**Governing frame:** /adopted/standing-protocol-cache.md (Lean templates).
**Tier:** `governance` — Standard risk. Documents only; no code/schema/flag/production change.
**Date:** 2026-06-20.
**Mode:** Cowork. Design decision + build staging — the second session dated 2026-06-20 (the first was the Arc 1 activation close).

## Decisions Made
- `D-SAGE-PRACTICE-GATE1-ARC2-HARNESS-DESIGN-ADOPTED` appended (lean form). The pre-decision harness design is **Adopted as ADR-011**; four founder elections locked.
- **Election 1 — adopt:** promote the design now (not refine) → ADR-011.
- **Election 2 — first surface:** prove the **Claude Code plugin + hook** surface first (PR1 single-surface proof); the Agent SDK surface follows after it reaches Verified.
- **Election 3 — fail-mode:** default **fail-open with an honest log**; configurable to strict (fail-closed).
- **Election 4 — marker issuance:** `pre_decision_harness` is earned by an **operator-minted credential** carrying the `examination_enforcement: pre_decision_harness` provenance marker (the Arc-1 unforgeability root); a consumer-installed harness without it reads `post_decision_check`.

## Status Changes
| Item | Old | New |
|---|---|---|
| Pre-decision harness design | Scoped (draft) | **Adopted (ADR-011)** |
| `drafts/sage-practice-pre-decision-harness-design.md` | Draft (non-governing) | Retained as research basis; governed by ADR-011 |
| Harness implementation | — | **Scoped** (build staged into 4 `code-critical` slices) |
| `pre_decision_harness` marker | Un-issued (Arc 1) | Un-issued (first issued at Slice 3) |

## Anthropic-native check (PR15 / PR11 / PR12) — recorded
All three load-bearing primitives re-confirmed current at adoption (2026-06-20): `UserPromptSubmit` (fires before the model, injects `additionalContext`, can block); plugins (bundle hooks + `.mcp.json` + manifest, auto-register on install; marketplace-add does not auto-install — user runs `/plugin install`); Agent SDK (hooks-first four-layer pipeline + `canUseTool`, no pre-loop step → orchestrate in code). No bespoke substitute (PR15). Exact wire contracts deferred to Slice 1 (PR11/PR12); robust `command`/curl path does not depend on the unconfirmed `http` handler.

## Next Session Should
**Slice 1 — the `UserPromptSubmit` framing hook (the PR1 single-surface proof).** `code-critical` per the staging (Critical Change Protocol; honest note in the prompt — Slice 1 is TEST-only, the genuine AC7 triggers arrive at Slice 3). Build the hook (fast `assessment_first`, fire-once guard, fail-open-with-honest-log default), open with first-hand wire-contract verification, prove on one TEST fixture with an `sr_prac_` credential, reach Verified. Prompt: `operations/handoffs/founder/2026-06-20-gate1-arc2-slice1-framing-hook-NEXT-SESSION-PROMPT.md`. Est. ~2.5–3 hours.

## Blocked On
**Files remaining uncommitted (the founder commits by name):**
- `adopted/adr/2026-06-20-pre-decision-harness-arc2.md` (NEW — ADR-011)
- `drafts/sage-practice-pre-decision-harness-design.md` (status line → "Adopted as ADR-011")
- `operations/decision-log.md` (`D-SAGE-PRACTICE-GATE1-ARC2-HARNESS-DESIGN-ADOPTED`)
- `operations/handoffs/founder/2026-06-20-gate1-arc2-slice1-framing-hook-NEXT-SESSION-PROMPT.md` (NEW)
- `operations/handoffs/founder/2026-06-20-gate1-arc2-harness-design-staging-close.md` (this file)

**Production state at session close (PR18):** **No production change this session** (documents only). Everything Live before this session is unchanged: Arc 1 `examination_mode` Live; `SUBSTRATE_EXAMINATION_MODE_ENABLED=true`; `pre_decision_harness` un-issued. **`CLAUDE.md` was intentionally NOT edited** — no production state changed, and it is a governing entry-point document (founder-approval preference); its existing as-of 2026-06-20 block already lists Arc 2 as carried. Say the word if you want a one-line "Arc 2 design adopted" note added to it.

## Open Questions
None blocking. Carried to Slice 1: the exact `UserPromptSubmit` wire contracts + the `http`-handler question (PR11/PR12, verified first-hand at build).

## Founder Verification
```
cd "/Users/clintonaitkenhead/Claude-work/PROJECTS/sagereasoning"
git add adopted/adr/2026-06-20-pre-decision-harness-arc2.md \
        drafts/sage-practice-pre-decision-harness-design.md \
        operations/decision-log.md \
        operations/handoffs/founder/2026-06-20-gate1-arc2-slice1-framing-hook-NEXT-SESSION-PROMPT.md \
        operations/handoffs/founder/2026-06-20-gate1-arc2-harness-design-staging-close.md
git commit -m "Gate-1 Arc 2: adopt pre-decision harness design (ADR-011) + stage build slices"
```
Then push via GitHub Desktop. No build/deploy expected — documents only; Vercel will rebuild from the push but no behaviour changes. (If GitHub Desktop reports a stale `.git/index.lock`, run `rm -f ".git/index.lock"` first — the Cowork sandbox cannot clear it.)

To verify the substance independently: open `adopted/adr/2026-06-20-pre-decision-harness-arc2.md` and confirm §Decision D1–D7 match your four elections and §Staged build lists Slices 1–4 + the later SDK surface.

## Cross-references
- operations/handoffs/founder/2026-06-20-gate1-arc1-examination-mode-ACTIVATION-close.md (Arc 1 activation close — predecessor)
- adopted/adr/2026-06-20-pre-decision-harness-arc2.md (ADR-011 — the adopted design)
- operations/handoffs/founder/2026-06-20-gate1-arc2-slice1-framing-hook-NEXT-SESSION-PROMPT.md (next session)
- /operations/decision-log.md — `D-SAGE-PRACTICE-GATE1-ARC2-HARNESS-DESIGN-ADOPTED`
- drafts/sage-practice-pre-decision-harness-design.md (research basis)
- operations/benchmarks/sage-practice-v1/runs/2026-06-20/arm1-predecision-and-reflect-findings.md (the motivating evidence)

*End of session close. Stable, known-good state: ADR-011 adopted, build staged (Slice 1 first, PR1), no production change; `pre_decision_harness` stays un-issued until Slice 3. The 0h launch call remains the founder's.*
