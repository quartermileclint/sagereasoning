#!/usr/bin/env node
/**
 * SageReasoning — Gate-1 CLOSE hook (H4): reflect-at-close + the accreditation write.
 * Claude Code `Stop` (fires when the agent finishes responding — the close of the task loop).
 * Arc 3 / Slice 5a.  Governing design: adopted/adr/2026-06-20-pre-decision-harness-arc2.md
 * ("Amendment 2026-06-21 — The full-loop harness", H4 + D-C/D-D/D-E/D-F).
 *
 * WHAT IT DOES — two things, fire-once per session:
 *   REFLECT-INITIATE (D-C) — opens a Sage Reflect session (/api/practice/reflect) and FORCES one
 *     more model turn so the agent runs its Q1–Q6 reflection. A hook CANNOT drive a multi-turn
 *     interactive exchange, so it INITIATES (opens + surfaces Q1) and the MODEL drives the sequence
 *     (honest partial). The sequence is NEVER abbreviated (B7). Mechanism: a Stop hook continues the
 *     agent via {"decision":"block","reason":"…"} — the `reason` becomes the model's next instruction.
 *   ACCREDITATION WRITE (D-D) — reads the session's ACCUMULATED signed assessments (provenance the
 *     top-level frame + H3 consults appended) and POSTs an accreditation seed carrying them, so the
 *     credential rests on genuine examination (R18f). It uses a NON-MARKER accreditation_write
 *     credential bound to the loop's agent_id — NEVER the standing pre_decision_harness marker
 *     credential (a write on that would clobber the marker — established 2026-06-21). With no
 *     accumulated provenance, or no non-marker credential/agent_id, it writes NOTHING and says so.
 *
 * CLOSE-EVENT CONTRACT (D-E; confirmed against code.claude.com/docs/en/hooks, 2026-06-20):
 *   `Stop` (NOT `SessionEnd`) is the event — only `Stop` can INITIATE a model turn (SessionEnd is
 *   cleanup-only: no decision control, cannot block/continue/inject). Stop command-hook stdin:
 *     { session_id, transcript_path, cwd, hook_event_name:"Stop", permission_mode?, stop_hook_active }.
 *   To continue the agent: exit 0 with {"decision":"block","reason":"…"} (the reason is fed to Claude
 *   as feedback → another turn). LOOP GUARD: `stop_hook_active === true` means a Stop hook already
 *   blocked THIS turn — we then ALLOW the stop (plus our own fire-once close marker). The live stdin
 *   capture (GATE1_DEBUG) + the decision:block-initiates-a-turn behaviour are CONFIRMED FIRST-HAND at
 *   the founder-walked Slice-5b activation (the Slice-2 lesson: a command-hook stdin ≠ the SDK type).
 *
 * FAIL POSTURE (D-F / KG1 / R18): every step fails-honest. A reflect/accred OUTAGE never fabricates a
 *   result — reflect degrades to an honest "run your reflect now (the open was unavailable: …)" turn;
 *   the accred write logs the failure and writes nothing false. Never the standing marker credential.
 *
 * No third-party dependencies. Node 18+ (global fetch + AbortSignal.timeout).
 */

import { dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { loadConfig, readStdin, maybeDebugDump, honestLog, deriveSibling, markerPath } from "./lib/framing-core.mjs";
import { existsSync, writeFileSync, mkdirSync } from "node:fs";
import { readProvenance } from "./lib/session-state.mjs";

const HOOK_DIR = dirname(fileURLToPath(import.meta.url)); // …/claude-code/hooks

function loadCloseConfig() {
  const cfg = loadConfig({ hookDir: HOOK_DIR, eventName: "Stop", allowStrict: true });
  cfg.reflectEndpoint = process.env.GATE1_REFLECT_ENDPOINT || deriveSibling(cfg.endpoint, "practice/reflect");
  cfg.accredEndpoint = process.env.GATE1_ACCRED_ENDPOINT || deriveSibling(cfg.endpoint, "accreditation");
  cfg.agentId = (process.env.SAGE_GATE1_AGENT_ID || "").trim();
  // The accreditation write credential — DISTINCT from cfg.credential (the consult credential, which
  // in the dogfood IS the standing marker credential). It must carry accreditation_write and be a
  // NON-marker credential. Unset ⇒ no write (honest skip). NEVER falls back to cfg.credential.
  cfg.accredCredential = (process.env.SAGE_GATE1_ACCRED_CREDENTIAL || "").trim();
  // The standing pre_decision_harness MARKER credential, named so the write guard can refuse it by
  // identity (a marker sr_prac_ token is indistinguishable from a non-marker one by VALUE alone).
  // DEFAULTS to the consult credential (in the dogfood the consult credential IS the marker), so the
  // most likely accident — pasting the dogfood SAGE_GATE1_CREDENTIAL into the accred slot — is
  // refused by default. When the consult and marker credentials genuinely DIFFER (a non-dogfood
  // install), name the marker explicitly via SAGE_GATE1_MARKER_CREDENTIAL at Slice-5b activation.
  cfg.markerCredential = (process.env.SAGE_GATE1_MARKER_CREDENTIAL || cfg.credential || "").trim();
  // The reflect open credential — needs the `reflect` capability. Defaults to the accred credential
  // (a UPC carrying both). Unset ⇒ reflect-initiate degrades to an honest, server-free instruction.
  cfg.reflectCredential = (process.env.SAGE_GATE1_REFLECT_CREDENTIAL || cfg.accredCredential || "").trim();
  // Reflect-initiate mode: 'block' (default — force the Q1–Q6 turn via decision:block), 'context'
  // (soft — additionalContext only), 'off' (no reflect turn; still do the accred write). The 5b
  // live capture decides whether 'block' initiates a turn in this build; 'context' is the fallback.
  const mode = (process.env.GATE1_REFLECT_INITIATE_MODE || "block").toLowerCase();
  cfg.reflectInitiateMode = mode === "context" || mode === "off" ? mode : "block";
  return cfg;
}

// The close fire-once marker (distinct from the per-task .framed markers).
function closeMarkerPath(cfg, sessionId) {
  return markerPath(cfg, `close-${sessionId}`).replace(/\.framed$/, ".closed");
}
function writeCloseMarker(cfg, sessionId, detail) {
  try {
    mkdirSync(cfg.stateDir, { recursive: true });
    writeFileSync(closeMarkerPath(cfg, sessionId), `${new Date().toISOString()} ${detail}\n`);
  } catch {
    /* a lost marker just means the next Stop re-runs once — bounded by stop_hook_active */
  }
}

// ---------------------------------------------------------------------------
// ACCREDITATION WRITE (D-D). Returns a short status string for the log; never throws.
// ---------------------------------------------------------------------------
async function writeAccreditation(cfg, sessionId) {
  const signed = readProvenance(cfg, sessionId);
  if (signed.length === 0) {
    return "no-provenance"; // no examination accumulated ⇒ nothing to attest (R18f). Honest skip.
  }
  if (!cfg.accredCredential) {
    return "no-accred-credential"; // never fall back to the marker credential (D-D).
  }
  if (!cfg.agentId) {
    return "no-agent-id"; // the write boundary needs a K1-canonical agent_id.
  }
  // D-D — NEVER write on the standing pre_decision_harness MARKER credential (a write on it would
  // clobber the marker's accreditation row with this degraded seed). Two independent guards, neither
  // using a `cfg.credential &&` short-circuit (accredCredential is already guaranteed non-empty
  // above, so an empty consult credential cannot disable either):
  //   (A) refuse if the accred credential equals the NAMED marker credential (the real protection —
  //       markerCredential defaults to the consult credential, covering the dogfood, and is
  //       overridable via SAGE_GATE1_MARKER_CREDENTIAL when consult ≠ marker);
  //   (B) belt-and-braces: refuse if it equals the consult credential directly.
  if (cfg.markerCredential && cfg.accredCredential === cfg.markerCredential) {
    return "refused-marker-credential";
  }
  if (cfg.accredCredential === cfg.credential) {
    return "refused-marker-credential";
  }

  const nowIso = new Date().toISOString();
  const expiresIso = new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString();
  const url = `${cfg.accredEndpoint.replace(/\/+$/, "")}/${encodeURIComponent(cfg.agentId)}`;
  // A minimal, server-composed seed record. coverage_status / examination_mode on the submitted
  // record are IGNORED (the server composes them); the load-bearing part is provenance.signed_assessments.
  const body = {
    kind: "seed",
    profile: {
      agent_id: cfg.agentId,
      evaluated_actions: [],
      total_actions_evaluated: 0,
      regressing_check_count: 0,
      accreditation_record: {
        agent_id: cfg.agentId,
        senecan_grade: "pre_progress",
        typical_proximity: "reflexive",
        authority_level: "supervised",
        dimension_levels: {
          passion_reduction: "emerging",
          judgement_quality: "emerging",
          disposition_stability: "emerging",
          oikeiosis_extension: "emerging",
        },
        direction_of_travel: "stable",
        evaluation_window_size: 100,
        actions_evaluated: 0,
        grade_since: nowIso,
        last_evaluation: nowIso,
        passions_persisting: [],
        verification_url: `${cfg.accredEndpoint.replace(/\/+$/, "")}/${encodeURIComponent(cfg.agentId)}`,
        expires_at: expiresIso,
        disclaimer:
          "This accreditation evaluates reasoning quality using Stoic philosophical frameworks. " +
          "It does not guarantee specific outcomes, legal compliance, or fitness for any particular " +
          "purpose. Ancient reasoning, modern application.",
        created_at: nowIso,
        updated_at: nowIso,
        typical_deliberation_breadth: "intuited",
        typical_kathekon_quality: "contrary",
      },
      window_config: {
        window_size: 100,
        grade_check_interval: 20,
        minimum_actions_for_grade: 20,
        typical_proximity_threshold: 0.6,
        dimension_level_threshold: 0.5,
        carried_candidates_max: 5,
      },
      carried_candidates: [],
    },
    provenance: { signed_assessments: signed },
  };

  let res;
  try {
    res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${cfg.accredCredential}` },
      body: JSON.stringify(body),
      signal: AbortSignal.timeout(cfg.timeoutMs),
    });
  } catch (e) {
    return `outage:${e && e.name === "TimeoutError" ? "timeout" : e?.message || e}`;
  }
  if (res.status === 409) return `already-exists(${signed.length})`; // a row already exists — honest, not an error.
  if (!res.ok) return `http-${res.status}`;
  return `written(${signed.length})`;
}

// ---------------------------------------------------------------------------
// REFLECT-INITIATE (D-C). Opens a reflect session and returns the instruction text to surface, or a
// server-free honest fallback on an outage. Never throws.
// ---------------------------------------------------------------------------
async function initiateReflect(cfg, sessionId) {
  const reflectSessionId = `reflect-${sessionId}`;
  const fallback =
    "[SageReasoning — Sage Reflect: run your post-action reflection now]\n" +
    `Open a reflection at POST ${cfg.reflectEndpoint} with { "session_id": "${reflectSessionId}", ` +
    `"agent_id": "${cfg.agentId || "<your agent_id>"}", "session_summary": "<your honest summary of this session>" } ` +
    "(Authorization: Bearer <your reflect credential>), then answer the full Q1–Q6 sequence over the next turns. " +
    "Do not abbreviate it — Q1 phantasia → Q2 synkatathesis → Q3 horme → Q4 praxis → Q5 profile → Q6 purpose-fit.";

  if (!cfg.reflectCredential) {
    return { text: fallback, status: "no-reflect-credential" };
  }

  const sessionSummary =
    "Agent session is closing. The decisions and actions taken this session are reviewed below; " +
    "complete the full Stoic reflection (Q1–Q6) on this session's reasoning.";

  let res;
  try {
    res = await fetch(cfg.reflectEndpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${cfg.reflectCredential}` },
      body: JSON.stringify({
        session_id: reflectSessionId,
        agent_id: cfg.agentId || reflectSessionId,
        session_summary: sessionSummary,
      }),
      signal: AbortSignal.timeout(cfg.timeoutMs),
    });
  } catch (e) {
    const reason = e && e.name === "TimeoutError" ? "timeout" : e?.message || e;
    return { text: `${fallback}\n(The automated reflect open was unavailable: ${reason}.)`, status: `outage:${reason}` };
  }
  if (!res.ok) {
    return {
      text: `${fallback}\n(The automated reflect open returned http ${res.status}.)`,
      status: `http-${res.status}`,
    };
  }
  let q1 = "";
  try {
    const body = await res.json();
    q1 = extractQuestion(body);
  } catch {
    /* keep q1 empty → the instruction still stands */
  }
  const text =
    "[SageReasoning — Sage Reflect: run your post-action reflection now]\n" +
    `A reflection session was opened for you (session_id "${reflectSessionId}"). ` +
    (q1 ? `The first question is:\n  ${q1}\n` : "") +
    `Answer it, then continue the FULL Q1–Q6 sequence by POSTing each answer to ${cfg.reflectEndpoint} ` +
    `with { "session_id": "${reflectSessionId}", "agent_id": "${cfg.agentId || reflectSessionId}", "response": "<your answer>" }. ` +
    "Do not abbreviate the sequence — it reviews phantasia → synkatathesis → horme → praxis → profile → purpose-fit.";
  return { text, status: "opened" };
}

// Pull the question text out of the reflect open response (defensive across response shapes).
function extractQuestion(body) {
  if (!body || typeof body !== "object") return "";
  const candidates = [body.question_text, body.text, body.question, body?.result?.question_text, body?.data?.question_text];
  for (const c of candidates) if (typeof c === "string" && c.trim()) return c.trim();
  return "";
}

async function main() {
  const cfg = loadCloseConfig();

  const raw = readStdin();
  maybeDebugDump(cfg, raw); // GATE1_DEBUG → dump the raw Stop stdin (confirms the close-event shape live).
  let event = {};
  try {
    event = JSON.parse(raw || "{}");
  } catch {
    process.exit(0); // cannot parse → allow the stop (never trap the session on a parse error).
  }

  const sessionId = event.session_id || "no-session";

  // LOOP GUARD 1 (D-E): if a Stop hook already blocked THIS turn, allow the stop now (avoid the loop).
  if (event.stop_hook_active === true) {
    process.exit(0);
  }
  // LOOP GUARD 2 (fire-once per session): if we already ran the close, allow the stop.
  if (cfg.fireOnce) {
    try {
      if (existsSync(closeMarkerPath(cfg, sessionId))) process.exit(0);
    } catch {
      /* if we cannot check the marker, fall through and run once (bounded by stop_hook_active) */
    }
  }

  // 1. Accreditation write (D-D) — a side-effect; happens regardless of the reflect path.
  const accredStatus = await writeAccreditation(cfg, sessionId);

  // 2. Reflect-initiate (D-C).
  let reflect = { text: "", status: "off" };
  if (cfg.reflectInitiateMode !== "off") {
    reflect = await initiateReflect(cfg, sessionId);
  }

  // 3. Record the close (fire-once) BEFORE we block, so a re-fire on the reflect turn is suppressed.
  writeCloseMarker(cfg, sessionId, `accred=${accredStatus} reflect=${reflect.status}`);
  honestLog(cfg, `CLOSE session=${sanitizeLog(sessionId)} accred=${accredStatus} reflect=${reflect.status} mode=${cfg.reflectInitiateMode}`);

  // 4. Emit. 'block' forces the reflect turn (the reason is the instruction); 'context' injects it
  //    softly; 'off' just allows the stop after the accred write.
  if (cfg.reflectInitiateMode === "block" && reflect.text) {
    process.stdout.write(JSON.stringify({ decision: "block", reason: reflect.text }));
    process.exit(0);
  }
  if (cfg.reflectInitiateMode === "context" && reflect.text) {
    process.stdout.write(
      JSON.stringify({ hookSpecificOutput: { hookEventName: "Stop", additionalContext: reflect.text } }),
    );
    process.exit(0);
  }
  process.exit(0); // mode 'off' (or no reflect text) — allow the stop; the accred write already ran.
}

function sanitizeLog(s) {
  return String(s || "no-session").replace(/[^a-zA-Z0-9._-]/g, "_");
}

// Catch-all: any unexpected error → allow the stop (never trap the user's session on a hook bug).
main().catch((e) => {
  try {
    honestLog(loadConfig({ hookDir: HOOK_DIR, eventName: "Stop" }), `CLOSE-ERROR reason="internal hook error: ${e?.message || e}"`);
  } catch {
    /* logging must never throw */
  }
  process.exit(0);
});
