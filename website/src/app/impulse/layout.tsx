import SupportFooter from '@/components/SupportFooter'

export default function ImpulseLayout({
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
