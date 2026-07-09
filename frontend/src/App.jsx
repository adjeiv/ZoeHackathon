import { useState } from 'react';
import Header from './components/Header.jsx';
import Home from './screens/Home.jsx';
import Processing from './screens/Processing.jsx';
import Results from './screens/Results.jsx';
import History from './screens/History.jsx';
import Personalise from './screens/Personalise.jsx';
import { checkClaim } from './api.js';
import { loadPerson, savePerson, loadHistory, addHistory, clearHistory } from './storage.js';

export default function App() {
  const [screen, setScreen] = useState('home');
  const [person, setPerson] = useState(loadPerson);
  const [history, setHistory] = useState(loadHistory);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const goHome = () => setScreen('home');

  const newCheck = () => {
    setResult(null);
    setError(null);
    setScreen('home');
  };

  // Home → Processing → Results, driven by the real backend request.
  const runCheck = async (input) => {
    setError(null);
    setResult(null);
    setScreen('processing');
    try {
      const data = await checkClaim(input, person);
      setResult(data);
      if (!data.empty) setHistory(addHistory(data));
      setScreen('results');
    } catch (e) {
      setError(e.message || 'Something went wrong.');
      setScreen('results');
    }
  };

  const openHistoryItem = (entry) => {
    setError(null);
    setResult(entry.result);
    setScreen('results');
  };

  const handleClearHistory = () => setHistory(clearHistory());

  const handleSavePerson = (next) => {
    setPerson(next);
    savePerson(next);
    setScreen('home');
  };

  return (
    <div className="page">
      <div className="column">
        <Header
          onNewCheck={newCheck}
          onHistory={() => setScreen('history')}
          onPersonalise={() => setScreen('personalise')}
        />

        {screen === 'home' && <Home onCheck={runCheck} />}
        {screen === 'processing' && <Processing />}
        {screen === 'results' && (
          <Results result={result} error={error} onCheckAnother={newCheck} />
        )}
        {screen === 'history' && (
          <History
            history={history}
            onBack={goHome}
            onOpen={openHistoryItem}
            onClear={handleClearHistory}
          />
        )}
        {screen === 'personalise' && (
          <Personalise person={person} onBack={goHome} onSave={handleSavePerson} />
        )}
      </div>
    </div>
  );
}
