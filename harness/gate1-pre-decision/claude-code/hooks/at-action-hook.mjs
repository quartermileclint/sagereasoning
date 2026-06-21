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
  MAX_CONTEXT_CHARS,
} from "./lib/framing-core.mjs";
import {
  appendProvenance,
  readLoopState,
  writeLoopState,
  decisionAlreadyFired,
  markDecisionFired,
} from "./lib/session-state.mjs";
import {
  classifyConsult,
  advanceLoopState,
  priorFeedbackFrom,
  carriedDepth,
} from "./lib/loop-closure.mjs";

const HOOK_DIR = dirname(fileURLToPath(import.meta.url)); // …/claude-code/hooks

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
// Derive a human-readable ACTION description from a tool call (what we examine), plus a stable
// DECISION SIGNATURE for the fire-once-per-distinct-decision dedup (D-A). For file edits the
// signature is the file path (repeated edits to one file = one decision); for Bash it is a hash of
// the command (an identical re-run dedups; a different command is a new decision).
// ---------------------------------------------------------------------------
function describeAction(toolName, toolInput) {
  const ti = toolInput && typeof toolInput === "object" ? toolInput : {};
  switch (toolName) {
    case "Bash": {
      const cmd = typeof ti.command === "string" ? ti.command.trim() : "";
      if (!cmd) return null;
      return { text: `Run this shell command: ${cmd}`, signature: `Bash:${shortHash(cmd)}`, bashCommand: cmd };
    }
    case "Edit":
    case "MultiEdit": {
      const fp = typeof ti.file_path === "string" ? ti.file_path : "";
      if (!fp) return null;
      const snippet = typeof ti.new_string === "string" ? ti.new_string.slice(0, 200) : "";
      return {
        text: `Edit the file ${fp}${snippet ? ` — applying this change: ${snippet}` : ""}`,
        signature: `${toolName}:${fp}`,
        bashCommand: null,
      };
    }
    case "Write": {
      const fp = typeof ti.file_path === "string" ? ti.file_path : "";
      if (!fp) return null;
      const len = typeof ti.content === "string" ? ti.content.length : 0;
      return { text: `Write (create/overwrite) the file ${fp} (${len} chars)`, signature: `Write:${fp}`, bashCommand: null };
    }
    case "NotebookEdit": {
      const fp = typeof ti.notebook_path === "string" ? ti.notebook_path : "";
      if (!fp) return null;
      return { text: `Edit notebook cell in ${fp}`, signature: `NotebookEdit:${fp}`, bashCommand: null };
    }
    default: {
      // Unknown consequential tool (e.g. an MCP tool in guardTools). Describe generically.
      let blob = "";
      try {
        blob = JSON.stringify(ti).slice(0, 300);
      } catch {
        blob = "";
      }
      return { text: `Invoke tool ${toolName}${blob ? ` with ${blob}` : ""}`, signature: `${toolName}:${shortHash(blob)}`, bashCommand: null };
    }
  }
}

// Is this action in the GUARD set (irreversible → guardrail can block)? Either the tool is in the
// explicit guardTools list, or it is a Bash command matching an irreversible pattern.
function isGuardAction(cfg, toolName, action, compiled) {
  if (cfg.guardTools.includes(toolName)) return true;
  if (toolName === "Bash" && action.bashCommand) {
    return compiled.some((re) => re.test(action.bashCommand));
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

  const action = describeAction(toolName, event.tool_input);
  if (!action) {
    // No examinable action (e.g. a tool_input with no command/path). Fail-open-honest: allow.
    honestLog(cfg, `AT-ACTION-SKIP tool=${toolName} reason="no examinable action in tool_input"`);
    allowSilently();
    return;
  }

  const compiled = compileIrreversible(cfg.irreversiblePatterns);
  const guard = isGuardAction(cfg, toolName, action, compiled);

  if (guard) {
    await runGuard(cfg, { sessionId, toolName, action });
  } else {
    await runConsult(cfg, { sessionId, toolName, action });
  }
}

// ---------------------------------------------------------------------------
// GUARD ROLE (D-A/D-F). NOT deduped — an irreversible action is rare and a previously-BLOCKED
// command must re-block on a retry (dedup would silently allow it). Re-checking a proceed is cheap.
// ---------------------------------------------------------------------------
async function runGuard(cfg, { sessionId, toolName, action }) {
  if (!cfg.credential) {
    // No credential ⇒ we cannot run the gate. Honor the guard fail-mode (this is the guard's outage).
    return guardOutage(cfg, sessionId, action, `credential not set (expected env ${cfg.credentialEnvVar})`);
  }
  const r = await fetchGuardrail(cfg, action.text, { riskClass: "critical" });
  if (!r.ok) return guardOutage(cfg, sessionId, action, r.reason);

  if (r.recommendation === "do_not_proceed") {
    honestLog(cfg, `GUARD-BLOCK session=${sanitizeLog(sessionId)} tool=${toolName} proximity=${r.proximity || "?"}`);
    emitBlock(
      "SageReasoning Gate (at-action guardrail) returned do_not_proceed for this irreversible action " +
        `(proximity: ${r.proximity || "unknown"}). ${r.reasoning || ""}`.trim() +
        (r.improvementHint ? ` Consider: ${r.improvementHint}` : "") +
        " This tool call is blocked. Re-examine the action, or adjust it, before retrying.",
    );
    process.exit(0); // the deny JSON is on stdout; exit 0.
  }

  // Allowed. Surface a caution for anything short of a clean proceed; otherwise allow silently.
  if (r.recommendation !== "proceed") {
    honestLog(cfg, `GUARD-CAUTION session=${sanitizeLog(sessionId)} tool=${toolName} rec=${r.recommendation}`);
    emitAllowWithContext(
      "[SageReasoning Gate 2 — at-action guardrail: CAUTION]\n" +
        `The guardrail recommends "${r.recommendation}" for this irreversible action (proximity: ${r.proximity || "unknown"}). ` +
        (r.reasoning ? `${r.reasoning} ` : "") +
        (r.improvementHint ? `Consider: ${r.improvementHint}` : "") +
        "\nThis is a caution, not a block — proceed deliberately.",
    );
    process.exit(0);
  }
  honestLog(cfg, `GUARD-PROCEED session=${sanitizeLog(sessionId)} tool=${toolName} proximity=${r.proximity || "?"}`);
  allowSilently();
}

function guardOutage(cfg, sessionId, action, reason) {
  honestLog(cfg, `GUARD-OUTAGE session=${sanitizeLog(sessionId)} mode=${cfg.guardFailMode} reason="${reason}"`);
  if (cfg.guardFailMode === "strict") {
    emitBlock(
      `Gate-1 at-action guardrail (strict mode) could not evaluate this irreversible action: ${reason}. ` +
        "This tool call is blocked until the examination service is reachable, or set GATE1_GUARD_FAIL_MODE=open.",
    );
    process.exit(0);
  }
  // open: allow but record the gap in-context — never silently treated as guarded.
  emitAllowWithContext(
    "[SageReasoning Gate 2 — at-action guardrail UNAVAILABLE]\n" +
      `An irreversible-action guardrail check was attempted but did not complete (reason: ${reason}). ` +
      "This action is proceeding WITHOUT that check. Treat it as unguarded and proceed deliberately.",
  );
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

  // ITERATE (D-B): if a loop is open, carry prior_feedback at the same depth.
  const loopState = readLoopState(cfg, sessionId);
  const priorFeedback = priorFeedbackFrom(loopState);
  const depth = carriedDepth(loopState, cfg.depth);

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

  // D-B: classify this consult + advance the rolling loop state, mirroring the CI-4 closure rule.
  const fallbackRef = `h3-${shortHash(decisionKey)}`;
  const classified = classifyConsult(r.verdict, depth, fallbackRef);
  const adoptedCorrection = priorFeedback ? undefined : action.text.slice(0, 160);
  const { state: nextState, event: loopEvent } = advanceLoopState(loopState, classified, adoptedCorrection);
  writeLoopState(cfg, sessionId, nextState);

  // Inject the at-action frame (redirection + proximity + loop status + any abandoned loops). Never blocks.
  emitAllowWithContext(renderAtActionFrame(r.verdict, loopEvent, priorFeedback, nextState.abandonedRefs));
  markDecisionFired(cfg, decisionKey, `${toolName} ${loopEvent}`);
  honestLog(
    cfg,
    `CONSULT session=${sanitizeLog(sessionId)} tool=${toolName} depth=${depth} loop=${loopEvent} proximity=${r.verdict.katorthoma_proximity || "?"}${priorFeedback ? " carried-prior=yes" : ""}`,
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
