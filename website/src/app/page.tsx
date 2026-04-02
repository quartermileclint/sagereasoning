import { VIRTUES, ALIGNMENT_TIERS } from '@/lib/stoic-brain'

const jsonLd = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'WebSite',
      '@id': 'https://www.sagereasoning.com/#website',
      url: 'https://www.sagereasoning.com',
      name: 'SageReasoning',
      description: 'A single point of reference for Stoic-based reasoning for humans and AI agents to measure, guide, and improve decisions against the standard of perfect Stoic sage reasoning.',
      potentialAction: {
        '@type': 'SearchAction',
        target: 'https://www.sagereasoning.com/score',
        'query-input': 'required name=action',
      },
    },
    {
      '@type': 'Organization',
      '@id': 'https://www.sagereasoning.com/#organization',
      name: 'SageReasoning',
      url: 'https://www.sagereasoning.com',
      logo: 'https://www.sagereasoning.com/images/sagelogo.PNG',
      description: 'Provider of Stoic reasoning frameworks for humans and AI agents.',
      sameAs: ['https://github.com/quartermileclint/sagereasoning'],
    },
    {
      '@type': 'Dataset',
      '@id': 'https://www.sagereasoning.com/#stoic-brain',
      name: 'Stoic Brain',
      description: 'A machine-readable encoding of Stoic philosophy covering the four cardinal virtues (Wisdom, Justice, Courage, Temperance), 16 sub-virtues, preferred and dispreferred indifferents, and action-scoring rules. Derived from original Stoic texts by Marcus Aurelius, Epictetus, Seneca, and Cicero.',
      url: 'https://www.sagereasoning.com/api/stoic-brain',
      distribution: {
        '@type': 'DataDownload',
        encodingFormat: 'application/json',
        contentUrl: 'https://www.sagereasoning.com/api/stoic-brain',
      },
      license: 'https://opensource.org/licenses/MIT',
      creator: { '@id': 'https://www.sagereasoning.com/#organization' },
      keywords: ['stoicism', 'virtue ethics', 'AI reasoning', 'decision framework', 'ethical AI', 'moral philosophy', 'flourishing', 'eudaimonia'],
    },
  ],
}

export default function HomePage() {
  return (
    <div>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div
          className="absolute inset-0 opacity-20"
          style={{ backgroundImage: 'url(/images/Background.png)', backgroundSize: 'cover', backgroundPosition: 'center' }}
        />
        <div className="relative max-w-6xl mx-auto px-6 py-24 md:py-36 text-center">
          <img src="/images/sagelogo.PNG" alt="Sage leaf" className="w-36 h-36 mx-auto mb-8 drop-shadow-lg object-contain" />
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
            Every evaluation considers the unified expression of these four pillars of Stoic philosophy.
            They are inseparable aspects of a single good character &mdash; not scored independently, but assessed as one whole.
          </p>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {VIRTUES.map((virtue) => (
              <div key={virtue.id} className="bg-white/80 border border-sage-200 rounded-lg p-6 text-center">
                {/* Fixed-size container ensures all logos appear the same size regardless of source dimensions */}
                <div className="w-40 h-40 mx-auto mb-4 flex items-center justify-center">
                  <img
                    src={virtue.icon}
                    alt={virtue.name}
                    className="w-40 h-40 object-contain drop-shadow-md"
                  />
                </div>
                <h3 className="font-display text-lg font-semibold text-sage-800">{virtue.name}</h3>
                <p className="font-display text-sm italic text-sage-600 mb-2">{virtue.greek}</p>
                <p className="font-body text-sm text-sage-700 leading-relaxed mb-3">{virtue.description}</p>
                <div className="inline-block px-3 py-1 bg-sage-100 rounded text-sm font-display text-sage-600">
                  Unified Assessment
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
              desc: 'Get a qualitative proximity assessment, passion diagnosis, reasoning, and a path for growth.',
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
          <h2 className="font-display text-2xl md:text-3xl italic text-sage-800 text-center mb-4">
            Alignment Tiers
          </h2>
          <p className="font-body text-sage-700 text-center max-w-2xl mx-auto mb-10">
            Your actions are measured against the standard of the perfect Stoic Sage.
          </p>

          {/* Zeus — the ideal of the perfect Sage */}
          <div className="flex flex-col items-center mb-10">
            <div className="relative">
              <img
                src="/images/Zeus.PNG"
                alt="The Perfect Sage"
                className="w-40 h-40 object-contain drop-shadow-xl rounded-full border-4 border-amber-200 bg-amber-50/60"
              />
              <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 bg-amber-100 border border-amber-300 rounded-full px-3 py-0.5">
                <span className="font-display text-xs text-amber-800 whitespace-nowrap">The Perfect Sage (100)</span>
              </div>
            </div>
          </div>

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

      {/* Community Map */}
      <section className="max-w-6xl mx-auto px-6 py-20 text-center">
        <h2 className="font-display text-2xl md:text-3xl italic text-sage-800 mb-4">
          Sages Around the World
        </h2>
        <p className="font-body text-sage-700 mb-8 max-w-xl mx-auto leading-relaxed">
          Join a growing community of people applying Stoic virtue to their daily decisions.
        </p>
        <a
          href="/community"
          className="inline-block px-6 py-3 border border-sage-400 text-sage-700 font-display rounded hover:bg-sage-100 transition-colors"
        >
          View the Community Map
        </a>
      </section>

      {/* CTA */}
      <section className="max-w-4xl mx-auto px-6 py-20 text-center border-t border-sage-100">
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
