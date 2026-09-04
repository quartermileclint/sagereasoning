/**
 * at-action-seam.ts — the at-action → S4 consumption seam (register P1, RULED
 * 2026-09-04). The sibling of `interventionInputFromS3`, serving the ENFORCE path.
 *
 * BINDING SPEC (verbatim wins):
 *   operations/trust-layer-2026-07/2026-09-04-mentor-ruling-P1-decision-table-input-verbatim.md
 * on the scope document
 *   operations/trust-layer-2026-07/2026-09-04-P1-decision-table-input-SCOPE-FOR-RULING.md
 *
 * ─── What was ruled ─────────────────────────────────────────────────────────
 * "The at-action verdict is the table's input for the per-action rows, filtered
 * by Q3's kathekon-engagement threshold before any justice surface is reported."
 * A verdict meeting no kathekon-engagement condition reports
 * `justiceSurface: 'none'`, NOT `'unevaluated'` — Q2's zero-false-positive floor
 * on kathekon-free actions is thereby RESTORED, and the 129-of-130 figure the S11
 * register carried is identified as the UNFILTERED composition Q3 exists to forbid.
 * The aggregate trust state is NOT the per-action input; its consumer is Q7 depth
 * calibration (`readTrustVerdict`), undisturbed. `interventionInputFromS3` is not
 * wrong — it was wired to the wrong consumer for enforce; it keeps serving the
 * trust-record surface.
 *
 * ─── Why a sibling FILE, not a function in intervention-engine.ts ───────────
 * intervention-engine.ts states (and the S4 review verified) that it carries
 * import-type-only dependencies — no I/O, no env, no clock, no runtime import —
 * so its MEASURE invariant is structural. This seam needs two RUNTIME imports
 * (the canonical predicate + the engine's own justice reducer). Putting them in
 * a sibling keeps the engine's invariant exactly as stated and byte-identical.
 *
 * ─── The filter, precisely ──────────────────────────────────────────────────
 * The justice surface reported to the table is the reducer's own reading
 * (`deriveWorstJusticeOutcome` — the same call `assessKathekonEngagement` makes,
 * so "justice surface" means exactly what the engine means), gated on the
 * predicate's JUSTICE arms: Arm 1 (`justiceSurfacePresent` — TWICE-NARROWED:
 * ≥1 identified circle BEYOND self_preservation) OR Arm 2 (`violatedObligation`
 * — unchanged by both narrowings; adverse justice evidence is never dropped).
 * If neither fired, the surface is `'none'` regardless of what the reducer read.
 *
 * DISCLOSED DESIGN DECISION (the one point a reviewer should press): the ruling
 * says "filtered by Q3's kathekon-engagement threshold", and Q3's threshold is
 * the four-arm OR (`engaged`). This seam gates the JUSTICE SURFACE on the two
 * JUSTICE arms only, not on `engaged`. The reason: Arms 3 (proximity ≤ habitual)
 * and 4 (sub-species passion) are not justice findings — a habitual verdict
 * with a zero-circle dikaiosyne tag is exactly the class R11 says is NOT a
 * justice surface, and reporting `'unevaluated'` there because Arm 3 happened to
 * fire would re-manufacture the do-not-proceed the ruling removes. Arm 3 reaches
 * the table through `proximity` (the habitual-pause row); Arm 4 has no table row
 * and is carried on the output for the record. Under this reading a verdict
 * with `engaged === false` ALWAYS reports `'none'` (the ruled case, pinned), and
 * a verdict engaged via Arm 1/2 reports the reducer's status (pinned per status).
 *
 * ─── What this seam does NOT do ─────────────────────────────────────────────
 * - It does not pass `requireBeyondSelfCircle` to the reducer (register D4). The
 *   predicate deliberately does not either; Arm 1 applies its own beyond-self
 *   test. The reducer's narrowing is a LEDGER-emission question, ruled separately.
 * - It does not bind anything. The recommendation it feeds is MEASURE; ENFORCE
 *   is S11, refused; P4/P5/P6 are unmoved by this seam's existence.
 * - It is not wired to any live caller in this build. Its first consumer is the
 *   S11 write-boundary G6(a) qualification, when licensed.
 */

import type { Layer2Assessment } from '@/lib/translation-sandwich/layer2-mechanisms'
import type { LoopDepthTier } from '@/lib/translation-sandwich/reason-loop-closure'
import type { InterventionInput, JusticeSurfaceState } from './intervention-engine'
import {
  assessKathekonEngagement,
  kathekonSignalsFromAssessment,
  type KathekonEngagement,
} from './kathekon-engagement'
import { deriveWorstJusticeOutcome } from './derive-trust-events'

/** The fields of a Layer-2 assessment this seam (and the predicate) read. */
export type AtActionAssessment = Pick<
  Layer2Assessment,
  'katorthoma_proximity' | 'virtue_domains_engaged' | 'oikeiosis' | 'passion_diagnosis'
>

/**
 * The seam's output: a complete `InterventionInput` plus the evidence the
 * ruling asks the record to keep — the predicate result the filter keyed on,
 * and the UNFILTERED reducer read (so the 130-record reclassification can be
 * re-run "as evidence, not as readiness" without re-deriving anything).
 */
export interface AtActionInterventionInput extends InterventionInput {
  /** The canonical Q3 predicate result this input was filtered on. */
  kathekonEngagement: KathekonEngagement
  /** The reducer's own justice read BEFORE the filter (`'none'` ⇔ reducer null).
   *  Differs from `justiceSurface` exactly when the filter suppressed a surface. */
  justiceSurfaceUnfiltered: JusticeSurfaceState
  /** True ⇔ the filter changed the reported surface (unfiltered ≠ reported). */
  justiceFiltered: boolean
  /** Provenance marker for the record. */
  seam: 'at-action'
}

/**
 * Map an at-action Layer-2 assessment into the decision table's input. Pure.
 *
 * @param args.assessment  the at-action verdict (the signed assessment's inner body)
 * @param args.engagement  OPTIONAL precomputed predicate result. When the caller
 *   already ran `assessKathekonEngagement` on this verdict (the S11 G6(a) path
 *   does), pass it so the seam and the loop bound key on ONE reading. Omitted ⇒
 *   computed here from the same projection.
 */
export function interventionInputFromAtAction(args: {
  assessment: AtActionAssessment
  engagement?: KathekonEngagement
  originalDepth?: LoopDepthTier
  habitualReExaminationCount?: number
}): AtActionInterventionInput {
  const engagement =
    args.engagement ?? assessKathekonEngagement(kathekonSignalsFromAssessment(args.assessment))

  // The reducer reads only the four projected fields, each defensively; the cast
  // is scoped to that (the predicate makes the identical cast for the identical
  // reason). No narrowing flag — see the header.
  const raw = deriveWorstJusticeOutcome([
    args.assessment as unknown as Parameters<typeof deriveWorstJusticeOutcome>[0][number],
  ])
  const justiceSurfaceUnfiltered: JusticeSurfaceState = raw?.obligationStatus ?? 'none'

  const justiceArmFired = engagement.justiceSurfacePresent || engagement.violatedObligation
  const justiceSurface: JusticeSurfaceState = justiceArmFired ? justiceSurfaceUnfiltered : 'none'

  return {
    proximity: args.assessment.katorthoma_proximity,
    justiceSurface,
    // A single at-action verdict has one source — there is no S3 combine here, so
    // a source conflict is structurally impossible on this seam.
    sourceConflict: false,
    originalDepth: args.originalDepth,
    habitualReExaminationCount: args.habitualReExaminationCount,
    kathekonEngagement: engagement,
    justiceSurfaceUnfiltered,
    justiceFiltered: justiceSurface !== justiceSurfaceUnfiltered,
    seam: 'at-action',
  }
}
