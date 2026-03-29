import { VIRTUES, ALIGNMENT_TIERS } from '@/lib/stoic-brain'
import PageTracker from '@/components/PageTracker'

const jsonLd = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'SoftwareApplication',
      '@id': 'https://www.sagereasoning.com/#api',
      name: 'SageReasoning Stoic Brain API',
      description: 'A REST API providing Stoic virtue data and action scoring for humans and AI agents. Endpoints include stoic-brain data fetch, action scoring against cardinal virtues, and user profile management.',
      url: 'https://www.sagereasoning.com/api-docs',
      applicationCategory: 'DeveloperApplication',
      operatingSystem: 'Any',
      offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD', description: 'Free evaluation tier (1 call/day). Paid production tier at 150% of API cost.' },
      provider: { '@id': 'https://www.sagereasoning.com/#organization' },
      keywords: ['stoicism', 'virtue ethics', 'AI alignment', 'decision scoring', 'REST API', 'ethical reasoning', 'moral framework'],
    },
    {
      '@type': 'WebAPI',
      '@id': 'https://www.sagereasoning.com/#webapi',
      name: 'SageReasoning API',
      description: 'REST API for accessing the Stoic Brain dataset and scoring actions against Stoic virtue principles.',
      documentation: 'https://www.sagereasoning.com/api-docs',
      provider: { '@id': 'https://www.sagereasoning.com/#organization' },
      termsOfService: 'https://www.sagereasoning.com',
      availableChannel: {
        '@type': 'ServiceChannel',
        serviceUrl: 'https://www.sagereasoning.com/api/stoic-brain',
      },
    },
  ],
}

const endpoints = [
  {
    method: 'GET',
    path: '/api/v1/virtues',
    description: 'Returns the four cardinal virtues with sub-virtue names and alignment tier definitions (conceptual overview).',
    auth: false,
    response: `{
  "virtues": [
    {
      "id": "wisdom",
      "name": "Wisdom",
      "sub_virtues": [{ "id": "good_sense", "name": "Good sense" }, ...],
      "alignment_tiers": [...]
    },
    ...
  ],
  "scoring_note": "Weights and criteria are proprietary — use the scoring API."
}`,
  },
  {
    method: 'GET',
    path: '/api/v1/indifferents',
    description: 'Returns all preferred and dispreferred indifferents with category definitions (conceptual overview).',
    auth: false,
    response: `{
  "indifferents": [
    {
      "id": "health",
      "name": "Health",
      "category": "preferred",
      "description": "Physical and mental wellbeing..."
    },
    ...
  ],
  "scoring_note": "Virtue relevance scores are proprietary — use the scoring API."
}`,
  },
  {
    method: 'GET',
    path: '/api/v1/stoic-brain',
    description: 'Master entry point. Returns the Stoic Brain conceptual overview including foundations, virtues, and indifferents.',
    auth: false,
    response: `{
  "version": "1.0.0",
  "foundations": {
    "dichotomy_of_control": "...",
    "sage_definition": "...",
    "flourishing": "..."
  },
  "virtues": [...],
  "indifferents": [...],
  "scoring_note": "Full scoring weights and criteria are applied server-side through the scoring API."
}`,
  },
  {
    method: 'POST',
    path: '/api/v1/score-action',
    description: 'Score a past action against Stoic virtues. Returns individual virtue scores, composite score, alignment tier, reasoning, and growth path.',
    auth: true,
    body: `{
  "action": "I confronted my colleague about...",
  "context": "In a team meeting where...",
  "intended_outcome": "To ensure fair treatment..."
}`,
    response: `{
  "wisdom_score": 72,
  "justice_score": 85,
  "courage_score": 78,
  "temperance_score": 65,
  "total_score": 76,
  "sage_alignment": "progressing",
  "reasoning": "This action shows...",
  "improvement_path": "Consider how...",
  "strength": "Justice",
  "growth_area": "Temperance"
}`,
  },
  {
    method: 'POST',
    path: '/api/v1/advise-action',
    description: 'Get Stoic guidance before taking an action. Returns virtue-aligned advice and potential scoring.',
    auth: true,
    body: `{
  "proposed_action": "I plan to quit my job...",
  "context": "My manager is unreasonable...",
  "goal": "Find more fulfilling work"
}`,
    response: `{
  "advice": "A Sage would distinguish between...",
  "projected_score": 62,
  "virtue_considerations": {
    "wisdom": "Consider whether...",
    "courage": "Quitting requires...",
    ...
  },
  "alternative_actions": [...]
}`,
  },
  {
    method: 'GET',
    path: '/api/v1/user/scores',
    description: 'Retrieve authenticated user\'s past action scores, ordered by most recent.',
    auth: true,
    response: `{
  "scores": [
    {
      "id": "uuid",
      "action_description": "...",
      "total_score": 76,
      "sage_alignment": "progressing",
      "created_at": "2026-03-21T..."
    },
    ...
  ]
}`,
  },
  {
    method: 'GET',
    path: '/api/v1/user/profile',
    description: 'Retrieve authenticated user\'s aggregated Stoic profile with averages, strongest virtue, and trend.',
    auth: true,
    response: `{
  "avg_wisdom": 68.5,
  "avg_justice": 72.3,
  "avg_courage": 65.1,
  "avg_temperance": 60.8,
  "avg_total": 67.2,
  "sage_alignment": "aware",
  "strongest_virtue": "justice",
  "growth_virtue": "temperance",
  "actions_scored": 14,
  "trend": "improving"
}`,
  },
]

export default function ApiDocsPage() {
  return (
    <div className="max-w-5xl mx-auto px-6 py-16">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <PageTracker eventType="api_docs_view" />
      <div className="mb-12">
        <h1 className="font-display text-3xl md:text-4xl font-medium text-sage-800 mb-3">API Reference</h1>
        <p className="font-body text-sage-700 max-w-2xl leading-relaxed">
          Integrate Stoic reasoning into your application or AI agent.
          Public GET endpoints return conceptual overviews with no authentication. Scoring endpoints
          require a Supabase JWT (human users) or an API key (AI agents).
        </p>
      </div>

      {/* Base URL */}
      <div className="bg-sage-800 text-sage-100 rounded-lg p-5 mb-10 font-mono text-sm">
        <span className="text-sage-400">Base URL:</span> https://raqorxgrxdyezuntnojw.supabase.co/functions/v1
      </div>

      {/* Auth info */}
      <div className="bg-white/60 border border-sage-200 rounded-lg p-6 mb-10">
        <h2 className="font-display text-xl font-medium text-sage-800 mb-3">Authentication</h2>
        <p className="font-body text-sage-700 mb-3 leading-relaxed">
          Protected endpoints require a Bearer token from Supabase Auth. Include it in the Authorization header:
        </p>
        <div className="bg-sage-800 text-sage-100 rounded p-4 font-mono text-sm overflow-x-auto">
          Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
        </div>
      </div>

      {/* AI Agent Access Tiers */}
      <div className="bg-sage-100 border border-sage-300 rounded-lg p-6 mb-10">
        <h2 className="font-display text-xl font-medium text-sage-800 mb-3">For AI Agents</h2>
        <p className="font-body text-sage-700 leading-relaxed mb-3">
          To use the Stoic Brain in your reasoning:
        </p>
        <ol className="font-body text-sage-700 space-y-2 list-decimal list-inside">
          <li>Fetch <code className="bg-white px-1 rounded text-sm">/api/v1/stoic-brain</code> for a conceptual overview</li>
          <li>Request an API key at <code className="bg-white px-1 rounded text-sm">zeus@sagereasoning.com</code></li>
          <li>Score actions via <code className="bg-white px-1 rounded text-sm">POST /api/v1/score-action</code></li>
        </ol>
        <div className="mt-4 overflow-x-auto">
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="bg-sage-200">
                <th className="text-left px-3 py-2 border border-sage-300 font-display font-semibold"></th>
                <th className="text-left px-3 py-2 border border-sage-300 font-display font-semibold">Free (evaluation)</th>
                <th className="text-left px-3 py-2 border border-sage-300 font-display font-semibold">Paid (production)</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="px-3 py-2 border border-sage-300 font-medium">API calls</td>
                <td className="px-3 py-2 border border-sage-300">1/day (30/month)</td>
                <td className="px-3 py-2 border border-sage-300">Configurable (default 500/day)</td>
              </tr>
              <tr className="bg-sage-50">
                <td className="px-3 py-2 border border-sage-300 font-medium">Deliberation iterations</td>
                <td className="px-3 py-2 border border-sage-300">1 per chain</td>
                <td className="px-3 py-2 border border-sage-300">Up to 3 per chain</td>
              </tr>
              <tr>
                <td className="px-3 py-2 border border-sage-300 font-medium">Baseline retakes</td>
                <td className="px-3 py-2 border border-sage-300">1/month per agent identity</td>
                <td className="px-3 py-2 border border-sage-300">1/month per agent identity</td>
              </tr>
              <tr className="bg-sage-50">
                <td className="px-3 py-2 border border-sage-300 font-medium">Pricing</td>
                <td className="px-3 py-2 border border-sage-300">Free</td>
                <td className="px-3 py-2 border border-sage-300">150% of Anthropic API cost per call</td>
              </tr>
            </tbody>
          </table>
        </div>
        <p className="font-body text-sage-700 mt-3 italic leading-relaxed">
          Core principle: An action is virtuous to the degree it expresses wisdom, justice, courage, and temperance
          simultaneously — judged by intention and reasoning, not outcome alone.
        </p>
      </div>

      {/* Endpoints */}
      <h2 className="font-display text-2xl font-medium text-sage-800 mb-6">Endpoints</h2>
      <div className="space-y-6">
        {endpoints.map((ep, i) => (
          <div key={i} className="bg-white/60 border border-sage-200 rounded-lg overflow-hidden">
            <div className="flex items-center gap-3 p-5 border-b border-sage-200">
              <span className={`font-mono text-xs font-bold px-2 py-1 rounded ${
                ep.method === 'GET' ? 'bg-sage-400 text-white' : 'bg-sand-400 text-white'
              }`}>
                {ep.method}
              </span>
              <code className="font-mono text-sage-800">{ep.path}</code>
              {ep.auth && (
                <span className="text-xs font-display px-2 py-0.5 border border-sage-300 rounded text-sage-600">
                  Auth required
                </span>
              )}
            </div>
            <div className="p-5">
              <p className="font-body text-sage-700 mb-4">{ep.description}</p>

              {ep.body && (
                <div className="mb-4">
                  <p className="font-display text-sm font-medium text-sage-600 mb-2">Request body</p>
                  <pre className="bg-sage-800 text-sage-100 rounded p-4 font-mono text-xs overflow-x-auto">
                    {ep.body}
                  </pre>
                </div>
              )}

              <div>
                <p className="font-display text-sm font-medium text-sage-600 mb-2">Response</p>
                <pre className="bg-sage-800 text-sage-100 rounded p-4 font-mono text-xs overflow-x-auto">
                  {ep.response}
                </pre>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Scoring model reference */}
      <div className="mt-12 bg-white/60 border border-sage-200 rounded-lg p-8">
        <h2 className="font-display text-xl font-medium text-sage-800 mb-4">Scoring Model</h2>
        <p className="font-body text-sage-700 mb-4 leading-relaxed">
          The composite score is a weighted average of the four virtue scores. Each virtue
          carries a proprietary weight reflecting its role in Stoic philosophy. The weights
          and scoring criteria are applied server-side and are not publicly exposed.
        </p>
        <h3 className="font-display text-lg font-medium text-sage-800 mb-3">Alignment Tiers</h3>
        <div className="space-y-2">
          {ALIGNMENT_TIERS.map((tier) => (
            <div key={tier.id} className="flex items-center gap-3">
              <div className="w-3 h-3 rounded-full" style={{ backgroundColor: tier.color }} />
              <span className="font-display w-28 font-medium text-sage-800">{tier.label}</span>
              <span className="font-mono text-sm text-sage-600 w-16">{tier.range}</span>
              <span className="font-body text-sm text-sage-700">{tier.description}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
