# Navigation audit — header + footer gaps

**Date:** 2026-07-24. **Tier:** `governance` (documentation + analysis only — no website code changed this session; the recommendations below are a proposal for a future `code-elevated` build session, not executed here).
**Trigger:** reviewing `website/src/components/NavBar.tsx` (the header) and `website/src/app/layout.tsx`'s inline site footer against the full `website/src/app/` route listing, prompted by the founder noticing `/passion-log` is missing from both.
**Status:** Adopted (as a governance record of what exists + what is recommended). The recommendations themselves are **not yet built**.

---

## 0. Method

Two navigation surfaces exist on this site, not one: `website/src/components/NavBar.tsx` (the header, incl. its "Tools" and "Hubs" dropdowns) and an inline `<footer>` in `website/src/app/layout.tsx` (three columns: Tools / Philosophy / Legal — a separate component from `SupportFooter.tsx`, which is the R20a crisis-resource strip, not a navigation footer at all — the two are easy to conflate by name and are unrelated).

Every route under `website/src/app/` was checked against both surfaces, and — where a route was found linked in neither — a repo-wide grep confirmed whether it was reachable from *any* other page (an internal secondary link, e.g. a hub page linking out to a sub-tool) before calling it orphaned. This matters: a page absent from the header/footer isn't necessarily unreachable, so each finding below states its actual reachability, not just its header/footer status.

---

## 1. Genuinely orphaned — no header link, no footer link, no internal link from anywhere else in the codebase

Confirmed by a repo-wide `grep` for `href="/<route>"`, not assumed from the header/footer check alone.

### 1.1 The passion-tracking page (the founder's original example)
- **`/passion-log`** — the passion-tracking log with self-diagnosis, LLM classification, trends, and catch-rate views. No inbound link anywhere.

### 1.2 The "Remaining Principles" human practice tools — a whole feature family, not a one-off gap
All six of the Remaining Principles tools (per CLAUDE.md's own "Live in production" list) are equally missing:
- **`/view-from-above`** — the grief/catastrophising calibration tool
- **`/morning`** — the morning-preparation tool
- **`/hupexairesis`** — the reserve-clause tool
- **`/premeditatio`** — the premeditatio tool
- **`/sage-compass`** — the decision-support "compass bearing" tool
- **`/oikeiosis`** — the circle-of-concern reflection + circle-extension practice

Together with `/passion-log`, that's **seven** live, built, working pages with no path in from the site's own navigation.

### 1.3 The foundational teaching page
- **`/logos`** — per CLAUDE.md, explicitly meant to be "the entry point a new practitioner meets before any exercise... not a tool but a prerequisite orientation." This is, by its own stated purpose, the single most important page to have missed — a foundational orientation page nobody can find without already knowing the URL.

### 1.4 A genuinely public product page
- **`/marketplace`** — "Skill Marketplace... Browse sage skills — domain-specific reasoning evaluation tools built on the sage-reason engine." Public-facing, not auth-gated, not internal. No inbound link anywhere.

### 1.5 Auth-gated personal-history views
- **`/journal-feed`** — "Real-Time Journal Feed... captures the live causal sequence (impression → assent → action) before rationalisation sets in" — a direct companion feature to `/journal`, itself fully linked. No link from `/journal` or anywhere else.
- **`/reflections`** — the saved-daily-reflections viewer (reads `GET /api/reflections`, populated by `/api/mentor/private/reflect` and `/api/reflect`). No link from `/private-mentor`, `/mentor-hub`, or `/dashboard`.
- **`/mentor-baseline`** — "Dedicated practitioner-facing page... generates 10 tailored gap questions... for profile refinement." Reachable only from its own sub-page, `/mentor-baseline/refinements` — a closed loop with no entry point from the rest of the site.

---

## 2. Reachable, but not via persistent navigation (lower priority than §1)

- **`/baseline`** — the Baseline Assessment. **Not** orphaned: `dashboard/page.tsx` links to it twice (the "Complete Your Baseline Assessment" CTA). But that CTA is the *only* path in — once a practitioner has completed it, or if they land on the site any other way, there's no persistent nav entry to revisit or discover it. Worth a footer link for durability, lower urgency than §1.

---

## 3. Confirmed correctly excluded — verified by design, not oversights

- **`/mentor-index`** — its own header comment states "Linked from the Private Mentor Hub for hold-point assessment," and `private-mentor/page.tsx:485` confirms the link exists. A deliberate secondary-nav (hub-to-sub-tool) pattern, working as intended.
- **`/founder-hub`** — the founder-only internal multi-agent chat tool. Correctly kept out of public nav.
- **`/admin`** — the internal admin metrics dashboard. Correctly kept out of public nav.
- **`/api`, `/auth`** — not content pages (API route tree / the sign-in entry point, already linked as the header's "Sign In" button).

---

## 4. Minor existing asymmetries (not orphaned, just inconsistent)

- **`/methodology`** is in the footer's "Philosophy" column but not the header.
- **`/pricing`** is in the header but not the footer.

Neither is a real gap, but worth fixing in the same pass for consistency, since a build session touching both surfaces will have both files open anyway.

---

## 5. Recommendations

### 5.1 Header (`NavBar.tsx`) — a new "Practice" dropdown, sibling to the existing "Tools" dropdown
The existing "Tools" dropdown (`score-document`, `score-policy`, `score-social`, `scenarios`) is a coherent group — *evaluation instruments for a specific artifact*. The seven §1.1/§1.2 pages are a different, equally coherent group — *personal Stoic practice exercises*, not artifact evaluators. Recommend a new **"Practice"** dropdown (same pattern as the existing "Tools"/"Hubs" dropdowns) containing:

> View from Above · Morning Preparation · Reserve Clause · Premeditatio · Sage Compass · Circle of Concern · Passion Log

`/logos` is a different kind of page again — foundational orientation, not a practice exercise — so it doesn't belong inside "Practice." Given the header currently has no "Philosophy"/orientation section at all (only the footer does), recommend either a standalone header link for `/logos` (given its stated importance as the practitioner's entry point) or, at minimum, ensuring it's the first item a new user encounters via `/welcome`'s own page content — the latter is page-content work, outside this nav-only proposal's scope, but worth naming so `/logos`'s fix isn't considered complete once it's merely *reachable*.

### 5.2 Footer (`layout.tsx`) — a new fourth column, "Practice"
Mirroring 5.1: add a fourth footer column alongside the existing Tools / Philosophy / Legal, containing the same seven items as §5.1. Add `/logos` to the existing "Philosophy" column (alongside `/welcome`, `/#virtues`, `/#how-it-works`, `/methodology`) — the most natural, lowest-effort fit for a foundational-orientation page.

### 5.3 The remaining orphans (§1.3–§1.5, §2) — targeted single links, not a new dropdown
These don't share enough of a common thread to warrant their own nav section; recommend point fixes instead:
- **`/marketplace`** — add to the footer's "Tools" column (it's a public browsing page, same register as the existing Tools links) and consider a header-level link too, given it's public product surface, not a gated personal tool.
- **`/journal-feed`** — add a link *from within* `/journal` itself (a tab or "View live feed" link, since it's explicitly journaling's own companion feature), plus a footer "Tools" column entry near the existing `/journal` link.
- **`/reflections`** — add a link from `/dashboard` and/or `/private-mentor` (its natural upstream sources), plus a footer entry.
- **`/mentor-baseline`** — add a link from `/mentor-hub` and/or `/private-mentor`, mirroring the existing `/mentor-index` pattern (§3) exactly — the precedent for "hub links to sub-tool" already exists and just needs applying here too.
- **`/baseline`** — add a persistent footer link (the "Philosophy" or new "Practice" column both fit reasonably) so the dashboard CTA isn't the sole path in.

### 5.4 The minor asymmetries (§4)
Add `/methodology` to the header; add `/pricing` to the footer's existing columns (Philosophy fits best, alongside `/welcome`/`/methodology`).

---

## 6. Non-recommendations
- No change proposed to `/mentor-index`, `/founder-hub`, `/admin`, `/api`, `/auth` — all confirmed correctly excluded (§3).
- No new page or route is needed — every recommendation above targets an existing, live page.
- This proposal is nav-only. It does not address whether each orphaned page's own on-page content is otherwise complete, discoverable via search, or cross-linked from *within* the Remaining Principles pages to each other (a related but separate question, worth a founder call on scope before a build session, not assumed here).

---

## Cross-references
- `website/src/components/NavBar.tsx`, `website/src/app/layout.tsx` (the two navigation surfaces)
- `website/src/components/SupportFooter.tsx` (the *other* footer — R20a crisis resources, not navigation; named here only to prevent future confusion between the two)
- `operations/brand-2026-07/2026-07-23-brand-assets-audit-and-page-mapping-proposal.md` (the session this audit grew out of — `/passion-log`'s absence from nav was noticed while discussing its passion-icon imagery)
- `/CLAUDE.md` (pointer note, this session)

*End of audit. Proposal only, not a build. The header's new "Practice" dropdown and the footer's new "Practice" column (§5.1/§5.2) are the single highest-value fix — seven live, working pages currently reachable only by typing the exact URL, one of them (`/logos`) explicitly meant to be a new practitioner's very first stop.*
