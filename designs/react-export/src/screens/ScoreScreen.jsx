const SOURCES = [1, 2, 3];

export default function ScoreScreen({ onNext }) {
  return (
    <div className="screen" style={{ background: 'var(--color-bg-peach)', padding: '44px 26px 32px', textAlign: 'center' }}>
      <div style={{ fontSize: 22, fontWeight: 800, color: 'var(--color-ink)', marginBottom: 6 }}>Overall Score</div>
      <div style={{ fontSize: 56, fontWeight: 800, color: 'var(--color-ink)', marginBottom: 20 }}>80%</div>
      <div className="card card--lavender" style={{ textAlign: 'left', marginBottom: 16 }}>
        <div style={{ fontSize: 15, fontWeight: 600, color: 'var(--color-ink)' }}>Analysis Breakdown</div>
        <div style={{ fontSize: 15, fontStyle: 'italic', color: 'var(--color-muted)' }}>the traffic light box</div>
      </div>
      <div className="card card--coral" style={{ textAlign: 'left', marginBottom: 24 }}>
        <div style={{ fontSize: 15, fontWeight: 600, marginBottom: 12 }}>According to</div>
        {SOURCES.map((_, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
            <div style={{ width: 26, height: 26, borderRadius: 8, background: 'var(--color-bg-lavender)', flexShrink: 0 }} />
            <div style={{ flex: 1, background: 'var(--color-bg-lavender)', borderRadius: 10, height: 26, display: 'flex', alignItems: 'center', justifyContent: 'flex-end', paddingRight: 10 }}>
              <span style={{ color: 'var(--color-muted)' }}>{'\u203a'}</span>
            </div>
          </div>
        ))}
      </div>
      <div style={{ fontSize: 22, fontWeight: 800, color: 'var(--color-ink)', marginBottom: 20 }}>Discover Our Suggestions</div>
      <div style={{ display: 'flex', justifyContent: 'center' }}>
        <button className="primary-btn" onClick={onNext}>Let's Go</button>
      </div>
    </div>
  );
}
