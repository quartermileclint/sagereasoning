import SupportFooter from '@/components/SupportFooter'

export default function ViewFromAboveLayout({
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
