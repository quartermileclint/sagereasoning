import SupportFooter from '@/components/SupportFooter'

export default function MorningPreparationLayout({
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
