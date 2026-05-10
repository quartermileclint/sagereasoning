# Next-Session Prompt — Stage 1 A5: Layer 3 Server-Side Service (Critical risk)

**Stream:** founder.
**Tier:** code-critical. Full templates per the standing cache (Critical templates, not Lean).
**Governing frame:** /adopted/standing-protocol-cache.md + /adopted/build-sessions-protocol-cache.md.
**Predecessor session close:** /operations/handoffs/founder/2026-05-10-stage-1-a4-key-management-close.md
**Predecessor decision-log entries:** D-A4-KEY-MANAGEMENT-WIRED-VERIFIED-2026-05-10, D-A3-LAYER2-SIGNING-WIRED-VERIFIED-2026-05-10, D-A3-LAYER2-SIGNING-ADR-ADOPTED-2026-05-10, D-A2-INPUT-VALIDATION-SURFACE-2026-05-10, D-A1-FLAG-FLIP-VERIFIED-2026-05-10, D-STAGING-PLAN-ADOPTED-2026-05-10.
**Risk classification:** **Critical** under 0d-ii (R20a perimeter — direct; AC5 engages; PR6 engages because Layer 3 carries the deterministic distress pass-through injection that is the third layer of the substrate's three-layer R20a defence). **Critical Change Protocol applies in full.** Per T-A3-NEW-1 (now reaching THIRD confirmed application across the build arc; eligible for process-rule promotion at a separate routine governance session per Rule B), the AI drafts CCP responses ahead of time inside the A5 ADR so the eventual scaffolding work inherits them rather than starting from scratch.

---

## Founder governing note (still in force for the duration of the build arc)

Per `/adopted/build-sessions-protocol-cache.md` §"Founder governing notes for the duration of the build arc": **No current users (affirmed 2026-05-10).** The only logins are the founder's and known test logins. The Critical Change Protocol's step 3 ("What happens to existing sessions?") may be answered "N/A — only founder + test logins exist; no third-party sessions to invalidate." All other Critical Change Protocol steps remain in full force. When the plugin ships and external users exist, this simplification ends.

---

## Why this session matters

A4 (Verified 2026-05-10) operationalised the Layer 2 signing key rotation contract. Every authoritative `Layer2Assessment` is signed; verifiers can refresh the public key during a 30-day rotation overlap window; the first scheduled rotation lands 2026-09-06.

**A5 builds the Layer 3 server-side service** — the third and final layer of the substrate's translation-sandwich architecture. Per `/adopted/ADR-stoic-agent-substrate-concept.md` §"The moat boundary": *"Layer 2 alone is too cryptic for direct consumer use; Layer 3 alone is just an LLM with a Stoic system prompt — the very thing the substrate exists to displace. The pair, working together with cryptographic signing, is the substrate's distinct contribution."*

A5's deliverables:
- **Layer 3 prose-generation service** that takes a `Layer2Assessment` and produces consumer-readable prose adapted per the `prose_mode` parameter (clinical / terse / standard / educational — per A6 scope; A5 establishes the prose_mode-aware interface even if A6 enumerates the modes).
- **R20a deterministic distress injection** — the third layer of the three-layer R20a defence. When the upstream R20a gate (in-plugin script + server-side gate) detects distress, Layer 3 injects the canonical distress pass-through statement deterministically, bypassing prose adaptation. Per `/adopted/ADR-stoic-agent-substrate-concept.md` §"Three-layer R20a defence": *"Layer 3 deterministic injection is the final enforcement; if it ever fails, the perimeter has failed."*
- **R3 disclaimer + R19 limitations injection** — also deterministic; baked into every prose response so R19's mirror principle and R3's professional-help disclosure are unconditional.
- **Sonnet model selection** per AC1 + cache row "Layer 3 translation (alt-3)" — multi-step structured prose generation requires Sonnet's reliability boundary.
- **PR1 single-endpoint proof** on `/api/reason` first (already substrate-canonical per M1-CP6); rollout to other endpoints comes during K-category migration in Stage 2.

After A5 reaches Verified, the build arc proceeds to **A7 — Server-side R20a gate** (Critical risk per AC5; A5 + A7 together complete the three-layer R20a defence's server-side portion). A7 may move ahead of A5 if you prefer to land the upstream gate first; that's a valid sequencing call to surface at A5 session-open.

---

## Pre-conditions

1. The session-close commit from this session (A4) is on origin/main (run `git log --oneline -3 origin/main` and confirm both the A4 wiring commit and the A4-Verified session-close commit are present).
2. Production is in a known-good state: A3 + A4 surfaces all Verified; `/api/public-key` returns the steady-state shape (`previous: null`, `rotation_overlap_until: null`) with `key_id='substrate-layer2-2026Q2'`; all four `SUBSTRATE_LAYER2_PREVIOUS_*` env vars are UNSET.
3. Founder calendar reminder for Sunday 2026-09-06 has been added (or scheduled to be added between sessions).
4. The existing bundled-prose path on `/api/reason` continues to function — A5 will design Layer 3 to integrate with `parallel-run.ts`'s composed-output construction (where A3 wired the signing branch); the existing prose generation in `parallel-run.ts` (whatever shape it currently has) is the migration target the A5 design replaces for substrate-originated calls.
5. **Optional but recommended before A5 begins:** a routine governance session that clears the F-series stewardship backlog (Jest configuration; `.gitignore` additions for `tsconfig.tsbuildinfo` + `website/tmp/`; founder calendar consolidation across multiple cryptographic-key reminders; T-series promotions for T-AT-LEAST-NEW-1 + T-A3-NEW-1 + T-A3-NEW-2 reaching third+ confirmed recurrences). ~45 min Standard-risk session. Not blocking for A5 but recommended for stewardship hygiene before the next Critical-tier surface.

---

## Part A — Open under the protocol

Read in order (Critical-tier session — read everything below in full, do not skim):

1. `/adopted/standing-protocol-cache.md` (~3 min — confirms tier, model selection, signals, Critical-risk template form)
2. `/adopted/build-sessions-protocol-cache.md` (~3 min — substrate architecture; "no current users" governing note; build-arc-specific session-open checklist)
3. `/operations/handoffs/founder/2026-05-10-stage-1-a4-key-management-close.md` (~10 min — predecessor close; Next-Session-Should block; PR5 + T-series + F-series carry-forward; Orchestration Reminder)
4. **`/adopted/ADR-stoic-agent-substrate-concept.md` end-to-end** (~15 min — particularly §"The moat boundary" + §"Three-layer R20a defence" + §"Layer 3" — A5 implements the closed Layer 3 server-side portion of this architecture)
5. `/adopted/ADR-layer2-signing-infrastructure.md` §"Decisions" + §"Consequences" (~5 min — the Layer 2 contract A5's Layer 3 consumes; particularly the wire shape `{assessment: Layer2Assessment, signature: string, key_id: string}` that Layer 3 receives)
6. `/adopted/ADR-A4-key-management.md` §"Decisions" (~5 min — context for how Layer 2 + key management compose; A5 does not change Layer 2 or key management; A5 builds on top)
7. `/adopted/substrate-plugin-staging-plan.md` §"Stage 1 — Backend foundations" — the A5 row + Stage 1 success criteria + dependencies + the A6 row (prose_mode parameter — A5 may surface choices that A6 finalises) + the A7 row (server-side R20a gate — A5 design must accommodate the A7-provided distress signal)
8. Last 3 decision-log entries (`D-A4-KEY-MANAGEMENT-WIRED-VERIFIED-2026-05-10` + `D-A3-LAYER2-SIGNING-WIRED-VERIFIED-2026-05-10` + `D-A3-LAYER2-SIGNING-ADR-ADOPTED-2026-05-10`)
9. **The existing Layer 3 / prose-generation surface in the codebase:**
   - `/website/src/lib/translation-sandwich/parallel-run.ts` — particularly `runSandwichInner` (the composition site where Layer 3 will integrate; A3 wired the signing branch here; A5 wires the Layer 3 service after the signing branch)
   - `/website/src/lib/translation-sandwich/layer2-mechanisms.ts` lines 342–365 — `Layer2Assessment` interface (the input Layer 3 consumes)
   - `/website/src/app/api/reason/route.ts` — the route Layer 3 will surface its output through; particularly the existing prose-construction path that Layer 3 replaces for substrate-originated calls
   - Any existing prose-generation module under `/website/src/lib/translation-sandwich/` if one exists already (the A5 design may extend or replace it)
10. **R20a + R19 + R3 reference material:**
    - `/manifest.md` — R20a (vulnerable user detection and redirection); R20b (independence encouragement); R20d (relationship asymmetry guidance); R19 (mirror principle, limitations); R3 (professional-help disclosure)
    - The existing distress-classifier wrapper (whatever module currently enforces R20a in the codebase — the A5 design integrates with this)

Confirm at session open: tier (`code-critical`); risk class (Critical under 0d-ii; PR6 + AC5 engage — direct R20a perimeter); hold-point status (P0 0h still active); model selection (cite cache row "Layer 3 translation (alt-3)" — Sonnet (DeepModel)); status vocabulary (this session moves A5 from Scoped → Designed → Scaffolded → Wired → Verified, ideally in one session — follow the A3 + A4 precedent, with the option to split if R20a-injection complexity warrants); Critical Change Protocol form (full templates).

---

## Part B — Procedure

### Step 1 — Founder elects four (or five) session-opening choices (~25 min)

Five named choices the AI surfaces with trade-offs at session-open. Choices 1–4 follow the A3 + A4 pattern; Choice 5 is A5-specific (single-session vs split-session).

**Choice 1 — Session split: ADR drafting only, or ADR + scaffolding in one session.**
- **(a) ADR + scaffolding in one session** (Recommended IF the founder has 4–5 hours available and the R20a injection design surfaces no novel decisions). Mirrors the A4 precedent. Reaches A5 Verified within one session.
- **(b) ADR drafting only this session; scaffolding next session.** Mirrors the A3 precedent (A3-ADR-Adopted then A3-Wired-Verified). Recommended if the R20a injection has design questions that warrant deliberation between sessions.
- **(c) Three-session split: ADR / R20a injection design / scaffolding.** Recommended only if the R20a injection design surfaces architectural questions that need their own ADR (e.g., a separate "Three-Layer R20a Defence Architecture" ADR that A7 will also cite).

**Choice 2 — Layer 3 model selection: Sonnet (per AC1).**
- **(a) Sonnet (Recommended).** Per AC1 + standing cache row "Layer 3 translation (alt-3)" — multi-step structured prose generation requires Sonnet's reliability boundary; Haiku is unreliable for this workload per KG2. This is the architecturally inherited choice; this Choice exists to make it visible at session-open per PR4 (model selection cited).
- **(b) Haiku for some tier.** Rejected unless the founder identifies a specific reason to question AC1's model-selection table.

**Choice 3 — R20a deterministic injection placement.**
- **(a) Inside the Layer 3 service module** (Recommended — mirrors the architectural intent of "Layer 3 carries the third layer of the R20a defence"). The Layer 3 service receives a distress signal from upstream (A7's server-side R20a gate, when wired) and substitutes the canonical distress pass-through statement for the entire prose output. Layer 3 does not adapt the distress statement per `prose_mode` — the statement is canonical and unconditional.
- **(b) In a separate `r20a-injection.ts` module** that Layer 3 imports. Slightly more modular; risks the Layer 3 service skipping the import-and-call; AC4 invocation testing harder.
- **(c) In the orchestrator (`parallel-run.ts`) before Layer 3 is called.** Rejected because it puts the R20a decision outside Layer 3's contract; future Layer 3 consumers (post-K-category migration) would need to re-implement the gate.

**Choice 4 — `prose_mode` parameter handling at A5 (vs A6).**
- **(a) A5 establishes the prose_mode-aware interface; A6 enumerates the modes** (Recommended). A5's Layer 3 service accepts a `prose_mode: string` parameter; A6 enumerates the canonical modes (`clinical / terse / standard / educational`) and adds the enum validation. A5 can ship with a single mode (e.g., `'standard'` as the default) and A6 expands.
- **(b) A5 enumerates the modes in-session.** Combines A5 + A6 scope; reduces session count by 1 but increases A5 complexity; the prompt's `Anticipated session shape` budget assumes this is NOT elected.
- **(c) A5 ships with a hard-coded prose mode (no parameter).** A6 retrofits the parameter. Simplest A5 scope; trades A6 complexity.

**Choice 5 — Sequencing: A5 first, or A7 first.**
- **(a) A5 first** (matches the A4 close's forecast). A5 builds Layer 3 with a placeholder for the distress signal; A7 wires the upstream R20a gate that produces the signal. The placeholder is a typed parameter the upstream caller passes; in the absence of A7, the parameter is always `false` (no distress detected).
- **(b) A7 first, then A5.** A7 (server-side R20a gate) lands first; A5 then has the real distress-signal source available at scaffolding time. Slight design risk: A7 is built without a Layer 3 to integrate with, so A7's contract must be designed with Layer 3 in mind anyway. Trades complexity equivalently.
- **(c) A5 + A7 in parallel.** Two separate sessions running near-simultaneously with explicit interface contract decided up-front. Higher coordination cost; not recommended for a single-founder build.

The session does not proceed past Step 1 without the founder electing all five (or four if Choice 5 was decided post-A4). AI surfaces trade-offs; founder elects.

### Step 2 — A5 ADR drafted in-session (~45–60 min)

Following the A3 + A4 precedent. The AI drafts `/drafts/ADR-A5-layer-3-service.md` covering:
- The five Choice elections from Step 1 with reasoning + alternatives considered.
- The Layer 3 service interface: `generateProse(signedAssessment: SignedLayer2Assessment, options: { prose_mode: string, distress_signal: boolean }): Promise<string>` (or whatever signature the Choice 3 + 4 elections produce).
- The R20a deterministic injection contract: when `distress_signal === true`, return the canonical distress statement verbatim; do not consult the LLM; do not adapt per `prose_mode`. The canonical statement text is committed to the ADR.
- The R3 + R19 deterministic injection contract: appended to every Layer 3 prose response unconditionally (not LLM-generated; not adaptable). The canonical statement texts are committed to the ADR.
- The model-selection commitment (Sonnet per AC1).
- The Layer 3 prompt template structure: how the `Layer2Assessment` is passed to Sonnet; what system prompt frames the prose generation.
- The wiring site in `parallel-run.ts` (after the A3 signing branch; before the composed-output construction).
- The integration with the existing prose-generation path (replaces it for substrate-originated calls; the bundled-prose path remains for any V3 endpoints not yet K-category-migrated).
- Critical Change Protocol responses pre-drafted (per T-A3-NEW-1 pattern; third+ observation).
- Cross-references to substrate ADR + A3 ADR + A4 ADR + the R20a + R19 + R3 manifest rules.
- AC5 + AC7 compatibility posture.
- Approval gate (Path A — adopt this session, IF Choice 1(a) elected; Path B — adopt at separate session if Choice 1(b) elected).

The ADR is comparable in length to A3's (~440 lines) because A5's architectural decisions are larger than A4's (multiple safety-critical injections + LLM integration + prose_mode-aware interface).

### Step 3 — Critical Change Protocol responses confirmed (~10–15 min)

Per the A5 ADR's pre-drafted CCP section. The AI walks through each of the six steps in conversation:
1. **What is changing** (plain language; founder's perspective).
2. **What could break** — failure modes specific to A5: Layer 3 LLM call failure (mitigated by fail-closed to error response, NOT to fallback prose); R20a injection bypass (the safety-critical risk; mitigated by AC4 invocation testing + hard-coded canonical statement); R3 + R19 injection drift (mitigated by canonical statement commitment in ADR); prose_mode validation gaps (mitigated by enum check at the route layer); Sonnet cost shape change (Layer 3 adds a Sonnet call to every substrate-originated request; flagged for R5 cost-as-health-metric monitoring).
3. **What happens to existing sessions** — N/A per build-arc cache governing note.
4. **Rollback plan** — three paths: Path A (feature-flag-gate the Layer 3 service, defaulting to flag-off, mirroring the A3 SUBSTRATE_LAYER2_SIGNING_ENABLED pattern); Path B (git revert); Path C (env-var loss for any new env vars A5 introduces, e.g., a Layer 3 system prompt env var if the prompt isn't hard-coded).
5. **Verification step** (founder-performable, post-deploy) — drafted at Step 7 below.
6. **Explicit approval required** — the founder types "OK" or "go ahead" specific to the named risks before deploy.

### Step 4 — Implement Layer 3 service module (~60–90 min)

Per Choices 1–4 from Step 1.

Create new file `/website/src/lib/translation-sandwich/layer3-service.ts` (or similar — exact naming decided at the ADR stage):
- Export `generateProse(signedAssessment, options): Promise<string>` per the ADR signature.
- Internal: build the Layer 3 prompt from the `Layer2Assessment` fields per the ADR template.
- Call Sonnet via the existing `claude-sonnet-4-6` integration pattern (mirror an existing surface like `/api/mentor/private/reflect` for the LLM call shape; cite the precedent in the ADR).
- Branch on `options.distress_signal === true` BEFORE the LLM call: short-circuit to the canonical distress pass-through statement; return immediately.
- Append R3 + R19 canonical statements to the LLM-generated prose unconditionally (post-LLM-call but before return).
- Doc-comment block citing AC1, AC4, AC5, AC7, KG1, PR3, PR4, PR6 compliance.
- Add Jest-style unit test file at `__tests__/layer3-service.test.ts` (ready-for-Jest pattern matching A3 + A4 tests):
  - Distress short-circuit produces canonical statement (no LLM call invoked)
  - Non-distress path produces LLM-generated prose
  - R3 + R19 statements appended unconditionally
  - prose_mode parameter respected (parameter passed through to LLM prompt)
  - Sonnet model selected (verified by checking the `model` parameter in the LLM call)

### Step 5 — Wire the Layer 3 service into `runSandwichInner` (~30 min)

Modify `/website/src/lib/translation-sandwich/parallel-run.ts`:
- Add imports for `generateProse` + the new types.
- Add module-load constant `SUBSTRATE_LAYER3_ENABLED = process.env.SUBSTRATE_LAYER3_ENABLED === 'true'` (mirrors A3's `SUBSTRATE_LAYER2_SIGNING_ENABLED` feature-flag pattern; Path A rollback = "flip flag false" ~30s).
- Add the Layer 3 branch in `runSandwichInner` after the A3 signing branch. When flag is on, replace the existing prose-generation call with `generateProse(signedAssessment, { prose_mode, distress_signal })`. The `distress_signal` source: the A7 placeholder (always `false` until A7 lands per Choice 5(a)) OR the existing distress-classifier output if a current-codebase wrapper provides it.
- When flag is off, the existing bundled-prose path remains exactly as today.

### Step 6 — Type-check and run unit tests (~15 min)

Mirror A3 + A4 Step 7.
```bash
cd "/Users/clintonaitkenhead/Claude-work/PROJECTS/sagereasoning/website"
npx tsc --noEmit -p tsconfig.json   # type-check; exit code 0 required
```
The Jest tests cannot execute until Jest is configured (F-series stewardship debt); the AI runs an `npx tsx` smoke test of the same invariants per the T-A3-NEW-4 pattern. Cleanup: `rm -rf website/tmp` post-session per the founder verification block.

### Step 7 — Critical Change Protocol — explicit founder approval (~5 min)

The AI surfaces the full CCP responses (confirmed at Step 3 + the implementation specifics from Steps 4–6) one more time. Founder types "OK" or "go ahead" specific to the named risks.

### Step 8 — Deploy via session-close commit (founder's own terminal)

Single commit covering: A5 ADR move from /drafts/ to /adopted/ (Path A — IF Choice 1(a) elected), Layer 3 service module + tests, parallel-run.ts modification, Vercel env-var provision steps documented in the commit message body.

The Vercel env-var provision happens BEFORE the founder pushes the commit (mirrors A3's SUBSTRATE_LAYER2_SIGNING_KEY ceremony):
- `SUBSTRATE_LAYER3_ENABLED` provisioned as `'false'` in Vercel (default off; flipped to `'true'` mid-session for Step 9 verification).
- Any other A5-introduced env vars (e.g., a Layer 3 system prompt, if the design surfaces one).

Founder pushes via GitHub Desktop. Vercel redeploys.

### Step 9 — Three-scenario PR1 verification on `/api/reason` (~20 min)

Mirrors A3 Step 12.

**Scenario 1 — `SUBSTRATE_LAYER3_ENABLED='false'`** (zero regression):
- Bundled-prose path returns the same response shape as before A5.
- Confirm via curl + Python check that the response's prose field matches the existing format.

**Scenario 2 — Flag flipped to `'true'` + Vercel redeployed** (Layer 3 happy path):
- Layer 3 service generates prose via Sonnet.
- Response carries the new prose with R3 + R19 statements appended.
- Confirm via curl + Python check.

**Scenario 3 — Distress-signal injection** (R20a deterministic injection verified):
- Submit input that triggers the distress classifier (or simulate via test injection).
- Layer 3 short-circuits to the canonical distress pass-through statement.
- Confirm the response is the canonical statement verbatim, NOT LLM-generated prose.
- This is the safety-critical scenario; Scenario 3 must pass.

After verification: `SUBSTRATE_LAYER3_ENABLED` remains `'true'` post-session (the substrate's Layer 3 service is now the production prose path for substrate-originated calls).

### Step 10 — Append decision-log entry (full form per Critical session)

Pattern: full form per the standing cache. Entry ID: `D-A5-LAYER-3-SERVICE-WIRED-VERIFIED-2026-MM-DD` if all verification scenarios pass; `D-A5-LAYER-3-SERVICE-WIRED-2026-MM-DD` if Verified status is not reached this session. Records: the five Step 1 elections; CCP responses verbatim; the files touched; risk classification (Critical); rollback paths; verification steps; PR5 carry-forward; T-series tacit-knowledge findings; F-series stewardship findings; full Rules-served list.

### Step 11 — Session close (full form per Critical session)

Pattern: full form per the standing cache. Includes the additional sections: Verification Method Used, Risk Classification Record, PR5 Knowledge-Gap Carry-Forward, Founder Verification (Between Sessions), Orchestration Reminder. Save to `/operations/handoffs/founder/2026-MM-DD-stage-1-a5-layer-3-service-close.md`.

Next-Session-Should block: **A7 — Server-side R20a gate** (Critical risk per AC5 + PR6; the second layer of the three-layer R20a defence; A7 + A5 together complete the server-side portion).

---

## Part C — Anticipated session shape

| Phase | Estimate (Choice 1(a) one-session) | Estimate (Choice 1(b) ADR-only) |
|---|---|---|
| Cache + predecessor close + ADR re-reads + code-path reads | 35–45 min | 35–45 min |
| Step 1 — five session-opening elections | 25 min | 25 min |
| Step 2 — A5 ADR drafted in-session | 45–60 min | 60–90 min (more deliberation possible) |
| Step 3 — CCP responses confirmed | 10–15 min | n/a (deferred to scaffolding session) |
| Step 4 — Layer 3 service module + tests | 60–90 min | n/a |
| Step 5 — wire into parallel-run.ts | 30 min | n/a |
| Step 6 — type-check + tests | 15 min | n/a |
| Step 7 — explicit founder approval | 5 min | n/a |
| Step 8 — deploy via session-close commit | 10 min | 5 min (ADR adoption only) |
| Step 9 — three-scenario PR1 verification on /api/reason | 20 min | n/a |
| Step 10 — decision-log entry (full form) | 30 min | 25 min (lighter for ADR-only) |
| Step 11 — session close (full form) | 25 min | 20 min |
| **Total (Choice 1(a) one-session)** | **~5–6 hours** | — |
| **Total (Choice 1(b) ADR-only)** | — | **~2–2.5 hours** |

If the session reaches the 5-hour mark without Verified status under Choice 1(a), close at the most stable point per the founder's "I'm done for now" signal.

**Documented stable points if early closure is needed:**
- **After Step 2, before Step 3:** A5 ADR drafted but unadopted. Status: A5 Designed. Decision-log entry captures the ADR; resume with Step 3 next session.
- **After Step 5, before Step 6:** code complete; nothing deployed. Status: A5 Scaffolded.
- **After Step 8, before Step 9:** deployed; verification not yet run. Status: A5 Wired (code on production; verification pending).
- **After Step 9 (any failure):** rollback Path A engaged (`SUBSTRATE_LAYER3_ENABLED='false'` in Vercel + redeploy). Status: A5 Wired but not Verified; the failed scenario is the open question for the next session.

---

## Rollback path

Three paths in order of preference (mirrors A3 pattern):
- **Path A (preferred — within minutes of any failure):** in Vercel, set `SUBSTRATE_LAYER3_ENABLED='false'` and redeploy. The substrate immediately returns to the bundled-prose path; existing pipeline unaffected. Recovery ≤30s.
- **Path B (revert the deploy):** `git revert <a5-wiring-commit-hash>` and push via GitHub Desktop. Vercel redeploys prior code (the A4-Verified state). Recovery ≤5 min.
- **Path C (env var loss):** if A5 introduces additional env vars beyond `SUBSTRATE_LAYER3_ENABLED`, restoration paths documented at scaffolding time per Decision N of the A5 ADR.

If all three rollback paths are exhausted: declare incident; engage the encryption-wiring incident-response pattern from `ADR-ENCRYPTION-WIRING-01`; report at session close. The R20a-injection bypass is the load-bearing safety failure mode — if Scenario 3 fails post-deploy, Path A is engaged immediately and the failure is treated as a P0 incident.

---

## Forecast

**Most-likely path (Choice 1(a) elected):** founder elects the five recommended Step 1 options (1(a) one-session ADR + scaffolding; 2(a) Sonnet; 3(a) inside Layer 3 service; 4(a) prose_mode-aware interface with A6 enumerating modes; 5(a) A5 first then A7). Steps 2–6 complete cleanly. Step 7 founder approval given specifically against the named risks. Step 8 deploys cleanly. Step 9 three-scenario verification passes on first run — including Scenario 3 (the safety-critical R20a injection test). A5 reaches **Verified**. Decision-log + close at ~5–6 hours. Next session: A7 — Server-side R20a gate.

**Possible variations:**
- **Choice 1(b) elected (ADR-only).** Session closes at A5 Designed status; scaffolding deferred to the next session. The ~2.5-hour session still produces the architectural commitment + the implementation specs that scaffolding will execute.
- **Step 9 Scenario 3 fails** (the safety-critical case). This is the load-bearing test. Most likely cause: distress-signal source not wired correctly (A7 placeholder returns wrong type) or Layer 3 doesn't short-circuit before LLM call (AC4 invocation gap). Diagnosis: ~20 min. If diagnosable, fix in-session; if not, engage Path A and close at A5 Wired (not Verified).
- **Founder reconsiders Choice 5 mid-session and elects A7-first.** Allowed; the A5 ADR can be drafted with the placeholder distress-signal interface and the A7 design committed alongside. Session may extend by ~30 min.

**What success looks like at session close (Choice 1(a)):**
- A5 implementation status: Scoped → Designed → Scaffolded → Wired → **Verified** on `/api/reason` (all five transitions in one session, by way of the three-scenario PR1 proof; mirrors the A3 + A4 precedent).
- 1 new code file (`/website/src/lib/translation-sandwich/layer3-service.ts`); 1 new test file (`__tests__/layer3-service.test.ts`); 1 modified code file (`parallel-run.ts`); 1 new ADR (`/adopted/ADR-A5-layer-3-service.md`).
- New Vercel env-var provisioned: `SUBSTRATE_LAYER3_ENABLED='true'` (post-session; flipped from `false` after Scenario 1 confirms zero regression).
- The substrate's three-layer architecture is technically delivered for substrate-originated calls: Layer 1 (text → structured features) + Layer 2 (deterministic mechanism application + signing) + Layer 3 (prose generation + R20a + R3 + R19 deterministic injection).
- Decision-log entry full form recording the five Step 1 elections, the CCP responses verbatim, the verification scenarios, the rules served.
- Session close full form with Founder Verification, Risk Classification Record, PR5 carry-forward, T-series + F-series findings, Orchestration Reminder.
- Next session named: **A7 — Server-side R20a gate** (Critical risk per AC5 + PR6; the second layer of the three-layer R20a defence; A7 + A5 together complete the server-side portion).

End of prompt.
