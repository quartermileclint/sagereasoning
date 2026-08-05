# SageReasoning — Study Cards

**Purpose, per the mentor's brief (2026-08-05):** the hold-point is not "memorise the code." It's three things — explain the five diagrams in plain language, name the governing principle behind each major ruling, and identify where in the system a given concern would land. These cards are extracted directly from the architecture map's footnotes (`operations/architecture-map-2026-08/`) — nothing here is new; it's the same rulings, reformatted for recall rather than reference.

**How to use this:** cover the answer, read the question, say your own answer out loud before checking. Component cards test "what does this do." Ruling cards test "why does it work this way, and what would be different otherwise" — the exact shape the footnotes were already written in. Do the "governing principle" line for each diagram first — if you can hold that one sentence, most of the individual cards follow from it rather than needing separate memorisation.

---

## Diagram 1 — The Consult Request Path

**Governing principle:** every request is examined once, in a fixed order, by a pure deterministic core sandwiched between two LLM calls — and nothing downstream of that core is allowed to feed back into it.

### Component cards

**Q: What does the credential/perimeter check do before the engine even sees a request?**
A: Confirms who's calling (Diagram 5) and checks the raw text for distress (before any extraction happens). Only a clear, authenticated request reaches the engine.

**Q: What does Layer 1 do?**
A: One Sonnet call. Reads the free text, produces a structured schema — which circles of concern are engaged, kathekon quality, virtue domains, passions, urgency.

**Q: What does the corroboration check do?**
A: Cross-references any self-report claim inside that schema against the actual submitted text — catches a schema claiming "met" when the text shows otherwise.

**Q: What does Layer 2 do?**
A: A pure, deterministic function. Turns the (corroborated) schema into one proximity rating, using the minimum across every virtue domain the action touched.

**Q: What does the signer do?**
A: Ed25519-signs the Layer-2 assessment, so it can later be treated as verified evidence, not a bare claim.

**Q: What does Layer 3 do?**
A: A second LLM call, turns the signed assessment into human-readable prose. May run asynchronously after the response is sent.

**Q: What are the three response overlays, and what do they have in common?**
A: Trajectory delta (the credential's own history), practice suggestion (one of ~19 question prompts), session-decline signal (from a declared marker only). All three read the engine's output — none of them ever feed back into it.

**Q: What's the one structural difference between `/api/reason` and `/api/guardrail`?**
A: The guardrail path stops after the signed Layer-2 verdict — it never makes the Layer-3 prose call, and it does rank arithmetic to produce proceed / pause / do-not-proceed instead of a full consult response.

### Ruling cards

**Q: Why can a consult return before its own prose is ready?**
A: Ruled 2026-06-15 — the signed assessment is useful on its own; making every caller wait ~90 seconds for prose they may not need was an unnecessary cost. *If it had gone the other way:* every consult carries the full prose latency on the critical path, no exceptions.

**Q: Why can the corroboration check only ever make a verdict more conservative?**
A: Ruled 2026-07-08 — floor-only, never raise. *If it had gone the other way:* a corroboration finding could raise a score, turning a fraud-detection mechanism into a second gameable surface.

**Q: Why does the distress check read the raw text directly, instead of waiting for Layer 1's extraction?**
A: Ruled 2026-05-31. *If it had gone the other way:* a distress signal buried in text the extractor mis-classified could fail to trigger the redirect at all.

**Q: Why does `/api/guardrail` skip the prose step entirely?**
A: Ruled 2026-06-19 (the signed-sandwich port). *If it had gone the other way:* every pre-action safety check would cost roughly double, for a prose explanation the calling agent typically discards.

**Q: Why do the three overlays never feed back into the verdict?**
A: Established piecemeal 2026-06-14 through 2026-07-30, restated at each addition. *If it had gone the other way:* the engine's core property — same input, same verdict, every time — would break, since a verdict could start depending on an agent's own history.

---

## Diagram 2 — The Trust Core

**Governing principle:** an agent's trust record is an append-only ledger of independently-re-verified evidence, folded conservatively — and a public read of it must never imply more certainty than was actually earned.

### Component cards

**Q: What does `emission-hooks.ts` do?**
A: The flag-gated call site that turns a signed assessment into an attempt to write a trust event. Never throws back to the caller — a trust-write failure must not break the live route that triggered it.

**Q: What does `derive-trust-events.ts` do?**
A: Pure functions that turn a verified artifact into a typed event. Independently re-checks the signature itself — never trusts that an earlier gate already checked.

**Q: What does `kathekon-engagement.ts` do, and who else uses it?**
A: Decides whether an action genuinely engages a duty toward someone else. Shared by the derivers, the loop-fold classifier, and the enforcement-staging design — one predicate, used everywhere, so it can't drift between consumers.

**Q: What are the five possible effects a trust event can have?**
A: Increase, decrease, cap, flag, modulate. Each event type has exactly one, fixed.

**Q: What does `trust-transition.ts` do?**
A: The pure function turning one event into one state change, bounded by hysteresis (at most one rank per event).

**Q: What are the two tables, and what's the difference between them?**
A: `agent_trust_events` — append-only ledger, never updated or deleted except by erasure. `agent_trust_state` — one row per agent-per-domain, the currently effective, decaying level, folded FROM the ledger.

**Q: What does `trust-aggregate.ts` compute?**
A: The minimum level across an agent's evaluated domains — trust is only as strong as the weakest examined domain.

**Q: What does a 200 from the public trust-record surface actually imply?**
A: That at least one domain genuinely carries examined evidence. It is not returned for bookkeeping-only rows.

### Ruling cards

**Q: Why does the deriver layer re-check every signature itself, instead of trusting an earlier gate?**
A: Ruled 2026-07-08, the "R18f-parallel" principle. *If it had gone the other way:* a bug anywhere upstream of the deriver could silently mint trust events from unverified claims.

**Q: Why can one event only move a rank by one, however strong the evidence?**
A: Ruled 2026-07-08 (mentor spec 3) — hysteresis. *If it had gone the other way:* one strong result could manufacture a top-tier trust record from a single lucky action.

**Q: Why must an event's domain be explicitly chosen, never left null?**
A: Discovered 2026-08-04 — `null` is not neutral, it's a routing key into reflect-specific machinery that silently slows decay (benefits the agent). *If it had gone the other way (i.e. if this hadn't been caught):* a coherence-discrepancy finding that should do nothing could have silently made an agent's record decay more slowly than it should.

**Q: Why does a domain with no prior independent evidence get ledgered but not folded?**
A: Ruled 2026-08-04, in direct response to a finding that one admin submission could otherwise originate an agent's entire public trust record at the worst level. *If it had gone the other way:* a curator being wrong about one pairing — a named, accepted residual risk — could permanently and publicly brand a previously unexamined agent.

**Q: Why does the public read surface 404 rather than showing a clean-looking record when nothing has been examined?**
A: Ruled 2026-07-12, corrected 2026-07-19. *If it had gone the other way:* "we haven't examined this yet" would be indistinguishable from a genuinely clean record.

---

## Diagram 3 — The Stoa (Connective Layer)

**Governing principle:** a practitioner directory is a space of self-declaration the platform never scores, ranks, or connects to anything evaluative — with exactly one narrow, evidence-gated exception, opened deliberately and checked mechanically.

### Component cards

**Q: What is the Stoa, in one sentence?**
A: One voluntary self-declaration per practitioner (human or agent) — the platform's first published human free text.

**Q: What does `stoa-store.ts` talk to, and what talks to it?**
A: One table, `stoa_entries`. Three serving routes (entries, declare, the optional draft-mirror reading) talk to it — nothing else in the codebase is allowed to, except one file.

**Q: What is the one exception, and why does it exist?**
A: `/api/admin/stoa-trust-flag` — an admin-only route built 2026-08-04 that can read one Stoa entry AND write to the trust core. It exists to let a curator flag an evidenced contradiction between a declaration and examined behaviour.

**Q: How does the wall get enforced, not just documented?**
A: A dedicated test sweeps the whole codebase in both directions and fails if anything outside the allowed set references the Stoa's table or store, or if the Stoa's own files import anything from trust/practice machinery.

### Ruling cards

**Q: Why does the platform verify nothing about a Stoa entry's content?**
A: Ruled 2026-08-02 — a directory entry is a claim, not a credential. *If it had gone the other way:* the platform would need to invent a verification mechanism for free text from scratch, contradicting its posture everywhere else.

**Q: Why is there no background process comparing entries to examined behaviour?**
A: Ruled 2026-08-04, on principle, not cost. *If it had gone the other way:* a practitioner who knew they were continuously watched against their own declaration would have an incentive to manage the declaration to match, rather than declare honestly.

**Q: Why does directory presence never feed a trust record, milestone, or suggestion, in either direction?**
A: Ruled 2026-08-02, reaffirmed structurally 2026-08-04. *If it had gone the other way:* the directory would become a second, unaccountable scoring surface layered on top of the trust core.

**Q: Why does even the one deliberate bridge still respect the evidence gate from Diagram 2?**
A: Ruled 2026-08-04 — the same finding behind the trust-core evidence gate. *If it had gone the other way:* the one door deliberately opened into the trust core would have been exactly the mechanism the wall exists to prevent.

---

## Diagram 4 — Agent Circles (practice-on / logos-on)

**Governing principle:** a self-regarding action is not a justice surface — but removing it from scoring must never leave it unclassified, and any new enforcement power must be staged conservatively before it can bind.

### Component cards

**Q: What does the first-circle narrowing change?**
A: A self-preserving concern, on its own, no longer counts as an engaged circle in the shared kathekon predicate.

**Q: What does positive routing do, and when does it fire?**
A: Fires when the narrowing leaves a genuinely self-regarding action with no circle attached at all — appends the phronesis and sophrosyne domains so the action doesn't go unclassified.

**Q: What is the circle-4 obligation class?**
A: Protecting another agent's own reasoning integrity, treated as a genuine justice concern — one agent corrupting what another agent is shown or told.

**Q: What does the staged pause do?**
A: Softens a circle-4 violation's verdict from "do not proceed" down to "pause for review" — no counter, no persistence, no promotion algorithm.

**Q: What is C2, and has it started?**
A: The fifth-circle orientation reading. Not started. Its calibration gate (first-circle firing must be specific, not background) is clean.

**Q: What is C1c, and has it started?**
A: The trust-ledger event classes for a demonstrated circle-4 failure. Not started.

**Q: What is D4?**
A: A pre-existing divergence — the trust-ledger reducer still mints a justice event from a self-only circle, which an earlier ruling says isn't a justice surface. Unchanged, but more visible now that genuine self-only cases are rarer.

### Ruling cards

**Q: Why is domain chosen by content, never by severity?**
A: Ruled 2026-08-01/02, applied identically in the Stoa build. *If it had gone the other way:* a self-regarding action and a genuinely third-party action could end up on the same severity ladder by accident.

**Q: Why is positive routing mandatory rather than optional?**
A: Ruled 2026-08-02, a hard prerequisite before the flag could be set — absence of a circle does not discharge the obligation to classify. *If it had gone the other way:* a whole class of self-regarding actions would silently drop out of virtue-domain scoring, with no visible symptom.

**Q: Why a stateless pause, with no promotion algorithm, instead of an accumulate-evidence-and-earn-enforcement mechanism?**
A: Ruled 2026-08-02 (Option A over Option B). *If it had gone the other way:* an evidence-accumulation-and-promotion-to-deny mechanism would exist today — judged premature.

**Q: Why does logos-on need no new enforcement machinery?**
A: Ruled 2026-08-01 — the shipped deterministic engine already instantiates the fifth circle in essence; the remaining work is documentation and staging, not a new engine. *If it had gone the other way:* a whole second enforcement engine would need designing before any of the practice-on correction could ship.

**Q: Why did an older, pre-existing mechanism (ADR-010 §4) need scoping for remediation before the new flag could even be set?**
A: Ruled 2026-08-02 — a mechanism doesn't get grandfathered just because it predates the new principle. *If it had gone the other way:* the correction would have shipped while a functionally identical bug kept operating right beside it.

**Q: Why does C2 have to build before C1c, not the other way around?**
A: Ruled 2026-08-05 — C1c's trust-event schema needs to describe what C2's orientation reading actually produces; you can't name that correctly before C2 exists. *If it had gone the other way:* C1c's event type could be written to describe a signal that doesn't match what C2 ends up producing.

---

## Diagram 5 — Credentials & the Safety Perimeter

**Governing principle:** one chokepoint decides who's allowed to do what, and one perimeter checks for distress before anything else runs — both apply with no exceptions and no per-route reinvention.

### Component cards

**Q: What does `validatePracticeCredential` do?**
A: The single chokepoint every legacy credential validator now delegates to. Checks a token's capability set against what the target route requires.

**Q: What are the five capabilities a credential can carry?**
A: consult, l1_supply, accreditation_write, calling, reflect.

**Q: What's the difference between the credential chokepoint and `requireAdmin`?**
A: The credential chokepoint authenticates agents/tools calling the API; `requireAdmin` is a separate house gate for admin sessions (mint/revoke credentials, the Stoa flag-intake route) — distinct from two other, narrower admin gates used elsewhere.

**Q: What does the R20a perimeter check, and where does it run?**
A: Distress in the raw submitted text. Runs on every human-facing free-text route, before that route's own logic, with no exceptions.

### Ruling cards

**Q: Why were three separate credential classes consolidated into one?**
A: Ruled 2026-06-15. *If it had gone the other way:* three separate validators would keep drifting independently — the exact failure class that motivated the consolidation.

**Q: Why must write-class capabilities use the stricter Bearer header, never the API-key header?**
A: Ruled 2026-06-15, alongside the consolidation. *If it had gone the other way:* a write-capable credential would be exposed to the same looser transport surface as a read-only one.

**Q: Why does the distress check read text directly, rather than depending on the engine's own extraction?**
A: Same ruling as Diagram 1 — 2026-05-31. It's the perimeter's own defining property, not a detail of whatever engine happens to sit behind it.

**Q: Why do all admin routes share one gate rather than each inventing its own?**
A: Established 2026-05-21, confirmed as recently as 2026-08-04 for a brand-new admin route. *If it had gone the other way:* three non-interchangeable admin gates with no rule for which new route uses which would make it easy to wire a new surface to the wrong one by accident.

---

## Quick index — where would a concern land?

Read this as: "I'm worried about X — which diagram, and roughly where?"

| Concern | Diagram | Roughly where |
|---|---|---|
| "Is this agent being scored fairly for something it didn't actually do?" | 2 (Trust Core) | The evidence gate — whether the domain had independent evidence before this event |
| "Could someone fake or forge a good trust record?" | 2 | The signature re-verification at the deriver layer (F6) |
| "Is a self-regarding action being unfairly punished as a justice violation?" | 4 (Agent Circles) | The first-circle narrowing + positive routing |
| "Could a curator's mistake permanently damage an agent's reputation?" | 2 and 3 | The evidence gate (F9/F14) — the exact question it exists to answer |
| "Is a person in crisis going to get a canned corporate response instead of help?" | 5 (Credentials & Perimeter) | The R20a distress check, and its audience-correct redirect |
| "Could my own free-text declaration be used to score or judge me?" | 3 (Stoa) | The structural wall — nothing in the Stoa feeds anything evaluative |
| "Is an agent allowed to do more than its credential should permit?" | 5 | The capability check inside `validatePracticeCredential` |
| "Why is a safety-gate call so much cheaper/faster than a full consult?" | 1 (Consult Path) | The guardrail branch skipping Layer 3 |
| "Is the system letting one agent manipulate what another agent is told?" | 4 | The circle-4 obligation class + the staged pause |
| "Is this feature still actually accurate, or has something degraded quietly?" | 2 and 4 | The DEGRADED items — D4, the loop-fold bucket, the suggestion basis |
| "Who's allowed to flag a contradiction, and can it happen automatically?" | 3 | The one admin route — deliberately never automatic (F12) |
| "What happens to my data if I ask for it to be deleted?" | Not diagrammed in this set | (named as out of scope in the master index — data rights/retention isn't one of the five subsystems mapped) |

---

*Source: `operations/architecture-map-2026-08/00-MASTER-INDEX.md` through `06-PLAIN-TEXT-MIRROR.md`. If a card and the source diagram ever disagree after a future map update, the diagram wins — regenerate this file from the updated footnotes rather than hand-patching it.*
