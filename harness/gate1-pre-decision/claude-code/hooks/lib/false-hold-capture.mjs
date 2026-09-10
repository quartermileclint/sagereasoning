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

import { mkdirSync, appendFileSync, existsSync, readFileSync } from "node:fs";
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
/**
 * S11/CONDITION 3 (mentor ruling, 2026-09-10 — the 2026-09-07 five-question
 * ruling's third and final condition, discharged by that ruling): the client
 * build/entrypoint pair at which `agent_id` was FIRST OBSERVED PRESENT on a
 * top-level session's H3 PreToolUse payload — Condition 1's negative result —
 * and CONFIRMED STABLE on a second, genuinely different calendar day —
 * Condition 2. Bump BOTH constants together, and ONLY after re-running
 * Conditions 1 and 2 against the new pair — never independently, and never on
 * a hunch that the wire "probably" still behaves the same way. The ruling's own
 * words: "If the mechanism is built and the client updates, the harness must
 * detect the field's absence and fall back to `unknown` rather than silently
 * misclassifying." This pair, and the gate below that checks it, is that
 * detection.
 */
const PINNED_CLIENT_VERSION = "2.1.260";
const PINNED_CLIENT_ENTRYPOINT = "claude-desktop";

/**
 * Read the client `version`/`entrypoint` a transcript was written under, AT
 * THE TAIL — not the head, and this is load-bearing, not a style choice.
 *
 * `version`/`entrypoint` are ABSENT from the PreToolUse/PostToolUse hook
 * payload itself (confirmed 2026-09-09/2026-09-10 by direct key-list
 * inspection of live captures across three separate sessions) — they ride the
 * transcript JSONL, one value per line, reachable only via `transcript_path`.
 *
 * A HEAD read is the obvious implementation and it is WRONG: a design-time
 * sweep of 400 transcripts on the build machine (2026-09-10) found 17 (4.25%)
 * carrying MORE THAN ONE `version` value — a session that straddles a client
 * update writes lines under both — including two that straddle exactly this
 * module's own pinned boundary, `2.1.258 → 2.1.260`. A head-read on such a
 * session would report the session-START version while the LIVE client had
 * already moved past it, reproducing the exact silent-misclassification
 * failure this whole mechanism exists to prevent.
 *
 * A BOUNDED backward byte-window was considered and rejected in design (an
 * adversarial self-review of the design found a single 1,142,339-byte line in
 * one transcript, 17x a proposed 64KB window — a bounded scan could miss the
 * one version-bearing line it needed). This reads the WHOLE file instead,
 * matching the established `readTranscriptTail` pattern in
 * `lib/discernment.mjs` (already loaded on every H3/H2 firing for the SAME
 * transcript, at the SAME file scale) — a full read cannot miss the true last
 * version-bearing line, at the cost this codebase already pays elsewhere.
 *
 * Fails soft to `{version: null, entrypoint: null}` on any missing, unreadable
 * or unparseable transcript — mirrors `readTranscriptTail`'s own contract:
 * this function must never throw, and an unreadable transcript must degrade to
 * the gate failing (⇒ "unknown"), never to a fabricated value.
 */
export function readClientContext(transcriptPath) {
  try {
    if (typeof transcriptPath !== "string" || !transcriptPath || !existsSync(transcriptPath)) {
      return { version: null, entrypoint: null };
    }
    const lines = readFileSync(transcriptPath, "utf8").split("\n");
    for (let i = lines.length - 1; i >= 0; i--) {
      const t = lines[i].trim();
      if (!t) continue;
      let obj;
      try {
        obj = JSON.parse(t);
      } catch {
        continue; // skip a non-JSON line; do not let one bad line abort the scan
      }
      if (obj && typeof obj === "object" && typeof obj.version === "string") {
        return {
          version: obj.version,
          entrypoint: typeof obj.entrypoint === "string" ? obj.entrypoint : null,
        };
      }
    }
    return { version: null, entrypoint: null };
  } catch {
    return { version: null, entrypoint: null };
  }
}

/**
 * RULING 3 (mentor, 2026-09-07) — the ORIGINAL two-value `caller_class` design.
 * PRESERVED VERBATIM BELOW (superseded 2026-09-10; kept because the reasoning
 * it recorded is exactly what licenses the widening, and deleting it would
 * discard the argument that makes the new value safe rather than assumed):
 *
 * WHY: the guard population must contain "only records where the live agent was
 * the actor at the moment the hook fired". A review-fleet subagent fires the same
 * hooks and its record carries the PARENT session id, so the session id CANNOT
 * discriminate (established S6b; re-established S7 under controlled conditions —
 * 11 of 15 records under one session id were that session's review fleet).
 *
 * WHAT THIS RETURNED, AND WHY ONLY TWO VALUES (pre-2026-09-10):
 *   "subagent" — a POSITIVE STRUCTURAL OBSERVATION, never an inference: the
 *     transcript path contains a `/subagents/` segment.
 *   "unknown" — EVERYTHING ELSE, INCLUDING a session-shaped path. A
 *     session-shaped path was exactly consistent with two different worlds:
 *     (a) the live agent was the actor, and (b) the wire hands a subagent the
 *     PARENT's transcript path. Labelling it "live_agent" would have collapsed
 *     those worlds into a claim the evidence did not then support.
 *
 * WHAT CLOSED THE AMBIGUITY (2026-09-07 → 2026-09-10): Condition 1 tested world
 * (b) directly and found it FALSE — a top-level session's H3 PreToolUse stdin
 * never carries `agent_id`, across every configuration tested including
 * concurrent background agents (`operations/trust-layer-2026-07/2026-09-08-condition-1-agentid-parent-session-CAPTURE-EVIDENCE.md`).
 * Condition 2 confirmed the finding stable on a second, different calendar day.
 * The mentor's 2026-09-10 ruling on Condition 3's design licensed the third
 * value on exactly this basis: "The two-world ambiguity that ruling 3 was
 * protecting against no longer exists... Emitting `live_agent`... is now a
 * classification that rests on verified evidence, not on an assumption."
 *
 * THE DEPENDENCY IS STRUCTURAL, NOT A COMMENT: if Condition 1's finding is ever
 * overturned by a later capture — a client update makes a top-level session
 * carry `agent_id` — the version+entrypoint gate below makes withdrawal
 * AUTOMATIC rather than manual. The new client fails the gate, every record
 * captured under it reads "unknown" (never a guess), and `live_agent` is
 * withdrawn by construction until Conditions 1 and 2 are re-verified under the
 * new pair and the pinned constants above are deliberately bumped.
 *
 * THE GATE, exactly (mentor ruling 2026-09-10, Q1/Q3): version AND entrypoint
 * AND agent_id-presence all determinable, or the answer is "unknown" — never a
 * default in either direction. This is what makes an untested second
 * entrypoint (Configuration 5 — no `claude` CLI has ever run on this machine)
 * SAFE rather than merely unaddressed: a same-version CLI session fails the
 * entrypoint half of the gate and degrades to "unknown", exactly Option D's
 * pre-existing status quo, asserting nothing new about a wire that was never
 * characterised.
 */
export function classifyCaller(transcriptPath, opts) {
  if (typeof transcriptPath !== "string" || transcriptPath === "") return "unknown";
  // A PATH SEGMENT, not a substring: a directory merely NAMED e.g. "my-subagents-notes"
  // must not read as a subagent transcript. Checked FIRST and UNCONDITIONALLY —
  // this positive structural tell does not depend on client version at all.
  if (/(^|\/)subagents(\/|$)/.test(transcriptPath)) return "subagent";

  const o = opts && typeof opts === "object" ? opts : {};
  // Option C′ (agent_id presence) requires a genuine boolean — an absent/
  // non-boolean value means the caller never determined presence, which must
  // degrade to "unknown", never to a guess.
  if (typeof o.agentIdPresent !== "boolean") return "unknown";
  // THE GATE. All three conditions in `opts` are supplied by the caller
  // (`describeAction`, which reads the transcript ONCE via `readClientContext`
  // and threads the result here — this function stays a pure classifier of its
  // arguments, exactly as it was before this change; the file I/O lives outside it).
  if (o.clientVersion !== PINNED_CLIENT_VERSION || o.clientEntrypoint !== PINNED_CLIENT_ENTRYPOINT) {
    return "unknown";
  }
  return o.agentIdPresent ? "subagent" : "live_agent";
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
export function buildGuardHoldRecord({ guard, sessionId, tool, actionText, nowIso, regime, denied, callerClass, clientVersion, clientEntrypoint }) {
  const assessment = guard && typeof guard === "object" && guard.assessment && typeof guard.assessment === "object"
    ? guard.assessment
    : null;
  const ka =
    assessment && assessment.kathekon_assessment && typeof assessment.kathekon_assessment === "object"
      ? assessment.kathekon_assessment
      : {};
  const signals = kathekonSignalsFromVerdict(assessment);
  return {
    // v6 (mentor ruling, 2026-09-10 — the S11/Condition-3 five-question ruling's
    // ANSWER): `callerClass` widens from two values to three
    // (subagent/live_agent/unknown) and two new top-level fields
    // (clientVersion/clientEntrypoint) are added, per the ruling's Condition-3
    // requirement that the disclosure name the client build a classification
    // rests on. v5 records predate this boundary, carry NO clientVersion/
    // clientEntrypoint, and their `callerClass` is restricted to
    // subagent/unknown (never live_agent — that value did not exist under the
    // v5 boundary's rules, so a v5 record carrying it would be malformed, not
    // legacy). v5 records are NEVER retro-classified — the same discipline the
    // v4→v5 boundary established (mentor ruling 2026-09-07: "post-boundary only
    // is ruled"; a retroactive pass "is not owed").
    schema: "false-hold-record-v6",
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
    // TOP-LEVEL for the same load-bearing reason as every field above:
    // `recordHash` hashes JSON.stringify(r.signals), so a field added INSIDE
    // `signals` would re-hash every existing v1/v2/v3/v4/v5 record and break
    // ingest idempotency against the frozen buffer.
    //
    // callerClass — RULING 3 (2026-09-07), WIDENED by the 2026-09-10 ruling.
    // NORMALISED HERE rather than trusted from the caller, so an absent or
    // malformed value degrades to the honest "unknown" and never to a false
    // positive in EITHER direction — a garbage string can only ever LOSE a
    // classification, never manufacture "subagent" or "live_agent" out of
    // nothing. This mirrors the pre-existing discipline for "subagent" exactly;
    // "live_agent" is held to the identical standard.
    callerClass:
      callerClass === "subagent" || callerClass === "live_agent" ? callerClass : "unknown",
    // clientVersion/clientEntrypoint — CONDITION 3's own disclosure requirement:
    // "note the client version… at which agent_id was first observed." Read
    // ONCE by the caller (`describeAction`, via `readClientContext`) and
    // threaded here rather than re-read, so a single hook firing never touches
    // the transcript file twice for the same purpose. Normalised to
    // string-or-null so a read failure degrades honestly rather than throwing
    // or fabricating a value; `null` here means "could not be determined", the
    // same reason `callerClass` would independently read "unknown" for that
    // record (the two fields are expected to co-vary, and a future audit can
    // check that they do).
    clientVersion: typeof clientVersion === "string" ? clientVersion : null,
    clientEntrypoint: typeof clientEntrypoint === "string" ? clientEntrypoint : null,
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
