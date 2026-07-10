#!/usr/bin/env node
/**
 * SageReasoning — S8 HAND-BACK hook (H5): the delegation close (Governance layer).
 * Claude Code `PostToolUse`, matched to the subagent-spawn tool (`Task` / `Agent`).
 * Trust Layer S8.  Governing design: adopted/adr/2026-07-08-sage-trust-layer.md (ADR-013 §5 A8/A9)
 * + adopted/adr/2026-06-20-pre-decision-harness-arc2.md (the channel law).
 *
 * WHAT IT DOES
 *   Fires AFTER a delegated subagent returns. If H2 opened a discernment/collaboration record for
 *   this spawn (the spawn record exists), this hook POSTs the hand-back to the dark
 *   /api/practice/discernment route (phase 'hand_back') carrying the sub-spawn's ACCUMULATED
 *   SIGNED assessments (the provenance H2's frame consult appended) so the server can:
 *     · RE-VERIFY the artifacts (R18f-parallel — unverified contributes nothing);
 *     · classify an A9 justice failure (capacity-proportional: case 1/2/3) when a verified
 *       assessment shows a violated obligation;
 *     · write the reflection into the collaboration record and EMIT the A8/A9 trust events the S1
 *       vocabulary defined (delegation-reflection-case-{1,2,3}; orchestrator-proceeds-under-
 *       habitual-flag is available via the same seam for S9's explicit-decision flows).
 *
 * CHANNEL LAW: entirely INSTRUMENT — the hook does everything out-of-band on its own credential;
 *   no agent is ever asked; nothing is injected into any conversation. MEASURE: nothing binds.
 *
 * FAIL POSTURE (KG1 / R18): everything fails open with an honest log. No spawn record ⇒ silent
 *   allow (H2 ran no discernment for this spawn). No accumulated signed artifacts ⇒ honest skip
 *   (nothing to hand back — never a fabricated failure). An outage logs + writes nothing false.
 *   This hook NEVER blocks or alters the tool result (PostToolUse output is not used to modify).
 *
 * WIRE CONTRACT (PostToolUse command hook):
 *   - STDIN : { session_id, transcript_path, cwd, hook_event_name:"PostToolUse", tool_name,
 *              tool_input, tool_response }. `tool_input.prompt` is the (possibly harness-framed)
 *              delegated prompt — the raw task is recovered by stripping the injected prefix
 *              (lib/discernment.mjs stripInjectedPrefix) so the spawn key matches H2's.
 *   - EXIT 0 always (fail-open; instrumentation only).
 *
 * No third-party dependencies. Node 18+ (global fetch + AbortSignal.timeout).
 */

import { dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { existsSync, writeFileSync, mkdirSync } from "node:fs";
import { join } from "node:path";
import { loadConfig, readStdin, maybeDebugDump, honestLog, shortHash } from "./lib/framing-core.mjs";
import { readProvenance } from "./lib/session-state.mjs";
import {
  loadDiscernmentConfig,
  discernmentEnabled,
  discernmentEndpoint,
  resolveSpawnKey,
  appendObservability,
  makeSpanRef,
} from "./lib/discernment.mjs";

const HOOK_DIR = dirname(fileURLToPath(import.meta.url)); // …/claude-code/hooks

function handbackMarkerPath(cfg, spawnKey) {
  return join(cfg.stateDir, `${String(spawnKey).replace(/[^a-zA-Z0-9._-]/g, "_")}.handback`);
}

async function postHandBack(cfg, dcfg, payload) {
  let res;
  try {
    res = await fetch(discernmentEndpoint(cfg, dcfg), {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${cfg.credential}` },
      body: JSON.stringify(payload),
      signal: AbortSignal.timeout(cfg.timeoutMs),
    });
  } catch (e) {
    return { ok: false, reason: e && e.name === "TimeoutError" ? "timeout" : `request failed: ${e?.message || e}` };
  }
  if (!res.ok) return { ok: false, reason: `http ${res.status}` };
  let body = null;
  try {
    body = await res.json();
  } catch {
    /* a bodiless 200 still counts */
  }
  return { ok: true, body };
}

async function main() {
  const cfg = loadConfig({ hookDir: HOOK_DIR, eventName: "PostToolUse", allowStrict: false });

  const raw = readStdin();
  maybeDebugDump(cfg, raw);
  let event = {};
  try {
    event = JSON.parse(raw || "{}");
  } catch {
    process.exit(0); // nothing to hand back; never disturb the loop.
  }

  const toolName = typeof event.tool_name === "string" ? event.tool_name : "";
  if (toolName !== "Task" && toolName !== "Agent") process.exit(0);

  const dcfg = loadDiscernmentConfig(cfg, HOOK_DIR);
  if (!discernmentEnabled(cfg, dcfg)) process.exit(0); // un-provisioned ⇒ byte-identical (no-op).

  const toolInput = event.tool_input && typeof event.tool_input === "object" ? event.tool_input : {};
  const rawPrompt = typeof toolInput.prompt === "string" ? toolInput.prompt : "";
  if (!rawPrompt) process.exit(0);

  const sessionId = event.session_id || "no-session";
  // Resolve the spawn key H2 used — by IDENTITY (unframed prompt), then by the ALIAS
  // H2 wrote for the exact prompt it emitted, then by the legacy text derivation
  // (review fold G2: never let orchestrator-controlled task text decide the key — a
  // task containing the injected separator used to silently suppress its own hand-back).
  const resolved = resolveSpawnKey(cfg, sessionId, rawPrompt);
  if (!resolved) {
    // H2 ran no discernment for this spawn (un-provisioned at spawn time, or a
    // different task text). Nothing to close — silent allow.
    process.exit(0);
  }
  const { key: spawnKey, record } = resolved;

  // Fire-once per spawn.
  try {
    if (cfg.fireOnce && existsSync(handbackMarkerPath(cfg, spawnKey))) process.exit(0);
  } catch {
    /* cannot check → run once (bounded by the marker write below) */
  }

  // The sub-spawn's accumulated signed assessments (H2's frame consult appended
  // these under the spawn key when the write path is provisioned).
  const signed = readProvenance(cfg, spawnKey);
  if (signed.length === 0) {
    honestLog(cfg, `HANDBACK-SKIP session=${shortHash(sessionId)} spawn=${spawnKey} reason=no-signed-artifacts`);
    try {
      mkdirSync(cfg.stateDir, { recursive: true });
      writeFileSync(handbackMarkerPath(cfg, spawnKey), `${new Date().toISOString()} skipped no-artifacts\n`);
    } catch {
      /* marker best-effort */
    }
    process.exit(0);
  }

  if (!cfg.credential) {
    honestLog(cfg, `HANDBACK-SKIP session=${shortHash(sessionId)} spawn=${spawnKey} reason=no-credential`);
    process.exit(0);
  }

  const t0 = Date.now();
  const r = await postHandBack(cfg, dcfg, {
    phase: "hand_back",
    task_ref: spawnKey,
    orchestrator_agent_id: dcfg.orchestratorProfile?.agentId || "",
    justice_failure: {
      signed_assessments: signed,
      surface_identified_at_selection: record.justice_present === true,
      sub_agent_briefed: record.briefed === true,
      // The live corroboration check runs on every consult surface (S0a Live) —
      // the artifacts were produced under it.
      corroboration_run: true,
    },
  });

  if (!r.ok) {
    honestLog(cfg, `HANDBACK-OUTAGE session=${shortHash(sessionId)} spawn=${spawnKey} reason="${r.reason}"`);
    process.exit(0); // fail-open: retry is possible on a re-fire; nothing false written.
  }

  const result = r.body && typeof r.body === "object" ? r.body.result || {} : {};
  appendObservability(
    cfg,
    sessionId,
    "delegation-handback",
    {
      task_ref: spawnKey,
      artifacts_sent: signed.length,
      justice_case: result.justiceCase ?? null,
      delegation_events_emitted: result.delegationEventsEmitted ?? 0,
      record_found: result.recordFound === true,
      mode: "measure",
    },
    makeSpanRef("sage_practice.delegation.hand_back", t0, Date.now()),
  );
  honestLog(
    cfg,
    `HANDBACK session=${shortHash(sessionId)} spawn=${spawnKey} artifacts=${signed.length} ` +
      `case=${result.justiceCase || "none"} events=${result.delegationEventsEmitted ?? 0}`,
  );
  try {
    mkdirSync(cfg.stateDir, { recursive: true });
    writeFileSync(
      handbackMarkerPath(cfg, spawnKey),
      `${new Date().toISOString()} case=${result.justiceCase || "none"} events=${result.delegationEventsEmitted ?? 0}\n`,
    );
  } catch {
    /* marker best-effort */
  }
  process.exit(0);
}

// Catch-all: instrumentation must never disturb the loop.
main().catch((e) => {
  try {
    honestLog(
      loadConfig({ hookDir: HOOK_DIR, eventName: "PostToolUse", allowStrict: false }),
      `HANDBACK-ERROR reason="internal hook error: ${e?.message || e}"`,
    );
  } catch {
    /* logging must never throw */
  }
  process.exit(0);
});
