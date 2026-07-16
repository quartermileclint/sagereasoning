# Next-Session Prompt — Remaining Principles: the logos teaching module (#12)

**For the founder. Paste as the first message of a fresh session.** This is a **window-safe**, **net-new** human-practitioner surface — and the **last** window-safe tool in Bucket A. Like its five predecessors (#7-human, #10-human, #9+#13, #8, #6+#15, #14) it never touches `/api/reason` or the substrate, so it is safe to build and deploy whether or not the 7-day observation window is still running. It builds the mentor's **logos module** — the foundational orientation that makes every other tool on the site cohere.

**Open under:** `operations/handoffs/founder/STANDING-SESSION-OPENER-grounded-foundations.md` (Parts A–F).
**Stream:** founder. **Tier:** `code-elevated` — a net-new static page + a new content module + a `/welcome` link. **NO schema, NO route, NO table, NO founder-walked migration** (see the design fork below — this is the lightest build in the family, and deliberately so).
**Governing plan:** `operations/trust-layer-2026-07/2026-07-13-remaining-stoic-principles-build-plan.md` — §3 (row #12), §4 (Bucket A item 9 + the per-item guardrails), §5 (deploy posture), §8 (the sequence). **Binding deploy verdict:** mentor **D6** — human-surface tools ship during the window as standalone PRs, boundary-verified **before** shipping.
**Governing context:** if the **7-day false-hold observation window** is still running (`GATE1_FALSE_HOLD_CAPTURE=true`, `SUBSTRATE_TRUST_CORE_ENABLED` MEASURE), the byte-identity deploy gate below is mandatory. If it has ended, keep the byte-identity check as hygiene. **S11 (ENFORCE) remains DEFERRED, readiness-gated; weights BLOCKED.**

## Why this session exists

Every tool now on the site is a technique whose *reason for being a technique* is invisible. The mentor's warning is precise and is the whole point of this build:

> *"A practitioner who does not understand why virtue is grounded in reason will treat the tools as techniques rather than as expressions of a unified understanding. The tools will work mechanically but not dispositionally."*

**First task at open — ground the design in the mentor's own words.** Read the survey's principle-12 section in `inbox/Mentor answer to remaining principles question.rtf` (search `### 12` — "Logos — the rational principle as the ground of moral community"). The load-bearing lines:

- **What is missing (verbatim):** *"Logos as a teaching tool for human practitioners who are encountering the Stoic framework for the first time. The concept that virtue is grounded in reason — not in social convention, not in divine command, not in felt preference — is the foundational claim that makes everything else in the framework coherent."*
- **The encoding (verbatim):** *"A foundational teaching module in the human practitioner surface — **not a tool but a prerequisite orientation**. The module explains the logos doctrine in accessible terms: there is a rational order to things, human beings participate in that order through their capacity for reason, and virtue is the full exercise of that capacity. Everything else in the framework follows from this."*
- **Its link to the calling stage (verbatim):** *"The module is the calling stage's philosophical foundation — the reason why purpose declaration matters is that the agent's purpose should be aligned with the logos, not merely with the agent's preferences."*
- **Verdict:** *"Warrants inclusion in the human practitioner surface as **the entry point for new practitioners**… A new practitioner arriving at the website without this orientation will encounter tools whose philosophical coherence is invisible to them. The logos module makes the coherence visible."*

Design from the mentor text, not from this paragraph.

## Scope — one net-new teaching page

**"Not a tool but a prerequisite orientation"** is the governing sentence, and it is what makes this build unlike its five predecessors. This is the **entry point**: a static, readable page that explains the logos doctrine in accessible terms and then makes visible how each existing tool descends from it.

**Likely artefacts:** a net-new `/logos` page + `layout.tsx` (with `SupportFooter`), a **NEW** content module for the teaching text, a `/welcome` link (and consider promoting it — it is an *entry point*, not another item at the bottom of "More to explore"), and a NEW boundary test.

## The design forks to settle at open (recommendations given; decide, don't survey)

1. **No table, no route, no gate — and this is the fork most likely to be got wrong.** Every sibling in this family has a table, a `/api/mentor/*` route, and a quality gate, so the pull toward that shape is strong. **Resist it.** The mentor says *"not a tool"* — there is nothing for a practitioner to submit, so there is nothing to persist, nothing to classify, and nothing to erase. **Recommendation: a purely static page.** That means **no migration, no route, no data-rights wiring, no LLM call, no `getClient`** — and therefore the cleanest boundary of the entire family (cleaner even than `/oikeiosis`'s gate-free extension, which still has a route). If you find yourself reaching for a "mark as read" or a progress table, that is the tool-shaped instinct the mentor explicitly warned against; a founder decision is required to add one, and the default is no.
2. **THE BOUNDARY TRAP — and it is the INVERSE of #14's.** The build plan permits *"read-only import of `stoic-brain.ts` only."* **Verified in code at the #14 close:** `src/app/methodology/page.tsx` **already read-only imports `stoic-brain`** — so a teaching page importing it is an established, shipped precedent, not a new risk. **But `stoic-brain.ts` is imported by 30+ files, including `src/lib/reasoning-receipt.ts`, which sits inside the `/api/reason` import graph** — so **EDITING `stoic-brain.ts` would break byte-identity and reclassify this item to must-wait.** The rule is therefore sharp: **importing it is fine; editing it is forbidden.** New teaching content goes in a **NEW module** (e.g. `src/lib/logos-teaching.ts`) that nothing in the engine imports.
   **⚠️ Do NOT copy `/sage-compass`'s boundary test unmodified.** Its `FORBIDDEN_SPECIFIER_SUBSTRINGS` blanket-bans `'stoic-brain'`, which is correct for #14 and **wrong for #12** — it would fail a permitted import. For #12: **remove `'stoic-brain'` from the forbidden-specifier list, keep `assessKathekon` in `FORBIDDEN_SYMBOLS`** (the plan forbids that symbol specifically), keep everything else (`/substrate`, `trust-core`, `kathekon-engagement`, `layer1-extractor`, `layer2-mechanisms`, `translation-sandwich`, `sage-reflect`, `proximity-domains`, `gate1-pre-decision`, `false-hold-capture`, `framing-core`), and **add an explicit assertion that `stoic-brain.ts` itself is unmodified** — the git byte-identity guard is the real gate here, so make the test say so honestly rather than imply a purity it does not prove.
3. **The calling-stage linkage — prose, not coupling.** The mentor frames the module as *"the calling stage's philosophical foundation."* **Recommendation: page prose only.** No import of the calling route, no code coupling — the #8 and #14 precedent (where "morning declares / evening assesses" and "the compass complements the passion diagnosis" were both kept as prose and never wired). A link to the relevant page is good; an import is not.

## Hard constraints (window-safe — from plan §4/§5 + D6)

1. **No instrument touch.** The page + content module must not edit or import `/api/reason`, the substrate libs (`layer1-extractor`, `layer2-mechanisms`/`computeProximity`, `kathekon-engagement`, `trust-core/*`, `translation-sandwich`), the Gate-1 hooks/`false-hold-capture`, or the reflect engine (`sage-reflect`, incl. `proximity-domains`). **A read-only import of `stoic-brain.ts` is PERMITTED (fork 2); EDITING it is NOT.** If the teaching content genuinely requires a `stoic-brain.ts` edit → **STOP and reclassify to must-wait** (it would break byte-identity for `/api/reason`).
2. **Clean file boundary — battery-verified BEFORE shipping, not after** (D6; the S10-ENV-1 lesson). Adapt the `/sage-compass` boundary test per fork 2 and run it green (`npx tsx …`) **before** the deploy.
3. **Deploy gate.** Before deploy verify `/api/reason` + the frozen capture set are byte-unchanged — and note `stoic-brain` is now explicitly in the grep, because this is the one build where it is at risk:
   ```
   git status --short | grep -iE "api/reason|translation-sandwich|/substrate/|trust-core|kathekon-engagement|false-hold|harness/gate1|layer1-extractor|layer2-mechanisms|sage-reflect|stoic-brain"
   ```
   → **NONE**; and `npm run build` ✓ with `/logos` registered. **No migration step this session** (fork 1) — so this is a code-only deploy, and there is no migration-before-code ordering hazard.
4. **Data rights — N/A if fork 1 holds.** A static page persists nothing, so there is no `user-data-gathering` / export / delete wiring and **no Critical 0d-ii edit this session.** *(If a founder decision reverses fork 1 and adds a table, all three data-rights surfaces + a founder-walked migration come back, and the tier rises.)*
5. **R20a perimeter — match precedent, do NOT expand.** Carry `SupportFooter` in the layout (R20a §4 crisis exit) and stay OUTSIDE the distress perimeter. This page is expository, not a place where a practitioner discloses anything, so the perimeter question is at its least sharp in the whole family. **Surface it; do not decide it.**
6. **The agent instrument is OUT of scope.** Do not touch the enforce predicate, the proximity engine, or any flag. **S11 stays DEFERRED.**

## Procedure

1. **Reads** — the standing opener; plan §3(#12)/§4/§5/§8; mentor D6; the survey's principle-12 section (in full — the content *is* the deliverable here, more than in any prior tool). Templates: **`src/app/methodology/page.tsx`** (the static teaching-page precedent, and the proof that a read-only `stoic-brain` import ships) and **`/sage-compass`** (`api/mentor/sage-compass/__tests__/human-practitioner-boundary.test.ts` — the boundary test to adapt per fork 2). Confirm whether the observation window is still running.
2. **Design** — settle the three forks (static-only; import-but-never-edit `stoic-brain`; prose-only calling linkage). **Then draft the teaching content and show it before building the page.** This build is unusual: its substance is *prose*, and prose that misstates the doctrine is the real failure mode — a page that is technically clean and philosophically wrong has failed. The three claims to land, in the mentor's own order: *there is a rational order to things; human beings participate in it through reason; virtue is the full exercise of that capacity — and everything else follows from this.*
3. **Build** — the content module (new file, engine-free) → the page + layout (`SupportFooter`) → make the coherence visible (show how the existing tools descend from the doctrine, with links: premeditatio, the reserve clause, the view from above, morning preparation, the circle extension, the sage compass, the passion log) → `/welcome` link (consider promoting it as an entry point) → the adapted boundary test.
4. **Verify** — boundary test green · `tsc --noEmit` 0 · `npm run build` ✓ (`/logos` registered) · byte-identity git-guard **NONE** (incl. `stoic-brain`) · lint. Then an **adversarial review Workflow** (dimensions → find → adversarially verify each finding). Include dedicated **measurement-neutrality** and **doctrinal-fidelity** dimensions — the latter must check the prose against the mentor's verbatim text and against the Stoic sources, because on this build **the content is the artefact**. *(Reference: `/sage-compass` ran 7 dims; its review confirmed 4 real findings, all nit/low. Note the account hit a weekly usage limit mid-review — if that recurs, verify the errored findings first-hand rather than discarding them.)*
5. **Founder-walked deploy** — byte-identity check → push (**stage the build files explicitly; do NOT `git add .`** — the working tree carries unrelated pre-existing changes) → Vercel green → live smoke (`/logos` renders; the tool links resolve; the `/welcome` link works). **Records + close** — decision-log entry + session close + refresh the `CLAUDE.md` human-practitioner-tools family bullet with `/logos` + name the next successor.

## What this session does NOT do

It does not touch the instrument, the enforce predicate, the proximity engine, or any flag. **It does not edit `stoic-brain.ts`** (that single edit would reclassify the whole item to must-wait). It does not build a table, a route, or a gate unless a founder decision explicitly reverses fork 1. It does not couple to the calling stage in code. And it does not do the D2 justice-arm narrowing — that is the next session (below).

## Rollback

`git revert` the PR. It is a standalone, additive, static human surface with **no table to drop and no migration to reverse** — the cleanest rollback of the family. `/api/reason` + the frozen capture set are untouched, so the observation record is unaffected either way.

## Forecast

Success = `/logos` live as the **entry point** — the page that makes the coherence of everything else visible, so a new practitioner meets the tools as expressions of a unified understanding rather than as a bag of techniques. **This completes Bucket A: every window-safe human-practitioner tool is then shipped** (#7-human, #10-human, #9+#13, #8, #6+#15, #14, #12).

**Then, before the return-with-record session: the D2 justice-arm narrowing** (`code-elevated`, report-side — require an *evaluated* obligation for the justice-surface arm to fire, not mere `dikaiosyne`-tagging; it re-scores the accumulated raw records against the refined predicate, needs **no** window restart, and must be **battery-verified before** the return session so the record is scored against the predicate stage-1 will bind). **Then the return-with-record session** (run the report; assess the four-part readiness standard with the D5 distribution notation; if met, re-confirm the assent and hand off to the S11 flip).

The agent halves (#7/#10) and the kathekon pair (#4/#11) wait for the flip. *Hold the window clean. Return with the record. The assent will be examined then.*

End of prompt.
