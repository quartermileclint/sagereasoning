# A18e — Cognitive-Accessibility Design Review (mentor + assessment surfaces)

**Date:** 2026-06-07 · **Stream:** founder · **Tier:** `code-standard` / design · **Risk:** Standard (review only; any fixes are scoped separately and each elected by the founder).
**Rules in scope:** A3 (cognitive-accessibility cross-cut), R8c (English-only on user-facing surfaces), R3 (visible disclaimer on evaluative output), R6c/R6d (qualitative, non-punitive results), WCAG 2.1 AA (1.4.1 use of colour; 1.4.3 contrast; 4.1.3 status messages; 3.3 input assistance).
**Method:** Read the live assessment + mentor pages and ran cross-cutting scans for ARIA/live-regions, error patterns, contrast colours, and jargon leaks. Applies the `design:accessibility-review` (WCAG-audit) methodology per PR15.
**What this is:** the design pass A18e calls for. It does **not** change any code. It tells you what's strong, what's weak, how badly each weakness bites and who it affects, and the simplest viable fix for each — so you can elect which to action.

---

## The headline

The **flagship surfaces (Evaluate an Action, Baseline, Dashboard) are in good shape** for cognitive accessibility: plain-English labels, worked examples in every input, "no right or wrong answers," a "read this like a mirror, not a verdict" framing, and progress/time cues. That is genuinely above-average work.

The weaknesses are **consistency and assistive-technology plumbing**, and they cluster into a small number of patterns that repeat across many pages. Because they repeat, a few targeted fixes clean up most of the surface area. Nothing here is a launch-blocker — but two of the findings touch your own stated rules (R3 and R8c), and the `/accessibility` page already promises plain language and admits gaps "particularly on the more interactive surfaces," so closing these lets that page's claims stand up honestly.

---

## Findings at a glance

| # | Finding | Severity | Rule / WCAG | Surfaces affected |
|---|---|---|---|---|
| F1 | Information text fails colour-contrast minimums | **Significant** | WCAG 1.4.3; R3 (disclaimer legibility) | All assessment + mentor pages |
| F2 | Loading / results / errors are not announced to screen readers | **Significant** | WCAG 4.1.3 | All assessment + mentor pages |
| F3 | Errors use a jarring browser pop-up on some pages, an inline box on others | **Significant** | WCAG 3.3.1; A3 (consistency) | score, journal (pop-up); baseline (box) |
| F4 | Greek/Latin jargon leaks to users on the secondary surfaces | **Significant** | R8c; A3 | premeditatio, oikeiosis, scenarios |
| F5 | Some error messages show developer/technical text to the user | **Significant** | A3; WCAG 3.3.1 | mentor-baseline |
| F6 | Answer selection is shown by colour/border alone | **Moderate** | WCAG 1.4.1; A3 | baseline (questions + Q6) |
| F7 | The required disclaimer is rendered near-invisible | **Moderate** | R3 | score, baseline, dashboard |
| F8 | Long AI waits give no reassurance or expected duration | **Minor** | A3 | all generative surfaces |
| F9 | Progress bars carry no text alternative | **Minor** | WCAG 1.1.1 | baseline |
| F10 | `private-mentor` uses its own inline styles, not the shared design system | **Cosmetic / note** | — | private-mentor (founder-only) |

Severity scale (per the hold-point vocabulary): **blocker** (stops a person using it) · **significant** (a real barrier, or breaks a stated rule) · **minor** (friction) · **cosmetic** (polish).

---

## The findings in detail

### F1 — Text contrast is below the WCAG AA minimum *(Significant)*

Your sage palette, measured against a white/near-white background:

- `text-sage-400` (#9CAF88) ≈ **2.4 : 1**
- `text-sage-500` (#7d9468) ≈ **3.3 : 1**
- `text-sage-600` (#647a50) ≈ **4.7 : 1** ✅

WCAG AA needs **4.5 : 1** for normal text. So `sage-400` fails badly and `sage-500` fails for small text (it only passes for large/bold). Both are used heavily for helper text, dates, captions — and, most importantly, for the **R3 disclaimer footnotes**, which are `text-sage-400 italic`. People with low vision, older eyes, or a sunlit screen can't reliably read them.

**Who it affects:** low-vision users, anyone outdoors or on a dim screen — a large slice of real users.
**Simplest viable fix:** promote information-bearing small text from `sage-400`/`sage-500` to **`sage-600`** (the first shade that passes). Colour-only change, no layout or logic touched. This is the single highest-return, lowest-risk fix and it also resolves F7.

### F2 — Nothing is announced to assistive technology *(Significant)*

Across every assessment and mentor page there are **zero** live regions (`role="status"`, `role="alert"`, or `aria-live`). So a screen-reader user who submits an action hears nothing when it starts generating, nothing when the result arrives, and nothing when it fails — the page silently changes under them.

**Who it affects:** blind and low-vision users; also helps anyone using voice control.
**Simplest viable fix:** wrap the existing loading text and error boxes in a live region (`role="status"` for loading/results, `role="alert"` for errors). Additive; no visual change.

### F3 — Error handling is inconsistent and, on two pages, jarring *(Significant)*

`score` and `journal` report failures with a native browser `alert()` pop-up — an abrupt grey box that interrupts everything, doesn't match the site's calm tone, and is the opposite of the "mirror, not verdict" feel. `baseline` does it well with a gentle inline red box. Same product, three different behaviours.

**Who it affects:** everyone, but especially people who find sudden modal interruptions disorienting (anxiety, cognitive load, screen-reader users).
**Simplest viable fix:** replace the two `alert()` calls with the same inline error-box pattern baseline already uses (and give it the `role="alert"` from F2). Small Elevated change (touches existing behaviour on live pages).

### F4 — Greek/Latin jargon leaks to users on the secondary surfaces *(Significant — it breaks R8c)*

R8c says user-facing pages are English-only, with the Greek kept to a glossary. The flagship pages obey this (they map `kathekon` → "Appropriate Action", etc.). The **secondary** pages don't:

- `premeditatio`: "Loading premeditatio…"
- `oikeiosis`: "Loading oikeiosis tracker…"
- `scenarios`: "Kathekon Quality", and it prints the raw value (`Quality: contrary`) instead of the friendly label

**Who it affects:** every newcomer without Stoic training — exactly the audience the `/accessibility` page promises not to gate behind philosophy.
**Simplest viable fix:** swap to plain English ("Loading…", "Appropriate-action quality", map the raw value to its English label as `score` already does). Content-only.

### F5 — Some error messages are written for a developer, not a user *(Significant)*

`mentor-baseline` can surface: *"No questions were returned. Please try again, or check the endpoint response shape,"* *"Question generation failed: …,"* and *"Network error: [object Object]."* These tell the user nothing useful and quietly imply something is broken with them.

**Who it affects:** anyone who hits an error — disproportionately stressful for less-technical and lower-confidence users.
**Simplest viable fix:** plain, kind, actionable copy ("Something went wrong generating your questions. Please try again in a moment."). Content-only.

### F6 — Which answer you picked is shown by colour alone *(Moderate)*

On the baseline questions (and Q6), the selected option is indicated only by a subtle border/background tint. There's no tick, no `aria-pressed`, no radio-group semantics. WCAG 1.4.1 forbids relying on colour alone; cognitively, people lose track of what they chose; a screen reader never announces the selection.

**Who it affects:** colour-blind users, screen-reader users, and anyone who second-guesses "did that register?"
**Simplest viable fix:** add a visible selected marker (a tick or filled dot) plus `aria-pressed`/radio semantics. Slightly more involved than F1–F5, so a good candidate for its own small pass.

### F7 — The required disclaimer is near-invisible *(Moderate — touches R3)*

R3 requires a **visible** disclaimer on evaluative output. It is present everywhere it should be — but rendered tiny, italic, and in `sage-400`, i.e. the least legible combination on the page. Fixing F1's contrast largely fixes this; you may also want it non-italic.

**Simplest viable fix:** folded into F1 (contrast). Optionally drop the italic on the disclaimer line.

### F8 — Long AI waits offer no reassurance *(Minor)*

Generative steps can take several seconds, shown only by a pulsing logo or "Generating…". No "this can take a few seconds" cue. Uncertainty raises cognitive load and makes people re-click.
**Simplest viable fix:** one line of reassuring copy in each loading state (and the F2 live region announces it). Optional.

### F9 — Progress bars have no text alternative *(Minor)*

The baseline progress bar is purely visual. The "Question 3 of 5" text beside it mostly covers this, so impact is low.
**Simplest viable fix:** add `role="progressbar"` with value attributes. Optional polish.

### F10 — `private-mentor` is styled outside the design system *(Cosmetic / note)*

It uses an inline JavaScript styles object rather than the shared Tailwind classes, which makes it harder to keep consistent and accessible over time. It's founder-only today, so low urgency — flagged so it isn't forgotten when the practitioner mentor surfaces are hardened.

---

## Recommended packaging (you elect)

The fixes group naturally into three bundles by effort and risk. All are reversible (each edited file backed up first; `/api/reason` untouched throughout).

**Bundle A — Content & contrast (cheapest, highest return, lowest risk).** F1 + F4 + F5 + F7. Pure colour/text edits, Standard risk, no behaviour or logic change. Resolves both rule-touching findings (R3 legibility, R8c jargon) and the biggest legibility barrier in one pass. *This is my recommendation for this session.*

**Bundle B — Assistive-tech plumbing (small, slightly higher touch).** F2 + F3. Adds live-region announcements and replaces the two `alert()` pop-ups with the inline error box. Mostly additive; the `alert()` swap is Elevated (changes behaviour on live pages). Good as a stretch this session or its own short pass.

**Bundle C — Selection semantics (its own small pass).** F6 (+ optional F8/F9 polish). A focused change to the baseline answer controls. Best kept separate so it gets its own verification.

Doing **Bundle A alone** already lets the `/accessibility` page's "plain language / known gaps on interactive surfaces" claims stand more honestly, and clears the two findings that touch your own rules. Bundles B and C can each be a later short session.

---

## Note on A18e status

A18e is defined as a *design pass*. Delivering this review satisfies that intent: the assessment exists, gaps are documented with severity, and the simplest viable changes are specified. A18e can move to **Verified** on your acceptance of this review; the elected fixes are tracked as their own small build items (Bundle A this session if you choose, B and C as follow-ups). Whatever you don't elect stays documented here so nothing is lost.

---

## Session outcome (2026-06-07)

Founder elected **all three bundles**. Implemented and typecheck-clean (exit 0):

- **F1 / F7 (contrast):** information text bumped from the failing `sage-300/400/500` to `sage-600` across 11 surfaces (baseline, score, dashboard, scenarios, premeditatio, oikeiosis, passion-log, score-document, score-policy, score-social, journal). Placeholders and hover/focus states left unchanged. This also makes the R3 disclaimers legible.
- **F2 (announcements):** `role="status"` / `role="alert"` live regions added for loading, results, and errors (was zero everywhere).
- **F3 (errors):** the two native `alert()` pop-ups (score, journal) replaced with the gentle inline, announced error box.
- **F4 (jargon):** "Loading premeditatio…/oikeiosis tracker…" → "Loading…"; scenarios "Kathekon Quality" → "Appropriate-Action Quality" (+ friendly value).
- **F5 (error copy):** five developer-facing strings in mentor-baseline rewritten in plain language.
- **F6 (selection):** baseline answer options now show a visible tick + `aria-pressed` (no longer colour-only).
- **F9:** baseline progress bar given `role="progressbar"`.

**Deliberately deferred for a founder decision (not done unilaterally):**

- The two **practice-name page titles** — "Premeditatio Malorum" and "Oikeiosis Extension" — are also Greek/Latin under R8c. Renaming them touches the nav, footer, and welcome-page links too, and is a product-voice/identity choice, so it's flagged for you rather than changed here. A plain-English option (e.g. "Preparing for Adversity", "Widening Your Circle of Concern"), with the original term kept on a glossary page, would close R8c on these.
- **F10** (`private-mentor` uses its own inline styles, not the shared design system) — left as a note; founder-only surface, low urgency.
- **F8** (loading reassurance) — partly delivered via the F2 status lines.

Production unchanged until the founder commits + deploys. All edited files backed up to `archive/*.backup-pre-A18e-2026-06-07`.
