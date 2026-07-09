const SAVED = [1, 2, 3];
const HIGHLIGHTS = [
  { label: 'Highlight 1', bg: 'var(--color-bg-lavender)', fg: 'var(--color-ink)' },
  { label: 'Highlight 1', bg: 'var(--color-coral)', fg: '#fff' },
  { label: 'Highlight 1', bg: 'var(--color-bg-lavender)', fg: 'var(--color-ink)' },
];

export default function HomeScreen() {
  return (
    <div className="screen" style={{ background: 'var(--color-bg-peach)' }}>
      <div style={{ background: 'var(--color-bg-lavender)', padding: '64px 26px 20px', display: 'flex', flexDirection: 'column', alignItems: 'center', borderRadius: '0 0 24px 24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 10 }}>
          <div style={{ width: 52, height: 52, borderRadius: '50%', background: 'var(--color-coral)', flexShrink: 0 }} />
          <div style={{ fontSize: 15, color: 'var(--color-navy)' }}>User Profile</div>
        </div>
        <span style={{ color: 'var(--color-navy)' }}>{'\u2304'}</span>
      </div>
      <div style={{ padding: '20px 26px 0' }}>
        <div className="card card--coral" style={{ marginBottom: 24 }}>
          <div style={{ fontSize: 15, fontWeight: 600, marginBottom: 12 }}>Saved History</div>
          {SAVED.map((_, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
              <div style={{ width: 26, height: 26, borderRadius: 8, background: 'var(--color-bg-lavender)', flexShrink: 0 }} />
              <div style={{ flex: 1, background: 'var(--color-bg-lavender)', borderRadius: 10, height: 26, display: 'flex', alignItems: 'center', justifyContent: 'flex-end', paddingRight: 10 }}>
                <span style={{ color: 'var(--color-muted)' }}>{'\u203a'}</span>
              </div>
            </div>
          ))}
        </div>
        <h2 style={{ fontSize: 20, fontWeight: 800, color: 'var(--color-ink)', textAlign: 'center', marginBottom: 16 }}>Article Highlights for you today</h2>
        {HIGHLIGHTS.map((h, i) => (
          <div key={i} style={{ background: h.bg, borderRadius: 18, padding: 16, height: 110, marginBottom: 14, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
            <div style={{ fontSize: 16, fontWeight: 700, color: h.fg }}>{h.label}</div>
            <div style={{ textAlign: 'center', color: h.fg }}>{'\u2304'}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
