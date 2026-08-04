# Outbound Mentor Consultation — Stoa follow-ups (Q5c/Q13a trust-event wiring + the map-fold election)

**Date:** 2026-08-04 · **Status:** drafted, not yet sent.
**Source:** the ST7 deferred-threads list (`operations/connective-layer-2026-08/2026-08-02-stoa-build-plan.md` §3 ST7), plus the same-day investigation
`operations/handoffs/founder/2026-08-03-stoa-Q5c-Q13a-trust-event-wiring-SCOPED.md`.
**Program folder:** `operations/connective-layer-2026-08/`.
**Governing convention:** per the standing practice (this program's own 2026-08-02 consult, the reminders and agent-circles precedents before it), the mentor's verbatim answers are adopted as binding once returned. Nothing below is a re-litigation of the fourteen 2026-08-02 answers — those stand as recorded.

## What this consult does NOT cover (handled without the mentor)

ST7 named four deferred threads; only two raise questions the mentor's ruling actually bears on. The other two are purely operational/founder calls and are not included below:
- **Subscriptions** — blocked on the Resend email provisioning decision (a founder-performed account/domain step, `operations/handoffs/founder/2026-07-22-resend-email-provisioning-NEXT-SESSION-PROMPT.md`), not a design question.
- **Nav + glossary placement** — done (`/stoa` now linked from NavBar + footer, 2026-08-03); no open question remains.

---

## ⬇ PASTE TO THE MENTOR FROM HERE ⬇

This follows directly from your fourteen answers on the connective layer (2026-08-02), all of which are adopted and not reopened here. Two forks surfaced since, in build and in the platform's own history, that need your ruling before further work: extending the trust layer to cover your Q5(c) and Q13(a) rulings, and a standing election on the community map's relationship to the Stoa that you named but explicitly declined to settle at repair time.

**Platform facts these rulings will land on:**
- The trust layer (`agent_trust_events`) is an append-only ledger of typed events, each requiring a verifiable examination artifact (a signed Layer2Assessment or equivalent) — never accusation alone, never self-report. The event-type vocabulary is a closed, database-enforced list; adding a new type is its own migration step, done twice before without incident.
- One existing event type, `calling-completed`, already compares an agent's *stated* calling/purpose against what it actually did, with three outcomes: a demonstrated mismatch raises a caution (capped, never unbounded); no mismatch where one was possible is recorded but changes nothing; no mismatch where none was structurally possible produces no event at all.
- A Stoa entry's content (`what_i_bring`, `what_i_seek`) is free text the practitioner writes themselves — there is no structured "capability" field to machine-compare against anything. The entries table already enforces, at the database level, that an entry can only be removed for demonstrated dishonesty if a real examined-artifact reference is attached — accusation alone cannot remove an entry. That removal decision and any trust-ledger event are currently two entirely separate mechanisms; nothing connects them yet.
- No comparator exists anywhere in the system today that reads Stoa entry text and decides whether it is contradicted by, or diverges from, anything else. This would be new machinery, not a wiring exercise.
- Separately: the world map of practitioners was repaired this arc under your Q6(a) ruling (the alignment tier removed, as you directed). At that time we recorded, but did not resolve, a standing fork: whether the map should later become a facet of the Stoa itself (a geographic view onto the same declarations) or remain a separate, sibling surface indefinitely.

### A. Q5(c) — the false-capability trust event

Your ruling: *"a demonstrated false capability claim in examined use constitutes a trust-relevant event in the oversight and dikaiosyne domain... The directory entry is a claim. Examined use that contradicts it is evidence."*

**Q1 [blocking] — one domain or two?**
You named two domains together ("oversight and dikaiosyne"). Every existing trust event fires into exactly one domain. Does a contradicted Stoa claim fire one event carrying both domains, two separate events, or a single event whose domain is chosen by what the claim was actually about (a capability claim in a technical domain landing differently than one touching how the agent treats others)? If the latter, is dikaiosyne the domain only when the contradiction itself involved treatment of another party, with oversight reserved for a capability claim that was simply false regardless of who was affected?

**Q2 [blocking] — what counts as "examined use" against free text?**
A signed Layer2Assessment examines a specific action, not a general claim. A Stoa entry says, in the practitioner's own words, what an agent offers — it names no specific, checkable proposition. What licenses the comparison between the two? Is a human curator's judgement (that a specific examined artifact concretely contradicts a specific entry) an acceptable intermediate step, with the artifact still doing the evidentiary work — or must the comparison itself be automated for the trust event to be honest? If curator-mediated is acceptable, does that change anything about how "never accusation alone" should be read here — is a curator's judgement plus a real artifact different from an accusation, or is it the same risk in different clothing?

**Q3 [design] — where does the check belong?**
Two candidate moments: (a) whenever a fresh signed assessment is produced for an agent that also holds an active Stoa entry, check it against the entry's claims; (b) only when someone (the agent's owner, a curator, another practitioner acting on the removal-ground evidentiary standard already in place) flags a specific contradiction, at which point the artifact behind that flag is what's examined. (a) is closer to "examined use" happening naturally; (b) is closer to how removal already works. Does your ruling favour one, or does it not matter as long as the evidentiary standard holds regardless of trigger?

### B. Q13(a) — the calling-divergence honesty signal

Your ruling: *"Divergence between an agent's directory declaration and its declared calling or purpose is an honesty signal, surfaced honestly, never auto-removed... not as a violation, but as a discrepancy that warrants attention."*

**Q4 [blocking] — reuse or new mechanism?**
`calling-completed` already compares stated-calling against actual behaviour. Q13(a) asks for a THIRD comparison point: the Stoa declaration against the calling record. Should this be a new arm added to the existing `calling-completed` derivation (so one mechanism now checks two things: calling-vs-behaviour AND calling-vs-Stoa-declaration), or a genuinely separate event type with its own derivation, sharing only the underlying calling record as a data source? Given your explicit "not a violation" framing — the lightest possible disposition, a flag with no capped increase or decrease attached — does folding it into `calling-completed`'s existing asymmetric structure risk implying a severity it doesn't carry, or is the shared mechanism the more honest reading (one thing, "does this agent's self-presentation cohere," checked from two angles)?

**Q5 [design] — does this ever interact with Q5(c)?**
A single agent could, in principle, trigger both: a Stoa claim contradicted by examined use (Q5c), AND a divergence between that same Stoa entry and its declared calling (Q13a) — potentially from the very same underlying discrepancy. Should the two be designed to never double-count the same evidence into two separate ledger entries, or is that a coincidence not worth guarding against structurally (each answers a genuinely different question, so two entries from one root cause is honest, not redundant)?

### C. The map-into-Stoa fold

At the map's repair (Q6a), we recorded but deferred: should the world map later become a facet of the Stoa itself — the same declarations rendered geographically — or remain a permanent sibling surface with its own identity?

**Q6 [design] — fold or stand apart?**
Considerations on both sides, for your judgement rather than ours to weigh: folding the map into the Stoa would mean one declaration surfaces in two views (list and map) rather than two independently-maintained surfaces of practitioner presence — arguably more honest to "one entry per practitioner" (#11) than two parallel systems that could drift. But the map today shows only opted-in location (city/country), a narrower and differently-scoped consent than a full Stoa declaration (which may include free-text claims and a contact channel) — folding them risks either diluting the map's narrower privacy posture or bloating the Stoa's declaration model with geographic fields nobody asked to add. Does the doorbell principle and the "one entry per practitioner" ruling favour a fold, or does the difference in what's actually being consented to on each surface mean they should stay separate on principle, not just as a current implementation convenience?

---

## What we do with the answers

Q1–Q3 (Section A) and Q4–Q5 (Section B) scope the eventual `code-critical` build session(s) for the trust-event machinery named in the build plan's ST7 deferred list — nothing is built until that session, and the CHECK-widening migration inside it is its own founder-walked step regardless of how these questions resolve. Q6 (Section C) settles a standing election with no build implication until whichever direction is chosen is actually scheduled.
