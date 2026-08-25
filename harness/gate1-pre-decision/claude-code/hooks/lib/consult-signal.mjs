/**
 * SageReasoning — Gate 1 CONSULT-SIGNAL classification (H3, IW-7 opening 3 phase two).
 * Governing design: `operations/reflections-examination-2026-08/2026-08-25-signal-quality-gap-scope.md`
 * §2 (the confidence proxy, mentor-confirmed real, "a confidence proxy, not a discriminant") and
 * `operations/reflections-examination-2026-08/2026-08-25-mentor-ruling-signal-quality-gap-verbatim.md`
 * (the ruling: acceptable for opening 3 phase two ONLY, on the constraint that a low-confidence read
 * must be genuinely distinguishable — never silently absorbed — from a high-confidence one).
 *
 * PURE. No fs/env/network. Operates on the SAME `verdict` shape framing-core's extractVerdict()
 * returns (assessment.assessment / assessment — the object renderFrame() reads) and the SAME
 * top-level `extraction` object fetchFrame's `r.body.extraction` carries (the full Layer1Schema —
 * confirmed against website/src/lib/translation-sandwich/layer1-extractor.ts:581-587 and
 * parallel-run.ts:949,1107, which set `extraction: layer1Schema` on every /api/reason response).
 *
 * THE CONDITION (the ruling, verbatim): "did any runConsult verdict this session read
 * katorthoma_proximity at reflexive or habitual, or kathekon_quality at contrary?" — two disjoint
 * triggers, not one:
 *   (a) proximity reflexive|habitual  — a direct adverse engine reading. The sparse-extraction-default
 *       problem the scope names is specific to the KATHEKON dimension (satisfiedCount===0 ⇒
 *       'contrary' ⇒ is_kathekon:false, layer2-mechanisms.ts:1255-1303) — no equivalent ambiguity was
 *       named for proximity itself, so this basis is treated as HIGH confidence unconditionally.
 *   (b) kathekon_assessment.quality === 'contrary' — the EXACT condition layer2-mechanisms.ts emits
 *       the sparse-extraction justification string under. Confidence here is NOT unconditional — it is
 *       graded by whether the extraction's OTHER arrays (passions_present, oikeiosis_circles_engaged,
 *       value_categories_at_stake, causal_stage_evidence) are also empty (LOW — looks like a general
 *       extraction failure) or some are populated (HIGH — the extractor engaged substantively
 *       elsewhere and specifically found nothing kathekon-relevant).
 *
 * NAMED HONESTLY (the scope's own §5 limit, carried forward): a rich extraction elsewhere does not
 * PROVE the kathekon dimension was examined correctly — this narrows the false-negative risk, it does
 * not eliminate it. HIGH here means "confident this is not a sparse-extraction default," never
 * "certain this is correct."
 */

// The four Layer1Schema arrays outside the kathekon dimension that the proxy cross-checks. Matches
// the scope document §2 exactly — deliberately NOT kathekon_factors (that IS the dimension being
// checked) and deliberately NOT control_filter_elements/urgency_indicators (the scope's proposal
// names only these four).
export const CONFIDENCE_PROXY_ARRAYS = [
  "passions_present",
  "oikeiosis_circles_engaged",
  "value_categories_at_stake",
  "causal_stage_evidence",
];

/**
 * A confidence read for a kathekon-contrary verdict, derived from whether the extraction engaged
 * substantively elsewhere. Returns 'high' | 'low'. A missing/malformed extraction object (should not
 * happen on a real 200, but the hook must never throw on a malformed response) reads 'low' — the
 * conservative direction, matching "all empty ⇒ low confidence."
 */
export function computeKathekonConfidence(extraction) {
  if (!extraction || typeof extraction !== "object") return "low";
  for (const key of CONFIDENCE_PROXY_ARRAYS) {
    if (Array.isArray(extraction[key]) && extraction[key].length > 0) return "high";
  }
  return "low";
}

/**
 * Classify one consult verdict for the close-hook content-variation condition. Returns:
 *   { fires: false }                                                     — neither trigger present.
 *   { fires: true, basis: 'proximity', confidence: 'high', proximity }   — trigger (a).
 *   { fires: true, basis: 'kathekon', confidence: 'high'|'low', quality } — trigger (b), graded.
 * `fires` alone answers "did this verdict cross the phase-two condition"; `confidence` is what H4's
 * content selection reads to decide whether to name the finding or stay generic/silent (the ruling's
 * constraint — never silently absorb a low-confidence read into high-confidence wording).
 */
export function classifyConsultSignal(verdict) {
  const v = verdict && typeof verdict === "object" ? verdict : {};
  const proximity = typeof v.katorthoma_proximity === "string" ? v.katorthoma_proximity : null;
  if (proximity === "reflexive" || proximity === "habitual") {
    return { fires: true, basis: "proximity", confidence: "high", proximity };
  }
  const ka = v.kathekon_assessment && typeof v.kathekon_assessment === "object" ? v.kathekon_assessment : {};
  const quality = typeof ka.quality === "string" ? ka.quality : null;
  if (quality === "contrary") {
    return { fires: true, basis: "kathekon", confidence: null, quality }; // confidence set by the caller via computeKathekonConfidence(extraction)
  }
  return { fires: false, basis: null, confidence: null };
}

// Confidence rank, for deciding whether a NEW consult signal should supersede an already-recorded
// one for this session. High-confidence findings must never be silently overwritten by a later
// low-confidence one (the ruling's "did ANY verdict" phrasing — the strongest evidence this session
// produced should be what the close turn reflects, not merely the most recent).
export function confidenceRank(c) {
  return c === "high" ? 2 : c === "low" ? 1 : 0;
}

/**
 * Given a candidate classification and the currently-recorded one (or null), decide whether the
 * candidate should replace it. PURE — the caller does the actual read/write.
 */
export function candidateSupersedes(existing, candidate) {
  if (!existing) return true;
  return confidenceRank(candidate.confidence) > confidenceRank(existing.confidence);
}
