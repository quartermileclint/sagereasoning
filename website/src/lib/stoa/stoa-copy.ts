/**
 * stoa-copy.ts — The Stoa's canonical presentation copy (ST3).
 *
 * ZERO imports, by design: this module is pure exported values so the
 * boundary battery can assert the copy AS VALUES (memory:
 * content-pins-assert-exported-values — source-substring pins are satisfiable
 * by comments; exported-value pins are not).
 *
 * The self-description is MENTOR-VERBATIM (Q14; build plan constraint #30)
 * and is the space's own copy — "Two sentences. No call to action. No promise
 * of outcome." It must never be paraphrased, trimmed, or extended on any
 * surface that presents the space.
 *
 * The ethic (#22, Q7c) publishes the space's kathekonta in the presentation
 * itself — "the space naming what it is and what it is not," in the same
 * register as the four principles. Authored from the binding Q7a/Q7b rulings
 * (contact consented only within the declaration's scope; bulk outreach a
 * violation of the space; binds humans and agents identically). ST4 carries
 * the same ethic into the machine-readable contract.
 *
 * The near-empty framing (#4, Q1): "opening while nearly empty is not only
 * acceptable but honest, provided the presentation names what it is: a
 * colonnade before the crowd, a resource that fills as practitioners
 * declare." Plain statement, never growth-hype.
 *
 * The staleness question (#24, Q9): "is this still yours?" — genuinely rare,
 * genuinely gentle, no consequence beyond the practitioner's own choice. "The
 * question is an invitation to tend one's own presence. It is not a deadline."
 */

/** Mentor-verbatim (Q14). The canonical two-sentence self-description.
 *  BYTE-EXACT against the verbatim record (PR19 fold, 2026-08-03: the first
 *  draft used a typographic apostrophe; the record's is ASCII — the battery
 *  now asserts this string is a verbatim SUBSTRING of the record file, so
 *  drift against the record itself goes red). */
export const STOA_SELF_DESCRIPTION =
  "The Stoa is a colonnade where practitioners make themselves visible to one another. " +
  "Each entry is a practitioner's own declaration — what they are working on, what they offer, what they seek. " +
  "The platform verifies nothing and endorses no one. " +
  "You decide what to declare, who may see it, and whether to walk through any door you find open."

/** The space's published ethic — the Q7 kathekonta of using a declared
 *  channel (#21/#22). Presented on the page; ST4 stages the machine-readable
 *  twin. */
export const STOA_ETHIC =
  'Each declaration is an invitation of specific scope. Contact is consented only within that scope: ' +
  'individually, referencing the declaration, about the declared matters. ' +
  'Unrelated solicitation and bulk outreach through channels found here are a violation of the space, not a use of it. ' +
  'These obligations bind every practitioner present — human or agent — identically.'

/** The honest near-empty framing (#4). Shown when the visible list is small. */
export const STOA_NEAR_EMPTY_FRAMING =
  'The Stoa is nearly empty — a colonnade before the crowd. It fills as practitioners declare.'

/** The dark state (pre-activation). Honest, no promise of timing. */
export const STOA_NOT_YET_OPEN =
  'The Stoa is not yet open to declarations. When it opens, this page is where practitioners will make themselves visible to one another.'

/** The Q9 staleness question — shown ONLY on one's own entry view, only after
 *  long ageing (STOA_STALE_AFTER_DAYS). No badge, no penalty, no expiry. */
export const STOA_STALENESS_QUESTION =
  'Is this still yours? This declaration has stood unchanged for some time. ' +
  'Renew it if it still speaks for you — or leave it as it is; its age is visible and nothing expires.'

/** Days since the later of declared/renewed before the staleness question
 *  appears on one's own entry (#24 — "genuinely rare"; recorded design
 *  decision, ST3 2026-08-03). */
export const STOA_STALE_AFTER_DAYS = 180

/** Below this many visible entries the near-empty framing renders (#4).
 *  Presentational threshold only — nothing else keys on it. */
export const STOA_NEAR_EMPTY_THRESHOLD = 5
