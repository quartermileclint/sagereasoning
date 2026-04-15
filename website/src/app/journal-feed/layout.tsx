import SupportFooter from '@/components/SupportFooter'

export default function JournalFeedLayout({
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
