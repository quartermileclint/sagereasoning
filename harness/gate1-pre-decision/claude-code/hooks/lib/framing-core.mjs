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
import { appendProvenance } from "./session-state.mjs";

export const MAX_CONTEXT_CHARS = 9500; // headroom under Claude Code's 10,000-char additionalContext cap.

// S9b (F-S9 register item 4): the server caps free-text inputs at 5000 chars
// (TEXT_LIMITS.medium on /api/reason `input` + /api/guardrail `action`). 4800
// leaves headroom for the truncation marker. HEAD-anchored: the opening of a
// task/command carries the intent; the alternative (no truncation) was an
// honest 400 and NO examination at all — observed live on H1 (S9b open) and on
// the S9 guard (findings register item 4).
export const MAX_SERVER_INPUT_CHARS = 4800;
export function truncateForServer(text) {
  const s = String(text ?? "");
  if (s.length <= MAX_SERVER_INPUT_CHARS) return s;
  return (
    s.slice(0, MAX_SERVER_INPUT_CHARS) +
    `\n[truncated by the harness at ${MAX_SERVER_INPUT_CHARS} chars — the server caps this field at 5000]`
  );
}

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

  // S2 provisioning (build-plan §S2 + founder election #2 "derive from write-path presence",
  // 2026-06-22): the accreditation write-path inputs are read HERE, in the shared core, so H3 (and
  // H1/H2) derive captureProvenance the same way H4 reads them — capture only once the operator has
  // provisioned the write path. H1/H2 read them too but only for the derive (no behaviour change
  // when unset). The accred credential must be a NON-marker accreditation_write credential bound to
  // a K1-canonical agent_id; close-hook adds the marker-refusal guards on top of these.
  const accredCredential = (process.env.SAGE_GATE1_ACCRED_CREDENTIAL || "").trim();
  const agentId = (process.env.SAGE_GATE1_AGENT_ID || "").trim();

  const cfg = {
    eventName: eventName || "UserPromptSubmit",
    endpoint: process.env.GATE1_ENDPOINT || fileCfg.endpoint || "http://localhost:3000/api/reason",
    depth: process.env.GATE1_DEPTH || fileCfg.depth || "standard", // quick | standard | deep (S9b G5 — the D3 never-deep election is RESOLVED per ADR-013 §11: deep is reachable, and REQUIRED when the trust profile reads reflexive)
    failMode: process.env.GATE1_FAIL_MODE || fileCfg.failMode || "open", // open | strict
    timeoutMs: Number(process.env.GATE1_TIMEOUT_MS || fileCfg.timeoutMs || 28000), // < the 30s hook timeout
    stateDir: process.env.GATE1_STATE_DIR || fileCfg.stateDir || join(tmpdir(), "sage-gate1"),
    fireOnce: parseBool(process.env.GATE1_FIRE_ONCE, parseBool(fileCfg.fireOnce, true)),
    credentialEnvVar: fileCfg.credentialEnvVar || "SAGE_GATE1_CREDENTIAL",
    // The write-path inputs (read above; surfaced on cfg so the close hook reuses them).
    accredCredential,
    agentId,
    // H3 guard (D-A/D-F): the fail-mode for the guardrail BLOCK on an /api/guardrail outage. Default
    // 'open' (never brick the loop on an API hiccup); 'strict' denies the tool until the gate is
    // reachable. A genuine do_not_proceed verdict ALWAYS blocks regardless of this — that is the
    // guard's purpose; this governs only the OUTAGE case (ADR-011 D-F).
    guardFailMode: (process.env.GATE1_GUARD_FAIL_MODE || fileCfg.guardFailMode) === "strict" ? "strict" : "open",
    // D-D provenance capture (Slice 5a) — WHEN to accumulate each consult's SIGNED assessment to the
    // session provenance log so H4's close-time accreditation write can carry it (R18f).
    // Precedence (founder election #2 "derive", 2026-06-22): explicit GATE1_PROVENANCE_ENABLED >
    // config-file captureProvenance > DERIVE. DERIVE = ON iff the write path is provisioned (a
    // non-marker accred credential AND a K1-canonical agent_id are BOTH set). So: the dark dogfood
    // (H1/H2, no write path) stays BYTE-IDENTICAL (derive ⇒ false ⇒ no provenance file written), and
    // a provisioned H3/H4 install captures automatically (no separate flag to forget — that unset
    // flag was the §1.4 dispositive cause of the missing credential). Never accumulates provenance it
    // has no credential to write. The append never touches stdout/exit/marker/frame even when ON.
    captureProvenance: deriveCaptureProvenance(
      process.env.GATE1_PROVENANCE_ENABLED,
      fileCfg.captureProvenance,
      accredCredential,
      agentId,
    ),
    // S1 targeting (build-plan §3.1 + §S2): the auto-CONSULT (SCORE) floor never fires on Bash by
    // default — a Bash wire payload carries no intent, so firing on the tool TYPE consulted before
    // `date`/`ls` (the over-fire). GATE1_CONSULT_BASH=true opts the NON-housekeeping Bash back into
    // the advisory floor (read-only housekeeping stays suppressed via the denylist either way).
    consultBash: parseBool(process.env.GATE1_CONSULT_BASH, parseBool(fileCfg.consultBash, false)),
    // S11 observation period (ADR-013 §7/§11 — the false-hold labelling instrument): when ON, the
    // at-action CONSULT additionally appends this verdict's kathekon-engagement signals + loop event
    // to <stateDir>/false-hold-record.jsonl — the durable 7-day accumulation the TS predicate
    // (assessKathekonEngagement) classifies (false_positive vs correct_hold). Default OFF ⇒ H3 is
    // byte-identical to pre-S11 (no capture, no file). Additive + fail-soft; never touches
    // stdout/exit/frame; MEASURE-only (labels nothing, binds nothing). Turn ON only for the
    // observation period, with a DURABLE GATE1_STATE_DIR (the default /tmp is lost on reboot).
    falseHoldCapture: parseBool(process.env.GATE1_FALSE_HOLD_CAPTURE, parseBool(fileCfg.falseHoldCapture, false)),
    // S11b (2026-07-18, elections E1–E4): the at-action examined-input composition
    // mode. "composed" (DEFAULT — the extraction-regime remedy for the S11a
    // starved-by-composition diagnosis: intent + bounded payload, denylist +
    // redaction, payload-content-hash dedup) | "lean" (the v1 path+count
    // composition, retained for the P6 A/B leg). Read ONLY by the at-action hook
    // (H3) — H1/H2 behaviour is untouched by this field.
    actionTextMode:
      (process.env.GATE1_ACTION_TEXT_MODE || fileCfg.actionTextMode) === "lean" ? "lean" : "composed",
    // S11b egress control: operator ADDITIONS to the mandatory sensitive-path
    // denylist (action-composer.mjs DEFAULT_SENSITIVE_PATH_PATTERNS). APPEND-ONLY
    // — the defaults always apply; these extend, never replace.
    sensitivePathAdditions:
      parsePatternList(process.env.GATE1_SENSITIVE_PATHS) ||
      (Array.isArray(fileCfg.sensitivePaths) ? fileCfg.sensitivePaths : null) ||
      [],
  };
  cfg.credential = process.env[cfg.credentialEnvVar] || process.env.GATE1_CREDENTIAL || "";
  // H3 guard endpoint (D-A): explicit override, else config, else derive from the reason endpoint
  // (…/api/reason → …/api/guardrail) so a single GATE1_ENDPOINT configures both.
  cfg.guardEndpoint =
    process.env.GATE1_GUARDRAIL_ENDPOINT || fileCfg.guardEndpoint || deriveSibling(cfg.endpoint, "guardrail");
  // H3 guard-set definition (D-A). irreversiblePatterns: Bash commands matching ANY of these (case-
  // insensitive) route to the guardrail BLOCK (over-blocking is the safe error on irreversible work).
  // guardTools: tool_names that ALWAYS guard regardless of content (e.g. a deploy MCP tool). Both
  // override-able via env (comma/newline list) or gate1.config.json; sensible defaults below.
  cfg.irreversiblePatterns =
    parsePatternList(process.env.GATE1_IRREVERSIBLE_PATTERNS) ||
    (Array.isArray(fileCfg.irreversiblePatterns) ? fileCfg.irreversiblePatterns : null) ||
    DEFAULT_IRREVERSIBLE_PATTERNS;
  cfg.guardTools =
    parsePatternList(process.env.GATE1_GUARD_TOOLS) ||
    (Array.isArray(fileCfg.guardTools) ? fileCfg.guardTools : null) ||
    [];
  // S9b G5 (E1 adopted): the ADR-011 D3 deep-clamp is REMOVED — the mentor's depth
  // calibration (ADR-013 §11 G5) requires deep when a domain reads reflexive. A deep
  // consult that cannot complete inside the hook budget fails OPEN-HONEST (UNFRAMED
  // logged — never a silent downgrade to a shallower examination than required).
  if (!allowStrict) cfg.failMode = "open"; // SubagentStart can't block ⇒ strict is impossible; force open.
  else if (cfg.failMode !== "strict") cfg.failMode = "open";
  return cfg;
}

export function parseBool(v, dflt) {
  if (v === undefined || v === null || v === "") return dflt;
  if (typeof v === "boolean") return v;
  return String(v).toLowerCase() === "true" || String(v) === "1";
}

// captureProvenance precedence (founder election #2, 2026-06-22): an explicit env flag wins; else a
// config-file value; else DERIVE from the write-path presence (ON only when BOTH a non-marker accred
// credential AND a K1-canonical agent_id are set — the operator has provisioned the write path).
// PURE. The dark dogfood sets neither ⇒ derive false ⇒ H1/H2 byte-identical.
export function deriveCaptureProvenance(envFlag, fileFlag, accredCredential, agentId) {
  // .trim() the env flag's empty-test so a whitespace-only GATE1_PROVENANCE_ENABLED (=" ") falls
  // through to file/derive instead of being read as an explicit false (review NIT, byte-identity).
  if (envFlag !== undefined && envFlag !== null && String(envFlag).trim() !== "") return parseBool(envFlag, false);
  if (fileFlag !== undefined && fileFlag !== null) return parseBool(fileFlag, false);
  return !!accredCredential && !!agentId;
}

// Derive a sibling API endpoint from the reason endpoint: …/api/reason → …/api/<name>. Falls back
// to a localhost default if the base does not contain /api/reason. Pure string op; never throws.
export function deriveSibling(reasonEndpoint, name) {
  const base = String(reasonEndpoint || "");
  if (base.includes("/api/reason")) return base.replace("/api/reason", `/api/${name}`);
  return `http://localhost:3000/api/${name}`;
}

// Parse a comma/newline-separated env override into a string list, or null if unset/empty.
export function parsePatternList(v) {
  if (typeof v !== "string" || v.trim() === "") return null;
  const out = v
    .split(/[\n,]/)
    .map((s) => s.trim())
    .filter(Boolean);
  return out.length ? out : null;
}

// The default irreversible-action regex source strings (D-A). Conservative + narrow: each names a
// destructive or hard-to-undo operation where the safe error is to OVER-block. Matched case-
// insensitively against the Bash command text. Tunable via GATE1_IRREVERSIBLE_PATTERNS / config.
//
// IMPORTANT (Slice-5a review fix): flags are matched ORDER-INDEPENDENTLY via lookaheads, and a
// `--flag` alternative is NEVER anchored with a leading `\b` (a `\b` cannot match before a `-`, so
// `\b--prod` is a DEAD alternative — the bug that let `vercel --prod` slip past). Add a guard-leg
// fixture to the negative battery for any new destructive form so coverage stays locked.
export const DEFAULT_IRREVERSIBLE_PATTERNS = [
  // rm recursive+force in ANY flag order/form: rm -rf, -fr, -r -f, -f -r, --recursive --force,
  // mixed (-r --force). Two lookaheads require BOTH a recursive flag and a force flag anywhere.
  "\\brm\\b(?=.*(?:-[a-z]*r|--recursive))(?=.*(?:-[a-z]*f|--force))",
  "\\bdrop\\s+(table|database|schema|index)\\b",
  "\\bdelete\\s+from\\b",
  // S1 broadening (build-plan §3.1) — destructive forms the original set MISSED because they carry
  // no -rf: `find … -delete`, `find … -exec rm …`, and `… | xargs rm` (the recursive+force `rm`
  // lookaheads above don't fire on a bare `rm` reached via xargs/-exec). `git push --force` is
  // already covered by the git-push pattern below; redirection-overwrite to a real path is handled
  // structurally in at-action-hook.isGuardAction (hasOverwriteRedirect), not as a fragile regex.
  "\\bfind\\b.*\\s-delete\\b",
  "\\bfind\\b.*-exec\\b.*\\brm\\b",
  "\\bxargs\\b.*\\brm\\b",
  // truncate WITH or WITHOUT the literal 'table' (valid destructive SQL in several dialects).
  "\\btruncate\\s+(table\\s+)?[\"`\\w]",
  // git force-push: --force / --force-with-lease / -f / the `+<ref>` refspec form (git push origin +main).
  "git\\s+push\\b.*(--force|-f\\b|\\s\\+[\\w/.])",
  "git\\s+reset\\s+--hard\\b",
  "git\\s+clean\\s+-[a-z]*f",
  // vercel destructive/deploy — `--prod` is anchored with a TRAILING \\b only (no leading \\b).
  "\\bvercel\\b.*(\\bdeploy\\b|--prod\\b|\\brm\\b|\\bremove\\b)",
  "\\bnetlify\\b.*\\bdeploy\\b",
  "supabase\\s+db\\s+(push|reset)\\b",
  "\\bkubectl\\s+delete\\b",
  "\\bterraform\\s+(apply|destroy)\\b",
  "\\bdocker\\s+(rm|rmi|system\\s+prune)\\b",
  "\\bmkfs\\b",
  "\\bdd\\s+if=",
  ">\\s*/dev/sd",
  "\\b(shutdown|reboot|halt)\\b",
];

// Compile the irreversible patterns once; an invalid regex is skipped (never crashes the hook).
export function compileIrreversible(patterns) {
  const out = [];
  for (const p of patterns || []) {
    try {
      out.push(new RegExp(p, "i"));
    } catch {
      /* skip a malformed pattern */
    }
  }
  return out;
}

// ---------------------------------------------------------------------------
// S1 TARGETING helpers (build-plan §3.1) — the "denylist-AND-NOT-destructive" classifier the
// at-action hook uses to (a) keep the over-fire offenders (`date`/`ls`/`wc`) off the consult floor
// and (b) feed the broadened guard. PURE; never throw. The guiding rule (§3.1): a command is only
// HOUSEKEEPING (safe to silently allow, never auto-consult) if a read-only verb leads EVERY segment
// AND no destructive token is present — `find … -delete`, `grep … | xargs rm`, `cmd > prod.db` all
// start with read-only verbs but are destructive, so a verb-prefix match alone would wrongly suppress.
// ---------------------------------------------------------------------------

// Unambiguously read-only / metadata verbs. Deliberately CONSERVATIVE: anything not here is treated
// as non-housekeeping (consults under the GATE1_CONSULT_BASH opt-in; silently allowed by default).
// Ambiguous tools that can mutate in-place (sed -i, awk, tee, mv, npm, make, python …) are OMITTED.
export const READ_ONLY_VERBS = new Set([
  "date", "ls", "pwd", "echo", "cat", "head", "tail", "wc", "grep", "egrep", "fgrep", "rg", "ag",
  "which", "whoami", "id", "env", "printenv", "stat", "file", "du", "df", "ps", "uname", "hostname",
  "uptime", "basename", "dirname", "realpath", "readlink", "sort", "uniq", "cut", "column", "type",
  "command", "history", "sleep", "seq", "printf", "true", "false", "test", "diff", "cmp", "wait",
]);

// Read-only `git` subcommands (git is a two-token verb; `git push`/`reset --hard`/`clean -f` are not).
// `reflog`/`symbolic-ref` are EXCLUDED — they mutate via sub-subcommands (`reflog expire/delete`,
// `symbolic-ref HEAD <ref>`) with no flag the mutating-flag guard below would catch. `branch`/`tag`
// stay but are housekeeping ONLY without a mutating flag (review HIGH: `git branch -D` deletes a ref).
export const GIT_READONLY_SUBCMDS = new Set([
  "status", "log", "diff", "show", "branch", "tag", "rev-parse", "describe", "blame", "ls-files",
  "ls-tree", "shortlog", "cat-file", "rev-list", "whatchanged", "name-rev",
]);
// A git flag that turns a read-only subcommand mutating (delete/rename/copy/prune/force/edit a ref).
const GIT_MUTATING_FLAG_RE = /(?:^|\s)(?:-d|-D|--delete|-m|-M|--move|-c|-C|--copy|--prune|--edit|-f|--force)\b/;

// An overwrite-redirect to a REAL path (clobbers the target ⇒ destructive, build-plan §3.1). Matches
// `>`, the explicit-stdout `1>`, and the noclobber-override `>|` (review MEDIUM); EXCLUDES `>>`
// (append), `>&`/`&>` (fd duplication), fd≥2 prefixes (`2>file` = stderr log), and the /dev sinks.
const OVERWRITE_REDIRECT_RE =
  /(?<![<>&\d])(?:1>|>\||>)(?![>&|])\s*(?!\/dev\/(?:null|stdout|stderr)\b)[\w./~$@+-]/;
export function hasOverwriteRedirect(cmd) {
  try {
    // Neutralise contexts where a `>` is NOT a redirect, so it does not route benign Bash to the guard
    // (review HIGH/LOW false-positive: `echo "a > b"`, `[ $a \> $b ]`, `$((x>y))`). Quoted strings are
    // replaced with a WORD-CHAR placeholder (not a space) so a quoted redirect TARGET is preserved —
    // `echo x > "out.txt"` ⇒ `echo x > Q` still matches (guarded), while `echo "a>b"` ⇒ `echo Q` does
    // not. $((…)) arithmetic and [ … ]/[[ … ]] test bodies (where `>` is a comparison) are blanked.
    let c = String(cmd == null ? "" : cmd)
      .replace(/'[^']*'/g, "Q")
      .replace(/"[^"]*"/g, "Q")
      .replace(/\$\(\([^)]*\)\)/g, " ")
      .replace(/\[\[[^\]]*\]\]/g, " ")
      .replace(/\[[^\]]*\]/g, " ");
    return OVERWRITE_REDIRECT_RE.test(c);
  } catch {
    return false; // a RegExp engine without lookbehind ⇒ treat as no-redirect (the guard's other patterns still fire)
  }
}

// A destructive token anywhere in the command (the §3.1 set) OR an overwrite-redirect. PURE.
const DESTRUCTIVE_TOKEN_RE = /(?:\brm\b|--?delete\b|-exec\b|\bxargs\b|\bdd\b|:>|\bmkfs\b|\bshred\b)/i;
export function hasDestructiveToken(cmd) {
  const c = String(cmd == null ? "" : cmd);
  return DESTRUCTIVE_TOKEN_RE.test(c) || hasOverwriteRedirect(c);
}

// True iff EVERY pipeline/sequence segment leads with a read-only verb (and the command carries no
// destructive token). A `VAR=val` prefix is skipped; a leading `sudo` ⇒ never housekeeping. PURE.
export function isHousekeeping(cmd) {
  const c = String(cmd == null ? "" : cmd).trim();
  if (!c) return false;
  if (hasDestructiveToken(c)) return false; // read-only verb but destructive ⇒ NOT housekeeping
  const segments = c.split(/(?:\|\||&&|;|\||\n)/).map((s) => s.trim()).filter(Boolean);
  if (segments.length === 0) return false;
  return segments.every(isReadOnlySegment);
}
function isReadOnlySegment(seg) {
  const tokens = seg.split(/\s+/).filter(Boolean);
  let i = 0;
  while (i < tokens.length && /^[A-Za-z_][A-Za-z0-9_]*=/.test(tokens[i])) i++; // skip VAR=val prefixes
  const verb = tokens[i];
  if (!verb || verb === "sudo") return false; // sudo (or an empty segment) ⇒ not housekeeping
  if (verb === "git") {
    // read-only subcommand AND no mutating flag (so `git branch -D foo` / `git tag -d` are NOT housekeeping).
    return GIT_READONLY_SUBCMDS.has(tokens[i + 1] || "") && !GIT_MUTATING_FLAG_RE.test(seg);
  }
  return READ_ONLY_VERBS.has(verb);
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

// Extract the SIGNED assessment envelope ({ assessment, signature, key_id }) for D-D provenance.
// Present only when the deployment signs Layer-2 (production); an unsigned deployment (verdict
// directly at `assessment`, no signature/key_id) returns null and contributes no provenance —
// H4 then honestly writes no accreditation (R18f needs a verifiable assessment). Never throws.
export function extractSignedAssessment(body) {
  const a = body?.assessment;
  if (
    a &&
    typeof a === "object" &&
    typeof a.signature === "string" &&
    a.signature.length > 0 &&
    typeof a.key_id === "string" &&
    a.key_id.length > 0 &&
    a.assessment &&
    typeof a.assessment === "object"
  ) {
    return { assessment: a.assessment, signature: a.signature, key_id: a.key_id };
  }
  return null;
}

// ---------------------------------------------------------------------------
// The framing fetch. Returns { ok:true, verdict } or { ok:false, reason }.
// Never throws — every failure is a structured reason routed through the fail handler.
// ---------------------------------------------------------------------------
export async function fetchFrame(cfg, task, opts = {}) {
  // opts (all optional; H1/H2 pass none → byte-identical request):
  //   depth         — override cfg.depth (H3's same-depth loop carry D-B + the S9b G5
  //                   trust-calibrated depth; 'deep' is REACHABLE — the ADR-011 D3
  //                   clamp is removed per ADR-013 §11 G5, election E1 2026-07-12).
  //   priorFeedback — the SDK PriorFeedback block for a re-examination (the iterate step, D-B).
  //   context       — extra situational context string.
  const depth = typeof opts.depth === "string" ? opts.depth : cfg.depth;
  // S9b (F-S9 register item 4 + the H1 http-400 observed live at S9b open): the server
  // caps `input` at 5000 chars (TEXT_LIMITS.medium) — an over-long task drew an honest
  // 400 and the frame was lost entirely. Truncate HEAD-anchored with a loud marker:
  // a truncated frame examines the task's opening statement; an untruncated over-long
  // POST examines nothing.
  const reqBody = { input: truncateForServer(task), depth, response_format: "assessment_first" };
  if (typeof opts.context === "string" && opts.context) reqBody.context = opts.context;
  if (opts.priorFeedback && typeof opts.priorFeedback === "object") reqBody.prior_feedback = opts.priorFeedback;
  let res;
  try {
    res = await fetch(cfg.endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${cfg.credential}` },
      body: JSON.stringify(reqBody),
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
  // `signed` is ADDITIVE (D-D provenance): the signed envelope when the deployment signs Layer-2,
  // else null. H1/H2 ignore it; H3 + the shared provenance step use it. `body` is returned too so
  // callers (H3) can read response-level fields (e.g. examination_open) without a second parse.
  return { ok: true, verdict, signed: extractSignedAssessment(body), body };
}

// ---------------------------------------------------------------------------
// The guardrail fetch (H3's guard role, ADR-011 D-A). Sibling of fetchFrame: POSTs an action to
// /api/guardrail and returns the gate verdict. Never throws — every failure is a structured reason.
// The response is the standard envelope ({ result, meta }); the gate fields live on `.result`.
// ---------------------------------------------------------------------------
export async function fetchGuardrail(cfg, action, { context, riskClass } = {}) {
  let res;
  try {
    res = await fetch(cfg.guardEndpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${cfg.credential}` },
      body: JSON.stringify({
        // S9b: cap at the server's 5000-char action limit (the S9 register-item-4
        // class: an over-long heredoc drew http 400 ⇒ unguarded-honest; a truncated
        // action is guarded on its operative opening instead).
        action: truncateForServer(action),
        ...(context ? { context } : {}),
        ...(riskClass ? { risk_class: riskClass } : {}),
      }),
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
  // The gate fields sit on `.result` (buildEnvelope shape); be defensive if a deployment returns
  // them flat. We never invent a verdict — an unrecognised shape is a structured failure.
  const result = body && typeof body === "object" && body.result && typeof body.result === "object" ? body.result : body;
  if (!result || typeof result !== "object" || typeof result.recommendation !== "string") {
    return { ok: false, reason: "no guardrail verdict in response" };
  }
  return {
    ok: true,
    recommendation: result.recommendation, // proceed | proceed_with_caution | pause_for_review | do_not_proceed
    proceed: result.proceed === true,
    proximity: result.katorthoma_proximity ?? null,
    reasoning: typeof result.reasoning === "string" ? result.reasoning : "",
    improvementHint: typeof result.improvement_hint === "string" ? result.improvement_hint : "",
    // P8a (2026-08-17) — ADDITIVE. Until now this function flattened the verdict to
    // five payload fields and threw away everything the kathekon predicate needs,
    // which is why the guard path could write no classifiable record (register P5:
    // "the genuinely dangerous actions are on the guard path, which writes no
    // record"). The gap was purely CLIENT-SIDE: since the ADR-010 §3 bridge
    // retirement the live /api/guardrail response already carries all of this
    // (route.ts builds is_kathekon, kathekon_quality, extraction and the signed
    // assessment). `fetchFrame` already returns its full body; this is the same
    // move for the guard.
    //
    // Defensive by default: every field is optional on the wire, so a deployment
    // that omits one yields null rather than throwing. NOTHING existing reads
    // these — the five fields above are untouched and byte-identical, so the
    // guard's own decision path cannot be affected by this addition.
    isKathekon: typeof result.is_kathekon === "boolean" ? result.is_kathekon : null,
    kathekonQuality: typeof result.kathekon_quality === "string" ? result.kathekon_quality : null,
    extraction: result.extraction && typeof result.extraction === "object" ? result.extraction : null,
    signed: extractSignedAssessment(body),
    assessment: extractGuardrailAssessment(body),
  };
}

/**
 * The Layer2Assessment out of a guardrail response, or null. The guard signs its
 * verdict (`signed_assessment.assessment`), but a signing outage still returns a
 * bare `assessment` — read both, prefer the signed one. Never invents a shape: an
 * unrecognised body yields null and the caller records "no assessment" honestly
 * rather than a fabricated clean reading.
 */
export function extractGuardrailAssessment(body) {
  if (!body || typeof body !== "object") return null;
  const signed = body.signed_assessment;
  if (signed && typeof signed === "object" && signed.assessment && typeof signed.assessment === "object") {
    return signed.assessment;
  }
  const result = body.result && typeof body.result === "object" ? body.result : body;
  if (result && typeof result === "object") {
    const sa = result.signed_assessment;
    if (sa && typeof sa === "object" && sa.assessment && typeof sa.assessment === "object") return sa.assessment;
    if (result.assessment && typeof result.assessment === "object") {
      const a = result.assessment;
      return a.assessment && typeof a.assessment === "object" ? a.assessment : a;
    }
  }
  return null;
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
export async function runFraming(cfg, { sessionKey, task, logLabel = "FRAMED", emit, preface = "" }) {
  // `preface` (S9b G1a, additive — H1/H2 pass none ⇒ byte-identical): a calling-
  // stage block prepended to the injected frame (the declared-purpose orientation
  // or the purposeless-session elicitation). ADVISE channel; clipped with the
  // frame by emitContext's MAX_CONTEXT_CHARS.
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

  // D-D provenance (flag-gated; GATE1_PROVENANCE_ENABLED default off ⇒ H1/H2 byte-identical, no
  // file written). Append THIS consult's SIGNED assessment to the session provenance log so H4's
  // close-time accreditation write can carry it (R18f — no credential without examination). Keyed
  // on sessionKey, which is the real session_id for the top-level hook (H4 reads by session_id);
  // a subagent's provenance keys under its sub-<hash> (a documented secondary-coverage limit). This
  // is a side-effect-only append — it never touches stdout/exit/marker/frame, and never throws.
  if (cfg.captureProvenance && r.signed) appendProvenance(cfg, sessionKey, r.signed);

  // Inject the frame: default = additionalContext (UserPromptSubmit); subagent hook passes its own
  // emit (updatedInput.prompt prepend). Neither exits — the shared tail writes the marker + exits 0.
  if (emit) emit(cfg, r.verdict);
  else emitContext(cfg, (preface ? preface + "\n" : "") + renderFrame(r.verdict));

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
