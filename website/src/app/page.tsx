import { VIRTUES, ALIGNMENT_TIERS } from '@/lib/stoic-brain'

export default function HomePage() {
  return (
    <div>
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div
          className="absolute inset-0 opacity-20"
          style={{ backgroundImage: 'url(/images/Background.png)', backgroundSize: 'cover', backgroundPosition: 'center' }}
        />
        <div className="relative max-w-6xl mx-auto px-6 py-24 md:py-36 text-center">
          <img src="/images/sagelogo.PNG" alt="Sage leaf" className="w-28 h-28 mx-auto mb-8 drop-shadow-lg" />
          <h1 className="font-display text-4xl md:text-5xl font-medium text-sage-900 mb-4">
            sagereasoning
          </h1>
          <p className="font-display text-xl md:text-2xl italic text-sage-700 mb-6">
            Flourish together
          </p>
          <p className="font-body text-lg text-sage-800 max-w-2xl mx-auto mb-10 leading-relaxed">
            A single point of reference for humans and AI agents to measure, guide, and improve
            decisions against the standard of perfect Stoic sage reasoning.
          </p>
          <div className="flex justify-center gap-4">
            <a
              href="/score"
              className="px-6 py-3 bg-sage-400 text-white font-display rounded hover:bg-sage-500 transition-colors"
            >
              Score an Action
            </a>
            <a
              href="/api-docs"
              className="px-6 py-3 border border-sage-400 text-sage-700 font-display rounded hover:bg-sage-100 transition-colors"
            >
              API for Developers
            </a>
          </div>
        </div>
      </section>

      {/* Three Client Types */}
      <section className="max-w-6xl mx-auto px-6 py-20">
        <h2 className="font-display text-2xl md:text-3xl italic text-sage-800 text-center mb-12">
          Who is this for?
        </h2>
        <div className="grid md:grid-cols-3 gap-8">
          {[
            {
              title: 'Humans',
              desc: 'Seeking a Stoic decision-making framework to prompt virtuous action in daily life.',
              icon: '🏛️',
            },
            {
              title: 'AI Agents',
              desc: 'Seeking virtue-based internal reasoning grounded in 2,000 years of Stoic philosophy.',
              icon: '🤖',
            },
            {
              title: 'Developers',
              desc: 'Integrating Stoic reasoning into AI systems via a structured API and data reference.',
              icon: '⚙️',
            },
          ].map((client) => (
            <div key={client.title} className="bg-white/60 border border-sage-200 rounded-lg p-8 text-center">
              <div className="text-4xl mb-4">{client.icon}</div>
              <h3 className="font-display text-xl font-semibold text-sage-800 mb-3">{client.title}</h3>
              <p className="font-body text-sage-700 leading-relaxed">{client.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* The Four Virtues */}
      <section id="virtues" className="bg-sage-300/20 py-20">
        <div className="max-w-6xl mx-auto px-6">
          <h2 className="font-display text-2xl md:text-3xl italic text-sage-800 text-center mb-4">
            The Four Cardinal Virtues
          </h2>
          <p className="font-body text-sage-700 text-center max-w-2xl mx-auto mb-12">
            Every action is scored against these four pillars of Stoic philosophy,
            weighted by their relative importance to living well.
          </p>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {VIRTUES.map((virtue) => (
              <div key={virtue.id} className="bg-white/80 border border-sage-200 rounded-lg p-6 text-center">
                <img src={virtue.icon} alt={virtue.name} className="w-16 h-16 mx-auto mb-4" />
                <h3 className="font-display text-lg font-semibold text-sage-800">{virtue.name}</h3>
                <p className="font-display text-sm italic text-sage-600 mb-2">{virtue.greek}</p>
                <p className="font-body text-sm text-sage-700 leading-relaxed mb-3">{virtue.description}</p>
                <div className="inline-block px-3 py-1 bg-sage-100 rounded text-sm font-display">
                  Weight: {(virtue.weight * 100)}%
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="max-w-6xl mx-auto px-6 py-20">
        <h2 className="font-display text-2xl md:text-3xl italic text-sage-800 text-center mb-12">
          How Stoic Scoring Works
        </h2>
        <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
          {[
            {
              step: '1',
              title: 'Describe your action',
              desc: 'Tell us what you did (or plan to do), the context, and your intended outcome.',
            },
            {
              step: '2',
              title: 'Virtue analysis',
              desc: 'Each action is evaluated against Wisdom, Justice, Courage, and Temperance using weighted scoring.',
            },
            {
              step: '3',
              title: 'Receive your Sage alignment',
              desc: 'Get a 0–100 composite score, your alignment tier, reasoning, and a path for growth.',
            },
          ].map((item) => (
            <div key={item.step} className="text-center">
              <div className="w-12 h-12 rounded-full bg-sage-400 text-white font-display text-xl flex items-center justify-center mx-auto mb-4">
                {item.step}
              </div>
              <h3 className="font-display text-lg font-medium text-sage-800 mb-2">{item.title}</h3>
              <p className="font-body text-sage-700 leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Alignment Tiers */}
      <section className="bg-sage-300/20 py-20">
        <div className="max-w-4xl mx-auto px-6">
          <h2 className="font-display text-2xl md:text-3xl italic text-sage-800 text-center mb-12">
            Alignment Tiers
          </h2>
          <div className="space-y-3">
            {ALIGNMENT_TIERS.map((tier) => (
              <div key={tier.id} className="flex items-center gap-4 bg-white/60 border border-sage-200 rounded-lg p-4">
                <div
                  className="w-4 h-4 rounded-full flex-shrink-0"
                  style={{ backgroundColor: tier.color }}
                />
                <div className="flex-1">
                  <span className="font-display font-medium text-sage-800">{tier.label}</span>
                  <span className="font-body text-sage-600 ml-2 text-sm">({tier.range})</span>
                </div>
                <p className="font-body text-sm text-sage-700 hidden md:block">{tier.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="max-w-4xl mx-auto px-6 py-20 text-center">
        <h2 className="font-display text-2xl md:text-3xl text-sage-800 mb-4">
          Begin your path toward the Sage
        </h2>
        <p className="font-body text-sage-700 mb-8 max-w-xl mx-auto leading-relaxed">
          Whether you are a human seeking clarity or an AI agent seeking grounded reasoning,
          the Stoic Brain is your reference.
        </p>
        <a
          href="/auth"
          className="px-8 py-3 bg-sage-400 text-white font-display text-lg rounded hover:bg-sage-500 transition-colors"
        >
          Get Started
        </a>
      </section>
    </div>
  )
}
