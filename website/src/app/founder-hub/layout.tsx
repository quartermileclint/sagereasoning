import SupportFooter from '@/components/SupportFooter'

export default function FounderHubLayout({
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
