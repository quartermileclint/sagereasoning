# Session Close — 2026-05-26 — Sage Practice Direction (Exploration + Substrate Consultation)

**Stream:** founder.
**Governing frame:** `/adopted/standing-protocol-cache.md` + `/adopted/build-sessions-protocol-cache.md` ("no current users" holds).
**Tier:** `governance` — **Standard** risk. Documentation + exploration only. **No code / schema / env / deploy touched.** Critical Change Protocol NOT engaged. PR6 NOT engaged.
**Date:** 2026-05-26 (the L2-complete/L4/L6 build portion was 2026-05-25 and is already committed — see its own close; this exploration continued the next day).
**Branch:** `main` (AI did no git operations).

## What this session did

After the positive-matrix build closed (2026-05-25, committed), the founder opened an **exploration arc** ("explore", not "build") on product direction. It produced findings, an adopted product name, an adopted design principle from a Stoic-Brain consultation, and a set of recommendations — all recorded in `D-SAGE-PRACTICE-DIRECTION-COVERAGE-STATUS-2026-05-26`.

The arc, in order:
- **Guardrail-as-product** — can SageReasoning govern Claude Code / Cowork agents via an anchor file + skills? **Finding (PR11-verified):** the deterministic gate is a **hook** (PreToolUse), not CLAUDE.md (soft anchor) or skills (model-discretion). Anchor = intent, skill = capability, hook = the gate.
- **Dashboard** — feasible, Cowork-first (a live artifact); the agent scores already exist in `agent_accreditation`. A mockup of the six founder-brainstormed panels was produced.
- **Accreditation under toggling + at scale** — the grade/history persist (count-windowed, no decay), but toggling creates blind spots; and at millions-of-agents scale the firehose is `evaluated_actions` + window read-amplification, with **inference cost — not storage — the dominant ceiling**.
- **Distribution** — surveyed all channels (REST / discovery / MCP / SDK / plugins / skills / hooks / open-source Layer 1 / badge / marketplace) and three packaging granularities (atomic / bundle / platform). The tested combinations are valid standalone bundles; **Sage Practice is the platform-granularity packaging**.
- **Stoic-Brain consultation** — the founder put the toggle-vs-credential-honesty question to the private mentor and adopted its verdict (below).

## Decisions Made

- `D-SAGE-PRACTICE-DIRECTION-COVERAGE-STATUS-2026-05-26` appended. **Adopted:** (1) **"Sage Practice"** = the umbrella product encompassing Sage Calling, SageReasoning, Sage Assent, Sage Reflect; (2) the **honest toggle/credential design** — a `coverage_status` field (`continuous | suspended | resumed_unverified`, `monitored_since`, `gap_present`, `gap_duration`, `credential_basis`); credential `suspended` on guardrail-off, `resumed_unverified` on return, requiring a fresh SageReasoning pass before it is valid; a dated, scoped verdict, not binary pass/fail (R18f at the re-entry condition). Findings F1–F5 + distribution/scale recommendations recorded; **distribution go-to-market remains founder-elected**.

## Status Changes

| Item | Old | New |
|---|---|---|
| Product name for the four-product suite | (candidate plugin name) | **"Sage Practice" — Adopted** (decision status) |
| Toggle/credential honesty design | open question | **Adopted design principle** (`coverage_status`); implementation deferred to its own build session |
| Sage Assent `coverage_status` field | — | **Scoped** (implementation status; code-elevated/critical when built) |
| 2026-05-25 accreditation-continuity analysis | as stated | **Refined** — data persists; credential *validity* now gated (suspended/resumed_unverified) |

## Next Session Should

Proceed down the sequenced queue in `/operations/handoffs/founder/2026-05-26-sage-practice-spec-sequence-NEXT-SESSION-PROMPT.md` (this session's new prompt, which supersedes the two earlier 2026-05-25 prompts). Session 1 = Priority 4 disclaimer + Combination 2 (clears a hard dependency; no test env). Sessions 2–4 follow (C2 → control-vs-treatment rig → the **Sage Practice guardrail + dashboard spec**, now carrying the adopted `coverage_status` design, the distribution posture, and the scale posture). The distribution go-to-market is a pre-P1 posture decision the founder owns.

## Blocked On

**Files remaining uncommitted (stage by name — do NOT `git add .`):**
- `operations/decision-log.md` (the new `D-SAGE-PRACTICE-DIRECTION-COVERAGE-STATUS` entry)
- `operations/handoffs/founder/2026-05-26-sage-practice-exploration-close.md` (this close)
- `operations/handoffs/founder/2026-05-26-sage-practice-spec-sequence-NEXT-SESSION-PROMPT.md` (the new prompt)
- **Superseded (left in place; AI can delete on your say-so):** `operations/handoffs/founder/2026-05-25-whole-system-next-scope-NEXT-SESSION-PROMPT.md` and `2026-05-25-outstanding-sequence-to-guardrail-spec-NEXT-SESSION-PROMPT.md`.

**Production state at session close:** **UNCHANGED.** No code / schema / env / deploy touched. `/api/reason` byte-identical; provenance gate Live; local dev on production (restored 2026-05-25).

## Open Questions

- Distribution go-to-market not elected (recommendations only).
- Sage Practice packaging granularity (atomic / bundle / platform mix) — decide before building any channel.
- `agent_id` identity model + credential `expires_at` handling across long gaps — for the Session-4 spec.
- Whether `coverage_status` warrants its own ADR at implementation time.

## Founder Verification

No code this session — nothing to run. To verify the record: read `D-SAGE-PRACTICE-DIRECTION-COVERAGE-STATUS-2026-05-26` in the decision log and the new prompt; confirm the Sage Practice definition and the `coverage_status` design read as you intend.

**Commit (host-side, stage by name):**
```
cd "/Users/clintonaitkenhead/Claude-work/PROJECTS/sagereasoning"
git add \
  operations/decision-log.md \
  "operations/handoffs/founder/2026-05-26-sage-practice-exploration-close.md" \
  "operations/handoffs/founder/2026-05-26-sage-practice-spec-sequence-NEXT-SESSION-PROMPT.md"
git commit -m "Sage Practice direction: name adopted (4-product suite) + coverage_status honest-credential design (Stoic-Brain consult); distribution/scale findings + recommendations recorded (D-SAGE-PRACTICE-DIRECTION-COVERAGE-STATUS). governance/Standard; no code/env/deploy."
```
Then push via GitHub Desktop. No Vercel impact (docs only).

## Cross-references

- `/operations/decision-log.md` — `D-SAGE-PRACTICE-DIRECTION-COVERAGE-STATUS-2026-05-26` (+ `D-L2COMPLETE-L4-L6-POSITIVE-SCENARIOS-BUILD-2026-05-25`)
- `/operations/handoffs/founder/2026-05-26-sage-practice-spec-sequence-NEXT-SESSION-PROMPT.md` (the new sequenced prompt)
- `/operations/handoffs/founder/2026-05-25-L2complete-L4-L6-finish-positive-scenarios-build-close.md` (the build close)

*End of session close. Stabilised to a known-good state: exploration findings + the Sage Practice direction recorded, the honest-credential design adopted (implementation deferred), production unchanged, the next sequence prompt ready. No code was written or run this session.*
