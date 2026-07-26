import SupportFooter from '@/components/SupportFooter'

export default function GlossaryLayout({
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
