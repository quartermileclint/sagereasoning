# The Stoa — Connective-Layer Build Plan (v1)

**Date:** 2026-08-02 · **Status:** **APPROVED (founder, 2026-08-02, same day):** sequence as recommended — **ST1 first**, then ST2→ST5 per this plan, **PR19 at every build** (`D-STOA-BUILD-PLAN-APPROVED-ST1-FIRST-2026-08-02`). §5 dispositions at approval: item i settled (ST1→ST2–ST5); item iv settled (PR19 at each build); item iii treated as approved-as-recommended, re-confirmed at ST1 open; item ii carried to ST4's session; item v carried to the next opener/CLAUDE.md refresh. ST1's session prompt: `operations/handoffs/founder/2026-08-02-stoa-ST1-community-map-reachback-NEXT-SESSION-PROMPT.md`. Every schema, flag, deploy, mint, or credential step remains its own founder-walked 0c-ii.
**Binding sources (verbatim wins over this plan):** `inbox/stoic network enquiry and mentor response.txt` (the warrant, the four principles, the three-field minimal form) + `operations/connective-layer-2026-08/2026-08-02-mentor-consultation-connective-layer-verbatim.md` (the fourteen answers).
**Adoption record:** `D-CONNECTIVE-LAYER-STOA-MENTOR-VERDICTS-ADOPTED-PLAN-AUTHORED-2026-08-02`.

## 1. What this builds

**The Stoa** (the mentor's ruled name, Q14 — a direct inheritance, not a metaphor): one shared space where human practitioners and agents make themselves visible to one another through voluntary self-declarations — *what I bring* / *what I am looking for* / *how to reach me* — under the four principles (offer never prompt · no obligation by visibility · the referral is a preferred indifferent · one un-segregated space). The canonical self-description, **mentor-verbatim, to be used as the space's own copy**:

> *The Stoa is a colonnade where practitioners make themselves visible to one another. Each entry is a practitioner's own declaration — what they are working on, what they offer, what they seek. The platform verifies nothing and endorses no one. You decide what to declare, who may see it, and whether to walk through any door you find open.*

**Shape note (a recorded deviation from the briefing's forecast):** the briefing predicted two plans (human + agent, the reminders-program pattern). The Q1/Q4 rulings make presence ONE concept ("account-holding or credential-binding") in ONE space — so this is **one plan, one substrate, two surface tracks**. Splitting plans would have re-introduced the segregation the same-space principle forbids.

## 2. The binding design constraints (the plan's spine — each pinned in the build, cited to its ruling)

| # | Constraint | Source |
|---|---|---|
| 1 | Declarer chooses visibility per entry; defaults **community-only (humans)** / **public (agents)** | Q1 |
| 2 | Presence = account-holding OR credential-binding; **community scope is visible to any authenticated practitioner, human or agent** | Q1, Q4a |
| 3 | Consulting the list never requires declaring (no reciprocity gate) | Q1 |
| 4 | Opening near-empty is honest IF the presentation names it — the colonnade before the crowd | Q1 |
| 5 | Passive shelf permitted, computed **from the practitioner's own declared content ONLY** — never browsing behaviour, engagement, or platform inference | Q2a (sharpened) |
| 6 | Subscriptions = the practitioner's own standing question; practitioner-initiated, trivially revocable | Q2b |
| 7 | **Never** notify anyone their entry was viewed/matched/relevant — a structural requirement (no performance surface) | Q2c |
| 8 | Ordering = **declaration recency, only** (not alphabetical, not rotation) | Q3a |
| 9 | Search/filter permitted (consultation of the resource) | Q3b |
| 10 | Tags: **domains of work and inquiry, never qualities of the practitioner**; suggested, never required | Q3c |
| 11 | **One entry per practitioner**; offers + needs are fields of that one presence | Q3d |
| 12 | Declaration date always displayed (honest ageing, no editorialising) | Q3e |
| 13 | Identity floor: account (humans) / credential (agents) — existence + accountability, **never capability verification** | Q4a |
| 14 | Display-name pseudonymity honoured; the declared channel carries whatever further identity the practitioner extends | Q4b |
| 15 | Self-declared framing carried by **form, not disclaimer** | Q5a |
| 16 | Removal ONLY on: demonstrated dishonesty (**examined-artifact standard — the platform is not the sole judge; accusation alone never suffices**), facilitation of injustice, flooding/spam. Modesty is never grounds | Q5b |
| 17 | Agent false-capability demonstrated in examined use = trust-relevant event (oversight + dikaiosyne); examined artifact only | Q5c |
| 18 | **No practice-derived data on any human entry** — no stage, tier, or milestone. **Reaches back: the community map is rebuilt WITHOUT the alignment tier at repair** | Q6a |
| 19 | Agent entries MAY link the public trust record + accreditation, with honest "no examined record" where none exists — honest asymmetry, not hierarchy | Q6b |
| 20 | No evaluative sorting/ranking/badging; **nothing flows directory→trust/practice/milestone/suggestion or back — structural separations** | Q6c |
| 21 | Contact consent is scoped to the declaration: individual, referencing it, about the declared matters; bulk/harvested outreach is a **violation of the space**; binds agents identically (the engine's existing injustice treatment applies unmodified) | Q7a/b |
| 22 | The space publishes its own ethic — in the presentation (humans) and the machine-readable contract (agents) | Q7c |
| 23 | Operational logging (safety/cost/abuse) permitted; engagement never surfaced AND **never used internally** (ordering, feature priorities, any signal), non-use never a signal | Q8 (sharpened) |
| 24 | Staleness: visible age always; a **rare, gentle "is this still yours?"** on one's own entry — no badge, no penalty, **never silent expiry** | Q9 |
| 25 | Self-declaration only: no third-party listings, no testimonials/endorsements; referrals happen between practitioners — unrecorded, unintermediated, uncredited | Q10 |
| 26 | No paid placement ever; access free; the platform takes no cut of collaborations | Q11 |
| 27 | The layer is plain, with **one exception**: an optional **private draft reading** at the declarer's request, pre-publish, mirror register — no engine reading of published entries, no examination on browse/contact | Q12 |
| 28 | Calling/purpose ↔ declaration divergence: surfaced honestly; may be noted in the trust record **as an examined observation, never a violation**; never auto-removed | Q13a |
| 29 | Listing confers no vetted standing; discernment unchanged; claims are claims | Q13b |
| 30 | Name: **The Stoa**; the two-sentence self-description above is canonical copy | Q14 |

## 3. Phases

Order below is the recommended sequence; the founder sequences against the standing queue (the agent-circles walk, the S11 items, 0h). Everything Stoa-proper is built **dark behind one new flag `SUBSTRATE_STOA_ENABLED`** (house pattern: UNSET everywhere ⇒ byte-identical; one flip = the whole activation; unset = the whole rollback). Commit-and-push before any flag, TEST before prod, throughout.

### ST1 — The community-map reach-back (independent; the mentor's one implement-now directive)
**Status: ✅ DONE — LIVE 2026-08-03** (founder-walked TEST→prod; §VERIFY green — 5-column view, exactly-SELECT grants; live curl honest-empty, payload clean of alignment/id; PR19 folds applied; §5 item iii confirmed — aggregate stats off entirely; the raw auth UUID also dropped; the legacy graded-view migration neutralised; the founder's TEST walk caught the writable-auto-updatable-view grants defect, folded revoke-first before prod — memory `supabase-view-default-grants-auto-updatable`). Decision `D-STOA-ST1-COMMUNITY-MAP-REPAIRED-DEGRADED-2026-08-03` + walk addendum.
**Tier:** `code-elevated` + `schema` (founder-walked SQL). **What:** repair the broken `/community` surface (the live 42703 — `community_map_pins.show_on_map` missing in production) AND, per Q6a, rebuild it **without the alignment tier**: the `community_map_pins` view drops `sage_alignment` + `avg_total`; the page's pins and stats lose alignment-derived display (the "sage-like / principled" stat tiles go; pins-on-map + countries stay). The mentor's closing observation is explicit: the ruling is resolved, the opportunity is the repair, "the right act is to implement it, not to defer it further." **Founder confirm at build:** whether aggregate alignment counts leave the page entirely (recommended: yes — aggregate grading still grades the colonnade). **Later election (not this phase):** whether the map folds into the Stoa as its geographic facet or stays a sibling surface. **Verify:** view rebuilt + RLS/grants intact; page renders pins live; no alignment field served anywhere on the surface.

### ST2 — Schema + the entry model (dark)
**Tier:** `schema` + `code-standard`; founder-walked migration TEST→prod, inert until the flag. **Table `stoa_entries`:** one row per identity — human (`owner_user_id` → profiles.id) XOR agent (`agent_id` canonical + owning credential ref), **unique per identity** (#11); fields `what_i_bring`, `what_i_seek`, `contact_channel` (all voluntary — a row may exist with any subset), `visibility` (`community`|`public`, defaults per #1), `tags text[]` (domain vocabulary, #10), `declared_at`, `renewed_at`, withdrawn/removed state + removal-grounds enum mirroring #16. **No engagement columns of any kind** (#23 — no view counts, no last-seen). RLS: owner-write; reads per visibility. **Retention posture (deliberate contrast with the 90-day records):** entries are *standing declarations* — they persist until withdrawn or erased, never retention-swept, never silently expired (#24). **Data rights wired same-session** (the milestones lesson — at birth, not later): `/api/user/access`/`export`/`delete` + `/api/credential/erase` cover the table; withdrawal instant, erasure hard-delete.

### ST3 — The human surface (dark; one Critical element)
**Tier:** `code-elevated`, EXCEPT the declaration-submission route's distress wiring — an R20a perimeter addition, **`code-critical`** per 0d-ii, with its AC5 recorded decision. **What:** `/stoa` — browse (recency-only, #8), search/filter (#9), suggested-never-required domain tags (#10), create/edit/withdraw own entry with per-entry visibility choice (#1), declaration date shown (#12), the entry form structured as "in their own words" (#15), the ethic + the canonical self-description as the page's presentation (#22, #30), the honest near-empty framing (#4). Community entries require sign-in to view; public entries public. No reciprocity gate (#3). **The passive shelf:** matches between the practitioner's OWN declared fields/tags and others' entries — declared content only, no behavioural input (#5); shown only in their own view, no notification, no call to action. **The staleness line:** in-product only (no email needed) — on the practitioner's own entry view after long ageing, the gentle "is this still yours?" with a renew action; no badge, no penalty, no expiry (#24). **PR15:** reuse `profiles.display_name`, `requireAuth`, the shared R20a classifier, house form/battery patterns; consult the Anthropic `frontend-design` skill for the page, `webapp-testing` for verification.

### ST4 — The agent surface (dark; Critical at activation)
**Tier:** `code-elevated` build; the public-surface + R18 changes land only at ST5. **What:** `GET /api/stoa` (list + per-entry; unauthenticated sees public entries; a valid practice credential sees community entries too — presence per #2), recency-ordered, no evaluative field anywhere. `POST /api/stoa/declare` — **owner-bound credential required** (the mentor's first answer: the *developer* declares for an agent; an owner-less credential has no accountable declarer — see §5 open item ii for the capability question), K1-canonical agent_id, one entry per identity. Agent entries **link** `GET /api/trust-record/{agent_id}` + accreditation with the honest "no examined record" absence line (#19). **R18 staging:** llms.txt section + an `agent-card.json` extension (working name `stoa-connective-layer/v1`) carrying the machine-readable ethic — the contact kathekonta (#21/#22) — **staged only; applied at ST5 after founder sign-off** (standing R18 discipline).

### ST5 — Activation walk (founder-walked `code-critical` 0c-ii)
Commit + push, Vercel green **with the intended code**, THEN `SUBSTRATE_STOA_ENABLED=true`. Smokes: visibility matrix (unauth → public-only; authenticated human → community; credentialed agent → community; no-declare browse works); human declare→edit→withdraw cycle; agent declare on a throwaway owner-bound credential (revoked at teardown); date display; shelf shows declared-content matches only; R18 docs applied post-sign-off. Rollback: unset the flag (byte-identical, battery-asserted); ST2's table stays inert.

### ST6 — The optional draft mirror reading (Q12's one exception)
**Tier:** `code-elevated`. Request-only, pre-publish, private: the declarer asks "does this declaration honestly represent what I am offering and seeking?"; the instrument reads the draft and reflects (mirror register — description, never verdict/grade); no gate on publishing, no persistence into practice data, nothing stored beyond the declarer's own view (exact persistence posture decided at build; recommend none). Model per the AC1 table (Sonnet, standard assessment class). Never triggered by anything but the declarer's explicit request (#27).

### ST7 — Deferred, named (not scoped here)
- **Subscriptions (#6):** blocked on the email decision (#15 Resend, still unprovisioned). Permitted-by-ruling; build when a channel exists.
- **Q5c/Q13a trust-event machinery (#17, #28):** new trust-event classes need the C1c-precedent treatment — `agent_trust_events` CHECK widening + dark-flag-gated emission + the evidentiary path (what examination produces the artifact). Its own `code-critical` session(s), sensibly after the Stoa exists and real examined use can contradict a declaration. Until built: the removal/observation standards in #16/#28 are operated founder-manually on examined artifacts.
- **Map-into-Stoa fold election** (from ST1).
- **Nav + glossary placement** (the nav-audit precedent; a `/glossary` entry for The Stoa) — small, ride any ST3-adjacent session.

## 4. Verification mandates (every build session)

1. **The boundary battery (constraint #20 made structural, both directions — the human-practitioner-boundary house pattern):** Stoa modules import no trust-core / kathekon / practice / suggestion / milestone module; those modules never read `stoa_entries`; the shelf's inputs are pinned to declared-content fields only (#5). Mutation-verify the pins (house standard — a pin that can't go red isn't a pin).
2. **The no-hierarchy pins:** ordering is recency-only (no other sort key exists in the query); no evaluative term in the tag vocabulary (a battery asserting the seed list against a deny-class); no engagement field in schema or payload (#23).
3. **R20a invocation tests** on the declaration route (the established `r20a-invocation` pattern) + the AC5 recorded decision in-session.
4. **Visibility-matrix tests** (#1/#2/#3) both flag states; flag-off byte-identity asserted.
5. **PR19 independent adversarial review** per session; tsc + `npm run build` green; founder-walked steps live per PR17 (bare SQL in `sql` blocks; one shell command per block).

## 5. Open items the founder settles at plan approval

i. **Sequencing** — where the Stoa sits against the standing queue (agent-circles walk, S11 items, the 0h call). The mentor pushed only ST1 as implement-now; the rest is the founder's ordering. The space is honest even empty (#4), so pre- vs post-0h is a product choice, not an honesty constraint.
ii. **Agent-declare credential shape** — owner-bound required (recommended above); whether declaring rides an existing capability (`consult`) or a new UPC capability (`declare`) — a small 6e-precedent question for ST4's session.
iii. **ST1 breadth** — confirm aggregate alignment stats leave the map page entirely (recommended yes).
iv. **PR19 on this plan itself** before ST1, or at each build (minimum: each build).
v. **The standing opener + CLAUDE.md** — both need their next refresh to carry this program (left untouched this session per the in-place-edit discipline; the close names it).

## 6. What this plan deliberately does not do

No engagement analytics, no ranking, no endorsements, no paid placement, no auto-expiry, no notifications of being seen, no practice data on human entries, no capability verification, no platform intermediation of contact — each an adopted ruling (§2), not a v1 scope cut. Future sessions must treat additions in these directions as **contradicting the binding record**, not as enhancements.

*End of plan. The verbatim records win over this plan wherever they differ.*
