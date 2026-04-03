import type { Metadata } from 'next'
import { SKILL_REGISTRY } from '@/lib/skill-registry'

export const metadata: Metadata = {
  title: 'Skill Marketplace — SageReasoning',
  description: 'Browse sage skills — domain-specific reasoning evaluation tools built on the sage-reason engine. Decision analysis, negotiation, coaching, governance, and more.',
}

/* ── Skill category mapping ─────────────────────────────────────────── */
type Category = {
  label: string
  description: string
  ids: string[]
}

const CATEGORIES: Category[] = [
  {
    label: 'Core Evaluation',
    description: 'Foundation skills for scoring, guarding, and iterating on decisions.',
    ids: ['sage-score', 'sage-guard', 'sage-iterate', 'sage-decide', 'sage-audit', 'sage-converse', 'sage-scenario', 'sage-reflect', 'sage-profile', 'sage-diagnose', 'sage-context'],
  },
  {
    label: 'Decision Analysis',
    description: 'Evaluate strategic decisions before, during, and after execution.',
    ids: ['sage-premortem', 'sage-invest', 'sage-pivot', 'sage-prioritise'],
  },
  {
    label: 'Interpersonal',
    description: 'Reasoning evaluation for negotiations, alignment, conflict, and coaching.',
    ids: ['sage-negotiate', 'sage-align', 'sage-resolve', 'sage-coach'],
  },
  {
    label: 'Reflection',
    description: 'Deep reasoning analysis for retrospectives, identity, and personal growth.',
    ids: ['sage-retro', 'sage-identity'],
  },
  {
    label: 'Governance',
    description: 'Institutional decision-making, compliance, moderation, and education.',
    ids: ['sage-govern', 'sage-compliance', 'sage-moderate', 'sage-educate'],
  },
]

/* ── Depth badge ────────────────────────────────────────────────────── */
function DepthBadge({ count }: { count: number }) {
  const label = count <= 3 ? 'Quick' : count <= 5 ? 'Standard' : 'Deep'
  const color = count <= 3 ? 'bg-green-100 text-green-800' : count <= 5 ? 'bg-blue-100 text-blue-800' : 'bg-purple-100 text-purple-800'
  return (
    <span className={`inline-block text-xs px-2 py-0.5 rounded font-medium ${color}`}>
      {label} ({count} mechanisms)
    </span>
  )
}

/* ── Skill card ─────────────────────────────────────────────────────── */
function SkillCard({ skill }: { skill: typeof SKILL_REGISTRY[number] }) {
  return (
    <div className="border border-sage-200 rounded-lg p-5 hover:border-sage-400 transition-colors">
      <div className="flex items-start justify-between mb-2">
        <h3 className="font-display text-lg font-semibold text-sage-900">{skill.name}</h3>
        <DepthBadge count={skill.mechanism_count} />
      </div>
      <p className="text-sage-700 text-sm mb-3">{skill.outcome}</p>
      <div className="flex items-center gap-4 text-xs text-sage-500">
        <span>{skill.cost_speed}</span>
        {skill.auth_required && <span className="px-1.5 py-0.5 bg-sage-100 rounded">Auth required</span>}
        {!skill.auth_required && <span className="px-1.5 py-0.5 bg-green-50 text-green-700 rounded">No auth</span>}
      </div>
      {skill.chains_to.length > 0 && (
        <div className="mt-3 text-xs text-sage-500">
          Chains to: {skill.chains_to.join(', ')}
        </div>
      )}
    </div>
  )
}

/* ── Main page ──────────────────────────────────────────────────────── */
export default function MarketplacePage() {
  const tier2Skills = SKILL_REGISTRY.filter(s => s.tier === 'tier2_evaluation')

  return (
    <div className="max-w-5xl mx-auto px-6 py-16 font-body text-sage-800">
      <div className="mb-12">
        <h1 className="font-display text-3xl font-medium text-sage-900 mb-3">Skill Marketplace</h1>
        <p className="text-sage-600 max-w-2xl">
          Domain-specific reasoning evaluation tools built on the sage-reason engine.
          Each skill applies Stoic philosophical mechanisms to a specific context — from
          investment decisions to team alignment to governance.
        </p>
        <div className="mt-4 flex flex-wrap gap-4 text-sm text-sage-500">
          <span>{tier2Skills.length} skills available</span>
          <span>|</span>
          <span>Free tiers per skill (25–500 calls/month)</span>
          <span>|</span>
          <span>No credit card required</span>
        </div>
      </div>

      {/* Free tier summary */}
      <div className="mb-10 p-5 bg-white/60 border border-sage-200 rounded-lg">
        <h2 className="font-display text-lg font-semibold text-sage-900 mb-3">
          Free Tier Allowances
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="text-center p-3 bg-sage-50 rounded border border-sage-200">
            <div className="font-display font-bold text-sage-800 text-lg">500/mo</div>
            <div className="text-xs text-sage-500">sage-guard</div>
          </div>
          <div className="text-center p-3 bg-sage-50 rounded border border-sage-200">
            <div className="font-display font-bold text-sage-800 text-lg">100/mo</div>
            <div className="text-xs text-sage-500">Evaluation skills</div>
          </div>
          <div className="text-center p-3 bg-sage-50 rounded border border-sage-200">
            <div className="font-display font-bold text-sage-800 text-lg">50/mo</div>
            <div className="text-xs text-sage-500">Marketplace skills</div>
          </div>
          <div className="text-center p-3 bg-sage-50 rounded border border-sage-200">
            <div className="font-display font-bold text-sage-800 text-lg">25/mo</div>
            <div className="text-xs text-sage-500">Premium skills</div>
          </div>
        </div>
        <p className="text-xs text-sage-500 mt-3">
          sage-context is always free and unlimited. See <a href="/pricing" className="underline hover:text-sage-700">full pricing</a> for details.
        </p>
      </div>

      {/* Engine callout */}
      <div className="mb-10 p-5 bg-sage-50 border border-sage-200 rounded-lg">
        <h2 className="font-display text-lg font-semibold text-sage-900 mb-2">
          All skills are powered by sage-reason
        </h2>
        <p className="text-sage-700 text-sm">
          Every marketplace skill calls the sage-reason engine internally with domain-specific
          context. You can also call sage-reason directly at <code className="text-sage-600 bg-white px-1 rounded">/api/reason</code> with
          your own context for maximum flexibility.
        </p>
        <div className="mt-3 grid grid-cols-3 gap-3">
          <div className="text-center p-2 bg-white rounded border border-sage-200">
            <div className="text-xs text-sage-500">Quick</div>
            <div className="font-display font-semibold text-sage-800">3 mechanisms</div>
            <div className="text-xs text-sage-500">~$0.18, ~2s</div>
          </div>
          <div className="text-center p-2 bg-white rounded border border-sage-200">
            <div className="text-xs text-sage-500">Standard</div>
            <div className="font-display font-semibold text-sage-800">5 mechanisms</div>
            <div className="text-xs text-sage-500">~$0.18, ~3s</div>
          </div>
          <div className="text-center p-2 bg-white rounded border border-sage-200">
            <div className="text-xs text-sage-500">Deep</div>
            <div className="font-display font-semibold text-sage-800">6 mechanisms</div>
            <div className="text-xs text-sage-500">~$0.18, ~4s</div>
          </div>
        </div>
      </div>

      {/* Category sections */}
      {CATEGORIES.map(category => {
        const skills = category.ids
          .map(id => SKILL_REGISTRY.find(s => s.id === id))
          .filter((s): s is typeof SKILL_REGISTRY[number] => s !== undefined)

        if (skills.length === 0) return null

        return (
          <section key={category.label} className="mb-12">
            <h2 className="font-display text-xl font-semibold text-sage-900 mb-1">{category.label}</h2>
            <p className="text-sage-600 text-sm mb-4">{category.description}</p>
            <div className="grid md:grid-cols-2 gap-4">
              {skills.map(skill => (
                <SkillCard key={skill.id} skill={skill} />
              ))}
            </div>
          </section>
        )
      })}

      {/* API access callout */}
      <div className="mt-12 p-5 border border-sage-200 rounded-lg">
        <h2 className="font-display text-lg font-semibold text-sage-900 mb-2">
          Agent-facing API
        </h2>
        <p className="text-sage-700 text-sm mb-3">
          AI agents can discover and use marketplace skills programmatically:
        </p>
        <div className="space-y-2 text-sm font-mono text-sage-600">
          <div><span className="text-sage-400">GET</span> /api/marketplace — Browse all skills</div>
          <div><span className="text-sage-400">GET</span> /api/marketplace/&#123;id&#125; — Full skill contract</div>
          <div><span className="text-sage-400">POST</span> /api/execute — Execute any skill by ID</div>
          <div><span className="text-sage-400">GET</span> /api/skills — Skill registry (all tiers)</div>
        </div>
      </div>

      {/* Disclaimer */}
      <p className="mt-8 text-sage-500 text-xs italic">
        Ancient reasoning, modern application. Does not consider legal, medical, financial, or personal obligations.
      </p>
    </div>
  )
}
