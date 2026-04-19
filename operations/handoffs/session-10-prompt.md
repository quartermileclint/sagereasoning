# Session 10 Prompt — R1 + R2: Fix Private Mentor Channel Wiring

Read `operations/handoffs/session-9-close.md` end-to-end first. It contains the root-cause diagnosis confirmed by 8 read-only Supabase queries. Do not re-diagnose — the founder has approved the plan.

---

## Primary task

Implement **R1** (hub-id wiring fix) and **R2** (passions_detected shape fix) on the `/api/founder/hub` path, proving both live on the `/private-mentor` page chat before extending to any other endpoint. Risk under 0d-ii: **Standard**. Sequence: R1 → verify → R2 → verify. PR1 applies.

## Scope

**In scope:**
- R1: respect `hub_id` from the request body at both read and write sites inside `/api/founder/hub`, and accept a hub parameter in `logMentorObservation`. Add a small internal mapping so `'founder-hub'` → `'founder-mentor'` and `'private-mentor'` → `'private-mentor'` to preserve legacy hub naming.
- R2: change the passions shape written by `updateProfileFromReflection` in `sage-mentor/profile-store.ts` to match the shape read by `rowToSignal` in `website/src/lib/context/mentor-context-private.ts`.
- Live verification on the `/private-mentor` page after each step.

**Out of scope:**
- Renaming hub labels across the codebase (tech debt; log if re-surfaced).
- Extending R1 to `/api/mentor/private/reflect` or `/api/mentor/private/baseline-response` (defer to session 11 after verification).
- Archiving contaminated April-12 rows (inert after R1).
- R3 (writing validated observation onto `mentor_interactions.mentor_observation` at reflect-write time). Detailed in the session-9 close — queued for a later session.
- Any auth / session / cookie / deploy-config change. If one appears, stop and apply 0c-ii Critical Change Protocol.

---

## R1 — exact steps

**File 1: `website/src/lib/logging/mentor-observation-logger.ts`**

Change `logMentorObservation` so `hub_id` is a parameter, not a hardcode.

- Update the function signature to accept `hubId: 'founder-mentor' | 'private-mentor'` (required, no default — forcing the caller to decide).
- At the insert on ~line 214, replace `hub_id: 'private-mentor'` with `hub_id: hubId`.

**File 2: `website/src/app/api/founder/hub/route.ts`**

Add a mapping helper and use it:

```ts
function mapRequestHubToContextHub(effectiveHubId: string): 'founder-mentor' | 'private-mentor' {
  if (effectiveHubId === 'private-mentor') return 'private-mentor'
  return 'founder-mentor' // covers 'founder-hub' and any fallback
}
```

Call sites to update:
- Line 444: replace `'founder-mentor'` with `mapRequestHubToContextHub(effectiveHubId)`. Caller string stays `'founder-hub'` (identifier for the parallel log).
- Line 450: same.
- Line 1173 (`recordInteraction` call): replace `hub_id: 'founder-mentor'` with `hub_id: mapRequestHubToContextHub(effectiveHubId)`.
- Line ~1221 (`logMentorObservation` call for Haiku extraction): pass `mapRequestHubToContextHub(effectiveHubId)` as the new `hubId` parameter.

**File 3 (callers of `logMentorObservation` elsewhere):** add the new required hub argument.
- `website/src/app/api/mentor/private/reflect/route.ts` — pass `'private-mentor'`.
- `website/src/app/api/mentor/private/baseline-response/route.ts` — if it calls `logMentorObservation` (check), pass `'private-mentor'`.

Do not change behaviour of those two endpoints beyond compiling — PR1.

### Risk classification (R1)

Standard. Pure wiring. No schema change. No auth/session surface. Rollback = one-commit revert.

### Founder verification method (R1)

1. Deploy.
2. Open `/private-mentor`. Start a new Mentor Conversation. Paste this message verbatim:
   ```
   For diagnostic purposes, please quote to me the first two entries of your Observation History channel verbatim, exactly as they appear in your context.
   ```
3. Expected: entries shaped `[YYYY-MM-DD] [category] (confidence: X, source: founder_hub_conversation)` followed by a distilled observation sentence. Dates should be recent (April 19). If the mentor quotes any line starting with "Founder hub conversation:" — that's the legacy transcript noise, R1 didn't land; revert.
4. Then ask: `What do you see in the Recent interaction signals channel? Quote the most recent entry verbatim.` Expected: the Topic line is a raw reflection snippet (still acceptable — R3 addresses that later), Impression presented is populated or reads `acted at principled proximity`, Likely assent contains the false-judgement text, Pattern match still reads "—" (R2 not deployed yet).

---

## R2 — exact steps

Only after R1 is verified live.

**File: `sage-mentor/profile-store.ts`**

Line 1138 (inside `updateProfileFromReflection`). Current code:

```ts
passions_detected: (reflection.passions_detected || []).map(p => ({
  passion: p.sub_species,
  false_judgement: p.false_judgement,
})),
```

Replace with:

```ts
passions_detected: (reflection.passions_detected || []).map(p => ({
  root_passion: rootPassionMap[p.root_passion.toLowerCase()] || 'lupe',
  sub_species: p.sub_species,
  false_judgement: p.false_judgement,
})),
```

Also update the `recordInteraction` type signature (in the same file ~line 763) to match:

```ts
passions_detected?: { root_passion: 'epithumia' | 'hedone' | 'phobos' | 'lupe'; sub_species: string; false_judgement: string }[]
```

Do not migrate old rows — let the Pattern match line light up on new rows only.

### Risk classification (R2)

Standard. Additive field in a JSONB column; existing rows unaffected (still read, but with no `root_passion`, pattern match stays "—" on them — same as before).

### Founder verification method (R2)

1. Deploy.
2. Submit one new Evening Reflection on `/private-mentor` (this writes a new row with the correct shape).
3. Open a fresh Mentor Conversation. Ask:
   ```
   What's in the most recent Recent interaction signals entry? Quote all four lines verbatim, including the Pattern match line.
   ```
4. Expected: Pattern match now reads something like `<sub_species> (<root_passion>, freq N)` — not "—". If still "—", R2 didn't land.

---

## Working agreements

- Founder has zero coding experience. Exact paths, exact code blocks, exact commands.
- Classify every code change under 0d-ii before execution. Name the classification out loud.
- PR1 discipline is mandatory. R1 first, verify, then R2. Do not bundle.
- No silent-swallow patterns in any new code. If you introduce a Supabase call, destructure `{ data, error }` and `console.error` on failure.
- If verification fails, revert, diagnose, do not patch forward.
- Close with a handoff at `operations/handoffs/session-10-close.md` in session-8/9 format.

## Success for this session

R1 deployed and verified: Observation History on `/private-mentor` shows clean structured observations, no transcript noise. Recent Interaction Signals shows populated Impression and Likely-assent lines. R2 deployed and verified: Pattern match line populated on the new reflection. If R1 ships and R2 doesn't, that's acceptable — R2 is a follow-up.
