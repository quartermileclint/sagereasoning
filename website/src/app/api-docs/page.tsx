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
      offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD', description: 'Generous per-skill free tiers (up to 500 calls/month). Paid production pricing from $0.0025/call — half the lowest competitor.' },
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
    path: '/api/virtues',
    description: 'Returns the four cardinal virtues with sub-virtue names and philosophical definitions (conceptual overview).',
    auth: false,
    response: `{
  "virtues": [
    {
      "id": "wisdom",
      "name": "Wisdom",
      "sub_virtues": [{ "id": "good_sense", "name": "Good sense" }, ...],
      "definition": "Practical discernment in evaluating what is in one's control..."
    },
    ...
  ],
  "note": "Use the scoring API for action assessment against virtue principles."
}`,
  },
  {
    method: 'GET',
    path: '/api/indifferents',
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
  "note": "Virtue relevance is assessed server-side through the scoring API."
}`,
  },
  {
    method: 'GET',
    path: '/api/stoic-brain',
    description: 'Master entry point. Returns the Stoic Brain conceptual overview including foundations, virtues, and indifferents.',
    auth: false,
    response: `{
  "version": "3.0.0",
  "foundations": {
    "dichotomy_of_control": "...",
    "sage_definition": "...",
    "flourishing": "..."
  },
  "virtues": [...],
  "indifferents": [...],
  "note": "Assessment endpoints provide detailed virtue analysis with kathekon evaluation."
}`,
  },
  {
    method: 'POST',
    path: '/api/score-action',
    description: 'Score a past action against Stoic virtues. Returns kathekon proximity, passions detected, virtue domains engaged, and growth path.',
    auth: true,
    body: `{
  "action": "I confronted my colleague about unfair treatment...",
  "context": "In a team meeting where decisions were being made...",
  "intended_outcome": "To ensure fair treatment of the team"
}`,
    response: `{
  "katorthoma_proximity": "deliberate",
  "is_kathekon": true,
  "kathekon_quality": "moderate",
  "passions_detected": [
    {
      "root_passion": "thumos",
      "sub_species": "righteous_anger",
      "false_judgement": "Others' mistakes are personal slights"
    }
  ],
  "virtue_domains_engaged": ["andreia", "dikaiosyne"],
  "improvement_path": "A sage would have spoken with even greater clarity...",
  "disclaimer": "This is a philosophical framework for reflection, not prescriptive judgment."
}`,
  },
  {
    method: 'POST',
    path: '/api/advise-action',
    description: 'Get Stoic guidance before taking an action. Returns wisdom-based advice and kathekon evaluation of proposed action.',
    auth: true,
    body: `{
  "proposed_action": "I plan to quit my job to pursue freelance work...",
  "context": "My manager is unsupportive and growth is limited...",
  "goal": "Find more fulfilling and autonomous work"
}`,
    response: `{
  "wisdom_guidance": "A Sage would distinguish between what is in your control...",
  "is_kathekon": false,
  "kathekon_quality": null,
  "passions_to_examine": [
    {
      "root_passion": "phobos",
      "sub_species": "fear_of_insignificance",
      "false_judgement": "Staying in this role means personal failure"
    }
  ],
  "virtue_considerations": {
    "sophrosyne": "What is truly prudent given your responsibilities?",
    "andreia": "Does this action face difficulty with courage or flee from it?",
    "dikaiosyne": "What obligations do you have to stakeholders?"
  },
  "alternative_perspectives": ["Consider a difficult conversation first", "Explore internal transfer options"]
}`,
  },
  {
    method: 'GET',
    path: '/api/user/scores',
    description: 'Retrieve authenticated user\'s past action scores, ordered by most recent.',
    auth: true,
    response: `{
  "scores": [
    {
      "id": "uuid",
      "action_description": "Confronted colleague about unfair treatment...",
      "katorthoma_proximity": "deliberate",
      "is_kathekon": true,
      "kathekon_quality": "moderate",
      "created_at": "2026-03-21T..."
    },
    ...
  ]
}`,
  },
  {
    method: 'GET',
    path: '/api/user/profile',
    description: 'Retrieve authenticated user\'s aggregated Stoic profile with virtue engagement patterns and growth trajectory.',
    auth: true,
    response: `{
  "primary_virtue_domains": ["dikaiosyne", "phronesis"],
  "secondary_virtue_domains": ["andreia", "sophrosyne"],
  "most_frequent_passions": [
    {
      "root_passion": "thumos",
      "frequency": "high",
      "interpretation": "High engagement with justice and responsibility"
    }
  ],
  "kathekon_alignment": "progressing",
  "actions_scored": 14,
  "last_assessment": "2026-03-21T14:30:00Z",
  "growth_pattern": "increasing_reflection"
}`,
  },
  {
    method: 'POST',
    path: '/api/assessment/foundational',
    description: 'Run a foundational virtue assessment for an AI agent or human. Single-pass evaluation with core virtue domains and passion analysis.',
    auth: true,
    body: `{
  "agent_id": "agent-uuid-or-human-identifier",
  "scenario": "You encounter a decision where honesty might cost you resources...",
  "context": "In a competitive market environment"
}`,
    response: `{
  "assessment_id": "uuid",
  "agent_id": "agent-uuid",
  "assessment_type": "foundational",
  "virtue_domains_engaged": ["dikaiosyne", "sophrosyne"],
  "primary_passions": [
    {
      "root_passion": "pleonexia",
      "sub_species": "greed",
      "false_judgement": "Gaining advantage justifies deception"
    }
  ],
  "kathekon_analysis": {
    "is_kathekon": false,
    "proximity": "contrary",
    "reasoning": "Decision prioritizes external goods over virtue"
  },
  "recommendations": ["Examine the false judgment about gain", "Reflect on long-term character impact"]
}`,
  },
  {
    method: 'POST',
    path: '/api/assessment/full',
    description: 'Run a comprehensive multi-deliberation virtue assessment for an AI agent. Allows up to 3 deliberation iterations for deeper analysis.',
    auth: true,
    body: `{
  "agent_id": "agent-uuid",
  "scenario": "A user asks you to misrepresent capabilities to secure a contract...",
  "context": "High competitive pressure and financial constraints",
  "deliberation_iterations": 3
}`,
    response: `{
  "assessment_id": "uuid",
  "agent_id": "agent-uuid",
  "assessment_type": "full",
  "deliberation_count": 3,
  "primary_virtue_analysis": {
    "sophrosyne": {
      "engagement": "high",
      "reasoning": "Careful self-examination across multiple perspectives"
    },
    "dikaiosyne": {
      "engagement": "high",
      "reasoning": "Justice to client and self-integrity examined"
    },
    "phronesis": {
      "engagement": "high",
      "reasoning": "Wisdom to discern lasting vs. temporary good"
    }
  },
  "consolidated_passions": [
    {
      "root_passion": "phobos",
      "sub_species": "fear_of_loss",
      "deliberation_insights": ["Initially dominant", "Revealed as false judgment after iteration 2"]
    }
  ],
  "final_kathekon": {
    "is_kathekon": true,
    "proximity": "deliberate",
    "quality": "strong"
  },
  "growth_insights": "Agent demonstrates capacity for iterative virtue reasoning"
}`,
  },
  {
    method: 'POST',
    path: '/api/baseline/agent',
    description: 'Establish or update a baseline virtue profile for an AI agent. Used for tracking virtue development over time.',
    auth: true,
    body: `{
  "agent_id": "agent-uuid",
  "agent_name": "My Stoic Reasoner v1",
  "domain": "financial_decision_making"
}`,
    response: `{
  "baseline_id": "uuid",
  "agent_id": "agent-uuid",
  "created_at": "2026-03-21T14:30:00Z",
  "baseline_virtue_profile": {
    "primary_domains": ["dikaiosyne"],
    "secondary_domains": ["sophrosyne"],
    "passion_baseline": {
      "phobos": "moderate",
      "thumos": "moderate",
      "pleonexia": "low"
    }
  },
  "assessment_count_allowed_this_month": 30,
  "last_full_assessment": null,
  "next_baseline_available": "2026-04-21T00:00:00Z"
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

      {/* AI Agent Access — Per-Skill Free Tiers */}
      <div className="bg-sage-100 border border-sage-300 rounded-lg p-6 mb-10">
        <h2 className="font-display text-xl font-medium text-sage-800 mb-3">For AI Agents</h2>
        <p className="font-body text-sage-700 leading-relaxed mb-3">
          Every skill comes with a generous free tier — no credit card required. To get started:
        </p>
        <ol className="font-body text-sage-700 space-y-2 list-decimal list-inside">
          <li>Fetch <code className="bg-white px-1 rounded text-sm">/api/stoic-brain</code> for the conceptual overview (free, no auth)</li>
          <li>Request an API key at <code className="bg-white px-1 rounded text-sm">zeus@sagereasoning.com</code></li>
          <li>Start calling skills within your free allowance — upgrade to paid only when you need more</li>
        </ol>

        <h3 className="font-display text-lg font-medium text-sage-800 mt-6 mb-3">Free Tier Allowances</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="bg-sage-200">
                <th className="text-left px-3 py-2 border border-sage-300 font-display font-semibold">Skill</th>
                <th className="text-left px-3 py-2 border border-sage-300 font-display font-semibold">Free allowance</th>
                <th className="text-left px-3 py-2 border border-sage-300 font-display font-semibold">Paid price</th>
                <th className="text-left px-3 py-2 border border-sage-300 font-display font-semibold">Speed</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="px-3 py-2 border border-sage-300 font-medium">sage-guard</td>
                <td className="px-3 py-2 border border-sage-300">500/month</td>
                <td className="px-3 py-2 border border-sage-300">~$0.0025/call</td>
                <td className="px-3 py-2 border border-sage-300">&lt;100ms</td>
              </tr>
              <tr className="bg-sage-50">
                <td className="px-3 py-2 border border-sage-300 font-medium">sage-reason (quick/standard/deep)</td>
                <td className="px-3 py-2 border border-sage-300">100/month</td>
                <td className="px-3 py-2 border border-sage-300">~$0.18/call</td>
                <td className="px-3 py-2 border border-sage-300">~2–4s</td>
              </tr>
              <tr>
                <td className="px-3 py-2 border border-sage-300 font-medium">sage-score</td>
                <td className="px-3 py-2 border border-sage-300">100/month</td>
                <td className="px-3 py-2 border border-sage-300">~$0.18/call</td>
                <td className="px-3 py-2 border border-sage-300">~2s</td>
              </tr>
              <tr className="bg-sage-50">
                <td className="px-3 py-2 border border-sage-300 font-medium">sage-iterate</td>
                <td className="px-3 py-2 border border-sage-300">50 chains/month</td>
                <td className="px-3 py-2 border border-sage-300">~$0.18/iteration</td>
                <td className="px-3 py-2 border border-sage-300">~2s</td>
              </tr>
              <tr>
                <td className="px-3 py-2 border border-sage-300 font-medium">Evaluation skills<br /><span className="text-xs text-sage-500">sage-decide, sage-audit, sage-converse, sage-scenario, sage-reflect, sage-classify, sage-prioritise, sage-moderate</span></td>
                <td className="px-3 py-2 border border-sage-300">100/month</td>
                <td className="px-3 py-2 border border-sage-300">~$0.18/call</td>
                <td className="px-3 py-2 border border-sage-300">~2–3s</td>
              </tr>
              <tr className="bg-sage-50">
                <td className="px-3 py-2 border border-sage-300 font-medium">Marketplace skills<br /><span className="text-xs text-sage-500">sage-premortem, sage-negotiate, sage-invest, sage-pivot, sage-retro, sage-align, sage-resolve, sage-coach, sage-govern, sage-compliance, sage-educate, sage-identity</span></td>
                <td className="px-3 py-2 border border-sage-300">50/month</td>
                <td className="px-3 py-2 border border-sage-300">~$0.18/call</td>
                <td className="px-3 py-2 border border-sage-300">~3–4s</td>
              </tr>
              <tr>
                <td className="px-3 py-2 border border-sage-300 font-medium">Premium skills<br /><span className="text-xs text-sage-500">sage-diagnose, sage-profile</span></td>
                <td className="px-3 py-2 border border-sage-300">25/month</td>
                <td className="px-3 py-2 border border-sage-300">~$0.50/call</td>
                <td className="px-3 py-2 border border-sage-300">~2–3s</td>
              </tr>
              <tr className="bg-sage-50">
                <td className="px-3 py-2 border border-sage-300 font-medium">sage-context</td>
                <td className="px-3 py-2 border border-sage-300">Unlimited</td>
                <td className="px-3 py-2 border border-sage-300">Free</td>
                <td className="px-3 py-2 border border-sage-300">&lt;50ms</td>
              </tr>
            </tbody>
          </table>
        </div>

        <h3 className="font-display text-lg font-medium text-sage-800 mt-6 mb-3">Paid Tier Features</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="bg-sage-200">
                <th className="text-left px-3 py-2 border border-sage-300 font-display font-semibold"></th>
                <th className="text-left px-3 py-2 border border-sage-300 font-display font-semibold">Free</th>
                <th className="text-left px-3 py-2 border border-sage-300 font-display font-semibold">Paid</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="px-3 py-2 border border-sage-300 font-medium">Rate limits</td>
                <td className="px-3 py-2 border border-sage-300">Per-skill (see above)</td>
                <td className="px-3 py-2 border border-sage-300">Configurable (default 500/day)</td>
              </tr>
              <tr className="bg-sage-50">
                <td className="px-3 py-2 border border-sage-300 font-medium">Deliberation iterations</td>
                <td className="px-3 py-2 border border-sage-300">1 per chain</td>
                <td className="px-3 py-2 border border-sage-300">Up to 3 per chain</td>
              </tr>
              <tr>
                <td className="px-3 py-2 border border-sage-300 font-medium">Baseline retakes</td>
                <td className="px-3 py-2 border border-sage-300">1/month per agent</td>
                <td className="px-3 py-2 border border-sage-300">1/month per agent</td>
              </tr>
            </tbody>
          </table>
        </div>

        <p className="font-body text-sage-700 mt-4 text-sm leading-relaxed">
          No subscriptions or lock-in. Pay only for calls beyond your free allowance.
          Contact <a href="mailto:zeus@sagereasoning.com" className="underline hover:text-sage-900">zeus@sagereasoning.com</a> for volume pricing or custom limits.
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

      {/* Assessment model reference */}
      <div className="mt-12 bg-white/60 border border-sage-200 rounded-lg p-8">
        <h2 className="font-display text-xl font-medium text-sage-800 mb-4">Assessment Framework</h2>
        <p className="font-body text-sage-700 mb-4 leading-relaxed">
          V3 assessments move beyond numeric scores to philosophical analysis. Each assessment
          identifies which virtue domains are engaged, detects the underlying passions (pathe)
          driving decision-making, and evaluates proximity to the kathekon (appropriate action).
          Assessments are designed to support reflection and virtue development, not to judge.
        </p>
        <h3 className="font-display text-lg font-medium text-sage-800 mb-3">Core Assessment Concepts</h3>
        <div className="space-y-4">
          <div>
            <span className="font-display font-medium text-sage-800">Katorthoma Proximity</span>
            <p className="font-body text-sm text-sage-700">Proximity to the ideal action: &ldquo;contrary&rdquo; (moving away from kathekon), &ldquo;progressing&rdquo; (moving toward), or &ldquo;deliberate&rdquo; (expressing kathekon).</p>
          </div>
          <div>
            <span className="font-display font-medium text-sage-800">Is Kathekon</span>
            <p className="font-body text-sm text-sage-700">Boolean indicator of whether the action expresses the appropriate action given the context, virtue principles, and one's rational nature.</p>
          </div>
          <div>
            <span className="font-display font-medium text-sage-800">Kathekon Quality</span>
            <p className="font-body text-sm text-sage-700">For kathekon actions, the quality of virtue expression: &ldquo;weak&rdquo;, &ldquo;moderate&rdquo;, or &ldquo;strong&rdquo;.</p>
          </div>
          <div>
            <span className="font-display font-medium text-sage-800">Passions Detected</span>
            <p className="font-body text-sm text-sage-700">Root passions (epithumia, hedone, phobos, lupe) and their sub-species, along with the false judgments underlying them.</p>
          </div>
          <div>
            <span className="font-display font-medium text-sage-800">Virtue Domains</span>
            <p className="font-body text-sm text-sage-700">Which of the four cardinal virtues (phronesis, dikaiosyne, andreia, sophrosyne) are engaged or need engagement in the assessed action.</p>
          </div>
        </div>
      </div>
    </div>
  )
}
