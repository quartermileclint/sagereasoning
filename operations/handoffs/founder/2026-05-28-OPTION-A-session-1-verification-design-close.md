# Session Close — 2026-05-28 — Option A Build Arc, Session 1: Verification + Single-Catch Contract Design

**Stream:** founder.
**Governing frame:** `/adopted/standing-protocol-cache.md` + `/adopted/build-sessions-protocol-cache.md` ("no current users" holds) + `/adopted/adr/2026-05-27-r20a-configuration-perimeter-and-audience-contract.md` (Accepted).
**Tier:** `code-critical` arc — **this session is `governance` / Design risk** (read-only verification + a design deliverable; no production code path, schema, env, or deploy touched). Lean templates apply.
**Date:** 2026-05-28.
**Branch:** `main` (the AI did **no** git operations).
**Predecessor close:** `/operations/handoffs/founder/2026-05-27-r20a-config-perimeter-adr-adopted-close.md`.

## What this session did

1. **Opened under the protocol** — read the standing cache, build-sessions cache, the Accepted ADR in full, targeted manifest sections (§R20a, §AC2, §AC4, §AC5, §AC8), and the last four 2026-05-27 decision-log entries.
2. **Resolved the four ADR verification items by code-read** with diagnostic-certainty signals (PR12). Findings reproduced in `/drafts/2026-05-28-r20a-single-catch-contract.md` §1. **None changes the catch locus or gap set the ADR named — no ADR amendment required.**
3. **Drafted the single-catch contract + propagation flag design spec** at `/drafts/2026-05-28-r20a-single-catch-contract.md`. Specifies the single distress-catch contract (§2), the per-consumer Layer-3 audience contract (§3), the propagated flow-terminating `safety_signal` flag with canonical schema (§4), and the per-endpoint wiring plan (§5). Reuses A7, A5.4, A6 `prose_mode`, and Reflect's `safety_signal` carrier — no primitive rebuilt (PR15).
4. **Per-endpoint build order set** (founder direction in-session): Calling first, then Reflect-content, then Layer-3 audience rendering, then configuration-level invocation tests. Each per-endpoint wiring is a separate future Critical session under PR1 + the full Critical Change Protocol.

## Decisions Made (1 appended to the decision log this session)

- `D-R20A-SC1-SINGLE-CATCH-CONTRACT-DRAFTED-2026-05-28` — verification + design; spec at `/drafts/2026-05-28-r20a-single-catch-contract.md`; per-endpoint order Calling → Reflect-content → Layer-3 audience → config-level invocation tests.

## Status Changes

| Item | Old | New |
|---|---|---|
| ADR verification items (the four open from 2026-05-27) | Open | **Resolved by code-read** (Diagnostic-certain on items 1, 2-mechanism, 3, 4-path; Diagnostic-uncertain — pattern level on items 2-intent, 4-exact-shape) |
| R20a-SC1 design spec | — | **Drafted** in `/drafts/`; Under review |
| Calling-side R20a catch (substrate) | Unscoped | **Scoped** (next session — Critical; CCP at session open) |
| Reflect-content R20a catch (substrate) | Unscoped | **Scoped** (session after — Critical; CCP at session open) |
| Layer-3 audience rendering (A.3 audience contract + `/api/reason` agent-API fix) | Unscoped | **Scoped** (Session C — Critical) |
| Configuration-level invocation tests (AC4 across flows) | Unscoped | **Scoped** (Session D) |
| `SUBSTRATE_R20A_GATE_ENABLED` (TEST + prod) | UNSET | **UNSET (unchanged)** |

## Next Session Should

**Open the Option A build arc — session 2** (the first Critical session of this arc — Calling-side R20a catch + propagation). Pre-conditions before opening:

1. Founder reviews `/drafts/2026-05-28-r20a-single-catch-contract.md` and confirms (or amends) the design.
2. Founder confirms the founder-acknowledgement items: the audience-form gap on `/api/reason` is treated as a gap to correct, not as intentional (Finding 2); the canonical `SafetySignal` schema in §4.2 is acceptable (Finding 4).
3. AC5 registry verified for `/api/practice/reflect` (§7 open question #3) — affects whether Session B follows the ninth- or tenth-route protocol.

The next-session prompt for Session 2 (Calling-side wiring) is **not drafted in this session** — it is drafted at Session 2's open per the founder's preference, after the founder has reviewed the design spec.

## Carry-forward backlog (so nothing is forgotten)

| Item | When | Updated scope |
|---|---|---|
| **Option A session 2** (Calling-side R20a catch + propagation) | **NOW (next)** | Critical; PR1 single-endpoint proof. Wires `enforceLayer2R20aGate` into `/api/calling`'s handler; emits `safety_signal` per §4 of the design; renders per §3 (audience: `agent_developer`). Full CCP at session open. AC5 ninth-route protocol applies (Calling is new to the perimeter). |
| **Option A session 3** (Reflect-content R20a catch) | After session 2 Verified | Critical; PR1. Wires the catch into `/api/practice/reflect`'s pre-reflection step. CCP at session open. |
| **Option A session 4** (Layer-3 audience rendering + `/api/reason` agent-API fix) | After session 3 Verified | Critical. Builds the audience selector + render helper + the two `prose_mode` keys; fixes the human-framed-message gap on `/api/reason`'s agent API. CCP at session open. |
| **Option A session 5** (configuration-level invocation tests) | After session 4 Verified | Extends AC4 invocation testing to per-flow assertions. |
| **C2 live run (rescoped)** | After the Option A arc completes | Per `D-R20A-ADR-ADOPTED-SEQUENCING-2026-05-27`. **PR17:** the AI walks the founder through the TEST-env standup LIVE, step by step — not a one-line hand-off, not a checklist pointer. Optionally capture a pre-build baseline run first for before/after evidence. |
| **Session 3 — value-evidence rig** | After Option A arc + C2 live | Unchanged in nature; runs on a configuration-complete distress perimeter. |
| **M-7 severities + audit note** | At your convenience | Disposition is "being remediated under Option A," not "accepted gap." |
| **A7 production activation** | Separate future Critical | Carried from the A7 close #1; out of scope of the Option A arc. |
| **Cowork project-instructions panel paste-sync** | Before next session opens | Paste `/adopted/project-instructions-snapshot.md` into the Cowork project-instructions panel so PR1–PR17 is live in the operative surface. Pure founder action; off-repo. (Carried forward from the predecessor close; confirm whether done.) |

## Blocked On — single commit list (stage by name; do NOT `git add .`; never stage `website/.env.local*` or `website/tsconfig.tsbuildinfo`)

```bash
cd "/Users/clintonaitkenhead/Claude-work/PROJECTS/sagereasoning"
git add \
  drafts/2026-05-28-r20a-single-catch-contract.md \
  operations/decision-log.md \
  "operations/handoffs/founder/2026-05-28-OPTION-A-session-1-verification-design-close.md"
git commit -m "Option A build arc session 1: verification + single-catch contract design drafted. Four ADR verification items resolved by code-read (PR12); none changes the catch locus or gap set, so no ADR amendment required. Design spec at /drafts/2026-05-28-r20a-single-catch-contract.md specifies the single distress-catch contract (reusing A7), the per-consumer Layer-3 audience contract (audience: human_user | agent_developer; new prose_mode keys), and the propagated flow-terminating safety_signal flag with canonical schema reconciling Reflect's harm-flag carrier. Per-endpoint build order: Calling first, then Reflect-content, then Layer-3 audience rendering, then config-level invocation tests; each its own future Critical session under PR1 + full CCP. (D-R20A-SC1-SINGLE-CATCH-CONTRACT-DRAFTED-2026-05-28). Standard/governance + drafts/ design doc; no code/env/deploy."
```

Then push via GitHub Desktop. **No Vercel behaviour change** — design doc + decision-log entry + session close only. Production `SUBSTRATE_R20A_GATE_ENABLED` remains UNSET in Vercel.

**Production state at session close:** **UNCHANGED.** `/api/reason` byte-identical; provenance gate Live; `/api/substrate/layer3` → 503; `SUBSTRATE_R20A_GATE_ENABLED` UNSET in Vercel. Local dev still on **production** (the TEST standup is a deferred founder step — carried forward to the C2 live run after Option A).

## Founder Verification (between sessions)

Read the design spec end-to-end:

```bash
cd "/Users/clintonaitkenhead/Claude-work/PROJECTS/sagereasoning"
cat drafts/2026-05-28-r20a-single-catch-contract.md | less
```

Expected: spec opens with "Status: Drafted 2026-05-28"; §1 reproduces the four findings with diagnostic-certainty signals; §2 specifies the single catch (reusing A7's existing types unchanged); §3 specifies the audience contract with `audience: 'human_user' | 'agent_developer'`; §4 specifies the canonical `SafetySignal` schema; §5.1 names Calling first; §6 maps to manifest rules.

Confirm the decision-log entry:

```bash
grep -n "D-R20A-SC1-SINGLE-CATCH-CONTRACT-DRAFTED-2026-05-28" operations/decision-log.md
```

Expected: a match near the end of the active log, after the four 2026-05-27 entries.

Confirm the close:

```bash
ls "operations/handoffs/founder/2026-05-28-OPTION-A-session-1-verification-design-close.md"
```

Expected: the file exists.

**No live-system verification required this session** (production unchanged; no env, no Vercel).

## Open Questions

The five open questions in the design spec §7 (audience selector for plugin-internal calls; `suggested_user_message` rule; AC5 registry coverage of `/api/practice/reflect`; retiring the internal `distress_signal` on `Layer2Assessment`; `caught_at` enum extension). Each has a named revisit condition.

Two founder-acknowledgement items the next session needs (per the diagnostic-certainty signals on Findings 2 and 4):

- The audience-form gap on `/api/reason`'s agent API is treated as a gap to correct under A.3, not as intentional.
- The canonical `SafetySignal` schema in §4.2 of the design is acceptable as the carrier shape.

## Cross-references

- Decision log: `D-R20A-SC1-SINGLE-CATCH-CONTRACT-DRAFTED-2026-05-28`
- Design spec: `/drafts/2026-05-28-r20a-single-catch-contract.md`
- Parent ADR (Accepted): `/adopted/adr/2026-05-27-r20a-configuration-perimeter-and-audience-contract.md`
- Predecessor close: `/operations/handoffs/founder/2026-05-27-r20a-config-perimeter-adr-adopted-close.md`
- Predecessor decision-log entries (the three from 2026-05-27): `D-R20A-ADR-ADOPTED-SEQUENCING-2026-05-27`; `D-R20A-CONFIG-PERIMETER-OPTION-A-2026-05-27`; `D-C2-R20A-PERIMETER-DIAGNOSTIC-AND-HARNESS-2026-05-27`
- A7 substrate gate (the seed primitive): `/website/src/lib/substrate/r20a-gate.ts` + `/operations/handoffs/founder/2026-05-13-A7-r20a-gate-close.md`
- Seam map: `/data-room/03_seam_map/seam-map.md`
- Sage Reflect Zone-3 boundary: `/website/src/lib/sage-reflect/zone3-boundary.ts`

*End of session close. Stabilised to a known-good state: the four ADR verification items resolved by code-read; the single-catch contract + propagation flag design drafted in `/drafts/` reusing existing substrate primitives; per-endpoint build order set; production UNCHANGED. Next: the founder reviews the design spec; session 2 (Calling-side wiring; Critical; PR1; CCP) opens once review is complete.*
