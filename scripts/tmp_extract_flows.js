/*
 * One-off extraction script: pulls the `nodes` and `flows` object literals
 * out of SageReasoning_Architecture_Map.html (the newer root copy) and
 * writes them to website/public/flows.json as structured data.
 *
 * Used once on 2026-04-21. Can be deleted after flows.json is verified.
 */

const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const HTML_PATH = path.join(ROOT, 'SageReasoning_Architecture_Map.html');
const OUT_PATH = path.join(ROOT, 'website', 'public', 'flows.json');

const html = fs.readFileSync(HTML_PATH, 'utf8');

// Match the two object literals inside the <script> block. Each starts with
// `const <name> = {` and ends with `};` at 8-space indentation. The HTML has
// exactly one occurrence of each.
function extractLiteral(name) {
  const startPattern = new RegExp(`const ${name}\\s*=\\s*\\{`);
  const startIdx = html.search(startPattern);
  if (startIdx === -1) throw new Error(`Could not find const ${name} = {`);
  const openBraceIdx = html.indexOf('{', startIdx);
  // Walk braces with awareness of strings and comments.
  let depth = 0;
  let i = openBraceIdx;
  let inString = null; // ' or "
  let inLineComment = false;
  let inBlockComment = false;
  for (; i < html.length; i++) {
    const ch = html[i];
    const prev = html[i - 1];
    if (inLineComment) {
      if (ch === '\n') inLineComment = false;
      continue;
    }
    if (inBlockComment) {
      if (prev === '*' && ch === '/') inBlockComment = false;
      continue;
    }
    if (inString) {
      if (ch === '\\') { i++; continue; } // skip escaped char
      if (ch === inString) inString = null;
      continue;
    }
    if (ch === "'" || ch === '"') { inString = ch; continue; }
    if (ch === '/' && html[i + 1] === '/') { inLineComment = true; i++; continue; }
    if (ch === '/' && html[i + 1] === '*') { inBlockComment = true; i++; continue; }
    if (ch === '{') depth++;
    else if (ch === '}') {
      depth--;
      if (depth === 0) break;
    }
  }
  if (depth !== 0) throw new Error(`Unbalanced braces extracting ${name}`);
  const literalSrc = html.slice(openBraceIdx, i + 1);
  // Evaluate the literal in a sandboxed function. Source comes from the repo,
  // not user input — this is safe at build time.
  // eslint-disable-next-line no-new-func
  const value = new Function(`return (${literalSrc});`)();
  return value;
}

const nodes = extractLiteral('nodes');
const flows = extractLiteral('flows');

const nodeCount = Object.keys(nodes).length;
const flowCount = Object.keys(flows).length;

console.log(`Extracted ${nodeCount} nodes, ${flowCount} flows.`);

const out = { nodes, flows };
fs.writeFileSync(OUT_PATH, JSON.stringify(out, null, 2) + '\n', 'utf8');
console.log(`Wrote ${OUT_PATH} (${fs.statSync(OUT_PATH).size} bytes).`);
