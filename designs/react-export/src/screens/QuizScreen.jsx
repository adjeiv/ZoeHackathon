const QUESTIONS = [
  { label: 'Q1: lorem ipsum', options: [1, 2, 3] },
  { label: 'Q2: lorem ipsum', options: [1, 2, 3] },
  { label: 'Q3: lorem ipsum', options: [1, 2, 3] },
];

export default function QuizScreen({ onNext }) {
  return (
    <div className="screen" style={{ background: 'var(--color-bg-peach)', padding: '56px 26px 32px' }}>
      <h1 style={{ fontSize: 23, fontWeight: 800, color: 'var(--color-ink)', textAlign: 'center', lineHeight: 1.25, margin: '0 0 26px' }}>
        Take a quick quiz to know your body and PMOS
      </h1>
      {QUESTIONS.map((q, i) => (
        <div key={i} className="card card--lavender" style={{ marginBottom: 16 }}>
          <div style={{ fontSize: 15, fontWeight: 600, color: 'var(--color-ink)', marginBottom: 12 }}>{q.label}</div>
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
