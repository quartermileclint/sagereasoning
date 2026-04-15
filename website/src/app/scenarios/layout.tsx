import SupportFooter from '@/components/SupportFooter'

export default function ScenariosLayout({
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
