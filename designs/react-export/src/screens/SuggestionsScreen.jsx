const FAQS = ['lorem ipsum?', 'lorem ipsum?', 'lorem ipsum?'];

export default function SuggestionsScreen({ onNext }) {
  return (
    <div className="screen" style={{ background: 'var(--color-bg-peach)', padding: '48px 26px 32px', cursor: 'pointer' }} onClick={onNext}>
      <h1 style={{ fontSize: 24, fontWeight: 800, color: 'var(--color-ink)', textAlign: 'center', marginBottom: 24 }}>Discover Our Suggestions</h1>
      <div className="card card--coral" style={{ height: 130, marginBottom: 16 }}>
        <div style={{ fontSize: 16, fontWeight: 600 }}>Sources to look at:</div>
      </div>
      <div className="card card--lavender" style={{ height: 130, marginBottom: 24 }}>
        <div style={{ fontSize: 16, fontWeight: 600, color: 'var(--color-ink)' }}>Advice Summary</div>
      </div>
      <h2 style={{ fontSize: 20, fontWeight: 800, color: 'var(--color-ink)', textAlign: 'center', marginBottom: 16 }}>FAQs about PMOS</h2>
      {FAQS.map((faq, i) => (
        <div key={i} style={{ background: 'var(--color-coral)', borderRadius: 20, padding: 14, textAlign: 'center', color: '#fff', fontSize: 15, marginBottom: 12 }}>{faq}</div>
      ))}
    </div>
  );
}
