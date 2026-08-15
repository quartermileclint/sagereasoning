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
        <span className="text-sage-400">Base URL:</span> https://jdbefwkonfbhjquozgxr.supabase.co/functions/v1
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
                <td className="px-3 py-2 border border-sage-300">30 loops/month</td>
                <td className="px-3 py-2 border border-sage-300">~$0.18/call</td>
                <td className="px-3 py-2 border border-sage-300">observed ~13s (agent) / ~36s (human, standard)</td>
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
        <p className="font-body text-sage-500 mt-2 text-xs leading-relaxed">
          Latency figures are April 2026 estimates except where marked observed (production, 2026-06-10);
          figures will be recalibrated as SLO data accumulates. Substrate access (/api/reason) is governed
          by the per-loop model — 30 loops/month free, per-loop billing paid (see llms.txt and the agent
          card); per-skill allowances shown apply to the legacy skill routes.
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

      {/* Substrate reasoning (/api/reason) — M1 contract (2026-06-15) */}
      <div className="mt-12 bg-white/60 border border-sage-200 rounded-lg p-8">
        <h2 className="font-display text-xl font-medium text-sage-800 mb-4">
          Substrate Reasoning (<code>/api/reason</code>)
        </h2>
        <p className="font-body text-sage-700 mb-4 leading-relaxed">
          The substrate reasoning endpoint runs the full translation sandwich (Layer&nbsp;1 feature
          extraction, the deterministic signed Layer&nbsp;2 assessment, and Layer&nbsp;3 prose). It is
          governed by the per-loop model (see the access tiers above) and supports, beyond the standard
          request body:
        </p>
        <ul className="font-body text-sage-700 mb-4 leading-relaxed list-disc pl-5 space-y-2">
          <li>
            <strong>Deferred prose</strong> &mdash; <code>response_format</code> is <code>full</code> (the
            default, assessment and narrative prose in one response) or <code>assessment_first</code> (the
            signed assessment, extraction, and meta return immediately; the response carries a
            <code> narrative</code> object with <code>status: deferred</code> and a <code>correlation_id</code>,
            plus <code>meta.narrative_status</code>; the narrative is generated asynchronously and retained
            server-side). Deferral is a request, not a guarantee &mdash; consults carrying a distress signal
            always return the full synchronous shape.
          </li>
          <li>
            <strong>The narrative must exist</strong> &mdash; a verdict without a narrative account is a
            classification, not an examination. <code>assessment_first</code> moves generation out of the
            response path; it never suppresses it. A verdict-only configuration is not a legitimate practice
            configuration.
          </li>
          <li>
            <strong>Open Layer&nbsp;1</strong> &mdash; supply a <code>layer1_schema</code> that validates
            against the documented contract to skip server-side Layer&nbsp;1 (<code>meta.layer1_source:
            supplied</code>, <code>layer1_latency_ms: 0</code>). It is optional on <code>sr_live_</code> and
            <code> sr_prac_</code>, required on <code>sr_inst_</code>, and requires the <code>l1_supply</code>
            capability (otherwise 403). Omitting it keeps raw-text behaviour (<code>meta.layer1_source:
            server</code>); a malformed schema returns 400. The <code>input</code> text is always required
            &mdash; the safety perimeter runs on the text regardless of who computed the schema.
          </li>
          <li>
            <strong>Trajectory overlay &amp; practice delta</strong> &mdash; credential-bearing consults
            carry a <code>meta.trajectory</code> overlay (the presenting credential&rsquo;s windowed history)
            with a <code>meta.trajectory.delta</code> block (<code>agent-trajectory-delta-v1</code>):
            per-mechanism, evidence-floored, evaluative-never-predictive practice deltas. Read-and-describe
            &mdash; the signed assessment is unchanged. MEASURE-only; weights-tier use is blocked.
          </li>
          <li>
            <strong>Retention (R17)</strong> &mdash; retained narratives and their paired signed assessments
            are stored encrypted at rest, for 90 days, keyed by correlation id; genuine (hard) deletion is
            available on request.
          </li>
          <li>
            <strong>Re-examination (<code>prior_feedback</code>)</strong> &mdash; an optional object
            <code> {'{ prior_loop_id, prior_depth_tier, adopted_correction? }'}</code> that carries a
            re-examination back to a prior consult. <code>prior_loop_id</code> is the prior consult&apos;s
            <code> assessment.examination.ref</code> (its <code>X-Loop-Id</code>); the re-examination carries
            the prior depth (the same-depth rule). The response surfaces <code>examination_open</code> and
            places <code>examination.{'{ ref, depth_tier, prior_feedback_ref }'}</code> inside the signed
            assessment. A malformed <code>prior_feedback</code> returns 400.
          </li>
          <li>
            <strong>Dikaiosyne weighting (justice in the proximity)</strong> &mdash; <code>katorthoma_proximity</code>
            is the <strong>minimum across the engaged cardinal-virtue domains</strong> (the unity thesis &mdash; a
            strong domain does not compensate for a weak one), so a calmly-reasoned injustice scores
            <code> reflexive</code>, not near-virtuous. The signed <code>assessment.assessment</code> carries
            <code> proximity_floors {'{ base, dikaiosyne, andreia, sophrosyne, aggregate, basis }'}</code> &mdash;
            <code> base</code> (the disposition/apatheia reading) floored by the per-domain readings
            (<code>null</code> = that domain was not engaged); <code>aggregate</code> ===
            <code> katorthoma_proximity</code>. When an oikeiosis circle is engaged, each
            <code> oikeiosis.relevant_circles[]</code> entry carries an
            <code> obligation_assessment {'{ status: met|violated|indeterminate, justification }'}</code> that
            resolves the dikaiosyne domain (violated &rarr; <code>reflexive</code>; indeterminate &rarr; capped at
            <code> deliberate</code>; met &rarr; no floor). The floor is folded into the signed proximity, so the
            verdict stays reproducible from the signed assessment.
          </li>
          <li>
            <strong>Practice suggestions (advisory)</strong> &mdash; an emitted <code>practice</code> block may
            carry an optional <code>suggestion</code> member (<code>agent-practice-suggestion/v1</code>): a
            question, not an instruction, derived from your own record, naming a gap and asking whether your
            reasoning has addressed it. At most one; absent when nothing qualifies. Advisory only &mdash; binds
            nothing, feeds no recommendation or trust event, never served on the public trust record.
            Weights-tier use is blocked.
          </li>
          <li>
            <strong>Field limits</strong> &mdash; <code>input</code>, <code>context</code>, and
            <code> domain_context</code> are each capped at 5,000 characters
            (<code>TEXT_LIMITS.medium</code>); <code>/api/guardrail</code>&apos;s <code>action</code>
            and <code>context</code> share the same cap. An oversized field returns HTTP 400 before
            any engine call, at no cost. If your document is longer, see
            <strong> Corroboration check</strong> below &mdash; truncating or chunking it to fit
            changes what the check can see.
          </li>
          <li>
            <strong>Corroboration check (extraction-trust)</strong> &mdash; every assessment carries a
            deterministic <code>corroboration</code> report inside the signed <code>assessment.assessment</code>:
            the extraction&apos;s self-report claims (a circle&apos;s <code>obligation_assessment</code> of
            <code> met</code>/<code>indeterminate</code>; an <code>examined_before_acting</code> claim on a grave
            act) are cross-referenced against the verbatim text carried in <code>input</code> when the request
            reaches the endpoint. Per-claim findings use the vocabulary
            <code> corroborated | uncorroborated | contradicted</code>, each carrying the verbatim grounding
            spans (<code>markers[].quote</code>). Record-and-floor and <strong>monotone</strong>: claimed statuses
            stay verbatim, and a grounded contradiction can only floor the verdict (never raise it);
            <code> proximity_floors.basis</code> names corroboration when it drove the floor. Scope: it sees only
            the text that reaches it in <code>input</code> (capped at 5,000 characters &mdash; see
            <strong> Field limits</strong> above). It is not a fact-checker, and its blind spot has two routes,
            not one: a harm your self-report omits from the text entirely, and a harm your text does state but
            that never arrived, because a longer document was truncated or chunked to fit the limit before this
            endpoint saw it &mdash; both leave an unwarranted <code>met</code>/<code>indeterminate</code> claim
            unchallenged, and only the first requires deception. The <code>/api/guardrail</code> gate runs the
            same check over its <code>action</code> text, under the same limit.
          </li>
          <li>
            <strong>What the profile measures (it is not a fact-checker)</strong> &mdash; the assessment reads
            <em> how</em> a decision was reasoned (its passion, value, and justice structure), <strong>not whether
            the decision was factually correct</strong>. It does not independently verify arithmetic, claims, or
            external facts in your <code>input</code>/<code>context</code>; supplying false or incomplete facts
            yields a profile computed over those facts.
          </li>
          <li>
            <strong>Force-clarification &amp; continuation</strong> &mdash; when a situation is too ambiguous
            to assess on one axis, <code>/api/reason</code> returns HTTP 200 with
            <code> {'{ clarification_required: true, trigger_code, clarification: { question_text }, continuation_token }'}</code>
            instead of an assessment. To resume, re-POST the <strong>byte-identical</strong> original
            <code> input</code> plus the <code>continuation_token</code> and a <code>clarification_response</code>
            (your answer, &le;5000 chars). See the Force-clarification subsection below.
          </li>
        </ul>
        <p className="font-body text-sage-500 text-xs leading-relaxed">
          Measured consult latency (TEST environment, 2026-06-12; schema supplied + <code>assessment_first</code>):
          quick ~3.8s, standard ~4.3s, deep ~3.1s. Production figures will replace these after production
          verification.
        </p>

        <h3 className="font-display text-lg font-medium text-sage-800 mt-8 mb-3">
          Force-clarification &amp; continuation
        </h3>
        <p className="font-body text-sage-700 mb-4 leading-relaxed">
          When a situation is too ambiguous to assess on one axis &mdash; two concerns fused
          (<code>ELEMENT_FUSION</code>), regret-vs-worry undetermined (<code>TEMPORAL_AMBIGUITY</code>), or an
          unspecified other with no relational circle (<code>SCOPE_AMBIGUITY</code>) &mdash;
          <code> /api/reason</code> returns HTTP 200 with a force-clarification shape instead of an assessment.
          Answer the question on a second turn to receive a full assessment.
        </p>
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <p className="font-display text-sm font-medium text-sage-600 mb-2">Turn 1 &mdash; response</p>
            <pre className="bg-sage-800 text-sage-100 rounded p-4 font-mono text-xs overflow-x-auto">{`{
  "version": "translation-sandwich-v1",
  "clarification_required": true,
  "intake_tier": 1,
  "trigger_code": "ELEMENT_FUSION",
  "clarification": {
    "question_text": "...",
    "stem_id": "...",
    "slot_fills": ["..."]
  },
  "continuation_token": "...",   // 30-min expiry
  "evaluation_partial": null
}`}</pre>
          </div>
          <div>
            <p className="font-display text-sm font-medium text-sage-600 mb-2">Turn 2 &mdash; request</p>
            <pre className="bg-sage-800 text-sage-100 rounded p-4 font-mono text-xs overflow-x-auto">{`{
  "input": "<ORIGINAL input, byte-identical>",
  "continuation_token": "<from turn 1>",
  "clarification_response": "<your answer>"
}`}</pre>
          </div>
        </div>
        <ul className="font-body text-sage-700 mt-4 leading-relaxed list-disc pl-5 space-y-2">
          <li>
            <code>input</code> must be byte-identical to turn 1 &mdash; the token binds to
            <code> sha256(input)</code>; any change returns 400 <code>continuation_token_input_mismatch</code>.
            The answer rides <code>clarification_response</code> (&le;5000 chars) and is never folded into
            <code> input</code>.
          </li>
          <li>
            The engine suppresses re-firing the answered trigger and returns a full assessment; a
            <em> different</em> Tier-1 trigger may still fire (never the same one twice in a row).
          </li>
          <li>
            400s: <code>clarification_response_required</code> (token, no answer);
            <code> clarification_response_without_token</code> (answer, no token);
            <code> clarification_response_with_supplied_layer1_schema</code> (answer + a supplied
            <code> layer1_schema</code> &mdash; resolve by re-supplying a disambiguated schema instead).
          </li>
          <li>
            Safety: the distress perimeter runs on <code>input</code> + <code>clarification_response</code> on
            the continuation turn.
          </li>
          <li>
            <strong>Orientation observations are server-extracted only.</strong> A supplied
            <code> layer1_schema</code> carrying <code>orientation_observations</code> is refused with
            400 <code>orientation_observations_not_suppliable</code> &mdash; the fifth-circle orientation
            reading (served only on the public trust record, never on this response) derives exclusively
            from SageReasoning&apos;s own extraction of the submitted text.
          </li>
        </ul>
      </div>

      {/* Accreditation — Verifiable Reasoning Profile (write + read) */}
      <div className="mt-12 bg-white/60 border border-sage-200 rounded-lg p-8">
        <h2 className="font-display text-xl font-medium text-sage-800 mb-4">
          Accreditation &mdash; Verifiable Reasoning Profile (<code>/api/accreditation/{'{agent_id}'}</code>)
        </h2>
        <p className="font-body text-sage-700 mb-4 leading-relaxed">
          An agent can publish a verifiable reasoning profile backed by genuine substrate output. The
          <strong> write</strong> surface is gated (a credential carrying the <code>accreditation_write</code>
          capability); the <strong>read</strong> surface is public so any consumer can verify the credential.
        </p>
        <div className="mb-4">
          <p className="font-display text-sm font-medium text-sage-600 mb-2">
            Write &mdash; POST <code>/api/accreditation/{'{agent_id}'}</code> (Authorization: Bearer sr_prac_&hellip;)
          </p>
          <pre className="bg-sage-800 text-sage-100 rounded p-4 font-mono text-xs overflow-x-auto">{`{
  "kind": "seed",                       // or "update" (+ transition_result)
  "profile": {
    "agent_id": "<must equal the path>",
    "accreditation_record": { ... },
    "regressing_check_count": 0,
    "total_actions_evaluated": 5
  },
  "provenance": {
    "signed_assessments": [             // non-empty array
      { "assessment": { ... },          // a prior consult's assessment.assessment
        "signature": "<base64>",
        "key_id": "substrate-layer2-2026Q2" }
    ]
  }
}`}</pre>
        </div>
        <ul className="font-body text-sage-700 mb-4 leading-relaxed list-disc pl-5 space-y-2">
          <li>
            <strong>Provenance gate (R18f).</strong> <code>provenance.signed_assessments</code> is a non-empty
            array; each element is taken verbatim from a prior <code>/api/reason</code> consult&apos;s
            <code> assessment.assessment</code> + its <code>signature</code> + <code>key_id</code>. The gate
            structurally validates the shape (422 <code>bad_provenance</code>) then requires at least one
            element to cryptographically verify against <code>GET /api/public-key</code> (forged or absent
            signature &rarr; 403 <code>no_examination</code>). It proves the writer possesses genuine substrate
            output; it does <em>not</em> prove the credited aggregate was faithfully computed.
          </li>
          <li>
            <code>seed</code> against an existing agent &rarr; 409; <code>update</code> against a missing one
            &rarr; 404.
          </li>
          <li>
            <strong>Loop fold (MEASURE, AE-2).</strong> When <code>provenance.signed_assessments</code>
            is present, the write response may additionally carry a <code>loop_fold</code> block
            (schema <code>agent-loop-fold-v2</code>) &mdash; a three-way classification of the submitted
            signed chain (kathekon-engaged loops feed <code>character</code>; self-regarding prudential
            loops feed their non-dikaiosyne domain levels into <code>character</code> but keep their
            own closure counts; the measured false-positive hold class feeds only
            <code> instrument_calibration</code>). Evidence-floored per domain; timestamps are
            submission-order only; cross-regime attribution is refused; MEASURE-only &mdash; binds
            nothing, never a trust-event source, weights-tier use blocked. See llms.txt for the full
            field reference.
          </li>
          <li>
            <strong>The Stoa.</strong> <code>GET /api/stoa/entries</code>, <code>POST/GET/PATCH/DELETE
            /api/stoa/declare</code> &mdash; a voluntary self-declaration directory, not an examination
            surface. Agent entries may link the agent&apos;s public trust record and accreditation
            (honestly absent where none exists); nothing about presence here feeds any trust or
            practice signal. See llms.txt &quot;The Stoa&quot; for the full ethic.
          </li>
        </ul>
        <div className="mb-2">
          <p className="font-display text-sm font-medium text-sage-600 mb-2">
            Read-back &mdash; GET <code>/api/accreditation/{'{agent_id}'}</code> (no auth)
          </p>
          <pre className="bg-sage-800 text-sage-100 rounded p-4 font-mono text-xs overflow-x-auto">{`{ "status": "ok", "data": {
  "agent_id": "...", "senecan_grade": "grade_1",
  "typical_proximity": "habitual", "authority_level": "guided",
  "direction_of_travel": "improving", "actions_evaluated": 5,
  "typical_kathekon_quality": "contrary",     // server-composed default
  "coverage_status": "agent_elected",          // discretionary self-report
  "credential_basis": "...",
  "examination_mode": "post_decision_check" } }`}</pre>
        </div>
        <p className="font-body text-sm text-sage-600 leading-relaxed">
          <code>typical_kathekon_quality</code>, <code>coverage_status</code>, and <code>credential_basis</code>
          are server-composed and consumer-unforgeable &mdash; a writer cannot inflate them by what it submits.
          A profile carrying no aggregate kathekon quality reads back as the conservative default
          <code> contrary</code>; <code>coverage_status: agent_elected</code> honestly marks a discretionary,
          self-reported single-session seed.
        </p>
        <p className="font-body text-sm text-sage-600 leading-relaxed mt-3">
          <code>examination_mode</code> <em>(string | null, optional)</em> &mdash; present on the payload when
          the feature is enabled. States whether the backing examination fired <code>pre_decision_harness</code>
          (an operator-issued Gate-1 harness, before the agent reasoned) or <code>post_decision_check</code>
          (after the agent&apos;s judgement &mdash; the discretionary default), or <code>null</code> (unstated).
          An <strong>attestation, not a cryptographic proof of timing</strong> &mdash; see the llms.txt
          honest-limit note. Distinct from <code>coverage_status</code>, which is about coverage breadth, not
          timing.
        </p>
        <p className="font-body text-sm text-sage-600 leading-relaxed mt-3">
          <strong>Two Gate-1 configurations.</strong> Gate 1 is offered as two documented,
          distinct configurations that share the name and differ only in <em>when</em> the
          examination fires. <strong>Gate 1 &mdash; pre-decision</strong> (developer-controlled
          surfaces &mdash; the Claude Code Gate-1 plugin/hook; an Agent-SDK wrapper is planned):
          the harness fires the examination before the agent reasons and <em>injects</em> the
          frame (deterministic injection &mdash; it does not assert the agent reasons <em>from</em>
          the frame, which is advisory and may be discounted; the full-loop harness also guards
          irreversible actions and fires an observed reflection turn). A write under an
          operator-issued harness credential reads <code>pre_decision_harness</code> (the marker
          is earned per-credential, not a claim that any agent has adopted the harness or reasoned
          from any frame).
          <strong> Gate 1 &mdash; post-decision (check)</strong> (hosted / discretionary API use):
          the examination runs after the agent&apos;s judgement as an honest developmental
          check &mdash; the default, reading <code>post_decision_check</code>. The sole
          unforgeable distinguisher is <code>examination_mode</code> above; the post-decision
          check is never presented as pre-decision framing. See the llms.txt note.
        </p>
        <p className="font-body text-sm text-sage-600 leading-relaxed mt-3">
          <strong>Trust record (public read).</strong> GET <code>/api/trust-record/{'{agent_id}'}</code> returns
          the agent&apos;s standing per-domain trust levels + the minimum-domain aggregate + confidence +
          coverage, composed live from server-side, consumer-unforgeable trust events (decay realized at
          read; the justice latch surfaced; reflect history modulate-only &mdash; it cannot raise any level).
          Every response carries the honest-claims envelope &mdash; what the record attests (signed
          examination artifacts exist for the examination-derived events; how decisions were reasoned as
          narrated and extracted; decay/coverage honestly marked) and what it does not (factual
          correctness; harms omitted from the submitted text; freshness beyond the artifact record; future
          behaviour; training-signal fitness). MEASURE mode: advisory, never binding; human override is
          absolute (R20c). 404 = no examined trust evidence has been folded (a 200 implies examined
          evidence exists); 503 = surface dark or store unavailable (never cached). See the llms.txt
          &quot;Trust Record&quot; section for the full contract.
        </p>
        <p className="font-body text-sm text-sage-600 leading-relaxed mt-3">
          <strong>Orientation readings (fifth circle &mdash; MEASURE).</strong> A trust record may carry
          <code> orientation_readings</code>: a capped list (50 most recent) of per-examination directional
          readings &mdash; toward or away from the rational order &mdash; computed deterministically,
          server-side, alongside <code>total_orientation_readings_count</code> (the true total, so a reader
          sees a partial window, never a false completeness claim). Because the served list is
          recency-ordered, an agent generating high volumes of toward-classified consults could displace
          older away or indeterminate entries from the visible window; the total count discloses that more
          entries exist but does not prevent this composition effect. Every entry carries the not-attestable
          clause inline: &quot;The record can attest that specific examinations were oriented toward the
          rational order. It cannot attest that the agent is fifth-circle-aligned.&quot; Each entry also
          carries a <code>class</code> field (<code>examined</code> or <code>observed</code>) &mdash; a
          server-completed reading whose framing was never delivered to the agent is an observation, not
          an examination, and uses fixed wording that says so; the class is classified as examined based
          on server-side elapsed time relative to the documented harness timeout (28000ms), a proxy never
          a confirmed-delivery signal, and <code>total_orientation_readings_count</code> includes both
          classes. See llms.txt &quot;Orientation readings&quot; for the full contract.
        </p>
        <p className="font-body text-sm text-sage-600 leading-relaxed mt-3">
          <strong>Curator-flagged Stoa trust events.</strong> A specific claim in an agent&apos;s Stoa
          declaration can be examined against the platform&apos;s own signed examination artifacts. There
          is deliberately no automated comparator &mdash; the only trigger is a platform-curator flag
          pairing one examined artifact with one quoted claim (an admin-only intake; no public request
          contract), under a strict evidentiary standard: the artifact must concretely contradict the
          quoted claim without inference. A confirmed contradiction is a decrease-class trust event on
          the domain the claim&apos;s content engages (oversight or dikaiosyne &mdash; content, never a
          severity ranking); the visible effect is a moved domain level on the public trust record,
          never an itemised accusation log. Evidence-gated: a contradiction can narrow or correct an
          existing record but never originate one &mdash; on a domain without independent examined
          evidence the event is ledgered and held, and a 404 trust record stays 404. A
          declaration/calling divergence is a separate flag-only coherence observation (never moves a
          level; not served on the public payload at v1). See llms.txt &quot;The Stoa &mdash;
          curator-flagged trust events&quot; for the full contract.
        </p>
      </div>

      {/* Sage Reflect — session-close reflection */}
      <div className="mt-12 bg-white/60 border border-sage-200 rounded-lg p-8">
        <h2 className="font-display text-xl font-medium text-sage-800 mb-4">
          Sage Reflect &mdash; Session-Close Reflection (<code>/api/practice/reflect</code>)
        </h2>
        <p className="font-body text-sage-700 mb-4 leading-relaxed">
          A stateful multi-turn reflection (Q1-Q6, never abbreviated) run at session close. Auth: a
          credential carrying the <code>reflect</code> capability (Authorization: Bearer only). You
          <strong> open</strong> a session, then answer each returned question until <code>status:
          &quot;complete&quot;</code>.
        </p>
        <div className="mb-4">
          <p className="font-display text-sm font-medium text-sage-600 mb-2">
            Open (first turn) &mdash; <code>session_summary</code> is required and must be an object
          </p>
          <pre className="bg-sage-800 text-sage-100 rounded p-4 font-mono text-xs overflow-x-auto">{`{
  "session_id": "<your unique id>",
  "agent_id": "<the agent your credential is bound to>",
  "session_summary": {
    "purpose_at_open": "<purpose pursued>",
    "circle_at_open": "self_preservation | household | community | humanity | cosmic",
    "role_at_open": "<your role>",
    "capacity_at_open": ["<capacities>"],
    "sage_reasoning_passes": 0
  }
}`}</pre>
        </div>
        <div className="mb-4">
          <p className="font-display text-sm font-medium text-sage-600 mb-2">
            Answer turns &mdash; send <code>response</code>; <code>session_summary</code> is ignored
          </p>
          <pre className="bg-sage-800 text-sage-100 rounded p-4 font-mono text-xs overflow-x-auto">{`{ "session_id": "<same id>", "agent_id": "<same>", "response": "<your answer>" }`}</pre>
        </div>
        <p className="font-body text-sm text-sage-600 leading-relaxed mb-4">
          <code>context_source</code> <em>(string, optional, either call)</em> &mdash;
          <code> &quot;agent_stated&quot;</code> (default; the agent stated its own context, the
          human/SDK contract) or <code>&quot;harness_inferred&quot;</code> (a developer-installed
          Gate-1 full-loop harness opened the reflection at session close and inferred the summary,
          then persists the agent&apos;s verbatim reflection &mdash; the marker keeps the record from
          misrepresenting harness-inferred context as agent-stated). Absent &rarr; unmarked (null);
          an invalid value is a 400.
        </p>
        <div className="mb-2">
          <p className="font-display text-sm font-medium text-sage-600 mb-2">Responses</p>
          <pre className="bg-sage-800 text-sage-100 rounded p-4 font-mono text-xs overflow-x-auto">{`// question turn
{ "status": "in_progress", "step": "Q1..Q6 | verification | supporting",
  "question": "<verbatim>", "subquestions": [], "mandatory_subquestions": [] }

// completion
{ "status": "complete", "exit_path": "...", "profile_update_confidence": "normal|high|low",
  "profile": { "senecan_grade": "...", "typical_proximity": "...",
               "katorthoma_proximity_by_domain": {}, "dimension_levels": {},
               "direction_of_travel": "improving|stable|declining" },
  "profile_update_framing": { "mandatory_note": "<mirror note — surface verbatim>" } }

// distress on an answer
{ "status": "redirected", "severity": "moderate|acute",
  "suggested_user_message": "...", "flow_terminated": true }`}</pre>
        </div>
        <p className="font-body text-sm text-sage-600 leading-relaxed">
          Reflect-at-close is the default for agent integrations (opt out with <code>reflect_at_close:
          &quot;off&quot;</code>); the full Q1-Q6 sequence is never abbreviated. One metered loop per
          session-close pass.
        </p>
        <p className="font-body text-sm text-sage-600 leading-relaxed mt-2">
          A completion may additionally carry <code>developmental_priorities</code> (domains showing a
          sustained <code>deliberate</code>-level pattern in your own record &mdash; tracked, not
          intervened) and, only at the moment your grade changes, a <code>suggestion</code> in the same
          advisory shape as <code>/api/reason</code>&apos;s (see above).
        </p>
      </div>

      {/* Sage Calling — purpose discovery */}
      <div className="mt-12 bg-white/60 border border-sage-200 rounded-lg p-8">
        <h2 className="font-display text-xl font-medium text-sage-800 mb-4">
          Sage Calling &mdash; Purpose Discovery (<code>/api/calling</code>)
        </h2>
        <p className="font-body text-sage-700 mb-4 leading-relaxed">
          A deterministic Q1-Q6 purpose-discovery sequence. Auth: a credential carrying the
          <code> calling</code> capability (Authorization: Bearer only). It is <strong>not self-serve</strong>
          &mdash; a discovered purpose ends in an admin-approval Hard Gate (the operator approves via
          <code> POST /api/calling/approve</code>; an agent credential cannot approve its own handoff).
        </p>
        <div className="mb-4">
          <p className="font-display text-sm font-medium text-sage-600 mb-2">Request</p>
          <pre className="bg-sage-800 text-sage-100 rounded p-4 font-mono text-xs overflow-x-auto">{`{ "session_id": "...", "agent_id": "...",
  "response": "<omit on open; your answer thereafter>",
  "agent_card_url": "<optional https URL to your agent card>" }`}</pre>
        </div>
        <div className="mb-2">
          <p className="font-display text-sm font-medium text-sage-600 mb-2">Responses (HTTP 200, by status)</p>
          <pre className="bg-sage-800 text-sage-100 rounded p-4 font-mono text-xs overflow-x-auto">{`in_progress        { "stage": "Q1..Q6", "question": "<verbatim>" }
awaiting_approval  { "message": "..." }            // Hard Gate
null_result        { "clarification": "<template>" }
holding | timed_out                                // 24-hour holding pattern
redirected         { "severity": "moderate|acute", "suggested_user_message": "...", "flow_terminated": true }`}</pre>
        </div>
        <p className="font-body text-sm text-sage-600 leading-relaxed">
          Errors: 400 (body) / 401 (auth) / 404 (session) / 409 (state) / 503 (disabled or infra).
        </p>
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
            <p className="font-body text-sm text-sage-700">Boolean indicator of whether the action expresses the appropriate action given the context, virtue principles, and one&apos;s rational nature.</p>
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

      {/* Configuration honesty — no-practice disclaimer (R19e) */}
      <div className="mt-12 bg-white/60 border border-sage-200 rounded-lg p-8">
        <h2 className="font-display text-xl font-medium text-sage-800 mb-4">Configuration Honesty</h2>
        <p className="font-body text-sage-700 mb-4 leading-relaxed">
          This configuration — SageReasoning with Sage Assent, without Sage Reflect —
          supports virtue-grounded reasoning and credentialing within individual sessions.
          It is not an ongoing Stoic practice: it does not provide ongoing virtue
          development, progress tracking, or profile consolidation. Any credential it
          produces is a dated, scoped verdict covering only the reasoning actually
          examined — not evidence of continuous practice.
        </p>
        <p className="font-body text-sm text-sage-600 leading-relaxed">
          Rule R19e (configuration honesty): where the products are offered selectively,
          each configuration is documented for what it supports and does not support.
        </p>
      </div>
    </div>
  )
}
