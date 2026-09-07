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
 * RULING 3 (mentor, 2026-09-07) — the review-fleet caller class.
 *
 * WHY: the guard population must contain "only records where the live agent was
 * the actor at the moment the hook fired". A review-fleet subagent fires the same
 * hooks and its record carries the PARENT session id, so the session id CANNOT
 * discriminate (established S6b; re-established S7 under controlled conditions —
 * 11 of 15 records under one session id were that session's review fleet).
 *
 * WHAT THIS RETURNS, AND WHY ONLY TWO VALUES:
 *   "subagent" — a POSITIVE STRUCTURAL OBSERVATION, never an inference: the
 *     transcript path contains a `/subagents/` segment. The path SHAPE is
 *     live-verified, not guessed — a subagent's own transcript is written to
 *     `<parent-session>/subagents/agent-*.jsonl` (confirmed live 2026-06-21,
 *     Gate-1 Slice 3a; memory `claude-code-subagent-hook-contract`). A path of
 *     that shape cannot arise by accident, so a true positive is genuinely true.
 *   "unknown" — EVERYTHING ELSE, INCLUDING a session-shaped path. This is the
 *     load-bearing choice. A session-shaped path is exactly consistent with two
 *     different worlds: (a) the live agent was the actor, and (b) the wire hands
 *     a subagent the PARENT's transcript path. Labelling it "live_agent" would
 *     collapse those worlds into a claim the evidence does not support, and a
 *     field reading 100% live_agent would then be read as "no contamination
 *     found" when it in fact means "no signal". That is the guessed
 *     classification the honesty bar forbids.
 *
 * MEASURED, NOT MERELY DISCLOSED (2026-09-07, S7): at build time, what
 * `transcript_path` contains when PreToolUse fires INSIDE a subagent had not been
 * observed on this machine. It has been since. TWO separate review fleets ran
 * against this very diff, producing 14 real production v4/v5 records — including
 * at least one unambiguously fleet-generated command this session never ran
 * (`git diff -- harness/ website/scripts/ > /tmp/fh_diff_full.txt`). EVERY ONE
 * reads "unknown". The falsifiable prediction this docstring made at build time
 * has come back negative: the signal does NOT discriminate on this machine, under
 * this harness, as currently wired — the wire hands the hook a path with no
 * `/subagents/` segment even when the caller genuinely is a subagent.
 *
 * THIS DOES NOT INVALIDATE THE TWO-VALUE DESIGN; it is the reason for it. Had this
 * function emitted "live_agent" for a session-shaped path (the design considered
 * and rejected), the field would now read 100% "live_agent" and be misread as "no
 * contamination found" when it means "no signal was ever available". Because the
 * field reads "unknown" instead, the exclusion downstream is an honest LOWER BOUND
 * of ZERO on this machine today, not a false clean bill of health. `classifyCaller`
 * itself needs no code change — it correctly reports what it is given. What is
 * open is a harness-level question, named for the founder/mentor rather than
 * resolved here: does some OTHER available field distinguish a subagent caller
 * (the SDK-callback `SubagentStartHookInput` shape is a documented candidate, per
 * memory `claude-code-subagent-hook-contract` — but that is a different hook layer
 * from the command-hook PreToolUse this file reads), or does ruling 3's exclusion
 * remain a correct mechanism with no live population to exclude until the wire
 * itself changes?
 */
export function classifyCaller(transcriptPath) {
  if (typeof transcriptPath !== "string" || transcriptPath === "") return "unknown";
  // A PATH SEGMENT, not a substring: a directory merely NAMED e.g. "my-subagents-notes"
  // must not read as a subagent transcript.
  return /(^|\/)subagents(\/|$)/.test(transcriptPath) ? "subagent" : "unknown";
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
 * `no_assessment` rather than silently dropped — the coverage/loss accounting
 * the new-window scoping note asks for.
 *
 * CORRECTED 2026-09-07 (ruling 2). This paragraph previously claimed such records
 * were "EXCLUDED from the rate". That was FALSE when written: the exclusion existed
 * only in the report's derived recommendation column (Part 3b), never in Part 3 —
 * the rate part (3) of the readiness standard actually names. The exclusion landed
 * in Part 3 on 2026-09-07, in website/scripts/false-hold-observation-report.ts.
 * A SECOND claim carried alongside it — that such a record is "never a hold either
 * way" — was false at BOTH times and is deleted rather than re-dated: a STRICT-mode
 * guard outage passes `denied: true` (see `guardHold` below), so the classifier
 * marks it a hold, and with every signal array empty it classified as a FALSE
 * POSITIVE — a non-examination manufactured into the rate's numerator.
 */
export function buildGuardHoldRecord({ guard, sessionId, tool, actionText, nowIso, regime, denied, callerClass }) {
  const assessment = guard && typeof guard === "object" && guard.assessment && typeof guard.assessment === "object"
    ? guard.assessment
    : null;
  const ka =
    assessment && assessment.kathekon_assessment && typeof assessment.kathekon_assessment === "object"
      ? assessment.kathekon_assessment
      : {};
  const signals = kathekonSignalsFromVerdict(assessment);
  return {
    // v5 (RULING 3, 2026-09-07): + callerClass. The boundary is DATED and RECORDED;
    // v4 guard records predate it, carry no caller class, and are NEVER
    // retro-classified (mentor ruling 2026-09-07: "post-boundary only is ruled";
    // a retroactive actionPreview pass "is not owed").
    schema: "false-hold-record-v5",
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
    // RULING 3 (2026-09-07). TOP-LEVEL for the same load-bearing reason as every
    // field above: `recordHash` hashes JSON.stringify(r.signals), so a field added
    // INSIDE `signals` would re-hash every existing v1/v2/v3/v4 record and break
    // ingest idempotency against the frozen buffer. NORMALISED HERE rather than
    // trusted from the caller, so an absent or malformed value degrades to the
    // honest "unknown" and never to a false positive.
    callerClass: callerClass === "subagent" ? "subagent" : "unknown",
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
