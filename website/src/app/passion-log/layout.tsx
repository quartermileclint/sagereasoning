import SupportFooter from '@/components/SupportFooter'

export default function PassionLogLayout({
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
