/*
 * Runtime verification of the extended Sage-Ops loader.
 * Reads the same files the loader reads and simulates the two new sections
 * (capability_inventory + flow_tracer). Also does a light syntax check on
 * ops-continuity-state.ts by looking for required exports.
 *
 * Delete after 2026-04-21.
 */

import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';

const ROOT = resolve(process.cwd());

async function checkCapabilityInventory() {
  const raw = await readFile(
    resolve(ROOT, 'website/public/component-registry.json'),
    'utf8',
  );
  const parsed = JSON.parse(raw);
  const list = parsed.components;
  const totals = { total: list.length, ready: 0, partial: 0, not_ready: 0, na: 0 };
  for (const c of list) {
    const v = typeof c.agentReady === 'string' ? c.agentReady : 'na';
    if (v === 'ready') totals.ready++;
    else if (v === 'partial') totals.partial++;
    else if (v === 'not-ready') totals.not_ready++;
    else totals.na++;
  }
  const nonReady = list.filter(
    (c) => c.agentReady === 'partial' || c.agentReady === 'not-ready',
  );
  const missingJourney = nonReady.filter((c) => typeof c.journey !== 'string');
  return { totals, nonReadyCount: nonReady.length, missingJourney: missingJourney.length };
}

async function checkFlowTracer() {
  const raw = await readFile(resolve(ROOT, 'website/public/flows.json'), 'utf8');
  const parsed = JSON.parse(raw);
  const nodeCount = Object.keys(parsed.nodes).length;
  const flowCount = Object.keys(parsed.flows).length;
  // Sample one flow
  const firstKey = Object.keys(parsed.flows)[0];
  const first = parsed.flows[firstKey];
  const sample = {
    key: firstKey,
    name: first.name,
    category: first.category,
    stepCount: first.path.length,
    firstStepId: first.path[0].id,
  };
  return { nodeCount, flowCount, sample };
}

async function checkLoaderFile() {
  const src = await readFile(
    resolve(ROOT, 'website/src/lib/context/ops-continuity-state.ts'),
    'utf8',
  );
  const checks = {
    has_capability_inventory_field: /capability_inventory:/.test(src),
    has_flow_tracer_field: /flow_tracer:/.test(src),
    has_loadCapabilityInventory: /async function loadCapabilityInventory/.test(src),
    has_loadFlowTracer: /async function loadFlowTracer/.test(src),
    has_formatCapabilityInventory: /function formatCapabilityInventory/.test(src),
    has_formatFlowTracer: /function formatFlowTracer/.test(src),
    has_formatBlock_uses_capability: /formatCapabilityInventory\(block\.capability_inventory\)/.test(src),
    has_formatBlock_uses_flow: /formatFlowTracer\(block\.flow_tracer\)/.test(src),
    getState_has_capability: /capability_inventory,/.test(src),
    getState_has_flow: /flow_tracer,/.test(src),
  };
  return checks;
}

const [cap, flow, loader] = await Promise.all([
  checkCapabilityInventory(),
  checkFlowTracer(),
  checkLoaderFile(),
]);

console.log('--- Capability Inventory ---');
console.log(JSON.stringify(cap, null, 2));
console.log('--- Flow Tracer ---');
console.log(JSON.stringify(flow, null, 2));
console.log('--- Loader File Checks ---');
console.log(JSON.stringify(loader, null, 2));

const allPass = Object.values(loader).every((v) => v === true);
console.log('ALL LOADER CHECKS PASS:', allPass);
