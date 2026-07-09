import { useState } from 'react';
import Mascot from './Mascot.jsx';

export default function Header({ onNewCheck, onHistory, onPersonalise }) {
  const [open, setOpen] = useState(false);
  const close = () => setOpen(false);

  const pick = (fn) => () => {
    close();
    fn();
  };

  return (
    <header className="header">
      <div className="logo-lockup">
        <Mascot width={46} />
        <span className="wordmark">ZoeCheck</span>
      </div>

      <div className="menu-wrap">
        <button
          className="hamburger"
          aria-label="Menu"
          aria-expanded={open}
          onClick={() => setOpen((v) => !v)}
        >
          ☰
        </button>
        {open && (
          <>
            <div className="menu-overlay" onClick={close} />
            <div className="menu-card" role="menu">
              <button className="menu-item" onClick={pick(onNewCheck)}>
                <span className="ico">✧</span> New check
              </button>
              <button className="menu-item" onClick={pick(onHistory)}>
                <span className="ico">🕘</span> Claims history
              </button>
              <button className="menu-item" onClick={pick(onPersonalise)}>
                <span className="ico">⚙</span> Personalisation
              </button>
            </div>
          </>
        )}
      </div>
    </header>
  );
}
