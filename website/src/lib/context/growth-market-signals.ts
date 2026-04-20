/**
 * growth-market-signals.ts — Channel 2 loader for the Sage-Growth chat persona.
 *
 * Reads `operations/growth-market-signals.md` at request time, parses the
 * YAML-style front-matter (updated date + maintainer) and the four named
 * sections (Content Performance, Developer Discovery, Community Feedback,
 * Competitive / Market Observations), and returns a structured block plus
 * a ready-to-inject `formatted_context` string.
 *
 * Sparse-state handling (first observation of this pattern, 20 April 2026)
 *   Market signals are expected to be sparse at P0 — founder observation
 *   accumulates slowly and there is no automatic feed. When fewer than 5
 *   signals exist across the four sections within the rolling window, the
 *   loader sets `is_sparse = true` and composes a `formatted_context`
 *   that explicitly tells Growth the data is expected to be absent at
 *   this stage. This prevents Growth from silently substituting
 *   training-data intuitions for real observations.
 *
 * Rolling window
 *   Default 120 days (broader than Channel 1 because market signals
 *   accumulate more slowly). If the post-window count is fewer than 5,
 *   the window is widened to all available entries to avoid returning
 *   "no signal yet" when the file has sparse but all-historical data.
 *
 * Failure mode
 *   If the file is missing or unparseable, the loader returns a stub
 *   with empty arrays and a `formatted_context` that tells the Growth
 *   persona it is answering without market-signal context. Silent
 *   fallback is worse than a self-disclosing message (per handoff §3.2).
 *
 * Read-only. Does not import from sage-mentor/. Does not write.
 *
 * Injection point: website/src/app/api/founder/hub/route.ts
 * `case 'growth'`.
 *
 * Risk classification: Standard (0d-ii). New read path, sparse-at-P0,
 * non-safety-critical surface.
 */

import { promises as fs } from 'fs'
import path from 'path'

// =============================================================================
// Types
// =============================================================================

export type MarketSignalSection =
  | 'content_performance'
  | 'developer_discovery'
  | 'community_feedback'
  | 'market_observations'

export type SignalStrength = 'strong' | 'weak' | 'anecdotal'

export interface MarketSignal {
  date: string // ISO (YYYY-MM-DD)
  section: MarketSignalSection
  reference?: string
  observation: string
  strength: SignalStrength
}

export interface MarketSignalsBlock {
  as_of: string
  maintainer: string
  window_days: number
  signals: MarketSignal[]
  is_sparse: boolean
  formatted_context: string
  source: 'file' | 'stub'
}

export interface GrowthMarketSignalsOptions {
  windowDays?: number
}

// =============================================================================
// Constants
// =============================================================================

// From repo root. process.cwd() on Vercel serverless functions resolves to the
// project root (website/ is the Next.js app, but cwd is the repo root during
// the function runtime). The file lives in operations/ at repo root.
//
// KNOWN LIMITATION (20 April 2026): see corresponding note in
// growth-actions-log.ts. Fix is scheduled for a dedicated follow-up session
// covering all file-based loaders.
const MARKET_SIGNALS_PATH = path.join(
  process.cwd(),
  'operations',
  'growth-market-signals.md',
)

const DEFAULT_WINDOW_DAYS = 120
const SPARSE_THRESHOLD = 5

const STUB_MESSAGE =
  'Growth market signals unavailable. Growth is answering without ' +
  'market-feedback context. Update operations/growth-market-signals.md ' +
  'to restore this signal.'

const SECTION_HEADINGS: ReadonlyArray<{
  match: RegExp
  section: MarketSignalSection
  label: string
}> = [
  { match: /^content\s+performance/i, section: 'content_performance', label: 'Content Performance' },
  { match: /^developer\s+discovery/i, section: 'developer_discovery', label: 'Developer Discovery' },
  { match: /^community\s+feedback/i, section: 'community_feedback', label: 'Community Feedback' },
  {
    match: /^competitive(\s*\/?\s*market)?|^market\s+observations/i,
    section: 'market_observations',
    label: 'Competitive / Market Observations',
  },
]

const VALID_STRENGTHS: ReadonlySet<SignalStrength> = new Set([
  'strong',
  'weak',
  'anecdotal',
])

// =============================================================================
// Parsers
// =============================================================================

function parseFrontMatter(raw: string): {
  as_of: string
  maintainer: string
  body: string
} {
  const trimmed = raw.replace(/^\uFEFF/, '')
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
 * Walks the body and splits it into four buckets keyed by
 * MarketSignalSection. Unknown `##` headings are ignored. Text before
 * the first recognised heading is dropped.
 */
function splitBySections(body: string): Record<MarketSignalSection, string> {
  const buckets: Record<MarketSignalSection, string[]> = {
    content_performance: [],
    developer_discovery: [],
    community_feedback: [],
    market_observations: [],
  }
  let active: MarketSignalSection | null = null
  const lines = body.split(/\r?\n/)
  for (const line of lines) {
    const h = line.match(/^##\s+(.*?)\s*$/)
    if (h) {
      const title = h[1]
      const hit = SECTION_HEADINGS.find((s) => s.match.test(title))
      active = hit ? hit.section : null
      continue
    }
    if (active) buckets[active].push(line)
  }
  const out: Partial<Record<MarketSignalSection, string>> = {}
  for (const key of Object.keys(buckets) as MarketSignalSection[]) {
    out[key] = buckets[key].join('\n').trim()
  }
  return out as Record<MarketSignalSection, string>
}

interface ParsedSignalFields {
  observation: string
  date?: string
  reference?: string
  strength?: string
}

function parseSignalList(section: string): ParsedSignalFields[] {
  if (!section) return []
  // Sparse-state placeholder detector. Accepts "_no signal yet..._",
  // "no signal yet", "no signal captured yet", "no entries yet".
  if (/^_?no\s+(signal|entries|observations)/i.test(section.trim())) return []

  const out: ParsedSignalFields[] = []
  const lines = section.split(/\r?\n/)
  let current: ParsedSignalFields | null = null

  const flush = () => {
    if (!current) return
    if (current.observation) out.push(current)
    current = null
  }

  for (const rawLine of lines) {
    const line = rawLine.trimEnd()
    if (!line.trim() || /^```/.test(line)) continue

    // Top-level bullet opens a new entry.
    const bullet = line.match(/^[-*]\s+(?:\*\*(.+?)\*\*|(.+?))\s*$/)
    if (bullet && !/^\s+[-*]/.test(rawLine)) {
      flush()
      current = { observation: (bullet[1] ?? bullet[2] ?? '').trim() }
      continue
    }

    if (current) {
      const kv = line.match(/^\s+[-*]?\s*([a-zA-Z_ ]+?)\s*:\s*(.*?)\s*$/)
      if (kv) {
        const key = kv[1].trim().toLowerCase().replace(/\s+/g, '_')
        const value = kv[2]
        if (key === 'date') current.date = value
        else if (key === 'reference' || key === 'ref' || key === 'piece' || key === 'link') {
          current.reference = value
        } else if (key === 'strength' || key === 'signal_strength') {
          current.strength = value.toLowerCase()
        }
      }
    }
  }
  flush()
  return out
}

function normaliseSignal(
  fields: ParsedSignalFields,
  section: MarketSignalSection,
): MarketSignal | null {
  if (!fields.observation) return null
  const date = fields.date ?? ''
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) return null
  const strength = (fields.strength ?? '') as SignalStrength
  if (!VALID_STRENGTHS.has(strength)) return null
  return {
    date,
    section,
    reference: fields.reference,
    observation: fields.observation,
    strength,
  }
}

// =============================================================================
// Window filter
// =============================================================================

function msInDays(days: number): number {
  return days * 24 * 60 * 60 * 1000
}

function applyRollingWindow(
  signals: MarketSignal[],
  windowDays: number,
): { windowed: MarketSignal[]; widened: boolean } {
  const now = Date.now()
  const cutoff = now - msInDays(windowDays)
  const windowed = signals.filter((s) => {
    const t = Date.parse(s.date)
    if (Number.isNaN(t)) return false
    return t >= cutoff
  })
  if (windowed.length < SPARSE_THRESHOLD && signals.length > windowed.length) {
    return { windowed: signals, widened: true }
  }
  return { windowed, widened: false }
}

// =============================================================================
// Formatter
// =============================================================================

function formatSignal(s: MarketSignal): string {
  const lines = [
    `- ${s.observation}`,
    `    date: ${s.date}`,
    `    strength: ${s.strength}`,
  ]
  if (s.reference) lines.push(`    reference: ${s.reference}`)
  return lines.join('\n')
}

function formatSection(
  label: string,
  signals: MarketSignal[],
): string {
  if (!signals.length) {
    return `${label}: no signal recorded in the current window.`
  }
  return [`${label}:`, ...signals.map(formatSignal)].join('\n')
}

function sectionOrderedGroups(
  signals: MarketSignal[],
): Array<{ section: MarketSignalSection; label: string; signals: MarketSignal[] }> {
  return SECTION_HEADINGS.map((s) => ({
    section: s.section,
    label: s.label,
    signals: signals.filter((sig) => sig.section === s.section),
  }))
}

function formatBlock(params: {
  as_of: string
  maintainer: string
  windowDays: number
  signals: MarketSignal[]
  is_sparse: boolean
  widened: boolean
}): string {
  const { as_of, maintainer, windowDays, signals, is_sparse, widened } = params

  const header = [
    `GROWTH MARKET SIGNALS — FOUNDER-OBSERVED FEEDBACK IN THE LAST ${windowDays} DAYS` +
      (widened ? ' (window widened: sparse data)' : ''),
    `Source: operations/growth-market-signals.md (hand-maintained)`,
    `As of: ${as_of}   Maintainer: ${maintainer}`,
    `Signals captured in window: ${signals.length}`,
  ].join('\n')

  if (is_sparse) {
    const sparseNote = [
      '',
      'This is expected at P0. SageReasoning has no automatic',
      'market-feedback feed yet, so signals only appear when the',
      'founder observes something and records it. When this block is',
      'sparse, base recommendations on the Growth Brain static context',
      '(positioning, audience, content, devrel, community, metrics) and',
      'flag market-feedback gaps when they matter to the decision at',
      'hand. Do NOT invent signals, do NOT infer what "the market must',
      'be saying" from general knowledge, and do NOT pretend to have',
      'data you do not have. If a recommendation depends on a signal',
      'that is not in this block, name the gap and say so.',
    ].join('\n')
    const grouped = sectionOrderedGroups(signals)
      .map((g) => formatSection(g.label, g.signals))
      .join('\n\n')
    return `${header}${sparseNote}\n\n${grouped}`
  }

  const densityNote = [
    '',
    'Treat this block as the only authoritative record of market,',
    'content, community, and competitive signals the founder has',
    'observed. Use the strength field (strong / weak / anecdotal) to',
    'weight how much any one signal should drive a recommendation.',
    'Strong signals deserve action; anecdotal signals deserve',
    'curiosity, not strategy.',
  ].join('\n')

  const grouped = sectionOrderedGroups(signals)
    .map((g) => formatSection(g.label, g.signals))
    .join('\n\n')
  return `${header}${densityNote}\n\n${grouped}`
}

function formatStubBlock(windowDays: number): string {
  return [
    `GROWTH MARKET SIGNALS — FOUNDER-OBSERVED FEEDBACK IN THE LAST ${windowDays} DAYS`,
    'Source: operations/growth-market-signals.md (hand-maintained)',
    'As of: unavailable',
    '',
    STUB_MESSAGE,
  ].join('\n')
}

// =============================================================================
// Public API
// =============================================================================

export async function getGrowthMarketSignals(
  options?: GrowthMarketSignalsOptions,
): Promise<MarketSignalsBlock> {
  const windowDays = options?.windowDays ?? DEFAULT_WINDOW_DAYS

  let raw: string
  try {
    raw = await fs.readFile(MARKET_SIGNALS_PATH, 'utf8')
  } catch {
    return {
      as_of: 'unavailable',
      maintainer: 'unknown',
      window_days: windowDays,
      signals: [],
      is_sparse: true,
      formatted_context: formatStubBlock(windowDays),
      source: 'stub',
    }
  }

  try {
    const { as_of, maintainer, body } = parseFrontMatter(raw)
    const sections = splitBySections(body)

    const parsedAll: MarketSignal[] = []
    for (const meta of SECTION_HEADINGS) {
      const list = parseSignalList(sections[meta.section])
      for (const fields of list) {
        const sig = normaliseSignal(fields, meta.section)
        if (sig) parsedAll.push(sig)
      }
    }

    // Sort by date desc to guarantee recency ordering.
    parsedAll.sort((a, b) => Date.parse(b.date) - Date.parse(a.date))

    const { windowed, widened } = applyRollingWindow(parsedAll, windowDays)
    const is_sparse = windowed.length < SPARSE_THRESHOLD

    return {
      as_of,
      maintainer,
      window_days: windowDays,
      signals: windowed,
      is_sparse,
      formatted_context: formatBlock({
        as_of,
        maintainer,
        windowDays,
        signals: windowed,
        is_sparse,
        widened,
      }),
      source: 'file',
    }
  } catch {
    return {
      as_of: 'unavailable',
      maintainer: 'unknown',
      window_days: windowDays,
      signals: [],
      is_sparse: true,
      formatted_context: formatStubBlock(windowDays),
      source: 'stub',
    }
  }
}
