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
import {
  loadConfig,
  readStdin,
  runFraming,
  fail,
  maybeDebugDump,
  renderFrame,
  honestLog,
  shortHash,
  FRAME_SENTINEL,
} from "./lib/framing-core.mjs";

const HOOK_DIR = dirname(fileURLToPath(import.meta.url)); // …/claude-code/hooks

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

  // Emit strategy: prepend the frame to the subagent's prompt via PreToolUse updatedInput, so the
  // subagent reasons FROM the examined frame. Other tool_input fields (subagent_type, description)
  // are preserved.
  const emit = (_cfg, verdict) => {
    const framed = renderFrame(verdict) + "\n\n--- (your task follows) ---\n\n" + task;
    process.stdout.write(
      JSON.stringify({
        hookSpecificOutput: {
          hookEventName: "PreToolUse",
          updatedInput: { ...toolInput, prompt: framed },
        },
      }),
    );
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
