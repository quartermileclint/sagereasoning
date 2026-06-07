/**
 * /accessibility — Accessibility statement page
 *
 * Build item A18d (staging plan §A18): "Accessibility statement page (A2)."
 * Cross-cuts A3 (cognitive-accessibility design pass — future work).
 *
 * Honest positioning per R19 (Honest Positioning): we state the standard we
 * aim for (WCAG 2.1 AA), the measures in place, and our known limitations as a
 * pre-launch sole-founder startup. We do not claim full compliance or an
 * independent audit we have not had.
 */

import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Accessibility — SageReasoning',
  description:
    'How SageReasoning approaches accessibility, the standard we aim for, our known limitations, and how to report an accessibility problem.',
}

export default function AccessibilityPage() {
  return (
    <div className="max-w-3xl mx-auto px-6 py-16 font-body text-sage-800">

      <div className="mb-10">
        <h1 className="font-display text-3xl font-medium text-sage-900 mb-2">
          Accessibility Statement
        </h1>
        <p className="text-sage-600 text-sm italic">Last updated: June 2026</p>
        <p className="mt-4 text-sage-700 leading-relaxed">
          SageReasoning is for anyone willing to examine their own reasoning. That
          includes people who use screen readers, keyboard navigation, magnification,
          captions, or other assistive technology. This page sets out the standard we
          aim for, what we have done so far, and &mdash; in keeping with our commitment
          to honest positioning &mdash; where we currently fall short.
        </p>
      </div>

      <section className="space-y-8 leading-relaxed">

        <div>
          <h2 className="font-display text-xl font-semibold text-sage-800 mb-3">
            The standard we aim for
          </h2>
          <p>
            We aim to meet the{' '}
            <a
              href="https://www.w3.org/WAI/WCAG21/quickref/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-sage-600 underline hover:text-sage-800"
            >
              Web Content Accessibility Guidelines (WCAG) 2.1 at Level AA
            </a>
            . WCAG 2.1 AA is the standard most widely referenced in accessibility law
            around the world. We treat it as a target we are working towards, not a
            certification we have already earned.
          </p>
        </div>

        <div>
          <h2 className="font-display text-xl font-semibold text-sage-800 mb-3">
            What we have done
          </h2>
          <p>
            Across the site we have aimed to: use semantic HTML so structure is clear to
            assistive technology; keep text and background colours at a readable
            contrast; allow the page to be navigated and operated with a keyboard alone;
            allow text to be resized in the browser without breaking the layout; provide
            text alternatives for meaningful images and icons; and label interactive
            controls so a screen reader can announce them. A persistent support-resources
            footer (emergency and crisis contacts) is present on the pages where you can
            interact with the mentor or journal, and is announced to assistive technology.
          </p>
        </div>

        <div>
          <h2 className="font-display text-xl font-semibold text-sage-800 mb-3">
            Where we currently fall short
          </h2>
          <p>
            We are a pre-launch startup run by a single founder, and we have not yet had
            an independent accessibility audit. We expect there are gaps &mdash;
            particularly on the more interactive and immersive surfaces (such as the
            mentor and dashboard) and in some of our reasoning output, which is generated
            by an AI model and can vary in clarity. We would rather tell you this plainly
            than imply a level of accessibility we have not verified. For the wider set of
            things this tool cannot yet do, see our{' '}
            <a href="/limitations" className="text-sage-600 underline hover:text-sage-800">
              limitations page
            </a>
            .
          </p>
        </div>

        <div>
          <h2 className="font-display text-xl font-semibold text-sage-800 mb-3">
            Plain language and cognitive accessibility
          </h2>
          <p>
            SageReasoning draws on ancient philosophy, which can carry unfamiliar terms.
            We are working to keep our explanations in plain language and to define
            specialist words (such as the Greek terms from Stoic practice) where we use
            them, so that understanding the tool does not depend on prior philosophical
            training. This is ongoing work, and feedback on anything you found confusing
            is genuinely useful to us.
          </p>
        </div>

        <div>
          <h2 className="font-display text-xl font-semibold text-sage-800 mb-3">
            Compatibility
          </h2>
          <p>
            The site is built to work with current versions of major browsers (Chrome,
            Firefox, Safari, and Edge) and the assistive technologies that run with them.
            If you are using an older browser or a less common assistive technology and
            something does not work, please tell us &mdash; we cannot test every
            combination ourselves, and your report helps us find the gaps.
          </p>
        </div>

        <div>
          <h2 className="font-display text-xl font-semibold text-sage-800 mb-3">
            Tell us about an accessibility problem
          </h2>
          <p>
            If you run into a barrier on SageReasoning &mdash; something you could not
            read, reach, or operate &mdash; please email us at{' '}
            <a
              href="mailto:support@sagereasoning.com"
              className="text-sage-600 underline hover:text-sage-800"
            >
              support@sagereasoning.com
            </a>
            . Tell us what page you were on, what you were trying to do, and what got in
            the way. We read every message and will do our best to respond and to fix
            what we can.
          </p>
        </div>

        <div className="mt-10 pt-8 border-t border-sage-200">
          <p className="text-sage-600 text-sm">
            Accessibility is not a feature we finish; it is a practice we keep returning
            to. We would rather state our limits honestly and improve from there than
            claim a standard we have not met. If something here is wrong, or out of date,
            tell us and we will put it right.
          </p>
        </div>

      </section>
    </div>
  )
}
