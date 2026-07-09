import mascot from '../assets/mascot-static.png';

export default function HearScreen({ onNext }) {
  return (
    <div
      className="screen"
      style={{ background: 'var(--color-bg-peach)', display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '64px 26px 0', cursor: 'pointer' }}
      onClick={onNext}
    >
      <h1 style={{ fontSize: 26, fontWeight: 800, color: 'var(--color-ink)', textAlign: 'center', lineHeight: 1.25, margin: '0 0 18px' }}>
        Great!<br />Hear something new today?
      </h1>
      <img src={mascot} alt="" style={{ width: 110, marginBottom: 22 }} />
      <div style={{ width: '100%', display: 'flex', alignItems: 'center', background: 'var(--color-bg-lavender)', borderRadius: 16, padding: '14px 16px', marginBottom: 16 }}>
        <div style={{ flex: 1, color: '#8b7fae', fontSize: 15 }}>Paste it here or hold to record</div>
        <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'var(--color-navy)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          <div style={{ width: 10, height: 14, borderRadius: 6, background: '#fff' }} />
        </div>
      </div>
      <div style={{ fontSize: 13, fontWeight: 800, color: 'var(--color-magenta)', letterSpacing: '0.08em', marginBottom: 16 }}>OR</div>
      <div style={{ width: '100%', background: 'var(--color-bg-lavender)', borderRadius: 16, padding: '14px 16px', color: '#8b7fae', fontSize: 15 }}>Upload</div>
    </div>
  );
}
