# Brand assets audit + website page-mapping proposal

**Date:** 2026-07-23 (revised same day — see §0 changelog). **Tier:** `governance` (documentation + analysis only — no website code changed this session; the recommendations below are a proposal for a future `code-elevated` build session, not executed here).
**Trigger:** the founder placed `website/Brand/Brand_Guidelines.docx` and 26 new image files in `website/public/images/` and asked for (1) a governing-docs note of their existence, (2) a review mapping the guideline + images against the live site, reporting recommended changes, (3, this revision) corrections to two mappings, a new page-glossary proposal, and an extension into journal + scenario pages.
**Status:** Adopted (as a governance record of what exists + what is recommended). The recommendations themselves are **not yet built** — this is the proposal a future session executes from.

---

## 0. Revision changelog (same-day correction, founder-directed)

The first version of this doc got one structural relationship wrong and one passion mapping wrong. Both are corrected below, not silently — this section names exactly what changed and why:

1. **The Five Stages of Practice are NOT the same thing as the Katorthoma Proximity Levels.** The first version proposed pairing the five Stage images (Storm/Crossroads/Worn Path/Clear Summit/Inner Fire) directly onto the home page's per-action proximity-level cards, because `brand/proximity cards and colours.rtf` pairs them by colour. **The founder corrected this:** the two ideas *share colours* but are otherwise separate — proximity levels are a **per-action** score (how this one evaluated action reads), while the Five Stages describe **the practitioner's overall condition across time** (a longitudinal, felt sense of where someone stands, not tied to any single evaluation). §2 below is rewritten to reflect this — the colours are shared and should be reused, but the Stage *images and titles* get their own home (the dashboard, not the per-action score sections).
2. **`onion.PNG` maps to `penthos` (Grief), not `achos` (Anxiety).** The first version guessed `achos` from ambiguous language in an early RTF draft. The founder has now stated the correct mapping directly. §3 is corrected.
3. **`achos` (Anxiety/Distress) will get its own commissioned image — a "millstone."** Not built yet. §3 now specifies a placeholder treatment so `/passion-log` and the other passion-rendering pages aren't left with a silent gap while the founder waits on the designer.
4. **New: an image-glossary page.** §5 (new).
5. **New: journal pages and ethical-scenario pages** also render specific sub-species passions and should get the same icon treatment as `/score` and `/passion-log`. §4 is extended to cover these, grounded in a direct read of `journal-content.ts` and the four `score-*`/`scenarios` sibling pages.
6. **New finding, surfaced in the course of this correction:** the site currently has **three different, independently hardcoded colour palettes** for the same five-level proximity taxonomy (`page.tsx`/`score.tsx`/`community.tsx` share one; `dashboard.tsx`'s "Proximity Distribution" section uses a second, unrelated one; the new brand RTF is a third). This is worth fixing regardless of the Five Stages work — see §2.4 (now RESOLVED — see §0 item 7).

---

## 1. What exists now

### 1.1 The governing brand document
`website/Brand/Brand_Guidelines.docx` (8.3MB, added 2026-07-23) — the canonical, current brand guideline. Sections: Brand Overview, Logo Usage (primary/secondary logo + five virtue/persona logos + Zeus + Human/Robot/Developer personas), **The Five Stages of Practice** (a non-linear developmental arc), **Mirror** (the evaluative-honesty principle), **Passion Logos** (19 named object-to-passion mappings), Colour Palette, Typography, Imagery & Photography Style, Iconography, Voice & Tone.

An older, partial staging area also exists at the repo-root `brand/` directory (superseded by `website/Brand/`, but its two RTF files carry information the current docx doesn't fully restate, and are cited directly rather than re-derived): `brand/passion logos.rtf` (per-image reasoning) and `brand/proximity cards and colours.rtf` (the exact colour values pairing the Five Stages images to specific proximity/grade names).

### 1.2 The new image files
`website/public/images/` — 26 new PNG files (768×1098, matching the site's existing image dimensions), added between 2026-06-09 and 2026-07-23, alongside the pre-existing, already-wired assets. Grouped in §2–§4 below.

---

## 2. Group A — Proximity colours + the Five Stages of Practice (RESOLVED 2026-07-24, founder decision)

### 2.1 Colour palette — ADOPTED, resolves §2.4's three-palette finding
**Founder decision, verbatim source values confirmed:**

| Stage | Proximity level | Colour | Founder's own description |
|---|---|---|---|
| The Storm | Reflexive | `#4A5568` | "A slate grey with blue undertone" |
| The Worn Path | Habitual | `#8B6F47` | "A warm earthen brown" |
| The Crossroads | Deliberate | `#B2AC88` | "a warm sand olive" |
| The Clear Summit | Principled | `#5B8C6D` | "A deep clear green" |
| The Inner Fire | Sage-Like | `#C9A84C` | "A warm gold. Not flashy or metallic." |

**This is now the single canonical proximity-colour palette, replacing both prior ad hoc schemes** (`page.tsx`/`score/page.tsx`/`community/page.tsx`'s set, and `dashboard.tsx`'s separate "Proximity Distribution" set — §2.4). Per §3.1's centralization point, this belongs in one shared constant (`stoic-brain.ts`, alongside `VIRTUE_DISPLAY`), consumed everywhere a proximity level renders — every page in the §2.4 table, plus the score/scenario family, plus milestones (§2.3).

### 2.2 The Five Stages of Practice — confirmed mechanism: five dedicated pages, each unlocked by a milestone crossing
**Founder decision (final, sharpened from the prior "crosses into a stage" wording):** "the background colour is just for the page that reveals the stage image, we will create one page for each stage and reveal it when milestone are crossed."

This settles the design cleanly — simpler than either of the two structures the earlier versions of this doc entertained (per-action pairing on the score sections; a persistent dashboard-section indicator). The actual shape:

- **Five new, dedicated pages** — one per stage (The Storm / The Crossroads / The Worn Path / The Clear Summit / The Inner Fire). Each page's background is tinted to that stage's §2.1 colour and displays that stage's image. No existing route hosts this; five new routes are needed (naming not specified here — a nested family, e.g. `/stages/the-storm`, is one reasonable option, matching the site's existing flat-route convention loosely enough to keep them discoverable as a set; the exact naming is the build session's call).
- **"Revealed" = milestone-gated.** This confirms the connection to `website/src/lib/milestones.ts` I'd flagged as prior art in the earlier version of this doc, and resolves the ambiguity I'd raised there (whether to reuse the existing achievement-only milestone framework or build something separate) — **the founder's own answer is to use milestones directly.** The existing `category: 'proximity'` family (`first_deliberate`, `first_principled`, `consistent_deliberate`) already proves "reaching a proximity level" is a first-class, triggerable event via `checkNewMilestones()` — this needs **extending, not replacing**, with one milestone per stage (five total, so Reflexive and Habitual need new entries — they don't exist in the current celebratory-only set, which only names forward achievements today).
- **A framing note carried over, still worth attention at build time:** the existing milestone copy is written in an achievement voice ("Achieved a Deliberate proximity evaluation"). The Storm and The Worn Path describe difficult states ("Everything is chaotic and uncontrolled" / "following someone else's footsteps, not choosing your own direction") — their milestone descriptions should be worded as honest recognition, not failure, consistent with both the guideline's own "what it feels like to be there, not what has been achieved" framing and the manifest's R9 (no outcome promises) / R6c (qualitative markers only, non-punitive) conventions already governing this file's existing entries.

**Two implementation questions this proposal surfaces but does not resolve (genuinely the build session's to decide, not guessed at here):**
1. **Single evaluation or an aggregate/sustained reading triggers the reveal?** The existing `first_deliberate`/`first_principled` pattern fires on a **single** evaluation reaching that level; `consistent_deliberate` requires 5-in-a-row. The founder's phrasing ("milestones are crossed") reads most naturally as reusing the simpler single-evaluation pattern — cheaper to build, and consistent with existing precedent — but this is worth an explicit confirmation before the build session commits to it over a sustained/aggregate rule.
2. **Page access before the milestone is earned** — locked/redirected, or visitable-but-not-yet-triggering-anything? Not specified by the founder; flagged as a build-scoping decision, not assumed.

### 2.3 Milestone-icon note (small, adjacent finding, now more directly relevant)
Several existing `MILESTONE_DEFINITIONS` entries in `milestones.ts` currently use generic icons (`sagelogo.PNG`, `owllogo.PNG`, `lotuslogo.PNG.png`) for proximity- and passion-related milestones — e.g. `passion_reduction`'s own description is literally titled **"Quieting the Storm,"** unknowingly anticipating "The Storm" stage name. Now that §2.2 confirms the five new stage milestones sit in this same file, revisit whether the *existing* proximity milestones (`first_deliberate`→The Crossroads, `first_principled`→The Clear Summit) should also switch their icons to the matching Stage image for full consistency — they'd otherwise sit right next to the five new stage-reveal milestones using different, generic icons. Not required for the core build, named so it isn't missed.

### 2.4 The pre-existing colour drift this resolves
Confirmed by direct grep, not assumed — now superseded by §2.1's adopted palette:

| Where | Reflexive | Habitual | Deliberate | Principled | Sage-like |
|---|---|---|---|---|---|
| `page.tsx` / `score/page.tsx` / `community/page.tsx` | `#9e3a3a` | `#c4843a` | `#B2AC88` | `#7d9468` | `#4d6040` |
| `dashboard/page.tsx` ("Proximity Distribution") | `#DC2626` | `#B45309` | `#CA8A04` | `#65A30D` | `#059669` |
| **Adopted (§2.1)** | `#4A5568` | `#8B6F47` | `#B2AC88` | `#5B8C6D` | `#C9A84C` |

Only `deliberate` happens to agree across all three (`#B2AC88`, coincidentally). This drift predates the new brand work but is worth fixing in the same pass: recommend centralizing proximity colours (and the `ROOT_PASSION_ENGLISH` labels — see §4, also independently duplicated in `score/page.tsx` and `scenarios/page.tsx`) into `stoic-brain.ts`, which already exports the equivalent shared constants for virtues (`VIRTUE_DISPLAY`) and oikeiosis stages (`OIKEIOSIS_STAGE_ENGLISH`) — the established pattern for this kind of shared UI metadata, not three (or more) independent copies that can silently drift further apart.

---

## 3. Group B — the Passion Logos → `/passion-log` and every other passion-rendering page

**Files:** `staff raised.PNG`, `grapes.PNG`, `fig.PNG`, `olives.PNG`, `owl coin.PNG`, `limestone fragment.PNG`, `wax tablets.PNG`, `cracked pottery.PNG`, `lentil bowl.PNG`, `sandal.PNG`, `tunic.PNG`, `pallium cloak.PNG`, `spilled grain sack.PNG`, `bread.PNG`, `wax scribbled.PNG`, `milk jug.PNG`, `cheese.PNG`, `fish.PNG`, `onion.PNG` (19 images).

**The complete, corrected mapping** (cross-verified against `stoic-brain/passions.json`'s canonical `id`/root-family structure):

| Image | Passion (id) | Name (site's label) | Root family |
|---|---|---|---|
| staff raised.PNG | `orge` | Anger | epithumia (craving) |
| grapes.PNG | `eros` | Erotic Passion | epithumia |
| fig.PNG | `pothos` | Longing | epithumia |
| olives.PNG | `philedonia` | Love of Pleasure | epithumia |
| owl coin.PNG | `philoplousia` | Love of Wealth | epithumia |
| limestone fragment.PNG | `philodoxia` | Love of Honour | epithumia |
| wax tablets.PNG | `kelesis` | Enchantment | hedone (pleasure) |
| cracked pottery.PNG | `epichairekakia` | Malicious Joy | hedone |
| lentil bowl.PNG | `terpsis` | Excessive Amusement | hedone |
| sandal.PNG | `deima` | Terror | phobos (fear) |
| tunic.PNG | `oknos` | Timidity/Hesitation | phobos |
| pallium cloak.PNG | `aischyne` | Shame | phobos |
| spilled grain sack.PNG | `thambos` | Dread/Shock | phobos |
| bread.PNG | `thorybos` | Panic/Inner Turmoil | phobos |
| **wax scribbled.PNG** | **`agonia`** | Agonia/Anxiety | phobos — **confirmed by founder** |
| milk jug.PNG | `eleos` | Pity | lupe (distress) |
| cheese.PNG | `phthonos` | Envy | lupe |
| fish.PNG | `zelotypia` | Jealousy | lupe |
| **onion.PNG** | **`penthos`** | Grief | lupe — **corrected by founder (was wrongly guessed as `achos` in the first version of this doc)** |

**`achos` (Anxiety/Distress, lupe root) — no image yet; a "millstone" is being commissioned from the designer.** Until it arrives, wire the lookup table with an explicit placeholder value for `achos` rather than leaving the key absent — recommend a plain, clearly-marked placeholder (e.g., a neutral grey circle/outline glyph consistent with the site's existing unicode-icon fallback pattern already used for proximity levels on `score/page.tsx`, or a simple "image pending" SVG placeholder styled to match the "analogue pencil" imagery guidance) so the UI degrades honestly instead of showing a broken image or silently omitting the one passion with no icon. **When the millstone image arrives, swap the placeholder path for the real one in the same shared lookup table — no other change should be needed if the table is built as a single `passionId → imagePath` map (see below).**

With `achos` accounted for by a placeholder, **all 20 canonical sub-species passions now have a defined image path** (19 real, 1 placeholder-pending) — fully satisfying the "use all of them" instruction once the millstone lands.

### 3.1 Where this renders live today — more pages than the first version of this doc found
A direct grep this session found **five** live pages already rendering individual sub-species passions by `id`/`sub_species`, not just `/passion-log`:

- **`website/src/app/passion-log/page.tsx`** — the historical log + trends (as covered in the first version of this doc).
- **`website/src/app/score/page.tsx`** — the single-action result view (`passion_diagnosis.passions_detected`, each with `.id`/`.name`/`.root_passion`) — arguably the *strongest* placement, since a practitioner sees this immediately after evaluating a real action of their own.
- **`website/src/app/scenarios/page.tsx`** — the ethical-scenario evaluator, renders `passions_detected[].sub_species` directly.
- **`website/src/app/score-document/page.tsx`**, **`website/src/app/score-social/page.tsx`**, **`website/src/app/score-policy/page.tsx`** — the sibling scoring tools (documents, social posts, policies), all confirmed rendering the same `passions_detected`/`sub_species` shape.

All six pages should draw from **one shared `passionId → imagePath` lookup** (proposed home: `stoic-brain.ts`, alongside `VIRTUE_DISPLAY`/`OIKEIOSIS_STAGE_ENGLISH` — see §2.1's centralization point, which applies here too, since `ROOT_PASSION_ENGLISH` is *already* independently duplicated in `score/page.tsx` and `scenarios/page.tsx`) rather than six separate hardcoded copies.

### 3.2 Journal pages that address particular passions by name
`website/src/lib/journal-content.ts`, Phase 5 ("When Judgement Goes Wrong," days 29–37, sourced from `passions.json`), rendered live on **`website/src/app/journal/page.tsx`**. Four specific days each name and enumerate one full root passion's sub-species in their teaching text:

| Day | Title | Root passion | Sub-species named in the teaching text |
|---|---|---|---|
| 30 | Craving — Reaching for Apparent Good | epithumia | anger, erotic obsession, longing, love of pleasure, love of wealth, love of honour (all 6) |
| 31 | Irrational Pleasure — Elation at Apparent Good | hedone | enchantment, malicious joy, excessive amusement (all 3) |
| 32 | Fear — Shrinking from Apparent Evil | phobos | terror, timidity, shame, dread, panic, agony (all 6) |
| 33 | Distress — Contraction at Apparent Evil | lupe | pity, envy, jealousy, grief, anxiety (all 5) |

**Recommendation:** on each of these four days, show the small row/grid of the relevant sub-species images alongside the teaching text (6, 3, 6, and 5 images respectively) — a direct, well-grounded illustration of content that already names each passion explicitly, not a stretch. Day 29 (the general introduction) and days 34+ (correction/synthesis) don't enumerate specific sub-species by name and are not recommended targets.

---

## 4. Group C — single-purpose images (unchanged from the first version)

| File | Guideline meaning | Recommended location | Confidence |
|---|---|---|---|
| `agent.PNG` | "Robot: Represents agent users" | `page.tsx`'s home-page "Who is this for?" section — replaces the current duplicated use of `Developer.PNG` for the "AI Agents" card (`page.tsx:104`/`109` both currently point at `Developer.PNG`). | High |
| `mirror.PNG` | "Represents the principle that the evaluation scores what the reasoning is, not what the person is worth... an honest self-reflection." | `website/src/app/methodology/page.tsx:158` — the existing "Stoic virtue scoring is explicitly not: A measure of your worth as a person" list item. | High |

---

## 5. New — an image-glossary page

The founder asked for a dedicated glossary page bringing the imagery together as a single reference. No such route exists today (confirmed against the full `website/src/app/` directory listing). Proposed as a new page (e.g. `/glossary` or `/image-glossary`) containing:

- The five virtue/persona logos (Lion/Scales/Lotus/Owl/Zeus/Human/Robot/Developer) with their one-line meanings, verbatim from the guideline.
- The Five Stages of Practice, with their images, titles, and the guideline's own "not a fixed ladder" framing stated plainly. Note this is a genuinely different presentation from §2.2's five dedicated, milestone-gated stage pages — the glossary shows all five at once, unlocked or not, as reference material; the five stage pages are the individually-earned, background-tinted reveals. Both are worth having; they serve different purposes and shouldn't be conflated into one build.
- Mirror, with its evaluative-honesty framing.
- All 20 passion logos (19 real + the `achos` placeholder), grouped by root family (epithumia/hedone/phobos/lupe) to mirror `passions.json`'s own structure, each with its name and one-line description.

**This page should draw from the same shared lookup tables §2.1/§3.1 recommend centralizing** (proximity colours, `ROOT_PASSION_ENGLISH`, the passion-image map, `VIRTUE_DISPLAY`) rather than hardcoding a seventh independent copy of data that already exists in five or six places — it is, in effect, the single page that most needs those tables to already be correct and shared, since it displays literally everything at once.

---

## 6. Non-recommendations (unchanged)

- No changes to the already-wired assets (`sagelogo`/`sagelogosmall`/four virtue logos/`Human`/`LOGOS`/`Zeus`/`Background`).
- No attempt to touch `Developer.PNG`'s correct use for the actual "Developers" card.
- The colour-palette/typography/iconography/voice-tone sections of the guideline beyond what's actioned above are not in scope for this pass.

---

## Cross-references
- `website/Brand/Brand_Guidelines.docx` (current, authoritative)
- `brand/passion logos.rtf`, `brand/proximity cards and colours.rtf` (historical staging area; still informative, cited directly above)
- `stoic-brain/passions.json`, `stoic-brain/progress.json` (canonical taxonomies cross-checked against every mapping)
- `website/src/app/passion-log/page.tsx`, `page.tsx`, `methodology/page.tsx`, `score/page.tsx`, `scenarios/page.tsx`, `score-document/page.tsx`, `score-social/page.tsx`, `score-policy/page.tsx`, `dashboard/page.tsx`, `journal/page.tsx`, `website/src/lib/journal-content.ts`, `website/src/lib/stoic-brain.ts` (the live pages/files this proposal targets)
- `/CLAUDE.md` (pointer note, this session)

*End of audit. Still a proposal, not a build. §2's colour-palette and Five-Stages-mechanism questions are now RESOLVED (2026-07-24, founder decision) — five dedicated, milestone-gated, background-tinted pages, one per stage. What remains open before a build session: (1) single-evaluation vs. sustained/aggregate trigger for each stage milestone — §2.2; (2) locked vs. visitable-but-inert page access before a stage's milestone is earned — §2.2; (3) whether the existing `first_deliberate`/`first_principled` milestone icons should switch to the matching Stage image — §2.3; (4) confirmation of the placeholder treatment for `achos` pending the millstone image — §3.*
