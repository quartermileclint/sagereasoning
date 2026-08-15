# Post-run R18 sign-off package — three mentor-worded DOC-surface items (STAGED)

**Date staged:** 2026-08-16 · **Session:** concurrent-arc C3b (Deliverable 1) ·
**Status: STAGED — NOTHING APPLIED.** This package awaits the **founder's signature at the
post-run R18 close** (R2's close or R4, per the arc plan's ruled-additions blocks). No public
surface, code file, or ADR was changed in the staging session. Every insertion point, line
number, extension count, and current-string claim below was **verified first-hand against the
repo on 2026-08-16** (grep/awk re-measurement, per the citations lesson carried from C3 — line
cites are grep-derived, never inherited from a display). **Claims-vs-repo check run at close
(independent read-only agent, 2026-08-16):** every mentor-wording quotation in this package
byte-matched its verbatim source in every rendering; two boundary-line cites were found off by
one (the api-docs R19e paragraph and Configuration Honesty card bounds) and corrected in place
— disclosed here rather than silently repaired.

**Precedent followed:** `operations/connective-layer-2026-08/2026-08-15-q5c-q13a-r18-docs-signoff-package.md`
(the C1 package the founder signed — per-surface insertion points with surrounding text, exact
proposed text, provenance per wording, discovered-drift section, per-item sign-off lines).

**Covers (three mentor-worded items, all ruled 2026-08-15, all execution post-run per M2):**

| Item | Wording source (verbatim canonical) | Surfaces |
|---|---|---|
| **A/R-5** — kathêkon role-blindness qualification | `operations/agent-circles-2026-08/2026-08-15-mentor-rulings-C2-scope-documents-verbatim.md`, Ruling Set A, R-5 | guardrail GET self-doc + `llms.txt` + agent-card guardrail extension (**3 surfaces — api-docs is NOT one of them**, per the ruling's own list) |
| **B/M-A (R18 half)** — discriminative-range `does_not_attest` | same file, Ruling Set B, R-2 | `llms.txt` + `agent-card.json` + api-docs |
| **D/O-A** — practitioner-type calibration disclosure | `operations/agent-circles-2026-08/2026-08-15-mentor-ruling-set-d-layer3-scope-document-verbatim.md`, L-1 | `llms.txt` + `agent-card.json` + api-docs |

**The B/M-A split, stated so neither session double-lands or half-lands it:** B/M-A has a CODE
half (ADR-013 §8 dated amendment + the `trust-record-payload.ts` `does_not_attest` array + the
S10 battery, all **in the same edit**) and an R18 half (the three public surfaces, this
package). The code half is specced in `2026-08-16-post-run-edit-specs-STAGED.md` (Spec 1) and
lands at **R2**. This package's B/M-A section lands at the **R18 close** under founder
signature. **Ordering recommendation: code half first** — publishing the disclosure on
`llms.txt` before the live envelope carries the new item would make the public doc claim a
`does_not_attest` entry the served envelope does not yet contain (the exact drift class the C1
package's Decision 2 existed to prevent). If both land in one sitting, land them in one push.

---

## Load-bearing serving facts verified first-hand, 2026-08-16

- `agent-card.json` carries **23 extensions** (counted by script). The three touched here:
  **#7** `safety-redirect/v1`, **#13** `guardrail-signed-sandwich/v1`, **#17**
  `trust-record/v1`. **No item in this package adds an extension under its recommended form —
  the count stays 23** (one named alternative under D/O-A would make it 24; see there).
- Guardrail GET self-doc: `website/src/app/api/guardrail/route.ts` — `GET` handler at `:587`,
  the `usage.response` field-documentation entries at `:608-622` (the object's braces at
  `:607`/`:623`); `is_kathekon` at `:612`, `kathekon_quality` at `:613`. (The ruling's
  "~:595-640" cite still contains this region; the precise current lines are these.)
- `website/public/llms.txt`: guardrail section `:257-300`; its "What the gate evaluates (it is
  not a fact-checker)" paragraph at `:297`; the GET line at `:299`. Trust-record section
  `:621-685`; "WHAT IT DOES NOT ATTEST (HONEST LIMIT):" at `:661`; the list's final
  (fifth-circle) bullet ends at `:677`; the next paragraph ("Records are retention-governed…")
  at `:679`. "Safety Behaviour (Distress Inputs)" section at `:1030-1033`.
- `website/src/app/api-docs/page.tsx` (993 lines): the trust-record paragraph at `:789-802`
  (`<p>` opener `:789`, content `:790-801`, closer `:802`) with its abridged does-not list at
  `:796-798`; the "Configuration Honesty" card at `:975-990` (comment `:975`, `<div>` `:976`,
  closing `</div>` `:990`).
- The live envelope (`website/src/lib/substrate/trust-core/trust-record-payload.ts`)
  `does_not_attest` array: opener `:52`, **eight items** `:53-60`, closer `:61` — the ruling's
  `:52-61` cite is still exact, and R-1's "names eight items" matches the code.

---

## Item 1 — A/R-5: the kathêkon role-blindness qualification

**Mentor wording (verbatim, binding; Ruling Set A, R-5 — subject to founder R18 sign-off):**

> is_kathekon and kathekon_quality are assessed against a general Stoic standard of
> appropriate action. Kathêkon proper is role-relative (Cicero, De Officiis 1.107-115) — what
> is appropriate depends on the agent's specific role and circumstance. These fields assess
> conformity to a general standard; they do not assess role-relative appropriateness unless a
> role signal is supplied by the caller.

No code-path change. No event effects. The kathekon predicate (`assessKathekonEngagement`) is
not touched (the ruling's own sequencing note).

### Surface 1a — guardrail GET self-doc (`website/src/app/api/guardrail/route.ts`)

**Insertion:** a new key in the `usage.response` documentation object, immediately after
`kathekon_quality` (`:613`), value = the mentor wording verbatim. Surrounding text as of
staging:

```
:612  is_kathekon: 'boolean | null — whether the action is appropriate; null when the
      extraction is too sparse to judge (the gate then floors to a conservative non-proceed)',
:613  kathekon_quality: 'strong | moderate | marginal | contrary',
```

**Proposed edit (packaging around the fixed wording — the key name is the applying session's
one degree of freedom):**

```ts
kathekon_scope:
  'is_kathekon and kathekon_quality are assessed against a general Stoic standard of ' +
  'appropriate action. Kathêkon proper is role-relative (Cicero, De Officiis 1.107-115) — ' +
  'what is appropriate depends on the agent\'s specific role and circumstance. These fields ' +
  'assess conformity to a general standard; they do not assess role-relative appropriateness ' +
  'unless a role signal is supplied by the caller.',
```

Note: this is a `route.ts` change → the standing gate applies (`npm run build`, not just
`tsc`; memory `nextjs-route-export-validation`). Response-shape unchanged (the GET is
documentation only).

### Surface 1b — `website/public/llms.txt` (guardrail section)

**Insertion:** a new standalone paragraph after the `:297` fact-checker paragraph, before the
`:299` GET line. Proposed text (bold lead is packaging; the sentence body is mentor-verbatim):

```
**Role-blindness of `is_kathekon` / `kathekon_quality`:** is_kathekon and kathekon_quality
are assessed against a general Stoic standard of appropriate action. Kathêkon proper is
role-relative (Cicero, De Officiis 1.107-115) — what is appropriate depends on the agent's
specific role and circumstance. These fields assess conformity to a general standard; they do
not assess role-relative appropriateness unless a role signal is supplied by the caller.
```

### Surface 1c — `agent-card.json`, extension #13 `guardrail-signed-sandwich/v1`

**Insertion:** append the mentor wording verbatim as the final sentences of the existing
description. Current tail (verified 2026-08-16, 1,767 chars total):

> …Availability: a signing outage fails the gate CLOSED (HTTP 503); an engine outage returns a
> conservative pause — never a silent proceed.

Proposed: append ` Role-blindness: is_kathekon and kathekon_quality are assessed against a
general Stoic standard of appropriate action. Kathêkon proper is role-relative (Cicero, De
Officiis 1.107-115) — what is appropriate depends on the agent's specific role and
circumstance. These fields assess conformity to a general standard; they do not assess
role-relative appropriateness unless a role signal is supplied by the caller.`

**Extension-count consequence: none — an amendment to #13; the count stays 23.**

### A/R-5 capability-accuracy note (drift-check finding, carried to the applying session)

The wording's conditional clause — "unless a role signal is supplied by the caller" — describes
a channel the same ruling set creates (R-2's guardrail-local extraction-context threading;
R-3's runner remit statement) but which is **not built at staging time** (both are post-run;
R-3 is runner-protocol-only). Publishing the qualification before the threading lands is
honest — the fields ARE role-blind today, and the clause states the condition under which that
would change. The applying session should state in its record whether the R-2/R-3 threading
has landed by application time, so the clause reads as capability-accurate either way. The
wording itself is mentor-fixed; no adaptation.

---

## Item 2 — B/M-A (R18 half): the discriminative-range `does_not_attest` amendment

**Mentor wording (verbatim, binding; Ruling Set B, R-2 — subject to founder R18 sign-off):**

> Discriminative range — whether the agent's proximity readings vary across different types of
> actions, or whether stability in the record reflects tested relapse-resistance rather than
> absence of perturbation. The disposition_stability dimension measures consistency of
> proximity readings; it cannot distinguish a stable disposition that has been tested under
> varied conditions from one that has not been tested at all.

**Co-requisite reminder:** the CODE half (ADR-013 §8 + `trust-record-payload.ts:52-61` + the
S10 battery, same-edit) is Spec 1 of `2026-08-16-post-run-edit-specs-STAGED.md` and is NOT
signed here — this package signs only the three public-surface applications. Recommended
order: code half first (see the split note at the head of this package).

### Surface 2a — `website/public/llms.txt` (trust-record section)

**Insertion:** a new bullet in the "WHAT IT DOES NOT ATTEST (HONEST LIMIT):" list (`:661`),
after the fifth-circle bullet (ends `:677`), before the "Records are retention-governed…"
paragraph (`:679`). Proposed bullet — the mentor wording verbatim behind the list marker:

```
- Discriminative range — whether the agent's proximity readings vary across different types
  of actions, or whether stability in the record reflects tested relapse-resistance rather
  than absence of perturbation. The disposition_stability dimension measures consistency of
  proximity readings; it cannot distinguish a stable disposition that has been tested under
  varied conditions from one that has not been tested at all.
```

**Style deviation, named for election:** the list's existing seven bullets open lowercase
("factual correctness — …"); the proposed bullet keeps the mentor's capital "Discriminative"
to stay strictly verbatim. Founder may elect the style-matched lowercase "d" (a one-character
deviation from verbatim) — ☐ verbatim capital (recommended) / ☐ style-matched lowercase.

### Surface 2b — `agent-card.json`, extension #17 `trust-record/v1`

**Insertion (recommended form):** append the mentor wording verbatim as a new final sentence
of the description, prefixed `Does not attest discriminative range: `. Current tail (verified
2026-08-16, 1,424 chars total):

> …Nothing binds (R20c human-override supremacy); records are retention-governed (90d) and
> erasable (R17). VC-claims-mappable / A2A-extension-shaped by design; nothing published
> externally at v1.

**Named alternative (abridged; needs its own sign-off since it is not mentor-verbatim):**
extend the description's existing does-NOT-attest run ("does NOT attest factual correctness
(not a fact-checker), harms omitted…, freshness…, anything resting on agent self-report alone,
future behaviour, or fitness as a training signal (weights-tier claims blocked)") with
"…, or discriminative range (stability in the record may reflect absence of perturbation, not
tested relapse-resistance)". ☐ full-verbatim append (recommended) / ☐ abridged in-run insert.

**Extension-count consequence: none — an amendment to #17; the count stays 23.**

### Surface 2c — `website/src/app/api-docs/page.tsx` (trust-record paragraph)

**Insertion:** extend the abridged parenthetical at `:796-798` — currently
"(factual correctness; harms omitted from the submitted text; freshness beyond the artifact
record; future behaviour; training-signal fitness)" — to end
"…; training-signal fitness; discriminative range — stability may reflect absence of
perturbation, not tested relapse-resistance)". This is an **abridgement** (the api-docs list
is itself a five-item abridgement pointing at llms.txt for the full contract); the full
mentor-verbatim text lands on llms.txt (2a). ☐ approve abridged form / ☐ founder supplies
alternative.

---

## Item 3 — D/O-A: the practitioner-type calibration disclosure

**Mentor wording (verbatim, binding; Ruling Set D, L-1 — subject to founder R18 sign-off):**

> Outside the crisis path, the guide's response is not currently calibrated for practitioner
> type. Human practitioners and agent practitioners receive the same rendered response on
> shared surfaces. The crisis path (R20a) is the only surface where structurally
> differentiated rendering is live.

No code-path change. No event effects. `SUBSTRATE_LAYER3_ENABLED` remains unset — **its
activation is NOT licensed by this disclosure, by Ruling Set D, or by any session executing
it** (restated per the ruling's own context block).

### Surface 3a — `website/public/llms.txt`

**Insertion (recommended):** a new paragraph appended to the "Safety Behaviour (Distress
Inputs)" section (`:1030-1033`), after its existing single paragraph — the disclosure's own
reference point is the crisis path, so it sits beside the crisis-path description. Proposed
text (bold lead is packaging):

```
**Practitioner-type calibration:** Outside the crisis path, the guide's response is not
currently calibrated for practitioner type. Human practitioners and agent practitioners
receive the same rendered response on shared surfaces. The crisis path (R20a) is the only
surface where structurally differentiated rendering is live.
```

**Named alternative anchor:** the "Configuration Honesty — No-Practice Disclaimer" section
(`:832`). ☐ Safety Behaviour (recommended) / ☐ Configuration Honesty.

### Surface 3b — `agent-card.json`

**Recommended form:** amend **#7 `safety-redirect/v1`** by appending the disclosure verbatim
to its description (current full text is 421 chars ending "…Contract behaviour, not an
error."). The disclosure qualifies exactly the claim that extension makes (the crisis path's
differentiated rendering), so it sits beside it. **Count stays 23.**

**Named alternative:** a new extension (e.g. `practitioner-type-calibration/v1`) carrying the
disclosure — **count becomes 24**. ☐ amend #7 (recommended) / ☐ new extension #24.

### Surface 3c — `website/src/app/api-docs/page.tsx`

**Insertion:** a new paragraph inside the "Configuration Honesty" card (`:975-990`), after the
R19e paragraph (`:986-989` — `<p>` opener `:986`, text `:987-988`, closer `:989`), carrying
the disclosure verbatim:

```tsx
<p className="font-body text-sm text-sage-600 leading-relaxed mt-2">
  Outside the crisis path, the guide&apos;s response is not currently calibrated for
  practitioner type. Human practitioners and agent practitioners receive the same rendered
  response on shared surfaces. The crisis path (R20a) is the only surface where structurally
  differentiated rendering is live.
</p>
```

(`page.tsx` change → the standing `npm run build` gate applies.)

---

## Discovered drift — found while placing the wordings (the C1 precedent's section)

**Flagged, not silently accommodated.** None of these blocks signature; each is either a
deliberate abridgement to record or a check the applying session performs.

1. **The does-not-attest lists are abridged inconsistently across surfaces.** The live
   envelope carries **8** items (`trust-record-payload.ts:53-60`); the llms.txt trust-record
   list carries **7** (missing "Confirmed delivery" — that class IS documented in the llms.txt
   "Orientation readings" section `:686+`, so this is distributed coverage, not silence);
   agent-card #17's in-description run carries **6** (missing fifth-circle alignment and
   confirmed delivery — both covered by extension #22 `orientation-reading/v1`); the api-docs
   parenthetical carries **5** (missing reasoning-quality-beyond, fifth-circle, confirmed
   delivery — the latter two covered by the adjacent orientation paragraph `:804-819`). The
   abridgements appear deliberate (each surface points at the fuller contract), but they are
   nowhere recorded as deliberate. Adding the discriminative-range item takes the counts to
   9/8/7/6 respectively. **Election offered:** ☐ record the abridgements as deliberate (a line
   in the applying session's record; recommended — zero surface change beyond this package) /
   ☐ reconcile the lists to the full 9 in the same pass (a larger diff, needs its own wording
   sign-off per surface).
2. **A/R-5's conditional clause pre-dates its channel** — see the capability-accuracy note
   under Item 1. Check, not change.
3. **No contradicting claims found:** nothing on the three guardrail surfaces currently claims
   role-relativity for `is_kathekon`/`kathekon_quality` (the qualification contradicts no
   published text); the trust-record surfaces' surrounding text matches the live payload code
   at every point checked (attests list, 404/503 semantics, modulate-only reflect, orientation
   capped-note wording vs `trust-record-payload.ts:304-315`).

---

## AI recommendations (added 2026-08-16 at the founder's request — every election remains the founder's; the mentor wordings themselves are fixed and not elected)

| # | Election | Recommendation | Why (one line) |
|---|---|---|---|
| 1a | GET self-doc insertion | **ADOPT as proposed** (`kathekon_scope` key after `:613`) | one verbatim block sitting directly beside the two fields it qualifies; no response-shape change; `npm run build` gate applies |
| 1b | llms.txt insertion after `:297` | **ADOPT as proposed** | the qualification is a sibling of the existing fact-checker honesty note — same paragraph class, same section |
| 1c | agent-card #13 append | **ADOPT as proposed** | an amendment, not a new extension; count stays 23 |
| 2a | llms.txt bullet style | **Verbatim capital "Discriminative"** | on an R18 surface, strict mentor-verbatim beats a one-character style match; the deviation is cosmetic, the verbatim discipline is not |
| 2b | agent-card #17 form | **Full-verbatim append** | the abridged in-run insert would be the ONLY non-verbatim rendering of a mentor-fixed wording across all nine placements — an avoidable asymmetry |
| 2c | api-docs parenthetical | **ADOPT abridged insert as proposed** | the api-docs list is already a deliberate abridgement that points at llms.txt for the full contract; a full-verbatim block would be out of register there |
| 2-ord | B/M-A ordering | **Code half (Spec 1) first, or same push** | publishing the disclosure before the live envelope serves the item would make llms.txt claim an envelope entry production doesn't yet carry |
| 3a | D/O-A llms.txt anchor | **Safety Behaviour section** | the disclosure's own reference point is the crisis path; it belongs beside the crisis-path description, not in the configuration-tier disclaimer |
| 3b | D/O-A agent-card | **Amend #7** (count stays 23) | the disclosure qualifies exactly the claim #7 makes — a separate extension would detach the qualification from the claim it bounds |
| 3c | D/O-A api-docs | **ADOPT as proposed** | Configuration Honesty is the page's honesty-disclosure home (the R19e pattern: document what a surface does not do) |
| D-1 | abridgement lists | **Record-as-deliberate** | zero additional surface change; every "missing" item is genuinely covered elsewhere (verified); reconciliation would be a larger diff needing fresh per-surface wording sign-off for no honesty gain |

Net extension-count under the recommended set: **23 (unchanged)**. Net form: all three mentor
wordings land verbatim on every surface except the one deliberately-abridged api-docs
parenthetical (2c), which points at the verbatim llms.txt contract.

## Sign-off lines

**Item 1 — A/R-5 (three surfaces + the `kathekon_scope` key name):**
☐ 1a GET self-doc as proposed *(AI rec: adopt)* · ☐ 1b llms.txt as proposed *(AI rec:
adopt)* · ☐ 1c agent-card #13 append as proposed *(AI rec: adopt)* · Notes: ______

**Item 2 — B/M-A R18 half (three surfaces + two elections + ordering):**
☐ 2a llms.txt bullet as proposed (☐ verbatim capital *(AI rec)* / ☐ lowercase) · ☐ 2b
agent-card #17 (☐ full-verbatim append *(AI rec)* / ☐ abridged in-run) · ☐ 2c api-docs
abridged parenthetical *(AI rec: adopt)* ·
☐ confirmed: code half (Spec 1) lands first or same-push *(AI rec: confirm)* · Notes: ______

**Item 3 — D/O-A (three surfaces + two elections):**
☐ 3a llms.txt (☐ Safety Behaviour *(AI rec)* / ☐ Configuration Honesty) · ☐ 3b agent-card
(☐ amend #7 *(AI rec)* / ☐ new extension #24) · ☐ 3c api-docs Configuration Honesty
paragraph *(AI rec: adopt)* · Notes: ______

**Drift item 1 (abridgement recording):** ☐ record-as-deliberate *(AI rec)* /
☐ reconcile-in-pass · Notes: ______

## Verification plan after application (the C1 template)

1. `agent-card.json` parses; extension count reads 23 (or 24 iff the D/O-A new-extension
   alternative was elected).
2. `npm run build` green (`route.ts` + `page.tsx` changed — the standing build gate).
3. Each llms.txt insertion present exactly once (grep for a distinctive phrase per item); no
   residual contradiction.
4. Lighter claims-vs-repo check (or full PR19 per the applying session's tier): every wording
   assertion against code; the B/M-A envelope-vs-docs consistency check (the live envelope
   must already carry the new item — the ordering rule above).
5. Post-push (founder): curl the three production surfaces; confirm byte-for-byte landing.

*End of staged package. Produced by C3b (documents only); nothing here was applied. The
signature lines above are completed by the founder at the post-run R18 close.*
