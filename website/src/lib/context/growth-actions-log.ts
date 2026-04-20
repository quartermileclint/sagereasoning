/**
 * growth-actions-log.ts — Channel 1 loader for the Sage-Growth chat persona.
 *
 * Reads `operations/growth-actions-log.md` at request time, parses the
 * YAML-style front-matter (updated date + maintainer) and the top-level
 * action entries under the `## Actions` section, and returns a structured
 * block plus a ready-to-inject `formatted_context` string.
 *
 * Rolling window
 *   Returns the last 90 days of actions by default. Older entries remain
 *   in the file for audit but are not injected into context.
 *
 * Failure mode
 *   If the file is missing or unparseable, the loader returns a stub
 *   with empty arrays and a `formatted_context` that tells the Growth
 *   persona it is answering without prior-action context. Silent
 *   fallback is worse than a self-disclosing message (per handoff §3.1).
 *
 * Read-only. Does not import from sage-mentor/. Does not write.
 *
 * Injection point: website/src/app/api/founder/hub/route.ts
 * `case 'growth'`.
 *
 * Risk classification: Standard (0d-ii). New read path, new file
 * dependency, non-safety-critical surface.
 */

import { promises as fs } from 'fs'
import path from 'path'

// =============================================================================
// Types
// =============================================================================

export type GrowthDomain =
  | 'positioning'
  | 'audience'
  | 'content'
  | 'devrel'
  | 'community'
  | 'metrics'
  | 'pricing'
  | 'messaging'

export type GrowthActionType =
  | 'decided'
  | 'drafted'
  | 'shipped'
  | 'tested'
  | 'opened'
  | 'paused'
  | 'reversed'

export interface GrowthAction {
  date: string // ISO (YYYY-MM-DD)
  domain: GrowthDomain
  action_type: GrowthActionType
  summary: string
  outcome: string // free text, or the literal 'awaiting_signal'
  reference?: string
}

export interface GrowthActionsBlock {
  as_of: string
  maintainer: string
  window_days: number
  actions: GrowthAction[]
  formatted_context: string
  source: 'file' | 'stub'
}

export interface GrowthActionsLogOptions {
  windowDays?: number
}

// =============================================================================
// Constants
// =============================================================================

// From repo root. process.cwd() on Vercel serverless functions resolves to the
// project root (website/ is the Next.js app, but cwd is the repo root during
// the function runtime). The file lives in operations/ at repo root.
//
// KNOWN LIMITATION (20 April 2026): Tech's Channel 1 and Channel 2 loaders use
// this same pattern and were observed returning the stub fallback on Vercel
// runtime. Diagnosis and fix are scheduled for a dedicated follow-up session
// covering all file-based loaders (Tech + Growth + future Ops). Until that
// session lands, Growth is expected to return the stub message on Vercel.
// The self-disclosing stub preserves honesty: Growth will say it is
// answering without prior-action context rather than inventing one.
const ACTIONS_LOG_PATH = path.join(
  process.cwd(),
  'operations',
  'growth-actions-log.md',
)

const DEFAULT_WINDOW_DAYS = 90

const STUB_MESSAGE =
  'Growth actions log unavailable. Growth is answering without prior-action ' +
  'context. Update operations/growth-actions-log.md to restore this signal.'

const VALID_DOMAINS: ReadonlySet<GrowthDomain> = new Set([
  'positioning',
  'audience',
  'content',
  'devrel',
  'community',
  'metrics',
  'pricing',
  'messaging',
])

const VALID_ACTION_TYPES: ReadonlySet<GrowthActionType> = new Set([
  'decided',
  'drafted',
  'shipped',
  'tested',
  'opened',
  'paused',
  'reversed',
])

// =============================================================================
// Parsers
// =============================================================================

/**
 * Parses the front-matter block at the top of the file. Accepts:
 *   ---
 *   updated: 2026-04-20
 *   maintainer: founder
 *   ---
 */
function parseFrontMatter(raw: string): {
  as_of: string
  maintainer: string
  body: string
} {
  const trimmed = raw.replace(/^\uFEFF/, '') // strip BOM if present
  const match = trimmed.match(/^---\s*\n([\s\S]*?)\n---\s*\n([\s\S]*)$/)
  if (!match) {
    return { as_of: 'unknown', maintainer: 'unknown', body: trimmed }
  }
  const [, front, body] = match
  let as_of = 'unknown'
  let maintainer = 'unknown'
  for (const line of front.split(/\r?\n/)) {
    const m = line.match(/^\s*([a-zA-Z_]+)\s*:\s*(.*?)\s*$/)
    if (!m) continue
    const key = m[1].toLowerCase()
    const value = m[2]
    if (key === 'updated') as_of = value
    else if (key === 'maintainer') maintainer = value
  }
  return { as_of, maintainer, body }
}

/**
 * Returns the text of the `## Actions` section, or '' if absent.
 * Every other `##` heading is ignored.
 */
function extractActionsSection(body: string): string {
  const lines = body.split(/\r?\n/)
  let inActions = false
  const bucket: string[] = []
  for (const line of lines) {
    const h = line.match(/^##\s+(.*?)\s*$/)
    if (h) {
      inActions = h[1].toLowerCase().startsWith('actions')
      continue
    }
    if (inActions) bucket.push(line)
  }
  return bucket.join('\n').trim()
}

interface ParsedActionFields {
  summary: string
  date?: string
  domain?: string
  action_type?: string
  outcome?: string
  reference?: string
}

/**
 * Parses a section's bullet list. Each entry is a top-level bullet
 * (`- **Summary**`) followed by an indented set of `key: value` lines.
 *
 * Placeholder sentences like "_no actions yet..._" resolve to [].
 */
function parseActionList(section: string): ParsedActionFields[] {
  if (!section) return []
  if (/^_?no\s+(entries|actions)\s+yet/i.test(section.trim())) return []

  const out: ParsedActionFields[] = []
  const lines = section.split(/\r?\n/)
  let current: ParsedActionFields | null = null

  const flush = () => {
    if (!current) return
    if (current.summary) out.push(current)
    current = null
  }

  for (const rawLine of lines) {
    const line = rawLine.trimEnd()
    // Skip code fences and blank lines cleanly.
    if (!line.trim() || /^```/.test(line)) continue

    // Top-level bullet opens a new entry.
    const bullet = line.match(/^[-*]\s+(?:\*\*(.+?)\*\*|(.+?))\s*$/)
    if (bullet && !/^\s+[-*]/.test(rawLine)) {
      flush()
      current = { summary: (bullet[1] ?? bullet[2] ?? '').trim() }
      continue
    }

    // Indented key: value line within an open entry.
    if (current) {
      const kv = line.match(/^\s+[-*]?\s*([a-zA-Z_ ]+?)\s*:\s*(.*?)\s*$/)
      if (kv) {
        const key = kv[1].trim().toLowerCase().replace(/\s+/g, '_')
        const value = kv[2]
        if (key === 'date') current.date = value
        else if (key === 'domain') current.domain = value.toLowerCase()
        else if (key === 'action_type' || key === 'action') current.action_type = value.toLowerCase()
        else if (key === 'outcome') current.outcome = value
        else if (key === 'reference' || key === 'ref' || key === 'link') current.reference = value
      }
    }
  }
  flush()
  return out
}

/**
 * Normalises a parsed row into a GrowthAction. Returns null if required
 * fields are missing or invalid.
 */
function normaliseAction(fields: ParsedActionFields): GrowthAction | null {
  if (!fields.summary) return null
  const date = fields.date ?? ''
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) return null
  const domain = (fields.domain ?? '') as GrowthDomain
  if (!VALID_DOMAINS.has(domain)) return null
  const action_type = (fields.action_type ?? '') as GrowthActionType
  if (!VALID_ACTION_TYPES.has(action_type)) return null
  const outcome = fields.outcome && fields.outcome.length ? fields.outcome : 'awaiting_signal'
  return {
    date,
    domain,
    action_type,
    summary: fields.summary,
    outcome,
    reference: fields.reference,
  }
}

// =============================================================================
// Window filter
// =============================================================================

function msInDays(days: number): number {
  return days * 24 * 60 * 60 * 1000
}

/**
 * Filters actions to those dated within the last `windowDays` days from
 * today. Entries with invalid dates are dropped upstream in
 * `normaliseAction`. Ordering is preserved (file order, which the
 * maintenance contract specifies as reverse chronological).
 */
function applyRollingWindow(actions: GrowthAction[], windowDays: number): GrowthAction[] {
  const now = Date.now()
  const cutoff = now - msInDays(windowDays)
  return actions.filter((a) => {
    const t = Date.parse(a.date)
    if (Number.isNaN(t)) return false
    return t >= cutoff
  })
}

// =============================================================================
// Formatter
// =============================================================================

function formatAction(a: GrowthAction): string {
  const lines = [
    `- ${a.summary}`,
    `    date: ${a.date}`,
    `    domain: ${a.domain}`,
    `    action_type: ${a.action_type}`,
    `    outcome: ${a.outcome}`,
  ]
  if (a.reference) lines.push(`    reference: ${a.reference}`)
  return lines.join('\n')
}

function formatBlock(
  as_of: string,
  maintainer: string,
  windowDays: number,
  actions: GrowthAction[],
): string {
  const header = [
    `GROWTH ACTIONS LOG — PRIOR ACTIONS IN THE LAST ${windowDays} DAYS`,
    `Source: operations/growth-actions-log.md (hand-maintained)`,
    `As of: ${as_of}   Maintainer: ${maintainer}`,
    '',
    'Treat this block as the only authoritative record of what has',
    'already been decided, drafted, shipped, tested, opened, paused, or',
    'reversed in the growth domain. If the founder asks what has been',
    'done about positioning / audience / content / devrel / community /',
    'metrics / pricing / messaging, ground your answer in these entries',
    'first. Do not recommend something already decided or reversed; if',
    'the log shows it, name that and build on it rather than restart.',
  ].join('\n')

  const body = actions.length
    ? ['Entries:', ...actions.map(formatAction)].join('\n')
    : 'Entries: none recorded in the current window.'

  return `${header}\n\n${body}`
}

function formatStubBlock(windowDays: number): string {
  return [
    `GROWTH ACTIONS LOG — PRIOR ACTIONS IN THE LAST ${windowDays} DAYS`,
    'Source: operations/growth-actions-log.md (hand-maintained)',
    'As of: unavailable',
    '',
    STUB_MESSAGE,
  ].join('\n')
}

// =============================================================================
// Public API
// =============================================================================

export async function getGrowthActionsLog(
  options?: GrowthActionsLogOptions,
): Promise<GrowthActionsBlock> {
  const windowDays = options?.windowDays ?? DEFAULT_WINDOW_DAYS

  let raw: string
  try {
    raw = await fs.readFile(ACTIONS_LOG_PATH, 'utf8')
  } catch {
    return {
      as_of: 'unavailable',
      maintainer: 'unknown',
      window_days: windowDays,
      actions: [],
      formatted_context: formatStubBlock(windowDays),
      source: 'stub',
    }
  }

  try {
    const { as_of, maintainer, body } = parseFrontMatter(raw)
    const section = extractActionsSection(body)
    const parsed = parseActionList(section)
    const actions = parsed
      .map(normaliseAction)
      .filter((a): a is GrowthAction => a !== null)
    const windowed = applyRollingWindow(actions, windowDays)

    return {
      as_of,
      maintainer,
      window_days: windowDays,
      actions: windowed,
      formatted_context: formatBlock(as_of, maintainer, windowDays, windowed),
      source: 'file',
    }
  } catch {
    return {
      as_of: 'unavailable',
      maintainer: 'unknown',
      window_days: windowDays,
      actions: [],
      formatted_context: formatStubBlock(windowDays),
      source: 'stub',
    }
  }
}
