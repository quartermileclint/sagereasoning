# Handoff: Context Architecture Build — Debug Required

**Created:** 10 April 2026 (Session 7b)
**Status:** Layer 1 deployed but production error on /score page. Fix attempted, may need further investigation.

---

## What Was Built (Session 7)

Three files created/modified for Layer 1 (Stoic Brain Injection):

1. **`website/src/data/stoic-brain-compiled.ts`** (NEW — 438 lines)
   All 8 Stoic Brain JSON files compiled as condensed TypeScript constants for Vercel deployment. Exports: `PSYCHOLOGY_CONTEXT`, `PASSIONS_CONTEXT`, `VIRTUE_CONTEXT`, `VALUE_CONTEXT`, `ACTION_CONTEXT`, `PROGRESS_CONTEXT`, `SCORING_CONTEXT`, `STOIC_BRAIN_FOUNDATIONS`.

2. **`website/src/lib/context/stoic-brain-loader.ts`** (NEW — ~185 lines)
   Six mechanism-specific context builders plus two composite builders (`getStoicBrainContext(depth)` and `getStoicBrainContextForMechanisms(mechanisms[])`). Defines `ReasonDepth` type locally to avoid circular dependency with sage-reason-engine.ts.

3. **`website/src/lib/sage-reason-engine.ts`** (MODIFIED)
   - Added import: `import { getStoicBrainContext } from '@/lib/context/stoic-brain-loader'`
   - Added `stoicBrainContext?: string` optional parameter to `ReasonInput` interface
   - Added system message array construction (lines 378-389) that injects Stoic Brain context as a second system message block when provided
   - **Auto-injection was initially enabled, then disabled** after it broke production. Current state: Stoic Brain context only injects when explicitly passed by caller (`const stoicBrainBlock = params.stoicBrainContext || ''`)

TypeScript compiles clean (exit code 0) across all three files.

---

## The Production Error

**Symptom:** Going to the /score page and scoring an action shows "Application error: a client-side exception has occurred."

**Browser console error:** `Cannot read properties of undefined (reading 'katorthoma_proximity')`

**Error location:** `website/src/app/score/page.tsx` — the client reads `result.virtue_quality.katorthoma_proximity` (line 151, 165, 187, 190, 394, 402). If `result.virtue_quality` is undefined, it crashes.

**The V3EvaluationResult interface** (score/page.tsx lines 25-48) expects:
```typescript
{
  control_filter: { within_prohairesis: string[], outside_prohairesis: string[] }
  kathekon_assessment: { is_kathekon: boolean, quality: string }
  passion_diagnosis: { passions_detected: PassionDetected[], false_judgements: string[], causal_stage_affected: string }
  virtue_quality: { katorthoma_proximity: string, ruling_faculty_state: string, virtue_domains_engaged: string[] }
  improvement_path: string
  oikeiosis_context: string
  philosophical_reflection: string
  disclaimer: string
}
```

**BUT** the engine's STANDARD system prompt (sage-reason-engine.ts line 140-201) asks the LLM to return `katorthoma_proximity`, `ruling_faculty_state`, and `virtue_domains_engaged` as **flat top-level fields**, not nested under `virtue_quality`. This means the LLM was previously grouping them under `virtue_quality` on its own — an implicit behaviour, not an explicit schema instruction.

---

## What Was Tried

### Fix 1: Circular dependency (committed, pushed)
The loader imported `ReasonDepth` from the engine, and the engine imported from the loader. Changed to local type definition in the loader. This was a real bug but may not be the cause of the current error.

### Fix 2: Disable auto-injection (committed, pushed)
Changed the engine from auto-generating Stoic Brain context to only injecting when explicitly passed. This should have restored exact pre-change behaviour. **The error persisted after this fix.** Possible explanations:
- Vercel deploy hadn't completed when the user tested
- The import of `getStoicBrainContext` at module top level causes a side effect even though it's never called
- The error is unrelated to the Stoic Brain changes (coincidental timing or pre-existing intermittent issue)
- Browser caching is serving old JavaScript

---

## Debugging Steps for Next Session

### Step 1: Confirm deploy status
Check Vercel deployment logs to confirm the latest commit deployed successfully.

### Step 2: Check if the API works directly
```bash
curl -X POST https://sagereasoning.com/api/score \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <token>" \
  -d '{"action": "I chose to remain calm when someone cut me off in traffic"}'
```
If this returns valid JSON with `virtue_quality.katorthoma_proximity`, the problem is client-side caching. If it returns flat `katorthoma_proximity` (no nesting), the LLM output structure has changed.

### Step 3: If the LLM output structure changed
The engine's STANDARD system prompt (lines 140-201 of sage-reason-engine.ts) shows a flat JSON schema. But the client expects `virtue_quality` nesting. Either:
- **Option A:** Update the system prompt to explicitly request `virtue_quality` as a nested object in the JSON schema
- **Option B:** Add a server-side transformation in `/api/score/route.ts` that restructures the flat response into the nested format before returning it

Option A is cleaner. Option B is safer (doesn't rely on LLM compliance).

### Step 4: If the import itself causes problems
Try removing the import line from sage-reason-engine.ts entirely:
```typescript
// Remove this line:
import { getStoicBrainContext } from '@/lib/context/stoic-brain-loader'
```
If this fixes it, the loader module has a side effect at import time. Investigate the compiled data file.

### Step 5: If none of the above
Hard refresh the browser (Ctrl+Shift+R / Cmd+Shift+R) to clear cached JS. Check if other pages that use `runSageReason()` (like /api/reason, /api/guardrail) also fail.

---

## Key Files

| File | Purpose | Status |
|------|---------|--------|
| `website/src/lib/sage-reason-engine.ts` | Central reasoning engine — modified | Wired, auto-injection disabled |
| `website/src/data/stoic-brain-compiled.ts` | Compiled Stoic Brain constants | New, untested at runtime |
| `website/src/lib/context/stoic-brain-loader.ts` | Mechanism-specific context builders | New, untested at runtime |
| `website/src/app/score/page.tsx` | Client page that crashes | Unmodified — reads `virtue_quality.katorthoma_proximity` |
| `website/src/app/api/score/route.ts` | Score API endpoint | Unmodified — passes engine result through |
| `operations/handoffs/context-architecture-build.md` | Full Layer 1-3 spec | Reference |

## Layer 2 and 3 Status

Not started. Blocked on Layer 1 verification. Full specs remain in `operations/handoffs/context-architecture-build.md`.

## Open Questions

1. Was the `virtue_quality` nesting ever explicitly requested in the system prompt, or was the LLM always inferring it? If the latter, this is a fragile dependency that needs a server-side transformation (Option B above) regardless of Stoic Brain injection.
2. Did the error exist before Session 7 changes? If so, it's a pre-existing fragility in the score page's assumptions about LLM output structure.
