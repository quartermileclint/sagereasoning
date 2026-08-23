# Next-Session Prompt — Publish the `ruling_faculty_state` oikeiosis-only scope note (R18)

**Paste as the first message of a new session, in the `sagereasoning` repo root.**

**Stream:** founder.
**Tier:** `governance` with a `code-elevated` rider — two static public files plus one edit to
`website/src/app/api-docs/page.tsx` (a rendered page, so `npm run build` is a gate, not optional).
**Risk:** Elevated under 0d-ii. **AC7 not engaged** — no live operation; publication happens on the
founder's push. **The binding discipline is R18: founder-signed wording BEFORE any public surface
changes.** PR20 applies (re-verify every citation below against source).
**Governing frame:** `/adopted/standing-protocol-cache.md`.
**Predecessor:** `operations/handoffs/founder/2026-08-23-d4-completion-proxy-fix-CLOSE.md`
(commits `f7619d9`, `64cb1bb`).

**This session is small and is completable in one sitting.** Its whole substance is: get one
sentence signed, put it on three surfaces, verify, commit. The founder's hand is needed **once** —
for the signature — and once more at the end, for the push.

---

## Step 0 — Open and re-ground

1. Read `/adopted/standing-protocol-cache.md`.
2. **Read the binding ruling in full and treat verbatim as governing:**
   `operations/agent-circles-2026-08/2026-08-24-mentor-ruling-oikeiosis-scope-note-verbatim.md`.
   Read its "Recording notes" section too — three of the ruling's own present-tense facts had
   already moved when it was relayed, and they change *where* the note goes.
3. Read `2026-08-23-evaluative-engine-status-documentation-map.md` **§5b** — the bound, its
   evidence, and the superseded draft.
4. `git log -1` / `git status` — confirm HEAD is at or after `64cb1bb` and that
   `website/src/data/environmental-context.json` is still the only unrelated modification (it is a
   weekly-scan refresh; **it must not ride this commit either**).
5. `ListAgents` — coordinate before editing `llms.txt` or `agent-card.json`; several concurrent
   sessions touch the R18 surfaces.
6. Confirm at open: tier; hold-point P0 0h; weights BLOCKED; **no code, no flag, no schema, no
   credential, no live op in scope.**

---

## Part A — What is owed, and why

**RULED 2026-08-24, adopted as binding.** The oikeiosis-only bound on `ruling_faculty_state` owes a
public scope note. The mentor's reasoning: EE-C2 held that the label should disclose what the field
actually measures rather than what a consumer might assume, and *"the oikeiosis-only bound is that
same gap in a different form."*

**The distinction that does the work — do not collapse it.** The interim proxy label (retired at
`f7619d9`) named *a deficiency in **how** the oikeiosis mechanism counts deliberation*. This scope
note names *what the mechanism reads **at all***, which is **prior**. Verbatim: *"Both are owed. The
proxy disclosure does not substitute for the scope note."*

**Lifetime:** the note **stays until the mechanism's scope changes** — a separate build decision,
not a proxy fix. No future D4-style correction retires it.

### What the note MUST convey (the mentor ruled content, not wording)

Three clauses. The mentor explicitly flagged the third: *"That last clause matters."*

1. The deliberation reading in `ruling_faculty_state` is drawn from the **oikeiosis mechanism only**.
2. A snapshot showing deliberation in the **control-filter, value-assessment or causal-stage**
   mechanisms **but not** in the oikeiosis mechanism **reads as not-deliberating**.
3. **This is a scope constraint on the field, not a deficiency in the snapshot.** It must not imply
   the snapshot is incomplete, or that the agent failed to deliberate.

**The §5b draft of 2026-08-23 FAILS this** — it carries (1) and (2) and omits (3). It is retained in
§5b only as the superseded record. Do not publish it.

**The mentor declined to rule on wording** ("you have not seen it, so I will not rule on its
specific wording"), so the signature below is genuinely the founder's and the candidate text is a
proposal, not a mandate.

### Where it goes — and the one place the ruling's own hint does not reach

All **three** R18 surfaces, per the ruling. The map itself is already live on all three (shipped
2026-08-08), so the note attaches to existing epistemic-status content rather than riding a new wave.

The ruling says to place it *"adjacent to the interim proxy disclosure."* On two surfaces that means
*where the interim disclosure was* — it was removed at `f7619d9`. **On the third it locates nothing:
`api-docs/page.tsx` carried the map but never carried an interim clause** (verified against
`f7619d9~1`). There, attach to the existing `Epistemic status of engine outputs` list item.

---

## Part B — The signature gate (do this FIRST, before touching any public file)

Put the three candidate texts to the founder **verbatim** and get an explicit signature or an
amendment. **Nothing public changes before that.** If the founder amends, re-check the amended text
against the three required clauses above and say plainly if a clause has been lost.

### Candidate — Surface 1, `website/public/llms.txt`

Insert as its own paragraph in the `### Epistemic status of engine outputs` section, in the position
the interim-disclosure paragraph occupied: after the Ed25519 signature-scope paragraph, before
`Three disclosed routes where confidence can exceed basis…`.

> Scope — `ruling_faculty_state`'s deliberation reading. This field's deliberation reading is drawn
> from the oikeiosis mechanism only: a cross-circle tension, or a Cicero verdict balanced between
> honourability and advantageousness. It reads nothing from the control filter, the value
> assessment, or the causal-stage evidence — so a snapshot that shows deliberation in those
> mechanisms but not in the oikeiosis mechanism reads as not-deliberating. This is a scope
> constraint on the field, not a deficiency in the snapshot: it does not mean the reasoning was
> incomplete, and it is not a finding that the agent failed to deliberate.

### Candidate — Surface 2, `website/public/.well-known/agent-card.json`

Append to the **existing** `epistemic-status-map/v1` extension's `description`, immediately before
the closing `Disclosure-side only —` sentence (the position the interim clause held).
**Do not add a new extension. The count stays at 24.**

> Scope note: ruling_faculty_state's deliberation reading is drawn from the oikeiosis mechanism only
> (a cross-circle tension or a balanced Cicero verdict) and reads nothing from the control filter,
> value assessment, or causal-stage evidence, so a snapshot showing deliberation in those mechanisms
> but not in oikeiosis reads as not-deliberating — a scope constraint on the field, not a deficiency
> in the snapshot and not a finding that the agent failed to deliberate.

### Candidate — Surface 3, `website/src/app/api-docs/page.tsx`

Append to the existing `Epistemic status of engine outputs (a map, not a field)` list item, after
the `See llms.txt …` sentence. Match the file's JSX conventions: `&mdash;` for em-dashes,
`&apos;` for apostrophes, `<code>` for identifiers.

> `ruling_faculty_state`'s deliberation reading is drawn from the oikeiosis mechanism only (a
> cross-circle tension or a balanced Cicero verdict) &mdash; a snapshot deliberating in the
> control-filter, value-assessment or causal-stage mechanisms but not in oikeiosis reads as
> not-deliberating. That is a scope constraint on the field, not a deficiency in the snapshot.

---

## Part C — Build order, once signed

1. Apply the signed text to all three surfaces. **Minimal diffs** — insert the paragraph/clause and
   change nothing around it.
2. Update `2026-08-23-evaluative-engine-status-documentation-map.md` **§5b**: mark the bound
   **PUBLISHED**, name the commit's decision-log ID, and replace the superseded-draft block with the
   text as actually signed. §5b's heading currently says the bound is "pending R18 publication" —
   that becomes false on this commit.
3. Verify:
   - `python3 -c "import json;d=json.load(open('website/public/.well-known/agent-card.json'));print(len(d['capabilities']['extensions']))"` → **24**, unchanged.
   - `grep -c "oikeiosis mechanism only" website/public/llms.txt` → 1.
   - `npm run build` → **0** (Surface 3 is a rendered page).
   - `npx tsc --noEmit` → 0.
   - Re-read each inserted sentence against the three required clauses and confirm each is present.
4. **Decision-log entry** — lean form. Name: the ruling adopted, the signature given, the three
   surfaces, and explicitly that the note's lifetime is *until the mechanism's scope changes*, not
   until the next proxy fix.
5. **Path-scoped commit**, excluding `website/src/data/environmental-context.json`. Then hand the
   founder the push.

---

## Constraints that bind

- **R18 is the gate.** No public surface changes before a founder signature on the wording. If the
  session cannot obtain one, it stops with the candidates prepared and nothing edited — that is a
  legitimate outcome, not a failure.
- **Do not add a new agent-card extension.** The clause rides the existing
  `epistemic-status-map/v1` description; the count stays 24.
- **Do not touch any code in `website/src/lib/`.** No engine file, no test, no flag. The
  `ruling_faculty_state` computation is finished and PR19-reviewed; this session publishes a
  disclosure about it and changes no behaviour.
- **Do not reinstate the retired interim proxy disclosure.** It is closed and its removal was ruled.
  This note is a *different* disclosure; if a draft starts describing the filler-note proxy, it has
  drifted.
- **Do not re-open the D4-completion work item.** It is CLOSED and its gate was discharged.
- Weights BLOCKED. The Q1 hard constraint untouched.

---

## Rollback

`git revert` the publication commit. Static content plus one JSON description plus one JSX list
item; nothing deploys from the map or the decision log.

## What "done" looks like

One signed sentence live on three surfaces, §5b marked PUBLISHED with the signed text recorded, a
decision-log entry naming the lifetime condition, a path-scoped commit, and a push. The consumer
reading `ruling_faculty_state` can now interpret it correctly rather than over-reading it — which is
the whole of what the ruling asked for.

*End of prompt.*
