/*
 * Adds a `journey` field to every component with agentReady in
 * {partial, not-ready}. Values: free_tier, paid_api, both, internal.
 *
 * Rationale (one-liner stored per item, not written to the JSON):
 * - free_tier  → powers a human-facing practitioner tool or user page
 * - paid_api   → used only by external agents via /api/skill/* or /api/skill registry / ATL
 * - both       → shared infrastructure serving both journeys
 * - internal   → ops, founder tools, references, scheduling, usage tracking
 *
 * Used once on 2026-04-21. Delete after verification.
 */

const fs = require('fs');
const path = require('path');
const p = path.resolve(__dirname, '..', 'website', 'public', 'component-registry.json');
const r = JSON.parse(fs.readFileSync(p, 'utf8'));

const JOURNEY = {
  // Agents
  'agent-private-mentor': 'free_tier',
  'agent-mentor': 'free_tier',
  'agent-sage-ops': 'internal',
  'agent-session-bridge': 'internal',
  'agent-support': 'free_tier',

  // Engines
  'engine-accred-card': 'paid_api',
  'engine-trust-layer': 'paid_api',
  'engine-authority-mgr': 'free_tier',
  'engine-baseline': 'both',
  'engine-deliberation': 'both',
  'engine-doc-scorer': 'both',
  'engine-embedding': 'free_tier',
  'engine-llm-bridge': 'free_tier',
  'engine-mentor-ledger': 'free_tier',
  'engine-pattern-engine': 'free_tier',
  'engine-proactive': 'free_tier',
  'engine-profile-store': 'free_tier',
  'engine-progression': 'paid_api',
  'engine-receipt': 'both',
  'engine-ring-wrapper': 'both',
  'engine-sage-reason-engine': 'both',
  'engine-skill-registry': 'paid_api',

  // Infrastructure
  'infra-resend': 'internal',
  'infra-mcp-contracts': 'paid_api',
  'infra-stripe': 'both',
  'infra-supabase-auth': 'both',

  // Products (pages)
  'prod-api-docs': 'paid_api',
  'prod-scenarios': 'free_tier',
  'prod-marketplace': 'paid_api',

  // Docs / reasoning
  'doc-journal-layers': 'internal',
  'reasoning-sanitise': 'both',

  // Tools (API routes)
  'tool-mcp': 'paid_api',
  'tool-receipts': 'paid_api',
  'tool-sage-align': 'paid_api',
  'tool-sage-audit': 'both',
  'tool-sage-classify': 'paid_api',
  'tool-sage-coach': 'paid_api',
  'tool-sage-comply': 'paid_api',
  'tool-sage-converse': 'both',
  'tool-sage-decide': 'both',
  'tool-sage-diagnose': 'free_tier',
  'tool-sage-educate': 'paid_api',
  'tool-sage-filter': 'free_tier',
  'tool-sage-govern': 'paid_api',
  'tool-sage-guard': 'paid_api',
  'tool-sage-identity': 'paid_api',
  'tool-sage-invest': 'paid_api',
  'tool-sage-iterate': 'both',
  'tool-sage-moderate': 'paid_api',
  'tool-sage-negotiate': 'paid_api',
  'tool-sage-pivot': 'paid_api',
  'tool-sage-premortem': 'paid_api',
  'tool-sage-prioritise': 'paid_api',
  'tool-sage-profile': 'paid_api',
  'tool-sage-reason': 'both',
  'tool-sage-reflect': 'free_tier',
  'tool-sage-resolve': 'paid_api',
  'tool-sage-retro': 'paid_api',
  'tool-sage-scenario': 'free_tier',
  'tool-sage-score': 'free_tier',
  'tool-compose': 'paid_api',
  'tool-execute': 'paid_api',
  'tool-usage': 'internal',
  'tool-delete': 'free_tier',
  'tool-export': 'free_tier',
};

const comps = r.components || r;
let applied = 0;
const missing = [];

for (const c of comps) {
  if (c.agentReady !== 'partial' && c.agentReady !== 'not-ready') continue;
  const j = JOURNEY[c.id];
  if (!j) { missing.push(c.id); continue; }
  c.journey = j;
  applied++;
}

if (missing.length) {
  console.error('Missing classifications for ids:', missing);
  process.exit(1);
}

// Summary
const counts = { free_tier: 0, paid_api: 0, both: 0, internal: 0 };
for (const c of comps) {
  if (c.journey) counts[c.journey]++;
}
console.log(`Applied journey field to ${applied} components.`);
console.log('Counts:', counts);

// Preserve formatting style (2-space indent, trailing newline).
fs.writeFileSync(p, JSON.stringify(r, null, 2) + '\n', 'utf8');
console.log('Wrote', p);
