# Next-Session Prompt — D4-Completion: Replace `ruling_faculty_state`'s Deliberation Proxy

**Paste as the first message of a new session, in the `sagereasoning` repo root.**

**This session is scoped to be completable entirely without the founder present.** No schema, no
flag, no credential, no live SQL. The one thing that touches production — the final push — needs
only a single-line go-ahead from the founder at the very end, not a walked session; everything up
to and including that point (build, review, docs, the removal of the interim disclosure) is this
session's own work.

**Stream:** founder.
**Tier:** `code-critical` — this edits `layer2-mechanisms.ts`, a MEASURED SURFACE
(`/api/reason` + `/api/guardrail`'s shared engine), unconditionally and with no flag gate (see
Part A, "why no flag" — this is a deliberate election this session must make explicit, not
inherit). PR6, PR19 (mandatory, at least once — twice if the account's spend limit doesn't force
a first-hand fallback), PR20 (every citation below re-verified against source, not trusted from
this prompt).
**Governing frame:** `/adopted/standing-protocol-cache.md`.
**Predecessor:** the ATRF/EE production wave (`2026-08-23-atrf-ee-production-wave-CLOSE.md`,
through its live-walk addendum) — closed, HEAD `c77d193`, pushed, `origin/main` in sync.

---

## Step 0 — Open, re-ground, confirm nothing has moved

1. Read `/adopted/standing-protocol-cache.md` in full.
2. `ListAgents` — coordinate with any live peers before editing `layer2-mechanisms.ts`; multiple
   concurrent sessions have touched this stream on several days recently.
3. `git log -1` and `git status` — confirm HEAD is at or after `c77d193`. If the tree has moved,
   re-read whatever landed since before trusting the citations below.
4. **Re-verify every line-number and quoted-string citation in this prompt against current
   source before building from it (PR20).** This prompt was written at HEAD `c77d193`; drift is
   possible.
5. **Check the byte-identity guard's live state before touching `layer2-mechanisms.ts`:**
   ```bash
   printenv GATE1_FALSE_HOLD_CAPTURE
   ```
   As of this prompt's writing it is **unset (dormant)** — per the 2026-08-15 M1 ruling, the
   guard only binds while an observation window is running. If it is set to `true`, **stop and
   tell the founder** — editing this file mid-window would trip a measurement-integrity guard
   that exists for a real reason, and this session should not silently work around it.
6. Confirm at open: tier `code-critical`; hold-point P0 0h active (all current tasks before any
   0h assessment); weights BLOCKED; the Q1 hard constraint untouched by anything here.

---

## Part A — What this session builds, and why it is licensed

### The gap, precisely (re-verify all of this against current source, not this prompt)

`ruling_faculty_state`'s deliberation input is computed at **two call sites** in
`layer2-mechanisms.ts`, both currently reading `oik.deliberation_notes.length > 0` — the legacy
proxy that counts *presence* of a deliberation note, not whether any note is *substantive*. A
filler note (`"No circles engaged in this snapshot."`) satisfies it.

The **proximity** computation had this exact defect and was fixed (D4, a prior session): a new
function `hasGenuineDeliberation(oik: Oikeiosis): boolean` was added, requiring a **substantive**
note — `c.tension !== null || c.cicero_verdict === 'balanced_neither_decisive'` across
`oik.relevant_circles` — and wired into `computeProximity`'s flag-on branch only (the
`dikaiosyne` parameter — live in production since 2026-06-25 via
`SUBSTRATE_PROXIMITY_DIKAIOSYNE_ENABLED`). Its own docstring says, verbatim (re-read it at the
call site, it is a load-bearing sentence): *"Narrow by design: only the proximity computation
reads this; ruling_faculty_state is untouched this session (the broader proxy re-examination is
a named follow-up)."*

**This session is that follow-up.**

### Ruled disclosure, and its removal condition — the reason this session exists at all

EE-C2 (`2026-08-23-mentor-rulings-evaluative-engine-epistemic-status-verbatim.md`, ruled): *"An
interim label is owed… it is removed when the D4-completion code follow-up lands and the proxy
is replaced… the documentation-map entry is removed at the same commit that fixes the proxy.
This is named now, not left to the build session to discover."*

The tracked completion gate (read this file in full before doing anything else — it enumerates
exactly what must be cleared and where):
`operations/agent-circles-2026-08/2026-08-23-D4-completion-proxy-fix-WORK-ITEM.md`

Three surfaces currently carry the interim disclosure, and **all three must be edited in the
same commit that lands the fix** (re-verify these are still the load-bearing lines before
editing — do not trust the line numbers below without re-grepping):
1. `operations/agent-circles-2026-08/2026-08-23-evaluative-engine-status-documentation-map.md`
   §4 — the `ruling_faculty_state` interim-disclosure paragraph.
2. `website/public/llms.txt` — the `### Epistemic status of engine outputs` section's own
   `Interim disclosure — ruling_faculty_state.` paragraph (live since this wave's push).
3. `website/public/.well-known/agent-card.json` — the `epistemic-status-map/v1` extension
   description's `"Interim disclosure: ruling_faculty_state's deliberation input is currently a
   proxy…"` clause (live since this wave's push).

**Same commit. Not a later tidying pass.** A disclosure that outlives the limitation it discloses
is a false statement on a public surface — the work item's own words.

### What the fix actually is

Extend `hasGenuineDeliberation`'s reasoning to the `ruling_faculty_state` call sites. The two
current call sites (re-verify line numbers at open):
- `computeProximity`'s flag-**off** branch (`!dikaiosyne`), which still passes
  `oik.deliberation_notes.length > 0` — **leave this one alone.** It is the byte-identical
  pre-§4 legacy path and must stay that way; touching it would be an unrelated regression.
- `ruling_faculty_state`'s own computation (`computeRulingFacultyState`, called with
  `oik.deliberation_notes.length > 0` as its fourth argument) — **this is the one to fix.**

**The design question this session must actually answer, not assume:** should
`ruling_faculty_state` use the *exact same* `hasGenuineDeliberation` function proximity uses, or
does its own semantics (a narrative description of the ruling faculty's state, not a proximity
rank) warrant a distinct-but-analogous substantive-note test? Read `computeRulingFacultyState` in
full (it is a small function, five branches) and `hasGenuineDeliberation` in full before deciding.
The house precedent for this kind of question is to **reuse, not re-derive** (PR15) unless a
concrete reason not to is found and stated — the working hypothesis going in should be "reuse
`hasGenuineDeliberation` directly," and the session should only diverge from that if it finds a
genuine semantic mismatch, stated explicitly in the decision-log entry.

**One thing this fix must NOT do:** change `ruling_faculty_state`'s behaviour on the
`dikaiosyne`-flag-**off** path. `computeRulingFacultyState` is called once, outside the
`if (!dikaiosyne)` branch — re-verify whether it needs to become flag-conditional too, or whether
(more likely, since it was never inside that branch to begin with) it was already effectively
flag-independent and this fix simply makes it correct unconditionally. **This is exactly the kind
of question a careless read would get wrong — trace the actual call graph, do not assume from
this prompt's characterisation.**

### Why no flag gate (the election this session must make explicit)

Unlike most measured-surface changes in this project, this one is being built **without** a
feature flag — re-confirm this is the right call before building, don't inherit it uncritically:

- The analogous EE-C1 fix (this wave, same day) was a pure wording change with the ruling's own
  words stating "the classification and every downstream consequence are unchanged" — licensed
  to ship unconditionally.
- This fix is **not** pure wording — it changes what `ruling_faculty_state` actually outputs for
  some real inputs (any schema where `deliberation_notes` is non-empty but not substantive). That
  is a genuine behaviour change on a live, unflagged, always-on code path.
- **Named tension for this session to resolve, not paper over:** does `ruling_faculty_state`'s
  own consequentiality (per EE-B1's four conditions — does it float a verdict, is it served
  publicly, does it feed a trust event, is it named in an acted-upon disclosure?) make an
  unflagged live change here acceptable, or does the weight of changing a live field's output
  unconditionally argue for gating behind a new flag (mirroring `SUBSTRATE_PROXIMITY_DIKAIOSYNE_ENABLED`'s
  own caution) even though the fix is "just" narrowing a proxy? **Answer this with reasoning in
  the decision-log entry, do not silently pick one.** If the session concludes a flag is
  warranted, that is a bigger, still-fully-buildable task (mirroring the EE-C1/A2/A3 build
  pattern from this wave — dark-built, TEST-verified if it needs a live smoke, then its own
  founder-walked activation) and should be scoped as such rather than forced through unflagged
  because this prompt assumed no-flag.

---

## Part B — Build order

1. **Read `hasGenuineDeliberation`, `computeRulingFacultyState`, and both call sites in full**
   (Part A names them; re-locate by grep, do not trust line numbers). Decide the flag question
   from Part A's last section before writing any code.
2. **Build the fix** — either reusing `hasGenuineDeliberation` directly at the
   `ruling_faculty_state` call site, or (if a genuine semantic mismatch is found) a small,
   clearly-justified sibling function. Follow the existing docstring discipline in this file —
   every function of this kind carries a comment naming what it fixes and why, in the house
   voice.
3. **Build a battery.** Mirror `proximity-dikaiosyne.test.ts`'s own structure and rigor for the
   `ruling_faculty_state` half specifically: assert the filler-note case now reads
   `hasDeliberation: false` where it previously read `true`; assert a genuine substantive note
   (tension or a balanced Cicero verdict) still reads `true`; assert the flag-off proximity path
   is byte-identical to before (a negative control); assert every one of
   `computeRulingFacultyState`'s five branches is still reachable and correctly discriminated
   under the new input. **Mutation-verify** the fix the same way this wave's PR19 folds did —
   defeat the fix, confirm the intended assertions red, restore, confirm green.
4. **Remove the interim disclosure from all three surfaces**, same commit, per the work item's
   own enumeration. Do not paraphrase the surrounding text while removing it — a minimal diff
   that removes exactly the disclosure paragraph/clause and nothing else is easier for a later
   reader to audit than a rewritten section.
5. **Update the work item file itself** — mark it CLOSED, name the commit, and state which of
   the two flag-question outcomes (Part A) the session reached and why.
6. **`tsc --noEmit` and `npm run build`** — both must be 0. Re-run the full regression sweep this
   wave used (`proximity-dikaiosyne.test.ts`, `layer1-schema-additions.test.ts`,
   `guardrail-sandwich.test.ts`, `reasoning-integrity.test.ts`, plus the new battery) — all must
   stay green, none newly red.
7. **PR19** — independent adversarial review of the diff. Given this touches a measured surface
   unconditionally, treat this with at least the rigor of this wave's round 1 (code/contract)
   review; if the flag question was answered "yes, gate it," treat it with the rigor of round 2
   (SQL/activation semantics) as well, adapted to a code-flag activation instead of a schema
   activation. If the account session limit forces a first-hand fallback, follow this stream's
   now-repeated precedent (§4 pattern) rather than skip it.
8. **Decision-log entry** — lean form per the standing cache, but this is a `code-critical`
   change to a measured surface, so do not compress the reasoning: name the flag decision
   explicitly, name every regression battery run, name the mutation-verification result.
9. **Do NOT push.** Stop here, with everything built, reviewed, and committed locally (or ready
   to commit — founder's call whether the session commits or leaves it staged), and hand the
   founder a short close: what was built, what the flag decision was and why, batteries green,
   PR19 clean or folded, and the one remaining step — **a single push**, which is the only
   founder-touching action in this entire session.

---

## Constraints that bind regardless

- **PR19** required before this is "verified," per the trust-core/predicate/fold/engine class
  this cache names.
- **PR20** — re-verify every citation in this prompt against source; this prompt is a pointer,
  not a derivation.
- **The byte-identity guard** (Step 0.5) — check its live state before the first edit, not after.
- Weights BLOCKED throughout; nothing here is a training signal.
- **Do not touch** the `dikaiosyne`-flag-off proximity path, the `SUBSTRATE_PROXIMITY_DIKAIOSYNE_ENABLED`
  flag's own logic, or any other function in `layer2-mechanisms.ts` not named above.
- **Do not** build the standing-runner design session, the O-C Gate-3 design session, or the
  EE-A3 credence-field option — all separately licensed, all explicitly out of scope here.

---

## What "done" looks like

A single (or small number of) commit(s), locally committed and ready to push, containing: the
fixed `ruling_faculty_state` computation; a new or extended battery proving it; the interim
disclosure removed from all three surfaces in the same change; the work-item file marked closed;
a decision-log entry naming the flag election and its reasoning; PR19 folded; every existing
battery still green. The founder's only remaining action is reading the close and typing `git
push`.

*End of prompt. One well-scoped fix, fully buildable and reviewable without a live founder
session, ending at the threshold of the one action that genuinely needs their hand.*
