# Next-Session Prompt — Sage Assent Provenance Gate (Option (a)) — CRITICAL BUILD

**Stream:** founder.
**Tier:** `code-critical` — **Critical** risk under 0d-ii (access-control gating on the credential *write* surface; AC7-adjacent). **The full Critical Change Protocol (0c-ii) applies.** PR1 single-endpoint proof + PR2 invocation test are required. **PR6 NOT engaged** (no distress / Zone-2 / Zone-3 logic — confirmed by the P1 ADR). **KG1 engaged** (application code on a DB-write route). This is a substrate-build-arc session.
**Governing frame:** `/adopted/standing-protocol-cache.md` + `/adopted/build-sessions-protocol-cache.md`. **Deliverable-of-the-day:** the option-(a) ADR `/adopted/adr/2026-05-23-sage-assent-sagereasoning-dependency-enforcement.md` — the design this session builds (no re-design).
**Predecessor session closes:** `/operations/handoffs/founder/2026-05-23-P1-sage-assent-dependency-rule-close.md` (rule R18f/R19e + ADR adopted); `/operations/handoffs/founder/2026-05-24-P2-whole-system-data-room-build-close.md` (the data room; the Combination-1 gap documented).
**Predecessor decision-log entries:** `D-SAGE-ASSENT-SAGEREASONING-DEPENDENCY-RULE-ADOPTED-2026-05-23`; `D-WHOLE-SYSTEM-DATA-ROOM-BUILD-2026-05-24`.
**Risk classification:** **Critical** under 0d-ii. Critical Change Protocol (0c-ii) applies — see Part B Step 6, completed VISIBLY in the conversation before any deploy.

## Why this session matters

R18f ("no credential without examination") is **Adopted but not enforced.** The P1 provenance finding (Diagnostic-certain) established that `POST /api/accreditation/[agent_id]` verifies *who* writes (A10 ownership) but **trusts the submitted aggregates** — there is no server-side Ed25519 verification (`layer2-signer.ts` signs only; the verify half does not exist), and `loop_id` is caller-supplied/unverified. So **Combination 1 (Sage Assent without Sage Reasoning) is not structurally prevented today** — the false-credential door. This session builds the elected fix: **server-side Ed25519 signature verification at the credential write boundary.** When it ships and is enabled, the data room's headline **Combination-1 negative test flips from *documented gap* to *passing assertion*** (`data-room/04_test_brief/test-brief.md` A.2 / S2-neg).

## Locked context (do NOT re-litigate)

- **Option (a) is elected and Adopted** (P1 ADR). Do **not** re-evaluate (b) `loop_id` linkage or (c) examination token — those are deferred defense-in-depth / future artefacts (ADR revisit-conditions 3 + 4).
- **Gate placement is pinned:** a new provenance check in the `POST /api/accreditation/[agent_id]` handler, placed **AFTER** the A10 ownership gate (`verifyAgentIdOwnership`) and **BEFORE** the writer invocation (`seedAccreditation` / `updateAccreditation`). Additive — A10 answers *who may write*; this answers *was there an examination*.
- **Trust-boundary placement = the ROUTE.** In-process callers (notably `sage-assent-feed.ts`, the Reflect→Assent seam) stay on the existing trust posture ("trusted by virtue of being in-process callers"). Do **not** push the check down into the writer library this session (ADR revisit-condition 2 governs if that changes).
- **The aggregate-faithfulness gap is NAMED + DEFERRED (PR7).** Option (a) proves *a genuine substrate signature exists*, **not** that the submitted aggregate was faithfully computed from signed assessments. Do not conflate the two; do not over-claim in any doc or close. Combination-1 prevention = "must possess genuine substrate output," nothing more.
- **"No current users" holds** — Critical Change Protocol step 3 ("existing sessions") = **N/A** (founder + test logins only). All other Critical Change Protocol steps remain in full force.

## Pre-conditions (confirm at open)

1. **Production baseline unchanged:** substrate **A7 Verified**; Sage Assent **A10 Live+Verified**; `SUBSTRATE_WRITE_PATH_ENABLED='true'`; `/api/public-key` serving the steady-state Ed25519 shape (`previous: null`, `rotation_overlap_until: null`); Vercel green on `main`.
2. **The P2 data-room work does NOT touch `website/src`** — production code is the post-P1 baseline regardless of whether the `whole-system-data-room` branch is merged. Build the gate against the production code baseline (branch off `main`, or work on `main` per your usual code-build flow).
3. Working tree clean; **no `.git/index.lock`** (clear host-side `rm -f .git/index.lock` if present — flagged repeatedly in recent closes).

---

## Part A — Open under the protocol (FULL reads — this is `code-critical`)

Read in order:

1. `/adopted/standing-protocol-cache.md` (tier, model selection, KG register, signals, risk class) + `/adopted/build-sessions-protocol-cache.md` (build-arc context).
2. `/adopted/adr/2026-05-23-sage-assent-sagereasoning-dependency-enforcement.md` — **in full** (the design; the evidence trace; the gate placement; the revisit conditions).
3. Both predecessor closes (above).
4. `/operations/decision-log.md` — last 3 entries.
5. Targeted `/manifest.md`: **R18f** (the rule), **R18a/R18b** (badge integrity this protects), **R19**, **AC7** (auth/access surface — the build-tier driver), **AC8** (substrate). Confirm **AC5 / PR6 NOT engaged** (no R20a/distress surface).
6. **The code anchors — read before changing anything** (per the ADR's cross-references):
   - `website/src/app/api/accreditation/[agent_id]/route.ts` — the `POST` handler (~548–630); `verifyAgentIdOwnership` (~345); `validateWriteBody` (~431).
   - `website/src/app/api/accreditation/[agent_id]/request-helpers.ts` — `extractWriteExtras` (caller-supplied `loop_id`).
   - `website/src/lib/substrate/sage-assent-accreditation-writer.ts` — `seedAccreditation` / `updateAccreditation` (straight passthrough); the in-process-trust comment (~:84–86).
   - `website/src/lib/translation-sandwich/layer2-signer.ts` — `signLayer2Assessment` + the `crypto.verify` recipe in the doc comment (~:169) — **the missing verify half to implement**.
   - `website/src/app/api/public-key/route.ts` — the published Ed25519 verification key (+ `key_id` for the A4 rotation window).
   - `website/src/lib/substrate/sage-assent-bridge.ts` — `deriveReceiptId` (wrapper-side hashing; the `receipt_id`↔signature convention to reuse).

**Confirm at open:** tier `code-critical`/Critical; P0 0h active; **model selection N/A** (the gate is deterministic crypto — no LLM, per AC1); **KG1 engaged** (DB-write route — every DB call awaited, errors surfaced, no fire-and-forget; the new check is synchronous before the response); status vocabulary; signals + risk class. Run the **PR15 consult** (`.claude/skills/anthropic/` — `sage-wiring-fix` may help; `/operations/agentic-commerce-findings-downstream-order.md`): the verify is the **missing half of an existing primitive** — standard Node `crypto.verify`, reusing the signer + published key + `key_id` machinery — not a bespoke parallel system; state this before building. **PR16 lens:** the gate **strengthens** R18a "Character Kernel"/badge integrity (a credential that cannot be falsely issued *is* the trust claim); dogfood-relevant.

---

## Part B — Procedure (Critical; PR1 single-endpoint proof + PR2 invocation test)

**Recommended scope split — declare the cut at open (this is a large Critical session):**
- **Build A** (`code-standard` → `code-elevated`): the verify primitive + the contract shape, in isolation (not wired). Lower risk.
- **Build B** (`code-critical`): wire the gate, the kill-switch flag, the lockstep wrapper update, the Critical Change Protocol, and the dark-deploy + flag-flip.

A clean stopping point is the end of Build A (the verify primitive Verified in isolation), with Build B as the follow-on. Either split is fine; the founder manages scope.

### Step 1 — Build `verifyLayer2Signature` (the missing half) — PR1 proof in isolation

Implement the verify counterpart to `signLayer2Assessment` in `layer2-signer.ts` (the `crypto.verify` recipe already sits in the doc comment ~:169). It verifies a `SignedLayer2Assessment` against the **published Ed25519 key** (`/api/public-key`), with **`key_id` matching for the A4 rotation window** (accept the current key; handle the overlap key if a rotation window is active). Returns a typed result (valid / invalid + reason). **Unit tests:** genuine signature → valid; tampered payload → invalid; unknown/expired `key_id` → invalid (not a throw). New function, not wired → **Standard** until Step 3.

### Step 2 — Extend the write contract to carry signed provenance

The `POST` body (or a header) must carry, at minimum, **the `SignedLayer2Assessment` signature(s) the credited aggregate derives from**, plus enough of the signed payload to verify. Define the shape; update `validateWriteBody` to require + structurally validate it. **Document the contract change** (it is Elevated-or-Critical for any consumer that POSTs credentials).

### Step 3 — Wire the gate into the `POST` handler — THE Critical step — behind a kill-switch flag

Insert the provenance check **after** `verifyAgentIdOwnership`, **before** `seedAccreditation`/`updateAccreditation`. If the gate is **on** and the write carries **no valid substrate signature** → reject with a **distinct** status (recommend `403 no_examination` or `422`) so the audit log separates "no examination" from "no permission." Gate the check behind a new kill-switch env flag — **proposed `SUBSTRATE_PROVENANCE_GATE_ENABLED`** (consistent with `SUBSTRATE_WRITE_PATH_ENABLED` / `SUBSTRATE_R20A_GATE_ENABLED`): **UNSET in production = behaviour byte-identical to today**; the gate only enforces when the flag is `'true'`. The check is **synchronous** — complete before the response is constructed. **No new schema expected** (verification reads the published key; it does not write a new table) — confirm in-session; if an audit field for the verified signature is wanted, that is a separate Elevated schema add.

### Step 4 — Update the wrapper / test-write path in lockstep

Once the flag is on, **any credential write that does not send signed provenance is rejected.** With "no current users," only the founder's test-write path / the wrapper needs updating — but it **MUST** send the provenance **before the flag is flipped**, or all writes fail. Update it in lockstep (this is why the dark-deploy + flag pattern exists).

### Step 5 — PR2 invocation test

Assert the check is **CALLED in the execution path** (grep for the call, not the definition — per PR2). Behavioural tests: (a) forged/missing provenance → **rejected** (the distinct status); (b) genuine signed provenance → **200**; (c) the in-process feed path (`sage-assent-feed.ts`) is **unaffected** (in-process trust posture preserved).

### Step 6 — Critical Change Protocol (0c-ii) — complete VISIBLY before any deploy

1. **What is changing** — plain language: the credential write now requires proof that a real SageReasoning examination happened, not just a valid write token.
2. **What could break** — the specific worst case: *with the flag ON and the wrapper not yet sending provenance, EVERY credential write is rejected.* (Mitigated by Step 4 lockstep + dark deploy.)
3. **Existing sessions** — **N/A** ("no current users"; founder + test logins only).
4. **Rollback plan** — the exact independent steps: **flip `SUBSTRATE_PROVENANCE_GATE_ENABLED` UNSET in Vercel → instant return to today's behaviour, no redeploy**; secondary: `git revert <commit>` + push. Provide the exact commands.
5. **Verification step** — what the founder checks after the flag flip: a test command that a forged-provenance write is rejected and a genuine one returns 200.
6. **Explicit founder approval** — specific to the named risks (not generic) before the flag is flipped.

### Step 7 — Deploy dark, then flip

Commit + push with the flag **UNSET** → Vercel deploys, behaviour **byte-identical to today** (safe). Confirm Vercel green + `/api/accreditation` behaviour unchanged. **Then, as a separate verified step,** set `SUBSTRATE_PROVENANCE_GATE_ENABLED='true'` in Vercel → the gate goes live → run the Step 6.5 verification → **update `data-room/04_test_brief/test-brief.md`** (Combination-1 / S2-neg rows: *documented gap → passing assertion*) and `data-room/99_review/missing-context.md` M-4.

### Step 8 — Decision-log entry (FULL form) + session close (FULL form)

Critical sessions use the **full** templates (not lean): include **Verification Method Used (0c)**, **Risk Classification Record (0d-ii)**, **PR5 Knowledge-Gap Carry-Forward**, **Founder Verification (between sessions)**, and the **Orchestration reminder**. Record R18f moving from *Adopted-but-unenforced* → **enforced (Live)** once the flag is flipped and verified.

---

## Part C — Anticipated session shape

| Phase | Estimate |
|---|---|
| Full caches + ADR (full) + both closes + decision-log + code-anchor reads | 35–45 min |
| Scope-cut decision (Build A only, or A+B) | 5 min |
| Step 1 — `verifyLayer2Signature` + unit tests (PR1) | 45–60 min |
| Step 2 — write-contract extension | 30–40 min |
| Step 3 — wire the gate + kill-switch flag (Critical) | 45–60 min |
| Step 4 — wrapper/test-write lockstep | 30–45 min |
| Step 5 — PR2 invocation + behavioural tests | 30–40 min |
| Step 6 — Critical Change Protocol (visible) + approval | 20–30 min |
| Step 7 — dark deploy → verify → flag flip → verify → update data room | 30–45 min |
| Step 8 — full decision-log entry + full close | 30–40 min |
| **Total (A+B)** | **~5–6.5 hours — split strongly recommended** |

## Rollback path

The **kill-switch flag is the primary rollback**: set `SUBSTRATE_PROVENANCE_GATE_ENABLED` UNSET in Vercel → instant, byte-identical-to-today behaviour, no redeploy. Secondary: `git revert <commit>` + push. No schema change expected (confirm in-session). Because the deploy ships dark (flag UNSET), the *deploy* itself is reversible independently of the *enforcement*.

## Forecast

Success = `verifyLayer2Signature` built + unit-tested (PR1); the write contract carries signed provenance; the gate wired behind `SUBSTRATE_PROVENANCE_GATE_ENABLED` after the A10 gate; the wrapper/test-write updated in lockstep; deployed dark; the Critical Change Protocol completed visibly; the flag flipped on founder approval; **forged/missing provenance rejected, genuine accepted**; **R18f enforced (Live)**; the data room's Combination-1 negative test flips to **passing**. After this: optionally layer **(b)** `loop_id`→`loop_billing_events` defense-in-depth (ADR revisit-condition 4), and/or schedule the **aggregate-faithfulness** closure (revisit-condition 1) as a separate future decision. The whole-system **manual loop (Step 7 of the data-room brief)** can then run with Combination-1 as a *passing* assertion rather than a documented gap.

End of prompt. Opens on the post-P1 production baseline. This session **changes production code and the credential write-surface behaviour** — but ships dark behind a kill-switch flag, so the deploy is byte-identical to today until you flip the flag with explicit approval.
