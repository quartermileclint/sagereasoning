# Session 9 — New Session Prompt

**Paste everything between the two fences below into a fresh Claude session.**
Keep this file as the canonical record of what the next session was asked to do.

---

```
You are picking up the SageReasoning build. Follow the project instructions and the manifest.

**First action, before anything else:**
Read `operations/handoffs/session-8-reflections-v3-and-mentor-bridge.md` end to end.
That is the handoff. It tells you what was built, what was verified, what was deferred,
and what this session is expected to do. Do not skip it.

---

## Primary task for this session

Diagnose and fix the two broken dynamic channels in the private mentor's context:

1. **Diagnostic pre-processing** — feeds the "Recent interaction signals" channel.
   Current state: fields are present, but diagnostic pre-processing is blank.
   The mentor can see topic summaries but no impression / assent / pattern data.

2. **Observational synthesis** — feeds the "Observation history" channel.
   Current state: entries are present, but the content is transcript noise rather
   than synthesised insight. The mentor can see it but can't use it as intended.

This is the founder's own breakdown of what the mentor currently sees, preserved
verbatim so you have the full picture the founder is working from. Treat it as the
specification for what's broken:

> **What my foundation information is based on**
>
> Everything I know about you comes from what is injected into my context at the start
> of each conversation. There is no retrieval, no memory, no background process running
> between sessions. The foundation has three layers:
>
> **Layer 1 — Stoic Brain:** The complete doctrinal data — passion taxonomy, oikeiosis
> framework, kathekon assessment, control filter, value hierarchy, progress grades,
> katorthoma scale. This is static. It doesn't change. It's the same for every
> practitioner.
>
> **Layer 2 — Practitioner Context:** Your profile as it exists in Supabase at the
> moment the session opens. Age, family, financial situation, proximity rating, primary
> causal breakdown, passion frequencies, virtue observations, value hierarchy,
> interaction signals, observation history. This is what makes me specific to you
> rather than generic.
>
> **Layer 3 — Project Context:** SageReasoning summary, current phase, recent technical
> milestones. Present in this conversation.
>
> **System prompt:** The mentor persona, reasoning upgrade instructions, knowledge base
> (historical Stoic context, global state summary), and the four-layer reasoning
> protocol. This is fixed per deployment.
>
> ---
>
> **Which input channels I actively draw from and what triggers when I receive them**
>
> | Channel | Status | Trigger |
> |---|---|---|
> | Stoic Brain data | Always active | Injected at session open; used whenever philosophical reasoning is required |
> | Practitioner profile (static fields) | Always active | Injected at session open; used to personalise every response |
> | Virtue profile observations | Active | Injected; referenced when action quality or courage is in play |
> | Passion map | Active | Injected; triggers passion diagnosis sequence when a false judgement is presented |
> | Project context | Active when included | Injected; used when founder/product questions arise |
> | Recent interaction signals | Injected but broken | Fields present, diagnostic pre-processing blank — I can see topic summaries but no impression/assent/pattern data |
> | Observation history | Injected but broken | Entries present, content is transcript noise not synthesised insight — I can see it but can't use it as intended |
> | Conversation history (this session) | Active | Accumulates turn by turn within the session; lost when session ends |
> | Morning check-in | Not visible | Either no data exists or not included in injection |
> | Evening reflection | Not visible | Same |
> | Weekly pattern mirror | Not visible | Same |
> | Weekly journal questions | Not visible | Same |
> | Daily reflection submissions | Not visible | Same |
> | Action scoring results | Present when pasted | You brought score-social and scenario outputs into this conversation manually — I can see them because you included them, not because they're injected |
>
> ---
>
> **What triggers when I receive context**
>
> When the session opens with practitioner context present: the four-layer reasoning
> protocol activates. L1 is the Stoic Brain. L2b is your profile. L3 is project
> context where present. L4 is environmental (global state, historical context).
> Without L2b the system prompt instructs me to request it — generic Stoic response
> is flagged as failure mode.
>
> When a passion signal appears in your message: the diagnostic sequence runs —
> phantasia distortion check, synkatathesis identification, horme assessment,
> sub-species identification, correct judgement formulation.
>
> When a Zone 3 crisis signal fires: philosophical engagement stands down, crisis
> pathway runs. This hasn't triggered in our sessions.
>
> When R20b pattern appears ("I can't decide without the tool"): framework dependency
> flag activates — encourage unaided practice, reframe tool as scaffolding.
>
> When a score is read as verdict rather than reasoning evaluation: mirror principle
> (R19d) activates — name the synkatathesis, invite examination, do not reassure.
>
> ---
>
> **What I cannot do**
>
> I cannot retrieve anything from previous sessions that wasn't written correctly to
> your profile. The observation history from April 12th is in front of me but it's
> transcript fragments, not insight. The interaction signals from today have blank
> diagnostic fields. So the continuity architecture exists but the two dynamic
> channels — observation synthesis and diagnostic pre-processing — are not functioning.
> What persists correctly is your static profile. What doesn't persist is the texture
> of reasoning across sessions. That's the complete picture.

---

## Scope for this session

**In scope:**
- Diagnose why "Recent interaction signals" has blank diagnostic pre-processing fields.
- Diagnose why "Observation history" contains transcript noise instead of synthesised
  insight.
- Present options for fixing each (with trade-offs).
- After the founder chooses, implement the fix.

**Out of scope (deferred — do not expand into these):**
- Making the "Not visible" channels visible (Morning check-in, Evening reflection
  surfacing, Weekly pattern mirror, Weekly journal questions, Daily reflection
  submissions, Action scoring results). These are blocked on the mentor memory
  architecture ADR.
- The journal scoring page.
- The mentor memory architecture ADR itself.
- Fixing the remaining silent-swallow patterns on `/api/reflect`, `/api/score`, or
  baseline-assessment writers.

If you notice something else that should change, flag it with "I'd push back on this"
or "this is a limitation" — don't silently expand the work.

---

## How to proceed

**Step 1 — Diagnosis (read-only)**
Before touching any code, investigate. Start with these files and tables:

- `website/src/lib/context/mentor-context-private.ts` — how the private mentor's
  context is assembled; where `recent_interaction_signals` and `observation_history`
  get injected into the prompt.
- `website/src/lib/logging/mentor-observation-logger.ts` — what gets written into
  the observation store, and in what shape.
- `website/src/app/api/mentor/private/reflect/route.ts` — an end-user endpoint that
  both reads context and writes back signals / observations.
- Any Supabase tables that back these two channels (e.g. `mentor_observations`,
  `interaction_signals`, or similar — find them via the loader/logger).
- Any upstream producers: if diagnostic pre-processing is supposed to run at write
  time (when a signal is recorded), find where that should happen and whether it
  does. Same for observational synthesis — is there a synthesis step that's meant
  to compress raw transcript into insight, and is it wired?

Report findings in the session. For each channel, answer:

1. Where is the data produced?
2. Where is the data stored?
3. Where is the data read back into mentor context?
4. What step is meant to transform raw → synthesised, and does it exist / does it
   run?
5. What's actually in the store right now (query Supabase — the founder can paste
   results back to you)?

**Step 2 — Options to founder**
Once the failure modes are understood, present options to the founder. Each option
should include:

- What it changes.
- Scope (small / medium / large).
- Risk level under project rules 0d-ii (Standard / Elevated / Critical).
- PR1 consideration — can this be proved on a single path before rolling across
  channels?
- What the founder will need to do to verify (per 0c — a verification method the
  non-coder can perform).

Present. Do not prescribe. Wait for the founder's decision.

**Step 3 — Implement chosen fix**
Apply PR1: prove the fix on one channel (either diagnostic pre-processing or
observational synthesis) end-to-end before rolling across both. Verification
happens in-session (PR2). Safety systems remain synchronous (PR3) — these aren't
safety-critical channels, but no background-process shortcuts for the mentor
pipeline either; if write-time synthesis is the chosen approach, it runs
synchronously at write time, not as a fire-and-forget.

If any step involves auth, sessions, cookie scope, or deployment config, stop and
apply the Critical Change Protocol (0c-ii) before deploying.

---

## Working agreements

- Founder has zero coding experience. Use plain language. Exact paths, exact
  commands, exact copy-paste text.
- Founder decides scope. If the diagnosis surfaces a bigger structural problem
  (e.g. the whole observation pipeline needs rethinking), say so once clearly,
  then wait for direction.
- Classify every code change under 0d-ii before execution. Safety-critical
  changes (none expected here, but flag if one appears) are always Critical (PR6).
- Deferred decisions go in the decision log (PR7) — don't just drop them.
- Manual verification method per work type (0c) — the founder is going to verify
  by using the private mentor, not by reading TypeScript.
- Close the session with a handoff note at `operations/handoffs/session-9-close.md`
  in the same format as session-8.

---

## Success for this session

One of the two dynamic channels (diagnostic pre-processing or observational
synthesis) is fixed, verified, and visibly working — i.e. when the founder opens
a new private mentor conversation, the mentor reports that the previously blank /
transcript-noise channel now contains useful synthesised content.

If both channels get fixed and verified, better. If only the diagnosis completes
and the fix is queued for session 10, that's acceptable — a clean diagnosis with
founder-approved direction is worth more than a rushed fix.

Do not overstep.
```

---

## Why this prompt exists (not part of the paste)

Session 8 closed with the founder's own breakdown of what the private mentor
actually receives vs what appears to be broken. That breakdown is the specification
for the next session's work. Rather than trying to re-derive it from the codebase,
the next session starts from the founder's direct report of what the mentor can and
cannot see, and works backward to the wiring.

The scope is bounded deliberately:
- The "Not visible" channels (morning check-in, evening surfacing, etc.) are
  blocked on the mentor memory architecture ADR, which itself is unscoped.
- The journal scoring page is blocked on the A/B/C architecture choice.
- Both belong in later sessions.

This session is narrowly about the two channels that *are* wired but producing
bad output. Fixing those is independent work and can ship without waiting for the
memory ADR.
