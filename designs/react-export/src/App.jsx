import { useState, useEffect, useRef } from 'react';
import NameScreen from './screens/NameScreen.jsx';
import QuizScreen from './screens/QuizScreen.jsx';
import HearScreen from './screens/HearScreen.jsx';
import LoadingScreen from './screens/LoadingScreen.jsx';
import ProfileScreen from './screens/ProfileScreen.jsx';
import ScoreScreen from './screens/ScoreScreen.jsx';
import SuggestionsScreen from './screens/SuggestionsScreen.jsx';
import HomeScreen from './screens/HomeScreen.jsx';
import logo from './assets/mascot-logo.png';

// Screen order — onboarding is name -> quiz, then the rest of the flow.
// Everything after the quiz is a rough draft; feel free to rework the
// sequence/logic once real product behavior is wired up.
const LABELS = [
  'Onboarding — name',
  'Onboarding — quiz',
  'Hear something new',
  'Loading',
  'Profile',
  'Score',
  'Discover suggestions',
  'Home',
];

export default function App() {
  const [screen, setScreen] = useState(1);
  const timerRef = useRef(null);

  const next = () => setScreen((s) => Math.min(LABELS.length, s + 1));
  const back = () => setScreen((s) => Math.max(1, s - 1));

  // Loading screen (4) auto-advances once "fetching" finishes.
  useEffect(() => {
    if (screen === 4) {
      timerRef.current = setTimeout(() => setScreen(5), 1800);
      return () => clearTimeout(timerRef.current);
    }
  }, [screen]);

  const renderScreen = () => {
    switch (screen) {
      case 1: return <NameScreen onNext={next} />;
      case 2: return <QuizScreen onNext={next} />;
      case 3: return <HearScreen onNext={next} />;
      case 4: return <LoadingScreen />;
      case 5: return <ProfileScreen onNext={next} />;
      case 6: return <ScoreScreen onNext={next} />;
      case 7: return <SuggestionsScreen onNext={next} />;
      case 8: return <HomeScreen />;
      default: return null;
    }
  };

  return (
    <div className="app-shell">
      <div className="app-brand">
        <img src={logo} alt="Zoe" />
        <span className="app-brand-name">Zoe</span>
      </div>

      <div className="phone-frame">
        <div className="phone-screen">{renderScreen()}</div>
      </div>

      <div className="nav-controls">
        <button className="nav-btn" onClick={back} disabled={screen === 1}>←</button>
        <div className="nav-dots">
          {LABELS.map((_, i) => (
            <div key={i} className={`nav-dot${i + 1 === screen ? ' nav-dot--active' : ''}`} />
          ))}
        </div>
        <button className="nav-btn" onClick={next} disabled={screen === LABELS.length}>→</button>
      </div>
      <div className="nav-label">{screen}/{LABELS.length} — {LABELS[screen - 1]}</div>
    </div>
  );
}
