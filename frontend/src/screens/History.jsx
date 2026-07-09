import { relativeDate } from '../storage.js';

// Past checks, stored per-device (localStorage). Clicking a row reopens its
// stored verdict.
export default function History({ history, onBack, onOpen, onClear }) {
  return (
    <div className="fade-up" style={{ paddingTop: 20 }}>
      <button className="back-btn" onClick={onBack}>
        ‹ Back
      </button>
      <h1 className="screen-title">Claims history</h1>
      <p className="screen-sub">Everything you've checked, saved on this device.</p>

      {history.length === 0 ? (
        <p className="empty-note">No checks yet — your fact-checks will show up here.</p>
      ) : (
        <>
          <button className="clear-link" onClick={onClear}>
            Clear history
          </button>
          <div className="history-list">
            {history.map((h) => (
              <button className="history-row" key={h.id} onClick={() => onOpen(h)}>
                <div className="history-main">
                  <div className="history-claim">{h.claim}</div>
                  <div className="history-date">{relativeDate(h.ts)}</div>
                </div>
                <span className="history-tag" style={{ background: h.color }}>
                  {h.tag}
                </span>
                <span className="history-chevron">›</span>
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
