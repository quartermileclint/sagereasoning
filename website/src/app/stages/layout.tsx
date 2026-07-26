import SupportFooter from '@/components/SupportFooter'

export default function StagesLayout({
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
