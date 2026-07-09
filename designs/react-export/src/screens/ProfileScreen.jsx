const QUESTIONS = [
  { label: 'Q1: lorem ipsum', options: [1, 2, 3] },
  { label: 'Q2: lorem ipsum', options: [1, 2, 3] },
  { label: 'Q3: lorem ipsum', options: [1, 2, 3] },
];

export default function ProfileScreen({ onNext }) {
  return (
    <div className="screen" style={{ background: 'var(--color-bg-lavender)', padding: '48px 26px 32px' }}>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: 24 }}>
        <div style={{ width: 76, height: 76, borderRadius: '50%', background: 'var(--color-coral)', marginBottom: 12 }} />
        <div style={{ fontSize: 14, color: 'var(--color-muted)' }}>User Profile</div>
      </div>
      {QUESTIONS.map((q, i) => (
        <div key={i} style={{ marginBottom: 20 }}>
          <div style={{ fontSize: 15, fontWeight: 600, color: 'var(--color-ink)', marginBottom: 10 }}>{q.label}</div>
          {q.options.map((_, j) => (
            <div key={j} style={{ background: 'var(--color-coral)', borderRadius: 10, height: 34, marginBottom: 8 }} />
          ))}
        </div>
      ))}
      <div style={{ display: 'flex', justifyContent: 'center', marginTop: 12 }}>
        <button className="primary-btn" onClick={onNext}>Save</button>
      </div>
    </div>
  );
}
