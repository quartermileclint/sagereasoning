/**
 * ops-continuity-state.ts — Channel 2 loader for the Sage-Ops chat persona.
 *
 * Reads seven hand-maintained continuity sources at request time and returns
 * a structured block plus a ready-to-inject `formatted_context` string.
 *
 * Sources
 *   1. operations/handoffs/*-close.md and session-N-close.md   (recent close notes)
 *   2. operations/decision-log.md                               (recent decisions)
 *   3. operations/knowledge-gaps.md                             (KG register)
 *   4. compliance/compliance_register.json                       (active obligations)
 *   5. operations/build-knowledge-extraction-2026-04-17.md      (D-register, decisions not made)
 *   6. website/public/component-registry.json                    (capability inventory summary)
 *   7. website/public/flows.json                                 (flow tracer summary)
 *
 * Computed cross-cut indices (Option B, 21 April 2026)
 *   Derived from the sources above; no new files. Live on the existing
 *   sections so the 7-source shape is preserved.
 *   - Source 6 gains `by_journey`: non-Ready components grouped by journey
 *     (paid_api / both / free_tier / internal / unknown). Lets Ops answer
 *     "what's blocking the paid API from launch?" without re-slicing.
 *   - Source 7 gains `components` per flow (deduplicated, order-preserving
 *     component list per flow) and `by_component` (reverse map: for each
 *     node id that appears in any flow, the flow keys that reference it).
 *     Lets Ops answer "which flows touch component X?" and "which
 *     components participate in flow Y?" directly.
 *
 * Independent failure handling
 *   Each source is loaded and parsed in its own try/catch. A failure in one
 *   source produces a self-disclosing stub for that section only — the
 *   remaining sources still render. Silent fallback is worse than a
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
 *     - Capability inventory: totals + full non-Ready list (partial + not-ready)
 *     - Flow tracer: totals + flow names/categories + step node-ids only
 *
 * Read-only. Does not import from sage-mentor/. Does not write.
 *
 * Injection point: website/src/app/api/founder/hub/route.ts `case 'ops'`.
 *
 * Risk classification: Standard (0d-ii). Seven read paths, non-safety-
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

// Capability inventory summary (Source 6).
// Totals live at the top; non-Ready items enumerate the actionable list.
export interface CapabilityNonReadyEntry {
  id: string
  name: string
  agentReady: string // 'partial' | 'not-ready'
  blocker_or_notes: string // component.blocker if present, else component.notes, else ''
  path: string // file/folder location
  journey: string // 'free_tier' | 'paid_api' | 'both' | 'internal' | 'unknown'
}

export interface CapabilityInventoryTotals {
  total: number
  ready: number
  partial: number
  not_ready: number
  na: number
}

// Flow tracer summary (Source 7).
// Step arrays carry node-ids only — full per-step descriptions live in
// flows.json and the Architecture Map; surfacing only ids keeps the loader
// budget in check.
export interface FlowTracerStep {
  id: string
}

export interface FlowTracerEntry {
  key: string
  name: string
  category: string
  color: string
  steps: FlowTracerStep[]
  // Deduplicated, order-preserving component-id list for this flow.
  // Computed from `steps`; answers "which components participate in flow X?"
  // without Ops having to de-dup the step chain mentally.
  components: string[]
}

export interface FlowTracerTotals {
  flow_count: number
  node_count: number
}

export interface OpsContinuitySection<T> {
  source: 'file' | 'stub'
  note: string | null // set when source === 'stub' to explain why
  items: T[]
}

// Capability inventory has totals alongside the list; extend the shape.
export interface CapabilityInventorySection
  extends OpsContinuitySection<CapabilityNonReadyEntry> {
  totals: CapabilityInventoryTotals | null
  // Computed cross-cut: non-Ready components grouped by journey field.
  // Keys are 'paid_api' | 'both' | 'free_tier' | 'internal' | 'unknown'.
  // Null when the source failed to load.
  by_journey: Record<string, CapabilityNonReadyEntry[]> | null
}

// Flow tracer has totals alongside the list; extend the shape.
export interface FlowTracerSection
  extends OpsContinuitySection<FlowTracerEntry> {
  totals: FlowTracerTotals | null
  // Reverse map: node-id → flow-keys that reference it. Only includes nodes
  // that actually appear in at least one flow path (not every node in the
  // registry). Answers "which flows touch component X?" without scanning
  // the full step-chain list. Null when the source failed to load.
  by_component: Record<string, string[]> | null
}

export interface OpsContinuityBlock {
  as_of: string
  handoffs: OpsContinuitySection<HandoffEntry>
  decisions: OpsContinuitySection<DecisionLogEntry>
  knowledge_gaps: OpsContinuitySection<KnowledgeGapEntry>
  compliance: OpsContinuitySection<ComplianceObligationEntry>
  d_register: OpsContinuitySection<DRegisterEntry>
  capability_inventory: CapabilityInventorySection
  flow_tracer: FlowTracerSection
  formatted_context: string
}

// =============================================================================
// Paths
// =============================================================================

// Repo root. On Vercel serverless, process.cwd() resolves to /var/task/website
// (the Next.js project dir), not the repo root (/var/task). Parent traversal
// reaches the repo root where operations/ and compliance/ live. Confirmed by
// diagnostic probe on 21 April 2026 (all parent-traversal paths resolved
// successfully). Same fix applied to Tech C1+C2 and Growth C1+C2 loaders.
const ROOT = path.join(process.cwd(), '..')
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
const COMPONENT_REGISTRY_PATH = path.join(
  ROOT,
  'website',
  'public',
  'component-registry.json',
)
const FLOWS_PATH = path.join(ROOT, 'website', 'public', 'flows.json')

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
// Source 6 — Capability inventory (component-registry.json)
// =============================================================================

interface RawComponent {
  id?: unknown
  name?: unknown
  type?: unknown
  status?: unknown
  path?: unknown
  desc?: unknown
  notes?: unknown
  blocker?: unknown
  humanReady?: unknown
  agentReady?: unknown
  journey?: unknown
}

interface RawRegistry {
  components?: RawComponent[]
  totalComponents?: unknown
}

function pickBlockerOrNotes(c: RawComponent): string {
  const blocker = typeof c.blocker === 'string' ? c.blocker.trim() : ''
  if (blocker) return blocker
  const notes = typeof c.notes === 'string' ? c.notes.trim() : ''
  return notes
}

async function loadCapabilityInventory(): Promise<CapabilityInventorySection> {
  let raw: string
  try {
    raw = await fs.readFile(COMPONENT_REGISTRY_PATH, 'utf8')
  } catch (e) {
    return {
      source: 'stub',
      note:
        e instanceof Error
          ? `component-registry.json not readable: ${e.message}`
          : 'component-registry.json not readable',
      items: [],
      totals: null,
      by_journey: null,
    }
  }

  let parsed: RawRegistry
  try {
    parsed = JSON.parse(raw) as RawRegistry
  } catch (e) {
    return {
      source: 'stub',
      note:
        e instanceof Error
          ? `component-registry.json JSON parse failed: ${e.message}`
          : 'component-registry.json JSON parse failed',
      items: [],
      totals: null,
      by_journey: null,
    }
  }

  const list = Array.isArray(parsed.components) ? parsed.components : []
  if (list.length === 0) {
    return {
      source: 'stub',
      note: 'component-registry.json parsed but components array is empty.',
      items: [],
      totals: null,
      by_journey: null,
    }
  }

  // Totals by agentReady.
  const totals: CapabilityInventoryTotals = {
    total: list.length,
    ready: 0,
    partial: 0,
    not_ready: 0,
    na: 0,
  }
  for (const c of list) {
    const v = typeof c.agentReady === 'string' ? c.agentReady : 'na'
    if (v === 'ready') totals.ready++
    else if (v === 'partial') totals.partial++
    else if (v === 'not-ready') totals.not_ready++
    else totals.na++
  }

  // Non-Ready items (partial + not-ready).
  const nonReady: CapabilityNonReadyEntry[] = []
  for (const c of list) {
    const ar = typeof c.agentReady === 'string' ? c.agentReady : 'na'
    if (ar !== 'partial' && ar !== 'not-ready') continue
    nonReady.push({
      id: str(c.id, 'unknown'),
      name: str(c.name, 'unknown'),
      agentReady: ar,
      blocker_or_notes: pickBlockerOrNotes(c),
      path: str(c.path, ''),
      journey: typeof c.journey === 'string' ? c.journey : 'unknown',
    })
  }

  // Computed cross-cut: group non-Ready items by journey field. Keys are
  // 'paid_api' | 'both' | 'free_tier' | 'internal' | 'unknown'; any journey
  // value not in that set still groups under its own key (we don't silently
  // discard unexpected values). Purpose: lets Ops answer revenue-impact
  // questions ("what's blocking the paid API from launch?") without having
  // to re-slice the main non-Ready list.
  const by_journey: Record<string, CapabilityNonReadyEntry[]> = {}
  for (const entry of nonReady) {
    const j = entry.journey || 'unknown'
    if (!by_journey[j]) by_journey[j] = []
    by_journey[j].push(entry)
  }

  return { source: 'file', note: null, items: nonReady, totals, by_journey }
}

// =============================================================================
// Source 7 — Flow tracer (flows.json)
// =============================================================================

interface RawFlowStep {
  id?: unknown
}

interface RawFlow {
  name?: unknown
  category?: unknown
  color?: unknown
  path?: unknown
}

interface RawFlowsFile {
  nodes?: Record<string, unknown>
  flows?: Record<string, RawFlow>
}

async function loadFlowTracer(): Promise<FlowTracerSection> {
  let raw: string
  try {
    raw = await fs.readFile(FLOWS_PATH, 'utf8')
  } catch (e) {
    return {
      source: 'stub',
      note:
        e instanceof Error
          ? `flows.json not readable: ${e.message}`
          : 'flows.json not readable',
      items: [],
      totals: null,
      by_component: null,
    }
  }

  let parsed: RawFlowsFile
  try {
    parsed = JSON.parse(raw) as RawFlowsFile
  } catch (e) {
    return {
      source: 'stub',
      note:
        e instanceof Error
          ? `flows.json JSON parse failed: ${e.message}`
          : 'flows.json JSON parse failed',
      items: [],
      totals: null,
      by_component: null,
    }
  }

  const nodesObj = parsed.nodes && typeof parsed.nodes === 'object' ? parsed.nodes : {}
  const flowsObj = parsed.flows && typeof parsed.flows === 'object' ? parsed.flows : {}

  const flowKeys = Object.keys(flowsObj)
  if (flowKeys.length === 0) {
    return {
      source: 'stub',
      note: 'flows.json parsed but flows object is empty.',
      items: [],
      totals: { flow_count: 0, node_count: Object.keys(nodesObj).length },
      by_component: null,
    }
  }

  const entries: FlowTracerEntry[] = []
  // Reverse map for index 2: node-id → flow-keys that reference it.
  // Populated as each flow's step chain is walked. Only nodes that appear
  // in at least one flow path end up as keys; isolated nodes from
  // nodesObj are not included (the reverse map's purpose is "which
  // flows touch X?", and an unused node has no answer to give).
  const by_component: Record<string, string[]> = {}

  for (const key of flowKeys) {
    const f = flowsObj[key]
    const stepsArr = Array.isArray(f.path) ? f.path : []
    const steps: FlowTracerStep[] = stepsArr.map((s) => {
      const rs = s as RawFlowStep
      return { id: typeof rs.id === 'string' ? rs.id : 'unknown' }
    })

    // Index 3: deduplicated, order-preserving component list for this flow.
    // A node visited twice in the same chain (e.g. a router re-entered)
    // appears once. Order is first-appearance.
    const seen = new Set<string>()
    const components: string[] = []
    for (const st of steps) {
      if (seen.has(st.id)) continue
      seen.add(st.id)
      components.push(st.id)
      // Populate the reverse map as we go. Guard against duplicate flow
      // entries for the same component in the same flow — the Set above
      // already ensures we only record each component once per flow.
      if (!by_component[st.id]) by_component[st.id] = []
      by_component[st.id].push(key)
    }

    entries.push({
      key,
      name: typeof f.name === 'string' ? f.name : key,
      category: typeof f.category === 'string' ? f.category : 'uncategorised',
      color: typeof f.color === 'string' ? f.color : '',
      steps,
      components,
    })
  }

  const totals: FlowTracerTotals = {
    flow_count: entries.length,
    node_count: Object.keys(nodesObj).length,
  }

  return {
    source: 'file',
    note: null,
    items: entries,
    totals,
    by_component,
  }
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

// Stable render order for journey groups. Revenue-critical first
// (paid_api, both), then free_tier, then internal, then unknown/other.
const JOURNEY_ORDER = ['paid_api', 'both', 'free_tier', 'internal', 'unknown']

function compareJourneyKeys(a: string, b: string): number {
  const ai = JOURNEY_ORDER.indexOf(a)
  const bi = JOURNEY_ORDER.indexOf(b)
  // Known keys sort by the order above. Any unknown key sorts after all
  // known keys, and between unknowns alphabetically.
  const aRank = ai === -1 ? JOURNEY_ORDER.length : ai
  const bRank = bi === -1 ? JOURNEY_ORDER.length : bi
  if (aRank !== bRank) return aRank - bRank
  return a.localeCompare(b)
}

function truncate(text: string, max: number): string {
  if (text.length <= max) return text
  return text.slice(0, max) + '…'
}

function formatBlockersByJourney(s: CapabilityInventorySection): string {
  // Skip the subsection entirely when source was a stub (main section's
  // Note already explains the failure). Also skip when the main list is
  // empty — nothing to group.
  if (!s.by_journey || s.items.length === 0) return ''

  const journeys = Object.keys(s.by_journey).sort(compareJourneyKeys)
  const header =
    'Blockers by journey (non-Ready components, grouped; paid_api/both = revenue-critical):'
  if (journeys.length === 0) return `${header}\n  (none grouped)`

  const body = journeys
    .map((j) => {
      const items = s.by_journey![j]
      const lines = items
        .map((c) => {
          const snippet = c.blocker_or_notes
            ? `: ${truncate(c.blocker_or_notes, 80)}`
            : ''
          return `    - ${c.id} [${c.agentReady}]${snippet}`
        })
        .join('\n')
      return `  ${j} (${items.length}):\n${lines}`
    })
    .join('\n')
  return `${header}\n${body}`
}

function formatCapabilityInventory(s: CapabilityInventorySection): string {
  // Totals appear on the header line — they anchor the rest of the section.
  const totalsLine = s.totals
    ? `(total ${s.totals.total}: ready ${s.totals.ready}, partial ${s.totals.partial}, not-ready ${s.totals.not_ready}, n/a ${s.totals.na})`
    : '(totals unavailable)'
  const header = sectionHeader(
    `Capability inventory — non-Ready items ${totalsLine}:`,
    s.note,
  )
  if (s.items.length === 0) return `${header}\n  (none recorded)`
  const body = s.items
    .map((c) => {
      const blockerLine = c.blocker_or_notes
        ? `\n      blocker/notes: ${c.blocker_or_notes}`
        : ''
      const pathLine = c.path ? `\n      path: ${c.path}` : ''
      return `  - ${c.id} — ${c.name}\n      agentReady: ${c.agentReady}  journey: ${c.journey}${blockerLine}${pathLine}`
    })
    .join('\n')

  const byJourneyBlock = formatBlockersByJourney(s)
  const suffix = byJourneyBlock ? `\n\n${byJourneyBlock}` : ''
  return `${header}\n${body}${suffix}`
}

function formatFlowsByComponent(s: FlowTracerSection): string {
  // Skip the subsection when unavailable or empty. Parent section's Note
  // already covers the failure case.
  if (!s.by_component) return ''
  const nodeIds = Object.keys(s.by_component).sort()
  if (nodeIds.length === 0) return ''

  const header =
    'Flows by component (reverse map; only nodes that appear in at least one flow):'
  const body = nodeIds
    .map((id) => {
      const flowKeys = s.by_component![id]
      return `  - ${id} → ${flowKeys.join(', ')}`
    })
    .join('\n')
  return `${header}\n${body}`
}

function formatFlowTracer(s: FlowTracerSection): string {
  const totalsLine = s.totals
    ? `(${s.totals.flow_count} flows across ${s.totals.node_count} nodes)`
    : '(totals unavailable)'
  const header = sectionHeader(
    `Flow tracer summary ${totalsLine}:`,
    s.note,
  )
  if (s.items.length === 0) return `${header}\n  (none recorded)`
  const body = s.items
    .map((f) => {
      const stepList =
        f.steps.length === 0
          ? '(no steps)'
          : f.steps.map((st) => st.id).join(' → ')
      // Components: deduplicated, order-preserving list for this flow.
      const componentList =
        f.components.length === 0
          ? '(none)'
          : f.components.join(', ')
      return `  - ${f.key} — ${f.name}\n      category: ${f.category}  steps: ${stepList}\n      components (${f.components.length}): ${componentList}`
    })
    .join('\n')

  const byComponentBlock = formatFlowsByComponent(s)
  const suffix = byComponentBlock ? `\n\n${byComponentBlock}` : ''
  return `${header}\n${body}${suffix}`
}

function formatBlock(block: Omit<OpsContinuityBlock, 'formatted_context'>): string {
  const header = [
    'OPERATIONAL CONTINUITY — OPS CHANNEL 2',
    'Sources: operations/handoffs/, operations/decision-log.md, ',
    '         operations/knowledge-gaps.md, compliance/compliance_register.json,',
    '         operations/build-knowledge-extraction-2026-04-17.md,',
    '         website/public/component-registry.json,',
    '         website/public/flows.json',
    `As of: ${block.as_of}`,
    '',
    'Treat this block as the record of what has been decided, recorded, and',
    'deferred, plus the current capability and flow inventories. Ground',
    'R0/R15/R16 answers in these entries. If the founder asks "what did we',
    'decide last session", "what have we deferred", "what KGs are open",',
    '"what\'s blocking launch", or "what flows touch component X", name the',
    'specific entries here. If a section shows a Note line, that section',
    'failed to load — say so rather than invent. Do not imply access to',
    'prior chat sessions. These files are the only authoritative record',
    'Ops receives.',
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
    '',
    formatCapabilityInventory(block.capability_inventory),
    '',
    formatFlowTracer(block.flow_tracer),
  ].join('\n')
}

// =============================================================================
// Public API
// =============================================================================

/**
 * Loads all seven continuity sources in parallel. Each source fails
 * independently — a failure in one section does not prevent the others
 * from rendering. Returns an injection-ready `formatted_context` string.
 */
export async function getOpsContinuityState(): Promise<OpsContinuityBlock> {
  const [
    handoffs,
    decisions,
    knowledge_gaps,
    compliance,
    d_register,
    capability_inventory,
    flow_tracer,
  ] = await Promise.all([
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
    loadCapabilityInventory().catch(
      (e): CapabilityInventorySection => ({
        source: 'stub',
        note:
          e instanceof Error
            ? `capability-inventory loader threw: ${e.message}`
            : 'capability-inventory loader threw an unknown error',
        items: [],
        totals: null,
        by_journey: null,
      }),
    ),
    loadFlowTracer().catch(
      (e): FlowTracerSection => ({
        source: 'stub',
        note:
          e instanceof Error
            ? `flow-tracer loader threw: ${e.message}`
            : 'flow-tracer loader threw an unknown error',
        items: [],
        totals: null,
        by_component: null,
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
    capability_inventory,
    flow_tracer,
  }

  return {
    ...block,
    formatted_context: formatBlock(block),
  }
}
