import SupportFooter from '@/components/SupportFooter'

/**
 * R20a §4 crisis-resource strip, matching every sibling practice page
 * (/morning, /passion-log, /view-from-above, /sage-compass).
 *
 * It matters more here than on most: the evening review asks a practitioner to
 * write about a hard day, at night, alone. The route-level distress check in
 * /api/reflect is the enforced floor; this is the always-visible exit that does
 * not depend on anything being detected.
 */
export default function EveningReviewLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <>
      {children}
      <SupportFooter />
    </>
  )
}
