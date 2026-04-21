/*
 * One-off rewiring script: transforms SageReasoning_Architecture_Map.html
 * from hardcoded `const nodes`/`const flows` to a runtime fetch of
 * /flows.json. Applies to both the root copy and website/public/ copy.
 *
 * Used once on 2026-04-21. Can be deleted after both HTML files are verified.
 */

const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const targets = [
  path.join(ROOT, 'SageReasoning_Architecture_Map.html'),
  path.join(ROOT, 'website', 'public', 'SageReasoning_Architecture_Map.html'),
];

// Reuse the brace-walker from the extraction script.
function extractLiteralRange(html, name) {
  const startPattern = new RegExp(`const ${name}\\s*=\\s*\\{`);
  const m = html.match(startPattern);
  if (!m) throw new Error(`Could not find const ${name} = {`);
  const declStart = m.index;
  const openBraceIdx = html.indexOf('{', declStart);
  let depth = 0;
  let i = openBraceIdx;
  let inString = null;
  let inLineComment = false;
  let inBlockComment = false;
  for (; i < html.length; i++) {
    const ch = html[i];
    const prev = html[i - 1];
    if (inLineComment) { if (ch === '\n') inLineComment = false; continue; }
    if (inBlockComment) { if (prev === '*' && ch === '/') inBlockComment = false; continue; }
    if (inString) {
      if (ch === '\\') { i++; continue; }
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
  // Include trailing semicolon if present.
  let end = i + 1;
  if (html[end] === ';') end++;
  return { start: declStart, end };
}

// The replacement block declares empty mutable holders; the real data is
// populated by loadFlowData() below.
const EMPTY_DECL_NODES = 'let nodes = {};';
const EMPTY_DECL_FLOWS = 'let flows = {};';

// Replacement initializer block. Swaps the old
// "initializeNodes(); drawConnections();" pair for an async fetch that
// populates nodes/flows from /flows.json before initializing.
const OLD_INIT = `// Initialize
        initializeNodes();
        drawConnections();`;

const NEW_INIT = `// Initialize — fetch flow data from /flows.json, then render.
        // Mirrors the pattern used by SageReasoning_Capability_Inventory.html
        // which fetches /component-registry.json. See Task 1 (2026-04-21).
        async function loadFlowData() {
            try {
                const response = await fetch('/flows.json');
                if (!response.ok) throw new Error('HTTP ' + response.status);
                const data = await response.json();
                nodes = data.nodes;
                flows = data.flows;
                initializeNodes();
                drawConnections();
            } catch (err) {
                console.error('Failed to load /flows.json:', err);
                // Inline error message. Does not depend on external CSS.
                const banner = document.createElement('div');
                banner.style.cssText = 'position:fixed;top:12px;left:50%;transform:translateX(-50%);background:#b91c1c;color:#fff;padding:10px 16px;border-radius:6px;font-family:sans-serif;font-size:13px;z-index:9999;';
                banner.textContent = 'Flow data failed to load (' + err.message + '). Check that /flows.json is deployed alongside this page.';
                document.body.appendChild(banner);
            }
        }
        loadFlowData();`;

for (const target of targets) {
  const html = fs.readFileSync(target, 'utf8');

  const nodesRange = extractLiteralRange(html, 'nodes');
  // After replacing nodes, indexes shift, so handle flows on a reindex.
  const flowsRangeOnOriginal = extractLiteralRange(html, 'flows');

  // Build the new HTML in one pass by splicing both ranges.
  // Order matters: process from end-of-file to start so earlier indexes stay valid.
  const ranges = [
    { ...nodesRange, replacement: EMPTY_DECL_NODES },
    { ...flowsRangeOnOriginal, replacement: EMPTY_DECL_FLOWS },
  ].sort((a, b) => b.start - a.start); // descending by start

  let next = html;
  for (const r of ranges) {
    next = next.slice(0, r.start) + r.replacement + next.slice(r.end);
  }

  // Swap the initializer pair.
  if (next.indexOf(OLD_INIT) === -1) {
    throw new Error(`Expected initializer pair not found in ${target}`);
  }
  next = next.replace(OLD_INIT, NEW_INIT);

  fs.writeFileSync(target, next, 'utf8');
  console.log(`Rewired: ${target} (${fs.statSync(target).size} bytes)`);
}
