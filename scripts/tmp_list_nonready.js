/*
 * One-off listing: emit a CSV-like preview of all non-Ready components
 * (agentReady in {partial, not-ready}). Used to inform the journey-field
 * classification. Delete after 2026-04-21.
 */
const fs = require('fs');
const path = require('path');
const p = path.resolve(__dirname, '..', 'website', 'public', 'component-registry.json');
const r = JSON.parse(fs.readFileSync(p, 'utf8'));
const comps = r.components || r;

const nonReady = comps.filter(
  (c) => c.agentReady === 'partial' || c.agentReady === 'not-ready',
);

console.log('id | type | agentReady | status | path | name');
console.log('---+------+------------+--------+------+-----');
for (const c of nonReady) {
  console.log(
    [c.id, c.type, c.agentReady, c.status, c.path || '', c.name]
      .join(' | '),
  );
}
console.log('');
console.log(`Count: ${nonReady.length}`);
