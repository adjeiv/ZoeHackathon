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
        <h1 className="name-title">Let's get to know each other</h1>
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
