/**
 * SageReasoning — Gate 1 AT-ACTION examined-input COMPOSER (S11b, 2026-07-18).
 *
 * WHY THIS MODULE EXISTS (the S11a diagnosis of record,
 * operations/trust-layer-2026-07/2026-07-18-S11a-extraction-gate-diagnosis.md §2):
 * the at-action examination's input was STARVED BY COMPOSITION at the harness
 * site — the old describeAction sent a `Write` as "path + char count" (the file
 * content was discarded entirely) and an `Edit` as the first 200 chars of
 * new_string. Affected parties genuinely present in the underlying action were
 * structurally invisible to Layer 1 (which is itself faithful on what it is
 * shown). This module is the remedy: it composes an examined text that CAN
 * carry parties — the agent's narrated intent (transcript tail) first, then a
 * bounded payload excerpt — per the S11b founder elections (2026-07-18):
 *   E1 composition = intent + payload, bounded;
 *   E2 egress      = mandatory sensitive-path denylist + token redaction;
 *   E3 dedup       = content-hash (PAYLOAD-only — the intent grows with the
 *                    conversation, so hashing it would defeat dedup entirely);
 *   E4 rollout     = GATE1_ACTION_TEXT_MODE knob, default "composed".
 *
 * THE EXTRACTION-REGIME VERSION-MARK (ADR-014 "Extraction-regime markers" —
 * settled ONCE, here; AE-1's delta computations refuse to compare across a
 * regime boundary): every captured observation carries the regime under which
 * its input was composed. An instrument change must never masquerade as agent
 * change.
 *
 * THE ITEM-5 BARE-TOOL-PAYLOAD TRIGGER (ADR-014 E5): when the examined text is
 * structurally a path/metadata projection (lean mode, a denylisted path, empty
 * content, NotebookEdit), the composer marks the record `bare_tool_payload` and
 * the hook injects a T2-SOFT ask (renderBareInputNote) — NEVER a halt on this
 * surface (a T1 halt would starve R18f provenance on the whole distribution).
 *
 * EGRESS DISCIPLINE (S11a review HIGH + the 2026-07-17 credential-exposure
 * incident): composed content leaves the machine to /api/reason (retained
 * encrypted 90d, quoted verbatim into SIGNED assessments by the corroboration
 * check, appended to the local provenance JSONL, carried on H4 accreditation
 * writes). Therefore: (1) the sensitive-path denylist below is MANDATORY and
 * APPEND-ONLY — operator additions extend it, nothing can remove the defaults;
 * a matching path gets the LEAN composition (path + char count only, no intent);
 * (2) redactSecrets scrubs token-shaped strings from every composed part (and
 * from the Bash command TEXT — a strict egress improvement over v1, which sent
 * commands verbatim; the LOCAL guard patterns still read the raw command).
 *
 * THE A2 BOUND (R13, stated here because this module is where it would be
 * mis-read as fixed): the recomposition reduces STARVATION; it does not raise
 * extraction trust. A harm omitted from the narration and absent from the
 * payload still produces no circle — the same wire signature as a genuinely
 * party-less act. That structural residual survives this module.
 *
 * PURE except readTranscriptTail (fs read, fail-soft ""). No third-party deps.
 */

import { shortHash } from "./framing-core.mjs";
import { readTranscriptTail } from "./discernment.mjs";

// ---------------------------------------------------------------------------
// The extraction-regime version-mark (ADR-014 — settled once, exported for the
// capture record, the honest log, and the eventual AE-1 delta layer).
// ---------------------------------------------------------------------------
export const EXTRACTION_REGIME_COMPOSED = "at-action-v2-composed";
export const EXTRACTION_REGIME_LEAN = "at-action-v1-lean";
export function regimeForMode(mode) {
  return mode === "lean" ? EXTRACTION_REGIME_LEAN : EXTRACTION_REGIME_COMPOSED;
}

// ---------------------------------------------------------------------------
// Budgets. Sum (worst case, incl. truncation markers + template) stays ≤ 4800
// (framing-core MAX_SERVER_INPUT_CHARS) for realistic file-path lengths
// (≈ ≤150 chars of headroom is consumed by the path, which appears once in the
// prefix line); a PATHOLOGICALLY long path can push the total past 4800, in
// which case fetchFrame/fetchGuardrail's truncateForServer backstop still
// guarantees the POST clears the server's 5000-char TEXT_LIMITS.medium cap
// (4800 + its ~90-char marker < 5000) — the server 400 is unreachable either way.
// ---------------------------------------------------------------------------
export const INTENT_MAX_CHARS = 1400;
export const EDIT_OLD_MAX_CHARS = 1200;
export const EDIT_NEW_MAX_CHARS = 1800;
export const WRITE_HEAD_MAX_CHARS = 2200;
export const WRITE_TAIL_MAX_CHARS = 800;
const INTENT_RAW_READ_CHARS = 2400; // read a little more than the budget; keep the most recent tail.

// ---------------------------------------------------------------------------
// The MANDATORY sensitive-path denylist (S11a review HIGH; the 2026-07-17
// incident's file class is the second pattern). Matched case-insensitively
// against the full path. APPEND-ONLY: isSensitivePath always applies the
// defaults; operator additions (GATE1_SENSITIVE_PATHS / gate1.config
// sensitivePaths) extend the list and can never replace it. Patterns are kept
// PRECISE (the RA-1-F3 lesson: guards must match the real thing, not a name
// resembling it — e.g. `credentials` matches an AWS credentials file, but not
// this repo's practice-credential.ts source module).
// ---------------------------------------------------------------------------
export const DEFAULT_SENSITIVE_PATH_PATTERNS = [
  "(^|[\\\\/])\\.env[^\\\\/]*$", // .env, .env.local, .env.development.local, …
  "(^|[\\\\/])settings\\.local\\.json[^\\\\/]*$", // the incident class (+ .bak et al), any location
  "(^|[\\\\/])\\.npmrc$",
  "(^|[\\\\/])\\.netrc$",
  "(^|[\\\\/])\\.ssh[\\\\/]",
  "(^|[\\\\/])\\.aws[\\\\/]credentials[^\\\\/]*$",
  "id_rsa[^\\\\/]*$",
  "id_ed25519[^\\\\/]*$",
  "\\.(pem|key|p12|pfx|keystore|jks)$",
  "(^|[\\\\/])credentials(\\.json)?$",
  "(^|[\\\\/])secrets?\\.(json|ya?ml|env|txt)$",
];

export function compileSensitivePatterns(additions = []) {
  const out = [];
  for (const p of [...DEFAULT_SENSITIVE_PATH_PATTERNS, ...(additions || [])]) {
    try {
      out.push(new RegExp(p, "i"));
    } catch {
      /* a malformed operator addition is skipped; the defaults always compile. */
    }
  }
  return out;
}

export function isSensitivePath(fp, additions = []) {
  const p = String(fp == null ? "" : fp);
  if (!p) return false;
  return compileSensitivePatterns(additions).some((re) => re.test(p));
}

// ---------------------------------------------------------------------------
// Token redaction (election E2). Applied to every composed part before it can
// egress. Redaction only ever alters the EXAMINED text — never the file, never
// the local guard's raw command read. False positives (e.g. a long base64 run
// that is not a secret) degrade the examined text slightly — the safe
// direction. Hex threshold is 48 (not 40) so full git SHAs (40 hex) survive in
// narration while 64-hex key material is caught — a documented trade.
// ---------------------------------------------------------------------------
const REDACTIONS = [
  [/\bsr_(?:live|prac|inst|assent)_[A-Za-z0-9][A-Za-z0-9_-]{5,}/g, "[redacted:sr-credential]"],
  [/\beyJ[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{6,}(?:\.[A-Za-z0-9_-]{6,})?/g, "[redacted:jwt]"],
  [/\b(authorization\s*:\s*bearer)\s+\S+/gi, "$1 [redacted]"],
  [/\bsk-[A-Za-z0-9_-]{20,}/g, "[redacted:api-key]"],
  [/\bghp_[A-Za-z0-9]{20,}/g, "[redacted:gh-token]"],
  [/\bAKIA[0-9A-Z]{16}\b/g, "[redacted:aws-key]"],
  [/\b[0-9a-fA-F]{48,}\b/g, "[redacted:hex]"],
  [/\b[A-Za-z0-9+/]{64,}={0,2}\b/g, "[redacted:b64]"],
];

export function redactSecrets(text) {
  let s = String(text == null ? "" : text);
  try {
    for (const [re, repl] of REDACTIONS) s = s.replace(re, repl);
  } catch {
    /* redaction must never throw; worst case the original text stands. */
  }
  return s;
}

// ---------------------------------------------------------------------------
// Intent channel (election E1). readTranscriptTail returns ASSISTANT text
// blocks only (tool results, user messages, and hook-injected additionalContext
// are structurally excluded). stripFrameBlocks additionally drops paragraphs
// QUOTING harness frames (the "[SageReasoning" sentinel) so the harness's own
// injected vocabulary (circles, passions) cannot feed back into extraction and
// manufacture signals — the contamination-loop guard.
// ---------------------------------------------------------------------------
export function stripFrameBlocks(text) {
  const s = String(text == null ? "" : text);
  if (!s) return "";
  return s
    .split(/\n{2,}/)
    .filter((para) => !para.includes("[SageReasoning"))
    .join("\n\n")
    .trim();
}

export function intentFromTranscript(transcriptPath, readTail = readTranscriptTail) {
  let raw = "";
  try {
    raw = readTail(transcriptPath, INTENT_RAW_READ_CHARS) || "";
  } catch {
    raw = ""; // fail-soft: no intent is honest; never blocks composition.
  }
  const cleaned = redactSecrets(stripFrameBlocks(raw));
  if (cleaned.length <= INTENT_MAX_CHARS) return cleaned;
  // TAIL-anchored: the narration nearest the action is at the end.
  return "…" + cleaned.slice(-INTENT_MAX_CHARS);
}

// Bounded excerpts. Head-anchored (the opening carries the declaration/shape)…
export function boundedHead(s, max) {
  const t = String(s == null ? "" : s);
  if (t.length <= max) return t;
  return t.slice(0, max) + `\n…[truncated at ${max} chars]`;
}
// …and head+tail for Write content (parties are often named late in a file —
// the head-only anchoring of truncateForServer was part of the starvation).
export function boundedHeadTail(s, headMax, tailMax) {
  const t = String(s == null ? "" : s);
  if (t.length <= headMax + tailMax) return t;
  const omitted = t.length - headMax - tailMax;
  return t.slice(0, headMax) + `\n…[middle omitted: ${omitted} chars]…\n` + t.slice(t.length - tailMax);
}

// ---------------------------------------------------------------------------
// The raw payload string per tool — the E3 dedup hash input (PAYLOAD ONLY;
// never the intent) and the redaction/composition source. Null ⇒ no payload.
// ---------------------------------------------------------------------------
export function payloadOf(toolName, ti) {
  switch (toolName) {
    case "Edit":
      return `${typeof ti.old_string === "string" ? ti.old_string : ""} ${
        typeof ti.new_string === "string" ? ti.new_string : ""
      }`;
    case "MultiEdit": {
      if (Array.isArray(ti.edits)) {
        return ti.edits
          .map(
            (e) =>
              `${e && typeof e.old_string === "string" ? e.old_string : ""} ${
                e && typeof e.new_string === "string" ? e.new_string : ""
              }`,
          )
          .join("");
      }
      return `${typeof ti.old_string === "string" ? ti.old_string : ""} ${
        typeof ti.new_string === "string" ? ti.new_string : ""
      }`;
    }
    case "Write":
      return typeof ti.content === "string" ? ti.content : "";
    default:
      return null;
  }
}

// The v1 LEAN one-liners — kept byte-identical to the pre-S11b describeAction
// strings. Used as (a) the whole examined text in lean/bare cases and (b) the
// `summary` every display/state consumer keeps reading in composed mode (the
// Gate-2 elicitation block, the loop-state adoptedCorrection, the capture
// record's actionPreview) — so those surfaces are unchanged by the recomposition.
function leanEditText(fp, ti) {
  const snippetSrc =
    typeof ti.new_string === "string"
      ? ti.new_string
      : Array.isArray(ti.edits) && ti.edits[0] && typeof ti.edits[0].new_string === "string"
        ? ti.edits[0].new_string
        : "";
  const snippet = snippetSrc.slice(0, 200);
  return `Edit the file ${fp}${snippet ? ` — applying this change: ${snippet}` : ""}`;
}
function leanWriteText(fp, ti) {
  const len = typeof ti.content === "string" ? ti.content.length : 0;
  return `Write (create/overwrite) the file ${fp} (${len} chars)`;
}

// ---------------------------------------------------------------------------
// The composed (v2) texts. Intent first (the mentor's residual mis-siting
// point: a payload is a projection lacking the agent's narrated intention —
// F-CONF: proposed-action framings are the reliable input class), payload
// second. Everything is redacted before it can egress.
// ---------------------------------------------------------------------------
function composedEditText(fp, ti, intent) {
  let oldSrc;
  let newSrc;
  if (Array.isArray(ti.edits)) {
    oldSrc = ti.edits.map((e) => (e && typeof e.old_string === "string" ? e.old_string : "")).join("\n---\n");
    newSrc = ti.edits.map((e) => (e && typeof e.new_string === "string" ? e.new_string : "")).join("\n---\n");
  } else {
    oldSrc = typeof ti.old_string === "string" ? ti.old_string : "";
    newSrc = typeof ti.new_string === "string" ? ti.new_string : "";
  }
  return [
    `Edit the file ${fp}.`,
    "Intent (the agent's own narration preceding this action):",
    intent || "(no narration captured)",
    "The change being applied:",
    "[BEFORE]",
    redactSecrets(boundedHead(oldSrc, EDIT_OLD_MAX_CHARS)) || "(empty)",
    "[AFTER]",
    redactSecrets(boundedHead(newSrc, EDIT_NEW_MAX_CHARS)) || "(empty)",
  ].join("\n");
}
function composedWriteText(fp, ti, intent) {
  const content = typeof ti.content === "string" ? ti.content : "";
  return [
    `Write (create/overwrite) the file ${fp} (${content.length} chars).`,
    "Intent (the agent's own narration preceding this action):",
    intent || "(no narration captured)",
    `The content being written${content.length > WRITE_HEAD_MAX_CHARS + WRITE_TAIL_MAX_CHARS ? " (head/tail excerpt)" : ""}:`,
    redactSecrets(boundedHeadTail(content, WRITE_HEAD_MAX_CHARS, WRITE_TAIL_MAX_CHARS)),
  ].join("\n");
}

// ---------------------------------------------------------------------------
// The item-5 T2-soft ask (ADR-014 E5). ADVISE channel — an observation the
// agent may answer in conversation (the answer enters subsequent examinations
// via the intent channel). NEVER a halt on this surface.
// ---------------------------------------------------------------------------
export function renderBareInputNote() {
  return (
    "• Input class: bare tool payload — the examined text for this action carried no party, role, or " +
    "purpose context (a path/metadata projection; circles of concern are unextractable from the payload " +
    "alone). If this action affects any party, say who in this conversation — the statement enters " +
    "subsequent examinations. This is an observation, not a halt."
  );
}

/**
 * Compose the examined action. Returns null when the tool call carries no
 * examinable action (no command / no path) — the hook allows silently, as v1 did.
 *
 * Returns { text, summary, signature, bashCommand, inputClass, regime, bare }:
 *   text       — the EXAMINED text (what fetchFrame/fetchGuardrail POST).
 *   summary    — the v1 lean one-liner (display + loop-state + capture preview).
 *   signature  — the fire-once dedup key. Composed mode: tool:path:hash(payload)
 *                (E3 — a materially distinct edit is a new decision; identical
 *                retries dedup). Lean/bare + Bash + NotebookEdit: the v1 form.
 *   inputClass — 'composed' | 'bare_tool_payload' | 'command' | 'tool_payload'.
 *   regime     — the extraction-regime mark for captured records (ADR-014).
 *   bare       — fire the item-5 T2-soft ask.
 */
export function composeAction({ toolName, toolInput, transcriptPath, mode = "composed", sensitiveAdditions = [], readTail } = {}) {
  const ti = toolInput && typeof toolInput === "object" ? toolInput : {};
  const regime = regimeForMode(mode);

  switch (toolName) {
    case "Bash": {
      const cmd = typeof ti.command === "string" ? ti.command.trim() : "";
      if (!cmd) return null;
      // Text redacted (egress); bashCommand RAW (the local guard patterns +
      // housekeeping classifier read the real command). Signature unchanged (v1).
      const text = `Run this shell command: ${redactSecrets(cmd)}`;
      return { text, summary: text, signature: `Bash:${shortHash(cmd)}`, bashCommand: cmd, inputClass: "command", regime, bare: false };
    }
    case "Edit":
    case "MultiEdit": {
      const fp = typeof ti.file_path === "string" ? ti.file_path : "";
      if (!fp) return null;
      // S11b review fold (HIGH, first-hand 2026-07-18): the v1 lean Edit string
      // carries up to 200 chars of new_string — for a SENSITIVE path that is
      // content egress (the incident file class), so the sensitive fallback is
      // the path line ONLY, in text AND summary (the summary reaches the
      // elicitation block + local capture previews). No frozen-window record
      // shows this class historically, but the hole closes here regardless.
      if (isSensitivePath(fp, sensitiveAdditions)) {
        const bareText = `Edit the file ${fp}`;
        return { text: bareText, summary: bareText, signature: `${toolName}:${fp}`, bashCommand: null, inputClass: "bare_tool_payload", regime, bare: true };
      }
      const summary = leanEditText(fp, ti);
      if (mode === "lean") {
        // LEAN mode: v1-shaped text + signature; the POSTable text is REDACTED
        // (an egress improvement over v1 — a token inside the 200-char snippet
        // never leaves the machine; the local summary keeps the raw snippet).
        return { text: redactSecrets(summary), summary, signature: `${toolName}:${fp}`, bashCommand: null, inputClass: "bare_tool_payload", regime, bare: true };
      }
      const intent = intentFromTranscript(transcriptPath, readTail);
      const text = composedEditText(fp, ti, intent);
      return {
        text,
        summary,
        signature: `${toolName}:${fp}:${shortHash(payloadOf(toolName, ti))}`,
        bashCommand: null,
        inputClass: "composed",
        regime,
        bare: false,
      };
    }
    case "Write": {
      const fp = typeof ti.file_path === "string" ? ti.file_path : "";
      if (!fp) return null;
      const summary = leanWriteText(fp, ti);
      const content = typeof ti.content === "string" ? ti.content : "";
      if (mode === "lean" || isSensitivePath(fp, sensitiveAdditions) || content.length === 0) {
        return { text: summary, summary, signature: `Write:${fp}`, bashCommand: null, inputClass: "bare_tool_payload", regime, bare: true };
      }
      const intent = intentFromTranscript(transcriptPath, readTail);
      const text = composedWriteText(fp, ti, intent);
      return {
        text,
        summary,
        signature: `Write:${fp}:${shortHash(content)}`,
        bashCommand: null,
        inputClass: "composed",
        regime,
        bare: false,
      };
    }
    case "NotebookEdit": {
      const fp = typeof ti.notebook_path === "string" ? ti.notebook_path : "";
      if (!fp) return null;
      const text = `Edit notebook cell in ${fp}`;
      return { text, summary: text, signature: `NotebookEdit:${fp}`, bashCommand: null, inputClass: "bare_tool_payload", regime, bare: true };
    }
    default: {
      // Unknown consequential tool (e.g. an MCP tool in guardTools) — v1 generic
      // projection. Carries up to 300 chars of params (may carry purpose), so it
      // is 'tool_payload', not bare; redacted before egress.
      let blob = "";
      try {
        blob = JSON.stringify(ti).slice(0, 300);
      } catch {
        blob = "";
      }
      const text = `Invoke tool ${toolName}${blob ? ` with ${redactSecrets(blob)}` : ""}`;
      return { text, summary: text, signature: `${toolName}:${shortHash(blob)}`, bashCommand: null, inputClass: "tool_payload", regime, bare: false };
    }
  }
}
