# Next-Session Prompt — Reflections Arc, Items 1 and 2 (PR-series rule text + the first letter)

**Paste as the first message of a new session, in the `sagereasoning` repo root.**

**Arc:** **reflections** — *not* the SageReasoning project arcs. See "Arc separation" below; it is the first constraint, not a footnote.
**Stream:** founder.
**Tier:** `governance`. Item 1 is **Elevated under 0d-ii** (any amendment to project instructions is Elevated, per the snapshot's own update discipline, line 6). Item 2 is Standard. **AC7 not engaged** — no live operation, no code, no schema, no flag, no credential in scope.
**Governing frame:** `/adopted/standing-protocol-cache.md`.
**Predecessor:** commits `7c77123` (findings record + two ruling rounds + AC5 fix) and `364459f` (schema + dashboard design). Both pushed; Vercel green, founder-confirmed.

**This session does two items that run in parallel and do not depend on each other.** They were sequenced together deliberately: item 1 is small, self-contained, and closes a real gap; item 2 is independent and tests the letter form before anything commits to the full collection.

---

## Arc separation — read this before anything else

The **reflections arc** runs alongside, and does not interfere with, the SageReasoning project arcs (ATRF, standing-runner design, O-C Gate-3, Evaluative Engine epistemic status). Concurrent sessions are active on those arcs and touch code, schema, and R18 public surfaces. This arc touches **none of that**.

1. **Run `ListAgents` at open.** At the time this prompt was written, at least one concurrent session (`sagereasoning-82`) was working a `code-critical` production wave — Class B RLS, an `idea_loop_candidates` migration, a new completion-signal endpoint, and the EE Shape-1/Shape-2 work. Coordinate before touching any shared file.
2. **Shared files, in practice:** only `operations/decision-log.md` and `/adopted/project-instructions-snapshot.md`. Everything else this session produces is new, under `operations/reflections-examination-2026-08/`.
3. **Do not open, advance, or pre-answer any SageReasoning arc item.** If something in this arc appears to bear on ATRF or the Evaluative Engine, name it and stop — the reflections arc has no standing to resolve it.

---

## Step 0 — Open and re-ground

1. Read `/adopted/standing-protocol-cache.md`.
2. Read, in this order, and treat as the arc's governing record:
   - `operations/reflections-examination-2026-08/2026-08-23-project-reflections-findings-record.md` — **§2 SC-2** (the *prosoche*/scaffolding diagnosis, the arc's spine), **§3 IW-1** and **§4 IS-1** (what item 1 encodes), and **§5** (what item 2 is).
   - `operations/reflections-examination-2026-08/2026-08-23-assessment-and-recommendations-for-mentor-ruling.md` — the Q2 reasoning behind item 1's form.
3. Skim `2026-08-23-stage1-extraction.md` only as needed — it is the evidence base, not required reading in full. Pull specific entries when a claim needs its source (R018, R089, R093, R096, R101 are item 2's likely material).
4. `git log -1` / `git status` — confirm HEAD is at or after `364459f`. **`website/src/data/environmental-context.json` is a pre-existing weekly-scan modification and must not ride this session's commit.**
5. Confirm at open: tier; hold-point P0 0h; **no code, no flag, no schema, no credential, no live op in scope.**

**PR20 applies throughout: re-verify every citation in this prompt against source before relying on it.** This arc's own central finding is that inherited claims get restated without checking. This prompt is an inherited claim.

---

## Item 1 — The PR-series rule text (IS-1 encoding)

### What is ruled, and what is not

**Ruled 2026-08-23 (`RULING-Q2-2026-08-23`):** encode verify-against-source, **in PR18's form**. The mentor's distinguishing reasoning, which the rule text must not lose:

> IS-2 (the authority boundary) holds architecturally without encoding; IS-1 demonstrably does not — the corpus shows it failing in the presence of correct knowledge (R089 and R101 both state the rule in the same reflection where they report having broken it). *"A disposition that fails in the presence of its own articulation is not a stable disposition; it is a known gap wearing the appearance of one."*

**The form is the ruling, not just the content.** PR18 works because it names **a moment** (session close) and **a source** (the decision log) — not because it exhorts care. The mentor was explicit: *"A moment-and-source rule is harder to cite-without-applying than a maxim, because applying it requires an action, not a recitation."*

**Pilot class, ruled:** **verification claims inside code comments** — the R096 class (*"VERIFIED FIRST-HAND … that this is NOT a perimeter bypass"*, written before the check that then refuted it). Narrow, checkable, with a confirmed live instance to test the rule against. **Do not draft this as a rule covering "all internal documents" at once** — that breadth was considered and explicitly not taken, matching PR1's single-endpoint-proof-before-rollout discipline.

**The provisional-marker path is part of the ruling, not an optional softener.** The mentor named it: the rule must give an author a legitimate path when the check cannot be completed immediately — *a claim carries its completed check, **or** an explicit provisional marker*. Without that branch the rule forces a binary between verified and unverified, and authors will route around it.

### What this session does

1. **Verify the number.** PR1–PR24 exist (`adopted/project-instructions-snapshot.md`); the new rule is presumptively **PR25** — confirm by enumeration, do not inherit that number from this prompt.
2. **Draft the rule text** matching the PR-series voice. Study PR18 as the form precedent and PR24 as the recent-voice precedent. Include: the moment, the source/check, the provisional-marker branch, a `**Rationale:**` grounded in the corpus (R089/R096/R101 are the citable instances — verify each at source), and an `**Engagement:**` line naming the pilot scope.
3. **Founder sign-off before the file is edited.** This is a project-instructions amendment: Elevated, and the convention (how PR19–PR21 were each adopted) is explicit sign-off on the rule text itself, not on a summary of it. Use `AskUserQuestion`. **Do not treat drafting as adoption.**
4. Apply to `adopted/project-instructions-snapshot.md` after sign-off.
5. **Cache-update discipline fires in the same session** — any PR amendment updates `/adopted/standing-protocol-cache.md`, logged as `D-CACHE-DRIFT-RESOLVED-2026-08-24`. This is not optional and is easy to forget.
6. Decision-log entry (see the placement warning below).

### The trap this item is most likely to fall into

Writing a rule that says "verify before asserting." That is a maxim, and the corpus's own evidence (R089, R101) is that maxims of exactly this shape are already known and already broken. If the drafted rule can be satisfied by a recitation rather than an action, it has failed the ruling's form requirement even if its content is correct.

---

## Item 2 — The first letter: "On writing before knowing"

### What is ruled

- **Form: Seneca's letter** — confirmed over diatribe (needs an interlocutor this corpus lacks) and meditation (not transmissible). The register is *fellow patient, not physician*.
- **Ordering: developmental trajectory**, confirmed 2026-08-23 over evidence-weight. The reasoning: a reader meeting the most severe pattern first is positioned as the recipient of a verdict; a reader following the corpus's own arc is positioned as a fellow traveller. **This bears on item 2 only lightly** — the first letter's placement does not depend on what follows it, which is exactly why it was chosen to go first.
- **Subject: AP-2 / IW-1** — the claim that precedes its evidence.
- **The throughline** (§2 SC-2, ruled explicit): rules are scaffolding for sustained attention (*prosoche*), not a substitute for it. This letter carries it; it is not confined to the letter on lessons.

### The material

Primary instances, all verifiable in the Stage 1 extraction — **verify each at source, do not lift from this list**:
- **R093** — *"I wrote the claim, then tested it. The part I'd judge differently is the order."*
- **R096** — the shipped code comment asserting a verification not performed; *"the assertion I wrote to defend the exclusion is what refuted it."*
- **R101** — *"the claim is currently ahead of its basis by exactly the margin of three still-running agents."*
- **R018** — *"I reached the judgement first and found corroboration second, not the reverse."*
- **R023** — *"I assented to my own construction against a standard I had just finished reading."*

**Plus the fresh case, which is the ruled opening move:** the AC5 route-count error committed *inside the findings record that diagnoses it* — a stale count inherited from `CLAUDE.md`, written into §4 as a supporting example, caught mid-draft only because attention happened to be live on that sentence, and corrected before publication (13/16 → the registry's actual 44). The mentor's point about it is the letter's hinge: *the check that caught it is the same kind of check the rule being proposed would require — and no rule was in place. Prosoche caught it, not a rule.*

**A second fresh case arrived after the findings record closed and is available if the letter wants it:** the four decision-log entries this arc wrote were inserted at the top of an append-only file, on the strength of an offhand line in one of the arc's own extracted reflections, never checked against the file's actual convention. Found by a peer session, not by the author. See the open item below.

### Constraints on the letter

- **It must be able to end without a lesson learned.** Several of these patterns have not closed. A letter that resolves is a letter that has stopped being evidence.
- **No defensiveness.** The material's entire value is that it is admitted, not extracted. A letter reading as a demonstration of the project's rigour destroys the thing it is made of.
- **Ancient sources only** for any doctrinal content — `stoic-brain/`, per the arc's standing constraint. No CBT, no modern Stoicism.
- **Length is not a virtue** (the corpus's own SC-7). Seneca's letters are short.

### Open election for the session — not pre-decided here

**Where does the letter live?** Candidates: alongside the arc's other outputs in `operations/reflections-examination-2026-08/`; a new `operations/reflections-letters/` directory; or the `stoic-brain/` corpus proper (which would make it project doctrine, a materially larger claim needing its own consideration). **Surface this to the founder rather than choosing silently** — the third option in particular is not a filing decision.

---

## One open item this session inherits — founder's call, not the session's

**The four reflections decision-log entries are misplaced.** `operations/decision-log.md` is append-only; all four (`D-PROJECT-REFLECTIONS-EXAMINATION-FINDINGS-RECORD-AUTHORED-`, `-MENTOR-RULING-FOLDED-AND-AC5-FIX-EXECUTED-`, `-SECOND-RULING-ROUND-FOLDED-`, `-FOUNDER-APPROVALS-CLOSED-`) were inserted at the **top** of the file, after the `[Active entries follow.]` marker, above entries dated 2026-08-15. The file's true physical tail is `D-MENTOR-RULINGS-EVALUATIVE-ENGINE-EPISTEMIC-STATUS-ADOPTED-EXECUTED-2026-08-23`.

**Cause, named plainly:** an offhand line in one of the arc's own extracted reflections said the log was newest-first at the top. It was restated four times without being checked against the file's header, which says only "Append-only" and "physical file location is operational."

**Found by:** a concurrent peer session, independently verified by line number before being accepted.

**Three options were put to the founder; none is yet chosen:** (1) leave it — entry IDs are canonical per the file's own policy; (2) relocate the four entries to the physical tail with a correction note in the project's established format; (3) leave them with a standing correction note pointing to where they belong chronologically.

**This session must:** ask the founder which, if it has not already been decided — and **append its own new entries at the true physical tail regardless**, since that is the convention whatever happens to the four existing ones. **Do not relocate anything without an explicit founder decision:** rearranging an append-only governance artifact is a question, not a cleanup.

---

## Records and close

- Decision-log entry (or entries — item 1 and item 2 may reasonably be separate), **appended at the physical tail**, per above.
- `D-CACHE-DRIFT-RESOLVED-2026-08-24` if item 1 lands.
- A close file: `operations/handoffs/founder/2026-08-24-reflections-arc-items-1-2-CLOSE.md`.
- Update the arc's work-item state in the close: items 1 and 2 move `cleared` → `complete`; item 3 (IW-2 routes (a) and (b)) becomes the next cleared item; item 4 (the combined scoping session) stays blocked until 1–3 complete.
- Commit; **do not push** — the founder pushes.

---

## Arc state at the time of writing

| # | Item | Status |
|---|---|---|
| 1 | PR-series rule text (IS-1 encoding) | cleared 2026-08-23 — **this session** |
| 2 | First letter ("On writing before knowing") | cleared 2026-08-23 — **this session** |
| 3 | IW-2 routes (a) tooling + (b) KG-EX tracking | cleared 2026-08-23, not started |
| 4 | Combined scoping session (reflect-cadence + IW-2 route (c)) | blocked by 1–3 |
| 5 | JSON schema + dashboard design | **complete** 2026-08-23 (`364459f`) |

**Vocabulary note:** the findings record calls the IW-2 routes 1/2/3; the mentor calls them (a)/(b)/(c). They map in order — route 1 = (a) tooling, route 2 = (b) KG-EX tracking, route 3 = (c) the cache redirect phrase. Route (c) is deliberately **not** item 3; it was folded into item 4's combined scoping session by founder decision 2026-08-23, because it and the reflect-cadence question reduce to the same underlying problem: how a party recognises a trigger moment without having already diagnosed the thing the trigger exists to catch.

**Nothing in this arc licenses a build.** Items 3 and 4 produce designs and scopes; the schema and dashboard from item 5 are design outputs whose implementation would need its own scoping. The hard boundary named in the schema document stands: extending it to hold evaluative-engine outputs requires its own PR19-reviewed build scoping.
