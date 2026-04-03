import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Pricing — SageReasoning',
  description: 'Simple, Stoic-aligned pricing. Core wisdom stays free. Premium features for those who go deeper.',
}

// ── PRICING PLACEHOLDER ───────────────────────────────────────────────────────
// TODO (Priority 10 — Phase 2): This page displays planned pricing tiers.
// Before going live:
//   1. Integrate Stripe (stripe.com) for payment processing
//   2. Add subscription management (upgrade, downgrade, cancel) to /dashboard
//   3. Implement API key management with usage-based billing
//   4. Wire up /api/subscribe endpoint
//   5. Update Supabase user profiles with tier field
// All buttons below are static placeholders — they do not process payments yet.
// ─────────────────────────────────────────────────────────────────────────────

const tiers = [
  {
    id: 'agora',
    name: 'The Agora',
    tagline: 'Free — always',
    price: '$0',
    period: '',
    description: 'Core Stoic wisdom should be accessible to everyone. The Agora gives you everything you need to begin the path.',
    features: [
      'Score up to 5 actions per day',
      'Baseline Stoic assessment (annual retake)',
      'Personal dashboard with score history',
      'Ethical Scenarios (all age groups)',
      'Social Media Filter (5 per day)',
      'The Path of the Prokoptos journal (all 56 days)',
      'Stoic Brain framework overview',
      'AI Agent API (1 free evaluation call/day)',
    ],
    cta: 'Get started free',
    ctaHref: '/auth',
    highlight: false,
    stoicNote: 'Wisdom needs no paywall.',
  },
  {
    id: 'prokoptos',
    name: 'Prokoptos',
    tagline: 'The progressing one',
    price: '$7',
    period: '/month',
    annualNote: 'or $60/year (save $24)',
    description: 'For those committed to daily Stoic practice. Prokoptos — the one making progress — is the highest aspiration in living Stoicism.',
    features: [
      'Everything in The Agora',
      'Unlimited action scoring',
      'Document scoring and badges (unlimited)',
      'Policy review (unlimited)',
      'Social Media Filter (unlimited)',
      'Daily journal with AI sage perspective',
      'Score history export (CSV)',
      'Priority API access',
    ],
    cta: 'Coming soon',
    ctaHref: '#pricing-placeholder',
    highlight: true,
    stoicNote: 'Less than a single coffee per week. Temperance in pricing is a virtue too.',
  },
  {
    id: 'api',
    name: 'API Access',
    tagline: 'For developers and AI agents',
    price: 'Usage-based',
    period: '',
    annualNote: 'Free evaluation tier included',
    description: 'Integrate the Stoic Brain into your AI systems. Free tier for evaluation, paid tier for production — per-call pricing from $0.0025 (cheapest in market).',
    features: [
      'Free tier: 1 API call/day for evaluation',
      'Paid tier: configurable limits (default 500/day)',
      'Deliberation chains: 1 iteration (free) / 3 (paid)',
      'Stoic Brain conceptual overview always free',
      'Full API documentation',
      'Usage dashboard',
    ],
    cta: 'View API docs',
    ctaHref: '/api-docs',
    highlight: false,
    stoicNote: 'The Stoic Brain framework overview is free to explore. Detailed scoring and virtue analysis are provided through the API.',
  },
]

export default function PricingPage() {
  return (
    <div className="max-w-5xl mx-auto px-6 py-16">
      <div className="text-center mb-14">
        <h1 className="font-display text-3xl md:text-4xl font-medium text-sage-900 mb-3">
          Simple, honest pricing
        </h1>
        <p className="font-body text-lg text-sage-700 max-w-xl mx-auto leading-relaxed">
          Core Stoic wisdom stays free. We charge only where we provide substantial additional
          value, and never through manipulation or artificial scarcity.
        </p>
        <div className="mt-4 inline-block px-4 py-2 bg-amber-50 border border-amber-200 rounded text-amber-800 text-sm font-body">
          <strong>Note:</strong> Paid tiers are coming soon. All features are currently free while
          the payment system is being set up.
          {/* TODO (Phase 2): Remove this notice once Stripe integration is complete */}
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-6 mb-16">
        {tiers.map((tier) => (
          <div
            key={tier.id}
            className={`rounded-xl border p-6 flex flex-col ${
              tier.highlight
                ? 'border-sage-400 bg-sage-50 shadow-lg ring-2 ring-sage-300'
                : 'border-sage-200 bg-white/70'
            }`}
          >
            {tier.highlight && (
              <div className="text-center mb-3">
                <span className="inline-block px-3 py-0.5 bg-sage-400 text-white text-xs font-display rounded-full">
                  Most popular
                </span>
              </div>
            )}
            <div className="mb-4">
              <h2 className="font-display text-xl font-semibold text-sage-800">{tier.name}</h2>
              <p className="font-body text-sm italic text-sage-500 mb-3">{tier.tagline}</p>
              <div className="flex items-baseline gap-1">
                <span className="font-display text-3xl font-bold text-sage-900">{tier.price}</span>
                {tier.period && (
                  <span className="font-body text-sage-500 text-sm">{tier.period}</span>
                )}
              </div>
              {tier.annualNote && (
                <p className="font-body text-xs text-sage-500 mt-1">{tier.annualNote}</p>
              )}
              <p className="font-body text-sm text-sage-700 mt-3 leading-relaxed">{tier.description}</p>
            </div>

            <ul className="space-y-2 mb-6 flex-1">
              {tier.features.map((f) => (
                <li key={f} className="flex items-start gap-2 font-body text-sm text-sage-700">
                  <svg className="w-4 h-4 text-sage-400 mt-0.5 flex-shrink-0" fill="none"
                       stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                          d="M5 13l4 4L19 7" />
                  </svg>
                  {f}
                </li>
              ))}
            </ul>

            <a
              href={tier.ctaHref}
              className={`block text-center px-4 py-2.5 rounded font-display transition-colors ${
                tier.highlight
                  ? 'bg-sage-400 text-white hover:bg-sage-500'
                  : 'border border-sage-300 text-sage-700 hover:bg-sage-100'
              }`}
            >
              {tier.cta}
            </a>

            <p className="mt-4 text-xs text-sage-400 italic text-center leading-snug">
              {tier.stoicNote}
            </p>
          </div>
        ))}
      </div>

      {/* Voluntary contributions */}
      <div className="bg-white/60 border border-sage-200 rounded-xl p-8 text-center mb-12">
        <h2 className="font-display text-xl font-semibold text-sage-800 mb-2">Support the Agora</h2>
        <p className="font-body text-sage-700 max-w-xl mx-auto leading-relaxed mb-4">
          If SageReasoning has added value to your life and you use the free tier, you can
          support the platform through a voluntary contribution. In Stoic tradition, sharing
          freely while accepting support gratefully.
        </p>
        <button
          disabled
          className="px-6 py-2.5 border border-sage-300 text-sage-500 font-display rounded cursor-not-allowed opacity-60"
        >
          Contribute (coming soon)
          {/* TODO (Phase 2): Connect to Stripe one-time payment or Buy Me a Coffee */}
        </button>
      </div>

      {/* FAQ */}
      <div className="max-w-2xl mx-auto">
        <h2 className="font-display text-xl font-semibold text-sage-800 mb-6 text-center">Pricing FAQ</h2>
        <div className="space-y-6 font-body text-sage-700 leading-relaxed">
          <div>
            <p className="font-display font-medium text-sage-800 mb-1">Why is the free tier so generous?</p>
            <p>
              Wisdom should be shared freely. The journal, baseline assessment, and daily
              scoring are the core of what SageReasoning offers — keeping them free is a
              deliberate value alignment, not a marketing tactic.
            </p>
          </div>
          <div>
            <p className="font-display font-medium text-sage-800 mb-1">Will there ever be advertising?</p>
            <p>
              No. Advertising would create perverse incentives and undermine the integrity of a
              virtue-reasoning platform. We will never sell your data or inject third-party ads.
            </p>
          </div>
          <div>
            <p className="font-display font-medium text-sage-800 mb-1">What does &ldquo;Prokoptos&rdquo; mean?</p>
            <p>
              <em>Prokoptos</em> means &ldquo;the one making progress&rdquo; — not yet a sage,
              but genuinely advancing toward virtue. It is the highest aspiration for a living
              person on the Stoic path.
            </p>
          </div>
          <div>
            <p className="font-display font-medium text-sage-800 mb-1">Can I cancel at any time?</p>
            <p>
              Yes. There are no lock-in contracts. You can downgrade to the free tier at any time
              and keep all your score history.
              {/* TODO (Phase 2): Confirm cancellation policy once Stripe is integrated */}
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
