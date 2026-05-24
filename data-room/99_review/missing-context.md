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
