/**
 * SageReasoning — Gate 1 pre-decision framing CORE (shared by both Claude Code hooks).
 * Arc 2.  Governing design: adopted/adr/2026-06-20-pre-decision-harness-arc2.md (ADR-011).
 *
 * WHY THIS MODULE EXISTS
 *   Slice 1 shipped one hook (`UserPromptSubmit`, for the top-level agent). Slice 3 adds a second
 *   hook (`PreToolUse` matched to the subagent-spawn tool — `Task`/`Agent` — for delegated
 *   subagents; its `tool_input` carries the subagent's `prompt`, so it can frame the subagent's
 *   actual task, and it CAN block). Both hooks do the SAME thing — examine a task via /api/reason
 *   in framing posture and inject the Stoic frame — differing only in:
 *     • where they read the task from (UserPromptSubmit.prompt vs PreToolUse tool_input.prompt),
 *     • the fire-once key (session vs per-subagent-spawn),
 *     • HOW the frame is injected (UserPromptSubmit → additionalContext; PreToolUse → updatedInput,
 *       prepending the frame to the subagent's prompt so the subagent reasons FROM it), and
 *     • the emitted hookEventName.
 *   Both CAN run STRICT (fail-closed, exit 2): PreToolUse blocks the spawn, UserPromptSubmit erases
 *   the prompt. (This corrects the Slice-2 finding that the only subagent path then known — a
 *   `SubagentStart` command hook — carries no `prompt` and cannot block. See ADR-011 §Slice 2/3.)
 *   This module is the single source of truth for the shared 90%; each hook is a thin entry point.
 *
 * VERDICT-READ (signing-agnostic, the Slice-1 trajectory-proof fix): the Layer-2 verdict sits at
 *   `assessment.assessment` when the deployment signs Layer-2, or directly at `assessment` when it
 *   doesn't. A framing hook does not verify the signature, so it reads whichever shape carries
 *   `katorthoma_proximity` (the field unique to the verdict; the signed envelope never carries it).
 *
 * No third-party dependencies. Node 18+ (global fetch + AbortSignal.timeout).
 */

import { existsSync, mkdirSync, writeFileSync, appendFileSync, readFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { createHash } from "node:crypto";

export const MAX_CONTEXT_CHARS = 9500; // headroom under Claude Code's 10,000-char additionalContext cap.

// The leading marker every rendered frame (and the UNAVAILABLE note) begins with. The subagent
// PreToolUse hook uses it as a recursive-loop / already-framed guard: a prompt that already carries
// this sentinel is NOT re-examined. Keep in sync with renderFrame()'s first line.
export const FRAME_SENTINEL = "[SageReasoning Gate 1";

// Stable short id for a per-subagent-spawn fire-once marker filename. node:crypto only (no deps).
export function shortHash(s) {
  return createHash("sha256").update(String(s == null ? "" : s)).digest("hex").slice(0, 16);
}

// ---------------------------------------------------------------------------
// Configuration. Precedence: explicit env override > config file > built-in default.
// The credential is NEVER stored in config or code — it is read from an env var
// (default name SAGE_GATE1_CREDENTIAL), so it never lands in the repo.
//
// Per-hook options:
//   hookDir    — the calling hook's own directory (so gate1.config.json resolves next to /hooks).
//   eventName  — the hookEventName this hook emits ("UserPromptSubmit" | "SubagentStart").
//   allowStrict — whether STRICT (fail-closed) is reachable. false ⇒ clamp to "open"
//                 (SubagentStart cannot block, so strict is structurally impossible there).
// ---------------------------------------------------------------------------
export function loadConfig({ hookDir, eventName, allowStrict = true } = {}) {
  let fileCfg = {};
  const cfgPath =
    process.env.GATE1_CONFIG ||
    (hookDir ? join(hookDir, "..", "gate1.config.json") : ""); // hookDir = …/claude-code/hooks → claude-code/
  try {
    if (cfgPath && existsSync(cfgPath)) fileCfg = JSON.parse(readFileSync(cfgPath, "utf8"));
  } catch {
    // A malformed config file must not crash the hook — fall back to defaults + env.
    fileCfg = {};
  }

  const cfg = {
    eventName: eventName || "UserPromptSubmit",
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
  if (!allowStrict) cfg.failMode = "open"; // SubagentStart can't block ⇒ strict is impossible; force open.
  else if (cfg.failMode !== "strict") cfg.failMode = "open";
  return cfg;
}

export function parseBool(v, dflt) {
  if (v === undefined || v === null || v === "") return dflt;
  if (typeof v === "boolean") return v;
  return String(v).toLowerCase() === "true" || String(v) === "1";
}

// ---------------------------------------------------------------------------
// IO helpers. Only ONE thing is ever written to stdout: the success/open JSON.
// All diagnostics go to stderr (debug log) or the honest log file.
// ---------------------------------------------------------------------------
export function readStdin() {
  try {
    return readFileSync(0, "utf8"); // fd 0 — Claude Code pipes the event JSON in.
  } catch {
    return "";
  }
}

export function emitContext(cfg, text) {
  const clipped = text.length > MAX_CONTEXT_CHARS ? text.slice(0, MAX_CONTEXT_CHARS) + "\n…(frame truncated)" : text;
  process.stdout.write(
    JSON.stringify({
      hookSpecificOutput: {
        hookEventName: cfg.eventName,
        additionalContext: clipped,
      },
    })
  );
}

export function honestLog(cfg, line) {
  try {
    mkdirSync(cfg.stateDir, { recursive: true });
    appendFileSync(join(cfg.stateDir, "gate1.log"), `${new Date().toISOString()} ${line}\n`);
  } catch {
    /* logging must never throw */
  }
}

// Opt-in diagnostic: when GATE1_DEBUG is set, dump the raw stdin payload this hook received to
// <stateDir>/<eventName>-stdin.json. Used to confirm the exact wire shape (e.g. the SubagentStart
// command-hook field names). Never throws; no-op unless GATE1_DEBUG is truthy.
export function maybeDebugDump(cfg, raw) {
  if (!process.env.GATE1_DEBUG) return;
  try {
    mkdirSync(cfg.stateDir, { recursive: true });
    writeFileSync(join(cfg.stateDir, `${cfg.eventName}-stdin.json`), raw == null ? "" : String(raw));
  } catch {
    /* diagnostics must never throw */
  }
}

export function markerPath(cfg, key) {
  return join(cfg.stateDir, `${sanitize(key)}.framed`);
}
export function sanitize(s) {
  return String(s || "no-session").replace(/[^a-zA-Z0-9._-]/g, "_");
}

// ---------------------------------------------------------------------------
// Frame rendering — phrased as FACTUAL STATEMENTS, not imperative system commands,
// per the hooks-doc guidance (imperative phrasing trips Claude's prompt-injection
// defenses and gets surfaced to the user instead of used as context).
// ---------------------------------------------------------------------------
export function renderFrame(verdict) {
  const lines = [];
  lines.push("[SageReasoning Gate 1 — pre-decision examination]");
  lines.push("This task was examined before any work began. The Stoic frame returned:");

  const prox = verdict.katorthoma_proximity;
  if (prox) lines.push(`• Proximity to right reason (as written): ${prox}`);

  const circles = pickCircles(verdict.oikeiosis);
  if (circles.length) lines.push(`• Circles of concern engaged (oikeiosis): ${circles.join(", ")}`);

  const cf = verdict.control_filter || {};
  // control_filter items are objects ({item, classification, …}) on the real API, plain strings in
  // older/mocked shapes — route both through textOf so they never render as "[object Object]".
  const within = arr(cf.within_prohairesis).map(textOf).filter(Boolean);
  const outside = arr(cf.outside_prohairesis).map(textOf).filter(Boolean);
  if (within.length) lines.push(`• Within your control (prohairesis): ${within.join("; ")}`);
  if (outside.length) lines.push(`• Outside your control: ${outside.join("; ")}`);

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

export function pickCircles(oik) {
  if (!oik) return [];
  // Real API exposes engaged circles under `relevant_circles`; older/mocked shapes used
  // `circles_assessed` / `oikeiosis_circles_engaged`. Take the first that yields names.
  for (const key of ["relevant_circles", "circles_assessed", "oikeiosis_circles_engaged"]) {
    const got = arr(oik[key]).map((c) => c?.circle || c?.name || textOf(c)).filter(Boolean);
    if (got.length) return got;
  }
  return [];
}
export function passionLabel(p) {
  if (!p) return "";
  if (typeof p === "string") return p;
  const parts = [p.root_passion, p.sub_species].filter(Boolean);
  return parts.length ? parts.join("/") : textOf(p);
}
export function textOf(x) {
  if (x === null || x === undefined) return "";
  if (typeof x === "string") return x;
  if (typeof x === "object") return x.text || x.description || x.item || x.false_judgement || "";
  return String(x);
}
export function arr(x) {
  return Array.isArray(x) ? x : [];
}

// ---------------------------------------------------------------------------
// Verdict extraction — signing-agnostic (see header). Returns the verdict object or null.
// ---------------------------------------------------------------------------
export function extractVerdict(body) {
  const signedInner = body?.assessment?.assessment;
  if (signedInner && typeof signedInner === "object" && "katorthoma_proximity" in signedInner) return signedInner;
  if (body?.assessment && typeof body.assessment === "object" && "katorthoma_proximity" in body.assessment)
    return body.assessment;
  return null;
}

// ---------------------------------------------------------------------------
// The framing fetch. Returns { ok:true, verdict } or { ok:false, reason }.
// Never throws — every failure is a structured reason routed through the fail handler.
// ---------------------------------------------------------------------------
export async function fetchFrame(cfg, task) {
  let res;
  try {
    res = await fetch(cfg.endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${cfg.credential}` },
      body: JSON.stringify({ input: task, depth: cfg.depth, response_format: "assessment_first" }),
      signal: AbortSignal.timeout(cfg.timeoutMs),
    });
  } catch (e) {
    return {
      ok: false,
      reason: e && e.name === "TimeoutError" ? `timeout after ${cfg.timeoutMs}ms` : `request failed: ${e?.message || e}`,
    };
  }
  if (!res.ok) return { ok: false, reason: `http ${res.status}` };
  let body;
  try {
    body = await res.json();
  } catch {
    return { ok: false, reason: "non-JSON response" };
  }
  const verdict = extractVerdict(body);
  if (!verdict) return { ok: false, reason: "no assessment in response" };
  return { ok: true, verdict };
}

// ---------------------------------------------------------------------------
// Fail handler — the single place an unavailable/failed framing is resolved,
// per the configured mode. Honest in both modes (KG1, R18). Calls process.exit.
// ---------------------------------------------------------------------------
export function fail(cfg, reason) {
  honestLog(cfg, `UNFRAMED event=${cfg.eventName} mode=${cfg.failMode} reason="${reason}"`);
  if (cfg.failMode === "strict") {
    process.stderr.write(
      `Gate 1 pre-decision framing is required (strict mode) but did not complete: ${reason}. ` +
        `This task is blocked. Retry when the examination service is reachable, or set GATE1_FAIL_MODE=open.\n`
    );
    process.exit(2); // block + erase the prompt
  }
  // open: proceed, but record the gap in-context so it is never silently treated as framed.
  emitContext(
    cfg,
    "[SageReasoning Gate 1 — pre-decision examination UNAVAILABLE]\n" +
      `A pre-decision Stoic examination was attempted for this task but did not complete (reason: ${reason}). ` +
      "This task is proceeding WITHOUT that frame. Treat the reasoning as unframed."
  );
  process.exit(0);
}

// ---------------------------------------------------------------------------
// The shared orchestration. Both hooks call this with the task + a fire-once key.
//   sessionKey — the fire-once namespace (session_id for the main hook; "sub-<hash(session|task)>"
//                for the subagent hook — per-spawn, so each delegated task is framed once).
//   task       — the text to examine.
//   logLabel   — the success log token ("FRAMED" | "FRAMED-SUBAGENT").
//   emit       — OPTIONAL frame-injection strategy emit(cfg, verdict). Default (UserPromptSubmit)
//                injects the rendered frame as additionalContext. The subagent PreToolUse hook
//                passes its own emit that prepends the frame to the subagent prompt via updatedInput.
// Calls process.exit in every path (success, fire-once-skip, or via fail()).
// ---------------------------------------------------------------------------
export async function runFraming(cfg, { sessionKey, task, logLabel = "FRAMED", emit }) {
  if (!task) return fail(cfg, "empty task prompt");

  // Fire-once guard (ADR-011 D5). A follow-up in the same namespace does not re-frame.
  const marker = markerPath(cfg, sessionKey);
  if (cfg.fireOnce) {
    try {
      if (existsSync(marker)) {
        process.exit(0); // already framed — stay silent, do not re-consult.
      }
    } catch {
      /* if we cannot check the marker, fall through and frame (safe default). */
    }
  }

  if (!cfg.credential) return fail(cfg, `credential not set (expected env ${cfg.credentialEnvVar})`);

  const r = await fetchFrame(cfg, task);
  if (!r.ok) return fail(cfg, r.reason);

  // Inject the frame: default = additionalContext (UserPromptSubmit); subagent hook passes its own
  // emit (updatedInput.prompt prepend). Neither exits — the shared tail writes the marker + exits 0.
  if (emit) emit(cfg, r.verdict);
  else emitContext(cfg, renderFrame(r.verdict));

  // Record success so the fire-once guard suppresses re-framing.
  try {
    mkdirSync(cfg.stateDir, { recursive: true });
    writeFileSync(marker, `${new Date().toISOString()} framed ${sessionKey}\n`);
  } catch {
    /* a failed marker write is non-fatal — worst case the next turn re-frames once. */
  }
  honestLog(cfg, `${logLabel} session=${sanitize(sessionKey)} depth=${cfg.depth} proximity=${r.verdict.katorthoma_proximity || "?"}`);
  process.exit(0);
}
