#!/usr/bin/env node
/**
 * SageReasoning — Gate 1 pre-decision framing hook (Claude Code `UserPromptSubmit`)
 * Arc 2, Slice 1.  Governing design: adopted/adr/2026-06-20-pre-decision-harness-arc2.md (ADR-011).
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
 * WIRE CONTRACT (verified first-hand against code.claude.com/docs/en/hooks, 2026-06-20):
 *   - STDIN  : JSON { session_id, transcript_path, cwd, permission_mode, hook_event_name, prompt }
 *   - STDOUT : on exit 0, the ONLY thing printed is the JSON object:
 *                {"hookSpecificOutput":{"hookEventName":"UserPromptSubmit","additionalContext":"…"}}
 *              (capped at 10,000 chars; inserted alongside the prompt before the model reasons).
 *   - EXIT 0 : allow the prompt (with our injected context).
 *   - EXIT 2 : block the prompt + erase it; stderr is fed to Claude. Used only in STRICT fail mode.
 *   - Any other exit code is a NON-blocking error (execution continues) — we never rely on that;
 *     we route every failure through the configured fail mode so the outcome is explicit + honest.
 *   - UserPromptSubmit ignores `matcher` and fires on EVERY prompt → the fire-once-per-task
 *     guard lives here (a per-session marker file), not in config.
 *
 * FAIL MODES (ADR-011 D4):
 *   - "open"   (default): if framing is unavailable, proceed AND inject an HONEST note that the
 *              task is unframed (R18 — never silently treated as framed). Exit 0. The success
 *              marker is NOT written, so a later turn may retry once the service recovers.
 *   - "strict"          : if framing is unavailable, BLOCK the task (exit 2) with an honest stderr
 *              message. Favours correctness over availability.
 *
 * KG1: fail-honest at the boundary — in "open" we record the gap; in "strict" we block. Never a
 *      false "framed". A bug anywhere routes through the fail handler, never an ambiguous crash.
 *
 * No third-party dependencies. Node 18+ (global fetch + AbortSignal.timeout).
 */

import { existsSync, mkdirSync, writeFileSync, appendFileSync, readFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const HOOK_DIR = dirname(fileURLToPath(import.meta.url));
const MAX_CONTEXT_CHARS = 9500; // headroom under Claude Code's 10,000-char cap on additionalContext.

// ---------------------------------------------------------------------------
// Configuration. Precedence: explicit env override > config file > built-in default.
// The credential is NEVER stored in config or code — it is read from an env var
// (default name SAGE_GATE1_CREDENTIAL), so it never lands in the repo.
// ---------------------------------------------------------------------------
function loadConfig() {
  let fileCfg = {};
  const cfgPath =
    process.env.GATE1_CONFIG ||
    join(HOOK_DIR, "..", "gate1.config.json"); // sibling of /hooks, next to the example
  try {
    if (existsSync(cfgPath)) fileCfg = JSON.parse(readFileSync(cfgPath, "utf8"));
  } catch {
    // A malformed config file must not crash the hook — fall back to defaults + env.
    fileCfg = {};
  }

  const cfg = {
    endpoint: process.env.GATE1_ENDPOINT || fileCfg.endpoint || "http://localhost:3000/api/reason",
    depth: process.env.GATE1_DEPTH || fileCfg.depth || "standard", // quick | standard (never deep — D3)
    failMode: process.env.GATE1_FAIL_MODE || fileCfg.failMode || "open", // open | strict
    timeoutMs: Number(process.env.GATE1_TIMEOUT_MS || fileCfg.timeoutMs || 28000), // < the 30s hook timeout
    stateDir: process.env.GATE1_STATE_DIR || fileCfg.stateDir || join(tmpdir(), "sage-gate1"),
    fireOnce: parseBool(process.env.GATE1_FIRE_ONCE, parseBool(fileCfg.fireOnce, true)),
    credentialEnvVar: fileCfg.credentialEnvVar || "SAGE_GATE1_CREDENTIAL",
  };
  cfg.credential = process.env[cfg.credentialEnvVar] || process.env.GATE1_CREDENTIAL || "";
  if (cfg.depth === "deep") cfg.depth = "standard"; // hard guard: ADR-011 D3 — never deep in a pre-prompt hook.
  if (cfg.failMode !== "strict") cfg.failMode = "open";
  return cfg;
}

function parseBool(v, dflt) {
  if (v === undefined || v === null || v === "") return dflt;
  if (typeof v === "boolean") return v;
  return String(v).toLowerCase() === "true" || String(v) === "1";
}

// ---------------------------------------------------------------------------
// IO helpers. Only ONE thing is ever written to stdout: the success/open JSON.
// All diagnostics go to stderr (debug log) or the honest log file.
// ---------------------------------------------------------------------------
function readStdin() {
  try {
    return readFileSync(0, "utf8"); // fd 0 — Claude Code pipes the event JSON in.
  } catch {
    return "";
  }
}

function emitContext(text) {
  const clipped = text.length > MAX_CONTEXT_CHARS ? text.slice(0, MAX_CONTEXT_CHARS) + "\n…(frame truncated)" : text;
  process.stdout.write(
    JSON.stringify({
      hookSpecificOutput: {
        hookEventName: "UserPromptSubmit",
        additionalContext: clipped,
      },
    })
  );
}

function honestLog(cfg, line) {
  try {
    mkdirSync(cfg.stateDir, { recursive: true });
    appendFileSync(join(cfg.stateDir, "gate1.log"), `${new Date().toISOString()} ${line}\n`);
  } catch {
    /* logging must never throw */
  }
}

function markerPath(cfg, sessionId) {
  return join(cfg.stateDir, `${sanitize(sessionId)}.framed`);
}
function sanitize(s) {
  return String(s || "no-session").replace(/[^a-zA-Z0-9._-]/g, "_");
}

// ---------------------------------------------------------------------------
// Frame rendering — phrased as FACTUAL STATEMENTS, not imperative system commands,
// per the hooks-doc guidance (imperative phrasing trips Claude's prompt-injection
// defenses and gets surfaced to the user instead of used as context).
// ---------------------------------------------------------------------------
function renderFrame(verdict) {
  const lines = [];
  lines.push("[SageReasoning Gate 1 — pre-decision examination]");
  lines.push("This task was examined before any work began. The Stoic frame returned:");

  const prox = verdict.katorthoma_proximity;
  if (prox) lines.push(`• Proximity to right reason (as written): ${prox}`);

  const circles = pickCircles(verdict.oikeiosis);
  if (circles.length) lines.push(`• Circles of concern engaged (oikeiosis): ${circles.join(", ")}`);

  const cf = verdict.control_filter || {};
  if (arr(cf.within_prohairesis).length) lines.push(`• Within your control (prohairesis): ${arr(cf.within_prohairesis).join("; ")}`);
  if (arr(cf.outside_prohairesis).length) lines.push(`• Outside your control: ${arr(cf.outside_prohairesis).join("; ")}`);

  const pd = verdict.passion_diagnosis || {};
  const passions = arr(pd.passions_detected).map(passionLabel).filter(Boolean);
  if (passions.length) lines.push(`• Passions to watch: ${passions.join("; ")}`);
  const fjs = arr(pd.false_judgements).map(textOf).filter(Boolean);
  if (fjs.length) lines.push(`• False judgements behind them: ${fjs.join("; ")}`);

  const ka = verdict.kathekon_assessment || {};
  if (ka.is_kathekon !== undefined || ka.quality || ka.justification) {
    const bits = [];
    if (ka.is_kathekon !== undefined) bits.push(`is_kathekon=${ka.is_kathekon}`);
    if (ka.quality) bits.push(`quality=${ka.quality}`);
    if (ka.justification) bits.push(String(ka.justification));
    lines.push(`• Kathekon (the fitting action): ${bits.join(" — ")}`);
  }

  lines.push(
    "This frame was produced by SageReasoning's examination of the task prior to any action. It is provided so the work proceeds from an examined judgement."
  );
  return lines.join("\n");
}

function pickCircles(oik) {
  if (!oik) return [];
  const fromAssessed = arr(oik.circles_assessed).map((c) => c?.circle || c?.name || textOf(c)).filter(Boolean);
  if (fromAssessed.length) return fromAssessed;
  return arr(oik.oikeiosis_circles_engaged).map((c) => c?.circle || textOf(c)).filter(Boolean);
}
function passionLabel(p) {
  if (!p) return "";
  if (typeof p === "string") return p;
  const parts = [p.root_passion, p.sub_species].filter(Boolean);
  return parts.length ? parts.join("/") : textOf(p);
}
function textOf(x) {
  if (x === null || x === undefined) return "";
  if (typeof x === "string") return x;
  if (typeof x === "object") return x.text || x.description || x.item || x.false_judgement || "";
  return String(x);
}
function arr(x) {
  return Array.isArray(x) ? x : [];
}

// ---------------------------------------------------------------------------
// Fail handler — the single place an unavailable/failed framing is resolved,
// per the configured mode. Honest in both modes (KG1, R18).
// ---------------------------------------------------------------------------
function fail(cfg, reason) {
  honestLog(cfg, `UNFRAMED mode=${cfg.failMode} reason="${reason}"`);
  if (cfg.failMode === "strict") {
    process.stderr.write(
      `Gate 1 pre-decision framing is required (strict mode) but did not complete: ${reason}. ` +
        `This task is blocked. Retry when the examination service is reachable, or set GATE1_FAIL_MODE=open.\n`
    );
    process.exit(2); // block + erase the prompt
  }
  // open: proceed, but record the gap in-context so it is never silently treated as framed.
  emitContext(
    "[SageReasoning Gate 1 — pre-decision examination UNAVAILABLE]\n" +
      `A pre-decision Stoic examination was attempted for this task but did not complete (reason: ${reason}). ` +
      "This task is proceeding WITHOUT that frame. Treat the reasoning as unframed."
  );
  process.exit(0);
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------
async function main() {
  const cfg = loadConfig();

  // Parse the event.
  let event = {};
  try {
    event = JSON.parse(readStdin() || "{}");
  } catch {
    return fail(cfg, "could not parse hook stdin");
  }
  const sessionId = event.session_id || "no-session";
  const task = typeof event.prompt === "string" ? event.prompt.trim() : "";

  if (!task) return fail(cfg, "empty task prompt");

  // Fire-once-per-task guard (ADR-011 D5). A follow-up in the same session does not re-frame.
  const marker = markerPath(cfg, sessionId);
  if (cfg.fireOnce) {
    try {
      if (existsSync(marker)) {
        process.exit(0); // already framed this session — stay silent, do not re-consult.
      }
    } catch {
      /* if we cannot check the marker, fall through and frame (safe default). */
    }
  }

  if (!cfg.credential) return fail(cfg, `credential not set (expected env ${cfg.credentialEnvVar})`);

  // Frame: situation in → frame out.
  let res;
  try {
    res = await fetch(cfg.endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${cfg.credential}` },
      body: JSON.stringify({ input: task, depth: cfg.depth, response_format: "assessment_first" }),
      signal: AbortSignal.timeout(cfg.timeoutMs),
    });
  } catch (e) {
    return fail(cfg, e && e.name === "TimeoutError" ? `timeout after ${cfg.timeoutMs}ms` : `request failed: ${e?.message || e}`);
  }

  if (!res.ok) return fail(cfg, `http ${res.status}`);

  let body;
  try {
    body = await res.json();
  } catch {
    return fail(cfg, "non-JSON response");
  }

  // The verdict lives at assessment.assessment (the inner object; the outer `assessment`
  // is the signed envelope). Present in both 'full' and 'assessment_first' shapes.
  const verdict = body?.assessment?.assessment;
  if (!verdict || typeof verdict !== "object") return fail(cfg, "no assessment in response");

  emitContext(renderFrame(verdict));

  // Record success so the fire-once guard suppresses re-framing for the rest of the session.
  try {
    mkdirSync(cfg.stateDir, { recursive: true });
    writeFileSync(marker, `${new Date().toISOString()} framed session=${sessionId}\n`);
  } catch {
    /* a failed marker write is non-fatal — worst case the next turn re-frames once. */
  }
  honestLog(cfg, `FRAMED session=${sanitize(sessionId)} depth=${cfg.depth} proximity=${verdict.katorthoma_proximity || "?"}`);
  process.exit(0);
}

// Catch-all: any unexpected error still resolves through the fail handler (honest + mode-correct),
// never an ambiguous crash. We reload config defensively in case the throw was inside loadConfig.
main().catch((e) => {
  try {
    fail(loadConfig(), `internal hook error: ${e?.message || e}`);
  } catch {
    process.exit(0); // last resort: do not hard-block the user's session on a hook bug (open posture).
  }
});
