const fs = require('fs');
const path = require('path');

const p = path.resolve(__dirname, '..', 'website', 'public', 'component-registry.json');
const r = JSON.parse(fs.readFileSync(p, 'utf8'));
const comps = r.components || r;

console.log('Total components:', comps.length);

const byReady = {};
comps.forEach((c) => {
  const k = c.agentReady || 'na';
  byReady[k] = (byReady[k] || 0) + 1;
});
console.log('By agentReady:', byReady);

const nonReady = comps.filter((c) => c.agentReady !== 'ready');
console.log('Non-ready count (agentReady !== ready):', nonReady.length);

console.log('Keys on first comp:', Object.keys(comps[0]));

console.log('Non-ready breakdown by type:');
const byType = {};
nonReady.forEach((c) => {
  byType[c.type] = (byType[c.type] || 0) + 1;
});
console.log(byType);

console.log('Sample non-ready ids (first 20):');
nonReady.slice(0, 20).forEach((c) => {
  console.log('  -', c.id, '|', c.agentReady, '|', c.type, '|', c.path);
});
