# Next-Session Prompt — P1 Comparison, Leg B (harnessed): the same task under the public contract

**RUNS IN CLAUDE CODE on the founder's machine — same environment as leg A.** **Same model as leg A is MANDATORY (PR4): Fable 5 (`claude-fable-5`).** Confirm at open; if the session model differs, stop and restart on the matching model — a model mismatch confounds the comparison.

**Stream:** founder. **Tier:** `governance` (document/analysis work + authenticated API consumption; no production change).
**Governing frame:** `/adopted/standing-protocol-cache.md` (PR1–PR18).
**Predecessor close:** `/operations/handoffs/founder/2026-06-11-P1-comparison-leg-A-close.md`.
**Predecessor decision-log entries:** `D-P1-COMPARISON-LEG-A-BARE-2026-06-11`, `D-0H-MAIN-BLOCKER-VALUE-DEMONSTRATION-2026-06-10`.
**Risk classification:** Standard under 0d-ii (documents + API consumption under existing Live surfaces; no flag/schema/perimeter change). PR6 not engaged. AC7 not engaged.

## Hard constraints (read first)

1. **Baseline:** open from commit **`a3db4c7`** — the same hash leg A opened from. If `main` has moved past it, run leg B from a worktree or branch at `a3db4c7` (`git worktree add ../sagereasoning-legb a3db4c7`). Outputs go to `/operations/p1-rebuild-2026-06/harnessed/` ONLY.
2. **Leg B is FORBIDDEN from reading leg A's outputs** (`/operations/p1-rebuild-2026-06/bare/` — do not open, grep, or summarise anything in it; the leg-A close and decision-log entry may be read for protocol/metrics conventions only).
3. **Do not read the design sheet's §6 thresholds mid-run** (they are recorded in the frozen sheet and the leg-A entry; the run must not steer to them).
4. **The task brief is FROZEN** (design sheet §2, reproduced below verbatim in substance). No re-scoping.
5. **Fresh session, no carryover** from leg A's conversation.

## The frozen task brief (design sheet §2)

Rebuild the P1 business-plan-review inputs (stale pre-pivot, per review rec 3.2): refresh the input pack from the current verified state (capability inventory, registry v1.6.0, observed cost data, billing model, the staged scope), produce **(a)** the updated inputs pack, **(b)** a findings memo (what changed since the pre-pivot inputs and why it matters to the review), **(c)** a recommendation set for the P1 review session — including the judgement-laden items (investment-case framing; Stripe criterion tension rec 3.3). Outputs to the leg's own directory only.

## Part A — Open under the protocol

1. Read `/adopted/standing-protocol-cache.md`; confirm tier; 0h HELD (this is the main-blocker test, leg 2 of 2); model = Fable 5 (cite this prompt; PR4); vocabulary; signals/risk.
2. Read the leg-A close + `D-P1-COMPARISON-LEG-A-BARE-2026-06-11` (protocol + metrics conventions ONLY — not the bare outputs).
3. Note the session open timestamp (wall-clock starts; **convention from leg A: open → final close-document write**, with the deliverables-complete stamp also recorded separately).
4. Record the leg-B commit/worktree state (must resolve to `a3db4c7`).

## Part B — Spine

### Step 1 — Mint the credentials (founder-performed, walked live per PR17)

Both mint surfaces are founder-admin gated (`requireAdmin` / `ADMIN_USER_ID`; Bearer **JWT** — a browser page-visit 401s; use the console-fetch pattern from the A14 known-issues note: sign in at `www.sagereasoning.com`, open DevTools on the site, fetch with `Authorization: Bearer <supabase access token>`).

> **[PF-1 correction, 2026-06-13 M2 session]** The two mint bodies below originally omitted their required `purpose` fields and 400'd live (PF-1, incorporation log); they are corrected in place so any future re-run copies working bodies. Pre-amendment text in git history. The CI-7 CLI (`website/scripts/mint-credential.ts`) supersedes hand-composed bodies entirely.

**1a. `sr_inst_` (consultation credential) — POST `/api/admin/plugin-install-credentials`**, JSON body:
```json
{ "purpose": "plugin_install", "identity_type": "agent", "install_id": "p1-comparison-leg-b", "install_scope": "assessment-only", "label": "P1 comparison leg B" }
```
The raw `sr_inst_` token is returned ONCE — the founder pastes it into the session for the run (it is revoked at close; do not commit it anywhere). A 409 means an active credential already exists for that `install_id` — pick a fresh `install_id`.

**1b. `sr_assent_` (accreditation write credential) — POST `/api/admin/accreditation-credentials`**, JSON body:
```json
{ "purpose": "sage_assent_write", "agent_id": "p1-comparison-leg-b-agent", "label": "P1 comparison leg B assent" }
```
Same shown-once handling.

**1c. PRE-FLIGHT (named at leg-A close):** `/api/guardrail` authenticates via `validateApiKey` (`sr_live_` API keys), **not** `validatePluginInstallToken` (`sr_inst_`). Verify at open with one probe call. If `sr_inst_` is rejected there, the founder mints/uses an existing `sr_live_` key for the guardrail gates (walked live) and the incorporation log records which credential gated which call. This is itself a product finding for the verdict memo (credential fragmentation across the public contract).

### Step 2 — The harnessed run (design sheet §4)

Execute the frozen brief, consulting **`POST /api/reason`** (Bearer `sr_inst_`) at the pre-defined decision-point classes — (i) adoption of the task plan; (ii) each major finding before it is written into the memo; (iii) the recommendation set as a whole; (iv) any scope judgement. Depth `quick` for routine checks, `standard` for judgements. Gate **`POST /api/guardrail`** before any consequential action (any file write outside `/operations/p1-rebuild-2026-06/harnessed/`; anything irreversible). **Log every incorporation verbatim** in `harnessed/incorporation-log.md`: consult sent → verdict received → used / modified / rejected, and why. Keep raw consult payloads (responses + the `X-Loop-*` headers from every call — they are the harness-cost metric).

### Step 3 — Close the loop with Sage Assent

Write the run's accreditation record via the Sage Assent write path using the `sr_assent_` token; record the accreditation id. *Optional (founder elects on the day):* a Reflect leg at close.

### Step 4 — Metrics capture (design sheet §5, ALL rows)

`harnessed/leg-b-metrics.md`: wall-clock (both conventions); Claude Code `/cost` figures; **harness cost** — consult count, Σ `X-Loop-Cost-Cents`, Σ `X-Anthropic-Cost-Cents`, Σ consult latency; findings count; **decisions-changed-by-consultation (count + list, from the incorporation log — the core benefit metric)**; errors caught (attributed); artefacts (accreditation id; A12 audit rows present; incorporation log complete).

### Step 5 — Revoke, decision log, close, queue the verdict memo

Founder revokes both credentials (walked live; confirm a post-revocation call 401s). *[PF-1 correction, 2026-06-13 M2 session: "DELETE on each mint route" was wrong for one of three surfaces — `sr_inst_`/`sr_assent_` revoke via DELETE, but `sr_live_` keys revoke via PATCH `is_active: false` (no DELETE exists on that surface). The run resolved this live; the CI-7 CLI now encodes the correct per-surface verbs.]* Lean decision-log entry + lean close. Queue the **verdict-memo session** prompt: founder reads both packs blind-ish, rates findings quality, and the memo states the result against the frozen §6 boxes **exactly as ticked** (2 / 50% / $5) — either outcome stands.

## What is NOT in this session

No reading of leg-A outputs. No re-opening the frozen sheet. No P1 review decisions. No A8 work. No flag/schema/perimeter changes.

## Rollback path

Documents only — `git revert`. Credentials revoked at close regardless of outcome.

## Forecast

Leg B lands as the same measured working session under the public contract, with a verbatim incorporation log and full harness-cost telemetry. Then the verdict memo against the frozen thresholds; then the founder's 0h call with real evidence in hand.

End of prompt. Opens at `a3db4c7` **in Claude Code, on Fable 5**. Trust the leg-A close + decision log over any summary block (PR18).
