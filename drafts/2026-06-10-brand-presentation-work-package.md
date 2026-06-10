# Brand & Assessment-Presentation Work Package — captured S8a, 2026-06-10

**Status:** Draft — under founder review (0e). Captures a design that existed in discussion and in the founder's asset production but had never been landed as a spec; surfaced by the founder at the S8a 0h-exit gate.
**Sources:** founder direction in-session 2026-06-10; `/brand/` assets; `/brand/passion logos.rtf` + `/brand/proximity cards and colours.rtf` (both saved 2026-06-10); `/brand/Brand_Guidelines.docx` (v1, 2026-04-06 — predates all of this).
**Implementation status of everything below:** `Scoped` (0a vocabulary), except where noted.

---

## 1. The design (as directed by the founder; assumptions marked)

**The proximity target.** Assessment results render the five proximities as a series of concentric circles — a target. The five bands carry the proximity-card identities and colours from `proximity cards and colours.rtf`:

| Proximity | Card | Colour |
|---|---|---|
| Reflexive | The Storm | `#4A5568` slate grey-blue |
| Habitual | The Worn Path | `#8B6F47` earthen brown |
| Deliberate | The Crossroads | `#B2AC88` sand olive |
| Principled | The Clear Summit | `#5B8C6D` deep green |
| Sage-Like | The Inner Fire | `#C9A84C` warm gold |

*Assumption (founder to confirm):* progression runs **inward** — Reflexive is the outermost ring, Sage-Like the centre.

**Passion placement.** When an assessment triggers a passion, that passion's symbol image is placed on the target at the position the assessment indicates. **Previous locations are shown in grey** — the practitioner sees their history on the same target. When a **new proximity is reached**, the respective proximity-card image is also shown.

**Consistency across audiences.** The branding is consistent in **all outputs, including what an agent reports back to its developer.** For the agent path (JSON contract), this means the developer-form payload carries a structured *target-state* block (proximity band, triggered passions with symbol identifiers, previous positions) **plus stable asset URLs**, so the developer can render the same target the human tools show. (Agents receive data + asset references, not embedded images.)

**Home page.** `Human.PNG` and `Developer.PNG` (in `/brand/`) replace the current home-page audience images (today: `sagelogo.PNG` hero + `Zeus.PNG` at the audience section, per `website/src/app/page.tsx`).

## 2. Asset census (2026-06-10)

**Proximity cards — all five ready:** The Storm, The Worn Path, The Crossroads, The Clear Summit, The Inner Fire (PNGs present).

**Passion symbols — ready (PNG present):** cracked pottery (Malicious Joy), lentil bowl (Excessive Amusement), sandal (Terror), tunic (Timidity), spilled grain sack (Dread/Astonishment — if grain is the elected symbol over limestone), bread (Panic), milk jug (Pity), cheese (Envy), fish (Jealousy), onion (Burden).

**Passion symbols — mapped in the RTF but no PNG found:** staff (Anger), grapes (Erotic Passion), figs (Longing), olives/olive oil (Love of Pleasure), limestone fragment (Love of Honour; also Dread alternate), wax tablets (Enchantment; Anguish), pallium/cloak (Shame; Grief).
**Ambiguous:** silver owl coin (Love of Wealth) — `owllogo.PNG` exists but is a logo asset; founder to confirm whether it doubles as the coin symbol or a coin PNG is still to come. `mirror.PNG` and `non ready items.png` exist — founder to confirm their roles.

## 3. Scope items

| # | Item | Type | Slot |
|---|---|---|---|
| W1 | **Brand_Guidelines.docx update** — v2 incorporating the proximity cards + colours, the passion-symbol system, the target visualisation, and Human/Developer imagery | Governance/document (AI drafts; founder approves) | Own session or rides S8b |
| W2 | **Home-page image swap** (Human.PNG / Developer.PNG; assets copied into `website/public/images/`) | code-standard (small) | Rides S8b |
| W3 | **Assessment target visualisation component** — concentric-circle render, passion placement, grey history, proximity-card reveal; wired into the human tools' results | Design → Build (Elevated where it touches existing tool output) | **Couples with the substrate migration** (founder-elected pre-launch): build the presentation once on the new Layer-3/tool surface, not twice |
| W4 | **Agent developer-form target-state contract** — structured block + stable asset URLs in the developer-form payload | Design → Build (Elevated; agent contract addition) | Same migration arc as W3 |
| W5 | **Missing-asset production** (§2 list) | Founder, wall-clock | Parallel; W3/W4 can build with partial coverage + placeholders |

## 4. Sequencing

W3/W4 join the founder-elected pre-launch substrate-migration arc (A8 mapping first; the mapping document should name presentation alongside engine substitution so each endpoint migrates once). W1/W2 are cheap and early. W5 runs in parallel at the founder's pace. None of this blocks the lawyer engagement; all of W1–W4 block launch per the founder's S8a consistency direction.

*Cross-references: `/operations/capability-inventory-2026-06-10.md` (gap row); `/operations/pre-lawyer-readiness-statement-2026-06-10.md`; staging plan item A8; decision log `D-PRELAUNCH-S8A-E2E-VERIFICATION-2026-06-10`.*
