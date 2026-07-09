import mascot from '../assets/mascot-static.png';

export default function NameScreen({ onNext }) {
  return (
    <div
      className="screen"
      style={{
        background: 'var(--color-bg-peach)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        padding: '120px 26px 0',
        cursor: 'pointer',
      }}
      onClick={onNext}
    >
      <img src={mascot} alt="" style={{ width: 150, marginBottom: 20 }} />
      <h1 style={{ fontSize: 26, fontWeight: 800, color: 'var(--color-ink)', textAlign: 'center', lineHeight: 1.25, margin: '0 0 24px' }}>
        Let's get to know each other
      </h1>
      <input
        className="field"
        placeholder="What's your name?"
        onClick={(e) => e.stopPropagation()}
      />
    </div>
  );
}
