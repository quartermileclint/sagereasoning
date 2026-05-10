# Next-Session Prompt — Stage 1 A2: Layer 2 Input Validation Surface (Scaffold + Wire on /api/reason)

**Stream:** founder.
**Tier:** code-elevated. Lean templates per the standing cache. Critical Change Protocol NOT engaged by default — but A2's design may surface a Critical-class decision (e.g., a new ingress path that bypasses the existing R20a-on-text perimeter); if so, reclassify upward and engage CCP for that specific change.
**Governing frame:** /adopted/standing-protocol-cache.md + /adopted/build-sessions-protocol-cache.md.
**Predecessor session close:** /operations/handoffs/founder/2026-05-10-stage-1-a1-verified-close.md
**Predecessor decision-log entries:** D-A1-INVOCATION-SITE-2026-05-10, D-A1-FLAG-FLIP-VERIFIED-2026-05-10, D-A1-LAYER2-AUTH-SCAFFOLD-2026-05-10, D-STAGING-PLAN-ADOPTED-2026-05-10
**Risk classification:** Elevated under 0d-ii by default (input-validation surface for plugin-originated traffic; not auth surface; PR1 single-endpoint discipline still applies). Reclassify upward only if a specific A2 design choice engages an auth, R20a, or encryption surface.

---

## Founder governing note (still in force for the duration of the build arc)

Per `/adopted/build-sessions-protocol-cache.md` §"Founder governing notes for the duration of the build arc": **No current users.** If A2's design produces a Critical-class decision that engages the Critical Change Protocol, step 3 ("What happens to existing sessions?") may be answered "N/A — only founder + test logins exist; no third-party sessions to invalidate." All other CCP steps remain in full force.

---

## Why this session matters

A1 reached Verified last session — plugin-auth is live on `/api/reason` and the PR1 single-endpoint proof is complete. A2 is the next item in Stage 1's critical path. It addresses the architectural question: **once a plugin-authenticated request lands at `/api/reason`, what does the input look like, and how is it validated?** Today's `/api/reason` accepts raw text input + context strings (validated for length only); the substrate architecture (per `/adopted/ADR-stoic-agent-substrate-concept.md`) has plugins running Layer 1 *locally* and submitting a structured `Layer1Schema` to Layer 2 ingress. A2 is where that ingress contract is decided, scaffolded, and verified on the proof endpoint.

A2 also feeds A3 (signing). Once A3 lands, every `Layer2Assessment` is cryptographically signed against the input it derived from — that input must have a stable, validated shape. A2 establishes that shape.

---

## Pre-conditions

1. The session-close commit from the predecessor session is on origin/main and Vercel has deployed it cleanly. (The founder confirmed Vercel green at predecessor session close.)
2. A1 plugin-auth is still Verified on production. The optional re-verification curl in the predecessor close confirms this; if the founder did not run it, the next session AI should run it as part of session-open verification.
3. Founder has reviewed the predecessor close's "Open Questions" block — particularly questions 1 (capability-matrix update for the new tri-auth pattern) and 4 (deferred Options (b) and (c)). A2 does not require these to be resolved, but they may resurface during A2's design.
4. Founder is ready to scope A2 at session-open. AI will surface trade-offs on the three named A2 design questions below before the founder elects.

---

## Part A — Open under the protocol

Read in order:
1. `/adopted/standing-protocol-cache.md` (~3 min — confirms tier, model selection, risk class, signals, lean templates apply)
2. `/adopted/build-sessions-protocol-cache.md` (~3 min — build-arc context; confirm no-current-users governing note still in force)
3. `/operations/handoffs/founder/2026-05-10-stage-1-a1-verified-close.md` (~5 min — predecessor close)
4. Last 4 decision-log entries (the two A1 entries from predecessor session plus the scaffold-predecessor + staging-plan-adoption):
   - `D-A1-FLAG-FLIP-VERIFIED-2026-05-10`
   - `D-A1-INVOCATION-SITE-2026-05-10`
   - `D-A1-LAYER2-AUTH-SCAFFOLD-2026-05-10`
   - `D-STAGING-PLAN-ADOPTED-2026-05-10`
5. `/adopted/substrate-plugin-staging-plan.md` §"Stage 1 — Backend foundations" (especially the A2 row + dependencies + Stage 1 success criteria)
6. `/adopted/ADR-stoic-agent-substrate-concept.md` §"The three layers" — Layer 1's input/output and the moat boundary; A2 sits at the Layer-1-output / Layer-2-input boundary
7. `/website/src/app/api/reason/route.ts` — the now-Verified A1 surface (lines 173 + 199 + 313–326). Pay attention to lines 306–319 (existing inline text-length validation — the predecessor pattern A2 may extend or replace) and lines 393–400 (depth validation)
8. `/website/src/lib/translation-sandwich/layer1-extractor.ts` — **especially `interface Layer1Schema` at line 228 + `validateLayer1Schema` at line 520**. The validation function already exists for internal use by the orchestrator; A2 may be able to leverage it directly at the route ingress
9. `/website/src/lib/security.ts` — `validateTextLength` + `TEXT_LIMITS` (the existing per-field validation pattern)
10. `/website/src/lib/constraints.ts` — the type-enforcement pattern referenced by the staging plan ("type-enforced via constraints.ts pattern")

Confirm at session open: tier (code-elevated by default; reclassify upward if a design choice engages auth/R20a/encryption); hold-point status (P0 0h still active); model selection (cite cache row — N/A unless the validation surface adds an LLM call, which it should not); status vocabulary; signals + risk class; build-arc Rule A applicability (no — no public artefact this session); Rule B applicability (no — execution, not planning); the no-current-users governing note (acknowledged before any change classified Critical begins).

---

## Part B — Procedure

### Step 1 — Founder elects A2 design choice (~20 min, governance)

Three named design choices the founder elects at session-open. AI presents trade-offs on request.

**Design choice 1 — New Layer1Schema ingress vs validation-on-existing-text-input.**

- **(i) New ingress path:** Accept a pre-computed `Layer1Schema` in the request body (e.g., a new `layer1_schema` field). Plugin-authenticated requests *may* submit either raw text (existing path; Layer 1 runs server-side) or a Layer1Schema (new path; server-side Layer 1 skipped). If Layer1Schema is present, validate it via `validateLayer1Schema` and pass directly to Layer 2 via `runSandwich`. **Matches the substrate ADR architecturally** (plugin runs Layer 1 locally; Layer 2 ingress accepts validated Layer1Schema).
- **(ii) Validation-only-on-existing-text-input:** Keep the existing text-input ingress; tighten validation around it (e.g., richer schema for the `body` object — required fields, allowed depths, structured `domain_context`, etc.). No new ingress; plugin-authenticated requests still submit raw text and Layer 1 runs server-side. **Defers the substrate-architectural shape** to a later session; treats A2 as request-validation hygiene rather than substrate ingress.
- **(iii) Both:** Add the new Layer1Schema ingress AND tighten the existing text-input validation in the same session. **Largest scope; risk of session overrun.**

**Recommendation default if founder defers:** (i) — the new Layer1Schema ingress. The substrate ADR explicitly anticipates this; deferring it leaves the substrate's plugin-side architecture unimplemented past A1 and pushes the contract into A3. The existing text-input validation is already adequate for the user-auth and API-key paths; the new ingress is the meaningful A2 work for plugin-auth.

**Design choice 2 — Validation precedence relative to R20a perimeter.**

Today's R20a perimeter (`enforceDistressCheck` at line 331 of route.ts) runs on the raw `input` field after auth + body parsing + text-length validation, before any sandwich call. If A2 adds a new Layer1Schema ingress, where does R20a run?

- **(a) R20a runs on the input that produced the Layer1Schema** (the plugin sends the Layer1Schema *and* the original input text; server-side R20a runs on the text). Preserves the AC5 perimeter shape exactly.
- **(b) R20a runs on a derived text representation of the Layer1Schema** (server-side reconstructs a text-equivalent of the Layer1Schema and runs R20a on that). More architectural but harder to verify the reconstruction is faithful.
- **(c) R20a is delegated to the in-plugin script** (Layer A of the three-layer R20a defence per ADR Decision 3) and the server-side gate is omitted for Layer1Schema-direct ingress. **Critical-class decision** — would require CCP writeup and engages PR6 + AC5 + AC7. Not recommended for A2; this belongs in Stage 1 item A7 (server-side R20a gate) or Stage 3 item B2 (in-plugin R20a script).

**Recommendation default if founder defers:** (a) — require both the Layer1Schema *and* the original `input` text in the new-ingress request shape; R20a runs on the text exactly as today. Cleanest preservation of AC5; least architectural commitment about the three-layer R20a defence's specific handover mechanism.

**Design choice 3 — Validation function surface.**

- **(α) Reuse `validateLayer1Schema` directly** at the route ingress. Already exists; already tested by the internal orchestrator. **Smallest change.**
- **(β) Wrap `validateLayer1Schema` in a route-ingress helper** (e.g., `validatePluginRequest`) that combines schema validation with any other field validation needed (depth, original_input length, etc.) and returns a unified error response. **Slightly more code but cleaner separation.**
- **(γ) New per-field validation function** mirroring the existing `validateTextLength` pattern. **Largest change; least benefit; recommended against.**

**Recommendation default if founder defers:** (β) — small wrapper for clean separation; mirrors the existing dual-auth pattern's clean boundaries.

### Step 2 — Wire the validation surface (~1.5 hr, Elevated)

Per the elected combination of design choices. PR1 single-endpoint discipline: only `/api/reason/route.ts` is touched; no other route file. If validation reuses `validateLayer1Schema`, that file is also untouched.

If the elected combination produces a Critical-class change (e.g., choice 2(c) was elected against recommendation), perform the full Critical Change Protocol writeup inline before any code change.

### Step 3 — Verification on the proof endpoint (~30 min, governance)

Three scenarios mirroring the A1 verification methodology (T-AT-LEAST-NEW-1 from predecessor close):

1. **Valid Layer1Schema ingress (or validated text under new validation rules) returns 200** with the standard translation-sandwich-v1 response.
2. **Invalid Layer1Schema (or invalid text under new validation rules) returns 400** with a clear, specific error message indicating which field failed.
3. **Existing user-auth + API-key paths return 200** (zero regression on the existing flow).

If the elected design choice 1 was (i) New ingress, Scenario 1 sends a Layer1Schema-shaped payload via plugin-auth. Use the Layer1Schema definition at line 228 of layer1-extractor.ts as the contract; AI will produce a sample valid payload at Step 3 time.

If the elected design choice 1 was (ii) Validation-only, Scenario 1 sends a richer validated body shape via plugin-auth and Scenario 2 sends a body that fails the new validation rule.

### Step 4 — Append decision-log entry (lean form, ~20 min)

Pattern: per `/adopted/standing-protocol-cache.md` §"Lean decision-log entry". Entry ID: `D-A2-INPUT-VALIDATION-SURFACE-2026-MM-DD`. Records: the elected design choice combination with reasoning; the wiring; the three verification scenarios with results; A2 status moves to **Verified**; cross-references to A1 predecessor entries.

If the session produced a Critical-class change, the entry uses the full form with the CCP writeup instead.

### Step 5 — Session close (lean form, ~20 min)

Pattern: per `/adopted/standing-protocol-cache.md` §"Lean session close". Save to `/operations/handoffs/founder/2026-MM-DD-stage-1-a2-verified-close.md`.

Next-Session-Should block: **A3 — Layer 2 signing infrastructure** (Critical risk; per staging plan Session 4 packaging; ADR drafting precedes scaffolding so the next session may begin with an A3 ADR). If A2 closed with anything less than Verified, the next session resumes A2 instead.

---

## Part C — Anticipated session shape

| Phase | Estimate |
|---|---|
| Cache + predecessor close + decision-log + ADR + route file + Layer1Schema reads | 25-30 min |
| Step 1 — design-choice election (3 design questions) | 20 min |
| Step 2 — wire validation surface | 1.5 hr |
| Step 3 — three verification scenarios | 30 min |
| Step 4 — decision-log entry (lean) | 20 min |
| Step 5 — session close (lean) | 20 min |
| **Total** | **~3.5 hours** |

If the session reaches the 4-hour budget before A2 reaches Verified, close at the most stable known point per the time-bounded session discipline. Documented stable points:
- After Step 1, before Step 2: design choices recorded but no code change. Rollback = none (no production touch).
- After Step 2, before Step 3: validation surface wired but not deployed. Rollback = `git revert` of the wiring commit.
- After Step 2 deployed, before Step 3 verification: rollback options depend on the specific change; documented inline at Step 2 time.

---

## Rollback path

For the most likely path (design choice (i) + (a) + (β); Elevated risk):
- **Code rollback:** `git revert <wiring-commit-hash>` and push. Vercel redeploys; the new ingress is gone; existing user-auth + API-key + plugin-auth-on-text paths continue to work exactly as today (A1 Verified state).
- **Production effect at rollback:** no plugin caller is yet relying on the new ingress (no current users; build-arc governing note); rollback is risk-free at the user level.

If design choice 2(c) was elected and produced a Critical-class change, additional rollback paths apply per the CCP writeup at Step 2 time.

---

## Forecast

**Most-likely path:** founder elects (i) + (a) + (β); Step 2 wiring is moderate (~1.5 hr — new request-body branching, schema validation call, error-response shaping); Step 3 all three scenarios pass on first attempt; Steps 4–5 close the session at ~3.5 hours total. A2 reaches Verified.

**Possible variations:**
- Founder elects (ii) Validation-only — Step 2 budget shrinks (~45 min); session closes earlier; A3 may begin in the same session.
- Founder elects (iii) Both — Step 2 budget grows; session may close at "ingress wired but text-validation tightening deferred" or vice versa.
- Layer1Schema's `validateLayer1Schema` function turns out to require minor adaptation for route-ingress use (e.g., it currently throws `Layer1ValidationError` whose error-message format isn't suited for direct API responses) — small wrapper handles this; +15 min.
- Apex-domain-redirect-on-POST behaviour observed for a third time during Step 3 verification — promote to permanent KG entry per PR8 third-recurrence rule.

**What success looks like at session close:**
- A2 status = **Verified** on `/api/reason`.
- Plugin-authenticated calls now have a validated input contract (per the elected design choices).
- Three verification scenarios passed.
- Decision-log entry appended (lean form unless escalated to Critical).
- Lean session close at `/operations/handoffs/founder/2026-MM-DD-stage-1-a2-verified-close.md`.
- Next session named: **A3 Layer 2 signing infrastructure** (Critical; ADR drafting precedes scaffolding).

End of prompt.
