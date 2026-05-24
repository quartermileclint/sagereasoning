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

## M-4 — The dependency rule is Adopted, but its enforcement gate is not built

- **Status update (since the brief was written):** the configuration rule is now **Adopted** — manifest **R18f** (no credential without examination) + **R19e** (configuration honesty), adopted 2026-05-23 (P1).
- **Remaining gap:** the **enforcement gate** (option (a) — server-side Ed25519 verification at the credential write boundary) is **Designed, not built** (`/adopted/adr/2026-05-23-sage-assent-sagereasoning-dependency-enforcement.md`). So the headline Combination-1 negative test **documents the open gap** today; it does not pass.
- **Closes in:** the **Critical** build session for the option-(a) gate (founder schedules it). That build turns the Combination-1 test from *documented gap* → *passing assertion*.

## M-5 — No automated whole-system harness

- **Gap:** no test runner exercises the loop. The existing per-product tests are plain-`tsx` assertion scripts; the harness extends that pattern (not greenfield) and adds `webapp-testing`/Playwright for the human front-end (brief §9).
- **Closes in:** the harness session (after the manual loop proves the pattern — PR1 + 0g manual-first).

## M-6 — Aggregate-faithfulness (named, deferred — not this room's job)

- **Gap:** even once option (a) is built, it proves *a* genuine substrate signature exists, not that the submitted aggregate was faithfully computed from signed assessments.
- **Status:** named + deferred (PR7) in the P1 ADR revisit-condition 1. A larger, separate problem (per-action signatures + server-side recomputation). Recorded here so the test brief doesn't over-claim what the eventual gate proves.
