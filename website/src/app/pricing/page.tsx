'use client'

// Note: Metadata export moved to layout or head component since this is now a client component.
// Page title is set via the <title> tag in the head or a parent layout.

/* ── Free-tier limits by skill type (developer pricing) ─────────────── */
const developerTiers = [
  {
    skill: 'sage-guard',
    label: 'sage-guard',
    description: 'Sub-100ms decision gate',
    price: '~$0.0025/call',
    freeTier: '500 calls/month',
    speed: '<100ms',
  },
  {
    skill: 'sage-reason',
    label: 'sage-reason (quick / standard / deep)',
    description: 'Core reasoning engine — 3, 5, or 6 mechanisms',
    price: '~$0.18/call',
    freeTier: '100 calls/month',
    speed: '~2–4s',
  },
  {
    skill: 'sage-score',
    label: 'sage-score',
    description: 'Pre-action decision audit with structured reasoning',
    price: '~$0.18/call',
    freeTier: '100 calls/month',
    speed: '~2s',
  },
  {
    skill: 'sage-iterate',
    label: 'sage-iterate',
    description: 'Iterative decision refinement chains',
    price: '~$0.18/iteration',
    freeTier: '50 chains/month',
    speed: '~2s per iteration',
  },
  {
    skill: 'evaluation-skills',
    label: 'Evaluation skills',
    description: 'sage-decide, sage-audit, sage-converse, sage-scenario, sage-reflect, sage-classify, sage-prioritise, sage-moderate',
    price: '~$0.18/call',
    freeTier: '100 calls/month',
    speed: '~2–3s',
  },
  {
    skill: 'marketplace-skills',
    label: 'Marketplace skills',
    description: 'sage-premortem, sage-negotiate, sage-invest, sage-pivot, sage-retro, sage-align, sage-resolve, sage-coach, sage-govern, sage-compliance, sage-educate, sage-identity',
    price: '~$0.18/call',
    freeTier: '50 calls/month',
    speed: '~3–4s',
  },
  {
    skill: 'premium-skills',
    label: 'Premium skills',
    description: 'sage-diagnose (14 or 55 assessments), sage-profile (agent baseline)',
    price: '~$0.50/call',
    freeTier: '25 calls/month',
    speed: '~2–3s',
  },
  {
    skill: 'sage-context',
    label: 'sage-context',
    description: 'Stoic Brain conceptual overview — no auth needed',
    price: 'Free',
    freeTier: 'Unlimited',
    speed: '<50ms',
  },
]

export default function PricingPage() {
  return (
    <div className="max-w-5xl mx-auto px-6 py-16">
      {/* ── Header ─────────────────────────────────────────────────────── */}
      <div className="text-center mb-14">
        <h1 className="font-display text-3xl md:text-4xl font-medium text-sage-900 mb-3">
          Simple, honest pricing
        </h1>
        <p className="font-body text-lg text-sage-700 max-w-xl mx-auto leading-relaxed">
          Every feature is free for humans — no limits, no tiers, no catch. Developers
          get generous free allowances with transparent per-call pricing beyond that.
        </p>
      </div>

      {/* ── Human pricing: everything free ─────────────────────────────── */}
      <div className="rounded-xl border border-sage-300 bg-sage-50 shadow-lg p-8 mb-10">
        <div className="text-center mb-6">
          <h2 className="font-display text-2xl font-semibold text-sage-900 mb-1">
            For Humans
          </h2>
          <p className="font-body text-sage-600">
            Wisdom should be shared freely. Every feature is yours — no restrictions.
          </p>
        </div>

        <div className="text-center mb-6">
          <span className="font-display text-5xl font-bold text-sage-900">Free</span>
          <p className="font-body text-sm text-sage-500 mt-1">forever — no credit card required</p>
        </div>

        <ul className="grid sm:grid-cols-2 gap-x-8 gap-y-2 max-w-2xl mx-auto mb-8">
          {[
            'Unlimited action scoring',
            'Baseline Stoic assessment (retake anytime)',
            'Personal dashboard with full score history',
            'Document scoring and trust badges',
            'Policy and contract review',
            'Social Media Filter (unlimited)',
            'The Path of the Prokoptos journal (all 56 days)',
            'Ethical Scenarios (all age groups)',
            'Daily journal with AI sage perspective',
            'Score history export (CSV)',
            'Stoic Brain framework overview',
            'sage-guard decision gate (unlimited)',
            'sage-reason analysis (10 per day)',
          ].map((f) => (
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

        <div className="text-center">
          <a
            href="/auth"
            className="inline-block px-8 py-3 bg-sage-400 text-white font-display rounded hover:bg-sage-500 transition-colors"
          >
            Get started free
          </a>
        </div>
      </div>

      {/* ── Voluntary tidings ──────────────────────────────────────────── */}
      <TidingsSection />

      {/* ── Developer pricing ──────────────────────────────────────────── */}
      <div className="mb-16">
        <div className="text-center mb-8">
          <h2 className="font-display text-2xl font-semibold text-sage-900 mb-1">
            For Developers &amp; AI Agents
          </h2>
          <p className="font-body text-sage-600 max-w-2xl mx-auto">
            Every skill comes with a generous free tier. Beyond that, transparent per-call
            pricing — anchored at half the lowest competitor or less.
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="bg-sage-200">
                <th className="text-left px-4 py-3 border border-sage-300 font-display font-semibold">Skill</th>
                <th className="text-left px-4 py-3 border border-sage-300 font-display font-semibold">Free tier</th>
                <th className="text-left px-4 py-3 border border-sage-300 font-display font-semibold">Paid price</th>
                <th className="text-left px-4 py-3 border border-sage-300 font-display font-semibold hidden sm:table-cell">Speed</th>
              </tr>
            </thead>
            <tbody>
              {developerTiers.map((tier, i) => (
                <tr key={tier.skill} className={i % 2 === 1 ? 'bg-sage-50' : ''}>
                  <td className="px-4 py-3 border border-sage-300">
                    <span className="font-display font-medium text-sage-800">{tier.label}</span>
                    <p className="text-xs text-sage-500 mt-0.5">{tier.description}</p>
                  </td>
                  <td className="px-4 py-3 border border-sage-300 font-medium text-sage-700">
                    {tier.freeTier}
                  </td>
                  <td className="px-4 py-3 border border-sage-300 text-sage-700">
                    {tier.price}
                  </td>
                  <td className="px-4 py-3 border border-sage-300 text-sage-500 hidden sm:table-cell">
                    {tier.speed}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="mt-6 text-center">
          <DeveloperUpgradeButton />
        </div>

        <div className="mt-4 flex flex-col sm:flex-row gap-4 text-sm text-sage-600">
          <p className="flex-1">
            All paid tiers include configurable rate limits (default 500 calls/day), up to 3
            deliberation iterations per chain, and full access to every skill.
          </p>
          <a
            href="/api-docs"
            className="inline-block self-start px-6 py-2.5 border border-sage-300 text-sage-700 font-display rounded hover:bg-sage-100 transition-colors"
          >
            View API docs
          </a>
        </div>

        <p className="mt-3 text-xs text-sage-500 italic">
          No long-term contracts. Pay only for what you use beyond the free tier.
          Contact <a href="mailto:zeus@sagereasoning.com" className="underline">zeus@sagereasoning.com</a> for
          volume pricing or custom limits.
        </p>
      </div>

      {/* ── Manage billing ─────────────────────────────────────────────── */}
      <BillingPortalLink />

      {/* ── FAQ ────────────────────────────────────────────────────────── */}
      <div className="max-w-2xl mx-auto">
        <h2 className="font-display text-xl font-semibold text-sage-800 mb-6 text-center">Pricing FAQ</h2>
        <div className="space-y-6 font-body text-sage-700 leading-relaxed">
          <div>
            <p className="font-display font-medium text-sage-800 mb-1">Why is everything free for humans?</p>
            <p>
              Wisdom should be shared freely. Stoic philosophy belongs to everyone, not just
              those who can afford a subscription. We believe keeping every human feature free
              and unrestricted is the right thing to do — not a marketing tactic.
            </p>
          </div>
          <div>
            <p className="font-display font-medium text-sage-800 mb-1">What are tidings?</p>
            <p>
              Tidings are entirely voluntary contributions from people who find value in
              SageReasoning. They do not unlock any additional features — everything is
              already free. Think of them as a way to say &ldquo;this helped me&rdquo; and
              support the platform&apos;s continued development.
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
            <p className="font-display font-medium text-sage-800 mb-1">How does developer pricing work?</p>
            <p>
              Every API skill comes with a generous free tier so you can evaluate without
              commitment. Beyond the free allowance, you pay per call at transparent,
              competitor-anchored rates — typically half or less than the nearest alternative.
              No subscriptions, no lock-in.
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
        </div>
      </div>
    </div>
  )
}


// =============================================================================
// CLIENT COMPONENTS — Stripe-connected interactive buttons
// =============================================================================

/**
 * TidingsSection — Voluntary tidings with Stripe Checkout.
 * Client component because it needs onClick handlers and form state.
 */
function TidingsSection() {
  return (
    <div className="bg-white/60 border border-sage-200 rounded-xl p-8 text-center mb-16">
      <h2 className="font-display text-xl font-semibold text-sage-800 mb-2">
        Support the Platform
      </h2>
      <p className="font-body text-sage-700 max-w-xl mx-auto leading-relaxed mb-6">
        If SageReasoning adds value to your life, you can support us through a voluntary
        tiding. In the Stoic tradition — sharing freely while accepting support gratefully.
      </p>
      <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
        {/* One-off tiding */}
        <div className="flex items-center gap-2 border border-sage-300 rounded-lg px-4 py-3 bg-white">
          <span className="font-body text-sage-600 text-sm">One-off:</span>
          <span className="font-display font-semibold text-sage-800">$</span>
          <input
            type="number"
            defaultValue={20}
            min={1}
            max={1000}
            id="tiding-once-amount"
            className="w-16 font-display font-semibold text-sage-800 text-center border-b border-sage-300 bg-transparent focus:outline-none focus:border-sage-500"
            aria-label="One-off tiding amount"
          />
          <TidingButton recurring={false} />
        </div>

        {/* Monthly tiding */}
        <div className="flex items-center gap-2 border border-sage-300 rounded-lg px-4 py-3 bg-white">
          <span className="font-body text-sage-600 text-sm">Monthly:</span>
          <span className="font-display font-semibold text-sage-800">$</span>
          <input
            type="number"
            defaultValue={10}
            min={1}
            max={1000}
            id="tiding-monthly-amount"
            className="w-16 font-display font-semibold text-sage-800 text-center border-b border-sage-300 bg-transparent focus:outline-none focus:border-sage-500"
            aria-label="Monthly tiding amount"
          />
          <span className="font-body text-sage-500 text-sm">/mo</span>
          <TidingButton recurring={true} />
        </div>
      </div>
      <p className="mt-3 text-xs text-sage-400 italic">
        Tidings are entirely voluntary and do not unlock additional features.
      </p>
    </div>
  )
}

/**
 * TidingButton — Submits a tiding to /api/billing/tidings.
 * Uses a form action pattern compatible with server components.
 */
function TidingButton({ recurring }: { recurring: boolean }) {
  const label = recurring ? 'Give monthly' : 'Give once'
  const inputId = recurring ? 'tiding-monthly-amount' : 'tiding-once-amount'

  return (
    <form
      action={`/api/billing/tidings`}
      method="POST"
      onSubmit={async (e) => {
        e.preventDefault()
        const amountInput = document.getElementById(inputId) as HTMLInputElement | null
        const amount = amountInput ? parseInt(amountInput.value, 10) : (recurring ? 10 : 20)

        try {
          const res = await fetch('/api/billing/tidings', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ recurring, amount }),
          })

          if (res.status === 401) {
            // Not signed in — redirect to auth
            window.location.href = '/auth?redirect=/pricing'
            return
          }

          const data = await res.json()
          if (data.url) {
            window.location.href = data.url
          } else {
            alert(data.error || 'Something went wrong. Please try again.')
          }
        } catch {
          alert('Network error. Please check your connection and try again.')
        }
      }}
    >
      <button
        type="submit"
        className="ml-2 px-4 py-1.5 bg-sage-400 text-white font-display text-sm rounded hover:bg-sage-500 transition-colors"
      >
        {label}
      </button>
    </form>
  )
}

/**
 * DeveloperUpgradeButton — Redirects developers to Stripe Checkout for paid tier.
 */
function DeveloperUpgradeButton() {
  return (
    <form
      onSubmit={async (e) => {
        e.preventDefault()
        try {
          const res = await fetch('/api/billing/checkout', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ type: 'developer_paid' }),
          })

          if (res.status === 401) {
            window.location.href = '/auth?redirect=/pricing'
            return
          }

          const data = await res.json()
          if (data.url) {
            window.location.href = data.url
          } else {
            alert(data.error || 'Something went wrong. Please try again.')
          }
        } catch {
          alert('Network error. Please check your connection and try again.')
        }
      }}
    >
      <button
        type="submit"
        className="px-8 py-3 bg-sage-700 text-white font-display rounded hover:bg-sage-800 transition-colors"
      >
        Upgrade to paid tier
      </button>
    </form>
  )
}

/**
 * BillingPortalLink — Link to Stripe Billing Portal for existing customers.
 */
function BillingPortalLink() {
  return (
    <div className="text-center mb-12">
      <p className="font-body text-sm text-sage-500 mb-2">Already a paying customer?</p>
      <form
        onSubmit={async (e) => {
          e.preventDefault()
          try {
            const res = await fetch('/api/billing/portal', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
            })

            if (res.status === 401) {
              window.location.href = '/auth?redirect=/pricing'
              return
            }

            const data = await res.json()
            if (data.url) {
              window.location.href = data.url
            } else if (res.status === 404) {
              alert('No billing account found. You have not made any payments yet.')
            } else {
              alert(data.error || 'Something went wrong.')
            }
          } catch {
            alert('Network error. Please check your connection.')
          }
        }}
      >
        <button
          type="submit"
          className="text-sage-600 underline font-body text-sm hover:text-sage-800 transition-colors"
        >
          Manage billing and invoices
        </button>
      </form>
    </div>
  )
}
