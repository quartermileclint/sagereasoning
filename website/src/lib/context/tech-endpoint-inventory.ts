/**
 * tech-endpoint-inventory.ts — Channel 2 loader for the Tech chat persona.
 *
 * Reads `/TECHNICAL_STATE.md` at the repo root at request time, parses
 * §2 (`runSageReason` endpoints) and §3 (Mentor family, a table), and
 * returns a structured inventory plus a ready-to-inject
 * `formatted_context` string with the file's "Last updated" date in the
 * header.
 *
 * The file is treated as a read-only source in this session (Choice 2
 * Option A — reconcile drift in a later session). The verification
 * harness at `scripts/tech-wiring-verification.mjs` reports inventory
 * vs codebase drift on every run.
 *
 * Failure mode
 *   If the file is missing or the expected sections are absent, the
 *   loader returns an empty inventory with a self-disclosing stub
 *   block. Silent fallback is worse than a self-disclosing message
 *   (matches the Channel 1 convention).
 *
 * Read-only. Does not import from sage-mentor/. Does not write.
 *
 * Injection point: website/src/app/api/founder/hub/route.ts `case 'tech'`.
 *
 * Risk classification: Elevated (0d-ii). New read path, file-parse
 * dependency on /TECHNICAL_STATE.md, non-safety-critical surface.
 */

import { promises as fs } from 'fs'
import path from 'path'

// =============================================================================
// Types
// =============================================================================

export type EndpointStatus =
  | 'Scoped'
  | 'Designed'
  | 'Scaffolded'
  | 'Wired'
  | 'Verified'
  | 'Live'

export type EndpointFamily = 'runSageReason' | 'mentor' | 'assessment' | 'other'

export interface EndpointInventoryEntry {
  route: string
  method: string
  purpose: string
  auth: string
  rate_limit: string | null
  depth: string
  model: string
  context_layers: string[]
  status: EndpointStatus
  side_effects: string | null
  notes: string | null
  family: EndpointFamily
}

export interface EndpointInventoryBlock {
  as_of: string
  endpoints: EndpointInventoryEntry[]
  formatted_context: string
  drift_warning: string | null
  source: 'file' | 'stub'
}

// =============================================================================
// Constants
// =============================================================================

// Repo root. On Vercel serverless, process.cwd() resolves to /var/task/website
// (the Next.js project dir), not the repo root (/var/task). Parent traversal
// reaches the repo root where TECHNICAL_STATE.md lives. Confirmed by diagnostic
// probe on 21 April 2026.
const REPO_ROOT = path.join(process.cwd(), '..')
const TECH_STATE_PATH = path.join(REPO_ROOT, 'TECHNICAL_STATE.md')

const STUB_MESSAGE =
  'Endpoint inventory unavailable. Tech is answering without the /TECHNICAL_STATE.md ' +
  'endpoint map. Check that /TECHNICAL_STATE.md exists at the repo root and has ' +
  'the expected §2 and §3 headings.'

// =============================================================================
// Header / "as of" parser
// =============================================================================

function parseHeaderDate(raw: string): string {
  // "**Last updated:** 11 April 2026 · Session 16"
  const m = raw.match(/\*\*Last updated:\*\*\s+([^·\n]+?)(?:\s*·|\s*$)/i)
  if (m) return m[1].trim()
  return 'unknown'
}

// =============================================================================
// §2 parser — runSageReason endpoints
// =============================================================================

function extractSectionText(raw: string, startPattern: RegExp, endPattern: RegExp): string {
  const startMatch = raw.match(startPattern)
  if (!startMatch || startMatch.index === undefined) return ''
  const start = startMatch.index + startMatch[0].length
  const rest = raw.slice(start)
  const endMatch = rest.match(endPattern)
  const end = endMatch && endMatch.index !== undefined ? endMatch.index : rest.length
  return rest.slice(0, end)
}

/**
 * §2 subsections look like:
 *
 *   ### 2.1 POST /api/score
 *   **Purpose:** ...
 *   **Auth:** ...
 *   **Rate limit:** ...
 *   **Depth:** ...
 *   **Model:** ...
 *   **Context layers:** ...
 *   **Status:** Wired
 *   **Note:** ...
 *   (Input / Output / Side effects follow)
 *
 * Each subsection ends at the next `### ` or at the §3 divider.
 */
function parseRunSageReasonEndpoints(section: string): EndpointInventoryEntry[] {
  if (!section) return []
  // Split on `### ` headings. First chunk is preamble — skip it.
  const parts = section.split(/\n(?=###\s)/)
  const out: EndpointInventoryEntry[] = []
  for (const part of parts) {
    if (!/^###\s/.test(part)) continue
    const header = part.match(/^###\s+\d+\.\d+\s+([A-Z]+)\s+(\/\S+)/)
    if (!header) continue
    const method = header[1]
    const route = header[2]

    const bold = (field: string): string | null => {
      const re = new RegExp(`\\*\\*${field}:\\*\\*\\s+(.+?)(?:\\s{2}|$)`, 'im')
      const m = part.match(re)
      return m ? m[1].trim() : null
    }

    const purpose = bold('Purpose') ?? ''
    const auth = bold('Auth') ?? 'unknown'
    const rateLimit = bold('Rate limit')
    const depth = bold('Depth') ?? 'unknown'
    const model = bold('Model') ?? 'unknown'
    const contextLayersRaw = bold('Context layers') ?? ''
    const statusRaw = bold('Status') ?? 'Scoped'
    const notes = bold('Note')

    // Context layers split on commas, trim, drop empties
    const context_layers = contextLayersRaw
      .split(',')
      .map((s) => s.trim())
      .filter((s) => s.length > 0)

    // Side effects: "**Side effects:** None" or "Inserts to analytics_events..."
    let side_effects: string | null = null
    const sideMatch = part.match(/\*\*Side effects:\*\*\s+([^\n]+)/i)
    if (sideMatch) side_effects = sideMatch[1].trim()

    // Normalise status — fall back to Scoped if unrecognised
    const validStatuses: EndpointStatus[] = [
      'Scoped',
      'Designed',
      'Scaffolded',
      'Wired',
      'Verified',
      'Live',
    ]
    const statusClean = statusRaw.replace(/[^A-Za-z]/g, '')
    const status: EndpointStatus = validStatuses.includes(statusClean as EndpointStatus)
      ? (statusClean as EndpointStatus)
      : 'Scoped'

    out.push({
      route,
      method,
      purpose,
      auth,
      rate_limit: rateLimit,
      depth,
      model,
      context_layers,
      status,
      side_effects,
      notes,
      family: 'runSageReason',
    })
  }
  return out
}

// =============================================================================
// §3 parser — mentor family table
// =============================================================================

/**
 * §3 is a markdown table of the form:
 *
 *   | Route | Auth | Depth | Context Layers | Status |
 *   |---|---|---|---|---|
 *   | POST /api/reflect | JWT (required) | deep | L1 ... | Wired |
 *   ...
 */
function parseMentorTable(section: string): EndpointInventoryEntry[] {
  if (!section) return []
  const out: EndpointInventoryEntry[] = []
  const lines = section.split(/\r?\n/)
  let inTable = false
  for (const line of lines) {
    const trimmed = line.trim()
    if (/^\|\s*Route\s*\|/i.test(trimmed)) {
      inTable = true
      continue
    }
    if (!inTable) continue
    if (!trimmed.startsWith('|')) {
      // table ended
      if (out.length > 0) break
      continue
    }
    // Skip separator row
    if (/^\|[\s\-|:]+\|\s*$/.test(trimmed)) continue

    const cells = trimmed
      .replace(/^\|/, '')
      .replace(/\|$/, '')
      .split('|')
      .map((c) => c.trim())

    if (cells.length < 5) continue

    const routeCell = cells[0]
    const authCell = cells[1]
    const depthCell = cells[2]
    const contextCell = cells[3]
    const statusCell = cells[4]

    // Route cell like "POST /api/reflect"
    const routeMatch = routeCell.match(/^([A-Z]+)\s+(\/\S+)/)
    if (!routeMatch) continue
    const method = routeMatch[1]
    const route = routeMatch[2]

    const validStatuses: EndpointStatus[] = [
      'Scoped',
      'Designed',
      'Scaffolded',
      'Wired',
      'Verified',
      'Live',
    ]
    const statusClean = statusCell.replace(/[^A-Za-z]/g, '')
    const status: EndpointStatus = validStatuses.includes(statusClean as EndpointStatus)
      ? (statusClean as EndpointStatus)
      : 'Scoped'

    out.push({
      route,
      method,
      purpose: 'Mentor family route (see §3 of TECHNICAL_STATE.md for accumulation features).',
      auth: authCell,
      rate_limit: null,
      depth: depthCell,
      model: 'MODEL_DEEP',
      context_layers: contextCell
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean),
      status,
      side_effects: null,
      notes: null,
      family: 'mentor',
    })
  }
  return out
}

// =============================================================================
// Formatter
// =============================================================================

function formatEndpointLine(e: EndpointInventoryEntry): string {
  const parts = [
    `- ${e.method} ${e.route}`,
    `    family: ${e.family}`,
    `    auth: ${e.auth}`,
    `    depth: ${e.depth}`,
    `    model: ${e.model}`,
    `    status: ${e.status}`,
  ]
  if (e.context_layers.length) parts.push(`    context_layers: ${e.context_layers.join('; ')}`)
  if (e.rate_limit) parts.push(`    rate_limit: ${e.rate_limit}`)
  if (e.side_effects) parts.push(`    side_effects: ${e.side_effects}`)
  return parts.join('\n')
}

function formatBlock(
  as_of: string,
  endpoints: EndpointInventoryEntry[],
  drift_warning: string | null,
): string {
  const header = [
    `ENDPOINT INVENTORY MAP`,
    `Source: /TECHNICAL_STATE.md (§2 runSageReason family + §3 mentor family)`,
    `As of: ${as_of}`,
    '',
    'Treat this as the canonical list of LLM-calling endpoints. When',
    'the founder asks about routes, models, auth, depth, or context',
    'layers, answer from this block — not from memory. If a route the',
    'founder names is not present here, say so and flag it as a',
    'possible inventory drift.',
  ].join('\n')

  const runSageReason = endpoints.filter((e) => e.family === 'runSageReason')
  const mentor = endpoints.filter((e) => e.family === 'mentor')

  const rsrBlock = runSageReason.length
    ? [`runSageReason family (${runSageReason.length}):`, ...runSageReason.map(formatEndpointLine)].join('\n')
    : 'runSageReason family: none parsed.'

  const mentorBlock = mentor.length
    ? [`Mentor family (${mentor.length}):`, ...mentor.map(formatEndpointLine)].join('\n')
    : 'Mentor family: none parsed.'

  const driftBlock = drift_warning
    ? `\nINVENTORY DRIFT NOTICE:\n${drift_warning}`
    : ''

  return `${header}\n\n${rsrBlock}\n\n${mentorBlock}${driftBlock}`
}

function formatStubBlock(): string {
  return [
    'ENDPOINT INVENTORY MAP',
    'Source: /TECHNICAL_STATE.md',
    'As of: unavailable',
    '',
    STUB_MESSAGE,
  ].join('\n')
}

// =============================================================================
// Public API
// =============================================================================

export async function getEndpointInventory(): Promise<EndpointInventoryBlock> {
  let raw: string
  try {
    raw = await fs.readFile(TECH_STATE_PATH, 'utf8')
  } catch {
    return {
      as_of: 'unavailable',
      endpoints: [],
      formatted_context: formatStubBlock(),
      drift_warning: null,
      source: 'stub',
    }
  }

  try {
    const as_of = parseHeaderDate(raw)

    // §2: everything between "## 2. The" and the next "## 3. " heading.
    const section2 = extractSectionText(
      raw,
      /##\s+2\.\s+The\s+9\s+`runSageReason`\s+Endpoints[^\n]*\n/i,
      /\n##\s+3\./,
    )
    // Fallback: looser §2 header match if the exact wording drifted.
    const section2Final = section2
      ? section2
      : extractSectionText(raw, /##\s+2\.[^\n]*runSageReason[^\n]*\n/i, /\n##\s+3\./)

    // §3: everything between "## 3." and the next "## 4." heading.
    const section3 = extractSectionText(raw, /##\s+3\.[^\n]*\n/, /\n##\s+4\./)

    const runSageReason = parseRunSageReasonEndpoints(section2Final)
    const mentor = parseMentorTable(section3)

    const endpoints = [...runSageReason, ...mentor]
    // Drift warning is set by the verification harness, not by the loader.
    // The loader does not do filesystem scans at request time (PR1 — single
    // read path per request, no recursive route-file globbing in the hot path).
    const drift_warning = null

    return {
      as_of,
      endpoints,
      formatted_context: formatBlock(as_of, endpoints, drift_warning),
      drift_warning,
      source: 'file',
    }
  } catch {
    return {
      as_of: 'unavailable',
      endpoints: [],
      formatted_context: formatStubBlock(),
      drift_warning: null,
      source: 'stub',
    }
  }
}
