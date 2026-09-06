/**
 * schema-redaction.test.mjs — the S9 harness-side A11b redaction (mentor Part 4,
 * 2026-09-05; built 2026-09-06).
 *
 * Run:  node harness/gate1-pre-decision/test/schema-redaction.test.mjs
 * Exit: 0 if every assertion passes, 1 otherwise.
 *
 * THE LOAD-BEARING PIN IS DIV-1. The harness cannot import the TypeScript
 * defence module, so its token list is hard-coded — and this project has been
 * bitten repeatedly by hand-copied constants going stale (perimeter counts,
 * agent-card extension counts, the PR range). The lesson learned each time is
 * that an executing check beats a written instruction. DIV-1 re-reads the real
 * `injection-defence.ts` source and asserts the harness's pattern is
 * byte-identical to the defence's, so the day the defence's list changes this
 * battery goes RED instead of the harness silently under-redacting.
 *
 * DIV-1 anchors on the ENTRY (`name: 'schema_field_injection', pattern: /…/i`),
 * NOT on the first textual occurrence of the name — the first occurrence is in
 * a doc comment several lines above, and anchoring there extracts the WRONG
 * pattern (caught in-build, 2026-09-06: the first cut compared against
 * instruction_override and reported a false divergence).
 */
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import {
  redactSchemaFields,
  redactOptional,
  SCHEMA_FIELD_PLACEHOLDER,
  SCHEMA_FIELD_PATTERN_SOURCE,
} from "../claude-code/hooks/lib/schema-redaction.mjs";

let pass = 0;
let fail = 0;
const ok = (name, cond, hint) => {
  if (cond) { console.log(`PASS — ${name}`); pass++; }
  else { console.log(`FAIL — ${name}${hint ? `: ${hint}` : ""}`); fail++; }
};

const DEFENCE_TS = fileURLToPath(
  new URL("../../../website/src/lib/translation-sandwich/injection-defence.ts", import.meta.url)
);
const defenceSrc = readFileSync(DEFENCE_TS, "utf8");
const ENTRY_RE = /name:\s*["']schema_field_injection["']\s*,\s*pattern:\s*\/([\s\S]*?)\/i\s*,/;

// ---------------------------------------------------------------------------
// DIV-* — the divergence gate
// ---------------------------------------------------------------------------
{
  const entries = defenceSrc.match(new RegExp(ENTRY_RE.source, "g")) || [];
  ok("DIV-0 the defence source declares exactly ONE schema_field_injection entry (so DIV-1 is anchored unambiguously)",
    entries.length === 1, `entries=${entries.length}`);
  const m = ENTRY_RE.exec(defenceSrc);
  ok("DIV-1 the harness's token pattern is BYTE-IDENTICAL to the defence's schema_field_injection pattern — if this goes red, the defence's list moved and the harness must be updated in the same change, not later",
    !!m && m[1] === SCHEMA_FIELD_PATTERN_SOURCE,
    m ? `\n  defence: ${JSON.stringify(m[1])}\n  harness: ${JSON.stringify(SCHEMA_FIELD_PATTERN_SOURCE)}` : "entry not found");
  ok("DIV-2 non-vacuity: the extractor really did find a non-trivial pattern (not an empty capture that would make DIV-1 pass on a broken read)",
    !!m && m[1].length > 60 && m[1].includes("distress_detected"), m ? `len=${m[1].length}` : "no match");
}

// ---------------------------------------------------------------------------
// TOK-* — every token in the defence's list is actually redacted
// ---------------------------------------------------------------------------
{
  // Derived from the defence's own alternation, not retyped: the literal
  // alternatives, plus the one non-literal form spelled out.
  const inner = /\\b\((.*?)\)\\b/.exec(SCHEMA_FIELD_PATTERN_SOURCE);
  const alts = inner ? inner[1].split("|") : [];
  ok("TOK-0 the pattern's alternation parsed into the expected 9 alternatives",
    alts.length === 9, `alts=${alts.length}`);
  const literals = alts.filter((a) => !a.includes("\\s"));
  ok("TOK-1 every LITERAL token in the defence's list is redacted, one placeholder each",
    literals.every((t) => {
      const r = redactSchemaFields(`prefix ${t} suffix`);
      return r.count === 1 && r.text === `prefix ${SCHEMA_FIELD_PLACEHOLDER} suffix`;
    }),
    `literals=${literals.length}`);
  ok("TOK-2 the non-literal `severity: none` form is redacted in each of its shapes",
    ["severity: none", "severity:none", "severity = none", 'severity: "none"', "severity: 'none'"].every(
      (t) => redactSchemaFields(t).count === 1
    ));
  ok("TOK-3 matching is case-insensitive, as the defence's /i is",
    redactSchemaFields("DISTRESS_DETECTED and Is_Kathekon").count === 2);
  ok("TOK-4 the count is the number of replacements, not of distinct tokens",
    redactSchemaFields("is_kathekon is_kathekon is_kathekon").count === 3);
}

// ---------------------------------------------------------------------------
// ID-* — everything else is left alone
// ---------------------------------------------------------------------------
{
  const plain = "Moved the maximum-length guard after the distress check on eleven routes.";
  ok("ID-1 token-free text is returned BYTE-IDENTICAL with a zero count (the redaction is the ONLY transformation this module performs)",
    redactSchemaFields(plain).text === plain && redactSchemaFields(plain).count === 0);
  ok("ID-2 a non-string is total: empty string, zero count, never a throw",
    ["", null, undefined, 42, {}, []].every((v) => {
      const r = redactSchemaFields(v);
      return typeof r.text === "string" && r.count === 0;
    }));
  ok("ID-3 a token split by an earlier truncation is deliberately left alone — a fragment is not a defence match either, so it cannot fail the call closed",
    redactSchemaFields("…the field distress_det").count === 0);
  ok("ID-4 a token embedded in a longer identifier is NOT redacted, matching the defence's own \\b anchoring (no over-redaction)",
    redactSchemaFields("my_is_kathekon_helper").count === 0 &&
      redactSchemaFields("xdistress_detectedx").count === 0);
  ok("ID-5 redactOptional yields undefined for absent/empty input so a caller can spread it without inventing a key",
    redactOptional(undefined).text === undefined && redactOptional("").text === undefined &&
      redactOptional("is_kathekon").text === SCHEMA_FIELD_PLACEHOLDER);
}

// ---------------------------------------------------------------------------
// PH-* — the placeholder must not itself trip the defence
// ---------------------------------------------------------------------------
{
  // Every pattern category, read from the defence source rather than retyped.
  const cats = [...defenceSrc.matchAll(/name:\s*["']([a-z_]+)["']\s*,\s*pattern:\s*\/([\s\S]*?)\/i\s*,/g)];
  // DERIVED, never hard-coded: count the `name:` entries inside the
  // PATTERN_CATEGORIES array and require the parse to have found all of them.
  // The first cut of this pin asserted a literal `=== 5` and went RED at 6 —
  // `role_reassignment` had been missed. A count written by hand is a count
  // that goes stale; that is the whole lesson of this file's DIV-1.
  const arr = /const PATTERN_CATEGORIES[\s\S]*?\n\]/.exec(defenceSrc);
  const declared = arr ? (arr[0].match(/name:\s*["'][a-z_]+["']/g) || []).length : -1;
  ok("PH-0 EVERY pattern category declared in PATTERN_CATEGORIES was parsed for PH-1 (count derived from the defence source, never written by hand — so a new category is covered automatically and a parse failure goes red)",
    declared > 0 && cats.length === declared, `parsed=${cats.length} declared=${declared}`);
  const redactedSentence =
    `The ${SCHEMA_FIELD_PLACEHOLDER} field runs before the ${SCHEMA_FIELD_PLACEHOLDER} check.`;
  ok("PH-1 the placeholder — and a sentence full of placeholders — trips NONE of the defence's categories. A redaction that re-triggered the defence would be worse than no redaction at all",
    cats.every(([, , src]) => {
      const re = new RegExp(src, "i");
      return !re.test(SCHEMA_FIELD_PLACEHOLDER) && !re.test(redactedSentence);
    }));
  ok("PH-2 the placeholder names its category, so a reader of the examined text knows what was replaced (never a silent deletion)",
    SCHEMA_FIELD_PLACEHOLDER.includes("schema-field") && SCHEMA_FIELD_PLACEHOLDER !== "");
  ok("PH-3 END-TO-END: a realistic substrate-session action that the defence WOULD have rejected is clean after redaction",
    (() => {
      const action = "Move the distress_detected guard so shouldRedirect fires before is_kathekon is read.";
      const before = cats.some(([, , src]) => new RegExp(src, "i").test(action));
      const after = cats.some(([, , src]) => new RegExp(src, "i").test(redactSchemaFields(action).text));
      return before === true && after === false;
    })(),
    "the whole point: rejected before, clean after");
}

// ---------------------------------------------------------------------------
// WIRE-* — the three examined surfaces call it; the signed surfaces do NOT
// ---------------------------------------------------------------------------
{
  const read = (rel) => readFileSync(fileURLToPath(new URL(rel, import.meta.url)), "utf8");
  const framing = read("../claude-code/hooks/lib/framing-core.mjs");
  const subagent = read("../claude-code/hooks/subagent-framing-hook.mjs");
  const close = read("../claude-code/hooks/close-hook.mjs");
  const handback = read("../claude-code/hooks/handback-hook.mjs");

  ok("WIRE-1 fetchFrame redacts the consult `input` AFTER truncateForServer, and sends the redacted text",
    /const redactedInput = redactSchemaFields\(truncateForServer\(task\)\)/.test(framing) &&
      /input: redactedInput\.text/.test(framing) &&
      !/input: truncateForServer\(task\)/.test(framing));
  ok("WIRE-2 fetchGuardrail redacts the `action` AFTER truncateForServer, and sends the redacted text",
    /const redactedAction = redactSchemaFields\(truncateForServer\(action\)\)/.test(framing) &&
      /action: redactedAction\.text/.test(framing) &&
      !/action: truncateForServer\(action\)/.test(framing));
  ok("WIRE-3 both consult and guard redact their optional `context` too (Layer-1 extracts the context fields as well — layer1-extractor.ts:2110 — so an unredacted context fails the call closed exactly as an unredacted input would), and each sends the redacted value",
    /const redactedContext =[\s\S]{0,120}redactSchemaFields\(opts\.context\)/.test(framing) &&
      /reqBody\.context = redactedContext\.text/.test(framing) &&
      /const redactedGuardContext =[\s\S]{0,120}redactSchemaFields\(context\)/.test(framing) &&
      /context: redactedGuardContext\.text/.test(framing));
  ok("WIRE-4 the spawn trace is redacted after readTranscriptTail and the redacted value is what reaches buildSpawnPayload",
    /const redactedTrace = redactSchemaFields\(rawTrace\)/.test(subagent) &&
      /const trace = redactedTrace\.text/.test(subagent));
  // WIRE-5 — MUTATION FOLD (2026-09-06, in-build): the first cut asserted
  // `(framing.match(/redactions/g)||[]).length >= 12`, a THRESHOLD where the
  // real property is UNIVERSAL — dropping the count from one failure path left
  // 12+ occurrences and the pin stayed green. The property is "every return
  // carries it", so the pin now brace-matches each function body and checks
  // every `return {` object literal individually.
  // NOTE (in-build fix, 2026-09-06): the body brace is NOT simply the first `{`
  // after the name — both signatures destructure with a default (`opts = {}`,
  // `{ context, riskClass } = {}`), so the first brace belongs to the parameter
  // list. Close the parameter list by paren-matching FIRST, then take the body.
  // The first cut of this pin skipped that and went red on correct code.
  const fnBody = (src, name) => {
    const at = src.indexOf(`export async function ${name}(`);
    if (at < 0) return null;
    const lparen = src.indexOf("(", at);
    let pd = 0, rparen = -1;
    for (let i = lparen; i < src.length; i++) {
      if (src[i] === "(") pd++;
      else if (src[i] === ")") { pd--; if (pd === 0) { rparen = i; break; } }
    }
    if (rparen === -1) return null;
    const open = src.indexOf("{", rparen);
    if (open === -1) return null;
    let depth = 0;
    for (let i = open; i < src.length; i++) {
      if (src[i] === "{") depth++;
      else if (src[i] === "}") { depth--; if (depth === 0) return src.slice(open, i + 1); }
    }
    return null;
  };
  const everyObjectReturnCarries = (body, token) => {
    if (!body) return { ok: false, total: 0, missing: -1 };
    let total = 0, missing = 0;
    for (let i = body.indexOf("return {"); i !== -1; i = body.indexOf("return {", i + 1)) {
      const open = body.indexOf("{", i);
      let depth = 0, end = -1;
      for (let j = open; j < body.length; j++) {
        if (body[j] === "{") depth++;
        else if (body[j] === "}") { depth--; if (depth === 0) { end = j; break; } }
      }
      if (end === -1) return { ok: false, total, missing: -1 };
      total++;
      if (!body.slice(open, end + 1).includes(token)) missing++;
    }
    return { ok: total > 0 && missing === 0, total, missing };
  };
  const frameR = everyObjectReturnCarries(fnBody(framing, "fetchFrame"), "redactions");
  const guardR = everyObjectReturnCarries(fnBody(framing, "fetchGuardrail"), "redactions");
  ok("WIRE-5 EVERY object return of fetchFrame and fetchGuardrail carries the count — brace-matched per return, not a threshold — so a FAILED call still reports whether tokens were present, which is the diagnostic that distinguishes this cause from a real outage",
    frameR.ok && guardR.ok && frameR.total >= 4 && guardR.total >= 4,
    `fetchFrame: ${frameR.total} returns, ${frameR.missing} missing; fetchGuardrail: ${guardR.total} returns, ${guardR.missing} missing`);
  ok("WIRE-6 the count is logged on the framing, consult-outage, guard and discernment lines (mentor Part 4: 'the redaction is logged so a future reader knows what was replaced')",
    /redacted=\$\{r\.redactions\}/.test(framing) &&
      /redacted=\$\{r\.redactions\}/.test(read("../claude-code/hooks/at-action-hook.mjs")) &&
      /redacted=\$\{redactedTrace\.count\}/.test(subagent));
  ok("WIRE-7 SCOPE FENCE: the accreditation write and the hand-back do NOT redact. Both carry SERVER-SIGNED assessment envelopes whose fields legitimately include these identifiers — redacting them would corrupt the signed bytes and break verification — and neither route runs Layer-1 extraction, so the defence never sees them",
    !/redactSchemaFields/.test(close) && !/redactSchemaFields/.test(handback));
}

console.log(`\nschema-redaction: ${pass} passed, ${fail} failed`);
process.exit(fail > 0 ? 1 : 0);
