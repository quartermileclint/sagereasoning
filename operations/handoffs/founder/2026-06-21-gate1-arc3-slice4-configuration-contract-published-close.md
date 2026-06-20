# Session Close — 2026-06-21 — Gate-1 Arc 3 / Slice 4: the per-configuration "Gate 1" contract language published

**Stream:** founder.
**Governing frame:** /adopted/session-opening-protocol.md (cached via /adopted/standing-protocol-cache.md — lean templates).
**Tier:** `governance → code-elevated` — **Elevated** risk (public-facing contract docs, R18). AC7 not engaged; Critical Change Protocol not engaged; PR6 not engaged.
**Date:** 2026-06-21.
**Decision-log entry:** `D-SAGE-PRACTICE-GATE1-ARC3-SLICE4-CONFIGURATION-CONTRACT-PUBLISHED`.
**Governing design:** `adopted/adr/2026-06-20-pre-decision-harness-arc2.md` (ADR-011 §Slice 4) + `D-SAGE-PRACTICE-GATE1-SURFACE-HONESTY-OPTION2-DIFFERENTIATION` (the source for the language).

## What happened

The last held piece of the Gate-1 surface-honesty arc shipped. Slice 3b satisfied the mentor's binding constraint (the harness is real — the `pre_decision_harness` marker was proven issuable + readable live), so the held **per-configuration "Gate 1" contract language** could finally be published without a forward-claim.

The language names the two honestly-distinct configurations that share the "Gate 1" name:
- **Gate 1 — pre-decision** (developer-controlled surfaces — the Claude Code Gate-1 plugin/hook; an Agent-SDK wrapper named "planned"): the harness fires the examination *before* the agent reasons; a write under an operator-issued harness credential reads `examination_mode: "pre_decision_harness"`.
- **Gate 1 — post-decision (check)** (hosted / discretionary API surfaces): the examination runs *after* the agent's judgement as an honest developmental check; reads `post_decision_check` (the default).

`examination_mode` on `GET /api/accreditation/{agent_id}` is named the **sole unforgeable distinguisher** between them.

**Procedure (per the prompt):** drafted the language from the Option-2 decision (Step 1) → surfaced the full draft for founder sign-off **before touching any public surface** (Step 2, the R18 governance gate) → founder approved as drafted → applied to the three live surfaces (Step 3) → verified (Step 4) → decision-log + this close (Steps 5–6).

**Three honesty constraints baked in (load-bearing):**
1. `pre_decision_harness` presented as the configuration a developer-controlled harness *earns* — **no claim of adoption** ("does not assert that any particular agent has adopted the harness"); the SDK wrapper named "planned," not shipped.
2. The post-decision check is **never** presented as pre-decision framing (explicit: a hosted/discretionary write "always reads `post_decision_check` (or `null`), never `pre_decision_harness`").
3. Consistent with + cross-referencing the **live attestation-limit note** (`examination_mode` is an attestation, not a cryptographic proof of timing).

## Decisions Made
- `D-SAGE-PRACTICE-GATE1-ARC3-SLICE4-CONFIGURATION-CONTRACT-PUBLISHED` appended (+~30 lines). Option-2 honest differentiation is now complete end-to-end — mechanism (the harness, Arc 2) + credential (`examination_mode`, Arc 1) + public contract (this session).

## Status Changes
| Item | Old | New |
|---|---|---|
| Per-configuration "Gate 1" contract language | Held (staged, not applied — `drafts/…docs-staged.md` §"Out of scope") | **Verified (in repo); Live on the founder's push** (R18) |
| Gate-1 surface-honesty arc (Arcs 1–3) | Arc 3 outstanding | **Complete** (mechanism + credential + public contract) |
| `agent-card.json` extensions | 13 | **14** (`gate1-configurations/v1`) |

## Next Session Should
There is **no required next slice** for the Gate-1 surface-honesty arc — it is complete. Two longer-horizon items remain, neither this session's scope and neither blocking:
- **Standing harness onboarding** — real plugin distribution into a genuine developer loop + a standing operator credential that re-earns `pre_decision_harness` for real use (Slice 3b proved the mechanism then smoke-tore-down the proof; no standing marker credential exists). Note: the Slice-3a plugin's `/plugin install` was never live-tested (no `/plugin` in the desktop build) — that live verification is part of this onboarding.
- **The 0h launch call** — the founder's; this arc was pre-0h trust-layer honesty work and does not touch it.

## Blocked On
**Files changed this session (founder commits by name):**
- `website/public/llms.txt` — new `### Gate 1 — the two configurations (pre-decision vs post-decision check)` subsection.
- `website/public/.well-known/agent-card.json` — new `gate1-configurations/v1` extension (13 → 14).
- `website/src/app/api-docs/page.tsx` — new "Two Gate-1 configurations" note.
- `operations/decision-log.md` — the Slice-4 entry.
- `CLAUDE.md` — production-state block refresh (PR18, as-of 2026-06-21).
- `operations/handoffs/founder/2026-06-21-gate1-arc3-slice4-configuration-contract-published-close.md` (this close).

**Pre-existing uncommitted changes** carried in the tree from prior sessions (the founder's call whether to fold or commit separately): the 3a/3b harness + benchmark + handoff edits noted in the 3b close (`harness/gate1-pre-decision/*`, `operations/benchmarks/…/2026-06-16/*`, the 3a close + the prompts, `website/tsconfig.tsbuildinfo`).

**Production state at session close:** production **runtime** is byte-equivalent to the Slice-3b end-state (Arc 1 Live: `SUBSTRATE_EXAMINATION_MODE_ENABLED=true`; no standing marker credential/row). The docs go **live on the founder's push** (R18). **No Vercel/Supabase/flag/schema change this session.** 0h remains held.

## Open Questions
None.

## Founder Verification
```
cd "/Users/clintonaitkenhead/Claude-work/PROJECTS/sagereasoning"
node -e "const c=JSON.parse(require('fs').readFileSync('website/public/.well-known/agent-card.json','utf8')); console.log('extensions:', c.capabilities.extensions.length)"   # expect: extensions: 14
( cd website && npm run build )   # expect: ✓ Compiled successfully; /api-docs registered; exit 0
grep -c "Gate 1 — the two configurations" website/public/llms.txt          # expect: 1
git add website/public/llms.txt website/public/.well-known/agent-card.json website/src/app/api-docs/page.tsx operations/decision-log.md CLAUDE.md operations/handoffs/founder/2026-06-21-gate1-arc3-slice4-configuration-contract-published-close.md
git commit -m "Gate-1 Arc 3 Slice 4: publish per-configuration 'Gate 1' contract language (Elevated/R18); Option-2 honest differentiation complete end-to-end"
```
Then push via GitHub Desktop. **Vercel:** the `page.tsx` edit is in the build graph, so the deploy rebuilds `/api-docs`; `llms.txt` + `agent-card.json` are static public files served as-is. The docs are live once the deploy is green.

## Cross-references
- `/operations/decision-log.md` — `D-SAGE-PRACTICE-GATE1-ARC3-SLICE4-CONFIGURATION-CONTRACT-PUBLISHED`
- `operations/handoffs/founder/2026-06-21-gate1-arc3-slice4-publish-gate1-contract-language-NEXT-SESSION-PROMPT.md` (this session's prompt)
- `operations/handoffs/founder/2026-06-21-gate1-arc2-slice3b-first-pre-decision-harness-issued-live-close.md` (predecessor)
- `adopted/adr/2026-06-20-pre-decision-harness-arc2.md` (ADR-011 §Slice 4)
- `D-SAGE-PRACTICE-GATE1-SURFACE-HONESTY-OPTION2-DIFFERENTIATION` + `drafts/D-gate1-surface-honesty-option2-honest-differentiation.md`
- `drafts/sage-practice-examination-mode-docs-staged.md` (§§1–3 live; §"Out of scope" now published)

*End of session close. The two "Gate 1" configurations are honestly documented on the public surfaces — Option-2 honest differentiation complete end-to-end; the Gate-1 surface-honesty arc (Arcs 1–3) is done. Standing harness onboarding + the 0h launch call remain, neither blocking.*
