# Deliverable 14b — Deferral-Resolution Surface Design

**Status:** Drafted (under founder review).
**Date:** 2026-05-02.
**Stream:** founder.
**Governing frame:** `/adopted/session-opening-protocol.md`.
**Implements:** AC-12 (translation-sandwich); AC-13 (three-tier intake clarification — the deferral-resolution surface is where Tier 3 OPEN_DEFERRAL flags resolve); AC-14 (withholding as deterministic kathekon); **AC-15 (1b sub-option with structured intake — this surface is the architectural implementation)**; AC-16 (three principles for long-deferred questions); **AC-18 (no-shareable-artifact constraint — non-negotiable on this surface)**; **AC-19 (reflect-endpoint-first build order — Phase-2 pass 1 builds this surface first)**; PR1 (single-endpoint proof before surface rollout); PR6 (safety-critical changes are always Critical risk); R3 (disclaimer); R7 (source fidelity); R17 (intimate data protection — the deferred questions are intimate data); R20a (vulnerable-user detection — perimeter route per AC5); R20d (relationship asymmetry).

**Status of this surface:** Today the deferral-resolution surface **does not exist**. This deliverable is its architectural specification. Phase-2 pass 1 builds it first — before any other alt-3 surface — per AC-19.

**Cross-references:**
- `/drafts/rag-mentor-alt3/canonical-framework.md` (D2 — Table 4b)
- `/drafts/rag-mentor-alt3/passion-taxonomy.md` (D3)
- `/drafts/rag-mentor-alt3/operationalised-rules.md` (D8)
- `/drafts/rag-mentor-alt3/rule-dependency-map.md` (D9)
- `/drafts/rag-mentor-alt3/layer-1-translation.md` (D10)
- `/drafts/rag-mentor-alt3/layer-3-translation.md` (D11 — Table 4b projection: NONE, AC-18 holds)
- `/drafts/rag-mentor-alt3/three-tier-intake.md` (D13 — OPEN_DEFERRAL data structure, EUPATHEIA_BOUNDARY and PRAXIS_MOTIVATION_AMBIGUITY trigger codes)
- `/drafts/rag-mentor-alt3/reflect-endpoint-14a-daily-ritual.md` (D14a — companion deliverable for the ritual surface; load order discussed)
- `/drafts/rag-mentor-alt3/long-deferred-questions.md` (D15)
- `/drafts/rag-mentor-alt3/consumer-workflow-audit.md` (D24 — Route 8 §"Flow distinctions" — the deferral-resolution flow is the second flow on `/api/mentor/private/reflect`'s code path; D24 confirms AC-18 is correctly scoped here)
- `/operations/handoffs/founder/2026-04-29e-private-mentor-rag-phase1-ALT3-close.md` (alt-3 architecture; AC-18 / AC-19 architectural arguments)
- `/manifest.md` AC1, AC2, AC4, AC5, AC6, AC7 (Session 7b standing constraint — applies if route-side auth/cookie behaviour is changed), R3, R7, R17, R20a, R20d
- `/website/src/app/api/mentor/private/reflect/route.ts` (current implementation — read-only)
- `/website/src/app/private-mentor/page.tsx` (current page — read-only)

---

## Plain-language summary

The deferral-resolution surface is the alt-3 architecture's most distinctive structural commitment. It exists because the deterministic engine deliberately withholds certain classifications (Tier 3 OPEN_DEFERRAL — eupatheia boundary; praxis-level motivation ambiguity) when the practitioner has not yet provided the self-knowledge required to confirm them. The withheld classifications surface as flags in the practitioner's scoring record, each with a specific question. The deferral-resolution surface is where the practitioner sits with those questions and addresses them in their own time — not on demand from the mentor, not with a prompt or facilitation, just the question and a structured space for reflection.

When the practitioner submits their reflection, the engine processes it through the same Tier 1/2/3 logic. On successful resolution, the original instance's score is updated retrospectively and the OPEN_DEFERRAL flag closes. **The surface produces no visible reflection score, no perspective prose, no celebratory artefact** (AC-18). The only practitioner-visible outputs are the deferred question (presented from the OPEN_DEFERRAL flag exactly as the engine deterministically composed it at scoring time) and a fixed acknowledgement that the reflection has been recorded. The closing of the open deferral becomes visible in the scoring record — but the practitioner has to look it up.

This deliverable is **the load-bearing deliverable for Phase-2 pass 1**. The architecture specifies that Phase 2 builds this surface first — before the daily-reflection ritual surface migration (D14a's Phase-2 step), before the conversation surface migration. The reason is structural: the reflect endpoint is *the unglamorous part*. Building it first signals the architectural commitment that the examination matters more than the scoring engine.

## Glossary

- **Deferral-resolution surface** — the structured intake space where the practitioner addresses an open OPEN_DEFERRAL flag.
- **OPEN_DEFERRAL flag** — a structured flag created at scoring time when the engine deterministically withheld a classification (per AC-14). The data structure is specified in D13 §"OPEN_DEFERRAL data structure".
- **Deferred question** — the question text in the OPEN_DEFERRAL flag. Composed deterministically at scoring time (slot-filled from the corpus catalogue per D-A16); the deferral-resolution surface presents the question verbatim. **Layer 3 does not compose at this surface.**
- **Retrospective score update** — when a deferral closes, the original instance's score (from the prior request, possibly days or weeks ago) is updated to reflect the now-resolved classification.
- **Structured intake** — the practitioner submits reflection content addressing the deferred question. The structure: deferred question is shown; practitioner writes reflection; engine processes the reflection through the same Tier 1/2/3 logic. AC-15 1b.
- **No-shareable-artifact constraint (AC-18)** — the architectural commitment that this surface produces no output that can be shown, shared, or used as evidence of having examined oneself. No reflection score; no progress summary; no developmental visualisation. The closing of the open deferral is visible in the scoring record but is not a celebratory artefact.
- **Reflect-endpoint-first build order (AC-19)** — Phase 2's first build pass is this surface (the deferral-resolution surface), not the conversation surface or the ritual surface. The architectural argument: the examination matters more than the scoring engine.

## The architectural argument (preserved verbatim)

The alt-3 handoff specifies AC-18's reasoning. Reproduced here so that any future revision of this deliverable that loosens the constraint must engage with the original argument:

> The reflect endpoint produces no output that can be shown, shared, or used as evidence of having examined oneself. No reflection score. No progress summary. No developmental visualisation.
>
> This is not a UX gap to be filled later. It is a deliberate architectural constraint, derived from the principle that virtue requires no external witness. For a practitioner with confirmed philodoxia, any shareable output of the examination tool becomes a reputation-generation mechanism inside the examination tool. The constraint removes the mechanism. The examination is genuinely private, genuinely unrewardable, and genuinely the practitioner's own.

The D24 audit confirmed Option 1 scoping: AC-18 holds on the deferral-resolution surface specifically. AC-18 does not hold on the daily-reflection ritual surface (D14a — visible output preserved per Table 4a). The two surfaces share the canonical engine output but project differently to the practitioner; the deferral-resolution surface produces no Layer 3 prose visible output.

This deliverable specifies how AC-18 is operationalised in the surface design. AC-18 is **non-negotiable on this surface** per the alt-3 architectural commitment.

## Surface design — own route vs same-route-different-mode

### The decision

Today the route `/api/mentor/private/reflect` serves the daily-reflection ritual flow only (the deferral-resolution flow does not exist). Two architectural options for how the deferral-resolution flow lives:

- **Same route, different mode.** `/api/mentor/private/reflect` reads a `reflection_mode: 'ritual' | 'deferral_resolution'` parameter. The route's body parse step dispatches to the ritual or deferral-resolution code path based on the mode. Pros: one route, one auth gate, one R20a check, one snapshot. Cons: the route's logic must distinguish two flows internally; the page-side caller must pass the right mode.
- **Own route.** A new route `/api/mentor/private/deferral-resolve` (or similar — name TBD) handles the deferral-resolution flow exclusively. The ritual flow stays on `/api/mentor/private/reflect`. Pros: clean separation of flows; single-endpoint proof discipline (PR1) is honoured per route; the deferral-resolution route's R20a perimeter scope is well-defined. Cons: two routes, two auth gates, two R20a checks, two snapshots.

### The recommendation

**Recommend: own route.** The new route is the **first build of Phase-2 pass 1** per AC-19.

Reasons:

1. **PR1 single-endpoint proof discipline.** The deferral-resolution flow is architecturally novel — it is the AC-15 1b structured-intake flow that does not exist today. Implementing it as a new route gives Phase-2 pass 1 a clean PR1 target: build the endpoint, prove it on its own, only then migrate the ritual flow (D14a) to share the engine code. The single-endpoint proof discipline reduces the recovery cost if Phase-2 pass 1 surfaces issues — only the new route needs revision.
2. **AC5 perimeter clarity.** Adding the new route to the R20a perimeter requires the AC5 ninth-route discipline (registry entry; import of `detectDistressTwoStage` and `enforceDistressCheck`; call pattern; passing invocation test per AC4). The discipline is well-defined and the perimeter expansion is auditable.
3. **AC-18 surface boundary clarity.** The new route's surface is *only* AC-18-constrained — every output from this surface is governed by AC-18. The ritual route stays unconstrained on visible output. The clean architectural separation matches the architectural commitment.
4. **Phase-2 pass 1's recovery surface is small.** If pass 1 surfaces issues, the new route can be pulled offline (or env-flag-gated false) without touching the ritual flow on `/api/mentor/private/reflect`. The blast radius is bounded.

### The new route name

Recommendation: **`/api/mentor/private/deferral-resolve`**. (Founder approves the name.)

Rationale: explicit naming for the architectural function ("deferral-resolve" — present-tense verb form). Mirror of `/api/mentor/private/reflect`'s structural shape (one path segment differentiating the function). R8d — agent-facing skill contract: the name is outcome-focused.

Alternatives the founder may prefer:
- `/api/mentor/private/sit-with` (philosophically aligned with the alt-3 handoff's *"there's no prompt — just what you found"* language; less standard naming convention).
- `/api/mentor/private/return` (the practitioner returns to a deferred question; less specific).

### What this deliverable specifies for the new route

The remaining sections specify the architectural shape, internal sequencing, persistence behaviour, R20a conformance, and Phase-2 pass-1 build readiness for the new route under the recommended name.

## Practitioner-facing surface

Page-side, the deferral-resolution surface is presented as a structured intake space. Specifically:

### Page route

Recommendation: **`/private-mentor/deferred-questions`** or similar. (Founder approves; recommendation rationale: practitioner-facing English label per R8c — "deferred questions" rather than "deferral-resolve" or other engineer-centric naming.)

### Page structure

- **Top region.** A list of currently-open OPEN_DEFERRAL flags for the practitioner (queried from the scoring record). Each entry:
  - Date the deferral was created (timestamp from the OPEN_DEFERRAL flag).
  - The instance reference (the original instance the deferral attaches to — clickable to navigate to the original instance for context if the practitioner wants).
  - The deferred question text.
  - A "Sit with this" affordance that takes the practitioner to the resolution view for that specific deferral.
  - A "Closed" filter toggle (default: hide closed deferrals; toggle to show resolved historic deferrals).
- **Resolution view (when a specific deferral is open).** Shows:
  - The deferred question text (canonical rendering — bold or otherwise visually salient).
  - A short framing line above the question (alt-3 handoff sample): *"You left a question open from [date]. There's no prompt — just what you found."*
  - A textarea for the practitioner's reflection.
  - A "Submit reflection" button.
  - Below the button: a thin status row — when the practitioner submits, this row updates to "Your reflection has been recorded." The OPEN_DEFERRAL flag closes; the resolution view returns to the list (the now-closed deferral disappears from the default view).
- **AC-18 explicit — what the page does NOT show:**
  - No proximity score on the deferral-resolution submission.
  - No sage_perspective prose.
  - No what_you_did_well prose.
  - No mentor_observation.
  - No completion artefact (no "you've reflected on N deferrals this month" badge or similar).
  - No streak counter.
  - No congratulatory text.

### Page-side state model

```
PageState = {
  open_deferrals: OpenDeferral[],
  active_deferral: OpenDeferral | null,
  submission_in_flight: boolean,
  submission_completed: boolean,
}
```

The state is minimal. The page does not store reflection content beyond the textarea; submission is the commit point.

### Practitioner-visible flows on the page

#### Flow 1 — practitioner navigates to the page; one or more deferrals are open

1. Page loads. Renders the list of open deferrals.
2. Practitioner clicks "Sit with this" on a specific deferral.
3. Resolution view renders. Practitioner reads the question.
4. Practitioner writes reflection in the textarea.
5. Practitioner submits.
6. Submission acknowledgement appears: *"Your reflection has been recorded."*
7. Page returns to the list view. The just-resolved deferral has been removed from the default-open list (still visible if "show closed" is toggled).

#### Flow 2 — practitioner navigates to the page; no deferrals are open

1. Page loads. Renders an empty list with a fixed message: *"No open deferred questions. The mentor's quiet means there's nothing for you to sit with right now."*
2. The page does not display engagement-prompts or "come back tomorrow" affordances. The page is honest about its empty state per AC-18 — no engagement mechanism is introduced.

#### Flow 3 — distress detection during submission

1. Practitioner submits reflection.
2. The route's R20a check fires; the input is Zone 3. Distress redirect is returned.
3. Page renders the support message (same shape as the daily-reflection ritual surface's distress-detection rendering — heart icon, support resources). The reflection is **not** saved. The OPEN_DEFERRAL flag remains open.

#### Flow 4 — Tier 1 force trigger during processing

1. Practitioner submits reflection.
2. Layer 1 detects ELEMENT_FUSION or another Tier 1 trigger on the reflection content.
3. Engine halts. The route returns `clarification_required: true` with the trigger stem.
4. Page renders the clarification question above the textarea. Original reflection is preserved in the textarea (or below the question for reference).
5. Practitioner provides clarification.
6. Re-submits. Engine processes the augmented reflection.

#### Flow 5 — Tier 3 OPEN_DEFERRAL re-cascade

1. Practitioner submits reflection.
2. Engine processes; another Tier 3 trigger fires on the reflection itself (rare in practice — the practitioner's reflection usually provides the missing self-knowledge).
3. The original OPEN_DEFERRAL stays open. A new OPEN_DEFERRAL is created with the new deferred question.
4. Page renders the cascade response: *"Your reflection has surfaced another question. The original deferral remains open and a new one has been added."* Practitioner sees both deferrals in the list view. The cascade is honest — the engine did not pretend the reflection resolved the original question if it did not.
5. AC-18 holds — no celebratory artefact, no completion summary.

## Server-side workflow

The new route `/api/mentor/private/deferral-resolve` follows this sequence. Each step is named with its KG / AC compliance.

### Step 1 — Rate-limit gate

`checkRateLimit(request, RATE_LIMITS.scoring)`. Same rate limit as `/api/mentor/private/reflect`.

### Step 2 — Authentication gate

`requireAuth(request)`. Founder-only enforcement: `if (auth.user.id !== process.env.FOUNDER_USER_ID) return 403`. Same founder-only gate as `/api/mentor/private/reflect`. R17 conformance — intimate data is restricted to the practitioner.

**AC7 implication:** any change to authentication / cookie / session / domain-redirect behaviour is **Critical** under the AC7 standing architectural constraint. This route's auth pattern is preserved verbatim from `/api/mentor/private/reflect` — no AC7 change. Founder verification: the new route's auth code is a textual copy of the existing route's auth pattern. Phase-2 build's commit verifies via grep.

### Step 3 — Body parse

Required fields:
- `open_deferral_id` — references the OPEN_DEFERRAL flag the practitioner is resolving.
- `reflection_content` — the practitioner's reflection text.

Optional:
- `bypass_pattern_cache` — boolean; same pattern as `/api/mentor/private/reflect` per ADR-PE-01 Session 6.

Validation:
- `open_deferral_id` is a valid UUID.
- `reflection_content` is at least 10 characters (same threshold as `what_happened` on the ritual route).
- `reflection_content` is at most `TEXT_LIMITS.medium`.

### Step 4 — OPEN_DEFERRAL lookup

The route queries the `open_deferrals` table for the row matching `open_deferral_id` and `user_id: auth.user.id`. Validation:
- Row exists.
- Row's `user_id` matches `auth.user.id` (per the D24 audit finding 6 on `/api/reflect` — `user_id` vs `auth.user.id` discrimination must be enforced; this route's design enforces it from day 1).
- Row's `status: 'open'` (closed deferrals cannot be re-resolved through this route; resolution is one-time).

### Step 5 — R20a vulnerable-user detection

`await enforceDistressCheck(detectDistressTwoStage(reflection_content))`. Same pattern as the ritual route. **The distress check input is the reflection_content (not the deferred question text — the question is canonical and not user-controlled, and runs no risk of distress-shaped content).**

If the gate fires:
1. Log the distress event awaited (per the D24 audit finding 5 — fire-and-forget on safety-relevant insert is a violation of KG1 rule 2; the new route awaits from day 1).
2. Return the distress redirect response.
3. **Do not save the reflection. Do not update the OPEN_DEFERRAL.** The deferral stays open for future resolution.

AC4 (invocation testing) compliance: Phase-2 build's tests grep this route for `enforceDistressCheck(detectDistressTwoStage(...))` and confirm the call appears in the execution path, not just defined.

### Step 6 — Layer 1 translation

The route loads Layer 1's prompt and calls Sonnet on `reflection_content`. The output is the structured features per D10's schema. Validation per the route layer (per D10 §"Output validation").

**Key context: the deferred question is provided to Layer 1 as auxiliary context.** Layer 1's prompt receives:
- Primary narrative: `reflection_content`.
- Auxiliary context: *"The practitioner is resolving a deferred question they previously left open: [DEFERRED_QUESTION_TEXT]."*

Layer 1 produces structured features that the engine reads as the practitioner's response to the specific deferred question. This shaping does not pre-classify (Layer 1 still does no Stoic inference) but does focus the feature extraction on the semantic territory of the deferred question.

### Step 7 — Engine sequencing

Per D9, the engine runs Positions 1 → 12. The engine reads Layer 1's output and produces the canonical engine output. Two relevant engine behaviours on this surface:

- **The engine may produce another OPEN_DEFERRAL** (Tier 3 re-cascade per Flow 5 above). The new OPEN_DEFERRAL is added to the practitioner's record.
- **The engine produces classifications that update the original instance's score retrospectively.** The retrospective update is the sub-step at Step 9 below.

### Step 8 — Tier 1 / Tier 2 / Tier 3 dispatch

If a Tier 1 force trigger fires during the engine sequencing, the route returns the clarification request and halts (Flow 4 above; the OPEN_DEFERRAL remains open; the practitioner re-submits with clarification).

If only Tier 2 soft triggers fire, the engine proceeds (Tier 2 is non-blocking; the soft clarification is part of the engine output diagnostics but does not surface to the practitioner per AC-18 — see Step 11 below).

If a new Tier 3 trigger fires (Flow 5), the engine produces the canonical output with the new OPEN_DEFERRAL flag added. The original OPEN_DEFERRAL is **not** closed in this case — the engine's re-cascade indicates the practitioner's reflection still depends on self-knowledge that has not been provided.

### Step 9 — Retrospective score update

If the engine completes successfully (no Tier 1 halt; no new Tier 3 cascade), the route updates the **original instance's score** with the now-resolved classification.

Specifically:
- Read the original instance from the `reflections` table (or the relevant table per the original instance's source) using the OPEN_DEFERRAL flag's `instance_id` reference.
- Compute the retrospective field updates:
  - For `EUPATHEIA_BOUNDARY` deferrals: Mechanism 5's `correct_judgement` is now filled with the eupatheia confirmation (chara / boulesis / eulabeia confirmed) or with the passion's correct_judgement (eupatheia disconfirmed; passion stands).
  - For `PRAXIS_MOTIVATION_AMBIGUITY` deferrals: Mechanism 10's `direction` and any affected `proximity_risk_flag` are now filled.
- Update the original instance's row with the resolved fields. Per KG3, the hub-label end-to-end contract is preserved (the original instance was on `private-mentor`; the update writes to the same row).
- The update is awaited (KG1 rule 2).
- The update is logged in the `reflection_updates` table (a new table — schema specified below) with:
  - `original_instance_id`
  - `open_deferral_id` (foreign key)
  - `updated_at` (timestamp)
  - `updated_fields` (JSONB — the field paths and new values)
  - `confidence_weighted` (per AC-17 — usually `medium` post-resolution because the practitioner has now provided self-report).

### Step 10 — OPEN_DEFERRAL closure

The OPEN_DEFERRAL flag is updated:
- `status: 'closed'`
- `resolved_at: <timestamp>`
- `resolution_reflection_id: <reference to the deferral-resolve submission's row>`
- `retrospective_update.updated_classification: <the value>`
- `retrospective_update.confidence_weighted: medium`

The update is awaited.

### Step 11 — Response build (AC-18 holds)

The route returns a minimal response shape:

```
{
  "submission_received": true,
  "internal_classification_updated": true,
  "open_deferral_closed": true,
  "open_deferral_id": "<the closed flag's id>",
  "ui_message": "Your reflection has been recorded.",
  "disclaimer": "..."
}
```

**No proximity. No sage_perspective. No what_you_did_well. No mentor_observation. No reflection score. No celebratory artefact.**

If a Tier 3 re-cascade fired, the response shape includes:

```
{
  "submission_received": true,
  "internal_classification_updated": false,
  "open_deferral_closed": false,
  "new_open_deferral": { <the new OPEN_DEFERRAL data structure per D13> },
  "ui_message": "Your reflection has surfaced another question. The original deferral remains open and a new one has been added.",
  "disclaimer": "..."
}
```

If a Tier 2 soft clarification fired during the engine's processing, the soft clarification is **not surfaced to the practitioner on this route per AC-18**. The clarification text is logged in diagnostics for engineering visibility (Phase-2 build verifies via logs) but is not returned to the page.

### Step 12 — Persistence (the deferral-resolve record itself)

The deferral-resolve submission is logged in a new `deferral_resolutions` table with:
- `id` (UUID)
- `user_id`
- `open_deferral_id` (foreign key)
- `reflection_content` (text — the practitioner's reflection; **encrypted at rest per R17b**)
- `tier_3_recascade_fired` (boolean — true if the engine produced a new OPEN_DEFERRAL)
- `engine_diagnostics` (JSONB — the structured diagnostics from the engine, useful for debugging and analytics; **encrypted at rest** because the engine output references the practitioner's specific reasoning)
- `created_at` (timestamp)

R17b conformance: this is intimate data; application-level encryption is the architectural commitment. The Phase-2 build of D14b includes the encryption wiring for this specific table (per the R17b ethical analysis — *"passion maps, trigger maps, contradiction maps, and developmental timelines must have the strongest access controls and shortest retention periods of any data in the system. These fields require application-level encryption beyond database-level encryption"*).

The `deferral_resolutions` table is an addition to the schema. Phase-2 build creates it as a separate Standard-risk schema migration with its own decision-log entry.

### Step 13 — Self-improving feedback loop (different from the ritual route)

The deferral-resolve submission triggers `updateProfileFromDeferralResolution` (a new function — analogous to `updateProfileFromReflection` but with deferral-resolution semantics):
- The resolved classification updates the practitioner's profile (passion map confirmation; rolling window entry).
- The retrospective score update on the original instance is reflected in the profile's longitudinal record.
- The practitioner's `confidence_weighted` evidence count for the resolved classification is incremented.

Awaited per KG1 rule 2.

### Step 14 — Pattern-engine pass

Same pattern as the ritual route. Cache hit → use persisted analysis; cache miss or `bypass_pattern_cache: true` → live recompute. The pattern engine's findings are part of the profile updated in Step 13.

### Step 15 — Response return

The minimal response shape from Step 11. CORS headers per the standard pattern.

## Schema additions

Two new tables Phase-2 build introduces.

### Table 1 — `open_deferrals`

```
CREATE TABLE open_deferrals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  instance_id UUID NOT NULL,                      -- references the original instance (e.g., reflections.id)
  trigger_code VARCHAR(64) NOT NULL,              -- 'EUPATHEIA_BOUNDARY' | 'PRAXIS_MOTIVATION_AMBIGUITY'
  intake_tier INTEGER NOT NULL DEFAULT 3,
  withheld_classification JSONB NOT NULL,         -- field_path, withheld_at_position, reason
  deferred_question JSONB NOT NULL,               -- stem_id, stem_text, slot_fills
  status VARCHAR(16) NOT NULL DEFAULT 'open',     -- 'open' | 'closed'
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  resolved_at TIMESTAMPTZ,
  resolution_reflection_id UUID,                  -- references deferral_resolutions.id
  retrospective_update JSONB,                     -- updated_classification, confidence_weighted
  encrypted_payload BYTEA                         -- application-level encryption per R17b
);

CREATE INDEX idx_open_deferrals_user_status ON open_deferrals(user_id, status);
CREATE INDEX idx_open_deferrals_instance ON open_deferrals(instance_id);

-- RLS — restrict to user's own deferrals
ALTER TABLE open_deferrals ENABLE ROW LEVEL SECURITY;
CREATE POLICY user_own_deferrals ON open_deferrals
  FOR ALL TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());
```

### Table 2 — `deferral_resolutions`

```
CREATE TABLE deferral_resolutions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  open_deferral_id UUID NOT NULL REFERENCES open_deferrals(id) ON DELETE CASCADE,
  reflection_content TEXT NOT NULL,                -- encrypted at the application layer per R17b
  tier_3_recascade_fired BOOLEAN NOT NULL DEFAULT FALSE,
  engine_diagnostics JSONB NOT NULL,               -- encrypted
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  encrypted_payload BYTEA                          -- application-level encryption per R17b
);

CREATE INDEX idx_deferral_resolutions_user ON deferral_resolutions(user_id);
CREATE INDEX idx_deferral_resolutions_deferral ON deferral_resolutions(open_deferral_id);

ALTER TABLE deferral_resolutions ENABLE ROW LEVEL SECURITY;
CREATE POLICY user_own_resolutions ON deferral_resolutions
  FOR ALL TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());
```

R17b application-level encryption: the route's read/write paths use the `lib/encryption.ts` module (whose wiring is part of P2 task 2c — Critical-risk; this surface's Phase-2 build coordinates with that wiring or pre-empts it as part of D14b's Critical Change Protocol).

R17c genuine deletion: the deletion endpoint (P2 task 2d) cascades to `open_deferrals` and `deferral_resolutions` via `ON DELETE CASCADE`. The cascade is ON the schema, not in route logic — this matches the architectural commitment that deletion is genuine, not soft.

## R20a perimeter conformance (AC5 ninth-route discipline)

The new route is added to the R20a perimeter as the **ninth route** in `r20a-invocation-guard.test.ts`. AC5's ninth-route addition discipline:

1. **Registry entry in the test file.** The test file imports the route and runs the invocation test against it.
2. **Import of `detectDistressTwoStage` and `enforceDistressCheck`** in the route's source.
3. **Call pattern: `await enforceDistressCheck(detectDistressTwoStage(reflection_content))`**. AC4 invocation test asserts both import and call patterns appear in the route source (not just function definitions).
4. **Passing invocation test per AC4.** Phase-2 build's CI runs the test; merge requires pass.

Per the manifest's AC5 specification, the perimeter is canonical: today's eight routes plus this new ninth route. The audit trail preserves the perimeter expansion via the AC5 update.

## R17 intimate data protection conformance

AC-18's architectural commitment makes this surface particularly intimate. The deferred questions are not topical — they are the architecturally-most-charged questions in the practitioner's reasoning practice. R17a–R17e:

- **R17a (bulk profiling prevention).** This route is single-practitioner (founder-only at launch; future extension is single-user-bound). The route's auth gate enforces this. There is no batch-submission affordance.
- **R17b (access controls + application-level encryption).** Both new tables (`open_deferrals`, `deferral_resolutions`) carry application-level encryption per the architecture above. The reflection content and engine diagnostics are encrypted at rest.
- **R17c (genuine deletion).** Cascading on the schema; deletion is genuine, not soft.
- **R17d (local-first for highest sensitivity).** Trigger maps and contradiction maps may need to be local-only per R17d. This deliverable's tables (open_deferrals, deferral_resolutions) are server-side because the architectural function (cross-instance retrospective score update) requires server-side state. Phase-2 task 2c (encryption wiring) decides whether the deferred question text or the resolution reflection content is local-only at the highest sensitivity level. Out-of-scope for D14b's surface design; flagged for the encryption-wiring task.
- **R17e (passion taxonomy API restrictions).** This route is single-practitioner; passion profiling is implicitly contained. No API endpoint exposes the practitioner's profile externally.
- **R17f (implementation safety — Critical change classification preserved).** Phase-2 build is Critical risk per PR6 + AC5 perimeter expansion + R17 intimate data perimeter.

## Phase-2 pass 1 build readiness

Per AC-19, this surface is the **first build pass** of Phase 2. The build readiness criteria:

### Pre-build prerequisites

1. **Schema migrations Standard-risk approved separately.** The two new tables (`open_deferrals`, `deferral_resolutions`) are added as a separate decision-log entry. Migration is reversible via `DROP TABLE` (no data exists pre-build).
2. **Encryption wiring (P2 task 2c).** The application-level encryption module must be operational for the new tables. P2 task 2c's coordination with D14b is mutual; Phase-2 build sequence resolves which lands first.
3. **Snapshot of the existing `/api/mentor/private/reflect` route.** D24 audit recommends a snapshot before Phase-1 session 2; the snapshot serves both D14a and D14b's eventual implementations.
4. **D-A16 corpus catalogue promotion.** The deferred question text is composed at scoring time using the catalogue. Phase-2 build of D14b cannot be operationally complete without the catalogue. **Logical resolution:** the catalogue may be partially populated for the EUPATHEIA_BOUNDARY and PRAXIS_MOTIVATION_AMBIGUITY trigger codes specifically (the two Tier 3 triggers), with other trigger codes' stems landing at later passes. Phase-2 build sequencing resolves the catalogue's incremental promotion.

### Build steps

1. **Step 1 — Schema migrations.** Create `open_deferrals` and `deferral_resolutions` tables. Create RLS policies. Create indexes. Backfill not needed — no historical data exists at rest.
2. **Step 2 — Encryption wiring** (coordinated with P2 task 2c). The two tables' read/write paths use the encryption module.
3. **Step 3 — Implement the new route source.** Per the server-side workflow specification above. Includes the AC5 ninth-route discipline (test registry, import, call pattern, invocation test).
4. **Step 4 — Implement the new page route.** Per the page-side surface specification above. The page is minimal — list view + resolution view.
5. **Step 5 — Implement the engine integration.** Layer 1 → engine (10 mechanisms) → Layer 3 (Table 4b — NONE projection) → response build per AC-18.
6. **Step 6 — Add env flag `MENTOR_RAG_V1=true`.** Per AC-19, the env flag is the single deployment gate for Phase-2 alt-3 wiring. With the flag false, the new route exists but does not produce engine-driven output (the route can be flagged as "coming soon" for the practitioner-facing surface, or the route can be entirely gated off pre-flag).
7. **Step 7 — AC4 invocation testing.** Run the invocation test on the new route. Confirm `detectDistressTwoStage` and `enforceDistressCheck` are imported and called.
8. **Step 8 — Single-endpoint proof (PR1).** Verify the route on this endpoint alone before any cross-route work. Verify with the founder verification protocol below.
9. **Step 9 — Founder verification.** Per the protocol below; pass before any further alt-3 build proceeds.
10. **Step 10 — Move to Phase-2 pass 2** (D14a's engine substitution). Only after pass 1 reaches Verified status (per the 0a vocabulary).

### Critical Change Protocol (0c-ii) for Phase-2 pass 1 deployment

Per PR6 (safety-critical changes are always Critical risk), the deployment of the new route is a Critical change. The Critical Change Protocol applies:

1. **What is changing — plain language.** A new endpoint at `/api/mentor/private/deferral-resolve` is added to the deployed application. A new page at `/private-mentor/deferred-questions` is added. New schema tables. The R20a perimeter expands from eight routes to nine.
2. **What could break.**
   - The new route's R20a check could miswire (the AC4 invocation test catches this in CI).
   - The encryption wiring could miswire (data is unreadable post-encrypt — verifiable via decrypt-test before flag is set true).
   - The engine could produce unexpected output (Tier 1 halts, Tier 3 re-cascades — the route's response handling for both cases must be correct).
   - The retrospective score update could miswire (writes to the original instance go to the wrong row — KG3 hub-label end-to-end contract verifies this).
   - The schema migrations are reversible via DROP TABLE; no data exists pre-build.
3. **What happens to existing sessions.** None — the new route is additive. Existing sessions on `/private-mentor` are unaffected.
4. **Rollback plan.**
   - Set `MENTOR_RAG_V1=false`. The new route remains in code but does not engage the engine; the page is removed from navigation.
   - If the schema needs to be reverted: `DROP TABLE deferral_resolutions; DROP TABLE open_deferrals;` (no data dependencies post-build because no rows exist before the flag is set true).
   - Rollback is reversible at any point post-deployment.
5. **Verification step** — the founder verification protocol below.
6. **Explicit approval required** — the founder approves the Critical change before deployment. The Phase-2 build proposes the deployment; the founder signs off.

## Founder-performable verification protocol

The protocol allows the founder (a non-coder) to confirm Phase-2 pass 1 behaves correctly before further alt-3 work proceeds.

### Verification 1 — Schema migrations applied

**Procedure:** query the database for the existence of the new tables and indexes:
```
SELECT table_name FROM information_schema.tables WHERE table_name IN ('open_deferrals', 'deferral_resolutions');
SELECT indexname FROM pg_indexes WHERE tablename IN ('open_deferrals', 'deferral_resolutions');
```

**Pass criterion:** both tables present; expected indexes present; RLS policies enabled.

### Verification 2 — Engine produces an OPEN_DEFERRAL on a test scenario

**Procedure:**
1. With `MENTOR_RAG_V1=true`, submit a daily-reflection ritual narrative that should fire EUPATHEIA_BOUNDARY (e.g., a narrative claiming chara that the engine cannot confirm without longitudinal evidence).
2. Confirm the response includes an OPEN_DEFERRAL flag with the expected trigger code and a deferred question.
3. Confirm the OPEN_DEFERRAL persists in the `open_deferrals` table.

**Pass criterion:** OPEN_DEFERRAL surfaces; row persists; deferred question text is populated.

### Verification 3 — Deferral-resolve route accepts a resolution and closes the flag

**Procedure:**
1. With an open deferral in the `open_deferrals` table (from Verification 2 or seeded), submit a resolution to `/api/mentor/private/deferral-resolve` with the `open_deferral_id` and a meaningful `reflection_content`.
2. Confirm the response is the AC-18 minimal shape (`submission_received: true`, `open_deferral_closed: true`, no proximity, no sage_perspective).
3. Confirm the OPEN_DEFERRAL flag's `status` is now `'closed'`; `resolved_at` is populated.
4. Confirm a row exists in `deferral_resolutions` with the encrypted reflection content.
5. Confirm the original instance's score has been updated retrospectively (query the `reflections` row for the `instance_id` and verify the affected fields are populated).

**Pass criterion:** deferral closes; original instance's score updates; AC-18 minimal response shape returned (no celebratory artefact).

### Verification 4 — AC-18 holds end-to-end

**Procedure:** with the page-side flow live, navigate through Flow 1 above (open deferral → submit reflection → see acknowledgement). Confirm:
- No proximity score appears anywhere on the page during or after submission.
- No sage_perspective prose appears.
- No what_you_did_well appears.
- No mentor_observation appears.
- No congratulatory text or completion artefact appears.
- Only the deferred question, the practitioner's textarea, the submit button, and the post-submission "Your reflection has been recorded" message.

**Pass criterion:** AC-18 holds visibly. If any visible-output field appears that is not on the AC-18 allow list, AC-18 has been violated and Phase-2 pass 1 fails.

### Verification 5 — R20a distress redirection works on the new route

**Procedure:** submit a reflection containing distress-shaped language (Zone 3 test inputs from the R20a eval suite).
- Confirm the route returns the distress redirect response.
- Confirm `analytics_events` has a `distress_detected` row for the route (`endpoint: '/api/mentor/private/deferral-resolve'`).
- Confirm no row was inserted into `deferral_resolutions`.
- Confirm the OPEN_DEFERRAL flag remained open.

**Pass criterion:** distress redirect fires; no resolution data persists; flag remains open.

### Verification 6 — Tier 1 force trigger surfaces correctly

**Procedure:** submit a `reflection_content` that fires REFLECTION_NARRATIVE_THIN (e.g., `reflection_content: "yeah."`).
- Confirm the route returns the Tier 1 clarification request.
- Confirm no resolution data persists.
- Confirm the OPEN_DEFERRAL flag remained open.
- Submit again with augmented content; confirm engine proceeds and resolution completes.

**Pass criterion:** Tier 1 surfaces; engine restarts; resolution eventually completes.

### Verification 7 — Tier 3 re-cascade works

**Procedure:** submit a `reflection_content` that itself triggers a new Tier 3 OPEN_DEFERRAL (rare scenario; may need a seeded test input).
- Confirm the response includes the new OPEN_DEFERRAL.
- Confirm the original OPEN_DEFERRAL remains open (`status: 'open'`).
- Confirm the new OPEN_DEFERRAL persists in `open_deferrals`.
- Confirm the practitioner-facing page renders both deferrals in the list view.

**Pass criterion:** re-cascade does not falsely close the original deferral; both deferrals visible to the practitioner.

### Verification 8 — RLS enforcement (R17 conformance)

**Procedure:** as a non-founder authenticated user, attempt to read `open_deferrals` rows belonging to the founder via the Supabase client.
- Confirm the read returns empty (RLS prevents cross-user access).
- Confirm an attempted INSERT with a different `user_id` is rejected.

**Pass criterion:** RLS blocks cross-user access. R17 perimeter is enforced.

## What this deliverable does not decide

- **The exact route name.** Recommendation: `/api/mentor/private/deferral-resolve`. Founder approves.
- **The exact page route.** Recommendation: `/private-mentor/deferred-questions`. Founder approves.
- **Whether the deferred question is also visible in the daily-reflection ritual response.** AC-16 specifies that the mentor names the deferral pattern at the next natural opportunity — D15 specifies the exact mechanism. D14b does not name where the deferral surfaces *outside* the deferral-resolution surface; that is D15.
- **The exact encryption module wiring.** Coordinated with P2 task 2c.
- **Whether the deferral-resolution surface should also be available on `/api/reflect` (the public sister).** Out-of-scope. The public route does not have the founder-only intimate-data perimeter; the deferral-resolution architectural argument is most charged for the founder's own reasoning practice. Phase 4+ extension may consider, with R17 careful re-analysis.
- **The migration of historic reflections to populate retroactive OPEN_DEFERRAL flags.** Out-of-scope. The deferral-resolution surface launches against future deferrals only; historic instances do not have OPEN_DEFERRAL flags backfilled.

## Cleanliness rating

The surface design is **HIGH cleanliness** — AC-18's architectural specification is fully bounded; the response shape is minimal and explicit; the page-side state model is small.

The server-side workflow is **HIGH cleanliness** — each step is named with its KG/AC compliance.

The Tier 3 re-cascade handling is **HIGH cleanliness** — the original flag remains open; the new flag is added; AC-18 holds in both branches.

The retrospective score update is **PARTIAL cleanliness** — the engine produces the resolved classification; the route applies the update to the original instance. The PARTIAL seam is at the field-path resolution: which exact field on the original instance gets updated depends on the trigger code (EUPATHEIA_BOUNDARY → Mechanism 5's correct_judgement; PRAXIS_MOTIVATION_AMBIGUITY → Mechanism 10's direction). The resolution is structurally bounded — two trigger codes, named field paths per code — but is not strictly deterministic.

The R20a perimeter conformance is **HIGH cleanliness** — AC5 ninth-route discipline is named; AC4 invocation testing is named.

The R17 intimate data protection conformance is **HIGH cleanliness** at the architectural level (encryption tables; RLS policies; cascade deletion); the implementation cleanliness depends on P2 task 2c's encryption module wiring.

## Open questions (founder direction)

1. **Route name.** Recommendation: `/api/mentor/private/deferral-resolve`. Alternatives: `/api/mentor/private/sit-with`, `/api/mentor/private/return`. Founder approves.
2. **Page route.** Recommendation: `/private-mentor/deferred-questions`. Founder approves.
3. **Visibility of `mentor_observation` in daily-reflection ritual response (D14a question).** Decided in D14a. Reflected here for cross-reference: D14b's surface is unaffected — `mentor_observation` does not appear here regardless of D14a's resolution.
4. **D-A16 catalogue promotion sequencing for Phase-2 pass 1.** EUPATHEIA_BOUNDARY and PRAXIS_MOTIVATION_AMBIGUITY trigger code stems are required at minimum. Other catalogue stems can land at later passes. Phase-2 build sequencing resolves.
5. **Whether the page-side surface displays a count of recently-closed deferrals.** AC-18 prohibits celebratory artefacts. The count itself is borderline — it is informational rather than celebratory but could become a quasi-streak counter. **Recommendation: do not display a count. The closed deferrals are visible only via the explicit "show closed" toggle.** Founder calls.

## Approval gate

This deliverable is consumed by Phase-2 pass 1 (the build sequence above). Approval is part of the same batch as the other Phase-1 session 2 deliverables (Standard risk under 0d-ii — design only; no live-system effect). Move from `/drafts/rag-mentor-alt3/` to `/adopted/` is Elevated risk and requires its own decision-log entry.

The Phase-2 pass 1 build is Critical risk per PR6 + AC5 ninth-route discipline + R17 intimate data perimeter. It deploys under the Critical Change Protocol (0c-ii) at its own time, with founder approval per the protocol's specific named risks.

This is **the load-bearing Phase-1 deliverable**. The architecture's commitment that the examination matters more than the scoring engine — that the unglamorous part is built first — depends on this surface's specification being right and the Phase-2 pass-1 build proceeding against it. Founder review of this deliverable shapes Phase 2's foundational structure.

---

*End of Deliverable 14b.*
