import SupportFooter from '@/components/SupportFooter'

export default function OikeiosisLayout({
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
