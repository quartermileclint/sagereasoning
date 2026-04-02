# SageReasoning V3 Website Audit Report
**Date:** April 2, 2026  
**Scope:** All web pages checked for V1 remnants, redundancies, incorrect terminology, and V3 completeness

---

## CRITICAL — Must Fix Before Launch

### 1. Homepage — V1 "Alignment Tiers" Section Still Present
**File:** `website/src/app/page.tsx` (lines ~186-226)

The homepage still shows a full "Alignment Tiers" visualization with V1 numeric scoring:
- Section header says **"Alignment Tiers"** (V1 term — V3 uses "Katorthoma Proximity Levels")
- Shows **"The Perfect Sage (100)"** — a numeric 0-100 score that doesn't exist in V3
- "How It Works" step still says **"weighted scoring"** (line ~167) — V3 uses unified assessment, not weighted scoring

**What needs to change:** Replace the entire Alignment Tiers section with a V3 Katorthoma Proximity visualization showing: reflexive → habitual → deliberate → principled → sage_like. Remove all numeric (100) references and "weighted scoring" language.

---

### 2. Community Page — Hardcoded V1 Tier Names
**File:** `website/src/app/community/page.tsx`

Multiple locations use hardcoded V1 tier names that don't match V3:
- **Lines ~137-144:** `tierColor()` function uses: `'Sage'`, `'Progressing'`, `'Aware'`, `'Misaligned'`, `'Contrary'`
- **Lines ~164-165:** Filters check for `'Sage'` and `'Progressing'` specifically
- **Lines ~283-288:** Legend displays all 5 V1 tier names

**V1 tier names:** Sage, Progressing, Aware, Misaligned, Contrary  
**V3 proximity levels:** sage_like, principled, deliberate, habitual, reflexive

**What needs to change:** Replace all hardcoded V1 tier names with V3 katorthoma proximity levels. The color palette can stay similar but labels must match V3 terminology.

---

### 3. Methodology Page — V1 Virtue Weights Displayed
**File:** `website/src/app/methodology/page.tsx`

- **Line ~82-83:** Displays `"{(virtue.weight * 100)}% weight"` for each virtue — showing "25% weight" per virtue. V3 rule R6b explicitly states: **no independent virtue weights**
- **Line ~46:** Text says `"The four cardinal virtues and their relative weights"` — V3 doesn't have relative weights

**Contradiction:** The same page correctly describes V3 at line ~158 ("assessed as expressions of one unified excellence, not scored independently") but then shows percentage weights above it.

**What needs to change:** Remove the weight percentage display. Replace with "Unified Assessment" (which was already done on the homepage Four Virtues card). Remove "relative weights" text.

---

## MAJOR — Should Fix Soon

### 4. Score Social Page — Missing Envelope Unwrapping
**File:** `website/src/app/score-social/page.tsx` (lines ~51-52)

```
const data = await res.json()
setResult(data)
```

This does NOT unwrap the response envelope. Compare to the working pattern in score-document and score-policy:
```
const envelope = await res.json()
const data = envelope.result ?? envelope
```

**Impact:** If the API returns the standard `{ result, meta }` envelope format, the score-social page will try to display `meta` and `result` as if they were evaluation fields, which will either show nothing or crash.

**What needs to change:** Add envelope unwrapping: `const data = envelope.result ?? envelope`

---

### 5. Marketplace Page — Orphaned (Not in Navigation)
**File:** `website/src/app/marketplace/page.tsx` exists  
**File:** `website/src/components/NavBar.tsx` — no link to `/marketplace`

The marketplace page exists and works, but there's no way for users to discover it. It's not in the navbar, footer, or any other navigation.

**What needs to change:** Either add it to the navbar (under Tools dropdown or as its own link), or if it's intentionally hidden for now, no action needed — just be aware it's inaccessible.

---

## MEDIUM — Clean Up When Convenient

### 6. stoic-brain.ts — Deprecated V1 Exports Still Active
**File:** `website/src/lib/stoic-brain.ts`

Three deprecated exports remain:
- **`VIRTUES` array** (line ~775): Hardcodes `weight: 0.25` for all virtues. This is what the methodology page reads to show "25% weight"
- **`ALIGNMENT_TIERS` array** (line ~782): Maps proximity levels to V1 numeric ranges ('0-19', '20-39', etc.). Marked `@deprecated`
- **`getAlignmentTier(score)` function** (line ~791): Takes a 0-100 number and returns a tier. Marked `@deprecated`

**What needs to change:** Once homepage, methodology, and community pages are updated to V3, these deprecated exports can be removed entirely. The `VIRTUES` export should either drop the `weight` field or the methodology page should stop reading it.

---

### 7. API Docs — "thumos" Listed Twice
**File:** `website/src/app/api-docs/page.tsx` (line ~437)

Text reads: `"Root passions (phobos, thumos, pleonexia, thumos)"` — "thumos" appears twice.

**V3 root passions are:** epithumia, hedone, phobos, lupe (from passions.json)

**What needs to change:** Fix the duplicate and update to match V3 passion taxonomy if needed. The entire passion list may need review against the V3 passions.json definitions.

---

## CLEAN — No Issues Found

These pages passed the audit with no V1 remnants or issues:

| Page | Status |
|------|--------|
| `/score` (Score Action) | ✅ Correct V3 implementation, proper envelope unwrapping |
| `/score-document` | ✅ Correct envelope unwrapping, V3 proximity display |
| `/score-policy` | ✅ Correct envelope unwrapping, 4-stage display, deliberation framework |
| `/scenarios` | ✅ Uses `KatorthomaProximityLevel`, no numeric scores |
| `/dashboard` | ✅ Shows V3 baseline, falls back to V1 gracefully |
| `/baseline` | ✅ 5-question flow works, proper envelope unwrapping |
| `/journal` | ✅ No V1 terminology |
| `/pricing` | ✅ Clean |
| `/terms` | ✅ Clean |
| `/privacy` | ✅ Clean |
| `/auth` | ✅ Clean |
| NavBar | ✅ All active pages linked (except marketplace — see item 5) |

---

## Recommended Fix Order

1. **Score Social envelope fix** — quickest win, prevents potential crash
2. **Methodology weights removal** — direct contradiction visible on same page
3. **Homepage Alignment Tiers** — largest visual V1 remnant, most user-facing
4. **Community tier names** — V1 names visible to users
5. **API Docs typo** — minor text fix
6. **Marketplace nav link** — decision needed: link it or keep hidden
7. **stoic-brain.ts cleanup** — remove deprecated exports after pages are fixed
