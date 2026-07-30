# Next-Session Prompt — Post B5 Activation: Founder's Choice

**Stream:** founder (substrate / general).
**Tier:** open — depends on what the founder wants next. Nothing is gated on this session.
**Prior session:** `operations/handoffs/founder/2026-07-30-b5-session-decline-signal-build-and-activation-CLOSE.md` (`D-B5-SESSION-DECLINE-SIGNAL-BUILT-ACTIVATED-LIVE-2026-07-30`) — closed out R17 milestones coverage, the consult-lookup resilience retry (built, not yet activated), and B5 (built, mentor-consulted, and fully activated through production, live-verified against real deployed code).

**Read the close in full at open** — it records a real process mistake (a flag was set in Vercel before the code that gates it was ever committed) that was caught and corrected mid-session, not concealed. Worth internalizing the procedural lesson (commit + push before touching a production flag, every time) before doing any further activation work.

---

## Closed this cycle

- ~~R17 milestones coverage~~ — live on push, no flag, done.
- ~~Consult-lookup resilience retry, built~~ — code shipped behind `SUBSTRATE_CREDENTIAL_LOOKUP_RETRY_ENABLED`, unset everywhere. **Note: built, NOT activated** — see below.
- ~~B5 per-session-granularity decline signal~~ — built, mentor-consulted, fully activated in production, live-verified against real deployed code and real persisted data.

## Still open — buildable/activatable now, no policy question

- **`SUBSTRATE_CREDENTIAL_LOOKUP_RETRY_ENABLED` activation** — the retry code from this session is sitting dark. No design question blocks turning it on; it just wasn't asked for this session. If the s9-loop dogfood harness is still showing the transient-401 pattern this fix targets, activating it (TEST first, then production, same shape as every other flag) would be a clean, low-risk next step. Verify the current failure profile from `gate1.log` before and after, per the original follow-up's own verification section.
- **CLAUDE.md's "Live in production" list** — does not yet carry a bullet for B5 (or for the retry flag once it's activated). A straightforward documentation pass, deliberately deferred out of this session's stated scope (close + next-prompt + decision-log + commit only).

## Still open — needs a founder product/design decision

- **The B5 suggestion line's exact wording** — the mentor confirmed the trigger concept ("any measured dimension declining… take the next decision of that class at greater depth") but didn't vet exact rendered wording the way most of its siblings in the same vocabulary carry verbatim mentor language. If this matters before relying on the phrasing in front of real agents, it's a small, well-scoped question for a future consultation.
- **Item B of the 2026-07-19 consult-lookup follow-up** (`GATE1_ACTION_TEXT_MODE=lean` / raising the at-action hook's 28s timeout) — local harness config, not code; a fidelity-vs-availability tradeoff the founder should decide, not infer from usage.

## Still open — genuinely need the founder, unrelated to this session

- The logos byte-identity guard (scope or retire — still the founder's call).
- P2's 0h call (the three branches the verdict memo names).
- S11 ENFORCE readiness (needs live data over time + a founder flag decision).
- Resend email provisioning (literal account setup).
- The journal UTC pace-gate mismatch and the day-55 evening-pole case — both already root-caused, both waiting on a founder product decision about what "one entry per day" / "the evening review past day 55" should mean, not further diagnosis.

## Boundaries (carried forward, unchanged)

- Any live production write, flag flip, or credential mint needs the founder's participation — this environment has no standing production admin credential. The reliable workaround when needed: a JWT pulled from the founder's own logged-in browser session (`sb-*-auth-token` in Local Storage), passed as `MINT_CLI_ADMIN_JWT`.
- **Always commit and push before setting a production flag that gates new code** — this session's own near-miss. Verify the deployed commit matches what the flag assumes exists, don't assume a green Vercel build means the intended code shipped.
- Do not touch `derive-trust-events.ts` (register item D4) without a founder-walked Critical step.
- Do not touch `stoic-brain.ts` or reopen the logos byte-identity guard question unilaterally.

## Forecast

Success = the founder gets a clean session on whatever they actually want, same as every open-ended prompt in this stream. If asked to pick, the retry-flag activation is the highest-leverage next step that doesn't require a design decision to start — though whether it's worth doing depends on whether the s9-loop harness is still showing the 401 pattern it targets, which is itself worth checking first regardless of what else gets picked.

End of prompt.
