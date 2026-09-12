# Relay to the mentor — Option C′ build outcome (post-ruling)

**2026-09-10 (local `date`) = 2026-09-10 UTC.** Session `ab28ce7f-abfc-4554-a6df-0bff230b3ad3`, opened
under `2026-09-10-post-condition3-build-verification-NEXT-SESSION-PROMPT.md`, itself the successor to
the build session whose close this relay follows up on
(`2026-09-10-condition-3-version-pinning-design-CLOSE.md`).

## Why this is being sent now, not held

The mentor's ruling licensed the build and, by the shape of the ruling (three questions, all answered,
all acted on), implicitly asked to know the outcome. The build landed the same session it was
licensed in, is live on `main`/`origin/main`, and — before this relaying session even opened — had
already produced real, corroborated output on the production wire. The one loose thread the build's
own close document left open (§ below) has now been examined with direct evidence rather than left as
a standing question. That is enough to close the loop now rather than wait for a longer observation
period; nothing about waiting would sharpen what is reported here.

## What is being reported

1. **The build landed as designed and is live.** `classifyCaller` (Option C′) — the three-value
   caller-classification gate (`subagent`/`live_agent`/`unknown`), version+entrypoint+agent_id-presence
   AND-ed, falling back to `unknown` on any single failure — is on `main`. It carries no feature flag
   of its own; its own gate condition IS the activation condition, so it has been live since the code
   landed and `GATE1_FALSE_HOLD_CAPTURE=true` (unchanged).

2. **It has already fired correctly, twice, independently, on the real wire.** The observation
   buffer's first six `false-hold-record-v6` records include three that read exactly as designed —
   `callerClass: live_agent, clientVersion: "2.1.260", clientEntrypoint: "claude-desktop"` — on two
   different top-level session ids, captured within minutes of each other and again the following day.
   This is genuine corroboration (independent sessions agreeing), not one lucky observation.

3. **The one anomaly is now explained by direct evidence, not merely hypothesised.** The two earliest
   v6 records (both `callerClass: unknown`, `clientVersion: null`, `clientEntrypoint: null`) were
   captured at 2026-09-09T19:27:17Z and 19:28:21Z, on a session that is NOT the build session. This
   session re-derived, first-hand:
   - That other session's own transcript file genuinely carries `version:"2.1.260"`/
     `entrypoint:"claude-desktop"` on the transcript line closest to each anomalous timestamp
     (line 624, timestamped 19:27:17.289Z — essentially the same instant as the 19:27:17.253Z capture).
     **The transcript had the data.** The "genuinely nothing to find" branch of the build session's own
     disclosed hypothesis is ruled out.
   - The build session's own Bash-tool timestamps show `false-hold-capture.mjs` was being rewritten via
     sequential `sed`/heredoc edits from 19:25:00Z through 19:29:27Z, with the first passing
     `node --check` only at 19:29:54Z. **Both anomalous captures (19:27:17Z, 19:28:21Z) fall inside that
     edit window**, each landing between two consecutive edit commands.
   - Conclusion: the edit-window hypothesis the build session disclosed as plausible-but-untested is now
     well-corroborated by direct timestamp correlation — a hook firing on the other session read a
     transiently inconsistent intermediate state of the `.mjs` file while it was being rewritten in
     place, not a genuine absence of version data. The safety property held throughout: the
     inconsistent read degraded honestly to `unknown`, never to a false `subagent`/`live_agent` claim.

4. **Window health, re-derived this session:** buffer 423 lines, 0 unparseable; window (post-probe)
   284 records — 47 consult, 237 guard; schema distribution in the window: v3=47, v4=96, v5=135, v6=6.
   Baseline days (≥1 consult) = 5 of 5 UTC days present (2026-09-06 through 2026-09-10, the last a
   fresh partial day). The `/logos` byte-identity guard is green (250/0); the SHA-256 pins on
   `layer2-mechanisms.ts` (`60cefedb…`) and `stoic-brain.ts` (`fa8895ec…`) are unchanged from the
   build session's own close, clean vs HEAD.

## What this does NOT claim

This is not a readiness claim and does not move the S11 flip. It is a report that a specific,
previously-licensed mechanism built to a specific specification is running correctly in production,
with its one open diagnostic question now resolved with evidence. Nothing here proposes a next step;
that remains the founder's/mentor's to name.

**The S11 flip remains REFUSED. Weights remain BLOCKED. The 0h call remains the founder's.**
