/**
 * SageReasoning — Gate 1 FALSE-HOLD CAPTURE (H3, at-action). Trust Layer S11
 * observation period. Governing design: ADR-013 §7/§11 (the 2026-07-12 mentor
 * S11 verdict — the readiness standard; verbatim wins) + the observation-period
 * prompt (2026-07-12).
 *
 * WHAT IT IS
 *   The measuring apparatus for the S11 readiness standard's part (3) — a
 *   MEASURED false-hold rate on the at-action examination over the live
 *   distribution. The at-action hook fetches the full /api/reason verdict, injects
 *   it into the conversation frame, then discards everything but `proximity=` to
 *   gate1.log. This module durably captures the verdict's kathekon-engagement
 *   signals + the loop event, so the TS predicate (assessKathekonEngagement) can
 *   later classify each hold as a candidate false positive vs. correct hold.
 *
 *   A "hold" is a correction loop the eventual ENFORCE regime would bind: an
 *   at-action examination with loopEvent ∈ {opened, reopened}. This module
 *   captures EVERY at-action consult (the denominator = the live distribution),
 *   tagged with its loopEvent; the classification is done in TS from these signals.
 *
 * DISCIPLINE (KG1 / R18): every function FAILS SOFT — a capture that throws is
 *   swallowed. Nothing here touches stdout/exit/frame — that is the hook's. The
 *   capture is MEASURE-only: it labels nothing and binds nothing; the classifier
 *   lives once in TS (website/.../kathekon-engagement.ts). Flag-gated by
 *   cfg.falseHoldCapture (GATE1_FALSE_HOLD_CAPTURE) — OFF by default ⇒ H3 is
 *   byte-identical to pre-S11.
 *
 * No third-party dependencies. Node 18+.
 */

import { mkdirSync, appendFileSync } from "node:fs";
import { join } from "node:path";

/** One durable file for the whole 7-day accumulation (NOT per-session). */
export const FALSE_HOLD_RECORD_FILE = "false-hold-record.jsonl";

export function falseHoldRecordPath(cfg) {
  return join(cfg.stateDir, FALSE_HOLD_RECORD_FILE);
}

function sanitize(s) {
  return String(s || "no-session").replace(/[^a-zA-Z0-9._-]/g, "_");
}

/**
 * Project a /api/reason verdict (the extracted Layer-2 assessment) into the lean
 * kathekon-engagement signal shape. A PURE field projection — the JS mirror of
 * website/.../kathekon-engagement.ts kathekonSignalsFromAssessment. It decides
 * which fields the TS predicate reads, NEVER how they combine (that is
 * assessKathekonEngagement, in TS, the single classifier). Keep the two in step;
 * the TS battery's adapter test pins the projection's shape.
 */
export function kathekonSignalsFromVerdict(verdict) {
  const v = verdict && typeof verdict === "object" ? verdict : {};
  const circles =
    v.oikeiosis && Array.isArray(v.oikeiosis.relevant_circles) ? v.oikeiosis.relevant_circles : [];
  const passions =
    v.passion_diagnosis && Array.isArray(v.passion_diagnosis.passions_detected)
      ? v.passion_diagnosis.passions_detected
      : [];
  return {
    proximity: typeof v.katorthoma_proximity === "string" ? v.katorthoma_proximity : null,
    virtueDomainsEngaged: Array.isArray(v.virtue_domains_engaged)
      ? v.virtue_domains_engaged.filter((d) => typeof d === "string")
      : [],
    obligationStatuses: circles.map((c) =>
      c && c.obligation_assessment && typeof c.obligation_assessment.status === "string"
        ? c.obligation_assessment.status
        : null,
    ),
    // v3 (the 2026-07-19 self-circle narrowing): the circle NAME, index-aligned
    // with obligationStatuses (same source array). The narrowed Arm 1 reads
    // circle IDENTITY (≥1 circle beyond self_preservation); v1/v2 records lack
    // this field, so the TS report null-fills them and BRACKETS their
    // classification instead of certifying one reading. Live verdicts always
    // carry the name (OikeiosisCircleAssessment.circle is required); null =
    // honest unknown, never guessed.
    circles: circles.map((c) =>
      c && typeof c.circle === "string" && c.circle.trim() !== "" ? c.circle : null,
    ),
    subSpeciesPassions: passions
      .map((p) => (p && typeof p.sub_species === "string" && p.sub_species.trim() !== "" ? p.sub_species : null))
      .filter((s) => s !== null),
  };
}

/**
 * Build one false-hold observation record from an at-action consult. Carries the
 * raw signals (for the TS predicate + replay), the loop event (the hold signal),
 * and a truncated action preview (for the day-7 human cross-check — the founder's
 * own loop; capped at 160 chars). Never quotes the full verdict (PII-light).
 */
export function buildFalseHoldRecord({ verdict, sessionId, tool, depth, loopEvent, actionText, carriedPrior, nowIso, inputClass, regime, composedChars }) {
  const ka =
    verdict && typeof verdict === "object" && verdict.kathekon_assessment && typeof verdict.kathekon_assessment === "object"
      ? verdict.kathekon_assessment
      : {};
  return {
    // v2 (S11b, 2026-07-18): + inputClass / extractionRegime / composedChars —
    // the ADR-014 extraction-regime version-mark + the item-5 input-class marker
    // (anti-laundering: downstream longitudinal reads see the input class per
    // row, and delta computations refuse to compare across a regime boundary).
    // v3 (2026-07-19, the self-circle narrowing): + signals.circles (the
    // per-circle NAME the narrowed Arm 1 reads). v1 records (the frozen
    // 2026-07-17 buffer) and v2 records predate their respective fields; the
    // report accepts all three schemas and brackets circle-less records.
    schema: "false-hold-record-v3",
    capturedAt: typeof nowIso === "string" && nowIso ? nowIso : new Date().toISOString(),
    session: sanitize(sessionId),
    tool: typeof tool === "string" ? tool : "",
    depth: typeof depth === "string" ? depth : "",
    loopEvent: typeof loopEvent === "string" ? loopEvent : "none",
    actionPreview: typeof actionText === "string" ? actionText.slice(0, 160) : "",
    inputClass: typeof inputClass === "string" ? inputClass : "unknown",
    extractionRegime: typeof regime === "string" ? regime : "unknown",
    composedChars: Number.isFinite(composedChars) ? composedChars : null,
    signals: kathekonSignalsFromVerdict(verdict),
    // is_kathekon / quality are the SYMPTOM of the false-positive class, not a Q3
    // arm — captured for the human cross-check + context, NOT read by the predicate.
    kathekon: {
      isKathekon: typeof ka.is_kathekon === "boolean" ? ka.is_kathekon : null,
      quality: typeof ka.quality === "string" ? ka.quality : null,
    },
    carriedPrior: !!carriedPrior,
  };
}

/**
 * P8a (2026-08-17) — build one GUARD-PATH observation record.
 *
 * WHY THIS EXISTS: register P5 records that part (3) of the readiness standard has
 * no denominator because "the genuinely dangerous actions are on the guard path,
 * which writes no record". The capture was CONSULT-path only. This is the other
 * half of the instrument.
 *
 * SCHEMA v4, GUARD RECORDS ONLY — `buildFalseHoldRecord` above is deliberately
 * untouched and consult records stay v3. Grounds: the consult path is the
 * measured instrument with 37 existing pins and a frozen evidence buffer; a
 * uniform bump would put both at risk for no gain, since the report already
 * carries a multi-version whitelist and `path` is what actually distinguishes the
 * two populations. `recordHash` (false-hold-observation-report.ts) does not hash
 * `schema`, so neither choice would have moved an existing hash — this one simply
 * touches less.
 *
 * EVERY NEW FIELD IS TOP-LEVEL, and that is load-bearing rather than stylistic:
 * `recordHash` hashes `JSON.stringify(r.signals)`, so anything added INSIDE
 * `signals` would re-hash every existing v1/v2/v3 record and break ingest
 * idempotency. Top-level additions leave all prior hashes byte-identical.
 *
 * `captureBasis` is honest about the guard's fail-safe branches: an
 * engine-unavailable or tier-1 pause verdict carries NO assessment and NO
 * proximity, so it cannot be classified. Those are recorded as
 * `no_assessment` and EXCLUDED from the rate rather than silently dropped —
 * the coverage/loss accounting the new-window scoping note asks for.
 */
export function buildGuardHoldRecord({ guard, sessionId, tool, actionText, nowIso, regime, denied }) {
  const assessment = guard && typeof guard === "object" && guard.assessment && typeof guard.assessment === "object"
    ? guard.assessment
    : null;
  const ka =
    assessment && assessment.kathekon_assessment && typeof assessment.kathekon_assessment === "object"
      ? assessment.kathekon_assessment
      : {};
  const signals = kathekonSignalsFromVerdict(assessment);
  return {
    schema: "false-hold-record-v4",
    // The population marker. The consult and guard denominators are NOT
    // commensurable (a consult hold is an advisory opening a correction loop; a
    // guard hold is an enforced deny), so the report must be able to split them.
    path: "guard",
    capturedAt: typeof nowIso === "string" && nowIso ? nowIso : new Date().toISOString(),
    session: sanitize(sessionId),
    tool: typeof tool === "string" ? tool : "",
    depth: "",
    // The guard maintains NO loop state (readLoopState/advanceLoopState live only
    // in runConsult), so there is no loop event to report. Recorded honestly as
    // 'none'; the hold is carried by `guardHold` below, never inferred from this.
    loopEvent: "none",
    actionPreview: typeof actionText === "string" ? actionText.slice(0, 160) : "",
    inputClass: "guard_action",
    extractionRegime: typeof regime === "string" ? regime : "unknown",
    composedChars: null,
    signals,
    kathekon: {
      isKathekon:
        typeof ka.is_kathekon === "boolean"
          ? ka.is_kathekon
          : typeof guard?.isKathekon === "boolean"
            ? guard.isKathekon
            : null,
      quality:
        typeof ka.quality === "string"
          ? ka.quality
          : typeof guard?.kathekonQuality === "string"
            ? guard.kathekonQuality
            : null,
    },
    carriedPrior: false,
    // ONLY a deny is a hold. A caution/pause verdict ALLOWS the tool, so counting
    // it would make this denominator incommensurable with the consult one.
    guardHold: denied === true,
    guardOutcome: typeof guard?.recommendation === "string" ? guard.recommendation : null,
    captureBasis: assessment && typeof signals.proximity === "string" ? "assessment" : "no_assessment",
  };
}

/**
 * Append one observation record to the durable JSONL. Fail-soft (mirrors
 * session-state.mjs): a failed capture NEVER breaks the hook. Returns whether the
 * append landed (for tests; the hook ignores it).
 */
export function appendFalseHoldRecord(cfg, record) {
  try {
    mkdirSync(cfg.stateDir, { recursive: true });
    appendFileSync(falseHoldRecordPath(cfg), JSON.stringify(record) + "\n");
    return true;
  } catch {
    return false; // best-effort observation; never load-bearing for safety or framing.
  }
}
