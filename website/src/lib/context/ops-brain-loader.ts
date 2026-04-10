/**
 * ops-brain-loader.ts — Domain-specific Sage-Ops Brain context builder.
 *
 * Loads compiled Ops Brain data and assembles context blocks tailored to the
 * operational domain being invoked. Follows the Stoic Brain loader pattern:
 * domain-specific loaders → composite builder by depth level.
 *
 * Token budgets:
 *   - Per domain: 400-800 tokens
 *   - Quick depth (2 domains): ~1500 tokens ceiling
 *   - Standard depth (4 domains): ~3000 tokens ceiling
 *   - Deep depth (6 domains): ~5000 tokens ceiling
 *
 * Usage:
 *   const context = getOpsBrainContext('standard')
 *   // → Returns combined context for process, financial, compliance, analytics
 */

import {
  PROCESS_CONTEXT,
  FINANCIAL_CONTEXT,
  COMPLIANCE_CONTEXT,
  PEOPLE_CONTEXT,
  ANALYTICS_CONTEXT,
  VENDOR_CONTEXT,
  OPS_BRAIN_FOUNDATIONS,
} from '@/data/ops-brain-compiled'

type OpsDepth = 'quick' | 'standard' | 'deep'

// =============================================================================
// DOMAIN-SPECIFIC CONTEXT BUILDERS
// =============================================================================

/**
 * Context for Domain 1 — Process & Workflow.
 * Session protocols, change classification, workflow states.
 */
export function getProcessContext(): string {
  const states = PROCESS_CONTEXT.workflow_states
    .map(s => `  ${s.id}: ${s.description}`)
    .join('\n')

  const changes = PROCESS_CONTEXT.change_classification
    .map(c => `  ${c.level}: ${c.definition} → ${c.protocol}`)
    .join('\n')

  return `SAGE-OPS BRAIN — PROCESS & WORKFLOW
Core: ${PROCESS_CONTEXT.core_principle}

Status Vocabulary:
${states}

Change Risk Classification:
${changes}

Session Protocol: ${PROCESS_CONTEXT.session_protocol.open} At close: ${PROCESS_CONTEXT.session_protocol.close}`
}

/**
 * Context for Domain 2 — Financial Metrics.
 * Key SaaS metrics, cost health thresholds, AU tax basics.
 */
export function getFinancialContext(): string {
  const metrics = FINANCIAL_CONTEXT.key_metrics
    .map(m => `  ${m.id} (${m.name}): ${m.formula}`)
    .join('\n')

  const alerts = FINANCIAL_CONTEXT.cost_health_thresholds.alert_triggers
    .map(a => `  - ${a}`)
    .join('\n')

  return `SAGE-OPS BRAIN — FINANCIAL METRICS
Core: ${FINANCIAL_CONTEXT.core_principle}

Key Metrics:
${metrics}

Cost Health Rule: ${FINANCIAL_CONTEXT.cost_health_thresholds.rule}
Ops Cost Cap: ${FINANCIAL_CONTEXT.cost_health_thresholds.ops_cost_cap}
Alert Triggers:
${alerts}

Entity: ${FINANCIAL_CONTEXT.startup_financial_basics.entity_type}
Note: ${FINANCIAL_CONTEXT.startup_financial_basics.note}`
}

/**
 * Context for Domain 3 — Compliance & Risk.
 * Active R-rules, legal prep areas, audit schedule.
 */
export function getComplianceContext(): string {
  const rules = COMPLIANCE_CONTEXT.active_rules
    .map(r => `  ${r.id} (${r.name}): ${r.requirements.join('; ')} [${r.status}]`)
    .join('\n')

  const legal = COMPLIANCE_CONTEXT.legal_prep_areas
    .map(l => `  ${l.area}: ${l.status} [${l.phase}]`)
    .join('\n')

  return `SAGE-OPS BRAIN — COMPLIANCE & RISK
Core: ${COMPLIANCE_CONTEXT.core_principle}

Active Rules:
${rules}

Legal Preparation:
${legal}

Audit: ${COMPLIANCE_CONTEXT.audit_schedule.frequency} Method: ${COMPLIANCE_CONTEXT.audit_schedule.method}`
}

/**
 * Context for Domain 4 — People & HR (solo founder phase).
 */
export function getPeopleContext(): string {
  const solo = PEOPLE_CONTEXT.solo_founder_management
  const triggers = PEOPLE_CONTEXT.first_hire_readiness.triggers
    .map(t => `  - ${t}`)
    .join('\n')

  return `SAGE-OPS BRAIN — PEOPLE & ENERGY
Core: ${PEOPLE_CONTEXT.core_principle}

Solo Founder Management:
  Energy: ${solo.energy_management}
  Skills: ${solo.skill_development}
  Boundaries: ${solo.boundaries}

First Hire Triggers:
${triggers}
Note: ${PEOPLE_CONTEXT.first_hire_readiness.note}`
}

/**
 * Context for Domain 5 — Product Metrics & Analytics.
 */
export function getAnalyticsContext(): string {
  const p0 = ANALYTICS_CONTEXT.phase_metrics.p0_foundations.primary.join('; ')
  const launch = ANALYTICS_CONTEXT.phase_metrics.p6_launch.primary.join('; ')

  const events = ANALYTICS_CONTEXT.analytics_events_tracked
    .map(e => `  - ${e}`)
    .join('\n')

  return `SAGE-OPS BRAIN — ANALYTICS & METRICS
Core: ${ANALYTICS_CONTEXT.core_principle}

Current Phase (P0) Primary Metrics: ${p0}
Launch Phase (P6) Primary Metrics: ${launch}

Analytics Events Currently Tracked:
${events}`
}

/**
 * Context for Domain 6 — Vendor & Infrastructure.
 */
export function getVendorContext(): string {
  const stack = VENDOR_CONTEXT.current_stack
    .map(v => `  ${v.vendor} (${v.role}): ${v.cost_model}. Migration: ${v.migration_path}`)
    .join('\n')

  return `SAGE-OPS BRAIN — VENDOR & INFRASTRUCTURE
Core: ${VENDOR_CONTEXT.core_principle}

Current Stack:
${stack}

Cost Monitoring: ${VENDOR_CONTEXT.cost_monitoring.method}
LLM-Specific: ${VENDOR_CONTEXT.cost_monitoring.llm_specific}`
}

// =============================================================================
// COMPOSITE CONTEXT BUILDER — Returns combined context for a given depth
// =============================================================================

/**
 * Domain-to-loader mapping.
 */
const DOMAIN_LOADERS: Record<string, () => string> = {
  process: getProcessContext,
  financial: getFinancialContext,
  compliance: getComplianceContext,
  people: getPeopleContext,
  analytics: getAnalyticsContext,
  vendor: getVendorContext,
}

/**
 * Which domains are included at each depth level.
 */
const DEPTH_DOMAINS: Record<OpsDepth, string[]> = {
  quick: ['process', 'financial'],
  standard: ['process', 'financial', 'compliance', 'analytics'],
  deep: ['process', 'financial', 'compliance', 'people', 'analytics', 'vendor'],
}

/**
 * Get combined Sage-Ops Brain context for a given depth level.
 *
 * @param depth - 'quick' | 'standard' | 'deep'
 * @returns Formatted context string ready for system prompt injection
 */
export function getOpsBrainContext(depth: OpsDepth): string {
  const domains = DEPTH_DOMAINS[depth]
  const sections = domains
    .map(d => {
      const loader = DOMAIN_LOADERS[d]
      return loader ? loader() : ''
    })
    .filter(Boolean)

  const foundations = `SAGE-OPS BRAIN FOUNDATIONS:
${OPS_BRAIN_FOUNDATIONS.core_premise}
Operating principle: ${OPS_BRAIN_FOUNDATIONS.operating_principle}
Four operational virtues: ${Object.values(OPS_BRAIN_FOUNDATIONS.four_operational_virtues).map(v => `${v.name} (${v.stoic_parallel})`).join(', ')}`

  return [foundations, ...sections].join('\n\n---\n\n')
}

/**
 * Get Sage-Ops Brain context for specific domains.
 *
 * @param domains - Array of domain IDs to include
 * @returns Formatted context string
 */
export function getOpsBrainContextForDomains(domains: string[]): string {
  const sections = domains
    .map(d => {
      const loader = DOMAIN_LOADERS[d]
      return loader ? loader() : ''
    })
    .filter(Boolean)

  return sections.join('\n\n---\n\n')
}
