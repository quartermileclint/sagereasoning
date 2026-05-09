# Session Close — 2026-05-10 — Substrate as Plugin: Agreed Architecture

## Frame

Continuation of the 2026-05-09 Stoic Agent Substrate exploration. Two new research files (`/inbox/plugin transcript.rtf`, `/inbox/plugin summary.rtf`) plus an empty placeholder (`/inbox/Untitled 4.rtf` — no content) drove a re-think on two fronts: (i) the open-source posture for Layer 3, and (ii) the form the substrate takes when delivered to agent developers. Both shifts are now agreed.

This session was an Explore session (per 0d), Standard tier, no production touch. The 2026-05-09 close (`/operations/handoffs/founder/2026-05-09-substrate-architecture-explore-close.md`) and its associated next-session prompt remain on file as predecessor records; specific decisions in them have been refined here and are noted under "Supersedes / Refines" below. Nothing in `/adopted/` is touched.

## Decisions Made

**1. Open-source Layer 1 only. Layer 3 stays closed.** Reasoning: closing Layer 3 keeps Layer 2's output schema obscured behind prose, raises the reverse-engineering bar on Layer 2 substantially, preserves brand voice consistency, enforces R3 evaluative disclaimer + R19 limitations + R20a distress pass-through architecturally rather than contractually, and prevents brand-confusion forks. Domain-specific prose customisation (clinical, terse, educational, others) is solved via a `prose_mode` parameter on the Layer 3 API rather than via community forks. → Impact: refines the 2026-05-09 close's "open-source Layer 1 and Layer 3 completely" decision. The moat now sits on Layer 2 + Layer 3 services jointly; Layer 1 is open. Permissive licensing (MIT/Apache) is appropriate for Layer 1 since the moat is elsewhere.

**2. The substrate is built with the end goal of a complete plugin package in mind.** Reasoning: the plugin paradigm (per the research files) packages skills + tool access + live integrations + deterministic checks + failure modes + unwritten standards into one installable, shareable workflow unit. SageReasoning maps onto these six plugin elements with unusual precision — Layer 2 is the deterministic check; open Layer 1 is the workflow skill; the API connectors are tool access and live integrations; the wiki and primary sources are the unwritten standard; R20a + validation are the failure modes. The substrate is structurally a plugin and should be packaged as one. → Impact: dissolves the previously deferred Q6 (distribution channel — SaaS / SDK / MCP server / library): plugins are the answer; the internal technical pieces become plugin internals, not packaging choices. Reframes the build's end-state as "a plugin (or plugin family) installable in one action via plugin marketplaces."

**3. Three-layer R20a defence.** Reasoning: with Layer 1 open and runnable in the agent's plugin, the distress perimeter requires defence in depth. → Impact:
- Layer A (in-plugin, open-source): R20a script runs locally before any API call. Fast; saves tokens on distress inputs.
- Layer B (server-side gate): R20a check guards the Layer 2 API. Prevents bypass via misconfigured plugins or non-plugin callers.
- Layer C (Layer 3 deterministic injection): Layer 3 detects distress patterns in Layer 2 output and injects the pass-through statement deterministically. Final compliance enforcement.

**4. Two front-ends, one substrate.** Reasoning: `sagereasoning.com` (the human-facing website with `/private-mentor`, `/mentor-hub`, `/ops-hub`) is one front-end. The plugin (or plugin family) is the other — the agent-facing front-end. Both share the Layer 2 + Layer 3 backend. → Impact: the website remains; it doesn't get replaced by the plugin paradigm. Migration of existing sagereasoning.com consumers is decoupled from plugin distribution work.

**5. Cowork plugin tooling identified as the natural first marketplace path.** Reasoning: `cowork-plugin-management:create-cowork-plugin` and `cowork-plugin-management:cowork-plugin-customizer` skills are already installed and available to the founder. This is the fastest path to "plugin packaged in one form" without engaging multiple marketplaces simultaneously. → Impact: feeds the planning session as a candidate first-marketplace target; not a final commitment.

**6. Next session is dedicated to detailed planning only — staging the build with the agreed architecture in mind.** Reasoning: founder explicit — the prior 2026-05-09 staging prompt was scoped against an earlier architecture; the architecture has now changed materially and warrants its own planning pass. → Impact: see `2026-05-10-plugin-build-staging-NEXT-SESSION-PROMPT.md`. The planning incorporates two specific learnings from the prior staging attempt: (a) licensing is staged immediately before going public with open-source, not as a generic Stage 1 item; (b) after all planning steps are scoped, a holistic second pass reviews the whole for implications, efficiencies, time-bounded session structure, and minimal founder mid-session input.

## Status Changes

None. No module or rule status changed. Design exploration only.

## Supersedes / Refines

The following items in `/operations/handoffs/founder/2026-05-09-substrate-architecture-explore-close.md` are refined by this session:

- "Open-source Layer 1 and Layer 3 completely" → refined to "Open-source Layer 1 only; Layer 3 stays closed." See Decision 1 above.
- "Distribution channel deferred (Q6)" → answered: plugins, distributed via plugin marketplaces. See Decision 2 above.
- "Six layers of ecosystem offering above schema + docs" → reframed: these become plugin contents and plugin variants rather than parallel offerings.

The `/operations/handoffs/founder/2026-05-09-substrate-build-staging-NEXT-SESSION-PROMPT.md` is now superseded by the new `2026-05-10-plugin-build-staging-NEXT-SESSION-PROMPT.md`. The 2026-05-09 prompt remains on file as a predecessor record per the preserve-prior-versions principle; it is not deleted, edited, or moved.

## Next Session Should

- Open under the standing protocol with this session close + the new staging prompt as the cache reads
- Be dedicated entirely to detailed planning — no execution, no ADR drafting beyond the staging plan itself, no code touch
- Inventory every aspect of the substrate-as-plugin work
- Apply the importance ordering with licensing placed immediately before any public open-source release
- Perform a holistic second pass once all steps are scoped: review for implications, identify efficiencies, repackage into time-bounded sessions (not step-bounded), design sessions for minimal mid-session founder input
- Produce a staged build plan as the session's output
- Stabilise to a known-good state at session close (the staging plan is the artefact)

## Blocked On

- Founder review of this session close and the new next-session prompt before next session opens
- Specific licence choice for open Layer 1 (MIT vs Apache vs other) — deferred to lawyer review at the licensing-stage gate
- First marketplace target (Cowork / Claude Code / Codex / multi-marketplace) — planning question

## Open Questions

**Carried forward and refined:**

1. Mode separation (evaluative / prescriptive / augmentative-combo) — plugin variants or single plugin with mode parameter? Planning question.
2. Layer 2 schema scale and middle protection — confirmed: Layer 2 stays server-side authoritative; Layer 3 closed obscures schema further; permissive licence on Layer 1 reference appropriate.
3. Distress check posture — answered as the three-layer R20a defence (Decision 3 above).
4. Credential portability — much of the cross-platform readability problem dissolves under plugin marketplace standardisation; the credential becomes a plugin-emitted artefact during normal operation. Specific format (JWT / W3C VC / hybrid) is still a planning question.
5. Action scorer parallel — confirmed: agent action scorer mirrors the human action scorer wherever evaluative is in play.
6. Distribution channel (Q6) — answered: plugins, distributed via plugin marketplaces.

**Carried forward from 2026-05-09 + refined under plugin paradigm:**

7. Specific licence form for open Layer 1 — needs lawyer review at the licensing-stage gate.
8. Plugin governance model — contribution guidelines for the open Layer 1, PR review policy, named maintainers; standardised by plugin marketplace conventions where applicable.
9. Layer 2 signing infrastructure timeline — when authoritative-assessment signing gets built; key management posture.
10. Standards-formation engagement — smaller in scope under plugin paradigm but still relevant for credential interoperability and the Layer 1 input contract.
11. Brand and trademark posture — distinguishing "running open SageReasoning Layer 1" from "calling the authoritative SageReasoning Layer 2 + Layer 3 services."
12. Migration path for sagereasoning.com consumers — decoupled from plugin work but still needs explicit handling.
13. R20a perimeter handover mechanism — answered as Decision 3 (three-layer defence).

**New questions surfaced specifically by the plugin paradigm:**

14. First marketplace target — Cowork / Claude Code / Codex / multi-simultaneous? Each has different review policies, fees, sandbox capabilities, and audience.
15. Plugin version compatibility and update mechanics — backward compatibility, deprecation paths, update mechanisms.
16. Plugin trust signalling — verified badges, security review status, brand presence in marketplace listings. SageReasoning's substrate makes ethical claims; trust signalling matters more than for utility plugins.
17. Plugin sandbox limitations per marketplace — what each marketplace's plugins can and cannot do affects what the SageReasoning plugin can contain.
18. Plugin economics — free-to-install with paid services via connectors is the standard pattern; the Layer 2 + Layer 3 services remain metered. Specific pricing strategy is a planning question.
19. Plugin variant strategy — one plugin with mode parameter, or a small family of plugins for evaluative / prescriptive / augmentative-combo?
20. The relationship of existing V3 endpoints to plugin tools — each existing endpoint becomes a plugin-internal tool wrapper; verified mapping needed.

## Verification Method Used (0c Framework)

- Work type: Design exploration / governance discussion (no code, no production touch)
- Verification: founder reads this session close + the new next-session prompt. No URLs, no test commands, no live system to verify.
- Founder may edit either file or request changes before the next session opens.

## Risk Classification Record (0d-ii)

- All work in this session: Standard (design exploration only)
- Critical Change Protocol NOT engaged
- Substrate execution in subsequent sessions will involve Critical-tier work per PR6 / 0c-ii (touches authentication, signing, distribution, trust infrastructure, R20a perimeter changes). The planning session will surface and stage these explicitly with the licensing-as-pre-public-release-gate rule applied.

## PR5 — Knowledge-Gap Carry-Forward

- No concepts required re-explanation this session
- No knowledge-gap candidates added

## Founder Verification (Between Sessions)

- Read this session close (`/operations/handoffs/founder/2026-05-10-substrate-plugin-architecture-close.md`)
- Read the new next-session prompt (`/operations/handoffs/founder/2026-05-10-plugin-build-staging-NEXT-SESSION-PROMPT.md`)
- Edit either file or request changes before next session opens
- No live system to verify; no code touched

## Session-Output Artefacts (For Reference)

The substantive content produced this session lives in the conversation transcript. Key positions reached:

- Layer 1 open / Layer 2 closed / Layer 3 closed — the moat boundaries
- Plugin as the substrate's distribution form — not as one of several options but as the form
- Three-layer R20a defence (in-plugin script + server-side gate + Layer 3 deterministic injection)
- Two front-ends, one substrate (sagereasoning.com for humans, plugin for agents, shared Layer 2 + Layer 3 backend)
- Cowork plugin tooling identified as a viable first-marketplace path
- Permissive licensing on Layer 1 reference (specific licence TBD)
- Q6 (distribution channel) closed — answered as plugins via marketplaces
- The plugin paradigm dissolves several previously open architectural questions (SDK language priority, MCP-server-vs-SaaS choice, cross-platform credential readability worry)

End of session close.
