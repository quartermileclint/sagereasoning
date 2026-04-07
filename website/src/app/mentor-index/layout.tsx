export default function MentorIndexLayout({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 9999, background: '#0f1117', overflow: 'auto' }}>
      {children}
    </div>
  )
}
