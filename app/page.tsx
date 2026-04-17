import KanbanBoard from '@/components/KanbanBoard';

// Server Component — renders the static shell
export default function Home() {
  return (
    <main style={{ minHeight: '100vh', padding: '2rem 1.5rem', position: 'relative', zIndex: 1 }}>
      {/* Header */}
      <header style={{ maxWidth: '1240px', margin: '0 auto 2.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '6px' }}>
          <div
            style={{
              width: 38,
              height: 38,
              borderRadius: '10px',
              background: 'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '18px',
              flexShrink: 0,
              boxShadow: '0 0 20px rgba(59,130,246,0.35)',
            }}
          >
            📋
          </div>
          <h1
            style={{
              fontFamily: "'Outfit', sans-serif",
              fontWeight: 800,
              fontSize: 'clamp(1.4rem, 3vw, 2rem)',
              letterSpacing: '-0.04em',
              color: '#dde6f5',
              background: 'linear-gradient(90deg, #dde6f5 0%, #8da4c8 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}
          >
            Kanban Board
          </h1>
        </div>
        <p style={{ color: '#4e6280', fontSize: '0.875rem', paddingLeft: '50px' }}>
          Drag cards between columns · High-priority tasks always surface first
        </p>
      </header>

      {/* Interactive board — Client Component */}
      <KanbanBoard />
    </main>
  );
}
