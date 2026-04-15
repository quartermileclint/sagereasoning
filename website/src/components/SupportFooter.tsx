/**
 * SupportFooter
 *
 * Persistent support-resources footer mandated by R20a §4 (Vulnerable User
 * Protections). Appears on pages where a user can interact with the mentor
 * or journal. Presentation is muted: small type, neutral colour, below the
 * main content. Non-dismissible by design — the goal is a visible exit
 * without changing the register of the product.
 *
 * This component is intentionally stateless:
 *   - no session logic
 *   - no user-state detection
 *   - no database reads or writes
 *   - no props from parent
 *
 * Contacts are fixed per R20a §4. Any change follows the R20a change-control
 * process for Australian resource updates (logged to the audit trail).
 */
export default function SupportFooter() {
  return (
    <div
      role="complementary"
      aria-label="Support resources"
      className="w-full border-t border-sage-200 bg-sage-50/80 backdrop-blur-sm"
      style={{
        // Keeps the footer readable on dark immersive pages
        // (e.g. mentor-hub, private-mentor) while staying muted on light pages.
        position: 'relative',
        zIndex: 10000,
      }}
    >
      <div className="max-w-6xl mx-auto px-4 py-2 text-xs text-sage-600 font-body">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-center gap-1 sm:gap-4 text-center">
          <span className="sr-only">If you need urgent support:</span>
          <span>
            <a
              href="tel:000"
              className="underline decoration-sage-300 hover:text-sage-900 hover:decoration-sage-600"
            >
              000
            </a>{' '}
            — emergency services
          </span>
          <span aria-hidden="true" className="hidden sm:inline text-sage-400">
            ·
          </span>
          <span>
            <a
              href="tel:131114"
              className="underline decoration-sage-300 hover:text-sage-900 hover:decoration-sage-600"
            >
              Lifeline 13 11 14
            </a>{' '}
            — 24/7 crisis support
          </span>
          <span aria-hidden="true" className="hidden sm:inline text-sage-400">
            ·
          </span>
          <span>
            <a
              href="https://www.lifeline.org.au"
              target="_blank"
              rel="noopener noreferrer"
              className="underline decoration-sage-300 hover:text-sage-900 hover:decoration-sage-600"
            >
              lifeline.org.au
            </a>{' '}
            — web chat and resources
          </span>
        </div>
      </div>
    </div>
  )
}
