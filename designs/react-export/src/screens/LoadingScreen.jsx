import mascotWalk from '../assets/mascot-walk.png';
import mascotStatic from '../assets/mascot-static.png';

export default function LoadingScreen() {
  return (
    <div className="screen" style={{ background: 'var(--color-bg-lavender)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '0 40px' }}>
      <div style={{ position: 'relative', width: 150, height: 110, marginBottom: 24, animation: 'mascotBob 1.1s ease-in-out infinite' }}>
        <img src={mascotWalk} alt="" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'contain', animation: 'mascotFade 1.1s steps(1) infinite' }} />
        <img src={mascotStatic} alt="" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'contain', animation: 'mascotFade 1.1s steps(1) infinite reverse' }} />
      </div>
      <div style={{ fontSize: 17, fontWeight: 500, color: 'var(--color-ink)', textAlign: 'center' }}>one moment, fetching information</div>
    </div>
  );
}
