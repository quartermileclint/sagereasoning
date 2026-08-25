#!/usr/bin/env node
/**
 * SageReasoning — Gate-1 AT-ACTION hook (H3): the R5 cadence at a consequential tool call.
 * Claude Code `PreToolUse`, matched to the consequential-tool set (Bash|Edit|Write|MultiEdit|
 * NotebookEdit by default — configurable). Arc 3 / Slice 5a.
 * Governing design: adopted/adr/2026-06-20-pre-decision-harness-arc2.md
 * ("Amendment 2026-06-21 — The full-loop harness", H3 + D-A/D-B/D-D/D-F).
 *
 * WHAT IT DOES — three roles, one hook (ADR-011 D-A, the central tension resolved):
 *   GUARD  (irreversible subset)  — on a Bash command matching an irreversible pattern (rm -rf, drop
 *          table, force-push, deploy, …) OR a configured guard tool, POST /api/guardrail. On a
 *          genuine `do_not_proceed` verdict, BLOCK the tool (permissionDecision:"deny"). Over-blocking
 *          is the safe error here. An /api/guardrail OUTAGE fails per GATE1_GUARD_FAIL_MODE (D-F):
 *          'open' (default — allow + honest note, never brick the loop) | 'strict' (deny).
 *   SCORE  (broader consequential) — fire a Gate-2 /api/reason consult (assessment_first), DEDUPED
 *          per distinct decision (fire-once state, so it does NOT consult before every Edit/Bash),
 *          inject the redirection as additionalContext, and append the SIGNED assessment to the
 *          session provenance log (for H4's accreditation write, D-D). NEVER blocks.
 *   ITERATE (loop-closure, D-B)    — if a prior consult OPENED a loop (a redirection), the next
 *          consult carries `prior_feedback` at the SAME depth (mirrors the LIVE CI-4 closure rule);
 *          the loop is marked CLOSED when a re-examination clears. State only — never a gate.
 *   TRUST-READ (S8, Verification layer, ADVISE) — once per session, alongside a successful consult,
 *          the caller's standing trust verdict (S1 profile → S3 aggregate → S4 MEASURE
 *          recommendation) is read from the dark /api/practice/discernment route and appended as a
 *          compact advisory observation. MEASURE — log-and-continue; NEVER blocks; un-provisioned ⇒
 *          byte-identical to pre-S8; outage ⇒ honest log, no lines.
 *
 * FAIL POSTURE (ADR-011 D-F / KG1 / R18): EVERYTHING fails-open-with-an-honest-log EXCEPT the guard
 *   block (which blocks on a genuine do_not_proceed — its purpose — and fails-open on an OUTAGE by
 *   default). No fake frames; no silent blocks. The consult NEVER blocks.
 *
 * WIRE CONTRACT (PreToolUse command hook; verified against code.claude.com/docs/en/hooks, 2026-06-20;
 *   PreToolUse can block + supports updatedInput/additionalContext — Slice-3 live-verified):
 *   - STDIN  : { session_id, transcript_path, cwd, permission_mode, hook_event_name:"PreToolUse",
 *               tool_name, tool_input }.
 *   - STDOUT (allow + inject): {"hookSpecificOutput":{"hookEventName":"PreToolUse","additionalContext":"…"}}
 *   - STDOUT (block):          {"hookSpecificOutput":{"hookEventName":"PreToolUse",
 *                                 "permissionDecision":"deny","permissionDecisionReason":"…"}}
 *   - EXIT 0 : allow (with our injected context, or unchanged); the deny JSON also exits 0.
 *
 * No third-party dependencies. Node 18+ (global fetch + AbortSignal.timeout).
 */

import { dirname } from "node:path";
import { fileURLToPath } from "node:url";
import {
  loadConfig,
  readStdin,
  maybeDebugDump,
  fetchFrame,
  fetchGuardrail,
  renderFrame,
  honestLog,
  shortHash,
  compileIrreversible,
  hasOverwriteRedirect,
  isHousekeeping,
  MAX_CONTEXT_CHARS,
} from "./lib/framing-core.mjs";
import {
  appendProvenance,
  readLoopState,
  writeLoopState,
  decisionAlreadyFired,
  markDecisionFired,
} from "./lib/session-state.mjs";
import { appendFalseHoldRecord, buildFalseHoldRecord, buildGuardHoldRecord } from "./lib/false-hold-capture.mjs";
import { composeAction, renderBareInputNote } from "./lib/action-composer.mjs";
import { classifyConsultSignal, computeKathekonConfidence } from "./lib/consult-signal.mjs";
import { recordGuardCautionSignal, recordConsultSignal } from "./lib/close-signal-state.mjs";
import {
  classifyConsult,
  advanceLoopState,
  priorFeedbackFrom,
  carriedDepth,
  calibratedDepthFloor,
  maxDepthOf,
  DEPTH_RANK,
} from "./lib/loop-closure.mjs";
import {
  loadDiscernmentConfig,
  discernmentEnabled,
  fetchTrustVerdict,
  renderTrustAdvisory,
  fetchDiscernment,
  readTranscriptTail,
} from "./lib/discernment.mjs";
import { existsSync, writeFileSync, mkdirSync, readFileSync, unlinkSync } from "node:fs";
import { join } from "node:path";

const HOOK_DIR = dirname(fileURLToPath(import.meta.url)); // …/claude-code/hooks

// ---------------------------------------------------------------------------
// S8 — the standing trust-verdict read (Verification layer, ADVISE channel).
// Once per session, alongside a successful consult, GET the caller's own trust
// verdict from the dark /api/practice/discernment route (S1 profile → S3
// weighted aggregate → S4 MEASURE recommendation) and append it as a compact
// advisory observation — log-and-continue; it NEVER blocks (MEASURE; ENFORCE is
// S11). Un-provisioned ⇒ returns "" fast (H3 byte-identical to pre-S8).
// Fail-open: an outage logs honestly and appends nothing.
// ---------------------------------------------------------------------------
function trustReadMarkerPath(cfg, sessionId) {
  return join(cfg.stateDir, `${sanitizeLog(sessionId)}.trustread`);
}

// ---------------------------------------------------------------------------
// S9b G5 — the trust-calibrated depth (ADR-013 §11 G5; election E1 2026-07-12).
// The verdict fetched for the standing advisory is CACHED per session
// (<session>.trustverdict.json) so every consult can calibrate without a
// re-fetch; mid-session trust-reducing observations (a guard non-proceed, a
// Gate-2 elicitation flag) bump a session depth FLOOR. Calibration only ever
// RAISES depth (config/carry set the base): reflexive aggregate ⇒ deep
// REQUIRED; habitual/deliberate aggregate or an active justice latch ⇒ at
// least standard; principled+/no-evidence ⇒ no floor. All fail-soft.
// ---------------------------------------------------------------------------
function trustVerdictStatePath(cfg, sessionId) {
  return join(cfg.stateDir, `${sanitizeLog(sessionId)}.trustverdict.json`);
}
function readTrustCalibration(cfg, sessionId) {
  try {
    return JSON.parse(readFileSync(trustVerdictStatePath(cfg, sessionId), "utf8"));
  } catch {
    return null;
  }
}
function writeTrustCalibration(cfg, sessionId, patch) {
  try {
    mkdirSync(cfg.stateDir, { recursive: true });
    const cur = readTrustCalibration(cfg, sessionId) || {};
    writeFileSync(trustVerdictStatePath(cfg, sessionId), JSON.stringify({ ...cur, ...patch }));
  } catch {
    /* fail-soft — calibration is advisory-adjacent; never blocks the hook. */
  }
}
// (calibratedDepthFloor + maxDepthOf + DEPTH_RANK live in lib/loop-closure.mjs —
// pure + importable by the logic harness without executing this hook's main().)
async function maybeTrustAdvisory(cfg, sessionId) {
  const dcfg = loadDiscernmentConfig(cfg, HOOK_DIR);
  if (!discernmentEnabled(cfg, dcfg)) return "";
  try {
    if (cfg.fireOnce && existsSync(trustReadMarkerPath(cfg, sessionId))) return "";
  } catch {
    /* cannot check → read once */
  }
  const r = await fetchTrustVerdict(cfg, dcfg);
  if (!r.ok) {
    honestLog(cfg, `TRUST-READ-OUTAGE session=${sanitizeLog(sessionId)} reason="${r.reason}"`);
    return ""; // fail-open: no advisory lines; never a fabricated record.
  }
  try {
    mkdirSync(cfg.stateDir, { recursive: true });
    writeFileSync(trustReadMarkerPath(cfg, sessionId), `${new Date().toISOString()} read\n`);
  } catch {
    /* marker best-effort — worst case one extra read next decision */
  }
  const agg = r.verdict.aggregate;
  // S9b G5: cache the verdict's calibration inputs so every subsequent consult
  // reads depth from the session file instead of re-fetching.
  writeTrustCalibration(cfg, sessionId, {
    aggregateLevel: agg && agg.level ? agg.level : null,
    justiceCapped: !!(agg && agg.anyJusticeCapped),
    readAt: new Date().toISOString(),
  });
  honestLog(
    cfg,
    `TRUST-READ session=${sanitizeLog(sessionId)} aggregate=${agg && agg.level ? agg.level : "none"} ` +
      `rec=${r.verdict.recommendation ? `${r.verdict.recommendation.action}/${r.verdict.recommendation.followUp}` : "none"} mode=measure`,
  );
  return renderTrustAdvisory(r.verdict);
}

// ---------------------------------------------------------------------------
// S9b G3 — the Gate-2 structured elicitation (ADR-013 §11 G3). The tool-class
// trigger stays the suppression-resistant OUTER gate; when it fires a caution,
// the three sub-questions are injected (ADVISE — the agent answers in
// conversation), a pending marker is written, and at the NEXT hook firing the
// answer is CAPTURED OUT-OF-BAND (the transcript tail — the S8-proven channel,
// never a self-report POST the agent is instructed to make) and examined
// deterministically server-side ({phase:'elicitation'} on the discernment
// route — the L4 causal-signature reading, F-Q43-calibrated). MEASURE: the
// examination is logged; a passion flag bumps the session depth floor (G5's
// mid-session recalibration). Every step fail-open-honest; one capture attempt
// per elicitation (the marker clears either way — honest, never a retry storm).
// ---------------------------------------------------------------------------
function elicitMarkerPath(cfg, sessionId) {
  return join(cfg.stateDir, `${sanitizeLog(sessionId)}.elicit.json`);
}
export function renderGate2ElicitationBlock(actionText) {
  // Mirrors website/src/lib/substrate/trust-core/gate2-elicitation.ts
  // renderGate2Elicitation (the server owns the EXAMINATION; this is the
  // injected prompt — keep the two in step).
  return [
    "[SageReasoning Gate 2 — structured elicitation at a consequential action]",
    `Before proceeding with: ${actionText.slice(0, 200)}`,
    "Answer the three examination sub-questions briefly, in your own words, in this conversation (there is nothing to call and nothing to send):",
    "1. Prior preference — had you formed a preference for this action BEFORE examining it? If so, when and why?",
    "2. Stake — do you have a stake in this outcome (efficiency, completion, avoiding rework, appearing capable)? Name it if so.",
    "3. Resolution — was the resolution reached before the examination completed, or did the examination genuinely precede the decision?",
    "Your answers are captured out-of-band and examined deterministically; they inform the trust record (MEASURE — advisory; nothing binds).",
  ].join("\n");
}
async function maybeFlushElicitation(cfg, sessionId, event) {
  const marker = elicitMarkerPath(cfg, sessionId);
  let pending = null;
  try {
    if (!existsSync(marker)) return;
    pending = JSON.parse(readFileSync(marker, "utf8"));
  } catch {
    return;
  }
  // One-shot: clear first so no path (incl. a crash mid-POST) re-fires it.
  try {
    unlinkSync(marker);
  } catch {
    /* best-effort */
  }
  const dcfg = loadDiscernmentConfig(cfg, HOOK_DIR);
  if (!discernmentEnabled(cfg, dcfg)) {
    honestLog(cfg, `ELICIT-SKIP session=${sanitizeLog(sessionId)} reason="discernment un-provisioned"`);
    return;
  }
  const transcriptPath = typeof event.transcript_path === "string" ? event.transcript_path : "";
  const tail = transcriptPath ? readTranscriptTail(transcriptPath, dcfg.traceMaxChars) : "";
  if (!tail) {
    honestLog(cfg, `ELICIT-SKIP session=${sanitizeLog(sessionId)} reason="no transcript tail to capture"`);
    return;
  }
  const r = await fetchDiscernment(cfg, dcfg, {
    phase: "elicitation",
    task_ref: `elicit-${pending.signature || "unknown"}`,
    orchestrator_agent_id: dcfg.orchestratorProfile && dcfg.orchestratorProfile.agentId,
    elicitation_text: tail,
  });
  if (!r.ok) {
    honestLog(cfg, `ELICIT-OUTAGE session=${sanitizeLog(sessionId)} reason="${r.reason}"`);
    return;
  }
  const exam = r.body.result || {};
  const flagged = exam.passionSignaturePresent === true;
  honestLog(
    cfg,
    `ELICIT session=${sanitizeLog(sessionId)} sig=${sanitizeLog(pending.signature || "?")} ` +
      `passion_signature=${flagged} basis="${sanitizeLog(exam.basis || "")}" mode=measure`,
  );
  if (flagged) {
    // G5 mid-session recalibration: a trust-reducing observation bumps the
    // session depth floor to standard for subsequent examinations.
    writeTrustCalibration(cfg, sessionId, { depthFloorBump: "standard" });
  }
}

// ---------------------------------------------------------------------------
// STDOUT emit helpers — the ONLY thing ever printed is one of these JSON objects.
// ---------------------------------------------------------------------------
function emitAllowWithContext(text) {
  const clipped = text.length > MAX_CONTEXT_CHARS ? text.slice(0, MAX_CONTEXT_CHARS) + "\n…(frame truncated)" : text;
  process.stdout.write(
    JSON.stringify({ hookSpecificOutput: { hookEventName: "PreToolUse", additionalContext: clipped } }),
  );
}
function emitBlock(reason) {
  process.stdout.write(
    JSON.stringify({
      hookSpecificOutput: {
        hookEventName: "PreToolUse",
        permissionDecision: "deny",
        permissionDecisionReason: reason,
      },
    }),
  );
}
function allowSilently() {
  // No stdout → Claude Code proceeds with the tool unchanged (allow, no injected context).
  process.exit(0);
}

// ---------------------------------------------------------------------------
// Derive the examined ACTION from a tool call. S11b (2026-07-18): the derivation
// moved to lib/action-composer.mjs — the S11a diagnosis found the old inline
// composition STARVED the examination (Write content discarded; Edit truncated
// to 200 chars). The composer returns { text (examined, composed v2 by
// default), summary (the v1 lean one-liner — every display/state consumer
// below keeps reading THIS, so those surfaces are unchanged), signature (E3:
// payload-content-hash in composed mode — a materially distinct edit is a new
// decision), inputClass/regime (the ADR-014 extraction-regime mark), bare (the
// item-5 T2-soft ask) }. The mandatory sensitive-path denylist + token
// redaction (election E2) are applied INSIDE the composer, before any consumer
// of action.text can egress it.
//
// SCOPE — the four consumers of action.text (S11b scope statement 8):
//   (i)  fetchFrame (runConsult)        — the recomposition's target; composed.
//   (ii) fetchGuardrail (runGuard)      — the DENY-capable channel; for Bash the
//        text is the full command (redacted) as before; a configured file-tool
//        guardTool would send the composed text (same egress class, same
//        denylist — applied before composition).
//   (iii) renderGate2ElicitationBlock   — now shows action.summary (unchanged UX).
//   (iv) loop-state adoptedCorrection   — now action.summary (unchanged bytes).
// ---------------------------------------------------------------------------
function describeAction(cfg, toolName, toolInput, transcriptPath) {
  return composeAction({
    toolName,
    toolInput,
    transcriptPath,
    mode: cfg.actionTextMode,
    sensitiveAdditions: cfg.sensitivePathAdditions,
  });
}

// Is this action in the GUARD set (irreversible → guardrail can block)? Either the tool is in the
// explicit guardTools list, or it is a Bash command matching an irreversible pattern, or (S1
// broadening, build-plan §3.1) a Bash command with an overwrite-redirect to a real path (clobbers
// its target). Over-block is the safe error on the guard set.
function isGuardAction(cfg, toolName, action, compiled) {
  if (cfg.guardTools.includes(toolName)) return true;
  if (toolName === "Bash" && action.bashCommand) {
    if (compiled.some((re) => re.test(action.bashCommand))) return true;
    if (hasOverwriteRedirect(action.bashCommand)) return true;
  }
  return false;
}

// Render the Gate-2 at-action frame (the redirection + proximity + loop status) for injection.
function renderAtActionFrame(verdict, loopEvent, carriedPrior, abandonedRefs = []) {
  const base = renderFrame(verdict)
    // Reuse the canonical frame body but re-title it as the at-action Gate-2 cadence.
    .replace(
      "[SageReasoning Gate 1 — pre-decision examination]",
      "[SageReasoning Gate 2 — at-action examination]",
    )
    .replace(
      "This task was examined before any work began.",
      "This action was examined before it executes.",
    );
  const tail = [];
  if (carriedPrior) {
    tail.push(
      `• Re-examination: this carried prior_feedback (loop ${carriedPrior.prior_loop_id}, depth ${carriedPrior.prior_depth_tier}) — the correction is being examined again at the same depth (loop closure).`,
    );
  }
  if (loopEvent === "opened" || loopEvent === "reopened") {
    tail.push(
      // ADVISE channel (Slice-5c channel law): an in-task observation, NOT an imperative tied to an
      // outbound action. The old tail ("…before writing the credential") referenced the hook's own
      // out-of-band accreditation write — a capable agent reads that as an injected instruction-to-act
      // and refuses it. The instrumentation (accred write) happens out-of-band regardless of whether
      // the agent acts on this line; this is purely a within-task observation the agent may discount.
      "• A redirection was issued: this reasoning carries an OPEN correction. The corrected reasoning has not yet been re-examined at this depth.",
    );
  } else if (loopEvent === "closed") {
    tail.push("• The open examination loop is now CLOSED (the correction was re-examined and cleared).");
  }
  if (Array.isArray(abandonedRefs) && abandonedRefs.length) {
    tail.push(
      // ADVISE channel: in-task observation only; the old tail's "or the accreditation chain reads as
      // having open loops" referenced the out-of-band write and is stripped (channel law).
      `• Note: ${abandonedRefs.length} earlier redirection(s) (${abandonedRefs.join(", ")}) were superseded before being re-examined.`,
    );
  }
  return tail.length ? base + "\n" + tail.join("\n") : base;
}

async function main() {
  const cfg = loadConfig({ hookDir: HOOK_DIR, eventName: "PreToolUse", allowStrict: true });

  const raw = readStdin();
  maybeDebugDump(cfg, raw); // GATE1_DEBUG → dump the raw PreToolUse stdin.
  let event = {};
  try {
    event = JSON.parse(raw || "{}");
  } catch {
    // Cannot parse stdin → we have no action to examine. Fail-open-honest: allow + honest log.
    honestLog(cfg, "AT-ACTION-SKIP reason=\"could not parse hook stdin\"");
    allowSilently();
    return;
  }

  const toolName = typeof event.tool_name === "string" ? event.tool_name : "";
  const sessionId = event.session_id || "no-session";

  // Subagent spawns are H2's job (the subagent-framing hook). If H3 is ever matched on Task|Agent,
  // do not double-handle — allow unchanged.
  if (toolName === "Task" || toolName === "Agent") {
    allowSilently();
    return;
  }

  const action = describeAction(
    cfg,
    toolName,
    event.tool_input,
    typeof event.transcript_path === "string" ? event.transcript_path : "",
  );
  if (!action) {
    // No examinable action (e.g. a tool_input with no command/path). Fail-open-honest: allow.
    honestLog(cfg, `AT-ACTION-SKIP tool=${toolName} reason="no examinable action in tool_input"`);
    allowSilently();
    return;
  }

  // S9b G3: flush a pending elicitation FIRST (the previous consequential
  // action's answer is now in the transcript; its examination — and any depth
  // recalibration — should land before this action is examined). Fail-open.
  await maybeFlushElicitation(cfg, sessionId, event);

  const compiled = compileIrreversible(cfg.irreversiblePatterns);
  const guard = isGuardAction(cfg, toolName, action, compiled);

  if (guard) {
    await runGuard(cfg, { sessionId, toolName, action });
    return;
  }

  // S1 targeting (build-plan §3.1): the auto-CONSULT (SCORE) floor catches TOOL-MANIFESTED file
  // decisions (Write/Edit/MultiEdit/NotebookEdit + any configured consult tool) — NOT Bash. A Bash
  // wire payload carries no intent, so firing on the tool TYPE consulted before `date`/`ls` (the
  // over-fire). A non-guard Bash is therefore allowed SILENTLY by default; the housekeeping
  // classifier labels the skip, and GATE1_CONSULT_BASH=true opts the NON-housekeeping Bash back into
  // the advisory floor (read-only housekeeping stays suppressed). Reasoning decisions that no tool
  // manifests ride the declared `sage_examine` surface (S5), never a tool pattern.
  if (toolName === "Bash") {
    const housekeeping = isHousekeeping(action.bashCommand);
    if (cfg.consultBash && !housekeeping) {
      await runConsult(cfg, { sessionId, toolName, action });
      return;
    }
    honestLog(
      cfg,
      `AT-ACTION-SKIP-BASH session=${sanitizeLog(sessionId)} reason=${housekeeping ? "housekeeping" : "bash-dropped-from-score"}`,
    );
    allowSilently();
    return;
  }

  await runConsult(cfg, { sessionId, toolName, action });
}

// ---------------------------------------------------------------------------
// GUARD ROLE (D-A/D-F). NOT deduped — an irreversible action is rare and a previously-BLOCKED
// command must re-block on a retry (dedup would silently allow it). Re-checking a proceed is cheap.
// ---------------------------------------------------------------------------
/**
 * P8a (2026-08-17) — capture ONE guard-path observation. TWO INDEPENDENT SAFETY
 * PROPERTIES, and they are not the same property stated twice:
 *
 *  (1) FAIL-SOFT CAPTURE — this function can never throw. Everything is inside a
 *      total try/catch, and appendFalseHoldRecord is itself fail-soft. A broken
 *      state dir, a full disk, a malformed verdict: all swallowed.
 *
 *  (2) FAIL-SAFE GUARD — a capture failure cannot ALTER, DELAY, or FAIL the deny.
 *      This is a placement property, not a try/catch property, and it is why
 *      every call site below sits AFTER its emit. The hazard is concrete: emitBlock
 *      writes the deny JSON to stdout and runGuard then exits 0, while main()'s
 *      catch-all writes NOTHING to stdout. So a capture that threw BEFORE emitBlock
 *      would swallow the deny entirely and the irreversible action would proceed —
 *      the capture would have converted a block into an allow. Called after the
 *      emit, the deny is already on the wire and nothing downstream can retract it.
 *
 * Property (1) alone cannot establish property (2): a total try/catch makes a
 * pre-emit call site look safe in every test that only exercises the catch.
 *
 * CORRECTED 2026-08-17 (PR19 fold) — the paragraph this replaces overclaimed what
 * the fault switch below proves, and was caught contradicting the negative-battery
 * test's own honest comment for the SAME mechanism. Stated precisely now: the
 * fault switch proves property (1)'s TOTALITY behaviourally (an injected throw
 * genuinely cannot escape this function, at any of the three current call sites)
 * — it does NOT discriminate PLACEMENT. Moving a call site above its emit and
 * re-running the fault test would pass identically, because the try/catch below
 * swallows the throw regardless of where the call sits; a mutation proved this
 * directly (recorded in the negative-battery.mjs comment for this pin). Placement
 * — property (2) — is pinned separately, and more weakly, by a source-order check
 * (the call to emitBlock/emitAllowWithContext must precede the call here). A
 * refactor that extracts a helper or renames a symbol could defeat that pin
 * without defeating the fault-injection one, so the two pins are not
 * interchangeable evidence — read both, not either.
 */
function captureGuardObservation(cfg, opts) {
  try {
    // PR19 fold (2026-08-17): destructure INSIDE the try, with a default, so
    // property (1) ("this function can never throw") is a genuine signature-level
    // invariant rather than a fact that happens to hold only because every
    // current call site passes an inline object literal. Before this, a call with
    // a missing/undefined second argument would throw during parameter binding —
    // BEFORE the try block started — which is exactly the pre-emit-throw hazard
    // property (2)'s own docstring paragraph warns about, just from a different
    // cause than the one it was written to guard.
    const { sessionId, toolName, action, guard, denied } = opts || {}
    if (!cfg.falseHoldCapture) return false
    // TEST-ONLY fault injection. Named distinctly from the capture flag so it can
    // never be set by an operator following the activation runbook.
    if (process.env.GATE1_FALSE_HOLD_CAPTURE_FAULT === "throw") {
      throw new Error("injected capture fault (test-only)")
    }
    return appendFalseHoldRecord(
      cfg,
      buildGuardHoldRecord({
        guard,
        sessionId,
        tool: toolName,
        actionText: action && typeof action.summary === "string" ? action.summary : "",
        regime: action ? action.regime : "unknown",
        denied,
      }),
    )
  } catch {
    // Fail-soft: an observation is never load-bearing for safety or framing.
    return false
  }
}

async function runGuard(cfg, { sessionId, toolName, action }) {
  if (!cfg.credential) {
    // No credential ⇒ we cannot run the gate. Honor the guard fail-mode (this is the guard's outage).
    return guardOutage(cfg, sessionId, toolName, action, `credential not set (expected env ${cfg.credentialEnvVar})`);
  }
  const r = await fetchGuardrail(cfg, action.text, { riskClass: "critical" });
  if (!r.ok) return guardOutage(cfg, sessionId, toolName, action, r.reason);

  if (r.recommendation === "do_not_proceed") {
    honestLog(cfg, `GUARD-BLOCK session=${sanitizeLog(sessionId)} tool=${toolName} proximity=${r.proximity || "?"}`);
    emitBlock(
      "SageReasoning Gate (at-action guardrail) returned do_not_proceed for this irreversible action " +
        `(proximity: ${r.proximity || "unknown"}). ${r.reasoning || ""}`.trim() +
        (r.improvementHint ? ` Consider: ${r.improvementHint}` : "") +
        " This tool call is blocked. Re-examine the action, or adjust it, before retrying.",
    );
    // P8a: AFTER emitBlock, deliberately. The deny JSON is already on stdout, so
    // no failure here can retract it. Placing this line above emitBlock would
    // make a capture fault suppress the block — see captureGuardObservation.
    captureGuardObservation(cfg, { sessionId, toolName, action, guard: r, denied: true });
    process.exit(0); // the deny JSON is on stdout; exit 0.
  }

  // Allowed. Surface a caution for anything short of a clean proceed; otherwise allow silently.
  if (r.recommendation !== "proceed") {
    honestLog(cfg, `GUARD-CAUTION session=${sanitizeLog(sessionId)} tool=${toolName} rec=${r.recommendation}`);
    // S9b G3: the outer gate fired and the action PROCEEDS — inject the three-
    // sub-question elicitation (ADVISE) + arm the out-of-band capture; and
    // S9b G5: a non-proceed guard verdict is a trust-reducing observation —
    // bump the session depth floor (mid-session recalibration).
    try {
      mkdirSync(cfg.stateDir, { recursive: true });
      writeFileSync(
        elicitMarkerPath(cfg, sessionId),
        JSON.stringify({ signature: action.signature, at: new Date().toISOString() }),
      );
    } catch {
      /* best-effort — a missing marker means no capture, honestly nothing more. */
    }
    writeTrustCalibration(cfg, sessionId, { depthFloorBump: "standard" });
    // IW-7 opening 3, phase one (2026-08-25): a guard CAUTION on the guard's own
    // narrow irreversible-action allowlist is a genuine risk signal, not a
    // sparse-extraction default (the mentor's own distinction between this
    // branch and a bare consult verdict). Flag-gated; first-wins per session.
    if (cfg.closeContentVariationEnabled) {
      recordGuardCautionSignal(cfg, sessionId, { tool: toolName, proximity: r.proximity || null });
    }
    emitAllowWithContext(
      "[SageReasoning Gate 2 — at-action guardrail: CAUTION]\n" +
        `The guardrail recommends "${r.recommendation}" for this irreversible action (proximity: ${r.proximity || "unknown"}). ` +
        (r.reasoning ? `${r.reasoning} ` : "") +
        (r.improvementHint ? `Consider: ${r.improvementHint}` : "") +
        "\nThis is a caution, not a block — proceed deliberately.\n" +
        renderGate2ElicitationBlock(action.summary),
    );
    // P8a: a caution ALLOWS the tool, so it is NOT a hold (guardHold:false) — but
    // it is captured, because the coverage/loss accounting needs the attempts, not
    // only the denials. Counting a caution as a hold would make this denominator
    // incommensurable with the consult one.
    captureGuardObservation(cfg, { sessionId, toolName, action, guard: r, denied: false });
    process.exit(0);
  }
  honestLog(cfg, `GUARD-PROCEED session=${sanitizeLog(sessionId)} tool=${toolName} proximity=${r.proximity || "?"}`);
  captureGuardObservation(cfg, { sessionId, toolName, action, guard: r, denied: false });
  allowSilently();
}

function guardOutage(cfg, sessionId, toolName, action, reason) {
  honestLog(cfg, `GUARD-OUTAGE session=${sanitizeLog(sessionId)} mode=${cfg.guardFailMode} reason="${reason}"`);
  // PR19 FOLD (2026-08-17): this is the outage case buildGuardHoldRecord's own
  // docstring already promised — "an engine-unavailable ... verdict carries NO
  // assessment and NO proximity, so it cannot be classified. Those are recorded
  // as `no_assessment` and EXCLUDED from the rate rather than silently dropped."
  // That promise was UNKEPT: guardOutage never called captureGuardObservation at
  // all, so precisely the failure category most relevant to coverage/reliability
  // accounting was silently absent from the instrument's denominator. Confirmed by
  // an independent PR19 review dimension, CONFIRMED on adjudication.
  //
  // `guard` here is a MINIMAL shaped stand-in, not a real fetchGuardrail() result —
  // there is no `r` in the outage case. `assessment: null` drives
  // buildGuardHoldRecord's existing captureBasis logic to "no_assessment" exactly
  // as documented; `recommendation` names the EFFECTIVE outcome (what actually
  // happened to the tool call), not a guardrail verdict that never arrived.
  if (cfg.guardFailMode === "strict") {
    emitBlock(
      `Gate-1 at-action guardrail (strict mode) could not evaluate this irreversible action: ${reason}. ` +
        "This tool call is blocked until the examination service is reachable, or set GATE1_GUARD_FAIL_MODE=open.",
    );
    // AFTER emitBlock, deliberately — same placement discipline as every other
    // guard-path capture call: the deny is already on stdout before this runs.
    captureGuardObservation(cfg, {
      sessionId,
      toolName,
      action,
      guard: { recommendation: "do_not_proceed", assessment: null },
      denied: true,
    });
    process.exit(0);
  }
  // open: allow but record the gap in-context — never silently treated as guarded.
  emitAllowWithContext(
    "[SageReasoning Gate 2 — at-action guardrail UNAVAILABLE]\n" +
      `An irreversible-action guardrail check was attempted but did not complete (reason: ${reason}). ` +
      "This action is proceeding WITHOUT that check. Treat it as unguarded and proceed deliberately.",
  );
  // AFTER emitAllowWithContext, deliberately — same reason as above, mirrored for
  // the allow path: nothing here can retract or delay an already-emitted decision.
  captureGuardObservation(cfg, {
    sessionId,
    toolName,
    action,
    guard: { recommendation: "outage_open", assessment: null },
    denied: false,
  });
  process.exit(0);
}

// ---------------------------------------------------------------------------
// SCORE / ITERATE ROLE (D-A/D-B/D-D). Deduped per distinct decision; NEVER blocks; loop-closure
// state carries prior_feedback at the same depth; the signed assessment feeds H4's accreditation.
// ---------------------------------------------------------------------------
async function runConsult(cfg, { sessionId, toolName, action }) {
  const decisionKey = `${sessionId}|consult|${action.signature}`;

  // Dedup (D-A): fire-once per distinct decision so we do not consult before every Edit/Bash.
  if (cfg.fireOnce && decisionAlreadyFired(cfg, decisionKey)) {
    process.exit(0); // already consulted this decision — allow silently, no re-consult.
  }

  if (!cfg.credential) {
    // Consult always fails open (never blocks). Honest note, allow, do NOT mark fired (allow retry).
    honestLog(cfg, `CONSULT-OUTAGE session=${sanitizeLog(sessionId)} reason="credential not set"`);
    emitAllowWithContext(consultUnavailableNote(`credential not set (expected env ${cfg.credentialEnvVar})`));
    process.exit(0);
  }

  // S8/S9b: the standing trust-verdict read now runs BEFORE the consult (S9b
  // G5 — the mentor: "the harness reads the loop's trust profile at session
  // start … and sets the depth tier accordingly"): the first consult fetches +
  // caches it; later consults read the session cache. ADVISE text is appended
  // to the frame below, exactly as before.
  const trustAdvisory = await maybeTrustAdvisory(cfg, sessionId);

  // ITERATE (D-B): if a loop is open, carry prior_feedback at the same depth.
  // S9b G5: the trust-calibrated floor can only RAISE depth (reflexive ⇒ deep
  // REQUIRED; habitual/deliberate or a justice latch ⇒ at least standard; a
  // mid-session bump from a guard non-proceed / elicitation flag ⇒ standard).
  const loopState = readLoopState(cfg, sessionId);
  const priorFeedback = priorFeedbackFrom(loopState);
  const calibration = readTrustCalibration(cfg, sessionId);
  const depthFloor = calibratedDepthFloor(calibration);
  const depth = maxDepthOf(carriedDepth(loopState, cfg.depth), depthFloor);
  if (depthFloor && DEPTH_RANK[depthFloor] > DEPTH_RANK[carriedDepth(loopState, cfg.depth)]) {
    honestLog(
      cfg,
      `DEPTH-CALIBRATED session=${sanitizeLog(sessionId)} floor=${depthFloor} ` +
        `(aggregate=${calibration?.aggregateLevel || "none"}${calibration?.justiceCapped ? " justice-latch" : ""}${calibration?.depthFloorBump ? " bumped" : ""})` +
        (depthFloor === "deep" ? " — deep REQUIRED (reflexive); an incomplete deep consult fails open-honest, never a silent downgrade" : ""),
    );
  }

  // CREDENTIAL-CRITICAL (Slice-5c INSTRUMENT channel): this consult fetch is the SOLE R18f
  // provenance source for H4's accreditation write — the guard path (runGuard) returns no signed
  // assessment, so without this fetch the close-time accreditation rests on no examination. The
  // INJECTED FRAME this consult produces is ADVISE-only (the agent may discount it), but the FETCH
  // ITSELF is load-bearing instrumentation: strip the frame's imperative tail (done in
  // renderAtActionFrame), NEVER the fetch. Keep response_format assessment_first so r.signed carries
  // the verifiable envelope appendProvenance needs.
  const r = await fetchFrame(cfg, action.text, { depth, priorFeedback: priorFeedback || undefined });
  if (!r.ok) {
    // Outage → fail-open-honest. Do NOT mark fired (a later retry can still consult once recovered).
    honestLog(cfg, `CONSULT-OUTAGE session=${sanitizeLog(sessionId)} reason="${r.reason}"`);
    emitAllowWithContext(consultUnavailableNote(r.reason));
    process.exit(0);
  }

  // D-D provenance (flag-gated; default off ⇒ no write). Append the SIGNED assessment so H4 can carry
  // it into the accreditation write (R18f). Keyed on the real session_id (H4 reads by session_id).
  if (cfg.captureProvenance && r.signed) appendProvenance(cfg, sessionId, r.signed);

  // IW-7 opening 3, phase two (2026-08-25, mentor-unblocked on a confidence-disclosure constraint):
  // classify THIS verdict against the two disjoint triggers (proximity reflexive|habitual — high
  // confidence unconditionally; kathekon_assessment.quality === 'contrary' — graded by whether the
  // extraction's other arrays are also empty). Flag-gated; strongest-wins per session (never let a
  // later low-confidence read silently supersede an earlier high-confidence one — consult-signal.mjs).
  if (cfg.closeContentVariationEnabled) {
    const signal = classifyConsultSignal(r.verdict);
    if (signal.fires) {
      const confidence =
        signal.basis === "kathekon"
          ? computeKathekonConfidence(r.body && typeof r.body === "object" ? r.body.extraction : null)
          : signal.confidence; // 'proximity' basis is already high, unconditionally.
      recordConsultSignal(cfg, sessionId, { ...signal, confidence, tool: toolName });
    }
  }

  // D-B: classify this consult + advance the rolling loop state, mirroring the CI-4 closure rule.
  const fallbackRef = `h3-${shortHash(decisionKey)}`;
  const classified = classifyConsult(r.verdict, depth, fallbackRef);
  const adoptedCorrection = priorFeedback ? undefined : action.summary.slice(0, 160);
  const { state: nextState, event: loopEvent } = advanceLoopState(loopState, classified, adoptedCorrection);
  writeLoopState(cfg, sessionId, nextState);

  // S11 observation period (ADR-013 §7/§11 — the false-hold labelling instrument): capture THIS
  // at-action verdict's kathekon signals + the loop event to the durable false-hold record, for the
  // TS predicate (assessKathekonEngagement) to classify (false_positive vs correct_hold) over the
  // 7-day live distribution. Flag-gated (GATE1_FALSE_HOLD_CAPTURE, default off ⇒ byte-identical),
  // fail-soft; never touches stdout/exit/frame. MEASURE.
  //
  // SCOPE AMENDED 2026-08-17 (P8a). This comment previously read "CONSULT path
  // ONLY — the guard path (runGuard) is the already-proven irreversible deny, not
  // the measure-mode intervention the S11 flip binds." That exclusion is REVERSED,
  // deliberately: register P5 records that part (3) of the readiness standard has
  // no denominator precisely BECAUSE "the genuinely dangerous actions are on the
  // guard path, which writes no record". The guard path now captures too (see
  // captureGuardObservation), on the opposite side of every emit.
  if (cfg.falseHoldCapture) {
    appendFalseHoldRecord(
      cfg,
      buildFalseHoldRecord({
        verdict: r.verdict,
        sessionId,
        tool: toolName,
        depth,
        loopEvent,
        // S11b: the preview stays the LEAN summary (PII-light, identifies the
        // action); the composed examined text is characterised by inputClass +
        // extractionRegime + composedChars (the ADR-014 regime mark — delta
        // computations must never compare across a regime boundary).
        actionText: action.summary,
        carriedPrior: !!priorFeedback,
        inputClass: action.inputClass,
        regime: action.regime,
        composedChars: action.text.length,
      }),
    );
  }

  // Inject the at-action frame (redirection + proximity + loop status + any abandoned loops). Never blocks.
  // (The S8 standing trust advisory moved ABOVE the consult — S9b G5 — and is appended here unchanged.
  //  S11b item-5: a bare tool payload additionally carries the T2-SOFT ask — an observation inviting
  //  the agent to narrate affected parties in-conversation; NEVER a halt on this surface.)
  emitAllowWithContext(
    renderAtActionFrame(r.verdict, loopEvent, priorFeedback, nextState.abandonedRefs) +
      (action.bare ? "\n" + renderBareInputNote() : "") +
      trustAdvisory,
  );
  markDecisionFired(cfg, decisionKey, `${toolName} ${loopEvent}`);
  honestLog(
    cfg,
    `CONSULT session=${sanitizeLog(sessionId)} tool=${toolName} depth=${depth} loop=${loopEvent} proximity=${r.verdict.katorthoma_proximity || "?"}${priorFeedback ? " carried-prior=yes" : ""} class=${action.inputClass} regime=${action.regime}`,
  );
  process.exit(0);
}

function consultUnavailableNote(reason) {
  return (
    "[SageReasoning Gate 2 — at-action examination UNAVAILABLE]\n" +
    `An at-action Stoic examination was attempted for this action but did not complete (reason: ${reason}). ` +
    "This action is proceeding WITHOUT that frame. Treat the reasoning as unexamined and proceed deliberately."
  );
}

function sanitizeLog(s) {
  return String(s || "no-session").replace(/[^a-zA-Z0-9._-]/g, "_");
}

// Catch-all: any unexpected error resolves to an honest log + ALLOW (open posture — a hook bug must
// never silently block a tool). The guard's deliberate block is handled inside runGuard only.
main().catch((e) => {
  try {
    honestLog(
      loadConfig({ hookDir: HOOK_DIR, eventName: "PreToolUse", allowStrict: true }),
      `AT-ACTION-ERROR reason="internal hook error: ${e?.message || e}"`,
    );
  } catch {
    /* logging must never throw */
  }
  process.exit(0); // last resort: allow the tool (do not hard-block on a hook bug).
});
