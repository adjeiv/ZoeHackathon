import { useEffect, useState } from 'react';
import LoadingMascot from '../components/LoadingMascot.jsx';

const STATUS = [
  'One moment, fetching information…',
  'Isolating the exact claim…',
  'Searching trusted research…',
  'Weighing the evidence…',
];

// Loading state — the real backend request drives completion (App switches to
// Score when it resolves). Here we cycle a status line and creep a progress bar
// so the wait has honest feedback.
export default function Loading() {
  const [status, setStatus] = useState(STATUS[0]);
  const [progress, setProgress] = useState(8);

  useEffect(() => {
    let i = 0;
    const s = setInterval(() => {
      i = (i + 1) % STATUS.length;
      setStatus(STATUS[i]);
    }, 900);
    const p = setInterval(() => setProgress((v) => v + (94 - v) * 0.12), 400);
    return () => {
      clearInterval(s);
      clearInterval(p);
    };
  }, []);

  return (
    <div className="screen screen--lavender loading-screen">
      <div className="loading-inner">
        <LoadingMascot />
        <div className="loading-text">{status}</div>
        <div className="loading-track">
          <div className="loading-fill" style={{ width: `${Math.min(progress, 94)}%` }} />
        </div>
      </div>
    </div>
  );
}
