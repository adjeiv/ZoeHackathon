import { useState } from 'react';
import Name from './screens/Name.jsx';
import Quiz from './screens/Quiz.jsx';
import Home from './screens/Home.jsx';
import Input from './screens/Input.jsx';
import Loading from './screens/Loading.jsx';
import Score from './screens/Score.jsx';
import Suggestions from './screens/Suggestions.jsx';
import Profile from './screens/Profile.jsx';
import History from './screens/History.jsx';
import { checkClaim } from './api.js';
import {
  loadPerson,
  savePerson,
  loadHistory,
  addHistory,
  clearHistory,
  loadOnboarded,
  saveOnboarded,
} from './storage.js';

// Screen state machine. First launch runs onboarding (name → quiz); returning
// users land on the Home dashboard. From there: Input → Loading → Score →
// Suggestions, plus Profile and History.
export default function App() {
  const [onboarded] = useState(loadOnboarded);
  const [screen, setScreen] = useState(onboarded ? 'home' : 'name');
  const [person, setPerson] = useState(loadPerson);
  const [history, setHistory] = useState(loadHistory);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const goHome = () => {
    setError(null);
    setScreen('home');
  };

  // Onboarding ------------------------------------------------------------
  const handleName = (name) => {
    const next = { ...person, name };
    setPerson(next);
    savePerson(next);
    setScreen('quiz');
  };

  const handleQuiz = (patch) => {
    const next = { ...person, ...patch };
    setPerson(next);
    savePerson(next);
    saveOnboarded(true);
    setScreen('home');
  };

  // Check flow ------------------------------------------------------------
  const startCheck = () => {
    setResult(null);
    setError(null);
    setScreen('input');
  };

  const runCheck = async (input) => {
    setError(null);
    setResult(null);
    setScreen('loading');
    try {
      const data = await checkClaim(input, person);
      setResult(data);
      if (!data.empty) setHistory(addHistory(data));
      setScreen('score');
    } catch (e) {
      setError(e.message || 'Something went wrong.');
      setScreen('score');
    }
  };

  const openHistoryItem = (entry) => {
    setError(null);
    setResult(entry.result);
    setScreen('score');
  };

  // Profile / history -----------------------------------------------------
  const saveProfile = (next) => {
    setPerson(next);
    savePerson(next);
    setScreen('home');
  };

  const handleClearHistory = () => setHistory(clearHistory());

  return (
    <>
      {screen === 'name' && <Name initial={person.name} onNext={handleName} />}
      {screen === 'quiz' && (
        <Quiz name={person.name} initial={person} onSave={handleQuiz} />
      )}
      {screen === 'home' && (
        <Home
          person={person}
          history={history}
          onStartCheck={startCheck}
          onOpenHistoryItem={openHistoryItem}
          onViewHistory={() => setScreen('history')}
          onEditProfile={() => setScreen('profile')}
        />
      )}
      {screen === 'input' && <Input onCheck={runCheck} onBack={goHome} />}
      {screen === 'loading' && <Loading />}
      {screen === 'score' && (
        <Score
          result={result}
          error={error}
          onSuggestions={() => setScreen('suggestions')}
          onCheckAnother={startCheck}
          onBack={goHome}
        />
      )}
      {screen === 'suggestions' && (
        <Suggestions result={result} onBack={() => setScreen('score')} onDone={goHome} />
      )}
      {screen === 'profile' && (
        <Profile person={person} onBack={goHome} onSave={saveProfile} />
      )}
      {screen === 'history' && (
        <History
          history={history}
          onBack={goHome}
          onOpen={openHistoryItem}
          onClear={handleClearHistory}
        />
      )}
    </>
  );
}
