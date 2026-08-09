# Next-Session Prompt — The runner scoping session (five carry-forwards, binding internal order)

**Stream:** founder.
**Tier:** `code-critical` — **AC7 ENGAGED**. This session mints a production credential, provisions a write-class capability on it, and activates **three production env flags** that turn three dark routes live. Every one of those is founder-walked under **PR17** (the founder runs every mint/SQL/Vercel op; the AI guides, verifies, and performs none). The **Critical Change Protocol (project instructions 0c-ii) governs in full** — its six items must be answered and re-confirmed at open with explicit founder approval, per the standing cache's Critical-risk section. Confirm this classification at open against the cache rather than trusting this header.

**Governing frame:** `/adopted/standing-protocol-cache.md`.
**Predecessor session close:** `operations/handoffs/founder/2026-08-09-loop-id-field-build-CLOSE.md`.
**Predecessor decision-log entries:** `D-LOOP-ID-FIELD-BUILT-DARK-REVIEW-FOLDED-2026-08-09` (the build that closed the first build gate); `D-ACTIVATION-OWNERSHIP-RULED-2026-08-09` (**the ruling that defines this session's shape — read it first**); `D-MENTOR-PRIORITISED-SEQUENCE-ADOPTED-2026-08-09`; `D-MENTOR-SIX-STOIC-ITEMS-AND-GSATRF-ANSWERS-RECORDED-2026-08-09`.

---

## Where this sits

**The first build gate is CLOSED.** All three items — `fresh`, `watching`, `loop_id` — are built, reviewed, and **dark** (pushed, Vercel green, every flag unset). This is the next session in the binding sequence:

> brief ruled → `fresh` ruled → `watching` ruled → generation-step ruled → **first build gate (all three built dark)** → **runner scoping session ← THIS SESSION** → bounded validation run → standing-runner design

**This session establishes the runner's entire operational environment.** Nothing downstream can move until it completes: the bounded validation run structurally cannot execute while `fresh` and `watching` return 503.

## The five carry-forwards — and their BINDING internal order

The mentor ruled this order explicitly (`D-ACTIVATION-OWNERSHIP-RULED-2026-08-09`; verbatim at `operations/agent-circles-2026-08/2026-08-09-mentor-instruction-prioritised-sequence-verbatim.md` §FOLLOW-UP RULING). **Do not reorder, and do not batch (1) with (2).**

| # | Carry-forward | Mentor's own words |
|---|---|---|
| 1 | **Dedicated identity mint** — `sagereasoning:idea-loop@v1`, 6e §A owner+agent binding | *"first — clean, establishes the subject"* |
| 2 | **`watching_write` provisioning** | *"second — heaviest, most likely to surface surprises, deserves full attention"*; *"a Critical Change Protocol item. Do not treat it as a quick configuration step."* |
| 3 | **Three flag activations** — `SUBSTRATE_FRESH_ENABLED`, `SUBSTRATE_WATCHING_ENABLED`, `SUBSTRATE_LOOP_ID_FIELD_ENABLED` | *"third — only after the capability surface is confirmed correct, because the routes being activated depend on it"* |
| 4 | **`ORIENTATION_DELIVERY_TIMEOUT_MS` revisit trigger** | *"the session that mints the identity is the session that can size this correctly"* |
| 5 | **`frictionAssessment` PM-tool mapping** | *"a runner-environment decision, not a SageReasoning server decision"* |

**Plus:** this session produces a **scope document**, and **GS-ATRF-1/2/3 are carried into it explicitly as named inputs** — questions the runner's design must answer before the bounded validation run begins, **not build items** (mentor's instruction). The mentor's substantive answers to all three are now on the record (see Part A read 4) — they are inputs to the scoping, not re-litigations.

---

## Pre-conditions

1. Confirm at open: no new mentor guidance supersedes the ruled corpus. Ask the founder before any live op.
2. Confirm the predecessor state first-hand: `git log --oneline -4` shows the four 2026-08-09 commits (`024e87e`, `cb9feb2`, `937774e`, `1684cd4`) pushed; Vercel green.
3. Confirm the session's hook framed. If not (the 28s-timeout transient class recurred through all three prior builds in this arc), proceed unframed and disclose at open + close — do not block.
4. **The Critical Change Protocol's six items are pre-answered in this prompt's own sections and MUST be re-confirmed at open with explicit founder approval before any live op.**

---

## Part A — Open under the protocol

Read in order:

1. `/adopted/standing-protocol-cache.md` (~3 min — tier, model selection, risk class, signals; note the `code-critical` row takes the **full** templates, not lean).
2. `operations/handoffs/founder/2026-08-09-loop-id-field-build-CLOSE.md` (the immediate predecessor — its Next section is this session's spec in miniature).
3. **`operations/agent-circles-2026-08/2026-08-09-mentor-instruction-prioritised-sequence-verbatim.md` IN FULL** — both the prioritised instruction and the **§FOLLOW-UP RULING** that defines this session's five carry-forwards and their order. Verbatim wins over every annotation.
4. **`operations/agent-circles-2026-08/2026-08-09-mentor-review-six-stoic-items-and-gs-atrf-answers-verbatim.md`** — the mentor's substantive answers to GS-ATRF-1 (the four-virtue blast-radius proxy), GS-ATRF-2 (indicator rides the proposal shape), GS-ATRF-3 (completion signal is its own scope item). **Read its AI verification note too** — it carries the `targetCircle` finding this session must not re-derive.
5. `operations/agent-circles-2026-08/2026-08-09-generation-step-scope.md` — **§2.9 (now carrying a dated AMENDED annotation — read the amendment, not the superseded sequence above it)**, §2.5 (the five validation-run configuration defaults this session's scope document must carry), §2.8 (the six-step cycle composition — what the runner actually calls, in order).
6. `operations/agent-circles-2026-08/2026-08-09-watching-per-cycle-record-table-scope.md` — the `watching_write` capability's ruled purpose and the carry-forward's exact wording.
7. `operations/decision-log.md` — the last 5 entries (all four 2026-08-09 entries above, plus `D-WATCHING-BUILT-AND-CAPABILITY-LIVE-2026-08-09`).

**Confirm at open:** tier (`code-critical`, full templates, AC7 engaged, PR6 + PR17 engaged); hold-point status (P0 0h); model selection per the cache's AC1 table (**no new LLM call is introduced by this session** — it mints, provisions, activates, and scopes; no row applies); status vocabulary; signals + risk classification.

---

## Part B — Procedure, in the ruled order

### Step 0 — PR20 ground-truth checks BEFORE any live op

Three claims in the surrounding corpus are stale or imprecise. **Verify each first-hand; do not inherit them.**

1. **The `watching_write` CHECK widening is ALREADY LIVE.** The mentor's carry-forward calls item (2) *"a founder-walked api_keys CHECK widening"* — but that widening was **already walked to TEST and production** at the `watching` build (`website/supabase-api-keys-watching-write-capability-migration.sql`, §V vocabulary + §W owner+agent overlap; `D-WATCHING-BUILT-AND-CAPABILITY-LIVE-2026-08-09`). **Verify at the DB** (`pg_get_constraintdef` on `api_keys_capabilities_subset_check` and `api_keys_sage_assent_write_requires_owner_and_agent` — both should already list `watching_write`). If confirmed, item (2)'s remaining work is **minting a credential that carries the capability**, not a second migration. **Do not re-run the migration.** If it is somehow NOT live, stop and re-scope with the founder.
2. **`CLAUDE.md`'s claim that "the practice mint silently drops `--daily`/`--monthly`" is STALE.** That CLI gap was fixed 2026-07-21 (`src/lib/admin-mint/mint-credential-core.ts` — the `limitFlags` loop, with the fix's own comment naming the P4 agent-1 session). The flags are honoured today. Re-verify by reading that loop; size the limits properly at mint time rather than by post-hoc SQL.
3. **`targetCircle` is NOT persisted on `idea_loop_candidates`** (type-only, `idea-loop-types.ts:104`). Carried finding from `D-MENTOR-SIX-STOIC-ITEMS-AND-GSATRF-ANSWERS-RECORDED-2026-08-09`. It bears on GS-ATRF-1/2 in this session's scope document — **name it there; do not fix it here** (any column addition is its own founder-walked migration on a now-live table).

### Step 1 — Identity mint (`sagereasoning:idea-loop@v1`)

Founder-walked. *"First — clean, establishes the subject."*

- **The agent_id must be K1-canonical** (`namespace:name@version`). The UPC mint accepts any free string, but the accreditation write boundary enforces the canonical pattern — a non-canonical id mints fine and then 400s on first write (memory `upc-mint-vs-accreditation-agent-id`; the exact class that cost a re-mint at Gate-1 Slice 3b). **Regex-check `sagereasoning:idea-loop@v1` against `isAcceptedAgentId` BEFORE the mint.**
- **6e §A owner+agent binding is required** — a write-class capability on a credential with no owner or no agent_id will `23514` at the DB. Mint owner-bound and agent-bound.
- **A production mint needs a production admin JWT** (memory `prod-mint-needs-prod-admin-jwt`) — the repo's `MINT_CLI_ADMIN` env file targets TEST. The founder supplies `MINT_CLI_ADMIN_JWT` from a logged-in `www.sagereasoning.com` session. **Also beware the env-file export leak** (memory `mint-cli-env-file-export-leak`): exported prod vars override `--env-file`, so a TEST mint can silently hit prod. Unset first; confirm the target origin echo before accepting any mint.

### Step 2 — `watching_write` provisioning

Founder-walked, **full attention, NOT batched with Step 1** (the mentor's explicit instruction).

- Per Step 0(1): if the CHECK widening is confirmed live, this is the mint carrying `capabilities` including `watching_write` — via `mint practice --capabilities consult,watching_write,...` (the exact set is this session's decision; see the quota note below).
- **Decide the capability set deliberately.** From §2.8's six-step cycle the runner calls: `/api/guardrail` (per candidate), `POST /api/practice/fresh` (`consult` capability), `POST /api/reason` (the winner's full consult — `consult`), `POST /api/practice/watching` (`watching_write`). Least privilege applies: grant what the ruled cycle needs, nothing more. `l1_supply` in particular should **not** be granted — a supplied extraction can never mint an orientation reading, and the runner has no reason to supply one.
- **Verify the binding lands**: after the mint, confirm at the DB that the row carries the capability, an owner, and the agent_id — the 6e §A invariant proven on the actual row, not assumed from a successful mint response.

### Step 3 — The three flag activations

Founder-walked, **each its own Critical step**, *"only after the capability surface is confirmed correct."*

Order within the step matters for verification, not for safety — suggest activating in dependency order and smoking each before the next:

| Flag | Turns live | Smoke |
|---|---|---|
| `SUBSTRATE_FRESH_ENABLED` | `POST /api/practice/fresh` (was 503) | A real batch call on the new credential → 200 with the `window` disclosure block; confirm `basis: 'insufficient_history'` on a fresh credential (the ruled starved-window outcome, not a fabricated pass) |
| `SUBSTRATE_WATCHING_ENABLED` | `POST /api/practice/watching` + `GET /api/founder/watching` + `/founder-watching` | A cycle write on the new credential → row lands; the dashboard renders it with heuristic attribution + the runner-composed disclosure |
| `SUBSTRATE_LOOP_ID_FIELD_ENABLED` | the `loop_id` field on `/api/reason` | A consult carrying `loop_id: 'sagereasoning:idea-loop@v1#001'` → 200; a malformed value → 400 non-billable. **The payload stamp itself is only observable if the orientation flags are also on** — check `SUBSTRATE_ORIENTATION_READING_ENABLED` + `SUBSTRATE_AGENT_CIRCLES_ENABLED` state before claiming the stamp was verified live, and say honestly which half was observed |

**Rollback for each:** unset the flag + redeploy — every one is byte-identical flag-off and battery-asserted. Confirm the founder holds this before the first flip.

**Quota sizing — size this BEFORE the smokes, it is a real trap.** The §2.5 validation defaults give `minimumInterval` 4h ⇒ ~6 cycles/day, and §2.8's cycle is ≤7 guardrail calls + 1 `fresh` + ≤1 `reason` consult + 1 `watching` write ≈ **~10 calls per cycle, ~60/day**. The CI-6 mint defaults are **30/month, 1/day** — which would starve the runner after one action on day one, and the failure **presents as a 401 "Please sign in"**, not a quota error (memory `api-key-1-per-day-limit-masks-as-401` — this exact confusion has cost a session before). Size `--daily`/`--monthly` at mint time (Step 1/2), generously enough for a 20–40-cycle validation run with headroom.

### Step 4 — `ORIENTATION_DELIVERY_TIMEOUT_MS` revisit

`ORIENTATION_DELIVERY_TIMEOUT_MS = 28000` (`src/lib/translation-sandwich/orientation-reading.ts:194`). Mentor-ruled 2026-08-08 to **track the harness's own documented `GATE1_TIMEOUT_MS` default exactly** — *"never a tighter bound"* — with the dependency named in the constant's own docstring: if the harness default changes, this must change with it.

**The revisit question this session can finally answer:** the runner is a *new caller* with its own timeout, and the server has no channel by which a caller declares one (the mentor ruled extending the protocol *"real but disproportionate"*). So: does the runner's own client timeout match 28,000ms? If it differs, every orientation reading from runner consults is classified against the wrong bound. **Name the answer explicitly** — either the runner adopts 28,000ms (constant unchanged, dependency documented) or the divergence is recorded as a known measurement limitation on runner-produced readings. Do not change the constant without the mentor.

### Step 5 — `frictionAssessment` PM-tool mapping

The founder's decision — *"the runner's tooling environment determines what external thing the task list physically is."* The mentor's own note: `frictionAssessment` has **no native PM-tool analogue**, so it is either a custom field in the chosen tool or an annotation stored alongside a reference to the external task. This session consumes the `SharedTask` **contract** only (`frictionAssessment.detected` / `.description` / `.assessedAt` — §2.3 reads these as contract fields); nothing depends on where they physically live. **Use AskUserQuestion** — this is a founder-environment call, not an AI inference.

### Step 6 — The scope document

Produce `operations/agent-circles-2026-08/2026-08-XX-runner-scoping.md` carrying: the minted identity + capability set (no secrets — ids and capabilities only, never a token); the five §2.5 configuration defaults as the validation-run values; the resolved timeout position; the PM-tool mapping; and **GS-ATRF-1/2/3 as named inputs with the mentor's answers attached**, each stated as a question the runner design must answer before the validation run — plus the carried `targetCircle` persistence finding as a named consequence of GS-ATRF-2's answer.

### Step 7 — PR19 independent adversarial review

**Pause before and after for the founder's model-settings change** — this arc's standing practice, which has worked well across all three prior builds. Dimensions: ruling-fidelity (the five carry-forwards in the ruled order; nothing batched that was ruled unbatched); live-op verification (every claimed mint/provision/activation traced to actual DB/Vercel state, not to a successful-looking response); boundary compliance (no runner-side heuristic/template/config code; no standing-runner design; nothing ruled re-opened). If finder agents die on the account session limit (recurred in two of three prior sessions), **do not accept an empty "GO"** — complete first-hand across all dimensions, disclose it, and offer a genuine re-run after the limit resets.

### Step 8 — Records

Full `code-critical` decision-log entry + session close (the full templates, not lean — including Verification Method Used, Risk Classification Record, PR5 Knowledge-Gap Carry-Forward, Founder Verification, Orchestration Reminder). **Production will NOT be byte-equivalent** — say so plainly and enumerate exactly what changed.

---

## What this session does NOT do

- **Does not run the bounded validation run.** That is the next session — founder-attended, 20–40 cycles, brief §6 report to the mentor.
- **Does not build any runner-side content** — heuristic templates, the friction threshold, `randomOffsetPercent`, prompt text. All runner-owned and external to this repo **permanently** (architecture ruling §1 item 1).
- **Does not design the standing runner** (§1.8's boundary — the validation run's data is that design's input, and it does not exist yet).
- **Does not build the ATRF pre-task question set** — that is the named post-validation-run **ATRF scoping session** (pre-task question set, completion-signal return path, oikeiosis extension metric).
- **Does not add `target_circle` or a blast-radius column** to the live watching tables — named in the scope document, built by whichever session scopes the indicator.
- **Does not re-run the `watching_write` CHECK widening** (already live — Step 0(1)).
- **Does not re-open anything ruled** — the brief's Q1–Q11, `fresh`/`watching`/generation-step scopes, QG-A/B/C/D, QW-A/B/C.
- **The Q1 hard constraint holds throughout: the loop proposes; it never executes.**

## Rollback path

Per item, in reverse order of application: unset each flag + redeploy (byte-identical flag-off, battery-asserted — the cleanest of the three); revoke the minted credential (the real kill switch for the identity + capability, per the S9 precedent); `git revert` the records commit. **No schema migration is expected this session** — if one becomes necessary, it is a separate founder-walked step with its own §VERIFY and inverse block, not folded into this one.

## Forecast

Success = the runner has a complete operational environment: a K1-canonical owner-and-agent-bound identity carrying exactly the capabilities the ruled cycle needs and quotas sized for a real validation run; three routes live and smoke-verified on that credential; the timeout question answered explicitly; the PM-tool mapping decided by the founder; and a scope document carrying GS-ATRF-1/2/3 as named inputs with the mentor's answers attached. **Next session: the bounded validation run** — 20–40 completed cycles under the §2.5 defaults, producing the brief §6 report shape, which goes to the mentor before any standing-runner design opens.

End of prompt.
