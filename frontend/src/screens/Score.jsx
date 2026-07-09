import SourceIcon from '../components/SourceIcon.jsx';

// Three-way "traffic light" — the active lane is lit in its verdict colour.
const LIGHTS = [
  { label: 'Myth', color: 'var(--myth)', tags: ['MYTH'] },
  { label: 'Needs context', color: 'var(--context)', tags: ['NEEDS CONTEXT', 'UNVERIFIED'] },
  { label: 'Backed', color: 'var(--true)', tags: ['SUPPORTED'] },
];

// The verdict view: overall truth score, a traffic-light breakdown, what the
// science says, and the sources it leaned on. "See suggestions" opens the
// deeper advice/FAQ screen with the same result.
export default function Score({ result, error, onSuggestions, onCheckAnother, onBack }) {
  const topbar = (
    <div className="topbar">
      <button className="back-btn" onClick={onBack}>‹ Home</button>
    </div>
  );

  if (error) {
    return (
      <div className="screen fade-up">
        <div className="screen-inner score-inner">
          {topbar}
          <div className="error-card">
            <strong>Something went wrong.</strong>
            <div style={{ marginTop: 6 }}>{error}</div>
          </div>
          <button className="primary-btn primary-btn--block" onClick={onCheckAnother}>
            Try again
          </button>
        </div>
      </div>
    );
  }

  if (!result || result.empty) {
    return (
      <div className="screen fade-up">
        <div className="screen-inner score-inner">
          {topbar}
          <div className="claim-quote-card" style={{ textAlign: 'center' }}>
            <h3 className="verdict-headline" style={{ margin: '4px 0 8px' }}>
              No checkable claim found
            </h3>
            <p className="advice-body" style={{ color: 'var(--muted)' }}>
              We couldn’t pin down a specific health claim to check. Try a clearer
              statement like “Spearmint tea cures PMOS”.
            </p>
          </div>
          <button className="primary-btn primary-btn--block" onClick={onCheckAnother}>
            Check another
          </button>
        </div>
      </div>
    );
  }

  const {
    claim,
    tag,
    verdict,
    verdictColor,
    truthScore,
    confidence,
    points = [],
    sources = [],
    personalNote,
  } = result;

  return (
    <div className="screen fade-up">
      <div className="screen-inner score-inner">
        {topbar}

        <div className="score-label">Truth score</div>
        <div className="score-value">{truthScore}%</div>
        <span className="verdict-pill" style={{ background: verdictColor }}>{tag}</span>
        <div className="verdict-headline" style={{ color: verdictColor }}>{verdict}</div>

        <div className="claim-quote-card">
          <div className="claim-label">The claim</div>
          <p className="claim-quote">“{claim}”</p>
        </div>

        <div className="card card--lavender breakdown-card">
          <div className="breakdown-title">
            Analysis breakdown
            <span style={{ float: 'right', fontWeight: 600, color: 'var(--muted)', fontSize: 13 }}>
              {confidence}% confidence
            </span>
          </div>
          <div className="lights">
            {LIGHTS.map((l) => {
              const on = l.tags.includes(tag);
              return (
                <div
                  key={l.label}
                  className={`light${on ? ' on' : ''}`}
                  style={on ? { background: l.color, color: '#fff' } : { color: l.color }}
                >
                  <div className="light-dot" />
                  {l.label}
                </div>
              );
            })}
          </div>
          {points.length > 0 && (
            <div className="points">
              {points.map((p, i) => (
                <div className="point" key={i}>
                  <span className="dot" />
                  <span className="txt">{p}</span>
                </div>
              ))}
            </div>
          )}
          {personalNote && (
            <div className={`personal-note${personalNote.relevance === 'caution' ? ' caution' : ''}`}>
              <span>{personalNote.relevance === 'caution' ? '⚠️' : '👤'}</span>
              <span>{personalNote.note}</span>
            </div>
          )}
        </div>

        <div className="card card--coral sources-card">
          <div className="sources-title">
            According to <span className="count">· {sources.length} sources</span>
          </div>
          {sources.length === 0 ? (
            <p className="source-note" style={{ opacity: 0.9 }}>
              No specific sources were cited for this verdict.
            </p>
          ) : (
            <div className="source-list">
              {sources.map((s, i) => {
                const Row = s.url ? 'a' : 'div';
                const props = s.url ? { href: s.url, target: '_blank', rel: 'noreferrer' } : {};
                return (
                  <Row className="source-row" key={i} {...props}>
                    <SourceIcon source={s.source} emoji={s.icon} />
                    <div className="source-main">
                      <div className="source-name">{s.name}</div>
                      <div className="source-note">{s.note}</div>
                    </div>
                    <span className="source-tag">{s.tag}</span>
                  </Row>
                );
              })}
            </div>
          )}
        </div>

        <div className="score-actions">
          <button className="secondary-btn" onClick={onCheckAnother}>Check another</button>
          <button className="primary-btn" onClick={onSuggestions}>See suggestions →</button>
        </div>
        <p className="fine-print">Paloma is an educational tool, not medical advice.</p>
      </div>
    </div>
  );
}
