# 99 — Missing-Context List (seed)

What we don't yet have. This is precisely what the later build/harness sessions fill. Each entry names the gap and which session is expected to close it.

---

## M-1 — No end-to-end loop fixtures

- **Gap:** there is no fixture set that drives a full Calling → Reasoning → Assent → Reflect journey. Each product has unit fixtures; the *loop* has none.
- **Closes in:** the manual-loop session (Step 7) produces the first hand-built journey; the harness session turns it into reusable fixtures.

## M-2 — No "one real agent journey" dataset

- **Gap:** no single, coherent dataset representing one agent travelling the whole loop (the input that would exercise all four seams in order).
- **Closes in:** the manual-loop session captures it into `05_outputs/`.

## M-3 — No behavioural whole-system baseline (golden output)

- **Gap:** `00_baseline/` now records the **environment/status** baseline, but there is no **behavioural** baseline — no captured "this is the correct end-to-end output for journey X" to diff future runs against.
- **Closes in:** the manual-loop session produces the first golden output; the harness pins it.

## M-4 — The dependency rule is enforced — ✅ RESOLVED (2026-05-24)

- **Status:** **RESOLVED 2026-05-24.** The configuration rule (manifest **R18f** — no credential without examination — and **R19e** — configuration honesty; Adopted 2026-05-23, P1) is now **enforced in production**.
- **What closed it:** the **enforcement gate** (option (a) — server-side Ed25519 verification at the credential write boundary, `/adopted/adr/2026-05-23-sage-assent-sagereasoning-dependency-enforcement.md`) was built, wired, and verified in the 2026-05-24 Critical build session, then deployed Live behind `SUBSTRATE_PROVENANCE_GATE_ENABLED='true'`. A token-authenticated credential write with no genuine SageReasoning provenance is rejected at the write boundary: no `provenance` field → **422 `bad_provenance`**; forged/tampered provenance → **403 `no_examination`**. Verified in production 2026-05-24.
- **Effect on the test:** the headline Combination-1 negative test (`04_test_brief/` A.2 / S2-neg) flips from *documented gap* → **passing assertion**.
- **Rollback note:** enforcement is flag-gated; unsetting `SUBSTRATE_PROVENANCE_GATE_ENABLED` + redeploy returns to pre-gate behaviour (which would re-open this gap). Independent of this data-room session.
- **Residual (does not re-open M-4):** the *aggregate-faithfulness* limitation remains — see **M-6**. Option (a) proves *a* genuine substrate signature exists, not that the submitted aggregate was faithfully computed from signed assessments. M-4 covers only the no-examination door, which is now closed.
- **References:** `D-SAGE-ASSENT-PROVENANCE-GATE-BUILD-WIRED-VERIFIED-2026-05-24` (the build, on `main`); `D-DATA-ROOM-COMBINATION-1-PASSING-2026-05-24` (this update); `/operations/handoffs/founder/2026-05-24-sage-assent-provenance-gate-build-close.md`.

## M-5 — No automated whole-system harness

- **Gap:** no test runner exercises the loop. The existing per-product tests are plain-`tsx` assertion scripts; the harness extends that pattern (not greenfield) and adds `webapp-testing`/Playwright for the human front-end (brief §9).
- **Closes in:** the harness session (after the manual loop proves the pattern — PR1 + 0g manual-first).

## M-6 — Aggregate-faithfulness (named, deferred — not this room's job)

- **Gap:** even once option (a) is built, it proves *a* genuine substrate signature exists, not that the submitted aggregate was faithfully computed from signed assessments.
- **Status:** named + deferred (PR7) in the P1 ADR revisit-condition 1. A larger, separate problem (per-action signatures + server-side recomputation). Recorded here so the test brief doesn't over-claim what the eventual gate proves.

## M-7 — C2 R20a distress-perimeter coverage of the four product entries (diagnostic, 2026-05-27)

- **Origin:** C2 session Step 1 diagnostic (`2026-05-27-C2-r20a-distress-perimeter-NEXT-SESSION-PROMPT.md`). The v2 sequence says "submit distress at *each* product entry; assert redirect/pass-through." The four product entries the loop/harness drives are **not** the eight AC5 perimeter routes. This entry records, by code-read, the actual R20a coverage of each — the "hard truth" the prompt flagged.
- **Method:** code-read of the four route files + the AC5 registry (`src/lib/__tests__/r20a-invocation-guard.test.ts`) + `src/lib/substrate/r20a-gate.ts` (A7) + `src/lib/sage-reflect/zone3-boundary.ts`. Diagnostic-certainty noted per finding.

| Product entry | In AC5 eight? | Route-level guard (`enforceDistressCheck∘detectDistressTwoStage`)? | A7 substrate gate (`SUBSTRATE_R20A_GATE_ENABLED`)? | Content-based distress detection? | Proposed severity |
|---|---|---|---|---|---|
| `/api/reason` | **yes (#6)** | **YES** — imported + called, AC4 invocation-tested | **YES** — routes through `runSandwich`; A7 guards Layer 2; Branch 1.7 emits the `r20a_gate_redirect` 200 | **YES**, synchronous (PR3) | none — full coverage |
| `/api/calling` | no | **NO** — no import/call | **NO** — runs the deterministic calling engine (`computeAdvance`); no LLM, never enters `runSandwich`, so the A7 gate never executes | **NO** — the agent's free-text `response` is not screened | **significant** (my assessment) |
| `/api/practice/reflect` | no | **NO** — no import/call | **NO** — uses its own `reflect-extractor` Layer-1 path; A7 gate is wired only in `parallel-run.ts` | **PARTIAL / different mechanism** — has its own SR-9 Zone-3 boundary, but `checkZone3Boundary` engages **only** on a developer-declared `safety_signal.harm_flagged === true` or an `acts_blocked` entry with `category==='harm'`. It is, by design, a deterministic boolean over a declared signal — **not** a content distress classifier | **significant** (my assessment) |
| `/api/accreditation/[agent_id]` | no | **NO** — route + `provenance-gate.ts` headers document "AC5 R20a perimeter NOT engaged: no distress surface" | **NO** | **N/A — no free-text human-distress surface** (the `provenance` payload is a signed-assessment object, not an impression) | **not-a-gap / cosmetic** — already named honestly |

- **Diagnostic-certain — root cause identified:** for all four, the AC5 route-guard presence/absence and the A7-gate routing are confirmed by direct code-read (grep of `detectDistressTwoStage`/`enforceDistressCheck` call sites; the A7 gate appears only in `parallel-run.ts`).
- **Diagnostic-uncertain — pattern level:** whether content-based R20a detection was ever *intended* for the three agent-facing entries is not confirmed. The AC5 registry's own rationale excludes agent-facing endpoints "because they process agent output, not human distress input." `/api/calling`, `/api/practice/reflect`, `/api/accreditation` are all A10-credentialed **agent-facing** surfaces. So their absence from the human-distress perimeter is **consistent with AC5's stated design** — but it means C2's literal cross-cutting property ("distress at *any* product entry is caught") holds for `/api/reason` and is **not** met content-wise on the other three. **Founder acknowledgement required** before treating this as resolved-vs-gap.
- **`zone3-boundary.ts` self-flag:** the file already records its harm-flag carrier as a "Diagnostic-uncertain (symptom-level)" interpretation pending a founder-confirmable canonical harm-flag contract. That open item compounds this finding for `/api/practice/reflect`.
- **Severity assignment is the founder's call** (decision authority). The severities above are the AI's proposed assessment, not a verdict.
- **Out of scope to fix here:** adding content-based R20a detection to `/api/calling` or `/api/practice/reflect` would be adding routes/behaviour to the R20a perimeter — itself a **Critical** change under AC5 + PR6 + PR1, and explicitly *not* C2's job. C2 tests current coverage and exercises the A7 substrate gate (TEST-only).
- **Closes in:** acknowledged + severity-set by the founder at C2 close; any decision to extend the perimeter is a separate future Critical session.
