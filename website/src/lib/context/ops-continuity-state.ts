/**
 * ops-continuity-state.ts — Channel 2 loader for the Sage-Ops chat persona.
 *
 * Reads five hand-maintained continuity sources at request time and returns
 * a structured block plus a ready-to-inject `formatted_context` string.
 *
 * Sources
 *   1. operations/handoffs/*-close.md and session-N-close.md   (recent close notes)
 *   2. operations/decision-log.md                               (recent decisions)
 *   3. operations/knowledge-gaps.md                             (KG register)
 *   4. compliance/compliance_register.json                       (active obligations)
 *   5. operations/build-knowledge-extraction-2026-04-17.md      (D-register, decisions not made)
 *
 * Independent failure handling
 *   Each source is loaded and parsed in its own try/catch. A failure in one
 *   source produces a self-disclosing stub for that section only — the
 *   remaining four sources still render. Silent fallback is worse than a
 *   transparent message.
 *
 * Truncation order (per handoff §4.2)
 *   Most recent first. Sources have per-section caps so a large file does
 *   not displace the others. Caps:
 *     - Handoffs: last 5 close files (by filename timestamp sort)
 *     - Decision log: last 12 entries by section date
 *     - KG register: all entries (file is small — KG1..KG10 range)
 *     - Compliance: all obligations, id + status only (no narrative)
 *     - D-register: all entries (D1..D10 range)
 *
 * Read-only. Does not import from sage-mentor/. Does not write.
 *
 * Injection point: website/src/app/api/founder/hub/route.ts `case 'ops'`.
 *
 * Risk classification: Standard (0d-ii). Five new read paths, non-safety-
 * critical surface. Each source degrades independently.
 *
 * Rules served: R15 (Sage Ops boundaries), R16 (intelligence pipeline data
 *   governance), R0 (decision audit trail continuity).
 */

import { promises as fs } from 'fs'
import path from 'path'

// =============================================================================
// Types
// =============================================================================

export interface HandoffEntry {
  filename: string
  title: string
  first_line_date: string // best-effort extraction from H1 or filename
}

export interface DecisionLogEntry {
  date: string // raw heading date, e.g. "19 April 2026"
  title: string
  status: string // from **Status:** line, or 'unknown'
}

export interface KnowledgeGapEntry {
  id: string // e.g., "KG1"
  title: string
  reexplanations: string // raw text from the line, or 'unknown'
}

export interface ComplianceObligationEntry {
  id: string
  obligation: string
  status: string
  next_review_due: string | null
}

export interface DRegisterEntry {
  id: string // "D1", "D2", ...
  decision_deferred: string
  why_not_made: string
  blocking_condition: string
  impact_of_deferral: string
}

export interface OpsContinuitySection<T> {
  source: 'file' | 'stub'
  note: string | null // set when source === 'stub' to explain why
  items: T[]
}

export interface OpsContinuityBlock {
  as_of: string
  handoffs: OpsContinuitySection<HandoffEntry>
  decisions: OpsContinuitySection<DecisionLogEntry>
  knowledge_gaps: OpsContinuitySection<KnowledgeGapEntry>
  compliance: OpsContinuitySection<ComplianceObligationEntry>
  d_register: OpsContinuitySection<DRegisterEntry>
  formatted_context: string
}

// =============================================================================
// Paths
// =============================================================================

// process.cwd() on Vercel serverless resolves to the project root. These
// paths match the same pattern used by tech-system-state.ts and
// growth-actions-log.ts.
const ROOT = process.cwd()
const HANDOFFS_DIR = path.join(ROOT, 'operations', 'handoffs')
const DECISION_LOG_PATH = path.join(ROOT, 'operations', 'decision-log.md')
const KG_REGISTER_PATH = path.join(ROOT, 'operations', 'knowledge-gaps.md')
const COMPLIANCE_REGISTER_PATH = path.join(
  ROOT,
  'compliance',
  'compliance_register.json',
)
const D_REGISTER_PATH = path.join(
  ROOT,
  'operations',
  'build-knowledge-extraction-2026-04-17.md',
)

// =============================================================================
// Caps
// =============================================================================

const HANDOFF_CAP = 5
const DECISION_CAP = 12

// =============================================================================
// Source 1 — Handoffs directory
// =============================================================================

async function loadHandoffs(): Promise<OpsContinuitySection<HandoffEntry>> {
  let filenames: string[]
  try {
    const entries = await fs.readdir(HANDOFFS_DIR)
    filenames = entries.filter(
      (f) => /close\.md$/i.test(f) || /session-\d+-close\.md$/i.test(f),
    )
  } catch (e) {
    return {
      source: 'stub',
      note:
        e instanceof Error
          ? `operations/handoffs not readable: ${e.message}`
          : 'operations/handoffs not readable',
      items: [],
    }
  }

  if (filenames.length === 0) {
    return {
      source: 'stub',
      note: 'No close-note files found in operations/handoffs.',
      items: [],
    }
  }

  // Sort so the most recent file appears first. We rely on (a) numeric
  // session numbers in session-N-close.md and (b) lexicographic sort for the
  // rest — imperfect but stable, and the front of the list is what matters.
  filenames.sort((a, b) => {
    const an = a.match(/session-(\d+)/)
    const bn = b.match(/session-(\d+)/)
    if (an && bn) return Number(bn[1]) - Number(an[1])
    if (an) return -1
    if (bn) return 1
    return b.localeCompare(a)
  })

  const selected = filenames.slice(0, HANDOFF_CAP)
  const entries: HandoffEntry[] = []
  for (const filename of selected) {
    try {
      const raw = await fs.readFile(path.join(HANDOFFS_DIR, filename), 'utf8')
      const firstH1 = raw.match(/^#\s+(.*?)\s*$/m)
      const title = firstH1 ? firstH1[1].trim() : filename.replace(/\.md$/, '')
      // Best-effort date lookup: an ISO or spelled-out date inside the H1.
      const dateMatch = title.match(
        /(\d{1,2}\s+(January|February|March|April|May|June|July|August|September|October|November|December)\s+\d{4}|\d{4}-\d{2}-\d{2})/,
      )
      entries.push({
        filename,
        title,
        first_line_date: dateMatch ? dateMatch[1] : 'unknown',
      })
    } catch {
      entries.push({
        filename,
        title: `(unreadable: ${filename})`,
        first_line_date: 'unknown',
      })
    }
  }

  return { source: 'file', note: null, items: entries }
}

// =============================================================================
// Source 2 — Decision log
// =============================================================================

async function loadDecisionLog(): Promise<OpsContinuitySection<DecisionLogEntry>> {
  let raw: string
  try {
    raw = await fs.readFile(DECISION_LOG_PATH, 'utf8')
  } catch (e) {
    return {
      source: 'stub',
      note:
        e instanceof Error
          ? `decision-log.md not readable: ${e.message}`
          : 'decision-log.md not readable',
      items: [],
    }
  }

  // Split by H2 headings. The format is `## <date> — <title>`.
  const sections = raw.split(/^##\s+/m).slice(1) // drop pre-first chunk
  const entries: DecisionLogEntry[] = []
  for (const section of sections) {
    const firstLineEnd = section.indexOf('\n')
    const heading = (firstLineEnd === -1 ? section : section.slice(0, firstLineEnd)).trim()
    const body = firstLineEnd === -1 ? '' : section.slice(firstLineEnd + 1)

    // Heading shape: "19 April 2026 — Title" or "2026-04-20 — Title" or
    // "DATE - Title" (em-dash, en-dash, or hyphen). Prefer em/en-dash because
    // ISO dates (2026-04-20) contain hyphens that would otherwise split the
    // date itself. Fall back to a whitespace-delimited hyphen last.
    const m =
      heading.match(/^(.*?)\s+—\s+(.*)$/) ||
      heading.match(/^(.*?)\s+–\s+(.*)$/) ||
      heading.match(/^(.*?)\s+-\s+(.*)$/)
    const date = m ? m[1].trim() : 'unknown'
    const title = m ? m[2].trim() : heading

    // Status from the `**Status:**` line, if present.
    const statusMatch = body.match(/^\s*\*\*Status:\*\*\s*(.*?)\s*$/m)
    const status = statusMatch ? statusMatch[1].trim() : 'unknown'

    entries.push({ date, title, status })
  }

  if (entries.length === 0) {
    return {
      source: 'stub',
      note: 'decision-log.md parsed but no entries were found.',
      items: [],
    }
  }

  // Entries are in file order (oldest → newest per handoff). Return the
  // most recent DECISION_CAP, in newest-first order.
  const newestFirst = entries.slice(-DECISION_CAP).reverse()
  return { source: 'file', note: null, items: newestFirst }
}

// =============================================================================
// Source 3 — Knowledge gaps register
// =============================================================================

async function loadKnowledgeGaps(): Promise<OpsContinuitySection<KnowledgeGapEntry>> {
  let raw: string
  try {
    raw = await fs.readFile(KG_REGISTER_PATH, 'utf8')
  } catch (e) {
    return {
      source: 'stub',
      note:
        e instanceof Error
          ? `knowledge-gaps.md not readable: ${e.message}`
          : 'knowledge-gaps.md not readable',
      items: [],
    }
  }

  const sections = raw.split(/^##\s+/m).slice(1)
  const entries: KnowledgeGapEntry[] = []
  for (const section of sections) {
    const firstLineEnd = section.indexOf('\n')
    const heading = (firstLineEnd === -1 ? section : section.slice(0, firstLineEnd)).trim()
    const body = firstLineEnd === -1 ? '' : section.slice(firstLineEnd + 1)

    // Heading shape: "KG1 — Title"
    const m = heading.match(/^(KG\d+)\s*[—–-]\s*(.*)$/i)
    if (!m) continue
    const id = m[1].toUpperCase()
    const title = m[2].trim()

    const reMatch = body.match(/^\s*\*\*Re-explanations:\*\*\s*(.*?)\s*$/m)
    const reexplanations = reMatch ? reMatch[1].trim() : 'unknown'

    entries.push({ id, title, reexplanations })
  }

  if (entries.length === 0) {
    return {
      source: 'stub',
      note:
        'knowledge-gaps.md parsed but no KG# entries were found. Check heading format.',
      items: [],
    }
  }

  // Keep file order (KG1 → KGn). File is small; no truncation.
  return { source: 'file', note: null, items: entries }
}

// =============================================================================
// Source 4 — Compliance register (JSON)
// =============================================================================

interface RawObligation {
  id?: unknown
  obligation?: unknown
  status?: unknown
  next_review_due?: unknown
}

interface RawRegister {
  obligations?: RawObligation[]
}

function str(v: unknown, fallback: string): string {
  return typeof v === 'string' ? v : fallback
}

async function loadCompliance(): Promise<OpsContinuitySection<ComplianceObligationEntry>> {
  let raw: string
  try {
    raw = await fs.readFile(COMPLIANCE_REGISTER_PATH, 'utf8')
  } catch (e) {
    return {
      source: 'stub',
      note:
        e instanceof Error
          ? `compliance_register.json not readable: ${e.message}`
          : 'compliance_register.json not readable',
      items: [],
    }
  }

  let parsed: RawRegister
  try {
    parsed = JSON.parse(raw) as RawRegister
  } catch (e) {
    return {
      source: 'stub',
      note:
        e instanceof Error
          ? `compliance_register.json JSON parse failed: ${e.message}`
          : 'compliance_register.json JSON parse failed',
      items: [],
    }
  }

  const list = Array.isArray(parsed.obligations) ? parsed.obligations : []
  const entries: ComplianceObligationEntry[] = list.map((o) => ({
    id: str(o.id, 'unknown'),
    obligation: str(o.obligation, 'unknown'),
    status: str(o.status, 'unknown'),
    next_review_due:
      typeof o.next_review_due === 'string' ? o.next_review_due : null,
  }))

  if (entries.length === 0) {
    return {
      source: 'stub',
      note: 'compliance_register.json parsed but obligations array is empty.',
      items: [],
    }
  }

  return { source: 'file', note: null, items: entries }
}

// =============================================================================
// Source 5 — D-register (from build-knowledge-extraction)
// =============================================================================

/**
 * Parses the "Decisions NOT Made (and Why)" Markdown table from the build
 * knowledge extraction file. Table shape:
 *
 *   | # | Decision Deferred | Why Not Made | Blocking Condition | Impact of Deferral |
 *   |---|---|---|---|---|
 *   | D1 | ... | ... | ... | ... |
 */
async function loadDRegister(): Promise<OpsContinuitySection<DRegisterEntry>> {
  let raw: string
  try {
    raw = await fs.readFile(D_REGISTER_PATH, 'utf8')
  } catch (e) {
    return {
      source: 'stub',
      note:
        e instanceof Error
          ? `build-knowledge-extraction file not readable: ${e.message}`
          : 'build-knowledge-extraction file not readable',
      items: [],
    }
  }

  // Isolate the Decisions NOT Made section (a subsection under "## 3." —
  // using the heading as the anchor rather than the parent section).
  const sectionMatch = raw.match(
    /###\s+Decisions\s+NOT\s+Made\b[\s\S]*?(?=^##\s+|\Z)/m,
  )
  if (!sectionMatch) {
    return {
      source: 'stub',
      note:
        'Decisions NOT Made section not found in build-knowledge-extraction file.',
      items: [],
    }
  }

  const section = sectionMatch[0]
  const lines = section.split(/\r?\n/)
  const entries: DRegisterEntry[] = []
  for (const line of lines) {
    // Match table rows that begin with a pipe and contain a D# cell.
    if (!/^\s*\|/.test(line)) continue
    if (/^\s*\|\s*-+\s*\|/.test(line)) continue // separator row
    if (/^\s*\|\s*#\s*\|/.test(line)) continue // header row

    const cells = line
      .split('|')
      .slice(1, -1) // drop leading/trailing empty cells
      .map((c) => c.trim())
    if (cells.length < 5) continue
    const id = cells[0]
    if (!/^D\d+$/i.test(id)) continue
    entries.push({
      id: id.toUpperCase(),
      decision_deferred: cells[1],
      why_not_made: cells[2],
      blocking_condition: cells[3],
      impact_of_deferral: cells[4],
    })
  }

  if (entries.length === 0) {
    return {
      source: 'stub',
      note:
        'D-register table parsed but no D# rows found. Check table format.',
      items: [],
    }
  }

  return { source: 'file', note: null, items: entries }
}

// =============================================================================
// Formatter
// =============================================================================

function sectionHeader(title: string, note: string | null): string {
  if (note) return `${title}\nNote: ${note}`
  return title
}

function formatHandoffs(s: OpsContinuitySection<HandoffEntry>): string {
  const header = sectionHeader(
    `Recent close notes (most recent first, last ${HANDOFF_CAP}):`,
    s.note,
  )
  if (s.items.length === 0) return `${header}\n  (none recorded)`
  const body = s.items
    .map(
      (h) =>
        `  - ${h.filename}\n      title: ${h.title}\n      date: ${h.first_line_date}`,
    )
    .join('\n')
  return `${header}\n${body}`
}

function formatDecisions(s: OpsContinuitySection<DecisionLogEntry>): string {
  const header = sectionHeader(
    `Recent decision-log entries (newest first, last ${DECISION_CAP}):`,
    s.note,
  )
  if (s.items.length === 0) return `${header}\n  (none recorded)`
  const body = s.items
    .map((d) => `  - ${d.date} — ${d.title}\n      status: ${d.status}`)
    .join('\n')
  return `${header}\n${body}`
}

function formatKnowledgeGaps(s: OpsContinuitySection<KnowledgeGapEntry>): string {
  const header = sectionHeader('Knowledge Gaps register:', s.note)
  if (s.items.length === 0) return `${header}\n  (none recorded)`
  const body = s.items
    .map(
      (k) => `  - ${k.id} — ${k.title}\n      re-explanations: ${k.reexplanations}`,
    )
    .join('\n')
  return `${header}\n${body}`
}

function formatCompliance(
  s: OpsContinuitySection<ComplianceObligationEntry>,
): string {
  const header = sectionHeader('Compliance register (obligation → status):', s.note)
  if (s.items.length === 0) return `${header}\n  (none recorded)`
  const body = s.items
    .map(
      (o) =>
        `  - ${o.id}: ${o.obligation}\n      status: ${o.status}${
          o.next_review_due ? `  next review: ${o.next_review_due}` : ''
        }`,
    )
    .join('\n')
  return `${header}\n${body}`
}

function formatDRegister(s: OpsContinuitySection<DRegisterEntry>): string {
  const header = sectionHeader(
    'D-register (decisions not yet made):',
    s.note,
  )
  if (s.items.length === 0) return `${header}\n  (none recorded)`
  const body = s.items
    .map(
      (d) =>
        `  - ${d.id}: ${d.decision_deferred}\n      why not made: ${d.why_not_made}\n      blocking: ${d.blocking_condition}\n      impact: ${d.impact_of_deferral}`,
    )
    .join('\n')
  return `${header}\n${body}`
}

function formatBlock(block: Omit<OpsContinuityBlock, 'formatted_context'>): string {
  const header = [
    'OPERATIONAL CONTINUITY — OPS CHANNEL 2',
    'Sources: operations/handoffs/, operations/decision-log.md, ',
    '         operations/knowledge-gaps.md, compliance/compliance_register.json,',
    '         operations/build-knowledge-extraction-2026-04-17.md',
    `As of: ${block.as_of}`,
    '',
    'Treat this block as the record of what has been decided, recorded, and',
    'deferred. Ground R0/R15/R16 answers in these entries. If the founder',
    'asks "what did we decide last session" or "what have we deferred" or',
    '"what KGs are open", name the specific entries here. If a section shows',
    'a Note line, that section failed to load — say so rather than invent.',
    'Do not imply access to prior chat sessions. These files are the only',
    'authoritative record Ops receives.',
  ].join('\n')

  return [
    header,
    '',
    formatHandoffs(block.handoffs),
    '',
    formatDecisions(block.decisions),
    '',
    formatKnowledgeGaps(block.knowledge_gaps),
    '',
    formatCompliance(block.compliance),
    '',
    formatDRegister(block.d_register),
  ].join('\n')
}

// =============================================================================
// Public API
// =============================================================================

/**
 * Loads all five continuity sources in parallel. Each source fails
 * independently — a failure in one section does not prevent the others
 * from rendering. Returns an injection-ready `formatted_context` string.
 */
export async function getOpsContinuityState(): Promise<OpsContinuityBlock> {
  const [handoffs, decisions, knowledge_gaps, compliance, d_register] =
    await Promise.all([
      loadHandoffs().catch(
        (e): OpsContinuitySection<HandoffEntry> => ({
          source: 'stub',
          note:
            e instanceof Error
              ? `handoffs loader threw: ${e.message}`
              : 'handoffs loader threw an unknown error',
          items: [],
        }),
      ),
      loadDecisionLog().catch(
        (e): OpsContinuitySection<DecisionLogEntry> => ({
          source: 'stub',
          note:
            e instanceof Error
              ? `decision-log loader threw: ${e.message}`
              : 'decision-log loader threw an unknown error',
          items: [],
        }),
      ),
      loadKnowledgeGaps().catch(
        (e): OpsContinuitySection<KnowledgeGapEntry> => ({
          source: 'stub',
          note:
            e instanceof Error
              ? `knowledge-gaps loader threw: ${e.message}`
              : 'knowledge-gaps loader threw an unknown error',
          items: [],
        }),
      ),
      loadCompliance().catch(
        (e): OpsContinuitySection<ComplianceObligationEntry> => ({
          source: 'stub',
          note:
            e instanceof Error
              ? `compliance loader threw: ${e.message}`
              : 'compliance loader threw an unknown error',
          items: [],
        }),
      ),
      loadDRegister().catch(
        (e): OpsContinuitySection<DRegisterEntry> => ({
          source: 'stub',
          note:
            e instanceof Error
              ? `d-register loader threw: ${e.message}`
              : 'd-register loader threw an unknown error',
          items: [],
        }),
      ),
    ])

  const block: Omit<OpsContinuityBlock, 'formatted_context'> = {
    as_of: new Date().toISOString(),
    handoffs,
    decisions,
    knowledge_gaps,
    compliance,
    d_register,
  }

  return {
    ...block,
    formatted_context: formatBlock(block),
  }
}
