/**
 * SageReasoning — Gate 1 SESSION-STATE helpers (H3/H4, ADR-011 D-B/D-D).
 * Arc 3 / Slice 5a.  Governing design: adopted/adr/2026-06-20-pre-decision-harness-arc2.md.
 *
 * WHAT IT IS
 *   The on-disk state the full-loop harness layers on top of the fire-once markers:
 *     • PROVENANCE (D-D) — the session's accumulated SIGNED Layer-2 assessments. H1 (via the
 *       shared core, flag-gated) and H3 append each signed assessment here; H4 reads them all so
 *       the close-time accreditation write can carry genuine examination provenance (R18f —
 *       no credential without examination). Append-only JSONL keyed on the SESSION id.
 *     • LOOP STATE (D-B) — the rolling open/closed-loop record (loop-closure.mjs operates on it);
 *       a single JSON file keyed on the session id.
 *     • DECISION DEDUP (D-A) — per-distinct-decision fire-once markers so the Gate-2 consult does
 *       not fire before every Edit/Bash (a marker file per decision signature).
 *
 * DISCIPLINE (KG1 / R18): every function FAILS SOFT — a state read/write that throws is swallowed
 *   and treated as "no state" (the safe default: re-frame / re-consult / write nothing false). State
 *   is NEVER load-bearing for safety — it only deduplicates and accumulates. A corrupt provenance
 *   line is skipped, never crashes the close. Nothing here touches stdout/exit — that is the hook's.
 *
 * No third-party dependencies. Node 18+.
 */

import { existsSync, mkdirSync, writeFileSync, appendFileSync, readFileSync } from "node:fs";
import { join } from "node:path";

// Self-contained (no import from framing-core) so the shared core can import this module's
// provenance helper without a circular dependency. Identical rule to framing-core.sanitize().
function sanitize(s) {
  return String(s || "no-session").replace(/[^a-zA-Z0-9._-]/g, "_");
}

function ensureDir(cfg) {
  try {
    mkdirSync(cfg.stateDir, { recursive: true });
  } catch {
    /* a failed mkdir surfaces on the write below; never throw here */
  }
}

// ---------------------------------------------------------------------------
// PROVENANCE (D-D). One JSONL file per session; one line per signed assessment.
// ---------------------------------------------------------------------------
export function provenancePath(cfg, sessionId) {
  return join(cfg.stateDir, `${sanitize(sessionId)}.provenance.jsonl`);
}

/**
 * Append one signed Layer-2 assessment ({ assessment, signature, key_id }) to the session's
 * provenance log. No-op on a falsy/invalid signed object (an unsigned deployment yields none —
 * H4 then honestly writes no accreditation). Never throws.
 */
export function appendProvenance(cfg, sessionId, signed) {
  if (!isSignedAssessment(signed)) return false;
  try {
    ensureDir(cfg);
    appendFileSync(provenancePath(cfg, sessionId), JSON.stringify(signed) + "\n");
    return true;
  } catch {
    return false; // provenance is best-effort; a failed append must never break framing.
  }
}

/** Read all signed assessments accumulated for a session. Missing/corrupt → []. Never throws. */
export function readProvenance(cfg, sessionId) {
  const out = [];
  try {
    const p = provenancePath(cfg, sessionId);
    if (!existsSync(p)) return out;
    const text = readFileSync(p, "utf8");
    for (const line of text.split("\n")) {
      const t = line.trim();
      if (!t) continue;
      try {
        const obj = JSON.parse(t);
        if (isSignedAssessment(obj)) out.push(obj);
      } catch {
        /* skip a single corrupt line; the rest of the provenance is still usable */
      }
    }
  } catch {
    /* unreadable file → no provenance (H4 writes nothing false) */
  }
  return out;
}

/** A signed assessment carries the verifiable envelope the R18f gate needs. */
export function isSignedAssessment(x) {
  return (
    !!x &&
    typeof x === "object" &&
    typeof x.signature === "string" &&
    x.signature.length > 0 &&
    typeof x.key_id === "string" &&
    x.key_id.length > 0 &&
    !!x.assessment &&
    typeof x.assessment === "object"
  );
}

// ---------------------------------------------------------------------------
// LOOP STATE (D-B). One JSON file per session.
// ---------------------------------------------------------------------------
export function loopStatePath(cfg, sessionId) {
  return join(cfg.stateDir, `${sanitize(sessionId)}.loop.json`);
}

/** Read the rolling loop state; missing/corrupt → the empty state. Never throws. */
export function readLoopState(cfg, sessionId) {
  try {
    const p = loopStatePath(cfg, sessionId);
    if (!existsSync(p)) return { openLoop: null, closedRefs: [] };
    return JSON.parse(readFileSync(p, "utf8"));
  } catch {
    return { openLoop: null, closedRefs: [] };
  }
}

/** Persist the rolling loop state. Never throws (a lost write just re-opens/re-carries once). */
export function writeLoopState(cfg, sessionId, state) {
  try {
    ensureDir(cfg);
    writeFileSync(loopStatePath(cfg, sessionId), JSON.stringify(state));
    return true;
  } catch {
    return false;
  }
}

// ---------------------------------------------------------------------------
// DECISION DEDUP (D-A). A marker per distinct decision signature so the Gate-2
// consult fires once per decision, not before every tool call.
// ---------------------------------------------------------------------------
export function decisionMarkerPath(cfg, decisionKey) {
  return join(cfg.stateDir, `${sanitize(decisionKey)}.decision`);
}

/** True if this exact decision has already been consulted in this session. Never throws. */
export function decisionAlreadyFired(cfg, decisionKey) {
  try {
    return existsSync(decisionMarkerPath(cfg, decisionKey));
  } catch {
    return false; // if we cannot check, re-consulting once is the safe (honest) default.
  }
}

/** Record that this decision was consulted. Never throws. */
export function markDecisionFired(cfg, decisionKey, detail = "") {
  try {
    ensureDir(cfg);
    writeFileSync(decisionMarkerPath(cfg, decisionKey), `${new Date().toISOString()} ${detail}\n`);
    return true;
  } catch {
    return false;
  }
}
