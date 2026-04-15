import SupportFooter from '@/components/SupportFooter'

export default function JournalLayout({
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
