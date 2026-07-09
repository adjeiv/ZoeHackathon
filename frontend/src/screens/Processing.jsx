import { useEffect, useState } from 'react';
import LoadingMascot from '../components/LoadingMascot.jsx';

const STATUS = [
  'Transcribing what you shared…',
  'Isolating the exact claim…',
  'Searching peer-reviewed research…',
  'Weighing the evidence…',
];

// Loading state. The real backend request drives completion (App switches to
// Results when it resolves); here we cycle the status line and creep a progress
// bar forward so the wait has honest feedback.
export default function Processing() {
  const [status, setStatus] = useState(STATUS[0]);
  const [progress, setProgress] = useState(6);

  useEffect(() => {
    let i = 0;
    const s = setInterval(() => {
      i = (i + 1) % STATUS.length;
      setStatus(STATUS[i]);
    }, 820);
    // Ease toward ~92% while waiting; App unmounts us on completion.
    const p = setInterval(() => setProgress((v) => v + (94 - v) * 0.12), 400);
    return () => {
      clearInterval(s);
      clearInterval(p);
    };
  }, []);

  return (
    <div className="processing">
      <div className="mascot-wrap">
        <LoadingMascot />
      </div>
      <h2>On the case…</h2>
      <p className="status">{status}</p>
      <div className="progress-track">
        <div className="progress-fill" style={{ width: `${Math.min(progress, 94)}%` }} />
      </div>
    </div>
  );
}
