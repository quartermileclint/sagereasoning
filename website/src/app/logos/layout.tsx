import SupportFooter from '@/components/SupportFooter'

export default function LogosLayout({
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
