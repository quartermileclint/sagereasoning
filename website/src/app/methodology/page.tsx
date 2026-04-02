import type { Metadata } from 'next'
import { VIRTUES } from '@/lib/stoic-brain'

export const metadata: Metadata = {
  title: 'Methodology — SageReasoning',
  description: 'How SageReasoning scores actions and documents against Stoic virtue — explained in plain language.',
}

export default function MethodologyPage() {
  return (
    <div className="max-w-3xl mx-auto px-6 py-16 font-body text-sage-800">
      <div className="mb-10">
        <h1 className="font-display text-3xl font-medium text-sage-900 mb-2">Methodology</h1>
        <p className="text-sage-600 text-sm italic">How scoring works — in plain language</p>
        <p className="mt-4 text-sage-700 leading-relaxed">
          Transparency is a core Stoic value. This page explains exactly how SageReasoning
          calculates your scores, where those criteria come from, and what the numbers mean.
        </p>
      </div>

      <section className="space-y-10 leading-relaxed">

        <div>
          <h2 className="font-display text-xl font-semibold text-sage-800 mb-3">The philosophical foundation</h2>
          <p>
            SageReasoning is based on <strong>Stoic virtue ethics</strong> &mdash; the idea that
            the only true good is virtue, and that flourishing comes from living in accordance
            with reason and nature, guided by the four cardinal virtues.
          </p>
          <p className="mt-3">
            Our scoring criteria are derived from primary Stoic texts, all in the public domain.
          </p>
        </div>

        <div>
          <h2 className="font-display text-xl font-semibold text-sage-800 mb-3">The Stoic Brain data</h2>
          <p>
            We encoded Stoic philosophy into a structured data file called the{' '}
            <strong>Stoic Brain</strong>. It defines:
          </p>
          <ul className="list-disc pl-6 mt-2 space-y-1 text-sage-700">
            <li>The four cardinal virtues and their unified assessment criteria</li>
            <li>16 sub-virtues (four per cardinal virtue)</li>
            <li>Preferred and dispreferred indifferents (health, wealth, reputation, etc.)</li>
            <li>Scoring criteria for each virtue at each level</li>
            <li>The katorthoma proximity level definitions</li>
          </ul>
          <p className="mt-3">
            The Stoic Brain framework overview is available at{' '}
            <a href="/api/stoic-brain" className="text-sage-600 underline hover:text-sage-800">
              /api/stoic-brain
            </a>{' '}
            with full scoring provided through the{' '}
            <a href="/api-docs" className="text-sage-600 underline hover:text-sage-800">API</a>.
            See the <a href="https://github.com/quartermileclint/sagereasoning/blob/main/LICENSE" className="text-sage-600 underline hover:text-sage-800">licence</a> for terms.
          </p>
        </div>

        <div>
          <h2 className="font-display text-xl font-semibold text-sage-800 mb-3">The four cardinal virtues</h2>
          <p className="mb-4">
            Each action is assessed against all four virtues as expressions of one unified excellence,
            not scored independently. This reflects the Stoic doctrine of the unity of virtue:
          </p>
          <div className="space-y-3">
            {VIRTUES.map((virtue) => (
              <div key={virtue.id}
                   className="flex items-start gap-4 bg-white/60 border border-sage-200 rounded-lg p-4">
                <div className="flex-shrink-0 w-12 h-12">
                  <img src={virtue.icon} alt={virtue.name}
                       className="w-12 h-12 object-contain" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-display font-semibold text-sage-800">{virtue.name}</span>
                    <span className="font-body text-sage-500 text-sm italic">({virtue.greek})</span>
                    <span className="ml-auto text-xs font-display font-medium px-2 py-0.5 bg-sage-100 rounded">
                      Unified Assessment
                    </span>
                  </div>
                  <p className="text-sm text-sage-700">{virtue.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div>
          <h2 className="font-display text-xl font-semibold text-sage-800 mb-3">Proximity levels</h2>
          <p className="mb-4">
            V3 evaluates your reasoning through a four-stage philosophical sequence and assigns a proximity level, measuring how close your thinking aligns with the Stoic sage ideal:
          </p>
          <div className="overflow-x-auto">
            <table className="w-full text-sm border-collapse">
              <thead>
                <tr className="bg-sage-100">
                  <th className="text-left px-3 py-2 border border-sage-200 font-display font-semibold">Proximity level</th>
                  <th className="text-left px-3 py-2 border border-sage-200 font-display font-semibold">What it means</th>
                </tr>
              </thead>
              <tbody>
                {[
                  ['sage_like', 'Self-assessment demonstrates extraordinary philosophical depth — identifies all relevant passions, false judgements, and virtue domains with precision'],
                  ['principled', 'Strong philosophical reasoning — correctly identifies most passions and applies the 4-stage evaluation with only minor gaps'],
                  ['deliberate', 'Adequate self-awareness — recognises some passions and applies basic Stoic framework, but misses subtleties'],
                  ['habitual', 'Minimal philosophical engagement — relies on surface-level reflection without genuine passion diagnosis'],
                  ['reflexive', 'No meaningful self-examination — responses show no awareness of passions, false judgements, or prohairesis'],
                ].map(([level, meaning], i) => (
                  <tr key={level} className={i % 2 === 1 ? 'bg-sage-50' : ''}>
                    <td className="px-3 py-2 border border-sage-200 font-mono text-sage-600">{level}</td>
                    <td className="px-3 py-2 border border-sage-200">{meaning}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="mt-3 text-sage-600 text-sm">
            The V3 evaluation applies a unified philosophical framework: <span className="font-mono">prohairesis filter → kathekon assessment → passion diagnosis → unified virtue assessment</span>
          </p>
        </div>

        {/* Alignment tiers section removed — V3 uses katorthoma proximity levels (see table above) */}

        <div>
          <h2 className="font-display text-xl font-semibold text-sage-800 mb-3">The V3 four-stage evaluation sequence</h2>
          <p className="mb-3">
            V3 evaluates actions through a structured philosophical framework with four stages:
          </p>
          <ol className="list-decimal pl-6 space-y-2 text-sage-700 mb-4">
            <li><strong>Prohairesis filter:</strong> What is within your moral choice? What lies outside it?</li>
            <li><strong>Kathekon assessment:</strong> Is this action appropriate to your role and station?</li>
            <li><strong>Passion diagnosis:</strong> Which passions, false judgements, or preferred indifferents distorted your reasoning?</li>
            <li><strong>Unified virtue assessment:</strong> How close does this thinking come to the sage ideal?</li>
          </ol>
          <p className="mb-3">
            The four virtues — practical wisdom, justice, courage, and temperance — are assessed as expressions of one unified excellence, not scored independently. This reflects the Stoic doctrine of the unity of virtue.
          </p>
          <h3 className="font-display font-medium text-sage-800 mb-2 mt-4">Evaluation workflow</h3>
          <p>
            When you submit an action, document, or post for scoring, the following happens:
          </p>
          <ol className="list-decimal pl-6 mt-2 space-y-2 text-sage-700">
            <li>Your text is sent to Claude (Anthropic&rsquo;s AI) along with the V3 evaluation criteria.</li>
            <li>Claude evaluates your text through the 4-stage sequence and assigns a proximity level from reflexive to sage_like.</li>
            <li>Claude generates explanatory reasoning for the assessment, identifying passions and false judgements where present.</li>
            <li>Results are returned and stored in your history.</li>
          </ol>
          <p className="mt-3 text-sage-600 text-sm italic">
            See our <a href="/transparency" className="underline hover:text-sage-800">AI Transparency Statement</a> for
            details on limitations and how to challenge a score.
          </p>
        </div>

        <div>
          <h2 className="font-display text-xl font-semibold text-sage-800 mb-3">What scores don&rsquo;t measure</h2>
          <p>Stoic virtue scoring is explicitly not:</p>
          <ul className="list-disc pl-6 mt-2 space-y-1 text-sage-700">
            <li>A measure of your worth as a person</li>
            <li>A measure of your intelligence or competence</li>
            <li>A personality assessment or psychological profile</li>
            <li>A measure of outcomes (a Stoically virtuous action may still result in a poor outcome — that is not within our control)</li>
          </ul>
          <p className="mt-3">
            The Stoics held that virtue is entirely within our control, and that outcomes are not.
            A proximity level of &ldquo;habitual&rdquo; on one action does not mean you are a bad person &mdash; it means there
            may be room to reflect on how virtue could guide that type of action more fully.
          </p>
        </div>

      </section>

      <div className="mt-12 pt-6 border-t border-sage-200 text-center">
        <p className="text-sage-500 text-xs">
          Questions about methodology?{' '}
          <a href="mailto:support@sagereasoning.com" className="underline hover:text-sage-700">
            Contact us
          </a>
        </p>
      </div>
    </div>
  )
}
