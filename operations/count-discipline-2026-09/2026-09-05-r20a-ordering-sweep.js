#!/usr/bin/env node
// 2026-09-05 — R20a perimeter-ordering audit: the MECHANICAL CHECK (rev 2, post-review).
//
// This is NOT the audit's method. The audit's method is a manual control-flow
// trace of every write handler from its first statement to its distress check
// and on to the redirect return
// (operations/count-discipline-2026-09/2026-09-05-r20a-perimeter-ordering-AUDIT.md
// §1). This script re-derives, from the TypeScript AST with comments AND string
// contents blanked, which bounding forms sit textually before the check inside
// each handler body, follows EVERY same-file function called before the check
// one level (by AST function body), prints the IMPORTED calls made before the
// check so the hand-follow list is visible rather than assumed, scans the
// window between the check and the first redirect marker (a guard there would
// run after the check but before the person is answered — the second bypass
// the PR19 reviewers demonstrated on the `format` move), and prints the known
// case so the sweep can be shown non-vacuous. Where it and the trace disagree,
// the trace governs and the disagreement is recorded in the audit (§1.6).
//
// Revision history (all 2026-09-05): rev 0 brace-matched a return-type literal
// instead of the body; rev 1 used the TypeScript scanner and left a `//` line
// inside a template-adjacent region un-blanked; rev 1 also (a) left string
// contents visible, so a check name inside a string literal counted as a call
// and error-message templates naming a limit constant counted as bounds,
// (b) followed only helpers whose names matched parse*/validate*/readJsonBody,
// (c) did not scan the check→redirect window. Rev 2 fixes all three (found by
// the three blind reviewers of the audit).
//
// What it still cannot see (disclosed in the audit §1.8): imported validators'
// bodies (it prints their names; the trace reads them); code inside `${…}` of
// a template literal (blanked with the string — verified at HEAD a014620 to
// hide 0 real bounds); a quote character inside a regex literal (treated as a
// string opener); handlers not declared as `export async function POST` (none
// exist at HEAD — grep-verified by the method reviewer); platform limits; flag
// values.
//
// Usage (from the repo root):
//   node operations/count-discipline-2026-09/2026-09-05-r20a-ordering-sweep.js website
// Membership is re-derived from the registry test file on every run — never quoted.
const fs = require('fs'), path = require('path');
const ROOT = path.resolve(process.argv[2] || 'website');
const ts = require(path.join(ROOT, 'node_modules', 'typescript'));
const REG = path.join(ROOT, 'src/lib/__tests__/r20a-invocation-guard.test.ts');
const regSrc = fs.readFileSync(REG, 'utf8');
function arrayEntries(name, re) {
  const start = regSrc.indexOf(`const ${name}`); if (start < 0) throw new Error('no ' + name);
  const end = regSrc.indexOf('\n]', start);
  const body = regSrc.slice(start, end); const out = []; let m;
  while ((m = re.exec(body))) out.push(m[1]); return out;
}
const routeLevel = arrayEntries('HUMAN_FACING_POST_ROUTES', /^\s*'(src\/app\/api\/[^']+)'/gm);
const substrateGate = arrayEntries('SUBSTRATE_GATE_ROUTES', /route:\s*'(src\/app\/api\/[^']+)'/g);
const flagPairs = arrayEntries('FLAG_GATED_ROUTE_LEVEL_ROUTES', /route:\s*'(src\/app\/api\/[^']+)'/g);
console.log(`MEMBERSHIP (re-derived from ${path.relative(process.cwd(), REG)}): route-level=${routeLevel.length} substrate-gate=${substrateGate.length} flag-pair-entries=${flagPairs.length} flag-gated-routes=${new Set(flagPairs).size} unconditional=${routeLevel.length - new Set(flagPairs).size}`);
// Blank comments AND string contents to spaces (length-preserving) so AST
// offsets and regex offsets agree, and so neither a comment nor a string can
// be mistaken for code. Quote characters are kept; only the contents go.
function blank(src) {
  const out = src.split(''); let i = 0; const n = src.length;
  while (i < n) {
    const c = src[i], d = src[i + 1];
    if (c === '/' && d === '/') { while (i < n && src[i] !== '\n') { out[i] = ' '; i++; } continue; }
    if (c === '/' && d === '*') { out[i] = ' '; out[i + 1] = ' '; i += 2; while (i < n && !(src[i] === '*' && src[i + 1] === '/')) { if (src[i] !== '\n') out[i] = ' '; i++; } if (i < n) { out[i] = ' '; out[i + 1] = ' '; } i += 2; continue; }
    if (c === '"' || c === "'" || c === '`') { const q = c; i++; while (i < n && src[i] !== q) { if (src[i] === '\\') { out[i] = ' '; if (src[i + 1] !== '\n') out[i + 1] = ' '; i += 2; continue; } if (src[i] !== '\n') out[i] = ' '; i++; } i++; continue; }
    i++;
  }
  return out.join('');
}
const lineOf = (code, idx) => code.slice(0, idx).split('\n').length;
const CHECK = /\b(enforceDistressCheck|enforceLayer2R20aGate|runStoaDistressGate)\s*\(/g;
// The redirect marker: the point at which the person is answered.
const REDIRECT = /renderR20aRedirectResponse\s*\(|distress_detected\s*:|return\s+\w+\.redirect\b/g;
const BOUNDS = [
  ['validateTextLength', /validateTextLength\s*\(/g],
  ['TEXT_LIMITS', /TEXT_LIMITS\.\w+/g],
  ['length-cmp', /\.length\s*(?:>=|<=|>|<)\s*(?!=)/g],
  ['length-eq', /\.length\s*(?:===|!==)\s*(?!0\b)/g],
  ['presence-zero', /\.length\s*(?:===|!==)\s*0\b/g],          // class P by construction — printed, reconciled out
  ['local-const', /\b(?:FIELD_MAX|TAG_MAX|TAGS_MAX_COUNT|MAX_\w+|\w+_(?:MAX|CAP|LIMIT|CHARS|COUNT))\b/g],
];
// A line whose only bound hit is a rate-limit config constant passed to
// checkRateLimit() is a request-rate bound, not a text bound — excluded and counted.
const RATE_LIMIT_LINE = /checkRateLimit\s*\(/;
let rateLimitExcluded = 0;
const CALL = /\b([A-Za-z_$][\w$]*)\s*\(/g;
const SKIP_CALLS = new Set(['if', 'for', 'while', 'switch', 'catch', 'return', 'await', 'typeof', 'function', 'async', 'Promise', 'Number', 'String', 'Boolean', 'Array', 'Object', 'JSON', 'Date', 'Math', 'Set', 'Map', 'Error', 'console', 'parseInt', 'parseFloat', 'isNaN', 'isFinite', 'encodeURIComponent', 'decodeURIComponent']);
function boundsIn(code, from, to, tag) {
  const seen = new Map(); const region = code.slice(from, to);
  for (const [name, re] of BOUNDS) { re.lastIndex = 0; let b; while ((b = re.exec(region))) { const abs = from + b.index; const ln = lineOf(code, abs); if (!seen.has(ln)) seen.set(ln, { forms: new Set(), text: code.split('\n')[ln - 1].trim().slice(0, 100) }); seen.get(ln).forms.add(name); } }
  return [...seen.entries()].sort((a, b) => a[0] - b[0]).filter(([, v]) => { if (v.forms.size === 1 && v.forms.has('local-const') && RATE_LIMIT_LINE.test(v.text)) { rateLimitExcluded++; return false; } return true; }).map(([ln, v]) => `      ${tag}L${ln} [${[...v.forms].join('+')}]: ${v.text}`);
}
let handlers = 0, withCheck = 0, directLines = 0, viaLines = 0, windowLines = 0, windowsNoMarker = 0;
for (const r of [...routeLevel, ...substrateGate]) {
  const src = fs.readFileSync(path.join(ROOT, r), 'utf8'); const code = blank(src);
  const sf = ts.createSourceFile(r, src, ts.ScriptTarget.Latest, true, ts.ScriptKind.TS);
  const fns = new Map(); const imported = new Set();
  ts.forEachChild(sf, (node) => {
    if (ts.isFunctionDeclaration(node) && node.name && node.body) {
      const exported = (ts.canHaveModifiers(node) ? ts.getModifiers(node) || [] : []).some((m) => m.kind === ts.SyntaxKind.ExportKeyword);
      fns.set(node.name.text, { start: node.getStart(sf), bodyStart: node.body.getStart(sf), bodyEnd: node.body.getEnd(), exported });
    }
    if (ts.isImportDeclaration(node) && node.importClause) {
      const ic = node.importClause; if (ic.name) imported.add(ic.name.text);
      if (ic.namedBindings && ts.isNamedImports(ic.namedBindings)) for (const el of ic.namedBindings.elements) imported.add(el.name.text);
    }
  });
  const out = [];
  for (const name of ['POST', 'PATCH', 'PUT', 'DELETE']) {
    const fn = fns.get(name); if (!fn || !fn.exported) continue; handlers++;
    const body = code.slice(fn.bodyStart, fn.bodyEnd); CHECK.lastIndex = 0; const cm = CHECK.exec(body);
    if (!cm) { out.push(`  ${name} @L${lineOf(code, fn.start)}: no check in handler`); continue; }
    withCheck++;
    const checkAbs = fn.bodyStart + cm.index;
    const direct = boundsIn(code, fn.bodyStart, checkAbs, ''); directLines += direct.length;
    // Every call made before the check: same-file declared functions are
    // followed one level (all of them, not a name-pattern subset); imported
    // identifiers are printed for the trace to follow by hand.
    const pre = code.slice(fn.bodyStart, checkAbs); const helperLines = []; const followed = new Set(); const importedCalls = new Set(); let h;
    CALL.lastIndex = 0;
    while ((h = CALL.exec(pre))) {
      const hn = h[1]; if (SKIP_CALLS.has(hn) || hn === cm[1]) continue;
      const def = fns.get(hn);
      if (def && !def.exported && !followed.has(hn)) { followed.add(hn); const via = boundsIn(code, def.bodyStart, def.bodyEnd, `via ${hn}(): `); viaLines += via.length; helperLines.push(`      ${hn}@L${lineOf(code, fn.bodyStart + h.index)} (same-file helper, body followed: ${via.length} bound line(s))`, ...via); }
      else if (!def && imported.has(hn)) importedCalls.add(hn);
    }
    // The check→redirect window.
    const after = code.slice(checkAbs, fn.bodyEnd); REDIRECT.lastIndex = 0; const rm = REDIRECT.exec(after);
    let windowLine;
    if (rm) { const redirAbs = checkAbs + rm.index; const w = boundsIn(code, checkAbs + cm[0].length, redirAbs, 'post-check '); windowLines += w.length; windowLine = [`      check→redirect window L${lineOf(code, checkAbs)}–L${lineOf(code, redirAbs)}: ${w.length} bound line(s)`, ...w]; }
    else { windowsNoMarker++; const w = boundsIn(code, checkAbs + cm[0].length, fn.bodyEnd, 'post-check '); windowLines += w.length; windowLine = [`      check→redirect window: NO REDIRECT MARKER FOUND in handler — scanned to handler end: ${w.length} bound line(s)`, ...w]; }
    out.push(`  ${name} @L${lineOf(code, fn.start)} -> ${cm[1]} @L${lineOf(code, checkAbs)}; direct pre-check bound lines: ${direct.length}`);
    out.push(...direct, ...helperLines);
    if (importedCalls.size) out.push(`      imported calls pre-check (follow by hand): ${[...importedCalls].join(', ')}`);
    out.push(...windowLine);
  }
  console.log(`### ${r}\n${out.join('\n')}`);
}
console.log(`\nSUMMARY write-handlers=${handlers} with-check=${withCheck} pre-check-bound-lines: direct=${directLines} via-same-file-helper=${viaLines} raw-total=${directLines + viaLines} (raw — reconciled by the manual trace in the audit §1.6); check→redirect-window bound lines=${windowLines} (handlers with no redirect marker found: ${windowsNoMarker}); rate-limit config lines excluded=${rateLimitExcluded}`);
const sc = blank(fs.readFileSync(path.join(ROOT, 'src/app/api/score-conversation/route.ts'), 'utf8'));
const flagIdx = sc.indexOf('if (isScoreConversationR20aEnabled())');
let depth = 0, blockEnd = -1; for (let j = sc.indexOf('{', flagIdx); j < sc.length; j++) { if (sc[j] === '{') depth++; else if (sc[j] === '}') { depth--; if (depth === 0) { blockEnd = j; break; } } }
const fmtIdx = sc.search(/format\.length\s*>\s*TEXT_LIMITS\.long/);
const fmtCount = (sc.match(/format\.length\s*>\s*TEXT_LIMITS\.long/g) || []).length;
console.log(`KNOWN-CASE score-conversation: R20a flag block L${lineOf(sc, flagIdx)}-L${lineOf(sc, blockEnd)}; format guard L${lineOf(sc, fmtIdx)} (occurrences: ${fmtCount}); format guard AFTER block end: ${fmtIdx > blockEnd} (a single boolean on the brace-matched END anchor — it does not distinguish 'before the block' from 'inside it'; the per-handler counts above do)`);
