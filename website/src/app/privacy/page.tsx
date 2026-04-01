import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Privacy Policy — SageReasoning',
  description: 'Privacy Policy for SageReasoning.com — how we collect, use, and protect your personal information.',
}

export default function PrivacyPage() {
  return (
    <div className="max-w-3xl mx-auto px-6 py-16 font-body text-sage-800">
      {/* ── LEGAL REVIEW PLACEHOLDER ─────────────────────────────────────────── */}
      {/* TODO (Priority 9 — Phase 1): Draft only. Have an Australian privacy lawyer
          review before December 2026 to ensure compliance with the amended Privacy Act
          (automated decision-making transparency requirements, APP 1.7).
          Also update to reflect final data retention periods agreed with Supabase/Anthropic. */}
      {/* ─────────────────────────────────────────────────────────────────────── */}

      <div className="mb-10">
        <h1 className="font-display text-3xl font-medium text-sage-900 mb-2">Privacy Policy</h1>
        <p className="text-sage-600 text-sm italic">
          Last updated: March 2026 &mdash; Draft pending legal review
        </p>
        <div className="mt-4 px-4 py-3 bg-amber-50 border border-amber-200 rounded text-amber-800 text-sm">
          <strong>Draft notice:</strong> This policy is a working draft aligned with the Australian Privacy
          Principles (APPs) under the Privacy Act 1988 (Cth). It is being reviewed before it takes
          full legal effect.
        </div>
      </div>

      <section className="space-y-8 leading-relaxed">

        <div>
          <h2 className="font-display text-xl font-semibold text-sage-800 mb-3">1. Who We Are</h2>
          <p>
            SageReasoning (&ldquo;we&rdquo;, &ldquo;us&rdquo;, &ldquo;our&rdquo;) operates sagereasoning.com, a Stoic philosophy
            reasoning platform. We are an Australian entity and are bound by the{' '}
            <em>Privacy Act 1988</em> (Cth) and the Australian Privacy Principles (APPs).
          </p>
          {/* TODO: Update with registered company name and ABN once Pty Ltd registration complete */}
        </div>

        <div>
          <h2 className="font-display text-xl font-semibold text-sage-800 mb-3">2. Information We Collect</h2>
          <p>We collect the following categories of personal information:</p>
          <div className="mt-3 overflow-x-auto">
            <table className="w-full text-sm border-collapse">
              <thead>
                <tr className="bg-sage-100">
                  <th className="text-left px-3 py-2 border border-sage-200 font-display font-semibold">Category</th>
                  <th className="text-left px-3 py-2 border border-sage-200 font-display font-semibold">Examples</th>
                  <th className="text-left px-3 py-2 border border-sage-200 font-display font-semibold">Purpose</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="px-3 py-2 border border-sage-200">Account data</td>
                  <td className="px-3 py-2 border border-sage-200">Email address, display name</td>
                  <td className="px-3 py-2 border border-sage-200">Authentication and account management</td>
                </tr>
                <tr className="bg-sage-50">
                  <td className="px-3 py-2 border border-sage-200">Usage data</td>
                  <td className="px-3 py-2 border border-sage-200">Actions scored, pages visited, timestamps</td>
                  <td className="px-3 py-2 border border-sage-200">Analytics, dashboard, milestones</td>
                </tr>
                <tr>
                  <td className="px-3 py-2 border border-sage-200">Content you submit</td>
                  <td className="px-3 py-2 border border-sage-200">Action descriptions, journal entries, documents</td>
                  <td className="px-3 py-2 border border-sage-200">Generating your Stoic scores</td>
                </tr>
                <tr className="bg-sage-50">
                  <td className="px-3 py-2 border border-sage-200">Location data</td>
                  <td className="px-3 py-2 border border-sage-200">Country/city (optional, for community map)</td>
                  <td className="px-3 py-2 border border-sage-200">Community Map feature only</td>
                </tr>
                <tr>
                  <td className="px-3 py-2 border border-sage-200">API key data (AI agents)</td>
                  <td className="px-3 py-2 border border-sage-200">API key hash (SHA-256), agent identity, usage counts</td>
                  <td className="px-3 py-2 border border-sage-200">API authentication, rate limiting, billing</td>
                </tr>
                <tr className="bg-sage-50">
                  <td className="px-3 py-2 border border-sage-200">Technical data</td>
                  <td className="px-3 py-2 border border-sage-200">IP address, browser type</td>
                  <td className="px-3 py-2 border border-sage-200">Security, rate limiting</td>
                </tr>
              </tbody>
            </table>
          </div>
          <p className="mt-3 text-sage-600 text-sm italic">
            We do not collect sensitive information (as defined under the Privacy Act) except where
            you voluntarily include it in content you submit for scoring.
          </p>
        </div>

        <div>
          <h2 className="font-display text-xl font-semibold text-sage-800 mb-3">3. How Your Data Is Processed by AI</h2>
          <p className="font-medium text-sage-900">
            Important: when you submit text for scoring (actions, documents, journal entries, social posts),
            that text is sent to Anthropic&rsquo;s Claude AI for processing.
          </p>
          <ul className="list-disc pl-6 mt-2 space-y-1 text-sage-700">
            <li>Anthropic is a US-based company. Your text is processed on Anthropic&rsquo;s servers in the United States.</li>
            <li>Anthropic&rsquo;s API does not retain your submitted text beyond the immediate processing request (per Anthropic&rsquo;s API data usage policy).</li>
            <li>The <em>score result</em> (numbers and reasoning text) is returned to us and stored in your account history on our database.</li>
          </ul>
          <p className="mt-3 text-sage-600 text-sm">
            By submitting content for scoring, you consent to this cross-border transfer to the United States
            under APP 8 of the Privacy Act 1988.
          </p>
          {/* TODO: Confirm Anthropic's current data retention / zero-data-retention API policy
              and link to their documentation. Update this section to quote exact policy. */}
        </div>

        <div>
          <h2 className="font-display text-xl font-semibold text-sage-800 mb-3">4. Where Your Data Is Stored</h2>
          <p>
            Your account and score data is stored on <strong>Supabase</strong>, a database service
            with servers in the Asia-Pacific region (Singapore). Supabase complies with applicable
            data protection laws. By creating an account you consent to this cross-border storage.
          </p>
          {/* TODO: Confirm current Supabase data region for the sagereasoning project instance */}
        </div>

        <div>
          <h2 className="font-display text-xl font-semibold text-sage-800 mb-3">5. Automated Decision-Making</h2>
          <p>
            SageReasoning uses AI to generate Stoic virtue scores for actions, documents, and other
            content you submit. These are automated outputs that may significantly affect how you
            perceive your own decisions.
          </p>
          <p className="mt-3">
            In compliance with the amended <em>Privacy Act 1988</em> (effective December 2026), we
            disclose that our automated processes use the following categories of personal information:
            text you submit describing actions, decisions, or situations. The kinds of automated outputs
            produced include: qualitative reasoning proximity assessments (reflexive, habitual, deliberate,
            principled, sage-like), passion diagnostic results identifying specific false judgements,
            unified virtue domain engagement indicators, and AI-generated philosophical reflection.
            No numeric scores are produced.
          </p>
          <p className="mt-3">
            These outputs are for personal reflection only. They do not constitute formal assessments
            and are not used to make decisions about you by SageReasoning.
          </p>
          {/* TODO: Review and expand this section before December 2026 to comply with
              APP 1.7 automated decision-making transparency requirements. */}
        </div>

        <div>
          <h2 className="font-display text-xl font-semibold text-sage-800 mb-3">6. Marketplace Data</h2>
          <p>
            When you use the SageReasoning marketplace (via the website or agent-facing API),
            we collect the following additional data:
          </p>
          <ul className="list-disc pl-6 mt-2 space-y-1 text-sage-700">
            <li>
              <strong>Browsing patterns:</strong> Skills viewed and preview requests, collected in
              anonymised form to improve skill recommendations.
            </li>
            <li>
              <strong>Skill acquisition records:</strong> Which skills you acquire, usage frequency,
              and billing data to manage your subscription and improve the marketplace.
            </li>
            <li>
              <strong>Agent API usage:</strong> API calls from agents to marketplace endpoints are
              logged with the same data retention policy as standard API calls.
            </li>
          </ul>
        </div>

        <div>
          <h2 className="font-display text-xl font-semibold text-sage-800 mb-3">7. Sage Wrapper Data</h2>
          <p>
            When sage-wrapped skills invoke SageReasoning API endpoints (sage-guard, sage-score),
            the input context and evaluation results are processed and stored under the same data
            handling policies as direct API calls.
          </p>
          <p className="mt-3">
            SageReasoning processes only the reasoning evaluation. We do not access, store, or
            process the full output of the underlying wrapped skill.
          </p>
        </div>

        <div>
          <h2 className="font-display text-xl font-semibold text-sage-800 mb-3">8. Your Rights</h2>
          <p>Under the Australian Privacy Principles you have the right to:</p>
          <ul className="list-disc pl-6 mt-2 space-y-1 text-sage-700">
            <li><strong>Access</strong> the personal information we hold about you</li>
            <li><strong>Correct</strong> inaccurate personal information</li>
            <li><strong>Delete</strong> your account and associated personal data</li>
            <li><strong>Export</strong> your data in a machine-readable format</li>
          </ul>
          <p className="mt-3">
            {/* TODO: Implement /api/user/export and /api/user/delete endpoints (Part 6 Phase 3) */}
            To exercise these rights, use the <strong>Export my data</strong> and{' '}
            <strong>Delete my account</strong> options in your{' '}
            <a href="/dashboard" className="text-sage-600 underline hover:text-sage-800">Dashboard</a>,
            or contact us at{' '}
            <span className="font-mono text-sage-600">support@sagereasoning.com</span>.
          </p>
        </div>

        <div>
          <h2 className="font-display text-xl font-semibold text-sage-800 mb-3">9. Data Retention</h2>
          <p>
            We retain your account and score history for as long as your account is active.
            If you delete your account, your personal data will be removed within{' '}
            {/* TODO: Confirm retention period with your developer/Supabase implementation */}
            <strong>30 days</strong>, except where we are required to retain it by law.
          </p>
          <p className="mt-3">
            Marketplace transaction records (skill acquisitions, billing) are retained for the
            duration of your account plus 7 years to meet Australian tax record-keeping
            requirements. Anonymised marketplace browsing data is retained for up to 12 months.
            Sage wrapper checkpoint data (reasoning evaluations from sage-guard and sage-score
            calls) follows the same retention policy as standard API call data.
          </p>
        </div>

        <div>
          <h2 className="font-display text-xl font-semibold text-sage-800 mb-3">10. Cookies and Analytics</h2>
          <p>
            We use minimal session cookies required for authentication. We do not use third-party
            advertising cookies. Our analytics are handled internally and do not share your data
            with third-party analytics providers.
          </p>
          {/* TODO: Add cookie consent banner (Phase 3 implementation) */}
        </div>

        <div>
          <h2 className="font-display text-xl font-semibold text-sage-800 mb-3">11. Children</h2>
          <p>
            The Ethical Scenarios feature includes content appropriate for different age groups.
            If you are under 16, please obtain parental consent before creating an account.
            {/* TODO: Implement age verification gate for under-16 users (Phase 3) */}
          </p>
        </div>

        <div>
          <h2 className="font-display text-xl font-semibold text-sage-800 mb-3">12. Complaints</h2>
          <p>
            If you have a complaint about how we handle your personal information, please contact
            us first at{' '}
            <span className="font-mono text-sage-600">support@sagereasoning.com</span>.
            If we are unable to resolve your complaint, you may lodge a complaint with the{' '}
            <strong>Office of the Australian Information Commissioner (OAIC)</strong> at{' '}
            <a href="https://www.oaic.gov.au" target="_blank" rel="noopener noreferrer"
               className="text-sage-600 underline hover:text-sage-800">
              oaic.gov.au
            </a>.
          </p>
        </div>

        <div>
          <h2 className="font-display text-xl font-semibold text-sage-800 mb-3">13. Updates to This Policy</h2>
          <p>
            We will update this policy as our practices evolve and as Australian privacy law is
            amended (particularly the December 2026 changes to the Privacy Act). We will notify
            registered users of material changes by email.
          </p>
        </div>

      </section>
    </div>
  )
}
