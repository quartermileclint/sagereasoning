/**
 * tech-system-state.ts — Channel 1 loader for the Tech chat persona.
 *
 * Reads `operations/tech-known-issues.md` at request time, parses the
 * YAML-style front-matter (updated date + maintainer) and the two
 * sections (Current Issues, Recently Resolved), and returns a
 * structured block plus a ready-to-inject `formatted_context` string.
 *
 * Failure mode
 *   If the file is missing or unparseable, the loader returns a stub
 *   with empty arrays and a `formatted_context` that tells the Tech
 *   persona it is answering blind. Silent fallback is worse than a
 *   self-disclosing message (per handoff §3.1).
 *
 * Read-only. Does not import from sage-mentor/. Does not write.
 *
 * Injection point: website/src/app/api/founder/hub/route.ts `case 'tech'`.
 *
 * Risk classification: Elevated (0d-ii). New read path, new file
 * dependency, non-safety-critical surface.
 */

import { promises as fs } from 'fs'
import path from 'path'

// =============================================================================
// Types
// =============================================================================

export type IssueSeverity = 'catastrophic' | 'significant' | 'minor' | 'cosmetic'
export type IssueStatus = 'open' | 'investigating' | 'mitigated' | 'resolved'

export interface CurrentIssue {
  title: string
  severity: IssueSeverity
  affected_surface: string
  first_observed: string
  status: IssueStatus
  workaround?: string
}

export interface ResolvedIssue {
  title: string
  severity: IssueSeverity
  affected_surface: string
  first_observed: string
  resolution_date: string
  status: IssueStatus
  workaround?: string
}

export interface TechSystemStateBlock {
  as_of: string
  maintainer: string
  current_issues: CurrentIssue[]
  recently_resolved: ResolvedIssue[]
  formatted_context: string
  source: 'file' | 'stub'
}

// =============================================================================
// Constants
// =============================================================================

// From repo root. process.cwd() on Vercel serverless functions resolves to the
// project root (website/ is the Next.js app, but cwd is the repo root during
// the function runtime). The file lives in operations/ at repo root.
const KNOWN_ISSUES_PATH = path.join(
  process.cwd(),
  'operations',
  'tech-known-issues.md',
)

const STUB_MESSAGE =
  'System state signal unavailable. Tech is answering without current-issues context. ' +
  'Update operations/tech-known-issues.md to restore this signal.'

// =============================================================================
// Parser
// =============================================================================

/**
 * Parses the front-matter block at the top of the file. Accepts:
 *   ---
 *   updated: 2026-04-20
 *   maintainer: founder
 *   ---
 *
 * Returns defaults if the block is missing or malformed.
 */
function parseFrontMatter(raw: string): { as_of: string; maintainer: string; body: string } {
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
 * Splits the body by top-level `##` headers and returns the section text for
 * each known heading. Missing sections resolve to empty string.
 */
function extractSections(body: string): { current: string; resolved: string } {
  const lines = body.split(/\r?\n/)
  let active: 'current' | 'resolved' | null = null
  const buckets: { current: string[]; resolved: string[] } = { current: [], resolved: [] }
  for (const line of lines) {
    const h = line.match(/^##\s+(.*?)\s*$/)
    if (h) {
      const title = h[1].toLowerCase()
      if (title.startsWith('current issues')) active = 'current'
      else if (title.startsWith('recently resolved')) active = 'resolved'
      else active = null
      continue
    }
    if (active) buckets[active].push(line)
  }
  return {
    current: buckets.current.join('\n').trim(),
    resolved: buckets.resolved.join('\n').trim(),
  }
}

/**
 * Parses a section's bullet list. Each issue is a top-level bullet (`- **Title**`)
 * followed by an indented set of `key: value` lines. Accepts loose formatting.
 *
 * Returns [] if the section is empty or if it contains only a placeholder
 * sentence like "No known issues at ...".
 */
interface ParsedIssueFields {
  title: string
  severity: IssueSeverity
  affected_surface: string
  first_observed: string
  status: IssueStatus
  resolution_date?: string
  workaround?: string
}

function parseIssueList(section: string): ParsedIssueFields[] {
  if (!section) return []
  // Placeholder sentence detector
  if (/^no\s+(known|recently[- ]resolved)\s+issues/i.test(section.trim())) return []

  const out: ParsedIssueFields[] = []
  const lines = section.split(/\r?\n/)
  let current: Partial<ParsedIssueFields> | null = null

  const flush = () => {
    if (!current) return
    if (!current.title) {
      current = null
      return
    }
    out.push({
      title: current.title,
      severity: (current.severity ?? 'minor') as IssueSeverity,
      affected_surface: current.affected_surface ?? 'unknown',
      first_observed: current.first_observed ?? 'unknown',
      status: (current.status ?? 'open') as IssueStatus,
      resolution_date: current.resolution_date,
      workaround: current.workaround,
    })
    current = null
  }

  for (const rawLine of lines) {
    const line = rawLine.trimEnd()
    // Top-level bullet opens a new issue.
    const bullet = line.match(/^[-*]\s+(?:\*\*(.+?)\*\*|(.+?))\s*$/)
    if (bullet && !/^\s+[-*]/.test(rawLine)) {
      flush()
      current = { title: (bullet[1] ?? bullet[2] ?? '').trim() }
      continue
    }
    // Indented key: value line within an open issue.
    if (current) {
      const kv = line.match(/^\s+[-*]?\s*([a-zA-Z_ ]+?)\s*:\s*(.*?)\s*$/)
      if (kv) {
        const key = kv[1].trim().toLowerCase().replace(/\s+/g, '_')
        const value = kv[2]
        if (key === 'severity') current.severity = value.toLowerCase() as IssueSeverity
        else if (key === 'affected_surface' || key === 'surface') current.affected_surface = value
        else if (key === 'first_observed' || key === 'observed') current.first_observed = value
        else if (key === 'status') current.status = value.toLowerCase() as IssueStatus
        else if (key === 'resolution_date' || key === 'resolved') current.resolution_date = value
        else if (key === 'workaround' || key === 'rollback') current.workaround = value
      }
    }
  }
  flush()
  return out
}

// =============================================================================
// Formatter
// =============================================================================

function formatIssue(i: CurrentIssue | ResolvedIssue, includeResolution: boolean): string {
  const lines = [
    `- ${i.title}`,
    `    severity: ${i.severity}`,
    `    affected_surface: ${i.affected_surface}`,
    `    first_observed: ${i.first_observed}`,
    `    status: ${i.status}`,
  ]
  if (i.workaround) lines.push(`    workaround: ${i.workaround}`)
  if (includeResolution && (i as ResolvedIssue).resolution_date) {
    lines.push(`    resolution_date: ${(i as ResolvedIssue).resolution_date}`)
  }
  return lines.join('\n')
}

function formatBlock(
  as_of: string,
  maintainer: string,
  current: CurrentIssue[],
  resolved: ResolvedIssue[],
): string {
  const header = [
    `LIVE SYSTEM STATE — KNOWN ISSUES`,
    `Source: operations/tech-known-issues.md (hand-maintained)`,
    `As of: ${as_of}   Maintainer: ${maintainer}`,
    '',
    'Treat this block as the only authoritative signal about what is',
    'currently broken, degraded, or under remediation. If a founder',
    'question references live behaviour and this block shows "No known',
    'issues", say so plainly — do not invent issues, and do not imply',
    'access to runtime logs you do not have.',
  ].join('\n')

  const currentSection = current.length
    ? ['Current Issues:', ...current.map((i) => formatIssue(i, false))].join('\n')
    : 'Current Issues: none recorded.'

  const resolvedSection = resolved.length
    ? ['Recently Resolved (last 30 days):', ...resolved.map((i) => formatIssue(i, true))].join('\n')
    : 'Recently Resolved (last 30 days): none recorded.'

  return `${header}\n\n${currentSection}\n\n${resolvedSection}`
}

function formatStubBlock(): string {
  return [
    'LIVE SYSTEM STATE — KNOWN ISSUES',
    'Source: operations/tech-known-issues.md (hand-maintained)',
    'As of: unavailable',
    '',
    STUB_MESSAGE,
  ].join('\n')
}

// =============================================================================
// Public API
// =============================================================================

export async function getTechSystemState(): Promise<TechSystemStateBlock> {
  let raw: string
  try {
    raw = await fs.readFile(KNOWN_ISSUES_PATH, 'utf8')
  } catch {
    return {
      as_of: 'unavailable',
      maintainer: 'unknown',
      current_issues: [],
      recently_resolved: [],
      formatted_context: formatStubBlock(),
      source: 'stub',
    }
  }

  try {
    const { as_of, maintainer, body } = parseFrontMatter(raw)
    const { current, resolved } = extractSections(body)

    const currentParsed = parseIssueList(current).map<CurrentIssue>((i) => ({
      title: i.title,
      severity: i.severity,
      affected_surface: i.affected_surface,
      first_observed: i.first_observed,
      status: i.status,
      workaround: i.workaround,
    }))

    const resolvedParsed = parseIssueList(resolved).map<ResolvedIssue>((i) => ({
      title: i.title,
      severity: i.severity,
      affected_surface: i.affected_surface,
      first_observed: i.first_observed,
      status: i.status,
      resolution_date: i.resolution_date ?? 'unknown',
      workaround: i.workaround,
    }))

    return {
      as_of,
      maintainer,
      current_issues: currentParsed,
      recently_resolved: resolvedParsed,
      formatted_context: formatBlock(as_of, maintainer, currentParsed, resolvedParsed),
      source: 'file',
    }
  } catch {
    return {
      as_of: 'unavailable',
      maintainer: 'unknown',
      current_issues: [],
      recently_resolved: [],
      formatted_context: formatStubBlock(),
      source: 'stub',
    }
  }
}
