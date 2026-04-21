/* One-off verification — delete after 2026-04-21. */
const f = JSON.parse(require('fs').readFileSync('website/public/flows.json','utf8'));
console.log('nodes:', Object.keys(f.nodes).length);
console.log('flows:', Object.keys(f.flows).length);
let bad = 0;
for (const [, v] of Object.entries(f.flows)) {
  if (typeof v.name !== 'string') bad++;
  if (typeof v.category !== 'string') bad++;
  if (!Array.isArray(v.path)) { bad++; continue; }
  for (const s of v.path) {
    if (typeof s.id !== 'string') bad++;
  }
}
console.log('schema violations:', bad);
