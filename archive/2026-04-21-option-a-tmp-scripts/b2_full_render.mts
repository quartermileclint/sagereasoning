import { getOpsContinuityState } from './src/lib/context/ops-continuity-state.ts'
const block = await getOpsContinuityState()
const fc = block.formatted_context
console.log('=== formatted_context length:', fc.length, 'chars ===')
// Print just the two extended sections
const ciIdx = fc.indexOf('Capability inventory')
const ftIdx = fc.indexOf('Flow tracer summary')
if (ciIdx >= 0 && ftIdx > ciIdx) {
  console.log('--- CAPABILITY INVENTORY SECTION ---')
  console.log(fc.slice(ciIdx, ftIdx))
}
if (ftIdx >= 0) {
  console.log('--- FLOW TRACER SECTION ---')
  console.log(fc.slice(ftIdx))
}
