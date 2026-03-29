import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'AI Transparency Statement — SageReasoning',
  description: 'How SageReasoning uses AI, its limitations, and how outputs can be challenged.',
}

export default function TransparencyPage() {
  return (
    <div className="max-w-3xl mx-auto px-6 py-16 font-body text-sage-800">
      <div className="mb-10">
        <h1 className="font-display text-3xl font-medium text-sage-900 mb-2">AI Transparency Statement</h1>
        <p className="text-sage-600 text-sm italic">Last updated: March 2026</p>
        <p className="mt-4 text-sage-700 leading-relaxed">
          SageReasoning is built on artificial intelligence. We believe you deserve a clear,
          honest explanation of how that AI works, what it can and cannot do, and what your
          rights are as a user.
        </p>
      </div>

      <section className="space-y-8 leading-relaxed">

        <div>
          <h2 className="font-display text-xl font-semibold text-sage-800 mb-3">Which AI model do we use?</h2>
          <p>
            All scoring, reasoning, journal feedback, and scenario generation on SageReasoning is
            powered by <strong>Claude</strong>, a large language model developed by{' '}
            <a href="https://www.anthropic.com" target="_blank" rel="noopener noreferrer"
               className="text-sage-600 underline hover:text-sage-800">
              Anthropic
            </a>.
            We provide Claude with a structured prompt containing the Stoic Brain data (virtue
            definitions, scoring weights, and evaluation rules) and your submitted text. Claude then generates
            a virtue score and explanatory reasoning. The scoring weights and rules are applied
            server-side and are not publicly exposed.
          </p>
        </div>

        <div>
          <h2 className="font-display text-xl font-semibold text-sage-800 mb-3">What is the Stoic Brain?</h2>
          <p>
            The <strong>Stoic Brain</strong> is a machine-readable data file we created that encodes
            core Stoic philosophy: the four cardinal virtues (Wisdom, Justice, Courage, Temperance),
            their sub-virtues, preferred and dispreferred indifferents, and scoring
            criteria. It is derived from original texts by Marcus Aurelius, Epictetus, Seneca,
            and Cicero &mdash; all in the public domain.
          </p>
          <p className="mt-3">
            A conceptual overview of the Stoic Brain (virtue names, sub-virtue names, tier definitions)
            is publicly available for evaluation. Detailed scoring weights, formulas, and criteria are
            proprietary and applied server-side through the{' '}
            <a href="/api-docs" className="text-sage-600 underline hover:text-sage-800">API</a>.
            The data is published under the{' '}
            <a href="https://github.com/quartermileclint/sagereasoning/blob/main/LICENSE"
               className="text-sage-600 underline hover:text-sage-800"
               target="_blank" rel="noopener noreferrer">
              SageReasoning Proprietary Licence
            </a>.
            See our <a href="/methodology" className="text-sage-600 underline hover:text-sage-800">Methodology</a>{' '}
            page for a full explanation of how scoring works.
          </p>
        </div>

        <div>
          <h2 className="font-display text-xl font-semibold text-sage-800 mb-3">What AI can and cannot do</h2>
          <div className="overflow-x-auto mt-3">
            <table className="w-full text-sm border-collapse">
              <thead>
                <tr className="bg-sage-100">
                  <th className="text-left px-3 py-2 border border-sage-200 font-display font-semibold w-1/2">AI can</th>
                  <th className="text-left px-3 py-2 border border-sage-200 font-display font-semibold w-1/2">AI cannot</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="px-3 py-2 border border-sage-200">Apply Stoic virtue criteria consistently across submissions</td>
                  <td className="px-3 py-2 border border-sage-200">Definitively determine the &ldquo;right&rdquo; Stoic answer — these are philosophical judgements, not facts</td>
                </tr>
                <tr className="bg-sage-50">
                  <td className="px-3 py-2 border border-sage-200">Generate thoughtful, evidence-based reasoning</td>
                  <td className="px-3 py-2 border border-sage-200">Guarantee its reasoning is free from errors or cultural bias</td>
                </tr>
                <tr>
                  <td className="px-3 py-2 border border-sage-200">Adapt scoring to context you provide</td>
                  <td className="px-3 py-2 border border-sage-200">Understand context it hasn&rsquo;t been given</td>
                </tr>
                <tr className="bg-sage-50">
                  <td className="px-3 py-2 border border-sage-200">Produce scores reproducibly from the same prompt</td>
                  <td className="px-3 py-2 border border-sage-200">Always produce identical results for semantically similar inputs</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <div>
          <h2 className="font-display text-xl font-semibold text-sage-800 mb-3">Known limitations</h2>
          <ul className="list-disc pl-6 space-y-2 text-sage-700">
            <li>
              <strong>AI hallucination:</strong> Claude may occasionally generate plausible-sounding
              but inaccurate reasoning. Scores should be treated as starting points for reflection,
              not authoritative verdicts.
            </li>
            <li>
              <strong>Cultural perspective:</strong> Stoicism is a Greco-Roman philosophical tradition.
              Its framework may not perfectly capture every cultural context. We acknowledge this
              limitation and are committed to ongoing improvement.
            </li>
            <li>
              <strong>Context sensitivity:</strong> The AI scores based only on the text you provide.
              It cannot account for context you have not described.
            </li>
            <li>
              <strong>Not a substitute for professional advice:</strong> No output from this platform
              constitutes legal, medical, financial, or psychological advice.
            </li>
          </ul>
        </div>

        <div>
          <h2 className="font-display text-xl font-semibold text-sage-800 mb-3">How to challenge or dispute a score</h2>
          <p>
            If you believe a score is wrong or the AI has misunderstood your submission:
          </p>
          <ol className="list-decimal pl-6 mt-2 space-y-2 text-sage-700">
            <li>Re-submit your action with additional context that clarifies your situation or intent.</li>
            <li>Scores are tools for reflection, not permanent records &mdash; you are free to
                disagree with any output.</li>
            <li>Contact us at{' '}
              <span className="font-mono text-sage-600">support@sagereasoning.com</span>{' '}
              if you believe there is a systematic error in scoring that should be investigated.</li>
          </ol>
          {/* TODO (Phase 3): Add a formal "Dispute a score" button on individual score pages
              that allows users to flag a result for human review. */}
        </div>

        <div>
          <h2 className="font-display text-xl font-semibold text-sage-800 mb-3">Compliance with AI ethics frameworks</h2>
          <p>SageReasoning is designed to align with:</p>
          <ul className="list-disc pl-6 mt-2 space-y-1 text-sage-700">
            <li><strong>OECD AI Principles</strong> &mdash; transparency, accountability, human oversight, safety</li>
            <li><strong>Australia&rsquo;s AI6 Voluntary Standard</strong> &mdash; six essential practices for responsible AI adoption</li>
            <li><strong>National AI Centre guidance</strong> &mdash; labelling AI-generated content clearly</li>
            <li><strong>IEEE Ethically Aligned Design</strong> &mdash; human wellbeing as primary success metric</li>
          </ul>
          <p className="mt-3">
            Where EU users access the platform, we are mindful of the{' '}
            <strong>EU AI Act</strong> requirements for transparency in AI systems.
          </p>
        </div>

        <div>
          <h2 className="font-display text-xl font-semibold text-sage-800 mb-3">Human oversight</h2>
          <p>
            A human (Clinton Aitkenhead, founder of SageReasoning) is responsible for the
            Stoic Brain data, the scoring prompts, and the overall quality of this platform.
            AI is a tool we use &mdash; not an autonomous decision-maker.
          </p>
          <p className="mt-3">
            If you have concerns about any AI-generated output, you can always contact a human
            at <span className="font-mono text-sage-600">support@sagereasoning.com</span>.
          </p>
        </div>

        <div>
          <h2 className="font-display text-xl font-semibold text-sage-800 mb-3">Your data and AI processing</h2>
          <p>
            See our <a href="/privacy" className="text-sage-600 underline hover:text-sage-800">Privacy Policy</a>{' '}
            for full details of how your data is handled during AI processing, including cross-border
            transfers to Anthropic&rsquo;s US servers.
          </p>
        </div>

      </section>

      <div className="mt-12 pt-6 border-t border-sage-200 text-center">
        <p className="text-sage-600 text-sm italic">
          &ldquo;The first step is to know what you do not know.&rdquo; &mdash; Socrates (as recorded by the Stoics)
        </p>
      </div>
    </div>
  )
}
