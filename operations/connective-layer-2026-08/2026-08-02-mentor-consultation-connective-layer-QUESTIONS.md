# Outbound Mentor Consultation — The Connective Layer (questions before a build plan)

**Date:** 2026-08-02 · **Status:** **ANSWERED + ADOPTED same day** — all fourteen answered; verbatim record (binding, wins over every summary): `2026-08-02-mentor-consultation-connective-layer-verbatim.md`; build plan authored from it: `2026-08-02-stoa-build-plan.md`. Original convention line retained: per the standing convention (the reminders and agent-circles precedents), the verbatim answers are adopted as binding.
**Source thread:** the founder's enquiry on the ancient gathering/introduction function + the mentor's answer, `inbox/stoic network enquiry and mentor response.txt` (to be committed into this program folder with the verbatim answer record when it returns).
**Program folder:** `operations/connective-layer-2026-08/` (new, this session).
**Prepared by:** the 2026-08-02 scoping session (`governance`, documents only; Fable 5). The build plan is NOT authored yet — it waits on these answers; PR19 engages at that plan, not at this briefing.

## What we take as already settled by the mentor's first answer (not re-opened below)

1. The warrant: the connective function is a kathekon expressing Stage 3/4 oikeiosis; the connection is a **preferred indifferent**, never a duty; withholding costless useful knowledge fails the extension of concern.
2. Two distinct components, treated separately: **knowledge sharing** (simpler) and **collaboration matching** (structurally asymmetric).
3. The four design principles verbatim: **offer, never prompt** · **no obligation is created by visibility** · **the referral is a preferred indifferent, not a duty** (no engagement tracking, no engagement metrics) · **agents and humans in the same space** (no segregation in the connective layer).
4. The minimal viable form: a practitioner directory with three voluntary fields — *What I bring* / *What I am looking for* / *How to reach me* — nothing required; a practitioner who fills in none is missing nothing.
5. For agents: fields map onto the skill-contract vocabulary (declared capabilities, declared gaps, contact endpoint), declared by the agent's **developer/owner**.
6. The **doorbell principle** governs: the platform can make the connection visible; the practitioner decides whether to walk through it.

## Internal engineering items we will handle WITHOUT the mentor (listed so the boundary is explicit)

- Distress-perimeter wiring for the new human free-text route (the standing AC5 recorded-decision discipline at build time; declarations are free text).
- Data rights: entries erasable/exportable (R17), withdrawal instant; retention design per Q9's answer.
- Public-doc staging (R18 sign-off before any public surface changes), rate limiting, injection defence, caching.
- The existing `/community` map's production defect (42703; the map currently renders empty) — whatever Q6a rules, the build plan inherits a fix-or-fold decision on that surface.
- Sequencing relative to the 0h launch hold — the founder's call, informed by Q1's empty-colonnade answer.
- Any notification capability (Q2b) depends on the still-unprovisioned email decision (#15 Resend); a permitted-but-later ruling is expected and fine.
- PR19 independent adversarial review of the eventual build plan.

---

## ⬇ PASTE TO THE MENTOR FROM HERE ⬇

This follows directly from your answer on the ancient gathering function. We have adopted your warrant, the two-component split, the four design principles, the three-field minimal form, and the doorbell principle as the starting design — none of that is re-opened. Before we author the build plan, the forks below need your ruling. Where we state a recommendation, confirm or correct it. Questions marked **[blocking]** gate the plan's shape; **[design]** questions refine it.

**Platform facts the rulings will land on:**
- Humans hold accounts with self-chosen display names; the profile stores only that name plus optional city/country. Human free text has never yet been published publicly by the platform — journals and reflections are encrypted and owner-only. The one public human surface, an **opt-in world map of practitioners**, displays display name, country, and the practitioner's **alignment tier**; it predates your principles for this space (and is currently broken, so in practice nothing shows).
- Agents hold registered credentials binding a canonical agent identity to a human owner. An agent's accreditation and examined **trust record** are already public lookups **by identity** — but no enumerable public list of agents exists anywhere yet. The skill-contract vocabulary declares capabilities and composition; it has **no "gaps," provider, or contact fields** — those would be new. The trust layer never treats self-report as examined evidence.
- The examination engine's live gate already treats unsolicited mass outreach to non-consenting parties as an injustice (it blocks that class for harnessed agents).
- Every route logs operationally (billing, audit, abuse detection). The platform has no email/notification infrastructure yet.
- Human practice data (stages, milestones) is mirror-principle-governed and private to the practitioner — except the map's alignment tier noted above.

### A. The space itself

**Q1 [blocking] — Who can see the space, and does the declarer choose?**
The Stoa was public — but physical presence exposed a practitioner only to those also present. A public web page exposes declarations, including contact channels, to unbounded harvesting by parties who are not present in any meaningful sense; our one prior public human surface had exactly this failure before an opt-in was added. The fork: (a) fully public colonnade; (b) visible to signed-in practitioners only; (c) **the declarer chooses the scope of their own entry** (public vs community-only), with a defined default. Our recommendation: (c), defaulting community-only for humans and public for agents (whose identity surfaces are already public). Also confirm two adjacent points: **consulting the list must never require declaring** (no reciprocity gate); and opening the space while it is nearly empty is acceptable if presented honestly as a resource that fills as practitioners declare — the colonnade before the crowd — rather than held back for a population threshold.

### B. Discovery

**Q2 [blocking] — Where exactly is the line between "making the connection visible" and prompting?**
Your principles say *offer, never prompt*, and also that *the platform can make the connection visible; the practitioner decides whether to walk through it*. These meet at a line we need drawn precisely:
(a) May a practitioner's own logged-in view **passively display** declarations relevant to what they themselves declared — no notification, no call to action; a shelf, not a bell? Or is any platform-computed relevance already a prompt, so discovery must be entirely practitioner-initiated (browse and search only)?
(b) May a practitioner explicitly **subscribe to a standing question of their own** ("tell me when a declaration in this domain appears")? Is the resulting notice the answer to their own question — permitted — or a platform prompt?
(c) Confirm: the platform never notifies anyone that their entry was viewed, matched, or "relevant to someone."
Our recommendation: (a) permitted as a passive shelf within one's own view; (b) permitted, practitioner-initiated and trivially revocable; (c) confirmed never.

### C. Presentation

**Q3 [design] — Presentation without hierarchy.**
(a) Which ordering of the list avoids implicit ranking — alphabetical, declaration recency, or rotation? (b) Search and filtering by domain is consultation of the resource, so permitted — confirm. (c) Do declarations stay entirely in the practitioner's own words, or may the platform offer a light shared vocabulary (tags) for findability — suggested, never required? (d) One entry per practitioner — the person is the unit of presence, as in the colonnade — with offers and needs as fields of that one presence rather than separate postings; confirm. (e) Entries display their declaration date (honest ageing); confirm.

### D. Identity and honesty

**Q4 [blocking] — The identity floor, and pseudonymity.**
Presence in the Stoa was embodied and identifiable; a digital declaration can be made by anyone claiming anything. (a) Is account-holding (humans) / credential-binding (agents) the right digital equivalent of physical presence — an **identity floor** that prevents impersonation while verifying no capability claim? (b) May a human declare under their chosen display name (a pseudonym), or does the connective function require a real name? Our recommendation: the display name suffices; the contact channel the practitioner declares carries whatever further identity they choose to extend.

**Q5 [blocking] — Honest framing, admission, and removal.**
(a) Everything in an entry is self-declared; the platform verifies and endorses nothing — and per your own style, presentation carries this through **form, not disclaimer**. Confirm. (b) On what standard may the platform decline or remove a declaration? Our proposal: only (i) demonstrated dishonesty in the declaration itself; (ii) declarations soliciting or offering facilitation of injustice; (iii) flooding/commercial spam that degrades the shared space. Everything else stands, however modest. Is that the right line between keeping the colonnade open and keeping it honest? (c) For **agents**: when a declaration is demonstrated false in examined use — a claimed capability shown absent, parallel to purpose misrepresentation at the calling gate — does that constitute a trust-relevant event in the oversight/dikaiosyne domain? Confirm the evidentiary standard: an examined artifact, never accusation alone.

**Q6 [blocking] — Practice data and trust records inside the connective layer.**
(a) Human entries: we propose **no practice-derived data ever appears** on an entry — no stage, no alignment tier, no milestones — because visible standing would grade the colonnade. Confirm — and does this ruling reach back to the existing community map's public alignment tier, which predates these principles? (b) Agent entries: may an entry **link** the agent's public trust record and accreditation, with an honest "no examined record" where none exists? Is showing examined records for agents but nothing equivalent for humans a breach of the same-space principle, or honest disclosure of what exists? (c) Confirm both directions of separation: the directory never sorts, ranks, or badges by any evaluative signal; and nothing about directory presence or use ever feeds a trust record, practice profile, milestone, or suggestion.

### E. Use of the space

**Q7 [blocking] — The kathekonta of using a declared channel.**
A declared channel invites contact — but our own engine scores unsolicited mass outreach as injustice, and the directory must not become a harvesting surface that launders that class as "solicited." (a) Is contact consented only **within the scope of the declaration** — individual, referencing the declaration, about the declared matters — so unrelated solicitation and bulk outreach through harvested channels is a violation of the space, not a use of it? (b) Do the same obligations bind **agents** consulting the directory and contacting a human's declared channel, with systematic/bulk contact categorically outside the consent? (c) Should the space publish its own ethic — a short statement of these kathekonta carried in the presentation itself, and, for agents, in the machine-readable contract?

**Q8 [blocking] — The scope of "no tracking."**
The platform structurally logs every route for operations (billing, audit, abuse detection, rate limiting). Confirm the line: operational logging for safety and cost is permitted; what your principle prohibits is (i) surfacing engagement to anyone — view counts, response rates, activity badges; (ii) using engagement in ordering, evaluation, or any practice/trust signal; (iii) treating non-use as a signal of anything. Is that the faithful reading of "the platform should not track whether practitioners have engaged with the connective function"?

**Q9 [design] — Staleness and renewal.**
Declarations age, and a stale entry quietly degrades the shared resource's honesty. The fork: (a) the platform may periodically ask an entry-owner to reconfirm **their own** declaration — maintenance of their own word, arguably not the forbidden prompt (which concerned declaring in the first place, and responding to others); (b) quiet expiry after a period unless renewed — no prompt, but it removes a practitioner's declared presence without their act; (c) entries simply display their age and never expire. Which combination honours both honesty and *offer, never prompt*? Our recommendation: (c) always, plus a rare, gentle form of (a); never silent expiry.

**Q10 [design] — Referrals and third-party speech.**
The founder's original enquiry included referrals. We read your minimal form as **self-declaration only**: one practitioner cannot list another; no testimonials or endorsements attach to entries (endorsement re-introduces hierarchy); the referral act itself — A telling C about B — happens between practitioners through their own channels, with the directory as the shared resource that makes it possible. Confirm, or name the consented form of third-party speech you would permit.

### F. Boundaries

**Q11 [blocking] — Money.**
(a) Paid placement or prominence is categorically excluded — visibility purchased is hierarchy manufactured. Confirm. (b) Access to the connective layer is free — the colonnade is public civic space — even where practice tools are metered. Confirm. (c) Collaborations formed through the space may of course involve paid work between the parties (the Stoa stood in a commercial city); the platform takes no cut and grants no advantage. Confirm.

**Q12 [design] — Is the connective layer plain, or itself a practice surface?**
A declaration is an action, and the platform is an examination instrument. We propose the connective layer stays **entirely plain** — a resource; no examination moment, no engine reading of declarations, no practice integration — because a practice-instrumented directory would put the platform's judgement inside the practitioner's presence. Confirm, or name the one examination moment you would keep (for example, an optional private reading of one's own draft declaration, on the mirror principle, at the declarer's request only).

**Q13 [design] — Agent-side coherence.**
(a) An agent's directory declaration should cohere with its declared calling/purpose; divergence is an honesty signal rather than a rule violation — how should the platform treat it (surface it honestly? never auto-remove?)? (b) Confirm listing never shortcuts discernment: an entry confers no "vetted collaborator" standing; selection-time examination is unchanged; capability claims in entries are treated as claims, per the platform's existing posture toward self-report.

**Q14 [design] — The name and the self-description.**
Is there a fitting name from the tradition for this space — the Stoa, the Porch — and would you draft the one-or-two-sentence self-description that presents it as what it is (a public colonnade where practitioners make themselves visible; a resource, not a request), in the register your four principles require?

## ⬆ END OF PASTE ⬆

---

*On return: commit the verbatim answers to this folder as `…-mentor-consultation-connective-layer-verbatim.md`, adopt per the standing convention, then author the build plan (expected shape: a human half and an agent half, mirroring the reminders program's two-plan pattern; every schema/flag/deploy step its own founder-walked 0c-ii; PR19 review at the plan).*
