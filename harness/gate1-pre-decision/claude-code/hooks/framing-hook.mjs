#!/usr/bin/env node
/**
 * SageReasoning — Gate 1 pre-decision framing hook (Claude Code `UserPromptSubmit`)
 * Arc 2.  Governing design: adopted/adr/2026-06-20-pre-decision-harness-arc2.md (ADR-011).
 *
 * WHAT IT DOES
 *   Fires once per session, BEFORE the model processes the task (UserPromptSubmit runs
 *   pre-inference). It POSTs the raw task to /api/reason in framing posture
 *   (response_format:"assessment_first", quick/standard depth — never deep, per ADR-011 D3),
 *   then injects the returned Stoic frame (circles, control-filter, passions-to-watch,
 *   kathekon, proximity) as `additionalContext` so the agent reasons FROM an examined frame.
 *   This converts Gate 1 from "confirmation after the decision" into "frame before reasoning"
 *   — the thing a self-directed agent will not reliably do itself (Arm-1 evidence).
 *
 *   The shared examination/render/fail logic lives in ./lib/framing-core.mjs; this file is the
 *   thin `UserPromptSubmit` entry point. The sibling subagent entry (a `PreToolUse` hook matched to
 *   the subagent-spawn tool, Slice 3) is subagent-framing-hook.mjs.
 *
 * WIRE CONTRACT (verified first-hand against code.claude.com/docs/en/hooks, 2026-06-20):
 *   - STDIN  : JSON { session_id, transcript_path, cwd, permission_mode, hook_event_name, prompt }
 *   - STDOUT : on exit 0, the ONLY thing printed is the JSON object:
 *                {"hookSpecificOutput":{"hookEventName":"UserPromptSubmit","additionalContext":"…"}}
 *              (capped at 10,000 chars; inserted alongside the prompt before the model reasons).
 *   - EXIT 0 : allow the prompt (with our injected context).
 *   - EXIT 2 : block the prompt + erase it; stderr is fed to Claude. Used only in STRICT fail mode.
 *              (UserPromptSubmit "Can block? Yes" per the hooks exit-code table — so strict is real here.)
 *   - Any other exit code is a NON-blocking error (execution continues) — we never rely on that;
 *     we route every failure through the configured fail mode so the outcome is explicit + honest.
 *   - UserPromptSubmit ignores `matcher` and fires on EVERY prompt → the fire-once-per-session
 *     guard lives here (a per-session marker file), not in config.
 *
 * FAIL MODES (ADR-011 D4): "open" (default) injects an honest UNAVAILABLE note + proceeds;
 *   "strict" blocks (exit 2). KG1: fail-honest at the boundary — never a false "framed".
 *
 * No third-party dependencies. Node 18+ (global fetch + AbortSignal.timeout).
 */

import { dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { loadConfig, readStdin, runFraming, fail, maybeDebugDump, honestLog } from "./lib/framing-core.mjs";
import {
  loadDiscernmentConfig,
  resolveDeclaredPurpose,
  callingGateMode,
  renderCallingElicitation,
  renderPurposeOrientation,
} from "./lib/discernment.mjs";

const HOOK_DIR = dirname(fileURLToPath(import.meta.url)); // …/claude-code/hooks

async function main() {
  // UserPromptSubmit CAN block (exit 2), so strict mode is reachable here (allowStrict: true).
  const cfg = loadConfig({ hookDir: HOOK_DIR, eventName: "UserPromptSubmit", allowStrict: true });

  const raw = readStdin();
  maybeDebugDump(cfg, raw); // GATE1_DEBUG → dump the raw UserPromptSubmit stdin (diagnostic).
  let event = {};
  try {
    event = JSON.parse(raw || "{}");
  } catch {
    return fail(cfg, "could not parse hook stdin");
  }

  const sessionKey = event.session_id || "no-session";
  const task = typeof event.prompt === "string" ? event.prompt.trim() : "";

  // ── S9b G1a — the calling gate (ADR-013 §11): a declared purpose orients the
  // opening examination; a purposeless session is the circular-examination
  // problem. MEASURE (default): log + inject the calling elicitation as ADVISE.
  // ENFORCE (GATE1_CALLING_GATE_MODE=enforce — the S11 activation arm, dark
  // until then): the mentor's HARD gate — block the prompt (exit 2) until a
  // purpose is declared. Fail-soft: a gate error never breaks the framing. ──
  let preface = "";
  try {
    const dcfg = loadDiscernmentConfig(cfg, HOOK_DIR);
    // UN-PROVISIONED BYTE-IDENTITY (the S8 standing invariant, battery-asserted):
    // with no discernment config AND no explicit calling-gate configuration, the
    // gate does not engage at all — a pre-S8 install's H1 stays byte-identical.
    const explicitlyConfigured =
      !!(process.env.GATE1_CALLING_GATE_MODE || "").trim() ||
      !!(process.env.GATE1_DECLARED_PURPOSE || "").trim();
    if (dcfg || explicitlyConfigured) {
      const purpose = resolveDeclaredPurpose(dcfg);
      if (purpose.declared) {
        preface = renderPurposeOrientation(purpose.declared, purpose.source);
      } else {
        const mode = callingGateMode();
        honestLog(cfg, `CALLING-GATE session=${sessionKey} purposeless mode=${mode}`);
        if (mode === "enforce") {
          process.stderr.write(renderCallingElicitation());
          process.exit(2); // the hard gate — no task frame before a purpose exists (G1a; S11-armed).
        }
        preface = renderCallingElicitation();
      }
    }
  } catch {
    /* the calling gate must never break the frame — fall through unprefaced. */
  }

  await runFraming(cfg, { sessionKey, task, logLabel: "FRAMED", preface });
}

// Catch-all: any unexpected error still resolves through the fail handler (honest + mode-correct),
// never an ambiguous crash. We reload config defensively in case the throw was inside loadConfig.
main().catch((e) => {
  try {
    fail(loadConfig({ hookDir: HOOK_DIR, eventName: "UserPromptSubmit", allowStrict: true }), `internal hook error: ${e?.message || e}`);
  } catch {
    process.exit(0); // last resort: do not hard-block the user's session on a hook bug (open posture).
  }
});
