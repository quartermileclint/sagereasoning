# Next-Session Prompt — Spec Adoption + Governing-Document Updates (Four-Mode Re-Scope Catch-Up)

**Stream:** founder.
**Tier:** `governance` + `archive`. Session-as-a-whole **Elevated** under 0d-ii — the `/drafts/` → `/adopted/` spec moves and the staging-plan amendment are Elevated per the standing cache risk table. No code, no auth, no safety surface — documentation + governance only. Lean + Elevated-additions + archive-note template.
**Governing frame:** `/adopted/standing-protocol-cache.md` (general protocol) + `/adopted/build-sessions-protocol-cache.md` (build-arc context). Deliverable-of-the-day: the four active mode specs adopted (`/drafts/` → `/adopted/`), the superseded agent-mode spec dispositioned, and the three governing documents that still carry the old A6 framing brought current.
**Predecessor session close:** `/operations/handoffs/founder/2026-05-14-layer1-schema-additions-close.md` (the Layer 1 schema-additions session).
**Predecessor decision-log entries:** `D-A6-RESCOPED-TO-FOUR-MODE-REDESIGN-2026-05-14`; `D-LAYER1-SCHEMA-ADDITIONS-WIRED-VERIFIED-2026-05-14` (both appended in the predecessor session — confirm at session open).
**Risk classification:** **Elevated** under 0d-ii. Critical Change Protocol NOT engaged. AC7 not engaged (no auth surface). PR6 not engaged (no safety surface). PR1 not engaged (no endpoint). No code touched.

---

## Why this session matters

The A6 four-mode re-scope is adopted as a *decision* (`D-A6-RESCOPED-TO-FOUR-MODE-REDESIGN-2026-05-14`) and the Layer 1 schema additions that unblock the mode builds are Verified. But the *governing surface* has not caught up: the five mode specs are still at `Designed` status in `/drafts/`, and the staging plan, standing cache, and build-sessions cache still describe A6 as the old "prose_mode per-mode templates (`clinical / terse / standard / educational`; Standard; 1 session)" work. Until the specs are Adopted and the governing documents are current, every downstream mode build opens against a stale map — and the eight `Layer1Schema` placeholder field names stay placeholders.

This session closes that gap in one deliberate governance pass: adopt the four active mode specs, disposition the superseded agent-mode spec, bring the three governing documents current, and confirm the eight Layer 1 field names against the now-adopted specs. It is bounded, low-risk (documentation only), and it is the natural unblocker the predecessor close named — it retires the "spec adoption" and "governing-document drift" open questions before any mode build is written.

## Pre-conditions

1. **The predecessor session is committed.** Founder confirms `git log --oneline -3 origin/main` shows the Layer 1 schema-additions commit, and `git status` is clean. (If a stale `.git/index.lock` is present, clear it first — `rm -f .git/index.lock` — per the predecessor close.)
2. **`D-A6-RESCOPED-TO-FOUR-MODE-REDESIGN-2026-05-14` and `D-LAYER1-SCHEMA-ADDITIONS-WIRED-VERIFIED-2026-05-14` are in `/operations/decision-log.md`** — both appended in the predecessor session. Confirm at session open.
3. **Founder has read (or skimmed) the five mode specs.** They were produced in the 2026-05-14 A6 scoping session with the founder in the room; the founder either confirms them as-is at the Step 2 gate or names edits. Re-reading at session open is fine.
4. **Founder commits to a ~1.5–2.5 hr bounded session.**

## What this session does — and does NOT do

**Does:** move the four active mode specs `/drafts/` → `/adopted/` at `Adopted` status; disposition the superseded `agent-mode-response-spec.md`; disposition the two worked-example files; update the staging plan §A6 row and any other governing-doc occurrences of the old A6 framing; confirm the eight `Layer1Schema` field names against the adopted specs; append the decision-log entries.

**Does NOT:**
- Resolve the specs' "open questions deferred to build" sections — adoption accepts the design *and* its explicitly-deferred questions; it does not answer them.
- Add the grounding-validator manifest constraint (flagged in the standard-mode spec) — that stays deferred to the standard-mode build per the predecessor A6 close.
- Specify the direction-score formula (private mode) — deferred to the private-mode build (mentor-consultation item).
- Touch code. The eight `Layer1Schema` fields stay exactly as implemented. This session *confirms* the field names match the adopted specs. If the founder renames a field during spec review, the rename in `layer1-extractor.ts` is a separate small `code-elevated` follow-up — not part of this session.
- Begin any mode build.

---

## Part A — Open under the protocol

Read in order:

1. **`/adopted/standing-protocol-cache.md`** (~3 min) — tier, status vocabulary, signals, risk classification, the lean + archive-note templates, and the **cache update discipline** section (this session edits the cache, so the discipline engages).
2. **`/adopted/build-sessions-protocol-cache.md`** (~3 min) — build-arc context; note the open-questions parking lot and the cache's own update discipline.
3. **`/operations/handoffs/founder/2026-05-14-layer1-schema-additions-close.md`** (~3 min) — the predecessor close; the "Next Session Should" + "Open Questions" blocks scope this session.
4. **The five mode specs in `/drafts/`, in full** (~15 min): `philosophical-mode-response-spec.md`, `standard-mode-response-spec.md`, `private-mode-response-spec.md`, `agent-trust-layer-wrapper-spec.md`, `agent-mode-response-spec.md` (the superseded one — read its header to confirm disposition).
5. **`/adopted/substrate-plugin-staging-plan.md`** — the §A6 row + surrounding Stage 1 context (~5 min); this is the most substantive governing-doc edit.
6. **`/operations/decision-log.md`** last 3 entries (`D-AGENT-CARD-A2A-V1-RESHAPE`, `D-A6-RESCOPED`, `D-LAYER1-SCHEMA-ADDITIONS`).

**Confirm at session open:** tier (`governance` + `archive`); hold-point status (P0 0h active); status vocabulary (`Scoped → Designed → Scaffolded → Wired → Verified → Live` for implementation; `Adopted / Under review / Superseded` for decisions — note the spec moves take the *specs* from `Designed` toward governing status, and their decision-log entry is `Adopted`); signals + risk classification (Elevated; Critical Change Protocol NOT engaged); PR11 inbox scan (scan `/inbox/` for files dated since 2026-05-14; summarise inline or state none).

---

## Part B — Procedure

### Step 0 — Confirm session scope (founder gate; ~5 min)

Confirm the session does both halves — (a) spec adoption and (b) governing-document updates — in one pass. If the founder wants only one half, scope accordingly and defer the other. Recommendation: both, in one pass — they are the same catch-up and the decision-log entries cross-reference cleanly.

### Step 1 — Survey: spec statuses + old-A6-framing occurrences (~15–20 min)

- Read the five specs. For each of the four active specs note its current status-header line and its "open questions deferred to build" section (these stay as-is on adoption). For `agent-mode-response-spec.md`, confirm whether the superseded-pointer header is already in place.
- **Grep all three governing documents — and anywhere else under `/adopted/` — for the old A6 framing.** Search terms: `clinical`, `terse`, `educational` (in a prose_mode / A6 context), `prose_mode per-mode templates`, the A6 row text. PR12 negative-finding discipline applies: if a document the predecessor close named (standing cache, build-sessions cache) turns out **not** to carry the old framing, state that — do not invent an edit.
- Confirm the eight `Layer1Schema` field names in `/website/src/lib/translation-sandwich/layer1-extractor.ts` match the field names in the adopted specs (`subject_identity_binding`, `reflective_self_report`, `history_window`, `topic_signal`, `carried_profile`, `profile_provenance`, `peer_agent_assessments`, `objective_function_declaration`).
- Output (in-chat, ~12 lines): the five specs and their statuses; every file + line where old A6 framing appears; the field-name match result.

### Step 2 — Draft the changes + consolidated founder approval gate (~20–25 min)

Produce, in-chat, a single consolidated change set for one approval gate (Rule B (iv) — minimal mid-session founder input):

- **Spec adoption plan:** the four active specs → `/adopted/` (propose the location — `/adopted/` root, or a `/adopted/substrate-modes/` subfolder; recommend and let the founder confirm); each spec's status header updated `Designed` → `Adopted` with the adoption date + decision-log ID.
- **`agent-mode-response-spec.md` disposition:** recommend → `/archive/` per 0e ("superseded versions moved here, not deleted"), with a superseded-pointer header; founder confirms or elects retain-in-place.
- **Example-file disposition:** `standard-mode-example.md` and `private-mode-example.md` — recommend a disposition (move alongside the adopted specs, or keep in `/drafts/`). Note the predecessor A6 close flagged `private-mode-example.md` for regeneration (it carries a standalone "Reflection component" section the founder judged "added nothing of value"); the founder elects regenerate-now / adopt-with-note / leave-in-drafts.
- **Governing-document edits:** the exact replacement text for the staging plan §A6 row, and for each other old-A6-framing occurrence found in Step 1. Show old text → new text for each.
- **Preserve-prior-versions plan:** for substantive edits to `/adopted/` governing docs, an `/archive/` snapshot per the D-ANTHROPIC-NATIVE-POSTURE precedent; for the spec moves, git tracks the rename.

**Founder approval gate:** surface the full change set. The founder approves the spec-adoption plan, the agent-mode + example-file dispositions, and — specifically — the replacement text for every governing-document edit (per "never edit governing documents without explicit approval"). One gate, all changes.

### Step 3 — Execute the approved change set (~25–35 min)

1. Move the four active specs `/drafts/` → `/adopted/` (`git mv` so the rename is tracked); update each status header `Designed` → `Adopted`.
2. `agent-mode-response-spec.md` → per the founder's election; ensure the superseded-pointer header is present.
3. Example files → per the founder's election.
4. Staging plan §A6 row + any other occurrences → apply the approved replacement text; create the `/archive/` preserve-prior-versions snapshot first.
5. Standing cache / build-sessions cache → apply approved edits if Step 1 found old framing there; `/archive/` snapshot for substantive edits.
6. (Optional, founder-elected) flip the `PLACEHOLDER (pending spec adoption)` comments in `layer1-extractor.ts` to reflect adoption — note this makes the session touch code (`code-standard`); if the founder prefers to keep this session code-free, defer it as a one-line follow-up.

### Step 4 — Verify

- Grep the three governing documents for the old A6 framing — expect zero remaining occurrences (or only deliberate historical references, e.g. inside an archived snapshot or a dated decision-log entry).
- Confirm the four specs are in `/adopted/` at `Adopted` status; `agent-mode-response-spec.md` is at its elected disposition; `/archive/` snapshots exist for substantive governing-doc edits.
- `git status --short` review: confirm only the expected files moved/modified; no code files touched (unless Step 3.6 was elected).
- Confirm the eight `Layer1Schema` field names still match the now-adopted specs (re-confirm post-edit).

### Step 5 — Append decision-log entries (lean form)

Per `/adopted/standing-protocol-cache.md` §"Lean decision-log entry". Suggested entries (the session may combine into fewer):

- **`D-FOUR-MODE-SPECS-ADOPTED-YYYY-MM-DD`** — the four active mode specs adopted; agent-mode spec dispositioned; example files dispositioned.
- **`D-STAGING-PLAN-AMENDED-FOUR-MODE-YYYY-MM-DD`** — the §A6 row brought current with the four-mode re-scope.
- **`D-CACHE-DRIFT-RESOLVED-YYYY-MM-DD`** and/or **`D-BUILD-CACHE-DRIFT-RESOLVED-YYYY-MM-DD`** — only if Step 1 found old framing in the standing / build-sessions cache; per each cache's own update discipline.

Each entry cites rules served (expect: 0a, 0d-ii, 0e, 0f; plus PR7 for the deferred-to-build questions left intact, PR11, PR12, PR16).

### Step 6 — Session close (lean + Elevated + archive-note form)

`/operations/handoffs/founder/YYYY-MM-DD-spec-adoption-and-governing-doc-updates-close.md` per the lean session-close template, with the Elevated additions (what could break + rollback path + founder verification) and an archive note (which files moved where, which `/archive/` snapshots were created). "Next Session Should" names the founder's election of the first mode build (philosophical / standard / private / ATL Wrapper) — each now opens against an Adopted spec and a current governing surface.

---

## Part C — Anticipated session shape

| Phase | Estimate |
|---|---|
| Cache + predecessor close + five specs + staging plan read (Part A) | 25–30 min |
| Step 0 — scope confirmation | 5 min |
| Step 1 — survey: specs + old-framing greps + field-name match | 15–20 min |
| Step 2 — draft change set + consolidated approval gate | 20–25 min |
| Step 3 — execute | 25–35 min |
| Step 4 — verify | 10 min |
| Step 5 — decision-log entries | 15 min |
| Step 6 — session close | 10–15 min |
| **Total** | **~2–2.5 hr** |

## Rollback path

`git revert <commit>` and push via GitHub Desktop. The session moves and edits documentation only — reverting restores the specs to `/drafts/` at `Designed` status and the governing documents to their prior text (the `/archive/` snapshots survive the revert as verbatim records either way). No production surface is affected; `/api/reason` and every endpoint are byte-identical regardless. No data loss; no user impact.

## Forecast

A successful session produces: the four active mode specs Adopted in `/adopted/`; the superseded agent-mode spec dispositioned; the two worked-example files dispositioned; the staging plan §A6 row and any other stale A6 references brought current; the eight `Layer1Schema` field names confirmed against the adopted specs; two-to-four lean decision-log entries; a lean + Elevated + archive-note session close. The governing surface is current with the four-mode re-scope, and every mode build now opens against an Adopted spec. Next after this: the founder elects the first mode build — philosophical (Standard, simplest), standard (Standard, + Summary Response rephraser), private (Critical-tier), or the ATL Wrapper (multi-session).

End of prompt.
