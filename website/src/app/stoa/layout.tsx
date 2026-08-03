import SupportFooter from '@/components/SupportFooter'

export default function StoaLayout({
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
