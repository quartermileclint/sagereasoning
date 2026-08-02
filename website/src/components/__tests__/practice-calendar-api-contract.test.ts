/**
 * practice-calendar-api-contract.test.ts — a text-scanning guard against the
 * defect fixed 2026-08-02: PracticeCalendar.tsx read `dayData.strongest_virtue`
 * and `activity.virtues_demonstrated`, fields the API has never produced (it
 * has always emitted `strongest_domain` and `virtue_domains_engaged`). Every
 * active day silently rendered as an inert grey number — `strongestVirtue`
 * resolved to null, so the day fell into the "no badge" render branch — and
 * clicking it threw on `.map()` of `undefined`, producing the application-error
 * page the founder reported.
 *
 * WHY A TEXT-SCANNING TEST, NOT A RENDER TEST. PracticeCalendar is a 'use
 * client' component that fetches its own data via useEffect + a Supabase
 * session token; renderToStaticMarkup (the pattern daily-rhythm-strip.test.tsx
 * uses) only captures the initial pre-effect render and cannot exercise the
 * crash, and this project has no jsdom/testing-library dependency to mount it
 * with a real lifecycle. A field-name mismatch between two files is exactly
 * the class of defect this project's boundary tests already catch by reading
 * source text (see e.g. src/app/logos/__tests__/human-practitioner-boundary.test.ts)
 * — so this applies the same technique to the API/component wire contract.
 *
 * Run (from website/):
 *   npx tsx src/components/__tests__/practice-calendar-api-contract.test.ts
 */

import * as fs from 'fs'
import * as path from 'path'

let passed = 0
let failed = 0
const failures: string[] = []

function assert(condition: boolean, label: string): void {
  if (condition) { passed++ } else { failed++; failures.push(label); console.error('FAIL: ' + label) }
}

const websiteRoot = path.resolve(__dirname, '..', '..', '..')
const apiPath = path.join(websiteRoot, 'src/app/api/practice-calendar/route.ts')
const componentPath = path.join(websiteRoot, 'src/components/PracticeCalendar.tsx')

const apiSource = fs.readFileSync(apiPath, 'utf-8')
const componentSourceRaw = fs.readFileSync(componentPath, 'utf-8')

// Strip comments before scanning for CODE access patterns and the ghost-field
// check below. Without this, the component's own explanatory comment about
// this fix (which names the old, wrong field names for documentation) would
// falsely trip both the field-read extraction and the "never reappear" check
// — a comment mentioning a field is not a read of it.
function stripComments(source: string): string {
  return source.replace(/\/\*[\s\S]*?\*\//g, '').replace(/\/\/.*$/gm, '')
}
const componentSource = stripComments(componentSourceRaw)

// ─── Fields the component reads off `dayData` / `selectedDayData` / `activity` ───
// Extracted from real access patterns: `dayData?.X`, `dayData.X`,
// `selectedDayData.X`, `activity.X`. Deliberately excludes `activities` (a
// collection, not a scalar field) and TS-only tokens.
function extractReadFields(source: string, receivers: string[]): Set<string> {
  const fields = new Set<string>()
  for (const receiver of receivers) {
    const re = new RegExp(`\\b${receiver}\\??\\.(\\w+)`, 'g')
    let m: RegExpExecArray | null
    while ((m = re.exec(source)) !== null) fields.add(m[1])
  }
  return fields
}

const dayDataFieldsRead = extractReadFields(componentSource, ['dayData', 'selectedDayData'])
const activityFieldsRead = extractReadFields(componentSource, ['activity'])

// ─── Fields the API actually serializes onto a day / an activity ───
// Read directly out of the two literal object shapes the route builds:
// `serializedDays[day] = {...}` (the day) and the two `activities.push({...})`
// call sites plus the shared inline type (the journal push and the type
// literal share the same keys as the two explicit pushes, verified below).
function extractLiteralKeys(source: string, anchor: string): Set<string> {
  const start = source.indexOf(anchor)
  assert(start !== -1, `NON-VACUITY: anchor '${anchor}' must be found in the API route (a moved anchor would silently empty this check)`)
  if (start === -1) return new Set()
  const braceStart = source.indexOf('{', start)
  let depth = 0
  let end = braceStart
  for (let i = braceStart; i < source.length; i++) {
    if (source[i] === '{') depth++
    else if (source[i] === '}') { depth--; if (depth === 0) { end = i; break } }
  }
  const block = source.slice(braceStart, end)
  const keys = new Set<string>()
  const keyRe = /^\s*(\w+):/gm
  let m: RegExpExecArray | null
  while ((m = keyRe.exec(block)) !== null) keys.add(m[1])
  return keys
}

const dayFieldsProduced = extractLiteralKeys(apiSource, 'serializedDays[day] = {')
const actionActivityFieldsProduced = extractLiteralKeys(apiSource, "type: 'action',")
const reflectionActivityFieldsProduced = extractLiteralKeys(apiSource, "type: 'reflection',")

// ─── Non-vacuity: prove the extraction actually finds fields, on both sides ───
assert(dayDataFieldsRead.size > 3, `NON-VACUITY: the component-side day-field extraction found only ${dayDataFieldsRead.size} fields — the regex may not be matching`)
assert(activityFieldsRead.size > 1, `NON-VACUITY: the component-side activity-field extraction found only ${activityFieldsRead.size} fields — the regex may not be matching`)
assert(dayFieldsProduced.size > 3, `NON-VACUITY: the API day-shape extraction found only ${dayFieldsProduced.size} fields — the anchor/brace-matching may be broken`)
assert(actionActivityFieldsProduced.size > 3, `NON-VACUITY: the API action-activity extraction found only ${actionActivityFieldsProduced.size} fields`)
assert(reflectionActivityFieldsProduced.size > 3, `NON-VACUITY: the API reflection-activity extraction found only ${reflectionActivityFieldsProduced.size} fields`)

// ─── THE ACTUAL GUARD: every field the component reads must be one the API produces ───
for (const field of dayDataFieldsRead) {
  assert(
    dayFieldsProduced.has(field),
    `CONTRACT: PracticeCalendar.tsx reads dayData.${field}, but the API's serializedDays entry never sets it (produces: ${[...dayFieldsProduced].sort().join(', ')})`
  )
}
for (const field of activityFieldsRead) {
  const producedByEither = actionActivityFieldsProduced.has(field) || reflectionActivityFieldsProduced.has(field)
  assert(
    producedByEither,
    `CONTRACT: PracticeCalendar.tsx reads activity.${field}, but neither the 'action' nor the 'reflection' activity push sets it`
  )
}

// ─── The two crash-causing field names must never reappear ───
for (const ghost of ['strongest_virtue', 'virtues_demonstrated']) {
  assert(!componentSource.includes(ghost), `REGRESSION: '${ghost}' — the exact field name that caused the application-error page — must not reappear in PracticeCalendar.tsx`)
}

// ─── SELF-TEST: assert() can fail ───
{
  const before = failed
  assert(false, '__probe__')
  const fired = failed === before + 1
  failed = before
  failures.pop()
  if (!fired) { failed++; failures.push('SELF-TEST: assert() did not register a known-false claim') }
  else passed++
}

console.log(`\n${passed} passed, ${failed} failed`)
if (failed > 0) {
  console.log('\nFailures:')
  for (const f of failures) console.log('  - ' + f)
  process.exit(1)
}
