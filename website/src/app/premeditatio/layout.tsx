import SupportFooter from '@/components/SupportFooter'

export default function PremeditatioLayout({
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
