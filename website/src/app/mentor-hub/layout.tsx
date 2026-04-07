export default function MentorHubLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 9999, background: '#0d0f18' }}>
      {children}
    </div>
  )
}
