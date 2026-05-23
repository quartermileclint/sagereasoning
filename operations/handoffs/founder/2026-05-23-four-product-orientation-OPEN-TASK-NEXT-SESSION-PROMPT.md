# Next-Session Prompt — Open Task (founder-provided at open) + Four-Product Whole-System Orientation

**Stream:** founder.
**Tier:** **declared at open once the founder states the task.** Until then the session is read-only orientation = `governance` / Standard. Re-declare the tier (and risk class per 0d-ii) the moment the task is known; if the task touches code/auth/safety, reclassify per the standing cache's risk table before any work.
**Governing frame:** `/adopted/standing-protocol-cache.md` + `/adopted/build-sessions-protocol-cache.md` ("no current users" holds — founder + test logins only).
**Predecessor session close:** `/operations/handoffs/founder/2026-05-23-parked2-renames-close.md` (Parked-2 — discriminant rename + `trust-layer/` retain; Adopted/CLOSED).
**Predecessor decision-log entries:** `D-PARKED2-DISCRIMINANT-RENAME-TRUST-LAYER-RETAIN-2026-05-23`; `D-ATL-WRAPPER-CLASSIFICATION-INTERNAL-DISPATCH-2026-05-23`; `D-SAGE-CALLING-E1-AGENT-CARD-VERDICT-PERSIST-2026-05-23`.

## Why this session matters

The founder will provide a task at open that spans the **full set of four products** — it will require understanding not just one product but how all four work, what has been tested in each, and how they connect and operate together as a single system. So this session opens with an **orientation pass before any task work begins**: read the three new inbox items, then build a true whole-system understanding of Sage Reasoning, Sage Assent, Sage Reflect, and Sage Calling. The AI must demonstrate that understanding back to the founder and confirm a ready state **before** the founder provides the task. Do not start building anything during the orientation — orientation is read-only.

## Locked context (do NOT re-litigate)

- **Track C ATL→Sage Assent rename arc is complete end-to-end** (internal + governance + external/wire + both parked internals). The parked-item backlog is **empty**. "ATL" / "Agent Trust Layer" survives only in immutable `D-ATL-*` decision IDs and the consciously-retained `trust-layer/` directory (recorded residual per `D-PARKED2-…-2026-05-23`).
- **"No current users" holds** — founder + test logins only.
- Naming: the four products are **Sage Reasoning**, **Sage Assent**, **Sage Reflect**, **Sage Calling**. Confirm each product's precise boundary from the users' guide + tech guide rather than assuming.

## Pre-conditions (confirm at open)

1. Working tree clean; Parked-2 committed + pushed; Vercel green; no `.git/index.lock` (the Parked-2 close noted a stale lock the sandbox left behind — if GitHub Desktop complains, close/reopen it, or `rm -f .git/index.lock` in a macOS Terminal). `.fuse_hidden*` is gitignored.
2. Production on the post-Parked-2 baseline (renames only — byte-identical runtime to post-E1): `discovery_sessions` at 12 columns; `SAGE_REFLECT_ENABLED=true`; `MENTOR_ENCRYPTION_KEY` set; substrate **A7 Verified**; Sage Assent **A10 Live+Verified**; Sage Calling **Live (gated by `SAGE_CALLING_ENABLED`)**; `SUBSTRATE_WRITE_PATH_ENABLED='true'`; Layer-3 + R20a substrate gates UNSET.
3. `cd website && npm install` if a clean checkout (`tsx` is a devDependency).

---

## Part A — Open under the protocol

Read in order:

1. `/adopted/standing-protocol-cache.md` (~3 min — tier, model selection, risk class, signals, status vocab).
2. `/adopted/build-sessions-protocol-cache.md` (~3 min — build-arc context; the "two front-ends, one substrate" architecture paragraph; "no current users").
3. `/operations/handoffs/founder/2026-05-23-parked2-renames-close.md` (predecessor).
4. `/operations/decision-log.md` — last 3 entries (the predecessor IDs above).

Confirm at open: hold-point (P0 0h active); status vocabulary (`Scoped → Designed → Scaffolded → Wired → Verified → Live`; `Adopted / Under review / Superseded`); signals + risk class. Model selection: **N/A for the orientation** (no LLM); declare it for the task once known, citing the cache's AC1 row.

---

## Part A (extended) — Orientation preparations (do these before awaiting the task)

### Step 1 — Read the three new inbox items (PR11 part (c))

Read in full, then apply the **PR13 consider-implications five-question assessment** to each (does it contradict / refine a prior decision; affect work in flight; affect future-stage work; affect operational discipline). The three items, newest first (added 2026-05-22):

1. `/inbox/using both cowork and code.txt` — on using Cowork mode and Claude Code together.
2. `/inbox/data room.rtf` — a data-room document (note: `.rtf` — read via the file tools; if it doesn't render cleanly, convert or extract text in the sandbox).
3. `/inbox/20260512-721-promptkit-1.md` — a Nate B. Jones "Prompt Kit" ("Use AI to organize your project files before you ask it to write Prompt Kit"; PR11 founder-subscribed source).

Also run the standing **PR11 inbox scan**: `find /inbox -type f -newermt "2026-05-22" | sort` — if anything newer than these three has been added, read it too and flag it.

### Step 2 — Build the four-product whole-system understanding

Goal: understand, for **each** product — (i) what it does and for whom, (ii) how it works at a mechanism level, (iii) its current implementation status (0a vocabulary), (iv) what has been tested *individually* — and then (v) how the four connect and operate together as one system.

**Cross-product authoritative sources (read these first — they describe the whole):**

- `/PROJECT_STATE.md` — current overall project status (the live status doc; INDEX points here).
- `/users-guide-to-sagereasoning.md` — what each product does for practitioners (Parts Two + Four).
- `/summary-tech-guide.md` — the file map / API surface / where each product lives in the codebase; safety + support.
- `/summary-tech-guide-addendum-context-and-memory.md` — context architecture + memory (how products share context).
- `/website/public/component-registry.json` — **source of truth for component status + dependencies** (191 components; statuses + what depends on what — this is the connective tissue). Read targeted: filter for each product's components and their `dependencies` / `status` / `rules served` / `blockers`.
- `/adopted/substrate-plugin-staging-plan.md` + `/adopted/ADR-stoic-agent-substrate-concept.md` — the shared substrate (translation-sandwich Layers 1→2→3) that underlies all four; the "two front-ends, one substrate" frame.

**Per-product sources + test locations:**

| Product | What it is (confirm from docs) | Design docs | Test suites | Current status |
|---|---|---|---|---|
| **Sage Reasoning** | The reasoning/assessment product — substrate-backed `/api/reason` + the score family; the human-practitioner front-end | `ADR-stoic-agent-substrate-concept.md`; `adopted/substrate-modes/` (philosophical / standard / private mode specs) | `website/src/lib/substrate/__tests__/` (incl. `layer3-service`, `philosophical-mode-service`, `score-architecture`, `r20a-gate`); `website/src/lib/translation-sandwich/__tests__/` | Substrate **A7 Verified** |
| **Sage Assent** | Agent accreditation / trust layer (formerly ATL) — credentials (`sr_assent_`), DB scope `sage_assent_write`, grading + accreditation engine | `sage-assent-a10-design.md`; `sage-assent-items-1-3-design.md`; `sage-assent-write-path-design.md`; `sage-assent-kathekon-aligned-alternative-design.md`; `pass-through-fields-design.md`; `adopted/substrate-modes/sage-assent-wrapper-spec.md` | `website/src/lib/substrate/__tests__/sage-assent-*.test.ts` (wrapper, bridge, accreditation-store/writer, iteration-patterns, tree-search-adapter); `website/src/lib/substrate/trust-layer/validation/__tests__/` | **A10 Live + Verified** |
| **Sage Reflect** | Reflection product for agents; feeds Sage Assent (`sage-assent-feed.ts`) | `sage-reflect-product-design.md` | `website/src/lib/sage-reflect/__tests__/` (engine, reflect-service, zone3-boundary, r18d-adversarial, sage-assent-feed, proximity-domains, cost-tracker, q5-ambiguity, session-store) | **Live / Verified (gated `SAGE_REFLECT_ENABLED=true`)** |
| **Sage Calling** | Purpose-discovery product for agents (Agent-Card verification, Hard-Gate, five-spec assembly) | `purpose-discovery-product-design.md` | `website/src/lib/sage-calling/__tests__/` (engine, calling-service, agent-card, question-library, r18d-adversarial, session-store) | **Live (gated `SAGE_CALLING_ENABLED`)** |

**How they connect (build this picture explicitly):** the translation-sandwich substrate is the shared spine (two front-ends — humans on `sagereasoning.com`, agents via plugins/API — one Layer 2 + Layer 3 backend); Sage Reflect's outcomes feed Sage Assent accreditation via `sage-assent-feed.ts`; Sage Calling persists its verified Agent-Card role hint (E#1) into the discovery flow; all four sit behind the shared R20a distress perimeter and the R17/R18/R19/R20 safeguards. Use the `component-registry.json` dependency edges to verify the wiring rather than inferring it.

**Verification method (per 0c "Governance implementation" + "API endpoint" rows):** to confirm "what has been tested individually," the AI may run the per-product suites with `tsx` (per `/CLAUDE.md` — plain `npx tsx` for Supabase-free tests; `npx tsx --env-file=.env.local` for the two substrate tests that import `supabase-server.ts`; one command at a time). This is optional during orientation — the component-registry statuses + the recent closes already record test state — but offer it to the founder.

### Step 3 — Produce an orientation summary + confirm ready state

Write a **concise** orientation summary back to the founder (in chat, not a file unless asked) covering: one short paragraph per product (purpose / mechanism / status / what's tested), then a short "how the four connect" paragraph, then a one-line note on anything in the three inbox items that bears on the products (per PR13). Keep it tight — this is a comprehension check, not a report.

Then **state the ready signal explicitly** and stop:

> "Orientation complete — I understand the four products and how they connect, and I've read the three new inbox items. I'm ready for the task. What would you like to do?"

**Do not begin any task work until the founder provides the task.** When the task arrives: re-declare tier + risk class, run the PR15 consult (`.claude/skills/anthropic/` + `/operations/agentic-commerce-findings-downstream-order.md`) and the PR16 lens, apply the relevant process rules (PR1/PR2/PR6/PR10 if code; PR4 if a model is named), and proceed under the standing protocol.

---

## Part B — The task (founder-provided at open)

*Left intentionally open. The founder states the task after the ready signal. Scope, tier, and deliverable are set then.*

## Rollback path

The orientation is read-only (no rollback needed). The task's rollback path is defined once the task and its risk class are known, per 0c-ii / the standing cache.

## Forecast

Success for the opening = the AI has read the three new inbox items and can accurately describe all four products (purpose, mechanism, status, individual test state) and how they interconnect as one system, has surfaced any inbox implications (PR13), and has signalled a ready state — at which point the founder provides the task and the session proceeds under the appropriate tier.

End of prompt. Opens read-only on a stable known-good baseline (Parked-2 Verified/CLOSED; Track C complete; parked backlog empty; Vercel green; production byte-identical to post-E1).
