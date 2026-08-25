/**
 * SageReasoning — Gate 1 CLOSE-SIGNAL state (H3 writes, H4 reads; IW-7 opening 3, both phases).
 * Governing design: `operations/reflections-examination-2026-08/2026-08-25-iw7-three-openings-scope.md`
 * §3 + the two mentor rulings (verbatim files of the same date). Mirrors this codebase's own idiom
 * for exactly this problem — a per-session state file bridging two separate hook process invocations
 * — established by `elicitMarkerPath` (at-action-hook.mjs) and session-state.mjs's provenance/loop-
 * state files, per the build prompt's own recommendation (pattern 1 over re-parsing honestLog).
 *
 * TWO signal kinds, one file each per session, gated end-to-end behind cfg.closeContentVariationEnabled
 * (framing-core.mjs) — when the flag is off, NOTHING in this module is ever called from either hook,
 * so no new files are ever written (byte-identity to pre-IW-7 behaviour, test-asserted at the hook
 * level, not merely at this module's own no-op level):
 *
 *   GUARD-CAUTION signal (phase one) — did runGuard return a caution verdict at ANY point this
 *   session? A single fact, not graded — the guard's own narrow, named irreversible-action allowlist
 *   makes any caution on it a genuine risk signal (the ruling: "not a sparse-extraction default").
 *   FIRST-WINS: the first caution this session recorded is kept (a session's first close-worthy event
 *   is the one worth naming; overwriting on every subsequent caution would just add write churn for
 *   no semantic gain, since the phase-one content only ever asks "did this happen," not "what was the
 *   last one").
 *
 *   CONSULT signal (phase two) — the STRONGEST (highest-confidence) qualifying runConsult verdict this
 *   session produced, per consult-signal.mjs's classification. STRONGEST-WINS, not first-wins and not
 *   last-wins: the ruling asks "did ANY verdict this session" cross the condition, and a later
 *   low-confidence reading must never silently downgrade an earlier high-confidence one out of the
 *   close turn's content (consult-signal.mjs's candidateSupersedes encodes the ordering; a low read
 *   supersedes only when nothing is recorded yet, so the session's best evidence persists).
 *
 * DISCIPLINE (KG1/R18, matching every other file in this pair): every function fails soft. A read
 * failure is treated as "no signal" (the close turn falls back to the generic base prompt — the safe
 * default); a write failure is swallowed (worst case the close turn stays generic — never a fabricated
 * or stale-but-claimed-fresh signal). Nothing here touches stdout/exit — that is the hook's job.
 *
 * ACCEPTED, DISCLOSED LIMIT (PR19 review, 2026-08-25): the record functions below are
 * check-then-act (read the current signal, decide, write) with NO file locking. Two `at-action-hook.mjs`
 * invocations for the SAME session_id, running concurrently (Claude Code can dispatch multiple tool
 * calls from one turn in parallel), could race — the "winner" of a first-wins/strongest-wins decision
 * becomes whichever process's write lands last, not literally the first-in-time or provably-strongest
 * one. This cannot corrupt the JSON (each payload is small enough to be a single atomic POSIX write)
 * and cannot let a low-confidence signal beat a high-confidence one that was ALREADY ON DISK when the
 * race started — only two simultaneous first-time writes can race each other, both already qualifying
 * candidates. Best-effort, matching this module's own fail-soft posture; not a correctness defect,
 * named here so a future reader does not rediscover it as a surprise.
 *
 * No third-party dependencies. Node 18+.
 */

import { existsSync, mkdirSync, writeFileSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { candidateSupersedes } from "./consult-signal.mjs";

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
// GUARD-CAUTION signal (phase one). First-wins.
// ---------------------------------------------------------------------------
export function guardCautionSignalPath(cfg, sessionId) {
  return join(cfg.stateDir, `${sanitize(sessionId)}.guardcaution.json`);
}

/** Read the recorded guard-caution signal for this session, or null. Never throws. */
export function readGuardCautionSignal(cfg, sessionId) {
  try {
    const p = guardCautionSignalPath(cfg, sessionId);
    if (!existsSync(p)) return null;
    const obj = JSON.parse(readFileSync(p, "utf8"));
    return obj && typeof obj === "object" ? obj : null;
  } catch {
    return null; // corrupt/unreadable ⇒ treat as no signal, never crash the caller.
  }
}

/**
 * Record a guard-caution signal ONLY if none is recorded yet this session (first-wins). Returns
 * true if a write happened, false otherwise (already recorded, or the write itself failed). Never
 * throws — a failed write just means the close turn stays generic, the honest degraded form.
 */
export function recordGuardCautionSignal(cfg, sessionId, { tool, proximity } = {}) {
  if (readGuardCautionSignal(cfg, sessionId)) return false;
  try {
    ensureDir(cfg);
    writeFileSync(
      guardCautionSignalPath(cfg, sessionId),
      JSON.stringify({
        tool: typeof tool === "string" ? tool : null,
        proximity: typeof proximity === "string" ? proximity : null,
        at: new Date().toISOString(),
      }),
    );
    return true;
  } catch {
    return false;
  }
}

// ---------------------------------------------------------------------------
// CONSULT signal (phase two). Strongest-wins (see consult-signal.mjs candidateSupersedes).
// ---------------------------------------------------------------------------
export function consultSignalPath(cfg, sessionId) {
  return join(cfg.stateDir, `${sanitize(sessionId)}.consultsignal.json`);
}

/** Read the recorded consult signal for this session, or null. Never throws. */
export function readConsultSignal(cfg, sessionId) {
  try {
    const p = consultSignalPath(cfg, sessionId);
    if (!existsSync(p)) return null;
    const obj = JSON.parse(readFileSync(p, "utf8"));
    return obj && typeof obj === "object" ? obj : null;
  } catch {
    return null;
  }
}

/**
 * Record a consult signal candidate iff it supersedes whatever is already recorded this session
 * (consult-signal.mjs's candidateSupersedes — strongest-wins). `candidate` is the classification
 * shape from consult-signal.mjs's classifyConsultSignal, plus `confidence` resolved by the caller
 * (H3 — this module knows nothing about verdict/extraction shapes, only the recorded envelope) and
 * `tool` (the tool name, for the close turn's "did your closing reflection address <tool>" wording).
 * Returns true iff a write happened. Never throws.
 */
export function recordConsultSignal(cfg, sessionId, candidate) {
  const existing = readConsultSignal(cfg, sessionId);
  if (!candidateSupersedes(existing, candidate)) return false;
  try {
    ensureDir(cfg);
    writeFileSync(
      consultSignalPath(cfg, sessionId),
      JSON.stringify({
        tool: typeof candidate.tool === "string" ? candidate.tool : null,
        basis: candidate.basis || null,
        confidence: candidate.confidence || null,
        proximity: candidate.proximity || null,
        quality: candidate.quality || null,
        at: new Date().toISOString(),
      }),
    );
    return true;
  } catch {
    return false;
  }
}
