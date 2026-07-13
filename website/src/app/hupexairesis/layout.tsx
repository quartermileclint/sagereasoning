import SupportFooter from '@/components/SupportFooter'

export default function HupexairesisLayout({
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
