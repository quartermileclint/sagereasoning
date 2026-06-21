/**
 * SageReasoning — Gate 1 at-action LOOP-CLOSURE helper (H3, the iterate step / ADR-011 D-B).
 * Arc 3 / Slice 5a.  Governing design: adopted/adr/2026-06-20-pre-decision-harness-arc2.md
 * ("Amendment 2026-06-21 — The full-loop harness", D-B).
 *
 * WHAT IT IS
 *   A pure, dependency-free mirror of the LIVE CI-4 server gate's closure semantics
 *   (website/src/app/api/accreditation/[agent_id]/loop-closure-gate.ts → analyseLoopClosure).
 *   We REUSE the server's rule, we do not re-invent it (PR15):
 *     • A consult that issues a REDIRECTION (improvement_path_structured present on the
 *       verdict — the engine's Rule-5 correction carrier) OPENS a loop.
 *     • The Q4 SAME-DEPTH rule: a loop opened at depth D is CLOSED only by a LATER
 *       re-examination that carries prior_feedback_ref === the loop's ref at depth rank ≥ rank(D).
 *
 *   The server gate analyses a whole provenance CHAIN at the accreditation write boundary.
 *   H3 instead tracks ONE rolling open loop across a session (the methodology's
 *   examine → redirect → re-examine is sequential), so the next at-action consult can carry
 *   `prior_feedback` at the same depth (the iterate step), and the loop is marked closed when
 *   the re-examination clears. The per-loop CLOSURE TEST below (closesLoop) is identical to the
 *   server's inner test, so a SINGLE-LOOP chain H3 builds reads `closed` at the write boundary.
 *   A MULTI-redirection session is an acknowledged APPROXIMATION (ADR-011 D-B — "an open loop",
 *   singular): when a new redirection supersedes a still-open one, the superseded ref is retained
 *   in `abandonedRefs` and surfaced so the agent is prompted to re-examine it too, but H3 does not
 *   itself re-carry prior_feedback for it — the server's whole-chain analyseLoopClosure may then
 *   honestly read `unclosed` (the older correction genuinely was not re-examined). The server gate
 *   runs in DETECT mode (cannot reject), so this is an honest under-claim, never a forged closure.
 *
 * No third-party dependencies. Node 18+.
 */

// The depth tiers, ranked for the Q4 same-depth rule. Mirrors loop-closure-gate.ts DEPTH_RANK.
export const DEPTH_RANK = { quick: 1, standard: 2, deep: 3 };

/**
 * Classify a single consult's verdict for loop tracking. PURE.
 *   verdict — the extracted Layer-2 verdict (extractVerdict() output).
 *   requestDepth — the depth tier the hook requested (fallback when the engine omits markers).
 * Returns:
 *   redirectionIssued — improvement_path_structured present (a correction was issued).
 *   ref               — this examination's loop id (verdict.examination.ref, else a synthetic id).
 *   depthTier         — verdict.examination.depth_tier, else the requested depth.
 *   priorFeedbackRef  — set when THIS consult re-examines a prior redirection (closure candidate).
 */
export function classifyConsult(verdict, requestDepth, fallbackRef) {
  const v = verdict && typeof verdict === "object" ? verdict : {};
  const exam = v.examination && typeof v.examination === "object" ? v.examination : {};

  const ip = v.improvement_path_structured;
  // A redirection is a NON-EMPTY improvement_path_structured. NOTE: the LIVE server's extractElement
  // uses the literal `!== null && !== undefined`, so it would count an empty {}/[] as a redirection;
  // H3's stricter non-empty check is an intentional defensive choice to absorb the mock's always-
  // present {} shape. The two AGREE on every real shape because the engine types
  // improvement_path_structured as `… | null` and emits null (never {}) when there is no path.
  const redirectionIssued = isNonEmptyCorrection(ip);

  const ref = typeof exam.ref === "string" && exam.ref ? exam.ref : fallbackRef;
  const depthTier =
    typeof exam.depth_tier === "string" && DEPTH_RANK[exam.depth_tier] ? exam.depth_tier : requestDepth;
  const priorFeedbackRef =
    typeof exam.prior_feedback_ref === "string" && exam.prior_feedback_ref ? exam.prior_feedback_ref : undefined;

  return { redirectionIssued, ref, depthTier, priorFeedbackRef };
}

function isNonEmptyCorrection(ip) {
  if (ip === null || ip === undefined) return false;
  if (typeof ip === "string") return ip.trim().length > 0;
  if (Array.isArray(ip)) return ip.length > 0;
  if (typeof ip === "object") return Object.keys(ip).length > 0;
  return false;
}

/**
 * The Q4 same-depth closure test: does `later` re-examine the open loop `open` at depth ≥?
 * Identical to loop-closure-gate.ts's inner test. PURE.
 */
export function closesLoop(open, later) {
  if (!open || !later) return false;
  if (later.priorFeedbackRef !== open.ref) return false;
  const openRank = DEPTH_RANK[open.depthTier];
  const laterRank = DEPTH_RANK[later.depthTier];
  if (openRank === undefined || laterRank === undefined) return false;
  return laterRank >= openRank;
}

/**
 * Advance the rolling loop state given the latest classified consult. PURE.
 *   state — { openLoop: {ref, depthTier, adoptedCorrection?} | null, closedRefs: string[] }
 *   classified — classifyConsult() output for THIS consult.
 *   correctionText — an optional short note carried as adopted_correction on the NEXT prior_feedback.
 * Returns { state, event } where event is 'closed' | 'opened' | 'reopened' | 'none' for the log.
 */
export function advanceLoopState(state, classified, correctionText) {
  const prev = normaliseState(state);
  let openLoop = prev.openLoop;
  const closedRefs = prev.closedRefs.slice();
  const abandonedRefs = prev.abandonedRefs.slice();
  let event = "none";

  // 1. Closure: if a loop is open and THIS consult re-examined it at ≥ depth AND did not itself
  //    issue a fresh redirection, the loop is closed.
  if (openLoop && closesLoop(openLoop, classified) && !classified.redirectionIssued) {
    closedRefs.push(openLoop.ref);
    openLoop = null;
    event = "closed";
  }

  // 2. Opening: a redirection opens (or re-opens) a loop on THIS examination's ref. If a DIFFERENT
  //    loop was still open, it is superseded by the newer redirection (the chain moved on) — the
  //    superseded ref is RETAINED in abandonedRefs (multi-redirection approximation, ADR-011 D-B)
  //    so the agent can be prompted to re-examine the older correction too; H3 does not itself
  //    re-carry prior_feedback for it (the server's whole-chain gate may then read it 'unclosed').
  if (classified.redirectionIssued && classified.ref) {
    if (openLoop && openLoop.ref !== classified.ref && !abandonedRefs.includes(openLoop.ref)) {
      abandonedRefs.push(openLoop.ref);
    }
    event = openLoop ? "reopened" : "opened";
    openLoop = {
      ref: classified.ref,
      depthTier: classified.depthTier,
      adoptedCorrection: correctionText || undefined,
    };
  }

  return { state: { openLoop, closedRefs, abandonedRefs }, event };
}

/**
 * Build the prior_feedback block for the NEXT consult from the current open loop, or null.
 * Shape mirrors the SDK PriorFeedback type ({ prior_loop_id, prior_depth_tier, adopted_correction? }).
 * PURE.
 */
export function priorFeedbackFrom(state) {
  const s = normaliseState(state);
  if (!s.openLoop || !s.openLoop.ref) return null;
  const pf = {
    prior_loop_id: s.openLoop.ref,
    prior_depth_tier: s.openLoop.depthTier,
  };
  if (s.openLoop.adoptedCorrection) pf.adopted_correction = s.openLoop.adoptedCorrection;
  return pf;
}

/**
 * The same-depth carry: when an open loop exists, the next consult must run at the loop's depth
 * (or deeper). Returns the depth tier the next consult should use, given the hook's configured
 * default. PURE.
 */
export function carriedDepth(state, configuredDepth) {
  const s = normaliseState(state);
  if (!s.openLoop) return configuredDepth;
  const openRank = DEPTH_RANK[s.openLoop.depthTier] || DEPTH_RANK.standard;
  const cfgRank = DEPTH_RANK[configuredDepth] || DEPTH_RANK.standard;
  // Carry at least the open loop's depth (the Q4 same-depth rule: never re-examine shallower).
  return openRank >= cfgRank ? s.openLoop.depthTier : configuredDepth;
}

export function normaliseState(state) {
  const s = state && typeof state === "object" ? state : {};
  return {
    openLoop:
      s.openLoop && typeof s.openLoop === "object" && typeof s.openLoop.ref === "string"
        ? {
            ref: s.openLoop.ref,
            depthTier: DEPTH_RANK[s.openLoop.depthTier] ? s.openLoop.depthTier : "standard",
            adoptedCorrection:
              typeof s.openLoop.adoptedCorrection === "string" ? s.openLoop.adoptedCorrection : undefined,
          }
        : null,
    closedRefs: Array.isArray(s.closedRefs) ? s.closedRefs.filter((x) => typeof x === "string") : [],
    abandonedRefs: Array.isArray(s.abandonedRefs) ? s.abandonedRefs.filter((x) => typeof x === "string") : [],
  };
}
