/**
 * article15-supplementary-info.ts
 *
 * Builds the GDPR Article 15(1)(a)–(h) supplementary-information block returned
 * alongside the data copy by /api/user/access (A15b). Article 15 has two parts:
 * (3) a copy of the personal data (delivered by the data-gathering helper), and
 * (1)(a)–(h) information ABOUT the processing (this block).
 *
 * The content is sourced from the live /privacy page so the two never diverge.
 * It is static — there is no per-user computation here. When the privacy policy
 * is updated, update this block in the same change.
 *
 * Honest-positioning note (R18/R19): like the /privacy page, this content is a
 * working draft aligned with the Australian Privacy Principles and GDPR, pending
 * legal review. The `disclosure_status` field states this plainly rather than
 * implying a finalised legal position.
 *
 * Rules: R17g (Article 15 access — supplementary information), R18/R19 (honest
 * positioning).
 */

export interface Article15SupplementaryInfo {
  disclosure_status: string
  /** Art 15(1)(a) */
  purposes_of_processing: string[]
  /** Art 15(1)(b) */
  categories_of_personal_data: string[]
  /** Art 15(1)(c) — recipients / categories of recipients, incl. sub-processors */
  recipients_and_sub_processors: Array<{
    name: string
    role: string
    location: string
    note: string
  }>
  /** Art 15(1)(d) */
  retention: string[]
  /** Art 15(1)(e) — existence of rights */
  your_rights: string[]
  /** Art 15(1)(f) */
  right_to_complain: string
  /** Art 15(1)(g) — source of the data */
  source_of_data: string
  /** Art 15(1)(h) — automated decision-making / profiling */
  automated_processing_and_profiling: {
    exists: boolean
    description: string
    categories_of_input: string[]
    kinds_of_output: string[]
    significance_and_consequences: string
  }
  contact: string
}

export function buildArticle15SupplementaryInfo(): Article15SupplementaryInfo {
  return {
    disclosure_status:
      'Working draft aligned with the Australian Privacy Principles (Privacy Act 1988 (Cth)) ' +
      'and GDPR Articles 15 & 20, pending legal review. Mirrors the SageReasoning Privacy Policy ' +
      '(sagereasoning.com/privacy).',

    // Art 15(1)(a)
    purposes_of_processing: [
      'Authentication and account management (account data).',
      'Generating your Stoic virtue assessments and AI-generated philosophical reflection from content you submit.',
      'Analytics, dashboard, and milestone features (usage data).',
      'The optional Community Map feature (location data — only if you provide it).',
      'Security and rate limiting (technical data such as IP address).',
    ],

    // Art 15(1)(b)
    categories_of_personal_data: [
      'Account data — email address, display name.',
      'Usage data — actions scored, pages visited, timestamps.',
      'Content you submit — action descriptions, journal entries, documents.',
      'Intimate reflective content — mentor profile, journal, passion/oikeiosis reflections (stored encrypted at rest; decrypted only for you, the subject).',
      'Location data — country/city (optional).',
      'Technical data — IP address, browser type.',
      'Derived/inferred data — reasoning-proximity assessments, passion maps, virtue profile, causal tendencies, value hierarchy (generated from your content).',
    ],

    // Art 15(1)(c)
    recipients_and_sub_processors: [
      {
        name: 'Anthropic',
        role: 'AI processing of text you submit for scoring (Claude API).',
        location: 'United States',
        note:
          "Per Anthropic's API data-usage policy, submitted text is not used for training and is not " +
          'retained beyond the immediate processing request. Cross-border transfer under APP 8 / GDPR Chapter V.',
      },
      {
        name: 'Supabase',
        role: 'Database storage of your account and reasoning data.',
        location: 'Asia-Pacific (Singapore)',
        note: 'Stores account, score history, and the encrypted intimate store.',
      },
      {
        name: 'Vercel',
        role: 'Application hosting and delivery of sagereasoning.com.',
        location: 'Global edge network',
        note: 'Processes requests in transit; does not receive a separate copy of your stored data.',
      },
    ],

    // Art 15(1)(d)
    retention: [
      'Account and score history: retained for as long as your account is active.',
      'On account deletion: personal data removed within 30 days, except where retention is required by law.',
      'Marketplace transaction records (skill acquisitions, billing): account duration plus 7 years (Australian tax record-keeping).',
      'Anonymised marketplace browsing data: up to 12 months.',
    ],

    // Art 15(1)(e)
    your_rights: [
      'Access — obtain a copy of the personal data we hold about you (this response).',
      'Rectification — correct inaccurate personal data (Article 16; correction path is being implemented — until then, contact support).',
      'Erasure — delete your account and associated personal data (available now via /api/user/delete or the Dashboard).',
      'Portability — receive your data in a machine-readable format (available now via /api/user/export or the Dashboard).',
      'Restriction and objection — restrict or object to certain processing (contact support).',
    ],

    // Art 15(1)(f)
    right_to_complain:
      'You may lodge a complaint with a supervisory authority. In Australia: the Office of the Australian ' +
      'Information Commissioner (OAIC), oaic.gov.au. In the EU/EEA: your local data protection supervisory ' +
      'authority. We ask that you contact support@sagereasoning.com first so we can try to resolve it directly.',

    // Art 15(1)(g)
    source_of_data:
      'All personal data is collected directly from you — either data you provide (account details, ' +
      'submitted content) or data generated from your use of SageReasoning (assessments, derived reflections). ' +
      'SageReasoning does not ingest your personal data from third-party sources.',

    // Art 15(1)(h)
    automated_processing_and_profiling: {
      exists: true,
      description:
        'SageReasoning uses AI to generate Stoic reasoning assessments and reflective profiles from content ' +
        'you submit. This constitutes profiling. The outputs are for your personal reflection only and are ' +
        'not used by SageReasoning to make decisions about you.',
      categories_of_input: [
        'Text you submit describing actions, decisions, or situations.',
        'Journal and reflective entries.',
      ],
      kinds_of_output: [
        'Qualitative reasoning-proximity assessments (reflexive, habitual, deliberate, principled, sage-like).',
        'Passion diagnostic results identifying specific false judgements.',
        'Unified virtue-domain engagement indicators.',
        'AI-generated philosophical reflection.',
        'Reflective profile structures: passion map, causal tendencies, value hierarchy, oikeiosis map, virtue profile.',
      ],
      significance_and_consequences:
        'These outputs are qualitative and for personal reflection only. They do not produce numeric scores, ' +
        'do not constitute formal assessments, and are not used to make decisions that produce legal or ' +
        'similarly significant effects for you. They may, however, influence how you perceive your own decisions.',
    },

    contact: 'support@sagereasoning.com',
  }
}
