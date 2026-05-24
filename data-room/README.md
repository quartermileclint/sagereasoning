# Whole-System Test — Data Room

**Status:** Scaffolded → Wired (2026-05-24). **Decision status:** n/a (this is a workspace, not a governing document). **Implementation status (0a):** the room is **Wired** — skeleton built, inventory + seam map + test brief populated. The *manual loop* (Step 7) and the *automated harness* are later sessions.
**Branch:** `whole-system-data-room` (off `main` at `e0278ab`). Kept off production-tracked `main` by design.
**Built per:** `/drafts/2026-05-23-whole-system-data-room-brief.md` §6 (the data-room structure) — the deliverable-of-the-day for this session.
**Governing frame:** `/adopted/standing-protocol-cache.md` + `/adopted/build-sessions-protocol-cache.md`. Tier: `governance` / **Standard** risk. **No production writes; no code/schema/env/deploy change.**

---

## What this room is (plain language)

Each of the four SageReasoning products has its own passing test suite and is individually Live or Verified. **What has never been tested is the *system*** — the four products working as one loop: the handoffs between them, the shared engine they all run on, the safety net across the whole journey, and the record a full journey leaves behind.

This room is the bounded, inspectable workspace where that whole-system test is prepared and (later) run. Following the "build the room before you write" discipline: inventory the sources, rank their authority, surface the conflicts, list what is missing — so the test is grounded in evidence, not guesswork (P0 0h: *evidence, not projection*).

## The four products as one loop ("Sage Practice")

| Stage | Product | Does | Status (0a) |
|---|---|---|---|
| 1 · pre-action | **Sage Calling** | Find the fitting work; hand a five-spec to the substrate | Live (gated `SAGE_CALLING_ENABLED`) |
| 2 · in-action | **Sage Reasoning** (substrate) | Examine the impression, reason it through | A7 Verified |
| 3 · at-action | **Sage Assent** | Credential or block the act; hold the agent's profile/badge | A10 Live + Verified |
| 4 · post-action | **Sage Reflect** | Review what occurred, update the profile, decide if purpose still fits | Live/Verified (gated `SAGE_REFLECT_ENABLED=true`) |

The loop closes: Reflect routes back to **Reasoning** (purpose holds) or to **Calling** (purpose complete / needs revision).

## How to navigate this room

| Folder | What's in it | Read it for |
|---|---|---|
| `00_baseline/` | The known-good state — production at session close; the comparison + rollback anchor. **Never experiment on this folder.** | "What was true before any test touched anything?" |
| `02_inventory/` | The four-product source inventory + **authority ranking** (which sources are current-authoritative vs stale). | "What exists, what's its real status, which sources can I trust?" |
| `03_seam_map/` | The four handoffs documented as the *things under test* — the room's centre of gravity. | "Where do the products connect, and where could a handoff drop?" |
| `04_test_brief/` | The configuration test matrix, success criteria per seam, the test flag-config, and a **founder-performable verification method (0c)** per row. | "What gets tested, what counts as a pass, and how do I check it without reading code?" |
| `05_outputs/` | Test-run results + observations. Empty until the manual loop runs (a later session). | "What did the test actually show?" |
| `99_review/` | The **conflict log** and the **missing-context list** — the honest record of disagreements between sources and of what we don't yet have. | "What's contested? What's missing?" |

> There is intentionally no `01_` folder — this mirrors the brief §6 structure exactly.

## The non-negotiable discipline

1. **`00_baseline/` is read-only.** It is the known-good comparison + rollback anchor. Nothing experiments on it.
2. **No production writes.** "No current users" holds — founder + test logins only. The real manual loop runs against a **test** environment with a **test** flag-config (see `04_test_brief/test-flag-config.md`), never the live system, because a real loop touches Sage Assent credential *writes*.
3. **Grounded in current-authoritative sources only.** The top-level guides are a **stale** source (see `02_inventory/`). The test is grounded in the May decision-log, the four adopted design docs, the code + test suites, and the SQL migrations.

## What this session built (and didn't)

**Built (Steps 1–6 of the brief):** the branch, the skeleton, the inventory + authority ranking, the seam map, the test flag-config, and the test brief with verification methods.

**Deliberately deferred to a follow-on session:**

- **Step 7 — run one manual founder-verified loop** (PR1 single-loop-proof; 0g manual-first). Best done in the **Code tab** against a test environment.
- **The automated harness** (built on `webapp-testing` / Playwright + the `sage-*` skills — brief §9).
- **The Critical build of the option-(a) dependency gate** — the build that turns the Combination-1 negative test from *documented gap* into *passing assertion* (see `04_test_brief/`).

## A note on the empty dirs at the repo root

Six empty folders (`00_baseline` … `99_review`) sit at the repository root from an initial mis-step before the room was nested here under `data-room/`. They are **empty, so Git does not track them** — they will not appear in any commit. They can be removed host-side at any time; they are harmless.
