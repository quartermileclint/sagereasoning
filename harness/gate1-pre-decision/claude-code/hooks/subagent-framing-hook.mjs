#!/usr/bin/env node
/**
 * SageReasoning — Gate 1 pre-decision framing hook for SUBAGENTS
 * (Claude Code `PreToolUse`, matched to the subagent-spawn tool: `Task` / `Agent`).
 * Arc 2 / Slice 3.  Governing design: adopted/adr/2026-06-20-pre-decision-harness-arc2.md (ADR-011).
 *
 * WHAT IT DOES
 *   Fires BEFORE a delegated subagent runs. PreToolUse delivers the about-to-spawn subagent's task
 *   on stdin as `tool_input.prompt`. This hook POSTs that task to /api/reason in framing posture
 *   (response_format:"assessment_first", quick/standard — never deep, ADR-011 D3) and PREPENDS the
 *   returned Stoic frame to the subagent's prompt via PreToolUse `updatedInput`, so the SUBAGENT
 *   reasons FROM an examined frame. It converts a delegated task from "the subagent decides on
 *   contact with the brief" into "frame before the subagent reasons" — the same value the
 *   UserPromptSubmit hook delivers for the top-level agent, now for delegated work.
 *
 * S8 EXTENSION (Trust Layer — ADR-013 §4/§6): when the discernment surface is PROVISIONED
 *   (discernment.config.json + credential; see lib/discernment.mjs), the hook ALSO runs the
 *   spawn-time four-layer discernment + the out-of-band L4 passion audit via the dark
 *   /api/practice/discernment route (INSTRUMENT channel — the hook does it on its own credential),
 *   prepends the returned A9 AUTHORITY-BOUNDARY scope statement to the delegated prompt
 *   (deterministic injection), writes the spawn record the hand-back hook (H5) reads, and appends
 *   the discernment/L4 outcome + signed extraction artifacts to the observability JSONL. MEASURE:
 *   the recommendation never blocks or swaps the spawn; a discernment outage fails open with an
 *   honest log. Un-provisioned ⇒ this hook is byte-identical to its pre-S8 behaviour.
 *
 * WHY PreToolUse-on-Agent (the Slice-2 correction)
 *   `UserPromptSubmit` does NOT fire for subagents. The `SubagentStart` COMMAND-hook stdin carries
 *   NO `prompt` (verified live 2026-06-20: { session_id, transcript_path, cwd, agent_id, agent_type,
 *   hook_event_name }) so it has nothing to examine and cannot block. A `PreToolUse` hook matched to
 *   the subagent-spawn tool gets the subagent prompt in `tool_input` AND can block — so STRICT
 *   (fail-closed) is reachable here too, unlike SubagentStart. (ADR-011 §Slice 2/3.)
 *
 * WIRE CONTRACT (PreToolUse command hook; verified against code.claude.com/docs/en/hooks, 2026-06-20):
 *   - STDIN  : { session_id, transcript_path, cwd, permission_mode, hook_event_name:"PreToolUse",
 *               tool_name, tool_input }.  For the subagent-spawn tool, `tool_input` carries the task
 *               at `.prompt` (alongside `.description`, `.subagent_type`).
 *               Live-verified 2026-06-21: the real tool_name is `Agent` (NOT `Task`) and the task
 *               sits at `tool_input.prompt`; `updatedInput` is applied (the subagent's transcript
 *               shows its prompt leads with the frame). The matcher `Task|Agent` is kept for
 *               portability to builds that use `Task`, and this hook reads `tool_input.prompt` either
 *               way. If `tool_input.prompt` is absent, the hook fails honestly (never a false frame).
 *   - STDOUT : on exit 0, the JSON object
 *               {"hookSpecificOutput":{"hookEventName":"PreToolUse","updatedInput":{…prompt prepended}}}
 *              replaces the tool input so the subagent's prompt now leads with the examined frame.
 *   - EXIT 0 : allow the spawn (with the framed prompt).
 *   - EXIT 2 : block the spawn; stderr is fed to Claude. Used only in STRICT fail mode.
 *
 * RECURSIVE-LOOP GUARD (ADR-011 Slice 3): the examination is an HTTP `fetch` to /api/reason — NOT a
 *   Claude Code tool/subagent invocation — so it structurally CANNOT re-trigger this (or any) hook.
 *   Belt-and-suspenders: if the incoming prompt ALREADY carries a Gate-1 frame (FRAME_SENTINEL), the
 *   hook allows the spawn unchanged (no re-framing) — an already-framed task is not re-examined.
 *
 * FAIL MODES (ADR-011 D4): "open" (default) injects an honest UNAVAILABLE note + allows the spawn;
 *   "strict" blocks (exit 2). KG1: fail-honest at the boundary — never a false "framed".
 *
 * No third-party dependencies. Node 18+ (global fetch + AbortSignal.timeout).
 */

import { dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { existsSync } from "node:fs";
import {
  loadConfig,
  readStdin,
  runFraming,
  fail,
  maybeDebugDump,
  renderFrame,
  honestLog,
  shortHash,
  markerPath,
  FRAME_SENTINEL,
} from "./lib/framing-core.mjs";
import {
  loadDiscernmentConfig,
  discernmentEnabled,
  readTranscriptTail,
  buildSpawnPayload,
  fetchDiscernment,
  readSpawnRecord,
  writeSpawnRecord,
  writeSpawnAlias,
  appendObservability,
  makeSpanRef,
} from "./lib/discernment.mjs";
import { redactSchemaFields } from "./lib/schema-redaction.mjs";

const HOOK_DIR = dirname(fileURLToPath(import.meta.url)); // …/claude-code/hooks

// ---------------------------------------------------------------------------
// S8 — spawn-time discernment + the out-of-band L4 audit (Verification layer).
// Channel law: the POST is INSTRUMENT (the hook does it on its own credential;
// no agent is asked); the returned AUTHORITY BOUNDARY is injected
// deterministically into the delegated prompt; the RECOMMENDATION is ADVISE
// (MEASURE — it never blocks or swaps the spawn; the orchestrator selected).
// Un-provisioned (no discernment.config.json / no credential) ⇒ returns "" fast
// and H2 stays BYTE-IDENTICAL to pre-S8 (battery-asserted). Fail-open honest:
// a discernment outage never blocks the spawn — the frame still injects.
// ---------------------------------------------------------------------------
async function runSpawnDiscernmentStep(cfg, event, { spawnKey, task, toolInput }) {
  const dcfg = loadDiscernmentConfig(cfg, HOOK_DIR);
  if (!discernmentEnabled(cfg, dcfg)) return "";

  // If the FRAME already fired for this spawn (the .framed marker), the emit below
  // will never run again — a discernment call could not deliver its boundary, so it
  // would be pure cost. Skip (review fold F2 — no wasted extraction fan-out).
  try {
    if (cfg.fireOnce && existsSync(markerPath(cfg, spawnKey))) return "";
  } catch {
    /* cannot check → proceed (bounded by the spawn-record guard below) */
  }

  // Fire-once per spawn: the spawn record doubles as the marker. A record whose
  // boundary was NOT yet delivered (a prior frame outage) returns the STORED
  // boundary so the retry emit can still deliver it — no second discernment POST.
  const existing = readSpawnRecord(cfg, spawnKey);
  if (existing) {
    if (existing.boundary_delivered !== true && typeof existing.boundary_injection === "string") {
      return existing.boundary_injection;
    }
    return "";
  }

  const sessionId = event.session_id || "no-session";
  const subagentType = typeof toolInput.subagent_type === "string" ? toolInput.subagent_type : "";
  // The out-of-band trace (A7): the harness reads the transcript's trailing
  // assistant text — never an account the orchestrator is asked to give. An
  // unreadable transcript yields "" and the server holds honestly (audit-unavailable).
  const rawTrace = readTranscriptTail(event.transcript_path, dcfg.traceMaxChars);
  // A11b HARNESS-SIDE REDACTION (S9, 2026-09-06; mentor Part 4). The trace is
  // the ONLY field of this payload the server extracts (the L4 audit runs
  // extractFeatures over it), so it is the only field the defence can reject —
  // and on a substrate session a transcript tail is full of the token class by
  // construction, which is why the discernment call used to 503. Applied AFTER
  // readTranscriptTail's own truncation, for the reason given in
  // lib/schema-redaction.mjs. `delegated_task_preview` and the profile blocks
  // are deliberately NOT redacted: the server does not examine them, so
  // shaping them would alter text nobody reads.
  const redactedTrace = redactSchemaFields(rawTrace);
  const trace = redactedTrace.text;
  const payload = buildSpawnPayload(dcfg, { taskRef: spawnKey, subagentType, taskText: task, trace });

  const t0 = Date.now();
  const r = await fetchDiscernment(cfg, dcfg, payload);
  if (!r.ok) {
    honestLog(
      cfg,
      `DISCERN-OUTAGE session=${shortHash(sessionId)} spawn=${spawnKey} reason="${r.reason}"` +
        (redactedTrace.count ? ` redacted=${redactedTrace.count}` : "")
    );
    return ""; // fail-open: the frame still injects; nothing false recorded.
  }

  const result = r.body.result || {};
  const rec = result.discernment && result.discernment.recommendation ? result.discernment.recommendation : {};
  const l4 = result.l4 || null;
  const boundary = typeof result.boundaryInjection === "string" ? result.boundaryInjection : "";
  const justicePresent = payload.task_profile.justiceSurface.present === true;

  // Lifecycle record for the hand-back hook (H5) — what this spawn knew. `briefed`
  // is FALSE here (review fold F2): the boundary has not reached the sub-agent yet —
  // the emit marks briefed/boundary_delivered only after actual delivery, so a frame
  // outage can never leave a falsely-briefed A9 record (the lenient-case-1 bias).
  writeSpawnRecord(cfg, spawnKey, {
    task_ref: spawnKey,
    session_id: sessionId,
    subagent_type: subagentType,
    chosen_candidate_ref: result.chosen ? result.chosen.candidateRef : null,
    justice_present: justicePresent,
    boundary_injection: boundary,
    boundary_has_justice_note: boundary.includes("Justice surface"),
    boundary_delivered: false,
    briefed: false,
    l4_finalization: l4 && l4.outcome ? l4.outcome.finalization : null,
    // Tamper-evidence (review fold F1): the L4 commit note surfaces a write-once
    // refusal — a pre-existing (possibly self-supplied) L4 record is VISIBLE here.
    l4_commit_written: l4 && l4.commit ? l4.commit.written === true : false,
    l4_commit_note: l4 && l4.commit && typeof l4.commit.note === "string" ? l4.commit.note : null,
    created_at: new Date().toISOString(),
  });

  // Observability (durable provenance; OTel-GenAI-shaped span ref — design-for).
  appendObservability(
    cfg,
    sessionId,
    "discernment-spawn",
    {
      task_ref: spawnKey,
      subagent_type: subagentType,
      recommendation: rec.recommendedAgentRef ?? null,
      chosen: result.chosen ?? null,
      selection_committed: result.selection ? result.selection.committed === true : false,
      l4_status: l4 && l4.outcome ? l4.outcome.status : null,
      l4_finalization: l4 && l4.outcome ? l4.outcome.finalization : null,
      l4_commit_written: l4 && l4.commit ? l4.commit.written === true : false,
      l4_commit_note: l4 && l4.commit && typeof l4.commit.note === "string" ? l4.commit.note : null,
      l4_artifacts: Array.isArray(r.body.l4_artifacts) ? r.body.l4_artifacts : [],
      mode: "measure",
    },
    makeSpanRef("sage_practice.discernment.spawn", t0, Date.now()),
  );

  honestLog(
    cfg,
    `DISCERN session=${shortHash(sessionId)} spawn=${spawnKey} rec=${rec.recommendedAgentRef || "none"} ` +
      `chosen=${result.chosen ? result.chosen.candidateRef : "?"} l4=${l4 && l4.outcome ? l4.outcome.finalization : "?"} ` +
      `l4commit=${l4 && l4.commit && l4.commit.written === true ? "written" : "not-written"} mode=measure` +
      (redactedTrace.count ? ` redacted=${redactedTrace.count}` : ""),
  );
  return boundary;
}

// Mark the boundary DELIVERED (and the sub-agent BRIEFED when the justice note rode
// it) — called from inside the emit, i.e. only after the injected prompt actually
// carried the boundary (review fold F2). Fails soft.
function markBoundaryDelivered(cfg, spawnKey) {
  const record = readSpawnRecord(cfg, spawnKey);
  if (!record) return;
  writeSpawnRecord(cfg, spawnKey, {
    ...record,
    boundary_delivered: true,
    briefed: record.justice_present === true && record.boundary_has_justice_note === true,
  });
}

async function main() {
  // PreToolUse CAN block (exit 2), so STRICT mode is reachable for subagents too (allowStrict: true).
  const cfg = loadConfig({ hookDir: HOOK_DIR, eventName: "PreToolUse", allowStrict: true });

  const raw = readStdin();
  maybeDebugDump(cfg, raw); // GATE1_DEBUG → dump the raw PreToolUse stdin (confirms tool_name live).
  let event = {};
  try {
    event = JSON.parse(raw || "{}");
  } catch {
    return fail(cfg, "could not parse hook stdin");
  }

  const toolInput =
    event.tool_input && typeof event.tool_input === "object" ? event.tool_input : {};
  const task = typeof toolInput.prompt === "string" ? toolInput.prompt.trim() : "";

  // RECURSIVE-LOOP / already-framed guard: never re-frame a prompt that already carries the frame.
  if (task.includes(FRAME_SENTINEL)) {
    honestLog(cfg, `SKIP-ALREADY-FRAMED event=PreToolUse tool=${event.tool_name || "?"}`);
    process.exit(0); // allow the spawn unchanged
  }

  // Fire-once is PER-SUBAGENT-SPAWN (each delegated task is framed once; an identical re-delegation
  // of the same task within the same session is not re-consulted). Keyed on session + task text.
  const sessionKey = "sub-" + shortHash(`${event.session_id || "no-session"}|${task}`);

  // S8: spawn-time discernment + L4 audit (Verification layer). Returns the A9
  // authority-boundary block to prepend, or "" (un-provisioned / outage / already
  // fired) — in which case the emit below is BYTE-IDENTICAL to pre-S8.
  const boundaryBlock = await runSpawnDiscernmentStep(cfg, event, { spawnKey: sessionKey, task, toolInput });

  // Emit strategy: prepend the (optional) A9 authority boundary + the frame to the subagent's
  // prompt via PreToolUse updatedInput, so the subagent reasons FROM the examined frame within its
  // attenuated scope. Other tool_input fields (subagent_type, description) are preserved.
  const emit = (_cfg, verdict) => {
    const prefix = boundaryBlock ? boundaryBlock + "\n\n" : "";
    const framed = prefix + renderFrame(verdict) + "\n\n--- (your task follows) ---\n\n" + task;
    process.stdout.write(
      JSON.stringify({
        hookSpecificOutput: {
          hookEventName: "PreToolUse",
          updatedInput: { ...toolInput, prompt: framed },
        },
      }),
    );
    // The boundary has now actually reached the delegated prompt — only NOW may the
    // spawn record claim delivery/briefing (review fold F2).
    if (boundaryBlock) markBoundaryDelivered(cfg, sessionKey);
    // Alias the EXACT prompt the sub-agent will receive → this spawn key, so H5
    // resolves the record by lookup instead of re-deriving it from orchestrator-
    // controlled task text (review fold G2). No-ops when no spawn record exists.
    writeSpawnAlias(cfg, event.session_id || "no-session", framed, sessionKey);
  };

  await runFraming(cfg, { sessionKey, task, logLabel: "FRAMED-SUBAGENT", emit });
}

// Catch-all: any unexpected error still resolves through the fail handler (honest + mode-correct),
// never an ambiguous crash. We reload config defensively in case the throw was inside loadConfig.
main().catch((e) => {
  try {
    fail(
      loadConfig({ hookDir: HOOK_DIR, eventName: "PreToolUse", allowStrict: true }),
      `internal hook error: ${e?.message || e}`,
    );
  } catch {
    process.exit(0); // last resort: do not hard-block the spawn on a hook bug (open posture).
  }
});
