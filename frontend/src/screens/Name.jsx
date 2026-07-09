import { useState } from 'react';
import Mascot from '../components/Mascot.jsx';

// Onboarding step 1 — capture the user's first name so the rest of the app can
// greet them. Enter or the button advances to the quiz.
export default function Name({ initial = '', onNext }) {
  const [name, setName] = useState(initial);

  const submit = () => onNext(name.trim());

  return (
    <div className="screen name-screen fade-up">
      <div className="screen-inner name-inner" style={{ maxWidth: 420 }}>
        <Mascot className="name-mascot" width={158} />
        <h1 className="name-title">
          <span style={{ color: 'var(--coral)' }}>Stop</span> scrolling,
          <br />
          <span style={{ color: 'var(--true)' }}>start</span> checking.
        </h1>
        <p className="name-intro">
          Hey, I’m Paloma, your PMOS assistant. I’m here to help you stay
          well-informed about your PMOS as you navigate information from others
          or online.
        </p>
        <input
          className="field"
          placeholder="What's your name?"
          value={name}
          autoFocus
          onChange={(e) => setName(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && submit()}
        />
        <div className="name-actions">
          <button className="primary-btn" onClick={submit}>
            Continue →
          </button>
        </div>
      </div>
    </div>
  );
}
