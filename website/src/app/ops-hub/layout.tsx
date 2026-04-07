export default function OpsHubLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 9999, background: '#0f1117' }}>
      {children}
    </div>
  )
}
