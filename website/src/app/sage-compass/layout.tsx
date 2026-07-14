import SupportFooter from '@/components/SupportFooter'

export default function SageCompassLayout({
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
