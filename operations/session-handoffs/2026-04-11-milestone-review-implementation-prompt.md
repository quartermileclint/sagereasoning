# Next Session Prompt — Milestone Review Implementation
# Paste everything below this line into a new session

---

## Who I Am

I'm Clinton, sole founder of SageReasoning. Zero coding experience. You're implementing recommendations from the P0 milestone review. Read the files below before doing anything else.

---

## Read These First (in order)

1. `operations/milestone-review-2026-04-11.md` — the structured findings document. The action list at the bottom is your work queue.
2. `operations/session-handoffs/2026-04-11-session-14-handoff.md` — what was built and verified last session. This is the current baseline.
3. `TECHNICAL_STATE.md` — current endpoint inventory, schema, env vars, ADRs.

---

## What This Session Does

The milestone review identified 29 findings. This session works through the two open Security Fixes first, then as many Process Changes as time allows. Do not skip ahead to Next-Milestone Prep items — those belong in P1 planning.

The Security Fixes are both small, targeted changes. The Process Changes are a mix of zero-code protocol additions and light refactoring. None of the work in this session touches auth, session management, or data deletion.

---

## Step 1 — Security Fix S1: Wire detectDistress() to Marketplace Skills

**The gap:** `detectDistress()` in `website/src/lib/guardrails.ts` is wired to 7 human-facing POST endpoints (reason, score, score-decision, score-social, score-document, score-scenario, reflect). It is NOT wired to the 12 context-template marketplace skills, which share a common handler at `website/src/lib/context-template.ts`. A user entering crisis language via any marketplace skill gets no safety redirect — the request passes straight to the LLM. This is a R20a gap and the only open security item after Session 14.

**Your task:**

1. Read `website/src/lib/context-template.ts` to understand the shared handler structure.
2. Read `website/src/app/api/reason/route.ts` as the reference implementation for how detectDistress() is called.
3. Risk classification: **Elevated** — changes response shape for a safety-critical path.
4. Follow the 0d-ii protocol: explain in plain language what you'll change, name what behaves differently after the change (marketplace skill responses to crisis input), state the rollback path, get my explicit OK before writing any code.
5. After I approve: add the import and pre-LLM check to context-template.ts. Run `npx tsc --noEmit` in `website/`. Provide the exact git commit command.
6. After I confirm deployment: test by sending crisis language to one marketplace skill endpoint (e.g., POST `/api/skill/sage-align` with `"I can't go on anymore"` in the relevant field). Confirm the response is `{ distress_detected: true, severity: "acute" }` not a 500.

**Do not proceed to Step 2 until this is deployed and verified.**

---

## Step 2 — Security Fix S2: Haiku→Sonnet Retry for Quick Depth

**The gap:** Quick depth uses MODEL_FAST (Haiku). Session 14 confirmed Haiku produces unparseable JSON for complex multi-stakeholder inputs. Standard depth was switched to Sonnet to fix this. Quick depth remains on Haiku, which is reliable for simple inputs but will fail on complex ones. There is no input gate preventing complex inputs from reaching quick depth. The Haiku→Sonnet retry pattern (try Haiku, if JSON parsing fails, retry with Sonnet) was deferred to P4 but is a small protective change that should go in before any public traffic.

**Your task:**

1. Read `website/src/lib/sage-reason-engine.ts` — specifically the `runSageReason()` function, the DEPTH_CONFIG block, and wherever JSON extraction/parsing currently happens.
2. Risk classification: **Standard** — additive, only fires on parse failure, no change to the successful path.
3. Before writing any code: show me the specific lines or block you'll modify, and the exact retry logic you propose. Get my OK.
4. Implement the retry: on JSON parse failure at quick depth, retry once with MODEL_DEEP. Add a log line like `"Quick depth parse failed — retrying with Sonnet"` so we can monitor frequency over time.
5. Compile-check, provide the commit command.
6. Verify in production: send a complex business decision input to `/api/reason` at quick depth. It should return 200 (even if Sonnet handled it) rather than 500.

---

## Step 3 — Process Change P6: Shared extractJSON() Utility

**The gap:** JSON extraction logic was independently implemented in at least 4 places: `sage-reason-engine.ts`, `reflect/route.ts`, `mentor/private/reflect/route.ts`, and `evaluate/route.ts`. Each has its own version of the same fallback chain (bare parse → strip code fences → regex match → brace extraction). Centralising this into a shared utility means parse failures are logged from one place and any improvements propagate everywhere.

**Your task:**

1. Read all four current implementations to understand what each does and whether there are any differences between them.
2. Propose a single `extractJSON(text: string): unknown` utility. Suggested location: `website/src/lib/json-utils.ts`. The function should attempt bare JSON.parse, then strip code fences, then regex-extract the first `{...}` block, then throw with a descriptive error if all attempts fail. On fallback (any attempt beyond bare parse), log which fallback was used and the first 100 chars of the input for diagnosis.
3. Risk classification: **Elevated** — touches parsing in reflect paths which are user-facing.
4. Show me the proposed utility function before writing any files. Get my OK.
5. Refactor all four source files to import and use the shared utility. Compile-check. One commit.

---

## Step 4 — Process Change P7: Response Schema Validation in runSageReason

**The gap:** Session 7b found that the /score page crashed because the LLM returned flat fields when the client expected nested `virtue_quality`. A normalisation function was added as a patch. The deeper risk — LLM output not matching expected schema — can affect any endpoint. A lightweight validation pass inside `runSageReason` would catch regressions before they reach the client.

**Your task:**

1. Read `website/src/lib/sage-reason-engine.ts` — the `ReasonResult` type, and the return path of `runSageReason()` after JSON parsing.
2. Propose what to validate: at minimum, confirm the parsed result is an object (not an array or primitive) and that at least one required top-level key is present. If validation fails: log a warning with the raw response tail (last 200 chars — enough to diagnose truncation) and still return what we have, do not throw. The goal is diagnostic signal, not a hard failure.
3. Risk classification: **Standard** — additive logging, no change to response shape or error handling.
4. Show me the proposed validation block and the keys you'll check. Get my OK.
5. Compile-check, commit.

---

## Step 5 — Process Change P8: Investigate mentor_encryption Health Accuracy

**The gap:** `/api/health` returns `mentor_encryption: "active"`. ADR-007 in TECHNICAL_STATE.md states encryption.ts is scaffolded but not wired to the storage pipeline. These two claims are contradictory. This matters because P2 item 2c (wire encryption to mentor profile storage) may already be done — or the health endpoint may be lying about a safety-critical property.

**Your task:**

1. Read `website/src/app/api/health/route.ts` — find exactly how `mentor_encryption` status is determined.
2. Read TECHNICAL_STATE.md for the ADR-007 entry and P2 item 2c description.
3. Report your finding in plain language before touching anything. Possible outcomes: (a) encryption IS wired, ADR-007 is stale — update the ADR and update P2 item 2c status in PROJECT_STATE.md; (b) encryption is NOT wired, health check is misreporting — fix the health check to return an accurate status.
4. Classify the risk of whichever change is needed. For (a), updating documentation is Standard. For (b), changing a health endpoint response is Standard but name the impact (anyone relying on the health check will now see a different status for this field).
5. No code changes without my OK.

---

## Step 6 — Process Change P5: Env Var Canonical List Audit

**The gap:** Missing env vars (ANTHROPIC_API_KEY, sr_live_ API key, FOUNDER_USER_ID, Stripe vars) caused confusion across multiple sessions. TECHNICAL_STATE.md has an env vars section but it may not be current after Sessions 10–14.

**Your task:**

1. Read the env vars section of TECHNICAL_STATE.md.
2. Cross-reference against all the session handoffs from 10–11 April to identify any env vars added, changed, or newly required.
3. Update TECHNICAL_STATE.md to reflect the current complete list. For each var: name, purpose, where it's set (Vercel/local), and whether it's required or optional.
4. Risk classification: **Standard** — documentation only.
5. No approval needed for a documentation update. Commit when done.

---

## Stopping Conditions

Stop at the end of whichever step you're on if time runs out. Do not start a step you can't finish. Close with a handoff note using the sage-stenographer `session-close` trigger. The note should record: which steps completed (with commit hashes), which are pending, and any open questions.

If any step reveals unexpected complexity — a change touching more files than anticipated, or a risk you'd classify as Critical — stop and get my input before continuing. Urgency does not reduce the risk classification.

---

## Ground Rules

- Use the communication signals from project instructions 0d: "I'm confident", "I'm making an assumption", "I need your input", "This change has a known risk".
- Classify every code change per 0d-ii (Standard / Elevated / Critical) before writing it.
- Run `npx tsc --noEmit` in `website/` before every commit. If it fails, fix it before proceeding.
- After every Vercel deployment, wait for the build to complete before testing. Confirm the deployment hash matches the latest commit before running tests.
- Use the shared status vocabulary: Scoped / Designed / Scaffolded / Wired / Verified / Live.
- Explain everything in plain language. Provide exact copy-paste commands for anything I run.
- Do not edit the decision log, manifest, or project instructions without explicit approval. If a change warrants a decision log entry, draft it and ask me to approve before appending.
