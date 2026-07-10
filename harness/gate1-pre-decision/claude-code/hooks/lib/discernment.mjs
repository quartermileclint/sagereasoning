/**
 * SageReasoning — S8 DISCERNMENT helpers (the seven-layer reference harness).
 * Trust Layer S8.  Governing design: adopted/adr/2026-07-08-sage-trust-layer.md (ADR-013 §4/§6)
 * + adopted/adr/2026-06-20-pre-decision-harness-arc2.md (ADR-011 — the channel law).
 *
 * WHAT THIS IS
 *   The harness-side half of the spawn-time discernment + out-of-band L4 audit + hand-back +
 *   trust-verdict surfaces, all served by the DARK /api/practice/discernment route
 *   (SUBSTRATE_TRUST_CORE_ENABLED unset ⇒ the server answers 503 and the hooks fail open with an
 *   honest log — nothing runs, nothing is spent). Channel-law classification:
 *     · the spawn POST + hand-back POST + trust-verdict GET are INSTRUMENT (the hook does them on
 *       its own credential; no agent is ever asked);
 *     · the AUTHORITY-BOUNDARY block is injected deterministically into the delegated prompt
 *       (the hook does the injection; the sub-agent's compliance is advisory until S11);
 *     · the discernment recommendation + the trust verdict are ADVISE (MEASURE — never block).
 *
 * PROVISIONING (the S2 derive precedent): discernment is ON iff a parseable
 *   discernment.config.json exists AND the consult credential is set. Explicit
 *   SAGE_GATE1_DISCERNMENT_ENABLED overrides (true/false). Un-provisioned ⇒ every entry point
 *   returns fast and the hooks are BYTE-IDENTICAL to the pre-S8 behaviour (battery-asserted).
 *
 * THE OUT-OF-BAND TRACE (mentor A7): the orchestrator's reasoning trace is read by the harness
 *   from the session TRANSCRIPT (the Observability layer) — the trailing assistant text that led
 *   to the spawn. The orchestrator is never asked for an account of its reasoning (self-report is
 *   structurally gameable by omission); an unreadable transcript yields an EMPTY trace, which the
 *   server audits honestly as audit-unavailable → HOLD (recorded, never fabricated).
 *
 * OBSERVABILITY JSONL (durable provenance): typed records appended to
 *   <stateDir>/<session>.observability.jsonl, each carrying an OTel-GenAI-SHAPED span reference
 *   (design-for-interop, election 4 — the SHAPE only; nothing is published externally).
 *
 * DISCIPLINE (KG1 / R18): every function FAILS SOFT — reads/writes that throw are swallowed and
 *   treated as "not available" (skip honestly, log, never block a spawn or a stop). Nothing here
 *   touches stdout/exit — that is the hook's.
 *
 * No third-party dependencies. Node 18+ (global fetch + AbortSignal.timeout).
 */

import { existsSync, mkdirSync, writeFileSync, appendFileSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { randomBytes } from "node:crypto";
import { deriveSibling, parseBool, shortHash } from "./framing-core.mjs";

function sanitize(s) {
  return String(s || "no-session").replace(/[^a-zA-Z0-9._-]/g, "_");
}
function ensureDir(cfg) {
  try {
    mkdirSync(cfg.stateDir, { recursive: true });
  } catch {
    /* surfaces on the write below */
  }
}

// ---------------------------------------------------------------------------
// CONFIG. discernment.config.json sits next to gate1.config.json (claude-code/),
// overridable via SAGE_GATE1_DISCERNMENT_CONFIG. Returns null when absent or
// malformed (⇒ not provisioned — honest skip, byte-identical hooks).
// ---------------------------------------------------------------------------
export function loadDiscernmentConfig(cfg, hookDir) {
  const path =
    process.env.SAGE_GATE1_DISCERNMENT_CONFIG ||
    (hookDir ? join(hookDir, "..", "discernment.config.json") : "");
  if (!path) return null;
  try {
    if (!existsSync(path)) return null;
    const raw = JSON.parse(readFileSync(path, "utf8"));
    if (!raw || typeof raw !== "object") return null;
    // The three required blocks — a config missing any of them is NOT provisioned.
    if (!raw.orchestrator_profile || !raw.deployer_config || !raw.candidates) return null;
    return {
      orchestratorProfile: raw.orchestrator_profile,
      deployerConfig: raw.deployer_config,
      // candidates: keyed by subagent_type → { candidate_ref, profile|null }.
      candidates: raw.candidates,
      taskDefaults: raw.task_defaults || {},
      endpoint: typeof raw.endpoint === "string" && raw.endpoint ? raw.endpoint : null,
      timeoutMs: Number(raw.timeout_ms || 60000),
      traceMaxChars: Number(raw.trace_max_chars || 8000),
    };
  } catch {
    return null; // malformed config must never crash a hook — treat as un-provisioned.
  }
}

/** Derive-from-provisioning (the S2 precedent): explicit env wins; else ON iff the
 *  config parsed AND the consult credential is set. PURE given its inputs. */
export function discernmentEnabled(cfg, dcfg) {
  const envFlag = process.env.SAGE_GATE1_DISCERNMENT_ENABLED;
  if (envFlag !== undefined && envFlag !== null && String(envFlag).trim() !== "") {
    return parseBool(envFlag, false) && !!dcfg && !!cfg.credential;
  }
  return !!dcfg && !!cfg.credential;
}

/** The discernment endpoint: config override > derive from the reason endpoint. */
export function discernmentEndpoint(cfg, dcfg) {
  return (dcfg && dcfg.endpoint) || deriveSibling(cfg.endpoint, "practice/discernment");
}

// ---------------------------------------------------------------------------
// THE OUT-OF-BAND TRACE (A7). Read the trailing assistant text from the session
// transcript JSONL — the recorded reasoning SEQUENCE that led to this spawn.
// Defensive to shape drift; unreadable ⇒ "" (the server holds honestly).
// ---------------------------------------------------------------------------
export function readTranscriptTail(transcriptPath, maxChars = 8000) {
  try {
    if (typeof transcriptPath !== "string" || !transcriptPath || !existsSync(transcriptPath)) return "";
    const text = readFileSync(transcriptPath, "utf8");
    const blocks = [];
    for (const line of text.split("\n")) {
      const t = line.trim();
      if (!t) continue;
      try {
        const obj = JSON.parse(t);
        const msg = obj && typeof obj === "object" ? obj.message : null;
        const isAssistant = obj?.type === "assistant" || msg?.role === "assistant";
        if (!isAssistant || !msg) continue;
        const content = msg.content;
        if (typeof content === "string") {
          if (content.trim()) blocks.push(content.trim());
        } else if (Array.isArray(content)) {
          for (const part of content) {
            if (part && part.type === "text" && typeof part.text === "string" && part.text.trim()) {
              blocks.push(part.text.trim());
            }
          }
        }
      } catch {
        /* skip a non-JSON line */
      }
    }
    if (blocks.length === 0) return "";
    // Take from the END (the reasoning nearest the spawn) up to maxChars.
    const out = [];
    let total = 0;
    for (let i = blocks.length - 1; i >= 0; i--) {
      const b = blocks[i];
      if (total + b.length > maxChars) {
        if (out.length === 0) out.unshift(b.slice(b.length - maxChars)); // at least a tail slice
        break;
      }
      out.unshift(b);
      total += b.length + 2;
    }
    return out.join("\n\n");
  } catch {
    return "";
  }
}

// ---------------------------------------------------------------------------
// SPAWN PAYLOAD. Composes the /api/practice/discernment phase:'spawn' body from
// the operator config + this spawn's facts. The CHOSEN candidate is the one the
// orchestrator actually named (subagent_type) — the discernment is a MEASURE
// comparison of that choice against the configured candidate set.
// ---------------------------------------------------------------------------
export function buildSpawnPayload(dcfg, { taskRef, subagentType, taskText, trace }) {
  const td = dcfg.taskDefaults || {};
  const byType = td.function_type_by_subagent_type || {};
  const functionType =
    (subagentType && byType[subagentType]) || byType["*"] || "general-delegation";

  const js = td.justice_surface || {};
  const taskProfile = {
    schema: "trust-task-profile-v1",
    functionType,
    circlesServed: Array.isArray(td.circles_served) ? td.circles_served : ["requesting-user"],
    conditions: Array.isArray(td.conditions) ? td.conditions : [],
    outputRequirements: Array.isArray(td.output_requirements) ? td.output_requirements : [],
    justiceSurface: {
      present: js.present === true,
      nonConsentingCircles: Array.isArray(js.non_consenting_circles) ? js.non_consenting_circles : [],
      ...(typeof js.note === "string" && js.note ? { note: js.note } : {}),
    },
  };

  const candidates = [];
  let chosenRef = null;
  for (const [type, entry] of Object.entries(dcfg.candidates || {})) {
    if (!entry || typeof entry !== "object") continue;
    const ref = typeof entry.candidate_ref === "string" && entry.candidate_ref ? entry.candidate_ref : type;
    candidates.push({
      candidate_ref: ref,
      ...(entry.profile && typeof entry.profile === "object" ? { profile: entry.profile } : {}),
    });
    if (subagentType && type === subagentType) chosenRef = ref;
  }

  return {
    phase: "spawn",
    task_ref: taskRef,
    orchestrator_agent_id: dcfg.orchestratorProfile?.agentId || "",
    task_profile: taskProfile,
    orchestrator_profile: dcfg.orchestratorProfile,
    deployer_config: dcfg.deployerConfig,
    candidates,
    reasoning_trace: { trace: typeof trace === "string" ? trace : "", chosen_candidate_ref: chosenRef },
    ...(chosenRef ? { chosen_candidate_ref: chosenRef } : {}),
    // Kept for the payload consumer's context (the server ignores unknown fields).
    delegated_task_preview: typeof taskText === "string" ? taskText.slice(0, 400) : "",
  };
}

// ---------------------------------------------------------------------------
// FETCHES. Never throw — every failure is a structured { ok:false, reason }.
// ---------------------------------------------------------------------------
/** Read a 4xx/5xx body's honest `error`/`note` so the operator sees WHY (review fold
 *  G1: a bare `http 403` hid "the credential must be bound to orchestrator_agent_id",
 *  making a mis-provisioned install look like a silent no-op). Never throws. */
async function describeErrorBody(res) {
  try {
    const b = await res.json();
    if (!b || typeof b !== "object") return "";
    const parts = [b.error, b.note, Array.isArray(b.details) ? b.details.join("; ") : null]
      .filter((s) => typeof s === "string" && s);
    return parts.length ? ` — ${parts.join(": ")}` : "";
  } catch {
    return "";
  }
}

export async function fetchDiscernment(cfg, dcfg, payload) {
  let res;
  try {
    res = await fetch(discernmentEndpoint(cfg, dcfg), {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${cfg.credential}` },
      body: JSON.stringify(payload),
      signal: AbortSignal.timeout(dcfg && dcfg.timeoutMs ? dcfg.timeoutMs : 60000),
    });
  } catch (e) {
    return {
      ok: false,
      reason: e && e.name === "TimeoutError" ? "timeout" : `request failed: ${e?.message || e}`,
    };
  }
  if (!res.ok) return { ok: false, reason: `http ${res.status}${await describeErrorBody(res)}` };
  let body;
  try {
    body = await res.json();
  } catch {
    return { ok: false, reason: "non-JSON response" };
  }
  if (!body || typeof body !== "object" || !body.result || typeof body.result !== "object") {
    return { ok: false, reason: "no result in response" };
  }
  return { ok: true, body };
}

export async function fetchTrustVerdict(cfg, dcfg, timeoutMs = 10000) {
  let res;
  try {
    res = await fetch(discernmentEndpoint(cfg, dcfg), {
      method: "GET",
      headers: { Authorization: `Bearer ${cfg.credential}` },
      signal: AbortSignal.timeout(timeoutMs),
    });
  } catch (e) {
    return {
      ok: false,
      reason: e && e.name === "TimeoutError" ? "timeout" : `request failed: ${e?.message || e}`,
    };
  }
  if (!res.ok) return { ok: false, reason: `http ${res.status}` };
  let body;
  try {
    body = await res.json();
  } catch {
    return { ok: false, reason: "non-JSON response" };
  }
  const v = body && typeof body === "object" ? body.result : null;
  if (!v || typeof v !== "object") return { ok: false, reason: "no verdict in response" };
  return { ok: true, verdict: v };
}

// ---------------------------------------------------------------------------
// THE ADVISE RENDERING (H3). Compact, factual, MEASURE-honest — an observation
// the agent may discount (the channel law), never an instruction to act.
// ---------------------------------------------------------------------------
export function renderTrustAdvisory(verdict) {
  if (!verdict || verdict.dark) return "";
  const lines = ["", "• Standing trust record (MEASURE — advisory; binds nothing):"];
  const agg = verdict.aggregate;
  if (agg && agg.level) {
    lines.push(
      `  aggregate ${agg.level}${agg.limitingDomain ? ` (limiting domain: ${agg.limitingDomain})` : ""}` +
        `${agg.anyJusticeCapped ? "; a justice latch is active" : ""}`,
    );
  } else {
    lines.push("  no evaluated cardinal-domain evidence yet (sparse record — honestly stated)");
  }
  const rec = verdict.recommendation;
  if (rec && rec.action) {
    lines.push(`  S4 measure-mode recommendation: ${rec.action}/${rec.followUp} (${rec.tableRow || "n/a"}) — log-and-continue; not enforced.`);
  }
  return lines.join("\n");
}

// ---------------------------------------------------------------------------
// SPAWN RECORD (Lifecycle layer). Written at spawn; read by the hand-back hook.
// Doubles as the discernment fire-once marker for a spawn key.
// ---------------------------------------------------------------------------
export function spawnRecordPath(cfg, spawnKey) {
  return join(cfg.stateDir, `${sanitize(spawnKey)}.spawn.json`);
}
export function readSpawnRecord(cfg, spawnKey) {
  try {
    const p = spawnRecordPath(cfg, spawnKey);
    if (!existsSync(p)) return null;
    return JSON.parse(readFileSync(p, "utf8"));
  } catch {
    return null;
  }
}
export function writeSpawnRecord(cfg, spawnKey, record) {
  try {
    ensureDir(cfg);
    writeFileSync(spawnRecordPath(cfg, spawnKey), JSON.stringify(record));
    return true;
  } catch {
    return false;
  }
}

/** Strip the harness-injected prefix (boundary + frame) from a delegated prompt.
 *  LEGACY FALLBACK ONLY — see `resolveSpawnKey`. The injected block always ends with
 *  the task separator; absent ⇒ unchanged. PURE.
 *
 *  KNOWN LIMIT (review fold G2): this uses `lastIndexOf`, so a task whose OWN text
 *  contains the separator recovers only its post-separator tail and derives a
 *  DIFFERENT spawn key than H2 did. That made the delegation silently un-closable —
 *  and orchestrator-controllable (embed the sentinel, suppress your own A9 trust
 *  reduction). The key is therefore NO LONGER derived from the orchestrator-controlled
 *  task text on the primary path: H2 writes a SPAWN ALIAS keyed on the exact prompt it
 *  emitted, and H5 resolves through it. This function survives only as the last-resort
 *  fallback for a spawn whose alias was never written (e.g. a frame outage). */
export const TASK_SEPARATOR = "--- (your task follows) ---";
export function stripInjectedPrefix(prompt) {
  const s = String(prompt == null ? "" : prompt);
  const idx = s.lastIndexOf(TASK_SEPARATOR);
  if (idx === -1) return s.trim();
  return s.slice(idx + TASK_SEPARATOR.length).replace(/^\s*\n?/, "").trim();
}

// ---------------------------------------------------------------------------
// SPAWN-KEY ALIAS (review fold G2). H2 owns the spawn key; H5 must find the SAME
// record without re-deriving it from text the orchestrator controls. At emit time
// H2 knows the EXACT prompt it handed the sub-agent, so it writes an alias file
// keyed on hash(session | that prompt) whose contents are the spawn key. H5 receives
// that same prompt on the PostToolUse wire and resolves the key by lookup — exact,
// separator-proof, and un-suppressible by task text.
// ---------------------------------------------------------------------------
function aliasPath(cfg, sessionId, prompt) {
  return join(cfg.stateDir, `${sanitize(sessionId)}-${shortHash(String(prompt == null ? "" : prompt))}.spawnalias`);
}

/** Write the alias (only when a spawn record genuinely exists — never for an
 *  un-provisioned spawn). Never throws; a lost alias degrades to the fallbacks. */
export function writeSpawnAlias(cfg, sessionId, emittedPrompt, spawnKey) {
  try {
    if (!readSpawnRecord(cfg, spawnKey)) return false; // nothing to alias
    ensureDir(cfg);
    writeFileSync(aliasPath(cfg, sessionId, emittedPrompt), String(spawnKey));
    return true;
  } catch {
    return false;
  }
}

/**
 * Resolve the spawn key for a prompt observed at hand-back, in descending exactness:
 *   1. IDENTITY — the prompt IS the raw task (no frame/boundary was injected, e.g. a
 *      frame outage): `sub-<hash(session|prompt.trim())>` hits the record directly.
 *   2. ALIAS — the exact prompt H2 emitted (framed / boundary-prefixed) maps to the key.
 *   3. FALLBACK — the legacy `stripInjectedPrefix` derivation (separator-fragile).
 * Returns { key, record, via } or null. Never throws.
 */
export function resolveSpawnKey(cfg, sessionId, prompt) {
  const raw = String(prompt == null ? "" : prompt);

  const identityKey = "sub-" + shortHash(`${sessionId}|${raw.trim()}`);
  const identityRecord = readSpawnRecord(cfg, identityKey);
  if (identityRecord) return { key: identityKey, record: identityRecord, via: "identity" };

  try {
    const p = aliasPath(cfg, sessionId, raw);
    if (existsSync(p)) {
      const key = readFileSync(p, "utf8").trim();
      const record = key ? readSpawnRecord(cfg, key) : null;
      if (record) return { key, record, via: "alias" };
    }
  } catch {
    /* fall through to the legacy derivation */
  }

  const derivedKey = "sub-" + shortHash(`${sessionId}|${stripInjectedPrefix(raw)}`);
  const derivedRecord = readSpawnRecord(cfg, derivedKey);
  if (derivedRecord) return { key: derivedKey, record: derivedRecord, via: "derived" };

  return null;
}

// ---------------------------------------------------------------------------
// OBSERVABILITY JSONL (durable provenance) + OTel-GenAI-SHAPED span references
// (design-for, election 4 — the shape only; nothing published).
// ---------------------------------------------------------------------------
export function observabilityPath(cfg, sessionId) {
  return join(cfg.stateDir, `${sanitize(sessionId)}.observability.jsonl`);
}

/** A W3C-trace-context-shaped span reference with OTel GenAI semconv-shaped
 *  attribute names. Random ids (this is a reference shape, not an exporter). */
export function makeSpanRef(name, startMs, endMs) {
  return {
    trace_id: randomBytes(16).toString("hex"),
    span_id: randomBytes(8).toString("hex"),
    name,
    attributes: {
      "gen_ai.operation.name": name,
      "gen_ai.system": "sagereasoning.practice",
    },
    start_time: new Date(startMs || Date.now()).toISOString(),
    end_time: new Date(endMs || Date.now()).toISOString(),
  };
}

/** Append one typed observability record. Side-effect-only; never throws; never
 *  touches stdout/exit (the hook owns those). */
export function appendObservability(cfg, sessionId, type, record, span) {
  try {
    ensureDir(cfg);
    const line = { type, at: new Date().toISOString(), ...record, otel: span || makeSpanRef(type) };
    appendFileSync(observabilityPath(cfg, sessionId), JSON.stringify(line) + "\n");
    return true;
  } catch {
    return false;
  }
}
