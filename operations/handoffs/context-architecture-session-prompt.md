# Paste this into a fresh session to start the Context Architecture Build

---

## Session 7: Context Architecture Build

Read the handoff document at `operations/handoffs/context-architecture-build.md` first. It contains the full specification for what needs to be built.

**Summary:** Every LLM-calling endpoint in SageReasoning (23 of them) currently operates context-blind — no Stoic Brain data, no practitioner profile, no project awareness. This session wires all three.

**Build order:**

1. **Layer 1 — Stoic Brain Injection:** Compile the 8 Stoic Brain JSON files (in `stoic-brain/`) into `website/src/data/stoic-brain-compiled.ts`. Create `website/src/lib/context/stoic-brain-loader.ts` with mechanism-specific context builders. Modify `website/src/lib/sage-reason-engine.ts` to accept and inject Stoic Brain context. Token budget: 500-1000 per mechanism, 3000 ceiling for quick depth, 6000 for deep.

2. **Layer 2 — Practitioner Context:** Create `website/src/lib/context/practitioner-context.ts` that calls the existing `loadMentorProfile()` from `website/src/lib/mentor-profile-store.ts` and returns a condensed profile context (300-500 tokens). Add `practitionerContext` param to `ReasonInput` in the sage-reason engine. Wire into all 20 authenticated LLM-calling endpoints (9 via engine, 11 individually). Graceful fallback: if no profile exists, omit the context.

3. **Layer 3 — Project Context:** Create `website/src/data/project-context.json` for static baseline (identity, mission, ethical commitments). Create a `project_context` Supabase table for dynamic state (current phase, recent decisions, active tensions). Create `website/src/lib/context/project-context.ts` that merges static + dynamic. Wire into mentor endpoints (full context) and operational endpoints (condensed). Do NOT inject into agent-facing endpoints.

**Key files to read before building:**
- `operations/handoffs/context-architecture-build.md` — full spec with file paths, function signatures, integration points
- `website/src/lib/sage-reason-engine.ts` — the central engine you'll modify
- `sage-mentor/persona.ts` — reference pattern for how buildMentorPersona builds context
- `website/src/lib/mentor-profile-store.ts` — existing encrypted profile loader
- `website/src/lib/mentor-profile-summary.ts` — existing profile summary builder

**Existing infrastructure:**
- Supabase is wired with RLS and service role access via `supabaseAdmin` in `website/src/lib/supabase-server.ts`
- Server-side AES-256-GCM encryption is live in `website/src/lib/server-encryption.ts` (env key: MENTOR_ENCRYPTION_KEY)
- Auth is via `requireAuth()` in `website/src/lib/security.ts`, returns `{ user: { id, email? } }`
- Models defined in `website/src/lib/model-config.ts`: MODEL_FAST (haiku), MODEL_DEEP (sonnet)

**Context matrix — five endpoint groups get different context:**

| Group | Stoic Brain | Practitioner Profile | Project Context |
|---|---|---|---|
| Mentor (baseline, baseline-response, journal-week) | Full per mechanism | Full summary | Summary |
| Sage Ops (P7 — operational intelligence) | None | None | Full |
| Operational (guardrail, reason, score-decision, score-iterate) | Per mechanism | Condensed | Condensed |
| Human-facing (reflect, score-document, score-conversation) | Per mechanism | Condensed | Minimal |
| Agent-facing (assessment, baseline/agent) | Per mechanism | None | None |

Sage Ops is an "Ops mentor" — full project context, no practitioner profile, no Stoic Brain. It advises on the build, not on the practitioner's virtue. The Sage Mentor is the inverse — full practitioner profile, summary project context, full Stoic Brain. Design `getProjectContext()` to accept a level parameter (`full` | `summary` | `minimal`) so each group gets the right scope.

**Constraints:**
- Stoic Brain JSON files live in repo root (`stoic-brain/`), not in `website/`. Must be compiled into TypeScript for Vercel deployment.
- Token budgets are firm. If total injection exceeds limits, condense Stoic Brain before cutting practitioner or project context.
- Agent-facing endpoints (assessment, trust-layer) must NOT receive project context or practitioner profile.
- Sage Ops must NOT receive practitioner profile or Stoic Brain data.
- Every change must build and deploy on Vercel (Next.js).

**Founder context:** I have zero coding experience. I will commit and push. I will verify via URLs and test commands you provide. Use the communication signals from the project instructions (0d). Classify changes per 0d-ii risk levels. Test after each layer before moving to the next.

Build Layer 1 first. Signal when you need me to commit and push.
